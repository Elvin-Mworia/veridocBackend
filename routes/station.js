const express=require("express");
const router=express.Router();
const {addStation,getStation,addRegistry}=require("../weaveDb/weaveDB.js")

router.post("/addStation",async (req,res,next)=>{
    let name=req.body.name;
    getStation("name",name).then(result=>{
       console.log(result);
       if(!result.length){
           addStation(name).then((result)=>{
               getStation(name,name).then(result=>{
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

router.post("/getStation",async (req,res)=>{
    let stationId=req.body.stationId;
    try{
       let station=await getStation("stationId",stationId);
       if(station.length==0){
          return res.status(400).json({message:"No such Station Id found."}) 
       }
       let name=station[0].name;
       return res.status(200).json({message:name});
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

module.exports=router