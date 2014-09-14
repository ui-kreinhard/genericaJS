app.controller('menuController', function($scope, $http, $routeParams, $location) {
$scope.options = {
    nodeChildren: "children",
    dirSelectable: false,
    injectClasses: {
        ul: "a1",
        li: "a2",
        liSelected: "a7",
        iExpanded: "a3",
        iCollapsed: "a4",
        iLeaf: "a5",
        label: "a6",
        labelSelected: "a8"
    }
};
	$scope.menuItems = [
];
$scope.selectedNode = function(node) {
	if(node.hasLink()) {
		$location.path(node.link);
	}
};
	$http({
		method: 'GET',
		url: '../readout_table',
		params: {
			pageSize: '1000',
			page: 1,
			tableName: 'menu'
		}
	}).success(function(data, status, headers, config) {
		var untransformedData = data.data;
		var idMappedData = {};
		angular.forEach(untransformedData, function(value,key) {
			idMappedData[value.id] = {
                                menu_idmenu: value.menu_idmenu,
                                menulabel: value.menulabel,
                                link: value.link,
                                children: [],
                                parent: false
                        };

			idMappedData[value.id].hasLink = function() {
				return this.children.length <= 0;
			};
			idMappedData[value.id].hasNoLink = function() {
				return !this.hasLink();
			};

		});
		angular.forEach(idMappedData, function(value, key) {
			if(value.menu_idmenu!=null && value.menu_idmenu!=='') {
				var parent = idMappedData[value.menu_idmenu];
				value.parent = true;
				parent.children.push(
				value
				);
			}
		});
		angular.forEach(idMappedData, function(value, key) {
			if(!value.parent) {
				$scope.menuItems.push(value);
			}
		});
		console.log($scope.menuItems);
	}).error(function(data, status, headers, config) {
		console.log('cannot load menu data');
		console.log(status);
	});
});
