#!/usr/bin/env node
/**
 * 护无忧 · 零依赖回归测试
 * 运行：node scripts/smoke-test.js
 *
 * 覆盖范围：
 *  1) 数据层：CareStore v2→v3 增量迁移不丢数据、旧键 huwuyou_patients 合并
 *  2) CRUD 与守卫：患者 / 就诊档案 / 医院 / 服务项 / 陪诊师（软删除 + 进行中订单守卫）
 *  3) 双向填写档案与复查到期提醒（去重、逾期、已复查）
 *  4) 后台功能：咨询电话配置、医院图片上传、服务收费新增/停用
 *  5) 患者端 UI：电话咨询入口、意向陪诊师、我的档案、首页视觉与数据条
 *  6) 业务不变量：新建订单为"待处理"且不携带已分配陪诊师
 *
 * 实现方式：用 DOM 桩在 Node 中按 index.html 相同顺序加载全部前端脚本（零 npm 依赖）。
 */
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src', 'scripts');
const SCRIPTS = [
  'data-hospitals.js', 'data.js', 'store.js', 'app.js', 'patient.js', 'hospital-ui.js', 'admin.js', 'workflow.js',
];

let total = 0;
let failed = 0;
function assert(cond, msg) {
  total += 1;
  if (cond) { console.log('  \u2713 ' + msg); return; }
  failed += 1;
  console.error('  \u2717 ' + msg);
}

// DOM 桩元素工厂：设置 id 时自动登记，使 createElement 出来的节点也可被 getElementById 取到
// （WUtil.confirm 等组件走 createElement + mask.id 的写法，需要这一行为才可被断言与驱动）
let EL_REGISTRY = {};
function makeEl() {
  const el = {
    innerHTML: '', textContent: '', value: '', hidden: false, dataset: {}, style: {}, className: '',
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, removeEventListener() {}, appendChild() {}, insertAdjacentHTML() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    setAttribute() {}, getAttribute() { return null; }, focus() {}, click() {},
    remove() { if (this._id && EL_REGISTRY[this._id] === this) delete EL_REGISTRY[this._id]; },
    scrollHeight: 0, scrollTop: 0, offsetWidth: 100, files: [], checked: false, disabled: false,
  };
  let _id = '';
  Object.defineProperty(el, 'id', {
    get() { return _id; },
    set(v) { _id = String(v || ''); if (_id) EL_REGISTRY[_id] = el; },
    enumerable: true,
  });
  return el;
}

// 每个阶段独立启动一个"浏览器环境"（独立 localStorage / DOM），避免阶段间状态串扰
function boot() {
  const elements = {};
  EL_REGISTRY = elements;
  const mem = {};
  const sandbox = {
    console, setTimeout, clearTimeout, Date, Math, JSON, Number, String, Object, Array, Boolean,
    isNaN, parseInt, parseFloat, RegExp, Error,
    confirm: () => true,
    prompt: () => null,
  };
  // 定时器桩：轮播用 setInterval，若用真实实现会让 Node 进程无法退出（且测试需要确定性）
  const intervals = new Map();
  let intervalSeq = 0;
  sandbox.setInterval = fn => { intervalSeq += 1; intervals.set(intervalSeq, fn); return intervalSeq; };
  sandbox.clearInterval = id => { intervals.delete(id); };
  sandbox.window = sandbox;
  sandbox.localStorage = {
    getItem: k => (k in mem ? mem[k] : null),
    setItem: (k, v) => { mem[k] = String(v); },
    removeItem: k => { delete mem[k]; },
  };
  sandbox.document = {
    getElementById: id => (elements[id] ||= makeEl()),
    createElement: () => makeEl(),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    body: makeEl(), head: makeEl(), documentElement: makeEl(),
  };
  const ctx = vm.createContext(sandbox);
  for (const f of SCRIPTS) {
    vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), ctx, { filename: f });
  }
  const get = name => vm.runInContext(name, ctx);
  return {
    ctx, elements, mem, get, sandbox,
    CareStore: get('CareStore'), PriceTable: get('PriceTable'), App: get('App'),
    Patient: get('Patient'), Admin: get('Admin'), HospitalUI: get('HospitalUI'), MockData: get('MockData'),
    MediaService: get('MediaService'), RECHECK_REMIND_DAYS: get('RECHECK_REMIND_DAYS'),
    HOSPITAL_IMAGE_PROFILE: get('HOSPITAL_IMAGE_PROFILE'),
    rootHTML: () => sandbox.document.getElementById('root').innerHTML,
    screenEl: () => sandbox.document.getElementById('screen'),
    screenHTML: () => sandbox.document.getElementById('screen').innerHTML,
    modalHTML: () => sandbox.document.getElementById('_modalBody').innerHTML,
    field: (id, value) => { const el = sandbox.document.getElementById(id); if (value !== undefined) el.value = value; return el; },
    // 二次确认弹窗驱动：确认 / 取消 / 读取弹窗内容
    confirmHTML: () => (elements['confirmDialog'] ? elements['confirmDialog'].innerHTML : ''),
    confirmOk: () => { const b = sandbox.document.getElementById('confirmOk'); if (b && typeof b.onclick === 'function') b.onclick(); },
    confirmCancel: () => { const b = sandbox.document.getElementById('confirmCancel'); if (b && typeof b.onclick === 'function') b.onclick(); },
    confirmOpen: () => !!elements['confirmDialog'] && !!elements['confirmDialog'].innerHTML,
  };
}

