<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use App\Models\Owner;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback()
    {
        try {
            // Desactivar verificación SSL temporalmente para evitar el fallo cURL 60 típico de XAMPP local en Windows
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->setHttpClient(new \GuzzleHttp\Client(['verify' => false]))
                ->user();
            
            // Comprobar si el usuario existe por email
            $user = User::where('email', $googleUser->getEmail())->first();
            
            if (!$user) {
                // Crear usuario si no existe, asignando rol client por defecto
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'role' => 'client',
                    'password' => null // La migración permite nulos
                ]);
            } else {
                // Actualizar google_id si lo está enlazando ahora
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            }

            // Generar token Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirigir al frontend pasando el token por la URL
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect()->away($frontendUrl . '/auth/callback?token=' . $token);

        } catch (\Exception $e) {
            \Log::error('Fallo en Google Auth: ' . $e->getMessage());
            return redirect()->away(env('FRONTEND_URL', 'http://localhost:5173') . '/login?error=' . urlencode($e->getMessage()));
        }
    }
}
