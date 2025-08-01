import { Request, Response } from 'express';
import mongoose from 'mongoose';
import DeviationApprovalModel, { 
  IDeviationApproval, 
  DeviationStatus, 
  DeviationType, 
  QualityRisk 
} from '../models/DeviationApproval';
import User from '../models/User';

// Helper function to create a valid ObjectId or use system ObjectId
const getValidObjectId = (userId: string | null): mongoose.Types.ObjectId => {
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    return new mongoose.Types.ObjectId(userId);
  }
  // Create a special system ObjectId
  return new mongoose.Types.ObjectId('000000000000000000000000');
};

// Helper function to get user name
const getUserName = async (userId: string | null): Promise<string> => {
  if (!userId) return 'Sistem';
  
  try {
    const user = await User.findById(userId);
    return user?.name || 'Sistem';
  } catch (error) {
    console.warn('User lookup failed, using system user');
    return 'Sistem';
  }
};

// Generate unique deviation number
const generateDeviationNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  
  // Find the latest deviation for this year
  const latestDeviation = await DeviationApprovalModel
    .findOne({
      deviationNumber: { $regex: `^${currentYear}-` }
    })
    .sort({ deviationNumber: -1 });
  
  let nextNumber = 1;
  if (latestDeviation) {
    const match = latestDeviation.deviationNumber.match(/\d{4}-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  // Format with leading zeros (e.g., 2024-001)
  return `${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
};

// Create new deviation approval
export const createDeviationApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      partName,
      partNumber,
      vehicles,
      deviationType,
      description,
      reasonForDeviation,
      proposedSolution,
      qualityRisk,
      requestDate,
      requestedBy,
      department,
      attachments
    } = req.body;

    // Validate required fields
    if (!partName || !partNumber || !deviationType || !description || !requestDate || !requestedBy || !department) {
      res.status(400).json({
        success: false,
        message: 'Zorunlu alanlar eksik'
      });
      return;
    }

    // Get user info
    const userId = (req as any).user?.id || null;
    const userName = await getUserName(userId);

    // Generate unique deviation number
    const deviationNumber = await generateDeviationNumber();

    // Create new deviation approval
    const deviationApproval = await DeviationApprovalModel.create({
      deviationNumber,
      partName,
      partNumber,
      vehicles: vehicles || [],
      deviationType,
      description,
      reasonForDeviation,
      proposedSolution,
      qualityRisk: qualityRisk || QualityRisk.MEDIUM,
      requestDate: new Date(requestDate),
      requestedBy,
      department,
      attachments: attachments || [],
      status: DeviationStatus.PENDING,
      createdBy: userName,
      lastModifiedBy: userName
    });

    res.status(201).json({
      success: true,
      data: deviationApproval,
      message: 'Sapma onayı başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Create deviation approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Sapma onayı oluşturulurken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Get all deviation approvals with filtering and pagination
export const getDeviationApprovals = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      department,
      deviationType,
      qualityRisk,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (deviationType) filter.deviationType = deviationType;
    if (qualityRisk) filter.qualityRisk = qualityRisk;
    
    // Search functionality
    if (search) {
      filter.$or = [
        { deviationNumber: { $regex: search, $options: 'i' } },
        { partName: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requestedBy: { $regex: search, $options: 'i' } },
        { 'vehicles.model': { $regex: search, $options: 'i' } },
        { 'vehicles.serialNumber': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [deviationApprovals, totalCount] = await Promise.all([
      DeviationApprovalModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      DeviationApprovalModel.countDocuments(filter)
    ]);

    // Calculate statistics
    const stats = await DeviationApprovalModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      pending: 0,
      inProgress: 0,
      approved: 0,
      rejected: 0,
      total: totalCount
    };

    stats.forEach(stat => {
      switch (stat._id) {
        case DeviationStatus.PENDING:
          statusCounts.pending = stat.count;
          break;
        case DeviationStatus.RD_APPROVED:
        case DeviationStatus.QUALITY_APPROVED:
        case DeviationStatus.PRODUCTION_APPROVED:
          statusCounts.inProgress += stat.count;
          break;
        case DeviationStatus.FINAL_APPROVED:
          statusCounts.approved = stat.count;
          break;
        case DeviationStatus.REJECTED:
          statusCounts.rejected = stat.count;
          break;
      }
    });

    res.status(200).json({
      success: true,
      data: deviationApprovals,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasNext: pageNum * limitNum < totalCount,
        hasPrev: pageNum > 1
      },
      stats: statusCounts
    });
  } catch (error) {
    console.error('Get deviation approvals error:', error);
    res.status(500).json({
      success: false,
      message: 'Sapma onayları getirilirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Get single deviation approval by ID
export const getDeviationApprovalById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz ID formatı'
      });
      return;
    }

    const deviationApproval = await DeviationApprovalModel.findById(id);

    if (!deviationApproval) {
      res.status(404).json({
        success: false,
        message: 'Sapma onayı bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: deviationApproval
    });
  } catch (error) {
    console.error('Get deviation approval by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Sapma onayı getirilirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Update deviation approval
export const updateDeviationApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz ID formatı'
      });
      return;
    }

    // Get user info
    const userId = (req as any).user?.id || null;
    const userName = await getUserName(userId);

    // Add audit info
    updateData.lastModifiedBy = userName;

    const deviationApproval = await DeviationApprovalModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!deviationApproval) {
      res.status(404).json({
        success: false,
        message: 'Sapma onayı bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: deviationApproval,
      message: 'Sapma onayı başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update deviation approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Sapma onayı güncellenirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Delete deviation approval
export const deleteDeviationApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz ID formatı'
      });
      return;
    }

    const deviationApproval = await DeviationApprovalModel.findByIdAndDelete(id);

    if (!deviationApproval) {
      res.status(404).json({
        success: false,
        message: 'Sapma onayı bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Sapma onayı başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete deviation approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Sapma onayı silinirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Approve deviation - specific approval step
export const approveDeviation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { approvalType, comments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz ID formatı'
      });
      return;
    }

    if (!approvalType || !['rd', 'quality', 'production', 'generalManager'].includes(approvalType)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz onay türü'
      });
      return;
    }

    // Get user info
    const userId = (req as any).user?.id || null;
    const userName = await getUserName(userId);

    const deviationApproval = await DeviationApprovalModel.findById(id);

    if (!deviationApproval) {
      res.status(404).json({
        success: false,
        message: 'Sapma onayı bulunamadı'
      });
      return;
    }

    // Check if already approved by this role
    const approvalField = `${approvalType}Approval`;
    if (deviationApproval[approvalField as keyof IDeviationApproval]?.approved) {
      res.status(400).json({
        success: false,
        message: 'Bu aşama zaten onaylanmış'
      });
      return;
    }

    // Use the model method to approve
    deviationApproval.approve(approvalType, userName, comments);
    deviationApproval.lastModifiedBy = userName;

    await deviationApproval.save();

    res.status(200).json({
      success: true,
      data: deviationApproval,
      message: 'Sapma onayı başarıyla onaylandı'
    });
  } catch (error) {
    console.error('Approve deviation error:', error);
    res.status(500).json({
      success: false,
      message: 'Sapma onaylanırken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Reject deviation
export const rejectDeviation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz ID formatı'
      });
      return;
    }

    if (!reason || reason.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Reddetme sebebi gereklidir'
      });
      return;
    }

    // Get user info
    const userId = (req as any).user?.id || null;
    const userName = await getUserName(userId);

    const deviationApproval = await DeviationApprovalModel.findById(id);

    if (!deviationApproval) {
      res.status(404).json({
        success: false,
        message: 'Sapma onayı bulunamadı'
      });
      return;
    }

    // Use the model method to reject
    deviationApproval.reject(reason.trim(), userName);

    await deviationApproval.save();

    res.status(200).json({
      success: true,
      data: deviationApproval,
      message: 'Sapma onayı reddedildi'
    });
  } catch (error) {
    console.error('Reject deviation error:', error);
    res.status(500).json({
      success: false,
      message: 'Sapma reddedilirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await DeviationApprovalModel.aggregate([
      {
        $facet: {
          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          departmentCounts: [
            {
              $group: {
                _id: '$department',
                count: { $sum: 1 }
              }
            }
          ],
          riskCounts: [
            {
              $group: {
                _id: '$qualityRisk',
                count: { $sum: 1 }
              }
            }
          ],
          monthlyTrend: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
          ],
          avgApprovalTime: [
            {
              $match: {
                totalApprovalTime: { $exists: true, $ne: null }
              }
            },
            {
              $group: {
                _id: null,
                avgTime: { $avg: '$totalApprovalTime' }
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard istatistikleri getirilirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Bulk operations
export const bulkUpdateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Geçerli ID listesi gereklidir'
      });
      return;
    }

    if (!status || !Object.values(DeviationStatus).includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Geçerli durum gereklidir'
      });
      return;
    }

    // Get user info
    const userId = (req as any).user?.id || null;
    const userName = await getUserName(userId);

    const result = await DeviationApprovalModel.updateMany(
      { _id: { $in: ids } },
      { 
        status,
        lastModifiedBy: userName
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} sapma onayı güncellendi`
    });
  } catch (error) {
    console.error('Bulk update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Toplu güncelleme yapılırken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};