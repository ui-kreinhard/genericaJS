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
            when('/autoform/:viewName',
            {
                controller: 'autoFormController',
                templateUrl: 'autoForm.html'
            });
});

app.controller('helloWorldController', function($scope) {
    // do nothin' 
});
