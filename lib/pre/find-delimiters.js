var Worker = require('../common/worker');
function work(list, share) {
    var revSrc = share.src.split('').reverse().join('');
    
    var regexp = {
        link: /\[!?(?=(?:\\\\)*(?!\\))|\](?=(?:\\\\)*(?!\\))/g,
        emphasis: /\*+(?=(?:\*\\)?(?:\\\\)*(?!\\))|_+(?=(?:_\\)?(?:\\\\)*(?!\\))|~+(?=(?:~\\)?(?:\\\\)*(?!\\))/g,
        codeOpen: /`+(?=(?:`\\)?(?:\\\\)*(?!\\))/g,
        codeClose: /`+/g
    };

    var delimiters = {};
    var match;
    for (var type in regexp) {
        delimiters[type] = [];
        regexp[type].lastIndex = 0;
        while (match = regexp[type].exec(revSrc)) {
            var str = match[0];
            delimiters[type].push({
                type: str,
                size: str.length,
                begin: revSrc.length - match.index - str.length,
                end: revSrc.length - match.index
            });
        }
        delimiters[type].reverse();
    }

    share.delimiters = function (type, section) {
        var d = delimiters[type];
        var l = 0, r = d.length, m;
        while (l < r) {
            m = Math.floor((l + r) / 2);
            if (d[m].begin < section.begin) {
                l = m + 1;
            } else {
                r = m;
            }
        }
        var part = [];
        for (; l < d.length && d[l].end <= section.end; l++) {
            part[part.length] = share.clone(d[l]);
        }
        return part;
    };
}
module.exports = function () {
    return new Worker(work);
}