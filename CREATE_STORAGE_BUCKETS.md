# 📂 Supabase Storage Bucket'ları Oluşturma

Migration'ları tamamladıktan sonra PDF ve dosya yükleme için Storage bucket'larını oluşturmanız gerekiyor.

## 🗃️ Oluşturulacak Bucket'lar

1. **documents** - Genel dokümanlar
2. **certificates** - Sertifika dosyaları  
3. **quality-reports** - Kalite kontrol raporları
4. **audit-attachments** - Denetim ekleri
5. **defect-photos** - Hata fotoğrafları
6. **training-materials** - Eğitim materyalleri

## 📋 Adım Adım Kılavuz

### 1. Storage Sekmesine Gidin
1. Supabase Dashboard'da projenizi açın
2. Sol menüden **"Storage"** sekmesine tıklayın

### 2. Bucket'ları Oluşturun

Her bucket için aşağıdaki adımları tekrarlayın:

#### ➕ Yeni Bucket Oluşturma
1. **"New bucket"** butonuna tıklayın
2. **Bucket Name** alanını doldurun
3. **Ayarları** aşağıdaki gibi yapın:
   - **Public bucket**: ❌ (İşaretlemeyin - güvenlik için)
   - **File size limit**: `50 MB`
   - **Allowed MIME types**: 
     ```
     application/pdf
     image/jpeg
     image/png
     image/webp
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
     text/csv
     ```

#### 📝 Bucket Listesi

**1. documents**
- **Name**: `documents`
- **Description**: `Genel dokümanlar ve raporlar`

**2. certificates** 
- **Name**: `certificates`
- **Description**: `Malzeme sertifika dosyaları`

**3. quality-reports**
- **Name**: `quality-reports`  
- **Description**: `Kalite kontrol raporları`

**4. audit-attachments**
- **Name**: `audit-attachments`
- **Description**: `Denetim ekleri ve belgeler`

**5. defect-photos**
- **Name**: `defect-photos`
- **Description**: `Hata fotoğrafları ve görüntüler`

**6. training-materials**
- **Name**: `training-materials`
- **Description**: `Eğitim dokümanları ve materyaller`

### 3. RLS Politikalarını Ayarlayın

Her bucket oluşturduktan sonra güvenlik politikalarını ekleyin:

1. Bucket'a tıklayın
2. **"Policies"** sekmesine gidin
3. **"New Policy"** butonuna tıklayın
4. **Template** olarak **"Give anon users access to view images in a folder"** seçin
5. **Policy Name**: `Authenticated users can manage files`
6. **SQL Editor**'da şu kodu kullanın:

```sql
-- Authenticated users can upload, view, and delete files
CREATE POLICY "Authenticated users can manage files" ON storage.objects
  FOR ALL USING (auth.role() = 'authenticated');
```

### 4. Alternatif: Kod ile Oluşturma

Eğer manuel oluşturmak istemiyorsanız, aşağıdaki JavaScript kodunu Browser Console'da çalıştırabilirsiniz:

```javascript
// Supabase client'ı yükleyin
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nzkxizhnikfshyhilefg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56a3hpemhuaWtmc2h5aGlsZWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTYwMzIsImV4cCI6MjA3MjI5MjAzMn0.aRm8XdIvVrBffxT2VHH7A2bMqQsjiJiy3qkbJAkYhUk'
);

const buckets = [
  'documents',
  'certificates', 
  'quality-reports',
  'audit-attachments',
  'defect-photos',
  'training-materials'
];

// Bucket'ları oluştur
for (const bucketName of buckets) {
  try {
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 50 * 1024 * 1024, // 50MB
      allowedMimeTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ]
    });
    
    if (error) {
      console.error(`❌ ${bucketName} bucket oluşturulamadı:`, error);
    } else {
      console.log(`✅ ${bucketName} bucket başarıyla oluşturuldu`);
    }
  } catch (err) {
    console.error(`❌ ${bucketName} bucket hatası:`, err);
  }
}
```

## ✅ Kontrol Listesi

Bucket'ları oluşturduktan sonra kontrol edin:

- [ ] **documents** bucket'ı oluşturuldu
- [ ] **certificates** bucket'ı oluşturuldu  
- [ ] **quality-reports** bucket'ı oluşturuldu
- [ ] **audit-attachments** bucket'ı oluşturuldu
- [ ] **defect-photos** bucket'ı oluşturuldu
- [ ] **training-materials** bucket'ı oluşturuldu
- [ ] Tüm bucket'lar **Private** (public değil)
- [ ] RLS politikaları ayarlandı

## 🎯 Sonraki Adım

Bucket'lar oluşturulduktan sonra kodunuzda şöyle kullanabileceksiniz:

```typescript
import { supabaseStorageService } from './services/supabaseStorageService';

// PDF yükle
const uploadedFile = await supabaseStorageService.uploadPDF(
  pdfFile, 
  'quality-reports', 
  recordId
);

// Sertifika yükle
const certificate = await supabaseStorageService.uploadCertificate(
  certificateFile,
  supplierId,
  materialCode
);

// Defect fotoğrafı yükle
const photo = await supabaseStorageService.uploadDefectPhoto(
  photoFile,
  vehicleId,
  defectId
);
```

## 🚨 Sorun Giderme

**Bucket oluşturulamıyor:**
- Service Role Key'inizi kullandığınızdan emin olun
- İnternet bağlantınızı kontrol edin
- Bucket isminde özel karakter kullanmayın

**Upload çalışmıyor:**
- RLS politikalarının doğru olduğunu kontrol edin
- Dosya boyutunun limit içinde olduğunu kontrol edin
- MIME type'ının desteklendiğini kontrol edin
