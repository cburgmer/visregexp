var fs = require('fs'),
    jar = require('selenium-server-standalone-jar'),
    webdriver = require('selenium-webdriver'),
    SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

var server = new SeleniumServer(jar.path, {
  port: 4444
});

server.start();

var renderPage = function (url, callback) {
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

exports.takeScreenshot = function (url, callback) {
    renderPage(url, function (image) {
        fs.writeFile('screenshots/file.png', image, callback);
    });
};
