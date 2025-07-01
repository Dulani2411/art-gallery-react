import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Nav from "../Nav/Nav";
import "./Payment.css";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  // Use location.state.cart if available or an empty array
  const [cart] = useState(location.state?.cart || []);
  const [totalAmount, setTotalAmount] = useState(0);
  const [inputs, setInputs] = useState({
    name: "",
    address: "",
    email: "",
    contactNumber: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate total amount when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setTotalAmount(total);
    } else {
      // Redirect if cart is empty
      navigate("/");
    }
  }, [cart, navigate]);

  // Updated handleChange function with improved phone validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "contactNumber") {
      // Only allow numbers for contact number
      const numericValue = value.replace(/[^0-9]/g, "");
      
      // Ensure it starts with '07' if user is typing characters
      if (numericValue.length >= 1 && !numericValue.startsWith('07')) {
        if (numericValue.startsWith('7')) {
          // If they type '7', automatically add the '0' prefix
          setInputs((prev) => ({ ...prev, [name]: '0' + numericValue }));
        } else if (numericValue.length === 1) {
          // If first digit isn't 0, replace with '07'
          setInputs((prev) => ({ ...prev, [name]: '07' }));
        } else {
          // For other cases, ensure '07' prefix remains
          setInputs((prev) => ({ ...prev, [name]: '07' + numericValue.substring(2) }));
        }
      } else {
        // Normal case - just update with numeric value
        setInputs((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      // For all other fields, including email, just update with the value as is
      setInputs((prev) => ({ ...prev, [name]: value }));
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
      console.log("Uploading image...");
      const response = await axios.post(
        "http://localhost:5000/payment/upload-image", // URL matches the backend route
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Upload response:", response.data);
      if (response.data?.success && response.data.result) {
        console.log(
          "Image uploaded successfully:",
          response.data.result.secure_url
        );
        return response.data.result.secure_url;
      } else {
        console.error("Upload response missing expected data:", response.data);
        throw new Error("Payment proof image upload failed");
      }
    } catch (err) {
      console.error("Error uploading payment proof:", err);
      throw err;
    }
  }
  const validateData = () => {
    if (!cart || cart.length === 0) {
      throw new Error("Your cart is empty. Please add items before checkout.");
    }
    if (
      !inputs.name ||
      !inputs.address ||
      !inputs.email ||
      !inputs.contactNumber
    ) {
      throw new Error("All fields are required!");
    }
    if (!image) {
      throw new Error("Please upload payment proof!");
    }
    return true;
  };

  const sendRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      // Validate form data
      validateData();

      // Upload the payment proof image to get the URL
      console.log("Starting image upload...");
      const imageUrl = await uploadImage();
      if (!imageUrl) {
        setError("Payment proof image upload failed. Please try again.");
        setLoading(false);
        return;
      }

      // Format cart items for backend; use the appropriate ID field
      console.log("Original cart:", cart);
      const artworks = cart.map((item) => {
        const artworkId = item._id || item.id;
        console.log(`Processing cart item with ID: ${artworkId}`);
        if (!artworkId) {
          console.error("Invalid item without ID:", item);
          throw new Error(
            "Some items in your cart are invalid. Please try again."
          );
        }
        return {
          artworkId,
          quantity: item.quantity || 1,
        };
      });
      console.log("Formatted artworks:", artworks);

      // Create payment data
      const paymentData = {
        name: inputs.name,
        address: inputs.address,
        email: inputs.email,
        contactNumber: inputs.contactNumber,
        image: imageUrl,
        artworks: artworks,
        totalAmount: totalAmount,
      };
      console.log("Payment data to send:", paymentData);

      // Send payment data to backend
      console.log("Sending payment data to API...");
      const response = await axios.post(
        "http://localhost:5000/payment",
        paymentData
      );
      console.log("Payment API response:", response.data);

      if (response.data && response.data.success) {
        alert("Payment submitted successfully!");
        // Clear cart from localStorage (if used)
        localStorage.removeItem("cart");
        // Wrap navigation in a timeout to avoid React Router transition glitches
        setTimeout(() => {
          navigate("/payment-confirmation", {
            state: {
              paymentId: response.data.data._id,
              totalAmount: totalAmount,
            },
          });
        }, 50);
      } else {
        throw new Error("Failed to process payment. Please try again.");
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error processing payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(inputs.email)) {
      setError("Please enter a valid email address!");
      return;
    }
    
    // Contact number validation
    if (inputs.contactNumber.length !== 10) {
      setError("Phone number must be exactly 10 digits!");
      return;
    }
    
    if (!inputs.contactNumber.startsWith('07')) {
      setError("Phone number must start with '07'!");
      return;
    }
    
    // If validations pass, send the request
    sendRequest();
  };

  return (
    <>
      <Nav />
      <div className="payment-container">
        <h2>Payment Process</h2>
        <div className="order-summary">
          <h3>Order Summary</h3>
          <ul className="cart-items">
            {cart.map((item, index) => (
              <li key={index} className="cart-item">
                <div className="cart-item-image">
                  <img
                    src={item.image}
                    alt={item.artType || item.title}
                  />
                </div>
                <div className="cart-item-details">
                  <h4>{item.artType || item.title}</h4>
                  <p>Artist: {item.artistName}</p>
                  <p>Price: Rs. {item.price}.00</p>
                  <p>Quantity: {item.quantity || 1}</p>
                  <p className="item-total">
                    Item Total: Rs. {item.price * (item.quantity || 1)}.00
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="total-amount">
            <h3>Total Amount: Rs. {totalAmount}.00</h3>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              name="name"
              value={inputs.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>Shipping Address:</label>
            <textarea
              name="address"
              value={inputs.address}
              onChange={handleChange}
              className="form-textarea"
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="text"
              name="email"
              value={inputs.email}
              onChange={handleChange}
              className="form-input"
              placeholder="example@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Contact Number:</label>
            <input
              type="text"
              name="contactNumber"
              value={inputs.contactNumber}
              onChange={handleChange}
              className="form-input"
              required
              maxLength={10}
              placeholder="07XXXXXXXX"
            />
            <small className="form-hint">Must be 10 digits starting with 07</small>
          </div>
          <div className="payment-info">
            <h3>Payment Information</h3>
            <p>Please make a bank transfer to:</p>
            <div className="bank-details">
              <p>Bank: Art Gallery Bank</p>
              <p>Account Number: 1234567890</p>
              <p>IFSC Code: ARTG0001234</p>
              <p>Account Name: Art Gallery</p>
            </div>
          </div>
          <div className="form-group">
            <label>Upload Payment Proof:</label>
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
                  alt="Payment Proof Preview"
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
            {loading ? "Processing..." : "Confirm Payment"}
          </button>
        </form>
      </div>
    </>
  );
}

export default Payment;