// ============================================================
// 阶段一：数据层（迁移 / CRUD / 守卫 / 双向档案 / 复查提醒）
// ============================================================
function phaseData() {
  console.log('\n【阶段一】数据层：迁移、CRUD 守卫、双向档案、复查提醒');
  const env = boot();
  const { CareStore, PriceTable, MockData, RECHECK_REMIND_DAYS } = env;

  // --- 构造 v2 旧数据 ---
  const s0 = CareStore.state;
  s0.prices[0].price = 399;
  s0.escorts.push({ id: 'E99', name: '自定义陪诊师', phone: '138-0000-9999', tags: ['骨科'], star: 4.5, orders: 3, status: '空闲' });
  s0.hospitals.find(h => h.id === 'H01').intro = '管理员改写的简介';
  delete s0.settings; delete s0.patients; delete s0.archives;
  s0.version = 2;
  CareStore.save();
  assert(JSON.parse(env.mem['huwuyou_store_v1']).version === 2, '已构造 v2 旧数据（version=2）');
  env.mem['huwuyou_patients'] = JSON.stringify([{ name: '测试就诊人', gender: '男', age: 60, phone: '138 0000 0000', medicalHistory: '高血压', relation: '父亲', images: ['CT片'] }]);

  // --- 迁移 ---
  CareStore.init();
  const st = CareStore.state;
  assert(st.version === 3, '版本升级到 v3');
  assert(st.prices.find(p => p.name === '半程陪诊').price === 399, '管理员改价在迁移后保留');
  assert(st.hospitals.find(h => h.id === 'H01').intro === '管理员改写的简介', '管理员改写的医院资料保留');
  assert(st.hospitals.length === 23, '23 家医院全部保留');
  assert(st.escorts.some(e => e.id === 'E99') && st.escorts.length === 6, '管理员新增陪诊师保留且种子补齐');
  assert(!!st.settings && st.settings.consultPhone === '400-800-1234', '新增表 settings 补齐默认值');
  assert(st.patients.length === 6, '新增表 patients = 演示患者 + 4 位档案 + 1 位迁移就诊人');
  assert(st.patients.some(p => p.name === '测试就诊人' && p.source === 'patient'), '旧键 huwuyou_patients 已并入 state.patients');
  assert(!!env.mem['huwuyou_patients'], '旧键保留作备份（未删除）');
  assert(st.archives.length === 2 && st.archives.every(a => a.active !== false), '新增表 archives 补齐且带 active 标记');

  // --- 患者 CRUD ---
  const p = CareStore.addPatient({ name: '新增患者甲', gender: '女', age: 55, phone: '13700001111' });
  assert(CareStore.patient(p.id) === p, 'addPatient 成功');
  let threw = false;
  try { CareStore.addPatient({ name: '新增患者甲' }); } catch (e) { threw = true; }
  assert(threw, '同名患者被拒绝');
  CareStore.addNeed({ patientName: '新增患者甲', hospital: '北京协和医院', dept: '心内科', date: '尽快', serviceType: '半程陪诊' });
  threw = false;
  try { CareStore.removePatient(p.id); } catch (e) { threw = true; }
  assert(threw, '有未完成需求的患者禁止删除');
  CareStore.state.needs.find(n => n.patientName === '新增患者甲').status = '已完成';
  CareStore.removePatient(p.id);
  assert(CareStore.patient(p.id).active === false && !CareStore.activePatients().some(x => x.id === p.id), '无未完成需求时患者软删除并从列表移除');

  // --- 双向填写档案 ---
  const ar = CareStore.addArchive({ patientName: '王秀兰', hospital: '北京协和医院', dept: '心内科', visitDate: '2026-01-10', doctor: '张医生', visitSummary: '管理员初填', needRecheck: true, recheckDate: CareStore.shiftDateISO(5) }, 'admin');
  assert(ar.fieldsSource.doctor === 'admin' && ar.fieldsSource.visitSummary === 'admin', '管理员建档记录字段来源');
  CareStore.updateArchive(ar.id, { careContent: '患者补充的用药情况' }, 'patient');
  assert(ar.fieldsSource.careContent === 'patient' && ar.visitSummary === '管理员初填', '患者补充写入并标注来源，且不覆盖管理员字段');
  CareStore.updateArchive(ar.id, { visitSummary: '管理员更新的结论' }, 'admin');
  assert(ar.visitSummary === '管理员更新的结论' && ar.fieldsSource.visitSummary === 'admin', '管理员后续更新来源正确');
  threw = false;
  try { CareStore.updateArchive(ar.id, { recheckDate: '' }); } catch (e) { threw = true; }
  assert(threw, '需要复查但日期为空时抛错（不产生半写入）');
  assert(CareStore.updateArchive(ar.id, { rechecked: true }).recheckStatus === '已复查', '标记已复查生效');

  // --- 复查提醒 ---
  const before = CareStore.notificationsFor('patient').length;
  const r1 = CareStore.checkRecheckReminders();
  assert(r1.due.some(x => x.archive.id === 'AR01') && r1.remindDays === RECHECK_REMIND_DAYS, `到期前 ${RECHECK_REMIND_DAYS} 天进入提醒待办`);
  assert(r1.overdue.some(x => x.archive.id === 'AR02') && CareStore.archive('AR02').recheckStatus === '已逾期', '逾期档案自动置为已逾期');
  const after1 = CareStore.notificationsFor('patient').length;
  assert(after1 > before, '复查提醒生成患者通知');
  CareStore.checkRecheckReminders();
  assert(CareStore.notificationsFor('patient').length === after1, '重复检查不重复提醒（按档案+日期去重）');
  assert(CareStore.archivesFor('王秀兰').length >= 1, 'archivesFor 按患者名返回档案');

  // --- 医院 CRUD ---
  const h = CareStore.addHospital({ name: '测试医院', level: '三甲', category: '专科医院', city: '上海市', branches: [{ name: '总院', address: '测试路1号' }, { name: '东院', address: '测试路2号' }], keyDepts: ['心内科'], phone: '021-0000', image: 'data:image/jpeg;base64,AAAA', imageUploaded: true, hot: true, orders: 7 });
  assert(CareStore.hospital(h.id).address.includes('总院：测试路1号') && CareStore.hospital(h.id).address.includes('东院'), '新增医院分支地址派生正确');
  assert(CareStore.hospital(h.id).imageUploaded === true && CareStore.hospital(h.id).image.startsWith('data:image'), '医院保留上传图片 dataUrl');
  assert(CareStore.hospital(h.id).orders === 7, '医院服务单量落库');
  threw = false;
  try { CareStore.addHospital({ name: '测试医院' }); } catch (e) { threw = true; }
  assert(threw, '同名医院被拒绝');
  CareStore.addNeed({ patientName: '张三', hospital: '测试医院', dept: '心内科', date: '尽快', serviceType: '半程陪诊' });
  threw = false;
  try { CareStore.removeHospital(h.id); } catch (e) { threw = true; }
  assert(threw, '有未完成需求的医院禁止删除');
  assert(CareStore.removeHospital('H02').active === false && !CareStore.activeHospitals().some(x => x.id === 'H02'), '无引用医院软删除并从在架列表移除');
  assert(CareStore.restoreHospital('H02').active === true, '医院可恢复启用');
  const free = CareStore.addHospital({ name: '无人引用医院' });
  assert(CareStore.deleteHospital(free.id).id === free.id && !CareStore.hospital(free.id), '无引用医院可彻底删除');

  // --- 服务项 CRUD ---
  const item = CareStore.addPrice({ name: '术后陪护', desc: '术后 8 小时陪护', price: 688, unit: '次', group: 'escort' });
  assert(CareStore.state.prices.some(x => x.id === item.id), '新增服务项成功');
  assert(PriceTable.items === CareStore.state.prices, 'PriceTable.items 与 state.prices 同源（患者端表单自动出现）');
  threw = false;
  try { CareStore.addPrice({ name: '术后陪护', price: 100 }); } catch (e) { threw = true; }
  assert(threw, '同名服务项被拒绝');
  threw = false;
  try { CareStore.addPrice({ name: '零元项', price: 0 }); } catch (e) { threw = true; }
  assert(threw, '价格 <= 0 被拒绝');
  CareStore.addNeed({ patientName: '李四', hospital: '北京协和医院', dept: '心内科', date: '尽快', serviceType: '术后陪护' });
  threw = false;
  try { CareStore.removePrice(item.id); } catch (e) { threw = true; }
  assert(threw, '有未完成需求的服务项禁止删除');
  assert(CareStore.setPriceActive(item.id, false).active === false, '服务项可停用');

  // --- 服务项编辑（C1：改名 / 改价 / 改分组 + 未完成需求级联）---
  const renameTarget = CareStore.state.prices.find(p => p.name === '半程陪诊');
  const pendingNeed = CareStore.addNeed({ patientName: '级联测试', hospital: '北京协和医院', dept: '心内科', date: '尽快', serviceType: '半程陪诊' });
  const doneSeed = CareStore.state.needs.find(n => n.patientName === '王秀兰' && n.status === '已完成');
  const doneServiceBefore = doneSeed ? doneSeed.serviceType : null;
  const r = CareStore.updatePriceItem(renameTarget.id, { name: '基础陪诊', price: 358, group: 'escort', desc: '改后的说明' });
  assert(CareStore.state.prices.find(p => p.id === renameTarget.id).name === '基础陪诊', '服务项改名生效');
  assert(CareStore.state.prices.find(p => p.id === renameTarget.id).price === 358, '服务项改价生效');
  assert(r.renamedNeeds >= 1 && CareStore.need(pendingNeed.id).serviceType === '基础陪诊', '改名同步未完成需求的 serviceType');
  assert(!doneSeed || CareStore.need(doneSeed.id).serviceType === doneServiceBefore, '已完成需求的服务类型不被改名影响');
  assert(CareStore.state.priceChanges.some(c => c.itemName === '基础陪诊'), '服务项编辑写入变更记录');
  threw = false;
  try { CareStore.updatePriceItem(renameTarget.id, { name: '' }); } catch (e) { threw = true; }
  assert(threw, '空名称被拒绝');
  threw = false;
  try { CareStore.updatePriceItem(renameTarget.id, { name: '全程陪诊' }); } catch (e) { threw = true; }
  assert(threw, '改成与其他服务项同名被拒绝');
  threw = false;
  try { CareStore.updatePriceItem(renameTarget.id, { price: 0 }); } catch (e) { threw = true; }
  assert(threw, '改价 <= 0 被拒绝');
  assert(CareStore.updatePriceItem(renameTarget.id, { group: 'expert' }).item.group === 'expert', '改分组生效（患者端归位到专家预约区）');
  CareStore.updatePriceItem(renameTarget.id, { name: '半程陪诊', group: 'escort' }, { syncNeeds: false });
  assert(CareStore.state.prices.find(p => p.id === renameTarget.id).name === '半程陪诊', '可回退改名（syncNeeds:false 不级联）');
  assert(CareStore.need(pendingNeed.id).serviceType === '基础陪诊', 'syncNeeds:false 时未完成需求保持原值');

  // --- 陪诊师 CRUD ---
  const e = CareStore.addEscort({ name: '新陪诊师乙', phone: '138-1111-2222', tags: '骨科, 轮椅协助', region: '海淀区', note: '备注A' });
  assert(e.active === true && e.tags.length === 2 && e.avatar === '新', '新增陪诊师（标签解析 + 头像）');
  CareStore.setEscortActive(e.id, false);
  assert(CareStore.escort(e.id).status === '已停用' && !CareStore.activeEscorts().some(x => x.id === e.id), '停用陪诊师不在在岗列表');
  CareStore.updateEscort(e.id, { name: '新陪诊师丙', tags: ['心内科'] });
  assert(CareStore.escort(e.id).name === '新陪诊师丙' && CareStore.escort(e.id).tags[0] === '心内科', '编辑陪诊师生效');

  // --- 订单不变量与设置 ---
  const need = CareStore.addNeed({ patientName: '王五', hospital: '北京协和医院', dept: '心内科', date: '尽快', serviceType: '半程陪诊', escortName: '恶意注入', escortPhone: '110', preferredEscortId: 'E02', preferredEscortName: '张芳' });
  assert(need.escortName === null && need.escortPhone === null && need.escortId === null, '不变量：新建订单不携带已分配陪诊师（即使入参注入）');
  assert(need.preferredEscortId === 'E02' && need.preferredEscortName === '张芳' && need.status === '待处理', '订单记录患者意向且状态为待处理');
  CareStore.updateSettings({ consultPhone: '400-999-0000' });
  assert(CareStore.state.settings.consultPhone === '400-999-0000' && CareStore.notificationsFor('patient').some(n => n.type === 'settings_updated'), '咨询电话更新并通知患者');
  assert(MockData.patient.user.name === '王秀兰', 'MockData 演示患者未被破坏');
}

