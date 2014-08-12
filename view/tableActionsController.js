app.controller('tableActionsController', function($scope, $http, $routeParams) {
	var viewName = $routeParams.viewName;

	var editUrlTemplate= '#autoform/' + viewName + '/';
	var createUrlTemplate = '#autoform/' + viewName + '/';
	var deleteUrlTemplate = '#autoform/delete/' + viewName + '/';


	$scope.editUrl = '#autoform/edit/';
	$scope.createUrl = '#autoform/' + viewName;
	$scope.deleteUrl = '#autoform/delete';
	$scope.rights = $scope.parent.rights;
	$scope.$parent.addListener(function(selectedItems) {
	        $scope.editUrl = editUrlTemplate + selectedItem[0].id;
        	$scope.createUrl = createUrlTemplate;
	        $scope.deleteUrl = deleteUrlTemplate + selectedItem[0].id;
	});
});
