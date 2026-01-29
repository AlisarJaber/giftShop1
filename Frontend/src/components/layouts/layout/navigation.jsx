import { Link } from "react-router-dom"
import "../../../assets/auth.css"
import "./nav.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Navigation = () => {

    const navigate = useNavigate();

    const handleLogout = async () => {
        await axios.post(
            "http://localhost:8000/auth/logout",
            {},
            {
                withCredentials: true,
                headers: { apiKey: "SEACRET1234567" }
            }
        );
        navigate("/login");

    }

    const handleShowCart = async () => {
        try {
            await axios.get("http://localhost:8000/carts/", {
                withCredentials: true,
                headers: { apiKey: "SEACRET1234567" },
            });

            navigate("/cart"); // רק אם הצליח
        } catch (err) {
            navigate("/login"); // או הודעה
        }
    };



    return (
        <nav className="nav">
            <div className="nav__right">
                <span className="nav__logo">🎁</span>
                <span className="nav__title">Gift Shop</span>
            </div>

            <div className="nav__center">
                <Link className="nav__link" to="/products"> Home </Link>
                <Link className="nav__link" to="/categories">Categories</Link>
                <Link className="nav__link" to="/personal">Personalized Gifts</Link>
            </div>

            <div className="nav__left">
                <button className="nav__btn" onClick={handleLogout}>
                    LOG OUT
                </button>

                <button className="nav__icon" onClick={handleShowCart} aria-label="cart">
                    🛒
                </button>


            </div>
        </nav>
    )
}

export default Navigation