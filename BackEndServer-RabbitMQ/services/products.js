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

function handle_addProductForDirectSell_request(msg, callback){
    var res = {};
    console.log("In handle addProductForDirectSell request:"+ msg.email);
    //var email = msg.email;

    if(msg.userId!='') {
        //check if email already exists
        mongo.connect(mongoURL, function () {
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('ProductsForDirectSell');

            coll.insert({ItemName: msg.ItemName, ItemDescription: msg.ItemDescription, Price: msg.Price, Qty:msg.Qty, DateAdded: msg.DateAdded, Seller : msg.userId }
            ), function (err, result) {
                if (result) {
                    console.log("Successful Added the products for direct sell.");
                    console.log("Email :  " + msg.userId);
                    logger.log('info', 'Successful Added the user data  for email:' + msg.userId);

                    json_responses = {"statusCode": 200, "results": result};
                }
                else {
                    console.log('No data added for email: ' + msg.userId);
                    logger.log('info', 'No data added for email' + msg.userId);
                    json_responses = {"statusCode": 401};
                }
                res.json_responses= json_responses;
                callback(err,res);
            }
        });

    }
}

function handle_addProductForAuction_request(msg, callback){
        var res = {};
        console.log("In handle addProductForAuction request:"+ msg.Seller);
        //var email = msg.email;

        if(msg.Seller!='') {
            //check if email already exists
            mongo.connect(mongoURL, function () {
                console.log('Connected to mongo at: ' + mongoURL);
                var coll = mongo.collection('productsForAuction');

                //{"ItemName":ItemName,"ItemDescription":ItemDescription,"Price":Price,"Qty":Qty,"DateAdded":CurrentDate,"Seller":userId , "AuctionEndDate":AuctionEndDate};

                coll.insert({'ItemName': msg.ItemName, 'ItemDescription': msg.ItemDescription, 'Price': msg.Price, 'Qty':1, 'DateAdded': msg.DateAdded, 'Seller': msg.Seller, 'AuctionEndDate':msg.AuctionEndDate }
                ), function (err, result){
                    if (result) {
                        console.log("Successful Added the products for Auction sell.");
                        console.log("Email :  " + msg.Seller);
                        logger.log('info', 'Successful Added the user data  for email:' + msg.Seller);

                        json_responses = {"statusCode": 200, "results": result};
                    }
                    else {
                        console.log('No data added for email: ' + msg.Seller);
                        logger.log('info', 'No data added for email' + msg.Seller);
                        json_responses = {"statusCode": 401};
                    }
                    res.json_responses= json_responses;
                    callback(err,res);
                }
            });

        }
    }

function handle_addBidOnProduct_request(msg, callback){
    var res = {};
    console.log("In handle addBidOnProduct request");

    var Item = msg.Item;
    var BidAmount = msg.BidAmount;
    var UserId = msg.UserId;

    if(UserId != undefined ) {
        mongo.connect(mongoURL, function () {
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('users');
            var collForAction = mongo.collection('productsForAuction');
            coll.update({"EmailId": UserId},{$push: {BidPlacedOnProducts: Item }}), function (err, results) {
                if (results) {
                    console.log("Successfully added bid to user table.");
                    console.log("Email :  " + UserId);
                    logger.log('info', 'Successfully added bid to user table for email:' + UserId);

                    json_responses = {"statusCode": 200};
                }
                else {
                    console.log('No data retrieved for email: ' + UserId);
                    logger.log('info', 'No data retrieved for email' + UserId);
                    json_responses = {"statusCode": 401};
                }
                //res.send(json_responses);
            }
            var id = new ObjectId(Item._id);
            collForAction.update({_id:id}, {
                $set: {
                    "MaxBidder": UserId,
                    "MaxBidAmount":BidAmount
                }
            }), function (err, results) {
                if (results) {
                    console.log("Successfully added bid to products table.");
                    console.log("Email :  " + UserId);
                    logger.log('info', 'Successfully added bid to products table for email:' + UserId);

                    json_responses = {"statusCode": 200};
                }
                else {
                    console.log('No data retrieved for email: ' + UserId);
                    logger.log('info', 'No data retrieved for email' + UserId);
                    json_responses = {"statusCode": 401};
                }
                callback(err,results);
            }
        })
    }
    else {
        var json_responses = {"statusCode": 401};
        res.send(json_responses);
    }
}

exports.handle_addBidOnProduct_request = handle_addBidOnProduct_request;
exports.handle_addProductForDirectSell_request = handle_addProductForDirectSell_request;
exports.handle_addProductForAuction_request = handle_addProductForAuction_request;
exports.handle_allProducts_request = handle_allProducts_request;
exports.handle_allProductsForAuction_request = handle_allProductsForAuction_request;
exports.handle_userAddToCart_request = handle_userAddToCart_request;

