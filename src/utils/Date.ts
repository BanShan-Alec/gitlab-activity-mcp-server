/**
 * 原生JavaScript日期格式化函数
 * 替代date-fns依赖
 */
export function formatDate(date: Date, pattern: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  // 获取中文星期
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[date.getDay()];

  return pattern
    .replace(/yyyy/g, String(year))
    .replace(/MM/g, month)
    .replace(/dd/g, day)
    .replace(/HH/g, hour)
    .replace(/mm/g, minute)
    .replace(/ss/g, second)
    .replace(/\(E\)/g, `(周${weekday})`)
    .replace(/yyyy年MM月dd日/g, `${year}年${month}月${day}日`)
    .replace(/MM月dd日/g, `${month}月${day}日`);
}
