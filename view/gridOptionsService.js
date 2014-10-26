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
            var that = savedGridOptions[viewName] = {
                that: null,
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
                selectionChangedListeners: [],
                addListener: function(listener) {
                    this.selectionChangedListeners.push(listener);
                },
                afterSelectionChange: function(viewName) {
                    return function(data) {
                    var self = savedGridOptions[viewName];

                        for (var i = 0; i < self.selectionChangedListeners.length; i++) {
                            var listener = self.selectionChangedListeners[i];
                            listener(data.selectionProvider.selectedItems);
                        }
                    };
                }(viewName),
                selectedItems: []
            };
            savedGridOptions[viewName].that = savedGridOptions[viewName];
        }
        return savedGridOptions[viewName];
    };
});