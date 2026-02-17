import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import "../../../assets/auth.css";
import "./nav.css";

import { downloadProductsPdf } from "../../../utils/exportApi";
import { http } from "../../../utils/http";
import { logout as apiLogout, getMe as apiGetMe, login as apiLogin } from "../../../utils/usersApi";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [me, setMe] = useState(null);

  // profile dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // admin dropdown
  const [adminOpen, setAdminOpen] = useState(false);
  const adminRef = useRef(null);

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // password gate modal
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwErr, setPwErr] = useState("");

  // edit form
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    image_url: "",
  });

  // upload
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [fileName, setFileName] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const initialLetter = useMemo(() => {
    const name = (me?.first_name || "").trim();
    return name ? name[0].toUpperCase() : "?";
  }, [me]);

  const profileUrl = useMemo(() => {
    return me?.image_url || me?.profile_image_url || me?.avatar_url || "";
  }, [me]);

  const isAdmin = useMemo(() => {
    return !!me?.is_admin;
  }, [me]);

  const loadMe = async () => {
    try {
      const data = await apiGetMe(); // ✅ uses http (with interceptor)
      setMe(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (err) {
      // 401 -> not logged in
      setMe(null);
      localStorage.removeItem("user");
    }
  };

  useEffect(() => {
    loadMe();
    const onAuthChange = () => loadMe();
    window.addEventListener("auth-change", onAuthChange);
    return () => window.removeEventListener("auth-change", onAuthChange);
  }, []);

  // close menus on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (adminRef.current && !adminRef.current.contains(e.target)) {
        setAdminOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleLogout = async () => {
    try {
      await apiLogout(); // ✅ clears cookie via http
    } catch { }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("is_admin");

    setMe(null);
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login", { replace: true });
  };

  // open password gate
  const openEdit = () => {
    if (!me) return;
    setMenuOpen(false);

    setPwErr("");
    setPw("");
    setPwOpen(true);
  };

  // password confirmation using login
  const confirmPassword = async () => {
    if (pwLoading) return;

    const password = pw.trim();
    if (!password) {
      setPwErr("Please enter your password.");
      return;
    }

    setPwLoading(true);
    setPwErr("");

    try {
      // ✅ use apiLogin (http) so blocked-user is handled globally
      await apiLogin({ email: me.email, password });

      setErrMsg("");
      setUploadErr("");
      setUploading(false);
      setSaving(false);
      setFileName("");

      setForm({
        first_name: me.first_name || "",
        last_name: me.last_name || "",
        email: me.email || "",
        image_url: profileUrl || "",
      });

      setPwOpen(false);
      setEditOpen(true);
    } catch (err) {
      setPwErr(err?.response?.data?.detail || "Wrong password.");
    } finally {
      setPwLoading(false);
    }
  };

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append("image_file", file);

    const res = await http.post("/api/uploads/image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data?.url || "";
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadErr("");
      setUploading(true);
      setFileName(file.name);

      const url = await uploadImage(file);
      if (!url) throw new Error("NO_URL");
      set("image_url", url);
    } catch (err) {
      console.error("Upload failed", err);
      setUploadErr("Upload failed. Please try again.");
      setFileName("");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submitEdit = async () => {
    if (saving || uploading) return;

    const first_name = form.first_name.trim();
    const last_name = form.last_name.trim();
    const email = form.email.trim();
    const image_url = (form.image_url || "").trim() || null;

    if (!first_name || !last_name || !email) {
      setErrMsg("Please fill all fields.");
      return;
    }

    setSaving(true);
    setErrMsg("");

    try {
      // ✅ use http so blocked-user handling is global
      const res = await http.patch("/auth/me", {
        first_name,
        last_name,
        email,
        image_url,
        current_password: pw,
      });

      setMe(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      window.dispatchEvent(new Event("auth-change"));

      setEditOpen(false);
      setPw("");
    } catch (err) {
      console.error("Update failed", err);
      setErrMsg(err?.response?.data?.detail || "Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const hideOnAuthPages =
    location.pathname === "/login" || location.pathname === "/signup";

  // ✅ If not logged in, don't show nav
  if (!me || hideOnAuthPages) return null;

  const onAdminNav = (to) => {
    setAdminOpen(false);
    navigate(to);
  };

  const onExportPdf = async () => {
    setAdminOpen(false);
    try {
      await downloadProductsPdf();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <nav className="nav">
        <div className="nav__right">
          <span className="ui-gift-emoji">🎁</span>
          <span className="nav__title">Gift Shop</span>
        </div>

        <div className="nav__center">
          <Link className="nav__link" to="/products">
            Home
          </Link>
          <Link className="nav__link" to="/categories">
            All product
          </Link>
          <Link className="nav__link" to="/personal">
            Personalized Gifts
          </Link>

          {isAdmin ? (
            <div className="nav__dropdown" ref={adminRef}>
              <button
                type="button"
                className="nav__linkBtn"
                onClick={() => setAdminOpen((x) => !x)}
              >
                Admin <span className={`nav__chev ${adminOpen ? "open" : ""}`}>▾</span>
              </button>

              {adminOpen && (
                <div className="nav__menu">
                  <button
                    type="button"
                    className="nav__menuItem nav__menuBtn"
                    onClick={() => onAdminNav("/admin/carts")}
                  >
                    Admin Carts
                  </button>

                  <button
                    type="button"
                    className="nav__menuItem nav__menuBtn"
                    onClick={() => onAdminNav("/admin/users")}
                  >
                    Admin Users
                  </button>

                  <button
                    type="button"
                    className="nav__menuItem nav__menuBtn"
                    onClick={onExportPdf}
                  >
                    Export Products PDF
                  </button>

                  <button
                    type="button"
                    className="nav__menuItem nav__menuBtn"
                    onClick={() => onAdminNav("/admin/audit-logs")}
                  >
                    Audit Logs
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="nav__left" ref={menuRef}>
          <button
            type="button"
            className="nav__profileBtn"
            onClick={() => setMenuOpen((x) => !x)}
            title="Account menu"
          >
            {profileUrl ? (
              <img
                className="nav__avatar"
                src={profileUrl}
                alt="profile"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="nav__avatarFallback">{initialLetter}</div>
            )}

            <span className="nav__hello">
              👋 Hello <strong>{me.first_name}</strong>
            </span>

            <span className={`nav__chev ${menuOpen ? "open" : ""}`}>▾</span>
          </button>

          {menuOpen && (
            <div className="navMenu">
              <div className="navMenu__title">Account details</div>

              <div className="navMenu__row">
                <span className="navMenu__label">Name</span>
                <span className="navMenu__value">
                  {me.first_name} {me.last_name}
                </span>
              </div>

              <div className="navMenu__row">
                <span className="navMenu__label">Email</span>
                <span className="navMenu__value">{me.email}</span>
              </div>

              <div className="navMenu__actions">
                <button type="button" className="navMenu__btn" onClick={openEdit}>
                  Update details
                </button>

                <button type="button" className="navMenu__btn danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          )}

          {!isAdmin && (
            <>
              <Link className="nav__icon" to="/cart" title="Cart">
                🛒
              </Link>
              <Link to="/favorites" className="nav__iconlink" title="Favorites">
                <span className="ui-fav-heart">💗</span>
              </Link>
            </>
          )}
        </div>
      </nav>

      {pwOpen && (
        <div className="navEdit__backdrop" onClick={() => setPwOpen(false)}>
          <div
            className="navEdit__card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="navEdit__head">
              <div className="navEdit__title">Confirm your password</div>
              <button
                type="button"
                className="navEdit__x"
                onClick={() => setPwOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="navEdit__body">
              <label className="navEdit__label">Password</label>
              <input
                className="navEdit__input"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Enter your password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmPassword();
                }}
              />

              {pwErr ? <div className="file-error">{pwErr}</div> : null}
            </div>

            <div className="navEdit__actions">
              <button
                type="button"
                className="navEdit__btn ghost"
                onClick={() => setPwOpen(false)}
                disabled={pwLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="navEdit__btn primary"
                onClick={confirmPassword}
                disabled={pwLoading}
              >
                {pwLoading ? "Checking..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editOpen && (
        <div className="navEdit__backdrop" onClick={() => setEditOpen(false)}>
          <div
            className="navEdit__card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="navEdit__head">
              <div className="navEdit__title">Update details</div>
              <button
                type="button"
                className="navEdit__x"
                onClick={() => setEditOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="navEdit__body">
              <label className="navEdit__label">First name</label>
              <input
                className="navEdit__input"
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
              />

              <label className="navEdit__label">Last name</label>
              <input
                className="navEdit__input"
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
              />

              <label className="navEdit__label">Email</label>
              <input
                className="navEdit__input"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />

              <label className="navEdit__label">Profile image (optional)</label>

              <input
                className="file-input-hidden"
                id="profileFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading || saving}
              />

              <div className="file-row">
                <label
                  htmlFor="profileFile"
                  className={`file-btn ${uploading || saving ? "is-disabled" : ""}`}
                >
                  Choose file
                </label>
                <div className="file-name">
                  {fileName
                    ? fileName
                    : form.image_url
                      ? "Image selected"
                      : "No file selected"}
                </div>

                {form.image_url ? (
                  <button
                    type="button"
                    className="file-clear"
                    onClick={() => {
                      set("image_url", "");
                      setFileName("");
                      setUploadErr("");
                    }}
                    title="Remove image"
                    disabled={uploading || saving}
                  >
                    ✕
                  </button>
                ) : null}
              </div>

              {uploading ? (
                <div className="file-error" style={{ color: "#7a7a7a" }}>
                  Uploading image...
                </div>
              ) : null}

              {uploadErr ? <div className="file-error">{uploadErr}</div> : null}
              {errMsg ? <div className="file-error">{errMsg}</div> : null}

              {form.image_url ? (
                <div className="image-preview">
                  <img src={form.image_url} alt="preview" />
                </div>
              ) : null}
            </div>

            <div className="navEdit__actions">
              <button
                type="button"
                className="navEdit__btn ghost"
                onClick={() => setEditOpen(false)}
                disabled={saving || uploading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="navEdit__btn primary"
                onClick={submitEdit}
                disabled={saving || uploading}
              >
                {saving ? "Saving..." : uploading ? "Uploading..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;