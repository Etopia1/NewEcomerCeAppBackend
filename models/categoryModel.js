const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  categoryDescription: {
    type: String,
    required: true,
  },
  categoryImage: {
    type: String,
    required: true,
  },
  products: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Product', // Assuming the product model is named "Product"
  },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
