app.controller('autoFormOverallController', function($scope, $http, $routeParams, returnPageService, gridOptionsService) {
    var viewName = $routeParams.viewName;
    var registeredForms = [];
    $scope.ids = gridOptionsService.getGridOptions(viewName).selectedItems.getAsArray();
    if($scope.ids.length <=0) {
        $scope.ids.push(0);
    }
    $scope.registerSubController = function($submitMethod) {
        registeredForms.push($submitMethod);
    };

    $scope.submitAllForms = function() {
        var i = 0;
        angular.forEach(registeredForms, function(registeredForm) {
            registeredForm(function() {
                i++;
                if (i >= registeredForms.length) {
                    returnPageService.goToReturnPage();
                }
            });
        });

    };
});
