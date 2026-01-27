import axios from "axios";
import { useState } from "react";
import "../../assets/auth.css";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const sendData = async (event) => {
    event.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/auth/login", {
        email,
        password,
      });

  
      localStorage.setItem("token", res.data.access_token);

      console.log("login ok:", res.data);
      navigate("/products");
    } catch (err) {
      console.log("status:", err?.response?.status);
      console.log("data:", err?.response?.data);
      alert(err?.response?.data?.detail || "Login failed");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <h1></h1>
          <span></span>
        </div>

        <div className="welcome">welcome</div>
        <div className="subtitle">To enter the store you need to log in</div>

        <div className="auth-tabs">
          <Link to="/signup" className="auth-tab">Sign up</Link>
          <Link to="/login" className="auth-tab active">Login</Link>
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

          <button className="auth-btn" type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

