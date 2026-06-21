<?php

namespace App\Http\Controllers;

use App\Enums\VehicleViewAngle;
use App\Http\Requests\VehicleColorRequest\StoreVehicleColorRequest;
use App\Http\Requests\VehicleColorRequest\UpdateVehicleColorRequest;
use App\Http\Resources\VehicleColorResource;
use App\Models\Vehicle;
use App\Models\VehicleColor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class VehicleColorController extends Controller
{
    public function index(Vehicle $vehicle) {
        $colors = $vehicle->colors()
            ->with('images')
            ->orderBy('sort_order')
            ->get();

        return VehicleColorResource::collection($colors);
    }

    public function store(StoreVehicleColorRequest $request, Vehicle $vehicle) {
        $uploadedPaths = [];

        try {
            $color = DB::transaction(function () use ($request, $vehicle, &$uploadedPaths) {
                $color = $vehicle->colors()->create([
                    'code' => $request->string('code')->toString(),
                    'name' => $request->string('name')->toString(),
                    'hex' => strtoupper($request->string('hex')->toString()),
                    'sort_order' => $request->integer('sort_order', 0),
                ]);

                $uploadedPaths = $this->syncImages($color, $request);

                return $color->load('images');
            });

            return response()->json([
                'message' => 'Colore creato con successo.',
                'data' => new VehicleColorResource($color),
            ], 201);
        } catch (\Throwable $th) {
            foreach ($uploadedPaths as $path) {
                Storage::disk('public')->delete($path);
            }
            throw $th;
        }
    }

    public function show(VehicleColor $vehicleColor) {
        $vehicleColor->load('images');

        return new VehicleColorResource($vehicleColor);
    }

    public function update(UpdateVehicleColorRequest $request, VehicleColor $vehicleColor) {
        $uploadedPaths = [];

        try {
            $color = DB::transaction(function () use ($request, $vehicleColor, &$uploadedPaths) {
                $vehicleColor->update($request->safe()->only([
                    'code',
                    'name',
                    'hex',
                    'sort_order',
                ]));

                if ($request->has('images') || $this->hasImageFiles($request)) {
                    $uploadedPaths = $this->syncImages($vehicleColor, $request);
                }

                return $vehicleColor->fresh(['images']);
            });

            return response()->json([
                'message' => 'Colore aggiornato con successo.',
                'data' => new VehicleColorResource($color),
            ]);
        } catch (\Throwable $th) {
            foreach ($uploadedPaths as $path) {
                Storage::disk('public')->delete($path);
            }
            throw $th;
        }
    }

    public function destroy(VehicleColor $vehicleColor) {
        $vehicleColor->delete();

        return response()->json([
            'message' => 'Colore eliminato con successo.',
        ]);
    }

    /**
     * @return list<string>
     */
    protected function syncImages(VehicleColor $color, Request $request): array
    {
        $uploadedPaths = [];

        foreach (VehicleViewAngle::values() as $angle) {
            $fileKey = "images.{$angle}";

            if ($request->hasFile($fileKey)) {
                $path = $request->file($fileKey)->store(
                    "vehicle-colors/{$color->vehicle_id}",
                    'public'
                );
                $uploadedPaths[] = $path;
                $color->images()->updateOrCreate(
                    ['angle' => $angle],
                    ['path' => $path]
                );

                continue;
            }

            if (! $request->has("images.{$angle}")) {
                continue;
            }

            $path = $request->input("images.{$angle}");

            if (! is_string($path) || $path === '') {
                continue;
            }

            $color->images()->updateOrCreate(
                ['angle' => $angle],
                ['path' => $path]
            );
        }

        return $uploadedPaths;
    }

    protected function hasImageFiles(Request $request): bool
    {
        foreach (VehicleViewAngle::values() as $angle) {
            if ($request->hasFile("images.{$angle}")) {
                return true;
            }
        }

        return false;
    }
}
