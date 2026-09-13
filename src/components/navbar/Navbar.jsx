import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { FiMenu, FiX } from "react-icons/fi";
import "./navbar.css";

const links = [
  { targetId: "hero", label: "الرئيسية" },
  { targetId: "services", label: "الخدمات" },
  { targetId: "projects", label: "المشاريع" },
  { targetId: "contact", label: "تواصل معايا" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => setIsOpen(false);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    closeMenu();

    const isHomePage = location.pathname === "/";

    if (isHomePage) {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/#${targetId}`);
    }
  };

  return (
    <nav className={`navbar ${isOpen ? "menu-open" : ""}`}>
      <div className="navbar-inner">
        <Link
          to="/"
          className="nav-logo"
          onClick={(e) => handleNavClick(e, "hero")}
        >
          ADHAM <span>ELSAYED</span>
        </Link>

        <ul className="nav-links">
          {links.map(({ targetId, label }) => (
            <li key={targetId}>
              <a
                href={`/#${targetId}`}
                onClick={(e) => handleNavClick(e, targetId)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="/#contact"
          className="nav-cta"
          onClick={(e) => handleNavClick(e, "contact")}
        >
          ابدأ مشروعك
        </a>

        <button
          type="button"
          className="nav-toggle"
          aria-label={isOpen ? "قفل القائمة" : "فتح القائمة"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      <div className={`nav-mobile ${isOpen ? "is-open" : ""}`}>
        <ul>
          {links.map(({ targetId, label }) => (
            <li key={targetId}>
              <a
                href={`/#${targetId}`}
                onClick={(e) => handleNavClick(e, targetId)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="/#contact"
          className="nav-cta nav-cta--mobile"
          onClick={(e) => handleNavClick(e, "contact")}
        >
          ابدأ مشروعك
        </a>
      </div>
    </nav>
  );
}
