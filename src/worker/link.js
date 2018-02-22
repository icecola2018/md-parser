var Section = require('../common').Section;

function Link(altTextHandler, labelManager) {
    this.alt = altTextHandler;
    this.labelMgr = labelManager;
}
Link.prototype.regexp = {
    // ( <\1|\2>  "\4")
    destination: /^\(\s*(?:((?:|\S*?[^\\\s])(?:\\\\)*)\)|(\S+)(?:\s+(["'])((?:|[\s\S]*?[^\\])(?:\\\\)*)\3)?\s*\))/,
    angleDestination: /^\(\s*<((?:|\S*?[^\\\s])(?:\\\\)*)>()\s*(?:(["'])((?:|[\s\S]*?[^\\])(?:\\\\)*)\3\s*)?\)/
};
Link.prototype.detect = function (section, env, matched) {
    var follow = env.src.substring(matched.close.end, section.end);
    var cap = follow.match(this.regexp.angleDestination);
    cap = cap || follow.match(this.regexp.destination);
    if (cap) {
        return {
            type: matched.type === '[' ? 'link' : 'image',
            url: this.labelMgr.url.handle(cap[1] || cap[2] || ''),
            title: this.labelMgr.title.handle(cap[4] || ''),
            end: matched.close.end + cap.index + cap[0].length
        }
    } else if (matched.next && matched.next.close && !matched.next.nest) {
        if (/^\s?$/.test(env.src.substring(matched.close.end, matched.next.begin))) {
            var label = env.src.substring(matched.next.end, matched.next.close.begin);
            label = this.labelMgr.label.handle(label) || '';
            if (label === '') {
                label = env.src.substring(matched.end, matched.close.begin);
                label = this.labelMgr.label.handle(label) || '';
            }
            if (label) {
                var info;
                if (info = this.labelMgr.info(label)) {
                    return {
                        type: matched.type === '[' ? 'link' : 'image',
                        url: info.url,
                        title: info.title,
                        end: matched.next.close.end
                    };
                }
            }
        }
    }
};
Link.prototype.work = function (list, env) {
    var section = list[0];
    if (section && section.type === 'raw') {
        var square = env.within(section.begin, section.end, env.square);
        var matched = [];
        var stack = [];
        var lastMatched = null;
        for (var i = 0; i < square.length; i++) {
            if (square[i].type === ']') {
                if (stack.length) {
                    lastMatched = stack.pop();
                    lastMatched.close = square[i];
                }
            } else {
                if (lastMatched) {
                    lastMatched.next = square[i];
                    lastMatched = null;
                }
                if (stack.length) {
                    stack[stack.length - 1].nest = true;
                }
                stack.push(square[i]);
            }
        }
        for (var i = 0; i < square.length; i++) {
            if (square[i].close) {
                matched.push(square[i]);
            }
        }

        for (var i = 0; i < matched.length; i++) {
            if (matched[i].begin < section.begin) {
                continue;
            }
            var result = this.detect(section, env, matched[i]);
            if (result) {
                var section2 = new Section(result.end, section.end);
                section.end = matched[i].begin;
                var link = new Section(section.end, section2.begin);
                link.url = result.url;
                link.title = result.title;
                if (result.type === 'link') {
                    link.type = 'link';
                    link.list = [new Section(matched[i].end, matched[i].close.begin)];
                    this.inside.work(link.list, env);
                } else {
                    link.type = 'image';
                    link.alt = this.alt.handle(env.src.substring(matched[i].end, matched[i].close.begin)) || '';
                }
                if (section.length() <= 0) {
                    list.pop();
                }
                list.push(link);
                if (section2.length() > 0) {
                    list.push(section2);
                }
                section = section2;
            }
        }
    }
    this.next.work(list, env);
};

module.exports = Link;