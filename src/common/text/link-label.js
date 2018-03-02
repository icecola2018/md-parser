module.exports = function (text) {
    return text.trim()
        .replace(/\\([\\\[\]!"#$%&'()*+,-./:;<=>?@^_`{|}~])/g, '$1')
        .replace(/\s+/g, ' ');
};