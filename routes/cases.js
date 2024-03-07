const { EID,wrapFileOrFolder }=require('ardrive-core-js');
const {setupArdrive}=require("../ardrive/ardrive.js")
const express=require("express");
const router=express.Router();
const {getUser,getStation,returnWalletAddress,checkRole,addCase,getCases,getFolder}=require("../weaveDb/weaveDB.js")
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
      const stationId=folder[0].stationId;
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

module.exports=router;