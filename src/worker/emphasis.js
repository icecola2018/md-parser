var Section = require('../common').Section;

function Emphasis() {

}
Emphasis.prototype.regexp = {
    whitespace: /^\s$/,
    punctuation: /^[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~]$/,
    both: /^[\s\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~]$/
};
Emphasis.prototype.detect = function (em, env) {
    em.type = em.type.charAt(0);
    if (em.type === '~') {
        return;
    }
    var left = em.begin ? env.src.charAt(em.begin - 1) : ' ';
    var right = em.end < env.src.length ? env.src.charAt(em.end) : ' ';
    if (!this.regexp.both.test(right)) {
        em.left = true;
    } else if (this.regexp.punctuation.test(right) && this.regexp.both.test(left)) {
        em.left = true;
    }
    if (!this.regexp.both.test(left)) {
        em.right = true;
    } else if (this.regexp.punctuation.test(left) && this.regexp.both.test(right)) {
        em.right = true;
    }
};
Emphasis.prototype.insert = function (section, list, env, offset, eml, emr) {
    var num = emr.sec - eml.sec + 1;
    var index = eml.sec + offset;

    var l = list[index], r = list[emr.sec + offset];
    if (l === r) {
        if (eml.end < emr.begin) {
            section.list.push(new Section(eml.end, emr.begin));
            this.inside.work(section.list, env);
        }
    } else {
        if (eml.end < l.end) {
            section.list.push(new Section(eml.end, l.end));
        }
        for (var k = index + 1; k < emr.sec + offset; k++) {
            section.list.push(list[k]);
        }
        if (r.begin < emr.begin) {
            section.list.push(new Section(r.begin, emr.begin));
        }
        if (section.list.length) {
            this.inside.work(section.list, env);
        }
    }
    l = new Section(l.begin, eml.begin);
    r = new Section(emr.end, r.end);
    list.splice(index, num);
    index -= 1;
    offset -= num;
    if (l.length() > 0) {
        index += 1;
        offset += 1;
        list.splice(index, 0, l);
    }
    index += 1;
    offset += 1;
    list.splice(index, 0, section);
    if (r.length() > 0) {
        index += 1;
        offset += 1;
        list.splice(index, 0, r);
    }
    return offset;
};
Emphasis.prototype.work = function (list, env) {
    var em = [];
    for (var i = 0; i < list.length; i++) {
        if (list[i].type === 'raw') {
            var temp = env.within(list[i].begin, list[i].end, env.emphasis)
            for (var j = 0; j < temp.length; j++) {
                temp[j].sec = i;
                this.detect(temp[j], env);
            }
            em = em.concat(temp);
        }
    }
    var offset = 0;
    for (var i = 0; i < em.length; i++) {
        if (em[i].type === '~') {
            var j;
            for (j = i + 1; j < em.length; j++) {
                if (em[j].type === '~') {
                    var del = new Section('del', em[i].begin, em[j].end);
                    offset = this.insert(del, list, env, offset, em[i], em[j]);
                    i = j;
                    break;
                }
            }
        } else if (em[i].left) {
            if (em[i].size > 3) {
                em[i].begin = em[i].end - 3;
                em[i].size = 3;
            }
            var j, can = i;
            for (j = i + 1; j < em.length; j++) {
                if (em[j].right && em[j].type === em[i].type) {
                    if (em[j].size === em[i].size) {
                        can = j;
                        break;
                    } else if (em[j].size >= 3 && can === i) {
                        can = j;
                    }
                }
            }
            if (can > i) {
                var temp;
                if (em[i].size === em[can].size) {
                    temp = em[can];
                } else {
                    temp = {};
                    for (var prop in em[can]) {
                        temp[prop] = em[can][prop];
                    }
                    em[can].begin += em[i].size;
                    em[can].size -= em[i].size;
                    temp.size = em[i].size;
                    temp.end = temp.begin + temp.size;
                    em[can].left = true
                    can -= 1;
                }
                var type = temp.size < 3 ? (temp.size > 1 ? 'strong' : 'em') : 'em-strong';
                var s = new Section(type, em[i].begin, temp.end);
                offset = this.insert(s, list, env, offset, em[i], temp);
                i = can;
            }
        }
    }
    this.next.work(list, env);
};

module.exports = Emphasis;