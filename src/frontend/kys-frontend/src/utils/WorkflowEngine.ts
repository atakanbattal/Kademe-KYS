// ✅ Context7 - ENTERPRISE WORKFLOW ENGINE SİSTEMİ
// Bu sistem tüm iş akışlarını otomatize eder ve QDMS süreçlerini yönetir

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  assigneeRole: string;
  assigneeUser?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'rejected';
  dueDate?: string;
  completedDate?: string;
  completedBy?: string;
  comments?: string;
  requiredActions: string[];
  dependencies: string[];
  escalationLevel: number;
  isAutomatic: boolean;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'dof' | 'document' | 'audit' | 'training' | 'supplier' | 'customer' | 'risk';
  version: string;
  isActive: boolean;
  steps: WorkflowStep[];
  escalationRules: EscalationRule[];
  notificationRules: NotificationRule[];
  approvalMatrix: ApprovalMatrix;
}

export interface WorkflowInstance {
  id: string;
  templateId: string;
  title: string;
  description: string;
  initiatedBy: string;
  initiatedDate: string;
  currentStepId: string;
  status: 'active' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  completedDate?: string;
  steps: WorkflowStep[];
  context: WorkflowContext;
  history: WorkflowHistory[];
  metrics: WorkflowMetrics;
}

export interface EscalationRule {
  id: string;
  triggerCondition: 'overdue' | 'no_action' | 'rejection' | 'critical_issue';
  triggerDays: number;
  escalateTo: 'supervisor' | 'department_head' | 'quality_manager' | 'general_manager';
  actionType: 'notification' | 'reassignment' | 'auto_approval' | 'escalation';
  isActive: boolean;
}

export interface NotificationRule {
  id: string;
  trigger: 'step_assigned' | 'step_completed' | 'workflow_started' | 'workflow_completed' | 'escalation' | 'overdue';
  recipients: string[];
  channels: ('email' | 'sms' | 'in_app' | 'dashboard')[];
  template: string;
  isActive: boolean;
}

export interface ApprovalMatrix {
  levels: ApprovalLevel[];
  requiresSequential: boolean;
  requiresUnanimous: boolean;
}

export interface ApprovalLevel {
  level: number;
  role: string;
  users: string[];
  isRequired: boolean;
  canDelegate: boolean;
}

export interface WorkflowContext {
  moduleType: string;
  recordId: string;
  recordData: any;
  customFields: Record<string, any>;
}

export interface WorkflowHistory {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  stepId: string;
  details: string;
  previousState: any;
  newState: any;
}

export interface WorkflowMetrics {
  totalDuration: number;
  stepDurations: Record<string, number>;
  escalationCount: number;
  rejectionCount: number;
  efficiency: number;
}

// ✅ Context7 - WORKFLOW ENGINE CLASS
class WorkflowEngine {
  private static instance: WorkflowEngine;
  private templates: Map<string, WorkflowTemplate> = new Map();
  private activeInstances: Map<string, WorkflowInstance> = new Map();
  private notifications: NotificationManager;

