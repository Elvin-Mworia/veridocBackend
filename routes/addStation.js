const express=require("express");
const router=express.Router();
const {addStation}=require("../weaveDb/weaveDB.js")

router.post("/",async (req,res,next)=>{
 let name=req.body.name;
 let data;
 addStation(name).then((result)=>{
    data=result;
 }).then(()=>{
    if (!data){
        res.status(400).json({message:"the record was not returned"});
    }
    res.status(200).json(data);
    next();
}).catch(err=>{
    console.error(err);
})
    next()
})

module.exports=router