var ot = Object.defineProperty;
var ut = (a, t, e) =>
  t in a ? ot(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : (a[t] = e);
var q = (a, t, e) => ut(a, typeof t != 'symbol' ? t + '' : t, e);
import { h as st } from '../chunks/flags.B2YthsLQ.js';
import {
  s as N,
  n as P,
  o as B,
  d as O,
  r as lt,
  u as at,
  v as it,
  w as nt,
  x as rt,
  c as dt,
  b as ct,
} from '../chunks/scheduler.DCi9tjgp.js';
import {
  S as z,
  i as F,
  d as _,
  a as I,
  g as y,
  k as V,
  j as k,
  b as h,
  z as x,
  y as d,
  c as m,
  e as D,
  m as U,
  h as b,
  u as R,
  n as $,
  o as T,
  q as pt,
  w as Z,
  l as A,
  x as G,
  v as K,
  p as ft,
} from '../chunks/index.BID5roI-.js';
import { A as vt } from '../chunks/index.B-5O6jHt.js';
const ht = ({ url: a }) => (a.searchParams.get('hud') === '1' && st.set(!0), {}),
  Vt = Object.freeze(
    Object.defineProperty({ __proto__: null, load: ht }, Symbol.toStringTag, { value: 'Module' }),
  );
function _t(a = globalThis.devicePixelRatio || 1, t = 1, e = 2) {
  return Math.max(t, Math.min(e, a));
}
const mt = {
    start(a, t) {
      const e = setInterval(t, a);
      return () => clearInterval(e);
    },
  },
  bt = () => document.visibilityState === 'visible',
  gt = 500;
let W = null,
  j = performance.now();
function wt(a = mt) {
  return {
    start() {
      W ||
        ((j = performance.now()),
        (W = a.start(gt, () => {
          if (!bt()) return;
          const t = performance.now(),
            e = t - j;
          ((j = t),
            queueMicrotask(() => {
              window.dispatchEvent(new CustomEvent('bg-tick', { detail: { dt: e } }));
            }));
        })));
    },
    stop() {
      W && (W(), (W = null));
    },
    isRunning() {
      return W !== null;
    },
  };
}
async function yt(a) {
  const t = _t(),
    e = new vt({ view: a, antialias: !1, resolution: t, autoDensity: !0, backgroundAlpha: 0 });
  await e.init({ resizeTo: a.parentElement ?? window });
  const s = wt(2),
    l = () => {
      document.hidden
        ? (e.ticker.stopped || e.ticker.stop(), s.start())
        : (s.stop(), e.ticker.stopped && e.ticker.start());
    };
  return (
    document.addEventListener('visibilitychange', l),
    l(),
    {
      app: e,
      resize: () => e.renderer.resize(a.clientWidth, a.clientHeight),
      destroy: () => {
        (document.removeEventListener('visibilitychange', l),
          s.stop(),
          e.destroy(!0, { children: !0 }));
      },
    }
  );
}
class kt {
  constructor() {
    q(this, 'registration', null);
    q(this, 'updateAvailable', !1);
    q(this, 'installing', !1);
    q(this, 'installed', !1);
    q(this, 'updateCallbacks', []);
    this.initializeServiceWorker();
  }
  async initializeServiceWorker() {
    if (typeof window > 'u' || !('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }
    try {
      ((this.registration = await navigator.serviceWorker.register('/sw.js')),
        console.log('Service Worker: Registered successfully'),
        this.registration.addEventListener('updatefound', () => {
          const t = this.registration?.installing;
          t &&
            t.addEventListener('statechange', () => {
              t.state === 'installed' &&
                navigator.serviceWorker.controller &&
                (console.log('Service Worker: Update available'),
                (this.updateAvailable = !0),
                this.notifyCallbacks());
            });
        }),
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          (console.log('Service Worker: Now controlling'),
            (this.installed = !0),
            (this.installing = !1),
            this.notifyCallbacks());
        }));
    } catch (t) {
      console.error('Service Worker registration failed:', t);
    }
  }
  async checkForUpdates() {
    if (!this.registration) return !1;
    try {
      return (await this.registration.update(), this.updateAvailable);
    } catch (t) {
      return (console.error('Failed to check for updates:', t), !1);
    }
  }
  async applyUpdate() {
    if (!(!this.registration || !this.updateAvailable))
      try {
        ((this.installing = !0),
          this.notifyCallbacks(),
          this.registration.waiting &&
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' }));
      } catch (t) {
        (console.error('Failed to apply update:', t),
          (this.installing = !1),
          this.notifyCallbacks());
      }
  }
  onUpdate(t) {
    return (
      this.updateCallbacks.push(t),
      () => {
        const e = this.updateCallbacks.indexOf(t);
        e > -1 && this.updateCallbacks.splice(e, 1);
      }
    );
  }
  getUpdateInfo() {
    return {
      isUpdateAvailable: this.updateAvailable,
      isInstalling: this.installing,
      isInstalled: this.installed,
    };
  }
  canInstall() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }
  async install() {
    if (!this.canInstall()) return !1;
    try {
      return this.registration !== null;
    } catch (t) {
      return (console.error('Failed to install PWA:', t), !1);
    }
  }
  notifyCallbacks() {
    const t = this.getUpdateInfo();
    this.updateCallbacks.forEach((e) => e(t));
  }
}
let H = null;
function J() {
  return (H || (H = new kt()), H);
}
function Q(a) {
  let t,
    e,
    s,
    l =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"></path></svg>',
    n,
    u,
    p =
      '<div class="update-toast__title svelte-1uwaqt1">Update Available</div> <div class="update-toast__message svelte-1uwaqt1">A new version of Draconia Chronicles is ready to install.</div>',
    v,
    o,
    r,
    C = 'Update',
    f,
    i,
    c = 'Later',
    E,
    S;
  return {
    c() {
      ((t = b('div')),
        (e = b('div')),
        (s = b('div')),
        (s.innerHTML = l),
        (n = k()),
        (u = b('div')),
        (u.innerHTML = p),
        (v = k()),
        (o = b('div')),
        (r = b('button')),
        (r.textContent = C),
        (f = k()),
        (i = b('button')),
        (i.textContent = c),
        this.h());
    },
    l(w) {
      t = m(w, 'DIV', { class: !0, role: !0, 'aria-live': !0 });
      var L = D(t);
      e = m(L, 'DIV', { class: !0 });
      var g = D(e);
      ((s = m(g, 'DIV', { class: !0, 'data-svelte-h': !0 })),
        U(s) !== 'svelte-sfqhci' && (s.innerHTML = l),
        (n = y(g)),
        (u = m(g, 'DIV', { class: !0, 'data-svelte-h': !0 })),
        U(u) !== 'svelte-1lfasdu' && (u.innerHTML = p),
        (v = y(g)),
        (o = m(g, 'DIV', { class: !0 })));
      var M = D(o);
      ((r = m(M, 'BUTTON', { class: !0, 'aria-label': !0, 'data-svelte-h': !0 })),
        U(r) !== 'svelte-1ck9bxm' && (r.textContent = C),
        (f = y(M)),
        (i = m(M, 'BUTTON', { class: !0, 'aria-label': !0, 'data-svelte-h': !0 })),
        U(i) !== 'svelte-x532q4' && (i.textContent = c),
        M.forEach(_),
        g.forEach(_),
        L.forEach(_),
        this.h());
    },
    h() {
      (d(s, 'class', 'update-toast__icon svelte-1uwaqt1'),
        d(u, 'class', 'update-toast__text svelte-1uwaqt1'),
        d(r, 'class', 'update-toast__button update-toast__button--primary svelte-1uwaqt1'),
        d(r, 'aria-label', 'Install update'),
        d(i, 'class', 'update-toast__button update-toast__button--secondary svelte-1uwaqt1'),
        d(i, 'aria-label', 'Dismiss update notification'),
        d(o, 'class', 'update-toast__actions svelte-1uwaqt1'),
        d(e, 'class', 'update-toast__content svelte-1uwaqt1'),
        d(t, 'class', 'update-toast svelte-1uwaqt1'),
        d(t, 'role', 'alert'),
        d(t, 'aria-live', 'polite'));
    },
    m(w, L) {
      (I(w, t, L),
        h(t, e),
        h(e, s),
        h(e, n),
        h(e, u),
        h(e, v),
        h(e, o),
        h(o, r),
        h(o, f),
        h(o, i),
        E || ((S = [x(r, 'click', a[2]), x(i, 'click', a[3])]), (E = !0)));
    },
    p: P,
    d(w) {
      (w && _(t), (E = !1), lt(S));
    },
  };
}
function X(a) {
  let t,
    e =
      '<div class="update-toast__content svelte-1uwaqt1"><div class="update-toast__icon svelte-1uwaqt1"><div class="update-toast__spinner svelte-1uwaqt1"></div></div> <div class="update-toast__text svelte-1uwaqt1"><div class="update-toast__title svelte-1uwaqt1">Installing Update</div> <div class="update-toast__message svelte-1uwaqt1">Please wait while we install the latest version...</div></div></div>';
  return {
    c() {
      ((t = b('div')), (t.innerHTML = e), this.h());
    },
    l(s) {
      ((t = m(s, 'DIV', { class: !0, role: !0, 'aria-live': !0, 'data-svelte-h': !0 })),
        U(t) !== 'svelte-b76ve3' && (t.innerHTML = e),
        this.h());
    },
    h() {
      (d(t, 'class', 'update-toast update-toast--installing svelte-1uwaqt1'),
        d(t, 'role', 'status'),
        d(t, 'aria-live', 'polite'));
    },
    m(s, l) {
      I(s, t, l);
    },
    d(s) {
      s && _(t);
    },
  };
}
function It(a) {
  let t,
    e,
    s = a[1] && Q(a),
    l = a[0].isInstalling && X();
  return {
    c() {
      (s && s.c(), (t = k()), l && l.c(), (e = V()));
    },
    l(n) {
      (s && s.l(n), (t = y(n)), l && l.l(n), (e = V()));
    },
    m(n, u) {
      (s && s.m(n, u), I(n, t, u), l && l.m(n, u), I(n, e, u));
    },
    p(n, [u]) {
      (n[1]
        ? s
          ? s.p(n, u)
          : ((s = Q(n)), s.c(), s.m(t.parentNode, t))
        : s && (s.d(1), (s = null)),
        n[0].isInstalling
          ? l || ((l = X()), l.c(), l.m(e.parentNode, e))
          : l && (l.d(1), (l = null)));
    },
    i: P,
    o: P,
    d(n) {
      (n && (_(t), _(e)), s && s.d(n), l && l.d(n));
    },
  };
}
function Ct(a, t, e) {
  let s = { isUpdateAvailable: !1, isInstalling: !1, isInstalled: !1 },
    l = !1,
    n = null;
  (B(() => {
    if (typeof window > 'u') return;
    const v = J();
    ((n = v.onUpdate((o) => {
      (e(0, (s = o)), e(1, (l = o.isUpdateAvailable && !o.isInstalling)));
    })),
      v.checkForUpdates());
  }),
    O(() => {
      n && n();
    }));
  async function u() {
    await J().applyUpdate();
  }
  function p() {
    e(1, (l = !1));
  }
  return [s, l, u, p];
}
class Lt extends z {
  constructor(t) {
    (super(), F(this, t, Ct, It, N, {}));
  }
}
function Y(a) {
  let t,
    e,
    s,
    l =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"></path></svg>',
    n,
    u,
    p =
      '<div id="install-title" class="install-prompt__title svelte-16t91j5">Install Draconia Chronicles</div> <div id="install-description" class="install-prompt__message svelte-16t91j5">Install this app on your device for a better gaming experience with offline play.</div>',
    v,
    o,
    r,
    C = 'Install',
    f,
    i,
    c = 'Not now',
    E,
    S;
  return {
    c() {
      ((t = b('div')),
        (e = b('div')),
        (s = b('div')),
        (s.innerHTML = l),
        (n = k()),
        (u = b('div')),
        (u.innerHTML = p),
        (v = k()),
        (o = b('div')),
        (r = b('button')),
        (r.textContent = C),
        (f = k()),
        (i = b('button')),
        (i.textContent = c),
        this.h());
    },
    l(w) {
      t = m(w, 'DIV', { class: !0, role: !0, 'aria-labelledby': !0, 'aria-describedby': !0 });
      var L = D(t);
      e = m(L, 'DIV', { class: !0 });
      var g = D(e);
      ((s = m(g, 'DIV', { class: !0, 'data-svelte-h': !0 })),
        U(s) !== 'svelte-17pa355' && (s.innerHTML = l),
        (n = y(g)),
        (u = m(g, 'DIV', { class: !0, 'data-svelte-h': !0 })),
        U(u) !== 'svelte-13founr' && (u.innerHTML = p),
        (v = y(g)),
        (o = m(g, 'DIV', { class: !0 })));
      var M = D(o);
      ((r = m(M, 'BUTTON', { class: !0, 'aria-label': !0, 'data-svelte-h': !0 })),
        U(r) !== 'svelte-1xeq92o' && (r.textContent = C),
        (f = y(M)),
        (i = m(M, 'BUTTON', { class: !0, 'aria-label': !0, 'data-svelte-h': !0 })),
        U(i) !== 'svelte-15l296w' && (i.textContent = c),
        M.forEach(_),
        g.forEach(_),
        L.forEach(_),
        this.h());
    },
    h() {
      (d(s, 'class', 'install-prompt__icon svelte-16t91j5'),
        d(u, 'class', 'install-prompt__text svelte-16t91j5'),
        d(r, 'class', 'install-prompt__button install-prompt__button--primary svelte-16t91j5'),
        d(r, 'aria-label', 'Install Draconia Chronicles'),
        d(i, 'class', 'install-prompt__button install-prompt__button--secondary svelte-16t91j5'),
        d(i, 'aria-label', 'Dismiss install prompt'),
        d(o, 'class', 'install-prompt__actions svelte-16t91j5'),
        d(e, 'class', 'install-prompt__content svelte-16t91j5'),
        d(t, 'class', 'install-prompt svelte-16t91j5'),
        d(t, 'role', 'dialog'),
        d(t, 'aria-labelledby', 'install-title'),
        d(t, 'aria-describedby', 'install-description'));
    },
    m(w, L) {
      (I(w, t, L),
        h(t, e),
        h(e, s),
        h(e, n),
        h(e, u),
        h(e, v),
        h(e, o),
        h(o, r),
        h(o, f),
        h(o, i),
        E || ((S = [x(r, 'click', a[2]), x(i, 'click', a[3])]), (E = !0)));
    },
    p: P,
    d(w) {
      (w && _(t), (E = !1), lt(S));
    },
  };
}
function Mt(a) {
  let t,
    e = a[0] && !a[1] && Y(a);
  return {
    c() {
      (e && e.c(), (t = V()));
    },
    l(s) {
      (e && e.l(s), (t = V()));
    },
    m(s, l) {
      (e && e.m(s, l), I(s, t, l));
    },
    p(s, [l]) {
      s[0] && !s[1]
        ? e
          ? e.p(s, l)
          : ((e = Y(s)), e.c(), e.m(t.parentNode, t))
        : e && (e.d(1), (e = null));
    },
    i: P,
    o: P,
    d(s) {
      (s && _(t), e && e.d(s));
    },
  };
}
function Ut(a, t, e) {
  let s = null,
    l = !1,
    n = !1;
  (B(() => {
    typeof window > 'u' ||
      (window.addEventListener('beforeinstallprompt', u),
      window.addEventListener('appinstalled', p),
      (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === !0) &&
        e(1, (n = !0)));
  }),
    O(() => {
      typeof window > 'u' ||
        (window.removeEventListener('beforeinstallprompt', u),
        window.removeEventListener('appinstalled', p));
    }));
  function u(r) {
    (r.preventDefault(), (s = r), e(0, (l = !0)));
  }
  function p() {
    (console.log('PWA was installed'), e(1, (n = !0)), e(0, (l = !1)), (s = null));
  }
  async function v() {
    if (!s) return;
    s.prompt();
    const { outcome: r } = await s.userChoice;
    (console.log(
      r === 'accepted' ? 'User accepted the install prompt' : 'User dismissed the install prompt',
    ),
      (s = null),
      e(0, (l = !1)));
  }
  function o() {
    e(0, (l = !1));
  }
  return [l, n, v, o];
}
class Dt extends z {
  constructor(t) {
    (super(), F(this, t, Ut, Mt, N, {}));
  }
}
const Et = (a) => ({}),
  tt = (a) => ({});
function et(a) {
  let t;
  const e = a[3].hud,
    s = at(e, a, a[2], tt);
  return {
    c() {
      s && s.c();
    },
    l(l) {
      s && s.l(l);
    },
    m(l, n) {
      (s && s.m(l, n), (t = !0));
    },
    p(l, n) {
      s && s.p && (!t || n & 4) && it(s, e, l, l[2], t ? rt(e, l[2], n, Et) : nt(l[2]), tt);
    },
    i(l) {
      t || (T(s, l), (t = !0));
    },
    o(l) {
      ($(s, l), (t = !1));
    },
    d(l) {
      s && s.d(l);
    },
  };
}
function Tt(a) {
  let t,
    e,
    s,
    l,
    n,
    u,
    p,
    v,
    o,
    r = a[1] && et(a);
  ((n = new Lt({})), (p = new Dt({})));
  const C = a[3].default,
    f = at(C, a, a[2], null);
  return {
    c() {
      ((t = b('div')),
        (e = b('canvas')),
        (s = k()),
        r && r.c(),
        (l = k()),
        K(n.$$.fragment),
        (u = k()),
        K(p.$$.fragment),
        (v = k()),
        f && f.c(),
        this.h());
    },
    l(i) {
      t = m(i, 'DIV', { style: !0 });
      var c = D(t);
      ((e = m(c, 'CANVAS', { style: !0 })),
        D(e).forEach(_),
        (s = y(c)),
        r && r.l(c),
        c.forEach(_),
        (l = y(i)),
        G(n.$$.fragment, i),
        (u = y(i)),
        G(p.$$.fragment, i),
        (v = y(i)),
        f && f.l(i),
        this.h());
    },
    h() {
      (A(e, 'width', '100%'),
        A(e, 'height', '100%'),
        A(e, 'display', 'block'),
        A(t, 'position', 'fixed'),
        A(t, 'inset', '0'),
        A(t, 'overflow', 'hidden'));
    },
    m(i, c) {
      (I(i, t, c),
        h(t, e),
        a[4](e),
        h(t, s),
        r && r.m(t, null),
        I(i, l, c),
        Z(n, i, c),
        I(i, u, c),
        Z(p, i, c),
        I(i, v, c),
        f && f.m(i, c),
        (o = !0));
    },
    p(i, [c]) {
      (i[1]
        ? r
          ? (r.p(i, c), c & 2 && T(r, 1))
          : ((r = et(i)), r.c(), T(r, 1), r.m(t, null))
        : r &&
          (ft(),
          $(r, 1, 1, () => {
            r = null;
          }),
          pt()),
        f && f.p && (!o || c & 4) && it(f, C, i, i[2], o ? rt(C, i[2], c, null) : nt(i[2]), null));
    },
    i(i) {
      o || (T(r), T(n.$$.fragment, i), T(p.$$.fragment, i), T(f, i), (o = !0));
    },
    o(i) {
      ($(r), $(n.$$.fragment, i), $(p.$$.fragment, i), $(f, i), (o = !1));
    },
    d(i) {
      (i && (_(t), _(l), _(u), _(v)), a[4](null), r && r.d(), R(n, i), R(p, i), f && f.d(i));
    },
  };
}
function qt(a, t, e) {
  let s;
  dt(a, st, (o) => e(1, (s = o)));
  let { $$slots: l = {}, $$scope: n } = t,
    u,
    p = null;
  (B(async () => {
    p = await yt(u);
  }),
    O(() => p?.destroy()));
  function v(o) {
    ct[o ? 'unshift' : 'push'](() => {
      ((u = o), e(0, u));
    });
  }
  return (
    (a.$$set = (o) => {
      '$$scope' in o && e(2, (n = o.$$scope));
    }),
    [u, s, n, l, v]
  );
}
class xt extends z {
  constructor(t) {
    (super(), F(this, t, qt, Tt, N, {}));
  }
}
export { xt as component, Vt as universal };
