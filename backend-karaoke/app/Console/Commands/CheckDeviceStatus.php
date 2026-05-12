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

        // ================= CONFIG
        $timeout = 15;

        while (true) {

            try {

                // ================= CLOUD CHECK
                try {

                    $response =
                        Http::withOptions([

                            'verify' => false,

                            'timeout' => 5,

                        ])
                        ->get(
                            'https://tugasakhirc14220241.up.railway.app/api/ping'
                        );

                    // ================= ONLINE
                    if (
                        $response->successful()
                    ) {

                        echo
                            "☁️ CLOUD ONLINE"
                            . PHP_EOL;

                    } else {

                        echo
                            "☁️ CLOUD ERROR"
                            . PHP_EOL;
                    }

                } catch (\Throwable $e) {

                    echo
                        "☁️ CLOUD OFFLINE"
                        . PHP_EOL;
                }

                // ================= WAIT
                sleep($timeout);

            } catch (\Throwable $e) {

                echo
                    "CHECK ERROR: "
                    . $e->getMessage()
                    . PHP_EOL;

                sleep(5);
            }
        }
    }
}