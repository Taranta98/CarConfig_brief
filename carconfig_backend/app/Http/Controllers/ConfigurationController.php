<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConfigurationRequest\StoreConfigurationRequest;
use App\Http\Resources\ConfigurationResource;
use App\Models\Configuration;
use App\Services\ConfigurationService;
use App\Services\PricingService;
use Illuminate\Http\Request;

class ConfigurationController extends Controller
{

    public function __construct(
        protected ConfigurationService $configurationService,
        protected PricingService $pricingService
    ){}
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return ConfigurationResource::collection(Configuration::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreConfigurationRequest $request)
    {
       $config = $this->configurationService->createConfiguration(
            auth()->id(),
            $request->vehicle_id
        );
    
        if ($request->filled('trim_id')) {
            $config->trim_id = $request->trim_id;
            $config->save();
        }

        if ($request->filled('optionals')) {
            $this->configurationService->syncOptionals($config->id, $request->optionals);
        }

        return new ConfigurationResource(
            $this->configurationService->getConfiguration($config->id)
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Configuration $configuration)
    {
       return new ConfigurationResource($configuration);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
