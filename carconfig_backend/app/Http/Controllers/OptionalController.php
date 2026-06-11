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
        $imagePath = null;

        try {
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('optionals', 'public');
            }

            $data = $request->safe()->except('image');
            $data['image'] = $imagePath ?? $request->input('image');

            $optional = Optional::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Optional created successfully',
                'optional' => new OptionalResource($optional),
            ], 201);
        } catch (\Throwable $th) {
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }
            throw $th;
        }
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
        $oldImagePath = $optional->image;
        $newImagePath = $oldImagePath;

        try {
            if ($request->hasFile('image')) {
                $newImagePath = $request->file('image')->store('optionals', 'public');
            }

            $data = $request->safe()->except('image');

            if ($newImagePath && $request->hasFile('image')) {
                $data['image'] = $newImagePath;
            } elseif ($request->has('image')) {
                $data['image'] = $request->input('image');
            }

            $optional->update($data);

            if ($request->hasFile('image') && $oldImagePath && $newImagePath !== $oldImagePath) {
                Storage::disk('public')->delete($oldImagePath);
            }

            return response()->json([
                'success' => true,
                'message' => 'Optional updated successfully',
                'optional' => new OptionalResource($optional),
            ]);
        } catch (\Throwable $th) {
            if ($request->hasFile('image') && $newImagePath && $newImagePath !== $oldImagePath) {
                Storage::disk('public')->delete($newImagePath);
            }
            throw $th;
        }
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
