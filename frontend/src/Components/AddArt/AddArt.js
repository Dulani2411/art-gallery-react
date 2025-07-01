import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Nav from "../Nav/Nav";
import './AddArt.css';

function AddArt() {
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({
        artType: "",
        description: "",
        price: "",
        artistName: "",
        gmail: "",
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // price, remove non-numeric characters
        if (name === "price") {
            let numericValue = value.replace(/[^0-9]/g, ""); // Allow only numbers
            setInputs((prevState) => ({
                ...prevState,
                [name]: numericValue,
            }));
        } else if (name === "artistName") {
            // Allow only alphabets and spaces
            let sanitizedValue = value.replace(/[^a-zA-Z\s]/g, "");
            setInputs((prevState) => ({
                ...prevState,
                [name]: sanitizedValue,
            }));
        } else {
            setInputs((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        
        if (selectedFile) {
            setImage(selectedFile);
            
            // Create image preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const uploadImage = async () => {
        if (!image) return null;
        
        const formData = new FormData();
        formData.append("image", image);
        
        try {
            const response = await axios.post(
                "http://localhost:5000/art/upload-image", 
                formData, 
                {
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );
            
            if (response.data && response.data.success && response.data.result) {
                return response.data.result.secure_url; // Return Cloudinary URL
            } else {
                throw new Error("Image upload failed");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
        }
    };

    const sendRequest = async () => {
        setLoading(true);
        setError(null);
        
        try {
            //upload the image to get the URL
            const imageUrl = await uploadImage();
            
            if (!imageUrl) {
                setError("Image upload failed. Please try again.");
                setLoading(false);
                return;
            }
            
            // Now send the artwork data with the image URL
            const artworkData = {
                artType: inputs.artType,
                description: inputs.description,
                price: Number(inputs.price),
                artistName: inputs.artistName,
                gmail: inputs.gmail,
                image: imageUrl // Use the Cloudinary URL
            };
            
            const response = await axios.post(
                "http://localhost:5000/art", 
                artworkData
            );
            
            if (response.data && response.data.success) {
                alert("Artwork added successfully!");
                navigate("/mainart");
            } else {
                throw new Error("Failed to add artwork. Please try again.");
            }
        } catch (error) {
            console.error("Error adding artwork:", error);
            setError(error.message || "Error uploading artwork. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Form validation
        if (!inputs.artType || !inputs.description || !inputs.price || !inputs.artistName || !inputs.gmail) {
            setError("All fields are required!");
            return;
        }

        if (isNaN(inputs.price) || Number(inputs.price) <= 0) {
            setError("Please enter a valid price!");
            return;
        }
        
        if (!image) {
            setError("Please select an image!");
            return;
        }

        sendRequest(); 
    };

    return (
        <>
            <Nav />
            <div className="form-container">
                <h2>Add Art</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Art Type:</label>
                        <select 
                            name="artType" 
                            value={inputs.artType} 
                            onChange={handleChange} 
                            required
                            className="form-select"
                        >
                            <option value="">Select Art Type</option>
                            <option value="Oil Painting">Oil Painting</option>
                            <option value="Acrylic Painting">Acrylic Painting</option>
                            <option value="Watercolor">Watercolor</option>
                            <option value="Pencil Drawing">Pencil Drawing</option>
                            <option value="Pastel Art">Pastel Art</option>
                            <option value="3D Art">3D Art</option>
                            <option value="Photography & Digital Art">Photography & Digital Art</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description:</label>
                        <textarea
                            name="description"
                            value={inputs.description}
                            onChange={handleChange}
                            className="form-textarea"
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Price:</label>
                        <div className="price-input">
                            <span className="currency">Rs. </span>
                            <input
                                type="text"
                                name="price"
                                value={inputs.price}
                                onChange={handleChange}
                                placeholder="Enter price"
                                className="form-input"
                                required
                            />
                            <span className="decimal">.00</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Artist Name:</label>
                        <input
                            type="text"
                            name="artistName"
                            value={inputs.artistName}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Gmail:</label>
                        <input
                            type="email"
                            name="gmail"
                            value={inputs.gmail}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Upload Image:</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="form-file-input"
                            required 
                        />
                        
                        {imagePreview && (
                            <div className="image-preview-container">
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="image-preview" 
                                />
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button" 
                        disabled={loading}
                    >
                        {loading ? "Uploading..." : "Submit"}
                    </button>
                </form>
            </div>
        </>
    );
}

export default AddArt;