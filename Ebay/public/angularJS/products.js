var products = angular.module('products',[]);

products.controller('products', function($scope, $filter, $http) {

		$scope.unexpected_error = true;

		console.log("inside products controller");
	
		//console.log("userId:: " + $scope.userId)

		$http({
			method : "POST",
			url : '/getAllProducts',//change the method to get 10 items at a time.
			data : {}
		}).success(function(data) {
			console.log("inside success");
			console.log("data is ::");
			console.log(data);

			$scope.allProducts = data.results;

			/*angular.forEach(data.results, function(result, key){
				angular.forEach(result.ProductsForDirectSell, function(product, key) {
					$scope.allProducts.push(product);
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
		
		$scope.AddToCart = function(product) {
			
			console.log("Selected product : "+product.ItemName);
			$http({
				method : "POST",
				url : '/userAddToCart',//change the method to get 10 items at a time.
				data : {
					"product" : product
				}
			}).success(function(data) {
				console.log("Item added successfully to the user cart.");

				window.location.assign("/products");
				//set all variables.
					 
			}).error(function(error) {
				console.log("inside error");
				console.log(error);
				$scope.unexpected_error = false;
				$scope.invalid_login = true;
				$window.alert("unexpected_error");
			});	
		}

		$scope.signout = function() {

			console.log("inside signout method");
			$http({
				method : "POST",
				url : '/signout',
				data : {
				}
			}).success(function(data) {
				console.log("inside success for signout");
				//set all variables.
				window.location.assign("/signin");


			}).error(function(error) {
				console.log("inside error");
				console.log(error);
				$scope.unexpected_error = false;
				$scope.invalid_login = true;
				$window.alert("unexpected_error");
			});
		}
});