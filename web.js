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

/** Paint a row onto a canvas's context. */
var paintRow = function(context, colours, y, pixelSize, data)
{
    for (var i = 0; i < data.length; i++) {
        // There are various ways to paint a 1x1 pixel:
        // http://jsperf.com/setting-canvas-pixel
        // I've chosen the one that works for me.
        context.fillStyle = colours[data[i]];
        context.fillRect(i * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
};

var getInitialConditions = function(ic, radix)
{
    if (ic === null || ic === 'random') {
        return function() { return Math.floor(Math.random() * radix); };
    } else if (ic === 'middle') {
        return function(i) { return (i === Math.floor(canvas.width / pixelSize / 2)) ? 1 : 0; };
    } else if (ic.match(/\d/)) {
        var n = parseInt(ic);
        return function() { return n; };
    }
};

var getWrap = function(wrap, radix)
{
    if (wrap === 'random') {
        return function() { return Math.floor(Math.random() * radix); };
    } else if (wrap == 'true') {
        return function(wrapped) { return wrapped; };
    } else {
        return function() { return 0; };
    }
};

// Ages ago, life was born in the primitive sea...
var getLife = function()
{
    var string = parameter('string');
    var radix = parameter('radix') || 2;
    var rule = parameter('rule');

    // The user can input either a string, or a rule number, and a radix.
    // If we already have a string, then use that. But if we have a rule,
    // then the rule will have to be turned into a string.
    if (string) {
        return { radix: radix, string: string };
    } else if (rule && !string) {
        return { radix: radix, string: automata.stringify(parseInt(rule), radix) };
    } else if (!rule && !string) {
        // If we have neither then just go with a cool default!
        return { radix: 2, string: automata.stringify(73, 2) };
    }
};

var getPixelSize = function() {
    return parseInt(parameter('pixelSize')) || 1;
};

var getColours = function() {
    return [ '#fff', '#444', '#2d2', '#d22' ]; // todo ;)
};

var resizeCanvas = function(canvas, panelSize, pixelSize)
{
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
};

// ---- web stuff ----

// Get options from the query string
var pixelSize = getPixelSize();
var myColours = getColours();
var options = getLife();
var wrap = getWrap(parameter('wrap'), options.radix);
var lifeFunction = automata.generate(options.string, options.radix);

var ic = parameter('ic');
var initialConditions = getInitialConditions(ic, options.radix);

// Set up the canvas
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var panelSize = parameter('panelSize');
resizeCanvas(canvas, panelSize, pixelSize);

// Paint the first row
var row = automata.initialRow(canvas.width / pixelSize, initialConditions);
paintRow(context, myColours, 0, pixelSize, row);
var rowNum = 1;

var interval = setInterval(function()
{
    // JavaScript updation seems to work a lot better if you do them in large
    // batches - but not too large, since it just slows it down again and then
    // there's no point rendering the image progressively. 20 will do.
    for (var n = 0; n < 20; n++) {
        var nextRow = automata.cellularlyAutomate(row, wrap, lifeFunction);
        paintRow(context, myColours, rowNum, pixelSize, nextRow);
        row = nextRow;

        if (rowNum++ === canvas.height / pixelSize) {
            window.clearInterval(interval);
            break;
        }
    }
}, 1);
