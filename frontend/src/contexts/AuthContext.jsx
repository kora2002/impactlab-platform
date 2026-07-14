import { createContext, useContext, useState } from "react";
import {
  getUtilisateur,
  isAuthenticated,
  logout,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Utilisateur connecté
  const [utilisateur, setUtilisateur] = useState(getUtilisateur());

  /**
   * Après une connexion réussie
   */
  const connexion = (data) => {
    setUtilisateur(data.utilisateur);
  };

  /**
   * Déconnexion
   */
  const deconnexion = () => {
    logout();
    setUtilisateur(null);
  };

  const value = {
    utilisateur,
    connexion,
    deconnexion,
    isAuthenticated: isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personnalisé
 */
export function useAuth() {
  return useContext(AuthContext);
}