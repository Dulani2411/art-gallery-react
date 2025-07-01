import mongoose from "mongoose";
const { Schema } = mongoose;

const artSchema = new Schema({
    artType: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    artistName: { 
        type: String, 
        required: true 
    },
    gmail: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String, 
        required: [true, "Image URL is required"], 
        trim: true
    },
    // New fields for trending feature
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { 
    timestamps: true
});

// Export model
const Art = mongoose.model("Art", artSchema);
export default Art;