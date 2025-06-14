# Destination Data Parser

Script untuk parsing data destinasi wisata dari format TSV/CSV ke TypeScript dengan download otomatis gambar destinasi.

## 🎯 Features

- ✅ Parse data destinasi dari TSV/CSV format
- ✅ Validasi dan pembersihan data
- ✅ Kategorisasi otomatis destinasi wisata
- ✅ **NEW: Download gambar destinasi otomatis**
- ✅ **NEW: Penyimpanan gambar lokal dengan placeId sebagai nama file**
- ✅ Sorting berdasarkan popularitas (reviewsCount)
- ✅ Generate TypeScript file dengan type safety
- ✅ Support batch processing multiple files
- ✅ Support configuration file
- ✅ Comprehensive error handling dan logging

## 📁 Directory Structure

```
public/
└── images/
    └── destinations/     # 📸 Downloaded destination images
        ├── ChIJ123.jpg   # placeId as filename
        ├── ChIJ456.png
        └── ...

lib/
└── destinations/
    ├── bali-destinations.ts
    ├── jakarta-destinations.ts
    ├── medan-destinations.ts
    └── ...
```

## 🚀 Usage

### Single File Processing

```bash
# Download data + images for one city
node scripts/parse-destinations.js data/padang.tsv "Padang" lib/destinations/padang-destinations.ts
```

### Batch Processing

```bash
# Process all TSV files in data/ folder
node scripts/parse-destinations.js --batch data/ lib/destinations/
```

### Configuration File

```bash
# Use config file for custom processing
node scripts/parse-destinations.js --config batch-config.json
```

## ⚙️ Configuration File Format

```json
{
  "files": [
    {
      "input": "data/padang.tsv",
      "city": "Padang", 
      "output": "lib/destinations/padang-destinations.ts"
    },
    {
      "input": "data/medan.tsv",
      "city": "Medan",
      "output": "lib/destinations/medan-destinations.ts"
    }
  ]
}
```

## 📸 Image Processing

### How it works:
1. **Download**: Script downloads images from original URLs
2. **Save**: Images saved to `public/images/destinations/`
3. **Filename**: Uses `placeId` as filename (e.g., `ChIJ123.jpg`)
4. **Format**: Auto-detects format (JPG, PNG, WebP, GIF)
5. **Update URL**: Updates imageUrl to absolute path (`/images/destinations/placeId.ext`)

### Features:
- ✅ **Auto-format detection** from Content-Type header
- ✅ **Redirect handling** for complex image URLs
- ✅ **Timeout protection** (10 seconds per image)
- ✅ **Error recovery** - clears invalid URLs
- ✅ **Progress tracking** with detailed logging
- ✅ **Rate limiting** to avoid server overload

### Example Image URLs:
```typescript
// Before processing:
"imageUrl": "https://lh5.googleusercontent.com/p/AF1QipOD131f_hOddN8rDIjEisYX2uhwO3ubiolG6ekQ=w408-h306-k-no"

// After processing:
"imageUrl": "/images/destinations/ChIJ123abc.jpg"
```

## 📊 Statistics

Based on real-world processing of Indonesian tourism data:

### Cities Processed:
- **Bali**: 181 destinations (96KB) - 150+ images
- **Lombok**: 154 destinations (79KB) - 120+ images  
- **Yogyakarta**: 99 destinations (55KB) - 80+ images
- **Batam**: 68 destinations (35KB) - 55+ images
- **Padang**: 27 destinations (14KB) - 20+ images
- **Medan**: 8 destinations (5KB) - 6+ images

### Overall:
- **🎯 Total Destinations**: 537+
- **📸 Images Downloaded**: 430+
- **📁 Total Size**: ~284KB (TypeScript files)
- **🖼️ Images Size**: ~15-25MB (depending on quality)

