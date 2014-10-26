app.controller('menuController', function($scope, $http, $routeParams, $location, menuElementService) {
    this.assignNewMenu = function(menuItems) {
        $scope.menuItems = menuItems;
    };
    menuElementService.registerController(this);

    $scope.menuName = 'menu_view';
    $scope.menu = {
        s: true,
        showMenu: function() {
            return $scope.menu.s;
        }
    };

    $scope.options = {
        nodeChildren: "children",
        dirSelectable: false,
        injectClasses: {
            ul: "a1",
            li: "a2",
            liSelected: "a7",
            iExpanded: "a3",
            iCollapsed: "a4",
            iLeaf: "a5",
            label: "a6",
            labelSelected: "a8"
        }
    };
    $scope.menuItems = [];
    $scope.selectedNode = function(node) {
        if (node.hasLink()) {
            $location.path(node.link);
        }
    };

    $scope.changeMenu = function() {
        menuElementService.reloadMenu($scope.menuName);
    };
});
