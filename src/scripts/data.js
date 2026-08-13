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
  hospitals: [
    // ===== 综合类三甲医院（10家）=====
    {
      id: 'H01', name: '复旦大学附属中山医院', shortName: '中山医院',
      phone: '021-6404-1990', level: '三甲', category: '综合医院', city: '上海市',
      address: '总院：徐汇区枫林路180号；分院：闵行区春申路2768号（闵行分院）',
      intro: '复旦大学附属中山医院是国家卫生健康委员会直属事业单位，是复旦大学附属综合性教学医院。医院开业于1937年，是中国人民创建和管理的最早的大型综合性医院之一，为纪念中国民主革命的先驱孙中山先生而命名。',
      advantage: '以心脏外科、心内科、肾脏病科等国家重点专科见长，器官移植与重症救治能力突出，多学科诊疗体系成熟，就诊动线清晰。',
      keyDepts: ['心脏外科', '心内科', '肾脏病科', '内分泌科', '神经内科', '普外科', '消化科', '胸外科', '呼吸内科', '重症医学科', '器官移植科', '急诊医学科', '神经外科', '骨科', '中西医结合科'],
      orders: 1280, hot: true,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=复旦大学附属中山医院建筑外观，上海三甲综合医院，现代医疗大楼，蓝天背景，专业医疗环境，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H02', name: '上海交通大学医学院附属瑞金医院', shortName: '瑞金医院',
      phone: '021-6437-0045', level: '三甲', category: '综合医院', city: '上海市',
      address: '总院：黄浦区瑞金二路197号；分院：黄浦区徐家汇路573号（卢湾分院）',
      intro: '上海交通大学医学院附属瑞金医院创建于1907年，是一所集医疗、教学、科研为一体的大型综合性三级甲等医院，在血液病、内分泌、消化内科等领域处于国内领先地位。',
      advantage: '血液科、内分泌科、消化内科全国领先，百年名院，疑难重症多学科联合诊疗经验丰富，各科室实力均衡。',
      keyDepts: ['血液科', '内分泌科', '消化内科', '心血管内科', '神经内科', '普外科', '骨科', '泌尿外科', '妇产科', '儿科'],
      orders: 960, hot: true,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海瑞金医院建筑外观，交通大学附属三甲医院，法式古典建筑与现代医疗结合，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H03', name: '复旦大学附属华山医院', shortName: '华山医院',
      phone: '021-5288-9999', level: '三甲', category: '综合医院', city: '上海市',
      address: '总院：静安区乌鲁木齐中路12号；分院：闵行区金光路958号（西院）、宝山区陆翔路108号（北院）',
      intro: '复旦大学附属华山医院始建于1907年，是中国最早创办的综合性医院之一，以神经外科、皮肤科、手外科、感染科等国家临床重点专科闻名。',
      advantage: '神经外科、神经内科、皮肤科享誉全国，专科深度突出，疑难病例会诊能力强，分诊流程清晰高效。',
      keyDepts: ['神经外科', '神经内科', '皮肤科', '手外科', '感染科', '骨科', '普外科', '放射科'],
      orders: 890, hot: true,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海华山医院红会老楼建筑外观，复旦大学附属三甲医院，百年红砖古典建筑，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H04', name: '上海交通大学医学院附属仁济医院', shortName: '仁济医院',
      phone: '021-6838-3390', level: '三甲', category: '综合医院', city: '上海市',
      address: '总院：浦东新区浦建路160号（东院）；分院：黄浦区山东中路145号（西院）',
      intro: '仁济医院建于1844年，是上海最早的西式医院之一，现为上海交通大学医学院附属综合性教学医院，在消化内科、风湿免疫、妇产科等领域具有优势。',
      advantage: '消化内科、风湿免疫科、妇产科优势明显，上海最早的西式医院之一，综合救治能力均衡，就诊环境便捷。',
      keyDepts: ['消化内科', '风湿免疫科', '妇产科', '泌尿外科', '神经外科', '肝脏外科', '头颈外科'],
      orders: 720, hot: true,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海仁济医院建筑外观，百年历史三甲医院，浦东现代医疗大楼，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H05', name: '上海交通大学医学院附属第九人民医院', shortName: '九院',
      phone: '021-6313-0120', level: '三甲', category: '综合医院', city: '上海市',
      address: '总院：黄浦区制造局路639号；分院：浦东新区严桥路350号（浦东分院）',
      intro: '上海交通大学医学院附属第九人民医院是一所以口腔医学、整复外科为特色的三级甲等综合性教学医院，口腔医学和整形外科在全国享有盛誉。',
      advantage: '口腔医学与整复外科全国顶尖，专科特色鲜明，兼顾综合诊疗，口腔与整形患者就诊动线集中。',
      keyDepts: ['口腔医学中心', '整复外科', '骨科', '眼科', '耳鼻喉头颈外科', '普外科', '心内科'],
      orders: 680,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海第九人民医院建筑外观，交大附属三甲医院，现代医疗综合体，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H06', name: '上海市第一人民医院', shortName: '一院',
      phone: '021-6324-0090', level: '三甲', category: '综合医院', city: '上海市',
      address: '总院：虹口区武进路85号（北院）；分院：松江区新松江路650号（南院）',
      intro: '上海市第一人民医院创建于1864年，是一所三级甲等综合性教学医院，以眼科、泌尿外科、心内科为优势学科。',
      advantage: '眼科、泌尿外科、心内科优势突出，建院160余年，南北两院覆盖中心城区与松江，就诊选择灵活。',
      keyDepts: ['眼科', '泌尿外科', '心内科', '呼吸科', '普外科', '妇产科'],
      orders: 580,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海市第一人民医院建筑外观，三甲综合医院，现代医疗建筑，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H07', name: '上海市第六人民医院', shortName: '六院',
      phone: '021-6436-9181', level: '三甲', category: '综合医院', city: '上海市',
      address: '总院：徐汇区宜山路600号；分院：浦东新区南汇新城环湖西三路222号（东院）',
      intro: '上海市第六人民医院创建于1947年，是一所三级甲等综合性教学医院，以骨科、内分泌代谢、心血管、影像医学等国家重点学科著称。',
      advantage: '骨科与内分泌代谢科全国知名，运动损伤、慢性病管理经验丰富，影像诊断设备齐全，检查流程集中。',
      keyDepts: ['骨科', '内分泌代谢科', '心血管内科', '影像医学科', '神经外科', '普外科'],
      orders: 650,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海市第六人民医院建筑外观，三甲综合医院，现代医疗大楼，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H08', name: '上海市第十人民医院', shortName: '十院',
      phone: '021-6630-1030', level: '三甲', category: '综合医院', city: '上海市',
      address: '总院：静安区延长中路301号；分院：杨浦区控江路1665号（控江分院）',
      intro: '上海市第十人民医院（同济大学附属第十人民医院）创建于1910年，是一所三级甲等综合性教学医院，以心内科、骨科、神经外科等为优势学科。',
      advantage: '心内科、骨科、神经外科优势学科，同济大学附属，常见病与疑难病诊疗能力均衡，急诊绿色通道完善。',
      keyDepts: ['心内科', '骨科', '神经外科', '内分泌科', '呼吸科', '普外科'],
      orders: 520,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海市第十人民医院建筑外观，同济大学附属三甲医院，现代医疗大楼，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H09', name: '上海交通大学医学院附属新华医院', shortName: '新华医院',
      phone: '021-2507-6888', level: '三甲', category: '综合医院', city: '上海市',
      address: '总院：杨浦区控江路1665号；分院：崇明区城桥镇南门路25号（崇明分院）',
      intro: '上海交通大学医学院附属新华医院创建于1958年，是一所三级甲等综合性教学医院，以儿科、心血管、医学影像为特色学科。',
      advantage: '儿科与心血管诊疗特色鲜明，儿童专科与成人综合双线并重，适合全家就诊需求。',
      keyDepts: ['儿科', '心血管内科', '医学影像科', '神经内科', '骨科', '普外科'],
      orders: 480,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海新华医院建筑外观，交大附属三甲医院，儿科特色综合医院，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H10', name: '上海市同济医院', shortName: '同济医院',
      phone: '021-6634-7757', level: '三甲', category: '综合医院', city: '上海市',
      address: '总院：普陀区新村路389号；分院：普陀区真南路528号（大华门诊部）',
      intro: '上海市同济医院（同济大学附属同济医院）创建于1991年，是一所三级甲等综合性教学医院，以心内科、骨科、神经外科等为优势学科。',
      advantage: '心内科、骨科、神经外科为优势学科，同济大学附属，就医流程规范，多学科协作顺畅。',
      keyDepts: ['心内科', '骨科', '神经外科', '消化内科', '呼吸科', '普外科'],
      orders: 380,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海市同济医院建筑外观，同济大学附属三甲医院，现代医疗建筑，高清摄影&image_size=landscape_16_9'
    },

    // ===== 专科类三甲医院（9家）=====
    {
      id: 'H11', name: '复旦大学附属肿瘤医院', shortName: '肿瘤医院',
      phone: '021-6417-5590', level: '三甲', category: '专科医院', city: '上海市',
      address: '总院：徐汇区东安路270号；分院：闵行区放鹤路1087号（闵行分院）',
      intro: '复旦大学附属肿瘤医院是一所集医疗、教学、科研、预防为一体的三级甲等肿瘤专科医院，是国家临床医学研究中心。',
      advantage: '专注肿瘤诊疗，肿瘤外科、放疗、化疗全链条覆盖，国家临床医学研究中心，适合已明确肿瘤方向的患者。',
      keyDepts: ['肿瘤外科', '放疗科', '化疗科', '病理科', '肿瘤内科', '头颈外科', '乳腺外科'],
      orders: 520,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=复旦大学附属肿瘤医院建筑外观，三甲肿瘤专科医院，现代医疗建筑，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H12', name: '上海市胸科医院', shortName: '胸科医院',
      phone: '021-6282-1990', level: '三甲', category: '专科医院', city: '上海市',
      address: '总院：徐汇区淮海西路241号；分院：松江区广富林路758号（松江南院）',
      intro: '上海市胸科医院是一所三级甲等胸科专科医院，以心胸外科、心内科、呼吸内科为国家临床重点专科。',
      advantage: '心胸外科、心内科、呼吸内科国家临床重点专科，心肺疾病专病专治，检查与治疗流程集中。',
      keyDepts: ['心胸外科', '心内科', '呼吸内科', '肿瘤科', '纵隔外科'],
      orders: 380,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海市胸科医院建筑外观，三甲胸科专科医院，现代医院大楼，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H13', name: '上海市肺科医院', shortName: '肺科医院',
      phone: '021-6513-5050', level: '三甲', category: '专科医院', city: '上海市',
      address: '总院：杨浦区政民路507号；分院：宝山区盘河路2188号（宝山分院）',
      intro: '上海市肺科医院是一所三级甲等肺科专科医院，以呼吸内科、胸外科、结核病科为国家临床重点专科。',
      advantage: '呼吸内科、胸外科、结核病科国家临床重点专科，肺部疾病诊疗全链条覆盖，就诊动线短。',
      keyDepts: ['呼吸内科', '胸外科', '结核病科', '肿瘤科', '职业病科'],
      orders: 320,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海市肺科医院建筑外观，三甲肺科专科医院，现代医疗大楼，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H14', name: '上海市精神卫生中心', shortName: '精神卫生中心',
      phone: '021-6438-7250', level: '三甲', category: '专科医院', city: '上海市',
      address: '总院：徐汇区宛平南路600号；分院：闵行区沪闵路3210号（闵行分院）',
      intro: '上海市精神卫生中心是一所三级甲等精神专科医院，以精神科、心理科、儿童精神科为国家临床重点专科。',
      advantage: '精神科、心理科国家临床重点专科，覆盖儿童到老年全人群精神心理服务，就诊环境安静私密。',
      keyDepts: ['精神科', '心理科', '儿童精神科', '老年精神科', '成瘾医学科'],
      orders: 280,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海市精神卫生中心建筑外观，三甲精神专科医院，现代医疗建筑，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H15', name: '上海市第一妇婴保健院', shortName: '一妇婴',
      phone: '021-5403-5252', level: '三甲', category: '专科医院', city: '上海市',
      address: '总院：浦东新区高科西路2699号（东院）；分院：静安区长乐路536号（西院）',
      intro: '上海市第一妇婴保健院是一所三级甲等妇产科专科医院，以产科、妇科、计划生育科为国家临床重点专科。',
      advantage: '产科、妇科、计划生育科国家临床重点专科，孕产保健与生殖医学体系完整，东院西院就诊便利。',
      keyDepts: ['产科', '妇科', '计划生育科', '生殖医学科', '乳腺科'],
      orders: 360,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海市第一妇婴保健院建筑外观，三甲妇产科专科医院，现代医疗大楼，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H16', name: '中国福利会国际和平妇幼保健院', shortName: '国妇婴',
      phone: '021-6407-5321', level: '三甲', category: '专科医院', city: '上海市',
      address: '总院：徐汇区衡山路910号；分院：闵行区沪闵路3391号（闵行分院）',
      intro: '中国福利会国际和平妇幼保健院是一所三级甲等妇产科专科医院，由宋庆龄主席创办，以产科、妇科、生殖医学科为特色。',
      advantage: '由宋庆龄主席创办，产科、妇科、生殖医学科为特色，孕产全程管理与辅助生殖经验丰富。',
      keyDepts: ['产科', '妇科', '生殖医学科', '计划生育科', '乳腺外科'],
      orders: 340,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=中国福利会国际和平妇幼保健院建筑外观，三甲妇产科医院，现代医疗建筑，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H17', name: '上海市儿童医院', shortName: '儿童医院',
      phone: '021-6247-3363', level: '三甲', category: '专科医院', city: '上海市',
      address: '总院：静安区北京西路1400弄24号（北京西路院区）；分院：普陀区泸定路355号（泸定路院区）',
      intro: '上海市儿童医院是一所三级甲等儿童专科医院，以儿科各专业、儿童保健、儿童康复为特色。',
      advantage: '儿科各专业齐全，儿童保健与康复特色突出，两院区覆盖中心城区与普陀，儿童就诊环境友好。',
      keyDepts: ['儿内科', '儿外科', '儿童保健科', '儿童康复科', '新生儿科'],
      orders: 420,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海市儿童医院建筑外观，三甲儿童医院，色彩活泼的现代医疗建筑，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H18', name: '复旦大学附属儿科医院', shortName: '复旦儿科',
      phone: '021-6493-2523', level: '三甲', category: '专科医院', city: '上海市',
      address: '总院：闵行区万源路399号；分院：徐汇区医学院路130号（枫林路门诊部）',
      intro: '复旦大学附属儿科医院是国家儿童医学中心，一所三级甲等儿童专科医院，以新生儿科、儿科各专业为特色。',
      advantage: '国家儿童医学中心，新生儿科与儿科各专业实力顶尖，疑难儿科疾病诊治能力全国领先。',
      keyDepts: ['新生儿科', '儿内科', '儿外科', '儿童保健科', '儿童感染科'],
      orders: 560,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=复旦大学附属儿科医院建筑外观，国家儿童医学中心，现代儿童医院建筑，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H19', name: '复旦大学附属眼耳鼻喉科医院', shortName: '五官科医院',
      phone: '021-6437-1716', level: '三甲', category: '专科医院', city: '上海市',
      address: '总院：徐汇区汾阳路83号；分院：闵行区江月路2600号（浦江分院）',
      intro: '复旦大学附属眼耳鼻喉科医院是一所三级甲等眼耳鼻喉专科医院，以眼科、耳鼻喉科、口腔科为国家临床重点专科。',
      advantage: '眼科、耳鼻喉科国家临床重点专科，头颈外科配套完整，五官疾病专病专治，检查设备先进。',
      keyDepts: ['眼科', '耳鼻喉科', '口腔科', '头颈外科', '视光学中心'],
      orders: 320,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=复旦大学附属眼耳鼻喉科医院建筑外观，三甲五官科专科医院，现代医疗大楼，高清摄影&image_size=landscape_16_9'
    },

    // ===== 中医类三甲医院（4家）=====
    {
      id: 'H20', name: '上海中医药大学附属龙华医院', shortName: '龙华医院',
      phone: '021-6432-7129', level: '三甲', category: '中医医院', city: '上海市',
      address: '总院：徐汇区宛平南路725号；分院：上南路1000弄上钢二村45号（浦东分院）',
      intro: '龙华医院创建于1960年，是上海中医药大学附属医院，是中国最早建立的四大中医临床基地之一，以中医肿瘤、中医骨伤、针灸推拿为特色。',
      advantage: '中医肿瘤、中医骨伤、针灸推拿特色鲜明，中国最早的中医临床基地之一，擅长慢病调理与术后调养。',
      keyDepts: ['中医肿瘤科', '中医骨伤科', '针灸推拿科', '中医内科', '中医外科', '中医妇科'],
      orders: 340,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海龙华医院建筑外观，中医三甲医院，传统与现代结合建筑风格，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H21', name: '上海中医药大学附属曙光医院', shortName: '曙光医院',
      phone: '021-5382-3390', level: '三甲', category: '中医医院', city: '上海市',
      address: '总院：浦东新区张衡路528号（东院）；分院：黄浦区普安路185号（西院）',
      intro: '上海中医药大学附属曙光医院创建于1960年，是一所三级甲等中医医院，以中医肝病、中医外科、针灸推拿为特色。',
      advantage: '中医肝病、中医外科特色突出，针灸推拿与中医内科并重，中西结合施治，注重长期调养。',
      keyDepts: ['中医肝病科', '中医外科', '针灸推拿科', '中医内科', '中医妇科'],
      orders: 280,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海曙光医院建筑外观，中医三甲医院，传统风格与现代建筑结合，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H22', name: '上海中医药大学附属岳阳中西医结合医院', shortName: '岳阳医院',
      phone: '021-6516-1782', level: '三甲', category: '中医医院', city: '上海市',
      address: '总院：虹口区甘河路110号；分院：杨浦区营口路588号（东院）',
      intro: '上海中医药大学附属岳阳中西医结合医院创建于1952年，是一所三级甲等中西医结合医院，以针灸推拿、中医康复、中西医结合为特色。',
      advantage: '针灸推拿全国知名，中医康复与中西医结合为特色，花园式就诊环境，适合康复与调理需求。',
      keyDepts: ['针灸推拿科', '中医康复科', '中西医结合科', '中医内科', '中医骨伤科'],
      orders: 260,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海岳阳中西医结合医院建筑外观，三甲中西医结合医院，花园式医疗环境，高清摄影&image_size=landscape_16_9'
    },
    {
      id: 'H23', name: '上海市中医医院', shortName: '市中医',
      phone: '021-6589-3390', level: '三甲', category: '中医医院', city: '上海市',
      address: '总院：静安区芷江中路274号（芷江路院区）；分院：静安区石门一路67弄1号（石门一路门诊部）',
      intro: '上海市中医医院创建于1954年，是一所三级甲等中医医院，以中医内科、中医外科、针灸推拿为特色。',
      advantage: '中医内科、中医外科、针灸推拿特色突出，建院七十余年，膏方调理与常见病中医诊疗经验丰富。',
      keyDepts: ['中医内科', '中医外科', '针灸推拿科', '中医妇科', '中医骨伤科'],
      orders: 220,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=上海市中医医院建筑外观，三甲中医医院，传统中式建筑风格，高清摄影&image_size=landscape_16_9'
    },
  ],

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
// DEPRECATED: 以下 ServiceCategories/ServiceCatalog/FeaturedHospitals 为早期设计数据，当前版本未使用，保留备用
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

