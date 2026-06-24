<?php

namespace App\Providers;

use App\Models\Optional;
use App\Models\Trim;
use App\Models\Vehicle;
use App\Services\ConfigurationStalePriceService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Password::defaults(function () {
            $rule = Password::min(8);

            return $this->app->isProduction()
                ? $rule->mixedCase()
                : $rule;
        });

        $stalePriceService = $this->app->make(ConfigurationStalePriceService::class);

        Vehicle::updated(fn (Vehicle $vehicle) => $stalePriceService->deleteConfigurationsForVehiclePriceChange($vehicle));
        Trim::updated(fn (Trim $trim) => $stalePriceService->deleteConfigurationsForTrimPriceChange($trim));
        Optional::updated(fn (Optional $optional) => $stalePriceService->deleteConfigurationsForOptionalPriceChange($optional));
    }
}
