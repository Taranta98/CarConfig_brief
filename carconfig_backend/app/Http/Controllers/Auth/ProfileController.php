<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function me() {
        return response()->json([
            'user' => request()->user(),
        ]);
    }

    public function update(UpdateProfileRequest $request) {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'message' => 'Profilo aggiornato con successo',
            'user' => $user->fresh(),
        ]);
    }

    public function updatePassword(UpdatePasswordRequest $request) {
        $user = $request->user();

        $user->update([
            'password' => Hash::make($request->validated('password')),
        ]);

        return response()->json([
            'message' => 'Password aggiornata con successo',
        ]);
    }
}
