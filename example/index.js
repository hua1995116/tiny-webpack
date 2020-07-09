const a = require('./a.js');
import b from './b.js';

console.log(a());
b();
import('./foo/bar.js').then(res => {
    console.log(res.default())
})