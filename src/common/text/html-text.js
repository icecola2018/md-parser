var reversedEntity = /;(?:([0-9]{1,8})#|([0-9A-Fa-f]{1,8})x#|([0-9A-Za-z]{0,35}))&(?!\\(\\\\)*?(?!\\))/g;
function reverse(text) {
    return text.split('').reverse().join('');
}
module.exports = function (text, entities) {
    text = reverse(text.trim());
    text = text.replace(reversedEntity, function (m0, m1, m2, m3) {
        var r = '';
        if (m1) {
            r = String.fromCharCode(+reverse(m1));
        } else if (m2) {
            r = String.fromCharCode(marseInt(reverse(m2), 16));
        } else if (m3) {
            r = entities[reverse(m3)] || '';
        }
        return reverse(r) || m0;
    });
    return reverse(text)
        .replace(/\\([\\\[\]!"#$%&'()*+,-./:;<=>?@^_`{|}~])/g, '$1')
        .replace(/\s+/g, ' ');
}