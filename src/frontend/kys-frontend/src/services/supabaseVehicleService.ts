import { supabase } from '../config/supabase';

// Vehicle Quality Control modülü için Supabase entegrasyonu
export interface VehicleQualityControlData {
    id?: string;
    vehicle_name: string;
    vehicle_model: string;
    serial_number: string;
    customer_name: string;
    sps_number: string;
    production_date: string;
    description?: string;
    current_status: 'production' | 'quality_control' | 'returned_to_production' | 'service' | 'ready_for_shipment' | 'shipped';
    status_history?: any[];
    defects?: any[];
    quality_entry_date?: string;
    production_return_date?: string;
    quality_reentry_date?: string;
    service_start_date?: string;
    service_end_date?: string;
    shipment_ready_date?: string;
    shipment_date?: string;
    is_overdue?: boolean;
    overdue_date?: string;
    warning_level?: 'none' | 'warning' | 'critical';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    estimated_completion_date?: string;
    shipment_type?: 'normal' | 'deviation_approved';
    shipment_notes?: string;
    created_at?: string;
    updated_at?: string;
}

export interface VehicleDefect {
    id: string;
    defect_type: string;
    description: string;
    location: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    detected_date: string;
    detected_by: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    corrective_action?: string;
    responsible_person?: string;
    target_completion_date?: string;
    actual_completion_date?: string;
    cost_impact?: number;
    root_cause?: string;
    prevention_action?: string;
    photos?: string[];
    notes?: string;
}

export interface StatusHistoryEntry {
    status: string;
    date: string;
    notes?: string;
    changed_by: string;
    reason?: string;
}

