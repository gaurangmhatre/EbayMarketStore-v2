/**
 * Created by Gaurang on 01-11-2016.
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



function handle_accountDetails_request(msg, callback){

    var res = {};
    console.log("In handle checksignup request:"+ msg.email);

    var email = msg.email;

    if(email!='') {
        //check if email already exists

        mongo.connect(mongoURL, function(){
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('users');
            coll.findOne({EmailId: email}, function(err, results){
                if (results) {
                    console.log("Successful got the user data");
                    console.log("Email :  " + email);
                    logger.log('info','Successful got the user data  for email:' + email);

                    json_responses = {"FirstName": results.FirstName
                        ,"LastName": results.LastName
                        ,"EmailId":results.EmailId
                        ,"Address":results.Address
                        ,"CreditCardNumber":results.CreditCardDetails
                        ,"DateOfBirth":results.DateOfBirth
                        ,"LastLoggedIn":results.LastLoggedIn
                    };

                    res.json_responses = json_responses;
                    res.statusCode=200;
                    callback(err,res);
                }
                else {
                    console.log('No data retrieved for email: ' + email);
                    logger.log('info','No data retrieved for email' + email);
                    res.statusCode=401;
                    callback(err,res);
                }
            });
        });

    }
}

function handle_allUserDirectBuyingActivities_request(msg, callback){
    var res = {};
    console.log("In handle allUserDirectBuyingActivities request:"+ msg.email);
    var email = msg.email;

    if(email!='') {
        //check if email already exists

        console.log('Connected to mongo at: ' + mongoURL);
        var coll = mongo.collection('users');

        coll.find({"EmailId": email},{"EmailId":1,"PurchasedProducts":1,"_id":0}).toArray(function(err, results){
            if (results) {
                console.log("Successful got the products for direct sell.");
                console.log("Email :  " + email);
                logger.log('info','Successful got the user products data  for email:' + email);

                json_responses = {"statusCode" : 200, "results": results};


            }
            else {
                console.log('No data retrieved for email: ' + email);
                logger.log('info','No products data retrieved for email' + email);
                json_responses = {"statusCode" : 401};
            }
            res.json_responses= json_responses;
            callback(err,res);
        });
    }
}

function handle_allAuctionProductHistory_request(msg, callback){
    var res = {};
    console.log("In handle allAuctionProductHistory request:"+ msg.email);
    var email = msg.email;

    if(email!='') {
        //check if email already exists

        console.log('Connected to mongo at: ' + mongoURL);
        var coll = mongo.collection('users');

        coll.find({"EmailId": email},{"EmailId":1,"AuctionsWonOnProducts":1,"_id":0}).toArray(function(err, results){
            if (results) {
                console.log("Successful got the products for Auctions sell.");
                console.log("Email :  " + email);
                logger.log('info','Successful got the user Auctions products data  for email:' + email);

                json_responses = {"statusCode" : 200, "results": results};
            }
            else {
                console.log('No data retrieved for email: ' + email);
                logger.log('info','No products Auctions data retrieved for email' + email);
                json_responses = {"statusCode" : 401};
            }
            res.json_responses= json_responses;
            callback(err,res);
        });
    }
}

function handle_allSoldProducts_request(msg, callback){
    var res = {};
    console.log("In handle allSoldProducts request:"+ msg.email);
    var email = msg.email;

    if(email!='') {
        //check if email already exists

        console.log('Connected to mongo at: ' + mongoURL);
        var coll = mongo.collection('users');

        coll.find({"EmailId": email},{"EmailId":1,"SoldProducts":1,"_id":0}).toArray(function(err, results){
            if (results) {
                console.log("Successful got the products for sold sell.");
                console.log("Email :  " + email);
                logger.log('info','Successful got the user sold data  for email:' + email);

                json_responses = {"statusCode" : 200, "results": results};


            }
            else {
                console.log('No data retrieved for email: ' + email);
                logger.log('info','No products data retrieved for email' + email);
                json_responses = {"statusCode" : 401};
            }
            res.json_responses= json_responses;
            callback(err,res);
        });
    }
}

function handle_allUserBiddingActivity_request(msg, callback){
    var res = {};
    console.log("In handle allUserBiddingActivity request:"+ msg.email);
    var email = msg.email;

    if(email!='') {
        //check if email already exists

        console.log('Connected to mongo at: ' + mongoURL);
        var coll = mongo.collection('users');

        coll.find({"EmailId": email},{"EmailId":1,"BidPlacedOnProducts":1,"_id":0}).toArray(function(err, results){
            if (results) {
                console.log("Successful got the products for bidding.");
                console.log("Email :  " + email);
                logger.log('info','Successful got the user bidding products data  for email:' + email);

                json_responses = {"statusCode" : 200, "results": results};
            }
            else {
                console.log('No data retrieved for email: ' + email);
                logger.log('info','No products bidding data retrieved for email' + email);
                json_responses = {"statusCode" : 401};
            }
            res.json_responses= json_responses;
            callback(err,res);
        });
    }
}

function handle_getItemFromCart_request(msg, callback){
    var res = {};
    console.log("In handle getItemFromCart request:"+ msg.email );
    var emailId = msg.email;
    //var itemName = msg.itemName;
    if(emailId!='') {
        //check if email already exists

        console.log('Connected to mongo at: ' + mongoURL);
        var coll = mongo.collection('UserCart');

        coll.find({"userEmail": emailId}).toArray(function(err, results){
            if (results) {
                console.log("Successful got the products for sold sell.");
                console.log("Email :  " + emailId);
                logger.log('info','Successful got the user sold data  for email:' + emailId);
                json_responses = {"statusCode" : 200, "results": results};
            }
            else {
                console.log('No data retrieved for email: ' + emailId);
                logger.log('info','No products data retrieved for email' + emailId);
                json_responses = {"statusCode" : 401};
            }
            res.json_responses= json_responses;
            callback(err,res);
        });
    }
}

function handle_removeItemFromCart_request(msg, callback){
    var res = {};
    console.log("In handle removeItemFromCart request:"+ msg.emailId +" Itemname: " +msg.itemName);
    var emailId = msg.emailId;
    var itemName = msg.itemName;
    if(emailId!='') {
        //check if email already exists

        console.log('Connected to mongo at: ' + mongoURL);
        var coll = mongo.collection('UserCart');

        coll.remove({'ItemName':itemName, "userEmail": emailId}
        ),function(err, results){
            if (results) {
                console.log("Successful removed item from cart.");
                console.log("Email :  " + emailId);
                logger.log('info','Successful removed item from cart.:' + emailId);

                json_responses = {"statusCode" : 200, "results": results};
            }
            else {
                console.log('No data retrieved for email: ' + emailId);
                logger.log('info','No data retrieved for email' + emailId);
                json_responses = {"statusCode" : 401};
            }
            res.json_responses = json_responses;
            callback(err,res);
        };
    }
}

function handle_buyItemsInCart_request(msg, callback){
    var res = {};
    console.log("In handle buyItemsInCart request:"+ msg.userId );

    var userId = msg.userId;

    if(userId!='') {
        //check if email already exists

        mongo.connect(mongoURL, function () {
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('UserCart');
            var callUser = mongo.collection('users');
            var callProducts = mongo.collection('ProductsForDirectSell');
            coll.find({"userEmail": userId}).toArray(function (err, results) {
                if (results) {
                    console.log("Successful got the products in cart.");
                    console.log("Email :  " + userId);
                    logger.log('info', 'Successful got the the products in cart for:' + userId);

                    for (var i = 0; i < results.length; i++) {
                        //push items to PurchasedProducts

                        //update seller
                        callUser.update(
                            {EmailId: results[i].Seller},
                            {$push: {SoldProducts: {$each: [results[0]]}}}
                        )

                        //update buyer
                        callUser.update(
                            {EmailId: userId},
                            {$push: {PurchasedProducts: {$each: [results[0]]}}}
                        )

                        //update Qty
                        var id = new ObjectId(results[i].ItemId);
                        callProducts.update({_id:id}, {
                            $set: {
                                "Qty": results[i].QtyAvailable - results[i].QtyInCart
                            }
                        })

                        // remove from cart
                        coll.remove({ItemName:results[i].ItemName}
                        )

                        /*coll.find(
                         { PurchasedProducts:{ItemName: results[0].UserCart[i].ItemName}},
                         { $inc: { PurchasedProducts: { Qty:-1 } } }
                         )*/
                        /* coll.find({'ProductsForDirectSell.ItemName': results[0].UserCart[i].ItemName}).toArray(function (err, userWithProduct) {
                         if (userWithProduct) {
                         console.log("Successful got all the seller with product in list.");
                         console.log("Email :  " + userId);

                         //update qty
                         for (var i = 0; i < userWithProduct[0].UserCart.length; i++) {
                         if (results[0].UserCart[i].ItemName == userWithProduct[0].UserCart.ItemName) {
                         userWithProduct[0].UserCart.Qty = parseInt(userWithProduct[0].UserCart.Qty) - 1;
                         }
                         }


                         //remove items from cart

                         }
                         });


                         coll.update(
                         {EmailId: userId},
                         {$inc: {quantity: -2, "metrics.orders": 1}}
                         )*/
                    }
                }
                else {
                    console.log('No data retrieved for email: ' + userId);
                    logger.log('info', 'No data retrieved for email' + userId);
                    json_responses = {"statusCode": 401};
                }
                res.json_responses = json_responses;
                callback(err,res);
            });
        })
    }
}

