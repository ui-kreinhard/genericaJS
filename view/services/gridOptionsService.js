app.service('gridOptionsService', function() {
    var savedGridOptions = {};
    this.getGridOptions = function(viewName) {
        var defaultPagingOptions = {
            pageSizes: [ 20, 50, 100,200,500,1000,5000],
            pageSize: 100,
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
                columnDefs: [],
                enableRowSelection: true,
                savedSortColumns: {},
                enableGridMenu: true,
                gridMenuCustomItems: [],
                enableSelectAll: true,
                selectionRowHeaderWidth: '30',
                keepLastSelected: false,
                pagingPageSizes: defaultPagingOptions.pageSizes,
                pagingPageSize: defaultPagingOptions.pageSize,
                useExternalPaging: true,
                useExternalSorting: true,
                pagingOptions: defaultPagingOptions,
                showFilter: true,
                sortInfo: defaultSortOptions,
                showColumnMenu: true,
                selectionChangedListeners: [],
                addListener: function(listener) {
                    this.selectionChangedListeners.push(listener);
                },
                afterSelectionChange: function(viewName) {
                    return function(data) {
                        var self = savedGridOptions[viewName];

                        for (var i = 0; i < self.selectionChangedListeners.length; i++) {
                            var listener = self.selectionChangedListeners[i];
                            listener(this.selectedItems.getAsArray());
                        }
                    };
                }(viewName),
                selectedItems: {
                    items: {},
                    getAsArray: function() {
                        return Object.keys(this.items);
                    },
                    add: function(id) {
                        this.items[id] = '1';
                    },
                    remove: function(id) {
                        delete this.items[id];
                    },
                    clearSelection: function() {
                        this.items = {};
                    }
                }
            };
            savedGridOptions[viewName].that = savedGridOptions[viewName];
        }
        return savedGridOptions[viewName];
    };
});
