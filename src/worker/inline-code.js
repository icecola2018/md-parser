var Section = require('../common').Section;

function InlineCode(codeTextHandler) {
    this.code = codeTextHandler;
}
InlineCode.prototype.work = function (list, env) {
    var section = list[0];
    if (section && section.type === 'raw') {
        var codeOpen = env.within(section.begin, section.end, env.codeOpen);
        var codeClose = env.within(section.begin, section.end, env.codeClose);

        var i, lazy = 0;
        for (i = 0; i < codeOpen.length; i++) {
            if (codeOpen[i].begin < section.begin) {
                continue;
            }
            for (j = lazy + 1; j < codeClose.length; j++) {
                if (codeClose[j].begin > codeOpen[i].begin) {
                    if (codeClose[j].size === codeOpen[i].size) {
                        var section2 = new Section(codeClose[j].end, section.end);
                        section.end = codeOpen[i].begin;

                        var code = new Section('inline-code', section.end, section2.begin);
                        code.content = this.code.handle(env.src.substring(codeOpen[i].end, codeClose[j].begin))

                        list.pop();
                        if (section.length() > 0) {
                            var temp = [section];
                            this.next.work(temp, env);
                            for (var k = 0; k < temp.length; k++) {
                                list.push(temp[k]);
                            }
                        }

                        list.push(code);

                        if (section2.length() > 0) {
                            list.push(section2);
                        }
                        section = section2;
                        break;
                    }
                } else {
                    lazy = j;
                }
            }
        }

        if (section.length() > 0) {
            list.pop();
            var temp = [section];
            this.next.work(temp, env);
            for (var k = 0; k < temp.length; k++) {
                list.push(temp[k]);
            }
        }
    } else {
        this.next.work(temp, env);
    }
};

module.exports = InlineCode;