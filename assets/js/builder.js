(function () {
  "use strict";
  var form = document.getElementById("package-form");
  if (!form) return;
  var C = window.CCTV_CONFIG || {};
  var $ = function (s) { return form.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(form.querySelectorAll(s)); };
  var brandSel = $("#pk-brand"), modelText = $("#pk-model-text"), modelSel = $("#pk-model-select");

  var none = document.createElement("option");
  none.value = ""; none.textContent = "No preference \u2014 recommend the best fit";
  brandSel.appendChild(none);
  (C.brands || []).forEach(function (b) {
    var o = document.createElement("option"); o.value = b; o.textContent = b; brandSel.appendChild(o);
  });
  var other = document.createElement("option");
  other.value = "Other"; other.textContent = "Other brand (type it in below)";
  brandSel.appendChild(other);

  function checked(name) { var c = $('input[name="' + name + '"]:checked'); return c ? c.value : ""; }
  function all(name) { return $$('input[name="' + name + '"]:checked').map(function (c) { return c.value; }); }
  function num(name) { var i = $('input[name="' + name + '"]'); return i ? Math.max(0, parseInt(i.value, 10) || 0) : 0; }
  function model() {
    if (!modelSel.hidden) return modelSel.value === "Other (I will tell you)" ? "" : modelSel.value;
    return modelText.value.trim();
  }

  function state() {
    var indoor = num("indoor"), outdoor = num("outdoor"), total = indoor + outdoor;
    var type = checked("camtype");
    var ch = total <= 4 ? 4 : total <= 8 ? 8 : total <= 16 ? 16 : total <= 32 ? 32 : 64;
    var rec = total ? ch + "-channel " + (type === "IP camera" ? "NVR" : type === "HD analog camera" ? "DVR" : "NVR/DVR (we will confirm)") : "";
    return {
      premises: checked("premises"), indoor: indoor, outdoor: outdoor, total: total, type: type,
      res: checked("res"), body: all("body"), features: all("feature"), days: $("#pk-days").value,
      brand: brandSel.value, model: model(), rec: rec,
      display: checked("display"), ups: checked("ups")
    };
  }

  function rows(s) {
    var r = [];
    if (s.premises) r.push(["Premises", s.premises]);
    if (s.total) r.push(["Cameras", s.total + " total (" + s.outdoor + " outdoor, " + s.indoor + " indoor)"]);
    if (s.type) r.push(["Camera type", s.type]);
    if (s.res) r.push(["Resolution", s.res]);
    if (s.body.length) r.push(["Camera style", s.body.join(", ")]);
    if (s.rec) r.push(["Recorder", s.rec]);
    if (s.days) r.push(["Keep footage", s.days]);
    if (s.brand) r.push(["Brand", s.brand === "Other" ? (s.model || "To be discussed") : s.brand]);
    if (s.brand && s.brand !== "Other" && s.model) r.push(["Model", s.model]);
    if (s.features.length) r.push(["Also needed", s.features.join(", ")]);
    if (s.display) r.push(["Monitor/TV", s.display]);
    if (s.ups) r.push(["Power backup", s.ups]);
    return r;
  }

  var out = document.getElementById("pk-summary-list"), count = document.getElementById("pk-total"), empty = document.getElementById("pk-empty");
  function render() {
    var s = state(), r = rows(s);
    count.textContent = s.total ? "(" + s.total + " camera" + (s.total === 1 ? "" : "s") + ")" : "";
    out.innerHTML = "";
    empty.hidden = !!r.length;
    if (!r.length) return;
    r.forEach(function (x) {
      var dt = document.createElement("dt"); dt.textContent = x[0];
      var dd = document.createElement("dd"); dd.textContent = x[1];
      out.appendChild(dt); out.appendChild(dd);
    });
  }

  function syncModel() {
    var list = (C.models || {})[brandSel.value];
    if (list && list.length) {
      modelSel.innerHTML = "";
      var first = document.createElement("option"); first.value = ""; first.textContent = "Select a model"; modelSel.appendChild(first);
      list.forEach(function (m) { var o = document.createElement("option"); o.value = m; o.textContent = m; modelSel.appendChild(o); });
      var oo = document.createElement("option"); oo.value = "Other (I will tell you)"; oo.textContent = "Other (I will tell you)"; modelSel.appendChild(oo);
      modelSel.hidden = false; modelText.hidden = true;
    } else {
      modelSel.hidden = true; modelText.hidden = false;
    }
    render();
  }

  $$("[data-step]").forEach(function (b) {
    b.addEventListener("click", function () {
      var input = $('input[name="' + b.getAttribute("data-for") + '"]');
      var v = (parseInt(input.value, 10) || 0) + parseInt(b.getAttribute("data-step"), 10);
      input.value = Math.min(64, Math.max(0, v));
      $("#pk-cam-err").textContent = "";
      render();
    });
  });

  form.addEventListener("input", render);
  form.addEventListener("change", function (e) { if (e.target === brandSel) syncModel(); else render(); });
  syncModel();

  /* extra check specific to this form: run before the shared submit handler in main.js */
  form.addEventListener("submit", function (e) {
    if (num("outdoor") + num("indoor") < 1) {
      e.preventDefault();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      $("#pk-cam-err").textContent = "Add at least one camera, or call us if you are not sure yet.";
      $("#pk-cameras").scrollIntoView({ block: "center" });
    } else {
      $("#pk-cam-err").textContent = "";
    }
  });
})();
