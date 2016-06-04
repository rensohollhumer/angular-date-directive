(function () {
    angular.module('utils').directive('hcGridDateMask', ["$filter", "$window", "$parse", "$timeout", "uiGridConstants", "uiGridEditConstants", "hcDateValidation", function ($filter, $window, $parse, $timeout, uiGridConstants, uiGridEditConstants, hcDateValidation) {
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

                    //set focus at start of edit
                    scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
                        //.log('Custom Directive: Begun the cell event');
                        $timeout(function () {
                            element[0].focus();
                            element[0].style.width = (element[0].parentElement.offsetWidth - 1) + 'px';

                        });

                        //for bootstrap dropdown
                        element.on('change', function (evt) {
                            //console.log('Custom Directive: blur() :  the dropdown just blurred');
                            scope.stopEdit(evt);
                        });


                        //for boostrap datepicker 
                        element.on('blur', function (evt) {
                            //console.log('Custom Directive: blur() :  the calender blurred using onblur()');
                            scope.stopEdit(evt);
                        });

                        scope.stopEdit = function (evt) {
                            // no need to validate a dropdown - invalid values shouldn't be
                            // available in the list
                            //console.log('Custom Directive: stopEdit() :  Now stopping the edit functionality');
                            // ReSharper disable once FunctionsUsedBeforeDeclared
                            hcDateValidation.validateDate(scope, evt, element, ngModel, setter, true);
                            scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                        };

                        element.on('keydown', function (evt) {
                            switch (evt.keyCode) {
                                case uiGridConstants.keymap.ESC:
                                    evt.stopPropagation();
                                    scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                                    break;
                                case uiGridConstants.keymap.ENTER: // Enter (Leave Field)
                                    scope.stopEdit(evt);
                                    break;
                                case uiGridConstants.keymap.LEFT:
                                    scope.stopEdit(evt);
                                    break;
                                case uiGridConstants.keymap.RIGHT:
                                    scope.stopEdit(evt);
                                    break;
                                case uiGridConstants.keymap.UP:
                                    evt.stopPropagation();
                                    break;
                                case uiGridConstants.keymap.DOWN:
                                    evt.stopPropagation();
                                    break;
                                case uiGridConstants.keymap.TAB:
                                    scope.stopEdit(evt);
                                    break;
                            }
                            return true;
                        });


                    });
                };
            }
        }
    }]);
})();
