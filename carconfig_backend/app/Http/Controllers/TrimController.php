<?php

namespace App\Http\Controllers;

use App\Http\Requests\TrimRequest\StoreTrimRequest;
use App\Http\Requests\TrimRequest\UpdateTrimRequest;
use App\Http\Resources\TrimResource;
use App\Models\Trim;
use Illuminate\Http\Request;

class TrimController extends Controller
{
    public function index(Request $request)
    {
        $query = Trim::query()->orderBy('price');

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->integer('vehicle_id'));
        }

        return TrimResource::collection($query->get());
    }

    public function store(StoreTrimRequest $request)
    {
        $trim = Trim::create($request->validated());

        return (new TrimResource($trim))->response()->setStatusCode(201);
    }

    public function show(Trim $trim)
    {
        return new TrimResource($trim);
    }

    public function update(UpdateTrimRequest $request, Trim $trim)
    {

        $trim->update($request->validated());

        return new TrimResource($trim->fresh());
    }

    public function destroy(Trim $trim)
    {
        $trim->delete();

        return response()->json([
            'message' => 'Trim deleted successfully',
        ]);
    }
}
