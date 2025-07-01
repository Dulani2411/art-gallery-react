import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus, FaList, FaInfoCircle } from "react-icons/fa";
import "./CartDetails.css";

const CartDetails = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); // Toggle for admin view
  const navigate = useNavigate();

  useEffect(() => {
    loadCartData();
  }, []);

  const loadCartData = () => {
    try {
      const cartString = localStorage.getItem("cart");
      const parsedItems = cartString ? JSON.parse(cartString) : [];
      setCartItems(parsedItems);
      console.log("CartDetails: Loaded cart data successfully");
    } catch (error) {
      console.error("CartDetails: Error loading cart data:", error);
      setCartItems([]);
    }
  };

  const toggleAdminView = () => {
    setIsAdmin(!isAdmin);
  };

  const formatCartData = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return "Error formatting cart data";
    }
  };

  // Calculate basic stats
  const getCartStats = () => {
    const totalItems = cartItems.length;
    const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalValue = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    
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
          <pre className="json-display">{formatCartData(cartItems)}</pre>
        </div>
        
        <div className="admin-actions">
          <button onClick={loadCartData} className="admin-btn refresh">
            Refresh Cart Data
          </button>
          <button onClick={() => localStorage.removeItem("cart")} className="admin-btn clear">
            Clear Cart Data
          </button>
        </div>
      </div>
    );
  };

  // User view component showing items in a more visual way
  const UserView = () => {
    const { totalItems, totalQuantity, totalValue } = getCartStats();
    
    return (
      <div className="user-container">
        <h2>Cart Summary</h2>
        
        <div className="summary-stats">
          <p>You have {totalItems} unique items ({totalQuantity} total) in your cart worth Rs. {totalValue.toFixed(2)}</p>
        </div>
        
        <div className="cart-items-list">
          <h3>Items in Your Cart</h3>
          {cartItems.length === 0 ? (
            <p className="empty-cart-message">Your cart is currently empty</p>
          ) : (
            <div className="items-table">
              <div className="items-header">
                <span>Item</span>
                <span>Artist</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Total</span>
              </div>
              
              {cartItems.map((item, index) => (
                <div key={`${item._id || 'unknown'}-${index}`} className="item-row">
                  <span className="item-title">{item.title || "Unknown Item"}</span>
                  <span className="item-artist">{item.artistName || "Unknown Artist"}</span>
                  <span className="item-price">Rs. {(item.price || 0).toFixed(2)}</span>
                  <span className="item-quantity">{item.quantity || 1}</span>
                  <span className="item-total">Rs. {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Link to="/cart" className="view-cart-btn">
          Go to Shopping Cart
        </Link>
      </div>
    );
  };

  return (
    <div className="cart-details-container">
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
      
      {isAdmin ? <AdminView /> : <UserView />}
    </div>
  );
};

export default CartDetails;