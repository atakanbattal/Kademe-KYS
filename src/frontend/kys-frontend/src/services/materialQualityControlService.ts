import api from './api';

export interface CertificateProperty {
  name: string;
  expectedValue: string;
  actualValue: string;
  tolerance?: number;
  unit?: string;
  isCompliant: boolean;
}

export interface MaterialQualityControl {
  _id: string;
  materialCode: string;
  materialName: string;
  supplierId: string;
  supplierName: string;
  batchNumber: string;
  receivedDate: string;
  inspectionDate: string;
  inspector: {
    _id: string;
    name: string;
  };
  certificateNumber?: string;
  certificateUploadPath?: string;
  certificateProperties: CertificateProperty[];
  visualInspectionNotes?: string;
  dimensionalInspectionNotes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'conditional';
  approvedBy?: {
    _id: string;
    name: string;
  };
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialQualityControlCreateData {
  materialCode: string;
  materialName: string;
  supplierId: string;
  supplierName: string;
  batchNumber: string;
  receivedDate: string;
  inspectionDate?: string;
  certificateNumber?: string;
  certificateProperties?: CertificateProperty[];
  visualInspectionNotes?: string;
  dimensionalInspectionNotes?: string;
}

export interface MaterialQualityControlFilters {
  status?: string;
  supplierId?: string;
  materialCode?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
  data: T[];
}

const materialQualityControlService = {
  // Get all material quality controls with filters
  getAllMaterialQualityControls: async (filters: MaterialQualityControlFilters = {}): Promise<PaginatedResponse<MaterialQualityControl>> => {
    const { status, supplierId, materialCode, page = 1, limit = 10 } = filters;
    
    let queryParams = `?page=${page}&limit=${limit}`;
    if (status) queryParams += `&status=${status}`;
    if (supplierId) queryParams += `&supplierId=${supplierId}`;
    if (materialCode) queryParams += `&materialCode=${materialCode}`;
    
    const response = await api.get(`/material-quality${queryParams}`);
    return response.data;
  },

  // Get material quality control by ID
  getMaterialQualityControlById: async (id: string): Promise<MaterialQualityControl> => {
    const response = await api.get(`/material-quality/${id}`);
    return response.data.data;
  },

  // Create new material quality control
  createMaterialQualityControl: async (data: MaterialQualityControlCreateData): Promise<MaterialQualityControl> => {
    const response = await api.post('/material-quality', data);
    return response.data.data;
  },

  // Update material quality control status
  updateMaterialQualityControlStatus: async (id: string, status: string, rejectionReason?: string): Promise<MaterialQualityControl> => {
    const response = await api.patch(`/material-quality/${id}/status`, {
      status,
      rejectionReason,
    });
    return response.data.data;
  },

  // Update certificate properties
  updateCertificateProperties: async (id: string, certificateProperties: CertificateProperty[]): Promise<MaterialQualityControl> => {
    const response = await api.patch(`/material-quality/${id}/certificate`, {
      certificateProperties,
    });
    return response.data.data;
  },

  // Delete material quality control
  deleteMaterialQualityControl: async (id: string): Promise<void> => {
    await api.delete(`/material-quality/${id}`);
  },
};

export default materialQualityControlService; 