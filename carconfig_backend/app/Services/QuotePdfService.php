<?php

namespace App\Services;

use App\Models\Optional;
use App\Models\Trim;
use App\Models\Vehicle;
use Illuminate\Support\Collection;

class QuotePdfService
{
    private const PAGE_WIDTH = 612;

    private const PAGE_HEIGHT = 792;

    private const MARGIN_X = 50;

    private const CONTENT_WIDTH = 512;

    private const BOTTOM_MARGIN = 60;

    /** @var list<string> */
    private array $content = [];

    private float $cursorY = 0;

    /**
     * @param  Collection<int, Optional>|iterable<int, Optional>  $optionals
     */
    public function generate(
        Vehicle $vehicle,
        Trim $trim,
        iterable $optionals,
        ?string $colorName = null,
    ): string {
        $this->content = [];
        $this->cursorY = self::PAGE_HEIGHT - 42;

        $basePrice = (float) $vehicle->base_price;
        $trimPrice = (float) $trim->price;
        $optionalsTotal = 0.0;
        $optionalRows = [];

        foreach ($optionals as $optional) {
            $price = (float) $optional->price;
            $optionalsTotal += $price;
            $optionalRows[] = [
                'name' => $optional->name,
                'price' => $price,
            ];
        }

        $total = $basePrice + $trimPrice + $optionalsTotal;

        $this->drawHeader();
        $this->drawVehicleBlock($vehicle, $trim, $colorName);
        $this->drawSeparator();
        $this->drawSectionTitle('Riepilogo prezzi');
        $this->drawPriceRow('Prezzo base', $basePrice, false, 14);
        $this->drawPriceRow(
            'Allestimento: '.$trim->name,
            $trimPrice,
            $trimPrice > 0,
            14,
        );

        if ($optionalRows !== []) {
            $this->advance(6);
            $this->drawMutedLabel('Optional');
            foreach ($optionalRows as $row) {
                $this->drawPriceRow($row['name'], $row['price'], true, 22, true);
            }
            $this->drawPriceRow('Totale optional', $optionalsTotal, false, 14);
        }

        $this->drawSeparator();
        $this->drawTotalRow($total);
        $this->drawFooter();

        return $this->buildPdfDocument(implode("\n", $this->content));
    }

    private function drawHeader(): void
    {
        $this->rect(self::MARGIN_X, self::PAGE_HEIGHT - 72, self::CONTENT_WIDTH, 48, [0.09, 0.09, 0.11]);
        $this->text('PREVENTIVO CONFIGURAZIONE', self::MARGIN_X + 16, self::PAGE_HEIGHT - 46, 2, 18, [1, 1, 1]);
        $this->text(config('app.name', 'CarConfig'), self::MARGIN_X + 16, self::PAGE_HEIGHT - 62, 1, 10, [0.82, 0.82, 0.84]);
        $this->cursorY = self::PAGE_HEIGHT - 96;
    }

    private function drawVehicleBlock(Vehicle $vehicle, Trim $trim, ?string $colorName): void
    {
        $this->drawSectionTitle($vehicle->brand.' '.$vehicle->model);
        $this->drawMutedLabel(sprintf(
            '%s · %s · %s',
            $vehicle->model,
            $vehicle->fuel_type,
            $vehicle->year,
        ));

        if ($colorName !== null) {
            $this->advance(4);
            $this->text('Colore selezionato', self::MARGIN_X, $this->cursorY, 1, 10, [0.45, 0.45, 0.48]);
            $this->text($colorName, self::MARGIN_X + 130, $this->cursorY, 2, 10, [0.15, 0.15, 0.18]);
            $this->advance(14);
        }

        $this->advance(4);
        $this->text('Allestimento', self::MARGIN_X, $this->cursorY, 1, 10, [0.45, 0.45, 0.48]);
        $this->text($trim->name, self::MARGIN_X + 130, $this->cursorY, 2, 10, [0.15, 0.15, 0.18]);
        $this->advance(18);
    }

    private function drawSectionTitle(string $label): void
    {
        $this->ensureSpace(24);
        $this->text($label, self::MARGIN_X, $this->cursorY, 2, 14, [0.09, 0.09, 0.11]);
        $this->advance(20);
    }

    private function drawMutedLabel(string $label): void
    {
        $this->ensureSpace(16);
        $this->text($label, self::MARGIN_X, $this->cursorY, 1, 10, [0.45, 0.45, 0.48]);
        $this->advance(14);
    }

