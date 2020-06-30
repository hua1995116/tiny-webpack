const bar = require('./foo/bar.js');

module.exports = function () {
    console.log('a');
    bar();
    return 'aaaaa';
}