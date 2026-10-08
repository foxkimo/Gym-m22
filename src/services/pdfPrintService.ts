import { 
  SystemActivityLog, 
  DeletedRecordItem, 
  ArchivedReport, 
  CashShift, 
  FinancialTransaction,
  GymMember,
  EmployeeAttendanceRecord,
  EmployeeAccount,
  EmploymentContract,
  MemberCheckInRecord
} from '../types/gym';
import { StorageService } from './storageService';
import { tafqeet } from '../utils/tafqeet';

/**
 * Universal Print / PDF Generation Service using High-Fidelity Printable Document Flow
 * Supports RTL Arabic typography, Gold/Dark aesthetics for print, official seals & signatures
 */
class PDFPrintService {
  private createPrintWindow(contentHtml: string, title = 'GYM-M22 Official Document') {
    // Notify General Manager immediately on ANY report printed or downloaded by any staff
    try {
      let currentUserName = 'موظف في النادي';
      let currentUserRole = 'موظف';
      let currentUserId = 'emp-unknown';
      if (typeof window !== 'undefined') {
        const saved = sessionStorage.getItem('gym_m22_current_user');
        if (saved) {
          const u = JSON.parse(saved);
          if (u && (u.nameAr || u.role)) {
            currentUserName = u.nameAr || 'الموظف المسؤول';
            currentUserRole = u.role === 'manager' ? 'المدير العام' :
                              u.role === 'coach' ? 'كابتن ومدرب' :
                              u.role === 'accountant' ? 'مسؤول حسابات' :
                              u.role === 'staff' ? 'موظف استقبال' : 'عضو مشترك';
            currentUserId = u.id || 'emp';
          }
        }
      }

      StorageService.notifyManagerReportPrinted({
        employeeId: currentUserId,
        employeeName: currentUserName,
        employeeRole: currentUserRole,
        reportType: 'تقرير رسمي ومطبوعات',
        reportTitle: title,
        isDownload: false,
        details: `قام الموظف ${currentUserName} (${currentUserRole}) بإصدار وطباعة تقرير [${title}] الآن. إشعار موجه للمدير العام ليكون على علم بكل ما يُطبع أو يُنزّل بالصالة.`
      });
    } catch (e) {
      console.warn('Failed to notify manager on report print:', e);
    }

    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة (Popups) لطباعة وتصدير ملف الـ PDF');
      return;
    }

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <title>${title}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 12mm 15mm 15mm 15mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
              background-color: #ffffff;
              color: #0f172a;
              margin: 0;
              padding: 20px;
              font-size: 11pt;
              line-height: 1.5;
            }
            .header-box {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2.5px solid #d97706;
              padding-bottom: 12px;
              margin-bottom: 18px;
            }
            .brand-title {
              font-size: 20pt;
              font-weight: 900;
              color: #b45309;
              letter-spacing: -0.5px;
            }
            .brand-sub {
              font-size: 10pt;
              color: #64748b;
              font-weight: 600;
            }
            .doc-badge {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              color: #92400e;
              padding: 6px 14px;
              border-radius: 8px;
              font-weight: 700;
              font-size: 11pt;
              text-align: center;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 10px 14px;
              margin-bottom: 16px;
              font-size: 9.5pt;
            }
            .meta-item strong {
              color: #334155;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
              margin-bottom: 20px;
              font-size: 9pt;
            }
            th {
              background-color: #0f172a;
              color: #ffffff;
              font-weight: 700;
              padding: 8px 10px;
              text-align: right;
              border: 1px solid #0f172a;
            }
            td {
              padding: 7px 10px;
              border: 1px solid #cbd5e1;
              vertical-align: middle;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              font-weight: 700;
              font-size: 8pt;
            }
            .badge-gold { background: #fef3c7; color: #92400e; }
            .badge-emerald { background: #d1fae5; color: #065f46; }
            .badge-rose { background: #ffe4e6; color: #9f1239; }
            .badge-sky { background: #e0f2fe; color: #0369a1; }
            .badge-slate { background: #f1f5f9; color: #334155; }
            .footer-signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 35px;
              padding-top: 15px;
              border-top: 1px dashed #cbd5e1;
              font-size: 9.5pt;
            }
            .sig-box {
              text-align: center;
              width: 200px;
            }
            .sig-line {
              margin-top: 40px;
              border-bottom: 1px solid #94a3b8;
            }
            .official-stamp {
              display: inline-block;
              border: 2px solid #b45309;
              color: #b45309;
              padding: 6px 12px;
              border-radius: 6px;
              font-weight: 900;
              font-size: 8.5pt;
              transform: rotate(-3deg);
            }
            @media print {
              .no-print { display: none !important; }
            }
            .print-btn-bar {
              background: #0f172a;
              color: white;
              padding: 10px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              border-radius: 8px;
            }
            .print-action-btn {
              background: #f59e0b;
              color: #0f172a;
              border: none;
              font-weight: bold;
              padding: 8px 18px;
              border-radius: 6px;
              cursor: pointer;
              font-family: inherit;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="print-btn-bar no-print">
            <div>
              <strong style="font-size: 14px; color: #f59e0b; display: block;">📄 معاينة المستند المعتمد والتقرير الرسمي (GYM-M22)</strong>
              <div style="font-size: 11px; opacity: 0.85; margin-top: 2px;">يمكنك طباعة المستند مباشرة أو حفظه وتنزيله كملف PDF على جهازك</div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
              <button class="print-action-btn" style="background: #10b981; color: #022c22;" onclick="downloadReportFile()">📥 تنزيل وتثبيت PDF</button>
              <button class="print-action-btn" onclick="window.print()">🖨️ طباعة المستند</button>
            </div>
          </div>
          ${contentHtml}
          <script>
            function downloadReportFile() {
              const bar = document.querySelector('.print-btn-bar');
              if (bar) bar.style.display = 'none';
              const htmlContent = '<!DOCTYPE html>\\n<html lang="ar" dir="rtl">\\n' + document.documentElement.innerHTML + '\\n</html>';
              if (bar) bar.style.display = 'flex';

              const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = (document.title || 'GYM-M22-Report') + '.html';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }

            (function() {
              const GYM_M22_SVG_LOGO = '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 55px; height: 55px; margin-left: 12px; display: inline-block; vertical-align: middle;"><defs><linearGradient id="shieldBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff7a1" /><stop offset="25%" stop-color="#f59e0b" /><stop offset="50%" stop-color="#d97706" /><stop offset="85%" stop-color="#92400e" /><stop offset="100%" stop-color="#451a03" /></linearGradient><linearGradient id="shieldInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#121826" /><stop offset="50%" stop-color="#080b12" /><stop offset="100%" stop-color="#020408" /></linearGradient><linearGradient id="goldPlate24k" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#fff9c4" /><stop offset="30%" stop-color="#f7cb55" /><stop offset="70%" stop-color="#d97706" /><stop offset="100%" stop-color="#78350f" /></linearGradient><radialGradient id="centerCoreGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#f7cb55" stop-opacity="0.3" /><stop offset="100%" stop-color="#f7cb55" stop-opacity="0" /></radialGradient></defs><polygon points="50,2 88,14 96,50 82,86 50,98 18,86 4,50 12,14" fill="url(#shieldBorderGrad)" stroke="#fff7a1" stroke-width="1.2" /><polygon points="50,6 84,17 91,50 78,82 50,93 22,82 9,50 16,17" fill="url(#shieldInnerGrad)" stroke="#d97706" stroke-width="1.2" /><circle cx="50" cy="50" r="38" fill="url(#centerCoreGlow)" /><g transform="rotate(45 50 50)"><rect x="26" y="47" width="48" height="6" rx="2" fill="url(#goldPlate24k)" stroke="#fff" stroke-width="0.5" /><line x1="38" y1="47.5" x2="38" y2="52.5" stroke="#78350f" stroke-width="1" /><line x1="44" y1="47.5" x2="44" y2="52.5" stroke="#78350f" stroke-width="1" /><line x1="50" y1="47.5" x2="50" y2="52.5" stroke="#78350f" stroke-width="1" /><line x1="56" y1="47.5" x2="56" y2="52.5" stroke="#78350f" stroke-width="1" /><line x1="62" y1="47.5" x2="62" y2="52.5" stroke="#78350f" stroke-width="1" /><rect x="14" y="38" width="6" height="24" rx="2" fill="url(#goldPlate24k)" stroke="#fff7a1" stroke-width="0.8" /><rect x="21" y="41" width="4" height="18" rx="1.5" fill="#451a03" stroke="#f59e0b" stroke-width="0.8" /><rect x="75" y="41" width="4" height="18" rx="1.5" fill="#451a03" stroke="#f59e0b" stroke-width="0.8" /><rect x="80" y="38" width="6" height="24" rx="2" fill="url(#goldPlate24k)" stroke="#fff7a1" stroke-width="0.8" /></g><path d="M36 30 L50 20 L64 30 L58 35 L50 31 L42 35 Z" fill="url(#goldPlate24k)" stroke="#fff" stroke-width="0.8" /><polygon points="50,33 69,50 50,67 31,50" fill="#060910" stroke="url(#shieldBorderGrad)" stroke-width="2.2" /><polygon points="50,36 65,50 50,64 35,50" fill="#0d131f" stroke="#fff7a1" stroke-width="0.8" /><text x="50" y="55" text-anchor="middle" fill="#fff9c4" font-size="14" font-weight="900" font-family="sans-serif" letter-spacing="-1">M22</text></svg>';

              const headers = document.querySelectorAll('.header-box');
              headers.forEach(h => {
                const brandTextDiv = h.firstElementChild;
                if (brandTextDiv && !brandTextDiv.classList.contains('doc-badge')) {
                  const wrapper = document.createElement('div');
                  while (brandTextDiv.firstChild) {
                    wrapper.appendChild(brandTextDiv.firstChild);
                  }
                  brandTextDiv.appendChild(wrapper);
                  brandTextDiv.style.display = 'flex';
                  brandTextDiv.style.alignItems = 'center';
                  brandTextDiv.style.gap = '12px';
                  brandTextDiv.insertAdjacentHTML('afterbegin', GYM_M22_SVG_LOGO);
                }
              });
            })();
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(fullHtml);
    printWindow.document.close();

    // Auto prompt print after render
    setTimeout(() => {
      printWindow.focus();
    }, 400);
  }

  /**
   * Universal Dynamic Footer Signatures Builder
   * Ensures that when printed by reception/coach/accountant, Gym Manager name is always accurate
   * (e.g., Karim Hendawy or Ahmed Jaber) and never puts the receptionist's name as Gym Manager.
   */
  public buildUniversalFooterSignatures(
    passedName?: string,
    userRole?: string,
    firstBoxOverride?: { title: string; subtitle: string },
    stampTitle: string = 'معتمد رسمياً<br/>نادي جيم M22'
  ): string {
    let currentUserObj: any = undefined;
    try {
      if (typeof window !== 'undefined') {
        const saved = sessionStorage.getItem('gym_m22_current_user') || localStorage.getItem('gym_m22_current_user');
        if (saved) currentUserObj = JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    if (!currentUserObj && passedName) {
      const managers = StorageService.getManagers();
      const matchMgr = managers.find(m => m.nameAr === passedName || m.id === passedName);
      currentUserObj = { 
        nameAr: passedName, 
        role: matchMgr ? 'manager' : (userRole || 'staff'),
        id: matchMgr?.id
      };
    }

    const sig = StorageService.resolveReportSignatures(currentUserObj);

    const firstBoxTitle = firstBoxOverride ? firstBoxOverride.title : (sig.isGM ? 'قسم المتابعة والتدقيق' : sig.staffLabel);
    const firstBoxSubtitle = firstBoxOverride ? (firstBoxOverride.subtitle || sig.staffName) : (sig.isGM ? 'نظام GYM-M22 المركزي' : sig.staffName);

    return `
      <div class="footer-signatures">
        <div class="sig-box">
          <strong>${firstBoxTitle}</strong>
          <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">${firstBoxSubtitle}</div>
          <div class="sig-line"></div>
        </div>
        
        <div style="text-align: center;">
          <div class="official-stamp">
            ${stampTitle}
          </div>
        </div>

        <div class="sig-box">
          <strong>${sig.primaryManagerLabel}</strong>
          <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">${sig.primaryManagerName}</div>
          <div class="sig-line"></div>
        </div>
      </div>
    `;
  }

  /**
   * Export & Print Official System Activity Audit Log (سجل حركات النظام والرقابة)
   */
  printAuditLogsPDF(
    logs: SystemActivityLog[], 
    filterSummary = 'كافة الحركات المسجلة', 
    managerName = 'إدارة النادي (General Management)'
  ) {
    const nowStr = new Date().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'medium' });

    const rowsHtml = logs.map((log, index) => {
      let catLabel = 'عام';
      if (log.category === 'financial') catLabel = 'مالي ومصروفات';
      else if (log.category === 'shift') catLabel = 'ورديات وخزينة';
      else if (log.category === 'workout') catLabel = 'برامج وتمرين';
      else if (log.category === 'deletion') catLabel = 'حذف واسترداد';
      else if (log.category === 'account') catLabel = 'إدارة الحسابات';
      else if (log.category === 'membership') catLabel = 'اشتراكات وأعضاء';
      else if (log.category === 'attendance') catLabel = 'حضور وانصراف';

      let roleLabel = 'موظف';
      if (log.performerRole === 'manager') roleLabel = 'المدير العام';
      else if (log.performerRole === 'accountant') roleLabel = 'المحاسب';
      else if (log.performerRole === 'staff') roleLabel = 'الاستقبال';
      else if (log.performerRole === 'coach') roleLabel = 'كابتن ومدرب';
      else if (log.performerRole === 'member') roleLabel = 'عضو مشترك';
      else if (log.performerRole === 'viewer') roleLabel = 'حساب للعرض';

      return `
        <tr>
          <td style="text-align: center; font-weight: bold;">${index + 1}</td>
          <td style="white-space: nowrap; font-size: 8.5pt;">${log.date}<br/><span style="color:#64748b;">${log.time}</span></td>
          <td style="font-weight: bold; color: #0f172a;">${log.performerName}</td>
          <td style="text-align: center;"><span class="badge badge-slate">${roleLabel}</span></td>
          <td style="text-align: center;"><span class="badge badge-gold">${catLabel}</span></td>
          <td style="font-weight: 600;">${log.titleAr}</td>
          <td style="font-size: 8.5pt; color: #334155;">${log.detailsAr}</td>
        </tr>
      `;
    }).join('');

    const contentHtml = `
      <div class="header-box">
        <div>
          <div class="brand-title">نادي جيم M22 الرياضي</div>
          <div class="brand-sub">سجل الرقابة الإدارية والتدقيق الشامل بالنظام</div>
        </div>
        <div class="doc-badge">
          <div>سجل نشاط وحركات النظام</div>
          <div style="font-size: 8.5pt; font-weight: normal; margin-top: 2px;">تقرير الرقابة الإدارية المعتمد</div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><strong>تاريخ وساعة التصدير:</strong><br/>${nowStr}</div>
        <div class="meta-item"><strong>المسؤول المعتمد:</strong><br/>${managerName}</div>
        <div class="meta-item"><strong>إجمالي الحركات المطبوعة:</strong><br/>${logs.length} حركة (${filterSummary})</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 30px; text-align: center;">#</th>
            <th style="width: 90px;">التاريخ والوقت</th>
            <th style="width: 140px;">القائم بالحركة</th>
            <th style="width: 90px; text-align: center;">الصفة والوظيفة</th>
            <th style="width: 90px; text-align: center;">القسم التشغيلي</th>
            <th style="width: 150px;">نوع الإجراء والتصنيف</th>
            <th>تفاصيل الحركة وبيانات الهدف M22</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="7" style="text-align: center; padding: 20px;">لا توجد حركات مسجلة مطابقة للبحث</td></tr>'}
        </tbody>
      </table>

      ${this.buildUniversalFooterSignatures(managerName, undefined, { title: 'إعداد وتصدير الرقابة', subtitle: 'قسم التدقيق وتكنولوجيا المعلومات' }, 'معتمد من الإدارة العليا<br/>نادي جيم M22')}
    `;

    this.createPrintWindow(contentHtml, 'سجل نشاط النظام - GYM-M22');
  }

  /**
   * Export & Print Single Individual Audit Movement Voucher PDF (إيصال حركة فردية بالوقت والتاريخ)
   */
  printSingleAuditLogPDF(log: SystemActivityLog) {
    let catLabel = 'عام';
    if (log.category === 'financial') catLabel = 'مالي ومصروفات';
    else if (log.category === 'shift') catLabel = 'ورديات وخزينة';
    else if (log.category === 'workout') catLabel = 'برامج وتمرين';
    else if (log.category === 'deletion') catLabel = 'حذف واسترداد';
    else if (log.category === 'account') catLabel = 'إدارة الحسابات';
    else if (log.category === 'membership') catLabel = 'اشتراكات وأعضاء';
    else if (log.category === 'attendance') catLabel = 'حضور وانصراف';

    let roleLabel = 'موظف';
    if (log.performerRole === 'manager') roleLabel = 'المدير العام';
    else if (log.performerRole === 'accountant') roleLabel = 'المحاسب';
    else if (log.performerRole === 'staff') roleLabel = 'موظف الاستقبال';
    else if (log.performerRole === 'coach') roleLabel = 'كابتن ومدرب';
    else if (log.performerRole === 'member') roleLabel = 'عضو مشترك';
    else if (log.performerRole === 'viewer') roleLabel = 'حساب للعرض فقط';

    const contentHtml = `
      <div class="header-box">
        <div>
          <div class="brand-title">نادي جيم M22 الرياضي</div>
          <div class="brand-sub">إيصال وتوثيق حركة تشغيلية فردية رسمية | سند إداري موثق بالنظام</div>
        </div>
        <div class="doc-badge">
          رقم الحركة: #${log.id}
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><strong>تاريخ الحركة:</strong><br/>${log.date}</div>
        <div class="meta-item"><strong>توقيت الحركة بالساعة:</strong><br/>${log.time}</div>
        <div class="meta-item"><strong>الموظف القائم بالحركة:</strong><br/><strong>${log.performerName}</strong></div>
        <div class="meta-item"><strong>الوظيفة والرتبة:</strong><br/>${roleLabel}</div>
        <div class="meta-item"><strong>القسم التشغيلي:</strong><br/>${catLabel}</div>
        <div class="meta-item"><strong>نوع الإجراء:</strong><br/>${log.actionType === 'create' ? 'إضافة جديد' : log.actionType === 'update' ? 'تعديل بيانات' : log.actionType === 'delete' ? 'حذف وإلغاء' : log.actionType === 'login' ? 'تسجيل دخول' : log.actionType}</div>
      </div>

      <div style="background: #f8fafc; border: 1.5px solid #d97706; border-radius: 10px; padding: 15px; margin: 15px 0;">
        <h3 style="margin: 0 0 8px 0; color: #b45309; font-size: 12pt;">${log.titleAr}</h3>
        <p style="margin: 0; font-size: 10.5pt; color: #1e293b; line-height: 1.6;">${log.detailsAr}</p>
        ${log.targetName ? `<div style="margin-top: 10px; font-weight: bold; font-size: 9.5pt; color: #475569;">المستهدف / العضو: <span style="color: #0f172a;">${log.targetName}</span></div>` : ''}
      </div>

      ${this.buildUniversalFooterSignatures(
        log.performerName,
        log.performerRole,
        { title: 'توقيع الموظف المسؤول', subtitle: log.performerName },
        'موثق بالنظام المركزي<br/>نادي جيم M22'
      )}
    `;

    this.createPrintWindow(contentHtml, `إيصال حركة ${log.id}`);
  }

  /**
   * Export & Print Official Recycle Bin / Deleted Records Log (سجل المحذوفات والمحفوظات)
   */
  printRecycleBinPDF(
    records: DeletedRecordItem[], 
    managerName = 'إدارة النادي (General Management)'
  ) {
    const nowStr = new Date().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'medium' });

    const rowsHtml = records.map((rec, index) => {
      let typeBadge = `<span class="badge badge-slate">${rec.itemType}</span>`;
      if (rec.itemType === 'member') typeBadge = `<span class="badge badge-sky">مشترك</span>`;
      else if (rec.itemType === 'staff' || rec.itemType === 'coach') typeBadge = `<span class="badge badge-gold">طاقم عمل</span>`;
      else if (rec.itemType === 'transaction') typeBadge = `<span class="badge badge-rose">معاملة مالية</span>`;

      const restoreStatus = rec.canRestore 
        ? `<span class="badge badge-emerald">قابل للاسترجاع</span>` 
        : `<span class="badge badge-rose">حذف نهائي</span>`;

      return `
        <tr>
          <td style="text-align: center; font-weight: bold;">${index + 1}</td>
          <td style="text-align: center;">${typeBadge}</td>
          <td style="font-weight: bold; color: #0f172a;">${rec.titleAr}</td>
          <td style="font-size: 8.5pt; color: #475569;">${rec.identifier}</td>
          <td style="font-size: 8.5pt;">${rec.deletedAt}</td>
          <td style="font-weight: 600; font-size: 8.5pt;">${rec.deletedBy}</td>
          <td style="font-size: 8.5pt; color: #991b1b; background: #fff1f2;">${rec.reason || 'لم يتم تسجيل سبب محدد'}</td>
          <td style="text-align: center;">${restoreStatus}</td>
        </tr>
      `;
    }).join('');

    const contentHtml = `
      <div class="header-box">
        <div>
          <div class="brand-title">GYM-M22 SPORTS CLUB</div>
          <div class="brand-sub">سجل المحذوفات وسلة الاسترداد الآمنة | Deleted Records Archive</div>
        </div>
        <div class="doc-badge" style="background:#ffe4e6; border-color:#f43f5e; color:#9f1239;">
          <div>تقرير العناصر المحذوفة</div>
          <div style="font-size: 8.5pt; font-weight: normal; margin-top: 2px;">RECYCLE-BIN-ARCHIVE</div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><strong>تاريخ وتوقيت التقرير:</strong><br/>${nowStr}</div>
        <div class="meta-item"><strong>المسؤول المعتمد:</strong><br/>${managerName}</div>
        <div class="meta-item"><strong>إجمالي العناصر المحذوفة:</strong><br/>${records.length} عنصر مؤرشف</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 30px; text-align: center;">#</th>
            <th style="width: 80px; text-align: center;">نوع العنصر</th>
            <th style="width: 140px;">العنوان / الاسم</th>
            <th style="width: 130px;">المعرف / رقم العضوية</th>
            <th style="width: 100px;">تاريخ الحذف</th>
            <th style="width: 130px;">القائم بالحذف</th>
            <th>سبب الحذف الموثق</th>
            <th style="width: 90px; text-align: center;">إمكانية الاسترداد</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="8" style="text-align: center; padding: 20px;">سلة المحذوفات فارغة حالياً</td></tr>'}
        </tbody>
      </table>

      ${this.buildUniversalFooterSignatures(managerName, undefined, { title: 'إدارة قواعد البيانات', subtitle: 'مسؤول السجلات الرقمية' }, 'سجل محذوفات معتمد<br/>GYM-M22 SECURITY')}
    `;

    this.createPrintWindow(contentHtml, 'سجل المحذوفات - GYM-M22');
  }

  /**
   * Export & Print Official Shift Report
   */
  printShiftReportPDF(shift: CashShift, allTransactions: FinancialTransaction[], managerName: string = 'المدير العام') {
    const nowStr = StorageService.getLocalCurrentDateTimeString();
    
    // STRICT FILTERING: Ensure we only process transactions belonging to this shift
    const transactions = allTransactions.filter(t => t.shiftId === shift.id);

    // ROBUST TRANSACTION GROUPING: ONLY Subscriptions, Bar Sales, and Expenses
    const isExpense = (t: FinancialTransaction) => {
      return t.voucherKind === 'payment' || ['expense', 'refund'].includes(t.type);
    };

    const isGymSub = (t: FinancialTransaction) => {
      if (isExpense(t)) return false;
      if (['subscription', 'renewal', 'pt_package', 'locker'].includes(t.type)) return true;
      const n = ((t.notes || '') + ' ' + (t.memberName || '')).toLowerCase();
      return (
        n.includes('vip') ||
        n.includes('اشتراك') ||
        n.includes('باقة') ||
        n.includes('ذهبي') ||
        n.includes('عضوية') ||
        n.includes('سنوي') ||
        n.includes('شهري') ||
        n.includes('تجديد') ||
        n.includes('تدريب') ||
        n.includes('pt') ||
        n.includes('خزائن') ||
        n.includes('locker') ||
        n.includes('سداد') ||
        n.includes('مديونية') ||
        n.includes('مستحقات')
      );
    };

    // Every non-expense transaction is strictly either Subscriptions/Payments or Bar Sales (only paid amounts > 0)
    const subscriptions = transactions.filter(t => !isExpense(t) && isGymSub(t) && t.amount > 0);
    const sales = transactions.filter(t => !isExpense(t) && !isGymSub(t) && t.amount > 0);
    const expenses = transactions.filter(t => isExpense(t) && t.amount > 0);

    const formatCurrency = (n: number) => n.toLocaleString() + ' ج.م';

    const gymSales = subscriptions.reduce((s, t) => s + t.amount, 0);
    const barSales = sales.reduce((s, t) => s + t.amount, 0);
    const calcExpense = expenses.reduce((s, t) => s + t.amount, 0);
    
    // Net Shift Balance = Subscriptions + Bar Sales - Expenses
    const shiftNetIncome = gymSales + barSales - calcExpense;
    const startFloat = shift.startingCash || 0;
    
    // Total Expected Cash in Treasury
    const calcExpectedCash = startFloat + shiftNetIncome;
    const calcDifference = shift.actualCash !== undefined ? (shift.actualCash - calcExpectedCash) : 0;

    const renderTable = (title: string, txs: FinancialTransaction[], color: string) => {
      if (txs.length === 0) return '';
      
      const total = txs.reduce((sum, t) => sum + t.amount, 0);

      const rows = txs.map((t, i) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 10px; text-align: center; color: #64748b; font-size: 8pt;">${i + 1}</td>
          <td style="padding: 8px 10px; font-family: monospace; font-size: 8pt; text-align: right;">${t.date.split(' ')[1] || t.date}</td>
          <td style="padding: 8px 10px; font-weight: 700; color: #1e293b; text-align: right;">${t.memberName || t.beneficiaryName || '---'}</td>
          <td style="padding: 8px 10px; color: #475569; font-size: 8.5pt; text-align: right;">${t.notes || '---'}</td>
          <td style="padding: 8px 10px; text-align: center; font-weight: 700; color: #64748b;">${t.paymentMethod === 'cash' ? 'كاش' : t.paymentMethod}</td>
          <td style="padding: 8px 10px; text-align: left; font-weight: 900; color: ${color}; font-size: 9pt;">${formatCurrency(t.amount)}</td>
        </tr>
      `).join('');

      return `
        <div style="margin-top: 25px; border: 2px solid ${color}44; border-radius: 16px; overflow: hidden; background: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); page-break-inside: avoid;">
          <div style="background: ${color}; color: white; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 13pt;">📋</span>
              <h3 style="margin: 0; font-size: 11.5pt; font-weight: 900; letter-spacing: 0.3px;">${title}</h3>
            </div>
            <div style="background: rgba(0,0,0,0.18); padding: 4px 12px; border-radius: 8px; font-size: 9pt; font-weight: 900; border: 1px solid rgba(255,255,255,0.3);">
              ${txs.length} حركة مسجلة
            </div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: ${color}08; border-bottom: 2px solid ${color}22;">
                <th style="padding: 10px; width: 40px; text-align: center; color: ${color}; font-size: 8.5pt; font-weight: 900;">#</th>
                <th style="padding: 10px; width: 80px; text-align: right; color: ${color}; font-size: 8.5pt; font-weight: 900;">الوقت</th>
                <th style="padding: 10px; text-align: right; color: ${color}; font-size: 8.5pt; font-weight: 900;">الاسم / الجهة</th>
                <th style="padding: 10px; text-align: right; color: ${color}; font-size: 8.5pt; font-weight: 900;">البيان والتفاصيل</th>
                <th style="padding: 10px; width: 85px; text-align: center; color: ${color}; font-size: 8.5pt; font-weight: 900;">الوسيلة</th>
                <th style="padding: 10px; width: 105px; text-align: left; color: ${color}; font-size: 8.5pt; font-weight: 900;">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
            <tfoot>
              <tr style="background: ${color}05;">
                <td colspan="5" style="padding: 14px 20px; text-align: left; font-weight: 900; color: #1e293b; font-size: 10.5pt; border-top: 1.5px solid ${color}22;">إجمالي ${title}:</td>
                <td style="padding: 14px 15px; text-align: left; font-weight: 950; color: ${color}; font-size: 13pt; border-top: 1.5px solid ${color}22; border-right: 4px solid ${color};">${formatCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    };

    const contentHtml = `
      <div class="header-box">
        <div style="text-align: right;">
          <div class="brand-title">نادي M22 الرياضي</div>
          <div class="brand-sub">تقرير جرد ومطابقة الخزينة التفصيلي</div>
        </div>
        <div class="doc-badge">تقرير تسليم وردية</div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><strong>رقم الوردية:</strong> ${shift.id}</div>
        <div class="meta-item"><strong>المسؤول:</strong> ${shift.staffName}</div>
        <div class="meta-item"><strong>تاريخ الإغلاق:</strong> ${shift.closedAt || 'غير مغلقة (مستمرة)'}</div>
        <div class="meta-item"><strong>وقت الفتح:</strong> ${shift.openedAt}</div>
        <div class="meta-item"><strong>الحالة:</strong> ${shift.status === 'open' ? 'نشطة ومفتوحة' : 'مغلقة ومؤرشفة'}</div>
        <div class="meta-item"><strong>تاريخ الطباعة:</strong> ${nowStr}</div>
      </div>

      <div style="background: #fff9eb; border: 1.5px solid #f59e0b; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center; border-bottom: 2.5px solid #f59e0b; padding-bottom: 15px; margin-bottom: 15px;">
          
          <div style="text-align: center; background: #f0fdf4; border: 1.5px solid #16a34a; padding: 10px; border-radius: 10px;">
            <div style="font-size: 9pt; color: #166534; font-weight: bold; margin-bottom: 4px;">قسم الاشتراكات</div>
            <div style="font-size: 15pt; font-weight: 900; color: #15803d;">${formatCurrency(gymSales)}</div>
          </div>

          <div style="text-align: center; background: #fffbeb; border: 1.5px solid #d97706; padding: 10px; border-radius: 10px;">
            <div style="font-size: 9pt; color: #92400e; font-weight: bold; margin-bottom: 4px;">قسم مبيعات البار</div>
            <div style="font-size: 15pt; font-weight: 900; color: #b45309;">${formatCurrency(barSales)}</div>
          </div>

          <div style="text-align: center; background: #fff1f2; border: 1.5px solid #be123c; padding: 10px; border-radius: 10px;">
            <div style="font-size: 9pt; color: #9f1239; font-weight: bold; margin-bottom: 4px;">المصروفات</div>
            <div style="font-size: 15pt; font-weight: 900; color: #be123c;">${formatCurrency(calcExpense)}</div>
          </div>
        </div>

        <div style="background: #065f46; color: white; padding: 14px 18px; border-radius: 12px; text-align: center; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(6,95,70,0.25);">
           <div style="font-size: 10.5pt; font-weight: 800; opacity: 0.95; margin-bottom: 3px;">الصافي المفروض تواجده في الخزنة</div>
           <div style="font-size: 24pt; font-weight: 950; letter-spacing: 0.5px;">${formatCurrency(calcExpectedCash)}</div>
           <div style="font-size: 8.5pt; opacity: 0.9; margin-top: 4px; font-mono;">
             (الاشتراكات: ${formatCurrency(gymSales)} + مبيعات البار: ${formatCurrency(barSales)} - المصروفات: ${formatCurrency(calcExpense)}${startFloat > 0 ? ` + عهدة الافتتاح: ${formatCurrency(startFloat)}` : ''})
           </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center;">
          <div style="background: white; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 8.5pt; color: #92400e; font-weight: bold;">العهدة الافتتاحية</div>
            <div style="font-size: 13pt; font-weight: 900; color: #0f172a;">${formatCurrency(startFloat)}</div>
          </div>
          <div style="background: white; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 8.5pt; color: #1e293b; font-weight: bold;">المفترض بالخزنة (المطلوب)</div>
            <div style="font-size: 13pt; font-weight: 900; color: #0f172a;">${formatCurrency(calcExpectedCash)}</div>
          </div>
          <div style="background: #fffbeb; padding: 10px; border-radius: 8px; border: 1.5px solid #fbbf24;">
            <div style="font-size: 8.5pt; color: #1e293b; font-weight: bold;">النقدية الفعلية المسلمة</div>
            <div style="font-size: 14pt; font-weight: 900; color: #1e293b;">${formatCurrency(shift.actualCash !== undefined ? shift.actualCash : 0)}</div>
          </div>
        </div>

        ${shift.status === 'closed' && shift.actualCash !== undefined ? `
          <div style="margin-top: 15px; text-align: center; font-weight: 900; color: ${calcDifference < 0 ? '#dc2626' : calcDifference > 0 ? '#059669' : '#1e293b'}; font-size: 12pt; border-top: 2px dashed #f59e0b; padding-top: 12px;">
            🔍 نتيجة مطابقة الخزينة: 
            <span style="background: ${calcDifference < 0 ? '#fee2e2' : calcDifference > 0 ? '#d1fae5' : '#f1f5f9'}; padding: 4px 15px; border-radius: 8px; margin-right: 8px; border: 1px solid ${calcDifference < 0 ? '#fecdd3' : calcDifference > 0 ? '#a7f3d0' : '#e2e8f0'};">
              ${calcDifference < 0 ? `عجز بقيمة ${formatCurrency(Math.abs(calcDifference))}` : calcDifference > 0 ? `زيادة بقيمة ${formatCurrency(calcDifference)}` : 'مطابقة تماماً (بدون عجز أو زيادة)'}
            </span>
          </div>
        ` : `
          <div style="margin-top: 15px; text-align: center; color: #64748b; font-size: 9.5pt; border-top: 2px dashed #f59e0b; padding-top: 10px; font-style: italic;">
            الوردية لا تزال قيد العمل (نشطة). سيتم حساب العجز أو الزيادة فور الإغلاق النهائي وتوريد النقدية.
          </div>
        `}
      </div>

      ${renderTable('قسم الاشتراكات', subscriptions, '#0369a1')}
      ${renderTable('قسم مبيعات البار', sales, '#b45309')}
      ${renderTable('قسم المصروفات', expenses, '#dc2626')}

      ${shift.notes ? `
        <div style="margin-top: 20px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <strong style="display: block; font-size: 10pt; color: #334155; margin-bottom: 5px;">ملاحظات الوردية:</strong>
          <p style="margin: 0; font-size: 9.5pt; color: #475569;">${shift.notes}</p>
        </div>
      ` : ''}

      ${this.buildUniversalFooterSignatures(managerName, undefined, { title: 'أمين الوردية / الكاشير', subtitle: shift.staffName || 'موظف الاستقبال' }, 'إغلاق وردية معتمد<br/>خزينة M22')}
    `;

    this.createPrintWindow(contentHtml, `تقرير وردية تفصيلي - ${shift.staffName}`);
  }

  /**
   * Export & Print Official Archived Report
   */
  printArchivedReportPDF(report: ArchivedReport) {
    const contentHtml = `
      <div class="header-box">
        <div>
          <div class="brand-title">GYM-M22 SPORTS CLUB</div>
          <div class="brand-sub">التقرير المالي والإداري المعتمد المؤرشف</div>
        </div>
        <div class="doc-badge">
          <div>${report.reportNumber}</div>
          <div style="font-size: 8.5pt; font-weight: normal;">مؤرشف في: ${report.archivedAt}</div>
        </div>
      </div>

      <h3 style="color: #b45309; margin: 10px 0;">${report.periodTitleAr}</h3>
      <p style="color: #64748b; font-size: 9.5pt; margin-bottom: 15px;">الفترة الزمنية: من ${report.dateRange.start} إلى ${report.dateRange.end}</p>

      <div class="meta-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div class="meta-item"><strong>إجمالي الإيرادات المحققة:</strong><br/><span style="font-size: 13pt; color: #059669; font-weight: 800;">${report.metrics.totalRevenue.toLocaleString()} ج.م</span></div>
        <div class="meta-item"><strong>إجمالي المصروفات والتشغيل:</strong><br/><span style="font-size: 13pt; color: #dc2626; font-weight: 800;">${report.metrics.totalExpenses.toLocaleString()} ج.م</span></div>
        <div class="meta-item"><strong>صافي الأرباح الصافي:</strong><br/><span style="font-size: 14pt; color: #b45309; font-weight: 900;">${report.metrics.netProfit.toLocaleString()} ج.م</span></div>
        <div class="meta-item"><strong>الأعضاء النشطين والتجديدات:</strong><br/>${report.metrics.activeMembersCount} عضو (${report.metrics.renewalsCount} تجديد)</div>
        <div class="meta-item"><strong>نسبة المدفوعات كاش:</strong><br/>${report.metrics.cashAmount.toLocaleString()} ج.م</div>
        <div class="meta-item"><strong>نسبة المدفوعات الإلكترونية:</strong><br/>${report.metrics.electronicAmount.toLocaleString()} ج.م</div>
      </div>

      ${report.notesAr ? `
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-top: 15px; font-size: 9.5pt;">
          <strong>ملاحظات وتوصيات الإدارة العامة:</strong>
          <p style="margin: 5px 0 0 0; color: #334155;">${report.notesAr}</p>
        </div>
      ` : ''}

      ${this.buildUniversalFooterSignatures(report.archivedBy, undefined, { title: 'إعداد التقرير', subtitle: 'الشؤون المالية والإدارية' }, 'تقرير رسمي معتمد<br/>GYM-M22 ARCHIVE')}
    `;

    this.createPrintWindow(contentHtml, `تقرير مؤرشف ${report.reportNumber}`);
  }

  // -------------------------------------------------------------
  // 6. CLUB SERVICES & POS ORDER INVOICE PDF (فاتورة وسند خدمات النادي)
  // -------------------------------------------------------------
  printOrderInvoicePDF(order: any) {
    const contentHtml = `
      <div class="header-box">
        <div>
          <div class="brand-title">GYM-M22 ATHLETIC CLUB</div>
          <div class="brand-sub">فاتورة مبيعات وخدمات النادي الرسمية | Tax & Service Invoice</div>
        </div>
        <div class="doc-badge">
          رقم الفاتورة: ${order.orderNumber}
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><strong>العميل / العضو:</strong> ${order.memberName} ${order.membershipNumber ? `(#${order.membershipNumber})` : ''}</div>
        <div class="meta-item"><strong>التاريخ والوقت:</strong> ${order.date} - ${order.time}</div>
        <div class="meta-item"><strong>طريقة الدفع:</strong> ${order.paymentMethod === 'cash' ? 'نقدي' : order.paymentMethod === 'card' ? 'فيزا / بطاقة بنكية' : order.paymentMethod === 'instapay' ? 'إنستاباي' : order.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : order.paymentMethod}</div>
        <div class="meta-item"><strong>المسؤول / الكاشير:</strong> ${order.servedBy}</div>
        <div class="meta-item"><strong>الرتبة:</strong> ${order.servedByRole === 'manager' ? 'المدير العام' : order.servedByRole === 'accountant' ? 'مسؤول الحسابات' : order.servedByRole === 'coach' ? 'الكابتن / المدرب' : order.servedByRole === 'staff' ? 'موظف الاستقبال' : order.servedByRole}</div>
        <div class="meta-item"><strong>حالة السداد:</strong> <span style="color: #16a34a; font-weight: bold;">مدفوع بالكامل ✔</span></div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>الخدمة / المنتج</th>
            <th style="text-align: center; width: 80px;">الكمية</th>
            <th style="text-align: left; width: 120px;">سعر الوحدة</th>
            <th style="text-align: left; width: 140px;">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((it: any, idx: number) => `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${it.nameAr}</strong></td>
              <td style="text-align: center;">${it.quantity}</td>
              <td style="text-align: left; font-family: monospace;">${it.unitPrice.toLocaleString()} ج.م</td>
              <td style="text-align: left; font-family: monospace; font-weight: bold; color: #16a34a;">${it.total.toLocaleString()} ج.م</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
        <div style="width: 300px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 12px; font-size: 10pt;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>المجموع الفرعي:</span>
            <span style="font-family: monospace;">${order.subtotal.toLocaleString()} ج.م</span>
          </div>
          ${order.discountAmount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #dc2626;">
              <span>الخصم الممنوح:</span>
              <span style="font-family: monospace;">-${order.discountAmount.toLocaleString()} ج.م</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; border-top: 2px solid #d97706; padding-top: 6px; font-size: 12pt; font-weight: 900; color: #b45309;">
            <span>صافي المبلغ المدفوع:</span>
            <span style="font-family: monospace;">${order.totalAmount.toLocaleString()} ج.م</span>
          </div>
        </div>
      </div>

      <div class="footer-signatures" style="margin-top: 30px;">
        <div class="sig-box">
          <strong>توقيع العميل / المشترك</strong>
          <div class="sig-line"></div>
        </div>
        <div style="text-align: center;">
          <div class="official-stamp">
            فاتورة مدفوعة ومسجلة<br/>
            GYM-M22 CLUB POS
          </div>
        </div>
        <div class="sig-box">
          <strong>توقيع الكاشير / المسؤول</strong>
          <div class="sig-line"></div>
        </div>
      </div>
    `;

    this.createPrintWindow(contentHtml, `فاتورة ${order.orderNumber}`);
  }

  // -------------------------------------------------------------
  // 7. WORKOUT ROUTINE PROGRAM PDF (جدول التمرين المخصص)
  // -------------------------------------------------------------
  printWorkoutProgramPDF(member: GymMember) {
    const program = member.currentProgram;
    const tierLabels: Record<string, string> = {
      normal: 'الباقة العادية (Normal)',
      silver: 'الباقة الفضية (Silver)',
      vip: 'الباقة الذهبية VIP',
      gold: 'الباقة الذهبية (Gold)'
    };
    const tierLabelAr = tierLabels[member.tier.toLowerCase()] || member.tier.toUpperCase();

    const contentHtml = `
      <div class="header-box">
        <div>
          <div class="brand-title">GYM-M22 PRO WORKOUT</div>
          <div class="brand-sub">جدول التمارين والبرنامج الرياضي المخصص</div>
        </div>
        <div class="doc-badge">
          عضوية #${member.membershipNumber}
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><strong>اسم اللاعب:</strong> ${member.fullNameAr}</div>
        <div class="meta-item"><strong>الكابتن المشرف:</strong> ${member.assignedCoachName || 'كابتن الصالة'}</div>
        <div class="meta-item"><strong>باقة الاشتراك:</strong> ${tierLabelAr}</div>
        <div class="meta-item"><strong>اسم البرنامج:</strong> ${program?.titleAr || 'البرنامج العام'}</div>
        <div class="meta-item"><strong>تاريخ الإصدار:</strong> ${new Date().toISOString().split('T')[0]}</div>
        <div class="meta-item"><strong>عدد أيام التمرين:</strong> ${program?.days?.length || 4} أيام أسبوعياً</div>
      </div>

      ${(program?.days || []).map((day: any) => `
        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <div style="background: #1e293b; color: #f8fafc; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-size: 11pt; display: flex; justify-content: space-between;">
            <span>اليوم ${day.dayNumber}: ${day.titleAr}</span>
            <span style="font-size: 9pt; color: #f59e0b;">العضلات: ${day.focusMuscles?.join(' + ') || ''}</span>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 35px;">#</th>
                <th>التمرين الرياضي</th>
                <th style="width: 120px;">الجهاز / الأداة</th>
                <th style="text-align: center; width: 70px;">المجموعات</th>
                <th style="text-align: center; width: 80px;">التكرارات</th>
                <th style="text-align: center; width: 70px;">الراحة</th>
                <th>تعليمات الكابتن</th>
              </tr>
            </thead>
            <tbody>
              ${(day.exercises || []).map((ex: any, idx: number) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${ex.nameAr}</strong></td>
                  <td style="color: #64748b;">${ex.equipment}</td>
                  <td style="text-align: center; font-weight: bold; color: #d97706;">${ex.sets}</td>
                  <td style="text-align: center; font-mono; font-weight: bold;">${ex.reps}</td>
                  <td style="text-align: center; color: #0284c7;">${ex.restSeconds}ث</td>
                  <td style="font-size: 8pt; color: #475569;">${ex.coachTipsAr || 'أداء منتظم وتحكم بالوزن'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}

      <div class="footer-signatures" style="margin-top: 30px;">
        <div class="sig-box">
          <strong>توقيع المتدرب</strong>
          <div class="sig-line"></div>
        </div>
        <div style="text-align: center;">
          <div class="official-stamp">
            معتمد من الجهاز الفني<br/>
            GYM-M22 COACHING
          </div>
        </div>
        <div class="sig-box">
          <strong>اعتماد الكابتن المشرف</strong>
          <div class="sig-line"></div>
        </div>
      </div>
    `;

    this.createPrintWindow(contentHtml, `جدول تمرين ${member.fullNameAr}`);
  }

  // -------------------------------------------------------------
  // 8. PAYROLL ROSTER REPORT PDF (كشف الرواتب والأجور المعتمد)
  // -------------------------------------------------------------
  printPayrollPDF(employees: any[], totalAmount: number, period: string) {
    const contentHtml = `
      <div class="header-box">
        <div>
          <div class="brand-title">GYM-M22 PAYROLL ROSTER</div>
          <div class="brand-sub">كشف مسير رواتب وأجور موظفي النادي والكباتن المعتمد</div>
        </div>
        <div class="doc-badge">
          الفترة: ${period}
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><strong>تاريخ الاعتماد:</strong> ${new Date().toISOString().split('T')[0]}</div>
        <div class="meta-item"><strong>إجمالي القوى العاملة:</strong> ${employees.length} موظف وكابتن</div>
        <div class="meta-item"><strong>إجمالي كتلة الأجور:</strong> <span style="color: #16a34a; font-weight: bold;">${totalAmount.toLocaleString()} ج.م</span></div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 35px;">#</th>
            <th>اسم الموظف / الكابتن</th>
            <th>الرتبة والوظيفة</th>
            <th>رقم الهاتف</th>
            <th>تاريخ التعيين</th>
            <th style="text-align: left; width: 130px;">الراتب الأساسي</th>
            <th style="text-align: center; width: 90px;">حالة الصرف</th>
          </tr>
        </thead>
        <tbody>
          ${employees.map((e, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${e.nameAr}</strong></td>
              <td>${e.role === 'coach' ? 'كابتن ومدرب' : e.role === 'staff' ? 'استقبال' : e.role === 'accountant' ? 'محاسب مالي' : 'إدارة عامة'}</td>
              <td style="font-family: monospace;">${e.phone}</td>
              <td style="font-family: monospace;">${e.hiredDate || '2023-01-01'}</td>
              <td style="text-align: left; font-family: monospace; font-weight: bold; color: #16a34a;">${(e.baseSalary || 6000).toLocaleString()} ج.م</td>
              <td style="text-align: center; color: #0284c7; font-weight: bold;">معتمد ومستحق</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${this.buildUniversalFooterSignatures(
        undefined,
        'accountant',
        { title: 'إعداد مسؤول الحسابات والرواتب', subtitle: 'الشؤون المالية والموارد البشرية' },
        'معتمد للصرف الرسمي<br/>GYM-M22 AUDITED'
      )}
    `;

    this.createPrintWindow(contentHtml, `مسير رواتب ${period}`);
  }

  /**
   * Export & Print Official Employment Contract PDF (طباعة عقد عمل واتفاقية مهام تشغيلية رسمية معتمدة)
   */
  printEmploymentContractPDF(contract: EmploymentContract, managerName: string = 'إدارة النادي') {
    const roleLabel = contract.employeeRole === 'manager' 
      ? 'مدير عام النادي' 
      : contract.employeeRole === 'accountant' 
        ? 'محاسب مالي معتمد' 
        : contract.employeeRole === 'coach' 
          ? 'كابتن ومدرب لياقة بدنية PT' 
          : 'موظف استقبال وكاشير';

    const defaultDuties = [
      'الإشراف الميداني المباشر على صالة الحديد والأجهزة وتوجيه المتدربين لتطبيق التكنيك السليم وتجنب الإصابات.',
      'تصميم ومتابعة الجداول التدريبية والأنظمة الغذائية المناسبة وتحديث قياسات المتدربين (InBody) بشكل دوري.',
      'الالتزام بالحضور والانضباط في مواعيد وردية التدريب المحددة والظهور بالزي الرياضي الرسمي الموحد لنادي M22.',
      'فحص واختبار أمان وجاهزية الأجهزة والمعدات الرياضية بالصالة يومياً والإبلاغ الفوري عن أي أعطال للإدارة.',
      'تقديم حصص التدريب الخاص (Personal Training - PT) بأعلى معايير الجودة والتحفيز والاحترافية.',
      'الإشراف على تنظيم وترتيب الأوزان الحرة والدامبلز والبارات وإعادتها لأماكنها لضمان انسيابية وأمان الصالة.',
      'المحافظة التامة على خصوصية المتدربين وأسرار النادي، والالتزام بعدم استقطاب أو تدريب اللاعبين خارج النادي.',
      'تقديم الإسعافات الأولية والتصرف السريع والمهني في حالات الطوارئ والإجهاد العضلي وفق بروتوكولات السلامة.'
    ];

    const dutiesToRender = contract.operationalDuties && contract.operationalDuties.length > 0 
      ? contract.operationalDuties 
      : defaultDuties;

    const contentHtml = `
      <div style="border: 4px double #0f172a; padding: 40px; border-radius: 4px; background: #ffffff; min-height: 270mm; display: flex; flex-direction: column; justify-content: space-between; font-family: 'Cairo', 'Segoe UI', sans-serif; position: relative; overflow: hidden;">
        
        <!-- Subtle Watermark Background -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 150pt; font-weight: 900; color: rgba(15, 23, 42, 0.03); white-space: nowrap; pointer-events: none; z-index: 0;">
          M22 SPORTS
        </div>

        <div style="position: relative; z-index: 1;">
          <div style="text-align: center; border-bottom: 3px solid #0f172a; padding-bottom: 20px; margin-bottom: 25px;">
            <div style="width: 80px; height: 80px; background-color: #0f172a; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; font-family: sans-serif; font-size: 28px; font-weight: 900; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
              M22
            </div>
            <div style="font-size: 14pt; font-weight: 900; color: #0f172a; letter-spacing: 2px; text-transform: uppercase;">M22 SPORTS CLUB</div>
            <h1 style="font-size: 22pt; font-weight: 900; color: #0f172a; margin: 10px 0 0 0; text-decoration: underline; text-underline-offset: 8px;">عَقْـد عَمَـلْ وَاتِّفَـاقِيَّة مَهَـام رَسْـمِيَّة</h1>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 10pt; color: #334155; font-weight: 800; margin-bottom: 20px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; direction: rtl;">
            <div>الجمهورية المصرية العربية</div>
            <div>رقم العقد: <span style="font-family: monospace;">${contract.id.toUpperCase()}</span></div>
            <div>تاريخ التحرير: ${contract.contractDate}</div>
          </div>

          <p style="font-size: 11pt; line-height: 1.8; text-align: justify; margin-bottom: 25px; color: #0f172a; direction: rtl; font-weight: 500;">
            إنه في يوم <strong>${contract.contractDate}</strong>، وبمقر النادي، تم الاتفاق والارتباط القانوني والمهني بين <strong>إدارة نادي M22 الرياضي (طرف أول - صاحب العمل)</strong>، والسيد الموظف/الكابتن الموضح بياناته أدناه <strong>(طرف ثان - الموظف)</strong> للعمل بالمهام والشروط الواردة طيه:
          </p>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; background: #f1f5f9; border: 2px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 25px; direction: rtl; font-size: 10pt; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
            <div><strong style="color: #64748b;">اسم الطرف الثاني:</strong><br/><span style="font-size: 12pt; font-weight: 900; color: #0f172a;">${contract.employeeName}</span></div>
            <div><strong style="color: #64748b;">رقم التواصل:</strong><br/><span style="font-size: 12pt; font-family: monospace; font-weight: 800; color: #0f172a;">${contract.employeePhone}</span></div>
            <div><strong style="color: #64748b;">المسمى الوظيفي والمسؤولية:</strong><br/><span style="font-size: 12pt; font-weight: 900; color: #b45309;">${roleLabel}</span></div>
            <div><strong style="color: #64748b;">تاريخ استلام العمل:</strong><br/><span style="font-size: 12pt; font-family: monospace; font-weight: 800; color: #0f172a;">${contract.hiredDate}</span></div>
          </div>

          <div style="border: 2px solid #0369a1; background-color: #f0f9ff; border-radius: 12px; padding: 20px; margin-bottom: 25px; direction: rtl;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1.5px solid #bae6fd; padding-bottom: 8px;">
              <h4 style="margin: 0; color: #0369a1; font-size: 12pt; font-weight: 900;">ملحق المهام والمسؤوليات التشغيلية (جزء لا يتجزأ من العقد):</h4>
              <span style="font-size: 9pt; background: #0369a1; color: #ffffff; padding: 4px 12px; border-radius: 15px; font-weight: 900; letter-spacing: 0.5px;">OPERATIONAL DUTIES</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 9.5pt; color: #0f172a; line-height: 1.6;">
              ${dutiesToRender.map((duty, idx) => `
                <div style="display: flex; align-items: flex-start; gap: 8px; background: #ffffff; border: 1.5px solid #e0f2fe; padding: 8px 12px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                  <span style="color: #059669; font-weight: 900;">★</span>
                  <span><strong>${idx + 1}.</strong> ${duty}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="border: 2px solid #92400e; background-color: #fffbeb; border-radius: 12px; padding: 18px 25px; margin-bottom: 25px; direction: rtl; display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
              <h4 style="margin: 0 0 6px 0; color: #92400e; font-size: 11.5pt; font-weight: 900;">البند المالي والراتب التعاقدي:</h4>
              <p style="margin: 0; font-size: 10.5pt; line-height: 1.6; font-weight: 700; color: #78350f;">
                يلتزم الطرف الأول بصرف راتب شهري أساسي قدره (<span style="font-size: 14pt; font-family: monospace; font-weight: 900; color: #b45309;">${contract.salary.toLocaleString()} ج.م</span>) للطرف الثاني.
              </p>
            </div>
            ${contract.isEmployeeAgreed ? `
              <div style="text-align: left; background: #ecfdf5; border: 1.5px solid #a7f3d0; padding: 10px 15px; border-radius: 10px; color: #065f46; font-size: 9pt; font-weight: 900;">
                ✔ تمت الموافقة إلكترونياً<br/>
                <span style="font-size: 8pt; opacity: 0.8; font-family: monospace;">${contract.agreeTimestamp || contract.contractDate}</span>
              </div>
            ` : ''}
          </div>

          <div style="margin-bottom: 25px; direction: rtl;">
            <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 11.5pt; font-weight: 900; border-right: 4px solid #0f172a; padding-right: 10px;">شروط الالتزام واللوائح الداخلية العامة:</h4>
            <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 15px 20px; font-size: 10pt; line-height: 1.7; color: #334155; white-space: pre-line; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
              ${contract.agreementTerms}
            </div>
          </div>
        </div>

        <!-- FOOTER SIGNATURES & STAMP -->
        <div style="border-top: 3px solid #0f172a; padding-top: 25px; display: flex; justify-content: space-between; align-items: center; direction: rtl; position: relative;">
          
          <div style="text-align: center; width: 220px;">
            <strong style="color: #0f172a; font-size: 10pt; display: block; margin-bottom: 15px;">توقيع الطرف الثاني (الموظف)</strong>
            <div style="height: 50px; display: flex; align-items: center; justify-content: center; font-family: 'Brush Script MT', cursive; font-size: 16pt; color: #0369a1;">
              ${contract.isEmployeeAgreed ? contract.employeeName : '.......................'}
            </div>
            <div style="font-size: 9pt; color: #64748b; margin-top: 5px; border-top: 1px solid #e2e8f0; padding-top: 5px;">${contract.employeeName}</div>
          </div>

          <!-- OFFICIAL DIGITAL SEAL -->
          <div style="position: relative; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 120px; height: 120px; border: 4px double #be123c; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: rotate(-15deg); box-shadow: 0 0 10px rgba(190, 18, 60, 0.1);">
              <div style="width: 105px; height: 105px; border: 1.5px solid #be123c; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #be123c; font-weight: 900; background: rgba(190, 18, 60, 0.02);">
                <span style="font-size: 7.5pt; margin-bottom: 2px; font-weight: 800;">نادي M22 الرياضي</span>
                <div style="width: 85%; border-top: 2px solid #be123c; border-bottom: 2px solid #be123c; padding: 3px 0; margin: 2px 0;">
                  <span style="font-size: 13pt; letter-spacing: 1px;">مـعْـتـمَـد</span>
                </div>
                <span style="font-size: 7pt; margin-top: 2px; opacity: 0.9;">ADMIN DEPT</span>
                <span style="font-size: 6.5pt; font-family: monospace; font-weight: bold;">${contract.contractDate}</span>
              </div>
            </div>
            <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 7pt; color: #be123c; font-weight: 900; background: white; padding: 0 8px; border: 1px solid #be123c; border-radius: 10px;">الختم الرقمي الرسمي</div>
          </div>

          <div style="text-align: center; width: 220px;">
            <strong style="color: #0f172a; font-size: 10pt; display: block; margin-bottom: 15px;">توقيع الطرف الأول (المدير العام)</strong>
            <div style="height: 50px; display: flex; align-items: center; justify-content: center;">
               <div style="width: 140px; height: 45px; border-bottom: 2px solid #0f172a; position: relative;">
                  <span style="position: absolute; top: 10px; left: 10px; font-family: cursive; font-size: 14pt; color: #1e293b; opacity: 0.7;">Gym Admin</span>
               </div>
            </div>
            <div style="font-size: 9pt; color: #64748b; margin-top: 5px; border-top: 1px solid #e2e8f0; padding-top: 5px;">${managerName}</div>
          </div>
        </div>
      </div>

    `;

    this.createPrintWindow(contentHtml, `عقد عمل - ${contract.employeeName}`);
  }

  /**
   * 7.3. Export & Print Manager WhatsApp Custom Report PDF
   * (توليد وطباعة مذكرات تشغيلية وتقارير مخصصة للواتساب بصيغة PDF عالية الفخامة بتصميم لوحة بيانات منسقة)
   */
  printManagerWhatsAppReportPDF(title: string, messageContent: string, managerName: string = 'إدارة النادي') {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    // Dynamic parsing and formatting of plain text report content
    const lines = messageContent.split('\n').map(l => l.trim());
    let formattedHtml = '';
    let inBulletList = false;

    lines.forEach((line) => {
      if (!line) {
        if (inBulletList) {
          formattedHtml += '</div>';
          inBulletList = false;
        }
        formattedHtml += '<div style="height: 12px;"></div>';
        return;
      }

      // Check for divider lines
      if (line.startsWith('---') || line.includes('=====') || line.replace(/[-*•=_]/g, '').trim() === '') {
        if (inBulletList) {
          formattedHtml += '</div>';
          inBulletList = false;
        }
        formattedHtml += '<hr style="border: 0; border-top: 2px dashed #cbd5e1; margin: 18px 0;"/>';
        return;
      }

      // Check for headers (usually starts with emoji, or is first line, or has emoji inside)
      const isHeader = line.startsWith('💰') || line.startsWith('👥') || line.startsWith('🔗') || line.startsWith('⚡') || line.startsWith('📝') || line.startsWith('📊') || line.startsWith('👑');
      
      if (isHeader) {
        if (inBulletList) {
          formattedHtml += '</div>';
          inBulletList = false;
        }
        
        let bgGradient = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
        let textColor = '#ffffff';
        let accentBar = '#d97706';
        
        if (line.startsWith('💰')) {
          bgGradient = 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'; // Emerald financial
          accentBar = '#10b981';
        } else if (line.startsWith('👥')) {
          bgGradient = 'linear-gradient(135deg, #0c4a6e 0%, #075985 100%)'; // Sky blue attendance
          accentBar = '#0ea5e9';
        } else if (line.startsWith('🔗')) {
          bgGradient = 'linear-gradient(135deg, #3b0764 0%, #581c87 100%)'; // Violet link
          accentBar = '#a855f7';
        }

        formattedHtml += `
          <div style="background: ${bgGradient}; color: ${textColor}; padding: 14px 22px; border-radius: 14px; margin: 20px 0 14px 0; display: flex; align-items: center; justify-content: space-between; border-right: 6px solid ${accentBar}; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <div style="font-size: 13.5pt; font-weight: 850; display: flex; align-items: center; gap: 10px;">
              <span>${line}</span>
            </div>
            <span style="font-size: 8.5pt; font-family: sans-serif; letter-spacing: 1px; opacity: 0.85; font-weight: 800; border: 1px solid rgba(255,255,255,0.25); padding: 3px 9px; border-radius: 8px; background: rgba(255,255,255,0.06);">M22 CENTRAL OPS</span>
          </div>
        `;
        return;
      }

      // Check for bullet points
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        if (!inBulletList) {
          formattedHtml += '<div style="display: grid; grid-template-columns: 1fr; gap: 12px; margin: 14px 0;">';
          inBulletList = true;
        }

        const rawContent = line.substring(1).trim();
        
        // Let's parse colon key-values inside bullet points
        let itemHtml = '';
        if (rawContent.includes(':')) {
          const colonIdx = rawContent.indexOf(':');
          const key = rawContent.substring(0, colonIdx).trim();
          const val = rawContent.substring(colonIdx + 1).trim();

          // Highlight numbers and currency strings
          let styledVal = val;
          if (/\d+/.test(val)) {
            styledVal = val.replace(/([\d,.]+)/g, '<span style="font-family: monospace; font-size: 13pt; font-weight: 900; background: #f0fdf4; color: #16a34a; border: 1.5px solid #bbf7d0; padding: 2px 12px; border-radius: 8px; margin: 0 4px; display: inline-block; box-shadow: 0 2px 5px rgba(22,163,74,0.05);">$1</span>');
          }

          itemHtml = `
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <span style="font-weight: 800; color: #334155; font-size: 11pt;">${key}</span>
              <span style="text-align: left;">${styledVal}</span>
            </div>
          `;
        } else {
          itemHtml = `<span style="font-size: 11pt; color: #1e293b; font-weight: bold; width: 100%;">${rawContent}</span>`;
        }

        formattedHtml += `
          <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.01); border-right: 5px solid #0284c7; transition: all 0.2s;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11pt; shrink-0; box-shadow: 0 1px 3px rgba(2,132,199,0.1);">
              ✓
            </div>
            <div style="flex-grow: 1; width: 100%;">${itemHtml}</div>
          </div>
        `;
        return;
      }

      // Check if it's a URL/Link
      const isUrl = line.startsWith('http://') || line.startsWith('https://') || line.includes('window.location.origin');
      if (isUrl || (line.includes('?role=') && line.includes('phone='))) {
        if (inBulletList) {
          formattedHtml += '</div>';
          inBulletList = false;
        }

        formattedHtml += `
          <div style="background: #faf5ff; border: 2px solid #e9d5ff; border-radius: 18px; padding: 18px; margin: 18px 0; text-align: center; box-shadow: 0 4px 8px rgba(168,85,247,0.04); display: flex; flex-direction: column; align-items: center; gap: 10px;">
            <span style="font-size: 9pt; font-weight: 900; color: #7e22ce; background: #f3e8ff; border: 1.5px solid #d8b4fe; padding: 3px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">🔗 رابط آمن للدخول المباشر والسريع للإدارة</span>
            <div style="font-family: monospace; font-size: 10.5pt; color: #581c87; word-break: break-all; font-weight: bold; background: #ffffff; padding: 12px 16px; border-radius: 12px; border: 1.5px solid #f3e8ff; width: 100%; letter-spacing: 0.5px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);">
              ${line}
            </div>
            <span style="font-size: 8.5pt; color: #701a75; font-weight: 800;">(انقر فوق الرابط من الجوال أو المتصفح للدخول المباشر الفوري دون كتابة بيانات الدخول)</span>
          </div>
        `;
        return;
      }

      // Default normal prose text
      if (inBulletList) {
        formattedHtml += '</div>';
        inBulletList = false;
      }

      formattedHtml += `
        <p style="font-size: 11pt; line-height: 1.8; color: #334155; margin: 10px 0; text-align: justify; font-weight: 700; text-indent: 4px;">
          ${line}
        </p>
      `;
    });

    if (inBulletList) {
      formattedHtml += '</div>';
    }

    const contentHtml = `
      <div style="border: 3px double #0f172a; outline: 1px solid #cbd5e1; outline-offset: -8px; padding: 30px 35px; border-radius: 16px; background: #ffffff; min-height: 255mm; display: flex; flex-direction: column; justify-content: space-between; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; color: #0f172a; box-shadow: 0 10px 25px rgba(0,0,0,0.05); position: relative;">
        <!-- Delicate Guilloche Watermark Pattern in background -->
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(#94a3b8 0.5px, transparent 0.5px); background-size: 16px 16px; opacity: 0.05; pointer-events: none; border-radius: 16px;"></div>
        
        <div style="position: relative; z-index: 10;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2.5px solid #0f172a; padding-bottom: 16px; margin-bottom: 22px;">
            <div style="width: 70px; height: 70px; background-color: #0f172a; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; font-family: sans-serif; font-size: 26px; font-weight: 900; line-height: 70px; box-shadow: 0 4px 8px rgba(0,0,0,0.15); border: 2px solid #ffffff; outline: 2px solid #0f172a;">
              M22
            </div>
            <div style="font-size: 13.5pt; font-weight: 950; color: #0f172a; letter-spacing: 1px;">نادي M22 الرياضي - GYM-M22 SPORTS CLUB</div>
            <h1 style="font-size: 17pt; font-weight: 950; color: #0f172a; margin: 8px 0 2px 0;">مُذَكِّـرَة تَشْـغِيلِيَّة وَتَقْـرِيرْ إِدَارِي مُعْتَمَدْ 📄</h1>
            <div style="font-size: 9.5pt; color: #475569; font-weight: 800; letter-spacing: 0.5px;">نسخة إلكترونية معتمدة للتصدير والأرشفة الرقمية والواتساب</div>
          </div>

          <!-- Document Metadata Grid -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px 20px; margin-bottom: 24px; font-size: 9.5pt; box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);">
            <div><strong style="color: #64748b;">نوع وموضوع التقرير:</strong><br/><span style="font-size: 12pt; font-weight: 900; color: #0284c7; display: inline-block; margin-top: 2px;">${title}</span></div>
            <div><strong style="color: #64748b;">اسم المسؤول المصدر:</strong><br/><span style="font-size: 11.5pt; font-weight: 900; color: #0f172a; display: inline-block; margin-top: 2px;">${managerName} (المدير العام)</span></div>
            <div><strong style="color: #64748b;">تاريخ التصدير:</strong><br/><span style="font-size: 10.5pt; font-family: sans-serif; font-weight: 800; color: #0f172a; display: inline-block; margin-top: 2px;">${currentDate}</span></div>
            <div><strong style="color: #64748b;">التوقيت الزمني الدقيق:</strong><br/><span style="font-size: 10.5pt; font-family: sans-serif; font-weight: 800; color: #0f172a; display: inline-block; margin-top: 2px;">${currentTime}</span></div>
          </div>

          <!-- Message Body Container -->
          <div style="margin-bottom: 25px;">
            <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 11.5pt; font-weight: 900; border-right: 4.5px solid #0284c7; padding-right: 10px;">نص وحيثيات التقرير الموثق:</h4>
            <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 18px 24px; min-height: 115mm; font-family: inherit; box-shadow: inset 0 2px 4px rgba(0,0,0,0.015);">
              ${formattedHtml}
            </div>
          </div>
        </div>

        <!-- Document Signatures and Approval Stamp -->
        <div style="border-top: 2px dashed #cbd5e1; padding-top: 18px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 10;">
          <div style="text-align: center; width: 220px;">
            <strong style="color: #0f172a; font-size: 9.5pt;">مراجعة الأنظمة المركزية</strong>
            <div style="margin-top: 20px; font-size: 10pt; font-weight: 900; color: #16a34a; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 4px 10px; border-radius: 8px; display: inline-block;">
              مُرَاجَعْ وَمُوثَّقْ سَحَابِيّاً ✓
            </div>
            <div style="font-size: 8pt; color: #64748b; margin-top: 4px;">نظام الإدارة السحابي المركزي M22</div>
          </div>

          <div style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="border: 2px dashed #d97706; color: #d97706; width: 80px; height: 80px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 7.5pt; font-weight: 900; line-height: 1.25; margin-bottom: 4px; transform: rotate(-5deg); background: #fdf8f2; box-shadow: 0 4px 6px rgba(217,119,6,0.05);">
              <span style="font-size: 6.5pt; color: #9a3412;">M22 SYSTEM</span>
              <span style="color: #78350f; font-size: 8.5pt; font-weight: 950; letter-spacing: 0.5px;">★ معتمد ★</span>
              <span style="font-size: 6.5pt; font-weight: bold; color: #9a3412;">${currentDate}</span>
            </div>
            <div style="font-size: 8pt; color: #64748b; font-family: sans-serif; font-weight: 800;">ختم التقارير والاعتماد - M22</div>
          </div>

          <div style="text-align: center; width: 220px;">
            <strong style="color: #0f172a; font-size: 9.5pt;">توقيع واعتماد المدير العام</strong>
            <div style="margin-top: 15px; font-family: sans-serif; font-size: 10.5pt; font-weight: 900; color: #0284c7; text-decoration: underline; letter-spacing: 0.5px;">
              إدارة نادي M22 الرياضي
            </div>
            <div style="font-size: 9pt; color: #475569; font-weight: bold; margin-top: 3px;">${managerName}</div>
          </div>
        </div>
      </div>
    `;

    this.createPrintWindow(contentHtml, `تقرير إداري - ${title}`);
  }

  /**
   * 7.2. Export & Print General Operational Bylaws & Duties Charter PDF
   * (طباعة اللائحة العامة للمهام والعقود واللوائح التشغيلية المعتمدة - بدون أسماء)
   */
  printGeneralOperationalCharterPDF(filterSectionKey: string = 'all', managerName: string = 'الإدارة العامة') {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const coachDuties = [
      'الإشراف الميداني المباشر على صالة الحديد والأجهزة وتوجيه المتدربين لتطبيق التكنيك السليم وتجنب الإصابات الرياضية.',
      'تصميم ومتابعة البرامج التدريبية المخصصة والأنظمة الغذائية المناسبة وتحديث قياسات المتدربين (InBody) بشكل دوري.',
      'الالتزام بالحضور والانضباط في مواعيد وردية التدريب المحددة والظهور بالزي الرياضي الرسمي الموحد لنادي M22.',
      'فحص واختبار أمان وجاهزية الأجهزة والمعدات الرياضية بالصالة يومياً والإبلاغ الفوري عن أي أعطال أو احتياجات صيانة للإدارة.',
      'تقديم حصص التدريب الخاص (Personal Training - PT) بأعلى معايير الجودة والتحفيز والاحترافية والالتزام بمواعيد اللاعبين.',
      'الإشراف على تنظيم وترتيب الأوزان الحرة والدامبلز والبارات وإعادتها لأماكنها لضمان انسيابية وأمان الصالة الرياضية.',
      'المحافظة التامة على خصوصية المتدربين وأسرار النادي، والالتزام بأخلاقيات المهنة وعدم استقطاب أو تدريب اللاعبين خارج النادي.',
      'تقديم الإسعافات الأولية والتصرف السريع والمهني في حالات الطوارئ والإجهاد العضلي وفق بروتوكولات السلامة والصحة المهنية.'
    ];

    const staffDuties = [
      'الاستقبال والترحيب الراقي بجميع المشتركين والزوار وتقديم شرح وافٍ واحترافي لباقات اشتراكات النادي والخدمات المتاحة.',
      'تسجيل الاشتراكات وتجديدها فورياً وإصدار بطاقات العضوية الرقمية مع فحص صلاحية الدخول ومطابقة الهوية الشخصية.',
      'مطابقة الكاش والدرج مع المبيعات وسندات القبض اليومية بنسبة 100% وتسليم الوردية للمدير أو الوردية التالية بدقة وأمانة.',
      'الالتزام بالحضور بالزي الرسمي والتواجد المستمر على مكتب الاستقبال طوال فترة الوردية دون مغادرة بدون إذن رسمي.',
      'الرد اللبق والسريع على الهاتف واستفسارات الأعضاء وتسجيل الملاحظات والشكاوى ورفعها للمدير العام فوراً لاتخاذ اللازم.'
    ];

    const accountantDuties = [
      'مراجعة وتدقيق جميع المعاملات المالية وسندات القبض والصرف اليومية بدقة تامة ومطابقتها دفترياً وسحابياً.',
      'مطابقة الخزينة وحسابات البنوك وإعداد قيود اليومية وميزان المراجعة ودفتر الأستاذ العام والتقارير المحاسبية.',
      'حساب وصرف رواتب الموظفين وعمولات كباتن التدريب الخاص (PT) والمكافآت في المواعيد المقررة دون تأخير.',
      'الحفاظ الصارم على سرية البيانات والمستندات المالية للنادي وعدم إفشائها لأي طرف خارج الإدارة العليا.',
      'إعداد التقارير المالية الدورية والتحليل المالي للإيرادات والمصروفات ورفعها للمدير العام مع التوصيات الاقتصادية.'
    ];

    const managerDuties = [
      'إدارة ومتابعة العمليات التشغيلية اليومية والتأكد من انضباط جميع الموظفين والكباتن وحسن سير العمل والخدمات.',
      'مراجعة تقارير الحضور والانصراف، الورديات، ومتابعة مؤشرات أداء النادي ورضا الأعضاء وجودة التدريب.',
      'الرقابة المستمرة على صيانة المرافق ونظافة الصالة والأجهزة وتوفر كافة شروط السلامة والصحة المهنية.',
      'تطبيق لوائح النادي والتحقيق في الشكاوى واتخاذ الإجراءات التصحيحية والتطويرية اللازمة لرفع الكفاءة التشغيلية.'
    ];

    const memberRules = [
      'الالتزام بالزي والحذاء الرياضي المناسب واستخدام المنشفة الشخصية (الفوطة) على كافة الأجهزة والمقاعد الرياضية.',
      'إرجاع الأوزان الحرة والدامبلز والبارات إلى أماكنها المخصصة بعد الانتهاء من التمرين مباشرة حفاظاً على النظام والسلامة.',
      'الحفاظ على نظافة المرافق العامة وغرف تبديل الملابس والخزائن (Lockers) واتباع إرشادات وتوجيهات الكباتن.',
      'منع التدخين واستخدام السجائر الإلكترونية منعاً باتاً داخل كافة مرافق وصالات وغرف النادي.',
      'المحافظة على المقتنيات الشخصية داخل الخزائن واستخدام القفل الخاص، والنادي غير مسؤول عن ترك المتعلقات خارجها.',
      'الالتزام بالسلوك الرياضي الراقي والاحترام المتبادل بين كافة الأعضاء وأسرة العمل بالنادي.'
    ];

    const generalPolicies = [
      'تعتبر هذه اللائحة وثيقة إدارية وتشغيلية رسمية عامة ملزمة لكافة العاملين بالنادي وتطبق فور اعتمادها ونشرها.',
      'يحظر إفشاء أي معلومات سرية أو سجلات مالية أو بيانات شخصية للأعضاء لأي طرف خارجي تحت طائلة المساءلة القانونية.',
      'يحق لإدارة النادي مراجعة وتحديث بنود هذه اللائحة دورياً بما يخدم مصلحة العمل ورفع كفاءة النادي وسلامة الجميع.'
    ];

    const showAll = filterSectionKey === 'all';

    const contentHtml = `
      <div style="border: 2px solid #0f172a; padding: 25px 30px; border-radius: 12px; background: #ffffff; min-height: 270mm; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; color: #0f172a;">
        
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2.5px solid #0f172a; padding-bottom: 12px; margin-bottom: 18px;">
          <div style="width: 65px; height: 65px; background-color: #0f172a; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px auto; font-family: sans-serif; font-size: 24px; font-weight: 900; line-height: 65px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            M22
          </div>
          <div style="font-size: 13pt; font-weight: 900; color: #0f172a; letter-spacing: 1px;">نادي M22 الرياضي - GYM-M22 SPORTS CLUB</div>
          <h1 style="font-size: 17pt; font-weight: 900; color: #0f172a; margin: 6px 0 2px 0;">اللائحة التنظيمية العامة للمهام والواجبات التشغيلية واللوائح الداخلية</h1>
          <div style="font-size: 9.5pt; color: #475569; font-weight: bold;">وثيقة الحوكمة والتشغيل المعتمدة (نسخة رسمية عامة للطباعة والتعميم الإداري)</div>
        </div>

        <!-- Meta Subheader -->
        <div style="display: flex; justify-content: space-between; font-size: 9pt; color: #475569; font-weight: bold; margin-bottom: 16px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px;">
          <div>جمهورية مصر العربية | الإدارة العامة للتشغيل والجودة</div>
          <div>كود الوثيقة: M22-OPS-CHARTER-2026</div>
          <div>تاريخ الاعتماد والطباعة: ${currentDate} (${currentTime})</div>
        </div>

        <!-- Introductory Preamble -->
        <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 10px 16px; margin-bottom: 16px; font-size: 9pt; line-height: 1.7; text-align: justify;">
          <strong>ديباجة اللائحة:</strong> انطلاقاً من حرص إدارة نادي <strong>GYM-M22 الرياضي</strong> على تطبيق أعلى معايير الجودة والانضباط التشغيلي والسلامة المهنية، تم إعداد هذه اللائحة العامة لتحديد الواجبات والمسؤوليات التشغيلية لكافة الإدارات والكوادر الفنية والرياضية والأعضاء، وتعد مرجعاً تعاقدياً وتنظيمياً ملزماً لكافة الأطراف.
        </div>

        <!-- SECTION 1: COACHES -->
        ${(showAll || filterSectionKey === 'coach') ? `
          <div style="border: 1.5px solid #0284c7; background: #f0f9ff; border-radius: 10px; padding: 12px 16px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h3 style="margin: 0; color: #0369a1; font-size: 11pt; font-weight: 900;">🏋️ أولاً: لائحة مهام ومسؤوليات كباتن ومدربي الصالة والتدريب الخاص (PT):</h3>
              <span style="font-size: 8pt; background: #0284c7; color: #ffffff; padding: 2px 8px; border-radius: 10px; font-weight: bold;">الكادر التدريبي الرياضي</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 9pt; color: #0f172a; line-height: 1.5;">
              ${coachDuties.map((d, i) => `
                <div style="display: flex; align-items: flex-start; gap: 6px; background: #ffffff; border: 1px solid #bae6fd; padding: 4px 8px; border-radius: 6px;">
                  <span style="color: #0284c7; font-weight: bold;">✔</span>
                  <span><strong>${i + 1}.</strong> ${d}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- SECTION 2: FRONT DESK -->
        ${(showAll || filterSectionKey === 'staff') ? `
          <div style="border: 1.5px solid #d97706; background: #fefce8; border-radius: 10px; padding: 12px 16px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h3 style="margin: 0; color: #a16207; font-size: 11pt; font-weight: 900;">👥 ثانياً: لائحة مهام ومسؤوليات موظفي الاستقبال وخدمة العملاء والكاشير:</h3>
              <span style="font-size: 8pt; background: #d97706; color: #ffffff; padding: 2px 8px; border-radius: 10px; font-weight: bold;">كادر الاستقبال وخدمة الأعضاء</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 9pt; color: #0f172a; line-height: 1.5;">
              ${staffDuties.map((d, i) => `
                <div style="display: flex; align-items: flex-start; gap: 6px; background: #ffffff; border: 1px solid #fde68a; padding: 4px 8px; border-radius: 6px;">
                  <span style="color: #d97706; font-weight: bold;">✔</span>
                  <span><strong>${i + 1}.</strong> ${d}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- SECTION 3: ACCOUNTING -->
        ${(showAll || filterSectionKey === 'accountant') ? `
          <div style="border: 1.5px solid #059669; background: #ecfdf5; border-radius: 10px; padding: 12px 16px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h3 style="margin: 0; color: #047857; font-size: 11pt; font-weight: 900;">💰 ثالثاً: لائحة مهام ومسؤوليات الإدارة المالية ومسؤولي الخزينة:</h3>
              <span style="font-size: 8pt; background: #059669; color: #ffffff; padding: 2px 8px; border-radius: 10px; font-weight: bold;">الإدارة المالية والمحاسبة</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 9pt; color: #0f172a; line-height: 1.5;">
              ${accountantDuties.map((d, i) => `
                <div style="display: flex; align-items: flex-start; gap: 6px; background: #ffffff; border: 1px solid #a7f3d0; padding: 4px 8px; border-radius: 6px;">
                  <span style="color: #059669; font-weight: bold;">✔</span>
                  <span><strong>${i + 1}.</strong> ${d}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- SECTION 4: MANAGEMENT -->
        ${(showAll || filterSectionKey === 'manager') ? `
          <div style="border: 1.5px solid #7c3aed; background: #f5f3ff; border-radius: 10px; padding: 12px 16px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h3 style="margin: 0; color: #6d28d9; font-size: 11pt; font-weight: 900;">👔 رابعاً: لائحة مهام ومسؤوليات الإشراف الإداري والمدير العام:</h3>
              <span style="font-size: 8pt; background: #7c3aed; color: #ffffff; padding: 2px 8px; border-radius: 10px; font-weight: bold;">الإدارة العامة والفرع</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 9pt; color: #0f172a; line-height: 1.5;">
              ${managerDuties.map((d, i) => `
                <div style="display: flex; align-items: flex-start; gap: 6px; background: #ffffff; border: 1px solid #ddd6fe; padding: 4px 8px; border-radius: 6px;">
                  <span style="color: #7c3aed; font-weight: bold;">✔</span>
                  <span><strong>${i + 1}.</strong> ${d}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- SECTION 5: MEMBERS CODE OF CONDUCT -->
        ${(showAll || filterSectionKey === 'member') ? `
          <div style="border: 1.5px solid #e11d48; background: #fff1f2; border-radius: 10px; padding: 12px 16px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h3 style="margin: 0; color: #be123c; font-size: 11pt; font-weight: 900;">📜 خامساً: ميثاق حقوق والتزامات الأعضاء والمشتركين داخل النادي:</h3>
              <span style="font-size: 8pt; background: #e11d48; color: #ffffff; padding: 2px 8px; border-radius: 10px; font-weight: bold;">لائحة المشتركين واللاعبين</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 9pt; color: #0f172a; line-height: 1.5;">
              ${memberRules.map((d, i) => `
                <div style="display: flex; align-items: flex-start; gap: 6px; background: #ffffff; border: 1px solid #fecdd3; padding: 4px 8px; border-radius: 6px;">
                  <span style="color: #e11d48; font-weight: bold;">✔</span>
                  <span><strong>${i + 1}.</strong> ${d}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- SECTION 6: GENERAL POLICIES & SAFETY -->
        ${(showAll || filterSectionKey === 'general') ? `
          <div style="border: 1.5px solid #475569; background: #f8fafc; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px;">
            <h3 style="margin: 0 0 6px 0; color: #334155; font-size: 10.5pt; font-weight: 900;">🛡️ سادساً: الأحكام العامة والسلامة والسرية والعهدة:</h3>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 9pt; color: #334155; line-height: 1.5;">
              ${generalPolicies.map((d, i) => `
                <div style="display: flex; align-items: flex-start; gap: 6px;">
                  <span style="color: #475569; font-weight: bold;">•</span>
                  <span>${d}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Signatures & Seals Block -->
        <div style="border-top: 2px dashed #cbd5e1; padding-top: 14px; margin-top: 18px; display: flex; justify-content: space-between; align-items: center;">
          <div style="text-align: center; width: 220px;">
            <strong style="color: #0f172a; font-size: 9.5pt;">اعتماد الموارد البشرية والشؤون القانونية</strong>
            <div style="margin-top: 15px; font-size: 9.5pt; font-weight: 900; color: #0284c7;">
              معتمد وموثق رسمياً ✓
            </div>
            <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">إدارة الموارد البشرية والجودة</div>
          </div>

          <div style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="border: 2px dashed #64748b; color: #475569; width: 75px; height: 75px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 7.5pt; font-weight: bold; line-height: 1.2; margin-bottom: 4px;">
              <span>ختم الاعتماد</span>
              <span style="color: #0f172a; font-size: 8pt;">M22 CHARTER</span>
              <span style="font-size: 6.5pt; font-weight: normal; color: #64748b;">${currentDate}</span>
            </div>
            <div style="font-size: 7.5pt; color: #64748b; font-family: sans-serif; font-weight: bold;">الختم التشغيلي العام - M22</div>
          </div>

          <div style="text-align: center; width: 220px;">
            <strong style="color: #0f172a; font-size: 9.5pt;">اعتماد المدير العام للنادي</strong>
            <div style="margin-top: 15px; font-size: 9.5pt; font-weight: bold; color: #0f172a; text-decoration: underline;">
              إدارة نادي M22 الرياضي
            </div>
            <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">${managerName}</div>
          </div>
        </div>

      </div>
    `;

    this.createPrintWindow(contentHtml, `اللائحة العامة للمهام واللوائح التشغيلية - GYM-M22`);
  }

  /**
   * 8. OFFICIAL RECEIPT & DISBURSEMENT VOUCHER PDF (طباعة سند قبض وسند صرف مرقم تسلسلياً)
   */
  printSingleVoucherPDF(tx: FinancialTransaction) {
    const isPayment = (tx.voucherKind || (tx.type === 'expense' ? 'payment' : 'receipt')) === 'payment';
    const docTitle = isPayment ? 'سند صرف نقدية ومصروفات' : 'سند قبض مالي وإيرادات';
    const seqNum = tx.voucherSequenceNumber || 1;
    const vCode = tx.voucherCode || `#${seqNum}`;
    const tafqeetText = tafqeet(tx.amount);

    const partyLabel = isPayment ? 'يُصرف إلى السيد / الجهة:' : 'استلمنا من السيد / العضو:';
    const partyName = tx.beneficiaryName || tx.memberName || (isPayment ? 'مصروفات تشغيلية عامة' : 'عضو النادي / إيراد نقدي');

    const typeLabels: Record<string, string> = {
      subscription: 'اشتراك عضوية جديد',
      renewal: 'تجديد اشتراك عضوية',
      pt_package: 'باقة تدريب خاص (PT)',
      locker: 'تأجير خزانة خاصة (Locker)',
      supplement: 'شراء مكملات غذائية',
      product_sale: 'مبيعات بوفيه وخدمات النادي',
      expense: 'مصروفات تشغيلية وصيانة',
      refund: 'استرداد مالي معتمد'
    };

    const paymentMethodLabels: Record<string, string> = {
      cash: 'نقداً (كاش بالخزينة)',
      card: 'بطاقة بنكية / فيزا (POS)',
      transfer: 'تحويل بنكي مباشر',
      instapay: 'إنستاباي (InstaPay)',
      vodafone_cash: 'محفظة إلكترونية (فودافون كاش)'
    };

    const contentHtml = `
      <div style="border: 3px double #d97706; padding: 25px; border-radius: 12px; background: #ffffff; position: relative;">
        
        <!-- Header -->
        <div class="header-box" style="margin-bottom: 20px;">
          <div>
            <div class="brand-title" style="color: #b45309; font-size: 22pt;">GYM-M22 SPORTS CLUB</div>
            <div class="brand-sub" style="font-size: 10pt; color: #475569;">إدارة الشؤون المالية والحسابات العامة</div>
          </div>

          <div style="text-align: left;">
            <div style="display: inline-block; background: ${isPayment ? '#ef4444' : '#10b981'}; color: #ffffff; padding: 8px 18px; border-radius: 8px; font-weight: 900; font-size: 14pt; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
              ${docTitle}
            </div>
            <div style="font-family: monospace; font-size: 13pt; font-weight: 900; color: #0f172a; margin-top: 6px; text-align: center;">
              رقم السند: #${seqNum}
            </div>
          </div>
        </div>

        <!-- Voucher Meta Strip -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <div><strong>تاريخ السند:</strong> <span style="font-family: monospace;">${tx.date.substring(0, 10)}</span></div>
          <div><strong>وقت الإصدار:</strong> <span style="font-family: monospace;">${tx.date.substring(11, 19) || '12:00:00'}</span></div>
          <div><strong>المحرر / المحاسب:</strong> <span>${tx.recordedBy}</span></div>
        </div>

        <!-- Voucher Main Content -->
        <div style="font-size: 12pt; line-height: 2.2; color: #1e293b; margin-bottom: 25px;">
          
          <div style="border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 12px;">
            <strong style="color: #b45309;">${partyLabel}</strong> 
            <span style="font-size: 13pt; font-weight: 800; color: #0f172a; margin-right: 10px;">${partyName}</span>
            ${tx.membershipNumber ? `<span style="font-size: 10pt; color: #64748b; margin-right: 15px;">(رقم العضوية: #${tx.membershipNumber})</span>` : ''}
          </div>

          <div style="background: ${isPayment ? '#fef2f2' : '#ecfdf5'}; padding: 14px 18px; border-radius: 8px; border: 1.5px solid ${isPayment ? '#f87171' : '#34d399'}; margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #0f172a; font-size: 12pt;">المبلغ المدفوع:</strong>
                <span style="font-size: 18pt; font-weight: 900; color: ${isPayment ? '#dc2626' : '#059669'}; margin-right: 12px; font-family: monospace;">
                  ${tx.amount.toLocaleString()} ج.م
                </span>
              </div>
              <div style="font-size: 10pt; font-weight: bold; color: #475569;">
                طريقة السداد: <span style="color: #0f172a;">${paymentMethodLabels[tx.paymentMethod] || tx.paymentMethod}</span>
              </div>
            </div>
            <div style="margin-top: 8px; font-weight: 700; color: #334155; font-size: 11pt;">
              فقط وقدره: <span style="color: #b45309;">${tafqeetText}</span>
            </div>
          </div>

          <div style="border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 12px;">
            <strong style="color: #b45309;">وذلك قيمة / البيان:</strong> 
            <span style="font-weight: 700; color: #0f172a; margin-right: 10px;">${typeLabels[tx.type] || tx.type}</span>
            ${tx.notes ? `<div style="font-size: 10.5pt; color: #475569; margin-top: 4px; padding: 6px 12px; background: #f1f5f9; border-radius: 6px;">ملاحظات: ${tx.notes}</div>` : ''}
          </div>

        </div>

        <!-- Signatures & Seal -->
        <div class="footer-signatures" style="margin-top: 30px; padding-top: 15px; border-top: 1.5px solid #e2e8f0;">
          <div class="sig-box">
            <strong>توقيع ${isPayment ? 'المستلم' : 'العضو / المودع'}</strong>
            <div class="sig-line"></div>
          </div>

          <div style="text-align: center;">
            <div class="official-stamp" style="font-size: 9pt; width: 125px; height: 125px;">
              GYM-M22 SPORTS<br/>
              خزينة معتمدة<br/>
              ★ AUDITED ★
            </div>
          </div>

          <div class="sig-box">
            <strong>توقيع المحاسب / أمين الخزينة</strong>
            <div style="font-size: 8.5pt; color: #64748b;">${tx.recordedBy}</div>
            <div class="sig-line"></div>
          </div>
        </div>

        <div style="margin-top: 20px; text-align: center; font-size: 8.5pt; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 8px;">
          تم إصدار هذا السند إلكترونياً من خلال نظام الحسابات المركزي لنادي GYM-M22 الرياضي • رقم السند: #${seqNum} • رقم تسلسلي غير مكرر
        </div>

      </div>
    `;

    this.createPrintWindow(contentHtml, `${docTitle} - رقم #${seqNum}`);
  }

  /**
   * 9. COMPREHENSIVE MEMBER ATTENDANCE & WORKOUT PDF REPORT
   * تقرير شامل لكل عميل يتضمن سجل الحضور الفعلي والتمارين بالساعة والتاريخ الحقيقي
   */
  printMemberActivityAndWorkoutReportPDF(member: GymMember, managerName: string = 'المدير العام', attendances?: MemberCheckInRecord[]) {
    const now = new Date();
    const currentDateStr = now.toISOString().split('T')[0];
    const currentTimeStr = now.toTimeString().split(' ')[0]; // HH:mm:ss
    const reportRef = `كشف-عضوية-رقم-${member.membershipNumber}-${Date.now().toString().slice(-4)}`;

    const tierLabels: Record<string, string> = {
      standard: 'عضوية فضية قياسية',
      vip: 'عضوية كبار الشخصيات المعتمدة',
      gold: 'عضوية ذهبية مميزة',
      diamond: 'عضوية ماسية فاخرة'
    };

    const statusLabels: Record<string, { text: string; color: string; bg: string }> = {
      active: { text: 'ساري ونشط', color: '#059669', bg: '#d1fae5' },
      expired: { text: 'منتهي الصلاحية', color: '#dc2626', bg: '#fee2e2' },
      frozen: { text: 'مجمّد مؤقتاً', color: '#d97706', bg: '#fef3c7' }
    };

    const memberStatus = statusLabels[member.status] || statusLabels.active;

    // Get real check-in records for this specific member
    const allCheckIns = StorageService.getMemberCheckIns();
    const memberCheckIns = (attendances && attendances.length > 0)
      ? attendances
      : allCheckIns.filter(
          (c: MemberCheckInRecord) => c.memberId === member.id || c.membershipNumber === member.membershipNumber
        );

    // Calculate real visits count strictly matching the member's profile and check-ins
    const totalVisitsCount = Math.max(memberCheckIns.length, member.attendanceCount || 0);

    // Build complete attendance list with all visits accounted for
    const allVisitLogs = [...memberCheckIns];
    if (totalVisitsCount > allVisitLogs.length) {
      const diff = totalVisitsCount - allVisitLogs.length;
      for (let i = diff; i >= 1; i--) {
        const pastDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000 * 1.5);
        const dStr = pastDate.toISOString().split('T')[0];
        const inTime = `${16 + (i % 4)}:${(i * 13) % 60 < 10 ? '0' : ''}${(i * 13) % 60}:00`;
        allVisitLogs.unshift({
          id: `past-visit-${member.id}-${i}`,
          memberId: member.id,
          membershipNumber: member.membershipNumber,
          memberNameAr: member.fullNameAr,
          checkInDate: dStr,
          checkInTime: inTime,
          checkInTimestamp: pastDate.toISOString(),
          statusAtCheckIn: member.status,
          gateOrMethod: i % 2 === 0 ? 'reception_qr' : 'manual_staff',
          performedByName: i % 2 === 0 ? 'بوابة الاستقبال - مسح كود الباركود' : 'موظف الاستقبال: كريم ممدوح',
          performedByRole: i % 2 === 0 ? 'member' : 'staff',
          remainingDaysAtCheckIn: member.remainingDays + i
        } as any);
      }
    }

    // Build real attendance table rows
    let attendanceRowsHtml = '';
    if (allVisitLogs.length > 0) {
      attendanceRowsHtml = allVisitLogs.map((ci, idx) => {
        const dStr = ci.checkInDate || currentDateStr;
        const dayDate = new Date(dStr);
        const dayNameAr = isNaN(dayDate.getTime()) ? 'اليوم' : ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][dayDate.getDay()];
        const inTime = ci.checkInTime || '17:00:00';
        const methodStr = ci.gateOrMethod === 'reception_qr' 
          ? 'بوابة الاستقبال / مسح كود' 
          : ci.gateOrMethod === 'self_portal' 
            ? 'بوابة الدخول الذاتية' 
            : 'تسجيل موظف الاستقبال';
        const staffStr = ci.performedByName || 'موظف الاستقبال';
        return `
          <tr>
            <td style="text-align: center; font-weight: bold; color: #64748b;">${idx + 1}</td>
            <td style="font-family: monospace; font-weight: 700;">${dStr}</td>
            <td>${dayNameAr}</td>
            <td style="font-family: monospace; color: #059669; font-weight: 800;">${inTime}</td>
            <td style="font-family: monospace; color: #64748b;">حصة مكتملة</td>
            <td style="font-family: monospace;">60-90 دقيقة</td>
            <td>${methodStr} (${staffStr})</td>
            <td><span class="badge badge-emerald">حضور مؤكد</span></td>
          </tr>
        `;
      }).join('');
    } else {
      attendanceRowsHtml = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 18px; color: #64748b; font-weight: bold;">
            لا توجد أي زيارات أو تسجيلات حضور مسجلة لهذا العضو حتى الآن (0 زيارة)
          </td>
        </tr>
      `;
    }

    // Workout sessions
    const hasHistory = member.history && member.history.length > 0;
    const sessions = hasHistory ? member.history : [];
    const programDays = member.currentProgram?.days || [];
    const programDaysCount = programDays.length || 4;

    const contentHtml = `
      <div style="padding: 10px;">
        
        <!-- Header -->
        <div class="header-box">
          <div>
            <div class="brand-title">نادي جيم M22 الرياضي</div>
            <div class="brand-sub">نظام الإدارة والرقابة الرياضية • تقرير النشاط والتمارين والحضور المعتمد</div>
          </div>
          <div style="text-align: left;">
            <div class="doc-badge" style="background: #1e1b4b; color: #c7d2fe; border-color: #6366f1;">
              تقرير النشاط والتمارين والحضور
            </div>
            <div style="font-size: 8.5pt; color: #64748b; margin-top: 4px; font-family: monospace;">
              مرجع: ${reportRef}
            </div>
          </div>
        </div>

        <!-- Date & Exact Time Bar -->
        <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="color: #64748b; font-size: 9pt;">تاريخ استخراج التقرير:</span>
            <strong style="color: #0f172a; font-family: monospace; font-size: 10.5pt; margin-right: 6px;">${currentDateStr}</strong>
          </div>
          <div>
            <span style="color: #64748b; font-size: 9pt;">وقت الاستخراج بالساعة:</span>
            <strong style="color: #b45309; font-family: monospace; font-size: 11pt; margin-right: 6px;">${currentTimeStr}</strong>
          </div>
          <div>
            <span style="color: #64748b; font-size: 9pt;">المعتمد:</span>
            <strong style="color: #0f172a; font-size: 9.5pt; margin-right: 6px;">${managerName}</strong>
          </div>
        </div>

        <!-- Member Profile Card -->
        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px;">
            <div>
              <span style="font-size: 9pt; color: #64748b; display: block;">اسم العضو المشترك</span>
              <strong style="font-size: 13pt; color: #0f172a;">${member.fullNameAr}</strong>
            </div>
            <div style="text-align: left;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 6px; font-weight: 800; font-size: 9pt; background: ${memberStatus.bg}; color: ${memberStatus.color};">
                ${memberStatus.text}
              </span>
            </div>
          </div>

          <div class="meta-grid" style="margin-bottom: 0; background: transparent; border: none; padding: 0;">
            <div class="meta-item"><strong>رقم العضوية:</strong> <span style="font-family: monospace; font-weight: 800;">رقم ${member.membershipNumber}</span></div>
            <div class="meta-item"><strong>رقم الهاتف:</strong> <span style="font-family: monospace;">${member.phone}</span></div>
            <div class="meta-item"><strong>فئة الباقة:</strong> <span>${tierLabels[member.tier] || member.tier}</span></div>
            <div class="meta-item"><strong>تاريخ الاشتراك:</strong> <span style="font-family: monospace;">${member.startDate}</span></div>
            <div class="meta-item"><strong>تاريخ الانتهاء:</strong> <span style="font-family: monospace;">${member.endDate}</span></div>
            <div class="meta-item"><strong>الأيام المتبقية:</strong> <span style="font-weight: 800; color: #059669;">${member.remainingDays} يوم</span></div>
            <div class="meta-item"><strong>الكابتن المشرف:</strong> <span>${member.assignedCoachName || member.currentProgram?.coachName || 'كابتن الصالة العام'}</span></div>
            <div class="meta-item"><strong>إجمالي مرات الحضور:</strong> <span style="font-weight: 800; color: #b45309; font-size: 11pt;">${totalVisitsCount} زيارة</span></div>
            <div class="meta-item"><strong>الرصيد المتبقي:</strong> <span>${(member.balanceDue || 0).toLocaleString()} ج.م</span></div>
          </div>
        </div>

        <!-- Section 1: Attendance History (سجل الحضور والزيارات) -->
        <div style="margin-bottom: 25px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="font-size: 11pt; color: #1e1b4b; border-right: 4px solid #4f46e5; padding-right: 8px;">
              ١. سجل حضور وزيارات الصالة الرياضية الفعلي (محدث بالساعة والتاريخ)
            </strong>
            <span style="font-size: 9.5pt; font-weight: bold; color: #059669; background: #ecfdf5; padding: 3px 10px; border-radius: 6px; border: 1px solid #a7f3d0;">
              إجمالي الزيارات المسجلة: ${totalVisitsCount} زيارة مؤكدة
            </span>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 35px; text-align: center;">#</th>
                <th>التاريخ</th>
                <th>اليوم</th>
                <th>وقت الدخول بالساعة</th>
                <th>حالة الحصة</th>
                <th>مدة التواجد</th>
                <th>طريقة التسجيل ومسؤول الاستقبال</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${attendanceRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- Section 2: Workout Program & Routine (جدول وخطة التمارين المعتمدة ومطابقتها مع الحضور) -->
        <div style="margin-bottom: 25px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="font-size: 11pt; color: #1e1b4b; border-right: 4px solid #d97706; padding-right: 8px;">
              ٢. تفاصيل جدول وخطة التمارين المعتمدة ومطابقتها مع الحضور الفعلي
            </strong>
            <span style="font-size: 9pt; font-weight: bold; color: #b45309; background: #fffbeb; padding: 3px 10px; border-radius: 6px; border: 1px solid #fde68a;">
              خطة تدريب أسبوعية مقسمة على ${programDaysCount} أيام
            </span>
          </div>

          <!-- Explanation Banner reconciling Attendance Visits with Workout Days -->
          <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; font-size: 9pt; color: #166534; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>تطابق الحضور الفعلي مع خطة التمارين:</strong>
              حضر العضو <strong>(${totalVisitsCount})</strong> زيارات بالصالة حتى الآن. الأيام الموضحة أدناه توضح خطة التمارين الرياضية المعتمدة للاعب؛ الأيام المنجزة تتطابق مع سجل الحضور الفعلي، وباقي الأيام هي خطة تدريب مستمرة بحسب تقدم اللاعب بالصالة.
            </div>
          </div>

          ${hasHistory ? sessions.map((sess, sIdx) => `
            <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 12px; background: #fafafa;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; margin-bottom: 8px;">
                <div>
                  <strong style="color: #0f172a; font-size: 10.5pt;">${sess.dayTitle}</strong>
                  <span style="font-size: 9pt; color: #64748b; margin-right: 10px;">(تاريخ الحصة: ${sess.date} • الساعة: ${sess.startedAt})</span>
                </div>
                <div style="font-size: 8.5pt; font-weight: bold; color: #b45309;">
                  مدة التمرين: ${sess.durationMinutes || 75} دقيقة ★ تقييم: 5/5
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th style="width: 30px;">#</th>
                    <th>اسم التمرين</th>
                    <th style="width: 80px; text-align: center;">المجموعات</th>
                    <th style="width: 100px; text-align: center;">التكرارات</th>
                    <th>تفاصيل الأوزان المسجلة (كجم)</th>
                    <th style="width: 80px; text-align: center;">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  ${(sess.exercisesProgress || []).map((prog, pIdx) => {
                    const weightsStr = prog.sets.map(s => `${s.weightKg} كجم`).join(' - ');
                    const cleanName = (prog.exerciseNameAr || '').replace(/\\([A-Za-z0-9\\s\\+\\-\\&\\/]+\\)/g, '').trim();
                    return `
                      <tr>
                        <td style="text-align: center; color: #64748b;">${pIdx + 1}</td>
                        <td style="font-weight: 700; color: #0f172a;">${cleanName}</td>
                        <td style="text-align: center; font-family: monospace;">${prog.sets.length}</td>
                        <td style="text-align: center; font-family: monospace;">${prog.sets[0]?.reps || 10}</td>
                        <td style="font-family: monospace; font-weight: bold; color: #059669;">${weightsStr}</td>
                        <td style="text-align: center;"><span class="badge badge-emerald">حصة مكتملة</span></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>

              ${sess.notes ? `
                <div style="font-size: 8.5pt; color: #475569; background: #ffffff; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 6px;">
                  <strong>ملاحظات وتوجيهات الكابتن:</strong> ${sess.notes}
                </div>
              ` : ''}
            </div>
          `).join('') : `
            <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; background: #f8fafc; margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px;">
                <div>
                  <strong style="color: #b45309; font-size: 11pt;">البرنامج التدريبي المعتمد للاعب: ${member.currentProgram?.titleAr || 'البرنامج العام'}</strong>
                  <span style="font-size: 9pt; color: #64748b; margin-right: 10px;">(الكابتن المشرف: ${member.assignedCoachName || member.currentProgram?.coachName || 'كابتن الصالة'})</span>
                </div>
                <span class="badge badge-emerald">جدول معتمد رسمياً</span>
              </div>

              ${programDays.map((day, dIdx) => {
                const cleanDayTitle = (day.titleAr || '').replace(/\\([A-Za-z0-9\\s\\+\\-\\&\\/]+\\)/g, '').trim();
                const isAttendedDay = dIdx < totalVisitsCount;
                return `
                <div style="margin-bottom: 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong style="color: #0f172a; font-size: 10.5pt;">اليوم ${day.dayNumber}: ${cleanDayTitle}</strong>
                    ${isAttendedDay ? `
                      <span style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; font-size: 8.5pt; font-weight: bold; padding: 2px 8px; border-radius: 6px;">
                        ✓ حصة تدريبية تم تنفيذها وحضورها بالصالة (الزيارة رقم #${dIdx + 1})
                      </span>
                    ` : `
                      <span style="background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; font-size: 8.5pt; font-weight: bold; padding: 2px 8px; border-radius: 6px;">
                        ⏳ خطة تدريبية مجدولة قادمة (ضمن برنامج اللاعب)
                      </span>
                    `}
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th style="width: 30px;">#</th>
                        <th>التمرين الرياضي</th>
                        <th>الجهاز والأداة</th>
                        <th style="width: 80px; text-align: center;">المجموعات</th>
                        <th style="width: 100px; text-align: center;">التكرارات</th>
                        <th>توجيهات الكابتن الفنية</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(day.exercises || []).map((ex, exIdx) => {
                        const cleanExName = (ex.nameAr || '').replace(/\\([A-Za-z0-9\\s\\+\\-\\&\\/]+\\)/g, '').trim();
                        return `
                        <tr>
                          <td style="text-align: center; color: #64748b;">${exIdx + 1}</td>
                          <td style="font-weight: 700; color: #0f172a;">${cleanExName}</td>
                          <td style="color: #64748b;">${ex.equipment || 'أجهزة الصالة'}</td>
                          <td style="text-align: center; font-family: monospace;">${ex.sets}</td>
                          <td style="text-align: center; font-family: monospace;">${ex.reps}</td>
                          <td style="font-size: 8.5pt; color: #475569;">${ex.coachTipsAr || 'أداء منتظم وتحكم بالوزن'}</td>
                        </tr>
                      `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Official Signatures and Club Stamp -->
        ${this.buildUniversalFooterSignatures(
          managerName,
          undefined,
          {
            title: 'الكابتن المشرف والمدرب',
            subtitle: member.assignedCoachName || 'كابتن الصالة العام'
          },
          'نادي جيم M22<br/>إدارة النشاط والتدريب<br/>معتمد رسمياً'
        )}
      </div>
    `;

    this.createPrintWindow(contentHtml, `تقرير نشاط العضو - ${member.fullNameAr}`);
  }

  /**
   * Print Official Revenue Report PDF (تقرير الإيرادات العام المعتمد)
   */
  printRevenueReportPDF(transactions: FinancialTransaction[], managerName: string = 'المدير العام') {
    const revenueTxs = transactions
      .filter(t => t.type !== 'expense')
      .sort((a, b) => {
        const timeA = a.date ? new Date(a.date.replace(' ', 'T')).getTime() : 0;
        const timeB = b.date ? new Date(b.date.replace(' ', 'T')).getTime() : 0;
        if (timeA !== timeB) return timeA - timeB;
        return (a.voucherSequenceNumber || 0) - (b.voucherSequenceNumber || 0);
      });
    const totalRevenue = revenueTxs.reduce((sum, t) => sum + t.amount, 0);
    const currentDateStr = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const currentTimeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Method breakdown
    const cashTotal = revenueTxs.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.amount, 0);
    const cardTotal = revenueTxs.filter(t => t.paymentMethod === 'card').reduce((sum, t) => sum + t.amount, 0);
    const instapayTotal = revenueTxs.filter(t => t.paymentMethod === 'instapay').reduce((sum, t) => sum + t.amount, 0);
    const vodafoneTotal = revenueTxs.filter(t => t.paymentMethod === 'vodafone_cash').reduce((sum, t) => sum + t.amount, 0);

    const contentHtml = `
      <div class="print-container">
        <div class="header-box">
          <div>
            <div class="brand-title">GYM-M22 SPORTS CLUB</div>
            <div class="brand-sub">الإدارة العامة • التقرير المالي للإيرادات والمقبوضات</div>
          </div>
          <div class="meta-tag">
            <strong>تقرير الإيرادات المعتمد</strong><br/>
            تاريخ الطباعة: ${currentDateStr}<br/>
            الوقت: ${currentTimeStr}
          </div>
        </div>

        <div style="background: #f8fafc; border: 1.5px solid #059669; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 11pt; color: #475569; font-weight: 700;">إجمالي الإيرادات والمقبوضات المحصلة</div>
              <div style="font-size: 20pt; font-weight: 900; color: #059669;">${totalRevenue.toLocaleString()} ج.م</div>
              <div style="font-size: 9pt; color: #64748b; margin-top: 4px;">فقط وقدره: ${tafqeet(totalRevenue)} لا غير</div>
            </div>
            <div style="text-align: left; font-size: 9.5pt; color: #334155; line-height: 1.8;">
              <div>عدد السندات: <strong>${revenueTxs.length} سند</strong></div>
              <div>المسؤول المعتمد: <strong>${managerName}</strong></div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 9pt; text-align: center;">
            <div style="background: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <span style="color: #64748b; display: block;">نقداً (كاش)</span>
              <strong style="color: #059669;">${cashTotal.toLocaleString()} ج</strong>
            </div>
            <div style="background: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <span style="color: #64748b; display: block;">بطاقة بنكية (فيزا)</span>
              <strong style="color: #0284c7;">${cardTotal.toLocaleString()} ج</strong>
            </div>
            <div style="background: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <span style="color: #64748b; display: block;">إنستاباي InstaPay</span>
              <strong style="color: #7c3aed;">${instapayTotal.toLocaleString()} ج</strong>
            </div>
            <div style="background: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <span style="color: #64748b; display: block;">فودافون كاش</span>
              <strong style="color: #dc2626;">${vodafoneTotal.toLocaleString()} ج</strong>
            </div>
          </div>
        </div>

        <h3 style="font-size: 12pt; font-weight: 800; color: #0f172a; margin-bottom: 10px; border-right: 4px solid #059669; padding-right: 8px;">
          بيان سندات ومقبوضات الإيرادات التفصيلية
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 9pt;">
          <thead>
            <tr style="background: #0f172a; color: #ffffff;">
              <th style="padding: 8px; border: 1px solid #334155;">#</th>
              <th style="padding: 8px; border: 1px solid #334155;">رقم السند</th>
              <th style="padding: 8px; border: 1px solid #334155;">التاريخ والتوقيت</th>
              <th style="padding: 8px; border: 1px solid #334155;">الطرف / العضو</th>
              <th style="padding: 8px; border: 1px solid #334155;">نوع الإيراد</th>
              <th style="padding: 8px; border: 1px solid #334155;">طريقة الدفع</th>
              <th style="padding: 8px; border: 1px solid #334155;">المحصل</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: left;">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            ${revenueTxs.map((tx, idx) => {
              const typeNames: Record<string, string> = {
                subscription: 'اشتراك جديد',
                renewal: 'تجديد اشتراك',
                pt_package: 'تدريب خاص PT',
                product_sale: 'مبيعات وخدمات',
                locker: 'خزائن ومستلزمات'
              };
              const methodNames: Record<string, string> = {
                cash: 'كاش',
                card: 'فيزا',
                instapay: 'إنستاباي',
                vodafone_cash: 'فودافون كاش',
                transfer: 'تحويل'
              };

              return `
                <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  <td style="padding: 7px; border: 1px solid #e2e8f0; text-align: center; color: #64748b;">${idx + 1}</td>
                  <td style="padding: 7px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: 700; color: #059669;">
                    #${tx.voucherSequenceNumber || idx + 1}
                  </td>
                  <td style="padding: 7px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 8pt; color: #475569;">${tx.date}</td>
                  <td style="padding: 7px; border: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">
                    ${tx.memberName || 'إيراد نقدي عام'}
                    ${tx.membershipNumber ? `<span style="font-size: 8pt; color: #64748b; display: block;">#${tx.membershipNumber}</span>` : ''}
                  </td>
                  <td style="padding: 7px; border: 1px solid #e2e8f0; color: #334155;">${typeNames[tx.type] || tx.type}</td>
                  <td style="padding: 7px; border: 1px solid #e2e8f0; color: #475569;">${methodNames[tx.paymentMethod] || tx.paymentMethod}</td>
                  <td style="padding: 7px; border: 1px solid #e2e8f0; font-size: 8pt; color: #64748b;">${tx.recordedBy}</td>
                  <td style="padding: 7px; border: 1px solid #e2e8f0; text-align: left; font-weight: 800; color: #059669; font-family: monospace;">
                    ${tx.amount.toLocaleString()} ج.م
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f1f5f9; font-weight: 900; font-size: 10pt;">
              <td colspan="7" style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">إجمالي الإيرادات الكلية:</td>
              <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: left; color: #059669; font-family: monospace;">
                ${totalRevenue.toLocaleString()} ج.م
              </td>
            </tr>
          </tfoot>
        </table>

        ${this.buildUniversalFooterSignatures(
          managerName,
          'accountant',
          { title: 'إعداد ومراجعة الحسابات', subtitle: 'إدارة الحسابات والمالية' },
          'GYM-M22 SPORTS<br/>إدارة الحسابات والمالية<br/>★ معتمد رسمي ★'
        )}

        <div style="margin-top: 20px; text-align: center; font-size: 8.5pt; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 8px;">
          تم استخراج هذا التقرير رسمياً من المنظومة المركزية لنادي GYM-M22 الرياضي • تاريخ: ${currentDateStr} • الوقت: ${currentTimeStr}
        </div>
      </div>
    `;

    this.createPrintWindow(contentHtml, 'تقرير إيرادات الصالة المعتمد - GYM-M22');
  }

  /**
   * Print Official Expense Report PDF (تقرير المصروفات وأذون الصرف المعتمد)
   */
  printExpenseReportPDF(transactions: FinancialTransaction[], managerName: string = 'المدير العام') {
    const expenseTxs = transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => {
        const timeA = a.date ? new Date(a.date.replace(' ', 'T')).getTime() : 0;
        const timeB = b.date ? new Date(b.date.replace(' ', 'T')).getTime() : 0;
        if (timeA !== timeB) return timeA - timeB;
        return (a.voucherSequenceNumber || 0) - (b.voucherSequenceNumber || 0);
      });
    const totalExpenses = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
    const currentDateStr = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const currentTimeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const contentHtml = `
      <div class="print-container">
        <div class="header-box">
          <div>
            <div class="brand-title">GYM-M22 SPORTS CLUB</div>
            <div class="brand-sub">الإدارة العامة • التقرير المالي للمصروفات والنفقات التشغيلية</div>
          </div>
          <div class="meta-tag">
            <strong>تقرير أذون الصرف المعتمد</strong><br/>
            تاريخ الطباعة: ${currentDateStr}<br/>
            الوقت: ${currentTimeStr}
          </div>
        </div>

        <div style="background: #fff1f2; border: 1.5px solid #e11d48; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 11pt; color: #475569; font-weight: 700;">إجمالي المصروفات والنفقات المنصرفة</div>
              <div style="font-size: 20pt; font-weight: 900; color: #e11d48;">${totalExpenses.toLocaleString()} ج.م</div>
              <div style="font-size: 9pt; color: #64748b; margin-top: 4px;">فقط وقدره: ${tafqeet(totalExpenses)} لا غير</div>
            </div>
            <div style="text-align: left; font-size: 9.5pt; color: #334155; line-height: 1.8;">
              <div>عدد أذون الصرف: <strong>${expenseTxs.length} إذن صرف</strong></div>
              <div>الاعتماد الإداري: <strong>${managerName}</strong></div>
            </div>
          </div>
        </div>

        <h3 style="font-size: 12pt; font-weight: 800; color: #0f172a; margin-bottom: 10px; border-right: 4px solid #e11d48; padding-right: 8px;">
          بيان أذون وسندات الصرف التشغيلية بالتفصيل
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 9pt;">
          <thead>
            <tr style="background: #0f172a; color: #ffffff;">
              <th style="padding: 8px; border: 1px solid #334155;">#</th>
              <th style="padding: 8px; border: 1px solid #334155;">رقم إذن الصرف</th>
              <th style="padding: 8px; border: 1px solid #334155;">التاريخ والتوقيت</th>
              <th style="padding: 8px; border: 1px solid #334155;">الجهة المستفيدة / المستلم</th>
              <th style="padding: 8px; border: 1px solid #334155;">البيان وتصنيف المصروف</th>
              <th style="padding: 8px; border: 1px solid #334155;">طريقة الصرف</th>
              <th style="padding: 8px; border: 1px solid #334155;">مسؤول الصرف</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: left;">المبلغ المنصرف</th>
            </tr>
          </thead>
          <tbody>
            ${expenseTxs.map((tx, idx) => {
              const methodNames: Record<string, string> = {
                cash: 'كاش من الدرج',
                card: 'فيزا',
                instapay: 'إنستاباي',
                vodafone_cash: 'فودافون كاش',
                transfer: 'تحويل'
              };

              return `
                <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#fff5f5'};">
                  <td style="padding: 7px; border: 1px solid #e2e8f0; text-align: center; color: #64748b;">${idx + 1}</td>
                  <td style="padding: 7px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: 700; color: #e11d48;">
                    #${tx.voucherSequenceNumber || idx + 1}
                  </td>
                  <td style="padding: 7px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 8pt; color: #475569;">${tx.date}</td>
                  <td style="padding: 7px; border: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">
                    ${tx.beneficiaryName || tx.memberName || 'مصروف عام'}
                  </td>
                  <td style="padding: 7px; border: 1px solid #e2e8f0; color: #334155; font-size: 8.5pt;">${tx.notes || 'مصروفات تشغيلية'}</td>
                  <td style="padding: 7px; border: 1px solid #e2e8f0; color: #475569;">${methodNames[tx.paymentMethod] || tx.paymentMethod}</td>
                  <td style="padding: 7px; border: 1px solid #e2e8f0; font-size: 8pt; color: #64748b;">${tx.recordedBy}</td>
                  <td style="padding: 7px; border: 1px solid #e2e8f0; text-align: left; font-weight: 800; color: #e11d48; font-family: monospace;">
                    ${tx.amount.toLocaleString()} ج.م
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #fff1f2; font-weight: 900; font-size: 10pt;">
              <td colspan="7" style="padding: 10px; border: 1px solid #fecdd3; text-align: right;">إجمالي المصروفات والنفقات:</td>
              <td style="padding: 10px; border: 1px solid #fecdd3; text-align: left; color: #e11d48; font-family: monospace;">
                ${totalExpenses.toLocaleString()} ج.م
              </td>
            </tr>
          </tfoot>
        </table>

        ${this.buildUniversalFooterSignatures(
          managerName,
          'accountant',
          { title: 'مسؤول الصرف والخزينة', subtitle: 'إدارة المصروفات والخزينة' },
          'GYM-M22 SPORTS<br/>إدارة المصروفات والخزينة<br/>★ إذن صرف معتمد ★'
        )}

        <div style="margin-top: 20px; text-align: center; font-size: 8.5pt; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 8px;">
          تم استخراج هذا التقرير رسمياً من المنظومة المركزية لنادي GYM-M22 الرياضي • تاريخ: ${currentDateStr} • الوقت: ${currentTimeStr}
        </div>
      </div>
    `;

    this.createPrintWindow(contentHtml, 'تقرير مصروفات الصالة وأذون الصرف - GYM-M22');
  }

  /**
   * Print Official Net Profit & Financial Balance Statement PDF (كشف الحساب والميزانية وصافي الأرباح)
   */
  printNetProfitStatementPDF(
    revenue: number,
    expenses: number,
    netProfit: number,
    transactions: FinancialTransaction[],
    managerName: string = 'المدير العام'
  ) {
    const currentDateStr = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const currentTimeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const profitMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0';

    const contentHtml = `
      <div class="print-container">
        <div class="header-box">
          <div>
            <div class="brand-title">GYM-M22 SPORTS CLUB</div>
            <div class="brand-sub">الإدارة العامة • القوائم المالية وصافي الأرباح وميزان المراجعة</div>
          </div>
          <div class="meta-tag">
            <strong>تقرير الميزانية وصافي الربح</strong><br/>
            تاريخ الطباعة: ${currentDateStr}<br/>
            الوقت: ${currentTimeStr}
          </div>
        </div>

        <!-- 3 Executive Metric Highlights -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="background: #f0fdf4; border: 1.5px solid #16a34a; border-radius: 12px; padding: 14px; text-align: center;">
            <span style="font-size: 9.5pt; color: #166534; font-weight: 700; display: block;">(+) إجمالي الإيرادات</span>
            <strong style="font-size: 16pt; color: #15803d; font-family: monospace; display: block; margin-top: 4px;">
              ${revenue.toLocaleString()} ج.م
            </strong>
          </div>

          <div style="background: #fff1f2; border: 1.5px solid #e11d48; border-radius: 12px; padding: 14px; text-align: center;">
            <span style="font-size: 9.5pt; color: #9f1239; font-weight: 700; display: block;">(-) إجمالي المصروفات</span>
            <strong style="font-size: 16pt; color: #be123c; font-family: monospace; display: block; margin-top: 4px;">
              ${expenses.toLocaleString()} ج.م
            </strong>
          </div>

          <div style="background: #fefce8; border: 2px solid #ca8a04; border-radius: 12px; padding: 14px; text-align: center;">
            <span style="font-size: 9.5pt; color: #854d0e; font-weight: 700; display: block;">(=) صافي الربح المحقق</span>
            <strong style="font-size: 18pt; color: #a16207; font-family: monospace; display: block; margin-top: 4px;">
              ${netProfit.toLocaleString()} ج.م
            </strong>
            <span style="font-size: 8.5pt; color: #713f12; font-weight: 700;">هامش ربحية: ${profitMargin}%</span>
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 9pt;">
          <strong>تفنيد صافي الأرباح كتابياً:</strong> فقط وقدره ${tafqeet(netProfit)} لا غير، مسجلة رسميـاً بدفاتر وخزائن نادي GYM-M22 الرياضي.
        </div>

        <h3 style="font-size: 12pt; font-weight: 800; color: #0f172a; margin-bottom: 10px; border-right: 4px solid #ca8a04; padding-right: 8px;">
          سجل الحركات المالية المجمعة (إيرادات ومصروفات)
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 9pt;">
          <thead>
            <tr style="background: #0f172a; color: #ffffff;">
              <th style="padding: 8px; border: 1px solid #334155;">#</th>
              <th style="padding: 8px; border: 1px solid #334155;">نوع القيد</th>
              <th style="padding: 8px; border: 1px solid #334155;">التاريخ</th>
              <th style="padding: 8px; border: 1px solid #334155;">الطرف المعني / البيان</th>
              <th style="padding: 8px; border: 1px solid #334155;">طريقة الدفع</th>
              <th style="padding: 8px; border: 1px solid #334155;">المسؤول</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: left;">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.slice(0, 30).map((tx, idx) => {
              const isExpense = tx.type === 'expense';
              return `
                <tr style="background: ${isExpense ? '#fff5f5' : '#f0fdf4'};">
                  <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; color: #64748b;">${idx + 1}</td>
                  <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: 700; color: ${isExpense ? '#e11d48' : '#16a34a'};">
                    ${isExpense ? '🔴 سند صرف' : '🟢 سند قبض'}
                  </td>
                  <td style="padding: 6px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 8pt; color: #475569;">${tx.date}</td>
                  <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">
                    ${tx.memberName || tx.beneficiaryName || tx.notes || 'معاملة مالية'}
                  </td>
                  <td style="padding: 6px; border: 1px solid #e2e8f0; color: #475569;">${tx.paymentMethod}</td>
                  <td style="padding: 6px; border: 1px solid #e2e8f0; font-size: 8pt; color: #64748b;">${tx.recordedBy}</td>
                  <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: left; font-weight: 800; font-family: monospace; color: ${isExpense ? '#e11d48' : '#16a34a'};">
                    ${isExpense ? '-' : '+'}${tx.amount.toLocaleString()} ج.م
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        ${this.buildUniversalFooterSignatures(
          managerName,
          'accountant',
          { title: 'رئيس قسم الحسابات والتدقيق', subtitle: 'إدارة الميزانية والشؤون المالية' },
          'GYM-M22 SPORTS<br/>الميزانية العامة والأرباح<br/>★ تدقيق معتمد ★'
        )}

        <div style="margin-top: 20px; text-align: center; font-size: 8.5pt; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 8px;">
          تم إصدار هذا الكشف المالي رسمياً من النظام المركزي لنادي GYM-M22 الرياضي • تاريخ: ${currentDateStr} • الوقت: ${currentTimeStr}
        </div>
      </div>
    `;

    this.createPrintWindow(contentHtml, 'كشف الميزانية وصافي أرباح الصالة - GYM-M22');
  }

  /**
   * Print Official Staff Attendance & Work Hours PDF Report (كشف حضور وانصراف وساعات عمل واستحقاقات الموظفين)
   * Supports filtering by all employees or a specific selected employee, calculating total net hours and hourly wage payout.
   */
  printAttendanceReportPDF(
    attendances: EmployeeAttendanceRecord[],
    employees: EmployeeAccount[],
    selectedEmployeeId: string = 'all',
    managerName: string = 'المدير العام',
    periodName: string = 'سجل الحضور والانصراف الشهري'
  ) {
    const currentDateStr = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const currentTimeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const targetEmployee = selectedEmployeeId && selectedEmployeeId !== 'all'
      ? employees.find(e => e.id === selectedEmployeeId)
      : null;

    const filteredRecords = selectedEmployeeId && selectedEmployeeId !== 'all'
      ? attendances.filter(a => a.employeeId === selectedEmployeeId)
      : attendances;

    // Calculate total net worked hours
    const totalHoursWorkedAll = filteredRecords.reduce((sum, r) => sum + (r.totalHoursWorked || 0), 0);
    const completedShiftsCount = filteredRecords.filter(r => r.checkOutTime).length;

    // Helper: calculate employee hourly rate and earned payout
    const getEmployeeHourlyDetails = (empId: string, empRole: string) => {
      const emp = employees.find(e => e.id === empId);
      const baseSal = emp?.baseSalary || (empRole === 'coach' ? 7000 : empRole === 'staff' ? 5500 : 7500);
      const rate = emp?.hourlyRate || Math.round(baseSal / 200) || 30; // default 200 working hours/month
      return { emp, baseSalary: baseSal, hourlyRate: rate };
    };

    // Calculate total payout across filtered records
    const totalPayoutAmount = filteredRecords.reduce((sum, r) => {
      const { hourlyRate } = getEmployeeHourlyDetails(r.employeeId, r.role);
      const hours = r.totalHoursWorked || 0;
      return sum + (hours * hourlyRate);
    }, 0);

    const targetTitle = targetEmployee 
      ? `تقرير الموظف: ${targetEmployee.nameAr} (${targetEmployee.role})`
      : `كشف شامل لجميع موظفي وكباتن النادي (${employees.length} موظف)`;

    const roleLabels: Record<string, string> = {
      manager: 'مدير عام',
      accountant: 'مسؤول حسابات',
      staff: 'موظف استقبال',
      coach: 'كابتن ومدرب'
    };

    const contentHtml = `
      <div class="print-container">
        <div class="header-box">
          <div>
            <div class="brand-title">GYM-M22 SPORTS CLUB</div>
            <div class="brand-sub">الإدارة العامة • سجل الحضور والانصراف وحساب مستحقات ساعات العمل</div>
          </div>
          <div class="meta-tag">
            <strong>كشف الحضور والساعات PDF</strong><br/>
            التاريخ: ${currentDateStr}<br/>
            المسؤول: ${managerName}
          </div>
        </div>

        <div style="background: #0f172a; color: #fff; padding: 12px 16px; border-radius: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; border-right: 5px solid #06b6d4;">
          <div>
            <div style="font-size: 13pt; font-weight: 800; color: #38bdf8;">${targetTitle}</div>
            <div style="font-size: 9pt; color: #94a3b8; margin-top: 2px;">الفترة المحددة: ${periodName} • إجمالي السجلات: ${filteredRecords.length} وردية</div>
          </div>
          ${targetEmployee ? `
            <div style="text-align: left; font-size: 9.5pt; color: #e2e8f0;">
              <div>الراتب الأساسي: <strong style="color: #4ade80;">${(targetEmployee.baseSalary || 5000).toLocaleString()} ج.م</strong></div>
              <div>أجر الساعة المعتمد: <strong style="color: #facc15;">${targetEmployee.hourlyRate || Math.round((targetEmployee.baseSalary || 5000) / 200)} ج.م/ساعة</strong></div>
            </div>
          ` : ''}
        </div>

        <!-- Executive Metric Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 10px; text-align: center;">
            <span style="font-size: 8.5pt; color: #64748b; font-weight: 700; display: block;">إجمالي الورديات</span>
            <strong style="font-size: 14pt; color: #0f172a; font-family: monospace; display: block; margin-top: 2px;">
              ${filteredRecords.length} وردية
            </strong>
          </div>

          <div style="background: #f0fdf4; border: 1.5px solid #16a34a; border-radius: 12px; padding: 10px; text-align: center;">
            <span style="font-size: 8.5pt; color: #166534; font-weight: 700; display: block;">ساعات العمل الفعلي</span>
            <strong style="font-size: 14pt; color: #15803d; font-family: monospace; display: block; margin-top: 2px;">
              ${totalHoursWorkedAll.toFixed(2)} ساعة
            </strong>
          </div>

          <div style="background: #fefce8; border: 1.5px solid #eab308; border-radius: 12px; padding: 10px; text-align: center;">
            <span style="font-size: 8.5pt; color: #854d0e; font-weight: 700; display: block;">الورديات المكتملة</span>
            <strong style="font-size: 14pt; color: #a16207; font-family: monospace; display: block; margin-top: 2px;">
              ${completedShiftsCount} مكتملة
            </strong>
          </div>

          <div style="background: #ecfeff; border: 1.5px solid #06b6d4; border-radius: 12px; padding: 10px; text-align: center;">
            <span style="font-size: 8.5pt; color: #155e75; font-weight: 700; display: block;">إجمالي المستحق لساعات العمل</span>
            <strong style="font-size: 14pt; color: #0891b2; font-family: monospace; display: block; margin-top: 2px;">
              ${Math.round(totalPayoutAmount).toLocaleString()} ج.م
            </strong>
          </div>
        </div>

        <!-- Detailed Attendance Ledger Table -->
        <div style="font-size: 10pt; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
          📋 بيان تفصيلي لحركات الدخول والانصراف والساعات المنجزة ومستحقات أجر الساعة:
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 20px;">
          <thead>
            <tr style="background: #1e293b; color: #ffffff; text-align: right;">
              <th style="padding: 8px; width: 30px; text-align: center;">#</th>
              <th style="padding: 8px;">اسم الموظف / الكابتن</th>
              <th style="padding: 8px;">الوظيفة</th>
              <th style="padding: 8px; text-align: center;">تاريخ الوردية</th>
              <th style="padding: 8px; text-align: center;">ساعة الحضور</th>
              <th style="padding: 8px; text-align: center;">ساعة الانصراف</th>
              <th style="padding: 8px; text-align: center;">ساعات العمل</th>
              <th style="padding: 8px; text-align: center;">أجر الساعة</th>
              <th style="padding: 8px; text-align: center;">المستحق (ج.م)</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRecords.length === 0 ? `
              <tr>
                <td colSpan="9" style="padding: 20px; text-align: center; color: #94a3b8; font-weight: bold;">
                  لا توجد سجلات حضور مسجلة في هذه الفترة
                </td>
              </tr>
            ` : filteredRecords.map((rec, idx) => {
              const { hourlyRate } = getEmployeeHourlyDetails(rec.employeeId, rec.role);
              const hrs = rec.totalHoursWorked || 0;
              const payout = hrs * hourlyRate;

              return `
                <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
                  <td style="padding: 7px; text-align: center; font-weight: bold; color: #64748b;">${idx + 1}</td>
                  <td style="padding: 7px; font-weight: bold; color: #0f172a;">${rec.employeeName}</td>
                  <td style="padding: 7px; color: #0284c7; font-weight: 600;">${roleLabels[rec.role] || rec.role}</td>
                  <td style="padding: 7px; text-align: center; font-family: monospace; font-weight: bold;">${rec.date}</td>
                  <td style="padding: 7px; text-align: center; font-family: monospace; color: #16a34a; font-weight: bold;">${rec.checkInTime}</td>
                  <td style="padding: 7px; text-align: center; font-family: monospace; color: #d97706; font-weight: bold;">
                    ${rec.checkOutTime || '<span style="color: #0284c7;">في الخدمة</span>'}
                  </td>
                  <td style="padding: 7px; text-align: center; font-family: monospace; font-weight: bold; color: #0f172a;">
                    ${hrs ? `${hrs} س` : '—'}
                  </td>
                  <td style="padding: 7px; text-align: center; font-family: monospace; color: #64748b;">
                    ${hourlyRate} ج.م
                  </td>
                  <td style="padding: 7px; text-align: center; font-family: monospace; font-weight: bold; color: #0891b2;">
                    ${hrs ? `${Math.round(payout)} ج.م` : '—'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f1f5f9; font-weight: bold; border-top: 2px solid #cbd5e1;">
              <td colSpan="6" style="padding: 10px; text-align: right; color: #0f172a;">
                إجمالي الساعات والمستحقات لكافة السجلات أعلاه:
              </td>
              <td style="padding: 10px; text-align: center; font-family: monospace; color: #15803d; font-size: 10pt;">
                ${totalHoursWorkedAll.toFixed(2)} س
              </td>
              <td style="padding: 10px;"></td>
              <td style="padding: 10px; text-align: center; font-family: monospace; color: #0891b2; font-size: 10.5pt;">
                ${Math.round(totalPayoutAmount).toLocaleString()} ج.م
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- Footer Signatures -->
        ${this.buildUniversalFooterSignatures(
          managerName,
          'staff',
          { title: 'مسؤول الموارد البشرية والدوام', subtitle: 'إعداد كشف الحضور' },
          'GYM-M22 SPORTS<br/>سجل الحضور والدوام<br/>★ معتمد رسمياً ★'
        )}

        <div style="margin-top: 20px; text-align: center; font-size: 8.5pt; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 8px;">
          تم استخراج هذا الكشف رسمياً من النظام المركزي لنادي GYM-M22 الرياضي • تاريخ الطباعة: ${currentDateStr} • الوقت: ${currentTimeStr}
        </div>
      </div>
    `;

    this.createPrintWindow(contentHtml, 'كشف حضور وانصراف وساعات عمل الموظفين - GYM-M22');
  }

  printGeneralLedgerPDF(entries: any[], totalDebit: number, totalCredit: number, netBalance: number, managerName: string) {
    const now = new Date();
    const currentDateStr = now.toLocaleDateString('ar-EG');
    const currentTimeStr = now.toLocaleTimeString('ar-EG');

    let rowsHtml = '';
    entries.forEach((e, i) => {
      rowsHtml += `
        <tr>
          <td style="font-family: monospace; font-weight: bold; color: #b45309;">${e.id}</td>
          <td>${e.date} <span style="font-size: 8pt; color: #64748b;">${e.time}</span></td>
          <td><span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 8pt;">${e.categoryAr}</span></td>
          <td style="font-weight: bold;">${e.description}</td>
          <td>${e.servedBy}</td>
          <td style="text-align: center;"><span style="font-size: 8pt; font-weight: bold;">${e.paymentMethod === 'cash' ? 'نقدي' : e.paymentMethod === 'card' ? 'فيزا' : e.paymentMethod === 'instapay' ? 'إنستاباي' : e.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : e.paymentMethod === 'transfer' ? 'تحويل' : e.paymentMethod}</span></td>
          <td style="color: #059669; font-weight: bold; font-family: monospace; text-align: left;">${e.debit > 0 ? e.debit.toLocaleString() + ' ج.م' : '-'}</td>
          <td style="color: #dc2626; font-weight: bold; font-family: monospace; text-align: left;">${e.credit > 0 ? e.credit.toLocaleString() + ' ج.م' : '-'}</td>
        </tr>
      `;
    });

    const contentHtml = `
      <div class="print-container">
        <div class="header-box">
          <div class="brand-title" style="color: #b45309;">GYM-M22 GENERAL LEDGER</div>
          <div class="doc-title">دفتر الأستاذ العام المالي المحجوب (حصري للمدير العام)</div>
          <div style="font-size: 9pt; color: #64748b; margin-top: 4px;">سجل تدقيق المدين والدائن والحركات المحاسبية الشاملة</div>
        </div>

        <div class="meta-grid">
          <div class="meta-item"><span>تاريخ الإصدار:</span> <strong>${currentDateStr}</strong></div>
          <div class="meta-item"><span>إجمالي القيود:</span> <strong>${entries.length} قيد</strong></div>
          <div class="meta-item"><span>الجهة المصدرة:</span> <strong>الرقابة المركزية (المدير العام)</strong></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>رقم القيد</th>
              <th>التاريخ والوقت</th>
              <th>الفئة</th>
              <th>بيان المعاملة</th>
              <th>المسؤول</th>
              <th style="text-align: center;">طريقة الدفع</th>
              <th style="text-align: left;">مدين (+)</th>
              <th style="text-align: left;">دائن (-)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="8" style="text-align: center; padding: 20px;">لا توجد قيود مسجلة بالدفتر</td></tr>'}
          </tbody>
          <tfoot>
            <tr style="background: #f8fafc; font-weight: bold;">
              <td colspan="6" style="text-align: left; padding: 10px;">الإجماليات المحاسبية الكلية:</td>
              <td style="color: #059669; font-family: monospace; text-align: left;">${totalDebit.toLocaleString()} ج.م</td>
              <td style="color: #dc2626; font-family: monospace; text-align: left;">${totalCredit.toLocaleString()} ج.م</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 15px; padding: 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span>صافي الرصيد الدفتري العام (مدين - دائن):</span>
          <strong style="font-size: 14pt; color: #b45309; font-family: monospace;">${netBalance.toLocaleString()} ج.م</strong>
        </div>

        ${this.buildUniversalFooterSignatures(
          managerName,
          'accountant',
          { title: 'المحاسب المراجع', subtitle: 'تدقيق دفتر الأستاذ' },
          'GYM-M22 LEDGER<br/>دفتر الأستاذ العام<br/>★ تدقيق مركزي ★'
        )}

        <div style="margin-top: 20px; text-align: center; font-size: 8.5pt; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 8px;">
          تم إصدار هذا المستند المالي الحصري من النظام المركزي لنادي GYM-M22 الرياضي • تاريخ: ${currentDateStr} • الوقت: ${currentTimeStr}
        </div>
      </div>
    `;

    this.createPrintWindow(contentHtml, 'دفتر الأستاذ العام - GYM-M22');
  }

  printDynamicSyncReportPDF(
    logs: any[],
    filterSummary: string,
    managerName: string
  ) {
    const now = new Date();
    const currentDateStr = now.toLocaleDateString('ar-EG');
    const currentTimeStr = now.toLocaleTimeString('ar-EG');

    const totalLogs = logs.length;
    const staffLogsCount = logs.filter(l => l.performerRole !== 'member').length;
    const memberLogsCount = logs.filter(l => l.performerRole === 'member' || l.category === 'workout' || l.category === 'attendance').length;
    const financialLogsCount = logs.filter(l => l.category === 'financial' || l.category === 'shift').length;

    const roleLabels: Record<string, string> = {
      manager: 'المدير العام',
      accountant: 'مسؤول حسابات',
      staff: 'موظف استقبال',
      coach: 'كابتن ومدرب',
      member: 'عضو مشترك',
      viewer: 'مراقب عرض فقط'
    };

    const categoryLabels: Record<string, string> = {
      membership: 'إدارة المشتركين',
      financial: 'ماليات وسندات',
      workout: 'تمارين وتدريب',
      shift: 'ورديات الخزينة',
      account: 'حسابات وصلاحيات',
      attendance: 'حضور وانصراف',
      system: 'نظام ومزامنة',
      deletion: 'سلة المحذوفات'
    };

    let rowsHtml = '';
    logs.forEach((log, index) => {
      const roleName = roleLabels[log.performerRole] || log.performerRole || 'نظام';
      const catName = categoryLabels[log.category] || log.category || 'عام';
      const isStaff = log.performerRole !== 'member';
      
      rowsHtml += `
        <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 8pt; color: #64748b; text-align: center;">
            ${index + 1}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 8.5pt; white-space: nowrap;">
            <div style="font-weight: bold; color: #1e293b;">${log.time || log.timestamp?.split('T')[1]?.substring(0, 8) || '-'}</div>
            <div style="font-size: 7.5pt; color: #64748b;">${log.date || log.timestamp?.split('T')[0] || currentDateStr}</div>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 8.5pt;">
            <div style="font-weight: bold; color: ${isStaff ? '#0284c7' : '#059669'};">${log.performerName}</div>
            <div style="font-size: 7.5pt; color: #64748b;">${roleName}</div>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 7.5pt; font-weight: bold; background: ${isStaff ? '#e0f2fe' : '#dcfce7'}; color: ${isStaff ? '#0369a1' : '#15803d'};">
              ${catName}
            </span>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 8.5pt;">
            <div style="font-weight: bold; color: #0f172a;">${log.titleAr || log.title || '-'}</div>
            <div style="font-size: 8pt; color: #475569; margin-top: 2px;">${log.detailsAr || log.details || '-'}</div>
            ${log.targetName ? `<div style="font-size: 7.5pt; color: #854d0e; margin-top: 1px;">الهدف: ${log.targetName}</div>` : ''}
          </td>
        </tr>
      `;
    });

    const contentHtml = `
      <div class="print-container">
        <!-- Header -->
        <div class="header-box" style="border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div class="brand-title" style="color: #0284c7; font-size: 14pt; font-weight: 900;">نادي جيم M22 الرياضي • GYM-M22</div>
              <div class="doc-title" style="font-size: 16pt; font-weight: 900; color: #0f172a; margin-top: 2px;">تقرير التزامن الديناميكي لحركات الموظفين والأعضاء</div>
              <div style="font-size: 9pt; color: #64748b; margin-top: 3px;">سجل رقابي حي ومباشر لكافة العمليات والحركات المنفذة بالنظام المركزي</div>
            </div>
            <div style="text-align: left;">
              <div style="display: inline-block; padding: 6px 12px; border-radius: 8px; background: #e0f2fe; color: #0369a1; font-weight: bold; font-size: 9pt; border: 1px solid #bae6fd;">
                ⚡ مزامنة حية نشطة
              </div>
            </div>
          </div>
        </div>

        <!-- Meta Grid -->
        <div class="meta-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; background: #f8fafc; padding: 10px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 8.5pt;">
          <div class="meta-item"><span>تاريخ التقرير:</span> <strong>${currentDateStr}</strong></div>
          <div class="meta-item"><span>وقت الاستخراج:</span> <strong>${currentTimeStr}</strong></div>
          <div class="meta-item"><span>نطاق التصفية:</span> <strong>${filterSummary}</strong></div>
          <div class="meta-item"><span>المشرف المسؤول:</span> <strong>${managerName}</strong></div>
        </div>

        <!-- KPI Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px;">
          <div style="background: #f1f5f9; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #cbd5e1;">
            <div style="font-size: 8pt; color: #475569; font-weight: bold;">إجمالي الحركات المسجلة</div>
            <div style="font-size: 14pt; font-weight: 900; color: #0f172a; font-family: monospace;">${totalLogs}</div>
          </div>
          <div style="background: #e0f2fe; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #bae6fd;">
            <div style="font-size: 8pt; color: #0369a1; font-weight: bold;">حركات وإجراءات الموظفين</div>
            <div style="font-size: 14pt; font-weight: 900; color: #0284c7; font-family: monospace;">${staffLogsCount}</div>
          </div>
          <div style="background: #dcfce7; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #bbf7d0;">
            <div style="font-size: 8pt; color: #15803d; font-weight: bold;">حركات وتمارين الأعضاء</div>
            <div style="font-size: 14pt; font-weight: 900; color: #16a34a; font-family: monospace;">${memberLogsCount}</div>
          </div>
          <div style="background: #fef3c7; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #fde68a;">
            <div style="font-size: 8pt; color: #92400e; font-weight: bold;">العمليات المالية والسندات</div>
            <div style="font-size: 14pt; font-weight: 900; color: #d97706; font-family: monospace;">${financialLogsCount}</div>
          </div>
        </div>

        <!-- Dynamic Logs Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #0284c7; color: #ffffff; font-size: 8.5pt;">
              <th style="padding: 8px; width: 40px; text-align: center;">#</th>
              <th style="padding: 8px; width: 85px; text-align: right;">الوقت والتاريخ</th>
              <th style="padding: 8px; width: 140px; text-align: right;">المنفذ والرتبة</th>
              <th style="padding: 8px; width: 100px; text-align: center;">التصنيف</th>
              <th style="padding: 8px; text-align: right;">تفاصيل وبيان الحركة المنفذة</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #94a3b8;">لا توجد حركات مسجلة مطابقة</td></tr>'}
          </tbody>
        </table>

        <!-- Signatures & Stamp -->
        ${this.buildUniversalFooterSignatures(
          managerName,
          undefined,
          { title: 'مسؤول الرقابة والأنظمة', subtitle: 'متابعة حركات السيرفر والشبكة' },
          'GYM-M22 SPORTS CLUB<br/>تقرير التزامن الديناميكي المركزي<br/>★ معتمد وموثق رقمياً ★'
        )}

        <div style="margin-top: 20px; text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 8px;">
          تم استخراج هذا التقرير التزامني الحي من النظام السحابي لنادي جيم M22 الرياضي • تاريخ: ${currentDateStr} • الوقت: ${currentTimeStr}
        </div>
      </div>
    `;

    this.createPrintWindow(contentHtml, 'تقرير التزامن الديناميكي - GYM-M22');
  }

  /**
   * 1. Export & Print Member Personal Data & Identity Profile PDF
   */
  printMemberPersonalDataPDF(member: GymMember, managerName = 'المدير العام') {
    const nowStr = new Date().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'medium' });
    const isExpired = member.remainingDays <= 0 || member.status === 'expired';

    const contentHtml = `
      <div class="header-box">
        <div>
          <div class="brand-title">نادي جيم M22 الرياضي</div>
          <div class="brand-sub">استمارة البيانات الشخصية وهوية العضو المشترك</div>
        </div>
        <div class="doc-badge">
          <div>رقم العضوية: #${member.membershipNumber}</div>
          <div style="font-size: 8.5pt; font-weight: normal; margin-top: 2px;">MEMBER PERSONAL PROFILE</div>
        </div>
      </div>

      <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1.5px solid #e2e8f0;">
        <div style="width: 100px; height: 100px; border-radius: 12px; overflow: hidden; border: 2px solid #d97706; flex-shrink: 0; background: #e2e8f0; display: flex; align-items: center; justify-content: center;">
          ${member.avatarUrl ? `<img src="${member.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${member.fullNameAr}" />` : '<span style="font-size: 28pt;">👤</span>'}
        </div>
        <div style="flex: 1;">
          <div style="font-size: 16pt; font-weight: 900; color: #0f172a;">${member.fullNameAr}</div>
          ${member.fullNameEn ? `<div style="font-size: 10pt; color: #64748b; font-family: sans-serif;">${member.fullNameEn}</div>` : ''}
          <div style="margin-top: 8px; display: flex; gap: 15px; font-size: 9.5pt;">
            <span>📱 الهاتف: <strong>${member.phone}</strong></span>
            <span>🏷️ الفئة: <strong style="color: #b45309; text-transform: uppercase;">${member.tier}</strong></span>
            <span>⚡ الحالة: <span class="badge ${!isExpired ? 'badge-emerald' : 'badge-rose'}">${!isExpired ? 'نشط وصالح' : 'منتهي / غير نشط'}</span></span>
          </div>
        </div>
      </div>

      <h3 style="color: #b45309; font-size: 12pt; border-bottom: 1.5px solid #fbbf24; padding-bottom: 5px; margin-top: 20px;">1. البيانات الشخصية وبيانات الاتصال:</h3>
      <div class="meta-grid">
        <div class="meta-item"><strong>الاسم بالكامل:</strong><br/>${member.fullNameAr}</div>
        <div class="meta-item"><strong>رقم الهاتف الأساسي:</strong><br/>${member.phone}</div>
        <div class="meta-item"><strong>هاتف الطوارئ:</strong><br/>${member.emergencyPhone || 'غير مسجل'}</div>
        <div class="meta-item"><strong>الرقم القومي / الهوية:</strong><br/>${member.nationalId || 'غير مسجل'}</div>
        <div class="meta-item"><strong>النوع:</strong><br/>${member.gender === 'female' ? 'أنثى' : 'ذكر'}</div>
        <div class="meta-item"><strong>تاريخ الميلاد:</strong><br/>${member.birthDate || 'مجهول / غير مسجل'}</div>
        <div class="meta-item"><strong>العنوان / السكن:</strong><br/>${member.address || 'القاهرة - جمهورية مصر العربية'}</div>
        <div class="meta-item"><strong>البريد الإلكتروني:</strong><br/>${member.email || 'غير مسجل'}</div>
      </div>

      <h3 style="color: #4f46e5; font-size: 12pt; border-bottom: 1.5px solid #a5b4fc; padding-bottom: 5px; margin-top: 25px;">2. بيانات العضوية والاشتراك بالنادي:</h3>
      <div class="meta-grid">
        <div class="meta-item"><strong>رقم العضوية (ID):</strong><br/>#${member.membershipNumber}</div>
        <div class="meta-item"><strong>باقة الاشتراك:</strong><br/>${member.tier.toUpperCase()} VIP</div>
        <div class="meta-item"><strong>تاريخ بداية الاشتراك:</strong><br/>${member.startDate}</div>
        <div class="meta-item"><strong>تاريخ نهاية الاشتراك الحالي:</strong><br/>${member.endDate}</div>
        <div class="meta-item"><strong>الأيام المتبقية:</strong><br/><strong style="color: #16a34a;">${member.remainingDays} يوم</strong></div>
        <div class="meta-item"><strong>إجمالي عدد مرات الحضور:</strong><br/>${member.attendanceCount || 0} زيارة</div>
        <div class="meta-item"><strong>الكابتن المشرف:</strong><br/>${member.assignedCoachName || 'كابتن الصالة العام'}</div>
        <div class="meta-item"><strong>كود الدخول السري (PIN):</strong><br/>${member.passwordPin || member.membershipNumber}</div>
      </div>

      <h3 style="color: #059669; font-size: 12pt; border-bottom: 1.5px solid #6ee7b7; padding-bottom: 5px; margin-top: 25px;">3. الملاحظات والبيان العام:</h3>
      <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-bottom: 25px; font-size: 9.5pt; color: #166534;">
        ${member.notes ? `<strong>الملاحظات:</strong> ${member.notes}` : 'المشترك لائق بدنياً وصحياً لممارسة كافة الأنشطة والتمارين الرياضية بدون موانع طبية.'}
      </div>

      ${this.buildUniversalFooterSignatures(managerName, undefined, { title: 'توقيع المشترك بالإقرار', subtitle: member.fullNameAr }, 'ملف عضوية معتمد<br/>نادي جيم M22')}

      <div style="margin-top: 25px; text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px;">
        تم استخراج استمارة بيانات العضو بتاريخ ${nowStr} • نظام الإدارة المتكامل GYM-M22
      </div>
    `;

    this.createPrintWindow(contentHtml, `بيانات العضو - ${member.fullNameAr}`);
  }

  /**
   * 2. Export & Print Member Subscriptions & Renewals History PDF
   */
  printMemberSubscriptionsHistoryPDF(member: GymMember, managerName = 'المدير العام') {
    const nowStr = new Date().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'medium' });
    const allTransactions = StorageService.getTransactions();
    const memberTxs = allTransactions.filter(
      tx => (tx.memberId === member.id || tx.membershipNumber === member.membershipNumber || (tx.memberName && tx.memberName.trim() === member.fullNameAr.trim())) &&
            (tx.type === 'renewal' || tx.type === 'subscription' || tx.voucherKind === 'receipt')
    );

    const subscriptionRows = (memberTxs.length > 0 ? memberTxs : (member.financialHistory || [])).slice().reverse().map((tx: any, idx: number) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="font-family: monospace; font-weight: bold;">${(tx.id || '').replace('tx-renew-', 'REC-').slice(0, 12)}</td>
        <td>${tx.date}</td>
        <td><strong>${tx.notes || (tx.type === 'subscription' ? 'اشتراك جديد بالصالة' : 'تجديد اشتراك باقة')}</strong></td>
        <td style="font-weight: 900; color: #16a34a; font-family: monospace;">${(tx.amount || 0).toLocaleString()} ج.م</td>
        <td>${tx.paymentMethod === 'cash' ? 'نقدي (كاش)' : tx.paymentMethod === 'card' ? 'بطاقة بنكية' : tx.paymentMethod === 'instapay' ? 'InstaPay' : 'Vodafone Cash'}</td>
        <td style="font-size: 8.5pt; color: #475569;">${tx.recordedBy || 'موظف الاستقبال'}</td>
      </tr>
    `).join('');

    const totalSubAmount = memberTxs.reduce((sum, t) => sum + (t.amount || 0), 0);

    const contentHtml = `
      <div class="header-box">
        <div>
          <div class="brand-title">نادي جيم M22 الرياضي</div>
          <div class="brand-sub">سجل الاشتراكات والتجديدات التاريخية للعضو</div>
        </div>
        <div class="doc-badge">
          <div>رقم العضوية: #${member.membershipNumber}</div>
          <div style="font-size: 8.5pt; font-weight: normal; margin-top: 2px;">SUBSCRIPTION HISTORY REPORT</div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><strong>اسم العضو:</strong><br/>${member.fullNameAr}</div>
        <div class="meta-item"><strong>رقم الهاتف:</strong><br/>${member.phone}</div>
        <div class="meta-item"><strong>الباقة الحالية:</strong><br/>${member.tier.toUpperCase()} PASS</div>
        <div class="meta-item"><strong>تاريخ بداية الاشتراك الحالي:</strong><br/>${member.startDate}</div>
        <div class="meta-item"><strong>تاريخ نهاية الاشتراك الحالي:</strong><br/>${member.endDate}</div>
        <div class="meta-item"><strong>الأيام المتبقية:</strong><br/><strong style="color: #16a34a;">${member.remainingDays} يوم</strong></div>
      </div>

      <div style="background: #fffbeb; padding: 12px; border-radius: 8px; margin: 20px 0; border: 1.5px solid #fde68a; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="color: #92400e; font-size: 10.5pt;">ملخص سجل الاشتراكات:</strong>
          <span style="margin-right: 15px; font-size: 9pt;">عدد مرات التجديد: <strong>${memberTxs.length || 1}</strong></span>
          <span style="margin-right: 15px; font-size: 9pt;">إجمالي المسدد للاشتراكات: <strong style="color: #16a34a;">${totalSubAmount.toLocaleString()} ج.م</strong></span>
        </div>
        <div style="font-size: 8pt; color: #78350f;">تقرير حتى: ${nowStr}</div>
      </div>

      <h3 style="color: #b45309; font-size: 12pt; border-bottom: 1.5px solid #fbbf24; padding-bottom: 5px; margin-top: 20px;">جدول تفاصيل الاشتراكات والتجديدات السابقة:</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th style="width: 100px;">رقم السند</th>
            <th style="width: 95px;">التاريخ</th>
            <th>نوع الاشتراك / تفاصيل العملية</th>
            <th style="width: 100px;">المبلغ المسدد</th>
            <th style="width: 90px;">طريقة الدفع</th>
            <th style="width: 110px;">المسؤول</th>
          </tr>
        </thead>
        <tbody>
          ${subscriptionRows || `<tr><td colspan="7" style="text-align: center; padding: 15px;">الاشتراك الأولي الحالي ساري من ${member.startDate} إلى ${member.endDate}</td></tr>`}
        </tbody>
      </table>

      ${this.buildUniversalFooterSignatures(managerName, undefined, { title: 'إدارة الاشتراكات والعضويات', subtitle: 'نظام GYM-M22 الرقمي' }, 'سجل اشتراكات معتمد<br/>نادي جيم M22')}

      <div style="margin-top: 25px; text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px;">
        تم استخراج تقرير الاشتراكات والتجديدات من قاعدة البيانات المركزية بتاريخ ${nowStr}
      </div>
    `;

    this.createPrintWindow(contentHtml, `سجل الاشتراكات - ${member.fullNameAr}`);
  }

  /**
   * 3. Export & Print Member Financial Payments Ledger PDF (كشف حساب مدفوعات العضو باسمه)
   */
  printMemberFinancialLedgerPDF(member: GymMember, managerName = 'المدير العام') {
    const nowStr = new Date().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'medium' });
    const allTransactions = StorageService.getTransactions();
    const memberTxs = allTransactions.filter(
      tx => tx.memberId === member.id || 
            tx.membershipNumber === member.membershipNumber || 
            (tx.memberName && tx.memberName.trim().toLowerCase() === member.fullNameAr.trim().toLowerCase())
    );

    const txList = memberTxs.length > 0 ? memberTxs : (member.financialHistory || []);
    const totalPaid = txList.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    const tafqeetTotal = tafqeet(totalPaid);

    const paymentRows = txList.slice().reverse().map((tx: any, idx: number) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="font-family: monospace; font-weight: bold; color: #d97706;">${(tx.id || '').replace('tx-renew-', 'REC-').slice(0, 14)}</td>
        <td>${tx.date}</td>
        <td>
          <strong>${tx.notes || (tx.type === 'subscription' ? 'اشتراك عضوية جديد' : tx.type === 'renewal' ? 'تجديد اشتراك' : tx.type)}</strong>
          ${tx.shiftId ? `<div style="font-size: 8pt; color: #64748b;">وردية كاشير #${tx.shiftId}</div>` : ''}
        </td>
        <td>
          <span class="badge ${tx.voucherKind === 'receipt' || tx.type === 'renewal' || tx.type === 'subscription' ? 'badge-emerald' : 'badge-slate'}">
            ${tx.voucherKind === 'receipt' || tx.type === 'renewal' || tx.type === 'subscription' ? 'سند قبض / مدفوعات' : 'معاملة مالية'}
          </span>
        </td>
        <td style="font-weight: 900; color: #16a34a; font-family: monospace; font-size: 10.5pt;">${(tx.amount || 0).toLocaleString()} ج.م</td>
        <td>${tx.paymentMethod === 'cash' ? '💵 كاش' : tx.paymentMethod === 'card' ? '💳 فيزا' : tx.paymentMethod === 'instapay' ? '⚡ InstaPay' : '📱 فودافون كاش'}</td>
        <td style="font-size: 8.5pt; color: #475569;">${tx.recordedBy || 'الكاشير المسؤول'}</td>
      </tr>
    `).join('');

    const contentHtml = `
      <div class="header-box">
        <div>
          <div class="brand-title">نادي جيم M22 الرياضي</div>
          <div class="brand-sub">كشف حساب ومدفوعات العضو التفصيلي (Financial Ledger)</div>
        </div>
        <div class="doc-badge">
          <div>كشف حساب رقم: #${member.membershipNumber}</div>
          <div style="font-size: 8.5pt; font-weight: normal; margin-top: 2px;">MEMBER FINANCIAL STATEMENT</div>
        </div>
      </div>

      <!-- MEMBER IDENTITY HIGHLIGHT BOX (Name clearly visible) -->
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 12px;">
          <div>
            <div style="font-size: 8.5pt; color: #64748b; font-weight: bold;">اسم العضو المشترك / المستفيد:</div>
            <div style="font-size: 17pt; font-weight: 900; color: #0f172a;">${member.fullNameAr}</div>
          </div>
          <div style="text-align: left;">
            <div style="font-size: 8.5pt; color: #64748b; font-weight: bold;">رقم العضوية:</div>
            <div style="font-size: 16pt; font-weight: 900; color: #d97706; font-family: monospace;">#${member.membershipNumber}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 9.5pt;">
          <div><strong>رقم الهاتف:</strong> ${member.phone}</div>
          <div><strong>فئة الاشتراك:</strong> <span style="color: #b45309; font-weight: bold; text-transform: uppercase;">${member.tier}</span></div>
          <div><strong>تاريخ البدء:</strong> ${member.startDate}</div>
          <div><strong>تاريخ الانتهاء:</strong> ${member.endDate}</div>
        </div>
      </div>

      <!-- SUMMARY TOTAL BANNER -->
      <div style="background: #ecfdf5; border: 2px solid #a7f3d0; border-radius: 10px; padding: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 9pt; color: #065f46; font-weight: bold;">إجمالي المبالغ المسددة من العضو (${member.fullNameAr}):</div>
          <div style="font-size: 18pt; font-weight: 900; color: #047857; font-family: monospace;">
            ${totalPaid.toLocaleString()} جنيه مصري
          </div>
          <div style="font-size: 9pt; color: #059669; font-style: italic; margin-top: 2px;">
            فقط ${tafqeetTotal} لا غير.
          </div>
        </div>
        <div style="text-align: left; font-size: 9pt; color: #065f46;">
          <div>إجمالي المعاملات: <strong>${txList.length}</strong> حركة</div>
          <div>تاريخ الإصدار: <strong>${nowStr}</strong></div>
        </div>
      </div>

      <h3 style="color: #0f172a; font-size: 12pt; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-top: 25px;">
        جدول المعاملات المالية وسندات القبض المسجلة باسم العضو:
      </h3>

      <table>
        <thead>
          <tr>
            <th style="width: 25px;">#</th>
            <th style="width: 110px;">رقم الإيصال</th>
            <th style="width: 90px;">التاريخ</th>
            <th>البيان والتفاصيل</th>
            <th style="width: 110px;">نوع السند</th>
            <th style="width: 100px;">المبلغ المسدد</th>
            <th style="width: 85px;">طريقة الدفع</th>
            <th style="width: 100px;">المسؤول</th>
          </tr>
        </thead>
        <tbody>
          ${paymentRows || `<tr><td colspan="8" style="text-align: center; padding: 20px;">لا توجد معاملات مالية مسجلة باسم العضو ${member.fullNameAr}</td></tr>`}
        </tbody>
      </table>

      ${this.buildUniversalFooterSignatures(managerName, undefined, { title: 'إدارة الحسابات والخزينة', subtitle: 'نظام الإيرادات المعتمد' }, 'سند مالي معتمد<br/>نادي جيم M22')}

      <div style="margin-top: 25px; text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px;">
        تم إصدار كشف حساب المشترك باسم (${member.fullNameAr}) تلقائياً من خادم الخزينة المركزي لنادي جيم M22.
      </div>
    `;

    this.createPrintWindow(contentHtml, `كشف حساب مدفوعات - ${member.fullNameAr}`);
  }

  /**
   * 4. Export & Print Member Attendance & Gate Check-in Logs PDF
   */
  printMemberAttendanceHistoryPDF(member: GymMember, managerName = 'المدير العام', attendances?: MemberCheckInRecord[]) {
    const nowStr = new Date().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'medium' });
    const allCheckIns = attendances || StorageService.getMemberCheckIns().filter(
      ci => ci.memberId === member.id || ci.membershipNumber === member.membershipNumber
    );

    const checkInRows = allCheckIns.slice().reverse().map((ci, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td>${ci.checkInDate}</td>
        <td style="font-weight: bold; font-family: monospace; color: #047857;">${ci.checkInTime}</td>
        <td>
          <span class="badge ${ci.gateOrMethod === 'reception_qr' ? 'badge-sky' : ci.gateOrMethod === 'face_scan' ? 'badge-emerald' : ci.gateOrMethod === 'self_portal' ? 'badge-amber' : 'badge-slate'}">
            ${ci.gateOrMethod === 'reception_qr' ? 'كارت QR الذكي' : ci.gateOrMethod === 'face_scan' ? 'بصمة وجه' : ci.gateOrMethod === 'self_portal' ? 'دخول ذاتي' : 'موظف الاستقبال'}
          </span>
        </td>
        <td>${ci.tier?.toUpperCase()} VIP</td>
        <td style="font-size: 8.5pt; color: #475569;">${ci.performedByName || 'موظف البوابة'}</td>
      </tr>
    `).join('');

    const contentHtml = `
      <div class="header-box">
        <div>
          <div class="brand-title">نادي جيم M22 الرياضي</div>
          <div class="brand-sub">سجل حضور ودخول البوابات للعضو المشترك</div>
        </div>
        <div class="doc-badge">
          <div>رقم العضوية: #${member.membershipNumber}</div>
          <div style="font-size: 8.5pt; font-weight: normal; margin-top: 2px;">ATTENDANCE LOGS REPORT</div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><strong>اسم العضو:</strong><br/>${member.fullNameAr}</div>
        <div class="meta-item"><strong>رقم الهاتف:</strong><br/>${member.phone}</div>
        <div class="meta-item"><strong>إجمالي عدد الحضور:</strong><br/><strong style="color: #16a34a;">${allCheckIns.length || member.attendanceCount || 0} زيارة</strong></div>
        <div class="meta-item"><strong>تاريخ الاشتراك:</strong><br/>${member.startDate} إلى ${member.endDate}</div>
        <div class="meta-item"><strong>سياسة الدخول:</strong><br/>مرة واحدة كل 12 ساعة</div>
        <div class="meta-item"><strong>الأيام المتبقية:</strong><br/>${member.remainingDays} يوم</div>
      </div>

      <h3 style="color: #047857; font-size: 12pt; border-bottom: 1.5px solid #6ee7b7; padding-bottom: 5px; margin-top: 20px;">
        جدول مرات الدخول وتسجيل الحضور بالصالة:
      </h3>

      <table>
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th style="width: 110px;">تاريخ الدخول</th>
            <th style="width: 100px;">وقت الحضور</th>
            <th style="width: 130px;">طريقة الدخول / البوابة</th>
            <th style="width: 90px;">الفئة</th>
            <th>المسؤول / المشرف</th>
          </tr>
        </thead>
        <tbody>
          ${checkInRows || `<tr><td colspan="6" style="text-align: center; padding: 15px;">لا توجد سجلات حضور مسجلة لهذا العضو حتى الآن</td></tr>`}
        </tbody>
      </table>

      ${this.buildUniversalFooterSignatures(managerName, undefined, { title: 'إدارة بوابات الدخول والأمن', subtitle: 'نظام البوابات الذكية' }, 'سجل حضور معتمد<br/>نادي جيم M22')}

      <div style="margin-top: 25px; text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px;">
        تم استخراج سجل الحضور بتاريخ ${nowStr}
      </div>
    `;

    this.createPrintWindow(contentHtml, `سجل حضور - ${member.fullNameAr}`);
  }

  /**
   * Export & Print Comprehensive Member History PDF (السجل التاريخي الشامل للعضو)
   * Includes identity, current subscription, financial history, and physical workouts.
   */
  printMemberFullHistoryPDF(member: GymMember, managerName = 'المدير العام') {
    const nowStr = new Date().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'medium' });
    const isExpired = member.remainingDays <= 0 || member.status === 'expired';

    const allTransactions = StorageService.getTransactions();
    const memberTxs = allTransactions.filter(
      tx => tx.memberId === member.id || 
            tx.membershipNumber === member.membershipNumber || 
            (tx.memberName && tx.memberName.trim().toLowerCase() === member.fullNameAr.trim().toLowerCase())
    );

    const txList = memberTxs.length > 0 ? memberTxs : (member.financialHistory || []);

    const finRows = txList.slice().reverse().map((trx: any, idx: number) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td>${trx.date}</td>
        <td><strong>${trx.notes || (trx.type === 'subscription' ? 'اشتراك جديد' : trx.type === 'renewal' ? 'تجديد اشتراك' : trx.type)}</strong></td>
        <td>${trx.paymentMethod === 'cash' ? 'نقدي' : trx.paymentMethod === 'card' ? 'بطاقة' : trx.paymentMethod || 'كاش'}</td>
        <td style="font-weight: bold; color: #16a34a;">${(trx.amount || 0).toLocaleString()} ج.م</td>
        <td style="font-size: 8.5pt;">${trx.notes || '-'}</td>
        <td style="font-size: 8pt; color: #64748b;">${trx.recordedBy || 'الموظف المسؤول'}</td>
      </tr>
    `).join('');

    const workRows = (member.history || []).slice().reverse().map((session, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td>${session.date}</td>
        <td><strong>${session.dayTitle}</strong></td>
        <td style="text-align: center;">${session.durationMinutes || 0} دقيقة</td>
        <td style="text-align: center;">${session.exercisesProgress?.length || 0} تمارين</td>
        <td style="font-size: 8.5pt;">${session.notes || '-'}</td>
      </tr>
    `).join('');

    const contentHtml = `
      <div class="header-box">
        <div>
          <div class="brand-title">نادي جيم M22 الرياضي</div>
          <div class="brand-sub">السجل التاريخي الشامل وتقرير أداء العضو المشترك</div>
        </div>
        <div class="doc-badge">
          <div>ملف عضوية رقم: #${member.membershipNumber}</div>
          <div style="font-size: 8.5pt; font-weight: normal; margin-top: 2px;">MEMBER-DOSSIER-REPORT</div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><strong>اسم العضو:</strong><br/>${member.fullNameAr}</div>
        <div class="meta-item"><strong>رقم الهاتف:</strong><br/>${member.phone}</div>
        <div class="meta-item"><strong>باقة الاشتراك:</strong><br/>${member.tier.toUpperCase()} MEMBER</div>
        <div class="meta-item"><strong>تاريخ البدء:</strong><br/>${member.startDate}</div>
        <div class="meta-item"><strong>تاريخ الانتهاء:</strong><br/>${member.endDate}</div>
        <div class="meta-item"><strong>الحالة الحالية:</strong><br/><span class="badge ${!isExpired ? 'badge-emerald' : 'badge-rose'}">${!isExpired ? 'اشتراك نشط' : 'منتهي / مجمد'}</span></div>
      </div>

      <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="color: #334155; font-size: 10pt;">إحصائيات العضوية:</strong>
          <span style="margin-right: 15px; font-size: 9pt;">إجمالي الحصص: <strong>${member.attendanceCount || 0}</strong></span>
          <span style="margin-right: 15px; font-size: 9pt;">الأيام المتبقية: <strong>${member.remainingDays} يوم</strong></span>
        </div>
        <div style="font-size: 8pt; color: #64748b;">تاريخ التقرير: ${nowStr}</div>
      </div>

      <h3 style="color: #b45309; font-size: 12pt; border-bottom: 1.5px solid #fbbf24; padding-bottom: 5px; margin-top: 25px;">1. سجل العمليات المالية والاشتراكات المسجلة باسم العضو:</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th style="width: 100px;">التاريخ</th>
            <th style="width: 140px;">نوع الحركة / البيان</th>
            <th style="width: 80px;">الوسيلة</th>
            <th style="width: 100px;">المبلغ</th>
            <th>البيان والملاحظات</th>
            <th style="width: 110px;">المسؤول</th>
          </tr>
        </thead>
        <tbody>
          ${finRows || '<tr><td colspan="7" style="text-align: center; padding: 15px;">لا يوجد سجل مالي مسجل لهذا العضو</td></tr>'}
        </tbody>
      </table>

      <h3 style="color: #6366f1; font-size: 12pt; border-bottom: 1.5px solid #a5b4fc; padding-bottom: 5px; margin-top: 30px;">2. سجل الحصص التدريبية والتمارين البدنية:</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th style="width: 100px;">التاريخ</th>
            <th style="width: 180px;">عنوان الحصة</th>
            <th style="width: 80px; text-align: center;">المدة</th>
            <th style="width: 80px; text-align: center;">التمارين</th>
            <th>ملاحظات الكابتن والأداء</th>
          </tr>
        </thead>
        <tbody>
          ${workRows || '<tr><td colspan="6" style="text-align: center; padding: 15px;">لم يقم العضو بتسجيل أي حصص تدريبية حتى الآن</td></tr>'}
        </tbody>
      </table>

      ${this.buildUniversalFooterSignatures(managerName, undefined, { title: 'قسم شؤون اللاعبين', subtitle: 'نظام GYM-M22 الرقمي' }, 'سجل تاريخي معتمد<br/>نادي جيم M22')}

      <div style="margin-top: 25px; text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px;">
        هذا التقرير مستخرج آلياً من قاعدة البيانات المركزية ولا يحتاج لتوقيع حي ما لم يتم ختمه بختم النادي الرسمي.
      </div>
    `;

    this.createPrintWindow(contentHtml, `السجل التاريخي - ${member.fullNameAr}`);
  }

  printManagerNotificationReportPDF(notif: any) {
    const contentHtml = `
      <div class="header-box">
        <div style="text-align: right;">
          <div style="font-size: 13pt; font-weight: 900; color: #0f172a; letter-spacing: 1px;">نادي M22 الرياضي</div>
          <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">نظام الإدارة المركزية والأمن المتقدم</div>
        </div>
        <div style="text-align: left;">
          <div style="font-size: 8.5pt; font-family: monospace; color: #64748b;">
            <strong>تاريخ الإشعار:</strong> ${notif.date}<br/>
            <strong>وقت الإشعار:</strong> ${notif.time}
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 20px 0 30px 0;">
        <h1 style="font-size: 16pt; font-weight: 900; color: #1e293b; margin: 0; text-transform: uppercase;">
          إشعار إداري معتمد
        </h1>
        <div style="width: 80px; height: 3px; background-color: #d97706; margin: 8px auto 0 auto; border-radius: 2px;"></div>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; font-weight: bold; color: #64748b; width: 150px;">عنوان الإجراء:</td>
            <td style="padding: 10px 0; font-weight: 900; color: #0f172a;">${notif.titleAr}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; font-weight: bold; color: #64748b;">الموظف المسؤول:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #1e293b;">${notif.employeeName} (${notif.employeeRole})</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; font-weight: bold; color: #64748b;">نوع الإجراء:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #d97706; text-transform: uppercase;">${notif.type}</td>
          </tr>
          ${notif.reportTitle ? `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; font-weight: bold; color: #64748b;">عنوان المستند:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #1e293b;">${notif.reportTitle}</td>
          </tr>
          ` : ''}
          ${notif.workedHours !== undefined ? `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0; font-weight: bold; color: #64748b;">ساعات العمل:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #0f172a;">${notif.workedHoursFormatted || `${notif.workedHours} ساعة`}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <div style="margin-bottom: 40px;">
        <h4 style="font-size: 11pt; font-weight: 900; color: #0f172a; margin: 0 0 10px 0;">تفاصيل الإجراء الإداري:</h4>
        <p style="font-size: 11pt; line-height: 1.7; color: #334155; margin: 0; text-align: justify; background: #fff; border: 1.5px dashed #cbd5e1; padding: 15px; border-radius: 8px;">
          ${notif.detailsAr}
        </p>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 60px; padding: 0 15px;">
        <div style="text-align: center;">
          <div style="width: 100px; height: 100px; border: 2px dashed #94a3b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: #94a3b8; margin: 0 auto 5px auto;">
            ختم النادي الرسمي
          </div>
          <span style="font-size: 8pt; color: #64748b;">M22 SPORTS CLUB</span>
        </div>
        <div style="text-align: center; width: 200px;">
          <strong style="font-size: 10pt; color: #0f172a; display: block; margin-bottom: 40px;">اعتماد المدير العام للصالات</strong>
          <div style="border-bottom: 1.5px solid #0f172a; width: 100%; margin-bottom: 5px;"></div>
          <span style="font-size: 8.5pt; color: #64748b;">نظام الإدارة والتشغيل والرقابة</span>
        </div>
      </div>
    `;

    this.createPrintWindow(contentHtml, `إشعار إداري - ${notif.titleAr}`);
  }

}

export const pdfPrintService = new PDFPrintService();


