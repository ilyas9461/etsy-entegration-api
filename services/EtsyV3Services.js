import dotenv from 'dotenv';
dotenv.config();

import { EtsyClientV3 } from '../services/EtsyClientV3.js';
const etsyClient = new EtsyClientV3();// .env file include api key.
global.ETSY_SHOP_ID=null;

const etsyFindShop = async (req,res) => {
  try {
    const data = await etsyClient.findShops({
      shop_name: process.env.ETSY_SHOP_NAME, 
      limit: 10,
    });
    
    global.ETSY_SHOP_ID=data.results[0].shop_id;
  
    res.status(200).send(data);    
    // console.log('find :',shops);
  } catch (error) {
    console.log('err : ',error);
    res.status(500).send(error);
  }
};

const etsyGetShop= async (req,res) =>{
  try {
    const data=await etsyClient.getShop({
      shopId:ETSY_SHOP_ID,
      limit:10,
    });
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};
const etsyGetSections= async (req,res) =>{
  try {
    const data=await etsyClient.getShopSections({
      shopId:ETSY_SHOP_ID,
      limit:10,
    });
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

const etsyGetAllActiveLists= async (req,res) =>{
  try {
    const data=await etsyClient.findAllActiveListingsByShop({
      shopId:ETSY_SHOP_ID,
      limit:10,
    });
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

const etsyGetListing= async (req,res) =>{
  const listingId= parseInt(req.params.listingId);
  try {
    const data=await etsyClient.getListing(listingId, {
      shopId:ETSY_SHOP_ID,
      limit:10,
    });
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};
const etsyGetListingImages= async (req,res) =>{
  const listingId= parseInt(req.params.listingId);
  try {
    const data=await etsyClient.getListingImages(listingId, {
      shopId:ETSY_SHOP_ID,
      limit:10,
    });
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};

/* oauth2 required under */

const etsyGetListingsByShop=async (req,res) =>{
    const options={
      accessToken:ETSY_TOKEN ? ETSY_TOKEN : null,
      shopId:ETSY_SHOP_ID ? ETSY_SHOP_ID : null,
      limit:10
    };
    //console.log('options etsyGetListingsByShop :', options);
    try{
      const data=await etsyClient.getListingsByShop(options);
      res.status(200).send(data);
    }catch (error){
      res.status(500).send(error);
    }
};

export {
    etsyFindShop,
    etsyGetShop,
    etsyGetSections,
    etsyGetAllActiveLists,
    etsyGetListing,
    etsyGetListingImages,
    etsyGetListingsByShop
};