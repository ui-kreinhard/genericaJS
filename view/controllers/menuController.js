app.controller('menuController', function($scope, $http, $routeParams, $location, menuElementService) {
    $scope.showSearch = false;
    this.assignNewMenu = function(menuItems, allItems) {
        $scope.showSearch = true;
        $scope.menuItems = menuItems;
        $scope.allItems = allItems;
    };
    menuElementService.registerController(this);

    $scope.predicate = '';
    $scope.expandedNodes = [];

    $scope.menuName = 'menu_view';
    $scope.menu = {
        s: true,
        showMenu: function() {
            return $scope.menu.s;
        }
    };

    $scope.treeOptions = {
        nodeChildren: "children",
        dirSelectable: true,
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

    $scope.expandAll = function() {
        $scope.expandedNodes = $scope.allItems;

    };

    $scope.collapseAll = function() {
        $scope.expandedNodes = [];
    };

    $scope.checkTypeAhead = function() {
        if ($scope.predicate.length > 0) {
            $scope.expandAll();
        } else {
            $scope.collapseAll();
        }
    };
});
