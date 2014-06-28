var app = angular.module('generica', ['ngGrid', 'ngRoute', 'ngResource', 'mgcrea.ngStrap']);




app.factory('authHttpInterceptor', function($q, $location) {
    return {
        'response': function(response) {
            // default handling
            return response || $q.when(response);
        },
        'responseError': function(rejection) {
            // prevent redirect loop
	    console.log($q);
	    console.log($location);
	    switch(rejection.status) {
		case 412:
                return $q.reject(rejection);
		break;
		case 401:
		case 403:
                if ($location.$$url != '/login') {
                	$location.path('/login');
		}
		return; 
		break;
		default:
            	return $q.reject(rejection);
		break;
	    }

        }
    };
}).config(function($provide, $httpProvider) {
    return $httpProvider.interceptors.push('authHttpInterceptor');
});
