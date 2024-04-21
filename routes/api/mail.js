const nodemailer = require('nodemailer');

async function sendmail(status,email){
    let testAccount = await nodemailer.createTestAccount();
    let message;
    
    // create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
    },
  });
  if(status==="approved"){
    message = {
        from: 'veridoc.efilling@gmail.com', // sender address
        to: email, // list of receivers
        subject: "Filling Status", // Subject line
        text: "The case filed has been approved.", // plain text body
        html: "<b>The case filed has been approved.</b>", // html body
      }

  }
  if(status ==="rejected"){
    message = {
        from: 'veridoc.efilling@gmail.com', // sender address
        to: email, // list of receivers
        subject: "Filling Status", // Subject line
        text: "The case filed has been rejected due to....", // plain text body
        html: "<b>The case filed has been rejected due to....</b>", // html body
      }
  }
  
  try{
    transporter.sendMail(message).then((info)=>{
        console.log(nodemailer.getTestMessageUrl(info))
        return nodemailer.getTestMessageUrl(info);
    })
  
  }catch(err){
    console.log(err)
    return;
  }

}

module.exports={sendmail};

