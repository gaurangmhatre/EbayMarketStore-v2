var mysql = require('./mysql');
var bcrypt = require('./bCrypt.js');
var winston = require('winston');
var ObjectId = require('mongodb').ObjectId;

var mongo = require('./mongo.js');

var mq_client = require('../rpc/client');

var mongoURL = "mongodb://localhost:27017/ebay";


var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)(),
		new (winston.transports.File)({ filename: 'ebayLog.log' })
	]
});

//Redirects to the homepage
exports.redirectToHome = function(req,res) {
	//Checks before redirecting whether the session is valid
	if(req.session.userid)
	{
		//Set these headers to notify the browser not to maintain any cache for the page being loaded
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		//res.render("homepage",{userid:req.session.userid});
		res.render('products',{validationMessage:'Empty Messgage'});
	}
	else
	{
		res.redirect('/signin');
	}
};

exports.signup=function (req,res) {
	getAllAuctionResults();
	
	res.render('signup', { validationMessage: 'Empty Message'});
};

exports.signin = function(req,res){
	getAllAuctionResults();
	res.render('signin',{validationMessage:'Empty Message'});
};

exports.checksignup = function(req,res){ //check if email ID is valid or not
	console.log("In check signup .");

	//request parameters
	var email = req.param("email");
	var msg_payload = {"email":email};

	if(email!='') {
		//check if email already exists
		mq_client.make_request('checksignup_queue',msg_payload, function(err,results){

			console.log(results);
			if(err){
				throw err;
			}
			else
			{
				if(results.statusCode == 200){
					console.log("valid Login");
					res.send({"statusCode" : 200});
				}
				else {
					console.log("Invalid Login");
					res.send({"statusCode" : 401});
				}
			}
		});
	}
};


exports.checksignupWithoutRabbitMQ = function(req,res){ //check if email ID is valid or not
	console.log("In check signup WithoutRabbitMQ.");

	//request parameters
	var email = req.param("email");

	if(email!='') {
		//check if email already exists

		mongo.connect(mongoURL, function(){
			console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('login');
			coll.findOne({EmailId: email}, function(err, user){
				if (user) {
					console.log("Email exists!");
					logger.log('error', "Email exists for id: "+ email);
					res.send({"statusCode" : 200});
				} else {
					console.log("Email Doesn't exists");
					logger.log('info', "New mail for id: "+ email);
					res.send({"statusCode" : 401});
				}
			});
		});

	}
};


exports.checksignupWithConnectionPool = function(req,res){ //check if email ID is valid or not
	console.log("In check signup .");

	//request parameters
	var email = req.param("email");
	var msg_payload = {"email":email};

	if(email!='') {
		//check if email already exists
		mq_client.make_request('checksignup_queue_WithConnectionPool',msg_payload, function(err,results){

			console.log(results);
			if(err){
				throw err;
			}
			else
			{
				if(results.statusCode == 200){
					console.log("valid Login");
					res.send({"statusCode" : 200});
				}
				else {
					console.log("Invalid Login");
					res.send({"statusCode" : 401});
				}
			}
		});
	}
};

exports.afterSignup = function(req,res){// load new user data in database
	console.log("In aftersignup");

	var firstname = req.param("firstname");
	var lastname = req.param("lastname");
	var email = req.param("email");
	var password = req.param("password");
	var contact = req.param("contact");//not added in database
	var Address = req.param("location");
	var creditCardNumber = req.param("creditCardNumber");
	var dateOfBirth = req.param("dateOfBirth");

	password = bcrypt.hashSync(password);
	console.log("firstname :: " + firstname);
	console.log("lastname :: " + lastname);
	console.log("email :: " + email);
	console.log("password :: " + password);
	console.log("contact :: " + contact);
	console.log("Address : " + Address);
	console.log("creditCardNumber : " + creditCardNumber);
	console.log("dateOfBirth :: " +dateOfBirth);

	var msg_payload = {"firstname": firstname,"lastname": lastname,"email":email,"password" : password, "contact" : contact,"Address" : Address,"creditCardNumber" : creditCardNumber,"dateOfBirth" :dateOfBirth};

	if(email!='') {
		//check if email already exists
		mq_client.make_request('aftersignup_queue',msg_payload, function(err,results){

			console.log("Hello "+ results);
			if(err){
				throw err;
			}
			else
			{
				if(results.statusCode == 200){
					console.log("Valid Login.");
					res.send("true");
				}
				else {
					console.log("Invalid Login.");
					res.send("false");
				}
			}
		});
	}


	/*
        var hash = bcrypt.hashSync(password);
        logger.log('info', "SignUp for new user: Firstname :: " + firstname+ " Lastname :: " + lastname + " email :: " + email+ " password :: " + hash +" contact :: " + contact +" location : " + location+" dateOfBirth :: " +dateOfBirth+" creditCardNumber : " + creditCardNumber);

        var query = "INSERT INTO user (FirstName, LastName, EmailId, Password, Address, CreditCardNumber,DateOfBirth) VALUES ('" + firstname + "','" + lastname + "','" + email + "','" + hash + "','" + location + "','" + creditCardNumber + "','"+dateOfBirth+"')";
        console.log("Query:: " + query);
        logger.log('info', "Query:: " + query);
    */

};

function getAllAuctionResults(){
	console.log("In GetAllAuction method.");

	var msg_payload= {};
	if(true){
			mq_client.make_request('getAllAuctionResults_queue',msg_payload, function(err,results){

				console.log("Hello "+ results);
				if(err){
					throw err;
				}
				else
				{
					if(results.statusCode == 200){
						console.log("Valid Login.");
						res.send("true");
					}
					else {
						console.log("Invalid Login.");
						res.send("false");
					}
				}
			});

			console.log('AllAuctionResultsUpdated');
	}
	else{
		console.log('ERROR! No auction results Updated.');
		throw err;
	}
}

exports.signout = function(req,res){

	var userId = req.session.userid;

	if(userId!=undefined) {
		logger.log('info','Sign out request for userId: '+userId);
		addLastLogin(userId);
	}
	req.session.destroy();

	json_responses = {"statusCode" : 200};
	res.send(json_responses);
}

function addLastLogin(userId) {

	//failing because of userID is EmailId now
	var msg_payload = {"userId":userId};
	mq_client.make_request('addLastLogin_queue',msg_payload, function(err,results){

		console.log("Hello "+ results);
		if(err){
			throw err;
		}
		else
		{
			if(results.statusCode == 200){
				console.log("Valid Login.");
				res.send("true");
			}
			else {
				console.log("Invalid Login.");
				res.send("false");
			}
		}
	});
}
