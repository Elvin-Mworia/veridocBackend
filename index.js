const express=require('express');
require("dotenv").config();
const app=express();
const cors=require('cors');
const uploadFile=require("./routes/uploadFile");
const addCourtStaion=require("./routes/addStation");
const users=require("./routes/user");
const folder=require("./routes/addFolder")


const logger=(req,res,next)=>{
    console.log("incoming request");
    next();
 }
const Allowed_origin=['*'];
 
var corOption={
    origin:Allowed_origin
}

app.use(cors(corOption));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(logger);
const port=process.env.PORT;
//routes
app.use("/upload",uploadFile);
app.use("/addStation",addCourtStaion);
app.use("/users",users);
app.use("/folders",folder);


app.listen(port,()=>{
        console.log(`running on port ${port}`);
});
