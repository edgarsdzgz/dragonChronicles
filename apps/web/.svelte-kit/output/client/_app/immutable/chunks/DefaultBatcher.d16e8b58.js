import{D as wt,u as A,E as X,G as Pt,d as It,A as Et,w as Bt,c as Tt}from"./index.29d1603d.js";const M=Object.create(null),Q=Object.create(null);function W(r,t){let e=Q[r];return e===void 0&&(M[t]===void 0&&(M[t]=1),Q[r]=e=M[t]++),e}let R;function lt(){return(!R||R?.isContextLost())&&(R=wt.get().createCanvas().getContext("webgl",{})),R}let C;function zt(){if(!C){C="mediump";const r=lt();r&&r.getShaderPrecisionFormat&&(C=r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision?"highp":"mediump")}return C}function Gt(r,t,e){return t?r:e?(r=r.replace("out vec4 finalColor;",""),`

        #ifdef GL_ES // This checks if it is WebGL1
        #define in varying
        #define finalColor gl_FragColor
        #define texture texture2D
        #endif
        ${r}
        `):`

        #ifdef GL_ES // This checks if it is WebGL1
        #define in attribute
        #define out varying
        #endif
        ${r}
        `}function Rt(r,t,e){const i=e?t.maxSupportedFragmentPrecision:t.maxSupportedVertexPrecision;if(r.substring(0,9)!=="precision"){let s=e?t.requestedFragmentPrecision:t.requestedVertexPrecision;return s==="highp"&&i!=="highp"&&(s="mediump"),`precision ${s} float;
${r}`}else if(i!=="highp"&&r.substring(0,15)==="precision highp")return r.replace("precision highp","precision mediump");return r}function Ct(r,t){return t?`#version 300 es
${r}`:r}const Dt={},Vt={};function Mt(r,{name:t="pixi-program"},e=!0){t=t.replace(/\s+/g,"-"),t+=e?"-fragment":"-vertex";const i=e?Dt:Vt;return i[t]?(i[t]++,t+=`-${i[t]}`):i[t]=1,r.indexOf("#define SHADER_NAME")!==-1?r:`${`#define SHADER_NAME ${t}`}
${r}`}function $t(r,t){return t?r.replace("#version 300 es",""):r}const $={stripVersion:$t,ensurePrecision:Rt,addProgramDefines:Gt,setProgramName:Mt,insertVersion:Ct},I=Object.create(null),ft=class j{constructor(t){t={...j.defaultOptions,...t};const e=t.fragment.indexOf("#version 300 es")!==-1,i={stripVersion:e,ensurePrecision:{requestedFragmentPrecision:t.preferredFragmentPrecision,requestedVertexPrecision:t.preferredVertexPrecision,maxSupportedVertexPrecision:"highp",maxSupportedFragmentPrecision:zt()},setProgramName:{name:t.name},addProgramDefines:e,insertVersion:e};let s=t.fragment,n=t.vertex;Object.keys($).forEach(a=>{const o=i[a];s=$[a](s,o,!0),n=$[a](n,o,!1)}),this.fragment=s,this.vertex=n,this.transformFeedbackVaryings=t.transformFeedbackVaryings,this._key=W(`${this.vertex}:${this.fragment}`,"gl-program")}destroy(){this.fragment=null,this.vertex=null,this._attributeData=null,this._uniformData=null,this._uniformBlockData=null,this.transformFeedbackVaryings=null,I[this._cacheKey]=null}static from(t){const e=`${t.vertex}:${t.fragment}`;return I[e]||(I[e]=new j(t),I[e]._cacheKey=e),I[e]}};ft.defaultOptions={preferredVertexPrecision:"highp",preferredFragmentPrecision:"mediump"};let ht=ft;const q={uint8x2:{size:2,stride:2,normalised:!1},uint8x4:{size:4,stride:4,normalised:!1},sint8x2:{size:2,stride:2,normalised:!1},sint8x4:{size:4,stride:4,normalised:!1},unorm8x2:{size:2,stride:2,normalised:!0},unorm8x4:{size:4,stride:4,normalised:!0},snorm8x2:{size:2,stride:2,normalised:!0},snorm8x4:{size:4,stride:4,normalised:!0},uint16x2:{size:2,stride:4,normalised:!1},uint16x4:{size:4,stride:8,normalised:!1},sint16x2:{size:2,stride:4,normalised:!1},sint16x4:{size:4,stride:8,normalised:!1},unorm16x2:{size:2,stride:4,normalised:!0},unorm16x4:{size:4,stride:8,normalised:!0},snorm16x2:{size:2,stride:4,normalised:!0},snorm16x4:{size:4,stride:8,normalised:!0},float16x2:{size:2,stride:4,normalised:!1},float16x4:{size:4,stride:8,normalised:!1},float32:{size:1,stride:4,normalised:!1},float32x2:{size:2,stride:8,normalised:!1},float32x3:{size:3,stride:12,normalised:!1},float32x4:{size:4,stride:16,normalised:!1},uint32:{size:1,stride:4,normalised:!1},uint32x2:{size:2,stride:8,normalised:!1},uint32x3:{size:3,stride:12,normalised:!1},uint32x4:{size:4,stride:16,normalised:!1},sint32:{size:1,stride:4,normalised:!1},sint32x2:{size:2,stride:8,normalised:!1},sint32x3:{size:3,stride:12,normalised:!1},sint32x4:{size:4,stride:16,normalised:!1}};function Ut(r){return q[r]??q.float32}const Ft={f32:"float32","vec2<f32>":"float32x2","vec3<f32>":"float32x3","vec4<f32>":"float32x4",vec2f:"float32x2",vec3f:"float32x3",vec4f:"float32x4",i32:"sint32","vec2<i32>":"sint32x2","vec3<i32>":"sint32x3","vec4<i32>":"sint32x4",u32:"uint32","vec2<u32>":"uint32x2","vec3<u32>":"uint32x3","vec4<u32>":"uint32x4",bool:"uint32","vec2<bool>":"uint32x2","vec3<bool>":"uint32x3","vec4<bool>":"uint32x4"};function kt({source:r,entryPoint:t}){const e={},i=r.indexOf(`fn ${t}`);if(i!==-1){const s=r.indexOf("->",i);if(s!==-1){const n=r.substring(i,s),a=/@location\((\d+)\)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>]+)(?:,|\s|$)/g;let o;for(;(o=a.exec(n))!==null;){const u=Ft[o[3]]??"float32";e[o[2]]={location:parseInt(o[1],10),format:u,stride:Ut(u).stride,offset:0,instance:!1,start:0}}}}return e}function U(r){const t=/(^|[^/])@(group|binding)\(\d+\)[^;]+;/g,e=/@group\((\d+)\)/,i=/@binding\((\d+)\)/,s=/var(<[^>]+>)? (\w+)/,n=/:\s*(\w+)/,a=/struct\s+(\w+)\s*{([^}]+)}/g,o=/(\w+)\s*:\s*([\w\<\>]+)/g,u=/struct\s+(\w+)/,h=r.match(t)?.map(l=>({group:parseInt(l.match(e)[1],10),binding:parseInt(l.match(i)[1],10),name:l.match(s)[2],isUniform:l.match(s)[1]==="<uniform>",type:l.match(n)[1]}));if(!h)return{groups:[],structs:[]};const f=r.match(a)?.map(l=>{const d=l.match(u)[1],m=l.match(o).reduce((p,x)=>{const[c,y]=x.split(":");return p[c.trim()]=y.trim(),p},{});return m?{name:d,members:m}:null}).filter(({name:l})=>h.some(d=>d.type===l))??[];return{groups:h,structs:f}}var T=(r=>(r[r.VERTEX=1]="VERTEX",r[r.FRAGMENT=2]="FRAGMENT",r[r.COMPUTE=4]="COMPUTE",r))(T||{});function Nt({groups:r}){const t=[];for(let e=0;e<r.length;e++){const i=r[e];t[i.group]||(t[i.group]=[]),i.isUniform?t[i.group].push({binding:i.binding,visibility:T.VERTEX|T.FRAGMENT,buffer:{type:"uniform"}}):i.type==="sampler"?t[i.group].push({binding:i.binding,visibility:T.FRAGMENT,sampler:{type:"filtering"}}):i.type==="texture_2d"&&t[i.group].push({binding:i.binding,visibility:T.FRAGMENT,texture:{sampleType:"float",viewDimension:"2d",multisampled:!1}})}return t}function Ot({groups:r}){const t=[];for(let e=0;e<r.length;e++){const i=r[e];t[i.group]||(t[i.group]={}),t[i.group][i.name]=i.binding}return t}function Lt(r,t){const e=new Set,i=new Set,s=[...r.structs,...t.structs].filter(a=>e.has(a.name)?!1:(e.add(a.name),!0)),n=[...r.groups,...t.groups].filter(a=>{const o=`${a.name}-${a.binding}`;return i.has(o)?!1:(i.add(o),!0)});return{structs:s,groups:n}}const E=Object.create(null);class V{constructor(t){this._layoutKey=0,this._attributeLocationsKey=0;const{fragment:e,vertex:i,layout:s,gpuLayout:n,name:a}=t;if(this.name=a,this.fragment=e,this.vertex=i,e.source===i.source){const o=U(e.source);this.structsAndGroups=o}else{const o=U(i.source),u=U(e.source);this.structsAndGroups=Lt(o,u)}this.layout=s??Ot(this.structsAndGroups),this.gpuLayout=n??Nt(this.structsAndGroups),this.autoAssignGlobalUniforms=this.layout[0]?.globalUniforms!==void 0,this.autoAssignLocalUniforms=this.layout[1]?.localUniforms!==void 0,this._generateProgramKey()}_generateProgramKey(){const{vertex:t,fragment:e}=this,i=t.source+e.source+t.entryPoint+e.entryPoint;this._layoutKey=W(i,"program")}get attributeData(){return this._attributeData??(this._attributeData=kt(this.vertex)),this._attributeData}destroy(){this.gpuLayout=null,this.layout=null,this.structsAndGroups=null,this.fragment=null,this.vertex=null,E[this._cacheKey]=null}static from(t){const e=`${t.vertex.source}:${t.fragment.source}:${t.fragment.entryPoint}:${t.vertex.entryPoint}`;return E[e]||(E[e]=new V(t),E[e]._cacheKey=e),E[e]}}const dt=["f32","i32","vec2<f32>","vec3<f32>","vec4<f32>","mat2x2<f32>","mat3x3<f32>","mat4x4<f32>","mat3x2<f32>","mat4x2<f32>","mat2x3<f32>","mat4x3<f32>","mat2x4<f32>","mat3x4<f32>","vec2<i32>","vec3<i32>","vec4<i32>"],jt=dt.reduce((r,t)=>(r[t]=!0,r),{});function Yt(r,t){switch(r){case"f32":return 0;case"vec2<f32>":return new Float32Array(2*t);case"vec3<f32>":return new Float32Array(3*t);case"vec4<f32>":return new Float32Array(4*t);case"mat2x2<f32>":return new Float32Array([1,0,0,1]);case"mat3x3<f32>":return new Float32Array([1,0,0,0,1,0,0,0,1]);case"mat4x4<f32>":return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}return null}const mt=class pt{constructor(t,e){this._touched=0,this.uid=A("uniform"),this._resourceType="uniformGroup",this._resourceId=A("resource"),this.isUniformGroup=!0,this._dirtyId=0,this.destroyed=!1,e={...pt.defaultOptions,...e},this.uniformStructures=t;const i={};for(const s in t){const n=t[s];if(n.name=s,n.size=n.size??1,!jt[n.type]){const a=n.type.match(/^array<(\w+(?:<\w+>)?),\s*(\d+)>$/);if(a){const[,o,u]=a;throw new Error(`Uniform type ${n.type} is not supported. Use type: '${o}', size: ${u} instead.`)}throw new Error(`Uniform type ${n.type} is not supported. Supported uniform types are: ${dt.join(", ")}`)}n.value??(n.value=Yt(n.type,n.size)),i[s]=n.value}this.uniforms=i,this._dirtyId=1,this.ubo=e.ubo,this.isStatic=e.isStatic,this._signature=W(Object.keys(i).map(s=>`${s}-${t[s].type}`).join("-"),"uniform-group")}update(){this._dirtyId++}};mt.defaultOptions={ubo:!1,isStatic:!1};let gt=mt;class F{constructor(t){this.resources=Object.create(null),this._dirty=!0;let e=0;for(const i in t){const s=t[i];this.setResource(s,e++)}this._updateKey()}_updateKey(){if(!this._dirty)return;this._dirty=!1;const t=[];let e=0;for(const i in this.resources)t[e++]=this.resources[i]._resourceId;this._key=t.join("|")}setResource(t,e){const i=this.resources[e];t!==i&&(i&&t.off?.("change",this.onResourceChange,this),t.on?.("change",this.onResourceChange,this),this.resources[e]=t,this._dirty=!0)}getResource(t){return this.resources[t]}_touch(t){const e=this.resources;for(const i in e)e[i]._touched=t}destroy(){const t=this.resources;for(const e in t)t[e].off?.("change",this.onResourceChange,this);this.resources=null}onResourceChange(t){if(this._dirty=!0,t.destroyed){const e=this.resources;for(const i in e)e[i]===t&&(e[i]=null)}else this._updateKey()}}var Y=(r=>(r[r.WEBGL=1]="WEBGL",r[r.WEBGPU=2]="WEBGPU",r[r.BOTH=3]="BOTH",r))(Y||{});class H extends X{constructor(t){super(),this.uid=A("shader"),this._uniformBindMap=Object.create(null),this._ownedBindGroups=[];let{gpuProgram:e,glProgram:i,groups:s,resources:n,compatibleRenderers:a,groupMap:o}=t;this.gpuProgram=e,this.glProgram=i,a===void 0&&(a=0,e&&(a|=Y.WEBGPU),i&&(a|=Y.WEBGL)),this.compatibleRenderers=a;const u={};if(!n&&!s&&(n={}),n&&s)throw new Error("[Shader] Cannot have both resources and groups");if(!e&&s&&!o)throw new Error("[Shader] No group map or WebGPU shader provided - consider using resources instead.");if(!e&&s&&o)for(const h in o)for(const f in o[h]){const l=o[h][f];u[l]={group:h,binding:f,name:l}}else if(e&&s&&!o){const h=e.structsAndGroups.groups;o={},h.forEach(f=>{o[f.group]=o[f.group]||{},o[f.group][f.binding]=f.name,u[f.name]=f})}else if(n){s={},o={},e&&e.structsAndGroups.groups.forEach(l=>{o[l.group]=o[l.group]||{},o[l.group][l.binding]=l.name,u[l.name]=l});let h=0;for(const f in n)u[f]||(s[99]||(s[99]=new F,this._ownedBindGroups.push(s[99])),u[f]={group:99,binding:h,name:f},o[99]=o[99]||{},o[99][h]=f,h++);for(const f in n){const l=f;let d=n[f];!d.source&&!d._resourceType&&(d=new gt(d));const m=u[l];m&&(s[m.group]||(s[m.group]=new F,this._ownedBindGroups.push(s[m.group])),s[m.group].setResource(d,m.binding))}}this.groups=s,this._uniformBindMap=o,this.resources=this._buildResourceAccessor(s,u)}addResource(t,e,i){var s,n;(s=this._uniformBindMap)[e]||(s[e]={}),(n=this._uniformBindMap[e])[i]||(n[i]=t),this.groups[e]||(this.groups[e]=new F,this._ownedBindGroups.push(this.groups[e]))}_buildResourceAccessor(t,e){const i={};for(const s in e){const n=e[s];Object.defineProperty(i,n.name,{get(){return t[n.group].getResource(n.binding)},set(a){t[n.group].setResource(a,n.binding)}})}return i}destroy(t=!1){this.emit("destroy",this),t&&(this.gpuProgram?.destroy(),this.glProgram?.destroy()),this.gpuProgram=null,this.glProgram=null,this.removeAllListeners(),this._uniformBindMap=null,this._ownedBindGroups.forEach(e=>{e.destroy()}),this._ownedBindGroups=null,this.resources=null,this.groups=null}static from(t){const{gpu:e,gl:i,...s}=t;let n,a;return e&&(n=V.from(e)),i&&(a=ht.from(i)),new H({gpuProgram:n,glProgram:a,...s})}}class Z{constructor(t){typeof t=="number"?this.rawBinaryData=new ArrayBuffer(t):t instanceof Uint8Array?this.rawBinaryData=t.buffer:this.rawBinaryData=t,this.uint32View=new Uint32Array(this.rawBinaryData),this.float32View=new Float32Array(this.rawBinaryData),this.size=this.rawBinaryData.byteLength}get int8View(){return this._int8View||(this._int8View=new Int8Array(this.rawBinaryData)),this._int8View}get uint8View(){return this._uint8View||(this._uint8View=new Uint8Array(this.rawBinaryData)),this._uint8View}get int16View(){return this._int16View||(this._int16View=new Int16Array(this.rawBinaryData)),this._int16View}get int32View(){return this._int32View||(this._int32View=new Int32Array(this.rawBinaryData)),this._int32View}get float64View(){return this._float64Array||(this._float64Array=new Float64Array(this.rawBinaryData)),this._float64Array}get bigUint64View(){return this._bigUint64Array||(this._bigUint64Array=new BigUint64Array(this.rawBinaryData)),this._bigUint64Array}view(t){return this[`${t}View`]}destroy(){this.rawBinaryData=null,this._int8View=null,this._uint8View=null,this._int16View=null,this.uint16View=null,this._int32View=null,this.uint32View=null,this.float32View=null}static sizeOf(t){switch(t){case"int8":case"uint8":return 1;case"int16":case"uint16":return 2;case"int32":case"uint32":case"float32":return 4;default:throw new Error(`${t} isn't a valid view type`)}}}function J(r,t){const e=r.byteLength/8|0,i=new Float64Array(r,0,e);new Float64Array(t,0,e).set(i);const n=r.byteLength-e*8;if(n>0){const a=new Uint8Array(r,e*8,n);new Uint8Array(t,e*8,n).set(a)}}const Xt={normal:"normal-npm",add:"add-npm",screen:"screen-npm"};var Wt=(r=>(r[r.DISABLED=0]="DISABLED",r[r.RENDERING_MASK_ADD=1]="RENDERING_MASK_ADD",r[r.MASK_ACTIVE=2]="MASK_ACTIVE",r[r.INVERSE_MASK_ACTIVE=3]="INVERSE_MASK_ACTIVE",r[r.RENDERING_MASK_REMOVE=4]="RENDERING_MASK_REMOVE",r[r.NONE=5]="NONE",r))(Wt||{});function tt(r,t){return t.alphaMode==="no-premultiply-alpha"&&Xt[r]||r}const Ht=["precision mediump float;","void main(void){","float test = 0.1;","%forloop%","gl_FragColor = vec4(0.0);","}"].join(`
`);function Kt(r){let t="";for(let e=0;e<r;++e)e>0&&(t+=`
else `),e<r-1&&(t+=`if(test == ${e}.0){}`);return t}function Qt(r,t){if(r===0)throw new Error("Invalid value of `0` passed to `checkMaxIfStatementsInShader`");const e=t.createShader(t.FRAGMENT_SHADER);try{for(;;){const i=Ht.replace(/%forloop%/gi,Kt(r));if(t.shaderSource(e,i),t.compileShader(e),!t.getShaderParameter(e,t.COMPILE_STATUS))r=r/2|0;else break}}finally{t.deleteShader(e)}return r}let P=null;function qt(){if(P)return P;const r=lt();return P=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),P=Qt(P,r),r.getExtension("WEBGL_lose_context")?.loseContext(),P}class Zt{constructor(){this.ids=Object.create(null),this.textures=[],this.count=0}clear(){for(let t=0;t<this.count;t++){const e=this.textures[t];this.textures[t]=null,this.ids[e.uid]=null}this.count=0}}class Jt{constructor(){this.renderPipeId="batch",this.action="startBatch",this.start=0,this.size=0,this.textures=new Zt,this.blendMode="normal",this.topology="triangle-strip",this.canBundle=!0}destroy(){this.textures=null,this.gpuBindGroup=null,this.bindGroup=null,this.batcher=null}}const z=[];let D=0;Pt.register({clear:()=>{if(z.length>0)for(const r of z)r&&r.destroy();z.length=0,D=0}});function et(){return D>0?z[--D]:new Jt}function rt(r){z[D++]=r}let B=0;const xt=class _t{constructor(t){this.uid=A("batcher"),this.dirty=!0,this.batchIndex=0,this.batches=[],this._elements=[],t={..._t.defaultOptions,...t},t.maxTextures||(It("v8.8.0","maxTextures is a required option for Batcher now, please pass it in the options"),t.maxTextures=qt());const{maxTextures:e,attributesInitialSize:i,indicesInitialSize:s}=t;this.attributeBuffer=new Z(i*4),this.indexBuffer=new Uint16Array(s),this.maxTextures=e}begin(){this.elementSize=0,this.elementStart=0,this.indexSize=0,this.attributeSize=0;for(let t=0;t<this.batchIndex;t++)rt(this.batches[t]);this.batchIndex=0,this._batchIndexStart=0,this._batchIndexSize=0,this.dirty=!0}add(t){this._elements[this.elementSize++]=t,t._indexStart=this.indexSize,t._attributeStart=this.attributeSize,t._batcher=this,this.indexSize+=t.indexSize,this.attributeSize+=t.attributeSize*this.vertexSize}checkAndUpdateTexture(t,e){const i=t._batch.textures.ids[e._source.uid];return!i&&i!==0?!1:(t._textureId=i,t.texture=e,!0)}updateElement(t){this.dirty=!0;const e=this.attributeBuffer;t.packAsQuad?this.packQuadAttributes(t,e.float32View,e.uint32View,t._attributeStart,t._textureId):this.packAttributes(t,e.float32View,e.uint32View,t._attributeStart,t._textureId)}break(t){const e=this._elements;if(!e[this.elementStart])return;let i=et(),s=i.textures;s.clear();const n=e[this.elementStart];let a=tt(n.blendMode,n.texture._source),o=n.topology;this.attributeSize*4>this.attributeBuffer.size&&this._resizeAttributeBuffer(this.attributeSize*4),this.indexSize>this.indexBuffer.length&&this._resizeIndexBuffer(this.indexSize);const u=this.attributeBuffer.float32View,h=this.attributeBuffer.uint32View,f=this.indexBuffer;let l=this._batchIndexSize,d=this._batchIndexStart,m="startBatch";const p=this.maxTextures;for(let x=this.elementStart;x<this.elementSize;++x){const c=e[x];e[x]=null;const _=c.texture._source,g=tt(c.blendMode,_),v=a!==g||o!==c.topology;if(_._batchTick===B&&!v){c._textureId=_._textureBindLocation,l+=c.indexSize,c.packAsQuad?(this.packQuadAttributes(c,u,h,c._attributeStart,c._textureId),this.packQuadIndex(f,c._indexStart,c._attributeStart/this.vertexSize)):(this.packAttributes(c,u,h,c._attributeStart,c._textureId),this.packIndex(c,f,c._indexStart,c._attributeStart/this.vertexSize)),c._batch=i;continue}_._batchTick=B,(s.count>=p||v)&&(this._finishBatch(i,d,l-d,s,a,o,t,m),m="renderBatch",d=l,a=g,o=c.topology,i=et(),s=i.textures,s.clear(),++B),c._textureId=_._textureBindLocation=s.count,s.ids[_.uid]=s.count,s.textures[s.count++]=_,c._batch=i,l+=c.indexSize,c.packAsQuad?(this.packQuadAttributes(c,u,h,c._attributeStart,c._textureId),this.packQuadIndex(f,c._indexStart,c._attributeStart/this.vertexSize)):(this.packAttributes(c,u,h,c._attributeStart,c._textureId),this.packIndex(c,f,c._indexStart,c._attributeStart/this.vertexSize))}s.count>0&&(this._finishBatch(i,d,l-d,s,a,o,t,m),d=l,++B),this.elementStart=this.elementSize,this._batchIndexStart=d,this._batchIndexSize=l}_finishBatch(t,e,i,s,n,a,o,u){t.gpuBindGroup=null,t.bindGroup=null,t.action=u,t.batcher=this,t.textures=s,t.blendMode=n,t.topology=a,t.start=e,t.size=i,++B,this.batches[this.batchIndex++]=t,o.add(t)}finish(t){this.break(t)}ensureAttributeBuffer(t){t*4<=this.attributeBuffer.size||this._resizeAttributeBuffer(t*4)}ensureIndexBuffer(t){t<=this.indexBuffer.length||this._resizeIndexBuffer(t)}_resizeAttributeBuffer(t){const e=Math.max(t,this.attributeBuffer.size*2),i=new Z(e);J(this.attributeBuffer.rawBinaryData,i.rawBinaryData),this.attributeBuffer=i}_resizeIndexBuffer(t){const e=this.indexBuffer;let i=Math.max(t,e.length*1.5);i+=i%2;const s=i>65535?new Uint32Array(i):new Uint16Array(i);if(s.BYTES_PER_ELEMENT!==e.BYTES_PER_ELEMENT)for(let n=0;n<e.length;n++)s[n]=e[n];else J(e.buffer,s.buffer);this.indexBuffer=s}packQuadIndex(t,e,i){t[e]=i+0,t[e+1]=i+1,t[e+2]=i+2,t[e+3]=i+0,t[e+4]=i+2,t[e+5]=i+3}packIndex(t,e,i,s){const n=t.indices,a=t.indexSize,o=t.indexOffset,u=t.attributeOffset;for(let h=0;h<a;h++)e[i++]=s+n[h+o]-u}destroy(){if(this.batches!==null){for(let t=0;t<this.batches.length;t++)rt(this.batches[t]);this.batches=null;for(let t=0;t<this._elements.length;t++)this._elements[t]&&(this._elements[t]._batch=null);this._elements=null,this.indexBuffer=null,this.attributeBuffer.destroy(),this.attributeBuffer=null}}};xt.defaultOptions={maxTextures:null,attributesInitialSize:4,indicesInitialSize:6};let te=xt;var b=(r=>(r[r.MAP_READ=1]="MAP_READ",r[r.MAP_WRITE=2]="MAP_WRITE",r[r.COPY_SRC=4]="COPY_SRC",r[r.COPY_DST=8]="COPY_DST",r[r.INDEX=16]="INDEX",r[r.VERTEX=32]="VERTEX",r[r.UNIFORM=64]="UNIFORM",r[r.STORAGE=128]="STORAGE",r[r.INDIRECT=256]="INDIRECT",r[r.QUERY_RESOLVE=512]="QUERY_RESOLVE",r[r.STATIC=1024]="STATIC",r))(b||{});class G extends X{constructor(t){let{data:e,size:i}=t;const{usage:s,label:n,shrinkToFit:a}=t;super(),this.uid=A("buffer"),this._resourceType="buffer",this._resourceId=A("resource"),this._touched=0,this._updateID=1,this._dataInt32=null,this.shrinkToFit=!0,this.destroyed=!1,e instanceof Array&&(e=new Float32Array(e)),this._data=e,i??(i=e?.byteLength);const o=!!e;this.descriptor={size:i,usage:s,mappedAtCreation:o,label:n},this.shrinkToFit=a??!0}get data(){return this._data}set data(t){this.setDataWithSize(t,t.length,!0)}get dataInt32(){return this._dataInt32||(this._dataInt32=new Int32Array(this.data.buffer)),this._dataInt32}get static(){return!!(this.descriptor.usage&b.STATIC)}set static(t){t?this.descriptor.usage|=b.STATIC:this.descriptor.usage&=~b.STATIC}setDataWithSize(t,e,i){if(this._updateID++,this._updateSize=e*t.BYTES_PER_ELEMENT,this._data===t){i&&this.emit("update",this);return}const s=this._data;if(this._data=t,this._dataInt32=null,!s||s.length!==t.length){!this.shrinkToFit&&s&&t.byteLength<s.byteLength?i&&this.emit("update",this):(this.descriptor.size=t.byteLength,this._resourceId=A("resource"),this.emit("change",this));return}i&&this.emit("update",this)}update(t){this._updateSize=t??this._updateSize,this._updateID++,this.emit("update",this)}destroy(){this.destroyed=!0,this.emit("destroy",this),this.emit("change",this),this._data=null,this.descriptor=null,this.removeAllListeners()}}function bt(r,t){if(!(r instanceof G)){let e=t?b.INDEX:b.VERTEX;r instanceof Array&&(t?(r=new Uint32Array(r),e=b.INDEX|b.COPY_DST):(r=new Float32Array(r),e=b.VERTEX|b.COPY_DST)),r=new G({data:r,label:t?"index-mesh-buffer":"vertex-mesh-buffer",usage:e})}return r}function ee(r,t,e){const i=r.getAttribute(t);if(!i)return e.minX=0,e.minY=0,e.maxX=0,e.maxY=0,e;const s=i.buffer.data;let n=1/0,a=1/0,o=-1/0,u=-1/0;const h=s.BYTES_PER_ELEMENT,f=(i.offset||0)/h,l=(i.stride||2*4)/h;for(let d=f;d<s.length;d+=l){const m=s[d],p=s[d+1];m>o&&(o=m),p>u&&(u=p),m<n&&(n=m),p<a&&(a=p)}return e.minX=n,e.minY=a,e.maxX=o,e.maxY=u,e}function re(r){return(r instanceof G||Array.isArray(r)||r.BYTES_PER_ELEMENT)&&(r={buffer:r}),r.buffer=bt(r.buffer,!1),r}class ie extends X{constructor(t={}){super(),this.uid=A("geometry"),this._layoutKey=0,this.instanceCount=1,this._bounds=new Et,this._boundsDirty=!0;const{attributes:e,indexBuffer:i,topology:s}=t;if(this.buffers=[],this.attributes={},e)for(const n in e)this.addAttribute(n,e[n]);this.instanceCount=t.instanceCount??1,i&&this.addIndex(i),this.topology=s||"triangle-list"}onBufferUpdate(){this._boundsDirty=!0,this.emit("update",this)}getAttribute(t){return this.attributes[t]}getIndex(){return this.indexBuffer}getBuffer(t){return this.getAttribute(t).buffer}getSize(){for(const t in this.attributes){const e=this.attributes[t];return e.buffer.data.length/(e.stride/4||e.size)}return 0}addAttribute(t,e){const i=re(e);this.buffers.indexOf(i.buffer)===-1&&(this.buffers.push(i.buffer),i.buffer.on("update",this.onBufferUpdate,this),i.buffer.on("change",this.onBufferUpdate,this)),this.attributes[t]=i}addIndex(t){this.indexBuffer=bt(t,!0),this.buffers.push(this.indexBuffer)}get bounds(){return this._boundsDirty?(this._boundsDirty=!1,ee(this,"aPosition",this._bounds)):this._bounds}destroy(t=!1){this.emit("destroy",this),this.removeAllListeners(),t&&this.buffers.forEach(e=>e.destroy()),this.attributes=null,this.buffers=null,this.indexBuffer=null,this._bounds=null}}const se=new Float32Array(1),ne=new Uint32Array(1);class oe extends ie{constructor(){const e=new G({data:se,label:"attribute-batch-buffer",usage:b.VERTEX|b.COPY_DST,shrinkToFit:!1}),i=new G({data:ne,label:"index-batch-buffer",usage:b.INDEX|b.COPY_DST,shrinkToFit:!1}),s=6*4;super({attributes:{aPosition:{buffer:e,format:"float32x2",stride:s,offset:0},aUV:{buffer:e,format:"float32x2",stride:s,offset:2*4},aColor:{buffer:e,format:"unorm8x4",stride:s,offset:4*4},aTextureIdAndRound:{buffer:e,format:"uint16x2",stride:s,offset:5*4}},indexBuffer:i})}}function it(r,t,e){if(r)for(const i in r){const s=i.toLocaleLowerCase(),n=t[s];if(n){let a=r[i];i==="header"&&(a=a.replace(/@in\s+[^;]+;\s*/g,"").replace(/@out\s+[^;]+;\s*/g,"")),e&&n.push(`//----${e}----//`),n.push(a)}else Bt(`${i} placement hook does not exist in shader`)}}const ae=/\{\{(.*?)\}\}/g;function st(r){const t={};return(r.match(ae)?.map(i=>i.replace(/[{()}]/g,""))??[]).forEach(i=>{t[i]=[]}),t}function nt(r,t){let e;const i=/@in\s+([^;]+);/g;for(;(e=i.exec(r))!==null;)t.push(e[1])}function ot(r,t,e=!1){const i=[];nt(t,i),r.forEach(o=>{o.header&&nt(o.header,i)});const s=i;e&&s.sort();const n=s.map((o,u)=>`       @location(${u}) ${o},`).join(`
`);let a=t.replace(/@in\s+[^;]+;\s*/g,"");return a=a.replace("{{in}}",`
${n}
`),a}function at(r,t){let e;const i=/@out\s+([^;]+);/g;for(;(e=i.exec(r))!==null;)t.push(e[1])}function ue(r){const e=/\b(\w+)\s*:/g.exec(r);return e?e[1]:""}function ce(r){const t=/@.*?\s+/g;return r.replace(t,"")}function le(r,t){const e=[];at(t,e),r.forEach(u=>{u.header&&at(u.header,e)});let i=0;const s=e.sort().map(u=>u.indexOf("builtin")>-1?u:`@location(${i++}) ${u}`).join(`,
`),n=e.sort().map(u=>`       var ${ce(u)};`).join(`
`),a=`return VSOutput(
            ${e.sort().map(u=>` ${ue(u)}`).join(`,
`)});`;let o=t.replace(/@out\s+[^;]+;\s*/g,"");return o=o.replace("{{struct}}",`
${s}
`),o=o.replace("{{start}}",`
${n}
`),o=o.replace("{{return}}",`
${a}
`),o}function ut(r,t){let e=r;for(const i in t){const s=t[i];s.join(`
`).length?e=e.replace(`{{${i}}}`,`//-----${i} START-----//
${s.join(`
`)}
//----${i} FINISH----//`):e=e.replace(`{{${i}}}`,"")}return e}const S=Object.create(null),k=new Map;let fe=0;function he({template:r,bits:t}){const e=vt(r,t);if(S[e])return S[e];const{vertex:i,fragment:s}=me(r,t);return S[e]=yt(i,s,t),S[e]}function de({template:r,bits:t}){const e=vt(r,t);return S[e]||(S[e]=yt(r.vertex,r.fragment,t)),S[e]}function me(r,t){const e=t.map(a=>a.vertex).filter(a=>!!a),i=t.map(a=>a.fragment).filter(a=>!!a);let s=ot(e,r.vertex,!0);s=le(e,s);const n=ot(i,r.fragment,!0);return{vertex:s,fragment:n}}function vt(r,t){return t.map(e=>(k.has(e)||k.set(e,fe++),k.get(e))).sort((e,i)=>e-i).join("-")+r.vertex+r.fragment}function yt(r,t,e){const i=st(r),s=st(t);return e.forEach(n=>{it(n.vertex,i,n.name),it(n.fragment,s,n.name)}),{vertex:ut(r,i),fragment:ut(t,s)}}const pe=`
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
`,ge=`
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
`,xe=`
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
`,_e=`

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
`,be={name:"global-uniforms-bit",vertex:{header:`
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `}},ve={name:"global-uniforms-bit",vertex:{header:`
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `}};function ye({bits:r,name:t}){const e=he({template:{fragment:ge,vertex:pe},bits:[be,...r]});return V.from({name:t,vertex:{source:e.vertex,entryPoint:"main"},fragment:{source:e.fragment,entryPoint:"main"}})}function Se({bits:r,name:t}){return new ht({name:t,...de({template:{vertex:xe,fragment:_e},bits:[ve,...r]})})}const Ae={name:"color-bit",vertex:{header:`
            @in aColor: vec4<f32>;
        `,main:`
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `}},we={name:"color-bit",vertex:{header:`
            in vec4 aColor;
        `,main:`
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `}},N={};function Pe(r){const t=[];if(r===1)t.push("@group(1) @binding(0) var textureSource1: texture_2d<f32>;"),t.push("@group(1) @binding(1) var textureSampler1: sampler;");else{let e=0;for(let i=0;i<r;i++)t.push(`@group(1) @binding(${e++}) var textureSource${i+1}: texture_2d<f32>;`),t.push(`@group(1) @binding(${e++}) var textureSampler${i+1}: sampler;`)}return t.join(`
`)}function Ie(r){const t=[];if(r===1)t.push("outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);");else{t.push("switch vTextureId {");for(let e=0;e<r;e++)e===r-1?t.push("  default:{"):t.push(`  case ${e}:{`),t.push(`      outColor = textureSampleGrad(textureSource${e+1}, textureSampler${e+1}, vUV, uvDx, uvDy);`),t.push("      break;}");t.push("}")}return t.join(`
`)}function Ee(r){return N[r]||(N[r]={name:"texture-batch-bit",vertex:{header:`
                @in aTextureIdAndRound: vec2<u32>;
                @out @interpolate(flat) vTextureId : u32;
            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1)
                {
                    vPosition = vec4<f32>(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                }
            `},fragment:{header:`
                @in @interpolate(flat) vTextureId: u32;

                ${Pe(r)}
            `,main:`
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);

                ${Ie(r)}
            `}}),N[r]}const O={};function Be(r){const t=[];for(let e=0;e<r;e++)e>0&&t.push("else"),e<r-1&&t.push(`if(vTextureId < ${e}.5)`),t.push("{"),t.push(`	outColor = texture(uTextures[${e}], vUV);`),t.push("}");return t.join(`
`)}function Te(r){return O[r]||(O[r]={name:"texture-batch-bit",vertex:{header:`
                in vec2 aTextureIdAndRound;
                out float vTextureId;

            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `},fragment:{header:`
                in float vTextureId;

                uniform sampler2D uTextures[${r}];

            `,main:`

                ${Be(r)}
            `}}),O[r]}const ze={name:"round-pixels-bit",vertex:{header:`
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32>
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}},Ge={name:"round-pixels-bit",vertex:{header:`
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}},ct={};function Re(r){let t=ct[r];if(t)return t;const e=new Int32Array(r);for(let i=0;i<r;i++)e[i]=i;return t=ct[r]=new gt({uTextures:{value:e,type:"i32",size:r}},{isStatic:!0}),t}class Ce extends H{constructor(t){const e=Se({name:"batch",bits:[we,Te(t),Ge]}),i=ye({name:"batch",bits:[Ae,Ee(t),ze]});super({glProgram:e,gpuProgram:i,resources:{batchSamplers:Re(t)}})}}let L=null;const St=class At extends te{constructor(t){super(t),this.geometry=new oe,this.name=At.extension.name,this.vertexSize=6,L??(L=new Ce(t.maxTextures)),this.shader=L}packAttributes(t,e,i,s,n){const a=n<<16|t.roundPixels&65535,o=t.transform,u=o.a,h=o.b,f=o.c,l=o.d,d=o.tx,m=o.ty,{positions:p,uvs:x}=t,c=t.color,y=t.attributeOffset,_=y+t.attributeSize;for(let g=y;g<_;g++){const v=g*2,w=p[v],K=p[v+1];e[s++]=u*w+f*K+d,e[s++]=l*K+h*w+m,e[s++]=x[v],e[s++]=x[v+1],i[s++]=c,i[s++]=a}}packQuadAttributes(t,e,i,s,n){const a=t.texture,o=t.transform,u=o.a,h=o.b,f=o.c,l=o.d,d=o.tx,m=o.ty,p=t.bounds,x=p.maxX,c=p.minX,y=p.maxY,_=p.minY,g=a.uvs,v=t.color,w=n<<16|t.roundPixels&65535;e[s+0]=u*c+f*_+d,e[s+1]=l*_+h*c+m,e[s+2]=g.x0,e[s+3]=g.y0,i[s+4]=v,i[s+5]=w,e[s+6]=u*x+f*_+d,e[s+7]=l*_+h*x+m,e[s+8]=g.x1,e[s+9]=g.y1,i[s+10]=v,i[s+11]=w,e[s+12]=u*x+f*y+d,e[s+13]=l*y+h*x+m,e[s+14]=g.x2,e[s+15]=g.y2,i[s+16]=v,i[s+17]=w,e[s+18]=u*c+f*y+d,e[s+19]=l*y+h*c+m,e[s+20]=g.x3,e[s+21]=g.y3,i[s+22]=v,i[s+23]=w}};St.extension={type:[Tt.Batcher],name:"default"};let Ve=St;export{F as B,Ve as D,V as G,Y as R,Wt as S,gt as U,Z as V,b as a,G as b,W as c,ye as d,Ae as e,J as f,Ee as g,H as h,ht as i,Ut as j,ie as k,Qt as l,Se as m,we as n,Te as o,Ge as p,Re as q,ze as r,tt as s};
