# Bilinen tuzaklar ve çözümleri

Gerçek işlerde karşılaşılan sorunlar. Bir hata alınca önce buraya bak.

## Betik çalıştırma

| Belirti | Neden | Çözüm |
|---|---|---|
| Türkçe harfler `Ã§`, `ÅŸ` gibi bozuk çıkıyor | ExtendScript UTF-8'i ve BOM'u güvenilir okumuyor | `run_jsx.ps1` ile çalıştır; ASCII dışı karakterleri otomatik `\uXXXX`'e çevirir. Elle çalıştırıyorsan metni `\uXXXX` ile yaz. PowerShell `Set-Content -Encoding UTF8` BOM ekler, kullanma. |
| `#include` edilen dosyada Türkçe bozuk | `run_jsx.ps1` yalnızca çalıştırılan dosyayı dönüştürür, `#include` edilenleri değil | `lib.jsx` / `lib_ai.jsx` ve kendi include dosyaların ASCII kalsın; Türkçe metin build betiğinde dursun. |
| `Hata 25: Beklenen: )` ve `replace(/\/g` gibi bozuk satır | Bash heredoc'u (`<<'EOF'` bile) çift ters eğik çizgiyi teke indirdi | JSX dosyalarını **Write aracıyla** yaz, heredoc ile değil. Windows yollarını `/` ile yaz. |
| `Hata 8800 ... bu monitöre yerleştirmek için yeterince yer yok` (`documents.add`) | Photoshop arka planda ya da Ana Ekran'da | `run_jsx.ps1` pencereyi öne getirir. Yine olursa Photoshop'ta bir belge açık değilken Ana Ekran'ı kapat, tekrar dene. |
| `DoJavaScriptFile` argüman verince `Desteklenmeyen Varyant türü` | COM dizi argümanı Photoshop'ta çalışmıyor | `-JsxArgs "a\|b"` kullan; betikte `SD_ARGS[0]`. |
| `-JsxArgs "a","b"` tek klasör adı oldu (`_test,Avant,...`) | `powershell -File` dizi parametresini ayrıştırmaz | Argümanları `|` ile tek dizgede ver. |
| PowerShell'de parametre hatası `System.__ComObject is not a valid value for App` | PowerShell değişken adları büyük/küçük harf duyarsız (`$app` = `$App`) | Betikte COM nesnesine farklı ad ver (`$adobe`). |
| Betik "başarılı" ama dosya yok | Yazılan klasör yok; `File.open` sessizce başarısız | `new Folder(yol).create()` ile önce klasörü aç (`SD.init` ve `SD.save` bunu yapar). |
| Fonksiyon adı çakışması, tuhaf davranış | `build` gibi adlar ExtendScript ortamında çakışabiliyor | Yardımcılar `SD.` / `AI.` altında; kendi fonksiyonlarına `story()`, `post()`, `makeDoc()` gibi ad ver. |

## Photoshop DOM / ActionManager

