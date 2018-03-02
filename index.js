var Core = require('./core');

var core = new Core();
var emphasis = require('./worker/emphasis')();
var link = require('./worker/link')();

core.workFlow
    .from(require('./pre/add-tools')())
    .to(require('./pre/handle-whitespace-in-src')())
    .to(require('./pre/find-delimiters')())

    .to(require('./worker/inline-code')())
    .to(require('./worker/separated-raws')()).assists(link)
    .to(require('./output/html')())

    .from(link).assists(link)
    .to(emphasis).assists(emphasis)
    .to(require('./worker/line-break')())
    .to(require('./worker/final')())

console.log(core.parse(require('fs').readFileSync('test.md', 'utf8')));