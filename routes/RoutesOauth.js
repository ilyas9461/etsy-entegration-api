import express from "express";
import dotenv from 'dotenv';
dotenv.config();
const routerOauth = express.Router();
import { askCode, askToken } from "../utils/oauth.js";
 //make a callback url for Etsy auth code

 let clientID = '';
 let clientVerifier = '';
 let redirectUri = '';
 let clientState='';

routerOauth.get("/", async (req, res) =>  // route '/oauth'
{
  const { codeVerifier, state, connectUrl } = askCode(); 

  clientVerifier=codeVerifier;
  redirectUri=process.env.ETSY_REDIRECT_URI;
  clientID = process.env.ETSY_API_KEY;
  clientState=state;

  // console.log("askCode:");
  // console.log("codeVerifier :", codeVerifier);
  // console.log("state :", state);
  // console.log("connectUrl :", connectUrl);

  res.redirect(connectUrl);  // Redirect connect URL to Etsy for take auth code
});

/* incoming auth code from  Etsy. we want a token with Etsy by this auth code.
   https://developer.etsy.com/documentation/essentials/authentication/#step-2-grant-access

   https://www.example.com/some/location?
   code=bftcubu-wownsvftz5kowdmxnqtsuoikwqkha7_4na3igu1uy-ztu1bsken68xnw4spzum8larqbry6zsxnea4or9etuicpra5zi
   &state=superstate
*/
routerOauth.get("/redirect", async (req, res) => {
    const { code, state } = req.query;

    const token=await askToken(clientID,code,clientVerifier,redirectUri);
    global.ETSY_TOKEN=token.access_token;
    global.ETSY_REFRESH_TOKEN=token.refresh_token;

    console.log('token: ',ETSY_TOKEN);
    console.log('refresh token :',ETSY_REFRESH_TOKEN);

    res.status(200).send("/oauth/callback route ...:" +JSON.stringify(token));   
});

export { routerOauth };
