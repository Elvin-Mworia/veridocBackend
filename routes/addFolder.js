const express=require("express");
const router=express.Router();
const {arDrive}=require("../ardrive/ardrive");
const {addFolder,getStation, getFolder}=require("../weaveDb/weaveDB.js")

//takes in name parameter from the req
router.post("/addFolder",async (req,res,next)=>{
  let name=req.body.name;
  let parentId=process.env.PARENTID;
  let id=process.env.FOLDERID;
  
  getStation("name",name).then((result)=>{
    if(!result.length){
      res.status(400).json({message:"You can not add a folder which is not a court station"})
      return
      }
      addFolder(id,result[0].name,result[0].stationId,parentId).then(()=>{
        getFolder(name).then((result)=>{
          if(result.length==0){
            res.status(400).json({message:"folder was not created"})
            return
          }
          res.status(200).json({message:"folder created successfully"})
        }).catch(err=>{
          console.log(err)
        })
       }).catch(err=>{
        console.log(err)
      })
      
    }).catch(err=>{
      console.error(err);
    })
    next()
  })

module.exports=router