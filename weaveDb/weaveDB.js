const WeaveDB=require("weavedb-sdk-node");
const fs = require('fs');
const path = require('path');
const {readJWKFile}=require("ardrive-core-js");

const contractTxId="eVGWyVFzjCNSJB9n6_Oj4fWhWlQQfe2whCtjL6iAZro";
const walletFilePath = path.join(__dirname,'/wallet.json');

//reading wallet
const wallet = readJWKFile(walletFilePath);

const setupWeaveDB = async () => {
    const db = new WeaveDB({
      contractTxId:contractTxId,
    });
    await db.init();
    //setting the wallet as the default signer for write calls
    db.setDefaultWallet(wallet.jwk, "ar");
    return(db);
  }
module.exports=setupWeaveDB;