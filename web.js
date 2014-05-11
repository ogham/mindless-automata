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
    return [ '#fff', '#444', '#888', '#bbb' ]; // todo ;)
};

var resizeCanvas = function(canvas, panelSize, pixelSize, ic)
{
    var docWidth = document.width;
    var docHeight = document.height;

    // Expand the image to fill the frame
    if (panelSize === 'full') {
        canvas.className = 'full';
        canvas.width = docWidth;
        canvas.height = docHeight;
    }

    // Round the width up to the nearest pixelSize
    if ((canvas.width % pixelSize) !== 0) {
        canvas.width += pixelSize - (canvas.width % pixelSize);
    }

    // If the user has specified the 'middle' initial condition, then it makes
    // more sense for the image to have a central column, rather than two
    // middle columns. So add one extra pixel if the width turns out to be an
    // odd number.
    if (ic === 'middle' && Math.floor(canvas.width / pixelSize) % 2 === 0) {
        canvas.width += pixelSize;
    }

    // Finally, if the user has specified full size, then centre the image on
    // the page.
    if (panelSize === 'full' && canvas.width !== docWidth) {
        var newWidth = Math.floor((docWidth - canvas.width) / 2);
        canvas.style.left = newWidth + "px";
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
resizeCanvas(canvas, panelSize, pixelSize, ic);

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
