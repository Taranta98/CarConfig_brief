<?php

namespace App\Services;

use App\Enums\VehicleViewAngle;
use App\Models\Optional;
use App\Models\Trim;
use App\Models\Vehicle;
use App\Models\VehicleColorImage;
use App\Support\AssetUrl;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class QuotePdfService
{
    private const PAGE_WIDTH = 612;

    private const PAGE_HEIGHT = 792;

    private const MARGIN_X = 48;

    private const CONTENT_WIDTH = 516;

    private const BOTTOM_MARGIN = 56;

    private const HEADER_HEIGHT = 72.0;

    private const SECTION_GAP = 20.0;

    private const IMAGE_SECTION_HEIGHT = 172.0;

    private const ACCENT_RGB = [0.12, 0.28, 0.55];

    private const HEADER_RGB = [0.07, 0.09, 0.14];

    /** @var list<string> */
    private array $content = [];

    private float $cursorY = 0;

    /** @var array{bytes: string, width: int, height: int}|null */
    private ?array $vehicleImage = null;

    /**
     * @param  Collection<int, Optional>|iterable<int, Optional>  $optionals
     */
    public function generate(
        Vehicle $vehicle,
        Trim $trim,
        iterable $optionals,
        ?string $colorName = null,
        ?int $vehicleColorId = null,
    ): string {
        $this->content = [];
        $this->vehicleImage = $this->loadVehicleImage($vehicle, $trim, $vehicleColorId);
        $this->cursorY = self::PAGE_HEIGHT - self::HEADER_HEIGHT - self::SECTION_GAP;

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
        $this->drawPriceTableHeader();
        $this->drawPriceRow('Prezzo base', $basePrice, false);
        $this->drawPriceRow('Allestimento: '.$trim->name, $trimPrice, $trimPrice > 0);

        if ($optionalRows !== []) {
            $this->advance(4);
            $this->drawMutedLabel('Optional');
            foreach ($optionalRows as $row) {
                $this->drawPriceRow($row['name'], $row['price'], true, true);
            }
            $this->drawPriceRow('Totale optional', $optionalsTotal, false);
        }

        $this->drawSeparator();
        $this->drawTotalRow($total);
        $this->drawFooter();

        return $this->buildPdfDocument(implode("\n", $this->content), $this->vehicleImage);
    }

    private function drawHeader(): void
    {
        $headerY = self::PAGE_HEIGHT - self::HEADER_HEIGHT;

        $this->rect(self::MARGIN_X, $headerY, self::CONTENT_WIDTH, self::HEADER_HEIGHT, self::HEADER_RGB);
        $this->rect(self::MARGIN_X, $headerY + self::HEADER_HEIGHT - 3, self::CONTENT_WIDTH, 3, self::ACCENT_RGB);

        $appName = (string) config('app.name', 'Car Config');
        $appNameWidth = strlen($appName) * 5.4;

        $this->text(
            'Preventivo Configurazione',
            self::MARGIN_X + 18,
            self::PAGE_HEIGHT - 30,
            2,
            20,
            [1, 1, 1],
        );
        $this->text(
            $appName,
            self::MARGIN_X + self::CONTENT_WIDTH - 18 - $appNameWidth,
            self::PAGE_HEIGHT - 30,
            2,
            11,
            [0.78, 0.82, 0.9],
        );
        $this->text(
            'Configuratore veicoli · '.now()->format('d/m/Y'),
            self::MARGIN_X + 18,
            self::PAGE_HEIGHT - 50,
            1,
            9,
            [0.72, 0.76, 0.84],
        );
    }

    private function drawVehicleBlock(Vehicle $vehicle, Trim $trim, ?string $colorName): void
    {
        if ($this->vehicleImage !== null) {
            $this->drawVehicleImageSection();
            $this->advance(self::SECTION_GAP);
        }

        $this->drawVehicleDetailsSection($vehicle, $trim, $colorName);
        $this->advance(self::SECTION_GAP);
    }

    private function drawVehicleImageSection(): void
    {
        if ($this->vehicleImage === null) {
            return;
        }

        $sectionHeight = self::IMAGE_SECTION_HEIGHT;
        $sectionBottom = $this->cursorY - $sectionHeight;
        $padding = 12.0;
        $labelHeight = 22.0;
        $frameX = self::MARGIN_X;
        $frameY = $sectionBottom;
        $frameWidth = self::CONTENT_WIDTH;
        $frameHeight = $sectionHeight;

        $this->rect($frameX, $frameY, $frameWidth, $frameHeight, [0.98, 0.98, 0.99]);
        $this->strokeRect($frameX, $frameY, $frameWidth, $frameHeight, [0.9, 0.91, 0.94]);

        $sectionTop = $this->cursorY;
        $imageAreaBottom = $frameY + $padding;
        $imageAreaTop = $sectionTop - $labelHeight - $padding;
        $imageAreaX = $frameX + $padding;
        $imageAreaWidth = $frameWidth - ($padding * 2);
        $imageAreaHeight = $imageAreaTop - $imageAreaBottom;

        $ratio = min(
            $imageAreaWidth / $this->vehicleImage['width'],
            $imageAreaHeight / $this->vehicleImage['height'],
        );
        $displayWidth = $this->vehicleImage['width'] * $ratio;
        $displayHeight = $this->vehicleImage['height'] * $ratio;
        $imageX = $imageAreaX + (($imageAreaWidth - $displayWidth) / 2);
        $imageY = $imageAreaBottom + (($imageAreaHeight - $displayHeight) / 2);

        $this->content[] = sprintf(
            'q %.2F 0 0 %.2F %.2F %.2F cm /Im1 Do Q',
            $displayWidth,
            $displayHeight,
            $imageX,
            $imageY,
        );

        $this->text(
            'Anteprima configurazione',
            $frameX + $padding,
            $sectionTop - 14,
            2,
            9,
            self::ACCENT_RGB,
        );

        $this->cursorY = $sectionBottom;
    }

    private function drawVehicleDetailsSection(Vehicle $vehicle, Trim $trim, ?string $colorName): void
    {
        $sectionTop = $this->cursorY;
        $sectionHeight = $this->estimateDetailsSectionHeight($vehicle, $trim, $colorName);
        $sectionBottom = $sectionTop - $sectionHeight;

        $this->rect(self::MARGIN_X, $sectionBottom, self::CONTENT_WIDTH, $sectionHeight, [0.97, 0.98, 0.99]);
        $this->strokeRect(self::MARGIN_X, $sectionBottom, self::CONTENT_WIDTH, $sectionHeight, [0.9, 0.91, 0.94]);

        $this->cursorY = $sectionTop - 16;

        $title = $vehicle->brand.' '.$vehicle->model;
        $this->text($title, self::MARGIN_X + 14, $this->cursorY, 2, 16, [0.09, 0.09, 0.11]);
        $this->advance(22);

        $this->text(
            sprintf('%s · %s · %s g/km CO2', $vehicle->fuel_type, $vehicle->year, $vehicle->co2_emissions),
            self::MARGIN_X + 14,
            $this->cursorY,
            1,
            9,
            [0.45, 0.48, 0.52],
        );
        $this->advance(22);

        $this->drawDetailRow('Allestimento', $trim->name, self::MARGIN_X + 14);

        if ($colorName !== null) {
            $this->drawDetailRow('Colore', $colorName, self::MARGIN_X + 14);
        }

        if ($trim->description) {
            $this->advance(4);
            $this->text('Descrizione', self::MARGIN_X + 14, $this->cursorY, 1, 8, [0.5, 0.52, 0.56]);
            $this->advance(12);
            $this->drawWrappedText(
                $trim->description,
                self::MARGIN_X + 14,
                $this->cursorY,
                self::CONTENT_WIDTH - 28,
                8,
                1,
                3,
            );
        }

        $this->cursorY = $sectionBottom;
    }

    private function estimateDetailsSectionHeight(Vehicle $vehicle, Trim $trim, ?string $colorName): float
    {
        $height = 52.0 + 22.0 + 18.0;

        if ($colorName !== null) {
            $height += 18.0;
        }

        if ($trim->description) {
            $height += 16.0 + $this->estimateWrappedTextHeight(
                $trim->description,
                self::CONTENT_WIDTH - 28,
                8,
                3,
            );
        }

        return $height + 14.0;
    }

    private function estimateWrappedTextHeight(
        string $value,
        float $maxWidth,
        int $size,
        int $maxLines,
    ): float {
        $words = preg_split('/\s+/', trim($value)) ?: [];
        $line = '';
        $lineCount = 1;

        foreach ($words as $word) {
            $candidate = $line === '' ? $word : $line.' '.$word;

            if (strlen($candidate) * ($size * 0.48) > $maxWidth && $line !== '') {
                $lineCount++;
                $line = $word;

                if ($lineCount >= $maxLines) {
                    break;
                }
            } else {
                $line = $candidate;
            }
        }

        return $lineCount * ($size + 3);
    }

    private function drawDetailRow(string $label, string $value, float $x): void
    {
        $this->text($label, $x, $this->cursorY, 1, 9, [0.45, 0.48, 0.52]);
        $this->text($value, $x + 88, $this->cursorY, 2, 9, [0.12, 0.14, 0.18]);
        $this->advance(18);
    }

    private function drawSectionTitle(string $label): void
    {
        $this->ensureSpace(30);
        $this->text($label, self::MARGIN_X, $this->cursorY, 2, 13, self::ACCENT_RGB);
        $this->advance(6);
        $this->line($this->cursorY);
        $this->advance(16);
    }

    private function drawPriceTableHeader(): void
    {
        $this->ensureSpace(20);
        $this->rect(self::MARGIN_X, $this->cursorY - 6, self::CONTENT_WIDTH, 18, [0.94, 0.95, 0.97]);
        $this->text('Voce', self::MARGIN_X + 10, $this->cursorY, 2, 8, [0.35, 0.38, 0.42]);
        $this->text('Importo', self::MARGIN_X + self::CONTENT_WIDTH - 58, $this->cursorY, 2, 8, [0.35, 0.38, 0.42]);
        $this->advance(20);
    }

    private function drawMutedLabel(string $label): void
    {
        $this->ensureSpace(16);
        $this->text($label, self::MARGIN_X + 4, $this->cursorY, 2, 9, [0.4, 0.43, 0.48]);
        $this->advance(14);
    }

    private function drawPriceRow(
        string $label,
        float $amount,
        bool $asExtra,
        bool $indented = false,
    ): void {
        $rowHeight = 18.0;
        $this->ensureSpace($rowHeight + 2);
        $labelX = self::MARGIN_X + 10 + ($indented ? 14 : 0);
        $priceText = ($asExtra ? '+' : '').$this->currency($amount);
        $priceX = self::MARGIN_X + self::CONTENT_WIDTH - 10 - (strlen($priceText) * 5.6);

        $this->text($label, $labelX, $this->cursorY, 1, 9, [0.18, 0.2, 0.24]);
        $this->text($priceText, $priceX, $this->cursorY, 2, 9, [0.12, 0.14, 0.18]);
        $this->advance($rowHeight);
    }

    private function drawTotalRow(float $total): void
    {
        $this->ensureSpace(36);
        $this->rect(self::MARGIN_X, $this->cursorY - 10, self::CONTENT_WIDTH, 30, self::HEADER_RGB);
        $this->text('Totale configurazione', self::MARGIN_X + 14, $this->cursorY + 4, 2, 12, [1, 1, 1]);
        $totalText = $this->currency($total);
        $totalX = self::MARGIN_X + self::CONTENT_WIDTH - 14 - (strlen($totalText) * 6.6);
        $this->text($totalText, $totalX, $this->cursorY + 4, 2, 12, [1, 1, 1]);
        $this->advance(36);
    }

    private function drawFooter(): void
    {
        $this->ensureSpace(28);
        $this->drawSeparator();
        $this->text(
            'Generato il '.now()->format('d/m/Y H:i').' tramite '.config('app.name', 'Car Config'),
            self::MARGIN_X,
            $this->cursorY,
            1,
            8,
            [0.55, 0.57, 0.6],
        );
        $this->advance(12);
        $this->text(
            'Documento generato automaticamente. I prezzi sono indicativi e possono variare.',
            self::MARGIN_X,
            $this->cursorY,
            1,
            8,
            [0.62, 0.64, 0.68],
        );
    }

    private function drawSeparator(): void
    {
        $this->ensureSpace(14);
        $this->line($this->cursorY);
        $this->advance(14);
    }

    /**
     * @return array{bytes: string, width: int, height: int}|null
     */
    private function loadVehicleImage(Vehicle $vehicle, Trim $trim, ?int $vehicleColorId): ?array
    {
        $source = $this->resolveImageSource($vehicle, $trim, $vehicleColorId);

        if ($source === null) {
            return null;
        }

        $bytes = $this->fetchImageBytes($source);

        if ($bytes === null) {
            return null;
        }

        return $this->convertToJpeg($bytes);
    }

    private function resolveImageSource(Vehicle $vehicle, Trim $trim, ?int $vehicleColorId): ?string
    {
        if ($vehicleColorId !== null) {
            $path = VehicleColorImage::query()
                ->whereHas('vehicleColor', function ($query) use ($vehicle, $vehicleColorId) {
                    $query->where('vehicle_id', $vehicle->id)
                        ->whereKey($vehicleColorId);
                })
                ->where('angle', VehicleViewAngle::Front->value)
                ->value('path');

            if (is_string($path) && $path !== '') {
                return AssetUrl::resolve($path) ?? $path;
            }
        }

        if (is_string($trim->img) && $trim->img !== '') {
            return AssetUrl::resolve($trim->img) ?? $trim->img;
        }

        if (is_string($vehicle->image) && $vehicle->image !== '') {
            return AssetUrl::resolve($vehicle->image) ?? $vehicle->image;
        }

        return null;
    }

    private function fetchImageBytes(string $source): ?string
    {
        if (str_starts_with($source, 'http://') || str_starts_with($source, 'https://')) {
            try {
                $response = Http::timeout(8)->get($source);

                if ($response->successful()) {
                    return $response->body();
                }
            } catch (\Throwable) {
                return null;
            }

            return null;
        }

        $path = ltrim($source, '/');

        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, strlen('storage/'));
        }

        $fullPath = storage_path('app/public/'.$path);

        if (! is_file($fullPath)) {
            return null;
        }

        $bytes = file_get_contents($fullPath);

        return $bytes === false ? null : $bytes;
    }

    /**
     * @return array{bytes: string, width: int, height: int}|null
     */
    private function convertToJpeg(string $bytes): ?array
    {
        if (! function_exists('imagecreatefromstring')) {
            return null;
        }

        $image = @imagecreatefromstring($bytes);

        if ($image === false) {
            return null;
        }

        $width = imagesx($image);
        $height = imagesy($image);

        if ($width <= 0 || $height <= 0) {
            imagedestroy($image);

            return null;
        }

        if (function_exists('imagealphablending')) {
            imagealphablending($image, true);
        }

        if (function_exists('imagesavealpha')) {
            imagesavealpha($image, true);
        }

        ob_start();
        imagejpeg($image, null, 88);
        $jpeg = ob_get_clean();
        imagedestroy($image);

        if (! is_string($jpeg) || $jpeg === '') {
            return null;
        }

        return [
            'bytes' => $jpeg,
            'width' => $width,
            'height' => $height,
        ];
    }

    private function drawWrappedText(
        string $value,
        float $x,
        float $y,
        float $maxWidth,
        int $size,
        int $font,
        int $maxLines,
    ): void {
        $words = preg_split('/\s+/', trim($value)) ?: [];
        $line = '';
        $lineCount = 0;
        $currentY = $y;

        foreach ($words as $word) {
            $candidate = $line === '' ? $word : $line.' '.$word;

            if (strlen($candidate) * ($size * 0.48) > $maxWidth && $line !== '') {
                $this->text($line, $x, $currentY, $font, $size, [0.35, 0.38, 0.42]);
                $currentY -= ($size + 3);
                $lineCount++;

                if ($lineCount >= $maxLines) {
                    break;
                }

                $line = $word;
            } else {
                $line = $candidate;
            }
        }

        if ($line !== '' && $lineCount < $maxLines) {
            $this->text($line, $x, $currentY, $font, $size, [0.35, 0.38, 0.42]);
            $currentY -= ($size + 3);
        }

        $this->cursorY = min($this->cursorY, $currentY);
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
        $this->content[] = '0.86 0.88 0.91 RG 0.75 w';
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

    /**
     * @param  array{0: float, 1: float, 2: float}  $rgb
     */
    private function strokeRect(float $x, float $y, float $width, float $height, array $rgb): void
    {
        [$r, $g, $b] = $rgb;
        $this->content[] = "q {$r} {$g} {$b} RG 0.75 w {$x} {$y} {$width} {$height} re S Q";
    }

    protected function currency(float $amount): string
    {
        $hasCents = fmod(abs($amount), 1.0) >= 0.005;
        $decimals = $hasCents ? 2 : 0;

        return number_format($amount, $decimals, ',', '.').' EUR';
    }

    protected function escapePdfText(string $value): string
    {
        $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;

        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $ascii);
    }

    /**
     * @param  array{bytes: string, width: int, height: int}|null  $image
     */
    private function buildPdfDocument(string $stream, ?array $image = null): string
    {
        $streamLength = strlen($stream);

        $pageResources = '/Font<</F1 4 0 R/F2 6 0 R>>';

        if ($image !== null) {
            $pageResources .= '/XObject<</Im1 7 0 R>>';
        }

        $objects = [
            1 => '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
            2 => '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
            3 => "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<{$pageResources}>>/Contents 5 0 R>>endobj",
            4 => '4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj',
            5 => "5 0 obj<</Length {$streamLength}>>stream\n{$stream}\nendstream\nendobj",
            6 => '6 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold>>endobj',
        ];

        if ($image !== null) {
            $imageLength = strlen($image['bytes']);
            $objects[7] = "7 0 obj<</Type/XObject/Subtype/Image/Width {$image['width']}/Height {$image['height']}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length {$imageLength}>>stream\n{$image['bytes']}\nendstream\nendobj";
        }

        ksort($objects);

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
