const express=require('express');
require("dotenv").config();
const app=express();
const cors=require('cors');
const courtStation=require("./routes/station");
const users=require("./routes/user");
const folder=require("./routes/folders")
const cases=require("./routes/cases")
const upload=require("./utils/uploadFile");
const mpesa=require("./routes/mpesa");
const transaction=require("./routes/transactions");
const logger=(req,res,next)=>{
    console.log("incoming request");
    next();
 }
const Allowed_origin=process.env.ALLOWED_ORIGIN;
 
const corOption ={
    origin:Allowed_origin, 
    credentials:true,            //access-control-allow-credentials:true
}

app.use(cors(corOption));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(logger);
const port=process.env.PORT;
//routes
app.use("/station",courtStation);
app.use("/users",users);
app.use("/folders",folder);
app.use("/cases",upload,cases);
app.use("/mpesa-online",mpesa);
app.use("/transaction",transaction)

    app.listen(port,()=>{ 
    console.log(`running on port ${port}`);
});

