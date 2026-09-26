(function () {
  "use strict";
  var WA = "918086446819";

  /* mobile navigation */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* conversion tracking hook: pushes to dataLayer only; no analytics script is loaded here */
  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-track]") : null;
    if (!el) return;
    (window.dataLayer = window.dataLayer || []).push({ event: "cta_click", cta: el.getAttribute("data-track") });
  });

  /* lead forms: contact, site visit, CCTV package */
  var forms = document.querySelectorAll("form[data-lead]");
  Array.prototype.forEach.call(forms, initForm);

  function initForm(form) {
    var endpoint = (window.ALERT_CONFIG && window.ALERT_CONFIG.formEndpoint) || "";
    var status = form.querySelector(".form-status");
    var note = form.querySelector(".form-note");
    if (!endpoint && note) {
      note.textContent = "Pressing the button opens WhatsApp with your details filled in. Press send there to reach us. You can also call or email us directly.";
    }
    form.removeAttribute("action");
    form.setAttribute("novalidate", "novalidate");

    function setErr(input, msg) {
      if (!input) return true;
      var err = document.getElementById(input.id + "-err");
      if (msg) { input.setAttribute("aria-invalid", "true"); if (err) err.textContent = msg; }
      else { input.removeAttribute("aria-invalid"); if (err) err.textContent = ""; }
      return !msg;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("[name=name]"), phone = form.querySelector("[name=phone]"), email = form.querySelector("[name=email]"), loc = form.querySelector("[name=location]");
      var okName = setErr(name, name.value.trim() ? "" : "Enter your name.");
      var okPhone = setErr(phone, phone.value.replace(/\D/g, "").length >= 8 ? "" : "Enter a phone number we can call, with at least 8 digits.");
      var okEmail = setErr(email, !email || !email.value.trim() || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim()) ? "" : "Enter a valid email address or leave it blank.");
      var okLoc = true;
      if (loc && loc.hasAttribute("required")) okLoc = setErr(loc, loc.value.trim() ? "" : "Enter the town or area of the site.");
      if (!(okName && okPhone && okEmail && okLoc)) {
        var bad = form.querySelector("[aria-invalid='true']");
        if (bad) bad.focus();
        return;
      }
      var hp = form.querySelector("[name=website]");
      if (hp && hp.value) return; /* honeypot */

      var lines = [form.getAttribute("data-intro") || "Hello Alert LookLive, I have an enquiry."];
      var data = { form: form.getAttribute("data-subject") || "Website enquiry" };
      Array.prototype.forEach.call(form.querySelectorAll("[data-label]"), function (el) {
        var isChoice = el.type === "checkbox" || el.type === "radio";
        var val = (isChoice ? (el.checked ? (el.value || "Yes") : "") : (el.value || "")).trim();
        if (!val) return;
        var label = el.getAttribute("data-label");
        data[label] = val;
        lines.push(val.indexOf("\n") > -1 ? label + ":\n" + val : label + ": " + val);
      });
      (window.dataLayer = window.dataLayer || []).push({ event: "lead_submit", form: data.form });

      if (endpoint) {
        status.textContent = "Sending your request...";
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        }).then(function (r) {
          if (!r.ok) throw new Error("bad response");
          status.textContent = "Thank you, " + name.value.trim() + ". Your request has been sent to Alert LookLive. We will contact you on the number you gave.";
          form.reset();
          form.dispatchEvent(new Event("reset"));
        }).catch(function () {
          status.textContent = "Your request could not be sent. Please call +91 8086 446 819 or use WhatsApp instead.";
        });
        return;
      }
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
      status.textContent = "WhatsApp has opened with your request. Press send there to reach us.";
    });
  }
})();
