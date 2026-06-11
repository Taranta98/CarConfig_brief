<?php

namespace App\Http\Controllers;

use App\Http\Requests\VehicleRequest\StoreVehicleRequest;
use App\Http\Requests\VehicleRequest\UpdateVehicleRequest;
use App\Http\Resources\OptionalResource;
use App\Http\Resources\TrimResource;
use App\Http\Resources\VehicleConfiguratorResource;
use App\Http\Resources\VehicleResource;
use App\Models\Vehicle;
use Illuminate\Support\Facades\Storage;

class VehicleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return VehicleResource::collection(Vehicle::orderBy('brand')->orderBy('model')->get());
    }

    public function trims(Vehicle $vehicle)
    {
        return TrimResource::collection(
            $vehicle->trims()->orderBy('price')->get()
        );
    }

    public function optionals(Vehicle $vehicle)
    {
        return OptionalResource::collection(
            $vehicle->optionals()->orderBy('category')->orderBy('name')->get()
        );
    }

    public function configurator(Vehicle $vehicle): VehicleConfiguratorResource
    {
        $vehicle->load([
            'colors' => fn ($query) => $query->orderBy('sort_order'),
            'colors.images',
        ]);

        return new VehicleConfiguratorResource($vehicle);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVehicleRequest $request)
    {
        $imagePath = null;

        try {
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('vehicles', 'public');
            }

            $data = $request->safe()->except('image');
            $data['image'] = $imagePath ?? $request->string('image')->toString();

            $vehicle = Vehicle::create($data);

            return response()->json([
                'message' => 'Vehicle created successfully',
                'vehicle' => new VehicleResource($vehicle),
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
    public function show(Vehicle $vehicle)
    {
        return new VehicleResource($vehicle);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVehicleRequest $request, Vehicle $vehicle)
    {
        $oldImagePath = $vehicle->image;
        $newImagePath = $oldImagePath;

        try {
            if ($request->hasFile('image')) {
                $newImagePath = $request->file('image')->store('vehicles', 'public');
            }

            $data = $request->safe()->except('image');

            if ($newImagePath) {
                $data['image'] = $newImagePath;
            } elseif ($request->filled('image')) {
                $data['image'] = $request->string('image')->toString();
            }

            $vehicle->update($data);

            if ($request->hasFile('image') && $oldImagePath && $newImagePath !== $oldImagePath) {
                Storage::disk('public')->delete($oldImagePath);
            }

            return response()->json([
                'message' => 'Vehicle updated successfully',
                'vehicle' => new VehicleResource($vehicle),
            ], 200);
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
    public function destroy(Vehicle $vehicle)
    {
        $imagePath = $vehicle->image;

        $vehicle->delete();

        if ($imagePath) {
            Storage::disk('public')->delete($imagePath);
        }

        return response()->json([
            'message' => 'Vehicle deleted successfully',
        ], 200);
    }
}
