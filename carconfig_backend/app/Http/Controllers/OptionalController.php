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
    public function index(Request $request) {
        $query = Optional::query()->orderBy('category')->orderBy('name');

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->integer('vehicle_id'));
        }

        return OptionalResource::collection($query->get());
    }

    public function store(StoreOptionalRequest $request) {
        $optional = Optional::create($request->validated());

        return (new OptionalResource($optional))->response()->setStatusCode(201);
    }

    public function show(Optional $optional) {
        return new OptionalResource($optional);
    }

    public function update(UpdateOptionalRequest $request, Optional $optional) {

        $optional->update($request->validated());
        return new OptionalResource($optional->fresh());
    }

    public function destroy(Optional $optional) {
        $imagePath = $optional->image;

        $optional->delete();

        if ($imagePath) {
            Storage::disk('public')->delete($imagePath);
        }

        return response()->json([
            'message' => 'Optional deleted successfully',
        ]);
    }
}
