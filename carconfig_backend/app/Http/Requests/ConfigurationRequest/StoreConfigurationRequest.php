<?php

namespace App\Http\Requests\ConfigurationRequest;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreConfigurationRequest extends FormRequest
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
            'vehicle_id' => ['required','integer', 'exists:vehicles,id'],
            'trim_id' => ['required','integer', 'exists:trims,id'],
            'vehicle_color_id' => ['nullable', 'integer', 'exists:vehicle_colors,id'],

            'optionals' => ['nullable', 'array'],
            'optionals.*' => ['integer', 'exists:optionals,id'],

        ];
    }
}
