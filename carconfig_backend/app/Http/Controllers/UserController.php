<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest\StoreUserRequest;
use App\Http\Requests\UserRequest\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;

class UserController extends Controller
{
    public function index() {
        return UserResource::collection(User::all());
    }

    public function store(StoreUserRequest $request) {
        $user = User::create($request->validated());

        return response()->json([
            'message' => 'User created successfully',
            'user' => new UserResource($user)
        ], 201);
    }

    public function show(User $user) {
        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, User $user) {

        $user->update($request->validated());
        return new UserResource($user->fresh());
    }

    public function destroy(User $user) {
        $user->delete();
        return response()->json(null, 204);
    }
}
