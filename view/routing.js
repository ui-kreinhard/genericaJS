app.config(function($routeProvider) {
    $routeProvider.when('/',
            {
                templateUrl: 'welcome.html'
            }
    ).
            when('/table/:viewName',
            {
                templateUrl: 'tableview.html',
                controller: 'gridController'
            }).
            when('/autoform/:viewName/:id',
            {
                controller: 'autoFormController',
                templateUrl: 'autoForm.html'
            }).
            when('/autoform/:viewName',
            {
                controller: 'autoFormController',
                templateUrl: 'autoForm.html'
            }).
            when('/welcome', 
            {
                templateUrl: 'welcome.html'
            }). 
            when('/login',
            {
                controller: 'loginController',
                templateUrl: 'login.html'
            }).
	    when('/logout', 
	    {
		controller: 'logoutController',
		templateUrl: 'logout.html'
	    }).
	     when('/table_crud/:viewName',
            {
                templateUrl: 'tableviewCrud.html',
                controller: 'gridController'
            });
});

