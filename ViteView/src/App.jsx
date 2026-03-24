import React, { useState } from 'react';
import DashboardOwners from './components/DashboardOwners';
import DashboardCalendar from './components/DashboardCalendar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUsers, faBoxOpen, faDog } from '@fortawesome/free-solid-svg-icons';
import DashboardInventory from './components/DashboardInventory';

function App() {
  const [currentView, setCurrentView] = useState('owners');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar Simple */}
      <nav className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faDog} /> VetManager
          </h1>
          <div className="flex space-x-4">
            <button 
              onClick={() => setCurrentView('owners')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${currentView === 'owners' ? 'bg-indigo-800 font-bold' : 'hover:bg-indigo-600'}`}
            >
              <FontAwesomeIcon icon={faUsers} /> Clientes
            </button>
            <button 
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${currentView === 'calendar' ? 'bg-indigo-800 font-bold' : 'hover:bg-indigo-600'}`}
            >
              <FontAwesomeIcon icon={faCalendarAlt} /> Calendario
            </button>
            <button 
              onClick={() => setCurrentView('inventory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${currentView === 'inventory' ? 'bg-indigo-800 font-bold' : 'hover:bg-indigo-600'}`}
            >
              <FontAwesomeIcon icon={faBoxOpen} /> Inventario
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full mt-6 pb-10">
        <div className="max-w-7xl mx-auto w-full px-4">
          {currentView === 'owners' && <DashboardOwners />}
          {currentView === 'calendar' && <DashboardCalendar />}
          {currentView === 'inventory' && <DashboardInventory />}
        </div>
      </main>
    </div>
  )
}

export default App;