// ========== 智能陪诊服务中心：特色医院数据库（21所上海三甲医院）==========
const FeaturedHospitals = [
  // ===== 一、综合类三甲医院 =====
  {
    id: 'FH_001', name: '复旦大学附属中山医院', category: 'comprehensive', categoryLabel: '综合类三甲',
    level: '三甲', address: { main: '上海市徐汇区枫林路180号', branches: [] },
    specialties: ['心血管', '肝肿瘤', '肾脏病', '内分泌'], intro: ''
  },
  {
    id: 'FH_002', name: '上海交通大学医学院附属瑞金医院', category: 'comprehensive', categoryLabel: '综合类三甲',
    level: '三甲', address: { main: '上海市黄浦区瑞金二路197号', branches: [] },
    specialties: ['血液病', '内分泌', '消化', '心血管'], intro: ''
  },
  {
    id: 'FH_003', name: '复旦大学附属华山医院', category: 'comprehensive', categoryLabel: '综合类三甲',
    level: '三甲', address: { main: '上海市静安区乌鲁木齐中路12号', branches: [] },
    specialties: ['神经外科', '皮肤科', '手外科', '感染科'], intro: ''
  },
  {
    id: 'FH_004', name: '上海交通大学医学院附属仁济医院', category: 'comprehensive', categoryLabel: '综合类三甲',
    level: '三甲', address: { main: '上海市黄浦区山东中路145号', branches: [] },
    specialties: ['消化内科', '风湿免疫', '妇产科', '泌尿外科'], intro: ''
  },
  {
    id: 'FH_005', name: '上海交通大学医学院附属第九人民医院', category: 'comprehensive', categoryLabel: '综合类三甲',
    level: '三甲', address: { main: '上海市黄浦区制造局路639号', branches: [] },
    specialties: ['口腔医学', '整形外科', '骨科', '眼科'], intro: ''
  },
  {
    id: 'FH_006', name: '上海市第一人民医院', category: 'comprehensive', categoryLabel: '综合类三甲',
    level: '三甲', address: { main: '上海市虹口区武进路85号', branches: [] },
    specialties: ['眼科', '泌尿外科', '心内科', '呼吸科'], intro: ''
  },
  {
    id: 'FH_007', name: '上海市第六人民医院', category: 'comprehensive', categoryLabel: '综合类三甲',
    level: '三甲', address: { main: '上海市徐汇区宜山路600号', branches: [] },
    specialties: ['骨科', '内分泌代谢', '心血管', '影像医学'], intro: ''
  },
  {
    id: 'FH_008', name: '上海市第十人民医院', category: 'comprehensive', categoryLabel: '综合类三甲',
    level: '三甲', address: { main: '上海市静安区延长中路301号', branches: [] },
    specialties: ['心血管', '消化内科', '肿瘤科', '神经内科'], intro: ''
  },
  {
    id: 'FH_009', name: '上海交通大学医学院附属新华医院', category: 'comprehensive', categoryLabel: '综合类三甲',
    level: '三甲', address: { main: '上海市杨浦区控江路1665号', branches: [] },
    specialties: ['儿科', '心血管', '消化内科', '妇产科'], intro: ''
  },
  {
    id: 'FH_010', name: '上海同济医院', category: 'comprehensive', categoryLabel: '综合类三甲',
    level: '三甲', address: { main: '上海市普陀区新村路389号', branches: [] },
    specialties: ['心血管', '骨科', '神经内科', '精神医学'], intro: ''
  },

  // ===== 二、专科类三甲医院 =====
  {
    id: 'SH_001', name: '复旦大学附属肿瘤医院', category: 'specialist', categoryLabel: '专科类三甲',
    level: '三甲', address: { main: '上海市徐汇区东安路270号', branches: [] },
    specialties: ['肿瘤外科', '放疗科', '化疗科', '病理科'], intro: ''
  },
  {
    id: 'SH_002', name: '上海市胸科医院', category: 'specialist', categoryLabel: '专科类三甲',
    level: '三甲', address: { main: '上海市徐汇区淮海西路241号', branches: [] },
    specialties: ['心胸外科', '心内科', '呼吸内科', '肿瘤科'], intro: ''
  },
  {
    id: 'SH_003', name: '上海市肺科医院', category: 'specialist', categoryLabel: '专科类三甲',
    level: '三甲', address: { main: '上海市杨浦区政民路507号', branches: [] },
    specialties: ['呼吸科', '胸外科', '结核科', '职业病科'], intro: ''
  },
  {
    id: 'SH_004', name: '上海市精神卫生中心', category: 'specialist', categoryLabel: '专科类三甲',
    level: '三甲', address: { main: '上海市徐汇区宛平南路600号', branches: [] },
    specialties: ['精神科', '心理咨询', '睡眠障碍', '老年精神科'], intro: ''
  },
  {
    id: 'SH_005', name: '上海市第一妇婴保健院', category: 'specialist', categoryLabel: '专科类三甲',
    level: '三甲', address: { main: '上海市浦东新区高科西路2699号', branches: [] },
    specialties: ['产科', '妇科', '新生儿科', '辅助生殖'], intro: ''
  },
  {
    id: 'SH_006', name: '上海市儿童医院', category: 'specialist', categoryLabel: '专科类三甲',
    level: '三甲', address: { main: '上海市静安区北京西路1400弄24号', branches: [] },
    specialties: ['儿科综合', '新生儿科', '儿童保健', '小儿外科'], intro: ''
  },
  {
    id: 'SH_007', name: '复旦大学附属眼耳鼻喉科医院', category: 'specialist', categoryLabel: '专科类三甲',
    level: '三甲', address: { main: '上海市徐汇区汾阳路83号', branches: [] },
    specialties: ['眼科', '耳鼻喉科', '头颈外科', '听力障碍'], intro: ''
  },

  // ===== 三、中医类三甲医院 =====
  {
    id: 'ZH_001', name: '上海中医药大学附属龙华医院', category: 'tcm', categoryLabel: '中医类三甲',
    level: '三甲', address: { main: '上海市徐汇区宛平南路725号', branches: [] },
    specialties: ['中医肿瘤', '中医骨伤', '针灸推拿', '中医内科'], intro: ''
  },
  {
    id: 'ZH_002', name: '上海中医药大学附属曙光医院', category: 'tcm', categoryLabel: '中医类三甲',
    level: '三甲', address: { main: '上海市黄浦区普安路185号', branches: [] },
    specialties: ['中医肝病', '中医肾病', '中医妇科', '针灸'], intro: ''
  },
  {
    id: 'ZH_003', name: '上海中医药大学附属岳阳中西医结合医院', category: 'tcm', categoryLabel: '中医类三甲',
    level: '三甲', address: { main: '上海市虹口区甘河路110号', branches: [] },
    specialties: ['中西医结合', '针灸推拿', '中医康复', '中医内科'], intro: ''
  },
  {
    id: 'ZH_004', name: '上海市中医医院', category: 'tcm', categoryLabel: '中医类三甲',
    level: '三甲', address: { main: '上海市静安区芷江中路274号', branches: [] },
    specialties: ['中医内科', '中医外科', '中医儿科', '中医妇科'], intro: ''
  }
];
