/**
 * Created by Gaurang on 02-11-2016.
 */
var ObjectId = require('mongodb').ObjectId;
var mongo = require('./mongo.js');
var mongoURL = "mongodb://localhost:27017/ebay";
var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'ebayLog.log' })
    ]
});

function handle_allProducts_request(msg, callback){
    var res = {};
    console.log("In handle allUserBiddingActivity request:"+ msg.email);
    var email = msg.email;

    if(email!='') {
        //check if email already exists

        console.log('Connected to mongo at: ' + mongoURL);
        var coll = mongo.collection('ProductsForDirectSell');

        coll.find({Qty:{ $gt: 0 }}).toArray(function(err, results){
            if (results) {
                console.log("---Successful got the products for direct sell.");
                console.log("Email :  " + email);
                logger.log('info','---Successful got the products data  for email:' + email);

                json_responses = {"statusCode" : 200, "results": results};
            }
            else {
                console.log('No data retrieved for email: ' + email);
                logger.log('info','No data retrieved for email' + email);
                json_responses = {"statusCode" : 401};
            }
            res.json_responses= json_responses;
            callback(err,res)
        });

    }
}

function handle_allProductsForAuction_request(msg, callback){
    var res = {};
    console.log("In handle allUserBiddingActivity request:"+ msg.email);
    var email = msg.email;

    if(email!='') {
        //check if email already exists

        console.log('Connected to mongo at: ' + mongoURL);
        var coll = mongo.collection('productsForAuction');

        coll.find({Qty:{ $gt: 0 }}).toArray(function(err, results){
            if (results) {
                console.log("---Successful got the products for auction sell.");
                console.log("Email :  " + email);
                logger.log('info','---Successful got the products for auction data  for email:' + email);

                json_responses = {"statusCode" : 200, "results": results};
            }
            else {
                console.log('No data retrieved for email: ' + email);
                logger.log('info','No data retrieved for email' + email);
                json_responses = {"statusCode" : 401};
            }
            res.json_responses= json_responses;
            callback(err,res)
        });

    }
}

function handle_userAddToCart_request(msg, callback){
    var res = {};
    console.log("In handle allUserBiddingActivity request:"+ msg.email);
    var email = msg.email;

    if(email!='') {
        //check if email already exists

        console.log('Connected to mongo at: ' + mongoURL);

		var coll = mongo.collection('UserCart');

			coll.insert({"ItemId":msg.ItemId, "userEmail":msg.userEmail,"QtyInCart": msg.QtyInCart ,"ItemName":msg.ItemName, "ItemDescription":msg.ItemDescription,"Price":msg.Price,"QtyAvailable":msg.QtyAvailable,"DateAdded":msg.DateAdded,"Seller":msg.Seller}), function (err, results) {
				if (results) {
					console.log("Successful updated the cart.");
					console.log("Email :  " + msg.userEmail);
					logger.log('info', 'Successful updated the cart email:' + msg.userEmail);
					json_responses = {"statusCode": 200, "results": results};
				}
				else {
					console.log('No data retrieved for email: ' + msg.userEmail);
					logger.log('info', 'No data retrieved for email' + msg.userEmail);
					json_responses = {"statusCode": 401};
				}
				res.json_responses= json_responses;
				callback(err,res)
			}


	}
}




exports.handle_allProducts_request = handle_allProducts_request;
exports.handle_allProductsForAuction_request = handle_allProductsForAuction_request;
exports.handle_userAddToCart_request = handle_userAddToCart_request;

