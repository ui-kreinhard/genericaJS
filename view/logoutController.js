app.controller('logoutController', function($scope, $http, $routeParams, $location) {
        $http({
            method: 'GET',
            data: {
            },
            url: '../logout'
        }).
        success(
        function(data, status, headers, config) {
        	$location.path('/login');
        }).
        error(function(data, status, headers, config) {
		$location.path('/generalFailure');
        }
        );
});

