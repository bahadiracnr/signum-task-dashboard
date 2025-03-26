import { Menubar } from 'primereact/menubar';
import { InputText } from 'primereact/inputtext';
import styles from './navbar.module.css';

export default function Navbar() {
  const start = (
    <div className={styles.navbarBrand}>
      <i className={`pi pi-prime ${styles.brandIcon}`}></i>
      <span className={styles.brandName}>Signum</span>
    </div>
  );

  const end = (
    <div className={styles.navbarEnd}>
      <span className={`p-input-icon-left ${styles.searchBox}`}>
        <i className="pi pi-search" />
        <InputText placeholder="Ara..." />
      </span>
      <div className={styles.userProfile}>
        <span className={styles.notificationBadge}>
          <i className="pi pi-bell"></i>
          <span className={styles.badge}>3</span>
        </span>
        <div className={styles.avatar}>
          <i className="pi pi-user"></i>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.navbarWrapper}>
      <Menubar start={start} end={end} className={styles.mainNavbar} />
    </div>
  );
}
