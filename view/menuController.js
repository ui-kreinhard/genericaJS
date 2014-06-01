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
			children: []
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
});
