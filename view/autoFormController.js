app.controller('autoFormController', function($scope, $http, $routeParams) {
    $scope.model = {};
    $scope.errors = {
	errorList: [],
	hasErrors: function() {
		return errorList.length > 0;
	}	
    };
    var httpParameters = {
        tableName: $routeParams.viewName

    };
    $http({
        method: 'GET',
        params: {
            tableName: $routeParams.viewName,
            id: $routeParams.id
        },
        url: '../formdata'
    }).
    success(
            function(data, status, headers, config) {
                rowData = [];
                columns = [];
                columns = data.schema;

                $scope.dataSchema = data.schema;
                if (data.data[0]) {
                    var valuesOfRecord = data.data[0];
                    for (var propertyName in valuesOfRecord) {
                        var value = valuesOfRecord[propertyName];
                        $scope.model[propertyName] = value;
                    }
                }
            }).
            error(function(data, status, headers, config) {
		$scope.errors.errorList = data.errors;
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
        success(function(data, status, headers, config) {

        }).
        error(function(data, status, headers, config) {
            $scope.errors.errorList = data.errors;
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
        if (field == 'id') {
            data_type = 'id';
        }
        switch (data_type) {
            case 'combobox':
                var selectionElements = scope.content.selectionElements;
                retStr += '<select ng-model="model.' + field + '" id="' + field + '">';
                angular.forEach(selectionElements, function(value, key) {
                    retStr += '<option value="' + value.value + '">' + value.label + '</option>';
                });
                retStr += '</select>';
                break;
            case 'character varying':
                if (textLength < 65) {
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
            case 'id':
                retStr += '<input ng-model="model.' + field + '" id="' + field + '" disabled></input>';
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
