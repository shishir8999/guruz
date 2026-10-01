<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SellerProductImportController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Seller/Products/ImportCsv');
    }

    public function downloadTemplate()
    {
        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="product_import_template.csv"',
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0',
        ];

        $columns = [
            'Product Name', 
            'SKU', 
            'Price (BDT)', 
            'Sale Price (BDT)', 
            'Purchase Price (BDT)', 
            'Stock Quantity', 
            'Category', 
            'Brand', 
            'Unit', 
            'Description'
        ];

        $sampleRows = [
            [
                'Spark High Voltage Cable 1.5RM',
                'SPK-CBL-15RM',
                '4500.00',
                '4200.00',
                '3500.00',
                '150',
                'Electronics',
                'Spark Cables',
                'Coil',
                'High quality copper wire cable for household and industrial usage.'
            ],
            [
                'Guruz Premium Extension Socket 5M',
                'GRZ-EXT-5M',
                '1200.00',
                '990.00',
                '750.00',
                '80',
                'Home Appliance',
                'Guruz',
                'Pcs',
                'Heavy-duty multi-plug extension socket with surge protector.'
            ]
        ];

        $callback = function () use ($columns, $sampleRows) {
            $file = fopen('php://output', 'w');
            // Write UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, $columns);

            foreach ($sampleRows as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function uploadCsv(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|max:10240', // Max 10MB
        ]);

        $user = Auth::user();
        $shop = Shop::firstOrCreate(
            ['user_id' => $user->id],
            [
                'name'        => ($user->name ?? 'Vendor') . "'s Shop",
                'slug'        => Str::slug(($user->name ?? 'Vendor') . "-shop-" . $user->id),
                'status'      => 'pending',
                'is_approved' => false,
            ]
        );
        $shop->loadMissing('kyc');
        $isKycApproved = ($shop->kyc && strtolower($shop->kyc->status) === 'approved')
            || in_array($user->role ?? '', ['admin', 'super_admin', 'superadmin'])
            || ($user->hasRole && $user->hasRole('admin'));

        $shopId = $shop->id;
        $file = $request->file('csv_file');
        $path = $file->getRealPath();

        $handle = fopen($path, 'r');
        if (!$handle) {
            return redirect()->back()->with('error', 'Unable to read the uploaded file.');
        }

        // Read first row as header and trim UTF-8 BOM
        $rawHeaders = fgetcsv($handle);
        if (!$rawHeaders || empty(array_filter($rawHeaders))) {
            fclose($handle);
            return redirect()->back()->with('error', 'CSV file is empty or missing header row.');
        }

        // Strip BOM from first column header if present
        $rawHeaders[0] = preg_replace('/^\xEF\xBB\xBF/', '', $rawHeaders[0]);

        $headers = array_map(function($h) {
            return strtolower(trim(preg_replace('/[^a-zA-Z0-9\(\)\s_\-]/', '', $h)));
        }, $rawHeaders);

        $importedCount = 0;
        $skippedCount = 0;

        while (($row = fgetcsv($handle)) !== false) {
            if (empty(array_filter($row))) {
                continue; // skip empty lines
            }

            // Create dictionary safely
            $data = [];
            foreach ($headers as $index => $headerKey) {
                if (isset($row[$index])) {
                    $data[$headerKey] = trim($row[$index]);
                }
            }

            // Match product name
            $name = $data['product name'] ?? $data['name'] ?? $data['title'] ?? $data['product_name'] ?? null;
            if (!$name) {
                // Fallback to first non-empty column if valid text
                if (!empty($row[0])) {
                    $name = trim($row[0]);
                } else {
                    $skippedCount++;
                    continue;
                }
            }

            $sku = !empty($data['sku']) ? $data['sku'] : 'SKU-' . strtoupper(Str::random(8));

            // Raw prices
            $rawPrice = $data['price (bdt)'] ?? $data['price'] ?? $data['price_bdt'] ?? (isset($row[2]) ? $row[2] : '0');
            $price = floatval(preg_replace('/[^0-9\.]/', '', $rawPrice));

            $rawSalePrice = $data['sale price (bdt)'] ?? $data['sale price'] ?? $data['sale_price'] ?? (isset($row[3]) ? $row[3] : null);
            $salePrice = ($rawSalePrice && floatval(preg_replace('/[^0-9\.]/', '', $rawSalePrice)) > 0) 
                ? floatval(preg_replace('/[^0-9\.]/', '', $rawSalePrice)) 
                : $price;

            $rawPurchasePrice = $data['purchase price (bdt)'] ?? $data['purchase price'] ?? $data['purchase_price'] ?? (isset($row[4]) ? $row[4] : null);
            $purchasePrice = ($rawPurchasePrice && floatval(preg_replace('/[^0-9\.]/', '', $rawPurchasePrice)) > 0)
                ? floatval(preg_replace('/[^0-9\.]/', '', $rawPurchasePrice))
                : ($price * 0.7);

            $rawStock = $data['stock quantity'] ?? $data['stock'] ?? $data['quantity'] ?? (isset($row[5]) ? $row[5] : '10');
            $stock = intval(preg_replace('/[^0-9]/', '', $rawStock));

            $description = $data['description'] ?? (isset($row[9]) ? $row[9] : 'No description provided.');
            $unitName = $data['unit'] ?? (isset($row[8]) ? $row[8] : 'Pcs');

            // Ensure SKU is unique or update existing shop product
            $baseSku = $sku;
            while (Product::where('sku', $sku)->exists()) {
                $existingProduct = Product::where('sku', $sku)->first();
                if ($existingProduct && $existingProduct->shop_id == $shopId && strtolower(trim($existingProduct->name)) === strtolower(trim($name))) {
                    $existingProduct->update([
                        'price'          => $price,
                        'sale_price'     => $salePrice,
                        'purchase_price' => $purchasePrice,
                        'stock_quantity' => $existingProduct->stock_quantity + $stock,
                        'description'    => $description,
                        'unit'           => $unitName,
                    ]);
                    $importedCount++;
                    continue 2;
                }
                $sku = $baseSku . '-' . strtoupper(Str::random(4));
            }

            // Resolve Category
            $categoryName = $data['category'] ?? (isset($row[6]) ? $row[6] : 'General');
            $category = Category::where('name', 'like', "%{$categoryName}%")->first();
            $categoryId = $category ? $category->id : null;

            // Resolve Brand
            $brandName = $data['brand'] ?? (isset($row[7]) ? $row[7] : 'Generic');
            $brand = Brand::where('name', 'like', "%{$brandName}%")->first();
            $brandId = $brand ? $brand->id : null;

            Product::create([
                'shop_id'        => $shopId,
                'category_id'    => $categoryId,
                'brand_id'       => $brandId,
                'name'           => $name,
                'slug'           => Str::slug($name) . '-' . uniqid(),
                'sku'            => $sku,
                'price'          => $price,
                'sale_price'     => $salePrice,
                'purchase_price' => $purchasePrice,
                'stock_quantity' => $stock,
                'description'    => $description,
                'unit'           => $unitName,
                'is_active'      => $isKycApproved,
                'status'         => $isKycApproved ? 'published' : 'draft',
            ]);

            $importedCount++;
        }

        fclose($handle);

        $msg = $isKycApproved 
            ? "Successfully imported {$importedCount} products into your shop inventory!"
            : "সফলভাবে {$importedCount}টি পণ্য ড্রাফট হিসেবে ইম্পোর্ট হয়েছে। আপনার কেওয়াইসি ভেরিফিকেশন সুপার অ্যাডমিন দ্বারা সম্পন্ন হলে পণ্যগুলো স্বয়ংক্রিয়ভাবে পাবলিক হবে।";

        return redirect()->back()->with('success', $msg);
    }
}
