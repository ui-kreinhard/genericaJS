app.controller('gridController', function($scope, $http, $routeParams, gridOptionsService) {
    
    var selectionChangedListeners = [];

    var columns = [];
    var rowData = [];
    var viewName = $routeParams.viewName;

    $scope.gridOptions = gridOptionsService.getGridOptions(viewName);


    $scope.rights = {
        canDelete: false,
        canInsert: false,
        canRead: false,
        canUpdate: false
    };
    $scope.viewName = viewName;
    $scope.totalServerItems = 0;
    $scope.pagingOptions = $scope.gridOptions.pagingOptions;

    $scope.sortOptions = $scope.gridOptions.sortInfo;
    var savedSortInfo =  angular.copy($scope.gridOptions.sortInfo);
    $scope.addListener = function(listener) {
        selectionChangedListeners.push(listener);
    };

    var watcherAdded = false;

    $scope.getPagedDataAsync = function() {
        
        var httpParameters = {
            tableName: viewName,
            page: $scope.pagingOptions.currentPage,
            pageSize: $scope.pagingOptions.pageSize,
            orderBy: ($scope.sortOptions.fields ? $scope.sortOptions.fields : []),
            orderByDirection: ($scope.sortOptions.directions ? $scope.sortOptions.directions : [])
        };
        $http({
            method: 'GET',
            params: httpParameters,
            url: '../readout_table'
        }).
                success(
                function(data, status, headers, config) {

                    rowData = [];
                    columns = [];

                    columns = data.schema;
                    $scope.totalServerItems = data.dataCount;
                    $scope.rights.canDelete = data.rights.canDelete;
                    $scope.rights.canInsert = data.rights.canInsert;
                    $scope.rights.canRead = data.rights.canRead;
                    $scope.rights.canUpdate = data.rights.canUpdate;
                    if (data.data.length <= 0) {
                        var singleDummyRow = {};
                        var i = 0;
                        angular.forEach(data.schema, function(value, key) {
                            var column = value.field;
                            if (i == 0) {
                                singleDummyRow[column] = 'No Records found';
                                i = 1;
                            } else {
                                singleDummyRow[column] = '';
                            }
                        });
                        rowData.push(singleDummyRow);
                    }
                    angular.forEach(data.data, function(value, key) {
                        var singleRow = {};
                        angular.forEach(data.schema, function(schemaElement, elementKey) {
                            var attributeName = schemaElement.field;
                            singleRow[attributeName] = value[attributeName];
                        });
                        rowData.push(singleRow);
                    });
                    $scope.rowData = rowData;
                    $scope.columns = columns;
                    //    $scope.sortOptions.columns = columns;
                     if (!watcherAdded) {
                        $scope.$watch('sortOptions', function(newVal, oldVal) {
                            if (newVal !== oldVal) {
                                $scope.getPagedDataAsync();
                            }
                        }, true);
                        watcherAdded = true;
                    }
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                   
                    

                }).
                error(function(data, status, headers, config) {
            console.log(status);
        });
    };

    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

    $scope.$watch('pagingOptions', function(newVal, oldVal) {
        if (newVal !== oldVal || newVal.currentPage !== oldVal.currentPage || newVal.pageSize !== oldVal.pageSize) {
            // its the complete wrong place, but we have to store back the saved sort info here. 
            // the problem is, that ng-grid clears the sortinfos
            angular.copy(savedSortInfo, $scope.gridOptions.sortInfo);
            $scope.getPagedDataAsync();
        }
    }, true);




});
