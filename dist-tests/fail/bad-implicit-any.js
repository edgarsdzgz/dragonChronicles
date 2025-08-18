"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bad = bad;
// Should fail with TS7006 (parameter implicitly has 'any')
// and/or TS7031 (binding element implicitly has 'any')
function bad(a, { b }) {
    return a ?? b;
}
