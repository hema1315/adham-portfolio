import { Route, Routes, useLocation } from "react-router";
import Home from "./pages/Home/Home";
import Projects from "./pages/projects/Projects";
import Login from "./pages/login/Login";
import Admin from "./pages/admin/Admin";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/login");

  return (
    <>
      <ScrollToTop />

      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:id" element={<Projects />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
}
