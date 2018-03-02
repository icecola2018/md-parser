var Section = require('../common/section');
var Worker = require('../common/worker');

function work(list, share) {
    var regexp = this.gfm
        ? /((?:^|[^\\])(?:\\\\)*?)(\\\n)|( {2,}\n)|(\n)/g
        : /((?:^|[^\\])(?:\\\\)*?)(\\\n)|( {2,}\n)/g;
    list.forEach(function (sec, index) {
        if (sec.type === 'raw') {
            var text = share.srcOf(sec);
            var cap;
            while (cap = regexp.exec(text)) {
                var begin, end;
                if (cap[3] || cap[4]) {
                    begin = sec.begin + cap.index;
                    end = begin + cap[0].length;
                } else {
                    begin = sec.begin + cap.index + cap[1].length;
                    end = begin + cap[2].length;
                }
                share.insertSection(list, begin, end, 'br');
            }
        }
    });
}

module.exports = function (doGFM) {
    return new Worker(work).set(doGFM ? 'gfm' : '');
};