<?php

namespace App\Http\Requests\TrimRequest;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTrimRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:255'],
            'price' => ['required', 'integer'],
            'img' => [
                'nullable',
                Rule::when(
                    $this->hasFile('img'),
                    ['image', 'max:5120'],
                    ['string', 'max:2048']
                ),
            ],
            'vehicle_id' => ['required','exists:vehicles,id']
        ];
    }
}
