import { useEffect, useRef, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDroplet,
  FiLayers,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiScissors,
  FiMusic,
  FiCheckCircle,
  FiFilm,
} from "react-icons/fi";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { siFacebook, siGmail, siInstagram, siWhatsapp } from "simple-icons";
import Intro from "../../components/intro/Intro";
import "./home.css";
import { Link, useLocation } from "react-router";

const TIMELINE_STAGES = [
  {
    id: "cut",
    stepNumber: "01",
    title: "القص والترتيب (Rough Cut)",
    start: 2,
    width: 18,
    color: "blue",
    icon: FiScissors,
    desc: "فرز اللقطات الخام واستبعاد المشاهد المكررة واختيار أفضل اللحظات بدون ملل.",
  },
  {
    id: "pacing",
    stepNumber: "02",
    title: "مزامنة الإيقاع (Pacing & Beats)",
    start: 21,
    width: 18,
    color: "teal",
    icon: FiMusic,
    desc: "تقطيع المشاهد بدقة على ضربات الموسيقى لضبط ريتم سريع يشد المشاهد.",
  },
  {
    id: "color",
    stepNumber: "03",
    title: "كولور جريدنج سينمائي (Color Grade)",
    start: 40,
    width: 18,
    color: "green",
    icon: FiDroplet,
    desc: "تصحيح الإضاءة وتلوين المشاهد لإعطاء طابع جذاب وهوية بصرية موحدة.",
  },
  {
    id: "motion",
    stepNumber: "04",
    title: "موشن جرافيكس وهوكس (Motion & Captions)",
    start: 59,
    width: 19,
    color: "purple",
    icon: FiLayers,
    desc: "إضافة نصوص متحركة، هوكس بصرية، ومؤثرات جرافيكس ترفع التفاعل.",
  },
  {
    id: "master",
    stepNumber: "05",
    title: "هندسة الصوت والتصدير (Master & FX)",
    start: 79,
    width: 19,
    color: "gold",
    icon: FiCheckCircle,
    desc: "مؤثرات صوتية محيطية، تنقية الصوت، وتصدير نهائي بأعلى جودة 4K جاهز للنشر.",
  },
];

const services = [
  {
    title: "مونتاج ريلز وسوشيال ميديا",
    description: "فيديوهات قصيرة جاذبة للانتباه من أول ثانية.",
    Icon: FaInstagram,
  },
  {
    title: "مونتاج فيديوهات يوتيوب",
    description: "سرد بصري متماسك، قصّ وترتيب يحافظ على المشاهد لآخر الفيديو.",
    Icon: FaYoutube,
  },
  {
    title: "كولور جريدنج",
    description:
      "تصحيح وتلوين الألوان بشكل يدي إحساس سينمائي ويحافظ على هوية بصرية ثابتة.",
    Icon: FiDroplet,
  },
  {
    title: "موشن جرافيكس",
    description:
      "عناصر حركية ونصوص متحركة بتضيف طابع احترافي للفيديو والبراند.",
    Icon: FiLayers,
  },
];

const folders = [
  { label: "العقارات", href: "/projects/real-estate" },
  { label: "التدريس", href: "/projects/teaching" },
  { label: "صناعة المحتوي", href: "/projects/social-media" },
  { label: "تاريخ", href: "/projects/history" },
  { label: "السفر", href: "/projects/travel" },
];

const socialLinks = [
  {
    label: "واتساب",
    href: "https://wa.me/+2001286213392",
    icon: siWhatsapp,
    color: "#25d366",
    external: true,
  },
  {
    label: "إنستجرام",
    href: "https://www.instagram.com/eldod_vv/",
    icon: siInstagram,
    color: "#e4405f",
    external: true,
  },
  {
    label: "إيميل",
    href: "mailto:hello@example.com",
    icon: siGmail,
    color: "#ea4335",
  },
  {
    label: "فيسبوك",
    href: "https://www.facebook.com/adham.eldod.72910?locale=ar_AR",
    icon: siFacebook,
    color: "#1877f2",
    external: true,
  },
];

const DEFAULT_REELS = [
  { id: "r1", video: "", category: "عقارات" },
  { id: "r2", video: "", category: "ريلز" },
  { id: "r3", video: "", category: "يوتيوب" },
  { id: "r4", video: "", category: "موشن" },
  { id: "r5", video: "", category: "سوشيال" },
];

function BrandIcon({ icon, label }) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={label}>
      <title>{label}</title>
      <path d={icon.path} />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 84 68" aria-hidden="true">
      <path d="M0 12a6 6 0 0 1 6-6h24l8 8h40a6 6 0 0 1 6 6v42a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6z" />
    </svg>
  );
}

