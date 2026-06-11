<?php

namespace App\Http\Requests\TrimRequest;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTrimRequest extends FormRequest
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
                 'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:255'],
            'price' => ['sometimes', 'integer'],
            'img' => [
                'sometimes',
                'nullable',
                Rule::when(
                    $this->hasFile('img'),
                    ['image', 'max:5120'],
                    ['string', 'max:2048']
                ),
            ],
            'vehicle_id' => ['sometimes','exists:vehicles,id']
        ];
    }
}
