var Worker = require('../common/worker');

function work(list, share) {
    if (list.length !== 1 || list[0].type !== 'raw') {
        return;
    }
    var sec = list[0];
    var codeOpen = share.delimiters('codeOpen', sec);
    var codeClose = share.delimiters('codeClose', sec);

    var i, lazy = 0;
    var begin = sec.begin;
    for (i = 0; i < codeOpen.length; i++) {
        if (codeOpen[i].begin < begin) {
            continue;
        }
        for (j = lazy + 1; j < codeClose.length; j++) {
            if (codeClose[j].begin > codeOpen[i].begin) {
                if (codeClose[j].size === codeOpen[i].size) {
                    var code = share.insertSection(list,
                        codeOpen[i].begin, codeClose[j].end, 'inline-code');
                    code.content = this.handleInlineCode(share.srcOf(
                        codeOpen[i].end, codeClose[j].begin));
                    begin = codeClose[j].end;
                    break;
                }
            } else {
                lazy = j;
            }
        }
    }
}

module.exports = function (handleInlineCode) {
    if (arguments.length < 1 || typeof handleInlineCode !== 'function') {
        handleInlineCode = require('../common/text/inline-code');
    }
    return new Worker(work).set('handleInlineCode', handleInlineCode);
};