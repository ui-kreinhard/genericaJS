var app = angular.module('generica', ['ngGrid', 'ngRoute', 'ngResource', 'mgcrea.ngStrap']);

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
	    when('/login',
	    {
		controller: 'loginController',
		templateUrl: 'login.html'
	    });
});

