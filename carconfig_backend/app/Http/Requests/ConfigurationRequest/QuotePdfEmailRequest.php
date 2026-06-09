<?php

namespace App\Http\Requests\ConfigurationRequest;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class QuotePdfEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'trim_id' => ['required', 'integer', 'exists:trims,id'],
            'optionals' => ['nullable', 'array'],
            'optionals.*' => ['integer', 'exists:optionals,id'],
        ];
    }
}
