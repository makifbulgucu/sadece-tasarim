"""sadece-tasarim :: brand-identity kitini Photoshop/Illustrator projesine aktarir.

brand-identity skill'i bir marka seti icin kit uretir (WORK/kit/<SET>/: logo SVG/PNG surumleri, tokens,
fonts.md, kilavuz PDF). Bu betik o kiti sadece-tasarim proje klasorune tasir:

  - logo dosyalarini   <proje>/assets/marka/        altina kopyalar (orijinallere dokunmaz)
  - marka verisini     <proje>/_script/marka_veri.jsx olarak yazar:  var MARKA = {...}
    (ASCII, \\uXXXX kacisli; ExtendScript'te #include ile okunur, run_jsx.ps1 donusumune gerek yok)
  - fontlarin bu bilgisayarda kurulu olup olmadigini soyler; --font-kur ile kullanici icin kurar

Kullanim:
  python marka_aktar.py <WORK/kit/A | WORK/sets/A> <proje klasoru> [--font-kur]

Yalnizca standart kutuphane. Windows'ta font kurulumu kullanici kapsamindadir (yonetici gerekmez):
%LOCALAPPDATA%\\Microsoft\\Windows\\Fonts + HKCU\\...\\Fonts kaydi. Kurulumdan sonra Photoshop/Illustrator
yeniden baslatilmalidir.
"""
import argparse
import json
import os
import shutil
import sys

LOGO_SURUMLERI = [  # (manifest anahtari, Turkce etiket)
    ("full-color", "Tam renk"),
    ("full-color-dark", "Tam renk (koyu zemin)"),
    ("one-color-dark", "Tek renk koyu"),
    ("one-color-light", "Tek renk acik"),
    ("on-dark-background", "Koyu zeminde"),
    ("on-light-background", "Acik zeminde"),
    ("on-light-primary", "Ana renk zeminde"),
    ("on-light-accent", "Vurgu rengi zeminde"),
    ("symbol-only", "Yalniz sembol"),
    ("app-icon-512", "Uygulama ikonu"),
]


def oku(yol):
    with open(yol, encoding="utf-8") as f:
        return json.load(f)


def kit_bul(arg):
    """kit ya da set klasorunden (work, set_id, kit_dir, set_dir) dondurur."""
    p = os.path.abspath(arg)
    set_id = os.path.basename(p.rstrip("\\/"))
    ust = os.path.basename(os.path.dirname(p))
    work = os.path.dirname(os.path.dirname(p))
    if ust not in ("kit", "sets"):
        sys.exit(f"hata: {arg} bir WORK/kit/<SET> ya da WORK/sets/<SET> klasoru degil")
    kit_dir = os.path.join(work, "kit", set_id)
    set_dir = os.path.join(work, "sets", set_id)
    if not os.path.isfile(os.path.join(kit_dir, "logo", "manifest.json")):
        sys.exit(f"hata: {kit_dir}\\logo\\manifest.json yok. Once: brand.py kit {set_dir}")
    return work, set_id, kit_dir, set_dir


def kurulu_fontlar():
    """Windows'ta kurulu font dosya adlari ve kayit adlari (kucuk harf)."""
    adlar = set()
    for d in (os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts"),
              os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "Windows", "Fonts")):
        if os.path.isdir(d):
            adlar.update(x.lower() for x in os.listdir(d))
    try:
        import winreg
        for kok in (winreg.HKEY_LOCAL_MACHINE, winreg.HKEY_CURRENT_USER):
            try:
                k = winreg.OpenKey(kok, r"Software\Microsoft\Windows NT\CurrentVersion\Fonts")
            except OSError:
                continue
            i = 0
            while True:
                try:
                    ad, deger, _ = winreg.EnumValue(k, i)
                except OSError:
                    break
                adlar.add(ad.lower()); adlar.add(os.path.basename(str(deger)).lower()); i += 1
    except ImportError:
        pass
    return adlar


def kurulu_mu(aile, adlar):
    a = aile.lower().replace(" ", "")
    return any(a in x.replace(" ", "") for x in adlar)


