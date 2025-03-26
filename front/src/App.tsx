import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
} from 'react-router-dom';
import { useEffect } from 'react';
import List from './treelist/list';
import Table from './table/table';
import Navbar from './navbar/navbar';
import { KanbanBoard } from './kanban/components/KanbanBoard';
import { Button } from 'primereact/button';
import { socket } from './socket';
import styles from './App.module.css';

const RouteBased = () => {
  const location = useLocation();

  return (
    <div className={styles.layoutWrapper}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <div className="mb-4">
            <div className="mb-2 px-3">
              <NavLink to="/" className="block">
                <span className="text-m font-bold text-gray-700 uppercase tracking-wider hover:text-primary cursor-pointer transition-colors">
                  Ana Menü
                </span>
              </NavLink>
            </div>
            <div className="flex flex-col space-y-1">
              {[
                { to: '/list', label: 'Liste Görünümü', icon: 'pi-th-large' },
                { to: '/tasks', label: 'Tablo Görünümü', icon: 'pi-table' },
                {
                  to: '/kanban',
                  label: 'Kanban Tahtası',
                  icon: 'pi-sliders-h',
                },
              ].map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `rounded-lg overflow-hidden relative ${
                      isActive
                        ? 'bg-gradient-to-r from-primary to-primary-700'
                        : ''
                    }`
                  }
                >
                  <Button
                    className={`w-full justify-start px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname === to
                        ? 'text-blue font-semibold'
                        : 'text-gray-700 hover:text-primary hover:translate-x-1'
                    }`}
                    text
                  >
                    <i className={`pi ${icon} mr-2`} />
                    <span>{label}</span>
                  </Button>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.mainContentInner}>
          <Routes>
            <Route path="/" />
            <Route path="/list" element={<List />} />
            <Route path="/tasks" element={<Table />} />
            <Route path="/kanban" element={<KanbanBoard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      console.log('bağlantı cruldu');
    }

    return () => {
      if (socket.connected) {
        socket.disconnect();
        console.log('bağlantı gitti');
      }
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="sticky top-0 z-10 mb-4">
          <Navbar />
        </div>
        <RouteBased />
      </div>
    </BrowserRouter>
  );
}
