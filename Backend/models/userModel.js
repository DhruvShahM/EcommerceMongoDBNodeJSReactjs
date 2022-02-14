const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail=require("../utils/sendEmail.js");
const catchAsyncError = require("../middleware/catchAsyncError.js");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter the name"],
        maxlength: [30, "Name cannot exceed 30 characters"],
        minlength: [4, "Name should have more than five characters"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, "Please enter a valid a email"]
    },
    password: {
        type: String,
        required: [true, "Please enter the password"],
        minlength: [8, "Passowrd should be greater than the 8 characters"],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
})

userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) {
        next();
    }


    this.password = await bcrypt.hash(this.password, 10);
})

// JWT Token
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}


// Compare password

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}


// Generating Reset password token

userSchema.methods.getResetPasswordToken = async function () {
    // Generating token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}



module.exports = mongoose.model("User", userSchema);