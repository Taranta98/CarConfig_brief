<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    protected function resetUrl($notifiable): string
    {
        $frontendBase = rtrim((string) config('app.frontend_url'), '/');
        $email = urlencode($notifiable->getEmailForPasswordReset());

        return "{$frontendBase}/auth/reset-password?token={$this->token}&email={$email}";
    }

    public function toMail($notifiable): MailMessage
    {
        $expire = config('auth.passwords.'.config('auth.defaults.passwords').'.expire');

        return (new MailMessage)
            ->subject('Reimposta la password')
            ->line('Ricevi questa email perché abbiamo ricevuto una richiesta di reset password per il tuo account.')
            ->action('Reimposta password', $this->resetUrl($notifiable))
            ->line("Questo link scadrà tra {$expire} minuti.")
            ->line('Se non hai richiesto il reset della password, ignora questa email.');
    }
}
