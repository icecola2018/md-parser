var Worker = require('../common/worker');
var unescapeHtml = require('../common/text/unescape-html');

function work(list, share) {
    var unescapeText = this.unescapeText;
    var unescapeAttr = this.unescapeAttr;
    share.output = (function parseList(l) {
        var html = '';
        l.forEach(function (sec) {
            switch (sec.type) {
                case 'inline-code':
                    html += '<code>' + unescapeText(sec.content) + '</code>';
                    break;
                case 'link':
                    html += '<a';
                    if (sec.url) {
                        html += ' href="' + unescapeAttr(sec.url) + '"';
                    }
                    if (sec.title) {
                        html += ' title="' + unescapeAttr(sec.title) + '"';
                    }
                    html += '>';
                    if (sec.list.length) {
                        html += parseList(sec.list);
                    }
                    html += '</a>';
                    break;
                case 'image':
                    html += '<img';
                    if (sec.url) {
                        html += ' src="' + unescapeAttr(sec.url) + '"';
                    }
                    if (sec.title) {
                        html += ' title="' + unescapeAttr(sec.title) + '"';
                    }
                    if (sec.alt) {
                        html += ' alt="' + unescapeAttr(sec.alt) + '"';
                    }
                    html += '/>';
                    break;
                case 'br':
                    html += '<br>';
                    break;
                case 'del':
                case 'em':
                case 'strong':
                    html += '<' + sec.type + '>';
                    if (sec.list.length) {
                        html += parseList(sec.list);
                    }
                    html += '</' + sec.type + '>';
                    break;
                case 'em-strong':
                    html += '<em><strong>';
                    if (sec.list.length) {
                        html += parseList(sec.list);
                    }
                    html += '</strong></em>';
                    break;
                case 'final':
                    html += unescapeText(sec.text);
                    break;
                case 'raw':
                    html += share.srcOf(sec);
                    break;
                default:
                    throw new Error('unknown type: ' + sec.type);
            }
        });
        return html;
    })(list);
}

module.exports = function (unescapeHtmlText, unescapeHtmlAttr) {
    if (arguments.length < 2 || typeof unescapeHtmlAttr !== 'function') {
        unescapeHtmlAttr = unescapeHtml;
    }
    if (arguments.length < 1 || typeof unescapeHtmlText !== 'function') {
        unescapeHtmlText = unescapeHtml;
    }

    return new Worker(work).set({
        unescapeText: unescapeHtmlText,
        unescapeAttr: unescapeHtmlAttr
    });
};