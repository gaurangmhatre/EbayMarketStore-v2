var mysql = require('./mysql');
var bcrypt = require('./bCrypt.js');
var winston = require('winston');
var ObjectId = require('mongodb').ObjectId;

var mongo = require('./mongo.js');
/*

var passport = require('passport');
//require('./routes/passport')(passport);
 */
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

	if(email!='') {
		//check if email already exists

		mongo.connect(mongoURL, function(){
			console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('users');
			coll.findOne({EmailId: email}, function(err, user){
				if (user) {
					console.log("Email exists!");
					logger.log('error', "Email exists for id: "+ email);
					json_responses = {"statusCode" : 200};

				} else {
					console.log("Email Doesn't exists");
					logger.log('info', "New mail for id: "+ email);
					json_responses = {"statusCode" : 401}; //email not found.
				}

				res.send(json_responses);
			});
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
	
	console.log("firstname :: " + firstname);
	console.log("lastname :: " + lastname);
	console.log("email :: " + email);
	console.log("password :: " + password);
	console.log("contact :: " + contact);
	console.log("Address : " + Address);
	console.log("creditCardNumber : " + creditCardNumber);
	console.log("dateOfBirth :: " +dateOfBirth);
/*
	var hash = bcrypt.hashSync(password);
	logger.log('info', "SignUp for new user: Firstname :: " + firstname+ " Lastname :: " + lastname + " email :: " + email+ " password :: " + hash +" contact :: " + contact +" location : " + location+" dateOfBirth :: " +dateOfBirth+" creditCardNumber : " + creditCardNumber);

	var query = "INSERT INTO user (FirstName, LastName, EmailId, Password, Address, CreditCardNumber,DateOfBirth) VALUES ('" + firstname + "','" + lastname + "','" + email + "','" + hash + "','" + location + "','" + creditCardNumber + "','"+dateOfBirth+"')";
	console.log("Query:: " + query);
	logger.log('info', "Query:: " + query);
*/
/*


	mysql.storeData(query, function(err, result){
		//render on success
		if(!err){
			console.log('Valid SignUp!');
			logger.log('info', "Valid Sign up for: "+ email);
			res.send("true");
		}
		//render or error
		else{
			console.log('Invalid SingUp!');
			logger.log('info', "Invalid Sign up for: "+ email);
			res.send("false");
		}
	});
*/

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
				console.log('Valid SignUp!');
				logger.log('info', "Valid Sign up for: "+ email);
				res.send("true");

			} else {
				console.log('Invalid SingUp!');
				logger.log('info', "Invalid Sign up for: "+ email);
				res.send("false");
			}

			res.send(json_responses);
		});
	});

};

function getAllAuctionResults(){
	console.log("In GetAllAuction method.");
	var currentDate=  new Date();

	mongo.connect(mongoURL, function() {

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

function itemIsSold(ItemId) {

	console.log("Inside itemIsSold flag.");
		
		var updateSoldItemFlagQuery = "update Item set sold = 1 where ItemId = "+ItemId;

		console.log("Query:: " + updateSoldItemFlagQuery);
		logger.log('info', "Query:: " + updateSoldItemFlagQuery);

		mysql.storeData(updateSoldItemFlagQuery, function(err, result){
			//render on success
			if(!err){
				console.log('Sold flag updated for Item:'+ItemId);
			}
			else{
				console.log('ERROR! Insertion not done for auction results.');
				throw err;
			}
		});
};

function addAuctionWinnerToTheList(ItemId) {

	console.log("Inside addAuctionWinnerToTheList method.");
	
	var addAuctionWinnerToTheListQuery = "INSERT INTO `ebay`.`auctionwinners`(`WinnerId`,`ItemId`,`IsPaymentDone`)(select b.BidderId, b.ItemId, 0 as IsPaymentDone from bidderlist as b where ItemId = "+ItemId+" and b.BidAmount = (	select max(b.BidAmount)	from bidderlist as b left join item as i	on b.ItemId=i.ItemId	where i.IsBidItem =1  and i.AuctionEndDate < now() and i.ItemId="+ItemId+"));";

	console.log("Query:: " + addAuctionWinnerToTheListQuery);
	logger.log('info', "Query:: " + addAuctionWinnerToTheListQuery);
	mysql.storeData(addAuctionWinnerToTheListQuery, function(err, result){
		//render on success
		if(!err){
			console.log('New bidder successfully added to winners list! for Item:'+ItemId);
			logger.log('info', 'New bidder successfully added to winners list! for Item:'+ItemId);
		}
		else{
			console.log('ERROR! Insertion not done for auction results.');
			logger.log('error','ERROR! Insertion not done for auction results.');
			throw err;
		}
	});
};

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
	/*
	var addItemToSoldTableQuery = "UPDATE user	SET LastLoggedIn = NOW() WHERE UserId = "+userId+";";
	console.log("Query:: " + addItemToSoldTableQuery);
	logger.log('info',"Query:: " + addItemToSoldTableQuery);

	mysql.storeData(addItemToSoldTableQuery, function(err, result){
		//render on success
		if(!err){
			console.log('last Login for userId = '+userId+" is added.");
			logger.log('info','last Login for userId = '+userId+' is added.');
		}
		else{
			console.log('ERROR! while adding current login time.');
			logger.log('Error','ERROR! while adding current login time.'+err);
			throw err;
		}
	});
*/


}
