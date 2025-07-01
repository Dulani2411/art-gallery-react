import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import "./ArtDetail.css";
import { FaShoppingCart } from "react-icons/fa";
import Footer from "../ArtDetail/ArtDetail";

const ArtDetail = () => {
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtworkDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/art/${id}`);
        if (response.data && response.data.success) {
          console.log("Artwork detail data:", response.data.data);
          setArtwork(response.data.data);
        } else {
          setError("Failed to load artwork details");
        }
      } catch (err) {
        setError("Error fetching artwork details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworkDetails();
  }, [id]);

// In ArtDetail.js
// In ArtDetail.js - addToCart function

const addToCart = () => {
  if (!artwork) return;
  
  // Create cart item
  const cartItem = {
    _id: artwork._id,
    title: artwork.title || artwork.artType || "Artwork",
    artType: artwork.artType,
    artistName: artwork.artistName || "Unknown Artist",
    price: artwork.price || 0,
    image: artwork.image || "https://via.placeholder.com/100",
    quantity: 1
  };
  
  console.log("ART DETAIL: Adding item to cart:", cartItem);
  
  try {
    // Direct localStorage approach
    const cartString = localStorage.getItem("cart");
    console.log("ART DETAIL: Current cart data:", cartString);
    
    // Parse existing cart or create new one
    let existingCart = [];
    if (cartString) {
      try {
        existingCart = JSON.parse(cartString);
        if (!Array.isArray(existingCart)) {
          console.error("ART DETAIL: Invalid cart format, resetting");
          existingCart = [];
        }
      } catch (parseError) {
        console.error("ART DETAIL: Error parsing cart, resetting", parseError);
        existingCart = [];
      }
    }
    
    console.log("ART DETAIL: Parsed existing cart:", existingCart);
    
    // Check if item already exists
    const existingItemIndex = existingCart.findIndex(
      item => String(item._id) === String(cartItem._id) || 
             String(item.id) === String(cartItem._id)
    );
    
    if (existingItemIndex >= 0) {
      alert("This artwork is already in your cart!");
      return;
    }
    
    // Add new item
    const updatedCart = [...existingCart, cartItem];
    console.log("ART DETAIL: Updated cart:", updatedCart);
    
    // Save directly to localStorage
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    
    // Verify the save worked
    const savedCart = localStorage.getItem("cart");
    console.log("ART DETAIL: Saved cart verification:", savedCart);
    
   
    try {
      // Standard Event
      window.dispatchEvent(new Event("cartUpdated"));
      
      // Custom Event with more data and better compatibility
      const customEvent = new CustomEvent("cartUpdated", { 
        detail: { cart: updatedCart } 
      });
      window.dispatchEvent(customEvent);
    } catch (e) {
      console.error("Error dispatching cart event:", e);
    }
    
    alert(`${cartItem.title} has been added to your cart!`);
    
    //navigation to cart
    navigate("/cart");
  } catch (error) {
    console.error("ART DETAIL: Error adding to cart:", error);
    alert("Failed to add item to cart. Please try again.");
  }
};

  const handlePurchase = () => {
    try {
      localStorage.setItem("purchaseItem", JSON.stringify(artwork));
      navigate("/checkout");
    } catch (error) {
      console.error("Error storing purchase item:", error);
      alert("Failed to proceed with purchase.");
    }
  };

  if (loading) return <div className="loading">Loading artwork details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!artwork) return <div className="not-found">Artwork not found</div>;


  return (
    <div>
      <Nav />
      <div className="art-detail-container">
        <div className="art-detail-image">
          <img src={artwork.image || "https://via.placeholder.com/400"} alt={artwork.title || artwork.artType} />
        </div>
        <div className="art-detail-info">
          <h1>{artwork.title || artwork.artType}</h1>
          <p className="art-type">{artwork.artType}</p>
          <p className="art-price">Rs. {artwork.price}.00</p>
          <div className="artist-info">
            <h3>Artist</h3>
            <p>{artwork.artistName}</p>
            <p className="contact">{artwork.email || "No email available"}</p>
          </div>
          <div className="art-description">
            <h3>Description</h3>
            <p>{artwork.description}</p>
          </div>
          <div className="action-buttons">
            <button className="add-to-cart-btn" onClick={addToCart}>
              <FaShoppingCart /> Add to Cart
            </button>
            <button className="purchase-btn" onClick={handlePurchase}>
              Purchase Now
            </button>
          </div>
        </div>
      </div>
      
    </div>
    
  );
};

export default ArtDetail;