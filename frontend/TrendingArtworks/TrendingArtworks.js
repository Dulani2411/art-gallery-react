import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaHeart, FaShoppingCart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import FavoritesService from "../FavoritesService/FavoritesService";
import "./TrendingArtworks.css";

// This is a standalone component you can import into your Home.js
const TrendingArtworks = ({ limit = 10 }) => {
  const [trendingArtworks, setTrendingArtworks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("TrendingArtworks component mounted");
    fetchTrendingArtworks();
    
    // Load initial favorites
    setFavorites(FavoritesService.getFavorites());

    // Listen for favorites updates
    const handleFavoritesUpdate = () => {
      setFavorites(FavoritesService.getFavorites());
    };

    window.addEventListener("favoritesUpdated", handleFavoritesUpdate);

    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
    };
  }, [limit]);

  const fetchTrendingArtworks = async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching trending artworks...");
    
    try {
      // Try to use the trending endpoint first
      const response = await axios.get(`http://localhost:5000/art/trending?limit=${limit}`);
      console.log("Trending API response:", response.data);
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const sortedData = response.data.data.sort((a, b) => {
          const aScore = (a.likes || 0) + (a.views || 0);
          const bScore = (b.likes || 0) + (b.views || 0);
          return bScore - aScore;
        });
        
        console.log("Sorted trending artworks:", sortedData);
        setTrendingArtworks(sortedData);
      } else {
        console.error("Expected an array in response, but received:", response.data);
        await fallbackToRegularArt();
      }
    } catch (error) {
      console.error("Error fetching trending artworks:", error);
      setError(error);
      // If trending endpoint fails, fallback to regular art endpoint
      await fallbackToRegularArt();
    } finally {
      setLoading(false);
    }
  };

  // Fallback function to get regular art if trending endpoint fails
  const fallbackToRegularArt = async () => {
    console.log("Falling back to regular art endpoint");
    try {
      const response = await axios.get(`http://localhost:5000/art?limit=${limit}`);
      console.log("Regular art API response:", response.data);
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Just use the first few items as "trending"
        const artworks = response.data.data.slice(0, limit);
        console.log("Using regular art as trending:", artworks);
        setTrendingArtworks(artworks);
      } else {
        console.error("Expected an array in fallback response, but received:", response.data);
        // Set empty array if nothing works
        setTrendingArtworks([]);
      }
    } catch (error) {
      console.error("Error in fallback fetch:", error);
      setError(error);
      setTrendingArtworks([]);
    }
  };

  const toggleFavorite = (artwork) => {
    FavoritesService.toggleFavorite(artwork);
  };

  const addToCart = (artwork) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    const cartItem = {
      id: artwork._id || artwork.id,
      title: artwork.title || artwork.artType,
      artType: artwork.artType,
      artistName: artwork.artistName,
      price: artwork.price,
      image: artwork.image,
      quantity: 1
    };
    
    const existingItemIndex = existingCart.findIndex(
      item => String(item.id) === String(cartItem.id) || 
             String(item._id) === String(cartItem.id)
    );
    
    if (existingItemIndex >= 0) {
      alert("This artwork is already in your cart!");
      return;
    }
    
    const updatedCart = [...existingCart, cartItem];
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    
    try {
      // Create and dispatch both events for maximum compatibility
      const simpleEvent = new Event("cartUpdated");
      window.dispatchEvent(simpleEvent);
      
      const customEvent = new CustomEvent("cartUpdated", { 
        detail: { cart: updatedCart } 
      });
      window.dispatchEvent(customEvent);
    } catch (e) {
      console.error("Error dispatching cart event:", e);
    }
    
    alert(`${cartItem.title} has been added to your cart!`);
  };

  const scrollLeft = () => {
    const container = document.querySelector('.trending-artworks-scroll');
    if (container) {
      const newPosition = Math.max(scrollPosition - 300, 0);
      setScrollPosition(newPosition);
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    const container = document.querySelector('.trending-artworks-scroll');
    if (container) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const newPosition = Math.min(scrollPosition + 300, maxScroll);
      setScrollPosition(newPosition);
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return <div className="trending-loading">Loading trending artworks...</div>;
  }

  if (error) {
    return <div className="trending-error">Error loading trending artworks. Please try again later.</div>;
  }

  // If we have no artworks to display after trying both endpoints
  if (trendingArtworks.length === 0) {
    return <div className="trending-empty">No trending artworks available at the moment.</div>;
  }

  return (
    <div className="trending-section">
      <div className="trending-header">
        <h2>🔥 Trending Artworks</h2>
        <div className="trending-controls">
          <button className="scroll-button" onClick={scrollLeft}><FaChevronLeft /></button>
          <button className="scroll-button" onClick={scrollRight}><FaChevronRight /></button>
        </div>
      </div>
      
      <div className="trending-artworks-container">
        <div className="trending-artworks-scroll">
          {trendingArtworks.map(artwork => (
            <div key={artwork._id || `artwork-${Math.random()}`} className="trending-art-card">
              <div 
                onClick={() => navigate(`/artdetail/${artwork._id}`)} 
                className="art-link"
              >
                <img
                  src={artwork.image || "https://via.placeholder.com/150"}
                  alt={artwork.artType}
                  className="art-image"
                />
                <h3 className="art-title">{artwork.artType}</h3>
              </div>
              <p className="art-price">Price: <span>Rs.{artwork.price}.00</span></p>
              <p className="art-artist">Artist: {artwork.artistName}</p>
              <div className="art-stats">
                <span className="likes">❤️ {artwork.likes || 0} likes</span>
                <span className="views">👁️ {artwork.views || 0} views</span>
              </div>
              <div className="art-actions">
                <FaHeart
                  className={favorites.includes(artwork._id) ? "favorite active" : "favorite"}
                  onClick={() => toggleFavorite(artwork)}
                />
                <button className="add-to-cart-btn" onClick={() => addToCart(artwork)}>
                  <FaShoppingCart /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingArtworks;