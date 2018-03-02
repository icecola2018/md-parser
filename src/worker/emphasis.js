var Worker = require('../common/worker');

var punctuation = /^[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~]$/;
var both = /^[\s\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~]$/;

function work(list, share, delimiters, nested) {
    if (!delimiters) {
        delimiters = [];
        list.filter(sec => sec.type === 'raw').forEach(function (sec) {
            share.delimiters('emphasis', sec).forEach(function (delimiter) {
                delimiter.type = delimiter.type.charAt(0);
                if (delimiter.type === '*' || delimiter.type === '_') {
                    var l = share.src.charAt(delimiter.begin - 1) || ' ';
                    var r = share.src.charAt(delimiter.end) || ' ';
                    delimiter.left = (!both.test(r)) || (punctuation.test(r) && both.test(l));
                    delimiter.right = (!both.test(l)) || (punctuation.test(l) && both.test(r));
                }
                delimiters[delimiters.length] = delimiter;
            });
        });
    }
    for (var i = 0; i < delimiters.length; i++) {
        if (this.strikethrough && delimiters[i].type === '~') {
            for (var j = i + 1; j < delimiters.length; j++) {
                if (delimiters[j].type === '~') {
                    var del = share.insertSection(list,
                        delimiters[i].begin, delimiters[j].end, 'del',
                        delimiters[i].end, delimiters[j].begin);
                    this.content(del.list, share, delimiters.slice(i + 1, j));
                    i = j;
                    break;
                }
            }
        } else if (delimiters[i].left) {
            var begin = delimiters[i].begin
            var end;
            var l, r, n = false;
            var size = delimiters[i].size;
            if (delimiters[i].size > 2 || nested) {
                for (var j = i + 1; j < delimiters.length; j++) {
                    if (delimiters[j].right && delimiters[j].type === delimiters[i].type) {
                        if (delimiters[j].size >= size) {
                            delimiters[j].size -= size;
                            delimiters[j].begin += size;
                            end = delimiters[j].begin;
                            break;
                        } else {
                            size -= delimiters[j].size;
                        }
                    }
                }
                delimiters[i].size -= size;
                delimiters[i].begin += size;
                if (end > begin) {
                    l = delimiters[i].size > 0 ? i : i + 1;
                    r = j;
                    n = true;
                    i = delimiters[j].size > 0 ? j - 1 : j;
                } else {
                    i = delimiters[i].size > 0 ? i - 1 : i;
                }
            } else {
                var can = i;
                for (var j = i + 1; j < delimiters.length; j++) {
                    if (delimiters[j].right && delimiters[j].type === delimiters[i].type) {
                        if (size === delimiters[j].size) {
                            can = j;
                            break;
                        } else if (delimiters[j].size > 2) {
                            can = j;
                        }
                    }
                }
                if (can > i) {
                    l = i + 1;
                    r = j;
                    if (delimiters[j].size > size) {
                        delimiters[j].size -= size;
                        delimiters[j].begin += size;
                        end = delimiters[j].begin;
                        i = j - 1;
                    } else {
                        end = delimiters[j].end;
                        i = j;
                    }
                }
            }
            if (end > begin) {
                var sec = share.insertSection(list, begin, end,
                    size > 2 ? 'em-strong' : (size < 2 ? 'em' : 'strong'),
                    begin + size, end - size);
                this.content(sec.list, share, delimiters.slice(l, r), n);
            }
        }
    }
}

module.exports = function (noStrikethrough) {
    return new Worker(work, 'content').set(noStrikethrough ? '' : 'strikethrough');
};