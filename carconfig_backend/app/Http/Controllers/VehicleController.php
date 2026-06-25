<?php

namespace App\Http\Controllers;

use App\Http\Requests\VehicleRequest\StoreVehicleRequest;
use App\Http\Requests\VehicleRequest\UpdateVehicleRequest;
use App\Http\Resources\OptionalResource;
use App\Http\Resources\TrimResource;
use App\Http\Resources\VehicleConfiguratorResource;
use App\Http\Resources\VehicleResource;
use App\Models\Vehicle;

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

    public function store(StoreVehicleRequest $request)
    {
        $data = $request->validated();

        $vehicle = Vehicle::create($data);

        return response()->json([
            'message' => 'Vehicle created successfully',
            'vehicle' => new VehicleResource($vehicle),
        ], 201);
    }

    public function show(Vehicle $vehicle)
    {
        return new VehicleResource($vehicle);
    }

    public function update(UpdateVehicleRequest $request, Vehicle $vehicle)
    {
        $vehicle->update($request->validated());

        return response()->json([
            'message' => 'Vehicle updated successfully',
            'vehicle' => new VehicleResource($vehicle->fresh()),
        ]);
    }

    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();

        return response()->json([
            'message' => 'Vehicle deleted successfully',
        ]);
    }
}
