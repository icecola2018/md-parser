function Section(/*type, begin, end*/) {
    var type = 'raw';
    var begin;
    var end;
    var list = [];

    for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === 'string') {
            if (!('type' in this)) {
                type = arguments[i];
            }
        } else if (typeof arguments[i] === 'number') {
            if (typeof begin !== 'number') {
                begin = parseInt(arguments[i]);
            } else if (typeof end !== 'number') {
                end = parseInt(arguments[i]);
            }
        }
    }
    begin = begin || 0;
    end = end || 0;

    Object.defineProperty(this, 'begin', {
        get: function () {
            return begin;
        }
    });
    Object.defineProperty(this, 'end', {
        get: function () {
            return end;
        }
    });
    Object.defineProperty(this, 'type', {
        get: function () {
            return type;
        }
    });
    Object.defineProperty(this, 'list', {
        get: function () {
            return list;
        }
    });
    Object.defineProperty(this, 'length', {
        get: function () {
            return end - begin > 0 ? end - begin : 0;
        }
    });
}

module.exports = Section;