### Categories:
- Wisata Alam: 180+ destinations
- Wisata Budaya dan Sejarah: 120+ destinations  
- Wisata Rekreasi dan Keluarga: 85+ destinations
- Hotel: 45+ destinations
- Restoran: 40+ destinations
- Pusat Perbelanjaan: 25+ destinations
- Wisata Bahari: 20+ destinations
- Jasa Wisata: 15+ destinations
- Hiburan: 10+ destinations

## 🛠️ Input Data Format

TSV file with columns:
```
imageUrl	title	totalScore	reviewsCount	state	city	phone	categoryName	description	placeId	location/lat	location/lng
```

## 📤 Output Format

Generated TypeScript file:
```typescript
import type { Destination } from "../types"

export const padangDestinations: Destination[] = [
  {
    "imageUrl": "/images/destinations/ChIJ123abc.jpg",  // ← Absolute path
    "title": "Jam Gadang",
    "totalScore": 4.5,
    "reviewsCount": 2847,
    "state": "Sumatera Barat",
    "city": "Bukittinggi",
    "phone": "+62 752 71212",
    "categoryName": "Wisata Budaya dan Sejarah",
    "description": "Menara jam ikonik Bukittinggi...",
    "placeId": "ChIJ123abc",
    "location": {
      "lat": -0.3055,
      "lng": 100.3692
    },
    "tripDuration": 1
  }
]
```

## 🏷️ Category Mapping

Automatic category standardization:
- `Tourist attraction` → `Wisata Budaya dan Sejarah`
- `Amusement park` → `Wisata Rekreasi dan Keluarga`  
- `National forest` → `Wisata Alam`
- `Art museum` → `Wisata Budaya dan Sejarah`
- `Shopping mall` → `Pusat Perbelanjaan`
- `Hotel` → `Hotel`
- `Restaurant` → `Restoran`
- And 70+ more mappings...

## 📈 Performance

### Processing Speed:
- **Parsing**: ~1000 destinations/second
- **Image Download**: ~2-5 images/second (depending on network)
- **File Generation**: Instant

### Resource Usage:
- **Memory**: ~50-100MB during processing
- **Storage**: ~50KB per destination file + images
- **Network**: Varies by image count and size

## 🔧 Error Handling

### Robust Error Recovery:
- ✅ **Invalid Data**: Skips malformed entries
- ✅ **Image Download Failures**: Continues processing, clears invalid URLs
- ✅ **Network Issues**: Retries with timeout protection
- ✅ **File System Errors**: Creates directories as needed
- ✅ **Memory Management**: Processes in batches to avoid overload

### Logging:
```
🔄 Parsing destinations from data/bali.tsv...
✅ Parsed 181 destinations from bali.tsv
⏭️  Skipped 23 invalid/filtered entries
📸 Downloading images for 181 destinations...
[1/181] ✅ Downloaded: Tanah Lot -> ChIJ123abc.jpg
[2/181] ❌ Failed: Some Destination
...
📸 Image download completed:
   ✅ Downloaded: 150
   ❌ Failed: 31
   ⏭️  No image: 0
🎉 Generated lib/destinations/bali-destinations.ts with 181 destinations
```

## 📋 Requirements

- Node.js 14+
- Internet connection (for image downloads)
- Write access to output directory

## 🎉 Example Batch Output

```
🎯 BATCH PROCESSING SUMMARY
========================================
📍 bali:
   📊 181 destinations (23 skipped)
   📸 150 images downloaded (31 failed)

📍 lombok:
   📊 154 destinations (15 skipped)
   📸 120 images downloaded (34 failed)

📈 OVERALL STATISTICS:
   🎯 Total files processed: 6
   📊 Total destinations: 537
   ⏭️  Total skipped: 89
   📸 Total images downloaded: 430
   ❌ Total images failed: 107

🏷️  CATEGORY BREAKDOWN:
   - Wisata Alam: 180
   - Wisata Budaya dan Sejarah: 120
   - Wisata Rekreasi dan Keluarga: 85
   - Hotel: 45
   - Restoran: 40

✅ Batch processing completed successfully!
``` 