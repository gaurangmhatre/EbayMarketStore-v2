var mysql = require('./mysql');
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

exports.accountdetails = function(req,res){
	
	//res.render('userProfile',{validationMessage:'Empty Message'});

	//Checks before redirecting whether the session is valid
	if(req.session.userid)
	{
		//Set these headers to notify the browser not to maintain any cache for the page being loaded
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		//res.render("homepage",{userid:req.session.userid});
		res.render('userProfile',{validationMessage:'Empty Messgage'});
	}
	else
	{
		res.redirect('/signin');
	}


};

exports.getUserAccountDetails = function(req,res){
	
	console.log("userId: "+req.session.userid);
	
	var email = req.session.userid;
	var msg_payload = {"email":email};
	if(email != undefined ) {
		mq_client.make_request('accountDetails_queue',msg_payload, function(err,results){

			console.log(results.statusCode);
			if(err){
				throw err;
			}
			else
			{
				if(results.statusCode == 200){
					console.log("valid Login");
					res.send(results.json_responses);
				}
				else {
					console.log("Invalid Login");
					res.send({"statusCode" : 401});
				}
			}
		});
	}
	else {
		//var json_responses = {"statusCode": 401};
		res.send({"statusCode": 401});
	}
};

exports.getAllProductsInCart = function(req,res){
	console.log("inside get All Products from cart for user: "+req.session.userid);
	
	var email = req.session.userid;

	var msg_payload = {"email":email};
	if(email != undefined) {

		mq_client.make_request('getItemFromCart_queue',msg_payload, function(err,results){

			console.log(results.statusCode);
			if(err){
				throw err;
			}
			else
			{
				if(results.json_responses.statusCode == 200){
					console.log("Got art Items.");
					res.send(results.json_responses);
				}
				else {
					console.log("No items in cart");
					res.send({"statusCode" : 401});
				}
			}
		});

	}
};

//Not complete
/*
*db.users.remove({'EmailId':"tim@gmail.com",'UserCart.ItemName':"Moto G 3",'UserCart.Qty':"3"},{ 'UserCart.ItemName':1  })
*
* */

exports.removeItemFromCart = function(req,res){
	console.log("Inside removeItemFromCart for user: "+req.session.userid);
	
	var emailId = req.session.userid;
	var item = req.param("item");
	var msg_payload= {"emailId":emailId,"itemName":item.ItemName};


	if(emailId != undefined) {

		mq_client.make_request('removeItemFromCart_queue',msg_payload, function(err,results){

			console.log(results.statusCode);
			if(err){
				throw err;
			}
			else			{
				if(results.statusCode == 200){
					console.log("removed ite from the cart.");
					res.send(results.json_responses);
				}
				else {
					console.log("Error! removing item from cart.");
					res.send({"statusCode" : 401});
				}
			}
		});
	}
};

exports.buyItemsInCart = function(req,res){

	var userId = req.session.userid;
	var msg_payload= {"userId":userId};
	var creditCardNumber = req.param("CreditCardNumber");

	if(userId != undefined) {

		mq_client.make_request('buyItemsInCart_queue',msg_payload, function(err,results){

			console.log(results.statusCode);
			if(err){
				throw err;
			}
			else{
				if(results.statusCode == 200){
					console.log("Success while buying items in cart.");
					res.send(results.json_responses);
				}
				else {
					console.log("Error! while buying items from cart.");
					res.send({"statusCode" : 401});
				}
			}
		});
    }

}

/*function AddItemsToPurchasedProducts(userId,item)
{
	mongo.connect(mongoURL, function(){
		var coll = mongo.collection('users');

					coll.update(
						{ EmailId: userId },
						{ $push: { PurchasedProducts: { $each: item} } }
					)

		});
}*/

