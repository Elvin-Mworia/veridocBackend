const express=require("express");
const router=express.Router();
const {getContractState}=require("../contracts/contractApi/postupload")
const _ = require("lodash");

router.get("/",async (req,res)=>{
    try{
let contractState=await getContractState();
return res.status(200).json({message:_.reverse(contractState.uploads)});
    }catch (error) {
        console.log("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

})

module.exports=router;