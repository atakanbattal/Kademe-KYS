import { Request, Response } from 'express';
import MaterialQualityControl, { QualityControlStatus } from '../models/MaterialQualityControl';

// Create a new material quality control entry
export const createMaterialQualityControl = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      materialCode,
      materialName,
      supplierId,
      supplierName,
      batchNumber,
      receivedDate,
      inspectionDate,
      certificateNumber,
      certificateProperties,
      visualInspectionNotes,
      dimensionalInspectionNotes,
    } = req.body;

    // Get the current user as inspector
    const inspector = (req as any).user.id;

    // Create new quality control entry
    const qualityControl = await MaterialQualityControl.create({
      materialCode,
      materialName,
      supplierId,
      supplierName,
      batchNumber,
      receivedDate,
      inspectionDate: inspectionDate || new Date(),
      inspector,
      certificateNumber,
      certificateProperties: certificateProperties || [],
      visualInspectionNotes,
      dimensionalInspectionNotes,
      status: QualityControlStatus.PENDING,
    });

    res.status(201).json({
      success: true,
      data: qualityControl,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error
      res.status(400).json({
        success: false,
        message: 'A quality control entry with this material-batch-supplier combination already exists',
      });
      return;
    }

    console.error('Create material quality control error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during material quality control creation',
    });
  }
};

// Get all material quality controls
export const getAllMaterialQualityControls = async (req: Request, res: Response): Promise<void> => {
  try {
    // Add filtering options
    const filter: any = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.supplierId) {
      filter.supplierId = req.query.supplierId;
    }

    if (req.query.materialCode) {
      filter.materialCode = { $regex: req.query.materialCode, $options: 'i' };
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await MaterialQualityControl.countDocuments(filter);

    // Get quality controls with pagination
    const qualityControls = await MaterialQualityControl.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('inspector', 'name')
      .populate('approvedBy', 'name');

    res.status(200).json({
      success: true,
      count: qualityControls.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: qualityControls,
    });
  } catch (error) {
    console.error('Get all material quality controls error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving material quality controls',
    });
  }
};

// Get material quality control by ID
export const getMaterialQualityControlById = async (req: Request, res: Response): Promise<void> => {
  try {
    const qualityControl = await MaterialQualityControl.findById(req.params.id)
      .populate('inspector', 'name')
      .populate('approvedBy', 'name');

    if (!qualityControl) {
      res.status(404).json({
        success: false,
        message: 'Material quality control not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: qualityControl,
    });
  } catch (error) {
    console.error('Get material quality control by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving material quality control',
    });
  }
};

// Update material quality control status
export const updateMaterialQualityControlStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, rejectionReason } = req.body;
    
    // Validate status
    if (!Object.values(QualityControlStatus).includes(status as QualityControlStatus)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
      return;
    }

    // If rejecting, require a reason
    if (status === QualityControlStatus.REJECTED && !rejectionReason) {
      res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting material',
      });
      return;
    }

    // Update the status
    const qualityControl = await MaterialQualityControl.findByIdAndUpdate(
      req.params.id,
      {
        status,
        rejectionReason: status === QualityControlStatus.REJECTED ? rejectionReason : undefined,
        approvedBy: status === QualityControlStatus.APPROVED ? (req as any).user.id : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!qualityControl) {
      res.status(404).json({
        success: false,
        message: 'Material quality control not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: qualityControl,
    });
  } catch (error) {
    console.error('Update material quality control status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating material quality control status',
    });
  }
};

// Update certificate properties
export const updateCertificateProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const { certificateProperties } = req.body;

    // Update certificate properties
    const qualityControl = await MaterialQualityControl.findByIdAndUpdate(
      req.params.id,
      { certificateProperties },
      { new: true, runValidators: true }
    );

    if (!qualityControl) {
      res.status(404).json({
        success: false,
        message: 'Material quality control not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: qualityControl,
    });
  } catch (error) {
    console.error('Update certificate properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating certificate properties',
    });
  }
};

// Delete material quality control
export const deleteMaterialQualityControl = async (req: Request, res: Response): Promise<void> => {
  try {
    const qualityControl = await MaterialQualityControl.findByIdAndDelete(req.params.id);

    if (!qualityControl) {
      res.status(404).json({
        success: false,
        message: 'Material quality control not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Material quality control deleted successfully',
    });
  } catch (error) {
    console.error('Delete material quality control error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting material quality control',
    });
  }
}; 