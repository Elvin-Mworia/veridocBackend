const {readJWKFile,arDriveFactory}=require("ardrive-core-js");
const fs = require('fs');
const path = require('path');


const walletFilePath = path.join(__dirname,'/wallet.json');

//initializing ardrive with wallet
const myWallet = readJWKFile(walletFilePath);

const arDrive=()=>{
    const myWallet = readJWKFile(walletFilePath);
    return  arDriveFactory({wallet:myWallet})
}


module.exports=arDrive;
