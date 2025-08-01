import api from './api';

// Types matching the backend interfaces
export interface VehicleInfo {
  id: string;
  model: string;
  serialNumber: string;
  chassisNumber?: string;
}

export interface ApprovalInfo {
  approved: boolean;
  approver: string;
  approvalDate?: string;
  comments?: string;
}

export interface DeviationAttachment {
  id: string;
  name: string;
  type: string;
  data: string; // Base64 encoded file data
  uploadDate: string;
  uploadedBy: string;
}

export interface DeviationApproval {
  _id?: string;
  id?: string;
  deviationNumber: string;
  partName: string;
  partNumber: string;
  vehicles: VehicleInfo[];
  deviationType: 'input-control' | 'process-control' | 'final-control';
  description: string;
  reasonForDeviation?: string;
  proposedSolution?: string;
  qualityRisk: 'low' | 'medium' | 'high' | 'critical';
  
  // Request info
  requestDate: string;
  requestedBy: string;
  department: string;
  
  // Approval workflow
  rdApproval: ApprovalInfo;
  qualityApproval: ApprovalInfo;
  productionApproval: ApprovalInfo;
  generalManagerApproval: ApprovalInfo;
  
  // Status and tracking
  status: 'pending' | 'rd-approved' | 'quality-approved' | 'production-approved' | 'final-approved' | 'rejected';
  rejectionReason?: string;
  
  // Attachments
  attachments?: DeviationAttachment[];
  
  // Audit trail
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
  
  // Additional tracking
  completedDate?: string;
  totalApprovalTime?: number; // in hours
}

export interface DeviationApprovalResponse {
  success: boolean;
  data: DeviationApproval | DeviationApproval[];
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats?: {
    pending: number;
    inProgress: number;
    approved: number;
    rejected: number;
    total: number;
  };
}

export interface GetDeviationApprovalsParams {
  page?: number;
  limit?: number;
  status?: string;
  department?: string;
  deviationType?: string;
  qualityRisk?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApprovalRequest {
  approvalType: 'rd' | 'quality' | 'production' | 'generalManager';
  comments?: string;
}

export interface RejectionRequest {
  reason: string;
}

export interface BulkUpdateRequest {
  ids: string[];
  status: string;
}

class DeviationApprovalService {
  private baseURL = '/deviation-approvals';

  // Get all deviation approvals with filtering and pagination
  async getAll(params: GetDeviationApprovalsParams = {}): Promise<DeviationApprovalResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseURL}?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching deviation approvals:', error);
      throw new Error(error.response?.data?.message || 'Sapma onayları getirilemedi');
    }
  }

  // Get single deviation approval by ID
  async getById(id: string): Promise<DeviationApprovalResponse> {
    try {
      const response = await api.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching deviation approval:', error);
      throw new Error(error.response?.data?.message || 'Sapma onayı getirilemedi');
    }
  }

  // Create new deviation approval
  async create(data: Partial<DeviationApproval>): Promise<DeviationApprovalResponse> {
    try {
      const response = await api.post(this.baseURL, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating deviation approval:', error);
      throw new Error(error.response?.data?.message || 'Sapma onayı oluşturulamadı');
    }
  }

  // Update deviation approval
  async update(id: string, data: Partial<DeviationApproval>): Promise<DeviationApprovalResponse> {
    try {
      const response = await api.patch(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating deviation approval:', error);
      throw new Error(error.response?.data?.message || 'Sapma onayı güncellenemedi');
    }
  }

  // Delete deviation approval
  async delete(id: string): Promise<DeviationApprovalResponse> {
    try {
      const response = await api.delete(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting deviation approval:', error);
      throw new Error(error.response?.data?.message || 'Sapma onayı silinemedi');
    }
  }

  // Approve deviation (specific approval step)
  async approve(id: string, approvalData: ApprovalRequest): Promise<DeviationApprovalResponse> {
    try {
      const response = await api.patch(`${this.baseURL}/${id}/approve`, approvalData);
      return response.data;
    } catch (error: any) {
      console.error('Error approving deviation:', error);
      throw new Error(error.response?.data?.message || 'Sapma onaylanamadı');
    }
  }

  // Reject deviation
  async reject(id: string, rejectionData: RejectionRequest): Promise<DeviationApprovalResponse> {
    try {
      const response = await api.patch(`${this.baseURL}/${id}/reject`, rejectionData);
      return response.data;
    } catch (error: any) {
      console.error('Error rejecting deviation:', error);
      throw new Error(error.response?.data?.message || 'Sapma reddedilemedi');
    }
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<any> {
    try {
      const response = await api.get(`${this.baseURL}/dashboard`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error(error.response?.data?.message || 'Dashboard istatistikleri getirilemedi');
    }
  }

  // Bulk update status
  async bulkUpdateStatus(bulkData: BulkUpdateRequest): Promise<DeviationApprovalResponse> {
    try {
      const response = await api.patch(`${this.baseURL}/bulk/status`, bulkData);
      return response.data;
    } catch (error: any) {
      console.error('Error bulk updating status:', error);
      throw new Error(error.response?.data?.message || 'Toplu güncelleme yapılamadı');
    }
  }

  // Utility method to convert between frontend and backend formats
  convertToBackendFormat(frontendData: any): Partial<DeviationApproval> {
    return {
      ...frontendData,
      // Convert id to _id if needed
      _id: frontendData.id || frontendData._id,
    };
  }

  convertToFrontendFormat(backendData: any): DeviationApproval {
    return {
      ...backendData,
      // Ensure id field exists for frontend compatibility
      id: backendData._id || backendData.id,
    };
  }

  // Export data (for backup purposes)
  async exportData(): Promise<Blob> {
    try {
      const allData = await this.getAll({ limit: 10000 }); // Get all data
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: Array.isArray(allData.data) ? allData.data : [allData.data],
        totalRecords: Array.isArray(allData.data) ? allData.data.length : 1
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      return new Blob([dataStr], { type: 'application/json' });
    } catch (error: any) {
      console.error('Error exporting data:', error);
      throw new Error('Veri export edilemedi');
    }
  }

  // Import data (restore from backup)
  async importData(data: DeviationApproval[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const item of data) {
      try {
        // Remove _id to let backend generate new one
        const { _id, id, createdAt, updatedAt, ...importItem } = item;
        
        await this.create(importItem);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${item.deviationNumber}: ${error.message}`);
      }
    }

    return results;
  }

  // Generate next deviation number (frontend utility)
  async generateDeviationNumber(): Promise<string> {
    try {
      const currentYear = new Date().getFullYear();
      const allDeviations = await this.getAll({ 
        sortBy: 'deviationNumber', 
        sortOrder: 'desc',
        limit: 1000 
      });
      
      const currentYearDeviations = Array.isArray(allDeviations.data) 
        ? allDeviations.data.filter((d: DeviationApproval) => 
            d.deviationNumber.startsWith(currentYear.toString())
          )
        : [];

      let nextNumber = 1;
      if (currentYearDeviations.length > 0) {
        const lastDeviation = currentYearDeviations[0];
        const match = lastDeviation.deviationNumber.match(/\d{4}-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      return `${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      // Fallback to simple timestamp-based numbering
      const currentYear = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-3);
      return `${currentYear}-${timestamp}`;
    }
  }
}

// Create singleton instance
const deviationApprovalService = new DeviationApprovalService();

export default deviationApprovalService;