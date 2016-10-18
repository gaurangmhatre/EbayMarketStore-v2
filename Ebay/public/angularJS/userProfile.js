var userProfile = angular.module('userProfile', ['ngRoute']);


userProfile.config(['$routeProvider',
            function ($routeProvider) {
                $routeProvider.  
	                when('/', {// default path
	                	templateUrl: '/templates/userProfile/accountDetails.html',
                        controller: 'accountDetailsController'
	    			}).
                    when('/accountDetails', {
                        templateUrl: '/templates/userProfile/accountDetails.html',
                        controller: 'accountDetailsController'
                    }).
                    when('/activity', {
                        templateUrl: '/templates/userProfile/activity.html',
                        controller: 'activityController'
                    }).
                    when('/cart', {
                        templateUrl : '/templates/userProfile/cart.html',
                        controller: 'cartController'
                    }).
                    when('/sellItem', {
                        templateUrl : '/templates/userProfile/sellItem.html',
                        controller : 'sellItemController'
                    }).
                	when('/auctionWon',{
                		templateUrl : '/templates/userProfile/AuctionWon.html',
                       controller : 'auctionWonController'
                	});
            }]);




