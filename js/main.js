(function () {
    "use strict";

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;



    /* ---------- paper-cut fronds ---------- */

    var NS = "http://www.w3.org/2000/svg";

    function frond(seed) {
      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 200 260");
      svg.setAttribute("aria-hidden", "true");

      var stem = document.createElementNS(NS, "path");
      stem.setAttribute("d", "M100 258 C 98 190, 99 110, 100 6");
      stem.setAttribute("stroke", "currentColor");
      stem.setAttribute("stroke-width", "3.5");
      stem.setAttribute("stroke-linecap", "round");
      stem.setAttribute("fill", "none");
      svg.appendChild(stem);

      var blades = 13;
      for (var i = 0; i < blades; i++) {
        var t = i / (blades - 1);
        var y = 18 + t * 214;
        // Blades are longest mid-frond, tapering at tip and base.
        var len = 82 * Math.sin(Math.PI * Math.pow(t, 0.78)) + 12;
        var wob = Math.sin(seed + i * 1.7) * 5;

        for (var s = -1; s <= 1; s += 2) {
          var b = document.createElementNS(NS, "path");
          var tipX = 100 + s * (len + wob);
          var tipY = y - len * 0.52;
          var ctrlY = y - len * 0.1;
          b.setAttribute(
            "d",
            "M100 " + y.toFixed(1) +
            " Q " + (100 + s * len * 0.55).toFixed(1) + " " + ctrlY.toFixed(1) +
            " " + tipX.toFixed(1) + " " + tipY.toFixed(1) +
            " Q " + (100 + s * len * 0.42).toFixed(1) + " " + (y + 7).toFixed(1) +
            " 100 " + (y + 9).toFixed(1) + " Z"
          );
          b.setAttribute("fill", "currentColor");
          svg.appendChild(b);
        }
      }
      return svg;
    }

    var fronds = document.querySelectorAll(".frond");
    for (var i = 0; i < fronds.length; i++) {
      fronds[i].appendChild(frond(i * 2.3 + 1.1));
    }

    /* ---------- leopard spots (canvas, per card) ---------- */

    function paintSpots(canvas, seed) {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      var ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);

      // Deterministic PRNG so a resize repaints the same coat.
      var s = seed;
      function rnd() {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
      }

      var count = Math.round((rect.width * rect.height) / 5200);
      for (var i = 0; i < count; i++) {
        var x = rnd() * rect.width;
        var y = rnd() * rect.height;
        var r = 5 + rnd() * 9;
        var rot = rnd() * Math.PI;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);

        // A rosette: broken ring of arcs, not a filled dot.
        ctx.strokeStyle = "rgba(247, 247, 242, 0.22)";
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";

        var arcs = 2 + Math.floor(rnd() * 2);
        for (var a = 0; a < arcs; a++) {
          var start = rnd() * Math.PI * 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, r, r * (0.72 + rnd() * 0.3), 0, start, start + 1.5 + rnd() * 1.1);
          ctx.stroke();
        }

        ctx.fillStyle = "rgba(0, 106, 121, 0.3)";
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.34, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    var canvases = document.querySelectorAll(".spot canvas");

    function paintAll() {
      for (var i = 0; i < canvases.length; i++) {
        paintSpots(canvases[i], (i + 1) * 97 + 7);
      }
    }

    /* ---------- career graph ---------- */

    var START = 2003;
    var END = 2026;
    var SPAN = END - START;

    var ROLES = [
      { label: "AI-Driven Product Designer", org: "Monto",                          from: 2024,   to: 2026,   kind: "now",    note: "Now" },
      { label: "Lecturer, Gen AI",           org: "The College of Management",      from: 2024.6, to: 2026,   kind: "teach",  note: "Teaching it" },
      { label: "Head of Design",             org: "ORBS",                           from: 2017.9, to: 2024,   kind: "design", note: "dTwap · Ton Verifier · DeFi" },
      { label: "Art Director, UI/UX",        org: "Private Investment Fund",        from: 2013,   to: 2019,   kind: "design", note: "Investor-ready product" },
      { label: "Freelance Product Designer", org: "B2B & B2C",                      from: 2008,   to: 2024,   kind: "craft",  note: "16 years, in parallel" },
      { label: "Art Director",               org: "Moog.it",                        from: 2010,   to: 2013,   kind: "craft",  note: "Global brands" },
      { label: "Infographics Designer",      org: "Haaretz",                        from: 2008,   to: 2010,   kind: "craft",  note: "Where systems started" },
      { label: "Lecturer, Interaction",      org: "Avni Design College",            from: 2013,   to: 2016,   kind: "teach",  note: "Interaction & design thinking" },
      { label: "Bachelor, Interactive",      org: "Avni Institute",                 from: 2006,   to: 2010,   kind: "origin", note: "Where it starts" },
      { label: "Ammunition examiner",        org: "Southern Division, Gush Katif",  from: 2003,   to: 2005,   kind: "origin", note: "High stakes, checked twice" }
    ];

    function pct(year) { return ((year - START) / SPAN) * 100; }

    var graph = document.getElementById("career-graph");

    /* Ticks sit at their true year position — the gaps are uneven on purpose,
       because 2023→now is three years, not five. */
    var axis = document.createElement("div");
    axis.className = "axis";
    [2003, 2008, 2013, 2018, 2023, 2026].forEach(function (y) {
      var sp = document.createElement("span");
      sp.textContent = y === 2026 ? "Now" : String(y);
      sp.style.left = pct(y) + "%";
      if (y === 2026) sp.style.transform = "translateX(-100%)";
      axis.appendChild(sp);
    });
    graph.appendChild(axis);

    ROLES.forEach(function (r) {
      var row = document.createElement("div");
      row.className = "row reveal";

      var label = document.createElement("div");
      label.className = "row-label";
      label.innerHTML = "<b></b><span></span>";
      label.querySelector("b").textContent = r.label;
      label.querySelector("span").textContent = r.org;

      var track = document.createElement("div");
      track.className = "track";

      var left = pct(r.from);
      var width = Math.max(pct(r.to) - left, 4);

      var bar = document.createElement("div");
      bar.className = "bar " + r.kind;
      bar.style.left = left + "%";
      bar.style.width = width + "%";

      var years = Math.round(r.to) - Math.round(r.from);
      bar.setAttribute(
        "title",
        r.label + " · " + r.org + " · " + Math.round(r.from) + "–" +
        (r.to >= 2026 ? "present" : Math.round(r.to)) + " (" + years + " yr)"
      );
      track.appendChild(bar);

      if (r.note) {
        // ~18% of the track is the narrowest bar that can hold a caption legibly.
        var span = document.createElement("span");
        span.textContent = r.note;
        if (width >= 18) {
          bar.appendChild(span);
        } else {
          span.className = "bar-note";
          if (left + width > 60) {
            span.style.right = (100 - left) + "%";
            span.style.marginRight = "0.6rem";
          } else {
            span.style.left = left + width + "%";
            span.style.marginLeft = "0.6rem";
          }
          track.appendChild(span);
        }
      }
      row.appendChild(label);
      row.appendChild(track);
      graph.appendChild(row);
    });

    /* ---------- parallax ----------
       Each animal drifts against the scroll at its own rate. Only runs while
       the figure is on screen, and only inside a rAF. */

    var floaters = [].slice.call(document.querySelectorAll("[data-parallax]"));

    if (!reduced && floaters.length) {
      var ticking = false;

      var drift = function () {
        ticking = false;
        var vh = window.innerHeight;
        var mid = vh / 2;
        for (var i = 0; i < floaters.length; i++) {
          var f = floaters[i];
          var box = f.getBoundingClientRect();
          if (box.bottom < -vh || box.top > vh * 2) continue;
          var delta = (box.top + box.height / 2) - mid;
          var rate = parseFloat(f.getAttribute("data-parallax")) || 0;
          f.style.transform = "translate3d(0," + (delta * rate).toFixed(2) + "px,0)";
        }
      };

      var queueDrift = function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(drift);
      };

      window.addEventListener("scroll", queueDrift, { passive: true });
      window.addEventListener("resize", queueDrift);
      queueDrift();
    }

    /* ---------- reveal ---------- */

    var targets = document.querySelectorAll(".reveal");

    var revealAll = function () {
      for (var j = 0; j < targets.length; j++) targets[j].classList.add("in");
    };

    if (reduced || !("IntersectionObserver" in window)) {
      revealAll();
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          var group = el.parentElement ? el.parentElement.children : [el];
          var idx = Array.prototype.indexOf.call(group, el);
          el.style.transitionDelay = Math.min(idx, 8) * 70 + "ms";
          el.classList.add("in");
          io.unobserve(el);
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

      for (var k = 0; k < targets.length; k++) io.observe(targets[k]);

      // Safety net: everything on this page starts at opacity 0 and waits for
      // the observer. If it never fires, the page reads as blank — so if the
      // first screenful hasn't shown up shortly after load, drop the animation
      // and just show the content.
      window.setTimeout(function () {
        if (!document.querySelector(".reveal.in")) revealAll();
      }, 2500);
    }

    /* ---------- paint + resize ---------- */

    var t;
    function onResize() {
      clearTimeout(t);
      t = setTimeout(paintAll, 150);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(paintAll);
    } else {
      paintAll();
    }
    window.addEventListener("resize", onResize);
  })();

