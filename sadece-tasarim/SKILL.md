---
name: "sadece-tasarim"
description: "Photoshop ve Illustrator'da profesyonel grafik tasarımcı gibi çalışma: Behance logo/marka referans analizi, story+post üretimi, ışık-renk düzeni, kontrol kullanıcıya bırakılır."
---

# Photoshop / Illustrator Profesyonel Tasarım İş Akışı

Kullanıcı (Türkçe konuşur, video editörü/grafik işleri yapar) bu oturumda Photoshop ve Illustrator ile yapılacak TÜM çalışmaların bu şekilde yürümesini istedi.

## Zihniyet: profesyonel grafik tasarımcı
Her işte bir tasarımcı gibi düşün, "çalışan ilk sonucu" teslim etme:
- Önce kısa bir tasarım kararı ver: konsept, renk paleti (2-3 ana renk), tipografik hiyerarşi, odak noktası, boşluk ritmi.
- Hiyerarşi: başlık > alt başlık > logo. Başlıkla alt başlık arasında belirgin nefes boşluğu bırak; metin görselin önemli detaylarıyla (yüz, direk, ay, gemi adı, uçaklar) çakışmasın.
- Tipografi: kullanıcı font verdiyse onu kullan, metni olduğu gibi yaz (büyük/küçük harf değişmez). Tracking, satır aralığı ve optik hizalamaya dikkat et. İki fontu çiftle (kalın display + sakin italik/serif gibi).
- Işık ve renk: tüm görselleri tek bir renk dünyasında birleştir (renk dengesi, kontrast, levels), ışık/parlama katmanı, vinyet, alt gölge, hafif grain. Karışık kaynaklı görselleri aynı tonlara çek. Aşırı doygunluktan kaçın; ilk denemede fazla doygunsa geri çek. Zemin ile görsel aynı gradelenmeli (aksi halde dikiş izi kalır).
- Logo: çalışmanın altında, okunur boyutta. Koyu/karmaşık zeminde okunmuyorsa beyaz plaka ya da koyu gölge kullan; zemine göre beyaz/renkli sürüm seç.
- Düşük çözünürlüklü görseli gereksiz büyütme; büyütme gerekiyorsa düşük opaklıkta doku olarak kullan ve kullanıcıya dürüstçe söyle.
- Görselde başkasının filigranı/imzası varsa (fotoğrafçı logosu gibi) kullanıcıya bildir (kredi gerekebilir).

## Behance referans analizi (özellikle logo ve marka işleri)
Kullanıcı çalışmalarının çoğunu Behance'teki logo/marka tasarımlarını analiz edip referans alarak yürütmek ister.
1. İşe başlamadan konuyla ilgili Behance projelerini ara (WebSearch; sayfa okumak için WebFetch; engelliyse tercih edilen tarayıcı olan yerleşik tarayıcıyı kullan). Tek bir işi kopyalama; 3-5 referansı karşılaştır.
2. Referanslarda şunları analiz et: logo yapısı (sembol/yazı oranı, geometri, grid), marka paleti ve kullanım oranları, tipografi seçimi ve çifti, boşluk/hizalama mantığı, mockup ve sunum dili, tutarlılık sistemi.
3. Analizi kısa özetle kullanıcıya bildir (hangi eğilimleri çıkardın, neyi neden seçtin), sonra kendi özgün tasarımını üret. Referansı birebir taklit etme, başkasının logosunu/markasını kopyalama; sadece ilke ve eğilim al.
4. Marka işlerinde mümkünse sistem düşün: ana logo, sembol/ikon, yatay-dikey kullanımlar, tek renk sürüm, koruma alanı, renk ve font tanımı.

## Girdiler
Kullanıcı genelde şunları verir: referans/ana görseller, başlık fontu, alt başlık fontu (Adobe Fonts kütüphanesinde ekli), başlık metni, alt başlık metni, logo. Eksik olan gerçekten kritikse tek kısa soru sor, yoksa en makul varsayımla ilerle ve söyle.

