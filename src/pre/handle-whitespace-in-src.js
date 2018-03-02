var Worker = require('../common/worker');
function work(list, share) {
    share.src = share.src.replace(/\r\n|\r|\u2424/g, '\n').replace(/\u00a0/g, ' ');
    if (this.tabSpace) {
        var tab = '';
        for (var i = 0; i < this.tabSpace; i++) {
            tab += ' ';
        }
        share.src = share.src.replace(/\t/g, tab);
    }
}
module.exports = function (tabSpace) {
    if (arguments.length > 0) {
        tabSpace = parseInt(tabSpace);
        if (tabSpace <= 0 || tabSpace > 16) {
            tabSpace = 4;
        }
    }
    return new Worker(work).set('tabSpace', tabSpace);
};
