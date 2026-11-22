#target photoshop
#include "lib.jsx"

(function () {
  // Claude: set JOBS for batch mode. Leave it empty for the Photoshop dialogs.
  // Paths may be absolute, or relative to the folder that contains this script.
  // Each photo can be a path string or {path: "file.jpg", x: 0.5, y: 0.4}.
  // x and y move the crop through the available area (0 to 1).
  var JOBS = [
    // { layout: "filmstrip", format: "post", title: "Ma\u00e7\u0131n hik\u00e2yesi",
    //   meta: "15. hafta", photos: ["genis.jpg", "top.jpg", "forma.jpg"],
    //   paper: "F4F1E8", ink: "15181B", accent: "8A312C", grade: "cool", grain: 14 }
  ];

  var formats = { post: [1080, 1350, 48, 50], story: [1080, 1920, 250, 340] };
  var layouts = {
    hero: ["Ana foto\u011fraf"], grid: ["Geni\u015f plan", "Portre", "Aksiyon", "Tepki", "Detay", "Kapan\u0131\u015f"],
    filmstrip: ["Geni\u015f plan", "Aksiyon detay\u0131", "Forma veya portre"],
    polaroid: ["Arka plan detay\u0131", "Kart portresi"],
    diptych: ["\u0130lk veya eski kare", "\u0130kinci veya yeni kare"],
    collage: ["Ana portre", "\u0130kinci sahne", "Yak\u0131n detay", "Ba\u011flam"],
    poster: ["Ana portre veya aksiyon"]
  };
  var scriptDir = new File($.fileName).parent;
  var marks = ["AdobeClean-Bold", "Arial-BoldMT", "ArialMT"];
  var regular = ["AdobeClean-Regular", "ArialMT"];

  function own(object, key) { return Object.prototype.hasOwnProperty.call(object, key); }

  function ask() {
    var layout = prompt("D\u00fczen: hero / grid / filmstrip / polaroid / diptych / collage / poster", "filmstrip");
    if (layout === null) return [];
    layout = layout.toLowerCase();
    if (!own(layouts, layout)) throw new Error("Bilinmeyen d\u00fczen: " + layout);
    var format = prompt("Boyut: post / story", "post");
    if (format === null) return [];
    format = format.toLowerCase();
    if (!own(formats, format)) throw new Error("Bilinmeyen boyut: " + format);
    var title = prompt("Ba\u015fl\u0131k (iste\u011fe ba\u011fl\u0131)", "");
    if (title === null) return [];
    var meta = prompt("Tarih, ma\u00e7 haftas\u0131 veya k\u00fcnye (iste\u011fe ba\u011fl\u0131)", "");
    if (meta === null) return [];
    var photos = [];
    for (var index = 0; index < layouts[layout].length; index++) {
      var file = File.openDialog((index + 1) + ". Foto\u011fraf: " + layouts[layout][index]);
      if (!file) return [];
      photos.push(file.fsName);
    }
    return [{layout: layout, format: format, title: title, meta: meta, photos: photos}];
  }

  function chooseFont(requested, candidates) {
    if (requested) {
      if (!SD.hasFont(requested)) throw new Error("Font bulunamad\u0131: " + requested);
      return requested;
    }
    for (var index = 0; index < candidates.length; index++) {
      if (SD.hasFont(candidates[index])) return candidates[index];
    }
    if (!app.fonts.length) throw new Error("Photoshop'ta kullan\u0131labilir font bulunamad\u0131.");
    return app.fonts[0].postScriptName;
  }

  function hex(value, fallback) {
    var color = String(value || fallback).replace(/^#/, "");
    if (!/^[0-9a-f]{6}$/i.test(color)) throw new Error("Ge\u00e7ersiz renk: " + color);
    return color;
  }

  function photoSpec(entry) {
    var p = typeof entry === "string" ? {path: entry} : entry;
    if (!p || typeof p.path !== "string" || !p.path) throw new Error("Foto\u011fraf yolu gerekli.");
    var absolute = /^(?:[A-Za-z]:[\\/]|[\\/])/.test(p.path);
    var file = new File(absolute ? p.path : scriptDir.fsName + "/" + p.path);
    if (!file.exists) throw new Error("Foto\u011fraf bulunamad\u0131: " + file.fsName);
    var x = p.x === undefined ? 0.5 : p.x;
    var y = p.y === undefined ? 0.5 : p.y;
    if (typeof x !== "number" || !isFinite(x) || x < 0 || x > 1 ||
        typeof y !== "number" || !isFinite(y) || y < 0 || y > 1) {
      throw new Error("Foto\u011fraf odak de\u011ferleri 0 ile 1 aras\u0131nda olmal\u0131.");
    }
    return {path: file.fsName, x: x, y: y};
  }

  function jobSpec(job) {
    if (!job || !own(layouts, job.layout)) throw new Error("Ge\u00e7erli layout gerekli.");
    var format = job.format || "post";
    if (!own(formats, format)) throw new Error("Bilinmeyen boyut: " + format);
    var slots = layouts[job.layout];
    if (!job.photos || job.photos.length !== slots.length) {
      throw new Error(job.layout + " i\u00e7in " + slots.length + " foto\u011fraf gerekli.");
    }
    if (job.grade && !/^(cool|warm|mono|none)$/.test(job.grade)) throw new Error("Ge\u00e7ersiz grade.");
    var grain = job.grain === undefined ? 0 : job.grain;
    if (typeof grain !== "number" || !isFinite(grain) || grain < 0 || grain > 100) {
      throw new Error("grain 0 ile 100 aras\u0131nda olmal\u0131.");
    }
    var photos = [];
    for (var index = 0; index < slots.length; index++) photos.push(photoSpec(job.photos[index]));
    return {
      layout: job.layout, format: format, photos: photos, title: job.title || "", meta: job.meta || "",
      fontTitle: chooseFont(job.fontTitle, marks), fontMeta: chooseFont(job.fontMeta, regular),
      paper: hex(job.paper, "F4F1E8"), ink: hex(job.ink, "15181B"), accent: hex(job.accent, "8A312C"),
      grade: job.grade || "none", grain: grain
    };
  }

  function gradePhoto(doc, look) {
    if (look === "none") return;
    if (look === "mono") {
      SD.vibrance(doc, "Siyah beyaz", 0, -100, true);
    } else {
      var cool = look === "cool";
      SD.colorBalance(doc, "Renk dengesi", cool ? [-5, 0, 8] : [5, 0, -7], [0, 0, 0], [3, 0, -4], true);
    }
  }

  function addPhoto(doc, job, index, box) {
    var image = job.photos[index];
    var layer = SD.place(doc, image.path, layouts[job.layout][index], {
      w: box[2], h: box[3], fit: "cover", cx: box[0] + box[2] / 2, cy: box[1] + box[3] / 2
    });
    var bounds = SD.bounds(layer);
    SD.moveTo(layer, {
      x: box[0] - Math.max(0, bounds.w - box[2]) * image.x,
      y: box[1] - Math.max(0, bounds.h - box[3]) * image.y
    });
    SD.maskRect(doc, layer, box[0], box[1], box[2], box[3], 0);
    doc.activeLayer = layer;
    gradePhoto(doc, job.grade);
  }

  function designBoxes(layout, width, height) {
    var gutter = 16;
    var half = Math.floor((width - gutter) / 2);
    var third = Math.floor((height - 2 * gutter) / 3);
    var split = Math.floor(height * 0.45);
    if (layout === "grid") return [
      [0, 0, half, third], [half + gutter, 0, width - half - gutter, third],
      [0, third + gutter, half, third], [half + gutter, third + gutter, width - half - gutter, third],
      [0, 2 * (third + gutter), half, height - 2 * (third + gutter)],
      [half + gutter, 2 * (third + gutter), width - half - gutter, height - 2 * (third + gutter)]
    ];
    if (layout === "filmstrip") return [
      [0, 0, width, third], [0, third + gutter, width, third],
      [0, 2 * (third + gutter), width, height - 2 * (third + gutter)]
    ];
    if (layout === "diptych") return [
      [0, 0, width, split], [0, split + gutter, width, height - split - gutter]
    ];
    if (layout === "collage") {
      var core = Math.round(width * 0.64);
      return [
        [0, 0, core, height], [core + gutter, 0, width - core - gutter, third],
        [core + gutter, third + gutter, width - core - gutter, third],
        [core + gutter, 2 * (third + gutter), width - core - gutter, height - 2 * (third + gutter)]
      ];
    }
    return [[0, 0, width, height]];
  }

  function addText(doc, content, options, width) {
    if (!content) return;
    var layer = SD.text(doc, content, options);
    SD.fitWidth(layer, width, 18);
    if (SD.bounds(layer).w > width) throw new Error("Metin ayr\u0131lan alana s\u0131\u011fm\u0131yor: " + options.name);
  }

  function build(job, outputName) {
    var dims = formats[job.format];
    var doc = SD.newDoc(outputName, dims[0], dims[1], job.paper);
    SD.guides(doc, dims[2], dims[3], 64);
    var margin = 64;
    var width = dims[0] - margin * 2;
    var top = dims[2] + (job.title ? 116 : 0);
    var bottom = dims[1] - dims[3] - (job.meta ? 66 : 0);
    var height = bottom - top;

    if (job.layout === "polaroid") {
      addPhoto(doc, job, 0, [margin, top, width, height]);
      var cardWidth = Math.round(width * 0.56);
      var cardHeight = Math.round(height * 0.65);
      var left = Math.round((dims[0] - cardWidth) / 2);
      var cardTop = top + Math.round((height - cardHeight) / 2);
      SD.rect(doc, "Polaroid paspartu", left, cardTop, cardWidth, cardHeight, job.paper);
      addPhoto(doc, job, 1, [left + 22, cardTop + 22, cardWidth - 44, cardHeight - 90]);
    } else {
      var slots = designBoxes(job.layout, width, height);
      for (var index = 0; index < slots.length; index++) {
        var box = slots[index];
        addPhoto(doc, job, index, [margin + box[0], top + box[1], box[2], box[3]]);
      }
    }

    if (job.grain > 0) {
      var grainLayer = SD.grain(doc, 6, job.grain);
      SD.maskRect(doc, grainLayer, margin, top, width, height, 0);
    }
    if (job.title && job.layout === "poster") {
      SD.rect(doc, "Man\u015fet plakas\u0131", margin, dims[2], width, 100, job.accent);
    }
    addText(doc, job.title, {
      font: job.fontTitle, size: job.layout === "poster" ? 80 : 70,
      color: job.layout === "poster" ? job.paper : job.ink,
      x: margin + (job.layout === "poster" ? 20 : 0), y: dims[2] + 74,
      name: "Man\u015fet"
    }, width - (job.layout === "poster" ? 40 : 0));
    addText(doc, job.meta, {
      font: job.fontMeta, size: 28, color: job.ink,
      x: margin, y: bottom + 52, name: "K\u00fcnye"
    }, width);
    SD.dropEmpty(doc);
    SD.save(doc, outputName);
  }

  function createOutput() {
    var out = Folder.selectDialog("PSD ve PNG i\u00e7in \u00fcst \u00e7\u0131kt\u0131 klas\u00f6r\u00fcn\u00fc se\u00e7");
    if (!out) return null;
    var stem = "SporEditoryal_" + new Date().getTime();
    var suffix = 0;
    var folder = new Folder(out.fsName + "/" + stem);
    while (folder.exists) {
      suffix++;
      folder = new Folder(out.fsName + "/" + stem + "_" + suffix);
    }
    if (!folder.create()) throw new Error("\u00c7\u0131kt\u0131 klas\u00f6r\u00fc olu\u015fturulamad\u0131: " + folder.fsName);
    return folder;
  }

  try {
    var jobs = JOBS.length ? JOBS : ask();
    if (!jobs.length) return;
    var ready = [];
    for (var index = 0; index < jobs.length; index++) ready.push(jobSpec(jobs[index]));
    var out = createOutput();
    if (!out) return;
    var result;
    try {
      SD.init(out.fsName + "/", "build_log.txt");
      result = SD.run(function () {
        for (var page = 0; page < ready.length; page++) {
          var job = ready[page];
          build(job, out.name + "_" + (page + 1) + "_" + job.layout + "_" + job.format);
        }
      });
    } finally {
      SD.restorePrefs();
    }
    if (result.indexOf("ERR:") === 0) {
      throw new Error(result + "\nK\u0131smi \u00e7\u0131kt\u0131 klas\u00f6r\u00fc: " + out.fsName);
    }
    alert(ready.length + " tasar\u0131m tamamland\u0131.\n" + out.fsName);
  } catch (error) {
    alert("Spor editoryali: " + error.message);
  }
})();
