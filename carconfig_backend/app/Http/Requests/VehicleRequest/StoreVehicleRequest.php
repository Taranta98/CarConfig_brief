<?php

namespace App\Http\Requests\VehicleRequest;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
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
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:2100',
            'fuel_type' => 'required|string|max:255',
            'image' => ['required', 'string', 'max:2048'],
            'co2_emissions' => 'required|string|max:255',
            'base_price' => 'required|numeric|min:0',
        ];
    }
}
