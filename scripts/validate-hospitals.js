// ========== 医院数据完整性校验脚本（零依赖，node scripts/validate-hospitals.js）==========
// 校验 23 家上海三甲医院数据的字段完整性、分类计数、hot 名单、地址清单与派生往返一致性。
// 注意：deriveAddress / parseAddress 与 store.js 中的实现保持同步（双份同源）。

const HospitalData = require('../src/scripts/data-hospitals.js');

// ---- 与 store.js 同源的派生函数（修改时保持同步）----
function deriveAddress(branches) {
  if (!Array.isArray(branches)) return '';
  return branches.map((b, i) => {
    const name = String(b.name || '').trim();
    const addr = String(b.address || '').trim();
    if (i === 0) {
      const suffix = name.startsWith('总院（') && name.endsWith('）') ? name.slice(3, -1) : '';
      return '总院：' + addr + (suffix ? '（' + suffix + '）' : '');
    }
    return '分院：' + addr + (name ? '（' + name + '）' : '');
  }).join('；');
}
function parseAddress(str) {
  return String(str || '').split(/[;；]/).map(s => s.trim()).filter(Boolean).map((seg) => {
    const m = seg.match(/^(总院|分院)：(.+)$/);
    if (!m) return null;
    let address = m[2].trim();
    let name = m[1];
    const pm = address.match(/^(.+?)（(.+)）$/);
    if (pm) { address = pm[1].trim(); name = name === '总院' ? '总院（' + pm[2] + '）' : pm[2]; }
    return { name, address };
  }).filter(Boolean);
}

// ---- 断言收集 ----
const errors = [];
const warnings = [];
let checks = 0;
function check(group, cond, msg) {
  checks += 1;
  if (!cond) errors.push(`[${group}] ${msg}`);
}
function byId(id) { return HospitalData.find(h => h.id === id); }

// 1. 总数与 id 唯一
check('1-总数与ID', HospitalData.length === 23, `医院总数应为 23，实际 ${HospitalData.length}`);
check('1-总数与ID', new Set(HospitalData.map(h => h.id)).size === HospitalData.length, '存在重复 id');

// 2. 分类计数
const catCount = {};
HospitalData.forEach(h => { catCount[h.category] = (catCount[h.category] || 0) + 1; });
check('2-分类计数', catCount['综合医院'] === 10, `综合医院应为 10，实际 ${catCount['综合医院']}`);
check('2-分类计数', catCount['专科医院'] === 9, `专科医院应为 9，实际 ${catCount['专科医院']}`);
check('2-分类计数', catCount['中医医院'] === 4, `中医医院应为 4，实际 ${catCount['中医医院']}`);

// 3. hot 名单（8 家，顺序即首页展示顺序，三类均有覆盖）
const hotList = HospitalData.filter(h => h.hot).map(h => h.shortName);
const expectHot = ['中山医院', '瑞金医院', '华山医院', '仁济医院', '九院', '新华医院', '肿瘤医院', '龙华医院'];
check('3-hot名单', JSON.stringify(hotList) === JSON.stringify(expectHot), `hot 名单应为 [${expectHot.join(',')}]，实际 [${hotList.join(',')}]`);
const hotCats = new Set(HospitalData.filter(h => h.hot).map(h => h.category));
check('3-hot名单', hotCats.size === 3, `hot 应覆盖综合/专科/中医三类，实际覆盖 [${[...hotCats].join(',')}]`);

