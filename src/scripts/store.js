// ========== 护无忧统一数据层与服务适配器 ==========
// ---- 医院分支地址派生函数（与 scripts/validate-hospitals.js 双份同源，修改时保持同步）----
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
// 复查提醒提前天数（到期前 N 天开始自动提醒，模块级常量便于统一调整）
const RECHECK_REMIND_DAYS = 7;

const CareStore = {
  key: 'huwuyou_store_v1',
  backupKey: 'huwuyou_store_corrupt_backup',
  legacyPatientsKey: 'huwuyou_patients',
  // v3：新增 settings / patients / archives；needs 增 preferredEscortId/Name；hospitals 支持上传图片；escorts 支持停用
  version: 3,
  state: null,
  clone(value) {
    return JSON.parse(JSON.stringify(value));
  },
  now() {
    return new Date().toLocaleString('zh-CN', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
  },
  todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },
  shiftDateISO(days) {
    const d = new Date();
    d.setDate(d.getDate() + Number(days || 0));
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },
  // 距目标日期还有几天（负数=已逾期，null=日期无效）
  daysUntil(iso) {
    if (!iso) return null;
    const target = new Date(String(iso) + 'T00:00:00');
    if (Number.isNaN(target.getTime())) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  },
  recheckStatusFor(iso) {
    const days = this.daysUntil(iso);
    if (days === null) return '待复查';
    return days < 0 ? '已逾期' : '待复查';
  },
  uid(prefix) {
    return prefix + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();
  },
  // 按 id 增量合并：已存在的保留本地值（含管理员修改），本地缺失的用默认值补齐
  mergeById(baseList, loadedList) {
    const list = loadedList.map(l => {
      const b = baseList.find(x => x.id === l.id);
      return b ? { ...b, ...l } : l;
    });
    baseList.forEach(b => { if (!list.some(l => l.id === b.id)) list.push(this.clone(b)); });
    return list;
  },
  defaults() {
    const needs = this.clone(NeedPool.list).map(n => ({
      ...n,
      status: n.status === '已对接' ? '已分配' : n.status,
      serviceSnapshot: {
        name: n.serviceType,
        price: n.amount || PriceTable.getPrice(n.serviceType),
        unit: PriceTable.items.find(i => i.name === n.serviceType)?.unit || '次',
      },
      identity: n.identity || { front:null, back:null, fields:{}, status:'unconfirmed' },
      reportImages: n.reportImages || [],
      escortReportId: n.escortReportId || null,
      updatedAt: n.updatedAt || n.createTime,
    }));
    const doneNeed = needs.find(n => n.patientName === MockData.patient.user.name && n.status === '已完成');
    const demoReport = doneNeed ? {
      id: 'ER-DEMO-001', needId: doneNeed.id, status: 'published',
      timeline: [
        { time:'08:30', text:'陪诊师与患者在门诊大厅会合' },
        { time:'09:10', text:'完成签到并陪同候诊' },
        { time:'10:20', text:'完成医生问诊及检查预约' },
        { time:'11:35', text:'取药并核对医嘱，服务结束' },
      ],
      completedItems: ['签到挂号', '陪同问诊', '检查预约', '取药核对'],
      summary: '本次复诊流程顺利，已完成问诊、检查预约和取药。患者全程状态平稳。',
      notes: '请按医生要求记录血压；如出现明显不适，请及时联系医院。',
      images: [],
      plainExplanation: '今天已经完成复诊和取药。接下来请按医生要求记录血压，如有明显不舒服要及时联系医院。',
      publishedAt: '07-10 16:00', updatedAt: '07-10 16:00',
    } : null;
    if (doneNeed && demoReport) doneNeed.escortReportId = demoReport.id;
    return {
      version: this.version,
      draft: {
        patientName: MockData.patient.user.name,
        phone: MockData.patient.user.phone,
        gender: MockData.patient.user.gender,
        age: MockData.patient.user.age,
        history: MockData.patient.medical.history,
        allergy: MockData.patient.medical.allergy,
        medicine: MockData.patient.medical.medicine,
        mobility: MockData.patient.medical.mobility,
        emergencyName: MockData.patient.user.emergencyName,
        emergencyPhone: MockData.patient.user.emergencyPhone,
        insurance: MockData.patient.medical.insurance,
        hospital: '', dept: '', date: '', serviceType: '半程陪诊', note: '',
        preferredEscortId: null, preferredEscortName: '',
        identity: { front:null, back:null, fields:{}, status:'unconfirmed' },
        reportImages: [], hospitalApplicationId: null,
      },
      ai: { stage:'idle', messages:[] },
      needs,
      prices: this.clone(PriceTable.items).map(i => ({ ...i, active:true })),
      priceChanges: [],
      // 系统配置：咨询电话 + 首页轮播（管理员可改，患者端实时读取）
      settings: {
        consultPhone: MockData.settings?.consultPhone || '400-800-1234',
        consultHours: MockData.settings?.consultHours || '每日 08:00-20:00',
        // 首页轮播：bannerHospitalIds 为空时自动取"热门且带图"的医院；bannerAutoPlay=false 或系统开启 reduce 时仅手动切换
        bannerHospitalIds: [],
        bannerAutoPlay: true,
        updatedAt: '',
      },
      // 患者数据（管理员可增删改；患者端"就诊人/我的档案"共用同一份）
      patients: [
        {
          id: 'P00', name: MockData.patient.user.name, gender: MockData.patient.user.gender,
          age: MockData.patient.user.age, phone: MockData.patient.user.phone,
          emergencyName: MockData.patient.user.emergencyName, emergencyPhone: MockData.patient.user.emergencyPhone,
          history: MockData.patient.medical.history, allergy: MockData.patient.medical.allergy,
          medicine: MockData.patient.medical.medicine, mobility: MockData.patient.medical.mobility,
          insurance: MockData.patient.medical.insurance,
          orders: 1, satisfaction: 5.0, note: '当前登录演示患者', active: true, source: 'admin',
          createdAt: '07-08 14:30', updatedAt: '07-08 14:30',
        },
        ...this.clone(MockData.patientArchives || []).map(p => ({
          ...p, note: p.note || '', active: p.active !== false, source: p.source || 'admin',
          createdAt: p.createdAt || this.now(), updatedAt: p.updatedAt || this.now(),
        })),
      ],
      // 就诊档案（管理员与患者双向填写；含复查到期提醒）
      archives: this.clone(MockData.archives || []).map(a => ({ ...a, active: true })),
      hospitals: this.clone(MockData.hospitals).map(h => {
        const branches = h.branches || parseAddress(h.address) || [{ name:'总院', address:h.address || '' }];
        return {
          id:h.id, name:h.name, shortName:h.shortName || '', level:h.level || '三甲',
          category:h.category || '综合医院', city:h.city || '', address:h.address || deriveAddress(branches),
          intro:h.intro || '', phone:h.phone || '', keyDepts:h.keyDepts || [],
          orders:h.orders || 0, hot:h.hot || false, image:h.image || '',
          specialties:h.dept || h.keyDepts?.join('、') || '综合',
          advantage:h.advantage || '',
          branches, source:h.source || { info:'', ranking:'', updated:'' }, imageFallback:h.imageFallback || '',
          imageUploaded: !!h.imageUploaded,
          active:true, createdAt: h.createdAt || this.now(), updatedAt: h.updatedAt || this.now(),
        };
      }),
      hospitalApplications: this.clone(HospitalApplyPool.list).map(a => ({
        ...a, patientName:a.patient, status:a.status || '待审批', rejectReason:a.rejectReason || '',
      })),
      notifications: this.clone(NotifyPool.list).map(n => ({
        ...n, title:n.text, recipientRole:'admin', targetType:n.type === 'hospital_apply' ? 'hospitalApplication' : 'need', targetId:n.targetId || '',
      })),
      escortReports: demoReport ? [demoReport] : [],
      announcements: [
        { id:'AN-001', title:'平台服务说明', content:'护无忧智陪诊平台为您提供专业陪诊服务。提交需求后，管理员将根据您的实际情况匹配最合适的陪诊师。', status:'published', publishedAt:'07-15 10:00' },
      ],
      escorts: this.clone(MockData.escorts).map(e => ({ ...e, active: e.active !== false, note: e.note || '', updatedAt: e.updatedAt || this.now() })),
    };
  },
  init() {
    const base = this.defaults();
    let loaded = null;
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) loaded = JSON.parse(raw);
    } catch (error) {
      try { localStorage.setItem(this.backupKey, localStorage.getItem(this.key) || ''); } catch (_) {}
      setTimeout(() => window.App?.toast?.('本地数据损坏，已恢复演示初始数据'), 0);
    }
    // 版本兼容：任意已知版本（旧版/新版）都走增量合并，结构升级不丢用户数据；合并后统一升到当前版本
    const loadedVersion = Number(loaded?.version || 0);
    if (loaded && Number.isFinite(loadedVersion) && loadedVersion >= 1) {
      this.state = this.merge(base, loaded);
      this.state.version = this.version;
    } else {
      this.state = base;
    }
    this.bindLegacy();
    this.migrateLegacyPatients();
    this.save();
  },
  // 旧独立键 huwuyou_patients（患者端"就诊人管理"）一次性并入 state.patients；旧键保留作备份，不删除
  migrateLegacyPatients() {
    let legacy = null;
    try {
      legacy = JSON.parse(localStorage.getItem(this.legacyPatientsKey) || 'null');
    } catch (_) { legacy = null; }
    if (!Array.isArray(legacy) || !legacy.length) return 0;
    let added = 0;
    legacy.forEach(lp => {
      const name = String(lp?.name || '').trim();
      if (!name) return;
      if (this.state.patients.some(p => p.name === name)) return;
      this.state.patients.push({
        id: this.uid('P'), name, gender: lp.gender || '', age: lp.age ?? '', phone: lp.phone || '',
        emergencyName: '', emergencyPhone: '',
        history: lp.medicalHistory || '', allergy: '', medicine: '', mobility: '', insurance: '',
        relation: lp.relation || '', images: Array.isArray(lp.images) ? this.clone(lp.images) : [],
        orders: 0, satisfaction: 0, note: '由患者端就诊人迁移',
        active: true, source: 'patient', createdAt: this.now(), updatedAt: this.now(),
      });
      added += 1;
    });
    if (added) {
      this.state.legacyPatientsMerged = true;
      this.save();
    }
    return added;
  },
  merge(base, loaded) {
    return {
      ...base, ...loaded,
      draft: { ...base.draft, ...(loaded.draft || {}), identity:{ ...base.draft.identity, ...(loaded.draft?.identity || {}) } },
      ai: { ...base.ai, ...(loaded.ai || {}) },
      needs: Array.isArray(loaded.needs) ? loaded.needs : base.needs,
      prices: Array.isArray(loaded.prices)
        ? base.prices.map(bp => {
            // 增量合并：以默认价目表为骨架，已存在的项保留本地值（含管理员改价），
            // 本地缺失的新增项（如专家预约）自动补齐默认值
            const lp = loaded.prices.find(p => p.id === bp.id);
            return lp ? { ...bp, ...lp } : bp;
          })
        : base.prices,
      priceChanges: Array.isArray(loaded.priceChanges) ? loaded.priceChanges : [],
      settings: { ...base.settings, ...(loaded.settings || {}) },
      patients: Array.isArray(loaded.patients) ? this.mergeById(base.patients, loaded.patients) : base.patients,
      archives: Array.isArray(loaded.archives) ? this.mergeById(base.archives, loaded.archives) : base.archives,
      hospitals: Array.isArray(loaded.hospitals) ? this.mergeById(base.hospitals, loaded.hospitals).map(h => {
        const baseH = base.hospitals.find(b => b.id === h.id);
        return {
          ...h,
          branches: h.branches || baseH?.branches || parseAddress(h.address) || [{ name:'总院', address:h.address || '' }],
          source: h.source || baseH?.source || { info:'', ranking:'', updated:'' },
          advantage: h.advantage || baseH?.advantage || '',
          image: /trae-api-cn\.mchost\.guru/.test(h.image || '') ? (baseH?.image || h.image) : h.image,
          imageFallback: h.imageFallback || baseH?.imageFallback || '',
          imageUploaded: !!h.imageUploaded,
          active: h.active !== false,
        };
      }) : base.hospitals,
      hospitalApplications: Array.isArray(loaded.hospitalApplications) ? loaded.hospitalApplications : base.hospitalApplications,
      notifications: Array.isArray(loaded.notifications) ? loaded.notifications : base.notifications,
      escortReports: Array.isArray(loaded.escortReports) ? loaded.escortReports : base.escortReports,
      announcements: Array.isArray(loaded.announcements) ? loaded.announcements : base.announcements,
      escorts: Array.isArray(loaded.escorts)
        ? this.mergeById(base.escorts, loaded.escorts).map(e => ({ ...e, active: e.active !== false }))
        : base.escorts,
    };
  },
  bindLegacy() {
    NeedPool.list = this.state.needs;
    NeedPool.getById = id => this.need(id);
    NeedPool.add = need => this.addNeed(need);
    NeedPool.update = (id, patch) => this.updateNeed(id, patch);
    PriceTable.items = this.state.prices;
    PriceTable.updatePrice = (id, price) => this.updatePrice(id, price);
    HospitalApplyPool.list = this.state.hospitalApplications;
    NotifyPool.list = this.state.notifications;
    NotifyPool.markAllRead = () => this.markAllNotifications('admin');
    Object.defineProperty(NotifyPool, 'unread', { configurable:true, get:() => this.notificationsFor('admin').filter(n => !n.read) });
    MockData.hospitals = this.state.hospitals;
    MockData.escorts = this.state.escorts;
  },
  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.state));
      return true;
    } catch (error) {
      window.App?.toast?.('图片或资料较多，本地空间不足；请删除部分图片后重试');
      return false;
    }
  },
  draft() { return this.state.draft; },
  patchDraft(patch) {
    const next = { ...this.state.draft, ...patch };
    if (patch.identity) next.identity = { ...this.state.draft.identity, ...patch.identity };
    this.state.draft = next;
    this.save();
    return next;
  },
  clearDraft() {
    const d = this.state.draft;
    const keep = ['patientName','phone','gender','age','history','allergy','medicine','mobility','emergencyName','emergencyPhone','insurance'].reduce((acc, k) => {
      if (d[k] !== undefined && d[k] !== null) acc[k] = d[k];
      return acc;
    }, {});
    this.state.draft = { ...this.defaults().draft, ...keep };
    this.state.ai = { stage:'idle', messages:[] };
    this.save();
  },
  need(id) { return this.state.needs.find(n => n.id === id); },
  addNeed(input) {
    // 状态白名单：通过 addNeed 只允许创建 待处理 订单
    if (input.status && input.status !== '待处理') {
      console.warn('CareStore.addNeed: 不允许创建状态 "' + input.status + '"，已重置为待处理');
      delete input.status;
    }
    const id = input.id || this.uid('N');
    const service = this.state.prices.find(p => p.name === input.serviceType) || this.state.prices[0];
    const need = {
      id, status:'待处理', createTime:this.now(), updatedAt:this.now(), escortName:null, escortPhone:null, feedback:null,
      ...input,
      // 不变量：新建订单一律不携带"已分配陪诊师"字段（仅可带患者意向 preferredEscort*）
      escortId: null, escortName: null, escortPhone: null,
      preferredEscortId: input.preferredEscortId || null,
      preferredEscortName: input.preferredEscortName || '',
      amount: input.amount ?? service.price,
      serviceSnapshot: input.serviceSnapshot || { name:service.name, price:service.price, unit:service.unit },
      identity: this.clone(input.identity || { front:null, back:null, fields:{}, status:'unconfirmed' }),
      reportImages: this.clone(input.reportImages || []), escortReportId: input.escortReportId || null,
    };
    this.state.needs.unshift(need);
    this.notify({ recipientRole:'admin', type:'new_need', title:`新患者 ${need.patientName} 提交了陪诊需求`, targetType:'need', targetId:id, eventKey:'created' });
    this.save();
    return need;
  },
  createNeedFromDraft() {
    const d = this.state.draft;
    const application = d.hospitalApplicationId && this.state.hospitalApplications.find(a => a.id === d.hospitalApplicationId);
    if (application && application.status !== '已通过') throw new Error('申请的医院仍在审核中，审核通过后才能提交需求');
    const missing = ['hospital','dept','date','serviceType'].filter(k => !d[k]);
    if (missing.length) throw new Error('请先补充完整医院、科室、日期和服务类型');
    const u = MockData.patient.user, med = MockData.patient.medical;
    const need = this.addNeed({
      patientName:d.patientName || u.name, gender:d.gender || u.gender,
      age:(d.age !== '' && d.age != null) ? Number(d.age) : u.age,
      phone:d.phone || u.phone,
      emergencyName:d.emergencyName || u.emergencyName, emergencyPhone:d.emergencyPhone || u.emergencyPhone,
      history:d.history || med.history, allergy:d.allergy || med.allergy,
      medicine:d.medicine || med.medicine, mobility:d.mobility || med.mobility, insurance:d.insurance || med.insurance,
      hospital:d.hospital, dept:d.dept, date:d.date, serviceType:d.serviceType, note:d.note,
      preferredEscortId:d.preferredEscortId || null,
      preferredEscortName:d.preferredEscortName || '',
      identity:d.identity, reportImages:d.reportImages,
      idCardFront:d.identity.front?.name || null, idCardBack:d.identity.back?.name || null,
      reportFiles:(d.reportImages || []).map(i => i.name),
    });
    this.clearDraft();
    return need;
  },
  updateNeed(id, patch) {
    const need = this.need(id);
    if (!need) return null;
    Object.assign(need, patch, { updatedAt:this.now() });
    this.save();
    return need;
  },
  transitionNeed(id, next, extra={}) {
    const need = this.need(id);
    if (!need) throw new Error('需求不存在');
    const allowed = { '待处理':['已分配','已取消'], '已分配':['服务中','已取消'], '服务中':['已完成'], '已完成':[], '已取消':[] };
    if (!(allowed[need.status] || []).includes(next)) throw new Error(`不能从“${need.status}”直接变更为“${next}”`);
    Object.assign(need, extra, { status:next, updatedAt:this.now() });
    const map = {
      '已分配':['need_assigned','陪诊需求已分配陪诊师'],
      '服务中':['service_started','陪诊服务已开始'],
      '已完成':['service_completed','陪诊服务已完成'],
      '已取消':['need_cancelled','陪诊需求已取消'],
    };
    if (map[next]) this.notify({ recipientRole:'patient', type:map[next][0], title:map[next][1], targetType:'need', targetId:id, eventKey:next });
    this.save();
    return need;
  },
  updatePrice(id, price) {
    const item = this.state.prices.find(p => p.id === id);
    if (!item || !Number.isFinite(Number(price)) || Number(price) <= 0) return null;
    const oldPrice = item.price;
    if (oldPrice === Number(price)) return item;
    item.price = Number(price);
    this.state.priceChanges.unshift({ id:this.uid('PC'), priceId:id, itemName:item.name, oldPrice, newPrice:item.price, time:this.now() });
    this.save();
    return item;
  },
  // 未完成订单（待处理/已分配/服务中）计数：软删除与停用的统一守卫
  busyNeeds(predicate) {
    return this.state.needs.filter(n => ['待处理','已分配','服务中'].includes(n.status) && predicate(n));
  },

  // ===== 系统设置（咨询电话等；患者端实时读取）=====
  updateSettings(patch) {
    const next = { ...this.state.settings, ...(patch || {}) };
    next.consultPhone = String(next.consultPhone || '').trim();
    next.consultHours = String(next.consultHours || '').trim();
    next.updatedAt = this.now();
    this.state.settings = next;
    if (next.consultPhone) {
      this.notify({ recipientRole:'patient', type:'settings_updated', title:`平台咨询电话已更新：${next.consultPhone}`, targetType:'settings', targetId:'consultPhone', eventKey:next.consultPhone });
    }
    this.save();
    return next;
  },

  // ===== 患者数据 CRUD（管理员增删改；患者端就诊人共用同一份）=====
  patient(id) { return this.state.patients.find(p => p.id === id); },
  patientByName(name) { return this.state.patients.find(p => p.name === name && p.active !== false); },
  activePatients() { return this.state.patients.filter(p => p.active !== false); },
  addPatient(input) {
    const name = String(input?.name || '').trim();
    if (!name) throw new Error('请填写患者姓名');
    if (this.state.patients.some(p => p.name === name && p.active !== false)) throw new Error('已存在同名患者');
    const patient = {
      id: this.uid('P'), name,
      gender: input.gender || '男', age: input.age ?? '', phone: String(input.phone || '').trim(),
      emergencyName: input.emergencyName || '', emergencyPhone: input.emergencyPhone || '',
      history: input.history || '', allergy: input.allergy || '', medicine: input.medicine || '',
      mobility: input.mobility || '', insurance: input.insurance || '',
      relation: input.relation || '', note: input.note || '',
      orders: 0, satisfaction: 0,
      active: true, source: input.source || 'admin',
      createdAt: this.now(), updatedAt: this.now(),
    };
    this.state.patients.unshift(patient);
    this.save();
    return patient;
  },
  updatePatient(id, patch) {
    const p = this.patient(id);
    if (!p) throw new Error('患者不存在');
    const next = { ...patch };
    if ('name' in next) {
      next.name = String(next.name || '').trim();
      if (!next.name) throw new Error('请填写患者姓名');
      if (this.state.patients.some(x => x.id !== id && x.name === next.name && x.active !== false)) throw new Error('已存在同名患者');
    }
    Object.assign(p, next, { updatedAt: this.now() });
    this.save();
    return p;
  },
  removePatient(id) {
    const p = this.patient(id);
    if (!p) throw new Error('患者不存在');
    const busy = this.busyNeeds(n => n.patientName === p.name);
    if (busy.length) throw new Error(`${p.name} 还有 ${busy.length} 条未完成需求，不能删除`);
    p.active = false; p.updatedAt = this.now();
    this.save();
    return p;
  },
  restorePatient(id) {
    const p = this.patient(id);
    if (!p) throw new Error('患者不存在');
    p.active = true; p.updatedAt = this.now();
    this.save();
    return p;
  },

  // ===== 就诊档案 CRUD（管理员 / 患者双向填写）=====
  archive(id) { return this.state.archives.find(a => a.id === id); },
  activeArchives() { return this.state.archives.filter(a => a.active !== false); },
  archivesFor(patientName) {
    return this.activeArchives()
      .filter(a => a.patientName === patientName)
      .sort((a, b) => String(b.visitDate || '').localeCompare(String(a.visitDate || '')));
  },
  archiveFieldsSource(input, byRole) {
    const source = {};
    ['hospital','dept','visitDate','doctor','visitSummary','careContent'].forEach(k => {
      if (String(input?.[k] ?? '').trim()) source[k] = byRole;
    });
    return source;
  },
  addArchive(input, byRole = 'admin') {
    const patientName = String(input?.patientName || '').trim();
    const hospital = String(input?.hospital || '').trim();
    if (!patientName) throw new Error('请选择或填写就诊人');
    if (!hospital) throw new Error('请填写就诊医院');
    const needRecheck = !!input.needRecheck;
    if (needRecheck && !String(input.recheckDate || '').trim()) throw new Error('需要复查时必须填写复查到期时间');
    const archive = {
      id: this.uid('AR'), patientId: input.patientId || '', patientName, needId: input.needId || null,
      visitDate: input.visitDate || this.todayISO(), hospital, dept: input.dept || '',
      doctor: input.doctor || '',
      visitSummary: input.visitSummary || '', careContent: input.careContent || '',
      needRecheck, recheckDate: needRecheck ? String(input.recheckDate).trim() : '',
      recheckStatus: needRecheck ? this.recheckStatusFor(input.recheckDate) : '无需复查',
      recheckNote: input.recheckNote || '',
      attachments: this.clone(input.attachments || []),
      fieldsSource: this.archiveFieldsSource(input, byRole),
      remindKeys: [], remindedAt: null, recheckedAt: '',
      active: true, createdBy: byRole, updatedBy: byRole,
      createdAt: this.now(), updatedAt: this.now(),
    };
    this.state.archives.unshift(archive);
    this.save();
    return archive;
  },
  updateArchive(id, patch, byRole = 'admin') {
    const a = this.archive(id);
    if (!a) throw new Error('档案不存在');
    const { rechecked, attachments, needRecheck, recheckDate, ...rest } = patch || {};
    const prevRecheckDate = String(a.recheckDate || '');
    const nextRecheck = ('needRecheck' in (patch || {})) ? !!needRecheck : a.needRecheck;
    const nextRecheckDate = ('recheckDate' in (patch || {})) ? String(recheckDate || '').trim() : prevRecheckDate;
    if (nextRecheck && !nextRecheckDate) throw new Error('需要复查时必须填写复查到期时间');
    const source = { ...(a.fieldsSource || {}) };
    ['hospital','dept','visitDate','doctor','visitSummary','careContent'].forEach(k => {
      if (!(k in rest)) return;
      const next = String(rest[k] ?? '').trim();
      if (next && next !== String(a[k] ?? '').trim()) source[k] = byRole;
    });
    Object.assign(a, rest);
    if (Array.isArray(attachments)) a.attachments = this.clone(attachments);
    a.needRecheck = nextRecheck;
    a.recheckDate = nextRecheck ? nextRecheckDate : '';
    if (nextRecheckDate !== prevRecheckDate) a.remindKeys = []; // 复查日期变更后允许重新提醒
    if (rechecked === true) {
      a.recheckStatus = '已复查'; a.recheckedAt = this.now();
    } else if (!nextRecheck) {
      a.recheckStatus = '无需复查'; a.recheckedAt = '';
    } else if (a.recheckStatus !== '已复查') {
      a.recheckStatus = this.recheckStatusFor(nextRecheckDate);
    }
    a.fieldsSource = source;
    a.updatedBy = byRole;
    a.updatedAt = this.now();
    this.save();
    return a;
  },
  markArchiveRechecked(id) { return this.updateArchive(id, { rechecked: true }, 'admin'); },
  removeArchive(id) {
    const a = this.archive(id);
    if (!a) throw new Error('档案不存在');
    a.active = false; a.updatedAt = this.now();
    this.save();
    return a;
  },
  // 复查到期自动提醒：到期前 RECHECK_REMIND_DAYS 天提醒一次（按 档案id+复查日期 去重），逾期自动置为"已逾期"
  checkRecheckReminders() {
    const due = [], overdue = [];
    let changed = false;
    this.activeArchives().forEach(a => {
      if (!a.needRecheck || !a.recheckDate) return;
      const days = this.daysUntil(a.recheckDate);
      if (days === null) return;
      if (a.recheckStatus === '已复查') return;
      if (days < 0) {
        if (a.recheckStatus !== '已逾期') { a.recheckStatus = '已逾期'; changed = true; }
        overdue.push({ archive: a, days });
        return;
      }
      if (a.recheckStatus !== '待复查') { a.recheckStatus = '待复查'; changed = true; }
      if (days > RECHECK_REMIND_DAYS) return;
      due.push({ archive: a, days });
      const key = `${a.id}:${a.recheckDate}`;
      if (!(a.remindKeys || []).includes(key)) {
        this.notify({ recipientRole:'patient', type:'recheck_due', title:`复查提醒：${a.patientName} 建议在 ${a.recheckDate} 前到 ${a.hospital} 复查`, targetType:'archive', targetId:a.id, eventKey:a.recheckDate });
        a.remindKeys = [...(a.remindKeys || []), key];
        a.remindedAt = this.now();
        changed = true;
      }
    });
    if (changed) this.save();
    return { due, overdue, remindDays: RECHECK_REMIND_DAYS };
  },

  // ===== 医院 CRUD（新增/编辑/停用；删除为软删除并校验进行中订单）=====
  hospital(id) { return this.state.hospitals.find(h => h.id === id); },
  activeHospitals() { return this.state.hospitals.filter(h => h.active !== false); },
  normalizeBranches(branches, fallbackAddress) {
    if (Array.isArray(branches) && branches.length) {
      return branches.map((b, i) => ({
        name: String(b?.name || (i === 0 ? '总院' : `分院${i}`)).trim(),
        address: String(b?.address || '').trim(),
      }));
    }
    return [{ name: '总院', address: String(fallbackAddress || '').trim() }];
  },
  addHospital(input) {
    const name = String(input?.name || '').trim();
    if (!name) throw new Error('请填写医院全称');
    if (this.state.hospitals.some(h => h.name === name && h.active !== false)) throw new Error('该医院已存在');
    const branches = this.normalizeBranches(input.branches, input.address);
    const keyDepts = Array.isArray(input.keyDepts) ? input.keyDepts.filter(Boolean) : [];
    const hospital = {
      id: this.uid('H'), name, shortName: String(input.shortName || '').trim(),
      level: input.level || '三甲', category: input.category || '综合医院', city: input.city || '上海市',
      address: deriveAddress(branches), branches,
      intro: input.intro || '', advantage: input.advantage || '', phone: input.phone || '',
      keyDepts, specialties: input.specialties || keyDepts.join('、') || '综合',
      orders: (Number.isFinite(Number(input.orders)) && Number(input.orders) >= 0) ? Number(input.orders) : 0,
      hot: !!input.hot,
      image: input.image || '', imageFallback: '', imageUploaded: !!input.imageUploaded,
      source: { info:'管理员新增', ranking:'', updated: this.todayISO() },
      active: true, createdAt: this.now(), updatedAt: this.now(),
    };
    this.state.hospitals.push(hospital);
    this.save();
    return hospital;
  },
  updateHospital(id, patch) {
    const h = this.hospital(id);
    if (!h) throw new Error('医院不存在');
    const { branches, keyDepts, ...rest } = patch || {};
    Object.assign(h, rest);
    if (Array.isArray(branches) && branches.length) h.branches = this.normalizeBranches(branches, h.branches?.[0]?.address);
    if (Array.isArray(keyDepts)) h.keyDepts = keyDepts.filter(Boolean);
    h.address = deriveAddress(h.branches);
    h.specialties = h.specialties || (h.keyDepts || []).join('、') || '综合';
    h.updatedAt = this.now();
    this.save();
    return h;
  },
  removeHospital(id) {
    const h = this.hospital(id);
    if (!h) throw new Error('医院不存在');
    const busy = this.busyNeeds(n => n.hospital === h.name);
    if (busy.length) throw new Error(`${h.name} 还有 ${busy.length} 条未完成需求，不能删除（可先停用）`);
    h.active = false; h.updatedAt = this.now();
    this.save();
    return h;
  },
  restoreHospital(id) {
    const h = this.hospital(id);
    if (!h) throw new Error('医院不存在');
    h.active = true; h.updatedAt = this.now();
    this.save();
    return h;
  },
  // 彻底删除：仅当无任何需求/申请引用时才允许（否则只能停用）
  deleteHospital(id) {
    const idx = this.state.hospitals.findIndex(h => h.id === id);
    if (idx < 0) throw new Error('医院不存在');
    const h = this.state.hospitals[idx];
    const refs = this.state.needs.filter(n => n.hospital === h.name).length
      + this.state.hospitalApplications.filter(a => a.hospital === h.name).length;
    if (refs) throw new Error(`${h.name} 已被 ${refs} 条需求/申请引用，只能停用，不能删除`);
    this.state.hospitals.splice(idx, 1);
    this.save();
    return h;
  },

  // ===== 服务项目 CRUD（新增 / 停用 / 删除）=====
  addPrice(input) {
    const name = String(input?.name || '').trim();
    const price = Number(input?.price);
    if (!name) throw new Error('请填写服务名称');
    if (!Number.isFinite(price) || price <= 0) throw new Error('请填写大于 0 的价格');
    if (this.state.prices.some(p => p.name === name)) throw new Error('已存在同名服务项');
    const item = {
      id: this.uid('S'), name, desc: String(input.desc || '').trim(), price,
      unit: String(input.unit || '次').trim() || '次',
      group: input.group === 'expert' ? 'expert' : 'escort',
      active: true, createdAt: this.now(),
    };
    this.state.prices.push(item);
    this.state.priceChanges.unshift({ id:this.uid('PC'), priceId:item.id, itemName:item.name, oldPrice:0, newPrice:item.price, time:this.now() });
    this.save();
    return item;
  },
  setPriceActive(id, active) {
    const item = this.state.prices.find(p => p.id === id);
    if (!item) throw new Error('服务项不存在');
    item.active = !!active;
    this.save();
    return item;
  },
  removePrice(id) {
    const idx = this.state.prices.findIndex(p => p.id === id);
    if (idx < 0) throw new Error('服务项不存在');
    const item = this.state.prices[idx];
    const busy = this.busyNeeds(n => n.serviceType === item.name);
    if (busy.length) throw new Error(`${item.name} 还有 ${busy.length} 条未完成需求，不能删除（可先停用）`);
    this.state.prices.splice(idx, 1);
    this.save();
    return item;
  },
  // 服务项编辑：改名 / 改描述 / 改单位 / 改分组 / 改价格
  // opts.syncNeeds !== false 时，改名会同步"未完成需求"的 serviceType（已完成订单用价格快照，不受影响）
  updatePriceItem(id, patch, opts = {}) {
    const item = this.state.prices.find(p => p.id === id);
    if (!item) throw new Error('服务项不存在');
    const next = { ...(patch || {}) };
    if ('name' in next) {
      const name = String(next.name || '').trim();
      if (!name) throw new Error('请填写服务名称');
      if (this.state.prices.some(p => p.id !== id && p.name === name)) throw new Error('已存在同名服务项');
      next.name = name;
    }
    if ('price' in next) {
      const price = Number(next.price);
      if (!Number.isFinite(price) || price <= 0) throw new Error('请填写大于 0 的价格');
      next.price = price;
    }
    if ('unit' in next) next.unit = String(next.unit || '次').trim() || '次';
    if ('desc' in next) next.desc = String(next.desc || '').trim();
    if ('group' in next) next.group = next.group === 'expert' ? 'expert' : 'escort';
    const oldName = item.name;
    const oldPrice = item.price;
    const renamed = !!next.name && next.name !== oldName;
    const priceChanged = ('price' in next) && next.price !== oldPrice;
    Object.assign(item, next, { updatedAt: this.now() });
    let renamedNeeds = 0;
    if (renamed && opts.syncNeeds !== false) {
      this.state.needs.forEach(n => {
        if (n.serviceType === oldName && ['待处理', '已分配', '服务中'].includes(n.status)) {
          n.serviceType = item.name;
          n.updatedAt = this.now();
          renamedNeeds += 1;
        }
      });
    }
    if (renamed || priceChanged) {
      this.state.priceChanges.unshift({ id: this.uid('PC'), priceId: id, itemName: item.name, oldPrice, newPrice: item.price, time: this.now() });
    }
    this.save();
    return { item, renamedNeeds, oldName, oldPrice, renamed, priceChanged };
  },

  // ===== 陪诊师 CRUD（新增 / 编辑 / 停用 / 删除）=====
  escort(id) { return this.state.escorts.find(e => e.id === id); },
  activeEscorts() { return this.state.escorts.filter(e => e.active !== false && e.status !== '已停用'); },
  addEscort(input) {
    const name = String(input?.name || '').trim();
    if (!name) throw new Error('请填写陪诊师姓名');
    const tags = Array.isArray(input.tags)
      ? input.tags.filter(Boolean)
      : String(input.tags || '').split(/[,，、]/).map(t => t.trim()).filter(Boolean);
    const escort = {
      id: this.uid('E'), name, avatar: name.charAt(0),
      gender: input.gender || '女', age: input.age ?? '', phone: String(input.phone || '').trim(),
      star: 5.0, orders: 0, status: '空闲', score: Number(input.score) || 90,
      tags, region: input.region || '', joinDate: input.joinDate || this.todayISO(),
      income: 0, completionRate: Number(input.completionRate) || 100,
      note: input.note || '', active: true,
      createdAt: this.now(), updatedAt: this.now(),
    };
    this.state.escorts.unshift(escort);
    this.save();
    return escort;
  },
  updateEscort(id, patch) {
    const e = this.escort(id);
    if (!e) throw new Error('陪诊师不存在');
    const { tags, ...rest } = patch || {};
    Object.assign(e, rest);
    if ('name' in rest && rest.name) e.avatar = String(rest.name).trim().charAt(0);
    if (tags !== undefined) {
      e.tags = Array.isArray(tags) ? tags.filter(Boolean)
        : String(tags || '').split(/[,，、]/).map(t => t.trim()).filter(Boolean);
    }
    e.updatedAt = this.now();
    this.save();
    return e;
  },
  setEscortActive(id, active) {
    const e = this.escort(id);
    if (!e) throw new Error('陪诊师不存在');
    e.active = !!active;
    e.status = active ? (e.status === '已停用' ? '空闲' : e.status) : '已停用';
    e.updatedAt = this.now();
    this.save();
    return e;
  },
  removeEscort(id) {
    const e = this.escort(id);
    if (!e) throw new Error('陪诊师不存在');
    const busy = this.busyNeeds(n => n.escortId === e.id && ['已分配','服务中'].includes(n.status));
    if (busy.length) throw new Error(`${e.name} 还有 ${busy.length} 条进行中订单，不能删除（可先停用）`);
    e.active = false; e.status = '已停用'; e.deletedAt = this.now(); e.updatedAt = this.now();
    this.save();
    return e;
  },
  submitHospitalApplication(input) {
    const duplicate = this.state.hospitalApplications.find(a => a.patientName === input.patientName && a.hospital.trim() === input.hospital.trim() && a.status === '待审批');
    if (duplicate) return { application:duplicate, duplicate:true };
    const application = { id:this.uid('HA'), status:'待审批', rejectReason:'', time:this.now(), ...input };
    application.patient = application.patientName;
    this.state.hospitalApplications.unshift(application);
    this.state.draft.hospital = application.hospital;
    this.state.draft.dept = application.dept;
    this.state.draft.hospitalApplicationId = application.id;
    this.notify({ recipientRole:'admin', type:'hospital_application', title:`${application.patientName} 申请新增医院：${application.hospital}`, targetType:'hospitalApplication', targetId:application.id, eventKey:'created' });
    this.save();
    return { application, duplicate:false };
  },
  approveHospitalApplication(id) {
    const a = this.state.hospitalApplications.find(x => x.id === id);
    if (!a || a.status !== '待审批') throw new Error('申请已处理或不存在');
    let hospital = this.state.hospitals.find(h => h.name === a.hospital);
    if (!hospital) {
      // 审批通过时创建完整医院记录（含图片字段），避免患者端"特色医院"出现缺字段/空图
      const branches = [{ name:'总院', address:'' }];
      hospital = {
        id:this.uid('H'), name:a.hospital, shortName:'', level:'三甲', category:'综合医院', city:'上海市',
        address:deriveAddress(branches), branches,
        intro:'医院资料正在完善中，管理员可在"医院审批与资料"中补充图片与简介。',
        advantage:'', phone:'', keyDepts:[], specialties:a.dept || '综合',
        orders:0, hot:false, image:'', imageFallback:'', imageUploaded:false,
        source:{ info:'患者申请新增', ranking:'', updated:this.todayISO() },
        active:true, createdAt:this.now(), updatedAt:this.now(),
      };
      this.state.hospitals.push(hospital);
    }
    Object.assign(a, { status:'已通过', handledAt:this.now(), hospitalId:hospital.id });
    if (this.state.draft.hospitalApplicationId === a.id) this.state.draft.hospitalApplicationId = null;
    this.notify({ recipientRole:'patient', type:'hospital_approved', title:`医院申请已通过：${a.hospital}`, targetType:'hospitalApplication', targetId:a.id, eventKey:'approved' });
    this.save();
    return a;
  },
  rejectHospitalApplication(id, reason) {
    const a = this.state.hospitalApplications.find(x => x.id === id);
    if (!a || a.status !== '待审批') throw new Error('申请已处理或不存在');
    if (!String(reason || '').trim()) throw new Error('请填写驳回原因');
    Object.assign(a, { status:'已驳回', rejectReason:String(reason).trim(), handledAt:this.now() });
    this.notify({ recipientRole:'patient', type:'hospital_rejected', title:`医院申请未通过：${a.hospital}（${a.rejectReason}）`, targetType:'hospitalApplication', targetId:a.id, eventKey:'rejected' });
    this.save();
    return a;
  },
  notify(input) {
    const key = `${input.recipientRole}:${input.type}:${input.targetId}:${input.eventKey || ''}`;
    if (this.state.notifications.some(n => n.dedupeKey === key)) return null;
    const item = { id:this.uid('NT'), read:false, time:this.now(), dedupeKey:key, ...input, text:input.title };
    this.state.notifications.unshift(item);
    this.save();
    return item;
  },
  notificationsFor(role) { return this.state.notifications.filter(n => n.recipientRole === role); },
  markNotification(id) { const n=this.state.notifications.find(x=>x.id===id); if(n){n.read=true;this.save();} return n; },
  markAllNotifications(role) { this.notificationsFor(role).forEach(n => n.read=true); this.save(); },
  reportForNeed(needId) { return this.state.escortReports.find(r => r.needId === needId); },
  saveEscortReport(needId, data, publish=false) {
    const need = this.need(needId);
    if (!need || need.status !== '已完成') throw new Error('只有已完成需求可以发布陪诊报告');
    let report = this.reportForNeed(needId);
    if (!report) {
      report = { id:this.uid('ER'), needId, status:'draft', timeline:[], completedItems:[], summary:'', notes:'', images:[], plainExplanation:'', updatedAt:this.now() };
      this.state.escortReports.unshift(report);
    }
    Object.assign(report, data, { updatedAt:this.now() });
    report.plainExplanation = report.plainExplanation || this.makePlainExplanation(report);
    if (publish) {
      if (!report.summary.trim()) throw new Error('请填写陪诊总结后再发布');
      report.status = 'published'; report.publishedAt = this.now(); need.escortReportId = report.id;
      this.notify({ recipientRole:'patient', type:'report_published', title:'新的陪诊报告已发布', targetType:'need', targetId:needId, eventKey:report.updatedAt });
    }
    this.save();
    return report;
  },
  makePlainExplanation(report) {
    const base = report.summary ? `本次陪诊：${report.summary}` : '本次陪诊已完成。';
    return `${base}${report.notes ? ` 接下来请注意：${report.notes}` : ''}`;
  },
  maskId(value) {
    const s = String(value || '');
    return s.length >= 10 ? s.slice(0,3) + '***********' + s.slice(-4) : s || '未识别';
  },
};

