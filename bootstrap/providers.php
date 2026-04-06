<?php

return [
    App\Providers\AppServiceProvider::class,
    Modules\Course\CourseServiceProvider::class,
    Modules\Quiz\QuizServiceProvider::class,
    Modules\Payment\PaymentServiceProvider::class,
    Modules\Certificate\CertificateServiceProvider::class,
    Modules\Notification\NotificationServiceProvider::class,
    Modules\Settings\SettingsServiceProvider::class,
    Modules\Organization\OrganizationServiceProvider::class,
];
