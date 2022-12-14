import queryString from 'query-string';
import fetch from 'node-fetch';
import SusiRali from 'susi-rali';

const DEFAULT_DRY_MODE = false;// DEBUG // if true, then print fetch onto console instead of calling etsy

/**
 * this utility class implement ETSY (some) methods documented here:
 * https://developers.etsy.com/documentation/ > API V3 Reference
 **/
class EtsyClientV3 {

  static debug = process.env.ETSY_DEBUG && process.env.ETSY_DEBUG === "true"; 

  constructor(options) {
    if (!options) {
      options = {};
    }
    this.nbCall = 0;
    this.apiUrl = "apiUrl" in options ? options.apiUrl : (process.env.ETSY_API_ENDPOINT || 'https://openapi.etsy.com/v3/application');
    this._assumeApiUrl();
    this.apiKey = "apiKey" in options ? options.apiKey : process.env.ETSY_API_KEY;
    this._assumeApiKey();
    this.shopId = "shopId" in options ? options.shopId : process.env.ETSY_SHOP_ID;
    this.accessToken = "accessToken" in options ? options.accessToken : null;
    this.lang   = "lang" in options ? options.lang : process.env.ETSY_LANG;
    // configure rate limit on etsy call : max <etsyRateMaxQueries> per <etsyRateWindowSizeMs> ms
    // Etsy rate limit doc (10/sec) : https://www.etsy.com/developers/documentation/getting_started/api_basics#section_rate_limiting
    this.etsyRateWindowSizeMs = "etsyRateWindowSizeMs" in options ? options.etsyRateWindowSizeMs : (process.env.ETSY_RATE_WINDOWS_SIZE_MS  || 1000);
    this.etsyRateMaxQueries   = "etsyRateMaxQueries" in options ? options.etsyRateMaxQueries : (process.env.ETSY_RATE_MAX_QUERIES || null);
    this.dryMode              = "dryMode" in options ? options.dryMode : ("true" === process.env.ETSY_DRY_MODE || DEFAULT_DRY_MODE);
    this.initRateLimiter();
    // DEBUG // console.debug(`EtsyClientV3 - apiUrl:${this.apiUrl} - dryMode:${this.dryMode} - ${this.limiterDesc}`);
    
  }

  initRateLimiter() {
    this.limiter = (this.etsyRateWindowSizeMs === null || this.etsyRateMaxQueries === null) ? null :
      new SusiRali({
          windowsMs:this.etsyRateWindowSizeMs,
          maxQueryPerWindow:this.etsyRateMaxQueries,
          debugEnabled: false
      });
    this.limiterDesc = (!this.isRateLimitEnabled()) ? "" : `Rate limit of ${this.etsyRateMaxQueries} queries per ${this.etsyRateWindowSizeMs}ms`;
  }

  isRateLimitEnabled() {
    return this.limiter !== null;
  }

