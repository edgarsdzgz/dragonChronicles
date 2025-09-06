import {
  u as kt,
  h as Fe,
  i as j,
  T as Y,
  I as Xt,
  M as B,
  j as D,
  D as ze,
  w as dt,
  R as W,
  m as He,
  E as V,
  P as Q,
  B as lt,
  e as xe,
  k as Le,
  v as De,
  l as ye,
  b as Ae,
  o as A,
  V as qe,
} from './index.B-5O6jHt.js';
import { g as Be } from './_commonjsHelpers.Cpj98o6Y.js';
import { g as Ee } from './getTextureBatchBindGroup.CknAdSLP.js';
import { D as Ve } from './DefaultBatcher.JZVzBZuM.js';
function Yt(s, t, e = 2) {
  const n = t && t.length,
    i = n ? t[0] * e : s.length;
  let r = pe(s, 0, i, e, !0);
  const o = [];
  if (!r || r.next === r.prev) return o;
  let a, h, c;
  if ((n && (r = $e(s, t, r, e)), s.length > 80 * e)) {
    ((a = s[0]), (h = s[1]));
    let l = a,
      d = h;
    for (let f = e; f < i; f += e) {
      const u = s[f],
        x = s[f + 1];
      (u < a && (a = u), x < h && (h = x), u > l && (l = u), x > d && (d = x));
    }
    ((c = Math.max(l - a, d - h)), (c = c !== 0 ? 32767 / c : 0));
  }
  return (ft(r, o, e, a, h, c, 0), o);
}
function pe(s, t, e, n, i) {
  let r;
  if (i === sn(s, t, e, n) > 0)
    for (let o = t; o < e; o += n) r = Kt((o / n) | 0, s[o], s[o + 1], r);
  else for (let o = e - n; o >= t; o -= n) r = Kt((o / n) | 0, s[o], s[o + 1], r);
  return (r && O(r, r.next) && (yt(r), (r = r.next)), r);
}
function K(s, t) {
  if (!s) return s;
  t || (t = s);
  let e = s,
    n;
  do
    if (((n = !1), !e.steiner && (O(e, e.next) || I(e.prev, e, e.next) === 0))) {
      if ((yt(e), (e = t = e.prev), e === e.next)) break;
      n = !0;
    } else e = e.next;
  while (n || e !== t);
  return t;
}
function ft(s, t, e, n, i, r, o) {
  if (!s) return;
  !o && r && Qe(s, n, i, r);
  let a = s;
  for (; s.prev !== s.next; ) {
    const h = s.prev,
      c = s.next;
    if (r ? We(s, n, i, r) : je(s)) {
      (t.push(h.i, s.i, c.i), yt(s), (s = c.next), (a = c.next));
      continue;
    }
    if (((s = c), s === a)) {
      o
        ? o === 1
          ? ((s = Ue(K(s), t)), ft(s, t, e, n, i, r, 2))
          : o === 2 && Ze(s, t, e, n, i, r)
        : ft(K(s), t, e, n, i, r, 1);
      break;
    }
  }
}
function je(s) {
  const t = s.prev,
    e = s,
    n = s.next;
  if (I(t, e, n) >= 0) return !1;
  const i = t.x,
    r = e.x,
    o = n.x,
    a = t.y,
    h = e.y,
    c = n.y,
    l = Math.min(i, r, o),
    d = Math.min(a, h, c),
    f = Math.max(i, r, o),
    u = Math.max(a, h, c);
  let x = n.next;
  for (; x !== t; ) {
    if (
      x.x >= l &&
      x.x <= f &&
      x.y >= d &&
      x.y <= u &&
      at(i, a, r, h, o, c, x.x, x.y) &&
      I(x.prev, x, x.next) >= 0
    )
      return !1;
    x = x.next;
  }
  return !0;
}
function We(s, t, e, n) {
  const i = s.prev,
    r = s,
    o = s.next;
  if (I(i, r, o) >= 0) return !1;
  const a = i.x,
    h = r.x,
    c = o.x,
    l = i.y,
    d = r.y,
    f = o.y,
    u = Math.min(a, h, c),
    x = Math.min(l, d, f),
    y = Math.max(a, h, c),
    p = Math.max(l, d, f),
    _ = It(u, x, t, e, n),
    g = It(y, p, t, e, n);
  let M = s.prevZ,
    m = s.nextZ;
  for (; M && M.z >= _ && m && m.z <= g; ) {
    if (
      (M.x >= u &&
        M.x <= y &&
        M.y >= x &&
        M.y <= p &&
        M !== i &&
        M !== o &&
        at(a, l, h, d, c, f, M.x, M.y) &&
        I(M.prev, M, M.next) >= 0) ||
      ((M = M.prevZ),
      m.x >= u &&
        m.x <= y &&
        m.y >= x &&
        m.y <= p &&
        m !== i &&
        m !== o &&
        at(a, l, h, d, c, f, m.x, m.y) &&
        I(m.prev, m, m.next) >= 0)
    )
      return !1;
    m = m.nextZ;
  }
  for (; M && M.z >= _; ) {
    if (
      M.x >= u &&
      M.x <= y &&
      M.y >= x &&
      M.y <= p &&
      M !== i &&
      M !== o &&
      at(a, l, h, d, c, f, M.x, M.y) &&
      I(M.prev, M, M.next) >= 0
    )
      return !1;
    M = M.prevZ;
  }
  for (; m && m.z <= g; ) {
    if (
      m.x >= u &&
      m.x <= y &&
      m.y >= x &&
      m.y <= p &&
      m !== i &&
      m !== o &&
      at(a, l, h, d, c, f, m.x, m.y) &&
      I(m.prev, m, m.next) >= 0
    )
      return !1;
    m = m.nextZ;
  }
  return !0;
}
function Ue(s, t) {
  let e = s;
  do {
    const n = e.prev,
      i = e.next.next;
    (!O(n, i) &&
      me(n, e, e.next, i) &&
      xt(n, i) &&
      xt(i, n) &&
      (t.push(n.i, e.i, i.i), yt(e), yt(e.next), (e = s = i)),
      (e = e.next));
  } while (e !== s);
  return K(e);
}
function Ze(s, t, e, n, i, r) {
  let o = s;
  do {
    let a = o.next.next;
    for (; a !== o.prev; ) {
      if (o.i !== a.i && tn(o, a)) {
        let h = _e(o, a);
        ((o = K(o, o.next)), (h = K(h, h.next)), ft(o, t, e, n, i, r, 0), ft(h, t, e, n, i, r, 0));
        return;
      }
      a = a.next;
    }
    o = o.next;
  } while (o !== s);
}
function $e(s, t, e, n) {
  const i = [];
  for (let r = 0, o = t.length; r < o; r++) {
    const a = t[r] * n,
      h = r < o - 1 ? t[r + 1] * n : s.length,
      c = pe(s, a, h, n, !1);
    (c === c.next && (c.steiner = !0), i.push(Je(c)));
  }
  i.sort(Ne);
  for (let r = 0; r < i.length; r++) e = Xe(i[r], e);
  return e;
}
function Ne(s, t) {
  let e = s.x - t.x;
  if (e === 0 && ((e = s.y - t.y), e === 0)) {
    const n = (s.next.y - s.y) / (s.next.x - s.x),
      i = (t.next.y - t.y) / (t.next.x - t.x);
    e = n - i;
  }
  return e;
}
function Xe(s, t) {
  const e = Ye(s, t);
  if (!e) return t;
  const n = _e(e, s);
  return (K(n, n.next), K(e, e.next));
}
function Ye(s, t) {
  let e = t;
  const n = s.x,
    i = s.y;
  let r = -1 / 0,
    o;
  if (O(s, e)) return e;
  do {
    if (O(s, e.next)) return e.next;
    if (i <= e.y && i >= e.next.y && e.next.y !== e.y) {
      const d = e.x + ((i - e.y) * (e.next.x - e.x)) / (e.next.y - e.y);
      if (d <= n && d > r && ((r = d), (o = e.x < e.next.x ? e : e.next), d === n)) return o;
    }
    e = e.next;
  } while (e !== t);
  if (!o) return null;
  const a = o,
    h = o.x,
    c = o.y;
  let l = 1 / 0;
  e = o;
  do {
    if (
      n >= e.x &&
      e.x >= h &&
      n !== e.x &&
      ge(i < c ? n : r, i, h, c, i < c ? r : n, i, e.x, e.y)
    ) {
      const d = Math.abs(i - e.y) / (n - e.x);
      xt(e, s) &&
        (d < l || (d === l && (e.x > o.x || (e.x === o.x && Ke(o, e))))) &&
        ((o = e), (l = d));
    }
    e = e.next;
  } while (e !== a);
  return o;
}
function Ke(s, t) {
  return I(s.prev, s, t.prev) < 0 && I(t.next, s, s.next) < 0;
}
function Qe(s, t, e, n) {
  let i = s;
  do
    (i.z === 0 && (i.z = It(i.x, i.y, t, e, n)),
      (i.prevZ = i.prev),
      (i.nextZ = i.next),
      (i = i.next));
  while (i !== s);
  ((i.prevZ.nextZ = null), (i.prevZ = null), Oe(i));
}
function Oe(s) {
  let t,
    e = 1;
  do {
    let n = s,
      i;
    s = null;
    let r = null;
    for (t = 0; n; ) {
      t++;
      let o = n,
        a = 0;
      for (let c = 0; c < e && (a++, (o = o.nextZ), !!o); c++);
      let h = e;
      for (; a > 0 || (h > 0 && o); )
        (a !== 0 && (h === 0 || !o || n.z <= o.z)
          ? ((i = n), (n = n.nextZ), a--)
          : ((i = o), (o = o.nextZ), h--),
          r ? (r.nextZ = i) : (s = i),
          (i.prevZ = r),
          (r = i));
      n = o;
    }
    ((r.nextZ = null), (e *= 2));
  } while (t > 1);
  return s;
}
function It(s, t, e, n, i) {
  return (
    (s = ((s - e) * i) | 0),
    (t = ((t - n) * i) | 0),
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
function Je(s) {
  let t = s,
    e = s;
  do ((t.x < e.x || (t.x === e.x && t.y < e.y)) && (e = t), (t = t.next));
  while (t !== s);
  return e;
}
function ge(s, t, e, n, i, r, o, a) {
  return (
    (i - o) * (t - a) >= (s - o) * (r - a) &&
    (s - o) * (n - a) >= (e - o) * (t - a) &&
    (e - o) * (r - a) >= (i - o) * (n - a)
  );
}
function at(s, t, e, n, i, r, o, a) {
  return !(s === o && t === a) && ge(s, t, e, n, i, r, o, a);
}
function tn(s, t) {
  return (
    s.next.i !== t.i &&
    s.prev.i !== t.i &&
    !en(s, t) &&
    ((xt(s, t) && xt(t, s) && nn(s, t) && (I(s.prev, s, t.prev) || I(s, t.prev, t))) ||
      (O(s, t) && I(s.prev, s, s.next) > 0 && I(t.prev, t, t.next) > 0))
  );
}
function I(s, t, e) {
  return (t.y - s.y) * (e.x - t.x) - (t.x - s.x) * (e.y - t.y);
}
function O(s, t) {
  return s.x === t.x && s.y === t.y;
}
function me(s, t, e, n) {
  const i = Mt(I(s, t, e)),
    r = Mt(I(s, t, n)),
    o = Mt(I(e, n, s)),
    a = Mt(I(e, n, t));
  return !!(
    (i !== r && o !== a) ||
    (i === 0 && Pt(s, e, t)) ||
    (r === 0 && Pt(s, n, t)) ||
    (o === 0 && Pt(e, s, n)) ||
    (a === 0 && Pt(e, t, n))
  );
}
function Pt(s, t, e) {
  return (
    t.x <= Math.max(s.x, e.x) &&
    t.x >= Math.min(s.x, e.x) &&
    t.y <= Math.max(s.y, e.y) &&
    t.y >= Math.min(s.y, e.y)
  );
}
function Mt(s) {
  return s > 0 ? 1 : s < 0 ? -1 : 0;
}
function en(s, t) {
  let e = s;
  do {
    if (e.i !== s.i && e.next.i !== s.i && e.i !== t.i && e.next.i !== t.i && me(e, e.next, s, t))
      return !0;
    e = e.next;
  } while (e !== s);
  return !1;
}
function xt(s, t) {
  return I(s.prev, s, s.next) < 0
    ? I(s, t, s.next) >= 0 && I(s, s.prev, t) >= 0
    : I(s, t, s.prev) < 0 || I(s, s.next, t) < 0;
}
function nn(s, t) {
  let e = s,
    n = !1;
  const i = (s.x + t.x) / 2,
    r = (s.y + t.y) / 2;
  do
    (e.y > r != e.next.y > r &&
      e.next.y !== e.y &&
      i < ((e.next.x - e.x) * (r - e.y)) / (e.next.y - e.y) + e.x &&
      (n = !n),
      (e = e.next));
  while (e !== s);
  return n;
}
function _e(s, t) {
  const e = Ft(s.i, s.x, s.y),
    n = Ft(t.i, t.x, t.y),
    i = s.next,
    r = t.prev;
  return (
    (s.next = t),
    (t.prev = s),
    (e.next = i),
    (i.prev = e),
    (n.next = e),
    (e.prev = n),
    (r.next = n),
    (n.prev = r),
    n
  );
}
function Kt(s, t, e, n) {
  const i = Ft(s, t, e);
  return (
    n
      ? ((i.next = n.next), (i.prev = n), (n.next.prev = i), (n.next = i))
      : ((i.prev = i), (i.next = i)),
    i
  );
}
function yt(s) {
  ((s.next.prev = s.prev),
    (s.prev.next = s.next),
    s.prevZ && (s.prevZ.nextZ = s.nextZ),
    s.nextZ && (s.nextZ.prevZ = s.prevZ));
}
function Ft(s, t, e) {
  return { i: s, x: t, y: e, prev: null, next: null, z: 0, prevZ: null, nextZ: null, steiner: !1 };
}
function sn(s, t, e, n) {
  let i = 0;
  for (let r = t, o = e - n; r < e; r += n) ((i += (s[o] - s[r]) * (s[r + 1] + s[o + 1])), (o = r));
  return i;
}
const rn = Yt.default || Yt,
  Qt = [
    { offset: 0, color: 'white' },
    { offset: 1, color: 'black' },
  ],
  qt = class zt {
    constructor(...t) {
      ((this.uid = kt('fillGradient')), (this.type = 'linear'), (this.colorStops = []));
      let e = on(t);
      ((e = {
        ...(e.type === 'radial' ? zt.defaultRadialOptions : zt.defaultLinearOptions),
        ...Fe(e),
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
        e.colorStops.forEach((i) => {
          this.addColorStop(i.offset, i.color);
        }));
    }
    addColorStop(t, e) {
      return (this.colorStops.push({ offset: t, color: j.shared.setValue(e).toHexa() }), this);
    }
    buildLinearGradient() {
      if (this.texture) return;
      let { x: t, y: e } = this.start,
        { x: n, y: i } = this.end,
        r = n - t,
        o = i - e;
      const a = r < 0 || o < 0;
      if (this._wrapMode === 'clamp-to-edge') {
        if (r < 0) {
          const p = t;
          ((t = n), (n = p), (r *= -1));
        }
        if (o < 0) {
          const p = e;
          ((e = i), (i = p), (o *= -1));
        }
      }
      const h = this.colorStops.length ? this.colorStops : Qt,
        c = this._textureSize,
        { canvas: l, context: d } = Jt(c, 1),
        f = a
          ? d.createLinearGradient(this._textureSize, 0, 0, 0)
          : d.createLinearGradient(0, 0, this._textureSize, 0);
      (Ot(f, h),
        (d.fillStyle = f),
        d.fillRect(0, 0, c, 1),
        (this.texture = new Y({ source: new Xt({ resource: l, addressMode: this._wrapMode }) })));
      const u = Math.sqrt(r * r + o * o),
        x = Math.atan2(o, r),
        y = new B();
      (y.scale(u / c, 1),
        y.rotate(x),
        y.translate(t, e),
        this.textureSpace === 'local' && y.scale(c, c),
        (this.transform = y));
    }
    buildGradient() {
      this.type === 'linear' ? this.buildLinearGradient() : this.buildRadialGradient();
    }
    buildRadialGradient() {
      if (this.texture) return;
      const t = this.colorStops.length ? this.colorStops : Qt,
        e = this._textureSize,
        { canvas: n, context: i } = Jt(e, e),
        { x: r, y: o } = this.center,
        { x: a, y: h } = this.outerCenter,
        c = this.innerRadius,
        l = this.outerRadius,
        d = a - l,
        f = h - l,
        u = e / (l * 2),
        x = (r - d) * u,
        y = (o - f) * u,
        p = i.createRadialGradient(x, y, c * u, (a - d) * u, (h - f) * u, l * u);
      (Ot(p, t),
        (i.fillStyle = t[t.length - 1].color),
        i.fillRect(0, 0, e, e),
        (i.fillStyle = p),
        i.translate(x, y),
        i.rotate(this.rotation),
        i.scale(1, this.scale),
        i.translate(-x, -y),
        i.fillRect(0, 0, e, e),
        (this.texture = new Y({ source: new Xt({ resource: n, addressMode: this._wrapMode }) })));
      const _ = new B();
      (_.scale(1 / u, 1 / u),
        _.translate(d, f),
        this.textureSpace === 'local' && _.scale(e, e),
        (this.transform = _));
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
qt.defaultLinearOptions = {
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
  colorStops: [],
  textureSpace: 'local',
  type: 'linear',
  textureSize: 256,
  wrapMode: 'clamp-to-edge',
};
qt.defaultRadialOptions = {
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
let gt = qt;
function Ot(s, t) {
  for (let e = 0; e < t.length; e++) {
    const n = t[e];
    s.addColorStop(n.offset, n.color);
  }
}
function Jt(s, t) {
  const e = ze.get().createCanvas(s, t),
    n = e.getContext('2d');
  return { canvas: e, context: n };
}
function on(s) {
  let t = s[0] ?? {};
  return (
    (typeof t == 'number' || s[1]) &&
      (D('8.5.2', 'use options object instead'),
      (t = {
        type: 'linear',
        start: { x: s[0], y: s[1] },
        end: { x: s[2], y: s[3] },
        textureSpace: s[4],
        textureSize: s[5] ?? gt.defaultLinearOptions.textureSize,
      })),
    t
  );
}
const te = {
  repeat: { addressModeU: 'repeat', addressModeV: 'repeat' },
  'repeat-x': { addressModeU: 'repeat', addressModeV: 'clamp-to-edge' },
  'repeat-y': { addressModeU: 'clamp-to-edge', addressModeV: 'repeat' },
  'no-repeat': { addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' },
};
class an {
  constructor(t, e) {
    ((this.uid = kt('fillPattern')),
      (this.transform = new B()),
      (this._styleKey = null),
      (this.texture = t),
      this.transform.scale(1 / t.frame.width, 1 / t.frame.height),
      e &&
        ((t.source.style.addressModeU = te[e].addressModeU),
        (t.source.style.addressModeV = te[e].addressModeV)));
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
var hn = cn,
  vt = { a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0 },
  ln = /([astvzqmhlc])([^astvzqmhlc]*)/gi;
function cn(s) {
  var t = [];
  return (
    s.replace(ln, function (e, n, i) {
      var r = n.toLowerCase();
      for (
        i = dn(i),
          r == 'm' &&
            i.length > 2 &&
            (t.push([n].concat(i.splice(0, 2))), (r = 'l'), (n = n == 'm' ? 'l' : 'L'));
        ;

      ) {
        if (i.length == vt[r]) return (i.unshift(n), t.push(i));
        if (i.length < vt[r]) throw new Error('malformed path data');
        t.push([n].concat(i.splice(0, vt[r])));
      }
    }),
    t
  );
}
var un = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;
function dn(s) {
  var t = s.match(un);
  return t ? t.map(Number) : [];
}
const fn = Be(hn);
function xn(s, t) {
  const e = fn(s),
    n = [];
  let i = null,
    r = 0,
    o = 0;
  for (let a = 0; a < e.length; a++) {
    const h = e[a],
      c = h[0],
      l = h;
    switch (c) {
      case 'M':
        ((r = l[1]), (o = l[2]), t.moveTo(r, o));
        break;
      case 'm':
        ((r += l[1]), (o += l[2]), t.moveTo(r, o));
        break;
      case 'H':
        ((r = l[1]), t.lineTo(r, o));
        break;
      case 'h':
        ((r += l[1]), t.lineTo(r, o));
        break;
      case 'V':
        ((o = l[1]), t.lineTo(r, o));
        break;
      case 'v':
        ((o += l[1]), t.lineTo(r, o));
        break;
      case 'L':
        ((r = l[1]), (o = l[2]), t.lineTo(r, o));
        break;
      case 'l':
        ((r += l[1]), (o += l[2]), t.lineTo(r, o));
        break;
      case 'C':
        ((r = l[5]), (o = l[6]), t.bezierCurveTo(l[1], l[2], l[3], l[4], r, o));
        break;
      case 'c':
        (t.bezierCurveTo(r + l[1], o + l[2], r + l[3], o + l[4], r + l[5], o + l[6]),
          (r += l[5]),
          (o += l[6]));
        break;
      case 'S':
        ((r = l[3]), (o = l[4]), t.bezierCurveToShort(l[1], l[2], r, o));
        break;
      case 's':
        (t.bezierCurveToShort(r + l[1], o + l[2], r + l[3], o + l[4]), (r += l[3]), (o += l[4]));
        break;
      case 'Q':
        ((r = l[3]), (o = l[4]), t.quadraticCurveTo(l[1], l[2], r, o));
        break;
      case 'q':
        (t.quadraticCurveTo(r + l[1], o + l[2], r + l[3], o + l[4]), (r += l[3]), (o += l[4]));
        break;
      case 'T':
        ((r = l[1]), (o = l[2]), t.quadraticCurveToShort(r, o));
        break;
      case 't':
        ((r += l[1]), (o += l[2]), t.quadraticCurveToShort(r, o));
        break;
      case 'A':
        ((r = l[6]), (o = l[7]), t.arcToSvg(l[1], l[2], l[3], l[4], l[5], r, o));
        break;
      case 'a':
        ((r += l[6]), (o += l[7]), t.arcToSvg(l[1], l[2], l[3], l[4], l[5], r, o));
        break;
      case 'Z':
      case 'z':
        (t.closePath(),
          n.length > 0 &&
            ((i = n.pop()), i ? ((r = i.startX), (o = i.startY)) : ((r = 0), (o = 0))),
          (i = null));
        break;
      default:
        dt(`Unknown SVG path command: ${c}`);
    }
    c !== 'Z' && c !== 'z' && i === null && ((i = { startX: r, startY: o }), n.push(i));
  }
  return t;
}
class Bt {
  constructor(t = 0, e = 0, n = 0) {
    ((this.type = 'circle'), (this.x = t), (this.y = e), (this.radius = n));
  }
  clone() {
    return new Bt(this.x, this.y, this.radius);
  }
  contains(t, e) {
    if (this.radius <= 0) return !1;
    const n = this.radius * this.radius;
    let i = this.x - t,
      r = this.y - e;
    return ((i *= i), (r *= r), i + r <= n);
  }
  strokeContains(t, e, n, i = 0.5) {
    if (this.radius === 0) return !1;
    const r = this.x - t,
      o = this.y - e,
      a = this.radius,
      h = (1 - i) * n,
      c = Math.sqrt(r * r + o * o);
    return c <= a + h && c > a - (n - h);
  }
  getBounds(t) {
    return (
      t || (t = new W()),
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
class Et {
  constructor(t = 0, e = 0, n = 0, i = 0) {
    ((this.type = 'ellipse'),
      (this.x = t),
      (this.y = e),
      (this.halfWidth = n),
      (this.halfHeight = i));
  }
  clone() {
    return new Et(this.x, this.y, this.halfWidth, this.halfHeight);
  }
  contains(t, e) {
    if (this.halfWidth <= 0 || this.halfHeight <= 0) return !1;
    let n = (t - this.x) / this.halfWidth,
      i = (e - this.y) / this.halfHeight;
    return ((n *= n), (i *= i), n + i <= 1);
  }
  strokeContains(t, e, n, i = 0.5) {
    const { halfWidth: r, halfHeight: o } = this;
    if (r <= 0 || o <= 0) return !1;
    const a = n * (1 - i),
      h = n - a,
      c = r - h,
      l = o - h,
      d = r + a,
      f = o + a,
      u = t - this.x,
      x = e - this.y,
      y = (u * u) / (c * c) + (x * x) / (l * l),
      p = (u * u) / (d * d) + (x * x) / (f * f);
    return y > 1 && p <= 1;
  }
  getBounds(t) {
    return (
      t || (t = new W()),
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
function yn(s, t, e, n, i, r) {
  const o = s - e,
    a = t - n,
    h = i - e,
    c = r - n,
    l = o * h + a * c,
    d = h * h + c * c;
  let f = -1;
  d !== 0 && (f = l / d);
  let u, x;
  f < 0 ? ((u = e), (x = n)) : f > 1 ? ((u = i), (x = r)) : ((u = e + f * h), (x = n + f * c));
  const y = s - u,
    p = t - x;
  return y * y + p * p;
}
let pn, gn;
class ct {
  constructor(...t) {
    this.type = 'polygon';
    let e = Array.isArray(t[0]) ? t[0] : t;
    if (typeof e[0] != 'number') {
      const n = [];
      for (let i = 0, r = e.length; i < r; i++) n.push(e[i].x, e[i].y);
      e = n;
    }
    ((this.points = e), (this.closePath = !0));
  }
  isClockwise() {
    let t = 0;
    const e = this.points,
      n = e.length;
    for (let i = 0; i < n; i += 2) {
      const r = e[i],
        o = e[i + 1],
        a = e[(i + 2) % n],
        h = e[(i + 3) % n];
      t += (a - r) * (h + o);
    }
    return t < 0;
  }
  containsPolygon(t) {
    const e = this.getBounds(pn),
      n = t.getBounds(gn);
    if (!e.containsRect(n)) return !1;
    const i = t.points;
    for (let r = 0; r < i.length; r += 2) {
      const o = i[r],
        a = i[r + 1];
      if (!this.contains(o, a)) return !1;
    }
    return !0;
  }
  clone() {
    const t = this.points.slice(),
      e = new ct(t);
    return ((e.closePath = this.closePath), e);
  }
  contains(t, e) {
    let n = !1;
    const i = this.points.length / 2;
    for (let r = 0, o = i - 1; r < i; o = r++) {
      const a = this.points[r * 2],
        h = this.points[r * 2 + 1],
        c = this.points[o * 2],
        l = this.points[o * 2 + 1];
      h > e != l > e && t < (c - a) * ((e - h) / (l - h)) + a && (n = !n);
    }
    return n;
  }
  strokeContains(t, e, n, i = 0.5) {
    const r = n * n,
      o = r * (1 - i),
      a = r - o,
      { points: h } = this,
      c = h.length - (this.closePath ? 0 : 2);
    for (let l = 0; l < c; l += 2) {
      const d = h[l],
        f = h[l + 1],
        u = h[(l + 2) % h.length],
        x = h[(l + 3) % h.length],
        y = yn(t, e, d, f, u, x),
        p = Math.sign((u - d) * (e - f) - (x - f) * (t - d));
      if (y <= (p < 0 ? a : o)) return !0;
    }
    return !1;
  }
  getBounds(t) {
    t || (t = new W());
    const e = this.points;
    let n = 1 / 0,
      i = -1 / 0,
      r = 1 / 0,
      o = -1 / 0;
    for (let a = 0, h = e.length; a < h; a += 2) {
      const c = e[a],
        l = e[a + 1];
      ((n = c < n ? c : n), (i = c > i ? c : i), (r = l < r ? l : r), (o = l > o ? l : o));
    }
    return ((t.x = n), (t.width = i - n), (t.y = r), (t.height = o - r), t);
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
      D('8.11.0', 'Polygon.lastX is deprecated, please use Polygon.lastX instead.'),
      this.points[this.points.length - 2]
    );
  }
  get y() {
    return (
      D('8.11.0', 'Polygon.y is deprecated, please use Polygon.lastY instead.'),
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
const St = (s, t, e, n, i, r, o) => {
  const a = s - e,
    h = t - n,
    c = Math.sqrt(a * a + h * h);
  return c >= i - r && c <= i + o;
};
class Vt {
  constructor(t = 0, e = 0, n = 0, i = 0, r = 20) {
    ((this.type = 'roundedRectangle'),
      (this.x = t),
      (this.y = e),
      (this.width = n),
      (this.height = i),
      (this.radius = r));
  }
  getBounds(t) {
    return (
      t || (t = new W()),
      (t.x = this.x),
      (t.y = this.y),
      (t.width = this.width),
      (t.height = this.height),
      t
    );
  }
  clone() {
    return new Vt(this.x, this.y, this.width, this.height, this.radius);
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
      const n = Math.max(0, Math.min(this.radius, Math.min(this.width, this.height) / 2));
      if (
        (e >= this.y + n && e <= this.y + this.height - n) ||
        (t >= this.x + n && t <= this.x + this.width - n)
      )
        return !0;
      let i = t - (this.x + n),
        r = e - (this.y + n);
      const o = n * n;
      if (
        i * i + r * r <= o ||
        ((i = t - (this.x + this.width - n)), i * i + r * r <= o) ||
        ((r = e - (this.y + this.height - n)), i * i + r * r <= o) ||
        ((i = t - (this.x + n)), i * i + r * r <= o)
      )
        return !0;
    }
    return !1;
  }
  strokeContains(t, e, n, i = 0.5) {
    const { x: r, y: o, width: a, height: h, radius: c } = this,
      l = n * (1 - i),
      d = n - l,
      f = r + c,
      u = o + c,
      x = a - c * 2,
      y = h - c * 2,
      p = r + a,
      _ = o + h;
    return (((t >= r - l && t <= r + d) || (t >= p - d && t <= p + l)) && e >= u && e <= u + y) ||
      (((e >= o - l && e <= o + d) || (e >= _ - d && e <= _ + l)) && t >= f && t <= f + x)
      ? !0
      : (t < f && e < u && St(t, e, f, u, c, d, l)) ||
          (t > p - c && e < u && St(t, e, p - c, u, c, d, l)) ||
          (t > p - c && e > _ - c && St(t, e, p - c, _ - c, c, d, l)) ||
          (t < f && e > _ - c && St(t, e, f, _ - c, c, d, l));
  }
  toString() {
    return `[pixi.js/math:RoundedRectangle x=${this.x} y=${this.y}width=${this.width} height=${this.height} radius=${this.radius}]`;
  }
}
function mn(s, t, e, n, i, r, o, a = null) {
  let h = 0;
  ((e *= t), (i *= r));
  const c = a.a,
    l = a.b,
    d = a.c,
    f = a.d,
    u = a.tx,
    x = a.ty;
  for (; h < o; ) {
    const y = s[e],
      p = s[e + 1];
    ((n[i] = c * y + d * p + u), (n[i + 1] = l * y + f * p + x), (i += r), (e += t), h++);
  }
}
function _n(s, t, e, n) {
  let i = 0;
  for (t *= e; i < n; ) ((s[t] = 0), (s[t + 1] = 0), (t += e), i++);
}
function be(s, t, e, n, i) {
  const r = t.a,
    o = t.b,
    a = t.c,
    h = t.d,
    c = t.tx,
    l = t.ty;
  (e || (e = 0), n || (n = 2), i || (i = s.length / n - e));
  let d = e * n;
  for (let f = 0; f < i; f++) {
    const u = s[d],
      x = s[d + 1];
    ((s[d] = r * u + a * x + c), (s[d + 1] = o * u + h * x + l), (d += n));
  }
}
const bn = new B();
class Pe {
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
      n = this.renderable;
    return n
      ? He(e, n.groupColor) + ((this.alpha * n.groupAlpha * 255) << 24)
      : e + ((this.alpha * 255) << 24);
  }
  get transform() {
    return this.renderable?.groupTransform || bn;
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
const pt = {
    extension: { type: V.ShapeBuilder, name: 'circle' },
    build(s, t) {
      let e, n, i, r, o, a;
      if (s.type === 'circle') {
        const m = s;
        if (((o = a = m.radius), o <= 0)) return !1;
        ((e = m.x), (n = m.y), (i = r = 0));
      } else if (s.type === 'ellipse') {
        const m = s;
        if (((o = m.halfWidth), (a = m.halfHeight), o <= 0 || a <= 0)) return !1;
        ((e = m.x), (n = m.y), (i = r = 0));
      } else {
        const m = s,
          k = m.width / 2,
          P = m.height / 2;
        ((e = m.x + k),
          (n = m.y + P),
          (o = a = Math.max(0, Math.min(m.radius, Math.min(k, P)))),
          (i = k - o),
          (r = P - a));
      }
      if (i < 0 || r < 0) return !1;
      const h = Math.ceil(2.3 * Math.sqrt(o + a)),
        c = h * 8 + (i ? 4 : 0) + (r ? 4 : 0);
      if (c === 0) return !1;
      if (h === 0)
        return (
          (t[0] = t[6] = e + i),
          (t[1] = t[3] = n + r),
          (t[2] = t[4] = e - i),
          (t[5] = t[7] = n - r),
          !0
        );
      let l = 0,
        d = h * 4 + (i ? 2 : 0) + 2,
        f = d,
        u = c,
        x = i + o,
        y = r,
        p = e + x,
        _ = e - x,
        g = n + y;
      if (((t[l++] = p), (t[l++] = g), (t[--d] = g), (t[--d] = _), r)) {
        const m = n - y;
        ((t[f++] = _), (t[f++] = m), (t[--u] = m), (t[--u] = p));
      }
      for (let m = 1; m < h; m++) {
        const k = (Math.PI / 2) * (m / h),
          P = i + Math.cos(k) * o,
          b = r + Math.sin(k) * a,
          R = e + P,
          v = e - P,
          S = n + b,
          C = n - b;
        ((t[l++] = R),
          (t[l++] = S),
          (t[--d] = S),
          (t[--d] = v),
          (t[f++] = v),
          (t[f++] = C),
          (t[--u] = C),
          (t[--u] = R));
      }
      ((x = i), (y = r + a), (p = e + x), (_ = e - x), (g = n + y));
      const M = n - y;
      return (
        (t[l++] = p),
        (t[l++] = g),
        (t[--u] = M),
        (t[--u] = p),
        i && ((t[l++] = _), (t[l++] = g), (t[--u] = M), (t[--u] = _)),
        !0
      );
    },
    triangulate(s, t, e, n, i, r) {
      if (s.length === 0) return;
      let o = 0,
        a = 0;
      for (let l = 0; l < s.length; l += 2) ((o += s[l]), (a += s[l + 1]));
      ((o /= s.length / 2), (a /= s.length / 2));
      let h = n;
      ((t[h * e] = o), (t[h * e + 1] = a));
      const c = h++;
      for (let l = 0; l < s.length; l += 2)
        ((t[h * e] = s[l]),
          (t[h * e + 1] = s[l + 1]),
          l > 0 && ((i[r++] = h), (i[r++] = c), (i[r++] = h - 1)),
          h++);
      ((i[r++] = c + 1), (i[r++] = c), (i[r++] = h - 1));
    },
  },
  Pn = { ...pt, extension: { ...pt.extension, name: 'ellipse' } },
  Mn = { ...pt, extension: { ...pt.extension, name: 'roundedRectangle' } },
  Me = 1e-4,
  ee = 1e-4;
function Sn(s) {
  const t = s.length;
  if (t < 6) return 1;
  let e = 0;
  for (let n = 0, i = s[t - 2], r = s[t - 1]; n < t; n += 2) {
    const o = s[n],
      a = s[n + 1];
    ((e += (o - i) * (a + r)), (i = o), (r = a));
  }
  return e < 0 ? -1 : 1;
}
function ne(s, t, e, n, i, r, o, a) {
  const h = s - e * i,
    c = t - n * i,
    l = s + e * r,
    d = t + n * r;
  let f, u;
  o ? ((f = n), (u = -e)) : ((f = -n), (u = e));
  const x = h + f,
    y = c + u,
    p = l + f,
    _ = d + u;
  return (a.push(x, y), a.push(p, _), 2);
}
function X(s, t, e, n, i, r, o, a) {
  const h = e - s,
    c = n - t;
  let l = Math.atan2(h, c),
    d = Math.atan2(i - s, r - t);
  a && l < d ? (l += Math.PI * 2) : !a && l > d && (d += Math.PI * 2);
  let f = l;
  const u = d - l,
    x = Math.abs(u),
    y = Math.sqrt(h * h + c * c),
    p = (((15 * x * Math.sqrt(y)) / Math.PI) >> 0) + 1,
    _ = u / p;
  if (((f += _), a)) {
    (o.push(s, t), o.push(e, n));
    for (let g = 1, M = f; g < p; g++, M += _)
      (o.push(s, t), o.push(s + Math.sin(M) * y, t + Math.cos(M) * y));
    (o.push(s, t), o.push(i, r));
  } else {
    (o.push(e, n), o.push(s, t));
    for (let g = 1, M = f; g < p; g++, M += _)
      (o.push(s + Math.sin(M) * y, t + Math.cos(M) * y), o.push(s, t));
    (o.push(i, r), o.push(s, t));
  }
  return p * 2;
}
function Cn(s, t, e, n, i, r) {
  const o = Me;
  if (s.length === 0) return;
  const a = t;
  let h = a.alignment;
  if (t.alignment !== 0.5) {
    let G = Sn(s);
    h = (h - 0.5) * G + 0.5;
  }
  const c = new Q(s[0], s[1]),
    l = new Q(s[s.length - 2], s[s.length - 1]),
    d = n,
    f = Math.abs(c.x - l.x) < o && Math.abs(c.y - l.y) < o;
  if (d) {
    ((s = s.slice()), f && (s.pop(), s.pop(), l.set(s[s.length - 2], s[s.length - 1])));
    const G = (c.x + l.x) * 0.5,
      E = (l.y + c.y) * 0.5;
    (s.unshift(G, E), s.push(G, E));
  }
  const u = i,
    x = s.length / 2;
  let y = s.length;
  const p = u.length / 2,
    _ = a.width / 2,
    g = _ * _,
    M = a.miterLimit * a.miterLimit;
  let m = s[0],
    k = s[1],
    P = s[2],
    b = s[3],
    R = 0,
    v = 0,
    S = -(k - b),
    C = m - P,
    F = 0,
    z = 0,
    L = Math.sqrt(S * S + C * C);
  ((S /= L), (C /= L), (S *= _), (C *= _));
  const tt = h,
    w = (1 - tt) * 2,
    T = tt * 2;
  (d ||
    (a.cap === 'round'
      ? (y +=
          X(
            m - S * (w - T) * 0.5,
            k - C * (w - T) * 0.5,
            m - S * w,
            k - C * w,
            m + S * T,
            k + C * T,
            u,
            !0,
          ) + 2)
      : a.cap === 'square' && (y += ne(m, k, S, C, w, T, !0, u))),
    u.push(m - S * w, k - C * w),
    u.push(m + S * T, k + C * T));
  for (let G = 1; G < x - 1; ++G) {
    ((m = s[(G - 1) * 2]),
      (k = s[(G - 1) * 2 + 1]),
      (P = s[G * 2]),
      (b = s[G * 2 + 1]),
      (R = s[(G + 1) * 2]),
      (v = s[(G + 1) * 2 + 1]),
      (S = -(k - b)),
      (C = m - P),
      (L = Math.sqrt(S * S + C * C)),
      (S /= L),
      (C /= L),
      (S *= _),
      (C *= _),
      (F = -(b - v)),
      (z = P - R),
      (L = Math.sqrt(F * F + z * z)),
      (F /= L),
      (z /= L),
      (F *= _),
      (z *= _));
    const E = P - m,
      et = k - b,
      nt = P - R,
      st = v - b,
      Ut = E * nt + et * st,
      mt = et * nt - st * E,
      it = mt < 0;
    if (Math.abs(mt) < 0.001 * Math.abs(Ut)) {
      (u.push(P - S * w, b - C * w),
        u.push(P + S * T, b + C * T),
        Ut >= 0 &&
          (a.join === 'round'
            ? (y += X(P, b, P - S * w, b - C * w, P - F * w, b - z * w, u, !1) + 4)
            : (y += 2),
          u.push(P - F * T, b - z * T),
          u.push(P + F * w, b + z * w)));
      continue;
    }
    const Zt = (-S + m) * (-C + b) - (-S + P) * (-C + k),
      $t = (-F + R) * (-z + b) - (-F + P) * (-z + v),
      _t = (E * $t - nt * Zt) / mt,
      bt = (st * Zt - et * $t) / mt,
      Tt = (_t - P) * (_t - P) + (bt - b) * (bt - b),
      U = P + (_t - P) * w,
      Z = b + (bt - b) * w,
      $ = P - (_t - P) * T,
      N = b - (bt - b) * T,
      Ge = Math.min(E * E + et * et, nt * nt + st * st),
      Nt = it ? w : T,
      Ie = Ge + Nt * Nt * g;
    Tt <= Ie
      ? a.join === 'bevel' || Tt / g > M
        ? (it
            ? (u.push(U, Z),
              u.push(P + S * T, b + C * T),
              u.push(U, Z),
              u.push(P + F * T, b + z * T))
            : (u.push(P - S * w, b - C * w),
              u.push($, N),
              u.push(P - F * w, b - z * w),
              u.push($, N)),
          (y += 2))
        : a.join === 'round'
          ? it
            ? (u.push(U, Z),
              u.push(P + S * T, b + C * T),
              (y += X(P, b, P + S * T, b + C * T, P + F * T, b + z * T, u, !0) + 4),
              u.push(U, Z),
              u.push(P + F * T, b + z * T))
            : (u.push(P - S * w, b - C * w),
              u.push($, N),
              (y += X(P, b, P - S * w, b - C * w, P - F * w, b - z * w, u, !1) + 4),
              u.push(P - F * w, b - z * w),
              u.push($, N))
          : (u.push(U, Z), u.push($, N))
      : (u.push(P - S * w, b - C * w),
        u.push(P + S * T, b + C * T),
        a.join === 'round'
          ? it
            ? (y += X(P, b, P + S * T, b + C * T, P + F * T, b + z * T, u, !0) + 2)
            : (y += X(P, b, P - S * w, b - C * w, P - F * w, b - z * w, u, !1) + 2)
          : a.join === 'miter' &&
            Tt / g <= M &&
            (it ? (u.push($, N), u.push($, N)) : (u.push(U, Z), u.push(U, Z)), (y += 2)),
        u.push(P - F * w, b - z * w),
        u.push(P + F * T, b + z * T),
        (y += 2));
  }
  ((m = s[(x - 2) * 2]),
    (k = s[(x - 2) * 2 + 1]),
    (P = s[(x - 1) * 2]),
    (b = s[(x - 1) * 2 + 1]),
    (S = -(k - b)),
    (C = m - P),
    (L = Math.sqrt(S * S + C * C)),
    (S /= L),
    (C /= L),
    (S *= _),
    (C *= _),
    u.push(P - S * w, b - C * w),
    u.push(P + S * T, b + C * T),
    d ||
      (a.cap === 'round'
        ? (y +=
            X(
              P - S * (w - T) * 0.5,
              b - C * (w - T) * 0.5,
              P - S * w,
              b - C * w,
              P + S * T,
              b + C * T,
              u,
              !1,
            ) + 2)
        : a.cap === 'square' && (y += ne(P, b, S, C, w, T, !1, u))));
  const Re = ee * ee;
  for (let G = p; G < y + p - 2; ++G)
    ((m = u[G * 2]),
      (k = u[G * 2 + 1]),
      (P = u[(G + 1) * 2]),
      (b = u[(G + 1) * 2 + 1]),
      (R = u[(G + 2) * 2]),
      (v = u[(G + 2) * 2 + 1]),
      !(Math.abs(m * (b - v) + P * (v - k) + R * (k - b)) < Re) && r.push(G, G + 1, G + 2));
}
function kn(s, t, e, n) {
  const i = Me;
  if (s.length === 0) return;
  const r = s[0],
    o = s[1],
    a = s[s.length - 2],
    h = s[s.length - 1],
    c = t || (Math.abs(r - a) < i && Math.abs(o - h) < i),
    l = e,
    d = s.length / 2,
    f = l.length / 2;
  for (let u = 0; u < d; u++) (l.push(s[u * 2]), l.push(s[u * 2 + 1]));
  for (let u = 0; u < d - 1; u++) n.push(f + u, f + u + 1);
  c && n.push(f + d - 1, f);
}
function Se(s, t, e, n, i, r, o) {
  const a = rn(s, t, 2);
  if (!a) return;
  for (let c = 0; c < a.length; c += 3)
    ((r[o++] = a[c] + i), (r[o++] = a[c + 1] + i), (r[o++] = a[c + 2] + i));
  let h = i * n;
  for (let c = 0; c < s.length; c += 2) ((e[h] = s[c]), (e[h + 1] = s[c + 1]), (h += n));
}
const wn = [],
  Tn = {
    extension: { type: V.ShapeBuilder, name: 'polygon' },
    build(s, t) {
      for (let e = 0; e < s.points.length; e++) t[e] = s.points[e];
      return !0;
    },
    triangulate(s, t, e, n, i, r) {
      Se(s, wn, t, e, n, i, r);
    },
  },
  vn = {
    extension: { type: V.ShapeBuilder, name: 'rectangle' },
    build(s, t) {
      const e = s,
        n = e.x,
        i = e.y,
        r = e.width,
        o = e.height;
      return r > 0 && o > 0
        ? ((t[0] = n),
          (t[1] = i),
          (t[2] = n + r),
          (t[3] = i),
          (t[4] = n + r),
          (t[5] = i + o),
          (t[6] = n),
          (t[7] = i + o),
          !0)
        : !1;
    },
    triangulate(s, t, e, n, i, r) {
      let o = 0;
      ((n *= e),
        (t[n + o] = s[0]),
        (t[n + o + 1] = s[1]),
        (o += e),
        (t[n + o] = s[2]),
        (t[n + o + 1] = s[3]),
        (o += e),
        (t[n + o] = s[6]),
        (t[n + o + 1] = s[7]),
        (o += e),
        (t[n + o] = s[4]),
        (t[n + o + 1] = s[5]),
        (o += e));
      const a = n / e;
      ((i[r++] = a),
        (i[r++] = a + 1),
        (i[r++] = a + 2),
        (i[r++] = a + 1),
        (i[r++] = a + 3),
        (i[r++] = a + 2));
    },
  },
  Rn = {
    extension: { type: V.ShapeBuilder, name: 'triangle' },
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
    triangulate(s, t, e, n, i, r) {
      let o = 0;
      ((n *= e),
        (t[n + o] = s[0]),
        (t[n + o + 1] = s[1]),
        (o += e),
        (t[n + o] = s[2]),
        (t[n + o + 1] = s[3]),
        (o += e),
        (t[n + o] = s[4]),
        (t[n + o + 1] = s[5]));
      const a = n / e;
      ((i[r++] = a), (i[r++] = a + 1), (i[r++] = a + 2));
    },
  },
  Gn = new B(),
  In = new W();
function Fn(s, t, e, n) {
  const i = t.matrix ? s.copyFrom(t.matrix).invert() : s.identity();
  if (t.textureSpace === 'local') {
    const o = e.getBounds(In);
    t.width && o.pad(t.width);
    const { x: a, y: h } = o,
      c = 1 / o.width,
      l = 1 / o.height,
      d = -a * c,
      f = -h * l,
      u = i.a,
      x = i.b,
      y = i.c,
      p = i.d;
    ((i.a *= c),
      (i.b *= c),
      (i.c *= l),
      (i.d *= l),
      (i.tx = d * u + f * y + i.tx),
      (i.ty = d * x + f * p + i.ty));
  } else
    (i.translate(t.texture.frame.x, t.texture.frame.y),
      i.scale(1 / t.texture.source.width, 1 / t.texture.source.height));
  const r = t.texture.source.style;
  return (
    !(t.fill instanceof gt) &&
      r.addressMode === 'clamp-to-edge' &&
      ((r.addressMode = 'repeat'), r.update()),
    n && i.append(Gn.copyFrom(n).invert()),
    i
  );
}
const wt = {};
xe.handleByMap(V.ShapeBuilder, wt);
xe.add(vn, Tn, Rn, pt, Pn, Mn);
const zn = new W(),
  Hn = new B();
function Ln(s, t) {
  const { geometryData: e, batches: n } = t;
  ((n.length = 0), (e.indices.length = 0), (e.vertices.length = 0), (e.uvs.length = 0));
  for (let i = 0; i < s.instructions.length; i++) {
    const r = s.instructions[i];
    if (r.action === 'texture') Dn(r.data, n, e);
    else if (r.action === 'fill' || r.action === 'stroke') {
      const o = r.action === 'stroke',
        a = r.data.path.shapePath,
        h = r.data.style,
        c = r.data.hole;
      (o && c && se(c.shapePath, h, !0, n, e),
        c && (a.shapePrimitives[a.shapePrimitives.length - 1].holes = c.shapePath.shapePrimitives),
        se(a, h, o, n, e));
    }
  }
}
function Dn(s, t, e) {
  const n = [],
    i = wt.rectangle,
    r = zn;
  ((r.x = s.dx), (r.y = s.dy), (r.width = s.dw), (r.height = s.dh));
  const o = s.transform;
  if (!i.build(r, n)) return;
  const { vertices: a, uvs: h, indices: c } = e,
    l = c.length,
    d = a.length / 2;
  (o && be(n, o), i.triangulate(n, a, 2, d, c, l));
  const f = s.image,
    u = f.uvs;
  h.push(u.x0, u.y0, u.x1, u.y1, u.x3, u.y3, u.x2, u.y2);
  const x = lt.get(Pe);
  ((x.indexOffset = l),
    (x.indexSize = c.length - l),
    (x.attributeOffset = d),
    (x.attributeSize = a.length / 2 - d),
    (x.baseColor = s.style),
    (x.alpha = s.alpha),
    (x.texture = f),
    (x.geometryData = e),
    t.push(x));
}
function se(s, t, e, n, i) {
  const { vertices: r, uvs: o, indices: a } = i;
  s.shapePrimitives.forEach(({ shape: h, transform: c, holes: l }) => {
    const d = [],
      f = wt[h.type];
    if (!f.build(h, d)) return;
    const u = a.length,
      x = r.length / 2;
    let y = 'triangle-list';
    if ((c && be(d, c), e)) {
      const M = h.closePath ?? !0,
        m = t;
      m.pixelLine ? (kn(d, M, r, a), (y = 'line-list')) : Cn(d, m, !1, M, r, a);
    } else if (l) {
      const M = [],
        m = d.slice();
      (An(l).forEach((P) => {
        (M.push(m.length / 2), m.push(...P));
      }),
        Se(m, M, r, 2, x, a, u));
    } else f.triangulate(d, r, 2, x, a, u);
    const p = o.length / 2,
      _ = t.texture;
    if (_ !== Y.WHITE) {
      const M = Fn(Hn, t, h, c);
      mn(r, 2, x, o, p, 2, r.length / 2 - x, M);
    } else _n(o, p, 2, r.length / 2 - x);
    const g = lt.get(Pe);
    ((g.indexOffset = u),
      (g.indexSize = a.length - u),
      (g.attributeOffset = x),
      (g.attributeSize = r.length / 2 - x),
      (g.baseColor = t.color),
      (g.alpha = t.alpha),
      (g.texture = _),
      (g.geometryData = i),
      (g.topology = y),
      n.push(g));
  });
}
function An(s) {
  const t = [];
  for (let e = 0; e < s.length; e++) {
    const n = s[e].shape,
      i = [];
    wt[n.type].build(n, i) && t.push(i);
  }
  return t;
}
class qn {
  constructor() {
    ((this.batches = []), (this.geometryData = { vertices: [], uvs: [], indices: [] }));
  }
}
class Bn {
  constructor() {
    this.instructions = new Le();
  }
  init(t) {
    ((this.batcher = new Ve({ maxTextures: t })), this.instructions.reset());
  }
  get geometry() {
    return (
      D(
        De,
        'GraphicsContextRenderData#geometry is deprecated, please use batcher.geometry instead.',
      ),
      this.batcher.geometry
    );
  }
}
const jt = class Ht {
  constructor(t) {
    ((this._gpuContextHash = {}),
      (this._graphicsDataContextHash = Object.create(null)),
      (this._renderer = t),
      t.renderableGC.addManagedHash(this, '_gpuContextHash'),
      t.renderableGC.addManagedHash(this, '_graphicsDataContextHash'));
  }
  init(t) {
    Ht.defaultOptions.bezierSmoothness = t?.bezierSmoothness ?? Ht.defaultOptions.bezierSmoothness;
  }
  getContextRenderData(t) {
    return this._graphicsDataContextHash[t.uid] || this._initContextRenderData(t);
  }
  updateGpuContext(t) {
    let e = this._gpuContextHash[t.uid] || this._initContext(t);
    if (t.dirty) {
      (e ? this._cleanGraphicsContextData(t) : (e = this._initContext(t)), Ln(t, e));
      const n = t.batchMode;
      (t.customShader || n === 'no-batch'
        ? (e.isBatchable = !1)
        : n === 'auto'
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
    const e = lt.get(Bn, { maxTextures: this._renderer.limits.maxBatchableTextures }),
      { batches: n, geometryData: i } = this._gpuContextHash[t.uid],
      r = i.vertices.length,
      o = i.indices.length;
    for (let l = 0; l < n.length; l++) n[l].applyTransform = !1;
    const a = e.batcher;
    (a.ensureAttributeBuffer(r), a.ensureIndexBuffer(o), a.begin());
    for (let l = 0; l < n.length; l++) {
      const d = n[l];
      a.add(d);
    }
    a.finish(e.instructions);
    const h = a.geometry;
    (h.indexBuffer.setDataWithSize(a.indexBuffer, a.indexSize, !0),
      h.buffers[0].setDataWithSize(a.attributeBuffer.float32View, a.attributeSize, !0));
    const c = a.batches;
    for (let l = 0; l < c.length; l++) {
      const d = c[l];
      d.bindGroup = Ee(
        d.textures.textures,
        d.textures.count,
        this._renderer.limits.maxBatchableTextures,
      );
    }
    return ((this._graphicsDataContextHash[t.uid] = e), e);
  }
  _initContext(t) {
    const e = new qn();
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
        e.batches.forEach((n) => {
          lt.return(n);
        }));
  }
  destroy() {
    for (const t in this._gpuContextHash)
      this._gpuContextHash[t] && this.onGraphicsContextDestroy(this._gpuContextHash[t].context);
  }
};
jt.extension = { type: [V.WebGLSystem, V.WebGPUSystem, V.CanvasSystem], name: 'graphicsContext' };
jt.defaultOptions = { bezierSmoothness: 0.5 };
let Ce = jt;
const En = 8,
  Ct = 11920929e-14,
  Vn = 1;
function ke(s, t, e, n, i, r, o, a, h, c) {
  const d = Math.min(0.99, Math.max(0, c ?? Ce.defaultOptions.bezierSmoothness));
  let f = (Vn - d) / 1;
  return ((f *= f), jn(t, e, n, i, r, o, a, h, s, f), s);
}
function jn(s, t, e, n, i, r, o, a, h, c) {
  (Lt(s, t, e, n, i, r, o, a, h, c, 0), h.push(o, a));
}
function Lt(s, t, e, n, i, r, o, a, h, c, l) {
  if (l > En) return;
  const d = (s + e) / 2,
    f = (t + n) / 2,
    u = (e + i) / 2,
    x = (n + r) / 2,
    y = (i + o) / 2,
    p = (r + a) / 2,
    _ = (d + u) / 2,
    g = (f + x) / 2,
    M = (u + y) / 2,
    m = (x + p) / 2,
    k = (_ + M) / 2,
    P = (g + m) / 2;
  if (l > 0) {
    let b = o - s,
      R = a - t;
    const v = Math.abs((e - o) * R - (n - a) * b),
      S = Math.abs((i - o) * R - (r - a) * b);
    if (v > Ct && S > Ct) {
      if ((v + S) * (v + S) <= c * (b * b + R * R)) {
        h.push(k, P);
        return;
      }
    } else if (v > Ct) {
      if (v * v <= c * (b * b + R * R)) {
        h.push(k, P);
        return;
      }
    } else if (S > Ct) {
      if (S * S <= c * (b * b + R * R)) {
        h.push(k, P);
        return;
      }
    } else if (((b = k - (s + o) / 2), (R = P - (t + a) / 2), b * b + R * R <= c)) {
      h.push(k, P);
      return;
    }
  }
  (Lt(s, t, d, f, _, g, k, P, h, c, l + 1), Lt(k, P, M, m, y, p, o, a, h, c, l + 1));
}
const Wn = 8,
  Un = 11920929e-14,
  Zn = 1;
function $n(s, t, e, n, i, r, o, a) {
  const c = Math.min(0.99, Math.max(0, a ?? Ce.defaultOptions.bezierSmoothness));
  let l = (Zn - c) / 1;
  return ((l *= l), Nn(t, e, n, i, r, o, s, l), s);
}
function Nn(s, t, e, n, i, r, o, a) {
  (Dt(o, s, t, e, n, i, r, a, 0), o.push(i, r));
}
function Dt(s, t, e, n, i, r, o, a, h) {
  if (h > Wn) return;
  const c = (t + n) / 2,
    l = (e + i) / 2,
    d = (n + r) / 2,
    f = (i + o) / 2,
    u = (c + d) / 2,
    x = (l + f) / 2;
  let y = r - t,
    p = o - e;
  const _ = Math.abs((n - r) * p - (i - o) * y);
  if (_ > Un) {
    if (_ * _ <= a * (y * y + p * p)) {
      s.push(u, x);
      return;
    }
  } else if (((y = u - (t + r) / 2), (p = x - (e + o) / 2), y * y + p * p <= a)) {
    s.push(u, x);
    return;
  }
  (Dt(s, t, e, c, l, u, x, a, h + 1), Dt(s, u, x, d, f, r, o, a, h + 1));
}
function we(s, t, e, n, i, r, o, a) {
  let h = Math.abs(i - r);
  (((!o && i > r) || (o && r > i)) && (h = 2 * Math.PI - h),
    a || (a = Math.max(6, Math.floor(6 * Math.pow(n, 1 / 3) * (h / Math.PI)))),
    (a = Math.max(a, 3)));
  let c = h / a,
    l = i;
  c *= o ? -1 : 1;
  for (let d = 0; d < a + 1; d++) {
    const f = Math.cos(l),
      u = Math.sin(l),
      x = t + f * n,
      y = e + u * n;
    (s.push(x, y), (l += c));
  }
}
function Xn(s, t, e, n, i, r) {
  const o = s[s.length - 2],
    h = s[s.length - 1] - e,
    c = o - t,
    l = i - e,
    d = n - t,
    f = Math.abs(h * d - c * l);
  if (f < 1e-8 || r === 0) {
    (s[s.length - 2] !== t || s[s.length - 1] !== e) && s.push(t, e);
    return;
  }
  const u = h * h + c * c,
    x = l * l + d * d,
    y = h * l + c * d,
    p = (r * Math.sqrt(u)) / f,
    _ = (r * Math.sqrt(x)) / f,
    g = (p * y) / u,
    M = (_ * y) / x,
    m = p * d + _ * c,
    k = p * l + _ * h,
    P = c * (_ + g),
    b = h * (_ + g),
    R = d * (p + M),
    v = l * (p + M),
    S = Math.atan2(b - k, P - m),
    C = Math.atan2(v - k, R - m);
  we(s, m + t, k + e, r, S, C, c * l > d * h);
}
const ut = Math.PI * 2,
  Rt = { centerX: 0, centerY: 0, ang1: 0, ang2: 0 },
  Gt = ({ x: s, y: t }, e, n, i, r, o, a, h) => {
    ((s *= e), (t *= n));
    const c = i * s - r * t,
      l = r * s + i * t;
    return ((h.x = c + o), (h.y = l + a), h);
  };
function Yn(s, t) {
  const e = t === -1.5707963267948966 ? -0.551915024494 : 1.3333333333333333 * Math.tan(t / 4),
    n = t === 1.5707963267948966 ? 0.551915024494 : e,
    i = Math.cos(s),
    r = Math.sin(s),
    o = Math.cos(s + t),
    a = Math.sin(s + t);
  return [
    { x: i - r * n, y: r + i * n },
    { x: o + a * n, y: a - o * n },
    { x: o, y: a },
  ];
}
const ie = (s, t, e, n) => {
    const i = s * n - t * e < 0 ? -1 : 1;
    let r = s * e + t * n;
    return (r > 1 && (r = 1), r < -1 && (r = -1), i * Math.acos(r));
  },
  Kn = (s, t, e, n, i, r, o, a, h, c, l, d, f) => {
    const u = Math.pow(i, 2),
      x = Math.pow(r, 2),
      y = Math.pow(l, 2),
      p = Math.pow(d, 2);
    let _ = u * x - u * p - x * y;
    (_ < 0 && (_ = 0), (_ /= u * p + x * y), (_ = Math.sqrt(_) * (o === a ? -1 : 1)));
    const g = ((_ * i) / r) * d,
      M = ((_ * -r) / i) * l,
      m = c * g - h * M + (s + e) / 2,
      k = h * g + c * M + (t + n) / 2,
      P = (l - g) / i,
      b = (d - M) / r,
      R = (-l - g) / i,
      v = (-d - M) / r,
      S = ie(1, 0, P, b);
    let C = ie(P, b, R, v);
    (a === 0 && C > 0 && (C -= ut),
      a === 1 && C < 0 && (C += ut),
      (f.centerX = m),
      (f.centerY = k),
      (f.ang1 = S),
      (f.ang2 = C));
  };
function Qn(s, t, e, n, i, r, o, a = 0, h = 0, c = 0) {
  if (r === 0 || o === 0) return;
  const l = Math.sin((a * ut) / 360),
    d = Math.cos((a * ut) / 360),
    f = (d * (t - n)) / 2 + (l * (e - i)) / 2,
    u = (-l * (t - n)) / 2 + (d * (e - i)) / 2;
  if (f === 0 && u === 0) return;
  ((r = Math.abs(r)), (o = Math.abs(o)));
  const x = Math.pow(f, 2) / Math.pow(r, 2) + Math.pow(u, 2) / Math.pow(o, 2);
  (x > 1 && ((r *= Math.sqrt(x)), (o *= Math.sqrt(x))), Kn(t, e, n, i, r, o, h, c, l, d, f, u, Rt));
  let { ang1: y, ang2: p } = Rt;
  const { centerX: _, centerY: g } = Rt;
  let M = Math.abs(p) / (ut / 4);
  Math.abs(1 - M) < 1e-7 && (M = 1);
  const m = Math.max(Math.ceil(M), 1);
  p /= m;
  let k = s[s.length - 2],
    P = s[s.length - 1];
  const b = { x: 0, y: 0 };
  for (let R = 0; R < m; R++) {
    const v = Yn(y, p),
      { x: S, y: C } = Gt(v[0], r, o, d, l, _, g, b),
      { x: F, y: z } = Gt(v[1], r, o, d, l, _, g, b),
      { x: L, y: tt } = Gt(v[2], r, o, d, l, _, g, b);
    (ke(s, k, P, S, C, F, z, L, tt), (k = L), (P = tt), (y += p));
  }
}
function On(s, t, e) {
  const n = (o, a) => {
      const h = a.x - o.x,
        c = a.y - o.y,
        l = Math.sqrt(h * h + c * c),
        d = h / l,
        f = c / l;
      return { len: l, nx: d, ny: f };
    },
    i = (o, a) => {
      o === 0 ? s.moveTo(a.x, a.y) : s.lineTo(a.x, a.y);
    };
  let r = t[t.length - 1];
  for (let o = 0; o < t.length; o++) {
    const a = t[o % t.length],
      h = a.radius ?? e;
    if (h <= 0) {
      (i(o, a), (r = a));
      continue;
    }
    const c = t[(o + 1) % t.length],
      l = n(a, r),
      d = n(a, c);
    if (l.len < 1e-4 || d.len < 1e-4) {
      (i(o, a), (r = a));
      continue;
    }
    let f = Math.asin(l.nx * d.ny - l.ny * d.nx),
      u = 1,
      x = !1;
    l.nx * d.nx - l.ny * -d.ny < 0
      ? f < 0
        ? (f = Math.PI + f)
        : ((f = Math.PI - f), (u = -1), (x = !0))
      : f > 0 && ((u = -1), (x = !0));
    const y = f / 2;
    let p,
      _ = Math.abs((Math.cos(y) * h) / Math.sin(y));
    _ > Math.min(l.len / 2, d.len / 2)
      ? ((_ = Math.min(l.len / 2, d.len / 2)), (p = Math.abs((_ * Math.sin(y)) / Math.cos(y))))
      : (p = h);
    const g = a.x + d.nx * _ + -d.ny * p * u,
      M = a.y + d.ny * _ + d.nx * p * u,
      m = Math.atan2(l.ny, l.nx) + (Math.PI / 2) * u,
      k = Math.atan2(d.ny, d.nx) - (Math.PI / 2) * u;
    (o === 0 && s.moveTo(g + Math.cos(m) * p, M + Math.sin(m) * p),
      s.arc(g, M, p, m, k, x),
      (r = a));
  }
}
function Jn(s, t, e, n) {
  const i = (a, h) => Math.sqrt((a.x - h.x) ** 2 + (a.y - h.y) ** 2),
    r = (a, h, c) => ({ x: a.x + (h.x - a.x) * c, y: a.y + (h.y - a.y) * c }),
    o = t.length;
  for (let a = 0; a < o; a++) {
    const h = t[(a + 1) % o],
      c = h.radius ?? e;
    if (c <= 0) {
      a === 0 ? s.moveTo(h.x, h.y) : s.lineTo(h.x, h.y);
      continue;
    }
    const l = t[a],
      d = t[(a + 2) % o],
      f = i(l, h);
    let u;
    if (f < 1e-4) u = h;
    else {
      const p = Math.min(f / 2, c);
      u = r(h, l, p / f);
    }
    const x = i(d, h);
    let y;
    if (x < 1e-4) y = h;
    else {
      const p = Math.min(x / 2, c);
      y = r(h, d, p / x);
    }
    (a === 0 ? s.moveTo(u.x, u.y) : s.lineTo(u.x, u.y), s.quadraticCurveTo(h.x, h.y, y.x, y.y, n));
  }
}
const ts = new W();
class es {
  constructor(t) {
    ((this.shapePrimitives = []),
      (this._currentPoly = null),
      (this._bounds = new ye()),
      (this._graphicsPath2D = t),
      (this.signed = t.checkForHoles));
  }
  moveTo(t, e) {
    return (this.startPoly(t, e), this);
  }
  lineTo(t, e) {
    this._ensurePoly();
    const n = this._currentPoly.points,
      i = n[n.length - 2],
      r = n[n.length - 1];
    return ((i !== t || r !== e) && n.push(t, e), this);
  }
  arc(t, e, n, i, r, o) {
    this._ensurePoly(!1);
    const a = this._currentPoly.points;
    return (we(a, t, e, n, i, r, o), this);
  }
  arcTo(t, e, n, i, r) {
    this._ensurePoly();
    const o = this._currentPoly.points;
    return (Xn(o, t, e, n, i, r), this);
  }
  arcToSvg(t, e, n, i, r, o, a) {
    const h = this._currentPoly.points;
    return (Qn(h, this._currentPoly.lastX, this._currentPoly.lastY, o, a, t, e, n, i, r), this);
  }
  bezierCurveTo(t, e, n, i, r, o, a) {
    this._ensurePoly();
    const h = this._currentPoly;
    return (ke(this._currentPoly.points, h.lastX, h.lastY, t, e, n, i, r, o, a), this);
  }
  quadraticCurveTo(t, e, n, i, r) {
    this._ensurePoly();
    const o = this._currentPoly;
    return ($n(this._currentPoly.points, o.lastX, o.lastY, t, e, n, i, r), this);
  }
  closePath() {
    return (this.endPoly(!0), this);
  }
  addPath(t, e) {
    (this.endPoly(), e && !e.isIdentity() && ((t = t.clone(!0)), t.transform(e)));
    const n = this.shapePrimitives,
      i = n.length;
    for (let r = 0; r < t.instructions.length; r++) {
      const o = t.instructions[r];
      this[o.action](...o.data);
    }
    if (t.checkForHoles && n.length - i > 1) {
      let r = null;
      for (let o = i; o < n.length; o++) {
        const a = n[o];
        if (a.shape.type === 'polygon') {
          const h = a.shape,
            c = r?.shape;
          c && c.containsPolygon(h)
            ? (r.holes || (r.holes = []), r.holes.push(a), n.copyWithin(o, o + 1), n.length--, o--)
            : (r = a);
        }
      }
    }
    return this;
  }
  finish(t = !1) {
    this.endPoly(t);
  }
  rect(t, e, n, i, r) {
    return (this.drawShape(new W(t, e, n, i), r), this);
  }
  circle(t, e, n, i) {
    return (this.drawShape(new Bt(t, e, n), i), this);
  }
  poly(t, e, n) {
    const i = new ct(t);
    return ((i.closePath = e), this.drawShape(i, n), this);
  }
  regularPoly(t, e, n, i, r = 0, o) {
    i = Math.max(i | 0, 3);
    const a = (-1 * Math.PI) / 2 + r,
      h = (Math.PI * 2) / i,
      c = [];
    for (let l = 0; l < i; l++) {
      const d = a - l * h;
      c.push(t + n * Math.cos(d), e + n * Math.sin(d));
    }
    return (this.poly(c, !0, o), this);
  }
  roundPoly(t, e, n, i, r, o = 0, a) {
    if (((i = Math.max(i | 0, 3)), r <= 0)) return this.regularPoly(t, e, n, i, o);
    const h = n * Math.sin(Math.PI / i) - 0.001;
    r = Math.min(r, h);
    const c = (-1 * Math.PI) / 2 + o,
      l = (Math.PI * 2) / i,
      d = ((i - 2) * Math.PI) / i / 2;
    for (let f = 0; f < i; f++) {
      const u = f * l + c,
        x = t + n * Math.cos(u),
        y = e + n * Math.sin(u),
        p = u + Math.PI + d,
        _ = u - Math.PI - d,
        g = x + r * Math.cos(p),
        M = y + r * Math.sin(p),
        m = x + r * Math.cos(_),
        k = y + r * Math.sin(_);
      (f === 0 ? this.moveTo(g, M) : this.lineTo(g, M), this.quadraticCurveTo(x, y, m, k, a));
    }
    return this.closePath();
  }
  roundShape(t, e, n = !1, i) {
    return t.length < 3 ? this : (n ? Jn(this, t, e, i) : On(this, t, e), this.closePath());
  }
  filletRect(t, e, n, i, r) {
    if (r === 0) return this.rect(t, e, n, i);
    const o = Math.min(n, i) / 2,
      a = Math.min(o, Math.max(-o, r)),
      h = t + n,
      c = e + i,
      l = a < 0 ? -a : 0,
      d = Math.abs(a);
    return this.moveTo(t, e + d)
      .arcTo(t + l, e + l, t + d, e, d)
      .lineTo(h - d, e)
      .arcTo(h - l, e + l, h, e + d, d)
      .lineTo(h, c - d)
      .arcTo(h - l, c - l, t + n - d, c, d)
      .lineTo(t + d, c)
      .arcTo(t + l, c - l, t, c - d, d)
      .closePath();
  }
  chamferRect(t, e, n, i, r, o) {
    if (r <= 0) return this.rect(t, e, n, i);
    const a = Math.min(r, Math.min(n, i) / 2),
      h = t + n,
      c = e + i,
      l = [t + a, e, h - a, e, h, e + a, h, c - a, h - a, c, t + a, c, t, c - a, t, e + a];
    for (let d = l.length - 1; d >= 2; d -= 2)
      l[d] === l[d - 2] && l[d - 1] === l[d - 3] && l.splice(d - 1, 2);
    return this.poly(l, !0, o);
  }
  ellipse(t, e, n, i, r) {
    return (this.drawShape(new Et(t, e, n, i), r), this);
  }
  roundRect(t, e, n, i, r, o) {
    return (this.drawShape(new Vt(t, e, n, i, r), o), this);
  }
  drawShape(t, e) {
    return (this.endPoly(), this.shapePrimitives.push({ shape: t, transform: e }), this);
  }
  startPoly(t, e) {
    let n = this._currentPoly;
    return (
      n && this.endPoly(),
      (n = new ct()),
      n.points.push(t, e),
      (this._currentPoly = n),
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
    if (!this._currentPoly && ((this._currentPoly = new ct()), t)) {
      const e = this.shapePrimitives[this.shapePrimitives.length - 1];
      if (e) {
        let n = e.shape.x,
          i = e.shape.y;
        if (e.transform && !e.transform.isIdentity()) {
          const r = e.transform,
            o = n;
          ((n = r.a * n + r.c * i + r.tx), (i = r.b * o + r.d * i + r.ty));
        }
        this._currentPoly.points.push(n, i);
      } else this._currentPoly.points.push(0, 0);
    }
  }
  buildPath() {
    const t = this._graphicsPath2D;
    ((this.shapePrimitives.length = 0), (this._currentPoly = null));
    for (let e = 0; e < t.instructions.length; e++) {
      const n = t.instructions[e];
      this[n.action](...n.data);
    }
    this.finish();
  }
  get bounds() {
    const t = this._bounds;
    t.clear();
    const e = this.shapePrimitives;
    for (let n = 0; n < e.length; n++) {
      const i = e[n],
        r = i.shape.getBounds(ts);
      i.transform ? t.addRect(r, i.transform) : t.addRect(r);
    }
    return t;
  }
}
class J {
  constructor(t, e = !1) {
    ((this.instructions = []),
      (this.uid = kt('graphicsPath')),
      (this._dirty = !0),
      (this.checkForHoles = e),
      typeof t == 'string' ? xn(t, this) : (this.instructions = t?.slice() ?? []));
  }
  get shapePath() {
    return (
      this._shapePath || (this._shapePath = new es(this)),
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
  bezierCurveToShort(t, e, n, i, r) {
    const o = this.instructions[this.instructions.length - 1],
      a = this.getLastPoint(Q.shared);
    let h = 0,
      c = 0;
    if (!o || o.action !== 'bezierCurveTo') ((h = a.x), (c = a.y));
    else {
      ((h = o.data[2]), (c = o.data[3]));
      const l = a.x,
        d = a.y;
      ((h = l + (l - h)), (c = d + (d - c)));
    }
    return (
      this.instructions.push({ action: 'bezierCurveTo', data: [h, c, t, e, n, i, r] }),
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
  quadraticCurveToShort(t, e, n) {
    const i = this.instructions[this.instructions.length - 1],
      r = this.getLastPoint(Q.shared);
    let o = 0,
      a = 0;
    if (!i || i.action !== 'quadraticCurveTo') ((o = r.x), (a = r.y));
    else {
      ((o = i.data[0]), (a = i.data[1]));
      const h = r.x,
        c = r.y;
      ((o = h + (h - o)), (a = c + (c - a)));
    }
    return (
      this.instructions.push({ action: 'quadraticCurveTo', data: [o, a, t, e, n] }),
      (this._dirty = !0),
      this
    );
  }
  rect(t, e, n, i, r) {
    return (
      this.instructions.push({ action: 'rect', data: [t, e, n, i, r] }),
      (this._dirty = !0),
      this
    );
  }
  circle(t, e, n, i) {
    return (
      this.instructions.push({ action: 'circle', data: [t, e, n, i] }),
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
  star(t, e, n, i, r, o, a) {
    r || (r = i / 2);
    const h = (-1 * Math.PI) / 2 + o,
      c = n * 2,
      l = (Math.PI * 2) / c,
      d = [];
    for (let f = 0; f < c; f++) {
      const u = f % 2 ? r : i,
        x = f * l + h;
      d.push(t + u * Math.cos(x), e + u * Math.sin(x));
    }
    return (this.poly(d, !0, a), this);
  }
  clone(t = !1) {
    const e = new J();
    if (((e.checkForHoles = this.checkForHoles), !t)) e.instructions = this.instructions.slice();
    else
      for (let n = 0; n < this.instructions.length; n++) {
        const i = this.instructions[n];
        e.instructions.push({ action: i.action, data: i.data.slice() });
      }
    return e;
  }
  clear() {
    return ((this.instructions.length = 0), (this._dirty = !0), this);
  }
  transform(t) {
    if (t.isIdentity()) return this;
    const e = t.a,
      n = t.b,
      i = t.c,
      r = t.d,
      o = t.tx,
      a = t.ty;
    let h = 0,
      c = 0,
      l = 0,
      d = 0,
      f = 0,
      u = 0,
      x = 0,
      y = 0;
    for (let p = 0; p < this.instructions.length; p++) {
      const _ = this.instructions[p],
        g = _.data;
      switch (_.action) {
        case 'moveTo':
        case 'lineTo':
          ((h = g[0]), (c = g[1]), (g[0] = e * h + i * c + o), (g[1] = n * h + r * c + a));
          break;
        case 'bezierCurveTo':
          ((l = g[0]),
            (d = g[1]),
            (f = g[2]),
            (u = g[3]),
            (h = g[4]),
            (c = g[5]),
            (g[0] = e * l + i * d + o),
            (g[1] = n * l + r * d + a),
            (g[2] = e * f + i * u + o),
            (g[3] = n * f + r * u + a),
            (g[4] = e * h + i * c + o),
            (g[5] = n * h + r * c + a));
          break;
        case 'quadraticCurveTo':
          ((l = g[0]),
            (d = g[1]),
            (h = g[2]),
            (c = g[3]),
            (g[0] = e * l + i * d + o),
            (g[1] = n * l + r * d + a),
            (g[2] = e * h + i * c + o),
            (g[3] = n * h + r * c + a));
          break;
        case 'arcToSvg':
          ((h = g[5]),
            (c = g[6]),
            (x = g[0]),
            (y = g[1]),
            (g[0] = e * x + i * y),
            (g[1] = n * x + r * y),
            (g[5] = e * h + i * c + o),
            (g[6] = n * h + r * c + a));
          break;
        case 'circle':
          g[4] = rt(g[3], t);
          break;
        case 'rect':
          g[4] = rt(g[4], t);
          break;
        case 'ellipse':
          g[8] = rt(g[8], t);
          break;
        case 'roundRect':
          g[5] = rt(g[5], t);
          break;
        case 'addPath':
          g[0].transform(t);
          break;
        case 'poly':
          g[2] = rt(g[2], t);
          break;
        default:
          dt('unknown transform action', _.action);
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
      n = this.instructions[e];
    if (!n) return ((t.x = 0), (t.y = 0), t);
    for (; n.action === 'closePath'; ) {
      if ((e--, e < 0)) return ((t.x = 0), (t.y = 0), t);
      n = this.instructions[e];
    }
    switch (n.action) {
      case 'moveTo':
      case 'lineTo':
        ((t.x = n.data[0]), (t.y = n.data[1]));
        break;
      case 'quadraticCurveTo':
        ((t.x = n.data[2]), (t.y = n.data[3]));
        break;
      case 'bezierCurveTo':
        ((t.x = n.data[4]), (t.y = n.data[5]));
        break;
      case 'arc':
      case 'arcToSvg':
        ((t.x = n.data[5]), (t.y = n.data[6]));
        break;
      case 'addPath':
        n.data[0].getLastPoint(t);
        break;
    }
    return t;
  }
}
function rt(s, t) {
  return s ? s.prepend(t) : t.clone();
}
function H(s, t, e) {
  const n = s.getAttribute(t);
  return n ? Number(n) : e;
}
function ns(s, t) {
  const e = s.querySelectorAll('defs');
  for (let n = 0; n < e.length; n++) {
    const i = e[n];
    for (let r = 0; r < i.children.length; r++) {
      const o = i.children[r];
      switch (o.nodeName.toLowerCase()) {
        case 'lineargradient':
          t.defs[o.id] = ss(o);
          break;
        case 'radialgradient':
          t.defs[o.id] = is();
          break;
      }
    }
  }
}
function ss(s) {
  const t = H(s, 'x1', 0),
    e = H(s, 'y1', 0),
    n = H(s, 'x2', 1),
    i = H(s, 'y2', 0),
    r = s.getAttribute('gradientUnits') || 'objectBoundingBox',
    o = new gt(t, e, n, i, r === 'objectBoundingBox' ? 'local' : 'global');
  for (let a = 0; a < s.children.length; a++) {
    const h = s.children[a],
      c = H(h, 'offset', 0),
      l = j.shared.setValue(h.getAttribute('stop-color')).toNumber();
    o.addColorStop(c, l);
  }
  return o;
}
function is(s) {
  return (dt('[SVG Parser] Radial gradients are not yet supported'), new gt(0, 0, 1, 0));
}
function re(s) {
  const t = s.match(/url\s*\(\s*['"]?\s*#([^'"\s)]+)\s*['"]?\s*\)/i);
  return t ? t[1] : '';
}
const oe = {
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
function Te(s, t) {
  const e = s.getAttribute('style'),
    n = {},
    i = {},
    r = { strokeStyle: n, fillStyle: i, useFill: !1, useStroke: !1 };
  for (const o in oe) {
    const a = s.getAttribute(o);
    a && ae(t, r, o, a.trim());
  }
  if (e) {
    const o = e.split(';');
    for (let a = 0; a < o.length; a++) {
      const h = o[a].trim(),
        [c, l] = h.split(':');
      oe[c] && ae(t, r, c, l.trim());
    }
  }
  return {
    strokeStyle: r.useStroke ? n : null,
    fillStyle: r.useFill ? i : null,
    useFill: r.useFill,
    useStroke: r.useStroke,
  };
}
function ae(s, t, e, n) {
  switch (e) {
    case 'stroke':
      if (n !== 'none') {
        if (n.startsWith('url(')) {
          const i = re(n);
          t.strokeStyle.fill = s.defs[i];
        } else t.strokeStyle.color = j.shared.setValue(n).toNumber();
        t.useStroke = !0;
      }
      break;
    case 'stroke-width':
      t.strokeStyle.width = Number(n);
      break;
    case 'fill':
      if (n !== 'none') {
        if (n.startsWith('url(')) {
          const i = re(n);
          t.fillStyle.fill = s.defs[i];
        } else t.fillStyle.color = j.shared.setValue(n).toNumber();
        t.useFill = !0;
      }
      break;
    case 'fill-opacity':
      t.fillStyle.alpha = Number(n);
      break;
    case 'stroke-opacity':
      t.strokeStyle.alpha = Number(n);
      break;
    case 'opacity':
      ((t.fillStyle.alpha = Number(n)), (t.strokeStyle.alpha = Number(n)));
      break;
  }
}
function rs(s, t) {
  if (typeof s == 'string') {
    const o = document.createElement('div');
    ((o.innerHTML = s.trim()), (s = o.querySelector('svg')));
  }
  const e = { context: t, defs: {}, path: new J() };
  ns(s, e);
  const n = s.children,
    { fillStyle: i, strokeStyle: r } = Te(s, e);
  for (let o = 0; o < n.length; o++) {
    const a = n[o];
    a.nodeName.toLowerCase() !== 'defs' && ve(a, e, i, r);
  }
  return t;
}
function ve(s, t, e, n) {
  const i = s.children,
    { fillStyle: r, strokeStyle: o } = Te(s, t);
  (r && e ? (e = { ...e, ...r }) : r && (e = r), o && n ? (n = { ...n, ...o }) : o && (n = o));
  const a = !e && !n;
  a && (e = { color: 0 });
  let h, c, l, d, f, u, x, y, p, _, g, M, m, k, P, b, R;
  switch (s.nodeName.toLowerCase()) {
    case 'path':
      ((k = s.getAttribute('d')),
        s.getAttribute('fill-rule') === 'evenodd' &&
          dt('SVG Evenodd fill rule not supported, your svg may render incorrectly'),
        (P = new J(k, !0)),
        t.context.path(P),
        e && t.context.fill(e),
        n && t.context.stroke(n));
      break;
    case 'circle':
      ((x = H(s, 'cx', 0)),
        (y = H(s, 'cy', 0)),
        (p = H(s, 'r', 0)),
        t.context.ellipse(x, y, p, p),
        e && t.context.fill(e),
        n && t.context.stroke(n));
      break;
    case 'rect':
      ((h = H(s, 'x', 0)),
        (c = H(s, 'y', 0)),
        (b = H(s, 'width', 0)),
        (R = H(s, 'height', 0)),
        (_ = H(s, 'rx', 0)),
        (g = H(s, 'ry', 0)),
        _ || g ? t.context.roundRect(h, c, b, R, _ || g) : t.context.rect(h, c, b, R),
        e && t.context.fill(e),
        n && t.context.stroke(n));
      break;
    case 'ellipse':
      ((x = H(s, 'cx', 0)),
        (y = H(s, 'cy', 0)),
        (_ = H(s, 'rx', 0)),
        (g = H(s, 'ry', 0)),
        t.context.beginPath(),
        t.context.ellipse(x, y, _, g),
        e && t.context.fill(e),
        n && t.context.stroke(n));
      break;
    case 'line':
      ((l = H(s, 'x1', 0)),
        (d = H(s, 'y1', 0)),
        (f = H(s, 'x2', 0)),
        (u = H(s, 'y2', 0)),
        t.context.beginPath(),
        t.context.moveTo(l, d),
        t.context.lineTo(f, u),
        n && t.context.stroke(n));
      break;
    case 'polygon':
      ((m = s.getAttribute('points')),
        (M = m.match(/\d+/g).map((v) => parseInt(v, 10))),
        t.context.poly(M, !0),
        e && t.context.fill(e),
        n && t.context.stroke(n));
      break;
    case 'polyline':
      ((m = s.getAttribute('points')),
        (M = m.match(/\d+/g).map((v) => parseInt(v, 10))),
        t.context.poly(M, !1),
        n && t.context.stroke(n));
      break;
    case 'g':
    case 'svg':
      break;
    default: {
      dt(`[SVG parser] <${s.nodeName}> elements unsupported`);
      break;
    }
  }
  a && (e = null);
  for (let v = 0; v < i.length; v++) ve(i[v], t, e, n);
}
function os(s) {
  return j.isColorLike(s);
}
function he(s) {
  return s instanceof an;
}
function le(s) {
  return s instanceof gt;
}
function as(s) {
  return s instanceof Y;
}
function hs(s, t, e) {
  const n = j.shared.setValue(t ?? 0);
  return (
    (s.color = n.toNumber()),
    (s.alpha = n.alpha === 1 ? e.alpha : n.alpha),
    (s.texture = Y.WHITE),
    { ...e, ...s }
  );
}
function ls(s, t, e) {
  return ((s.texture = t), { ...e, ...s });
}
function ce(s, t, e) {
  return (
    (s.fill = t),
    (s.color = 16777215),
    (s.texture = t.texture),
    (s.matrix = t.transform),
    { ...e, ...s }
  );
}
function ue(s, t, e) {
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
function cs(s, t) {
  const e = { ...t, ...s },
    n = j.shared.setValue(e.color);
  return ((e.alpha *= n.alpha), (e.color = n.toNumber()), e);
}
function ht(s, t) {
  if (s == null) return null;
  const e = {},
    n = s;
  return os(s)
    ? hs(e, s, t)
    : as(s)
      ? ls(e, s, t)
      : he(s)
        ? ce(e, s, t)
        : le(s)
          ? ue(e, s, t)
          : n.fill && he(n.fill)
            ? ce(n, n.fill, t)
            : n.fill && le(n.fill)
              ? ue(n, n.fill, t)
              : cs(n, t);
}
function de(s, t) {
  const { width: e, alignment: n, miterLimit: i, cap: r, join: o, pixelLine: a, ...h } = t,
    c = ht(s, h);
  return c ? { width: e, alignment: n, miterLimit: i, cap: r, join: o, pixelLine: a, ...c } : null;
}
const us = new Q(),
  fe = new B(),
  Wt = class q extends Ae {
    constructor() {
      (super(...arguments),
        (this.uid = kt('graphicsContext')),
        (this.dirty = !0),
        (this.batchMode = 'auto'),
        (this.instructions = []),
        (this._activePath = new J()),
        (this._transform = new B()),
        (this._fillStyle = { ...q.defaultFillStyle }),
        (this._strokeStyle = { ...q.defaultStrokeStyle }),
        (this._stateStack = []),
        (this._tick = 0),
        (this._bounds = new ye()),
        (this._boundsDirty = !0));
    }
    clone() {
      const t = new q();
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
      this._fillStyle = ht(t, q.defaultFillStyle);
    }
    get strokeStyle() {
      return this._strokeStyle;
    }
    set strokeStyle(t) {
      this._strokeStyle = de(t, q.defaultStrokeStyle);
    }
    setFillStyle(t) {
      return ((this._fillStyle = ht(t, q.defaultFillStyle)), this);
    }
    setStrokeStyle(t) {
      return ((this._strokeStyle = ht(t, q.defaultStrokeStyle)), this);
    }
    texture(t, e, n, i, r, o) {
      return (
        this.instructions.push({
          action: 'texture',
          data: {
            image: t,
            dx: n || 0,
            dy: i || 0,
            dw: r || t.frame.width,
            dh: o || t.frame.height,
            transform: this._transform.clone(),
            alpha: this._fillStyle.alpha,
            style: e ? j.shared.setValue(e).toNumber() : 16777215,
          },
        }),
        this.onUpdate(),
        this
      );
    }
    beginPath() {
      return ((this._activePath = new J()), this);
    }
    fill(t, e) {
      let n;
      const i = this.instructions[this.instructions.length - 1];
      return (
        this._tick === 0 && i && i.action === 'stroke'
          ? (n = i.data.path)
          : (n = this._activePath.clone()),
        n
          ? (t != null &&
              (e !== void 0 &&
                typeof t == 'number' &&
                (D(
                  A,
                  'GraphicsContext.fill(color, alpha) is deprecated, use GraphicsContext.fill({ color, alpha }) instead',
                ),
                (t = { color: t, alpha: e })),
              (this._fillStyle = ht(t, q.defaultFillStyle))),
            this.instructions.push({ action: 'fill', data: { style: this.fillStyle, path: n } }),
            this.onUpdate(),
            this._initNextPathLocation(),
            (this._tick = 0),
            this)
          : this
      );
    }
    _initNextPathLocation() {
      const { x: t, y: e } = this._activePath.getLastPoint(Q.shared);
      (this._activePath.clear(), this._activePath.moveTo(t, e));
    }
    stroke(t) {
      let e;
      const n = this.instructions[this.instructions.length - 1];
      return (
        this._tick === 0 && n && n.action === 'fill'
          ? (e = n.data.path)
          : (e = this._activePath.clone()),
        e
          ? (t != null && (this._strokeStyle = de(t, q.defaultStrokeStyle)),
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
          n = this._activePath.clone();
        if (e && (e.action === 'stroke' || e.action === 'fill'))
          if (e.data.hole) e.data.hole.addPath(n);
          else {
            e.data.hole = n;
            break;
          }
      }
      return (this._initNextPathLocation(), this);
    }
    arc(t, e, n, i, r, o) {
      this._tick++;
      const a = this._transform;
      return (
        this._activePath.arc(a.a * t + a.c * e + a.tx, a.b * t + a.d * e + a.ty, n, i, r, o),
        this
      );
    }
    arcTo(t, e, n, i, r) {
      this._tick++;
      const o = this._transform;
      return (
        this._activePath.arcTo(
          o.a * t + o.c * e + o.tx,
          o.b * t + o.d * e + o.ty,
          o.a * n + o.c * i + o.tx,
          o.b * n + o.d * i + o.ty,
          r,
        ),
        this
      );
    }
    arcToSvg(t, e, n, i, r, o, a) {
      this._tick++;
      const h = this._transform;
      return (
        this._activePath.arcToSvg(
          t,
          e,
          n,
          i,
          r,
          h.a * o + h.c * a + h.tx,
          h.b * o + h.d * a + h.ty,
        ),
        this
      );
    }
    bezierCurveTo(t, e, n, i, r, o, a) {
      this._tick++;
      const h = this._transform;
      return (
        this._activePath.bezierCurveTo(
          h.a * t + h.c * e + h.tx,
          h.b * t + h.d * e + h.ty,
          h.a * n + h.c * i + h.tx,
          h.b * n + h.d * i + h.ty,
          h.a * r + h.c * o + h.tx,
          h.b * r + h.d * o + h.ty,
          a,
        ),
        this
      );
    }
    closePath() {
      return (this._tick++, this._activePath?.closePath(), this);
    }
    ellipse(t, e, n, i) {
      return (this._tick++, this._activePath.ellipse(t, e, n, i, this._transform.clone()), this);
    }
    circle(t, e, n) {
      return (this._tick++, this._activePath.circle(t, e, n, this._transform.clone()), this);
    }
    path(t) {
      return (this._tick++, this._activePath.addPath(t, this._transform.clone()), this);
    }
    lineTo(t, e) {
      this._tick++;
      const n = this._transform;
      return (this._activePath.lineTo(n.a * t + n.c * e + n.tx, n.b * t + n.d * e + n.ty), this);
    }
    moveTo(t, e) {
      this._tick++;
      const n = this._transform,
        i = this._activePath.instructions,
        r = n.a * t + n.c * e + n.tx,
        o = n.b * t + n.d * e + n.ty;
      return i.length === 1 && i[0].action === 'moveTo'
        ? ((i[0].data[0] = r), (i[0].data[1] = o), this)
        : (this._activePath.moveTo(r, o), this);
    }
    quadraticCurveTo(t, e, n, i, r) {
      this._tick++;
      const o = this._transform;
      return (
        this._activePath.quadraticCurveTo(
          o.a * t + o.c * e + o.tx,
          o.b * t + o.d * e + o.ty,
          o.a * n + o.c * i + o.tx,
          o.b * n + o.d * i + o.ty,
          r,
        ),
        this
      );
    }
    rect(t, e, n, i) {
      return (this._tick++, this._activePath.rect(t, e, n, i, this._transform.clone()), this);
    }
    roundRect(t, e, n, i, r) {
      return (
        this._tick++,
        this._activePath.roundRect(t, e, n, i, r, this._transform.clone()),
        this
      );
    }
    poly(t, e) {
      return (this._tick++, this._activePath.poly(t, e, this._transform.clone()), this);
    }
    regularPoly(t, e, n, i, r = 0, o) {
      return (this._tick++, this._activePath.regularPoly(t, e, n, i, r, o), this);
    }
    roundPoly(t, e, n, i, r, o) {
      return (this._tick++, this._activePath.roundPoly(t, e, n, i, r, o), this);
    }
    roundShape(t, e, n, i) {
      return (this._tick++, this._activePath.roundShape(t, e, n, i), this);
    }
    filletRect(t, e, n, i, r) {
      return (this._tick++, this._activePath.filletRect(t, e, n, i, r), this);
    }
    chamferRect(t, e, n, i, r, o) {
      return (this._tick++, this._activePath.chamferRect(t, e, n, i, r, o), this);
    }
    star(t, e, n, i, r = 0, o = 0) {
      return (this._tick++, this._activePath.star(t, e, n, i, r, o, this._transform.clone()), this);
    }
    svg(t) {
      return (this._tick++, rs(t, this), this);
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
    setTransform(t, e, n, i, r, o) {
      return t instanceof B
        ? (this._transform.set(t.a, t.b, t.c, t.d, t.tx, t.ty), this)
        : (this._transform.set(t, e, n, i, r, o), this);
    }
    transform(t, e, n, i, r, o) {
      return t instanceof B
        ? (this._transform.append(t), this)
        : (fe.set(t, e, n, i, r, o), this._transform.append(fe), this);
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
        const n = this.instructions[e],
          i = n.action;
        if (i === 'fill') {
          const r = n.data;
          t.addBounds(r.path.bounds);
        } else if (i === 'texture') {
          const r = n.data;
          t.addFrame(r.dx, r.dy, r.dx + r.dw, r.dy + r.dh, r.transform);
        }
        if (i === 'stroke') {
          const r = n.data,
            o = r.style.alignment,
            a = r.style.width * (1 - o),
            h = r.path.bounds;
          t.addFrame(h.minX - a, h.minY - a, h.maxX + a, h.maxY + a);
        }
      }
      return t;
    }
    containsPoint(t) {
      if (!this.bounds.containsPoint(t.x, t.y)) return !1;
      const e = this.instructions;
      let n = !1;
      for (let i = 0; i < e.length; i++) {
        const r = e[i],
          o = r.data,
          a = o.path;
        if (!r.action || !a) continue;
        const h = o.style,
          c = a.shapePath.shapePrimitives;
        for (let l = 0; l < c.length; l++) {
          const d = c[l].shape;
          if (!h || !d) continue;
          const f = c[l].transform,
            u = f ? f.applyInverse(t, us) : t;
          if (r.action === 'fill') n = d.contains(u.x, u.y);
          else {
            const y = h;
            n = d.strokeContains(u.x, u.y, y.width, y.alignment);
          }
          const x = o.hole;
          if (x) {
            const y = x.shapePath?.shapePrimitives;
            if (y) for (let p = 0; p < y.length; p++) y[p].shape.contains(u.x, u.y) && (n = !1);
          }
          if (n) return !0;
        }
      }
      return n;
    }
    destroy(t = !1) {
      if (
        ((this._stateStack.length = 0),
        (this._transform = null),
        this.emit('destroy', this),
        this.removeAllListeners(),
        typeof t == 'boolean' ? t : t?.texture)
      ) {
        const n = typeof t == 'boolean' ? t : t?.textureSource;
        (this._fillStyle.texture &&
          (this._fillStyle.fill && 'uid' in this._fillStyle.fill
            ? this._fillStyle.fill.destroy()
            : this._fillStyle.texture.destroy(n)),
          this._strokeStyle.texture &&
            (this._strokeStyle.fill && 'uid' in this._strokeStyle.fill
              ? this._strokeStyle.fill.destroy()
              : this._strokeStyle.texture.destroy(n)));
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
Wt.defaultFillStyle = {
  color: 16777215,
  alpha: 1,
  texture: Y.WHITE,
  matrix: null,
  fill: null,
  textureSpace: 'local',
};
Wt.defaultStrokeStyle = {
  width: 1,
  color: 16777215,
  alpha: 1,
  alignment: 0.5,
  miterLimit: 10,
  cap: 'butt',
  join: 'miter',
  texture: Y.WHITE,
  matrix: null,
  fill: null,
  textureSpace: 'local',
  pixelLine: !1,
};
let ot = Wt;
class At extends qe {
  constructor(t) {
    t instanceof ot && (t = { context: t });
    const { context: e, roundPixels: n, ...i } = t || {};
    (super({ label: 'Graphics', ...i }),
      (this.renderPipeId = 'graphics'),
      e ? (this._context = e) : (this._context = this._ownedContext = new ot()),
      this._context.on('update', this.onViewUpdate, this),
      (this.didViewUpdate = !0),
      (this.allowChildren = !1),
      (this.roundPixels = n ?? !1));
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
    return t ? new At(this._context.clone()) : ((this._ownedContext = null), new At(this._context));
  }
  lineStyle(t, e, n) {
    D(
      A,
      'Graphics#lineStyle is no longer needed. Use Graphics#setStrokeStyle to set the stroke style.',
    );
    const i = {};
    return (
      t && (i.width = t),
      e && (i.color = e),
      n && (i.alpha = n),
      (this.context.strokeStyle = i),
      this
    );
  }
  beginFill(t, e) {
    D(
      A,
      'Graphics#beginFill is no longer needed. Use Graphics#fill to fill the shape with the desired style.',
    );
    const n = {};
    return (
      t !== void 0 && (n.color = t),
      e !== void 0 && (n.alpha = e),
      (this.context.fillStyle = n),
      this
    );
  }
  endFill() {
    (D(
      A,
      'Graphics#endFill is no longer needed. Use Graphics#fill to fill the shape with the desired style.',
    ),
      this.context.fill());
    const t = this.context.strokeStyle;
    return (
      (t.width !== ot.defaultStrokeStyle.width ||
        t.color !== ot.defaultStrokeStyle.color ||
        t.alpha !== ot.defaultStrokeStyle.alpha) &&
        this.context.stroke(),
      this
    );
  }
  drawCircle(...t) {
    return (
      D(A, 'Graphics#drawCircle has been renamed to Graphics#circle'),
      this._callContextMethod('circle', t)
    );
  }
  drawEllipse(...t) {
    return (
      D(A, 'Graphics#drawEllipse has been renamed to Graphics#ellipse'),
      this._callContextMethod('ellipse', t)
    );
  }
  drawPolygon(...t) {
    return (
      D(A, 'Graphics#drawPolygon has been renamed to Graphics#poly'),
      this._callContextMethod('poly', t)
    );
  }
  drawRect(...t) {
    return (
      D(A, 'Graphics#drawRect has been renamed to Graphics#rect'),
      this._callContextMethod('rect', t)
    );
  }
  drawRoundedRect(...t) {
    return (
      D(A, 'Graphics#drawRoundedRect has been renamed to Graphics#roundRect'),
      this._callContextMethod('roundRect', t)
    );
  }
  drawStar(...t) {
    return (
      D(A, 'Graphics#drawStar has been renamed to Graphics#star'),
      this._callContextMethod('star', t)
    );
  }
}
export { Pe as B, gt as F, At as G, ot as a, de as b, an as c, Ce as d, ht as t };
