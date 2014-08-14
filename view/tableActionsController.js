app.controller('tableActionsController', function($scope, $http, $routeParams, $location) {
	var viewName = $routeParams.viewName;

	var editUrlTemplate= '#autoform/' + viewName + '/';
	var createUrlTemplate = '#autoform/' + viewName + '/';
	var deleteUrlTemplate = '#autoform/delete/' + viewName + '/';
	var selectedItemIds = [];

	$scope.editUrl = '#' + $location.path();
	$scope.createUrl = '#autoform/' + viewName;
	$scope.deleteUrl = '#autoform/delete';
	$scope.rights = $scope.$parent.rights;
	$scope.$parent.addListener(function(selectedItems) {
		selectedItemIds = [];
		angular.forEach(selectedItems, function(value, key) {
			selectedItemIds.push(value.id);
		});
		if(selectedItems.length > 0) {
		        $scope.editUrl = editUrlTemplate + selectedItems[0].id;
		} else {
			$scope.editUrl = '#' + $location.path();
		}
	});

	$scope.delete = function() {
        if(selectedItemIds.length <= 0) {
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
		alert('deleted ' +selectedItemIds.length + ' records');
 		$scope.$parent.getPagedDataAsync();
		$scope.gridOptions.selectedItems = [];
        }).
        error(function(data, status, headers, config) {
            $scope.errors.errorList = data.errors;
        });

	}
});
