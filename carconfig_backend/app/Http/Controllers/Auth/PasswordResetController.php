<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class PasswordResetController extends Controller
{
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $data = $request->validated();

        $status = Password::sendResetLink([
            'email' => $data['email'],
        ]);

        if ($status === Password::RESET_THROTTLED) {
            return response()->json([
                'success' => false,
                'message' => 'Hai già richiesto un link di recupero. Controlla la tua email o riprova tra un minuto.',
            ], 429);
        }

        return response()->json([
            'success' => true,
            'message' => 'Se esiste un account con questa email, ti abbiamo inviato un link per reimpostare la password.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $data = $request->validated();

        $status = Password::reset(
            $data,
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'success' => false,
                'message' => 'Token non valido o richiesta non autorizzata',
            ], 400);
        }

        $user = User::where('email', $data['email'])->firstOrFail();
        $user->refresh();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Password aggiornata con successo',
            'user' => $user,
            'token' => $token,
        ]);
    }
}
