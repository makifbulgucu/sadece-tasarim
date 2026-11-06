# sadece-tasarim

Bu repo, grafik tasarımcıların, freelance influencer'ların ve dijital pazarlamacıların iş akışlarını hızlandırmak için kurulmuştur.

**Bu repo sizi hızlandırır, işinizi elinizden almaz.**

`sadece-tasarim`, Claude'un Photoshop ve Illustrator'da profesyonel bir grafik tasarımcı gibi çalışmasını sağlayan bir skill'dir. Tekrarlanan kurulum işlerini (belge açma, görsel yerleştirme, renk eşitleme, ışık/vinyet/grain katmanları, story ve post formatları) Claude üstlenir; yaratıcı kararlar ve son dokunuş sizde kalır. Tüm dosyalar katmanlı teslim edilir, istediğiniz her şeyi elle değiştirebilirsiniz.

## Neler yapar?

- Instagram **story (1080x1920)** ve **post (1080x1350)** tasarımlarını aynı tasarım dilinde, ayrı ayrı kompoze eder
- Her format için katmanlı **.psd** ve önizleme **.png** üretir
- Farklı kaynaklardan gelen görselleri tek bir renk dünyasında birleştirir (renk dengesi, kontrast, ışık, vinyet, grain)
- Başlık, alt başlık ve logo hiyerarşisini kurar; yazının görseldeki önemli detaylarla çakışmamasına dikkat eder
- Logo ve marka işlerinde Behance'ten 3-5 referansı analiz eder, kopyalamadan kendi özgün tasarımını üretir
- Illustrator işlerinde vektör **.ai** ana dosya ve gerekirse .svg / .pdf / .png dışa aktarım hazırlar

## Gereksinimler

- Masaüstü kontrolü (computer use) açık olan **Claude** (Claude masaüstü uygulaması veya Claude Code)
- **Adobe Photoshop** ve/veya **Adobe Illustrator** (skill, Windows + Photoshop 2026 Türkçe arayüzle hazırlandı)
- Kullanacağınız fontların bilgisayarınızda veya Adobe Fonts'ta etkin olması

## Kurulum

**1. Repoyu indirin**

```bash
git clone https://github.com/makifbulgucu/sadece-tasarim.git
```

Git kullanmıyorsanız GitHub sayfasındaki **Code > Download ZIP** ile de indirebilirsiniz.

**2. Skill'i Claude'a ekleyin**

- **Claude Code:** İndirdiğiniz reponun içindeki `sadece-tasarim` klasörünü (içinde `SKILL.md` olan klasör) `~/.claude/skills/` altına kopyalayın. Sonuç: `~/.claude/skills/sadece-tasarim/SKILL.md`
- **Claude uygulaması:** İçinde `SKILL.md` olan `sadece-tasarim` klasörünü zip'leyin ve Ayarlar'daki Skills bölümünden yükleyin.

## Nasıl kullanılır?

**1. Malzemeleri hazırlayın.** Claude'a şunları verin:

| Malzeme | Örnek |
|---|---|
| Ana görsel(ler) | Ürün fotoğrafı, mekân, portre |
| Başlık metni | Yazdığınız gibi kullanılır, büyük/küçük harf değişmez |
| Alt başlık metni | Kısa açıklama veya slogan |
| Başlık ve alt başlık fontu | Adobe Fonts'taki font adları |
| Logo | Tercihen PNG; koyu ve açık sürüm varsa ikisi de |
| Format | Story, post veya ikisi |

Eksik bir şey varsa Claude en makul varsayımla ilerler ve bunu size söyler; gerçekten kritikse tek bir kısa soru sorar.

**2. Skill'i çağırın.** Sohbette `/sadece-tasarim` yazın ya da işi doğrudan anlatın:

> 29 Ekim için story ve post hazırla. Görseller ve logo ekte. Başlık: "Cumhuriyet'in 103. Yılı", alt başlık: "Nice yıllara". Başlık fontu ITC Avant Garde Bold, alt başlık Comma Serif Italic.

**3. Claude'un çalışmasına izin verin.** Claude Photoshop'a ve Belgeler klasörünüze erişim ister, ardından:

1. Kısa bir tasarım kararı verir (konsept, 2-3 ana renk, tipografik hiyerarşi)
2. Font adlarını doğrular
3. Tasarımı bir script ile Photoshop'ta katman katman kurar
4. Önizlemeleri kendisi kontrol eder (yazı-görsel çakışması, logo okunurluğu, renk dengesi) ve gerekirse düzeltir

**4. Son dokunuşu siz yapın.** Belgeler Photoshop'ta katmanlı ve açık bırakılır, kontrol size geçer. Başlık, alt başlık, logo, görseller, ışık, vinyet, gölge ve grain ayrı katmanlardadır; dilediğinizi kaydırın, değiştirin ya da kapatın.

## İpuçları

- Düşük çözünürlüklü görseller gereksiz büyütülmez. Büyütme gerekirse Claude bunu açıkça söyler.
- Görselde başka birinin filigranı veya imzası varsa Claude sizi uyarır (kredi gerekebilir).
- `SKILL.md` içindeki menü koordinatları ve font adları belirli bir kuruluma göredir. Farklı ekran çözünürlüğü, dil veya Photoshop sürümünde Claude ilk seferde ekran görüntüsüyle doğrulama yapar; dilerseniz bu değerleri kendi ortamınıza göre güncelleyin.
- Skill'i kendi marka kurallarınıza göre düzenleyebilirsiniz: favori font çiftleriniz, renk paletleriniz veya teslim formatlarınız için `SKILL.md` dosyasını değiştirmeniz yeterli.
