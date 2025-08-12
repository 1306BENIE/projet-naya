
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  motion, 
  AnimatePresence 
} from 'framer-motion';
import { 
  FaTimes,
  FaCheck,
  FaMoneyCheckAlt,
  FaMapMarkerAlt,
  FaUserTie,
  FaInbox,
  FaBox,
  FaBell,
  FaChevronDown,
  FaUserCircle,
  FaInfoCircle,
  FaTrash,
  FaTrashRestore,
  FaSync,
  FaClock
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/manager';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

const ManagerDashboard = ({ onLogout }) => {
  const [managerName, setManagerName] = useState('Manager');
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [inboxItems, setInboxItems] = useState([]);
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customPrices, setCustomPrices] = useState({});
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [notifications, setNotifications] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedInboxItem, setSelectedInboxItem] = useState(null);
  
  const navigate = useNavigate();
  const notificationSound = useRef(null);
  
  useEffect(() => {
    const storedName = localStorage.getItem('managerName') || 'Manager';
    setManagerName(storedName);
    
    try {
      notificationSound.current = new Audio('/notification.mp3');
    } catch (e) {
      console.warn("Erreur d'initialisation audio", e);
    }
    
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    
    fetchAllData();
    
    const refreshInterval = setInterval(fetchAllData, 30000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(refreshInterval);
    };
  }, []);

  const fetchAllData = () => {
    fetchPendingOrders();
    fetchInbox();
    fetchTrash();
  };

  const playNotificationSound = () => {
    if (notificationSound.current && soundEnabled) {
      try {
        notificationSound.current.currentTime = 0;
        notificationSound.current.play().catch(e => console.log("Lecture du son échouée", e));
      } catch (e) {
        console.warn("Erreur de lecture audio", e);
      }
    }
  };

  const fetchPendingOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/orders/pending`);
      const sortedOrders = [...response.data].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setPendingOrders(sortedOrders);
      setPendingOrdersCount(sortedOrders.length);
      
      if (sortedOrders.length > pendingOrders.length) {
        playNotificationSound();
      }
    } catch (err) {
      setError('Erreur de chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const fetchInbox = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/inbox`);
      const sortedInbox = [...response.data].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setInboxItems(sortedInbox);
      setNotifications(sortedInbox.length);
      
      if (sortedInbox.length > inboxItems.length) {
        playNotificationSound();
      }
    } catch (err) {
      setError('Erreur de chargement de la boîte de réception');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/trash`);
      setTrashItems(response.data);
    } catch (err) {
      console.error('Erreur chargement corbeille:', err);
      let errorMsg = "Erreur chargement corbeille";
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMsg = "Endpoint corbeille introuvable";
        } else {
          errorMsg = err.response.data.error || errorMsg;
        }
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  const showSuccessToast = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  const cancelOrder = async (orderId) => {
    const reason = prompt("Veuillez indiquer la raison de l'annulation:");
    if (reason === null) return;
    
    setLoading(true);
    setError('');
    try {
      await axios.patch(`${API_URL}/orders/${orderId}/cancel`, { reason });
      
      const canceledOrder = pendingOrders.find(order => order._id === orderId);
      if (canceledOrder) {
        const newInboxItem = {
          type: 'commande',
          action: 'annulation',
          commandeId: canceledOrder.commandeId,
          client: canceledOrder.expedition?.nomComplet || 'Client inconnu',
          date: new Date().toISOString(),
          details: `Commande annulée par le manager - Motif: ${reason}`
        };
        await axios.post(`${API_URL}/inbox`, newInboxItem);
      }
      
      setPendingOrders(prev => prev.filter(order => order._id !== orderId));
      setPendingOrdersCount(prev => prev - 1);
      
      fetchInbox();
      showSuccessToast("Commande annulée avec succès!");
    } catch (err) {
      setError('Erreur lors de l\'annulation de la commande');
    } finally {
      setLoading(false);
    }
  };
  const validateOrderWithPrice = async (orderId) => {
    const price = customPrices[orderId];
    
    // Validation améliorée
    if (!price || isNaN(price) || Number(price) <= 500) {
      toast.error("Prix invalide! Minimum 500 FCFA");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/validate`, 
        { price: Number(price) }
      );

      // Mise à jour optimiste de l'UI
      setPendingOrders(prev => prev.filter(order => order._id !== orderId));
      setPendingOrdersCount(prev => prev - 1);
      setSelectedOrder(null);
      
      // Notification de succès
      showSuccessToast("Commande validée avec succès!");
      
      // Rafraîchir les données
      fetchInbox();
      
    } catch (err) {
      console.error("Validation error:", err.response?.data || err.message);
      
      // Gestion d'erreur détaillée
      const errorMsg = err.response?.data?.error || 
                      "Erreur lors de la validation. Veuillez réessayer.";
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const moveToTrash = async (item, type) => {
    if (!window.confirm(`Déplacer dans la corbeille ?`)) return;
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/move-to-trash`, {
        itemId: item._id,
        itemType: type
      });
  
      if (type === 'inbox') {
        setInboxItems(prev => prev.filter(i => i._id !== item._id));
        setNotifications(prev => prev - 1);
      } else if (type === 'commande') {
        setPendingOrders(prev => prev.filter(o => o._id !== item._id));
        setPendingOrdersCount(prev => prev - 1);
      }
      
      await fetchTrash();
      showSuccessToast("Élément déplacé dans la corbeille");
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors de la suppression");
      toast.error("Erreur déplacement corbeille");
    } finally {
      setLoading(false);
    }
  };

  const restoreFromTrash = async (itemId) => {
    setLoading(true);
    try {
      await axios.patch(`${API_URL}/trash/${itemId}/restore`);
      fetchAllData(); 
      showSuccessToast("Élément restauré avec succès!");
    } catch (err) {
      setError("Erreur lors de la restauration");
      toast.error("Erreur lors de la restauration");
    } finally {
      setLoading(false);
    }
  };

  const emptyTrash = async () => {
    if (!window.confirm("Vider définitivement la corbeille? Cette action est irréversible.")) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/trash`);
      setTrashItems([]);
      showSuccessToast("Corbeille vidée avec succès!");
    } catch (err) {
      setError("Erreur lors de la suppression définitive");
      toast.error("Erreur lors de la suppression définitive");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Date non spécifiée";
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Date invalide";
      }
      
      const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('fr-FR', options);
    } catch (e) {
      console.error("Erreur de formatage de date", e);
      return "Date invalide";
    }
  };
  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingOrders();
    } else if (activeTab === 'inbox') {
      fetchInbox();
    } else if (activeTab === 'trash') {
      fetchTrash();
    }
  }, [activeTab]);

  const handleStartClick = () => {
    setShowWelcome(false);
    setSoundEnabled(true);
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    if (!customPrices[order._id]) {
      setCustomPrices({
        ...customPrices,
        [order._id]: order.estimatedPrice || ''
      });
    }
  };

  const openInboxModal = (item) => {
    setSelectedInboxItem(item);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-screen bg-gradient-to-b from-gray-50 to-gray-100"
    >
      <ToastContainer />
      
      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="text-emerald-700">
            {showMobileMenu ? <FaTimes size={24} /> : <FaChevronDown size={24} />}
          </button>
          <h1 className="text-xl font-bold text-emerald-700">Espace Manager</h1>
          <div className="relative">
            <FaBell className="text-emerald-700" size={20} />
            {notifications > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {notifications}
              </span>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white overflow-hidden"
            >
              <div className="flex flex-col py-2">
                <button
                  className={`flex items-center px-4 py-3 font-medium ${
                    activeTab === 'inbox' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-gray-600'
                  }`}
                  onClick={() => { setActiveTab('inbox'); setShowMobileMenu(false); }}
                >
                  <FaInbox className="mr-3" />
                  Boîte de réception
                </button>
                <button
                  className={`flex items-center px-4 py-3 font-medium ${
                    activeTab === 'pending' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-gray-600'
                  }`}
                  onClick={() => { setActiveTab('pending'); setShowMobileMenu(false); }}
                >
                  <FaMoneyCheckAlt className="mr-3" />
                  Commandes en attente
                </button>
                <button
                  className={`flex flex-col items-center py-3 px-4 ${
                    activeTab === 'trash' ? 'text-emerald-600' : 'text-gray-500'
                  }`}
                  onClick={() => { setActiveTab('trash'); setShowMobileMenu(false); }}
                >
                  <FaTrash className="text-xl mb-1" />
                  <span className="text-xs">Corbeille</span>
                </button>
                <button
                  className="flex items-center px-4 py-3 font-medium text-gray-600"
                  onClick={onLogout}
                >
                  <FaUserCircle className="mr-3" />
                  Déconnexion
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Welcome Overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-emerald-700 to-teal-600 flex flex-col items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-white/20 backdrop-blur-sm w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUserTie className="text-white text-4xl" />
              </div>
              <motion.h1 
                className="text-4xl font-bold text-white mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Bienvenue, {managerName} !
              </motion.h1>
              <motion.p 
                className="text-xl text-white/90 mb-8 max-w-md"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Vous êtes connecté à votre espace Manager
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-emerald-700 font-bold rounded-full shadow-lg"
                onClick={handleStartClick}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Commencer
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto pt-16 md:pt-8 pb-20 px-4">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-8 pt-4">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-emerald-700 flex items-center">
              <FaUserTie className="mr-3" />
              Espace Manager
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              <FaUserCircle className="text-emerald-600 mr-2" />
              <span className="font-medium text-emerald-700">{managerName}</span>
            </div>
            
            <div className="relative">
              <button className="p-2 bg-emerald-50 rounded-full relative">
                <FaBell className="text-emerald-600" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {notifications}
                  </span>
                )}
              </button>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-lg font-medium shadow-lg"
            >
              Déconnexion
            </motion.button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex bg-white rounded-xl shadow mb-8 overflow-hidden">
          <button
            className={`flex-1 flex items-center justify-center px-4 py-4 font-medium transition-all ${
              activeTab === 'pending' 
                ? 'bg-emerald-700 text-white shadow-lg' 
                : 'text-gray-600 hover:bg-emerald-50'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            <FaMoneyCheckAlt className="mr-2" />
            Commandes en attente
          </button>
          <button
            className={`flex-1 flex items-center justify-center px-4 py-4 font-medium transition-all ${
              activeTab === 'inbox' 
                ? 'bg-emerald-700 text-white shadow-lg' 
                : 'text-gray-600 hover:bg-emerald-50'
            }`}
            onClick={() => setActiveTab('inbox')}
          >
            <FaInbox className="mr-2" />
            Boîte de réception
          </button>
          <button
            className={`flex-1 flex items-center justify-center px-4 py-4 font-medium transition-all ${
              activeTab === 'trash' 
                ? 'bg-emerald-700 text-white shadow-lg' 
                : 'text-gray-600 hover:bg-emerald-50'
            }`}
            onClick={() => setActiveTab('trash')}
          >
            <FaTrash className="mr-2" />
            Corbeille
          </button>
        </div>

        {/* Stats Summary - Desktop Only */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <FaBox className="text-blue-600 text-xl" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Commandes en attente</div>
              <div className="font-bold text-lg">{pendingOrdersCount}</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <FaInbox className="text-purple-600 text-xl" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Notifications</div>
              <div className="font-bold text-lg">{notifications}</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex items-center">
            <div className="bg-gray-200 p-3 rounded-lg mr-4">
              <FaTrash className="text-gray-600 text-xl" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Éléments dans la corbeille</div>
              <div className="font-bold text-lg">{trashItems.length}</div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'pending' && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-emerald-700 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <FaMoneyCheckAlt className="mr-3" />
                    Commandes en attente
                  </h2>
                  <motion.button
                    whileHover={{ rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={fetchPendingOrders}
                    className="text-white p-2 rounded-full hover:bg-emerald-800"
                    title="Rafraîchir"
                  >
                    <FaSync />
                  </motion.button>
                </div>
                
                <div className="p-4 md:p-6">
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                      {error}
                    </div>
                  )}
                  
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                  ) : pendingOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCheck className="text-emerald-600 text-3xl" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-700 mb-2">Aucune commande en attente</h3>
                      <p className="text-gray-500">Toutes les commandes ont été traitées</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {pendingOrders.map((order) => (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all bg-white"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-emerald-700">Commande #{order.commandeId}</h3>
                              <div className="mt-3">
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                  <FaMapMarkerAlt className="text-red-500 mr-2" />
                                  <span>De: {order.expedition?.nomComplet || 'Non spécifié'}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <FaMapMarkerAlt className="text-green-500 mr-2" />
                                  <span>À: {order.destination?.nomComplet || 'Non spécifié'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              En attente
                            </span>
                          </div>
                          
                          <div className="mt-4">
                            <div className="text-sm text-gray-700">
                              <span className="font-medium">Date de livraison:</span> 
                              {order.colis?.dateLivraison ? (
                                `${new Date(order.colis.dateLivraison).toLocaleDateString('fr-FR')} à ${order.colis.heureLivraison || ''}`
                              ) : 'Non spécifié'}
                            </div>
                            <div className="text-sm text-gray-700 mt-1">
                              <span className="font-medium">Colis:</span> {order.colis?.description || ''} ({order.colis?.type || ''})
                            </div>
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center"
                              onClick={() => openOrderModal(order)}
                            >
                              <FaCheck className="mr-2" /> Valider
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'inbox' && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-emerald-700 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <FaInbox className="mr-3" />
                    {inboxItems.some(item => item.action === 'validation') 
                      ? "Commandes Validées" 
                      : "Boîte de réception"}
                  </h2>
                  <motion.button
                    whileHover={{ rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={fetchInbox}
                    className="text-white p-2 rounded-full hover:bg-emerald-800"
                    title="Rafraîchir"
                  >
                    <FaSync />
                  </motion.button>
                </div>
                
                <div className="p-4 md:p-6">
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                  ) : inboxItems.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaInbox className="text-gray-400 text-3xl" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-700 mb-2">Boîte de réception vide</h3>
                      <p className="text-gray-500">Aucune nouvelle notification pour le moment</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inboxItems.map((item) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all bg-white group"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              item.action === 'validation' ? 'bg-green-500' : 
                              item.action === 'annulation' ? 'bg-red-500' : 
                              item.action === 'modification' ? 'bg-blue-500' : 'bg-gray-500'
                            } text-white`}>
                              <FaBox className="text-sm" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:justify-between">
                                <h3 className="font-bold text-emerald-700">
                                  Commande {item.commandeId}
                                </h3>
                                <span className="text-sm text-gray-500 mt-1 md:mt-0">
                                  {formatDate(item.date)}
                                </span>
                              </div>
                              
                              <div className="mt-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  item.action === 'validation' 
                                    ? 'bg-green-100 text-green-800' 
                                    : item.action === 'annulation'
                                      ? 'bg-red-100 text-red-800'
                                      : item.action === 'modification'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.action === 'validation' ? 'Validation' : 
                                    item.action === 'annulation' ? 'Annulation' : 
                                    item.action === 'modification' ? 'Modification' : 'Action'}
                                </span>
                              </div>
                              
                              <div className="mt-2">
                                <p 
                                  className={`text-gray-600 ${expandedItem === item._id ? '' : 'line-clamp-2'}`}
                                  onMouseEnter={() => setExpandedItem(item._id)}
                                  onMouseLeave={() => setExpandedItem(null)}
                                >
                                  {item.details}
                                  {item.client && ` - Client: ${item.client}`}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center"
                              onClick={() => openInboxModal(item)}
                            >
                              <FaInfoCircle className="mr-2" /> Voir détails
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              onClick={() => moveToTrash(item, 'inbox')}
                            >
                              <FaTrash />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'trash' && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gray-700 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <FaTrash className="mr-3" />
                      Corbeille
                    </h2>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ rotate: 360 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={fetchTrash}
                        className="text-white p-2 rounded-full hover:bg-gray-800"
                        title="Rafraîchir"
                      >
                        <FaSync />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={emptyTrash}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm"
                        disabled={trashItems.length === 0}
                      >
                        Vider la corbeille
                      </motion.button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 md:p-6">
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
                    </div>
                  ) : trashItems.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTrash className="text-gray-400 text-3xl" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-700 mb-2">Corbeille vide</h3>
                      <p className="text-gray-500">Aucun élément supprimé</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {trashItems.map((item) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all bg-white"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-500 text-white">
                              <FaBox className="text-sm" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:justify-between">
                                <h3 className="font-bold text-gray-700">
                                  Commande: #{item.data.commandeId}
                                </h3>
                                <span className="text-sm text-gray-500 mt-1 md:mt-0">
                                  {formatDate(item.deletedAt || item.data.date)}
                                </span>
                              </div>
                              
                              <div className="mt-2">
                                <div className="text-xs text-gray-500">Supprimé le:</div>
                                <div className="text-sm">{formatDate(item.deletedAt)}</div>
                              </div>
                              
                              <p className="text-gray-600 mt-2 truncate">
                                {item.itemType === 'commande' 
                                  ? `Client: ${item.data.expedition?.nomComplet || 'Inconnu'}`
                                  : item.data.details || 'Aucun détail disponible'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center justify-center"
                              onClick={() => restoreFromTrash(item._id)}
                            >
                              <FaTrashRestore className="mr-2" /> Restaurer
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-30">
        <div className="flex justify-around">
          <button
            className={`flex flex-col items-center py-3 px-4 ${
              activeTab === 'pending' ? 'text-emerald-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            <FaMoneyCheckAlt className="text-xl mb-1" />
            <span className="text-xs">Commandes</span>
          </button>
          <button
            className={`flex flex-col items-center py-3 px-4 ${
              activeTab === 'inbox' ? 'text-emerald-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('inbox')}
          >
            <FaInbox className="text-xl mb-1" />
            <span className="text-xs">Boîte</span>
          </button>
          <button
            className={`flex flex-col items-center py-3 px-4 ${
              activeTab === 'trash' ? 'text-emerald-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('trash')}
          >
            <FaTrash className="text-xl mb-1" />
            <span className="text-xs">Corbeille</span>
          </button>
        </div>
      </div>

      {/* Modal pour les détails de la commande */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-emerald-700">Détails de la commande #{selectedOrder.commandeId}</h3>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Informations d'expédition</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start mb-3">
                        <FaMapMarkerAlt className="text-red-500 mt-1 mr-3" />
                        <div>
                          <div className="font-medium">De:</div>
                          <div>{selectedOrder.expedition?.nomComplet || 'Non spécifié'}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {selectedOrder.expedition?.adresse || 'Adresse non spécifiée'}
                          </div>
                          {selectedOrder.expedition?.telephone && (
                            <div className="text-sm text-gray-500 mt-1">
                              Tél: {selectedOrder.expedition.telephone}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="text-green-500 mt-1 mr-3" />
                        <div>
                          <div className="font-medium">À:</div>
                          <div>{selectedOrder.destination?.nomComplet || 'Non spécifié'}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {selectedOrder.destination?.adresse || 'Adresse non spécifiée'}
                          </div>
                          {selectedOrder.destination?.telephone && (
                            <div className="text-sm text-gray-500 mt-1">
                              Tél: {selectedOrder.destination.telephone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Détails du colis</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-3">
                        <div className="font-medium">Type:</div>
                        <div>{selectedOrder.colis?.type || 'Non spécifié'}</div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="font-medium">Description:</div>
                        <div>{selectedOrder.colis?.description || 'Non spécifiée'}</div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="font-medium">Poids:</div>
                        <div>{selectedOrder.colis?.poids || 'Non spécifié'}</div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="font-medium">Dimensions:</div>
                        <div>
                          {selectedOrder.colis?.dimensions?.longueur || '0'} x 
                          {selectedOrder.colis?.dimensions?.largeur || '0'} x 
                          {selectedOrder.colis?.dimensions?.hauteur || '0'} cm
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-2">Livraison</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FaClock className="text-gray-500 mr-3" />
                      <div>
                        <div className="font-medium">Date et heure:</div>
                        <div>
                          {selectedOrder.colis?.dateLivraison ? 
                            `${new Date(selectedOrder.colis.dateLivraison).toLocaleDateString('fr-FR')} à ${selectedOrder.colis.heureLivraison || ''}` : 
                            'Non spécifié'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaInfoCircle className="text-gray-500 mr-3" />
                      <div>
                        <div className="font-medium">Instructions:</div>
                        <div>{selectedOrder.colis?.instructions || 'Aucune instruction spécifique'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-2">Prix de la livraison</h4>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="500"
                      step="100"
                      value={customPrices[selectedOrder._id] || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (Number(value) > 0)) {
                          setCustomPrices({
                            ...customPrices,
                            [selectedOrder._id]: value
                          })
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Prix en FCFA"
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    onClick={() => validateOrderWithPrice(selectedOrder._id)}
                  >
                    Valider la commande
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
                    onClick={() => cancelOrder(selectedOrder._id)}
                  >
                    Annuler la commande
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal pour les détails de la notification */}
      <AnimatePresence>
        {selectedInboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-emerald-700">
                    {selectedInboxItem.action === 'validation' 
                      ? "Commande Validée" 
                      : `Commande ${selectedInboxItem.commandeId}`}
                  </h3>
                  <button 
                    onClick={() => setSelectedInboxItem(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  selectedInboxItem.action === 'validation' ? 'bg-green-500' : 
                  selectedInboxItem.action === 'annulation' ? 'bg-red-500' : 
                  selectedInboxItem.action === 'modification' ? 'bg-blue-500' : 'bg-gray-500'
                } text-white`}>
                  <FaBox className="text-xl" />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-500">Type d'action</div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedInboxItem.action === 'validation' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedInboxItem.action === 'annulation'
                          ? 'bg-red-100 text-red-800'
                          : selectedInboxItem.action === 'modification'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedInboxItem.action === 'validation' ? 'Validation' : 
                       selectedInboxItem.action === 'annulation' ? 'Annulation' : 
                       selectedInboxItem.action === 'modification' ? 'Modification' : 'Action'}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="font-medium">{formatDate(selectedInboxItem.date)}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Détails</div>
                    <div className="font-medium">{selectedInboxItem.details}</div>
                  </div>
                  
                  {selectedInboxItem.client && (
                    <div className="mt-3">
                      <div className="text-sm text-gray-500">Client</div>
                      <div className="font-medium">{selectedInboxItem.client}</div>
                    </div>
                  )}
                  
                  {selectedInboxItem.action === 'validation' && selectedInboxItem.price && (
                    <div className="mt-3">
                      <div className="text-sm text-gray-500">Prix</div>
                      <div className="font-medium">{selectedInboxItem.price} FCFA</div>
                    </div>
                  )}
                  
                  {/* Afficher les détails complets pour une validation */}
                  {selectedInboxItem.action === 'validation' && (
                    <>
                      <div className="mt-3">
                        <div className="text-sm text-gray-500">Expéditeur</div>
                        <div className="font-medium">{selectedInboxItem.expediteur}</div>
                      </div>
                      <div className="mt-3">
                        <div className="text-sm text-gray-500">Destinataire</div>
                        <div className="font-medium">{selectedInboxItem.destinataire}</div>
                      </div>
                      <div className="mt-3">
                        <div className="text-sm text-gray-500">Détails du colis</div>
                        <div className="font-medium">{selectedInboxItem.detailsColis}</div>
                      </div>
                    </>
                  )}
                  
                  {selectedInboxItem.action === 'modification' && selectedInboxItem.changes && (
                    <div className="mt-3">
                      <div className="text-sm text-gray-500">Changements:</div>
                      <div className="bg-white p-2 rounded text-xs max-h-32 overflow-y-auto">
                        {Object.entries(selectedInboxItem.changes).map(([key, change]) => (
                          <div key={key} className="mb-2">
                            <div className="font-medium">{key}:</div>
                            <div>Ancien: {JSON.stringify(change.old)}</div>
                            <div>Nouveau: {JSON.stringify(change.new)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
                    onClick={() => {
                      moveToTrash(selectedInboxItem, 'inbox');
                      setSelectedInboxItem(null);
                    }}
                  >
                    Supprimer
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    onClick={() => setSelectedInboxItem(null)}
                  >
                    Fermer
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default ManagerDashboard;


