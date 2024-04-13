const router=require('express').Router();
const {createToken,stkPush}=require("./stkpush")

router.post("/",createToken,stkPush);
router.post("/callback",(req,res)=>{
    console.log(req.body.Body.stkCallback.CallbackMetadata);
})
 


module.exports=router;