const MediaService = {
  allowed: ['image/jpeg','image/png','image/webp'],
  async process(file, { maxBytes=10*1024*1024, targetBytes=800*1024, maxEdge=1600 }={}) {
    if (!file || !this.allowed.includes(file.type)) throw new Error('仅支持 JPEG、PNG 或 WebP 图片');
    if (file.size > maxBytes) throw new Error(`单张原图不能超过 ${Math.round(maxBytes / 1024 / 1024)}MB`);
    const source = await this.read(file);
    if (file.size <= targetBytes && file.type !== 'image/png') return { name:file.name, type:file.type, size:file.size, dataUrl:source };
    const img = await this.image(source);
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale)); canvas.height = Math.max(1, Math.round(img.height * scale));
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    let quality = .82, dataUrl = canvas.toDataURL('image/jpeg', quality);
    while (dataUrl.length * .75 > targetBytes && quality > .42) { quality -= .1; dataUrl = canvas.toDataURL('image/jpeg', quality); }
    return { name:file.name.replace(/\.[^.]+$/, '') + '.jpg', type:'image/jpeg', size:Math.round(dataUrl.length*.75), dataUrl };
  },
  read(file) { return new Promise((resolve,reject) => { const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=()=>reject(new Error('图片读取失败')); r.readAsDataURL(file); }); },
  image(src) { return new Promise((resolve,reject) => { const i=new Image(); i.onload=()=>resolve(i); i.onerror=()=>reject(new Error('图片解析失败')); i.src=src; }); },
};

