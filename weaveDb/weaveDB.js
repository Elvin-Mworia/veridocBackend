const WeaveDB=require("weavedb-sdk-node");
const fs = require('fs');
const path = require('path');
const {readJWKFile}=require("ardrive-core-js");
const { v4: uuid } = require('uuid');

const contractTxId="eVGWyVFzjCNSJB9n6_Oj4fWhWlQQfe2whCtjL6iAZro";
const walletFilePath = path.join(__dirname,'/wallet.json');

//reading wallet
const wallet = readJWKFile(walletFilePath);
let db;

async function setupWeaveDB() {
   db = new WeaveDB({ contractTxId: contractTxId });
    await db.init(); // Initialize the database
    // Setting the wallet as the default signer for write calls
    db.setDefaultWallet(wallet.jwk, "ar");
}
//check db setup
async function checkDb(){
    if (!db) {
        await setupWeaveDB(); // Ensure the database is initialized
    }
}

// Validating if the Id of a folder is in the collection
async function getFolder(id) {
    checkDb();
    let result = await db.get("Folders", ["Id"], ["Id", "==", id]);
    return result;
}

//add a folder
async function addFolder(id,name,stationId,parentId,){
    checkDb();
    let result=db.add({Id:id,name:name,stationId:stationId,parentId:parentId},"Folders")
    return result;
}

//add court station
async function addStation(name,stationId){
    checkDb();
    let result = await db.set({stationId:stationId,name:name},"station",stationId);

    return result;
 }

//add a registry
async function addRegistry(stationId){
    checkDb();
    let result = await db.set({stationId:stationId,walletAddress:[""]},"station",stationId);
    return result;
 }
 
//add a user to user schema
async function addUser(name,walletAddress,email,role,phone){
    checkDb();
    let result=await db.set({name:name,walletAddress:walletAddress,email:email,role:role,phone:phone},"users",walletAddress);
    return result;
}

//add user to admin schema
async function addAdmin(name,walletAddress){
    checkDb();
    let result=await db.set({name:name,walletAddress:walletAddress},"admins",walletAddress);
    return result;
}

//modify the role of a staff to an admin
async function addRole(walletAddress){
    checkDb();
    let result= await db.update({role:"admin"},"staff",walletAddress);
    return result;
}

//check role
async function checkRole(walletAddress){
    checkDb();
    let result=await db.get("users", ["walletAddress"], ["walletAddress", "==", walletAddress]);
    return result;
}

//remove admin from the admin schema
async function removeAdmin(walletAddress){
    checkDb();
    let result=await db.delete("admins",walletAddress)

}

//get cases by station id from the cases schema
async function getCases(stationId){
    checkDb();
    let result= await db.get("cases", ["stationId"], ["stationId", "==", stationId]);
    return result;

}

//get User by their wallet address
async function getUser(walletAddress){
    checkDb();
    let result= await db.get("users", ["walletAddress"], ["walletAddress", "==", walletAddress]);
    return result;
}

//add wallet address to the list of addresses belonging to a station in the registry schema
async function addWalletAddress(stationId,walletAddress){
    checkDb();
    let result=await db.update({walletAddresses:[...walletAddress]},"registry",stationId)

}

//add staff to the staff schema
async function addStaff(name,walletAddress,email,stationId,role){
    checkDb();
    let result=await db.set({name:name,walletAddress:walletAddress,email:email,role:role,stationId:stationId},"staff",walletAddress);
    return result;
}

//check wallet address if is included in the list wallet address for a station
async function returnWalletAddress(stationId){
    checkDb();
    let result= await db.get("registry", ["stationId"], ["stationId", "==", stationId]);
    return result;

}

//add a case to the case schema
async function addCase(txId,walletAddress,applicant,respodent,stationId){
    checkDb();
    let result=await db.set({caseId:uuid(),txId:txId,txOrigin:walletAddress,applicant:applicant,date:db.ts(),status:"pending",respodent:respodent,stationId:stationId},"cases",caseId)
    return result;
}

//approve or reject a case filling due missing details or wrong fomart
async function approval(status,caseId){
    checkDb();
    let result=await db.update({status:status},"cases",caseId);
    return result;
}

//check a station in the station schema
async function getStation(name){
    checkDb();
    let result = await db.get("station", ["name"], ["name", "==", name]);
    return result;
}


module.exports={getFolder,addStation,addFolder,addStation,addRegistry,addUser,addAdmin,addRole,checkRole,removeAdmin,getCases,getUser,addWalletAddress,addStaff,returnWalletAddress,addCase,approval,getStation};