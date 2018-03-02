var Worker = require('./common/worker');
var Section = require('./common/section');

function WorkFlow() {
    var first;
    var cur;
    this.from = function (worker) {
        if (!(worker instanceof Worker)) {
            throw new Error('worker should be instance of Worker');
        }
        if (!first) {
            first = worker;
        }
        cur = worker;
        return this;
    };
    this.to = function (worker) {
        cur.next(worker);
        cur = worker;
        return this;
    };
    this.assists = function (/*assists*/) {
        cur.assists.apply(cur, arguments);
        return this;
    };
    this.work = function () {
        if (first) {
            first.work.apply(first, arguments);
        } else {
            throw new Error('set at least one worker for pipeline')
        }
    };
};

function Core() {
    this.workFlow = new WorkFlow();
};
Core.prototype.parse = function (src) {
    var share = {
        src: src,
        output: 'no output'
    };
    this.workFlow.work([new Section(0, src.length)], share);
    return share.output;
};

module.exports = Core;