const mongoose = require('mongoose');
// const validator = require('email-validator');

const authorSchema = new mongoose.Schema({
    fname : {
        type : String,
        required : true
    },
    lname : {
        type : String,
        required : true
    },
    title : {
        type : String,
        enum : ['Mr', 'Mrs', 'Miss'],
        required : true
    },
    email : {
        type : String,
        trim : true,
        unique: true,
        required : true,
        lowercase : true,
        match : [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password : {
        type : String,
        required : true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Author', authorSchema);