import { Card } from 'primereact/card';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import List from './treelist/list';
import Table from './table/table';
import Navbar from './navbar/navbar';
import './App.css'; // CSS dosyasını import ediyoruz
import { Button } from 'primereact/button'; // PrimeReact butonu

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="navbar-container">
          <Navbar />
        </div>

        <div className="main-content">
          <div className="sidebar">
            <Card className="sidebar-card">
              <h3 className="sidebar-title">Navigasyon</h3>
              <div className="sidebar-links">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                >
                  <Button className="p-button-text sidebar-button">
                    <i className="pi pi-list mr-2" />
                    Liste Görünümü
                  </Button>
                </NavLink>

                <NavLink
                  to="/tasks"
                  className={({ isActive }) =>
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                >
                  <Button className="p-button-text sidebar-button">
                    <i className="pi pi-table mr-2" />
                    Tablo Görünümü
                  </Button>
                </NavLink>
              </div>
            </Card>
          </div>

          <div className="content-area">
            <Card className="content-card">
              <Routes>
                <Route path="/" element={<List />} />
                <Route path="/tasks" element={<Table />} />
              </Routes>
            </Card>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
