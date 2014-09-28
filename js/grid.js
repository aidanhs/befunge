angular.module('Befunge')
    .directive('grid', function () {
        return function (scope, elem, attr) {
            var current, focused, state;

            elem.addClass("grid");
            elem.bind('keydown', function (ev) {
                var key = ev.keyCode;
                if(key >=37 && key <= 40 && focused) {
                    switch (ev.keyCode) {
                        case 37: // left
                            if(focused.data("x") > 0) {
                                focused = angular.element(focused[0].previousSibling);
                            }
                            break;
                        case 38: // up
                            if(focused.data("y") > 0) {
                                focused = angular.element(focused.parent()[0].previousSibling).children().eq(focused.data("x"))
                            }
                            break;
                        case 39: // right
                            if(focused.data("x") < state.width - 1) {
                                focused = focused.next();
                            }
                            break;
                        case 40: // down
                            if(focused.data("y") < state.height - 1) {
                                focused = focused.parent().next().children().eq(focused.data("x"))
                            }
                            break;
                    }
                    focused[0].focus();
                }
            });

            scope.$watch(attr.grid, function (val) {
                state = val;
                elem.empty();
                if(state && state.rows) {
                    state.rows.forEach(function (row, y) {
                        var rowElem = angular.element(document.createElement("div")).addClass("gridRow");
                        elem.append(rowElem);

                        row.forEach(function (cell, x) {
                            var cellElem = angular.element(document.createElement("div"))
                                .data("x", x).data("y", y)
                                .addClass("gridCell")
                                .attr("tabindex", -1)
                                .bind('focus', function () {
                                    focused = cellElem;
                                });
                            if (cell === " ") {
                                cellElem.addClass("blank");
                            } else {
                                var code = cell.charCodeAt(0);
                                var isNum = code < 32 || code > 126;
                                cellElem.text(isNum ? code : cell);
                                if (isNum) cellElem.addClass("num");
                            }
                            rowElem.append(cellElem);
                        });
                    });
                }

                if(current)
                    current.removeClass("current");
                if(state && state.x >= 0)
                    current = elem.children().eq(state.y).children().eq(state.x).addClass("current");
            });
        }
    });