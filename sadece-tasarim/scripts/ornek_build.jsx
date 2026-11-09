#target photoshop
#include "lib.jsx"
// sadece-tasarim :: ornek build (story + post). Proje klasorune kopyala: <proje>/_script/build.jsx
// Klasor duzeni:  <proje>/assets (girdiler)  <proje>/_script (build.jsx + lib.jsx)  <proje>/psd  <proje>/png
// Calistir: powershell -NoProfile -ExecutionPolicy Bypass -File <skill>/scripts/run_jsx.ps1 -Script "<proje>\_script\build.jsx"
// Turkce metni dogrudan yazabilirsin (run_jsx.ps1 \uXXXX'e cevirir). Metni kullanicinin verdigi gibi birak.

var BASE = File($.fileName).parent.parent.fsName.replace(/\\/g, "/") + "/";
var A = BASE + "assets/";

// ---- tasarim karari (tek yerde) ----
var T = {
  title: "Başlık Buraya",
  sub: "Alt başlık: şık, ılık, ağır değil",
  fTitle: "ITCAvantGardePro-Bold",
  fSub: "CommaSerif-Italic",
  ink: "FFFFFF", accent: "F2B46B", deep: "141A2E",
  photo: A + "foto.jpg",
  logo: A + "logo.png"
};

function story() {
  var W = 1080, H = 1920;
  var d = SD.newDoc("Ornek_Story", W, H, T.deep);
  SD.guides(d, 250, 340, 64);                       // story guvenli alan
  var gImg = SD.group(d, "Görsel");
  var ph = SD.place(d, T.photo, "Ana Görsel", { w: W, h: H, fit: "cover" });
  SD.into(ph, gImg);
  SD.maskRect(d, ph, 0, 520, W, 1500, 220);           // ust kisim zemine erisin, baslik alani temiz kalsin
  var c1 = SD.curves(d, "Eğriler", { rgb: [[0, 8], [70, 58], [190, 200], [255, 248]] }, true); SD.into(c1, gImg);
  var c2 = SD.colorBalance(d, "Renk Dengesi", [-4, 0, 8], [3, 0, -4], [5, 0, -6], true); SD.into(c2, gImg);
  var c3 = SD.vibrance(d, "Canlılık", 10, -5, true); SD.into(c3, gImg);
  SD.dropEmpty(d);

  var gFx = SD.group(d, "Işık & Gölge");
  SD.into(SD.glow(d, "Işık", 820, 380, 520, 420, T.accent, 260, 35, BlendMode.SCREEN), gFx);
  SD.into(SD.softRect(d, "Alt Karartma", -200, 1420, W + 400, 700, "000000", 220, 55), gFx);
  SD.into(SD.vignette(d, "000000", 35), gFx);

  var gTxt = SD.group(d, "Metin");
  var t1 = SD.text(d, T.title, { font: T.fTitle, size: 104, color: T.ink, x: W / 2, y: 430, just: "center", track: -10, name: "Başlık" });
  SD.fitWidth(t1, W - 2 * 90);
  SD.into(t1, gTxt);
  var t2 = SD.text(d, T.sub, { font: T.fSub, size: 46, color: T.accent, x: W / 2, y: SD.bounds(t1).b + 90, just: "center", name: "Alt Başlık" });
  SD.into(t2, gTxt);

  var gLogo = SD.group(d, "Logo");
  var lg = SD.place(d, T.logo, "Logo", { w: 300, cx: W / 2, cy: H - 340 - 90 });
  SD.dropShadow(d, lg, { op: 40, dist: 6, size: 18 });
  SD.into(lg, gLogo);

  SD.grain(d, 6, 18);
  SD.save(d, "Ornek_Story");
}

function post() {  // story'nin kirpmasi degil: ayrica kompoze edilir
  var W = 1080, H = 1350;
  var d = SD.newDoc("Ornek_Post", W, H, T.deep);
  SD.guides(d, 0, 0, 40);                           // profil izgarasi 3:4 kirpar: kenarlardan ~40px pay
  var gImg = SD.group(d, "Görsel");
  var ph = SD.place(d, T.photo, "Ana Görsel", { w: W, h: 900, fit: "cover", cy: H - 450 });
  SD.into(ph, gImg);
  SD.maskRect(d, ph, 0, H - 900 + 140, W, 900, 160);
  SD.into(SD.curves(d, "Eğriler", { rgb: [[0, 8], [70, 58], [190, 200], [255, 248]] }, true), gImg);
  SD.dropEmpty(d);
  SD.vignette(d, "000000", 30);                     // efektler metnin ALTINDA kalsin (yazi grilesmesin)

  var gTxt = SD.group(d, "Metin");
  var t1 = SD.text(d, T.title, { font: T.fTitle, size: 88, color: T.ink, x: 90, y: 200, just: "left", track: -10, name: "Başlık" });
  SD.fitWidth(t1, W - 180); SD.into(t1, gTxt);
  var t2 = SD.text(d, T.sub, { font: T.fSub, size: 40, color: T.accent, x: 90, y: SD.bounds(t1).b + 70, name: "Alt Başlık" });
  SD.into(t2, gTxt);
  var gLogo = SD.group(d, "Logo");
  SD.into(SD.rect(d, "Logo Plakası", W / 2 - 170, H - 150, 340, 96, "FFFFFF", 48, 92), gLogo);  // koyu/karisik zeminde okunurluk
  SD.into(SD.place(d, T.logo, "Logo", { w: 240, cx: W / 2, cy: H - 102 }), gLogo);
  SD.grain(d, 6, 18);                               // grain en ustte olabilir (Overlay, notr)
  SD.save(d, "Ornek_Post");
}

SD.init(BASE, "_script/build_log.txt");
SD.run(function () { story(); post(); });
