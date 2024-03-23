import fs from 'fs';
import path from 'path';
import { LoggerFactory, WarpFactory } from 'warp-contracts';
import ArLocal from 'arlocal';
//const DeployPlugin=require("warp-contracts-plugin-deploy");
import { DeployPlugin } from 'warp-contracts-plugin-deploy';

(async () => {
//  let arLocal = new ArLocal(1985, false);
//   await arLocal.start();
  try {
    // Set up ArLocal

    
const __filename = import.meta.url;
const __dirname = path.dirname(__filename);
console.log(__dirname);

    // Set up Warp client
    LoggerFactory.INST.logLevel('error');
    const warp = WarpFactory.forMainnet().use(new DeployPlugin());

    let wallet;
    // note: warp.testing.generateWallet() automatically adds funds to the wallet
    //({ jwk: wallet } = await warp.generateWallet());
    const jwk = await warp.arweave.wallets.generate();
   const walletAddress = await warp.arweave.wallets.jwkToAddress(jwk);

    // Deploying contract
    console.log(__dirname);
    const contractSrc = fs.readFileSync(path.join(__dirname, '/contract.js'),'utf8');
    const initialState = fs.readFileSync(path.join(__dirname, '/initial-state.json'),'utf8');
    const { contractTxId } = await warp.createContract.deploy({
      jwk,
      initState: initialState,
      src: contractSrc,
    });
    // note: we need to mine block in ArLocal - so that contract deployment transaction was mined.
   // await warp.testing.mineBlock();

    // Interacting with the contract
    const contract = warp.contract(contractTxId).setEvaluationOptions({ allowBigInt: true }).connect(wallet);

    // Read state
    const { cachedValue } = await contract.readState();
    console.log('State before any interactions');
    console.dir(cachedValue.state, { depth: null });

    // Write interaction
    console.log("calling 'upload' interaction...");
    // note: if Warp instance is created with 'forLocal' - the writeInteraction method
    // automatically mines a new block - so that you won't have to do it manually in your tests.
    // if you want to switch off automatic mining - set evaluationOptions.mineArLocalBlocks to false, e.g.
    // contract.setEvaluationOptions({ mineArLocalBlocks: false })
    await contract.writeInteraction({ function: 'postUpload',walletAddress:'d6KpB0ztMhjMnC9fuE3lp',txId:'5NSQ4M5p665NSQ4M' });
    console.log('Interaction has been sent');
    //   await arLocal.start();
    // Read state after interaction
    const stateAfterInteraction = await contract.readState();
    console.log('State after 1 interaction');
    console.dir(stateAfterInteraction.cachedValue.state, { depth: null });
  } finally {
    // Shutting down ArLocal
  //  await arLocal.stop();
  console.log("something went wrong \n")
  }
})();