<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            if (!Schema::hasColumn('lessons', 'file_name')) {
                $table->string('file_name')->nullable()->after('file_id');
            }
            if (!Schema::hasColumn('lessons', 'mime_type')) {
                $table->string('mime_type')->nullable()->after('file_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            if (Schema::hasColumn('lessons', 'file_name')) {
                $table->dropColumn('file_name');
            }
            if (Schema::hasColumn('lessons', 'mime_type')) {
                $table->dropColumn('mime_type');
            }
        });
    }
};
