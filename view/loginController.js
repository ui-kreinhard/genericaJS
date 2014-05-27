app.controller('loginController', function($scope, $http, $routeParams) {
    $scope.loginModel = {
    	username: '',
	password: ''
    };
    var httpParameters = {
        tableName: $routeParams.viewName

    };

    $scope.submit = function() {
        $http({
            method: 'POST',
            data: {
                data: $scope.loginModel,
                tableName: $routeParams.viewName

            },
            url: '../login'
        }).
                success(
                function(data, status, headers, config) {

                }).
                error(function(data, status, headers, config) {
            console.log(status);
        });
    };
});

