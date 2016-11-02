/**
 * Created by Gaurang on 02-11-2016.
 */

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


exports.handle_accountDetails_request = handle_accountDetails_request;

