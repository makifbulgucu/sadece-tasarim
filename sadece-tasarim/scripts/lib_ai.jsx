// sadece-tasarim :: Illustrator yardimci kutuphanesi (ExtendScript / ES3)
// Kullanim: proje betiginin basinda  #include "lib_ai.jsx"
// Calistir: run_jsx.ps1 -App illustrator -Script "<proje>\_script\logo.jsx"
// Koordinatlar piksel/pt, orijin her artboard'un SOL-UST kosesi, y ASAGI dogru artar (Photoshop ile ayni zihniyet).

var AI = AI || {};
(function () {
  AI._lines = []; AI._log = null;

  AI.init = function (dir, logName) {
    AI.DIR = dir; new Folder(dir).create();
    app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
    app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;
    AI._log = new File(dir + (logName || "build_log.txt")); AI._log.encoding = "UTF-8"; AI._log.open("w"); AI._log.close();
  };
  AI.log = function (s) { AI._lines.push(s); if (!AI._log) return; AI._log.open("a"); AI._log.writeln(s); AI._log.close(); };
  AI.run = function (fn) {
    var res;
    try { fn(); res = "OK\n" + AI._lines.join("\n"); }
    catch (e) { res = "ERR: " + e + " | satir " + e.line; AI.log(res); }
    app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
    return res;
  };

  AI.rgb = function (h) {
    h = String(h).replace("#", "");
    var c = new RGBColor(); c.red = parseInt(h.substr(0, 2), 16); c.green = parseInt(h.substr(2, 2), 16); c.blue = parseInt(h.substr(4, 2), 16);
    return c;
  };

  // Kullanicinin belgelerine dokunmaz; yalnizca ayni adli, kaydedilmis belgeyi kapatir
  AI.closeOwn = function (name) {
    for (var i = app.documents.length - 1; i >= 0; i--) {
      var d = app.documents[i];
      if (d.name == name || d.name == name + ".ai") {
        if (!d.saved) throw new Error("'" + d.name + "' kaydedilmemis degisiklik iceriyor; kullaniciya sor");
        d.close(SaveOptions.DONOTSAVECHANGES);
      }
    }
  };
  // n artboard, her biri w x h, aralarinda gap, cols sutun. RGB belge.
  AI.newDoc = function (name, w, h, n, cols, gap) {
    AI.closeOwn(name);
    var p = new DocumentPreset();
    p.title = name; p.width = w; p.height = h; p.colorMode = DocumentColorSpace.RGB; p.units = RulerUnits.Pixels;
    p.numArtboards = n || 1; p.artboardSpacing = gap || 100; p.artboardRowsOrCols = cols || Math.min(n || 1, 3);
    p.artboardLayout = DocumentArtboardLayout.GridByRow;
    var doc = app.documents.addDocument("Web", p);
    return doc;
  };
  // artboard kutusu: {x,y,w,h} belge koordinatinda (y yukari pozitif)
  AI.ab = function (doc, i) {
    var r = doc.artboards[i || 0].artboardRect; // [left, top, right, bottom]
    return { left: r[0], top: r[1], w: r[2] - r[0], h: r[1] - r[3] };
  };
  // Artboard'a gore sol-ust (x,y asagi) -> belge koordinati
  AI.pt = function (doc, i, x, y) { var a = AI.ab(doc, i); return [a.left + x, a.top - y]; };

  AI.layer = function (doc, name) { var l = doc.layers.add(); l.name = name; return l; };

  // Dikdortgen (r>0 ise yuvarlak koseli). hex null ise dolgusuz; stroke = {hex, w}
  AI.rect = function (doc, i, x, y, w, h, hex, r, stroke, layer) {
    var p = AI.pt(doc, i, x, y), c = layer || doc.activeLayer;
    var it = r ? c.pathItems.roundedRectangle(p[1], p[0], w, h, r, r) : c.pathItems.rectangle(p[1], p[0], w, h);
    if (hex) { it.filled = true; it.fillColor = AI.rgb(hex); } else it.filled = false;
    if (stroke) { it.stroked = true; it.strokeColor = AI.rgb(stroke.hex); it.strokeWidth = stroke.w || 1; } else it.stroked = false;
    return it;
  };
  AI.ellipse = function (doc, i, cx, cy, rx, ry, hex, layer) {
    var p = AI.pt(doc, i, cx - rx, cy - ry), c = layer || doc.activeLayer;
    var it = c.pathItems.ellipse(p[1], p[0], rx * 2, ry * 2);
    it.filled = true; it.fillColor = AI.rgb(hex); it.stroked = false; return it;
  };
  // Nokta metni. o = {font, size, color, x, y (taban cizgisi), just:"left|center|right", track (binde em), name}
  AI.text = function (doc, i, str, o, layer) {
    var c = layer || doc.activeLayer;
    var f; try { f = app.textFonts.getByName(o.font); } catch (e) { throw new Error("Font yok: " + o.font); }
    var p = AI.pt(doc, i, o.x, o.y);
    var t = c.textFrames.pointText(p);
    t.contents = str;
    var a = t.textRange.characterAttributes;
    a.textFont = f; a.size = o.size; a.fillColor = AI.rgb(o.color || "000000");
    if (o.track != null) a.tracking = o.track;
    var J = { left: Justification.LEFT, center: Justification.CENTER, right: Justification.RIGHT };
    t.textRange.paragraphAttributes.justification = J[o.just || "left"];
    if (o.name) t.name = o.name;
    return t;
  };
  // Gorsel yerlestir + gom. w genislige olcekler; cx,cy merkez (artboard'a gore)
  AI.place = function (doc, i, path, o, layer) {
    var c = layer || doc.activeLayer, f = new File(path);
    if (!f.exists) throw new Error("Dosya yok: " + path);
    var it = c.placedItems.add(); it.file = f;
    if (o && o.w) { var s = o.w / it.width; it.width = o.w; it.height = it.height * s; }
    if (o && o.cx != null) { var p = AI.pt(doc, i, o.cx - it.width / 2, o.cy - it.height / 2); it.position = p; }
    it.embed();
    return c.pageItems[0];
  };
  // Raster logoyu vektore cevir (Image Trace). Hazir ayar adlari arayuz diline gore degistigi icin
  // dogrudan secenek ver: o = { mode:"color"|"bw", colors:6, ignoreWhite:true, threshold:128 }
  AI.trace = function (raster, o) {
    o = o || {};
    var pi = raster.trace();
    var t = pi.tracing.tracingOptions;
    if (o.mode == "bw") { t.tracingMode = TracingModeType.TRACINGMODEBLACKANDWHITE; t.threshold = o.threshold || 128; }
    else { t.tracingMode = TracingModeType.TRACINGMODECOLOR; t.tracingColorTypeValue = TracingColorType.TRACINGLIMITEDCOLOR; t.colorFidelity = 80; t.maxColors = o.colors || 6; }
    t.ignoreWhite = (o.ignoreWhite !== false);
    t.fills = true; t.strokes = false; t.pathFidelity = 90; t.cornerFidelity = 75; t.noiseFidelity = 4;
    app.redraw();
    return pi.tracing.expandTracing();
  };
  // Disa aktarma kopyasi icin tum metinleri outline'a cevir (asil .ai'de metin duzenlenebilir kalsin!)
  AI.outlineAll = function (doc) { for (var i = doc.textFrames.length - 1; i >= 0; i--) doc.textFrames[i].createOutline(); };

  AI.saveAI = function (doc, path) {
    var o = new IllustratorSaveOptions(); o.pdfCompatible = true; o.embedLinkedFiles = true;
    doc.saveAs(new File(path), o);
  };
  // Artboard bazli PNG (scale 100 = 1x)
  AI.exportPNG = function (doc, i, path, scale) {
    doc.artboards.setActiveArtboardIndex(i || 0);
    var o = new ExportOptionsPNG24(); o.artBoardClipping = true; o.transparency = true; o.antiAliasing = true;
    o.horizontalScale = o.verticalScale = scale || 100;
    doc.exportFile(new File(path), ExportType.PNG24, o);
  };
  AI.exportSVG = function (doc, path) {
    var o = new ExportOptionsSVG(); o.embedRasterImages = true; o.fontType = SVGFontType.OUTLINEFONT; o.artboardRange = ""; o.saveMultipleArtboards = false;
    doc.exportFile(new File(path), ExportType.SVG, o);
  };
  AI.savePDF = function (doc, path) {
    var o = new PDFSaveOptions(); o.compatibility = PDFCompatibility.ACROBAT7; o.preserveEditability = false;
    doc.saveAs(new File(path), o);
  };
})();
