app.controller('tableFormElementsOrderController', function($scope, $http, $routeParams, $location) {
    $scope.customizeUrl = '#' + $location.path();
    $scope.$parent.gridOptions.addListener(function(selectedItems) {
        if (selectedItems.length > 0) {
            $scope.customizeUrl = '#formelements_form/' + selectedItems[0].id;
        } else {
            $scope.customizeUrl = '#' + $location.path();
        }
    });

});
