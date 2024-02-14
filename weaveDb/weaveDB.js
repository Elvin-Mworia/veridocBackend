const WeaveDB=require("weavedb-sdk-node");

const contractTxId="eVGWyVFzjCNSJB9n6_Oj4fWhWlQQfe2whCtjL6iAZro";

const setupWeaveDB = async () => {
    const db = new WeaveDB({
      contractTxId:contractTxId,
    })
    await db.init()
    return(db)
  }

module.exports=setupWeaveDB;