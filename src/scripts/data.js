// ========== 全局需求池（患者端提交 → 后台处理 → 患者端查看进度）==========
// 状态：待处理 → 已分配 → 服务中 → 已完成 / 已取消
const NeedPool = {
  list: [],
  seq: 1,
  add(need) {
    const id = 'N' + String(Date.now()).slice(-6) + this.seq++;
    const now = new Date().toLocaleString('zh-CN', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
    const n = Object.assign({ id, status: '待处理', createTime: now, escortName: null, escortPhone: null, feedback: null, amount: 0 }, need);
    this.list.unshift(n);
    return n;
  },
  getById(id) { return this.list.find(n => n.id === id); },
  update(id, patch) {
    const n = this.getById(id);
    if (n) Object.assign(n, patch);
    return n;
  },
};

// ========== AI 配置 ==========
// 演示版只使用本地状态机；生产环境由后端代理真实模型，浏览器不保存密钥。
const AIConfig = {
  apiKey: '',
  baseUrl: '',
  model: '本地规则状态机',
  enabled: false,
  setKey() {},
};

// ========== 服务价格表（后台可改，患者可见）==========
const PriceTable = {
  items: [
    { id: 'S01', name: '半程陪诊', desc: '4小时陪诊服务，含挂号陪同、排队取药', price: 298, unit: '次' },
    { id: 'S02', name: '全程陪诊', desc: '挂号→就诊→检查→取药全程陪同', price: 598, unit: '次' },
    { id: 'S03', name: '代办跑腿', desc: '代取药、代取报告、代挂号', price: 98, unit: '次' },
    { id: 'S04', name: '陪同复诊', desc: '单次复诊陪诊服务', price: 398, unit: '次' },
  ],
  getPrice(name) { const it = this.items.find(i => i.name === name); return it ? it.price : 298; },
  updatePrice(id, price) { const it = this.items.find(i => i.id === id); if (it) it.price = price; },
};

// ========== 医院申请池（患者提出新医院 → 后台审批）==========
const HospitalApplyPool = {
  list: [
    { id: 'HA01', hospital: '北京大学人民医院', dept: '心内科', patient: '张建国', patientPhone: '139****1122', reason: '想去看心内科，希望平台能对接', status: '待审批', time: '07-15 09:30' },
    { id: 'HA02', hospital: '中国医学科学院肿瘤医院', dept: '肿瘤内科', patient: '陈志强', patientPhone: '137****8899', reason: '需要做肿瘤复查', status: '待审批', time: '07-14 14:20' },
  ],
  add(item) { const n = Object.assign({ id: 'HA' + Date.now().toString().slice(-6), status: '待审批', time: new Date().toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}) }, item); this.list.unshift(n); return n; },
  approve(id, contact, phone) { const n = this.list.find(x => x.id === id); if (n) { n.status = '已通过'; n.contact = contact; n.contactPhone = phone; } },
  reject(id) { const n = this.list.find(x => x.id === id); if (n) n.status = '已驳回'; },
};

// ========== 通知提醒池（后台顶部铃铛）==========
const NotifyPool = {
  list: [
    { id: 'NT01', type: 'new_patient', text: '新患者张建国提交了陪诊需求', time: '07-15 09:30', read: false },
    { id: 'NT02', type: 'hospital_apply', text: '陈志强申请对接中国医学科学院肿瘤医院', time: '07-14 14:20', read: false },
    { id: 'NT03', type: 'need_done', text: '李秀英的需求已完成分配陪诊师', time: '07-14 11:05', read: true },
  ],
  add(text, type = 'info') {
    const n = { id: 'NT' + Date.now().toString().slice(-6), type, text, time: new Date().toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}), read: false };
    this.list.unshift(n);
    return n;
  },
  markAllRead() { this.list.forEach(n => n.read = true); },
  get unread() { return this.list.filter(n => !n.read); },
};

