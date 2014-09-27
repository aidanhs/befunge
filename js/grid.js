angular.module("Befunge")
    .directive('grid', function () {
        return function (scope, elem, attr) {
            elem.addClass("grid");

            scope.$watch(attr.grid, function (source) {
                elem.empty();
                source.split('\n').forEach(function (row) {
                    var rowElem = angular.element(document.createElement("div"));
                    rowElem.addClass("gridRow");
                    elem.append(rowElem);

                    row.split('').forEach(function (cell) {
                        var cellElem = angular.element(document.createElement("div"));
                        cellElem.addClass("gridCell");
                        cellElem.text(cell);
                        rowElem.append(cellElem);
                    });
                });
            });
        }
    });