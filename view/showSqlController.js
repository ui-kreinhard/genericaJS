app.controller('showSqlController', function ($scope, $http, $routeParams, $location) {
    var viewName = $routeParams.viewName;
    $scope.sqlDefinition = '';

    $http({
        method: 'GET',
        params: {
            tableName: 'view_definitions',
            id: viewName
        },
        url: '../formdata'
    }).
            success(
                    function (data, status, headers, config) {
                        $scope.sqlDefinition = data.data[0].view_definition;
                        
                    }).
            error(function (data, status, headers, config) {
            });
});
