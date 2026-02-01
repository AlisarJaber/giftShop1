import "./hero.css";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="hero">
      <div
        className="hero-bg"
        style={{ backgroundImage: 'url("/hero-gifts.jpg")' }}
      />

      <div className="hero-inner">
        <div className="hero-badge">
          Personalized gifts <span className="sparkle">✦</span>
        </div>

        <h1 className="hero-title">
            <span className="hero-title-main">Find the perfect</span>
            <span className="hero-title-accent">gift</span>
        </h1>

        <p className="hero-subtitle">
          Discover a rich variety of special and exciting gifts for every occasion.
          Personalization, uncompromising quality and excellent service.
        </p>

        <div className="hero-actions">
          <button className="hero-btn hero-btn-secondary" onClick={()=> navigate("/personal")}>
            Customization
          </button>
          <button className="hero-btn hero-btn-primary" onClick={()=> navigate("/categories")}>
            <span className="arrow">←</span> For all gifts
          </button>
        </div>
      </div>
    </section>
  )
}