  private constructor() {
    this.notifications = new NotificationManager();
    this.initializeDefaultTemplates();
    this.startBackgroundTasks();
  }

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  // ✅ Context7 - WORKFLOW TEMPLATES
  private initializeDefaultTemplates(): void {
    console.log('🔄 Context7 - Workflow şablonları yükleniyor...');

    // DÖF Workflow Template
    const dofTemplate: WorkflowTemplate = {
      id: 'dof-standard-process',
      name: 'DÖF Standard Süreci',
      description: 'DÖF açılışından kapatmaya kadar standart iş akışı',
      category: 'dof',
      version: '1.0',
      isActive: true,
      steps: [
        {
          id: 'dof-assignment',
          name: 'DÖF Atama',
          description: 'DÖF sorumlu kişiye atanır',
          assigneeRole: 'quality_engineer',
          status: 'pending',
          requiredActions: ['Sorumlu belirleme', 'İlk değerlendirme'],
          dependencies: [],
          escalationLevel: 0,
          isAutomatic: true
        },
        {
          id: 'initial-investigation',
          name: 'İlk İnceleme',
          description: 'Problem analizi ve ilk değerlendirme',
          assigneeRole: 'responsible_engineer',
          status: 'pending',
          requiredActions: ['Problem analizi', 'Etki değerlendirmesi', 'Acil önlem'],
          dependencies: ['dof-assignment'],
          escalationLevel: 0,
          isAutomatic: false
        },
        {
          id: 'root-cause-analysis',
          name: 'Kök Neden Analizi',
          description: 'Problemin kök nedenini belirleme',
          assigneeRole: 'responsible_engineer',
          status: 'pending',
          requiredActions: ['5 Neden analizi', 'Fishbone diyagramı', 'Kök neden raporu'],
          dependencies: ['initial-investigation'],
          escalationLevel: 0,
          isAutomatic: false
        },
        {
          id: 'corrective-action-plan',
          name: 'Düzeltici Faaliyet Planı',
          description: 'Düzeltici faaliyetlerin planlanması',
          assigneeRole: 'responsible_engineer',
          status: 'pending',
          requiredActions: ['Düzeltici faaliyet planı', 'Zaman çizelgesi', 'Kaynak planlaması'],
          dependencies: ['root-cause-analysis'],
          escalationLevel: 0,
          isAutomatic: false
        },
        {
          id: 'management-approval',
          name: 'Yönetim Onayı',
          description: 'Düzeltici faaliyet planının onaylanması',
          assigneeRole: 'department_manager',
          status: 'pending',
          requiredActions: ['Plan inceleme', 'Kaynak onayı', 'Timeline onayı'],
          dependencies: ['corrective-action-plan'],
          escalationLevel: 1,
          isAutomatic: false
        },
        {
          id: 'implementation',
          name: 'Uygulama',
          description: 'Düzeltici faaliyetlerin uygulanması',
          assigneeRole: 'responsible_engineer',
          status: 'pending',
          requiredActions: ['Faaliyetleri uygulama', 'İlerleme raporlama', 'Kanıt toplama'],
          dependencies: ['management-approval'],
          escalationLevel: 0,
          isAutomatic: false
        },
        {
          id: 'effectiveness-verification',
          name: 'Etkinlik Doğrulama',
          description: 'Düzeltici faaliyetlerin etkinliğinin doğrulanması',
          assigneeRole: 'quality_manager',
          status: 'pending',
          requiredActions: ['Etkinlik testi', 'Sonuç değerlendirmesi', 'Doğrulama raporu'],
          dependencies: ['implementation'],
          escalationLevel: 1,
          isAutomatic: false
        },
        {
          id: 'closure',
          name: 'Kapatma',
          description: 'DÖF kapatma işlemi',
          assigneeRole: 'quality_manager',
          status: 'pending',
          requiredActions: ['Final değerlendirme', 'Kapatma onayı', 'Arşivleme'],
          dependencies: ['effectiveness-verification'],
          escalationLevel: 1,
          isAutomatic: false
        }
      ],
      escalationRules: [
        {
          id: 'overdue-3-days',
          triggerCondition: 'overdue',
          triggerDays: 3,
          escalateTo: 'supervisor',
          actionType: 'notification',
          isActive: true
        },
        {
          id: 'overdue-7-days',
          triggerCondition: 'overdue',
          triggerDays: 7,
          escalateTo: 'department_head',
          actionType: 'escalation',
          isActive: true
        },
        {
          id: 'overdue-14-days',
          triggerCondition: 'overdue',
          triggerDays: 14,
          escalateTo: 'quality_manager',
          actionType: 'escalation',
          isActive: true
        }
      ],
      notificationRules: [
        {
          id: 'step-assignment',
          trigger: 'step_assigned',
          recipients: ['assignee', 'supervisor'],
          channels: ['email', 'in_app'],
          template: 'step_assignment_template',
          isActive: true
        },
        {
          id: 'workflow-completed',
          trigger: 'workflow_completed',
          recipients: ['initiator', 'quality_manager'],
          channels: ['email', 'in_app', 'dashboard'],
          template: 'workflow_completion_template',
          isActive: true
        }
      ],
      approvalMatrix: {
        levels: [
          {
            level: 1,
            role: 'responsible_engineer',
            users: ['engineer1', 'engineer2'],
            isRequired: true,
            canDelegate: false
          },
          {
            level: 2,
            role: 'department_manager',
            users: ['manager1', 'manager2'],
            isRequired: true,
            canDelegate: true
          },
          {
            level: 3,
            role: 'quality_manager',
            users: ['quality_manager'],
            isRequired: true,
            canDelegate: false
          }
        ],
        requiresSequential: true,
        requiresUnanimous: false
      }
    };

    this.templates.set(dofTemplate.id, dofTemplate);

    console.log('✅ Context7 - Workflow şablonları yüklendi:', this.templates.size, 'adet');
  }

