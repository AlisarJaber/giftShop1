import { Link } from "react-router-dom"
import "../../../assets/auth.css"
import "./nav.css";

const Navigation = () => {


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
                <Link className="nav__icon" to="/cart" aria-label="cart">🛒</Link>

                {/* <button className="nav__btn" onClick={handleLogout}>
                    LOG OUT
                </button> */}
            </div>
        </nav>
    )
}

export default Navigation