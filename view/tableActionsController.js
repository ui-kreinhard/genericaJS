app.controller('tableActionsController', function($scope, $http, $routeParams, $location, returnPageService) {
    var viewName = $routeParams.viewName;
    returnPageService.setReturnPage();

    var editUrlTemplate = '#autoform/' + viewName + '/';
    var selectedItemIds = [];

    $scope.editUrl = '#' + $location.path();
    $scope.createUrl = '#autoform/' + viewName;
    $scope.deleteUrl = '#autoform/delete';
    $scope.exportToCsv = "../exportToCsv?tableName=" + viewName;
    $scope.importCsv = "#/upload_csv/" + viewName;

    $scope.rights = $scope.$parent.rights;
    $scope.$parent.gridOptions.addListener(function(selectedItems) {
        selectedItemIds = selectedItems;
        

        if (selectedItems.length > 0) {
            $scope.editUrl = editUrlTemplate + selectedItems[0];
        } else {
            $scope.editUrl = '#' + $location.path();
        }
    });

    $scope.delete = function() {
        if (selectedItemIds.length <= 0) {
            return;
        }
        $http({
            method: 'POST',
            data: {
                id: selectedItemIds,
                tableName: $routeParams.viewName
            },
            url: '../delete'
        }).
                success(function(data, status, headers, config) {
            alert('deleted ' + selectedItemIds.length + ' records');
            $scope.$parent.getPagedDataAsync();
            $scope.$parent.gridOptions.selectedItems.clear();
        }).
                error(function(data, status, headers, config) {
            $scope.errors.errorList = data.errors;
        });

    };
});
