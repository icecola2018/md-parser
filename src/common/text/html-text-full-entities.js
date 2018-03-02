var htmlText = require('./html-text');
var entities = require('./full-entities.json');
module.exports = function (text) {
    return htmlText(text, entities);
}