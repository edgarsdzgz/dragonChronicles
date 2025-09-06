import { D as wt, u as A, b as Y, j as Pt, l as It, w as Et, E as Bt } from './index.B-5O6jHt.js';
const G = Object.create(null),
  K = Object.create(null);
function X(r, t) {
  let e = K[r];
  return (e === void 0 && (G[t] === void 0 && (G[t] = 1), (K[r] = e = G[t]++)), e);
}
let T;
function ct() {
  return ((!T || T?.isContextLost()) && (T = wt.get().createCanvas().getContext('webgl', {})), T);
}
let z;
function Tt() {
  if (!z) {
    z = 'mediump';
    const r = ct();
    r &&
      r.getShaderPrecisionFormat &&
      (z = r.getShaderPrecisionFormat(r.FRAGMENT_SHADER, r.HIGH_FLOAT).precision
        ? 'highp'
        : 'mediump');
  }
  return z;
}
function zt(r, t, e) {
  return t
    ? r
    : e
      ? ((r = r.replace('out vec4 finalColor;', '')),
        `

        #ifdef GL_ES // This checks if it is WebGL1
        #define in varying
        #define finalColor gl_FragColor
        #define texture texture2D
        #endif
        ${r}
        `)
      : `

        #ifdef GL_ES // This checks if it is WebGL1
        #define in attribute
        #define out varying
        #endif
        ${r}
        `;
}
function Ct(r, t, e) {
  const i = e ? t.maxSupportedFragmentPrecision : t.maxSupportedVertexPrecision;
  if (r.substring(0, 9) !== 'precision') {
    let s = e ? t.requestedFragmentPrecision : t.requestedVertexPrecision;
    return (
      s === 'highp' && i !== 'highp' && (s = 'mediump'),
      `precision ${s} float;
${r}`
    );
  } else if (i !== 'highp' && r.substring(0, 15) === 'precision highp')
    return r.replace('precision highp', 'precision mediump');
  return r;
}
function Gt(r, t) {
  return t
    ? `#version 300 es
${r}`
    : r;
}
const Rt = {},
  Dt = {};
