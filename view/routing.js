app.config(function($routeProvider) {
    $routeProvider.when('/',
            {
                templateUrl: 'welcome.html'
            }).
            when('/table/:viewName',
            {
                templateUrl: 'tableview.html',
                controller: 'gridController'
            }).
	    when('/table_cr/:viewName',
	    {
		templateUrl: 'tableviewCr.html',
		controller: 'gridController'
            }).
  	    when('/table_cru/:viewName',
            {
                templateUrl: 'tableviewCru.html',
                controller: 'gridController'
            }).
	    when('/table_crud/:viewName',
            {
                templateUrl: 'tableviewCrud.html',
                controller: 'gridController'
            }).
            when('/table_crd/:viewName',
            {
                templateUrl: 'tableviewCrd.html',
                controller: 'gridController'
            }).
            when('/table_crud/:viewName',
            {
                templateUrl: 'tableviewCrud.html',
                controller: 'gridController'
            }).
            when('/table_d/:viewName',
            {
                templateUrl: 'tableviewD.html',
                controller: 'gridController'
            }).
            when('/table_u/:viewName',
            {
                templateUrl: 'tableviewU.html',
                controller: 'gridController'
            }).
            when('/table_ud/:viewName',
            {
                templateUrl: 'tableviewUd.html',
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