// ============================================================
// 阶段二：后台与患者端 UI（功能 + 视觉）
// ============================================================
async function phaseUI() {
  console.log('\n【阶段二】后台与患者端 UI');
  const env = boot();
  const { CareStore, App, Patient, Admin, MockData, MediaService, RECHECK_REMIND_DAYS, HOSPITAL_IMAGE_PROFILE } = env;
  const { screenEl, screenHTML, modalHTML, field } = env;

  // ---------- 咨询电话 ----------
  console.log('\n-- 咨询电话（后台配置 → 患者端展示）--');
  App.state = 'patientGuest'; App.isGuest = true; App.render();
  assert(screenHTML().includes('consult-strip') && screenHTML().includes('400-800-1234'), '首页展示配置的咨询电话');
  assert(screenHTML().includes('tel:4008001234'), '首页电话为可点拨号链接');
  Patient._openServiceSteps('consult_diagnosis', screenEl());
  assert(screenHTML().includes('电话咨询') && screenHTML().includes('tel:4008001234'), '流程步骤页新增"电话咨询"卡且可拨号');
  assert(screenHTML().includes('咨询电话') && screenHTML().includes('4. 遇到服务费外增收费用请联系平台咨询电话'), '注意事项第 4 条动态展示咨询电话');
  assert(Patient.consultNoticeLine().includes('tel:4008001234'), '注意事项电话为可点拨号链接');
  Patient.renderServiceCenter(screenEl());
  assert(screenHTML().includes('客服中心') && screenHTML().includes('400-800-1234') && screenHTML().includes('faq-item'), '客服中心展示电话与常见问题');
  const sysEl = makeEl();
  Admin.renderSystem(sysEl);
  assert(sysEl.innerHTML.includes('set_phone') && sysEl.innerHTML.includes('400-800-1234'), '后台系统设置含联系方式配置并回填');
  field('set_phone', '400-999-8888'); field('set_hours', '每日 09:00-21:00');
  Admin.saveSettings();
  assert(CareStore.state.settings.consultPhone === '400-999-8888', '保存写入 state.settings');
  Patient._openServiceSteps('agent_report', screenEl());
  assert(screenHTML().includes('tel:4009998888'), '患者端实时读取新号码');
  field('set_phone', 'abc');
  const beforePhone = CareStore.state.settings.consultPhone;
  Admin.saveSettings();
  assert(CareStore.state.settings.consultPhone === beforePhone, '非法电话格式被拦截');
  CareStore.state.settings.consultPhone = '';
  assert(Patient.consultCardHTML().includes('暂未配置咨询电话') && Patient.consultStripHTML() === '', '未配置电话时优雅降级');
  assert(Patient.consultNoticeLine().includes('平台工作人员'), '未配置电话时注意事项回退通用文案');
  CareStore.state.settings.consultPhone = '400-800-1234';

  // AI 话术中的咨询电话同样动态（价格查询）
  CareStore.state.ai.messages = [];
  const aiInput = env.sandbox.document.getElementById('aiInput');
  aiInput.value = '服务怎么收费';
  App.aiSend();
  const lastMsg = CareStore.state.ai.messages[CareStore.state.ai.messages.length - 1] || {};
  assert(String(lastMsg.html).includes('400-800-1234') && String(lastMsg.html).includes('tel:4008001234'), 'AI 价格话术动态带出咨询电话');

  // ---------- 医院管理 ----------
  console.log('\n-- 医院管理（CRUD + 图片上传）--');
  const hospEl = makeEl();
  Admin.renderHospitals(hospEl);
  assert(hospEl.innerHTML.includes('+ 新增医院') && hospEl.innerHTML.includes('hc-thumb'), '医院页含新增入口与图片缩略区');
  assert(hospEl.innerHTML.includes('复旦大学附属中山医院') && hospEl.innerHTML.includes("Admin.openHospitalForm('H01')"), '医院列表与编辑入口正常');
  Admin.openHospitalForm(null);
  assert(modalHTML().includes('id="hf_name"') && modalHTML().includes('id="hf_branches"') && modalHTML().includes('id="hf_image_input"'), '新增医院表单字段完整（含图片上传）');
  assert(modalHTML().includes('暂无图片'), '未上传时显示图片占位');
  Admin.openHospitalForm('H01');
  assert(modalHTML().includes('保存修改') && modalHTML().includes('复旦大学附属中山医院'), '编辑表单回填数据');
  let msg = '';
  try { await MediaService.process({ type: 'image/gif', size: 100 }, HOSPITAL_IMAGE_PROFILE); } catch (e) { msg = e.message; }
  assert(msg.includes('仅支持 JPEG'), '图片类型校验：非 JPEG/PNG/WebP 被拒绝');
  msg = '';
  try { await MediaService.process({ type: 'image/jpeg', size: 9 * 1024 * 1024 }, HOSPITAL_IMAGE_PROFILE); } catch (e) { msg = e.message; }
  assert(msg.includes('8MB'), '图片体积校验：超过压缩档上限被拒绝');
  const realProcess = MediaService.process;
  MediaService.process = async () => ({ name: 'h.jpg', type: 'image/jpeg', size: 150000, dataUrl: 'data:image/jpeg;base64,TESTIMG' });
  await Admin.uploadHospitalImage({ files: [{ type: 'image/jpeg', size: 150000 }], value: 'x' });
  MediaService.process = realProcess;
  assert(Admin._hospitalImage === 'data:image/jpeg;base64,TESTIMG' && env.elements['hf_img_preview'].innerHTML.includes('data:image/jpeg'), '上传后进入待保存状态并刷新预览');
  Admin.openHospitalForm(null);
  field('hf_name', '测试新医院'); field('hf_short', '测试医院'); field('hf_level', '三甲'); field('hf_category', '专科医院');
  field('hf_city', '上海市'); field('hf_phone', '021-1234'); field('hf_depts', '心内科、骨科');
  field('hf_intro', '测试简介'); field('hf_advantage', '测试优势'); field('hf_orders', '12');
  env.elements['hf_hot'] = env.elements['hf_hot'] || env.ctx.document.getElementById('hf_hot');
  env.ctx.document.getElementById('hf_hot').checked = true;
  Admin._hospitalImage = 'data:image/jpeg;base64,SAVED';
  Admin._hospitalImageUploaded = true;
  Admin.saveHospitalForm();
  const createdHosp = CareStore.state.hospitals.find(h => h.name === '测试新医院');
  assert(!!createdHosp && createdHosp.image === 'data:image/jpeg;base64,SAVED' && createdHosp.imageUploaded === true, '表单保存：医院与图片一并落库');
  assert(createdHosp.specialties === '心内科、骨科' && createdHosp.hot === true && createdHosp.orders === 12, '科室/热门/单量落库');
  Admin.openHospitalForm(null);
  field('hf_name', '测试新医院');
  Admin.saveHospitalForm();
  assert(CareStore.state.hospitals.filter(h => h.name === '测试新医院').length === 1, '同名医院被拦截');
  Admin.toggleHospitalActive(createdHosp.id);
  assert(env.confirmOpen() && env.confirmHTML().includes('确认停用医院'), '停用医院弹出二次确认（显示影响说明）');
  assert(CareStore.hospital(createdHosp.id).active === true, '未确认前不写入任何变更');
  env.confirmOk();
  assert(CareStore.hospital(createdHosp.id).active === false && !CareStore.activeHospitals().some(h => h.id === createdHosp.id), '停用后患者端不可见');
  Admin.renderHospitals(hospEl);
  assert(hospEl.innerHTML.includes('恢复启用') && hospEl.innerHTML.includes('彻底删除'), '停用后提供恢复/彻底删除');
  Admin.toggleHospitalActive(createdHosp.id);
  assert(CareStore.hospital(createdHosp.id).active === true, '恢复启用免确认直接生效');
  CareStore.updateHospital('H01', { image: 'images/hospitals/H01.jpg' });
  Patient.renderHospitals(screenEl());
  assert(screenHTML().includes('hi-media') && screenHTML().includes('images/hospitals/H01.jpg'), '患者端医院介绍页渲染医院图片');
  assert(screenHTML().includes('hi-intro') && screenHTML().includes('hi-meta') && screenHTML().includes('申请新增医院'), '医院介绍页图文排版与申请入口完整');
  const noImg = CareStore.addHospital({ name: '无图医院' });
  Patient.renderHospitals(screenEl());
  assert(screenHTML().includes('hi-media placeholder'), '无图医院降级为品牌占位（不破图）');
  CareStore.removeHospital(noImg.id);

  // ---------- 服务收费 ----------
  console.log('\n-- 服务收费（新增 / 停用 / 删除）--');
  const priceEl = makeEl();
  Admin.renderPricing(priceEl);
  assert(priceEl.innerHTML.includes('+ 新增服务项') && priceEl.innerHTML.includes('专家预约') && priceEl.innerHTML.includes('陪诊服务'), '收费页含新增入口与分组展示');
  Admin.openPriceForm();
  assert(modalHTML().includes('id="pf_name"') && modalHTML().includes('id="pf_price"') && modalHTML().includes('id="pf_group"'), '新增服务项表单字段完整');
  const priceCount = CareStore.state.prices.length;
  field('pf_name', ''); field('pf_price', '100');
  Admin.savePriceForm();
  field('pf_name', '术后陪护'); field('pf_price', '0');
  Admin.savePriceForm();
  assert(CareStore.state.prices.length === priceCount, '空名称/非法价格被拦截');
  Admin.openPriceForm();
  field('pf_name', '术后陪护'); field('pf_price', '688'); field('pf_unit', '次'); field('pf_group', 'escort'); field('pf_desc', '术后 8 小时陪护');
  Admin.savePriceForm();
  Admin.openPriceForm();
  field('pf_name', '专家加急预约'); field('pf_price', '1500'); field('pf_group', 'expert'); field('pf_unit', '次');
  Admin.savePriceForm();
  const escortItem = CareStore.state.prices.find(p => p.name === '术后陪护');
  const expertItem = CareStore.state.prices.find(p => p.name === '专家加急预约');
  assert(escortItem && escortItem.group === 'escort' && expertItem && expertItem.group === 'expert', '新增陪诊/专家服务项按分组落库');
  App.isGuest = false; App.state = 'patient';
  Patient.renderNeed(screenEl());
  assert(screenHTML().includes('data-service="术后陪护"') && screenHTML().includes('¥688'), '患者端"服务类型"区自动出现新项');
  assert(screenHTML().includes('data-service="专家加急预约"') && screenHTML().includes('¥1500'), '患者端"专家预约"区自动出现新项');
  // C1：服务项编辑
  assert(priceEl.innerHTML.includes("Admin.openPriceForm('") && priceEl.innerHTML.includes('编辑'), '收费页每行含「编辑」入口');
  Admin.openPriceForm(escortItem.id);
  assert(modalHTML().includes('编辑服务项') && modalHTML().includes('术后陪护') && modalHTML().includes('688'), '编辑表单回填服务项数据');
  field('pf_name', '术后陪护（8小时）'); field('pf_price', '728');
  Admin.savePriceForm(escortItem.id);
  assert(env.confirmOpen() && env.confirmHTML().includes('确认保存服务项修改') && env.confirmHTML().includes('名称'), '保存修改前弹出二次确认并列出变更项');
  assert(CareStore.state.prices.find(p => p.id === escortItem.id).name === '术后陪护', '未确认前名称不变');
  env.confirmOk();
  assert(CareStore.state.prices.find(p => p.id === escortItem.id).name === '术后陪护（8小时）', '确认后改名生效');
  assert(CareStore.state.prices.find(p => p.id === escortItem.id).price === 728, '确认后改价生效');
  Patient.renderNeed(screenEl());
  assert(screenHTML().includes('data-service="术后陪护（8小时）"') && screenHTML().includes('¥728'), '患者端表单立即显示新名称与新价格');

  Admin.togglePriceActive(escortItem.id);
  assert(env.confirmOpen() && env.confirmHTML().includes('确认停用服务项'), '停用服务项弹出二次确认');
  env.confirmOk();
  Patient.renderNeed(screenEl());
  assert(!screenHTML().includes('data-service="术后陪护（8小时）"'), '停用后患者端表单不再展示');
  Admin.renderPricing(priceEl);
  assert(priceEl.innerHTML.includes('已停用') && priceEl.innerHTML.includes('恢复'), '收费页展示停用状态与恢复入口');
  Admin.togglePriceActive(escortItem.id);
  assert(CareStore.state.prices.find(p => p.id === escortItem.id).active === true, '恢复在售免确认直接生效');
  CareStore.addNeed({ patientName: '测试甲', hospital: '北京协和医院', dept: '心内科', date: '尽快', serviceType: '术后陪护（8小时）' });
  Admin.deletePrice(escortItem.id);
  assert(env.confirmHTML().includes('1 条') || env.confirmHTML().includes('阻止删除'), '删除前确认弹窗提示引用数量');
  env.confirmOk();
  assert(!!CareStore.state.prices.find(p => p.id === escortItem.id), '有未完成需求引用时禁止删除');
  Admin.deletePrice(expertItem.id);
  assert(env.confirmOpen(), '删除无引用服务项同样需确认');
  env.confirmCancel();
  assert(!!CareStore.state.prices.find(p => p.id === expertItem.id), '取消确认不产生任何写入');
  Admin.deletePrice(expertItem.id);
  env.confirmOk();
  assert(!CareStore.state.prices.find(p => p.id === expertItem.id), '确认后无引用服务项可删除');

  // C1：改价二次确认（savePriceV2）
  const priceTarget = CareStore.state.prices.find(p => p.name === '全程陪诊');
  const priceBefore = priceTarget.price;
  env.field('price_' + priceTarget.id, String(priceBefore + 100));
  Admin.savePriceV2(priceTarget.id);
  assert(env.confirmHTML().includes('确认调整公开价格') && env.confirmHTML().includes(`¥${priceBefore}`), '改价弹窗展示新旧价格对比');
  assert(CareStore.state.prices.find(p => p.id === priceTarget.id).price === priceBefore, '未确认前价格不变');
  env.confirmOk();
  assert(CareStore.state.prices.find(p => p.id === priceTarget.id).price === priceBefore + 100, '确认后新价格生效');

  // ---------- 档案管理 ----------
  console.log('\n-- 档案管理（双向填写 + 复查提醒）--');
  assert(Admin.menus.flatMap(g => g.items).some(i => i.id === 'records' && i.name === '档案管理'), '后台菜单新增"档案管理"');
  Admin.currentMenu = 'records';
  Admin.renderContent();
  assert(env.ctx.document.getElementById('atCrumb').textContent === '档案管理', '路由链正确（面包屑=档案管理）');
  let html = env.ctx.document.getElementById('adminContent').innerHTML;
  assert(html.includes('复查提醒待办') && html.includes('就诊档案') && html.includes('患者数据'), '档案管理页含三大区块');
  assert(html.includes('王秀兰') && html.includes('已逾期'), '档案列表展示档案与逾期徽章');
  Admin.setRecordFilter('overdue');
  assert(env.ctx.document.getElementById('adminContent').innerHTML.includes('张建国'), '筛选"已逾期"命中逾期档案');
  Admin.setRecordFilter('all');
  Admin.openArchiveForm(null);
  assert(modalHTML().includes('id="af_patient"') && modalHTML().includes('id="af_hospital"') && modalHTML().includes('id="af_needRecheck"'), '建档表单字段完整');
  let archiveCount = CareStore.activeArchives().length;
  field('af_patient', ''); field('af_hospital', '北京协和医院');
  Admin.saveArchiveForm('');
  field('af_patient', '陈志强'); field('af_hospital', '');
  Admin.saveArchiveForm('');
  assert(CareStore.activeArchives().length === archiveCount, '缺就诊人/医院被拦截');
  Admin.openArchiveForm(null);
  field('af_patient', '陈志强'); field('af_hospital', '北京大学第一医院'); field('af_dept', '神经内科');
  field('af_doctor', '王医生'); field('af_visitSummary', '管理员填写的就诊情况'); field('af_careContent', '管理员填写的诊疗内容');
  field('af_visitDate', '2026-02-01');
  env.ctx.document.getElementById('af_needRecheck').checked = true;
  field('af_recheckDate', '');
  Admin.saveArchiveForm('');
  archiveCount = CareStore.activeArchives().length;
  field('af_recheckDate', CareStore.shiftDateISO(20));
  Admin.saveArchiveForm('');
  const newArchive = CareStore.activeArchives().find(a => a.patientName === '陈志强' && a.hospital === '北京大学第一医院');
  assert(!!newArchive && newArchive.fieldsSource.doctor === 'admin' && newArchive.recheckStatus === '待复查', '合法表单建档成功（含来源与复查状态）');
  CareStore.updateArchive(newArchive.id, { visitSummary: '患者补充：恢复不错' }, 'patient');
  assert(CareStore.archive(newArchive.id).fieldsSource.visitSummary === 'patient' && CareStore.archive(newArchive.id).careContent === '管理员填写的诊疗内容', '双向填写：患者补充标注来源且不覆盖其他字段');
  Patient.renderMyArchives(screenEl());
  assert(screenHTML().includes('我的档案') && screenHTML().includes('复查提醒') && screenHTML().includes('补充资料'), '患者端我的档案含复查提醒与补充入口');
  Patient.openArchiveSupplement('AR01');
  field('as_doctor', '张明华'); field('as_visitSummary', '患者补充的就诊情况'); field('as_careContent', '患者补充的诊疗内容');
  Patient.saveArchiveSupplement('AR01');
  assert(CareStore.archive('AR01').visitSummary === '患者补充的就诊情况' && CareStore.archive('AR01').fieldsSource.visitSummary === 'patient', '患者提交补充后管理员端同步可见');
  const beforeNotify = CareStore.notificationsFor('patient').filter(n => n.type === 'recheck_due').length;
  App.init();
  const afterFirst = CareStore.notificationsFor('patient').filter(n => n.type === 'recheck_due').length;
  App.init();
  const afterSecond = CareStore.notificationsFor('patient').filter(n => n.type === 'recheck_due').length;
  assert(afterFirst >= 1 && afterSecond === afterFirst && afterFirst >= beforeNotify, '启动检查生成提醒且重复启动不重复打扰');
  Admin.markArchiveRechecked('AR01');
  assert(CareStore.archive('AR01').recheckStatus === '已复查', '标记已复查生效');
  Patient.renderMyArchives(screenEl());
  assert(!screenHTML().includes('复查提醒'), '已复查后患者端提醒消失');
  Admin.openPatientForm(null);
  assert(modalHTML().includes('id="pt_name"') && modalHTML().includes('id="pt_history"'), '患者表单字段完整');
  field('pt_name', ''); Admin.savePatientForm('');
  field('pt_name', '新患者丁'); field('pt_phone', '13800002222');
  field('pt_gender', '女'); field('pt_age', '44');
  Admin.savePatientForm('');
  const np = CareStore.patientByName('新患者丁');
  assert(!!np, '管理员新增患者成功');
  Admin.deletePatient(np.id);
  assert(env.confirmOpen() && env.confirmHTML().includes('确认删除患者') && env.confirmHTML().includes('就诊档案'), '删除患者弹出二次确认（含档案/需求提示）');
  env.confirmOk();
  assert(CareStore.patient(np.id).active === false, '管理员删除患者（软删除）');
  App.isGuest = false;
  Patient.renderProfile(screenEl());
  assert(screenHTML().includes("Patient.renderMyArchives(el), '我的档案'"), '"我的"页注入"我的档案"入口');
  App.isGuest = true;
  Patient.renderProfile(screenEl());
  assert(!screenHTML().includes("'我的档案'"), '访客态不显示"我的档案"（需登录）');
  App.isGuest = false;

  // ---------- 陪诊师管理 ----------
  console.log('\n-- 陪诊师管理（CRUD + 意向陪诊师）--');
  Admin.currentMenu = 'escorts';
  Admin.renderEscorts(env.ctx.document.getElementById('adminContent'));
  html = env.ctx.document.getElementById('adminContent').innerHTML;
  assert(html.includes('+ 新增陪诊师') && html.includes('在岗（') && html.includes('已停用（'), '陪诊师页含新增与在岗/停用筛选');
  assert(html.includes("Admin.openEscortForm('E01')") && html.includes('停用') && html.includes('删除'), '卡片含编辑/停用/删除');
  Admin.openEscortForm(null);
  assert(modalHTML().includes('id="ef_name"') && modalHTML().includes('id="ef_tags"') && modalHTML().includes('id="ef_status"'), '陪诊师表单字段完整');
  field('ef_name', ''); Admin.saveEscortForm('');
  assert(!CareStore.state.escorts.some(e => !e.name), '空姓名被拦截');
  field('ef_name', '赵护士'); field('ef_phone', '138-2222-3333'); field('ef_gender', '女'); field('ef_age', '41');
  field('ef_region', '朝阳区'); field('ef_tags', '肿瘤科、心理疏导'); field('ef_status', '空闲'); field('ef_score', '93'); field('ef_note', '擅长重症陪护');
  Admin.saveEscortForm('');
  const newEscort = CareStore.state.escorts.find(e => e.name === '赵护士');
  assert(!!newEscort && newEscort.active === true && newEscort.tags.length === 2 && newEscort.score === 93, '新增陪诊师落库');
  Admin.toggleEscortActive(newEscort.id);
  assert(env.confirmOpen() && env.confirmHTML().includes('确认停用陪诊师'), '停用陪诊师弹出二次确认');
  env.confirmOk();
  assert(CareStore.escort(newEscort.id).active === false && CareStore.escort(newEscort.id).status === '已停用', '停用陪诊师生效');
  Admin.setEscortFilter('inactive');
  assert(env.ctx.document.getElementById('adminContent').innerHTML.includes('恢复在岗'), '已停用列表显示恢复入口');
  Admin.setEscortFilter('active');
  Admin.toggleEscortActive(newEscort.id);
  assert(CareStore.escort(newEscort.id).active === true, '恢复在岗免确认直接生效');
  const escortNeed = CareStore.addNeed({ patientName: '守卫测试', hospital: '北京协和医院', dept: '心内科', date: '尽快', serviceType: '半程陪诊' });
  CareStore.transitionNeed(escortNeed.id, '已分配', { escortId: newEscort.id, escortName: newEscort.name, escortPhone: newEscort.phone });
  Admin.deleteEscort(newEscort.id);
  assert(env.confirmHTML().includes('确认删除陪诊师') && env.confirmHTML().includes('进行中订单'), '删除陪诊师确认弹窗提示进行中订单');
  env.confirmOk();
  assert(CareStore.escort(newEscort.id).active === true, '有进行中订单时禁止删除陪诊师');
  CareStore.transitionNeed(escortNeed.id, '服务中');
  CareStore.transitionNeed(escortNeed.id, '已完成');
  Admin.deleteEscort(newEscort.id);
  env.confirmOk();
  assert(CareStore.escort(newEscort.id).active === false && !!CareStore.escort(newEscort.id).deletedAt, '无进行中订单时软删除陪诊师');
  const mkBtn = (onclick) => ({
    innerHTML: '张芳', removed: false,
    classList: { _c: [], add(c) { this._c.push(c); } },
    getAttribute() { return onclick; },
    remove() { this.removed = true; },
  });
  const btns = [mkBtn("Admin.assignEscortV2('N1','E02')"), mkBtn(`Admin.assignEscortV2('N1','${newEscort.id}')`), mkBtn('Admin.closeModal()')];
  const stat = Admin.filterEscortButtons({ querySelectorAll: () => btns }, { preferredEscortId: 'E02' });
  assert(stat.removed === 1 && btns[2].removed === false, '派单弹窗过滤已停用陪诊师按钮');
  assert(stat.marked === 1 && btns[0].innerHTML.includes('意向陪诊师') && btns[0].classList._c.includes('preferred-escort'), '意向陪诊师按钮被标注意向并高亮');
  App.isGuest = false; App.state = 'patient';
  Patient.renderNeed(screenEl());
  assert(screenHTML().includes('意向陪诊师（可选）') && screenHTML().includes('由平台推荐（默认）'), '表单新增意向陪诊师下拉（含默认"由平台推荐"）');
  assert(screenHTML().includes('value="E02"') && !screenHTML().includes(`value="${newEscort.id}"`), '下拉仅列出在岗陪诊师');
  assert(screenHTML().indexOf('意向陪诊师（可选）') < screenHTML().indexOf('特殊照护需求'), '下拉位于服务类型下方、特殊需求之前');
  CareStore.patchDraft({ preferredEscortId: 'E02', preferredEscortName: '张芳', hospital: '北京协和医院', dept: '心内科', date: '1-3天', serviceType: '半程陪诊' });
  const submitted = CareStore.createNeedFromDraft();
  assert(submitted.preferredEscortId === 'E02' && submitted.preferredEscortName === '张芳', '提交后订单记录患者意向');
  assert(submitted.escortName === null && submitted.escortPhone === null && submitted.escortId === null && submitted.status === '待处理', '不变量：订单无已分配陪诊师且状态待处理');

  // ---------- 首页视觉 ----------
  console.log('\n-- 首页视觉与实时数据条 --');
  CareStore.updateHospital('H01', { image: 'images/hospitals/H01.jpg', hot: true });
  App.isGuest = true; App.state = 'patientGuest'; App.render();
  html = screenHTML();
  assert(html.includes('ph-carousel') && html.includes('images/hospitals/H01.jpg') && html.includes('ph-trust-bar'), 'Hero 轮播使用医院实景图 + 品牌遮罩 + 信任标签条');
  assert(!html.includes('ph-banner-placeholder'), '旧纯色占位 Banner 已替换');
  assert(html.includes('ph-stats') && html.includes('合作医院') && html.includes('在岗陪诊师'), '新增实时数据条');  assert(html.includes('ph-sec-head') && html.includes('ph-sec-bar') && html.includes('ph-sec-more'), '区块标题统一为竖条样式并含"查看全部"');
  assert(html.includes('ph-guest-card'), '访客引导卡语义化');

  // ---------- C2：热门医院缩略图 + 医院读取契约统一 ----------
  console.log('\n-- 热门医院缩略图与数据一致性 --');
  const activeHospList = CareStore.activeHospitals();
  const hotWithImg = activeHospList.filter(h => h.hot && h.image);
  assert(screenHTML().includes('ph-hr-thumb'), '首页热门医院每行含缩略图容器');
  if (hotWithImg.length) {
    assert(screenHTML().includes('ph-hr-img') && screenHTML().includes(hotWithImg[0].image), '缩略图与特色页同源（使用同一 h.image）');
  }
  const thumbSrcs = (screenHTML().match(/class="ph-hr-img"/g) || []).length;
  const placeholderThumbs = (screenHTML().match(/ph-hr-thumb placeholder/g) || []).length;
  const hotCount = [...activeHospList].sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || (b.orders || 0) - (a.orders || 0)).slice(0, 6).length;
  assert(thumbSrcs + placeholderThumbs === hotCount, '每行「图片或占位」数量与热门医院行数一致（不出现破图）');
  const noImgHosp = CareStore.addHospital({ name: '首页无图医院', hot: true, orders: 9999 });
  App.render();
  assert(screenHTML().includes('首页无图医院') && screenHTML().includes('ph-hr-thumb placeholder'), '无图医院进入首页列表时显示品牌占位');
  CareStore.updateHospital(noImgHosp.id, { image: 'images/hospitals/H02.jpg' });
  App.render();
  assert(screenHTML().includes('images/hospitals/H02.jpg'), '上传/更新医院图片后首页缩略图立即生效');
  CareStore.removeHospital(noImgHosp.id);
  App.render();
  assert(!screenHTML().includes('首页无图医院'), '停用医院立即从首页热门列表消失');
  Patient.renderNeed(screenEl());
  assert(!screenHTML().includes('首页无图医院'), '停用医院不出现在需求表单医院下拉');
  assert(!CareStore.activeHospitals().some(h => h.name === '首页无图医院'), '统一读取入口 activeHospitals() 语义一致（active !== false）');
  App.render(); // 恢复首页视图（上一步进入了需求表单）
  const activePriceCount = CareStore.state.prices.filter(p => p.active !== false).length;
  assert(screenHTML().includes(`<strong>${activePriceCount}</strong><span>服务项目</span>`), '数据条服务项数读实时状态');
  const extraItem = CareStore.addPrice({ name: '临时视觉测试项', price: 199, group: 'escort' });
  App.render();
  assert(screenHTML().includes(`<strong>${activePriceCount + 1}</strong><span>服务项目</span>`), '数据条随后台变更实时刷新');
  CareStore.removePrice(extraItem.id);
  const withImages = CareStore.state.hospitals.filter(h => h.image);
  withImages.forEach(h => { h._bak = h.image; h.image = ''; });
  App.render();
  assert(screenHTML().includes('ph-banner-brand') && !screenHTML().includes('ph-carousel'), '带图医院不足 2 家时回退静态 Hero（不破版）');
  withImages.forEach(h => { h.image = h._bak; delete h._bak; });

  // ---------- C3：首页轮播 ----------
  console.log('\n-- 首页轮播（Carousel）--');
  CareStore.updateSettings({ bannerHospitalIds: [], bannerAutoPlay: true });
  App.render();
  const slides = Patient.carouselSlides();
  assert(slides.length >= 2 && slides.every(s => s.image), '轮播数据源取"在架且带图"医院');
  assert(screenHTML().includes('ph-carousel') && screenHTML().includes('carouselTrack'), '首页渲染轮播轨道');
  assert((screenHTML().match(/ph-carousel-slide/g) || []).length === slides.length, 'slide 数量与数据源一致');
  assert((screenHTML().match(/ph-carousel-dot/g) || []).length >= slides.length, '指示点数量与 slide 一致');
  assert(screenHTML().includes('aria-roledescription="carousel"') && screenHTML().includes('aria-label="下一张"'), '轮播具备无障碍标注');
  Patient.carouselGo(1);
  assert(Patient.carouselState.index === 1 && env.elements['carouselTrack'].style.transform === 'translateX(-100%)', '切换到下一张：轨道位移正确');
  Patient.carouselGoTo(slides.length - 1);
  Patient.carouselGo(1);
  assert(Patient.carouselState.index === 0, '末张再切换回到第一张（循环）');
  Patient.carouselGo(-1);
  assert(Patient.carouselState.index === slides.length - 1, '第一张向前切换到最后一张（循环）');
  assert(!!Patient._carouselTimer, '默认开启自动播放（5 秒/张）');
  Patient.stopCarousel();
  assert(!Patient._carouselTimer, '可停止自动播放（离开首页/切 Tab 时调用）');
  CareStore.updateSettings({ bannerAutoPlay: false });
  App.render();
  assert(!Patient._carouselTimer, '后台关闭自动播放后不再计时');
  CareStore.updateSettings({ bannerAutoPlay: true });
  env.sandbox.matchMedia = () => ({ matches: true });
  App.render();
  assert(!Patient._carouselTimer, 'prefers-reduced-motion: reduce 时停播（仅保留手动切换）');
  delete env.sandbox.matchMedia;
  App.render();
  assert(!!Patient._carouselTimer, '恢复默认后重新自动播放');
  Patient.stopCarousel();
  // 后台指定参与医院（数据流向）
  const pickIds = slides.slice(0, 2).map(s => s.id);
  CareStore.updateSettings({ bannerHospitalIds: pickIds });
  App.render();
  assert(Patient.carouselSlides().length === 2 && Patient.carouselSlides()[0].id === pickIds[0], '后台指定医院后按指定顺序轮播');
  const bannerSysEl = makeEl();
  Admin.renderSystem(bannerSysEl);
  assert(bannerSysEl.innerHTML.includes('首页轮播配置') && bannerSysEl.innerHTML.includes('set_banner_auto'), '后台系统设置含轮播配置卡');
  assert(bannerSysEl.innerHTML.includes('set_banner_item'), '轮播配置列出可参与的医院（带缩略图）');
  const autoBox = env.sandbox.document.getElementById('set_banner_auto');
  autoBox.checked = false;
  Admin.saveBannerSettings();
  assert(CareStore.state.settings.bannerAutoPlay === false, '保存轮播配置写入 state.settings');
  CareStore.updateSettings({ bannerHospitalIds: [], bannerAutoPlay: true });
  Patient.stopCarousel();
  const wangName = MockData.patient.user.name;
  let tempArchive = CareStore.archivesFor(wangName).find(a => a.needRecheck && a.recheckStatus !== '已复查');
  const createdTemp = !tempArchive;
  if (createdTemp) tempArchive = CareStore.addArchive({ patientName: wangName, hospital: '北京协和医院', dept: '心内科', visitSummary: '视觉测试', needRecheck: true, recheckDate: CareStore.shiftDateISO(5) }, 'admin');
  App.isGuest = false; App.state = 'patient'; App.render();
  assert(screenHTML().includes('ph-recheck') && screenHTML().includes('查看档案'), '登录患者首页显示复查提醒条并可跳转我的档案');
  App.isGuest = true; App.state = 'patientGuest'; App.render();
  assert(!screenHTML().includes('ph-recheck'), '访客不显示复查提醒条');
  if (createdTemp) CareStore.removeArchive(tempArchive.id);

  // ---------- C5：数据流向端到端专项（管理端改配置 → 前台立即生效）----------
  console.log('\n-- 数据流向端到端（管理端 → 患者端）--');
  Patient.stopCarousel();
  App.isGuest = true; App.state = 'patientGuest';

  // 1) 咨询电话：改一次 → 首页 / 流程页卡 / 注意事项 / 客服中心 / AI 话术 五处同步
  CareStore.updateSettings({ consultPhone: '400-777-6666', consultHours: '每日 07:00-22:00' });
  App.render();
  assert(screenHTML().includes('400-777-6666') && screenHTML().includes('tel:4007776666'), '① 改电话 → 首页咨询条同步');
  Patient._openServiceSteps('featured_expert', screenEl());
  assert(screenHTML().includes('400-777-6666') && screenHTML().includes('tel:4007776666'), '① 改电话 → 流程页卡片与注意事项同步');
  assert(screenHTML().includes('4. 遇到服务费外增收费用请联系平台咨询电话'), '① 改电话 → 注意事项第 4 条同步');
  Patient.renderServiceCenter(screenEl());
  assert(screenHTML().includes('400-777-6666'), '① 改电话 → 客服中心同步');
  CareStore.state.ai.messages = [];
  env.sandbox.document.getElementById('aiInput').value = '多少钱';
  App.aiSend();
  const aiMsg = CareStore.state.ai.messages.slice(-1)[0] || {};
  assert(String(aiMsg.html).includes('400-777-6666'), '① 改电话 → AI 话术同步');

  // 2) 价格：改一次 → 患者端表单与费用确认同步
  const flowItem = CareStore.state.prices.find(p => p.name === '全程陪诊');
  CareStore.updatePrice(flowItem.id, 777);
  Patient.renderNeed(screenEl());
  assert(screenHTML().includes('data-service="全程陪诊"') && screenHTML().includes('¥777'), '② 改价 → 患者端表单同步');

  // 3) 医院图片：上传一次 → 首页缩略图 / 轮播 / 特色页 / 医院介绍页 四处同步
  const flowHosp = CareStore.addHospital({ name: '数据流测试医院', hot: true, orders: 99999, image: 'data:image/jpeg;base64,FLOW', imageUploaded: true });
  App.state = 'patientGuest'; App.render();
  assert(screenHTML().includes('data:image/jpeg;base64,FLOW'), '③ 上传医院图 → 首页缩略图（或轮播）同步');
  Patient.renderFeaturedHospitals(screenEl());
  assert(screenHTML().includes('data:image/jpeg;base64,FLOW'), '③ 上传医院图 → 特色页同步');
  Patient.renderHospitals(screenEl());
  assert(screenHTML().includes('data:image/jpeg;base64,FLOW'), '③ 上传医院图 → 医院介绍页同步');

  // 4) 停用医院：一次操作 → 首页 / 特色页 / 医院介绍页 / 需求下拉 四处一致消失
  CareStore.removeHospital(flowHosp.id);
  App.render();
  assert(!screenHTML().includes('数据流测试医院'), '④ 停用医院 → 首页消失');
  Patient.renderFeaturedHospitals(screenEl());
  assert(!screenHTML().includes('数据流测试医院'), '④ 停用医院 → 特色页消失');
  Patient.renderHospitals(screenEl());
  assert(!screenHTML().includes('数据流测试医院'), '④ 停用医院 → 医院介绍页消失');
  Patient.renderNeed(screenEl());
  assert(!screenHTML().includes('数据流测试医院'), '④ 停用医院 → 需求表单下拉消失');

  // 5) 陪诊师停用 → 患者端意向下拉同步（派单弹窗过滤逻辑见前文断言）
  const flowEscort = CareStore.addEscort({ name: '数据流陪诊师', phone: '138-0000-7777', tags: '心内科' });
  Patient.renderNeed(screenEl());
  assert(screenHTML().includes(`value="${flowEscort.id}"`), '⑤ 新增陪诊师 → 患者端意向下拉同步');
  CareStore.setEscortActive(flowEscort.id, false);
  Patient.renderNeed(screenEl());
  assert(!screenHTML().includes(`value="${flowEscort.id}"`), '⑤ 停用陪诊师 → 意在向下拉同步移除');

  // 6) 服务项新增/停用 → 表单两个分组同步（分组归位）
  const flowPrice = CareStore.addPrice({ name: '数据流服务项', price: 123, group: 'escort' });
  Patient.renderNeed(screenEl());
  assert(screenHTML().includes('data-service="数据流服务项"') && screenHTML().includes('¥123'), '⑥ 新增服务项 → 患者端表单同步');
  CareStore.updatePriceItem(flowPrice.id, { group: 'expert' });
  Patient.renderNeed(screenEl());
  const expertZone = screenHTML().split('专家预约')[1] || '';
  assert(expertZone.includes('data-service="数据流服务项"'), '⑥ 改分组 → 服务项在患者端归位到专家预约区');
  CareStore.setPriceActive(flowPrice.id, false);
  Patient.renderNeed(screenEl());
  assert(!screenHTML().includes('data-service="数据流服务项"'), '⑥ 停用服务项 → 患者端表单同步移除');
  CareStore.removePrice(flowPrice.id);

  // 复位演示数据
  CareStore.updateSettings({ consultPhone: '400-800-1234', consultHours: '每日 08:00-20:00' });
  CareStore.updatePrice(flowItem.id, 598);
}

(async () => {
  console.log('护无忧 · 零依赖回归测试');
  phaseData();
  await phaseUI();
  console.log(`\n断言合计 ${total} 项，失败 ${failed} 项`);
  console.log(failed ? 'REGRESSION_FAILED' : 'REGRESSION_ALL_PASS');
  process.exitCode = failed ? 1 : 0;
})();
