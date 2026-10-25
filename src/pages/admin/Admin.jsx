import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../supabaseClient";
import {
  FiFilm,
  FiFolder,
  FiPlus,
  FiTrash2,
  FiLogOut,
  FiExternalLink,
  FiUploadCloud,
  FiLink,
  FiCheck,
  FiAlertTriangle,
  FiEye,
  FiStar,
} from "react-icons/fi";
import "./admin.css";

export default function Admin() {
  const navigate = useNavigate();
  const [loadingUser, setLoadingUser] = useState(true);
  const [user, setUser] = useState(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState("videos"); // 'videos' | 'categories'

  // Data
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Video Form
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("");
  const [uploadType, setUploadType] = useState("file"); // 'file' | 'link'
  const [selectedFile, setSelectedFile] = useState(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [isHero, setIsHero] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Category Form
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [savingCat, setSavingCat] = useState(false);

  // Alert message
  const [notification, setNotification] = useState({ text: "", type: "" });
  const fileInputRef = useRef(null);

  const showNotification = (text, type = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification({ text: "", type: "" }), 4000);
  };

  // 1. Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
        setLoadingUser(false);
        fetchInitialData();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // 2. Fetch Data
  const fetchInitialData = async () => {
    setLoadingData(true);
    try {
      // Categories
      const { data: cats, error: catErr } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (catErr) throw catErr;
      setCategories(cats || []);
      if (cats && cats.length > 0 && !selectedCatId) {
        setSelectedCatId(cats[0].id);
      }

      // Videos
      const { data: vids, error: vidErr } = await supabase
        .from("videos")
        .select("*, categories(name, slug)")
        .order("created_at", { ascending: false });
      if (vidErr) throw vidErr;
      setVideos(vids || []);
    } catch (err) {
      console.error(err);
      showNotification("حدث خطأ في تحميل البيانات", "error");
    } finally {
      setLoadingData(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Upload & Add Video
  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!selectedCatId) {
      showNotification("يرجى اختيار القسم المناسب للفيديو", "error");
      return;
    }

    let finalVideoUrl = "";

    setUploading(true);
    setUploadProgress(10);

    try {
      if (uploadType === "file") {
        if (!selectedFile) {
          showNotification("يرجى اختيار ملف فيديو من جهازك", "error");
          setUploading(false);
          return;
        }

        // Check file size (50MB Supabase free limit)
        const sizeInMB = selectedFile.size / (1024 * 1024);
        if (sizeInMB > 50) {
          showNotification(
            `حجم الفيديو ${sizeInMB.toFixed(1)}MB يتجاوز الحد الأقصى (50MB). يرجى ضغطه أو استخدام خيار الرابط الخارجي.`,
            "error"
          );
          setUploading(false);
          return;
        }

        // Clean filename
        const ext = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = `videos/${fileName}`;

        setUploadProgress(40);
        const { error: uploadError } = await supabase.storage
          .from("portfolio-videos")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        setUploadProgress(80);
        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("portfolio-videos").getPublicUrl(filePath);

        finalVideoUrl = publicUrl;
      } else {
        if (!externalUrl.trim()) {
          showNotification("يرجى كتابة رابط الفيديو", "error");
          setUploading(false);
          return;
        }
        finalVideoUrl = externalUrl.trim();
      }

      setUploadProgress(95);

      // Insert record in DB
      const { data: newVid, error: insertError } = await supabase
        .from("videos")
        .insert([
          {
            title: videoTitle.trim(),
            category_id: selectedCatId,
            video_url: finalVideoUrl,
            is_hero: isHero,
          },
        ])
        .select("*, categories(name, slug)")
        .single();

      if (insertError) throw insertError;

      setVideos([newVid, ...videos]);
      showNotification("تمت إضافة الفيديو بنجاح!");
      setVideoModalOpen(false);
      // Reset form
      setVideoTitle("");
      setSelectedFile(null);
      setExternalUrl("");
      setIsHero(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      showNotification("حدث خطأ أثناء رفع الفيديو: " + err.message, "error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete Video
  const handleDeleteVideo = async (video) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الفيديو؟")) return;

    try {
      // 1. Delete record
      const { error: dbError } = await supabase
        .from("videos")
        .delete()
        .eq("id", video.id);
      if (dbError) throw dbError;

      // 2. If it was in Supabase storage, delete file
      if (video.video_url.includes("portfolio-videos")) {
        const parts = video.video_url.split("portfolio-videos/");
        if (parts.length > 1) {
          const path = parts[1];
          await supabase.storage.from("portfolio-videos").remove([path]);
        }
      }

      setVideos(videos.filter((v) => v.id !== video.id));
      showNotification("تم حذف الفيديو بنجاح");
    } catch (err) {
      console.error(err);
      showNotification("حدث خطأ في حذف الفيديو", "error");
    }
  };

  // Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim() || !catSlug.trim()) {
      showNotification("يرجى كتابة اسم القسم والرابط الإنجليزي", "error");
      return;
    }

    setSavingCat(true);
    try {
      const cleanSlug = catSlug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]/g, "-");

      const { data: newCat, error: catError } = await supabase
        .from("categories")
        .insert([
          {
            name: catName.trim(),
            slug: cleanSlug,
            description: catDesc.trim(),
            sort_order: categories.length + 1,
          },
        ])
        .select()
        .single();

      if (catError) throw catError;

      setCategories([...categories, newCat]);
      if (!selectedCatId) {
        setSelectedCatId(newCat.id);
      }
      showNotification("تم إضافة القسم بنجاح!");
      setCatModalOpen(false);
      setCatName("");
      setCatSlug("");
      setCatDesc("");
    } catch (err) {
      console.error(err);
      showNotification(
        "حدث خطأ (قد يكون الرابط مستخدماً بالفعل): " + err.message,
        "error"
      );
    } finally {
      setSavingCat(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat) => {
    const videoCount = videos.filter((v) => v.category_id === cat.id).length;
    const confirmMsg =
      videoCount > 0
        ? `تنبيه: هذا القسم يحتوي على ${videoCount} فيديو. حذفه سيؤدي لحذف الفيديوهات التابعة له أيضاً. هل تريد الاستمرار؟`
        : "هل أنت متأكد من حذف هذا القسم؟";

    if (!window.confirm(confirmMsg)) return;

    try {
      const { error } = await supabase.from("categories").delete().eq("id", cat.id);
      if (error) throw error;

      setCategories(categories.filter((c) => c.id !== cat.id));
      setVideos(videos.filter((v) => v.category_id !== cat.id));
      showNotification("تم حذف القسم بنجاح");
    } catch (err) {
      console.error(err);
      showNotification("فشل حذف القسم: " + err.message, "error");
    }
  };

  // Auto-slug generator when typing category name in english
  const handleSlugTyping = (val) => {
    setCatSlug(val.toLowerCase().replace(/\s+/g, "-"));
  };

  if (loadingUser) {
    return (
      <div className="admin-loading" dir="rtl">
        <div className="spinner" />
        <p>جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  return (
    <div className="admin-page" dir="rtl">
      {/* Toast Notification */}
      {notification.text && (
        <div className={`admin-toast ${notification.type}`}>
          {notification.type === "error" ? <FiAlertTriangle /> : <FiCheck />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Top Bar */}
      <header className="admin-topbar">
        <div className="admin-brand">
         
          <h1>
            لوحة التحكم 
          </h1>
         
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="action-btn-view"
            onClick={() => window.open("/", "_blank")}
          >
            <FiEye /> فتح الموقع
          </button>
          <button type="button" className="action-btn-logout" onClick={handleLogout}>
            <FiLogOut /> خروج
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-content">
        {/* Navigation Tabs */}
        <div className="admin-tabs-row">
          <div className="tabs-group">
            <button
              type="button"
              className={`tab-btn ${activeTab === "videos" ? "active" : ""}`}
              onClick={() => setActiveTab("videos")}
            >
              <FiFilm /> الفيديوهات ({videos.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "categories" ? "active" : ""}`}
              onClick={() => setActiveTab("categories")}
            >
              <FiFolder /> الأقسام والتصنيفات ({categories.length})
            </button>
          </div>

          <div className="tab-add-action">
            {activeTab === "videos" ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setVideoModalOpen(true)}
              >
                <FiPlus /> إضافة فيديو جديد
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setCatModalOpen(true)}
              >
                <FiPlus /> إضافة قسم جديد
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: VIDEOS */}
        {activeTab === "videos" && (
          <div className="tab-pane">
            {loadingData ? (
              <div className="pane-loader">
                <div className="spinner" />
                <p>جاري جلب الفيديوهات...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="empty-state">
                <FiFilm className="empty-icon" />
                <h3>لا توجد فيديوهات مضافة بعد</h3>
                <p>ابدأ برفع أول فيديو لتظهر مشاريعك في الموقع</p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setVideoModalOpen(true)}
                >
                  <FiPlus /> رفع فيديو الآن
                </button>
              </div>
            ) : (
              <div className="videos-grid">
                {videos.map((vid) => (
                  <div className="video-admin-card" key={vid.id}>
                    <div className="card-media">
                      <video src={vid.video_url} preload="metadata" muted playsInline />
                      {vid.is_hero && (
                        <span className="hero-badge" title="يظهر في الصفحة الرئيسية بالهيرو">
                          <FiStar /> يظهر في الهيرو
                        </span>
                      )}
                    </div>

                    <div className="card-details">
                      <div className="card-cat-badge">
                        {vid.categories?.name || "بدون قسم"}
                      </div>
                      <h4 className="card-title">
                        {vid.title || "فيديو بدون عنوان"}
                      </h4>
                      <p className="card-date">
                        {new Date(vid.created_at).toLocaleDateString("ar-EG")}
                      </p>
                    </div>

                    <div className="card-actions">
                      <a
                        href={vid.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="card-btn-view"
                        title="فتح الفيديو"
                      >
                        <FiExternalLink />
                      </a>
                      <button
                        type="button"
                        className="card-btn-delete"
                        onClick={() => handleDeleteVideo(vid)}
                        title="حذف الفيديو"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === "categories" && (
          <div className="tab-pane">
            {loadingData ? (
              <div className="pane-loader">
                <div className="spinner" />
                <p>جاري جلب الأقسام...</p>
              </div>
            ) : (
              <div className="categories-grid">
                {categories.map((cat) => {
                  const count = videos.filter((v) => v.category_id === cat.id).length;
                  return (
                    <div className="cat-admin-card" key={cat.id}>
                      <div className="cat-card-header">
                        <div className="cat-icon-wrap">
                          <FiFolder />
                        </div>
                        <div className="cat-titles">
                          <h3>{cat.name}</h3>
                          <code>/projects/{cat.slug}</code>
                        </div>
                        <button
                          type="button"
                          className="cat-btn-delete"
                          onClick={() => handleDeleteCategory(cat)}
                          title="حذف القسم"
                        >
                          <FiTrash2 />
                        </button>
                      </div>

                      <p className="cat-desc-preview">
                        {cat.description || "لا يوجد وصف لهذا القسم"}
                      </p>

                      <div className="cat-card-footer">
                        <span className="cat-count">
                          عدد الفيديوهات: <strong>{count}</strong>
                        </span>
                        <a
                          href={`/projects/${cat.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="cat-view-link"
                        >
                          عرض القسم <FiExternalLink />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: ADD VIDEO */}
      {videoModalOpen && (
        <div className="modal-backdrop" onClick={() => !uploading && setVideoModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>إضافة فيديو جديد للموقع</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => !uploading && setVideoModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="modal-form">
              <div className="form-group">
                <label>عنوان الفيديو (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: إعلان عقاري لفيلا فاخرة"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>القسم / التصنيف *</label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    اختر القسم
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Type Switcher */}
              <div className="upload-switch-row">
                <button
                  type="button"
                  className={`switch-btn ${uploadType === "file" ? "active" : ""}`}
                  onClick={() => setUploadType("file")}
                >
                  <FiUploadCloud /> رفع ملف من الجهاز (أقل من 50MB)
                </button>
                <button
                  type="button"
                  className={`switch-btn ${uploadType === "link" ? "active" : ""}`}
                  onClick={() => setUploadType("link")}
                >
                  <FiLink /> رابط خارجي مباشر (للفيديوهات الكبيرة)
                </button>
              </div>

              {uploadType === "file" ? (
                <div className="form-group file-drop-zone">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  />
                  <div className="drop-info">
                    <FiUploadCloud className="drop-icon" />
                    <span>
                      {selectedFile
                        ? selectedFile.name
                        : "اضغط لاختيار فيديو من جهازك (MP4 أو WEBM)"}
                    </span>
                    {selectedFile && (
                      <small>
                        الحجم: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </small>
                    )}
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label>رابط الفيديو المباشر</label>
                  <input
                    type="url"
                    placeholder="https://example.com/video.mp4"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    dir="ltr"
                  />
                  <small className="hint-text">
                    يمكن وضع رابط مباشر لملف الفيديو من أي سيرفر أو استضافة سحابية.
                  </small>
                </div>
              )}

            

              {uploading && (
                <div className="upload-progress-box">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span>جاري الرفع والمعالجة... {uploadProgress}%</span>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={uploading}
                >
                  {uploading ? "جاري الرفع..." : "حفظ ونشر الفيديو"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={uploading}
                  onClick={() => setVideoModalOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {catModalOpen && (
        <div className="modal-backdrop" onClick={() => !savingCat && setCatModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>إضافة قسم جديد</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => !savingCat && setCatModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="modal-form">
              <div className="form-group">
                <label>اسم القسم بالعربي *</label>
                <input
                  type="text"
                  placeholder="مثال: بودكاست"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>اسم الرابط بالإنجليزي (Slug) *</label>
                <input
                  type="text"
                  placeholder="مثال: podcast"
                  required
                  dir="ltr"
                  value={catSlug}
                  onChange={(e) => handleSlugTyping(e.target.value)}
                />
                <small className="hint-text">
                  سيكون رابط القسم: /projects/{catSlug || "..."}
                </small>
              </div>

              <div className="form-group">
                <label>وصف القسم (يظهر في صفحة المشروع)</label>
                <textarea
                  rows="3"
                  placeholder="اكتب نبذة مختصرة عن نوعية الفيديوهات في هذا القسم..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={savingCat}>
                  {savingCat ? "جاري الحفظ..." : "إضافة القسم"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={savingCat}
                  onClick={() => setCatModalOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
