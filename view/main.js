var menuName = 'view_menu';

var app = angular.module('generica', ['ui.grid', 'ui.grid.paging', 'ui.grid.autoResize', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.pinning', 'ui.grid.resizeColumns', 'ngGrid', 'ngRoute', 'ngResource', 'mgcrea.ngStrap', 'treeControl', 'angularFileUpload']);




app.factory('authHttpInterceptor', function ($q, $location) {
    var loadingDiv = $('#loadingDiv');
    
    if (loadingDiv == null) {
        loadingDiv = {};
        loadingDiv.show = function () {
        };
        loadingDiv.hide = function () {
        };
    }
    
    loadingDiv.hide();
    
    return {
        'request': function (config) {
            loadingDiv.show();
            return config;
        },
        'response': function (response) {
            loadingDiv.hide();
            return response || $q.when(response);
        },
        'responseError': function (rejection) {
            loadingDiv.hide();
            // prevent redirect loop
            console.log($q);
            console.log($location);
            switch (rejection.status) {
                case 412:
                    return $q.reject(rejection);
                    break;
                case 401:
                case 403:
                    if ($location.$$url != '/login') {
                        location.href = location.pathname + "#/login";
                        location.reload(true);
                    }
                    return $q.reject(rejection);
                    break;
                default:
                    return $q.reject(rejection);
                    break;
            }

        }
    };
}).config(function ($provide, $httpProvider) {
    return $httpProvider.interceptors.push('authHttpInterceptor');
});
