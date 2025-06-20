import { Request, Response } from 'express';
import TankLeakTest, { TankLeakTestStatus } from '../models/TankLeakTest';
import User from '../models/User';

// Create a new tank leak test
export const createTankLeakTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      tankId,
      tankType,
      testType,
      materialType,
      welderId,
      welderName,
      testPressure,
      pressureUnit,
      testDuration,
      durationUnit,
      initialPressure,
      finalPressure,
      maxAllowedPressureDrop,
      temperature,
      temperatureUnit,
      humidity,
      notes,
      imageUrls,
    } = req.body;

    // Get the current user as quality inspector
    const inspectorId = (req as any).user.id;
    
    // Get inspector name
    const inspector = await User.findById(inspectorId);
    if (!inspector) {
      res.status(404).json({
        success: false,
        message: 'Inspector not found',
      });
      return;
    }

    // Calculate pressure drop
    const pressureDrop = initialPressure - finalPressure;
    
    // Determine test status
    const status = pressureDrop <= maxAllowedPressureDrop 
      ? TankLeakTestStatus.PASSED 
      : TankLeakTestStatus.FAILED;

    // Create new tank leak test entry
    const tankLeakTest = await TankLeakTest.create({
      tankId,
      tankType,
      testType,
      materialType,
      welderId,
      welderName,
      qualityInspectorId: inspectorId,
      qualityInspectorName: inspector.name,
      testDate: new Date(),
      testPressure,
      pressureUnit,
      testDuration,
      durationUnit,
      initialPressure,
      finalPressure,
      pressureDrop,
      maxAllowedPressureDrop,
      temperature,
      temperatureUnit,
      humidity,
      status,
      notes,
      imageUrls,
    });

    res.status(201).json({
      success: true,
      data: tankLeakTest,
    });
  } catch (error) {
    console.error('Create tank leak test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during tank leak test creation',
    });
  }
};

// Get all tank leak tests
export const getAllTankLeakTests = async (req: Request, res: Response): Promise<void> => {
  try {
    // Add filtering options
    const filter: any = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.tankId) {
      filter.tankId = { $regex: req.query.tankId, $options: 'i' };
    }
    
    if (req.query.welderId) {
      filter.welderId = req.query.welderId;
    }

    // Date range filtering
    if (req.query.startDate && req.query.endDate) {
      filter.testDate = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await TankLeakTest.countDocuments(filter);

    // Get tank leak tests with pagination
    const tankLeakTests = await TankLeakTest.find(filter)
      .sort({ testDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('welderId', 'name')
      .populate('qualityInspectorId', 'name');

    res.status(200).json({
      success: true,
      count: tankLeakTests.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: tankLeakTests,
    });
  } catch (error) {
    console.error('Get all tank leak tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving tank leak tests',
    });
  }
};

// Get tank leak test by ID
export const getTankLeakTestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const tankLeakTest = await TankLeakTest.findById(req.params.id)
      .populate('welderId', 'name')
      .populate('qualityInspectorId', 'name');

    if (!tankLeakTest) {
      res.status(404).json({
        success: false,
        message: 'Tank leak test not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: tankLeakTest,
    });
  } catch (error) {
    console.error('Get tank leak test by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving tank leak test',
    });
  }
};

// Update tank leak test
export const updateTankLeakTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      initialPressure,
      finalPressure,
      maxAllowedPressureDrop,
      notes,
      imageUrls,
    } = req.body;

    // Calculate pressure drop if pressure values are provided
    let updateData: any = {
      notes,
      imageUrls,
    };

    if (initialPressure !== undefined && finalPressure !== undefined) {
      const pressureDrop = initialPressure - finalPressure;
      updateData.initialPressure = initialPressure;
      updateData.finalPressure = finalPressure;
      updateData.pressureDrop = pressureDrop;
      
      if (maxAllowedPressureDrop !== undefined) {
        updateData.maxAllowedPressureDrop = maxAllowedPressureDrop;
        updateData.status = pressureDrop <= maxAllowedPressureDrop
          ? TankLeakTestStatus.PASSED
          : TankLeakTestStatus.FAILED;
      }
    }

    // Update the tank leak test
    const tankLeakTest = await TankLeakTest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!tankLeakTest) {
      res.status(404).json({
        success: false,
        message: 'Tank leak test not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: tankLeakTest,
    });
  } catch (error) {
    console.error('Update tank leak test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating tank leak test',
    });
  }
};

// Delete tank leak test
export const deleteTankLeakTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const tankLeakTest = await TankLeakTest.findByIdAndDelete(req.params.id);

    if (!tankLeakTest) {
      res.status(404).json({
        success: false,
        message: 'Tank leak test not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Tank leak test deleted successfully',
    });
  } catch (error) {
    console.error('Delete tank leak test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting tank leak test',
    });
  }
}; 