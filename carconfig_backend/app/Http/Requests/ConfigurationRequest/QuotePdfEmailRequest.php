<?php

namespace App\Http\Requests\ConfigurationRequest;

class QuotePdfEmailRequest extends QuotePdfRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }
}
