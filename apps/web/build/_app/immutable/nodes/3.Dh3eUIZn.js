var pu = Object.defineProperty;
var mu = (e, n, i) =>
  n in e ? pu(e, n, { enumerable: !0, configurable: !0, writable: !0, value: i }) : (e[n] = i);
var qn = (e, n, i) => mu(e, typeof n != 'symbol' ? n + '' : n, i);
import { s as vu, n as Ko, r as yu, d as gu } from '../chunks/scheduler.DCi9tjgp.js';
import {
  S as bu,
  i as _u,
  d as He,
  A as Gn,
  B as Mn,
  s as Br,
  a as wu,
  b as ne,
  z as fn,
  y as Nt,
  l as Un,
  c as Ce,
  e as ct,
  m as Bo,
  g as Kt,
  f as Ue,
  h as De,
  j as Bt,
  t as Le,
} from '../chunks/index.BID5roI-.js';
import { c as Fo, g as ku } from '../chunks/_commonjsHelpers.Cpj98o6Y.js';
function Jn(e) {
  if (e == null) return 4;
  switch (typeof e) {
    case 'string':
      return 2 + e.length;
    case 'number':
      return 8;
    case 'boolean':
      return 4;
    case 'object':
      return Array.isArray(e)
        ? 2 + e.reduce((a, l) => a + Jn(l), 0)
        : 2 +
            Object.keys(e).reduce((a, l) => {
              const m = e[l];
              return a + l.length + 3 + Jn(m);
            }, 0);
    default:
      return 8;
  }
}
function xu(e) {
  return (
    e.map((n) => JSON.stringify(n)).join(`
`) +
    `
`
  );
}
function zu() {
  return {
    log(e) {
      const n = `[${e.src}${e.mode ? `/${e.mode}` : ''}]`;
      (console[e.lvl] ?? console.log)(n, e.msg, e.data ?? '');
    },
  };
}
const Eu = new Set([
  'fps',
  'draws',
  'enemies',
  'proj',
  'arcana',
  'gold',
  'dragonName',
  'profileId',
  'land',
  'ward',
]);
function Ou(e) {
  const n = { t: e.t, lvl: e.lvl, src: e.src, msg: e.msg };
  if (
    (e.mode !== void 0 && (n.mode = e.mode),
    e.profileId !== void 0 && (n.profileId = e.profileId),
    e.data && typeof e.data == 'object')
  ) {
    const i = {};
    for (const [a, l] of Object.entries(e.data))
      Eu.has(a) && ((typeof l == 'string' && a !== 'dragonName') || (i[a] = l));
    n.data = i;
  }
  return n;
}
class Pu {
  constructor(n) {
    ((this.buffer = []),
      (this.head = 0),
      (this.tail = 0),
      (this.size = 0),
      (this.capacity = n),
      (this.buffer = new Array(n)));
  }
  push(n) {
    this.size === this.capacity
      ? ((this.buffer[this.head] = n),
        (this.head = (this.head + 1) % this.capacity),
        (this.tail = (this.tail + 1) % this.capacity))
      : ((this.buffer[this.tail] = n), (this.tail = (this.tail + 1) % this.capacity), this.size++);
  }
  shift() {
    if (this.size === 0) return;
    const n = this.buffer[this.head];
    return ((this.head = (this.head + 1) % this.capacity), this.size--, n);
  }
  get length() {
    return this.size;
  }
  get isEmpty() {
    return this.size === 0;
  }
  get isFull() {
    return this.size === this.capacity;
  }
  toArray() {
    if (this.size === 0) return [];
    const n = [];
    let i = this.head;
    for (let a = 0; a < this.size; a++) {
      const l = this.buffer[i];
      (l !== void 0 && n.push(l), (i = (i + 1) % this.capacity));
    }
    return n;
  }
  clear() {
    ((this.head = 0), (this.tail = 0), (this.size = 0));
  }
  toArrayLimited(n) {
    if (this.size === 0 || n <= 0) return [];
    const i = [];
    let a = this.head;
    const l = Math.min(n, this.size);
    for (let m = 0; m < l; m++) {
      const d = this.buffer[a];
      (d !== void 0 && i.push(d), (a = (a + 1) % this.capacity));
    }
    return i;
  }
  forEach(n) {
    if (this.size === 0) return;
    let i = this.head;
    for (let a = 0; a < this.size; a++) {
      const l = this.buffer[i];
      (l !== void 0 && n(l, a), (i = (i + 1) % this.capacity));
    }
  }
  map(n) {
    if (this.size === 0) return [];
    const i = [];
    let a = this.head;
    for (let l = 0; l < this.size; l++) {
      const m = this.buffer[a];
      (m !== void 0 && i.push(n(m, l)), (a = (a + 1) % this.capacity));
    }
    return i;
  }
}
function Su(e = {}) {
  const n = e.maxBytes ?? 2097152,
    i = e.maxEntries ?? 1e4,
    a = new Pu(i);
  let l = 0;
  const m = zu(),
    d = e.dexie ?? null;
  function E() {
    for (; l > n && a.length > 0; ) {
      const J = a.shift();
      J && (l -= Jn(J));
    }
  }
  function A(J) {
    const Y = Ou(J),
      ae = Jn(Y);
    (a.push(Y), (l += ae), E(), C && m.log(Y), d?.enqueue(Y));
  }
  let C = !!e.devConsole;
  async function M() {
    const J = a.toArray(),
      Y = xu(J);
    return new Blob([Y], { type: 'application/x-ndjson' });
  }
  async function U() {
    (a.clear(), (l = 0), await d?.clear());
  }
  function W(J) {
    C = J;
  }
  return { log: A, exportNDJSON: M, clear: U, enableConsole: W };
}
var li = { exports: {} };
(function (e, n) {
  (function (i, a) {
    e.exports = a();
  })(Fo, function () {
    var i = function (t, r) {
        return (i =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array &&
            function (o, u) {
              o.__proto__ = u;
            }) ||
          function (o, u) {
            for (var s in u) Object.prototype.hasOwnProperty.call(u, s) && (o[s] = u[s]);
          })(t, r);
      },
      a = function () {
        return (a =
          Object.assign ||
          function (t) {
            for (var r, o = 1, u = arguments.length; o < u; o++)
              for (var s in (r = arguments[o]))
                Object.prototype.hasOwnProperty.call(r, s) && (t[s] = r[s]);
            return t;
          }).apply(this, arguments);
      };
    function l(t, r, o) {
      for (var u, s = 0, c = r.length; s < c; s++)
        (!u && s in r) || ((u = u || Array.prototype.slice.call(r, 0, s))[s] = r[s]);
      return t.concat(u || Array.prototype.slice.call(r));
    }
    var m =
        typeof globalThis < 'u'
          ? globalThis
          : typeof self < 'u'
            ? self
            : typeof window < 'u'
              ? window
              : Fo,
      d = Object.keys,
      E = Array.isArray;
    function A(t, r) {
      return (
        typeof r != 'object' ||
          d(r).forEach(function (o) {
            t[o] = r[o];
          }),
        t
      );
    }
    typeof Promise > 'u' || m.Promise || (m.Promise = Promise);
    var C = Object.getPrototypeOf,
      M = {}.hasOwnProperty;
    function U(t, r) {
      return M.call(t, r);
    }
    function W(t, r) {
      (typeof r == 'function' && (r = r(C(t))),
        (typeof Reflect > 'u' ? d : Reflect.ownKeys)(r).forEach(function (o) {
          Y(t, o, r[o]);
        }));
    }
    var J = Object.defineProperty;
    function Y(t, r, o, u) {
      J(
        t,
        r,
        A(
          o && U(o, 'get') && typeof o.get == 'function'
            ? { get: o.get, set: o.set, configurable: !0 }
            : { value: o, configurable: !0, writable: !0 },
          u,
        ),
      );
    }
    function ae(t) {
      return {
        from: function (r) {
          return (
            (t.prototype = Object.create(r.prototype)),
            Y(t.prototype, 'constructor', t),
            { extend: W.bind(null, t.prototype) }
          );
        },
      };
    }
    var Ee = Object.getOwnPropertyDescriptor,
      pt = [].slice;
    function Oe(t, r, o) {
      return pt.call(t, r, o);
    }
    function _e(t, r) {
      return r(t);
    }
    function pe(t) {
      if (!t) throw new Error('Assertion Failed');
    }
    function Ze(t) {
      m.setImmediate ? setImmediate(t) : setTimeout(t, 0);
    }
    function be(t, r) {
      if (typeof r == 'string' && U(t, r)) return t[r];
      if (!r) return t;
      if (typeof r != 'string') {
        for (var o = [], u = 0, s = r.length; u < s; ++u) {
          var c = be(t, r[u]);
          o.push(c);
        }
        return o;
      }
      var f = r.indexOf('.');
      if (f !== -1) {
        var h = t[r.substr(0, f)];
        return h == null ? void 0 : be(h, r.substr(f + 1));
      }
    }
    function we(t, r, o) {
      if (t && r !== void 0 && !('isFrozen' in Object && Object.isFrozen(t)))
        if (typeof r != 'string' && 'length' in r) {
          pe(typeof o != 'string' && 'length' in o);
          for (var u = 0, s = r.length; u < s; ++u) we(t, r[u], o[u]);
        } else {
          var c,
            f,
            h = r.indexOf('.');
          h !== -1
            ? ((c = r.substr(0, h)),
              (f = r.substr(h + 1)) === ''
                ? o === void 0
                  ? E(t) && !isNaN(parseInt(c))
                    ? t.splice(c, 1)
                    : delete t[c]
                  : (t[c] = o)
                : we((h = !(h = t[c]) || !U(t, c) ? (t[c] = {}) : h), f, o))
            : o === void 0
              ? E(t) && !isNaN(parseInt(r))
                ? t.splice(r, 1)
                : delete t[r]
              : (t[r] = o);
        }
    }
    function St(t) {
      var r,
        o = {};
      for (r in t) U(t, r) && (o[r] = t[r]);
      return o;
    }
    var Te = [].concat;
    function It(t) {
      return Te.apply([], t);
    }
    var gt =
        'BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey'
          .split(',')
          .concat(
            It(
              [8, 16, 32, 64].map(function (t) {
                return ['Int', 'Uint', 'Float'].map(function (r) {
                  return r + t + 'Array';
                });
              }),
            ),
          )
          .filter(function (t) {
            return m[t];
          }),
      mt = new Set(
        gt.map(function (t) {
          return m[t];
        }),
      ),
      We = null;
    function $e(t) {
      return (
        (We = new WeakMap()),
        (t = (function r(o) {
          if (!o || typeof o != 'object') return o;
          var u = We.get(o);
          if (u) return u;
          if (E(o)) {
            ((u = []), We.set(o, u));
            for (var s = 0, c = o.length; s < c; ++s) u.push(r(o[s]));
          } else if (mt.has(o.constructor)) u = o;
          else {
            var f,
              h = C(o);
            for (f in ((u = h === Object.prototype ? {} : Object.create(h)), We.set(o, u), o))
              U(o, f) && (u[f] = r(o[f]));
          }
          return u;
        })(t)),
        (We = null),
        t
      );
    }
    var Wt = {}.toString;
    function Ye(t) {
      return Wt.call(t).slice(8, -1);
    }
    var et = typeof Symbol < 'u' ? Symbol.iterator : '@@iterator',
      Yt =
        typeof et == 'symbol'
          ? function (t) {
              var r;
              return t != null && (r = t[et]) && r.apply(t);
            }
          : function () {
              return null;
            };
    function Ke(t, r) {
      return ((r = t.indexOf(r)), 0 <= r && t.splice(r, 1), 0 <= r);
    }
    var fe = {};
    function ee(t) {
      var r, o, u, s;
      if (arguments.length === 1) {
        if (E(t)) return t.slice();
        if (this === fe && typeof t == 'string') return [t];
        if ((s = Yt(t))) {
          for (o = []; !(u = s.next()).done; ) o.push(u.value);
          return o;
        }
        if (t == null) return [t];
        if (typeof (r = t.length) != 'number') return [t];
        for (o = new Array(r); r--; ) o[r] = t[r];
        return o;
      }
      for (r = arguments.length, o = new Array(r); r--; ) o[r] = arguments[r];
      return o;
    }
    var tt =
        typeof Symbol < 'u'
          ? function (t) {
              return t[Symbol.toStringTag] === 'AsyncFunction';
            }
          : function () {
              return !1;
            },
      Qt = [
        'Unknown',
        'Constraint',
        'Data',
        'TransactionInactive',
        'ReadOnly',
        'Version',
        'NotFound',
        'InvalidState',
        'InvalidAccess',
        'Abort',
        'Timeout',
        'QuotaExceeded',
        'Syntax',
        'DataClone',
      ],
      je = [
        'Modify',
        'Bulk',
        'OpenFailed',
        'VersionChange',
        'Schema',
        'Upgrade',
        'InvalidTable',
        'MissingAPI',
        'NoSuchDatabase',
        'InvalidArgument',
        'SubTransaction',
        'Unsupported',
        'Internal',
        'DatabaseClosed',
        'PrematureCommit',
        'ForeignAwait',
      ].concat(Qt),
      Gt = {
        VersionChanged: 'Database version changed by other database connection',
        DatabaseClosed: 'Database has been closed',
        Abort: 'Transaction aborted',
        TransactionInactive: 'Transaction has already completed or failed',
        MissingAPI: 'IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb',
      };
    function Be(t, r) {
      ((this.name = t), (this.message = r));
    }
    function Ge(t, r) {
      return (
        t +
        '. Errors: ' +
        Object.keys(r)
          .map(function (o) {
            return r[o].toString();
          })
          .filter(function (o, u, s) {
            return s.indexOf(o) === u;
          }).join(`
`)
      );
    }
    function vt(t, r, o, u) {
      ((this.failures = r),
        (this.failedKeys = u),
        (this.successCount = o),
        (this.message = Ge(t, r)));
    }
    function Je(t, r) {
      ((this.name = 'BulkError'),
        (this.failures = Object.keys(r).map(function (o) {
          return r[o];
        })),
        (this.failuresByPos = r),
        (this.message = Ge(t, this.failures)));
    }
    (ae(Be)
      .from(Error)
      .extend({
        toString: function () {
          return this.name + ': ' + this.message;
        },
      }),
      ae(vt).from(Be),
      ae(Je).from(Be));
    var Ne = je.reduce(function (t, r) {
        return ((t[r] = r + 'Error'), t);
      }, {}),
      Ri = Be,
      q = je.reduce(function (t, r) {
        var o = r + 'Error';
        function u(s, c) {
          ((this.name = o),
            s
              ? typeof s == 'string'
                ? ((this.message = ''.concat(s).concat(
                    c
                      ? `
 ` + c
                      : '',
                  )),
                  (this.inner = c || null))
                : typeof s == 'object' &&
                  ((this.message = ''.concat(s.name, ' ').concat(s.message)), (this.inner = s))
              : ((this.message = Gt[r] || o), (this.inner = null)));
        }
        return (ae(u).from(Ri), (t[r] = u), t);
      }, {});
    ((q.Syntax = SyntaxError), (q.Type = TypeError), (q.Range = RangeError));
    var ro = Qt.reduce(function (t, r) {
        return ((t[r + 'Error'] = q[r]), t);
      }, {}),
      mn = je.reduce(function (t, r) {
        return (['Syntax', 'Type', 'Range'].indexOf(r) === -1 && (t[r + 'Error'] = q[r]), t);
      }, {});
    function te() {}
    function Jt(t) {
      return t;
    }
    function Ni(t, r) {
      return t == null || t === Jt
        ? r
        : function (o) {
            return r(t(o));
          };
    }
    function yt(t, r) {
      return function () {
        (t.apply(this, arguments), r.apply(this, arguments));
      };
    }
    function Ki(t, r) {
      return t === te
        ? r
        : function () {
            var o = t.apply(this, arguments);
            o !== void 0 && (arguments[0] = o);
            var u = this.onsuccess,
              s = this.onerror;
            ((this.onsuccess = null), (this.onerror = null));
            var c = r.apply(this, arguments);
            return (
              u && (this.onsuccess = this.onsuccess ? yt(u, this.onsuccess) : u),
              s && (this.onerror = this.onerror ? yt(s, this.onerror) : s),
              c !== void 0 ? c : o
            );
          };
    }
    function Bi(t, r) {
      return t === te
        ? r
        : function () {
            t.apply(this, arguments);
            var o = this.onsuccess,
              u = this.onerror;
            ((this.onsuccess = this.onerror = null),
              r.apply(this, arguments),
              o && (this.onsuccess = this.onsuccess ? yt(o, this.onsuccess) : o),
              u && (this.onerror = this.onerror ? yt(u, this.onerror) : u));
          };
    }
    function Fi(t, r) {
      return t === te
        ? r
        : function (o) {
            var u = t.apply(this, arguments);
            A(o, u);
            var s = this.onsuccess,
              c = this.onerror;
            return (
              (this.onsuccess = null),
              (this.onerror = null),
              (o = r.apply(this, arguments)),
              s && (this.onsuccess = this.onsuccess ? yt(s, this.onsuccess) : s),
              c && (this.onerror = this.onerror ? yt(c, this.onerror) : c),
              u === void 0 ? (o === void 0 ? void 0 : o) : A(u, o)
            );
          };
    }
    function qi(t, r) {
      return t === te
        ? r
        : function () {
            return r.apply(this, arguments) !== !1 && t.apply(this, arguments);
          };
    }
    function ir(t, r) {
      return t === te
        ? r
        : function () {
            var o = t.apply(this, arguments);
            if (o && typeof o.then == 'function') {
              for (var u = this, s = arguments.length, c = new Array(s); s--; ) c[s] = arguments[s];
              return o.then(function () {
                return r.apply(u, c);
              });
            }
            return r.apply(this, arguments);
          };
    }
    ((mn.ModifyError = vt), (mn.DexieError = Be), (mn.BulkError = Je));
    var Fe =
      typeof location < 'u' && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
    function oo(t) {
      Fe = t;
    }
    var Xt = {},
      io = 100,
      gt =
        typeof Promise > 'u'
          ? []
          : (function () {
              var t = Promise.resolve();
              if (typeof crypto > 'u' || !crypto.subtle) return [t, C(t), t];
              var r = crypto.subtle.digest('SHA-512', new Uint8Array([0]));
              return [r, C(r), t];
            })(),
      Qt = gt[0],
      je = gt[1],
      gt = gt[2],
      je = je && je.then,
      bt = Qt && Qt.constructor,
      ur = !!gt,
      Ht = function (t, r) {
        (en.push([t, r]), vn && (queueMicrotask(Ui), (vn = !1)));
      },
      ar = !0,
      vn = !0,
      _t = [],
      yn = [],
      sr = Jt,
      nt = {
        id: 'global',
        global: !0,
        ref: 0,
        unhandleds: [],
        onunhandled: te,
        pgp: !1,
        env: {},
        finalize: te,
      },
      B = nt,
      en = [],
      wt = 0,
      gn = [];
    function N(t) {
      if (typeof this != 'object') throw new TypeError('Promises must be constructed via new');
      ((this._listeners = []), (this._lib = !1));
      var r = (this._PSD = B);
      if (typeof t != 'function') {
        if (t !== Xt) throw new TypeError('Not a function');
        return (
          (this._state = arguments[1]),
          (this._value = arguments[2]),
          void (this._state === !1 && lr(this, this._value))
        );
      }
      ((this._state = null),
        (this._value = null),
        ++r.ref,
        (function o(u, s) {
          try {
            s(
              function (c) {
                if (u._state === null) {
                  if (c === u) throw new TypeError('A promise cannot be resolved with itself.');
                  var f = u._lib && At();
                  (c && typeof c.then == 'function'
                    ? o(u, function (h, v) {
                        c instanceof N ? c._then(h, v) : c.then(h, v);
                      })
                    : ((u._state = !0), (u._value = c), ao(u)),
                    f && Zt());
                }
              },
              lr.bind(null, u),
            );
          } catch (c) {
            lr(u, c);
          }
        })(this, t));
    }
    var cr = {
      get: function () {
        var t = B,
          r = kn;
        function o(u, s) {
          var c = this,
            f = !t.global && (t !== B || r !== kn),
            h = f && !ot(),
            v = new N(function (g, _) {
              fr(c, new uo(co(u, t, f, h), co(s, t, f, h), g, _, t));
            });
          return (this._consoleTask && (v._consoleTask = this._consoleTask), v);
        }
        return ((o.prototype = Xt), o);
      },
      set: function (t) {
        Y(
          this,
          'then',
          t && t.prototype === Xt
            ? cr
            : {
                get: function () {
                  return t;
                },
                set: cr.set,
              },
        );
      },
    };
    function uo(t, r, o, u, s) {
      ((this.onFulfilled = typeof t == 'function' ? t : null),
        (this.onRejected = typeof r == 'function' ? r : null),
        (this.resolve = o),
        (this.reject = u),
        (this.psd = s));
    }
    function lr(t, r) {
      var o, u;
      (yn.push(r),
        t._state === null &&
          ((o = t._lib && At()),
          (r = sr(r)),
          (t._state = !1),
          (t._value = r),
          (u = t),
          _t.some(function (s) {
            return s._value === u._value;
          }) || _t.push(u),
          ao(t),
          o && Zt()));
    }
    function ao(t) {
      var r = t._listeners;
      t._listeners = [];
      for (var o = 0, u = r.length; o < u; ++o) fr(t, r[o]);
      var s = t._PSD;
      (--s.ref || s.finalize(),
        wt === 0 &&
          (++wt,
          Ht(function () {
            --wt == 0 && hr();
          }, [])));
    }
    function fr(t, r) {
      if (t._state !== null) {
        var o = t._state ? r.onFulfilled : r.onRejected;
        if (o === null) return (t._state ? r.resolve : r.reject)(t._value);
        (++r.psd.ref, ++wt, Ht(Mi, [o, t, r]));
      } else t._listeners.push(r);
    }
    function Mi(t, r, o) {
      try {
        var u,
          s = r._value;
        (!r._state && yn.length && (yn = []),
          (u =
            Fe && r._consoleTask
              ? r._consoleTask.run(function () {
                  return t(s);
                })
              : t(s)),
          r._state ||
            yn.indexOf(s) !== -1 ||
            (function (c) {
              for (var f = _t.length; f; ) if (_t[--f]._value === c._value) return _t.splice(f, 1);
            })(r),
          o.resolve(u));
      } catch (c) {
        o.reject(c);
      } finally {
        (--wt == 0 && hr(), --o.psd.ref || o.psd.finalize());
      }
    }
    function Ui() {
      kt(nt, function () {
        At() && Zt();
      });
    }
    function At() {
      var t = ar;
      return ((vn = ar = !1), t);
    }
    function Zt() {
      var t, r, o;
      do
        for (; 0 < en.length; )
          for (t = en, en = [], o = t.length, r = 0; r < o; ++r) {
            var u = t[r];
            u[0].apply(null, u[1]);
          }
      while (0 < en.length);
      vn = ar = !0;
    }
    function hr() {
      var t = _t;
      ((_t = []),
        t.forEach(function (u) {
          u._PSD.onunhandled.call(null, u._value, u);
        }));
      for (var r = gn.slice(0), o = r.length; o; ) r[--o]();
    }
    function bn(t) {
      return new N(Xt, !1, t);
    }
    function ie(t, r) {
      var o = B;
      return function () {
        var u = At(),
          s = B;
        try {
          return (it(o, !0), t.apply(this, arguments));
        } catch (c) {
          r && r(c);
        } finally {
          (it(s, !1), u && Zt());
        }
      };
    }
    (W(N.prototype, {
      then: cr,
      _then: function (t, r) {
        fr(this, new uo(null, null, t, r, B));
      },
      catch: function (t) {
        if (arguments.length === 1) return this.then(null, t);
        var r = t,
          o = arguments[1];
        return typeof r == 'function'
          ? this.then(null, function (u) {
              return (u instanceof r ? o : bn)(u);
            })
          : this.then(null, function (u) {
              return (u && u.name === r ? o : bn)(u);
            });
      },
      finally: function (t) {
        return this.then(
          function (r) {
            return N.resolve(t()).then(function () {
              return r;
            });
          },
          function (r) {
            return N.resolve(t()).then(function () {
              return bn(r);
            });
          },
        );
      },
      timeout: function (t, r) {
        var o = this;
        return t < 1 / 0
          ? new N(function (u, s) {
              var c = setTimeout(function () {
                return s(new q.Timeout(r));
              }, t);
              o.then(u, s).finally(clearTimeout.bind(null, c));
            })
          : this;
      },
    }),
      typeof Symbol < 'u' &&
        Symbol.toStringTag &&
        Y(N.prototype, Symbol.toStringTag, 'Dexie.Promise'),
      (nt.env = so()),
      W(N, {
        all: function () {
          var t = ee.apply(null, arguments).map(xn);
          return new N(function (r, o) {
            t.length === 0 && r([]);
            var u = t.length;
            t.forEach(function (s, c) {
              return N.resolve(s).then(function (f) {
                ((t[c] = f), --u || r(t));
              }, o);
            });
          });
        },
        resolve: function (t) {
          return t instanceof N
            ? t
            : t && typeof t.then == 'function'
              ? new N(function (r, o) {
                  t.then(r, o);
                })
              : new N(Xt, !0, t);
        },
        reject: bn,
        race: function () {
          var t = ee.apply(null, arguments).map(xn);
          return new N(function (r, o) {
            t.map(function (u) {
              return N.resolve(u).then(r, o);
            });
          });
        },
        PSD: {
          get: function () {
            return B;
          },
          set: function (t) {
            return (B = t);
          },
        },
        totalEchoes: {
          get: function () {
            return kn;
          },
        },
        newPSD: rt,
        usePSD: kt,
        scheduler: {
          get: function () {
            return Ht;
          },
          set: function (t) {
            Ht = t;
          },
        },
        rejectionMapper: {
          get: function () {
            return sr;
          },
          set: function (t) {
            sr = t;
          },
        },
        follow: function (t, r) {
          return new N(function (o, u) {
            return rt(
              function (s, c) {
                var f = B;
                ((f.unhandleds = []),
                  (f.onunhandled = c),
                  (f.finalize = yt(function () {
                    var h,
                      v = this;
                    ((h = function () {
                      v.unhandleds.length === 0 ? s() : c(v.unhandleds[0]);
                    }),
                      gn.push(function g() {
                        (h(), gn.splice(gn.indexOf(g), 1));
                      }),
                      ++wt,
                      Ht(function () {
                        --wt == 0 && hr();
                      }, []));
                  }, f.finalize)),
                  t());
              },
              r,
              o,
              u,
            );
          });
        },
      }),
      bt &&
        (bt.allSettled &&
          Y(N, 'allSettled', function () {
            var t = ee.apply(null, arguments).map(xn);
            return new N(function (r) {
              t.length === 0 && r([]);
              var o = t.length,
                u = new Array(o);
              t.forEach(function (s, c) {
                return N.resolve(s)
                  .then(
                    function (f) {
                      return (u[c] = { status: 'fulfilled', value: f });
                    },
                    function (f) {
                      return (u[c] = { status: 'rejected', reason: f });
                    },
                  )
                  .then(function () {
                    return --o || r(u);
                  });
              });
            });
          }),
        bt.any &&
          typeof AggregateError < 'u' &&
          Y(N, 'any', function () {
            var t = ee.apply(null, arguments).map(xn);
            return new N(function (r, o) {
              t.length === 0 && o(new AggregateError([]));
              var u = t.length,
                s = new Array(u);
              t.forEach(function (c, f) {
                return N.resolve(c).then(
                  function (h) {
                    return r(h);
                  },
                  function (h) {
                    ((s[f] = h), --u || o(new AggregateError(s)));
                  },
                );
              });
            });
          }),
        bt.withResolvers && (N.withResolvers = bt.withResolvers)));
    var ye = { awaits: 0, echoes: 0, id: 0 },
      Li = 0,
      _n = [],
      wn = 0,
      kn = 0,
      Vi = 0;
    function rt(t, r, o, u) {
      var s = B,
        c = Object.create(s);
      return (
        (c.parent = s),
        (c.ref = 0),
        (c.global = !1),
        (c.id = ++Vi),
        nt.env,
        (c.env = ur
          ? {
              Promise: N,
              PromiseProp: { value: N, configurable: !0, writable: !0 },
              all: N.all,
              race: N.race,
              allSettled: N.allSettled,
              any: N.any,
              resolve: N.resolve,
              reject: N.reject,
            }
          : {}),
        r && A(c, r),
        ++s.ref,
        (c.finalize = function () {
          --this.parent.ref || this.parent.finalize();
        }),
        (u = kt(c, t, o, u)),
        c.ref === 0 && c.finalize(),
        u
      );
    }
    function Tt() {
      return (ye.id || (ye.id = ++Li), ++ye.awaits, (ye.echoes += io), ye.id);
    }
    function ot() {
      return !!ye.awaits && (--ye.awaits == 0 && (ye.id = 0), (ye.echoes = ye.awaits * io), !0);
    }
    function xn(t) {
      return ye.echoes && t && t.constructor === bt
        ? (Tt(),
          t.then(
            function (r) {
              return (ot(), r);
            },
            function (r) {
              return (ot(), me(r));
            },
          ))
        : t;
    }
    function Wi() {
      var t = _n[_n.length - 1];
      (_n.pop(), it(t, !1));
    }
    function it(t, r) {
      var o,
        u = B;
      ((r ? !ye.echoes || (wn++ && t === B) : !wn || (--wn && t === B)) ||
        queueMicrotask(
          r
            ? function (s) {
                (++kn,
                  (ye.echoes && --ye.echoes != 0) || (ye.echoes = ye.awaits = ye.id = 0),
                  _n.push(B),
                  it(s, !0));
              }.bind(null, t)
            : Wi,
        ),
        t !== B &&
          ((B = t),
          u === nt && (nt.env = so()),
          ur &&
            ((o = nt.env.Promise),
            (r = t.env),
            (u.global || t.global) &&
              (Object.defineProperty(m, 'Promise', r.PromiseProp),
              (o.all = r.all),
              (o.race = r.race),
              (o.resolve = r.resolve),
              (o.reject = r.reject),
              r.allSettled && (o.allSettled = r.allSettled),
              r.any && (o.any = r.any)))));
    }
    function so() {
      var t = m.Promise;
      return ur
        ? {
            Promise: t,
            PromiseProp: Object.getOwnPropertyDescriptor(m, 'Promise'),
            all: t.all,
            race: t.race,
            allSettled: t.allSettled,
            any: t.any,
            resolve: t.resolve,
            reject: t.reject,
          }
        : {};
    }
    function kt(t, r, o, u, s) {
      var c = B;
      try {
        return (it(t, !0), r(o, u, s));
      } finally {
        it(c, !1);
      }
    }
    function co(t, r, o, u) {
      return typeof t != 'function'
        ? t
        : function () {
            var s = B;
            (o && Tt(), it(r, !0));
            try {
              return t.apply(this, arguments);
            } finally {
              (it(s, !1), u && queueMicrotask(ot));
            }
          };
    }
    function dr(t) {
      Promise === bt && ye.echoes === 0
        ? wn === 0
          ? t()
          : enqueueNativeMicroTask(t)
        : setTimeout(t, 0);
    }
    ('' + je).indexOf('[native code]') === -1 && (Tt = ot = te);
    var me = N.reject,
      xt = '￿',
      Xe =
        'Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.',
      lo = 'String expected.',
      $t = [],
      zn = '__dbnames',
      pr = 'readonly',
      mr = 'readwrite';
    function zt(t, r) {
      return t
        ? r
          ? function () {
              return t.apply(this, arguments) && r.apply(this, arguments);
            }
          : t
        : r;
    }
    var fo = { type: 3, lower: -1 / 0, lowerOpen: !1, upper: [[]], upperOpen: !1 };
    function En(t) {
      return typeof t != 'string' || /\./.test(t)
        ? function (r) {
            return r;
          }
        : function (r) {
            return (r[t] === void 0 && t in r && delete (r = $e(r))[t], r);
          };
    }
    function ho() {
      throw q.Type(
        'Entity instances must never be new:ed. Instances are generated by the framework bypassing the constructor.',
      );
    }
    function X(t, r) {
      try {
        var o = po(t),
          u = po(r);
        if (o !== u)
          return o === 'Array'
            ? 1
            : u === 'Array'
              ? -1
              : o === 'binary'
                ? 1
                : u === 'binary'
                  ? -1
                  : o === 'string'
                    ? 1
                    : u === 'string'
                      ? -1
                      : o === 'Date'
                        ? 1
                        : u !== 'Date'
                          ? NaN
                          : -1;
        switch (o) {
          case 'number':
          case 'Date':
          case 'string':
            return r < t ? 1 : t < r ? -1 : 0;
          case 'binary':
            return (function (s, c) {
              for (var f = s.length, h = c.length, v = f < h ? f : h, g = 0; g < v; ++g)
                if (s[g] !== c[g]) return s[g] < c[g] ? -1 : 1;
              return f === h ? 0 : f < h ? -1 : 1;
            })(mo(t), mo(r));
          case 'Array':
            return (function (s, c) {
              for (var f = s.length, h = c.length, v = f < h ? f : h, g = 0; g < v; ++g) {
                var _ = X(s[g], c[g]);
                if (_ !== 0) return _;
              }
              return f === h ? 0 : f < h ? -1 : 1;
            })(t, r);
        }
      } catch {}
      return NaN;
    }
    function po(t) {
      var r = typeof t;
      return r != 'object'
        ? r
        : ArrayBuffer.isView(t)
          ? 'binary'
          : ((t = Ye(t)), t === 'ArrayBuffer' ? 'binary' : t);
    }
    function mo(t) {
      return t instanceof Uint8Array
        ? t
        : ArrayBuffer.isView(t)
          ? new Uint8Array(t.buffer, t.byteOffset, t.byteLength)
          : new Uint8Array(t);
    }
    function On(t, r, o) {
      var u = t.schema.yProps;
      return u
        ? (r &&
            0 < o.numFailures &&
            (r = r.filter(function (s, c) {
              return !o.failures[c];
            })),
          Promise.all(
            u.map(function (s) {
              return (
                (s = s.updatesTable),
                r ? t.db.table(s).where('k').anyOf(r).delete() : t.db.table(s).clear()
              );
            }),
          ).then(function () {
            return o;
          }))
        : o;
    }
    var vo =
      ((oe.prototype._trans = function (t, r, o) {
        var u = this._tx || B.trans,
          s = this.name,
          c =
            Fe &&
            typeof console < 'u' &&
            console.createTask &&
            console.createTask(
              'Dexie: '.concat(t === 'readonly' ? 'read' : 'write', ' ').concat(this.name),
            );
        function f(g, _, p) {
          if (!p.schema[s]) throw new q.NotFound('Table ' + s + ' not part of transaction');
          return r(p.idbtrans, p);
        }
        var h = At();
        try {
          var v =
            u && u.db._novip === this.db._novip
              ? u === B.trans
                ? u._promise(t, f, o)
                : rt(
                    function () {
                      return u._promise(t, f, o);
                    },
                    { trans: u, transless: B.transless || B },
                  )
              : (function g(_, p, x, y) {
                  if (_.idbdb && (_._state.openComplete || B.letThrough || _._vip)) {
                    var b = _._createTransaction(p, x, _._dbSchema);
                    try {
                      (b.create(), (_._state.PR1398_maxLoop = 3));
                    } catch (k) {
                      return k.name === Ne.InvalidState &&
                        _.isOpen() &&
                        0 < --_._state.PR1398_maxLoop
                        ? (console.warn('Dexie: Need to reopen db'),
                          _.close({ disableAutoOpen: !1 }),
                          _.open().then(function () {
                            return g(_, p, x, y);
                          }))
                        : me(k);
                    }
                    return b
                      ._promise(p, function (k, w) {
                        return rt(function () {
                          return ((B.trans = b), y(k, w, b));
                        });
                      })
                      .then(function (k) {
                        if (p === 'readwrite')
                          try {
                            b.idbtrans.commit();
                          } catch {}
                        return p === 'readonly'
                          ? k
                          : b._completion.then(function () {
                              return k;
                            });
                      });
                  }
                  if (_._state.openComplete) return me(new q.DatabaseClosed(_._state.dbOpenError));
                  if (!_._state.isBeingOpened) {
                    if (!_._state.autoOpen) return me(new q.DatabaseClosed());
                    _.open().catch(te);
                  }
                  return _._state.dbReadyPromise.then(function () {
                    return g(_, p, x, y);
                  });
                })(this.db, t, [this.name], f);
          return (
            c &&
              ((v._consoleTask = c),
              (v = v.catch(function (g) {
                return (console.trace(g), me(g));
              }))),
            v
          );
        } finally {
          h && Zt();
        }
      }),
      (oe.prototype.get = function (t, r) {
        var o = this;
        return t && t.constructor === Object
          ? this.where(t).first(r)
          : t == null
            ? me(new q.Type('Invalid argument to Table.get()'))
            : this._trans('readonly', function (u) {
                return o.core.get({ trans: u, key: t }).then(function (s) {
                  return o.hook.reading.fire(s);
                });
              }).then(r);
      }),
      (oe.prototype.where = function (t) {
        if (typeof t == 'string') return new this.db.WhereClause(this, t);
        if (E(t)) return new this.db.WhereClause(this, '['.concat(t.join('+'), ']'));
        var r = d(t);
        if (r.length === 1) return this.where(r[0]).equals(t[r[0]]);
        var o = this.schema.indexes
          .concat(this.schema.primKey)
          .filter(function (h) {
            if (
              h.compound &&
              r.every(function (g) {
                return 0 <= h.keyPath.indexOf(g);
              })
            ) {
              for (var v = 0; v < r.length; ++v) if (r.indexOf(h.keyPath[v]) === -1) return !1;
              return !0;
            }
            return !1;
          })
          .sort(function (h, v) {
            return h.keyPath.length - v.keyPath.length;
          })[0];
        if (o && this.db._maxKey !== xt) {
          var c = o.keyPath.slice(0, r.length);
          return this.where(c).equals(
            c.map(function (v) {
              return t[v];
            }),
          );
        }
        !o &&
          Fe &&
          console.warn(
            'The query '
              .concat(JSON.stringify(t), ' on ')
              .concat(this.name, ' would benefit from a ') +
              'compound index ['.concat(r.join('+'), ']'),
          );
        var u = this.schema.idxByName;
        function s(h, v) {
          return X(h, v) === 0;
        }
        var f = r.reduce(
            function (p, v) {
              var g = p[0],
                _ = p[1],
                p = u[v],
                x = t[v];
              return [
                g || p,
                g || !p
                  ? zt(
                      _,
                      p && p.multi
                        ? function (y) {
                            return (
                              (y = be(y, v)),
                              E(y) &&
                                y.some(function (b) {
                                  return s(x, b);
                                })
                            );
                          }
                        : function (y) {
                            return s(x, be(y, v));
                          },
                    )
                  : _,
              ];
            },
            [null, null],
          ),
          c = f[0],
          f = f[1];
        return c
          ? this.where(c.name).equals(t[c.keyPath]).filter(f)
          : o
            ? this.filter(f)
            : this.where(r).equals('');
      }),
      (oe.prototype.filter = function (t) {
        return this.toCollection().and(t);
      }),
      (oe.prototype.count = function (t) {
        return this.toCollection().count(t);
      }),
      (oe.prototype.offset = function (t) {
        return this.toCollection().offset(t);
      }),
      (oe.prototype.limit = function (t) {
        return this.toCollection().limit(t);
      }),
      (oe.prototype.each = function (t) {
        return this.toCollection().each(t);
      }),
      (oe.prototype.toArray = function (t) {
        return this.toCollection().toArray(t);
      }),
      (oe.prototype.toCollection = function () {
        return new this.db.Collection(new this.db.WhereClause(this));
      }),
      (oe.prototype.orderBy = function (t) {
        return new this.db.Collection(
          new this.db.WhereClause(this, E(t) ? '['.concat(t.join('+'), ']') : t),
        );
      }),
      (oe.prototype.reverse = function () {
        return this.toCollection().reverse();
      }),
      (oe.prototype.mapToClass = function (t) {
        var r,
          o = this.db,
          u = this.name;
        function s() {
          return (r !== null && r.apply(this, arguments)) || this;
        }
        (this.schema.mappedClass = t).prototype instanceof ho &&
          ((function (v, g) {
            if (typeof g != 'function' && g !== null)
              throw new TypeError(
                'Class extends value ' + String(g) + ' is not a constructor or null',
              );
            function _() {
              this.constructor = v;
            }
            (i(v, g),
              (v.prototype =
                g === null ? Object.create(g) : ((_.prototype = g.prototype), new _())));
          })(s, (r = t)),
          Object.defineProperty(s.prototype, 'db', {
            get: function () {
              return o;
            },
            enumerable: !1,
            configurable: !0,
          }),
          (s.prototype.table = function () {
            return u;
          }),
          (t = s));
        for (var c = new Set(), f = t.prototype; f; f = C(f))
          Object.getOwnPropertyNames(f).forEach(function (v) {
            return c.add(v);
          });
        function h(v) {
          if (!v) return v;
          var g,
            _ = Object.create(t.prototype);
          for (g in v)
            if (!c.has(g))
              try {
                _[g] = v[g];
              } catch {}
          return _;
        }
        return (
          this.schema.readHook && this.hook.reading.unsubscribe(this.schema.readHook),
          (this.schema.readHook = h),
          this.hook('reading', h),
          t
        );
      }),
      (oe.prototype.defineClass = function () {
        return this.mapToClass(function (t) {
          A(this, t);
        });
      }),
      (oe.prototype.add = function (t, r) {
        var o = this,
          u = this.schema.primKey,
          s = u.auto,
          c = u.keyPath,
          f = t;
        return (
          c && s && (f = En(c)(t)),
          this._trans('readwrite', function (h) {
            return o.core.mutate({
              trans: h,
              type: 'add',
              keys: r != null ? [r] : null,
              values: [f],
            });
          })
            .then(function (h) {
              return h.numFailures ? N.reject(h.failures[0]) : h.lastResult;
            })
            .then(function (h) {
              if (c)
                try {
                  we(t, c, h);
                } catch {}
              return h;
            })
        );
      }),
      (oe.prototype.update = function (t, r) {
        return typeof t != 'object' || E(t)
          ? this.where(':id').equals(t).modify(r)
          : ((t = be(t, this.schema.primKey.keyPath)),
            t === void 0
              ? me(new q.InvalidArgument('Given object does not contain its primary key'))
              : this.where(':id').equals(t).modify(r));
      }),
      (oe.prototype.put = function (t, r) {
        var o = this,
          u = this.schema.primKey,
          s = u.auto,
          c = u.keyPath,
          f = t;
        return (
          c && s && (f = En(c)(t)),
          this._trans('readwrite', function (h) {
            return o.core.mutate({
              trans: h,
              type: 'put',
              values: [f],
              keys: r != null ? [r] : null,
            });
          })
            .then(function (h) {
              return h.numFailures ? N.reject(h.failures[0]) : h.lastResult;
            })
            .then(function (h) {
              if (c)
                try {
                  we(t, c, h);
                } catch {}
              return h;
            })
        );
      }),
      (oe.prototype.delete = function (t) {
        var r = this;
        return this._trans('readwrite', function (o) {
          return r.core
            .mutate({ trans: o, type: 'delete', keys: [t] })
            .then(function (u) {
              return On(r, [t], u);
            })
            .then(function (u) {
              return u.numFailures ? N.reject(u.failures[0]) : void 0;
            });
        });
      }),
      (oe.prototype.clear = function () {
        var t = this;
        return this._trans('readwrite', function (r) {
          return t.core.mutate({ trans: r, type: 'deleteRange', range: fo }).then(function (o) {
            return On(t, null, o);
          });
        }).then(function (r) {
          return r.numFailures ? N.reject(r.failures[0]) : void 0;
        });
      }),
      (oe.prototype.bulkGet = function (t) {
        var r = this;
        return this._trans('readonly', function (o) {
          return r.core.getMany({ keys: t, trans: o }).then(function (u) {
            return u.map(function (s) {
              return r.hook.reading.fire(s);
            });
          });
        });
      }),
      (oe.prototype.bulkAdd = function (t, r, o) {
        var u = this,
          s = Array.isArray(r) ? r : void 0,
          c = (o = o || (s ? void 0 : r)) ? o.allKeys : void 0;
        return this._trans('readwrite', function (f) {
          var g = u.schema.primKey,
            h = g.auto,
            g = g.keyPath;
          if (g && s)
            throw new q.InvalidArgument(
              'bulkAdd(): keys argument invalid on tables with inbound keys',
            );
          if (s && s.length !== t.length)
            throw new q.InvalidArgument('Arguments objects and keys must have the same length');
          var v = t.length,
            g = g && h ? t.map(En(g)) : t;
          return u.core
            .mutate({ trans: f, type: 'add', keys: s, values: g, wantResults: c })
            .then(function (b) {
              var p = b.numFailures,
                x = b.results,
                y = b.lastResult,
                b = b.failures;
              if (p === 0) return c ? x : y;
              throw new Je(
                ''.concat(u.name, '.bulkAdd(): ').concat(p, ' of ').concat(v, ' operations failed'),
                b,
              );
            });
        });
      }),
      (oe.prototype.bulkPut = function (t, r, o) {
        var u = this,
          s = Array.isArray(r) ? r : void 0,
          c = (o = o || (s ? void 0 : r)) ? o.allKeys : void 0;
        return this._trans('readwrite', function (f) {
          var g = u.schema.primKey,
            h = g.auto,
            g = g.keyPath;
          if (g && s)
            throw new q.InvalidArgument(
              'bulkPut(): keys argument invalid on tables with inbound keys',
            );
          if (s && s.length !== t.length)
            throw new q.InvalidArgument('Arguments objects and keys must have the same length');
          var v = t.length,
            g = g && h ? t.map(En(g)) : t;
          return u.core
            .mutate({ trans: f, type: 'put', keys: s, values: g, wantResults: c })
            .then(function (b) {
              var p = b.numFailures,
                x = b.results,
                y = b.lastResult,
                b = b.failures;
              if (p === 0) return c ? x : y;
              throw new Je(
                ''.concat(u.name, '.bulkPut(): ').concat(p, ' of ').concat(v, ' operations failed'),
                b,
              );
            });
        });
      }),
      (oe.prototype.bulkUpdate = function (t) {
        var r = this,
          o = this.core,
          u = t.map(function (f) {
            return f.key;
          }),
          s = t.map(function (f) {
            return f.changes;
          }),
          c = [];
        return this._trans('readwrite', function (f) {
          return o.getMany({ trans: f, keys: u, cache: 'clone' }).then(function (h) {
            var v = [],
              g = [];
            t.forEach(function (p, x) {
              var y = p.key,
                b = p.changes,
                k = h[x];
              if (k) {
                for (var w = 0, z = Object.keys(b); w < z.length; w++) {
                  var O = z[w],
                    P = b[O];
                  if (O === r.schema.primKey.keyPath) {
                    if (X(P, y) !== 0)
                      throw new q.Constraint('Cannot update primary key in bulkUpdate()');
                  } else we(k, O, P);
                }
                (c.push(x), v.push(y), g.push(k));
              }
            });
            var _ = v.length;
            return o
              .mutate({
                trans: f,
                type: 'put',
                keys: v,
                values: g,
                updates: { keys: u, changeSpecs: s },
              })
              .then(function (p) {
                var x = p.numFailures,
                  y = p.failures;
                if (x === 0) return _;
                for (var b = 0, k = Object.keys(y); b < k.length; b++) {
                  var w,
                    z = k[b],
                    O = c[Number(z)];
                  O != null && ((w = y[z]), delete y[z], (y[O] = w));
                }
                throw new Je(
                  ''
                    .concat(r.name, '.bulkUpdate(): ')
                    .concat(x, ' of ')
                    .concat(_, ' operations failed'),
                  y,
                );
              });
          });
        });
      }),
      (oe.prototype.bulkDelete = function (t) {
        var r = this,
          o = t.length;
        return this._trans('readwrite', function (u) {
          return r.core.mutate({ trans: u, type: 'delete', keys: t }).then(function (s) {
            return On(r, t, s);
          });
        }).then(function (f) {
          var s = f.numFailures,
            c = f.lastResult,
            f = f.failures;
          if (s === 0) return c;
          throw new Je(
            ''.concat(r.name, '.bulkDelete(): ').concat(s, ' of ').concat(o, ' operations failed'),
            f,
          );
        });
      }),
      oe);
    function oe() {}
    function tn(t) {
      function r(f, h) {
        if (h) {
          for (var v = arguments.length, g = new Array(v - 1); --v; ) g[v - 1] = arguments[v];
          return (o[f].subscribe.apply(null, g), t);
        }
        if (typeof f == 'string') return o[f];
      }
      var o = {};
      r.addEventType = c;
      for (var u = 1, s = arguments.length; u < s; ++u) c(arguments[u]);
      return r;
      function c(f, h, v) {
        if (typeof f != 'object') {
          var g;
          h = h || qi;
          var _ = {
            subscribers: [],
            fire: (v = v || te),
            subscribe: function (p) {
              _.subscribers.indexOf(p) === -1 && (_.subscribers.push(p), (_.fire = h(_.fire, p)));
            },
            unsubscribe: function (p) {
              ((_.subscribers = _.subscribers.filter(function (x) {
                return x !== p;
              })),
                (_.fire = _.subscribers.reduce(h, v)));
            },
          };
          return (o[f] = r[f] = _);
        }
        d((g = f)).forEach(function (p) {
          var x = g[p];
          if (E(x)) c(p, g[p][0], g[p][1]);
          else {
            if (x !== 'asap') throw new q.InvalidArgument('Invalid event config');
            var y = c(p, Jt, function () {
              for (var b = arguments.length, k = new Array(b); b--; ) k[b] = arguments[b];
              y.subscribers.forEach(function (w) {
                Ze(function () {
                  w.apply(null, k);
                });
              });
            });
          }
        });
      }
    }
    function nn(t, r) {
      return (ae(r).from({ prototype: t }), r);
    }
    function jt(t, r) {
      return !(t.filter || t.algorithm || t.or) && (r ? t.justLimit : !t.replayFilter);
    }
    function vr(t, r) {
      t.filter = zt(t.filter, r);
    }
    function yr(t, r, o) {
      var u = t.replayFilter;
      ((t.replayFilter = u
        ? function () {
            return zt(u(), r());
          }
        : r),
        (t.justLimit = o && !u));
    }
    function Pn(t, r) {
      if (t.isPrimKey) return r.primaryKey;
      var o = r.getIndexByKeyPath(t.index);
      if (!o)
        throw new q.Schema('KeyPath ' + t.index + ' on object store ' + r.name + ' is not indexed');
      return o;
    }
    function yo(t, r, o) {
      var u = Pn(t, r.schema);
      return r.openCursor({
        trans: o,
        values: !t.keysOnly,
        reverse: t.dir === 'prev',
        unique: !!t.unique,
        query: { index: u, range: t.range },
      });
    }
    function Sn(t, r, o, u) {
      var s = t.replayFilter ? zt(t.filter, t.replayFilter()) : t.filter;
      if (t.or) {
        var c = {},
          f = function (h, v, g) {
            var _, p;
            (s &&
              !s(
                v,
                g,
                function (x) {
                  return v.stop(x);
                },
                function (x) {
                  return v.fail(x);
                },
              )) ||
              ((p = '' + (_ = v.primaryKey)) == '[object ArrayBuffer]' &&
                (p = '' + new Uint8Array(_)),
              U(c, p) || ((c[p] = !0), r(h, v, g)));
          };
        return Promise.all([
          t.or._iterate(f, o),
          go(yo(t, u, o), t.algorithm, f, !t.keysOnly && t.valueMapper),
        ]);
      }
      return go(yo(t, u, o), zt(t.algorithm, s), r, !t.keysOnly && t.valueMapper);
    }
    function go(t, r, o, u) {
      var s = ie(
        u
          ? function (c, f, h) {
              return o(u(c), f, h);
            }
          : o,
      );
      return t.then(function (c) {
        if (c)
          return c.start(function () {
            var f = function () {
              return c.continue();
            };
            ((r &&
              !r(
                c,
                function (h) {
                  return (f = h);
                },
                function (h) {
                  (c.stop(h), (f = te));
                },
                function (h) {
                  (c.fail(h), (f = te));
                },
              )) ||
              s(c.value, c, function (h) {
                return (f = h);
              }),
              f());
          });
      });
    }
    var rn =
      ((bo.prototype.execute = function (t) {
        var r = this['@@propmod'];
        if (r.add !== void 0) {
          var o = r.add;
          if (E(o)) return l(l([], E(t) ? t : [], !0), o).sort();
          if (typeof o == 'number') return (Number(t) || 0) + o;
          if (typeof o == 'bigint')
            try {
              return BigInt(t) + o;
            } catch {
              return BigInt(0) + o;
            }
          throw new TypeError('Invalid term '.concat(o));
        }
        if (r.remove !== void 0) {
          var u = r.remove;
          if (E(u))
            return E(t)
              ? t
                  .filter(function (s) {
                    return !u.includes(s);
                  })
                  .sort()
              : [];
          if (typeof u == 'number') return Number(t) - u;
          if (typeof u == 'bigint')
            try {
              return BigInt(t) - u;
            } catch {
              return BigInt(0) - u;
            }
          throw new TypeError('Invalid subtrahend '.concat(u));
        }
        return (
          (o = (o = r.replacePrefix) === null || o === void 0 ? void 0 : o[0]),
          o && typeof t == 'string' && t.startsWith(o)
            ? r.replacePrefix[1] + t.substring(o.length)
            : t
        );
      }),
      bo);
    function bo(t) {
      this['@@propmod'] = t;
    }
    var Yi =
      ((H.prototype._read = function (t, r) {
        var o = this._ctx;
        return o.error
          ? o.table._trans(null, me.bind(null, o.error))
          : o.table._trans('readonly', t).then(r);
      }),
      (H.prototype._write = function (t) {
        var r = this._ctx;
        return r.error
          ? r.table._trans(null, me.bind(null, r.error))
          : r.table._trans('readwrite', t, 'locked');
      }),
      (H.prototype._addAlgorithm = function (t) {
        var r = this._ctx;
        r.algorithm = zt(r.algorithm, t);
      }),
      (H.prototype._iterate = function (t, r) {
        return Sn(this._ctx, t, r, this._ctx.table.core);
      }),
      (H.prototype.clone = function (t) {
        var r = Object.create(this.constructor.prototype),
          o = Object.create(this._ctx);
        return (t && A(o, t), (r._ctx = o), r);
      }),
      (H.prototype.raw = function () {
        return ((this._ctx.valueMapper = null), this);
      }),
      (H.prototype.each = function (t) {
        var r = this._ctx;
        return this._read(function (o) {
          return Sn(r, t, o, r.table.core);
        });
      }),
      (H.prototype.count = function (t) {
        var r = this;
        return this._read(function (o) {
          var u = r._ctx,
            s = u.table.core;
          if (jt(u, !0))
            return s
              .count({ trans: o, query: { index: Pn(u, s.schema), range: u.range } })
              .then(function (f) {
                return Math.min(f, u.limit);
              });
          var c = 0;
          return Sn(
            u,
            function () {
              return (++c, !1);
            },
            o,
            s,
          ).then(function () {
            return c;
          });
        }).then(t);
      }),
      (H.prototype.sortBy = function (t, r) {
        var o = t.split('.').reverse(),
          u = o[0],
          s = o.length - 1;
        function c(v, g) {
          return g ? c(v[o[g]], g - 1) : v[u];
        }
        var f = this._ctx.dir === 'next' ? 1 : -1;
        function h(v, g) {
          return X(c(v, s), c(g, s)) * f;
        }
        return this.toArray(function (v) {
          return v.sort(h);
        }).then(r);
      }),
      (H.prototype.toArray = function (t) {
        var r = this;
        return this._read(function (o) {
          var u = r._ctx;
          if (u.dir === 'next' && jt(u, !0) && 0 < u.limit) {
            var s = u.valueMapper,
              c = Pn(u, u.table.core.schema);
            return u.table.core
              .query({ trans: o, limit: u.limit, values: !0, query: { index: c, range: u.range } })
              .then(function (h) {
                return ((h = h.result), s ? h.map(s) : h);
              });
          }
          var f = [];
          return Sn(
            u,
            function (h) {
              return f.push(h);
            },
            o,
            u.table.core,
          ).then(function () {
            return f;
          });
        }, t);
      }),
      (H.prototype.offset = function (t) {
        var r = this._ctx;
        return (
          t <= 0 ||
            ((r.offset += t),
            jt(r)
              ? yr(r, function () {
                  var o = t;
                  return function (u, s) {
                    return (
                      o === 0 ||
                      (o === 1
                        ? --o
                        : s(function () {
                            (u.advance(o), (o = 0));
                          }),
                      !1)
                    );
                  };
                })
              : yr(r, function () {
                  var o = t;
                  return function () {
                    return --o < 0;
                  };
                })),
          this
        );
      }),
      (H.prototype.limit = function (t) {
        return (
          (this._ctx.limit = Math.min(this._ctx.limit, t)),
          yr(
            this._ctx,
            function () {
              var r = t;
              return function (o, u, s) {
                return (--r <= 0 && u(s), 0 <= r);
              };
            },
            !0,
          ),
          this
        );
      }),
      (H.prototype.until = function (t, r) {
        return (
          vr(this._ctx, function (o, u, s) {
            return !t(o.value) || (u(s), r);
          }),
          this
        );
      }),
      (H.prototype.first = function (t) {
        return this.limit(1)
          .toArray(function (r) {
            return r[0];
          })
          .then(t);
      }),
      (H.prototype.last = function (t) {
        return this.reverse().first(t);
      }),
      (H.prototype.filter = function (t) {
        var r;
        return (
          vr(this._ctx, function (o) {
            return t(o.value);
          }),
          ((r = this._ctx).isMatch = zt(r.isMatch, t)),
          this
        );
      }),
      (H.prototype.and = function (t) {
        return this.filter(t);
      }),
      (H.prototype.or = function (t) {
        return new this.db.WhereClause(this._ctx.table, t, this);
      }),
      (H.prototype.reverse = function () {
        return (
          (this._ctx.dir = this._ctx.dir === 'prev' ? 'next' : 'prev'),
          this._ondirectionchange && this._ondirectionchange(this._ctx.dir),
          this
        );
      }),
      (H.prototype.desc = function () {
        return this.reverse();
      }),
      (H.prototype.eachKey = function (t) {
        var r = this._ctx;
        return (
          (r.keysOnly = !r.isMatch),
          this.each(function (o, u) {
            t(u.key, u);
          })
        );
      }),
      (H.prototype.eachUniqueKey = function (t) {
        return ((this._ctx.unique = 'unique'), this.eachKey(t));
      }),
      (H.prototype.eachPrimaryKey = function (t) {
        var r = this._ctx;
        return (
          (r.keysOnly = !r.isMatch),
          this.each(function (o, u) {
            t(u.primaryKey, u);
          })
        );
      }),
      (H.prototype.keys = function (t) {
        var r = this._ctx;
        r.keysOnly = !r.isMatch;
        var o = [];
        return this.each(function (u, s) {
          o.push(s.key);
        })
          .then(function () {
            return o;
          })
          .then(t);
      }),
      (H.prototype.primaryKeys = function (t) {
        var r = this._ctx;
        if (r.dir === 'next' && jt(r, !0) && 0 < r.limit)
          return this._read(function (u) {
            var s = Pn(r, r.table.core.schema);
            return r.table.core.query({
              trans: u,
              values: !1,
              limit: r.limit,
              query: { index: s, range: r.range },
            });
          })
            .then(function (u) {
              return u.result;
            })
            .then(t);
        r.keysOnly = !r.isMatch;
        var o = [];
        return this.each(function (u, s) {
          o.push(s.primaryKey);
        })
          .then(function () {
            return o;
          })
          .then(t);
      }),
      (H.prototype.uniqueKeys = function (t) {
        return ((this._ctx.unique = 'unique'), this.keys(t));
      }),
      (H.prototype.firstKey = function (t) {
        return this.limit(1)
          .keys(function (r) {
            return r[0];
          })
          .then(t);
      }),
      (H.prototype.lastKey = function (t) {
        return this.reverse().firstKey(t);
      }),
      (H.prototype.distinct = function () {
        var t = this._ctx,
          t = t.index && t.table.schema.idxByName[t.index];
        if (!t || !t.multi) return this;
        var r = {};
        return (
          vr(this._ctx, function (s) {
            var u = s.primaryKey.toString(),
              s = U(r, u);
            return ((r[u] = !0), !s);
          }),
          this
        );
      }),
      (H.prototype.modify = function (t) {
        var r = this,
          o = this._ctx;
        return this._write(function (u) {
          var s, c, f;
          f =
            typeof t == 'function'
              ? t
              : ((s = d(t)),
                (c = s.length),
                function (z) {
                  for (var O = !1, P = 0; P < c; ++P) {
                    var S = s[P],
                      Z = t[S],
                      j = be(z, S);
                    Z instanceof rn
                      ? (we(z, S, Z.execute(j)), (O = !0))
                      : j !== Z && (we(z, S, Z), (O = !0));
                  }
                  return O;
                });
          var h = o.table.core,
            p = h.schema.primaryKey,
            v = p.outbound,
            g = p.extractKey,
            _ = 200,
            p = r.db._options.modifyChunkSize;
          p && (_ = typeof p == 'object' ? p[h.name] || p['*'] || 200 : p);
          function x(z, S) {
            var P = S.failures,
              S = S.numFailures;
            b += z - S;
            for (var Z = 0, j = d(P); Z < j.length; Z++) {
              var T = j[Z];
              y.push(P[T]);
            }
          }
          var y = [],
            b = 0,
            k = [],
            w = t === _o;
          return r
            .clone()
            .primaryKeys()
            .then(function (z) {
              function O(S) {
                var Z = Math.min(_, z.length - S),
                  j = z.slice(S, S + Z);
                return (
                  w ? Promise.resolve([]) : h.getMany({ trans: u, keys: j, cache: 'immutable' })
                ).then(function (T) {
                  var $ = [],
                    R = [],
                    D = v ? [] : null,
                    K = w ? j : [];
                  if (!w)
                    for (var G = 0; G < Z; ++G) {
                      var Q = T[G],
                        V = { value: $e(Q), primKey: z[S + G] };
                      f.call(V, V.value, V) !== !1 &&
                        (V.value == null
                          ? K.push(z[S + G])
                          : v || X(g(Q), g(V.value)) === 0
                            ? (R.push(V.value), v && D.push(z[S + G]))
                            : (K.push(z[S + G]), $.push(V.value)));
                    }
                  return Promise.resolve(
                    0 < $.length &&
                      h.mutate({ trans: u, type: 'add', values: $ }).then(function (he) {
                        for (var L in he.failures) K.splice(parseInt(L), 1);
                        x($.length, he);
                      }),
                  )
                    .then(function () {
                      return (
                        (0 < R.length || (P && typeof t == 'object')) &&
                        h
                          .mutate({
                            trans: u,
                            type: 'put',
                            keys: D,
                            values: R,
                            criteria: P,
                            changeSpec: typeof t != 'function' && t,
                            isAdditionalChunk: 0 < S,
                          })
                          .then(function (he) {
                            return x(R.length, he);
                          })
                      );
                    })
                    .then(function () {
                      return (
                        (0 < K.length || (P && w)) &&
                        h
                          .mutate({
                            trans: u,
                            type: 'delete',
                            keys: K,
                            criteria: P,
                            isAdditionalChunk: 0 < S,
                          })
                          .then(function (he) {
                            return On(o.table, K, he);
                          })
                          .then(function (he) {
                            return x(K.length, he);
                          })
                      );
                    })
                    .then(function () {
                      return z.length > S + Z && O(S + _);
                    });
                });
              }
              var P = jt(o) &&
                o.limit === 1 / 0 &&
                (typeof t != 'function' || w) && { index: o.index, range: o.range };
              return O(0).then(function () {
                if (0 < y.length) throw new vt('Error modifying one or more objects', y, b, k);
                return z.length;
              });
            });
        });
      }),
      (H.prototype.delete = function () {
        var t = this._ctx,
          r = t.range;
        return !jt(t) || t.table.schema.yProps || (!t.isPrimKey && r.type !== 3)
          ? this.modify(_o)
          : this._write(function (o) {
              var u = t.table.core.schema.primaryKey,
                s = r;
              return t.table.core
                .count({ trans: o, query: { index: u, range: s } })
                .then(function (c) {
                  return t.table.core
                    .mutate({ trans: o, type: 'deleteRange', range: s })
                    .then(function (v) {
                      var h = v.failures,
                        v = v.numFailures;
                      if (v)
                        throw new vt(
                          'Could not delete some values',
                          Object.keys(h).map(function (g) {
                            return h[g];
                          }),
                          c - v,
                        );
                      return c - v;
                    });
                });
            });
      }),
      H);
    function H() {}
    var _o = function (t, r) {
      return (r.value = null);
    };
    function Gi(t, r) {
      return t < r ? -1 : t === r ? 0 : 1;
    }
    function Ji(t, r) {
      return r < t ? -1 : t === r ? 0 : 1;
    }
    function Ae(t, r, o) {
      return (
        (t = t instanceof ko ? new t.Collection(t) : t),
        (t._ctx.error = new (o || TypeError)(r)),
        t
      );
    }
    function Ct(t) {
      return new t.Collection(t, function () {
        return wo('');
      }).limit(0);
    }
    function In(t, r, o, u) {
      var s,
        c,
        f,
        h,
        v,
        g,
        _,
        p = o.length;
      if (
        !o.every(function (b) {
          return typeof b == 'string';
        })
      )
        return Ae(t, lo);
      function x(b) {
        ((s =
          b === 'next'
            ? function (w) {
                return w.toUpperCase();
              }
            : function (w) {
                return w.toLowerCase();
              }),
          (c =
            b === 'next'
              ? function (w) {
                  return w.toLowerCase();
                }
              : function (w) {
                  return w.toUpperCase();
                }),
          (f = b === 'next' ? Gi : Ji));
        var k = o
          .map(function (w) {
            return { lower: c(w), upper: s(w) };
          })
          .sort(function (w, z) {
            return f(w.lower, z.lower);
          });
        ((h = k.map(function (w) {
          return w.upper;
        })),
          (v = k.map(function (w) {
            return w.lower;
          })),
          (_ = (g = b) === 'next' ? '' : u));
      }
      (x('next'),
        (t = new t.Collection(t, function () {
          return ut(h[0], v[p - 1] + u);
        })),
        (t._ondirectionchange = function (b) {
          x(b);
        }));
      var y = 0;
      return (
        t._addAlgorithm(function (b, k, w) {
          var z = b.key;
          if (typeof z != 'string') return !1;
          var O = c(z);
          if (r(O, v, y)) return !0;
          for (var P = null, S = y; S < p; ++S) {
            var Z = (function (j, T, $, R, D, K) {
              for (var G = Math.min(j.length, R.length), Q = -1, V = 0; V < G; ++V) {
                var he = T[V];
                if (he !== R[V])
                  return D(j[V], $[V]) < 0
                    ? j.substr(0, V) + $[V] + $.substr(V + 1)
                    : D(j[V], R[V]) < 0
                      ? j.substr(0, V) + R[V] + $.substr(V + 1)
                      : 0 <= Q
                        ? j.substr(0, Q) + T[Q] + $.substr(Q + 1)
                        : null;
                D(j[V], he) < 0 && (Q = V);
              }
              return G < R.length && K === 'next'
                ? j + $.substr(j.length)
                : G < j.length && K === 'prev'
                  ? j.substr(0, $.length)
                  : Q < 0
                    ? null
                    : j.substr(0, Q) + R[Q] + $.substr(Q + 1);
            })(z, O, h[S], v[S], f, g);
            Z === null && P === null ? (y = S + 1) : (P === null || 0 < f(P, Z)) && (P = Z);
          }
          return (
            k(
              P !== null
                ? function () {
                    b.continue(P + _);
                  }
                : w,
            ),
            !1
          );
        }),
        t
      );
    }
    function ut(t, r, o, u) {
      return { type: 2, lower: t, upper: r, lowerOpen: o, upperOpen: u };
    }
    function wo(t) {
      return { type: 1, lower: t, upper: t };
    }
    var ko =
      (Object.defineProperty(ge.prototype, 'Collection', {
        get: function () {
          return this._ctx.table.db.Collection;
        },
        enumerable: !1,
        configurable: !0,
      }),
      (ge.prototype.between = function (t, r, o, u) {
        ((o = o !== !1), (u = u === !0));
        try {
          return 0 < this._cmp(t, r) || (this._cmp(t, r) === 0 && (o || u) && (!o || !u))
            ? Ct(this)
            : new this.Collection(this, function () {
                return ut(t, r, !o, !u);
              });
        } catch {
          return Ae(this, Xe);
        }
      }),
      (ge.prototype.equals = function (t) {
        return t == null
          ? Ae(this, Xe)
          : new this.Collection(this, function () {
              return wo(t);
            });
      }),
      (ge.prototype.above = function (t) {
        return t == null
          ? Ae(this, Xe)
          : new this.Collection(this, function () {
              return ut(t, void 0, !0);
            });
      }),
      (ge.prototype.aboveOrEqual = function (t) {
        return t == null
          ? Ae(this, Xe)
          : new this.Collection(this, function () {
              return ut(t, void 0, !1);
            });
      }),
      (ge.prototype.below = function (t) {
        return t == null
          ? Ae(this, Xe)
          : new this.Collection(this, function () {
              return ut(void 0, t, !1, !0);
            });
      }),
      (ge.prototype.belowOrEqual = function (t) {
        return t == null
          ? Ae(this, Xe)
          : new this.Collection(this, function () {
              return ut(void 0, t);
            });
      }),
      (ge.prototype.startsWith = function (t) {
        return typeof t != 'string' ? Ae(this, lo) : this.between(t, t + xt, !0, !0);
      }),
      (ge.prototype.startsWithIgnoreCase = function (t) {
        return t === ''
          ? this.startsWith(t)
          : In(
              this,
              function (r, o) {
                return r.indexOf(o[0]) === 0;
              },
              [t],
              xt,
            );
      }),
      (ge.prototype.equalsIgnoreCase = function (t) {
        return In(
          this,
          function (r, o) {
            return r === o[0];
          },
          [t],
          '',
        );
      }),
      (ge.prototype.anyOfIgnoreCase = function () {
        var t = ee.apply(fe, arguments);
        return t.length === 0
          ? Ct(this)
          : In(
              this,
              function (r, o) {
                return o.indexOf(r) !== -1;
              },
              t,
              '',
            );
      }),
      (ge.prototype.startsWithAnyOfIgnoreCase = function () {
        var t = ee.apply(fe, arguments);
        return t.length === 0
          ? Ct(this)
          : In(
              this,
              function (r, o) {
                return o.some(function (u) {
                  return r.indexOf(u) === 0;
                });
              },
              t,
              xt,
            );
      }),
      (ge.prototype.anyOf = function () {
        var t = this,
          r = ee.apply(fe, arguments),
          o = this._cmp;
        try {
          r.sort(o);
        } catch {
          return Ae(this, Xe);
        }
        if (r.length === 0) return Ct(this);
        var u = new this.Collection(this, function () {
          return ut(r[0], r[r.length - 1]);
        });
        u._ondirectionchange = function (c) {
          ((o = c === 'next' ? t._ascending : t._descending), r.sort(o));
        };
        var s = 0;
        return (
          u._addAlgorithm(function (c, f, h) {
            for (var v = c.key; 0 < o(v, r[s]); ) if (++s === r.length) return (f(h), !1);
            return (
              o(v, r[s]) === 0 ||
              (f(function () {
                c.continue(r[s]);
              }),
              !1)
            );
          }),
          u
        );
      }),
      (ge.prototype.notEqual = function (t) {
        return this.inAnyRange(
          [
            [-1 / 0, t],
            [t, this.db._maxKey],
          ],
          { includeLowers: !1, includeUppers: !1 },
        );
      }),
      (ge.prototype.noneOf = function () {
        var t = ee.apply(fe, arguments);
        if (t.length === 0) return new this.Collection(this);
        try {
          t.sort(this._ascending);
        } catch {
          return Ae(this, Xe);
        }
        var r = t.reduce(function (o, u) {
          return o ? o.concat([[o[o.length - 1][1], u]]) : [[-1 / 0, u]];
        }, null);
        return (
          r.push([t[t.length - 1], this.db._maxKey]),
          this.inAnyRange(r, { includeLowers: !1, includeUppers: !1 })
        );
      }),
      (ge.prototype.inAnyRange = function (z, r) {
        var o = this,
          u = this._cmp,
          s = this._ascending,
          c = this._descending,
          f = this._min,
          h = this._max;
        if (z.length === 0) return Ct(this);
        if (
          !z.every(function (O) {
            return O[0] !== void 0 && O[1] !== void 0 && s(O[0], O[1]) <= 0;
          })
        )
          return Ae(
            this,
            'First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower',
            q.InvalidArgument,
          );
        var v = !r || r.includeLowers !== !1,
          g = r && r.includeUppers === !0,
          _,
          p = s;
        function x(O, P) {
          return p(O[0], P[0]);
        }
        try {
          (_ = z.reduce(function (O, P) {
            for (var S = 0, Z = O.length; S < Z; ++S) {
              var j = O[S];
              if (u(P[0], j[1]) < 0 && 0 < u(P[1], j[0])) {
                ((j[0] = f(j[0], P[0])), (j[1] = h(j[1], P[1])));
                break;
              }
            }
            return (S === Z && O.push(P), O);
          }, [])).sort(x);
        } catch {
          return Ae(this, Xe);
        }
        var y = 0,
          b = g
            ? function (O) {
                return 0 < s(O, _[y][1]);
              }
            : function (O) {
                return 0 <= s(O, _[y][1]);
              },
          k = v
            ? function (O) {
                return 0 < c(O, _[y][0]);
              }
            : function (O) {
                return 0 <= c(O, _[y][0]);
              },
          w = b,
          z = new this.Collection(this, function () {
            return ut(_[0][0], _[_.length - 1][1], !v, !g);
          });
        return (
          (z._ondirectionchange = function (O) {
            ((p = O === 'next' ? ((w = b), s) : ((w = k), c)), _.sort(x));
          }),
          z._addAlgorithm(function (O, P, S) {
            for (var Z, j = O.key; w(j); ) if (++y === _.length) return (P(S), !1);
            return (
              (!b((Z = j)) && !k(Z)) ||
              (o._cmp(j, _[y][1]) === 0 ||
                o._cmp(j, _[y][0]) === 0 ||
                P(function () {
                  p === s ? O.continue(_[y][0]) : O.continue(_[y][1]);
                }),
              !1)
            );
          }),
          z
        );
      }),
      (ge.prototype.startsWithAnyOf = function () {
        var t = ee.apply(fe, arguments);
        return t.every(function (r) {
          return typeof r == 'string';
        })
          ? t.length === 0
            ? Ct(this)
            : this.inAnyRange(
                t.map(function (r) {
                  return [r, r + xt];
                }),
              )
          : Ae(this, 'startsWithAnyOf() only works with strings');
      }),
      ge);
    function ge() {}
    function qe(t) {
      return ie(function (r) {
        return (on(r), t(r.target.error), !1);
      });
    }
    function on(t) {
      (t.stopPropagation && t.stopPropagation(), t.preventDefault && t.preventDefault());
    }
    var un = 'storagemutated',
      gr = 'x-storagemutated-1',
      at = tn(null, un),
      Xi =
        ((Me.prototype._lock = function () {
          return (
            pe(!B.global),
            ++this._reculock,
            this._reculock !== 1 || B.global || (B.lockOwnerFor = this),
            this
          );
        }),
        (Me.prototype._unlock = function () {
          if ((pe(!B.global), --this._reculock == 0))
            for (
              B.global || (B.lockOwnerFor = null);
              0 < this._blockedFuncs.length && !this._locked();

            ) {
              var t = this._blockedFuncs.shift();
              try {
                kt(t[1], t[0]);
              } catch {}
            }
          return this;
        }),
        (Me.prototype._locked = function () {
          return this._reculock && B.lockOwnerFor !== this;
        }),
        (Me.prototype.create = function (t) {
          var r = this;
          if (!this.mode) return this;
          var o = this.db.idbdb,
            u = this.db._state.dbOpenError;
          if ((pe(!this.idbtrans), !t && !o))
            switch (u && u.name) {
              case 'DatabaseClosedError':
                throw new q.DatabaseClosed(u);
              case 'MissingAPIError':
                throw new q.MissingAPI(u.message, u);
              default:
                throw new q.OpenFailed(u);
            }
          if (!this.active) throw new q.TransactionInactive();
          return (
            pe(this._completion._state === null),
            ((t = this.idbtrans =
              t ||
              (this.db.core || o).transaction(this.storeNames, this.mode, {
                durability: this.chromeTransactionDurability,
              })).onerror = ie(function (s) {
              (on(s), r._reject(t.error));
            })),
            (t.onabort = ie(function (s) {
              (on(s),
                r.active && r._reject(new q.Abort(t.error)),
                (r.active = !1),
                r.on('abort').fire(s));
            })),
            (t.oncomplete = ie(function () {
              ((r.active = !1),
                r._resolve(),
                'mutatedParts' in t && at.storagemutated.fire(t.mutatedParts));
            })),
            this
          );
        }),
        (Me.prototype._promise = function (t, r, o) {
          var u = this;
          if (t === 'readwrite' && this.mode !== 'readwrite')
            return me(new q.ReadOnly('Transaction is readonly'));
          if (!this.active) return me(new q.TransactionInactive());
          if (this._locked())
            return new N(function (c, f) {
              u._blockedFuncs.push([
                function () {
                  u._promise(t, r, o).then(c, f);
                },
                B,
              ]);
            });
          if (o)
            return rt(function () {
              var c = new N(function (f, h) {
                u._lock();
                var v = r(f, h, u);
                v && v.then && v.then(f, h);
              });
              return (
                c.finally(function () {
                  return u._unlock();
                }),
                (c._lib = !0),
                c
              );
            });
          var s = new N(function (c, f) {
            var h = r(c, f, u);
            h && h.then && h.then(c, f);
          });
          return ((s._lib = !0), s);
        }),
        (Me.prototype._root = function () {
          return this.parent ? this.parent._root() : this;
        }),
        (Me.prototype.waitFor = function (t) {
          var r,
            o = this._root(),
            u = N.resolve(t);
          o._waitingFor
            ? (o._waitingFor = o._waitingFor.then(function () {
                return u;
              }))
            : ((o._waitingFor = u),
              (o._waitingQueue = []),
              (r = o.idbtrans.objectStore(o.storeNames[0])),
              (function c() {
                for (++o._spinCount; o._waitingQueue.length; ) o._waitingQueue.shift()();
                o._waitingFor && (r.get(-1 / 0).onsuccess = c);
              })());
          var s = o._waitingFor;
          return new N(function (c, f) {
            u.then(
              function (h) {
                return o._waitingQueue.push(ie(c.bind(null, h)));
              },
              function (h) {
                return o._waitingQueue.push(ie(f.bind(null, h)));
              },
            ).finally(function () {
              o._waitingFor === s && (o._waitingFor = null);
            });
          });
        }),
        (Me.prototype.abort = function () {
          this.active &&
            ((this.active = !1),
            this.idbtrans && this.idbtrans.abort(),
            this._reject(new q.Abort()));
        }),
        (Me.prototype.table = function (t) {
          var r = this._memoizedTables || (this._memoizedTables = {});
          if (U(r, t)) return r[t];
          var o = this.schema[t];
          if (!o) throw new q.NotFound('Table ' + t + ' not part of transaction');
          return (
            (o = new this.db.Table(t, o, this)),
            (o.core = this.db.core.table(t)),
            (r[t] = o)
          );
        }),
        Me);
    function Me() {}
    function br(t, r, o, u, s, c, f, h) {
      return {
        name: t,
        keyPath: r,
        unique: o,
        multi: u,
        auto: s,
        compound: c,
        src: (o && !f ? '&' : '') + (u ? '*' : '') + (s ? '++' : '') + xo(r),
        type: h,
      };
    }
    function xo(t) {
      return typeof t == 'string' ? t : t ? '[' + [].join.call(t, '+') + ']' : '';
    }
    function _r(t, r, o) {
      return {
        name: t,
        primKey: r,
        indexes: o,
        mappedClass: null,
        idxByName:
          ((u = function (s) {
            return [s.name, s];
          }),
          o.reduce(function (s, c, f) {
            return ((f = u(c, f)), f && (s[f[0]] = f[1]), s);
          }, {})),
      };
      var u;
    }
    var an = function (t) {
      try {
        return (
          t.only([[]]),
          (an = function () {
            return [[]];
          }),
          [[]]
        );
      } catch {
        return (
          (an = function () {
            return xt;
          }),
          xt
        );
      }
    };
    function wr(t) {
      return t == null
        ? function () {}
        : typeof t == 'string'
          ? (r = t).split('.').length === 1
            ? function (o) {
                return o[r];
              }
            : function (o) {
                return be(o, r);
              }
          : function (o) {
              return be(o, t);
            };
      var r;
    }
    function zo(t) {
      return [].slice.call(t);
    }
    var Qi = 0;
    function sn(t) {
      return t == null ? ':id' : typeof t == 'string' ? t : '['.concat(t.join('+'), ']');
    }
    function Hi(t, r, v) {
      function u(w) {
        if (w.type === 3) return null;
        if (w.type === 4) throw new Error('Cannot convert never type to IDBKeyRange');
        var y = w.lower,
          b = w.upper,
          k = w.lowerOpen,
          w = w.upperOpen;
        return y === void 0
          ? b === void 0
            ? null
            : r.upperBound(b, !!w)
          : b === void 0
            ? r.lowerBound(y, !!k)
            : r.bound(y, b, !!k, !!w);
      }
      function s(x) {
        var y,
          b = x.name;
        return {
          name: b,
          schema: x,
          mutate: function (k) {
            var w = k.trans,
              z = k.type,
              O = k.keys,
              P = k.values,
              S = k.range;
            return new Promise(function (Z, j) {
              Z = ie(Z);
              var T = w.objectStore(b),
                $ = T.keyPath == null,
                R = z === 'put' || z === 'add';
              if (!R && z !== 'delete' && z !== 'deleteRange')
                throw new Error('Invalid operation type: ' + z);
              var D,
                K = (O || P || { length: 1 }).length;
              if (O && P && O.length !== P.length)
                throw new Error('Given keys array must have same length as given values array.');
              if (K === 0)
                return Z({ numFailures: 0, failures: {}, results: [], lastResult: void 0 });
              function G(Pe) {
                (++he, on(Pe));
              }
              var Q = [],
                V = [],
                he = 0;
              if (z === 'deleteRange') {
                if (S.type === 4)
                  return Z({ numFailures: he, failures: V, results: [], lastResult: void 0 });
                S.type === 3 ? Q.push((D = T.clear())) : Q.push((D = T.delete(u(S))));
              } else {
                var $ = R ? ($ ? [P, O] : [P, null]) : [O, null],
                  L = $[0],
                  xe = $[1];
                if (R)
                  for (var ze = 0; ze < K; ++ze)
                    (Q.push((D = xe && xe[ze] !== void 0 ? T[z](L[ze], xe[ze]) : T[z](L[ze]))),
                      (D.onerror = G));
                else for (ze = 0; ze < K; ++ze) (Q.push((D = T[z](L[ze]))), (D.onerror = G));
              }
              function Fn(Pe) {
                ((Pe = Pe.target.result),
                  Q.forEach(function (Pt, Kr) {
                    return Pt.error != null && (V[Kr] = Pt.error);
                  }),
                  Z({
                    numFailures: he,
                    failures: V,
                    results:
                      z === 'delete'
                        ? O
                        : Q.map(function (Pt) {
                            return Pt.result;
                          }),
                    lastResult: Pe,
                  }));
              }
              ((D.onerror = function (Pe) {
                (G(Pe), Fn(Pe));
              }),
                (D.onsuccess = Fn));
            });
          },
          getMany: function (k) {
            var w = k.trans,
              z = k.keys;
            return new Promise(function (O, P) {
              O = ie(O);
              for (
                var S,
                  Z = w.objectStore(b),
                  j = z.length,
                  T = new Array(j),
                  $ = 0,
                  R = 0,
                  D = function (Q) {
                    ((Q = Q.target), (T[Q._pos] = Q.result), ++R === $ && O(T));
                  },
                  K = qe(P),
                  G = 0;
                G < j;
                ++G
              )
                z[G] != null &&
                  (((S = Z.get(z[G]))._pos = G), (S.onsuccess = D), (S.onerror = K), ++$);
              $ === 0 && O(T);
            });
          },
          get: function (k) {
            var w = k.trans,
              z = k.key;
            return new Promise(function (O, P) {
              O = ie(O);
              var S = w.objectStore(b).get(z);
              ((S.onsuccess = function (Z) {
                return O(Z.target.result);
              }),
                (S.onerror = qe(P)));
            });
          },
          query:
            ((y = g),
            function (k) {
              return new Promise(function (w, z) {
                w = ie(w);
                var O,
                  P,
                  S,
                  $ = k.trans,
                  Z = k.values,
                  j = k.limit,
                  D = k.query,
                  T = j === 1 / 0 ? void 0 : j,
                  R = D.index,
                  D = D.range,
                  $ = $.objectStore(b),
                  R = R.isPrimaryKey ? $ : $.index(R.name),
                  D = u(D);
                if (j === 0) return w({ result: [] });
                y
                  ? (((T = Z ? R.getAll(D, T) : R.getAllKeys(D, T)).onsuccess = function (K) {
                      return w({ result: K.target.result });
                    }),
                    (T.onerror = qe(z)))
                  : ((O = 0),
                    (P = !Z && 'openKeyCursor' in R ? R.openKeyCursor(D) : R.openCursor(D)),
                    (S = []),
                    (P.onsuccess = function (K) {
                      var G = P.result;
                      return G
                        ? (S.push(Z ? G.value : G.primaryKey),
                          ++O === j ? w({ result: S }) : void G.continue())
                        : w({ result: S });
                    }),
                    (P.onerror = qe(z)));
              });
            }),
          openCursor: function (k) {
            var w = k.trans,
              z = k.values,
              O = k.query,
              P = k.reverse,
              S = k.unique;
            return new Promise(function (Z, j) {
              Z = ie(Z);
              var R = O.index,
                T = O.range,
                $ = w.objectStore(b),
                $ = R.isPrimaryKey ? $ : $.index(R.name),
                R = P ? (S ? 'prevunique' : 'prev') : S ? 'nextunique' : 'next',
                D = !z && 'openKeyCursor' in $ ? $.openKeyCursor(u(T), R) : $.openCursor(u(T), R);
              ((D.onerror = qe(j)),
                (D.onsuccess = ie(function (K) {
                  var G,
                    Q,
                    V,
                    he,
                    L = D.result;
                  L
                    ? ((L.___id = ++Qi),
                      (L.done = !1),
                      (G = L.continue.bind(L)),
                      (Q = (Q = L.continuePrimaryKey) && Q.bind(L)),
                      (V = L.advance.bind(L)),
                      (he = function () {
                        throw new Error('Cursor not stopped');
                      }),
                      (L.trans = w),
                      (L.stop =
                        L.continue =
                        L.continuePrimaryKey =
                        L.advance =
                          function () {
                            throw new Error('Cursor not started');
                          }),
                      (L.fail = ie(j)),
                      (L.next = function () {
                        var xe = this,
                          ze = 1;
                        return this.start(function () {
                          return ze-- ? xe.continue() : xe.stop();
                        }).then(function () {
                          return xe;
                        });
                      }),
                      (L.start = function (xe) {
                        function ze() {
                          if (D.result)
                            try {
                              xe();
                            } catch (Pe) {
                              L.fail(Pe);
                            }
                          else
                            ((L.done = !0),
                              (L.start = function () {
                                throw new Error('Cursor behind last entry');
                              }),
                              L.stop());
                        }
                        var Fn = new Promise(function (Pe, Pt) {
                          ((Pe = ie(Pe)),
                            (D.onerror = qe(Pt)),
                            (L.fail = Pt),
                            (L.stop = function (Kr) {
                              ((L.stop = L.continue = L.continuePrimaryKey = L.advance = he),
                                Pe(Kr));
                            }));
                        });
                        return (
                          (D.onsuccess = ie(function (Pe) {
                            ((D.onsuccess = ze), ze());
                          })),
                          (L.continue = G),
                          (L.continuePrimaryKey = Q),
                          (L.advance = V),
                          ze(),
                          Fn
                        );
                      }),
                      Z(L))
                    : Z(null);
                }, j)));
            });
          },
          count: function (k) {
            var w = k.query,
              z = k.trans,
              O = w.index,
              P = w.range;
            return new Promise(function (S, Z) {
              var j = z.objectStore(b),
                T = O.isPrimaryKey ? j : j.index(O.name),
                j = u(P),
                T = j ? T.count(j) : T.count();
              ((T.onsuccess = ie(function ($) {
                return S($.target.result);
              })),
                (T.onerror = qe(Z)));
            });
          },
        };
      }
      var c,
        f,
        h,
        _ =
          ((f = v),
          (h = zo((c = t).objectStoreNames)),
          {
            schema: {
              name: c.name,
              tables: h
                .map(function (x) {
                  return f.objectStore(x);
                })
                .map(function (x) {
                  var y = x.keyPath,
                    w = x.autoIncrement,
                    b = E(y),
                    k = {},
                    w = {
                      name: x.name,
                      primaryKey: {
                        name: null,
                        isPrimaryKey: !0,
                        outbound: y == null,
                        compound: b,
                        keyPath: y,
                        autoIncrement: w,
                        unique: !0,
                        extractKey: wr(y),
                      },
                      indexes: zo(x.indexNames)
                        .map(function (z) {
                          return x.index(z);
                        })
                        .map(function (S) {
                          var O = S.name,
                            P = S.unique,
                            Z = S.multiEntry,
                            S = S.keyPath,
                            Z = {
                              name: O,
                              compound: E(S),
                              keyPath: S,
                              unique: P,
                              multiEntry: Z,
                              extractKey: wr(S),
                            };
                          return (k[sn(S)] = Z);
                        }),
                      getIndexByKeyPath: function (z) {
                        return k[sn(z)];
                      },
                    };
                  return ((k[':id'] = w.primaryKey), y != null && (k[sn(y)] = w.primaryKey), w);
                }),
            },
            hasGetAll:
              0 < h.length &&
              'getAll' in f.objectStore(h[0]) &&
              !(
                typeof navigator < 'u' &&
                /Safari/.test(navigator.userAgent) &&
                !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
                [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604
              ),
          }),
        v = _.schema,
        g = _.hasGetAll,
        _ = v.tables.map(s),
        p = {};
      return (
        _.forEach(function (x) {
          return (p[x.name] = x);
        }),
        {
          stack: 'dbcore',
          transaction: t.transaction.bind(t),
          table: function (x) {
            if (!p[x]) throw new Error("Table '".concat(x, "' not found"));
            return p[x];
          },
          MIN_KEY: -1 / 0,
          MAX_KEY: an(r),
          schema: v,
        }
      );
    }
    function eu(t, r, o, u) {
      var s = o.IDBKeyRange;
      return (
        o.indexedDB,
        {
          dbcore:
            ((u = Hi(r, s, u)),
            t.dbcore.reduce(function (c, f) {
              return ((f = f.create), a(a({}, c), f(c)));
            }, u)),
        }
      );
    }
    function An(t, u) {
      var o = u.db,
        u = eu(t._middlewares, o, t._deps, u);
      ((t.core = u.dbcore),
        t.tables.forEach(function (s) {
          var c = s.name;
          t.core.schema.tables.some(function (f) {
            return f.name === c;
          }) && ((s.core = t.core.table(c)), t[c] instanceof t.Table && (t[c].core = s.core));
        }));
    }
    function Zn(t, r, o, u) {
      o.forEach(function (s) {
        var c = u[s];
        r.forEach(function (f) {
          var h = (function v(g, _) {
            return Ee(g, _) || ((g = C(g)) && v(g, _));
          })(f, s);
          (!h || ('value' in h && h.value === void 0)) &&
            (f === t.Transaction.prototype || f instanceof t.Transaction
              ? Y(f, s, {
                  get: function () {
                    return this.table(s);
                  },
                  set: function (v) {
                    J(this, s, { value: v, writable: !0, configurable: !0, enumerable: !0 });
                  },
                })
              : (f[s] = new t.Table(s, c)));
        });
      });
    }
    function kr(t, r) {
      r.forEach(function (o) {
        for (var u in o) o[u] instanceof t.Table && delete o[u];
      });
    }
    function tu(t, r) {
      return t._cfg.version - r._cfg.version;
    }
    function nu(t, r, o, u) {
      var s = t._dbSchema;
      o.objectStoreNames.contains('$meta') &&
        !s.$meta &&
        ((s.$meta = _r('$meta', Oo('')[0], [])), t._storeNames.push('$meta'));
      var c = t._createTransaction('readwrite', t._storeNames, s);
      (c.create(o), c._completion.catch(u));
      var f = c._reject.bind(c),
        h = B.transless || B;
      rt(function () {
        return (
          (B.trans = c),
          (B.transless = h),
          r !== 0
            ? (An(t, o),
              (g = r),
              ((v = c).storeNames.includes('$meta')
                ? v
                    .table('$meta')
                    .get('version')
                    .then(function (_) {
                      return _ ?? g;
                    })
                : N.resolve(g)
              )
                .then(function (_) {
                  return (
                    (x = _),
                    (y = c),
                    (b = o),
                    (k = []),
                    (_ = (p = t)._versions),
                    (w = p._dbSchema = $n(0, p.idbdb, b)),
                    (_ = _.filter(function (z) {
                      return z._cfg.version >= x;
                    })).length !== 0
                      ? (_.forEach(function (z) {
                          (k.push(function () {
                            var O = w,
                              P = z._cfg.dbschema;
                            (jn(p, O, b), jn(p, P, b), (w = p._dbSchema = P));
                            var S = xr(O, P);
                            (S.add.forEach(function (R) {
                              zr(b, R[0], R[1].primKey, R[1].indexes);
                            }),
                              S.change.forEach(function (R) {
                                if (R.recreate)
                                  throw new q.Upgrade('Not yet support for changing primary key');
                                var D = b.objectStore(R.name);
                                (R.add.forEach(function (K) {
                                  return Tn(D, K);
                                }),
                                  R.change.forEach(function (K) {
                                    (D.deleteIndex(K.name), Tn(D, K));
                                  }),
                                  R.del.forEach(function (K) {
                                    return D.deleteIndex(K);
                                  }));
                              }));
                            var Z = z._cfg.contentUpgrade;
                            if (Z && z._cfg.version > x) {
                              (An(p, b), (y._memoizedTables = {}));
                              var j = St(P);
                              (S.del.forEach(function (R) {
                                j[R] = O[R];
                              }),
                                kr(p, [p.Transaction.prototype]),
                                Zn(p, [p.Transaction.prototype], d(j), j),
                                (y.schema = j));
                              var T,
                                $ = tt(Z);
                              return (
                                $ && Tt(),
                                (S = N.follow(function () {
                                  var R;
                                  (T = Z(y)) && $ && ((R = ot.bind(null, null)), T.then(R, R));
                                })),
                                T && typeof T.then == 'function'
                                  ? N.resolve(T)
                                  : S.then(function () {
                                      return T;
                                    })
                              );
                            }
                          }),
                            k.push(function (O) {
                              var P,
                                S,
                                Z = z._cfg.dbschema;
                              ((P = Z),
                                (S = O),
                                [].slice.call(S.db.objectStoreNames).forEach(function (j) {
                                  return P[j] == null && S.db.deleteObjectStore(j);
                                }),
                                kr(p, [p.Transaction.prototype]),
                                Zn(p, [p.Transaction.prototype], p._storeNames, p._dbSchema),
                                (y.schema = p._dbSchema));
                            }),
                            k.push(function (O) {
                              p.idbdb.objectStoreNames.contains('$meta') &&
                                (Math.ceil(p.idbdb.version / 10) === z._cfg.version
                                  ? (p.idbdb.deleteObjectStore('$meta'),
                                    delete p._dbSchema.$meta,
                                    (p._storeNames = p._storeNames.filter(function (P) {
                                      return P !== '$meta';
                                    })))
                                  : O.objectStore('$meta').put(z._cfg.version, 'version'));
                            }));
                        }),
                        (function z() {
                          return k.length ? N.resolve(k.shift()(y.idbtrans)).then(z) : N.resolve();
                        })().then(function () {
                          Eo(w, b);
                        }))
                      : N.resolve()
                  );
                  var p, x, y, b, k, w;
                })
                .catch(f))
            : (d(s).forEach(function (_) {
                zr(o, _, s[_].primKey, s[_].indexes);
              }),
              An(t, o),
              void N.follow(function () {
                return t.on.populate.fire(c);
              }).catch(f))
        );
        var v, g;
      });
    }
    function ru(t, r) {
      (Eo(t._dbSchema, r),
        r.db.version % 10 != 0 ||
          r.objectStoreNames.contains('$meta') ||
          r.db.createObjectStore('$meta').add(Math.ceil(r.db.version / 10 - 1), 'version'));
      var o = $n(0, t.idbdb, r);
      jn(t, t._dbSchema, r);
      for (var u = 0, s = xr(o, t._dbSchema).change; u < s.length; u++) {
        var c = (function (f) {
          if (f.change.length || f.recreate)
            return (
              console.warn(
                'Unable to patch indexes of table '.concat(
                  f.name,
                  ' because it has changes on the type of index or primary key.',
                ),
              ),
              { value: void 0 }
            );
          var h = r.objectStore(f.name);
          f.add.forEach(function (v) {
            (Fe &&
              console.debug(
                'Dexie upgrade patch: Creating missing index '.concat(f.name, '.').concat(v.src),
              ),
              Tn(h, v));
          });
        })(s[u]);
        if (typeof c == 'object') return c.value;
      }
    }
    function xr(t, r) {
      var o,
        u = { del: [], add: [], change: [] };
      for (o in t) r[o] || u.del.push(o);
      for (o in r) {
        var s = t[o],
          c = r[o];
        if (s) {
          var f = { name: o, def: c, recreate: !1, del: [], add: [], change: [] };
          if (
            '' + (s.primKey.keyPath || '') != '' + (c.primKey.keyPath || '') ||
            s.primKey.auto !== c.primKey.auto
          )
            ((f.recreate = !0), u.change.push(f));
          else {
            var h = s.idxByName,
              v = c.idxByName,
              g = void 0;
            for (g in h) v[g] || f.del.push(g);
            for (g in v) {
              var _ = h[g],
                p = v[g];
              _ ? _.src !== p.src && f.change.push(p) : f.add.push(p);
            }
            (0 < f.del.length || 0 < f.add.length || 0 < f.change.length) && u.change.push(f);
          }
        } else u.add.push([o, c]);
      }
      return u;
    }
    function zr(t, r, o, u) {
      var s = t.db.createObjectStore(
        r,
        o.keyPath ? { keyPath: o.keyPath, autoIncrement: o.auto } : { autoIncrement: o.auto },
      );
      return (
        u.forEach(function (c) {
          return Tn(s, c);
        }),
        s
      );
    }
    function Eo(t, r) {
      d(t).forEach(function (o) {
        r.db.objectStoreNames.contains(o) ||
          (Fe && console.debug('Dexie: Creating missing table', o),
          zr(r, o, t[o].primKey, t[o].indexes));
      });
    }
    function Tn(t, r) {
      t.createIndex(r.name, r.keyPath, { unique: r.unique, multiEntry: r.multi });
    }
    function $n(t, r, o) {
      var u = {};
      return (
        Oe(r.objectStoreNames, 0).forEach(function (s) {
          for (
            var c = o.objectStore(s),
              f = br(
                xo((g = c.keyPath)),
                g || '',
                !0,
                !1,
                !!c.autoIncrement,
                g && typeof g != 'string',
                !0,
              ),
              h = [],
              v = 0;
            v < c.indexNames.length;
            ++v
          ) {
            var _ = c.index(c.indexNames[v]),
              g = _.keyPath,
              _ = br(_.name, g, !!_.unique, !!_.multiEntry, !1, g && typeof g != 'string', !1);
            h.push(_);
          }
          u[s] = _r(s, f, h);
        }),
        u
      );
    }
    function jn(t, r, o) {
      for (var u = o.db.objectStoreNames, s = 0; s < u.length; ++s) {
        var c = u[s],
          f = o.objectStore(c);
        t._hasGetAll = 'getAll' in f;
        for (var h = 0; h < f.indexNames.length; ++h) {
          var v = f.indexNames[h],
            g = f.index(v).keyPath,
            _ = typeof g == 'string' ? g : '[' + Oe(g).join('+') + ']';
          !r[c] ||
            ((g = r[c].idxByName[_]) &&
              ((g.name = v), delete r[c].idxByName[_], (r[c].idxByName[v] = g)));
        }
      }
      typeof navigator < 'u' &&
        /Safari/.test(navigator.userAgent) &&
        !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
        m.WorkerGlobalScope &&
        m instanceof m.WorkerGlobalScope &&
        [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604 &&
        (t._hasGetAll = !1);
    }
    function Oo(t) {
      return t.split(',').map(function (r, o) {
        var c = r.split(':'),
          u = (s = c[1]) === null || s === void 0 ? void 0 : s.trim(),
          s = (r = c[0].trim()).replace(/([&*]|\+\+)/g, ''),
          c = /^\[/.test(s) ? s.match(/^\[(.*)\]$/)[1].split('+') : s;
        return br(s, c || null, /\&/.test(r), /\*/.test(r), /\+\+/.test(r), E(c), o === 0, u);
      });
    }
    var ou =
      ((Dt.prototype._createTableSchema = _r),
      (Dt.prototype._parseIndexSyntax = Oo),
      (Dt.prototype._parseStoresSpec = function (t, r) {
        var o = this;
        d(t).forEach(function (u) {
          if (t[u] !== null) {
            var s = o._parseIndexSyntax(t[u]),
              c = s.shift();
            if (!c) throw new q.Schema('Invalid schema for table ' + u + ': ' + t[u]);
            if (((c.unique = !0), c.multi)) throw new q.Schema('Primary key cannot be multiEntry*');
            (s.forEach(function (f) {
              if (f.auto)
                throw new q.Schema('Only primary key can be marked as autoIncrement (++)');
              if (!f.keyPath)
                throw new q.Schema('Index must have a name and cannot be an empty string');
            }),
              (s = o._createTableSchema(u, c, s)),
              (r[u] = s));
          }
        });
      }),
      (Dt.prototype.stores = function (o) {
        var r = this.db;
        this._cfg.storesSource = this._cfg.storesSource ? A(this._cfg.storesSource, o) : o;
        var o = r._versions,
          u = {},
          s = {};
        return (
          o.forEach(function (c) {
            (A(u, c._cfg.storesSource), (s = c._cfg.dbschema = {}), c._parseStoresSpec(u, s));
          }),
          (r._dbSchema = s),
          kr(r, [r._allTables, r, r.Transaction.prototype]),
          Zn(r, [r._allTables, r, r.Transaction.prototype, this._cfg.tables], d(s), s),
          (r._storeNames = d(s)),
          this
        );
      }),
      (Dt.prototype.upgrade = function (t) {
        return ((this._cfg.contentUpgrade = ir(this._cfg.contentUpgrade || te, t)), this);
      }),
      Dt);
    function Dt() {}
    function Er(t, r) {
      var o = t._dbNamesDB;
      return (
        o ||
          (o = t._dbNamesDB = new Qe(zn, { addons: [], indexedDB: t, IDBKeyRange: r }))
            .version(1)
            .stores({ dbnames: 'name' }),
        o.table('dbnames')
      );
    }
    function Or(t) {
      return t && typeof t.databases == 'function';
    }
    function Pr(t) {
      return rt(function () {
        return ((B.letThrough = !0), t());
      });
    }
    function Sr(t) {
      return !('from' in t);
    }
    var ke = function (t, r) {
      if (!this) {
        var o = new ke();
        return (t && 'd' in t && A(o, t), o);
      }
      A(this, arguments.length ? { d: 1, from: t, to: 1 < arguments.length ? r : t } : { d: 0 });
    };
    function cn(t, r, o) {
      var u = X(r, o);
      if (!isNaN(u)) {
        if (0 < u) throw RangeError();
        if (Sr(t)) return A(t, { from: r, to: o, d: 1 });
        var s = t.l,
          u = t.r;
        if (X(o, t.from) < 0)
          return (s ? cn(s, r, o) : (t.l = { from: r, to: o, d: 1, l: null, r: null }), So(t));
        if (0 < X(r, t.to))
          return (u ? cn(u, r, o) : (t.r = { from: r, to: o, d: 1, l: null, r: null }), So(t));
        (X(r, t.from) < 0 && ((t.from = r), (t.l = null), (t.d = u ? u.d + 1 : 1)),
          0 < X(o, t.to) && ((t.to = o), (t.r = null), (t.d = t.l ? t.l.d + 1 : 1)),
          (o = !t.r),
          s && !t.l && ln(t, s),
          u && o && ln(t, u));
      }
    }
    function ln(t, r) {
      Sr(r) ||
        (function o(u, v) {
          var c = v.from,
            f = v.to,
            h = v.l,
            v = v.r;
          (cn(u, c, f), h && o(u, h), v && o(u, v));
        })(t, r);
    }
    function Po(t, r) {
      var o = Cn(r),
        u = o.next();
      if (u.done) return !1;
      for (var s = u.value, c = Cn(t), f = c.next(s.from), h = f.value; !u.done && !f.done; ) {
        if (X(h.from, s.to) <= 0 && 0 <= X(h.to, s.from)) return !0;
        X(s.from, h.from) < 0 ? (s = (u = o.next(h.from)).value) : (h = (f = c.next(s.from)).value);
      }
      return !1;
    }
    function Cn(t) {
      var r = Sr(t) ? null : { s: 0, n: t };
      return {
        next: function (o) {
          for (var u = 0 < arguments.length; r; )
            switch (r.s) {
              case 0:
                if (((r.s = 1), u))
                  for (; r.n.l && X(o, r.n.from) < 0; ) r = { up: r, n: r.n.l, s: 1 };
                else for (; r.n.l; ) r = { up: r, n: r.n.l, s: 1 };
              case 1:
                if (((r.s = 2), !u || X(o, r.n.to) <= 0)) return { value: r.n, done: !1 };
              case 2:
                if (r.n.r) {
                  ((r.s = 3), (r = { up: r, n: r.n.r, s: 0 }));
                  continue;
                }
              case 3:
                r = r.up;
            }
          return { done: !0 };
        },
      };
    }
    function So(t) {
      var r,
        o,
        u =
          (((r = t.r) === null || r === void 0 ? void 0 : r.d) || 0) -
          (((o = t.l) === null || o === void 0 ? void 0 : o.d) || 0),
        s = 1 < u ? 'r' : u < -1 ? 'l' : '';
      (s &&
        ((r = s == 'r' ? 'l' : 'r'),
        (o = a({}, t)),
        (u = t[s]),
        (t.from = u.from),
        (t.to = u.to),
        (t[s] = u[s]),
        (o[s] = u[r]),
        ((t[r] = o).d = Io(o))),
        (t.d = Io(t)));
    }
    function Io(o) {
      var r = o.r,
        o = o.l;
      return (r ? (o ? Math.max(r.d, o.d) : r.d) : o ? o.d : 0) + 1;
    }
    function Dn(t, r) {
      return (
        d(r).forEach(function (o) {
          t[o]
            ? ln(t[o], r[o])
            : (t[o] = (function u(s) {
                var c,
                  f,
                  h = {};
                for (c in s)
                  U(s, c) &&
                    ((f = s[c]),
                    (h[c] = !f || typeof f != 'object' || mt.has(f.constructor) ? f : u(f)));
                return h;
              })(r[o]));
        }),
        t
      );
    }
    function Ir(t, r) {
      return (
        t.all ||
        r.all ||
        Object.keys(t).some(function (o) {
          return r[o] && Po(r[o], t[o]);
        })
      );
    }
    W(
      ke.prototype,
      (((je = {
        add: function (t) {
          return (ln(this, t), this);
        },
        addKey: function (t) {
          return (cn(this, t, t), this);
        },
        addKeys: function (t) {
          var r = this;
          return (
            t.forEach(function (o) {
              return cn(r, o, o);
            }),
            this
          );
        },
        hasKey: function (t) {
          var r = Cn(this).next(t).value;
          return r && X(r.from, t) <= 0 && 0 <= X(r.to, t);
        },
      })[et] = function () {
        return Cn(this);
      }),
      je),
    );
    var Et = {},
      Ar = {},
      Zr = !1;
    function Rn(t) {
      (Dn(Ar, t),
        Zr ||
          ((Zr = !0),
          setTimeout(function () {
            ((Zr = !1), Tr(Ar, !(Ar = {})));
          }, 0)));
    }
    function Tr(t, r) {
      r === void 0 && (r = !1);
      var o = new Set();
      if (t.all) for (var u = 0, s = Object.values(Et); u < s.length; u++) Ao((f = s[u]), t, o, r);
      else
        for (var c in t) {
          var f,
            h = /^idb\:\/\/(.*)\/(.*)\//.exec(c);
          h &&
            ((c = h[1]), (h = h[2]), (f = Et['idb://'.concat(c, '/').concat(h)]) && Ao(f, t, o, r));
        }
      o.forEach(function (v) {
        return v();
      });
    }
    function Ao(t, r, o, u) {
      for (var s = [], c = 0, f = Object.entries(t.queries.query); c < f.length; c++) {
        for (var h = f[c], v = h[0], g = [], _ = 0, p = h[1]; _ < p.length; _++) {
          var x = p[_];
          Ir(r, x.obsSet)
            ? x.subscribers.forEach(function (w) {
                return o.add(w);
              })
            : u && g.push(x);
        }
        u && s.push([v, g]);
      }
      if (u)
        for (var y = 0, b = s; y < b.length; y++) {
          var k = b[y],
            v = k[0],
            g = k[1];
          t.queries.query[v] = g;
        }
    }
    function iu(t) {
      var r = t._state,
        o = t._deps.indexedDB;
      if (r.isBeingOpened || t.idbdb)
        return r.dbReadyPromise.then(function () {
          return r.dbOpenError ? me(r.dbOpenError) : t;
        });
      ((r.isBeingOpened = !0), (r.dbOpenError = null), (r.openComplete = !1));
      var u = r.openCanceller,
        s = Math.round(10 * t.verno),
        c = !1;
      function f() {
        if (r.openCanceller !== u) throw new q.DatabaseClosed('db.open() was cancelled');
      }
      function h() {
        return new N(function (x, y) {
          if ((f(), !o)) throw new q.MissingAPI();
          var b = t.name,
            k = r.autoSchema || !s ? o.open(b) : o.open(b, s);
          if (!k) throw new q.MissingAPI();
          ((k.onerror = qe(y)),
            (k.onblocked = ie(t._fireOnBlocked)),
            (k.onupgradeneeded = ie(function (w) {
              var z;
              ((_ = k.transaction),
                r.autoSchema && !t._options.allowEmptyDB
                  ? ((k.onerror = on),
                    _.abort(),
                    k.result.close(),
                    ((z = o.deleteDatabase(b)).onsuccess = z.onerror =
                      ie(function () {
                        y(new q.NoSuchDatabase('Database '.concat(b, ' doesnt exist')));
                      })))
                  : ((_.onerror = qe(y)),
                    (w = w.oldVersion > Math.pow(2, 62) ? 0 : w.oldVersion),
                    (p = w < 1),
                    (t.idbdb = k.result),
                    c && ru(t, _),
                    nu(t, w / 10, _, y)));
            }, y)),
            (k.onsuccess = ie(function () {
              _ = null;
              var w,
                z,
                O,
                P,
                S,
                Z = (t.idbdb = k.result),
                j = Oe(Z.objectStoreNames);
              if (0 < j.length)
                try {
                  var T = Z.transaction((P = j).length === 1 ? P[0] : P, 'readonly');
                  if (r.autoSchema)
                    ((z = Z),
                      (O = T),
                      ((w = t).verno = z.version / 10),
                      (O = w._dbSchema = $n(0, z, O)),
                      (w._storeNames = Oe(z.objectStoreNames, 0)),
                      Zn(w, [w._allTables], d(O), O));
                  else if (
                    (jn(t, t._dbSchema, T),
                    ((S = xr($n(0, (S = t).idbdb, T), S._dbSchema)).add.length ||
                      S.change.some(function ($) {
                        return $.add.length || $.change.length;
                      })) &&
                      !c)
                  )
                    return (
                      console.warn(
                        'Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this.',
                      ),
                      Z.close(),
                      (s = Z.version + 1),
                      (c = !0),
                      x(h())
                    );
                  An(t, T);
                } catch {}
              ($t.push(t),
                (Z.onversionchange = ie(function ($) {
                  ((r.vcFired = !0), t.on('versionchange').fire($));
                })),
                (Z.onclose = ie(function ($) {
                  t.on('close').fire($);
                })),
                p &&
                  ((S = t._deps),
                  (T = b),
                  (Z = S.indexedDB),
                  (S = S.IDBKeyRange),
                  Or(Z) || T === zn || Er(Z, S).put({ name: T }).catch(te)),
                x());
            }, y)));
        }).catch(function (x) {
          switch (x?.name) {
            case 'UnknownError':
              if (0 < r.PR1398_maxLoop)
                return (
                  r.PR1398_maxLoop--,
                  console.warn('Dexie: Workaround for Chrome UnknownError on open()'),
                  h()
                );
              break;
            case 'VersionError':
              if (0 < s) return ((s = 0), h());
          }
          return N.reject(x);
        });
      }
      var v,
        g = r.dbReadyResolve,
        _ = null,
        p = !1;
      return N.race([
        u,
        (typeof navigator > 'u'
          ? N.resolve()
          : !navigator.userAgentData &&
              /Safari\//.test(navigator.userAgent) &&
              !/Chrom(e|ium)\//.test(navigator.userAgent) &&
              indexedDB.databases
            ? new Promise(function (x) {
                function y() {
                  return indexedDB.databases().finally(x);
                }
                ((v = setInterval(y, 100)), y());
              }).finally(function () {
                return clearInterval(v);
              })
            : Promise.resolve()
        ).then(h),
      ])
        .then(function () {
          return (
            f(),
            (r.onReadyBeingFired = []),
            N.resolve(
              Pr(function () {
                return t.on.ready.fire(t.vip);
              }),
            ).then(function x() {
              if (0 < r.onReadyBeingFired.length) {
                var y = r.onReadyBeingFired.reduce(ir, te);
                return (
                  (r.onReadyBeingFired = []),
                  N.resolve(
                    Pr(function () {
                      return y(t.vip);
                    }),
                  ).then(x)
                );
              }
            })
          );
        })
        .finally(function () {
          r.openCanceller === u && ((r.onReadyBeingFired = null), (r.isBeingOpened = !1));
        })
        .catch(function (x) {
          r.dbOpenError = x;
          try {
            _ && _.abort();
          } catch {}
          return (u === r.openCanceller && t._close(), me(x));
        })
        .finally(function () {
          ((r.openComplete = !0), g());
        })
        .then(function () {
          var x;
          return (
            p &&
              ((x = {}),
              t.tables.forEach(function (y) {
                (y.schema.indexes.forEach(function (b) {
                  b.name &&
                    (x['idb://'.concat(t.name, '/').concat(y.name, '/').concat(b.name)] = new ke(
                      -1 / 0,
                      [[[]]],
                    ));
                }),
                  (x['idb://'.concat(t.name, '/').concat(y.name, '/')] = x[
                    'idb://'.concat(t.name, '/').concat(y.name, '/:dels')
                  ] =
                    new ke(-1 / 0, [[[]]])));
              }),
              at(un).fire(x),
              Tr(x, !0)),
            t
          );
        });
    }
    function $r(t) {
      function r(c) {
        return t.next(c);
      }
      var o = s(r),
        u = s(function (c) {
          return t.throw(c);
        });
      function s(c) {
        return function (v) {
          var h = c(v),
            v = h.value;
          return h.done
            ? v
            : v && typeof v.then == 'function'
              ? v.then(o, u)
              : E(v)
                ? Promise.all(v).then(o, u)
                : o(v);
        };
      }
      return s(r)();
    }
    function Nn(t, r, o) {
      for (var u = E(t) ? t.slice() : [t], s = 0; s < o; ++s) u.push(r);
      return u;
    }
    var uu = {
      stack: 'dbcore',
      name: 'VirtualIndexMiddleware',
      level: 1,
      create: function (t) {
        return a(a({}, t), {
          table: function (r) {
            var o = t.table(r),
              u = o.schema,
              s = {},
              c = [];
            function f(p, x, y) {
              var b = sn(p),
                k = (s[b] = s[b] || []),
                w = p == null ? 0 : typeof p == 'string' ? 1 : p.length,
                z = 0 < x,
                z = a(a({}, y), {
                  name: z ? ''.concat(b, '(virtual-from:').concat(y.name, ')') : y.name,
                  lowLevelIndex: y,
                  isVirtual: z,
                  keyTail: x,
                  keyLength: w,
                  extractKey: wr(p),
                  unique: !z && y.unique,
                });
              return (
                k.push(z),
                z.isPrimaryKey || c.push(z),
                1 < w && f(w === 2 ? p[0] : p.slice(0, w - 1), x + 1, y),
                k.sort(function (O, P) {
                  return O.keyTail - P.keyTail;
                }),
                z
              );
            }
            ((r = f(u.primaryKey.keyPath, 0, u.primaryKey)), (s[':id'] = [r]));
            for (var h = 0, v = u.indexes; h < v.length; h++) {
              var g = v[h];
              f(g.keyPath, 0, g);
            }
            function _(p) {
              var x,
                y = p.query.index;
              return y.isVirtual
                ? a(a({}, p), {
                    query: {
                      index: y.lowLevelIndex,
                      range:
                        ((x = p.query.range),
                        (y = y.keyTail),
                        {
                          type: x.type === 1 ? 2 : x.type,
                          lower: Nn(x.lower, x.lowerOpen ? t.MAX_KEY : t.MIN_KEY, y),
                          lowerOpen: !0,
                          upper: Nn(x.upper, x.upperOpen ? t.MIN_KEY : t.MAX_KEY, y),
                          upperOpen: !0,
                        }),
                    },
                  })
                : p;
            }
            return a(a({}, o), {
              schema: a(a({}, u), {
                primaryKey: r,
                indexes: c,
                getIndexByKeyPath: function (p) {
                  return (p = s[sn(p)]) && p[0];
                },
              }),
              count: function (p) {
                return o.count(_(p));
              },
              query: function (p) {
                return o.query(_(p));
              },
              openCursor: function (p) {
                var x = p.query.index,
                  y = x.keyTail,
                  b = x.isVirtual,
                  k = x.keyLength;
                return b
                  ? o.openCursor(_(p)).then(function (z) {
                      return z && w(z);
                    })
                  : o.openCursor(p);
                function w(z) {
                  return Object.create(z, {
                    continue: {
                      value: function (O) {
                        O != null
                          ? z.continue(Nn(O, p.reverse ? t.MAX_KEY : t.MIN_KEY, y))
                          : p.unique
                            ? z.continue(
                                z.key.slice(0, k).concat(p.reverse ? t.MIN_KEY : t.MAX_KEY, y),
                              )
                            : z.continue();
                      },
                    },
                    continuePrimaryKey: {
                      value: function (O, P) {
                        z.continuePrimaryKey(Nn(O, t.MAX_KEY, y), P);
                      },
                    },
                    primaryKey: {
                      get: function () {
                        return z.primaryKey;
                      },
                    },
                    key: {
                      get: function () {
                        var O = z.key;
                        return k === 1 ? O[0] : O.slice(0, k);
                      },
                    },
                    value: {
                      get: function () {
                        return z.value;
                      },
                    },
                  });
                }
              },
            });
          },
        });
      },
    };
    function jr(t, r, o, u) {
      return (
        (o = o || {}),
        (u = u || ''),
        d(t).forEach(function (s) {
          var c, f, h;
          U(r, s)
            ? ((c = t[s]),
              (f = r[s]),
              typeof c == 'object' && typeof f == 'object' && c && f
                ? (h = Ye(c)) !== Ye(f)
                  ? (o[u + s] = r[s])
                  : h === 'Object'
                    ? jr(c, f, o, u + s + '.')
                    : c !== f && (o[u + s] = r[s])
                : c !== f && (o[u + s] = r[s]))
            : (o[u + s] = void 0);
        }),
        d(r).forEach(function (s) {
          U(t, s) || (o[u + s] = r[s]);
        }),
        o
      );
    }
    function Cr(t, r) {
      return r.type === 'delete' ? r.keys : r.keys || r.values.map(t.extractKey);
    }
    var au = {
      stack: 'dbcore',
      name: 'HooksMiddleware',
      level: 2,
      create: function (t) {
        return a(a({}, t), {
          table: function (r) {
            var o = t.table(r),
              u = o.schema.primaryKey;
            return a(a({}, o), {
              mutate: function (s) {
                var c = B.trans,
                  f = c.table(r).hook,
                  h = f.deleting,
                  v = f.creating,
                  g = f.updating;
                switch (s.type) {
                  case 'add':
                    if (v.fire === te) break;
                    return c._promise(
                      'readwrite',
                      function () {
                        return _(s);
                      },
                      !0,
                    );
                  case 'put':
                    if (v.fire === te && g.fire === te) break;
                    return c._promise(
                      'readwrite',
                      function () {
                        return _(s);
                      },
                      !0,
                    );
                  case 'delete':
                    if (h.fire === te) break;
                    return c._promise(
                      'readwrite',
                      function () {
                        return _(s);
                      },
                      !0,
                    );
                  case 'deleteRange':
                    if (h.fire === te) break;
                    return c._promise(
                      'readwrite',
                      function () {
                        return (function p(x, y, b) {
                          return o
                            .query({
                              trans: x,
                              values: !1,
                              query: { index: u, range: y },
                              limit: b,
                            })
                            .then(function (k) {
                              var w = k.result;
                              return _({ type: 'delete', keys: w, trans: x }).then(function (z) {
                                return 0 < z.numFailures
                                  ? Promise.reject(z.failures[0])
                                  : w.length < b
                                    ? { failures: [], numFailures: 0, lastResult: void 0 }
                                    : p(
                                        x,
                                        a(a({}, y), { lower: w[w.length - 1], lowerOpen: !0 }),
                                        b,
                                      );
                              });
                            });
                        })(s.trans, s.range, 1e4);
                      },
                      !0,
                    );
                }
                return o.mutate(s);
                function _(p) {
                  var x,
                    y,
                    b,
                    k = B.trans,
                    w = p.keys || Cr(u, p);
                  if (!w) throw new Error('Keys missing');
                  return (
                    (p = p.type === 'add' || p.type === 'put' ? a(a({}, p), { keys: w }) : a({}, p))
                      .type !== 'delete' && (p.values = l([], p.values)),
                    p.keys && (p.keys = l([], p.keys)),
                    (x = o),
                    (b = w),
                    ((y = p).type === 'add'
                      ? Promise.resolve([])
                      : x.getMany({ trans: y.trans, keys: b, cache: 'immutable' })
                    ).then(function (z) {
                      var O = w.map(function (P, S) {
                        var Z,
                          j,
                          T,
                          $ = z[S],
                          R = { onerror: null, onsuccess: null };
                        return (
                          p.type === 'delete'
                            ? h.fire.call(R, P, $, k)
                            : p.type === 'add' || $ === void 0
                              ? ((Z = v.fire.call(R, P, p.values[S], k)),
                                P == null &&
                                  Z != null &&
                                  ((p.keys[S] = P = Z),
                                  u.outbound || we(p.values[S], u.keyPath, P)))
                              : ((Z = jr($, p.values[S])),
                                (j = g.fire.call(R, Z, P, $, k)) &&
                                  ((T = p.values[S]),
                                  Object.keys(j).forEach(function (D) {
                                    U(T, D) ? (T[D] = j[D]) : we(T, D, j[D]);
                                  }))),
                          R
                        );
                      });
                      return o
                        .mutate(p)
                        .then(function (P) {
                          for (
                            var S = P.failures,
                              Z = P.results,
                              j = P.numFailures,
                              P = P.lastResult,
                              T = 0;
                            T < w.length;
                            ++T
                          ) {
                            var $ = (Z || w)[T],
                              R = O[T];
                            $ == null
                              ? R.onerror && R.onerror(S[T])
                              : R.onsuccess &&
                                R.onsuccess(p.type === 'put' && z[T] ? p.values[T] : $);
                          }
                          return { failures: S, results: Z, numFailures: j, lastResult: P };
                        })
                        .catch(function (P) {
                          return (
                            O.forEach(function (S) {
                              return S.onerror && S.onerror(P);
                            }),
                            Promise.reject(P)
                          );
                        });
                    })
                  );
                }
              },
            });
          },
        });
      },
    };
    function Zo(t, r, o) {
      try {
        if (!r || r.keys.length < t.length) return null;
        for (var u = [], s = 0, c = 0; s < r.keys.length && c < t.length; ++s)
          X(r.keys[s], t[c]) === 0 && (u.push(o ? $e(r.values[s]) : r.values[s]), ++c);
        return u.length === t.length ? u : null;
      } catch {
        return null;
      }
    }
    var su = {
      stack: 'dbcore',
      level: -1,
      create: function (t) {
        return {
          table: function (r) {
            var o = t.table(r);
            return a(a({}, o), {
              getMany: function (u) {
                if (!u.cache) return o.getMany(u);
                var s = Zo(u.keys, u.trans._cache, u.cache === 'clone');
                return s
                  ? N.resolve(s)
                  : o.getMany(u).then(function (c) {
                      return (
                        (u.trans._cache = {
                          keys: u.keys,
                          values: u.cache === 'clone' ? $e(c) : c,
                        }),
                        c
                      );
                    });
              },
              mutate: function (u) {
                return (u.type !== 'add' && (u.trans._cache = null), o.mutate(u));
              },
            });
          },
        };
      },
    };
    function To(t, r) {
      return (
        t.trans.mode === 'readonly' &&
        !!t.subscr &&
        !t.trans.explicit &&
        t.trans.db._options.cache !== 'disabled' &&
        !r.schema.primaryKey.outbound
      );
    }
    function $o(t, r) {
      switch (t) {
        case 'query':
          return r.values && !r.unique;
        case 'get':
        case 'getMany':
        case 'count':
        case 'openCursor':
          return !1;
      }
    }
    var cu = {
      stack: 'dbcore',
      level: 0,
      name: 'Observability',
      create: function (t) {
        var r = t.schema.name,
          o = new ke(t.MIN_KEY, t.MAX_KEY);
        return a(a({}, t), {
          transaction: function (u, s, c) {
            if (B.subscr && s !== 'readonly')
              throw new q.ReadOnly(
                'Readwrite transaction in liveQuery context. Querier source: '.concat(B.querier),
              );
            return t.transaction(u, s, c);
          },
          table: function (u) {
            var s = t.table(u),
              c = s.schema,
              f = c.primaryKey,
              p = c.indexes,
              h = f.extractKey,
              v = f.outbound,
              g =
                f.autoIncrement &&
                p.filter(function (y) {
                  return y.compound && y.keyPath.includes(f.keyPath);
                }),
              _ = a(a({}, s), {
                mutate: function (y) {
                  function b(D) {
                    return (
                      (D = 'idb://'.concat(r, '/').concat(u, '/').concat(D)),
                      P[D] || (P[D] = new ke())
                    );
                  }
                  var k,
                    w,
                    z,
                    O = y.trans,
                    P = y.mutatedParts || (y.mutatedParts = {}),
                    S = b(''),
                    Z = b(':dels'),
                    j = y.type,
                    R =
                      y.type === 'deleteRange'
                        ? [y.range]
                        : y.type === 'delete'
                          ? [y.keys]
                          : y.values.length < 50
                            ? [
                                Cr(f, y).filter(function (D) {
                                  return D;
                                }),
                                y.values,
                              ]
                            : [],
                    T = R[0],
                    $ = R[1],
                    R = y.trans._cache;
                  return (
                    E(T)
                      ? (S.addKeys(T),
                        (R = j === 'delete' || T.length === $.length ? Zo(T, R) : null) ||
                          Z.addKeys(T),
                        (R || $) &&
                          ((k = b),
                          (w = R),
                          (z = $),
                          c.indexes.forEach(function (D) {
                            var K = k(D.name || '');
                            function G(V) {
                              return V != null ? D.extractKey(V) : null;
                            }
                            function Q(V) {
                              return D.multiEntry && E(V)
                                ? V.forEach(function (he) {
                                    return K.addKey(he);
                                  })
                                : K.addKey(V);
                            }
                            (w || z).forEach(function (V, xe) {
                              var L = w && G(w[xe]),
                                xe = z && G(z[xe]);
                              X(L, xe) !== 0 && (L != null && Q(L), xe != null && Q(xe));
                            });
                          })))
                      : T
                        ? (($ = {
                            from: ($ = T.lower) !== null && $ !== void 0 ? $ : t.MIN_KEY,
                            to: ($ = T.upper) !== null && $ !== void 0 ? $ : t.MAX_KEY,
                          }),
                          Z.add($),
                          S.add($))
                        : (S.add(o),
                          Z.add(o),
                          c.indexes.forEach(function (D) {
                            return b(D.name).add(o);
                          })),
                    s.mutate(y).then(function (D) {
                      return (
                        !T ||
                          (y.type !== 'add' && y.type !== 'put') ||
                          (S.addKeys(D.results),
                          g &&
                            g.forEach(function (K) {
                              for (
                                var G = y.values.map(function (L) {
                                    return K.extractKey(L);
                                  }),
                                  Q = K.keyPath.findIndex(function (L) {
                                    return L === f.keyPath;
                                  }),
                                  V = 0,
                                  he = D.results.length;
                                V < he;
                                ++V
                              )
                                G[V][Q] = D.results[V];
                              b(K.name).addKeys(G);
                            })),
                        (O.mutatedParts = Dn(O.mutatedParts || {}, P)),
                        D
                      );
                    })
                  );
                },
              }),
              p = function (b) {
                var k = b.query,
                  b = k.index,
                  k = k.range;
                return [
                  b,
                  new ke(
                    (b = k.lower) !== null && b !== void 0 ? b : t.MIN_KEY,
                    (k = k.upper) !== null && k !== void 0 ? k : t.MAX_KEY,
                  ),
                ];
              },
              x = {
                get: function (y) {
                  return [f, new ke(y.key)];
                },
                getMany: function (y) {
                  return [f, new ke().addKeys(y.keys)];
                },
                count: p,
                query: p,
                openCursor: p,
              };
            return (
              d(x).forEach(function (y) {
                _[y] = function (b) {
                  var k = B.subscr,
                    w = !!k,
                    z = To(B, s) && $o(y, b) ? (b.obsSet = {}) : k;
                  if (w) {
                    var O = function ($) {
                        return (
                          ($ = 'idb://'.concat(r, '/').concat(u, '/').concat($)),
                          z[$] || (z[$] = new ke())
                        );
                      },
                      P = O(''),
                      S = O(':dels'),
                      k = x[y](b),
                      w = k[0],
                      k = k[1];
                    if (
                      ((y === 'query' && w.isPrimaryKey && !b.values ? S : O(w.name || '')).add(k),
                      !w.isPrimaryKey)
                    ) {
                      if (y !== 'count') {
                        var Z =
                          y === 'query' && v && b.values && s.query(a(a({}, b), { values: !1 }));
                        return s[y].apply(this, arguments).then(function ($) {
                          if (y === 'query') {
                            if (v && b.values)
                              return Z.then(function (G) {
                                return ((G = G.result), P.addKeys(G), $);
                              });
                            var R = b.values ? $.result.map(h) : $.result;
                            (b.values ? P : S).addKeys(R);
                          } else if (y === 'openCursor') {
                            var D = $,
                              K = b.values;
                            return (
                              D &&
                              Object.create(D, {
                                key: {
                                  get: function () {
                                    return (S.addKey(D.primaryKey), D.key);
                                  },
                                },
                                primaryKey: {
                                  get: function () {
                                    var G = D.primaryKey;
                                    return (S.addKey(G), G);
                                  },
                                },
                                value: {
                                  get: function () {
                                    return (K && P.addKey(D.primaryKey), D.value);
                                  },
                                },
                              })
                            );
                          }
                          return $;
                        });
                      }
                      S.add(o);
                    }
                  }
                  return s[y].apply(this, arguments);
                };
              }),
              _
            );
          },
        });
      },
    };
    function jo(t, r, o) {
      if (o.numFailures === 0) return r;
      if (r.type === 'deleteRange') return null;
      var u = r.keys ? r.keys.length : 'values' in r && r.values ? r.values.length : 1;
      return o.numFailures === u
        ? null
        : ((r = a({}, r)),
          E(r.keys) &&
            (r.keys = r.keys.filter(function (s, c) {
              return !(c in o.failures);
            })),
          'values' in r &&
            E(r.values) &&
            (r.values = r.values.filter(function (s, c) {
              return !(c in o.failures);
            })),
          r);
    }
    function Dr(t, r) {
      return (
        (o = t),
        ((u = r).lower === void 0 || (u.lowerOpen ? 0 < X(o, u.lower) : 0 <= X(o, u.lower))) &&
          ((t = t),
          (r = r).upper === void 0 || (r.upperOpen ? X(t, r.upper) < 0 : X(t, r.upper) <= 0))
      );
      var o, u;
    }
    function Co(t, r, x, u, s, c) {
      if (!x || x.length === 0) return t;
      var f = r.query.index,
        h = f.multiEntry,
        v = r.query.range,
        g = u.schema.primaryKey.extractKey,
        _ = f.extractKey,
        p = (f.lowLevelIndex || f).extractKey,
        x = x.reduce(function (y, b) {
          var k = y,
            w = [];
          if (b.type === 'add' || b.type === 'put')
            for (var z = new ke(), O = b.values.length - 1; 0 <= O; --O) {
              var P,
                S = b.values[O],
                Z = g(S);
              z.hasKey(Z) ||
                ((P = _(S)),
                (h && E(P)
                  ? P.some(function (D) {
                      return Dr(D, v);
                    })
                  : Dr(P, v)) && (z.addKey(Z), w.push(S)));
            }
          switch (b.type) {
            case 'add':
              var j = new ke().addKeys(
                  r.values
                    ? y.map(function (K) {
                        return g(K);
                      })
                    : y,
                ),
                k = y.concat(
                  r.values
                    ? w.filter(function (K) {
                        return ((K = g(K)), !j.hasKey(K) && (j.addKey(K), !0));
                      })
                    : w
                        .map(function (K) {
                          return g(K);
                        })
                        .filter(function (K) {
                          return !j.hasKey(K) && (j.addKey(K), !0);
                        }),
                );
              break;
            case 'put':
              var T = new ke().addKeys(
                b.values.map(function (K) {
                  return g(K);
                }),
              );
              k = y
                .filter(function (K) {
                  return !T.hasKey(r.values ? g(K) : K);
                })
                .concat(
                  r.values
                    ? w
                    : w.map(function (K) {
                        return g(K);
                      }),
                );
              break;
            case 'delete':
              var $ = new ke().addKeys(b.keys);
              k = y.filter(function (K) {
                return !$.hasKey(r.values ? g(K) : K);
              });
              break;
            case 'deleteRange':
              var R = b.range;
              k = y.filter(function (K) {
                return !Dr(g(K), R);
              });
          }
          return k;
        }, t);
      return x === t
        ? t
        : (x.sort(function (y, b) {
            return X(p(y), p(b)) || X(g(y), g(b));
          }),
          r.limit &&
            r.limit < 1 / 0 &&
            (x.length > r.limit
              ? (x.length = r.limit)
              : t.length === r.limit && x.length < r.limit && (s.dirty = !0)),
          c ? Object.freeze(x) : x);
    }
    function Do(t, r) {
      return (
        X(t.lower, r.lower) === 0 &&
        X(t.upper, r.upper) === 0 &&
        !!t.lowerOpen == !!r.lowerOpen &&
        !!t.upperOpen == !!r.upperOpen
      );
    }
    function lu(t, r) {
      return (
        (function (o, u, s, c) {
          if (o === void 0) return u !== void 0 ? -1 : 0;
          if (u === void 0) return 1;
          if ((u = X(o, u)) === 0) {
            if (s && c) return 0;
            if (s) return 1;
            if (c) return -1;
          }
          return u;
        })(t.lower, r.lower, t.lowerOpen, r.lowerOpen) <= 0 &&
        0 <=
          (function (o, u, s, c) {
            if (o === void 0) return u !== void 0 ? 1 : 0;
            if (u === void 0) return -1;
            if ((u = X(o, u)) === 0) {
              if (s && c) return 0;
              if (s) return -1;
              if (c) return 1;
            }
            return u;
          })(t.upper, r.upper, t.upperOpen, r.upperOpen)
      );
    }
    function fu(t, r, o, u) {
      (t.subscribers.add(o),
        u.addEventListener('abort', function () {
          var s, c;
          (t.subscribers.delete(o),
            t.subscribers.size === 0 &&
              ((s = t),
              (c = r),
              setTimeout(function () {
                s.subscribers.size === 0 && Ke(c, s);
              }, 3e3)));
        }));
    }
    var hu = {
      stack: 'dbcore',
      level: 0,
      name: 'Cache',
      create: function (t) {
        var r = t.schema.name;
        return a(a({}, t), {
          transaction: function (o, u, s) {
            var c,
              f,
              h = t.transaction(o, u, s);
            return (
              u === 'readwrite' &&
                ((f = (c = new AbortController()).signal),
                (s = function (v) {
                  return function () {
                    if ((c.abort(), u === 'readwrite')) {
                      for (var g = new Set(), _ = 0, p = o; _ < p.length; _++) {
                        var x = p[_],
                          y = Et['idb://'.concat(r, '/').concat(x)];
                        if (y) {
                          var b = t.table(x),
                            k = y.optimisticOps.filter(function (K) {
                              return K.trans === h;
                            });
                          if (h._explicit && v && h.mutatedParts)
                            for (var w = 0, z = Object.values(y.queries.query); w < z.length; w++)
                              for (var O = 0, P = (j = z[w]).slice(); O < P.length; O++)
                                Ir((T = P[O]).obsSet, h.mutatedParts) &&
                                  (Ke(j, T),
                                  T.subscribers.forEach(function (K) {
                                    return g.add(K);
                                  }));
                          else if (0 < k.length) {
                            y.optimisticOps = y.optimisticOps.filter(function (K) {
                              return K.trans !== h;
                            });
                            for (var S = 0, Z = Object.values(y.queries.query); S < Z.length; S++)
                              for (var j, T, $, R = 0, D = (j = Z[S]).slice(); R < D.length; R++)
                                (T = D[R]).res != null &&
                                  h.mutatedParts &&
                                  (v && !T.dirty
                                    ? (($ = Object.isFrozen(T.res)),
                                      ($ = Co(T.res, T.req, k, b, T, $)),
                                      T.dirty
                                        ? (Ke(j, T),
                                          T.subscribers.forEach(function (K) {
                                            return g.add(K);
                                          }))
                                        : $ !== T.res &&
                                          ((T.res = $), (T.promise = N.resolve({ result: $ }))))
                                    : (T.dirty && Ke(j, T),
                                      T.subscribers.forEach(function (K) {
                                        return g.add(K);
                                      })));
                          }
                        }
                      }
                      g.forEach(function (K) {
                        return K();
                      });
                    }
                  };
                }),
                h.addEventListener('abort', s(!1), { signal: f }),
                h.addEventListener('error', s(!1), { signal: f }),
                h.addEventListener('complete', s(!0), { signal: f })),
              h
            );
          },
          table: function (o) {
            var u = t.table(o),
              s = u.schema.primaryKey;
            return a(a({}, u), {
              mutate: function (c) {
                var f = B.trans;
                if (
                  s.outbound ||
                  f.db._options.cache === 'disabled' ||
                  f.explicit ||
                  f.idbtrans.mode !== 'readwrite'
                )
                  return u.mutate(c);
                var h = Et['idb://'.concat(r, '/').concat(o)];
                return h
                  ? ((f = u.mutate(c)),
                    (c.type !== 'add' && c.type !== 'put') ||
                    !(
                      50 <= c.values.length ||
                      Cr(s, c).some(function (v) {
                        return v == null;
                      })
                    )
                      ? (h.optimisticOps.push(c),
                        c.mutatedParts && Rn(c.mutatedParts),
                        f.then(function (v) {
                          0 < v.numFailures &&
                            (Ke(h.optimisticOps, c),
                            (v = jo(0, c, v)) && h.optimisticOps.push(v),
                            c.mutatedParts && Rn(c.mutatedParts));
                        }),
                        f.catch(function () {
                          (Ke(h.optimisticOps, c), c.mutatedParts && Rn(c.mutatedParts));
                        }))
                      : f.then(function (v) {
                          var g = jo(
                            0,
                            a(a({}, c), {
                              values: c.values.map(function (_, p) {
                                var x;
                                return v.failures[p]
                                  ? _
                                  : ((_ =
                                      (x = s.keyPath) !== null && x !== void 0 && x.includes('.')
                                        ? $e(_)
                                        : a({}, _)),
                                    we(_, s.keyPath, v.results[p]),
                                    _);
                              }),
                            }),
                            v,
                          );
                          (h.optimisticOps.push(g),
                            queueMicrotask(function () {
                              return c.mutatedParts && Rn(c.mutatedParts);
                            }));
                        }),
                    f)
                  : u.mutate(c);
              },
              query: function (c) {
                if (!To(B, u) || !$o('query', c)) return u.query(c);
                var f =
                    ((g = B.trans) === null || g === void 0 ? void 0 : g.db._options.cache) ===
                    'immutable',
                  p = B,
                  h = p.requery,
                  v = p.signal,
                  g = (function (b, k, w, z) {
                    var O = Et['idb://'.concat(b, '/').concat(k)];
                    if (!O) return [];
                    if (!(k = O.queries[w])) return [null, !1, O, null];
                    var P = k[(z.query ? z.query.index.name : null) || ''];
                    if (!P) return [null, !1, O, null];
                    switch (w) {
                      case 'query':
                        var S = P.find(function (Z) {
                          return (
                            Z.req.limit === z.limit &&
                            Z.req.values === z.values &&
                            Do(Z.req.query.range, z.query.range)
                          );
                        });
                        return S
                          ? [S, !0, O, P]
                          : [
                              P.find(function (Z) {
                                return (
                                  ('limit' in Z.req ? Z.req.limit : 1 / 0) >= z.limit &&
                                  (!z.values || Z.req.values) &&
                                  lu(Z.req.query.range, z.query.range)
                                );
                              }),
                              !1,
                              O,
                              P,
                            ];
                      case 'count':
                        return (
                          (S = P.find(function (Z) {
                            return Do(Z.req.query.range, z.query.range);
                          })),
                          [S, !!S, O, P]
                        );
                    }
                  })(r, o, 'query', c),
                  _ = g[0],
                  p = g[1],
                  x = g[2],
                  y = g[3];
                return (
                  _ && p
                    ? (_.obsSet = c.obsSet)
                    : ((p = u
                        .query(c)
                        .then(function (b) {
                          var k = b.result;
                          if ((_ && (_.res = k), f)) {
                            for (var w = 0, z = k.length; w < z; ++w) Object.freeze(k[w]);
                            Object.freeze(k);
                          } else b.result = $e(k);
                          return b;
                        })
                        .catch(function (b) {
                          return (y && _ && Ke(y, _), Promise.reject(b));
                        })),
                      (_ = {
                        obsSet: c.obsSet,
                        promise: p,
                        subscribers: new Set(),
                        type: 'query',
                        req: c,
                        dirty: !1,
                      }),
                      y
                        ? y.push(_)
                        : ((y = [_]),
                          ((x =
                            x ||
                            (Et['idb://'.concat(r, '/').concat(o)] = {
                              queries: { query: {}, count: {} },
                              objs: new Map(),
                              optimisticOps: [],
                              unsignaledParts: {},
                            })).queries.query[c.query.index.name || ''] = y))),
                  fu(_, y, h, v),
                  _.promise.then(function (b) {
                    return { result: Co(b.result, c, x?.optimisticOps, u, _, f) };
                  })
                );
              },
            });
          },
        });
      },
    };
    function Kn(t, r) {
      return new Proxy(t, {
        get: function (o, u, s) {
          return u === 'db' ? r : Reflect.get(o, u, s);
        },
      });
    }
    var Qe =
      ((ve.prototype.version = function (t) {
        if (isNaN(t) || t < 0.1) throw new q.Type('Given version is not a positive number');
        if (((t = Math.round(10 * t) / 10), this.idbdb || this._state.isBeingOpened))
          throw new q.Schema('Cannot add version when database is open');
        this.verno = Math.max(this.verno, t);
        var r = this._versions,
          o = r.filter(function (u) {
            return u._cfg.version === t;
          })[0];
        return (
          o ||
          ((o = new this.Version(t)),
          r.push(o),
          r.sort(tu),
          o.stores({}),
          (this._state.autoSchema = !1),
          o)
        );
      }),
      (ve.prototype._whenReady = function (t) {
        var r = this;
        return this.idbdb && (this._state.openComplete || B.letThrough || this._vip)
          ? t()
          : new N(function (o, u) {
              if (r._state.openComplete) return u(new q.DatabaseClosed(r._state.dbOpenError));
              if (!r._state.isBeingOpened) {
                if (!r._state.autoOpen) return void u(new q.DatabaseClosed());
                r.open().catch(te);
              }
              r._state.dbReadyPromise.then(o, u);
            }).then(t);
      }),
      (ve.prototype.use = function (t) {
        var r = t.stack,
          o = t.create,
          u = t.level,
          s = t.name;
        return (
          s && this.unuse({ stack: r, name: s }),
          (t = this._middlewares[r] || (this._middlewares[r] = [])),
          t.push({ stack: r, create: o, level: u ?? 10, name: s }),
          t.sort(function (c, f) {
            return c.level - f.level;
          }),
          this
        );
      }),
      (ve.prototype.unuse = function (t) {
        var r = t.stack,
          o = t.name,
          u = t.create;
        return (
          r &&
            this._middlewares[r] &&
            (this._middlewares[r] = this._middlewares[r].filter(function (s) {
              return u ? s.create !== u : !!o && s.name !== o;
            })),
          this
        );
      }),
      (ve.prototype.open = function () {
        var t = this;
        return kt(nt, function () {
          return iu(t);
        });
      }),
      (ve.prototype._close = function () {
        this.on.close.fire(new CustomEvent('close'));
        var t = this._state,
          r = $t.indexOf(this);
        if ((0 <= r && $t.splice(r, 1), this.idbdb)) {
          try {
            this.idbdb.close();
          } catch {}
          this.idbdb = null;
        }
        t.isBeingOpened ||
          ((t.dbReadyPromise = new N(function (o) {
            t.dbReadyResolve = o;
          })),
          (t.openCanceller = new N(function (o, u) {
            t.cancelOpen = u;
          })));
      }),
      (ve.prototype.close = function (o) {
        var r = (o === void 0 ? { disableAutoOpen: !0 } : o).disableAutoOpen,
          o = this._state;
        r
          ? (o.isBeingOpened && o.cancelOpen(new q.DatabaseClosed()),
            this._close(),
            (o.autoOpen = !1),
            (o.dbOpenError = new q.DatabaseClosed()))
          : (this._close(),
            (o.autoOpen = this._options.autoOpen || o.isBeingOpened),
            (o.openComplete = !1),
            (o.dbOpenError = null));
      }),
      (ve.prototype.delete = function (t) {
        var r = this;
        t === void 0 && (t = { disableAutoOpen: !0 });
        var o = 0 < arguments.length && typeof arguments[0] != 'object',
          u = this._state;
        return new N(function (s, c) {
          function f() {
            r.close(t);
            var h = r._deps.indexedDB.deleteDatabase(r.name);
            ((h.onsuccess = ie(function () {
              var v, g, _;
              ((v = r._deps),
                (g = r.name),
                (_ = v.indexedDB),
                (v = v.IDBKeyRange),
                Or(_) || g === zn || Er(_, v).delete(g).catch(te),
                s());
            })),
              (h.onerror = qe(c)),
              (h.onblocked = r._fireOnBlocked));
          }
          if (o) throw new q.InvalidArgument('Invalid closeOptions argument to db.delete()');
          u.isBeingOpened ? u.dbReadyPromise.then(f) : f();
        });
      }),
      (ve.prototype.backendDB = function () {
        return this.idbdb;
      }),
      (ve.prototype.isOpen = function () {
        return this.idbdb !== null;
      }),
      (ve.prototype.hasBeenClosed = function () {
        var t = this._state.dbOpenError;
        return t && t.name === 'DatabaseClosed';
      }),
      (ve.prototype.hasFailed = function () {
        return this._state.dbOpenError !== null;
      }),
      (ve.prototype.dynamicallyOpened = function () {
        return this._state.autoSchema;
      }),
      Object.defineProperty(ve.prototype, 'tables', {
        get: function () {
          var t = this;
          return d(this._allTables).map(function (r) {
            return t._allTables[r];
          });
        },
        enumerable: !1,
        configurable: !0,
      }),
      (ve.prototype.transaction = function () {
        var t = function (r, o, u) {
          var s = arguments.length;
          if (s < 2) throw new q.InvalidArgument('Too few arguments');
          for (var c = new Array(s - 1); --s; ) c[s - 1] = arguments[s];
          return ((u = c.pop()), [r, It(c), u]);
        }.apply(this, arguments);
        return this._transaction.apply(this, t);
      }),
      (ve.prototype._transaction = function (t, r, o) {
        var u = this,
          s = B.trans;
        (s && s.db === this && t.indexOf('!') === -1) || (s = null);
        var c,
          f,
          h = t.indexOf('?') !== -1;
        t = t.replace('!', '').replace('?', '');
        try {
          if (
            ((f = r.map(function (g) {
              if (((g = g instanceof u.Table ? g.name : g), typeof g != 'string'))
                throw new TypeError(
                  'Invalid table argument to Dexie.transaction(). Only Table or String are allowed',
                );
              return g;
            })),
            t == 'r' || t === pr)
          )
            c = pr;
          else {
            if (t != 'rw' && t != mr) throw new q.InvalidArgument('Invalid transaction mode: ' + t);
            c = mr;
          }
          if (s) {
            if (s.mode === pr && c === mr) {
              if (!h)
                throw new q.SubTransaction(
                  'Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY',
                );
              s = null;
            }
            (s &&
              f.forEach(function (g) {
                if (s && s.storeNames.indexOf(g) === -1) {
                  if (!h)
                    throw new q.SubTransaction(
                      'Table ' + g + ' not included in parent transaction.',
                    );
                  s = null;
                }
              }),
              h && s && !s.active && (s = null));
          }
        } catch (g) {
          return s
            ? s._promise(null, function (_, p) {
                p(g);
              })
            : me(g);
        }
        var v = function g(_, p, x, y, b) {
          return N.resolve().then(function () {
            var k = B.transless || B,
              w = _._createTransaction(p, x, _._dbSchema, y);
            if (((w.explicit = !0), (k = { trans: w, transless: k }), y)) w.idbtrans = y.idbtrans;
            else
              try {
                (w.create(), (w.idbtrans._explicit = !0), (_._state.PR1398_maxLoop = 3));
              } catch (P) {
                return P.name === Ne.InvalidState && _.isOpen() && 0 < --_._state.PR1398_maxLoop
                  ? (console.warn('Dexie: Need to reopen db'),
                    _.close({ disableAutoOpen: !1 }),
                    _.open().then(function () {
                      return g(_, p, x, null, b);
                    }))
                  : me(P);
              }
            var z,
              O = tt(b);
            return (
              O && Tt(),
              (k = N.follow(function () {
                var P;
                (z = b.call(w, w)) &&
                  (O
                    ? ((P = ot.bind(null, null)), z.then(P, P))
                    : typeof z.next == 'function' && typeof z.throw == 'function' && (z = $r(z)));
              }, k)),
              (z && typeof z.then == 'function'
                ? N.resolve(z).then(function (P) {
                    return w.active
                      ? P
                      : me(
                          new q.PrematureCommit(
                            'Transaction committed too early. See http://bit.ly/2kdckMn',
                          ),
                        );
                  })
                : k.then(function () {
                    return z;
                  })
              )
                .then(function (P) {
                  return (
                    y && w._resolve(),
                    w._completion.then(function () {
                      return P;
                    })
                  );
                })
                .catch(function (P) {
                  return (w._reject(P), me(P));
                })
            );
          });
        }.bind(null, this, c, f, s, o);
        return s
          ? s._promise(c, v, 'lock')
          : B.trans
            ? kt(B.transless, function () {
                return u._whenReady(v);
              })
            : this._whenReady(v);
      }),
      (ve.prototype.table = function (t) {
        if (!U(this._allTables, t)) throw new q.InvalidTable('Table '.concat(t, ' does not exist'));
        return this._allTables[t];
      }),
      ve);
    function ve(t, r) {
      var o = this;
      ((this._middlewares = {}), (this.verno = 0));
      var u = ve.dependencies;
      ((this._options = r =
        a(
          {
            addons: ve.addons,
            autoOpen: !0,
            indexedDB: u.indexedDB,
            IDBKeyRange: u.IDBKeyRange,
            cache: 'cloned',
          },
          r,
        )),
        (this._deps = { indexedDB: r.indexedDB, IDBKeyRange: r.IDBKeyRange }),
        (u = r.addons),
        (this._dbSchema = {}),
        (this._versions = []),
        (this._storeNames = []),
        (this._allTables = {}),
        (this.idbdb = null),
        (this._novip = this));
      var s,
        c,
        f,
        h,
        v,
        g = {
          dbOpenError: null,
          isBeingOpened: !1,
          onReadyBeingFired: null,
          openComplete: !1,
          dbReadyResolve: te,
          dbReadyPromise: null,
          cancelOpen: te,
          openCanceller: null,
          autoSchema: !0,
          PR1398_maxLoop: 3,
          autoOpen: r.autoOpen,
        };
      ((g.dbReadyPromise = new N(function (p) {
        g.dbReadyResolve = p;
      })),
        (g.openCanceller = new N(function (p, x) {
          g.cancelOpen = x;
        })),
        (this._state = g),
        (this.name = t),
        (this.on = tn(this, 'populate', 'blocked', 'versionchange', 'close', { ready: [ir, te] })),
        (this.once = function (p, x) {
          var y = function () {
            for (var b = [], k = 0; k < arguments.length; k++) b[k] = arguments[k];
            (o.on(p).unsubscribe(y), x.apply(o, b));
          };
          return o.on(p, y);
        }),
        (this.on.ready.subscribe = _e(this.on.ready.subscribe, function (p) {
          return function (x, y) {
            ve.vip(function () {
              var b,
                k = o._state;
              k.openComplete
                ? (k.dbOpenError || N.resolve().then(x), y && p(x))
                : k.onReadyBeingFired
                  ? (k.onReadyBeingFired.push(x), y && p(x))
                  : (p(x),
                    (b = o),
                    y ||
                      p(function w() {
                        (b.on.ready.unsubscribe(x), b.on.ready.unsubscribe(w));
                      }));
            });
          };
        })),
        (this.Collection =
          ((s = this),
          nn(Yi.prototype, function (z, w) {
            this.db = s;
            var y = fo,
              b = null;
            if (w)
              try {
                y = w();
              } catch (O) {
                b = O;
              }
            var k = z._ctx,
              w = k.table,
              z = w.hook.reading.fire;
            this._ctx = {
              table: w,
              index: k.index,
              isPrimKey:
                !k.index || (w.schema.primKey.keyPath && k.index === w.schema.primKey.name),
              range: y,
              keysOnly: !1,
              dir: 'next',
              unique: '',
              algorithm: null,
              filter: null,
              replayFilter: null,
              justLimit: !0,
              isMatch: null,
              offset: 0,
              limit: 1 / 0,
              error: b,
              or: k.or,
              valueMapper: z !== Jt ? z : null,
            };
          }))),
        (this.Table =
          ((c = this),
          nn(vo.prototype, function (p, x, y) {
            ((this.db = c),
              (this._tx = y),
              (this.name = p),
              (this.schema = x),
              (this.hook = c._allTables[p]
                ? c._allTables[p].hook
                : tn(null, {
                    creating: [Ki, te],
                    reading: [Ni, Jt],
                    updating: [Fi, te],
                    deleting: [Bi, te],
                  })));
          }))),
        (this.Transaction =
          ((f = this),
          nn(Xi.prototype, function (p, x, y, b, k) {
            var w = this;
            (p !== 'readonly' &&
              x.forEach(function (z) {
                ((z = (z = y[z]) === null || z === void 0 ? void 0 : z.yProps),
                  z &&
                    (x = x.concat(
                      z.map(function (O) {
                        return O.updatesTable;
                      }),
                    )));
              }),
              (this.db = f),
              (this.mode = p),
              (this.storeNames = x),
              (this.schema = y),
              (this.chromeTransactionDurability = b),
              (this.idbtrans = null),
              (this.on = tn(this, 'complete', 'error', 'abort')),
              (this.parent = k || null),
              (this.active = !0),
              (this._reculock = 0),
              (this._blockedFuncs = []),
              (this._resolve = null),
              (this._reject = null),
              (this._waitingFor = null),
              (this._waitingQueue = null),
              (this._spinCount = 0),
              (this._completion = new N(function (z, O) {
                ((w._resolve = z), (w._reject = O));
              })),
              this._completion.then(
                function () {
                  ((w.active = !1), w.on.complete.fire());
                },
                function (z) {
                  var O = w.active;
                  return (
                    (w.active = !1),
                    w.on.error.fire(z),
                    w.parent ? w.parent._reject(z) : O && w.idbtrans && w.idbtrans.abort(),
                    me(z)
                  );
                },
              ));
          }))),
        (this.Version =
          ((h = this),
          nn(ou.prototype, function (p) {
            ((this.db = h),
              (this._cfg = {
                version: p,
                storesSource: null,
                dbschema: {},
                tables: {},
                contentUpgrade: null,
              }));
          }))),
        (this.WhereClause =
          ((v = this),
          nn(ko.prototype, function (p, x, y) {
            if (
              ((this.db = v),
              (this._ctx = { table: p, index: x === ':id' ? null : x, or: y }),
              (this._cmp = this._ascending = X),
              (this._descending = function (b, k) {
                return X(k, b);
              }),
              (this._max = function (b, k) {
                return 0 < X(b, k) ? b : k;
              }),
              (this._min = function (b, k) {
                return X(b, k) < 0 ? b : k;
              }),
              (this._IDBKeyRange = v._deps.IDBKeyRange),
              !this._IDBKeyRange)
            )
              throw new q.MissingAPI();
          }))),
        this.on('versionchange', function (p) {
          (0 < p.newVersion
            ? console.warn(
                "Another connection wants to upgrade database '".concat(
                  o.name,
                  "'. Closing db now to resume the upgrade.",
                ),
              )
            : console.warn(
                "Another connection wants to delete database '".concat(
                  o.name,
                  "'. Closing db now to resume the delete request.",
                ),
              ),
            o.close({ disableAutoOpen: !1 }));
        }),
        this.on('blocked', function (p) {
          !p.newVersion || p.newVersion < p.oldVersion
            ? console.warn("Dexie.delete('".concat(o.name, "') was blocked"))
            : console.warn(
                "Upgrade '"
                  .concat(o.name, "' blocked by other connection holding version ")
                  .concat(p.oldVersion / 10),
              );
        }),
        (this._maxKey = an(r.IDBKeyRange)),
        (this._createTransaction = function (p, x, y, b) {
          return new o.Transaction(p, x, y, o._options.chromeTransactionDurability, b);
        }),
        (this._fireOnBlocked = function (p) {
          (o.on('blocked').fire(p),
            $t
              .filter(function (x) {
                return x.name === o.name && x !== o && !x._state.vcFired;
              })
              .map(function (x) {
                return x.on('versionchange').fire(p);
              }));
        }),
        this.use(su),
        this.use(hu),
        this.use(cu),
        this.use(uu),
        this.use(au));
      var _ = new Proxy(this, {
        get: function (p, x, y) {
          if (x === '_vip') return !0;
          if (x === 'table')
            return function (k) {
              return Kn(o.table(k), _);
            };
          var b = Reflect.get(p, x, y);
          return b instanceof vo
            ? Kn(b, _)
            : x === 'tables'
              ? b.map(function (k) {
                  return Kn(k, _);
                })
              : x === '_createTransaction'
                ? function () {
                    return Kn(b.apply(this, arguments), _);
                  }
                : b;
        },
      });
      ((this.vip = _),
        u.forEach(function (p) {
          return p(o);
        }));
    }
    var Bn,
      je = typeof Symbol < 'u' && 'observable' in Symbol ? Symbol.observable : '@@observable',
      du =
        ((Rr.prototype.subscribe = function (t, r, o) {
          return this._subscribe(
            t && typeof t != 'function' ? t : { next: t, error: r, complete: o },
          );
        }),
        (Rr.prototype[je] = function () {
          return this;
        }),
        Rr);
    function Rr(t) {
      this._subscribe = t;
    }
    try {
      Bn = {
        indexedDB: m.indexedDB || m.mozIndexedDB || m.webkitIndexedDB || m.msIndexedDB,
        IDBKeyRange: m.IDBKeyRange || m.webkitIDBKeyRange,
      };
    } catch {
      Bn = { indexedDB: null, IDBKeyRange: null };
    }
    function Ro(t) {
      var r,
        o = !1,
        u = new du(function (s) {
          var c = tt(t),
            f,
            h = !1,
            v = {},
            g = {},
            _ = {
              get closed() {
                return h;
              },
              unsubscribe: function () {
                h || ((h = !0), f && f.abort(), p && at.storagemutated.unsubscribe(y));
              },
            };
          s.start && s.start(_);
          var p = !1,
            x = function () {
              return dr(b);
            },
            y = function (k) {
              (Dn(v, k), Ir(g, v) && x());
            },
            b = function () {
              var k, w, z;
              !h &&
                Bn.indexedDB &&
                ((v = {}),
                (k = {}),
                f && f.abort(),
                (f = new AbortController()),
                (z = (function (O) {
                  var P = At();
                  try {
                    c && Tt();
                    var S = rt(t, O);
                    return (S = c ? S.finally(ot) : S);
                  } finally {
                    P && Zt();
                  }
                })((w = { subscr: k, signal: f.signal, requery: x, querier: t, trans: null }))),
                Promise.resolve(z).then(
                  function (O) {
                    ((o = !0),
                      (r = O),
                      h ||
                        w.signal.aborted ||
                        ((v = {}),
                        (function (P) {
                          for (var S in P) if (U(P, S)) return;
                          return 1;
                        })((g = k)) ||
                          p ||
                          (at(un, y), (p = !0)),
                        dr(function () {
                          return !h && s.next && s.next(O);
                        })));
                  },
                  function (O) {
                    ((o = !1),
                      ['DatabaseClosedError', 'AbortError'].includes(O?.name) ||
                        h ||
                        dr(function () {
                          h || (s.error && s.error(O));
                        }));
                  },
                ));
            };
          return (setTimeout(x, 0), _);
        });
      return (
        (u.hasValue = function () {
          return o;
        }),
        (u.getValue = function () {
          return r;
        }),
        u
      );
    }
    var Ot = Qe;
    function Nr(t) {
      var r = st;
      try {
        ((st = !0), at.storagemutated.fire(t), Tr(t, !0));
      } finally {
        st = r;
      }
    }
    (W(
      Ot,
      a(a({}, mn), {
        delete: function (t) {
          return new Ot(t, { addons: [] }).delete();
        },
        exists: function (t) {
          return new Ot(t, { addons: [] })
            .open()
            .then(function (r) {
              return (r.close(), !0);
            })
            .catch('NoSuchDatabaseError', function () {
              return !1;
            });
        },
        getDatabaseNames: function (t) {
          try {
            return (
              (r = Ot.dependencies),
              (o = r.indexedDB),
              (r = r.IDBKeyRange),
              (Or(o)
                ? Promise.resolve(o.databases()).then(function (u) {
                    return u
                      .map(function (s) {
                        return s.name;
                      })
                      .filter(function (s) {
                        return s !== zn;
                      });
                  })
                : Er(o, r).toCollection().primaryKeys()
              ).then(t)
            );
          } catch {
            return me(new q.MissingAPI());
          }
          var r, o;
        },
        defineClass: function () {
          return function (t) {
            A(this, t);
          };
        },
        ignoreTransaction: function (t) {
          return B.trans ? kt(B.transless, t) : t();
        },
        vip: Pr,
        async: function (t) {
          return function () {
            try {
              var r = $r(t.apply(this, arguments));
              return r && typeof r.then == 'function' ? r : N.resolve(r);
            } catch (o) {
              return me(o);
            }
          };
        },
        spawn: function (t, r, o) {
          try {
            var u = $r(t.apply(o, r || []));
            return u && typeof u.then == 'function' ? u : N.resolve(u);
          } catch (s) {
            return me(s);
          }
        },
        currentTransaction: {
          get: function () {
            return B.trans || null;
          },
        },
        waitFor: function (t, r) {
          return (
            (r = N.resolve(typeof t == 'function' ? Ot.ignoreTransaction(t) : t).timeout(r || 6e4)),
            B.trans ? B.trans.waitFor(r) : r
          );
        },
        Promise: N,
        debug: {
          get: function () {
            return Fe;
          },
          set: function (t) {
            oo(t);
          },
        },
        derive: ae,
        extend: A,
        props: W,
        override: _e,
        Events: tn,
        on: at,
        liveQuery: Ro,
        extendObservabilitySet: Dn,
        getByKeyPath: be,
        setByKeyPath: we,
        delByKeyPath: function (t, r) {
          typeof r == 'string'
            ? we(t, r, void 0)
            : 'length' in r &&
              [].map.call(r, function (o) {
                we(t, o, void 0);
              });
        },
        shallowClone: St,
        deepClone: $e,
        getObjectDiff: jr,
        cmp: X,
        asap: Ze,
        minKey: -1 / 0,
        addons: [],
        connections: $t,
        errnames: Ne,
        dependencies: Bn,
        cache: Et,
        semVer: '4.2.0',
        version: '4.2.0'
          .split('.')
          .map(function (t) {
            return parseInt(t);
          })
          .reduce(function (t, r, o) {
            return t + r / Math.pow(10, 2 * o);
          }),
      }),
    ),
      (Ot.maxKey = an(Ot.dependencies.IDBKeyRange)),
      typeof dispatchEvent < 'u' &&
        typeof addEventListener < 'u' &&
        (at(un, function (t) {
          st || ((t = new CustomEvent(gr, { detail: t })), (st = !0), dispatchEvent(t), (st = !1));
        }),
        addEventListener(gr, function (t) {
          ((t = t.detail), st || Nr(t));
        })));
    var Rt,
      st = !1,
      No = function () {};
    return (
      typeof BroadcastChannel < 'u' &&
        ((No = function () {
          (Rt = new BroadcastChannel(gr)).onmessage = function (t) {
            return t.data && Nr(t.data);
          };
        })(),
        typeof Rt.unref == 'function' && Rt.unref(),
        at(un, function (t) {
          st || Rt.postMessage(t);
        })),
      typeof addEventListener < 'u' &&
        (addEventListener('pagehide', function (t) {
          if (!Qe.disableBfCache && t.persisted) {
            (Fe && console.debug('Dexie: handling persisted pagehide'), Rt?.close());
            for (var r = 0, o = $t; r < o.length; r++) o[r].close({ disableAutoOpen: !1 });
          }
        }),
        addEventListener('pageshow', function (t) {
          !Qe.disableBfCache &&
            t.persisted &&
            (Fe && console.debug('Dexie: handling persisted pageshow'),
            No(),
            Nr({ all: new ke(-1 / 0, [[]]) }));
        })),
      (N.rejectionMapper = function (t, r) {
        return !t ||
          t instanceof Be ||
          t instanceof TypeError ||
          t instanceof SyntaxError ||
          !t.name ||
          !ro[t.name]
          ? t
          : ((r = new ro[t.name](r || t.message, t)),
            'stack' in t &&
              Y(r, 'stack', {
                get: function () {
                  return this.inner.stack;
                },
              }),
            r);
      }),
      oo(Fe),
      a(
        Qe,
        Object.freeze({
          __proto__: null,
          Dexie: Qe,
          liveQuery: Ro,
          Entity: ho,
          cmp: X,
          PropModification: rn,
          replacePrefix: function (t, r) {
            return new rn({ replacePrefix: [t, r] });
          },
          add: function (t) {
            return new rn({ add: t });
          },
          remove: function (t) {
            return new rn({ remove: t });
          },
          default: Qe,
          RangeSet: ke,
          mergeRanges: ln,
          rangesOverlap: Po,
        }),
        { default: Qe },
      ),
      Qe
    );
  });
})(li);
var Iu = li.exports;
const Mr = ku(Iu),
  qo = Symbol.for('Dexie'),
  Xn = globalThis[qo] || (globalThis[qo] = Mr);
if (Mr.semVer !== Xn.semVer)
  throw new Error(
    `Two different versions of Dexie loaded in the same app: ${Mr.semVer} and ${Xn.semVer}`,
  );
const {
  liveQuery: uf,
  mergeRanges: af,
  rangesOverlap: sf,
  RangeSet: cf,
  cmp: lf,
  Entity: ff,
  PropModification: hf,
  replacePrefix: df,
  add: pf,
  remove: mf,
  DexieYProvider: vf,
} = Xn;
class Au extends Xn {
  constructor() {
    super('draconia_v1');
    qn(this, 'saves');
    qn(this, 'meta');
    qn(this, 'logs');
    this.version(1).stores({
      saves: '++id, profileId, version, createdAt',
      meta: 'key',
      logs: '++id, timestamp, level, source',
    });
  }
}
const hn = new Au();
function I(e, n, i) {
  function a(E, A) {
    var C;
    (Object.defineProperty(E, '_zod', { value: E._zod ?? {}, enumerable: !1 }),
      (C = E._zod).traits ?? (C.traits = new Set()),
      E._zod.traits.add(e),
      n(E, A));
    for (const M in d.prototype)
      M in E || Object.defineProperty(E, M, { value: d.prototype[M].bind(E) });
    ((E._zod.constr = d), (E._zod.def = A));
  }
  const l = i?.Parent ?? Object;
  class m extends l {}
  Object.defineProperty(m, 'name', { value: e });
  function d(E) {
    var A;
    const C = i?.Parent ? new m() : this;
    (a(C, E), (A = C._zod).deferred ?? (A.deferred = []));
    for (const M of C._zod.deferred) M();
    return C;
  }
  return (
    Object.defineProperty(d, 'init', { value: a }),
    Object.defineProperty(d, Symbol.hasInstance, {
      value: (E) => (i?.Parent && E instanceof i.Parent ? !0 : E?._zod?.traits?.has(e)),
    }),
    Object.defineProperty(d, 'name', { value: e }),
    d
  );
}
class Mt extends Error {
  constructor() {
    super('Encountered Promise during synchronous parse. Use .parseAsync() instead.');
  }
}
class fi extends Error {
  constructor(n) {
    (super(`Encountered unidirectional transform during encode: ${n}`),
      (this.name = 'ZodEncodeError'));
  }
}
const hi = {};
function lt(e) {
  return hi;
}
function Zu(e) {
  const n = Object.values(e).filter((a) => typeof a == 'number');
  return Object.entries(e)
    .filter(([a, l]) => n.indexOf(+a) === -1)
    .map(([a, l]) => l);
}
function Ur(e, n) {
  return typeof n == 'bigint' ? n.toString() : n;
}
function Gr(e) {
  return {
    get value() {
      {
        const n = e();
        return (Object.defineProperty(this, 'value', { value: n }), n);
      }
    },
  };
}
function Jr(e) {
  return e == null;
}
function Xr(e) {
  const n = e.startsWith('^') ? 1 : 0,
    i = e.endsWith('$') ? e.length - 1 : e.length;
  return e.slice(n, i);
}
function Tu(e, n) {
  const i = (e.toString().split('.')[1] || '').length,
    a = n.toString();
  let l = (a.split('.')[1] || '').length;
  if (l === 0 && /\d?e-\d?/.test(a)) {
    const A = a.match(/\d?e-(\d?)/);
    A?.[1] && (l = Number.parseInt(A[1]));
  }
  const m = i > l ? i : l,
    d = Number.parseInt(e.toFixed(m).replace('.', '')),
    E = Number.parseInt(n.toFixed(m).replace('.', ''));
  return (d % E) / 10 ** m;
}
const Mo = Symbol('evaluating');
function re(e, n, i) {
  let a;
  Object.defineProperty(e, n, {
    get() {
      if (a !== Mo) return (a === void 0 && ((a = Mo), (a = i())), a);
    },
    set(l) {
      Object.defineProperty(e, n, { value: l });
    },
    configurable: !0,
  });
}
function $u(e) {
  return Object.create(Object.getPrototypeOf(e), Object.getOwnPropertyDescriptors(e));
}
function ht(e, n, i) {
  Object.defineProperty(e, n, { value: i, writable: !0, enumerable: !0, configurable: !0 });
}
function Vt(...e) {
  const n = {};
  for (const i of e) {
    const a = Object.getOwnPropertyDescriptors(i);
    Object.assign(n, a);
  }
  return Object.defineProperties({}, n);
}
function Uo(e) {
  return JSON.stringify(e);
}
const di = 'captureStackTrace' in Error ? Error.captureStackTrace : (...e) => {};
function Qn(e) {
  return typeof e == 'object' && e !== null && !Array.isArray(e);
}
const ju = Gr(() => {
  if (typeof navigator < 'u' && navigator?.userAgent?.includes('Cloudflare')) return !1;
  try {
    const e = Function;
    return (new e(''), !0);
  } catch {
    return !1;
  }
});
function Ut(e) {
  if (Qn(e) === !1) return !1;
  const n = e.constructor;
  if (n === void 0) return !0;
  const i = n.prototype;
  return !(Qn(i) === !1 || Object.prototype.hasOwnProperty.call(i, 'isPrototypeOf') === !1);
}
function pi(e) {
  return Ut(e) ? { ...e } : e;
}
const Cu = new Set(['string', 'number', 'symbol']);
function Lt(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function dt(e, n, i) {
  const a = new e._zod.constr(n ?? e._zod.def);
  return ((!n || i?.parent) && (a._zod.parent = e), a);
}
function F(e) {
  const n = e;
  if (!n) return {};
  if (typeof n == 'string') return { error: () => n };
  if (n?.message !== void 0) {
    if (n?.error !== void 0) throw new Error('Cannot specify both `message` and `error` params');
    n.error = n.message;
  }
  return (delete n.message, typeof n.error == 'string' ? { ...n, error: () => n.error } : n);
}
function Du(e) {
  return Object.keys(e).filter(
    (n) => e[n]._zod.optin === 'optional' && e[n]._zod.optout === 'optional',
  );
}
const Ru = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
};
function Nu(e, n) {
  const i = e._zod.def,
    a = Vt(e._zod.def, {
      get shape() {
        const l = {};
        for (const m in n) {
          if (!(m in i.shape)) throw new Error(`Unrecognized key: "${m}"`);
          n[m] && (l[m] = i.shape[m]);
        }
        return (ht(this, 'shape', l), l);
      },
      checks: [],
    });
  return dt(e, a);
}
function Ku(e, n) {
  const i = e._zod.def,
    a = Vt(e._zod.def, {
      get shape() {
        const l = { ...e._zod.def.shape };
        for (const m in n) {
          if (!(m in i.shape)) throw new Error(`Unrecognized key: "${m}"`);
          n[m] && delete l[m];
        }
        return (ht(this, 'shape', l), l);
      },
      checks: [],
    });
  return dt(e, a);
}
function Bu(e, n) {
  if (!Ut(n)) throw new Error('Invalid input to extend: expected a plain object');
  const i = e._zod.def.checks;
  if (i && i.length > 0)
    throw new Error(
      'Object schemas containing refinements cannot be extended. Use `.safeExtend()` instead.',
    );
  const l = Vt(e._zod.def, {
    get shape() {
      const m = { ...e._zod.def.shape, ...n };
      return (ht(this, 'shape', m), m);
    },
    checks: [],
  });
  return dt(e, l);
}
function Fu(e, n) {
  if (!Ut(n)) throw new Error('Invalid input to safeExtend: expected a plain object');
  const i = {
    ...e._zod.def,
    get shape() {
      const a = { ...e._zod.def.shape, ...n };
      return (ht(this, 'shape', a), a);
    },
    checks: e._zod.def.checks,
  };
  return dt(e, i);
}
function qu(e, n) {
  const i = Vt(e._zod.def, {
    get shape() {
      const a = { ...e._zod.def.shape, ...n._zod.def.shape };
      return (ht(this, 'shape', a), a);
    },
    get catchall() {
      return n._zod.def.catchall;
    },
    checks: [],
  });
  return dt(e, i);
}
function Mu(e, n, i) {
  const a = Vt(n._zod.def, {
    get shape() {
      const l = n._zod.def.shape,
        m = { ...l };
      if (i)
        for (const d in i) {
          if (!(d in l)) throw new Error(`Unrecognized key: "${d}"`);
          i[d] && (m[d] = e ? new e({ type: 'optional', innerType: l[d] }) : l[d]);
        }
      else for (const d in l) m[d] = e ? new e({ type: 'optional', innerType: l[d] }) : l[d];
      return (ht(this, 'shape', m), m);
    },
    checks: [],
  });
  return dt(n, a);
}
function Uu(e, n, i) {
  const a = Vt(n._zod.def, {
    get shape() {
      const l = n._zod.def.shape,
        m = { ...l };
      if (i)
        for (const d in i) {
          if (!(d in m)) throw new Error(`Unrecognized key: "${d}"`);
          i[d] && (m[d] = new e({ type: 'nonoptional', innerType: l[d] }));
        }
      else for (const d in l) m[d] = new e({ type: 'nonoptional', innerType: l[d] });
      return (ht(this, 'shape', m), m);
    },
    checks: [],
  });
  return dt(n, a);
}
function Ft(e, n = 0) {
  if (e.aborted === !0) return !0;
  for (let i = n; i < e.issues.length; i++) if (e.issues[i]?.continue !== !0) return !0;
  return !1;
}
function qt(e, n) {
  return n.map((i) => {
    var a;
    return ((a = i).path ?? (a.path = []), i.path.unshift(e), i);
  });
}
function Ln(e) {
  return typeof e == 'string' ? e : e?.message;
}
function ft(e, n, i) {
  const a = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const l =
      Ln(e.inst?._zod.def?.error?.(e)) ??
      Ln(n?.error?.(e)) ??
      Ln(i.customError?.(e)) ??
      Ln(i.localeError?.(e)) ??
      'Invalid input';
    a.message = l;
  }
  return (delete a.inst, delete a.continue, n?.reportInput || delete a.input, a);
}
function Qr(e) {
  return Array.isArray(e) ? 'array' : typeof e == 'string' ? 'string' : 'unknown';
}
function dn(...e) {
  const [n, i, a] = e;
  return typeof n == 'string' ? { message: n, code: 'custom', input: i, inst: a } : { ...n };
}
const mi = (e, n) => {
    ((e.name = '$ZodError'),
      Object.defineProperty(e, '_zod', { value: e._zod, enumerable: !1 }),
      Object.defineProperty(e, 'issues', { value: n, enumerable: !1 }),
      (e.message = JSON.stringify(n, Ur, 2)),
      Object.defineProperty(e, 'toString', { value: () => e.message, enumerable: !1 }));
  },
  vi = I('$ZodError', mi),
  yi = I('$ZodError', mi, { Parent: Error });
function Lu(e, n = (i) => i.message) {
  const i = {},
    a = [];
  for (const l of e.issues)
    l.path.length > 0
      ? ((i[l.path[0]] = i[l.path[0]] || []), i[l.path[0]].push(n(l)))
      : a.push(n(l));
  return { formErrors: a, fieldErrors: i };
}
function Vu(e, n) {
  const i =
      n ||
      function (m) {
        return m.message;
      },
    a = { _errors: [] },
    l = (m) => {
      for (const d of m.issues)
        if (d.code === 'invalid_union' && d.errors.length) d.errors.map((E) => l({ issues: E }));
        else if (d.code === 'invalid_key') l({ issues: d.issues });
        else if (d.code === 'invalid_element') l({ issues: d.issues });
        else if (d.path.length === 0) a._errors.push(i(d));
        else {
          let E = a,
            A = 0;
          for (; A < d.path.length; ) {
            const C = d.path[A];
            (A === d.path.length - 1
              ? ((E[C] = E[C] || { _errors: [] }), E[C]._errors.push(i(d)))
              : (E[C] = E[C] || { _errors: [] }),
              (E = E[C]),
              A++);
          }
        }
    };
  return (l(e), a);
}
const Hr = (e) => (n, i, a, l) => {
    const m = a ? Object.assign(a, { async: !1 }) : { async: !1 },
      d = n._zod.run({ value: i, issues: [] }, m);
    if (d instanceof Promise) throw new Mt();
    if (d.issues.length) {
      const E = new (l?.Err ?? e)(d.issues.map((A) => ft(A, m, lt())));
      throw (di(E, l?.callee), E);
    }
    return d.value;
  },
  eo = (e) => async (n, i, a, l) => {
    const m = a ? Object.assign(a, { async: !0 }) : { async: !0 };
    let d = n._zod.run({ value: i, issues: [] }, m);
    if ((d instanceof Promise && (d = await d), d.issues.length)) {
      const E = new (l?.Err ?? e)(d.issues.map((A) => ft(A, m, lt())));
      throw (di(E, l?.callee), E);
    }
    return d.value;
  },
  tr = (e) => (n, i, a) => {
    const l = a ? { ...a, async: !1 } : { async: !1 },
      m = n._zod.run({ value: i, issues: [] }, l);
    if (m instanceof Promise) throw new Mt();
    return m.issues.length
      ? { success: !1, error: new (e ?? vi)(m.issues.map((d) => ft(d, l, lt()))) }
      : { success: !0, data: m.value };
  },
  Wu = tr(yi),
  nr = (e) => async (n, i, a) => {
    const l = a ? Object.assign(a, { async: !0 }) : { async: !0 };
    let m = n._zod.run({ value: i, issues: [] }, l);
    return (
      m instanceof Promise && (m = await m),
      m.issues.length
        ? { success: !1, error: new e(m.issues.map((d) => ft(d, l, lt()))) }
        : { success: !0, data: m.value }
    );
  },
  Yu = nr(yi),
  Gu = (e) => (n, i, a) => {
    const l = a ? Object.assign(a, { direction: 'backward' }) : { direction: 'backward' };
    return Hr(e)(n, i, l);
  },
  Ju = (e) => (n, i, a) => Hr(e)(n, i, a),
  Xu = (e) => async (n, i, a) => {
    const l = a ? Object.assign(a, { direction: 'backward' }) : { direction: 'backward' };
    return eo(e)(n, i, l);
  },
  Qu = (e) => async (n, i, a) => eo(e)(n, i, a),
  Hu = (e) => (n, i, a) => {
    const l = a ? Object.assign(a, { direction: 'backward' }) : { direction: 'backward' };
    return tr(e)(n, i, l);
  },
  ea = (e) => (n, i, a) => tr(e)(n, i, a),
  ta = (e) => async (n, i, a) => {
    const l = a ? Object.assign(a, { direction: 'backward' }) : { direction: 'backward' };
    return nr(e)(n, i, l);
  },
  na = (e) => async (n, i, a) => nr(e)(n, i, a),
  ra = /^[cC][^\s-]{8,}$/,
  oa = /^[0-9a-z]+$/,
  ia = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,
  ua = /^[0-9a-vA-V]{20}$/,
  aa = /^[A-Za-z0-9]{27}$/,
  sa = /^[a-zA-Z0-9_-]{21}$/,
  ca =
    /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,
  la = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
  Lo = (e) =>
    e
      ? new RegExp(
          `^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`,
        )
      : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/,
  fa =
    /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
  ha = '^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$';
function da() {
  return new RegExp(ha, 'u');
}
const pa =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  ma =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/,
  va =
    /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,
  ya =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  ga = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,
  gi = /^[A-Za-z0-9_-]*$/,
  ba =
    /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/,
  _a = /^\+(?:[0-9]){6,14}[0-9]$/,
  bi =
    '(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))',
  wa = new RegExp(`^${bi}$`);
function _i(e) {
  const n = '(?:[01]\\d|2[0-3]):[0-5]\\d';
  return typeof e.precision == 'number'
    ? e.precision === -1
      ? `${n}`
      : e.precision === 0
        ? `${n}:[0-5]\\d`
        : `${n}:[0-5]\\d\\.\\d{${e.precision}}`
    : `${n}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function ka(e) {
  return new RegExp(`^${_i(e)}$`);
}
function xa(e) {
  const n = _i({ precision: e.precision }),
    i = ['Z'];
  (e.local && i.push(''), e.offset && i.push('([+-](?:[01]\\d|2[0-3]):[0-5]\\d)'));
  const a = `${n}(?:${i.join('|')})`;
  return new RegExp(`^${bi}T(?:${a})$`);
}
const za = (e) => {
    const n = e ? `[\\s\\S]{${e?.minimum ?? 0},${e?.maximum ?? ''}}` : '[\\s\\S]*';
    return new RegExp(`^${n}$`);
  },
  Ea = /^\d+$/,
  Oa = /^-?\d+(?:\.\d+)?/i,
  Pa = /true|false/i,
  Sa = /^[^A-Z]*$/,
  Ia = /^[^a-z]*$/,
  Se = I('$ZodCheck', (e, n) => {
    var i;
    (e._zod ?? (e._zod = {}), (e._zod.def = n), (i = e._zod).onattach ?? (i.onattach = []));
  }),
  wi = { number: 'number', bigint: 'bigint', object: 'date' },
  ki = I('$ZodCheckLessThan', (e, n) => {
    Se.init(e, n);
    const i = wi[typeof n.value];
    (e._zod.onattach.push((a) => {
      const l = a._zod.bag,
        m = (n.inclusive ? l.maximum : l.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
      n.value < m && (n.inclusive ? (l.maximum = n.value) : (l.exclusiveMaximum = n.value));
    }),
      (e._zod.check = (a) => {
        (n.inclusive ? a.value <= n.value : a.value < n.value) ||
          a.issues.push({
            origin: i,
            code: 'too_big',
            maximum: n.value,
            input: a.value,
            inclusive: n.inclusive,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  xi = I('$ZodCheckGreaterThan', (e, n) => {
    Se.init(e, n);
    const i = wi[typeof n.value];
    (e._zod.onattach.push((a) => {
      const l = a._zod.bag,
        m = (n.inclusive ? l.minimum : l.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
      n.value > m && (n.inclusive ? (l.minimum = n.value) : (l.exclusiveMinimum = n.value));
    }),
      (e._zod.check = (a) => {
        (n.inclusive ? a.value >= n.value : a.value > n.value) ||
          a.issues.push({
            origin: i,
            code: 'too_small',
            minimum: n.value,
            input: a.value,
            inclusive: n.inclusive,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  Aa = I('$ZodCheckMultipleOf', (e, n) => {
    (Se.init(e, n),
      e._zod.onattach.push((i) => {
        var a;
        (a = i._zod.bag).multipleOf ?? (a.multipleOf = n.value);
      }),
      (e._zod.check = (i) => {
        if (typeof i.value != typeof n.value)
          throw new Error('Cannot mix number and bigint in multiple_of check.');
        (typeof i.value == 'bigint'
          ? i.value % n.value === BigInt(0)
          : Tu(i.value, n.value) === 0) ||
          i.issues.push({
            origin: typeof i.value,
            code: 'not_multiple_of',
            divisor: n.value,
            input: i.value,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  Za = I('$ZodCheckNumberFormat', (e, n) => {
    (Se.init(e, n), (n.format = n.format || 'float64'));
    const i = n.format?.includes('int'),
      a = i ? 'int' : 'number',
      [l, m] = Ru[n.format];
    (e._zod.onattach.push((d) => {
      const E = d._zod.bag;
      ((E.format = n.format), (E.minimum = l), (E.maximum = m), i && (E.pattern = Ea));
    }),
      (e._zod.check = (d) => {
        const E = d.value;
        if (i) {
          if (!Number.isInteger(E)) {
            d.issues.push({
              expected: a,
              format: n.format,
              code: 'invalid_type',
              continue: !1,
              input: E,
              inst: e,
            });
            return;
          }
          if (!Number.isSafeInteger(E)) {
            E > 0
              ? d.issues.push({
                  input: E,
                  code: 'too_big',
                  maximum: Number.MAX_SAFE_INTEGER,
                  note: 'Integers must be within the safe integer range.',
                  inst: e,
                  origin: a,
                  continue: !n.abort,
                })
              : d.issues.push({
                  input: E,
                  code: 'too_small',
                  minimum: Number.MIN_SAFE_INTEGER,
                  note: 'Integers must be within the safe integer range.',
                  inst: e,
                  origin: a,
                  continue: !n.abort,
                });
            return;
          }
        }
        (E < l &&
          d.issues.push({
            origin: 'number',
            input: E,
            code: 'too_small',
            minimum: l,
            inclusive: !0,
            inst: e,
            continue: !n.abort,
          }),
          E > m &&
            d.issues.push({ origin: 'number', input: E, code: 'too_big', maximum: m, inst: e }));
      }));
  }),
  Ta = I('$ZodCheckMaxLength', (e, n) => {
    var i;
    (Se.init(e, n),
      (i = e._zod.def).when ??
        (i.when = (a) => {
          const l = a.value;
          return !Jr(l) && l.length !== void 0;
        }),
      e._zod.onattach.push((a) => {
        const l = a._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        n.maximum < l && (a._zod.bag.maximum = n.maximum);
      }),
      (e._zod.check = (a) => {
        const l = a.value;
        if (l.length <= n.maximum) return;
        const d = Qr(l);
        a.issues.push({
          origin: d,
          code: 'too_big',
          maximum: n.maximum,
          inclusive: !0,
          input: l,
          inst: e,
          continue: !n.abort,
        });
      }));
  }),
  $a = I('$ZodCheckMinLength', (e, n) => {
    var i;
    (Se.init(e, n),
      (i = e._zod.def).when ??
        (i.when = (a) => {
          const l = a.value;
          return !Jr(l) && l.length !== void 0;
        }),
      e._zod.onattach.push((a) => {
        const l = a._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        n.minimum > l && (a._zod.bag.minimum = n.minimum);
      }),
      (e._zod.check = (a) => {
        const l = a.value;
        if (l.length >= n.minimum) return;
        const d = Qr(l);
        a.issues.push({
          origin: d,
          code: 'too_small',
          minimum: n.minimum,
          inclusive: !0,
          input: l,
          inst: e,
          continue: !n.abort,
        });
      }));
  }),
  ja = I('$ZodCheckLengthEquals', (e, n) => {
    var i;
    (Se.init(e, n),
      (i = e._zod.def).when ??
        (i.when = (a) => {
          const l = a.value;
          return !Jr(l) && l.length !== void 0;
        }),
      e._zod.onattach.push((a) => {
        const l = a._zod.bag;
        ((l.minimum = n.length), (l.maximum = n.length), (l.length = n.length));
      }),
      (e._zod.check = (a) => {
        const l = a.value,
          m = l.length;
        if (m === n.length) return;
        const d = Qr(l),
          E = m > n.length;
        a.issues.push({
          origin: d,
          ...(E
            ? { code: 'too_big', maximum: n.length }
            : { code: 'too_small', minimum: n.length }),
          inclusive: !0,
          exact: !0,
          input: a.value,
          inst: e,
          continue: !n.abort,
        });
      }));
  }),
  rr = I('$ZodCheckStringFormat', (e, n) => {
    var i, a;
    (Se.init(e, n),
      e._zod.onattach.push((l) => {
        const m = l._zod.bag;
        ((m.format = n.format),
          n.pattern && (m.patterns ?? (m.patterns = new Set()), m.patterns.add(n.pattern)));
      }),
      n.pattern
        ? ((i = e._zod).check ??
          (i.check = (l) => {
            ((n.pattern.lastIndex = 0),
              !n.pattern.test(l.value) &&
                l.issues.push({
                  origin: 'string',
                  code: 'invalid_format',
                  format: n.format,
                  input: l.value,
                  ...(n.pattern ? { pattern: n.pattern.toString() } : {}),
                  inst: e,
                  continue: !n.abort,
                }));
          }))
        : ((a = e._zod).check ?? (a.check = () => {})));
  }),
  Ca = I('$ZodCheckRegex', (e, n) => {
    (rr.init(e, n),
      (e._zod.check = (i) => {
        ((n.pattern.lastIndex = 0),
          !n.pattern.test(i.value) &&
            i.issues.push({
              origin: 'string',
              code: 'invalid_format',
              format: 'regex',
              input: i.value,
              pattern: n.pattern.toString(),
              inst: e,
              continue: !n.abort,
            }));
      }));
  }),
  Da = I('$ZodCheckLowerCase', (e, n) => {
    (n.pattern ?? (n.pattern = Sa), rr.init(e, n));
  }),
  Ra = I('$ZodCheckUpperCase', (e, n) => {
    (n.pattern ?? (n.pattern = Ia), rr.init(e, n));
  }),
  Na = I('$ZodCheckIncludes', (e, n) => {
    Se.init(e, n);
    const i = Lt(n.includes),
      a = new RegExp(typeof n.position == 'number' ? `^.{${n.position}}${i}` : i);
    ((n.pattern = a),
      e._zod.onattach.push((l) => {
        const m = l._zod.bag;
        (m.patterns ?? (m.patterns = new Set()), m.patterns.add(a));
      }),
      (e._zod.check = (l) => {
        l.value.includes(n.includes, n.position) ||
          l.issues.push({
            origin: 'string',
            code: 'invalid_format',
            format: 'includes',
            includes: n.includes,
            input: l.value,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  Ka = I('$ZodCheckStartsWith', (e, n) => {
    Se.init(e, n);
    const i = new RegExp(`^${Lt(n.prefix)}.*`);
    (n.pattern ?? (n.pattern = i),
      e._zod.onattach.push((a) => {
        const l = a._zod.bag;
        (l.patterns ?? (l.patterns = new Set()), l.patterns.add(i));
      }),
      (e._zod.check = (a) => {
        a.value.startsWith(n.prefix) ||
          a.issues.push({
            origin: 'string',
            code: 'invalid_format',
            format: 'starts_with',
            prefix: n.prefix,
            input: a.value,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  Ba = I('$ZodCheckEndsWith', (e, n) => {
    Se.init(e, n);
    const i = new RegExp(`.*${Lt(n.suffix)}$`);
    (n.pattern ?? (n.pattern = i),
      e._zod.onattach.push((a) => {
        const l = a._zod.bag;
        (l.patterns ?? (l.patterns = new Set()), l.patterns.add(i));
      }),
      (e._zod.check = (a) => {
        a.value.endsWith(n.suffix) ||
          a.issues.push({
            origin: 'string',
            code: 'invalid_format',
            format: 'ends_with',
            suffix: n.suffix,
            input: a.value,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  Fa = I('$ZodCheckOverwrite', (e, n) => {
    (Se.init(e, n),
      (e._zod.check = (i) => {
        i.value = n.tx(i.value);
      }));
  });
class qa {
  constructor(n = []) {
    ((this.content = []), (this.indent = 0), this && (this.args = n));
  }
  indented(n) {
    ((this.indent += 1), n(this), (this.indent -= 1));
  }
  write(n) {
    if (typeof n == 'function') {
      (n(this, { execution: 'sync' }), n(this, { execution: 'async' }));
      return;
    }
    const a = n
        .split(
          `
`,
        )
        .filter((d) => d),
      l = Math.min(...a.map((d) => d.length - d.trimStart().length)),
      m = a.map((d) => d.slice(l)).map((d) => ' '.repeat(this.indent * 2) + d);
    for (const d of m) this.content.push(d);
  }
  compile() {
    const n = Function,
      i = this?.args,
      l = [...(this?.content ?? ['']).map((m) => `  ${m}`)];
    return new n(
      ...i,
      l.join(`
`),
    );
  }
}
const Ma = { major: 4, minor: 1, patch: 1 },
  ce = I('$ZodType', (e, n) => {
    var i;
    (e ?? (e = {}), (e._zod.def = n), (e._zod.bag = e._zod.bag || {}), (e._zod.version = Ma));
    const a = [...(e._zod.def.checks ?? [])];
    e._zod.traits.has('$ZodCheck') && a.unshift(e);
    for (const l of a) for (const m of l._zod.onattach) m(e);
    if (a.length === 0)
      ((i = e._zod).deferred ?? (i.deferred = []),
        e._zod.deferred?.push(() => {
          e._zod.run = e._zod.parse;
        }));
    else {
      const l = (d, E, A) => {
          let C = Ft(d),
            M;
          for (const U of E) {
            if (U._zod.def.when) {
              if (!U._zod.def.when(d)) continue;
            } else if (C) continue;
            const W = d.issues.length,
              J = U._zod.check(d);
            if (J instanceof Promise && A?.async === !1) throw new Mt();
            if (M || J instanceof Promise)
              M = (M ?? Promise.resolve()).then(async () => {
                (await J, d.issues.length !== W && (C || (C = Ft(d, W))));
              });
            else {
              if (d.issues.length === W) continue;
              C || (C = Ft(d, W));
            }
          }
          return M ? M.then(() => d) : d;
        },
        m = (d, E, A) => {
          if (Ft(d)) return ((d.aborted = !0), d);
          const C = l(E, a, A);
          if (C instanceof Promise) {
            if (A.async === !1) throw new Mt();
            return C.then((M) => e._zod.parse(M, A));
          }
          return e._zod.parse(C, A);
        };
      e._zod.run = (d, E) => {
        if (E.skipChecks) return e._zod.parse(d, E);
        if (E.direction === 'backward') {
          const C = e._zod.parse({ value: d.value, issues: [] }, { ...E, skipChecks: !0 });
          return C instanceof Promise ? C.then((M) => m(M, d, E)) : m(C, d, E);
        }
        const A = e._zod.parse(d, E);
        if (A instanceof Promise) {
          if (E.async === !1) throw new Mt();
          return A.then((C) => l(C, a, E));
        }
        return l(A, a, E);
      };
    }
    e['~standard'] = {
      validate: (l) => {
        try {
          const m = Wu(e, l);
          return m.success ? { value: m.data } : { issues: m.error?.issues };
        } catch {
          return Yu(e, l).then((d) =>
            d.success ? { value: d.data } : { issues: d.error?.issues },
          );
        }
      },
      vendor: 'zod',
      version: 1,
    };
  }),
  to = I('$ZodString', (e, n) => {
    (ce.init(e, n),
      (e._zod.pattern = [...(e?._zod.bag?.patterns ?? [])].pop() ?? za(e._zod.bag)),
      (e._zod.parse = (i, a) => {
        if (n.coerce)
          try {
            i.value = String(i.value);
          } catch {}
        return (
          typeof i.value == 'string' ||
            i.issues.push({ expected: 'string', code: 'invalid_type', input: i.value, inst: e }),
          i
        );
      }));
  }),
  ue = I('$ZodStringFormat', (e, n) => {
    (rr.init(e, n), to.init(e, n));
  }),
  Ua = I('$ZodGUID', (e, n) => {
    (n.pattern ?? (n.pattern = la), ue.init(e, n));
  }),
  La = I('$ZodUUID', (e, n) => {
    if (n.version) {
      const a = { v1: 1, v2: 2, v3: 3, v4: 4, v5: 5, v6: 6, v7: 7, v8: 8 }[n.version];
      if (a === void 0) throw new Error(`Invalid UUID version: "${n.version}"`);
      n.pattern ?? (n.pattern = Lo(a));
    } else n.pattern ?? (n.pattern = Lo());
    ue.init(e, n);
  }),
  Va = I('$ZodEmail', (e, n) => {
    (n.pattern ?? (n.pattern = fa), ue.init(e, n));
  }),
  Wa = I('$ZodURL', (e, n) => {
    (ue.init(e, n),
      (e._zod.check = (i) => {
        try {
          const a = i.value.trim(),
            l = new URL(a);
          (n.hostname &&
            ((n.hostname.lastIndex = 0),
            n.hostname.test(l.hostname) ||
              i.issues.push({
                code: 'invalid_format',
                format: 'url',
                note: 'Invalid hostname',
                pattern: ba.source,
                input: i.value,
                inst: e,
                continue: !n.abort,
              })),
            n.protocol &&
              ((n.protocol.lastIndex = 0),
              n.protocol.test(l.protocol.endsWith(':') ? l.protocol.slice(0, -1) : l.protocol) ||
                i.issues.push({
                  code: 'invalid_format',
                  format: 'url',
                  note: 'Invalid protocol',
                  pattern: n.protocol.source,
                  input: i.value,
                  inst: e,
                  continue: !n.abort,
                })),
            n.normalize ? (i.value = l.href) : (i.value = a));
          return;
        } catch {
          i.issues.push({
            code: 'invalid_format',
            format: 'url',
            input: i.value,
            inst: e,
            continue: !n.abort,
          });
        }
      }));
  }),
  Ya = I('$ZodEmoji', (e, n) => {
    (n.pattern ?? (n.pattern = da()), ue.init(e, n));
  }),
  Ga = I('$ZodNanoID', (e, n) => {
    (n.pattern ?? (n.pattern = sa), ue.init(e, n));
  }),
  Ja = I('$ZodCUID', (e, n) => {
    (n.pattern ?? (n.pattern = ra), ue.init(e, n));
  }),
  Xa = I('$ZodCUID2', (e, n) => {
    (n.pattern ?? (n.pattern = oa), ue.init(e, n));
  }),
  Qa = I('$ZodULID', (e, n) => {
    (n.pattern ?? (n.pattern = ia), ue.init(e, n));
  }),
  Ha = I('$ZodXID', (e, n) => {
    (n.pattern ?? (n.pattern = ua), ue.init(e, n));
  }),
  es = I('$ZodKSUID', (e, n) => {
    (n.pattern ?? (n.pattern = aa), ue.init(e, n));
  }),
  ts = I('$ZodISODateTime', (e, n) => {
    (n.pattern ?? (n.pattern = xa(n)), ue.init(e, n));
  }),
  ns = I('$ZodISODate', (e, n) => {
    (n.pattern ?? (n.pattern = wa), ue.init(e, n));
  }),
  rs = I('$ZodISOTime', (e, n) => {
    (n.pattern ?? (n.pattern = ka(n)), ue.init(e, n));
  }),
  os = I('$ZodISODuration', (e, n) => {
    (n.pattern ?? (n.pattern = ca), ue.init(e, n));
  }),
  is = I('$ZodIPv4', (e, n) => {
    (n.pattern ?? (n.pattern = pa),
      ue.init(e, n),
      e._zod.onattach.push((i) => {
        const a = i._zod.bag;
        a.format = 'ipv4';
      }));
  }),
  us = I('$ZodIPv6', (e, n) => {
    (n.pattern ?? (n.pattern = ma),
      ue.init(e, n),
      e._zod.onattach.push((i) => {
        const a = i._zod.bag;
        a.format = 'ipv6';
      }),
      (e._zod.check = (i) => {
        try {
          new URL(`http://[${i.value}]`);
        } catch {
          i.issues.push({
            code: 'invalid_format',
            format: 'ipv6',
            input: i.value,
            inst: e,
            continue: !n.abort,
          });
        }
      }));
  }),
  as = I('$ZodCIDRv4', (e, n) => {
    (n.pattern ?? (n.pattern = va), ue.init(e, n));
  }),
  ss = I('$ZodCIDRv6', (e, n) => {
    (n.pattern ?? (n.pattern = ya),
      ue.init(e, n),
      (e._zod.check = (i) => {
        const [a, l] = i.value.split('/');
        try {
          if (!l) throw new Error();
          const m = Number(l);
          if (`${m}` !== l) throw new Error();
          if (m < 0 || m > 128) throw new Error();
          new URL(`http://[${a}]`);
        } catch {
          i.issues.push({
            code: 'invalid_format',
            format: 'cidrv6',
            input: i.value,
            inst: e,
            continue: !n.abort,
          });
        }
      }));
  });
