import express from "express";
const routerApiToken = express.Router();

import {etsyGetListingsByShop} from '../services/EtsyV3Services.js';

// https://www.charliefalcon.click/api-token/
routerApiToken.get("/", async (req, res, next) => /* /api-token */ {
    res.status(200).send('/api-token ...');
});
  
// https://www.charliefalcon.click/api-token/listing-by-shop
routerApiToken.get('/listing-by-shop', async (req,res,next) => /* /api-token/listing-by-shop */
{
    etsyGetListingsByShop(req,res);
    //res.status(200).send('/api-token/listing-by-shop :');
});

export{
    routerApiToken,
};