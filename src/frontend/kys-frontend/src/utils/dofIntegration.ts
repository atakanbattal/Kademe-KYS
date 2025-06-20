// DÖF/8D Integration Utility
export interface DOFCreationParams {
  sourceModule: 'qualityCost' | 'tankLeak' | 'fanTest' | 'vehicleTracking' | 'riskManagement' | 'productionQualityTracking';
  recordId: string;
  recordData: any;
  issueType: 'nonconformity' | 'defect' | 'failure' | 'deviation';
  issueDescription: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  affectedDepartment: string;
  responsiblePerson?: string;
}

export interface DOFRecord {
  id: string;
  dofNumber: string;
  type: 'corrective' | 'preventive' | '8d' | 'improvement';
  title: string;
  description: string;
  department: string;
  responsible: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'awaiting_approval' | 'overdue' | 'closed' | 'rejected';
  createdDate: string;
  openingDate: string;
  dueDate: string;
  closedDate?: string;
  rootCause: string;
  actions: any[];
  attachments: any[];
  history: any[];
  sourceModule?: string;
  sourceRecordId?: string;
  rejectionReason?: string;
  metadata?: {
    sourceModule?: string;
    sourceRecordId?: string;
    createdBy?: string;
    lastModified?: string;
  };
}

// DÖF numarası oluşturma
export const generateDOFNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
  
  return `DOF-${year}${month}${day}-${time}`;
};

// DÖF kaydı oluşturma
export const createDOFRecord = (params: DOFCreationParams): DOFRecord => {
  const now = new Date().toISOString();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // 30 gün sonra
  
  const dofRecord: DOFRecord = {
    id: `dof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    dofNumber: generateDOFNumber(),
    type: 'corrective', // Varsayılan olarak düzeltici
    title: `${getModuleName(params.sourceModule)} - ${params.issueType === 'nonconformity' ? 'Uygunsuzluk' : 'Hata'}`,
    description: params.issueDescription,
    department: params.affectedDepartment,
    responsible: params.responsiblePerson || 'Belirtilmemiş',
    priority: params.priority,
    status: 'open',
    createdDate: now,
    openingDate: now,
    dueDate: dueDate.toISOString(),
    rootCause: 'Araştırılacak',
    actions: [],
    attachments: [],
    history: [
      {
        id: `hist_${Date.now()}`,
        action: 'DÖF Oluşturuldu',
        user: 'System',
        date: now,
        details: `${getModuleName(params.sourceModule)} modülünden otomatik oluşturuldu`
      }
    ],
    sourceModule: params.sourceModule,
    sourceRecordId: params.recordId,
    metadata: {
      sourceModule: params.sourceModule,
      sourceRecordId: params.recordId,
      createdBy: 'System Integration',
      lastModified: now
    }
  };

  return dofRecord;
};

// Modül ismi alma
export const getModuleName = (module: string): string => {
  const moduleNames = {
    qualityCost: 'Kalitesizlik Maliyeti',
    tankLeak: 'Tank Sızdırmazlık Testi',
    fanTest: 'Fan ve Balans Kalite Analizi', 
    vehicleTracking: 'Araç Ret/Hurda/Fire Takibi',
    riskManagement: 'Risk Yönetimi',
    productionQualityTracking: 'Üretim Kaynaklı Kalite Hata Takibi'
  };
  
  return moduleNames[module as keyof typeof moduleNames] || module;
};

// DÖF kaydını localStorage'a kaydetme
export const saveDOFToStorage = (dofRecord: DOFRecord): boolean => {
  try {
    const existingDOFs = localStorage.getItem('dof-8d-records');
    let dofRecords: DOFRecord[] = [];
    
    if (existingDOFs) {
      dofRecords = JSON.parse(existingDOFs);
    }
    
    // Yeni DÖF'ü ekle
    dofRecords.push(dofRecord);
    
    // localStorage'a kaydet
    localStorage.setItem('dof-8d-records', JSON.stringify(dofRecords));
    
    return true;
  } catch (error) {
    console.error('DÖF kaydedilemedi:', error);
    return false;
  }
};

// Kaynak modülden DÖF oluşturmak için ana fonksiyon
export const createDOFFromSourceRecord = (params: DOFCreationParams): { success: boolean; dofRecord?: DOFRecord; error?: string } => {
  try {
    // DÖF kaydı oluştur
    const dofRecord = createDOFRecord(params);
    
    // localStorage'a kaydet
    const saved = saveDOFToStorage(dofRecord);
    
    if (saved) {
      return {
        success: true,
        dofRecord: dofRecord
      };
    } else {
      return {
        success: false,
        error: 'DÖF kaydı localStorage\'a kaydedilemedi'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `DÖF oluşturma hatası: ${error}`
    };
  }
};

// DÖF form açma isteği için parametre hazırlama
export const prepareDOFFormData = (params: DOFCreationParams) => {
  const formData = {
    sourceModule: params.sourceModule,
    sourceRecordId: params.recordId,
    sourceRecordData: params.recordData,
    prefillData: {
      issueDescription: params.issueDescription,
      priority: params.priority,
      department: params.affectedDepartment,
      responsible: params.responsiblePerson || '',
      suggestedType: params.issueType === 'nonconformity' ? 'corrective' : 'preventive'
    }
  };
  
  return formData;
};

// DÖF yönetimi modülünü açma helper'ı
export const navigateToDOFForm = (params: DOFCreationParams): string => {
  const formData = prepareDOFFormData(params);
  
  // localStorage'a geçici olarak form verilerini kaydet
  localStorage.setItem('dof-form-prefill', JSON.stringify(formData));
  
  // DÖF yönetimi sayfasının URL'ini döndür
  return '/dof-8d-management';
};

// DÖF durumunu kontrol etme
export const checkDOFStatus = (sourceModule: string, sourceRecordId: string): DOFRecord | null => {
  try {
    const existingDOFs = localStorage.getItem('dof-8d-records');
    if (!existingDOFs) return null;
    
    const dofRecords: DOFRecord[] = JSON.parse(existingDOFs);
    
    return dofRecords.find(dof => 
      dof.sourceModule === sourceModule && 
      dof.sourceRecordId === sourceRecordId
    ) || null;
  } catch (error) {
    console.error('DÖF durumu kontrol edilemedi:', error);
    return null;
  }
}; 