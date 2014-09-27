(function () {
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
        state.rows[y][x] = String.fromCharCode(v);
    }
    function get(state) {
        var y = state.stack.pop();
        var x = state.stack.pop();
        state.stack.push(state.rows[y][x].charCodeAt(0));
    }
    function end(state) {
        state.done = true;
    }
    function nop() {}

    function response(state) {
        postMessage(JSON.stringify(state, function (key, value) {
            switch (key) {
                case "rows": return undefined;
                case "done": case "string": return value || undefined;
                default: return value;
            }
        }));
    }

    function step(state) {
        if (state.y < 0 || state.y >= state.rows.length || state.x < 0 || state.x >= state.rows[state.y].length) {
            throw (state.string ? "Unterminated string" : "Out of bounds") + " (" + state.x + ", " + state.y + ")";
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

        if (state.dir === 0)
            state.x++;
        else if (state.dir === 1)
            state.y++;
        else if (state.dir === 2)
            state.x--;
        else
            state.y--;
    }

    onmessage = function (event) {
        postMessage("start");

        var state = {},
            code = event.data.code || "",
            requestUpdates = event.data.requestUpdates || false;

        try {
            state = {
                stack: [],
                output: "",
                rows: code.split('\n').map(function (line) {
                    return line.split("");
                }),
                x: 0,
                y: 0,
                dir: 0,
                done: false,
                string: false
            };

            while (!state.done) {
                if(requestUpdates)
                    response(state);

                step(state);
            }
        } catch(e) {
            state.done = true;
            state.error = e.stack || e;
        } finally {
            try {
                response(state);
            } finally{
                close();
            }
        }
    }
})();
