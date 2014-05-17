app.controller('autoFormController', function($scope, $http, $routeParams) {
   $scope.model = {};
    var httpParameters = {
        tableName: $routeParams.viewName

    };
    $http({
        method: 'GET',
        params: httpParameters,
        url: '../formdata'
    }).
            success(
            function(data, status, headers, config) {
                rowData = [];
                columns = [];
                columns = data.schema;

                $scope.dataSchema = data.schema;

            }).
            error(function(data, status, headers, config) {
        console.log(status);
    });

 
    $scope.submit = function() {
        $http({
            method: 'POST',
            data: { 
                data: $scope.model,
                tableName: $routeParams.viewName
            },
            url: '../insert_or_update'
        }).
                success(
                function(data, status, headers, config) {

                }).
                error(function(data, status, headers, config) {
            console.log(status);
        });
    };
});

app.directive('autoform', function($compile) {
    var getTemplate = function(scope) {
        var retStr = '';
        var field = scope.content.field;
        var displayName = scope.content.displayName;
        var data_type = scope.content.data_type;
        var textLength = scope.content.textlength;
        retStr += '<label class="control-label col-xs-2" for="' + field + '">' + displayName + '</label>\n\
        <div class="col-xs-10">';
        switch (data_type) {
            case 'character varying':
                if (textLength > 65) {
                    retStr += '<input ng-model="model.' + field + '" id="' + field + '"></input>';
                } else {
                    retStr += '<textarea ng-model="model.' + field + '" id="' + field + '"></textarea>';
                }
                break;
            case 'timestamp without time zone':
                retStr += ' <input type="text" ng-model="model.' + field + '"  bs-datepicker>';
                break;
            case 'boolean':
                retStr += '<input type="checkbox" ng-model="model.' + field + '" id="' + field + '"></input>';
                break;

            default:
                retStr += '<input ng-model="model.' + field + '" id="' + field + '"></input>';
                break;
        }
        retStr += '</div>';
        return retStr;
    };

    var linker = function(scope, element, attrs) {
        var modelName = "model." + scope.content.field;
        element.html(getTemplate(scope)).show();
        //   if (typeof scope.content.inputField != 'undefined') {
        // wire event listeners, this is important for client side validation
        var modelName = "scope.$parent.model." + scope.content.field;
        scope.$watch(modelName, function() {
            scope.$emit('fireTriggers', modelName);
        });
        // }
        $compile(element.contents())(scope);
    };


    return {
        restrict: "A",
        rep1ace: true,
        link: linker,
        scope: {
            content: '=',
            model: '=model',
            formDisabled: '=disabledvar',
            editForm: '=formname'
        }
    };
});