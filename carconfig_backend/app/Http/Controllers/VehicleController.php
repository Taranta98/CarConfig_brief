<?php

namespace App\Http\Controllers;

use App\Http\Requests\VehicleRequest\StoreVehicleRequest;
use App\Http\Requests\VehicleRequest\UpdateVehicleRequest;
use App\Http\Resources\OptionalResource;
use App\Http\Resources\TrimResource;
use App\Http\Resources\VehicleConfiguratorResource;
use App\Http\Resources\VehicleResource;
use App\Models\Vehicle;
use App\Services\VercelBlobService;

class VehicleController extends Controller
{
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

    public function configurator(Vehicle $vehicle)
    {
        $vehicle->load([
            'colors' => fn ($query) => $query->orderBy('sort_order'),
            'colors.images',
        ]);

        return new VehicleConfiguratorResource($vehicle);
    }

    public function store(StoreVehicleRequest $request, VercelBlobService $blob)
    {
        $imageUrl = null;

        try {
            if ($request->hasFile('image')) {
                $imageUrl = $blob->uploadImage($request->file('image'), 'vehicles');
            }

            $data = $request->safe()->except('image');
            $data['image'] = $imageUrl ?? $request->string('image')->toString();

            $vehicle = Vehicle::create($data);

            return response()->json([
                'message' => 'Vehicle created successfully',
                'vehicle' => new VehicleResource($vehicle),
            ], 201);
        } catch (\Throwable $th) {
            $blob->deleteIfBlobUrl($imageUrl);
            throw $th;
        }
    }

    public function show(Vehicle $vehicle)
    {
        return new VehicleResource($vehicle);
    }

    public function update(UpdateVehicleRequest $request, Vehicle $vehicle, VercelBlobService $blob)
    {
        $oldImageUrl = $vehicle->image;
        $newImageUrl = $oldImageUrl;

        try {
            if ($request->hasFile('image')) {
                $newImageUrl = $blob->uploadImage($request->file('image'), 'vehicles');
            }

            $data = $request->safe()->except('image');

            if ($newImageUrl) {
                $data['image'] = $newImageUrl;
            } elseif ($request->filled('image')) {
                $data['image'] = $request->string('image')->toString();
            }

            $vehicle->update($data);

            if ($request->hasFile('image') && $oldImageUrl && $newImageUrl !== $oldImageUrl) {
                $blob->deleteIfBlobUrl($oldImageUrl);
            }

            return response()->json([
                'message' => 'Vehicle updated successfully',
                'vehicle' => new VehicleResource($vehicle),
            ]);
        } catch (\Throwable $th) {
            if ($request->hasFile('image') && $newImageUrl && $newImageUrl !== $oldImageUrl) {
                $blob->deleteIfBlobUrl($newImageUrl);
            }
            throw $th;
        }
    }

    public function destroy(Vehicle $vehicle, VercelBlobService $blob)
    {
        $imageUrl = $vehicle->image;

        $vehicle->delete();

        $blob->deleteIfBlobUrl($imageUrl);

        return response()->json([
            'message' => 'Vehicle deleted successfully',
        ]);
    }
}
