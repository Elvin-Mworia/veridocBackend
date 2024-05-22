const multer=require('multer');
const path=require("path");
const {addFilename}=require("../weaveDb/weaveDB")
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,path.resolve(__dirname,'./files' ));
    },
    filename:(req,file,cb)=>{
        let fileName=req.body.walletAddress.concat(Date.now());
        addFilename(req.body.walletAddress,fileName);
        cb(null,fileName+path.extname(file.originalname));
    }
    
})
const upload=multer({
    storage:storage,
    limits:{fileSize:"50000000"},
    fileFilter:(req,file,cb)=>{
        const fileTypes=/pdf|webp|docx|epub/
        const mimtype=fileTypes.test(file.mimetype)
        const extname=fileTypes.test(path.extname(file.originalname))
       if(mimtype && extname ){
           return cb(null,true)
       }  
       cb('give the proper file formats to upload') 
    }
}).single("file")

module.exports=upload;