- **Gradyan dolgu katmanı** (`contentLayer` + `gradientLayer`) betikle oluşmuyor. Gradyanı yumuşak elips/dikdörtgen dolgularla (`SD.glow`, `SD.softRect`) kur ya da Python ile PNG zemin üretip akıllı nesne olarak yerleştir.
- **Yuvarlak köşeli dikdörtgen:** Seçimde `Rds` yok sayılıyor. Vektör şekil katmanında köşe başına değer (`topRight`... + `unitValueQuadVersion`) çalışıyor: `SD.rect(..., r)`.
- **Görsel yerleştirme:** `app.open → copy → paste` görseli piksele çevirir, sonradan büyütünce bulanıklaşır. `Plc ` ile gömülü akıllı nesne kullan: `SD.place`.
- **Renk düzeltme:** `ArtLayer.adjustLevels / adjustColorBalance` pikseli kalıcı değiştirir. Teslim katmanlı ve düzenlenebilir olmalı: `SD.curves`, `SD.colorBalance`, `SD.vibrance`, `SD.levels`, `SD.brightnessContrast` (ayar katmanı, `clip:true` ile yalnızca alttaki görsele).
- **Konuyu Seç:** `executeAction(sID("autoCutout"))` düz/sade zeminde çok temiz (`SD.cutout`). Karmaşık zeminde sonucu mutlaka gözle kontrol et.
- **Yeni katmanın yeri:** Yeni katman aktif katmanın üstüne açılır; aktif katman bir grubun içindeyse yeni katman da grubun içine düşer. `SD.into` taşıdıktan sonra grubu aktif yapar, böylece sonraki katman grubun dışında oluşur.
- **Efekt sırası:** Vinyet/karartma (Multiply) metnin ÜSTÜNDE kalırsa beyaz yazı griye döner. Efektleri metin ve logodan önce oluştur; grain (Overlay, nötr gri) en üstte kalabilir.
- **Nokta metni konumu:** `position` ilk satırın taban çizgisidir; ortalı metinde x merkezdir. Paragraf metninde (`box`) sol-üst köşedir.
- **Heceleme:** Paragraf metninde varsayılan İngilizce heceleme Türkçe kelimeleri yanlış böler. `SD.text` hecelemeyi kapatır.
- **Kullanıcı tercihleri:** Betik `rulerUnits/typeUnits/displayDialogs` değiştirir; `SD.run` sonunda eski değerleri geri yükler. Kendi betiğinde de geri yükle.
- **Açık belgeler:** `while(app.documents.length) close(DONOTSAVECHANGES)` kullanıcının kaydedilmemiş işini siler. Yalnızca kendi ürettiğin, kaydedilmiş belgeyi kapat (`SD.closeOwn`).

## Fontlar

- `textItem.font` PostScript adı ister (`ITCAvantGardePro-Bold`), aile adı değil. Yoksa Photoshop sessizce yedek fonta düşer. `SD.text` yoksa hata verir.
- Bazı fontlarda Türkçe glif yok ya da bozuk (örnek: Minion Variable Concept'te Türkçe glif yok, Mendl Serif Dawn'da "Ş" bozuk). `probe_fonts.jsx` örnek PNG'sine bakmadan font seçme.
- Bazı display fontlar yalnızca büyük harf çizer (örnek: TT Modernoir). Kullanıcının metnini değiştirme; durumu söyle, başka font öner.
- Adobe Fonts'tan yeni etkinleştirilen font, Photoshop yeniden başlatılana kadar `app.fonts` listesinde görünmeyebilir.

## Illustrator

- Hazır izleme ayarlarının adları arayüz diline göre değişiyor (`[Black and White Logo]` Türkçe arayüzde yok). `AI.trace` seçenekleri doğrudan verir.
- `ignoreWhite:true` logonun **beyaz parçalarını da** siler. Beyaz öğe içeren logoda `ignoreWhite:false` kullan ve zemini sonra temizle.
- Koordinatlar: `AI.pt` artboard'un sol-üst köşesine göre, y aşağı doğru çevirir. `pathItems.rectangle(top, left, w, h)` doğrudan kullanılırsa y ekseni ters.
- `doc.saveAs(PDF)` belgeyi PDF dosyasına bağlar. Önce PDF/SVG dışa aktar, **en son** `AI.saveAI` ile .ai kaydet.
- Dışa aktarma kopyasında metni outline'a çevir (`AI.outlineAll`), ana .ai dosyasında metin düzenlenebilir kalsın.

## Windows / ortam

- Photoshop ve Illustrator COM ile ekran kontrolü (computer use) olmadan çalışır; kapalıysa COM açar. Ekran kontrolü yalnızca COM çalışmazsa yedektir.
- Proje klasörünü Belgeler/Masaüstü gibi kullanıcının bulabileceği bir yerde aç, geçici klasörde değil.
- Uzun yollar ve `ı`, `ş` içeren yollar bazı yerel araçlarda sorun çıkarır; proje klasörüne ASCII ad ver (`29Ekim_Atlas`).
