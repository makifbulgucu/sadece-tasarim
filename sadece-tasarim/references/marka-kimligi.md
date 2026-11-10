# Marka kimliği (brand-identity ile)

Logo, font ve renk paletini **birlikte** kuran, ölçen ve kılavuza çeviren iş akışı. Ölçüm ve aday üretimi
`brand-identity` skill'inden gelir (Fatih Aydost, MIT, https://github.com/fatihaydost/brand-identity-skill);
sadece-tasarim seçilen kimliği Illustrator/Photoshop'ta düzenlenebilir dosyalara ve sosyal medya işlerine taşır.

Kurulum denetimi (bir kez):
```
python "%USERPROFILE%\.claude\skills\brand-identity\scripts\brand.py" check
```
Aşağıda `BI` = `python "%USERPROFILE%\.claude\skills\brand-identity\scripts\brand.py"`, `<skill>` = sadece-tasarim klasörü.
brand-identity kurulu değilse: `git clone https://github.com/fatihaydost/brand-identity-skill` ve
`skills/brand-identity` klasörünü `~/.claude/skills/` altına kopyala.

## 1. Hangi iş hangi yoldan

| İstek | Yol |
|---|---|
| "Logo, font ve renk", "marka kimliği", "kurumsal kimlik", "branding" | **A**: brand-identity setleri → seçim → kit → sadece-tasarim aktarımı |
| Yalnız logo / yalnız palet / yalnız font | A, diğer parçalar `--state type=none` ya da `keep` |
| "Logomuzu yenile", "renkleri tazele" | A, o parça `refresh` (`--source logo=eski.svg`) |
| "Markamızı / logomuzu eleştir" | **B**: eleştiri (aşağıda §6) |
| Hazır kimlikle story/post/afiş | **C**: kit varsa `marka_aktar.py` + build.jsx; yoksa SKILL.md bölüm 5 |
| Kullanıcı logoyu Illustrator'da elle çizdirmek istiyor | SKILL.md bölüm 7, ama §3 ilkeleri ve §5 ölçümleri yine geçerli |

## 2. Yol A: yeni ya da yenilenen kimlik

1. **brand-identity skill'ini çalıştır** (Skill aracı, `brand-identity`) ve onun SKILL.md'sine uy. Türkiye işi için:
   `init "<Ad>" --langs tr,en --doc-lang tr ...` → kartlar, pano ve kılavuz Türkçe olur, fontlar Türkçe glif
   kapısından geçer (ş, ğ, ı, İ). Gerçek marka cümlesi ver: `--sentence tr='...'`.
2. Rakipleri gerçek adlarıyla al (`--competitors`); site varsa `BI site competitors WORK url...`. Sektörün
   Behance vitrini yerine (bkz. §4) rakip rafı ayrışmanın ölçütüdür.
3. Setler panoda (`board.png`) gösterilir; **seçimi kullanıcı yapar, Claude asla seçmez**. Önerilen sete
   `recommended` konur ve gerekçesi söylenir. Karışım istenirse `BI mix WORK A:logo B:palette --as D`.
4. Seçimden sonra: bu logoya özgü 1-2 yanlış kullanım çiz, `BI kit WORK/sets/<X>` (uzun kılavuz `--full`).
   Çıktı: `WORK/kit/<X>/` → 8 sayfalık PDF, `logo/` (SVG+PNG: tam renk, tek renk, ters, zeminli sürümler,
   uygulama ikonu, favicon, 16/32 px), `tokens/` (CSS, SCSS, Tailwind, DTCG, `.gpl` palet), `fonts.md`.
5. **sadece-tasarim'e aktar:**
   ```
   python "<skill>\scripts\marka_aktar.py" "WORK\kit\<X>" "<Proje>"
   ```
   Logoları `assets/marka/` altına kopyalar, `_script/marka_veri.jsx` (`var MARKA = {...}`) yazar, fontların
   kurulu olup olmadığını söyler. Google fontu eksikse ve kullanıcı onaylarsa `--font-kur` (kullanıcı kapsamı,
   yönetici gerekmez), ardından Photoshop/Illustrator'ı yeniden başlat ve `probe_fonts.jsx` ile PostScript adını al.
6. **Illustrator marka dosyası:** `marka_ai.jsx` ve `lib_ai.jsx`'i `_script/`'e kopyala:
   ```
   powershell -NoProfile -ExecutionPolicy Bypass -File "<skill>\scripts\run_jsx.ps1" -App illustrator -Script "<Proje>\_script\marka_ai.jsx"
   ```
   `ai/<Marka>_marka.ai`: her logo sürümü ayrı artboard'da **vektör ve düzenlenebilir** (`AI.importSVG`),
   marka renkleri örnek grubu (`AI.swatchGroup`), renk paneli; `png/marka_*.png` önizleme;
   `png/kucuk/` 16/32/64 px testleri (`AI.smallTest`). PNG'leri Read ile **gözle** kontrol et.