/*
function AddItemToSoldTable(Item) {

	console.log("Inside addItemTOSoldTable method.")

	var addItemToSoldTableQuery = "INSERT INTO sold(ItemId,BuyerId,SoldDate,Qty,PaymentByCard)VALUES("+ItemId+","+userId+",NOW(),1,'"+creditCardNumber+"');";
	console.log("Query:: " + addItemToSoldTableQuery);
	logger.log('info','Query:: ' + addItemToSoldTableQuery);
	mysql.storeData(addItemToSoldTableQuery, function(err, result){
		//render on success
		if(!err){
			console.log('New item successfully bought by user!');
			logger.log('info','New item successfully bought by userId:: ' + userId);
							json_responses = {
					"statusCode" : 200
				}
				//res.send(json_responses);
		}
		else{
			console.log('ERROR! Insertion not done');
			logger.log('error',err);
			throw err;
		}
	});
}
*/

/*function updateItemQty(ItemId) {

	console.log("Inside updateItemQty method.")
		
	var updateItemQtyQuery = "UPDATE ebay.item SET Qty=Qty-1  WHERE ItemId = "+ItemId;
	console.log("Query:: " + updateItemQtyQuery);
	logger.log('info','Query:: ' + updateItemQtyQuery);

	mysql.storeData(updateItemQtyQuery, function(err, result){
		//render on success
		if(!err){
			console.log('Item Qty updated!');
			logger.log('info','Item Qty updated');
				json_responses = {
					"statusCode" : 200
				}
				//res.send(json_responses);
		}
		else{
			console.log('ERROR! Insertion not done');
			logger.log('error',err);
			throw err;
		}
	});
}*/

/*function removingItemFromCart(userId,ItemId) {

	console.log("Inside removeItem from cart method.");
	mysql.deleteData(RemovingItemFromCartQuery, function(err,results) {
		if(err) {
				console.log("Error in deleteData");
				logger.log('error',err);
				console.log(err);
				throw err;
			}
		else {
			console.log("successfully removed items from the cart");
			console.log(results);
			console.log(results.affectedRows);
			logger.log('info','successfully removed items from the cart for userId:: ' + userId);
			if(results.affectedRows >0) {
				json_responses = {
					"statusCode" : 200,
					"results" : results
				}
				//res.send(json_responses);
			}
			else{
				json_responses = {
					"statusCode" : 401
				}
				//res.send(json_responses);
			}
		}
	});
}*/

//Select BidderId,max(BidAmount) from bidderList where ItemId = (select (ItemId) from Item where  IsBidItem =1  and AuctionEndDate < now());
exports.updateAuctionWinners = function(req,res){
	console.log("inside updateAuctionWinners");

	/*1. get all the products from auction where Winner =userId and IsAuctionOver == true and Payed== false
	* */




}

exports.updatePaymentDetailsForAuction= function(req,res){
	console.log("Inside updatePaymentDetailsForAuction method.")
	var userId = req.session.userid;
	var creditCardNumber = req.param("CreditCardNumber");
	var ItemId = req.param("ItemId");

	/* 1. update user, add the product to user collection
	* 2. payed in statue true
	* */

	if(userId != undefined) {
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('productsForAuction');
		var collProducts= mongo.collection('productsForAuction');
		var collUser= mongo.collection('users');
		coll.find({"MaxBidder": userId, "IsAuctionOver":true}).toArray(function(err, results){
			if (results) {
				console.log("Successful got the products for auction sell.");
				console.log("Email :  " + userId);
				logger.log('info','Successful got the user auction  for email:' + userId);


				for (var i = 0; i < results.length; i++) {
					var id = new ObjectId(results[i]._id);

					collProducts.update({_id: id,"IsPayed": false}, {
							$set: {
								"IsPayed": true
							}},
						{upsert:true}
					)

					collUser.update(
						{EmailId: results[i].MaxBidder},
						{$push: {AuctionsWonOnProducts: {$each: [results[0]]}}}
					)


				}





				json_responses = {"statusCode" : 200, "results": results};
			}
			else {
				console.log('No data retrieved for email: ' + userId);
				logger.log('info','No data retrieved for email' + userId);
				json_responses = {"statusCode" : 401};
			}
			res.send(json_responses);
		});
	}

}

