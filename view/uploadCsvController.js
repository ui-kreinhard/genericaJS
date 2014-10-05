app.controller('uploadCsvController', function($scope, $http, $routeParams, returnPageService, $upload) {
    var viewName = $routeParams.viewName;
    $scope.viewName = viewName;

    $scope.hasSuccess = false;
    $scope.hasError = false;
    

    $scope.selectedFiles;
    $scope.onFileSelect = function($files) {
        $scope.selectedFiles = $files;
    };

    $scope.goBack = function() {
        returnPageService.goToReturnPage();
    };

    $scope.upload = function() {
        $upload.upload({
            url: '../csv_import',
            data: {view_name: $scope.viewName},
            file: $scope.selectedFiles[0]
        }).progress(function(evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function(data, status, headers, config) {
            $scope.response = data;
            $scope.hasSuccess = data.success.length > 0;
            $scope.hasError = data.errors.length > 0;
        
        });
    };
});