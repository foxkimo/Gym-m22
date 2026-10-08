/**
 * Tafqeet Utility for Arabic Currency Speller (تحويل الأرقام إلى نصوص باللغة العربية لسندات القبض والصرف)
 */

export function tafqeet(amount: number): string {
  if (amount === 0) return 'فقط صفر جنيه مصري لا غير';
  if (!amount || isNaN(amount)) return '';

  const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  function convertGroup(n: number): string {
    let result = '';
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (h > 0) {
      result += hundreds[h];
    }

    if (t === 1) {
      if (result) result += ' و';
      result += teens[u];
    } else {
      if (u > 0) {
        if (result) result += ' و';
        result += units[u];
      }
      if (t > 1) {
        if (result) result += ' و';
        result += tens[t];
      }
    }

    return result;
  }

  const intPart = Math.floor(Math.abs(amount));
  const decPart = Math.round((Math.abs(amount) - intPart) * 100);

  let text = '';

  const millions = Math.floor(intPart / 1000000);
  const thousands = Math.floor((intPart % 1000000) / 1000);
  const remainder = intPart % 1000;

  if (millions > 0) {
    if (millions === 1) text += 'مليون';
    else if (millions === 2) text += 'مليونان';
    else if (millions >= 3 && millions <= 10) text += `${convertGroup(millions)} ملايين`;
    else text += `${convertGroup(millions)} مليون`;
  }

  if (thousands > 0) {
    if (text) text += ' و';
    if (thousands === 1) text += 'ألف';
    else if (thousands === 2) text += 'ألفان';
    else if (thousands >= 3 && thousands <= 10) text += `${convertGroup(thousands)} آلاف`;
    else text += `${convertGroup(thousands)} ألف`;
  }

  if (remainder > 0) {
    if (text) text += ' و';
    text += convertGroup(remainder);
  }

  let fullStr = `فقط ${text} جنيه مصري`;
  if (decPart > 0) {
    fullStr += ` و${convertGroup(decPart)} قرشاً`;
  }
  fullStr += ' لا غير';

  return fullStr;
}
