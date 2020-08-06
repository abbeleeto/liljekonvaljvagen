const mongoose = require("mongoose");

const articleSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  ownerUsername: {
    type: String,
    required: true,
    trim: true,
  },
  review: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
  ownerId: {
    type: String,
    required: true,
  },
}, {
    timestamps: true
});

const Article = mongoose.model('Article', articleSchema);

module.exports = {Article};