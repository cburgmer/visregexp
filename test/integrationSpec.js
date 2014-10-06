var fs = require('fs'),
    mockFs = require('mock-fs'),
    pngparse = require('pngparse'),
    Png = require('pngjs').PNG,
    SetCollection = require("collections/set"),
    http = require('http'),
    visregexp = require('../index');

describe("VisRegExp", function () {
    var url, thingsToClose;

    var green = [0, 128, 0, 255];

    var cssRgba = function (r, g, b, a) {
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    };

    var collectColorsInRgbaNotation = function (colorArray) {
        var set = SetCollection(),
            i;

        for(i = 0; i < colorArray.length; i += 4) {
            set.add(cssRgba(colorArray[i], colorArray[i+1], colorArray[i+2], colorArray[i+3]));
        }

        return set.toArray();
    };

    var serveUpMockPage = function (content) {
        var port = 8764;

        server = http.createServer(function (_, res) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end(content);
        });

        server.listen(port);

        thingsToClose.push(server);

        return 'http://localhost:' + port;
    };

    var createPng = function (width, height, color, callback) {
        var png = new Png({
                width: width,
                height: height,
                filterType: -1
            }),
            i;

        for(i = 0; i < png.data.length; i += 4) {
            png.data[i] = color[0];
            png.data[i+1] = color[1];
            png.data[i+2] = color[2];
            png.data[i+3] = color[3];
        }

        var stream = png.pack(),
            chunks = [],
            buffer;
        stream.on('data', function (chunk) {
            chunks.push(chunk);
        });
        stream.on('end', function (chunk) {
            buffer = Buffer.concat(chunks);

            callback(buffer);
        });
    };

    beforeEach(function () {
        thingsToClose = [];
    });

    afterEach(function () {
        mockFs.restore();

        thingsToClose.forEach(function (thing) {
            thing.close();
        });
    });

    it("should take screenshot of a given url", function (done) {
        var greenRgba = cssRgba.apply(null, green),
            greenPage = serveUpMockPage('<html style="background: ' + greenRgba + ';"></html>');

        mockFs({
            'screenshots': {}
        });

        visregexp.takeScreenshot(greenPage, {}, function () {
            pngparse.parseFile('screenshots/file.png', function (_, imageData) {
                var usedColors = collectColorsInRgbaNotation(imageData.data);
                expect(usedColors).toEqual([greenRgba]);

                done();
            });
        });
    });

    it("should take screenshot with hover effect", function (done) {
        var greenRgba = cssRgba.apply(null, green),
            greenPage = serveUpMockPage('<html><style>html:hover {background: ' + greenRgba + ';}</style></html>');

        mockFs({
            'screenshots': {}
        });

        visregexp.takeScreenshot(greenPage, {hover: 'html'}, function () {
            pngparse.parseFile('screenshots/file.png', function (_, imageData) {
                var usedColors = collectColorsInRgbaNotation(imageData.data);
                expect(usedColors).toEqual([greenRgba]);

                done();
            });
        });
    });

    it("should take screenshot with active effect", function (done) {
        var greenRgba = cssRgba.apply(null, green),
            greenPage = serveUpMockPage('<html><style>html:active {background: ' + greenRgba + ';}</style></html>');

        mockFs({
            'screenshots': {}
        });

        visregexp.takeScreenshot(greenPage, {active: 'html'}, function () {
            pngparse.parseFile('screenshots/file.png', function (_, imageData) {
                var usedColors = collectColorsInRgbaNotation(imageData.data);
                expect(usedColors).toEqual([greenRgba]);

                done();
            });
        });
    });

    // TODO make this happen
    xit("should trigger active effect independently of hover", function (done) {
        var greenRgba = cssRgba.apply(null, green),
            greenPage = serveUpMockPage('<html><style>* {color: rgba(0,0,0,0);} a:active {background: ' + greenRgba + ';} a:hover {background: red;}</style><a href="#">click me</a></html>');

        mockFs({
            'screenshots': {}
        });

        visregexp.takeScreenshot(greenPage, {active: 'a'}, function () {
            pngparse.parseFile('screenshots/file.png', function (_, imageData) {
                var usedColors = collectColorsInRgbaNotation(imageData.data);
                expect(usedColors).toEqual([greenRgba]);

                done();
            });
        });
    });

    it("should successfully compare the screenshot to the reference image", function (done) {
        var greenPage = serveUpMockPage('<html style="background: ' + cssRgba.apply(null, green) + ';"></html>');

        createPng(400, 300, green, function (aPng) {
            mockFs({
                'screenshots': {
                    'file.png': aPng
                }
            });

            visregexp.testPage(greenPage, function (result) {
                expect(result).toEqual('passed');

                done();
            });
        });
    });

    it("should fail if screenshot doesn't compare to the reference image", function (done) {
        var greenPage = serveUpMockPage('<html style="background: ' + cssRgba.apply(null, green) + ';">' +
                '<div style="width: 1px; height: 1px; background: rgb(0, 127, 0);"></div>' +
                '</html>');

        createPng(400, 300, green, function (aPng) {
            mockFs({
                'screenshots': {
                    'file.png': aPng
                }
            });

            visregexp.testPage(greenPage, function (result) {
                expect(result).toEqual('failed');

                done();
            });
        });
    });
});
