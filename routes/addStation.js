const express=require("express");
const router=express.Router();
const {addStation,getStation,addRegistry}=require("../weaveDb/weaveDB.js")

router.post("/",async (req,res,next)=>{
    let name=req.body.name;
    getStation(name).then(result=>{
       console.log(result);
       if(!result.length){
           addStation(name).then((result)=>{
               getStation(name).then(result=>{
                console.log(result[0].stationId)
                addRegistry(result[0].stationId);
                res.status(200).json({message:`Successfully added the ${name} station`});
               }).catch(err=>{
                console.error(err)});
            }).catch(err=>{
               console.error(err);
           })
       }else{
        res.status(400).json({message:"Court station exists"});
       }  
    })
       next()
   })

module.exports=router