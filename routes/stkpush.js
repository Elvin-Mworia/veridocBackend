const axios = require("axios");

const createToken = async (req, res, next) => {
  const secret = process.env.CONSUMERSECRET;
  const consumer = process.env.CONSUMERKEY;
  const auth = new Buffer.from(`${consumer}:${secret}`).toString("base64");
  await axios
    .get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          authorization: `Basic ${auth}`,
        },
      }
    )
    .then((data) => {
      token = data.data.access_token;
      console.log(data.data);
      next();
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err.message);
    });
};

const stkPush = async (req, res) => {
  const shortCode = process.env.SHORTCODE;
  const phone = req.body.phone.substring(1);
  const amount = req.body.amount;
  console.log({amount,phone});
  const passkey =process.env.PASSKEY;;
  const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  const password = new Buffer.from(shortCode + passkey + timestamp).toString(
    "base64"
  );
  const data = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: `254${phone}`,
    PartyB: 174379,
    PhoneNumber: `254${phone}`,
    CallBackURL: "https://102.0.3.54:5001/mpesa-online/callback",
    AccountReference: "Cyber Informant",
    TransactionDesc: "payment",
  };

  await axios
    .post(url, data, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then((data) => {
      console.log(data.data);
      return res.status(200).json(data.data);
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json(err.message);
    });
};

module.exports = { createToken, stkPush };