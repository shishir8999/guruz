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
        Schema::create('vendor_landing_sections', function (Blueprint $table) {
            $table->id();
            $table->string('section_id')->nullable();
            $table->string('name');
            $table->string('content_type')->default('Text & Icons');
            $table->enum('visibility', ['Visible', 'Hidden'])->default('Visible');
            $table->enum('status', ['Active', 'Draft'])->default('Active');
            $table->text('description')->nullable();
            $table->integer('position')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_landing_sections');
    }
};
