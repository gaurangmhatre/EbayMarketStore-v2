var ObjectId = require('mongodb').ObjectId;
var mongo = require('./mongo.js');
var mongoWithConnectionPool = require('./mongoWithConnectionPool.js');

var mongoURL = "mongodb://localhost:27017/ebay";
var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'ebayLog.log' })
    ]
});


function handle_checksignup_request(msg, callback){

    var res = {};
    console.log("In handle checksignup request:"+ msg.email);

    var email = msg.email;

    if(email!='') {
        //check if email already exists

        mongo.connect(mongoURL, function(){
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('users');
            coll.findOne({EmailId: email}, function(err, user){
                if (user) {
                    console.log("Email exists!");
                    logger.log('error', "Email exists for id: "+ email);
                    res.statusCode= 200;

                } else {
                    console.log("Email Doesn't exists");
                    logger.log('info', "New mail for id: "+ email);
                    res.statusCode= 401; //email not found.
                }

                callback(null, res);
            });
        });

    }
}

function handle_checksignup_request_WithConnectionPool(msg, callback){

    var res = {};
    console.log("In handle checksignup request:"+ msg.email);

    var email = msg.email;

    if(email!='') {
        //check if email already exists

        mongoWithConnectionPool.connect(mongoURL, function(){
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongoWithConnectionPool.collection('users');
            coll.findOne({EmailId: email}, function(err, user){
                if (user) {
                    console.log("Email exists!");
                    logger.log('error', "Email exists for id: "+ email);
                    res.statusCode= 200;

                } else {
                    console.log("Email Doesn't exists");
                    logger.log('info', "New mail for id: "+ email);
                    res.statusCode= 401; //email not found.
                }

                callback(null, res);
            });
        });

    }
}

function handle_aftersignup_request(msg, callback){

    var res = {};
    console.log("In handle aftersignup request:"+ msg.email);

    // var email = msg.email;

    var firstname = msg.firstname;
    var lastname = msg.lastname;
    var email = msg.email;
    var password = msg.password;
    var contact = msg.contact;
    var Address = msg.Address;
    var creditCardNumber = msg.creditCardNumber;
    var dateOfBirth = msg.dateOfBirth;

    

    if(email!='') {
        //check if email already exists
        mongo.connect(mongoURL, function(){
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('users');
            coll.insert({FirstName:firstname
                ,LastName:lastname
                ,EmailId: email
                ,Password:password
                ,Contact:contact
                ,Address: Address
                ,CreditCardDetails: creditCardNumber
                ,DateOfBirth:dateOfBirth
            },function(err, user){
                if (!err) {
                    console.log('SignUp success!');
                    logger.log('info', "Valid Sign up for: "+ email);
                    res.statusCode=200;
                    callback(null, res);
                } else {
                    console.log('Failed SignUp!');
                    logger.log('info', "Invalid Sign up for: "+ email);
                    res.statusCode=401;
                    callback(null, res);
                }
            });
        });
    }
}

function handle_signin_request(msg, callback){
    var res = {};
    console.log("In handle checksignin request:"+ msg.EmailId +" Password : "+ msg.Password);
    console.log('Connected to mongo at: ' + mongoURL);
    console.log( msg.EmailId +" = "+msg.Password);
    mongo.connect(mongoURL, function() {
        var coll = mongo.collection('users');

        coll.findOne({'EmailId': msg.EmailId}, function (error, user) {
            //console.log("Signin: user.FirstName" + user.FirstName);
            callback(error, user);
        });
    });
}

function handle_getAllAuctionResults_request(msg, callback){
    var res = {};
    console.log("In handle handle_getAllAuctionResults_request request.");
    console.log('Connected to mongo at: ' + mongoURL);
    
    var currentDate = new Date();
    
    mongo.connect(mongoURL, function() {
        /*var coll = mongo.collection('users');

        coll.findOne({'EmailId': msg.EmailId, 'Password': msg.Password}, function (error, user) {
            console.log("Signin: user.FirstName" + user.FirstName);
            callback(error, user);
        });*/
        var coll= mongo.collection('productsForAuction');
        var callProducts= mongo.collection('productsForAuction');

        coll.find({AuctionEndDate: {$lt: currentDate}, IsAuctionOver: false}).toArray(function (err, results) {
            for (var i = 0; i < results.length; i++) {
                /*Auction
                 * 1. set IsAuctionOver flag to true
                 * 2. set Payed  flag in products to false
                 * */

                var id = new ObjectId(results[i]._id);
                callProducts.update({_id: id}, {
                        $set: {
                            "IsAuctionOver": true,
                            "IsPayed": false
                        }},
                    {upsert:true}
                )
            }

        })
    });
}

function handle_addLastLogin_request(msg,callback){
    var res = {};
    console.log("In handle handle_addLastLogin_request request.");
    console.log('Connected to mongo at: ' + mongoURL);

    var currentDate = new Date();

    mongo.connect(mongoURL, function() {
        /*var coll = mongo.collection('users');

         coll.findOne({'EmailId': msg.EmailId, 'Password': msg.Password}, function (error, user) {
         console.log("Signin: user.FirstName" + user.FirstName);
         callback(error, user);
         });*/
        var coll= mongo.collection('users');

        coll.update(
            {EmailId: msg.userId},
            {$push: {LastLoggedIn: currentDate}}
        )

    });
}

exports.handle_addLastLogin_request = handle_addLastLogin_request;
exports.handle_getAllAuctionResults_request= handle_getAllAuctionResults_request;
exports.handle_signin_request = handle_signin_request;
exports.handle_checksignup_request = handle_checksignup_request;
exports.handle_checksignup_request_WithConnectionPool = handle_checksignup_request_WithConnectionPool;
exports.handle_aftersignup_request = handle_aftersignup_request;


