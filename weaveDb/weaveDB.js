const WeaveDB=require("weavedb-sdk-node");
const fs = require('fs');
const path = require('path');
const {readJWKFile}=require("ardrive-core-js");

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

// Validating if the Id of a folder is in the collection
async function getFolder(id) {
    if (!db) {
        await setupWeaveDB(); // Ensure the database is initialized
    }
    let result = await db.get("Folders", ["Id"], ["Id", "==", id]);
    return result;
}


module.exports={getFolder};