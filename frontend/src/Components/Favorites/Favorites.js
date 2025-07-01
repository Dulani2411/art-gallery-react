import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import { FaHeart, FaShoppingCart, FaTrash } from "react-icons/fa";
import axios from "axios";
import FavoritesService from "../FavoritesService/FavoritesService";
import "./Favorites.css";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [favoritesDetails, setFavoritesDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trendingFromFavorites, setTrendingFromFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favs = FavoritesService.getFavorites();
        setFavorites(favs);
        
        // Fetch full details for all favorites
        if (favs.length > 0) {
          const details = await fetchFavoritesDetails(favs);
          setFavoritesDetails(details);
          fetchTrendingFromFavorites(favs);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading favorites:", error);
        setIsLoading(false);
      }
    };

    loadFavorites();

    const handleUpdate = async () => {
      const updatedFavorites = FavoritesService.getFavorites();
      setFavorites(updatedFavorites);
      if (updatedFavorites.length > 0) {
        const details = await fetchFavoritesDetails(updatedFavorites);
        setFavoritesDetails(details);
        fetchTrendingFromFavorites(updatedFavorites);
      } else {
        setFavoritesDetails([]);
        setTrendingFromFavorites([]);
      }
    };

    window.addEventListener("favoritesUpdated", handleUpdate);
    return () => window.removeEventListener("favoritesUpdated", handleUpdate);
  }, []);

  // Function to fetch details for all favorite artworks
  const fetchFavoritesDetails = async (favIds) => {
    try {
      const promises = favIds.map(id => 
        axios.get(`http://localhost:5000/art/${id}`)
          .then(res => res.data.data)
          .catch(err => {
            console.error(`Error fetching artwork ${id}:`, err);
            return null;
          })
      );
      
      const results = await Promise.all(promises);
      return results.filter(artwork => artwork !== null);
    } catch (error) {
      console.error("Error fetching favorites details:", error);
      return [];
    }
  };

  const fetchTrendingFromFavorites = async (favIds) => {
    if (favIds.length === 0) return;
    
    try {
      const response = await axios.post("http://localhost:5000/art/trending-from-favorites", {
        artworkIds: favIds
      });
      
      if (response.data && response.data.success) {
        setTrendingFromFavorites(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching trending from favorites:", error);
    }
  };

  const removeFromFavorites = (id) => {
    FavoritesService.removeFromFavorites(id);
    setFavoritesDetails(favoritesDetails.filter(art => art._id !== id));
  };

  const addToCart = async (itemId) => {
    try {
      // Use the already fetched details if available
      const artwork = favoritesDetails.find(art => art._id === itemId) || 
                     await axios.get(`http://localhost:5000/art/${itemId}`).then(res => res.data.data);
      
      if (!artwork) {
        throw new Error("Artwork not found");
      }

      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const cartItem = {
        id: artwork._id,
        title: artwork.artType,
        artistName: artwork.artistName,
        price: artwork.price,
        image: artwork.image,
        quantity: 1
      };

      if (existingCart.some(item => item.id === artwork._id)) {
        alert("This artwork is already in your cart!");
        return;
      }

      const updatedCart = [...existingCart, cartItem];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      
      try {
        const customEvent = new CustomEvent("cartUpdated", { 
          detail: { cart: updatedCart } 
        });
        window.dispatchEvent(customEvent);
      } catch (e) {
        console.error("Error dispatching cart event:", e);
      }
      
      alert(`${artwork.artType} has been added to your cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("There was an error adding to cart. Please try again.");
    }
  };

  const clearAllFavorites = () => {
    if (window.confirm("Are you sure you want to clear all favorites?")) {
      FavoritesService.clearFavorites();
      setFavoritesDetails([]);
      setTrendingFromFavorites([]);
    }
  };

  return (
    <div>
      <Nav />
      <div className="favorites-container">
        <div className="favorites-header">
          <h1>My Favorite Artworks</h1>
          {favorites.length > 0 && (
            <button className="clear-favorites-btn" onClick={clearAllFavorites}>
              Clear All Favorites
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="loading-spinner">Loading...</div>
        ) : favorites.length > 0 ? (
          <>
            <div className="favorites-grid">
              {favoritesDetails.map(artwork => (
                <div key={artwork._id} className="favorite-card">
                  <img
                    src={artwork.image || "https://via.placeholder.com/150"}
                    alt={artwork.artType || "Artwork"}
                    className="favorite-image"
                    onClick={() => navigate(`/mainart/${artwork._id}`)}
                  />
                  <div className="favorite-info">
                    <h3 className="favorite-title">{artwork.artType || "Unknown Artwork"}</h3>
                    <p className="favorite-price">Price: <span>Rs.{artwork.price || "0"}.00</span></p>
                    <p className="favorite-artist">Artist: {artwork.artistName || "Unknown"}</p>
                    <div className="favorite-stats">
                      <span>❤️ {artwork.likes || 0} likes</span>
                      <span>👁️ {artwork.views || 0} views</span>
                    </div>
                    <div className="favorite-actions">
                      <button
                        className="remove-favorite-btn"
                        onClick={() => removeFromFavorites(artwork._id)}
                      >
                        <FaTrash /> Remove
                      </button>
                      <button
                        className="add-to-cart-btn"
                        onClick={() => addToCart(artwork._id)}
                      >
                        <FaShoppingCart /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {trendingFromFavorites.length > 0 && (
              <div className="trending-favorites-section">
                <h2>⭐ Most Popular From Your Favorites</h2>
                <div className="trending-favorites-grid">
                  {trendingFromFavorites
                    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                    .slice(0, 3)
                    .map(artwork => (
                      <div key={artwork._id} className="trending-favorite-card">
                        <img
                          src={artwork.image}
                          alt={artwork.artType}
                          onClick={() => navigate(`/mainart/${artwork._id}`)}
                        />
                        <div className="trending-favorite-stats">
                          <span>❤️ {artwork.likes} likes</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-favorites">
            <FaHeart className="empty-heart-icon" />
            <h2>No favorites yet</h2>
            <p>You haven't added any artworks to your favorites yet.</p>
            <button onClick={() => navigate("/mainart")} className="explore-art-btn">
              Explore Art
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;