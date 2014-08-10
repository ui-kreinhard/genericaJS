app.controller('tableActionsController', function($scope, $http, $routeParams) {
	var viewName = $routeParams.viewName;
	$scope.editUrl = '#autoform/edit/';
	$scope.createUrl = '#autoform/' + viewName;
	$scope.deleteUrl = '#autoform/delete';
	$scope.$parent.addListener(function(selectedItems) {
		console.log(selectedItems);
	});
});
