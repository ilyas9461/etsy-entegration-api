import express from "express";
const routerApiKey = express.Router();
import {
  etsyFindShop,
  etsyGetShop,
  etsyGetSections,
  etsyGetAllActiveLists,
  etsyGetListing,
  etsyGetListingImages
} from "../services/EtsyV3Services.js";

// https://www.charliefalcon.click/api-key/
routerApiKey.get("/", async (req, res) => /* /api-key */ {
  res.status(200).send('/api-key ...');
});

// https://www.charliefalcon.click/api-key/shops
routerApiKey.get("/shops", async (req, res) => /* /api-key/shops route */ {
  etsyFindShop(req, res);
});

// https://www.charliefalcon.click/api-key/shop
routerApiKey.get("/shop", async (req, res) => {
  etsyGetShop(req, res);
});

// https://www.charliefalcon.click/api-key/sections
routerApiKey.get("/sections", async (req, res) => {
  etsyGetSections(req, res);
});

// https://www.charliefalcon.click/api-key/all-active-lists
routerApiKey.get("/all-active-lists", async (req, res) => {
  etsyGetAllActiveLists(req, res);
});

// https://www.charliefalcon.click/api-key//listings/1268575779
routerApiKey.get("/listings/:listingId", async (req, res) => {
  etsyGetListing(req, res);
});

// https://www.charliefalcon.click/api-key//listings/images/1268575779
routerApiKey.get("/listings/images/:listingId", async (req, res) => {
  etsyGetListingImages(req, res);
});


export {
  routerApiKey
};