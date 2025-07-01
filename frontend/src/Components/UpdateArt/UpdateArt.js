import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Nav from "../Nav/Nav";
import './UpdateArt.css';

function UpdateArt() {
    const [inputs, setInputs] = useState({});
    const [errors, setErrors] = useState({});
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [globalError, setGlobalError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    // Validation Functions
    const validateArtType = (value) => {
        return !value ? "Art Type is required" : "";
    };

    const validateDescription = (value) => {
        if (!value) return "Description is required";
        if (value.length < 10) return "Description must be at least 10 characters long";
        return "";
    };

    const validatePrice = (value) => {
        if (!value) return "Price is required";
        const numericPrice = Number(value);
        if (isNaN(numericPrice)) return "Price must be a number";
        if (numericPrice <= 0) return "Price must be greater than zero";
        if (numericPrice > 1000000) return "Price is too high";
        return "";
    };

    const validateArtistName = (value) => {
        if (!value) return "Artist Name is required";
        if (value.length < 2) return "Artist Name must be at least 2 characters long";
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Artist Name can only contain letters";
        return "";
    };

    const validateEmail = (email) => {
        if (!email) return "Email is required";
        const emailRegex = /^[^\s@]+@gmail\.com$/;
        if (!emailRegex.test(email)) return "Please enter a valid Gmail address";
        return "";
    };

    // Fetch Artwork Data
    useEffect(() => {
        const fetchHandler = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/art/${id}`);
                if (response.data && response.data.success) {
                    setInputs(response.data.data);
                    // Set existing image URL as preview
                    setImagePreview(response.data.data.image);
                } else {
                    setGlobalError("Failed to load artwork data");
                }
            } catch (err) {
                setGlobalError("Error fetching artwork");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHandler();
    }, [id]);

    // Image Upload Function
    const uploadImage = async () => {
        if (!image) return inputs.image; // Return existing image URL if no new image
        
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
            
            return response.data?.result?.secure_url || inputs.image;
        } catch (error) {
            console.error("Error uploading image:", error);
            setGlobalError("Image upload failed. Using existing image.");
            return inputs.image;
        }
    };

    // Send Update Request
    const sendRequest = async () => {
        try {
            // Upload image first (or use existing)
            const imageUrl = await uploadImage();

            const response = await axios.put(`http://localhost:5000/art/${id}`, {
                artType: String(inputs.artType),
                description: String(inputs.description),
                price: Number(inputs.price),
                artistName: String(inputs.artistName),
                gmail: String(inputs.gmail),
                image: imageUrl, // Include updated or existing image URL
            });
            return response.data;
        } catch (error) {
            console.error("Error updating artwork:", error);
            throw error;
        }
    };

    // Handle Input Changes with Validation
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Update inputs
        setInputs((prevState) => ({
            ...prevState,
            [name]: name === "price" 
                ? value.replace(/[^0-9]/g, "") 
                : value
        }));

        // Validate and set errors
        let errorMessage = "";
        switch(name) {
            case "artType":
                errorMessage = validateArtType(value);
                break;
            case "description":
                errorMessage = validateDescription(value);
                break;
            case "price":
                errorMessage = validatePrice(value);
                break;
            case "artistName":
                errorMessage = validateArtistName(value);
                break;
            case "gmail":
                errorMessage = validateEmail(value);
                break;
            default:
                errorMessage = "";
        }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: errorMessage
        }));
    };

    // Handle Image Change
    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        
        if (selectedFile) {
            // Validate file type and size
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            let imageError = "";
            if (!allowedTypes.includes(selectedFile.type)) {
                imageError = "Invalid file type. Allowed: JPEG, PNG, GIF, WEBP";
            } else if (selectedFile.size > maxSize) {
                imageError = "File is too large. Maximum size is 5MB";
            }

            // Update image errors
            setErrors((prevErrors) => ({
                ...prevErrors,
                image: imageError
            }));

            if (!imageError) {
                setImage(selectedFile);
                
                // Create image preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(selectedFile);
            }
        }
    };

    // Handle Image Delete
    const handleImageDelete = () => {
        setImage(null);
        setImagePreview(inputs.image || null); // Revert to original image
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        // Clear image error
        setErrors((prevErrors) => ({
            ...prevErrors,
            image: "Please select an image"
        }));
    };

    // Handle Form Submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setGlobalError(null);

        // Validate all fields
        const newErrors = {
            artType: validateArtType(inputs.artType),
            description: validateDescription(inputs.description),
            price: validatePrice(inputs.price),
            artistName: validateArtistName(inputs.artistName),
            gmail: validateEmail(inputs.gmail),
            image: !image && !inputs.image ? "Please select an image" : ""
        };

        // Check if there are any errors
        const hasErrors = Object.values(newErrors).some(error => error !== "");
        
        // Set all errors
        setErrors(newErrors);

        // If there are errors, stop submission
        if (hasErrors) {
            setGlobalError("Please correct the errors before submitting.");
            return;
        }

        setLoading(true);
        sendRequest()
            .then(() => {
                alert("Art Updated successfully!");
                navigate('/mainart');
            })
            .catch(err => {
                setGlobalError("Error updating artwork: " + (err.response?.data?.message || err.message || "Unknown error"));
            })
            .finally(() => {
                setLoading(false);
            });
    };

    if (loading) return <div className="loading">Loading artwork data...</div>;

    return (
        <div>
            <Nav />
            <div className="form-container">
                <h2>Update Art</h2>
                
                {globalError && <div className="global-error-message">{globalError}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Art Type:</label>
                        <select 
                            name="artType" 
                            value={inputs.artType || ""} 
                            onChange={handleChange} 
                            className={`form-select ${errors.artType ? 'error' : ''}`}
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
                        {errors.artType && <span className="error-text">{errors.artType}</span>}
                    </div>

                    <div className="form-group">
                        <label>Description:</label>
                        <textarea
                            name="description"
                            value={inputs.description || ""}
                            onChange={handleChange}
                            className={`form-textarea ${errors.description ? 'error' : ''}`}
                        ></textarea>
                        {errors.description && <span className="error-text">{errors.description}</span>}
                    </div>

                    <div className="form-group">
                        <label>Price:</label>
                        <div className="price-input">
                            <span className="currency">Rs. </span>
                            <input
                                type="text"
                                name="price"
                                value={inputs.price || ""}
                                onChange={handleChange}
                                placeholder="Enter price"
                                className={`form-input ${errors.price ? 'error' : ''}`}
                            />
                            <span className="decimal">.00</span>
                        </div>
                        {errors.price && <span className="error-text">{errors.price}</span>}
                    </div>

                    <div className="form-group">
                        <label>Artist Name:</label>
                        <input
                            type="text"
                            name="artistName"
                            value={inputs.artistName || ""}
                            onChange={handleChange}
                            className={`form-input ${errors.artistName ? 'error' : ''}`}
                        />
                        {errors.artistName && <span className="error-text">{errors.artistName}</span>}
                    </div>

                    <div className="form-group">
                        <label>Gmail:</label>
                        <input
                            type="email"
                            name="gmail"
                            value={inputs.gmail || ""}
                            onChange={handleChange}
                            className={`form-input ${errors.gmail ? 'error' : ''}`}
                        />
                        {errors.gmail && <span className="error-text">{errors.gmail}</span>}
                    </div>

                    <div className="form-group">
                        <label>Update Image:</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="form-file-input"
                        />
                        
                        {imagePreview && (
                            <div className="image-preview-container">
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="image-preview" 
                                />
                                {image && (
                                    <button 
                                        type="button" 
                                        onClick={handleImageDelete} 
                                        className="delete-image-btn"
                                    >
                                        Delete New Image
                                    </button>
                                )}
                            </div>
                        )}
                        {errors.image && <span className="error-text">{errors.image}</span>}
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Update Artwork"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UpdateArt;