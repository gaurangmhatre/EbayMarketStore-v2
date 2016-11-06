var mysql = require('./mysql');
var winston = require('winston');
var ObjectId = require('mongodb').ObjectId;

var mongo = require('./mongo.js');
var mongoURL = "mongodb://localhost:27017/ebay";

var mq_client = require('../rpc/client');

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)(),
		new (winston.transports.File)({ filename: 'ebayLog.log' })
	]
});

var EventLogger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)(),
		new (winston.transports.File)({ filename: 'ebayEventLog.log' })
	]
});

exports.getProductsPage = function(req,res){
		res.render('products',{validationMessage:'Empty Messgage'});
};

exports.getAllProducts = function(req,res){
	console.log("In getAllProducts.");

	console.log("userId: "+req.session.userid);

	var email = req.session.userid;
	var msg_payload = {"email":email};
	if(email != undefined ) {

		if(email != undefined) {
			mq_client.make_request('allProducts_queue',msg_payload, function(err,results){

				console.log(results.json_responses.statusCode);
				if(err){
					throw err;
				}
				else
				{
					if(results.json_responses.statusCode == 200){
						console.log("Got user Products data for direct sell products");
						res.send(results.json_responses);
					}
					else {
						console.log("No products data for direct sell products");
						res.send({"statusCode" : 401});
					}
				}
			});
		}
		else {
			//var json_responses = {"statusCode": 401};
			res.send({"statusCode": 401});
		}
	}
	else {
		var json_responses = {"statusCode": 401};
		res.send(json_responses);
	}
};

exports.getAllProductsForAuction = function(req,res){
	console.log("In getAllProductsForAuction.");

	console.log("userId: "+req.session.userid);

	var email = req.session.userid;
	var msg_payload = {"email":email};
	if(email != undefined ) {
		mq_client.make_request('allProductsForAuction_queue',msg_payload, function(err,results){
			console.log(results.json_responses.statusCode);
			if(err){
				throw err;
			}
			else
			{
				if(results.json_responses.statusCode == 200){
					console.log("Got user Products data for auction products.");
					res.send(results.json_responses);
				}
				else {
					console.log("No products data for auction products.");
					res.send({"statusCode" : 401});
				}
			}
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
	
	Product.Qty="1";

	var msg_payload = {"ItemId":ItemId, "userEmail":UserId ,"QtyInCart": QtyInCart ,"ItemName":ItemName, "ItemDescription":ItemDescription,"Price":Price,"QtyAvailable":QtyAvailable,"DateAdded":DateAdded,"Seller":Seller};

	console.log("Add to cart for: "+UserId+" itemId: "+Product._id+" Qty:"+QtyInCart );
	logger.log('info', "Add to cart for: "+UserId+" itemId: "+Product._id+" Qty:"+QtyInCart);



	if(UserId != undefined ) {
		mq_client.make_request('userAddToCart_queue',msg_payload, function(err,results){
			console.log(results.json_responses.statusCode);
			if(err){
				throw err;
			}
			else
			{
				if(results.json_responses.statusCode == 200){
					console.log("Got user cart data  products.");
					res.send(results.json_responses);
				}
				else {
					console.log("No products in cart.");
					res.send({"statusCode" : 401});
				}
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

	var msg_payload = {"Item":Item, "BidAmount":BidAmount ,"UserId": UserId};

	if(UserId != undefined ) {
		mq_client.make_request('addBidOnProduct_queue',msg_payload, function(err,results){
			console.log(results.json_responses.statusCode);
			if(err){
				throw err;
			}
			else
			{
				if(results.json_responses.statusCode == 200){
					console.log("Got user cart data  products.");
					res.send(results.json_responses);
				}
				else {
					console.log("No products in cart.");
					res.send({"statusCode" : 401});
				}
			}
		})
	}
	else {
		var json_responses = {"statusCode": 401};
		res.send(json_responses);
	}
};

/*exports.getItemType = function(req,res){
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
	
};*/

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

	var msg_payload= {"ItemName":ItemName,"ItemDescription":ItemDescription,"Price":Price,"Qty":Qty,"DateAdded":CurrentDate,"Seller":userId};

	var msg_payloadForAuction= {"ItemName":ItemName,"ItemDescription":ItemDescription,"Price":Price,"Qty":Qty,"DateAdded":CurrentDate,"Seller":userId , "AuctionEndDate":AuctionEndDate};

	AuctionEndDate.setDate(AuctionEndDate.getDate()+4);

	console.log(AuctionEndDate);

	if(userId != undefined ) {
		if (IsBidItem == 0) {
			/*mongo.connect(mongoURL, function () {
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
			 });*/
			mq_client.make_request('addProductForDirectSell_queue',msg_payload, function(err,results){
				console.log(results.json_responses.statusCode);
				if(err){
					throw err;
				}
				else
				{
					if(results.json_responses.statusCode == 200){
						console.log("Product added.");
						res.send(results.json_responses);
					}
					else {
						console.log("No products added.");
						res.send({"statusCode" : 401});
					}
				}
			})

		}
		else if(IsBidItem == 1) {
			mongo.connect(mongoURL, function () {
				console.log('Inside productsForAuction Connected to mongo at: ' + mongoURL);
				mq_client.make_request('addProductForAuction_queue',msg_payloadForAuction, function(err,results){
					console.log(results.json_responses.statusCode);
					if(err){
						throw err;
					}
					else
					{
						if(results.json_responses.statusCode == 200){
							console.log("Product added for auction.");
							res.send(results.json_responses);
						}
						else {
							console.log("No products added to auction.");
							res.send({"statusCode" : 401});
						}
					}
				})
			});
		}
	}
};

exports.labProducts = function(req,res){
	console.log("Inside logger.");
	EventLogger.log('info', req.session.userid +"userOver Product" +new Date());
};