const IdentityOcrService = {
  async recognize({ file, side }) {
    if (!file || !['front','back'].includes(side)) return { success:false, side, fields:{}, confidence:0, error:'缺少身份证图片或证件面参数' };
    await new Promise(resolve => setTimeout(resolve, 500));
    const fields = side === 'front'
      ? { name:'王秀兰', idNumber:'110101195801014825', gender:'女', birthDate:'1958-01-01' }
      : { authority:'北京市公安局东城分局', validPeriod:'2018.01.01-2038.01.01' };
    return { success:true, side, fields, confidence:.96, error:null, demo:true };
  },
};

const AiAssistantService = {
  normalizeDate(label) {
    const base = new Date();
    const iso = date => date.toISOString().slice(0,10);
    if (label === '今天') return iso(base);
    if (label === '明天' || label === '后天' || label === '大后天') {
      const offset = label === '明天' ? 1 : label === '后天' ? 2 : 3;
      base.setDate(base.getDate() + offset); return iso(base);
    }
    const week = label.match(/下周([一二三四五六日天])/);
    if (week) {
      const target = {一:1,二:2,三:3,四:4,五:5,六:6,日:0,天:0}[week[1]];
      const days = ((target - base.getDay() + 7) % 7) + 7;
      base.setDate(base.getDate() + days); return iso(base);
    }
    const md = label.match(/(\d{1,2})月(\d{1,2})日/);
    if (md) return `${base.getFullYear()}-${String(md[1]).padStart(2,'0')}-${String(md[2]).padStart(2,'0')}`;
    return label;
  },
  interpret({ text, draft }) {
    const q = String(text || '').trim();
    const fields = {};
    const hospitalAliases = { '协和':'北京协和医院','同仁':'北京同仁医院','北大第一':'北京大学第一医院','北大一院':'北京大学第一医院','301':'中国人民解放军总医院','三零一':'中国人民解放军总医院' };
    Object.entries(hospitalAliases).some(([key,value]) => q.includes(key) && (fields.hospital=value));
    const deptAliases = { '心内':'心内科','心脏':'心内科','神经':'神经内科','脑梗':'神经内科','骨':'骨科','眼':'眼科','糖尿病':'内分泌科','内分泌':'内分泌科' };
    Object.entries(deptAliases).some(([key,value]) => q.includes(key) && (fields.dept=value));
    const date = q.match(/下周[一二三四五六日天]|大后天|后天|明天|今天|\d{1,2}月\d{1,2}[日号]/)?.[0];
    if (date) fields.date = this.normalizeDate(date.replace('号','日'));
    if (/全程|从头到尾/.test(q)) fields.serviceType='全程陪诊';
    else if (/跑腿|代取|代办/.test(q)) fields.serviceType='代办跑腿';
    else if (/复诊|复查/.test(q)) fields.serviceType='陪同复诊';
    else if (/半程|半天/.test(q)) fields.serviceType='半程陪诊';
    const notes=[]; if(/轮椅/.test(q))notes.push('需要轮椅'); if(/耳背|听不清/.test(q))notes.push('老人耳背，请耐心沟通'); if(/搀扶/.test(q))notes.push('需要搀扶');
    if(notes.length) fields.note=notes.join('；');
    // 日期统一为范围语义：识别"尽快""急""1-3天""一周"
    if (/尽快|着急|急|马上/.test(q)) fields.date='尽快';
    else if (/一周|这周|本周/.test(q)) fields.date='一周';
    else if (/1-3|三天|一两天/.test(q)) fields.date='1-3天';
    else if (date) fields.date='1-3天'; // 降级：有具体日期则默认1-3天
    const merged = { ...draft, ...fields };
    const missingFields = ['hospital','dept','date','serviceType'].filter(k => !merged[k]);
    let intent = 'create_need';
    if (/价格|多少钱|收费/.test(q)) intent='price_query';
    else if (/医院介绍|医院怎么样|有哪些医院/.test(q)) intent='hospital_query';
    else if (/进度|到哪一步|什么时候到/.test(q)) intent='progress_query';
    return { intent, fields, missingFields, reply:'' };
  },
};

CareStore.init();
