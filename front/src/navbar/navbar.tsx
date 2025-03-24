import { Menubar } from 'primereact/menubar';
import { InputText } from 'primereact/inputtext';
import './navbar.css';

export default function Navbar() {
  const start = (
    <div className="navbar-brand">
      <i className="pi pi-prime brand-icon"></i>
      <span className="brand-name">Signum</span>
    </div>
  );

  const end = (
    <div className="navbar-end">
      <span className="p-input-icon-left search-box">
        <i className="pi pi-search" />
        <InputText placeholder="Ara..." />
      </span>
      <div className="user-profile">
        <span className="notification-badge">
          <i className="pi pi-bell"></i>
          <span className="badge">3</span>
        </span>
        <div className="avatar">
          <i className="pi pi-user"></i>
        </div>
      </div>
    </div>
  );

  return (
    <div className="navbar-wrapper">
      <Menubar start={start} end={end} className="main-navbar" />
    </div>
  );
}
