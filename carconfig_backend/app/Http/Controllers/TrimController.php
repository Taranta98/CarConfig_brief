<?php

namespace App\Http\Controllers;

use App\Http\Requests\TrimRequest\StoreTrimRequest;
use App\Http\Requests\TrimRequest\UpdateTrimRequest;
use App\Http\Resources\TrimResource;
use App\Models\Trim;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TrimController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Trim::query()->orderBy('price');

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->integer('vehicle_id'));
        }

        return TrimResource::collection($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTrimRequest $request)
    {
        $imagePath = null;

        try {
            if ($request->hasFile('img')) {
                $imagePath = $request->file('img')->store('trims', 'public');
            }

            $data = $request->safe()->except('img');
            $data['img'] = $imagePath ?? $request->input('img');

            $trim = Trim::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Trim created successfully',
                'trim' => new TrimResource($trim),
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
    public function show(Trim $trim)
    {
        return new TrimResource($trim);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTrimRequest $request, Trim $trim)
    {
        $oldImagePath = $trim->img;
        $newImagePath = $oldImagePath;

        try {
            if ($request->hasFile('img')) {
                $newImagePath = $request->file('img')->store('trims', 'public');
            }

            $data = $request->safe()->except('img');

            if ($request->hasFile('img')) {
                $data['img'] = $newImagePath;
            } elseif ($request->has('img')) {
                $path = $request->input('img');
                $data['img'] = is_string($path) && $path !== '' ? $path : null;
            }

            $trim->update($data);

            $shouldDeleteOldImage = $oldImagePath
                && (
                    ($request->hasFile('img') && $newImagePath !== $oldImagePath)
                    || ($request->has('img') && empty($data['img']))
                );

            if ($shouldDeleteOldImage) {
                Storage::disk('public')->delete($oldImagePath);
            }

            return response()->json([
                'success' => true,
                'message' => 'Trim updated successfully',
                'trim' => new TrimResource($trim),
            ]);
        } catch (\Throwable $th) {
            if ($request->hasFile('img') && $newImagePath && $newImagePath !== $oldImagePath) {
                Storage::disk('public')->delete($newImagePath);
            }
            throw $th;
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Trim $trim)
    {
        $imagePath = $trim->img;

        $trim->delete();

        if ($imagePath) {
            Storage::disk('public')->delete($imagePath);
        }

        return response()->json([
            'success' => true,
            'message' => 'Trim deleted successfully',
        ]);
    }
}
