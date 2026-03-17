import { useState } from "react";

const PRODUCTS = [
  { id: 1, name: "Headphones", price: 999, icon: "🎧" },
  { id: 2, name: "Smart Phone", price: 29999, icon: "📱" },
  { id: 3, name: "Smart Watch", price: 4999, icon: "⌚" },
  { id: 4, name: "Keyboard", price: 1999, icon: "⌨️" },
  { id: 5, name: "Mouse", price: 499, icon: "🖱️" },
{ id: 6, name: "Monitor", price: 19999, icon: "🖥️" },
  { id: 7, name: "Webcam", price: 2999, icon: "📷" },
  { id: 8, name: "Microphone", price: 3999, icon: "🎤" }
];

const animationStyle = document.createElement('style');
animationStyle.textContent = `
  @keyframes slideUp {
    0% {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(animationStyle);
}

export default function App() {
  const [cart, setCart] = useState({});
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const addToCart = (p) => {
    setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
    setOpen(true);
  };

  const changeQty = (id, d) => {
    setCart((c) => {
      const q = (c[id] || 0) + d;
      if (q <= 0) {
        const n = { ...c };
        delete n[id];
        return n;
      }
      return { ...c, [id]: q };
    });
  };

  const handleBuyNow = () => {
    setCart({});
    setShowSuccess(true);
    setOpen(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const total = Object.entries(cart).reduce((s, [id, q]) => {
    const p = PRODUCTS.find((x) => x.id == id);
    return s + p.price * q;
  }, 0);

  return (
    <div style={styles.page}>
      
      {/* NAV */}
      <div style={styles.nav}>
        <div style={styles.logo}>MyShop!</div>
        <button style={styles.cartBtn} onClick={() => setOpen(true)}>
          🛒 {Object.keys(cart).length}
        </button>
      </div>

      {/* HERO */}
      <div style={styles.hero}>
        <h1>shop what you love!</h1>
      </div>

      {/* PRODUCTS */}
      <div style={styles.grid}>
        {PRODUCTS.map((p) => (
          <div key={p.id} style={styles.card}>
            <div style={styles.icon}>{p.icon}</div>
            <h3>{p.name}</h3>
            <p style={styles.price}>INR. {p.price}</p>

            <button style={styles.btn} onClick={() => addToCart(p)}>
              Add
            </button>
          </div>
        ))}
      </div>

      {/* CART PANEL */}
      <div style={{ ...styles.cart, transform: open ? "translateX(0)" : "translateX(100%)" }}>
        <div style={styles.cartHeader}>
          <h3>Your Cart</h3>
          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        {Object.keys(cart).length === 0 ? (
          <p style={{ color: "#aaa" }}>Cart is empty</p>
        ) : (
          <>
            {Object.entries(cart).map(([id, q]) => {
              const p = PRODUCTS.find((x) => x.id == id);
              return (
                <div key={id} style={styles.item}>
                  <div>{p.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div>{p.name}</div>
                    <div style={styles.small}>INR. {p.price * q}</div>
                  </div>

                  <div style={styles.qty}>
                    <button onClick={() => changeQty(id, -1)}>-</button>
                    <span>{q}</span>
                    <button onClick={() => changeQty(id, 1)}>+</button>
                  </div>
                </div>
              );
            })}

            <div style={styles.total}>
              <h3>INR. {total}</h3>
              <button style={styles.buy} onClick={handleBuyNow}>Buy Now</button>
            </div>
          </>
        )}
      </div>

      {/* SUCCESS MESSAGE */}
      {showSuccess && (
        <div style={styles.successMsg}>
          ✓ Purchase Successful!
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    background: "#0f0f10",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "system-ui",
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "1.5rem 2rem",
  },

  logo: {
    fontWeight: "600",
    letterSpacing: "2px",
  },

  cartBtn: {
    background: "#1c1c1e",
    border: "none",
    padding: "8px 14px",
    borderRadius: "20px",
    color: "#fff",
    cursor: "pointer",
  },

  hero: {
    padding: "2rem",
    textAlign: "center",
    opacity: 0.9,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "1.5rem",
    padding: "2rem",
  },

  card: {
    background: "#1c1c1e",
    padding: "1.5rem",
    borderRadius: "20px",
    textAlign: "center",
    transition: "0.3s",
  },

  icon: {
    fontSize: "2.5rem",
    marginBottom: "10px",
  },

  price: {
    color: "#aaa",
    marginBottom: "10px",
  },

  btn: {
    background: "#fff",
    color: "#000",
    border: "none",
    padding: "8px 18px",
    borderRadius: "20px",
    cursor: "pointer",
  },

  cart: {
    position: "fixed",
    right: 0,
    top: 0,
    width: "320px",
    height: "100%",
    background: "#18181a",
    padding: "1rem",
    transition: "0.3s",
  },

  cartHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1rem",
  },

  item: {
    display: "flex",
    alignItems: "center",
    marginBottom: "1rem",
    gap: "10px",
  },

  qty: {
    display: "flex",
    gap: "6px",
  },

  small: {
    fontSize: "12px",
    color: "#888",
  },

  total: {
    marginTop: "2rem",
    paddingTop: "1rem",
    borderTop: "1px solid #333",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  buy: {
    width: "100%",
    padding: "12px",
    background: "#fff",
    color: "#000",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
    transition: "0.2s",
  },

  successMsg: {
    position: "fixed",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#10b981",
    color: "#fff",
    padding: "1rem 2rem",
    borderRadius: "20px",
    fontSize: "16px",
    fontWeight: "600",
    animation: "slideUp 3s ease-in-out",
    zIndex: 1000,
  },
};