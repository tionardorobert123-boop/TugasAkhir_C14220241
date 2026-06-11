<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class CheckDeviceStatus extends Command
{
    protected $signature =
        'iot:check-status';

    protected $description =
        'Check offline IOT status';

  public function handle(): void
{
    $this->info(
        'IOT Status Checker started...'
    );

    while (true) {

        try {

            Http::withOptions([
                'verify' => false,
                'timeout' => 5,
            ])
            ->withHeaders([
                'X-GATEWAY-KEY'
                    => 'karaoke-secret'
            ])
            ->post(
                'https://tugasakhirc14220241-production-11c4.up.railway.app/api/iot/check-offline'
            );

        } catch (\Throwable $e) {

            echo
                "CHECK ERROR: "
                . $e->getMessage()
                . PHP_EOL;
        }

        sleep(5);
    }
}
}