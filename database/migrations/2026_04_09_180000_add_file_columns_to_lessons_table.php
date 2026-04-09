<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->string('file_url')->nullable()->after('video_id');
            $table->string('file_source')->nullable()->after('file_url');
            $table->string('file_id')->nullable()->after('file_source');
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['file_url', 'file_source', 'file_id']);
        });
    }
};
