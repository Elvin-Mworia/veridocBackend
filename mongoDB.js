// This file is used to connect to the MongoDB database
const { MongoClient, ServerApiVersion } = require('mongodb');

const client = new MongoClient(process.env.URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
let DB=null;
async function run(){
try {
    // Connect the client to the server	
    await client.connect();
  }catch(err){
    console.dir(err)
  }
}
run();
DB=client.db("Veridoc")

module.exports=DB;