app.controller('tableActionsController', function($scope, $http, $routeParams, $location, returnPageService) {
    var viewName = $routeParams.viewName;
    returnPageService.setReturnPage();

    function getDataTypeOfId() {
        var ret = 'integer';
        angular.forEach($scope.$parent.gridOptions.columnDefs, function(value) {
            if(value.field=='id') {
                ret = value.data_type;
            }
        });
        return ret;
    }

    var editUrlTemplate = '';
    var deleteView = $routeParams.viewName;
    var selectedItemIds = [];

    $scope.$parent.addLoadListener(function(data) {
        var tableActionsTmp = data.tableActions;
        var dummy = {source_table_name: viewName, target_table_name: viewName};
        // merge them together
        var tableActions = {
            INSERT: tableActionsTmp.INSERT || dummy,
            UPDATE: tableActionsTmp.UPDATE || dummy,
            DELETE: tableActionsTmp.DELETE || dummy
        };
        $scope.editUrl = '#' + $location.path();
        editUrlTemplate = '#autoform/' + tableActions.UPDATE.target_table_name + '/' + tableActions.UPDATE.source_table_name + '/';
        // make uuid compatible for migration to uuids
        if(getDataTypeOfId() == 'integer') {
            $scope.createUrl = '#autoform/' + tableActions.INSERT.target_table_name + '/' + tableActions.INSERT.source_table_name + '/0';
        } else {
            $scope.createUrl = '#autoform/' + tableActions.INSERT.target_table_name + '/' + tableActions.INSERT.source_table_name + '/aba6f076-b0f5-4aae-9307-113613dc9ab9';
        }
        $scope.deleteUrl = '#autoform/delete';
        $scope.exportToCsv = "../exportToCsv?tableName=" + viewName;
        $scope.importCsv = "#/upload_csv/" + viewName;
    });


    $scope.rights = $scope.$parent.rights;

    $scope.$parent.gridOptions.addListener(function(selectedItems) {
        selectedItemIds = selectedItems;

        if (selectedItems.length > 0) {
            $scope.editUrl = editUrlTemplate + selectedItems[0];
        } else {
            $scope.editUrl = '#' + $location.path();
        }
    });

    $scope.delete = function() {
        if (selectedItemIds.length <= 0) {
            return;
        }
        $http({
            method: 'POST',
            data: {
                id: selectedItemIds,
                tableName: deleteView
            },
            url: '../delete'
        }).
                success(function(data, status, headers, config) {
              $scope.$parent.gridApi.selection.clearSelectedRows();
            $scope.$parent.getPagedDataAsync();
        }).
                error(function(data, status, headers, config) {
            $scope.errors.errorList = data.errors;
        });

    };
});
