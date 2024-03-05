const WeaveDB=require("weavedb-sdk-node");
const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const contractTxId="eVGWyVFzjCNSJB9n6_Oj4fWhWlQQfe2whCtjL6iAZro";
const walletFilePath = path.join(__dirname,'/wallet.json');

//reading wallet
let wallet=JSON.parse(fs.readFileSync(walletFilePath).toString())

const db = new WeaveDB({ contractTxId: contractTxId });

async function setupWeaveDB() {
    await db.init(); // Initialize the database
    // Setting the wallet as the default signer for write calls
    db.setDefaultWallet(wallet, "ar");
}
setupWeaveDB();

// Validating if the name of a folder is in the collection
async function getFolder(name) {
    let result = await db.get("Folders", ["name"], ["name", "==", name]);
    return result;
}

//add a folder
async function addFolder(id,name,stationId,parentId,){
    let result=db.set({Id:id,name:name,stationId:stationId,parentId:parentId},"Folders",stationId)
    return result;
}

//add court station
async function addStation(name){ 
      let stationId=uuid();
      let result = await db.set({stationId:stationId,name:name},"station",stationId);
      return result;
   }

//add a registry
async function addRegistry(stationId){
    let result = await db.set({stationId:stationId,walletAddresses:[]},"registry",stationId);
    return result;
}
 
//add a user to user schema
async function addUser(name,walletAddress,email,role,phone){
   let result=await db.set({name:name,walletAddress:walletAddress,email:email,role:role,phone:phone},"users",walletAddress);
    return result;
}

//add user to admin schema
async function addAdmin(name,walletAddress){
    let result=await db.set({name:name,walletAddress:walletAddress},"admins",walletAddress);
    return result;
}

//modify the role of a staff to an admin
async function addRole(walletAddress){
    let result= await db.update({role:"admin"},"staff",walletAddress);
    return result;
}

//check role
async function checkRole(walletAddress){
    let result=await db.get("users", ["walletAddress"], ["walletAddress", "==", walletAddress]);
    return result;
}

//remove admin from the admin schema
async function removeAdmin(walletAddress){
  let result=await db.delete("admins",walletAddress)

}

//get cases by station id from the cases schema
async function getCases(stationId){
    let result= await db.get("cases", ["stationId"], ["stationId", "==", stationId]);
    return result;
}

//get User by their wallet address,schema can be admin,staff or users
async function getUser(walletAddress,schema){
    let result= await db.get(schema, ["walletAddress"], ["walletAddress", "==", walletAddress]);
    return result;
}

//add wallet address to the list of addresses belonging to a station in the registry schema
async function addWalletAddress(stationId,walletAddress){
    let result=await db.update({walletAddresses:[...walletAddress]},"registry",stationId)

}

//add staff to the staff schema
async function addStaff(name,walletAddress,email,stationId,role){
    let result=await db.set({name:name,walletAddress:walletAddress,email:email,role:role,stationId:stationId},"staff",walletAddress);
    return result;
}

//check wallet address if is included in the list wallet address for a station
async function returnWalletAddress(stationId){
  let result= await db.get("registry", ["stationId"], ["stationId", "==", stationId]);
    return result;
}

//add a case to the case schema
async function addCase(txId,walletAddress,applicant,respodent,stationId){
  
    let result=await db.set({caseId:uuid(),txId:txId,txOrigin:walletAddress,applicant:applicant,date:db.ts(),status:"pending",respodent:respodent,stationId:stationId},"cases",caseId)
    return result;
}

//approve or reject a case filling due missing details or wrong fomart
async function approval(status,caseId){
    let result=await db.update({status:status},"cases",caseId);
    return result;
}

//check a station in the station schema
async function getStation(name){
    let result = await db.get("station", ["name"], ["name", "==", name]);
    return result;
}

module.exports={getFolder,addStation,addFolder,addStation,addRegistry,addUser,addAdmin,addRole,checkRole,removeAdmin,getCases,getUser,addWalletAddress,addStaff,returnWalletAddress,addCase,approval,getStation};