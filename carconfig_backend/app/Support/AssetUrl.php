<?php

namespace App\Support;

class AssetUrl
{
    public static function resolve(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $normalized = ltrim($path, '/');

        if (str_starts_with($normalized, 'storage/')) {
            return rtrim((string) config('app.url'), '/').'/'.$normalized;
        }

        return rtrim((string) config('app.url'), '/').'/storage/'.$normalized;
    }
}
