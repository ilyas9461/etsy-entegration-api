import express from "express";
const routerApiToken = express.Router();

import {etsyGetListingsByShop, etsyGetListingInventory, etsyGetListingProduct} from '../services/EtsyV3Services.js';

// https://www.charliefalcon.click/api-token/
routerApiToken.get("/", async (req, res, next) => /* /api-token */ {
    res.status(200).send('/api-token ...');
});
  
// https://www.charliefalcon.click/api-token/listings-by-shop
routerApiToken.get('/listings-by-shop', async (req,res,next) => /* /api-token/listing-by-shop */
{
    etsyGetListingsByShop(req,res);
    //res.status(200).send('/api-token/listing-by-shop :');
});

//  https://www.charliefalcon.click/api-token/listings-inventory/1268575779
routerApiToken.get('/listings-inventory/:listingId', async (req,res,next) => /* /api-token/listing-by-shop */
{
    etsyGetListingInventory(req,res);
    //res.status(200).send('/api-token/listing-by-shop :');
});

//  https://www.charliefalcon.click/api-token//listings/1268575779/products/9963536869
routerApiToken.get('/listings/:listingId/products/:productId', async (req,res,next) => /* /api-token/listing-by-shop */
{
    etsyGetListingProduct(req,res);
    //res.status(200).send('/api-token/listing-by-shop :');
});


export{
    routerApiToken,
};