7. **Sosyal medya şablonları** (story/post/carousel): build.jsx'in başına `#include "marka_veri.jsx"` ekle,
   `T`'yi MARKA'dan doldur:
   ```js
   #include "lib.jsx"
   #include "marka_veri.jsx"
   var T = {
     deep: MARKA.roller.primary.replace("#",""), ink: MARKA.roller.onPrimary.replace("#",""),
     accent: MARKA.renkler[1].hex.replace("#",""),
     logo: BASE + "assets/marka/on-dark-background.svg",   // koyu zeminde; açık zeminde full-color.svg
     fTitle: "Outfit-Bold", fSub: "Outfit-Regular"          // probe_fonts.jsx'in verdiği PostScript adları
   };
   ```
   Kılavuzdaki kurallar sosyal işte de geçerli: koruma alanı, minimum boyut, logo yalnız onaylı zeminlerde,
   vurgu rengi yalnız kılavuzdaki işi için (ör. "yalnız çağrı").

## 3. Tasarım ilkeleri (her logo/marka işinde)

- **Tek mekanizma:** Seti kuran tek görsel fikri bir cümleyle yaz; logo, font seçimi ve palet o cümleden çıksın.
  Üç ayrı "güzel seçim" bir kimlik değildir.
- **Tek yüksek ses:** Yalnız bir bileşen gösterişli olur. Logo iddialıysa font ve palet sakin; renk iddialıysa
  logo sade.
- **Eksenler:** Brife göre 2-4 eksen seç (sıcak↔soğuk, klasik↔çağdaş, oyuncu↔ciddi, premium↔erişilebilir,
  sessiz↔yüksek, samimi↔otorite). Setler en az iki eksende ayrışsın; bir setin parçaları aynı noktada dursun.
- **Rakibe göre ayrış:** Genel bir sektör listesine değil, kullanıcının gerçek rakiplerine. "Nerede ayrışıyor"
  tek cümle.
- **Logo:** Tanıtır, anlatmaz. Set başına 4-6 tek cümlelik fikir yaz, birini kur. Önce düz, tek renk ve 16 px
  bak; mockup cilası zayıf formu kurtarmaz. Yalnız yazı (wordmark) logoda bile sahiplenilebilir tek bir detay
  ve küçük boyut için tasarlanmış bir işaret olsun; "düz yazı + baş harf favicon" hazır şablon gibi okunur.
- **Refleks testi:** Her font, renk ve logo fikri için sor: "Bunu bu sektördeki başka bir markaya da önerir
  miydim?" Evetse brifle gerekçelendir (kullanıcı istedi, rakip haritasında o bölge boş, mevcut varlık, üretim
  kısıtı) ya da değiştir. "Sıcak hissettiriyor", "premium duruyor" gerekçe değildir; klişe tam böyle çalışır.
  Setlerden en az biri aşağıdaki listeden hiçbir şey kullanmasın.

### Yapay zekâ varsayılanları ve kategori klişeleri (yasak değil, gerekçe ister)

- **Font:** Fraunces ve benzeri yumuşak serif başlık (Recoleta); Inter metin fontu; sektör kalıpları:
  Cormorant Garamond (şarap, otel, gayrimenkul), Canela (hukuk), Barlow Condensed (inşaat, lojistik),
  Space Grotesk / Sora (yapay zekâ, kripto, fintek), Poppins (eğitim teknolojisi).
- **Renk:** krem zemin + terrakota + altın/pirinç vurgu (+ serif başlık); lacivert + altın (hukuk, gayrimenkul,
  finans, sigorta, kamu); teknoloji brifinde indigo/mor; maviden mora gradyan.
- **Logo formülü:** markanın nesnesi + gizli harf + negatif alan + daire + yerel "selam"; hep sembol + yazı
  (yalnız yazı ya da tipografik bir set de öner).
- **Kategori klişeleri:** dört köşeli kıvılcım, radyal girdap, gradyan küre; yuvarlak kare içinde baş harf
  (o kutu uygulama ikonu kabıdır); altıgen/düğüm/küp; yaprak, kalkan, çatı, ok, ampul, dünya, şimşek; swoosh;
  2 px çizgi ikon. İşe başlamadan sektörün üç klişesini adlandır.
- Meşru kullanım örnekleri: kutu uygulama ikonu olarak, düz ana sürümü olan gradyan, adı "Hex…" olan markada altıgen.

## 4. Referans araştırması

SKILL.md bölüm 2'deki Behance analizi geçerli, şu eklerle:
- Behance bugünkü "kılavuz şablonu" görünümünün kaynağı (bej kâğıt, dev "Aa", köşeli parantezli bölüm
  numaraları). Bu görünümü bilerek ve markanın kendi renk/fontuyla kullan, yoksa şablon gibi okunur.
- Font için en iyi kaynak **Fonts In Use** (gerçek kimliklerde kullanım); yenileme emsalleri için **Brand New**;
  gerçek kılavuz PDF'leri için **brandingstyleguides.com**; tarihî kılavuzlar için **Standards Manual**
  (NASA 1976, NYCTA 1970).
- Bağlantı ver, kopyalama; görselleri karta ya da kılavuza indirme.

## 5. Ölçüm araçları (iddia ya ölçülür ya "yargı" diye etiketlenir)

