// ========== 应用主控（登录状态机 + 路由）==========
const App = {
  state: 'patientGuest', // loginSelect | patientLogin | adminLogin | patient | patientGuest | admin
  patientTab: 0,
  adminMenu: 'dashboard',
  isGuest: true, // true = 访客模式，false = 已登录

  init() {
    this.render();
  },

  // ===== 路由渲染 =====
  render() {
    const root = document.getElementById('root');
    document.body.className = this.state;
    if (this.state === 'loginSelect') this.renderLoginSelect(root);
    else if (this.state === 'patientLogin') this.renderPatientLogin(root);
    else if (this.state === 'adminLogin') this.renderAdminLogin(root);
    else if (this.state === 'patient' || this.state === 'patientGuest') this.renderPatientApp(root);
    else if (this.state === 'admin') Admin.render(root);
  },

  // ===== 1. 登录选择页 =====
  renderLoginSelect(root) {
    root.innerHTML = `
      <div class="login-bg">
        <div class="login-wrap">
          <div class="login-brand">
            <div class="lb-logo">护</div>
            <div class="lb-name">护无忧</div>
            <div class="lb-sub">智陪诊全链路平台</div>
          </div>
          <div class="demo-warning" role="alert">
            <strong>仅供功能演示</strong>
            <span>禁止上传真实身份证、病历、检查报告或其他敏感资料</span>
          </div>
          <div class="role-cards">
            <div class="role-card role-card-patient" onclick="App.goPatientLogin()">
              <div class="rc-icon"><svg class="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
              <div class="rc-title">我是患者</div>
              <div class="rc-desc">登录后提交陪诊需求、查看进度、紧急联系</div>
              <div class="rc-arrow"><svg class="icon" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
            </div>
            <div class="role-card role-card-admin" onclick="App.goAdminLogin()">
              <div class="rc-icon"><svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg></div>
              <div class="rc-title">我是管理员</div>
              <div class="rc-desc">登录后台管理需求、陪诊师、医院与数据</div>
              <div class="rc-arrow"><svg class="icon" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
            </div>
          </div>
          <div class="login-foot">© 2026 护无忧 · 智陪诊全链路平台 · v2.0</div>
        </div>
      </div>
    `;
  },

  // ===== 2. 患者登录页 =====
  renderPatientLogin(root) {
    root.innerHTML = `
      <div class="login-bg login-bg-patient">
        <div class="login-back" onclick="App.back()">‹ 返回</div>
        <div class="login-wrap">
          <div class="login-brand">
            <div class="lb-logo">护</div>
            <div class="lb-name">患者登录</div>
            <div class="lb-sub">输入手机号即可使用</div>
          </div>
          <div class="login-form">
            <div class="demo-warning" role="alert">
              <strong>仅供功能演示</strong>
              <span>请使用演示账号及测试图片，禁止填写或上传真实患者资料</span>
            </div>
            <div class="form-group">
              <div class="fg-label">手机号</div>
              <input type="tel" class="fg-input" id="p_phone" placeholder="请输入手机号" value="138 8866 8866" />
            </div>
            <div class="form-group">
              <div class="fg-label">验证码</div>
              <div class="code-row">
                <input type="text" class="fg-input" id="p_code" placeholder="请输入验证码" value="8888" />
                <button class="code-btn" id="p_sendCode" onclick="App.sendCode('p')">获取验证码</button>
              </div>
            </div>
            <button class="btn btn-login" onclick="App.patientLogin()">登 录</button>
            <button class="btn btn-outline" style="margin-top:10px;" onclick="App.patientQuickLogin()">一键演示登录</button>
            <div class="login-tip">
              <div class="ai-icon-sm">智</div>
              <div>登录后可使用智能陪诊助理：说话就能提交需求</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ===== 3. 管理员登录页 =====
  renderAdminLogin(root) {
    root.innerHTML = `
      <div class="login-bg login-bg-admin">
        <div class="login-back" onclick="App.back()">‹ 返回</div>
        <div class="login-wrap">
          <div class="login-brand">
            <div class="lb-logo lb-logo-admin">管</div>
            <div class="lb-name">管理员登录</div>
            <div class="lb-sub">护无忧运营后台</div>
          </div>
          <div class="login-form">
            <div class="demo-warning" role="alert">
              <strong>仅供功能演示</strong>
              <span>本页面不连接生产系统，请勿录入真实患者或业务数据</span>
            </div>
            <div class="form-group">
              <div class="fg-label">账号</div>
              <input type="text" class="fg-input" id="a_account" placeholder="请输入账号" value="admin@huwuyou" />
            </div>
            <div class="form-group">
              <div class="fg-label">密码</div>
              <input type="password" class="fg-input" id="a_pwd" placeholder="请输入密码" value="huwuyou2026" />
            </div>
            <div class="form-group">
              <div class="fg-label">验证码</div>
              <div class="code-row">
                <input type="text" class="fg-input" id="a_code" placeholder="请输入验证码" value="8888" />
                <button class="code-btn" onclick="App.toast('已发送验证码到管理员手机')">获取验证码</button>
              </div>
            </div>
            <button class="btn btn-login btn-login-admin" onclick="App.adminLogin()">登 录</button>
            <button class="btn btn-outline" style="margin-top:10px;" onclick="App.adminQuickLogin()">一键演示登录</button>
            <div class="login-tip">
              <div class="ai-icon-sm">AI</div>
              <div>当前为单浏览器演示环境 · 请勿上传真实敏感资料</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ===== 跳转 =====
  goPatientLogin() { this.state = 'patientLogin'; this.render(); },
  goAdminLogin() { this.state = 'adminLogin'; this.render(); },
  back() { this.state = 'loginSelect'; this.render(); },

  // 验证码倒计时
  sendCode(prefix) {
    const btn = document.getElementById(prefix + '_sendCode');
    if (!btn) return;
    let n = 60;
    btn.disabled = true;
    const tick = () => {
      btn.textContent = n + 's';
      if (n-- <= 0) { btn.disabled = false; btn.textContent = '获取验证码'; return; }
      setTimeout(tick, 1000);
    };
    tick();
    this.toast('验证码已发送（演示验证码：8888）');
  },

  // 患者登录
  patientLogin() {
    const phone = document.getElementById('p_phone').value.trim();
    const code = document.getElementById('p_code').value.trim();
    if (!phone) { this.toast('请输入手机号'); return; }
    if (!code) { this.toast('请输入验证码'); return; }
    if (code !== '8888') { this.toast('验证码错误，演示验证码为 8888'); return; }
    this.isGuest = false;
    this.state = 'patient'; this.patientTab = 0; this.render();
  },
  patientQuickLogin() { this.isGuest = false; this.state = 'patient'; this.patientTab = 0; this.render(); },

  // 管理员登录
  adminLogin() {
    const acc = document.getElementById('a_account').value.trim();
    const pwd = document.getElementById('a_pwd').value.trim();
    const code = document.getElementById('a_code').value.trim();
    if (!acc || !pwd) { this.toast('请输入账号密码'); return; }
    if (code !== '8888') { this.toast('验证码错误，演示验证码为 8888'); return; }
    this.isGuest = false;
    this.state = 'admin'; Admin.currentMenu = 'dashboard'; this.render();
  },
  adminQuickLogin() { this.isGuest = false; this.state = 'admin'; Admin.currentMenu = 'dashboard'; this.render(); },

  // 退出
  logout() {
    if (confirm('确认退出登录？')) {
      this.isGuest = true;
      this.state = 'patientGuest';
      this.patientTab = 0;
      this.render();
    }
  },

  // 登录拦截：访客模式下需要登录才能使用功能
  requireLogin(actionName) {
    if (this.isGuest) {
      this.showLoginModal(actionName || '使用此功能');
      return false;
    }
    return true;
  },

  // 显示登录提示弹窗
  showLoginModal(featureName) {
    const modal = document.createElement('div');
    modal.className = 'login-modal-mask';
    modal.innerHTML = `
      <div class="login-modal">
        <div class="login-modal-icon">🔒</div>
        <div class="login-modal-title">需要登录</div>
        <div class="login-modal-desc">${featureName}需要登录后使用</div>
        <div class="login-modal-btns">
          <button class="btn btn-outline" id="lm_cancel">取消</button>
          <button class="btn" id="lm_login">去登录</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#lm_cancel').onclick = () => modal.remove();
    modal.querySelector('#lm_login').onclick = () => {
      modal.remove();
      this.state = 'loginSelect';
      this.render();
    };
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);
  },

  // ===== 患者端 App（手机壳）=====
  renderPatientApp(root) {
    const isGuest = this.isGuest;
    root.innerHTML = `
      <div id="phone-frame">
        <div id="app">
          <header class="role-bar">
            <div class="role-brand">
              <span class="brand-logo">护</span>
              <div class="brand-text">
                <div class="brand-name">护无忧</div>
                <div class="brand-sub">智陪诊全链路平台</div>
              </div>
            </div>
            ${isGuest
              ? `<button class="role-btn role-btn-login" onclick="App.state='loginSelect';App.render()">登录</button>`
              : `<button class="role-btn" onclick="App.logout()">退出</button>`
            }
          </header>
          <main id="screen" class="screen"></main>
          <nav class="tabbar" id="tabbar"></nav>
          ${isGuest ? '' : `
          <div class="ai-float" id="aiFloat" title="智能陪诊助手">
            <div class="ai-float-ball"><svg class="icon" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg></div>
          </div>
          <div class="ai-panel" id="aiPanel" hidden>
            <div class="ai-panel-head">
              <span>智能陪诊助理</span>
              <button class="ai-close" id="aiClose">×</button>
            </div>
            <div class="ai-panel-body">
              <div class="ai-msg ai-bot">您好，我是智能陪诊助理。您可以直接说"我想约下周二去协和看心内科"，我帮您整理好需求并同步给后台。</div>
            </div>
            <div class="ai-quick">
              <button data-q="我想约下周二去协和看心内科">约下周二去协和看心内科</button>
              <button data-q="我爸65岁高血压想找陪诊">帮我爸找陪诊</button>
              <button data-q="今天陪诊师什么时候到？">今天陪诊师什么时候到？</button>
            </div>
            <div class="ai-input">
              <input type="text" id="aiInput" placeholder="说话或打字，我来帮您整理需求" />
              <button id="aiSend">发送</button>
            </div>
          </div>
          `}
        </div>
      </div>
    `;
    // 绑定 AI（仅登录模式下存在）
    const aiFloat = document.getElementById('aiFloat');
    if (aiFloat) {
      aiFloat.addEventListener('click', () => {
        document.getElementById('aiFloat').hidden = true;
        document.getElementById('aiPanel').hidden = false;
      });
      document.getElementById('aiClose').addEventListener('click', () => {
        document.getElementById('aiPanel').hidden = true;
        document.getElementById('aiFloat').hidden = false;
      });
      document.querySelectorAll('.ai-quick button').forEach(btn => {
        btn.addEventListener('click', () => {
          document.getElementById('aiInput').value = btn.dataset.q;
          this.aiSend();
        });
      });
      document.getElementById('aiSend').addEventListener('click', () => this.aiSend());
      document.getElementById('aiInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') this.aiSend();
      });
    }
    // Tab 栏
    this.renderPatientTabbar();
    this.renderPatientScreen();
  },

  renderPatientTabbar() {
    const tabs = Patient.tabs;
    const tabbar = document.getElementById('tabbar');
    tabbar.innerHTML = tabs.map((t, i) => `
      <button class="${i === this.patientTab ? 'active' : ''}" data-tab="${i}">
        <span class="tab-icon">${t.icon}</span>
        <span>${t.name}</span>
      </button>
    `).join('');
    tabbar.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.patientTab = parseInt(btn.dataset.tab);
        this.renderPatientTabbar();
        this.renderPatientScreen();
      });
    });
  },

  renderPatientScreen() {
    const screen = document.getElementById('screen');
    screen.classList.remove('fade-in'); void screen.offsetWidth; screen.classList.add('fade-in');
    Patient.render(this.patientTab, screen);
  },

  // 外部切换 Tab
  switchTab(tab) {
    this.patientTab = tab;
    if (typeof Patient !== 'undefined') Patient._pageStack = [];
    this.renderPatientTabbar();
    this.renderPatientScreen();
  },

  // ===== AI =====
  openAI() {
    document.getElementById('aiFloat').hidden = true;
    document.getElementById('aiPanel').hidden = false;
  },

  async aiSend() {
    const input = document.getElementById('aiInput');
    const q = input.value.trim();
    if (!q) return;
    const body = document.querySelector('.ai-panel-body');
    body.innerHTML += `<div class="ai-msg ai-user">${this.escape(q)}</div>`;
    input.value = '';
    body.scrollTop = body.scrollHeight;
    // 显示"正在思考..."
    const loadingId = 'loading_' + Date.now();
    body.innerHTML += `<div class="ai-msg ai-bot" id="${loadingId}">正在思考...</div>`;
    body.scrollTop = body.scrollHeight;
    try {
      const reply = await this.aiReply(q);
      document.getElementById(loadingId).remove();
      // 渲染消息，把 markdown 链接 [text](#action) 转成可点击按钮
      const html = this.renderAiMessage(reply);
      body.innerHTML += `<div class="ai-msg ai-bot">${html}</div>`;
      // 绑定链接点击事件
      body.querySelectorAll('a[data-action]').forEach(a => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const action = a.dataset.action;
          if (action === 'goto-upload') {
            // 关闭 AI 面板，跳到"我的需求"Tab
            document.getElementById('aiPanel').hidden = true;
            document.getElementById('aiFloat').hidden = false;
            App.switchTab(1);
          }
        });
      });
      body.scrollTop = body.scrollHeight;
    } catch (e) {
      document.getElementById(loadingId).remove();
      body.innerHTML += `<div class="ai-msg ai-bot">抱歉，AI 暂时不可用，请稍后再试。错误：${this.escape(String(e).slice(0,80))}</div>`;
      body.scrollTop = body.scrollHeight;
    }
  },

  // 渲染 AI 消息：转义 + 换行 + 链接转按钮
  renderAiMessage(text) {
    // 先把 [text](#action) 提取出来，避免被 escape
    const links = [];
    let processed = text.replace(/\[([^\]]+)\]\(#([\w-]+)\)/g, (m, label, action) => {
      links.push({ label, action });
      return '__LINK_' + (links.length - 1) + '__';
    });
    // 转义其余文本
    let html = this.escape(processed);
    // 换行
    html = html.replace(/\n/g, '<br>');
    // 还原链接为按钮样式
    links.forEach((l, i) => {
      html = html.replace('__LINK_' + i + '__', `<a href="#" data-action="${l.action}" class="ai-action-link">${this.escape(l.label)}</a>`);
    });
    return html;
  },

  // 真实调用 DeepSeek API 理解患者需求
  async aiReply(q) {
    // 快捷指令：查今日安排
    if (q.includes('今天') && (q.includes('安排') || q.includes('什么时候') || q.includes('到'))) {
      const t = MockData.patient.todaySchedule;
      if (t.hasService) return '您今天的安排：\n\n• ' + t.hospital + ' · ' + t.dept + '\n• 时间：' + t.time + '\n• 陪诊师：' + t.escort + '（' + t.escortPhone + '）\n• 当前状态：' + t.escortStatus;
      return '今天没有陪诊安排。需要约一个吗？';
    }

    if (!AIConfig.apiKey || !AIConfig.enabled) {
      return this.aiReplyFallback(q);
    }

    const u = MockData.patient.user;
    const med = MockData.patient.medical;
    const systemPrompt = `你是"护无忧"智陪诊平台的 AI 助手，帮患者用自然语言提交陪诊需求。

当前患者信息：
- 姓名：${u.name}
- 性别：${u.gender}，年龄：${u.age}岁
- 既往病史：${med.history}
- 过敏史：${med.allergy}
- 用药：${med.medicine}
- 行动能力：${med.mobility}
- 医保：${med.insurance}
- 联系人：${u.emergencyName}（${u.emergencyPhone}）
- 手机：${u.phone}

可选医院：北京协和医院、北京同仁医院、北京大学第一医院、中国人民解放军总医院
可选科室：心内科、神经内科、骨科、眼科、内分泌科、其他
服务类型：半程陪诊（4小时 ¥298）、全程陪诊（挂号-取药 ¥598）、代办跑腿（代取药 ¥98）、陪同复诊（¥398）

任务：
1. 从用户的话里解析出：医院、科室、日期、服务类型、特殊需求
2. 如果信息齐全，直接返回 JSON 格式（仅 JSON，无其他文字）：
{"action":"create_need","hospital":"...","dept":"...","date":"...","serviceType":"...","note":"...","amount":298}
3. 如果信息不齐全，用自然语言追问缺失的关键信息（医院/科室/日期）
4. 日期用相对描述（如"下周二"、"后天"）即可
5. 不要杜撰用户没说的事实
6. 如果用户问的不是预约陪诊（比如闲聊），正常回答即可，不要强行解析成需求

记住：只返回 JSON 或自然语言对话，不要两者混在一起。`;

    try {
      const resp = await fetch(AIConfig.baseUrl + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + AIConfig.apiKey },
        body: JSON.stringify({
          model: AIConfig.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: q },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        console.error('DeepSeek API error:', resp.status, errText);
        return 'AI 服务暂时异常（' + resp.status + '），请稍后重试，或直接在"我的需求"页填写。';
      }
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '';
      // 尝试从返回内容中提取 JSON（兼容 markdown 代码块包裹）
      const jsonStr = this.extractJSON(content);
      if (jsonStr) {
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.action === 'create_need') {
            return this.createNeedFromAI(parsed, q);
          }
        } catch (e) { /* JSON 解析失败，走下面的逻辑 */ }
      }
      // 非 JSON 或解析失败，原样返回 AI 对话内容
      return content || '我没能理解，请告诉我您想去哪家医院、哪个科室、哪天去？';
    } catch (e) {
      console.error('AI request failed:', e);
      return this.aiReplyFallback(q);
    }
  },

  // AI 解析成功后，自动创建需求
  createNeedFromAI(parsed, originalQuery) {
    const u = MockData.patient.user;
    const med = MockData.patient.medical;
    // 从 PriceTable 读取真实价格
    const amount = PriceTable.getPrice(parsed.serviceType) || 298;
    const req = NeedPool.add({
      patientName: u.name, gender: u.gender, age: u.age, phone: u.phone,
      emergencyName: u.emergencyName, emergencyPhone: u.emergencyPhone,
      history: med.history, allergy: med.allergy, medicine: med.medicine, mobility: med.mobility, insurance: med.insurance,
      hospital: parsed.hospital || '待确认',
      dept: parsed.dept || '待确认',
      date: parsed.date || '待确认',
      serviceType: parsed.serviceType || '半程陪诊',
      amount: amount,
      note: parsed.note ? ('AI解析：' + parsed.note + '（原文：' + originalQuery.slice(0,40) + '）') : ('AI对话解析：' + originalQuery.slice(0,60)),
      status: '待处理',
      idCardFront: null, idCardBack: null, reportFiles: [],
    });
    // 同步通知后台
    NotifyPool.add('新患者 ' + u.name + ' 提交了陪诊需求（' + parsed.hospital + '·' + parsed.dept + '）', 'new_patient');
    // 返回卡片式消息（含上传身份证引导按钮）
    return '已帮您整理好需求并提交：\n\n• 患者：' + u.name + '（' + u.gender + '，' + u.age + '岁）\n• 医院：' + parsed.hospital + ' · ' + parsed.dept + '\n• 时间：' + parsed.date + '\n• 服务：' + parsed.serviceType + '（¥' + amount + '）\n• 编号：' + req.id + '\n\n需求已同步给后台，工作人员将为您匹配陪诊师并对接医院。\n\n为完成实名认证，请上传身份证（正反面）和近期检查报告：\n[立即上传证件](#goto-upload)\n\n您也可以直接去「我的需求」页填写或上传。';
  },

  // 从 AI 返回内容中提取 JSON（兼容 markdown 代码块包裹）
  extractJSON(text) {
    // 1. 尝试从 ```json ... ``` 代码块中提取
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      const s = codeBlockMatch[1].trim();
      if (s.startsWith('{')) return s;
    }
    // 2. 尝试直接匹配 { ... }（贪婪到最后一个 }）
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return text.substring(start, end + 1);
    }
    return null;
  },

  // AI 不可用时的降级：本地口语化智能解析
  aiReplyFallback(q) {
    const parsed = this.parseSpokenNeed(q);
    if (parsed) {
      return this.createNeedFromAI(parsed, q);
    }
    // 无法提取到关键信息，追问
    const missing = [];
    if (!parsed || !parsed.hospital) missing.push('想去哪家医院');
    if (!parsed || !parsed.dept) missing.push('什么科室');
    if (!parsed || !parsed.date) missing.push('哪天去');
    if (missing.length === 3) {
      return '您好，我是智能陪诊助手。请告诉我：\n\n• 想去哪家医院？\n• 什么科室？\n• 哪天去？\n\n您可以直接说，比如"下周二带我妈去协和看心内科，要全程陪"';
    }
    return '好的，我还差几个信息：请告诉我' + missing.join('、') + '？';
  },

  // 口语化需求解析：从自然语言中提取医院/科室/日期/服务类型/特殊需求
  parseSpokenNeed(q) {
    let hospital = null, dept = null, date = null, serviceType = null, note = null;

    // === 医院匹配（支持简称和口语）===
    const hospitalMap = {
      '协和': '北京协和医院',
      '同仁': '北京同仁医院',
      '北大第一': '北京大学第一医院',
      '北大一院': '北京大学第一医院',
      '解放军总医院': '中国人民解放军总医院',
      '301': '中国人民解放军总医院',
      '三零一': '中国人民解放军总医院',
    };
    for (const key in hospitalMap) {
      if (q.includes(key)) { hospital = hospitalMap[key]; break; }
    }

    // === 科室匹配（支持口语化描述）===
    const deptMap = {
      '心内': '心内科', '心脏': '心内科', '心病': '心内科', '心血管': '心内科',
      '神内': '神经内科', '神经': '神经内科', '脑梗': '神经内科', '脑': '神经内科',
      '骨': '骨科', '关节': '骨科', '腰': '骨科', '腿': '骨科', '颈椎': '骨科',
      '眼': '眼科', '视网膜': '眼科', '白内障': '眼科', '青光眼': '眼科',
      '内分泌': '内分泌科', '糖尿病': '内分泌科', '甲状腺': '内分泌科',
      '消化': '其他', '呼吸': '其他', '皮肤': '其他', '泌尿': '其他',
    };
    for (const key in deptMap) {
      if (q.includes(key)) { dept = deptMap[key]; break; }
    }

    // === 日期匹配（支持多种口语表达）===
    const dayMap = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'日':7,'天':7};
    // 下周X
    let m = q.match(/下周[一二三四五六日天](?:|上午|下午)/);
    if (m) { date = m[0]; }
    // 后天/大后天
    if (!date) {
      if (q.includes('大后天')) date = '大后天';
      else if (q.includes('后天')) date = '后天';
      else if (q.includes('明天')) date = '明天';
      else if (q.includes('今天')) date = '今天';
    }
    // X月X号/日
    if (!date) {
      m = q.match(/(\d{1,2})月(\d{1,2})[号日]/);
      if (m) { date = m[1] + '月' + m[2] + '日'; }
    }
    // 周X
    if (!date) {
      m = q.match(/周[一二三四五六日天]/);
      if (m) { date = m[0]; }
    }

    // === 服务类型匹配 ===
    if (q.includes('全程') || q.includes('从头到尾') || q.includes('挂号') && q.includes('取药')) {
      serviceType = '全程陪诊';
    } else if (q.includes('半程') || q.includes('半天')) {
      serviceType = '半程陪诊';
    } else if (q.includes('跑腿') || q.includes('代取') || q.includes('代开药') || q.includes('代买')) {
      serviceType = '代办跑腿';
    } else if (q.includes('复诊') || q.includes('复查')) {
      serviceType = '陪同复诊';
    }

    // === 特殊需求提取 ===
    const needs = [];
    if (q.includes('轮椅')) needs.push('需要轮椅');
    if (q.includes('耳背') || q.includes('听不清') || q.includes('大声')) needs.push('老人耳背，需大声说话');
    if (q.includes('方言') || q.includes('不会普通话')) needs.push('需要会方言的陪诊师');
    if (q.includes('搀扶') || q.includes('扶')) needs.push('需要搀扶');
    if (q.includes('推床') || q.includes('推轮椅')) needs.push('需推轮椅');
    note = needs.length ? needs.join('；') : null;

    // === 判断是否是"想预约陪诊"的意图 ===
    const intentWords = ['陪','约','去','看','陪诊','医院','挂号','看病','就诊','检查','复查','复诊'];
    const hasIntent = intentWords.some(w => q.includes(w));
    if (!hasIntent) return null;

    // 至少要有医院或科室才算能解析
    if (!hospital && !dept) return null;

    // 给默认值
    if (!serviceType) serviceType = '半程陪诊'; // 默认半程
    if (!date) date = '待确认';

    return { action: 'create_need', hospital: hospital || '待确认', dept: dept || '待确认', date, serviceType, note, amount: null };
  },

  toast(msg) {
    let t = document.getElementById('_toast');
    if (!t) {
      t = document.createElement('div');
      t.id = '_toast';
      t.style.cssText = 'position:fixed; left:50%; top:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.85); color:#fff; padding:14px 20px; border-radius:12px; font-size:13px; z-index:9999; max-width:80%; text-align:center; line-height:1.5; white-space:pre-line;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.style.display = 'none', 2500);
  },

  escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());

window.App = App;
