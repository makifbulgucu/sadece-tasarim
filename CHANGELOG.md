# Değişiklikler

## 2.0.0 (2026-11-09)

Skill baştan düzenlendi; tek dosyalık talimattan, denenmiş betiklerle gelen bir pakete dönüştü.

**Düzeltilen hatalar**
- Talimatlar Claude Code'da olmayan araç adlarına (`device_bash`, `computer_resolve_access` vb.) dayanıyordu; Claude Code araçlarına göre yeniden yazıldı.
- Betikler sabit menü koordinatlarıyla (Dosya > Komut Dosyaları) çalıştırılıyordu. Artık COM ile ekran kontrolü olmadan çalışıyor; ekran kontrolü yalnızca yedek yol.
- "En başta açık belgeleri kapat" kuralı kullanıcının kaydedilmemiş belgelerini silebiliyordu. Artık yalnızca betiğin kendi ürettiği, kaydedilmiş belge kapatılıyor.
- Renk düzeltmeleri pikselleri kalıcı değiştiriyordu; artık düzenlenebilir ayar katmanı (Eğriler, Renk Dengesi, Canlılık, Düzeyler, Parlaklık/Kontrast).
- Görseller kopyala-yapıştırla düz piksele dönüşüyordu; artık gömülü akıllı nesne.
- Betik Photoshop birim ve diyalog tercihlerini değiştirip bırakıyordu; artık geri yüklüyor.

**Yeni**
- `scripts/lib.jsx`: Photoshop yardımcı kütüphanesi (belge, grup, akıllı nesne, maske, Konuyu Seç, ayar katmanları, vektör yuvarlak dikdörtgen, ışık/vinyet/grain, alt gölge efekti, metin, kaydetme).
- `scripts/lib_ai.jsx`: Illustrator kütüphanesi (çoklu artboard, şekil, metin, yerleştirme, Image Trace, PNG/SVG/PDF/AI).
- `scripts/run_jsx.ps1`: Türkçe metni otomatik `\uXXXX`'e çeviren, Photoshop'u öne alan çalıştırıcı. `scripts/run_jsx.sh` (macOS, denenmedi).
- `scripts/probe_fonts.jsx`: font listesi + Türkçe karakter örnek görseli.
- `scripts/ornek_build.jsx`: story + post başlangıç betiği.
- `references/tuzaklar.md`: bilinen hatalar ve çözümleri.
- Carousel formatı, story alt güvenli alanı (340 px), post için 3:4 ızgara payı, sRGB teslim, klasör düzeni, kalite kontrol listesi, teslim sonrası yerinde güncelleme ve yedekleme kuralı.
- Daha iyi tetiklenen açıklama (description).

## 1.0.0 (2026-11-06)

İlk sürüm: tek `SKILL.md`.
