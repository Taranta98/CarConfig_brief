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
    public function index()
    {
        return TrimResource::collection(Trim::paginate(5));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTrimRequest $request)
    {
        $imagePath = null;

        try {
                if($request->hasFile('img')){
                    $imagePath = $request->file('img')->store('trims', 'public');
                } 
                
                $data = $request->validated();
                $data['img'] = $imagePath;

                $trim = Trim::create($data);

                return response()->json([
                    'success'=> true,
                    'message' => 'Trim created successfully',
                    'trim' => $trim
                ]);
        

        } catch (\Throwable $th) {
            if($imagePath) {
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
            if($request->hasFile('img')) {
                $newImagePath = $request->file('img')->store('trims', 'public');
            }

            $data = $request->validated();

            if($newImagePath) {
                $data['img'] = $newImagePath;
            }

            $trim->update($data);

            if($request->hasFile('img') && $newImagePath && $newImagePath !== $oldImagePath) {
                Storage::disk('public')->delete('')
            }


        } catch (\Throwable $th) {
            //throw $th;
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Trim $trim)
    {
        //
    }
}
