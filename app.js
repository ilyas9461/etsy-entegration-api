import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
// import logger from "morgan";
import { apiRouter } from "./routes/index.js";
// import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

import { readFile } from "fs/promises";
const swaggerDocument = await readFile('./swagger.json')
  .then((json) => JSON.parse(json))
  .catch(() => null);
//import swaggerDocument from './swagger.json';
import { etsyGetShopInfo } from "./utils/utils.js";

dotenv.config();
const app = express();
//app.use(logger("dev"));
app.use(express.json()); // parse requests of content-type - application/json
app.use(express.urlencoded({ extended: true })); // parse requests of content-type - application/x-www-form-urlencoded
app.use(cors());
app.use("/", apiRouter); 

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument)); // ex. use :http://localhost:port/api-docs

etsyGetShopInfo().then((res) => {
  global.ETSY_SHOP_ID = res.shop_id; // save global shop id.
  console.log("ETSY Shop ID : ", res);
});

global.ETSY_TOKEN=null;
global.ETSY_REFRESH_TOKEN=null;

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`ETSY API services listening at http://localhost:${port}`);
});
