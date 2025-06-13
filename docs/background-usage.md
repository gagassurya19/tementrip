# Background Usage Guide - TemanTrip

## Default Background

Aplikasi TemanTrip menggunakan background default `#F4F7FD` yang diaplikasikan secara global pada semua halaman.

### Global Setup

Background default sudah diatur di `styles/globals.css`:

```css
body {
  @apply bg-brand-background text-foreground;
}
```

Background ini akan otomatis diterapkan ke semua halaman tanpa perlu konfigurasi tambahan.

## Background Variants

### 1. Default Background (`#F4F7FD`)
- Digunakan untuk background utama aplikasi
- Sudah diatur secara global
- Tidak perlu ditambahkan manual ke setiap halaman

### 2. Light Background (`#D5E0F8`)
- Untuk card, section, atau area khusus
- Menggunakan class: `bg-brand-secondary`

### 3. Very Light Background (`#E8F0FE`)
- Untuk area yang butuh kontras lebih halus
- Menggunakan class: `bg-brand-light`

## Penggunaan

### Halaman Normal
Tidak perlu menambahkan background class, karena sudah otomatis menggunakan `#F4F7FD`:

```tsx
export default function MyPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container py-8">
        {/* Content otomatis menggunakan background default */}
      </div>
    </main>
  );
}
```

### Halaman dengan Background Khusus
Jika ingin menggunakan background berbeda, gunakan komponen `PageContainer`:

```tsx
import { PageContainer } from '@/components/ui';

export default function SpecialPage() {
  return (
    <PageContainer background="white" fullHeight>
      <Navbar />
      <div className="container py-8">
        {/* Content dengan background putih */}
      </div>
    </PageContainer>
  );
}
```

### Section dengan Background Berbeda
```tsx
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Section dengan background default (tidak perlu class) */}
      <section className="py-8">
        <h1>Welcome to TemanTrip</h1>
      </section>
      
      {/* Section dengan background light */}
      <section className="py-8 bg-brand-secondary">
        <h2>Featured Destinations</h2>
      </section>
      
      {/* Section dengan background putih */}
      <section className="py-8 bg-white">
        <h2>About Us</h2>
      </section>
    </main>
  );
}
```

## Komponen Helper

### PageContainer
```tsx
// Background default
<PageContainer>
  <YourContent />
</PageContainer>

// Background putih
<PageContainer background="white">
  <YourContent />
</PageContainer>

// Background light
<PageContainer background="light">
  <YourContent />
</PageContainer>

// Tanpa padding
<PageContainer withPadding={false}>
  <YourContent />
</PageContainer>

// Tanpa full height
<PageContainer fullHeight={false}>
  <YourContent />
</PageContainer>
```

### Utility Functions
```tsx
import { getBrandBackgroundClasses } from '@/lib/utils/colors';

// Generate background classes
const bgDefault = getBrandBackgroundClasses('default'); // "bg-brand-background"
const bgLight = getBrandBackgroundClasses('light');     // "bg-brand-secondary"
const bgLighter = getBrandBackgroundClasses('lighter'); // "bg-brand-light"
```

## Best Practices

1. **Default**: Biarkan halaman menggunakan background default tanpa class tambahan
2. **Kontras**: Gunakan background light untuk card/section yang perlu dibedakan
3. **Konsistensi**: Selalu gunakan brand colors yang telah didefinisikan
4. **Testing**: Pastikan text tetap readable di semua background variants

## Troubleshooting

### Background tidak berubah
- Pastikan Tailwind config sudah di-rebuild
- Periksa apakah ada class background lain yang override

### Warna tidak sesuai
- Pastikan menggunakan class `bg-brand-*` yang benar
- Periksa import utilities di file yang diperlukan

### Dark Mode
Background default sudah disiapkan untuk dark mode di konfigurasi CSS variables. 