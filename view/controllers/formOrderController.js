app.controller('formOrderController', function($scope, $http, $routeParams, $location) {
	var tableNameToCustomizeName = $routeParams.tableNameToCustomize;
	$scope.formelements = [];
	$scope.selectedFormElement = null;

	var getSelectedElementPosition = function() {
		if($scope.selectedFormElement==null) {
			return -1;
		}
		for(var i=0;i<$scope.formelements.length;i++) {
			var curElement = $scope.formelements[i];
			if(curElement.column_name == $scope.selectedFormElement[0].column_name) {
				return i;
			}
		}
		return -1;
	};

	$http({
        	method: 'GET',
	        params: {
        	    tableName: 'formelements_order_edit_view',
	            id: tableNameToCustomizeName 
        	},
	        url: '../formdata'
    	}).
   	 success(
            function(data, status, headers, config) {
		angular.forEach(data.data, function(value, key) {
			$scope.formelements.push(
				value
			);
		});
            }).
            error(function(data, status, headers, config) {
    	});

	var move = function(array,currentIndex,direction) {
		if(currentIndex+direction >= array.length||currentIndex + direction < 0) {
			return;
		}
 		var tmp = array[currentIndex+direction];
		var currentElement = array[currentIndex]
                $scope.formelements[currentIndex+direction] = currentElement;
                $scope.formelements[currentIndex] = tmp;

	};
	$scope.moveUp = function() {
		if($scope.selectedFormElement==null) {
			return;
		}
		var currentIndex = getSelectedElementPosition();
		move($scope.formelements, currentIndex, -1);
	};
	$scope.moveDown = function() {
		var currentIndex = getSelectedElementPosition();
	        move($scope.formelements, currentIndex, +1);
	};
	$scope.submit = function() {
	var firstElement = $scope.formelements[0];
   	$http({
                method: 'POST',
                data: {
			table_name: firstElement.table_name,
			table_schema: firstElement.table_schema,
			formElements: $scope.formelements
                },
                url: '/update_formelements_order'
        }).
         success(
            function(data, status, headers, config) {
            }).
            error(function(data, status, headers, config) {
        });


	};
});
