import mongoose, { Schema } from "mongoose";
import { Color, OrderStatus, Size } from "../../types";
import { AddressSchema } from "./User";


const OrderItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    color: {
        type: String,
        enum: Object.values(Color),
        required: true
    },
    quantity: {
        type: Number,
        required: true,
    },
    size: {
        type: String,
        enum: Object.values(Size),
        required: true
    },
    unitPrice: {
        type: Number,
        required: true,
    },
},

    {
        _id: false
    }
)

const RefundSchema = new Schema({
    refundId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    createdAd: {
        type: Date,
        default: Date.now
    },
},

    {
        _id: false
    }
)

const CustomerSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
},
    {
        _id: false
    }

)

const OrderSchema = new Schema({
    orderNumber: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    customer: {
        type: CustomerSchema,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        required: true,
        default: OrderStatus.CREATED
    },
    currency: {
        type: String,
        required: true,
        default: 'AUD'
    },
    subTotal: {
        type: Number,
        required: true,
    },
    stripePaymentIntentId: String,
    stripePaymentId: String,
    // stripeCustomerId: String,
    tax: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    items: {
        type: [OrderItemSchema],
        required: true,
    },
    refunds: {
        type: [RefundSchema],
        default: []
    },
    shippingAddress: {
        type: AddressSchema,
        required: true,
    },
    billingAddress: {
        type: String,
    },
},
    { timestamps: true }
)

const Order = mongoose.model('Order', OrderSchema)
export default Order