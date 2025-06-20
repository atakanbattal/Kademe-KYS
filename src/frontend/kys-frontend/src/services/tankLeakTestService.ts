import api from './api';

export interface TankLeakTest {
  _id: string;
  tankId: string;
  tankType: string;
  testType: string;
  materialType: string;
  welderId: string;
  welderName: string;
  qualityInspectorId: string;
  qualityInspectorName: string;
  testDate: string;
  testPressure: number;
  pressureUnit: string;
  testDuration: number;
  durationUnit: string;
  initialPressure: number;
  finalPressure: number;
  pressureDrop: number;
  maxAllowedPressureDrop: number;
  temperature: number;
  temperatureUnit: string;
  humidity: number;
  status: 'passed' | 'failed' | 'pending';
  notes?: string;
  imageUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TankLeakTestCreateData {
  tankId: string;
  tankType: string;
  testType: string;
  materialType: string;
  welderId: string;
  welderName: string;
  testPressure: number;
  pressureUnit: string;
  testDuration: number;
  durationUnit: string;
  initialPressure: number;
  finalPressure: number;
  maxAllowedPressureDrop: number;
  temperature: number;
  temperatureUnit: string;
  humidity: number;
  notes?: string;
  imageUrls?: string[];
}

export interface TankLeakTestUpdateData {
  initialPressure?: number;
  finalPressure?: number;
  maxAllowedPressureDrop?: number;
  notes?: string;
  imageUrls?: string[];
}

export interface TankLeakTestFilters {
  status?: string;
  tankId?: string;
  welderId?: string;
  startDate?: string;
  endDate?: string;
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

const tankLeakTestService = {
  // Get all tank leak tests with filters
  getAllTankLeakTests: async (filters: TankLeakTestFilters = {}): Promise<PaginatedResponse<TankLeakTest>> => {
    const { status, tankId, welderId, startDate, endDate, page = 1, limit = 10 } = filters;
    
    let queryParams = `?page=${page}&limit=${limit}`;
    if (status) queryParams += `&status=${status}`;
    if (tankId) queryParams += `&tankId=${tankId}`;
    if (welderId) queryParams += `&welderId=${welderId}`;
    if (startDate) queryParams += `&startDate=${startDate}`;
    if (endDate) queryParams += `&endDate=${endDate}`;
    
    const response = await api.get(`/tank-leak-test${queryParams}`);
    return response.data;
  },

  // Get tank leak test by ID
  getTankLeakTestById: async (id: string): Promise<TankLeakTest> => {
    const response = await api.get(`/tank-leak-test/${id}`);
    return response.data.data;
  },

  // Create new tank leak test
  createTankLeakTest: async (data: TankLeakTestCreateData): Promise<TankLeakTest> => {
    const response = await api.post('/tank-leak-test', data);
    return response.data.data;
  },

  // Update tank leak test
  updateTankLeakTest: async (id: string, data: TankLeakTestUpdateData): Promise<TankLeakTest> => {
    const response = await api.patch(`/tank-leak-test/${id}`, data);
    return response.data.data;
  },

  // Delete tank leak test
  deleteTankLeakTest: async (id: string): Promise<void> => {
    await api.delete(`/tank-leak-test/${id}`);
  },
};

export default tankLeakTestService; 