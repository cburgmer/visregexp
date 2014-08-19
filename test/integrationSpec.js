var fs = require('fs'),
    mockFs = require('mock-fs'),
    pngparse = require('pngparse'),
    SetCollection = require("collections/set"),
    http = require('http'),
    visregexp = require('../index');

describe("VisRegExp", function () {
    var url, thingsToClose;

    var collectColorsInRgbNotation = function (colorArray) {
        var set = SetCollection(),
            i;

        for(i = 0; i < colorArray.length; i += 4) {
            set.add('rgb(' + colorArray[i] + ', ' + colorArray[i+1] + ', ' + colorArray[i+2] + ')');
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

    beforeEach(function () {
        mockFs({
          'screenshots': {}
        });

        thingsToClose = [];
    });

    afterEach(function () {
        mockFs.restore();

        thingsToClose.forEach(function (thing) {
            thing.close();
        });
    });

    it("should take screenshot of a given url", function (done) {
        var green = 'rgb(0, 128, 0)',
            greenPage = serveUpMockPage('<html style="background: ' + green + ';"></html>');

        visregexp.takeScreenshot(greenPage, function () {
            pngparse.parseFile('screenshots/file.png', function (_, imageData) {
                var usedColors = collectColorsInRgbNotation(imageData.data);
                expect(usedColors).toEqual([green]);

                done();
            });
        });
    });
});
