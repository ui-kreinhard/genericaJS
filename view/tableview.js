app.controller('gridController', function($scope, $http, $routeParams) {
    var selectionChangedListeners = [];

    var columns = [];
    var rowData = [];
    var viewName = $routeParams.viewName;
    $scope.rights = {};
    $scope.viewName = viewName;
    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: [10, 20, 50, 100],
        pageSize: 20,
        currentPage: 1
    };
    
    var editUrlTemplate= '#autoform/' + viewName + '/';
    var createUrlTemplate = '#autoform/' + viewName + '/';
    var deleteUrlTemplate = '#autoform/delete/' + viewName + '/';

    $scope.createUrl = createUrlTemplate; 

    $scope.sortOptions = {
        fields: [],
        directions: [],
        columns: []
    };

    var addListener = function(listener) {
	selectionChangedListeners.push(listener);
    };

    addListener(function(selectedItem) {
	$scope.editUrl = editUrlTemplate + selectedItem[0].id;
	$scope.createUrl = createUrlTemplate;
	$scope.deleteUrl = deleteUrlTemplate + selectedItem[0].id;	
    });

    $scope.getPagedDataAsync = function() {
        var httpParameters = {
            tableName: viewName,
            page: $scope.pagingOptions.currentPage,
            pageSize: $scope.pagingOptions.pageSize,
            orderBy: ($scope.sortOptions.fields ? $scope.sortOptions.fields: []),
            orderByDirection: ($scope.sortOptions.directions?$scope.sortOptions.directions:[])
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
		    $scope.rights = data.rights;
                    angular.forEach(data.data, function(value, key) {
                        var singleRow = {};
                        angular.forEach(value, function(singleElement, elementKey) {
                            singleRow[elementKey] = singleElement;
                        });
                        rowData.push(singleRow);
                    });
                    $scope.rowData = rowData;
                    $scope.columns = columns;
                   //    $scope.sortOptions.columns = columns;
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
            $scope.getPagedDataAsync();
        }
    }, true);
   $scope.$watch('sortOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.getPagedDataAsync();
        }
    }, true);
    $scope.gridOptions = {
        data: 'rowData',
        totalServerItems: 'totalServerItems',
        columnDefs: $scope.columns,
	keepLastSelected: false,
        columns: $scope.columns,
        pagingOptions: $scope.pagingOptions,
        enablePaging: true,
        showFooter: true,
        showFilter: true,
        sortInfo: $scope.sortOptions,
        showColumnMenu: true,
        useExternalSorting: true,
	afterSelectionChange: function(data) {
		for(var i=0;i<selectionChangedListeners.length;i++) {
			var listener = selectionChangedListeners[i];
			listener(data.selectionProvider.selectedItems);
		}
        },
	selectedItems: []
    };
});
