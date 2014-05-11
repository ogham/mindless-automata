var automata = (function (a)
{
    /** Return a function for a numbered elementary cellular automata rule. */
    a.generate = function(str, radix)
    {
        return function(a, b, c) {
            var position = (a * radix * radix) + (b * radix) + c;
            return parseInt(str.charAt(str.length - position - 1));
        };
    };

    /** Return a zero-padded string of the number in the given base. */
    a.stringify = function(number, radix)
    {
        var str = number.toString(radix);
        return new Array(Math.pow(radix, 3) + 1 - str.length).join('0') + str;
    };

    var coinToss = function()
    {
        return Math.floor(Math.random() * radix);
    };

    /**
     * Produce an initial row by calling the given function once per column.
     */
    a.initialRow = function(width, initialFunction)
    {
        var row = [];

        for (var i = 0; i < width; i++) {
            row[i] = initialFunction(i);
        }

        return row;
    };

    /**
     * Given a row, produce a new row by iterating over every triple of cells,
     * forming a new row of cells, which is then returned.
     *
     * The wrapping function takes a value that would be the wrapped-around
     * value. It is up to the function whether it uses it or not.
     */
    a.cellularlyAutomate = function(row, wrapFunction, lifeFunction)
    {
        var nextRow = [];
        var width = row.length;

        for (var i = 0; i < width; i++) {
            var a = (i === 0) ? wrapFunction(row[width - 1]) : row[i - 1];
            var b = row[i];
            var c = (i === width - 1) ? wrapFunction(row[0]) : row[i + 1];

            nextRow[i] = lifeFunction(a, b, c);
        }

        return nextRow;
    };

    return a;
}(automata || {}));
