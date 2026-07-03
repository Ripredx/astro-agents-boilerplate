# Astro Agents Boilerplate

Bu proje, yapay zeka ajanları (Antigravity, Claude, Cursor vb.) için tanımlanmış sıkı kuralları barındıran, yüksek performanslı ve modern bir web uygulama iskeletidir (boilerplate). Öncelikli amacı kod şişkinliğini önlemek, tam tip güvenliği sağlamak (Zero-Jank ve Any-Free) ve ajanların standartlara (FSD) %100 uymasını zorunlu kılmaktır.

## 🚀 Teknolojik Yığın (Tech Stack)

| Teknoloji | Görev / Kullanım Amacı |
| :--- | :--- |
| **Astro** | Hibrit SSR/SSG framework (`output: 'server'`). |
| **Tailwind CSS v4** | Vite eklentisi olarak entegre, Utility-first styling. |
| **GSAP + Lenis** | Performanslı animasyonlar ve pürüzsüz kaydırma deneyimi. |
| **Supabase** | Veritabanı ve Auth. Dual-mode veri akışı için ayarlandı. |
| **Upstash + Vercel KV** | Rate limiting ve güvenlik önlemleri. |
| **TypeScript** | Strict mode aktif, `any` kullanımı kesinlikle yasak. |
| **pnpm** | Hızlı paket yönetimi ve workspace mimarisi. |
| **Vercel** | Edge CDN ve Serverless/ISR barındırma hedeflendi. |

## 📁 Klasör Mimarisi (FSD Uyumlu)

Mimari, bileşenlerin sorumluluklarını kesin çizgilerle ayırır:

```
src/
├── components/     # SADECE UI. İş mantığı (fetch/Supabase) yasaktır.
├── content/        # Markdown ve veriler (Zod ile tip güvenliği sağlanmış).
├── layouts/        # Global script yüklemeleri, SEO ve Base yapıları.
├── lib/            # İş mantığı, GSAP/Lenis kurulumları, veritabanı erişimi.
├── pages/          # Dosya tabanlı route'lar (örn. index.astro)
│   └── api/        # SADECE backend mantığı (örn. contact.ts), JSX/HTML yasak.
└── styles/         # Tailwind CSS ve custom CSS değişkenleri (token'lar).
```

## ⚙️ Kurulum ve Kullanım

### 1. Bağımlılıkların Yüklenmesi
```bash
pnpm install
```

### 2. Geliştirme Sunucusu (Dev Server)
```bash
pnpm dev
```

### 3. Derleme ve Tip Kontrolü (Build & Check)
Projede ölü kod bırakılmaması ve `any` kullanılmaması kuralı nedeniyle derlemeden önce her zaman tip doğrulama yapılmalıdır:
```bash
pnpm build  # Arkada otomatik olarak "astro check" çalıştırır
```

## 🛡️ Temel Kurallar (Agents Rulebook)

1. **İzole UI Bileşenleri:** Bir `.astro` component'i içine veri çekme (`fetch`) mantığı yazılmamalıdır; bu işlemler `lib/` altına alınmalı ve UI'a prop geçilmelidir.
2. **Animasyon (Memory Leak Önleme):** `src/lib/gsap-setup.ts` içerisindeki kurallara göre, her sayfa geçişinde (Astro view transitions) `astro:before-swap` tetiklendiğinde `ScrollTrigger.kill()` çalıştırılarak animasyonlar temizlenir.
3. **Güvenlik (API):** `src/pages/api/` içerisindeki uç noktalarda; IP tabanlı Rate-Limit ve Honeypot form doğrulamaları (Silent Fail prensibi ile) standarttır.
4. **Zorunlu Fallback (Mock Data):** Çevresel değişkenler (.env) bulunmadığı zaman uygulama çökmeyecek şekilde "mock data" geri dönüşü sağlanır.
