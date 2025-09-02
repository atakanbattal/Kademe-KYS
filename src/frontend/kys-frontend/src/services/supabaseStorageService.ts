import { supabase } from '../config/supabase';

// PDF ve dosya yükleme için Supabase Storage entegrasyonu
export interface FileUpload {
    file: File;
    path: string;
    bucket?: string;
    metadata?: Record<string, any>;
}

export interface UploadedFile {
    path: string;
    url: string;
    name: string;
    size: number;
    type: string;
    bucket: string;
    uploadedAt: string;
}

export interface FileStorageOptions {
    maxSize?: number; // MB cinsinden
    allowedTypes?: string[];
    generateUniqueName?: boolean;
    folder?: string;
}

class SupabaseStorageService {
    private readonly DEFAULT_BUCKET = 'documents';
    private readonly MAX_FILE_SIZE = 50; // MB
    private readonly ALLOWED_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
    ];

    // Storage bucket'ları oluştur
    async initializeBuckets(): Promise<void> {
        try {
            const buckets = [
                'documents',
                'certificates',
                'quality-reports',
                'audit-attachments',
                'defect-photos',
                'training-materials'
            ];

            for (const bucketName of buckets) {
                try {
                    await supabase.storage.createBucket(bucketName, {
                        public: false,
                        fileSizeLimit: this.MAX_FILE_SIZE * 1024 * 1024,
                        allowedMimeTypes: this.ALLOWED_TYPES
                    });
                    console.log(`✅ Bucket '${bucketName}' created successfully`);
                } catch (error: any) {
                    if (error.message?.includes('already exists')) {
                        console.log(`ℹ️ Bucket '${bucketName}' already exists`);
                    } else {
                        console.error(`❌ Error creating bucket '${bucketName}':`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Error initializing storage buckets:', error);
            throw error;
        }
    }

    // Dosya yükleme
    async uploadFile(upload: FileUpload, options: FileStorageOptions = {}): Promise<UploadedFile> {
        try {
            const {
                file,
                path: originalPath,
                bucket = this.DEFAULT_BUCKET,
                metadata = {}
            } = upload;

            const {
                maxSize = this.MAX_FILE_SIZE,
                allowedTypes = this.ALLOWED_TYPES,
                generateUniqueName = true,
                folder = ''
            } = options;

            // Dosya validasyonları
            this.validateFile(file, maxSize, allowedTypes);

            // Dosya yolu oluştur
            const filePath = this.generateFilePath(file, originalPath, folder, generateUniqueName);

            // Dosyayı yükle
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    metadata: {
                        ...metadata,
                        originalName: file.name,
                        uploadedAt: new Date().toISOString(),
                        uploadedBy: 'current_user' // TODO: Get from auth context
                    }
                });

            if (error) {
                console.error('Storage upload error:', error);
                throw error;
            }

            // Public URL al
            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return {
                path: data.path,
                url: urlData.publicUrl,
                name: file.name,
                size: file.size,
                type: file.type,
                bucket,
                uploadedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    // Çoklu dosya yükleme
    async uploadMultipleFiles(uploads: FileUpload[], options: FileStorageOptions = {}): Promise<UploadedFile[]> {
        try {
            const uploadPromises = uploads.map(upload => this.uploadFile(upload, options));
            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error('Error uploading multiple files:', error);
            throw error;
        }
    }

    // PDF dosyası yükleme (özelleştirilmiş)
    async uploadPDF(file: File, folder: string, recordId: string): Promise<UploadedFile> {
        try {
            if (file.type !== 'application/pdf') {
                throw new Error('Sadece PDF dosyaları yüklenebilir');
            }

            const path = `${folder}/${recordId}_${Date.now()}.pdf`;
            
            return await this.uploadFile({
                file,
                path,
                bucket: 'documents',
                metadata: {
                    recordId,
                    folder,
                    category: 'pdf'
                }
            }, {
                maxSize: 20, // PDF için 20MB limit
                allowedTypes: ['application/pdf']
            });
        } catch (error) {
            console.error('Error uploading PDF:', error);
            throw error;
        }
    }

    // Sertifika yükleme
    async uploadCertificate(file: File, supplierId: string, materialCode?: string): Promise<UploadedFile> {
        try {
            const folder = `certificates/${supplierId}`;
            const path = materialCode 
                ? `${folder}/${materialCode}_${Date.now()}.pdf`
                : `${folder}/certificate_${Date.now()}.pdf`;

            return await this.uploadFile({
                file,
                path,
                bucket: 'certificates',
                metadata: {
                    supplierId,
                    materialCode,
                    category: 'certificate'
                }
            }, {
                allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
            });
        } catch (error) {
            console.error('Error uploading certificate:', error);
            throw error;
        }
    }

    // Defect fotoğrafı yükleme
    async uploadDefectPhoto(file: File, vehicleId: string, defectId: string): Promise<UploadedFile> {
        try {
            const folder = `defects/${vehicleId}`;
            const path = `${folder}/${defectId}_${Date.now()}.${file.name.split('.').pop()}`;

            return await this.uploadFile({
                file,
                path,
                bucket: 'defect-photos',
                metadata: {
                    vehicleId,
                    defectId,
                    category: 'defect-photo'
                }
            }, {
                allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
                maxSize: 10 // Fotoğraflar için 10MB
            });
        } catch (error) {
            console.error('Error uploading defect photo:', error);
            throw error;
        }
    }

    // Dosya indirme
    async downloadFile(bucket: string, path: string): Promise<Blob> {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .download(path);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }

    // Dosya URL'i alma
    async getFileUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string> {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .createSignedUrl(path, expiresIn);

            if (error) throw error;
            return data.signedUrl;
        } catch (error) {
            console.error('Error getting file URL:', error);
            throw error;
        }
    }

    // Public URL alma
    getPublicUrl(bucket: string, path: string): string {
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    }

    // Dosya silme
    async deleteFile(bucket: string, path: string): Promise<void> {
        try {
            const { error } = await supabase.storage
                .from(bucket)
                .remove([path]);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    // Çoklu dosya silme
    async deleteMultipleFiles(bucket: string, paths: string[]): Promise<void> {
        try {
            const { error } = await supabase.storage
                .from(bucket)
                .remove(paths);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting multiple files:', error);
            throw error;
        }
    }

    // Klasördeki dosyaları listeleme
    async listFiles(bucket: string, folder: string = '', limit: number = 100): Promise<any[]> {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .list(folder, {
                    limit,
                    sortBy: { column: 'created_at', order: 'desc' }
                });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error listing files:', error);
            throw error;
        }
    }

    // Dosya bilgilerini alma
    async getFileInfo(bucket: string, path: string): Promise<any> {
        try {
            const files = await this.listFiles(bucket, path.split('/').slice(0, -1).join('/'));
            const fileName = path.split('/').pop();
            
            return files.find(file => file.name === fileName);
        } catch (error) {
            console.error('Error getting file info:', error);
            throw error;
        }
    }

    // Dosya validasyonu
    private validateFile(file: File, maxSizeMB: number, allowedTypes: string[]): void {
        // Dosya boyutu kontrolü
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            throw new Error(`Dosya boyutu ${maxSizeMB}MB'dan büyük olamaz. Dosya boyutu: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        }

        // Dosya tipi kontrolü
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`Desteklenmeyen dosya tipi: ${file.type}. İzin verilen tipler: ${allowedTypes.join(', ')}`);
        }

        // Dosya adı kontrolü
        if (!file.name || file.name.trim() === '') {
            throw new Error('Geçersiz dosya adı');
        }
    }

    // Dosya yolu oluşturma
    private generateFilePath(file: File, originalPath: string, folder: string, generateUnique: boolean): string {
        const extension = file.name.split('.').pop();
        const baseName = file.name.replace(`.${extension}`, '');
        const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');

        let fileName = generateUnique 
            ? `${sanitizedBaseName}_${Date.now()}.${extension}`
            : `${sanitizedBaseName}.${extension}`;

        if (originalPath) {
            return originalPath;
        }

        if (folder) {
            return `${folder}/${fileName}`;
        }

        return fileName;
    }

    // Base64 string'den dosya oluşturma (PDF raporları için)
    async uploadBase64PDF(
        base64Data: string, 
        fileName: string, 
        folder: string, 
        metadata: Record<string, any> = {}
    ): Promise<UploadedFile> {
        try {
            // Base64'ten Blob oluştur
            const byteCharacters = atob(base64Data.split(',')[1] || base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            // File object oluştur
            const file = new File([blob], fileName, { type: 'application/pdf' });
            
            return await this.uploadFile({
                file,
                path: `${folder}/${fileName}`,
                bucket: 'quality-reports',
                metadata
            });
        } catch (error) {
            console.error('Error uploading base64 PDF:', error);
            throw error;
        }
    }
}

export const supabaseStorageService = new SupabaseStorageService();
export default supabaseStorageService;
