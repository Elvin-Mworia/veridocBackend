const express=require("express");
const router=express.Router();
const  User=require("../model/user.js");
const DB=require("../mongoDB.js");
const hashingPassword=require("../utils/hashing.js");
const {addUser,addStaff,addAdmin,getUser,getStation,addWalletAddress,returnWalletAddress,modifyRole,checkRole,removeAdmin,getAllDocs}=require("../weaveDb/weaveDB.js");
const bcrypt = require('bcryptjs');
//addin a unpriviledged user
router.post("/l2", async (req, res) => {
    let name = req.body.name;
    let walletAddress = req.body.walletAddress;
    let email = req.body.email;
    let role = req.body.role;
    let phone = req.body.phone;

    try {
        // Add user
        await addUser(walletAddress,name,email,role,phone);

        // Get user
        const result = await getUser(walletAddress, "users");
        if (result.length === 0) {
            return res.status(400).json({ message: "Something went wrong" });
        }
        
        return res.status(200).json({ message: "User details have been recorded" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


//adding a staff
router.post("/l1", async (req, res) => {
    let name = req.body.name;
    let walletAddress = req.body.walletAddress;
    let email = req.body.email;
    let role = req.body.role;
    let station = req.body.station;

    try {
        // Check role
        if (role !== "staff") {
            console.log("role is not staff")
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Get station
        const result = await getStation("name",station);
        if (result.length === 0) {
            console.log("Station not found");
            return res.status(404).json({ message: "Station not found" });
        }
        let stationName = result[0].name;

        // Add staff
        await addStaff(name, walletAddress, email, stationName, role);

        // Get user
        const user = await getUser(walletAddress, "staff");
        if (user.length === 0) {
            console.log("User has not been added");
            return res.status(400).json({ message: "Something went wrong" });
        }
        const registryWallets= await returnWalletAddress(result[0].stationId);
        console.log(registryWallets);
        const walletAddresses=[...registryWallets[0].walletAddresses,walletAddress]
        //adding staff wallet to the list of wallets in the registry
        await addWalletAddress(result[0].stationId,walletAddresses) 
        

        console.log("User has been added");
        return res.status(200).json({ message: "Staff details have been recorded" });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


//adds an admin takes in walletAddress
router.post("/l0",async (req,res)=>{
    let walletAddress=req.body.walletAddress;
    try{
        const staff=await getUser(walletAddress,"staff");
        if (staff.length==0){
           return res.status(401).json({message:"authorization failed"})
        }
        //add admin
       await addAdmin(staff[0].name,walletAddress)
       const admin= await getUser(walletAddress,"admins");

       if(admin.length===0){
        console.log("User has not been added");
        return res.status(400).json({ message: "Something went wrong" });
    }
    //update role
    await modifyRole(walletAddress,"admin");
    //check role if updated
    const role=await checkRole(walletAddress,"admins");

    if(!role[0].role==="admin"){
        return res.status(400).json({ message: "Role has not been updated" });
    }

    return res.status(200).json({ message: `Another staff with the wallet address ${walletAddress} has been added as an admin!` });
 }catch (error) {
        console.log("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    } 
})

//removing an admin and lowering their priveledges to staff level
router.post("/removeAdmin",async (req,res)=>{
    let walletAddress=req.body.walletAddress;
    
    try{
     const admin=await getUser(walletAddress,"admins");
     if(admin.length==0){
        return res.status(404).json({message:`The user with wallet ${walletAddress} is not an admin.`})
     }
     await removeAdmin(walletAddress);
      
     await modifyRole(walletAddress,"staff");
     
     //check role if updated
     const role=await checkRole(walletAddress,"staff");
    
     if(role[0].role==="admin"){
         return res.status(400).json({ message: "Role has not been updated" });
     }
    
     return res.status(200).json({ message: `￼User with the wallet address ${walletAddress} has been removed as an admin!` });
    }catch (error) {
        console.log("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
    })
//log in user by walletAddress
router.post("/login", async (req, res) => {
        let walletAddress = req.body.walletAddress;
        console.log(walletAddress);
 
         try {
             // Get user
             const result = await getUser(walletAddress, "users");
             const staff= await getUser(walletAddress,"staff");
             console.log(result)
             console.log(staff)
             if (result.length == 0 && staff.length==0) {
                 console.log("status 400")
                 return res.status(400).json({ message: "Login failed" });
             }else{
                 console.log(" status 200")
                 if (result.length>0){
                 return res.status(200).json({ message: "Login successful" ,role:result[0].role});
                 }
                 if (staff.length>0){
                    return res.status(200).json({ message: "Login successful" ,role:staff[0].role,station:staff[0].station});
                    }
             }
         } catch (error) {
             console.log(error);
             return res.status(500).json({ message: "Internal server error" });
         }
     });

//get all Admins
router.get("/getAllAdmins",async (req,res)=>{
    
    try{
       let admins=await getAllDocs("admins");
       if(admins.length==0){
          return res.status(200).json({message:"No admins",admins}) 
       }
       return res.status(200).json({message:"successfully fetched admins",admins});
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

// Register a new user and store user data in mongodb
router.post('/register',hashingPassword,async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      // Check if user already exists
    const collection= await DB.collection("users"); 
    let user = await collection.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }     
       // Create new user
    user = new User({
        firstName,lastName,
        email,
        password
      });
    let newUser= await collection.insertOne(user);
      
      // Remove password from output
      newUser.password = undefined;
  
      res.status(201).json({
        status: 'success',
        data: {
          user: newUser
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
  });
  
  //login user via mongodb
  router.get("/v2/login", async (req, res) => {
    try {
        let user = req.body;
        if (!user.email || !user.password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        let collection = await DB.collection("users");
        let result = await collection.findOne({ email: user.email });
        if (!result) {
            return res.status(404).json({ message: "User does not exist" });
        }

        // Compare the provided password with the stored hash
        bcrypt.compare(user.password.trim(), result.password, function(err, isMatch) {
            if (err) {
                return res.status(500).json({ message: "Internal server error" });
            }
            if (isMatch) {
                user.password = undefined; // Remove password from the response for security
                return res.status(202).json({ message: "Login successful", user: result });
            } else {
                return res.status(401).json({ message: "Incorrect password" });
            }
        });

    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
});
module.exports=router;