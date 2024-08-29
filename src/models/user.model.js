import { Schema, model } from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const UserSchema = new Schema({
    userName: {
        type: String,
        required: [true, 'Username is required'], // Custom error message
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [10, 'Username cannot exceed 10 characters'], // Correcting 'maxCount' to 'maxlength'
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9]+$/.test(v); // Only allow alphanumeric characters
            },
            message: props => `${props.value} is not a valid username!`
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'], // Custom error message
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/.test(v); // Simple email regex
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'], // Custom error message
        index: true,
        trim: true,
    },
    avatar: {
        type: String, // cloudinary URL
        required: [true, 'Avatar URL is required'] // Custom error message
    },
    coverImage: {
        type: String, // cloudinary URL
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required'], // Custom error message
        minlength: [6, 'Password must be at least 6 characters long'],
        validate: {
            validator: function (v) {
                return /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(v); // Must contain at least one digit, one lowercase, and one uppercase letter
            },
            message: props => 'Password must contain at least one number, one lowercase and one uppercase letter'
        }
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) return next();

        // Hash the password using bcrypt with a salt factor of 10
        this.password = await bcrypt.hash(this.password, 10);

        next();
    } catch (err) {
        next(err);
    }
});

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = model('User', UserSchema);

export default User;
