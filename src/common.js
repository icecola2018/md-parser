function Section() {
    for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === typeof '') {
            if (!('type' in this)) {
                this.type = arguments[i];
            }
        } else if (typeof arguments[i] === typeof 0) {
            if (!('begin' in this)) {
                this.begin = arguments[i];
            } else if (!('end' in this)) {
                this.end = arguments[i];
            }
        }
    }
    this.begin = this.begin || 0;
    this.end = this.end || 0;
    this.type = this.type || 'raw';
    this.list = [];
}
Section.prototype.length = function () {
    return this.end - this.begin;
}

function LabelManager(labelHandler, urlHandler, titleHandler) {
    this.dict = {};
    this.label = labelHandler;
    this.url = urlHandler;
    this.title = titleHandler;
}
LabelManager.prototype.addLabel = function (label, url, title) {
    if (this.dict[label]) {
        return false;
    }
    this.dict[label] = {
        url: url,
        title: title
    }
    return true;
};
LabelManager.prototype.info = function (label) {
    return this.dict[label];
};


var regexp = {
    entityReversed: /;(?:([0-9]{1,8})#|([0-9A-Fa-f]{1,8})x#|([0-9A-Za-z]{0,35}))&(?!\\(\\\\)*?(?!\\))/g,
    escape: /\\([\\\[\]!"#$%&'()*+,-./:;<=>?@^_`{|}~])/g,
    whitespace: /\s+/g,
};

function InlineCodeHandler() {}
InlineCodeHandler.prototype.handle = function (text) {
    return text.trim().replace(regexp.whitespace, ' ');
};

function LabelHandler() {}
LabelHandler.prototype.handle = function (text) {
    return text.trim().replace(regexp.escape, '$1').replace(regexp.whitespace, ' ');
};

function UrlHandler() {}
UrlHandler.prototype.handle = function (text) {
    return text.trim().replace(regexp.escape, '$1');
};

function HtmlAttrHandler() {}
HtmlAttrHandler.prototype.handle = function (text) {
    return text.trim().replace(regexp.escape, '$1')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2f;');
};

function HtmlTextHandler(entities) {
    this.entities = entities;
}
var reverse = function (text) {
    return text.split('').reverse().join('');
}
HtmlTextHandler.prototype.handle = function (text) {
    var entities = this.entities;
    text = reverse(text);
    text = text.replace(regexp.entityReversed, function (match, p1, p2, p3) {
        var r = '';
        if (p1) {
            r = String.fromCharCode(+reverse(p1));
        } else if (p2) {
            r = String.fromCharCode(parseInt(reverse(p2), 16));
        } else if (p3) {
            r = entities[reverse(p3)] || '';
        }
        return reverse(r) || match;
    });
    text = reverse(text);

    text = text.replace(regexp.escape, '$1').replace(regexp.whitespace, ' ');
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2f;');
};

module.exports = {
    Section: Section,
    LabelManager: LabelManager,
    // text handlers
    InlineCodeHandler: InlineCodeHandler,
    LabelHandler: LabelHandler,
    UrlHandler: UrlHandler,
    HtmlAttrHandler: HtmlAttrHandler,
    HtmlTextHandler: HtmlTextHandler
};