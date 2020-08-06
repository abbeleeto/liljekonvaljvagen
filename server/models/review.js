const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    postId: {
        type: String,
        required: true
    },
    ownerId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    titlePost: {
        type: String,
        required: true
    },
    review: {
        type: String,
        required: true,
        maxlength: 500
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    }
}, {timestamps: true});

const Review = mongoose.model('Review', reviewSchema);

module.exports = {Review};