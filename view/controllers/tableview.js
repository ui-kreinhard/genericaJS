app.controller('gridController', function($scope, $http, $routeParams, gridOptionsService, uiGridConstants) {

    var columns = [];
    var rowData = [];
    var viewName = $routeParams.viewName;

    $scope.gridOptions = gridOptionsService.getGridOptions(viewName);
    $scope.saveReOrder = false;
    $scope.filter = {};
    var outerScope = $scope;

    var listeners = [];
    var loadedTableData = function(data) {
        angular.forEach(listeners, function(listener) {
            listener(data);
        });
    };

    $scope.addLoadListener = function(listener) {
        listeners.push(listener);
    };

    $scope.gridOptions.onRegisterApi = function(gridApi) {
        $scope.gridApi = outerScope.gridApi = gridApi;
        $scope.gridOptions.selectedItems.clearSelection();
        $scope.gridApi.core.on.renderingComplete($scope, function() {
            var refreshIdTimeout;
            $scope.gridApi.core.on.filterChanged($scope, function() {
                var grid = this.grid;
                $scope.filter = {};

                angular.forEach(grid.columns, function(column) {
                    var filter = {
                        term: column.filters[0].term,
                        field: column.colDef.field,
                        operator: 'LIKE'
                    };
                    if (typeof filter.term != 'undefined' && filter.term != null && filter.term != '') {
                        $scope.filter[column.colDef.field] = filter;
                    }
                });
                if (typeof refreshIdTimeout != 'undefined') {
                    clearTimeout(refreshIdTimeout);
                }

                refreshIdTimeout = window.setTimeout($scope.getPagedDataAsync, 400);
            });

            $scope.gridApi.colMovable.on.columnPositionChanged($scope, function() {
                if (!$scope.saveReOrder) {
                    return;
                }

            });

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
            gridApi.pagination.on.paginationChanged($scope, function(newPage, pageSize) {
                $scope.pagingOptions.currentPage = newPage;
                $scope.pagingOptions.pageSize = pageSize;
                $scope.getPagedDataAsync();
            });
            function selectionChanged(row) {
                if (row.isSelected) {
                    $scope.gridOptions.selectedItems.add(row.entity.id);
                } else {
                    $scope.gridOptions.selectedItems.remove(row.entity.id);
                }
                $scope.gridOptions.afterSelectionChange(viewName);
            }
            gridApi.selection.on.rowSelectionChanged($scope, selectionChanged);
            gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows) {
                angular.forEach(rows, function(value) {
                    selectionChanged(value);
                });
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

    $scope.refresh = function() {
        $scope.getPagedDataAsync();
    };

    $scope.getPagedDataAsync = function() {

        var httpParameters = {
            tableName: viewName,
            page: $scope.pagingOptions.currentPage,
            pageSize: $scope.pagingOptions.pageSize,
            orderBy: ($scope.sortOptions.fields ? $scope.sortOptions.fields : []),
            orderByDirection: ($scope.sortOptions.directions ? $scope.sortOptions.directions : []),
            filter: $scope.filter
        };
        $http({
            method: 'POST',
            data: httpParameters,
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
                    $scope.rights.canCustomize = data.rights.canCustomize;
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

                    $scope.gridOptions.columnDefs = columns;

                    // merge back saved sort infos, so we can have here the default fuckup
                    var i = 0;
                    angular.forEach($scope.gridOptions.sortInfo.fields, function(value) {
                        angular.forEach($scope.gridOptions.columnDefs, function(valueInner) {
                            if (value == valueInner.name) {
                                valueInner.sort = {
                                    direction: $scope.gridOptions.sortInfo.directions[i],
                                    priority: i
                                };
                                i++;
                            } else {
                                valueInner.sort = null;
                            }
                        });
                    });

                    $scope.rowData = rowData;
                    if ($scope.rights.canCustomize) {
                        var customizeMenuObject = {
                            title: 'Enable Saving Order'
                        };
                        customizeMenuObject.action = function(customizeMenuObject) {
                            var that = customizeMenuObject;
                            return function($event) {
                                $scope.saveReOrder ^= 1;

                                if ($scope.saveReOrder) {
                                    that.title = 'Disable Saving Order';


                                } else {
                                    that.title = 'Enable Saving Order';
                                    var tableNameSchema = viewName.split(".");
                                    var dataToBeSent = {
                                        formElements: [],
                                        table_name: tableNameSchema[1],
                                        table_schema: tableNameSchema[0]
                                    };

                                    // ignore first column
                                    angular.forEach($scope.gridApi.grid.columns.slice(1), function(value, key) {
                                        var entry = {
                                            column_name: value.colDef.name,
                                            id: viewName,
                                            table_name: dataToBeSent.table_name,
                                            table_schema: dataToBeSent.table_schema
                                        };
                                        dataToBeSent.formElements.push(entry);
                                    });
                                    $http({
                                        method: 'POST',
                                        data: dataToBeSent,
                                        url: '/update_formelements_order'
                                    }).
                                            success(
                                            function(data, status, headers, config) {
                                            }).
                                            error(function(data, status, headers, config) {
                                    });
                                }
                            };
                        }(customizeMenuObject);
                        if ($scope.gridOptions.gridMenuCustomItems.length <= 0) {
                            $scope.gridOptions.gridMenuCustomItems.push(
                                    customizeMenuObject
                                    );
                        }
                    }
                    loadedTableData(data);
                }).
                error(function(data, status, headers, config) {
            console.log(status);
        });
    };
    $scope.getPagedDataAsync();
});
