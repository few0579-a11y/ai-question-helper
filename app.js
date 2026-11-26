(function () {
  "use strict";
  var P = window.PAPER;
  var $ = function (id) { return document.getElementById(id); };
  var MAX_Q = 2000;
  var pct = function (a, n) { return Math.round((a / n) * 100); };

  // ---------- 머리말 ----------
  $("paper-title").textContent = P.title;
  $("paper-link").href = P.pdf;
  $("sentence-inline").textContent = P.sentence;
  $("verdict").textContent = P.verdict;

  // ---------- 1. 질문에 문장 붙이기 ----------
  var EXAMPLE = "「Attention Is All You Need」라는 논문의 핵심 주장과 연구 방법을 3~4문장으로 설명해 주세요.";
  var ALREADY = /모른다고\s*답|모르면\s*모른다고|모르는\s*건\s*모른다고|don'?t know/i;
  var ASKS_PAPER = /논문|paper|연구|저널|학회|「|」|“|”|"/i;

  function setMsg(el, text, kind) {
    el.textContent = text;
    el.className = "msg" + (kind ? " " + kind : "");
  }

  function addSentence() {
    var q = ($("question").value || "").replace(/\s+$/g, "").replace(/^\s+/g, "");
    $("out1").hidden = true;
    if (!q) { setMsg($("msg1"), "질문을 먼저 적어 주세요.", "warn"); return; }
    if (q.length > MAX_Q) {
      setMsg($("msg1"), "질문이 너무 깁니다 (" + q.length + "자). " + MAX_Q + "자 이하로 줄여 주세요.", "warn");
      return;
    }
    var out;
    if (ALREADY.test(q)) {
      out = q;
      setMsg($("msg1"), "이미 '모른다고 답해 달라'는 뜻의 문장이 있어 그대로 두었습니다.", "info");
    } else {
      out = /[.?!。？！]$/.test(q) ? q : q + ".";
      out = out + " " + P.sentence;
      setMsg($("msg1"), "질문 끝에 문장을 붙였습니다.", "ok");
    }
    $("result").value = out;
    renderTips(q);
    $("out1").hidden = false;
  }

  function renderTips(q) {
    var f = P.fake, r = P.real;
    var tips = [];
    if (ASKS_PAPER.test(q)) {
      tips.push("특정 논문을 묻는 질문입니다. 논문에서 이 문장은 없는 논문 내용을 지어낸 답을 " +
        (f.A.fabricated + f.A.speculated) + "/" + f.n + "건에서 " + (f.B.fabricated + f.B.speculated) + "/" + f.n + "건으로 줄였습니다.");
      tips.push("특히 " + f.plausibleItems.label + "은 문장이 없을 때 " + f.plausibleItems.contentA + "/" + f.plausibleItems.nA +
        "건 모두 내용을 지어냈습니다. 제목이 그럴듯할수록 답을 더 의심하세요.");
    }
    tips.push("이 문장을 붙여도 실제 논문 답은 " + r.B.correct + "/" + r.n + "건 모두 맞았습니다(거부 " + r.B.refused + "건). 대신 '원문을 확인하라'는 조심스러운 답이 " +
      pct(r.A.hedged, r.n) + "%에서 " + pct(r.B.hedged, r.n) + "%로 늘었습니다.");
    tips.push("실제 논문 답에도 원문에 없는 세부 사항이 " + r.unverifiedDetails + "건 있었습니다. 저자·연도·수치는 원문으로 확인하세요.");
    var ul = $("tips1"); ul.innerHTML = "";
    tips.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
  }

  function copyResult() {
    var ta = $("result");
    var done = function () { setMsg($("msg1"), "복사했습니다. AI 대화창에 붙여 넣으세요.", "ok"); };
    var fallback = function () {
      ta.focus(); ta.select();
      try { document.execCommand("copy") ? done() : setMsg($("msg1"), "자동 복사가 막혀 있습니다. 위 글을 길게 눌러 직접 복사해 주세요.", "warn"); }
      catch (e) { setMsg($("msg1"), "자동 복사가 막혀 있습니다. 위 글을 직접 선택해 복사해 주세요.", "warn"); }
    };
    if (!ta.value) { setMsg($("msg1"), "먼저 문장 붙이기를 눌러 주세요.", "warn"); return; }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(ta.value).then(done, fallback);
    } else { fallback(); }
  }

  $("btn-add").addEventListener("click", addSentence);
  $("btn-example").addEventListener("click", function () { $("question").value = EXAMPLE; addSentence(); });
  $("btn-copy").addEventListener("click", copyResult);
  $("question").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { addSentence(); }
  });

  // ---------- 2. 효과와 한계 ----------
  function bar(label, a, b, n, note) {
    var wrap = document.createElement("div"); wrap.className = "bar-group";
    var h = document.createElement("p"); h.className = "bar-title"; h.textContent = label; wrap.appendChild(h);
    [["A 문장 없음", a, "a"], ["B 문장 붙임", b, "b"]].forEach(function (x) {
      var row = document.createElement("div"); row.className = "bar-row";
      var name = document.createElement("span"); name.className = "bar-name"; name.textContent = x[0];
      var track = document.createElement("span"); track.className = "bar-track";
      var fill = document.createElement("span"); fill.className = "bar-fill " + x[2];
      fill.style.width = Math.max(pct(x[1], n), 1) + "%";
      track.appendChild(fill);
      var val = document.createElement("span"); val.className = "bar-val"; val.textContent = x[1] + "/" + n + " (" + pct(x[1], n) + "%)";
      row.appendChild(name); row.appendChild(track); row.appendChild(val); wrap.appendChild(row);
    });
    if (note) { var s = document.createElement("p"); s.className = "bar-note"; s.textContent = note; wrap.appendChild(s); }
    return wrap;
  }
  var f = P.fake, r = P.real, bars = $("bars");
  bars.appendChild(bar("없는 논문인데 내용을 지어내거나 짐작한 답", f.A.fabricated + f.A.speculated, f.B.fabricated + f.B.speculated, f.n,
    "차이는 10문항 중 " + f.itemsWithDifference + "문항에서만 나왔습니다. 나머지 6문항은 문장이 없어도 모두 '모른다'고만 답했습니다."));
  bars.appendChild(bar("그중 논문이 있다고 전제하고 지어낸 답 (엄격 기준)", f.A.fabricated, f.B.fabricated, f.n,
    "2건 모두 한 문항에서 나와, 이 기준으로는 차이를 말하기 어렵습니다."));
  bars.appendChild(bar("실제 논문을 맞게 설명한 답", r.A.correct, r.B.correct, r.n, "문장을 붙여도 실제 논문 답을 거부하지 않았습니다."));
  bars.appendChild(bar("실제 논문 답 중 '원문 확인'처럼 조심스러운 표현이 있는 답", r.A.hedged, r.B.hedged, r.n, null));
  P.limits.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; $("limits").appendChild(li); });

  // ---------- 3. 받은 답 점검 ----------
  var DONT_KNOW = /모르|알지\s*못|확인할\s*수\s*없|찾을\s*수\s*없|정보가\s*없|확인되지\s*않|존재하지\s*않|not\s+aware|don'?t\s+know|cannot\s+(find|verify)|no\s+information/i;

  $("answer").addEventListener("input", function () {
    var a = $("answer").value || "";
    if (!a.trim()) { setMsg($("suggest"), "", ""); return; }
    if (DONT_KNOW.test(a)) {
      setMsg($("suggest"), "답에 '모른다·확인할 수 없다'는 표현이 보입니다. ①은 '예'일 가능성이 높습니다. 직접 읽고 골라 주세요.", "info");
    } else {
      setMsg($("suggest"), "답에서 '모른다'는 표현을 찾지 못했습니다. ①은 '아니오'일 가능성이 높습니다. 직접 읽고 골라 주세요.", "info");
    }
  });

  var RESULTS = {
    "no-yes": {
      cls: "bad", name: "지어냄일 수 있음",
      body: "논문의 기준으로는 '논문이 있다고 전제하고 내용을 서술한 답'입니다. 논문이 실제로 있다면 맞는 답일 수 있지만, AI만으로는 알 수 없습니다.",
      next: ["논문 제목을 큰따옴표로 묶어 검색해 실제로 있는지 먼저 확인하세요.", "없다면 1번에서 문장을 붙인 질문으로 다시 물어보세요. 논문에서는 이런 답이 문장을 붙이자 2/20건에서 0/20건이 되었습니다."]
    },
    "yes-yes": {
      cls: "mid", name: "추측 섞인 보류",
      body: "모른다고 한 뒤 제목 단어로 내용을 짐작한 답입니다. 그 뒤의 설명은 그 논문의 실제 내용이 아닙니다.",
      next: ["'모른다' 이후의 설명은 인용하지 마세요.", "논문에서는 문장이 없을 때 이런 답이 5/20건, 문장을 붙였을 때 1/20건이었습니다. 문장을 붙여도 완전히 사라지지는 않습니다."]
    },
    "yes-no": {
      cls: "good", name: "순수 보류",
      body: "모른다고 밝히고 내용을 짐작하지 않은 답입니다. 논문의 기준에서 가장 믿을 만한 반응입니다.",
      next: ["논문 검색 사이트나 도서관 데이터베이스에서 직접 찾아보세요.", "논문에서는 문장을 붙였을 때 이런 답이 13/20건에서 19/20건으로 늘었습니다."]
    },
    "no-no": {
      cls: "mid", name: "판정할 내용이 없음",
      body: "모른다고도 하지 않고 논문 내용도 말하지 않았다면, 질문에 답하지 않은 상태입니다.",
      next: ["질문에 논문 제목과 알고 싶은 것(주장, 방법 등)이 들어 있는지 확인하고 다시 물어보세요."]
    }
  };

  function checked(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }

  $("btn-judge").addEventListener("click", function () {
    var a = checked("q1"), b = checked("q2"), out = $("out3");
    out.hidden = false; out.className = "judge";
    if (!a || !b) {
      out.innerHTML = "";
      var p = document.createElement("p"); p.textContent = "①과 ② 두 질문에 모두 답해 주세요."; out.appendChild(p);
      out.className = "judge warn"; return;
    }
    var res = RESULTS[a + "-" + b];
    out.className = "judge " + res.cls; out.innerHTML = "";
    var h = document.createElement("h3"); h.textContent = "판정: " + res.name; out.appendChild(h);
    var p2 = document.createElement("p"); p2.textContent = res.body; out.appendChild(p2);
    var ul = document.createElement("ul");
    res.next.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
    out.appendChild(ul);
  });

  $("btn-reset").addEventListener("click", function () {
    document.querySelectorAll('input[type="radio"]').forEach(function (el) { el.checked = false; });
    $("answer").value = ""; setMsg($("suggest"), "", ""); $("out3").hidden = true;
  });
})();
