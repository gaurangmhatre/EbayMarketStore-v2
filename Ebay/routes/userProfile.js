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
	
	if(email != undefined ) {
		mongo.connect(mongoURL, function(){
			console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('users');
			coll.findOne({EmailId: email}, function(err, results){
				if (results) {
					console.log("Successful got the user data");
					console.log("Email :  " + email);
					logger.log('info','Successful got the user data  for email:' + email);

					json_responses = {"FirstName": results.FirstName
						,"LastName": results.LastName
						,"EmailId":results.EmailId
						,"Address":results.Address
						,"CreditCardNumber":results.CreditCardDetails
						,"DateOfBirth":results.DateOfBirth
						,"LastLoggedIn":results.LastLoggedIn
					};
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

exports.getAllProductsInCart = function(req,res){
	console.log("inside get All Products from cart for user: "+req.session.userid);
	
	var userId = req.session.userid;
	var flag=false;
	var j=0;
	if(userId != undefined) {
		mongo.connect(mongoURL, function(){
			console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('UserCart');

			coll.find({"userEmail": userId}).toArray(function(err, results){
				if (results) {

					console.log("Successful got the products for direct sell.");
					console.log("Email :  " + userId);
					logger.log('info','Successful got the user data  for email:' + userId);

                    var cartArray= [];

                    /*for (var i = 0; i < results.length; i++) {
						var ItemId= results[i].ItemId
                        var coll2 = mongo.collection('ProductsForDirectSell');
                        //coll2.find({_id: ItemId}).toArray(function(err, result) {
						coll2.find({ItemName: results[i].ItemName}).toArray(function(err, result) {
                            if (result) {
                                    cartArray.push(result);
									flag=true;
									j=i;
                            }

							if(j==results.length)
							{
								json_responses = {"statusCode": 200, "results": cartArray};
								res.send(json_responses);
							}

                        });

                    }*/
                    console.log(" cart item: "+results);
					json_responses = {"statusCode": 200, "results": results};
				}
				else {
					console.log('No data retrieved for email: ' + userId);
					logger.log('info','No data retrieved for email' + userId);
					json_responses = {"statusCode" : 401};
				}
			});

		});/*
		if(flag==true) {

		}*/
		res.send(json_responses);
	}
};

//Not complete
/*
*db.users.remove({'EmailId':"tim@gmail.com",'UserCart.ItemName':"Moto G 3",'UserCart.Qty':"3"},{ 'UserCart.ItemName':1  })
*
* */
exports.removeItemFromCart = function(req,res){
	console.log("Inside removeItemFromCart for user: "+req.session.userid);
	
	var userId = req.session.userid;
	var item = req.param("item");
	
	if(userId != undefined) {
		mongo.connect(mongoURL, function(){
			console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('UserCart');

			console.log('Connected to inside remove method');
			var itemid = item.ItemId;
			var itemName = item.ItemName;
			//coll.remove({ItemId:itemid}

			coll.remove({ItemName:itemName}
			),function(err, results){
				if (results) {
					console.log("Successful removed item from cart.");
					console.log("Email :  " + userId);
					logger.log('info','Successful removed item from cart.:' + userId);

					json_responses = {"statusCode" : 200, "results": results};
				}
				else {
					console.log('No data retrieved for email: ' + userId);
					logger.log('info','No data retrieved for email' + userId);
					json_responses = {"statusCode" : 401};
				}
				res.send(json_responses);
			};
		});

	}

};

exports.buyItemsInCart = function(req,res){

	var userId = req.session.userid;

	var creditCardNumber = req.param("CreditCardNumber");

	if(userId != undefined) {

        mongo.connect(mongoURL, function () {
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('UserCart');
			var callUser = mongo.collection('users');
			var callProducts = mongo.collection('ProductsForDirectSell');
            coll.find({"userEmail": userId}).toArray(function (err, results) {
                if (results) {
                    console.log("Successful got the products in cart.");
                    console.log("Email :  " + userId);
                    logger.log('info', 'Successful got the the products in cart for:' + userId);

                    for (var i = 0; i < results.length; i++) {
                        //push items to PurchasedProducts

						callUser.update(
                            {EmailId: userId},
                            {$push: {PurchasedProducts: {$each: [results[0]]}}}
                        )

						var id = new ObjectId(results[i].ItemId);
						callProducts.update({_id:id}, {
							$set: {
								"Qty": results[i].QtyAvailable - results[i].QtyInCart
							}
						})

						coll.remove({ItemName:results[i].ItemName}
						)

                        /*coll.find(
                         { PurchasedProducts:{ItemName: results[0].UserCart[i].ItemName}},
                         { $inc: { PurchasedProducts: { Qty:-1 } } }
                         )*/
                       /* coll.find({'ProductsForDirectSell.ItemName': results[0].UserCart[i].ItemName}).toArray(function (err, userWithProduct) {
                            if (userWithProduct) {
                                console.log("Successful got all the seller with product in list.");
                                console.log("Email :  " + userId);

                                //update qty
                                for (var i = 0; i < userWithProduct[0].UserCart.length; i++) {
                                    if (results[0].UserCart[i].ItemName == userWithProduct[0].UserCart.ItemName) {
                                        userWithProduct[0].UserCart.Qty = parseInt(userWithProduct[0].UserCart.Qty) - 1;
                                    }
                                }


                                //remove items from cart

                            }
                        });


                        coll.update(
                            {EmailId: userId},
                            {$inc: {quantity: -2, "metrics.orders": 1}}
                        )*/
                    }
                }
                else {
                    console.log('No data retrieved for email: ' + userId);
                    logger.log('info', 'No data retrieved for email' + userId);
                    json_responses = {"statusCode": 401};
                }
                res.send(json_responses);
            });
        })
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

function updateItemQty(ItemId) {

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
}

function removingItemFromCart(userId,ItemId) {

	console.log("Inside removeItem from cart method.")
		
/*	var RemovingItemFromCartQuery = "delete from usercart where UserId ="+userId+" and ItemId = "+ItemId+";";
	console.log("Query:: " + RemovingItemFromCartQuery);
	logger.log('info','Query:: ' + RemovingItemFromCartQuery);*/

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
}

//Select BidderId,max(BidAmount) from bidderList where ItemId = (select (ItemId) from Item where  IsBidItem =1  and AuctionEndDate < now());
exports.updateAuctionWinners = function(req,res){
	console.log("inside updateAuctionWinners");
	
	var getAuctionWinner = "Select BidderId,max(BidAmount) from bidderList where ItemId = (select (ItemId) from Item where  IsBidItem =1  and AuctionEndDate < now()) and IsWinner<>1;";
	console.log("Query:: " + getAuctionWinner);
	logger.log('info','Query:: ' + getAuctionWinner);
	mysql.fetchData(function(err,results) {
		if(err) {
			logger.log('error',err);
			throw err;
		}
		else {
			if(results.length > 0) {
					console.log("Successful got the sold products.");
					logger.log('info','Successful got the sold products for userId:: ' + userId);
					json_responses = results;
					}
			else{
					console.log("Invalid string.");
					json_responses = {"statusCode" : 401};
			}
			res.send(json_responses);
		}	
		
	},getAuctionWinner);
	

	if(userId != '') {
		var getAllUserBiddingActivityQuery = "select  i.ItemName, i.ItemDescription, i.Price, b.BidAmount,b.BidTime  from bidderList as b left join item as i  on b.ItemId=i.ItemId where BidderId = "+userId+" order by BidTime desc";
		console.log("Query:: " + getAllUserBiddingActivityQuery);
		logger.log('info','Query:: ' + getAllUserBiddingActivityQuery);

		mysql.fetchData(function(err,results) {
			if(err) {
				throw err;
			}
			else {
				if(results.length > 0) {
						console.log("Successful got the sold products.");
						
						json_responses = results;
						}
				else{
						console.log("Invalid string.");
						json_responses = {"statusCode" : 401};
				}
				res.send(json_responses);
			}	
			
		},getAllUserBiddingActivityQuery);
	}
}
 // Do not  remember why I wrote this.


exports.updatePaymentDetailsForAuction= function(req,res){
	console.log("Inside updatePaymentDetailsForAuction method.")
	var userId = req.session.userid;
	var creditCardNumber = req.param("CreditCardNumber");
	var ItemId = req.param("ItemId");

	if(userId != undefined) {
		var updatePaymentDetailsForAuctionQuery = "UPDATE `auctionwinners` SET `PaymentByCard` = " + creditCardNumber + ", `PaymentDate` = now(),`IsPaymentDone` = 1 WHERE `WinnerId` = " + userId + " and IsPaymentDone = 0;";
		console.log("Query:: " + updatePaymentDetailsForAuctionQuery);
		logger.log('info', 'Query:: ' + updatePaymentDetailsForAuctionQuery);
		mysql.storeData(updatePaymentDetailsForAuctionQuery, function (err, result) {
			//render on success
			if (!err) {
				console.log('Auction payment details updated for userId: ' + userId);
				logger.log('info', 'Auction payment details updated for userId: ' + userId);
				UpdateItemStatusToSold(ItemId);
				json_responses = {
					"statusCode": 200
				}

				//res.send(json_responses);
			}
			else {
				console.log('ERROR! Insertion not done');
				logger.log('error', err);
				throw err;

				var json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
		});
	}
    /*else {
        var json_responses = {"statusCode": 401};
        res.send(json_responses);
    }*/

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

	if(userId != undefined) {
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');

		coll.find({"EmailId": userId},{"EmailId":1,"BidPlacedOnProducts":1,"_id":0}).toArray(function(err, results){
			if (results) {
				console.log("Successful got the products for direct sell.");
				console.log("Email :  " + userId);
				logger.log('info','Successful got the user data  for email:' + userId);

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
	/*else {
	 var json_responses = {"statusCode": 401};
	 res.send(json_responses);
	 }*/
}




//History
exports.getAllUserDirectBuyingActivities= function(req,res){
	console.log("inside getAllUserDirectBuyingActivities for user: "+req.session.userid);

	var userId = req.session.userid;

	if(userId != undefined) {
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');

		coll.find({"EmailId": userId},{"EmailId":1,"PurchasedProducts":1,"_id":0}).toArray(function(err, results){
			if (results) {
				console.log("Successful got the products for direct sell.");
				console.log("Email :  " + userId);
				logger.log('info','Successful got the user data  for email:' + userId);

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
	/*else {
	 var json_responses = {"statusCode": 401};
	 res.send(json_responses);
	 }*/
};

//history
exports.getAllAuctionProductHistory= function(req,res){
	console.log("Inside getAllAuctionProductHistory method.")
	var userId = req.session.userid;

	if(userId != undefined) {
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');

		coll.find({"EmailId": userId},{"EmailId":1,"AuctionsWonOnProducts":1,"_id":0}).toArray(function(err, results){
			if (results) {
				console.log("Successful got the products for direct sell.");
				console.log("Email :  " + userId);
				logger.log('info','Successful got the user data  for email:' + userId);

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
    /*else {
        var json_responses = {"statusCode": 401};
        res.send(json_responses);
    }*/

}

//history
exports.getAllSoldProducts= function(req,res){
	
	console.log("inside getAllSoldProducts for user: "+req.session.userid);

	var userId = req.session.userid;
	
	if(userId != undefined) {
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');
		
		coll.find({"EmailId": userId},{"EmailId":1,"SoldProducts":1,"_id":0}).toArray(function(err, results){
			if (results) {
				console.log("Successful got the products for direct sell.");
				console.log("Email :  " + userId);
				logger.log('info','Successful got the user data  for email:' + userId);

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
	/*else {
	 var json_responses = {"statusCode": 401};
	 res.send(json_responses);
	 }*/
};

//history
exports.getAllUserBiddingActivity = function(req,res){
	console.log("inside getAllUserBiddingActivity for user: "+req.session.userid);

	var userId = req.session.userid;

	if(userId != undefined) {
		/*var getAllUserBiddingActivityQuery = "select  i.ItemName, i.ItemDescription, i.Price, b.BidAmount,b.BidTime  from bidderList as b left join item as i  on b.ItemId=i.ItemId where BidderId = "+userId+" order by BidTime desc";
		console.log("Query:: " + getAllUserBiddingActivityQuery);
		logger.log('info','Query:: ' + getAllUserBiddingActivityQuery);
		mysql.fetchData(function(err,results) {
			if(err) {
				logger.log('error',err);

				throw err;
			}
			else {
				if(results.length > 0) {
					console.log("Successful got the sold products.");
					logger.log('info','Successful got the sold products for userId:: ' + userId);
					json_responses = results;
				}
				else{
					console.log("Invalid string.");
					json_responses = {"statusCode" : 401};
				}
				res.send(json_responses);
			}

		},getAllUserBiddingActivityQuery);*/

		mongo.connect(mongoURL, function(){
			console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('users');

			coll.find({"EmailId": userId},{"EmailId":1,"BidPlacedOnProducts":1,"_id":0}).toArray(function(err, results){
				if (results) {
					console.log("Successful got the products for direct sell.");
					console.log("Email :  " + userId);
					logger.log('info','Successful got the user data  for email:' + userId);

					json_responses = {"statusCode" : 200, "results": results};
				}
				else {
					console.log('No data retrieved for email: ' + userId);
					logger.log('info','No data retrieved for email' + userId);
					json_responses = {"statusCode" : 401};
				}
				res.send(json_responses);
			});
		});
	}
	/*else {
	 var json_responses = {"statusCode": 401};
	 res.send(json_responses);
	 }*/
}

