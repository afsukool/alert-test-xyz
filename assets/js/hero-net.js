(function () {
  "use strict";
  var c = document.getElementById("net-canvas");
  if (!c || !c.getContext) return;
  var ctx = c.getContext("2d");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, LINK = 90, nodes = [], packets = [], raf = 0, onScreen = true;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function init() {
    var r = c.getBoundingClientRect();
    if (!r.width) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = W < 300 ? 22 : W < 400 ? 28 : 36;
    LINK = Math.max(70, Math.min(W, H) * 0.27);
    nodes = []; packets = [];
    for (var i = 0; i < n; i++) {
      nodes.push({ x: rnd(0, W), y: rnd(0, H), vx: rnd(-0.22, 0.22), vy: rnd(-0.22, 0.22), r: rnd(1.5, 2.8), hub: i % 9 === 0 });
    }
    draw();
  }

  function spawn() {
    var a = nodes[(Math.random() * nodes.length) | 0], near = [];
    for (var i = 0; i < nodes.length; i++) {
      var b = nodes[i];
      if (b === a) continue;
      var dx = a.x - b.x, dy = a.y - b.y;
      if (dx * dx + dy * dy < LINK * LINK) near.push(b);
    }
    if (near.length) packets.push({ a: a, b: near[(Math.random() * near.length) | 0], t: 0 });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var i, j, a, b, dx, dy, d;
    ctx.lineWidth = 1;
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      for (j = i + 1; j < nodes.length; j++) {
        b = nodes[j]; dx = a.x - b.x; dy = a.y - b.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.strokeStyle = "rgba(255,255,255," + ((1 - d / LINK) * 0.32).toFixed(3) + ")";
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      if (a.hub) {
        ctx.strokeStyle = "rgba(216,35,42,.75)"; ctx.beginPath(); ctx.arc(a.x, a.y, 7, 0, 6.2832); ctx.stroke();
        ctx.fillStyle = "#d8232a"; ctx.beginPath(); ctx.arc(a.x, a.y, 3.2, 0, 6.2832); ctx.fill();
      } else {
        ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill();
      }
    }
    for (i = 0; i < packets.length; i++) {
      var p = packets[i], x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
      ctx.fillStyle = "rgba(255,120,120,.25)"; ctx.beginPath(); ctx.arc(x, y, 7, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#ff5a5f"; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 6.2832); ctx.fill();
    }
  }

  function step() {
    raf = 0;
    if (!onScreen || document.hidden) return;
    var i, n;
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i]; n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }
    if (packets.length < 5 && Math.random() < 0.05) spawn();
    for (i = packets.length - 1; i >= 0; i--) {
      packets[i].t += 0.014;
      if (packets[i].t >= 1) packets.splice(i, 1);
    }
    draw();
    raf = requestAnimationFrame(step);
  }

  function run() { if (!reduce && !raf && onScreen && !document.hidden) raf = requestAnimationFrame(step); }

  init();
  if ("ResizeObserver" in window) new ResizeObserver(init).observe(c); else window.addEventListener("resize", init);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; run(); }).observe(c);
  }
  document.addEventListener("visibilitychange", run);
  run();
})();
