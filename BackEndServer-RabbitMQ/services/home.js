var ObjectId = require('mongodb').ObjectId;
var mongo = require('./mongo.js');
var mongoURL = "mongodb://localhost:27017/ebay";


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
                    //logger.log('error', "Email exists for id: "+ email);
                    res.statusCode= 200;

                } else {
                    console.log("Email Doesn't exists");
                    //logger.log('info', "New mail for id: "+ email);
                    res.statusCode= 401; //email not found.
                }


            });
        });
        callback(null, res);
    }
}


exports.handle_checksignup_request = handle_checksignup_request;