<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use App\Models\MedicalRecord;

class MedicalVisitSummary extends Mailable
{
    use Queueable, SerializesModels;

    public $record;

    public function __construct(MedicalRecord $record)
    {
        $this->record = $record;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Resumen de la Visita Médica - ' . $this->record->pet->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.medical_records.visit_summary',
        );
    }

    public function attachments(): array
    {
        $attachments = [];

        if ($this->record->attachment_path) {
            $attachments[] = Attachment::fromStorageDisk('public', $this->record->attachment_path)
                ->as('adjunto_visita_' . $this->record->id . (str_contains($this->record->attachment_type, 'pdf') ? '.pdf' : '.jpg'));
        }

        return $attachments;
    }
}
