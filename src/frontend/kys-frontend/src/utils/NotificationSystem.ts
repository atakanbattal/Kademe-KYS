// ✅ KADEME A.Ş. - Kalite Yönetim Sistemi
// ✅ Context7 - NotificationSystem.ts
// ✅ Enterprise-grade Notification Management System

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'dof' | 'audit' | 'document' | 'quality' | 'cost' | 'safety' | 'compliance' | 'maintenance' | 'training';
  module: string;
  userId?: string;
  departmentId?: string;
  roleId?: string;
  sourceId?: string;
  sourceType?: 'dof' | 'audit' | 'document' | 'wps' | 'risk' | 'cost_entry' | 'test' | 'certificate';
  actionRequired: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata: Record<string, any>;
  expiresAt?: string;
  scheduledFor?: string;
  createdAt: string;
  readAt?: string;
  acknowledgedAt?: string;
  isRead: boolean;
  isArchived: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  messageTemplate: string;
  type: NotificationData['type'];
  priority: NotificationData['priority'];
  category: NotificationData['category'];
  actionRequired: boolean;
  actionText?: string;
  variables: string[];
  isActive: boolean;
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    event: string;
    conditions: Record<string, any>;
  };
  template: string;
  recipients: {
    users?: string[];
    departments?: string[];
    roles?: string[];
  };
  schedule?: {
    immediate: boolean;
    delay?: number; // minutes
    recurring?: {
      enabled: boolean;
      interval: number; // hours
      maxOccurrences?: number;
    };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  userId: string;
  emailEnabled: boolean;
  browserEnabled: boolean;
  soundEnabled: boolean;
  categories: {
    [category: string]: {
      enabled: boolean;
      email: boolean;
      browser: boolean;
      minPriority: 'low' | 'medium' | 'high' | 'critical';
    };
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  updatedAt: string;
}

// ✅ Context7 - NOTIFICATION TEMPLATES
const defaultTemplates: NotificationTemplate[] = [
  {
    id: 'dof-created',
    name: 'DÖF Oluşturuldu',
    title: 'Yeni DÖF Kaydı: {{dofNumber}}',
    messageTemplate: '{{department}} departmanında yeni bir DÖF kaydı oluşturuldu. Sorumlu: {{responsible}}',
    type: 'info',
    priority: 'medium',
    category: 'dof',
    actionRequired: true,
    actionText: 'DÖF\'ü Görüntüle',
    variables: ['dofNumber', 'department', 'responsible'],
    isActive: true
  },
  {
    id: 'dof-overdue',
    name: 'DÖF Süresi Geçti',
    title: 'DÖF Süresi Geçti: {{dofNumber}}',
    messageTemplate: 'DÖF {{dofNumber}} için belirlenen süre {{daysOverdue}} gün önce geçmiştir. Acil eylem gerekli!',
    type: 'error',
    priority: 'critical',
    category: 'dof',
    actionRequired: true,
    actionText: 'Acil İncele',
    variables: ['dofNumber', 'daysOverdue'],
    isActive: true
  },
  {
    id: 'audit-scheduled',
    name: 'Tetkik Planlandı',
    title: 'Yeni Tetkik: {{auditTitle}}',
    messageTemplate: '{{department}} departmanı için {{auditDate}} tarihinde tetkik planlanmıştır.',
    type: 'info',
    priority: 'medium',
    category: 'audit',
    actionRequired: false,
    variables: ['auditTitle', 'department', 'auditDate'],
    isActive: true
  },
  {
    id: 'document-expired',
    name: 'Doküman Süresi Doldu',
    title: 'Doküman Süresi Doldu: {{documentTitle}}',
    messageTemplate: '{{documentTitle}} dokümanının geçerlilik süresi dolmuştur. Yenileme gerekli.',
    type: 'warning',
    priority: 'high',
    category: 'document',
    actionRequired: true,
    actionText: 'Dokümanı Yenile',
    variables: ['documentTitle'],
    isActive: true
  },
  {
    id: 'quality-cost-high',
    name: 'Yüksek Kalitesizlik Maliyeti',
    title: 'Yüksek Kalitesizlik Maliyeti Tespit Edildi',
    messageTemplate: '{{department}} departmanında {{amount}} ₺ tutarında kalitesizlik maliyeti tespit edildi.',
    type: 'warning',
    priority: 'high',
    category: 'cost',
    actionRequired: true,
    actionText: 'Analiz Et',
    variables: ['department', 'amount'],
    isActive: true
  },
  {
    id: 'certificate-expiring',
    name: 'Sertifika Süresi Doluyor',
    title: 'Sertifika Yenileme Gerekli: {{certificateType}}',
    messageTemplate: '{{certificateHolder}} adlı personelin {{certificateType}} sertifikası {{daysRemaining}} gün içinde sona erecek.',
    type: 'warning',
    priority: 'medium',
    category: 'compliance',
    actionRequired: true,
    actionText: 'Yenileme Planla',
    variables: ['certificateHolder', 'certificateType', 'daysRemaining'],
    isActive: true
  }
];

// ✅ Context7 - NOTIFICATION RULES
const defaultRules: NotificationRule[] = [
  {
    id: 'dof-auto-notify',
    name: 'DÖF Otomatik Bildirim',
    description: 'Yeni DÖF oluşturulduğunda ilgili departman ve yöneticilere bildirim gönder',
    trigger: {
      event: 'dof.created',
      conditions: { priority: 'any' }
    },
    template: 'dof-created',
    recipients: {
      departments: ['quality'],
      roles: ['quality_manager', 'department_manager']
    },
    schedule: {
      immediate: true
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dof-overdue-reminder',
    name: 'DÖF Süre Aşımı Hatırlatıcı',
    description: 'DÖF süresi geçen kayıtlar için günlük hatırlatıcı',
    trigger: {
      event: 'dof.overdue',
      conditions: { status: 'open' }
    },
    template: 'dof-overdue',
    recipients: {
      roles: ['quality_manager', 'responsible_person']
    },
    schedule: {
      immediate: true,
      recurring: {
        enabled: true,
        interval: 24, // 24 saatte bir
        maxOccurrences: 7 // 7 gün boyunca
      }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ✅ Context7 - NOTIFICATION SYSTEM CLASS
export class NotificationSystem {
  private static instance: NotificationSystem;
  private notifications: NotificationData[] = [];
  private templates: NotificationTemplate[] = defaultTemplates;
  private rules: NotificationRule[] = defaultRules;
  private settings: Map<string, NotificationSettings> = new Map();
  private subscribers: Map<string, (notification: NotificationData) => void> = new Map();

  private constructor() {
    this.loadFromStorage();
    this.startPeriodicChecks();
  }

  public static getInstance(): NotificationSystem {
    if (!NotificationSystem.instance) {
      NotificationSystem.instance = new NotificationSystem();
    }
    return NotificationSystem.instance;
  }

  // ✅ NOTIFICATION MANAGEMENT
  public createNotification(data: Omit<NotificationData, 'id' | 'createdAt' | 'isRead' | 'isArchived'>): NotificationData {
    const notification: NotificationData = {
      ...data,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      isRead: false,
      isArchived: false
    };

    this.notifications.unshift(notification);
    this.saveToStorage();
    this.notifySubscribers(notification);

    // Browser notification
    if (this.shouldShowBrowserNotification(notification)) {
      this.showBrowserNotification(notification);
    }

    return notification;
  }

  public createFromTemplate(templateId: string, variables: Record<string, any>, overrides: Partial<NotificationData> = {}): NotificationData | null {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return null;

    const title = this.processTemplate(template.title, variables);
    const message = this.processTemplate(template.messageTemplate, variables);

    return this.createNotification({
      title,
      message,
      type: template.type,
      priority: template.priority,
      category: template.category,
      module: overrides.module || 'system',
      actionRequired: template.actionRequired,
      actionText: template.actionText,
      metadata: variables,
      ...overrides
    });
  }

  public markAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date().toISOString();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public markAsAcknowledged(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.acknowledgedAt = new Date().toISOString();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public archiveNotification(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isArchived = true;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public deleteNotification(notificationId: string): boolean {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // ✅ QUERY METHODS
  public getNotifications(filters: {
    userId?: string;
    departmentId?: string;
    type?: NotificationData['type'];
    category?: NotificationData['category'];
    priority?: NotificationData['priority'];
    isRead?: boolean;
    isArchived?: boolean;
    limit?: number;
  } = {}): NotificationData[] {
    let result = [...this.notifications];

    if (filters.userId) {
      result = result.filter(n => n.userId === filters.userId || !n.userId);
    }

    if (filters.departmentId) {
      result = result.filter(n => n.departmentId === filters.departmentId || !n.departmentId);
    }

    if (filters.type) {
      result = result.filter(n => n.type === filters.type);
    }

    if (filters.category) {
      result = result.filter(n => n.category === filters.category);
    }

    if (filters.priority) {
      result = result.filter(n => n.priority === filters.priority);
    }

    if (filters.isRead !== undefined) {
      result = result.filter(n => n.isRead === filters.isRead);
    }

    if (filters.isArchived !== undefined) {
      result = result.filter(n => n.isArchived === filters.isArchived);
    }

    if (filters.limit) {
      result = result.slice(0, filters.limit);
    }

    return result;
  }

  public getUnreadCount(userId?: string): number {
    return this.getNotifications({ userId, isRead: false, isArchived: false }).length;
  }

  public getCriticalNotifications(userId?: string): NotificationData[] {
    return this.getNotifications({
      userId,
      priority: 'critical',
      isRead: false,
      isArchived: false
    });
  }

  public getActionRequiredNotifications(userId?: string): NotificationData[] {
    return this.getNotifications({ userId, isRead: false, isArchived: false })
      .filter(n => n.actionRequired);
  }

  // ✅ SUBSCRIPTION SYSTEM
  public subscribe(id: string, callback: (notification: NotificationData) => void): void {
    this.subscribers.set(id, callback);
  }

  public unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  private notifySubscribers(notification: NotificationData): void {
    this.subscribers.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Notification callback error:', error);
      }
    });
  }

  // ✅ TEMPLATE PROCESSING
  private processTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  // ✅ BROWSER NOTIFICATIONS
  private shouldShowBrowserNotification(notification: NotificationData): boolean {
    return notification.priority === 'critical' || notification.priority === 'high';
  }

  private showBrowserNotification(notification: NotificationData): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  }

  public requestBrowserPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return Notification.requestPermission();
    }
    return Promise.resolve('denied');
  }

  // ✅ PERIODIC CHECKS
  private startPeriodicChecks(): void {
    // Her 5 dakikada bir expired notifications kontrolü
    setInterval(() => {
      this.cleanupExpiredNotifications();
    }, 5 * 60 * 1000);

    // Her saat başında scheduled notifications kontrolü
    setInterval(() => {
      this.processScheduledNotifications();
    }, 60 * 60 * 1000);
  }

  private cleanupExpiredNotifications(): void {
    const now = new Date();
    this.notifications = this.notifications.filter(notification => {
      if (notification.expiresAt) {
        return new Date(notification.expiresAt) > now;
      }
      return true;
    });
    this.saveToStorage();
  }

  private processScheduledNotifications(): void {
    // Scheduled notifications implementation
    // Bu kısım WorkflowEngine ile entegre edilecek
  }

  // ✅ STORAGE MANAGEMENT
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('kys-notifications');
      if (stored) {
        const data = JSON.parse(stored);
        this.notifications = data.notifications || [];
        this.templates = data.templates || defaultTemplates;
        this.rules = data.rules || defaultRules;
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        notifications: this.notifications,
        templates: this.templates,
        rules: this.rules,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('kys-notifications', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }

  // ✅ UTILITY METHODS
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getStatistics(): {
    total: number;
    unread: number;
    critical: number;
    actionRequired: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  } {
    const active = this.notifications.filter(n => !n.isArchived);
    
    return {
      total: active.length,
      unread: active.filter(n => !n.isRead).length,
      critical: active.filter(n => n.priority === 'critical').length,
      actionRequired: active.filter(n => n.actionRequired && !n.isRead).length,
      byCategory: this.groupBy(active, 'category'),
      byPriority: this.groupBy(active, 'priority')
    };
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((result, item) => {
      const group = String(item[key]);
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {} as Record<string, number>);
  }

  // ✅ BULK OPERATIONS
  public markAllAsRead(userId?: string): number {
    const notifications = this.getNotifications({ userId, isRead: false });
    notifications.forEach(n => {
      n.isRead = true;
      n.readAt = new Date().toISOString();
    });
    this.saveToStorage();
    return notifications.length;
  }

  public clearAll(userId?: string): number {
    const before = this.notifications.length;
    if (userId) {
      this.notifications = this.notifications.filter(n => n.userId !== userId && n.userId);
    } else {
      this.notifications = [];
    }
    this.saveToStorage();
    return before - this.notifications.length;
  }
}

// ✅ Context7 - UTILITY FUNCTIONS
export const NotificationUtils = {
  // DÖF notifications
  notifyDOFCreated: (dofData: any) => {
    const ns = NotificationSystem.getInstance();
    return ns.createFromTemplate('dof-created', {
      dofNumber: dofData.dofNumber,
      department: dofData.department,
      responsible: dofData.responsible
    }, {
      module: 'dof-management',
      sourceId: dofData.id,
      sourceType: 'dof',
      actionUrl: `/dof-management?id=${dofData.id}`
    });
  },

  notifyDOFOverdue: (dofData: any, daysOverdue: number) => {
    const ns = NotificationSystem.getInstance();
    return ns.createFromTemplate('dof-overdue', {
      dofNumber: dofData.dofNumber,
      daysOverdue: daysOverdue.toString()
    }, {
      module: 'dof-management',
      sourceId: dofData.id,
      sourceType: 'dof',
      actionUrl: `/dof-management?id=${dofData.id}`
    });
  },

  // Quality cost notifications
  notifyHighQualityCost: (costData: any) => {
    const ns = NotificationSystem.getInstance();
    return ns.createFromTemplate('quality-cost-high', {
      department: costData.birim,
      amount: costData.toplam_maliyet?.toLocaleString('tr-TR')
    }, {
      module: 'quality-cost-management',
      sourceId: costData.id,
      sourceType: 'cost_entry',
      actionUrl: '/quality-cost-management'
    });
  },

  // Certificate notifications
  notifyCertificateExpiring: (certificateData: any, daysRemaining: number) => {
    const ns = NotificationSystem.getInstance();
    return ns.createFromTemplate('certificate-expiring', {
      certificateHolder: certificateData.personelAdi,
      certificateType: certificateData.belgeKategorisi,
      daysRemaining: daysRemaining.toString()
    }, {
      module: 'document-management',
      sourceId: certificateData.id,
      sourceType: 'certificate',
      actionUrl: '/document-management'
    });
  },

  // Audit notifications
  notifyAuditScheduled: (auditData: any) => {
    const ns = NotificationSystem.getInstance();
    return ns.createFromTemplate('audit-scheduled', {
      auditTitle: auditData.title,
      department: auditData.department,
      auditDate: new Date(auditData.auditDate).toLocaleDateString('tr-TR')
    }, {
      module: 'internal-audit-management',
      sourceId: auditData.id,
      sourceType: 'audit',
      actionUrl: '/internal-audit-management'
    });
  },

  // Document notifications
  notifyDocumentExpired: (documentData: any) => {
    const ns = NotificationSystem.getInstance();
    return ns.createFromTemplate('document-expired', {
      documentTitle: documentData.title
    }, {
      module: 'document-management',
      sourceId: documentData.id,
      sourceType: 'document',
      actionUrl: '/document-management'
    });
  },

  // Custom notification
  createCustomNotification: (
    title: string,
    message: string,
    options: Partial<NotificationData> = {}
  ) => {
    const ns = NotificationSystem.getInstance();
    return ns.createNotification({
      title,
      message,
      type: 'info',
      priority: 'medium',
      category: 'quality',
      module: 'system',
      actionRequired: false,
      metadata: {},
      ...options
    });
  }
};

// ✅ Context7 - DEFAULT EXPORT
export default NotificationSystem; 