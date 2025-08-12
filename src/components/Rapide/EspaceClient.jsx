
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaBox, 
  FaHistory, 
  FaPlus, 
  FaArrowLeft, 
  FaPrint, 
  FaTrash, 
  FaCamera, 
  FaEdit, 
  FaSignOutAlt, 
  FaSync, 
  FaInfoCircle, 
  FaMapMarkerAlt, 
  FaWeightHanging, 
  FaMoneyBillWave,
  FaWhatsapp
} from 'react-icons/fa';
import  ModalForm  from './ModalForm';
import Logo from "../../assets/naya.jpg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const formatDate = (dateInput) => {
  if (!dateInput) return "Date invalide";
  
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "Date invalide";
  }
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const EspaceClient = ({ 
  user: propUser,
  onLogout = () => {},
  refreshTrigger,
  setRefreshTrigger 
}) => {
  const [user, setUser] = useState(null);
  const [commandes, setCommandes] = useState([]);
  const [activeTab, setActiveTab] = useState('commandes');
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCommandes, setLoadingCommandes] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showCommandeForm, setShowCommandeForm] = useState(false);
  const [hoveringProfile, setHoveringProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState(null);

  const stats = useMemo(() => {
    return commandes.reduce((acc, commande) => {
      acc.total++;
      if (commande.status === 'Livrée') acc.delivered++;
      if (commande.status === 'En attente') acc.pending++;
      return acc;
    }, { total: 0, delivered: 0, pending: 0 });
  }, [commandes]);

  const getAuthToken = useCallback(() => localStorage.getItem('authToken') || '', []);

  const fetchApi = useCallback(async (url, options = {}) => {
    const token = getAuthToken();
    
    if (!token) {
      setError("Session expirée, veuillez vous reconnecter");
      onLogout();
      return null; 
    }
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expirée, veuillez vous reconnecter");
          onLogout();
          return null;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      setError(error.message || "Erreur serveur");
      return null;
    }
  }, [getAuthToken, onLogout]);

  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        setError("Erreur de données utilisateur");
      }
    } else if (propUser && propUser._id) {
      setUser(propUser);
      localStorage.setItem('userData', JSON.stringify(propUser));
    } else {
      onLogout();
    }
  }, [propUser, onLogout]);

  useEffect(() => {
    if (!user || !user._id) return;

    const fetchData = async () => {
      try {
        setLoadingCommandes(true);
        setError(null);
        const data = await fetchApi(`${API_BASE_URL}/api/commandes/user/${user._id}`);
      
        if (data) {
          const uniqueCommands = data.reduce((acc, current) => {
            if (!acc.some(item => item._id === current._id)) {
              acc.push(current);
            }
            return acc;
          }, []);
          
          setCommandes(uniqueCommands);
        }
      } catch (error) {
        setError("Erreur lors du chargement des commandes");
      } finally {
        setLoadingCommandes(false);
      }
    };
    
    fetchData();
  }, [user, fetchApi, refreshTrigger]);

  const handleProfilePhotoChange = async (e) => {
    if (!user || !user._id) return;

    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/users/${user._id}/photo`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du téléchargement');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
    } catch (error) {
      setError(`Erreur photo: ${error.message}`);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePrint = useCallback(() => {
    if (!selectedCommande) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Commande ${selectedCommande._id}</title>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 20px; 
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 2px solid #047857;
            padding-bottom: 15px;
          }
          .company-name {
            color: #047857;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .section { 
            margin-bottom: 25px; 
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
          }
          .section-title { 
            font-weight: bold; 
            color: #047857;
            border-bottom: 1px solid #d1fae5; 
            padding-bottom: 8px; 
            margin-bottom: 15px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .details-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
          }
          .detail-item {
            margin-bottom: 10px;
          }
          .detail-label {
            font-weight: 600;
            color: #047857;
            font-size: 14px;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-style: italic;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 5px;
          }
          .amount-badge {
            background: linear-gradient(to right, #047857, #059669);
            color: white;
            padding: 8px 20px;
            border-radius: 8px;
            display: inline-block;
            font-weight: bold;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">NAYA LIVRAISON</div>
          <h2>Commande #${selectedCommande._id.slice(-6).toUpperCase()}</h2>
          <div>${formatDate(selectedCommande.createdAt)}</div>
        </div>
        
        <div class="details-grid">
          <div class="section">
            <div class="section-title">Informations de la commande</div>
            <div class="detail-item">
              <div class="detail-label">Statut</div>
              <div class="status-badge ${
                selectedCommande.status === 'Livrée' 
                  ? 'background-color: #dcfce7; color: #166534;' 
                  : selectedCommande.status === 'Annulée'
                    ? 'background-color: #fee2e2; color: #b91c1c;'
                    : 'background-color: #fef3c7; color: #b45309;'
              }">${selectedCommande.status}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Expéditeur</div>
            <div class="detail-item">
              <div class="detail-label">Nom</div>
              <div>${selectedCommande.expedition.prenom} ${selectedCommande.expedition.nom}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Téléphone</div>
              <div>${selectedCommande.expedition.telephone}</div>
            </div>
            ${selectedCommande.expedition.email ? `
            <div class="detail-item">
              <div class="detail-label">Email</div>
              <div>${selectedCommande.expedition.email}</div>
            </div>` : ''}
          </div>
          
          <div class="section">
            <div class="section-title">Destinataire</div>
            <div class="detail-item">
              <div class="detail-label">Nom</div>
              <div>${selectedCommande.destination.prenom} ${selectedCommande.destination.nom}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Téléphone</div>
              <div>${selectedCommande.destination.telephone}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Adresse</div>
              <div>${selectedCommande.destination.adresse}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Détails du colis</div>
          <div class="detail-item">
            <div class="detail-label">Description</div>
            <div>${selectedCommande.colis.description}</div>
          </div>
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">Type</div>
              <div>${selectedCommande.colis.type}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Nombre</div>
              <div>${selectedCommande.colis.nombre}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Poids</div>
              <div>${selectedCommande.colis.poids || 'N/A'} kg</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Paiement</div>
          <div class="amount-badge">
            ${(selectedCommande.prixLivraison ?? 0).toLocaleString('fr-FR')} FCFA
          </div>
        </div>
        
        <div class="footer">
          <p>Merci de votre confiance ! NAYA Livraison</p>
          <p>Imprimé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }, [selectedCommande]);

  const handleAddNewCommande = useCallback((newCommande) => {
    setCommandes(prev => [newCommande, ...prev]);
    setShowCommandeForm(false);
  }, []);

  const handleDeleteCommande = useCallback(async (id) => {
    if (!window.confirm("Confirmer la suppression de cette commande?")) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await fetchApi(`${API_BASE_URL}/api/commandes/${id}`, {
        method: 'DELETE'
      });
      
      const updatedCommandes = commandes.filter(cmd => cmd._id !== id);
      setCommandes(updatedCommandes);
      setSelectedCommande(null);
    } catch (error) {
      setError("Erreur suppression: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [commandes, fetchApi]);

  const handleLogout = useCallback(() => {
    onLogout();
  }, [onLogout]);

  const redirectToWhatsApp = useCallback(() => {
    let message;
    
    if (selectedCommande) {
      const commande = selectedCommande;
      const livraisonDate = new Date(commande.colis.dateLivraison);
      
      message = `Akwaba ! Je suis ${commande.expedition.nomComplet}. 
  J'ai passé une commande (${commande.commandeId}) à livrer le ${livraisonDate.toLocaleDateString('fr-FR')} à ${commande.colis.heureLivraison}. 
  
  *Expéditeur:*
  - Nom: ${commande.expedition.nomComplet}
  - Téléphone: ${commande.expedition.telephone}
  - Adresse: ${commande.expedition.adresse || 'N/A'}
  
  *Destinataire:*
  - Nom: ${commande.destination.nomComplet}
  - Téléphone: ${commande.destination.telephone}
  - Adresse: ${commande.destination.adresse}
  
  *Colis:*
  - Description: ${commande.colis.description}
  - Type: ${commande.colis.type}
  - Nombre: ${commande.colis.nombre}
  - Instructions: ${commande.colis.instructions || 'Aucune'}
  
  Pouvez-vous me confirmer le prix de livraison ?`;
      
    } else {
      message = `Akwaba ! Je suis ${user?.fullName || "un client"}, je réside à ${user?.adresse || 'Non renseigné'}.
  Je suis au téléphone ${user?.phone || 'Non renseigné'}.
  Je souhaite obtenir un devis pour une livraison.
  
  Pouvez-vous me contacter pour discuter des détails ?`;
    }
  
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/2250758732521?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  }, [user, selectedCommande]);


  const ProfileSection = useMemo(() => {
    if (!user) return null;
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-emerald-800 flex items-center">
            <FaUser className="mr-3" /> Mon Profil
          </h2>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg flex items-center shadow-md"
            onClick={() => setEditingProfile(true)}
            aria-label="Modifier le profil"
          >
            <FaEdit className="mr-2" /> Modifier
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex justify-center">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="relative"
            >
              {user?.profilePhoto ? (
                <div className="rounded-full overflow-hidden border-4 border-emerald-100 shadow-lg">
                  <img 
                    src={user.profilePhoto} 
                    alt="Profile" 
                    className="w-48 h-48 object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-b from-emerald-100 to-teal-100 w-48 h-48 rounded-full flex items-center justify-center border-4 border-emerald-100 shadow-lg">
                  <FaUser className="text-emerald-600 text-6xl" />
                </div>
              )}
            </motion.div>
          </div>
          
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-b from-white to-emerald-50 rounded-2xl p-6 mb-6 border border-emerald-100 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-emerald-700 mb-4 pb-2 border-b border-emerald-100">Informations personnelles</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-xs mb-1">Nom complet</p>
                  <p className="font-medium">{user?.fullName || 'Non renseigné'}</p>
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-xs mb-1">Email</p>
                  <p className="font-medium">{user?.email || 'Non renseigné'}</p>
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-xs mb-1">Téléphone</p>
                  <p className="font-medium">{user?.phone || 'Non renseigné'}</p>
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-xs mb-1">Code client</p>
                  <p className="font-mono font-bold text-emerald-600">
                    {user?.clientCode || 'Chargement...'}
                  </p>
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-lg sm:col-span-2">
                  <p className="text-gray-500 text-xs mb-1">Adresse</p>
                  <p className="font-medium">{user?.adresse || 'Non renseigné'}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-b from-white to-emerald-50 rounded-2xl p-6 border border-emerald-100 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-emerald-700 mb-4 pb-2 border-b border-emerald-100">Statistiques</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-4 rounded-xl text-center shadow-sm border border-emerald-100"
                >
                  <p className="text-3xl font-bold text-emerald-700">{stats.total}</p>
                  <p className="text-sm text-gray-600 mt-1">Commandes</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-4 rounded-xl text-center shadow-sm border border-green-100"
                >
                  <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
                  <p className="text-sm text-gray-600 mt-1">Livrées</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-4 rounded-xl text-center shadow-sm border border-amber-100"
                >
                  <p className="text-3xl font-bold text-amber-500">{stats.pending}</p>
                  <p className="text-sm text-gray-600 mt-1">En cours</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }, [user, stats]);

  const renderCommandeDetails = useCallback(() => {
    if (!selectedCommande) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-xl p-6 mb-6 border border-emerald-100"
      >
        <button 
          onClick={() => setSelectedCommande(null)}
          className="flex items-center text-emerald-600 mb-4 hover:text-emerald-800 transition-colors font-medium"
          aria-label="Retour à la liste"
        >
          <FaArrowLeft className="mr-2" /> Retour à la liste
        </button>
        
        <div className="border-b border-emerald-100 pb-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold text-emerald-800 flex items-center">
                <FaBox className="mr-3 text-emerald-600" />
                Commande #{selectedCommande._id.slice(-6).toUpperCase()}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-gray-600 text-sm">Date: {formatDate(selectedCommande.createdAt)}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedCommande.status === 'Livrée' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedCommande.status === 'Annulée'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedCommande.status}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg">
              <p className="text-xs font-light">Montant total</p>
              <p className="text-xl font-bold">
                {(selectedCommande.prixLivraison ?? 0).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-b from-white to-emerald-50 rounded-xl p-5 shadow-sm border border-emerald-100">
            <div className="flex items-center mb-3">
              <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                <FaUser className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-700">Expéditeur</h3>
            </div>
            <div className="space-y-2 pl-11">
              <p className="font-medium">
                {selectedCommande.expedition.prenom} {selectedCommande.expedition.nom}
              </p>
              <p>Tél: {selectedCommande.expedition.telephone}</p>
              {selectedCommande.expedition.email && <p>Email: {selectedCommande.expedition.email}</p>}
            </div>
          </div>
          
          <div className="bg-gradient-to-b from-white to-emerald-50 rounded-xl p-5 shadow-sm border border-emerald-100">
            <div className="flex items-center mb-3">
              <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                <FaUser className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-700">Destinataire</h3>
            </div>
            <div className="space-y-2 pl-11">
              <p className="font-medium">
                {selectedCommande.destination.prenom} {selectedCommande.destination.nom}
              </p>
              <p>Tél: {selectedCommande.destination.telephone}</p>
              <p className="flex items-start">
                <FaMapMarkerAlt className="text-emerald-500 mr-2 mt-1 flex-shrink-0" />
                <span>Adresse: {selectedCommande.destination.adresse}</span>
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-b from-white to-emerald-50 rounded-xl p-5 shadow-sm border border-emerald-100">
            <div className="flex items-center mb-3">
              <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                <FaInfoCircle className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-700">Détails du colis</h3>
            </div>
            <div className="space-y-2 pl-11">
              <p className="font-medium">{selectedCommande.colis.description}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p>{selectedCommande.colis.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nombre</p>
                  <p>{selectedCommande.colis.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Poids</p>
                  <p className="flex items-center">
                    <FaWeightHanging className="text-emerald-500 mr-1" />
                    {selectedCommande.colis.poids || 'N/A'} kg
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-emerald-100 pt-6 gap-4">
          <div className="flex items-center text-gray-600">
            <FaMoneyBillWave className="text-emerald-500 mr-2 text-xl" />
            <div>
              <p className="text-xs">Montant total</p>
              <p className="text-xl font-bold text-emerald-700">
                {(selectedCommande.prixLivraison ?? 0).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all"
              onClick={handlePrint}
              aria-label="Imprimer la commande"
            >
              <FaPrint className="mr-2" /> Imprimer
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDeleteCommande(selectedCommande._id)}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all"
              aria-label="Supprimer la commande"
            >
              <FaTrash className="mr-2" /> Supprimer
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }, [selectedCommande, handlePrint, handleDeleteCommande]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"
          />
          <p className="text-emerald-700 font-medium">Chargement de votre espace client...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xl py-2 sm:py-4">
        <div className="container mx-auto px-2 sm:px-4 flex flex-col sm:flex-row justify-between items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center mb-2 sm:mb-0"
          >
            <motion.div 
              className="relative"
              whileHover={{ rotate: 5 }}
            >
              <div className="absolute inset-0 bg-white rounded-full opacity-20 blur-md"></div>
              <motion.img 
                src={Logo} 
                alt="Logo NAYA"
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white mr-2 sm:mr-3 shadow-lg"
              />
            </motion.div>
            <div>
              <motion.span
                className="text-xl sm:text-2xl font-bold tracking-tight"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                NAYA
              </motion.span>
              <p className="text-xs text-emerald-100 opacity-90">Espace Client</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between">
            <div 
              className="relative group flex items-center"
              onMouseEnter={() => setHoveringProfile(true)}
              onMouseLeave={() => setHoveringProfile(false)}
            >
              <div className="relative">
                {user.profilePhoto ? (
                  <motion.div 
                    className="rounded-full overflow-hidden border-2 border-white shadow-lg w-8 h-8 sm:w-12 sm:h-12"
                    whileHover={{ scale: 1.05 }}
                  >
                    <img 
                      src={user.profilePhoto} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    className="bg-gradient-to-br from-emerald-200 to-teal-200 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaUser className="text-emerald-700 text-sm sm:text-xl" />
                  </motion.div>
                )}
                
                <motion.div 
                  className="absolute bottom-0 right-0 w-2 h-2 sm:w-4 sm:h-4 bg-green-500 rounded-full border border-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
                
                {(hoveringProfile || editingProfile) && (
                  <label className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center cursor-pointer backdrop-blur-sm">
                    {isUploadingPhoto ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="rounded-full h-4 w-4 sm:h-6 sm:w-6 border-t border-b border-white"
                      />
                    ) : (
                      <>
                        <FaCamera className="text-white text-sm sm:text-xl" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleProfilePhotoChange}
                          disabled={isUploadingPhoto}
                        />
                      </>
                    )}
                  </label>
                )}
              </div>
              <div className="ml-2 hidden sm:block">
                <h1 className="text-sm font-bold truncate max-w-[100px]">
                  {user?.fullName || "Profit"}
                </h1>
                <p className="text-xs text-emerald-100 opacity-80 truncate">
                  {user?.clientCode}
                </p>
              </div>
            </div>
            
            <div className="flex gap-1 sm:gap-2">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#25D366' }}
                whileTap={{ scale: 0.9 }}
                className="p-1 sm:p-2 bg-green-500 rounded-full shadow flex items-center justify-center"
                onClick={redirectToWhatsApp}
                title="Contacter sur WhatsApp"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="text-white text-sm sm:text-xl" />
              </motion.button>
              
              <motion.button
                whileHover={{ rotate: 180, backgroundColor: '#047857' }}
                whileTap={{ scale: 0.9 }}
                className="p-1 sm:p-2 bg-emerald-700 rounded-full shadow"
                onClick={() => window.location.reload()}
                title="Rafraîchir la page"
                aria-label="Rafraîchir"
              >
                <FaSync className="text-white text-sm sm:text-xl" />
              </motion.button>
              
              <motion.button
                className="relative overflow-hidden bg-white text-emerald-600 px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center text-xs sm:text-base group shadow-lg"
                onClick={handleLogout}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.15)"
                }}
                whileTap={{ scale: 0.95 }}
                aria-label="Déconnexion"
              >
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ 
                    x: "100%",
                    transition: { 
                      duration: 0.8,
                      ease: "easeInOut"
                    } 
                  }}
                />
                
                <FaSignOutAlt className="mr-1 sm:mr-2 text-xs sm:text-base" />
                <span>Déconnexion</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 py-2"
        >
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {editingProfile ? (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-white to-emerald-50 rounded-2xl shadow-xl p-6 border border-emerald-100"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-emerald-800">Modifier votre profil</h2>
              <button 
                onClick={() => setEditingProfile(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Fermer l'édition"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Nom complet</label>
                <input
                  type="text"
                  name="fullName"
                  value={user.fullName || ''}
                  onChange={(e) => setUser({...user, fullName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                  placeholder="Votre nom complet"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={user.email || ''}
                  onChange={(e) => setUser({...user, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                  placeholder="votre@email.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2 font-medium">Adresse</label>
                <input
                  type="text"
                  name="adresse"
                  value={user.adresse || ''}
                  onChange={(e) => setUser({...user, adresse: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                  placeholder="Votre adresse complète"
                />
             </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2 font-medium">Photo de profil</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <motion.label
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-4 py-2.5 rounded-lg cursor-pointer flex items-center"
                  >
                    <FaCamera className="mr-2" />
                    Choisir une photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleProfilePhotoChange}
                      disabled={isUploadingPhoto}
                    />
                  </motion.label>
                  {user.profilePhoto && (
                    <div className="ml-4 flex items-center">
                      <div className="rounded-lg overflow-hidden border-2 border-emerald-100 shadow-sm">
                        <img 
                          src={user.profilePhoto} 
                          alt="Preview" 
                          className="w-16 h-16 object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-emerald-100">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors font-medium shadow-sm"
                onClick={() => setEditingProfile(false)}
              >
                Annuler
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:opacity-95 transition-all font-medium shadow-md"
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    const token = getAuthToken();
                    const response = await fetch(`${API_BASE_URL}/api/users/${user._id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        fullName: user.fullName,
                        email: user.email,
                        adresse: user.adresse
                      })
                    });
                    
                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.message || 'Erreur mise à jour profil');
                    }
                    
                    const updatedUser = await response.json();
                    setUser(updatedUser);
                    localStorage.setItem('userData', JSON.stringify(updatedUser));
                    setEditingProfile(false);
                  } catch (error) {
                    console.error(error);
                    setError(error.message || "Erreur lors de la mise à jour");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6">
          <div className="flex overflow-x-auto pb-2 mb-4 hide-scrollbar">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center px-3 py-2 text-sm sm:px-5 sm:py-3 sm:text-base rounded-t-xl mr-2 transition-all font-medium shadow-sm ${
                activeTab === 'commandes' 
                  ? 'bg-gradient-to-b from-white to-emerald-50 text-emerald-700 border-t-2 border-emerald-500' 
                  : 'bg-gradient-to-b from-emerald-100 to-emerald-200 text-emerald-600 hover:from-emerald-200 hover:to-emerald-300'
              }`}
              onClick={() => setActiveTab('commandes')}
              aria-selected={activeTab === 'commandes'}
            >
              <FaBox className="mr-2" /> Mes Commandes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center px-3 py-2 text-sm sm:px-5 sm:py-3 sm:text-base rounded-t-xl mr-2 transition-all font-medium shadow-sm ${
                activeTab === 'nouvelle' 
                  ? 'bg-gradient-to-b from-white to-emerald-50 text-emerald-700 border-t-2 border-emerald-500' 
                  : 'bg-gradient-to-b from-emerald-100 to-emerald-200 text-emerald-600 hover:from-emerald-200 hover:to-emerald-300'
              }`}
              onClick={() => setActiveTab('nouvelle')}
              aria-selected={activeTab === 'nouvelle'}
            >
              <FaPlus className="mr-2" /> Nouvelle Commande
            </motion.button>
          </div>

          <div className="bg-gradient-to-b from-white to-emerald-50 rounded-2xl shadow-xl overflow-hidden border border-emerald-100">
            {showCommandeForm && (
              <ModalForm 
                user={user} 
                onClose={() => setShowCommandeForm(false)} 
                onCommandeCreated={handleAddNewCommande} 
              />
            )}

            {selectedCommande ? (
              renderCommandeDetails()
            ) : (
              <>
                {activeTab === 'commandes' && (
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3">
                      <h2 className="text-lg sm:text-xl font-bold text-emerald-800 flex items-center">
                        <FaHistory className="mr-2 sm:mr-3 text-emerald-600" /> Historique des Commandes
                      </h2>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <div className="bg-gradient-to-b from-emerald-50 to-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-sm border border-emerald-100">
                          <p className="text-xs text-emerald-600">Total</p>
                          <p className="font-bold text-xl sm:text-2xl text-emerald-800">{stats.total}</p>
                        </div>
                        <div className="bg-gradient-to-b from-green-50 to-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-sm border border-green-100">
                          <p className="text-xs text-green-600">Livrées</p>
                          <p className="font-bold text-xl sm:text-2xl text-green-800">{stats.delivered}</p>
                        </div>
                        <div className="bg-gradient-to-b from-amber-50 to-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-sm border border-amber-100">
                          <p className="text-xs text-amber-600">En attente</p>
                          <p className="font-bold text-xl sm:text-2xl text-amber-800">{stats.pending}</p>
                        </div>
                      </div>
                    </div>

                    {loadingCommandes ? (
                      <div className="text-center py-8 sm:py-12">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-3 sm:mb-4"
                        />
                        <p className="mt-3 sm:mt-4 text-emerald-700 font-medium">Chargement des commandes...</p>
                      </div>
                    ) : commandes.length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <div className="bg-gradient-to-b from-emerald-100 to-white w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm border border-emerald-100">
                          <FaBox className="text-emerald-600 text-2xl sm:text-3xl" />
                        </div>
                        <h3 className="text-lg font-bold text-emerald-800 mb-2">Aucune commande</h3>
                        <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
                          Vous n'avez pas encore passé de commande. Commencez dès maintenant pour suivre vos livraisons.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all text-sm sm:text-base"
                          onClick={() => setActiveTab('nouvelle')}
                        >
                          Passer une commande
                        </motion.button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        {commandes.map(commande => (
                          <motion.div
                            key={commande._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ 
                              y: -5,
                              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                            }}
                            transition={{ duration: 0.3 }}
                            className="border border-gray-100 rounded-xl p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => setSelectedCommande(commande)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => e.key === 'Enter' && setSelectedCommande(commande)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-emerald-700 text-sm sm:text-base">Commande #{commande._id.slice(-6).toUpperCase()}</h3>
                                <div className="mt-2 sm:mt-3">
                                  <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-1">
                                    <FaMapMarkerAlt className="text-red-500 mr-1 sm:mr-2 text-xs sm:text-sm" />
                                    <span>De: {commande.expedition.prenom} {commande.expedition.nom}</span>
                                  </div>
                                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                    <FaMapMarkerAlt className="text-green-500 mr-1 sm:mr-2 text-xs sm:text-sm" />
                                    <span>À: {commande.destination.prenom} {commande.destination.nom}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                commande.status === 'Livrée' 
                                  ? 'bg-green-100 text-green-800' 
                                  : commande.status === 'Annulée'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}>
                                {commande.status}
                              </span>
                            </div>
                            
                            <div className="mt-3 sm:mt-4">
                              <div className="text-xs sm:text-sm text-gray-700">
                                <span className="font-medium">Date: </span> 
                                {formatDate(commande.createdAt)}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-700 mt-1">
                                <span className="font-medium">Colis:</span> {commande.colis.description} ({commande.colis.type})
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'nouvelle' && !showCommandeForm && (
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-bold text-emerald-800 flex items-center">
                        <FaPlus className="mr-2 sm:mr-3" /> Nouvelle Commande
                      </h2>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 sm:p-8 text-center border-2 border-dashed border-emerald-200 shadow-inner">
                      <div className="bg-gradient-to-b from-emerald-100 to-white w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm border border-emerald-100">
                        <FaBox className="text-emerald-600 text-2xl sm:text-4xl" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-emerald-800 mb-2 sm:mb-3">Commencez une nouvelle livraison</h3>
                      <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
                        Créez une nouvelle commande en quelques clics. Suivez votre livraison en temps réel une fois créée.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-full font-medium shadow-lg hover:shadow-xl transition-all flex items-center mx-auto group text-sm sm:text-base"
                        onClick={() => setShowCommandeForm(true)}
                      >
                        <FaPlus className="mr-2 transition-transform group-hover:rotate-90" /> 
                        <span>Créer une commande</span>
                      </motion.button>
                    </div>
                  </div>
                )}
                {activeTab === 'profil' && ProfileSection}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default EspaceClient;