// ---- automata functions ----

/** Return a function for a numbered elementary cellular automata rule. */
var rule = function(num, base)
{
    var values = [];
    for (var n = 0; n < Math.pow(base, 3); n++) {
        values[n] = num & Math.pow(2, n);
    }

    return function(a, b, c) {
        return values[(a ? (base * base) : 0) + (b ? base : 0) + (c ? 1 : 0)];
    };
};

/** Return either true or false, randomly. */
var coinToss = function()
{
    return Math.random() < 0.5;
};

/**
 * Return true or false, with likelihood of true dependent on how close
 * the number is to the given maximum number. Produces a gradient.
 */
var fade = function(max) {
    return function(i) {
        return Math.random() < (i / max);
    };
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
var cellularlyAutomate = function(width, height, initialConditions, lifeFunction)
{
    // Set up the entire image
    var image = [];
    
    // Set up the first row
    image[0] = [];
    for (var i = 0; i < width; i++) {
        image[0][i] = initialConditions(i);
    }
    
    // Iterate through the other rows
    for (var j = 1; j < height; j++) {
        image[j] = [];
        for (i = 0; i < width; i++) {
            var a = (i == 0) ? image[j - 1][width - 1] : image[j - 1][i - 1];
            var b = image[j - 1][i];
            var c = (i == width - 1) ? image[j - 1][0] : image[j - 1][i + 1];
            image[j][i] = lifeFunction(a, b, c);
        }
    }
    
    // That's it!
    return image;
}

/** Paint an image onto a canvas's context. */
var paintImage = function(context, colours, image)
{
    // The unpainted canvas is already white, so we only need to
    // paint the filled-in pixels.
    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            if (image[j][i]) {
                // There are various ways to paint a 1x1 pixel:
                // http://jsperf.com/setting-canvas-pixel
                // I've chosen the one that works for me.
                context.fillStyle = colours[image[j][i]];
                context.fillRect(i, j, 1, 1);
            }
        }
    }
}

// ---- the actual page ----

/**
 * Get a parameter from the query string.
 * Taken from http://stackoverflow.com/a/901144/3484614
 */
var parameter = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var canvas = document.getElementById('canvas');
var width = canvas.width;
var height = canvas.height;

var myColours = {
    true: '#444',
    false: '#fff'
}

// Ages ago, life was born in the primitive sea...
var number = parameter('rule') || 110;
var life = rule(number, 2);
var initialConditions = coinToss;  // random
var image = cellularlyAutomate(canvas.width, canvas.height, initialConditions, life);

paintImage(canvas.getContext('2d'), myColours, image);