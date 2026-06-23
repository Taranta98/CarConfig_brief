<?php

namespace App\Http\Controllers;

use App\Models\Configuration;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminStatsController extends Controller
{
    public function index(): JsonResponse
    {
        $configuredVehicles = Configuration::query()
            ->join('vehicles', 'vehicles.id', '=', 'configurations.vehicle_id')
            ->select(
                'configurations.vehicle_id',
                'vehicles.brand',
                'vehicles.model',
                'vehicles.year',
                DB::raw('count(*) as configurations_count')
            )
            ->groupBy(
                'configurations.vehicle_id',
                'vehicles.brand',
                'vehicles.model',
                'vehicles.year'
            )
            ->orderByDesc('configurations_count')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'vehicle_id' => $row->vehicle_id,
                'label' => "{$row->brand} {$row->model} ({$row->year})",
                'count' => (int) $row->configurations_count,
            ])
            ->values();

        $usersByRole = User::query()
            ->select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->get()
            ->map(fn ($row) => [
                'role' => $row->role,
                'count' => (int) $row->count,
            ])
            ->values();

        return response()->json([
            'data' => [
                'configured_vehicles' => $configuredVehicles,
                'users' => [
                    'total' => User::count(),
                    'by_role' => $usersByRole,
                ],
            ],
        ]);
    }
}
