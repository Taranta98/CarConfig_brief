<?php

namespace App\Http\Controllers;

use App\Http\Requests\OptionalRequest\StoreOptionalRequest;
use App\Http\Requests\OptionalRequest\UpdateOptionalRequest;
use App\Http\Resources\OptionalResource;
use App\Models\Optional;
use Illuminate\Http\Request;

class OptionalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return OptionalResource::collection(Optional::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOptionalRequest $request)
    {
        $data = $request->validated();
        $optional = Optional::create($data);

        return response()->json([
            'message' => 'Optional created successfully',
            'optional' => new OptionalResource($optional)
            ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Optional $optional)
    {
        return new OptionalResource($optional);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOptionalRequest $request, Optional $optional)
    {
        $data = $request->validated();
        $optional->update($data);

        return response()->json([
            'message' => 'Optional updated successfully',
            'optional' => new OptionalResource($optional)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Optional $optional)
    {
        $optional->delete();

        return response()->json([
            'message' => 'Optional deleted successfully'
        ]);
    }
}
