export default function ProductCard({ product }) {
  const { name, price, image_url, badge } = product;

  return (
    <div className="p-card">
      <button className="p-heart" type="button" aria-label="favorite">
        ♡
      </button>

      {badge ? <div className="p-badge">{badge}</div> : null}

      <div className="p-imgBox">
        <img
          className="p-img"
          src={image_url || "https://via.placeholder.com/800x600?text=Gift"}
          alt={name}
          loading="lazy"
        />
      </div>

      <div className="p-info">
        <div className="p-name" title={name}>
          {name}
        </div>

        <div className="p-bottom">
          <div className="p-price">₪{price}</div>
          <button className="p-btn" type="button">
           for details
          </button>
        </div>
      </div>
    </div>
  )
}
