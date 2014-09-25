app.controller('logoutController', function($scope, $http, $routeParams, $location) {
        $http({
            method: 'GET',
            data: {
            },
            url: '../logout'
        }).
        success(
        function(data, status, headers, config) {
        	
                 location.href = location.pathname + "#/login";
                 location.reload(true);
        }).
        error(function(data, status, headers, config) {
		$location.path('/generalFailure');
        }
        );
});

