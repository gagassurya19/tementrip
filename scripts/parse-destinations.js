#!/usr/bin/env node

/**
 * Script untuk parsing data destinasi dari format tabular ke JSON
 * Usage: 
 *   Single file: node scripts/parse-destinations.js <input-file> <city-name> <output-file>
 *   Multiple files: node scripts/parse-destinations.js --batch <input-folder> <output-folder>
 *   Config file: node scripts/parse-destinations.js --config <config-file>
 * 
 * Format input harus TSV (Tab Separated Values) dengan kolom:
 * imageUrl, title, totalScore, reviewsCount, state, city, phone, categoryName, description, placeId, location/lat, location/lng
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Fungsi untuk download image
async function downloadImage(url, filepath) {
  if (!url || url === '') return null;
  
  try {
    const client = url.startsWith('https:') ? https : http;
    
    return new Promise((resolve, reject) => {
      const request = client.get(url, (response) => {
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          downloadImage(response.headers.location, filepath)
            .then(resolve)
            .catch(reject);
          return;
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }
        
        // Determine file extension from content-type or URL
        const contentType = response.headers['content-type'] || '';
        let extension = '.jpg'; // default
        
        if (contentType.includes('image/png')) extension = '.png';
        else if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) extension = '.jpg';
        else if (contentType.includes('image/webp')) extension = '.webp';
        else if (contentType.includes('image/gif')) extension = '.gif';
        else if (url.includes('.png')) extension = '.png';
        else if (url.includes('.webp')) extension = '.webp';
        else if (url.includes('.gif')) extension = '.gif';
        
        const finalPath = filepath + extension;
        const file = fs.createWriteStream(finalPath);
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve(extension);
        });
        
        file.on('error', (err) => {
          fs.unlink(finalPath, () => {}); // Delete the file on error
          reject(err);
        });
      });
      
      request.on('error', reject);
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
    
  } catch (error) {
    console.warn(`⚠️  Failed to download image from ${url}: ${error.message}`);
    return null;
  }
}

// Fungsi untuk create images directory
function ensureImagesDirectory() {
  const imagesDir = path.join(process.cwd(), 'public', 'images', 'destination');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log(`📁 Created images directory: ${imagesDir}`);
  }
  return imagesDir;
}

// Fungsi untuk menentukan tripDuration berdasarkan kategori
function getTripDuration(categoryName) {
  const category = categoryName.toLowerCase();
  
  // Hotel, restoran, cafe = 0 hari (bukan destinasi wisata utama)
  if (category.includes('hotel') || 
      category.includes('restoran') || 
      category.includes('restaurant') ||
      category.includes('cafe') || 
      category.includes('coffee') ||
      category.includes('coffe')) {
    return 0;
  }
  
  // Pusat perbelanjaan, sekolah = 0-1 hari
  if (category.includes('shopping') || 
      category.includes('perbelanjaan') ||
      category.includes('school') ||
      category.includes('pendidikan') ||
      category.includes('clothing store')) {
    return 1;
  }
  
  // Destinasi wisata alam yang besar = 2-3 hari
  if (category.includes('taman impian') ||
      category.includes('ancol') ||
      category.includes('safari') ||
      category.includes('mini indonesia')) {
    return 2;
  }
  
  // Default untuk tempat wisata = 1 hari
  return 1;
}

// Fungsi untuk membersihkan dan menyesuaikan nama kategori
function cleanCategoryName(categoryName) {
  if (!categoryName) return 'Wisata Umum';
  
  const cleanName = categoryName.trim();
  
  // Mapping kategori umum
  const categoryMapping = {
    'Amusement park': 'Wisata Rekreasi dan Keluarga',
    'Area Mendaki': 'Wisata Alam',
    'Area Rekreasi Alam': 'Wisata Alam',
    'Art museum': 'Wisata Budaya dan Sejarah',
    'Barber shop': 'Layanan',
    'Beautiful big tree': 'Wisata Alam',
    'Biro Wisata': 'Jasa Wisata',
    'Café': 'Restoran',
    'Cagar Alam': 'Wisata Alam',
    'Cagar alam nasional': 'Wisata Alam',
    'Camping farm': 'Wisata Alam',
    'Children\'s amusement center': 'Wisata Rekreasi dan Keluarga',
    'Chinese restaurant': 'Restoran',
    'City park': 'Wisata Alam',
    'Clothing store': 'Pusat Perbelanjaan',
    'Coffee Shop': 'Restoran',
    'Creative Space': 'Layanan',
    'Department store': 'Pusat Perbelanjaan',
    'Desa Wisata': 'Wisata Budaya dan Sejarah',
    'English language school': 'Pusat Pendidikan',
    'Family restaurant': 'Restoran',
    'Guest house': 'Hotel',
    'Guesthouse': 'Hotel',
    'hiking area': 'Wisata Alam',
    'Hiking Area': 'Wisata Alam',
    'Home improvement store': 'Layanan',
    'Hotel': 'Hotel',
    'Hypermarket': 'Pusat Perbelanjaan',
    'Japanese restaurant': 'Restoran',
    'Jembatan': 'Wisata Budaya dan Sejarah',
    'Kampung Wisata': 'Wisata Budaya dan Sejarah',
    'Karaoke bar': 'Hiburan',
    'Kebun Binatang': 'Wisata Rekreasi dan Keluarga',
    'Konservasi Alam': 'Wisata Alam',
    'Lounge': 'Hiburan',
    'Modern art museum': 'Wisata Budaya dan Sejarah',
    'Movie theater': 'Hiburan',
    'Museum': 'Wisata Budaya dan Sejarah',
    'Museum Sains': 'Wisata Budaya dan Sejarah',
    'Museum Seni': 'Wisata Budaya dan Sejarah',
    'National forest': 'Wisata Alam',
    'National museum': 'Wisata Budaya dan Sejarah',
    'Nature preserve': 'Wisata Alam',
    'Objek Wisata': 'Wisata Umum',
    'Organisasi': 'Layanan',
    'Organisasi Nonprofit': 'Layanan',
    'Pantai': 'Wisata Alam',
    'Pasar Tradisional dan Pusat Budaya': 'Wisata Budaya dan Sejarah',
    'Penyelenggara Perjalanan': 'Jasa Wisata',
    'Playground': 'Wisata Rekreasi dan Keluarga',
    'Rail museum': 'Wisata Budaya dan Sejarah',
    'Recreation center': 'Wisata Rekreasi dan Keluarga',
    'Rental': 'Layanan',
    'Restoran': 'Restoran',
    'Retreat center': 'Hotel',
    'Shopping area': 'Pusat Perbelanjaan',
    'Shopping Area': 'Pusat Perbelanjaan',
    'Shopping mall': 'Pusat Perbelanjaan',
    'Skin care clinic': 'Layanan',
    'Snorkling area': 'Wisata Bahari',
    'Spa': 'Layanan',
    'Supermarket': 'Pusat Perbelanjaan',
    'Taman': 'Wisata Alam',
    'Taman Botanik': 'Wisata Alam',
    'Taman Hiburan': 'Wisata Rekreasi dan Keluarga',
    'Taman Kota': 'Wisata Alam',
    'Taman Rekreasi': 'Wisata Rekreasi dan Keluarga',
    'Tempat Bermain Anak-Anak': 'Wisata Rekreasi dan Keluarga',
    'Tempat Ibadah': 'Wisata Budaya dan Sejarah',
    'Tour Guide': 'Jasa Wisata',
    'Tour operator': 'Jasa Wisata',
    'Tourist attraction': 'Wisata Budaya dan Sejarah',
    'Travel agency': 'Jasa Wisata',
    'Travel Agent': 'Jasa Wisata',
    'Tujuan Wisata': 'Wisata Umum',
    'Vegetarian restaurant': 'Restoran',
    'Wisata Alam': 'Wisata Alam',
    'Wisata Alam dan Pantai': 'Wisata Alam',
    'Wisata Bahari': 'Wisata Bahari',
    'Wisata Budaya': 'Wisata Budaya dan Sejarah',
    'Wisata Budaya dan Adat': 'Wisata Budaya dan Sejarah',
    'Wisata Budaya dan Sejarah': 'Wisata Budaya dan Sejarah',
    'Wisata Pantai': 'Wisata Alam',
    'Wisata Pulau': 'Wisata Bahari',
    'Wisata Rekreasi dan Keluarga': 'Wisata Rekreasi dan Keluarga',
    'Wisata Sejarah & Budaya': 'Wisata Budaya dan Sejarah'
  };
  
  return categoryMapping[cleanName] || cleanName;
}

// Fungsi untuk parsing satu baris data
function parseDestinationRow(row, headers) {
  const data = {};
  
  // Split row by tab dan mapping ke headers
  const values = row.split('\t');
  
  headers.forEach((header, index) => {
    data[header] = values[index] || '';
  });
  
  // Skip jika data tidak lengkap atau tidak valid
  if (!data.title || !data.placeId || data.totalScore === '0') {
    return null;
  }
  
  // Konversi ke format destination
  const destination = {
    imageUrl: data.imageUrl || '',
    title: data.title.trim(),
    totalScore: parseFloat(data.totalScore) || 0,
    reviewsCount: parseInt(data.reviewsCount) || 0,
    state: data.state || '',
    city: data.city || '',
    phone: data.phone || '',
    categoryName: cleanCategoryName(data.categoryName),
    description: data.description || '',
    placeId: data.placeId || '',
    location: {
      lat: parseFloat(data['location/lat']) || 0,
      lng: parseFloat(data['location/lng']) || 0,
    },
    tripDuration: getTripDuration(data.categoryName || ''),
  };
  
  return destination;
}

// Fungsi utama parsing untuk single file
async function parseDestinationsFile(inputFile, cityFilter, outputFile) {
  console.log(`🔄 Parsing destinations from ${inputFile}...`);
  
  // Baca file input
  const content = fs.readFileSync(inputFile, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    console.error(`❌ File ${inputFile} harus memiliki minimal header dan 1 baris data`);
    return null;
  }
  
  // Create images directory
  const imagesDir = ensureImagesDirectory();
  
  // Ambil header dari baris pertama
  const headers = lines[0].split('\t');
  
  // Parse setiap baris data
  const destinations = [];
  let skippedCount = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const destination = parseDestinationRow(lines[i], headers);
    
    if (destination) {
      // Filter berdasarkan kota jika diberikan
      if (!cityFilter || 
          destination.city.toLowerCase().includes(cityFilter.toLowerCase()) ||
          destination.state.toLowerCase().includes(cityFilter.toLowerCase())) {
        destinations.push(destination);
      } else {
        skippedCount++;
      }
    } else {
      skippedCount++;
    }
  }
  
  console.log(`✅ Parsed ${destinations.length} destinations from ${path.basename(inputFile)}`);
  console.log(`⏭️  Skipped ${skippedCount} invalid/filtered entries`);
  
  // Sort berdasarkan reviewsCount descending
  destinations.sort((a, b) => b.reviewsCount - a.reviewsCount);
  
  // Download images and update URLs
  console.log(`📸 Downloading images for ${destinations.length} destinations...`);
  let downloadedCount = 0;
  let failedCount = 0;
  
  for (let i = 0; i < destinations.length; i++) {
    const destination = destinations[i];
    const progress = `[${i + 1}/${destinations.length}]`;
    
    if (destination.imageUrl && destination.imageUrl !== '') {
      try {
        const imageBasePath = path.join(imagesDir, destination.placeId);
        const extension = await downloadImage(destination.imageUrl, imageBasePath);
        
        if (extension) {
          // Update imageUrl to absolute path from root
          const absolutePath = `/images/destinations/${destination.placeId}${extension}`;
          destination.imageUrl = absolutePath;
          downloadedCount++;
          console.log(`${progress} ✅ Downloaded: ${destination.title} -> ${destination.placeId}${extension}`);
        } else {
          failedCount++;
          console.log(`${progress} ❌ Failed: ${destination.title}`);
          destination.imageUrl = ''; // Clear invalid URL
        }
      } catch (error) {
        failedCount++;
        console.log(`${progress} ❌ Error: ${destination.title} - ${error.message}`);
        destination.imageUrl = ''; // Clear invalid URL
      }
    } else {
      console.log(`${progress} ⏭️  No image: ${destination.title}`);
    }
    
    // Add small delay to avoid overwhelming the server
    if (i % 10 === 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`📸 Image download completed:`);
  console.log(`   ✅ Downloaded: ${downloadedCount}`);
  console.log(`   ❌ Failed: ${failedCount}`);
  console.log(`   ⏭️  No image: ${destinations.length - downloadedCount - failedCount}`);
  
  // Generate TypeScript file content
  const cityName = cityFilter ? cityFilter.toLowerCase().replace(/\s+/g, '') : 'destinations';
  const exportName = `${cityName}Destinations`;
  
  const tsContent = `import type { Destination } from "../types"

export const ${exportName}: Destination[] = ${JSON.stringify(destinations, null, 2)}
`;
  
  // Write output file
  fs.writeFileSync(outputFile, tsContent);
  console.log(`🎉 Generated ${outputFile} with ${destinations.length} destinations`);
  
  return {
    fileName: path.basename(inputFile),
    cityName,
    destinationsCount: destinations.length,
    skippedCount,
    downloadedImages: downloadedCount,
    failedImages: failedCount,
    categories: getCategorySummary(destinations)
  };
}

// Fungsi untuk mendapatkan summary kategori
function getCategorySummary(destinations) {
  const categories = {};
  destinations.forEach(dest => {
    categories[dest.categoryName] = (categories[dest.categoryName] || 0) + 1;
  });
  return categories;
}

// Fungsi untuk batch processing
async function batchProcessFiles(inputFolder, outputFolder) {
  console.log(`🚀 Starting batch processing...`);
  console.log(`📁 Input folder: ${inputFolder}`);
  console.log(`📁 Output folder: ${outputFolder}`);
  
  // Ensure output directory exists
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }
  
  // Get all TSV files from input folder
  const files = fs.readdirSync(inputFolder)
    .filter(file => file.endsWith('.tsv') || file.endsWith('.csv'))
    .map(file => path.join(inputFolder, file));
  
  if (files.length === 0) {
    console.error('❌ No TSV/CSV files found in input folder');
    process.exit(1);
  }
  
  console.log(`📋 Found ${files.length} files to process:`);
  files.forEach(file => console.log(`   - ${path.basename(file)}`));
  
  const results = [];
  
  // Process each file
  for (const inputFile of files) {
    const baseName = path.basename(inputFile, path.extname(inputFile));
    const cityName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    const outputFile = path.join(outputFolder, `${baseName}-destinations.ts`);
    
    try {
      const result = await parseDestinationsFile(inputFile, cityName, outputFile);
      if (result) {
        results.push(result);
      }
    } catch (error) {
      console.error(`❌ Error processing ${inputFile}:`, error.message);
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Print summary
  printBatchSummary(results);
}

// Fungsi untuk process dengan config file
async function processWithConfig(configFile) {
  console.log(`⚙️  Processing with config file: ${configFile}`);
  
  if (!fs.existsSync(configFile)) {
    console.error(`❌ Config file not found: ${configFile}`);
    process.exit(1);
  }
  
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  
  console.log(`📋 Processing ${config.files.length} files from config...`);
  
  const results = [];
  
  for (const fileConfig of config.files) {
    const { input, city, output } = fileConfig;
    
    console.log(`🔄 Processing: ${input} -> ${output}`);
    
    try {
      // Ensure output directory exists
      const outputDir = path.dirname(output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const result = await parseDestinationsFile(input, city, output);
      if (result) {
        results.push(result);
      }
    } catch (error) {
      console.error(`❌ Error processing ${input}:`, error.message);
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Print summary
  printBatchSummary(results);
}

// Fungsi untuk print summary batch processing
function printBatchSummary(results) {
  console.log('\n🎯 BATCH PROCESSING SUMMARY');
  console.log('========================================');
  
  let totalDestinations = 0;
  let totalSkipped = 0;
  let totalDownloadedImages = 0;
  let totalFailedImages = 0;
  const allCategories = {};
  
  results.forEach(result => {
    console.log(`📍 ${result.cityName}:`);
    console.log(`   📊 ${result.destinationsCount} destinations (${result.skippedCount} skipped)`);
    console.log(`   📸 ${result.downloadedImages || 0} images downloaded (${result.failedImages || 0} failed)`);
    
    totalDestinations += result.destinationsCount;
    totalSkipped += result.skippedCount;
    totalDownloadedImages += result.downloadedImages || 0;
    totalFailedImages += result.failedImages || 0;
    
    // Merge categories
    Object.entries(result.categories).forEach(([category, count]) => {
      allCategories[category] = (allCategories[category] || 0) + count;
    });
  });
  
  console.log('\n📈 OVERALL STATISTICS:');
  console.log(`   🎯 Total files processed: ${results.length}`);
  console.log(`   📊 Total destinations: ${totalDestinations}`);
  console.log(`   ⏭️  Total skipped: ${totalSkipped}`);
  console.log(`   📸 Total images downloaded: ${totalDownloadedImages}`);
  console.log(`   ❌ Total images failed: ${totalFailedImages}`);
  
  console.log('\n🏷️  CATEGORY BREAKDOWN:');
  Object.entries(allCategories)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`   - ${category}: ${count}`);
    });
  
  console.log('\n✅ Batch processing completed successfully!');
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🎯 Destination Data Parser with Image Download

Usage:
  Single file:
    node scripts/parse-destinations.js <input-file> <city-name> <output-file>
  
  Batch processing:
    node scripts/parse-destinations.js --batch <input-folder> <output-folder>
  
  Config file:
    node scripts/parse-destinations.js --config <config-file>

Examples:
  # Single file (downloads images to lib/destinations/images/)
  node scripts/parse-destinations.js data/padang.tsv "Padang" lib/destinations/padang-destinations.ts

  # Batch process all TSV files in data/ folder
  node scripts/parse-destinations.js --batch data/ lib/destinations/

  # Use config file
  node scripts/parse-destinations.js --config batch-config.json

Config file format:
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

Note: Images will be downloaded to /lib/destinations/images/ with placeId as filename
    `);
    process.exit(1);
  }
  
  // Batch processing mode
  if (args[0] === '--batch') {
    if (args.length < 3) {
      console.error('❌ Batch mode requires input and output folders');
      console.error('Usage: node scripts/parse-destinations.js --batch <input-folder> <output-folder>');
      process.exit(1);
    }
    
    const [, inputFolder, outputFolder] = args;
    
    if (!fs.existsSync(inputFolder)) {
      console.error(`❌ Input folder not found: ${inputFolder}`);
      process.exit(1);
    }
    
    batchProcessFiles(inputFolder, outputFolder).catch(error => {
      console.error('❌ Error in batch processing:', error);
      process.exit(1);
    });
    return;
  }
  
  // Config file mode
  if (args[0] === '--config') {
    if (args.length < 2) {
      console.error('❌ Config mode requires config file path');
      console.error('Usage: node scripts/parse-destinations.js --config <config-file>');
      process.exit(1);
    }
    
    const [, configFile] = args;
    processWithConfig(configFile).catch(error => {
      console.error('❌ Error in config processing:', error);
      process.exit(1);
    });
    return;
  }
  
  // Single file mode (original functionality)
  if (args.length < 3) {
    console.error('❌ Single file mode requires input file, city name, and output file');
    console.error('Usage: node scripts/parse-destinations.js <input-file> <city-name> <output-file>');
    process.exit(1);
  }
  
  const [inputFile, cityFilter, outputFile] = args;
  
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    process.exit(1);
  }
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  parseDestinationsFile(inputFile, cityFilter, outputFile)
    .then(result => {
      if (result) {
        // Print summary for single file
        console.log('\n📊 Summary:');
        console.log(`   • Total destinations: ${result.destinationsCount}`);
        console.log(`   • Images downloaded: ${result.downloadedImages || 0}`);
        console.log(`   • Images failed: ${result.failedImages || 0}`);
        
        console.log('   • Categories:');
        Object.entries(result.categories)
          .sort(([,a], [,b]) => b - a)
          .forEach(([category, count]) => {
            console.log(`     - ${category}: ${count}`);
          });
      }
    })
    .catch(error => {
      console.error('❌ Error processing file:', error);
      process.exit(1);
    });
}

module.exports = { 
  parseDestinationsFile, 
  cleanCategoryName, 
  getTripDuration, 
  batchProcessFiles,
  processWithConfig,
  downloadImage,
  ensureImagesDirectory
}; 