// ========== 模拟数据 ==========
const MockData = {
  // ===== 患者端 =====
  patient: {
    user: {
      name: '王秀兰', avatar: '王', gender: '女', age: 68,
      phone: '138 8866 8866', idMasked: '110***********4825',
      emergencyName: '王明', emergencyRel: '儿子', emergencyPhone: '139****2233',
    },
    medical: {
      history: '高血压（10年）、2型糖尿病（5年）',
      allergy: '青霉素过敏',
      medicine: '氨氯地平 5mg/日、二甲双胍 0.5g/日',
      mobility: '可独立行走，长距离需轮椅',
      insurance: '北京医保（在职）',
    },
    todaySchedule: {
      hasService: true,
      status: '陪诊中', statusType: 'serving', time: '今日 08:30',
      hospital: '北京协和医院', dept: '心内科复诊',
      escort: '李敏', escortAvatar: '李', escortPhone: '138****8888',
      escortStatus: '已到达医院 · 正在排队挂号',
      tip: '今日有雨，陪诊师已带伞，您出门注意防滑',
    },
  },

  // ===== 管理员 =====
  admin: {
    user: { name: '牛管理员', avatar: '牛', role: '超级管理员', account: 'admin@huwuyou' },
  },

  // ===== 陪诊师库 =====
  escorts: [
    { id: 'E01', name: '李敏', avatar: '李', age: 32, gender: '女', phone: '138-8888-0001',
      star: 4.9, orders: 328, status: '服务中', score: 96,
      tags: ['心内科','高血压','糖尿病','老人陪诊','轮椅协助'], region: '东城区',
      joinDate: '2024-03-15', income: 12860, completionRate: 98 },
    { id: 'E02', name: '张芳', avatar: '张', age: 28, gender: '女', phone: '138-8888-0002',
      star: 4.8, orders: 215, status: '空闲', score: 92,
      tags: ['骨科','复诊','儿童陪同'], region: '西城区',
      joinDate: '2024-06-20', income: 9850, completionRate: 96 },
    { id: 'E03', name: '王强', avatar: '王', age: 35, gender: '男', phone: '138-8888-0003',
      star: 4.7, orders: 186, status: '空闲', score: 88,
      tags: ['眼科','代办跑腿','代取药'], region: '朝阳区',
      joinDate: '2024-04-08', income: 8420, completionRate: 94 },
    { id: 'E04', name: '陈静', avatar: '陈', age: 30, gender: '女', phone: '138-8888-0004',
      star: 4.9, orders: 274, status: '空闲', score: 95,
      tags: ['心内科','神经内科','老人陪诊'], region: '东城区',
      joinDate: '2024-02-11', income: 11240, completionRate: 99 },
    { id: 'E05', name: '刘洋', avatar: '刘', age: 27, gender: '男', phone: '138-8888-0005',
      star: 4.6, orders: 132, status: '空闲', score: 85,
      tags: ['骨科','轮椅协助','耳背'], region: '海淀区',
      joinDate: '2024-08-01', income: 6380, completionRate: 92 },
  ],

  // ===== 合作医院（完整数据：用于首页展示、搜索、详情页）=====
  hospitals: HospitalData,

  // ===== 患者档案（除当前登录患者外的其他档案）=====
  patientArchives: [
    { id: 'P01', name: '张建国', gender: '男', age: 72, phone: '139****1122',
      emergencyName: '张伟', emergencyPhone: '138****3344',
      history: '冠心病、高血压', allergy: '无', medicine: '阿司匹林', mobility: '需轮椅', insurance: '北京医保',
      orders: 3, lastService: '07-12', satisfaction: 4.7 },
    { id: 'P02', name: '李秀英', gender: '女', age: 65, phone: '139****5566',
      emergencyName: '李强', emergencyPhone: '138****7788',
      history: '糖尿病、视网膜病变', allergy: '磺胺类', medicine: '胰岛素', mobility: '可独立行走', insurance: '北京医保',
      orders: 5, lastService: '07-10', satisfaction: 4.9 },
    { id: 'P03', name: '陈志强', gender: '男', age: 68, phone: '137****8899',
      emergencyName: '陈静', emergencyPhone: '136****1100',
      history: '脑梗后遗症', allergy: '无', medicine: '阿托伐他汀', mobility: '需轮椅', insurance: '北京医保',
      orders: 2, lastService: '07-08', satisfaction: 4.6 },
    { id: 'P04', name: '刘淑芬', gender: '女', age: 70, phone: '138****2211',
      emergencyName: '刘强', emergencyPhone: '139****3300',
      history: '骨关节炎、高血压', allergy: '青霉素', medicine: '布洛芬', mobility: '可独立行走', insurance: '北京医保',
      orders: 7, lastService: '07-14', satisfaction: 4.8 },
  ],

  // ===== 评价 =====
  reviews: [
    { id: 'R001', patient: '刘淑芬', escort: '李敏', star: 5, time: '07-14',
      text: '李敏非常耐心，全程搀扶我妈，老人很满意。', tags: ['耐心','专业','老人友好'], status: '正常' },
    { id: 'R002', patient: '张建国', escort: '王强', star: 3, time: '07-12',
      text: '态度一般，陪诊师到得有点晚。', tags: ['迟到'], status: '差评待处理' },
    { id: 'R003', patient: '李秀英', escort: '张芳', star: 5, time: '07-10',
      text: '张芳对眼科流程很熟，节省了很多时间。', tags: ['流程熟','效率高'], status: '正常' },
    { id: 'R004', patient: '陈志强', escort: '陈静', star: 4, time: '07-08',
      text: '整体不错，就是等候时间略长。', tags: ['等候长'], status: '正常' },
  ],

  // ===== 风险预警 =====
  alerts: [
    { id: 'A001', level: 'high', type: '超时未签到', desc: '陪诊师李敏 订单N001 已超时15分钟未签到', time: '10分钟前', status: '未处理' },
    { id: 'A002', level: 'medium', type: '差评预警', desc: '订单N003 收到3星差评，建议24小时内回访', time: '1小时前', status: '未处理' },
    { id: 'A003', level: 'low', type: '定位异常', desc: '陪诊师王强 位置偏离预定医院3公里', time: '2小时前', status: '已处理' },
  ],

  // ===== 待处理需求（预置）=====
  initNeeds: [
    { patientName: '张建国', gender: '男', age: 72, phone: '139****1122',
      emergencyName: '张伟', emergencyPhone: '138****3344',
      history: '冠心病、高血压', allergy: '无', medicine: '阿司匹林', mobility: '需轮椅', insurance: '北京医保',
      hospital: '北京协和医院', dept: '心内科', date: '明日', serviceType: '全程陪诊',
      note: '老人耳背，需耐心沟通', status: '待处理', createTime: '07-15 09:24', amount: 598 },
    { patientName: '李秀英', gender: '女', age: 65, phone: '139****5566',
      emergencyName: '李强', emergencyPhone: '138****7788',
      history: '糖尿病、视网膜病变', allergy: '磺胺类', medicine: '胰岛素', mobility: '可独立行走', insurance: '北京医保',
      hospital: '北京同仁医院', dept: '眼科', date: '07-18', serviceType: '半程陪诊',
      note: '视力较差需搀扶', status: '待处理', createTime: '07-15 10:12', amount: 298 },
    // 给患者王秀兰加一条已完成的预置订单，让患者端进度页初始有数据
    { patientName: '王秀兰', gender: '女', age: 68, phone: '138 8866 8866',
      emergencyName: '王强', emergencyPhone: '139****1122',
      history: '高血压、冠心病', allergy: '青霉素', medicine: '降压药', mobility: '可独立行走', insurance: '北京医保',
      hospital: '北京协和医院', dept: '心内科', date: '07-10', serviceType: '全程陪诊',
      note: '老人耳背，需要大声说话', status: '已完成', createTime: '07-08 14:30', amount: 598,
      escortName: '李敏', escortPhone: '137****4488',
      feedback: { star: 5, text: '李敏非常耐心，全程陪同挂号看病取药，老人很满意', tags: ['服务耐心', '专业靠谱'], time: '07-10 16:20' },
    },
  ],

  kpi: {
    todayOrders: 24, weekOrders: 138, pendingNeeds: 6, inService: 8,
    doneRate: 96, complaintRate: 0.8, satisfaction: 4.8, monthRevenue: 86420,
  },
};

