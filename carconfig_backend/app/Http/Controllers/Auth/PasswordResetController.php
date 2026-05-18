<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class PasswordResetController extends Controller
{
    public function forgotPassword(ForgotPasswordRequest $request) {
        $data = $request->validated();
        $user = User::where('email', $data['email'])->first();

        if(!$user || !$user->hasVerifiedEmail()) {
            return response()->json([
                'success' => true,
                'message' => 'If an account with that email exists and is verified, a password reset link has been sent to your email.'
            ]);
        }
        Password::sendResetLink([
            'email' => $data['email']
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'If an account with that email exists and is verified, a password reset link has been sent to your email.'
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request) {
        $data = $request->validated();
        $user = User::where('email', $data['email'])->first();

        if(!$user || !$user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or email not verified'
            ], 400);
        }
        $status = Password::reset(
            $data,
            function(User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();

                event(new PasswordReset($user));  
            }
        );
        
        return match ($status) {
            Password::PASSWORD_RESET => response()->json([
                'success' => true,
                'message' => 'Password updated successfully'
            ]),
            default => response()->json([
                'success' => false,
                'message'=> 'Invalid token or unauthorized request'
            ])
        };
    }
}
