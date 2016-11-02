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


exports.handle_checksignup_request = handle_checksignup_request;

exports.handle_aftersignup_request = handle_aftersignup_request;


