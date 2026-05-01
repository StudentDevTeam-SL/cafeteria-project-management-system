import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

/**
 * Shared authenticated layout — sidebar + topbar + scrollable main content.
 */
export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Navbar />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div className="page-content animate-fadeUp">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
