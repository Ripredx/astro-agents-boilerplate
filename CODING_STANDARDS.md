# CODING_STANDARDS.md — Kod Kalitesi ve Modülerlik İlkeleri

Bu dosya, projeye katkıda bulunan herkes (insan veya AI ajan) için geçerlidir. AGENTS.md dosyasındaki teknik/mimari kuralları tamamlar; burada odak kod kalitesi ve sürdürülebilirliktir. Yeni kod yazarken veya mevcut kodu değiştirirken bu ilkelere uy.

## 1. Temel Felsefe

Proje büyüdükçe karmaşıklık artar. Bunu kontrol altında tutmanın tek yolu disiplindir:
her yeni satır kod, "bunu 6 ay sonra başka biri (ya da unutmuş sen) okuduğunda anlar mı?" sorusuna göre yazılır.

Hız için kısa yol arama — "şimdilik böyle çalışsın" mantığı, projeyi 3 ay içinde bakımı imkansız bir yapıya çevirir. Modüler mimarinin tüm faydası, kurallara sürekli uyulmasına bağlıdır; bir kere bozulursa domino etkisi yaratır.

## 2. Tek Sorumluluk Prensibi (SRP)

Her fonksiyon tek bir iş yapar. Bir fonksiyon hem veri çekip hem onu formatlıyorsa, ikiye böl.
Her component tek bir UI parçasını temsil eder. "Bu component hem kart hem modal hem de form davranışı gösteriyor" durumuna asla izin verme.
Bir dosya 200-250 satırı geçiyorsa, muhtemelen birden fazla sorumluluk taşıyordur — böl.

Kontrol sorusu: "Bu fonksiyonu/component'i tek cümleyle ne yaptığını söyleyebiliyor muyum?" Cevap "şunu yapar VE şunu yapar" ise, ayır.

## 3. DRY (Don't Repeat Yourself) — ama akıllıca

Aynı mantık 3. kez yazılıyorsa, artık bir fonksiyona/component'e/hook'a çıkarılmalı.
Ama: İki kod parçası şu an benzer görünüyor diye erken soyutlama yapma. Farklı sebeplerle değişecek şeyleri erken birleştirmek, ileride daha büyük bir kırılmaya yol açar. "3 kere tekrar" kuralı iyi bir eşik.

## 4. İsimlendirme

Değişken/fonksiyon isimleri ne yaptığını açıklamalı, nasıl yaptığını değil.

Kötü: `data`, `handleClick2`, `temp`
İyi: `activeDemoSlug`, `handleContactFormSubmit`, `filteredPortfolioItems`

Boolean değişkenler is, has, should ile başlar: `isLoading`, `hasError`, `shouldAnimate`.
Dosya adı, içindeki ana export ile birebir eşleşmeli (`ContactForm.astro` içinde `ContactForm` component'i olmalı).

## 5. Modülerliği Koruma Kuralları

Yeni bir component eklerken: Mevcut bir component'i "biraz değiştirip" genişletme isteğine karşı dur. Farklı bir sorumluluğu varsa yeni component aç.
Prop arayüzünü sabit tut: Bir component'in prop tipini (interface) sonradan değiştirmek, onu kullanan her yeri etkiler. Yeni ihtiyaç varsa opsiyonel prop ekle, mevcut olanı bozma.
Cross-import yasak: `components/` içinden `pages/api/` mantığına, `content/` içinden kod dosyalarına doğrudan bağımlılık kurma. Bağımlılık akışı tek yönlü olmalı: `pages` → `components`/`lib` → `content`.
Yeni bir "iş mantığı" asla component içine gömülmez — `lib/` altına taşınır. Component sadece görüntüler, karar vermez.

## 6. Fonksiyon ve Kod Bloğu Kuralları

Bir fonksiyonun parametre sayısı 3'ü geçiyorsa, parametreleri bir obje içinde topla.
İç içe (nested) if/else derinliği 3'ü geçmemeli — early return kullan.
Sihirli sayı/string kullanma (`if (status === 3)` yerine `if (status === DemoStatus.PUBLISHED)`), sabitleri isimlendirilmiş şekilde tanımla.
Yorum satırı "neden"i açıklar, "ne"yi değil. Kod zaten neyi yaptığını göstermeli; yorum sadece kararın arkasındaki gerekçeyi (varsa) anlatır.

## 7. Tip Güvenliği (TypeScript)

`any` kullanma. Tip bilinmiyorsa `unknown` kullan ve daralt (narrow et).
Her veri şekli (DemoData, PortfolioItem vb.) types.ts içinde merkezi olarak tanımlanır, dosya içine gömülmez.
Optional chaining (`?.`) ve nullish coalescing (`??`) tercih edilir, manuel `if (x !== undefined && x !== null)` kontrolleri yerine.

## 8. Hata Yönetimi

Hataları sessizce yutma (`catch {}` boş bırakma). En azından logla, mümkünse kullanıcıya anlamlı bir "not found"/"tekrar deneyin" durumu göster.
Dış servis çağrılarında (Supabase, Resend vb.) her zaman try/catch + fallback davranışı tanımla — AGENTS.md'deki dual-mode prensibiyle uyumlu.
Hata mesajlarında hassas bilgi (API key, stack trace, iç yapı detayı) client'a sızdırılmaz.

## 9. Test Edilebilirlik

Yeni bir fonksiyon yazarken "bunu izole şekilde test edebilir miyim?" sorusunu sor. Cevap hayırsa muhtemelen çok fazla dış bağımlılığı vardır — ayrıştır.
UI mantığı ile iş mantığını ayır ki iş mantığı UI olmadan da test edilebilsin.

## 10. Kod İncelemesi Kontrol Listesi (her PR/değişiklik öncesi)

- [ ] Bu değişiklik AGENTS.md'deki klasör yapısına uyuyor mu?
- [ ] Yeni eklenen kod tek bir sorumluluk taşıyor mu?
- [ ] Mevcut bir component/fonksiyonun imzası bozuldu mu? (Bozulduysa neden gerekliydi, açıkla.)
- [ ] `any` tipi kullanılmış mı?
- [ ] Tekrarlanan kod bloğu var mı (3+ kez)?
- [ ] Hata durumları (try/catch, fallback) düşünülmüş mü?
- [ ] İsimlendirme, ne yaptığını açık şekilde anlatıyor mu?

## 11. Ajanlar için Not

Bir AI ajanı olarak kod önerirken:

- Hız kazandırmak adına bu prensiplerden ödün verme — "şimdilik çalışsın" kodu üretme.
- Değişiklik büyükse, önce planı özetle, sonra uygula.
- Bir kuralı ihlal etmen gerekiyorsa (nadiren olur), bunu açıkça belirt ve gerekçesini yaz — sessizce ihlal etme.