MockData.initNeeds.forEach(n => NeedPool.add(n));

// ========== 智能陪诊服务中心：服务分类数据 ==========
// DEPRECATED: 以下 ServiceCategories/ServiceCatalog 为早期设计数据，当前版本未使用，保留备用
const ServiceCategories = [
  {
    id: 'category_1',
    name: '诊前咨询',
    icon: 'service_consult',
    desc: '了解陪诊服务，获取专业建议',
    subtitle: '陪诊咨询 · 代办咨询',
    services: ['service_consultation', 'service_agent']
  },
  {
    id: 'category_2',
    name: '代办服务',
    icon: 'service_agent_cat',
    desc: '足不出户，我们帮你办理医疗事务',
    subtitle: '代取报告 · 代诊咨询',
    services: ['service_report', 'service_proxy']
  },
  {
    id: 'category_3',
    name: '特需服务',
    icon: 'service_special',
    desc: '特殊需求人群的贴心照顾',
    subtitle: '预约车辆 · 轮椅助行',
    services: ['service_vehicle', 'service_wheelchair']
  },
  {
    id: 'category_4',
    name: '特色介绍',
    icon: 'service_featured',
    desc: '优质医疗资源推荐与对接',
    subtitle: '特色医院 · 特色专家',
    services: ['service_hospital', 'service_expert']
  }
];

