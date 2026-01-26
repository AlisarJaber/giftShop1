import axios from "axios"
import { useState } from "react"
import "../../assets/auth.css"
import { Link } from "react-router-dom"



const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")


    const sendData = async (event) => {
        event.preventDefault()
        await axios.post("http://localhost:8000/auth/login",
            { email: email, password: password }
        )
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand">
                    <h1>GiftShop</h1>
                    <span className="gift">🎁</span>
                </div>

                <div className="subtitle-he">ברוכים הבאים</div>
                <div className="subtitle-en">To enter the store you need to log in</div>

                <div className="auth-tabs">
                    <Link to="/login" className="auth-tab">  Login </Link>
                    <Link to="/signup" className="auth-tab">  Sign up </Link>
                </div>

                <form className="auth-form">
                    <div className="field">
                        <label>Email</label>
                        <div className="input-wrap">
                            <input placeholder="your@email.com" />
                            <span className="input-icon">✉️</span>
                        </div>
                    </div>

                    <div className="field">
                        <label>Password</label>
                        <div className="input-wrap">
                            <input type="password" placeholder="••••••••" />
                            <span className="input-icon">🔒</span>
                        </div>
                    </div>

                    <button className="auth-btn" type="submit">Login</button>
                </form>
            </div>
        </div>
    )
}


export default Login
