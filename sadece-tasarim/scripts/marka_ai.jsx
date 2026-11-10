#target illustrator
#include "lib_ai.jsx"
#include "marka_veri.jsx"
// sadece-tasarim :: brand-identity kitinden duzenlenebilir Illustrator marka dosyasi.
// Once: python <skill>/scripts/marka_aktar.py <WORK/kit/A> <proje>   (marka_veri.jsx'i yazar, logolari kopyalar)
// Proje klasorune kopyala: <proje>/_script/marka_ai.jsx (+ lib_ai.jsx). Calistir:
//   powershell -NoProfile -ExecutionPolicy Bypass -File <skill>/scripts/run_jsx.ps1 -App illustrator -Script "<proje>\_script\marka_ai.jsx"
// Cikti: ai/<Marka>_marka.ai (her logo surumu ayri artboard, vektor ve duzenlenebilir; renk paneli; marka renk
//        ornek grubu), png/marka_*.png onizlemeler, png/kucuk/ 16-32-64 px logo testleri.

var BASE = File($.fileName).parent.parent.fsName.replace(/\\/g, "/") + "/";
var M = MARKA;
var AD = String(M.ad).replace(/[^A-Za-z0-9_-]/g, "") || "Marka";

function etiketFontu() {
  var adaylar = [];
  if (M.fontlar && M.fontlar.text) {
    var a = M.fontlar.text.aile.replace(/ /g, "");
    adaylar.push(a + "-Regular", a + "Roman-Regular", a, M.fontlar.text.aile);
  }
  adaylar.push("ArialMT");
  return AI.fontOr(adaylar);
}

function kur() {
  AI.init(BASE + "_script/", "marka_log.txt");
  var logolar = M.logolar, n = logolar.length + 1; // + renk paneli
  var W = 1200, H = 700;
  var doc = AI.newDoc(AD + "_marka", W, H, n, 3, 120);
  var F = etiketFontu(), ink = (M.roller && M.roller.text) || "#111111";
  AI.log("etiket fontu: " + F);

  var lyZ = AI.layer(doc, "Zemin"), lyL = AI.layer(doc, "Logo"), lyE = AI.layer(doc, "Etiket"), kucukTest = [];
  for (var i = 0; i < logolar.length; i++) {
    var L = logolar[i];
    doc.artboards[i].name = L.ad;
    var zemin = L.zemin || "#FFFFFF";
    AI.rect(doc, i, 0, 0, W, H, zemin, 0, null, lyZ).name = "Zemin " + L.ad;
    var kare = (L.ad == "symbol-only" || L.ad == "app-icon-512");
    var g = AI.importSVG(doc, i, L.svg, { w: kare ? 380 : 820, h: kare ? 380 : 420, cx: W / 2, cy: H / 2 - 20, name: L.etiket }, lyL);
    if (L.ad == "full-color" || L.ad == "symbol-only") kucukTest.push({ g: g, ad: L.ad });
    var koyu = (L.mod == "dark") || (L.zemin && L.zemin != "#FFFFFF" && L.zemin != "#F8FBFA");
    AI.text(doc, i, L.etiket + "  ·  " + L.ad + ".svg", { font: F, size: 18, color: koyu ? "FFFFFF" : ink, x: 40, y: H - 36 }, lyE);
  }

  // Renk paneli (son artboard)
  var p = n - 1, R = M.renkler || [];
  doc.artboards[p].name = "renkler";
  AI.rect(doc, p, 0, 0, W, H, "#FFFFFF", 0, null, lyZ);
  var tum = [];
  for (var r = 0; r < R.length; r++) tum.push({ ad: M.ad + " " + R[r].ad, hex: R[r].hex });
  if (M.roller) {
    var anah = ["text", "background", "surface", "primary", "accent", "textMuted"];
    for (var k = 0; k < anah.length; k++) if (M.roller[anah[k]]) tum.push({ ad: M.ad + " " + anah[k], hex: M.roller[anah[k]] });
  }
  AI.swatchGroup(doc, M.ad, tum);
  var cw = Math.min(260, (W - 80 - (R.length - 1) * 24) / Math.max(R.length, 1));
  for (var j = 0; j < R.length; j++) {
    var x = 40 + j * (cw + 24);
    AI.rect(doc, p, x, 60, cw, 360, R[j].hex, 12, null, lyZ).name = R[j].ad;
    AI.text(doc, p, R[j].ad, { font: F, size: 26, color: ink, x: x, y: 470 }, lyE);
    AI.text(doc, p, R[j].hex, { font: F, size: 20, color: ink, x: x, y: 504 }, lyE);
    if (R[j].kullanim) AI.text(doc, p, String(R[j].kullanim).substr(0, 34), { font: F, size: 15, color: ink, x: x, y: 534 }, lyE);
  }
  AI.text(doc, p, (M.paletAdi || "") + (M.setAdi ? "  ·  set " + M.set + ": " + M.setAdi : ""), { font: F, size: 18, color: ink, x: 40, y: H - 36 }, lyE);

  // Disa aktar: once PNG'ler, en son .ai
  new Folder(BASE + "png").create(); new Folder(BASE + "ai").create();
  for (var e = 0; e < n; e++) AI.exportPNG(doc, e, BASE + "png/marka_" + doc.artboards[e].name + ".png", 100);
  AI.log("png: " + n + " artboard");
  // Kucuk boyut testi: logonun kendi sinirlarinda 16/32/64 px (kitin small-*.png render'lariyla birlikte bak)
  for (var t = 0; t < kucukTest.length; t++) AI.smallTest(doc, kucukTest[t].g, BASE + "png/kucuk", kucukTest[t].ad);
  AI.log("kucuk boyut testi: png/kucuk/");
  AI.saveAI(doc, BASE + "ai/" + AD + "_marka.ai");
  AI.log("ai: " + BASE + "ai/" + AD + "_marka.ai");
}

AI.run(kur);
