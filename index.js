const express = require('express');
const app = express();
var axios = require('axios');
const cors = require('cors');
const { createLogger, format, transports } = require("winston");
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
app.get('/agency-url-success-registration', (req, res) => 
{
  console.log("get");
    logger.info(`from:${req.url}. sending response: http://localhost:3000/successfullRegistration`);
    //!!!!!!! get url from agency bek
    res.send("http://localhost:3000/successfullRegistration");
});

app.post('/payRegistration', async (req, res) => {
  console.log("payRegistration");
    const total=req.query.total;
    const paymentId=req.query.paymentId;
    try{
      const response= await axios.post(`http://localhost:3005/payRegistration?total=${total}&paymentId=${paymentId}`);
      console.log("resp:",response.data);
      res.send(response.data);
    }
    catch(e){
      console.log("error:"+e);
    }

});