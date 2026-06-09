<?php

namespace App\Services;

use App\Models\Optional;
use App\Models\Trim;
use App\Models\Vehicle;
use Illuminate\Support\Collection;

class QuotePdfService
{
    /**
     * @param  Collection<int, Optional>|iterable<int, Optional>  $optionals
     */
    public function generate(Vehicle $vehicle, Trim $trim, iterable $optionals): string
    {
        $basePrice = (float) $vehicle->base_price;
        $trimPrice = (float) $trim->price;
        $optionalsTotal = 0.0;
        $optionalLines = [];

        foreach ($optionals as $optional) {
            $price = (float) $optional->price;
            $optionalsTotal += $price;
            $optionalLines[] = sprintf(
                '  - %s: +%s',
                $optional->name,
                $this->currency($price),
            );
        }

        $total = $basePrice + $trimPrice + $optionalsTotal;

        $lines = [
            'PREVENTIVO CONFIGURAZIONE',
            '',
            sprintf('Veicolo: %s %s', $vehicle->brand, $vehicle->model),
            sprintf('%s - %s - %s', $vehicle->model, $vehicle->fuel_type, $vehicle->year),
            '',
            'Prezzo base: '.$this->currency($basePrice),
            sprintf('Allestimento: %s (+%s)', $trim->name, $this->currency($trimPrice)),
        ];

        if ($optionalLines !== []) {
            $lines[] = '';
            $lines[] = 'Optional:';
            array_push($lines, ...$optionalLines);
            $lines[] = 'Totale optional: '.$this->currency($optionalsTotal);
        }

        $lines[] = '';
        $lines[] = 'TOTALE: '.$this->currency($total);
        $lines[] = '';
        $lines[] = 'Generato il '.now()->format('d/m/Y H:i');

        return $this->buildPdf($lines);
    }

    protected function currency(float $amount): string
    {
        return number_format($amount, 0, ',', '.').' EUR';
    }

    protected function escapePdfText(string $value): string
    {
        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $value);
    }

    /**
     * @param  list<string>  $lines
     */
    protected function buildPdf(array $lines): string
    {
        $fontSize = 11;
        $lineHeight = 16;
        $startY = 750;
        $startX = 50;

        $textOps = [];
        foreach ($lines as $index => $line) {
            $y = $startY - ($index * $lineHeight);
            $text = $line === '' ? ' ' : $this->escapePdfText($line);
            $textOps[] = "BT /F1 {$fontSize} Tf {$startX} {$y} Td ({$text}) Tj ET";
        }

        $stream = implode("\n", $textOps)."\n";
        $streamLength = strlen($stream);

        $objects = [
            '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
            '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
            '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj',
            '4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj',
            "5 0 obj<</Length {$streamLength}>>stream\n{$stream}endstream\nendobj",
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [0];

        foreach ($objects as $object) {
            $offsets[] = strlen($pdf);
            $pdf .= $object."\n";
        }

        $xrefOffset = strlen($pdf);
        $objectCount = count($objects) + 1;

        $pdf .= "xref\n0 {$objectCount}\n";
        $pdf .= "0000000000 65535 f \n";

        for ($i = 1; $i <= count($objects); $i++) {
            $pdf .= str_pad((string) $offsets[$i], 10, '0', STR_PAD_LEFT)." 00000 n \n";
        }

        $pdf .= "trailer<</Size {$objectCount}/Root 1 0 R>>\n";
        $pdf .= "startxref\n{$xrefOffset}\n%%EOF";

        return $pdf;
    }
}
