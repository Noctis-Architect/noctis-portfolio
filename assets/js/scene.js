/* ==========================================================================
   Noctis Architect — 3D scene
   Dependency-free WebGL. ONE wireframe solid per page, in a fixed canvas
   that sits BEHIND the page content.

     home → icosphere · work → torus knot · about → cube · contact → octahedron

   Scroll choreography
     scrollY = 0  the solid sits whole next to the hero text
     scrolling    the whole solid glides to the edge of the screen and stops with its
                  centre exactly on the border, so half of it stays visible

   Page transitions
     Scene.dive()  flies the camera INTO the wireframe (leaving a page)
                   and back OUT of the next one (arriving on a page)
   ========================================================================== */
(function () {
  'use strict';

  var TAU = Math.PI * 2;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smoother = function (t) { t = clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };
  var easeOut = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };

  /* ---------------------------------------------------------------- geometry
     builders return segments [ax,ay,az,bx,by,bz], normalised to radius 1      */
  function normalise(segs) {
    var m = 0, i;
    for (i = 0; i < segs.length; i++) m = Math.max(m, Math.hypot(segs[i][0], segs[i][1], segs[i][2]), Math.hypot(segs[i][3], segs[i][4], segs[i][5]));
    return segs.map(function (s) { return s.map(function (v) { return v / m; }); });
  }
  function dedupe(segs) {
    var seen = {}, out = [], q = function (v) { return Math.round(v * 1e4); };
    segs.forEach(function (s) {
      var a = q(s[0]) + ',' + q(s[1]) + ',' + q(s[2]), b = q(s[3]) + ',' + q(s[4]) + ',' + q(s[5]);
      var k = a < b ? a + '|' + b : b + '|' + a;
      if (!seen[k]) { seen[k] = 1; out.push(s); }
    });
    return out;
  }
  function trisToSegs(v, f) {
    var seen = {}, out = [];
    function add(a, b) {
      var k = a < b ? a + '_' + b : b + '_' + a;
      if (seen[k]) return; seen[k] = 1;
      out.push([v[a][0], v[a][1], v[a][2], v[b][0], v[b][1], v[b][2]]);
    }
    f.forEach(function (t) { add(t[0], t[1]); add(t[1], t[2]); add(t[2], t[0]); });
    return out;
  }
  function subdivide(v, f, times, sphere) {
    v = v.map(function (p) { return p.slice(); });
    for (var s = 0; s < times; s++) {
      var cache = {}, nf = [];
      var mid = function (a, b) {
        var k = a < b ? a + '_' + b : b + '_' + a;
        if (cache[k] !== undefined) return cache[k];
        var p = [(v[a][0] + v[b][0]) / 2, (v[a][1] + v[b][1]) / 2, (v[a][2] + v[b][2]) / 2];
        if (sphere) { var l = Math.hypot(p[0], p[1], p[2]); p = [p[0] / l, p[1] / l, p[2] / l]; }
        v.push(p); cache[k] = v.length - 1; return cache[k];
      };
      f.forEach(function (t) {
        var ab = mid(t[0], t[1]), bc = mid(t[1], t[2]), ca = mid(t[2], t[0]);
        nf.push([t[0], ab, ca], [t[1], bc, ab], [t[2], ca, bc], [ab, bc, ca]);
      });
      f = nf;
    }
    if (sphere) v = v.map(function (p) { var l = Math.hypot(p[0], p[1], p[2]); return [p[0] / l, p[1] / l, p[2] / l]; });
    return { v: v, f: f };
  }

  var PHI = (1 + Math.sqrt(5)) / 2;
  var ICO_V = [[-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0], [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI], [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]];
  var ICO_F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];

  function geoIcosphere() { var m = subdivide(ICO_V, ICO_F, 2, true); return normalise(trisToSegs(m.v, m.f)); }
  function geoOctahedron() {
    var v = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    var f = [[0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4], [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5]];
    var m = subdivide(v, f, 3, false);
    return normalise(trisToSegs(m.v, m.f));
  }
  function geoCube(n) {
    var segs = [], k;
    for (var axis = 0; axis < 3; axis++) for (var sgn = -1; sgn <= 1; sgn += 2) for (k = 0; k <= n; k++) {
      var a = -1 + 2 * k / n, u = (axis + 1) % 3, w = (axis + 2) % 3;
      var p0 = [0, 0, 0], p1 = [0, 0, 0], q0 = [0, 0, 0], q1 = [0, 0, 0];
      p0[axis] = p1[axis] = q0[axis] = q1[axis] = sgn;
      p0[u] = p1[u] = a; p0[w] = -1; p1[w] = 1;
      q0[w] = q1[w] = a; q0[u] = -1; q1[u] = 1;
      segs.push(p0.concat(p1), q0.concat(q1));
    }
    return normalise(dedupe(segs));
  }
  function geoKnot(P, Q, tube, nu, nv) {
    var pos = function (u) {
      var qp = Q / P * u, cs = Math.cos(qp);
      return [(2 + cs) * 0.5 * Math.cos(u), (2 + cs) * 0.5 * Math.sin(u), Math.sin(qp) * 0.5];
    };
    var rings = [], i, j;
    for (i = 0; i < nu; i++) {
      var u = i / nu * TAU * P, p1 = pos(u), p2 = pos(u + 0.01);
      var T = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]], N = [p2[0] + p1[0], p2[1] + p1[1], p2[2] + p1[2]];
      var B = [T[1] * N[2] - T[2] * N[1], T[2] * N[0] - T[0] * N[2], T[0] * N[1] - T[1] * N[0]];
      N = [B[1] * T[2] - B[2] * T[1], B[2] * T[0] - B[0] * T[2], B[0] * T[1] - B[1] * T[0]];
      var ln = Math.hypot(N[0], N[1], N[2]), lb = Math.hypot(B[0], B[1], B[2]);
      N = N.map(function (x) { return x / ln; }); B = B.map(function (x) { return x / lb; });
      rings[i] = [];
      for (j = 0; j < nv; j++) {
        var v = j / nv * TAU, cx = -tube * Math.cos(v), cy = tube * Math.sin(v);
        rings[i][j] = [p1[0] + cx * N[0] + cy * B[0], p1[1] + cx * N[1] + cy * B[1], p1[2] + cx * N[2] + cy * B[2]];
      }
    }
    var segs = [];
    for (i = 0; i < nu; i++) for (j = 0; j < nv; j++) {
      var a = rings[i][j], b = rings[(i + 1) % nu][j], c = rings[i][(j + 1) % nv];
      segs.push(a.concat(b), a.concat(c));
    }
    return normalise(segs);
  }

  /* ----------------------------------------------------------------- matrices (column-major) */
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; }
    return o;
  }
  function persp(fov, asp, n, f) { var t = 1 / Math.tan(fov / 2), nf = 1 / (n - f); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]); }
  function rotX(a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }
  function rotY(a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); }
  function rotZ(a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
  function trans(x, y, z) { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]); }
  function scl(s) { return new Float32Array([s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1]); }

  /* ------------------------------------------------------------------- shaders */
  var VS =
    'attribute vec3 aA;attribute vec3 aB;attribute vec2 aC;attribute float aO;' +
    'uniform mat4 uM;uniform vec2 uRes;uniform float uW;uniform vec2 uZ;' +
    'varying float vS;varying float vT;varying float vO;' +
    'void main(){' +
    ' vec4 ca=uM*vec4(aA,1.);vec4 cb=uM*vec4(aB,1.);' +
    ' vec2 pa=ca.xy/ca.w*uRes*.5;vec2 pb=cb.xy/cb.w*uRes*.5;' +
    ' vec2 d=pb-pa;float l=length(d);d=l>.0001?d/l:vec2(1.,0.);' +
    ' vec2 n=vec2(-d.y,d.x);float e=aC.x;vec4 c=mix(ca,cb,e);vec2 p=mix(pa,pb,e);' +
    ' p+=n*aC.y*uW*.5+d*(e*2.-1.)*uW*.5;' +
    ' gl_Position=vec4(p/(uRes*.5)*c.w,c.z,c.w);' +
    ' vS=aC.y;vT=clamp((c.w-uZ.x)/uZ.y,0.,1.);vO=aO;}';
  var FS =
    'precision mediump float;uniform vec3 uC;uniform float uA;uniform float uR;uniform float uK;' +
    'varying float vS;varying float vT;varying float vO;' +
    'void main(){' +
    ' float cap=step(1.5,vO);float o=vO-2.*cap;' +
    ' float aa=1.-smoothstep(.4,1.,abs(vS));' +
    ' float rv=clamp((uR*1.35-o)/.35,0.,1.);' +
    ' float a=uA*aa*mix(1.,.3,vT)*rv*mix(1.,uK,cap);' +
    ' gl_FragColor=vec4(uC*a,a);}';
  var PVS =
    'attribute vec3 aP;uniform mat4 uM;uniform float uSz;varying float vD;' +
    'void main(){vec4 c=uM*vec4(aP,1.);gl_Position=c;gl_PointSize=uSz*(.6+.8*fract(aP.x*7.31+aP.y*3.17));vD=.35+.65*fract(aP.z*5.77);}';
  var PFS =
    'precision mediump float;uniform vec3 uC;uniform float uA;varying float vD;' +
    'void main(){vec2 q=gl_PointCoord-.5;float a=uA*vD*smoothstep(.5,.15,length(q));gl_FragColor=vec4(uC*a,a);}';

  /* ----------------------------------------------------------------- per-page design
     x,y: -1…1 of the viewport (y up) · s: diameter as a fraction of U = min(height, 0.9·width) · a: opacity
     side: which screen edge the solid parks against once the page is scrolled (mirrored in RTL)   */
  var PAGES = {
    home:    { geo: geoIcosphere,           side:  1, spin: [0.17, 0.10], hero: { x: 0.58, y: 0.02, s: 0.46, a: 0.95 } },
    work:    { geo: function () { return geoKnot(2, 3, 0.34, 130, 9); }, side: 1, spin: [-0.14, 0.09], hero: { x: 0.62, y: 0.34, s: 0.28, a: 0.60 } },
    about:   { geo: function () { return geoCube(5); },  side:  1, spin: [0.12, 0.07], hero: { x: 0.52, y: 0.16, s: 0.34, a: 0.92 } },
    contact: { geo: geoOctahedron,          side: -1, spin: [-0.12, 0.08], hero: { x: 0.60, y: 0.22, s: 0.38, a: 0.95 } },
    project: { geo: function () { return geoKnot(2, 3, 0.34, 130, 9); }, side: -1, spin: [-0.14, 0.09], hero: { x: 0.60, y: 0.24, s: 0.40, a: 0.95 } }
  };
  /* x = 1 means the centre sits exactly on the screen edge → half of the solid stays visible */
  var END = {
    wide:   { x: 1.00, y: 0.06, s: 0.58, a: 0.07 },
    narrow: { x: 1.00, y: 0.10, s: 0.50, a: 0.07 }
  };

  /* ------------------------------------------------------------------ state */
  var cv, gl, progS, progP, LS, LP, mesh = {}, pts = null, lost = false, running = false;
  var page = 'home', cfg = PAGES.home, zone = null;
  var W = 0, Hh = 0, dpr = 1, narrow = false, maxScroll = 0, vh = 800;
  var mirror = 1, mirrorT = 1;
  var ps = 0, psPrev = 0, boost = 0;
  var t0 = 0, last = 0, tClock = 0;
  var dv = 0, dvFrom = 0, dvTo = 0, dvT0 = 0, dvDur = 0, dvEase = easeOut;
  var mx = 0, my = 0, tmx = 0, tmy = 0;
  var colA = [0.78, 0.95, 0.23], colF = [0.93, 0.91, 0.87], colUntil = 0;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var FOV = 20 * Math.PI / 180, D = 18;

  function parseColor(str) {
    if (!str) return null;
    var n = str.match(/-?[\d.]+/g); if (!n || n.length < 3) return null;
    n = n.map(Number);
    return /^color\(/.test(str.trim()) ? [n[0], n[1], n[2]] : [n[0] / 255, n[1] / 255, n[2] / 255];
  }
  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    var a = parseColor(cs.getPropertyValue('--acc')), f = parseColor(cs.getPropertyValue('--fg'));
    if (a) colA = a; if (f) colF = f;
  }
  function compile(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  function program(vs, fs) {
    var v = compile(gl.VERTEX_SHADER, vs), f = compile(gl.FRAGMENT_SHADER, fs); if (!v || !f) return null;
    var p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(p)); return null; }
    return p;
  }

  function buildMesh(segs) {
    var n = segs.length, vb = new Float32Array(n * 4 * 9), ib = new Uint16Array(n * 6), i, k;
    var corners = [[0, -1], [0, 1], [1, -1], [1, 1]];
    for (i = 0; i < n; i++) {
      var s = segs[i];
      // reveal order sweeps bottom → top (+ a little noise); caps carry +2 so the shader can tell them apart
      var ord = clamp(((s[1] + s[4]) / 4 + 0.5) * 0.82 + Math.random() * 0.18, 0, 1) + (s[6] ? 2 : 0);
      for (k = 0; k < 4; k++) {
        var o = (i * 4 + k) * 9;
        vb[o] = s[0]; vb[o + 1] = s[1]; vb[o + 2] = s[2]; vb[o + 3] = s[3]; vb[o + 4] = s[4]; vb[o + 5] = s[5];
        vb[o + 6] = corners[k][0]; vb[o + 7] = corners[k][1]; vb[o + 8] = ord;
      }
      var b = i * 4, q = i * 6;
      ib[q] = b; ib[q + 1] = b + 1; ib[q + 2] = b + 2; ib[q + 3] = b + 2; ib[q + 4] = b + 1; ib[q + 5] = b + 3;
    }
    var vbo = gl.createBuffer(), ibo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferData(gl.ARRAY_BUFFER, vb, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ib, gl.STATIC_DRAW);
    return { vbo: vbo, ibo: ibo, count: n * 6 };
  }
  function buildPoints() {
    var n = 520, a = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var th = Math.random() * TAU, ph = Math.acos(2 * Math.random() - 1), r = 0.55 + Math.random() * 0.45;
      a[i * 3] = r * Math.sin(ph) * Math.cos(th); a[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); a[i * 3 + 2] = r * Math.cos(ph);
    }
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, a, gl.STATIC_DRAW);
    return { buf: b, count: n };
  }

  var solid = null;
  function initGL() {
    progS = program(VS, FS); progP = program(PVS, PFS);
    if (!progS || !progP) return false;
    if (!solid) solid = buildMesh(cfg.geo());                             // one whole solid — never sliced
    mesh.S = solid;
    pts = buildPoints();
    LS = {
      aA: gl.getAttribLocation(progS, 'aA'), aB: gl.getAttribLocation(progS, 'aB'), aC: gl.getAttribLocation(progS, 'aC'), aO: gl.getAttribLocation(progS, 'aO'),
      uM: gl.getUniformLocation(progS, 'uM'), uRes: gl.getUniformLocation(progS, 'uRes'), uW: gl.getUniformLocation(progS, 'uW'), uZ: gl.getUniformLocation(progS, 'uZ'),
      uC: gl.getUniformLocation(progS, 'uC'), uA: gl.getUniformLocation(progS, 'uA'), uR: gl.getUniformLocation(progS, 'uR'), uK: gl.getUniformLocation(progS, 'uK')
    };
    LP = { aP: gl.getAttribLocation(progP, 'aP'), uM: gl.getUniformLocation(progP, 'uM'), uSz: gl.getUniformLocation(progP, 'uSz'), uC: gl.getUniformLocation(progP, 'uC'), uA: gl.getUniformLocation(progP, 'uA') };
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
    return true;
  }

  function resize() {
    if (!cv) return;
    var cw = cv.clientWidth || window.innerWidth, ch = cv.clientHeight || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    while (cw * ch * dpr * dpr > 5.2e6 && dpr > 1) dpr -= 0.25;
    var bw = Math.round(cw * dpr), bh = Math.round(ch * dpr);
    if (cv.width !== bw || cv.height !== bh) { cv.width = bw; cv.height = bh; }
    W = cw; Hh = ch; narrow = cw < 900 || cw / ch < 0.8;
    measure();
  }
  function measure() {
    vh = window.innerHeight || Hh;
    maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
  }

  /* ---------------------------------------------------------------- poses */
  function heroPose() {
    if (narrow) {
      var zt = zone ? zone.top : Hh * 0.6, zb = zone ? zone.bot : Hh * 0.88, zh = Math.max(130, zb - zt);
      var Upx = Math.min(Hh, 0.9 * W), px = Math.min(zh * 0.92, W * 0.62);
      var sNarrow = (page === 'about') ? px / Upx * 0.82 : px / Upx;
      return { x: 0.0, y: 1 - 2 * (zt + zh / 2) / Hh, s: sNarrow, a: 0.95 };
    }
    if (cfg && cfg.hero) return cfg.hero;
    return page === 'home' ? { x: 0.58, y: 0.02, s: 0.46, a: 0.95 } : { x: 0.60, y: 0.24, s: 0.40, a: 0.95 };
  }

  /* ---------------------------------------------------------------- render */
  function draw(now) {
    var dt = Math.min(0.05, (now - last) / 1000) || 0.016; last = now;
    var rm = reduce.matches;
    tClock += rm ? 0 : dt;
    if (now < colUntil) readColors();

    // dive tween
    if (dvDur > 0) { var u = clamp((now - dvT0) / dvDur, 0, 1); dv = lerp(dvFrom, dvTo, dvEase(u)); if (u >= 1) dvDur = 0; }

    var sy = window.pageYOffset || 0;
    var range = Math.max(160, Math.min(vh * 0.95, maxScroll * 0.9));
    var pt = clamp(sy / range, 0, 1);
    psPrev = ps; ps += (pt - ps) * (rm ? 1 : 1 - Math.exp(-dt * 5.2));
    var dps = ps - psPrev;
    mirror += (mirrorT - mirror) * (rm ? 1 : 1 - Math.exp(-dt * 2.6));
    mx += (tmx - mx) * (1 - Math.exp(-dt * 4)); my += (tmy - my) * (1 - Math.exp(-dt * 4));
    var el = (now - t0) / 1000;

    gl.viewport(0, 0, cv.width, cv.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var vhW = 2 * D * Math.tan(FOV / 2), vwW = vhW * (cv.width / cv.height);
    var U = Math.min(vhW, vwW * 0.9), asp = cv.width / cv.height;
    var P = persp(FOV, asp, 0.5, 200);
    var dd = dv * dv;

    /* dust — during a dive it rushes past the camera */
    gl.useProgram(progP);
    var pm = mul(P, mul(trans(0, 0, -D), mul(rotY(tClock * 0.02 + ps * 0.9 + mx * 0.25), mul(rotX(my * 0.2 + ps * 0.3), scl(Math.max(vwW, vhW) * 0.62 * (1 + dd * 5))))));
    gl.uniformMatrix4fv(LP.uM, false, pm);
    gl.uniform1f(LP.uSz, 2.2 * dpr * (1 + dv * 1.6));
    gl.uniform3f(LP.uC, colF[0], colF[1], colF[2]);
    gl.uniform1f(LP.uA, 0.55 * easeOut(el / 1.5) * (1 - dv * 0.35));
    gl.bindBuffer(gl.ARRAY_BUFFER, pts.buf); gl.enableVertexAttribArray(LP.aP); gl.vertexAttribPointer(LP.aP, 3, gl.FLOAT, false, 12, 0);
    gl.drawArrays(gl.POINTS, 0, pts.count);
    gl.disableVertexAttribArray(LP.aP);

    /* the page's solid — one whole wireframe that glides to the edge */
    gl.useProgram(progS);
    gl.uniform2f(LS.uRes, cv.width, cv.height);
    var hero = heroPose(), E = END[narrow ? 'narrow' : 'wide'], side = cfg.side;
    var rev = easeOut((el - 0.05) / 1.9), grow = 0.74 + 0.26 * easeOut((el - 0.05) / 1.5);
    if (rm) { rev = 1; grow = 1; }

    boost += dps * 10 * side; boost *= Math.exp(-dt * 1.4);
    var baseY = tClock * cfg.spin[0] + sy * 0.0011 + boost + mx * 0.9 + dd * 2.6;
    var baseX = tClock * cfg.spin[1] + sy * 0.0006 + my * 0.7 + 0.5;

    var kk = smoother(ps);
    var heroX = hero.x * mirror;
    var baseSide = hero.x !== 0 ? (hero.x > 0 ? 1 : -1) : side;
    var targetEdge = baseSide * mirror;   // smoothly scales from +1 to -1 as mirror transitions
    var size = lerp(hero.s, E.s, kk) * U * grow;
    var rad = Math.min(size / 2 * (1 + dd * 5.5), D * 0.82);
    /* at rest the whole solid must stay on screen — only the scrolled pose is allowed to bleed off the edge */
    var projRad = rad * D / Math.sqrt(Math.max(0.001, D * D - rad * rad));
    var margin = (page === 'about' || page === 'work') ? 0.02 : 0.03;
    var maxX = Math.max(0, (vwW / 2 - projRad - vwW * margin) / (vwW / 2));
    if (page === 'about') maxX = Math.max(maxX, 0.52);
    if (page === 'work') maxX = Math.max(maxX, 0.62);
    heroX = clamp(heroX, -maxX, maxX);
    var px = lerp(heroX, targetEdge * E.x, kk);
    var py = lerp(hero.y, E.y, kk);
    px = lerp(px, 0, Math.min(1, dv * 0.7)); py = lerp(py, 0, Math.min(1, dv * 0.7));   // dives aim at the centre of the screen
    var alpha = Math.min(1, lerp(hero.a, E.a, kk) * (1 + dv * 0.6));

    py += Math.sin(tClock * 0.35 + ps * 2.0) * 0.012;
    var mouseAmt = (page === 'about' || page === 'work') ? 0.25 : 0.5;
    var wx = px * vwW / 2 - mx * mouseAmt * 0.5 * (1 - kk * 0.6), wy = py * vhW / 2 + my * 0.5 * 0.35 * (1 - kk * 0.6);

    var ry = baseY + kk * 0.9 * side, rx = baseX + kk * 0.35;
    var M = mul(trans(wx, wy, -D), mul(rotY(ry), mul(rotX(rx), mul(rotZ(0.22), scl(rad)))));

    gl.uniform3f(LS.uC, colA[0], colA[1], colA[2]);
    gl.uniform1f(LS.uA, alpha);
    gl.uniform1f(LS.uR, rev);
    gl.uniform1f(LS.uK, 0);
    gl.uniform1f(LS.uW, 2.0 * dpr * (narrow ? 0.9 : 1) * (1 + dv * 2.2));
    gl.uniform2f(LS.uZ, D - rad, Math.max(0.001, rad * 2));
    gl.uniformMatrix4fv(LS.uM, false, mul(P, M));

    var o = mesh.S;
    gl.bindBuffer(gl.ARRAY_BUFFER, o.vbo); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.ibo);
    gl.enableVertexAttribArray(LS.aA); gl.vertexAttribPointer(LS.aA, 3, gl.FLOAT, false, 36, 0);
    gl.enableVertexAttribArray(LS.aB); gl.vertexAttribPointer(LS.aB, 3, gl.FLOAT, false, 36, 12);
    gl.enableVertexAttribArray(LS.aC); gl.vertexAttribPointer(LS.aC, 2, gl.FLOAT, false, 36, 24);
    gl.enableVertexAttribArray(LS.aO); gl.vertexAttribPointer(LS.aO, 1, gl.FLOAT, false, 36, 32);
    gl.drawElements(gl.TRIANGLES, o.count, gl.UNSIGNED_SHORT, 0);
    gl.disableVertexAttribArray(LS.aA); gl.disableVertexAttribArray(LS.aB); gl.disableVertexAttribArray(LS.aC); gl.disableVertexAttribArray(LS.aO);
  }

  function loop(now) { if (!running) return; requestAnimationFrame(loop); if (!lost) draw(now); }

  /* ------------------------------------------------------------------------ API */
  var Scene = {
    supported: false,
    init: function (opts) {
      cv = opts.canvas; page = PAGES[opts.page] ? opts.page : 'home'; cfg = PAGES[page];
      if (opts.dive) dv = dvFrom = dvTo = opts.dive;
      gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'high-performance' }) || cv.getContext('experimental-webgl');
      if (!gl || !initGL()) { cv.style.display = 'none'; return false; }
      Scene.supported = true;
      cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); lost = true; });
      cv.addEventListener('webglcontextrestored', function () { lost = false; initGL(); });
      readColors(); resize();
      window.addEventListener('resize', resize, { passive: true });
      if (window.ResizeObserver) new ResizeObserver(resize).observe(cv);
      window.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        tmx = e.clientX / window.innerWidth - 0.5; tmy = e.clientY / window.innerHeight - 0.5;
      }, { passive: true });
      try { var st = parseFloat(sessionStorage.getItem('nx-clock')); if (!isNaN(st)) tClock = st; } catch (e) {}
      window.addEventListener('pagehide', function () { try { sessionStorage.setItem('nx-clock', String(tClock)); } catch (e) {} });
      var range = Math.max(160, Math.min(window.innerHeight * 0.95, maxScroll * 0.9));
      ps = clamp((window.pageYOffset || 0) / range, 0, 1);
      t0 = last = performance.now();
      return true;
    },
    start: function () { if (!Scene.supported || running) return; running = true; t0 = last = performance.now(); requestAnimationFrame(loop); },
    measure: measure,
    zone: function (top, bot) { zone = { top: top, bot: bot }; },
    theme: function () { colUntil = performance.now() + 1300; readColors(); },
    dir: function (rtl, instant) { mirrorT = rtl ? -1 : 1; if (instant) mirror = mirrorT; },
    /* camera flight through the wireframe: to=1 dives in (accelerating), to=0 pulls back out (decelerating) */
    dive: function (to, ms, mode) {
      dvFrom = dv; dvTo = to; dvT0 = performance.now(); dvDur = ms || 0;
      dvEase = mode === 'in' ? function (u) { return u * u * u; } : easeOut;
      if (!ms) { dv = to; dvDur = 0; }
    },
    getPage: function () { return page; },
    setPage: function (p) {
      var next = PAGES[p] ? p : 'home';
      page = next;
      cfg = PAGES[page];
      if (gl) {
        solid = buildMesh(cfg.geo());
        mesh.S = solid;
        pts = buildPoints();
      }
      ps = 0;
      psPrev = 0;
      t0 = performance.now();
      measure();
    }
  };
  window.NXScene = Scene;
})();
