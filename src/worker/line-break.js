var Section = require('../common').Section;

function LineBreak(gfm) {
    this.gfm = gfm || false;
}
LineBreak.prototype.regexp = {
    normal: /((?:^|[^\\])(?:\\\\)*?)(\\\n)|( {2,}\n)/g,
    extension: /((?:^|[^\\])(?:\\\\)*?)(\\\n)|( {2,}\n)|(\n)/g
}
LineBreak.prototype.work = function (list, env) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].type === 'raw') {
            var section = list[i];
            var text = env.src.substring(section.begin, section.end);
            var cap;
            var regexp = this.gfm ? this.regexp.extension : this.regexp.normal;
            regexp.lastIndex = 0;
            var b0 = section.begin;
            while (cap = regexp.exec(text)) {
                var begin, end;
                if (cap[3] || cap[4]) {
                    begin = b0 + cap.index;
                    end = begin + cap[0].length;
                } else {
                    begin = b0 + cap.index + cap[1].length;
                    end = begin + cap[2].length;
                }
                var br = new Section('br', begin, end);
                var section2 = new Section(end, section.end);
                section.end = begin;
                var empty = section.length() <= 0;
                i += !empty;
                list.splice(i, parseInt(empty), br);
                if (section2.length() > 0) {
                    i++;
                    list.splice(i, 0, section2);
                }
                section = section2;
            }
        }
    }
    this.next.work(list, env);
};

module.exports = LineBreak;