<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    public function generateProduct(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string|max:255',
        ]);

        $prompt = $request->input('prompt');
        $apiKey = trim(\App\Models\SiteSetting::get('gemini_api_key') ?: (env('GEMINI_API_KEY') ?: config('services.gemini.api_key', '')));

        if (!$apiKey) {
            return response()->json([
                'error' => 'Gemini API key is missing. Please set it in Admin Panel (Integrations) or in .env (GEMINI_API_KEY).',
            ], 500);
        }

        $systemPrompt = "You are an expert product description generator for an e-commerce site. 
The user will provide a product name or hint.
If it is a food item (like 'Muri' or 'Rice'), you MUST include open-source nutritional information, vitamins, ingredients, and health benefits.
If it is an electronic item, include technical specifications, features, and use cases.
Important: The description should be beautifully formatted. Use emojis, bullet points, and clear paragraphs. 
Respond in the SAME LANGUAGE as the user's prompt (e.g., if the user writes in Bengali, respond in Bengali).

Respond ONLY with a raw JSON object matching exactly this format:
{
  \"name\": \"Detailed Product Name\",
  \"description\": \"A compelling, beautiful, and detailed description containing nutritional facts (if food) or key features...\",
  \"specification\": \"• Spec 1\\n• Spec 2\\n• Spec 3\"
}";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $systemPrompt . "\n\nUser prompt: " . $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'responseMimeType' => 'application/json',
            ]
        ];

        try {
            // Active fast Gemini models
            $models = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.8-flash'];
            $successData = null;
            $lastErrorMessage = 'Failed to generate AI response.';

            foreach ($models as $model) {
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->timeout(12)->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", $payload);

                if ($response->successful()) {
                    $data = $response->json();
                    if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                        $text = $data['candidates'][0]['content']['parts'][0]['text'];
                        $text = str_replace(['```json', '```'], '', $text);
                        $json = json_decode(trim($text), true);

                        if (json_last_error() === JSON_ERROR_NONE && !empty($json)) {
                            $successData = $json;
                            break;
                        }
                    }
                } else {
                    $resJson = $response->json();
                    $lastErrorMessage = $resJson['error']['message'] ?? ('Google API Error: ' . $response->status());
                    Log::warning("Gemini model {$model} failed: " . $lastErrorMessage);
                }
            }

            if ($successData) {
                return response()->json($successData);
            }

            return response()->json(['error' => $lastErrorMessage], 500);

        } catch (\Exception $e) {
            Log::error('Gemini API Exception: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage() ?: 'An error occurred while generating content.'], 500);
        }
    }

    public function generateDescription(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'hint' => 'nullable|string|max:255',
        ]);

        $title = $request->input('title');
        $hint = $request->input('hint');
        $apiKey = trim(\App\Models\SiteSetting::get('gemini_api_key') ?: (env('GEMINI_API_KEY') ?: config('services.gemini.api_key', '')));

        if (!$apiKey) {
            return response()->json([
                'error' => 'Gemini API key is missing. Please set it in Admin Panel (Integrations) or in .env (GEMINI_API_KEY).',
            ], 500);
        }

        $prompt = "Product Title: {$title}" . ($hint ? "\nAdditional Hint: {$hint}" : "");

        $systemPrompt = "You are an expert e-commerce copywriter. 
Generate a rich product description, technical specifications, SEO meta title, and SEO meta description for this product.
If it is a food item, include nutrition facts, ingredients, and health benefits.
If it is electronic or apparel, include material, specs, and features.
Format beautifully with emojis and bullet points. Respond in the same language as the title.

Respond ONLY with a valid JSON object matching exactly this format:
{
  \"description\": \"Full formatted product description...\",
  \"specification\": \"• Spec 1\\n• Spec 2\",
  \"meta_title\": \"SEO Title under 60 chars\",
  \"meta_description\": \"SEO Meta Description under 160 chars\"
}";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $systemPrompt . "\n\n" . $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'responseMimeType' => 'application/json',
            ]
        ];

        try {
            $models = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.8-flash'];
            $successData = null;
            $lastErrorMessage = 'Failed to generate AI response.';

            foreach ($models as $model) {
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->timeout(12)->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", $payload);

                if ($response->successful()) {
                    $data = $response->json();
                    if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                        $text = $data['candidates'][0]['content']['parts'][0]['text'];
                        $text = str_replace(['```json', '```'], '', $text);
                        $json = json_decode(trim($text), true);

                        if (json_last_error() === JSON_ERROR_NONE && !empty($json)) {
                            $successData = $json;
                            break;
                        }
                    }
                } else {
                    $resJson = $response->json();
                    $lastErrorMessage = $resJson['error']['message'] ?? ('Google API Error: ' . $response->status());
                    Log::warning("Gemini model {$model} failed: " . $lastErrorMessage);
                }
            }

            if ($successData) {
                return response()->json($successData);
            }

            return response()->json(['error' => $lastErrorMessage], 500);
        } catch (\Exception $e) {
            Log::error('Gemini API Exception: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage() ?: 'An error occurred while generating description.'], 500);
        }
    }
}
