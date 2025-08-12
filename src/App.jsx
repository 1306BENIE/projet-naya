
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from "./components/Navbar/Navbar";
import Rapide from "./components/Rapide/Rapide";
import AuthModal from './components/Navbar/AuthModal';
import EspaceClient from './components/Rapide/EspaceClient';
import ManagerDashboard from './components/Manager/ManagerDashboard';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUserData(null);
    navigate('/');
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('userData');
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user._id) {
          setIsLoggedIn(true);
          setUserData(user);
          
          // Redirection basée sur le rôle
          if (user.role === 'admin') {
            navigate('/admin'); // Redirection admin
          } else if (user.role === 'manager') {
            navigate('/manager');
          } else {
            navigate('/espace-client');
          }
        }
      } catch (e) {
        console.error("Erreur parsing user data", e);
        handleLogout();
      }
    }
  }, [navigate]);

  const handleLoginSuccess = (user) => {
    localStorage.setItem('authToken', user.token);
    localStorage.setItem('userData', JSON.stringify(user));
    setUserData(user);
    setIsLoggedIn(true);
    setShowAuthModal(false);
    
    // Redirection après connexion
    if (user.role === 'admin') {
      navigate('/admin'); // Redirection admin
    } else if (user.role === 'manager') {
      navigate('/manager');
    } else {
      navigate('/espace-client');
    }
  };

  const handleOpenAuthModal = (isNewUser) => {
    setAuthModalType(isNewUser);
    setShowAuthModal(true);
  };

  const hideNavbar = location.pathname === '/espace-client' || 
                     location.pathname.startsWith('/manager') ||
                     location.pathname.startsWith('/admin'); // Ajout de /admin

  return (
    <div>
      {!hideNavbar && (
        <Navbar 
          isLoggedIn={isLoggedIn} 
          onLoginClick={handleOpenAuthModal}
          onLogout={handleLogout}
        />
      )}
      
      <Routes>
        <Route path="/manager" element={<ManagerDashboard onLogout={handleLogout}/>}/>
        <Route path="/espace-client" element={<EspaceClient user={userData} onLogout={handleLogout}/>} />
        <Route path="/" element={
          <>
            <Rapide onLoginClick={handleOpenAuthModal} />
          </>
        } />
      </Routes>
      
      <AuthModal 
        showModal={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        isNewUser={authModalType}
        setIsNewUser={setAuthModalType}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;