<?php

namespace App\Http\Controllers;

use App\Http\Requests\VehicleColorRequest\StoreVehicleColorRequest;
use App\Http\Requests\VehicleColorRequest\UpdateVehicleColorRequest;
use App\Http\Resources\VehicleColorResource;
use App\Models\Vehicle;
use App\Models\VehicleColor;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class VehicleColorController extends Controller
{
    public function index(Vehicle $vehicle): JsonResponse
    {
        $colors = $vehicle->colors()
            ->with('images')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'data' => VehicleColorResource::collection($colors),
        ]);
    }

    public function store(StoreVehicleColorRequest $request, Vehicle $vehicle): JsonResponse
    {
        $color = DB::transaction(function () use ($request, $vehicle) {
            $color = $vehicle->colors()->create([
                'code' => $request->string('code')->toString(),
                'name' => $request->string('name')->toString(),
                'hex' => strtoupper($request->string('hex')->toString()),
                'sort_order' => $request->integer('sort_order', 0),
            ]);

            $this->syncImages($color, $request->input('images', []));

            return $color->load('images');
        });

        return response()->json([
            'message' => 'Colore creato con successo.',
            'data' => new VehicleColorResource($color),
        ], 201);
    }

    public function show(VehicleColor $vehicleColor): VehicleColorResource
    {
        $vehicleColor->load('images');

        return new VehicleColorResource($vehicleColor);
    }

    public function update(
        UpdateVehicleColorRequest $request,
        VehicleColor $vehicleColor
    ): JsonResponse {
        $color = DB::transaction(function () use ($request, $vehicleColor) {
            $vehicleColor->update($request->safe()->only([
                'code',
                'name',
                'hex',
                'sort_order',
            ]));

            if ($request->has('images')) {
                $this->syncImages($vehicleColor, $request->input('images', []));
            }

            return $vehicleColor->fresh(['images']);
        });

        return response()->json([
            'message' => 'Colore aggiornato con successo.',
            'data' => new VehicleColorResource($color),
        ]);
    }

    public function destroy(VehicleColor $vehicleColor): JsonResponse
    {
        $vehicleColor->delete();

        return response()->json([
            'message' => 'Colore eliminato con successo.',
        ]);
    }

    /**
     * @param  array<string, string>  $images
     */
    protected function syncImages(VehicleColor $color, array $images): void
    {
        foreach ($images as $angle => $path) {
            $color->images()->updateOrCreate(
                ['angle' => $angle],
                ['path' => $path]
            );
        }
    }
}
