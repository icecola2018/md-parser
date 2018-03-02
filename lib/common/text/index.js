module.exports = {
    'inline-code': require('./inline-code'),
    'image-alt': require('./image-alt'),
    'link-attr': require('./link-attr'),
    'link-label': require('./link-label'),
    'unescape-html': require('./unescape-html'),
    'no-change': function (text) {return text}
}