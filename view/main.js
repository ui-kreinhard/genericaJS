var menuName = 'view_menu';

var app = angular.module('generica', ['angular-loading-bar','hljs','ui.grid', 'ngSanitize','ui.select','ui.grid.pagination', 'ui.grid.autoResize', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.pinning', 'ui.grid.resizeColumns', 'ngGrid', 'ngRoute', 'ngResource', 'mgcrea.ngStrap', 'treeControl', 'angularFileUpload']);



app.factory('authHttpInterceptor', function ($q, $location) {
    
    
    return {
        'responseError': function (rejection) {
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
}).config(function ($provide, $httpProvider, hljsServiceProvider) {
      hljsServiceProvider.setOptions({
    // replace tab with 4 spaces
    tabReplace: '    '
  });
    return $httpProvider.interceptors.push('authHttpInterceptor');
});
