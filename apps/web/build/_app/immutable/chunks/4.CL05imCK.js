const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './browserAll.CS1WFMX-.js',
      './webworkerAll.CiMbRyCo.js',
      './colorToUniform.DmtBy-2V.js',
      './CanvasPool.CztJDevz.js',
      './WebGPURenderer.D745pQs2.js',
      './SharedSystems.CtuG7w6H.js',
      './WebGLRenderer.xknUgyes.js',
    ]),
) => i.map((i) => d[i]);
import { s as pn, n as Vs, r as mn, o as gn, x as xn, b as yn } from './scheduler.eGjx83JH.js';
import {
  S as _n,
  i as bn,
  d as It,
  b as wn,
  a as vn,
  f as V,
  B as Ue,
  s as j,
  c as ft,
  h as Vt,
  k as Ht,
  g as ze,
  j as wt,
  e as pt,
  l as Yt,
  t as vt,
} from './index.anX7KjEx.js';
import { _ as Ee } from './preload-helper.CmsKOCeN.js';
import { g as $i } from './_commonjsHelpers.Cpj98o6Y.js';
var G = ((s) => (
  (s.Application = 'application'),
  (s.WebGLPipes = 'webgl-pipes'),
  (s.WebGLPipesAdaptor = 'webgl-pipes-adaptor'),
  (s.WebGLSystem = 'webgl-system'),
  (s.WebGPUPipes = 'webgpu-pipes'),
  (s.WebGPUPipesAdaptor = 'webgpu-pipes-adaptor'),
  (s.WebGPUSystem = 'webgpu-system'),
  (s.CanvasSystem = 'canvas-system'),
  (s.CanvasPipesAdaptor = 'canvas-pipes-adaptor'),
  (s.CanvasPipes = 'canvas-pipes'),
  (s.Asset = 'asset'),
  (s.LoadParser = 'load-parser'),
  (s.ResolveParser = 'resolve-parser'),
  (s.CacheParser = 'cache-parser'),
  (s.DetectionParser = 'detection-parser'),
  (s.MaskEffect = 'mask-effect'),
  (s.BlendMode = 'blend-mode'),
  (s.TextureSource = 'texture-source'),
  (s.Environment = 'environment'),
  (s.ShapeBuilder = 'shape-builder'),
  (s.Batcher = 'batcher'),
  s
))(G || {});
const ls = (s) => {
    if (typeof s == 'function' || (typeof s == 'object' && s.extension)) {
      if (!s.extension) throw new Error('Extension class must have an extension object');
      s = { ...(typeof s.extension != 'object' ? { type: s.extension } : s.extension), ref: s };
    }
    if (typeof s == 'object') s = { ...s };
    else throw new Error('Invalid extension type');
    return (typeof s.type == 'string' && (s.type = [s.type]), s);
  },
  pe = (s, t) => ls(s).priority ?? t,
  et = {
    _addHandlers: {},
    _removeHandlers: {},
    _queue: {},
    remove(...s) {
      return (
        s.map(ls).forEach((t) => {
          t.type.forEach((e) => this._removeHandlers[e]?.(t));
        }),
        this
      );
    },
    add(...s) {
      return (
        s.map(ls).forEach((t) => {
          t.type.forEach((e) => {
            const i = this._addHandlers,
              r = this._queue;
            i[e] ? i[e]?.(t) : ((r[e] = r[e] || []), r[e]?.push(t));
          });
        }),
        this
      );
    },
    handle(s, t, e) {
      const i = this._addHandlers,
        r = this._removeHandlers;
      if (i[s] || r[s]) throw new Error(`Extension type ${s} already has a handler`);
      ((i[s] = t), (r[s] = e));
      const n = this._queue;
      return (n[s] && (n[s]?.forEach((o) => t(o)), delete n[s]), this);
    },
    handleByMap(s, t) {
      return this.handle(
        s,
        (e) => {
          e.name && (t[e.name] = e.ref);
        },
        (e) => {
          e.name && delete t[e.name];
        },
      );
    },
    handleByNamedList(s, t, e = -1) {
      return this.handle(
        s,
        (i) => {
          t.findIndex((n) => n.name === i.name) >= 0 ||
            (t.push({ name: i.name, value: i.ref }),
            t.sort((n, o) => pe(o.value, e) - pe(n.value, e)));
        },
        (i) => {
          const r = t.findIndex((n) => n.name === i.name);
          r !== -1 && t.splice(r, 1);
        },
      );
    },
    handleByList(s, t, e = -1) {
      return this.handle(
        s,
        (i) => {
          t.includes(i.ref) || (t.push(i.ref), t.sort((r, n) => pe(n, e) - pe(r, e)));
        },
        (i) => {
          const r = t.indexOf(i.ref);
          r !== -1 && t.splice(r, 1);
        },
      );
    },
    mixin(s, ...t) {
      for (const e of t) Object.defineProperties(s.prototype, Object.getOwnPropertyDescriptors(e));
    },
  },
  Cn = {
    extension: { type: G.Environment, name: 'browser', priority: -1 },
    test: () => !0,
    load: async () => {
      await Ee(
        () => import('./browserAll.CS1WFMX-.js'),
        __vite__mapDeps([0, 1, 2, 3]),
        import.meta.url,
      );
    },
  },
  An = {
    extension: { type: G.Environment, name: 'webworker', priority: 0 },
    test: () => typeof self < 'u' && self.WorkerGlobalScope !== void 0,
    load: async () => {
      await Ee(
        () => import('./webworkerAll.CiMbRyCo.js'),
        __vite__mapDeps([1, 2, 3]),
        import.meta.url,
      );
    },
  };
class X {
  constructor(t, e, i) {
    ((this._x = e || 0), (this._y = i || 0), (this._observer = t));
  }
  clone(t) {
    return new X(t ?? this._observer, this._x, this._y);
  }
  set(t = 0, e = t) {
    return (
      (this._x !== t || this._y !== e) &&
        ((this._x = t), (this._y = e), this._observer._onUpdate(this)),
      this
    );
  }
  copyFrom(t) {
    return (
      (this._x !== t.x || this._y !== t.y) &&
        ((this._x = t.x), (this._y = t.y), this._observer._onUpdate(this)),
      this
    );
  }
  copyTo(t) {
    return (t.set(this._x, this._y), t);
  }
  equals(t) {
    return t.x === this._x && t.y === this._y;
  }
  toString() {
    return `[pixi.js/math:ObservablePoint x=${this._x} y=${this._y} scope=${this._observer}]`;
  }
  get x() {
    return this._x;
  }
  set x(t) {
    this._x !== t && ((this._x = t), this._observer._onUpdate(this));
  }
  get y() {
    return this._y;
  }
  set y(t) {
    this._y !== t && ((this._y = t), this._observer._onUpdate(this));
  }
}
var Xi = { exports: {} };
(function (s) {
  var t = Object.prototype.hasOwnProperty,
    e = '~';
  function i() {}
  Object.create && ((i.prototype = Object.create(null)), new i().__proto__ || (e = !1));
  function r(h, l, c) {
    ((this.fn = h), (this.context = l), (this.once = c || !1));
  }
  function n(h, l, c, u, f) {
    if (typeof c != 'function') throw new TypeError('The listener must be a function');
    var d = new r(c, u || h, f),
      m = e ? e + l : l;
    return (
      h._events[m]
        ? h._events[m].fn
          ? (h._events[m] = [h._events[m], d])
          : h._events[m].push(d)
        : ((h._events[m] = d), h._eventsCount++),
      h
    );
  }
  function o(h, l) {
    --h._eventsCount === 0 ? (h._events = new i()) : delete h._events[l];
  }
  function a() {
    ((this._events = new i()), (this._eventsCount = 0));
  }
  ((a.prototype.eventNames = function () {
    var l = [],
      c,
      u;
    if (this._eventsCount === 0) return l;
    for (u in (c = this._events)) t.call(c, u) && l.push(e ? u.slice(1) : u);
    return Object.getOwnPropertySymbols ? l.concat(Object.getOwnPropertySymbols(c)) : l;
  }),
    (a.prototype.listeners = function (l) {
      var c = e ? e + l : l,
        u = this._events[c];
      if (!u) return [];
      if (u.fn) return [u.fn];
      for (var f = 0, d = u.length, m = new Array(d); f < d; f++) m[f] = u[f].fn;
      return m;
    }),
    (a.prototype.listenerCount = function (l) {
      var c = e ? e + l : l,
        u = this._events[c];
      return u ? (u.fn ? 1 : u.length) : 0;
    }),
    (a.prototype.emit = function (l, c, u, f, d, m) {
      var g = e ? e + l : l;
      if (!this._events[g]) return !1;
      var p = this._events[g],
        y = arguments.length,
        x,
        _;
      if (p.fn) {
        switch ((p.once && this.removeListener(l, p.fn, void 0, !0), y)) {
          case 1:
            return (p.fn.call(p.context), !0);
          case 2:
            return (p.fn.call(p.context, c), !0);
          case 3:
            return (p.fn.call(p.context, c, u), !0);
          case 4:
            return (p.fn.call(p.context, c, u, f), !0);
          case 5:
            return (p.fn.call(p.context, c, u, f, d), !0);
          case 6:
            return (p.fn.call(p.context, c, u, f, d, m), !0);
        }
        for (_ = 1, x = new Array(y - 1); _ < y; _++) x[_ - 1] = arguments[_];
        p.fn.apply(p.context, x);
      } else {
        var b = p.length,
          C;
        for (_ = 0; _ < b; _++)
          switch ((p[_].once && this.removeListener(l, p[_].fn, void 0, !0), y)) {
            case 1:
              p[_].fn.call(p[_].context);
              break;
            case 2:
              p[_].fn.call(p[_].context, c);
              break;
            case 3:
              p[_].fn.call(p[_].context, c, u);
              break;
            case 4:
              p[_].fn.call(p[_].context, c, u, f);
              break;
            default:
              if (!x) for (C = 1, x = new Array(y - 1); C < y; C++) x[C - 1] = arguments[C];
              p[_].fn.apply(p[_].context, x);
          }
      }
      return !0;
    }),
    (a.prototype.on = function (l, c, u) {
      return n(this, l, c, u, !1);
    }),
    (a.prototype.once = function (l, c, u) {
      return n(this, l, c, u, !0);
    }),
    (a.prototype.removeListener = function (l, c, u, f) {
      var d = e ? e + l : l;
      if (!this._events[d]) return this;
      if (!c) return (o(this, d), this);
      var m = this._events[d];
      if (m.fn) m.fn === c && (!f || m.once) && (!u || m.context === u) && o(this, d);
      else {
        for (var g = 0, p = [], y = m.length; g < y; g++)
          (m[g].fn !== c || (f && !m[g].once) || (u && m[g].context !== u)) && p.push(m[g]);
        p.length ? (this._events[d] = p.length === 1 ? p[0] : p) : o(this, d);
      }
      return this;
    }),
    (a.prototype.removeAllListeners = function (l) {
      var c;
      return (
        l
          ? ((c = e ? e + l : l), this._events[c] && o(this, c))
          : ((this._events = new i()), (this._eventsCount = 0)),
        this
      );
    }),
    (a.prototype.off = a.prototype.removeListener),
    (a.prototype.addListener = a.prototype.on),
    (a.prefixed = e),
    (a.EventEmitter = a),
    (s.exports = a));
})(Xi);
var Sn = Xi.exports;
const ut = $i(Sn),
  Mn = Math.PI * 2,
  Pn = 180 / Math.PI,
  Tn = Math.PI / 180;
class W {
  constructor(t = 0, e = 0) {
    ((this.x = 0), (this.y = 0), (this.x = t), (this.y = e));
  }
  clone() {
    return new W(this.x, this.y);
  }
  copyFrom(t) {
    return (this.set(t.x, t.y), this);
  }
  copyTo(t) {
    return (t.set(this.x, this.y), t);
  }
  equals(t) {
    return t.x === this.x && t.y === this.y;
  }
  set(t = 0, e = t) {
    return ((this.x = t), (this.y = e), this);
  }
  toString() {
    return `[pixi.js/math:Point x=${this.x} y=${this.y}]`;
  }
  static get shared() {
    return ((Ne.x = 0), (Ne.y = 0), Ne);
  }
}
const Ne = new W();
class I {
  constructor(t = 1, e = 0, i = 0, r = 1, n = 0, o = 0) {
    ((this.array = null),
      (this.a = t),
      (this.b = e),
      (this.c = i),
      (this.d = r),
      (this.tx = n),
      (this.ty = o));
  }
  fromArray(t) {
    ((this.a = t[0]),
      (this.b = t[1]),
      (this.c = t[3]),
      (this.d = t[4]),
      (this.tx = t[2]),
      (this.ty = t[5]));
  }
  set(t, e, i, r, n, o) {
    return (
      (this.a = t),
      (this.b = e),
      (this.c = i),
      (this.d = r),
      (this.tx = n),
      (this.ty = o),
      this
    );
  }
  toArray(t, e) {
    this.array || (this.array = new Float32Array(9));
    const i = e || this.array;
    return (
      t
        ? ((i[0] = this.a),
          (i[1] = this.b),
          (i[2] = 0),
          (i[3] = this.c),
          (i[4] = this.d),
          (i[5] = 0),
          (i[6] = this.tx),
          (i[7] = this.ty),
          (i[8] = 1))
        : ((i[0] = this.a),
          (i[1] = this.c),
          (i[2] = this.tx),
          (i[3] = this.b),
          (i[4] = this.d),
          (i[5] = this.ty),
          (i[6] = 0),
          (i[7] = 0),
          (i[8] = 1)),
      i
    );
  }
  apply(t, e) {
    e = e || new W();
    const i = t.x,
      r = t.y;
    return (
      (e.x = this.a * i + this.c * r + this.tx),
      (e.y = this.b * i + this.d * r + this.ty),
      e
    );
  }
  applyInverse(t, e) {
    e = e || new W();
    const i = this.a,
      r = this.b,
      n = this.c,
      o = this.d,
      a = this.tx,
      h = this.ty,
      l = 1 / (i * o + n * -r),
      c = t.x,
      u = t.y;
    return (
      (e.x = o * l * c + -n * l * u + (h * n - a * o) * l),
      (e.y = i * l * u + -r * l * c + (-h * i + a * r) * l),
      e
    );
  }
  translate(t, e) {
    return ((this.tx += t), (this.ty += e), this);
  }
  scale(t, e) {
    return (
      (this.a *= t),
      (this.d *= e),
      (this.c *= t),
      (this.b *= e),
      (this.tx *= t),
      (this.ty *= e),
      this
    );
  }
  rotate(t) {
    const e = Math.cos(t),
      i = Math.sin(t),
      r = this.a,
      n = this.c,
      o = this.tx;
    return (
      (this.a = r * e - this.b * i),
      (this.b = r * i + this.b * e),
      (this.c = n * e - this.d * i),
      (this.d = n * i + this.d * e),
      (this.tx = o * e - this.ty * i),
      (this.ty = o * i + this.ty * e),
      this
    );
  }
  append(t) {
    const e = this.a,
      i = this.b,
      r = this.c,
      n = this.d;
    return (
      (this.a = t.a * e + t.b * r),
      (this.b = t.a * i + t.b * n),
      (this.c = t.c * e + t.d * r),
      (this.d = t.c * i + t.d * n),
      (this.tx = t.tx * e + t.ty * r + this.tx),
      (this.ty = t.tx * i + t.ty * n + this.ty),
      this
    );
  }
  appendFrom(t, e) {
    const i = t.a,
      r = t.b,
      n = t.c,
      o = t.d,
      a = t.tx,
      h = t.ty,
      l = e.a,
      c = e.b,
      u = e.c,
      f = e.d;
    return (
      (this.a = i * l + r * u),
      (this.b = i * c + r * f),
      (this.c = n * l + o * u),
      (this.d = n * c + o * f),
      (this.tx = a * l + h * u + e.tx),
      (this.ty = a * c + h * f + e.ty),
      this
    );
  }
  setTransform(t, e, i, r, n, o, a, h, l) {
    return (
      (this.a = Math.cos(a + l) * n),
      (this.b = Math.sin(a + l) * n),
      (this.c = -Math.sin(a - h) * o),
      (this.d = Math.cos(a - h) * o),
      (this.tx = t - (i * this.a + r * this.c)),
      (this.ty = e - (i * this.b + r * this.d)),
      this
    );
  }
  prepend(t) {
    const e = this.tx;
    if (t.a !== 1 || t.b !== 0 || t.c !== 0 || t.d !== 1) {
      const i = this.a,
        r = this.c;
      ((this.a = i * t.a + this.b * t.c),
        (this.b = i * t.b + this.b * t.d),
        (this.c = r * t.a + this.d * t.c),
        (this.d = r * t.b + this.d * t.d));
    }
    return (
      (this.tx = e * t.a + this.ty * t.c + t.tx),
      (this.ty = e * t.b + this.ty * t.d + t.ty),
      this
    );
  }
  decompose(t) {
    const e = this.a,
      i = this.b,
      r = this.c,
      n = this.d,
      o = t.pivot,
      a = -Math.atan2(-r, n),
      h = Math.atan2(i, e),
      l = Math.abs(a + h);
    return (
      l < 1e-5 || Math.abs(Mn - l) < 1e-5
        ? ((t.rotation = h), (t.skew.x = t.skew.y = 0))
        : ((t.rotation = 0), (t.skew.x = a), (t.skew.y = h)),
      (t.scale.x = Math.sqrt(e * e + i * i)),
      (t.scale.y = Math.sqrt(r * r + n * n)),
      (t.position.x = this.tx + (o.x * e + o.y * r)),
      (t.position.y = this.ty + (o.x * i + o.y * n)),
      t
    );
  }
  invert() {
    const t = this.a,
      e = this.b,
      i = this.c,
      r = this.d,
      n = this.tx,
      o = t * r - e * i;
    return (
      (this.a = r / o),
      (this.b = -e / o),
      (this.c = -i / o),
      (this.d = t / o),
      (this.tx = (i * this.ty - r * n) / o),
      (this.ty = -(t * this.ty - e * n) / o),
      this
    );
  }
  isIdentity() {
    return (
      this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.tx === 0 && this.ty === 0
    );
  }
  identity() {
    return (
      (this.a = 1),
      (this.b = 0),
      (this.c = 0),
      (this.d = 1),
      (this.tx = 0),
      (this.ty = 0),
      this
    );
  }
  clone() {
    const t = new I();
    return (
      (t.a = this.a),
      (t.b = this.b),
      (t.c = this.c),
      (t.d = this.d),
      (t.tx = this.tx),
      (t.ty = this.ty),
      t
    );
  }
  copyTo(t) {
    return (
      (t.a = this.a),
      (t.b = this.b),
      (t.c = this.c),
      (t.d = this.d),
      (t.tx = this.tx),
      (t.ty = this.ty),
      t
    );
  }
  copyFrom(t) {
    return (
      (this.a = t.a),
      (this.b = t.b),
      (this.c = t.c),
      (this.d = t.d),
      (this.tx = t.tx),
      (this.ty = t.ty),
      this
    );
  }
  equals(t) {
    return (
      t.a === this.a &&
      t.b === this.b &&
      t.c === this.c &&
      t.d === this.d &&
      t.tx === this.tx &&
      t.ty === this.ty
    );
  }
  toString() {
    return `[pixi.js:Matrix a=${this.a} b=${this.b} c=${this.c} d=${this.d} tx=${this.tx} ty=${this.ty}]`;
  }
  static get IDENTITY() {
    return In.identity();
  }
  static get shared() {
    return kn.identity();
  }
}
const kn = new I(),
  In = new I(),
  At = [1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1],
  St = [0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1],
  Mt = [0, -1, -1, -1, 0, 1, 1, 1, 0, 1, 1, 1, 0, -1, -1, -1],
  Pt = [1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, 1, 1, 1, 0, -1],
  cs = [],
  Wi = [],
  me = Math.sign;
function En() {
  for (let s = 0; s < 16; s++) {
    const t = [];
    cs.push(t);
    for (let e = 0; e < 16; e++) {
      const i = me(At[s] * At[e] + Mt[s] * St[e]),
        r = me(St[s] * At[e] + Pt[s] * St[e]),
        n = me(At[s] * Mt[e] + Mt[s] * Pt[e]),
        o = me(St[s] * Mt[e] + Pt[s] * Pt[e]);
      for (let a = 0; a < 16; a++)
        if (At[a] === i && St[a] === r && Mt[a] === n && Pt[a] === o) {
          t.push(a);
          break;
        }
    }
  }
  for (let s = 0; s < 16; s++) {
    const t = new I();
    (t.set(At[s], St[s], Mt[s], Pt[s], 0, 0), Wi.push(t));
  }
}
En();
const B = {
    E: 0,
    SE: 1,
    S: 2,
    SW: 3,
    W: 4,
    NW: 5,
    N: 6,
    NE: 7,
    MIRROR_VERTICAL: 8,
    MAIN_DIAGONAL: 10,
    MIRROR_HORIZONTAL: 12,
    REVERSE_DIAGONAL: 14,
    uX: (s) => At[s],
    uY: (s) => St[s],
    vX: (s) => Mt[s],
    vY: (s) => Pt[s],
    inv: (s) => (s & 8 ? s & 15 : -s & 7),
    add: (s, t) => cs[s][t],
    sub: (s, t) => cs[s][B.inv(t)],
    rotate180: (s) => s ^ 4,
    isVertical: (s) => (s & 3) === 2,
    byDirection: (s, t) =>
      Math.abs(s) * 2 <= Math.abs(t)
        ? t >= 0
          ? B.S
          : B.N
        : Math.abs(t) * 2 <= Math.abs(s)
          ? s > 0
            ? B.E
            : B.W
          : t > 0
            ? s > 0
              ? B.SE
              : B.SW
            : s > 0
              ? B.NE
              : B.NW,
    matrixAppendRotationInv: (s, t, e = 0, i = 0) => {
      const r = Wi[B.inv(t)];
      ((r.tx = e), (r.ty = i), s.append(r));
    },
    transformRectCoords: (s, t, e, i) => {
      const { x: r, y: n, width: o, height: a } = s,
        { x: h, y: l, width: c, height: u } = t;
      return e === B.E
        ? (i.set(r + h, n + l, o, a), i)
        : e === B.S
          ? i.set(c - n - a + h, r + l, a, o)
          : e === B.W
            ? i.set(c - r - o + h, u - n - a + l, o, a)
            : e === B.N
              ? i.set(n + h, u - r - o + l, a, o)
              : i.set(r + h, n + l, o, a);
    },
  },
  ge = [new W(), new W(), new W(), new W()];
class $ {
  constructor(t = 0, e = 0, i = 0, r = 0) {
    ((this.type = 'rectangle'),
      (this.x = Number(t)),
      (this.y = Number(e)),
      (this.width = Number(i)),
      (this.height = Number(r)));
  }
  get left() {
    return this.x;
  }
  get right() {
    return this.x + this.width;
  }
  get top() {
    return this.y;
  }
  get bottom() {
    return this.y + this.height;
  }
  isEmpty() {
    return this.left === this.right || this.top === this.bottom;
  }
  static get EMPTY() {
    return new $(0, 0, 0, 0);
  }
  clone() {
    return new $(this.x, this.y, this.width, this.height);
  }
  copyFromBounds(t) {
    return (
      (this.x = t.minX),
      (this.y = t.minY),
      (this.width = t.maxX - t.minX),
      (this.height = t.maxY - t.minY),
      this
    );
  }
  copyFrom(t) {
    return ((this.x = t.x), (this.y = t.y), (this.width = t.width), (this.height = t.height), this);
  }
  copyTo(t) {
    return (t.copyFrom(this), t);
  }
  contains(t, e) {
    return this.width <= 0 || this.height <= 0
      ? !1
      : t >= this.x && t < this.x + this.width && e >= this.y && e < this.y + this.height;
  }
  strokeContains(t, e, i, r = 0.5) {
    const { width: n, height: o } = this;
    if (n <= 0 || o <= 0) return !1;
    const a = this.x,
      h = this.y,
      l = i * (1 - r),
      c = i - l,
      u = a - l,
      f = a + n + l,
      d = h - l,
      m = h + o + l,
      g = a + c,
      p = a + n - c,
      y = h + c,
      x = h + o - c;
    return t >= u && t <= f && e >= d && e <= m && !(t > g && t < p && e > y && e < x);
  }
  intersects(t, e) {
    if (!e) {
      const T = this.x < t.x ? t.x : this.x;
      if ((this.right > t.right ? t.right : this.right) <= T) return !1;
      const A = this.y < t.y ? t.y : this.y;
      return (this.bottom > t.bottom ? t.bottom : this.bottom) > A;
    }
    const i = this.left,
      r = this.right,
      n = this.top,
      o = this.bottom;
    if (r <= i || o <= n) return !1;
    const a = ge[0].set(t.left, t.top),
      h = ge[1].set(t.left, t.bottom),
      l = ge[2].set(t.right, t.top),
      c = ge[3].set(t.right, t.bottom);
    if (l.x <= a.x || h.y <= a.y) return !1;
    const u = Math.sign(e.a * e.d - e.b * e.c);
    if (
      u === 0 ||
      (e.apply(a, a),
      e.apply(h, h),
      e.apply(l, l),
      e.apply(c, c),
      Math.max(a.x, h.x, l.x, c.x) <= i ||
        Math.min(a.x, h.x, l.x, c.x) >= r ||
        Math.max(a.y, h.y, l.y, c.y) <= n ||
        Math.min(a.y, h.y, l.y, c.y) >= o)
    )
      return !1;
    const f = u * (h.y - a.y),
      d = u * (a.x - h.x),
      m = f * i + d * n,
      g = f * r + d * n,
      p = f * i + d * o,
      y = f * r + d * o;
    if (Math.max(m, g, p, y) <= f * a.x + d * a.y || Math.min(m, g, p, y) >= f * c.x + d * c.y)
      return !1;
    const x = u * (a.y - l.y),
      _ = u * (l.x - a.x),
      b = x * i + _ * n,
      C = x * r + _ * n,
      w = x * i + _ * o,
      v = x * r + _ * o;
    return !(
      Math.max(b, C, w, v) <= x * a.x + _ * a.y || Math.min(b, C, w, v) >= x * c.x + _ * c.y
    );
  }
  pad(t = 0, e = t) {
    return ((this.x -= t), (this.y -= e), (this.width += t * 2), (this.height += e * 2), this);
  }
  fit(t) {
    const e = Math.max(this.x, t.x),
      i = Math.min(this.x + this.width, t.x + t.width),
      r = Math.max(this.y, t.y),
      n = Math.min(this.y + this.height, t.y + t.height);
    return (
      (this.x = e),
      (this.width = Math.max(i - e, 0)),
      (this.y = r),
      (this.height = Math.max(n - r, 0)),
      this
    );
  }
  ceil(t = 1, e = 0.001) {
    const i = Math.ceil((this.x + this.width - e) * t) / t,
      r = Math.ceil((this.y + this.height - e) * t) / t;
    return (
      (this.x = Math.floor((this.x + e) * t) / t),
      (this.y = Math.floor((this.y + e) * t) / t),
      (this.width = i - this.x),
      (this.height = r - this.y),
      this
    );
  }
  scale(t, e = t) {
    return ((this.x *= t), (this.y *= e), (this.width *= t), (this.height *= e), this);
  }
  enlarge(t) {
    const e = Math.min(this.x, t.x),
      i = Math.max(this.x + this.width, t.x + t.width),
      r = Math.min(this.y, t.y),
      n = Math.max(this.y + this.height, t.y + t.height);
    return ((this.x = e), (this.width = i - e), (this.y = r), (this.height = n - r), this);
  }
  getBounds(t) {
    return (t || (t = new $()), t.copyFrom(this), t);
  }
  containsRect(t) {
    if (this.width <= 0 || this.height <= 0) return !1;
    const e = t.x,
      i = t.y,
      r = t.x + t.width,
      n = t.y + t.height;
    return (
      e >= this.x &&
      e < this.x + this.width &&
      i >= this.y &&
      i < this.y + this.height &&
      r >= this.x &&
      r < this.x + this.width &&
      n >= this.y &&
      n < this.y + this.height
    );
  }
  set(t, e, i, r) {
    return ((this.x = t), (this.y = e), (this.width = i), (this.height = r), this);
  }
  toString() {
    return `[pixi.js/math:Rectangle x=${this.x} y=${this.y} width=${this.width} height=${this.height}]`;
  }
}
const Oe = { default: -1 };
function O(s = 'default') {
  return (Oe[s] === void 0 && (Oe[s] = -1), ++Oe[s]);
}
const Hs = {},
  H = '8.0.0',
  Rn = '8.3.4';
function F(s, t, e = 3) {
  if (Hs[t]) return;
  let i = new Error().stack;
  (typeof i > 'u'
    ? console.warn(
        'PixiJS Deprecation Warning: ',
        `${t}
Deprecated since v${s}`,
      )
    : ((i = i
        .split(
          `
`,
        )
        .splice(e).join(`
`)),
      console.groupCollapsed
        ? (console.groupCollapsed(
            '%cPixiJS Deprecation Warning: %c%s',
            'color:#614108;background:#fffbe6',
            'font-weight:normal;color:#614108;background:#fffbe6',
            `${t}
Deprecated since v${s}`,
          ),
          console.warn(i),
          console.groupEnd())
        : (console.warn(
            'PixiJS Deprecation Warning: ',
            `${t}
Deprecated since v${s}`,
          ),
          console.warn(i))),
    (Hs[t] = !0));
}
const ji = () => {};
function Ys(s) {
  return (
    (s += s === 0 ? 1 : 0),
    --s,
    (s |= s >>> 1),
    (s |= s >>> 2),
    (s |= s >>> 4),
    (s |= s >>> 8),
    (s |= s >>> 16),
    s + 1
  );
}
function $s(s) {
  return !(s & (s - 1)) && !!s;
}
function qi(s) {
  const t = {};
  for (const e in s) s[e] !== void 0 && (t[e] = s[e]);
  return t;
}
const Xs = Object.create(null);
function Gn(s) {
  const t = Xs[s];
  return (t === void 0 && (Xs[s] = O('resource')), t);
}
const Zi = class Ki extends ut {
  constructor(t = {}) {
    (super(),
      (this._resourceType = 'textureSampler'),
      (this._touched = 0),
      (this._maxAnisotropy = 1),
      (this.destroyed = !1),
      (t = { ...Ki.defaultOptions, ...t }),
      (this.addressMode = t.addressMode),
      (this.addressModeU = t.addressModeU ?? this.addressModeU),
      (this.addressModeV = t.addressModeV ?? this.addressModeV),
      (this.addressModeW = t.addressModeW ?? this.addressModeW),
      (this.scaleMode = t.scaleMode),
      (this.magFilter = t.magFilter ?? this.magFilter),
      (this.minFilter = t.minFilter ?? this.minFilter),
      (this.mipmapFilter = t.mipmapFilter ?? this.mipmapFilter),
      (this.lodMinClamp = t.lodMinClamp),
      (this.lodMaxClamp = t.lodMaxClamp),
      (this.compare = t.compare),
      (this.maxAnisotropy = t.maxAnisotropy ?? 1));
  }
  set addressMode(t) {
    ((this.addressModeU = t), (this.addressModeV = t), (this.addressModeW = t));
  }
  get addressMode() {
    return this.addressModeU;
  }
  set wrapMode(t) {
    (F(H, 'TextureStyle.wrapMode is now TextureStyle.addressMode'), (this.addressMode = t));
  }
  get wrapMode() {
    return this.addressMode;
  }
  set scaleMode(t) {
    ((this.magFilter = t), (this.minFilter = t), (this.mipmapFilter = t));
  }
  get scaleMode() {
    return this.magFilter;
  }
  set maxAnisotropy(t) {
    ((this._maxAnisotropy = Math.min(t, 16)),
      this._maxAnisotropy > 1 && (this.scaleMode = 'linear'));
  }
  get maxAnisotropy() {
    return this._maxAnisotropy;
  }
  get _resourceId() {
    return this._sharedResourceId || this._generateResourceId();
  }
  update() {
    (this.emit('change', this), (this._sharedResourceId = null));
  }
  _generateResourceId() {
    const t = `${this.addressModeU}-${this.addressModeV}-${this.addressModeW}-${this.magFilter}-${this.minFilter}-${this.mipmapFilter}-${this.lodMinClamp}-${this.lodMaxClamp}-${this.compare}-${this._maxAnisotropy}`;
    return ((this._sharedResourceId = Gn(t)), this._resourceId);
  }
  destroy() {
    ((this.destroyed = !0),
      this.emit('destroy', this),
      this.emit('change', this),
      this.removeAllListeners());
  }
};
Zi.defaultOptions = { addressMode: 'clamp-to-edge', scaleMode: 'linear' };
let Qi = Zi;
const Ji = class tr extends ut {
  constructor(t = {}) {
    (super(),
      (this.options = t),
      (this.uid = O('textureSource')),
      (this._resourceType = 'textureSource'),
      (this._resourceId = O('resource')),
      (this.uploadMethodId = 'unknown'),
      (this._resolution = 1),
      (this.pixelWidth = 1),
      (this.pixelHeight = 1),
      (this.width = 1),
      (this.height = 1),
      (this.sampleCount = 1),
      (this.mipLevelCount = 1),
      (this.autoGenerateMipmaps = !1),
      (this.format = 'rgba8unorm'),
      (this.dimension = '2d'),
      (this.antialias = !1),
      (this._touched = 0),
      (this._batchTick = -1),
      (this._textureBindLocation = -1),
      (t = { ...tr.defaultOptions, ...t }),
      (this.label = t.label ?? ''),
      (this.resource = t.resource),
      (this.autoGarbageCollect = t.autoGarbageCollect),
      (this._resolution = t.resolution),
      t.width
        ? (this.pixelWidth = t.width * this._resolution)
        : (this.pixelWidth = this.resource ? (this.resourceWidth ?? 1) : 1),
      t.height
        ? (this.pixelHeight = t.height * this._resolution)
        : (this.pixelHeight = this.resource ? (this.resourceHeight ?? 1) : 1),
      (this.width = this.pixelWidth / this._resolution),
      (this.height = this.pixelHeight / this._resolution),
      (this.format = t.format),
      (this.dimension = t.dimensions),
      (this.mipLevelCount = t.mipLevelCount),
      (this.autoGenerateMipmaps = t.autoGenerateMipmaps),
      (this.sampleCount = t.sampleCount),
      (this.antialias = t.antialias),
      (this.alphaMode = t.alphaMode),
      (this.style = new Qi(qi(t))),
      (this.destroyed = !1),
      this._refreshPOT());
  }
  get source() {
    return this;
  }
  get style() {
    return this._style;
  }
  set style(t) {
    this.style !== t &&
      (this._style?.off('change', this._onStyleChange, this),
      (this._style = t),
      this._style?.on('change', this._onStyleChange, this),
      this._onStyleChange());
  }
  set maxAnisotropy(t) {
    this._style.maxAnisotropy = t;
  }
  get maxAnisotropy() {
    return this._style.maxAnisotropy;
  }
  get addressMode() {
    return this._style.addressMode;
  }
  set addressMode(t) {
    this._style.addressMode = t;
  }
  get repeatMode() {
    return this._style.addressMode;
  }
  set repeatMode(t) {
    this._style.addressMode = t;
  }
  get magFilter() {
    return this._style.magFilter;
  }
  set magFilter(t) {
    this._style.magFilter = t;
  }
  get minFilter() {
    return this._style.minFilter;
  }
  set minFilter(t) {
    this._style.minFilter = t;
  }
  get mipmapFilter() {
    return this._style.mipmapFilter;
  }
  set mipmapFilter(t) {
    this._style.mipmapFilter = t;
  }
  get lodMinClamp() {
    return this._style.lodMinClamp;
  }
  set lodMinClamp(t) {
    this._style.lodMinClamp = t;
  }
  get lodMaxClamp() {
    return this._style.lodMaxClamp;
  }
  set lodMaxClamp(t) {
    this._style.lodMaxClamp = t;
  }
  _onStyleChange() {
    this.emit('styleChange', this);
  }
  update() {
    if (this.resource) {
      const t = this._resolution;
      if (this.resize(this.resourceWidth / t, this.resourceHeight / t)) return;
    }
    this.emit('update', this);
  }
  destroy() {
    ((this.destroyed = !0),
      this.emit('destroy', this),
      this.emit('change', this),
      this._style && (this._style.destroy(), (this._style = null)),
      (this.uploadMethodId = null),
      (this.resource = null),
      this.removeAllListeners());
  }
  unload() {
    ((this._resourceId = O('resource')), this.emit('change', this), this.emit('unload', this));
  }
  get resourceWidth() {
    const { resource: t } = this;
    return t.naturalWidth || t.videoWidth || t.displayWidth || t.width;
  }
  get resourceHeight() {
    const { resource: t } = this;
    return t.naturalHeight || t.videoHeight || t.displayHeight || t.height;
  }
  get resolution() {
    return this._resolution;
  }
  set resolution(t) {
    this._resolution !== t &&
      ((this._resolution = t),
      (this.width = this.pixelWidth / t),
      (this.height = this.pixelHeight / t));
  }
  resize(t, e, i) {
    (i || (i = this._resolution), t || (t = this.width), e || (e = this.height));
    const r = Math.round(t * i),
      n = Math.round(e * i);
    return (
      (this.width = r / i),
      (this.height = n / i),
      (this._resolution = i),
      this.pixelWidth === r && this.pixelHeight === n
        ? !1
        : (this._refreshPOT(),
          (this.pixelWidth = r),
          (this.pixelHeight = n),
          this.emit('resize', this),
          (this._resourceId = O('resource')),
          this.emit('change', this),
          !0)
    );
  }
  updateMipmaps() {
    this.autoGenerateMipmaps && this.mipLevelCount > 1 && this.emit('updateMipmaps', this);
  }
  set wrapMode(t) {
    this._style.wrapMode = t;
  }
  get wrapMode() {
    return this._style.wrapMode;
  }
  set scaleMode(t) {
    this._style.scaleMode = t;
  }
  get scaleMode() {
    return this._style.scaleMode;
  }
  _refreshPOT() {
    this.isPowerOfTwo = $s(this.pixelWidth) && $s(this.pixelHeight);
  }
  static test(t) {
    throw new Error('Unimplemented');
  }
};
Ji.defaultOptions = {
  resolution: 1,
  format: 'bgra8unorm',
  alphaMode: 'premultiply-alpha-on-upload',
  dimensions: '2d',
  mipLevelCount: 1,
  autoGenerateMipmaps: !1,
  sampleCount: 1,
  antialias: !1,
  autoGarbageCollect: !1,
};
let rt = Ji;
class Ps extends rt {
  constructor(t) {
    const e = t.resource || new Float32Array(t.width * t.height * 4);
    let i = t.format;
    (i ||
      (e instanceof Float32Array
        ? (i = 'rgba32float')
        : e instanceof Int32Array || e instanceof Uint32Array
          ? (i = 'rgba32uint')
          : e instanceof Int16Array || e instanceof Uint16Array
            ? (i = 'rgba16uint')
            : (e instanceof Int8Array, (i = 'bgra8unorm'))),
      super({ ...t, resource: e, format: i }),
      (this.uploadMethodId = 'buffer'));
  }
  static test(t) {
    return (
      t instanceof Int8Array ||
      t instanceof Uint8Array ||
      t instanceof Uint8ClampedArray ||
      t instanceof Int16Array ||
      t instanceof Uint16Array ||
      t instanceof Int32Array ||
      t instanceof Uint32Array ||
      t instanceof Float32Array
    );
  }
}
Ps.extension = G.TextureSource;
const Ws = new I();
class Bn {
  constructor(t, e) {
    ((this.mapCoord = new I()),
      (this.uClampFrame = new Float32Array(4)),
      (this.uClampOffset = new Float32Array(2)),
      (this._textureID = -1),
      (this._updateID = 0),
      (this.clampOffset = 0),
      typeof e > 'u' ? (this.clampMargin = t.width < 10 ? 0 : 0.5) : (this.clampMargin = e),
      (this.isSimple = !1),
      (this.texture = t));
  }
  get texture() {
    return this._texture;
  }
  set texture(t) {
    this.texture !== t &&
      (this._texture?.removeListener('update', this.update, this),
      (this._texture = t),
      this._texture.addListener('update', this.update, this),
      this.update());
  }
  multiplyUvs(t, e) {
    e === void 0 && (e = t);
    const i = this.mapCoord;
    for (let r = 0; r < t.length; r += 2) {
      const n = t[r],
        o = t[r + 1];
      ((e[r] = n * i.a + o * i.c + i.tx), (e[r + 1] = n * i.b + o * i.d + i.ty));
    }
    return e;
  }
  update() {
    const t = this._texture;
    this._updateID++;
    const e = t.uvs;
    this.mapCoord.set(e.x1 - e.x0, e.y1 - e.y0, e.x3 - e.x0, e.y3 - e.y0, e.x0, e.y0);
    const i = t.orig,
      r = t.trim;
    r &&
      (Ws.set(i.width / r.width, 0, 0, i.height / r.height, -r.x / r.width, -r.y / r.height),
      this.mapCoord.append(Ws));
    const n = t.source,
      o = this.uClampFrame,
      a = this.clampMargin / n._resolution,
      h = this.clampOffset / n._resolution;
    return (
      (o[0] = (t.frame.x + a + h) / n.width),
      (o[1] = (t.frame.y + a + h) / n.height),
      (o[2] = (t.frame.x + t.frame.width - a + h) / n.width),
      (o[3] = (t.frame.y + t.frame.height - a + h) / n.height),
      (this.uClampOffset[0] = this.clampOffset / n.pixelWidth),
      (this.uClampOffset[1] = this.clampOffset / n.pixelHeight),
      (this.isSimple = t.frame.width === n.width && t.frame.height === n.height && t.rotate === 0),
      !0
    );
  }
}
class D extends ut {
  constructor({
    source: t,
    label: e,
    frame: i,
    orig: r,
    trim: n,
    defaultAnchor: o,
    defaultBorders: a,
    rotate: h,
    dynamic: l,
  } = {}) {
    if (
      (super(),
      (this.uid = O('texture')),
      (this.uvs = { x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 }),
      (this.frame = new $()),
      (this.noFrame = !1),
      (this.dynamic = !1),
      (this.isTexture = !0),
      (this.label = e),
      (this.source = t?.source ?? new rt()),
      (this.noFrame = !i),
      i)
    )
      this.frame.copyFrom(i);
    else {
      const { width: c, height: u } = this._source;
      ((this.frame.width = c), (this.frame.height = u));
    }
    ((this.orig = r || this.frame),
      (this.trim = n),
      (this.rotate = h ?? 0),
      (this.defaultAnchor = o),
      (this.defaultBorders = a),
      (this.destroyed = !1),
      (this.dynamic = l || !1),
      this.updateUvs());
  }
  set source(t) {
    (this._source && this._source.off('resize', this.update, this),
      (this._source = t),
      t.on('resize', this.update, this),
      this.emit('update', this));
  }
  get source() {
    return this._source;
  }
  get textureMatrix() {
    return (this._textureMatrix || (this._textureMatrix = new Bn(this)), this._textureMatrix);
  }
  get width() {
    return this.orig.width;
  }
  get height() {
    return this.orig.height;
  }
  updateUvs() {
    const { uvs: t, frame: e } = this,
      { width: i, height: r } = this._source,
      n = e.x / i,
      o = e.y / r,
      a = e.width / i,
      h = e.height / r;
    let l = this.rotate;
    if (l) {
      const c = a / 2,
        u = h / 2,
        f = n + c,
        d = o + u;
      ((l = B.add(l, B.NW)),
        (t.x0 = f + c * B.uX(l)),
        (t.y0 = d + u * B.uY(l)),
        (l = B.add(l, 2)),
        (t.x1 = f + c * B.uX(l)),
        (t.y1 = d + u * B.uY(l)),
        (l = B.add(l, 2)),
        (t.x2 = f + c * B.uX(l)),
        (t.y2 = d + u * B.uY(l)),
        (l = B.add(l, 2)),
        (t.x3 = f + c * B.uX(l)),
        (t.y3 = d + u * B.uY(l)));
    } else
      ((t.x0 = n),
        (t.y0 = o),
        (t.x1 = n + a),
        (t.y1 = o),
        (t.x2 = n + a),
        (t.y2 = o + h),
        (t.x3 = n),
        (t.y3 = o + h));
  }
  destroy(t = !1) {
    (this._source && t && (this._source.destroy(), (this._source = null)),
      (this._textureMatrix = null),
      (this.destroyed = !0),
      this.emit('destroy', this),
      this.removeAllListeners());
  }
  update() {
    (this.noFrame &&
      ((this.frame.width = this._source.width), (this.frame.height = this._source.height)),
      this.updateUvs(),
      this.emit('update', this));
  }
  get baseTexture() {
    return (F(H, 'Texture.baseTexture is now Texture.source'), this._source);
  }
}
D.EMPTY = new D({ label: 'EMPTY', source: new rt({ label: 'EMPTY' }) });
D.EMPTY.destroy = ji;
D.WHITE = new D({
  source: new Ps({
    resource: new Uint8Array([255, 255, 255, 255]),
    width: 1,
    height: 1,
    alphaMode: 'premultiply-alpha-on-upload',
    label: 'WHITE',
  }),
  label: 'WHITE',
});
D.WHITE.destroy = ji;
function Fn(s, t, e) {
  const { width: i, height: r } = e.orig,
    n = e.trim;
  if (n) {
    const o = n.width,
      a = n.height;
    ((s.minX = n.x - t._x * i),
      (s.maxX = s.minX + o),
      (s.minY = n.y - t._y * r),
      (s.maxY = s.minY + a));
  } else ((s.minX = -t._x * i), (s.maxX = s.minX + i), (s.minY = -t._y * r), (s.maxY = s.minY + r));
}
const js = new I();
class it {
  constructor(t = 1 / 0, e = 1 / 0, i = -1 / 0, r = -1 / 0) {
    ((this.minX = 1 / 0),
      (this.minY = 1 / 0),
      (this.maxX = -1 / 0),
      (this.maxY = -1 / 0),
      (this.matrix = js),
      (this.minX = t),
      (this.minY = e),
      (this.maxX = i),
      (this.maxY = r));
  }
  isEmpty() {
    return this.minX > this.maxX || this.minY > this.maxY;
  }
  get rectangle() {
    this._rectangle || (this._rectangle = new $());
    const t = this._rectangle;
    return (
      this.minX > this.maxX || this.minY > this.maxY
        ? ((t.x = 0), (t.y = 0), (t.width = 0), (t.height = 0))
        : t.copyFromBounds(this),
      t
    );
  }
  clear() {
    return (
      (this.minX = 1 / 0),
      (this.minY = 1 / 0),
      (this.maxX = -1 / 0),
      (this.maxY = -1 / 0),
      (this.matrix = js),
      this
    );
  }
  set(t, e, i, r) {
    ((this.minX = t), (this.minY = e), (this.maxX = i), (this.maxY = r));
  }
  addFrame(t, e, i, r, n) {
    n || (n = this.matrix);
    const o = n.a,
      a = n.b,
      h = n.c,
      l = n.d,
      c = n.tx,
      u = n.ty;
    let f = this.minX,
      d = this.minY,
      m = this.maxX,
      g = this.maxY,
      p = o * t + h * e + c,
      y = a * t + l * e + u;
    (p < f && (f = p),
      y < d && (d = y),
      p > m && (m = p),
      y > g && (g = y),
      (p = o * i + h * e + c),
      (y = a * i + l * e + u),
      p < f && (f = p),
      y < d && (d = y),
      p > m && (m = p),
      y > g && (g = y),
      (p = o * t + h * r + c),
      (y = a * t + l * r + u),
      p < f && (f = p),
      y < d && (d = y),
      p > m && (m = p),
      y > g && (g = y),
      (p = o * i + h * r + c),
      (y = a * i + l * r + u),
      p < f && (f = p),
      y < d && (d = y),
      p > m && (m = p),
      y > g && (g = y),
      (this.minX = f),
      (this.minY = d),
      (this.maxX = m),
      (this.maxY = g));
  }
  addRect(t, e) {
    this.addFrame(t.x, t.y, t.x + t.width, t.y + t.height, e);
  }
  addBounds(t, e) {
    this.addFrame(t.minX, t.minY, t.maxX, t.maxY, e);
  }
  addBoundsMask(t) {
    ((this.minX = this.minX > t.minX ? this.minX : t.minX),
      (this.minY = this.minY > t.minY ? this.minY : t.minY),
      (this.maxX = this.maxX < t.maxX ? this.maxX : t.maxX),
      (this.maxY = this.maxY < t.maxY ? this.maxY : t.maxY));
  }
  applyMatrix(t) {
    const e = this.minX,
      i = this.minY,
      r = this.maxX,
      n = this.maxY,
      { a: o, b: a, c: h, d: l, tx: c, ty: u } = t;
    let f = o * e + h * i + c,
      d = a * e + l * i + u;
    ((this.minX = f),
      (this.minY = d),
      (this.maxX = f),
      (this.maxY = d),
      (f = o * r + h * i + c),
      (d = a * r + l * i + u),
      (this.minX = f < this.minX ? f : this.minX),
      (this.minY = d < this.minY ? d : this.minY),
      (this.maxX = f > this.maxX ? f : this.maxX),
      (this.maxY = d > this.maxY ? d : this.maxY),
      (f = o * e + h * n + c),
      (d = a * e + l * n + u),
      (this.minX = f < this.minX ? f : this.minX),
      (this.minY = d < this.minY ? d : this.minY),
      (this.maxX = f > this.maxX ? f : this.maxX),
      (this.maxY = d > this.maxY ? d : this.maxY),
      (f = o * r + h * n + c),
      (d = a * r + l * n + u),
      (this.minX = f < this.minX ? f : this.minX),
      (this.minY = d < this.minY ? d : this.minY),
      (this.maxX = f > this.maxX ? f : this.maxX),
      (this.maxY = d > this.maxY ? d : this.maxY));
  }
  fit(t) {
    return (
      this.minX < t.left && (this.minX = t.left),
      this.maxX > t.right && (this.maxX = t.right),
      this.minY < t.top && (this.minY = t.top),
      this.maxY > t.bottom && (this.maxY = t.bottom),
      this
    );
  }
  fitBounds(t, e, i, r) {
    return (
      this.minX < t && (this.minX = t),
      this.maxX > e && (this.maxX = e),
      this.minY < i && (this.minY = i),
      this.maxY > r && (this.maxY = r),
      this
    );
  }
  pad(t, e = t) {
    return ((this.minX -= t), (this.maxX += t), (this.minY -= e), (this.maxY += e), this);
  }
  ceil() {
    return (
      (this.minX = Math.floor(this.minX)),
      (this.minY = Math.floor(this.minY)),
      (this.maxX = Math.ceil(this.maxX)),
      (this.maxY = Math.ceil(this.maxY)),
      this
    );
  }
  clone() {
    return new it(this.minX, this.minY, this.maxX, this.maxY);
  }
  scale(t, e = t) {
    return ((this.minX *= t), (this.minY *= e), (this.maxX *= t), (this.maxY *= e), this);
  }
  get x() {
    return this.minX;
  }
  set x(t) {
    const e = this.maxX - this.minX;
    ((this.minX = t), (this.maxX = t + e));
  }
  get y() {
    return this.minY;
  }
  set y(t) {
    const e = this.maxY - this.minY;
    ((this.minY = t), (this.maxY = t + e));
  }
  get width() {
    return this.maxX - this.minX;
  }
  set width(t) {
    this.maxX = this.minX + t;
  }
  get height() {
    return this.maxY - this.minY;
  }
  set height(t) {
    this.maxY = this.minY + t;
  }
  get left() {
    return this.minX;
  }
  get right() {
    return this.maxX;
  }
  get top() {
    return this.minY;
  }
  get bottom() {
    return this.maxY;
  }
  get isPositive() {
    return this.maxX - this.minX > 0 && this.maxY - this.minY > 0;
  }
  get isValid() {
    return this.minX + this.minY !== 1 / 0;
  }
  addVertexData(t, e, i, r) {
    let n = this.minX,
      o = this.minY,
      a = this.maxX,
      h = this.maxY;
    r || (r = this.matrix);
    const l = r.a,
      c = r.b,
      u = r.c,
      f = r.d,
      d = r.tx,
      m = r.ty;
    for (let g = e; g < i; g += 2) {
      const p = t[g],
        y = t[g + 1],
        x = l * p + u * y + d,
        _ = c * p + f * y + m;
      ((n = x < n ? x : n), (o = _ < o ? _ : o), (a = x > a ? x : a), (h = _ > h ? _ : h));
    }
    ((this.minX = n), (this.minY = o), (this.maxX = a), (this.maxY = h));
  }
  containsPoint(t, e) {
    return this.minX <= t && this.minY <= e && this.maxX >= t && this.maxY >= e;
  }
  toString() {
    return `[pixi.js:Bounds minX=${this.minX} minY=${this.minY} maxX=${this.maxX} maxY=${this.maxY} width=${this.width} height=${this.height}]`;
  }
  copyFrom(t) {
    return (
      (this.minX = t.minX),
      (this.minY = t.minY),
      (this.maxX = t.maxX),
      (this.maxY = t.maxY),
      this
    );
  }
}
var Dn = { grad: 0.9, turn: 360, rad: 360 / (2 * Math.PI) },
  ht = function (s) {
    return typeof s == 'string' ? s.length > 0 : typeof s == 'number';
  },
  Y = function (s, t, e) {
    return (
      t === void 0 && (t = 0),
      e === void 0 && (e = Math.pow(10, t)),
      Math.round(e * s) / e + 0
    );
  },
  J = function (s, t, e) {
    return (t === void 0 && (t = 0), e === void 0 && (e = 1), s > e ? e : s > t ? s : t);
  },
  er = function (s) {
    return (s = isFinite(s) ? s % 360 : 0) > 0 ? s : s + 360;
  },
  qs = function (s) {
    return { r: J(s.r, 0, 255), g: J(s.g, 0, 255), b: J(s.b, 0, 255), a: J(s.a) };
  },
  Ve = function (s) {
    return { r: Y(s.r), g: Y(s.g), b: Y(s.b), a: Y(s.a, 3) };
  },
  Ln = /^#([0-9a-f]{3,8})$/i,
  xe = function (s) {
    var t = s.toString(16);
    return t.length < 2 ? '0' + t : t;
  },
  sr = function (s) {
    var t = s.r,
      e = s.g,
      i = s.b,
      r = s.a,
      n = Math.max(t, e, i),
      o = n - Math.min(t, e, i),
      a = o ? (n === t ? (e - i) / o : n === e ? 2 + (i - t) / o : 4 + (t - e) / o) : 0;
    return { h: 60 * (a < 0 ? a + 6 : a), s: n ? (o / n) * 100 : 0, v: (n / 255) * 100, a: r };
  },
  ir = function (s) {
    var t = s.h,
      e = s.s,
      i = s.v,
      r = s.a;
    ((t = (t / 360) * 6), (e /= 100), (i /= 100));
    var n = Math.floor(t),
      o = i * (1 - e),
      a = i * (1 - (t - n) * e),
      h = i * (1 - (1 - t + n) * e),
      l = n % 6;
    return {
      r: 255 * [i, a, o, o, h, i][l],
      g: 255 * [h, i, i, a, o, o][l],
      b: 255 * [o, o, h, i, i, a][l],
      a: r,
    };
  },
  Zs = function (s) {
    return { h: er(s.h), s: J(s.s, 0, 100), l: J(s.l, 0, 100), a: J(s.a) };
  },
  Ks = function (s) {
    return { h: Y(s.h), s: Y(s.s), l: Y(s.l), a: Y(s.a, 3) };
  },
  Qs = function (s) {
    return ir(
      ((e = (t = s).s),
      {
        h: t.h,
        s: (e *= ((i = t.l) < 50 ? i : 100 - i) / 100) > 0 ? ((2 * e) / (i + e)) * 100 : 0,
        v: i + e,
        a: t.a,
      }),
    );
    var t, e, i;
  },
  ee = function (s) {
    return {
      h: (t = sr(s)).h,
      s:
        (r = ((200 - (e = t.s)) * (i = t.v)) / 100) > 0 && r < 200
          ? ((e * i) / 100 / (r <= 100 ? r : 200 - r)) * 100
          : 0,
      l: r / 2,
      a: t.a,
    };
    var t, e, i, r;
  },
  Un =
    /^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s*,\s*([+-]?\d*\.?\d+)%\s*,\s*([+-]?\d*\.?\d+)%\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,
  zn =
    /^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s+([+-]?\d*\.?\d+)%\s+([+-]?\d*\.?\d+)%\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,
  Nn =
    /^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,
  On =
    /^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,
  us = {
    string: [
      [
        function (s) {
          var t = Ln.exec(s);
          return t
            ? (s = t[1]).length <= 4
              ? {
                  r: parseInt(s[0] + s[0], 16),
                  g: parseInt(s[1] + s[1], 16),
                  b: parseInt(s[2] + s[2], 16),
                  a: s.length === 4 ? Y(parseInt(s[3] + s[3], 16) / 255, 2) : 1,
                }
              : s.length === 6 || s.length === 8
                ? {
                    r: parseInt(s.substr(0, 2), 16),
                    g: parseInt(s.substr(2, 2), 16),
                    b: parseInt(s.substr(4, 2), 16),
                    a: s.length === 8 ? Y(parseInt(s.substr(6, 2), 16) / 255, 2) : 1,
                  }
                : null
            : null;
        },
        'hex',
      ],
      [
        function (s) {
          var t = Nn.exec(s) || On.exec(s);
          return t
            ? t[2] !== t[4] || t[4] !== t[6]
              ? null
              : qs({
                  r: Number(t[1]) / (t[2] ? 100 / 255 : 1),
                  g: Number(t[3]) / (t[4] ? 100 / 255 : 1),
                  b: Number(t[5]) / (t[6] ? 100 / 255 : 1),
                  a: t[7] === void 0 ? 1 : Number(t[7]) / (t[8] ? 100 : 1),
                })
            : null;
        },
        'rgb',
      ],
      [
        function (s) {
          var t = Un.exec(s) || zn.exec(s);
          if (!t) return null;
          var e,
            i,
            r = Zs({
              h: ((e = t[1]), (i = t[2]), i === void 0 && (i = 'deg'), Number(e) * (Dn[i] || 1)),
              s: Number(t[3]),
              l: Number(t[4]),
              a: t[5] === void 0 ? 1 : Number(t[5]) / (t[6] ? 100 : 1),
            });
          return Qs(r);
        },
        'hsl',
      ],
    ],
    object: [
      [
        function (s) {
          var t = s.r,
            e = s.g,
            i = s.b,
            r = s.a,
            n = r === void 0 ? 1 : r;
          return ht(t) && ht(e) && ht(i)
            ? qs({ r: Number(t), g: Number(e), b: Number(i), a: Number(n) })
            : null;
        },
        'rgb',
      ],
      [
        function (s) {
          var t = s.h,
            e = s.s,
            i = s.l,
            r = s.a,
            n = r === void 0 ? 1 : r;
          if (!ht(t) || !ht(e) || !ht(i)) return null;
          var o = Zs({ h: Number(t), s: Number(e), l: Number(i), a: Number(n) });
          return Qs(o);
        },
        'hsl',
      ],
      [
        function (s) {
          var t = s.h,
            e = s.s,
            i = s.v,
            r = s.a,
            n = r === void 0 ? 1 : r;
          if (!ht(t) || !ht(e) || !ht(i)) return null;
          var o = (function (a) {
            return { h: er(a.h), s: J(a.s, 0, 100), v: J(a.v, 0, 100), a: J(a.a) };
          })({ h: Number(t), s: Number(e), v: Number(i), a: Number(n) });
          return ir(o);
        },
        'hsv',
      ],
    ],
  },
  Js = function (s, t) {
    for (var e = 0; e < t.length; e++) {
      var i = t[e][0](s);
      if (i) return [i, t[e][1]];
    }
    return [null, void 0];
  },
  Vn = function (s) {
    return typeof s == 'string'
      ? Js(s.trim(), us.string)
      : typeof s == 'object' && s !== null
        ? Js(s, us.object)
        : [null, void 0];
  },
  He = function (s, t) {
    var e = ee(s);
    return { h: e.h, s: J(e.s + 100 * t, 0, 100), l: e.l, a: e.a };
  },
  Ye = function (s) {
    return (299 * s.r + 587 * s.g + 114 * s.b) / 1e3 / 255;
  },
  ti = function (s, t) {
    var e = ee(s);
    return { h: e.h, s: e.s, l: J(e.l + 100 * t, 0, 100), a: e.a };
  },
  ds = (function () {
    function s(t) {
      ((this.parsed = Vn(t)[0]), (this.rgba = this.parsed || { r: 0, g: 0, b: 0, a: 1 }));
    }
    return (
      (s.prototype.isValid = function () {
        return this.parsed !== null;
      }),
      (s.prototype.brightness = function () {
        return Y(Ye(this.rgba), 2);
      }),
      (s.prototype.isDark = function () {
        return Ye(this.rgba) < 0.5;
      }),
      (s.prototype.isLight = function () {
        return Ye(this.rgba) >= 0.5;
      }),
      (s.prototype.toHex = function () {
        return (
          (t = Ve(this.rgba)),
          (e = t.r),
          (i = t.g),
          (r = t.b),
          (o = (n = t.a) < 1 ? xe(Y(255 * n)) : ''),
          '#' + xe(e) + xe(i) + xe(r) + o
        );
        var t, e, i, r, n, o;
      }),
      (s.prototype.toRgb = function () {
        return Ve(this.rgba);
      }),
      (s.prototype.toRgbString = function () {
        return (
          (t = Ve(this.rgba)),
          (e = t.r),
          (i = t.g),
          (r = t.b),
          (n = t.a) < 1
            ? 'rgba(' + e + ', ' + i + ', ' + r + ', ' + n + ')'
            : 'rgb(' + e + ', ' + i + ', ' + r + ')'
        );
        var t, e, i, r, n;
      }),
      (s.prototype.toHsl = function () {
        return Ks(ee(this.rgba));
      }),
      (s.prototype.toHslString = function () {
        return (
          (t = Ks(ee(this.rgba))),
          (e = t.h),
          (i = t.s),
          (r = t.l),
          (n = t.a) < 1
            ? 'hsla(' + e + ', ' + i + '%, ' + r + '%, ' + n + ')'
            : 'hsl(' + e + ', ' + i + '%, ' + r + '%)'
        );
        var t, e, i, r, n;
      }),
      (s.prototype.toHsv = function () {
        return ((t = sr(this.rgba)), { h: Y(t.h), s: Y(t.s), v: Y(t.v), a: Y(t.a, 3) });
        var t;
      }),
      (s.prototype.invert = function () {
        return nt({ r: 255 - (t = this.rgba).r, g: 255 - t.g, b: 255 - t.b, a: t.a });
        var t;
      }),
      (s.prototype.saturate = function (t) {
        return (t === void 0 && (t = 0.1), nt(He(this.rgba, t)));
      }),
      (s.prototype.desaturate = function (t) {
        return (t === void 0 && (t = 0.1), nt(He(this.rgba, -t)));
      }),
      (s.prototype.grayscale = function () {
        return nt(He(this.rgba, -1));
      }),
      (s.prototype.lighten = function (t) {
        return (t === void 0 && (t = 0.1), nt(ti(this.rgba, t)));
      }),
      (s.prototype.darken = function (t) {
        return (t === void 0 && (t = 0.1), nt(ti(this.rgba, -t)));
      }),
      (s.prototype.rotate = function (t) {
        return (t === void 0 && (t = 15), this.hue(this.hue() + t));
      }),
      (s.prototype.alpha = function (t) {
        return typeof t == 'number'
          ? nt({ r: (e = this.rgba).r, g: e.g, b: e.b, a: t })
          : Y(this.rgba.a, 3);
        var e;
      }),
      (s.prototype.hue = function (t) {
        var e = ee(this.rgba);
        return typeof t == 'number' ? nt({ h: t, s: e.s, l: e.l, a: e.a }) : Y(e.h);
      }),
      (s.prototype.isEqual = function (t) {
        return this.toHex() === nt(t).toHex();
      }),
      s
    );
  })(),
  nt = function (s) {
    return s instanceof ds ? s : new ds(s);
  },
  ei = [],
  Hn = function (s) {
    s.forEach(function (t) {
      ei.indexOf(t) < 0 && (t(ds, us), ei.push(t));
    });
  };
function Yn(s, t) {
  var e = {
      white: '#ffffff',
      bisque: '#ffe4c4',
      blue: '#0000ff',
      cadetblue: '#5f9ea0',
      chartreuse: '#7fff00',
      chocolate: '#d2691e',
      coral: '#ff7f50',
      antiquewhite: '#faebd7',
      aqua: '#00ffff',
      azure: '#f0ffff',
      whitesmoke: '#f5f5f5',
      papayawhip: '#ffefd5',
      plum: '#dda0dd',
      blanchedalmond: '#ffebcd',
      black: '#000000',
      gold: '#ffd700',
      goldenrod: '#daa520',
      gainsboro: '#dcdcdc',
      cornsilk: '#fff8dc',
      cornflowerblue: '#6495ed',
      burlywood: '#deb887',
      aquamarine: '#7fffd4',
      beige: '#f5f5dc',
      crimson: '#dc143c',
      cyan: '#00ffff',
      darkblue: '#00008b',
      darkcyan: '#008b8b',
      darkgoldenrod: '#b8860b',
      darkkhaki: '#bdb76b',
      darkgray: '#a9a9a9',
      darkgreen: '#006400',
      darkgrey: '#a9a9a9',
      peachpuff: '#ffdab9',
      darkmagenta: '#8b008b',
      darkred: '#8b0000',
      darkorchid: '#9932cc',
      darkorange: '#ff8c00',
      darkslateblue: '#483d8b',
      gray: '#808080',
      darkslategray: '#2f4f4f',
      darkslategrey: '#2f4f4f',
      deeppink: '#ff1493',
      deepskyblue: '#00bfff',
      wheat: '#f5deb3',
      firebrick: '#b22222',
      floralwhite: '#fffaf0',
      ghostwhite: '#f8f8ff',
      darkviolet: '#9400d3',
      magenta: '#ff00ff',
      green: '#008000',
      dodgerblue: '#1e90ff',
      grey: '#808080',
      honeydew: '#f0fff0',
      hotpink: '#ff69b4',
      blueviolet: '#8a2be2',
      forestgreen: '#228b22',
      lawngreen: '#7cfc00',
      indianred: '#cd5c5c',
      indigo: '#4b0082',
      fuchsia: '#ff00ff',
      brown: '#a52a2a',
      maroon: '#800000',
      mediumblue: '#0000cd',
      lightcoral: '#f08080',
      darkturquoise: '#00ced1',
      lightcyan: '#e0ffff',
      ivory: '#fffff0',
      lightyellow: '#ffffe0',
      lightsalmon: '#ffa07a',
      lightseagreen: '#20b2aa',
      linen: '#faf0e6',
      mediumaquamarine: '#66cdaa',
      lemonchiffon: '#fffacd',
      lime: '#00ff00',
      khaki: '#f0e68c',
      mediumseagreen: '#3cb371',
      limegreen: '#32cd32',
      mediumspringgreen: '#00fa9a',
      lightskyblue: '#87cefa',
      lightblue: '#add8e6',
      midnightblue: '#191970',
      lightpink: '#ffb6c1',
      mistyrose: '#ffe4e1',
      moccasin: '#ffe4b5',
      mintcream: '#f5fffa',
      lightslategray: '#778899',
      lightslategrey: '#778899',
      navajowhite: '#ffdead',
      navy: '#000080',
      mediumvioletred: '#c71585',
      powderblue: '#b0e0e6',
      palegoldenrod: '#eee8aa',
      oldlace: '#fdf5e6',
      paleturquoise: '#afeeee',
      mediumturquoise: '#48d1cc',
      mediumorchid: '#ba55d3',
      rebeccapurple: '#663399',
      lightsteelblue: '#b0c4de',
      mediumslateblue: '#7b68ee',
      thistle: '#d8bfd8',
      tan: '#d2b48c',
      orchid: '#da70d6',
      mediumpurple: '#9370db',
      purple: '#800080',
      pink: '#ffc0cb',
      skyblue: '#87ceeb',
      springgreen: '#00ff7f',
      palegreen: '#98fb98',
      red: '#ff0000',
      yellow: '#ffff00',
      slateblue: '#6a5acd',
      lavenderblush: '#fff0f5',
      peru: '#cd853f',
      palevioletred: '#db7093',
      violet: '#ee82ee',
      teal: '#008080',
      slategray: '#708090',
      slategrey: '#708090',
      aliceblue: '#f0f8ff',
      darkseagreen: '#8fbc8f',
      darkolivegreen: '#556b2f',
      greenyellow: '#adff2f',
      seagreen: '#2e8b57',
      seashell: '#fff5ee',
      tomato: '#ff6347',
      silver: '#c0c0c0',
      sienna: '#a0522d',
      lavender: '#e6e6fa',
      lightgreen: '#90ee90',
      orange: '#ffa500',
      orangered: '#ff4500',
      steelblue: '#4682b4',
      royalblue: '#4169e1',
      turquoise: '#40e0d0',
      yellowgreen: '#9acd32',
      salmon: '#fa8072',
      saddlebrown: '#8b4513',
      sandybrown: '#f4a460',
      rosybrown: '#bc8f8f',
      darksalmon: '#e9967a',
      lightgoldenrodyellow: '#fafad2',
      snow: '#fffafa',
      lightgrey: '#d3d3d3',
      lightgray: '#d3d3d3',
      dimgray: '#696969',
      dimgrey: '#696969',
      olivedrab: '#6b8e23',
      olive: '#808000',
    },
    i = {};
  for (var r in e) i[e[r]] = r;
  var n = {};
  ((s.prototype.toName = function (o) {
    if (!(this.rgba.a || this.rgba.r || this.rgba.g || this.rgba.b)) return 'transparent';
    var a,
      h,
      l = i[this.toHex()];
    if (l) return l;
    if (o?.closest) {
      var c = this.toRgb(),
        u = 1 / 0,
        f = 'black';
      if (!n.length) for (var d in e) n[d] = new s(e[d]).toRgb();
      for (var m in e) {
        var g =
          ((a = c),
          (h = n[m]),
          Math.pow(a.r - h.r, 2) + Math.pow(a.g - h.g, 2) + Math.pow(a.b - h.b, 2));
        g < u && ((u = g), (f = m));
      }
      return f;
    }
  }),
    t.string.push([
      function (o) {
        var a = o.toLowerCase(),
          h = a === 'transparent' ? '#0000' : e[a];
        return h ? new s(h).toRgb() : null;
      },
      'name',
    ]));
}
Hn([Yn]);
const Bt = class Zt {
  constructor(t = 16777215) {
    ((this._value = null),
      (this._components = new Float32Array(4)),
      this._components.fill(1),
      (this._int = 16777215),
      (this.value = t));
  }
  get red() {
    return this._components[0];
  }
  get green() {
    return this._components[1];
  }
  get blue() {
    return this._components[2];
  }
  get alpha() {
    return this._components[3];
  }
  setValue(t) {
    return ((this.value = t), this);
  }
  set value(t) {
    if (t instanceof Zt)
      ((this._value = this._cloneSource(t._value)),
        (this._int = t._int),
        this._components.set(t._components));
    else {
      if (t === null) throw new Error('Cannot set Color#value to null');
      (this._value === null || !this._isSourceEqual(this._value, t)) &&
        ((this._value = this._cloneSource(t)), this._normalize(this._value));
    }
  }
  get value() {
    return this._value;
  }
  _cloneSource(t) {
    return typeof t == 'string' || typeof t == 'number' || t instanceof Number || t === null
      ? t
      : Array.isArray(t) || ArrayBuffer.isView(t)
        ? t.slice(0)
        : typeof t == 'object' && t !== null
          ? { ...t }
          : t;
  }
  _isSourceEqual(t, e) {
    const i = typeof t;
    if (i !== typeof e) return !1;
    if (i === 'number' || i === 'string' || t instanceof Number) return t === e;
    if ((Array.isArray(t) && Array.isArray(e)) || (ArrayBuffer.isView(t) && ArrayBuffer.isView(e)))
      return t.length !== e.length ? !1 : t.every((n, o) => n === e[o]);
    if (t !== null && e !== null) {
      const n = Object.keys(t),
        o = Object.keys(e);
      return n.length !== o.length ? !1 : n.every((a) => t[a] === e[a]);
    }
    return t === e;
  }
  toRgba() {
    const [t, e, i, r] = this._components;
    return { r: t, g: e, b: i, a: r };
  }
  toRgb() {
    const [t, e, i] = this._components;
    return { r: t, g: e, b: i };
  }
  toRgbaString() {
    const [t, e, i] = this.toUint8RgbArray();
    return `rgba(${t},${e},${i},${this.alpha})`;
  }
  toUint8RgbArray(t) {
    const [e, i, r] = this._components;
    return (
      this._arrayRgb || (this._arrayRgb = []),
      t || (t = this._arrayRgb),
      (t[0] = Math.round(e * 255)),
      (t[1] = Math.round(i * 255)),
      (t[2] = Math.round(r * 255)),
      t
    );
  }
  toArray(t) {
    (this._arrayRgba || (this._arrayRgba = []), t || (t = this._arrayRgba));
    const [e, i, r, n] = this._components;
    return ((t[0] = e), (t[1] = i), (t[2] = r), (t[3] = n), t);
  }
  toRgbArray(t) {
    (this._arrayRgb || (this._arrayRgb = []), t || (t = this._arrayRgb));
    const [e, i, r] = this._components;
    return ((t[0] = e), (t[1] = i), (t[2] = r), t);
  }
  toNumber() {
    return this._int;
  }
  toBgrNumber() {
    const [t, e, i] = this.toUint8RgbArray();
    return (i << 16) + (e << 8) + t;
  }
  toLittleEndianNumber() {
    const t = this._int;
    return (t >> 16) + (t & 65280) + ((t & 255) << 16);
  }
  multiply(t) {
    const [e, i, r, n] = Zt._temp.setValue(t)._components;
    return (
      (this._components[0] *= e),
      (this._components[1] *= i),
      (this._components[2] *= r),
      (this._components[3] *= n),
      this._refreshInt(),
      (this._value = null),
      this
    );
  }
  premultiply(t, e = !0) {
    return (
      e && ((this._components[0] *= t), (this._components[1] *= t), (this._components[2] *= t)),
      (this._components[3] = t),
      this._refreshInt(),
      (this._value = null),
      this
    );
  }
  toPremultiplied(t, e = !0) {
    if (t === 1) return (255 << 24) + this._int;
    if (t === 0) return e ? 0 : this._int;
    let i = (this._int >> 16) & 255,
      r = (this._int >> 8) & 255,
      n = this._int & 255;
    return (
      e && ((i = (i * t + 0.5) | 0), (r = (r * t + 0.5) | 0), (n = (n * t + 0.5) | 0)),
      ((t * 255) << 24) + (i << 16) + (r << 8) + n
    );
  }
  toHex() {
    const t = this._int.toString(16);
    return `#${'000000'.substring(0, 6 - t.length) + t}`;
  }
  toHexa() {
    const e = Math.round(this._components[3] * 255).toString(16);
    return this.toHex() + '00'.substring(0, 2 - e.length) + e;
  }
  setAlpha(t) {
    return ((this._components[3] = this._clamp(t)), this);
  }
  _normalize(t) {
    let e, i, r, n;
    if ((typeof t == 'number' || t instanceof Number) && t >= 0 && t <= 16777215) {
      const o = t;
      ((e = ((o >> 16) & 255) / 255), (i = ((o >> 8) & 255) / 255), (r = (o & 255) / 255), (n = 1));
    } else if ((Array.isArray(t) || t instanceof Float32Array) && t.length >= 3 && t.length <= 4)
      ((t = this._clamp(t)), ([e, i, r, n = 1] = t));
    else if (
      (t instanceof Uint8Array || t instanceof Uint8ClampedArray) &&
      t.length >= 3 &&
      t.length <= 4
    )
      ((t = this._clamp(t, 0, 255)),
        ([e, i, r, n = 255] = t),
        (e /= 255),
        (i /= 255),
        (r /= 255),
        (n /= 255));
    else if (typeof t == 'string' || typeof t == 'object') {
      if (typeof t == 'string') {
        const a = Zt.HEX_PATTERN.exec(t);
        a && (t = `#${a[2]}`);
      }
      const o = nt(t);
      o.isValid() && (({ r: e, g: i, b: r, a: n } = o.rgba), (e /= 255), (i /= 255), (r /= 255));
    }
    if (e !== void 0)
      ((this._components[0] = e),
        (this._components[1] = i),
        (this._components[2] = r),
        (this._components[3] = n),
        this._refreshInt());
    else throw new Error(`Unable to convert color ${t}`);
  }
  _refreshInt() {
    this._clamp(this._components);
    const [t, e, i] = this._components;
    this._int = ((t * 255) << 16) + ((e * 255) << 8) + ((i * 255) | 0);
  }
  _clamp(t, e = 0, i = 1) {
    return typeof t == 'number'
      ? Math.min(Math.max(t, e), i)
      : (t.forEach((r, n) => {
          t[n] = Math.min(Math.max(r, e), i);
        }),
        t);
  }
  static isColorLike(t) {
    return (
      typeof t == 'number' ||
      typeof t == 'string' ||
      t instanceof Number ||
      t instanceof Zt ||
      Array.isArray(t) ||
      t instanceof Uint8Array ||
      t instanceof Uint8ClampedArray ||
      t instanceof Float32Array ||
      (t.r !== void 0 && t.g !== void 0 && t.b !== void 0) ||
      (t.r !== void 0 && t.g !== void 0 && t.b !== void 0 && t.a !== void 0) ||
      (t.h !== void 0 && t.s !== void 0 && t.l !== void 0) ||
      (t.h !== void 0 && t.s !== void 0 && t.l !== void 0 && t.a !== void 0) ||
      (t.h !== void 0 && t.s !== void 0 && t.v !== void 0) ||
      (t.h !== void 0 && t.s !== void 0 && t.v !== void 0 && t.a !== void 0)
    );
  }
};
Bt.shared = new Bt();
Bt._temp = new Bt();
Bt.HEX_PATTERN = /^(#|0x)?(([a-f0-9]{3}){1,2}([a-f0-9]{2})?)$/i;
let tt = Bt;
const $n = { cullArea: null, cullable: !1, cullableChildren: !0 };
let $e = 0;
const si = 500;
function K(...s) {
  $e !== si &&
    ($e++,
    $e === si
      ? console.warn(
          'PixiJS Warning: too many warnings, no more warnings will be reported to the console by PixiJS.',
        )
      : console.warn('PixiJS Warning: ', ...s));
}
class Ts {
  constructor(t, e) {
    ((this._pool = []),
      (this._count = 0),
      (this._index = 0),
      (this._classType = t),
      e && this.prepopulate(e));
  }
  prepopulate(t) {
    for (let e = 0; e < t; e++) this._pool[this._index++] = new this._classType();
    this._count += t;
  }
  get(t) {
    let e;
    return (
      this._index > 0 ? (e = this._pool[--this._index]) : (e = new this._classType()),
      e.init?.(t),
      e
    );
  }
  return(t) {
    (t.reset?.(), (this._pool[this._index++] = t));
  }
  get totalSize() {
    return this._count;
  }
  get totalFree() {
    return this._index;
  }
  get totalUsed() {
    return this._count - this._index;
  }
  clear() {
    ((this._pool.length = 0), (this._index = 0));
  }
}
class Xn {
  constructor() {
    this._poolsByClass = new Map();
  }
  prepopulate(t, e) {
    this.getPool(t).prepopulate(e);
  }
  get(t, e) {
    return this.getPool(t).get(e);
  }
  return(t) {
    this.getPool(t.constructor).return(t);
  }
  getPool(t) {
    return (
      this._poolsByClass.has(t) || this._poolsByClass.set(t, new Ts(t)),
      this._poolsByClass.get(t)
    );
  }
  stats() {
    const t = {};
    return (
      this._poolsByClass.forEach((e) => {
        const i = t[e._classType.name] ? e._classType.name + e._classType.ID : e._classType.name;
        t[i] = { free: e.totalFree, used: e.totalUsed, size: e.totalSize };
      }),
      t
    );
  }
}
const lt = new Xn(),
  Wn = {
    get isCachedAsTexture() {
      return !!this.renderGroup?.isCachedAsTexture;
    },
    cacheAsTexture(s) {
      typeof s == 'boolean' && s === !1
        ? this.disableRenderGroup()
        : (this.enableRenderGroup(), this.renderGroup.enableCacheAsTexture(s === !0 ? {} : s));
    },
    updateCacheTexture() {
      this.renderGroup?.updateCacheTexture();
    },
    get cacheAsBitmap() {
      return this.isCachedAsTexture;
    },
    set cacheAsBitmap(s) {
      (F('v8.6.0', 'cacheAsBitmap is deprecated, use cacheAsTexture instead.'),
        this.cacheAsTexture(s));
    },
  };
function jn(s, t, e) {
  const i = s.length;
  let r;
  if (t >= i || e === 0) return;
  e = t + e > i ? i - t : e;
  const n = i - e;
  for (r = t; r < n; ++r) s[r] = s[r + e];
  s.length = n;
}
const qn = {
    allowChildren: !0,
    removeChildren(s = 0, t) {
      const e = t ?? this.children.length,
        i = e - s,
        r = [];
      if (i > 0 && i <= e) {
        for (let o = e - 1; o >= s; o--) {
          const a = this.children[o];
          a && (r.push(a), (a.parent = null));
        }
        jn(this.children, s, e);
        const n = this.renderGroup || this.parentRenderGroup;
        n && n.removeChildren(r);
        for (let o = 0; o < r.length; ++o) {
          const a = r[o];
          (a.parentRenderLayer?.detach(a),
            this.emit('childRemoved', a, this, o),
            r[o].emit('removed', this));
        }
        return (r.length > 0 && this._didViewChangeTick++, r);
      } else if (i === 0 && this.children.length === 0) return r;
      throw new RangeError('removeChildren: numeric values are outside the acceptable range.');
    },
    removeChildAt(s) {
      const t = this.getChildAt(s);
      return this.removeChild(t);
    },
    getChildAt(s) {
      if (s < 0 || s >= this.children.length)
        throw new Error(`getChildAt: Index (${s}) does not exist.`);
      return this.children[s];
    },
    setChildIndex(s, t) {
      if (t < 0 || t >= this.children.length)
        throw new Error(`The index ${t} supplied is out of bounds ${this.children.length}`);
      (this.getChildIndex(s), this.addChildAt(s, t));
    },
    getChildIndex(s) {
      const t = this.children.indexOf(s);
      if (t === -1) throw new Error('The supplied Container must be a child of the caller');
      return t;
    },
    addChildAt(s, t) {
      this.allowChildren ||
        F(H, 'addChildAt: Only Containers will be allowed to add children in v8.0.0');
      const { children: e } = this;
      if (t < 0 || t > e.length)
        throw new Error(`${s}addChildAt: The index ${t} supplied is out of bounds ${e.length}`);
      if (s.parent) {
        const r = s.parent.children.indexOf(s);
        if (s.parent === this && r === t) return s;
        r !== -1 && s.parent.children.splice(r, 1);
      }
      (t === e.length ? e.push(s) : e.splice(t, 0, s),
        (s.parent = this),
        (s.didChange = !0),
        (s._updateFlags = 15));
      const i = this.renderGroup || this.parentRenderGroup;
      return (
        i && i.addChild(s),
        this.sortableChildren && (this.sortDirty = !0),
        this.emit('childAdded', s, this, t),
        s.emit('added', this),
        s
      );
    },
    swapChildren(s, t) {
      if (s === t) return;
      const e = this.getChildIndex(s),
        i = this.getChildIndex(t);
      ((this.children[e] = t), (this.children[i] = s));
      const r = this.renderGroup || this.parentRenderGroup;
      (r && (r.structureDidChange = !0), this._didContainerChangeTick++);
    },
    removeFromParent() {
      this.parent?.removeChild(this);
    },
    reparentChild(...s) {
      return s.length === 1
        ? this.reparentChildAt(s[0], this.children.length)
        : (s.forEach((t) => this.reparentChildAt(t, this.children.length)), s[0]);
    },
    reparentChildAt(s, t) {
      if (s.parent === this) return (this.setChildIndex(s, t), s);
      const e = s.worldTransform.clone();
      (s.removeFromParent(), this.addChildAt(s, t));
      const i = this.worldTransform.clone();
      return (i.invert(), e.prepend(i), s.setFromMatrix(e), s);
    },
    replaceChild(s, t) {
      (s.updateLocalTransform(),
        this.addChildAt(t, this.getChildIndex(s)),
        t.setFromMatrix(s.localTransform),
        t.updateLocalTransform(),
        this.removeChild(s));
    },
  },
  Zn = {
    collectRenderables(s, t, e) {
      (this.parentRenderLayer && this.parentRenderLayer !== e) ||
        this.globalDisplayStatus < 7 ||
        !this.includeInBuild ||
        (this.sortableChildren && this.sortChildren(),
        this.isSimple
          ? this.collectRenderablesSimple(s, t, e)
          : this.renderGroup
            ? t.renderPipes.renderGroup.addRenderGroup(this.renderGroup, s)
            : this.collectRenderablesWithEffects(s, t, e));
    },
    collectRenderablesSimple(s, t, e) {
      const i = this.children,
        r = i.length;
      for (let n = 0; n < r; n++) i[n].collectRenderables(s, t, e);
    },
    collectRenderablesWithEffects(s, t, e) {
      const { renderPipes: i } = t;
      for (let r = 0; r < this.effects.length; r++) {
        const n = this.effects[r];
        i[n.pipe].push(n, this, s);
      }
      this.collectRenderablesSimple(s, t, e);
      for (let r = this.effects.length - 1; r >= 0; r--) {
        const n = this.effects[r];
        i[n.pipe].pop(n, this, s);
      }
    },
  };
class ii {
  constructor() {
    ((this.pipe = 'filter'), (this.priority = 1));
  }
  destroy() {
    for (let t = 0; t < this.filters.length; t++) this.filters[t].destroy();
    ((this.filters = null), (this.filterArea = null));
  }
}
class Kn {
  constructor() {
    ((this._effectClasses = []), (this._tests = []), (this._initialized = !1));
  }
  init() {
    this._initialized ||
      ((this._initialized = !0),
      this._effectClasses.forEach((t) => {
        this.add({ test: t.test, maskClass: t });
      }));
  }
  add(t) {
    this._tests.push(t);
  }
  getMaskEffect(t) {
    this._initialized || this.init();
    for (let e = 0; e < this._tests.length; e++) {
      const i = this._tests[e];
      if (i.test(t)) return lt.get(i.maskClass, t);
    }
    return t;
  }
  returnMaskEffect(t) {
    lt.return(t);
  }
}
const fs = new Kn();
et.handleByList(G.MaskEffect, fs._effectClasses);
const Qn = {
    _maskEffect: null,
    _maskOptions: { inverse: !1 },
    _filterEffect: null,
    effects: [],
    _markStructureAsChanged() {
      const s = this.renderGroup || this.parentRenderGroup;
      s && (s.structureDidChange = !0);
    },
    addEffect(s) {
      this.effects.indexOf(s) === -1 &&
        (this.effects.push(s),
        this.effects.sort((e, i) => e.priority - i.priority),
        this._markStructureAsChanged(),
        this._updateIsSimple());
    },
    removeEffect(s) {
      const t = this.effects.indexOf(s);
      t !== -1 &&
        (this.effects.splice(t, 1), this._markStructureAsChanged(), this._updateIsSimple());
    },
    set mask(s) {
      const t = this._maskEffect;
      t?.mask !== s &&
        (t && (this.removeEffect(t), fs.returnMaskEffect(t), (this._maskEffect = null)),
        s != null && ((this._maskEffect = fs.getMaskEffect(s)), this.addEffect(this._maskEffect)));
    },
    get mask() {
      return this._maskEffect?.mask;
    },
    setMask(s) {
      ((this._maskOptions = { ...this._maskOptions, ...s }),
        s.mask && (this.mask = s.mask),
        this._markStructureAsChanged());
    },
    set filters(s) {
      !Array.isArray(s) && s && (s = [s]);
      const t = this._filterEffect || (this._filterEffect = new ii());
      s = s;
      const e = s?.length > 0,
        i = t.filters?.length > 0,
        r = e !== i;
      ((s = Array.isArray(s) ? s.slice(0) : s),
        (t.filters = Object.freeze(s)),
        r && (e ? this.addEffect(t) : (this.removeEffect(t), (t.filters = s ?? null))));
    },
    get filters() {
      return this._filterEffect?.filters;
    },
    set filterArea(s) {
      (this._filterEffect || (this._filterEffect = new ii()), (this._filterEffect.filterArea = s));
    },
    get filterArea() {
      return this._filterEffect?.filterArea;
    },
  },
  Jn = {
    label: null,
    get name() {
      return (
        F(H, 'Container.name property has been removed, use Container.label instead'),
        this.label
      );
    },
    set name(s) {
      (F(H, 'Container.name property has been removed, use Container.label instead'),
        (this.label = s));
    },
    getChildByName(s, t = !1) {
      return this.getChildByLabel(s, t);
    },
    getChildByLabel(s, t = !1) {
      const e = this.children;
      for (let i = 0; i < e.length; i++) {
        const r = e[i];
        if (r.label === s || (s instanceof RegExp && s.test(r.label))) return r;
      }
      if (t)
        for (let i = 0; i < e.length; i++) {
          const n = e[i].getChildByLabel(s, !0);
          if (n) return n;
        }
      return null;
    },
    getChildrenByLabel(s, t = !1, e = []) {
      const i = this.children;
      for (let r = 0; r < i.length; r++) {
        const n = i[r];
        (n.label === s || (s instanceof RegExp && s.test(n.label))) && e.push(n);
      }
      if (t) for (let r = 0; r < i.length; r++) i[r].getChildrenByLabel(s, !0, e);
      return e;
    },
  },
  q = new Ts(I),
  ct = new Ts(it),
  to = new I(),
  eo = {
    getFastGlobalBounds(s, t) {
      (t || (t = new it()),
        t.clear(),
        this._getGlobalBoundsRecursive(!!s, t, this.parentRenderLayer),
        t.isValid || t.set(0, 0, 0, 0));
      const e = this.renderGroup || this.parentRenderGroup;
      return (t.applyMatrix(e.worldTransform), t);
    },
    _getGlobalBoundsRecursive(s, t, e) {
      let i = t;
      if (
        (s && this.parentRenderLayer && this.parentRenderLayer !== e) ||
        this.localDisplayStatus !== 7 ||
        !this.measurable
      )
        return;
      const r = !!this.effects.length;
      if (((this.renderGroup || r) && (i = ct.get().clear()), this.boundsArea))
        t.addRect(this.boundsArea, this.worldTransform);
      else {
        if (this.renderPipeId) {
          const o = this.bounds;
          i.addFrame(o.minX, o.minY, o.maxX, o.maxY, this.groupTransform);
        }
        const n = this.children;
        for (let o = 0; o < n.length; o++) n[o]._getGlobalBoundsRecursive(s, i, e);
      }
      if (r) {
        let n = !1;
        const o = this.renderGroup || this.parentRenderGroup;
        for (let a = 0; a < this.effects.length; a++)
          this.effects[a].addBounds &&
            (n || ((n = !0), i.applyMatrix(o.worldTransform)), this.effects[a].addBounds(i, !0));
        (n && i.applyMatrix(o.worldTransform.copyTo(to).invert()), t.addBounds(i), ct.return(i));
      } else this.renderGroup && (t.addBounds(i, this.relativeGroupTransform), ct.return(i));
    },
  };
function rr(s, t, e) {
  e.clear();
  let i, r;
  return (
    s.parent
      ? t
        ? (i = s.parent.worldTransform)
        : ((r = q.get().identity()), (i = ks(s, r)))
      : (i = I.IDENTITY),
    nr(s, e, i, t),
    r && q.return(r),
    e.isValid || e.set(0, 0, 0, 0),
    e
  );
}
function nr(s, t, e, i) {
  if (!s.visible || !s.measurable) return;
  let r;
  i
    ? (r = s.worldTransform)
    : (s.updateLocalTransform(), (r = q.get()), r.appendFrom(s.localTransform, e));
  const n = t,
    o = !!s.effects.length;
  if ((o && (t = ct.get().clear()), s.boundsArea)) t.addRect(s.boundsArea, r);
  else {
    s.bounds && ((t.matrix = r), t.addBounds(s.bounds));
    for (let a = 0; a < s.children.length; a++) nr(s.children[a], t, r, i);
  }
  if (o) {
    for (let a = 0; a < s.effects.length; a++) s.effects[a].addBounds?.(t);
    (n.addBounds(t, I.IDENTITY), ct.return(t));
  }
  i || q.return(r);
}
function ks(s, t) {
  const e = s.parent;
  return (e && (ks(e, t), e.updateLocalTransform(), t.append(e.localTransform)), t);
}
function or(s, t) {
  if (s === 16777215 || !t) return t;
  if (t === 16777215 || !s) return s;
  const e = (s >> 16) & 255,
    i = (s >> 8) & 255,
    r = s & 255,
    n = (t >> 16) & 255,
    o = (t >> 8) & 255,
    a = t & 255,
    h = ((e * n) / 255) | 0,
    l = ((i * o) / 255) | 0,
    c = ((r * a) / 255) | 0;
  return (h << 16) + (l << 8) + c;
}
const ri = 16777215;
function ni(s, t) {
  return s === ri ? t : t === ri ? s : or(s, t);
}
function ke(s) {
  return ((s & 255) << 16) + (s & 65280) + ((s >> 16) & 255);
}
const so = {
  getGlobalAlpha(s) {
    if (s)
      return this.renderGroup
        ? this.renderGroup.worldAlpha
        : this.parentRenderGroup
          ? this.parentRenderGroup.worldAlpha * this.alpha
          : this.alpha;
    let t = this.alpha,
      e = this.parent;
    for (; e; ) ((t *= e.alpha), (e = e.parent));
    return t;
  },
  getGlobalTransform(s = new I(), t) {
    if (t) return s.copyFrom(this.worldTransform);
    this.updateLocalTransform();
    const e = ks(this, q.get().identity());
    return (s.appendFrom(this.localTransform, e), q.return(e), s);
  },
  getGlobalTint(s) {
    if (s)
      return this.renderGroup
        ? ke(this.renderGroup.worldColor)
        : this.parentRenderGroup
          ? ke(ni(this.localColor, this.parentRenderGroup.worldColor))
          : this.tint;
    let t = this.localColor,
      e = this.parent;
    for (; e; ) ((t = ni(t, e.localColor)), (e = e.parent));
    return ke(t);
  },
};
function ar(s, t, e) {
  return (t.clear(), e || (e = I.IDENTITY), hr(s, t, e, s, !0), t.isValid || t.set(0, 0, 0, 0), t);
}
function hr(s, t, e, i, r) {
  let n;
  if (r) ((n = q.get()), (n = e.copyTo(n)));
  else {
    if (!s.visible || !s.measurable) return;
    s.updateLocalTransform();
    const h = s.localTransform;
    ((n = q.get()), n.appendFrom(h, e));
  }
  const o = t,
    a = !!s.effects.length;
  if ((a && (t = ct.get().clear()), s.boundsArea)) t.addRect(s.boundsArea, n);
  else {
    s.renderPipeId && ((t.matrix = n), t.addBounds(s.bounds));
    const h = s.children;
    for (let l = 0; l < h.length; l++) hr(h[l], t, n, i, !1);
  }
  if (a) {
    for (let h = 0; h < s.effects.length; h++) s.effects[h].addLocalBounds?.(t, i);
    (o.addBounds(t, I.IDENTITY), ct.return(t));
  }
  q.return(n);
}
function lr(s, t) {
  const e = s.children;
  for (let i = 0; i < e.length; i++) {
    const r = e[i],
      n = r.uid,
      o = ((r._didViewChangeTick & 65535) << 16) | (r._didContainerChangeTick & 65535),
      a = t.index;
    ((t.data[a] !== n || t.data[a + 1] !== o) &&
      ((t.data[t.index] = n), (t.data[t.index + 1] = o), (t.didChange = !0)),
      (t.index = a + 2),
      r.children.length && lr(r, t));
  }
  return t.didChange;
}
const io = new I(),
  ro = {
    _localBoundsCacheId: -1,
    _localBoundsCacheData: null,
    _setWidth(s, t) {
      const e = Math.sign(this.scale.x) || 1;
      t !== 0 ? (this.scale.x = (s / t) * e) : (this.scale.x = e);
    },
    _setHeight(s, t) {
      const e = Math.sign(this.scale.y) || 1;
      t !== 0 ? (this.scale.y = (s / t) * e) : (this.scale.y = e);
    },
    getLocalBounds() {
      this._localBoundsCacheData ||
        (this._localBoundsCacheData = { data: [], index: 1, didChange: !1, localBounds: new it() });
      const s = this._localBoundsCacheData;
      return (
        (s.index = 1),
        (s.didChange = !1),
        s.data[0] !== this._didViewChangeTick &&
          ((s.didChange = !0), (s.data[0] = this._didViewChangeTick)),
        lr(this, s),
        s.didChange && ar(this, s.localBounds, io),
        s.localBounds
      );
    },
    getBounds(s, t) {
      return rr(this, s, t || new it());
    },
  },
  no = {
    _onRender: null,
    set onRender(s) {
      const t = this.renderGroup || this.parentRenderGroup;
      if (!s) {
        (this._onRender && t?.removeOnRender(this), (this._onRender = null));
        return;
      }
      (this._onRender || t?.addOnRender(this), (this._onRender = s));
    },
    get onRender() {
      return this._onRender;
    },
  },
  oo = {
    _zIndex: 0,
    sortDirty: !1,
    sortableChildren: !1,
    get zIndex() {
      return this._zIndex;
    },
    set zIndex(s) {
      this._zIndex !== s && ((this._zIndex = s), this.depthOfChildModified());
    },
    depthOfChildModified() {
      (this.parent && ((this.parent.sortableChildren = !0), (this.parent.sortDirty = !0)),
        this.parentRenderGroup && (this.parentRenderGroup.structureDidChange = !0));
    },
    sortChildren() {
      this.sortDirty && ((this.sortDirty = !1), this.children.sort(ao));
    },
  };
function ao(s, t) {
  return s._zIndex - t._zIndex;
}
const ho = {
  getGlobalPosition(s = new W(), t = !1) {
    return (
      this.parent
        ? this.parent.toGlobal(this._position, s, t)
        : ((s.x = this._position.x), (s.y = this._position.y)),
      s
    );
  },
  toGlobal(s, t, e = !1) {
    const i = this.getGlobalTransform(q.get(), e);
    return ((t = i.apply(s, t)), q.return(i), t);
  },
  toLocal(s, t, e, i) {
    t && (s = t.toGlobal(s, e, i));
    const r = this.getGlobalTransform(q.get(), i);
    return ((e = r.applyInverse(s, e)), q.return(r), e);
  },
};
class cr {
  constructor() {
    ((this.uid = O('instructionSet')),
      (this.instructions = []),
      (this.instructionSize = 0),
      (this.renderables = []),
      (this.gcTick = 0));
  }
  reset() {
    this.instructionSize = 0;
  }
  add(t) {
    this.instructions[this.instructionSize++] = t;
  }
  log() {
    ((this.instructions.length = this.instructionSize),
      console.table(this.instructions, ['type', 'action']));
  }
}
let lo = 0;
class co {
  constructor(t) {
    ((this._poolKeyHash = Object.create(null)),
      (this._texturePool = {}),
      (this.textureOptions = t || {}),
      (this.enableFullScreen = !1),
      (this.textureStyle = new Qi(this.textureOptions)));
  }
  createTexture(t, e, i) {
    const r = new rt({
      ...this.textureOptions,
      width: t,
      height: e,
      resolution: 1,
      antialias: i,
      autoGarbageCollect: !1,
    });
    return new D({ source: r, label: `texturePool_${lo++}` });
  }
  getOptimalTexture(t, e, i = 1, r) {
    let n = Math.ceil(t * i - 1e-6),
      o = Math.ceil(e * i - 1e-6);
    ((n = Ys(n)), (o = Ys(o)));
    const a = (n << 17) + (o << 1) + (r ? 1 : 0);
    this._texturePool[a] || (this._texturePool[a] = []);
    let h = this._texturePool[a].pop();
    return (
      h || (h = this.createTexture(n, o, r)),
      (h.source._resolution = i),
      (h.source.width = n / i),
      (h.source.height = o / i),
      (h.source.pixelWidth = n),
      (h.source.pixelHeight = o),
      (h.frame.x = 0),
      (h.frame.y = 0),
      (h.frame.width = t),
      (h.frame.height = e),
      h.updateUvs(),
      (this._poolKeyHash[h.uid] = a),
      h
    );
  }
  getSameSizeTexture(t, e = !1) {
    const i = t.source;
    return this.getOptimalTexture(t.width, t.height, i._resolution, e);
  }
  returnTexture(t, e = !1) {
    const i = this._poolKeyHash[t.uid];
    (e && (t.source.style = this.textureStyle), this._texturePool[i].push(t));
  }
  clear(t) {
    if (((t = t !== !1), t))
      for (const e in this._texturePool) {
        const i = this._texturePool[e];
        if (i) for (let r = 0; r < i.length; r++) i[r].destroy(!0);
      }
    this._texturePool = {};
  }
}
const uo = new co();
class fo {
  constructor() {
    ((this.renderPipeId = 'renderGroup'),
      (this.root = null),
      (this.canBundle = !1),
      (this.renderGroupParent = null),
      (this.renderGroupChildren = []),
      (this.worldTransform = new I()),
      (this.worldColorAlpha = 4294967295),
      (this.worldColor = 16777215),
      (this.worldAlpha = 1),
      (this.childrenToUpdate = Object.create(null)),
      (this.updateTick = 0),
      (this.gcTick = 0),
      (this.childrenRenderablesToUpdate = { list: [], index: 0 }),
      (this.structureDidChange = !0),
      (this.instructionSet = new cr()),
      (this._onRenderContainers = []),
      (this.textureNeedsUpdate = !0),
      (this.isCachedAsTexture = !1),
      (this._matrixDirty = 7));
  }
  init(t) {
    ((this.root = t), t._onRender && this.addOnRender(t), (t.didChange = !0));
    const e = t.children;
    for (let i = 0; i < e.length; i++) {
      const r = e[i];
      ((r._updateFlags = 15), this.addChild(r));
    }
  }
  enableCacheAsTexture(t = {}) {
    ((this.textureOptions = t), (this.isCachedAsTexture = !0), (this.textureNeedsUpdate = !0));
  }
  disableCacheAsTexture() {
    ((this.isCachedAsTexture = !1),
      this.texture && (uo.returnTexture(this.texture, !0), (this.texture = null)));
  }
  updateCacheTexture() {
    this.textureNeedsUpdate = !0;
  }
  reset() {
    this.renderGroupChildren.length = 0;
    for (const t in this.childrenToUpdate) {
      const e = this.childrenToUpdate[t];
      (e.list.fill(null), (e.index = 0));
    }
    ((this.childrenRenderablesToUpdate.index = 0),
      this.childrenRenderablesToUpdate.list.fill(null),
      (this.root = null),
      (this.updateTick = 0),
      (this.structureDidChange = !0),
      (this._onRenderContainers.length = 0),
      (this.renderGroupParent = null),
      this.disableCacheAsTexture());
  }
  get localTransform() {
    return this.root.localTransform;
  }
  addRenderGroupChild(t) {
    (t.renderGroupParent && t.renderGroupParent._removeRenderGroupChild(t),
      (t.renderGroupParent = this),
      this.renderGroupChildren.push(t));
  }
  _removeRenderGroupChild(t) {
    const e = this.renderGroupChildren.indexOf(t);
    (e > -1 && this.renderGroupChildren.splice(e, 1), (t.renderGroupParent = null));
  }
  addChild(t) {
    if (
      ((this.structureDidChange = !0),
      (t.parentRenderGroup = this),
      (t.updateTick = -1),
      t.parent === this.root
        ? (t.relativeRenderGroupDepth = 1)
        : (t.relativeRenderGroupDepth = t.parent.relativeRenderGroupDepth + 1),
      (t.didChange = !0),
      this.onChildUpdate(t),
      t.renderGroup)
    ) {
      this.addRenderGroupChild(t.renderGroup);
      return;
    }
    t._onRender && this.addOnRender(t);
    const e = t.children;
    for (let i = 0; i < e.length; i++) this.addChild(e[i]);
  }
  removeChild(t) {
    if (
      ((this.structureDidChange = !0),
      t._onRender && (t.renderGroup || this.removeOnRender(t)),
      (t.parentRenderGroup = null),
      t.renderGroup)
    ) {
      this._removeRenderGroupChild(t.renderGroup);
      return;
    }
    const e = t.children;
    for (let i = 0; i < e.length; i++) this.removeChild(e[i]);
  }
  removeChildren(t) {
    for (let e = 0; e < t.length; e++) this.removeChild(t[e]);
  }
  onChildUpdate(t) {
    let e = this.childrenToUpdate[t.relativeRenderGroupDepth];
    (e || (e = this.childrenToUpdate[t.relativeRenderGroupDepth] = { index: 0, list: [] }),
      (e.list[e.index++] = t));
  }
  updateRenderable(t) {
    t.globalDisplayStatus < 7 ||
      (this.instructionSet.renderPipes[t.renderPipeId].updateRenderable(t), (t.didViewUpdate = !1));
  }
  onChildViewUpdate(t) {
    this.childrenRenderablesToUpdate.list[this.childrenRenderablesToUpdate.index++] = t;
  }
  get isRenderable() {
    return this.root.localDisplayStatus === 7 && this.worldAlpha > 0;
  }
  addOnRender(t) {
    this._onRenderContainers.push(t);
  }
  removeOnRender(t) {
    this._onRenderContainers.splice(this._onRenderContainers.indexOf(t), 1);
  }
  runOnRender(t) {
    for (let e = 0; e < this._onRenderContainers.length; e++)
      this._onRenderContainers[e]._onRender(t);
  }
  destroy() {
    (this.disableCacheAsTexture(),
      (this.renderGroupParent = null),
      (this.root = null),
      (this.childrenRenderablesToUpdate = null),
      (this.childrenToUpdate = null),
      (this.renderGroupChildren = null),
      (this._onRenderContainers = null),
      (this.instructionSet = null));
  }
  getChildren(t = []) {
    const e = this.root.children;
    for (let i = 0; i < e.length; i++) this._getChildren(e[i], t);
    return t;
  }
  _getChildren(t, e = []) {
    if ((e.push(t), t.renderGroup)) return e;
    const i = t.children;
    for (let r = 0; r < i.length; r++) this._getChildren(i[r], e);
    return e;
  }
  invalidateMatrices() {
    this._matrixDirty = 7;
  }
  get inverseWorldTransform() {
    return this._matrixDirty & 1
      ? ((this._matrixDirty &= -2),
        this._inverseWorldTransform || (this._inverseWorldTransform = new I()),
        this._inverseWorldTransform.copyFrom(this.worldTransform).invert())
      : this._inverseWorldTransform;
  }
  get textureOffsetInverseTransform() {
    return this._matrixDirty & 2
      ? ((this._matrixDirty &= -3),
        this._textureOffsetInverseTransform || (this._textureOffsetInverseTransform = new I()),
        this._textureOffsetInverseTransform
          .copyFrom(this.inverseWorldTransform)
          .translate(-this._textureBounds.x, -this._textureBounds.y))
      : this._textureOffsetInverseTransform;
  }
  get inverseParentTextureTransform() {
    if (!(this._matrixDirty & 4)) return this._inverseParentTextureTransform;
    this._matrixDirty &= -5;
    const t = this._parentCacheAsTextureRenderGroup;
    return t
      ? (this._inverseParentTextureTransform || (this._inverseParentTextureTransform = new I()),
        this._inverseParentTextureTransform
          .copyFrom(this.worldTransform)
          .prepend(t.inverseWorldTransform)
          .translate(-t._textureBounds.x, -t._textureBounds.y))
      : this.worldTransform;
  }
  get cacheToLocalTransform() {
    return this._parentCacheAsTextureRenderGroup
      ? this._parentCacheAsTextureRenderGroup.textureOffsetInverseTransform
      : null;
  }
}
function po(s, t, e = {}) {
  for (const i in t) !e[i] && t[i] !== void 0 && (s[i] = t[i]);
}
const Xe = new X(null),
  ye = new X(null),
  We = new X(null, 1, 1),
  _e = new X(null),
  oi = 1,
  mo = 2,
  je = 4;
class kt extends ut {
  constructor(t = {}) {
    (super(),
      (this.uid = O('renderable')),
      (this._updateFlags = 15),
      (this.renderGroup = null),
      (this.parentRenderGroup = null),
      (this.parentRenderGroupIndex = 0),
      (this.didChange = !1),
      (this.didViewUpdate = !1),
      (this.relativeRenderGroupDepth = 0),
      (this.children = []),
      (this.parent = null),
      (this.includeInBuild = !0),
      (this.measurable = !0),
      (this.isSimple = !0),
      (this.updateTick = -1),
      (this.localTransform = new I()),
      (this.relativeGroupTransform = new I()),
      (this.groupTransform = this.relativeGroupTransform),
      (this.destroyed = !1),
      (this._position = new X(this, 0, 0)),
      (this._scale = We),
      (this._pivot = ye),
      (this._origin = _e),
      (this._skew = Xe),
      (this._cx = 1),
      (this._sx = 0),
      (this._cy = 0),
      (this._sy = 1),
      (this._rotation = 0),
      (this.localColor = 16777215),
      (this.localAlpha = 1),
      (this.groupAlpha = 1),
      (this.groupColor = 16777215),
      (this.groupColorAlpha = 4294967295),
      (this.localBlendMode = 'inherit'),
      (this.groupBlendMode = 'normal'),
      (this.localDisplayStatus = 7),
      (this.globalDisplayStatus = 7),
      (this._didContainerChangeTick = 0),
      (this._didViewChangeTick = 0),
      (this._didLocalTransformChangeId = -1),
      (this.effects = []),
      po(this, t, { children: !0, parent: !0, effects: !0 }),
      t.children?.forEach((e) => this.addChild(e)),
      t.parent?.addChild(this));
  }
  static mixin(t) {
    (F('8.8.0', 'Container.mixin is deprecated, please use extensions.mixin instead.'),
      et.mixin(kt, t));
  }
  set _didChangeId(t) {
    ((this._didViewChangeTick = (t >> 12) & 4095), (this._didContainerChangeTick = t & 4095));
  }
  get _didChangeId() {
    return (this._didContainerChangeTick & 4095) | ((this._didViewChangeTick & 4095) << 12);
  }
  addChild(...t) {
    if (
      (this.allowChildren ||
        F(H, 'addChild: Only Containers will be allowed to add children in v8.0.0'),
      t.length > 1)
    ) {
      for (let r = 0; r < t.length; r++) this.addChild(t[r]);
      return t[0];
    }
    const e = t[0],
      i = this.renderGroup || this.parentRenderGroup;
    return e.parent === this
      ? (this.children.splice(this.children.indexOf(e), 1),
        this.children.push(e),
        i && (i.structureDidChange = !0),
        e)
      : (e.parent && e.parent.removeChild(e),
        this.children.push(e),
        this.sortableChildren && (this.sortDirty = !0),
        (e.parent = this),
        (e.didChange = !0),
        (e._updateFlags = 15),
        i && i.addChild(e),
        this.emit('childAdded', e, this, this.children.length - 1),
        e.emit('added', this),
        this._didViewChangeTick++,
        e._zIndex !== 0 && e.depthOfChildModified(),
        e);
  }
  removeChild(...t) {
    if (t.length > 1) {
      for (let r = 0; r < t.length; r++) this.removeChild(t[r]);
      return t[0];
    }
    const e = t[0],
      i = this.children.indexOf(e);
    return (
      i > -1 &&
        (this._didViewChangeTick++,
        this.children.splice(i, 1),
        this.renderGroup
          ? this.renderGroup.removeChild(e)
          : this.parentRenderGroup && this.parentRenderGroup.removeChild(e),
        e.parentRenderLayer && e.parentRenderLayer.detach(e),
        (e.parent = null),
        this.emit('childRemoved', e, this, i),
        e.emit('removed', this)),
      e
    );
  }
  _onUpdate(t) {
    (t && t === this._skew && this._updateSkew(),
      this._didContainerChangeTick++,
      !this.didChange &&
        ((this.didChange = !0),
        this.parentRenderGroup && this.parentRenderGroup.onChildUpdate(this)));
  }
  set isRenderGroup(t) {
    !!this.renderGroup !== t && (t ? this.enableRenderGroup() : this.disableRenderGroup());
  }
  get isRenderGroup() {
    return !!this.renderGroup;
  }
  enableRenderGroup() {
    if (this.renderGroup) return;
    const t = this.parentRenderGroup;
    (t?.removeChild(this),
      (this.renderGroup = lt.get(fo, this)),
      (this.groupTransform = I.IDENTITY),
      t?.addChild(this),
      this._updateIsSimple());
  }
  disableRenderGroup() {
    if (!this.renderGroup) return;
    const t = this.parentRenderGroup;
    (t?.removeChild(this),
      lt.return(this.renderGroup),
      (this.renderGroup = null),
      (this.groupTransform = this.relativeGroupTransform),
      t?.addChild(this),
      this._updateIsSimple());
  }
  _updateIsSimple() {
    this.isSimple = !this.renderGroup && this.effects.length === 0;
  }
  get worldTransform() {
    return (
      this._worldTransform || (this._worldTransform = new I()),
      this.renderGroup
        ? this._worldTransform.copyFrom(this.renderGroup.worldTransform)
        : this.parentRenderGroup &&
          this._worldTransform.appendFrom(
            this.relativeGroupTransform,
            this.parentRenderGroup.worldTransform,
          ),
      this._worldTransform
    );
  }
  get x() {
    return this._position.x;
  }
  set x(t) {
    this._position.x = t;
  }
  get y() {
    return this._position.y;
  }
  set y(t) {
    this._position.y = t;
  }
  get position() {
    return this._position;
  }
  set position(t) {
    this._position.copyFrom(t);
  }
  get rotation() {
    return this._rotation;
  }
  set rotation(t) {
    this._rotation !== t && ((this._rotation = t), this._onUpdate(this._skew));
  }
  get angle() {
    return this.rotation * Pn;
  }
  set angle(t) {
    this.rotation = t * Tn;
  }
  get pivot() {
    return (this._pivot === ye && (this._pivot = new X(this, 0, 0)), this._pivot);
  }
  set pivot(t) {
    (this._pivot === ye &&
      ((this._pivot = new X(this, 0, 0)),
      this._origin !== _e &&
        K(
          'Setting both a pivot and origin on a Container is not recommended. This can lead to unexpected behavior if not handled carefully.',
        )),
      typeof t == 'number' ? this._pivot.set(t) : this._pivot.copyFrom(t));
  }
  get skew() {
    return (this._skew === Xe && (this._skew = new X(this, 0, 0)), this._skew);
  }
  set skew(t) {
    (this._skew === Xe && (this._skew = new X(this, 0, 0)), this._skew.copyFrom(t));
  }
  get scale() {
    return (this._scale === We && (this._scale = new X(this, 1, 1)), this._scale);
  }
  set scale(t) {
    (this._scale === We && (this._scale = new X(this, 0, 0)),
      typeof t == 'string' && (t = parseFloat(t)),
      typeof t == 'number' ? this._scale.set(t) : this._scale.copyFrom(t));
  }
  get origin() {
    return (this._origin === _e && (this._origin = new X(this, 0, 0)), this._origin);
  }
  set origin(t) {
    (this._origin === _e &&
      ((this._origin = new X(this, 0, 0)),
      this._pivot !== ye &&
        K(
          'Setting both a pivot and origin on a Container is not recommended. This can lead to unexpected behavior if not handled carefully.',
        )),
      typeof t == 'number' ? this._origin.set(t) : this._origin.copyFrom(t));
  }
  get width() {
    return Math.abs(this.scale.x * this.getLocalBounds().width);
  }
  set width(t) {
    const e = this.getLocalBounds().width;
    this._setWidth(t, e);
  }
  get height() {
    return Math.abs(this.scale.y * this.getLocalBounds().height);
  }
  set height(t) {
    const e = this.getLocalBounds().height;
    this._setHeight(t, e);
  }
  getSize(t) {
    t || (t = {});
    const e = this.getLocalBounds();
    return (
      (t.width = Math.abs(this.scale.x * e.width)),
      (t.height = Math.abs(this.scale.y * e.height)),
      t
    );
  }
  setSize(t, e) {
    const i = this.getLocalBounds();
    (typeof t == 'object' ? ((e = t.height ?? t.width), (t = t.width)) : (e ?? (e = t)),
      t !== void 0 && this._setWidth(t, i.width),
      e !== void 0 && this._setHeight(e, i.height));
  }
  _updateSkew() {
    const t = this._rotation,
      e = this._skew;
    ((this._cx = Math.cos(t + e._y)),
      (this._sx = Math.sin(t + e._y)),
      (this._cy = -Math.sin(t - e._x)),
      (this._sy = Math.cos(t - e._x)));
  }
  updateTransform(t) {
    return (
      this.position.set(
        typeof t.x == 'number' ? t.x : this.position.x,
        typeof t.y == 'number' ? t.y : this.position.y,
      ),
      this.scale.set(
        typeof t.scaleX == 'number' ? t.scaleX || 1 : this.scale.x,
        typeof t.scaleY == 'number' ? t.scaleY || 1 : this.scale.y,
      ),
      (this.rotation = typeof t.rotation == 'number' ? t.rotation : this.rotation),
      this.skew.set(
        typeof t.skewX == 'number' ? t.skewX : this.skew.x,
        typeof t.skewY == 'number' ? t.skewY : this.skew.y,
      ),
      this.pivot.set(
        typeof t.pivotX == 'number' ? t.pivotX : this.pivot.x,
        typeof t.pivotY == 'number' ? t.pivotY : this.pivot.y,
      ),
      this.origin.set(
        typeof t.originX == 'number' ? t.originX : this.origin.x,
        typeof t.originY == 'number' ? t.originY : this.origin.y,
      ),
      this
    );
  }
  setFromMatrix(t) {
    t.decompose(this);
  }
  updateLocalTransform() {
    const t = this._didContainerChangeTick;
    if (this._didLocalTransformChangeId === t) return;
    this._didLocalTransformChangeId = t;
    const e = this.localTransform,
      i = this._scale,
      r = this._pivot,
      n = this._origin,
      o = this._position,
      a = i._x,
      h = i._y,
      l = r._x,
      c = r._y,
      u = -n._x,
      f = -n._y;
    ((e.a = this._cx * a),
      (e.b = this._sx * a),
      (e.c = this._cy * h),
      (e.d = this._sy * h),
      (e.tx = o._x - (l * e.a + c * e.c) + (u * e.a + f * e.c) - u),
      (e.ty = o._y - (l * e.b + c * e.d) + (u * e.b + f * e.d) - f));
  }
  set alpha(t) {
    t !== this.localAlpha && ((this.localAlpha = t), (this._updateFlags |= oi), this._onUpdate());
  }
  get alpha() {
    return this.localAlpha;
  }
  set tint(t) {
    const i = tt.shared.setValue(t ?? 16777215).toBgrNumber();
    i !== this.localColor && ((this.localColor = i), (this._updateFlags |= oi), this._onUpdate());
  }
  get tint() {
    return ke(this.localColor);
  }
  set blendMode(t) {
    this.localBlendMode !== t &&
      (this.parentRenderGroup && (this.parentRenderGroup.structureDidChange = !0),
      (this._updateFlags |= mo),
      (this.localBlendMode = t),
      this._onUpdate());
  }
  get blendMode() {
    return this.localBlendMode;
  }
  get visible() {
    return !!(this.localDisplayStatus & 2);
  }
  set visible(t) {
    const e = t ? 2 : 0;
    (this.localDisplayStatus & 2) !== e &&
      (this.parentRenderGroup && (this.parentRenderGroup.structureDidChange = !0),
      (this._updateFlags |= je),
      (this.localDisplayStatus ^= 2),
      this._onUpdate());
  }
  get culled() {
    return !(this.localDisplayStatus & 4);
  }
  set culled(t) {
    const e = t ? 0 : 4;
    (this.localDisplayStatus & 4) !== e &&
      (this.parentRenderGroup && (this.parentRenderGroup.structureDidChange = !0),
      (this._updateFlags |= je),
      (this.localDisplayStatus ^= 4),
      this._onUpdate());
  }
  get renderable() {
    return !!(this.localDisplayStatus & 1);
  }
  set renderable(t) {
    const e = t ? 1 : 0;
    (this.localDisplayStatus & 1) !== e &&
      ((this._updateFlags |= je),
      (this.localDisplayStatus ^= 1),
      this.parentRenderGroup && (this.parentRenderGroup.structureDidChange = !0),
      this._onUpdate());
  }
  get isRenderable() {
    return this.localDisplayStatus === 7 && this.groupAlpha > 0;
  }
  destroy(t = !1) {
    if (this.destroyed) return;
    this.destroyed = !0;
    let e;
    if (
      (this.children.length && (e = this.removeChildren(0, this.children.length)),
      this.removeFromParent(),
      (this.parent = null),
      (this._maskEffect = null),
      (this._filterEffect = null),
      (this.effects = null),
      (this._position = null),
      (this._scale = null),
      (this._pivot = null),
      (this._origin = null),
      (this._skew = null),
      this.emit('destroyed', this),
      this.removeAllListeners(),
      (typeof t == 'boolean' ? t : t?.children) && e)
    )
      for (let r = 0; r < e.length; ++r) e[r].destroy(t);
    (this.renderGroup?.destroy(), (this.renderGroup = null));
  }
}
et.mixin(kt, qn, eo, ho, no, ro, Qn, Jn, oo, $n, Wn, so, Zn);
class ur extends kt {
  constructor(t) {
    (super(t),
      (this.canBundle = !0),
      (this.allowChildren = !1),
      (this._roundPixels = 0),
      (this._lastUsed = -1),
      (this._gpuData = Object.create(null)),
      (this._bounds = new it(0, 1, 0, 0)),
      (this._boundsDirty = !0));
  }
  get bounds() {
    return this._boundsDirty
      ? (this.updateBounds(), (this._boundsDirty = !1), this._bounds)
      : this._bounds;
  }
  get roundPixels() {
    return !!this._roundPixels;
  }
  set roundPixels(t) {
    this._roundPixels = t ? 1 : 0;
  }
  containsPoint(t) {
    const e = this.bounds,
      { x: i, y: r } = t;
    return i >= e.minX && i <= e.maxX && r >= e.minY && r <= e.maxY;
  }
  onViewUpdate() {
    if ((this._didViewChangeTick++, (this._boundsDirty = !0), this.didViewUpdate)) return;
    this.didViewUpdate = !0;
    const t = this.renderGroup || this.parentRenderGroup;
    t && t.onChildViewUpdate(this);
  }
  destroy(t) {
    (super.destroy(t), (this._bounds = null));
    for (const e in this._gpuData) this._gpuData[e].destroy?.();
    this._gpuData = null;
  }
  collectRenderablesSimple(t, e, i) {
    const { renderPipes: r } = e;
    (r.blendMode.setBlendMode(this, this.groupBlendMode, t),
      r[this.renderPipeId].addRenderable(this, t),
      (this.didViewUpdate = !1));
    const o = this.children,
      a = o.length;
    for (let h = 0; h < a; h++) o[h].collectRenderables(t, e, i);
  }
}
class Ft extends ur {
  constructor(t = D.EMPTY) {
    t instanceof D && (t = { texture: t });
    const { texture: e = D.EMPTY, anchor: i, roundPixels: r, width: n, height: o, ...a } = t;
    (super({ label: 'Sprite', ...a }),
      (this.renderPipeId = 'sprite'),
      (this.batched = !0),
      (this._visualBounds = { minX: 0, maxX: 1, minY: 0, maxY: 0 }),
      (this._anchor = new X({
        _onUpdate: () => {
          this.onViewUpdate();
        },
      })),
      i ? (this.anchor = i) : e.defaultAnchor && (this.anchor = e.defaultAnchor),
      (this.texture = e),
      (this.allowChildren = !1),
      (this.roundPixels = r ?? !1),
      n !== void 0 && (this.width = n),
      o !== void 0 && (this.height = o));
  }
  static from(t, e = !1) {
    return t instanceof D ? new Ft(t) : new Ft(D.from(t, e));
  }
  set texture(t) {
    t || (t = D.EMPTY);
    const e = this._texture;
    e !== t &&
      (e && e.dynamic && e.off('update', this.onViewUpdate, this),
      t.dynamic && t.on('update', this.onViewUpdate, this),
      (this._texture = t),
      this._width && this._setWidth(this._width, this._texture.orig.width),
      this._height && this._setHeight(this._height, this._texture.orig.height),
      this.onViewUpdate());
  }
  get texture() {
    return this._texture;
  }
  get visualBounds() {
    return (Fn(this._visualBounds, this._anchor, this._texture), this._visualBounds);
  }
  get sourceBounds() {
    return (
      F('8.6.1', 'Sprite.sourceBounds is deprecated, use visualBounds instead.'),
      this.visualBounds
    );
  }
  updateBounds() {
    const t = this._anchor,
      e = this._texture,
      i = this._bounds,
      { width: r, height: n } = e.orig;
    ((i.minX = -t._x * r), (i.maxX = i.minX + r), (i.minY = -t._y * n), (i.maxY = i.minY + n));
  }
  destroy(t = !1) {
    if ((super.destroy(t), typeof t == 'boolean' ? t : t?.texture)) {
      const i = typeof t == 'boolean' ? t : t?.textureSource;
      this._texture.destroy(i);
    }
    ((this._texture = null),
      (this._visualBounds = null),
      (this._bounds = null),
      (this._anchor = null),
      (this._gpuData = null));
  }
  get anchor() {
    return this._anchor;
  }
  set anchor(t) {
    typeof t == 'number' ? this._anchor.set(t) : this._anchor.copyFrom(t);
  }
  get width() {
    return Math.abs(this.scale.x) * this._texture.orig.width;
  }
  set width(t) {
    (this._setWidth(t, this._texture.orig.width), (this._width = t));
  }
  get height() {
    return Math.abs(this.scale.y) * this._texture.orig.height;
  }
  set height(t) {
    (this._setHeight(t, this._texture.orig.height), (this._height = t));
  }
  getSize(t) {
    return (
      t || (t = {}),
      (t.width = Math.abs(this.scale.x) * this._texture.orig.width),
      (t.height = Math.abs(this.scale.y) * this._texture.orig.height),
      t
    );
  }
  setSize(t, e) {
    (typeof t == 'object' ? ((e = t.height ?? t.width), (t = t.width)) : (e ?? (e = t)),
      t !== void 0 && this._setWidth(t, this._texture.orig.width),
      e !== void 0 && this._setHeight(e, this._texture.orig.height));
  }
}
const go = new it();
function dr(s, t, e) {
  const i = go;
  ((s.measurable = !0), rr(s, e, i), t.addBoundsMask(i), (s.measurable = !1));
}
function fr(s, t, e) {
  const i = ct.get();
  s.measurable = !0;
  const r = q.get().identity(),
    n = pr(s, e, r);
  (ar(s, i, n), (s.measurable = !1), t.addBoundsMask(i), q.return(r), ct.return(i));
}
function pr(s, t, e) {
  return s
    ? (s !== t && (pr(s.parent, t, e), s.updateLocalTransform(), e.append(s.localTransform)), e)
    : (K('Mask bounds, renderable is not inside the root container'), e);
}
class mr {
  constructor(t) {
    ((this.priority = 0),
      (this.inverse = !1),
      (this.pipe = 'alphaMask'),
      t?.mask && this.init(t.mask));
  }
  init(t) {
    ((this.mask = t),
      (this.renderMaskToTexture = !(t instanceof Ft)),
      (this.mask.renderable = this.renderMaskToTexture),
      (this.mask.includeInBuild = !this.renderMaskToTexture),
      (this.mask.measurable = !1));
  }
  reset() {
    ((this.mask.measurable = !0), (this.mask = null));
  }
  addBounds(t, e) {
    this.inverse || dr(this.mask, t, e);
  }
  addLocalBounds(t, e) {
    fr(this.mask, t, e);
  }
  containsPoint(t, e) {
    const i = this.mask;
    return e(i, t);
  }
  destroy() {
    this.reset();
  }
  static test(t) {
    return t instanceof Ft;
  }
}
mr.extension = G.MaskEffect;
class gr {
  constructor(t) {
    ((this.priority = 0), (this.pipe = 'colorMask'), t?.mask && this.init(t.mask));
  }
  init(t) {
    this.mask = t;
  }
  destroy() {}
  static test(t) {
    return typeof t == 'number';
  }
}
gr.extension = G.MaskEffect;
class xr {
  constructor(t) {
    ((this.priority = 0), (this.pipe = 'stencilMask'), t?.mask && this.init(t.mask));
  }
  init(t) {
    ((this.mask = t), (this.mask.includeInBuild = !1), (this.mask.measurable = !1));
  }
  reset() {
    ((this.mask.measurable = !0), (this.mask.includeInBuild = !0), (this.mask = null));
  }
  addBounds(t, e) {
    dr(this.mask, t, e);
  }
  addLocalBounds(t, e) {
    fr(this.mask, t, e);
  }
  containsPoint(t, e) {
    const i = this.mask;
    return e(i, t);
  }
  destroy() {
    this.reset();
  }
  static test(t) {
    return t instanceof kt;
  }
}
xr.extension = G.MaskEffect;
const xo = {
  createCanvas: (s, t) => {
    const e = document.createElement('canvas');
    return ((e.width = s), (e.height = t), e);
  },
  createImage: () => new Image(),
  getCanvasRenderingContext2D: () => CanvasRenderingContext2D,
  getWebGLRenderingContext: () => WebGLRenderingContext,
  getNavigator: () => navigator,
  getBaseUrl: () => document.baseURI ?? window.location.href,
  getFontFaceSet: () => document.fonts,
  fetch: (s, t) => fetch(s, t),
  parseXML: (s) => new DOMParser().parseFromString(s, 'text/xml'),
};
let ai = xo;
const gt = {
  get() {
    return ai;
  },
  set(s) {
    ai = s;
  },
};
class yr extends rt {
  constructor(t) {
    (t.resource || (t.resource = gt.get().createCanvas()),
      t.width || ((t.width = t.resource.width), t.autoDensity || (t.width /= t.resolution)),
      t.height || ((t.height = t.resource.height), t.autoDensity || (t.height /= t.resolution)),
      super(t),
      (this.uploadMethodId = 'image'),
      (this.autoDensity = t.autoDensity),
      this.resizeCanvas(),
      (this.transparent = !!t.transparent));
  }
  resizeCanvas() {
    (this.autoDensity &&
      'style' in this.resource &&
      ((this.resource.style.width = `${this.width}px`),
      (this.resource.style.height = `${this.height}px`)),
      (this.resource.width !== this.pixelWidth || this.resource.height !== this.pixelHeight) &&
        ((this.resource.width = this.pixelWidth), (this.resource.height = this.pixelHeight)));
  }
  resize(t = this.width, e = this.height, i = this._resolution) {
    const r = super.resize(t, e, i);
    return (r && this.resizeCanvas(), r);
  }
  static test(t) {
    return (
      (globalThis.HTMLCanvasElement && t instanceof HTMLCanvasElement) ||
      (globalThis.OffscreenCanvas && t instanceof OffscreenCanvas)
    );
  }
  get context2D() {
    return this._context2D || (this._context2D = this.resource.getContext('2d'));
  }
}
yr.extension = G.TextureSource;
class Re extends rt {
  constructor(t) {
    (super(t), (this.uploadMethodId = 'image'), (this.autoGarbageCollect = !0));
  }
  static test(t) {
    return (
      (globalThis.HTMLImageElement && t instanceof HTMLImageElement) ||
      (typeof ImageBitmap < 'u' && t instanceof ImageBitmap) ||
      (globalThis.VideoFrame && t instanceof VideoFrame)
    );
  }
}
Re.extension = G.TextureSource;
var ps = ((s) => (
  (s[(s.INTERACTION = 50)] = 'INTERACTION'),
  (s[(s.HIGH = 25)] = 'HIGH'),
  (s[(s.NORMAL = 0)] = 'NORMAL'),
  (s[(s.LOW = -25)] = 'LOW'),
  (s[(s.UTILITY = -50)] = 'UTILITY'),
  s
))(ps || {});
class qe {
  constructor(t, e = null, i = 0, r = !1) {
    ((this.next = null),
      (this.previous = null),
      (this._destroyed = !1),
      (this._fn = t),
      (this._context = e),
      (this.priority = i),
      (this._once = r));
  }
  match(t, e = null) {
    return this._fn === t && this._context === e;
  }
  emit(t) {
    this._fn && (this._context ? this._fn.call(this._context, t) : this._fn(t));
    const e = this.next;
    return (this._once && this.destroy(!0), this._destroyed && (this.next = null), e);
  }
  connect(t) {
    ((this.previous = t),
      t.next && (t.next.previous = this),
      (this.next = t.next),
      (t.next = this));
  }
  destroy(t = !1) {
    ((this._destroyed = !0),
      (this._fn = null),
      (this._context = null),
      this.previous && (this.previous.next = this.next),
      this.next && (this.next.previous = this.previous));
    const e = this.next;
    return ((this.next = t ? null : e), (this.previous = null), e);
  }
}
const _r = class Q {
  constructor() {
    ((this.autoStart = !1),
      (this.deltaTime = 1),
      (this.lastTime = -1),
      (this.speed = 1),
      (this.started = !1),
      (this._requestId = null),
      (this._maxElapsedMS = 100),
      (this._minElapsedMS = 0),
      (this._protected = !1),
      (this._lastFrame = -1),
      (this._head = new qe(null, null, 1 / 0)),
      (this.deltaMS = 1 / Q.targetFPMS),
      (this.elapsedMS = 1 / Q.targetFPMS),
      (this._tick = (t) => {
        ((this._requestId = null),
          this.started &&
            (this.update(t),
            this.started &&
              this._requestId === null &&
              this._head.next &&
              (this._requestId = requestAnimationFrame(this._tick))));
      }));
  }
  _requestIfNeeded() {
    this._requestId === null &&
      this._head.next &&
      ((this.lastTime = performance.now()),
      (this._lastFrame = this.lastTime),
      (this._requestId = requestAnimationFrame(this._tick)));
  }
  _cancelIfNeeded() {
    this._requestId !== null && (cancelAnimationFrame(this._requestId), (this._requestId = null));
  }
  _startIfPossible() {
    this.started ? this._requestIfNeeded() : this.autoStart && this.start();
  }
  add(t, e, i = ps.NORMAL) {
    return this._addListener(new qe(t, e, i));
  }
  addOnce(t, e, i = ps.NORMAL) {
    return this._addListener(new qe(t, e, i, !0));
  }
  _addListener(t) {
    let e = this._head.next,
      i = this._head;
    if (!e) t.connect(i);
    else {
      for (; e; ) {
        if (t.priority > e.priority) {
          t.connect(i);
          break;
        }
        ((i = e), (e = e.next));
      }
      t.previous || t.connect(i);
    }
    return (this._startIfPossible(), this);
  }
  remove(t, e) {
    let i = this._head.next;
    for (; i; ) i.match(t, e) ? (i = i.destroy()) : (i = i.next);
    return (this._head.next || this._cancelIfNeeded(), this);
  }
  get count() {
    if (!this._head) return 0;
    let t = 0,
      e = this._head;
    for (; (e = e.next); ) t++;
    return t;
  }
  start() {
    this.started || ((this.started = !0), this._requestIfNeeded());
  }
  stop() {
    this.started && ((this.started = !1), this._cancelIfNeeded());
  }
  destroy() {
    if (!this._protected) {
      this.stop();
      let t = this._head.next;
      for (; t; ) t = t.destroy(!0);
      (this._head.destroy(), (this._head = null));
    }
  }
  update(t = performance.now()) {
    let e;
    if (t > this.lastTime) {
      if (
        ((e = this.elapsedMS = t - this.lastTime),
        e > this._maxElapsedMS && (e = this._maxElapsedMS),
        (e *= this.speed),
        this._minElapsedMS)
      ) {
        const n = (t - this._lastFrame) | 0;
        if (n < this._minElapsedMS) return;
        this._lastFrame = t - (n % this._minElapsedMS);
      }
      ((this.deltaMS = e), (this.deltaTime = this.deltaMS * Q.targetFPMS));
      const i = this._head;
      let r = i.next;
      for (; r; ) r = r.emit(this);
      i.next || this._cancelIfNeeded();
    } else this.deltaTime = this.deltaMS = this.elapsedMS = 0;
    this.lastTime = t;
  }
  get FPS() {
    return 1e3 / this.elapsedMS;
  }
  get minFPS() {
    return 1e3 / this._maxElapsedMS;
  }
  set minFPS(t) {
    const e = Math.min(this.maxFPS, t),
      i = Math.min(Math.max(0, e) / 1e3, Q.targetFPMS);
    this._maxElapsedMS = 1 / i;
  }
  get maxFPS() {
    return this._minElapsedMS ? Math.round(1e3 / this._minElapsedMS) : 0;
  }
  set maxFPS(t) {
    if (t === 0) this._minElapsedMS = 0;
    else {
      const e = Math.max(this.minFPS, t);
      this._minElapsedMS = 1 / (e / 1e3);
    }
  }
  static get shared() {
    if (!Q._shared) {
      const t = (Q._shared = new Q());
      ((t.autoStart = !0), (t._protected = !0));
    }
    return Q._shared;
  }
  static get system() {
    if (!Q._system) {
      const t = (Q._system = new Q());
      ((t.autoStart = !0), (t._protected = !0));
    }
    return Q._system;
  }
};
_r.targetFPMS = 0.06;
let be = _r,
  Ze;
async function yo() {
  return (
    Ze ??
      (Ze = (async () => {
        const t = gt.get().createCanvas(1, 1).getContext('webgl');
        if (!t) return 'premultiply-alpha-on-upload';
        const e = await new Promise((o) => {
          const a = document.createElement('video');
          ((a.onloadeddata = () => o(a)),
            (a.onerror = () => o(null)),
            (a.autoplay = !1),
            (a.crossOrigin = 'anonymous'),
            (a.preload = 'auto'),
            (a.src =
              'data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAHTEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHGTbuMU6uEElTDZ1OsggEXTbuMU6uEHFO7a1OsggG97AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmoCrXsYMPQkBNgIRMYXZmV0GETGF2ZkSJiEBEAAAAAAAAFlSua8yuAQAAAAAAAEPXgQFzxYgAAAAAAAAAAZyBACK1nIN1bmSIgQCGhVZfVlA5g4EBI+ODhAJiWgDglLCBArqBApqBAlPAgQFVsIRVuYEBElTDZ9Vzc9JjwItjxYgAAAAAAAAAAWfInEWjh0VOQ09ERVJEh49MYXZjIGxpYnZweC12cDlnyKJFo4hEVVJBVElPTkSHlDAwOjAwOjAwLjA0MDAwMDAwMAAAH0O2dcfngQCgwqGggQAAAIJJg0IAABAAFgA4JBwYSgAAICAAEb///4r+AAB1oZ2mm+6BAaWWgkmDQgAAEAAWADgkHBhKAAAgIABIQBxTu2uRu4+zgQC3iveBAfGCAXHwgQM='),
            a.load());
        });
        if (!e) return 'premultiply-alpha-on-upload';
        const i = t.createTexture();
        t.bindTexture(t.TEXTURE_2D, i);
        const r = t.createFramebuffer();
        (t.bindFramebuffer(t.FRAMEBUFFER, r),
          t.framebufferTexture2D(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, i, 0),
          t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1),
          t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL, t.NONE),
          t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, t.RGBA, t.UNSIGNED_BYTE, e));
        const n = new Uint8Array(4);
        return (
          t.readPixels(0, 0, 1, 1, t.RGBA, t.UNSIGNED_BYTE, n),
          t.deleteFramebuffer(r),
          t.deleteTexture(i),
          t.getExtension('WEBGL_lose_context')?.loseContext(),
          n[0] <= n[3] ? 'premultiplied-alpha' : 'premultiply-alpha-on-upload'
        );
      })()),
    Ze
  );
}
const Be = class br extends rt {
  constructor(t) {
    (super(t),
      (this.isReady = !1),
      (this.uploadMethodId = 'video'),
      (t = { ...br.defaultOptions, ...t }),
      (this._autoUpdate = !0),
      (this._isConnectedToTicker = !1),
      (this._updateFPS = t.updateFPS || 0),
      (this._msToNextUpdate = 0),
      (this.autoPlay = t.autoPlay !== !1),
      (this.alphaMode = t.alphaMode ?? 'premultiply-alpha-on-upload'),
      (this._videoFrameRequestCallback = this._videoFrameRequestCallback.bind(this)),
      (this._videoFrameRequestCallbackHandle = null),
      (this._load = null),
      (this._resolve = null),
      (this._reject = null),
      (this._onCanPlay = this._onCanPlay.bind(this)),
      (this._onCanPlayThrough = this._onCanPlayThrough.bind(this)),
      (this._onError = this._onError.bind(this)),
      (this._onPlayStart = this._onPlayStart.bind(this)),
      (this._onPlayStop = this._onPlayStop.bind(this)),
      (this._onSeeked = this._onSeeked.bind(this)),
      t.autoLoad !== !1 && this.load());
  }
  updateFrame() {
    if (!this.destroyed) {
      if (this._updateFPS) {
        const t = be.shared.elapsedMS * this.resource.playbackRate;
        this._msToNextUpdate = Math.floor(this._msToNextUpdate - t);
      }
      ((!this._updateFPS || this._msToNextUpdate <= 0) &&
        (this._msToNextUpdate = this._updateFPS ? Math.floor(1e3 / this._updateFPS) : 0),
        this.isValid && this.update());
    }
  }
  _videoFrameRequestCallback() {
    (this.updateFrame(),
      this.destroyed
        ? (this._videoFrameRequestCallbackHandle = null)
        : (this._videoFrameRequestCallbackHandle = this.resource.requestVideoFrameCallback(
            this._videoFrameRequestCallback,
          )));
  }
  get isValid() {
    return !!this.resource.videoWidth && !!this.resource.videoHeight;
  }
  async load() {
    if (this._load) return this._load;
    const t = this.resource,
      e = this.options;
    return (
      (t.readyState === t.HAVE_ENOUGH_DATA || t.readyState === t.HAVE_FUTURE_DATA) &&
        t.width &&
        t.height &&
        (t.complete = !0),
      t.addEventListener('play', this._onPlayStart),
      t.addEventListener('pause', this._onPlayStop),
      t.addEventListener('seeked', this._onSeeked),
      this._isSourceReady()
        ? this._mediaReady()
        : (e.preload || t.addEventListener('canplay', this._onCanPlay),
          t.addEventListener('canplaythrough', this._onCanPlayThrough),
          t.addEventListener('error', this._onError, !0)),
      (this.alphaMode = await yo()),
      (this._load = new Promise((i, r) => {
        this.isValid
          ? i(this)
          : ((this._resolve = i),
            (this._reject = r),
            e.preloadTimeoutMs !== void 0 &&
              (this._preloadTimeout = setTimeout(() => {
                this._onError(
                  new ErrorEvent(`Preload exceeded timeout of ${e.preloadTimeoutMs}ms`),
                );
              })),
            t.load());
      })),
      this._load
    );
  }
  _onError(t) {
    (this.resource.removeEventListener('error', this._onError, !0),
      this.emit('error', t),
      this._reject && (this._reject(t), (this._reject = null), (this._resolve = null)));
  }
  _isSourcePlaying() {
    const t = this.resource;
    return !t.paused && !t.ended;
  }
  _isSourceReady() {
    return this.resource.readyState > 2;
  }
  _onPlayStart() {
    (this.isValid || this._mediaReady(), this._configureAutoUpdate());
  }
  _onPlayStop() {
    this._configureAutoUpdate();
  }
  _onSeeked() {
    this._autoUpdate &&
      !this._isSourcePlaying() &&
      ((this._msToNextUpdate = 0), this.updateFrame(), (this._msToNextUpdate = 0));
  }
  _onCanPlay() {
    (this.resource.removeEventListener('canplay', this._onCanPlay), this._mediaReady());
  }
  _onCanPlayThrough() {
    (this.resource.removeEventListener('canplaythrough', this._onCanPlay),
      this._preloadTimeout && (clearTimeout(this._preloadTimeout), (this._preloadTimeout = void 0)),
      this._mediaReady());
  }
  _mediaReady() {
    const t = this.resource;
    (this.isValid && ((this.isReady = !0), this.resize(t.videoWidth, t.videoHeight)),
      (this._msToNextUpdate = 0),
      this.updateFrame(),
      (this._msToNextUpdate = 0),
      this._resolve && (this._resolve(this), (this._resolve = null), (this._reject = null)),
      this._isSourcePlaying() ? this._onPlayStart() : this.autoPlay && this.resource.play());
  }
  destroy() {
    this._configureAutoUpdate();
    const t = this.resource;
    (t &&
      (t.removeEventListener('play', this._onPlayStart),
      t.removeEventListener('pause', this._onPlayStop),
      t.removeEventListener('seeked', this._onSeeked),
      t.removeEventListener('canplay', this._onCanPlay),
      t.removeEventListener('canplaythrough', this._onCanPlayThrough),
      t.removeEventListener('error', this._onError, !0),
      t.pause(),
      (t.src = ''),
      t.load()),
      super.destroy());
  }
  get autoUpdate() {
    return this._autoUpdate;
  }
  set autoUpdate(t) {
    t !== this._autoUpdate && ((this._autoUpdate = t), this._configureAutoUpdate());
  }
  get updateFPS() {
    return this._updateFPS;
  }
  set updateFPS(t) {
    t !== this._updateFPS && ((this._updateFPS = t), this._configureAutoUpdate());
  }
  _configureAutoUpdate() {
    this._autoUpdate && this._isSourcePlaying()
      ? !this._updateFPS && this.resource.requestVideoFrameCallback
        ? (this._isConnectedToTicker &&
            (be.shared.remove(this.updateFrame, this),
            (this._isConnectedToTicker = !1),
            (this._msToNextUpdate = 0)),
          this._videoFrameRequestCallbackHandle === null &&
            (this._videoFrameRequestCallbackHandle = this.resource.requestVideoFrameCallback(
              this._videoFrameRequestCallback,
            )))
        : (this._videoFrameRequestCallbackHandle !== null &&
            (this.resource.cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle),
            (this._videoFrameRequestCallbackHandle = null)),
          this._isConnectedToTicker ||
            (be.shared.add(this.updateFrame, this),
            (this._isConnectedToTicker = !0),
            (this._msToNextUpdate = 0)))
      : (this._videoFrameRequestCallbackHandle !== null &&
          (this.resource.cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle),
          (this._videoFrameRequestCallbackHandle = null)),
        this._isConnectedToTicker &&
          (be.shared.remove(this.updateFrame, this),
          (this._isConnectedToTicker = !1),
          (this._msToNextUpdate = 0)));
  }
  static test(t) {
    return globalThis.HTMLVideoElement && t instanceof HTMLVideoElement;
  }
};
Be.extension = G.TextureSource;
Be.defaultOptions = {
  ...rt.defaultOptions,
  autoLoad: !0,
  autoPlay: !0,
  updateFPS: 0,
  crossorigin: !0,
  loop: !1,
  muted: !0,
  playsinline: !0,
  preload: !1,
};
Be.MIME_TYPES = { ogv: 'video/ogg', mov: 'video/quicktime', m4v: 'video/mp4' };
let _o = Be;
const Rt = (s, t, e = !1) => (
  Array.isArray(s) || (s = [s]),
  t ? s.map((i) => (typeof i == 'string' || e ? t(i) : i)) : s
);
class bo {
  constructor() {
    ((this._parsers = []), (this._cache = new Map()), (this._cacheMap = new Map()));
  }
  reset() {
    (this._cacheMap.clear(), this._cache.clear());
  }
  has(t) {
    return this._cache.has(t);
  }
  get(t) {
    const e = this._cache.get(t);
    return (e || K(`[Assets] Asset id ${t} was not found in the Cache`), e);
  }
  set(t, e) {
    const i = Rt(t);
    let r;
    for (let h = 0; h < this.parsers.length; h++) {
      const l = this.parsers[h];
      if (l.test(e)) {
        r = l.getCacheableAssets(i, e);
        break;
      }
    }
    const n = new Map(Object.entries(r || {}));
    r ||
      i.forEach((h) => {
        n.set(h, e);
      });
    const o = [...n.keys()],
      a = { cacheKeys: o, keys: i };
    (i.forEach((h) => {
      this._cacheMap.set(h, a);
    }),
      o.forEach((h) => {
        const l = r ? r[h] : e;
        (this._cache.has(h) && this._cache.get(h) !== l && K('[Cache] already has key:', h),
          this._cache.set(h, n.get(h)));
      }));
  }
  remove(t) {
    if (!this._cacheMap.has(t)) {
      K(`[Assets] Asset id ${t} was not found in the Cache`);
      return;
    }
    const e = this._cacheMap.get(t);
    (e.cacheKeys.forEach((r) => {
      this._cache.delete(r);
    }),
      e.keys.forEach((r) => {
        this._cacheMap.delete(r);
      }));
  }
  get parsers() {
    return this._parsers;
  }
}
const Gt = new bo(),
  ms = [];
et.handleByList(G.TextureSource, ms);
function wr(s = {}) {
  const t = s && s.resource,
    e = t ? s.resource : s,
    i = t ? s : { resource: s };
  for (let r = 0; r < ms.length; r++) {
    const n = ms[r];
    if (n.test(e)) return new n(i);
  }
  throw new Error(`Could not find a source type for resource: ${i.resource}`);
}
function wo(s = {}, t = !1) {
  const e = s && s.resource,
    i = e ? s.resource : s,
    r = e ? s : { resource: s };
  if (!t && Gt.has(i)) return Gt.get(i);
  const n = new D({ source: wr(r) });
  return (
    n.on('destroy', () => {
      Gt.has(i) && Gt.remove(i);
    }),
    t || Gt.set(i, n),
    n
  );
}
function vo(s, t = !1) {
  return typeof s == 'string' ? Gt.get(s) : s instanceof rt ? new D({ source: s }) : wo(s, t);
}
D.from = vo;
rt.from = wr;
et.add(mr, gr, xr, _o, Re, yr, Ps);
var vr = ((s) => (
  (s[(s.Low = 0)] = 'Low'),
  (s[(s.Normal = 1)] = 'Normal'),
  (s[(s.High = 2)] = 'High'),
  s
))(vr || {});
function st(s) {
  if (typeof s != 'string')
    throw new TypeError(`Path must be a string. Received ${JSON.stringify(s)}`);
}
function $t(s) {
  return s.split('?')[0].split('#')[0];
}
function Co(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function Ao(s, t, e) {
  return s.replace(new RegExp(Co(t), 'g'), e);
}
function So(s, t) {
  let e = '',
    i = 0,
    r = -1,
    n = 0,
    o = -1;
  for (let a = 0; a <= s.length; ++a) {
    if (a < s.length) o = s.charCodeAt(a);
    else {
      if (o === 47) break;
      o = 47;
    }
    if (o === 47) {
      if (!(r === a - 1 || n === 1))
        if (r !== a - 1 && n === 2) {
          if (
            e.length < 2 ||
            i !== 2 ||
            e.charCodeAt(e.length - 1) !== 46 ||
            e.charCodeAt(e.length - 2) !== 46
          ) {
            if (e.length > 2) {
              const h = e.lastIndexOf('/');
              if (h !== e.length - 1) {
                (h === -1
                  ? ((e = ''), (i = 0))
                  : ((e = e.slice(0, h)), (i = e.length - 1 - e.lastIndexOf('/'))),
                  (r = a),
                  (n = 0));
                continue;
              }
            } else if (e.length === 2 || e.length === 1) {
              ((e = ''), (i = 0), (r = a), (n = 0));
              continue;
            }
          }
        } else
          (e.length > 0 ? (e += `/${s.slice(r + 1, a)}`) : (e = s.slice(r + 1, a)),
            (i = a - r - 1));
      ((r = a), (n = 0));
    } else o === 46 && n !== -1 ? ++n : (n = -1);
  }
  return e;
}
const re = {
  toPosix(s) {
    return Ao(s, '\\', '/');
  },
  isUrl(s) {
    return /^https?:/.test(this.toPosix(s));
  },
  isDataUrl(s) {
    return /^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}()_|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s<>]*?)$/i.test(
      s,
    );
  },
  isBlobUrl(s) {
    return s.startsWith('blob:');
  },
  hasProtocol(s) {
    return /^[^/:]+:/.test(this.toPosix(s));
  },
  getProtocol(s) {
    (st(s), (s = this.toPosix(s)));
    const t = /^file:\/\/\//.exec(s);
    if (t) return t[0];
    const e = /^[^/:]+:\/{0,2}/.exec(s);
    return e ? e[0] : '';
  },
  toAbsolute(s, t, e) {
    if ((st(s), this.isDataUrl(s) || this.isBlobUrl(s))) return s;
    const i = $t(this.toPosix(t ?? gt.get().getBaseUrl())),
      r = $t(this.toPosix(e ?? this.rootname(i)));
    return (
      (s = this.toPosix(s)),
      s.startsWith('/') ? re.join(r, s.slice(1)) : this.isAbsolute(s) ? s : this.join(i, s)
    );
  },
  normalize(s) {
    if ((st(s), s.length === 0)) return '.';
    if (this.isDataUrl(s) || this.isBlobUrl(s)) return s;
    s = this.toPosix(s);
    let t = '';
    const e = s.startsWith('/');
    this.hasProtocol(s) && ((t = this.rootname(s)), (s = s.slice(t.length)));
    const i = s.endsWith('/');
    return ((s = So(s)), s.length > 0 && i && (s += '/'), e ? `/${s}` : t + s);
  },
  isAbsolute(s) {
    return (st(s), (s = this.toPosix(s)), this.hasProtocol(s) ? !0 : s.startsWith('/'));
  },
  join(...s) {
    if (s.length === 0) return '.';
    let t;
    for (let e = 0; e < s.length; ++e) {
      const i = s[e];
      if ((st(i), i.length > 0))
        if (t === void 0) t = i;
        else {
          const r = s[e - 1] ?? '';
          this.joinExtensions.includes(this.extname(r).toLowerCase())
            ? (t += `/../${i}`)
            : (t += `/${i}`);
        }
    }
    return t === void 0 ? '.' : this.normalize(t);
  },
  dirname(s) {
    if ((st(s), s.length === 0)) return '.';
    s = this.toPosix(s);
    let t = s.charCodeAt(0);
    const e = t === 47;
    let i = -1,
      r = !0;
    const n = this.getProtocol(s),
      o = s;
    s = s.slice(n.length);
    for (let a = s.length - 1; a >= 1; --a)
      if (((t = s.charCodeAt(a)), t === 47)) {
        if (!r) {
          i = a;
          break;
        }
      } else r = !1;
    return i === -1
      ? e
        ? '/'
        : this.isUrl(o)
          ? n + s
          : n
      : e && i === 1
        ? '//'
        : n + s.slice(0, i);
  },
  rootname(s) {
    (st(s), (s = this.toPosix(s)));
    let t = '';
    if ((s.startsWith('/') ? (t = '/') : (t = this.getProtocol(s)), this.isUrl(s))) {
      const e = s.indexOf('/', t.length);
      (e !== -1 ? (t = s.slice(0, e)) : (t = s), t.endsWith('/') || (t += '/'));
    }
    return t;
  },
  basename(s, t) {
    (st(s), t && st(t), (s = $t(this.toPosix(s))));
    let e = 0,
      i = -1,
      r = !0,
      n;
    if (t !== void 0 && t.length > 0 && t.length <= s.length) {
      if (t.length === s.length && t === s) return '';
      let o = t.length - 1,
        a = -1;
      for (n = s.length - 1; n >= 0; --n) {
        const h = s.charCodeAt(n);
        if (h === 47) {
          if (!r) {
            e = n + 1;
            break;
          }
        } else
          (a === -1 && ((r = !1), (a = n + 1)),
            o >= 0 && (h === t.charCodeAt(o) ? --o === -1 && (i = n) : ((o = -1), (i = a))));
      }
      return (e === i ? (i = a) : i === -1 && (i = s.length), s.slice(e, i));
    }
    for (n = s.length - 1; n >= 0; --n)
      if (s.charCodeAt(n) === 47) {
        if (!r) {
          e = n + 1;
          break;
        }
      } else i === -1 && ((r = !1), (i = n + 1));
    return i === -1 ? '' : s.slice(e, i);
  },
  extname(s) {
    (st(s), (s = $t(this.toPosix(s))));
    let t = -1,
      e = 0,
      i = -1,
      r = !0,
      n = 0;
    for (let o = s.length - 1; o >= 0; --o) {
      const a = s.charCodeAt(o);
      if (a === 47) {
        if (!r) {
          e = o + 1;
          break;
        }
        continue;
      }
      (i === -1 && ((r = !1), (i = o + 1)),
        a === 46 ? (t === -1 ? (t = o) : n !== 1 && (n = 1)) : t !== -1 && (n = -1));
    }
    return t === -1 || i === -1 || n === 0 || (n === 1 && t === i - 1 && t === e + 1)
      ? ''
      : s.slice(t, i);
  },
  parse(s) {
    st(s);
    const t = { root: '', dir: '', base: '', ext: '', name: '' };
    if (s.length === 0) return t;
    s = $t(this.toPosix(s));
    let e = s.charCodeAt(0);
    const i = this.isAbsolute(s);
    let r;
    ((t.root = this.rootname(s)), i || this.hasProtocol(s) ? (r = 1) : (r = 0));
    let n = -1,
      o = 0,
      a = -1,
      h = !0,
      l = s.length - 1,
      c = 0;
    for (; l >= r; --l) {
      if (((e = s.charCodeAt(l)), e === 47)) {
        if (!h) {
          o = l + 1;
          break;
        }
        continue;
      }
      (a === -1 && ((h = !1), (a = l + 1)),
        e === 46 ? (n === -1 ? (n = l) : c !== 1 && (c = 1)) : n !== -1 && (c = -1));
    }
    return (
      n === -1 || a === -1 || c === 0 || (c === 1 && n === a - 1 && n === o + 1)
        ? a !== -1 &&
          (o === 0 && i ? (t.base = t.name = s.slice(1, a)) : (t.base = t.name = s.slice(o, a)))
        : (o === 0 && i
            ? ((t.name = s.slice(1, n)), (t.base = s.slice(1, a)))
            : ((t.name = s.slice(o, n)), (t.base = s.slice(o, a))),
          (t.ext = s.slice(n, a))),
      (t.dir = this.dirname(s)),
      t
    );
  },
  sep: '/',
  delimiter: ':',
  joinExtensions: ['.html'],
};
function Cr(s, t, e, i, r) {
  const n = t[e];
  for (let o = 0; o < n.length; o++) {
    const a = n[o];
    e < t.length - 1 ? Cr(s.replace(i[e], a), t, e + 1, i, r) : r.push(s.replace(i[e], a));
  }
}
function Mo(s) {
  const t = /\{(.*?)\}/g,
    e = s.match(t),
    i = [];
  if (e) {
    const r = [];
    (e.forEach((n) => {
      const o = n.substring(1, n.length - 1).split(',');
      r.push(o);
    }),
      Cr(s, r, 0, e, i));
  } else i.push(s);
  return i;
}
const hi = (s) => !Array.isArray(s);
class Ar {
  constructor() {
    ((this._defaultBundleIdentifierOptions = {
      connector: '-',
      createBundleAssetId: (t, e) => `${t}${this._bundleIdConnector}${e}`,
      extractAssetIdFromBundle: (t, e) => e.replace(`${t}${this._bundleIdConnector}`, ''),
    }),
      (this._bundleIdConnector = this._defaultBundleIdentifierOptions.connector),
      (this._createBundleAssetId = this._defaultBundleIdentifierOptions.createBundleAssetId),
      (this._extractAssetIdFromBundle =
        this._defaultBundleIdentifierOptions.extractAssetIdFromBundle),
      (this._assetMap = {}),
      (this._preferredOrder = []),
      (this._parsers = []),
      (this._resolverHash = {}),
      (this._bundles = {}));
  }
  setBundleIdentifier(t) {
    if (
      ((this._bundleIdConnector = t.connector ?? this._bundleIdConnector),
      (this._createBundleAssetId = t.createBundleAssetId ?? this._createBundleAssetId),
      (this._extractAssetIdFromBundle =
        t.extractAssetIdFromBundle ?? this._extractAssetIdFromBundle),
      this._extractAssetIdFromBundle('foo', this._createBundleAssetId('foo', 'bar')) !== 'bar')
    )
      throw new Error('[Resolver] GenerateBundleAssetId are not working correctly');
  }
  prefer(...t) {
    (t.forEach((e) => {
      (this._preferredOrder.push(e), e.priority || (e.priority = Object.keys(e.params)));
    }),
      (this._resolverHash = {}));
  }
  set basePath(t) {
    this._basePath = t;
  }
  get basePath() {
    return this._basePath;
  }
  set rootPath(t) {
    this._rootPath = t;
  }
  get rootPath() {
    return this._rootPath;
  }
  get parsers() {
    return this._parsers;
  }
  reset() {
    (this.setBundleIdentifier(this._defaultBundleIdentifierOptions),
      (this._assetMap = {}),
      (this._preferredOrder = []),
      (this._resolverHash = {}),
      (this._rootPath = null),
      (this._basePath = null),
      (this._manifest = null),
      (this._bundles = {}),
      (this._defaultSearchParams = null));
  }
  setDefaultSearchParams(t) {
    if (typeof t == 'string') this._defaultSearchParams = t;
    else {
      const e = t;
      this._defaultSearchParams = Object.keys(e)
        .map((i) => `${encodeURIComponent(i)}=${encodeURIComponent(e[i])}`)
        .join('&');
    }
  }
  getAlias(t) {
    const { alias: e, src: i } = t;
    return Rt(
      e || i,
      (n) =>
        typeof n == 'string'
          ? n
          : Array.isArray(n)
            ? n.map((o) => o?.src ?? o)
            : n?.src
              ? n.src
              : n,
      !0,
    );
  }
  addManifest(t) {
    (this._manifest && K('[Resolver] Manifest already exists, this will be overwritten'),
      (this._manifest = t),
      t.bundles.forEach((e) => {
        this.addBundle(e.name, e.assets);
      }));
  }
  addBundle(t, e) {
    const i = [];
    let r = e;
    (Array.isArray(e) ||
      (r = Object.entries(e).map(([n, o]) =>
        typeof o == 'string' || Array.isArray(o) ? { alias: n, src: o } : { alias: n, ...o },
      )),
      r.forEach((n) => {
        const o = n.src,
          a = n.alias;
        let h;
        if (typeof a == 'string') {
          const l = this._createBundleAssetId(t, a);
          (i.push(l), (h = [a, l]));
        } else {
          const l = a.map((c) => this._createBundleAssetId(t, c));
          (i.push(...l), (h = [...a, ...l]));
        }
        this.add({ ...n, alias: h, src: o });
      }),
      (this._bundles[t] = i));
  }
  add(t) {
    const e = [];
    Array.isArray(t) ? e.push(...t) : e.push(t);
    let i;
    ((i = (n) => {
      this.hasKey(n) && K(`[Resolver] already has key: ${n} overwriting`);
    }),
      Rt(e).forEach((n) => {
        const { src: o } = n;
        let { data: a, format: h, loadParser: l, parser: c } = n;
        const u = Rt(o).map((m) => (typeof m == 'string' ? Mo(m) : Array.isArray(m) ? m : [m])),
          f = this.getAlias(n);
        Array.isArray(f) ? f.forEach(i) : i(f);
        const d = [];
        (u.forEach((m) => {
          m.forEach((g) => {
            let p = {};
            if (typeof g != 'object') {
              p.src = g;
              for (let y = 0; y < this._parsers.length; y++) {
                const x = this._parsers[y];
                if (x.test(g)) {
                  p = x.parse(g);
                  break;
                }
              }
            } else
              ((a = g.data ?? a),
                (h = g.format ?? h),
                (g.loadParser || g.parser) && ((l = g.loadParser ?? l), (c = g.parser ?? c)),
                (p = { ...p, ...g }));
            if (!f) throw new Error(`[Resolver] alias is undefined for this asset: ${p.src}`);
            ((p = this._buildResolvedAsset(p, {
              aliases: f,
              data: a,
              format: h,
              loadParser: l,
              parser: c,
            })),
              d.push(p));
          });
        }),
          f.forEach((m) => {
            this._assetMap[m] = d;
          }));
      }));
  }
  resolveBundle(t) {
    const e = hi(t);
    t = Rt(t);
    const i = {};
    return (
      t.forEach((r) => {
        const n = this._bundles[r];
        if (n) {
          const o = this.resolve(n),
            a = {};
          for (const h in o) {
            const l = o[h];
            a[this._extractAssetIdFromBundle(r, h)] = l;
          }
          i[r] = a;
        }
      }),
      e ? i[t[0]] : i
    );
  }
  resolveUrl(t) {
    const e = this.resolve(t);
    if (typeof t != 'string') {
      const i = {};
      for (const r in e) i[r] = e[r].src;
      return i;
    }
    return e.src;
  }
  resolve(t) {
    const e = hi(t);
    t = Rt(t);
    const i = {};
    return (
      t.forEach((r) => {
        if (!this._resolverHash[r])
          if (this._assetMap[r]) {
            let n = this._assetMap[r];
            const o = this._getPreferredOrder(n);
            (o?.priority.forEach((a) => {
              o.params[a].forEach((h) => {
                const l = n.filter((c) => (c[a] ? c[a] === h : !1));
                l.length && (n = l);
              });
            }),
              (this._resolverHash[r] = n[0]));
          } else this._resolverHash[r] = this._buildResolvedAsset({ alias: [r], src: r }, {});
        i[r] = this._resolverHash[r];
      }),
      e ? i[t[0]] : i
    );
  }
  hasKey(t) {
    return !!this._assetMap[t];
  }
  hasBundle(t) {
    return !!this._bundles[t];
  }
  _getPreferredOrder(t) {
    for (let e = 0; e < t.length; e++) {
      const i = t[e],
        r = this._preferredOrder.find((n) => n.params.format.includes(i.format));
      if (r) return r;
    }
    return this._preferredOrder[0];
  }
  _appendDefaultSearchParams(t) {
    if (!this._defaultSearchParams) return t;
    const e = /\?/.test(t) ? '&' : '?';
    return `${t}${e}${this._defaultSearchParams}`;
  }
  _buildResolvedAsset(t, e) {
    const { aliases: i, data: r, loadParser: n, parser: o, format: a } = e;
    return (
      (this._basePath || this._rootPath) &&
        (t.src = re.toAbsolute(t.src, this._basePath, this._rootPath)),
      (t.alias = i ?? t.alias ?? [t.src]),
      (t.src = this._appendDefaultSearchParams(t.src)),
      (t.data = { ...(r || {}), ...t.data }),
      (t.loadParser = n ?? t.loadParser),
      (t.parser = o ?? t.parser),
      (t.format = a ?? t.format ?? Po(t.src)),
      t
    );
  }
}
Ar.RETINA_PREFIX = /@([0-9\.]+)x/;
function Po(s) {
  return s.split('.').pop().split('?').shift().split('#').shift();
}
const li = (s, t) => {
    const e = t.split('?')[1];
    return (e && (s += `?${e}`), s);
  },
  Sr = class Kt {
    constructor(t, e) {
      this.linkedSheets = [];
      let i = t;
      t?.source instanceof rt && (i = { texture: t, data: e });
      const { texture: r, data: n, cachePrefix: o = '' } = i;
      ((this.cachePrefix = o),
        (this._texture = r instanceof D ? r : null),
        (this.textureSource = r.source),
        (this.textures = {}),
        (this.animations = {}),
        (this.data = n));
      const a = parseFloat(n.meta.scale);
      (a
        ? ((this.resolution = a), (r.source.resolution = this.resolution))
        : (this.resolution = r.source._resolution),
        (this._frames = this.data.frames),
        (this._frameKeys = Object.keys(this._frames)),
        (this._batchIndex = 0),
        (this._callback = null));
    }
    parse() {
      return new Promise((t) => {
        ((this._callback = t),
          (this._batchIndex = 0),
          this._frameKeys.length <= Kt.BATCH_SIZE
            ? (this._processFrames(0), this._processAnimations(), this._parseComplete())
            : this._nextBatch());
      });
    }
    _processFrames(t) {
      let e = t;
      const i = Kt.BATCH_SIZE;
      for (; e - t < i && e < this._frameKeys.length; ) {
        const r = this._frameKeys[e],
          n = this._frames[r],
          o = n.frame;
        if (o) {
          let a = null,
            h = null;
          const l = n.trimmed !== !1 && n.sourceSize ? n.sourceSize : n.frame,
            c = new $(0, 0, Math.floor(l.w) / this.resolution, Math.floor(l.h) / this.resolution);
          (n.rotated
            ? (a = new $(
                Math.floor(o.x) / this.resolution,
                Math.floor(o.y) / this.resolution,
                Math.floor(o.h) / this.resolution,
                Math.floor(o.w) / this.resolution,
              ))
            : (a = new $(
                Math.floor(o.x) / this.resolution,
                Math.floor(o.y) / this.resolution,
                Math.floor(o.w) / this.resolution,
                Math.floor(o.h) / this.resolution,
              )),
            n.trimmed !== !1 &&
              n.spriteSourceSize &&
              (h = new $(
                Math.floor(n.spriteSourceSize.x) / this.resolution,
                Math.floor(n.spriteSourceSize.y) / this.resolution,
                Math.floor(o.w) / this.resolution,
                Math.floor(o.h) / this.resolution,
              )),
            (this.textures[r] = new D({
              source: this.textureSource,
              frame: a,
              orig: c,
              trim: h,
              rotate: n.rotated ? 2 : 0,
              defaultAnchor: n.anchor,
              defaultBorders: n.borders,
              label: r.toString(),
            })));
        }
        e++;
      }
    }
    _processAnimations() {
      const t = this.data.animations || {};
      for (const e in t) {
        this.animations[e] = [];
        for (let i = 0; i < t[e].length; i++) {
          const r = t[e][i];
          this.animations[e].push(this.textures[r]);
        }
      }
    }
    _parseComplete() {
      const t = this._callback;
      ((this._callback = null), (this._batchIndex = 0), t.call(this, this.textures));
    }
    _nextBatch() {
      (this._processFrames(this._batchIndex * Kt.BATCH_SIZE),
        this._batchIndex++,
        setTimeout(() => {
          this._batchIndex * Kt.BATCH_SIZE < this._frameKeys.length
            ? this._nextBatch()
            : (this._processAnimations(), this._parseComplete());
        }, 0));
    }
    destroy(t = !1) {
      for (const e in this.textures) this.textures[e].destroy();
      ((this._frames = null),
        (this._frameKeys = null),
        (this.data = null),
        (this.textures = null),
        t && (this._texture?.destroy(), this.textureSource.destroy()),
        (this._texture = null),
        (this.textureSource = null),
        (this.linkedSheets = []));
    }
  };
Sr.BATCH_SIZE = 1e3;
let ci = Sr;
const To = [
  'jpg',
  'png',
  'jpeg',
  'avif',
  'webp',
  'basis',
  'etc2',
  'bc7',
  'bc6h',
  'bc5',
  'bc4',
  'bc3',
  'bc2',
  'bc1',
  'eac',
  'astc',
];
function Mr(s, t, e) {
  const i = {};
  if (
    (s.forEach((r) => {
      i[r] = t;
    }),
    Object.keys(t.textures).forEach((r) => {
      i[`${t.cachePrefix}${r}`] = t.textures[r];
    }),
    !e)
  ) {
    const r = re.dirname(s[0]);
    t.linkedSheets.forEach((n, o) => {
      const a = Mr([`${r}/${t.data.meta.related_multi_packs[o]}`], n, !0);
      Object.assign(i, a);
    });
  }
  return i;
}
const ko = {
  extension: G.Asset,
  cache: { test: (s) => s instanceof ci, getCacheableAssets: (s, t) => Mr(s, t, !1) },
  resolver: {
    extension: { type: G.ResolveParser, name: 'resolveSpritesheet' },
    test: (s) => {
      const e = s.split('?')[0].split('.'),
        i = e.pop(),
        r = e.pop();
      return i === 'json' && To.includes(r);
    },
    parse: (s) => {
      const t = s.split('.');
      return {
        resolution: parseFloat(Ar.RETINA_PREFIX.exec(s)?.[1] ?? '1'),
        format: t[t.length - 2],
        src: s,
      };
    },
  },
  loader: {
    name: 'spritesheetLoader',
    id: 'spritesheet',
    extension: { type: G.LoadParser, priority: vr.Normal, name: 'spritesheetLoader' },
    async testParse(s, t) {
      return re.extname(t.src).toLowerCase() === '.json' && !!s.frames;
    },
    async parse(s, t, e) {
      const { texture: i, imageFilename: r, textureOptions: n, cachePrefix: o } = t?.data ?? {};
      let a = re.dirname(t.src);
      a && a.lastIndexOf('/') !== a.length - 1 && (a += '/');
      let h;
      if (i instanceof D) h = i;
      else {
        const u = li(a + (r ?? s.meta.image), t.src);
        h = (await e.load([{ src: u, data: n }]))[u];
      }
      const l = new ci({ texture: h.source, data: s, cachePrefix: o });
      await l.parse();
      const c = s?.meta?.related_multi_packs;
      if (Array.isArray(c)) {
        const u = [];
        for (const d of c) {
          if (typeof d != 'string') continue;
          let m = a + d;
          t.data?.ignoreMultiPack ||
            ((m = li(m, t.src)),
            u.push(e.load({ src: m, data: { textureOptions: n, ignoreMultiPack: !0 } })));
        }
        const f = await Promise.all(u);
        ((l.linkedSheets = f),
          f.forEach((d) => {
            d.linkedSheets = [l].concat(l.linkedSheets.filter((m) => m !== d));
          }));
      }
      return l;
    },
    async unload(s, t, e) {
      (await e.unload(s.textureSource._sourceOrigin), s.destroy(!1));
    },
  },
};
et.add(ko);
const Ke = Object.create(null),
  ui = Object.create(null);
function Is(s, t) {
  let e = ui[s];
  return (e === void 0 && (Ke[t] === void 0 && (Ke[t] = 1), (ui[s] = e = Ke[t]++)), e);
}
let we;
function Pr() {
  return (
    (!we || we?.isContextLost()) && (we = gt.get().createCanvas().getContext('webgl', {})),
    we
  );
}
let ve;
function Io() {
  if (!ve) {
    ve = 'mediump';
    const s = Pr();
    s &&
      s.getShaderPrecisionFormat &&
      (ve = s.getShaderPrecisionFormat(s.FRAGMENT_SHADER, s.HIGH_FLOAT).precision
        ? 'highp'
        : 'mediump');
  }
  return ve;
}
function Eo(s, t, e) {
  return t
    ? s
    : e
      ? ((s = s.replace('out vec4 finalColor;', '')),
        `

        #ifdef GL_ES // This checks if it is WebGL1
        #define in varying
        #define finalColor gl_FragColor
        #define texture texture2D
        #endif
        ${s}
        `)
      : `

        #ifdef GL_ES // This checks if it is WebGL1
        #define in attribute
        #define out varying
        #endif
        ${s}
        `;
}
function Ro(s, t, e) {
  const i = e ? t.maxSupportedFragmentPrecision : t.maxSupportedVertexPrecision;
  if (s.substring(0, 9) !== 'precision') {
    let r = e ? t.requestedFragmentPrecision : t.requestedVertexPrecision;
    return (
      r === 'highp' && i !== 'highp' && (r = 'mediump'),
      `precision ${r} float;
${s}`
    );
  } else if (i !== 'highp' && s.substring(0, 15) === 'precision highp')
    return s.replace('precision highp', 'precision mediump');
  return s;
}
function Go(s, t) {
  return t
    ? `#version 300 es
${s}`
    : s;
}
const Bo = {},
  Fo = {};
function Do(s, { name: t = 'pixi-program' }, e = !0) {
  ((t = t.replace(/\s+/g, '-')), (t += e ? '-fragment' : '-vertex'));
  const i = e ? Bo : Fo;
  return (
    i[t] ? (i[t]++, (t += `-${i[t]}`)) : (i[t] = 1),
    s.indexOf('#define SHADER_NAME') !== -1
      ? s
      : `${`#define SHADER_NAME ${t}`}
${s}`
  );
}
function Lo(s, t) {
  return t ? s.replace('#version 300 es', '') : s;
}
const Qe = {
    stripVersion: Lo,
    ensurePrecision: Ro,
    addProgramDefines: Eo,
    setProgramName: Do,
    insertVersion: Go,
  },
  Je = Object.create(null),
  Tr = class gs {
    constructor(t) {
      t = { ...gs.defaultOptions, ...t };
      const e = t.fragment.indexOf('#version 300 es') !== -1,
        i = {
          stripVersion: e,
          ensurePrecision: {
            requestedFragmentPrecision: t.preferredFragmentPrecision,
            requestedVertexPrecision: t.preferredVertexPrecision,
            maxSupportedVertexPrecision: 'highp',
            maxSupportedFragmentPrecision: Io(),
          },
          setProgramName: { name: t.name },
          addProgramDefines: e,
          insertVersion: e,
        };
      let r = t.fragment,
        n = t.vertex;
      (Object.keys(Qe).forEach((o) => {
        const a = i[o];
        ((r = Qe[o](r, a, !0)), (n = Qe[o](n, a, !1)));
      }),
        (this.fragment = r),
        (this.vertex = n),
        (this.transformFeedbackVaryings = t.transformFeedbackVaryings),
        (this._key = Is(`${this.vertex}:${this.fragment}`, 'gl-program')));
    }
    destroy() {
      ((this.fragment = null),
        (this.vertex = null),
        (this._attributeData = null),
        (this._uniformData = null),
        (this._uniformBlockData = null),
        (this.transformFeedbackVaryings = null));
    }
    static from(t) {
      const e = `${t.vertex}:${t.fragment}`;
      return (Je[e] || (Je[e] = new gs(t)), Je[e]);
    }
  };
Tr.defaultOptions = { preferredVertexPrecision: 'highp', preferredFragmentPrecision: 'mediump' };
let kr = Tr;
const di = {
  uint8x2: { size: 2, stride: 2, normalised: !1 },
  uint8x4: { size: 4, stride: 4, normalised: !1 },
  sint8x2: { size: 2, stride: 2, normalised: !1 },
  sint8x4: { size: 4, stride: 4, normalised: !1 },
  unorm8x2: { size: 2, stride: 2, normalised: !0 },
  unorm8x4: { size: 4, stride: 4, normalised: !0 },
  snorm8x2: { size: 2, stride: 2, normalised: !0 },
  snorm8x4: { size: 4, stride: 4, normalised: !0 },
  uint16x2: { size: 2, stride: 4, normalised: !1 },
  uint16x4: { size: 4, stride: 8, normalised: !1 },
  sint16x2: { size: 2, stride: 4, normalised: !1 },
  sint16x4: { size: 4, stride: 8, normalised: !1 },
  unorm16x2: { size: 2, stride: 4, normalised: !0 },
  unorm16x4: { size: 4, stride: 8, normalised: !0 },
  snorm16x2: { size: 2, stride: 4, normalised: !0 },
  snorm16x4: { size: 4, stride: 8, normalised: !0 },
  float16x2: { size: 2, stride: 4, normalised: !1 },
  float16x4: { size: 4, stride: 8, normalised: !1 },
  float32: { size: 1, stride: 4, normalised: !1 },
  float32x2: { size: 2, stride: 8, normalised: !1 },
  float32x3: { size: 3, stride: 12, normalised: !1 },
  float32x4: { size: 4, stride: 16, normalised: !1 },
  uint32: { size: 1, stride: 4, normalised: !1 },
  uint32x2: { size: 2, stride: 8, normalised: !1 },
  uint32x3: { size: 3, stride: 12, normalised: !1 },
  uint32x4: { size: 4, stride: 16, normalised: !1 },
  sint32: { size: 1, stride: 4, normalised: !1 },
  sint32x2: { size: 2, stride: 8, normalised: !1 },
  sint32x3: { size: 3, stride: 12, normalised: !1 },
  sint32x4: { size: 4, stride: 16, normalised: !1 },
};
function Uo(s) {
  return di[s] ?? di.float32;
}
const zo = {
  f32: 'float32',
  'vec2<f32>': 'float32x2',
  'vec3<f32>': 'float32x3',
  'vec4<f32>': 'float32x4',
  vec2f: 'float32x2',
  vec3f: 'float32x3',
  vec4f: 'float32x4',
  i32: 'sint32',
  'vec2<i32>': 'sint32x2',
  'vec3<i32>': 'sint32x3',
  'vec4<i32>': 'sint32x4',
  u32: 'uint32',
  'vec2<u32>': 'uint32x2',
  'vec3<u32>': 'uint32x3',
  'vec4<u32>': 'uint32x4',
  bool: 'uint32',
  'vec2<bool>': 'uint32x2',
  'vec3<bool>': 'uint32x3',
  'vec4<bool>': 'uint32x4',
};
function No({ source: s, entryPoint: t }) {
  const e = {},
    i = s.indexOf(`fn ${t}`);
  if (i !== -1) {
    const r = s.indexOf('->', i);
    if (r !== -1) {
      const n = s.substring(i, r),
        o = /@location\((\d+)\)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>]+)(?:,|\s|$)/g;
      let a;
      for (; (a = o.exec(n)) !== null; ) {
        const h = zo[a[3]] ?? 'float32';
        e[a[2]] = {
          location: parseInt(a[1], 10),
          format: h,
          stride: Uo(h).stride,
          offset: 0,
          instance: !1,
          start: 0,
        };
      }
    }
  }
  return e;
}
function ts(s) {
  const t = /(^|[^/])@(group|binding)\(\d+\)[^;]+;/g,
    e = /@group\((\d+)\)/,
    i = /@binding\((\d+)\)/,
    r = /var(<[^>]+>)? (\w+)/,
    n = /:\s*(\w+)/,
    o = /struct\s+(\w+)\s*{([^}]+)}/g,
    a = /(\w+)\s*:\s*([\w\<\>]+)/g,
    h = /struct\s+(\w+)/,
    l = s
      .match(t)
      ?.map((u) => ({
        group: parseInt(u.match(e)[1], 10),
        binding: parseInt(u.match(i)[1], 10),
        name: u.match(r)[2],
        isUniform: u.match(r)[1] === '<uniform>',
        type: u.match(n)[1],
      }));
  if (!l) return { groups: [], structs: [] };
  const c =
    s
      .match(o)
      ?.map((u) => {
        const f = u.match(h)[1],
          d = u.match(a).reduce((m, g) => {
            const [p, y] = g.split(':');
            return ((m[p.trim()] = y.trim()), m);
          }, {});
        return d ? { name: f, members: d } : null;
      })
      .filter(({ name: u }) => l.some((f) => f.type === u)) ?? [];
  return { groups: l, structs: c };
}
var Qt = ((s) => (
  (s[(s.VERTEX = 1)] = 'VERTEX'),
  (s[(s.FRAGMENT = 2)] = 'FRAGMENT'),
  (s[(s.COMPUTE = 4)] = 'COMPUTE'),
  s
))(Qt || {});
function Oo({ groups: s }) {
  const t = [];
  for (let e = 0; e < s.length; e++) {
    const i = s[e];
    (t[i.group] || (t[i.group] = []),
      i.isUniform
        ? t[i.group].push({
            binding: i.binding,
            visibility: Qt.VERTEX | Qt.FRAGMENT,
            buffer: { type: 'uniform' },
          })
        : i.type === 'sampler'
          ? t[i.group].push({
              binding: i.binding,
              visibility: Qt.FRAGMENT,
              sampler: { type: 'filtering' },
            })
          : i.type === 'texture_2d' &&
            t[i.group].push({
              binding: i.binding,
              visibility: Qt.FRAGMENT,
              texture: { sampleType: 'float', viewDimension: '2d', multisampled: !1 },
            }));
  }
  return t;
}
function Vo({ groups: s }) {
  const t = [];
  for (let e = 0; e < s.length; e++) {
    const i = s[e];
    (t[i.group] || (t[i.group] = {}), (t[i.group][i.name] = i.binding));
  }
  return t;
}
function Ho(s, t) {
  const e = new Set(),
    i = new Set(),
    r = [...s.structs, ...t.structs].filter((o) => (e.has(o.name) ? !1 : (e.add(o.name), !0))),
    n = [...s.groups, ...t.groups].filter((o) => {
      const a = `${o.name}-${o.binding}`;
      return i.has(a) ? !1 : (i.add(a), !0);
    });
  return { structs: r, groups: n };
}
const es = Object.create(null);
class Fe {
  constructor(t) {
    ((this._layoutKey = 0), (this._attributeLocationsKey = 0));
    const { fragment: e, vertex: i, layout: r, gpuLayout: n, name: o } = t;
    if (((this.name = o), (this.fragment = e), (this.vertex = i), e.source === i.source)) {
      const a = ts(e.source);
      this.structsAndGroups = a;
    } else {
      const a = ts(i.source),
        h = ts(e.source);
      this.structsAndGroups = Ho(a, h);
    }
    ((this.layout = r ?? Vo(this.structsAndGroups)),
      (this.gpuLayout = n ?? Oo(this.structsAndGroups)),
      (this.autoAssignGlobalUniforms = this.layout[0]?.globalUniforms !== void 0),
      (this.autoAssignLocalUniforms = this.layout[1]?.localUniforms !== void 0),
      this._generateProgramKey());
  }
  _generateProgramKey() {
    const { vertex: t, fragment: e } = this,
      i = t.source + e.source + t.entryPoint + e.entryPoint;
    this._layoutKey = Is(i, 'program');
  }
  get attributeData() {
    return (this._attributeData ?? (this._attributeData = No(this.vertex)), this._attributeData);
  }
  destroy() {
    ((this.gpuLayout = null),
      (this.layout = null),
      (this.structsAndGroups = null),
      (this.fragment = null),
      (this.vertex = null));
  }
  static from(t) {
    const e = `${t.vertex.source}:${t.fragment.source}:${t.fragment.entryPoint}:${t.vertex.entryPoint}`;
    return (es[e] || (es[e] = new Fe(t)), es[e]);
  }
}
const Ir = [
    'f32',
    'i32',
    'vec2<f32>',
    'vec3<f32>',
    'vec4<f32>',
    'mat2x2<f32>',
    'mat3x3<f32>',
    'mat4x4<f32>',
    'mat3x2<f32>',
    'mat4x2<f32>',
    'mat2x3<f32>',
    'mat4x3<f32>',
    'mat2x4<f32>',
    'mat3x4<f32>',
    'vec2<i32>',
    'vec3<i32>',
    'vec4<i32>',
  ],
  Yo = Ir.reduce((s, t) => ((s[t] = !0), s), {});
function $o(s, t) {
  switch (s) {
    case 'f32':
      return 0;
    case 'vec2<f32>':
      return new Float32Array(2 * t);
    case 'vec3<f32>':
      return new Float32Array(3 * t);
    case 'vec4<f32>':
      return new Float32Array(4 * t);
    case 'mat2x2<f32>':
      return new Float32Array([1, 0, 0, 1]);
    case 'mat3x3<f32>':
      return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    case 'mat4x4<f32>':
      return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }
  return null;
}
const Er = class Rr {
  constructor(t, e) {
    ((this._touched = 0),
      (this.uid = O('uniform')),
      (this._resourceType = 'uniformGroup'),
      (this._resourceId = O('resource')),
      (this.isUniformGroup = !0),
      (this._dirtyId = 0),
      (this.destroyed = !1),
      (e = { ...Rr.defaultOptions, ...e }),
      (this.uniformStructures = t));
    const i = {};
    for (const r in t) {
      const n = t[r];
      if (((n.name = r), (n.size = n.size ?? 1), !Yo[n.type]))
        throw new Error(
          `Uniform type ${n.type} is not supported. Supported uniform types are: ${Ir.join(', ')}`,
        );
      (n.value ?? (n.value = $o(n.type, n.size)), (i[r] = n.value));
    }
    ((this.uniforms = i),
      (this._dirtyId = 1),
      (this.ubo = e.ubo),
      (this.isStatic = e.isStatic),
      (this._signature = Is(
        Object.keys(i)
          .map((r) => `${r}-${t[r].type}`)
          .join('-'),
        'uniform-group',
      )));
  }
  update() {
    this._dirtyId++;
  }
};
Er.defaultOptions = { ubo: !1, isStatic: !1 };
let Gr = Er;
class Ie {
  constructor(t) {
    ((this.resources = Object.create(null)), (this._dirty = !0));
    let e = 0;
    for (const i in t) {
      const r = t[i];
      this.setResource(r, e++);
    }
    this._updateKey();
  }
  _updateKey() {
    if (!this._dirty) return;
    this._dirty = !1;
    const t = [];
    let e = 0;
    for (const i in this.resources) t[e++] = this.resources[i]._resourceId;
    this._key = t.join('|');
  }
  setResource(t, e) {
    const i = this.resources[e];
    t !== i &&
      (i && t.off?.('change', this.onResourceChange, this),
      t.on?.('change', this.onResourceChange, this),
      (this.resources[e] = t),
      (this._dirty = !0));
  }
  getResource(t) {
    return this.resources[t];
  }
  _touch(t) {
    const e = this.resources;
    for (const i in e) e[i]._touched = t;
  }
  destroy() {
    const t = this.resources;
    for (const e in t) t[e].off?.('change', this.onResourceChange, this);
    this.resources = null;
  }
  onResourceChange(t) {
    if (((this._dirty = !0), t.destroyed)) {
      const e = this.resources;
      for (const i in e) e[i] === t && (e[i] = null);
    } else this._updateKey();
  }
}
var xs = ((s) => (
  (s[(s.WEBGL = 1)] = 'WEBGL'),
  (s[(s.WEBGPU = 2)] = 'WEBGPU'),
  (s[(s.BOTH = 3)] = 'BOTH'),
  s
))(xs || {});
class Es extends ut {
  constructor(t) {
    (super(),
      (this.uid = O('shader')),
      (this._uniformBindMap = Object.create(null)),
      (this._ownedBindGroups = []));
    let {
      gpuProgram: e,
      glProgram: i,
      groups: r,
      resources: n,
      compatibleRenderers: o,
      groupMap: a,
    } = t;
    ((this.gpuProgram = e),
      (this.glProgram = i),
      o === void 0 && ((o = 0), e && (o |= xs.WEBGPU), i && (o |= xs.WEBGL)),
      (this.compatibleRenderers = o));
    const h = {};
    if ((!n && !r && (n = {}), n && r))
      throw new Error('[Shader] Cannot have both resources and groups');
    if (!e && r && !a)
      throw new Error(
        '[Shader] No group map or WebGPU shader provided - consider using resources instead.',
      );
    if (!e && r && a)
      for (const l in a)
        for (const c in a[l]) {
          const u = a[l][c];
          h[u] = { group: l, binding: c, name: u };
        }
    else if (e && r && !a) {
      const l = e.structsAndGroups.groups;
      ((a = {}),
        l.forEach((c) => {
          ((a[c.group] = a[c.group] || {}), (a[c.group][c.binding] = c.name), (h[c.name] = c));
        }));
    } else if (n) {
      ((r = {}),
        (a = {}),
        e &&
          e.structsAndGroups.groups.forEach((u) => {
            ((a[u.group] = a[u.group] || {}), (a[u.group][u.binding] = u.name), (h[u.name] = u));
          }));
      let l = 0;
      for (const c in n)
        h[c] ||
          (r[99] || ((r[99] = new Ie()), this._ownedBindGroups.push(r[99])),
          (h[c] = { group: 99, binding: l, name: c }),
          (a[99] = a[99] || {}),
          (a[99][l] = c),
          l++);
      for (const c in n) {
        const u = c;
        let f = n[c];
        !f.source && !f._resourceType && (f = new Gr(f));
        const d = h[u];
        d &&
          (r[d.group] || ((r[d.group] = new Ie()), this._ownedBindGroups.push(r[d.group])),
          r[d.group].setResource(f, d.binding));
      }
    }
    ((this.groups = r),
      (this._uniformBindMap = a),
      (this.resources = this._buildResourceAccessor(r, h)));
  }
  addResource(t, e, i) {
    var r, n;
    ((r = this._uniformBindMap)[e] || (r[e] = {}),
      (n = this._uniformBindMap[e])[i] || (n[i] = t),
      this.groups[e] || ((this.groups[e] = new Ie()), this._ownedBindGroups.push(this.groups[e])));
  }
  _buildResourceAccessor(t, e) {
    const i = {};
    for (const r in e) {
      const n = e[r];
      Object.defineProperty(i, n.name, {
        get() {
          return t[n.group].getResource(n.binding);
        },
        set(o) {
          t[n.group].setResource(o, n.binding);
        },
      });
    }
    return i;
  }
  destroy(t = !1) {
    (this.emit('destroy', this),
      t && (this.gpuProgram?.destroy(), this.glProgram?.destroy()),
      (this.gpuProgram = null),
      (this.glProgram = null),
      this.removeAllListeners(),
      (this._uniformBindMap = null),
      this._ownedBindGroups.forEach((e) => {
        e.destroy();
      }),
      (this._ownedBindGroups = null),
      (this.resources = null),
      (this.groups = null));
  }
  static from(t) {
    const { gpu: e, gl: i, ...r } = t;
    let n, o;
    return (
      e && (n = Fe.from(e)),
      i && (o = kr.from(i)),
      new Es({ gpuProgram: n, glProgram: o, ...r })
    );
  }
}
const ys = [];
et.handleByNamedList(G.Environment, ys);
async function Xo(s) {
  if (!s)
    for (let t = 0; t < ys.length; t++) {
      const e = ys[t];
      if (e.value.test()) {
        await e.value.load();
        return;
      }
    }
}
let Xt;
function Wo() {
  if (typeof Xt == 'boolean') return Xt;
  try {
    Xt =
      new Function('param1', 'param2', 'param3', 'return param1[param2] === param3;')(
        { a: 'b' },
        'a',
        'b',
      ) === !0;
  } catch {
    Xt = !1;
  }
  return Xt;
}
function fi(s, t, e = 2) {
  const i = t && t.length,
    r = i ? t[0] * e : s.length;
  let n = Br(s, 0, r, e, !0);
  const o = [];
  if (!n || n.next === n.prev) return o;
  let a, h, l;
  if ((i && (n = Qo(s, t, n, e)), s.length > 80 * e)) {
    ((a = s[0]), (h = s[1]));
    let c = a,
      u = h;
    for (let f = e; f < r; f += e) {
      const d = s[f],
        m = s[f + 1];
      (d < a && (a = d), m < h && (h = m), d > c && (c = d), m > u && (u = m));
    }
    ((l = Math.max(c - a, u - h)), (l = l !== 0 ? 32767 / l : 0));
  }
  return (ne(n, o, e, a, h, l, 0), o);
}
function Br(s, t, e, i, r) {
  let n;
  if (r === la(s, t, e, i) > 0)
    for (let o = t; o < e; o += i) n = pi((o / i) | 0, s[o], s[o + 1], n);
  else for (let o = e - i; o >= t; o -= i) n = pi((o / i) | 0, s[o], s[o + 1], n);
  return (n && Dt(n, n.next) && (ae(n), (n = n.next)), n);
}
function Tt(s, t) {
  if (!s) return s;
  t || (t = s);
  let e = s,
    i;
  do
    if (((i = !1), !e.steiner && (Dt(e, e.next) || z(e.prev, e, e.next) === 0))) {
      if ((ae(e), (e = t = e.prev), e === e.next)) break;
      i = !0;
    } else e = e.next;
  while (i || e !== t);
  return t;
}
function ne(s, t, e, i, r, n, o) {
  if (!s) return;
  !o && n && ia(s, i, r, n);
  let a = s;
  for (; s.prev !== s.next; ) {
    const h = s.prev,
      l = s.next;
    if (n ? qo(s, i, r, n) : jo(s)) {
      (t.push(h.i, s.i, l.i), ae(s), (s = l.next), (a = l.next));
      continue;
    }
    if (((s = l), s === a)) {
      o
        ? o === 1
          ? ((s = Zo(Tt(s), t)), ne(s, t, e, i, r, n, 2))
          : o === 2 && Ko(s, t, e, i, r, n)
        : ne(Tt(s), t, e, i, r, n, 1);
      break;
    }
  }
}
function jo(s) {
  const t = s.prev,
    e = s,
    i = s.next;
  if (z(t, e, i) >= 0) return !1;
  const r = t.x,
    n = e.x,
    o = i.x,
    a = t.y,
    h = e.y,
    l = i.y,
    c = Math.min(r, n, o),
    u = Math.min(a, h, l),
    f = Math.max(r, n, o),
    d = Math.max(a, h, l);
  let m = i.next;
  for (; m !== t; ) {
    if (
      m.x >= c &&
      m.x <= f &&
      m.y >= u &&
      m.y <= d &&
      Jt(r, a, n, h, o, l, m.x, m.y) &&
      z(m.prev, m, m.next) >= 0
    )
      return !1;
    m = m.next;
  }
  return !0;
}
function qo(s, t, e, i) {
  const r = s.prev,
    n = s,
    o = s.next;
  if (z(r, n, o) >= 0) return !1;
  const a = r.x,
    h = n.x,
    l = o.x,
    c = r.y,
    u = n.y,
    f = o.y,
    d = Math.min(a, h, l),
    m = Math.min(c, u, f),
    g = Math.max(a, h, l),
    p = Math.max(c, u, f),
    y = _s(d, m, t, e, i),
    x = _s(g, p, t, e, i);
  let _ = s.prevZ,
    b = s.nextZ;
  for (; _ && _.z >= y && b && b.z <= x; ) {
    if (
      (_.x >= d &&
        _.x <= g &&
        _.y >= m &&
        _.y <= p &&
        _ !== r &&
        _ !== o &&
        Jt(a, c, h, u, l, f, _.x, _.y) &&
        z(_.prev, _, _.next) >= 0) ||
      ((_ = _.prevZ),
      b.x >= d &&
        b.x <= g &&
        b.y >= m &&
        b.y <= p &&
        b !== r &&
        b !== o &&
        Jt(a, c, h, u, l, f, b.x, b.y) &&
        z(b.prev, b, b.next) >= 0)
    )
      return !1;
    b = b.nextZ;
  }
  for (; _ && _.z >= y; ) {
    if (
      _.x >= d &&
      _.x <= g &&
      _.y >= m &&
      _.y <= p &&
      _ !== r &&
      _ !== o &&
      Jt(a, c, h, u, l, f, _.x, _.y) &&
      z(_.prev, _, _.next) >= 0
    )
      return !1;
    _ = _.prevZ;
  }
  for (; b && b.z <= x; ) {
    if (
      b.x >= d &&
      b.x <= g &&
      b.y >= m &&
      b.y <= p &&
      b !== r &&
      b !== o &&
      Jt(a, c, h, u, l, f, b.x, b.y) &&
      z(b.prev, b, b.next) >= 0
    )
      return !1;
    b = b.nextZ;
  }
  return !0;
}
function Zo(s, t) {
  let e = s;
  do {
    const i = e.prev,
      r = e.next.next;
    (!Dt(i, r) &&
      Dr(i, e, e.next, r) &&
      oe(i, r) &&
      oe(r, i) &&
      (t.push(i.i, e.i, r.i), ae(e), ae(e.next), (e = s = r)),
      (e = e.next));
  } while (e !== s);
  return Tt(e);
}
function Ko(s, t, e, i, r, n) {
  let o = s;
  do {
    let a = o.next.next;
    for (; a !== o.prev; ) {
      if (o.i !== a.i && oa(o, a)) {
        let h = Lr(o, a);
        ((o = Tt(o, o.next)),
          (h = Tt(h, h.next)),
          ne(o, t, e, i, r, n, 0),
          ne(h, t, e, i, r, n, 0));
        return;
      }
      a = a.next;
    }
    o = o.next;
  } while (o !== s);
}
function Qo(s, t, e, i) {
  const r = [];
  for (let n = 0, o = t.length; n < o; n++) {
    const a = t[n] * i,
      h = n < o - 1 ? t[n + 1] * i : s.length,
      l = Br(s, a, h, i, !1);
    (l === l.next && (l.steiner = !0), r.push(na(l)));
  }
  r.sort(Jo);
  for (let n = 0; n < r.length; n++) e = ta(r[n], e);
  return e;
}
function Jo(s, t) {
  let e = s.x - t.x;
  if (e === 0 && ((e = s.y - t.y), e === 0)) {
    const i = (s.next.y - s.y) / (s.next.x - s.x),
      r = (t.next.y - t.y) / (t.next.x - t.x);
    e = i - r;
  }
  return e;
}
function ta(s, t) {
  const e = ea(s, t);
  if (!e) return t;
  const i = Lr(e, s);
  return (Tt(i, i.next), Tt(e, e.next));
}
function ea(s, t) {
  let e = t;
  const i = s.x,
    r = s.y;
  let n = -1 / 0,
    o;
  if (Dt(s, e)) return e;
  do {
    if (Dt(s, e.next)) return e.next;
    if (r <= e.y && r >= e.next.y && e.next.y !== e.y) {
      const u = e.x + ((r - e.y) * (e.next.x - e.x)) / (e.next.y - e.y);
      if (u <= i && u > n && ((n = u), (o = e.x < e.next.x ? e : e.next), u === i)) return o;
    }
    e = e.next;
  } while (e !== t);
  if (!o) return null;
  const a = o,
    h = o.x,
    l = o.y;
  let c = 1 / 0;
  e = o;
  do {
    if (
      i >= e.x &&
      e.x >= h &&
      i !== e.x &&
      Fr(r < l ? i : n, r, h, l, r < l ? n : i, r, e.x, e.y)
    ) {
      const u = Math.abs(r - e.y) / (i - e.x);
      oe(e, s) &&
        (u < c || (u === c && (e.x > o.x || (e.x === o.x && sa(o, e))))) &&
        ((o = e), (c = u));
    }
    e = e.next;
  } while (e !== a);
  return o;
}
function sa(s, t) {
  return z(s.prev, s, t.prev) < 0 && z(t.next, s, s.next) < 0;
}
function ia(s, t, e, i) {
  let r = s;
  do
    (r.z === 0 && (r.z = _s(r.x, r.y, t, e, i)),
      (r.prevZ = r.prev),
      (r.nextZ = r.next),
      (r = r.next));
  while (r !== s);
  ((r.prevZ.nextZ = null), (r.prevZ = null), ra(r));
}
function ra(s) {
  let t,
    e = 1;
  do {
    let i = s,
      r;
    s = null;
    let n = null;
    for (t = 0; i; ) {
      t++;
      let o = i,
        a = 0;
      for (let l = 0; l < e && (a++, (o = o.nextZ), !!o); l++);
      let h = e;
      for (; a > 0 || (h > 0 && o); )
        (a !== 0 && (h === 0 || !o || i.z <= o.z)
          ? ((r = i), (i = i.nextZ), a--)
          : ((r = o), (o = o.nextZ), h--),
          n ? (n.nextZ = r) : (s = r),
          (r.prevZ = n),
          (n = r));
      i = o;
    }
    ((n.nextZ = null), (e *= 2));
  } while (t > 1);
  return s;
}
function _s(s, t, e, i, r) {
  return (
    (s = ((s - e) * r) | 0),
    (t = ((t - i) * r) | 0),
    (s = (s | (s << 8)) & 16711935),
    (s = (s | (s << 4)) & 252645135),
    (s = (s | (s << 2)) & 858993459),
    (s = (s | (s << 1)) & 1431655765),
    (t = (t | (t << 8)) & 16711935),
    (t = (t | (t << 4)) & 252645135),
    (t = (t | (t << 2)) & 858993459),
    (t = (t | (t << 1)) & 1431655765),
    s | (t << 1)
  );
}
function na(s) {
  let t = s,
    e = s;
  do ((t.x < e.x || (t.x === e.x && t.y < e.y)) && (e = t), (t = t.next));
  while (t !== s);
  return e;
}
function Fr(s, t, e, i, r, n, o, a) {
  return (
    (r - o) * (t - a) >= (s - o) * (n - a) &&
    (s - o) * (i - a) >= (e - o) * (t - a) &&
    (e - o) * (n - a) >= (r - o) * (i - a)
  );
}
function Jt(s, t, e, i, r, n, o, a) {
  return !(s === o && t === a) && Fr(s, t, e, i, r, n, o, a);
}
function oa(s, t) {
  return (
    s.next.i !== t.i &&
    s.prev.i !== t.i &&
    !aa(s, t) &&
    ((oe(s, t) && oe(t, s) && ha(s, t) && (z(s.prev, s, t.prev) || z(s, t.prev, t))) ||
      (Dt(s, t) && z(s.prev, s, s.next) > 0 && z(t.prev, t, t.next) > 0))
  );
}
function z(s, t, e) {
  return (t.y - s.y) * (e.x - t.x) - (t.x - s.x) * (e.y - t.y);
}
function Dt(s, t) {
  return s.x === t.x && s.y === t.y;
}
function Dr(s, t, e, i) {
  const r = Ae(z(s, t, e)),
    n = Ae(z(s, t, i)),
    o = Ae(z(e, i, s)),
    a = Ae(z(e, i, t));
  return !!(
    (r !== n && o !== a) ||
    (r === 0 && Ce(s, e, t)) ||
    (n === 0 && Ce(s, i, t)) ||
    (o === 0 && Ce(e, s, i)) ||
    (a === 0 && Ce(e, t, i))
  );
}
function Ce(s, t, e) {
  return (
    t.x <= Math.max(s.x, e.x) &&
    t.x >= Math.min(s.x, e.x) &&
    t.y <= Math.max(s.y, e.y) &&
    t.y >= Math.min(s.y, e.y)
  );
}
function Ae(s) {
  return s > 0 ? 1 : s < 0 ? -1 : 0;
}
function aa(s, t) {
  let e = s;
  do {
    if (e.i !== s.i && e.next.i !== s.i && e.i !== t.i && e.next.i !== t.i && Dr(e, e.next, s, t))
      return !0;
    e = e.next;
  } while (e !== s);
  return !1;
}
function oe(s, t) {
  return z(s.prev, s, s.next) < 0
    ? z(s, t, s.next) >= 0 && z(s, s.prev, t) >= 0
    : z(s, t, s.prev) < 0 || z(s, s.next, t) < 0;
}
function ha(s, t) {
  let e = s,
    i = !1;
  const r = (s.x + t.x) / 2,
    n = (s.y + t.y) / 2;
  do
    (e.y > n != e.next.y > n &&
      e.next.y !== e.y &&
      r < ((e.next.x - e.x) * (n - e.y)) / (e.next.y - e.y) + e.x &&
      (i = !i),
      (e = e.next));
  while (e !== s);
  return i;
}
function Lr(s, t) {
  const e = bs(s.i, s.x, s.y),
    i = bs(t.i, t.x, t.y),
    r = s.next,
    n = t.prev;
  return (
    (s.next = t),
    (t.prev = s),
    (e.next = r),
    (r.prev = e),
    (i.next = e),
    (e.prev = i),
    (n.next = i),
    (i.prev = n),
    i
  );
}
function pi(s, t, e, i) {
  const r = bs(s, t, e);
  return (
    i
      ? ((r.next = i.next), (r.prev = i), (i.next.prev = r), (i.next = r))
      : ((r.prev = r), (r.next = r)),
    r
  );
}
function ae(s) {
  ((s.next.prev = s.prev),
    (s.prev.next = s.next),
    s.prevZ && (s.prevZ.nextZ = s.nextZ),
    s.nextZ && (s.nextZ.prevZ = s.prevZ));
}
function bs(s, t, e) {
  return { i: s, x: t, y: e, prev: null, next: null, z: 0, prevZ: null, nextZ: null, steiner: !1 };
}
function la(s, t, e, i) {
  let r = 0;
  for (let n = t, o = e - i; n < e; n += i) ((r += (s[o] - s[n]) * (s[n + 1] + s[o + 1])), (o = n));
  return r;
}
const ca = fi.default || fi;
var Ur = ((s) => (
  (s[(s.NONE = 0)] = 'NONE'),
  (s[(s.COLOR = 16384)] = 'COLOR'),
  (s[(s.STENCIL = 1024)] = 'STENCIL'),
  (s[(s.DEPTH = 256)] = 'DEPTH'),
  (s[(s.COLOR_DEPTH = 16640)] = 'COLOR_DEPTH'),
  (s[(s.COLOR_STENCIL = 17408)] = 'COLOR_STENCIL'),
  (s[(s.DEPTH_STENCIL = 1280)] = 'DEPTH_STENCIL'),
  (s[(s.ALL = 17664)] = 'ALL'),
  s
))(Ur || {});
class ua {
  constructor(t) {
    ((this.items = []), (this._name = t));
  }
  emit(t, e, i, r, n, o, a, h) {
    const { name: l, items: c } = this;
    for (let u = 0, f = c.length; u < f; u++) c[u][l](t, e, i, r, n, o, a, h);
    return this;
  }
  add(t) {
    return (t[this._name] && (this.remove(t), this.items.push(t)), this);
  }
  remove(t) {
    const e = this.items.indexOf(t);
    return (e !== -1 && this.items.splice(e, 1), this);
  }
  contains(t) {
    return this.items.indexOf(t) !== -1;
  }
  removeAll() {
    return ((this.items.length = 0), this);
  }
  destroy() {
    (this.removeAll(), (this.items = null), (this._name = null));
  }
  get empty() {
    return this.items.length === 0;
  }
  get name() {
    return this._name;
  }
}
const da = [
    'init',
    'destroy',
    'contextChange',
    'resolutionChange',
    'resetState',
    'renderEnd',
    'renderStart',
    'render',
    'update',
    'postrender',
    'prerender',
  ],
  zr = class Nr extends ut {
    constructor(t) {
      (super(),
        (this.uid = O('renderer')),
        (this.runners = Object.create(null)),
        (this.renderPipes = Object.create(null)),
        (this._initOptions = {}),
        (this._systemsHash = Object.create(null)),
        (this.type = t.type),
        (this.name = t.name),
        (this.config = t));
      const e = [...da, ...(this.config.runners ?? [])];
      (this._addRunners(...e), this._unsafeEvalCheck());
    }
    async init(t = {}) {
      const e = t.skipExtensionImports === !0 ? !0 : t.manageImports === !1;
      (await Xo(e),
        this._addSystems(this.config.systems),
        this._addPipes(this.config.renderPipes, this.config.renderPipeAdaptors));
      for (const i in this._systemsHash)
        t = { ...this._systemsHash[i].constructor.defaultOptions, ...t };
      ((t = { ...Nr.defaultOptions, ...t }), (this._roundPixels = t.roundPixels ? 1 : 0));
      for (let i = 0; i < this.runners.init.items.length; i++)
        await this.runners.init.items[i].init(t);
      this._initOptions = t;
    }
    render(t, e) {
      let i = t;
      if (
        (i instanceof kt &&
          ((i = { container: i }),
          e &&
            (F(H, 'passing a second argument is deprecated, please use render options instead'),
            (i.target = e.renderTexture))),
        i.target || (i.target = this.view.renderTarget),
        i.target === this.view.renderTarget &&
          ((this._lastObjectRendered = i.container),
          i.clearColor ?? (i.clearColor = this.background.colorRgba),
          i.clear ?? (i.clear = this.background.clearBeforeRender)),
        i.clearColor)
      ) {
        const r = Array.isArray(i.clearColor) && i.clearColor.length === 4;
        i.clearColor = r ? i.clearColor : tt.shared.setValue(i.clearColor).toArray();
      }
      (i.transform ||
        (i.container.updateLocalTransform(), (i.transform = i.container.localTransform)),
        i.container.enableRenderGroup(),
        this.runners.prerender.emit(i),
        this.runners.renderStart.emit(i),
        this.runners.render.emit(i),
        this.runners.renderEnd.emit(i),
        this.runners.postrender.emit(i));
    }
    resize(t, e, i) {
      const r = this.view.resolution;
      (this.view.resize(t, e, i),
        this.emit('resize', this.view.screen.width, this.view.screen.height, this.view.resolution),
        i !== void 0 && i !== r && this.runners.resolutionChange.emit(i));
    }
    clear(t = {}) {
      const e = this;
      (t.target || (t.target = e.renderTarget.renderTarget),
        t.clearColor || (t.clearColor = this.background.colorRgba),
        t.clear ?? (t.clear = Ur.ALL));
      const { clear: i, clearColor: r, target: n } = t;
      (tt.shared.setValue(r ?? this.background.colorRgba),
        e.renderTarget.clear(n, i, tt.shared.toArray()));
    }
    get resolution() {
      return this.view.resolution;
    }
    set resolution(t) {
      ((this.view.resolution = t), this.runners.resolutionChange.emit(t));
    }
    get width() {
      return this.view.texture.frame.width;
    }
    get height() {
      return this.view.texture.frame.height;
    }
    get canvas() {
      return this.view.canvas;
    }
    get lastObjectRendered() {
      return this._lastObjectRendered;
    }
    get renderingToScreen() {
      return this.renderTarget.renderingToScreen;
    }
    get screen() {
      return this.view.screen;
    }
    _addRunners(...t) {
      t.forEach((e) => {
        this.runners[e] = new ua(e);
      });
    }
    _addSystems(t) {
      let e;
      for (e in t) {
        const i = t[e];
        this._addSystem(i.value, i.name);
      }
    }
    _addSystem(t, e) {
      const i = new t(this);
      if (this[e]) throw new Error(`Whoops! The name "${e}" is already in use`);
      ((this[e] = i), (this._systemsHash[e] = i));
      for (const r in this.runners) this.runners[r].add(i);
      return this;
    }
    _addPipes(t, e) {
      const i = e.reduce((r, n) => ((r[n.name] = n.value), r), {});
      t.forEach((r) => {
        const n = r.value,
          o = r.name,
          a = i[o];
        this.renderPipes[o] = new n(this, a ? new a() : null);
      });
    }
    destroy(t = !1) {
      (this.runners.destroy.items.reverse(),
        this.runners.destroy.emit(t),
        Object.values(this.runners).forEach((e) => {
          e.destroy();
        }),
        (this._systemsHash = null),
        (this.renderPipes = null));
    }
    generateTexture(t) {
      return this.textureGenerator.generateTexture(t);
    }
    get roundPixels() {
      return !!this._roundPixels;
    }
    _unsafeEvalCheck() {
      if (!Wo())
        throw new Error(
          'Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.',
        );
    }
    resetState() {
      this.runners.resetState.emit();
    }
  };
zr.defaultOptions = { resolution: 1, failIfMajorPerformanceCaveat: !1, roundPixels: !1 };
let Or = zr,
  Se;
function fa(s) {
  return (
    Se !== void 0 ||
      (Se = (() => {
        const t = {
          stencil: !0,
          failIfMajorPerformanceCaveat: s ?? Or.defaultOptions.failIfMajorPerformanceCaveat,
        };
        try {
          if (!gt.get().getWebGLRenderingContext()) return !1;
          let i = gt.get().createCanvas().getContext('webgl', t);
          const r = !!i?.getContextAttributes()?.stencil;
          if (i) {
            const n = i.getExtension('WEBGL_lose_context');
            n && n.loseContext();
          }
          return ((i = null), r);
        } catch {
          return !1;
        }
      })()),
    Se
  );
}
let Me;
async function pa(s = {}) {
  return (
    Me !== void 0 ||
      (Me = await (async () => {
        const t = gt.get().getNavigator().gpu;
        if (!t) return !1;
        try {
          return (await (await t.requestAdapter(s)).requestDevice(), !0);
        } catch {
          return !1;
        }
      })()),
    Me
  );
}
const mi = ['webgl', 'webgpu', 'canvas'];
async function ma(s) {
  let t = [];
  s.preference
    ? (t.push(s.preference),
      mi.forEach((n) => {
        n !== s.preference && t.push(n);
      }))
    : (t = mi.slice());
  let e,
    i = {};
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    if (o === 'webgpu' && (await pa())) {
      const { WebGPURenderer: a } = await Ee(
        async () => {
          const { WebGPURenderer: h } = await import('./WebGPURenderer.D745pQs2.js');
          return { WebGPURenderer: h };
        },
        __vite__mapDeps([4, 2, 5, 3]),
        import.meta.url,
      );
      ((e = a), (i = { ...s, ...s.webgpu }));
      break;
    } else if (
      o === 'webgl' &&
      fa(s.failIfMajorPerformanceCaveat ?? Or.defaultOptions.failIfMajorPerformanceCaveat)
    ) {
      const { WebGLRenderer: a } = await Ee(
        async () => {
          const { WebGLRenderer: h } = await import('./WebGLRenderer.xknUgyes.js');
          return { WebGLRenderer: h };
        },
        __vite__mapDeps([6, 2, 5]),
        import.meta.url,
      );
      ((e = a), (i = { ...s, ...s.webgl }));
      break;
    } else if (o === 'canvas')
      throw ((i = { ...s }), new Error('CanvasRenderer is not yet implemented'));
  }
  if ((delete i.webgpu, delete i.webgl, !e))
    throw new Error('No available renderer for the current environment');
  const r = new e();
  return (await r.init(i), r);
}
const Vr = '8.12.0';
class Hr {
  static init() {
    globalThis.__PIXI_APP_INIT__?.(this, Vr);
  }
  static destroy() {}
}
Hr.extension = G.Application;
class ga {
  constructor(t) {
    this._renderer = t;
  }
  init() {
    globalThis.__PIXI_RENDERER_INIT__?.(this._renderer, Vr);
  }
  destroy() {
    this._renderer = null;
  }
}
ga.extension = { type: [G.WebGLSystem, G.WebGPUSystem], name: 'initHook', priority: -10 };
const Yr = class ws {
  constructor(...t) {
    ((this.stage = new kt()),
      t[0] !== void 0 &&
        F(
          H,
          'Application constructor options are deprecated, please use Application.init() instead.',
        ));
  }
  async init(t) {
    ((t = { ...t }),
      (this.renderer = await ma(t)),
      ws._plugins.forEach((e) => {
        e.init.call(this, t);
      }));
  }
  render() {
    this.renderer.render({ container: this.stage });
  }
  get canvas() {
    return this.renderer.canvas;
  }
  get view() {
    return (
      F(H, 'Application.view is deprecated, please use Application.canvas instead.'),
      this.renderer.canvas
    );
  }
  get screen() {
    return this.renderer.screen;
  }
  destroy(t = !1, e = !1) {
    const i = ws._plugins.slice(0);
    (i.reverse(),
      i.forEach((r) => {
        r.destroy.call(this);
      }),
      this.stage.destroy(e),
      (this.stage = null),
      this.renderer.destroy(t),
      (this.renderer = null));
  }
};
Yr._plugins = [];
let $r = Yr;
et.handleByList(G.Application, $r._plugins);
et.add(Hr);
const gi = [
    { offset: 0, color: 'white' },
    { offset: 1, color: 'black' },
  ],
  Rs = class vs {
    constructor(...t) {
      ((this.uid = O('fillGradient')), (this.type = 'linear'), (this.colorStops = []));
      let e = xa(t);
      ((e = {
        ...(e.type === 'radial' ? vs.defaultRadialOptions : vs.defaultLinearOptions),
        ...qi(e),
      }),
        (this._textureSize = e.textureSize),
        (this._wrapMode = e.wrapMode),
        e.type === 'radial'
          ? ((this.center = e.center),
            (this.outerCenter = e.outerCenter ?? this.center),
            (this.innerRadius = e.innerRadius),
            (this.outerRadius = e.outerRadius),
            (this.scale = e.scale),
            (this.rotation = e.rotation))
          : ((this.start = e.start), (this.end = e.end)),
        (this.textureSpace = e.textureSpace),
        (this.type = e.type),
        e.colorStops.forEach((r) => {
          this.addColorStop(r.offset, r.color);
        }));
    }
    addColorStop(t, e) {
      return (this.colorStops.push({ offset: t, color: tt.shared.setValue(e).toHexa() }), this);
    }
    buildLinearGradient() {
      if (this.texture) return;
      let { x: t, y: e } = this.start,
        { x: i, y: r } = this.end,
        n = i - t,
        o = r - e;
      const a = n < 0 || o < 0;
      if (this._wrapMode === 'clamp-to-edge') {
        if (n < 0) {
          const p = t;
          ((t = i), (i = p), (n *= -1));
        }
        if (o < 0) {
          const p = e;
          ((e = r), (r = p), (o *= -1));
        }
      }
      const h = this.colorStops.length ? this.colorStops : gi,
        l = this._textureSize,
        { canvas: c, context: u } = yi(l, 1),
        f = a
          ? u.createLinearGradient(this._textureSize, 0, 0, 0)
          : u.createLinearGradient(0, 0, this._textureSize, 0);
      (xi(f, h),
        (u.fillStyle = f),
        u.fillRect(0, 0, l, 1),
        (this.texture = new D({ source: new Re({ resource: c, addressMode: this._wrapMode }) })));
      const d = Math.sqrt(n * n + o * o),
        m = Math.atan2(o, n),
        g = new I();
      (g.scale(d / l, 1),
        g.rotate(m),
        g.translate(t, e),
        this.textureSpace === 'local' && g.scale(l, l),
        (this.transform = g));
    }
    buildGradient() {
      this.type === 'linear' ? this.buildLinearGradient() : this.buildRadialGradient();
    }
    buildRadialGradient() {
      if (this.texture) return;
      const t = this.colorStops.length ? this.colorStops : gi,
        e = this._textureSize,
        { canvas: i, context: r } = yi(e, e),
        { x: n, y: o } = this.center,
        { x: a, y: h } = this.outerCenter,
        l = this.innerRadius,
        c = this.outerRadius,
        u = a - c,
        f = h - c,
        d = e / (c * 2),
        m = (n - u) * d,
        g = (o - f) * d,
        p = r.createRadialGradient(m, g, l * d, (a - u) * d, (h - f) * d, c * d);
      (xi(p, t),
        (r.fillStyle = t[t.length - 1].color),
        r.fillRect(0, 0, e, e),
        (r.fillStyle = p),
        r.translate(m, g),
        r.rotate(this.rotation),
        r.scale(1, this.scale),
        r.translate(-m, -g),
        r.fillRect(0, 0, e, e),
        (this.texture = new D({ source: new Re({ resource: i, addressMode: this._wrapMode }) })));
      const y = new I();
      (y.scale(1 / d, 1 / d),
        y.translate(u, f),
        this.textureSpace === 'local' && y.scale(e, e),
        (this.transform = y));
    }
    get styleKey() {
      return this.uid;
    }
    destroy() {
      (this.texture?.destroy(!0),
        (this.texture = null),
        (this.transform = null),
        (this.colorStops = []),
        (this.start = null),
        (this.end = null),
        (this.center = null),
        (this.outerCenter = null));
    }
  };
Rs.defaultLinearOptions = {
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
  colorStops: [],
  textureSpace: 'local',
  type: 'linear',
  textureSize: 256,
  wrapMode: 'clamp-to-edge',
};
Rs.defaultRadialOptions = {
  center: { x: 0.5, y: 0.5 },
  innerRadius: 0,
  outerRadius: 0.5,
  colorStops: [],
  scale: 1,
  textureSpace: 'local',
  type: 'radial',
  textureSize: 256,
  wrapMode: 'clamp-to-edge',
};
let ce = Rs;
function xi(s, t) {
  for (let e = 0; e < t.length; e++) {
    const i = t[e];
    s.addColorStop(i.offset, i.color);
  }
}
function yi(s, t) {
  const e = gt.get().createCanvas(s, t),
    i = e.getContext('2d');
  return { canvas: e, context: i };
}
function xa(s) {
  let t = s[0] ?? {};
  return (
    (typeof t == 'number' || s[1]) &&
      (F('8.5.2', 'use options object instead'),
      (t = {
        type: 'linear',
        start: { x: s[0], y: s[1] },
        end: { x: s[2], y: s[3] },
        textureSpace: s[4],
        textureSize: s[5] ?? ce.defaultLinearOptions.textureSize,
      })),
    t
  );
}
const _i = {
  repeat: { addressModeU: 'repeat', addressModeV: 'repeat' },
  'repeat-x': { addressModeU: 'repeat', addressModeV: 'clamp-to-edge' },
  'repeat-y': { addressModeU: 'clamp-to-edge', addressModeV: 'repeat' },
  'no-repeat': { addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' },
};
class ya {
  constructor(t, e) {
    ((this.uid = O('fillPattern')),
      (this.transform = new I()),
      (this._styleKey = null),
      (this.texture = t),
      this.transform.scale(1 / t.frame.width, 1 / t.frame.height),
      e &&
        ((t.source.style.addressModeU = _i[e].addressModeU),
        (t.source.style.addressModeV = _i[e].addressModeV)));
  }
  setTransform(t) {
    const e = this.texture;
    (this.transform.copyFrom(t),
      this.transform.invert(),
      this.transform.scale(1 / e.frame.width, 1 / e.frame.height),
      (this._styleKey = null));
  }
  get styleKey() {
    return this._styleKey
      ? this._styleKey
      : ((this._styleKey = `fill-pattern-${this.uid}-${this.texture.uid}-${this.transform.toArray().join('-')}`),
        this._styleKey);
  }
  destroy() {
    (this.texture.destroy(!0), (this.texture = null), (this._styleKey = null));
  }
}
var _a = wa,
  ss = { a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0 },
  ba = /([astvzqmhlc])([^astvzqmhlc]*)/gi;
function wa(s) {
  var t = [];
  return (
    s.replace(ba, function (e, i, r) {
      var n = i.toLowerCase();
      for (
        r = Ca(r),
          n == 'm' &&
            r.length > 2 &&
            (t.push([i].concat(r.splice(0, 2))), (n = 'l'), (i = i == 'm' ? 'l' : 'L'));
        ;

      ) {
        if (r.length == ss[n]) return (r.unshift(i), t.push(r));
        if (r.length < ss[n]) throw new Error('malformed path data');
        t.push([i].concat(r.splice(0, ss[n])));
      }
    }),
    t
  );
}
var va = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;
function Ca(s) {
  var t = s.match(va);
  return t ? t.map(Number) : [];
}
const Aa = $i(_a);
function Sa(s, t) {
  const e = Aa(s),
    i = [];
  let r = null,
    n = 0,
    o = 0;
  for (let a = 0; a < e.length; a++) {
    const h = e[a],
      l = h[0],
      c = h;
    switch (l) {
      case 'M':
        ((n = c[1]), (o = c[2]), t.moveTo(n, o));
        break;
      case 'm':
        ((n += c[1]), (o += c[2]), t.moveTo(n, o));
        break;
      case 'H':
        ((n = c[1]), t.lineTo(n, o));
        break;
      case 'h':
        ((n += c[1]), t.lineTo(n, o));
        break;
      case 'V':
        ((o = c[1]), t.lineTo(n, o));
        break;
      case 'v':
        ((o += c[1]), t.lineTo(n, o));
        break;
      case 'L':
        ((n = c[1]), (o = c[2]), t.lineTo(n, o));
        break;
      case 'l':
        ((n += c[1]), (o += c[2]), t.lineTo(n, o));
        break;
      case 'C':
        ((n = c[5]), (o = c[6]), t.bezierCurveTo(c[1], c[2], c[3], c[4], n, o));
        break;
      case 'c':
        (t.bezierCurveTo(n + c[1], o + c[2], n + c[3], o + c[4], n + c[5], o + c[6]),
          (n += c[5]),
          (o += c[6]));
        break;
      case 'S':
        ((n = c[3]), (o = c[4]), t.bezierCurveToShort(c[1], c[2], n, o));
        break;
      case 's':
        (t.bezierCurveToShort(n + c[1], o + c[2], n + c[3], o + c[4]), (n += c[3]), (o += c[4]));
        break;
      case 'Q':
        ((n = c[3]), (o = c[4]), t.quadraticCurveTo(c[1], c[2], n, o));
        break;
      case 'q':
        (t.quadraticCurveTo(n + c[1], o + c[2], n + c[3], o + c[4]), (n += c[3]), (o += c[4]));
        break;
      case 'T':
        ((n = c[1]), (o = c[2]), t.quadraticCurveToShort(n, o));
        break;
      case 't':
        ((n += c[1]), (o += c[2]), t.quadraticCurveToShort(n, o));
        break;
      case 'A':
        ((n = c[6]), (o = c[7]), t.arcToSvg(c[1], c[2], c[3], c[4], c[5], n, o));
        break;
      case 'a':
        ((n += c[6]), (o += c[7]), t.arcToSvg(c[1], c[2], c[3], c[4], c[5], n, o));
        break;
      case 'Z':
      case 'z':
        (t.closePath(),
          i.length > 0 &&
            ((r = i.pop()), r ? ((n = r.startX), (o = r.startY)) : ((n = 0), (o = 0))),
          (r = null));
        break;
      default:
        K(`Unknown SVG path command: ${l}`);
    }
    l !== 'Z' && l !== 'z' && r === null && ((r = { startX: n, startY: o }), i.push(r));
  }
  return t;
}
class Gs {
  constructor(t = 0, e = 0, i = 0) {
    ((this.type = 'circle'), (this.x = t), (this.y = e), (this.radius = i));
  }
  clone() {
    return new Gs(this.x, this.y, this.radius);
  }
  contains(t, e) {
    if (this.radius <= 0) return !1;
    const i = this.radius * this.radius;
    let r = this.x - t,
      n = this.y - e;
    return ((r *= r), (n *= n), r + n <= i);
  }
  strokeContains(t, e, i, r = 0.5) {
    if (this.radius === 0) return !1;
    const n = this.x - t,
      o = this.y - e,
      a = this.radius,
      h = (1 - r) * i,
      l = Math.sqrt(n * n + o * o);
    return l <= a + h && l > a - (i - h);
  }
  getBounds(t) {
    return (
      t || (t = new $()),
      (t.x = this.x - this.radius),
      (t.y = this.y - this.radius),
      (t.width = this.radius * 2),
      (t.height = this.radius * 2),
      t
    );
  }
  copyFrom(t) {
    return ((this.x = t.x), (this.y = t.y), (this.radius = t.radius), this);
  }
  copyTo(t) {
    return (t.copyFrom(this), t);
  }
  toString() {
    return `[pixi.js/math:Circle x=${this.x} y=${this.y} radius=${this.radius}]`;
  }
}
class Bs {
  constructor(t = 0, e = 0, i = 0, r = 0) {
    ((this.type = 'ellipse'),
      (this.x = t),
      (this.y = e),
      (this.halfWidth = i),
      (this.halfHeight = r));
  }
  clone() {
    return new Bs(this.x, this.y, this.halfWidth, this.halfHeight);
  }
  contains(t, e) {
    if (this.halfWidth <= 0 || this.halfHeight <= 0) return !1;
    let i = (t - this.x) / this.halfWidth,
      r = (e - this.y) / this.halfHeight;
    return ((i *= i), (r *= r), i + r <= 1);
  }
  strokeContains(t, e, i, r = 0.5) {
    const { halfWidth: n, halfHeight: o } = this;
    if (n <= 0 || o <= 0) return !1;
    const a = i * (1 - r),
      h = i - a,
      l = n - h,
      c = o - h,
      u = n + a,
      f = o + a,
      d = t - this.x,
      m = e - this.y,
      g = (d * d) / (l * l) + (m * m) / (c * c),
      p = (d * d) / (u * u) + (m * m) / (f * f);
    return g > 1 && p <= 1;
  }
  getBounds(t) {
    return (
      t || (t = new $()),
      (t.x = this.x - this.halfWidth),
      (t.y = this.y - this.halfHeight),
      (t.width = this.halfWidth * 2),
      (t.height = this.halfHeight * 2),
      t
    );
  }
  copyFrom(t) {
    return (
      (this.x = t.x),
      (this.y = t.y),
      (this.halfWidth = t.halfWidth),
      (this.halfHeight = t.halfHeight),
      this
    );
  }
  copyTo(t) {
    return (t.copyFrom(this), t);
  }
  toString() {
    return `[pixi.js/math:Ellipse x=${this.x} y=${this.y} halfWidth=${this.halfWidth} halfHeight=${this.halfHeight}]`;
  }
}
function Ma(s, t, e, i, r, n) {
  const o = s - e,
    a = t - i,
    h = r - e,
    l = n - i,
    c = o * h + a * l,
    u = h * h + l * l;
  let f = -1;
  u !== 0 && (f = c / u);
  let d, m;
  f < 0 ? ((d = e), (m = i)) : f > 1 ? ((d = r), (m = n)) : ((d = e + f * h), (m = i + f * l));
  const g = s - d,
    p = t - m;
  return g * g + p * p;
}
let Pa, Ta;
class se {
  constructor(...t) {
    this.type = 'polygon';
    let e = Array.isArray(t[0]) ? t[0] : t;
    if (typeof e[0] != 'number') {
      const i = [];
      for (let r = 0, n = e.length; r < n; r++) i.push(e[r].x, e[r].y);
      e = i;
    }
    ((this.points = e), (this.closePath = !0));
  }
  isClockwise() {
    let t = 0;
    const e = this.points,
      i = e.length;
    for (let r = 0; r < i; r += 2) {
      const n = e[r],
        o = e[r + 1],
        a = e[(r + 2) % i],
        h = e[(r + 3) % i];
      t += (a - n) * (h + o);
    }
    return t < 0;
  }
  containsPolygon(t) {
    const e = this.getBounds(Pa),
      i = t.getBounds(Ta);
    if (!e.containsRect(i)) return !1;
    const r = t.points;
    for (let n = 0; n < r.length; n += 2) {
      const o = r[n],
        a = r[n + 1];
      if (!this.contains(o, a)) return !1;
    }
    return !0;
  }
  clone() {
    const t = this.points.slice(),
      e = new se(t);
    return ((e.closePath = this.closePath), e);
  }
  contains(t, e) {
    let i = !1;
    const r = this.points.length / 2;
    for (let n = 0, o = r - 1; n < r; o = n++) {
      const a = this.points[n * 2],
        h = this.points[n * 2 + 1],
        l = this.points[o * 2],
        c = this.points[o * 2 + 1];
      h > e != c > e && t < (l - a) * ((e - h) / (c - h)) + a && (i = !i);
    }
    return i;
  }
  strokeContains(t, e, i, r = 0.5) {
    const n = i * i,
      o = n * (1 - r),
      a = n - o,
      { points: h } = this,
      l = h.length - (this.closePath ? 0 : 2);
    for (let c = 0; c < l; c += 2) {
      const u = h[c],
        f = h[c + 1],
        d = h[(c + 2) % h.length],
        m = h[(c + 3) % h.length],
        g = Ma(t, e, u, f, d, m),
        p = Math.sign((d - u) * (e - f) - (m - f) * (t - u));
      if (g <= (p < 0 ? a : o)) return !0;
    }
    return !1;
  }
  getBounds(t) {
    t || (t = new $());
    const e = this.points;
    let i = 1 / 0,
      r = -1 / 0,
      n = 1 / 0,
      o = -1 / 0;
    for (let a = 0, h = e.length; a < h; a += 2) {
      const l = e[a],
        c = e[a + 1];
      ((i = l < i ? l : i), (r = l > r ? l : r), (n = c < n ? c : n), (o = c > o ? c : o));
    }
    return ((t.x = i), (t.width = r - i), (t.y = n), (t.height = o - n), t);
  }
  copyFrom(t) {
    return ((this.points = t.points.slice()), (this.closePath = t.closePath), this);
  }
  copyTo(t) {
    return (t.copyFrom(this), t);
  }
  toString() {
    return `[pixi.js/math:PolygoncloseStroke=${this.closePath}points=${this.points.reduce((t, e) => `${t}, ${e}`, '')}]`;
  }
  get lastX() {
    return this.points[this.points.length - 2];
  }
  get lastY() {
    return this.points[this.points.length - 1];
  }
  get x() {
    return (
      F('8.11.0', 'Polygon.lastX is deprecated, please use Polygon.lastX instead.'),
      this.points[this.points.length - 2]
    );
  }
  get y() {
    return (
      F('8.11.0', 'Polygon.y is deprecated, please use Polygon.lastY instead.'),
      this.points[this.points.length - 1]
    );
  }
  get startX() {
    return this.points[0];
  }
  get startY() {
    return this.points[1];
  }
}
const Pe = (s, t, e, i, r, n, o) => {
  const a = s - e,
    h = t - i,
    l = Math.sqrt(a * a + h * h);
  return l >= r - n && l <= r + o;
};
class Fs {
  constructor(t = 0, e = 0, i = 0, r = 0, n = 20) {
    ((this.type = 'roundedRectangle'),
      (this.x = t),
      (this.y = e),
      (this.width = i),
      (this.height = r),
      (this.radius = n));
  }
  getBounds(t) {
    return (
      t || (t = new $()),
      (t.x = this.x),
      (t.y = this.y),
      (t.width = this.width),
      (t.height = this.height),
      t
    );
  }
  clone() {
    return new Fs(this.x, this.y, this.width, this.height, this.radius);
  }
  copyFrom(t) {
    return ((this.x = t.x), (this.y = t.y), (this.width = t.width), (this.height = t.height), this);
  }
  copyTo(t) {
    return (t.copyFrom(this), t);
  }
  contains(t, e) {
    if (this.width <= 0 || this.height <= 0) return !1;
    if (t >= this.x && t <= this.x + this.width && e >= this.y && e <= this.y + this.height) {
      const i = Math.max(0, Math.min(this.radius, Math.min(this.width, this.height) / 2));
      if (
        (e >= this.y + i && e <= this.y + this.height - i) ||
        (t >= this.x + i && t <= this.x + this.width - i)
      )
        return !0;
      let r = t - (this.x + i),
        n = e - (this.y + i);
      const o = i * i;
      if (
        r * r + n * n <= o ||
        ((r = t - (this.x + this.width - i)), r * r + n * n <= o) ||
        ((n = e - (this.y + this.height - i)), r * r + n * n <= o) ||
        ((r = t - (this.x + i)), r * r + n * n <= o)
      )
        return !0;
    }
    return !1;
  }
  strokeContains(t, e, i, r = 0.5) {
    const { x: n, y: o, width: a, height: h, radius: l } = this,
      c = i * (1 - r),
      u = i - c,
      f = n + l,
      d = o + l,
      m = a - l * 2,
      g = h - l * 2,
      p = n + a,
      y = o + h;
    return (((t >= n - c && t <= n + u) || (t >= p - u && t <= p + c)) && e >= d && e <= d + g) ||
      (((e >= o - c && e <= o + u) || (e >= y - u && e <= y + c)) && t >= f && t <= f + m)
      ? !0
      : (t < f && e < d && Pe(t, e, f, d, l, u, c)) ||
          (t > p - l && e < d && Pe(t, e, p - l, d, l, u, c)) ||
          (t > p - l && e > y - l && Pe(t, e, p - l, y - l, l, u, c)) ||
          (t < f && e > y - l && Pe(t, e, f, y - l, l, u, c));
  }
  toString() {
    return `[pixi.js/math:RoundedRectangle x=${this.x} y=${this.y}width=${this.width} height=${this.height} radius=${this.radius}]`;
  }
}
const Xr = {};
function ka(s, t, e) {
  let i = 2166136261;
  for (let r = 0; r < t; r++) ((i ^= s[r].uid), (i = Math.imul(i, 16777619)), (i >>>= 0));
  return Xr[i] || Ia(s, t, i, e);
}
function Ia(s, t, e, i) {
  const r = {};
  let n = 0;
  for (let a = 0; a < i; a++) {
    const h = a < t ? s[a] : D.EMPTY.source;
    ((r[n++] = h.source), (r[n++] = h.style));
  }
  const o = new Ie(r);
  return ((Xr[e] = o), o);
}
class bi {
  constructor(t) {
    (typeof t == 'number'
      ? (this.rawBinaryData = new ArrayBuffer(t))
      : t instanceof Uint8Array
        ? (this.rawBinaryData = t.buffer)
        : (this.rawBinaryData = t),
      (this.uint32View = new Uint32Array(this.rawBinaryData)),
      (this.float32View = new Float32Array(this.rawBinaryData)),
      (this.size = this.rawBinaryData.byteLength));
  }
  get int8View() {
    return (this._int8View || (this._int8View = new Int8Array(this.rawBinaryData)), this._int8View);
  }
  get uint8View() {
    return (
      this._uint8View || (this._uint8View = new Uint8Array(this.rawBinaryData)),
      this._uint8View
    );
  }
  get int16View() {
    return (
      this._int16View || (this._int16View = new Int16Array(this.rawBinaryData)),
      this._int16View
    );
  }
  get int32View() {
    return (
      this._int32View || (this._int32View = new Int32Array(this.rawBinaryData)),
      this._int32View
    );
  }
  get float64View() {
    return (
      this._float64Array || (this._float64Array = new Float64Array(this.rawBinaryData)),
      this._float64Array
    );
  }
  get bigUint64View() {
    return (
      this._bigUint64Array || (this._bigUint64Array = new BigUint64Array(this.rawBinaryData)),
      this._bigUint64Array
    );
  }
  view(t) {
    return this[`${t}View`];
  }
  destroy() {
    ((this.rawBinaryData = null),
      (this._int8View = null),
      (this._uint8View = null),
      (this._int16View = null),
      (this.uint16View = null),
      (this._int32View = null),
      (this.uint32View = null),
      (this.float32View = null));
  }
  static sizeOf(t) {
    switch (t) {
      case 'int8':
      case 'uint8':
        return 1;
      case 'int16':
      case 'uint16':
        return 2;
      case 'int32':
      case 'uint32':
      case 'float32':
        return 4;
      default:
        throw new Error(`${t} isn't a valid view type`);
    }
  }
}
function wi(s, t) {
  const e = (s.byteLength / 8) | 0,
    i = new Float64Array(s, 0, e);
  new Float64Array(t, 0, e).set(i);
  const n = s.byteLength - e * 8;
  if (n > 0) {
    const o = new Uint8Array(s, e * 8, n);
    new Uint8Array(t, e * 8, n).set(o);
  }
}
const Ea = { normal: 'normal-npm', add: 'add-npm', screen: 'screen-npm' };
var Ra = ((s) => (
  (s[(s.DISABLED = 0)] = 'DISABLED'),
  (s[(s.RENDERING_MASK_ADD = 1)] = 'RENDERING_MASK_ADD'),
  (s[(s.MASK_ACTIVE = 2)] = 'MASK_ACTIVE'),
  (s[(s.INVERSE_MASK_ACTIVE = 3)] = 'INVERSE_MASK_ACTIVE'),
  (s[(s.RENDERING_MASK_REMOVE = 4)] = 'RENDERING_MASK_REMOVE'),
  (s[(s.NONE = 5)] = 'NONE'),
  s
))(Ra || {});
function vi(s, t) {
  return (t.alphaMode === 'no-premultiply-alpha' && Ea[s]) || s;
}
const Ga = [
  'precision mediump float;',
  'void main(void){',
  'float test = 0.1;',
  '%forloop%',
  'gl_FragColor = vec4(0.0);',
  '}',
].join(`
`);
function Ba(s) {
  let t = '';
  for (let e = 0; e < s; ++e)
    (e > 0 &&
      (t += `
else `),
      e < s - 1 && (t += `if(test == ${e}.0){}`));
  return t;
}
function Fa(s, t) {
  if (s === 0) throw new Error('Invalid value of `0` passed to `checkMaxIfStatementsInShader`');
  const e = t.createShader(t.FRAGMENT_SHADER);
  try {
    for (;;) {
      const i = Ga.replace(/%forloop%/gi, Ba(s));
      if ((t.shaderSource(e, i), t.compileShader(e), !t.getShaderParameter(e, t.COMPILE_STATUS)))
        s = (s / 2) | 0;
      else break;
    }
  } finally {
    t.deleteShader(e);
  }
  return s;
}
let Et = null;
function Da() {
  if (Et) return Et;
  const s = Pr();
  return (
    (Et = s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS)),
    (Et = Fa(Et, s)),
    s.getExtension('WEBGL_lose_context')?.loseContext(),
    Et
  );
}
class La {
  constructor() {
    ((this.ids = Object.create(null)), (this.textures = []), (this.count = 0));
  }
  clear() {
    for (let t = 0; t < this.count; t++) {
      const e = this.textures[t];
      ((this.textures[t] = null), (this.ids[e.uid] = null));
    }
    this.count = 0;
  }
}
class Ua {
  constructor() {
    ((this.renderPipeId = 'batch'),
      (this.action = 'startBatch'),
      (this.start = 0),
      (this.size = 0),
      (this.textures = new La()),
      (this.blendMode = 'normal'),
      (this.topology = 'triangle-strip'),
      (this.canBundle = !0));
  }
  destroy() {
    ((this.textures = null),
      (this.gpuBindGroup = null),
      (this.bindGroup = null),
      (this.batcher = null));
  }
}
const Wr = [];
let Cs = 0;
function Ci() {
  return Cs > 0 ? Wr[--Cs] : new Ua();
}
function Ai(s) {
  Wr[Cs++] = s;
}
let Wt = 0;
const jr = class qr {
  constructor(t) {
    ((this.uid = O('batcher')),
      (this.dirty = !0),
      (this.batchIndex = 0),
      (this.batches = []),
      (this._elements = []),
      (t = { ...qr.defaultOptions, ...t }),
      t.maxTextures ||
        (F(
          'v8.8.0',
          'maxTextures is a required option for Batcher now, please pass it in the options',
        ),
        (t.maxTextures = Da())));
    const { maxTextures: e, attributesInitialSize: i, indicesInitialSize: r } = t;
    ((this.attributeBuffer = new bi(i * 4)),
      (this.indexBuffer = new Uint16Array(r)),
      (this.maxTextures = e));
  }
  begin() {
    ((this.elementSize = 0),
      (this.elementStart = 0),
      (this.indexSize = 0),
      (this.attributeSize = 0));
    for (let t = 0; t < this.batchIndex; t++) Ai(this.batches[t]);
    ((this.batchIndex = 0),
      (this._batchIndexStart = 0),
      (this._batchIndexSize = 0),
      (this.dirty = !0));
  }
  add(t) {
    ((this._elements[this.elementSize++] = t),
      (t._indexStart = this.indexSize),
      (t._attributeStart = this.attributeSize),
      (t._batcher = this),
      (this.indexSize += t.indexSize),
      (this.attributeSize += t.attributeSize * this.vertexSize));
  }
  checkAndUpdateTexture(t, e) {
    const i = t._batch.textures.ids[e._source.uid];
    return !i && i !== 0 ? !1 : ((t._textureId = i), (t.texture = e), !0);
  }
  updateElement(t) {
    this.dirty = !0;
    const e = this.attributeBuffer;
    t.packAsQuad
      ? this.packQuadAttributes(t, e.float32View, e.uint32View, t._attributeStart, t._textureId)
      : this.packAttributes(t, e.float32View, e.uint32View, t._attributeStart, t._textureId);
  }
  break(t) {
    const e = this._elements;
    if (!e[this.elementStart]) return;
    let i = Ci(),
      r = i.textures;
    r.clear();
    const n = e[this.elementStart];
    let o = vi(n.blendMode, n.texture._source),
      a = n.topology;
    (this.attributeSize * 4 > this.attributeBuffer.size &&
      this._resizeAttributeBuffer(this.attributeSize * 4),
      this.indexSize > this.indexBuffer.length && this._resizeIndexBuffer(this.indexSize));
    const h = this.attributeBuffer.float32View,
      l = this.attributeBuffer.uint32View,
      c = this.indexBuffer;
    let u = this._batchIndexSize,
      f = this._batchIndexStart,
      d = 'startBatch';
    const m = this.maxTextures;
    for (let g = this.elementStart; g < this.elementSize; ++g) {
      const p = e[g];
      e[g] = null;
      const x = p.texture._source,
        _ = vi(p.blendMode, x),
        b = o !== _ || a !== p.topology;
      if (x._batchTick === Wt && !b) {
        ((p._textureId = x._textureBindLocation),
          (u += p.indexSize),
          p.packAsQuad
            ? (this.packQuadAttributes(p, h, l, p._attributeStart, p._textureId),
              this.packQuadIndex(c, p._indexStart, p._attributeStart / this.vertexSize))
            : (this.packAttributes(p, h, l, p._attributeStart, p._textureId),
              this.packIndex(p, c, p._indexStart, p._attributeStart / this.vertexSize)),
          (p._batch = i));
        continue;
      }
      ((x._batchTick = Wt),
        (r.count >= m || b) &&
          (this._finishBatch(i, f, u - f, r, o, a, t, d),
          (d = 'renderBatch'),
          (f = u),
          (o = _),
          (a = p.topology),
          (i = Ci()),
          (r = i.textures),
          r.clear(),
          ++Wt),
        (p._textureId = x._textureBindLocation = r.count),
        (r.ids[x.uid] = r.count),
        (r.textures[r.count++] = x),
        (p._batch = i),
        (u += p.indexSize),
        p.packAsQuad
          ? (this.packQuadAttributes(p, h, l, p._attributeStart, p._textureId),
            this.packQuadIndex(c, p._indexStart, p._attributeStart / this.vertexSize))
          : (this.packAttributes(p, h, l, p._attributeStart, p._textureId),
            this.packIndex(p, c, p._indexStart, p._attributeStart / this.vertexSize)));
    }
    (r.count > 0 && (this._finishBatch(i, f, u - f, r, o, a, t, d), (f = u), ++Wt),
      (this.elementStart = this.elementSize),
      (this._batchIndexStart = f),
      (this._batchIndexSize = u));
  }
  _finishBatch(t, e, i, r, n, o, a, h) {
    ((t.gpuBindGroup = null),
      (t.bindGroup = null),
      (t.action = h),
      (t.batcher = this),
      (t.textures = r),
      (t.blendMode = n),
      (t.topology = o),
      (t.start = e),
      (t.size = i),
      ++Wt,
      (this.batches[this.batchIndex++] = t),
      a.add(t));
  }
  finish(t) {
    this.break(t);
  }
  ensureAttributeBuffer(t) {
    t * 4 <= this.attributeBuffer.size || this._resizeAttributeBuffer(t * 4);
  }
  ensureIndexBuffer(t) {
    t <= this.indexBuffer.length || this._resizeIndexBuffer(t);
  }
  _resizeAttributeBuffer(t) {
    const e = Math.max(t, this.attributeBuffer.size * 2),
      i = new bi(e);
    (wi(this.attributeBuffer.rawBinaryData, i.rawBinaryData), (this.attributeBuffer = i));
  }
  _resizeIndexBuffer(t) {
    const e = this.indexBuffer;
    let i = Math.max(t, e.length * 1.5);
    i += i % 2;
    const r = i > 65535 ? new Uint32Array(i) : new Uint16Array(i);
    if (r.BYTES_PER_ELEMENT !== e.BYTES_PER_ELEMENT) for (let n = 0; n < e.length; n++) r[n] = e[n];
    else wi(e.buffer, r.buffer);
    this.indexBuffer = r;
  }
  packQuadIndex(t, e, i) {
    ((t[e] = i + 0),
      (t[e + 1] = i + 1),
      (t[e + 2] = i + 2),
      (t[e + 3] = i + 0),
      (t[e + 4] = i + 2),
      (t[e + 5] = i + 3));
  }
  packIndex(t, e, i, r) {
    const n = t.indices,
      o = t.indexSize,
      a = t.indexOffset,
      h = t.attributeOffset;
    for (let l = 0; l < o; l++) e[i++] = r + n[l + a] - h;
  }
  destroy() {
    for (let t = 0; t < this.batches.length; t++) Ai(this.batches[t]);
    this.batches = null;
    for (let t = 0; t < this._elements.length; t++) this._elements[t]._batch = null;
    ((this._elements = null),
      (this.indexBuffer = null),
      this.attributeBuffer.destroy(),
      (this.attributeBuffer = null));
  }
};
jr.defaultOptions = { maxTextures: null, attributesInitialSize: 4, indicesInitialSize: 6 };
let za = jr;
var Z = ((s) => (
  (s[(s.MAP_READ = 1)] = 'MAP_READ'),
  (s[(s.MAP_WRITE = 2)] = 'MAP_WRITE'),
  (s[(s.COPY_SRC = 4)] = 'COPY_SRC'),
  (s[(s.COPY_DST = 8)] = 'COPY_DST'),
  (s[(s.INDEX = 16)] = 'INDEX'),
  (s[(s.VERTEX = 32)] = 'VERTEX'),
  (s[(s.UNIFORM = 64)] = 'UNIFORM'),
  (s[(s.STORAGE = 128)] = 'STORAGE'),
  (s[(s.INDIRECT = 256)] = 'INDIRECT'),
  (s[(s.QUERY_RESOLVE = 512)] = 'QUERY_RESOLVE'),
  (s[(s.STATIC = 1024)] = 'STATIC'),
  s
))(Z || {});
class he extends ut {
  constructor(t) {
    let { data: e, size: i } = t;
    const { usage: r, label: n, shrinkToFit: o } = t;
    (super(),
      (this.uid = O('buffer')),
      (this._resourceType = 'buffer'),
      (this._resourceId = O('resource')),
      (this._touched = 0),
      (this._updateID = 1),
      (this._dataInt32 = null),
      (this.shrinkToFit = !0),
      (this.destroyed = !1),
      e instanceof Array && (e = new Float32Array(e)),
      (this._data = e),
      i ?? (i = e?.byteLength));
    const a = !!e;
    ((this.descriptor = { size: i, usage: r, mappedAtCreation: a, label: n }),
      (this.shrinkToFit = o ?? !0));
  }
  get data() {
    return this._data;
  }
  set data(t) {
    this.setDataWithSize(t, t.length, !0);
  }
  get dataInt32() {
    return (
      this._dataInt32 || (this._dataInt32 = new Int32Array(this.data.buffer)),
      this._dataInt32
    );
  }
  get static() {
    return !!(this.descriptor.usage & Z.STATIC);
  }
  set static(t) {
    t ? (this.descriptor.usage |= Z.STATIC) : (this.descriptor.usage &= ~Z.STATIC);
  }
  setDataWithSize(t, e, i) {
    if ((this._updateID++, (this._updateSize = e * t.BYTES_PER_ELEMENT), this._data === t)) {
      i && this.emit('update', this);
      return;
    }
    const r = this._data;
    if (((this._data = t), (this._dataInt32 = null), !r || r.length !== t.length)) {
      !this.shrinkToFit && r && t.byteLength < r.byteLength
        ? i && this.emit('update', this)
        : ((this.descriptor.size = t.byteLength),
          (this._resourceId = O('resource')),
          this.emit('change', this));
      return;
    }
    i && this.emit('update', this);
  }
  update(t) {
    ((this._updateSize = t ?? this._updateSize), this._updateID++, this.emit('update', this));
  }
  destroy() {
    ((this.destroyed = !0),
      this.emit('destroy', this),
      this.emit('change', this),
      (this._data = null),
      (this.descriptor = null),
      this.removeAllListeners());
  }
}
function Zr(s, t) {
  if (!(s instanceof he)) {
    let e = t ? Z.INDEX : Z.VERTEX;
    (s instanceof Array &&
      (t
        ? ((s = new Uint32Array(s)), (e = Z.INDEX | Z.COPY_DST))
        : ((s = new Float32Array(s)), (e = Z.VERTEX | Z.COPY_DST))),
      (s = new he({ data: s, label: t ? 'index-mesh-buffer' : 'vertex-mesh-buffer', usage: e })));
  }
  return s;
}
function Na(s, t, e) {
  const i = s.getAttribute(t);
  if (!i) return ((e.minX = 0), (e.minY = 0), (e.maxX = 0), (e.maxY = 0), e);
  const r = i.buffer.data;
  let n = 1 / 0,
    o = 1 / 0,
    a = -1 / 0,
    h = -1 / 0;
  const l = r.BYTES_PER_ELEMENT,
    c = (i.offset || 0) / l,
    u = (i.stride || 2 * 4) / l;
  for (let f = c; f < r.length; f += u) {
    const d = r[f],
      m = r[f + 1];
    (d > a && (a = d), m > h && (h = m), d < n && (n = d), m < o && (o = m));
  }
  return ((e.minX = n), (e.minY = o), (e.maxX = a), (e.maxY = h), e);
}
function Oa(s) {
  return (
    (s instanceof he || Array.isArray(s) || s.BYTES_PER_ELEMENT) && (s = { buffer: s }),
    (s.buffer = Zr(s.buffer, !1)),
    s
  );
}
class Va extends ut {
  constructor(t = {}) {
    (super(),
      (this.uid = O('geometry')),
      (this._layoutKey = 0),
      (this.instanceCount = 1),
      (this._bounds = new it()),
      (this._boundsDirty = !0));
    const { attributes: e, indexBuffer: i, topology: r } = t;
    if (((this.buffers = []), (this.attributes = {}), e))
      for (const n in e) this.addAttribute(n, e[n]);
    ((this.instanceCount = t.instanceCount ?? 1),
      i && this.addIndex(i),
      (this.topology = r || 'triangle-list'));
  }
  onBufferUpdate() {
    ((this._boundsDirty = !0), this.emit('update', this));
  }
  getAttribute(t) {
    return this.attributes[t];
  }
  getIndex() {
    return this.indexBuffer;
  }
  getBuffer(t) {
    return this.getAttribute(t).buffer;
  }
  getSize() {
    for (const t in this.attributes) {
      const e = this.attributes[t];
      return e.buffer.data.length / (e.stride / 4 || e.size);
    }
    return 0;
  }
  addAttribute(t, e) {
    const i = Oa(e);
    (this.buffers.indexOf(i.buffer) === -1 &&
      (this.buffers.push(i.buffer),
      i.buffer.on('update', this.onBufferUpdate, this),
      i.buffer.on('change', this.onBufferUpdate, this)),
      (this.attributes[t] = i));
  }
  addIndex(t) {
    ((this.indexBuffer = Zr(t, !0)), this.buffers.push(this.indexBuffer));
  }
  get bounds() {
    return this._boundsDirty
      ? ((this._boundsDirty = !1), Na(this, 'aPosition', this._bounds))
      : this._bounds;
  }
  destroy(t = !1) {
    (this.emit('destroy', this),
      this.removeAllListeners(),
      t && this.buffers.forEach((e) => e.destroy()),
      (this.attributes = null),
      (this.buffers = null),
      (this.indexBuffer = null),
      (this._bounds = null));
  }
}
const Ha = new Float32Array(1),
  Ya = new Uint32Array(1);
class $a extends Va {
  constructor() {
    const e = new he({
        data: Ha,
        label: 'attribute-batch-buffer',
        usage: Z.VERTEX | Z.COPY_DST,
        shrinkToFit: !1,
      }),
      i = new he({
        data: Ya,
        label: 'index-batch-buffer',
        usage: Z.INDEX | Z.COPY_DST,
        shrinkToFit: !1,
      }),
      r = 6 * 4;
    super({
      attributes: {
        aPosition: { buffer: e, format: 'float32x2', stride: r, offset: 0 },
        aUV: { buffer: e, format: 'float32x2', stride: r, offset: 2 * 4 },
        aColor: { buffer: e, format: 'unorm8x4', stride: r, offset: 4 * 4 },
        aTextureIdAndRound: { buffer: e, format: 'uint16x2', stride: r, offset: 5 * 4 },
      },
      indexBuffer: i,
    });
  }
}
function Si(s, t, e) {
  if (s)
    for (const i in s) {
      const r = i.toLocaleLowerCase(),
        n = t[r];
      if (n) {
        let o = s[i];
        (i === 'header' && (o = o.replace(/@in\s+[^;]+;\s*/g, '').replace(/@out\s+[^;]+;\s*/g, '')),
          e && n.push(`//----${e}----//`),
          n.push(o));
      } else K(`${i} placement hook does not exist in shader`);
    }
}
const Xa = /\{\{(.*?)\}\}/g;
function Mi(s) {
  const t = {};
  return (
    (s.match(Xa)?.map((i) => i.replace(/[{()}]/g, '')) ?? []).forEach((i) => {
      t[i] = [];
    }),
    t
  );
}
function Pi(s, t) {
  let e;
  const i = /@in\s+([^;]+);/g;
  for (; (e = i.exec(s)) !== null; ) t.push(e[1]);
}
function Ti(s, t, e = !1) {
  const i = [];
  (Pi(t, i),
    s.forEach((a) => {
      a.header && Pi(a.header, i);
    }));
  const r = i;
  e && r.sort();
  const n = r.map((a, h) => `       @location(${h}) ${a},`).join(`
`);
  let o = t.replace(/@in\s+[^;]+;\s*/g, '');
  return (
    (o = o.replace(
      '{{in}}',
      `
${n}
`,
    )),
    o
  );
}
function ki(s, t) {
  let e;
  const i = /@out\s+([^;]+);/g;
  for (; (e = i.exec(s)) !== null; ) t.push(e[1]);
}
function Wa(s) {
  const e = /\b(\w+)\s*:/g.exec(s);
  return e ? e[1] : '';
}
function ja(s) {
  const t = /@.*?\s+/g;
  return s.replace(t, '');
}
function qa(s, t) {
  const e = [];
  (ki(t, e),
    s.forEach((h) => {
      h.header && ki(h.header, e);
    }));
  let i = 0;
  const r = e.sort().map((h) => (h.indexOf('builtin') > -1 ? h : `@location(${i++}) ${h}`)).join(`,
`),
    n = e.sort().map((h) => `       var ${ja(h)};`).join(`
`),
    o = `return VSOutput(
            ${e.sort().map((h) => ` ${Wa(h)}`).join(`,
`)});`;
  let a = t.replace(/@out\s+[^;]+;\s*/g, '');
  return (
    (a = a.replace(
      '{{struct}}',
      `
${r}
`,
    )),
    (a = a.replace(
      '{{start}}',
      `
${n}
`,
    )),
    (a = a.replace(
      '{{return}}',
      `
${o}
`,
    )),
    a
  );
}
function Ii(s, t) {
  let e = s;
  for (const i in t) {
    const r = t[i];
    r.join(`
`).length
      ? (e = e.replace(
          `{{${i}}}`,
          `//-----${i} START-----//
${r.join(`
`)}
//----${i} FINISH----//`,
        ))
      : (e = e.replace(`{{${i}}}`, ''));
  }
  return e;
}
const mt = Object.create(null),
  is = new Map();
let Za = 0;
function Ka({ template: s, bits: t }) {
  const e = Kr(s, t);
  if (mt[e]) return mt[e];
  const { vertex: i, fragment: r } = Ja(s, t);
  return ((mt[e] = Qr(i, r, t)), mt[e]);
}
function Qa({ template: s, bits: t }) {
  const e = Kr(s, t);
  return (mt[e] || (mt[e] = Qr(s.vertex, s.fragment, t)), mt[e]);
}
function Ja(s, t) {
  const e = t.map((o) => o.vertex).filter((o) => !!o),
    i = t.map((o) => o.fragment).filter((o) => !!o);
  let r = Ti(e, s.vertex, !0);
  r = qa(e, r);
  const n = Ti(i, s.fragment, !0);
  return { vertex: r, fragment: n };
}
function Kr(s, t) {
  return (
    t
      .map((e) => (is.has(e) || is.set(e, Za++), is.get(e)))
      .sort((e, i) => e - i)
      .join('-') +
    s.vertex +
    s.fragment
  );
}
function Qr(s, t, e) {
  const i = Mi(s),
    r = Mi(t);
  return (
    e.forEach((n) => {
      (Si(n.vertex, i, n.name), Si(n.fragment, r, n.name));
    }),
    { vertex: Ii(s, i), fragment: Ii(t, r) }
  );
}
const th = `
    @in aPosition: vec2<f32>;
    @in aUV: vec2<f32>;

    @out @builtin(position) vPosition: vec4<f32>;
    @out vUV : vec2<f32>;
    @out vColor : vec4<f32>;

    {{header}}

    struct VSOutput {
        {{struct}}
    };

    @vertex
    fn main( {{in}} ) -> VSOutput {

        var worldTransformMatrix = globalUniforms.uWorldTransformMatrix;
        var modelMatrix = mat3x3<f32>(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        var position = aPosition;
        var uv = aUV;

        {{start}}

        vColor = vec4<f32>(1., 1., 1., 1.);

        {{main}}

        vUV = uv;

        var modelViewProjectionMatrix = globalUniforms.uProjectionMatrix * worldTransformMatrix * modelMatrix;

        vPosition =  vec4<f32>((modelViewProjectionMatrix *  vec3<f32>(position, 1.0)).xy, 0.0, 1.0);

        vColor *= globalUniforms.uWorldColorAlpha;

        {{end}}

        {{return}}
    };
`,
  eh = `
    @in vUV : vec2<f32>;
    @in vColor : vec4<f32>;

    {{header}}

    @fragment
    fn main(
        {{in}}
      ) -> @location(0) vec4<f32> {

        {{start}}

        var outColor:vec4<f32>;

        {{main}}

        var finalColor:vec4<f32> = outColor * vColor;

        {{end}}

        return finalColor;
      };
`,
  sh = `
    in vec2 aPosition;
    in vec2 aUV;

    out vec4 vColor;
    out vec2 vUV;

    {{header}}

    void main(void){

        mat3 worldTransformMatrix = uWorldTransformMatrix;
        mat3 modelMatrix = mat3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        vec2 position = aPosition;
        vec2 uv = aUV;

        {{start}}

        vColor = vec4(1.);

        {{main}}

        vUV = uv;

        mat3 modelViewProjectionMatrix = uProjectionMatrix * worldTransformMatrix * modelMatrix;

        gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);

        vColor *= uWorldColorAlpha;

        {{end}}
    }
`,
  ih = `

    in vec4 vColor;
    in vec2 vUV;

    out vec4 finalColor;

    {{header}}

    void main(void) {

        {{start}}

        vec4 outColor;

        {{main}}

        finalColor = outColor * vColor;

        {{end}}
    }
`,
  rh = {
    name: 'global-uniforms-bit',
    vertex: {
      header: `
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `,
    },
  },
  nh = {
    name: 'global-uniforms-bit',
    vertex: {
      header: `
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `,
    },
  };
function oh({ bits: s, name: t }) {
  const e = Ka({ template: { fragment: eh, vertex: th }, bits: [rh, ...s] });
  return Fe.from({
    name: t,
    vertex: { source: e.vertex, entryPoint: 'main' },
    fragment: { source: e.fragment, entryPoint: 'main' },
  });
}
function ah({ bits: s, name: t }) {
  return new kr({ name: t, ...Qa({ template: { vertex: sh, fragment: ih }, bits: [nh, ...s] }) });
}
const hh = {
    name: 'color-bit',
    vertex: {
      header: `
            @in aColor: vec4<f32>;
        `,
      main: `
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `,
    },
  },
  lh = {
    name: 'color-bit',
    vertex: {
      header: `
            in vec4 aColor;
        `,
      main: `
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `,
    },
  },
  rs = {};
function ch(s) {
  const t = [];
  if (s === 1)
    (t.push('@group(1) @binding(0) var textureSource1: texture_2d<f32>;'),
      t.push('@group(1) @binding(1) var textureSampler1: sampler;'));
  else {
    let e = 0;
    for (let i = 0; i < s; i++)
      (t.push(`@group(1) @binding(${e++}) var textureSource${i + 1}: texture_2d<f32>;`),
        t.push(`@group(1) @binding(${e++}) var textureSampler${i + 1}: sampler;`));
  }
  return t.join(`
`);
}
function uh(s) {
  const t = [];
  if (s === 1)
    t.push('outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);');
  else {
    t.push('switch vTextureId {');
    for (let e = 0; e < s; e++)
      (e === s - 1 ? t.push('  default:{') : t.push(`  case ${e}:{`),
        t.push(
          `      outColor = textureSampleGrad(textureSource${e + 1}, textureSampler${e + 1}, vUV, uvDx, uvDy);`,
        ),
        t.push('      break;}'));
    t.push('}');
  }
  return t.join(`
`);
}
function dh(s) {
  return (
    rs[s] ||
      (rs[s] = {
        name: 'texture-batch-bit',
        vertex: {
          header: `
                @in aTextureIdAndRound: vec2<u32>;
                @out @interpolate(flat) vTextureId : u32;
            `,
          main: `
                vTextureId = aTextureIdAndRound.y;
            `,
          end: `
                if(aTextureIdAndRound.x == 1)
                {
                    vPosition = vec4<f32>(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                }
            `,
        },
        fragment: {
          header: `
                @in @interpolate(flat) vTextureId: u32;

                ${ch(s)}
            `,
          main: `
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);

                ${uh(s)}
            `,
        },
      }),
    rs[s]
  );
}
const ns = {};
function fh(s) {
  const t = [];
  for (let e = 0; e < s; e++)
    (e > 0 && t.push('else'),
      e < s - 1 && t.push(`if(vTextureId < ${e}.5)`),
      t.push('{'),
      t.push(`	outColor = texture(uTextures[${e}], vUV);`),
      t.push('}'));
  return t.join(`
`);
}
function ph(s) {
  return (
    ns[s] ||
      (ns[s] = {
        name: 'texture-batch-bit',
        vertex: {
          header: `
                in vec2 aTextureIdAndRound;
                out float vTextureId;

            `,
          main: `
                vTextureId = aTextureIdAndRound.y;
            `,
          end: `
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `,
        },
        fragment: {
          header: `
                in float vTextureId;

                uniform sampler2D uTextures[${s}];

            `,
          main: `

                ${fh(s)}
            `,
        },
      }),
    ns[s]
  );
}
const mh = {
    name: 'round-pixels-bit',
    vertex: {
      header: `
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32>
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `,
    },
  },
  gh = {
    name: 'round-pixels-bit',
    vertex: {
      header: `
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `,
    },
  },
  Ei = {};
function xh(s) {
  let t = Ei[s];
  if (t) return t;
  const e = new Int32Array(s);
  for (let i = 0; i < s; i++) e[i] = i;
  return (
    (t = Ei[s] = new Gr({ uTextures: { value: e, type: 'i32', size: s } }, { isStatic: !0 })),
    t
  );
}
class yh extends Es {
  constructor(t) {
    const e = ah({ name: 'batch', bits: [lh, ph(t), gh] }),
      i = oh({ name: 'batch', bits: [hh, dh(t), mh] });
    super({ glProgram: e, gpuProgram: i, resources: { batchSamplers: xh(t) } });
  }
}
let os = null;
const Jr = class tn extends za {
  constructor(t) {
    (super(t),
      (this.geometry = new $a()),
      (this.name = tn.extension.name),
      (this.vertexSize = 6),
      os ?? (os = new yh(t.maxTextures)),
      (this.shader = os));
  }
  packAttributes(t, e, i, r, n) {
    const o = (n << 16) | (t.roundPixels & 65535),
      a = t.transform,
      h = a.a,
      l = a.b,
      c = a.c,
      u = a.d,
      f = a.tx,
      d = a.ty,
      { positions: m, uvs: g } = t,
      p = t.color,
      y = t.attributeOffset,
      x = y + t.attributeSize;
    for (let _ = y; _ < x; _++) {
      const b = _ * 2,
        C = m[b],
        w = m[b + 1];
      ((e[r++] = h * C + c * w + f),
        (e[r++] = u * w + l * C + d),
        (e[r++] = g[b]),
        (e[r++] = g[b + 1]),
        (i[r++] = p),
        (i[r++] = o));
    }
  }
  packQuadAttributes(t, e, i, r, n) {
    const o = t.texture,
      a = t.transform,
      h = a.a,
      l = a.b,
      c = a.c,
      u = a.d,
      f = a.tx,
      d = a.ty,
      m = t.bounds,
      g = m.maxX,
      p = m.minX,
      y = m.maxY,
      x = m.minY,
      _ = o.uvs,
      b = t.color,
      C = (n << 16) | (t.roundPixels & 65535);
    ((e[r + 0] = h * p + c * x + f),
      (e[r + 1] = u * x + l * p + d),
      (e[r + 2] = _.x0),
      (e[r + 3] = _.y0),
      (i[r + 4] = b),
      (i[r + 5] = C),
      (e[r + 6] = h * g + c * x + f),
      (e[r + 7] = u * x + l * g + d),
      (e[r + 8] = _.x1),
      (e[r + 9] = _.y1),
      (i[r + 10] = b),
      (i[r + 11] = C),
      (e[r + 12] = h * g + c * y + f),
      (e[r + 13] = u * y + l * g + d),
      (e[r + 14] = _.x2),
      (e[r + 15] = _.y2),
      (i[r + 16] = b),
      (i[r + 17] = C),
      (e[r + 18] = h * p + c * y + f),
      (e[r + 19] = u * y + l * p + d),
      (e[r + 20] = _.x3),
      (e[r + 21] = _.y3),
      (i[r + 22] = b),
      (i[r + 23] = C));
  }
};
Jr.extension = { type: [G.Batcher], name: 'default' };
let _h = Jr;
function bh(s, t, e, i, r, n, o, a = null) {
  let h = 0;
  ((e *= t), (r *= n));
  const l = a.a,
    c = a.b,
    u = a.c,
    f = a.d,
    d = a.tx,
    m = a.ty;
  for (; h < o; ) {
    const g = s[e],
      p = s[e + 1];
    ((i[r] = l * g + u * p + d), (i[r + 1] = c * g + f * p + m), (r += n), (e += t), h++);
  }
}
function wh(s, t, e, i) {
  let r = 0;
  for (t *= e; r < i; ) ((s[t] = 0), (s[t + 1] = 0), (t += e), r++);
}
function en(s, t, e, i, r) {
  const n = t.a,
    o = t.b,
    a = t.c,
    h = t.d,
    l = t.tx,
    c = t.ty;
  (e || (e = 0), i || (i = 2), r || (r = s.length / i - e));
  let u = e * i;
  for (let f = 0; f < r; f++) {
    const d = s[u],
      m = s[u + 1];
    ((s[u] = n * d + a * m + l), (s[u + 1] = o * d + h * m + c), (u += i));
  }
}
const vh = new I();
class sn {
  constructor() {
    ((this.packAsQuad = !1),
      (this.batcherName = 'default'),
      (this.topology = 'triangle-list'),
      (this.applyTransform = !0),
      (this.roundPixels = 0),
      (this._batcher = null),
      (this._batch = null));
  }
  get uvs() {
    return this.geometryData.uvs;
  }
  get positions() {
    return this.geometryData.vertices;
  }
  get indices() {
    return this.geometryData.indices;
  }
  get blendMode() {
    return this.renderable && this.applyTransform ? this.renderable.groupBlendMode : 'normal';
  }
  get color() {
    const t = this.baseColor,
      e = (t >> 16) | (t & 65280) | ((t & 255) << 16),
      i = this.renderable;
    return i
      ? or(e, i.groupColor) + ((this.alpha * i.groupAlpha * 255) << 24)
      : e + ((this.alpha * 255) << 24);
  }
  get transform() {
    return this.renderable?.groupTransform || vh;
  }
  copyTo(t) {
    ((t.indexOffset = this.indexOffset),
      (t.indexSize = this.indexSize),
      (t.attributeOffset = this.attributeOffset),
      (t.attributeSize = this.attributeSize),
      (t.baseColor = this.baseColor),
      (t.alpha = this.alpha),
      (t.texture = this.texture),
      (t.geometryData = this.geometryData),
      (t.topology = this.topology));
  }
  reset() {
    ((this.applyTransform = !0), (this.renderable = null), (this.topology = 'triangle-list'));
  }
}
const le = {
    extension: { type: G.ShapeBuilder, name: 'circle' },
    build(s, t) {
      let e, i, r, n, o, a;
      if (s.type === 'circle') {
        const b = s;
        if (((o = a = b.radius), o <= 0)) return !1;
        ((e = b.x), (i = b.y), (r = n = 0));
      } else if (s.type === 'ellipse') {
        const b = s;
        if (((o = b.halfWidth), (a = b.halfHeight), o <= 0 || a <= 0)) return !1;
        ((e = b.x), (i = b.y), (r = n = 0));
      } else {
        const b = s,
          C = b.width / 2,
          w = b.height / 2;
        ((e = b.x + C),
          (i = b.y + w),
          (o = a = Math.max(0, Math.min(b.radius, Math.min(C, w)))),
          (r = C - o),
          (n = w - a));
      }
      if (r < 0 || n < 0) return !1;
      const h = Math.ceil(2.3 * Math.sqrt(o + a)),
        l = h * 8 + (r ? 4 : 0) + (n ? 4 : 0);
      if (l === 0) return !1;
      if (h === 0)
        return (
          (t[0] = t[6] = e + r),
          (t[1] = t[3] = i + n),
          (t[2] = t[4] = e - r),
          (t[5] = t[7] = i - n),
          !0
        );
      let c = 0,
        u = h * 4 + (r ? 2 : 0) + 2,
        f = u,
        d = l,
        m = r + o,
        g = n,
        p = e + m,
        y = e - m,
        x = i + g;
      if (((t[c++] = p), (t[c++] = x), (t[--u] = x), (t[--u] = y), n)) {
        const b = i - g;
        ((t[f++] = y), (t[f++] = b), (t[--d] = b), (t[--d] = p));
      }
      for (let b = 1; b < h; b++) {
        const C = (Math.PI / 2) * (b / h),
          w = r + Math.cos(C) * o,
          v = n + Math.sin(C) * a,
          T = e + w,
          k = e - w,
          A = i + v,
          S = i - v;
        ((t[c++] = T),
          (t[c++] = A),
          (t[--u] = A),
          (t[--u] = k),
          (t[f++] = k),
          (t[f++] = S),
          (t[--d] = S),
          (t[--d] = T));
      }
      ((m = r), (g = n + a), (p = e + m), (y = e - m), (x = i + g));
      const _ = i - g;
      return (
        (t[c++] = p),
        (t[c++] = x),
        (t[--d] = _),
        (t[--d] = p),
        r && ((t[c++] = y), (t[c++] = x), (t[--d] = _), (t[--d] = y)),
        !0
      );
    },
    triangulate(s, t, e, i, r, n) {
      if (s.length === 0) return;
      let o = 0,
        a = 0;
      for (let c = 0; c < s.length; c += 2) ((o += s[c]), (a += s[c + 1]));
      ((o /= s.length / 2), (a /= s.length / 2));
      let h = i;
      ((t[h * e] = o), (t[h * e + 1] = a));
      const l = h++;
      for (let c = 0; c < s.length; c += 2)
        ((t[h * e] = s[c]),
          (t[h * e + 1] = s[c + 1]),
          c > 0 && ((r[n++] = h), (r[n++] = l), (r[n++] = h - 1)),
          h++);
      ((r[n++] = l + 1), (r[n++] = l), (r[n++] = h - 1));
    },
  },
  Ch = { ...le, extension: { ...le.extension, name: 'ellipse' } },
  Ah = { ...le, extension: { ...le.extension, name: 'roundedRectangle' } },
  rn = 1e-4,
  Ri = 1e-4;
function Sh(s) {
  const t = s.length;
  if (t < 6) return 1;
  let e = 0;
  for (let i = 0, r = s[t - 2], n = s[t - 1]; i < t; i += 2) {
    const o = s[i],
      a = s[i + 1];
    ((e += (o - r) * (a + n)), (r = o), (n = a));
  }
  return e < 0 ? -1 : 1;
}
function Gi(s, t, e, i, r, n, o, a) {
  const h = s - e * r,
    l = t - i * r,
    c = s + e * n,
    u = t + i * n;
  let f, d;
  o ? ((f = i), (d = -e)) : ((f = -i), (d = e));
  const m = h + f,
    g = l + d,
    p = c + f,
    y = u + d;
  return (a.push(m, g), a.push(p, y), 2);
}
function Ct(s, t, e, i, r, n, o, a) {
  const h = e - s,
    l = i - t;
  let c = Math.atan2(h, l),
    u = Math.atan2(r - s, n - t);
  a && c < u ? (c += Math.PI * 2) : !a && c > u && (u += Math.PI * 2);
  let f = c;
  const d = u - c,
    m = Math.abs(d),
    g = Math.sqrt(h * h + l * l),
    p = (((15 * m * Math.sqrt(g)) / Math.PI) >> 0) + 1,
    y = d / p;
  if (((f += y), a)) {
    (o.push(s, t), o.push(e, i));
    for (let x = 1, _ = f; x < p; x++, _ += y)
      (o.push(s, t), o.push(s + Math.sin(_) * g, t + Math.cos(_) * g));
    (o.push(s, t), o.push(r, n));
  } else {
    (o.push(e, i), o.push(s, t));
    for (let x = 1, _ = f; x < p; x++, _ += y)
      (o.push(s + Math.sin(_) * g, t + Math.cos(_) * g), o.push(s, t));
    (o.push(r, n), o.push(s, t));
  }
  return p * 2;
}
function Mh(s, t, e, i, r, n) {
  const o = rn;
  if (s.length === 0) return;
  const a = t;
  let h = a.alignment;
  if (t.alignment !== 0.5) {
    let U = Sh(s);
    h = (h - 0.5) * U + 0.5;
  }
  const l = new W(s[0], s[1]),
    c = new W(s[s.length - 2], s[s.length - 1]),
    u = i,
    f = Math.abs(l.x - c.x) < o && Math.abs(l.y - c.y) < o;
  if (u) {
    ((s = s.slice()), f && (s.pop(), s.pop(), c.set(s[s.length - 2], s[s.length - 1])));
    const U = (l.x + c.x) * 0.5,
      dt = (c.y + l.y) * 0.5;
    (s.unshift(U, dt), s.push(U, dt));
  }
  const d = r,
    m = s.length / 2;
  let g = s.length;
  const p = d.length / 2,
    y = a.width / 2,
    x = y * y,
    _ = a.miterLimit * a.miterLimit;
  let b = s[0],
    C = s[1],
    w = s[2],
    v = s[3],
    T = 0,
    k = 0,
    A = -(C - v),
    S = b - w,
    R = 0,
    E = 0,
    L = Math.sqrt(A * A + S * S);
  ((A /= L), (S /= L), (A *= y), (S *= y));
  const at = h,
    M = (1 - at) * 2,
    P = at * 2;
  (u ||
    (a.cap === 'round'
      ? (g +=
          Ct(
            b - A * (M - P) * 0.5,
            C - S * (M - P) * 0.5,
            b - A * M,
            C - S * M,
            b + A * P,
            C + S * P,
            d,
            !0,
          ) + 2)
      : a.cap === 'square' && (g += Gi(b, C, A, S, M, P, !0, d))),
    d.push(b - A * M, C - S * M),
    d.push(b + A * P, C + S * P));
  for (let U = 1; U < m - 1; ++U) {
    ((b = s[(U - 1) * 2]),
      (C = s[(U - 1) * 2 + 1]),
      (w = s[U * 2]),
      (v = s[U * 2 + 1]),
      (T = s[(U + 1) * 2]),
      (k = s[(U + 1) * 2 + 1]),
      (A = -(C - v)),
      (S = b - w),
      (L = Math.sqrt(A * A + S * S)),
      (A /= L),
      (S /= L),
      (A *= y),
      (S *= y),
      (R = -(v - k)),
      (E = w - T),
      (L = Math.sqrt(R * R + E * E)),
      (R /= L),
      (E /= L),
      (R *= y),
      (E *= y));
    const dt = w - b,
      Ut = C - v,
      zt = w - T,
      Nt = k - v,
      Us = dt * zt + Ut * Nt,
      ue = Ut * zt - Nt * dt,
      Ot = ue < 0;
    if (Math.abs(ue) < 0.001 * Math.abs(Us)) {
      (d.push(w - A * M, v - S * M),
        d.push(w + A * P, v + S * P),
        Us >= 0 &&
          (a.join === 'round'
            ? (g += Ct(w, v, w - A * M, v - S * M, w - R * M, v - E * M, d, !1) + 4)
            : (g += 2),
          d.push(w - R * P, v - E * P),
          d.push(w + R * M, v + E * M)));
      continue;
    }
    const zs = (-A + b) * (-S + v) - (-A + w) * (-S + C),
      Ns = (-R + T) * (-E + v) - (-R + w) * (-E + k),
      de = (dt * Ns - zt * zs) / ue,
      fe = (Nt * zs - Ut * Ns) / ue,
      Le = (de - w) * (de - w) + (fe - v) * (fe - v),
      xt = w + (de - w) * M,
      yt = v + (fe - v) * M,
      _t = w - (de - w) * P,
      bt = v - (fe - v) * P,
      dn = Math.min(dt * dt + Ut * Ut, zt * zt + Nt * Nt),
      Os = Ot ? M : P,
      fn = dn + Os * Os * x;
    Le <= fn
      ? a.join === 'bevel' || Le / x > _
        ? (Ot
            ? (d.push(xt, yt),
              d.push(w + A * P, v + S * P),
              d.push(xt, yt),
              d.push(w + R * P, v + E * P))
            : (d.push(w - A * M, v - S * M),
              d.push(_t, bt),
              d.push(w - R * M, v - E * M),
              d.push(_t, bt)),
          (g += 2))
        : a.join === 'round'
          ? Ot
            ? (d.push(xt, yt),
              d.push(w + A * P, v + S * P),
              (g += Ct(w, v, w + A * P, v + S * P, w + R * P, v + E * P, d, !0) + 4),
              d.push(xt, yt),
              d.push(w + R * P, v + E * P))
            : (d.push(w - A * M, v - S * M),
              d.push(_t, bt),
              (g += Ct(w, v, w - A * M, v - S * M, w - R * M, v - E * M, d, !1) + 4),
              d.push(w - R * M, v - E * M),
              d.push(_t, bt))
          : (d.push(xt, yt), d.push(_t, bt))
      : (d.push(w - A * M, v - S * M),
        d.push(w + A * P, v + S * P),
        a.join === 'round'
          ? Ot
            ? (g += Ct(w, v, w + A * P, v + S * P, w + R * P, v + E * P, d, !0) + 2)
            : (g += Ct(w, v, w - A * M, v - S * M, w - R * M, v - E * M, d, !1) + 2)
          : a.join === 'miter' &&
            Le / x <= _ &&
            (Ot ? (d.push(_t, bt), d.push(_t, bt)) : (d.push(xt, yt), d.push(xt, yt)), (g += 2)),
        d.push(w - R * M, v - E * M),
        d.push(w + R * P, v + E * P),
        (g += 2));
  }
  ((b = s[(m - 2) * 2]),
    (C = s[(m - 2) * 2 + 1]),
    (w = s[(m - 1) * 2]),
    (v = s[(m - 1) * 2 + 1]),
    (A = -(C - v)),
    (S = b - w),
    (L = Math.sqrt(A * A + S * S)),
    (A /= L),
    (S /= L),
    (A *= y),
    (S *= y),
    d.push(w - A * M, v - S * M),
    d.push(w + A * P, v + S * P),
    u ||
      (a.cap === 'round'
        ? (g +=
            Ct(
              w - A * (M - P) * 0.5,
              v - S * (M - P) * 0.5,
              w - A * M,
              v - S * M,
              w + A * P,
              v + S * P,
              d,
              !1,
            ) + 2)
        : a.cap === 'square' && (g += Gi(w, v, A, S, M, P, !1, d))));
  const un = Ri * Ri;
  for (let U = p; U < g + p - 2; ++U)
    ((b = d[U * 2]),
      (C = d[U * 2 + 1]),
      (w = d[(U + 1) * 2]),
      (v = d[(U + 1) * 2 + 1]),
      (T = d[(U + 2) * 2]),
      (k = d[(U + 2) * 2 + 1]),
      !(Math.abs(b * (v - k) + w * (k - C) + T * (C - v)) < un) && n.push(U, U + 1, U + 2));
}
function Ph(s, t, e, i) {
  const r = rn;
  if (s.length === 0) return;
  const n = s[0],
    o = s[1],
    a = s[s.length - 2],
    h = s[s.length - 1],
    l = t || (Math.abs(n - a) < r && Math.abs(o - h) < r),
    c = e,
    u = s.length / 2,
    f = c.length / 2;
  for (let d = 0; d < u; d++) (c.push(s[d * 2]), c.push(s[d * 2 + 1]));
  for (let d = 0; d < u - 1; d++) i.push(f + d, f + d + 1);
  l && i.push(f + u - 1, f);
}
function nn(s, t, e, i, r, n, o) {
  const a = ca(s, t, 2);
  if (!a) return;
  for (let l = 0; l < a.length; l += 3)
    ((n[o++] = a[l] + r), (n[o++] = a[l + 1] + r), (n[o++] = a[l + 2] + r));
  let h = r * i;
  for (let l = 0; l < s.length; l += 2) ((e[h] = s[l]), (e[h + 1] = s[l + 1]), (h += i));
}
const Th = [],
  kh = {
    extension: { type: G.ShapeBuilder, name: 'polygon' },
    build(s, t) {
      for (let e = 0; e < s.points.length; e++) t[e] = s.points[e];
      return !0;
    },
    triangulate(s, t, e, i, r, n) {
      nn(s, Th, t, e, i, r, n);
    },
  },
  Ih = {
    extension: { type: G.ShapeBuilder, name: 'rectangle' },
    build(s, t) {
      const e = s,
        i = e.x,
        r = e.y,
        n = e.width,
        o = e.height;
      return n > 0 && o > 0
        ? ((t[0] = i),
          (t[1] = r),
          (t[2] = i + n),
          (t[3] = r),
          (t[4] = i + n),
          (t[5] = r + o),
          (t[6] = i),
          (t[7] = r + o),
          !0)
        : !1;
    },
    triangulate(s, t, e, i, r, n) {
      let o = 0;
      ((i *= e),
        (t[i + o] = s[0]),
        (t[i + o + 1] = s[1]),
        (o += e),
        (t[i + o] = s[2]),
        (t[i + o + 1] = s[3]),
        (o += e),
        (t[i + o] = s[6]),
        (t[i + o + 1] = s[7]),
        (o += e),
        (t[i + o] = s[4]),
        (t[i + o + 1] = s[5]),
        (o += e));
      const a = i / e;
      ((r[n++] = a),
        (r[n++] = a + 1),
        (r[n++] = a + 2),
        (r[n++] = a + 1),
        (r[n++] = a + 3),
        (r[n++] = a + 2));
    },
  },
  Eh = {
    extension: { type: G.ShapeBuilder, name: 'triangle' },
    build(s, t) {
      return (
        (t[0] = s.x),
        (t[1] = s.y),
        (t[2] = s.x2),
        (t[3] = s.y2),
        (t[4] = s.x3),
        (t[5] = s.y3),
        !0
      );
    },
    triangulate(s, t, e, i, r, n) {
      let o = 0;
      ((i *= e),
        (t[i + o] = s[0]),
        (t[i + o + 1] = s[1]),
        (o += e),
        (t[i + o] = s[2]),
        (t[i + o + 1] = s[3]),
        (o += e),
        (t[i + o] = s[4]),
        (t[i + o + 1] = s[5]));
      const a = i / e;
      ((r[n++] = a), (r[n++] = a + 1), (r[n++] = a + 2));
    },
  },
  Rh = new I(),
  Gh = new $();
function Bh(s, t, e, i) {
  const r = t.matrix ? s.copyFrom(t.matrix).invert() : s.identity();
  if (t.textureSpace === 'local') {
    const o = e.getBounds(Gh);
    t.width && o.pad(t.width);
    const { x: a, y: h } = o,
      l = 1 / o.width,
      c = 1 / o.height,
      u = -a * l,
      f = -h * c,
      d = r.a,
      m = r.b,
      g = r.c,
      p = r.d;
    ((r.a *= l),
      (r.b *= l),
      (r.c *= c),
      (r.d *= c),
      (r.tx = u * d + f * g + r.tx),
      (r.ty = u * m + f * p + r.ty));
  } else
    (r.translate(t.texture.frame.x, t.texture.frame.y),
      r.scale(1 / t.texture.source.width, 1 / t.texture.source.height));
  const n = t.texture.source.style;
  return (
    !(t.fill instanceof ce) &&
      n.addressMode === 'clamp-to-edge' &&
      ((n.addressMode = 'repeat'), n.update()),
    i && r.append(Rh.copyFrom(i).invert()),
    r
  );
}
const De = {};
et.handleByMap(G.ShapeBuilder, De);
et.add(Ih, kh, Eh, le, Ch, Ah);
const Fh = new $(),
  Dh = new I();
function Lh(s, t) {
  const { geometryData: e, batches: i } = t;
  ((i.length = 0), (e.indices.length = 0), (e.vertices.length = 0), (e.uvs.length = 0));
  for (let r = 0; r < s.instructions.length; r++) {
    const n = s.instructions[r];
    if (n.action === 'texture') Uh(n.data, i, e);
    else if (n.action === 'fill' || n.action === 'stroke') {
      const o = n.action === 'stroke',
        a = n.data.path.shapePath,
        h = n.data.style,
        l = n.data.hole;
      (o && l && Bi(l.shapePath, h, !0, i, e),
        l && (a.shapePrimitives[a.shapePrimitives.length - 1].holes = l.shapePath.shapePrimitives),
        Bi(a, h, o, i, e));
    }
  }
}
function Uh(s, t, e) {
  const i = [],
    r = De.rectangle,
    n = Fh;
  ((n.x = s.dx), (n.y = s.dy), (n.width = s.dw), (n.height = s.dh));
  const o = s.transform;
  if (!r.build(n, i)) return;
  const { vertices: a, uvs: h, indices: l } = e,
    c = l.length,
    u = a.length / 2;
  (o && en(i, o), r.triangulate(i, a, 2, u, l, c));
  const f = s.image,
    d = f.uvs;
  h.push(d.x0, d.y0, d.x1, d.y1, d.x3, d.y3, d.x2, d.y2);
  const m = lt.get(sn);
  ((m.indexOffset = c),
    (m.indexSize = l.length - c),
    (m.attributeOffset = u),
    (m.attributeSize = a.length / 2 - u),
    (m.baseColor = s.style),
    (m.alpha = s.alpha),
    (m.texture = f),
    (m.geometryData = e),
    t.push(m));
}
function Bi(s, t, e, i, r) {
  const { vertices: n, uvs: o, indices: a } = r;
  s.shapePrimitives.forEach(({ shape: h, transform: l, holes: c }) => {
    const u = [],
      f = De[h.type];
    if (!f.build(h, u)) return;
    const d = a.length,
      m = n.length / 2;
    let g = 'triangle-list';
    if ((l && en(u, l), e)) {
      const _ = h.closePath ?? !0,
        b = t;
      b.pixelLine ? (Ph(u, _, n, a), (g = 'line-list')) : Mh(u, b, !1, _, n, a);
    } else if (c) {
      const _ = [],
        b = u.slice();
      (zh(c).forEach((w) => {
        (_.push(b.length / 2), b.push(...w));
      }),
        nn(b, _, n, 2, m, a, d));
    } else f.triangulate(u, n, 2, m, a, d);
    const p = o.length / 2,
      y = t.texture;
    if (y !== D.WHITE) {
      const _ = Bh(Dh, t, h, l);
      bh(n, 2, m, o, p, 2, n.length / 2 - m, _);
    } else wh(o, p, 2, n.length / 2 - m);
    const x = lt.get(sn);
    ((x.indexOffset = d),
      (x.indexSize = a.length - d),
      (x.attributeOffset = m),
      (x.attributeSize = n.length / 2 - m),
      (x.baseColor = t.color),
      (x.alpha = t.alpha),
      (x.texture = y),
      (x.geometryData = r),
      (x.topology = g),
      i.push(x));
  });
}
function zh(s) {
  const t = [];
  for (let e = 0; e < s.length; e++) {
    const i = s[e].shape,
      r = [];
    De[i.type].build(i, r) && t.push(r);
  }
  return t;
}
class Nh {
  constructor() {
    ((this.batches = []), (this.geometryData = { vertices: [], uvs: [], indices: [] }));
  }
}
class Oh {
  constructor() {
    this.instructions = new cr();
  }
  init(t) {
    ((this.batcher = new _h({ maxTextures: t })), this.instructions.reset());
  }
  get geometry() {
    return (
      F(
        Rn,
        'GraphicsContextRenderData#geometry is deprecated, please use batcher.geometry instead.',
      ),
      this.batcher.geometry
    );
  }
}
const Ds = class As {
  constructor(t) {
    ((this._gpuContextHash = {}),
      (this._graphicsDataContextHash = Object.create(null)),
      (this._renderer = t),
      t.renderableGC.addManagedHash(this, '_gpuContextHash'),
      t.renderableGC.addManagedHash(this, '_graphicsDataContextHash'));
  }
  init(t) {
    As.defaultOptions.bezierSmoothness = t?.bezierSmoothness ?? As.defaultOptions.bezierSmoothness;
  }
  getContextRenderData(t) {
    return this._graphicsDataContextHash[t.uid] || this._initContextRenderData(t);
  }
  updateGpuContext(t) {
    let e = this._gpuContextHash[t.uid] || this._initContext(t);
    if (t.dirty) {
      (e ? this._cleanGraphicsContextData(t) : (e = this._initContext(t)), Lh(t, e));
      const i = t.batchMode;
      (t.customShader || i === 'no-batch'
        ? (e.isBatchable = !1)
        : i === 'auto'
          ? (e.isBatchable = e.geometryData.vertices.length < 400)
          : (e.isBatchable = !0),
        (t.dirty = !1));
    }
    return e;
  }
  getGpuContext(t) {
    return this._gpuContextHash[t.uid] || this._initContext(t);
  }
  _initContextRenderData(t) {
    const e = lt.get(Oh, { maxTextures: this._renderer.limits.maxBatchableTextures }),
      { batches: i, geometryData: r } = this._gpuContextHash[t.uid],
      n = r.vertices.length,
      o = r.indices.length;
    for (let c = 0; c < i.length; c++) i[c].applyTransform = !1;
    const a = e.batcher;
    (a.ensureAttributeBuffer(n), a.ensureIndexBuffer(o), a.begin());
    for (let c = 0; c < i.length; c++) {
      const u = i[c];
      a.add(u);
    }
    a.finish(e.instructions);
    const h = a.geometry;
    (h.indexBuffer.setDataWithSize(a.indexBuffer, a.indexSize, !0),
      h.buffers[0].setDataWithSize(a.attributeBuffer.float32View, a.attributeSize, !0));
    const l = a.batches;
    for (let c = 0; c < l.length; c++) {
      const u = l[c];
      u.bindGroup = ka(
        u.textures.textures,
        u.textures.count,
        this._renderer.limits.maxBatchableTextures,
      );
    }
    return ((this._graphicsDataContextHash[t.uid] = e), e);
  }
  _initContext(t) {
    const e = new Nh();
    return (
      (e.context = t),
      (this._gpuContextHash[t.uid] = e),
      t.on('destroy', this.onGraphicsContextDestroy, this),
      this._gpuContextHash[t.uid]
    );
  }
  onGraphicsContextDestroy(t) {
    (this._cleanGraphicsContextData(t),
      t.off('destroy', this.onGraphicsContextDestroy, this),
      (this._gpuContextHash[t.uid] = null));
  }
  _cleanGraphicsContextData(t) {
    const e = this._gpuContextHash[t.uid];
    (e.isBatchable ||
      (this._graphicsDataContextHash[t.uid] &&
        (lt.return(this.getContextRenderData(t)), (this._graphicsDataContextHash[t.uid] = null))),
      e.batches &&
        e.batches.forEach((i) => {
          lt.return(i);
        }));
  }
  destroy() {
    for (const t in this._gpuContextHash)
      this._gpuContextHash[t] && this.onGraphicsContextDestroy(this._gpuContextHash[t].context);
  }
};
Ds.extension = { type: [G.WebGLSystem, G.WebGPUSystem, G.CanvasSystem], name: 'graphicsContext' };
Ds.defaultOptions = { bezierSmoothness: 0.5 };
let on = Ds;
const Vh = 8,
  Te = 11920929e-14,
  Hh = 1;
function an(s, t, e, i, r, n, o, a, h, l) {
  const u = Math.min(0.99, Math.max(0, l ?? on.defaultOptions.bezierSmoothness));
  let f = (Hh - u) / 1;
  return ((f *= f), Yh(t, e, i, r, n, o, a, h, s, f), s);
}
function Yh(s, t, e, i, r, n, o, a, h, l) {
  (Ss(s, t, e, i, r, n, o, a, h, l, 0), h.push(o, a));
}
function Ss(s, t, e, i, r, n, o, a, h, l, c) {
  if (c > Vh) return;
  const u = (s + e) / 2,
    f = (t + i) / 2,
    d = (e + r) / 2,
    m = (i + n) / 2,
    g = (r + o) / 2,
    p = (n + a) / 2,
    y = (u + d) / 2,
    x = (f + m) / 2,
    _ = (d + g) / 2,
    b = (m + p) / 2,
    C = (y + _) / 2,
    w = (x + b) / 2;
  if (c > 0) {
    let v = o - s,
      T = a - t;
    const k = Math.abs((e - o) * T - (i - a) * v),
      A = Math.abs((r - o) * T - (n - a) * v);
    if (k > Te && A > Te) {
      if ((k + A) * (k + A) <= l * (v * v + T * T)) {
        h.push(C, w);
        return;
      }
    } else if (k > Te) {
      if (k * k <= l * (v * v + T * T)) {
        h.push(C, w);
        return;
      }
    } else if (A > Te) {
      if (A * A <= l * (v * v + T * T)) {
        h.push(C, w);
        return;
      }
    } else if (((v = C - (s + o) / 2), (T = w - (t + a) / 2), v * v + T * T <= l)) {
      h.push(C, w);
      return;
    }
  }
  (Ss(s, t, u, f, y, x, C, w, h, l, c + 1), Ss(C, w, _, b, g, p, o, a, h, l, c + 1));
}
const $h = 8,
  Xh = 11920929e-14,
  Wh = 1;
function jh(s, t, e, i, r, n, o, a) {
  const l = Math.min(0.99, Math.max(0, a ?? on.defaultOptions.bezierSmoothness));
  let c = (Wh - l) / 1;
  return ((c *= c), qh(t, e, i, r, n, o, s, c), s);
}
function qh(s, t, e, i, r, n, o, a) {
  (Ms(o, s, t, e, i, r, n, a, 0), o.push(r, n));
}
function Ms(s, t, e, i, r, n, o, a, h) {
  if (h > $h) return;
  const l = (t + i) / 2,
    c = (e + r) / 2,
    u = (i + n) / 2,
    f = (r + o) / 2,
    d = (l + u) / 2,
    m = (c + f) / 2;
  let g = n - t,
    p = o - e;
  const y = Math.abs((i - n) * p - (r - o) * g);
  if (y > Xh) {
    if (y * y <= a * (g * g + p * p)) {
      s.push(d, m);
      return;
    }
  } else if (((g = d - (t + n) / 2), (p = m - (e + o) / 2), g * g + p * p <= a)) {
    s.push(d, m);
    return;
  }
  (Ms(s, t, e, l, c, d, m, a, h + 1), Ms(s, d, m, u, f, n, o, a, h + 1));
}
function hn(s, t, e, i, r, n, o, a) {
  let h = Math.abs(r - n);
  (((!o && r > n) || (o && n > r)) && (h = 2 * Math.PI - h),
    a || (a = Math.max(6, Math.floor(6 * Math.pow(i, 1 / 3) * (h / Math.PI)))),
    (a = Math.max(a, 3)));
  let l = h / a,
    c = r;
  l *= o ? -1 : 1;
  for (let u = 0; u < a + 1; u++) {
    const f = Math.cos(c),
      d = Math.sin(c),
      m = t + f * i,
      g = e + d * i;
    (s.push(m, g), (c += l));
  }
}
function Zh(s, t, e, i, r, n) {
  const o = s[s.length - 2],
    h = s[s.length - 1] - e,
    l = o - t,
    c = r - e,
    u = i - t,
    f = Math.abs(h * u - l * c);
  if (f < 1e-8 || n === 0) {
    (s[s.length - 2] !== t || s[s.length - 1] !== e) && s.push(t, e);
    return;
  }
  const d = h * h + l * l,
    m = c * c + u * u,
    g = h * c + l * u,
    p = (n * Math.sqrt(d)) / f,
    y = (n * Math.sqrt(m)) / f,
    x = (p * g) / d,
    _ = (y * g) / m,
    b = p * u + y * l,
    C = p * c + y * h,
    w = l * (y + x),
    v = h * (y + x),
    T = u * (p + _),
    k = c * (p + _),
    A = Math.atan2(v - C, w - b),
    S = Math.atan2(k - C, T - b);
  hn(s, b + t, C + e, n, A, S, l * c > u * h);
}
const ie = Math.PI * 2,
  as = { centerX: 0, centerY: 0, ang1: 0, ang2: 0 },
  hs = ({ x: s, y: t }, e, i, r, n, o, a, h) => {
    ((s *= e), (t *= i));
    const l = r * s - n * t,
      c = n * s + r * t;
    return ((h.x = l + o), (h.y = c + a), h);
  };
function Kh(s, t) {
  const e = t === -1.5707963267948966 ? -0.551915024494 : 1.3333333333333333 * Math.tan(t / 4),
    i = t === 1.5707963267948966 ? 0.551915024494 : e,
    r = Math.cos(s),
    n = Math.sin(s),
    o = Math.cos(s + t),
    a = Math.sin(s + t);
  return [
    { x: r - n * i, y: n + r * i },
    { x: o + a * i, y: a - o * i },
    { x: o, y: a },
  ];
}
const Fi = (s, t, e, i) => {
    const r = s * i - t * e < 0 ? -1 : 1;
    let n = s * e + t * i;
    return (n > 1 && (n = 1), n < -1 && (n = -1), r * Math.acos(n));
  },
  Qh = (s, t, e, i, r, n, o, a, h, l, c, u, f) => {
    const d = Math.pow(r, 2),
      m = Math.pow(n, 2),
      g = Math.pow(c, 2),
      p = Math.pow(u, 2);
    let y = d * m - d * p - m * g;
    (y < 0 && (y = 0), (y /= d * p + m * g), (y = Math.sqrt(y) * (o === a ? -1 : 1)));
    const x = ((y * r) / n) * u,
      _ = ((y * -n) / r) * c,
      b = l * x - h * _ + (s + e) / 2,
      C = h * x + l * _ + (t + i) / 2,
      w = (c - x) / r,
      v = (u - _) / n,
      T = (-c - x) / r,
      k = (-u - _) / n,
      A = Fi(1, 0, w, v);
    let S = Fi(w, v, T, k);
    (a === 0 && S > 0 && (S -= ie),
      a === 1 && S < 0 && (S += ie),
      (f.centerX = b),
      (f.centerY = C),
      (f.ang1 = A),
      (f.ang2 = S));
  };
function Jh(s, t, e, i, r, n, o, a = 0, h = 0, l = 0) {
  if (n === 0 || o === 0) return;
  const c = Math.sin((a * ie) / 360),
    u = Math.cos((a * ie) / 360),
    f = (u * (t - i)) / 2 + (c * (e - r)) / 2,
    d = (-c * (t - i)) / 2 + (u * (e - r)) / 2;
  if (f === 0 && d === 0) return;
  ((n = Math.abs(n)), (o = Math.abs(o)));
  const m = Math.pow(f, 2) / Math.pow(n, 2) + Math.pow(d, 2) / Math.pow(o, 2);
  (m > 1 && ((n *= Math.sqrt(m)), (o *= Math.sqrt(m))), Qh(t, e, i, r, n, o, h, l, c, u, f, d, as));
  let { ang1: g, ang2: p } = as;
  const { centerX: y, centerY: x } = as;
  let _ = Math.abs(p) / (ie / 4);
  Math.abs(1 - _) < 1e-7 && (_ = 1);
  const b = Math.max(Math.ceil(_), 1);
  p /= b;
  let C = s[s.length - 2],
    w = s[s.length - 1];
  const v = { x: 0, y: 0 };
  for (let T = 0; T < b; T++) {
    const k = Kh(g, p),
      { x: A, y: S } = hs(k[0], n, o, u, c, y, x, v),
      { x: R, y: E } = hs(k[1], n, o, u, c, y, x, v),
      { x: L, y: at } = hs(k[2], n, o, u, c, y, x, v);
    (an(s, C, w, A, S, R, E, L, at), (C = L), (w = at), (g += p));
  }
}
function tl(s, t, e) {
  const i = (o, a) => {
      const h = a.x - o.x,
        l = a.y - o.y,
        c = Math.sqrt(h * h + l * l),
        u = h / c,
        f = l / c;
      return { len: c, nx: u, ny: f };
    },
    r = (o, a) => {
      o === 0 ? s.moveTo(a.x, a.y) : s.lineTo(a.x, a.y);
    };
  let n = t[t.length - 1];
  for (let o = 0; o < t.length; o++) {
    const a = t[o % t.length],
      h = a.radius ?? e;
    if (h <= 0) {
      (r(o, a), (n = a));
      continue;
    }
    const l = t[(o + 1) % t.length],
      c = i(a, n),
      u = i(a, l);
    if (c.len < 1e-4 || u.len < 1e-4) {
      (r(o, a), (n = a));
      continue;
    }
    let f = Math.asin(c.nx * u.ny - c.ny * u.nx),
      d = 1,
      m = !1;
    c.nx * u.nx - c.ny * -u.ny < 0
      ? f < 0
        ? (f = Math.PI + f)
        : ((f = Math.PI - f), (d = -1), (m = !0))
      : f > 0 && ((d = -1), (m = !0));
    const g = f / 2;
    let p,
      y = Math.abs((Math.cos(g) * h) / Math.sin(g));
    y > Math.min(c.len / 2, u.len / 2)
      ? ((y = Math.min(c.len / 2, u.len / 2)), (p = Math.abs((y * Math.sin(g)) / Math.cos(g))))
      : (p = h);
    const x = a.x + u.nx * y + -u.ny * p * d,
      _ = a.y + u.ny * y + u.nx * p * d,
      b = Math.atan2(c.ny, c.nx) + (Math.PI / 2) * d,
      C = Math.atan2(u.ny, u.nx) - (Math.PI / 2) * d;
    (o === 0 && s.moveTo(x + Math.cos(b) * p, _ + Math.sin(b) * p),
      s.arc(x, _, p, b, C, m),
      (n = a));
  }
}
function el(s, t, e, i) {
  const r = (a, h) => Math.sqrt((a.x - h.x) ** 2 + (a.y - h.y) ** 2),
    n = (a, h, l) => ({ x: a.x + (h.x - a.x) * l, y: a.y + (h.y - a.y) * l }),
    o = t.length;
  for (let a = 0; a < o; a++) {
    const h = t[(a + 1) % o],
      l = h.radius ?? e;
    if (l <= 0) {
      a === 0 ? s.moveTo(h.x, h.y) : s.lineTo(h.x, h.y);
      continue;
    }
    const c = t[a],
      u = t[(a + 2) % o],
      f = r(c, h);
    let d;
    if (f < 1e-4) d = h;
    else {
      const p = Math.min(f / 2, l);
      d = n(h, c, p / f);
    }
    const m = r(u, h);
    let g;
    if (m < 1e-4) g = h;
    else {
      const p = Math.min(m / 2, l);
      g = n(h, u, p / m);
    }
    (a === 0 ? s.moveTo(d.x, d.y) : s.lineTo(d.x, d.y), s.quadraticCurveTo(h.x, h.y, g.x, g.y, i));
  }
}
const sl = new $();
class il {
  constructor(t) {
    ((this.shapePrimitives = []),
      (this._currentPoly = null),
      (this._bounds = new it()),
      (this._graphicsPath2D = t),
      (this.signed = t.checkForHoles));
  }
  moveTo(t, e) {
    return (this.startPoly(t, e), this);
  }
  lineTo(t, e) {
    this._ensurePoly();
    const i = this._currentPoly.points,
      r = i[i.length - 2],
      n = i[i.length - 1];
    return ((r !== t || n !== e) && i.push(t, e), this);
  }
  arc(t, e, i, r, n, o) {
    this._ensurePoly(!1);
    const a = this._currentPoly.points;
    return (hn(a, t, e, i, r, n, o), this);
  }
  arcTo(t, e, i, r, n) {
    this._ensurePoly();
    const o = this._currentPoly.points;
    return (Zh(o, t, e, i, r, n), this);
  }
  arcToSvg(t, e, i, r, n, o, a) {
    const h = this._currentPoly.points;
    return (Jh(h, this._currentPoly.lastX, this._currentPoly.lastY, o, a, t, e, i, r, n), this);
  }
  bezierCurveTo(t, e, i, r, n, o, a) {
    this._ensurePoly();
    const h = this._currentPoly;
    return (an(this._currentPoly.points, h.lastX, h.lastY, t, e, i, r, n, o, a), this);
  }
  quadraticCurveTo(t, e, i, r, n) {
    this._ensurePoly();
    const o = this._currentPoly;
    return (jh(this._currentPoly.points, o.lastX, o.lastY, t, e, i, r, n), this);
  }
  closePath() {
    return (this.endPoly(!0), this);
  }
  addPath(t, e) {
    (this.endPoly(), e && !e.isIdentity() && ((t = t.clone(!0)), t.transform(e)));
    const i = this.shapePrimitives,
      r = i.length;
    for (let n = 0; n < t.instructions.length; n++) {
      const o = t.instructions[n];
      this[o.action](...o.data);
    }
    if (t.checkForHoles && i.length - r > 1) {
      let n = null;
      for (let o = r; o < i.length; o++) {
        const a = i[o];
        if (a.shape.type === 'polygon') {
          const h = a.shape,
            l = n?.shape;
          l && l.containsPolygon(h)
            ? (n.holes || (n.holes = []), n.holes.push(a), i.copyWithin(o, o + 1), i.length--, o--)
            : (n = a);
        }
      }
    }
    return this;
  }
  finish(t = !1) {
    this.endPoly(t);
  }
  rect(t, e, i, r, n) {
    return (this.drawShape(new $(t, e, i, r), n), this);
  }
  circle(t, e, i, r) {
    return (this.drawShape(new Gs(t, e, i), r), this);
  }
  poly(t, e, i) {
    const r = new se(t);
    return ((r.closePath = e), this.drawShape(r, i), this);
  }
  regularPoly(t, e, i, r, n = 0, o) {
    r = Math.max(r | 0, 3);
    const a = (-1 * Math.PI) / 2 + n,
      h = (Math.PI * 2) / r,
      l = [];
    for (let c = 0; c < r; c++) {
      const u = a - c * h;
      l.push(t + i * Math.cos(u), e + i * Math.sin(u));
    }
    return (this.poly(l, !0, o), this);
  }
  roundPoly(t, e, i, r, n, o = 0, a) {
    if (((r = Math.max(r | 0, 3)), n <= 0)) return this.regularPoly(t, e, i, r, o);
    const h = i * Math.sin(Math.PI / r) - 0.001;
    n = Math.min(n, h);
    const l = (-1 * Math.PI) / 2 + o,
      c = (Math.PI * 2) / r,
      u = ((r - 2) * Math.PI) / r / 2;
    for (let f = 0; f < r; f++) {
      const d = f * c + l,
        m = t + i * Math.cos(d),
        g = e + i * Math.sin(d),
        p = d + Math.PI + u,
        y = d - Math.PI - u,
        x = m + n * Math.cos(p),
        _ = g + n * Math.sin(p),
        b = m + n * Math.cos(y),
        C = g + n * Math.sin(y);
      (f === 0 ? this.moveTo(x, _) : this.lineTo(x, _), this.quadraticCurveTo(m, g, b, C, a));
    }
    return this.closePath();
  }
  roundShape(t, e, i = !1, r) {
    return t.length < 3 ? this : (i ? el(this, t, e, r) : tl(this, t, e), this.closePath());
  }
  filletRect(t, e, i, r, n) {
    if (n === 0) return this.rect(t, e, i, r);
    const o = Math.min(i, r) / 2,
      a = Math.min(o, Math.max(-o, n)),
      h = t + i,
      l = e + r,
      c = a < 0 ? -a : 0,
      u = Math.abs(a);
    return this.moveTo(t, e + u)
      .arcTo(t + c, e + c, t + u, e, u)
      .lineTo(h - u, e)
      .arcTo(h - c, e + c, h, e + u, u)
      .lineTo(h, l - u)
      .arcTo(h - c, l - c, t + i - u, l, u)
      .lineTo(t + u, l)
      .arcTo(t + c, l - c, t, l - u, u)
      .closePath();
  }
  chamferRect(t, e, i, r, n, o) {
    if (n <= 0) return this.rect(t, e, i, r);
    const a = Math.min(n, Math.min(i, r) / 2),
      h = t + i,
      l = e + r,
      c = [t + a, e, h - a, e, h, e + a, h, l - a, h - a, l, t + a, l, t, l - a, t, e + a];
    for (let u = c.length - 1; u >= 2; u -= 2)
      c[u] === c[u - 2] && c[u - 1] === c[u - 3] && c.splice(u - 1, 2);
    return this.poly(c, !0, o);
  }
  ellipse(t, e, i, r, n) {
    return (this.drawShape(new Bs(t, e, i, r), n), this);
  }
  roundRect(t, e, i, r, n, o) {
    return (this.drawShape(new Fs(t, e, i, r, n), o), this);
  }
  drawShape(t, e) {
    return (this.endPoly(), this.shapePrimitives.push({ shape: t, transform: e }), this);
  }
  startPoly(t, e) {
    let i = this._currentPoly;
    return (
      i && this.endPoly(),
      (i = new se()),
      i.points.push(t, e),
      (this._currentPoly = i),
      this
    );
  }
  endPoly(t = !1) {
    const e = this._currentPoly;
    return (
      e && e.points.length > 2 && ((e.closePath = t), this.shapePrimitives.push({ shape: e })),
      (this._currentPoly = null),
      this
    );
  }
  _ensurePoly(t = !0) {
    if (!this._currentPoly && ((this._currentPoly = new se()), t)) {
      const e = this.shapePrimitives[this.shapePrimitives.length - 1];
      if (e) {
        let i = e.shape.x,
          r = e.shape.y;
        if (e.transform && !e.transform.isIdentity()) {
          const n = e.transform,
            o = i;
          ((i = n.a * i + n.c * r + n.tx), (r = n.b * o + n.d * r + n.ty));
        }
        this._currentPoly.points.push(i, r);
      } else this._currentPoly.points.push(0, 0);
    }
  }
  buildPath() {
    const t = this._graphicsPath2D;
    ((this.shapePrimitives.length = 0), (this._currentPoly = null));
    for (let e = 0; e < t.instructions.length; e++) {
      const i = t.instructions[e];
      this[i.action](...i.data);
    }
    this.finish();
  }
  get bounds() {
    const t = this._bounds;
    t.clear();
    const e = this.shapePrimitives;
    for (let i = 0; i < e.length; i++) {
      const r = e[i],
        n = r.shape.getBounds(sl);
      r.transform ? t.addRect(n, r.transform) : t.addRect(n);
    }
    return t;
  }
}
class Lt {
  constructor(t, e = !1) {
    ((this.instructions = []),
      (this.uid = O('graphicsPath')),
      (this._dirty = !0),
      (this.checkForHoles = e),
      typeof t == 'string' ? Sa(t, this) : (this.instructions = t?.slice() ?? []));
  }
  get shapePath() {
    return (
      this._shapePath || (this._shapePath = new il(this)),
      this._dirty && ((this._dirty = !1), this._shapePath.buildPath()),
      this._shapePath
    );
  }
  addPath(t, e) {
    return (
      (t = t.clone()),
      this.instructions.push({ action: 'addPath', data: [t, e] }),
      (this._dirty = !0),
      this
    );
  }
  arc(...t) {
    return (this.instructions.push({ action: 'arc', data: t }), (this._dirty = !0), this);
  }
  arcTo(...t) {
    return (this.instructions.push({ action: 'arcTo', data: t }), (this._dirty = !0), this);
  }
  arcToSvg(...t) {
    return (this.instructions.push({ action: 'arcToSvg', data: t }), (this._dirty = !0), this);
  }
  bezierCurveTo(...t) {
    return (this.instructions.push({ action: 'bezierCurveTo', data: t }), (this._dirty = !0), this);
  }
  bezierCurveToShort(t, e, i, r, n) {
    const o = this.instructions[this.instructions.length - 1],
      a = this.getLastPoint(W.shared);
    let h = 0,
      l = 0;
    if (!o || o.action !== 'bezierCurveTo') ((h = a.x), (l = a.y));
    else {
      ((h = o.data[2]), (l = o.data[3]));
      const c = a.x,
        u = a.y;
      ((h = c + (c - h)), (l = u + (u - l)));
    }
    return (
      this.instructions.push({ action: 'bezierCurveTo', data: [h, l, t, e, i, r, n] }),
      (this._dirty = !0),
      this
    );
  }
  closePath() {
    return (this.instructions.push({ action: 'closePath', data: [] }), (this._dirty = !0), this);
  }
  ellipse(...t) {
    return (this.instructions.push({ action: 'ellipse', data: t }), (this._dirty = !0), this);
  }
  lineTo(...t) {
    return (this.instructions.push({ action: 'lineTo', data: t }), (this._dirty = !0), this);
  }
  moveTo(...t) {
    return (this.instructions.push({ action: 'moveTo', data: t }), this);
  }
  quadraticCurveTo(...t) {
    return (
      this.instructions.push({ action: 'quadraticCurveTo', data: t }),
      (this._dirty = !0),
      this
    );
  }
  quadraticCurveToShort(t, e, i) {
    const r = this.instructions[this.instructions.length - 1],
      n = this.getLastPoint(W.shared);
    let o = 0,
      a = 0;
    if (!r || r.action !== 'quadraticCurveTo') ((o = n.x), (a = n.y));
    else {
      ((o = r.data[0]), (a = r.data[1]));
      const h = n.x,
        l = n.y;
      ((o = h + (h - o)), (a = l + (l - a)));
    }
    return (
      this.instructions.push({ action: 'quadraticCurveTo', data: [o, a, t, e, i] }),
      (this._dirty = !0),
      this
    );
  }
  rect(t, e, i, r, n) {
    return (
      this.instructions.push({ action: 'rect', data: [t, e, i, r, n] }),
      (this._dirty = !0),
      this
    );
  }
  circle(t, e, i, r) {
    return (
      this.instructions.push({ action: 'circle', data: [t, e, i, r] }),
      (this._dirty = !0),
      this
    );
  }
  roundRect(...t) {
    return (this.instructions.push({ action: 'roundRect', data: t }), (this._dirty = !0), this);
  }
  poly(...t) {
    return (this.instructions.push({ action: 'poly', data: t }), (this._dirty = !0), this);
  }
  regularPoly(...t) {
    return (this.instructions.push({ action: 'regularPoly', data: t }), (this._dirty = !0), this);
  }
  roundPoly(...t) {
    return (this.instructions.push({ action: 'roundPoly', data: t }), (this._dirty = !0), this);
  }
  roundShape(...t) {
    return (this.instructions.push({ action: 'roundShape', data: t }), (this._dirty = !0), this);
  }
  filletRect(...t) {
    return (this.instructions.push({ action: 'filletRect', data: t }), (this._dirty = !0), this);
  }
  chamferRect(...t) {
    return (this.instructions.push({ action: 'chamferRect', data: t }), (this._dirty = !0), this);
  }
  star(t, e, i, r, n, o, a) {
    n || (n = r / 2);
    const h = (-1 * Math.PI) / 2 + o,
      l = i * 2,
      c = (Math.PI * 2) / l,
      u = [];
    for (let f = 0; f < l; f++) {
      const d = f % 2 ? n : r,
        m = f * c + h;
      u.push(t + d * Math.cos(m), e + d * Math.sin(m));
    }
    return (this.poly(u, !0, a), this);
  }
  clone(t = !1) {
    const e = new Lt();
    if (((e.checkForHoles = this.checkForHoles), !t)) e.instructions = this.instructions.slice();
    else
      for (let i = 0; i < this.instructions.length; i++) {
        const r = this.instructions[i];
        e.instructions.push({ action: r.action, data: r.data.slice() });
      }
    return e;
  }
  clear() {
    return ((this.instructions.length = 0), (this._dirty = !0), this);
  }
  transform(t) {
    if (t.isIdentity()) return this;
    const e = t.a,
      i = t.b,
      r = t.c,
      n = t.d,
      o = t.tx,
      a = t.ty;
    let h = 0,
      l = 0,
      c = 0,
      u = 0,
      f = 0,
      d = 0,
      m = 0,
      g = 0;
    for (let p = 0; p < this.instructions.length; p++) {
      const y = this.instructions[p],
        x = y.data;
      switch (y.action) {
        case 'moveTo':
        case 'lineTo':
          ((h = x[0]), (l = x[1]), (x[0] = e * h + r * l + o), (x[1] = i * h + n * l + a));
          break;
        case 'bezierCurveTo':
          ((c = x[0]),
            (u = x[1]),
            (f = x[2]),
            (d = x[3]),
            (h = x[4]),
            (l = x[5]),
            (x[0] = e * c + r * u + o),
            (x[1] = i * c + n * u + a),
            (x[2] = e * f + r * d + o),
            (x[3] = i * f + n * d + a),
            (x[4] = e * h + r * l + o),
            (x[5] = i * h + n * l + a));
          break;
        case 'quadraticCurveTo':
          ((c = x[0]),
            (u = x[1]),
            (h = x[2]),
            (l = x[3]),
            (x[0] = e * c + r * u + o),
            (x[1] = i * c + n * u + a),
            (x[2] = e * h + r * l + o),
            (x[3] = i * h + n * l + a));
          break;
        case 'arcToSvg':
          ((h = x[5]),
            (l = x[6]),
            (m = x[0]),
            (g = x[1]),
            (x[0] = e * m + r * g),
            (x[1] = i * m + n * g),
            (x[5] = e * h + r * l + o),
            (x[6] = i * h + n * l + a));
          break;
        case 'circle':
          x[4] = jt(x[3], t);
          break;
        case 'rect':
          x[4] = jt(x[4], t);
          break;
        case 'ellipse':
          x[8] = jt(x[8], t);
          break;
        case 'roundRect':
          x[5] = jt(x[5], t);
          break;
        case 'addPath':
          x[0].transform(t);
          break;
        case 'poly':
          x[2] = jt(x[2], t);
          break;
        default:
          K('unknown transform action', y.action);
          break;
      }
    }
    return ((this._dirty = !0), this);
  }
  get bounds() {
    return this.shapePath.bounds;
  }
  getLastPoint(t) {
    let e = this.instructions.length - 1,
      i = this.instructions[e];
    if (!i) return ((t.x = 0), (t.y = 0), t);
    for (; i.action === 'closePath'; ) {
      if ((e--, e < 0)) return ((t.x = 0), (t.y = 0), t);
      i = this.instructions[e];
    }
    switch (i.action) {
      case 'moveTo':
      case 'lineTo':
        ((t.x = i.data[0]), (t.y = i.data[1]));
        break;
      case 'quadraticCurveTo':
        ((t.x = i.data[2]), (t.y = i.data[3]));
        break;
      case 'bezierCurveTo':
        ((t.x = i.data[4]), (t.y = i.data[5]));
        break;
      case 'arc':
      case 'arcToSvg':
        ((t.x = i.data[5]), (t.y = i.data[6]));
        break;
      case 'addPath':
        i.data[0].getLastPoint(t);
        break;
    }
    return t;
  }
}
function jt(s, t) {
  return s ? s.prepend(t) : t.clone();
}
function N(s, t, e) {
  const i = s.getAttribute(t);
  return i ? Number(i) : e;
}
function rl(s, t) {
  const e = s.querySelectorAll('defs');
  for (let i = 0; i < e.length; i++) {
    const r = e[i];
    for (let n = 0; n < r.children.length; n++) {
      const o = r.children[n];
      switch (o.nodeName.toLowerCase()) {
        case 'lineargradient':
          t.defs[o.id] = nl(o);
          break;
        case 'radialgradient':
          t.defs[o.id] = ol();
          break;
      }
    }
  }
}
function nl(s) {
  const t = N(s, 'x1', 0),
    e = N(s, 'y1', 0),
    i = N(s, 'x2', 1),
    r = N(s, 'y2', 0),
    n = s.getAttribute('gradientUnits') || 'objectBoundingBox',
    o = new ce(t, e, i, r, n === 'objectBoundingBox' ? 'local' : 'global');
  for (let a = 0; a < s.children.length; a++) {
    const h = s.children[a],
      l = N(h, 'offset', 0),
      c = tt.shared.setValue(h.getAttribute('stop-color')).toNumber();
    o.addColorStop(l, c);
  }
  return o;
}
function ol(s) {
  return (K('[SVG Parser] Radial gradients are not yet supported'), new ce(0, 0, 1, 0));
}
function Di(s) {
  const t = s.match(/url\s*\(\s*['"]?\s*#([^'"\s)]+)\s*['"]?\s*\)/i);
  return t ? t[1] : '';
}
const Li = {
  fill: { type: 'paint', default: 0 },
  'fill-opacity': { type: 'number', default: 1 },
  stroke: { type: 'paint', default: 0 },
  'stroke-width': { type: 'number', default: 1 },
  'stroke-opacity': { type: 'number', default: 1 },
  'stroke-linecap': { type: 'string', default: 'butt' },
  'stroke-linejoin': { type: 'string', default: 'miter' },
  'stroke-miterlimit': { type: 'number', default: 10 },
  'stroke-dasharray': { type: 'string', default: 'none' },
  'stroke-dashoffset': { type: 'number', default: 0 },
  opacity: { type: 'number', default: 1 },
};
function ln(s, t) {
  const e = s.getAttribute('style'),
    i = {},
    r = {},
    n = { strokeStyle: i, fillStyle: r, useFill: !1, useStroke: !1 };
  for (const o in Li) {
    const a = s.getAttribute(o);
    a && Ui(t, n, o, a.trim());
  }
  if (e) {
    const o = e.split(';');
    for (let a = 0; a < o.length; a++) {
      const h = o[a].trim(),
        [l, c] = h.split(':');
      Li[l] && Ui(t, n, l, c.trim());
    }
  }
  return {
    strokeStyle: n.useStroke ? i : null,
    fillStyle: n.useFill ? r : null,
    useFill: n.useFill,
    useStroke: n.useStroke,
  };
}
function Ui(s, t, e, i) {
  switch (e) {
    case 'stroke':
      if (i !== 'none') {
        if (i.startsWith('url(')) {
          const r = Di(i);
          t.strokeStyle.fill = s.defs[r];
        } else t.strokeStyle.color = tt.shared.setValue(i).toNumber();
        t.useStroke = !0;
      }
      break;
    case 'stroke-width':
      t.strokeStyle.width = Number(i);
      break;
    case 'fill':
      if (i !== 'none') {
        if (i.startsWith('url(')) {
          const r = Di(i);
          t.fillStyle.fill = s.defs[r];
        } else t.fillStyle.color = tt.shared.setValue(i).toNumber();
        t.useFill = !0;
      }
      break;
    case 'fill-opacity':
      t.fillStyle.alpha = Number(i);
      break;
    case 'stroke-opacity':
      t.strokeStyle.alpha = Number(i);
      break;
    case 'opacity':
      ((t.fillStyle.alpha = Number(i)), (t.strokeStyle.alpha = Number(i)));
      break;
  }
}
function al(s, t) {
  if (typeof s == 'string') {
    const o = document.createElement('div');
    ((o.innerHTML = s.trim()), (s = o.querySelector('svg')));
  }
  const e = { context: t, defs: {}, path: new Lt() };
  rl(s, e);
  const i = s.children,
    { fillStyle: r, strokeStyle: n } = ln(s, e);
  for (let o = 0; o < i.length; o++) {
    const a = i[o];
    a.nodeName.toLowerCase() !== 'defs' && cn(a, e, r, n);
  }
  return t;
}
function cn(s, t, e, i) {
  const r = s.children,
    { fillStyle: n, strokeStyle: o } = ln(s, t);
  (n && e ? (e = { ...e, ...n }) : n && (e = n), o && i ? (i = { ...i, ...o }) : o && (i = o));
  const a = !e && !i;
  a && (e = { color: 0 });
  let h, l, c, u, f, d, m, g, p, y, x, _, b, C, w, v, T;
  switch (s.nodeName.toLowerCase()) {
    case 'path':
      ((C = s.getAttribute('d')),
        s.getAttribute('fill-rule') === 'evenodd' &&
          K('SVG Evenodd fill rule not supported, your svg may render incorrectly'),
        (w = new Lt(C, !0)),
        t.context.path(w),
        e && t.context.fill(e),
        i && t.context.stroke(i));
      break;
    case 'circle':
      ((m = N(s, 'cx', 0)),
        (g = N(s, 'cy', 0)),
        (p = N(s, 'r', 0)),
        t.context.ellipse(m, g, p, p),
        e && t.context.fill(e),
        i && t.context.stroke(i));
      break;
    case 'rect':
      ((h = N(s, 'x', 0)),
        (l = N(s, 'y', 0)),
        (v = N(s, 'width', 0)),
        (T = N(s, 'height', 0)),
        (y = N(s, 'rx', 0)),
        (x = N(s, 'ry', 0)),
        y || x ? t.context.roundRect(h, l, v, T, y || x) : t.context.rect(h, l, v, T),
        e && t.context.fill(e),
        i && t.context.stroke(i));
      break;
    case 'ellipse':
      ((m = N(s, 'cx', 0)),
        (g = N(s, 'cy', 0)),
        (y = N(s, 'rx', 0)),
        (x = N(s, 'ry', 0)),
        t.context.beginPath(),
        t.context.ellipse(m, g, y, x),
        e && t.context.fill(e),
        i && t.context.stroke(i));
      break;
    case 'line':
      ((c = N(s, 'x1', 0)),
        (u = N(s, 'y1', 0)),
        (f = N(s, 'x2', 0)),
        (d = N(s, 'y2', 0)),
        t.context.beginPath(),
        t.context.moveTo(c, u),
        t.context.lineTo(f, d),
        i && t.context.stroke(i));
      break;
    case 'polygon':
      ((b = s.getAttribute('points')),
        (_ = b.match(/\d+/g).map((k) => parseInt(k, 10))),
        t.context.poly(_, !0),
        e && t.context.fill(e),
        i && t.context.stroke(i));
      break;
    case 'polyline':
      ((b = s.getAttribute('points')),
        (_ = b.match(/\d+/g).map((k) => parseInt(k, 10))),
        t.context.poly(_, !1),
        i && t.context.stroke(i));
      break;
    case 'g':
    case 'svg':
      break;
    default: {
      K(`[SVG parser] <${s.nodeName}> elements unsupported`);
      break;
    }
  }
  a && (e = null);
  for (let k = 0; k < r.length; k++) cn(r[k], t, e, i);
}
function hl(s) {
  return tt.isColorLike(s);
}
function zi(s) {
  return s instanceof ya;
}
function Ni(s) {
  return s instanceof ce;
}
function ll(s) {
  return s instanceof D;
}
function cl(s, t, e) {
  const i = tt.shared.setValue(t ?? 0);
  return (
    (s.color = i.toNumber()),
    (s.alpha = i.alpha === 1 ? e.alpha : i.alpha),
    (s.texture = D.WHITE),
    { ...e, ...s }
  );
}
function ul(s, t, e) {
  return ((s.texture = t), { ...e, ...s });
}
function Oi(s, t, e) {
  return (
    (s.fill = t),
    (s.color = 16777215),
    (s.texture = t.texture),
    (s.matrix = t.transform),
    { ...e, ...s }
  );
}
function Vi(s, t, e) {
  return (
    t.buildGradient(),
    (s.fill = t),
    (s.color = 16777215),
    (s.texture = t.texture),
    (s.matrix = t.transform),
    (s.textureSpace = t.textureSpace),
    { ...e, ...s }
  );
}
function dl(s, t) {
  const e = { ...t, ...s },
    i = tt.shared.setValue(e.color);
  return ((e.alpha *= i.alpha), (e.color = i.toNumber()), e);
}
function te(s, t) {
  if (s == null) return null;
  const e = {},
    i = s;
  return hl(s)
    ? cl(e, s, t)
    : ll(s)
      ? ul(e, s, t)
      : zi(s)
        ? Oi(e, s, t)
        : Ni(s)
          ? Vi(e, s, t)
          : i.fill && zi(i.fill)
            ? Oi(i, i.fill, t)
            : i.fill && Ni(i.fill)
              ? Vi(i, i.fill, t)
              : dl(i, t);
}
function Hi(s, t) {
  const { width: e, alignment: i, miterLimit: r, cap: n, join: o, pixelLine: a, ...h } = t,
    l = te(s, h);
  return l ? { width: e, alignment: i, miterLimit: r, cap: n, join: o, pixelLine: a, ...l } : null;
}
const fl = new W(),
  Yi = new I(),
  Ls = class ot extends ut {
    constructor() {
      (super(...arguments),
        (this.uid = O('graphicsContext')),
        (this.dirty = !0),
        (this.batchMode = 'auto'),
        (this.instructions = []),
        (this._activePath = new Lt()),
        (this._transform = new I()),
        (this._fillStyle = { ...ot.defaultFillStyle }),
        (this._strokeStyle = { ...ot.defaultStrokeStyle }),
        (this._stateStack = []),
        (this._tick = 0),
        (this._bounds = new it()),
        (this._boundsDirty = !0));
    }
    clone() {
      const t = new ot();
      return (
        (t.batchMode = this.batchMode),
        (t.instructions = this.instructions.slice()),
        (t._activePath = this._activePath.clone()),
        (t._transform = this._transform.clone()),
        (t._fillStyle = { ...this._fillStyle }),
        (t._strokeStyle = { ...this._strokeStyle }),
        (t._stateStack = this._stateStack.slice()),
        (t._bounds = this._bounds.clone()),
        (t._boundsDirty = !0),
        t
      );
    }
    get fillStyle() {
      return this._fillStyle;
    }
    set fillStyle(t) {
      this._fillStyle = te(t, ot.defaultFillStyle);
    }
    get strokeStyle() {
      return this._strokeStyle;
    }
    set strokeStyle(t) {
      this._strokeStyle = Hi(t, ot.defaultStrokeStyle);
    }
    setFillStyle(t) {
      return ((this._fillStyle = te(t, ot.defaultFillStyle)), this);
    }
    setStrokeStyle(t) {
      return ((this._strokeStyle = te(t, ot.defaultStrokeStyle)), this);
    }
    texture(t, e, i, r, n, o) {
      return (
        this.instructions.push({
          action: 'texture',
          data: {
            image: t,
            dx: i || 0,
            dy: r || 0,
            dw: n || t.frame.width,
            dh: o || t.frame.height,
            transform: this._transform.clone(),
            alpha: this._fillStyle.alpha,
            style: e ? tt.shared.setValue(e).toNumber() : 16777215,
          },
        }),
        this.onUpdate(),
        this
      );
    }
    beginPath() {
      return ((this._activePath = new Lt()), this);
    }
    fill(t, e) {
      let i;
      const r = this.instructions[this.instructions.length - 1];
      return (
        this._tick === 0 && r && r.action === 'stroke'
          ? (i = r.data.path)
          : (i = this._activePath.clone()),
        i
          ? (t != null &&
              (e !== void 0 &&
                typeof t == 'number' &&
                (F(
                  H,
                  'GraphicsContext.fill(color, alpha) is deprecated, use GraphicsContext.fill({ color, alpha }) instead',
                ),
                (t = { color: t, alpha: e })),
              (this._fillStyle = te(t, ot.defaultFillStyle))),
            this.instructions.push({ action: 'fill', data: { style: this.fillStyle, path: i } }),
            this.onUpdate(),
            this._initNextPathLocation(),
            (this._tick = 0),
            this)
          : this
      );
    }
    _initNextPathLocation() {
      const { x: t, y: e } = this._activePath.getLastPoint(W.shared);
      (this._activePath.clear(), this._activePath.moveTo(t, e));
    }
    stroke(t) {
      let e;
      const i = this.instructions[this.instructions.length - 1];
      return (
        this._tick === 0 && i && i.action === 'fill'
          ? (e = i.data.path)
          : (e = this._activePath.clone()),
        e
          ? (t != null && (this._strokeStyle = Hi(t, ot.defaultStrokeStyle)),
            this.instructions.push({
              action: 'stroke',
              data: { style: this.strokeStyle, path: e },
            }),
            this.onUpdate(),
            this._initNextPathLocation(),
            (this._tick = 0),
            this)
          : this
      );
    }
    cut() {
      for (let t = 0; t < 2; t++) {
        const e = this.instructions[this.instructions.length - 1 - t],
          i = this._activePath.clone();
        if (e && (e.action === 'stroke' || e.action === 'fill'))
          if (e.data.hole) e.data.hole.addPath(i);
          else {
            e.data.hole = i;
            break;
          }
      }
      return (this._initNextPathLocation(), this);
    }
    arc(t, e, i, r, n, o) {
      this._tick++;
      const a = this._transform;
      return (
        this._activePath.arc(a.a * t + a.c * e + a.tx, a.b * t + a.d * e + a.ty, i, r, n, o),
        this
      );
    }
    arcTo(t, e, i, r, n) {
      this._tick++;
      const o = this._transform;
      return (
        this._activePath.arcTo(
          o.a * t + o.c * e + o.tx,
          o.b * t + o.d * e + o.ty,
          o.a * i + o.c * r + o.tx,
          o.b * i + o.d * r + o.ty,
          n,
        ),
        this
      );
    }
    arcToSvg(t, e, i, r, n, o, a) {
      this._tick++;
      const h = this._transform;
      return (
        this._activePath.arcToSvg(
          t,
          e,
          i,
          r,
          n,
          h.a * o + h.c * a + h.tx,
          h.b * o + h.d * a + h.ty,
        ),
        this
      );
    }
    bezierCurveTo(t, e, i, r, n, o, a) {
      this._tick++;
      const h = this._transform;
      return (
        this._activePath.bezierCurveTo(
          h.a * t + h.c * e + h.tx,
          h.b * t + h.d * e + h.ty,
          h.a * i + h.c * r + h.tx,
          h.b * i + h.d * r + h.ty,
          h.a * n + h.c * o + h.tx,
          h.b * n + h.d * o + h.ty,
          a,
        ),
        this
      );
    }
    closePath() {
      return (this._tick++, this._activePath?.closePath(), this);
    }
    ellipse(t, e, i, r) {
      return (this._tick++, this._activePath.ellipse(t, e, i, r, this._transform.clone()), this);
    }
    circle(t, e, i) {
      return (this._tick++, this._activePath.circle(t, e, i, this._transform.clone()), this);
    }
    path(t) {
      return (this._tick++, this._activePath.addPath(t, this._transform.clone()), this);
    }
    lineTo(t, e) {
      this._tick++;
      const i = this._transform;
      return (this._activePath.lineTo(i.a * t + i.c * e + i.tx, i.b * t + i.d * e + i.ty), this);
    }
    moveTo(t, e) {
      this._tick++;
      const i = this._transform,
        r = this._activePath.instructions,
        n = i.a * t + i.c * e + i.tx,
        o = i.b * t + i.d * e + i.ty;
      return r.length === 1 && r[0].action === 'moveTo'
        ? ((r[0].data[0] = n), (r[0].data[1] = o), this)
        : (this._activePath.moveTo(n, o), this);
    }
    quadraticCurveTo(t, e, i, r, n) {
      this._tick++;
      const o = this._transform;
      return (
        this._activePath.quadraticCurveTo(
          o.a * t + o.c * e + o.tx,
          o.b * t + o.d * e + o.ty,
          o.a * i + o.c * r + o.tx,
          o.b * i + o.d * r + o.ty,
          n,
        ),
        this
      );
    }
    rect(t, e, i, r) {
      return (this._tick++, this._activePath.rect(t, e, i, r, this._transform.clone()), this);
    }
    roundRect(t, e, i, r, n) {
      return (
        this._tick++,
        this._activePath.roundRect(t, e, i, r, n, this._transform.clone()),
        this
      );
    }
    poly(t, e) {
      return (this._tick++, this._activePath.poly(t, e, this._transform.clone()), this);
    }
    regularPoly(t, e, i, r, n = 0, o) {
      return (this._tick++, this._activePath.regularPoly(t, e, i, r, n, o), this);
    }
    roundPoly(t, e, i, r, n, o) {
      return (this._tick++, this._activePath.roundPoly(t, e, i, r, n, o), this);
    }
    roundShape(t, e, i, r) {
      return (this._tick++, this._activePath.roundShape(t, e, i, r), this);
    }
    filletRect(t, e, i, r, n) {
      return (this._tick++, this._activePath.filletRect(t, e, i, r, n), this);
    }
    chamferRect(t, e, i, r, n, o) {
      return (this._tick++, this._activePath.chamferRect(t, e, i, r, n, o), this);
    }
    star(t, e, i, r, n = 0, o = 0) {
      return (this._tick++, this._activePath.star(t, e, i, r, n, o, this._transform.clone()), this);
    }
    svg(t) {
      return (this._tick++, al(t, this), this);
    }
    restore() {
      const t = this._stateStack.pop();
      return (
        t &&
          ((this._transform = t.transform),
          (this._fillStyle = t.fillStyle),
          (this._strokeStyle = t.strokeStyle)),
        this
      );
    }
    save() {
      return (
        this._stateStack.push({
          transform: this._transform.clone(),
          fillStyle: { ...this._fillStyle },
          strokeStyle: { ...this._strokeStyle },
        }),
        this
      );
    }
    getTransform() {
      return this._transform;
    }
    resetTransform() {
      return (this._transform.identity(), this);
    }
    rotate(t) {
      return (this._transform.rotate(t), this);
    }
    scale(t, e = t) {
      return (this._transform.scale(t, e), this);
    }
    setTransform(t, e, i, r, n, o) {
      return t instanceof I
        ? (this._transform.set(t.a, t.b, t.c, t.d, t.tx, t.ty), this)
        : (this._transform.set(t, e, i, r, n, o), this);
    }
    transform(t, e, i, r, n, o) {
      return t instanceof I
        ? (this._transform.append(t), this)
        : (Yi.set(t, e, i, r, n, o), this._transform.append(Yi), this);
    }
    translate(t, e = t) {
      return (this._transform.translate(t, e), this);
    }
    clear() {
      return (
        this._activePath.clear(),
        (this.instructions.length = 0),
        this.resetTransform(),
        this.onUpdate(),
        this
      );
    }
    onUpdate() {
      this.dirty || (this.emit('update', this, 16), (this.dirty = !0), (this._boundsDirty = !0));
    }
    get bounds() {
      if (!this._boundsDirty) return this._bounds;
      const t = this._bounds;
      t.clear();
      for (let e = 0; e < this.instructions.length; e++) {
        const i = this.instructions[e],
          r = i.action;
        if (r === 'fill') {
          const n = i.data;
          t.addBounds(n.path.bounds);
        } else if (r === 'texture') {
          const n = i.data;
          t.addFrame(n.dx, n.dy, n.dx + n.dw, n.dy + n.dh, n.transform);
        }
        if (r === 'stroke') {
          const n = i.data,
            o = n.style.alignment,
            a = n.style.width * (1 - o),
            h = n.path.bounds;
          t.addFrame(h.minX - a, h.minY - a, h.maxX + a, h.maxY + a);
        }
      }
      return t;
    }
    containsPoint(t) {
      if (!this.bounds.containsPoint(t.x, t.y)) return !1;
      const e = this.instructions;
      let i = !1;
      for (let r = 0; r < e.length; r++) {
        const n = e[r],
          o = n.data,
          a = o.path;
        if (!n.action || !a) continue;
        const h = o.style,
          l = a.shapePath.shapePrimitives;
        for (let c = 0; c < l.length; c++) {
          const u = l[c].shape;
          if (!h || !u) continue;
          const f = l[c].transform,
            d = f ? f.applyInverse(t, fl) : t;
          if (n.action === 'fill') i = u.contains(d.x, d.y);
          else {
            const g = h;
            i = u.strokeContains(d.x, d.y, g.width, g.alignment);
          }
          const m = o.hole;
          if (m) {
            const g = m.shapePath?.shapePrimitives;
            if (g) for (let p = 0; p < g.length; p++) g[p].shape.contains(d.x, d.y) && (i = !1);
          }
          if (i) return !0;
        }
      }
      return i;
    }
    destroy(t = !1) {
      if (
        ((this._stateStack.length = 0),
        (this._transform = null),
        this.emit('destroy', this),
        this.removeAllListeners(),
        typeof t == 'boolean' ? t : t?.texture)
      ) {
        const i = typeof t == 'boolean' ? t : t?.textureSource;
        (this._fillStyle.texture &&
          (this._fillStyle.fill && 'uid' in this._fillStyle.fill
            ? this._fillStyle.fill.destroy()
            : this._fillStyle.texture.destroy(i)),
          this._strokeStyle.texture &&
            (this._strokeStyle.fill && 'uid' in this._strokeStyle.fill
              ? this._strokeStyle.fill.destroy()
              : this._strokeStyle.texture.destroy(i)));
      }
      ((this._fillStyle = null),
        (this._strokeStyle = null),
        (this.instructions = null),
        (this._activePath = null),
        (this._bounds = null),
        (this._stateStack = null),
        (this.customShader = null),
        (this._transform = null));
    }
  };
Ls.defaultFillStyle = {
  color: 16777215,
  alpha: 1,
  texture: D.WHITE,
  matrix: null,
  fill: null,
  textureSpace: 'local',
};
Ls.defaultStrokeStyle = {
  width: 1,
  color: 16777215,
  alpha: 1,
  alignment: 0.5,
  miterLimit: 10,
  cap: 'butt',
  join: 'miter',
  texture: D.WHITE,
  matrix: null,
  fill: null,
  textureSpace: 'local',
  pixelLine: !1,
};
let qt = Ls;
class Ge extends ur {
  constructor(t) {
    t instanceof qt && (t = { context: t });
    const { context: e, roundPixels: i, ...r } = t || {};
    (super({ label: 'Graphics', ...r }),
      (this.renderPipeId = 'graphics'),
      e ? (this._context = e) : (this._context = this._ownedContext = new qt()),
      this._context.on('update', this.onViewUpdate, this),
      (this.didViewUpdate = !0),
      (this.allowChildren = !1),
      (this.roundPixels = i ?? !1));
  }
  set context(t) {
    t !== this._context &&
      (this._context.off('update', this.onViewUpdate, this),
      (this._context = t),
      this._context.on('update', this.onViewUpdate, this),
      this.onViewUpdate());
  }
  get context() {
    return this._context;
  }
  get bounds() {
    return this._context.bounds;
  }
  updateBounds() {}
  containsPoint(t) {
    return this._context.containsPoint(t);
  }
  destroy(t) {
    (this._ownedContext && !t
      ? this._ownedContext.destroy(t)
      : (t === !0 || t?.context === !0) && this._context.destroy(t),
      (this._ownedContext = null),
      (this._context = null),
      super.destroy(t));
  }
  _callContextMethod(t, e) {
    return (this.context[t](...e), this);
  }
  setFillStyle(...t) {
    return this._callContextMethod('setFillStyle', t);
  }
  setStrokeStyle(...t) {
    return this._callContextMethod('setStrokeStyle', t);
  }
  fill(...t) {
    return this._callContextMethod('fill', t);
  }
  stroke(...t) {
    return this._callContextMethod('stroke', t);
  }
  texture(...t) {
    return this._callContextMethod('texture', t);
  }
  beginPath() {
    return this._callContextMethod('beginPath', []);
  }
  cut() {
    return this._callContextMethod('cut', []);
  }
  arc(...t) {
    return this._callContextMethod('arc', t);
  }
  arcTo(...t) {
    return this._callContextMethod('arcTo', t);
  }
  arcToSvg(...t) {
    return this._callContextMethod('arcToSvg', t);
  }
  bezierCurveTo(...t) {
    return this._callContextMethod('bezierCurveTo', t);
  }
  closePath() {
    return this._callContextMethod('closePath', []);
  }
  ellipse(...t) {
    return this._callContextMethod('ellipse', t);
  }
  circle(...t) {
    return this._callContextMethod('circle', t);
  }
  path(...t) {
    return this._callContextMethod('path', t);
  }
  lineTo(...t) {
    return this._callContextMethod('lineTo', t);
  }
  moveTo(...t) {
    return this._callContextMethod('moveTo', t);
  }
  quadraticCurveTo(...t) {
    return this._callContextMethod('quadraticCurveTo', t);
  }
  rect(...t) {
    return this._callContextMethod('rect', t);
  }
  roundRect(...t) {
    return this._callContextMethod('roundRect', t);
  }
  poly(...t) {
    return this._callContextMethod('poly', t);
  }
  regularPoly(...t) {
    return this._callContextMethod('regularPoly', t);
  }
  roundPoly(...t) {
    return this._callContextMethod('roundPoly', t);
  }
  roundShape(...t) {
    return this._callContextMethod('roundShape', t);
  }
  filletRect(...t) {
    return this._callContextMethod('filletRect', t);
  }
  chamferRect(...t) {
    return this._callContextMethod('chamferRect', t);
  }
  star(...t) {
    return this._callContextMethod('star', t);
  }
  svg(...t) {
    return this._callContextMethod('svg', t);
  }
  restore(...t) {
    return this._callContextMethod('restore', t);
  }
  save() {
    return this._callContextMethod('save', []);
  }
  getTransform() {
    return this.context.getTransform();
  }
  resetTransform() {
    return this._callContextMethod('resetTransform', []);
  }
  rotateTransform(...t) {
    return this._callContextMethod('rotate', t);
  }
  scaleTransform(...t) {
    return this._callContextMethod('scale', t);
  }
  setTransform(...t) {
    return this._callContextMethod('setTransform', t);
  }
  transform(...t) {
    return this._callContextMethod('transform', t);
  }
  translateTransform(...t) {
    return this._callContextMethod('translate', t);
  }
  clear() {
    return this._callContextMethod('clear', []);
  }
  get fillStyle() {
    return this._context.fillStyle;
  }
  set fillStyle(t) {
    this._context.fillStyle = t;
  }
  get strokeStyle() {
    return this._context.strokeStyle;
  }
  set strokeStyle(t) {
    this._context.strokeStyle = t;
  }
  clone(t = !1) {
    return t ? new Ge(this._context.clone()) : ((this._ownedContext = null), new Ge(this._context));
  }
  lineStyle(t, e, i) {
    F(
      H,
      'Graphics#lineStyle is no longer needed. Use Graphics#setStrokeStyle to set the stroke style.',
    );
    const r = {};
    return (
      t && (r.width = t),
      e && (r.color = e),
      i && (r.alpha = i),
      (this.context.strokeStyle = r),
      this
    );
  }
  beginFill(t, e) {
    F(
      H,
      'Graphics#beginFill is no longer needed. Use Graphics#fill to fill the shape with the desired style.',
    );
    const i = {};
    return (
      t !== void 0 && (i.color = t),
      e !== void 0 && (i.alpha = e),
      (this.context.fillStyle = i),
      this
    );
  }
  endFill() {
    (F(
      H,
      'Graphics#endFill is no longer needed. Use Graphics#fill to fill the shape with the desired style.',
    ),
      this.context.fill());
    const t = this.context.strokeStyle;
    return (
      (t.width !== qt.defaultStrokeStyle.width ||
        t.color !== qt.defaultStrokeStyle.color ||
        t.alpha !== qt.defaultStrokeStyle.alpha) &&
        this.context.stroke(),
      this
    );
  }
  drawCircle(...t) {
    return (
      F(H, 'Graphics#drawCircle has been renamed to Graphics#circle'),
      this._callContextMethod('circle', t)
    );
  }
  drawEllipse(...t) {
    return (
      F(H, 'Graphics#drawEllipse has been renamed to Graphics#ellipse'),
      this._callContextMethod('ellipse', t)
    );
  }
  drawPolygon(...t) {
    return (
      F(H, 'Graphics#drawPolygon has been renamed to Graphics#poly'),
      this._callContextMethod('poly', t)
    );
  }
  drawRect(...t) {
    return (
      F(H, 'Graphics#drawRect has been renamed to Graphics#rect'),
      this._callContextMethod('rect', t)
    );
  }
  drawRoundedRect(...t) {
    return (
      F(H, 'Graphics#drawRoundedRect has been renamed to Graphics#roundRect'),
      this._callContextMethod('roundRect', t)
    );
  }
  drawStar(...t) {
    return (
      F(H, 'Graphics#drawStar has been renamed to Graphics#star'),
      this._callContextMethod('star', t)
    );
  }
}
et.add(Cn, An);
function pl(s, t = () => {}, e = 0) {
  const i = [];
  let r = 0;
  for (let n = 0; n < e; n++) {
    const o = s();
    (r++, i.push(o));
  }
  return {
    acquire() {
      const n = i.pop();
      return n || (r++, s());
    },
    release(n) {
      (t(n), i.push(n));
    },
    size() {
      return r;
    },
    inUse() {
      return r - i.length;
    },
  };
}
function ml(s, t = 0) {
  return pl(
    () => new Ft(s),
    (e) => {
      ((e.visible = !1),
        (e.alpha = 1),
        (e.rotation = 0),
        e.scale.set(1),
        e.position.set(0, 0),
        e.parent?.removeChild(e));
    },
    t,
  );
}
function gl(s) {
  let t,
    e,
    i,
    r,
    n,
    o = 'Spawn 100',
    a,
    h,
    l = 'Spawn 1000',
    c,
    u,
    f = 'Recycle All',
    d,
    m,
    g,
    p,
    y,
    x,
    _,
    b = s[2].size() + '',
    C,
    w,
    v = s[2].inUse() + '',
    T,
    k,
    A,
    S;
  return {
    c() {
      ((t = pt('div')),
        (e = pt('canvas')),
        (i = Yt()),
        (r = pt('div')),
        (n = pt('button')),
        (n.textContent = o),
        (a = Yt()),
        (h = pt('button')),
        (h.textContent = l),
        (c = Yt()),
        (u = pt('button')),
        (u.textContent = f),
        (d = Yt()),
        (m = pt('div')),
        (g = vt('Spawned: ')),
        (p = vt(s[1])),
        (y = Yt()),
        (x = pt('div')),
        (_ = vt('Pool: ')),
        (C = vt(b)),
        (w = vt(' total, ')),
        (T = vt(v)),
        (k = vt(' in use')),
        this.h());
    },
    l(R) {
      t = ft(R, 'DIV', { style: !0 });
      var E = Vt(t);
      ((e = ft(E, 'CANVAS', { style: !0 })),
        Vt(e).forEach(It),
        (i = Ht(E)),
        (r = ft(E, 'DIV', { style: !0 })));
      var L = Vt(r);
      ((n = ft(L, 'BUTTON', { style: !0, 'data-svelte-h': !0 })),
        ze(n) !== 'svelte-1qhjeqz' && (n.textContent = o),
        (a = Ht(L)),
        (h = ft(L, 'BUTTON', { style: !0, 'data-svelte-h': !0 })),
        ze(h) !== 'svelte-5ycajb' && (h.textContent = l),
        (c = Ht(L)),
        (u = ft(L, 'BUTTON', { 'data-svelte-h': !0 })),
        ze(u) !== 'svelte-1vyv9z2' && (u.textContent = f),
        (d = Ht(L)),
        (m = ft(L, 'DIV', {})));
      var at = Vt(m);
      ((g = wt(at, 'Spawned: ')),
        (p = wt(at, s[1])),
        at.forEach(It),
        (y = Ht(L)),
        (x = ft(L, 'DIV', {})));
      var M = Vt(x);
      ((_ = wt(M, 'Pool: ')),
        (C = wt(M, b)),
        (w = wt(M, ' total, ')),
        (T = wt(M, v)),
        (k = wt(M, ' in use')),
        M.forEach(It),
        L.forEach(It),
        E.forEach(It),
        this.h());
    },
    h() {
      (j(e, 'width', '100%'),
        j(e, 'height', '100%'),
        j(e, 'display', 'block'),
        j(n, 'margin-right', '6px'),
        j(h, 'margin-right', '6px'),
        j(r, 'position', 'absolute'),
        j(r, 'right', '8px'),
        j(r, 'top', '8px'),
        j(r, 'background', 'rgba(0,0,0,.6)'),
        j(r, 'color', '#fff'),
        j(r, 'padding', '8px'),
        j(r, 'border-radius', '6px'),
        j(r, 'font', '12px system-ui'),
        j(t, 'position', 'fixed'),
        j(t, 'inset', '0'));
    },
    m(R, E) {
      (vn(R, t, E),
        V(t, e),
        s[5](e),
        V(t, i),
        V(t, r),
        V(r, n),
        V(r, a),
        V(r, h),
        V(r, c),
        V(r, u),
        V(r, d),
        V(r, m),
        V(m, g),
        V(m, p),
        V(r, y),
        V(r, x),
        V(x, _),
        V(x, C),
        V(x, w),
        V(x, T),
        V(x, k),
        A || ((S = [Ue(n, 'click', s[6]), Ue(h, 'click', s[7]), Ue(u, 'click', s[4])]), (A = !0)));
    },
    p(R, [E]) {
      E & 2 && wn(p, R[1]);
    },
    i: Vs,
    o: Vs,
    d(R) {
      (R && It(t), s[5](null), (A = !1), mn(S));
    },
  };
}
function xl(s, t, e) {
  let i,
    r,
    n = 0;
  const o = ml(void 0, 200);
  function a(f) {
    for (let d = 0; d < f; d++) {
      const m = new Ge().circle(Math.random() * 6 + 2).fill(16777215 * Math.random()),
        g = o.acquire();
      ((g.visible = !0),
        g.position.set(Math.random() * r.renderer.width, Math.random() * r.renderer.height),
        (g.texture = r.renderer.generateTexture(m)),
        r.stage.addChild(g),
        e(1, n++, n));
    }
  }
  function h() {
    for (const f of [...r.stage.children]) ('texture' in f && o.release(f), r.stage.removeChild(f));
    e(1, (n = 0));
  }
  (gn(async () => {
    ((r = new $r({ view: i, backgroundAlpha: 0 })),
      await r.init({ resizeTo: i.parentElement ?? window }));
  }),
    xn(() => r?.destroy(!0, { children: !0 })));
  function l(f) {
    yn[f ? 'unshift' : 'push'](() => {
      ((i = f), e(0, i));
    });
  }
  return [i, n, o, a, h, l, () => a(100), () => a(1e3)];
}
class Cl extends _n {
  constructor(t) {
    (super(), bn(this, t, xl, gl, pn, {}));
  }
}
export {
  Vr as $,
  Or as A,
  Z as B,
  kt as C,
  gt as D,
  G as E,
  uo as F,
  Fe as G,
  ii as H,
  Ft as I,
  Uo as J,
  Wo as K,
  O as L,
  I as M,
  $ as N,
  ua as O,
  W as P,
  ni as Q,
  xs as R,
  Ra as S,
  be as T,
  ps as U,
  je as V,
  oi as W,
  mo as X,
  Qi as Y,
  tt as Z,
  ar as _,
  ut as a,
  F as a0,
  H as a1,
  ga as a2,
  Va as a3,
  Fa as a4,
  ah as a5,
  lh as a6,
  ph as a7,
  gh as a8,
  xh as a9,
  qt as aa,
  te as ab,
  Hi as ac,
  ce as ad,
  ya as ae,
  Re as af,
  Gt as ag,
  sn as ah,
  vi as ai,
  bi as aj,
  Ge as ak,
  Fn as al,
  on as am,
  Cl as an,
  he as b,
  Ie as c,
  Is as d,
  et as e,
  wi as f,
  ka as g,
  Ur as h,
  yr as i,
  rt as j,
  Gr as k,
  oh as l,
  hh as m,
  Ys as n,
  dh as o,
  mh as p,
  Es as q,
  jn as r,
  D as s,
  kr as t,
  Bn as u,
  _h as v,
  K as w,
  lt as x,
  rr as y,
  it as z,
};
