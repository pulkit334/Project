import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">SocialApp</Link>
        <div className="navbar-right">
          <Link to={`/profile/${user?.id}`} className="navbar-user">
            <div className="avatar-small">{user?.username?.[0]?.toUpperCase()}</div>
            <span>{user?.username}</span>
          </Link>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
