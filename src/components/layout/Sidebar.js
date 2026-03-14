import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/', label: 'Products', icon: '▦', exact: true },
  { path: '/search', label: 'Search', icon: '⌕' },
  { path: '/products/add', label: 'Add Product', icon: '+', accent: true },
  { path: '/categories', label: 'Categories', icon: '⊞' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-mark">P</span>
        <div>
          <div className="logo-name">ProductOS</div>
          <div className="logo-sub">Admin Panel</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `nav-item${isActive ? ' active' : ''}${item.accent ? ' nav-accent' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-dot" />
        <span>API Connected</span>
      </div>
    </aside>
  );
};

export default Sidebar;
