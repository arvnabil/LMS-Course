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
        // Altering ENUM natively in MySQL
        DB::statement("ALTER TABLE lessons MODIFY COLUMN type ENUM('video', 'text', 'article', 'file') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverting back to original (without 'file')
        DB::statement("ALTER TABLE lessons MODIFY COLUMN type ENUM('video', 'text', 'article') NOT NULL");
    }
};
