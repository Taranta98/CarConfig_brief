<?php

namespace App\Services;

class PricingService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }
    public function calculate(Configuration $configuration): array
{
    $base = $this->getBasePrice($configuration);
    $trim = $this->getTrimPrice($configuration);
    $optionals = $this->getOptionalsPrice($configuration);

    $subtotal = $base + $trim + $optionals;

    $discount = $this->getDiscount($configuration, $subtotal);

    $taxable = $subtotal - $discount;
    $tax = $this->calculateTax($taxable);

    $total = $taxable + $tax;

    return [
        'base' => $base,
        'trim' => $trim,
        'optionals' => $optionals,
        'subtotal' => $subtotal,
        'discount' => $discount,
        'tax' => $tax,
        'total' => round($total, 2),
    ];
}

public function calculateTotal(Configuration $configuration): float
{
    return $this->calculate($configuration)['total'];
}

    protected function getBasePrice(Configuration $configuration): float 
    {
        return $configuration->vehicle->base_price ?? 0;
    }

    protected function getTrimPrice(Configuration $configuration): float
    {
        return $configuration->trim->price ?? 0;
    }

    protected function getOptionalPrices(Configuration $configuration): float
    {
        return $configuration->optionals->sum(function($optional){
            return $optional->pivot->price_snapshot ?? 0;
        });
    }

    protected function getDiscount(Configuration $configuration, float $subtotal): float 
    {
        $discount = 0;

        if($subtotal > 30000) {
            $discount += 1000;
        }

        return $discount;
    }
    protected function calculateTax(float $amount): float 
    {
        $iva = 0.22;

        return round($amount * $iva, 2);
    }

}

