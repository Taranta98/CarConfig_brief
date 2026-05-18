<?php

namespace App\Http\Requests\OptionalRequest;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateOptionalRequest extends FormRequest
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
              'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:255',
            'price' => 'sometimes|integer|min:0',
            'category' => 'sometimes|string|max:255',
            'is_required' => 'sometimes|boolean',
            'vehicle_id' => 'sometimes|exists:vehicles,id',
        ];
    }
}
