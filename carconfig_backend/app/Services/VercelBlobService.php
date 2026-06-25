<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class VercelBlobService
{
    public function uploadImage(UploadedFile $file, string $prefix): string
    {
        $token = (string) config('services.vercel_blob.read_write_token');

        if ($token === '') {
            throw new \RuntimeException('Missing Vercel Blob read-write token.');
        }

        $baseUrl = rtrim((string) config('services.vercel_blob.base_url'), '/');

        if ($baseUrl === '') {
            throw new \RuntimeException('Missing Vercel Blob base URL.');
        }

        $extension = $file->getClientOriginalExtension();
        $extension = $extension !== '' ? $extension : ($file->guessExtension() ?: 'bin');

        $pathname = trim($prefix, '/').'/'.Str::uuid()->toString().'.'.$extension;

        $response = Http::timeout(20)
            ->withToken($token)
            ->withHeaders([
                'Content-Type' => $file->getMimeType() ?: 'application/octet-stream',
                'x-content-type-options' => 'nosniff',
            ])
            ->withBody($file->getContent(), $file->getMimeType() ?: 'application/octet-stream')
            ->put($baseUrl.'/'.$pathname);

        try {
            $response->throw();
        } catch (RequestException $e) {
            $body = $e->response?->body();
            throw new \RuntimeException('Vercel Blob upload failed.'.($body ? " {$body}" : ''), previous: $e);
        }

        $json = $response->json();

        if (is_array($json) && isset($json['url']) && is_string($json['url']) && $json['url'] !== '') {
            return $json['url'];
        }

        $location = $response->header('Location');

        if (is_string($location) && $location !== '') {
            return $location;
        }

        return $baseUrl.'/'.$pathname;
    }

    public function deleteIfBlobUrl(?string $url): void
    {
        if (! is_string($url) || $url === '') {
            return;
        }

        if (! $this->isVercelBlobUrl($url)) {
            return;
        }

        $token = (string) config('services.vercel_blob.read_write_token');

        if ($token === '') {
            return;
        }

        Http::timeout(20)
            ->withToken($token)
            ->delete($url);
    }

    private function isVercelBlobUrl(string $url): bool
    {
        $host = parse_url($url, PHP_URL_HOST);

        if (! is_string($host) || $host === '') {
            return false;
        }

        return Str::endsWith($host, '.blob.vercel-storage.com');
    }
}
