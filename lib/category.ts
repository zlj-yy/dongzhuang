/**
 * function_category 的「用户显示」映射。
 *
 * 数据库原始值保持不变（严禁修改数据库），这里只在展示层做合并/改写。
 * 例如 DB 里同时存在「保湿剂」和「保湿」两个原始值，用户层面统一显示为「保湿」。
 */
export function displayCategory(raw: string): string {
  if (raw === "保湿剂" || raw === "保湿") return "保湿";
  return raw;
}
