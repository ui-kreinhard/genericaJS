app.service('gridOptionsService', function() {
    var savedGridOptions = {};
    this.getGridOptions = function(viewName) {
        var defaultPagingOptions = {
            pageSizes: [2, 10, 20, 50, 100],
            pageSize: 20,
            currentPage: 1
        };
        var defaultSortOptions = {
            fields: [],
            directions: [],
            columns: []
        };
        var defaultColumns = [];
        if (savedGridOptions[viewName] == null) {
            savedGridOptions[viewName] = {
                data: 'rowData',
                totalServerItems: 'totalServerItems',
                columnDefs: 'columns',
                keepLastSelected: false,
                pagingOptions: defaultPagingOptions,
                enablePaging: true,
                showFooter: true,
                showFilter: true,
                sortInfo: defaultSortOptions,
                showColumnMenu: true,
                useExternalSorting: false,
                afterSelectionChange: function(data) {
                    for (var i = 0; i < selectionChangedListeners.length; i++) {
                        var listener = selectionChangedListeners[i];
                        listener(data.selectionProvider.selectedItems);
                    }
                },
                selectedItems: []
            };
        }
        return savedGridOptions[viewName];
    };
});