<?php

namespace App\Http\Requests\VehicleRequest;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'brand' => 'sometimes|string|max:255',
            'model' => 'sometimes|string|max:255',
            'year' => 'sometimes|integer|min:1900|max:2100',
            'fuel_type' => 'sometimes|string|max:255',
            'image' => [
                'sometimes',
                Rule::when(
                    $this->hasFile('image'),
                    ['image', 'max:5120'],
                    ['string', 'max:2048']
                ),
            ],
            'co2_emissions' => 'sometimes|string|max:255',
            'base_price' => 'sometimes|numeric|min:0',
        ];
    }
}
