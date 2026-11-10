"""sadece-tasarim :: WCAG 2.2 kontrast olcumu (brand-identity'nin kontrast kapisinin tasarim tarafi).

1) Renk ciftleri:   python kontrast.py "#FFFFFF/#FF4F00" "#111111/#F2B46B"
   -> her cift (yazi/zemin) icin oran, normal metin (4.5:1) ve buyuk metin (3:1) gecti/kaldi.
2) Gorsel ustunde yazi (Pillow gerekir):
   python kontrast.py --png png/story.png --kutu 64,300,952,260 --yazi "#FFFFFF" [--buyuk]
   -> kutudaki her pikselin yaziya karsi kontrasti; medyan ve en kotu %10 dilim. Yazi katmanini kapatip
      aktardigin PNG'yi ver (yazi pikselleri olcumu bozmasin) ya da kutuyu harflerin arkasindaki zemine koy.

Buyuk metin: >= 24 px normal ya da >= 18.66 px kalin (WCAG; 1080 px tasarimda telefonda kucultulur, bu yuzden
story/post'ta 3:1 sinirina guvenme, govde ve alt basliklar 4.5:1 olsun). Ince/hairline fontlar renginden soluk
gorunur: agirlik <= 300 ise buyuk boyutta da 4.5:1 iste (brand-identity cohesion.md sezgisi, kalibre degil).
Cikis kodu: kalan varsa 1.
"""
import argparse
import sys


def kanal(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def parlaklik(rgb):
    r, g, b = (kanal(x) for x in rgb[:3])
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def hex_rgb(h):
    h = h.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    if len(h) != 6:
        raise ValueError(f"gecersiz renk: #{h}")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def oran(l1, l2):
    a, b = max(l1, l2), min(l1, l2)
    return (a + 0.05) / (b + 0.05)


def esik(buyuk):
    return 3.0 if buyuk else 4.5


def ciftler(liste, buyuk):
    kalan = 0
    for c in liste:
        if "/" not in c:
            sys.exit(f"hata: '{c}' yazi/zemin bicminde degil (#FFFFFF/#000000)")
        y, z = c.split("/", 1)
        r = oran(parlaklik(hex_rgb(y)), parlaklik(hex_rgb(z)))
        n = "GECTI" if r >= 4.5 else "KALDI"
        b = "GECTI" if r >= 3.0 else "KALDI"
        if r < esik(buyuk):
            kalan += 1
        print(f"{y.upper()} / {z.upper()}: {r:.2f}:1  normal metin {n} · buyuk metin {b}")
    return kalan


def gorsel(png, kutu, yazi, buyuk):
    try:
        from PIL import Image
    except ImportError:
        sys.exit("Pillow yok: python -m pip install pillow (ya da renk ciftiyle olc: zeminden renk damlalikla al)")
    x, y, w, h = (int(v) for v in kutu.split(","))
    im = Image.open(png).convert("RGB").crop((x, y, x + w, y + h))
    im.thumbnail((400, 400))
    ly = parlaklik(hex_rgb(yazi))
    pikseller = getattr(im, "get_flattened_data", im.getdata)()
    oranlar = sorted(oran(ly, parlaklik(p)) for p in pikseller)
    med = oranlar[len(oranlar) // 2]
    kotu = oranlar[len(oranlar) // 10]
    e = esik(buyuk)
    sonuc = "GECTI" if kotu >= e else ("SINIRDA" if med >= e else "KALDI")
    print(f"{png} kutu {kutu} · yazi {yazi.upper()}: medyan {med:.2f}:1, en kotu %10 {kotu:.2f}:1, en dusuk {oranlar[0]:.2f}:1")
    print(f"esik {e}:1 ({'buyuk' if buyuk else 'normal'} metin) -> {sonuc}")
    if sonuc != "GECTI":
        print("oneri: yazinin arkasina yumusak karartma/aydinlatma (SD.softRect / SD.glow), plaka ya da golge; "
              "ya da yaziyi zeminin sakin bolgesine tasi. Sonra yeniden olc.")
    return 0 if sonuc == "GECTI" else 1


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("ciftler", nargs="*", help='"#yazi/#zemin" ciftleri')
    ap.add_argument("--png")
    ap.add_argument("--kutu", help="x,y,w,h (piksel)")
    ap.add_argument("--yazi", help="yazi rengi #hex")
    ap.add_argument("--buyuk", action="store_true", help="buyuk metin esigi (3:1)")
    a = ap.parse_args()
    kalan = 0
    if a.ciftler:
        kalan += ciftler(a.ciftler, a.buyuk)
    if a.png:
        if not (a.kutu and a.yazi):
            sys.exit("hata: --png ile --kutu ve --yazi gerekli")
        kalan += gorsel(a.png, a.kutu, a.yazi, a.buyuk)
    if not a.ciftler and not a.png:
        ap.print_help()
        return 2
    return 1 if kalan else 0


if __name__ == "__main__":
    sys.exit(main())
