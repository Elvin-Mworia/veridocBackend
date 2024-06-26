const { EID,wrapFileOrFolder }=require('ardrive-core-js');
const {setupArdrive}=require("../ardrive/ardrive.js")
const express=require("express");
const router=express.Router();
const {getUser,getStation,returnWalletAddress,checkRole,addCase,getCases,getFolder,approval,subsequentUploads,getSubsequentFile,getFilename,removeFilename}=require("../weaveDb/weaveDB.js")
const {upload}=require("../utils/uploadFile.js");
const path=require("path");
const { setTimeout }=require("timers/promises");
const {deleteFile}=require("../utils/delete.js")
const { v4: uuid } = require('uuid');
const {postUpload}=require("../contracts/contractApi/postupload.js");
const {sendmail}=require("./api/mail.js")

function getYoungestObject(data) {
  // 1. Sort the array in ascending order by timestamp
  const sortedData = data.sort((a, b) => b.timestamp - a.timestamp);
  // 2. Return the first element (youngest based on ascending sort)
  return sortedData[0];
}

//adding a case
router.post("/add",async(req,res)=>{
    let applicantlist=[];
    let respodentlist=[];
    for (const applicant of req.body.applicant ){
      applicantlist.push(applicant.name)
    }
    for (const respodent of req.body.respodent ){
      respodentlist.push(respodent.name);
    }
    console.log({applicantlist,respodentlist})
    let walletAddress=req.body.walletAddress;
    let station=req.body.station;
    let applicant=applicantlist
    let respodent=respodentlist;
    let caseId=uuid();
    let arDrive=setupArdrive();
    console.log({walletAddress,station,applicant,respodent})
    try{
      const folder=await getFolder(station);
      if(folder.length==0){
        return res.status(404).json({message:"Enter a valid court station"})
      }
      let stationInfo=await getStation("name",station);
      const stationId=stationInfo[0].stationId;
      const destFolderId= EID(folder[0].Id)
      let file=await getFilename("walletAddress",walletAddress)
      let youngestObjectFileName;
      if(file.length>1){
        let youngestObject=getYoungestObject(file)
        youngestObjectFileName=youngestObject.fileName;
      }
      if(file.length===1){
        youngestObjectFileName=file[0].fileName
      }
      
      console.log(file[0].fileName)//fetches the name of the unique file
      let filePath = path.join(__dirname,'files',youngestObjectFileName.concat(".epub"));
      console.log(filePath)
  
// Wrap file for upload
const wrappedEntity = wrapFileOrFolder(filePath);   
// Upload a  file 
const uploadFileResult = await arDrive.uploadAllEntities({
    entitiesToUpload: [{ wrappedEntity, destFolderId }],
    customMetaData:{
    metaDataJson: { ['caseId']:caseId ,['walletAddress']:walletAddress,['station']:station,
    ['applicant']:applicant,['respodent']:respodent },
    metaDataGqlTags: {['caseId']: [caseId],['walletAddress']: [walletAddress],['station']:
     [station],['applicant']:[...applicant], ['respodent']: [...respodent],['Content-Type']:['application/epub+zip']}
}
});
console.log(uploadFileResult);
console.log("dataTxId:"+uploadFileResult.created[0].dataTxId.transactionId)
console.log("metadataTxId:"+uploadFileResult.created[0].metadataTxId.transactionId)
// console.log(uploadFileResult.created[0].metadataTxId)
let bundledIn=uploadFileResult.created[0].bundledIn.transactionId;
let txId=uploadFileResult.created[0].dataTxId.transactionId;
console.log("bundledIn:"+bundledIn);
await postUpload(walletAddress,bundledIn) //posting transanction details to smart contract


        // let txId=uploadFileResult.created[0].dataTxId.transactionId;
        let metadata=[caseId,walletAddress,station,applicant,respodent];
        let date=String(Date.now());
        await addCase(caseId,txId,walletAddress,metadata,applicant,respodent,date,station,stationId);
        const uploadedCase=await getCases("caseId",caseId);
        if (uploadedCase.length==0){
            return res.status(400).json({message:`Case for the walletaddress:${walletAddress} with caseId:${caseId} was not recorded in the cases schema`})
        }

        await setTimeout(2000);
        deleteFile(filePath);
      //  removeFilename(file[0].fileName);
        return res.status(200).json({ message: "run successfully" });
        
    }
    catch (error) {
        console.log("Error:", error);
       // removeFilename(file[0].fileName);
        return res.status(500).json({ message: "Internal server error" });
    }
})

