const express=require("express");
const router=express.Router();
const {setupArdrive}=require("../ardrive/ardrive.js");
const {addFolder,getStation, getFolder}=require("../weaveDb/weaveDB.js")
const {  EID } =require('ardrive-core-js');

//takes in name parameter from the req
router.post("/addFolder",async (req,res)=>{
  let name=req.body.name;
  let parentId=process.env.PARENTFOLDERID;
  let arDrive=setupArdrive();
  console.log(parentId);
  console.log(name);
  try {
    const station= await getStation("name",name);
      if(!station.length){
        return res.status(400).json({message:"You can not add a folder which is not a court station"})
        }
        const createDriveResult = await arDrive.createPublicFolder({folderName: name,
        parentFolderId:EID(parentId)});
        // console.log(createDriveResult)
        let entityId=createDriveResult.created[0].entityId.entityId
       await addFolder(entityId,station[0].name,station[0].stationId,parentId);
       const result= await getFolder(name);
            if(result.length==0){
            return res.status(400).json({message:"folder was not created"})
              }
       return  res.status(200).json({message:"folder created successfully"})
  }catch (error) {
    console.log("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
}
  })

  
module.exports=router