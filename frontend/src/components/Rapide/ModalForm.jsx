
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImPointDown } from "react-icons/im";
import Expediteur from './Expediteur';
import Destinataire from './Destinataire';
import Colis from './Colis';
import axios from 'axios';
import { FaWhatsapp, FaPhone } from 'react-icons/fa';

const ModalForm = ({ user, onClose, onCommandeCreated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [dateLivraison, setDateLivraison] = useState(new Date());
  const [heureLivraison, setHeureLivraison] = useState('12:00');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commandeConfirmee, setCommandeConfirmee] = useState(null);
  const [direction, setDirection] = useState(1);
  const [showFullScreenAd, setShowFullScreenAd] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [adTimer, setAdTimer] = useState(30);

  const steps = ["Expéditeur", "Destinataire", "Colis", "Confirmation"];
  const modalRef = useRef(null);

  // Configuration de la publicité (8 images JPG)
  const ads = [
    { image: "/src/assets/pub/im1.jpg" },
    // { image: "/src/assets/pub/im2.jpg" },
    // { image: "/src/assets/pub/im3.jpg" },
    { image: "/src/assets/pub/im2.jpg" },
    // { image: "/src/assets/pub/im5.jpg" },
    // { image: "/src/assets/pub/im6.jpg" },
    { image: "/src/assets/pub/im3.jpg" },
    { image: "/src/assets/pub/im4.jpg" }
  ];

  useEffect(() => {
    let interval;
    
    if (showFullScreenAd) {
      // Timer pour le défilement des images
      interval = setInterval(() => {
        setCurrentAdIndex(prev => (prev + 1) % ads.length);
      }, 3750);
      
      // Timer pour la durée totale de la pub (30 secondes)
      const totalTimer = setTimeout(() => {
        setShowFullScreenAd(false);
        setShowConfirmation(true);
      }, 20000);
      
      // Timer pour le compte à rebours
      const countdownTimer = setInterval(() => {
        setAdTimer(prev => Math.max(0, prev - 1));
      }, 1000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(totalTimer);
        clearInterval(countdownTimer);
      };
    } else {
      setAdTimer(30); 
    }
  }, [showFullScreenAd]);

  const InputField = ({ label, name, value, onChange, placeholder, type = 'text', required = false, error, min, className, children }) => (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children || (
        type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            min={min}
            className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            rows="3"
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            min={min}
            className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          />
        )
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );

  const [formData, setFormData] = useState({
    nomExp: user?.fullName || '',
    numExp: user?.phone || '',
    adresseExp: user?.adresse || '', 
    nomDest: '',
    numDest: '',
    adresseDest: '',
    nomColis: '',
    typeColis: 'Plis',
    nombreColis: 1,
    poids: '',
    dimensions: '',
    valeurColis: '',
    assurance: false,
    instructions: '',
    acceptCGU: false
  });
  
  const heuresDisponibles = Array.from({ length: 14 }, (_, i) => {
    const heure = 8 + i;
    return `${heure < 10 ? '0' + heure : heure}:00`;
  });

  useEffect(() => {
    if (commandeConfirmee) {
      // Afficher directement la pub après la création de la commande
      setShowFullScreenAd(true);
    }
  }, [commandeConfirmee]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (currentStep === 1) {
      if (!formData.nomExp.trim()) errors.nomExp = "Le nom complet de l'expéditeur est requis.";
      if (!formData.numExp.trim()) errors.numExp = "Le numéro de téléphone de l'expéditeur est requis.";
      else if (!/^\+?\d{8,}$/.test(formData.numExp.trim())) errors.numExp = "Format de numéro de téléphone invalide.";
    }
    if (currentStep === 2) {
      if (!formData.nomDest.trim()) errors.nomDest = "Le nom complet du destinataire est requis.";
      if (!formData.numDest.trim()) errors.numDest = "Le numéro de téléphone du destinataire est requis.";
      else if (!/^\+?\d{8,}$/.test(formData.numDest.trim())) errors.numDest = "Format de numéro de téléphone invalide.";
      if (!formData.adresseDest.trim()) errors.adresseDest = "L'adresse complète du destinataire est requise.";
    }
    if (currentStep === 3) {
      if (!formData.nomColis.trim()) errors.nomColis = "La description du colis est requise.";
      if (formData.nombreColis <= 0) errors.nombreColis = "Le nombre de colis doit être supérieur à zéro.";
      if (formData.assurance && (formData.valeurColis <= 0 || isNaN(formData.valeurColis))) {
        errors.valeurColis = "Veuillez entrer une valeur valide pour le colis si l'assurance est activée.";
      }
    }
    if (currentStep === 4) {
      if (!formData.acceptCGU) errors.acceptCGU = "Vous devez accepter les conditions générales d'utilisation.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, currentStep]);

  const nextStep = () => {
    if (validateForm()) {
      setDirection(1);
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Veuillez corriger les erreurs dans le formulaire.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      const commandeData = {
        expedition: {
          nomComplet: formData.nomExp.trim(), 
          telephone: formData.numExp.trim(),
          adresse: formData.adresseExp?.trim() || ""
        },
        destination: {
          nomComplet: formData.nomDest.trim(),
          telephone: formData.numDest.trim(),
          adresse: formData.adresseDest.trim()
        },
        colis: {
          description: formData.nomColis.trim(),
          type: formData.typeColis,
          nombre: formData.nombreColis,
          poids: formData.poids ? parseFloat(formData.poids) : 0,
          dimensions: formData.dimensions?.trim() || "",
          valeur: formData.valeurColis ? parseFloat(formData.valeurColis) : 0,
          assurance: formData.assurance,
          dateLivraison: dateLivraison.toISOString(),
          heureLivraison: heureLivraison,
          instructions: formData.instructions?.trim() || "",
        },
        acceptCGU: formData.acceptCGU,
        status: "En attente"
      };

      const url = token 
        ? `${baseUrl}/api/commandes`
        : `${baseUrl}/api/guest/commandes`;
  
      const config = token 
        ? { headers: { Authorization: `Bearer ${token}` } } 
        : {};
  
      const response = await axios.post(url, commandeData, config);
      
      // const completeCommande = {
      //   ...response.data.commande,
      //   expedition: commandeData.expedition,
      //   destination: commandeData.destination,
      //   colis: commandeData.colis
      // };
      
      const completeCommande = {
        ...response.data.commande,
        expedition: {
          nomComplet: formData.nomExp.trim(),
          telephone: formData.numExp.trim(),
          adresse: formData.adresseExp?.trim() || ""
        },
        destination: {
          nomComplet: formData.nomDest.trim(),
          telephone: formData.numDest.trim(),
          adresse: formData.adresseDest.trim()
        },
        colis: {
          description: formData.nomColis.trim(),
          type: formData.typeColis,
          nombre: formData.nombreColis,
          poids: formData.poids ? parseFloat(formData.poids) : 0,
          dimensions: formData.dimensions?.trim() || "",
          valeur: formData.valeurColis ? parseFloat(formData.valeurColis) : 0,
          assurance: formData.assurance,
          dateLivraison: dateLivraison.toISOString(),
          heureLivraison: heureLivraison,
          instructions: formData.instructions?.trim() || "",
        }
      };
      setCommandeConfirmee(completeCommande);
      
      if (onCommandeCreated) {
        onCommandeCreated(completeCommande);
      }

    } catch (error) {
      console.error('Erreur création commande:', error);
      
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.statusText) {
          errorMessage = error.response.statusText;
        }
      } else if (error.request) {
        errorMessage = "Pas de réponse du serveur";
      } else {
        errorMessage = error.message;
      }
      
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
 
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCloseAfterConfirmation = () => {
    setCommandeConfirmee(null);
    setShowFullScreenAd(false);
    setShowConfirmation(false);
    onClose();
  };

  const handleNewOrder = () => {
    setCommandeConfirmee(null);
    setShowFullScreenAd(false);
    setShowConfirmation(false);
    setCurrentStep(1);
    setFormData({
      nomExp: user?.fullName || '',
      numExp: user?.phone || '',
      adresseExp: user?.adresse || '', 
      nomDest: '',
      numDest: '',
      adresseDest: '',
      nomColis: '',
      typeColis: 'Plis',
      nombreColis: 1,
      poids: '',
      dimensions: '',
      valeurColis: '',
      assurance: false,
      instructions: '',
      acceptCGU: false
    });
    setDateLivraison(new Date());
    setHeureLivraison('12:00');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const redirectToWhatsApp = (e) => {
    if (e) e.stopPropagation();
    
    if (!commandeConfirmee) return;
    
    const message = `Akwaba ! Je suis ${formData.nomExp}. 
J'ai passé une commande (${commandeConfirmee.commandeId}) à livrer le ${new Date(commandeConfirmee.colis.dateLivraison).toLocaleDateString('fr-FR')} à ${commandeConfirmee.colis.heureLivraison}. 

*Expéditeur:*
- Nom: ${commandeConfirmee.expedition.nomComplet}
- Téléphone: ${commandeConfirmee.expedition.telephone}
- Adresse: ${commandeConfirmee.expedition.adresse || 'N/A'}

*Destinataire:*
- Nom: ${commandeConfirmee.destination.nomComplet}
- Téléphone: ${commandeConfirmee.destination.telephone}
- Adresse: ${commandeConfirmee.destination.adresse}

*Colis:*
- Description: ${commandeConfirmee.colis.description}
- Type: ${commandeConfirmee.colis.type}
- Nombre: ${commandeConfirmee.colis.nombre}
- Instructions: ${commandeConfirmee.colis.instructions || 'Aucune'}

Pouvez-vous me confirmer le prix de livraison ?`; 

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/2250758732521?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.6
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -30,
      transition: { duration: 0.3 }
    }
  };

  const stepVariants = {
    initial: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  // Composant pour la pub plein écran
  const FullScreenAd = () => {
    const currentAd = ads[currentAdIndex];
    
    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-95 z-60 flex flex-col items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 flex items-center space-x-4">
          {/* Compte à rebours */}
          <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full font-bold text-lg">
            {adTimer}s
          </div>
          
          <button 
            onClick={() => {
              setShowFullScreenAd(false);
              setShowConfirmation(true);
            }}
            className="text-white hover:text-gray-200 z-70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAdIndex}
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                rotate: 0,
                transition: { 
                  duration: 1.5, 
                  ease: "easeInOut",
                  scale: { type: "spring", stiffness: 100 }
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 1.1, 
                rotate: 2,
                transition: { duration: 0.8 } 
              }}
              className="w-full h-full flex items-center justify-center p-4"
            >
              <motion.img 
                src={currentAd.image} 
                alt="Publicité" 
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
            </motion.div>
          </AnimatePresence>
          
          <motion.div
            className="text-center px-4 mt-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              transition: { 
                delay: 0.3,
                duration: 0.8,
                ease: "easeOut"
              }
            }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 bg-black bg-opacity-50 p-2 rounded-lg">
              Publicité
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto bg-black bg-opacity-50 p-2 rounded-lg">
              Merci de votre patience, votre commande sera confirmée dans {adTimer} secondes
            </p>
          </motion.div>
        </div>
        
        <div className="absolute bottom-4 text-white text-sm opacity-70">
          Publicité - Images changent toutes les 3.75 secondes
        </div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <motion.div
        ref={modalRef}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {showConfirmation ? (
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-block mb-6"
            >
              <svg className="h-24 w-24 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>
            
            <h3 className="text-3xl font-bold text-emerald-800 mb-4">Commande Confirmée !</h3>
            <p className="text-xl text-gray-700 mb-2">Votre commande a été créée avec succès.</p>
            <p className="text-lg text-gray-600 mb-8">
              Numéro de commande: <span className="font-bold text-emerald-600">{commandeConfirmee?.commandeId}</span>
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {/* <motion.button
                onClick={handleNewOrder}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 
                to-teal-400 text-white rounded-full font-semibold hover:from-emerald-600
                 hover:to-teal-500 transition-colors duration-200 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Nouvelle Commande
              </motion.button>
               */}
              {/* <motion.a
                href="tel:0758732521"
                className="px-6 py-3 bg-gradient-to-r from-purple-500
                 to-indigo-600 text-white rounded-full font-semibold hover:from-purple-600
                  hover:to-indigo-700 transition-colors duration-200 shadow-lg flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPhone className="mr-2" /> Appeler
              </motion.a> */}
              
              {/* Bouton WhatsApp dans la confirmation */}
              <motion.button
                onClick={redirectToWhatsApp}
                className="px-6 py-3 bg-gradient-to-r from-green-500
                 to-emerald-600 text-white rounded-full font-semibold hover:from-green-600
                  hover:to-emerald-700 transition-colors duration-200 shadow-lg flex items-center"
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0px 0px 15px rgba(72, 187, 120, 0.8)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FaWhatsapp className="mr-2 text-xl" /> 
                <span className="font-bold">Contact WhatsApp</span>
              </motion.button>
              
              <motion.button
                onClick={handleCloseAfterConfirmation}
                className="px-6 py-3 bg-gray-200 text-gray-700 
                rounded-full font-semibold hover:bg-gray-300 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Fermer
              </motion.button>
            </div>
          </div>
        ) : showFullScreenAd ? (
          <div className="h-full w-full bg-black" />
        ) : (
          <>
            <motion.div
              className="bg-gradient-to-br from-emerald-500 to-teal-400 p-6 rounded-t-3xl border-b border-emerald-600"
              initial={{ y: -70, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-extrabold text-white flex items-center">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      y: [0, -5, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <ImPointDown className="mr-3 text-yellow-300" />
                  </motion.div>
                  Commande en cours
                </h2>
                <motion.button
                  onClick={onClose}
                  className="text-gray-600 hover:text-red-500 transition-colors duration-200 p-2 rounded-full bg-white shadow-md"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Fermer le formulaire"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              <div className="mt-6">
                <div className="flex justify-between mb-2 px-2">
                  {steps.map((step, index) => (
                    <motion.div
                      key={index}
                      className={`text-lg font-semibold transition-all duration-500 ease-in-out ${
                        currentStep === index + 1
                          ? 'text-purple-700 text-xl'
                          : currentStep > index + 1
                            ? 'text-transparent opacity-0'
                            : 'text-transparent'
                      }`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      {step}
                    </motion.div>
                  ))}
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-lg"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                  />
                </div>
                <div className="text-center mt-2 text-sm text-gray-600">
                  Étape {currentStep} sur {steps.length}: {steps[currentStep - 1]}
                </div>
              </div>
            </motion.div>

            <div className="flex-1 overflow-y-auto p-8 bg-gray-100 backdrop-blur-sm hide-scrollbar">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="h-full"
                >
                  {currentStep === 1 && (
                    <Expediteur 
                      key="step1"
                      formData={formData} 
                      handleInputChange={handleInputChange} 
                      formErrors={formErrors} 
                      user={user}
                    />
                  )}
                  
                  {currentStep === 2 && (
                    <Destinataire 
                      key="step2"
                      formData={formData} 
                      handleInputChange={handleInputChange} 
                      formErrors={formErrors} 
                    />
                  )}
                  
                  {currentStep === 3 && (
                    <div>
                      <Colis 
                        key="step3"
                        formData={formData} 
                        handleInputChange={handleInputChange} 
                        formErrors={formErrors}
                        dateLivraison={dateLivraison}
                        setDateLivraison={setDateLivraison}
                        heureLivraison={heureLivraison}
                        setHeureLivraison={setHeureLivraison}
                        heuresLivraison={heuresDisponibles}
                      />
                      <InputField
                        label="Instructions spéciales pour le livreur"
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleInputChange}
                        placeholder="Ex: Appeler avant d'arriver, Déposer chez le voisin, etc."
                        type="textarea"
                        className="mt-6"
                      />
                    </div>
                  )}
                  
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-emerald-800 pb-3 border-b-2 border-emerald-200 mb-6">
                        Récapitulatif de la Commande
                      </h3>

                      <div className="bg-white shadow-lg rounded-xl p-6 space-y-4">
                        <div className="mb-6">
                          <h4 className="text-lg font-bold text-emerald-700 mb-3">Informations Générales</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Date de Livraison</p>
                              <p className="font-medium">{dateLivraison.toLocaleDateString('fr-FR')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Heure de Livraison</p>
                              <p className="font-medium">{heureLivraison}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Instructions</p>
                              <p className="font-medium">
                                {formData.instructions || 'Aucune instruction spécifique'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-lg font-bold text-emerald-700 mb-3">Expéditeur</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Nom Complet</p>
                              <p className="font-medium">{formData.nomExp}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Téléphone</p>
                              <p className="font-medium">{formData.numExp}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Adresse</p>
                              <p className="font-medium">{formData.adresseExp || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-lg font-bold text-emerald-700 mb-3">Destinataire</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Nom Complet</p>
                              <p className="font-medium">{formData.nomDest}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Téléphone</p>
                              <p className="font-medium">{formData.numDest}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Adresse</p>
                              <p className="font-medium">{formData.adresseDest}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-lg font-bold text-emerald-700 mb-3">Détails du Colis</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Description</p>
                              <p className="font-medium">{formData.nomColis}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Type</p>
                              <p className="font-medium">{formData.typeColis}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Nombre</p>
                              <p className="font-medium">{formData.nombreColis}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Poids (kg)</p>
                              <p className="font-medium">{formData.poids || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Dimensions</p>
                              <p className="font-medium">{formData.dimensions || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Valeur Déclarée</p>
                              <p className="font-medium">{formData.valeurColis ? `${formData.valeurColis} FCFA` : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Assurance</p>
                              <p className="font-medium">{formData.assurance ? 'Oui' : 'Non'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center">
                          <svg className="w-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-yellow-700">
                            Le prix sera fixé par notre équipe et vous sera communiqué ultérieurement.
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <label htmlFor="acceptCGU" className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id="acceptCGU"
                            name="acceptCGU"
                            checked={formData.acceptCGU}
                            onChange={handleInputChange}
                            className={`form-checkbox h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500 ${formErrors.acceptCGU ? 'border-red-500' : ''}`}
                          />
                          <span className="ml-3 text-base text-gray-700">
                            J'accepte les <a href="#" className="text-emerald-600 hover:underline">conditions générales d'utilisation</a>.
                          </span>
                        </label>
                        {formErrors.acceptCGU && (
                          <p className="mt-2 text-sm text-red-600">
                            {formErrors.acceptCGU}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div
              className="p-6 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-b-3xl border-t border-emerald-600 flex justify-between items-center shadow-inner"
              initial={{ y: 70, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 100 }}
            >
              <motion.button
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Précédent
              </motion.button>

              {currentStep < steps.length ? (
                <motion.button
                  onClick={nextStep}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 shadow-lg flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Suivant
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-full font-semibold hover:from-emerald-700 hover:to-teal-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirmer la Commande
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>
          </>
        )}
      </motion.div>

      {showFullScreenAd && <FullScreenAd />}
    </div>
  );
};
export default ModalForm;

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};
// Composants pour la section de récapitulatif
const SummarySection = ({ title, children }) => (
  <motion.div variants={itemVariants} className="mb-6">
    <h4 className="text-lg font-semibold text-emerald-700 mb-3">{title}</h4>
    <div className="bg-emerald-50 p-4 rounded-xl">
      {children}
    </div>
  </motion.div>
);
const SummaryItem = ({ label, value }) => (
  <motion.div variants={itemVariants} className="flex justify-between py-2 border-b border-emerald-100 last:border-b-0">
    <span className="text-gray-600 font-medium">{label}:</span>
    <span className="text-emerald-800 font-semibold">{value}</span>
  </motion.div>
);
// import io from 'socket.io-client';
// --- Reusable Components ---
/**
 * 
 * @typedef {object} InputFieldProps
 * @property {string} label 
 * @property {string} name 
 * @property {string} value 
 * @property {(e: React.ChangeEvent<HTMLInputElement
 *  | HTMLTextAreaElement | HTMLSelectElement>) => void} onChange 
 * @property {string} [placeholder] 
 * @property {string} [type='text'] 
 * @property {boolean} [required=false] 
 * @property {string} [error] 
 * @property {number} [min] 
 * @property {string} [className] 
 * @property {React.ReactNode} [children] 
 */
/**
 * @param {InputFieldProps} props
 */
/**
 * @param {object} props
 * @param {string} props.searchQuery
 * @param {(query: string) => void} props.setSearchQuery
 * @param {Array<object>} props.searchResults
 * @param {(item: object) => void} props.selectLocation
 * @param {boolean} props.showDropdown
 * @param {(show: boolean) => void} props.setShowDropdown
 * @param {string} [props.error]
 */
/**
 * la partie locatisation.
 * @param {object} props
 * @param {Array<object>} props.selectedLocations
 * @param {(id: string) => void} props.removeLocation
 */
const Confirmation = ({ commande, onClose, onNewOrder }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showAd, setShowAd] = useState(true);
  const [smsNotification, setSmsNotification] = useState({
    visible: false,
    message: '',
    commandeId: ''
  });
  
  const handleSkipAd = () => {
    setShowAd(false);
  };

  // Advertissement avec animations
  const Advertissement = () => (
    <motion.div
      className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Particules animées */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-emerald-300 text-2xl opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, (i % 2 === 0 ? -1 : 1) * 50, 0],
            rotate: [0, (i % 2 === 0 ? -1 : 1) * 180, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ✨
        </motion.div>
      ))}

      {/* Titre principal */}
      <motion.div
        className="text-center mb-12"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-6"
          animate={{
            textShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.8)", "0 0 0px rgba(255,255,255,0)"],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          Félicitations !
        </motion.h1>
        
        <motion.div
          className="text-xl md:text-2xl max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="mb-4">
            Votre commande a été confirmée avec succès.
          </p>
          <p>
            Merci de faire confiance à <span className="font-bold">NAYA</span>, votre partenaire de livraison express.
          </p>
        </motion.div>
      </motion.div>

      {/* Carte de fidélité */}
      <motion.div
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-emerald-300 border-dashed w-full max-w-md relative overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        whileHover={{ scale: 1.03 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -rotate-45"></div>
        
        <div className="relative z-10 text-center">
          <motion.div
            className="text-5xl mb-4"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            🎉
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-3">Client Fidèle</h2>
          <p className="mb-4">Votre satisfaction est notre priorité absolue</p>
          
          <motion.div
            className="inline-block px-6 py-3 bg-emerald-600 rounded-full font-bold"
            animate={{
              background: [
                'linear-gradient(90deg, #059669, #10b981)',
                'linear-gradient(90deg, #10b981, #34d399)',
                'linear-gradient(90deg, #34d399, #059669)'
              ]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            #NAYAPremium
          </motion.div>
        </div>
      </motion.div>

      {/* Bouton pour passer la pub */}
      <motion.button
        className="px-8 py-4 bg-white text-emerald-700 font-bold text-xl rounded-full shadow-lg mt-10 relative z-10"
        onClick={handleSkipAd}
        whileHover={{ 
          scale: 1.05,
          backgroundColor: "#f0f0f0"
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        Voir ma commande
      </motion.button>
    </motion.div>
  );

  useEffect(() => {
    if (commande && commande.expedition && commande.expedition.telephone) {
      const phone = commande.expedition.telephone;
      const maskedPhone = `${phone.substring(0, 4)}****${phone.substring(8)}`;
      
      // Utilisation de l'ID de commande personnalisé
      setSmsNotification({
        visible: true,
        message: `Un SMS de confirmation a été envoyé au ${maskedPhone}`,
        commandeId: commande.commandeId
      });

      const timer = setTimeout(() => {
        setSmsNotification(prev => ({ ...prev, visible: false }));
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [commande]);

  useEffect(() => {
    if (showAd) {
      const timer = setTimeout(() => {
        setShowAd(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showAd]);

  if (showAd) {
    return <Advertissement />;
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? "N/A"
      : date.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString.substring(0, 5);
  };
  const handleSavePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // En-tête PDF avec alignement sur les logos
      const imgWidth = 15;
      const imgHeight = 15;
      const headerY = 10;
      
      // Fonction pour charger les images
      const loadImageAsBase64 = async (imgPath) => {
        try {
          const response = await fetch(imgPath);
          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("Erreur de chargement de l'image:", error);
          return null;
        }
      };
  
      // Charger les images
      const nayaBase64 = await loadImageAsBase64(nayaImage);
      const embleBase64 = await loadImageAsBase64(embleImage);
      
      // Ajout des logos
      if (nayaBase64) {
        pdf.addImage(nayaBase64, 'JPEG', 20, headerY, imgWidth, imgHeight);
      }
      
      if (embleBase64) {
        pdf.addImage(embleBase64, 'PNG', 165, headerY, imgWidth, imgHeight);
      }
      
      // Calculer la position Y alignée avec les logos
      const logoBottomY = headerY + imgHeight;
      
      // Titre aligné avec le bas des logos
      pdf.setFontSize(18);
      pdf.setTextColor(5, 150, 105);
      pdf.text("CONFIRMATION DE COMMANDE", 105, logoBottomY + 5, 'center');
      
      // Séparateur positionné juste en dessous du titre
      const separatorY = logoBottomY + 8;
      pdf.setDrawColor(5, 150, 105);
      pdf.setLineWidth(0.5);
      pdf.line(20, separatorY, 190, separatorY);
      
      // Position Y initiale pour le contenu après le séparateur
      const contentStartY = separatorY + 15;
      let yPosition = contentStartY;
      const col1X = 20;
      const col2X = 105;
      const colWidth = 80;
      
      // Fonction pour ajouter une section
      const addSection = (title, content, column) => {
        const xPos = column === 1 ? col1X : col2X;
        
        pdf.setFontSize(12);
        pdf.setTextColor(5, 150, 105);
        pdf.text(title.toUpperCase() + ":", xPos, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        const lines = pdf.splitTextToSize(content, colWidth - 5);
        lines.forEach(line => {
          if (yPosition > 280) {
            pdf.addPage();
            yPosition = 30;
            // Réafficher le titre sur la nouvelle page
            pdf.setFontSize(12);
            pdf.setTextColor(5, 150, 105);
            pdf.text(title.toUpperCase() + ":", xPos, yPosition);
            yPosition += 8;
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
          }
          
          pdf.text(line, xPos + 5, yPosition);
          yPosition += 7;
        });
        
        yPosition += 10;
      };

      // Fonction pour formater les montants sans séparateurs
      const formatMontant = (montant) => {
        if (typeof montant === 'number') {
          // Convertir en entier et formater sans séparateurs
          return Math.round(montant).toString();
        }
        return montant || '0';
      };
      
      // Colonne gauche
      addSection("Expéditeur", [
        `${commande.expedition?.prenom || ''} ${commande.expedition?.nom || ''}`,
        `Tél: ${commande.expedition?.telephone || ''}`,
        `Email: ${commande.expedition?.email || 'N/A'}`,
        `Adresse: ${commande.expedition?.adresse || 'N/A'}`
      ].join('\n'), 1);
      
      addSection("Destinataire", [
        `${commande.destination?.prenom || ''} ${commande.destination?.nom || ''}`,
        `Tél: ${commande.destination?.telephone || ''}`,
        `Email: ${commande.destination?.email || 'N/A'}`,
        `Adresse: ${commande.destination?.adresse || 'N/A'}`
      ].join('\n'), 1);
      
      addSection("Livraison", [
        `Date: ${formatDate(commande.livraison?.date)} à ${formatTime(commande.livraison?.heure)}`,
        `Instructions: ${commande.livraison?.instructions || 'Aucune'}`,
        `Zones: ${commande.livraison?.zones?.map(z => z.displayName).join(', ') || 'Aucune'} `,
        
      ].join('\n'), 1);
      
      // Colonne droite - Réinitialiser Y
      yPosition = contentStartY;
      
      addSection("Détails du colis", [
        `Description: ${commande.colis?.description || 'N/A'}`,
        `Type: ${commande.colis?.type || 'N/A'}`,
        `Nombre: ${commande.colis?.nombre || 'N/A'}`,
        `Poids: ${commande.colis?.poids || 'N/A'} kg`,
        `Dimensions: ${commande.colis?.dimensions || 'N/A'}`,
        `Valeur: ${formatMontant(commande.colis?.valeur) || 'N/A'} FCFA`,
        `Assurance: ${commande.colis?.assurance ? 'Oui' : 'Non'}`
      ].join('\n'), 2);
      
      addSection("Paiement", [
        `Mode: ${commande.paiement?.mode || 'N/A'}`,
        // `Code commande: ${commande.paiement?.reference || 'N/A'}`,
        `Montant total: ${formatMontant(commande.paiement?.montant)} FCFA`,
      ].join('.'), 2);

      // Référence et date après paiement
      yPosition += 5;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Référence: ${commande.commandeId || 'N/A'}`, col2X, yPosition);
      yPosition += 5;
      pdf.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, col2X, yPosition);
      
      // Pied de page
      const footerY = 180;
      pdf.setDrawColor(160, 160, 160);
      pdf.setLineWidth(0.2);
      pdf.line(20, footerY, 140, footerY);
      
      pdf.setFontSize(8);
      pdf.setTextColor(80, 80, 80);
      pdf.text("NAYA - Service Livraison Rapide Professionnel", 105, footerY + 5, 'center');
      pdf.text("contact@naya.ci - (+225) 27 20 30 40 50 - www.naya.ci", 105, footerY + 10, 'center');
  
      // Enregistrement du PDF
      pdf.save(`commande-${commande.commandeId}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Une erreur est survenue lors de la génération du PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  if (!commande) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
         <AnimatePresence>
          {smsNotification.visible && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <div>
                  <p className="font-bold">{smsNotification.message}</p>
                  {/* Utilisation de l'ID personnalisé */}
                  <p className="text-sm">Code: {smsNotification.commandeId}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mb-4"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-gray-700"
        >
          Chargement des détails de la commande...
        </motion.p>
      </div>
    );
  }

  // Utilisation de l'ID personnalisé "nay/2025-00109-ci"
  const commandeId = commande.commandeId || 'N/A';
  const createdAt = commande.createdAt || commande.date || '';

  // Extraction des données
  const {
    nom: nomExp = '',
    prenom: prenomExp = '',
    telephone: telExp = '',
    email: emailExp = '',
    adresse: adresseExp = ''
  } = commande.expedition || {};

  const {
    nom: nomDest = '',
    prenom: prenomDest = '',
    telephone: telDest = '',
    email: emailDest = '',
    adresse: adresseDest = ''
  } = commande.destination || {};

  const descColis = commande.colis?.description || '';
  const typeColis = commande.colis?.type || '';
  const nbColis = commande.colis?.nombre || '';
  const poids = commande.colis?.poids || '';
  const dimensions = commande.colis?.dimensions || '';
  const valeurColis = commande.colis?.valeur || '';
  const assurance = commande.colis?.assurance || false;

  const dateLiv = commande.livraison?.date || '';
  const heureLiv = commande.livraison?.heure || '';
  const instructions = commande.livraison?.instructions || '';
  const zones = commande.livraison?.zones || [];

  const {
    mode: modePaiement = '',
    reference: refPaiement = '',
    montant: montantPaiement = 0
  } = commande.paiement || {};

  return (
    <div className="h-full flex flex-col relative bg-gradient-to-b from-emerald-50 to-white">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-t-3xl"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="p-6 bg-white/80 border border-emerald-200 rounded-xl sticky bottom-0 shadow-sm"
        >
          <div className="flex flex-wrap justify-center gap-3"> 
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#059669" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSavePDF}
              disabled={isGeneratingPDF}
              className="px-4 py-4 bg-red-200 text-white rounded-lg font-medium transition-colors disabled:opacity-75 flex items-center justify-center"
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Génération...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  
                </>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#10b981" }}
              whileTap={{ scale: 0.95 }}
              onClick={onNewOrder}
              className="px-4 py-4 bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#9ca3af" }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-4 py-4 bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <div className="flex-1 min-h-0 overflow-y-auto p-6 hide-scrollbar" id="print-section">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6 max-h-[85vh] overflow-y-auto border border-emerald-100"
          >
            {/* En-tête */}
            <div className="flex flex-col items-center mb-8 pb-4 border-b-2 border-emerald-200">
              <div className="flex items-center justify-center gap-4 mb-4">
                <img 
                  src={nayaImage} 
                  alt="Logo NAYA" 
                  className="w-16 h-16 object-contain"
                />
                <h3 className="text-2xl font-bold text-emerald-800">
                  Espace commande
                </h3>
                <img 
                  src={embleImage} 
                  alt="Emblème" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="mt-2 bg-gradient-to-r from-emerald-400 to-teal-500 h-1 w-32 rounded-full"></div>
            </div>
            
            {/* Section ID de commande */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-emerald-50 p-4 rounded-xl border border-emerald-100"
              >
                <h4 className="font-semibold text-emerald-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Code commande
                </h4>
                {/* Affichage de l'ID personnalisé */}
                <p className="text-lg font-mono font-bold text-emerald-800">{commandeId}</p>
              </motion.div>
              
              <motion.div
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-emerald-50 p-4 rounded-xl border border-emerald-100"
              >
                <h4 className="font-semibold text-emerald-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Date de création
                </h4>
                <p className="text-lg text-emerald-900">{formatDateTime(createdAt)}</p>
              </motion.div>
            </div>

            {/* Section Expéditeur et Destinataire */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-emerald-50 p-4 rounded-xl border border-emerald-100"
              >
                <h4 className="font-semibold text-emerald-700 mb-3 flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  Expéditeur
                </h4>
                <div className="space-y-2 text-lg text-emerald-900">
                  <p className="font-bold">
                    {prenomExp} {nomExp}
                  </p>
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {telExp}
                  </p>
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {emailExp || 'N/A'}
                  </p>
                  <p className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-1 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {adresseExp || 'N/A'}
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-emerald-50 p-4 rounded-xl border border-emerald-100"
              >
                <h4 className="font-semibold text-emerald-700 mb-3 flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Destinataire
                </h4>
                <div className="space-y-2 text-lg text-emerald-900">
                  <p className="font-bold">
                    {prenomDest || 'N/A'} {nomDest || 'N/A'}
                  </p>
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {telDest}
                  </p>
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {emailDest || 'N/A'}
                  </p>
                  <p className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-1 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {adresseDest}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Section Livraison et Colis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="bg-emerald-50 p-4 rounded-xl border border-emerald-100"
              >
                <h4 className="font-semibold text-emerald-700 mb-3 flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Livraison prévue
                </h4>
                <div className="space-y-2">
                  <p className="font-bold text-lg text-emerald-900">
                    {formatDate(dateLiv)} à {formatTime(heureLiv)}
                  </p>
                  {instructions && (
                    <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="font-bold text-emerald-700">Instructions spéciales:</p>
                      <p className="text-emerald-900 mt-1 text-lg">{instructions}</p>
                    </div>
                  )}

                <h4 className="font-semibold text-emerald-700 mb-3 flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Zones de livraison
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {zones.map((zone, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="flex justify-between items-center bg-white p-3 rounded-lg border border-emerald-100"
                    >
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-emerald-400 mr-3"></div>
                        <span className="font-bold text-emerald-900">{zone.displayName || zone.quartier || 'N/A'}</span>
                      </div>
                      <span className="font-bold text-emerald-600">{zone.price || 0} FCFA</span>
                    </motion.div>
                  ))}
                </div>

              <h4 className="font-semibold text-emerald-700 mb-4 flex items-center text-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                Paiement
              </h4>
              <div className="flex flex-wrap justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="font-bold text-lg text-emerald-900">
                    <span>Mode de paiement:</span> {modePaiement || 'N/A'}
                  </p>
                  {refPaiement && (
                    <p className="text-emerald-900 mt-1 text-lg">
                      <span className="font-bold">Référence:</span> {refPaiement}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-emerald-600 text-sm">Montant total</p>
                  <p className="text-2xl font-bold text-emerald-800">
                    {montantPaiement?.toLocaleString('fr-FR') || 0} FCFA
                  </p>
                </div>
              </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="bg-emerald-50 p-4 rounded-xl border border-emerald-100"
              >
                <h4 className="font-semibold text-emerald-700 mb-3 flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                  Détails du colis
                </h4>
                <div className="space-y-3 text-lg text-emerald-900">
                  <div>
                    <p className="font-bold">Description:</p>
                    <p>{descColis || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-bold">Type:</p>
                      <p>{typeColis || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-bold">Nombre:</p>
                      <p>{nbColis || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-bold">Poids:</p>
                      <p>{poids ? `${poids} kg` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-bold">Dimensions:</p>
                      <p>{dimensions || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <p className="font-bold">Valeur déclarée:</p>
                      <p>{valeurColis ? `${valeurColis} FCFA` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-bold">Assurance:</p>
                      <p className={`font-bold ${assurance ? 'text-emerald-600' : 'text-gray-600'}`}>
                        {assurance ? 'Oui' : 'Non'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

