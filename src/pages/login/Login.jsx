import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../supabaseClient";
import { FiLock, FiMail, FiArrowRight, FiAlertCircle } from "react-icons/fi";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect straight to admin
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/admin");
      }
    });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg("بيانات الدخول غير صحيحة، يرجى التأكد والمحاولة مرة أخرى.");
      } else if (data?.user) {
        navigate("/admin");
      }
    } catch (err) {
      setErrorMsg("حدث خطأ أثناء تسجيل الدخول. حاول ثانية.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" dir="rtl">
      <div className="login-card">
        <div className="login-header">
          <div className="lock-icon-badge">
            <FiLock />
          </div>
          <h2>لوحة التحكم </h2>
          <p>سجل دخولك لإدارة فيديوهاتك وأقسام البورتفوليو</p>
        </div>

        {errorMsg && (
          <div className="login-error">
            <FiAlertCircle />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <div className="input-wrap">
              <FiMail className="input-icon" />
              <input
                type="email"
                required
                placeholder="ahmedmohamedM@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
              />
            </div>
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <div className="input-wrap">
              <FiLock className="input-icon" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            className="back-to-site-btn"
            onClick={() => navigate("/")}
          >
            <FiArrowRight /> العودة للموقع الرئيسي
          </button>
        </div>
      </div>
    </div>
  );
}
