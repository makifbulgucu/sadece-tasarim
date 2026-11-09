---
name: sadece-tasarim
description: "Photoshop ve Illustrator'da profesyonel grafik tasarımcı gibi çalışır: Instagram story (1080x1920), post (1080x1350), carousel, afiş, davetiye, özel gün paylaşımı, logo ve marka işlerini betikle (COM + ExtendScript) katmanlı PSD/AI olarak kurar. Behance referans analizi, tek renk dünyası, ışık-gölge-grain, Türkçe font denetimi ve görsel kalite kontrolü yapar; dosyaları açık ve düzenlenebilir bırakıp kontrolü kullanıcıya verir. Kullanıcı 'story yap', 'post hazırla', 'Photoshop'ta tasarla', 'PSD hazırla', 'Illustrator'da çiz', 'logo tasarla', 'carousel', 'afiş', 'kutlama paylaşımı' dediğinde ya da görsel + başlık + logo verip sosyal medya tasarımı istediğinde kullan. Video/Reels kurgusu, web sayfası ve HTML animasyon için kullanma."
---

# sadece-tasarim: Photoshop / Illustrator tasarım iş akışı

Claude kurulum işini (belge, yerleştirme, renk, ışık, katmanlar, dışa aktarma) betikle yapar; yaratıcı son söz ve son dokunuş kullanıcıda kalır. Her teslim katmanlı ve düzenlenebilir olur.

Skill klasörü (bu dosyanın yanı): `scripts/` hazır kod, `references/tuzaklar.md` bilinen hatalar. Bir hata alınca önce `references/tuzaklar.md`'ye bak.

## 1. Zihniyet: profesyonel grafik tasarımcı

"Çalışan ilk sonucu" teslim etme. Her işte:

- **Önce tasarım kararı:** konsept (tek cümle), 2-3 ana renk (hex), tipografik hiyerarşi, odak noktası, boşluk ritmi. Bunu kullanıcıya 3-4 satırla söyle, sonra kur.
- **Hiyerarşi:** başlık > alt başlık > logo. Başlıkla alt başlık arasında belirgin nefes boşluğu. Metin görselin önemli detaylarıyla (yüz, ürün, direk, ay, gemi adı, uçak) çakışmasın.
- **Tipografi:** Kullanıcı font verdiyse onu kullan. Metni **verildiği gibi** yaz: büyük/küçük harf, noktalama, kelime değiştirilmez. Tracking, satır aralığı, optik hizalama. İki fontu çiftle (kalın display + sakin serif/italik). Satır sonları anlam bütünlüğüne göre.
- **Işık ve renk:** Tüm görselleri tek renk dünyasına çek (eğriler, renk dengesi, canlılık ayar katmanları). Işık/parlama, vinyet, alt gölge, hafif grain. Zemin ve görsel aynı gradelenmeli, yoksa dikiş izi kalır. Aşırı doygunluktan kaçın; fazlaysa geri çek.
- **Logo:** Altta, okunur boyutta. Koyu/karmaşık zeminde okunmuyorsa beyaz plaka, koyu gölge ya da beyaz sürüm. Zemine göre sürüm seç.
- **Dürüstlük:** Düşük çözünürlüklü görseli gereksiz büyütme; gerekirse düşük opaklıkta doku olarak kullan ve söyle. Görselde başkasının filigranı/imzası varsa bildir (kredi gerekebilir). Stok görselin lisansını not et.

## 2. Behance referans analizi (logo, marka ve kampanya işlerinde)

