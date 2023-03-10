const express = require('express');
const app = express();
const uuid = require('uuid');
var axios = require('axios');
const cors = require('cors');
const { createLogger, format, transports } = require("winston");
const repo=require('./Repository.js');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
//database pw:12345678910nebojsa


const merchantBankId='69b07549-69a7-473e-8bbc-44440fcb1280';
const merchanBankPassword='123123';
const merchantBankUrl='http://localhost:8000';
const pspSuccessUrl='http://localhost:3001/success';
const pspFailedUrl='http://localhost:3001/error';
const pspErrorUrl='http://localhost:3001/error';
const pspCancelUrl='http://localhost:3001/cancel';
const front='http://localhost:3001';

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};
app.use(cors({
    origin: '*'
}));
const logger = createLogger({
  levels:logLevels,
  transports: [new transports.File({ filename: "file.log" })],
  exceptionHandlers: [new transports.File({ filename: "exceptions.log" })],
  rejectionHandlers: [new transports.File({ filename: "rejections.log" })],
});
app.listen(5000,async () => {
  console.log(`Server Started on ${5000} `);
  
});

app.get('/', (req, res) => 
{
  console.log("get");
    logger.info(`from:${req.url}. sending response: http://localhost:3001/home`);
    res.send("http://localhost:3001/home");
});
app.get('/get-amount',async (req, res) => 
{
  const payment_id=req.query.payment_id;
  const data=await repo.GetAmount(payment_id);
  console.log(data);
  logger.info(`Time: ${new Date()} Message: Requested amount for payment with payment id ${payment_id}.`);
  res.send({amount:data[0].amount});
});
app.get('/agency-url-success-registration', async(req, res) => 
{
  console.log("success");
  const paymentId=req.query.paymentId;
  console.log(paymentId)
  const data=repo.UpdatePayment(paymentId,'executed');

    console.log("agency-url-success-payment");
    try{
      const response = await axios.get(`http://localhost:6001/agency-url-success-payment`);
      console.log("resp:",response.data);
      logger.info(`Time: ${new Date()} Message: Requested success url. Sending response.`);
      res.send(response.data);
    }
    catch(e){
      console.log("error:"+e);
    }
});
app.get('/agency-url-error-payment', async(req, res) => 
{
  const paymentId=req.query.paymendId;
  const data=repo.UpdatePayment(paymentId,'failed');
    console.log("agency-url-error-payment");
    try{
      const response = await axios.get(`http://localhost:6001/agency-url-error-payment`);
      console.log("resp:",response.data);
      logger.info(`Time: ${new Date()} Message: Requested error url. Sending response.`);
      res.send(response.data);
    }
    catch(e){
      console.log("error:"+e);
    }
});
app.get('/agency-url-cancel-payment', async(req, res) => 
{
  const paymentId=req.query.paymentId;
  console.log(paymentId);
  const data=repo.UpdatePayment(paymentId,'canceled');
    console.log("agency-url-cancel-payment");
    try{
      const response = await axios.get(`http://localhost:6001/agency-url-cancel-payment`);
      console.log("resp:",response.data);
      logger.info(`Time: ${new Date()} Message: Requested cancel url. Sending response.`);
      res.send(response.data);
    }
    catch(e){
      console.log("error:"+e);
    }
});

//agency calls this endpoint to get url for relocation to psp frontend
app.get('/get-psp-url', (req, res) => 
{
  console.log("get");
  logger.info(`Time: ${new Date()} Message: Requested url.`);
    res.send(`${front}/home`);
});
app.post('/new-payment', jsonParser,async(req,res)=>
{
  console.log(req.body);
  const data=await repo.AddNewPayment(req.body.amount,req.body.payment_id);
  console.log(data);
  logger.info(`Time: ${new Date()} Message: Adding new payment.`);
  res.send({url:front+'/home'});
});
app.post('/pay-by-card',async(req,res)=>
{
  logger.info(`Time: ${new Date()} Message: Payment by card started.`);
  console.log('pay-by-card')
  console.log(req.query);
  const paymentId=req.query.paymentId;
  const total=req.query.total;
  const paymentInfo={
    merchant_id:merchantBankId,
    merchant_password:merchanBankPassword,
    amount:total,
    merchant_order_id:paymentId,
    merchant_timestamp:Date.now(),
    success_url:pspSuccessUrl,
    failed_url:pspCancelUrl,
    error_url:pspErrorUrl
  };
  console.log('total');
  try{

    const data=await axios.post(`${merchantBankUrl}/start-payment`,paymentInfo);
    console.log(data.data);
    res.send(data.data); //sending bank-front url to psp-front
  }
  catch(e)
  {
    logger.error(`Time: ${new Date()} Message: Payment failed.`);
    console.log(e);
  }
});
app.post('/pay-by-paypal', async (req, res) => {
  logger.info(`Time: ${new Date()} Message: Paypal payment started.`);
  console.log("payRegistration");
    const total=req.query.total;
    const paymentId=req.query.paymentId;
    //send paypal merchant account info (id, password) // dont store it on payPal api   !!!! 
    try{
      const obj={
        total:total,
        paymentId:paymentId,
        cancel_url:pspCancelUrl,
        return_url:pspSuccessUrl,
        error_url:pspErrorUrl
      }
      const response= await axios.post(`http://localhost:3005/payRegistration`,obj);
      console.log("resp:",response.data);
      res.send({url:response.data,paymendId:''});
      //dodao za supabase da upisuje
    //   const {data}= supabase
    //   .from('companies')
    //   .insert([
    //     {total,paymentId}
    //    ])
    // .single();
    //res.send(id);
    }
    catch(e){
      logger.error(`Time: ${new Date()} Message: Payment failed.`);
      console.log("error:"+e);
    }

});
//when choosing QR payment
app.post('/pay-by-qr',async(req,res)=>
{
  logger.info(`Time: ${new Date()} Message: QR code payment started.`);
  console.log(req.query);
  const paymentId=req.query.paymentId;
  const total=req.query.total;
  console.log(total);
  const paymentInfo={
    payment_id:req.query.paymentId,
    merchant_id:merchantBankId,
    merchant_password:merchanBankPassword,
    amount:total,
    merchant_order_id:paymentId,
    merchant_timestamp:Date.now(),
    success_url:pspSuccessUrl,
    failed_url:pspFailedUrl,
    error_url:pspErrorUrl
  };
  try{

    const data=await axios.post('http://localhost:8000/start-payment-qr',paymentInfo);
    console.log(data); //data.data => should be {url,paymentId}
    res.send(data.data); 
  }
  catch(e)
  {
    logger.error(`Time: ${new Date()} Message: Payment failed.`);
    console.log(e);
  }
});
app.post('/pay-by-crypto',jsonParser, async (req, res) => {
  logger.info(`Time: ${new Date()} Message: Crypto payment started.`);
    const total=req.query.total;
    const paymentId=req.query.paymentId;
    console.log("Req.q",req.query)
    //send paypal merchant account info (id, password) // dont store it on payPal api   !!!! 
    try{
      const order_params = {
        order_id: paymentId,//nzm treba li ovdje paymentId
        price_amount: Number(total),
        price_currency: 'USD', 
        receive_currency: 'BTC',
        cancel_url: pspCancelUrl,
        success_url: pspSuccessUrl
      }
      const response= await axios.post(`http://localhost:4005/start-payment`,order_params);
      console.log("resp:",response.data);
      //res.send({url:response.data,paymendId:''});  
      res.send({paymentId:'',url:response.data});
    }
    catch(e){
      logger.error(`Time: ${new Date()} Message: Payment failed.`);
      console.log("error:"+e);
    }

});