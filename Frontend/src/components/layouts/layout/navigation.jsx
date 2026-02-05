import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../../../assets/auth.css";
import "./nav.css";

const API = "http://localhost:8000";
const APIKEY = "SEACRET1234567";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const urlSearch = params.get("search") || "";

  const [search, setSearch] = useState(urlSearch);
  const [me, setMe] = useState(null);

  // ✅ helper: first letter fallback
  const initialLetter = useMemo(() => {
    const name = (me?.first_name || "").trim();
    return name ? name[0].toUpperCase() : "?";
  }, [me]);

  // ✅ profile image url (supports different field names just in case)
  const profileUrl = useMemo(() => {
    return (
      me?.image_url ||
      me?.profile_image_url ||
      me?.avatar_url ||
      ""
    );
  }, [me]);

  const isAdmin = useMemo(() => {
    try {
      return !!JSON.parse(localStorage.getItem("user") || "null")?.is_admin;
    } catch {
      return false;
    }
  }, [me]);

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    const next = new URLSearchParams(location.search);
    if (value.trim()) next.set("search", value);
    else next.delete("search");

    navigate(`/products?${next.toString()}`, { replace: true });
  };

  const loadMe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMe(null);
      return;
    }

    try {
      const res = await axios.get(`${API}/auth/me`, {
        withCredentials: true,
        headers: { apiKey: APIKEY },
      });
      setMe(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch {
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

  useEffect(() => {
    loadMe();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API}/auth/logout`,
        {},
        { withCredentials: true, headers: { apiKey: APIKEY } }
      );
    } catch {}

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login", { replace: true });
  };

  const hideOnAuthPages =
    location.pathname === "/login" || location.pathname === "/signup";

  if (!me || hideOnAuthPages) return null;

  return (
    <nav className="nav">
      <div className="nav__right">
        <span className="nav__logo">🎁</span>
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
          <>
            <Link to="/admin/carts" className="nav__link">
              Admin Carts
            </Link>
            <Link to="/admin/users" className="nav__link">
              Admin Users
            </Link>
          </>
        ) : null}

        <input
          className="nav__search"
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <div className="nav__left">
        {/* ✅ avatar + hello */}
        <div className="nav__user">
          {profileUrl ? (
            <img
              className="nav__avatar"
              src={profileUrl}
              alt="profile"
              onError={(e) => {
                // אם URL שבור, נוריד תמונה ונציג fallback
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="nav__avatarFallback">{initialLetter}</div>
          )}

          <span className="nav__hello">
            👋 Hello <strong>{me.first_name}</strong>
          </span>
        </div>

        <button className="nav__btn" onClick={handleLogout}>
          LOG OUT
        </button>

        {!isAdmin && (
          <>
            <Link className="nav__icon" to="/cart" title="Cart">
              🛒
            </Link>
            <Link to="/favorites" className="nav__iconLink" title="Favorites">
              ❤️
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
