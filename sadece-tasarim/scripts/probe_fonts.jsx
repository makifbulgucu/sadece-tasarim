// sadece-tasarim :: font denetimi (Photoshop)
// Calistir: run_jsx.ps1 -Script probe_fonts.jsx -JsxArgs "<cikti klasoru>","Avant,Comma,Montserrat"
//  1) Aile/ad/PostScript adinda arananlari gecen fontlari <klasor>/fonts.txt'e yazar (aile | stil | PostScriptAdi)
//  2) Bulunan ilk 14 font icin <klasor>/font_ornek.png uretir: her satirda Turkce harf ornegi o fontla yazilir.
//     PNG'yi GORSEL olarak kontrol et: eksik glif yedek fonta duser (farkli bicim) ya da kutu/bosluk gorunur.
//     Ozellikle S-cedilla, I-nokta, noktasiz i, g-breve; bazi fontlar yalnizca buyuk harf cizer.
// Belgeyi kendisi acar ve kendisi kapatir; kullanicinin belgelerine dokunmaz.
var A = (typeof SD_ARGS != "undefined") ? SD_ARGS : [];
var OUT = A[0] ? String(A[0]) : Folder.temp.fsName;
OUT = OUT.replace(/\\/g, "/"); if (OUT.charAt(OUT.length - 1) != "/") OUT += "/";
new Folder(OUT).create();
var Q = A[1] ? String(A[1]).split(",") : ["Avant", "Comma", "Montserrat"];
var SAMPLE = "ŞİĞÜÖÇ şığüöç İstanbul Başlık ağ 2026";

(function () {
  var ru = app.preferences.rulerUnits, tu = app.preferences.typeUnits, dd = app.displayDialogs;
  app.preferences.rulerUnits = Units.PIXELS; app.preferences.typeUnits = TypeUnits.PIXELS; app.displayDialogs = DialogModes.NO;
  try { app.bringToFront(); } catch (e) {}
  var hits = [], lines = [];
  for (var i = 0; i < app.fonts.length; i++) {
    var f = app.fonts[i];
    for (var j = 0; j < Q.length; j++) {
      var q = Q[j].replace(/^\s+|\s+$/g, "").toLowerCase(); if (!q) continue;
      if (f.family.toLowerCase().indexOf(q) > -1 || f.name.toLowerCase().indexOf(q) > -1 || f.postScriptName.toLowerCase().indexOf(q) > -1) {
        hits.push(f); lines.push(f.family + " | " + f.style + " | " + f.postScriptName); break;
      }
    }
  }
  var fl = new File(OUT + "fonts.txt"); fl.encoding = "UTF-8"; fl.open("w"); fl.write(lines.join("\n")); fl.close();
  // Ornek icin aileler arasinda sirayla sec (her aileden once biri, sonra ikincisi...)
  var fam = {}, order = [];
  for (var h = 0; h < hits.length; h++) { var k0 = hits[h].family; if (!fam[k0]) { fam[k0] = []; order.push(k0); } fam[k0].push(hits[h]); }
  var pick = [], lvl = 0, added = true;
  while (pick.length < 14 && added) { added = false; for (var o2 = 0; o2 < order.length && pick.length < 14; o2++) { if (fam[order[o2]][lvl]) { pick.push(fam[order[o2]][lvl]); added = true; } } lvl++; }
  hits = pick;
  var n = hits.length, res = "fonts.txt: " + lines.length + " font";
  if (n > 0) {
    var rowH = 90, doc = app.documents.add(1300, 40 + n * rowH, 72, "_font_ornek", NewDocumentMode.RGB, DocumentFill.WHITE);
    for (var k = 0; k < n; k++) {
      var y = 40 + k * rowH;
      var a = doc.artLayers.add(); a.kind = LayerKind.TEXT; a.textItem.contents = hits[k].postScriptName;
      a.textItem.font = "ArialMT"; a.textItem.size = 18; a.textItem.position = [20, y + 26];
      var b = doc.artLayers.add(); b.kind = LayerKind.TEXT; b.textItem.contents = SAMPLE;
      b.textItem.font = hits[k].postScriptName; b.textItem.size = 46; b.textItem.position = [20, y + 76];
    }
    var o = new PNGSaveOptions();
    doc.saveAs(new File(OUT + "font_ornek.png"), o, true, Extension.LOWERCASE);
    doc.close(SaveOptions.DONOTSAVECHANGES);
    res += " | font_ornek.png: " + n + " ornek";
  }
  app.preferences.rulerUnits = ru; app.preferences.typeUnits = tu; app.displayDialogs = dd;
  return res;
})();
