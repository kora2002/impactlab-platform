import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main
        style={{
          marginLeft: "230px",
          flex: 1,
          padding: "1.5rem",
          background: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}