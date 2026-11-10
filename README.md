# sadece-tasarim

Bu repo, grafik tasarımcıların, freelance influencer'ların ve dijital pazarlamacıların iş akışlarını hızlandırmak için kurulmuştur.

**Bu repo sizi hızlandırır, işinizi elinizden almaz.**

`sadece-tasarim`, Claude'un Photoshop ve Illustrator'da profesyonel bir grafik tasarımcı gibi çalışmasını sağlayan bir skill'dir. Tekrarlanan kurulum işlerini (belge açma, görsel yerleştirme, renk eşitleme, ışık/vinyet/grain katmanları, story ve post formatları) Claude üstlenir; yaratıcı kararlar ve son dokunuş sizde kalır. Tüm dosyalar katmanlı teslim edilir, istediğiniz her şeyi elle değiştirebilirsiniz.

## Neler yapar?

- Instagram **story (1080x1920)**, **post (1080x1350)** ve **carousel** tasarımlarını aynı tasarım dilinde, ayrı ayrı kompoze eder
- Her format için katmanlı **.psd** ve önizleme **.png** üretir. Görseller akıllı nesne, renk düzeltmeleri ayar katmanı, metinler düzenlenebilir metin katmanı olarak kalır
- Farklı kaynaklardan gelen görselleri tek bir renk dünyasında birleştirir (eğriler, renk dengesi, canlılık, ışık, vinyet, grain)
- Başlık, alt başlık ve logo hiyerarşisini kurar; story ve post güvenli alanlarını korur
- Fontları Türkçe karakterler için denetler (Ş, İ, ı, ğ eksik ya da bozuk fontu baştan yakalar)
- Logo ve marka işlerinde Behance'ten 3-5 referansı analiz eder, kopyalamadan kendi özgün tasarımını üretir
- **Marka kimliği** ([brand-identity](https://github.com/fatihaydost/brand-identity-skill) ile): logo, font ve renk paletini tek bir fikirden birlikte kuran 3 aday set; kontrast (WCAG 2.2), renk körlüğü, Türkçe glif, font lisansı ve 16/32 px logo ölçümleri; seçtiğiniz set için PDF marka kılavuzu, logo dosyaları ve tokenlar
- Seçilen kimliği **düzenlenebilir Illustrator marka dosyasına** çevirir (her logo sürümü ayrı artboard'da vektör, marka renk örnek grubu, küçük boyut testleri) ve story/post şablonlarına marka renk, logo ve fontlarını taşır
- Mevcut kimliğinizi puan vermeden eleştirir: ölçülen kapılar, bileşen bulguları ve etkisi ölçülmüş üç değişiklik
- Yazı-zemin kontrastını ölçer; fotoğraf üstündeki yazıda da (`kontrast.py`)
- Yapay zekâ klişelerini (Fraunces + Inter, krem-terrakota-altın, lacivert-altın, gizli harf + daire logo...) yakalar, gerekçe ister
- Illustrator'da çoklu artboard, logo vektörleştirme (Image Trace) ve .ai / .svg / .pdf / .png dışa aktarım yapar
- Açık belgelerinize ve orijinal dosyalarınıza dokunmaz

## Gereksinimler

- **Claude Code** (Claude masaüstü uygulamasının Code sekmesi ya da terminal)
- **Windows** + **Adobe Photoshop** ve/veya **Adobe Illustrator** (2026 ve 2027 sürümlerinde denendi)
- Kullanacağınız fontların bilgisayarınızda veya Adobe Fonts'ta etkin olması
- Marka kimliği modu için (isteğe bağlı): [brand-identity](https://github.com/fatihaydost/brand-identity-skill) skill'i `~/.claude/skills/brand-identity` altında, Python 3.10+, Chrome/Edge ve tercihen [uv](https://docs.astral.sh/uv/). Denetim: `python ~/.claude/skills/brand-identity/scripts/brand.py check`

Ekran kontrolü (computer use) **gerekmez**: Claude, Photoshop ve Illustrator'ı Windows'un COM arayüzüyle betik çalıştırarak yönetir. macOS için `run_jsx.sh` eklendi ama henüz denenmedi.

## Kurulum

**1. Repoyu indirin**

```bash
git clone https://github.com/makifbulgucu/sadece-tasarim.git
```

Git kullanmıyorsanız GitHub sayfasındaki **Code > Download ZIP** ile de indirebilirsiniz.

**2. Skill'i Claude'a ekleyin**

- **Claude Code:** Reponun içindeki `sadece-tasarim` klasörünü (içinde `SKILL.md`, `scripts/`, `references/` olan klasör) `~/.claude/skills/` altına kopyalayın. Sonuç: `~/.claude/skills/sadece-tasarim/SKILL.md`
- **Claude uygulaması:** `sadece-tasarim` klasörünü zip'leyin ve Ayarlar'daki Skills bölümünden yükleyin. Betikler bilgisayarınızdaki Photoshop'u çalıştırdığı için tam akış Claude Code'da çalışır.

Skill'i güncellerken klasörün tamamını değiştirin; yalnızca `SKILL.md`'yi kopyalamak `scripts/` klasörünü eski bırakır.

## Nasıl kullanılır?

**1. Malzemeleri hazırlayın.** Claude'a şunları verin:

| Malzeme | Örnek |
|---|---|
| Ana görsel(ler) | Ürün fotoğrafı, mekân, portre |
| Başlık metni | Yazdığınız gibi kullanılır, büyük/küçük harf değişmez |
| Alt başlık metni | Kısa açıklama veya slogan |
| Başlık ve alt başlık fontu | Adobe Fonts'taki font adları |
| Logo | Tercihen şeffaf PNG; koyu ve açık sürüm varsa ikisi de |
| Format | Story, post, carousel |

Eksik bir şey varsa Claude en makul varsayımla ilerler ve bunu size söyler; gerçekten kritikse tek bir kısa soru sorar.

**2. Skill'i çağırın.** Sohbette `/sadece-tasarim` yazın ya da işi doğrudan anlatın:

> 29 Ekim için story ve post hazırla. Görseller ve logo ekte. Başlık: "Cumhuriyet'in 103. Yılı", alt başlık: "Nice yıllara". Başlık fontu ITC Avant Garde Bold, alt başlık Comma Serif Italic.

**3. Claude çalışır:**

1. Kısa bir tasarım kararı verir (konsept, 2-3 ana renk, tipografik hiyerarşi)
2. Proje klasörünü kurar, dosyalarınızın kopyalarıyla çalışır
3. Fontları denetler, Türkçe karakter sorununu baştan söyler
4. Tasarımı bir betikle Photoshop'ta katman katman kurar
5. Önizlemeleri kalite listesiyle kendisi kontrol eder (yazı-görsel çakışması, güvenli alan, logo okunurluğu, renk dengesi) ve gerekirse düzeltir

**4. Son dokunuşu siz yapın.** Belgeler Photoshop'ta açık ve katmanlı bırakılır. Görsel, Işık & Gölge, Metin ve Logo grupları ile en üstte Grain ayrıdır; dilediğinizi kaydırın, değiştirin ya da kapatın.

## Klasör yapısı

```
sadece-tasarim/
  SKILL.md                 Claude'un izlediği iş akışı ve kurallar
  scripts/
    lib.jsx                Photoshop yardımcı kütüphanesi (SD.*)
    lib_ai.jsx             Illustrator yardımcı kütüphanesi (AI.*)
    ornek_build.jsx        story + post örnek betiği (her işte buradan başlanır)
    probe_fonts.jsx        font listesi + Türkçe karakter örnek görseli
    marka_aktar.py         brand-identity kitini projeye aktarır (logolar, renkler, fontlar -> marka_veri.jsx)
    marka_ai.jsx           kitten düzenlenebilir Illustrator marka dosyası kurar
    kontrast.py            WCAG kontrast ölçümü (renk çifti ya da PNG üstündeki yazı alanı)
    run_jsx.ps1            Windows: betiği COM ile çalıştırır, Türkçe metni korur
    run_jsx.sh             macOS: osascript ile çalıştırır (denenmedi)
  references/
    tuzaklar.md            karşılaşılan hatalar ve çözümleri
    marka-kimligi.md       logo/marka akışı, tasarım ilkeleri, ölçüm araçları, eleştiri şablonu
```

Betikleri elle de çalıştırabilirsiniz:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File sadece-tasarim\scripts\run_jsx.ps1 -Script "C:\Proje\_script\build.jsx"
```

## İpuçları

- Düşük çözünürlüklü görseller gereksiz büyütülmez. Büyütme gerekirse Claude bunu açıkça söyler.
- Görselde başka birinin filigranı veya imzası varsa Claude sizi uyarır (kredi gerekebilir).
- Teslimden sonra PSD'yi elle düzenlediyseniz Claude yeniden kurmadan önce sorar ve eski dosyayı `psd/_yedek/` altına alır.
- Skill'i kendi marka kurallarınıza göre düzenleyebilirsiniz: favori font çiftleriniz, renk paletleriniz veya teslim formatlarınız için `SKILL.md` dosyasını değiştirmeniz yeterli.

## Sürümler

Değişiklikler için [CHANGELOG.md](CHANGELOG.md) dosyasına bakın.

## Teşekkür

Marka kimliği modu, Fatih Aydost'un [brand-identity](https://github.com/fatihaydost/brand-identity-skill) skill'ini (MIT) kullanır; ilkeler ve ölçüm kapıları oradan uyarlanmıştır.

## Lisans

[MIT](LICENSE)
