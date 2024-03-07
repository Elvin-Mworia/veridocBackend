const { EID,wrapFileOrFolder }=require('ardrive-core-js');
const {setupArdrive}=require("../ardrive/ardrive.js")
const express=require("express");
const router=express.Router();
const {getUser,getStation,returnWalletAddress,checkRole,addCase,getCases,getFolder,approval}=require("../weaveDb/weaveDB.js")
const {upload}=require("./uploadFile.js");
const path=require("path");
const { setTimeout }=require("timers/promises");
const {deleteFile}=require("./delete.js")
const { v4: uuid } = require('uuid');

//adding a case
router.post("/add",async(req,res)=>{
    let walletAddress=req.body.walletAddress;
    let station=req.body.station;
    let applicant=[req.body.applicant];
    let respodent=[req.body.respodent];
    let caseId=uuid();
    let arDrive=setupArdrive();
   
    try{
      const folder=await getFolder(station);
      if(folder.length==0){
        return res.status(404).json({message:"Enter a valid court station"})
      }
      let stationInfo=await getStation(station);
      const stationId=stationInfo[0].stationId;
      const destFolderId= EID(folder[0].Id)
      const filePath = path.join(__dirname,'files',walletAddress.concat(".epub"));
    
       // Wrap file for upload
      const wrappedEntity = wrapFileOrFolder(filePath);   

// Upload a public file to destination folder
// const uploadFileResult = await arDrive.uploadAllEntities({
//     entitiesToUpload: [{ wrappedEntity, destFolderId }],
//     customMeteData:{
//     metaDataJson: { ['caseId']:caseId ,['walletAddress']:walletAddress,['station']:station,['applicant']:applicant,['respodent']:respodent },
//     metaDataGqlTags: {['caseId']: [caseId],['walletAddress']: [walletAddress],['station']: [station],['applicant']:[applicant], ['respodent']: [respodent]}
// }
// });
//console.log(uploadFileResult);
        let txId=uuid()
        let metadata=[caseId,walletAddress,station,applicant,respodent];
        let date=String(Date.now());
        await addCase(caseId,txId,walletAddress,metadata,applicant,respodent,date,stationId);
        const uploadedCase=await getCases("caseId",caseId);
        if (uploadedCase.length==0){
            return res.status(400).json({message:`Case for the walletaddress:${walletAddress} with caseId:${caseId} was not recorded in the cases schema`})
        }

        await setTimeout(2000);
        deleteFile(filePath);
        return res.status(200).json({ message: "run successfully" });
        
    }
    catch (error) {
        console.log("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

router.post("/approval",async (req,res)=>{
let caseId=req.body.caseId;
let status=req.body.status

try{
   let caseFile=await getCases("caseId",caseId);
   if(caseFile.length==0){
    return res.status(400).json({message:`No file with the id ${caseId}`})
   }

   await approval(status,caseId);
   caseFile=await getCases("caseId",caseId);
   if(caseFile[0].status!==status){
    return res.status(400).json({message:"Failed to update the status of the case"});
   }
   
   return res.status(200).json({ message: `status of file with case id ${caseId}  updated` });
}catch(error){
    console.log("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
}
})

//get pending files associated with a station
router.get("/getpendingfiles",async (req,res)=>{
    const station=req.body.station;
    const walletAddress=req.body.walletAddress;

    try{
    
      let stationInfo=await getStation(station);
      if(stationInfo.length==0){
        return res.status(400).json({message:`No court  station with name ${station}`})
      }
      let walletAddresses=await returnWalletAddress(stationInfo[0].stationId)
      if (!walletAddresses[0].walletAddresses.includes(walletAddress)) {
        return res.status(401).json({message:"Not authorized"})
      }
      console.log(stationInfo[0].stationId);
      casesOfStation=await getCases("stationId",stationInfo[0].stationId)
      if(casesOfStation.length==0){
        return res.status(200).json({messages:"Station has no cases"})
      }
      //filter out the ones that have status as pending
      let pendingFiles=casesOfStation.filter((file)=>file.status==="pending")
      console.log(pendingFiles);
      if(pendingFiles.length==0){
        return res.status(200).json({message:'There are currently no pending cases'})
      }
      return  res.status(200).json({message:pendingFiles});
    }catch(error){
        console.log("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

module.exports=router;