import React, { useState, useEffect } from 'react';
import api from './api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUsers, faBoxOpen, faDog, faHome, faSignOutAlt, faUserShield } from '@fortawesome/free-solid-svg-icons';

import Login from './components/Login';
import DashboardOwners from './components/DashboardOwners';
import DashboardCalendar from './components/DashboardCalendar';
import DashboardHome from './components/DashboardHome';
import DashboardInventory from './components/DashboardInventory';
import DashboardPortalCliente from './components/DashboardPortalCliente';
import DashboardUsers from './components/DashboardUsers';

// FASE 6: App Principal con Router Dinámico de Roles y Sesión Persistente
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');

  // Recuperar sesión persistente si existe en localStorage al recargar (F5) o tras OAuth
  useEffect(() => {
    // Interceptar Token OAuth devuelto por Google en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');

    if (oauthToken) {
      // Limpiar parámetros de la URL tras autenticación OAuth
      window.history.replaceState({}, document.title, window.location.pathname);

      // Petición a la API para obtener los datos del usuario autenticado
      api.get('/user', {
        headers: { Authorization: `Bearer ${oauthToken}` }
      }).then(res => {
        handleLoginSuccess(res.data, oauthToken);
      }).catch(err => console.error("Error validando token OAuth", err));

      return;
    }

    const savedToken = localStorage.getItem('vet_token');
    const savedUser = localStorage.getItem('vet_user');
    if (savedToken && savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Manejador de inicio de sesión exitoso
  const handleLoginSuccess = (user, token) => {
    localStorage.setItem('vet_token', token);
    localStorage.setItem('vet_user', JSON.stringify(user));
    setCurrentUser(user);
    setCurrentView('home');
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (e) { console.error('Logout falló o el token expiró remotamente'); }
    localStorage.removeItem('vet_token');
    localStorage.removeItem('vet_user');
    setCurrentUser(null);
  };

  // Control de acceso: Renderizar componente Login si no hay sesión activa
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // --- Router de permisos según ROL (FASE 6) ---
  const isClient = currentUser.role === 'client';

  // Control de acceso por rol: Redireccionar clientes a su portal específico
  if (isClient) {
    // Renderizar Dashboard del cliente
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navegación para el perfil de cliente */}
        <nav className="bg-white p-4 shadow-sm z-10 sticky top-0 flex justify-between items-center px-8 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 text-xs rounded-lg">
              <FontAwesomeIcon icon={faDog} />
            </div>
            <span className="font-bold text-gray-800 tracking-tight">Portal del Cliente</span>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition font-bold text-sm bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-red-50">
            Cerrar Sesión <FontAwesomeIcon icon={faSignOutAlt} className="ml-1" />
          </button>
        </nav>

        <main className="flex-1 w-full mt-6 pb-10 px-4">
          <DashboardPortalCliente currentUser={currentUser} onLogout={handleLogout} />
        </main>
      </div>
    );
  }

  // Renderizar interfaz administrativa para roles Veterinario y Recepcionista
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-indigo-700 text-white p-4 shadow-md z-10 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faDog} /> Mmartin Clínica Veterinaria
          </h1>

          <div className="flex space-x-1 sm:space-x-3 items-center">
            {/* Indicador visual de la sesión actual */}
            <span className="hidden lg:inline mr-4 bg-indigo-800/50 px-3 py-1 rounded-full text-indigo-200 text-xs font-bold uppercase tracking-wider">
              Online:{currentUser.name.split(' ')[0]}
            </span>

            <button onClick={() => setCurrentView('home')} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${currentView === 'home' ? 'bg-indigo-800 font-bold' : 'hover:bg-indigo-600 text-sm'}`}>
              <FontAwesomeIcon icon={faHome} /> <span className="hidden md:inline">Inicio</span>
            </button>

            {/* Restricción de acceso: Módulo de Personal solo visible para rol Veterinario */}
            {currentUser.role === 'veterinario' && (
              <button onClick={() => setCurrentView('users')} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${currentView === 'users' ? 'bg-indigo-800 font-bold text-orange-200' : 'hover:bg-indigo-600 text-sm text-orange-100 hover:text-white'}`}>
                <FontAwesomeIcon icon={faUserShield} /> <span className="hidden md:inline">Personal</span>
              </button>
            )}

            <button onClick={() => setCurrentView('owners')} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${currentView === 'owners' ? 'bg-indigo-800 font-bold' : 'hover:bg-indigo-600 text-sm'}`}>
              <FontAwesomeIcon icon={faUsers} /> <span className="hidden md:inline">Clientes</span>
            </button>
            <button onClick={() => setCurrentView('calendar')} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${currentView === 'calendar' ? 'bg-indigo-800 font-bold' : 'hover:bg-indigo-600 text-sm'}`}>
              <FontAwesomeIcon icon={faCalendarAlt} /> <span className="hidden md:inline">Calendario</span>
            </button>
            <button onClick={() => setCurrentView('inventory')} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${currentView === 'inventory' ? 'bg-indigo-800 font-bold' : 'hover:bg-indigo-600 text-sm'}`}>
              <FontAwesomeIcon icon={faBoxOpen} /> <span className="hidden md:inline">Inventario</span>
            </button>

            {/* Botón de cierre de sesión seguro */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition bg-red-500 hover:bg-red-600 text-white ml-2 md:ml-4 font-bold border-b-4 border-red-700 active:translate-y-1 active:border-b-0 text-sm shadow-sm"
              title="Cerrar sesión de administrador"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full mt-6 pb-10">
        <div className="max-w-7xl mx-auto w-full px-4">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-forwards">
            {currentView === 'home' && <DashboardHome onNavigate={setCurrentView} />}
            {currentView === 'users' && currentUser.role === 'veterinario' && <DashboardUsers />}
            {currentView === 'owners' && <DashboardOwners />}
            {currentView === 'calendar' && <DashboardCalendar />}
            {currentView === 'inventory' && <DashboardInventory />}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App;