## Çıktılar
- Story: 1080x1920 (üst ve alt ~250px güvenli alan düşün)
- Post: 1080x1350 (4:5)
- Her ikisi katmanlı .psd + önizleme .png. Başlık, alt başlık, logo, görseller ve efekt katmanları (ışık, vinyet, gölge, grain) ayrı katman olsun; kullanıcı rahat oynayabilsin.
- Yerleşim: üstte başlık, hemen altında belirgin bir boşluk bırakıp alt başlık, logo çalışmanın altında. Kullanıcı yazıyı verdiği gibi ister (büyük/küçük harf, metin değiştirilmez).
- İki formatı aynı tasarım dilinde kur; post story'nin kırpması değil, ayrıca kompoze edilmiş olsun.
- Illustrator işlerinde vektör (.ai) ana dosya; gerekirse .svg/.pdf/.png dışa aktarım.

## Teknik akış (Windows, Photoshop 2026, Türkçe arayüz)
1. computer_resolve_access -> computer_request_access ile 'Adobe Photoshop 2026' (Illustrator için aynı akış, uygulama adını resolve ile bul). Erişim 30 dk işlem yapılmazsa düşer; yenile. Uygulama kapalıysa computer_open_application ile aç, yüklenmesini bekle.
2. Dosya erişimi için device_request_folder_access ile ~/Documents iste. Görselleri/logoyu /mnt/user-data/outputs altına kopyalayıp device_commit_files ile Documents altında proje klasörüne (ör. Documents\29Ekim_X) yaz.
3. Font adlarını doğrula: küçük bir probe.jsx yaz (app.fonts içinde aile adı ara, postScriptName'leri bir txt'e yaz), çalıştır, device_bash ile oku. (Bilinenler: ITCAvantGardePro-Bold, CommaSerif-Italic, Aquavit-Semibold, TTModernoir-Rg [yalnızca büyük harf çizer], TimesNewRomanPS-ItalicMT.)
4. Tasarımı tek bir build.jsx ile kur (device_bash ile $HOME/mnt/Documents/<klasör>/ altına yaz). Photoshop'ta çalıştırmak için: Dosya menüsü (28,10) -> Komut Dosyaları (60,400) -> Gözat (246,550) -> dosya adı alanına (330,378) tıkla, yolu computer_type ile yaz, Yükle (540,402) tıkla. (Dosya diyaloğunda yazıya newline koyma; Yükle'ye tıkla.) Koordinatlar 1389x868 ekran çerçevesine göredir. Illustrator'da menü yerleşimi farklı olabilir; ilk seferde ekran görüntüsüyle doğrula.
5. Script ipuçları: fonksiyona 'build' adı verme (çakışır, 'makeDoc' kullan); rulerUnits/typeUnits piksel; en başta açık belgeleri kapat; hata için try/catch ile log txt yaz; görsel yerleştirmek için app.open -> selectAll -> copy -> doc.paste -> resize/translate; yumuşak geçiş için feather'lı dikdörtgen seçim + ActionManager makeMask (RvlS) ile katman maskesi; ışık/vinyet/gölge için feather'lı seçim + fill + Overlay/Multiply katmanı; grain için gri doldur + applyAddNoise + Overlay; renk için ArtLayer.adjustLevels / adjustBrightnessContrast / adjustColorBalance; koyu/siyah zeminli logo veya heykeli Screen blend (+ gerekirse adjustLevels) ile temizle; beyaz zeminli fotoğrafı renkli zemine Multiply ile karıştır; metin için ArtLayer.kind=TEXT, textItem.font=postScriptName, position, leading, tracking.
6. PNG'leri device_stage_files ile çekip Read ile GÖRSEL OLARAK kontrol et: yazı-nesne çakışması (direk, ay, uçak), logo okunurluğu, kenar/dikiş çizgileri, renk dengesi, boşluklar, hiyerarşi. Gerekirse parametreleri ayarlayıp tekrar çalıştır (genelde 1-2 tur yeter).
7. Logo koyu görsel üzerinde okunmuyorsa beyaz plaka üzerine koy; görseldeki önemli detaylarla (gemi adı, yüz, vb.) çakışmasın.

## Bitiş
- Kullanıcıya kısa özet ver: ne yaptın, dosya konumu, varsa dürüst notlar (düşük çözünürlük, filigran, kullanılmayan kopya görsel).
- Photoshop/Illustrator'da belgeler açık ve katmanlı kalsın; kontrolü kullanıcıya bırak (bundan sonra ekran kontrolüne dokunma).