/* ---------- ask ----------
   Real answers come from /api/ask, where the key lives. The scripted TOPICS
   below are the suggestion chips and the fallback: if the endpoint is missing
   or fails, the console degrades to what I wrote by hand rather than to an
   error. Every path is honest about which one it took. */

(function () {
  "use strict";

  var form = document.getElementById("ask-form");
  if (!form) return;

  var input = document.getElementById("ask-input");
  var suggestBox = document.getElementById("ask-suggest");
  var answerBox = document.getElementById("ask-answer");

  var TOPICS = [
    {
      q: "Do you actually write code?",
      keys: ["code", "coding", "dev", "engineer", "react", "typescript", "git", "ship", "build"],
      line: "Yes — and not as a party trick. The handoff gap is where design quietly dies, so I closed it.",
      cards: [
        { badge: "Daily", cls: "now", title: "I work in the repo",
          body: "TypeScript-aware UI, React design systems, Git workflows. My decisions land as production components, not as a spec someone else has to interpret.",
          to: "#built", cta: "See the stack" },
        { badge: "Monto · now", cls: "now", title: "The system is infrastructure",
          body: "I own shared components, states and tokens running across both Current Gen and Next Gen — not a Figma library that drifts from what shipped.",
          to: "#built", cta: "Built as one" },
        { badge: "This page", cls: "long", title: "Including this one",
          body: "I hand-built it. No framework, no page builder. The career graph below is drawn from data, not screenshotted.",
          to: "#graph", cta: "Open the graph" },
        { badge: "2008 →", cls: "past", title: "It predates the trend",
          body: "Design and code have run as one track for me since the Haaretz infographics desk. AI didn't start this; it sped it up.",
          to: "#complete", cta: "Why I'm not retrofitted" }
      ]
    },
    {
      q: "Show me your design system work",
      keys: ["design system", "system", "tokens", "component", "library", "figma"],
      line: "I own it end to end at Monto, as production infrastructure rather than a documentation exercise.",
      cards: [
        { badge: "Monto · now", cls: "now", title: "One source of truth",
          body: "Components, states and tokens shared across two product generations at once — the hard version, where the old and the new have to agree.",
          to: "#built", cta: "Built as one" },
        { badge: "Figma → prod", cls: "now", title: "No drift",
          body: "The tokens in my file are the tokens in the repo. When they can't drift apart, nobody has to police them.",
          to: "#built", cta: "See the pillars" },
        { badge: "ORBS · 7 yrs", cls: "past", title: "Across a whole portfolio",
          body: "As Head of Design I ran one system spanning SaaS and B2B/B2C products, including dTwap and Ton Verifier.",
          to: "#graph", cta: "Find it on the graph" },
        { badge: "Since 2008", cls: "long", title: "Systems over screens",
          body: "The job was never the artifact. At Haaretz the chart was the easy part — the structure underneath it was the work.",
          to: "#spots", cta: "My spots" }
      ]
    },
    {
      q: "What have you shipped 0 → 1?",
      keys: ["0", "zero", "one", "ship", "shipped", "launch", "product", "defi", "orbs", "monto"],
      line: "Four times over, and each time while the product rules were still being written.",
      cards: [
        { badge: "Monto · now", cls: "now", title: "Next-Gen financial platform",
          body: "UX and UI from nothing: I defined the system architecture and core flows while the product rules were still moving.",
          to: "#built", cta: "Built for giants" },
        { badge: "ORBS", cls: "past", title: "dTwap · Ton Verifier · DeFi",
          body: "I shipped multiple products end to end — ideation through launch — as Head of Design.",
          to: "#graph", cta: "See the span" },
        { badge: "Complex domains", cls: "now", title: "Invoices, portals, exceptions",
          body: "I turn operational messes into deterministic, easy-to-act-on flows. Smart Connections, tasks, the lot.",
          to: "#built", cta: "The full stack" },
        { badge: "2013 – 2019", cls: "past", title: "Investor-ready from scratch",
          body: "At a private investment fund I built product concepts and prototypes meant to carry a fundraise, not just a review.",
          to: "#graph", cta: "Open the graph" }
      ]
    },
    {
      q: "How do you use AI?",
      keys: ["ai", "llm", "gpt", "claude", "cursor", "genai", "gen ai", "teach", "lecture"],
      line: "As part of the method, not bolted onto it. And I teach it while I do it.",
      cards: [
        { badge: "Monto · now", cls: "now", title: "Inside the process",
          body: "Exploring flows, generating and validating states, stress-testing edge cases. LLMs scale my decisions and keep the system consistent.",
          to: "#built", cta: "AI-native" },
        { badge: "Lecturer · now", cls: "now", title: "I teach it",
          body: "Gen AI and Creative Thinking at the College of Management — prompt engineering, multi-modal tools, AI-assisted storytelling.",
          to: "#graph", cta: "Second row of the graph" },
        { badge: "Toolkit", cls: "long", title: "Claude Code · Cursor · ChatGPT",
          body: "Working tools, not a slide. They're how my iteration loop got tight enough to matter.",
          to: "#built", cta: "See the stack" },
        { badge: "Not retrofitted", cls: "past", title: "The method came first",
          body: "The way I work predates the models by fifteen years. When generative AI arrived it didn't replace my method — it ran on it.",
          to: "#complete", cta: "Born complete" }
      ]
    },
    {
      q: "Why should we hire you?",
      keys: ["why", "hire", "fit", "oak", "leopard", "spots", "reason"],
      line: "Because you wrote that a leopard can't change its spots, and you meant it as a warning. Read it the other way.",
      cards: [
        { badge: "Since 2008", cls: "long", title: "Systems over screens",
          body: "Seventeen years of the same job at rising stakes: take what nobody can see clearly yet and give it a structure people can act on.",
          to: "#spots", cta: "My spots" },
        { badge: "Since 2003", cls: "long", title: "Trust is the feature",
          body: "DeFi, an investment fund, a payments platform. When the thing on screen moves money, the interface is the risk control.",
          to: "#spots", cta: "Why it matters here" },
        { badge: "The offer", cls: "now", title: "Prove it on your worst flow",
          body: "Send me the one with the exceptions nobody wants to own. I'll come back with a working prototype in code, not a deck. No obligation to hire me.",
          to: "#promise", cta: "My promise" },
        { badge: "Tel Aviv", cls: "now", title: "Ready when you are",
          body: "Senior Product Designer, hybrid, on your stack from my first morning — whatever it turns out to be.",
          to: "#promise", cta: "Connect any" }
      ]
    }
  ];

  var FALLBACK = {
    line: "I can't reach the model right now, so here's the answer I'd have given anyway.",
    cards: TOPICS[4].cards
  };

  function render(topic, label) {
    answerBox.innerHTML = "";

    var line = document.createElement("p");
    line.className = "answer-line";
    line.textContent = topic.line;
    answerBox.appendChild(line);

    var grid = document.createElement("div");
    grid.className = "answer-cards";
    topic.cards.forEach(function (c, i) {
      var card = document.createElement("article");
      card.className = "acard";
      card.style.animationDelay = (i * 70) + "ms";

      var badge = document.createElement("span");
      badge.className = "acard-badge " + c.cls;
      badge.textContent = c.badge;

      var h = document.createElement("h4");
      h.textContent = c.title;

      var p = document.createElement("p");
      p.textContent = c.body;

      var a = document.createElement("a");
      a.href = c.to;
      a.textContent = c.cta + " ↓";

      card.appendChild(badge);
      card.appendChild(h);
      card.appendChild(p);
      card.appendChild(a);
      grid.appendChild(card);
    });
    answerBox.appendChild(grid);

    Array.prototype.forEach.call(suggestBox.children, function (b) {
      b.setAttribute("aria-pressed", String(b.textContent === label));
    });
  }

  function match(text) {
    var q = text.toLowerCase().trim();
    if (!q) return null;
    var best = null, score = 0;
    TOPICS.forEach(function (t) {
      var s = t.keys.reduce(function (n, k) { return q.indexOf(k) !== -1 ? n + k.length : n; }, 0);
      if (s > score) { score = s; best = t; }
    });
    return score > 0 ? best : null;
  }

  TOPICS.forEach(function (t) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "suggest";
    b.textContent = t.q;
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () {
      input.value = t.q;
      render(t, t.q);
    });
    suggestBox.appendChild(b);
  });

  /* The chips answer instantly from the script — they're my words, already
     written, and a spinner for them would be theatre. Free text goes to the
     model. */
  function thinking() {
    answerBox.innerHTML = "";
    var line = document.createElement("p");
    line.className = "answer-line is-thinking";
    line.textContent = "Thinking…";
    answerBox.appendChild(line);
    Array.prototype.forEach.call(suggestBox.children, function (b) {
      b.setAttribute("aria-pressed", "false");
    });
  }

  var pending = 0;

  function ask(question) {
    var ticket = ++pending;
    thinking();
    form.setAttribute("aria-busy", "true");

    fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question })
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        if (ticket !== pending) return;          // a newer question overtook this one
        if (!data || !data.line || !data.cards || !data.cards.length) throw new Error("bad shape");
        render(data, null);
      })
      .catch(function () {
        if (ticket !== pending) return;
        render(match(question) || FALLBACK, null);
      })
      .then(function () {
        if (ticket === pending) form.removeAttribute("aria-busy");
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) return;
    ask(q);
  });

  render(TOPICS[0], TOPICS[0].q);
})();
