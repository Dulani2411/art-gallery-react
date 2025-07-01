import Art from "../Model/artModel.js";
import { imageUploadUtil, upload } from "../config/cloudinary.js";

// Get top trending artworks by views and likes
// Get top trending artworks by views and likes
export const getTrendingArtworks = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        // Add error handling for the database query
        const trending = await Art.find({})
            .sort({ likes: -1, views: -1 }) // Sort by likes first, then views
            .limit(limit); // Use the limit from query params
        
        if (!trending) {
            return res.status(404).json({
                success: false,
                message: "No artworks found"
            });
        }

        // Log success for debugging
        console.log(`Successfully retrieved ${trending.length} trending artworks`);
        
        return res.status(200).json({
            success: true,
            data: trending
        });
    } catch (err) {
        console.error("Error fetching trending artworks:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
};

// Handle image upload
export const handleImageUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided"
            });
        }

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const url = "data:" + req.file.mimetype + ";base64," + b64;
        const result = await imageUploadUtil(url);
        
        res.json({
            success: true,
            result,
        });
        
    } catch (error) {
        console.error("Image upload error:", error);
        res.status(500).json({
            success: false,
            message: "Error occurred during image upload",
            error: error.message
        });
    }
};

// GET All Artworks
export const getAllArtworks = async (req, res) => {
    try {
        const listOfArts = await Art.find({});
        res.status(200).json({
            success: true,
            data: listOfArts,
        });
    } catch (error) {
        console.error("Error fetching all artworks:", error);
        res.status(500).json({
            success: false,
            message: "Error occurred while fetching artworks",
            error: error.message
        });
    }
};

// GET Artwork by ID (updated with view tracking)
export const getArtworkById = async (req, res) => {
    try {
        const artId = req.params.id;
        
        if (!artId) {
            return res.status(400).json({ 
                success: false,
                message: "Artwork ID is required" 
            });
        }
        
        const art = await Art.findById(artId);
        
        if (!art) {
            return res.status(404).json({ 
                success: false,
                message: "Artwork not found" 
            });
        }
        
        // Increment view count
        art.views += 1;
        await art.save();
        
        return res.status(200).json({ 
            success: true,
            data: art 
        });
    } catch (err) {
        console.error("Error fetching artwork by ID:", err);
        return res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

// POST (Add New Artwork with Image Upload)
export const addArtwork = async (req, res) => {
    try {
        const { artType, description, price, artistName, gmail, image } = req.body;
        
        if (!artType || !description || !price || !artistName || !gmail || !image) {
            return res.status(400).json({
                success: false,
                message: "All fields are required (artType, description, price, artistName, gmail, image)"
            });
        }
        
        const art = new Art({ 
            artType, 
            description, 
            price, 
            artistName, 
            gmail, 
            image 
        });
        
        await art.save();
        
        res.status(201).json({ 
            success: true,
            data: art 
        });
    } catch (err) {
        console.error("Error adding artwork:", err);
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

// PUT (Update Artwork)
export const updateArtwork = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            artType,
            description,
            price,
            artistName,
            gmail,
            image,
        } = req.body;
        
        let artwork = await Art.findById(id);
        
        if (!artwork) {
            return res.status(404).json({ 
                success: false,
                message: "Artwork not found" 
            });
        }
        
        artwork.artType = artType || artwork.artType;
        artwork.description = description || artwork.description;
        artwork.price = price || artwork.price;
        artwork.artistName = artistName || artwork.artistName;
        artwork.gmail = gmail || artwork.gmail;
        artwork.image = image || artwork.image;
        
        await artwork.save();
        
        res.status(200).json({ 
            success: true,
            message: "Artwork updated successfully", 
            data: artwork 
        });
    } catch (err) {
        console.error("Error updating artwork:", err);
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

// DELETE (Remove Artwork)
export const deleteArtwork = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedArt = await Art.findByIdAndDelete(id);
        
        if (!deletedArt) {
            return res.status(404).json({ 
                success: false,
                message: "Artwork not found" 
            });
        }
        
        res.status(200).json({ 
            success: true,
            message: "Artwork deleted successfully", 
            data: deletedArt 
        });
    } catch (err) {
        console.error("Error deleting artwork:", err);
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

// NEW: Toggle like on artwork
export const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id; // Assuming you have user authentication
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        const artwork = await Art.findById(id);
        
        if (!artwork) {
            return res.status(404).json({
                success: false,
                message: "Artwork not found"
            });
        }
        
        const likeIndex = artwork.likedBy.indexOf(userId);
        let action;
        
        if (likeIndex === -1) {
            // Like the artwork
            artwork.likedBy.push(userId);
            artwork.likes += 1;
            action = 'liked';
        } else {
            // Unlike the artwork
            artwork.likedBy.splice(likeIndex, 1);
            artwork.likes -= 1;
            action = 'unliked';
        }
        
        await artwork.save();
        
        res.status(200).json({
            success: true,
            action,
            likes: artwork.likes,
            isLiked: action === 'liked'
        });
        
    } catch (err) {
        console.error("Error toggling like:", err);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
};

// Get trending artworks from a list of favorite IDs
export const getTrendingFromFavorites = async (req, res) => {
  try {
    const { artworkIds } = req.body;
    
    if (!Array.isArray(artworkIds)) {
      return res.status(400).json({
        success: false,
        message: "Artwork IDs must be provided as an array"
      });
    }
    
    const trending = await Art.find({
      _id: { $in: artworkIds }
    }).sort({ likes: -1, views: -1 });
    
    res.status(200).json({
      success: true,
      data: trending
    });
    
  } catch (err) {
    console.error("Error fetching trending from favorites:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// Export both named exports and upload middleware
export { upload };

// Export default object for router
export default {
    getAllArtworks,
    getArtworkById,
    addArtwork,
    updateArtwork,
    deleteArtwork,
    handleImageUpload,
    toggleLike,
    getTrendingArtworks,
    getTrendingFromFavorites,
    upload
};