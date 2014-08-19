var fs = require('fs'),
    mockFs = require('mock-fs'),
    pngparse = require('pngparse'),
    Set = require("collections/set"),
    http = require('http'),
    visregexp = require('../index');

describe("VisRegExp", function () {

    var arrayValueSet = function () {
        return new Set([], function (a, b) {
            return a.length === b.length && a.filter(function (val, i) {
                return val !== b[i];
            }).length === 0;
        }, function () { return ''; });
    };

    var collectColors = function (colorArray) {
        var set = arrayValueSet(),
            i;

        for(i = 0; i < colorArray.length; i += 4) {
            set.add([colorArray[i], colorArray[i+1], colorArray[i+2], colorArray[i+3]]);
        };

        return set.toArray();
    };

    var url, server;

    beforeEach(function () {
        mockFs({
          'screenshots': {}
        });

        var port = 8764;

        server = http.createServer(function (_, res) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end('<html style="background: #008000;"></html>');
        });

        server.listen(port)

        url = 'http://localhost:' + port;
    });

    afterEach(function () {
        mockFs.restore();

        server.close();
    });

    it("should take screenshot of a given url", function (done) {
        var green = [0, 128, 0, 255];

        visregexp.takeScreenshot(url, function () {
            pngparse.parseFile('screenshots/file.png', function (_, imageData) {
                var usedColors = collectColors(imageData.data);
                expect(usedColors).toEqual([green]);

                done();
            });
        });
    });
});
