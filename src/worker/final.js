var Worker = require('../common/worker');
var Section = require('../common/section');
function work(list, share) {
    list.forEach(function (sec, index) {
        if (sec.type === 'raw') {
            var fin = new Section('final', sec.begin, sec.end);
            fin.text = this.handleHtmlText(share.srcOf(sec));
            list.splice(index, 1, fin);
        }
    }, this);
}
module.exports = function (handleHtmlText) {
    if (arguments.length < 1 || typeof handleHtmlText !== 'function') {
        handleHtmlText = require('../common/text/html-text-basic-entities');
    }
    return new Worker(work).set('handleHtmlText', handleHtmlText);
};
