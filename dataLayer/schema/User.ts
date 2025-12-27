import mongoose, { Schema } from "mongoose";
import { User } from "../../types";

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
        unique:true,
    },

    password: {
        type: String,
        required: function(this:User) {return !this.googleId},
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
        street: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        postcode: {
            type: String,
        },
        country: {
            type: String,
        },
    },
    refreshToken: {
        type: String
    }

})

const User = mongoose.model('User', UserSchema)
export default User