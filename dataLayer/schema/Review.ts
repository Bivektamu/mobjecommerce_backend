import { timeStamp } from "console";
import mongoose, { Schema } from "mongoose";

const ReviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    rating: {
      type: Number,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Review = mongoose.model("Review", ReviewSchema);
export default Review;