//uploads a subsequent file
router.post("/uploadsubsequentfile",async(req,res)=>{
  let walletAddress=req.body.walletAddress;
  let station=req.body.station;
  let filetype=req.body.filetype;
  let caseId=req.body.caseId;
  let arDrive=setupArdrive();
console.log(station);
  try{
    const casefile=await getCases("caseId",caseId) 
    if(casefile.length==0){
      return res.status(400).json({messages:`No such case in the records with case id ${caseId}`})
    }
    const folder=await getFolder(station);
    console.log(folder)
    if(folder.length==0){
      return res.status(404).json({message:"Enter a valid court station"})
    }

    let stationInfo=await getStation("name",station);
    const stationId=stationInfo[0].stationId;
    const destFolderId= EID(folder[0].Id)
    let file=await getFilename("walletAddress",walletAddress)
    let youngestObjectFileName;
    if(file.length>1){
      let youngestObject=getYoungestObject(file)
      youngestObjectFileName=youngestObject.fileName;
    }
    if(file.length===1){
      youngestObjectFileName=file[0].fileName
    }
    
  //fetches the name of the unique file
    const filePath = path.join(__dirname,'files',youngestObjectFileName.concat(".epub"));

     // Wrap file for upload
    const wrappedEntity = wrapFileOrFolder(filePath);   

//Upload a public file to destination folder
const uploadFileResult = await arDrive.uploadAllEntities({
    entitiesToUpload: [{ wrappedEntity, destFolderId }],
    customMeteData:{
    metaDataJson: { ['caseId']:caseId ,['walletAddress']:walletAddress,['station']:station },
    metaDataGqlTags: {['caseId']: [caseId],['walletAddress']: [walletAddress],['Content-Type']:['application/epob+gzip']}
}
});
//console.log(uploadFileResult);
console.log(uploadFileResult.created[0].dataTxId.transactionId)
// console.log(uploadFileResult.created[0].metadataTxId)
let bundledIn=uploadFileResult.created[0].bundledIn.transactionId;
await postUpload(walletAddress,bundledIn) //posting transanction details to smart contract
    let txId=uploadFileResult.created[0].dataTxId.transactionId;
      let date=String(Date.now());
      let metadata=[casefile[0].walletAddress,date,txId,filetype,caseId];
      //console.log(caseId,txId,metadata,walletAddress,filetype,date,stationId);
      await subsequentUploads(caseId,txId,metadata,walletAddress,filetype,date,stationId);
      const uploadedCase=await getSubsequentFile("date",date);
      if (uploadedCase.length==0){
          return res.status(400).json({message:`Subsequent file for the with caseId:${caseId} was not recorded`})
      }

      await setTimeout(2000);
      deleteFile(filePath);
      return res.status(200).json({ message: "recorded successfully" });
      
  }
  catch (error) {
      console.log("Error:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
})

router.post("/approval",async (req,res)=>{
let caseId=req.body.caseId;
let status=req.body.status;
let feedback=req.body.feedback;
console.log({status,feedback});

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
   let user=await getUser(caseFile[0].walletAddress,"users")
   //console.log("user:"+user[0]);
   await sendmail(status,user[0].email);
   return res.status(200).json({ message: `status of file with case id ${caseId}  updated` });
}catch(error){
    console.log("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
}
})

//get pending files associated with a station
router.post("/getpendingfiles",async (req,res)=>{
    const station=req.body.station;
    const walletAddress=req.body.walletAddress;

    try{
    
      let stationInfo=await getStation("name",station);
      if(stationInfo.length==0){
        return res.status(400).json({message:`No court  station with name ${station}`})
      }
      let walletAddresses=await returnWalletAddress(stationInfo[0].stationId)
      if (!walletAddresses[0].walletAddresses.includes(walletAddress)) {
        return res.status(401).json({message:"Not authorized"})
      }
     // console.log(stationInfo[0].stationId);
      casesOfStation=await getCases("stationId",stationInfo[0].stationId)
      if(casesOfStation.length==0){
        return res.status(200).json({message:[]})
      }
      //filter out the ones that have status as pending
      let pendingFiles=casesOfStation.filter((file)=>file.status==="pending")
     // console.log(pendingFiles);
      if(pendingFiles.length==0){
        return res.status(200).json({message:[]})
      }
      return  res.status(200).json({message:pendingFiles});
    }catch(error){
        console.log("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

//cases belonging to a user
router.post("/casesForUser",async (req,res)=>{
let walletAddress=req.body.walletAddress;
try{
  let cases=await getCases("walletAddress",walletAddress)
  if(cases.length==0){
    return res.status(200).json({message:cases,case:'No cases filed'})
  }
  return  res.status(200).json({message:cases});
}catch(error){
    console.log("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
}
})

//getting a case
router.post("/getCase",async (req,res)=>{
  let caseId=req.body.caseId;
  console.log(caseId);
  try{
    let cases=await getCases("caseId",caseId)
    if(cases.length==0){
      return res.status(404).json({message:cases,case:'case not found'})
    }   
    console.log(cases[0]);
    return  res.status(200).json({message:cases[0]});
  }catch(error){
      console.log("Error:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
  })
  
  //get the subsequent files belonging to a case
  router.post("/getSubsequentFile",async (req,res)=>{
    let caseId=req.body.caseId;
    console.log(caseId);
    try{
      let cases=await getSubsequentFile("caseId",caseId)
      if(cases.length==0){
        return res.status(200).json({message:cases,case:'No subsequent cases uploaded'})
      }   
      console.log(cases);
      return  res.status(200).json({message:cases});
    }catch(error){
        console.log("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
    })

module.exports=router;