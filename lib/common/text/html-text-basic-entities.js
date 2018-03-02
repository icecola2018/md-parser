var htmlText = require('./html-text');
var entities = require('./basic-entities.json');
module.exports = function (text) {
    return htmlText(text, entities);
}