class VehicleSupabaseService {
    // Vehicle Quality Controls CRUD Operations
    async getAllVehicles(): Promise<VehicleQualityControlData[]> {
        try {
            const { data, error } = await supabase
                .from('vehicle_quality_controls')
                .select('*')
                .order('production_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            throw error;
        }
    }

    async getVehiclesByStatus(status: string): Promise<VehicleQualityControlData[]> {
        try {
            const { data, error } = await supabase
                .from('vehicle_quality_controls')
                .select('*')
                .eq('current_status', status)
                .order('production_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching vehicles by status:', error);
            throw error;
        }
    }

    async getOverdueVehicles(): Promise<VehicleQualityControlData[]> {
        try {
            const { data, error } = await supabase
                .from('vehicle_quality_controls')
                .select('*')
                .eq('is_overdue', true)
                .order('overdue_date', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching overdue vehicles:', error);
            throw error;
        }
    }

    async getVehicleById(id: string): Promise<VehicleQualityControlData | null> {
        try {
            const { data, error } = await supabase
                .from('vehicle_quality_controls')
                .select('*')
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error fetching vehicle:', error);
            throw error;
        }
    }

    async getVehicleBySerialNumber(serialNumber: string): Promise<VehicleQualityControlData | null> {
        try {
            const { data, error } = await supabase
                .from('vehicle_quality_controls')
                .select('*')
                .eq('serial_number', serialNumber)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error fetching vehicle by serial:', error);
            throw error;
        }
    }

    async createVehicle(vehicle: Omit<VehicleQualityControlData, 'id'>): Promise<VehicleQualityControlData> {
        try {
            // Status history ekle
            const statusHistory: StatusHistoryEntry[] = [{
                status: vehicle.current_status,
                date: new Date().toISOString(),
                changed_by: 'system', // TODO: Get from auth context
                notes: 'Vehicle created'
            }];

            const vehicleWithHistory = {
                ...vehicle,
                status_history: statusHistory,
                defects: []
            };

            const { data, error } = await supabase
                .from('vehicle_quality_controls')
                .insert([vehicleWithHistory])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating vehicle:', error);
            throw error;
        }
    }

    async updateVehicle(id: string, updates: Partial<VehicleQualityControlData>): Promise<VehicleQualityControlData> {
        try {
            const { data, error } = await supabase
                .from('vehicle_quality_controls')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating vehicle:', error);
            throw error;
        }
    }

    async updateVehicleStatus(
        id: string, 
        newStatus: VehicleQualityControlData['current_status'], 
        notes?: string,
        changedBy?: string
    ): Promise<VehicleQualityControlData> {
        try {
            // Mevcut aracı getir
            const vehicle = await this.getVehicleById(id);
            if (!vehicle) throw new Error('Vehicle not found');

            // Status history güncelle
            const statusHistory = vehicle.status_history || [];
            statusHistory.push({
                status: newStatus,
                date: new Date().toISOString(),
                changed_by: changedBy || 'system',
                notes: notes || ''
            });

            // Status bazlı tarih güncellemeleri
            const statusDates: Partial<VehicleQualityControlData> = {};
            switch (newStatus) {
                case 'quality_control':
                    statusDates.quality_entry_date = new Date().toISOString().split('T')[0];
                    break;
                case 'returned_to_production':
                    statusDates.production_return_date = new Date().toISOString().split('T')[0];
                    break;
                case 'service':
                    statusDates.service_start_date = new Date().toISOString().split('T')[0];
                    break;
                case 'ready_for_shipment':
                    statusDates.shipment_ready_date = new Date().toISOString().split('T')[0];
                    break;
                case 'shipped':
                    statusDates.shipment_date = new Date().toISOString().split('T')[0];
                    break;
            }

            const updates = {
                current_status: newStatus,
                status_history: statusHistory,
                ...statusDates
            };

            return await this.updateVehicle(id, updates);
        } catch (error) {
            console.error('Error updating vehicle status:', error);
            throw error;
        }
    }

    async addDefectToVehicle(vehicleId: string, defect: VehicleDefect): Promise<VehicleQualityControlData> {
        try {
            const vehicle = await this.getVehicleById(vehicleId);
            if (!vehicle) throw new Error('Vehicle not found');

            const defects = vehicle.defects || [];
            defects.push({
                ...defect,
                id: crypto.randomUUID()
            });

            return await this.updateVehicle(vehicleId, { defects });
        } catch (error) {
            console.error('Error adding defect to vehicle:', error);
            throw error;
        }
    }

    async updateDefectInVehicle(vehicleId: string, defectId: string, updates: Partial<VehicleDefect>): Promise<VehicleQualityControlData> {
        try {
            const vehicle = await this.getVehicleById(vehicleId);
            if (!vehicle) throw new Error('Vehicle not found');

            const defects = vehicle.defects || [];
            const defectIndex = defects.findIndex((d: any) => d.id === defectId);
            
            if (defectIndex === -1) throw new Error('Defect not found');

            defects[defectIndex] = { ...defects[defectIndex], ...updates };

            return await this.updateVehicle(vehicleId, { defects });
        } catch (error) {
            console.error('Error updating defect in vehicle:', error);
            throw error;
        }
    }

    async deleteVehicle(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('vehicle_quality_controls')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            throw error;
        }
    }

    async searchVehicles(searchTerm: string): Promise<VehicleQualityControlData[]> {
        try {
            const { data, error } = await supabase
                .from('vehicle_quality_controls')
                .select('*')
                .or(`vehicle_name.ilike.%${searchTerm}%,vehicle_model.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,sps_number.ilike.%${searchTerm}%`)
                .order('production_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error searching vehicles:', error);
            throw error;
        }
    }

    // Analytics ve KPI hesaplamaları
    async getVehicleStatistics(): Promise<any> {
        try {
            const vehicles = await this.getAllVehicles();

            const stats = {
                total: vehicles.length,
                byStatus: {} as Record<string, number>,
                byPriority: {} as Record<string, number>,
                overdue: vehicles.filter(v => v.is_overdue).length,
                warning: vehicles.filter(v => v.warning_level === 'warning').length,
                critical: vehicles.filter(v => v.warning_level === 'critical').length,
                avgTimeInQuality: 0,
                defectStats: {
                    totalDefects: 0,
                    byType: {} as Record<string, number>,
                    bySeverity: {} as Record<string, number>
                }
            };

            // Status dağılımı
            vehicles.forEach(vehicle => {
                stats.byStatus[vehicle.current_status] = (stats.byStatus[vehicle.current_status] || 0) + 1;
                stats.byPriority[vehicle.priority || 'medium'] = (stats.byPriority[vehicle.priority || 'medium'] || 0) + 1;

                // Defect istatistikleri
                if (vehicle.defects && Array.isArray(vehicle.defects)) {
                    stats.defectStats.totalDefects += vehicle.defects.length;
                    
                    vehicle.defects.forEach((defect: any) => {
                        stats.defectStats.byType[defect.defect_type] = (stats.defectStats.byType[defect.defect_type] || 0) + 1;
                        stats.defectStats.bySeverity[defect.severity] = (stats.defectStats.bySeverity[defect.severity] || 0) + 1;
                    });
                }
            });

            // Kalitede ortalama süre hesaplama (gün)
            const qualityVehicles = vehicles.filter(v => 
                v.quality_entry_date && 
                (v.production_return_date || v.service_start_date || v.shipment_ready_date)
            );

            if (qualityVehicles.length > 0) {
                const totalDays = qualityVehicles.reduce((sum, vehicle) => {
                    const entryDate = new Date(vehicle.quality_entry_date!);
                    const exitDate = new Date(vehicle.production_return_date || vehicle.service_start_date || vehicle.shipment_ready_date!);
                    const days = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
                    return sum + days;
                }, 0);

                stats.avgTimeInQuality = Math.round(totalDays / qualityVehicles.length);
            }

            return stats;
        } catch (error) {
            console.error('Error calculating vehicle statistics:', error);
            throw error;
        }
    }

    async getVehicleTimeline(id: string): Promise<StatusHistoryEntry[]> {
        try {
            const vehicle = await this.getVehicleById(id);
            if (!vehicle || !vehicle.status_history) return [];

            return vehicle.status_history as StatusHistoryEntry[];
        } catch (error) {
            console.error('Error fetching vehicle timeline:', error);
            throw error;
        }
    }

    // Real-time subscriptions
    subscribeToVehicleChanges(callback: (payload: any) => void) {
        return supabase
            .channel('vehicle_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'vehicle_quality_controls' }, 
                callback
            )
            .subscribe();
    }

    subscribeToVehicleById(vehicleId: string, callback: (payload: any) => void) {
        return supabase
            .channel(`vehicle_${vehicleId}_changes`)
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'vehicle_quality_controls', filter: `id=eq.${vehicleId}` }, 
                callback
            )
            .subscribe();
    }

    // Overdue vehicles için otomatik kontrol
    async checkAndUpdateOverdueVehicles(): Promise<string[]> {
        try {
            const vehicles = await this.getVehiclesByStatus('returned_to_production');
            const overdueVehicleIds: string[] = [];

            for (const vehicle of vehicles) {
                if (!vehicle.production_return_date) continue;

                const returnDate = new Date(vehicle.production_return_date);
                const daysSinceReturn = Math.ceil((Date.now() - returnDate.getTime()) / (1000 * 60 * 60 * 24));

                let shouldUpdate = false;
                let warningLevel: 'none' | 'warning' | 'critical' = 'none';
                let isOverdue = false;

                if (daysSinceReturn >= 2) {
                    isOverdue = true;
                    warningLevel = daysSinceReturn >= 5 ? 'critical' : 'warning';
                    shouldUpdate = true;
                    overdueVehicleIds.push(vehicle.id!);
                }

                if (shouldUpdate && (vehicle.is_overdue !== isOverdue || vehicle.warning_level !== warningLevel)) {
                    await this.updateVehicle(vehicle.id!, {
                        is_overdue: isOverdue,
                        warning_level: warningLevel,
                        overdue_date: isOverdue ? new Date(returnDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined
                    });
                }
            }

            return overdueVehicleIds;
        } catch (error) {
            console.error('Error checking overdue vehicles:', error);
            throw error;
        }
    }
}

export const vehicleSupabaseService = new VehicleSupabaseService();
export default vehicleSupabaseService;
