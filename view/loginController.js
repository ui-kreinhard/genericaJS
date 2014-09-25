app.controller('loginController', function($scope, $http, $routeParams, $location, $route) {
    $scope.loginModel = {
        username: '',
        password: '',
        authFailed: false
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
                    $scope.loginModel.authFailed = false;
                    location.href = location.pathname + "#/welcome";
                    location.reload(true);
                }).
                error(function(data, status, headers, config) {
            $scope.loginModel.authFailed = true;
        }
        );
    };
});

