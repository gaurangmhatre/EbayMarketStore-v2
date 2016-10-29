var mysql = require('./mysql');
var winston = require('winston');
var ObjectId = require('mongodb').ObjectId;

var mongo = require('./mongo.js');
var mongoURL = "mongodb://localhost:27017/ebay";

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)(),
		new (winston.transports.File)({ filename: 'ebayLog.log' })
	]
});

exports.getProductsPage = function(req,res){
		res.render('products',{validationMessage:'Empty Messgage'});
};

exports.getAllProducts = function(req,res){
	console.log("In getAllProducts.");

	console.log("userId: "+req.session.userid);

	var email = req.session.userid;

	if(email != undefined ) {

		mongo.connect(mongoURL, function(){
			console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('ProductsForDirectSell');

			coll.find({Qty:{ $gt: 0 }}).toArray(function(err, results){
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
			var coll = mongo.collection('productsForAuction');

			coll.find({}).toArray(function(err, results){
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
	var QtyInCart = req.param("qtyInCart");
	var UserId =  req.session.userid;

	var ItemId =  new ObjectId(Product._id);
	var ItemName  = Product.ItemName
	var ItemDescription = Product.ItemDescription
	var Price = Product.Price
	var QtyAvailable = Product.Qty
	var DateAdded = Product.DateAdded
	var Seller = Product.Seller


	console.log("Add to cart for: "+UserId+" itemId: "+Product._id+" Qty:"+QtyInCart );
	logger.log('info', "Add to cart for: "+UserId+" itemId: "+Product._id+" Qty:"+QtyInCart);

	Product.Qty="1";

	if(UserId != undefined ) {
		mongo.connect(mongoURL, function () {
			console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('UserCart');

			coll.insert({"ItemId":ItemId, "userEmail":UserId ,"QtyInCart": QtyInCart ,"ItemName":ItemName, "ItemDescription":ItemDescription,"Price":Price,"QtyAvailable":QtyAvailable,"DateAdded":DateAdded,"Seller":Seller}), function (err, results) {
				if (results) {
					console.log("Successful updated the cart.");
					console.log("Email :  " + UserId);
					logger.log('info', 'Successful updated the cart email:' + UserId);
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
	/*get the product  done
	* get the userId done
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
				res.send(json_responses);
			}
		})
	}
	else {
		var json_responses = {"statusCode": 401};
		res.send(json_responses);
	}
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

	var CurrentDate = new Date();
	var AuctionEndDate = new Date();

	//AuctionEndDate.setDate(AuctionEndDate+4);

	console.log(AuctionEndDate);
	//var product = ItemName: ItemName, ItemDescription: ItemDescription, Price: Price, Qty:Qty, DateAdded: new Date(),Seller : userId};

	//var productForBidding = {ItemName: ItemName, ItemDescription: ItemDescription, Price: Price, Qty:Qty, DateAdded: new Date(), DateAdded: $date ,AuctionEndDate:{ $add: [ "$date", 4*24*60*60000 ] }};

	if(userId != undefined ) {
		if (IsBidItem == 0) {
			mongo.connect(mongoURL, function () {
				console.log('Connected to mongo at: ' + mongoURL);
				var coll = mongo.collection('ProductsForDirectSell');

				coll.insert({ItemName: ItemName, ItemDescription: ItemDescription, Price: Price, Qty:Qty, DateAdded: CurrentDate, Seller : userId }
				), function (err, result) {
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
					}
			});
		}
		else if(IsBidItem == 1) {
			mongo.connect(mongoURL, function () {
				console.log('Inside productsForAuction Connected to mongo at: ' + mongoURL);
				var coll = mongo.collection('productsForAuction');

				//coll.insert({ItemName: ItemName, ItemDescription: ItemDescription, Price: Price, Qty:1, DateAdded: currentDate, AuctionEndDate:{ $add: [ currentDate, 4*24*60*60000 ] }, Seller: userId}
				coll.insert({ItemName: ItemName, ItemDescription: ItemDescription, Price: Price, Qty:1, DateAdded: CurrentDate, AuctionEndDate:AuctionEndDate, Seller: userId}
				),function (err, result) {
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
				};
			});
		}
	}
};