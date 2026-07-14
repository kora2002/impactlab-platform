import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Beneficiaires from "../pages/beneficiaires/Beneficiaires";
import Programmes from "../pages/programmes/Programmes";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("access");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRouter() {
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
      </Route>
    </Routes>
  );
}