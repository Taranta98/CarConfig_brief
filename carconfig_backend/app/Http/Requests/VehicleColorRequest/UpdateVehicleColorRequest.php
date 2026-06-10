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
            'images.*' => ['required_with:images', 'string', 'max:2048'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('images')) {
            return;
        }

        $images = $this->input('images', []);
        $validAngles = VehicleViewAngle::values();

        $this->merge([
            'images' => collect($images)
                ->only($validAngles)
                ->filter(fn ($path) => is_string($path) && $path !== '')
                ->all(),
        ]);
    }
}
