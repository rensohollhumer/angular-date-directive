(function () {
    angular.module('utils').directive('hcDateMask', ["$filter", "$window", "$parse", "hcDateValidation", function ($filter, $window, $parse, hcDateValidation) {
        return {
            require: '?ngModel',
            restrict: "A",
            scope: true,
            compile: function () {
                var getter, setter;
                return function (scope, element, attrs, ngModel) {
                    //Declaring the getter and setter
                    getter = $parse(attrs.ngModel);
                    setter = getter.assign;
                    var self = this;

                    //attr
                    self.maxDate = attrs.max;
                    self.minDate = attrs.min;

                    //Set the initial value to the View and the Model
                    ngModel.$formatters.unshift(function (modelValue) {
                        if (!modelValue) return "";
                        var retVal = $filter('date')(modelValue, "MM/dd/yyyy");
                        setter(scope, retVal);
                        return retVal;
                    });

                    // If the ngModel directive is used, then set the initial value and keep it in sync
                    if (ngModel) {
                        element.on('blur', function (event) {
                            // ReSharper disable once FunctionsUsedBeforeDeclared
                            hcDateValidation.validateDate(scope, event, element, ngModel, setter, false);

                        });
                    }
                };
            }
        }
    }]);
})();
