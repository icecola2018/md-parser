var Section = require('./common').Section;

var defaultWorker = {
    work: function (sectionList, env) {
        throw new Error('- You need a worker to deal with this.');
    }
};
function setDefault(worker) {
    if (!worker.next) {
        worker.next = defaultWorker;
    }
    if (!worker.inside) {
        worker.inside = defaultWorker;
    }
}

function Pipeline(firstWorker) {
    if (!firstWorker) {
        throw new Error('- You have to specify the first worker.');
    }
    this._first = firstWorker;
    this._cur = null;
}
Pipeline.prototype.from = function (worker) {
    setDefault(worker);
    this._cur = worker;
    return this;
};
Pipeline.prototype.to = function (worker) {
    if (this._cur) {
        setDefault(worker);
        this._cur = this._cur.next = worker;
        return this;
    }
};
Pipeline.prototype.inside = function (worker) {
    setDefault(worker);
    this._cur.inside = worker;
    return this;
};
Pipeline.prototype.work = function (sectionList, env) {
    this._first.work(sectionList, env);
};



function MarkdownParser(preProcesser, postProcesser) {
    this._pre = preProcesser || function () {
        return {};
    };
    this._pipeline = null;
    this._post = postProcesser || function (list) {
        return list;
    };
}
MarkdownParser.prototype.from = function (worker) {
    if (this._pipeline === null) {
        this._pipeline = new Pipeline(worker);
    }
    return this._pipeline.from(worker);
}
MarkdownParser.prototype.pre = function (processer) {
    this._pre = processer;
};
MarkdownParser.prototype.post = function (processer) {
    this._post = processer;
};
MarkdownParser.prototype.parse = function (src) {
    if (!this._pipeline) {
        throw new Error('call \'from\' to setup a pipeline before parsing');
    }
    if (!src) {
        return null;
    }
    var list = [new Section(0, src.length)];
    var env = this._pre(src);

    this._pipeline.work(list, env);
    
    return this._post(list, env);
};

module.exports = MarkdownParser;
