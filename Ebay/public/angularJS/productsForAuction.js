products.controller('productsForAuction', function($scope, $filter, $http) {

	
		$scope.unexpected_error = true;

		console.log("inside productsForAuction controller");
	
		//console.log("userId:: " + $scope.userId)
		$scope.NoMaxBidAmount = true;
		$scope.NoBidmoreThanProductCost = true;
		$scope.NoBidPlaced  = true;
		
		$http({
			method : "POST",
			url : '/getAllProductsForAuction',//change the method to get 10 items at a time.
			data : {
				
			}
		}).success(function(data) {
			console.log("inside success");
			console.log("data is ::");
			console.log(data);
			
			$scope.allProductsForAuction = data.results;
			/*
			$scope.allProducts = [];

			angular.forEach(data.results, function(result, key){
				angular.forEach(result.ProductsForAuction, function(product, key) {
					$scope.allProductsForAuction.push(product);
				});
			});*/
			
			//set all variables.
				 
		}).error(function(error) {
			console.log("inside error");
			console.log(error);
			$scope.unexpected_error = false;
			$scope.invalid_login = true;
			$window.alert("unexpected_error");
		});

		
		$scope.addBidOnProduct = function(Item,BidAmount,MaxBidAmount,Price) {
			
			console.log("Selected ItemId : "+Item.ItemId);
			if(Price<BidAmount) {
				if((MaxBidAmount==undefined) ||  MaxBidAmount<BidAmount ) {
					//alert("Bid placed!!");
					$scope.NoBidPlaced  = false;
					$scope.NoMaxBidAmount = true;
					$scope.NoBidmoreThanProductCost = true;
					$http({
						method: "POST",
						url: '/addBidOnProduct',//change the method to get 10 items at a time.
						data: {
							"Item": Item,
							"BidAmount": BidAmount
						}
					}).success(function (data) {
						console.log("inside success");
						console.log("data is ::");
						console.log(data);

						window.location.assign("/products");
						//set all variables.

					}).error(function (error) {
						console.log("inside error");
						console.log(error);
						$scope.unexpected_error = false;
						$scope.invalid_login = true;
						$window.alert("unexpected_error");
					});
				}
				else{
					//alert("Your bid amount should be more than max bid amount.");
					$scope.NoMaxBidAmount = false;
					$scope.NoBidmoreThanProductCost = true;
					$scope.NoBidPlaced  = true;
				}
			}
			else{
				//alert("Your bid amount should be more than product cost.")
				$scope.NoMaxBidAmount = true;
				$scope.NoBidmoreThanProductCost = false;
				$scope.NoBidPlaced  = true;
			}
			
		}

		
});