    private function drawPriceRow(
        string $label,
        float $amount,
        bool $asExtra,
        float $rowHeight = 14,
        bool $indented = false,
    ): void {
        $this->ensureSpace($rowHeight + 2);
        $labelX = self::MARGIN_X + ($indented ? 14 : 0);
        $priceText = ($asExtra ? '+' : '').$this->currency($amount);
        $priceX = self::MARGIN_X + self::CONTENT_WIDTH - (strlen($priceText) * 5.8);
        $this->text($label, $labelX, $this->cursorY, 1, 10, [0.2, 0.2, 0.24]);
        $this->text(
            $priceText,
            $priceX,
            $this->cursorY,
            2,
            10,
            [0.15, 0.15, 0.18],
        );
        $this->advance($rowHeight);
    }

    private function drawTotalRow(float $total): void
    {
        $this->ensureSpace(34);
        $this->rect(self::MARGIN_X, $this->cursorY - 8, self::CONTENT_WIDTH, 28, [0.96, 0.96, 0.97]);
        $this->text('Totale configurazione', self::MARGIN_X + 12, $this->cursorY + 6, 2, 12, [0.09, 0.09, 0.11]);
        $totalText = $this->currency($total);
        $totalX = self::MARGIN_X + self::CONTENT_WIDTH - 12 - (strlen($totalText) * 6.8);
        $this->text($totalText, $totalX, $this->cursorY + 6, 2, 12, [0.09, 0.09, 0.11]);
        $this->advance(34);
    }

    private function drawFooter(): void
    {
        $this->ensureSpace(20);
        $this->drawSeparator();
        $this->text(
            'Generato il '.now()->format('d/m/Y H:i'),
            self::MARGIN_X,
            $this->cursorY,
            1,
            9,
            [0.55, 0.55, 0.58],
        );
        $this->advance(12);
        $this->text(
            'Documento generato automaticamente. I prezzi sono indicativi e possono variare.',
            self::MARGIN_X,
            $this->cursorY,
            1,
            8,
            [0.65, 0.65, 0.68],
        );
    }

    private function drawSeparator(): void
    {
        $this->ensureSpace(12);
        $this->line($this->cursorY);
        $this->advance(12);
    }

    private function ensureSpace(float $requiredHeight): void
    {
        if ($this->cursorY - $requiredHeight < self::BOTTOM_MARGIN) {
            $this->cursorY = self::BOTTOM_MARGIN + $requiredHeight;
        }
    }

    private function advance(float $amount): void
    {
        $this->cursorY -= $amount;
    }

    /**
     * @param  array{0: float, 1: float, 2: float}  $rgb
     */
    private function text(
        string $value,
        float $x,
        float $y,
        int $font,
        int $size,
        array $rgb,
    ): void {
        [$r, $g, $b] = $rgb;
        $fontRef = $font === 2 ? '/F2' : '/F1';
        $escaped = $this->escapePdfText($value);

        $this->content[] = "BT {$fontRef} {$size} Tf {$r} {$g} {$b} rg {$x} {$y} Td ({$escaped}) Tj ET";
    }

    private function line(float $y): void
    {
        $right = self::MARGIN_X + self::CONTENT_WIDTH;
        $this->content[] = '0.88 0.88 0.9 RG 0.75 w';
        $this->content[] = sprintf(
            '%.2F %.2F m %.2F %.2F l S',
            self::MARGIN_X,
            $y,
            $right,
            $y,
        );
    }

    /**
     * @param  array{0: float, 1: float, 2: float}  $rgb
     */
    private function rect(float $x, float $y, float $width, float $height, array $rgb): void
    {
        [$r, $g, $b] = $rgb;
        $this->content[] = "q {$r} {$g} {$b} rg {$x} {$y} {$width} {$height} re f Q";
    }

    protected function currency(float $amount): string
    {
        return number_format($amount, 0, ',', '.').' EUR';
    }

    protected function escapePdfText(string $value): string
    {
        $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;

        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $ascii);
    }

    private function buildPdfDocument(string $stream): string
    {
        $streamLength = strlen($stream);

        $objects = [
            '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
            '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
            '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R/F2 6 0 R>>>>/Contents 5 0 R>>endobj',
            '4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj',
            "5 0 obj<</Length {$streamLength}>>stream\n{$stream}\nendstream\nendobj",
            '6 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold>>endobj',
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