function Vt(r, { name: t = 'pixi-program' }, e = !0) {
  ((t = t.replace(/\s+/g, '-')), (t += e ? '-fragment' : '-vertex'));
  const i = e ? Rt : Dt;
  return (
    i[t] ? (i[t]++, (t += `-${i[t]}`)) : (i[t] = 1),
    r.indexOf('#define SHADER_NAME') !== -1
      ? r
      : `${`#define SHADER_NAME ${t}`}
${r}`
  );
}
function Mt(r, t) {
  return t ? r.replace('#version 300 es', '') : r;
}
const R = {
    stripVersion: Mt,
    ensurePrecision: Ct,
    addProgramDefines: zt,
    setProgramName: Vt,
    insertVersion: Gt,
  },
  D = Object.create(null),
  lt = class O {
    constructor(t) {
      t = { ...O.defaultOptions, ...t };
      const e = t.fragment.indexOf('#version 300 es') !== -1,
        i = {
          stripVersion: e,
          ensurePrecision: {
            requestedFragmentPrecision: t.preferredFragmentPrecision,
            requestedVertexPrecision: t.preferredVertexPrecision,
            maxSupportedVertexPrecision: 'highp',
            maxSupportedFragmentPrecision: Tt(),
          },
          setProgramName: { name: t.name },
          addProgramDefines: e,
          insertVersion: e,
        };
      let s = t.fragment,
        n = t.vertex;
      (Object.keys(R).forEach((a) => {
        const o = i[a];
        ((s = R[a](s, o, !0)), (n = R[a](n, o, !1)));
      }),
        (this.fragment = s),
        (this.vertex = n),
        (this.transformFeedbackVaryings = t.transformFeedbackVaryings),
        (this._key = X(`${this.vertex}:${this.fragment}`, 'gl-program')));
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
      return (D[e] || (D[e] = new O(t)), D[e]);
    }
  };
lt.defaultOptions = { preferredVertexPrecision: 'highp', preferredFragmentPrecision: 'mediump' };
let ft = lt;
const Q = {
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
function $t(r) {
  return Q[r] ?? Q.float32;
}
const Ut = {
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
function Ft({ source: r, entryPoint: t }) {
  const e = {},
    i = r.indexOf(`fn ${t}`);
  if (i !== -1) {
    const s = r.indexOf('->', i);
    if (s !== -1) {
      const n = r.substring(i, s),
        a = /@location\((\d+)\)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>]+)(?:,|\s|$)/g;
      let o;
      for (; (o = a.exec(n)) !== null; ) {
        const u = Ut[o[3]] ?? 'float32';
        e[o[2]] = {
          location: parseInt(o[1], 10),
          format: u,
          stride: $t(u).stride,
          offset: 0,
          instance: !1,
          start: 0,
        };
      }
    }
  }
  return e;
}
function V(r) {
  const t = /(^|[^/])@(group|binding)\(\d+\)[^;]+;/g,
    e = /@group\((\d+)\)/,
    i = /@binding\((\d+)\)/,
    s = /var(<[^>]+>)? (\w+)/,
    n = /:\s*(\w+)/,
    a = /struct\s+(\w+)\s*{([^}]+)}/g,
    o = /(\w+)\s*:\s*([\w\<\>]+)/g,
    u = /struct\s+(\w+)/,
    h = r.match(t)?.map((l) => ({
      group: parseInt(l.match(e)[1], 10),
      binding: parseInt(l.match(i)[1], 10),
      name: l.match(s)[2],
      isUniform: l.match(s)[1] === '<uniform>',
      type: l.match(n)[1],
    }));
  if (!h) return { groups: [], structs: [] };
  const f =
    r
      .match(a)
      ?.map((l) => {
        const d = l.match(u)[1],
          m = l.match(o).reduce((p, x) => {
            const [c, y] = x.split(':');
            return ((p[c.trim()] = y.trim()), p);
          }, {});
        return m ? { name: d, members: m } : null;
      })
      .filter(({ name: l }) => h.some((d) => d.type === l)) ?? [];
  return { groups: h, structs: f };
}
var E = ((r) => (
  (r[(r.VERTEX = 1)] = 'VERTEX'),
  (r[(r.FRAGMENT = 2)] = 'FRAGMENT'),
  (r[(r.COMPUTE = 4)] = 'COMPUTE'),
  r
))(E || {});
function kt({ groups: r }) {
  const t = [];
  for (let e = 0; e < r.length; e++) {
    const i = r[e];
    (t[i.group] || (t[i.group] = []),
      i.isUniform
        ? t[i.group].push({
            binding: i.binding,
            visibility: E.VERTEX | E.FRAGMENT,
            buffer: { type: 'uniform' },
          })
        : i.type === 'sampler'
          ? t[i.group].push({
              binding: i.binding,
              visibility: E.FRAGMENT,
              sampler: { type: 'filtering' },
            })
          : i.type === 'texture_2d' &&
            t[i.group].push({
              binding: i.binding,
              visibility: E.FRAGMENT,
              texture: { sampleType: 'float', viewDimension: '2d', multisampled: !1 },
            }));
  }
  return t;
}
function Nt({ groups: r }) {
  const t = [];
  for (let e = 0; e < r.length; e++) {
    const i = r[e];
    (t[i.group] || (t[i.group] = {}), (t[i.group][i.name] = i.binding));
  }
  return t;
}
function Ot(r, t) {
  const e = new Set(),
    i = new Set(),
    s = [...r.structs, ...t.structs].filter((a) => (e.has(a.name) ? !1 : (e.add(a.name), !0))),
    n = [...r.groups, ...t.groups].filter((a) => {
      const o = `${a.name}-${a.binding}`;
      return i.has(o) ? !1 : (i.add(o), !0);
    });
  return { structs: s, groups: n };
}
const M = Object.create(null);
class C {
  constructor(t) {
    ((this._layoutKey = 0), (this._attributeLocationsKey = 0));
    const { fragment: e, vertex: i, layout: s, gpuLayout: n, name: a } = t;
    if (((this.name = a), (this.fragment = e), (this.vertex = i), e.source === i.source)) {
      const o = V(e.source);
      this.structsAndGroups = o;
    } else {
      const o = V(i.source),
        u = V(e.source);
      this.structsAndGroups = Ot(o, u);
    }
    ((this.layout = s ?? Nt(this.structsAndGroups)),
      (this.gpuLayout = n ?? kt(this.structsAndGroups)),
      (this.autoAssignGlobalUniforms = this.layout[0]?.globalUniforms !== void 0),
      (this.autoAssignLocalUniforms = this.layout[1]?.localUniforms !== void 0),
      this._generateProgramKey());
  }
  _generateProgramKey() {
    const { vertex: t, fragment: e } = this,
      i = t.source + e.source + t.entryPoint + e.entryPoint;
    this._layoutKey = X(i, 'program');
  }
  get attributeData() {
    return (this._attributeData ?? (this._attributeData = Ft(this.vertex)), this._attributeData);
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
    return (M[e] || (M[e] = new C(t)), M[e]);
  }
}
const ht = [
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
  Lt = ht.reduce((r, t) => ((r[t] = !0), r), {});
function jt(r, t) {
  switch (r) {
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
const dt = class mt {
  constructor(t, e) {
    ((this._touched = 0),
      (this.uid = A('uniform')),
      (this._resourceType = 'uniformGroup'),
      (this._resourceId = A('resource')),
      (this.isUniformGroup = !0),
      (this._dirtyId = 0),
      (this.destroyed = !1),
      (e = { ...mt.defaultOptions, ...e }),
      (this.uniformStructures = t));
    const i = {};
    for (const s in t) {
      const n = t[s];
      if (((n.name = s), (n.size = n.size ?? 1), !Lt[n.type]))
        throw new Error(
          `Uniform type ${n.type} is not supported. Supported uniform types are: ${ht.join(', ')}`,
        );
      (n.value ?? (n.value = jt(n.type, n.size)), (i[s] = n.value));
    }
    ((this.uniforms = i),
      (this._dirtyId = 1),
      (this.ubo = e.ubo),
      (this.isStatic = e.isStatic),
      (this._signature = X(
        Object.keys(i)
          .map((s) => `${s}-${t[s].type}`)
          .join('-'),
        'uniform-group',
      )));
  }
  update() {
    this._dirtyId++;
  }
};
dt.defaultOptions = { ubo: !1, isStatic: !1 };
let pt = dt;
class $ {
  constructor(t) {
    ((this.resources = Object.create(null)), (this._dirty = !0));
    let e = 0;
    for (const i in t) {
      const s = t[i];
      this.setResource(s, e++);
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
var L = ((r) => (
  (r[(r.WEBGL = 1)] = 'WEBGL'),
  (r[(r.WEBGPU = 2)] = 'WEBGPU'),
  (r[(r.BOTH = 3)] = 'BOTH'),
  r
))(L || {});
class W extends Y {
  constructor(t) {
    (super(),
      (this.uid = A('shader')),
      (this._uniformBindMap = Object.create(null)),
      (this._ownedBindGroups = []));
    let {
      gpuProgram: e,
      glProgram: i,
      groups: s,
      resources: n,
      compatibleRenderers: a,
      groupMap: o,
    } = t;
    ((this.gpuProgram = e),
      (this.glProgram = i),
      a === void 0 && ((a = 0), e && (a |= L.WEBGPU), i && (a |= L.WEBGL)),
      (this.compatibleRenderers = a));
    const u = {};
    if ((!n && !s && (n = {}), n && s))
      throw new Error('[Shader] Cannot have both resources and groups');
    if (!e && s && !o)
      throw new Error(
        '[Shader] No group map or WebGPU shader provided - consider using resources instead.',
      );
    if (!e && s && o)
      for (const h in o)
        for (const f in o[h]) {
          const l = o[h][f];
          u[l] = { group: h, binding: f, name: l };
        }
    else if (e && s && !o) {
      const h = e.structsAndGroups.groups;
      ((o = {}),
        h.forEach((f) => {
          ((o[f.group] = o[f.group] || {}), (o[f.group][f.binding] = f.name), (u[f.name] = f));
        }));
    } else if (n) {
      ((s = {}),
        (o = {}),
        e &&
          e.structsAndGroups.groups.forEach((l) => {
            ((o[l.group] = o[l.group] || {}), (o[l.group][l.binding] = l.name), (u[l.name] = l));
          }));
      let h = 0;
      for (const f in n)
        u[f] ||
          (s[99] || ((s[99] = new $()), this._ownedBindGroups.push(s[99])),
          (u[f] = { group: 99, binding: h, name: f }),
          (o[99] = o[99] || {}),
          (o[99][h] = f),
          h++);
      for (const f in n) {
        const l = f;
        let d = n[f];
        !d.source && !d._resourceType && (d = new pt(d));
        const m = u[l];
        m &&
          (s[m.group] || ((s[m.group] = new $()), this._ownedBindGroups.push(s[m.group])),
          s[m.group].setResource(d, m.binding));
      }
    }
    ((this.groups = s),
      (this._uniformBindMap = o),
      (this.resources = this._buildResourceAccessor(s, u)));
  }
  addResource(t, e, i) {
    var s, n;
    ((s = this._uniformBindMap)[e] || (s[e] = {}),
      (n = this._uniformBindMap[e])[i] || (n[i] = t),
      this.groups[e] || ((this.groups[e] = new $()), this._ownedBindGroups.push(this.groups[e])));
  }
  _buildResourceAccessor(t, e) {
    const i = {};
    for (const s in e) {
      const n = e[s];
      Object.defineProperty(i, n.name, {
        get() {
          return t[n.group].getResource(n.binding);
        },
        set(a) {
          t[n.group].setResource(a, n.binding);
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
    const { gpu: e, gl: i, ...s } = t;
    let n, a;
    return (
      e && (n = C.from(e)),
      i && (a = ft.from(i)),
      new W({ gpuProgram: n, glProgram: a, ...s })
    );
  }
}
class q {
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
function Z(r, t) {
  const e = (r.byteLength / 8) | 0,
    i = new Float64Array(r, 0, e);
  new Float64Array(t, 0, e).set(i);
  const n = r.byteLength - e * 8;
  if (n > 0) {
    const a = new Uint8Array(r, e * 8, n);
    new Uint8Array(t, e * 8, n).set(a);
  }
}
const Yt = { normal: 'normal-npm', add: 'add-npm', screen: 'screen-npm' };
var Xt = ((r) => (
  (r[(r.DISABLED = 0)] = 'DISABLED'),
  (r[(r.RENDERING_MASK_ADD = 1)] = 'RENDERING_MASK_ADD'),
  (r[(r.MASK_ACTIVE = 2)] = 'MASK_ACTIVE'),
  (r[(r.INVERSE_MASK_ACTIVE = 3)] = 'INVERSE_MASK_ACTIVE'),
  (r[(r.RENDERING_MASK_REMOVE = 4)] = 'RENDERING_MASK_REMOVE'),
  (r[(r.NONE = 5)] = 'NONE'),
  r
))(Xt || {});
function J(r, t) {
  return (t.alphaMode === 'no-premultiply-alpha' && Yt[r]) || r;
}
const Wt = [
  'precision mediump float;',
  'void main(void){',
  'float test = 0.1;',
  '%forloop%',
  'gl_FragColor = vec4(0.0);',
  '}',
].join(`
`);
function Ht(r) {
  let t = '';
  for (let e = 0; e < r; ++e)
    (e > 0 &&
      (t += `
else `),
      e < r - 1 && (t += `if(test == ${e}.0){}`));
  return t;
}
function Kt(r, t) {
  if (r === 0) throw new Error('Invalid value of `0` passed to `checkMaxIfStatementsInShader`');
  const e = t.createShader(t.FRAGMENT_SHADER);
  try {
    for (;;) {
      const i = Wt.replace(/%forloop%/gi, Ht(r));
      if ((t.shaderSource(e, i), t.compileShader(e), !t.getShaderParameter(e, t.COMPILE_STATUS)))
        r = (r / 2) | 0;
      else break;
    }
  } finally {
    t.deleteShader(e);
  }
  return r;
}
let P = null;
function Qt() {
  if (P) return P;
  const r = ct();
  return (
    (P = r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS)),
    (P = Kt(P, r)),
    r.getExtension('WEBGL_lose_context')?.loseContext(),
    P
  );
}
class qt {
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
class Zt {
  constructor() {
    ((this.renderPipeId = 'batch'),
      (this.action = 'startBatch'),
      (this.start = 0),
      (this.size = 0),
      (this.textures = new qt()),
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
const gt = [];
let j = 0;
function tt() {
  return j > 0 ? gt[--j] : new Zt();
}
function et(r) {
  gt[j++] = r;
}
let I = 0;
const xt = class bt {
  constructor(t) {
    ((this.uid = A('batcher')),
      (this.dirty = !0),
      (this.batchIndex = 0),
      (this.batches = []),
      (this._elements = []),
      (t = { ...bt.defaultOptions, ...t }),
      t.maxTextures ||
        (Pt(
          'v8.8.0',
          'maxTextures is a required option for Batcher now, please pass it in the options',
        ),
        (t.maxTextures = Qt())));
    const { maxTextures: e, attributesInitialSize: i, indicesInitialSize: s } = t;
    ((this.attributeBuffer = new q(i * 4)),
      (this.indexBuffer = new Uint16Array(s)),
      (this.maxTextures = e));
  }
  begin() {
    ((this.elementSize = 0),
      (this.elementStart = 0),
      (this.indexSize = 0),
      (this.attributeSize = 0));
    for (let t = 0; t < this.batchIndex; t++) et(this.batches[t]);
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
    let i = tt(),
      s = i.textures;
    s.clear();
    const n = e[this.elementStart];
    let a = J(n.blendMode, n.texture._source),
      o = n.topology;
    (this.attributeSize * 4 > this.attributeBuffer.size &&
      this._resizeAttributeBuffer(this.attributeSize * 4),
      this.indexSize > this.indexBuffer.length && this._resizeIndexBuffer(this.indexSize));
    const u = this.attributeBuffer.float32View,
      h = this.attributeBuffer.uint32View,
      f = this.indexBuffer;
    let l = this._batchIndexSize,
      d = this._batchIndexStart,
      m = 'startBatch';
    const p = this.maxTextures;
    for (let x = this.elementStart; x < this.elementSize; ++x) {
      const c = e[x];
      e[x] = null;
      const b = c.texture._source,
        g = J(c.blendMode, b),
        _ = a !== g || o !== c.topology;
      if (b._batchTick === I && !_) {
        ((c._textureId = b._textureBindLocation),
          (l += c.indexSize),
          c.packAsQuad
            ? (this.packQuadAttributes(c, u, h, c._attributeStart, c._textureId),
              this.packQuadIndex(f, c._indexStart, c._attributeStart / this.vertexSize))
            : (this.packAttributes(c, u, h, c._attributeStart, c._textureId),
              this.packIndex(c, f, c._indexStart, c._attributeStart / this.vertexSize)),
          (c._batch = i));
        continue;
      }
      ((b._batchTick = I),
        (s.count >= p || _) &&
          (this._finishBatch(i, d, l - d, s, a, o, t, m),
          (m = 'renderBatch'),
          (d = l),
          (a = g),
          (o = c.topology),
          (i = tt()),
          (s = i.textures),
          s.clear(),
          ++I),
        (c._textureId = b._textureBindLocation = s.count),
        (s.ids[b.uid] = s.count),
        (s.textures[s.count++] = b),
        (c._batch = i),
        (l += c.indexSize),
        c.packAsQuad
          ? (this.packQuadAttributes(c, u, h, c._attributeStart, c._textureId),
            this.packQuadIndex(f, c._indexStart, c._attributeStart / this.vertexSize))
          : (this.packAttributes(c, u, h, c._attributeStart, c._textureId),
            this.packIndex(c, f, c._indexStart, c._attributeStart / this.vertexSize)));
    }
    (s.count > 0 && (this._finishBatch(i, d, l - d, s, a, o, t, m), (d = l), ++I),
      (this.elementStart = this.elementSize),
      (this._batchIndexStart = d),
      (this._batchIndexSize = l));
  }
  _finishBatch(t, e, i, s, n, a, o, u) {
    ((t.gpuBindGroup = null),
      (t.bindGroup = null),
      (t.action = u),
      (t.batcher = this),
      (t.textures = s),
      (t.blendMode = n),
      (t.topology = a),
      (t.start = e),
      (t.size = i),
      ++I,
      (this.batches[this.batchIndex++] = t),
      o.add(t));
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
      i = new q(e);
    (Z(this.attributeBuffer.rawBinaryData, i.rawBinaryData), (this.attributeBuffer = i));
  }
  _resizeIndexBuffer(t) {
    const e = this.indexBuffer;
    let i = Math.max(t, e.length * 1.5);
    i += i % 2;
    const s = i > 65535 ? new Uint32Array(i) : new Uint16Array(i);
    if (s.BYTES_PER_ELEMENT !== e.BYTES_PER_ELEMENT) for (let n = 0; n < e.length; n++) s[n] = e[n];
    else Z(e.buffer, s.buffer);
    this.indexBuffer = s;
  }
  packQuadIndex(t, e, i) {
    ((t[e] = i + 0),
      (t[e + 1] = i + 1),
      (t[e + 2] = i + 2),
      (t[e + 3] = i + 0),
      (t[e + 4] = i + 2),
      (t[e + 5] = i + 3));
  }
  packIndex(t, e, i, s) {
    const n = t.indices,
      a = t.indexSize,
      o = t.indexOffset,
      u = t.attributeOffset;
    for (let h = 0; h < a; h++) e[i++] = s + n[h + o] - u;
  }
  destroy() {
    for (let t = 0; t < this.batches.length; t++) et(this.batches[t]);
    this.batches = null;
    for (let t = 0; t < this._elements.length; t++) this._elements[t]._batch = null;
    ((this._elements = null),
      (this.indexBuffer = null),
      this.attributeBuffer.destroy(),
      (this.attributeBuffer = null));
  }
};
xt.defaultOptions = { maxTextures: null, attributesInitialSize: 4, indicesInitialSize: 6 };
let Jt = xt;
var v = ((r) => (
  (r[(r.MAP_READ = 1)] = 'MAP_READ'),
  (r[(r.MAP_WRITE = 2)] = 'MAP_WRITE'),
  (r[(r.COPY_SRC = 4)] = 'COPY_SRC'),
  (r[(r.COPY_DST = 8)] = 'COPY_DST'),
  (r[(r.INDEX = 16)] = 'INDEX'),
  (r[(r.VERTEX = 32)] = 'VERTEX'),
  (r[(r.UNIFORM = 64)] = 'UNIFORM'),
  (r[(r.STORAGE = 128)] = 'STORAGE'),
  (r[(r.INDIRECT = 256)] = 'INDIRECT'),
  (r[(r.QUERY_RESOLVE = 512)] = 'QUERY_RESOLVE'),
  (r[(r.STATIC = 1024)] = 'STATIC'),
  r
))(v || {});
class B extends Y {
  constructor(t) {
    let { data: e, size: i } = t;
    const { usage: s, label: n, shrinkToFit: a } = t;
    (super(),
      (this.uid = A('buffer')),
      (this._resourceType = 'buffer'),
      (this._resourceId = A('resource')),
      (this._touched = 0),
      (this._updateID = 1),
      (this._dataInt32 = null),
      (this.shrinkToFit = !0),
      (this.destroyed = !1),
      e instanceof Array && (e = new Float32Array(e)),
      (this._data = e),
      i ?? (i = e?.byteLength));
    const o = !!e;
    ((this.descriptor = { size: i, usage: s, mappedAtCreation: o, label: n }),
      (this.shrinkToFit = a ?? !0));
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
    return !!(this.descriptor.usage & v.STATIC);
  }
  set static(t) {
    t ? (this.descriptor.usage |= v.STATIC) : (this.descriptor.usage &= ~v.STATIC);
  }
  setDataWithSize(t, e, i) {
    if ((this._updateID++, (this._updateSize = e * t.BYTES_PER_ELEMENT), this._data === t)) {
      i && this.emit('update', this);
      return;
    }
    const s = this._data;
    if (((this._data = t), (this._dataInt32 = null), !s || s.length !== t.length)) {
      !this.shrinkToFit && s && t.byteLength < s.byteLength
        ? i && this.emit('update', this)
        : ((this.descriptor.size = t.byteLength),
          (this._resourceId = A('resource')),
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
function vt(r, t) {
  if (!(r instanceof B)) {
    let e = t ? v.INDEX : v.VERTEX;
    (r instanceof Array &&
      (t
        ? ((r = new Uint32Array(r)), (e = v.INDEX | v.COPY_DST))
        : ((r = new Float32Array(r)), (e = v.VERTEX | v.COPY_DST))),
      (r = new B({ data: r, label: t ? 'index-mesh-buffer' : 'vertex-mesh-buffer', usage: e })));
  }
  return r;
}
function te(r, t, e) {
  const i = r.getAttribute(t);
  if (!i) return ((e.minX = 0), (e.minY = 0), (e.maxX = 0), (e.maxY = 0), e);
  const s = i.buffer.data;
  let n = 1 / 0,
    a = 1 / 0,
    o = -1 / 0,
    u = -1 / 0;
  const h = s.BYTES_PER_ELEMENT,
    f = (i.offset || 0) / h,
    l = (i.stride || 2 * 4) / h;
  for (let d = f; d < s.length; d += l) {
    const m = s[d],
      p = s[d + 1];
    (m > o && (o = m), p > u && (u = p), m < n && (n = m), p < a && (a = p));
  }
  return ((e.minX = n), (e.minY = a), (e.maxX = o), (e.maxY = u), e);
}
function ee(r) {
  return (
    (r instanceof B || Array.isArray(r) || r.BYTES_PER_ELEMENT) && (r = { buffer: r }),
    (r.buffer = vt(r.buffer, !1)),
    r
  );
}
class re extends Y {
  constructor(t = {}) {
    (super(),
      (this.uid = A('geometry')),
      (this._layoutKey = 0),
      (this.instanceCount = 1),
      (this._bounds = new It()),
      (this._boundsDirty = !0));
    const { attributes: e, indexBuffer: i, topology: s } = t;
    if (((this.buffers = []), (this.attributes = {}), e))
      for (const n in e) this.addAttribute(n, e[n]);
    ((this.instanceCount = t.instanceCount ?? 1),
      i && this.addIndex(i),
      (this.topology = s || 'triangle-list'));
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
    const i = ee(e);
    (this.buffers.indexOf(i.buffer) === -1 &&
      (this.buffers.push(i.buffer),
      i.buffer.on('update', this.onBufferUpdate, this),
      i.buffer.on('change', this.onBufferUpdate, this)),
      (this.attributes[t] = i));
  }
  addIndex(t) {
    ((this.indexBuffer = vt(t, !0)), this.buffers.push(this.indexBuffer));
  }
  get bounds() {
    return this._boundsDirty
      ? ((this._boundsDirty = !1), te(this, 'aPosition', this._bounds))
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
const ie = new Float32Array(1),
  se = new Uint32Array(1);
class ne extends re {
  constructor() {
    const e = new B({
        data: ie,
        label: 'attribute-batch-buffer',
        usage: v.VERTEX | v.COPY_DST,
        shrinkToFit: !1,
      }),
      i = new B({
        data: se,
        label: 'index-batch-buffer',
        usage: v.INDEX | v.COPY_DST,
        shrinkToFit: !1,
      }),
      s = 6 * 4;
    super({
      attributes: {
        aPosition: { buffer: e, format: 'float32x2', stride: s, offset: 0 },
        aUV: { buffer: e, format: 'float32x2', stride: s, offset: 2 * 4 },
        aColor: { buffer: e, format: 'unorm8x4', stride: s, offset: 4 * 4 },
        aTextureIdAndRound: { buffer: e, format: 'uint16x2', stride: s, offset: 5 * 4 },
      },
      indexBuffer: i,
    });
  }
}
function rt(r, t, e) {
  if (r)
    for (const i in r) {
      const s = i.toLocaleLowerCase(),
        n = t[s];
      if (n) {
        let a = r[i];
        (i === 'header' && (a = a.replace(/@in\s+[^;]+;\s*/g, '').replace(/@out\s+[^;]+;\s*/g, '')),
          e && n.push(`//----${e}----//`),
          n.push(a));
      } else Et(`${i} placement hook does not exist in shader`);
    }
}
const oe = /\{\{(.*?)\}\}/g;
function it(r) {
  const t = {};
  return (
    (r.match(oe)?.map((i) => i.replace(/[{()}]/g, '')) ?? []).forEach((i) => {
      t[i] = [];
    }),
    t
  );
}
function st(r, t) {
  let e;
  const i = /@in\s+([^;]+);/g;
  for (; (e = i.exec(r)) !== null; ) t.push(e[1]);
}
function nt(r, t, e = !1) {
  const i = [];
  (st(t, i),
    r.forEach((o) => {
      o.header && st(o.header, i);
    }));
  const s = i;
  e && s.sort();
  const n = s.map((o, u) => `       @location(${u}) ${o},`).join(`
`);
  let a = t.replace(/@in\s+[^;]+;\s*/g, '');
  return (
    (a = a.replace(
      '{{in}}',
      `
${n}
`,
    )),
    a
  );
}
function ot(r, t) {
  let e;
  const i = /@out\s+([^;]+);/g;
  for (; (e = i.exec(r)) !== null; ) t.push(e[1]);
}
function ae(r) {
  const e = /\b(\w+)\s*:/g.exec(r);
  return e ? e[1] : '';
}
function ue(r) {
  const t = /@.*?\s+/g;
  return r.replace(t, '');
}
function ce(r, t) {
  const e = [];
  (ot(t, e),
    r.forEach((u) => {
      u.header && ot(u.header, e);
    }));
  let i = 0;
  const s = e.sort().map((u) => (u.indexOf('builtin') > -1 ? u : `@location(${i++}) ${u}`)).join(`,
`),
    n = e.sort().map((u) => `       var ${ue(u)};`).join(`
`),
    a = `return VSOutput(
            ${e.sort().map((u) => ` ${ae(u)}`).join(`,
`)});`;
  let o = t.replace(/@out\s+[^;]+;\s*/g, '');
  return (
    (o = o.replace(
      '{{struct}}',
      `
${s}
`,
    )),
    (o = o.replace(
      '{{start}}',
      `
${n}
`,
    )),
    (o = o.replace(
      '{{return}}',
      `
${a}
`,
    )),
    o
  );
}
function at(r, t) {
  let e = r;
  for (const i in t) {
    const s = t[i];
    s.join(`
`).length
      ? (e = e.replace(
          `{{${i}}}`,
          `//-----${i} START-----//
${s.join(`
`)}
//----${i} FINISH----//`,
        ))
      : (e = e.replace(`{{${i}}}`, ''));
  }
  return e;
}
const S = Object.create(null),
  U = new Map();
