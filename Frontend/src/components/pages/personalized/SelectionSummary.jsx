export default function SelectionSummary({ categories, selections, total, onAddToCart }) {
  const totalItems = Object.values(selections || {}).flat().length;

  return (
    <aside className="pg2-right">
      <div className="pg2-sideCard">
        <div className="pg2-sideHead">
          <div className="pg2-step-badge gray">3</div>
          <h3 className="pg2-sideTitle">Your Selection</h3>
        </div>

        {totalItems === 0 ? (
          <div className="pg2-empty">
            <div className="pg2-empty-icon">📦</div>
            <div className="pg2-empty-title">Your custom gift box is empty</div>
            <div className="pg2-empty-sub">Select products to build your gift</div>
          </div>
        ) : (
          <div className="pg2-chosen">
            {categories.map(c => {
              const items = selections[c.id] || [];
              if (!items.length) return null;
              return (
                <div key={c.id} className="pg2-chosen-group">
                  <div className="pg2-chosen-cat">{c.name}</div>
                  {items.map(p => (
                    <div key={p.id} className="pg2-chosen-item">
                      <img className="pg2-chosen-thumb" src={p.image_url || "https://via.placeholder.com/80"} alt={p.name} />
                      <div className="pg2-chosen-meta">
                        <div className="pg2-chosen-name">{p.name}</div>
                        <div className="pg2-chosen-price">₪{p.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            <div className="pg2-divider"></div>
            <div className="pg2-totalRow">
              <span>Total</span>
              <span className="pg2-total">₪{total}</span>
            </div>

            <button className="pg2-addBtn" onClick={onAddToCart} type="button">
              🛒 Add to Cart
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
