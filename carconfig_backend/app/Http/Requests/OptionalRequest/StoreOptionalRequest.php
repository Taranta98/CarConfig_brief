<?php

namespace App\Http\Requests\OptionalRequest;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOptionalRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'price' => 'required|integer|min:0',
            'category' => 'required|string|max:255',
            'is_required' => 'required|boolean',
            'vehicle_id' => 'required|exists:vehicles,id',
            'image' => [
                'nullable',
                Rule::when(
                    $this->hasFile('image'),
                    ['image', 'max:5120'],
                    ['string', 'max:2048']
                ),
            ],
        ];
           
  
    }
}
