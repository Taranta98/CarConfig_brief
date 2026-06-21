<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends VerifyEmail
{
    protected function verificationUrl($notifiable): string
    {
        $id = $notifiable->getKey();
        $hash = sha1($notifiable->getEmailForVerification());

        $signedApiUrl = URL::temporarySignedRoute(
            'api.verification.verify',
            now()->addMinutes(config('auth.verification.expire', 60)),
            [
                'id' => $id,
                'hash' => $hash,
            ]
        );

        $query = parse_url($signedApiUrl, PHP_URL_QUERY);
        $frontendBase = rtrim((string) config('app.frontend_url'), '/');

        return "{$frontendBase}/auth/verify-email/{$id}/{$hash}?{$query}";
    }
}
