app.config(function ($routeProvider) {
    $routeProvider.when('/',
        {
            templateUrl: 'welcome.html'
        }).
        when('/table/:viewName',
        {
            templateUrl: 'tableview.html',
            controller: 'gridController'
        }).
        when('/table_with_actions/:viewName',
        {
            templateUrl: 'tableWithActions.html',
            controller: 'gridController'
        }).
        when('/autoform/:viewName/:originViewName/:id',
        {
            controller: 'autoFormOverallController',
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
        when('/formelements_table/:viewName',
        {
            controller: 'gridController',
            templateUrl: 'tableFormElementsOrder.html'
        }).
        when('/formelements_form/:tableNameToCustomize',
        {
            controller: 'formOrderController',
            templateUrl: 'formElementsOrderForm.html'
        }).
        when('/table_crud/:viewName',
        {
            templateUrl: 'tableviewCrud.html',
            controller: 'gridController'
        }).
        when('/upload_csv/:viewName',
        {
            templateUrl: 'uploadCsv.html',
            controller: 'uploadCsvController'
        }).
        when('/change_menu',
        {
            templateUrl: 'changeMenu.html',
            controller: 'menuController'
        }).
        when('/show_sql/:viewName',
        {
            templateUrl: 'showSql.html',
            controller: 'showSqlController'
        }).
        when('/autoform2/:viewName',
        {
            controller: 'autoFormController2',
            templateUrl: 'autoForm2.html'
        })
    ;
});