function zi(e) {
  if (e === '') return !0;
  if (e.length % 4 !== 0) return !1;
  try {
    return (atob(e), !0);
  } catch {
    return !1;
  }
}
const cs = I('$ZodBase64', (e, n) => {
  (n.pattern ?? (n.pattern = ga),
    ue.init(e, n),
    e._zod.onattach.push((i) => {
      i._zod.bag.contentEncoding = 'base64';
    }),
    (e._zod.check = (i) => {
      zi(i.value) ||
        i.issues.push({
          code: 'invalid_format',
          format: 'base64',
          input: i.value,
          inst: e,
          continue: !n.abort,
        });
    }));
});
function ls(e) {
  if (!gi.test(e)) return !1;
  const n = e.replace(/[-_]/g, (a) => (a === '-' ? '+' : '/')),
    i = n.padEnd(Math.ceil(n.length / 4) * 4, '=');
  return zi(i);
}
const fs = I('$ZodBase64URL', (e, n) => {
    (n.pattern ?? (n.pattern = gi),
      ue.init(e, n),
      e._zod.onattach.push((i) => {
        i._zod.bag.contentEncoding = 'base64url';
      }),
      (e._zod.check = (i) => {
        ls(i.value) ||
          i.issues.push({
            code: 'invalid_format',
            format: 'base64url',
            input: i.value,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  hs = I('$ZodE164', (e, n) => {
    (n.pattern ?? (n.pattern = _a), ue.init(e, n));
  });
function ds(e, n = null) {
  try {
    const i = e.split('.');
    if (i.length !== 3) return !1;
    const [a] = i;
    if (!a) return !1;
    const l = JSON.parse(atob(a));
    return !(('typ' in l && l?.typ !== 'JWT') || !l.alg || (n && (!('alg' in l) || l.alg !== n)));
  } catch {
    return !1;
  }
}
const ps = I('$ZodJWT', (e, n) => {
    (ue.init(e, n),
      (e._zod.check = (i) => {
        ds(i.value, n.alg) ||
          i.issues.push({
            code: 'invalid_format',
            format: 'jwt',
            input: i.value,
            inst: e,
            continue: !n.abort,
          });
      }));
  }),
  Ei = I('$ZodNumber', (e, n) => {
    (ce.init(e, n),
      (e._zod.pattern = e._zod.bag.pattern ?? Oa),
      (e._zod.parse = (i, a) => {
        if (n.coerce)
          try {
            i.value = Number(i.value);
          } catch {}
        const l = i.value;
        if (typeof l == 'number' && !Number.isNaN(l) && Number.isFinite(l)) return i;
        const m =
          typeof l == 'number'
            ? Number.isNaN(l)
              ? 'NaN'
              : Number.isFinite(l)
                ? void 0
                : 'Infinity'
            : void 0;
        return (
          i.issues.push({
            expected: 'number',
            code: 'invalid_type',
            input: l,
            inst: e,
            ...(m ? { received: m } : {}),
          }),
          i
        );
      }));
  }),
  ms = I('$ZodNumber', (e, n) => {
    (Za.init(e, n), Ei.init(e, n));
  }),
  vs = I('$ZodBoolean', (e, n) => {
    (ce.init(e, n),
      (e._zod.pattern = Pa),
      (e._zod.parse = (i, a) => {
        if (n.coerce)
          try {
            i.value = !!i.value;
          } catch {}
        const l = i.value;
        return (
          typeof l == 'boolean' ||
            i.issues.push({ expected: 'boolean', code: 'invalid_type', input: l, inst: e }),
          i
        );
      }));
  }),
  ys = I('$ZodUnknown', (e, n) => {
    (ce.init(e, n), (e._zod.parse = (i) => i));
  }),
  gs = I('$ZodNever', (e, n) => {
    (ce.init(e, n),
      (e._zod.parse = (i, a) => (
        i.issues.push({ expected: 'never', code: 'invalid_type', input: i.value, inst: e }),
        i
      )));
  });
function Vo(e, n, i) {
  (e.issues.length && n.issues.push(...qt(i, e.issues)), (n.value[i] = e.value));
}
const bs = I('$ZodArray', (e, n) => {
  (ce.init(e, n),
    (e._zod.parse = (i, a) => {
      const l = i.value;
      if (!Array.isArray(l))
        return (i.issues.push({ expected: 'array', code: 'invalid_type', input: l, inst: e }), i);
      i.value = Array(l.length);
      const m = [];
      for (let d = 0; d < l.length; d++) {
        const E = l[d],
          A = n.element._zod.run({ value: E, issues: [] }, a);
        A instanceof Promise ? m.push(A.then((C) => Vo(C, i, d))) : Vo(A, i, d);
      }
      return m.length ? Promise.all(m).then(() => i) : i;
    }));
});
function Hn(e, n, i, a) {
  (e.issues.length && n.issues.push(...qt(i, e.issues)),
    e.value === void 0 ? i in a && (n.value[i] = void 0) : (n.value[i] = e.value));
}
function Oi(e) {
  const n = Object.keys(e.shape);
  for (const a of n)
    if (!e.shape[a]._zod.traits.has('$ZodType'))
      throw new Error(`Invalid element at key "${a}": expected a Zod schema`);
  const i = Du(e.shape);
  return { ...e, keys: n, keySet: new Set(n), numKeys: n.length, optionalKeys: new Set(i) };
}
function Pi(e, n, i, a, l, m) {
  const d = [],
    E = l.keySet,
    A = l.catchall._zod,
    C = A.def.type;
  for (const M of Object.keys(n)) {
    if (E.has(M)) continue;
    if (C === 'never') {
      d.push(M);
      continue;
    }
    const U = A.run({ value: n[M], issues: [] }, a);
    U instanceof Promise ? e.push(U.then((W) => Hn(W, i, M, n))) : Hn(U, i, M, n);
  }
  return (
    d.length && i.issues.push({ code: 'unrecognized_keys', keys: d, input: n, inst: m }),
    e.length ? Promise.all(e).then(() => i) : i
  );
}
const _s = I('$ZodObject', (e, n) => {
    ce.init(e, n);
    const i = Gr(() => Oi(n));
    re(e._zod, 'propValues', () => {
      const d = n.shape,
        E = {};
      for (const A in d) {
        const C = d[A]._zod;
        if (C.values) {
          E[A] ?? (E[A] = new Set());
          for (const M of C.values) E[A].add(M);
        }
      }
      return E;
    });
    const a = Qn,
      l = n.catchall;
    let m;
    e._zod.parse = (d, E) => {
      m ?? (m = i.value);
      const A = d.value;
      if (!a(A))
        return (d.issues.push({ expected: 'object', code: 'invalid_type', input: A, inst: e }), d);
      d.value = {};
      const C = [],
        M = m.shape;
      for (const U of m.keys) {
        const J = M[U]._zod.run({ value: A[U], issues: [] }, E);
        J instanceof Promise ? C.push(J.then((Y) => Hn(Y, d, U, A))) : Hn(J, d, U, A);
      }
      return l ? Pi(C, A, d, E, i.value, e) : C.length ? Promise.all(C).then(() => d) : d;
    };
  }),
  ws = I('$ZodObjectJIT', (e, n) => {
    _s.init(e, n);
    const i = e._zod.parse,
      a = Gr(() => Oi(n)),
      l = (W) => {
        const J = new qa(['shape', 'payload', 'ctx']),
          Y = a.value,
          ae = (_e) => {
            const pe = Uo(_e);
            return `shape[${pe}]._zod.run({ value: input[${pe}], issues: [] }, ctx)`;
          };
        J.write('const input = payload.value;');
        const Ee = Object.create(null);
        let pt = 0;
        for (const _e of Y.keys) Ee[_e] = `key_${pt++}`;
        J.write('const newResult = {}');
        for (const _e of Y.keys) {
          const pe = Ee[_e],
            Ze = Uo(_e);
          (J.write(`const ${pe} = ${ae(_e)};`),
            J.write(`
        if (${pe}.issues.length) {
          payload.issues = payload.issues.concat(${pe}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${Ze}, ...iss.path] : [${Ze}]
          })));
        }
        
        if (${pe}.value === undefined) {
          if (${Ze} in input) {
            newResult[${Ze}] = undefined;
          }
        } else {
          newResult[${Ze}] = ${pe}.value;
        }
      `));
        }
        (J.write('payload.value = newResult;'), J.write('return payload;'));
        const Oe = J.compile();
        return (_e, pe) => Oe(W, _e, pe);
      };
    let m;
    const d = Qn,
      E = !hi.jitless,
      C = E && ju.value,
      M = n.catchall;
    let U;
    e._zod.parse = (W, J) => {
      U ?? (U = a.value);
      const Y = W.value;
      return d(Y)
        ? E && C && J?.async === !1 && J.jitless !== !0
          ? (m || (m = l(n.shape)), (W = m(W, J)), M ? Pi([], Y, W, J, U, e) : W)
          : i(W, J)
        : (W.issues.push({ expected: 'object', code: 'invalid_type', input: Y, inst: e }), W);
    };
  });
function Wo(e, n, i, a) {
  for (const m of e) if (m.issues.length === 0) return ((n.value = m.value), n);
  const l = e.filter((m) => !Ft(m));
  return l.length === 1
    ? ((n.value = l[0].value), l[0])
    : (n.issues.push({
        code: 'invalid_union',
        input: n.value,
        inst: i,
        errors: e.map((m) => m.issues.map((d) => ft(d, a, lt()))),
      }),
      n);
}
const ks = I('$ZodUnion', (e, n) => {
    (ce.init(e, n),
      re(e._zod, 'optin', () =>
        n.options.some((l) => l._zod.optin === 'optional') ? 'optional' : void 0,
      ),
      re(e._zod, 'optout', () =>
        n.options.some((l) => l._zod.optout === 'optional') ? 'optional' : void 0,
      ),
      re(e._zod, 'values', () => {
        if (n.options.every((l) => l._zod.values))
          return new Set(n.options.flatMap((l) => Array.from(l._zod.values)));
      }),
      re(e._zod, 'pattern', () => {
        if (n.options.every((l) => l._zod.pattern)) {
          const l = n.options.map((m) => m._zod.pattern);
          return new RegExp(`^(${l.map((m) => Xr(m.source)).join('|')})$`);
        }
      }));
    const i = n.options.length === 1,
      a = n.options[0]._zod.run;
    e._zod.parse = (l, m) => {
      if (i) return a(l, m);
      let d = !1;
      const E = [];
      for (const A of n.options) {
        const C = A._zod.run({ value: l.value, issues: [] }, m);
        if (C instanceof Promise) (E.push(C), (d = !0));
        else {
          if (C.issues.length === 0) return C;
          E.push(C);
        }
      }
      return d ? Promise.all(E).then((A) => Wo(A, l, e, m)) : Wo(E, l, e, m);
    };
  }),
  xs = I('$ZodIntersection', (e, n) => {
    (ce.init(e, n),
      (e._zod.parse = (i, a) => {
        const l = i.value,
          m = n.left._zod.run({ value: l, issues: [] }, a),
          d = n.right._zod.run({ value: l, issues: [] }, a);
        return m instanceof Promise || d instanceof Promise
          ? Promise.all([m, d]).then(([A, C]) => Yo(i, A, C))
          : Yo(i, m, d);
      }));
  });
function Lr(e, n) {
  if (e === n) return { valid: !0, data: e };
  if (e instanceof Date && n instanceof Date && +e == +n) return { valid: !0, data: e };
  if (Ut(e) && Ut(n)) {
    const i = Object.keys(n),
      a = Object.keys(e).filter((m) => i.indexOf(m) !== -1),
      l = { ...e, ...n };
    for (const m of a) {
      const d = Lr(e[m], n[m]);
      if (!d.valid) return { valid: !1, mergeErrorPath: [m, ...d.mergeErrorPath] };
      l[m] = d.data;
    }
    return { valid: !0, data: l };
  }
  if (Array.isArray(e) && Array.isArray(n)) {
    if (e.length !== n.length) return { valid: !1, mergeErrorPath: [] };
    const i = [];
    for (let a = 0; a < e.length; a++) {
      const l = e[a],
        m = n[a],
        d = Lr(l, m);
      if (!d.valid) return { valid: !1, mergeErrorPath: [a, ...d.mergeErrorPath] };
      i.push(d.data);
    }
    return { valid: !0, data: i };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function Yo(e, n, i) {
  if (
    (n.issues.length && e.issues.push(...n.issues),
    i.issues.length && e.issues.push(...i.issues),
    Ft(e))
  )
    return e;
  const a = Lr(n.value, i.value);
  if (!a.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(a.mergeErrorPath)}`);
  return ((e.value = a.data), e);
}
const zs = I('$ZodRecord', (e, n) => {
    (ce.init(e, n),
      (e._zod.parse = (i, a) => {
        const l = i.value;
        if (!Ut(l))
          return (
            i.issues.push({ expected: 'record', code: 'invalid_type', input: l, inst: e }),
            i
          );
        const m = [];
        if (n.keyType._zod.values) {
          const d = n.keyType._zod.values;
          i.value = {};
          for (const A of d)
            if (typeof A == 'string' || typeof A == 'number' || typeof A == 'symbol') {
              const C = n.valueType._zod.run({ value: l[A], issues: [] }, a);
              C instanceof Promise
                ? m.push(
                    C.then((M) => {
                      (M.issues.length && i.issues.push(...qt(A, M.issues)),
                        (i.value[A] = M.value));
                    }),
                  )
                : (C.issues.length && i.issues.push(...qt(A, C.issues)), (i.value[A] = C.value));
            }
          let E;
          for (const A in l) d.has(A) || ((E = E ?? []), E.push(A));
          E &&
            E.length > 0 &&
            i.issues.push({ code: 'unrecognized_keys', input: l, inst: e, keys: E });
        } else {
          i.value = {};
          for (const d of Reflect.ownKeys(l)) {
            if (d === '__proto__') continue;
            const E = n.keyType._zod.run({ value: d, issues: [] }, a);
            if (E instanceof Promise)
              throw new Error('Async schemas not supported in object keys currently');
            if (E.issues.length) {
              (i.issues.push({
                code: 'invalid_key',
                origin: 'record',
                issues: E.issues.map((C) => ft(C, a, lt())),
                input: d,
                path: [d],
                inst: e,
              }),
                (i.value[E.value] = E.value));
              continue;
            }
            const A = n.valueType._zod.run({ value: l[d], issues: [] }, a);
            A instanceof Promise
              ? m.push(
                  A.then((C) => {
                    (C.issues.length && i.issues.push(...qt(d, C.issues)),
                      (i.value[E.value] = C.value));
                  }),
                )
              : (A.issues.length && i.issues.push(...qt(d, A.issues)),
                (i.value[E.value] = A.value));
          }
        }
        return m.length ? Promise.all(m).then(() => i) : i;
      }));
  }),
  Es = I('$ZodEnum', (e, n) => {
    ce.init(e, n);
    const i = Zu(n.entries),
      a = new Set(i);
    ((e._zod.values = a),
      (e._zod.pattern = new RegExp(
        `^(${i
          .filter((l) => Cu.has(typeof l))
          .map((l) => (typeof l == 'string' ? Lt(l) : l.toString()))
          .join('|')})$`,
      )),
      (e._zod.parse = (l, m) => {
        const d = l.value;
        return (
          a.has(d) || l.issues.push({ code: 'invalid_value', values: i, input: d, inst: e }),
          l
        );
      }));
  }),
  Os = I('$ZodLiteral', (e, n) => {
    if ((ce.init(e, n), n.values.length === 0))
      throw new Error('Cannot create literal schema with no valid values');
    ((e._zod.values = new Set(n.values)),
      (e._zod.pattern = new RegExp(
        `^(${n.values.map((i) => (typeof i == 'string' ? Lt(i) : i ? Lt(i.toString()) : String(i))).join('|')})$`,
      )),
      (e._zod.parse = (i, a) => {
        const l = i.value;
        return (
          e._zod.values.has(l) ||
            i.issues.push({ code: 'invalid_value', values: n.values, input: l, inst: e }),
          i
        );
      }));
  }),
  Ps = I('$ZodTransform', (e, n) => {
    (ce.init(e, n),
      (e._zod.parse = (i, a) => {
        if (a.direction === 'backward') throw new fi(e.constructor.name);
        const l = n.transform(i.value, i);
        if (a.async)
          return (l instanceof Promise ? l : Promise.resolve(l)).then((d) => ((i.value = d), i));
        if (l instanceof Promise) throw new Mt();
        return ((i.value = l), i);
      }));
  });
function Go(e, n) {
  return e.issues.length && n === void 0 ? { issues: [], value: void 0 } : e;
}
const Ss = I('$ZodOptional', (e, n) => {
    (ce.init(e, n),
      (e._zod.optin = 'optional'),
      (e._zod.optout = 'optional'),
      re(e._zod, 'values', () =>
        n.innerType._zod.values ? new Set([...n.innerType._zod.values, void 0]) : void 0,
      ),
      re(e._zod, 'pattern', () => {
        const i = n.innerType._zod.pattern;
        return i ? new RegExp(`^(${Xr(i.source)})?$`) : void 0;
      }),
      (e._zod.parse = (i, a) => {
        if (n.innerType._zod.optin === 'optional') {
          const l = n.innerType._zod.run(i, a);
          return l instanceof Promise ? l.then((m) => Go(m, i.value)) : Go(l, i.value);
        }
        return i.value === void 0 ? i : n.innerType._zod.run(i, a);
      }));
  }),
  Is = I('$ZodNullable', (e, n) => {
    (ce.init(e, n),
      re(e._zod, 'optin', () => n.innerType._zod.optin),
      re(e._zod, 'optout', () => n.innerType._zod.optout),
      re(e._zod, 'pattern', () => {
        const i = n.innerType._zod.pattern;
        return i ? new RegExp(`^(${Xr(i.source)}|null)$`) : void 0;
      }),
      re(e._zod, 'values', () =>
        n.innerType._zod.values ? new Set([...n.innerType._zod.values, null]) : void 0,
      ),
      (e._zod.parse = (i, a) => (i.value === null ? i : n.innerType._zod.run(i, a))));
  }),
  As = I('$ZodDefault', (e, n) => {
    (ce.init(e, n),
      (e._zod.optin = 'optional'),
      re(e._zod, 'values', () => n.innerType._zod.values),
      (e._zod.parse = (i, a) => {
        if (a.direction === 'backward') return n.innerType._zod.run(i, a);
        if (i.value === void 0) return ((i.value = n.defaultValue), i);
        const l = n.innerType._zod.run(i, a);
        return l instanceof Promise ? l.then((m) => Jo(m, n)) : Jo(l, n);
      }));
  });
function Jo(e, n) {
  return (e.value === void 0 && (e.value = n.defaultValue), e);
}
const Zs = I('$ZodPrefault', (e, n) => {
    (ce.init(e, n),
      (e._zod.optin = 'optional'),
      re(e._zod, 'values', () => n.innerType._zod.values),
      (e._zod.parse = (i, a) => (
        a.direction === 'backward' || (i.value === void 0 && (i.value = n.defaultValue)),
        n.innerType._zod.run(i, a)
      )));
  }),
  Ts = I('$ZodNonOptional', (e, n) => {
    (ce.init(e, n),
      re(e._zod, 'values', () => {
        const i = n.innerType._zod.values;
        return i ? new Set([...i].filter((a) => a !== void 0)) : void 0;
      }),
      (e._zod.parse = (i, a) => {
        const l = n.innerType._zod.run(i, a);
        return l instanceof Promise ? l.then((m) => Xo(m, e)) : Xo(l, e);
      }));
  });
function Xo(e, n) {
  return (
    !e.issues.length &&
      e.value === void 0 &&
      e.issues.push({ code: 'invalid_type', expected: 'nonoptional', input: e.value, inst: n }),
    e
  );
}
const $s = I('$ZodCatch', (e, n) => {
    (ce.init(e, n),
      re(e._zod, 'optin', () => n.innerType._zod.optin),
      re(e._zod, 'optout', () => n.innerType._zod.optout),
      re(e._zod, 'values', () => n.innerType._zod.values),
      (e._zod.parse = (i, a) => {
        if (a.direction === 'backward') return n.innerType._zod.run(i, a);
        const l = n.innerType._zod.run(i, a);
        return l instanceof Promise
          ? l.then(
              (m) => (
                (i.value = m.value),
                m.issues.length &&
                  ((i.value = n.catchValue({
                    ...i,
                    error: { issues: m.issues.map((d) => ft(d, a, lt())) },
                    input: i.value,
                  })),
                  (i.issues = [])),
                i
              ),
            )
          : ((i.value = l.value),
            l.issues.length &&
              ((i.value = n.catchValue({
                ...i,
                error: { issues: l.issues.map((m) => ft(m, a, lt())) },
                input: i.value,
              })),
              (i.issues = [])),
            i);
      }));
  }),
  js = I('$ZodPipe', (e, n) => {
    (ce.init(e, n),
      re(e._zod, 'values', () => n.in._zod.values),
      re(e._zod, 'optin', () => n.in._zod.optin),
      re(e._zod, 'optout', () => n.out._zod.optout),
      re(e._zod, 'propValues', () => n.in._zod.propValues),
      (e._zod.parse = (i, a) => {
        if (a.direction === 'backward') {
          const m = n.out._zod.run(i, a);
          return m instanceof Promise ? m.then((d) => Vn(d, n.in, a)) : Vn(m, n.in, a);
        }
        const l = n.in._zod.run(i, a);
        return l instanceof Promise ? l.then((m) => Vn(m, n.out, a)) : Vn(l, n.out, a);
      }));
  });
function Vn(e, n, i) {
  return e.issues.length
    ? ((e.aborted = !0), e)
    : n._zod.run({ value: e.value, issues: e.issues }, i);
}
const Cs = I('$ZodReadonly', (e, n) => {
  (ce.init(e, n),
    re(e._zod, 'propValues', () => n.innerType._zod.propValues),
    re(e._zod, 'values', () => n.innerType._zod.values),
    re(e._zod, 'optin', () => n.innerType._zod.optin),
    re(e._zod, 'optout', () => n.innerType._zod.optout),
    (e._zod.parse = (i, a) => {
      if (a.direction === 'backward') return n.innerType._zod.run(i, a);
      const l = n.innerType._zod.run(i, a);
      return l instanceof Promise ? l.then(Qo) : Qo(l);
    }));
});
function Qo(e) {
  return ((e.value = Object.freeze(e.value)), e);
}
const Ds = I('$ZodCustom', (e, n) => {
  (Se.init(e, n),
    ce.init(e, n),
    (e._zod.parse = (i, a) => i),
    (e._zod.check = (i) => {
      const a = i.value,
        l = n.fn(a);
      if (l instanceof Promise) return l.then((m) => Ho(m, i, a, e));
      Ho(l, i, a, e);
    }));
});
function Ho(e, n, i, a) {
  if (!e) {
    const l = {
      code: 'custom',
      input: i,
      inst: a,
      path: [...(a._zod.def.path ?? [])],
      continue: !a._zod.def.abort,
    };
    (a._zod.def.params && (l.params = a._zod.def.params), n.issues.push(dn(l)));
  }
}
class Rs {
  constructor() {
    ((this._map = new Map()), (this._idmap = new Map()));
  }
  add(n, ...i) {
    const a = i[0];
    if ((this._map.set(n, a), a && typeof a == 'object' && 'id' in a)) {
      if (this._idmap.has(a.id)) throw new Error(`ID ${a.id} already exists in the registry`);
      this._idmap.set(a.id, n);
    }
    return this;
  }
  clear() {
    return ((this._map = new Map()), (this._idmap = new Map()), this);
  }
  remove(n) {
    const i = this._map.get(n);
    return (
      i && typeof i == 'object' && 'id' in i && this._idmap.delete(i.id),
      this._map.delete(n),
      this
    );
  }
  get(n) {
    const i = n._zod.parent;
    if (i) {
      const a = { ...(this.get(i) ?? {}) };
      delete a.id;
      const l = { ...a, ...this._map.get(n) };
      return Object.keys(l).length ? l : void 0;
    }
    return this._map.get(n);
  }
  has(n) {
    return this._map.has(n);
  }
}
function Ns() {
  return new Rs();
}
const Wn = Ns();
function Ks(e, n) {
  return new e({ type: 'string', ...F(n) });
}
function Bs(e, n) {
  return new e({ type: 'string', format: 'email', check: 'string_format', abort: !1, ...F(n) });
}
function ei(e, n) {
  return new e({ type: 'string', format: 'guid', check: 'string_format', abort: !1, ...F(n) });
}
function Fs(e, n) {
  return new e({ type: 'string', format: 'uuid', check: 'string_format', abort: !1, ...F(n) });
}
function qs(e, n) {
  return new e({
    type: 'string',
    format: 'uuid',
    check: 'string_format',
    abort: !1,
    version: 'v4',
    ...F(n),
  });
}
function Ms(e, n) {
  return new e({
    type: 'string',
    format: 'uuid',
    check: 'string_format',
    abort: !1,
    version: 'v6',
    ...F(n),
  });
}
function Us(e, n) {
  return new e({
    type: 'string',
    format: 'uuid',
    check: 'string_format',
    abort: !1,
    version: 'v7',
    ...F(n),
  });
}
function Ls(e, n) {
  return new e({ type: 'string', format: 'url', check: 'string_format', abort: !1, ...F(n) });
}
function Vs(e, n) {
  return new e({ type: 'string', format: 'emoji', check: 'string_format', abort: !1, ...F(n) });
}
function Ws(e, n) {
  return new e({ type: 'string', format: 'nanoid', check: 'string_format', abort: !1, ...F(n) });
}
function Ys(e, n) {
  return new e({ type: 'string', format: 'cuid', check: 'string_format', abort: !1, ...F(n) });
}
function Gs(e, n) {
  return new e({ type: 'string', format: 'cuid2', check: 'string_format', abort: !1, ...F(n) });
}
function Js(e, n) {
  return new e({ type: 'string', format: 'ulid', check: 'string_format', abort: !1, ...F(n) });
}
function Xs(e, n) {
  return new e({ type: 'string', format: 'xid', check: 'string_format', abort: !1, ...F(n) });
}
function Qs(e, n) {
  return new e({ type: 'string', format: 'ksuid', check: 'string_format', abort: !1, ...F(n) });
}
function Hs(e, n) {
  return new e({ type: 'string', format: 'ipv4', check: 'string_format', abort: !1, ...F(n) });
}
function ec(e, n) {
  return new e({ type: 'string', format: 'ipv6', check: 'string_format', abort: !1, ...F(n) });
}
function tc(e, n) {
  return new e({ type: 'string', format: 'cidrv4', check: 'string_format', abort: !1, ...F(n) });
}
function nc(e, n) {
  return new e({ type: 'string', format: 'cidrv6', check: 'string_format', abort: !1, ...F(n) });
}
function rc(e, n) {
  return new e({ type: 'string', format: 'base64', check: 'string_format', abort: !1, ...F(n) });
}
function oc(e, n) {
  return new e({ type: 'string', format: 'base64url', check: 'string_format', abort: !1, ...F(n) });
}
function ic(e, n) {
  return new e({ type: 'string', format: 'e164', check: 'string_format', abort: !1, ...F(n) });
}
function uc(e, n) {
  return new e({ type: 'string', format: 'jwt', check: 'string_format', abort: !1, ...F(n) });
}
function ac(e, n) {
  return new e({
    type: 'string',
    format: 'datetime',
    check: 'string_format',
    offset: !1,
    local: !1,
    precision: null,
    ...F(n),
  });
}
function sc(e, n) {
  return new e({ type: 'string', format: 'date', check: 'string_format', ...F(n) });
}
function cc(e, n) {
  return new e({
    type: 'string',
    format: 'time',
    check: 'string_format',
    precision: null,
    ...F(n),
  });
}
function lc(e, n) {
  return new e({ type: 'string', format: 'duration', check: 'string_format', ...F(n) });
}
function fc(e, n) {
  return new e({ type: 'number', checks: [], ...F(n) });
}
function hc(e, n) {
  return new e({ type: 'number', check: 'number_format', abort: !1, format: 'safeint', ...F(n) });
}
function dc(e, n) {
  return new e({ type: 'boolean', ...F(n) });
}
function pc(e) {
  return new e({ type: 'unknown' });
}
function mc(e, n) {
  return new e({ type: 'never', ...F(n) });
}
function ti(e, n) {
  return new ki({ check: 'less_than', ...F(n), value: e, inclusive: !1 });
}
function Fr(e, n) {
  return new ki({ check: 'less_than', ...F(n), value: e, inclusive: !0 });
}
function ni(e, n) {
  return new xi({ check: 'greater_than', ...F(n), value: e, inclusive: !1 });
}
function qr(e, n) {
  return new xi({ check: 'greater_than', ...F(n), value: e, inclusive: !0 });
}
function ri(e, n) {
  return new Aa({ check: 'multiple_of', ...F(n), value: e });
}
function Si(e, n) {
  return new Ta({ check: 'max_length', ...F(n), maximum: e });
}
function er(e, n) {
  return new $a({ check: 'min_length', ...F(n), minimum: e });
}
function Ii(e, n) {
  return new ja({ check: 'length_equals', ...F(n), length: e });
}
function vc(e, n) {
  return new Ca({ check: 'string_format', format: 'regex', ...F(n), pattern: e });
}
function yc(e) {
  return new Da({ check: 'string_format', format: 'lowercase', ...F(e) });
}
function gc(e) {
  return new Ra({ check: 'string_format', format: 'uppercase', ...F(e) });
}
function bc(e, n) {
  return new Na({ check: 'string_format', format: 'includes', ...F(n), includes: e });
}
function _c(e, n) {
  return new Ka({ check: 'string_format', format: 'starts_with', ...F(n), prefix: e });
}
function wc(e, n) {
  return new Ba({ check: 'string_format', format: 'ends_with', ...F(n), suffix: e });
}
function pn(e) {
  return new Fa({ check: 'overwrite', tx: e });
}
function kc(e) {
  return pn((n) => n.normalize(e));
}
function xc() {
  return pn((e) => e.trim());
}
function zc() {
  return pn((e) => e.toLowerCase());
}
function Ec() {
  return pn((e) => e.toUpperCase());
}
function Oc(e, n, i) {
  return new e({ type: 'array', element: n, ...F(i) });
}
function Pc(e, n, i) {
  return new e({ type: 'custom', check: 'custom', fn: n, ...F(i) });
}
function Sc(e) {
  const n = Ic(
    (i) => (
      (i.addIssue = (a) => {
        if (typeof a == 'string') i.issues.push(dn(a, i.value, n._zod.def));
        else {
          const l = a;
          (l.fatal && (l.continue = !1),
            l.code ?? (l.code = 'custom'),
            l.input ?? (l.input = i.value),
            l.inst ?? (l.inst = n),
            l.continue ?? (l.continue = !n._zod.def.abort),
            i.issues.push(dn(l)));
        }
      }),
      e(i.value, i)
    ),
  );
  return n;
}
function Ic(e, n) {
  const i = new Se({ check: 'custom', ...F(n) });
  return ((i._zod.check = e), i);
}
const Ac = I('ZodISODateTime', (e, n) => {
  (ts.init(e, n), le.init(e, n));
});
function Zc(e) {
  return ac(Ac, e);
}
const Tc = I('ZodISODate', (e, n) => {
  (ns.init(e, n), le.init(e, n));
});
function $c(e) {
  return sc(Tc, e);
}
const jc = I('ZodISOTime', (e, n) => {
  (rs.init(e, n), le.init(e, n));
});
function Cc(e) {
  return cc(jc, e);
}
const Dc = I('ZodISODuration', (e, n) => {
  (os.init(e, n), le.init(e, n));
});
function Rc(e) {
  return lc(Dc, e);
}
const Nc = (e, n) => {
    (vi.init(e, n),
      (e.name = 'ZodError'),
      Object.defineProperties(e, {
        format: { value: (i) => Vu(e, i) },
        flatten: { value: (i) => Lu(e, i) },
        addIssue: {
          value: (i) => {
            (e.issues.push(i), (e.message = JSON.stringify(e.issues, Ur, 2)));
          },
        },
        addIssues: {
          value: (i) => {
            (e.issues.push(...i), (e.message = JSON.stringify(e.issues, Ur, 2)));
          },
        },
        isEmpty: {
          get() {
            return e.issues.length === 0;
          },
        },
      }));
  },
  Re = I('ZodError', Nc, { Parent: Error }),
  Kc = Hr(Re),
  Bc = eo(Re),
  Fc = tr(Re),
  qc = nr(Re),
  Mc = Gu(Re),
  Uc = Ju(Re),
  Lc = Xu(Re),
  Vc = Qu(Re),
  Wc = Hu(Re),
  Yc = ea(Re),
  Gc = ta(Re),
  Jc = na(Re),
  de = I(
    'ZodType',
    (e, n) => (
      ce.init(e, n),
      (e.def = n),
      (e.type = n.type),
      Object.defineProperty(e, '_def', { value: n }),
      (e.check = (...i) =>
        e.clone({
          ...n,
          checks: [
            ...(n.checks ?? []),
            ...i.map((a) =>
              typeof a == 'function'
                ? { _zod: { check: a, def: { check: 'custom' }, onattach: [] } }
                : a,
            ),
          ],
        })),
      (e.clone = (i, a) => dt(e, i, a)),
      (e.brand = () => e),
      (e.register = (i, a) => (i.add(e, a), e)),
      (e.parse = (i, a) => Kc(e, i, a, { callee: e.parse })),
      (e.safeParse = (i, a) => Fc(e, i, a)),
      (e.parseAsync = async (i, a) => Bc(e, i, a, { callee: e.parseAsync })),
      (e.safeParseAsync = async (i, a) => qc(e, i, a)),
      (e.spa = e.safeParseAsync),
      (e.encode = (i, a) => Mc(e, i, a)),
      (e.decode = (i, a) => Uc(e, i, a)),
      (e.encodeAsync = async (i, a) => Lc(e, i, a)),
      (e.decodeAsync = async (i, a) => Vc(e, i, a)),
      (e.safeEncode = (i, a) => Wc(e, i, a)),
      (e.safeDecode = (i, a) => Yc(e, i, a)),
      (e.safeEncodeAsync = async (i, a) => Gc(e, i, a)),
      (e.safeDecodeAsync = async (i, a) => Jc(e, i, a)),
      (e.refine = (i, a) => e.check(Ul(i, a))),
      (e.superRefine = (i) => e.check(Ll(i))),
      (e.overwrite = (i) => e.check(pn(i))),
      (e.optional = () => ui(e)),
      (e.nullable = () => ai(e)),
      (e.nullish = () => ui(ai(e))),
      (e.nonoptional = (i) => Rl(e, i)),
      (e.array = () => no(e)),
      (e.or = (i) => zl([e, i])),
      (e.and = (i) => Ol(e, i)),
      (e.transform = (i) => si(e, Zl(i))),
      (e.default = (i) => jl(e, i)),
      (e.prefault = (i) => Dl(e, i)),
      (e.catch = (i) => Kl(e, i)),
      (e.pipe = (i) => si(e, i)),
      (e.readonly = () => ql(e)),
      (e.describe = (i) => {
        const a = e.clone();
        return (Wn.add(a, { description: i }), a);
      }),
      Object.defineProperty(e, 'description', {
        get() {
          return Wn.get(e)?.description;
        },
        configurable: !0,
      }),
      (e.meta = (...i) => {
        if (i.length === 0) return Wn.get(e);
        const a = e.clone();
        return (Wn.add(a, i[0]), a);
      }),
      (e.isOptional = () => e.safeParse(void 0).success),
      (e.isNullable = () => e.safeParse(null).success),
      e
    ),
  ),
  Ai = I('_ZodString', (e, n) => {
    (to.init(e, n), de.init(e, n));
    const i = e._zod.bag;
    ((e.format = i.format ?? null),
      (e.minLength = i.minimum ?? null),
      (e.maxLength = i.maximum ?? null),
      (e.regex = (...a) => e.check(vc(...a))),
      (e.includes = (...a) => e.check(bc(...a))),
      (e.startsWith = (...a) => e.check(_c(...a))),
      (e.endsWith = (...a) => e.check(wc(...a))),
      (e.min = (...a) => e.check(er(...a))),
      (e.max = (...a) => e.check(Si(...a))),
      (e.length = (...a) => e.check(Ii(...a))),
      (e.nonempty = (...a) => e.check(er(1, ...a))),
      (e.lowercase = (a) => e.check(yc(a))),
      (e.uppercase = (a) => e.check(gc(a))),
      (e.trim = () => e.check(xc())),
      (e.normalize = (...a) => e.check(kc(...a))),
      (e.toLowerCase = () => e.check(zc())),
      (e.toUpperCase = () => e.check(Ec())));
  }),
  Xc = I('ZodString', (e, n) => {
    (to.init(e, n),
      Ai.init(e, n),
      (e.email = (i) => e.check(Bs(Qc, i))),
      (e.url = (i) => e.check(Ls(Hc, i))),
      (e.jwt = (i) => e.check(uc(pl, i))),
      (e.emoji = (i) => e.check(Vs(el, i))),
      (e.guid = (i) => e.check(ei(oi, i))),
      (e.uuid = (i) => e.check(Fs(Yn, i))),
      (e.uuidv4 = (i) => e.check(qs(Yn, i))),
      (e.uuidv6 = (i) => e.check(Ms(Yn, i))),
      (e.uuidv7 = (i) => e.check(Us(Yn, i))),
      (e.nanoid = (i) => e.check(Ws(tl, i))),
      (e.guid = (i) => e.check(ei(oi, i))),
      (e.cuid = (i) => e.check(Ys(nl, i))),
      (e.cuid2 = (i) => e.check(Gs(rl, i))),
      (e.ulid = (i) => e.check(Js(ol, i))),
      (e.base64 = (i) => e.check(rc(fl, i))),
      (e.base64url = (i) => e.check(oc(hl, i))),
      (e.xid = (i) => e.check(Xs(il, i))),
      (e.ksuid = (i) => e.check(Qs(ul, i))),
      (e.ipv4 = (i) => e.check(Hs(al, i))),
      (e.ipv6 = (i) => e.check(ec(sl, i))),
      (e.cidrv4 = (i) => e.check(tc(cl, i))),
      (e.cidrv6 = (i) => e.check(nc(ll, i))),
      (e.e164 = (i) => e.check(ic(dl, i))),
      (e.datetime = (i) => e.check(Zc(i))),
      (e.date = (i) => e.check($c(i))),
      (e.time = (i) => e.check(Cc(i))),
      (e.duration = (i) => e.check(Rc(i))));
  });
function Ve(e) {
  return Ks(Xc, e);
}
const le = I('ZodStringFormat', (e, n) => {
    (ue.init(e, n), Ai.init(e, n));
  }),
  Qc = I('ZodEmail', (e, n) => {
    (Va.init(e, n), le.init(e, n));
  }),
  oi = I('ZodGUID', (e, n) => {
    (Ua.init(e, n), le.init(e, n));
  }),
  Yn = I('ZodUUID', (e, n) => {
    (La.init(e, n), le.init(e, n));
  }),
  Hc = I('ZodURL', (e, n) => {
    (Wa.init(e, n), le.init(e, n));
  }),
  el = I('ZodEmoji', (e, n) => {
    (Ya.init(e, n), le.init(e, n));
  }),
  tl = I('ZodNanoID', (e, n) => {
    (Ga.init(e, n), le.init(e, n));
  }),
  nl = I('ZodCUID', (e, n) => {
    (Ja.init(e, n), le.init(e, n));
  }),
  rl = I('ZodCUID2', (e, n) => {
    (Xa.init(e, n), le.init(e, n));
  }),
  ol = I('ZodULID', (e, n) => {
    (Qa.init(e, n), le.init(e, n));
  }),
  il = I('ZodXID', (e, n) => {
    (Ha.init(e, n), le.init(e, n));
  }),
  ul = I('ZodKSUID', (e, n) => {
    (es.init(e, n), le.init(e, n));
  }),
  al = I('ZodIPv4', (e, n) => {
    (is.init(e, n), le.init(e, n));
  }),
  sl = I('ZodIPv6', (e, n) => {
    (us.init(e, n), le.init(e, n));
  }),
  cl = I('ZodCIDRv4', (e, n) => {
    (as.init(e, n), le.init(e, n));
  }),
  ll = I('ZodCIDRv6', (e, n) => {
    (ss.init(e, n), le.init(e, n));
  }),
  fl = I('ZodBase64', (e, n) => {
    (cs.init(e, n), le.init(e, n));
  }),
  hl = I('ZodBase64URL', (e, n) => {
    (fs.init(e, n), le.init(e, n));
  }),
  dl = I('ZodE164', (e, n) => {
    (hs.init(e, n), le.init(e, n));
  }),
  pl = I('ZodJWT', (e, n) => {
    (ps.init(e, n), le.init(e, n));
  }),
  Zi = I('ZodNumber', (e, n) => {
    (Ei.init(e, n),
      de.init(e, n),
      (e.gt = (a, l) => e.check(ni(a, l))),
      (e.gte = (a, l) => e.check(qr(a, l))),
      (e.min = (a, l) => e.check(qr(a, l))),
      (e.lt = (a, l) => e.check(ti(a, l))),
      (e.lte = (a, l) => e.check(Fr(a, l))),
      (e.max = (a, l) => e.check(Fr(a, l))),
      (e.int = (a) => e.check(ii(a))),
      (e.safe = (a) => e.check(ii(a))),
      (e.positive = (a) => e.check(ni(0, a))),
      (e.nonnegative = (a) => e.check(qr(0, a))),
      (e.negative = (a) => e.check(ti(0, a))),
      (e.nonpositive = (a) => e.check(Fr(0, a))),
      (e.multipleOf = (a, l) => e.check(ri(a, l))),
      (e.step = (a, l) => e.check(ri(a, l))),
      (e.finite = () => e));
    const i = e._zod.bag;
    ((e.minValue =
      Math.max(
        i.minimum ?? Number.NEGATIVE_INFINITY,
        i.exclusiveMinimum ?? Number.NEGATIVE_INFINITY,
      ) ?? null),
      (e.maxValue =
        Math.min(
          i.maximum ?? Number.POSITIVE_INFINITY,
          i.exclusiveMaximum ?? Number.POSITIVE_INFINITY,
        ) ?? null),
      (e.isInt = (i.format ?? '').includes('int') || Number.isSafeInteger(i.multipleOf ?? 0.5)),
      (e.isFinite = !0),
      (e.format = i.format ?? null));
  });
function se(e) {
  return fc(Zi, e);
}
const ml = I('ZodNumberFormat', (e, n) => {
  (ms.init(e, n), Zi.init(e, n));
});
function ii(e) {
  return hc(ml, e);
}
const vl = I('ZodBoolean', (e, n) => {
  (vs.init(e, n), de.init(e, n));
});
function yl(e) {
  return dc(vl, e);
}
const gl = I('ZodUnknown', (e, n) => {
  (ys.init(e, n), de.init(e, n));
});
function Vr() {
  return pc(gl);
}
const bl = I('ZodNever', (e, n) => {
  (gs.init(e, n), de.init(e, n));
});
function _l(e) {
  return mc(bl, e);
}
const wl = I('ZodArray', (e, n) => {
  (bs.init(e, n),
    de.init(e, n),
    (e.element = n.element),
    (e.min = (i, a) => e.check(er(i, a))),
    (e.nonempty = (i) => e.check(er(1, i))),
    (e.max = (i, a) => e.check(Si(i, a))),
    (e.length = (i, a) => e.check(Ii(i, a))),
    (e.unwrap = () => e.element));
});
function no(e, n) {
  return Oc(wl, e, n);
}
const kl = I('ZodObject', (e, n) => {
  (ws.init(e, n),
    de.init(e, n),
    re(e, 'shape', () => n.shape),
    (e.keyof = () => Yr(Object.keys(e._zod.def.shape))),
    (e.catchall = (i) => e.clone({ ...e._zod.def, catchall: i })),
    (e.passthrough = () => e.clone({ ...e._zod.def, catchall: Vr() })),
    (e.loose = () => e.clone({ ...e._zod.def, catchall: Vr() })),
    (e.strict = () => e.clone({ ...e._zod.def, catchall: _l() })),
    (e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 })),
    (e.extend = (i) => Bu(e, i)),
    (e.safeExtend = (i) => Fu(e, i)),
    (e.merge = (i) => qu(e, i)),
    (e.pick = (i) => Nu(e, i)),
    (e.omit = (i) => Ku(e, i)),
    (e.partial = (...i) => Mu(Ti, e, i[0])),
    (e.required = (...i) => Uu($i, e, i[0])));
});
function Ie(e, n) {
  const i = {
    type: 'object',
    get shape() {
      return (ht(this, 'shape', e ? $u(e) : {}), this.shape);
    },
    ...F(n),
  };
  return new kl(i);
}
const xl = I('ZodUnion', (e, n) => {
  (ks.init(e, n), de.init(e, n), (e.options = n.options));
});
function zl(e, n) {
  return new xl({ type: 'union', options: e, ...F(n) });
}
const El = I('ZodIntersection', (e, n) => {
  (xs.init(e, n), de.init(e, n));
});
function Ol(e, n) {
  return new El({ type: 'intersection', left: e, right: n });
}
const Pl = I('ZodRecord', (e, n) => {
  (zs.init(e, n), de.init(e, n), (e.keyType = n.keyType), (e.valueType = n.valueType));
});
function Sl(e, n, i) {
  return new Pl({ type: 'record', keyType: e, valueType: n, ...F(i) });
}
const Wr = I('ZodEnum', (e, n) => {
  (Es.init(e, n), de.init(e, n), (e.enum = n.entries), (e.options = Object.values(n.entries)));
  const i = new Set(Object.keys(n.entries));
  ((e.extract = (a, l) => {
    const m = {};
    for (const d of a)
      if (i.has(d)) m[d] = n.entries[d];
      else throw new Error(`Key ${d} not found in enum`);
    return new Wr({ ...n, checks: [], ...F(l), entries: m });
  }),
    (e.exclude = (a, l) => {
      const m = { ...n.entries };
      for (const d of a)
        if (i.has(d)) delete m[d];
        else throw new Error(`Key ${d} not found in enum`);
      return new Wr({ ...n, checks: [], ...F(l), entries: m });
    }));
});
function Yr(e, n) {
  const i = Array.isArray(e) ? Object.fromEntries(e.map((a) => [a, a])) : e;
  return new Wr({ type: 'enum', entries: i, ...F(n) });
}
const Il = I('ZodLiteral', (e, n) => {
  (Os.init(e, n),
    de.init(e, n),
    (e.values = new Set(n.values)),
    Object.defineProperty(e, 'value', {
      get() {
        if (n.values.length > 1)
          throw new Error(
            'This schema contains multiple valid literal values. Use `.values` instead.',
          );
        return n.values[0];
      },
    }));
});
function or(e, n) {
  return new Il({ type: 'literal', values: Array.isArray(e) ? e : [e], ...F(n) });
}
const Al = I('ZodTransform', (e, n) => {
  (Ps.init(e, n),
    de.init(e, n),
    (e._zod.parse = (i, a) => {
      if (a.direction === 'backward') throw new fi(e.constructor.name);
      i.addIssue = (m) => {
        if (typeof m == 'string') i.issues.push(dn(m, i.value, n));
        else {
          const d = m;
          (d.fatal && (d.continue = !1),
            d.code ?? (d.code = 'custom'),
            d.input ?? (d.input = i.value),
            d.inst ?? (d.inst = e),
            i.issues.push(dn(d)));
        }
      };
      const l = n.transform(i.value, i);
      return l instanceof Promise ? l.then((m) => ((i.value = m), i)) : ((i.value = l), i);
    }));
});
function Zl(e) {
  return new Al({ type: 'transform', transform: e });
}
const Ti = I('ZodOptional', (e, n) => {
  (Ss.init(e, n), de.init(e, n), (e.unwrap = () => e._zod.def.innerType));
});
function ui(e) {
  return new Ti({ type: 'optional', innerType: e });
}
const Tl = I('ZodNullable', (e, n) => {
  (Is.init(e, n), de.init(e, n), (e.unwrap = () => e._zod.def.innerType));
});
function ai(e) {
  return new Tl({ type: 'nullable', innerType: e });
}
const $l = I('ZodDefault', (e, n) => {
  (As.init(e, n),
    de.init(e, n),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeDefault = e.unwrap));
});
function jl(e, n) {
  return new $l({
    type: 'default',
    innerType: e,
    get defaultValue() {
      return typeof n == 'function' ? n() : pi(n);
    },
  });
}
const Cl = I('ZodPrefault', (e, n) => {
  (Zs.init(e, n), de.init(e, n), (e.unwrap = () => e._zod.def.innerType));
});
function Dl(e, n) {
  return new Cl({
    type: 'prefault',
    innerType: e,
    get defaultValue() {
      return typeof n == 'function' ? n() : pi(n);
    },
  });
}
const $i = I('ZodNonOptional', (e, n) => {
  (Ts.init(e, n), de.init(e, n), (e.unwrap = () => e._zod.def.innerType));
});
function Rl(e, n) {
  return new $i({ type: 'nonoptional', innerType: e, ...F(n) });
}
const Nl = I('ZodCatch', (e, n) => {
  ($s.init(e, n),
    de.init(e, n),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeCatch = e.unwrap));
});
function Kl(e, n) {
  return new Nl({ type: 'catch', innerType: e, catchValue: typeof n == 'function' ? n : () => n });
}
const Bl = I('ZodPipe', (e, n) => {
  (js.init(e, n), de.init(e, n), (e.in = n.in), (e.out = n.out));
});
function si(e, n) {
  return new Bl({ type: 'pipe', in: e, out: n });
}
const Fl = I('ZodReadonly', (e, n) => {
  (Cs.init(e, n), de.init(e, n), (e.unwrap = () => e._zod.def.innerType));
});
function ql(e) {
  return new Fl({ type: 'readonly', innerType: e });
}
const Ml = I('ZodCustom', (e, n) => {
  (Ds.init(e, n), de.init(e, n));
});
function Ul(e, n = {}) {
  return Pc(Ml, e, n);
}
function Ll(e) {
  return Sc(e);
}
const Vl = Ie({ lastSimWallClock: se().int().min(0), bgCoveredMs: se().int().min(0) }),
  Wl = Ie({ land: se().int().min(0), ward: se().int().min(0), distanceM: se().int().min(0) }),
  Yl = Ie({ arcana: se().int().min(0), gold: se().int().min(0) }),
  Gl = Ie({ firepower: se().int().min(0), scales: se().int().min(0), tier: se().int().min(0) }),
  Jl = Ie({
    playtimeS: se().int().min(0),
    deaths: se().int().min(0),
    totalDistanceM: se().int().min(0),
  }),
  Xl = Ie({ highestWard: se().int().min(0), fastestBossS: se().int().min(0) }),
  ji = Ie({
    id: Ve().min(1),
    name: Ve().min(1).max(50),
    createdAt: se().int().min(0),
    lastActive: se().int().min(0),
    progress: Wl,
    currencies: Yl,
    enchants: Gl,
    stats: Jl,
    leaderboard: Xl,
    sim: Vl,
  }),
  Ci = Ie({ a11yReducedMotion: yl() }),
  Di = Ie({ version: or(1), profiles: no(ji).min(1).max(6), settings: Ci });
Ie({ version: or(1), profiles: no(ji).min(0).max(6), settings: Ci });
Ie({
  id: se().int().positive().optional(),
  profileId: Ve().min(1),
  version: or(1),
  data: Di,
  createdAt: se().int().min(0),
  checksum: Ve().min(1),
});
Ie({ key: Ve().min(1), value: Ve(), updatedAt: se().int().min(0) });
Ie({
  id: se().int().positive().optional(),
  timestamp: se().int().min(0),
  level: Yr(['debug', 'info', 'warn', 'error']),
  source: Yr(['ui', 'worker', 'render', 'net']),
  message: Ve().min(1),
  data: Sl(Ve(), Vr()).optional(),
  profileId: Ve().min(1).optional(),
});
Ie({ fileVersion: or(1), exportedAt: se().int().min(0), checksum: Ve().min(1), data: Di });
function Ql(e = 1e3, n = 1e4) {
  let i = [],
    a = null;
  const l = async () => {
    const A = i;
    if (((i = []), !A.length)) return;
    const C = A.map((U) => ({
      timestamp: U.t,
      level: U.lvl,
      source: U.src,
      message: U.msg,
      data: U.data,
      profileId: U.profileId,
    }));
    await hn.logs.bulkAdd(C);
    const M = await hn.logs.count();
    if (M > n) {
      const U = M - n,
        W = await hn.logs.orderBy('id').limit(U).toArray();
      await hn.logs.bulkDelete(W.map((J) => J.id));
    }
  };
  function m() {
    a ||
      (a = setTimeout(async () => {
        a = null;
        try {
          await l();
        } catch {}
      }, e));
  }
  function d(A) {
    (i.push(A), m());
  }
  async function E() {
    ((i = []), a && (clearTimeout(a), (a = null)), await hn.logs.clear());
  }
  return (
    typeof window < 'u' &&
      window.addEventListener(
        'beforeunload',
        () => {
          l();
        },
        { once: !0 },
      ),
    { enqueue: d, clear: E }
  );
}
const ci = Su({ maxBytes: 2 * 1024 * 1024, maxEntries: 1e4, devConsole: !1, dexie: Ql(1e3, 1e4) });
function Hl(e) {
  let n,
    i,
    a = 'Logging Perf Lab',
    l,
    m,
    d,
    E,
    A,
    C,
    M,
    U,
    W,
    J,
    Y,
    ae,
    Ee,
    pt,
    Oe,
    _e,
    pe,
    Ze,
    be,
    we = 'Export NDJSON',
    St,
    Te,
    It,
    mt,
    We,
    $e,
    Wt,
    Ye = e[2] ? 'yes' : 'no',
    et,
    Yt,
    Ke;
  return {
    c() {
      ((n = De('div')),
        (i = De('h3')),
        (i.textContent = a),
        (l = Bt()),
        (m = De('div')),
        (d = De('label')),
        (E = Le('Rate (logs/sec) ')),
        (A = De('input')),
        (C = Bt()),
        (M = De('label')),
        (U = Le('Duration (s) ')),
        (W = De('input')),
        (J = Bt()),
        (Y = De('div')),
        (ae = De('button')),
        (Ee = Le('Start')),
        (pt = Bt()),
        (Oe = De('button')),
        (_e = Le('Stop')),
        (Ze = Bt()),
        (be = De('button')),
        (be.textContent = we),
        (St = Bt()),
        (Te = De('div')),
        (It = Le('Produced: ')),
        (mt = Le(e[3])),
        (We = Le(' Dropped: ')),
        ($e = Le(e[4])),
        (Wt = Le(' Running: ')),
        (et = Le(Ye)),
        this.h());
    },
    l(fe) {
      n = Ce(fe, 'DIV', { style: !0 });
      var ee = ct(n);
      ((i = Ce(ee, 'H3', { 'data-svelte-h': !0 })),
        Bo(i) !== 'svelte-1uzt7vn' && (i.textContent = a),
        (l = Kt(ee)),
        (m = Ce(ee, 'DIV', { style: !0 })));
      var tt = ct(m);
      d = Ce(tt, 'LABEL', {});
      var Gt = ct(d);
      ((E = Ue(Gt, 'Rate (logs/sec) ')),
        (A = Ce(Gt, 'INPUT', { type: !0, min: !0, max: !0 })),
        Gt.forEach(He),
        (C = Kt(tt)),
        (M = Ce(tt, 'LABEL', {})));
      var Be = ct(M);
      ((U = Ue(Be, 'Duration (s) ')),
        (W = Ce(Be, 'INPUT', { type: !0, min: !0, max: !0 })),
        Be.forEach(He),
        tt.forEach(He),
        (J = Kt(ee)),
        (Y = Ce(ee, 'DIV', { style: !0 })));
      var Ge = ct(Y);
      ae = Ce(Ge, 'BUTTON', {});
      var vt = ct(ae);
      ((Ee = Ue(vt, 'Start')), vt.forEach(He), (pt = Kt(Ge)), (Oe = Ce(Ge, 'BUTTON', {})));
      var Je = ct(Oe);
      ((_e = Ue(Je, 'Stop')),
        Je.forEach(He),
        (Ze = Kt(Ge)),
        (be = Ce(Ge, 'BUTTON', { 'data-svelte-h': !0 })),
        Bo(be) !== 'svelte-ghayiv' && (be.textContent = we),
        Ge.forEach(He),
        (St = Kt(ee)),
        (Te = Ce(ee, 'DIV', {})));
      var Ne = ct(Te);
      ((It = Ue(Ne, 'Produced: ')),
        (mt = Ue(Ne, e[3])),
        (We = Ue(Ne, ' Dropped: ')),
        ($e = Ue(Ne, e[4])),
        (Wt = Ue(Ne, ' Running: ')),
        (et = Ue(Ne, Ye)),
        Ne.forEach(He),
        ee.forEach(He),
        this.h());
    },
    h() {
      (Nt(A, 'type', 'number'),
        Nt(A, 'min', '10'),
        Nt(A, 'max', '10000'),
        Nt(W, 'type', 'number'),
        Nt(W, 'min', '1'),
        Nt(W, 'max', '30'),
        Un(m, 'margin-bottom', '16px'),
        (ae.disabled = e[2]),
        (Oe.disabled = pe = !e[2]),
        Un(Y, 'margin-bottom', '16px'),
        Un(n, 'padding', '12px'),
        Un(n, 'font', '14px system-ui'));
    },
    m(fe, ee) {
      (wu(fe, n, ee),
        ne(n, i),
        ne(n, l),
        ne(n, m),
        ne(m, d),
        ne(d, E),
        ne(d, A),
        Mn(A, e[0]),
        ne(m, C),
        ne(m, M),
        ne(M, U),
        ne(M, W),
        Mn(W, e[1]),
        ne(n, J),
        ne(n, Y),
        ne(Y, ae),
        ne(ae, Ee),
        ne(Y, pt),
        ne(Y, Oe),
        ne(Oe, _e),
        ne(Y, Ze),
        ne(Y, be),
        ne(n, St),
        ne(n, Te),
        ne(Te, It),
        ne(Te, mt),
        ne(Te, We),
        ne(Te, $e),
        ne(Te, Wt),
        ne(Te, et),
        Yt ||
          ((Ke = [
            fn(A, 'input', e[8]),
            fn(W, 'input', e[9]),
            fn(ae, 'click', e[5]),
            fn(Oe, 'click', e[6]),
            fn(be, 'click', e[7]),
          ]),
          (Yt = !0)));
    },
    p(fe, [ee]) {
      (ee & 1 && Gn(A.value) !== fe[0] && Mn(A, fe[0]),
        ee & 2 && Gn(W.value) !== fe[1] && Mn(W, fe[1]),
        ee & 4 && (ae.disabled = fe[2]),
        ee & 4 && pe !== (pe = !fe[2]) && (Oe.disabled = pe),
        ee & 8 && Br(mt, fe[3]),
        ee & 16 && Br($e, fe[4]),
        ee & 4 && Ye !== (Ye = fe[2] ? 'yes' : 'no') && Br(et, Ye));
    },
    i: Ko,
    o: Ko,
    d(fe) {
      (fe && He(n), (Yt = !1), yu(Ke));
    },
  };
}
function ef(e, n, i) {
  let a = 100,
    l = 10,
    m = !1,
    d = 0,
    E = 0,
    A;
  function C() {
    (i(2, (m = !0)), i(3, (d = 0)), i(4, (E = 0)), performance.now());
    const Y = 1e3 / a;
    ((A = setInterval(() => {
      for (let Ee = 0; Ee < 1; Ee++) {
        i(3, d++, d);
        try {
          ci.log({ t: Date.now(), lvl: 'info', src: 'ui', msg: 'perf', data: { seq: d } });
        } catch {
          i(4, E++, E);
        }
      }
    }, Y)),
      setTimeout(M, l * 1e3));
  }
  function M() {
    m && (clearInterval(A), i(2, (m = !1)));
  }
  gu(M);
  async function U() {
    const Y = await ci.exportNDJSON(),
      ae = URL.createObjectURL(Y),
      Ee = document.createElement('a');
    ((Ee.href = ae), (Ee.download = 'logs.ndjson'), Ee.click(), URL.revokeObjectURL(ae));
  }
  function W() {
    ((a = Gn(this.value)), i(0, a));
  }
  function J() {
    ((l = Gn(this.value)), i(1, l));
  }
  return [a, l, m, d, E, C, M, U, W, J];
}
class yf extends bu {
  constructor(n) {
    (super(), _u(this, n, ef, Hl, vu, {}));
  }
}
export { yf as component };
