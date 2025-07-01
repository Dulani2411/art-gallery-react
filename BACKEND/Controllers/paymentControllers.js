import Payment from "../Model/paymentModel.js";
import Art from "../Model/artModel.js";
import { imageUploadUtil, upload } from "../config/cloudinary.js";
import { sendPaymentEmail } from "../utils/sendPaymentEmail.js";
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

export const processPayment = async (req, res) => {
  try {
    const paymentData = req.body;

    // Optionally save paymentData to MongoDB here...

    // Send confirmation email
    await sendPaymentEmail(paymentData.email, paymentData);

    res.status(200).json({
      success: true,
      message: "Payment processed and confirmation sent.",
      data: { _id: "demo-id" }, // Replace with actual saved ID
    });
  } catch (err) {
    console.error("Payment processing failed:", err);
    res.status(500).json({
      success: false,
      message: "Payment failed.",
      error: err.message,
    });
  }
};
// Handle image upload for payment
export const handlePaymentImageUpload = async (req, res) => {
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
        console.error("Payment image upload error:", error);
        res.status(500).json({
            success: false,
            message: "Error occurred during payment image upload",
            error: error.message
        });
    }
};

// GET All Payments
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find({}).populate('artworks.artworkId');
        res.status(200).json({
            success: true,
            data: payments,
        });
    } catch (error) {
        console.error("Error fetching all payments:", error);
        res.status(500).json({
            success: false,
            message: "Error occurred while fetching payments",
            error: error.message
        });
    }
};

// GET Payment by ID
export const getPaymentById = async (req, res) => {
    try {
        const paymentId = req.params.id;
        
        if (!paymentId) {
            return res.status(400).json({ 
                success: false,
                message: "Payment ID is required" 
            });
        }
        
        const payment = await Payment.findById(paymentId).populate('artworks.artworkId');
        
        if (!payment) {
            return res.status(404).json({ 
                success: false,
                message: "Payment not found" 
            });
        }
        
        return res.status(200).json({ 
            success: true,
            data: payment 
        });
    } catch (err) {
        console.error("Error fetching payment by ID:", err);
        return res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

// POST (Create New Payment with Image)
export const createPayment = async (req, res) => {
  try {
      const { name, address, email, contactNumber, image, artworks, totalAmount } = req.body;
      
      // Check if required fields are provided
      if (!name || !address || !email || !contactNumber || !image || !artworks || !totalAmount) {
          return res.status(400).json({
              success: false,
              message: "All fields are required (name, address, email, contactNumber, image, artworks, totalAmount)"
          });
      }
      
      // Validate artworks data
      if (!Array.isArray(artworks) || artworks.length === 0) {
          return res.status(400).json({
              success: false,
              message: "Artworks should be an array with at least one item"
          });
      }
      
      // Check if all artwork IDs exist
      const artworkIds = artworks.map(item => item.artworkId);
      const existingArtworks = await Art.find({ _id: { $in: artworkIds } });
      
      if (existingArtworks.length !== artworkIds.length) {
          return res.status(400).json({
              success: false,
              message: "One or more artwork IDs are invalid"
          });
      }
      
      // Create new payment
      const payment = new Payment({ 
          name, 
          address, 
          email, 
          contactNumber, 
          image,
          artworks,
          totalAmount
      });
      
      await payment.save();
      
      // Send confirmation email
      try {
          await sendPaymentEmail(email, { 
              name, 
              address, 
              email, 
              contactNumber, 
              artworks, 
              totalAmount 
          });
          console.log("Payment confirmation email sent successfully");
      } catch (emailError) {
          console.error("Failed to send payment confirmation email:", emailError);
          // Continue with the response even if email fails
      }
      
      res.status(201).json({ 
          success: true,
          data: payment 
      });
  } catch (err) {
      console.error("Error creating payment:", err);
      res.status(500).json({ 
          success: false,
          message: "Server error", 
          error: err.message 
      });
  }
};

// PUT (Update Payment)
export const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            address,
            email,
            contactNumber,
            image,
            artworks,
            totalAmount,
            paymentStatus
        } = req.body;
        
        // Find payment by ID
        let payment = await Payment.findById(id);
        
        if (!payment) {
            return res.status(404).json({ 
                success: false,
                message: "Payment not found" 
            });
        }
        
        // Update fields if provided
        if (name) payment.name = name;
        if (address) payment.address = address;
        if (email) payment.email = email;
        if (contactNumber) payment.contactNumber = contactNumber;
        if (image) payment.image = image;
        if (totalAmount) payment.totalAmount = totalAmount;
        if (paymentStatus) payment.paymentStatus = paymentStatus;
        
        // Update artworks if provided
        if (artworks && Array.isArray(artworks) && artworks.length > 0) {
            // Validate artwork IDs
            const artworkIds = artworks.map(item => item.artworkId);
            const existingArtworks = await Art.find({ _id: { $in: artworkIds } });
            
            if (existingArtworks.length !== artworkIds.length) {
                return res.status(400).json({
                    success: false,
                    message: "One or more artwork IDs are invalid"
                });
            }
            
            payment.artworks = artworks;
        }
        
        // Save updated payment
        await payment.save();
        
        res.status(200).json({ 
            success: true,
            message: "Payment updated successfully", 
            data: payment 
        });
    } catch (err) {
        console.error("Error updating payment:", err);
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

// PATCH (Update Payment Status)
export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;
        
        if (!paymentStatus) {
            return res.status(400).json({
                success: false,
                message: "Payment status is required"
            });
        }
        
        // Find payment by ID
        const payment = await Payment.findById(id);
        
        if (!payment) {
            return res.status(404).json({ 
                success: false,
                message: "Payment not found" 
            });
        }
        
        // Update payment status
        payment.paymentStatus = paymentStatus;
        
        // Save updated payment
        await payment.save();
        
        res.status(200).json({ 
            success: true,
            message: "Payment status updated successfully", 
            data: payment 
        });
    } catch (err) {
        console.error("Error updating payment status:", err);
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

// DELETE (Remove Payment)
export const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedPayment = await Payment.findByIdAndDelete(id);
        
        if (!deletedPayment) {
            return res.status(404).json({ 
                success: false,
                message: "Payment not found" 
            });
        }
        
        res.status(200).json({ 
            success: true,
            message: "Payment deleted successfully", 
            data: deletedPayment 
        });
    } catch (err) {
        console.error("Error deleting payment:", err);
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
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    handlePaymentImageUpload,
    updatePaymentStatus, // Added this new function
    upload
};