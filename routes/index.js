import express from "express";
const apiRouter = express.Router();

import {routerApiKey } from "./RoutesApiKeyAccess.js";
import {routerOauth} from './RoutesOauth.js';
import {routerApiToken} from './RoutesApiToken.js';

apiRouter.get("/", function (req, res, next) { // next rquired
    res.status(200).send("ETSY API... SHOPID:" + ETSY_SHOP_ID);
  })
  .use("/oauth", routerOauth)
  .use("/api-key", routerApiKey)
  .use("/api-token", routerApiToken);


export { apiRouter };