| Ne | Komut | Kapı |
|---|---|---|
| Yazı/zemin kontrastı (hex) | `python <skill>\scripts\kontrast.py "#FFFFFF/#E4572E"` | normal metin 4.5:1, büyük 3:1 (WCAG 2.2) |
| Görsel üstündeki yazı | `kontrast.py --png png\story.png --kutu x,y,w,h --yazi "#FFFFFF"` | en kötü %10 dilim eşiği geçmeli |
| Palet (renk körlüğü, ayırt edilebilirlik, baskı gamı) | `python ...\brand-identity\scripts\palette_audit.py --colors "#hex,#hex" --roles brand,text` | GATE satırı yok |
| Font (Türkçe glif, lisans, I/l/1 karışması, tablo rakamı) | `BI fonts audit "Montserrat" --langs tr --numbers` ya da font dosya yolu | GATE satırı yok |
| Font arama (varsayılanları dışla) | `BI fonts search --class grotesque --langs tr --exclude-defaults` | |
| Mevcut kimlik | `BI critique --logo logo.svg --fonts "A,B" --palette palette.json --langs tr` | |
| Logo küçük boyut | `AI.smallTest` (Illustrator) + kitin `small-16/32` PNG'leri | gözle: delik tıkanmıyor, ince çizgi kaybolmuyor |

- Adobe Fonts yazıları dosya yoluyla ölçülemeyebilir (gizli klasör); Türkçe glifi `probe_fonts.jsx` görseliyle
  denetle, lisansı "Adobe Fonts" diye not et (logo kullanımına izin verir; ayrıntı: Adobe Fonts lisans SSS).
- Sistem fontu (Arial vb.) lisans kapısından "bilinmiyor" diye kalır: logo için lisansı doğrula ya da Google
  Fonts (OFL) öner.
- `info gamut` uyarısı: canlı renk CMYK dışında kalabilir; baskı işinde Lab D50 + tolerans ver, matbaaya sor.

## 6. Yol B: eleştiri ("markamızı değerlendir")

Puan verme (kanıt ağırlık vermeye yetmez). İşi eleştir, kişiyi değil; önce işe yarayanı söyle.

1. Bağlam: sektör, rakipler, pazar, diller. Siteyi oku; en fazla 3 soru; tahminleri "Varsayımlar" altına yaz.
2. Topla: `BI critique --site URL` ve/veya `--logo/--fonts/--palette`, görsel üstü yazılar için `kontrast.py`.
3. İlk izlenim (iki saniye): yabancı biri bu markayı ne sanar, akılda ne kalır?
4. Kapılar → bileşen bulguları → en önemli üç değişiklik.

Kapılar: kontrast · Türkçe glif · font lisansı (logo, web, uygulama) · logo dosyası (vektör, `<text>`/`<image>`
yok, tek renkte çalışıyor, 16 px var) · rakiple karışma (ana renk doğrudan rakiple "aynı renk" değil) · yerel
anlam (bayrak amblem zemini değil). Denetlenmeyen kapı "denetlenmedi: neden" yazılır, geçti sayılmaz.

Değişiklik önerisi şu kalıpta: **Ne** ("Buton zemini #4FA3E0 → #1F6FB2"), **ölçülen etki** ("beyaz yazı
2.6:1 → 5.1:1"), **neden** (brife bağlı tek cümle), **maliyet** (token · site CSS · yeniden baskı · logo
yeniden çizimi). Asla "kontrastı iyileştirin" deme. Düzeltmeden sonra yeniden ölç, önce/sonra söyle.

```markdown
## Kimliğiniz: <Marka>
**İlk izlenim:** <1-2 cümle>
**Denetimler:** okunurluk ✓/✗ · fontlar Türkçeyi kapsıyor ✓/✗ · font lisansları ✓/✗ · logo küçükte ve tek
renkte çalışıyor ✓/✗ · rakiple karışmıyor ✓/✗ (— denetlenmedi, neden)
**Logo:** … **Font:** … **Renk:** … **Bütün:** …
**Korunmaya değer:** <ne ve neden>
**Üç değişiklik, en önemlisi önce:** 1. … 2. … 3. …
**Varsayılan:** <rakipler, pazar> · **Sonraki adım:** "Bu düzeltmeleri bir postta göstereyim mi?" /
"Yenileme yönleri çıkarayım mı?"
```

## 7. Dürüstlük

- Kapılar ölçülen hatalardır (kontrast, lisans, glif, dosya geçerliliği, render). Uyarılar kalibre edilmemiş
  sezgilerdir; söylerken öyle olduğunu belirt. Gerekçede kanıtı etiketle: `ölçüldü` (betik/site), `yargı` (senin).
- Bir rengin ya da fontun "dönüşüm artırdığını", "güven verdiğini" iddia etme; çağrışımlar zayıf ve bağlama bağlı.
- Savunamayacağın seti gösterme. Onay taklidi yapma. Örnek (mock) veriyi örnek diye etiketle.
- Temiz denetim "ölçülebilir bir kusur yok" demektir, "kimlik iyi" demek değildir.