// ========== 智能陪诊服务中心：8个服务完整内容定义 ==========
const ServiceCatalog = {
  // ===== 诊前咨询 =====
  service_consultation: {
    id: 'service_consultation',
    categoryId: 'category_1',
    name: '陪诊咨询',
    icon: 'service_consultation',
    summary: '帮助患者了解陪诊服务范围与流程',
    detail: {
      inputLabel: '描述您的就医需求',
      inputPlaceholder: '请描述您或家人需要就诊的科室、症状、特殊需求等',
      inputHint: '例如：我母亲68岁，有高血压，想看心内科，需要有人陪同挂号、排队、取药',
      serviceIntro: {
        title: '陪诊服务可以帮您做什么',
        items: [
          '专业陪诊师全程陪同挂号、就诊、检查、取药',
          '代为排队、缴费、取报告，节省您的时间和精力',
          '熟悉医院流程，帮您少走弯路',
          '记录医嘱，回家后也不怕忘记',
          '服务类型：半程陪诊（4小时）、全程陪诊、陪同复诊'
        ]
      },
      suggestions: {
        title: '陪诊建议',
        items: [
          '首次就诊建议选择"全程陪诊"，覆盖挂号到取药全流程',
          '复诊患者可选择"半程陪诊"或"陪同复诊"，更加经济',
          '如有行动不便或听力问题，请在需求中注明，我们将安排有经验的陪诊师'
        ]
      },
      manualBtn: '拨打客服咨询陪诊服务',
      submitBtn: '填写陪诊需求'
    }
  },

  service_agent: {
    id: 'service_agent',
    categoryId: 'category_1',
    name: '代办咨询',
    icon: 'service_agent_talk',
    summary: '帮助患者了解医疗事务代办服务',
    detail: {
      inputLabel: '描述您需要代办的事务',
      inputPlaceholder: '请描述您需要代办的事项，如代取药、代取报告、代挂号等',
      inputHint: '',
      serviceIntro: {
        title: '代办服务可以帮您做什么',
        items: [
          '代取药品：凭处方到医院药房代取药并配送到家',
          '代取报告：代取检查检验报告并拍照/邮寄给您',
          '代挂号：帮您在医院系统预约挂号',
          '代办出入院手续'
        ]
      },
      suggestions: {
        title: '代办建议',
        items: [
          '代取药品需提供有效处方，处方可通过拍照上传',
          '代取报告需提供患者身份信息及取单凭证',
          '部分医院要求本人到场办理的业务暂不支持代办'
        ]
      },
      manualBtn: '拨打客服咨询代办服务',
      submitBtn: '填写代办需求'
    }
  },

  // ===== 代办服务 =====
  service_report: {
    id: 'service_report',
    categoryId: 'category_2',
    name: '代取报告',
    icon: 'service_report',
    summary: '不用亲自跑医院，我们帮您取回检查报告',
    detail: {
      inputLabel: '描述报告领取需求',
      inputPlaceholder: '请说明需要代取哪些报告（如血常规、CT片等）、在哪家医院、何时可以取',
      inputHint: '',
      serviceIntro: {
        title: '代取报告服务说明',
        items: [
          '凭您的取单凭证到医院指定窗口代取',
          '支持代取：化验单、检查报告、影像胶片、病理报告',
          '取到后拍照发送给您，原件可快递到家',
          '代为初步整理报告内容，方便您查看'
        ]
      },
      suggestions: {
        title: '温馨提示',
        items: [
          '请确保报告已出具（通常检查后 1-7 个工作日）',
          '影像胶片（CT/MRI）较大较重，请提前告知',
          '部分医院需本人身份证原件领取，请提前确认'
        ]
      },
      manualBtn: '拨打客服咨询代取报告',
      submitBtn: '填写代取需求'
    }
  },

  service_proxy: {
    id: 'service_proxy',
    categoryId: 'category_2',
    name: '代诊咨询',
    icon: 'service_proxy',
    summary: '无法亲自到院？我们帮您代为就诊',
    detail: {
      inputLabel: '描述您的情况',
      inputPlaceholder: '请说明您为何无法到院、需要看什么科室、主要症状和病史',
      inputHint: '',
      serviceIntro: {
        title: '代诊服务说明',
        items: [
          '陪诊师携带您的病历资料代为就诊',
          '代为向医生描述病情、转达您的问题',
          '记录医生的诊断意见和用药建议',
          '代为取药并将药品和医嘱带给您'
        ]
      },
      suggestions: {
        title: '代诊须知',
        items: [
          '代诊仅适用于复诊、慢性病开药等非急重症场景',
          '首次就诊、急重症、需要体格检查的情况建议本人到场',
          '请准备详细的病情描述和既往病历资料',
          '代诊不构成独立医疗意见，所有方案以医生诊断为准'
        ]
      },
      manualBtn: '拨打客服咨询代诊服务',
      submitBtn: '填写代诊需求'
    }
  },

  // ===== 特需服务 =====
  service_vehicle: {
    id: 'service_vehicle',
    categoryId: 'category_3',
    name: '预约车辆',
    icon: 'service_vehicle',
    summary: '就医出行不便？我们安排车辆接送',
    detail: {
      inputLabel: '描述出行需求',
      inputPlaceholder: '请说明出发地、目的地医院、出行时间、是否需要无障碍车辆',
      inputHint: '',
      serviceIntro: {
        title: '车辆服务说明',
        items: [
          '提供就医专用接送车辆',
          '支持提前预约，准时到达',
          '可选车型：普通轿车、SUV（空间大）、无障碍车辆（轮椅上下）',
          '司机经专业培训，熟悉各大医院路线和停车'
        ]
      },
      suggestions: {
        title: '出行建议',
        items: [
          '建议提前 1-2 天预约，确保车辆可用',
          '如需轮椅上下，请选择"无障碍车辆"',
          '就诊高峰期（周一、节后）建议预留更多路程时间',
          '可同时预约往返接送'
        ]
      },
      manualBtn: '拨打客服预约车辆',
      submitBtn: '填写用车需求'
    }
  },

  service_wheelchair: {
    id: 'service_wheelchair',
    categoryId: 'category_3',
    name: '轮椅助行',
    icon: 'service_wheelchair',
    summary: '行动不便？我们提供轮椅和助行陪伴',
    detail: {
      inputLabel: '描述您的需求',
      inputPlaceholder: '请说明行动能力情况、是否需要轮椅、陪护时长等',
      inputHint: '',
      serviceIntro: {
        title: '轮椅助行服务说明',
        items: [
          '提供手动轮椅/电动轮椅租借服务',
          '陪诊师全程推行轮椅，协助上下车、进出电梯',
          '协助患者完成挂号、就诊、检查、取药全流程',
          '服务时长可选：半天（4小时）或全天（8小时）'
        ]
      },
      suggestions: {
        title: '使用建议',
        items: [
          '请提前告知患者的体重和身高，便于匹配合适的轮椅',
          '如患者完全无法自行站立，建议同时预约无障碍车辆',
          '陪诊师具备基础护理知识，但不提供专业医疗护理',
          '建议家属至少有一人陪同或保持电话畅通'
        ]
      },
      manualBtn: '拨打客服咨询轮椅助行',
      submitBtn: '填写助行需求'
    }
  },

  // ===== 特色介绍 =====
  service_hospital: {
    id: 'service_hospital',
    categoryId: 'category_4',
    name: '特色医院',
    icon: 'service_hospital_feat',
    summary: '发现优质医疗资源，找到最适合您的医院',
    detail: {
      inputLabel: '描述您的疾病方向',
      inputPlaceholder: '请描述您或家人的疾病方向，如心血管、肿瘤、骨科等，我们将推荐合适的医院',
      inputHint: '',
      serviceIntro: {
        title: '特色医院服务说明',
        items: [
          '收录上海及全国优质三甲医院资源',
          '按综合实力、专科特色、中医特色分类展示',
          '每所医院提供地址、特色科室、简介',
          'AI 可根据您的疾病方向智能推荐医院'
        ]
      },
      suggestions: {
        title: '就医建议',
        items: [
          '首诊建议选择综合类三甲医院，便于多科室会诊',
          '已明确诊断的可选择对应的专科医院',
          '慢性病调理可考虑中医类三甲医院',
          '最终就诊医院以实际挂号和医生建议为准'
        ]
      },
      manualBtn: '拨打客服咨询医院选择',
      submitBtn: '选择医院并提交需求'
    }
  },

  service_expert: {
    id: 'service_expert',
    categoryId: 'category_4',
    name: '特色专家',
    icon: 'service_expert',
    summary: '对接优质专家资源，让好医生触手可及',
    detail: {
      inputLabel: '描述疾病情况',
      inputPlaceholder: '请描述疾病类型和就诊需求，我们将推荐相关方向的专家资源',
      inputHint: '',
      serviceIntro: {
        title: '特色专家服务说明',
        items: [
          '展示各医院的优势科室和知名专家方向',
          '按疾病领域分类：心脑血管、肿瘤、骨科、神经等',
          'AI 根据疾病描述智能匹配专家方向',
          '协助预约挂号（需医院平台支持）'
        ]
      },
      suggestions: {
        title: '就诊建议',
        items: [
          '专家门诊通常需提前预约，热门专家号源紧张',
          '建议先看普通门诊完善检查，再根据需要转专家',
          '平台的专家推荐基于公开信息和合作资源，仅供参考',
          '不保证一定能挂到指定专家号'
        ]
      },
      manualBtn: '拨打客服咨询专家推荐',
      submitBtn: '填写就诊需求'
    }
  }
};

// ========== 统一服务流程（3 阶段 7 步，全服务共用）==========
const ServiceFlow = [
  { phase: '服务前', steps: [
    { title: '电话咨询', desc: '提出需求' },
    { title: '解答问题', desc: '' },
    { title: '合理配置', desc: '' },
  ]},
  { phase: '服务中', steps: [
    { title: '提前预备', desc: '按时就位' },
    { title: '安全到达', desc: '' },
    { title: '按需服务', desc: '' },
  ]},
  { phase: '服务后', steps: [
    { title: '服务记录', desc: '电话回访' },
  ]},
];

