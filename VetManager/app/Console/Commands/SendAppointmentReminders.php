<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;
use App\Mail\AppointmentReminder;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SendAppointmentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía correos de recordatorio para las citas de mañana';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tomorrow = Carbon::tomorrow()->toDateString();
        
        $appointments = Appointment::with('owner')
            ->whereDate('start_time', $tomorrow)
            ->where('status', 'scheduled')
            ->get();

        $count = 0;
        foreach ($appointments as $appointment) {
            if ($appointment->owner && $appointment->owner->email) {
                Mail::to($appointment->owner->email)->send(new AppointmentReminder($appointment));
                $count++;
            }
        }

        $this->info("Se han enviado {$count} recordatorios para el día {$tomorrow}.");
    }
}
