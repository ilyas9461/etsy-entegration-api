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

routerApiKey.get("/", async (req, res) => /* /api-key */ {
  res.status(200).send('/api-key ...');
});

routerApiKey.get("/shops", async (req, res) => /* /api-key/shops route */ {
  etsyFindShop(req, res);
});
//ETSY_SHOP_ID=36636792
routerApiKey.get("/shop", async (req, res) => {
  etsyGetShop(req, res);
});

routerApiKey.get("/sections", async (req, res) => {
  etsyGetSections(req, res);
});
routerApiKey.get("/all-active-lists", async (req, res) => {
  etsyGetAllActiveLists(req, res);
});

routerApiKey.get("/listing/:listingId", async (req, res) => {
  etsyGetListing(req, res);
});

routerApiKey.get("/listing/images/:listingId", async (req, res) => {
  etsyGetListingImages(req, res);
});


export {
  routerApiKey
};