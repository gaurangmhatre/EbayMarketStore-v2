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


exports.handle_accountDetails_request = handle_accountDetails_request;
exports.handle_allUserDirectBuyingActivities_request = handle_allUserDirectBuyingActivities_request;
exports.handle_allAuctionProductHistory_request = handle_allAuctionProductHistory_request;
exports.handle_allSoldProducts_request = handle_allSoldProducts_request;
exports.handle_allUserBiddingActivity_request = handle_allUserBiddingActivity_request;
exports.handle_removeItemFromCart_request = handle_removeItemFromCart_request




