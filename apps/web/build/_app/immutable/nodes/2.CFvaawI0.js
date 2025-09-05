var y = Object.defineProperty;
var M = (i, e, o) =>
  e in i ? y(i, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : (i[e] = o);
var p = (i, e, o) => M(i, typeof e != 'symbol' ? e + '' : e, o);
import { s as g, n as d, c as w, o as D } from '../chunks/scheduler.DCi9tjgp.js';
import {
  S as H,
  i as S,
  d as f,
  a as l,
  g as F,
  k as m,
  j as I,
  s as P,
  b as u,
  l as n,
  c as x,
  e as U,
  f as h,
  h as k,
  t as _,
  m as C,
} from '../chunks/index.BID5roI-.js';
import { h as E } from '../chunks/flags.B2YthsLQ.js';
class L {
  constructor() {
    p(this, 'last', performance.now());
    p(this, 'frames', 0);
  }
  sample() {
    this.frames++;
    const e = performance.now(),
      o = e - this.last;
    if (o >= 1e3) {
      const s = { fps: (this.frames * 1e3) / o, frames: this.frames, timeMs: o };
      return ((this.frames = 0), (this.last = e), s);
    }
    return { fps: 0, frames: this.frames, timeMs: o };
  }
}
function b(i) {
  let e, o, t;
  return {
    c() {
      ((e = k('div')), (o = _('HUD on — FPS: ')), (t = _(i[0])), this.h());
    },
    l(s) {
      e = x(s, 'DIV', { style: !0 });
      var a = U(e);
      ((o = h(a, 'HUD on — FPS: ')), (t = h(a, i[0])), a.forEach(f), this.h());
    },
    h() {
      (n(e, 'position', 'absolute'),
        n(e, 'top', '8px'),
        n(e, 'left', '8px'),
        n(e, 'padding', '6px 10px'),
        n(e, 'background', 'rgba(0,0,0,.55)'),
        n(e, 'color', '#fff'),
        n(e, 'font', '12px/1.2 system-ui'),
        n(e, 'border-radius', '6px'));
    },
    m(s, a) {
      (l(s, e, a), u(e, o), u(e, t));
    },
    p(s, a) {
      a & 1 && P(t, s[0]);
    },
    d(s) {
      s && f(e);
    },
  };
}
function v(i) {
  let e,
    o = 'Add <code>?hud=1</code> to URL for FPS HUD';
  return {
    c() {
      ((e = k('div')), (e.innerHTML = o), this.h());
    },
    l(t) {
      ((e = x(t, 'DIV', { style: !0, 'data-svelte-h': !0 })),
        C(e) !== 'svelte-1awln0g' && (e.innerHTML = o),
        this.h());
    },
    h() {
      (n(e, 'position', 'absolute'),
        n(e, 'top', '8px'),
        n(e, 'left', '8px'),
        n(e, 'padding', '6px'),
        n(e, 'background', '#222'),
        n(e, 'color', '#fff'),
        n(e, 'font', '12px'),
        n(e, 'border-radius', '4px'));
    },
    m(t, s) {
      l(t, e, s);
    },
    d(t) {
      t && f(e);
    },
  };
}
function N(i) {
  let e,
    o,
    t = i[1] && b(i),
    s = !i[1] && v();
  return {
    c() {
      (t && t.c(), (e = I()), s && s.c(), (o = m()));
    },
    l(a) {
      (t && t.l(a), (e = F(a)), s && s.l(a), (o = m()));
    },
    m(a, r) {
      (t && t.m(a, r), l(a, e, r), s && s.m(a, r), l(a, o, r));
    },
    p(a, [r]) {
      (a[1]
        ? t
          ? t.p(a, r)
          : ((t = b(a)), t.c(), t.m(e.parentNode, e))
        : t && (t.d(1), (t = null)),
        a[1] ? s && (s.d(1), (s = null)) : s || ((s = v()), s.c(), s.m(o.parentNode, o)));
    },
    i: d,
    o: d,
    d(a) {
      (a && (f(e), f(o)), t && t.d(a), s && s.d(a));
    },
  };
}
function T(i, e, o) {
  let t;
  w(i, E, (a) => o(1, (t = a)));
  let s = 0;
  return (
    D(() => {
      const a = new L(),
        r = setInterval(() => {
          const c = a.sample();
          c.fps && o(0, (s = Math.round(c.fps)));
        }, 250);
      return () => clearInterval(r);
    }),
    [s, t]
  );
}
class R extends H {
  constructor(e) {
    (super(), S(this, e, T, N, g, {}));
  }
}
export { R as component };
