const express = require('express');
const app = express();
var axios = require('axios');
const cors = require('cors');
const { createClient } =require("@supabase/supabase-js");
const { createLogger, format, transports } = require("winston");
//database pw:12345678910nebojsa
const supabaseUrl = 'https://bxrtifkbinmnalcnwjyo.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4cnRpZmtiaW5tbmFsY253anlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzIzNDU3MTUsImV4cCI6MTk4NzkyMTcxNX0.2EViTiVuraLljRLmjpJSlroYagDVVj0x6_rYLANy638"
const supabase = createClient(supabaseUrl, supabaseKey)
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
app.listen(5000, () => console.log(`Server Started on ${5000}`));

app.get('/', (req, res) => 
{
  console.log("get");
    logger.info(`from:${req.url}. sending response: http://localhost:3001/home`);
    res.send("http://localhost:3001/home");
});
app.get('/agency-url-success-registration', async(req, res) => 
{
    console.log("getPspUrl");
    try{
      const response = await axios.get(`http://localhost:6001/agency-url-success-registration`);
      console.log("resp:",response.data);
      logger.info(`from:${req.url}. sending response: ${response.data}`);
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
    logger.info(`from:${req.url}. sending response: http://localhost:3001/home`);
    res.send("http://localhost:3001/home");
});

//??prvi poziv za placanje sa fronta psp kada biramo nacin placanja
app.post('/payRegistration', async (req, res) => {
  console.log("payRegistration");
    const total=req.query.total;
    const paymentId=req.query.paymentId;
    try{
      const response= await axios.post(`http://localhost:3005/payRegistration?total=${total}&paymentId=${paymentId}`);
      console.log("resp:",response.data);
      res.send(response.data);
      //dodao za supabase da upisuje
      const {data}= supabase
      .from('companies')
      .insert([
        {total,payment_id}
       ])
    .single();
    res.send(id);
    }
    catch(e){
      console.log("error:"+e);
    }

});