function handle_getAllWonAuctions_request(msg,callback){
    var res = {};
    console.log("In handle getAllWonAuctions request:"+ msg.userId );

    var userId = msg.userId;

    if(userId!='') {
        //check if email already exists

        mongo.connect(mongoURL, function () {
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('productsForAuction');

            coll.find({"MaxBidder": userId, "IsAuctionOver":true, "IsPayed":false}).toArray(function(err, results){
                if (results) {
                    console.log("Successful got the products for direct sell.");
                    console.log("Email :  " + userId);
                    logger.log('info','Successful got the user data  for email:' + userId);

                    json_responses = {"statusCode" : 200, "results": results};
                }
                else {
                    console.log('No data retrieved for email: ' + userId);
                    logger.log('info','No data retrieved for email' + userId);
                    json_responses = {"statusCode" : 401};
                }
                res.json_responses = json_responses;
                callback(err,res);
            });
        })
    }
}
exports.handle_getAllWonAuctions_request=handle_getAllWonAuctions_request;
exports.handle_buyItemsInCart_request = handle_buyItemsInCart_request
exports.handle_accountDetails_request = handle_accountDetails_request;
exports.handle_allUserDirectBuyingActivities_request = handle_allUserDirectBuyingActivities_request;
exports.handle_allAuctionProductHistory_request = handle_allAuctionProductHistory_request;
exports.handle_allSoldProducts_request = handle_allSoldProducts_request;
exports.handle_allUserBiddingActivity_request = handle_allUserBiddingActivity_request;

exports.handle_getItemFromCart_request = handle_getItemFromCart_request
exports.handle_removeItemFromCart_request = handle_removeItemFromCart_request




