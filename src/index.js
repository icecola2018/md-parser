var MarkdownParser = require('./md-parser');

function findWrappers(src) {
    var env = {src: src.replace(/\r\n?/g, '\n')};
    var regexp = {
        square: /\[!?(?=(?:\\\\)*(?!\\))|\](?=(?:\\\\)*(?!\\))/g,
        emphasis: /\*+(?=(?:\*\\)?(?:\\\\)*(?!\\))|_+(?=(?:_\\)?(?:\\\\)*(?!\\))|~+(?=(?:~\\)?(?:\\\\)*(?!\\))/g,
        codeOpen: /`+(?=(?:`\\)?(?:\\\\)*(?!\\))/g,
        codeClose: /`+/g
    }
    var rev = src.split('').reverse().join('');
    var match;

    for (var type in regexp) {
        env[type] = [];
        regexp[type].lastIndex = 0;
        while (match = regexp[type].exec(rev)) {
            var str = match[0];
            env[type].push({
                type: str,
                size: str.length,
                begin: src.length - match.index - str.length,
                end: src.length - match.index
            });
        }
        env[type].reverse();
    }

    env.within = function (begin, end, wrappers) {
        var l = 0, r = wrappers.length, m;
        while (l < r) {
            m = Math.floor((l + r) / 2);
            if (wrappers[m].begin < begin) {
                l = m + 1;
            } else {
                r = m;
            }
        }
        var part = [];
        for (; l < wrappers.length && wrappers[l].begin < end; l++) {
            part.push(wrappers[l]);
        }
        return part;
    }

    return env;
}
function toHtml(list, env) {
    var html = '<p>';
    (function work(l) {
        for (var i = 0; i < l.length; i++) {
            if (l[i].type === 'inline-code') {
                html += '<code>' + l[i].content + '</code>';
            } else if (l[i].type === 'link') {
                html += '<a';
                if (l[i].url) {
                    html += ' href="' + l[i].url + '"';
                }
                if (l[i].title) {
                    html += ' title="' + l[i].title + '"';
                }
                html += '>';
                if (l[i].list.length) {
                    work(l[i].list);
                }
                html += '</a>';
            } else if (l[i].type === 'image') {
                html += '<img';
                if (l[i].url) {
                    html += ' src="' + l[i].url + '"';
                }
                if (l[i].title) {
                    html += ' title="' + l[i].title + '"';
                }
                if (l[i].alt) {
                    html += ' alt="' + l[i].alt + '"';
                }
                html += '/>';
            } else if (l[i].type === 'br') {
                html += '<br>';
            } else if (['del', 'em', 'strong'].includes(l[i].type)) {
                html += '<' + l[i].type + '>';
                if (l[i].list.length) {
                    work(l[i].list);
                }
                html += '</' + l[i].type + '>';
            } else if (l[i].type === 'em-strong') {
                html += '<em><strong>';
                if (l[i].list.length) {
                    work(l[i].list);
                }
                html += '</strong></em>';
            } else {
                html += l[i].text;
            }
        }
    })(list);
    html += '</p>';
    return html;
}
var mdParser = new MarkdownParser(findWrappers, toHtml);

var common = require('./common');
var worker = require('./worker');
var entities = require('./entities.json');

var codeHandler = new common.InlineCodeHandler();
var labelHandler = new common.LabelHandler();
var urlHandler = new common.UrlHandler();
var htmlAttrHandler = new common.HtmlAttrHandler();
var htmlTextHandler = new common.HtmlTextHandler(entities);

var labelMgr = new common.LabelManager(labelHandler, urlHandler, htmlAttrHandler);

var inlineCode = new worker.InlineCode(codeHandler);
var link = new worker.Link(htmlAttrHandler, labelMgr);
var lineBreak = new worker.LineBreak();
var text = new worker.Text(htmlTextHandler);
var emphasis = new worker.Emphasis();

mdParser
    .from(inlineCode)
    .to(link).inside(link)
    .to(emphasis).inside(emphasis)
    .to(lineBreak)
    .to(text);

var text = require('fs').readFileSync('test.md', 'utf-8');
var list = mdParser.parse(text);
console.log(list);
//printList(list, '');

function printList(list, indent) {
    for (var i = 0; i < list.length; i++) {
        var s = list[i];
        console.log(indent + '[ ' + s.type + ' ] ' + s.begin + ' -> ' + s.end + ' : ' + JSON.stringify(text.substring(s.begin, s.end)));
        for (var key in s) {
            if (!['begin', 'end', 'list', 'type', 'length'].includes(key)) {
                console.log(indent + '- ' + key + ': ' + JSON.stringify(s[key]));
            }
        }
        if (s.list.length) {
            printList(s.list, indent + '  ');
        }
    }
}
