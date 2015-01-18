app.filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  }
});

app.controller('autoFormController', function($scope, $http, $routeParams, returnPageService, gridOptionsService) {
    var viewName = $routeParams.viewName;

    $scope.init = function(id) {
        $scope.selectedId = id;
        var httpParameters = {
            tableName: $scope.selectedId

        };
        $http({
            method: 'GET',
            params: {
                tableName: $routeParams.viewName,
                id: $scope.selectedId
            },
            url: '../formdata'
        }).
                success(
                function(data, status, headers, config) {
                    $scope.errors.errorList = [];
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
                    $scope.comboboxes = {};
                    angular.forEach($scope.dataSchema, function(schemaObject, key) {
                        if(schemaObject.data_type=='combobox') {
                            $scope.comboboxes[schemaObject.field] = schemaObject.selectionElements;
                        }
                    });
                }).
                error(function(data, status, headers, config) {
            $scope.errors.errorList = [];

            $scope.errors.errorList = data.errors;
        });


        $scope.submit = function(successHandler) {
            $http({
                method: 'POST',
                data: {
                    data: $scope.model,
                    tableName: $routeParams.viewName

                },
                url: '../insert_or_update'
            }).
                    success(function(data, status, headers, config) {
                $scope.errors.errorList = [];
                successHandler();
            }).
                    error(function(data, status, headers, config) {
                $scope.errors.errorList = [];
                angular.forEach(data.errors, function(value, key) {
                    if (value.check == 1) {
                        $scope.errors.errorList.push(value);
                    }
                });
            });
        };
        $scope.$parent.$parent.registerSubController($scope.submit);
    };

    $scope.model = {};




    $scope.errors = {
        errorList: [],
        hasErrors: function() {
            return this.errorList.length > 0;
        }
    };



});

app.directive('autoform', function($compile) {
    var getTemplate = function(scope) {
        var retStr = '';
        var field = scope.content.field;

        var displayName = scope.content.displayName;
        var data_type = scope.content.data_type;
        var textLength = scope.content.textlength;
        retStr += '<label class="control-label " for="' + field + '">' + displayName + '</label>';
        if (field == 'id') {
            data_type = 'id';
        }
        switch (data_type) {
            case 'combobox':
                retStr +=
                        '<ui-select ng-model="model.' + field + '" theme="bootstrap" ng-disabled="disabled">' +
                        '<ui-select-match placeholder="Type or select">{{$select.selected.label}}</ui-select-match>' +
                        '<ui-select-choices repeat="item.value as item in comboboxes.' + field + '| filter: $select.search">' +
                        '<span ng-bind-html="item.value">item.label</span>' +
                        '</ui-select-choices>' +
                        '</ui-select>';
//                retStr += '<ul><li ng-repeat="item in comboboxes.' + field + '">{{item.label}}</li></ul>';
                var selectionElements = scope.content.selectionElements;
//                retStr += '<select style="width: 100%" ng-model="model.' + field + '" id="' + field + '">';
//                angular.forEach(selectionElements, function(value, key) {
//                    retStr += '<option value="' + value.value + '">' + value.label + '</option>';
//                });
//                retStr += '</select>';
                break;
            case 'character varying':
                if (textLength < 65) {
                    retStr += '<input class="form-control" style="width: 100%" ng-model="model.' + field + '" id="' + field + '"></input>';
                } else {
                    retStr += '<textarea class="form-control" class="also" style="resize:vertical; width: 100%; height: 50px "  ng-model="model.' + field + '" id="' + field + '"></textarea>';
                }
                break;
            case 'xml':
                retStr += '<textarea class="form-control" class="also" style="resize:vertical; width: 100%; height: 50px "  ng-model="model.' + field + '" id="' + field + '"></textarea>';
                retStr += '<input class="form-control" type="file" ng-file-select="onXmlFileSelect($files,\'' + field + '\')">';
                break;
            case 'date':
                retStr +=
                        ' <input class="form-control" type="text" ng-model="model.' + field + '"  bs-datepicker data-date-type="iso">';
                break;
            case 'timestamp with time zone':
            case 'timestamp without time zone':
                retStr +=
                        ' <input class="form-control" type="text" ng-model="model.' + field + '"  bs-datepicker data-date-type="iso">';
                retStr +=
                        '<input class="form-control" type="text" data-time-format="HH:mm" ng-model="model.' + field + '"  bs-timepicker data-date-type="iso">';
                break;
            case 'boolean':
                retStr += '<input style="width: 100%" type="checkbox" ng-model="model.' + field + '" id="' + field + '"></input>';
                break;
            case 'id':
                retStr += '<input class="form-control" style="width: 100%" ng-model="model.' + field + '" id="' + field + '" disabled></input>';
                break;
            default:
                retStr += '<input class="form-control" style="width: 100%" ng-model="model.' + field + '" id="' + field + '"></input>';
                break;
        }
        return retStr;
    };

    var linker = function(scope, element, attrs) {
        var modelName = "model." + scope.content.field;
        element.html(getTemplate(scope)).show();
        //   if (typeof scope.content.inputField != 'undefined') {
        // wire event listeners, this is important for client side validation
//        var modelName = "scope.$parent.model." + scope.content.field;
        scope.$watch(modelName, function() {
            scope.$emit('fireTriggers', modelName);
        });

        scope.onXmlFileSelect = function($files, modelName) {
            var reader = new FileReader();
            reader.onload = function(onLoadEvent) {
                var readText = onLoadEvent.target.result;
                scope.model[modelName] = 'ab';
                scope.model[modelName] = readText;
                $('#' + modelName).val(readText);
                scope.$emit('fireTriggers', "model." + modelName);
            };
            reader.readAsText($files[0]);
        };
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
            editForm: '=formname',
            comboboxes: '=comboboxes'
        }
    };
});
