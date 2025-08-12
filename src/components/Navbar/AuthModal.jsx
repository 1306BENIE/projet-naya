
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaEye, 
  FaEyeSlash, 
  FaLock, 
  FaPhone, 
  FaEnvelope, 
  FaIdCard, 
  FaUser, 
  FaUserTie,
  FaTimes,
  FaCheckCircle,
  FaStore,
  FaUserShield,
  FaKey,
  FaMapMarkerAlt,
  FaCheck
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { 
  formatPhoneNumber, 
  validatePhone, 
  checkUserExists, 
  registerUser, 
  loginUser 
} from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const InputField = React.forwardRef(({ 
  icon, 
  type, 
  placeholder,  
  value, 
  fieldName,
  error, 
  showToggle,
  onToggleVisibility,
  onChange,
  className = "",
  autoFocus = false
}, ref) => (
  <div className={`mb-5 ${className}`}>
    <div className={`relative flex items-center border ${
      error ? 'border-rose-500' : 'border-gray-200'
    } rounded-xl transition-all duration-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 bg-white shadow-sm`}>
      <div className="pl-4 text-gray-400">
        {icon}
      </div>
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(fieldName, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-4 outline-none bg-transparent text-gray-800 placeholder-gray-400"
        autoFocus={autoFocus}
      />
      {showToggle && (
        <button
          type="button"
          className="px-4 text-gray-400 hover:text-emerald-600 transition-colors"
          onClick={onToggleVisibility}
        >
          {type === "password" ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      )}
    </div>
    {error && (
      <motion.p 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-sm text-rose-600 flex items-center"
      >
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
        </svg>
        {error}
      </motion.p>
    )}
  </div>
));

const PasswordStrengthIndicator = ({ password, strength }) => {
  const strengthLabels = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"];
  const strengthColors = ["bg-rose-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-400", "bg-emerald-600"];
  
  return (
    <div className="mb-5">
      <div className="flex h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className={`flex-1 mr-0.5 last:mr-0 transition-all duration-500 ${
              i < strength ? strengthColors[i] : 'bg-gray-100'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 font-medium">
        {password ? (
          <span className={strength > 2 ? "text-emerald-600" : "text-orange-500"}>
            {strengthLabels[strength - 1] || "Sécurité du mot de passe"}
          </span>
        ) : (
          "Commencez à taper votre mot de passe"
        )}
      </p>
    </div>
  );
};

const STEPS = {
  INITIAL: 1,
  SET_PASSWORD: 2,
  SUCCESS: 3
};

const AuthModal = ({ showModal, onClose, isNewUser, setIsNewUser, onSuccess }) => {
  const navigate = useNavigate();
  const [internalIsNewUser, setInternalIsNewUser] = useState(isNewUser);
  const [formData, setFormData] = useState({
    fullName: "", 
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    adresse: "",
    role: "client"
  });
  
  const [step, setStep] = useState(STEPS.INITIAL);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [redirectToClient, setRedirectToClient] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [userCreated, setUserCreated] = useState(false);
  
  const fullNameRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const modalContentRef = useRef(null);

  const resetForm = useCallback(() => {
    setFormData({
      fullName: "", 
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      adresse: "",
      role: "client"
    });
    setErrors({});
    setLoading(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRememberMe(false);
    setPasswordStrength(0);
    setSuccessMessage("");
    setUserCreated(false);
  }, []);
  
  useEffect(() => {
    if (redirectToClient) {
      onClose();
      onSuccess();
    }
  }, [redirectToClient, onClose, onSuccess]);
  
  useEffect(() => {
    if (showModal) {
      setInternalIsNewUser(isNewUser);
      resetForm();
      setStep(STEPS.INITIAL);
      setTimeout(() => {
        if (isNewUser && fullNameRef.current) {
          fullNameRef.current.focus();
        } else if (phoneRef.current) {
          phoneRef.current.focus();
        }
      }, 100);
    }
  }, [showModal, resetForm, isNewUser]);

  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (formData.password.length >= 8) strength += 1;
    if (/[A-Z]/.test(formData.password)) strength += 1;
    if (/[0-9]/.test(formData.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;

    setPasswordStrength(Math.min(strength, 5));
  }, [formData.password]);

  const validateStep1 = () => {
    const newErrors = {};
    
    if (internalIsNewUser) {
      if (!formData.fullName || formData.fullName.trim().length < 2) {
        newErrors.fullName = "Nom complet requis (min. 2 caractères)";
      }

      const formattedPhone = formatPhoneNumber(formData.phoneNumber);
      if (!formData.phoneNumber || !validatePhone(formattedPhone)) {
        newErrors.phoneNumber = "Format: 10 chiffres (ex: 0700000000)";
      }

      if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Adresse e-mail invalide";
      }
      
      if (!formData.role) {
        newErrors.role = "Veuillez sélectionner un rôle";
      }
    } else {
      const formattedPhone = formatPhoneNumber(formData.phoneNumber);
      if (!formData.phoneNumber || !validatePhone(formattedPhone)) {
        newErrors.phoneNumber = "Format: 10 chiffres (ex: 0700000000)";
      }

      if (!formData.password || formData.password.length < 8) {
        newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
      }
      
      if (!formData.role) {
        newErrors.role = "Veuillez sélectionner un rôle";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    } else if (passwordStrength < 3) {
      newErrors.password = "Le mot de passe est trop faible";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLoginSuccess = (user) => {
    localStorage.setItem('userData', JSON.stringify(user));
    onClose();
    
    // Rediriger selon le rôle
    if (user.role === 'admin') {
      navigate('/admin'); // Redirection vers /admin
    } else if (user.role === 'manager') {
      navigate('/manager');
    } else {
      navigate('/espace-client');
    }
  };

  const handleContinueToPassword = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep1()) return;

    setErrors({});
    setLoading(true);
    
    try {
      const formattedPhone = formatPhoneNumber(formData.phoneNumber);
      if (!validatePhone(formattedPhone)) {
        throw new Error("Numéro invalide. Format: 10 chiffres (ex: 0700000000)");
      }

      const userCheck = await checkUserExists(formattedPhone, formData.role);
      if (userCheck.exists) {
        throw new Error("Ce numéro est déjà utilisé pour ce rôle");
      }
      
      setStep(STEPS.SET_PASSWORD);
    } catch (err) {
      setErrors({ 
        form: err.message || "Erreur lors de la vérification du compte",
        ...(err.message.includes("numéro") && { phoneNumber: err.message })
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep2()) return;
  
    setLoading(true);
    
    try {
      const formattedPhone = formatPhoneNumber(formData.phoneNumber);
      
      const payload = {
        fullName: formData.fullName,
        phone: formattedPhone,
        email: formData.email,
        password: formData.password,
        adresse: formData.adresse,
        role: formData.role
      };
     
      const data = await registerUser(payload);
  
      localStorage.setItem('authToken', data.token);
      
      // Appeler handleLoginSuccess avec les données de l'utilisateur
      handleLoginSuccess(data);
    } catch (err) {
      if (err.message.includes("déjà utilisé")) {
        setErrors({ form: err.message });
      } else {
        setErrors({ 
          form: err.message || "Erreur lors de la création du compte" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithPassword = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep1()) return;

    setLoading(true);
    
    try {
      let identifier;
      
      identifier = formatPhoneNumber(formData.phoneNumber);
      
      const data = await loginUser({
        identifier,
        password: formData.password,
        role: formData.role
      });

      localStorage.setItem('authToken', data.token);
      
      // Appeler handleLoginSuccess avec les données de l'utilisateur
      handleLoginSuccess(data);
    } catch (err) {
      setErrors({ 
        form: err.message || "Identifiants incorrects ou rôle invalide" 
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (internalIsNewUser) {
      switch(step) {
        case STEPS.INITIAL: return 33;
        case STEPS.SET_PASSWORD: return 66;
        case STEPS.SUCCESS: return 100;
        default: return 0;
      }
    } else {
      return 100;
    }
  };

  const renderSetPasswordStep = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0, transition: { duration: 0.4 } }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.3 } }}
    >
      <form onSubmit={handleCreateAccount}>
        <div className="mb-6">
          <h4 className="text-gray-700 font-medium mb-3 flex items-center">
            <FaLock className="text-emerald-500 mr-2" />
            Créer votre mot de passe
          </h4>
          <p className="text-sm text-gray-500 mb-5">
            Pour la sécurité de votre compte, choisissez un mot de passe fort
          </p>
        </div>

        <InputField
          ref={passwordRef}
          icon={<FaLock className="text-emerald-400 animate-pulse" />}
          type={showPassword ? "text" : "password"}
          placeholder="Nouveau mot de passe"
          value={formData.password}
          fieldName="password"
          error={errors.password}
          showToggle={true}
          onToggleVisibility={() => setShowPassword(!showPassword)}
          onChange={handleChange}
          autoFocus
        />

        <PasswordStrengthIndicator 
          password={formData.password} 
          strength={passwordStrength} 
        />

        <InputField
          ref={confirmPasswordRef}
          icon={<FaLock className="text-emerald-400" />}
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirmer le mot de passe"
          value={formData.confirmPassword}
          fieldName="confirmPassword"
          error={errors.confirmPassword}
          showToggle={true}
          onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
          onChange={handleChange}
        />

        <div className="flex justify-between gap-3 mt-8">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep(STEPS.INITIAL)}
            className="px-5 py-3.5 text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors font-medium flex-1"
            disabled={loading}
          >
            Retour
          </motion.button>
          
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:opacity-95 transition-all flex items-center justify-center flex-1 shadow-lg shadow-emerald-200/50 font-medium"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Finaliser"
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );

  const renderSuccessStep = () => (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="flex justify-center mb-6">
        <motion.div
          className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <FaCheckCircle className="text-emerald-500 text-5xl" />
        </motion.div>
      </div>
      
      <h3 className="text-2xl font-bold text-emerald-700 mb-3">
        Compte créé avec succès!
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Votre compte a été créé avec succès. Veuillez maintenant vous connecter avec vos identifiants.
      </p>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setStep(STEPS.INITIAL);
          setInternalIsNewUser(false);
        }}
        className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:opacity-95 transition-all flex items-center justify-center mx-auto shadow-lg shadow-emerald-200/50 font-medium"
      >
        Se connecter
      </motion.button>
    </motion.div>
  );
  
  const renderRoleSelector = () => (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Vous êtes
      </label>
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`py-4 px-4 rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden group ${
            formData.role === "client"
              ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg"
              : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
          } transition-all duration-300`}
          onClick={() => handleChange("role", "client")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
          <div className="relative z-10">
            <motion.div
              animate={{ 
                scale: formData.role === "client" ? [1, 1.1, 1] : 1,
                rotate: formData.role === "client" ? [0, 5, -5, 0] : 0
              }}
              transition={{ duration: 0.5 }}
              className="mb-2"
            >
              <FaStore className="text-2xl text-blue-500" />
            </motion.div>
            <span className="font-medium">Client</span>
          </div>
          {formData.role === "client" && (
            <motion.div 
              className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <FaCheck className="text-xs" />
            </motion.div>
          )}
        </motion.button>
        
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`py-4 px-4 rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden group ${
            formData.role === "manager"
              ? "border-purple-500 bg-purple-50 text-purple-700 shadow-lg"
              : "border-gray-200 bg-white text-gray-700 hover:border-purple-300"
          } transition-all duration-300`}
          onClick={() => handleChange("role", "manager")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
          <div className="relative z-10">
            <motion.div
              animate={{ 
                scale: formData.role === "manager" ? [1, 1.1, 1] : 1,
                rotate: formData.role === "manager" ? [0, 5, -5, 0] : 0
              }}
              transition={{ duration: 0.5 }}
              className="mb-2"
            >
              <FaUserShield className="text-2xl text-purple-500" />
            </motion.div>
            <span className="font-medium">Manager</span>
          </div>
          {formData.role === "manager" && (
            <motion.div 
              className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <FaCheck className="text-xs" />
            </motion.div>
          )}
        </motion.button>
        
        {/* <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`py-4 px-4 rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden group ${
            formData.role === "admin"
              ? "border-red-500 bg-red-50 text-red-700 shadow-lg"
              : "border-gray-200 bg-white text-gray-700 hover:border-red-300"
          } transition-all duration-300`}
          onClick={() => handleChange("role", "admin")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
          <div className="relative z-10">
            <motion.div
              animate={{ 
                scale: formData.role === "admin" ? [1, 1.1, 1] : 1,
                rotate: formData.role === "admin" ? [0, 5, -5, 0] : 0
              }}
              transition={{ duration: 0.5 }}
              className="mb-2"
            >
              <FaUserTie className="text-2xl text-red-500" />
            </motion.div>
            <span className="font-medium">Admin</span>
          </div>
          {formData.role === "admin" && (
            <motion.div 
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <FaCheck className="text-xs" />
            </motion.div>
          )}
        </motion.button> */}
      </div>
      {errors.role && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-rose-600 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
          </svg>
          {errors.role}
        </motion.p>
      )}
    </div>
  );

  if (!showModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-b from-white to-emerald-50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto"
          ref={modalContentRef}
          id="auth-modal-content"
        >
          <div className="p-7">
            <div className="flex justify-between items-center mb-7">
              <motion.h3 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-emerald-800"
              >
                {internalIsNewUser 
                  ? step === STEPS.SET_PASSWORD 
                    ? "Finaliser votre compte" 
                    : step === STEPS.SUCCESS
                      ? "Compte créé"
                      : "Créer votre compte" 
                  : "Connectez-vous"}
              </motion.h3>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-emerald-600 text-xl font-light leading-none transition-colors"
                aria-label="Fermer"
              >
                <FaTimes />
              </motion.button>
            </div>

            {errors.form && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start"
              >
                <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                {errors.form}
              </motion.div>
            )}

            {successMessage && step !== STEPS.SUCCESS && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm"
              >
                {successMessage}
              </motion.div>
            )}

            {step !== STEPS.SUCCESS && renderRoleSelector()}

            {step !== STEPS.SUCCESS && step !== STEPS.SET_PASSWORD && (
              <div className="mb-7">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">
                    Étape {step} sur {internalIsNewUser ? 2 : 1}
                  </span>
                  <span className="text-xs font-medium text-emerald-600">
                    {getProgressPercentage()}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${getProgressPercentage()}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                  />
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === STEPS.INITIAL && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.4 } }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.3 } }}
                >
                  <form onSubmit={internalIsNewUser ? handleContinueToPassword : handleLoginWithPassword}>
                    {internalIsNewUser ? (
                      <>
                        <div className="mb-6">
                          <h4 className="text-gray-700 font-medium mb-3 flex items-center">
                            <FaUser className="text-blue-500 mr-2" />
                            Informations personnelles
                          </h4>
                          <div className="space-y-4">
                            <InputField
                              ref={fullNameRef}
                              icon={<FaUser className="text-blue-400" />}
                              type="text"
                              placeholder="Votre nom complet"
                              value={formData.fullName}
                              fieldName="fullName"
                              error={errors.fullName}
                              onChange={handleChange}
                              autoFocus
                            />

                            <InputField
                              ref={phoneRef}
                              icon={<FaPhone className="text-blue-400" />}
                              type="tel"
                              placeholder="0700000000 (10 chiffres)"
                              value={formData.phoneNumber}
                              fieldName="phoneNumber"
                              error={errors.phoneNumber}
                              onChange={handleChange}
                            />

                            <InputField
                              ref={emailRef}
                              icon={<FaEnvelope className="text-blue-400" />}
                              type="email"
                              placeholder="votre@email.com"
                              value={formData.email}
                              fieldName="email"
                              error={errors.email}
                              onChange={handleChange}
                            />
                            <InputField
                              icon={<FaMapMarkerAlt className="text-blue-400" />}
                              type="text"
                              placeholder="Adresse complète"
                              value={formData.adresse}
                              fieldName="adresse"
                              onChange={handleChange}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2 ml-1">
                            * Champs obligatoires
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-5">
                        <InputField
                          ref={phoneRef}
                          icon={<FaPhone className="text-gray-400" />}
                          type="tel"
                          placeholder="0700000000 (10 chiffres)"
                          value={formData.phoneNumber}
                          fieldName="phoneNumber"
                          error={errors.phoneNumber}
                          onChange={handleChange}
                          autoFocus
                        />

                        <InputField
                            ref={passwordRef}
                            icon={<FaLock className="text-gray-400" />}
                            type={showPassword ? "text" : "password"}
                            placeholder="Votre mot de passe"
                            value={formData.password}
                            fieldName="password"
                            error={errors.password}
                            showToggle={true}
                            onToggleVisibility={() => setShowPassword(!showPassword)}
                            onChange={handleChange}
                          />
                      </div>
                    )}

                    {!internalIsNewUser && (
                      <div className="flex items-center mb-6 mt-2">
                        <input
                          type="checkbox"
                          id="remember"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember" className="ml-3 text-sm text-gray-600">
                          Se souvenir de moi
                        </label>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="px-5 py-3.5 text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors font-medium"
                        disabled={loading}
                      >
                        Annuler
                      </motion.button>
                      
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:opacity-95 transition-all flex items-center justify-center min-w-[160px] shadow-lg shadow-emerald-200/50 font-medium"
                        disabled={loading}
                      >
                        {loading ? (
                          <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : internalIsNewUser ? (
                          "Continuer"
                        ) : (
                          "Se connecter"
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === STEPS.SET_PASSWORD && renderSetPasswordStep()}
              {step === STEPS.SUCCESS && renderSuccessStep()}
            </AnimatePresence>

            {step !== STEPS.SUCCESS && step !== STEPS.SET_PASSWORD && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-8 pt-6 border-t border-gray-100 text-center"
              >
                <p className="text-sm text-gray-600">
                  {internalIsNewUser 
                    ? "Déjà un compte ?" 
                    : "Pas encore de compte ?"}
                  <button
                    type="button"
                    onClick={() => {
                      const newMode = !internalIsNewUser;
                      setInternalIsNewUser(newMode);
                      setIsNewUser(newMode);
                    }}
                    className="ml-1.5 font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    disabled={loading}
                  >
                    {internalIsNewUser 
                      ? "Connectez-vous" 
                      : "Créer un compte"}
                  </button>
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;