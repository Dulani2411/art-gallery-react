import express from "express";
import artControllers from "../Controllers/artControllers.js";
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// IMPORTANT: Put specific routes BEFORE parameter routes
// Special routes with specific paths need to come first
router.get("/trending", artControllers.getTrendingArtworks);

// Upload image route
router.post("/upload-image", artControllers.upload.single("image"), artControllers.handleImageUpload);

// Get all artworks
router.get("/", artControllers.getAllArtworks);

// Add new artwork
router.post("/", artControllers.addArtwork);

// Post route for trending favorites
router.post("/trending-favorites", artControllers.getTrendingFromFavorites);

// Routes with parameters should come AFTER specific routes
// Get artwork by ID
router.get("/:id", artControllers.getArtworkById);

// Update artwork
router.put("/:id", artControllers.updateArtwork);

// Delete artwork
router.delete("/:id", artControllers.deleteArtwork);

// Toggle like on artwork
router.post("/:id/toggle-like", artControllers.toggleLike);

// View count increment route
router.post("/view/:id", async (req, res) => {
    try {
      const artId = req.params.id;
      
      // Find the art by ID and increment the views count
      const art = await Art.findById(artId);
      
      if (!art) {
        return res.status(404).json({ 
          success: false, 
          message: "Art not found" 
        });
      }
      
      // Increment views or initialize to 1 if not exists
      art.views = (art.views || 0) + 1;
      await art.save();
      
      return res.status(200).json({ 
        success: true, 
        views: art.views 
      });
    } catch (error) {
      console.error("Error updating view count:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Server error", 
        error: error.message 
      });
    }
  });
  
// Route to handle favorites
router.post("/favorite/:id", async (req, res) => {
  try {
    const artId = req.params.id;
    const { action } = req.body;
    
    if (!action || (action !== 'add' && action !== 'remove')) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid action. Must be 'add' or 'remove'." 
      });
    }
    
    const art = await Art.findById(artId);
    
    if (!art) {
      return res.status(404).json({ 
        success: false, 
        message: "Art not found" 
      });
    }
    
    // Initialize favorites count if not exists
    art.favoritesCount = art.favoritesCount || 0;
    
    // Update favorite count based on action
    if (action === 'add') {
      art.favoritesCount += 1;
    } else if (action === 'remove' && art.favoritesCount > 0) {
      art.favoritesCount -= 1;
    }
    
    await art.save();
    
    return res.status(200).json({ 
      success: true, 
      favoritesCount: art.favoritesCount 
    });
  } catch (error) {
    console.error("Error updating favorites:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
});

export default router;