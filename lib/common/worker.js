function Worker(func/*, assists*/) {
    if (typeof func !== 'function') {
        return;
    }

    var assists = [];
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            assists[i - 1] = arguments[i].toString();
        }
    }
    
    var env = {};
    var thisWorker = {};
    var next = null;
    var ready = false;

    var setDefaultAssists = function () {
        if (assists.length > 0) {
            assists.forEach(name => (thisWorker[name] = function () {
                throw new Error('no assists');
            }));
        }
    };
    
    setDefaultAssists();

    this.reset = function () {
        env = {};
        thisWorker = {};
        next = null;
        ready = false;
        setDefaultAssists();
    };

    this.work = function () {
        if (!ready) {
            ready = true;
            for (var prop in env) {
                if (!(prop in thisWorker)) {
                    thisWorker[prop] = env[prop];
                }
            }
        }
        func.apply(thisWorker, arguments);
        if (next) {
            next.work.apply(next, arguments);
        }
    };
    
    this.assists = function (/*workers*/) {
        if (arguments.length !== assists.length) {
            throw new Error('need ' + assists.length + ' assists');
        }
        if ([].some.call(arguments, worker => !(worker instanceof Worker))) {
            throw new Error('assists should be worker instances');
        }
        for (var i = 0; i < assists.length; i++) {
            var name = assists[i];
            var worker = arguments[i];
            thisWorker[name] = function () {
                worker.work.apply(worker, arguments);
            };
        }
    };

    this.next = function (worker) {
        if (!(worker instanceof Worker)) {
            throw new Error('the next should be a worker instance');
        }
        next = worker;
    };

    this.set = function (name, value) {
        if (typeof name !== 'string') {
            for (var prop in name) {
                env[prop] = name[prop];
            }
        } else if (name) {
            env[name] = arguments.length < 2 ? true : value;
        }
        return this;
    };

};

module.exports = Worker;