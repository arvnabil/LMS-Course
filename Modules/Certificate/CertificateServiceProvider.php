<?php

namespace Modules\Certificate;

use Illuminate\Support\ServiceProvider;

class CertificateServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/Routes/web.php');
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
        $this->loadViewsFrom(__DIR__ . '/resources/views', 'certificate');

        if ($this->app->runningInConsole()) {
            $this->commands([
                Console\FixCertificatesCommand::class,
            ]);
        }
    }
}
