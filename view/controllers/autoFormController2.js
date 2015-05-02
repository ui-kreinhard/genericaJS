app.controller('autoFormController2', function ($scope, $http, $routeParams, $location, $route, schemaForm) {
    function mapStrategy(raw) {
        var schema = {};
        var form = {};

        switch(raw.data_type) {
            case 'combobox':
                form.title = raw.displayName

                form.type = 'select'
                form.key = raw.field
                form.titleMap = []
                angular.forEach(raw.selection_elements, function(element) {
                    form.titleMap.push(
                        {
                            name: element.label,
                            value: element.id
                        }
                        )
                })
                break;
            case 'character varying':
                schema.type = 'string'
                break;
            default:
                schema.type = raw.data_type
                break;
        }

        schema.title = raw.displayName
        return {schema: schema, form: form};
    }

    $scope.schema = {
        type: "object",
        properties: {

        }
    };

    $scope.form = [
        "*"

    ];

    $http({
        method: 'GET',
        params: {
            tableName: $routeParams.viewName,
            id: $scope.selectedId
        },
        url: '../formdata'
    }).
    success(
    function (data, status, headers, config) {
        var schemaToBeTransformed = data.schema;
        angular.forEach(schemaToBeTransformed,function(value) {
            var name = value.field;
            var data_type = value.data_type;

            $scope.schema.properties[name] = mapStrategy(value).schema
            $scope.form.push(mapStrategy(value).form)
        });

        $scope.form.push({
            type: "button",
            title: "Save",
            onClick: function() {
                console.log($scope.model)
            }
        })
    }).
    error(function (data, status, headers, config) {
        $scope.errors.errorList = [];
        if (data.errors) {
            $scope.errors.errorList = data.errors;
        } else {
            var obj = {
                title: 'System Error',
                errormessage: JSON.stringify(data),
                type: 'error'
            };

            $scope.errors.errorList.push(obj);
        }
    });


    $scope.model = {};
});

