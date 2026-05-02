<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Owner;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class MigrateOwners extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:migrate-owners';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Creates user logins for existing older owners in the system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $owners = Owner::all();
        $count = 0;

        foreach ($owners as $owner) {
            $user = User::firstOrCreate(
                ['email' => $owner->email],
                [
                    'name' => $owner->name,
                    'password' => Hash::make('password123'),
                    'role' => 'client'
                ]
            );
            if ($user->wasRecentlyCreated) {
                $count++;
            }
        }

        $this->info("Successfully migrated $count old clients to the User table.");
    }
}
