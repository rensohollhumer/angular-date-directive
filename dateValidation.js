(function () {
    angular.module('utils').factory('hcDateValidation', ["$filter", "$window", "$parse","$timeout", function ($filter, $window, $parse, $timeout) {
        var validation = {};

        function setGriderroClass(element, msg, grid, error) {
            if (grid) {
                if (error) {
                    $(element).parent().parent().parent().addClass('has-error');

                } else {
                    $(element).parent().parent().parent().removeClass('has-error');
                }
            }
        }
        validation.validateDate = function (scope, event, element, ngModel, setter, grid) {
            //init
            var msg = null;
            element.css('background', 'white');
            ngModel.$setValidity('date', true);
            ngModel.$setValidity('min', true);
            ngModel.$setValidity('max', true);
            ngModel.$setValidity('required', true);
            var maxDate = $parse(self.maxDate)(scope);
            var minDate = $parse(self.minDate)(scope);

            var date = null;
            var delimeter = "/";
            var yy, mm, dd;
            var tempValue = element.val();
            if (tempValue) {
                tempValue = tempValue.trim();
            }
            
            //if nothing entered - exit with required validation fail
            if (!tempValue || tempValue.trim().length === 0) {
                date = null;
                ngModel.$setValidity('required', false);
                msg = "The date is required";
                setGriderroClass(element, msg, grid, true);
                $timeout(function () {
                    setter(scope, date);
                });
                return;
            }

            //if the date is not valid length
            if ((tempValue.length !== 6 && tempValue.length !== 8 && tempValue.length !== 10) || new Date(tempValue) === "Invalid Date") {
                ngModel.$setValidity('date', false);
                msg = "The date is invalid";
                setGriderroClass(element, msg, grid, true);
                $timeout(function () {
                    setter(scope, tempValue);
                });
                return;
            }

            if (tempValue.indexOf("/") !== -1) {
                date = $filter('date')(tempValue, "MM/dd/yyyy");
            } else
                if (tempValue.indexOf("-") !== -1) {
                    date = $filter('date')(tempValue, "MM-dd-yyyy");
                    delimeter = "-";
                } else
                    date = $filter('date')(tempValue, "MMddyyyy");

            if (date === "12311969" && tempValue.length === 6) {
                //convert 2-digit year to 4 digits
                //add 2000 for 21st century
                yy = String(tempValue).substring(4, 6);
                yy = parseInt(yy) + 2000;
                mm = String(tempValue).substring(0, 2);
                dd = String(tempValue).substring(2, 4);
                date = mm + delimeter + dd + delimeter + yy;
            } else
                if (date === "12311969" && tempValue.length === 8) {
                    //reformat to mm/dd/yyyy
                    yy = String(tempValue).substring(4, 8);
                    mm = String(tempValue).substring(0, 2);
                    dd = String(tempValue).substring(2, 4);
                    date = mm + delimeter + dd + delimeter + yy;
                }

            if (date === "mm/dd/yyyy") {
                date = null;
                ngModel.$setValidity('required', false);
                msg = "The date is required";
                setGriderroClass(element, msg, grid, true);
                $timeout(function () {
                    setter(scope, date);
                });
                return;
            }

            var split = date.split(delimeter);
            yy = parseInt(split[2]);
            if (String(yy).length !== 4) {
                yy += 2000;
            }
            mm = String("0" + (parseInt(split[0]))).slice(-2);
            dd = String("0" + parseInt(split[1])).slice(-2);
            date = mm + delimeter + dd + delimeter + yy;

            // if the date entered is a valid date then save the value
            var maxValidation = !maxDate ? true : new Date(date) <= new Date(maxDate);
            var minValidation = !minDate ? true : new Date(date) >= new Date(minDate);
            var dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
            var dateRegexWithDashes = /^(0[1-9]|1[0-2])-(0[1-9]|1\d|2\d|3[01])-(19|20)\d{2}$/;

            //valid date
            var invalidDate = false;
            if (date && angular.isDefined(new Date(date))) {
                var fdate = new Date(date).toString();
                var fdd = parseInt(new Date(fdate).getDate());
                var fmm = parseInt(new Date(fdate).getMonth() + 1);
                var fyy = parseInt(new Date(fdate).getFullYear());
                if (parseInt(dd) !== fdd || parseInt(mm) !== fmm || parseInt(yy) !== fyy) {
                    invalidDate = true;
                }
            }

            if (date && (dateRegex.test(date) || dateRegexWithDashes.test(date)) && !invalidDate && maxValidation && minValidation && new Date(date) >= new Date("01/01/1900")) {
                var newValue = date;
                if (dateRegexWithDashes.test(date)) {
                    //replace date 99-99-9999 with 99/99/9999
                    newValue = date.replace(/-/g, "/");
                }

                //$(element).parent().parent().parent().removeAttr('title', msg);
                if (scope.$parent && scope.$parent.$parent && scope.$parent.$parent.col && scope.$parent.$parent.col.grid) {
                    scope.$parent.$parent.col.grid.api.cellNav.getCurrentSelection()[0].row.entity.WorkDateValidation = null;
                }
                setGriderroClass(element, msg, grid, false);

                $timeout(function () {
                    setter(scope, newValue);
                });
            } else {
                //show an error and clear the value
                //element.css('background', 'pink');
                if (!date) {
                    ngModel.$setValidity('required', false);
                    msg = "The date is required";
                } else if (invalidDate) {
                    ngModel.$setValidity('date', false);
                    msg = "The date is invalid";
                } else if (!maxValidation) {
                    ngModel.$setValidity('max', false);
                    msg = "The max date is " + new Date(maxDate);
                } else if (!minValidation) {
                    ngModel.$setValidity('min', false);
                    msg = "The minimum date is " + new Date(minDate);
                } else {
                    ngModel.$setValidity('date', false);
                    msg = "The date is invalid";
                }

                //$(element).parent().parent().parent().attr('title', msg);
                if (scope.$parent && scope.$parent.$parent && scope.$parent.$parent.col && scope.$parent.$parent.col.grid) {
                    scope.$parent.$parent.col.grid.api.cellNav.getCurrentSelection()[0].row.entity.WorkDateValidation = msg;
                }
                setGriderroClass(element, msg, grid, true);

                if (date && date.indexOf("NaN") !== -1) {
                    date = tempValue;
                }

                $timeout(function () {
                    setter(scope, date);
                });
            }
        }

        return validation;
    }]);
})();