// 4. 字段完整性
HospitalData.forEach(h => {
  ['id', 'name', 'shortName', 'phone', 'level', 'category', 'city', 'intro', 'advantage', 'keyDepts', 'orders', 'hot', 'image', 'source', 'branches'].forEach(k => {
    check(`4-字段完整性:${h.id}`, h[k] !== undefined && h[k] !== null, `缺少字段 ${k}`);
  });
  check(`4-字段完整性:${h.id}`, String(h.intro || '').trim().length > 0, 'intro 为空');
  const introLen = String(h.intro || '').replace(/\s/g, '').length;
  check(`4-字段完整性:${h.id}`, introLen <= 100, `intro 应 ≤100 字，实际 ${introLen}`);
  if (introLen > 90) warnings.push(`${h.id} intro ${introLen} 字（接近上限）`);
  check(`4-字段完整性:${h.id}`, String(h.advantage || '').trim().length > 0, 'advantage 为空');
  check(`4-字段完整性:${h.id}`, /^021-\d{3,4}-\d{4}$/.test(h.phone || ''), `phone 格式异常：${h.phone}`);
  check(`4-字段完整性:${h.id}`, Number.isFinite(h.orders) && h.orders > 0, 'orders 非法');
});

// 5. keyDepts
HospitalData.forEach(h => {
  const d = h.keyDepts || [];
  check(`5-重点科室:${h.id}`, d.length >= 3, `keyDepts 应 ≥3 项，实际 ${d.length}`);
  check(`5-重点科室:${h.id}`, d.every(x => String(x).trim().length > 0), 'keyDepts 存在空项');
  check(`5-重点科室:${h.id}`, new Set(d).size === d.length, 'keyDepts 存在重复项');
});

// 6. branches 结构
HospitalData.forEach(h => {
  const b = h.branches || [];
  check(`6-分支地址:${h.id}`, b.length >= 1, 'branches 为空');
  check(`6-分支地址:${h.id}`, /^总院(（.+）)?$/.test(b[0]?.name || ''), `branches[0].name 应为总院，实际 "${b[0]?.name}"`);
  b.forEach((x, i) => {
    check(`6-分支地址:${h.id}`, String(x.name || '').trim().length > 0, `第${i + 1}项 name 为空`);
    const addr = String(x.address || '').trim();
    check(`6-分支地址:${h.id}`, addr.length > 0, `第${i + 1}项 address 为空`);
    check(`6-分支地址:${h.id}`, !/总院：|分院：|[；;（）]/.test(addr), `第${i + 1}项 address 含前缀/括号/分隔符：${addr}`);
  });
});

// 7. source
HospitalData.forEach(h => {
  check(`7-数据来源:${h.id}`, String(h.source?.info || '').trim().length > 0, 'source.info 为空');
  check(`7-数据来源:${h.id}`, /^\d{4}-\d{2}$/.test(h.source?.updated || ''), `source.updated 格式异常：${h.source?.updated}`);
});

