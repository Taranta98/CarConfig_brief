<?php

namespace App\Http\Requests\VehicleColorRequest;

use App\Enums\VehicleViewAngle;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleColorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $vehicleColor = $this->route('vehicle_color');
        $imageRules = [];

        foreach (VehicleViewAngle::values() as $angle) {
            $imageRules["images.{$angle}"] = [
                'nullable',
                'max:2048',
                'string',
            ];
        }

        return [
            'code' => [
                'sometimes',
                'string',
                'max:64',
                Rule::unique('vehicle_colors', 'code')
                    ->where(fn ($query) => $query->where('vehicle_id', $vehicleColor?->vehicle_id))
                    ->ignore($vehicleColor?->id),
            ],
            'name' => ['sometimes', 'string', 'max:120'],
            'hex' => ['sometimes', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'images' => ['sometimes', 'array'],
            ...$imageRules,
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('images') && ! $this->hasImageFiles()) {
            return;
        }

        $images = [];

        foreach (VehicleViewAngle::values() as $angle) {
            if ($this->hasFile("images.{$angle}")) {
                continue;
            }

            $path = $this->input("images.{$angle}");

            if (is_string($path) && $path !== '') {
                $images[$angle] = $path;
            }
        }

        $this->merge(['images' => $images]);
    }

    protected function hasImageFiles(): bool
    {
        foreach (VehicleViewAngle::values() as $angle) {
            if ($this->hasFile("images.{$angle}")) {
                return true;
            }
        }

        return false;
    }
}
