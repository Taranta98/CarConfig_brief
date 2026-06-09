<?php

namespace App\Mail;

use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Attachment;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ConfigurationQuoteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Vehicle $vehicle,
        public string $pdfStoragePath,
        public string $pdfFilename,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Preventivo '.$this->vehicle->brand.' '.$this->vehicle->model,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.configuration-quote',
            with: [
                'user' => $this->user,
                'vehicle' => $this->vehicle,
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromStorageDisk('local', $this->pdfStoragePath)
                ->as($this->pdfFilename)
                ->withMime('application/pdf'),
        ];
    }
}
