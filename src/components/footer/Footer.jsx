import { useLocation, useNavigate } from "react-router";
import "./footer.css";

const footerLinks = [
  { targetId: "hero", label: "الرئيسية" },
  { targetId: "services", label: "الخدمات" },
  { targetId: "projects", label: "المشاريع" },
];

function Footer() {
  const year = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLinkClick = (e, targetId) => {
    e.preventDefault();

    if (location.pathname === "/") {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/#${targetId}`);
    }
  };

  return (
    <footer className="site-footer">
      <ul className="site-footer__links">
        {footerLinks.map(({ targetId, label }) => (
          <li key={targetId}>
            <a
              href={`/#${targetId}`}
              onClick={(e) => handleLinkClick(e, targetId)}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      <p className="site-footer__copyright">
        © {year} Adham Elsayed. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
