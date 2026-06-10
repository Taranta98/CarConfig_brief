<?php

namespace App\Http\Requests\VehicleColorRequest;

use App\Enums\VehicleViewAngle;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVehicleColorRequest extends FormRequest
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
        $vehicle = $this->route('vehicle');

        return [
            'code' => [
                'required',
                'string',
                'max:64',
                Rule::unique('vehicle_colors', 'code')->where(
                    fn ($query) => $query->where('vehicle_id', $vehicle?->id)
                ),
            ],
            'name' => ['required', 'string', 'max:120'],
            'hex' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'images' => ['required', 'array', 'min:1'],
            'images.*' => ['required', 'string', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'images.required' => 'Ogni colore deve avere almeno un set di immagini.',
            'hex.regex' => 'Il colore hex deve essere nel formato #RRGGBB.',
        ];
    }

    protected function prepareForValidation(): void
    {
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
