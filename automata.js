// mindless automata!
// https://github.com/ogham/mindless-automata

// ---- automata functions ----

/** Return a function for a numbered elementary cellular automata rule. */
var generate = function(str, radix)
{
    return function(a, b, c) {
        var position = (a * radix * radix) + (b * radix) + c;
        return parseInt(str.charAt(str.length - position - 1));
    };
};

/** Return a zero-padded string of the number in the given base. */
var stringify = function(number, radix)
{
    var str = number.toString(radix);
    return new Array(Math.pow(radix, 3) + 1 - str.length).join('0') + str;
};

/**
**/
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
var cellularlyAutomate = function(width, height, pixelSize, initialConditions, lifeFunction)
{
	var wrap = parameter('wrap');
	
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
            var a = (i == 0) 
				? (wrap == 'random') 
					? coinToss() 
					: (wrap == 'false') 
						? image[j - 1][i]
						: image[j - 1][image.width - 1] 
				: image[j - 1][i - 1];
				
            var b = image[j - 1][i];
			
            var c = (i == image.width - 1)
				? (wrap == 'random') 
					? coinToss() 
					: (wrap == 'false') 
						? image[j - 1][i]
						: image[j - 1][0]
				: image[j - 1][i + 1];
				
            image[j][i] = lifeFunction(a, b, c);
        }
    }

    // That's it!
    return image;
};

/** Paint an image onto a canvas's context. */
var paintImage = function(context, colours, image)
{
    // The unpainted canvas is already white, so we only need to
    // paint the filled-in pixels.
    for (var j = 0; j < image.height; j++) {
        for (var i = 0; i < image.width; i++) {
            // There are various ways to paint a 1x1 pixel:
            // http://jsperf.com/setting-canvas-pixel
            // I've chosen the one that works for me.
            var pixel = image[j][i];
            context.fillStyle = colours[pixel];
            context.fillRect(i * image.pixelSize, j * image.pixelSize, image.pixelSize, image.pixelSize);
        }
    }
}

// ---- the actual page ----

/**
 * Get a parameter from the query string.
 * Taken from http://stackoverflow.com/a/901144/3484614
 */
var parameter = function(name)
{
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
};

var canvas = document.getElementById('canvas');
var panelSize = parameter('panelSize');

var docWidth = document.width;
var docHeight = document.height;

if (panelSize == 'full') {
	canvas.style.marginTop = 0;
	canvas.style.padding = 0;
	canvas.style.top = 0;
	canvas.style.position = 'absolute';
	canvas.width = docWidth;
	canvas.height = docHeight;
}
else
{
	canvas.width = 1000;
	canvas.height = 500;
}

var pixelSize = parseInt(parameter('pixelSize')) || 1;

var myColours = [ '#fff', '#444', '#888', '#bbb' ];

// Ages ago, life was born in the primitive sea...
var string = parameter('string');
var radix = parameter('radix') || 2;
var rule = parameter('rule');

// The user can input either a string, or a rule number, and a radix.
// If we already have a string, then use that. But if we have a rule,
// then the rule will have to be turned into a string.
if (rule && !string) {
    string = stringify(parseInt(rule), radix);
} else if (!rule && !string) {
    // If we have neither then just go with a cool default! Rule 73 is
    // an interesting start! Other good ones are 110 and 30.
    // In base 3, try 7110222193934.
    string = stringify(73, 2);
}

// Set up the initial conditions...
var ic = parameter('ic');
	
if ((canvas.width % pixelSize) != 0) {
	canvas.width = canvas.width + (pixelSize - (canvas.width % pixelSize));
}

if (ic == 'middle') {
	if (Math.floor(canvas.width / pixelSize) % 2 == 0) {
		canvas.width = canvas.width + pixelSize;
	}
}

if (panelSize == 'full') {	
	if (canvas.width != docWidth) {
		canvas.style.left = "" + (Math.floor(0 - ((canvas.width - docWidth) / 2))) + "px";
	}
	else
	{
		canvas.style.left = 0;
	}
}

var initialConditions;
if (ic == null || ic == 'random') {
    initialConditions = function() { return Math.floor(Math.random() * radix); };
} else if (ic == 'middle') {
    initialConditions = function(i) { return (i == Math.floor(canvas.width / pixelSize / 2)) ? 1 : 0; };
} else if (ic.match(/\d/)) {
    var n = parseInt(ic);
    initialConditions = function() { return n; };
}

// ...and generate the image...
var life = generate(string, radix);
var image = cellularlyAutomate(canvas.width, canvas.height, pixelSize, initialConditions, life);

// ...and display it!
paintImage(canvas.getContext('2d'), myColours, image);
