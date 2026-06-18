<?php

namespace App\Http\Controllers;

use App\Http\Requests\OptionalRequest\StoreOptionalRequest;
use App\Http\Requests\OptionalRequest\UpdateOptionalRequest;
use App\Http\Resources\OptionalResource;
use App\Models\Optional;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OptionalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Optional::query()->orderBy('category')->orderBy('name');

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->integer('vehicle_id'));
        }

        return OptionalResource::collection($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOptionalRequest $request)
    {
        $optional = Optional::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Optional created successfully',
            'optional' => new OptionalResource($optional),
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
        $optional->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Optional updated successfully',
            'optional' => new OptionalResource($optional),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Optional $optional)
    {
        $imagePath = $optional->image;

        $optional->delete();

        if ($imagePath) {
            Storage::disk('public')->delete($imagePath);
        }

        return response()->json([
            'success' => true,
            'message' => 'Optional deleted successfully',
        ]);
    }
}
