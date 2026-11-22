# Claude ile spor ve sosyal medya tasarımı

Claude Code’da bu rehberi ve [Photoshop betiğini](../scripts/claude-spor-editoriyal.jsx) kullan. Betiği elle çalıştırmak için `scripts/` klasörünü `lib.jsx` ile birlikte koru. Kullanacağın fotoğrafları, varsa kulüp armasını ve kesin metinleri de ekle.

## Claude’a gönderilecek istem

> Ekli rehberi bu proje için tasarım referansı olarak kullan. Brifimi okuyup önce yayın türünü, ilk okunacak bilgiyi, fotoğraf sırasını, paleti ve tipografik hiyerarşiyi belirle. Kaynağı ekli rehberde yer alan ve brife uyan bir ya da iki ilkeyi seç. Kendi fotoğraflarımızı, metnimizi ve arma dosyamızı kullan. Fotoğraf hikâyesine uygunsa ekli JSX’in en baştaki çalışma kodundaki JOBS dizisini brifime göre düzenleyip çalıştırılabilir JSX olarak ver. Brif ilk 11, skor veya forma lansmanıysa ilgili bilgi hiyerarşisini uygula ve şablonun gerektirdiği ek metin veya logo katmanlarını kur. Gerçek dosya yolları, skor, saat ve oyuncu isimleri gibi eksik verileri uydurma. Çıktıda hangi düzeni seçtiğini, nedenini ve telefon boyutunda neyi kontrol edeceğimi yaz. Photoshop’ta çalıştırdığını ancak bunu gerçekten doğruladıysan söyle.

## Hızlı kullanım

1. Betiği düzenlemeden çalıştırmak için Photoshop’ta **Dosya → Komut Dosyaları → Gözat** yolundan JSX dosyasını seç. Düzeni, biçimi, fotoğrafları ve çıktı klasörünü diyaloglardan seçebilirsin.
2. Claude ile birden fazla post, story veya carousel sayfası üretirken `JOBS` dizisine her çıktı için bir nesne yazdır. Betik bu nesneleri verilen sırada işleyip her sayfa için ayrı katmanlı PSD ve PNG oluşturur. Kaydetme konumu bir kez sorulur.
3. Sürümün font PostScript adları, kaynak dosya yolları, çıktı PSD/PNG’leri ve mobil önizlemesi kontrol edilmeden işi teslim etme. Görsel dili koru, her yayın biçimi için kadrajı yeniden kur.

| Betik düzeni | Girdi | Kullanım |
|---|---:|---|
| `hero` | 1 fotoğraf | Maç anı, kutlama, fotoğraf odaklı kapak |
| `grid` | 6 fotoğraf | 2×3 arşiv sayfası, geniş plandan ayrıntıya dizi |
| `filmstrip` | 3 fotoğraf | Üstten alta geniş plan, hareket detayı, portre veya forma |
| `polaroid` | 2 fotoğraf | Büyük arka plan detayı ve üstte paspartulu portre |
| `diptych` | 2 fotoğraf | Üst ve alt kareyle iki dönem veya iki an |
| `collage` | 4 fotoğraf | Büyük ana fotoğraf ve yanında üç yardımcı kare |
| `poster` | 1 fotoğraf | Ayrı renk plakasında güçlü manşet ve altında fotoğraf |

```javascript
var JOBS = [
  {layout: "filmstrip", format: "post", title: "Maçın hikâyesi",
   meta: "15. hafta", photos: ["genis.jpg", "top.jpg", {path: "forma.jpg", x: 0.5, y: 0.35}],
   paper: "F4F1E8", ink: "15181B", accent: "8A312C", grade: "cool", grain: 14},
  {layout: "hero", format: "story", title: "Maçın hikâyesi",
   photos: ["sevinç.jpg"], paper: "F4F1E8", ink: "15181B"}
];
```

- Göreli fotoğraf yolları JSX’in bulunduğu klasöre göre çözülür. Windows’ta mutlak yol için `C:/klasor/foto.jpg` biçimi kullanılabilir.
- `x` ve `y` kırpmanın hareket edebildiği alanda 0–1 arası konumdur. Varsayılan 0,5 merkezdir. Bir eksende taşan görüntü yoksa o eksendeki değer kadrajı değiştirmez.
- `grade` seçenekleri `none`, `cool`, `warm`, `mono`. `grain` doku katmanının 0–100 opaklığıdır. `fontTitle` ve `fontMeta` isteğe bağlı kurulu PostScript adlarıdır. Rehberde görülen hareket izi, maske bindirmesi, özel logo, skor veya ilk 11 tabloları için brife özel katmanlar gerekir.
- Story 1080×1920, post 1080×1350. Başlık ve künye düzenlenebilir metin, fotoğraflar maskeli akıllı nesne olarak kurulur. Kaynaklar okunur, dosyalar yeni bir çıktı klasörüne yazılır.

## Tasarım kararı ve teslim kontrolü

- **De Marke Garage** ile veriyi kime ve hangi döneme ait olduğuna göre hizala. **Mantra** ile manşetin ve portrenin ölçeğini tek hikâyeye bağla. **Socrates Dergi** ile kareleri ortak bir görsel ayrıntı üzerinden ilişkilendir.
- **02archives** ile geniş, orta ve yakın plan arasında ritim kur. Doku, film şeridi, Polaroid veya baskı künyesi hikâyeye hizmet ettiği yerde kullan.
- **Kulüp ve stüdyo örnekleri** için tutarlı şekil, renk ve veri sırası belirle. **Global Media** gibi ajans portföyünde önce ana fikir, sonra işe yaradığı fiziksel veya dijital bağlam, ardından gerekli varyasyonlar gelsin.
- Boyut, Türkçe karakterler, yazı kontrastı, uzun soyadı, iki haneli skor, yüz ve arma kadrajını kontrol et. Marka kimliğinde hedef kullanım için tek renk ve küçük boyut denemesi yap. Logo ve poster varlıklarını kullanıcının kendi kimliğinden üret.

## Analizler ve çalışma notları

- [De Marke Garage, Mantra ve Socrates Dergi](spor-yayinlarinin-tasarim-dilleri.md)
- [Kulüp ve ajans tasarımları ile Global Media](futbol-ve-ajans-tasarimlari.md)
- [02archives spor editoryali](02archives-tasarim-teknikleri.md)
- [Marka kimliği](marka-kimligi.md) ve [uygulama notları](tuzaklar.md)
