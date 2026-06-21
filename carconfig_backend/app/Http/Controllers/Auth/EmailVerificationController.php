<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ResendEmailVerificationRequest;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class EmailVerificationController extends Controller
{
    public function verify(Request $request) {
        $frontend_url = Config::get('app.frontend_url');

        $user = User::find($request->route('id'));

        if(!$user || !hash_equals(sha1($user->getEmailForVerification()), $request->route('hash'))) {
            $message = 'Cannot verify email';

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $message
                ]);
            }
            return $this->redirectFrontend($frontend_url, 'invalid', $message);
        }

        if(!$request->hasValidSignature()) {
            $message = 'Invalid or expired verification link';

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $message
                ]);
            }
            return $this->redirectFrontend($frontend_url, 'invalid', $message);
        }

        if($user->hasVerifiedEmail()) {
            $message = 'Email already verified';
            $payload = $this->verifiedPayload($user, $message);

            if($request->expectsJson()) {
                return response()->json($payload);
            }
            return $this->redirectFrontend($frontend_url, 'already_verified', $message);
        }

        if($user->markEmailAsVerified()) {
            event(new Verified($user));
            $payload = $this->verifiedPayload($user, 'Email verified successfully');

            if($request->expectsJson()) {
                return response()->json($payload);
            }
        }
        return $this->redirectFrontend($frontend_url, 'success', 'Email verified successfully');
    }

    public function resend(Request $request) {
        $user = $request->user();

        if($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified'
            ], 422);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'success' => true,
            'message' => 'Verification notification sent successfully.'
        ]);
    }

    public function resendByEmail(ResendEmailVerificationRequest $request)
    {
        $email = Str::lower($request->validated('email'));
        $rateLimitKey = 'resend-verification:'.$email;

        if (RateLimiter::tooManyAttempts($rateLimitKey, 1)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);

            return response()->json([
                'success' => false,
                'message' => "Attendi {$seconds} secondi prima di richiedere un nuovo link.",
            ], 429);
        }

        $user = User::where('email', $email)->first();

        if ($user && ! $user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
            RateLimiter::hit($rateLimitKey, 60);
        }

        return response()->json([
            'success' => true,
            'message' => 'Se esiste un account non verificato con questa email, ti abbiamo inviato un nuovo link di verifica.',
        ]);
    }

    private function verifiedPayload(User $user, string $message): array
    {
        return [
            'success' => true,
            'message' => $message,
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ];
    }

    private function redirectFrontend(string $base, string $status, string $message) {
        $target = rtrim($base, '/') . '/auth/register';
        $sep = str_contains($target, '?') ? '&' : '?';

        $url = url()->query("{$target}{$sep}status={$status}", ["message" => $message]);

        return redirect()->away($url);
    }
}
