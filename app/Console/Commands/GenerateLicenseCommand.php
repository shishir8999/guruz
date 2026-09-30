<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\LicenseService;

class GenerateLicenseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'license:generate 
                            {domain? : The target domain to lock this license to (e.g. clientdomain.com)} 
                            {email? : Your Master Gmail address}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a domain-locked cryptographic license key tied to your Gmail';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $domain = $this->argument('domain');
        if (!$domain) {
            $domain = $this->ask('Enter the target domain (e.g. clientdomain.com)');
        }

        $email = $this->argument('email');
        if (!$email) {
            $email = $this->ask('Enter your Master Gmail address (e.g. yourname@gmail.com)');
        }

        if (empty($domain) || empty($email)) {
            $this->error('Both domain and Master Gmail are required!');
            return 1;
        }

        $cleanDomain = LicenseService::normalizeDomain($domain);
        $cleanEmail = strtolower(trim($email));

        $key = LicenseService::generateKey($cleanDomain, $cleanEmail);

        $this->info('');
        $this->info('========================================================================');
        $this->info('       🛡️  GURUZ DOMAIN-LOCKED SOFTWARE LICENSE GENERATOR');
        $this->info('========================================================================');
        $this->line(" 🔒 Registered Domain : <fg=cyan;options=bold>{$cleanDomain}</>");
        $this->line(" 📧 Master Owner Gmail : <fg=yellow;options=bold>{$cleanEmail}</>");
        $this->line(" 🔑 Single-Domain Key : <fg=green;options=bold>{$key}</>");
        $this->info('========================================================================');
        $this->info(" This license key will ONLY work on {$cleanDomain}.");
        $this->info(" If this source code is copied or moved to ANY other domain/cPanel,");
        $this->info(" it will immediately lock and require a new key issued by your Gmail.");
        $this->info('========================================================================');
        $this->info('');

        return 0;
    }
}
