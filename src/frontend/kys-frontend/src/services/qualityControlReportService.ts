import api from './api';

export interface QualityControlReport {
  _id: string;
  reportId: string;
  materialQualityControlId?: string;
  reportType: 'INPUT_QUALITY_CONTROL';
  materialCode: string;
  materialName: string;
  supplierName: string;
  batchNumber: string;
  certificateNumber?: string;
  testOperator: {
    id: string;
    name: string;
    employeeId: string;
  };
  qualityController: {
    id: string;
    name: string;
    employeeId: string;
  };
  overallQualityGrade: 'B' | 'C' | 'D' | 'REJECT';
  standardReference: string;
  testResults: {
    chemicalComposition?: Record<string, number>;
    mechanicalProperties?: Record<string, number>;
    hardnessValues?: Record<string, number>;
    validationResults?: {
      status: 'ACCEPTED' | 'REJECTED';
      details: Array<{
        property: string;
        value: string;
        requirement: string;
        status: 'ACCEPTED' | 'REJECTED';
        reference: string;
      }>;
      qualityDecision?: {
        type: 'DIRECT_REJECTION' | 'CONDITIONAL_ACCEPTANCE' | 'RE_EVALUATION';
        reason: string;
        conditions?: string;
        riskAssessment?: string;
        correctionActions?: string;
        responsiblePerson: string;
        authorizedBy: string;
        approvalDate: string;
      };
    };
  };
  conclusion: string;
  pdfPath?: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface QualityControlReportCreateData {
  materialQualityControlId?: string;
  materialCode: string;
  materialName: string;
  supplierName: string;
  batchNumber: string;
  certificateNumber?: string;
  testOperator?: {
    id: string;
    name: string;
    employeeId: string;
  };
  qualityController: {
    id: string;
    name: string;
    employeeId: string;
  };
  overallQualityGrade: 'B' | 'C' | 'D' | 'REJECT';
  standardReference: string;
  testResults: {
    chemicalComposition?: Record<string, number>;
    mechanicalProperties?: Record<string, number>;
    hardnessValues?: Record<string, number>;
    validationResults?: {
      status: 'ACCEPTED' | 'REJECTED';
      details: Array<{
        property: string;
        value: string;
        requirement: string;
        status: 'ACCEPTED' | 'REJECTED';
        reference: string;
      }>;
      qualityDecision?: {
        type: 'DIRECT_REJECTION' | 'CONDITIONAL_ACCEPTANCE' | 'RE_EVALUATION';
        reason: string;
        conditions?: string;
        riskAssessment?: string;
        correctionActions?: string;
        responsiblePerson: string;
        authorizedBy: string;
        approvalDate: string;
      };
    };
  };
  conclusion: string;
  pdfPath?: string;
}

export interface QualityControlReportFilters {
  reportType?: string;
  materialCode?: string;
  supplierName?: string;
  overallQualityGrade?: string;
  dateFrom?: string;
  dateTo?: string;
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

export interface ReportsStatistics {
  totalReports: number;
  gradeStats: Array<{
    _id: string;
    count: number;
  }>;
  monthlyStats: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
  }>;
}

const qualityControlReportService = {
  // Get all quality control reports with filters
  getAllQualityControlReports: async (filters: QualityControlReportFilters = {}): Promise<PaginatedResponse<QualityControlReport>> => {
    const { reportType, materialCode, supplierName, overallQualityGrade, dateFrom, dateTo, page = 1, limit = 10 } = filters;
    
    let queryParams = `?page=${page}&limit=${limit}`;
    if (reportType) queryParams += `&reportType=${reportType}`;
    if (materialCode) queryParams += `&materialCode=${materialCode}`;
    if (supplierName) queryParams += `&supplierName=${supplierName}`;
    if (overallQualityGrade) queryParams += `&overallQualityGrade=${overallQualityGrade}`;
    if (dateFrom) queryParams += `&dateFrom=${dateFrom}`;
    if (dateTo) queryParams += `&dateTo=${dateTo}`;
    
    const response = await api.get(`/quality-control-reports${queryParams}`);
    return response.data;
  },

  // Get quality control report by ID
  getQualityControlReportById: async (id: string): Promise<QualityControlReport> => {
    const response = await api.get(`/quality-control-reports/${id}`);
    return response.data.data;
  },

  // Create new quality control report
  createQualityControlReport: async (data: QualityControlReportCreateData): Promise<QualityControlReport> => {
    const response = await api.post('/quality-control-reports', data);
    return response.data.data;
  },

  // Update quality control report
  updateQualityControlReport: async (id: string, data: Partial<QualityControlReportCreateData>): Promise<QualityControlReport> => {
    const response = await api.put(`/quality-control-reports/${id}`, data);
    return response.data.data;
  },

  // Delete quality control report
  deleteQualityControlReport: async (id: string): Promise<void> => {
    await api.delete(`/quality-control-reports/${id}`);
  },

  // Get reports statistics
  getReportsStatistics: async (): Promise<ReportsStatistics> => {
    const response = await api.get('/quality-control-reports/statistics');
    return response.data.data;
  },
};

export default qualityControlReportService; 