function UpdateItemStatusToSold(ItemId) {

	console.log("Inside UpdateItemStatusToSold method.")

	var updateItemStatusToSoldQuery = "UPDATE `ebay`.`item`	SET `Sold` = 1 WHERE `ItemId` = "+ItemId +";";
	console.log("Query:: " + updateItemStatusToSoldQuery);
	logger.log('info','Query:: ' + updateItemStatusToSoldQuery);
	mysql.storeData(updateItemStatusToSoldQuery, function(err, result){
		//render on success
		if(!err){
			console.log('Item is sold!');
			logger.log('info','Item is sold :: ' +ItemId);
			json_responses = {
				"statusCode" : 200
			}
			//res.send(json_responses);
		}
		else{
			console.log('ERROR! Insertion not done');
			logger.log('error',err);

			throw err;
		}
	});
}

exports.getAllWonAuctions= function(req,res){
	console.log("inside getAllWonAuctions for user: "+req.session.userid);

	var userId = req.session.userid;
	var msg_payload = {"userId":userId};
	if(userId != undefined) {

		mq_client.make_request('getAllWonAuctions_queue',msg_payload, function(err,results){

			console.log(results.json_responses.statusCode);
			if(err){
				throw err;
			}
			else{
				if(results.json_responses.statusCode == 200){
					console.log("Got user Products won!");
					res.send(results.json_responses);
				}
				else {
					console.log("No products won. Start Bidding.");
					res.send({"statusCode" : 401});
				}
			}
		});
	}
	/*else {
	 var json_responses = {"statusCode": 401};
	 res.send(json_responses);
	 }*/
}

//History
exports.getAllUserDirectBuyingActivities= function(req,res){
	console.log("inside getAllUserDirectBuyingActivities for user: "+req.session.userid);

	var userId = req.session.userid;
	var msg_payload = {"email":userId};
	if(userId != undefined) {
		mq_client.make_request('allUserDirectBuyingActivities_queue',msg_payload, function(err,results){

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
	
	/*else {
	 var json_responses = {"statusCode": 401};
	 res.send(json_responses);
	 }*/
};

//history
exports.getAllAuctionProductHistory= function(req,res){
	console.log("Inside getAllAuctionProductHistory method.")
	var userId = req.session.userid;
	var msg_payload = {"email":userId};
	
	if(userId != undefined) {
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');

		mq_client.make_request('allAuctionProductHistory_queue',msg_payload, function(err,results){

			console.log(results.json_responses.statusCode);
			if(err){
				throw err;
			}
			else
			{
				if(results.json_responses.statusCode == 200){
					console.log("Got user Products data for auction products");
					res.send(results.json_responses);
				}
				else {
					console.log("No auction products data.");
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

//history
exports.getAllSoldProducts= function(req,res){
	
	console.log("inside getAllSoldProducts for user: "+req.session.userid);

	var userId = req.session.userid;
	var msg_payload = {"email":userId};

	if(userId != undefined) {
		console.log('Connected to mongo at: ' + mongoURL);

		mq_client.make_request('allSoldProducts_queue',msg_payload, function(err,results){

			console.log(results.json_responses.statusCode);
			if(err){
				throw err;
			}
			else
			{
				if(results.json_responses.statusCode == 200){
					console.log("Got user Products data for sold products");
					res.send(results.json_responses);
				}
				else {
					console.log("No auction sold products data.");
					res.send({"statusCode" : 401});
				}
			}
		});
	}
	/*else {
	 var json_responses = {"statusCode": 401};
	 res.send(json_responses);
	 }*/
};

//history
exports.getAllUserBiddingActivity = function(req,res){
	console.log("inside getAllUserBiddingActivity for user: "+req.session.userid);

	var userId = req.session.userid;
	var msg_payload = {"email":userId};
	if(userId != undefined) {
		console.log('Connected to mongo at: ' + mongoURL);

		mq_client.make_request('allUserBiddingActivity_queue',msg_payload, function(err,results){

			console.log(results.json_responses.statusCode);
			if(err){
				throw err;
			}
			else
			{
				if(results.json_responses.statusCode == 200){
					console.log("Got user Products data for Bidding products");
					res.send(results.json_responses);
				}
				else {
					console.log("No auction Bidding products data.");
					res.send({"statusCode" : 401});
				}
			}
		});

	}
}

