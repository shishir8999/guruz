<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ImportFromSupabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'supabase:import {url?} {key?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically fetch and migrate all database tables from Supabase/Lovable into local MySQL';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $url = $this->argument('url') ?: env('SUPABASE_URL');
        $key = $this->argument('key') ?: env('SUPABASE_KEY');

        if (!$url || !$key) {
            $this->error('Supabase URL or Key missing!');
            $url = $this->ask('Enter your Supabase Project URL (e.g. https://xyz.supabase.co):');
            $key = $this->ask('Enter your Supabase Anon/Service Key:');
        }

        $url = rtrim($url, '/');
        $this->info("Connecting to Supabase at: {$url}...");

        $tables = [
            'categories',
            'shops',
            'products',
            'profiles',
            'orders',
            'order_items',
            'site_settings',
        ];

        foreach ($tables as $table) {
            $this->info("Fetching table: [{$table}] from Supabase...");
            
            try {
                $response = Http::withHeaders([
                    'apikey'        => $key,
                    'Authorization' => 'Bearer ' . $key,
                ])->get("{$url}/rest/v1/{$table}?select=*");

                if ($response->successful()) {
                    $rows = $response->json();
                    $count = count($rows);
                    $this->info("Found {$count} rows in [{$table}]. Importing into MySQL...");

                    foreach ($rows as $row) {
                        // Filter out non-existent fields for MySQL
                        $cleanData = [];
                        foreach ($row as $k => $v) {
                            if (is_array($v)) {
                                $cleanData[$k] = json_encode($v);
                            } else {
                                $cleanData[$k] = $v;
                            }
                        }

                        if (isset($cleanData['id'])) {
                            DB::table($table)->updateOrInsert(['id' => $cleanData['id']], $cleanData);
                        } else {
                            DB::table($table)->insert($cleanData);
                        }
                    }
                    $this->info("✅ Table [{$table}] successfully migrated to MySQL!");
                } else {
                    $this->warn("Could not fetch table [{$table}]: " . $response->status() . " - " . $response->body());
                }
            } catch (\Exception $e) {
                $this->error("Error migrating table [{$table}]: " . $e->getMessage());
            }
        }

        $this->info("🎉 Supabase/Lovable to MySQL Migration Complete!");
        return 0;
    }
}
