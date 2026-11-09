// sadece-tasarim :: Photoshop yardimci kutuphanesi (ExtendScript / ES3)
// Kullanim: proje betiginin basinda  #include "lib.jsx"  (lib.jsx betikle ayni klasorde olmali)
// Bu dosya ASCII kalmali. Turkce metinleri build betiginde yazin; run_ps.ps1 onlari \uXXXX'e cevirir.
// Koordinatlar piksel, orijin sol-ust. Tum fonksiyonlar SD nesnesi altinda (isim cakismasi olmasin diye).

var SD = SD || {};
(function () {
  var cID = function (s) { return charIDToTypeID(s); };
  var sID = function (s) { return stringIDToTypeID(s); };
  SD.cID = cID; SD.sID = sID;

  SD._logFile = null;
  SD._lines = [];
  SD._prefs = null;

  // ---------- kurulum / log ----------
  // dir: cikti klasoru (sonu / ile), logName: log dosyasi adi
  SD.init = function (dir, logName) {
    SD.DIR = dir;
    new Folder(dir).create();
    SD._prefs = { ru: app.preferences.rulerUnits, tu: app.preferences.typeUnits, dd: app.displayDialogs };
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;
    app.displayDialogs = DialogModes.NO;
    try { app.bringToFront(); } catch (e) {}
    SD._logFile = new File(dir + (logName || "build_log.txt"));
    SD._logFile.encoding = "UTF-8";
    SD._logFile.open("w"); SD._logFile.close();
  };
  SD.restorePrefs = function () {
    if (!SD._prefs) return;
    app.preferences.rulerUnits = SD._prefs.ru;
    app.preferences.typeUnits = SD._prefs.tu;
    app.displayDialogs = SD._prefs.dd;
  };
  SD.log = function (s) {
    SD._lines.push(s);
    if (!SD._logFile) return;
    SD._logFile.open("a"); SD._logFile.writeln(s); SD._logFile.close();
  };
  // Betigin son satiri: SD.run(function(){ ... });  -> "OK ..." ya da "ERR ..." dondurur (run_ps.ps1 ekrana basar)
  SD.run = function (fn) {
    var res;
    try { fn(); res = "OK\n" + SD._lines.join("\n"); }
    catch (e) {
      res = "ERR: " + e + " | satir " + e.line + (e.fileName ? " | " + e.fileName : "");
      SD.log(res);
    }
    SD.restorePrefs();
    return res;
  };

  // ---------- renk ----------
  SD.hex = function (h) {
    h = String(h).replace("#", "");
    var c = new SolidColor();
    c.rgb.red = parseInt(h.substr(0, 2), 16);
    c.rgb.green = parseInt(h.substr(2, 2), 16);
    c.rgb.blue = parseInt(h.substr(4, 2), 16);
    return c;
  };
  function rgbDesc(hex) {
    var c = SD.hex(hex), d = new ActionDescriptor();
    d.putDouble(cID("Rd  "), c.rgb.red); d.putDouble(cID("Grn "), c.rgb.green); d.putDouble(cID("Bl  "), c.rgb.blue);
    return d;
  }

  // ---------- belge ----------
  // Kullanicinin acik belgelerine DOKUNMAZ. Yalnizca ayni adli (onceki calistirmadan kalan) belgeyi kapatir;
  // o belgede kaydedilmemis degisiklik varsa hata firlatir (kullaniciya sor).
  SD.closeOwn = function (name) {
    for (var i = app.documents.length - 1; i >= 0; i--) {
      var d = app.documents[i];
      if (d.name == name || d.name == name + ".psd") {
        if (!d.saved) throw new Error("'" + d.name + "' acik ve kaydedilmemis degisiklik var; kullaniciya sormadan kapatilmaz");
        d.close(SaveOptions.DONOTSAVECHANGES);
      }
    }
  };
  // Yeni belge: sRGB, 72 ppi, 8 bit. bgHex verilirse duzenlenebilir duz renk dolgu katmani ("Zemin") ekler.
  SD.newDoc = function (name, w, h, bgHex) {
    SD.closeOwn(name);
    var doc = app.documents.add(w, h, 72, name, NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1, BitsPerChannelType.EIGHT, "sRGB IEC61966-2.1");
    doc.activeLayer.name = "_bos";
    if (bgHex) SD.solid(doc, "Zemin", bgHex);
    return doc;
  };
  // Bos baslangic katmanini siler (en az bir baska katman varken cagir)
  SD.dropEmpty = function (doc) {
    try { doc.artLayers.getByName("_bos").remove(); } catch (e) {}
  };
  // Guvenli alan kilavuzlari (story: top 250, bottom 340, side 64)
  SD.guides = function (doc, top, bottom, side) {
    var W = doc.width.as("px"), H = doc.height.as("px");
    if (top) doc.guides.add(Direction.HORIZONTAL, UnitValue(top, "px"));
    if (bottom) doc.guides.add(Direction.HORIZONTAL, UnitValue(H - bottom, "px"));
    if (side) { doc.guides.add(Direction.VERTICAL, UnitValue(side, "px")); doc.guides.add(Direction.VERTICAL, UnitValue(W - side, "px")); }
  };

  // ---------- katman yardimcilari ----------
  SD.layer = function (doc, name, op, blend) {
    var l = doc.artLayers.add(); l.name = name;
    if (op != null) l.opacity = op;
    if (blend) l.blendMode = blend;
    doc.activeLayer = l; return l;
  };
  SD.group = function (doc, name) { var g = doc.layerSets.add(); g.name = name; return g; };
  // Katmani gruba tasir ve grubu aktif yapar: sonraki katmanlar grubun DISINDA, ustunde olusur.
  SD.into = function (layer, group) { layer.move(group, ElementPlacement.INSIDE); app.activeDocument.activeLayer = group; return layer; };
  SD.bounds = function (l) { var b = l.bounds; return { x: b[0].as("px"), y: b[1].as("px"), r: b[2].as("px"), b: b[3].as("px"), w: b[2].as("px") - b[0].as("px"), h: b[3].as("px") - b[1].as("px") }; };
  // Katmani hizala: o = {x, y} sol-ust  ya da  {cx, cy} merkez  ya da  {r, b} sag-alt kenar
  SD.moveTo = function (l, o) {
    var b = SD.bounds(l), dx = 0, dy = 0;
    if (o.x != null) dx = o.x - b.x; if (o.cx != null) dx = o.cx - (b.x + b.w / 2); if (o.r != null) dx = o.r - b.r;
    if (o.y != null) dy = o.y - b.y; if (o.cy != null) dy = o.cy - (b.y + b.h / 2); if (o.b != null) dy = o.b - b.b;
    l.translate(dx, dy); return l;
  };

  // Duzenlenebilir duz renk dolgu katmani (Katman > Yeni Dolgu Katmani > Duz Renk)
  SD.solid = function (doc, name, hex) {
    doc.selection.deselect();
    var desc = new ActionDescriptor(), ref = new ActionReference();
    ref.putClass(sID("contentLayer")); desc.putReference(cID("null"), ref);
    var d2 = new ActionDescriptor(), d3 = new ActionDescriptor();
    d3.putObject(cID("Clr "), cID("RGBC"), rgbDesc(hex));
    d2.putObject(cID("Type"), sID("solidColorLayer"), d3);
    desc.putObject(cID("Usng"), sID("contentLayer"), d2);
    executeAction(cID("Mk  "), desc, DialogModes.NO);
    doc.activeLayer.name = name; return doc.activeLayer;
  };

  // Vektor dikdortgen sekil katmani; r = kose yaricapi (Rds yerine kose bazli deger kullanilir, calisir)
  SD.rect = function (doc, name, x, y, w, h, hex, r, op, blend) {
    doc.selection.deselect();
    r = Math.min(r || 0, w / 2, h / 2);
    var desc = new ActionDescriptor(), ref = new ActionReference();
    ref.putClass(sID("contentLayer")); desc.putReference(cID("null"), ref);
    var d2 = new ActionDescriptor(), d3 = new ActionDescriptor();
    d3.putObject(cID("Clr "), cID("RGBC"), rgbDesc(hex));
    d2.putObject(cID("Type"), sID("solidColorLayer"), d3);
    var d5 = new ActionDescriptor(), P = cID("#Pxl");
    d5.putUnitDouble(cID("Top "), P, y); d5.putUnitDouble(cID("Left"), P, x);
    d5.putUnitDouble(cID("Btom"), P, y + h); d5.putUnitDouble(cID("Rght"), P, x + w);
    if (r > 0) {
      var rr = ["topRight", "topLeft", "bottomLeft", "bottomRight"];
      for (var i = 0; i < 4; i++) d5.putUnitDouble(sID(rr[i]), P, r);
      d5.putInteger(sID("unitValueQuadVersion"), 1);
    }
    d2.putObject(cID("Shp "), cID("Rctn"), d5);
    desc.putObject(cID("Usng"), sID("contentLayer"), d2);
    executeAction(cID("Mk  "), desc, DialogModes.NO);
    var l = doc.activeLayer; l.name = name;
    if (op != null) l.opacity = op; if (blend) l.blendMode = blend;
    return l;
  };

  // Secim yardimcilari
  SD.selRect = function (doc, x, y, w, h, feather) {
    doc.selection.select([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
    if (feather) doc.selection.feather(feather);
  };
  SD.selEllipse = function (doc, cx, cy, rx, ry, feather) {
    var p = [];
    for (var i = 0; i < 64; i++) { var a = i / 64 * Math.PI * 2; p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
    doc.selection.select(p);
    if (feather) doc.selection.feather(feather);
  };
  SD.selPoly = function (doc, pts, feather) { doc.selection.select(pts); if (feather) doc.selection.feather(feather); };

  // Yumusak isik / golge / renk lekesi: yumusak elips dolgu, ayri piksel katmani
  // ornek: SD.glow(doc,"Isik",780,300,520,420,"FFE2B0",260,45,BlendMode.SCREEN)
  SD.glow = function (doc, name, cx, cy, rx, ry, hex, feather, op, blend) {
    var l = SD.layer(doc, name, op, blend || BlendMode.SCREEN);
    SD.selEllipse(doc, cx, cy, rx, ry, feather);
    doc.selection.fill(SD.hex(hex)); doc.selection.deselect();
    return l;
  };
  // Dikdortgen yumusak geciste (alt karartma vb.) kullan
  SD.softRect = function (doc, name, x, y, w, h, hex, feather, op, blend) {
    var l = SD.layer(doc, name, op, blend || BlendMode.MULTIPLY);
    SD.selRect(doc, x, y, w, h, feather);
    doc.selection.fill(SD.hex(hex)); doc.selection.deselect();
    return l;
  };
  // Vinyet: kenarlar koyu, merkez temiz. inset = kenardan icerideki temiz alan payi
  SD.vignette = function (doc, hex, op, inset, feather) {
    var W = doc.width.as("px"), H = doc.height.as("px");
    inset = inset || Math.round(W * 0.14); feather = feather || Math.round(W * 0.28);
    var l = SD.layer(doc, "Vinyet", op || 40, BlendMode.MULTIPLY);
    doc.selection.selectAll(); doc.selection.fill(SD.hex(hex || "000000"));
    SD.selEllipse(doc, W / 2, H / 2, W / 2 - inset + W * 0.25, H / 2 - inset + H * 0.12, feather);
    doc.selection.clear(); doc.selection.deselect();
    return l;
  };
  // Film grain: %50 gri + gurultu, Overlay
  SD.grain = function (doc, amount, op) {
    var l = SD.layer(doc, "Grain", op || 20, BlendMode.OVERLAY);
    doc.selection.selectAll(); doc.selection.fill(SD.hex("808080")); doc.selection.deselect();
    l.applyAddNoise(amount || 6, NoiseDistribution.GAUSSIAN, true);
    return l;
  };

  // ---------- gorsel yerlestirme (gomulu akilli nesne; kalite kaybi yok) ----------
  // o: { w, h, fit:"cover"|"contain", x, y | cx, cy, op, blend }
  //  - w verilirse genislige, h verilirse yukseklige olcekler; ikisi + fit verilirse kutuya sigdirir/doldurur
  //  - konum verilmezse belgenin ortasina koyar
  SD.place = function (doc, path, name, o) {
    o = o || {};
    doc.selection.deselect();
    var f = new File(path);
    if (!f.exists) throw new Error("Dosya yok: " + path);
    var d = new ActionDescriptor();
    d.putPath(cID("null"), f);
    d.putEnumerated(cID("FTcs"), cID("QCSt"), cID("Qcsa"));
    executeAction(cID("Plc "), d, DialogModes.NO);
    var l = doc.activeLayer; l.name = name;
    var b = SD.bounds(l), s = 100;
    if (o.w && o.h) {
      var sx = o.w / b.w * 100, sy = o.h / b.h * 100;
      s = (o.fit == "contain") ? Math.min(sx, sy) : Math.max(sx, sy);
    } else if (o.w) s = o.w / b.w * 100;
    else if (o.h) s = o.h / b.h * 100;
    if (s != 100) l.resize(s, s, AnchorPosition.MIDDLECENTER);
    if (o.x != null || o.y != null) SD.moveTo(l, { x: o.x != null ? o.x : SD.bounds(l).x, y: o.y != null ? o.y : SD.bounds(l).y });
    else SD.moveTo(l, { cx: o.cx != null ? o.cx : doc.width.as("px") / 2, cy: o.cy != null ? o.cy : doc.height.as("px") / 2 });
    if (o.op != null) l.opacity = o.op;
    if (o.blend) l.blendMode = o.blend;
    return l;
  };

  // ---------- maske ----------
  // Aktif secimden katman maskesi (secim yoksa "tumunu goster" maskesi)
  SD.maskFromSelection = function (doc, layer) {
    doc.activeLayer = layer;
    var d = new ActionDescriptor();
    d.putClass(cID("Nw  "), cID("Chnl"));
    var r = new ActionReference(); r.putEnumerated(cID("Chnl"), cID("Chnl"), cID("Msk "));
    d.putReference(cID("At  "), r);
    var hasSel = true; try { doc.selection.bounds; } catch (e) { hasSel = false; }
    d.putEnumerated(cID("Usng"), cID("UsrM"), hasSel ? cID("RvlS") : cID("RvlA"));
    executeAction(cID("Mk  "), d, DialogModes.NO);
    doc.selection.deselect();
  };
  // Yumusak kenarli dikdortgen maske (gorselin alt kismini zemine eritmek vb.)
  SD.maskRect = function (doc, layer, x, y, w, h, feather) {
    SD.selRect(doc, x, y, w, h, feather);
    SD.maskFromSelection(doc, layer);
  };
  // Konuyu Sec (Select Subject) + maske. Duz/sade zeminde cok temiz; karmasik zeminde kontrol et.
  SD.cutout = function (doc, layer) {
    doc.activeLayer = layer;
    var d = new ActionDescriptor(); d.putBoolean(sID("sampleAllLayers"), false);
    executeAction(sID("autoCutout"), d, DialogModes.NO);
    SD.maskFromSelection(doc, layer);
  };

  // ---------- duzenlenebilir ayar katmanlari (piksele dokunmaz) ----------
  function makeAdj(doc, name, typeKey, typeDesc, clip) {
    doc.selection.deselect();
    var d = new ActionDescriptor(), r = new ActionReference();
    r.putClass(cID("AdjL")); d.putReference(cID("null"), r);
    var d2 = new ActionDescriptor();
    d2.putObject(cID("Type"), typeKey, typeDesc);
    d.putObject(cID("Usng"), cID("AdjL"), d2);
    executeAction(cID("Mk  "), d, DialogModes.NO);
    var l = doc.activeLayer; l.name = name;
    if (clip) l.grouped = true; // alttaki katmana kirpar (yalnizca o gorseli etkiler)
    return l;
  }
  function chanRef(key) {
    var r = new ActionReference();
    var map = { rgb: "Cmps", r: "Rd  ", g: "Grn ", b: "Bl  " };
    r.putEnumerated(cID("Chnl"), cID("Chnl"), cID(map[key]));
    return r;
  }
  // Egriler. pts = { rgb:[[0,0],[64,54],[192,205],[255,255]], r:[...], g:[...], b:[...] } (istedigin kanallari ver)
  SD.curves = function (doc, name, pts, clip) {
    var t = new ActionDescriptor();
    t.putEnumerated(sID("presetKind"), sID("presetKindType"), sID("presetKindDefault"));
    var l = makeAdj(doc, name, cID("Crvs"), t, clip);
    var s = new ActionDescriptor(), rr = new ActionReference();
    rr.putEnumerated(cID("AdjL"), cID("Ordn"), cID("Trgt")); s.putReference(cID("null"), rr);
    var a = new ActionDescriptor();
    a.putEnumerated(sID("presetKind"), sID("presetKindType"), sID("presetKindCustom"));
    var list = new ActionList();
    var keys = ["rgb", "r", "g", "b"];
    for (var k = 0; k < keys.length; k++) {
      var arr = pts[keys[k]]; if (!arr) continue;
      var cd = new ActionDescriptor(); cd.putReference(cID("Chnl"), chanRef(keys[k]));
      var pl = new ActionList();
      for (var i = 0; i < arr.length; i++) { var p = new ActionDescriptor(); p.putDouble(cID("Hrzn"), arr[i][0]); p.putDouble(cID("Vrtc"), arr[i][1]); pl.putObject(cID("Pnt "), p); }
      cd.putList(cID("Crv "), pl);
      list.putObject(cID("CrvA"), cd);
    }
    a.putList(cID("Adjs"), list);
    s.putObject(cID("T   "), cID("Crvs"), a);
    executeAction(cID("setd"), s, DialogModes.NO);
    return l;
  };
  // Renk Dengesi. sh/md/hl = [camgobegi-kirmizi, macenta-yesil, sari-mavi] (-100..100)
  SD.colorBalance = function (doc, name, sh, md, hl, clip) {
    var t = new ActionDescriptor();
    function lst(v) { var L = new ActionList(); for (var i = 0; i < 3; i++) L.putInteger(v ? v[i] : 0); return L; }
    t.putList(cID("ShdL"), lst(sh)); t.putList(cID("MdtL"), lst(md)); t.putList(cID("HghL"), lst(hl));
    t.putBoolean(cID("PrsL"), true);
    return makeAdj(doc, name, cID("ClrB"), t, clip);
  };
  // Canlilik / Doygunluk (-100..100). Asiri doygunluktan kacin: genelde vib 5..20, sat -10..5
  SD.vibrance = function (doc, name, vib, sat, clip) {
    var t = new ActionDescriptor();
    t.putInteger(sID("vibrance"), vib || 0);
    t.putInteger(cID("Strt"), sat || 0);
    return makeAdj(doc, name, sID("vibrance"), t, clip);
  };
  // Parlaklik / Kontrast (modern)
  SD.brightnessContrast = function (doc, name, br, ct, clip) {
    var t = new ActionDescriptor();
    t.putInteger(cID("Brgh"), br || 0); t.putInteger(cID("Cntr"), ct || 0);
    t.putBoolean(sID("useLegacy"), false);
    return makeAdj(doc, name, cID("BrgC"), t, clip);
  };
  // Duzeyler: inBlack, inWhite, gamma, outBlack, outWhite
  SD.levels = function (doc, name, ib, iw, gm, ob, ow, clip) {
    var t = new ActionDescriptor();
    t.putEnumerated(sID("presetKind"), sID("presetKindType"), sID("presetKindCustom"));
    var L = new ActionList(), a = new ActionDescriptor();
    a.putReference(cID("Chnl"), chanRef("rgb"));
    var inp = new ActionList(); inp.putInteger(ib || 0); inp.putInteger(iw == null ? 255 : iw); a.putList(cID("Inpt"), inp);
    a.putDouble(cID("Gmm "), gm || 1.0);
    var out = new ActionList(); out.putInteger(ob || 0); out.putInteger(ow == null ? 255 : ow); a.putList(cID("Otpt"), out);
    L.putObject(cID("LvlA"), a); t.putList(cID("Adjs"), L);
    return makeAdj(doc, name, cID("Lvls"), t, clip);
  };

  // ---------- katman efekti: alt golge (duzenlenebilir, Katman Stili) ----------
  // o = { hex:"000000", op:35, angle:90, dist:12, size:30, spread:0 }
  SD.dropShadow = function (doc, layer, o) {
    o = o || {};
    doc.activeLayer = layer;
    var d = new ActionDescriptor(), r = new ActionReference();
    r.putProperty(cID("Prpr"), cID("Lefx")); r.putEnumerated(cID("Lyr "), cID("Ordn"), cID("Trgt"));
    d.putReference(cID("null"), r);
    var fx = new ActionDescriptor(); fx.putUnitDouble(cID("Scl "), cID("#Prc"), 100);
    var ds = new ActionDescriptor();
    ds.putBoolean(cID("enab"), true);
    ds.putEnumerated(cID("Md  "), cID("BlnM"), cID("Mltp"));
    ds.putObject(cID("Clr "), cID("RGBC"), rgbDesc(o.hex || "000000"));
    ds.putUnitDouble(cID("Opct"), cID("#Prc"), o.op != null ? o.op : 35);
    ds.putBoolean(cID("uglg"), false);
    ds.putUnitDouble(cID("lagl"), cID("#Ang"), o.angle != null ? o.angle : 90);
    ds.putUnitDouble(cID("Dstn"), cID("#Pxl"), o.dist != null ? o.dist : 12);
    ds.putUnitDouble(cID("Ckmt"), cID("#Pxl"), o.spread || 0);
    ds.putUnitDouble(cID("blur"), cID("#Pxl"), o.size != null ? o.size : 30);
    fx.putObject(cID("DrSh"), cID("DrSh"), ds);
    d.putObject(cID("T   "), cID("Lefx"), fx);
    executeAction(cID("setd"), d, DialogModes.NO);
    return layer;
  };

  // ---------- metin ----------
  // o = { font:"PostScriptAdi", size, color:"FFFFFF", x, y, box:[w,h], just:"left"|"center"|"right",
  //       track (binde em), lead (px), op, name }
  //  - box yoksa nokta metni: y = ILK SATIRIN TABAN CIZGISI. just center ise x = merkez.
  //  - box varsa paragraf metni: x,y = kutunun sol-ust kosesi; satir kendiliginden kirilir (heceleme kapali).
  //  - Satir kirmak icin "\r" kullan. Metni kullanicinin verdigi gibi yaz (buyuk/kucuk harfe dokunma).
  SD.text = function (doc, str, o) {
    if (!SD.hasFont(o.font)) throw new Error("Font yok: " + o.font + " (probe_fonts.jsx ile PostScript adini dogrula)");
    doc.selection.deselect();
    var l = doc.artLayers.add(); l.kind = LayerKind.TEXT;
    var t = l.textItem;
    if (o.box) { t.kind = TextType.PARAGRAPHTEXT; }
    t.contents = str;
    t.font = o.font;
    t.size = o.size;
    t.color = SD.hex(o.color || "000000");
    var J = { left: Justification.LEFT, center: Justification.CENTER, right: Justification.RIGHT };
    t.justification = J[o.just || "left"];
    if (o.track != null) t.tracking = o.track;
    if (o.lead) { t.useAutoLeading = false; t.leading = o.lead; }
    if (o.box) { t.hyphenation = false; t.position = [o.x, o.y]; t.width = o.box[0]; t.height = o.box[1]; }
    else t.position = [o.x, o.y];
    l.name = o.name || String(str).replace(/\r/g, " ").substr(0, 40);
    if (o.op != null) l.opacity = o.op;
    return l;
  };
  // Nokta metnini maxW genisligine sigana kadar kucult
  SD.fitWidth = function (l, maxW, minSize) {
    var t = l.textItem, n = 0;
    while (SD.bounds(l).w > maxW && n < 60 && t.size.as("px") > (minSize || 10)) { t.size = t.size.as("px") - 2; n++; }
    return l;
  };
  SD._fontCache = null;
  SD.hasFont = function (ps) {
    if (!SD._fontCache) { SD._fontCache = {}; for (var i = 0; i < app.fonts.length; i++) SD._fontCache[app.fonts[i].postScriptName] = 1; }
    return !!SD._fontCache[ps];
  };

  // ---------- kaydet ----------
  // PSD (katmanli, profil gomulu; belge bu dosyaya baglanir) + PNG onizleme. jpg:true ise JPG de yazar.
  SD.save = function (doc, base, o) {
    o = o || {};
    var dir = o.dir || SD.DIR;
    new Folder(dir + "psd").create(); new Folder(dir + "png").create();
    var p = new PhotoshopSaveOptions(); p.layers = true; p.embedColorProfile = true; p.maximizeCompatibility = true;
    doc.saveAs(new File(dir + "psd/" + base + ".psd"), p, false, Extension.LOWERCASE);
    var png = new PNGSaveOptions(); png.compression = 6;
    doc.saveAs(new File(dir + "png/" + base + ".png"), png, true, Extension.LOWERCASE);
    if (o.jpg) {
      var j = new JPEGSaveOptions(); j.quality = 11; j.embedColorProfile = true;
      doc.saveAs(new File(dir + "png/" + base + ".jpg"), j, true, Extension.LOWERCASE);
    }
    SD.log("kaydedildi: " + base);
  };
})();
