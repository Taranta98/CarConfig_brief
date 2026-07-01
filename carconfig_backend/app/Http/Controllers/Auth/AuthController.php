<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
// use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();
        $user = User::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            // Auto-verify while email verification is disabled (no SMTP/domain).
            'email_verified_at' => now(),
        ]);

        // Sends verification email — re-enable when SMTP/domain is configured.
        // event(new Registered($user));

        return response()->json([
            'message' => 'Registrazione completata con successo.',
            'user' => $user,
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Credenziali non valide.',
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login effettuato con successo.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout()
    {
        Auth::user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout effettuato con successo',
        ]);
    }

    public function logoutAll()
    {
        Auth::user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout da tutti i dispositivi effettuato con successo',
        ]);
    }
}
