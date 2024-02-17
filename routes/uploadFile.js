const express=require("express");
const router=express.Router();
const {arDrive}=require("../ardrive/ardrive");
const {getFolder}=require("../weaveDb/weaveDB.js")


//check if the folder exists in the database first
router.get("/folderId",async (req,res,next)=>{
    let folderId=req.body.Id;
    let data;
    getFolder(folderId).then(result=>{
       data=result;
     }).then(()=>{
        if (!data){
            res.status(400).json({message:"no folder with the id was found"});
        }
        res.status(200).json(data[0]);
        next();
    }).catch(err=>{
        console.error(err);
    })
      
})

module.exports=router;