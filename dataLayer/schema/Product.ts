import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  sku: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  stockStatus: {
    type: Boolean,
    required: true,
  },
  featured: {
    type: Boolean,
    required: true,
  },

  sizes: {
    type: [String],
    enum: ["S", "M", "L", "XL"],
    required: true,
  },
  colors: {
    type: [String],
    enum: ["BLACK", "RED", "GRAY", "WHITE", "AMBER"],
    required: true,
  },
  imgs: [
    {
      url: {
        type: String,
        required: true,
      },
    },
  ],
});

const Product = mongoose.model("Product", ProductSchema);
export default Product;
