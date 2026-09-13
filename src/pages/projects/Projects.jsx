import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router";
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolume1,
  FiVolumeX,
  FiMaximize,
  FiMinimize,
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiFilm,
} from "react-icons/fi";
import "./projects.css";


const CATEGORIES = {
  "real-estate": {
    name: "العقارات",
    jsonCategory: "Real Estate",
    description: "استعراض لأبرز مشاريع وتغطيات العقارات بإخراج سينمائي مميز.",
  },
  teaching: {
    name: "التدريس",
    jsonCategory: "Teaching",
    description: "فيديوهات تعليمية ودورات تدريبية بمونتاج تفاعلي وسلس للمتعلم.",
  },
  "social-media": {
    name: "صناعة المحتوى",
    jsonCategory: "Social Media",
    description:
      "ريلز وفيديوهات قصيرة مصممة لجذب الانتباه وزيادة التفاعل والانتشار.",
  },
  history: {
    name: "تاريخ",
    jsonCategory: "History",
    description:
      "سرد وثائقي وتاريخي جذاب يجمع بين المؤثرات الصوتية والبصرية الغامرة.",
  },
  travel: {
    name: "السفر",
    jsonCategory: "Travel",
    description: "لقطات وتجارب سفر مفعمة بالحيوية والألوان ونبض المغامرة.",
  },
};


function VideoCard({ videoSrc, title, id }) {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // من 0 إلى 1
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);


  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };


  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (isMuted || volume === 0) {
      const restoredVol = prevVolume > 0 ? prevVolume : 0.5;
      videoRef.current.muted = false;
      videoRef.current.volume = restoredVol;
      setVolume(restoredVol);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
      setVolume(0);
      setIsMuted(true);
    }
  };


  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const newVol = parseFloat(e.target.value);
    if (!videoRef.current) return;

    videoRef.current.volume = newVol;
    setVolume(newVol);

    if (newVol === 0) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };


  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!wrapperRef.current) return;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (wrapperRef.current.requestFullscreen) {
        wrapperRef.current.requestFullscreen();
      } else if (wrapperRef.current.webkitRequestFullscreen) {
        wrapperRef.current.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const activeFs = !!(
        document.fullscreenElement || document.webkitFullscreenElement
      );
      setIsFullscreen(activeFs);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };


  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) return <FiVolumeX />;
    if (volume < 0.5) return <FiVolume1 />;
    return <FiVolume2 />;
  };

  return (
    <div className={`project-card ${isPlaying ? "is-playing" : ""}`}>
      <div
        ref={wrapperRef}
        className={`video-wrapper ${isFullscreen ? "fullscreen-active" : ""}`}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          playsInline
        />


        {!isPlaying && (
          <div className="play-overlay">
            <button
              type="button"
              className="center-play-btn"
              aria-label="تشغيل الفيديو"
              onClick={togglePlay}
            >
              <FiPlay />
            </button>
          </div>
        )}


        <div className="custom-controls" onClick={(e) => e.stopPropagation()}>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="video-progress"
            aria-label="شريط تقدم الفيديو"
          />

          <div className="controls-row">
            <div className="controls-right">
              <button
                type="button"
                className="ctrl-btn"
                onClick={togglePlay}
                aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
              >
                {isPlaying ? <FiPause /> : <FiPlay />}
              </button>

              <div
                className="volume-control-wrap"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="ctrl-btn"
                  onClick={toggleMute}
                  aria-label="كتم / تشغيل الصوت"
                >
                  {renderVolumeIcon()}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                  aria-label="مستوى الصوت"
                />
              </div>

              <span className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="controls-left">
              <button
                type="button"
                className="ctrl-btn"
                onClick={toggleFullscreen}
                aria-label={
                  isFullscreen ? "الخروج من الشاشة الكاملة" : "ملء الشاشة"
                }
              >
                {isFullscreen ? <FiMinimize /> : <FiMaximize />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="project-info">
        <h3>{title || `مشروع رقم #${id}`}</h3>
      </div> */}
    </div>
  );
}

export default function Projects() {
  const { id } = useParams();
  const [allProjects, setAllProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchProjects() {
      setIsLoading(true);
      try {
        const res = await fetch("/projects.json");
        const data = await res.json();
        setAllProjects(data);
      } catch (err) {
        console.error("خطأ أثناء جلب الفيديوهات:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
    setCurrentPage(1);
  }, [id]);

  const currentCategory = CATEGORIES[id] || {
    name: "مشاريع متنوعة",
    jsonCategory: "",
    description: "استعراض لمجموعة من الأعمال والمشاريع المميزة.",
  };

  const filteredProjects = allProjects.filter((p) => {
    if (!currentCategory.jsonCategory) return true;
    return (
      p.category?.toLowerCase() ===
        currentCategory.jsonCategory.toLowerCase() ||
      p.category === currentCategory.name
    );
  });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVideos = filteredProjects.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="projects-container" dir="rtl">
      <header className="projects-header">
        <div className="header-breadcrumbs">
          <Link to="/" className="back-link">
            <FiArrowRight /> العودة للرئيسية
          </Link>
          <span className="crumb-sep">/</span>
          <span className="current-crumb">{currentCategory.name}</span>
        </div>

        <h1 className="category-title">
          مشاريع <span>{currentCategory.name}</span>
        </h1>
        <p className="category-desc">{currentCategory.description}</p>

        <nav className="categories-pills" aria-label="أقسام المشاريع">
          {Object.entries(CATEGORIES).map(([catKey, catData]) => (
            <Link
              key={catKey}
              to={`/projects/${catKey}`}
              className={`cat-pill ${catKey === id ? "active" : ""}`}
            >
              {catData.name}
            </Link>
          ))}
        </nav>
      </header>

      <section className="projects-content">
        {isLoading ? (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>جاري تحميل المشاريع...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <FiFilm className="empty-icon" />
            <h3>لا توجد مشاريع مضافة حالياً في هذا المجال</h3>
            <p>سيتم رفع فيديوهات جديدة قريباً، تصفح المجالات الأخرى.</p>
          </div>
        ) : (
          <>
            <div className="videos-grid">
              {currentVideos.map((project) => (
                <VideoCard
                  key={project.id}
                  id={project.id}
                  videoSrc={project.video}
                  title={project.title}
                />
              ))}
            </div>

            {filteredProjects.length > itemsPerPage && (
              <div className="pagination">
                <button
                  type="button"
                  className="page-btn nav-btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  aria-label="الصفحة السابقة"
                >
                  <FiChevronRight /> السابق
                </button>

                <div className="pages-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        className={`page-num ${
                          currentPage === pageNum ? "active" : ""
                        }`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ),
                  )}
                </div>

                <button
                  type="button"
                  className="page-btn nav-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  aria-label="الصفحة التالية"
                >
                  التالي <FiChevronLeft />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
