import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Beneficiaires from "./pages/beneficiaires/Beneficiaires";
import FicheBeneficiaire from "./pages/beneficiaires/FicheBeneficiaire";
import Programmes from "./pages/programmes/Programmes";
import DetailProgramme from "./pages/programmes/DetailProgramme";
import Inscriptions from "./pages/inscriptions/Inscriptions";
import Financements from "./pages/financements/Financements";
import Documents from "./pages/documents/Documents";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("access");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="beneficiaires" element={<Beneficiaires />} />
        <Route path="programmes" element={<Programmes />} />
        <Route path="inscriptions" element={<Inscriptions />} />
        <Route path="beneficiaires/:id" element={<FicheBeneficiaire />} />
        <Route path="programmes/:id" element={<DetailProgramme />} />
        <Route path="financements" element={<Financements />} />
        <Route path="documents" element={<Documents />} />
      </Route>
    </Routes>
  );
}