// 8. 图片字段（本地路径 images/hospitals/H{id}.jpg + fallback 外链）
HospitalData.forEach(h => {
  const img = String(h.image || '').trim();
  const isLocal = /^images\/hospitals\/H\d{2}\.jpg$/.test(img);
  check(`8-图片:${h.id}`, isLocal, `image 应为 images/hospitals/H{id}.jpg 本地路径，实际：${img}`);
  if (isLocal) {
    check(`8-图片:${h.id}`, /^https?:\/\//.test(String(h.imageFallback || '').trim()), '本地路径必须有 imageFallback URL');
    check(`8-图片:${h.id}`, img === `images/hospitals/${h.id}.jpg`, `image 路径与 id 不一致：${img}`);
  }
});

// 9. 23 家 name 集合与用户权威清单精确匹配
const expectedNames = [
  '复旦大学附属中山医院', '上海交通大学医学院附属瑞金医院', '复旦大学附属华山医院',
  '上海交通大学医学院附属仁济医院', '上海交通大学医学院附属第九人民医院', '上海市第一人民医院',
  '上海市第六人民医院', '上海市第十人民医院', '上海交通大学医学院附属新华医院', '上海市同济医院',
  '复旦大学附属肿瘤医院', '上海市胸科医院', '上海市肺科医院', '上海市精神卫生中心',
  '上海市第一妇婴保健院', '中国福利会国际和平妇幼保健院', '上海市儿童医院', '复旦大学附属儿科医院',
  '复旦大学附属眼耳鼻喉科医院', '上海中医药大学附属龙华医院', '上海中医药大学附属曙光医院',
  '上海中医药大学附属岳阳中西医结合医院', '上海市中医医院',
];
const actualNames = HospitalData.map(h => h.name).sort();
check('9-权威清单', JSON.stringify(actualNames) === JSON.stringify([...expectedNames].sort()),
  `医院名单与权威清单不一致：缺少 ${expectedNames.filter(n => !HospitalData.some(h => h.name === n)).join('、') || '无'}，多余 ${HospitalData.filter(h => !expectedNames.includes(h.name)).map(h => h.name).join('、') || '无'}`);

// 10. 地址专项（用户拍板修正项）
const rj = byId('H04');
check('10-地址专项:仁济', !(rj?.branches || []).some(b => b.name.includes('崇明')), '仁济不应有崇明分院');
check('10-地址专项:仁济', (rj?.branches || []).length === 2, `仁济应 2 个分支（总院/西院），实际 ${rj?.branches?.length}`);
const xk = byId('H12');
check('10-地址专项:胸科', (xk?.branches || []).length === 1, `胸科应仅总院，实际 ${xk?.branches?.length} 个分支`);
const fk = byId('H13');
check('10-地址专项:肺科', (fk?.branches || []).some(b => b.name === '松江南院' && b.address === '松江区广富林路758号'), '肺科应有松江南院（广富林路758号）');
check('10-地址专项:肺科', (fk?.branches || []).some(b => b.name === '宝山分院' && b.address === '宝山区盘古路2188号'), '肺科宝山分院应为盘古路2188号');
const sy = byId('H08');
check('10-地址专项:十院', (sy?.branches || []).length === 1, `十院应仅总院，实际 ${sy?.branches?.length} 个分支`);

// 11. 派生往返一致性
HospitalData.forEach(h => {
  const round = parseAddress(deriveAddress(h.branches));
  const same = round.length === h.branches.length && round.every((x, i) => x.name === h.branches[i].name && x.address === h.branches[i].address);
  check(`11-派生往返:${h.id}`, same, `往返不一致：${deriveAddress(h.branches)}`);
});

// 12. 跨院地址唯一性
const seen = {};
HospitalData.forEach(h => (h.branches || []).forEach(b => {
  const key = b.address;
  if (seen[key]) check('12-地址唯一', false, `地址重复：${key}（${seen[key]} 与 ${h.shortName}）`);
  else seen[key] = h.shortName;
}));

// ---- 14. 复核统计报告（读取数据源文件中的"待人工复核/待补充"注释，零依赖）----
const fs = require('fs');
const path = require('path');
const srcText = fs.readFileSync(path.join(__dirname, '../src/scripts/data-hospitals.js'), 'utf8');
const marks = [];
const markRe = /\/\/\s*(待人工复核|待补充)[：:]([^\n]*)/g;
let mm;
while ((mm = markRe.exec(srcText)) !== null) {
  const before = srcText.slice(0, mm.index);
  const ids = [...before.matchAll(/id: '(H\d{2})'/g)];
  marks.push({ id: ids.length ? ids[ids.length - 1][1] : '?', type: mm[1], note: mm[2].trim() });
}

// ---- 汇总 ----
console.log(`校验完成：${checks} 项断言，${errors.length} 项失败`);
if (errors.length) {
  errors.forEach(e => console.log('  ✗ ' + e));
  process.exitCode = 1;
} else {
  console.log('  ✓ 全部通过');
}
if (warnings.length) warnings.forEach(w => console.log('  ⚠ ' + w));
console.log(`复核标记 ${marks.length} 处：`);
marks.forEach(x => console.log(`  · ${x.id} [${x.type}] ${x.note}`));
