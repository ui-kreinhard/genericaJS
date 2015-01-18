app.service('menuElementService', function($http) {

    var menuItems = [];
    var registeredControllers = [];
    this.registerController = function(controller) {
        registeredControllers.push(controller);
    };
    var loadNewMenu = function(untransformedData) {
        var idMappedData = {};
        angular.forEach(untransformedData, function(value, key) {
            idMappedData[value.id] = {
                menu_idmenu: value.menu_idmenu,
                menulabel: value.menulabel,
                link: value.link,
                children: [],
                parent: false
            };

            idMappedData[value.id].hasLink = function() {
                return !this.hasNoLink();
            };
            idMappedData[value.id].hasNoLink = function() {
                return value.link == null || value.link=='';
            };

        });
        angular.forEach(idMappedData, function(value, key) {
            if (value.menu_idmenu != null && value.menu_idmenu !== '') {
                var parent = idMappedData[value.menu_idmenu];
                value.parent = true;
                parent.children.push(
                        value
                        );
            }
        });

        menuItems = [];
        angular.forEach(idMappedData, function(value, key) {
            if (!value.parent) {
                menuItems.push(value);
            }
        });
        angular.forEach(registeredControllers, function(value) {
            value.assignNewMenu(menuItems);
        });
    };
    this.getMenuItems = function() {
        return menuItems;
    };
    this.reloadMenu = function(menuName) {
        $http({
            method: 'POST',
            url: '../readout_table',
            data: {
                pageSize: '1000',
                page: 1,
                tableName: menuName
            }
        }).success(function(data, status, headers, config) {
            var untransformedData = data.data;
            loadNewMenu(untransformedData);

        }).error(function(data, status, headers, config) {
            console.log('cannot load menu data');
            console.log(status);
        });
    };
    // initial lookup for default menu
    this.reloadMenu('menu_view');
});