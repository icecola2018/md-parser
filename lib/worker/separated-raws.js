var Worker = require('../common/worker');
function work(list, share) {
    for (var i = list.length - 1; i >= 0; i--) {
        if (list[i].type === 'raw') {
            var t = [list[i]];
            this.target(t, share);
            list.splice.apply(list, [i, 1].concat(t));
        }
    }
}
module.exports = function () {
    return new Worker(work, 'target');
};