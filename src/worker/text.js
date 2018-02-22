var Section = require('../common').Section;

function Text(htmlTextHandler) {
    this.text = htmlTextHandler;
}
Text.prototype.work = function (list, env) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].type === 'raw') {
            list[i].type = 'final';
            list[i].text = this.text.handle(env.src.substring(list[i].begin, list[i].end));
        }
    }
};
module.exports = Text;