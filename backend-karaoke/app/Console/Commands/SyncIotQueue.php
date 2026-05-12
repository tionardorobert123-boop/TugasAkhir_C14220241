<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SyncIotQueue extends Command
{
    protected $signature =
        'iot:sync-queue';

    public function handle()
    {
        $queuePath = storage_path(
            'app/iot_queue.json'
        );

        if (!file_exists($queuePath)) {

            return;
        }

        $items = json_decode(
            file_get_contents($queuePath),
            true
        ) ?? [];

        if (empty($items)) {

            return;
        }

        $remaining = [];

        foreach ($items as $item) {

            try {

                $response =
                    Http::withOptions([
                        'verify' => false,
                        'timeout' => 5,
                    ])
                    ->withHeaders([
                        'X-GATEWAY-KEY' =>
                            'karaoke-secret'
                    ])
                    ->post(
                        'https://tugasakhirc14220241.up.railway.app/api/iot-sync',
                        $item
                    );

                if ($response->successful()) {

                    echo "SYNC SUCCESS"
                        . PHP_EOL;

                } else {

                    $remaining[] = $item;
                }

            } catch (\Throwable $e) {

                $remaining[] = $item;

                echo "SYNC FAILED: "
                    . $e->getMessage()
                    . PHP_EOL;
            }
        }

        file_put_contents(
            $queuePath,
            json_encode(
                $remaining,
                JSON_PRETTY_PRINT
            )
        );
    }
}