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
  , products = require('./routes/products');

var app = express();

// all environments


//configure the sessions with our application
app.use(session({   
	  
	cookieName: 'session',    
	secret: 'cmpe273_test_string',    
	duration: 30 * 60 * 1000,    //setting the time for active session
	activeDuration: 5 * 60 * 1000,  })); // setting time for the session to be active when the window is open // 5 minutes set currently

app.set('port', process.env.PORT || 3000);

//__dirname is the name of the directory that the currently executing script resides in.
app.set('views', __dirname + '/views');

//Setting View Engine
app.set('view engine', 'ejs');

//add middleware
//app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.use(express.favicon());


//app.use(express.logger('dev'));

//parse json
app.use(express.bodyParser());

//app.use(express.methodOverride());

//sets router folder
app.use(app.router);

//To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express.
//http://localhost:3000/stylesheets/style.css
app.use(express.static(path.join(__dirname, 'public')));

// development only // default error handler
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', products.getProductsPage);
app.get('/', home.redirectToHome);

app.get('/signup',home.signup);
app.get('/signin',home.signin);

app.post('/checksignup',home.checksignup);
app.post('/afterSignup',home.afterSignup);

app.post('/checklogin',home.checklogin);
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
app.post('/getUserAccountDetailsWithConnetionPool',userProfile.getUserAccountDetailsWithConnetionPool);
app.post('/getUserAccountDetailsWithoutConnetionPool',userProfile.getUserAccountDetailsWithoutConnetionPool);


app.get('/products',products.getProductsPage);
app.post('/getAllProducts',products.getAllProducts);
app.post('/getAllProductsForAuction',products.getAllProductsForAuction);
app.post('/userAddToCart',products.userAddToCart);
app.post('/addBidOnProduct',products.addBidOnProduct);
app.post('/getItemType',products.getItemType);
app.post('/addProduct',products.addProduct)


app.get('/accountDetails', function (req, res) {
    res.sendfile(__dirname +'/public/templates/userProfile/accountDetails.html');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

