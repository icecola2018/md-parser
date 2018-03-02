module.exports = function (text) {
    return text.replace(/\\([\\\[\]!"#$%&'()*+,-./:;<=>?@^_`{|}~])/g, '$1');
};