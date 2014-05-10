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
     * Return an array of arrays (rows first, then columns) of the result of
     * calling the given cellular automaton repeatedly.
     *
     * The width and height are the limits of the dimensions it should expand
     * into. The initialConditions function is called once per column for the
     * first row, taking the column number as an optional parameter. The life
     * function is then called once per cell, taking three arguments with the
     * above-left, above, and above-right cells as values.
     */
    a.cellularlyAutomate = function(width, height, wrap, pixelSize, initialConditions, lifeFunction)
    {
        // Set up the entire image
        var image = [];
        image.width = width / pixelSize;
        image.height = height / pixelSize;
        image.pixelSize = pixelSize;

        // Set up the first row
        image[0] = [];
        for (var i = 0; i < image.width; i++) {
            image[0][i] = initialConditions(i);
        }

        // Iterate through the other rows
        for (var j = 1; j < image.height; j++) {
            image[j] = [];
            for (i = 0; i < image.width; i++) {
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

                image[j][i] = lifeFunction(a, b, c);
            }
        }

        // That's it!
        return image;
    };

    return a;
}(automata || {}));
