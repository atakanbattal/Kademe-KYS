import { Request, Response } from 'express';
// import QualityControlReport from '../models/QualityControlReport';
// import MaterialQualityControl from '../models/MaterialQualityControl';

// Simple in-memory storage for development
interface QualityControlReport {
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
    };
  };
  conclusion: string;
  pdfPath?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage
let reportsStore: QualityControlReport[] = [];
let reportCounter = 1;

// Generate unique report ID
const generateReportId = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `QCR-${date}-${String(reportCounter++).padStart(4, '0')}`;
};

// Create a new quality control report
export const createQualityControlReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      materialQualityControlId,
      materialCode,
      materialName,
      supplierName,
      batchNumber,
      certificateNumber,
      testOperator,
      qualityController,
      overallQualityGrade,
      standardReference,
      testResults,
      conclusion,
      pdfPath,
    } = req.body;

    // Get the current user as report creator
    const createdBy = (req as any).user?.id || '60d5ecb74e86dd0015c93b4d'; // Temporary default user ID

    // Create new quality control report
    const report: QualityControlReport = {
      _id: Date.now().toString(),
      reportId: generateReportId(),
      materialQualityControlId,
      reportType: 'INPUT_QUALITY_CONTROL',
      materialCode,
      materialName,
      supplierName,
      batchNumber,
      certificateNumber,
      testOperator: testOperator || {
        id: '',
        name: 'Sistem',
        employeeId: 'SYS001',
      },
      qualityController,
      overallQualityGrade,
      standardReference,
      testResults,
      conclusion,
      pdfPath,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reportsStore.push(report);

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('Create quality control report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during quality control report creation',
    });
  }
};

// Get all quality control reports
export const getAllQualityControlReports = async (req: Request, res: Response): Promise<void> => {
  try {
    // Add filtering options
    let filteredReports = [...reportsStore];
    
    if (req.query.reportType) {
      filteredReports = filteredReports.filter(r => r.reportType === req.query.reportType);
    }
    
    if (req.query.materialCode) {
      filteredReports = filteredReports.filter(r => 
        r.materialCode.toLowerCase().includes((req.query.materialCode as string).toLowerCase())
      );
    }

    if (req.query.supplierName) {
      filteredReports = filteredReports.filter(r => 
        r.supplierName.toLowerCase().includes((req.query.supplierName as string).toLowerCase())
      );
    }

    if (req.query.overallQualityGrade) {
      filteredReports = filteredReports.filter(r => r.overallQualityGrade === req.query.overallQualityGrade);
    }

    if (req.query.dateFrom || req.query.dateTo) {
      const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : null;
      const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : null;
      
      filteredReports = filteredReports.filter(r => {
        const reportDate = new Date(r.createdAt);
        if (dateFrom && reportDate < dateFrom) return false;
        if (dateTo && reportDate > dateTo) return false;
        return true;
      });
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Sort by created date (newest first)
    filteredReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Get total count
    const total = filteredReports.length;

    // Get paginated results
    const reports = filteredReports.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      count: reports.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: reports,
    });
  } catch (error) {
    console.error('Get all quality control reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving quality control reports',
    });
  }
};

// Get quality control report by ID
export const getQualityControlReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const report = reportsStore.find(r => r._id === req.params.id);

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Quality control report not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Get quality control report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving quality control report',
    });
  }
};

// Update quality control report
export const updateQualityControlReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const reportIndex = reportsStore.findIndex(r => r._id === req.params.id);

    if (reportIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Quality control report not found',
      });
      return;
    }

    // Update the report
    reportsStore[reportIndex] = {
      ...reportsStore[reportIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: reportsStore[reportIndex],
    });
  } catch (error) {
    console.error('Update quality control report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating quality control report',
    });
  }
};

// Delete quality control report
export const deleteQualityControlReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const reportIndex = reportsStore.findIndex(r => r._id === req.params.id);

    if (reportIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Quality control report not found',
      });
      return;
    }

    // Remove the report
    reportsStore.splice(reportIndex, 1);

    res.status(200).json({
      success: true,
      message: 'Quality control report deleted successfully',
    });
  } catch (error) {
    console.error('Delete quality control report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting quality control report',
    });
  }
};

// Get reports statistics
export const getReportsStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalReports = reportsStore.length;
    
    // Grade statistics
    const gradeStats = reportsStore.reduce((acc, report) => {
      const existing = acc.find(stat => stat._id === report.overallQualityGrade);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ _id: report.overallQualityGrade, count: 1 });
      }
      return acc;
    }, [] as Array<{ _id: string; count: number }>);

    // Monthly statistics (last 12 months)
    const monthlyStats = reportsStore.reduce((acc, report) => {
      const date = new Date(report.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const existing = acc.find(stat => stat._id.year === year && stat._id.month === month);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ _id: { year, month }, count: 1 });
      }
      return acc;
    }, [] as Array<{ _id: { year: number; month: number }; count: number }>);

    // Sort monthly stats by date (newest first) and limit to 12
    monthlyStats.sort((a, b) => {
      if (a._id.year !== b._id.year) return b._id.year - a._id.year;
      return b._id.month - a._id.month;
    });
    monthlyStats.splice(12); // Keep only last 12 months

    res.status(200).json({
      success: true,
      data: {
        totalReports,
        gradeStats,
        monthlyStats,
      },
    });
  } catch (error) {
    console.error('Get reports statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving reports statistics',
    });
  }
}; 