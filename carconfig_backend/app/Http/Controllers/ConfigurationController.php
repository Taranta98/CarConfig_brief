<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConfigurationRequest\QuotePdfEmailRequest;
use App\Http\Requests\ConfigurationRequest\StoreConfigurationRequest;
use App\Http\Resources\ConfigurationResource;
use App\Mail\ConfigurationQuoteMail;
use App\Models\Configuration;
use App\Models\Optional;
use App\Models\Trim;
use App\Models\Vehicle;
use App\Services\ConfigurationService;
use App\Services\QuotePdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ConfigurationController extends Controller
{
    public function __construct(
        protected ConfigurationService $configurationService,
        protected QuotePdfService $quotePdfService,
    ) {}

    public function index(Request $request)
    {
        $configurations = Configuration::query()
            ->with(['vehicle', 'trim', 'optionals'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return ConfigurationResource::collection($configurations);
    }

    public function store(StoreConfigurationRequest $request)
    {
        $this->configurationService->assertTrimBelongsToVehicle(
            $request->integer('trim_id'),
            $request->integer('vehicle_id'),
        );

        $config = $this->configurationService->createConfiguration(
            $request->user()->id,
            $request->integer('vehicle_id'),
            $request->integer('trim_id'),
            $request->input('optionals', []),
            0,
        );

        $config = $this->configurationService->getConfiguration($config->id);
        $config->update(['total_price' => $this->configurationTotal($config)]);
        $config = $this->configurationService->getConfiguration($config->id);

        return new ConfigurationResource($config);
    }

    protected function configurationTotal(Configuration $configuration): float
    {
        $base = (float) ($configuration->vehicle->base_price ?? 0);
        $trim = (float) ($configuration->trim->price ?? 0);
        $optionals = $configuration->optionals->sum(
            fn ($optional) => (float) ($optional->pivot->price_snapshot ?? 0)
        );

        return $base + $trim + $optionals;
    }

    public function show(Request $request, Configuration $configuration)
    {
        $this->authorizeConfiguration($request, $configuration);

        $configuration->load(['vehicle', 'trim', 'optionals']);

        return new ConfigurationResource($configuration);
    }

    public function emailQuote(QuotePdfEmailRequest $request)
    {
        $vehicle = Vehicle::findOrFail($request->integer('vehicle_id'));

        $this->configurationService->assertTrimBelongsToVehicle(
            $request->integer('trim_id'),
            $vehicle->id,
        );

        $trim = Trim::query()
            ->whereKey($request->integer('trim_id'))
            ->where('vehicle_id', $vehicle->id)
            ->firstOrFail();

        $optionals = Optional::query()
            ->where('vehicle_id', $vehicle->id)
            ->whereIn('id', $request->input('optionals', []))
            ->get();

        $pdfContent = $this->quotePdfService->generate($vehicle, $trim, $optionals);

        if (! str_starts_with($pdfContent, '%PDF')) {
            return response()->json([
                'message' => 'Errore nella generazione del PDF. Riprova.',
            ], 500);
        }

        $filename = Str::slug('preventivo-'.$vehicle->brand.'-'.$vehicle->model).'.pdf';
        $storagePath = 'quotes/'.Str::uuid().'.pdf';

        Storage::disk('local')->put($storagePath, $pdfContent);

        try {
            Mail::to($request->user())->send(
                new ConfigurationQuoteMail(
                    $request->user(),
                    $vehicle,
                    $storagePath,
                    $filename,
                ),
            );
        } finally {
            Storage::disk('local')->delete($storagePath);
        }

        return response()->json([
            'message' => 'Preventivo inviato alla tua email.',
        ]);
    }

    protected function authorizeConfiguration(Request $request, Configuration $configuration): void
    {
        if ($configuration->user_id !== $request->user()->id) {
            abort(403);
        }
    }
}
