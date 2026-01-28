import { Link } from "react-router-dom"
import "../../../assets/auth.css"
import "./nav.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Navigation = () => {

    const navigate = useNavigate();

    const sendData = async () => {
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
                <Link onClick={sendData} className="nav__link" to="/login"> logout</Link>
                <Link className="nav__icon" to="/cart" aria-label="cart">🛒</Link>

                {/* <button className="nav__btn" onClick={handleLogout}>
                    LOG OUT
                </button> */}
            </div>
        </nav>
    )
}

export default Navigation