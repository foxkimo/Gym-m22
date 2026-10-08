import React, { useState, useEffect } from 'react';
import { 
  RolePermissions, 
  EmployeeTaskItem, 
  EmployeeAccount, 
  CurrentUser, 
  AppRole 
} from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  PlusCircle, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Users, 
  Crown, 
  Dumbbell, 
  Wallet, 
  Calendar, 
  FileText, 
  Sparkles,
  X
} from 'lucide-react';

interface ManagerPermissionsMatrixProps {
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
}

export const ManagerPermissionsMatrix: React.FC<ManagerPermissionsMatrixProps> = ({ currentUser, lang }) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'permissions' | 'tasks'>('permissions');

  // Permissions state
  const [permissions, setPermissions] = useState<Record<string, RolePermissions>>({});
  
  // Tasks state
  const [tasks, setTasks] = useState<EmployeeTaskItem[]>([]);
  const [coaches, setCoaches] = useState<EmployeeAccount[]>([]);
  const [staff, setStaff] = useState<EmployeeAccount[]>([]);
  const [accountants, setAccountants] = useState<EmployeeAccount[]>([]);

  // New task modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitleAr, setTaskTitleAr] = useState('');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
  const [taskPriority, setTaskPriority] = useState<'urgent' | 'high' | 'normal'>('high');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskNotes, setTaskNotes] = useState('');

  const refreshData = () => {
    setPermissions(StorageService.getRolePermissions());
    setTasks(StorageService.getEmployeeTasks());
    setCoaches(StorageService.getCoaches());
    setStaff(StorageService.getStaff());
    setAccountants(StorageService.getAccountants());
  };

  useEffect(() => {
    refreshData();
    const handleSync = () => refreshData();
    window.addEventListener('gym_permissions_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('gym_permissions_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleTogglePermission = (role: string, permKey: keyof RolePermissions) => {
    if (role === 'manager') {
      alert(isAr ? 'صلاحيات المدير العام كاملة وثابتة لضمان أمان النظام.' : 'General Manager has full immutable permissions.');
      return;
    }

    const currentVal = permissions[role]?.[permKey] ?? false;
    StorageService.updateRolePermission(role, permKey, !currentVal);
    audioAlertService.playBeep(750, 0.04);
    refreshData();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitleAr.trim() || !assignedEmployeeId) return;

    const allEmps = [...coaches, ...staff, ...accountants];
    const targetEmp = allEmps.find(e => e.id === assignedEmployeeId);
    if (!targetEmp) return;

    StorageService.addEmployeeTask({
      titleAr: taskTitleAr.trim(),
      titleEn: taskTitleAr.trim(),
      assignedToId: targetEmp.id,
      assignedToName: targetEmp.nameAr,
      assignedRole: targetEmp.role,
      priority: taskPriority,
      status: 'pending',
      dueDate: taskDueDate || new Date().toISOString().split('T')[0],
      notes: taskNotes.trim() || undefined,
      createdBy: `${currentUser.nameAr} (المدير العام)`
    });

    audioAlertService.playSuccess();
    setIsTaskModalOpen(false);
    setTaskTitleAr('');
    setTaskNotes('');
    refreshData();
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    StorageService.updateTaskStatus(taskId, newStatus);
    audioAlertService.playSuccess();
    refreshData();
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm(isAr ? 'هل تريد حذف هذه المهمة؟' : 'Delete this task?')) {
      StorageService.deleteTask(taskId);
      audioAlertService.playDelete();
      refreshData();
    }
  };

  const permissionItems: { key: keyof RolePermissions; labelAr: string; labelEn: string; desc: string }[] = [
    { key: 'canManageMembers', labelAr: 'إدارة وتسجيل وتعديل المشتركين', labelEn: 'Manage Members', desc: 'إضافة وتعديل بيانات الأعضاء الجدد' },
    { key: 'canManageMemberPermissions', labelAr: 'إدارة وتخصيص صلاحيات وإتاحات الأعضاء المشتركين', labelEn: 'Manage Member Privileges', desc: 'تحديد صلاحيات وإتاحة خدمات العضو المشترك برقم حسابه' },
    { key: 'canIssueDiscounts', labelAr: 'صلاحية منح الخصومات السعرية', labelEn: 'Issue Discounts', desc: 'تطبيق خصم مالي على الاشتراكات والخدمات' },
    { key: 'canFreezeMemberships', labelAr: 'تجميد وتمديد الاشتراكات', labelEn: 'Freeze Memberships', desc: 'إيقاف اشتراك العضو مؤقتاً لأسباب السفر أو المرض' },
    { key: 'canOpenCloseShifts', labelAr: 'فتح وإغلاق ورديات الخزينة', labelEn: 'Manage Shifts', desc: 'استلام وتسليم درج النقدية اليومي' },
    { key: 'canRecordTransactions', labelAr: 'تسجيل القيود والسندات المالية', labelEn: 'Record Payments', desc: 'إصدار سندات القبض والدفع والصرف' },
    { key: 'canViewPayroll', labelAr: 'الاطلاع على كشوفات الرواتب', labelEn: 'View Payroll', desc: 'عرض مرتبات الموظفين ونسب الكباتن' },
    { key: 'canManagePayroll', labelAr: 'صرف واعتماد مسيرات الرواتب', labelEn: 'Manage Payroll', desc: 'اعتماد وصرف رواتب الموظفين' },
    { key: 'canEditWorkouts', labelAr: 'بناء وتعديل جداول التمارين', labelEn: 'Edit Workouts', desc: 'تصميم البرامج التدريبية للاعبين' },
    { key: 'canManageServices', labelAr: 'بيع المكملات الغذائية والبار وخدمات النادي (POS)', labelEn: 'Supplements & Bar POS', desc: 'بيع المكملات، مشروبات البروتين بار، السبا، وباقات PT والخدمات' },
    { key: 'canExportPDF', labelAr: 'تصدير وطباعة تقارير PDF الرسمية', labelEn: 'Export PDF Reports', desc: 'طباعة الفواتير والسندات والجداول' },
    { key: 'canAccessAuditLogs', labelAr: 'الاطلاع على سجل الرقابة والحركات', labelEn: 'Access Audit Logs', desc: 'متابعة سجل تدقيق وتعديل الحسابات' },
    { key: 'canAccessRecycleBin', labelAr: 'استرجاع المحذوفات من السلة', labelEn: 'Recycle Bin Access', desc: 'استعادة السجلات والأعضاء المحذوفين' },
    { key: 'canManageAccounts', labelAr: 'إنشاء وتعديل حسابات الموظفين', labelEn: 'Manage Accounts', desc: 'إدارة حسابات الكباتن والاستقبال والمحاسبين' }
  ];

  const rolesList: { id: AppRole; nameAr: string; color: string; icon: any }[] = [
    { id: 'manager', nameAr: 'المدير العام', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: Crown },
    { id: 'accountant', nameAr: 'مسؤول الحسابات', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: Wallet },
    { id: 'staff', nameAr: 'موظف الاستقبال', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30', icon: Users },
    { id: 'coach', nameAr: 'الكابتن والمدرب', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', icon: Dumbbell },
    { id: 'member', nameAr: 'العضو المشترك', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', icon: Users }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-[#101322] to-[#080b14] p-6 rounded-3xl border border-purple-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-bold shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">
                {isAr ? 'إدارة الأذونات والمهام التشغيلية للموظفين' : 'Permissions Matrix & Operational Tasks'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr ? 'تخصيص صلاحيات كل رتبة وإسناد ومتابعة المهام اليومية للكباتن والاستقبال والمحاسبين' : 'Configure permissions matrix and assign daily tasks to staff'}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-[#06080e] p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'permissions' ? 'bg-purple-600 text-white font-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'مصفوفة الأذونات' : 'Permissions'}</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'tasks' ? 'bg-purple-600 text-white font-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{isAr ? 'المهام والتكليفات' : 'Assigned Tasks'}</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: PERMISSIONS MATRIX ================= */}
      {activeTab === 'permissions' && (
        <div className="bg-[#0c101a] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>{isAr ? 'جدول تخصيص الصلاحيات والأذونات حسب الرتبة' : 'Role-Based Permissions Matrix'}</span>
            </h4>
            <span className="text-xs text-slate-500">
              {isAr ? '* انقر على المربع لتفعيل أو إيقاف الصلاحية فوراً' : '* Click checkbox to toggle permission'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
              <thead className="bg-[#06080e] text-slate-300 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5 min-w-[220px]">{isAr ? 'الصلاحية والإذن' : 'Permission'}</th>
                  {rolesList.map(r => (
                    <th key={r.id} className="p-3.5 text-center min-w-[110px]">
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${r.color}`}>
                        {r.nameAr}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {permissionItems.map(item => (
                  <tr key={item.key} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3.5">
                      <strong className="text-white block text-xs">{isAr ? item.labelAr : item.labelEn}</strong>
                      <span className="text-[10px] text-slate-500">{item.desc}</span>
                    </td>
                    {rolesList.map(r => {
                      const isAllowed = permissions[r.id]?.[item.key] ?? false;
                      const isGM = r.id === 'manager';

                      return (
                        <td key={r.id} className="p-3.5 text-center">
                          <button
                            onClick={() => handleTogglePermission(r.id, item.key)}
                            disabled={isGM}
                            className={`p-1.5 rounded-xl border transition-all ${
                              isAllowed 
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                                : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
                            } ${isGM ? 'cursor-not-allowed opacity-90' : 'cursor-pointer active:scale-95'}`}
                            title={isGM ? (isAr ? 'صلاحية دائمة للمدير العام' : 'Permanent GM Permission') : (isAr ? 'تبديل الصلاحية' : 'Toggle')}
                          >
                            {isAllowed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: EMPLOYEE TASKS ================= */}
      {activeTab === 'tasks' && (
        <div className="bg-[#0c101a] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>{isAr ? 'قائمة المهام والتكليفات اليومية للموظفين' : 'Operational Staff Tasks'}</span>
            </h4>

            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isAr ? '+ إسناد مهمة جديدة' : '+ Assign Task'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 className="w-10 h-10 mx-auto opacity-40 mb-2" />
                <p className="text-xs font-bold">{isAr ? 'لا توجد مهام مسندة حالياً' : 'No tasks assigned'}</p>
              </div>
            ) : (
              tasks.map(task => (
                <div 
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                    task.status === 'completed'
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className={`text-xs font-bold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.titleAr}
                      </h5>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        task.priority === 'urgent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {task.priority === 'urgent' ? (isAr ? 'عاجل جداً' : 'Urgent') : (isAr ? 'أولوية هامة' : 'High')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span>{isAr ? 'مسندة إلى:' : 'To:'} <strong className="text-purple-300">{task.assignedToName}</strong></span>
                      <span>{isAr ? 'تاريخ الاستحقاق:' : 'Due:'} <strong className="text-amber-400 font-mono">{task.dueDate}</strong></span>
                      {task.notes && <span>({task.notes})</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as any)}
                      className="bg-[#080b12] border border-slate-800 rounded-xl p-2 text-xs font-bold text-slate-200 focus:outline-none"
                    >
                      <option value="pending">{isAr ? 'معلقة (Pending)' : 'Pending'}</option>
                      <option value="in_progress">{isAr ? 'قيد التنفيذ' : 'In Progress'}</option>
                      <option value="completed">{isAr ? 'مكتملة ✔' : 'Completed'}</option>
                    </select>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 rounded-xl bg-rose-950/40 text-rose-400 hover:bg-rose-900/60"
                      title={isAr ? 'حذف المهمة' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= NEW TASK ASSIGNMENT MODAL ================= */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1320] border-2 border-purple-500/50 p-6 text-slate-100 shadow-2xl relative text-right rtl:text-right ltr:text-left space-y-4">
            <button
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{isAr ? 'إسناد وتكليف مهمة جديدة' : 'Assign New Task'}</h3>
                <p className="text-[11px] text-slate-400">{isAr ? 'حدد الموظف وتفاصيل المهمة وتاريخ الاستحقاق' : 'Select employee and due date'}</p>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">{isAr ? 'عنوان وتفاصيل المهمة' : 'Task Title'}</label>
                <input
                  type="text"
                  required
                  value={taskTitleAr}
                  onChange={(e) => setTaskTitleAr(e.target.value)}
                  placeholder={isAr ? 'مثال: مراجعة اشتراكات الأعضاء المنتهية...' : 'Task title'}
                  className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{isAr ? 'الموظف أو الكابتن المكلف' : 'Assigned Employee'}</label>
                <select
                  required
                  value={assignedEmployeeId}
                  onChange={(e) => setAssignedEmployeeId(e.target.value)}
                  className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white font-bold"
                >
                  <option value="">{isAr ? '-- اختر الموظف --' : '-- Select Employee --'}</option>
                  <optgroup label={isAr ? 'طاقم الاستقبال' : 'Front Desk'}>
                    {staff.map((s, idx) => <option key={`staff-opt-${s.id}-${idx}`} value={s.id}>{s.nameAr} (استقبال)</option>)}
                  </optgroup>
                  <optgroup label={isAr ? 'الكباتن والمدربين' : 'Coaches'}>
                    {coaches.map((c, idx) => <option key={`coach-opt-${c.id}-${idx}`} value={c.id}>{c.nameAr} (كابتن)</option>)}
                  </optgroup>
                  <optgroup label={isAr ? 'المحاسبين والمالية' : 'Accounting'}>
                    {accountants.map((a, idx) => <option key={`acc-opt-${a.id}-${idx}`} value={a.id}>{a.nameAr} (محاسب)</option>)}
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isAr ? 'الأولوية' : 'Priority'}</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="urgent">{isAr ? 'عاجل جداً' : 'Urgent'}</option>
                    <option value="high">{isAr ? 'أولوية هامة' : 'High'}</option>
                    <option value="normal">{isAr ? 'عادي' : 'Normal'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isAr ? 'تاريخ الاستحقاق' : 'Due Date'}</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{isAr ? 'ملاحظات وتوجيهات إضافية' : 'Notes'}</label>
                <textarea
                  rows={2}
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder={isAr ? 'توجيهات المدير العام للموظف...' : 'Notes...'}
                  className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-colors shadow-lg shadow-purple-600/20 cursor-pointer"
                >
                  {isAr ? 'إسناد وتثبيت المهمة' : 'Assign Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
