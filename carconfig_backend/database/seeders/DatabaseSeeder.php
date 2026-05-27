<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->admin()->create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'age' => '30',
            'email' => 'test@example.com',
        ]);

        $this->call([
            VehicleCatalogSeeder::class,
        ]);
    }
}
