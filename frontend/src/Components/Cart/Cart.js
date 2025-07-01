import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import { FaTrash, FaMinus, FaPlus, FaList, FaInfoCircle } from "react-icons/fa";
import "./Cart.css";

const Cart = () => {
  // State for cart items and total
  const [cartState, setCartState] = useState({
    items: [],
    total: 0
  });
  
  // State for toggling between user and admin view
  const [isAdmin, setIsAdmin] = useState(false);
  
  const navigate = useNavigate();

  // Load cart directly from localStorage
  const loadCart = () => {
    try {
      console.log("CART DEBUG: Manually loading cart");
      // Get cart from localStorage
      const cartString = localStorage.getItem("cart");
      console.log("CART DEBUG: Raw cart data:", cartString);
      
      // Parse the cart
      let cartItems = [];
      if (cartString) {
        cartItems = JSON.parse(cartString);
        if (!Array.isArray(cartItems)) {
          console.error("CART DEBUG: Invalid cart format, resetting");
          cartItems = [];
        }
      }
      
      console.log("CART DEBUG: Parsed cart items:", cartItems);
      
      // Calculate total
      const total = cartItems.reduce(
        (sum, item) => sum + (Number(item.price || 0) * (item.quantity || 1)), 
        0
      );
      
      // Update state
      setCartState({
        items: cartItems,
        total: total
      });
      
      console.log("CART DEBUG: Cart loaded with", cartItems.length, "items");
      return cartItems;
    } catch (error) {
      console.error("CART DEBUG: Error loading cart:", error);
      setCartState({
        items: [],
        total: 0
      });
      return [];
    }
  };
  //Now
  const inspectCart = () => {
    const cartString = localStorage.getItem("cart");
    const cart = JSON.parse(cartString || "[]");
    console.table(cart.map(item => ({
      id: item._id,
      title: item.title,
      artist: item.artistName
    })));
  };
  // Initial load
  useEffect(() => {
    // Check and log what's in localStorage first
    const rawCart = localStorage.getItem("cart");
    console.log("CART DEBUG: Initial localStorage check:", rawCart);
    
    loadCart();
    inspectCart();
  }, []);

  // Handle quantity updates
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      // Get current cart directly from localStorage
      const cartString = localStorage.getItem("cart");
      let cartItems = cartString ? JSON.parse(cartString) : [];
      
      // Update quantity
      cartItems = cartItems.map(item => {
        if (String(item._id) === String(id)) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      
      // Save back to localStorage
      localStorage.setItem("cart", JSON.stringify(cartItems));
      console.log("CART DEBUG: Updated quantity, new cart:", cartItems);
      
      // Reload cart state
      loadCart();
    } catch (error) {
      console.error("CART DEBUG: Error updating quantity:", error);
    }
  };

  // Handle item removal
  const removeItem = (idToRemove) => {
    try {
      // Get current cart directly from localStorage
      const cartString = localStorage.getItem("cart");
      let cartItems = cartString ? JSON.parse(cartString) : [];
      
      console.log("CART DEBUG: Removing item with ID:", idToRemove);
      console.log("CART DEBUG: Current cart before removal:", cartItems);
      
      // Filter out the item - with improved comparison
      cartItems = cartItems.filter(item => {
        // Convert both IDs to strings and trim any whitespace
        const itemId = String(item._id).trim();
        const targetId = String(idToRemove).trim();
        
        console.log(`CART DEBUG: Comparing ${itemId} !== ${targetId}`, itemId !== targetId);
        return itemId !== targetId;
      });
      
      // Save back to localStorage
      localStorage.setItem("cart", JSON.stringify(cartItems));
      console.log("CART DEBUG: Removed item, new cart:", cartItems);
      
      // Reload cart state
      loadCart();
    } catch (error) {
      console.error("CART DEBUG: Error removing item:", error);
    }
  };

  // Clear cart
  const clearCart = () => {
    localStorage.removeItem("cart");
    setCartState({
      items: [],
      total: 0
    });
    console.log("CART DEBUG: Cart cleared");
  };

  // Navigate to checkout
  const handleCheckout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get current cart data
    const cartItems = loadCart(); // This loads and returns the cart items
    
    console.log("CHECKOUT: Navigating to payment page with cart:", cartItems);
    
    navigate("/checkout", { 
      state: { 
        cart: cartItems,
        total: cartState.total 
      } 
    });
  };
  // Toggle between admin and user view
  const toggleAdminView = () => {
    setIsAdmin(!isAdmin);
  };

  // Format cart data for admin view
  const formatCartData = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return "Error formatting cart data";
    }
  };

  // Calculate cart statistics
  const getCartStats = () => {
    const items = cartState.items;
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalValue = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    
    return {
      totalItems,
      totalQuantity,
      totalValue
    };
  };

  // Admin view component
  const AdminView = () => {
    const stats = getCartStats();
    
    return (
      <div className="admin-container">
        <h2>Cart Admin View</h2>
        
        <div className="cart-stats">
          <h3>Cart Statistics</h3>
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">Total Items</span>
              <span className="stat-value">{stats.totalItems}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Total Quantity</span>
              <span className="stat-value">{stats.totalQuantity}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Total Value</span>
              <span className="stat-value">Rs. {stats.totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="raw-data-section">
          <h3>Raw Cart Data</h3>
          <pre className="json-display">{formatCartData(cartState.items)}</pre>
        </div>
        
        <div className="admin-actions">
          <button onClick={loadCart} className="admin-btn refresh">
            Refresh Cart Data
          </button>
          <button onClick={clearCart} className="admin-btn clear">
            Clear Cart Data
          </button>
           <button onClick={inspectCart} className="admin-btn">
    Debug: Inspect Cart IDs
  </button>
        </div>
      </div>
    );
  };

  // Destructure state for easier use
  const { items, total } = cartState;

  return (
    <div>
      <Nav />
      
      <div className="cart-header">
        <h1>Your Shopping Cart</h1>
        
        <div className="view-toggle">
          <button 
            onClick={toggleAdminView} 
            className={`toggle-btn ${isAdmin ? 'admin-active' : 'user-active'}`}
          >
            {isAdmin ? (
              <>
                <FaList /> User View
              </>
            ) : (
              <>
                <FaInfoCircle /> Admin View
              </>
            )}
          </button>
        </div>
        
        {isAdmin ? (
          <AdminView />
        ) : (
          <>
            
            
            {items.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <Link to="/" className="continue-shopping">Continue Shopping</Link>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {items.map((item, index) => (
                    <div key={`${item._id || 'unknown'}-${index}`} className="cart-item">
                      <div className="item-image">
                        <img 
                          src={item.image || "https://via.placeholder.com/100"} 
                          alt={item.title || "Product"} 
                        />
                      </div>
                      <div className="item-details">
                        <h3>{item.title || "Unnamed Product"}</h3>
                        <p className="item-artist">Artist: {item.artistName || "Unknown"}</p>
                        <p className="item-price">Rs. {item.price || 0}.00</p>
                      </div>
                      <div className="item-quantity">
                        <button 
                          onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}
                          className="quantity-btn"
                        >
                          <FaMinus />
                        </button>
                        <span className="quantity">{item.quantity || 1}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                          className="quantity-btn"
                        >
                          <FaPlus />
                        </button>
                      </div>
                      <div className="item-total">
                        Rs. {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </div>
                      <button 
                        onClick={() => removeItem(item._id)} 
                        className="remove-btn"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>Rs. {(total > 0 ? 300 : 0).toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>Rs. {(total + (total > 0 ? 300 : 0)).toFixed(2)}</span>
                  </div>
                  
                  <div className="cart-actions">
                    <button onClick={clearCart} className="clear-cart-btn">
                      Clear Cart
                    </button>
                    <button 
  onClick={(e) => handleCheckout(e)} 
  className="checkout-btn"
  type="button"
>
  Proceed to Checkout
</button>
                  </div>
                  
                  <Link to="/" className="continue-shopping">
                    Continue Shopping
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;