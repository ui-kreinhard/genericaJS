app.controller('menuController', function($scope, $http, $routeParams) {
	$scope.menuItems = [
		{
			menulabel: 'Worktimes',
			link: '',
			hasLink: function() {
				return false;
			},
			hasNoLink: function() {
				return true;
			},
			children: [
				{
					menuLabel: 'bla',
					link: 'asdf',
					hasLink: function() {
						return true;
					}
					, hasNoLink: function() {
						return false;
					}
				}
			]
		},
               {
                        menulabel: 'Worktimes2',
                        link: '#/table/worktimes',
			children: [],
			hasLink: function() {
				return true;
			},
			hasNoLink: function() {
                                return false;
                        },

                }
		
	];
	$scope.menuItems = [];
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
			value.children = [];
			value.hasLink = function() {
				return this.children.length <= 0;
			};
			value.hasNoLink = function() {
				return !this.hasLink();
			};
			idMappedData[value.id] = value;
		});
		angular.forEach(idMappedData, function(value, key) {
			if(value.menu_idmenu!=null && value.menu_idmenu!=='') {
				var parent = idMappedData[value.menu_idmenu];
				parent.children.push({
					text: value.menulabel,
					href: value.link
				});
			}
		});
		angular.forEach(idMappedData, function(value, key) {
			if(value.children.length > 0) {
				$scope.menuItems.push(value);
			}
		});
	}).error(function(data, status, headers, config) {
		console.log('cannot load menu data');
		console.log(status);
	});
});
