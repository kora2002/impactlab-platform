import api from "./api";

export const login = async (username, password) => {
  const response = await api.post("users/login/", { username, password });
  localStorage.setItem("access", response.data.access);
  localStorage.setItem("refresh", response.data.refresh);
  localStorage.setItem("utilisateur", JSON.stringify(response.data.utilisateur));
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("utilisateur");
};

export const getUtilisateur = () => {
  const u = localStorage.getItem("utilisateur");
  return u ? JSON.parse(u) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("access");
};