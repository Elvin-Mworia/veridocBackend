const express=require("express");
const router=express.Router();
const  User=require("../model/user.js");
const bcrypt = require('bcryptjs');
// Middleware to hash password before saving
function hashingPassword(req,res,next){
    if(req.body.password.trim()<=0){
        return res.status(400).json({ message: "Password is required" });
    }
    // Hash the password with cost of 12
    bcrypt.hash(req.body.password.trim(), 12, function(err, hash) {
        if (err) {
            return res.status(500).json({ message: "Internal server error" });
        }
        req.body.password = hash;
        next();
    });
}
module.exports=hashingPassword;