import { useState } from "react";
import "../../assets/auth.css";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../../../utils/http";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const sendData = async (event) => {
    event.preventDefault();

    try {
        const res = await http.post("/auth/login", {
            email,
            password,
        }, {withCredentials: true})

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/products")
    } catch (err) {
        console.log("message:", err?.message);
        console.log("code:", err?.code);
        console.log("status:", err?.response?.status);
        console.log("data:", err?.response?.data);
        alert(err?.response?.data?.detail || err?.message || "Login failed")
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <h1>GiftShop</h1>
          <span>🎁</span>
        </div>

        <div className="welcome">welcome back</div>
        <div className="subtitle">To enter the store you need to log in</div>

        <div className="auth-tabs">
          <Link to="/signup" className="auth-tab">
            Sign up
          </Link>
          <Link to="/login" className="auth-tab active">
            Login
          </Link>
        </div>

        <form className="auth-form" onSubmit={sendData}>
          <div className="field">
            <label>Email</label>
            <div className="input-wrap">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <div className="input-wrap">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button className="auth-btn" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;



