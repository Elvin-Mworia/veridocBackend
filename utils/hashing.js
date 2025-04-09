const express=require("express");
const router=express.Router();
const  User=require("../model/user.js");
const bcrypt = require('bcryptjs');
// Middleware to hash password before saving
function hashingPassword(req,res,next){
    // Hash the password with cost of 12
    console.log(req.body.password)
    bcrypt.hash(req.body.password, 12, function(err, hash) {
        if (err) {
            return res.status(500).json({ message: "Internal server error" });
        }
        console.log(hash);
        req.body.password = hash;
        next();
    });
}
module.exports=hashingPassword;