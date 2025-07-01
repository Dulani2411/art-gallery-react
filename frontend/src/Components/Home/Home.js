import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaHeart, FaShoppingCart, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import FavoritesService from "../FavoritesService/FavoritesService";
import "./Home.css";

const slides = [
  {
    title: "Discover Art Worldwide",
    description: "Explore a curated collection of unique artworks from global artists",
    image: "https://img.freepik.com/premium-photo/3d-character-bird-made-only-waffles-tree-branch_943281-76702.jpg?w=1380"
  },
  {
    title: "Diverse Artistic Expressions",
    description: "Journey through creativity, culture, and imagination",
    image: "https://img.freepik.com/premium-photo/sunset-silhouettes-trees-mountains-birds-flying_979520-22514.jpg?w=1380"
  },
  {
    title: "Support Independent Artists",
    description: "Every purchase directly supports talented creators",
    image: "https://img.freepik.com/premium-photo/beautiful-colorful-intricate-floral-backgorund-abstract-floral-wallpaper-generative-ai_751108-3483.jpg?w=1380"
  },
  {
    title: "Affordable Art for Everyone",
    description: "High-quality art pieces at accessible prices",
    image: "https://img.freepik.com/free-photo/vibrant-bouquet-colorful-flowers-reflects-beauty-nature-generated-by-artificial-intelligence_188544-240296.jpg?t=st=1743064205~exp=1743067805~hmac=c7dec25d5f6bfdfc7267d087c0e1863c8854dfb4a6e4c0378b421082de626d1d&w=1380"
  }
];

const Home = () => {
  const [artworks, setArtworks] = useState([]);
  const [trendingArtworks, setTrendingArtworks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [sortOption, setSortOption] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArtworks();
    fetchTrendingArtworks();

    // Load initial favorites
    setFavorites(FavoritesService.getFavorites());

    // Listen for favorites updates
    const handleFavoritesUpdate = () => {
      setFavorites(FavoritesService.getFavorites());
    };

    window.addEventListener("favoritesUpdated", handleFavoritesUpdate);

    // Slideshow auto-scroll
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => {
      clearInterval(slideInterval);
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
    };
  }, []);

  const fetchArtworks = () => {
    axios.get("http://localhost:5000/art")
      .then((response) => {
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setArtworks(response.data.data);
        } else {
          console.error("Expected an array in response, but received:", response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching artworks:", error);
      });
  };

  const fetchTrendingArtworks = () => {
    axios.get("http://localhost:5000/art/trending?limit=10")
      .then((response) => {
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          // Sort trending artworks by likes and views
          const sortedArtworks = response.data.data.sort((a, b) => {
            const aScore = (a.likes || 0) + (a.views || 0);
            const bScore = (b.likes || 0) + (b.views || 0);
            return bScore - aScore;
          });

          setTrendingArtworks(sortedArtworks);
          console.log("Trending artworks loaded:", sortedArtworks);
        } else {
          console.error("Expected an array in trending response, but received:", response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching trending artworks:", error);
      });
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
      window.dispatchEvent(new Event("cartUpdated"));
      const customEvent = new CustomEvent("cartUpdated", { 
        detail: { cart: updatedCart } 
      });
      window.dispatchEvent(customEvent);
    } catch (e) {
      console.error("Error dispatching cart event:", e);
    }

    alert(`${cartItem.title} has been added to your cart!`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/mainart?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const sortedArtworks = [...artworks].sort((a, b) => {
    if (sortOption === "name") return a.artType.localeCompare(b.artType);
    if (sortOption === "price") return a.price - b.price;
    return 0;
  });

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

  return (
    <div>
      <Nav />

      {/* Slideshow Section */}
      <div className="home-slideshow">
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: index === currentSlide ? 10 : 1
            }}
          >
            <div className="slide-content">
              <h1>{slide.title}</h1>
              <p>{slide.description}</p>
              <button onClick={() => navigate('/mainart')}>Explore Art</button>
            </div>
          </div>
        ))}
      </div>
      

      {/* Horizontal Scrolling Trending Artworks Section */}
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
              <div key={artwork._id} className="trending-art-card">
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

      <div className="art-home-container">
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artworks..."
              className="search-input"
            />
            <button type="submit" className="search-button">
              <FaSearch /> Search
            </button>
          </form>
        </div>

        <div className="sort-container">
          <label>Sort by: </label>
          <select onChange={(e) => setSortOption(e.target.value)}>
            <option value="name">A-Z</option>
            <option value="price">Price</option>
          </select>
        </div>
        
        <div className="art-grid" >
          {sortedArtworks.map((art) => (
            <div key={art._id} className="art-card">
              <div 
                onClick={() => navigate(`/artdetail/${art._id}`)} 
                className="art-link"
              >
                <img
                  src={art.image || "https://via.placeholder.com/150"}
                  alt={art.artType}
                  className="art-image"
                />
                <h3 className="art-title">{art.artType}</h3>
              </div>
              <p className="art-price" style={{ fontSize: "18px" }}>
  Price: <span style={{ fontSize: "17px" }}>Rs.{art.price}.00</span>
</p>


              <p className="art-artist">Artist: {art.artistName}</p>
              <div className="art-actions">
                <FaHeart
                  className={favorites.includes(art._id) ? "favorite active" : "favorite"}
                  onClick={() => toggleFavorite(art)}
                />
                <button
  onClick={() => addToCart(art)}
  style={{
    background: "linear-gradient(to right, #2c3e50, #1a5276)",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "50px",
    padding: "8px 16px",
    fontSize: "1rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    transition: "all 0.3s ease",
    fontWeight: 700,
    letterSpacing: "0.5px",
    boxShadow: "0 4px 10px rgba(52, 152, 219, 0.2)",
  }}
>
  <FaShoppingCart /> Add to Cart
</button>

              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Home;