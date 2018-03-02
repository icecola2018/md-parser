var Worker = require('../common/worker');
var LabelTool = require('../common/label-tool');

function getMatched(squares) {
    var matched = [];
    var stack = [];
    var lastMatched = null;
    for (var i = 0; i < squares.length; i++) {
        if (squares[i].type === ']') {
            if (stack.length) {
                lastMatched = stack.pop();
                lastMatched.close = squares[i];
                matched[matched.length] = lastMatched;
            }
        } else {
            if (lastMatched) {
                lastMatched.next = squares[i];
                lastMatched = null;
            }
            if (stack.length) {
                stack[stack.length - 1].nested = true;
            }
            stack[stack.length] = squares[i];
        }
    }
    return matched.sort(function (a, b) {
        return a.begin - b.begin;
    });
}

// ( <\1|\2>  "\4")
var destination = /^\(\s*(?:((?:|\S*?[^\\\s])(?:\\\\)*)\)|(\S+)(?:\s+(["'])((?:|[\s\S]*?[^\\])(?:\\\\)*)\3)?\s*\))/;
var angleDestination = /^\(\s*<((?:|\S*?[^\\\s])(?:\\\\)*)>()\s*(?:(["'])((?:|[\s\S]*?[^\\])(?:\\\\)*)\3\s*)?\)/;
function detect(sec, share, pair) {
    var next = pair.next;
    if (next && next.close && next.close.end <= sec.end && (!next.nested)
        && /^\s?$/.test(share.srcOf(pair.close.end, next.begin))) {
        var info = this.labelTool.dict(share.srcOf(next.end, next.close.begin));
        if (info === false && !pair.nested) {
            info = this.labelTool.dict(share.srcOf(pair.end, pair.close.begin));
        }
        if (info) {
            return {
                type: pair.type === '[' ? 'link' : 'image',
                url: info.url,
                title: info.title,
                end: next.close.end
            };
        }
    } else {
        var follow = share.srcOf(pair.close.end, sec.end);
        var cap = follow.match(angleDestination) || follow.match(destination);
        if (cap) {
            return {
                type: pair.type === '[' ? 'link' : 'image',
                url: this.labelTool.handleUrl(cap[1] || cap[2] || ''),
                title: this.labelTool.handleTitle(cap[4] || ''),
                end: pair.close.end + cap.index + cap[0].length
            }
        }
    }
}

function work(list, share, matchedSquares) {
    if (list.length !== 1 || list[0].type !== 'raw') {
        return;
    }
    var sec = list[0];
    if (!matchedSquares) {
        matchedSquares = getMatched(share.delimiters('link', sec));
    }

    var begin = sec.begin;
    for (var i = 0; i < matchedSquares.length; i++) {
        var pair = matchedSquares[i];
        if (pair.begin < begin) {
            continue;
        }
        var result = detect.call(this, sec, share, pair);
        if (!result) {
            continue;
        }

        var link;
        if (result.type === 'link') {
            link = share.insertSection(list, pair.begin, result.end,
                'link', pair.end, pair.close.begin);
            this.content(link.list, share, matchedSquares.filter(function (m) {
                return m.begin >= pair.end && m.end <= pair.close.begin
                    && m.close.begin >= pair.end && m.close.end <= pair.close.begin;
            }));
        } else {
            link = share.insertSection(list, pair.begin, result.end, 'image');
            link.alt = this.handleImageAlt(share.srcOf(pair.end, pair.close.begin));
        }
        link.url = result.url;
        link.title = result.title;
        begin = result.end;
    }
}

module.exports = function (labelTool, handleImageAlt) {
    if (arguments.length < 2 || typeof handleImageAlt !== 'function') {
        handleImageAlt = require('../common/text/image-alt');
    }
    if (arguments.length < 1 || !(labelTool instanceof LabelTool)) {
        labelTool = new LabelTool();
    }
    return new Worker(work, 'content')
        .set('handleImageAlt', handleImageAlt)
        .set('labelTool', labelTool);
};