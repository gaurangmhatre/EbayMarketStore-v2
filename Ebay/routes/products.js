var mysql = require('./mysql');
var winston = require('winston');

var mongo = require('./mongo.js');
var mongoURL = "mongodb://localhost:27017/ebay";

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)(),
		new (winston.transports.File)({ filename: 'ebayLog.log' })
	]
});

exports.getProductsPage = function(req,res){
	//res.render('products',{validationMessage:'Empty Messgage'});

	//Checks before redirecting whether the session is valid
	//if(req.session.userid)
	//{
		//Set these headers to notify the browser not to maintain any cache for the page being loaded
		//res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		//res.render("homepage",{userid:req.session.userid});
		res.render('products',{validationMessage:'Empty Messgage'});
	/*}
	else
	{
		res.redirect('/signin');
	}*/

};

exports.getAllProducts = function(req,res){
	console.log("In getAllProducts.");

	console.log("userId: "+req.session.userid);

	var email = req.session.userid;

	if(email != undefined ) {

		mongo.connect(mongoURL, function(){
			console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('users');

			coll.find({},{"EmailId":1,"ProductsForDirectSell":1,"_id":0}).toArray(function(err, results){
				if (results) {
					console.log("Successful got the products for direct sell.");
					console.log("Email :  " + email);
					logger.log('info','Successful got the user data  for email:' + email);

					json_responses = {"statusCode" : 200, "results": results};
				}
				else {
					console.log('No data retrieved for email: ' + email);
					logger.log('info','No data retrieved for email' + email);
					json_responses = {"statusCode" : 401};
				}
				res.send(json_responses);
			});
		});


	}
	else {
		var json_responses = {"statusCode": 401};
		res.send(json_responses);
	}
};

exports.getAllProductsForAuction = function(req,res){
	console.log("In getAllProductsForAuction.");

		/*var getAllProductForAuctionQuery = "select i.ItemId, i.ItemName,i.ItemDescription,i.ItemTypeId,i.SellerId,i.Price,i.Qty,i.DateAdded,i.AuctionEndDate,i.IsBidItem,i.sold, max(b.BidAmount) as MaxBidAmount from item as i left join bidderList as b on i.ItemId = b.ItemId  where i.IsBidItem=1 and i.AuctionEndDate > NOW() group by i.ItemId, i.ItemName,i.ItemDescription,i.ItemTypeId,i.SellerId,i.Price,i.Qty,i.DateAdded,i.AuctionEndDate,i.IsBidItem, i.sold";
		console.log("Query:: " + getAllProductForAuctionQuery);
		logger.log('info', "Query:: " + getAllProductForAuctionQuery);
		mysql.fetchData(function(err,results) {
			if(err) {
				throw err;
				logger.log('error', err);
			}
			else {
				if(results.length > 0) {
					logger.log('info', 'Results are loaded for user (auction): '+req.session.userid);
					json_responses = {"statusCode" : 200,
											"results" : results};
						
						res.send(json_responses);
				}
				else {
					console.log("No items to display");
					logger.log('info', 'No results are loaded for user (auction): '+req.session.userid);
					json_responses = {"statusCode" : 401};
					res.send(json_responses);
				}
			}
		}, getAllProductForAuctionQuery );*/

	console.log("userId: "+req.session.userid);

	var email = req.session.userid;

	if(email != undefined ) {

		mongo.connect(mongoURL, function(){
			console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('users');

			coll.find({},{"EmailId":1,"ProductsForAuction":1,"_id":0}).toArray(function(err, results){
				if (results) {
					console.log("Successful got the products for Auction sell.");
					console.log("Email :  " + email);
					logger.log('info','Successful got the user data  for email:' + email);

					json_responses = {"statusCode" : 200, "results": results};
				}
				else {
					console.log('No data retrieved for email: ' + email);
					logger.log('info','No data retrieved for email' + email);
					json_responses = {"statusCode" : 401};
				}
				res.send(json_responses);
			});
		});


	}
	else {
		var json_responses = {"statusCode": 401};
		res.send(json_responses);
	}


};

exports.userAddToCart = function(req,res){
	console.log("In userAddToCart method.");
	
	var Product = req.param("product");

	var UserId =  req.session.userid;



	console.log("Add to cart for: "+UserId+" itemId: "+Product.ItemName+" Qty:"+Product.Qty);
	logger.log('info', "Add to cart for: "+UserId+" itemId: "+Product.ItemName+" Qty:"+Product.Qty);


	Product.Qty="1";

	if(UserId != undefined ) {
		mongo.connect(mongoURL, function () {
			console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('users');

			coll.update({"EmailId": UserId}, {$push: {"UserCart": Product}}), function (err, results) {
				if (results) {
					console.log("Successful got the products for Auction sell.");
					console.log("Email :  " + UserId);
					logger.log('info', 'Successful got the user data  for email:' + UserId);

					json_responses = {"statusCode": 200, "results": results};
				}
				else {
					console.log('No data retrieved for email: ' + UserId);
					logger.log('info', 'No data retrieved for email' + UserId);
					json_responses = {"statusCode": 401};
				}
				res.send(json_responses);
			}
		})
	}
	else {
		var json_responses = {"statusCode": 401};
		res.send(json_responses);
	}

};

