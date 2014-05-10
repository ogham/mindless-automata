/**
 * Get a parameter from the query string.
 * Taken from http://stackoverflow.com/a/901144/3484614
 */
var parameter = function(name)
{
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
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
};

var canvas = document.getElementById('canvas');
var panelSize = parameter('panelSize');

var docWidth = document.width;
var docHeight = document.height;

if (panelSize == 'full') {
    canvas.style.marginTop = 0;
    var width = document.width;
    var height = document.height;
    canvas.style.margin = 0;
    canvas.style.padding = 0;
    canvas.style.top = 0;
    canvas.style.position = 'absolute';
    canvas.width = docWidth;
    canvas.height = docHeight;
} else {
    canvas.width = 1000;
    canvas.height = 500;
}

var pixelSize = parseInt(parameter('pixelSize')) || 1;
var wrap = parameter('wrap') || false;

var myColours = [ '#fff', '#444', '#888', '#bbb' ];

// Ages ago, life was born in the primitive sea...
var string = parameter('string');
var radix = parameter('radix') || 2;
var rule = parameter('rule');

// The user can input either a string, or a rule number, and a radix.
// If we already have a string, then use that. But if we have a rule,
// then the rule will have to be turned into a string.
if (rule && !string) {
    string = automata.stringify(parseInt(rule), radix);
} else if (!rule && !string) {
    // If we have neither then just go with a cool default!
    radix = 2;
    string = automata.stringify(73, radix);
}

// Set up the initial conditions...
var ic = parameter('ic');

if ((canvas.width % pixelSize) !== 0) {
    canvas.width = canvas.width + (pixelSize - (canvas.width % pixelSize));
}

if (ic === 'middle') {
    if (Math.floor(canvas.width / pixelSize) % 2 === 0) {
        canvas.width = canvas.width + pixelSize;
    }
}

if (panelSize === 'full') {
    if (canvas.width != docWidth) {
        canvas.style.left = "" + (Math.floor(0 - ((canvas.width - docWidth) / 2))) + "px";
    } else {
        canvas.style.left = 0;
    }
}

var initialConditions;
if (ic === null || ic === 'random') {
    initialConditions = function() { return Math.floor(Math.random() * radix); };
} else if (ic === 'middle') {
    initialConditions = function(i) { return (i === Math.floor(canvas.width / pixelSize / 2)) ? 1 : 0; };
} else if (ic.match(/\d/)) {
    var n = parseInt(ic);
    initialConditions = function() { return n; };
}

// ...and generate the image...
var life = automata.generate(string, radix);
var image = automata.cellularlyAutomate(canvas.width, canvas.height, wrap, pixelSize, initialConditions, life);

// ...and display it!
paintImage(canvas.getContext('2d'), myColours, image);
