/**
 * Module dependencies.
**/

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')  
  , calculator = require('./routes/calculator')
  , home = require('./routes/home')
  , userProfile = require('./routes/userProfile')
  , session = require('client-sessions')
  , products = require('./routes/products')
  , mongo = require('./routes/mongo');

var passport = require('passport');
require('./routes/passport')(passport);

//var session = require('client-sessions');
var expressSessions = require("express-session");

var mongoStore = require("connect-mongo/es5")(expressSessions);

var mongoSessionConnectURL = "mongodb://localhost:27017/ebay";

var app = express();

// all environments

//configure the sessions with our application
app.use(session({
	  
	cookieName: 'session',    
	secret: 'cmpe273_test_string',    
	duration: 30 * 60 * 1000,    //setting the time for active session
	activeDuration: 5 * 60 * 1000,  })); // setting time for the session to be active when the window is open // 5 minutes set currently

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//add middleware
//app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.use(express.favicon());


//app.use(express.logger('dev'));

//parse json
app.use(express.bodyParser());
app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));

/*

app.use(expressSessions({
	secret: "CMPE273_passport",
	resave: false,
	saveUninitialized: false,
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 6 * 1000,
	store: new mongoStore({
		url: mongoSessionConnectURL
	})
}));
*/

// development only // default error handler
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



//app.get('/', products.getProductsPage);
app.get('/', home.redirectToHome);

app.get('/signup',home.signup);
app.get('/signin',home.signin);

app.post('/checksignup',home.checksignup);
app.post('/checksignupWithConnectionPool',home.checksignupWithConnectionPool);
app.post('/checksignupWithoutRabbitMQ',home.checksignupWithoutRabbitMQ);


app.post('/afterSignup',home.afterSignup);

//app.post('/checklogin',home.checklogin);// change this method.

app.use(passport.initialize());
///***************passport****/
app.post('/checklogin', function(req, res,next) {
	passport.authenticate('login', function(err, user, info) {
		if(err) {
			return next(err);
		}

		if(!user) {
			response={"statusCode" : 401};
			res.send(response);
			return res.redirect('/');
		}

		req.logIn(user, {session:false}, function(err) {
			if(err) {
				return next(err);
			}

			req.session.userid = user.EmailId; //userid  = EmailId
			console.log("session initilized");
			//change to json responce
			var json_responses = {"statusCode": 200};
			res.send(json_responses);
		})
	})(req, res, next);
});

app.get('/', isAuthenticated, function(req, res) {
	//res.render('successLogin', {user:{username: req.session.userid}});
	//change to json responce
	var json_responses = {"statusCode": 200};
	res.send(json_responses);
});

function isAuthenticated(req, res, next) {
	Console.log('inside isAuthenticated.');
	if(req.session.userid) {
		console.log(req.session.userid);
		return next();
	}

	res.redirect('/');
};

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
	Console.log('inside app.use.');
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});*/

// error handlers

// development error handler
// will print stacktrace
/*if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}*/

// production error handler
// no stacktraces leaked to user
/*
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});
*/

/*******/

app.post('/signout',home.signout);


app.get('/userProfile',userProfile.accountdetails);
app.post('/getUserAccountDetails',userProfile.getUserAccountDetails);
app.post('/getAllProductsInCart',userProfile.getAllProductsInCart);
app.post('/removeItemFromCart',userProfile.removeItemFromCart);
app.post('/buyItemsInCart',userProfile.buyItemsInCart);
app.post('/getAllUserDirectBuyingActivities',userProfile.getAllUserDirectBuyingActivities);
app.post('/getAllSoldProducts',userProfile.getAllSoldProducts);
app.post('/getAllUserBiddingActivity',userProfile.getAllUserBiddingActivity);

app.post('/getAllWonAuctions',userProfile.getAllWonAuctions);
app.post('/updatePaymentDetailsForAuction',userProfile.updatePaymentDetailsForAuction);
app.post('/getAllAuctionProductHistory',userProfile.getAllAuctionProductHistory);

//testing
/*
app.post('/getUserAccountDetailsWithConnetionPool',userProfile.getUserAccountDetailsWithConnetionPool);
app.post('/getUserAccountDetailsWithoutConnetionPool',userProfile.getUserAccountDetailsWithoutConnetionPool);
*/


app.get('/products',products.getProductsPage);
app.post('/getAllProducts',products.getAllProducts);
app.post('/getAllProductsForAuction',products.getAllProductsForAuction);
app.post('/userAddToCart',products.userAddToCart);
app.post('/addBidOnProduct',products.addBidOnProduct);
/*app.post('/getItemType',products.getItemType);*/
app.post('/addProduct',products.addProduct);

app.post('/labProducts',products.labProducts);

app.get('/accountDetails', function (req, res) {
    res.sendfile(__dirname +'/public/templates/userProfile/accountDetails.html');
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


/*
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
*/


//connect to the mongo collection session and then createServer
mongo.connect(mongoSessionConnectURL, function(){
	console.log('Connected to mongo at: ' + mongoSessionConnectURL);
	http.createServer(app).listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
	});
});
