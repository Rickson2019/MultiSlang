const mongoose = require('mongoose');

//Admin Schema IS THE USER SCHEMA FOR AN ADMINISTRATOR.
const AdminSchema = mongoose.Schema({
    //for login purposes
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    //user info (optional)
    firstname: String,
    lastname: String,
    phoneno: String,

});