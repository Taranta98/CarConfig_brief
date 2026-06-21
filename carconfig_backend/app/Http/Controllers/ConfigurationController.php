<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConfigurationRequest\QuotePdfEmailRequest;
use App\Http\Requests\ConfigurationRequest\QuotePdfRequest;
use App\Http\Requests\ConfigurationRequest\StoreConfigurationRequest;
use App\Http\Resources\ConfigurationResource;
use App\Mail\ConfigurationQuoteMail;
use App\Models\Configuration;
use App\Models\Optional;
use App\Models\Trim;
use App\Models\Vehicle;
use App\Models\VehicleColor;
use App\Services\QuotePdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

class ConfigurationController extends Controller
{
    public function index(Request $request) {
        $configurations = Configuration::query()
            ->with(['vehicle', 'trim', 'vehicleColor', 'optionals'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return ConfigurationResource::collection($configurations);
    }

    public function store(StoreConfigurationRequest $request) {
        $this->assertTrimBelongsToVehicle(
            $request->integer('trim_id'),
            $request->integer('vehicle_id'),
        );

        $this->assertColorBelongsToVehicle(
            $request->input('vehicle_color_id'),
            $request->integer('vehicle_id'),
        );

        $config = $this->createConfiguration(
            $request->user()->id,
            $request->integer('vehicle_id'),
            $request->integer('trim_id'),
            $request->input('vehicle_color_id'),
            $request->input('optionals', []),
            0,
        );

        $config = $this->getConfiguration($config->id);
        $config->update(['total_price' => $this->configurationTotal($config)]);
        $config = $this->getConfiguration($config->id);

        return new ConfigurationResource($config);
    }

    public function show(Request $request, Configuration $configuration) {
        $this->authorizeConfiguration($request, $configuration);

        $configuration->load(['vehicle', 'trim', 'vehicleColor', 'optionals']);

        return new ConfigurationResource($configuration);
    }

    public function destroy(Request $request, Configuration $configuration) {
        $this->authorizeConfiguration($request, $configuration);

        $configuration->delete();

        return response()->json([
            'message' => 'Configurazione eliminata con successo.',
        ]);
    }

    public function downloadQuote(QuotePdfRequest $request) {
        ['pdfContent' => $pdfContent, 'filename' => $filename] = $this->buildQuotePdf($request);

        if (! str_starts_with($pdfContent, '%PDF')) {
            return response()->json([
                'message' => 'Errore nella generazione del PDF. Riprova.',
            ], 500);
        }

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    public function emailQuote(QuotePdfEmailRequest $request) {
        ['pdfContent' => $pdfContent, 'filename' => $filename, 'vehicle' => $vehicle] = $this->buildQuotePdf($request);

        if (! str_starts_with($pdfContent, '%PDF')) {
            return response()->json([
                'message' => 'Errore nella generazione del PDF. Riprova.',
            ], 500);
        }

        try {
            Mail::to($request->user())->send(
                new ConfigurationQuoteMail(
                    $request->user(),
                    $vehicle,
                    $pdfContent,
                    $filename,
                ),
            );
        } catch (TransportExceptionInterface) {
            return response()->json([
                'message' => 'Impossibile inviare l\'email. Verifica la configurazione SMTP e riprova.',
            ], 503);
        }

        return response()->json([
            'message' => 'Preventivo inviato alla tua email.',
        ]);
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

    /**
     * @return array{vehicle: Vehicle, pdfContent: string, filename: string}
     */
    protected function buildQuotePdf(QuotePdfRequest $request): array
    {
        $vehicle = Vehicle::findOrFail($request->integer('vehicle_id'));

        $this->assertTrimBelongsToVehicle(
            $request->integer('trim_id'),
            $vehicle->id,
        );

        $this->assertColorBelongsToVehicle(
            $request->input('vehicle_color_id'),
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

        $colorName = null;
        if ($request->filled('vehicle_color_id')) {
            $colorName = VehicleColor::query()
                ->whereKey($request->integer('vehicle_color_id'))
                ->where('vehicle_id', $vehicle->id)
                ->value('name');
        }

        $pdfContent = (new QuotePdfService)->generate($vehicle, $trim, $optionals, $colorName);
        $filename = Str::slug('preventivo-'.$vehicle->brand.'-'.$vehicle->model).'.pdf';

        return [
            'vehicle' => $vehicle,
            'pdfContent' => $pdfContent,
            'filename' => $filename,
        ];
    }

    protected function authorizeConfiguration(Request $request, Configuration $configuration): void
    {
        if ($configuration->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    protected function createConfiguration(
        int $userId,
        int $vehicleId,
        int $trimId,
        ?int $vehicleColorId,
        array $optionals,
        float $totalPrice,
    ): Configuration {
        $config = Configuration::create([
            'user_id' => $userId,
            'vehicle_id' => $vehicleId,
            'trim_id' => $trimId,
            'vehicle_color_id' => $vehicleColorId,
            'status' => Configuration::STATUS_COMPLETED,
            'total_price' => $totalPrice,
        ]);

        $this->syncOptionals($config->id, $optionals);

        return $this->getConfiguration($config->id);
    }

    protected function getConfiguration(int $id): Configuration
    {
        return Configuration::with(['vehicle', 'trim', 'vehicleColor', 'optionals'])
            ->findOrFail($id);
    }

    protected function assertColorBelongsToVehicle(?int $colorId, int $vehicleId): void
    {
        if ($colorId === null) {
            return;
        }

        $belongs = VehicleColor::query()
            ->whereKey($colorId)
            ->where('vehicle_id', $vehicleId)
            ->exists();

        if (! $belongs) {
            abort(422, 'Il colore selezionato non appartiene a questo veicolo.');
        }
    }

    protected function syncOptionals(int $configId, array $optionals): void
    {
        $config = Configuration::findOrFail($configId);

        $syncData = [];

        $optionalsModels = Optional::whereIn('id', $optionals)->get();

        foreach ($optionalsModels as $optional) {
            $syncData[$optional->id] = [
                'price_snapshot' => $optional->price,
            ];
        }

        $config->optionals()->sync($syncData);
    }

    protected function assertTrimBelongsToVehicle(int $trimId, int $vehicleId): void
    {
        $belongs = Trim::query()
            ->whereKey($trimId)
            ->where('vehicle_id', $vehicleId)
            ->exists();

        if (! $belongs) {
            abort(422, 'L\'allestimento selezionato non appartiene a questo veicolo.');
        }
    }
}
