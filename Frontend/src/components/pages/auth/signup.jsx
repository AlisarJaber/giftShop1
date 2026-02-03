import { useState } from "react";
import "../../../assets/auth.css";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../../../utils/http";
import { toast } from "react-hot-toast"; // ✅ הוספה
import { getErrorText } from "../../../utils/toastText"; // ✅ הוספה

const Signup = () => {
  const navigate = useNavigate();

  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const sendData = async (event) => {
    event.preventDefault();

    try {
      const res = await http.post("/auth/signup", {
        first_name,
        last_name,
        email,
        password,
      });

      if (res?.data?.access_token) {
        localStorage.setItem("token", res.data.access_token);
      }
      if (res?.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      window.dispatchEvent(new Event("auth-change"));

      toast.success("Account created successfully 🎉");

      navigate("/products", { replace: true });
    } catch (err) {
      toast.error(
        getErrorText(err, "Signup failed. Please try again.")
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <h1>GiftShop</h1>
          <span>🎁</span>
        </div>

        <div className="welcome">welcome</div>
        <div className="subtitle">
          To enter the store you need to sign up
        </div>

        <div className="auth-tabs">
          <Link to="/signup" className="auth-tab active">
            Sign up
          </Link>
          <Link to="/login" className="auth-tab">
            Login
          </Link>
        </div>

        <form className="auth-form" onSubmit={sendData}>
          <div className="field">
            <label>First Name</label>
            <div className="input-wrap">
              <input
                value={first_name}
                onChange={(e) => setFirst_name(e.target.value)}
                placeholder="First name"
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Last Name</label>
            <div className="input-wrap">
              <input
                value={last_name}
                onChange={(e) => setLast_name(e.target.value)}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Email</label>
            <div className="input-wrap">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
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
                required
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

export default Signup;