def onbellek_ttf(aile):
    """brand-identity'nin indirdigi Google Fonts dosyasi (degisken TTF), yoksa None."""
    kok = os.path.join(os.path.expanduser("~"), ".cache", "brand-identity", "fonts", "google")
    hedef = aile.lower().replace(" ", "")
    for lisans in ("ofl", "apache", "ufl"):
        d = os.path.join(kok, lisans, hedef)
        if os.path.isdir(d):
            ttf = sorted(x for x in os.listdir(d) if x.lower().endswith((".ttf", ".otf")))
            if ttf:
                return [os.path.join(d, x) for x in ttf]
    return None


def font_kur(dosyalar):
    import winreg
    hedef = os.path.join(os.environ["LOCALAPPDATA"], "Microsoft", "Windows", "Fonts")
    os.makedirs(hedef, exist_ok=True)
    k = winreg.CreateKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows NT\CurrentVersion\Fonts")
    for f in dosyalar:
        yeni = os.path.join(hedef, os.path.basename(f))
        shutil.copy2(f, yeni)
        ad = os.path.splitext(os.path.basename(f))[0] + " (TrueType)"
        winreg.SetValueEx(k, ad, 0, winreg.REG_SZ, yeni)
        print(f"  kuruldu: {yeni}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("kit", help="WORK/kit/<SET> ya da WORK/sets/<SET>")
    ap.add_argument("proje", help="sadece-tasarim proje klasoru")
    ap.add_argument("--font-kur", action="store_true", help="eksik Google fontlarini kullanici icin kur")
    a = ap.parse_args()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    work, set_id, kit_dir, set_dir = kit_bul(a.kit)
    man = oku(os.path.join(kit_dir, "logo", "manifest.json"))
    ident = oku(os.path.join(set_dir, "identity.json")) if os.path.isfile(os.path.join(set_dir, "identity.json")) else {}
    pal = oku(os.path.join(set_dir, "palette.json")) if os.path.isfile(os.path.join(set_dir, "palette.json")) else {}
    brief = oku(os.path.join(work, "brief.json")) if os.path.isfile(os.path.join(work, "brief.json")) else {}

    proje = os.path.abspath(a.proje)
    hedef = os.path.join(proje, "assets", "marka")
    os.makedirs(hedef, exist_ok=True)
    os.makedirs(os.path.join(proje, "_script"), exist_ok=True)

    # 1) logolar
    logolar = []
    surumler = man.get("versions") or {}
    for anahtar, etiket in LOGO_SURUMLERI:
        v = surumler.get(anahtar)
        svg = (v or {}).get("svg") or (anahtar + ".svg")
        kaynak = os.path.join(kit_dir, "logo", svg)
        if not os.path.isfile(kaynak):
            continue
        shutil.copy2(kaynak, os.path.join(hedef, svg))
        png = (v or {}).get("png")
        if png and os.path.isfile(os.path.join(kit_dir, "logo", png)):
            shutil.copy2(os.path.join(kit_dir, "logo", png), os.path.join(hedef, png))
        zemin = None  # SVG'de zemin dikdortgeni olsa da artboard'a ayni rengi ver
        if v and str(v.get("ground") or "").startswith("#"):
            zemin = v["ground"].upper()
        elif v and v.get("mode") == "dark":
            zemin = str(((pal.get("modes") or {}).get("dark") or {}).get("background") or "#111111").upper()
        logolar.append({"ad": anahtar, "etiket": etiket, "svg": (hedef + "/" + svg).replace("\\", "/"),
                        "png": (hedef + "/" + png).replace("\\", "/") if png else None,
                        "mod": (v or {}).get("mode"), "zemin": zemin,
                        "tekRenk": bool((v or {}).get("one_color"))})
    for x in os.listdir(os.path.join(kit_dir, "logo")):
        if x.startswith(("master-", "favicon-", "small-")):
            shutil.copy2(os.path.join(kit_dir, "logo", x), os.path.join(hedef, x))
    pdfler = [x for x in os.listdir(kit_dir) if x.lower().endswith(".pdf")]
    for x in pdfler:
        shutil.copy2(os.path.join(kit_dir, x), os.path.join(hedef, x))
    tok = os.path.join(kit_dir, "tokens")
    if os.path.isdir(tok):
        shutil.copytree(tok, os.path.join(hedef, "tokens"), dirs_exist_ok=True)

    # 2) renkler: marka renkleri + rol tonlari (UI rolleri, acik mod)
    renkler = [{"id": b.get("id"), "ad": b.get("name"), "hex": (b.get("hex") or "").upper(),
                "kullanim": b.get("usage") or "", "rol": b.get("role") or "core"} for b in pal.get("brand") or []]
    roller = {}
    modes = pal.get("modes") or {}
    light = modes.get("light") or pal.get("roles") or {}
    for k, v in (light.items() if isinstance(light, dict) else []):
        h = v if isinstance(v, str) else (v or {}).get("hex") if isinstance(v, dict) else None
        if isinstance(h, str) and h.startswith("#"):
            roller[k] = h.upper()
    if not roller:  # manifest'teki parcalardan en azindan logo rollerini al
        for v in surumler.values():
            for p in v.get("parts") or []:
                if p.get("role") and p.get("hex"):
                    roller.setdefault(p["role"], p["hex"].upper())

    # 3) fontlar
    adlar = kurulu_fontlar()
    fontlar = {}
    kurulacak = []
    for rol in ("display", "text", "mono"):
        f = (ident.get("type") or {}).get(rol)
        if not f:
            continue
        aile = f.get("family")
        kur = kurulu_mu(aile, adlar)
        ttf = onbellek_ttf(aile)
        fontlar[rol] = {"aile": aile, "kaynak": f.get("source"), "lisans": f.get("license"),
                        "agirliklar": f.get("weights"), "harf": f.get("case"), "tracking": f.get("tracking"),
                        "kurulu": kur}
        if not kur and ttf:
            kurulacak += ttf

    ad = ident.get("brand", {}).get("name") or brief.get("brand") or set_id
    marka = {
        "ad": ad,
        "set": set_id,
        "slogan": (ident.get("brand") or {}).get("tagline") or brief.get("tagline"),
        "setAdi": (ident.get("set") or {}).get("name"),
        "mekanizma": (ident.get("set") or {}).get("mechanism"),
        "yuksekSes": (ident.get("set") or {}).get("expression_move"),
        "logoFikri": (ident.get("logo") or {}).get("concept"),
        "paletAdi": pal.get("name"),
        "renkler": renkler,
        "roller": roller,
        "fontlar": fontlar,
        "logolar": logolar,
        "kitPdf": [(hedef + "/" + x).replace("\\", "/") for x in pdfler],
    }
    js = ("// brand-identity kitinden uretildi: marka_aktar.py. Elle duzenleme; yeniden uret.\n"
          "var MARKA = " + json.dumps(marka, ensure_ascii=True, indent=1) + ";\n")
    out = os.path.join(proje, "_script", "marka_veri.jsx")
    with open(out, "w", encoding="ascii", newline="\n") as fh:
        fh.write(js)

    print(f"marka: {ad} (set {set_id})")
    print(f"logolar: {len(logolar)} surum -> {hedef}")
    print("renkler: " + ", ".join(f"{r['ad']} {r['hex']}" for r in renkler))
    for rol, f in fontlar.items():
        durum = "kurulu" if f["kurulu"] else "KURULU DEGIL"
        print(f"font {rol}: {f['aile']} ({f['lisans']}) - {durum}")
    print(f"veri: {out}")
    eksik = [f["aile"] for f in fontlar.values() if not f["kurulu"]]
    if eksik:
        if a.font_kur and kurulacak:
            font_kur(sorted(set(kurulacak)))
            print("Photoshop/Illustrator'i yeniden baslat; sonra probe_fonts.jsx ile PostScript adini al.")
        elif kurulacak:
            print("eksik fontlar onbellekte var; kullanici onayiyla --font-kur ile kurulabilir:")
            for f in sorted(set(kurulacak)):
                print("  " + f)
        else:
            print("eksik fontlar onbellekte yok: fonts.md'deki kaynaktan indirilip kurulmali (ya da Adobe Fonts'tan etkinlestir).")


if __name__ == "__main__":
    main()
