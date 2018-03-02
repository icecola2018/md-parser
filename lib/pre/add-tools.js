var Section = require('../common/section');
var Worker = require('../common/worker');

function work(list, share) {
    share.srcOf = function (section) {
        if (arguments.length !== 1) {
            return this.src.substring(arguments[0], arguments[1]);
        } else if (section instanceof Array) {
            return this.src.substring(section[0], section[1]);
        } else if (typeof section === 'object' && section) {
            return this.src.substring(section.begin, section.end);
        } else {
            return this.src.substring(parseInt(section));
        }
    };

    var find = function (list, pos, isEnd) {
        var l = 0, r = list.length, m;
        pos -= isEnd ? 1 : 0;
        while (l < r) {
            m = Math.floor((l + r) / 2);
            if (list[m].end <= pos) {
                l = m + 1;
            } else {
                r = m;
            }
        }
        return l;
    };
    share.insertSection = function (list, begin, end, type, subBegin, subEnd) {
        if (list.length < 1) {
            throw new Error('list has no section');
        }
        if (begin >= end) {
            end = begin + 1;
        }
        if (begin < list[0].begin) {
            begin = list[0].begin;
        }
        if (begin >= list[list.length - 1].end) {
            begin = list[list.length - 1].end - 1;
        }
        if (end <= list[0].begin) {
            end = list[0].begin + 1;
        }
        if (end > list[list.length - 1].end) {
            end = list[list.length - 1].end;
        }

        var lidx = find(list, begin), ridx = find(list, end, true);
        var l = list[lidx], r = list[ridx];
        if (l.type !== 'raw' || r.type !== 'raw') {
            throw new Error('can\'t insert new section into not-raw sections');
        }
        var params = [lidx, ridx - lidx + 1];
        var section = new Section(begin, end, type);
        var secL, secR;
        if (begin > l.begin) {
            secL = new Section(l.begin, begin);
            params[params.length] = secL;
        }
        params[params.length] = section;
        if (end < r.end) {
            secR = new Section(end, r.end);
            params[params.length] = secR;
        }

        if (arguments.length >= 6) {
            if (subBegin >= subEnd) {
                subEnd = subBegin + 1;
            }
            if (subBegin < begin) {
                subBegin = begin;
            }
            if (subBegin >= end) {
                subBegin = end - 1;
            }
            if (subEnd <= begin) {
                subEnd = begin + 1;
            }
            if (subEnd > end) {
                subEnd = end;
            }

            lidx = find(list, subBegin), ridx = find(list, subEnd, true);
            l = list[lidx], r = list[ridx];
            if (l.type !== 'raw' || r.type !== 'raw') {
                throw new Error('can\'t split a not-raw section');
            }

            if (l === r) {
                section.list[section.list.length] = new Section(subBegin, subEnd);
            } else {
                if (subBegin < l.end) {
                    section.list[section.list.length] = new Section(subBegin, l.end);
                }
                for (var i = lidx + 1; i < ridx; i++) {
                    section.list[section.list.length] = list[i];
                }
                if (r.begin < subEnd) {
                    section.list[section.list.length] = new Section(r.begin, subEnd);
                }
            }
        }

        list.splice.apply(list, params);
        return section;
    };

    share.clone = function (obj) {
        if (typeof obj !== 'object' || !obj) {
            return null;
        }
        var n = {};
        for (var prop in obj) {
            n[prop] = obj[prop];
        }
        return n;
    }
};
module.exports = function () {
    return new Worker(work);
};