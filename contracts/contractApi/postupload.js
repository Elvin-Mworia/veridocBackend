const {  WarpFactory }=require('warp-contracts');
const fs = require('fs');
const path = require('path');
const warp = WarpFactory.forTestnet();
const contractTxId="cG0eo7OGb0XGN3VuyjOmrs2BIUDxiUMFD8br3b2pyFo";
const walletFilePath = path.join(__dirname,'/contractwallet.json');

//reading wallet
let wallet=JSON.parse(fs.readFileSync(walletFilePath).toString())

const contract = warp.contract(contractTxId).setEvaluationOptions({ allowBigInt: true }).connect(wallet);

async function postUpload(walletAddress,txId){
    await contract.writeInteraction({ function: 'postUpload',walletAddress:walletAddress,txId:txId });
    return
}
async function getContractState(){
    const stateAfterInteraction = await contract.readState();
    console.dir(stateAfterInteraction.cachedValue.state, { depth: null });
    return stateAfterInteraction.cachedValue.state;
}
module.exports={postUpload,getContractState};
