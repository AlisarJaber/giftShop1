import axios from "axios"
import { useState } from "react"
import "../../assets/auth.css"
import { Link, useNavigate } from "react-router-dom"

const Signup = () => {
    const navigate = useNavigate()
    const [first_name, setFirst_name] = useState("")
    const [last_name, setLast_name] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const sendData = async (event) => {
        event.preventDefault();

        try {
            const res = await axios.post("http://localhost:8000/auth/signup", {
            first_name,
            last_name,
            email,
            password,
            });

            console.log("signup ok:", res.data)
            alert("Signup successful!")
            navigate("/products")
        } catch (err) {
            console.log("status:", err?.response?.status);
            console.log("data:", err?.response?.data);
            alert(err?.response?.data?.detail || "Signup failed");
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand">
                    <h1> GiftShop </h1>
                    <span> 🎁 </span>
                </div>

                <div className="welcome"> welcome</div>
                <div className="subtitle">To enter the store you need to log in</div>

                <div className="auth-tabs">
                    <Link to="/signup" className="auth-tab active"> Sign up </Link>
                    <Link to="/login" className="auth-tab "> Login </Link>
                </div>

                <form className="auth-form" onSubmit={sendData}>

                    <div className="field">
                        <label>First Name</label>
                        <div className="input-wrap">
                            <input value={first_name} onChange={(event) => setFirst_name(event.target.value)} placeholder="first name" />
                        </div>
                    </div>

                    <div className="field">
                        <label>Last Name</label>
                        <div className="input-wrap">
                            <input value={last_name} onChange={(event) => setLast_name(event.target.value)} placeholder="last name" />
                        </div>
                    </div>                    

                    <div className="field">
                        <label>Email</label>
                        <div className="input-wrap">
                            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your@email.com" />
                        </div>
                    </div>

                    <div className="field">
                        <label>Password</label>
                        <div className="input-wrap">
                            <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
                        </div>
                    </div>



                    <button className="auth-btn" type="submit"> Submit </button>

                </form>
            </div>
        </div>
    )
}


export default Signup