1. İşe başlamadan konuyla ilgili 3-5 Behance projesi bul (WebSearch). Behance sayfaları otomatik okumayı çoğu zaman engeller; sayfayı yerleşik tarayıcıyla (`mcp__Claude_Browser__*`) aç ve `get_page_text` / ekran görüntüsüyle incele.
2. Analiz et: logo yapısı (sembol/yazı oranı, geometri, grid), palet ve kullanım oranları, font çifti, boşluk/hizalama mantığı, mockup ve sunum dili, seri tutarlılığı.
3. Kullanıcıya kısa özet ver: hangi eğilimleri çıkardın, neyi neden seçtin. Sonra **özgün** tasarım üret. Tek işi kopyalama, başkasının logosunu/markasını taklit etme; yalnızca ilke ve eğilim al.
4. Marka işlerinde sistem düşün: ana logo, sembol, yatay/dikey kullanım, tek renk sürüm, koruma alanı, renk ve font tanımı.

## 3. Girdiler

Genelde: ana/referans görseller, başlık ve alt başlık metni, başlık ve alt başlık fontu (Adobe Fonts'ta etkin), logo, format. Eksik bilgi gerçekten kritikse **tek** kısa soru sor; değilse en makul varsayımla ilerle ve varsayımı söyle.

## 4. Çıktılar ve ölçüler

| Format | Boyut | Güvenli alan / not |
|---|---|---|
| Story | 1080x1920 | Üst 250 px (profil/çubuk), alt 340 px (yanıt alanı), yanlar 64 px. Önemli öğe bunların dışına çıkmasın. |
| Post | 1080x1350 (4:5) | Profil ızgarası 3:4 kırpar: kenarlardan ~40 px pay bırak. |
| Carousel | N x 1080x1350 | Tek dil, sayfalar arası akış; kapak hook, son sayfa CTA. Her sayfa ayrı PSD ya da Illustrator'da çoklu artboard. |
| Kare | 1080x1080 | Gerekirse. |

- Story ve post aynı tasarım dilinde ama **ayrı kompoze** edilir (post story'nin kırpması değildir).
- Teslim: katmanlı `.psd` + `.png` önizleme (istenirse `.jpg`). Illustrator işlerinde `.ai` ana dosya, gerekirse `.svg` / `.pdf` / `.png`.
- Renk: sRGB, 8 bit, 72 ppi (`SD.newDoc` böyle açar).
- Katmanlar adlı ve gruplu: **Görsel** (akıllı nesne + kırpılmış ayar katmanları), **Işık & Gölge**, **Metin**, **Logo**, en üstte **Grain**. Kullanıcı her şeyi ayrı ayrı açıp kapatabilmeli.
- Klasör düzeni:
  ```
  <Proje>/                 ör. Belgeler\29Ekim_Atlas (ASCII ad)
    assets/                kullanıcının dosyalarının KOPYALARI (orijinallere dokunma)
    _script/               build.jsx, lib.jsx, build_log.txt
    psd/   png/            teslim
  ```

## 5. İş akışı (Windows, COM: ekran kontrolü gerekmez)

Photoshop ve Illustrator, PowerShell'den COM ile betik çalıştırır. Uygulama kapalıysa açılır. Ekran kontrolü (computer use) **yalnızca** COM çalışmazsa yedek yoldur (bölüm 8).

**Adım 1. Proje klasörü.** Klasör yapısını aç, girdileri `assets/` altına kopyala. Skill'den `scripts/lib.jsx` ve `scripts/ornek_build.jsx` dosyalarını `_script/` altına kopyala; `ornek_build.jsx`'in adını `build.jsx` yap. Illustrator işinde `lib_ai.jsx`.

**Adım 2. Font denetimi.**
```
powershell -NoProfile -ExecutionPolicy Bypass -File "<skill>\scripts\run_jsx.ps1" -Script "<skill>\scripts\probe_fonts.jsx" -JsxArgs "<Proje>\_script|Avant,Comma"
```
`fonts.txt` PostScript adlarını verir. `font_ornek.png`'yi Read ile **gözle** kontrol et: Ş, İ, ı, ğ doğru mu, yedek fonta düşen ya da bozuk glif var mı, font yalnızca büyük harf mi çiziyor. Sorun varsa kullanıcıya söyle, alternatif öner.

**Adım 3. build.jsx'i yaz.** Dosyayı **Write aracıyla** yaz (Bash heredoc ters eğik çizgiyi bozar). Türkçe metni doğrudan yazabilirsin. Tasarım kararlarını en üstteki `T` nesnesinde topla (metinler, fontlar, renkler, yollar). Her format kendi fonksiyonunda (`story()`, `post()`); dosya `SD.init(...)` + `SD.run(function(){...})` ile biter. Hazır yardımcılar (`lib.jsx`):

| İş | Fonksiyon |
|---|---|
| Belge, kılavuz | `SD.newDoc(ad,w,h,zeminHex)`, `SD.guides(doc,üst,alt,yan)`, `SD.dropEmpty(doc)` |
| Grup | `SD.group(doc,ad)`, `SD.into(katman,grup)` (sonra grup aktif olur, yeni katman grubun dışında açılır) |
| Görsel | `SD.place(doc,yol,ad,{w,h,fit:"cover"/"contain",x,y / cx,cy,op,blend})` gömülü akıllı nesne |
| Maske, dekupe | `SD.maskRect(doc,katman,x,y,w,h,feather)`, `SD.maskFromSelection`, `SD.cutout(doc,katman)` (Konuyu Seç) |
| Renk (ayar katmanı) | `SD.curves(doc,ad,{rgb:[[0,0],...],r,g,b},clip)`, `SD.colorBalance(doc,ad,gölge,orta,ışık,clip)`, `SD.vibrance`, `SD.levels`, `SD.brightnessContrast` |
| Şekil | `SD.rect(doc,ad,x,y,w,h,hex,köşeR,op,blend)` vektör, düzenlenebilir |
| Işık/gölge | `SD.glow(...)` yumuşak elips, `SD.softRect(...)`, `SD.vignette(doc,hex,op)`, `SD.grain(doc,miktar,op)`, `SD.dropShadow(doc,katman,{op,dist,size})` |
| Metin | `SD.text(doc,metin,{font,size,color,x,y,just,track,lead,box:[w,h]})`, `SD.fitWidth(katman,maxW)`, `SD.bounds(katman)`, `SD.moveTo` |
| Kaydet | `SD.save(doc,ad,{jpg:true})` → `psd/ad.psd` + `png/ad.png` |

Sıra kuralı: zemin → görsel (+ kırpılmış ayarlar) → ışık/gölge/vinyet → metin → logo → grain. Vinyet metnin üstünde kalırsa beyaz yazı grileşir.

**Adım 4. Çalıştır.**
```
powershell -NoProfile -ExecutionPolicy Bypass -File "<skill>\scripts\run_jsx.ps1" -Script "<Proje>\_script\build.jsx"
```
Çıktı `OK` + log ya da `ERR: ... | satir N`. Hata satırı `_script/build.jsx`'e göredir.

**Adım 5. Görsel kontrol.** `png/` altındaki her dosyayı Read ile aç ve bölüm 9'daki listeyle denetle. Gerekirse `T` değerlerini ya da konumları düzeltip tekrar çalıştır (genelde 1-2 tur). Aynı adlı belge zaten açıksa `SD.newDoc` onu kapatıp yeniden kurar; kullanıcı o belgede kaydetmeden değişiklik yaptıysa betik durur: **kullanıcıya sor**, üzerine yazma.

**Adım 6. Teslimden sonra değişiklik.** Kullanıcı PSD'yi elle düzenlemiş olabilir. Yeniden kurmadan önce sor; kurulacaksa eski dosyayı `psd/_yedek/` altına kopyala. Küçük değişiklikte (metin, renk) açık belgeyi yerinde güncelleyen küçük bir betik yaz (ör. `doc.artLayers.getByName("Başlık").textItem.contents = ...`), belgeyi baştan kurma.

## 6. Kullanıcının çalışmasına saygı (kesin kurallar)

- Kullanıcının açık belgelerini **kapatma, değiştirme, kaydetme**. Yalnızca betiğin ürettiği, aynı adlı ve kaydedilmiş belgeyi kapat (`SD.closeOwn`). Asla `while(app.documents.length) close(DONOTSAVECHANGES)` yazma.
- Orijinal dosyalara dokunma; `assets/` altındaki kopyalarla çalış.
- Uygulama tercihlerini (birimler, diyaloglar) iş bitince geri yükle (`SD.run` yapar).
- Teslimden sonra belgeler açık ve katmanlı kalır; ekran kontrolüne bir daha dokunma.

## 7. Illustrator (logo, vektör, çoklu artboard)

`lib_ai.jsx` + `run_jsx.ps1 -App illustrator`. Koordinatlar artboard'un sol-üstüne göre, y aşağı.

- `AI.newDoc(ad,w,h,artboardSayısı,sütun,aralık)`, `AI.rect(doc,ab,x,y,w,h,hex,r,stroke)`, `AI.ellipse`, `AI.text(doc,ab,metin,{font,size,color,x,y,just,track})`, `AI.place(doc,ab,yol,{w,cx,cy})`.
- Logo vektörleştirme: `AI.trace(raster,{mode:"color"|"bw",colors:6,ignoreWhite:true})`. `ignoreWhite` beyaz parçaları da siler; beyaz öğeli logoda kapat. Sonucu gözle kontrol et, gerekirse kullanıcıya temizlik notu düş.
- Dışa aktarma: `AI.exportPNG(doc,ab,yol,ölçek)`, `AI.exportSVG`, `AI.savePDF`; **en son** `AI.saveAI`. Paylaşılacak SVG/PDF kopyasında metni outline'a çevir (`AI.outlineAll`), ana `.ai`'de metin düzenlenebilir kalsın.

## 8. Yedek yol: ekran kontrolü

COM çalışmazsa (uygulama COM'a yanıt vermiyor, kurumsal kısıtlama vb.): `mcp__computer-use__request_access` ile Photoshop/Illustrator iste, `open_application` ile aç. Dosya > Komut Dosyaları > Gözat ile `_ascii_` dönüşümü yapılmış betiği seç. Menü konumları ekran çözünürlüğü, dil ve sürüme göre değişir: her tıklamadan önce ekran görüntüsüyle doğrula, sabit koordinata güvenme.

macOS: `scripts/run_jsx.sh photoshop|illustrator <build.jsx>` (osascript). Henüz denenmedi; ilk kullanımda doğrula.

## 9. Kalite kontrol listesi (her PNG için)

- [ ] Metin, kullanıcının verdiğiyle **birebir** aynı (harf, büyük/küçük, noktalama); Türkçe karakterler doğru.
- [ ] Hiyerarşi okunuyor: başlık > alt başlık > logo; aralarında nefes boşluğu var.
- [ ] Metin görselin önemli detayına (yüz, ürün, ay, direk, gemi adı) binmiyor.
- [ ] Güvenli alanlar korunmuş (story üst 250 / alt 340; post kenar ~40).
- [ ] Yazı-zemin kontrastı yeterli; küçük metin (< 28 px) sakin bir zeminde.
- [ ] Logo okunur, uygun sürüm/plaka seçilmiş.
- [ ] Tek renk dünyası; aşırı doygunluk, dikiş izi, sert maske kenarı yok.
- [ ] Görsel bulanık/pikselli değil (gereksiz büyütme yok).
- [ ] Story ve post ayrı kompoze; aynı dil.
- [ ] Katmanlar adlı ve gruplu; ayarlar ayar katmanı, görseller akıllı nesne.

## 10. Bitiş

Kısa özet ver: ne yaptın (konsept, palet, fontlar), dosya konumları, dürüst notlar (düşük çözünürlük, filigran, stok lisansı, kullanılmayan görsel, varsayımlar). Belgeler Photoshop/Illustrator'da açık kalır; kontrol kullanıcıdadır.
