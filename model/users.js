import { Schema, model } from "mongoose"

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified:{
        type: Boolean,
        default: false,
    },
    OTP:{
        type:Number,
        default:null,
    }
});

export const userModel = new model("user",userSchema,"users_app");