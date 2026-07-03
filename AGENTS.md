# AGENTS.md — Boilerplate Geliştirme Kuralları

> Bu dosya, bu proje üzerinde çalışan yapay zeka ajanları (Claude, Antigravity, Cursor vb.) için bağlayıcı kural setidir. Kod önerirken veya değişiklik yaparken buradaki kurallara uy. Kurallardan sapman gerekiyorsa önce sebebini açıkla, sonra öner.

---

## 1. Tech Stack (sabit — değiştirilmez)

| Katman | Teknoloji | Not |
|---|---|---|
| Framework | Astro (`output: 'server'`) | Hibrit SSR/SSG |
| Stil | Tailwind CSS (Vite eklentisi) | Utility-first, custom CSS minimum |
| Animasyon | GSAP (ScrollTrigger, Timeline) | Her component kendi animasyonundan sorumlu |
| Kaydırma | Lenis | GSAP ticker'ı ile senkron |
| Veritabanı | Supabase | Dual-mode: env yoksa mock data'ya düşer |
| E-posta | Resend | Transaksiyonel mailler için |
| Rate Limit | Upstash + Vercel KV | IP bazlı sliding window |
| Barındırma | Vercel | Serverless Functions + Edge CDN + ISR |
| Tip Sistemi | TypeScript (strict) | `any` kullanma, `strictNullChecks` açık |
| Paket Yöneticisi | pnpm | npm/yarn kullanma |

Bu stack'i sorgusuz sualsiz değiştirme. Farklı bir kütüphane önereceksen önce neden mevcut stack'in yetersiz kaldığını açıkla.

---

## 2. Klasör Yapısı ve Sorumluluk Ayrımı

```
src/
├── components/     # SADECE UI. Business logic yok, veri çekme yok.
├── layouts/        # Sayfa şablonları (SEO, JSON-LD, global script yüklemeleri)
├── pages/          # Dosya tabanlı routing
│   └── api/        # SADECE backend mantığı, JSX/HTML yok
├── content/        # SADECE veri (Markdown + frontmatter). Kod yok.
├── lib/            # İş mantığı, veri erişim katmanı, yardımcı fonksiyonlar
└── styles/         # Design token'ları ve global stiller
```

**Kural:** Bir component'in içine veri çekme mantığı (fetch, Supabase sorgusu) yazma — `lib/`'e taşı, component sadece prop alsın. Bir API dosyasının içine UI mantığı yazma.

**Kural:** Yeni bir "şey" eklerken önce hangi klasöre ait olduğunu belirle. Emin değilsen sorma, en izole seçeneği seç (yeni component > mevcut component'i şişirmek).

---

## 3. Component Prensipleri

- Her component kendi `<script>` bloğunda **izole** animasyon/etkileşim mantığı barındırır. Global state'e bağımlı olmasın.
- Mevcut bir component'in **prop imzasını (interface/type) değiştirme**. Yeni ihtiyaç için ya yeni opsiyonel prop ekle ya da yeni component oluştur. (Geriye dönük uyumluluk kritik — bu component başka yerlerde de kullanılıyor olabilir.)
- Kart, modal, buton gibi tekrar eden UI parçalarını en baştan generic yaz (renk/metin dışarıdan prop olarak gelsin), hardcode etme.

---

## 4. Animasyon Lifecycle Kuralları (GSAP + Lenis)

- Her `ScrollTrigger` instance'ı, Astro'nun View Transitions kullanıyorsa `astro:before-swap` event'inde **mutlaka `kill()` edilmeli**. Aksi halde sayfa geçişlerinde animasyon birikimi (memory leak) olur.
- `astro:page-load` event'inde Lenis `resize()` çağrılmalı ki kaydırma koordinatları sıfırlansın.
- Preloader sadece ilk ziyarette gösterilir; SPA geçişlerinde tekrar tetiklenmemeli (`window.hasSeenPreloader` gibi bir flag kullan).
- Fontlar yüklenmeden animasyon başlatma — `document.fonts.ready` bekle.
- Animasyonlu öğelerde `will-change: transform, opacity` kullan, gereksiz yere her elemente ekleme (performans maliyeti var).

---

## 5. Güvenlik Pattern'leri (form/API içeren her projede uygula)

1. **Rate limiting** — IP bazlı, saatlik/dakikalık istek limiti.
2. **Honeypot** — formlara gizli bir alan ekle; doluysa isteği sessizce reddet (kullanıcıya 200 OK dön, işlem yapma).
3. **Regex doğrulama** — e-posta, telefon gibi alanları sunucu tarafında da doğrula (client-side yeterli değil).
4. **Silent fail prensibi** — spam/kötüye kullanım tespit edildiğinde kullanıcıya başarı mesajı göster ama işlemi yapma. Saldırgana filtreyi öğretme.
5. API endpoint'lerinde asla hassas hata detayını client'a döndürme (stack trace, env değişkeni vb.)

---

## 6. Veri Katmanı — Dual-Mode Prensibi

- Dış servise (Supabase, herhangi bir API) bağımlı her veri katmanı **mock fallback** ile yazılmalı.
- Env değişkeni tanımlı değilse mock data'dan dönülsün, geliştirme ortamı dış servise bağımlı kalmasın.
- Hata durumunda uygulama çökmemeli — `null`/boş state dönülüp uygun "not found" komponenti render edilmeli.

---

## 7. Performans Standartları

- Statik sayfalar `export const prerender = true` ile build-time üretilir.
- ISR gereken sayfalarda `Cache-Control: s-maxage=3600, stale-while-revalidate=86400` kullan.
- Görselleri Astro'nun dahili image optimizasyonu (Sharp) üzerinden geçir, doğrudan `<img>` ile raw dosya kullanma.
- `overflow-x: clip` ile mobil yatay kaymayı önle.
- Hedef: 60fps, "zero-jank" — ağır animasyonları `requestAnimationFrame` / GSAP ticker dışına taşıma.

---

## 8. İçerik-Kod Ayrımı

- Metin, portfolyo, hizmet gibi tekrar değişen içerikler `content/` altında Markdown + frontmatter olarak tutulur, koda gömülmez.
- Her content koleksiyonu `content.config.ts`'de Zod şemasıyla doğrulanır. Şemasız/validasyonsuz içerik ekleme.

---

## 9. Ajan Davranış Kuralları (AI için özel)

- Yeni bir özellik isteneceği zaman önce mevcut klasör yapısına uygun mu diye kontrol et, uymuyorsa kullanıcıya söyle.
- Konfigürasyon dosyalarını (`astro.config.mjs`, `tsconfig.json`) gerekçesiz değiştirme.
- Yeni bir bağımlılık eklemeden önce mevcut stack'te karşılığı olup olmadığını kontrol et (örn. yeni bir animasyon kütüphanesi önerme, GSAP zaten var).
- Değişiklik sonrası kısa bir özet ver: ne değişti, hangi dosyalar etkilendi, geriye dönük uyumluluk riski var mı.