  // https://developers.etsy.com/documentation/reference/#operation/findShops
  findShops(options) {
    this._assumeField('shop_name', options.shop_name);
    return this.limitedEtsyApiFetch(`/shops`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/getShop
  getShop(options) {
    this.shopId = "shopId" in options ? options.shopId : process.env.ETSY_SHOP_ID;
    this._assumeShopId();
    return this.limitedEtsyApiFetch(`/shops/${this.shopId}`, options);

  }

  // https://developers.etsy.com/documentation/reference/#operation/getShopSections
  getShopSections(options) {
     this.shopId = "shopId" in options ? options.shopId : process.env.ETSY_SHOP_ID;
     this._assumeShopId();
     return this.limitedEtsyApiFetch(`/shops/${this.shopId}/sections`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/findAllActiveListingsByShop
  findAllActiveListingsByShop(options) {
    this.shopId = "shopId" in options ? options.shopId : process.env.ETSY_SHOP_ID;
    this._assumeShopId();
    return this.limitedEtsyApiFetch(`/shops/${this.shopId}/listings/active`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/getListing
  getListing(listingId, options) {
     this._assumeField('listingId', listingId);
     return this.limitedEtsyApiFetch(`/listings/${listingId}`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/getListingVariationImages
  getListingVariationImages(listingId, options) {
     this._assumeField('listingId', listingId);
     this._assumeShopId();
     return this.limitedEtsyApiFetch(`/shops/${this.shopId}/listings/${listingId}/variation-images`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/getListingImages
  getListingImages(listingId, options) {
     this._assumeField('listingId', listingId);
     return this.limitedEtsyApiFetch(`/listings/${listingId}/images`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/getListingProperty
  getListingProperty(listingId, options) {
     this._assumeField('listingId', listingId);
     this._assumeShopId();
     return this.limitedEtsyApiFetch(`/shops/${this.shopId}/listings/${listingId}/properties`, options);
  }

  //~ oauth2 required under

  // https://developers.etsy.com/documentation/reference/#operation/getListingsByShop
  getListingsByShop(options) {
    this.accessToken = "accessToken" in options ? options.accessToken : null;
    this.shopId = "shopId" in options ? options.shopId : process.env.ETSY_SHOP_ID;
    //console.log('getListingsByShop :', options);

    this._assumeShopId();
    this._assumeOAuth2();
    return this.limitedEtsyApiFetch(`/shops/${this.shopId}/listings`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/getListingInventory
  getListingInventory(listingId, options) {
    this.accessToken = "accessToken" in options ? options.accessToken : null;
    //this.shopId = "shopId" in options ? options.shopId : process.env.ETSY_SHOP_ID;
    this._assumeField('listingId', listingId);
    this._assumeOAuth2();
    return this.limitedEtsyApiFetch(`/listings/${listingId}/inventory`, options);
  }

  // https://developers.etsy.com/documentation/reference/#operation/getListingProduct
  getListingProduct(listingId, productId, options) {
     this.accessToken = "accessToken" in options ? options.accessToken : null;
     this._assumeField('listingId', listingId);
     this._assumeField('productId', productId);
     this._assumeOAuth2();
     return this.limitedEtsyApiFetch(`/listings/${listingId}/inventory/products/${productId}`, options);
  }

  //~ rate limit and api utility tools under

  limitedEtsyApiFetch(endpoint, options) {
    console.log('limitedEtsyApiFetch options :', endpoint, options);
    var client = this;
    if (!client.isRateLimitEnabled()) {
      return client.safeEtsyApiFetch(endpoint, options);
    } else {
      return new Promise(async function(resolve, reject) {
        await client.limiter.limitedCall(() => client.safeEtsyApiFetch(endpoint, options))
                  .then(resolve).catch(reject);
      });
    }
  }

  safeEtsyApiFetch(endpoint, options) {
     this._assumeField('endpoint', endpoint);
     var client = this;
     return new Promise((resolve, reject) => {
         const enrichedOptions = client.getOptions(options);
        // console.log('enrichedOptions :',enrichedOptions);
         var headers = {};
         if (enrichedOptions.apiKey) {
           headers["x-api-key"] = enrichedOptions.apiKey;
         }
         if (enrichedOptions.accessToken) {
           headers['Authorization'] = `Bearer ${enrichedOptions.accessToken}`; // Scoped endpoints require a bearer token
         }
         const queryOptions = Object.assign({}, enrichedOptions);
         delete queryOptions.apiKey;
         delete queryOptions.accessToken;
         const getQueryString = queryString.stringify(queryOptions);
         const fetchEndpoint = `${client.apiUrl}${endpoint}?${getQueryString}`;
         //EtsyClientV3.debug &&
         console.log(`fetch ${fetchEndpoint} headers: ${JSON.stringify(headers)}` ); // ** hidden **
         client.nodeFetch(fetchEndpoint, headers)
           .then(response => EtsyClientV3._response(response, resolve, reject))
           .catch(fetchError => {
             EtsyClientV3.debug && console.log(`fetch err ${JSON.stringify(fetchError)}`);
             var secureError = {};
             client.secureErrorAttribute(secureError, fetchError, "error");
             client.secureErrorAttribute(secureError, fetchError, "type");
             client.secureErrorAttribute(secureError, fetchError, "errno");
             client.secureErrorAttribute(secureError, fetchError, "code");
             reject(secureError);
           });
     });
  }

  secureErrorAttribute(secureError, sourceError, attribute) {
    if (!Object.keys(sourceError).includes(attribute)) {
      return;
    }
    secureError[attribute] = this.secureAttributeValue(sourceError[attribute]);
  }

  secureAttributeValue(value) {
    return (value === null || value === undefined) ? null : value.replace(new RegExp(this.apiKey,'g'), "**hidden**");
  }

  getOptions(options) {
    let merged = options ? options : {};

    if (this.apiKey != null && !("apiKey" in merged)) {
      merged['apiKey'] = this.apiKey;
    }
    if (this.accessToken != null && !("accessToken" in merged)) {
      merged['accessToken'] = this.accessToken;
    }
    // default lang is client one
    if (this.lang != null && !("language" in merged)) {
      merged['language'] = this.lang;
    }
    // lang option override client one
    if ("lang" in merged) {
      merged['language'] = merged['lang'];
      delete merged.lang;
    }
    //console.log('merged options :', merged);
    return merged;
  }

  dryFetch(endpoint) {
    const response = {};
    response.ok = true;
    response.text = function(){ return JSON.stringify({endpoint});};
    console.log(`[dry_fetch] ${endpoint}`);
    return Promise.resolve(response);
  }

  nodeFetch(endpoint, headers=[]) {
    if (EtsyClientV3.debug) {
      console.log(">>>", endpoint);
    }
    this.nbCall++;
    if (this.dryMode) {
      return this.dryFetch(endpoint);
    }
    return fetch(endpoint, { method: 'GET', headers });
  }

  getNbCall() {
    return this.nbCall;
  }

  razStats() {
    this.nbCall = 0;
  }

  hasOAuth2() {
    return isSet(this.accessToken);
  }

  setAccessToken(accessToken) {
    this.accessToken = accessToken;
  }

  _assumeShopId() { if (!isSet(this.shopId)) { throw "shopId is not defined";  } }
  _assumeOAuth2() { if (!isSet(this.accessToken)) { throw "accessToken is not defined";  } }
  _assumeApiUrl() { if (!isSet(this.apiUrl)) { throw "apiUrl is required. ie. set ETSY_API_ENDPOINT environment variable.";  } }
  _assumeApiKey() { if (!isSet(this.apiKey)) { throw "apiKey is required. ie. set ETSY_API_KEY environment variable.";  } }
  _assumeField(fieldName, fieldValue) { if (!fieldValue) { throw fieldName + " is required";  } }

  static _response(response, resolve, reject) {
    EtsyClientV3._consumeResponseBodyAs(response,
      (json) => {
        if (!response.ok) {
          reject((json && json.error) || (json && json.details) || (json && json.message) || response.status);
        } else {
          resolve(json);
        }
      },
      (txt) => {
        if (!response.ok) {
          reject(txt);
        } else {
          resolve(txt);// some strange case
        }
      }
    );
  }

  static _consumeResponseBodyAs(response, jsonConsumer, txtConsumer) {
    (async () => {
      var responseString = await response.text();
      try{
        if (responseString && typeof responseString === "string"){
         var responseParsed = JSON.parse(responseString);
         if (EtsyClientV3.debug) {
            console.log("RESPONSE(Json)", responseParsed);
         }
         return jsonConsumer(responseParsed);
        }
      } catch(error) {
        // text is not a valid json so we will consume as text
      }
      if (EtsyClientV3.debug) {
        console.log("RESPONSE(Txt)", responseString);
      }
      return txtConsumer(responseString);
    })();
  }
}
const isSet = (val) => val !== undefined && val !== null && val !== "";

export {EtsyClientV3};

