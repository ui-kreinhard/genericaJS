app.controller('gridController', function($scope, $http, $routeParams, gridOptionsService, uiGridConstants) {

    var columns = [];
    var rowData = [];
    var viewName = $routeParams.viewName;

    $scope.gridOptions = gridOptionsService.getGridOptions(viewName);
    var outerScope = $scope;

    $scope.gridOptions.onRegisterApi = function(gridApi) {
        $scope.gridApi = outerScope.gridApi = gridApi;

        $scope.gridApi.core.on.renderingComplete($scope, function() {
            $scope.gridApi.core.on.sortChanged($scope, function(grid, sortColumns) {
                var savedSortInfo = {
                    fields: [],
                    directions: []
                };
                angular.forEach(sortColumns, function(value) {
                    savedSortInfo.fields.push(value.field);
                    savedSortInfo.directions.push(value.sort.direction);
                });
                angular.copy(savedSortInfo, $scope.sortOptions);
                angular.copy(savedSortInfo, $scope.gridOptions.sortOptions);

                $scope.gridOptions.savedSortColumns = sortColumns;
                $scope.getPagedDataAsync();
            });
            gridApi.paging.on.pagingChanged($scope, function(newPage, pageSize) {
                $scope.pagingOptions.currentPage = newPage;
                $scope.pagingOptions.pageSize = pageSize;
                $scope.getPagedDataAsync();
            });
            gridApi.selection.on.rowSelectionChanged($scope, function(row) {
                if(row.isSelected) {
                    $scope.gridOptions.selectedItems.add(row.entity.id);
                } else {
                    $scope.gridOptions.selectedItems.remove(row.entity.id);
                }
                $scope.gridOptions.afterSelectionChange(viewName);
            });
        });
        gridApi.core.raise.sortChanged(gridApi.grid, $scope.gridOptions.sortOptions);
    };


    $scope.columns = [];
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
    var savedSortInfo = angular.copy($scope.gridOptions.sortInfo);
  


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
                    $scope.gridOptions.totalItems = data.dataCount;
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
                    $scope.gridOptions.columnsDefs = columns;

                    // merge back saved sort infos, so we can have here the default fuckup
                    var i = 0;
                    angular.forEach($scope.gridOptions.sortInfo.fields, function(value) {
                        angular.forEach($scope.gridOptions.columnDefs, function(valueInner) {
                            if (value == valueInner.name) {
                                valueInner.sort = {
                                    direction: $scope.gridOptions.sortInfo.directions[i],
                                    priority: i
                                }
                                i++;
                            } else {
                                valueInner.sort = null;
                            }
                        });
                    });

                    $scope.rowData = rowData;
                }).
                error(function(data, status, headers, config) {
            console.log(status);
        });
    };
    $scope.getPagedDataAsync();
});
