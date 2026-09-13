import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home/Home";
import Projects from "./pages/projects/Projects";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <>
      <ScrollToTop />

     
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/projects/:id" element={<Projects />} />
      </Routes>
      <Footer />
    </>
  );
}
