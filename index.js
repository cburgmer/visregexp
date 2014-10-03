var fs = require('fs'),
    jar = require('selenium-server-standalone-jar'),
    webdriver = require('selenium-webdriver'),
    SeleniumServer = require('selenium-webdriver/remote').SeleniumServer,
    imagediff = require('imagediff'),
    Image = require('canvas').Image;

var renderPageToBuffer = function (url, callback) {
    // TODO don't always start the server and throw it away again
    var server = new SeleniumServer(jar.path, {
      port: 4444
    });

    server.start();

    var driver = new webdriver.Builder()
        .usingServer(server.address())
        .withCapabilities(webdriver.Capabilities.phantomjs())
        .build();

    driver.get(url);

    driver.takeScreenshot().then(function (base64Image) {
        var decodedImage = new Buffer(base64Image, 'base64');

        driver.quit();
        callback(decodedImage);
    });
};

var renderPage = function (url, callback) {
    renderPageToBuffer(url, function (imageBuffer) {
        var image = new Image();
        image.onload = function () {
            callback(image);
        };
        image.src = imageBuffer;
    });
};

exports.takeScreenshot = function (url, callback) {
    renderPageToBuffer(url, function (image) {
        fs.writeFile('screenshots/file.png', image, callback);
    });
};

var readReferenceImage = function (filePath, callback) {
    fs.readFile(filePath, function(_, imageBuffer) {
        // TODO try to use lightweight pngparse instead of node-canvas
        var image = new Image();

        image.onload = function () {
            callback(image);
        };
        image.src = imageBuffer;
    });
};

exports.testPage = function (url, callback) {
    readReferenceImage('screenshots/file.png', function (referenceImage) {
        renderPage(url, function (currentImage) {
            var imagesAreEqual = imagediff.equal(currentImage, referenceImage);
                status = imagesAreEqual ? 'passed' : 'failed';

            callback(status);
        });
    });
};
