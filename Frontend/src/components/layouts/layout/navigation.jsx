import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../../../assets/auth.css";
import "./nav.css";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const urlSearch = params.get("search") || "";
  const [search, setSearch] = useState(urlSearch);

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
  }

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/auth/logout",
        {},
        {
          withCredentials: true,
          headers: { apiKey: "SEACRET1234567" },
        }
      );
    } catch (e) {
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  return (
    
    <nav className="nav">
      <div className="nav__right">
        <span className="nav__logo">🎁</span>
        <span className="nav__title">Gift Shop</span>
      </div>

      <div className="nav__center">
        <Link className="nav__link" to="/products">Home</Link>
        <Link className="nav__link" to="/categories">Categories</Link>
        <Link className="nav__link" to="/personal">Personalized Gifts</Link>

        <input
          className="nav__search"
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={handleSearchChange}
          aria-label="search products"
        />
      </div>

      <div className="nav__left">
        <button className="nav__btn" onClick={handleLogout}>
          LOG OUT
        </button>

        <Link className="nav__icon" to="/cart" aria-label="cart">
          🛒
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
