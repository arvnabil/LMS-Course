<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general'); // e.g., 'branding'
            $table->timestamps();
        });

        // Insert default branding settings
        DB::table('settings')->insert([
            ['key' => 'primary_color', 'value' => '#ef3f09', 'group' => 'branding'],
            ['key' => 'sidebar_active_color', 'value' => '#276874', 'group' => 'branding'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
