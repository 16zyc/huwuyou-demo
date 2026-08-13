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
const CareStore = {
  key: 'huwuyou_store_v1',
  backupKey: 'huwuyou_store_corrupt_backup',
  version: 2,
  state: null,
  clone(value) {
    return JSON.parse(JSON.stringify(value));
  },
  now() {
    return new Date().toLocaleString('zh-CN', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
  },
  uid(prefix) {
    return prefix + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();
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
        identity: { front:null, back:null, fields:{}, status:'unconfirmed' },
        reportImages: [], hospitalApplicationId: null,
      },
      ai: { stage:'idle', messages:[] },
      needs,
      prices: this.clone(PriceTable.items).map(i => ({ ...i, active:true })),
      priceChanges: [],
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
          active:true,
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
      escorts: this.clone(MockData.escorts).map(e => ({ ...e, active: true })),
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
    this.state = loaded && loaded.version === this.version ? this.merge(base, loaded) : base;
    this.bindLegacy();
    this.save();
  },
  merge(base, loaded) {
    return {
      ...base, ...loaded,
      draft: { ...base.draft, ...(loaded.draft || {}), identity:{ ...base.draft.identity, ...(loaded.draft?.identity || {}) } },
      ai: { ...base.ai, ...(loaded.ai || {}) },
      needs: Array.isArray(loaded.needs) ? loaded.needs : base.needs,
      prices: Array.isArray(loaded.prices) ? loaded.prices : base.prices,
      priceChanges: Array.isArray(loaded.priceChanges) ? loaded.priceChanges : [],
      hospitals: Array.isArray(loaded.hospitals) ? loaded.hospitals.map(h => {
        const baseH = base.hospitals.find(b => b.id === h.id);
        return {
          ...h,
          branches: h.branches || baseH?.branches || parseAddress(h.address) || [{ name:'总院', address:h.address || '' }],
          source: h.source || baseH?.source || { info:'', ranking:'', updated:'' },
          advantage: h.advantage || baseH?.advantage || '',
          image: /trae-api-cn\.mchost\.guru/.test(h.image || '') ? (baseH?.image || h.image) : h.image,
          imageFallback: h.imageFallback || baseH?.imageFallback || '',
        };
      }) : base.hospitals,
      hospitalApplications: Array.isArray(loaded.hospitalApplications) ? loaded.hospitalApplications : base.hospitalApplications,
      notifications: Array.isArray(loaded.notifications) ? loaded.notifications : base.notifications,
      escortReports: Array.isArray(loaded.escortReports) ? loaded.escortReports : base.escortReports,
      announcements: Array.isArray(loaded.announcements) ? loaded.announcements : base.announcements,
      escorts: Array.isArray(loaded.escorts) ? loaded.escorts : base.escorts,
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
      hospital = { id:this.uid('H'), name:a.hospital, level:'待完善', address:'', branches:[{ name:'总院', address:'' }], specialties:a.dept || '综合', intro:'医院资料正在完善中', advantage:'', source:{ info:'', ranking:'', updated:'' }, imageFallback:'', phone:'', active:true };
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
    if (file.size > maxBytes) throw new Error('单张原图不能超过 10MB');
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
