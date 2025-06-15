# 🌍 TemanTrip - Travel Planner

> **Aplikasi perencanaan perjalanan dengan AI dan integrasi Supabase**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.50.0-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blue)](https://tailwindcss.com/)

## ✨ Fitur Utama

### 🤖 **AI-Powered Itinerary Generation**
- Generate itinerary perjalanan menggunakan Google Gemini AI
- Personalisasi berdasarkan preferensi, budget, dan durasi
- Integrasi dengan wishlist destinasi

### 📝 **Manual Itinerary Planning**
- Buat itinerary manual dengan destinasi pilihan sendiri
- Drag & drop interface untuk mengatur urutan destinasi
- Integrasi dengan Google Maps untuk lokasi

### 💾 **Persistent Data Storage**
- Integrasi penuh dengan Supabase database
- User-specific data dengan Row Level Security
- Real-time sync antar device

### 🔐 **User Authentication**
- Secure authentication dengan Supabase Auth
- User profiles dan preferences
- Protected routes dan data isolation

### 📱 **Modern UI/UX**
- Responsive design untuk semua device
- Dark/Light theme support
- Smooth animations dan transitions
- Accessible components dengan Radix UI

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Supabase account

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/gagassurya19/tementrip.git
   cd tementrip
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Isi file `.env` dengan:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Setup database**
   - Buka Supabase Dashboard → SQL Editor
   - Jalankan script dari `scripts/supabase-setup.sql`

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:3000
   ```

## 📁 Struktur Project

```
teman-trip/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── itinerary/    # Itinerary CRUD operations
│   │   └── gemini/       # AI integration
│   ├── itinerary/        # Itinerary pages
│   └── ...
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── itinerary/        # Itinerary-specific components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
├── contexts/             # React contexts
├── scripts/              # Database scripts
└── public/               # Static assets
```

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Maps**: Google Maps API, Leaflet

### **Backend**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **AI**: Google Gemini API

### **Development**
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Version Control**: Git

## 📊 Database Schema

### **Users Table**
```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  preferences JSONB,
  created_at TIMESTAMP
)
```

### **Itineraries Table**
```sql
itineraries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('manual', 'ai')),
  destination TEXT,
  duration TEXT,
  interests TEXT[],
  budget TEXT,
  trip_type TEXT,
  data JSONB,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🔧 Development

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run clean        # Clean build files
```

### **Code Style**
- ESLint configuration untuk code quality
- TypeScript untuk type safety
- Prettier untuk code formatting
- Conventional commits untuk git history

## 🚀 Deployment

### **Vercel (Recommended)**
1. Push code ke GitHub
2. Connect repository di Vercel
3. Set environment variables
4. Deploy automatically

### **Manual Deployment**
```bash
npm run build
npm run start
```

## 🔒 Security

- **Row Level Security (RLS)** untuk data isolation
- **Input validation** di semua API endpoints
- **Type safety** dengan TypeScript
- **Environment variables** untuk sensitive data
- **CORS configuration** untuk production

## 📈 Performance

- **Server-side rendering** dengan Next.js
- **Image optimization** dengan Next.js Image
- **Code splitting** automatic
- **Database indexing** untuk query optimization
- **Caching strategies** untuk API responses

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Gagassurya19**
- GitHub: [@gagassurya19](https://github.com/gagassurya19)
- Website: [tementrip.gagas.me](https://tementrip.gagas.me)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Google Gemini](https://ai.google.dev/) - AI integration
- [Vercel](https://vercel.com/) - Deployment platform

---

<div align="center">
  <p>Made with ❤️ by Gagassurya19</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div> 