import mongoose, { Schema } from "mongoose";
import { User } from "../../types";

export const AddressSchema = new Schema({
    label: {
        type: String,
        required: true,
        default: 'home'
    },
    street: {
        type: String,
        required: true,
    },
    building: {
        type: String
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    postcode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    setAsDefault: {
        type: Boolean,
        required: true,
        default: false
    }
},
)

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: function (this: User) { return !this.googleId },
    },
    googleId: {
        type: String,
        required: false,
        unique: true
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'customer']

    },
    registeredDate: {
        type: Date,
        default: Date.now
    },
    address: {
        type: [AddressSchema]
    },
    refreshToken: {
        type: String
    }

})

const User = mongoose.model('User', UserSchema)
export default User