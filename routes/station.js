const express=require("express");
const router=express.Router();
const {addStation,getStation,addRegistry,getAllDocs}=require("../weaveDb/weaveDB.js")

router.post("/addStation",async (req,res,next)=>{
    let name=req.body.name;

    try{
        let station=await getStation("name",name);
        if(station.length>0){
            return  res.status(400).json({message:"Court station exists"});
        }
        await addStation(name);
        let newStation=await getStation("name",name)
        if (newStation.length===0){
          return res.status(400).json({message:`Court station with  the ${name} was not added `})
        }
        await addRegistry(newStation[0].stationId);
    return res.status(200).json({message:`Successfully added the ${name} station`}); 
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
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
//get all folders
router.get("/getAllStationFolders",async (req,res)=>{
    
    try{
       let folders=await getAllDocs("Folders");
       if(folders.length==0){
          return res.status(400).json({message:"No folders",folders}) 
       }
       return res.status(200).json({message:"successfuly fetched folders",folders});
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

module.exports=router