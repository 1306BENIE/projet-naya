
import React, { useState, useEffect, useRef } from "react";
import Logo from "../../assets/naya.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUser, 
  FaChevronDown, 
  FaSignInAlt, 
  FaUserPlus, 
  FaTimes, 
  FaSignOutAlt,
  FaCashRegister
} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const SlideDown = (delay) => {
  return {
    initial: { opacity: 0, y: -20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { 
        delay, 
        duration: 0.5, 
        ease: "easeOut",
        type: "spring",
        stiffness: 120,
        damping: 15
      },
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { 
        duration: 0.3, 
        ease: "easeIn" 
      } 
    },
  };
};

const Navbar = ({ isLoggedIn, onLoginClick, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser && storedUser !== "undefined") {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);
      } catch (e) {
        console.error("Erreur parsing user data in Navbar", e);
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const goToManager = () => {
    navigate('/manager');
    setDropdownOpen(false);
  };

  return (
    <>
      <motion.div 
        className={`fixed w-full top-0 z-50 transition-all duration-400 ${
          scrolled 
            ? "bg-white shadow-lg py-0" 
            : "bg-gradient-to-b from-white to-emerald-50/80 py-2"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 0.6, 
                delay: 0.3,
                rotate: { 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatType: "reverse" 
                }
              }}
              className="relative"
            >
              <motion.img
                src={Logo}
                alt="Logo NAYA"
                className="w-12 h-12 object-contain rounded-full border-2 border-emerald-500"
              />
              <motion.div 
                className="absolute inset-0 rounded-full bg-emerald-400/20"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.3, 0.5]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity 
                }}
              />
            </motion.div>
            
            <motion.span
              className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-500"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              NAYA
            </motion.span>
          </motion.div>

          <div className="flex items-center gap-4">
            {isLoggedIn && userData && (userData.role === 'manager' || userData.role === 'admin') && (
              <motion.button
                variants={SlideDown(0.4)}
                initial="initial"
                animate="animate"
                className={`
                  flex items-center gap-2
                  ${scrolled ? "bg-emerald-50" : "bg-white"}
                  text-gray-700 font-medium py-2.5 px-4
                  rounded-xl shadow-sm
                  transition-all duration-300
                  border border-emerald-200
                  hover:shadow-md hover:border-emerald-400
                  focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75
                `}
                onClick={goToManager}
                whileHover={{ 
                  backgroundColor: "#f0fdf4",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.15)"
                }}
                whileTap={{ scale: 0.97 }}
              >
                <FaCashRegister className="text-emerald-600" />
                <span>Caisse</span>
              </motion.button>
            )}

            <div className="relative" ref={dropdownRef}>
              <motion.button
                variants={SlideDown(0.4)}
                initial="initial"
                animate="animate"
                className={`
                  flex items-center gap-2
                  ${scrolled ? "bg-emerald-50" : "bg-white"}
                  text-gray-700 font-medium py-2.5 px-4
                  rounded-xl shadow-sm
                  transition-all duration-300
                  border border-emerald-200
                  hover:shadow-md hover:border-emerald-400
                  focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75
                `}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                whileHover={{ 
                  backgroundColor: "#f0fdf4",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.15)"
                }}
                whileTap={{ scale: 0.97 }}
              >
                <FaUser className="text-emerald-600" />
                <span>{userData ? "Mon compte" : "Compte"}</span>
                <motion.div
                  animate={{ rotate: dropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronDown className="text-emerald-500" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ 
                      duration: 0.2, 
                      type: "spring", 
                      stiffness: 300 
                    }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 ring-1 ring-emerald-100 overflow-hidden"
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-white to-emerald-50 z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                    
                    {isLoggedIn && userData ? (
                      <>
                        <div className="px-4 py-3 border-b border-emerald-100">
                          <div className="text-sm font-semibold text-emerald-700 truncate">
                            {userData.phone}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            {userData.role === 'manager' && (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs ml-2">
                                Manager
                              </span>
                            )}
                            {/* {userData.role === 'admin' && (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs ml-2">
                                Admin
                              </span>
                            )} */}
                          </div>
                        </div>

                        <motion.button
                          className="
                            relative z-10
                            flex items-center gap-3 w-full px-4 py-3
                            text-sm font-medium text-gray-700 hover:bg-emerald-50/80
                            transition-all duration-200
                          "
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onLogout();
                            setDropdownOpen(false);
                          }}
                        >
                          <motion.div
                            className="p-2 bg-red-100 rounded-lg"
                            whileHover={{ rotate: -5 }}
                          >
                            <FaSignOutAlt className="text-red-600 text-lg" />
                          </motion.div>
                          <div className="text-left">
                            <div className="font-semibold">Déconnexion</div>
                            <div className="text-xs text-red-600 mt-0.5">Quitter la session</div>
                          </div>
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          className="
                            relative z-10
                            flex items-center gap-3 w-full px-4 py-3
                            text-sm font-medium text-gray-700 hover:bg-emerald-50/80
                            transition-all duration-200
                          "
                          onClick={() => onLoginClick(true)}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.div
                            className="p-2 bg-emerald-100 rounded-lg"
                            whileHover={{ rotate: 10 }}
                          >
                            <FaUserPlus className="text-emerald-600 text-lg" />
                          </motion.div>
                          <div className="text-left">
                            <div className="font-semibold">Créer un compte</div>
                            <div className="text-xs text-emerald-600 mt-0.5">Commencez votre aventure</div>
                          </div>
                        </motion.button>

                        <div className="border-b border-emerald-100 my-1" />

                        <motion.button
                          className="
                            relative z-10
                            flex items-center gap-3 w-full px-4 py-3
                            text-sm font-medium text-gray-700 hover:bg-emerald-50/80
                            transition-all duration-200
                          "
                          onClick={() => onLoginClick(false)}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.div
                            className="p-2 bg-blue-100 rounded-lg"
                            whileHover={{ rotate: -10 }}
                          >
                            <FaSignInAlt className="text-blue-600 text-lg" />
                          </motion.div>
                          <div className="text-left">
                            <div className="font-semibold">Se connecter</div>
                            <div className="text-xs text-blue-600 mt-0.5">Accédez à votre espace</div>
                          </div>
                        </motion.button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Navbar;