function circularDiff(index, center, total) {
  let diff = (((index - center) % total) + total) % total;
  if (diff > total / 2) {
    diff -= total;
  }
  return diff;
}

function getArcRadiusForWidth(width) {
  if (width <= 420) return 85;
  if (width <= 640) return 115;
  if (width <= 900) return 165;
  if (width <= 1024) return 240;
  if (width <= 1200) return 300;
  return 400;
}

const HERO_REELS_COUNT = 5;

export default function Home() {
  const homeRef = useRef(null);
  const [centerIndex, setCenterIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [arcRadius, setArcRadius] = useState(() =>
    typeof window !== "undefined"
      ? getArcRadiusForWidth(window.innerWidth)
      : 400,
  );

  const [isPlaying, setIsPlaying] = useState(true);
  const [playheadPos, setPlayheadPos] = useState(6);
  const [activeStage, setActiveStage] = useState(TIMELINE_STAGES[0]);

  const [heroReels, setHeroReels] = useState(DEFAULT_REELS);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayheadPos((prev) => {
          const next = prev >= 98 ? 2 : prev + 0.35;
          const current = TIMELINE_STAGES.find(
            (s) => next >= s.start && next <= s.start + s.width,
          );
          if (current) setActiveStage(current);
          return next;
        });
      }, 45);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    document.body.classList.toggle("intro-active", showIntro);
    return () => document.body.classList.remove("intro-active");
  }, [showIntro]);

  useEffect(() => {
    const revealElements = homeRef.current?.querySelectorAll(".reveal");
    if (!revealElements) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [hash]);

  useEffect(() => {
    let frame = null;
    const handleResize = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setArcRadius(getArcRadiusForWidth(window.innerWidth));
        frame = null;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    fetch("/projects.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const reels = data.slice(0, HERO_REELS_COUNT).map((p) => ({
            id: p.id,
            video: p.video,
            category: p.category,
          }));
          setHeroReels(reels);
        }
      })
      .catch((err) => console.error("خطأ في تحميل فيديوهات الهيرو:", err));
  }, []);

  const getFolderStyle = (index) => {
    const total = folders.length;
    const visibleRadius = Math.min(2, Math.floor((total - 1) / 2));
    const diff = circularDiff(index, centerIndex, total);
    const isCenter = diff === 0;

    if (Math.abs(diff) > visibleRadius) {
      return {
        opacity: 0,
        pointerEvents: "none",
        transform: `translate(-50%, -50%) translateX(${diff * arcRadius * 0.6}px)`,
      };
    }

    const rad = (diff * 24 * Math.PI) / 180;
    const x = Math.sin(rad) * arcRadius;
    const y = (1 - Math.cos(rad)) * (arcRadius * 0.225);
    const scale = isCenter ? 1.2 : 1 - Math.abs(diff) * 0.14;

    return {
      opacity: isCenter ? 1 : 0.55 - Math.abs(diff) * 0.1,
      pointerEvents: "auto",
      zIndex: 10 - Math.abs(diff),
      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
    };
  };

  return (
    <div className="home-page" ref={homeRef}>
      {showIntro && <Intro onFinish={() => setShowIntro(false)} />}

      <section className="hero" id="hero">
        <div className="hero-text reveal">
          <h1>
            بحول <span>أفكارك</span> لفيديوهات تشد الأنظار
          </h1>

          <p>
            مونتير بخبرة كبيرة في صناعة محتوى بصري احترافي، من الريلز والسوشيال
            ميديا لحد فيديوهات اليوتيوب الطويلة والموشن جرافيكس.
          </p>

          <a href="#projects" className="hero-cta">
            شوف شغلي
          </a>
          <a href="#contact" className="hero-cta-contact">
            تواصل معي
          </a>
        </div>

        <div className="hero-visual reveal">
          <div className="hero-showcase">
            <div className="hero-profile-card">
              <div className="profile-glow" />
              <div className="profile-card-inner">
                <img
                  src="/editor-profile.png"
                  alt="صورة المونتير"
                  loading="eager"
                />
              </div>
            </div>

            <div className="hero-reels-orbit">
              {heroReels.map((reel, index) => (
                <div
                  key={reel.id || index}
                  className="hero-reel-slot"
                  style={{
                    "--slot-index": index,
                    "--total-slots": heroReels.length,
                  }}
                >
                  <div className="hero-reel-card">
                    {reel.video ? (
                      <video
                        src={reel.video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        ref={(el) => {
                          if (el && el.paused) {
                            el.play().catch(() => {});
                          }
                        }}
                      />
                    ) : (
                      <div className="reel-placeholder">
                        <FiFilm />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="timeline-section" id="workflow">
        <div className="timeline-header-block reveal">
          <h2>إزاي بيطلع الفيديو بتاعك للنور؟</h2>
          <p>رحلة الفيديو بتاعك كاملة</p>
        </div>

        <div className="single-timeline-card reveal">
          <div className="timeline-topbar">
            <div className="controls-group">
              <button
                type="button"
                className="t-btn"
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
              >
                {isPlaying ? <FiPause /> : <FiPlay />}
              </button>

              <button
                type="button"
                className="t-btn"
                onClick={() => setPlayheadPos(2)}
                title="إعادة للبداية"
                aria-label="إعادة للبداية"
              >
                <FiRotateCcw />
              </button>

              <div className="timecode-box">
                00:00:
                {Math.floor(playheadPos / 3)
                  .toString()
                  .padStart(2, "0")}
                :
                {Math.floor((playheadPos * 1.5) % 24)
                  .toString()
                  .padStart(2, "0")}
              </div>
            </div>

            <div className="stage-preview-screen">
              <div className="preview-top">
                <span className="stage-step">
                  المرحلة {activeStage.stepNumber} :
                </span>
                <strong className="stage-title">{activeStage.title}</strong>
              </div>
              <p className="stage-desc">{activeStage.desc}</p>
            </div>
          </div>

          <div className="timeline-ruler">
            <div className="ruler-ticks">
              {Array.from({ length: 32 }).map((_, i) => (
                <span
                  key={i}
                  className={`tick ${i % 4 === 0 ? "major" : ""}`}
                />
              ))}
            </div>
          </div>

          <div className="single-track-container">
            <div className="live-playhead" style={{ left: `${playheadPos}%` }}>
              <div className="playhead-tag"></div>
              <div className="playhead-needle" />
            </div>

            <div className="track-rail">
              {TIMELINE_STAGES.map((st) => (
                <div
                  key={st.id}
                  className={`timeline-clip clip-${st.color} ${
                    activeStage.id === st.id ? "active-clip" : ""
                  }`}
                  style={{
                    "--h-left": `${st.start}%`,
                    "--h-width": `${st.width}%`,
                  }}
                  onClick={() => {
                    setActiveStage(st);
                    setPlayheadPos(st.start + 2);
                  }}
                >
                  <div className="clip-icon-box">
                    <st.icon />
                  </div>
                  <div className="clip-text-box">
                    <span className="clip-num">المرحلة {st.stepNumber}</span>
                    <span className="clip-name">{st.title.split("(")[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="folders-section" id="projects">
        <h2 className="reveal">المشاريع حسب المجال</h2>
        <p className="projects-p">حابب تشوف شغلي في مجال معين؟ اضغط عليه</p>

        <div className="arc-wrap reveal">
          <button
            className="arc-arrow prev"
            type="button"
            aria-label="المشروع التالي"
            onClick={() =>
              setCenterIndex((current) => (current + 1) % folders.length)
            }
          >
            <FiChevronRight />
          </button>

          <div className="arc-track">
            {folders.map((folder, index) => (
              <Link
                className={`folder ${index === centerIndex ? "is-center" : ""}`}
                to={folder.href}
                style={getFolderStyle(index)}
                key={folder.href}
              >
                <div className="folder-icon">
                  <FolderIcon />
                </div>

                <span>{folder.label}</span>
              </Link>
            ))}
          </div>

          <button
            className="arc-arrow next"
            type="button"
            aria-label="المشروع السابق"
            onClick={() =>
              setCenterIndex(
                (current) => (current - 1 + folders.length) % folders.length,
              )
            }
          >
            <FiChevronLeft />
          </button>
        </div>
      </section>

      <section className="services" id="services">
        <div className="services-header reveal">
          <h2>الخدمات</h2>
        </div>

        {services.map(({ title, description, Icon }, index) => (
          <div
            className="service-item reveal"
            style={{ transitionDelay: `${index * 0.08}s` }}
            key={title}
          >
            <div className="service-icon">
              <Icon />
            </div>

            <div className="service-content">
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="contact" id="contact">
        <div className="contact-inner reveal">
          <h2>خلينا نتكلم عن مشروعك</h2>

          <p>
            عندك فيديو محتاج مونتاج احترافي؟ اتواصل معايا وابعتلي تفاصيل مشروعك.
          </p>

          <div className="contact-icons">
            {socialLinks.map(({ label, href, icon, color, external }) => (
              <div className="social-icon-wrap" key={label}>
                <a
                  className="social-icon"
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  aria-label={label}
                  style={{ "--social-color": color }}
                >
                  <BrandIcon icon={icon} label={label} />
                </a>

                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
