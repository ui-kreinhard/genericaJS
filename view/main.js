var app = angular.module('generica', ['ngGrid', 'ngRoute', 'ngResource', 'mgcrea.ngStrap']);




app.factory('authHttpInterceptor', function($q, $location) {
    return {
        'response': function(response) {
            // default handling
            return response || $q.when(response);
        },
        'responseError': function(rejection) {
            // prevent redirect loop
            if ($location.$$url != '/login') {
                $location.path('/login');
            }
            return $q.reject(rejection);
        }
    };
}).config(function($provide, $httpProvider) {
    return $httpProvider.interceptors.push('authHttpInterceptor');
});



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
            when('/welcome', {
        templateUrl: 'welcome.html'
    }).
            when('/login',
            {
                controller: 'loginController',
                templateUrl: 'login.html'
            });
});
