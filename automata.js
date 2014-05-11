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
     */
    a.cellularlyAutomate = function(row, wrap, lifeFunction)
    {
        var nextRow = [];
        var width = row.length;

        for (var i = 0; i < width; i++) {
            var a = (i === 0)
                ? (wrap === 'random')
                    ? coinToss()
                    : (wrap === 'false')
                        ? image[j - 1][i]
                        : image[j - 1][image.width - 1]
                : image[j - 1][i - 1];

            var b = image[j - 1][i];

            var c = (i == image.width - 1)
                ? (wrap === 'random')
                    ? coinToss()
                    : (wrap === 'false')
                        ? image[j - 1][i]
                        : image[j - 1][0]
                : image[j - 1][i + 1];

            nextRow[i] = lifeFunction(a, b, c);
        }

        return nextRow;
    };

    return a;
}(automata || {}));
