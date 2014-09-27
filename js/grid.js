angular.module("Befunge")
    .directive('grid', function () {
        return function (scope, elem, attr) {
            elem.addClass("grid");

            var current;
            scope.$watch(attr.grid, function (state) {
                elem.empty();
                state.rows.forEach(function (row) {
                    var rowElem = angular.element(document.createElement("div"));
                    rowElem.addClass("gridRow");
                    elem.append(rowElem);

                    row.forEach(function (cell) {
                        var cellElem = angular.element(document.createElement("div"));
                        cellElem.addClass("gridCell");
                        if(cell === " ") {
                            cellElem.addClass("blank");
                        } else {
                            var code = cell.charCodeAt(0);
                            var isNum = code < 32 || code > 126;
                            cellElem.text(isNum ? code : cell);
                            if(isNum) cellElem.addClass("num");
                        }
                        rowElem.append(cellElem);
                    });
                });

                if(current)
                    current.removeClass("current");
                if(state)
                    current = elem.children().eq(state.y).children().eq(state.x).addClass("current");
            });
        }
    });