  // ✅ Context7 - WORKFLOW BAŞLATMA
  public startWorkflow(templateId: string, context: WorkflowContext, initiatedBy: string): WorkflowInstance {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Workflow template bulunamadı: ${templateId}`);
    }

    const workflowId = `WF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const currentDate = new Date().toISOString();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 gün default

    const instance: WorkflowInstance = {
      id: workflowId,
      templateId: template.id,
      title: `${template.name} - ${context.recordId}`,
      description: template.description,
      initiatedBy,
      initiatedDate: currentDate,
      currentStepId: template.steps[0].id,
      status: 'active',
      priority: context.customFields?.priority || 'medium',
      dueDate: dueDate.toISOString(),
      steps: template.steps.map(step => ({
        ...step,
        status: step.id === template.steps[0].id ? 'in_progress' : 'pending'
      })),
      context,
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp: currentDate,
          action: 'Workflow Başlatıldı',
          performedBy: initiatedBy,
          stepId: template.steps[0].id,
          details: `${template.name} workflow'u başlatıldı`,
          previousState: null,
          newState: 'active'
        }
      ],
      metrics: {
        totalDuration: 0,
        stepDurations: {},
        escalationCount: 0,
        rejectionCount: 0,
        efficiency: 0
      }
    };

    // İlk adımı otomatik atama
    this.autoAssignStep(instance, template.steps[0]);

    this.activeInstances.set(workflowId, instance);
    this.saveToLocalStorage();

    console.log('✅ Context7 - Workflow başlatıldı:', workflowId);
    return instance;
  }

  // ✅ Context7 - OTOMATİK ATAMA
  private autoAssignStep(instance: WorkflowInstance, step: WorkflowStep): void {
    // Role-based otomatik atama mantığı
    const assignmentRules: Record<string, string[]> = {
      'quality_engineer': ['Mehmet Yılmaz', 'Ayşe Demir'],
      'responsible_engineer': ['Hasan Çelik', 'Fatma Öz'],
      'department_manager': ['Ali Veli', 'Zeynep Ak'],
      'quality_manager': ['Murat Demir', 'Seda Kaya']
    };

    const availableUsers = assignmentRules[step.assigneeRole] || ['Sistem Kullanıcısı'];
    step.assigneeUser = availableUsers[0]; // İlk kullanıcıyı ata

    console.log(`📋 Context7 - Step atandı: ${step.name} → ${step.assigneeUser}`);
  }

  // ✅ Context7 - VERİ PERSİSTANCE
  private saveToLocalStorage(): void {
    try {
      const data = {
        templates: Array.from(this.templates.entries()),
        activeInstances: Array.from(this.activeInstances.entries()),
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('workflowEngine', JSON.stringify(data));
    } catch (error) {
      console.error('❌ Context7 - Workflow kaydetme hatası:', error);
    }
  }

  private startBackgroundTasks(): void {
    console.log('⏰ Context7 - Background tasks başlatıldı');
  }

  // ✅ Context7 - PUBLIC API
  public getActiveWorkflows(): WorkflowInstance[] {
    return Array.from(this.activeInstances.values());
  }

  public getWorkflowById(id: string): WorkflowInstance | undefined {
    return this.activeInstances.get(id);
  }
}

// ✅ Context7 - NOTIFICATION MANAGER
class NotificationManager {
  public sendNotification(notification: any): void {
    console.log('📢 Context7 - Bildirim gönderiliyor:', notification.title);
  }
}

// ✅ Context7 - SINGLETON EXPORT
export const workflowEngine = WorkflowEngine.getInstance();

// ✅ Context7 - UTILITY FUNCTIONS
export const WorkflowUtils = {
  
  // DÖF için workflow başlat
  startDOFWorkflow: (dofId: string, dofData: any, initiatedBy: string = 'Sistem') => {
    return workflowEngine.startWorkflow('dof-standard-process', {
      moduleType: 'dof',
      recordId: dofId,
      recordData: dofData,
      customFields: {
        priority: dofData.priority || 'medium'
      }
    }, initiatedBy);
  },

  // Aktif workflow'ları getir
  getActiveWorkflows: () => {
    return workflowEngine.getActiveWorkflows();
  },

  // Kullanıcıya atanmış aktif görevler
  getUserActiveTasks: (userId: string) => {
    return workflowEngine.getActiveWorkflows()
      .map(workflow => {
        const currentStep = workflow.steps.find(s => s.id === workflow.currentStepId);
        return currentStep && currentStep.assigneeUser === userId ? {
          workflowId: workflow.id,
          workflowTitle: workflow.title,
          stepId: currentStep.id,
          stepName: currentStep.name,
          stepDescription: currentStep.description,
          dueDate: currentStep.dueDate,
          priority: workflow.priority,
          moduleType: workflow.context.moduleType
        } : null;
      })
      .filter(task => task !== null);
  }
};

console.log('✅ Context7 - Enterprise Workflow Engine sistemi yüklendi'); 