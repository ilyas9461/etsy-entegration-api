import dotenv from 'dotenv';
dotenv.config();

import { EtsyClientV3 } from '../services/EtsyClientV3.js';
const etsyClient = new EtsyClientV3();// .env file include api key.

const etsyGetShopInfo= async () => {
    try {
      const shops = await etsyClient.findShops({
        shop_name: process.env.ETSY_SHOP_NAME, 
        limit: 10,
      });

      const result=shops.results[0];

      const shopOptions={
          shop_name:result.shop_name,
          shop_id:result.shop_id,
          user_id:result.user_id,
      };
  
      return shopOptions;
  
      // console.log('find :',shops);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  export {
    etsyGetShopInfo,
  };