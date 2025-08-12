const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('225') && cleaned.length === 13) {
    return cleaned;
  }
  
  if (cleaned.length === 10) {
    return '225' + cleaned;
  }
  
  return cleaned;
};

export const validatePhone = (phone) => {
  return /^225(01|05|07)\d{8}$/.test(phone);
};

export const checkUserExists = async (phone, role) => {
  const formattedPhone = formatPhoneNumber(phone);
  const response = await fetch(`${API_BASE_URL}/api/auth/check-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: formattedPhone, role })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur réseau');
  }
  
  return await response.json();
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.join(', ') || "Erreur lors de l'inscription");
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Erreur serveur");
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: credentials.identifier,
        password: credentials.password,
        role: credentials.role 
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Identifiants incorrects');
    }
    
    const data = await response.json();
    
    return {
      ...data,
      role: credentials.role
    };
    
  } catch (error) {
    throw new Error(error.message || "Erreur de connexion");
  }
};