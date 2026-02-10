import { useState } from "react";
import "../../../assets/auth.css";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../../../utils/http";
import toast from "react-hot-toast";
import { getErrorText } from "../../../utils/toastText";

// ✅ same upload util you already have
import { uploadImage } from "../../../utils/singleApi";

/* =========================
   Password Validation
========================= */
const validatePassword = (password) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one capital letter";
  }

  if (!/[!@#$%^&*()_\-+=[\]{};':\"\\|,.<>/?]/.test(password)) {
    return "Password must include at least one special character";
  }

  return null;
};

const Signup = () => {
  const navigate = useNavigate();

  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ profile image states
  const [profileImageUrl, setProfileImageUrl] = useState(""); // URL saved to DB
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadErr("");
      setUploading(true);
      setSelectedFileName(file.name);

      const url = await uploadImage(file);
      setProfileImageUrl(url);

      toast.success("Profile image uploaded ✅");
    } catch (err) {
      console.error("Image upload failed", err);
      setUploadErr("Upload failed. Please try again.");
      toast.error("Upload failed. Please try again.");
      setProfileImageUrl("");
      setSelectedFileName("");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const clearImage = () => {
    if (uploading) return;
    setProfileImageUrl("");
    setSelectedFileName("");
    setUploadErr("");
  };

  const sendData = async (event) => {
    event.preventDefault();

    // ✅ Frontend password validation
    const pwdError = validatePassword(password);
    if (pwdError) {
      toast.error(pwdError);
      return;
    }

    if (uploading) {
      toast.error("Please wait for the image upload to finish.");
      return;
    }

    try {
      const res = await http.post("/auth/signup", {
        first_name,
        last_name,
        email,
        password,
        image_url: profileImageUrl || null,
      });

      // Using cookie auth (access_token cookie), no need to store token in localStorage
      if (res?.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      window.dispatchEvent(new Event("auth-change"));

      toast.success("Account created successfully 🎉");
      navigate("/products", { replace: true });
    } catch (err) {
      toast.error(getErrorText(err, "Signup failed. Please try again."));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <h1>GiftShop</h1>
          <span>🎁</span>
        </div>

        <div className="welcome">Welcome</div>
        <div className="subtitle">To enter the store you need to sign up</div>

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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <div className="password-rules">
              <div className="password-hint">
                Must be at least 8 characters, include a capital letter and a
                special character.
              </div>
            </div>

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

          {/* ✅ Optional profile image */}
          <div className="field">
            <label>Profile image (optional)</label>

            <div className="auth-fileRow">
              <label className={`auth-fileBtn ${uploading ? "is-disabled" : ""}`}>
                {uploading ? "Uploading..." : "Choose file"}
                <input
                  className="auth-fileHidden"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>

              <div className="auth-fileName">
                {profileImageUrl
                  ? "Image selected"
                  : selectedFileName
                  ? selectedFileName
                  : "No file chosen"}
              </div>

              {profileImageUrl ? (
                <button
                  type="button"
                  className="auth-fileClear"
                  onClick={clearImage}
                  aria-label="Remove image"
                  title="Remove image"
                  disabled={uploading}
                >
                  ✕
                </button>
              ) : null}
            </div>

            {uploadErr ? <div className="auth-fileError">{uploadErr}</div> : null}

            {profileImageUrl ? (
              <div className="auth-imagePreview">
                <img src={profileImageUrl} alt="profile preview" />
              </div>
            ) : null}
          </div>

          <button className="auth-btn" type="submit" disabled={uploading}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;