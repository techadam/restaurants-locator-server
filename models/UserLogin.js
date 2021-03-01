const mongoose = require('mongoose');

const userLoginSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    logged_out: {
        type: Date,
        required: true,
        default: Date.now,
    },
    logged_in_at: {
        type: Date,
        default: null,
    },
    ip_address: {
        type: String,
        required: true
    },
    token_id: {
        type: String,
        required: true
    },
    token_secret: {
        type: String,
        required: true
    },
    token_deleted: {
        type: Boolean,
        required: true,
        default: false
    },
    device: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model("UserLogin", userLoginSchema);