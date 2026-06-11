<?php

namespace App\Http\Requests\VehicleColorRequest;

use App\Enums\VehicleViewAngle;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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
        $imageRules = [];

        foreach (VehicleViewAngle::values() as $angle) {
            $imageRules["images.{$angle}"] = [
                'nullable',
                Rule::when(
                    $this->hasFile("images.{$angle}"),
                    ['image', 'max:5120'],
                    ['string', 'max:2048']
                ),
            ];
        }

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
            'images' => ['required', 'array'],
            ...$imageRules,
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->countProvidedImages() < 1) {
                $validator->errors()->add(
                    'images',
                    'Ogni colore deve avere almeno un set di immagini.'
                );
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'hex.regex' => 'Il colore hex deve essere nel formato #RRGGBB.',
        ];
    }

    protected function prepareForValidation(): void
    {
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

    protected function countProvidedImages(): int
    {
        $count = 0;

        foreach (VehicleViewAngle::values() as $angle) {
            if ($this->hasFile("images.{$angle}")) {
                $count++;
                continue;
            }

            $path = $this->input("images.{$angle}");

            if (is_string($path) && $path !== '') {
                $count++;
            }
        }

        return $count;
    }
}
