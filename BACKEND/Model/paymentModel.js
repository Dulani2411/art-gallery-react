import mongoose from "mongoose";
const { Schema } = mongoose;

const paymentSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    address: {
        type: String,
        required: [true, "Address is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true
    },
    contactNumber: {
        type: String,
        required: [true, "Contact number is required"]
    },
    image: {
        type: String,
        required: [true, "Image URL is required"],
        trim: true
    }, // Store Cloudinary image URL
    artworks: [{
        artworkId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Art',
            required: true
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        }
    }],
    totalAmount: {
        type: Number,
        required: [true, "Total amount is required"]
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Export model
const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;