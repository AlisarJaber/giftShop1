import { useNavigate } from "react-router-dom";
import "./backButton.css";

export default function BackButton() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        navigate("/products", { replace: true });
      } catch {
        navigate("/products", { replace: true });
      }
    }
  };

  return (
    <button className="gs-back-btn" onClick={handleBack}>
      ← Back
    </button>
  );
}
