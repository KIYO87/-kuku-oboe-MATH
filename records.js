/* 九九おぼえMATH 共通：きろく・シール・ランク（localStorage に保存） */
(function () {
  var KEY = 'kukuOboeRecords_v1';

  var STICKERS = {
    '1': '🍎', '2': '🐰', '3': '🐱', '4': '🐶', '5': '🐼', '6': '🦊', '7': '🦁', '8': '🐙', '9': '🐉',
    '2-5': '🌈', '6-9': '🚀', '4,7': '⭐', 'all': '👑'
  };
  var DAN_LABEL = {
    '1': '1のだん', '2': '2のだん', '3': '3のだん', '4': '4のだん', '5': '5のだん',
    '6': '6のだん', '7': '7のだん', '8': '8のだん', '9': '9のだん',
    '2-5': '2〜5のだん', '6-9': '6〜9のだん', '4,7': '4と7のだん', 'all': 'ぜんぶ'
  };
  var DAN_ORDER = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '2-5', '6-9', '4,7', 'all'];
  // min = シールの合計まい数
  var RANKS = [
    { min: 0,   name: 'たまごさん',   icon: '🥚' },
    { min: 3,   name: 'ひよこさん',   icon: '🐣' },
    { min: 10,  name: 'こどりさん',   icon: '🐤' },
    { min: 20,  name: 'ことりさん',   icon: '🐦' },
    { min: 35,  name: 'はやぶさ',     icon: '🦅' },
    { min: 55,  name: '九九きし',     icon: '🛡️' },
    { min: 80,  name: '九九はかせ',   icon: '🎓' },
    { min: 100, name: '九九スター',   icon: '🌟' },
    { min: 120, name: '九九マスター', icon: '👑' },
    { min: 150, name: '九九ダイヤ',   icon: '💎' },
    { min: 200, name: '九九でんせつ', icon: '🐲' }
  ];
  // 200まいのあとは、100まいごとにランクアップ（300, 400, ... 10000まいまで）
  for (var m = 300, lv = 2; m <= 10000; m += 100, lv++) {
    RANKS.push({ min: m, name: '九九でんせつ Lv.' + lv, icon: '🐲' });
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function save(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
  }
  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }
  // 聞いてもらい(kiite)=タイムが小さいほど良い / 答え(kotae)=とくてんが大きいほど良い
  function better(app, a, b) { return app === 'kiite' ? a < b : a > b; }
  function rankIndex(n) {
    var idx = 0;
    RANKS.forEach(function (r, i) { if (n >= r.min) idx = i; });
    return idx;
  }
  function fmtValue(app, v) {
    return app === 'kiite' ? Number(v).toFixed(1) + 'びょう' : v + 'てん';
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtDate(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate());
  }
  function fmtTime(ts) {
    var d = new Date(ts);
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function top(app, dan) {
    return load().filter(function (r) { return r.app === app && r.dan === dan; })
      .sort(function (a, b) {
        return a.value === b.value ? a.ts - b.ts : (better(app, a.value, b.value) ? -1 : 1);
      }).slice(0, 10);
  }

  // rec: {app, dan, level, order?, value}
  function add(rec) {
    var all = load();
    var prevRank = rankIndex(all.length);
    var same = all.filter(function (r) { return r.app === rec.app && r.dan === rec.dan; });
    var isBest = same.length > 0 && same.every(function (r) { return better(rec.app, rec.value, r.value); });
    rec.ts = Date.now();
    all.push(rec);
    save(all);
    var newRank = rankIndex(all.length);
    return {
      rec: rec, isBest: isBest, isFirst: same.length === 0,
      rankUp: newRank > prevRank, rank: RANKS[newRank],
      sticker: STICKERS[rec.dan] || '⭐', total: all.length
    };
  }

  function showReward(res) {
    if (!res) return;
    var old = document.getElementById('kuku-reward');
    if (old) old.remove();
    var msgs = [];
    if (res.rankUp) msgs.push('🎉 ランクアップ！ ' + res.rank.icon + ' ' + res.rank.name);
    if (res.isBest) msgs.push('✨ じぶんのベストこうしん！');
    else if (res.isFirst) msgs.push('🌱 この段のさいしょの きろく！');
    var el = document.createElement('div');
    el.id = 'kuku-reward';
    el.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;font-family:"M PLUS Rounded 1c",sans-serif;';
    el.innerHTML =
      '<div style="background:#fff;border-radius:24px;padding:24px;max-width:340px;width:100%;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.3);">' +
      '<div style="font-weight:900;color:#059669;font-size:18px;">シールゲット！</div>' +
      '<div style="font-size:84px;line-height:1.2;margin:8px 0;">' + res.sticker + '</div>' +
      '<div style="font-weight:700;color:#475569;font-size:14px;">' + (DAN_LABEL[res.rec.dan] || '') + '：' + fmtValue(res.rec.app, res.rec.value) + '</div>' +
      msgs.map(function (m) { return '<div style="font-weight:900;color:#d97706;margin-top:8px;">' + m + '</div>'; }).join('') +
      '<div style="font-size:12px;color:#94a3b8;margin-top:8px;">シールは ぜんぶで ' + res.total + 'まい</div>' +
      '<div style="display:flex;gap:8px;margin-top:16px;">' +
      '<button id="kuku-reward-close" style="flex:1;padding:12px;border-radius:12px;border:0;background:#f1f5f9;font-weight:900;color:#475569;cursor:pointer;">とじる</button>' +
      '<a href="gambari.html" style="flex:1;padding:12px;border-radius:12px;background:#10b981;color:#fff;font-weight:900;text-decoration:none;">きみのがんばり</a>' +
      '</div></div>';
    document.body.appendChild(el);
    document.getElementById('kuku-reward-close').onclick = function () { el.remove(); };
  }

  window.KukuRecords = {
    STICKERS: STICKERS, DAN_LABEL: DAN_LABEL, DAN_ORDER: DAN_ORDER, RANKS: RANKS,
    load: load, clear: clear, add: add, top: top, rankIndex: rankIndex,
    fmtValue: fmtValue, fmtDate: fmtDate, fmtTime: fmtTime, showReward: showReward
  };
})();