let le = 0;
function fe({ template: r, bits: t }) {
  const e = _t(r, t);
  if (S[e]) return S[e];
  const { vertex: i, fragment: s } = de(r, t);
  return ((S[e] = yt(i, s, t)), S[e]);
}
function he({ template: r, bits: t }) {
  const e = _t(r, t);
  return (S[e] || (S[e] = yt(r.vertex, r.fragment, t)), S[e]);
}
function de(r, t) {
  const e = t.map((a) => a.vertex).filter((a) => !!a),
    i = t.map((a) => a.fragment).filter((a) => !!a);
  let s = nt(e, r.vertex, !0);
  s = ce(e, s);
  const n = nt(i, r.fragment, !0);
  return { vertex: s, fragment: n };
}
function _t(r, t) {
  return (
    t
      .map((e) => (U.has(e) || U.set(e, le++), U.get(e)))
      .sort((e, i) => e - i)
      .join('-') +
    r.vertex +
    r.fragment
  );
}
function yt(r, t, e) {
  const i = it(r),
    s = it(t);
  return (
    e.forEach((n) => {
      (rt(n.vertex, i, n.name), rt(n.fragment, s, n.name));
    }),
    { vertex: at(r, i), fragment: at(t, s) }
  );
}
const me = `
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
  pe = `
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
  ge = `
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
  xe = `

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
  be = {
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
  ve = {
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
function _e({ bits: r, name: t }) {
  const e = fe({ template: { fragment: pe, vertex: me }, bits: [be, ...r] });
  return C.from({
    name: t,
    vertex: { source: e.vertex, entryPoint: 'main' },
    fragment: { source: e.fragment, entryPoint: 'main' },
  });
}
function ye({ bits: r, name: t }) {
  return new ft({ name: t, ...he({ template: { vertex: ge, fragment: xe }, bits: [ve, ...r] }) });
}
const Se = {
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
  Ae = {
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
  F = {};
function we(r) {
  const t = [];
  if (r === 1)
    (t.push('@group(1) @binding(0) var textureSource1: texture_2d<f32>;'),
      t.push('@group(1) @binding(1) var textureSampler1: sampler;'));
  else {
    let e = 0;
    for (let i = 0; i < r; i++)
      (t.push(`@group(1) @binding(${e++}) var textureSource${i + 1}: texture_2d<f32>;`),
        t.push(`@group(1) @binding(${e++}) var textureSampler${i + 1}: sampler;`));
  }
  return t.join(`
`);
}
function Pe(r) {
  const t = [];
  if (r === 1)
    t.push('outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);');
  else {
    t.push('switch vTextureId {');
    for (let e = 0; e < r; e++)
      (e === r - 1 ? t.push('  default:{') : t.push(`  case ${e}:{`),
        t.push(
          `      outColor = textureSampleGrad(textureSource${e + 1}, textureSampler${e + 1}, vUV, uvDx, uvDy);`,
        ),
        t.push('      break;}'));
    t.push('}');
  }
  return t.join(`
`);
}
function Ie(r) {
  return (
    F[r] ||
      (F[r] = {
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

                ${we(r)}
            `,
          main: `
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);

                ${Pe(r)}
            `,
        },
      }),
    F[r]
  );
}
const k = {};
function Ee(r) {
  const t = [];
  for (let e = 0; e < r; e++)
    (e > 0 && t.push('else'),
      e < r - 1 && t.push(`if(vTextureId < ${e}.5)`),
      t.push('{'),
      t.push(`	outColor = texture(uTextures[${e}], vUV);`),
      t.push('}'));
  return t.join(`
`);
}
function Be(r) {
  return (
    k[r] ||
      (k[r] = {
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

                uniform sampler2D uTextures[${r}];

            `,
          main: `

                ${Ee(r)}
            `,
        },
      }),
    k[r]
  );
}
const Te = {
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
  ze = {
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
  ut = {};
function Ce(r) {
  let t = ut[r];
  if (t) return t;
  const e = new Int32Array(r);
  for (let i = 0; i < r; i++) e[i] = i;
  return (
    (t = ut[r] = new pt({ uTextures: { value: e, type: 'i32', size: r } }, { isStatic: !0 })),
    t
  );
}
class Ge extends W {
  constructor(t) {
    const e = ye({ name: 'batch', bits: [Ae, Be(t), ze] }),
      i = _e({ name: 'batch', bits: [Se, Ie(t), Te] });
    super({ glProgram: e, gpuProgram: i, resources: { batchSamplers: Ce(t) } });
  }
}
let N = null;
const St = class At extends Jt {
  constructor(t) {
    (super(t),
      (this.geometry = new ne()),
      (this.name = At.extension.name),
      (this.vertexSize = 6),
      N ?? (N = new Ge(t.maxTextures)),
      (this.shader = N));
  }
  packAttributes(t, e, i, s, n) {
    const a = (n << 16) | (t.roundPixels & 65535),
      o = t.transform,
      u = o.a,
      h = o.b,
      f = o.c,
      l = o.d,
      d = o.tx,
      m = o.ty,
      { positions: p, uvs: x } = t,
      c = t.color,
      y = t.attributeOffset,
      b = y + t.attributeSize;
    for (let g = y; g < b; g++) {
      const _ = g * 2,
        w = p[_],
        H = p[_ + 1];
      ((e[s++] = u * w + f * H + d),
        (e[s++] = l * H + h * w + m),
        (e[s++] = x[_]),
        (e[s++] = x[_ + 1]),
        (i[s++] = c),
        (i[s++] = a));
    }
  }
  packQuadAttributes(t, e, i, s, n) {
    const a = t.texture,
      o = t.transform,
      u = o.a,
      h = o.b,
      f = o.c,
      l = o.d,
      d = o.tx,
      m = o.ty,
      p = t.bounds,
      x = p.maxX,
      c = p.minX,
      y = p.maxY,
      b = p.minY,
      g = a.uvs,
      _ = t.color,
      w = (n << 16) | (t.roundPixels & 65535);
    ((e[s + 0] = u * c + f * b + d),
      (e[s + 1] = l * b + h * c + m),
      (e[s + 2] = g.x0),
      (e[s + 3] = g.y0),
      (i[s + 4] = _),
      (i[s + 5] = w),
      (e[s + 6] = u * x + f * b + d),
      (e[s + 7] = l * b + h * x + m),
      (e[s + 8] = g.x1),
      (e[s + 9] = g.y1),
      (i[s + 10] = _),
      (i[s + 11] = w),
      (e[s + 12] = u * x + f * y + d),
      (e[s + 13] = l * y + h * x + m),
      (e[s + 14] = g.x2),
      (e[s + 15] = g.y2),
      (i[s + 16] = _),
      (i[s + 17] = w),
      (e[s + 18] = u * c + f * y + d),
      (e[s + 19] = l * y + h * c + m),
      (e[s + 20] = g.x3),
      (e[s + 21] = g.y3),
      (i[s + 22] = _),
      (i[s + 23] = w));
  }
};
St.extension = { type: [Bt.Batcher], name: 'default' };
let De = St;
export {
  $ as B,
  De as D,
  C as G,
  L as R,
  Xt as S,
  pt as U,
  q as V,
  v as a,
  B as b,
  X as c,
  _e as d,
  Se as e,
  Z as f,
  Ie as g,
  W as h,
  ft as i,
  $t as j,
  re as k,
  Kt as l,
  ye as m,
  Ae as n,
  Be as o,
  ze as p,
  Ce as q,
  Te as r,
  J as s,
};