exports.addBidOnProduct = function(req,res){
	/*get the product 
	* get the userId
	* update the max bidder id in product only
	* update the highest bid amount 
	* add bid to user profile
	* */
	
	console.log("In addBidOnProduct method.");
	
	var Item = req.param("Item");
	var BidAmount = req.param("BidAmount");
	var UserId =  req.session.userid;


	if(UserId != undefined ) {
		mongo.connect(mongoURL, function () {
			console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('users');

			coll.update({"EmailId": UserId}, {$push: {"UserCart": Product}}), function (err, results) {
				if (results) {
					console.log("Successful got the products for Auction sell.");
					console.log("Email :  " + UserId);
					logger.log('info', 'Successful got the user data  for email:' + UserId);

					json_responses = {"statusCode": 200, "results": results};
				}
				else {
					console.log('No data retrieved for email: ' + UserId);
					logger.log('info', 'No data retrieved for email' + UserId);
					json_responses = {"statusCode": 401};
				}
				res.send(json_responses);
			}
		})
	}
	else {
		var json_responses = {"statusCode": 401};
		res.send(json_responses);
	}


	/*if(UserId != undefined ) {
		var addBidOnProductQuery = "INSERT INTO bidderlist(BidderId,ItemId,BidAmount,BidTime)VALUES(" + UserId + "," + ItemId + "," + BidAmount + ",NOW());";
		console.log("Query:: " + addBidOnProductQuery);
		logger.log('info', "Query:: " + addBidOnProductQuery);
		mysql.fetchData(function (err, results) {
			if (err) {
				throw err;
			}
			else {
				if (results.length > 0) {
					logger.log('info', "Results from addBidOnProductQuery for userId:: " + UserId);
					json_responses = {
						"statusCode": 200,
						"results": results,
						"BidAmount": 0
					};

					res.send(json_responses);
				}
				else {
					console.log("No items to display");
					logger.log('info', "No, Results from addBidOnProductQuery for userId:: " + UserId);
					json_responses = {"statusCode": 401};
					res.send(json_responses);
				}
			}
		}, addBidOnProductQuery);
	}*/
	/*else {
		var json_responses = {"statusCode": 401};
		res.send(json_responses);
	}*/
};

exports.getItemType = function(req,res){
	console.log("Inside getItemType Method.");
	
	var getItemTypeQuery = "SELECT ItemTypeId,ItemType FROM itemtype;";
	console.log("Query:: " + getItemTypeQuery);
	logger.log('info',"Query:: " + getItemTypeQuery);
	mysql.fetchData(function(err,results) {
		if(err) {
			throw err;
			logger.log('error',err);
		}
		else {
			if(results.length > 0) {
					console.log("Successful got All the ItemTypes.");
					logger.log('info',"Successful got All the ItemTypes.");

					json_responses = results;
			}
			else{
					res.send(json_responses);
					console.log("Invalid string.");
					logger.log('error', "zero itemsTypes retrived.");
					json_responses = {"statusCode" : 401};
			}
			res.send(json_responses);
		}	
		
	}, getItemTypeQuery);
	
};

exports.addProduct = function(req,res){
	console.log("Inside addProduct.");
	var json_responses="";

	var userId = req.session.userid;
	
	var ItemName = req.param("ItemName");
	var ItemDescription = req.param("ItemDescription");
	var ItemTypeId = req.param("ItemTypeId");
	var Price = req.param("Price");
	var Qty = req.param("Qty");
	var IsBidItem = req.param("IsBidItem");
	var Sold = 0;

	var product = {ItemName: ItemName, ItemDescription: ItemDescription, Price: Price, Qty:Qty, DateAdded: new Date()};

	var productForBidding = {ItemName: ItemName, ItemDescription: ItemDescription, Price: Price, Qty:Qty, DateAdded: new Date(), DateAdded: $date ,AuctionEndDate:{ $add: [ "$date", 4*24*60*60000 ] }};

	if(userId != undefined ) {
		if (IsBidItem == 0) {
			mongo.connect(mongoURL, function () {
				console.log('Connected to mongo at: ' + mongoURL);
				var coll = mongo.collection('users');

				coll.update(
					{ EmailId: userId },
					{ $push: { ProductsForDirectSell: { $each: [product] } } }
					, function (err, result) {
						if (result) {
							console.log("Successful Added the products for direct sell.");
							console.log("Email :  " + userId);
							logger.log('info', 'Successful Added the user data  for email:' + userId);

							json_responses = {"statusCode": 200, "results": result};
						}
						else {
							console.log('No data added for email: ' + userId);
							logger.log('info', 'No data added for email' + userId);
							json_responses = {"statusCode": 401};
						}
						res.send(json_responses);
					});
			});
		}
		else if(IsBidItem == 1) {
			mongo.connect(mongoURL, function () {
				console.log('Connected to mongo at: ' + mongoURL);
				var coll = mongo.collection('users');

				coll.update(
					{ EmailId: userId },
					{ $push: { ProductsForAuction: { $each: [productForBidding] } } }
					, function (err, result) {
						if (result) {
							console.log("Successful Added the products for direct sell.");
							console.log("Email :  " + userId);
							logger.log('info', 'Successful Added the user data  for email:' + userId);

							json_responses = {"statusCode": 200, "results": result};
						}
						else {
							console.log('No data added for email: ' + userId);
							logger.log('info', 'No data added for email' + userId);
							json_responses = {"statusCode": 401};
						}
						res.send(json_responses);
					});
			});
		}


	}
};