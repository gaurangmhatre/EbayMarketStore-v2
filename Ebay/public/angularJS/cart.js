
userProfile.controller('cartController', function($scope,$http) {
	
	$scope.unexpected_error = true;

	console.log("inside cart controller");
	
	initialize();
	
	function initialize(){
		$scope.TotalCostOfCart=0;
		$scope.visibleTransactionDiv = false;
		$scope.donotloadtemplate=true;
		//console.log("userId:: " + $scope.userId)
	
		
		$http({
			method : "POST",
			url : '/getAllProductsInCart',//change the method to get 10 items at a time.
			data : {
				
			}
		}).success(function(data) {
			console.log("inside success");
			console.log("data is ::");
			console.log(data);
			$scope.TotalCostOfCart=0
			$scope.allProductsInCart = data;
			
			
			for(product in $scope.allProductsInCart)
			{
				$scope.TotalCostOfCart = $scope.TotalCostOfCart+$scope.allProductsInCart[product].Price;				
			}
			
			if($scope.TotalCostOfCart>0)
			{
					$scope.donotloadtemplate= false;
			}
			
			//set all variables.
				 
		}).error(function(error) {
			console.log("inside error");
			console.log(error);
			$scope.unexpected_error = false;
			$scope.invalid_login = true;
			$window.alert("unexpected_error");
		});
		
		//For getting the creditCard Number and address.
		$http({
			method : "POST",
			url : '/getUserAccountDetails',
			data : {
				"userId": $scope.userId //pass userId via session.
			}
		}).success(function(data) {
			console.log("inside success");
			console.log("data is ::");
			console.log(data);
			
			
			/*$scope.UserId = data.UserId;
			$scope.FirstName = data.FirstName;
			$scope.LastName = data.LastName;
			$scope.EmailId = data.EmailId;*/
			if(data.Address!="undefined")
			{
				$scope.Address = data.Address;
			}

			if(data.CreditCardNumber!="undefined")
			{
				$scope.CreditCardNumber = data.CreditCardNumber;
			}
			//set all variables.
				 
		}).error(function(error) {
			console.log("inside error");
			console.log(error);
			$scope.unexpected_error = false;
			$scope.invalid_login = true;
			$window.alert("unexpected_error");
		});
		
		
		
		
	}

	$scope.removeItemFromTheCart = function(itemId) {
		
		 $http({
			method : "POST",
			url : '/removeItemFromCart',
			data : {
				"itemId" : itemId,		
		}
		}).success(function(data) {
			console.log("inside success");
			console.log("Item is removed::");
			console.log(data);
			initialize();
			window.location.assign("#/cart");
			//set all variables.
				 
		}).error(function(error) {
			console.log("inside error");
			console.log(error);
			$scope.unexpected_error = false;
			$scope.invalid_login = true;
			$window.alert("unexpected_error");
			initialize();
		});	
	}
	
	$scope.checkout= function(){
		if($scope.TotalCostOfCart>0) {
			$scope.visibleTransactionDiv = true;
		}
	}
	
	$scope.buyItemsInCart = function(CreditCardNumber,Address){
		console.log("Inside place the order method.");

		if(CreditCardNumber.length==16) {
			$http({
				method: "POST",
				url: '/buyItemsInCart',
				data: {
					Address: Address,
					CreditCardNumber: CreditCardNumber
				}
			}).success(function (data) {
				console.log("inside success");
				console.log("Order is placed.");
				console.log(data);
				initialize();
				window.location.assign("#/activity");
				//set all variables.

			}).error(function (error) {
				console.log("inside error");
				console.log(error);
				$scope.unexpected_error = false;
				$scope.invalid_login = true;
				$window.alert("unexpected_error");
				initialize();
			});
		}
		else{
			alert("You must enter valid 16 digit Credit Card number.");
		}
	}
});