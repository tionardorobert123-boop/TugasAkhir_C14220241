<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Services\MQTTService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(
            MQTTService::class,
            function ($app) {

                return new MQTTService();
            }
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}