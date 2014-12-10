angular.module('Befunge')
    .factory('interpreter', function () {
        var exec = {
            '+': math, '-': math, '*': math, '/': math, '%': math,
            '!': not,
            '`': gt,
            '>': move, '<': move, '^': move,  'v': move, '?': move,
            '_': popmove, '|': popmove,
            '"': string,
            ':': dupe,
            '\\': swap,
            '$': discard,
            '.': output, ',': output,
            '#': skip,
            'p': put,
            'g': get,
            '&': numin,
            '@': end,
            ' ': nop
        };
        for(var i=0;i<=9;i++) {
            exec[i] = push;
        }

        function push(state, val) {
            state.stack.push(+val);
        }
        function math(state, op) {
            var a = state.stack.pop() || 0;
            var b = state.stack.pop() || 0;
            var res;
            switch (op) {
                case '+': res = b + a; break;
                case '-': res = b - a; break;
                case '*': res = b * a; break;
                case '/': res = a === 0 ? 0 : b / a; break;
                case '%': res = a === 0 ? 0 : b % a; break;
            }
            state.stack.push(res);
        }
        function not(state) {
            state.stack.push(state.stack.pop() === 0 ? 1 : 0);
        }
        function gt(state) {
            var a = state.stack.pop();
            var b = state.stack.pop();
            state.stack.push(b > a ? 1 : 0)
        }
        var dirs = { '>':0, 'v':1, '<':2, '^':3 };
        function move(state, dir) {
            state.dir = dir === '?' ? Math.floor(Math.random() * 4) : dirs[dir];
        }
        function popmove(state, dir) {
            state.dir = (state.stack.pop() === 0 ? 0 : 2) + (dir === '_' ? 0 : 1);
        }
        function string(state) {
            state.string = !state.string;
        }
        function dupe(state) {
            state.stack.push(state.stack.length > 0 ? state.stack[state.stack.length - 1] : 0);
        }
        function numin(state, op) {
            var val = prompt('Enter number');
            val = val || '0';
            val = +val;
            if (isNaN(val)) {
                val = 0;
            }
            state.stack.push(val);
        }
        function swap(state) {
            var len = state.stack.length;
            if(len === 0) {
                return;
            } if(len == 1) {
                state.stack.push(0);
            } else {
                var tmp = state.stack[len - 1];
                state.stack[len - 1] = state.stack[len - 2];
                state.stack[len - 2] = tmp;
            }
        }
        function discard(state) {
            state.stack.pop();
        }
        function output(state, op) {
            if(state.stack.length > 0) {
                var out = state.stack.pop();
                if(op === ',')
                    out = String.fromCharCode(out);
                state.output += out;
            }
        }
        function skip(state) {
            state.skip = true;
        }
        function put(state) {
            var y = state.stack.pop();
            var x = state.stack.pop();
            var v = state.stack.pop();
            ensureSize(state, x+1, y+1);
            state.rows[y][x] = String.fromCharCode(v);
        }
        function get(state) {
            var y = state.stack.pop();
            var x = state.stack.pop();
            state.stack.push(isInBounds(state, x, y) ? state.rows[y][x].charCodeAt(0) : ' ');
        }
        function end(state) {
            state.done = true;
        }
        function nop() {}

        function makeSpace(length) {
            return Array.apply(null, new Array(length)).map("".valueOf, ' ');
        }

        function flattenRows(state) {
            var width = state.width;
            state.rows.forEach(function (row) {
                if(width > row.length) {
                    row.push.apply(row, makeSpace(width - row.length));
                }
            });
        }

        function ensureSize(state, width, height) {
            if(width > state.width) {
                state.width = width;
                flattenRows(state);
            }
            if(height > state.height) {
                for(var i=state.height;i<height;i++) {
                    state.rows[i] = makeSpace(state.width);
                }
                state.height = height;
            }
        }

        function isInBounds(state, x, y) {
            return y >= 0 && y < state.height && x >= 0 && x < state.width;
        }

        function step(state) {
            if (state.dir === 0) {
                state.x++;
                if(state.x >= state.width) state.x = 0;
            } else if (state.dir === 1) {
                state.y++;
                if(state.y >= state.height) state.y = 0;
            } else if (state.dir === 2) {
                state.x--;
                if(state.x < 0) state.x = state.width - 1;
            } else {
                state.y--;
                if(state.y < 0) state.y = state.height - 1;
            }

            if (state.skip) {
                state.skip = false;
            } else {
                var action = state.rows[state.y][state.x];
                if (state.string) {
                    if (action === '"') {
                        state.string = false;
                    } else {
                        state.stack.push(action.charCodeAt(0));
                    }
                } else {
                    var op = exec[action];
                    if (!op)
                        throw "Unsupported action: " + action;

                    op(state, action);
                }
            }
        }

        return function (code) {
            var rows = (code || "").split('\n').map(function (line) {
                return line.split("");
            });
            var state = {
                stack: [],
                output: "",
                rows: rows,
                x: -1,
                y: 0,
                dir: 0,
                done: false,
                string: false,
                width: rows.reduce(function (max, row) {
                    return Math.max(max, row.length);
                }, 0),
                height: rows.length
            };

            flattenRows(state);

            return {
                state: state,
                step: function () {
                    if(state.done)
                        return false;

                    try {
                        step(state);
                    } catch(e) {
                        state.error = e;
                        state.done = true;
                    }
                    return !state.done;
                }
            };
        }
    });
