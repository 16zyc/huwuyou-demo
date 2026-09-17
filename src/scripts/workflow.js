// ========== 已确认方案 A：患者、AI 与管理端统一工作流 ==========
const WUtil = {
  escape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
  statusClass(status) { return status==='待处理'?'pending':status==='已分配'?'accepted':status==='服务中'?'serving':status==='已取消'?'cancelled':'done'; },
  value(id) { return document.getElementById(id)?.value?.trim() || ''; },
  closeSheet(id) { document.getElementById(id)?.remove(); },
  sheet(id, title, body, actions='') {
    this.closeSheet(id);
    const mask=document.createElement('div'); mask.id=id; mask.className='workflow-sheet-mask';
    mask.innerHTML=`<section class="workflow-sheet" role="dialog" aria-modal="true" aria-labelledby="${id}_title"><header><h2 id="${id}_title">${this.escape(title)}</h2><button class="icon-button" aria-label="关闭" onclick="WUtil.closeSheet('${id}')">×</button></header><div class="workflow-sheet-body">${body}</div>${actions?`<footer>${actions}</footer>`:''}</section>`;
    document.body.appendChild(mask); setTimeout(()=>mask.classList.add('show'),0); return mask;
  },
  imageGrid(images, removeCall='') {
    if (!images?.length) return '<div class="helper-text">暂无图片</div>';
    return `<div class="media-grid">${images.map((img,i)=>`<figure><img src="${img.dataUrl}" alt="${this.escape(img.name)}" loading="lazy" /><figcaption>${this.escape(img.name)}</figcaption>${removeCall?`<button class="media-remove" aria-label="删除 ${this.escape(img.name)}" onclick="${removeCall}(${i})">×</button>`:''}</figure>`).join('')}</div>`;
  },
  // 统一二次确认弹窗（敏感操作：调价 / 删除 / 停用等）
  // opts: { title, desc, rows:[[label,value]], okText, cancelText, danger, onOk }
  confirm(opts) {
    const { title = '请确认操作', desc = '', rows = [], okText = '确认', cancelText = '取消', danger = false, onOk } = opts || {};
    const existing = document.getElementById('confirmDialog');
    if (existing && existing.remove) existing.remove();
    const mask = document.createElement('div');
    mask.id = 'confirmDialog';
    mask.className = 'confirm-mask';
    mask.innerHTML = `
      <div class="confirm-box" role="alertdialog" aria-modal="true" aria-labelledby="confirmTitle">
        <h3 class="confirm-title" id="confirmTitle">${this.escape(title)}</h3>
        ${desc ? `<p class="confirm-desc">${desc}</p>` : ''}
        ${rows.length ? `<dl class="confirm-rows">${rows.map(([k, v]) => `<div><dt>${this.escape(k)}</dt><dd>${this.escape(v)}</dd></div>`).join('')}</dl>` : ''}
        <div class="confirm-actions">
          <button class="btn btn-outline" id="confirmCancel">${this.escape(cancelText)}</button>
          <button class="btn${danger ? ' danger' : ''}" id="confirmOk">${this.escape(okText)}</button>
        </div>
      </div>`;
    document.body.appendChild(mask);
    const close = () => { if (mask.remove) mask.remove(); };
    const cancelBtn = document.getElementById('confirmCancel');
    const okBtn = document.getElementById('confirmOk');
    if (cancelBtn) cancelBtn.onclick = close;
    if (okBtn) okBtn.onclick = () => { close(); if (typeof onOk === 'function') onOk(); };
    if (mask.addEventListener) mask.addEventListener('click', e => { if (e.target === mask) close(); });
    return mask;
  },
};

// ---- 患者端应用外框：通知、AI 抽屉和稳定交互 ----
const _legacyRenderPatientApp = App.renderPatientApp.bind(App);
App.renderPatientApp = function(root) {
  _legacyRenderPatientApp(root);
  const exit=document.querySelector('.role-btn');
  if (exit) {
    const unread=CareStore.notificationsFor('patient').filter(n=>!n.read).length;
    exit.insertAdjacentHTML('beforebegin', `<button class="patient-notify-button" aria-label="患者通知${unread?`，${unread}条未读`:''}" onclick="App.togglePatientNotifications()">${P_ICON.inbox}${unread?`<span>${unread}</span>`:''}</button>`);
  }
  const panel=document.getElementById('aiPanel');
  if (panel) {
    panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','智能陪诊助理');
    panel.innerHTML=`
      <header class="ai-panel-head"><div><strong>智能陪诊助理</strong><span>信息由您确认后才会提交</span></div><button class="icon-button" id="aiClose" aria-label="关闭智能助手">×</button></header>
      <div class="ai-stage" id="aiStage"></div>
      <div class="ai-panel-body" id="aiMessages" aria-live="polite"></div>
      <div class="ai-quick"><button data-q="下周二去协和看心内科，全程陪诊">描述陪诊需求</button><button data-q="服务怎么收费">查看收费</button><button data-q="我的需求进度">查询进度</button></div>
      <div class="ai-input"><label class="sr-only" for="aiInput">输入陪诊需求</label><input id="aiInput" type="text" autocomplete="off" placeholder="例如：下周二去协和看心内科" /><button id="aiSend">发送</button></div>`;
    document.getElementById('aiClose').onclick=()=>App.closeAI();
    document.getElementById('aiSend').onclick=()=>App.aiSend();
    document.getElementById('aiInput').onkeydown=e=>{if(e.key==='Enter')App.aiSend();};
    panel.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{document.getElementById('aiInput').value=b.dataset.q;App.aiSend();});
    App.renderAiConversation();
  }
};

App.closeAI = function() { const panel=document.getElementById('aiPanel'); if(panel)panel.hidden=true; const ball=document.getElementById('aiFloat'); if(ball)ball.hidden=false; if(CareStore.state.ai)CareStore.state.ai.context=null; if(this.state==='patient'&&this.patientTab===1)this.renderPatientScreen(); };
App.openAI = function(context) { const panel=document.getElementById('aiPanel'); if(!panel)return; panel.hidden=false; document.getElementById('aiFloat').hidden=true; if (context) { CareStore.state.ai.context=context; } this.renderAiConversation(); setTimeout(()=>document.getElementById('aiInput')?.focus(),100); };
App.aiAdd = function(role, html, action='') {
  CareStore.state.ai.messages.push({ id:CareStore.uid('AIM'), role, html, action, time:CareStore.now() });
  CareStore.state.ai.messages=CareStore.state.ai.messages.slice(-30); CareStore.save(); this.renderAiConversation();
};
App.aiCard = function(stage) {
  const d=CareStore.draft(), price=PriceTable.items.find(p=>p.name===d.serviceType);
  if(stage==='confirm_details') return `<div class="ai-action-card"><h4>请确认陪诊信息</h4><dl><div><dt>医院</dt><dd>${WUtil.escape(d.hospital)}</dd></div><div><dt>科室</dt><dd>${WUtil.escape(d.dept)}</dd></div><div><dt>日期</dt><dd>${WUtil.escape(d.date)}</dd></div><div><dt>服务</dt><dd>${WUtil.escape(d.serviceType)}</dd></div></dl><div class="ai-card-actions"><button onclick="App.aiAction('confirm-details')">信息正确</button><button class="secondary" onclick="App.aiAction('edit-form')">去表单修改</button></div></div>`;
  if(stage==='upload_identity') return `<div class="ai-action-card"><h4>身份证资料（可稍后补充）</h4><p>仅用于实名认证。演示 OCR 结果仍需您人工确认。</p><div class="ai-card-actions"><button onclick="App.aiAction('goto-identity')">上传身份证</button><button class="secondary" onclick="App.aiAction('skip-identity')">稍后补充</button></div></div>`;
  if(stage==='upload_reports') return `<div class="ai-action-card"><h4>检查报告（可选）</h4><p>可上传近期检查报告，帮助陪诊人员提前了解情况。</p><div class="ai-card-actions"><button onclick="App.aiAction('goto-reports')">上传报告</button><button class="secondary" onclick="App.aiAction('skip-reports')">暂不上传</button></div></div>`;
  if(stage==='final_confirm') return `<div class="ai-action-card price-confirm"><h4>提交前确认</h4><div class="price-line"><span>${WUtil.escape(d.serviceType)}</span><strong>¥${price?.price || 0}<small>/${WUtil.escape(price?.unit||'次')}</small></strong></div><p>提交后后台将收到提醒并安排陪诊师。身份证和医疗图片属于敏感资料。</p><div class="ai-card-actions"><button onclick="App.aiAction('submit')">确认提交</button><button class="secondary" onclick="App.aiAction('edit-form')">返回修改</button></div></div>`;
  return '';
};
App.renderAiConversation = function() {
  const body=document.getElementById('aiMessages'), stage=document.getElementById('aiStage'); if(!body)return;
  const ai=CareStore.state.ai;
  const labels={idle:'开始',collecting:'收集信息',confirm_details:'确认信息',upload_identity:'身份证',upload_reports:'检查报告',final_confirm:'确认提交',submitted:'已提交'};
  stage.innerHTML=`<span>当前步骤</span><strong>${labels[ai.stage]||'开始'}</strong>`;
  const welcomeBase = CareStore.state.ai.context
    ? `您好，您正在了解<strong>${WUtil.escape(CareStore.state.ai.context)}</strong>服务。我会一次只问一个问题，并把内容同步到人工表单。您确认前不会提交。`
    : '您好，我会一次只问一个问题，并把内容同步到人工表单。您确认前不会提交。';
  const welcome=`<div class="ai-msg ai-bot">${welcomeBase}</div>`;
  body.innerHTML=welcome+ai.messages.map(m=>`<div class="ai-msg ${m.role==='user'?'ai-user':'ai-bot'}">${m.role==='user'?WUtil.escape(m.html):m.html}</div>`).join('')+this.aiCard(ai.stage);
  body.querySelectorAll('button').forEach(b=>b.type='button'); body.scrollTop=body.scrollHeight;
};
App.aiSend = function() {
  const input=document.getElementById('aiInput'), q=input?.value.trim(); if(!q)return; input.value='';
  this.aiAdd('user',q);
  const result=AiAssistantService.interpret({ text:q, draft:CareStore.draft(), intent:CareStore.state.ai.stage });
  if(result.intent==='price_query') {
    const lines=PriceTable.items.filter(p=>p.active!==false).map(p=>`${WUtil.escape(p.name)}：¥${p.price}/${WUtil.escape(p.unit)}`).join('<br>');
    const c=Patient.consultSettings();
    const tail=c.phone?`<small>最终费用以提交确认卡为准；疑问可拨打平台咨询电话 <a href="tel:${WUtil.escape(c.tel)}" style="color:var(--accent);">${WUtil.escape(c.phone)}</a>。</small>`:'<small>最终费用以提交确认卡为准。</small>';
    this.aiAdd('bot',`当前公开收费如下：<br>${lines}<br>${tail}`); return;
  }
  if(result.intent==='hospital_query') { this.aiAdd('bot',`当前可选医院：<br>${CareStore.activeHospitals().map(h=>`• ${WUtil.escape(h.name)}：${WUtil.escape(h.intro)}`).join('<br>')}`); return; }
  if(result.intent==='progress_query') {
    const list=CareStore.state.needs.filter(n=>n.patientName===MockData.patient.user.name).slice(0,3);
    this.aiAdd('bot',list.length?list.map(n=>`• ${WUtil.escape(n.hospital)} · ${WUtil.escape(n.status)}`).join('<br>'):'您还没有提交过陪诊需求。'); return;
  }
  CareStore.patchDraft(result.fields); CareStore.state.ai.stage=result.missingFields.length?'collecting':'confirm_details'; CareStore.save();
  if(result.missingFields.length) {
    const prompts={hospital:'您想去哪家医院？',dept:'需要看哪个科室？',date:'1-3天内、一周内、还是尽快？',serviceType:'需要半程、全程、复诊还是代办跑腿？'};
    // 模拟思考延迟，展示脉冲动画
    const body=document.getElementById('aiMessages');
    const loadingId='aiLoad_'+Date.now();
    if(body) body.innerHTML+=`<div class="ai-msg ai-bot" id="${loadingId}"><div class="ai-thinking"><span></span><span></span><span></span></div></div>`;
    setTimeout(()=>{
      const el=document.getElementById(loadingId); if(el) el.remove();
      this.aiAdd('bot',`我已经记下部分信息。${prompts[result.missingFields[0]]}`);
    },600);
  } else {
    const body=document.getElementById('aiMessages');
    const loadingId='aiLoad_'+Date.now();
    if(body) body.innerHTML+=`<div class="ai-msg ai-bot" id="${loadingId}"><div class="ai-thinking"><span></span><span></span><span></span></div></div>`;
    setTimeout(()=>{
      const el=document.getElementById(loadingId); if(el) el.remove();
      this.aiAdd('bot','信息已经整理好了，请查看确认卡。');
    },600);
  }
};
App.aiAction = function(action) {
  if(action==='confirm-details'){CareStore.state.ai.stage='upload_identity';CareStore.save();this.renderAiConversation();return;}
  if(action==='skip-identity'){CareStore.state.ai.stage='upload_reports';CareStore.save();this.renderAiConversation();return;}
  if(action==='skip-reports'){CareStore.state.ai.stage='final_confirm';CareStore.save();this.renderAiConversation();return;}
  if(action==='goto-identity'||action==='goto-reports'||action==='edit-form'){
    this.closeAI();
    Patient.navigateTo(el => Patient.renderNeed(el), '我的需求');
    const targetId = action==='goto-reports'?'report_section':action==='goto-identity'?'identity_section':'need_form';
    setTimeout(()=>document.getElementById(targetId)?.scrollIntoView({behavior:'smooth'}), 200);
    return;
  }
  if(action==='submit'){
    try { const need=CareStore.createNeedFromDraft(); CareStore.state.ai.stage='submitted'; CareStore.save(); this.aiAdd('bot',`需求已提交成功，编号 <strong>${WUtil.escape(need.id)}</strong>。后台已收到提醒，您可在“陪诊进度”查看。`); }
    catch(error){this.aiAdd('bot',`暂时不能提交：${WUtil.escape(error.message)}。您可以返回表单修改。`);}
  }
};

App.togglePatientNotifications = function() {
  const existing=document.getElementById('patientNotifyPanel'); if(existing){existing.remove();return;}
  const list=CareStore.notificationsFor('patient');
  const panel=document.createElement('div'); panel.id='patientNotifyPanel'; panel.className='patient-notify-panel';
  panel.innerHTML=`<header><strong>我的提醒</strong><button onclick="App.markAllPatientNotifications()">全部已读</button></header>${list.length?list.map(n=>`<button class="patient-notify-item ${n.read?'':'unread'}" onclick="App.openPatientNotification('${n.id}')"><span>${WUtil.escape(n.title)}</span><small>${WUtil.escape(n.time)}</small></button>`).join(''):'<div class="empty-inline">暂无提醒</div>'}`;
  document.getElementById('app').appendChild(panel);
};
App.markAllPatientNotifications=function(){CareStore.markAllNotifications('patient');this.render();};
App.openPatientNotification=function(id){const n=CareStore.markNotification(id);document.getElementById('patientNotifyPanel')?.remove();if(n?.targetType==='need'&&CareStore.need(n.targetId)){this.switchTab(2);setTimeout(()=>Patient.openNeedDetail(n.targetId),0);}else{this.toast('对应记录不存在或已移除');}};

// ---- 患者端：共享草稿统一表单（人工下单 / 我的需求共用）----
const SERVICE_KEY_TYPE_MAP = {
  consult_diagnosis:'半程陪诊', consult_agent:'全程陪诊',
  agent_report:'代办跑腿', agent_diagnosis:'全程陪诊',
  special_car:'全程陪诊', special_wheelchair:'全程陪诊',
  featured_hospital:'陪同复诊', featured_expert:'全程陪诊',
  special_booking:'半程陪诊',
};
Patient.openNeedForm = function(keyOrType, extra) {
  if (!App.requireLogin('填写需求')) return;
  const patch = {};
  if (typeof keyOrType === 'string' && SERVICE_KEY_TYPE_MAP[keyOrType]) patch.serviceType = SERVICE_KEY_TYPE_MAP[keyOrType];
  Object.assign(patch, extra || {});
  CareStore.patchDraft(patch);
  Patient.navigateTo(el => Patient.renderNeed(el), '我的需求');
};
Patient.renderNeed = function(el) {
  const d=CareStore.draft();
  const hospitals=CareStore.activeHospitals();
  const mobilityOptions=['可独立行走','需拐杖','需轮椅','需搀扶'];
  const mobilityList = d.mobility && !mobilityOptions.includes(d.mobility) ? [d.mobility, ...mobilityOptions] : mobilityOptions;
  el.innerHTML=`<div class="svd-header"><div class="svd-back" onclick="Patient.goBack()" aria-label="返回">${P_ICON.chevronLeft}</div><h2>我的需求</h2></div>
    <div id="need_form" class="page-head"><h2>填写需求</h2><div>AI 帮填和自己填写会实时同步，不会重复填写</div></div>
    <div class="path-switch" role="group" aria-label="需求填写方式"><button class="active" aria-pressed="true">自己填写</button><button onclick="App.openAI()">AI 帮我填写</button></div>
    <div class="draft-status">草稿已自动保存到本机浏览器</div>
    <section class="card"><div class="card-title">${P_ICON.user} 就诊人</div>
      <div class="form-grid-2">
        <div><label class="field-label" for="req_name">姓名 <em>*</em></label><input class="fg-input draft-field" id="req_name" data-draft="patientName" value="${WUtil.escape(d.patientName)}" placeholder="患者姓名" /></div>
        <div><div class="field-label">性别 <em>*</em></div><div class="gender-row"><label><input type="radio" name="req_gender" class="draft-field" data-draft="gender" value="男" ${d.gender==='男'?'checked':''} /> 男</label><label><input type="radio" name="req_gender" class="draft-field" data-draft="gender" value="女" ${d.gender==='女'?'checked':''} /> 女</label></div></div>
        <div><label class="field-label" for="req_age">年龄 <em>*</em></label><input class="fg-input draft-field" id="req_age" data-draft="age" type="number" min="0" max="120" value="${WUtil.escape(d.age)}" placeholder="0-120" /></div>
        <div><label class="field-label" for="req_phone">联系电话 <em>*</em></label><input class="fg-input draft-field" id="req_phone" data-draft="phone" type="tel" value="${WUtil.escape(d.phone)}" placeholder="11位手机号" /></div>
        <div class="form-grid-full"><label class="field-label" for="req_history">病史信息</label><textarea class="fg-input draft-field" id="req_history" data-draft="history" rows="2" placeholder="例如：高血压、糖尿病">${WUtil.escape(d.history)}</textarea></div>
        <div><label class="field-label" for="req_allergy">过敏史</label><input class="fg-input draft-field" id="req_allergy" data-draft="allergy" value="${WUtil.escape(d.allergy)}" placeholder="例如：青霉素过敏" /></div>
        <div><label class="field-label" for="req_medicine">用药情况</label><input class="fg-input draft-field" id="req_medicine" data-draft="medicine" value="${WUtil.escape(d.medicine)}" placeholder="例如：降压药" /></div>
        <div><label class="field-label" for="req_mobility">行动能力</label><select class="fg-select draft-field" id="req_mobility" data-draft="mobility"><option value="">请选择</option>${mobilityList.map(o=>`<option ${d.mobility===o?'selected':''}>${WUtil.escape(o)}</option>`).join('')}</select></div>
        <div><label class="field-label" for="req_emergencyName">紧急联系人</label><input class="fg-input draft-field" id="req_emergencyName" data-draft="emergencyName" value="${WUtil.escape(d.emergencyName)}" placeholder="联系人姓名" /></div>
        <div><label class="field-label" for="req_emergencyPhone">联系人电话</label><input class="fg-input draft-field" id="req_emergencyPhone" data-draft="emergencyPhone" type="tel" value="${WUtil.escape(d.emergencyPhone)}" placeholder="联系人电话" /></div>
      </div>
    </section>
    <section class="card"><div class="card-title">${P_ICON.clipboard} 就诊与服务</div>
      <label class="field-label" for="req_hospital">希望就诊医院 <em>*</em></label><select class="fg-select draft-field" id="req_hospital" data-draft="hospital"><option value="">请选择医院</option>${hospitals.map(h=>`<option ${d.hospital===h.name?'selected':''}>${WUtil.escape(h.name)}</option>`).join('')}</select><button class="text-action" onclick="Patient.navigateTo(el => Patient.renderHospitals(el), '医院介绍')">列表里没有？申请新医院</button>
      <label class="field-label" for="req_dept">就诊科室 <em>*</em></label><input class="fg-input draft-field" id="req_dept" data-draft="dept" value="${WUtil.escape(d.dept)}" placeholder="例如：心内科" />
      <div class="field-label">期望时间范围 <em>*</em></div><div class="bf-time-group" style="display:flex;gap:8px;">${['1-3天','一周','尽快'].map(r=>`<div class="bf-time-opt ${d.date===r?'active':''}" data-range="${r}" onclick="CareStore.patchDraft({date:this.dataset.range});this.parentNode.querySelectorAll('.bf-time-opt').forEach(o=>o.classList.remove('active'));this.classList.add('active')">${r==='1-3天'?'1-3天内':r==='一周'?'一周内':'尽快'}</div>`).join('')}</div>
      <div class="field-label">服务类型 <em>*</em></div><div class="service-choice">${PriceTable.items.filter(p=>p.active!==false&&p.group!=='expert').map(p=>`<button class="${d.serviceType===p.name?'selected':''}" data-service="${WUtil.escape(p.name)}"><span>${WUtil.escape(p.name)}</span><strong>¥${p.price}<small>/${WUtil.escape(p.unit)}</small></strong><small>${WUtil.escape(p.desc)}</small></button>`).join('')}</div>
      <div class="field-label">专家预约</div><div class="expert-choice">${PriceTable.items.filter(p=>p.active!==false&&p.group==='expert').map(p=>`<button class="${d.serviceType===p.name?'selected':''}" data-service="${WUtil.escape(p.name)}" title="${WUtil.escape(p.desc)}"><span>${WUtil.escape(p.name)}</span><strong>¥${p.price}<small>/${WUtil.escape(p.unit)}</small></strong><small>${WUtil.escape(p.desc)}</small></button>`).join('')}</div>
      <div class="helper-text" style="margin-top:6px;">专家号源有限，建议提前预约；价格为平台公示价，以提交确认卡为准。</div>
      <label class="field-label" for="req_note">特殊照护需求</label><textarea class="fg-input draft-field" id="req_note" data-draft="note" rows="3" placeholder="例如：需要轮椅、老人耳背">${WUtil.escape(d.note)}</textarea>
    </section>
    <section class="card" id="identity_section"><div class="card-title">${P_ICON.card} 身份证资料 <span class="optional-tag">可后补</span></div><p class="privacy-note">仅用于实名认证。本原型数据保存在当前浏览器，请勿上传真实敏感证件。</p><div id="identityArea">${Patient.renderIdentityArea()}</div></section>
    <section class="card" id="report_section"><div class="card-title">${P_ICON.image} 检查报告 <span class="optional-tag">可选</span></div><p class="helper-text">JPEG、PNG、WebP，最多 6 张；原图单张不超过 10MB。</p><div id="reportArea">${Patient.renderReportArea()}</div></section>
    <section class="card final-preview"><div class="card-title">费用确认</div><div class="price-line"><span id="finalService">${WUtil.escape(d.serviceType)}</span><strong id="finalPrice">¥${PriceTable.getPrice(d.serviceType)}</strong></div><p>提交后管理员会收到新需求提醒。身份证和检查资料可稍后继续补充。</p><button class="btn" onclick="Patient.openFinalConfirm()">核对并提交需求</button></section>`;
  el.querySelectorAll('.draft-field').forEach(f=>f.addEventListener('change',()=>CareStore.patchDraft({[f.dataset.draft]:f.value.trim()})));
  el.querySelectorAll('[data-service]').forEach(b=>b.onclick=()=>{CareStore.patchDraft({serviceType:b.dataset.service});Patient.renderNeed(el);});
};
Patient.renderIdentityArea = function() {
  const identity=CareStore.draft().identity;
  const side=(key,label)=>{const img=identity[key];return `<div class="identity-side"><div class="identity-preview">${img?`<img src="${img.dataUrl}" alt="身份证${label}" />`:`${P_ICON.card}<span>${label}</span>`}</div><input hidden type="file" id="id_${key}" accept="image/jpeg,image/png,image/webp" capture="environment" onchange="Patient.uploadIdentity('${key}',this)" /><button class="btn btn-outline btn-sm" onclick="document.getElementById('id_${key}').click()">${img?'重新上传':'上传'+label}</button>${img?`<button class="text-danger" onclick="Patient.removeIdentity('${key}')">删除</button><button class="btn btn-outline btn-sm" onclick="Patient.runOcr('${key}')">演示 OCR</button>`:''}</div>`};
  const f=identity.fields||{};
  return `<div class="identity-grid">${side('front','人像面')}${side('back','国徽面')}</div>${Object.keys(f).length?`<div class="ocr-result"><div class="ocr-demo-label">演示识别结果 · 请人工核对</div><label>姓名<input id="ocr_name" value="${WUtil.escape(f.name)}" /></label><label>身份证号<input id="ocr_number" value="${WUtil.escape(f.idNumber)}" /></label><label>性别<input id="ocr_gender" value="${WUtil.escape(f.gender)}" /></label><label>出生日期<input id="ocr_birth" value="${WUtil.escape(f.birthDate)}" /></label><button class="btn btn-sm" onclick="Patient.confirmIdentity()">确认识别信息</button><span class="identity-status">${identity.status==='confirmed'?'已确认':'待确认'}</span></div>`:''}`;
};
Patient.uploadIdentity=async function(side,input){const file=input.files?.[0];if(!file)return;try{this.toast('正在压缩图片…');const item=await MediaService.process(file);const identity=CareStore.draft().identity;CareStore.patchDraft({identity:{...identity,[side]:item,status:'unconfirmed'}});document.getElementById('identityArea').innerHTML=this.renderIdentityArea();}catch(e){this.toast(e.message);}input.value='';};
Patient.removeIdentity=function(side){const identity=CareStore.draft().identity;CareStore.patchDraft({identity:{...identity,[side]:null,status:'unconfirmed'}});document.getElementById('identityArea').innerHTML=this.renderIdentityArea();};
Patient.runOcr=async function(side){const identity=CareStore.draft().identity;if(!identity[side])return this.toast('请先上传图片');this.toast('正在进行演示识别…');const result=await IdentityOcrService.recognize({file:identity[side],side});if(!result.success)return this.toast(result.error);CareStore.patchDraft({identity:{...identity,fields:{...(identity.fields||{}),...result.fields},status:'unconfirmed'}});document.getElementById('identityArea').innerHTML=this.renderIdentityArea();this.toast('演示识别完成，请核对并确认');};
Patient.confirmIdentity=function(){const identity=CareStore.draft().identity;const fields={...(identity.fields||{}),name:WUtil.value('ocr_name'),idNumber:WUtil.value('ocr_number'),gender:WUtil.value('ocr_gender'),birthDate:WUtil.value('ocr_birth')};if(!fields.name||!/^[0-9Xx]{18}$/.test(fields.idNumber||''))return this.toast('请核对姓名和18位身份证号');CareStore.patchDraft({identity:{...identity,fields,status:'confirmed'}});document.getElementById('identityArea').innerHTML=this.renderIdentityArea();this.toast('身份证信息已确认');};
Patient.renderReportArea=function(){const imgs=CareStore.draft().reportImages||[];return `${WUtil.imageGrid(imgs,'Patient.removeReportImage')}<input hidden type="file" id="report_input_v2" accept="image/jpeg,image/png,image/webp" multiple onchange="Patient.uploadReportImages(this)" /><button class="btn btn-outline" ${imgs.length>=6?'disabled':''} onclick="document.getElementById('report_input_v2').click()">${imgs.length?'继续添加':'上传检查报告'}（${imgs.length}/6）</button>`;};
Patient.uploadReportImages=async function(input){const existing=[...(CareStore.draft().reportImages||[])],files=[...(input.files||[])];if(existing.length+files.length>6){this.toast('检查报告最多上传 6 张');input.value='';return;}for(const file of files){try{existing.push(await MediaService.process(file));}catch(e){this.toast(`${file.name}：${e.message}`);}}CareStore.patchDraft({reportImages:existing});document.getElementById('reportArea').innerHTML=this.renderReportArea();input.value='';};
Patient.removeReportImage=function(i){const imgs=[...(CareStore.draft().reportImages||[])];imgs.splice(i,1);CareStore.patchDraft({reportImages:imgs});document.getElementById('reportArea').innerHTML=this.renderReportArea();};
Patient.openFinalConfirm=function(){document.querySelectorAll('.draft-field').forEach(f=>{if(f.type==='radio'&&!f.checked)return;CareStore.patchDraft({[f.dataset.draft]:f.value.trim()});});const d=CareStore.draft(),p=PriceTable.items.find(x=>x.name===d.serviceType);if(!String(d.patientName||'').trim()){this.toast('请填写患者姓名');document.getElementById('req_name')?.focus();return;}const age=Number(d.age);if(d.age===''||d.age==null||!Number.isFinite(age)||age<0||age>120){this.toast('请填写正确的年龄（0-120）');document.getElementById('req_age')?.focus();return;}const phone=String(d.phone||'').replace(/\s/g,'');if(!/^1\d{10}$/.test(phone)){this.toast('请填写正确的11位手机号');document.getElementById('req_phone')?.focus();return;}const missing=[['hospital','医院'],['dept','科室'],['date','日期']].filter(([k])=>!d[k]);if(missing.length){this.toast(`请补充：${missing.map(x=>x[1]).join('、')}`);document.getElementById('req_'+missing[0][0])?.focus();return;}WUtil.sheet('finalConfirmSheet','确认并提交',`<dl class="confirm-list"><div><dt>医院</dt><dd>${WUtil.escape(d.hospital)}</dd></div><div><dt>科室</dt><dd>${WUtil.escape(d.dept)}</dd></div><div><dt>日期</dt><dd>${WUtil.escape(d.date)}</dd></div><div><dt>服务</dt><dd>${WUtil.escape(d.serviceType)}</dd></div></dl><div class="confirm-total"><span>服务费用</span><strong>¥${p.price}<small>/${WUtil.escape(p.unit)}</small></strong></div><label class="consent-row"><input type="checkbox" id="privacyConsent" /> 我已核对信息，并了解敏感资料用途</label>`,`<button class="btn btn-outline" onclick="WUtil.closeSheet('finalConfirmSheet')">返回修改</button><button class="btn" onclick="Patient.submitConfirmedNeed()">确认提交</button>`);};
Patient.submitConfirmedNeed=function(){if(!document.getElementById('privacyConsent')?.checked)return this.toast('请先勾选信息确认与资料用途说明');try{const need=CareStore.createNeedFromDraft();WUtil.closeSheet('finalConfirmSheet');this.toast(`需求已提交，编号 ${need.id}`);setTimeout(()=>App.switchTab(2),700);}catch(e){this.toast(e.message);}};

Patient.renderProgress=function(el){const needs=CareStore.state.needs.filter(n=>n.patientName===MockData.patient.user.name);const flow=['待处理','已分配','服务中','已完成'];el.innerHTML=`<div class="page-head"><h2>陪诊进度</h2><div>关键状态变化会在顶部提醒您</div></div>${needs.length?needs.map(n=>{const idx=Math.max(0,flow.indexOf(n.status));return `<button class="need-card card" onclick="Patient.openNeedDetail('${n.id}')"><div><span class="status-badge ${WUtil.statusClass(n.status)}">${n.status}</span><small>${WUtil.escape(n.id)}</small></div><h3>${WUtil.escape(n.hospital)}</h3><p>${WUtil.escape(n.dept)} · ${WUtil.escape(n.date)} · ¥${n.serviceSnapshot?.price||n.amount}</p><div class="step-bar">${flow.map((s,i)=>`<span class="step ${i<idx?'done':''} ${i===idx?'active':''}"></span>`).join('')}</div>${n.escortName?`<span class="progress-escort-line">陪诊师：${WUtil.escape(n.escortName)} · ${WUtil.escape(n.escortPhone||'')}</span>`:`<span class="progress-escort-line pending">未接单 · 等待平台匹配</span>`}${n.escortReportId?'<strong class="report-ready">陪诊报告已发布 · 点击查看</strong>':''}</button>`;}).join(''):`<div class="empty"><div class="em-icon">${P_ICON.inbox}</div><p>暂无需求</p><button class="btn btn-sm" onclick="Patient.openNeedForm(null)">提交需求</button></div>`}`;};
Patient.openNeedDetail=function(id){const n=CareStore.need(id);if(!n)return this.toast('需求不存在');const r=CareStore.reportForNeed(id);const identity=n.identity||{};const reportHtml=r?.status==='published'?`<section class="card escort-report"><div class="card-title">${P_ICON.clipboard} 陪诊报告</div><div class="report-published">发布于 ${WUtil.escape(r.publishedAt)}</div><h4>服务时间线</h4><ol>${(r.timeline||[]).map(x=>`<li><time>${WUtil.escape(x.time)}</time><span>${WUtil.escape(x.text)}</span></li>`).join('')}</ol><h4>已办事项</h4><div class="report-tags">${(r.completedItems||[]).map(x=>`<span>${WUtil.escape(x)}</span>`).join('')}</div><h4>陪诊总结</h4><p>${WUtil.escape(r.summary)}</p><h4>注意事项</h4><p>${WUtil.escape(r.notes||'无')}</p>${WUtil.imageGrid(r.images)}<div class="plain-explanation"><strong>通俗说明</strong><p>${WUtil.escape(r.plainExplanation)}</p><small>仅作信息整理，以医生意见为准。</small></div></section>`:n.status==='已完成'?'<section class="card"><div class="card-title">陪诊报告</div><p class="helper-text">服务已完成，工作人员正在整理报告。</p></section>':'';document.getElementById('screen').innerHTML=`<div class="order-page"><div class="order-header"><button class="icon-button" onclick="Patient.goBack()" aria-label="返回">${P_ICON.chevronLeft}</button><h2>需求详情</h2></div><section class="card"><span class="status-badge ${WUtil.statusClass(n.status)}">${n.status}</span><div class="summary-grid"><div><span>医院</span><strong>${WUtil.escape(n.hospital)}</strong></div><div><span>科室</span><strong>${WUtil.escape(n.dept)}</strong></div><div><span>日期</span><strong>${WUtil.escape(n.date)}</strong></div><div><span>费用</span><strong>¥${n.serviceSnapshot?.price||n.amount}</strong></div></div></section>${n.escortName?`<section class="card"><div class="card-title">${P_ICON.user} 陪诊师</div><p>${WUtil.escape(n.escortName)} · ${n.escortPhone?`<a href="tel:${WUtil.escape(n.escortPhone)}" style="color:var(--accent); text-decoration:none;">${WUtil.escape(n.escortPhone)}</a>`:''}</p></section>`:''}<section class="card"><div class="card-title">资料状态</div><p>身份证：${identity.front||identity.back?(identity.status==='confirmed'?'已上传并确认':'已上传，待确认'):'未上传'}</p><p>检查报告：${n.reportImages?.length||0} 张</p></section>${reportHtml}</div>`;};

Patient._showApplyForm = false;
Patient.toggleHospitalApply = function() {
  this._showApplyForm = !this._showApplyForm;
  this.renderHospitals(document.getElementById('screen'));
};
Patient._renderHospitalApplyForm=function(){return `<section class="card"><div class="card-title">申请新增医院</div><label class="field-label" for="apply_hospital">医院全称 <em>*</em></label><input id="apply_hospital" class="fg-input" /><label class="field-label" for="apply_dept">科室 <em>*</em></label><input id="apply_dept" class="fg-input" /><label class="field-label" for="apply_reason">申请原因 <em>*</em></label><textarea id="apply_reason" class="fg-input" rows="3"></textarea><button class="btn" onclick="Patient.submitHospitalApply()">提交后台审批</button></section>`;};
Patient.submitHospitalApply=function(){const hospital=WUtil.value('apply_hospital'),dept=WUtil.value('apply_dept'),reason=WUtil.value('apply_reason');if(!hospital||!dept||!reason)return this.toast('请完整填写医院、科室和申请原因');const r=CareStore.submitHospitalApplication({hospital,dept,reason,patientName:MockData.patient.user.name,patientPhone:MockData.patient.user.phone});this._showApplyForm=false;this.toast(r.duplicate?'相同医院申请正在审核中':'申请已提交，管理员已收到提醒');this.renderHospitals(document.getElementById('screen'));};

// ---- 管理端：菜单、通知、状态流转、审批、收费和报告 ----
Admin.menus=[{group:'运营总览',items:[{id:'dashboard',name:'工作台',icon:ICON.dashboard},{id:'track',name:'服务跟踪',icon:ICON.track},{id:'pricing',name:'服务收费',icon:ICON.finance}]},{group:'业务管理',items:[{id:'records',name:'档案管理',icon:ICON.fileText},{id:'patients',name:'患者档案',icon:ICON.patients},{id:'needs',name:'需求处理',icon:ICON.needs},{id:'escorts',name:'陪诊师管理',icon:ICON.escorts},{id:'hospitals',name:'医院审批与资料',icon:ICON.hospitals}]},{group:'系统',items:[{id:'reviews',name:'评价反馈',icon:ICON.reviews},{id:'system',name:'系统设置',icon:ICON.system}]}];
const _legacyAdminRenderContent=Admin.renderContent.bind(Admin);
Admin.renderContent=function(){if(this.currentMenu==='pricing'){document.getElementById('atCrumb').textContent='服务收费';this.renderPricing(document.getElementById('adminContent'));return;} _legacyAdminRenderContent();};
Admin.renderNeeds=function(el){const statuses=['all','待处理','已分配','服务中','已完成','已取消'];el.innerHTML=`<div class="page-head"><h2>需求处理</h2><div>患者提交的需求统一在此处理，状态按服务实际进度推进</div></div><div class="filter-bar">${statuses.map((s,i)=>`<button class="filter-btn ${i===0?'active':''}" data-status="${s}">${s==='all'?`全部（${CareStore.state.needs.length}）`:s}</button>`).join('')}</div><div id="needsListV2"></div>`;const render=status=>{el.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',b.dataset.status===status));this.renderNeedsListV2(status);};el.querySelectorAll('.filter-btn').forEach(b=>b.onclick=()=>render(b.dataset.status));render('all');};
Admin.renderNeedsListV2=function(status){const list=status==='all'?CareStore.state.needs:CareStore.state.needs.filter(n=>n.status===status);const host=document.getElementById('needsListV2');host.innerHTML=list.length?`<div class="table-card"><table class="data-table"><thead><tr><th>患者</th><th>需求</th><th>提交时间</th><th>陪诊师</th><th>状态</th><th>操作</th></tr></thead><tbody>${list.map(n=>`<tr><td><strong>${WUtil.escape(n.patientName)}</strong><div class="cp-sub">${WUtil.escape(n.phone)}</div></td><td><strong>${WUtil.escape(n.hospital)}</strong><div class="cp-sub">${WUtil.escape(n.dept)} · ${WUtil.escape(n.date)} · ${WUtil.escape(n.serviceType)}</div></td><td>${WUtil.escape(n.createTime)}<div class="cp-sub">${WUtil.escape(n.id)}</div></td><td>${WUtil.escape(n.escortName||'待分配')}</td><td><span class="status-badge ${WUtil.statusClass(n.status)}">${n.status}</span></td><td><button class="btn-link" onclick="Admin.openNeed('${n.id}')">处理</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty-inline">暂无对应需求</div>';};
Admin.renderTrack=function(el){const active=CareStore.state.needs.filter(n=>['已分配','服务中'].includes(n.status));el.innerHTML=`<div class="page-head"><h2>服务跟踪</h2><div>查看已分配和正在服务的需求</div></div><div class="kpi-grid"><div class="kpi-card kpi-warn"><div class="kpi-icon">${ICON.escorts}</div><div class="kpi-body"><div class="kpi-num">${active.filter(n=>n.status==='已分配').length}</div><div class="kpi-label">已分配待开始</div></div></div><div class="kpi-card kpi-blue"><div class="kpi-icon">${ICON.track}</div><div class="kpi-body"><div class="kpi-num">${active.filter(n=>n.status==='服务中').length}</div><div class="kpi-label">服务中</div></div></div></div>${active.length?`<div class="table-card"><table class="data-table"><thead><tr><th>患者</th><th>医院/科室</th><th>陪诊师</th><th>状态</th><th>操作</th></tr></thead><tbody>${active.map(n=>`<tr><td>${WUtil.escape(n.patientName)}</td><td>${WUtil.escape(n.hospital)}<div class="cp-sub">${WUtil.escape(n.dept)} · ${WUtil.escape(n.date)}</div></td><td>${WUtil.escape(n.escortName||'-')}</td><td><span class="status-badge ${WUtil.statusClass(n.status)}">${n.status}</span></td><td><button class="btn-link" onclick="Admin.openNeed('${n.id}')">详情</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty-inline">暂无进行中的服务</div>'}`;};
Admin.renderNotifyPanel=function(){const panel=document.getElementById('notifyPanel');if(!panel)return;const list=CareStore.notificationsFor('admin');panel.style.display='block';panel.innerHTML=`<div class="notify-panel-head"><h4>通知提醒</h4><button class="btn-link" onclick="Admin.markAllNotifyRead()">全部已读</button></div>${list.length?list.map(n=>`<button class="notify-item ${n.read?'':'unread'}" onclick="Admin.openNotification('${n.id}')"><span class="notify-dot"></span><span><span class="notify-item-text">${WUtil.escape(n.title)}</span><small class="notify-item-time">${WUtil.escape(n.time)}</small></span></button>`).join(''):'<div class="empty-inline">暂无通知</div>'}`;};
Admin.openNotification=function(id){const n=CareStore.markNotification(id);this.refreshNotifyBadge();document.getElementById('notifyPanel').style.display='none';if(n?.targetType==='need'&&CareStore.need(n.targetId)){this.switchMenu('needs');setTimeout(()=>this.openNeed(n.targetId),0);}else if(n?.targetType==='hospitalApplication'){this.switchMenu('hospitals');}else this.toast('对应记录不存在或已移除');};
Admin.markAllNotifyRead=function(){CareStore.markAllNotifications('admin');this.renderNotifyPanel();this.refreshNotifyBadge();};

Admin.openNeed=function(id){const n=CareStore.need(id);if(!n)return this.toast('需求不存在');const recommended=(CareStore.state.escorts||MockData.escorts).filter(e=>e.status==='空闲'||e.name===n.escortName).slice(0,5);const identity=n.identity||{};const report=CareStore.reportForNeed(id);this.modal(`<div class="modal-head-row"><h2>需求详情</h2><span class="status-badge ${WUtil.statusClass(n.status)}">${n.status}</span></div><div class="cp-sub">编号 ${WUtil.escape(n.id)} · ${WUtil.escape(n.createTime)}</div><div class="modal-grid-2"><section class="modal-card"><div class="card-title">${ICON.user} 患者</div><div class="pb-row"><span class="pb-label">姓名</span><span class="pb-value">${WUtil.escape(n.patientName)}</span></div><div class="pb-row"><span class="pb-label">电话</span><span class="pb-value">${WUtil.escape(n.phone)}</span></div><div class="pb-row"><span class="pb-label">身份证</span><span class="pb-value">${CareStore.maskId(identity.fields?.idNumber)}</span></div><div class="pb-row"><span class="pb-label">病史</span><span class="pb-value">${WUtil.escape(n.history||'未填写')}</span></div><div class="pb-row"><span class="pb-label">过敏</span><span class="pb-value">${WUtil.escape(n.allergy||'无')}</span></div><div class="pb-row"><span class="pb-label">用药</span><span class="pb-value">${WUtil.escape(n.medicine||'无')}</span></div><div class="pb-row"><span class="pb-label">行动</span><span class="pb-value">${WUtil.escape(n.mobility||'未填写')}</span></div><div class="pb-row"><span class="pb-label">紧急联系人</span><span class="pb-value">${WUtil.escape(n.emergencyName||'')} ${WUtil.escape(n.emergencyPhone||'')}</span></div></section><section class="modal-card"><div class="card-title">${ICON.clipboard} 服务</div><div class="pb-row"><span class="pb-label">医院</span><span class="pb-value">${WUtil.escape(n.hospital)}</span></div><div class="pb-row"><span class="pb-label">科室/日期</span><span class="pb-value">${WUtil.escape(n.dept)} · ${WUtil.escape(n.date)}</span></div><div class="pb-row"><span class="pb-label">价格快照</span><span class="pb-value">¥${n.serviceSnapshot?.price||n.amount}/${WUtil.escape(n.serviceSnapshot?.unit||'次')}</span></div></section></div><section class="modal-card"><div class="card-title">${ICON.fileText} 已上传资料</div><p>身份证：${identity.front||identity.back?(identity.status==='confirmed'?'已确认':'待患者确认'):'未上传'}；检查报告：${n.reportImages?.length||0} 张</p>${WUtil.imageGrid(n.reportImages||[])}</section>${n.status==='待处理'?`<section class="modal-card"><div class="card-title">${ICON.escorts} 分配陪诊师</div>${recommended.map(e=>`<button class="escort-pick" onclick="Admin.assignEscortV2('${n.id}','${e.id}')"><span class="ep-avatar">${WUtil.escape(e.avatar)}</span><span class="ep-info"><strong>${WUtil.escape(e.name)}</strong><small>${WUtil.escape(e.tags.slice(0,3).join(' · '))}</small></span><span>选择</span></button>`).join('')}</section><button class="btn btn-outline" onclick="Admin.cancelNeedV2('${n.id}')">取消需求</button>`:''}${n.status==='已分配'?`<section class="modal-card"><div class="card-title">已分配陪诊师</div><p>${WUtil.escape(n.escortName)} · ${WUtil.escape(n.escortPhone)}</p></section><button class="btn" onclick="Admin.startServiceV2('${n.id}')">开始服务</button>`:''}${n.status==='服务中'?`<button class="btn" onclick="Admin.finishServiceV2('${n.id}')">完成服务</button>`:''}${n.status==='已完成'?`<section class="modal-card"><div class="card-title">${ICON.fileText} 陪诊报告</div><p>${report?.status==='published'?'已发布给患者':'尚未发布'}</p><button class="btn" onclick="Admin.openReportEditor('${n.id}')">${report?'编辑报告':'填写并发布报告'}</button></section>`:''}`);};
Admin.assignEscortV2=function(needId,escortId){const e=(CareStore.state.escorts||MockData.escorts).find(x=>x.id===escortId);try{CareStore.transitionNeed(needId,'已分配',{escortName:e.name,escortPhone:e.phone,escortId:e.id});if(e){e.status='已派单';CareStore.save();}this.closeModal();this.toast('陪诊师已分配，患者已收到提醒');this.renderContent();}catch(err){this.toast(err.message);}};
Admin.startServiceV2=function(id){try{const n=CareStore.need(id);const e=n&&(CareStore.state.escorts||MockData.escorts).find(x=>x.id===n.escortId);CareStore.transitionNeed(id,'服务中');if(e){e.status='服务中';CareStore.save();}this.closeModal();this.toast('服务已开始，患者已收到提醒');this.renderContent();}catch(e){this.toast(e.message);}};
Admin.finishServiceV2=function(id){try{const n=CareStore.need(id);const e=n&&(CareStore.state.escorts||MockData.escorts).find(x=>x.id===n.escortId);CareStore.transitionNeed(id,'已完成');if(e){e.status='空闲';CareStore.save();}this.closeModal();this.toast('服务已完成，请填写陪诊报告');this.renderContent();setTimeout(()=>this.openReportEditor(id),100);}catch(e){this.toast(e.message);}};
Admin.cancelNeedV2=function(id){if(!confirm('确认取消该需求？'))return;try{const n=CareStore.need(id);const e=n&&(CareStore.state.escorts||MockData.escorts).find(x=>x.id===n.escortId);CareStore.transitionNeed(id,'已取消');if(e){e.status='空闲';CareStore.save();}this.closeModal();this.renderContent();}catch(e){this.toast(e.message);}};

Admin.openReportEditor=function(needId){this.closeModal();const r=CareStore.reportForNeed(needId)||{timeline:[],completedItems:[],summary:'',notes:'',images:[],plainExplanation:''};this._reportImages=[...(r.images||[])];this.modal(`<div class="modal-head-row"><h2>陪诊报告</h2><span class="status-badge ${r.status==='published'?'done':'pending'}">${r.status==='published'?'已发布':'草稿'}</span></div><p class="helper-text">原始内容与通俗说明会同时展示给患者。请勿在通俗说明中添加诊断或用药决定。</p><label class="field-label" for="er_timeline">服务时间线</label><textarea id="er_timeline" class="fg-input" rows="4" placeholder="每行一项，例如：08:30 | 与患者会合">${WUtil.escape((r.timeline||[]).map(x=>`${x.time} | ${x.text}`).join('\n'))}</textarea><label class="field-label" for="er_items">已办事项</label><input id="er_items" class="fg-input" value="${WUtil.escape((r.completedItems||[]).join('、'))}" placeholder="挂号、问诊、取药" /><label class="field-label" for="er_summary">陪诊总结 <em>*</em></label><textarea id="er_summary" class="fg-input" rows="3">${WUtil.escape(r.summary)}</textarea><label class="field-label" for="er_notes">就医注意事项</label><textarea id="er_notes" class="fg-input" rows="3">${WUtil.escape(r.notes)}</textarea><label class="field-label" for="er_plain">给患者的通俗说明</label><textarea id="er_plain" class="fg-input" rows="3" placeholder="留空则按总结生成规则模板">${WUtil.escape(r.plainExplanation)}</textarea><div class="field-label">报告图片（最多 6 张）</div><div id="escortReportImages">${this.renderReportImages()}</div><input hidden type="file" id="er_image_input" multiple accept="image/jpeg,image/png,image/webp" onchange="Admin.addReportImages(this)" /><button class="btn btn-outline" onclick="document.getElementById('er_image_input').click()">上传报告图片</button><div class="modal-foot"><button class="btn btn-outline" onclick="Admin.saveReport('${needId}',false)">保存草稿</button><button class="btn" onclick="Admin.saveReport('${needId}',true)">发布给患者</button></div>`);};
Admin.renderReportImages=function(){return WUtil.imageGrid(this._reportImages||[],'Admin.removeReportImage');};
Admin.addReportImages=async function(input){const files=[...(input.files||[])];if((this._reportImages?.length||0)+files.length>6){this.toast('报告图片最多 6 张');input.value='';return;}for(const f of files){try{this._reportImages.push(await MediaService.process(f));}catch(e){this.toast(`${f.name}：${e.message}`);}}document.getElementById('escortReportImages').innerHTML=this.renderReportImages();input.value='';};
Admin.removeReportImage=function(i){this._reportImages.splice(i,1);document.getElementById('escortReportImages').innerHTML=this.renderReportImages();};
Admin.saveReport=function(needId,publish){const timeline=WUtil.value('er_timeline').split('\n').filter(Boolean).map(line=>{const parts=line.split('|');return {time:(parts.shift()||'').trim(),text:parts.join('|').trim()||line.trim()};});const data={timeline,completedItems:WUtil.value('er_items').split(/[、,，]/).map(x=>x.trim()).filter(Boolean),summary:WUtil.value('er_summary'),notes:WUtil.value('er_notes'),plainExplanation:WUtil.value('er_plain'),images:this._reportImages||[]};try{CareStore.saveEscortReport(needId,data,publish);this.closeModal();this.toast(publish?'陪诊报告已发布，患者已收到提醒':'报告草稿已保存');this.renderContent();}catch(e){this.toast(e.message);}};

Admin.approveHospitalV2=function(id){try{CareStore.approveHospitalApplication(id);this.toast('医院申请已通过，患者已收到提醒');this.renderContent();}catch(e){this.toast(e.message);}};
Admin.rejectHospitalV2=function(id){const reason=prompt('请填写驳回原因（患者可见）：');if(reason===null)return;try{CareStore.rejectHospitalApplication(id,reason);this.toast('已驳回并通知患者');this.renderContent();}catch(e){this.toast(e.message);}};
Admin.editHospitalV2=function(id){const h=CareStore.state.hospitals.find(x=>x.id===id);if(!h)return;const level=prompt('医院等级：',h.level);if(level===null)return;const address=prompt('医院地址（格式：总院：xx区xx路xx号；分院：xx路xx号（院区名））：',h.address);if(address===null)return;const specialties=prompt('优势科室：',h.specialties);if(specialties===null)return;const advantage=prompt('核心优势：',h.advantage||'');if(advantage===null)return;const intro=prompt('患者端简介：',h.intro);if(intro===null)return;Object.assign(h,{level:level.trim(),address:address.trim(),specialties:specialties.trim(),advantage:advantage.trim(),intro:intro.trim()});const parsed=parseAddress(h.address);h.branches=parsed.length?parsed:[{name:'总院',address:h.address.trim()}];CareStore.save();this.toast('医院介绍已更新，患者端已同步');this.renderContent();};

Admin.renderSystem=function(el){const announcements=CareStore.state.announcements||[];const cfg=CareStore.state.settings||{};el.innerHTML=`<div class="page-head"><h2>系统设置</h2><div>联系方式、演示环境、数据安全与信息发布</div></div>
    <section class="db-card"><div class="db-card-head"><h3>${ICON.phone} 联系方式配置</h3></div><div class="db-card-body"><div class="setting-grid">
      <section class="modal-card"><div class="card-title">${ICON.phone} 咨询电话</div>
        <label class="field-label" for="set_phone">对外展示的咨询电话 <em>*</em></label>
        <input class="fg-input" id="set_phone" value="${WUtil.escape(cfg.consultPhone||'')}" placeholder="例如：400-800-1234" />
        <label class="field-label" for="set_hours">服务时间</label>
        <input class="fg-input" id="set_hours" value="${WUtil.escape(cfg.consultHours||'')}" placeholder="例如：每日 08:00-20:00" />
        <p class="helper-text">保存后患者端立即同步：首页"电话咨询"条、服务流程页"电话咨询"卡、我的 → 客服中心。</p>
        <button class="btn btn-sm" onclick="Admin.saveSettings()">保存并同步患者端</button>
        ${cfg.updatedAt?`<div class="cp-sub" style="margin-top:10px;">最近更新：${WUtil.escape(cfg.updatedAt)}</div>`:''}
      </section>
      <section class="modal-card"><div class="card-title">${ICON.cpu} AI 助手</div><div class="pb-row"><span class="pb-label">运行方式</span><span class="pb-value">本地规则状态机</span></div><div class="pb-row"><span class="pb-label">外部密钥</span><span class="pb-value">未在浏览器保存</span></div><p class="helper-text">正式接入大模型时必须使用后端代理。</p></section>
      <section class="modal-card"><div class="card-title">${ICON.shield} 数据范围</div><p>当前为单浏览器演示原型，图片和资料保存在 localStorage。请勿上传真实身份证或病历。</p><button class="btn btn-outline btn-sm" onclick="Admin.resetDemoData()">重置演示数据</button></section>
    </div></div></section>
    <section class="db-card" style="margin-top:24px;">
      <div class="db-card-head"><h3>${ICON.image} 首页轮播配置</h3><span class="cp-sub">复用医院实景图，无需额外上传</span></div>
      <div class="db-card-body">
        <label class="consent-row"><input type="checkbox" id="set_banner_auto" ${cfg.bannerAutoPlay !== false ? 'checked' : ''} /> 开启自动轮播（5 秒/张；系统开启"减少动态效果"时自动停播，仅保留手动切换）</label>
        <div class="field-label">参与轮播的医院（不勾选则由系统自动取"热门且带图"的医院，最多 6 张）</div>
        <div class="banner-pick">
          ${CareStore.activeHospitals().filter(h => h.image).map(h => `
            <label class="banner-pick-item">
              <input type="checkbox" class="set_banner_item" value="${h.id}" ${(cfg.bannerHospitalIds || []).includes(h.id) ? 'checked' : ''} />
              <span class="bpi-thumb"><img src="${WUtil.escape(h.image)}" alt="${WUtil.escape(h.name)}" onerror="this.style.display='none'" /></span>
              <span class="bpi-name">${WUtil.escape(h.name)}</span>
            </label>`).join('') || '<div class="empty-inline">暂无可用于轮播的医院（请先在医院管理中上传图片）</div>'}
        </div>
        <button class="btn btn-sm" style="margin-top:12px;" onclick="Admin.saveBannerSettings()">保存轮播配置</button>
      </div>
    </section>
    <section class="db-card" style="margin-top:24px;"><div class="db-card-head"><h3>信息发布（公告）</h3><button class="btn btn-sm" onclick="Admin.addAnnouncement()">+ 新建公告</button></div><div class="db-card-body">${announcements.length?announcements.map(a=>`<div class="application-row"><div><strong>${WUtil.escape(a.title)}</strong><small>${WUtil.escape(a.status==='published'?'已发布':'草稿')} · ${WUtil.escape(a.publishedAt||'')}</small><p style="font-size:12px;color:var(--text-muted);">${WUtil.escape((a.content||'').slice(0,60))}${(a.content||'').length>60?'…':''}</p></div><div>${a.status==='draft'?`<button class="btn btn-sm" onclick="Admin.publishAnnouncement('${a.id}')">发布</button>`:`<button class="btn btn-outline btn-sm" onclick="Admin.unpublishAnnouncement('${a.id}')">下线</button>`}</div></div>`).join(''):'<div class="empty-inline">暂无公告</div>'}</div></section>`;};
// 保存咨询电话配置：格式校验 → 写入 state.settings → 通知患者 → 患者端实时展示
Admin.saveSettings=function(){const phone=WUtil.value('set_phone');const hours=WUtil.value('set_hours');if(!phone){this.toast('请填写咨询电话');document.getElementById('set_phone')?.focus();return;}if(!/^[\d+\-() ]{6,24}$/.test(phone)){this.toast('电话格式不正确，仅支持数字、空格与 + - ( )');document.getElementById('set_phone')?.focus();return;}try{CareStore.updateSettings({consultPhone:phone,consultHours:hours});this.toast('已保存，患者端咨询电话已同步');this.renderSystem(document.getElementById('adminContent'));}catch(e){this.toast(e.message);}};
// 保存首页轮播配置：自动播放开关 + 指定参与医院（空 = 自动取热门带图医院）
Admin.saveBannerSettings=function(){const auto=!!document.getElementById('set_banner_auto')?.checked;const nodes=(typeof document.querySelectorAll==='function')?document.querySelectorAll('.set_banner_item'):[];const ids=[];nodes.forEach(n=>{if(n&&n.checked)ids.push(n.value);});try{CareStore.updateSettings({bannerAutoPlay:auto,bannerHospitalIds:ids});this.toast(ids.length?`轮播配置已保存（指定 ${ids.length} 家医院）`:'轮播配置已保存（自动选取热门医院）');this.renderSystem(document.getElementById('adminContent'));}catch(e){this.toast(e.message);}};
Admin.addAnnouncement=function(){const title=prompt('公告标题：');if(!title||!title.trim())return;const content=prompt('公告内容：');if(content===null)return;const item={id:CareStore.uid('AN'),title:title.trim(),content:(content||'').trim(),status:'draft',publishedAt:''};CareStore.state.announcements.unshift(item);CareStore.save();this.toast('公告草稿已保存');this.renderSystem(document.getElementById('adminContent'));};
Admin.publishAnnouncement=function(id){const a=CareStore.state.announcements.find(x=>x.id===id);if(!a)return;a.status='published';a.publishedAt=CareStore.now();CareStore.save();this.toast('公告已发布，患者端可见');this.renderSystem(document.getElementById('adminContent'));};
Admin.unpublishAnnouncement=function(id){const a=CareStore.state.announcements.find(x=>x.id===id);if(!a)return;a.status='draft';a.publishedAt='';CareStore.save();this.toast('公告已下线');this.renderSystem(document.getElementById('adminContent'));};
Admin.resetDemoData=function(){if(!confirm('确认清空当前浏览器的演示数据并重新加载？'))return;localStorage.removeItem(CareStore.key);localStorage.removeItem('huwuyou_patients');location.reload();};

// 兼容后台既有列表中的按钮调用，统一转到新状态机。
Admin.assignEscort=Admin.assignEscortV2; Admin.startService=Admin.startServiceV2; Admin.finishService=Admin.finishServiceV2; Admin.cancelNeed=Admin.cancelNeedV2;

// ======================================================================
// B3：医院管理（完整 CRUD + 图片上传）与患者端"医院介绍"图文排版
// 覆盖层：本节方法在文件末尾重新赋值，优先级高于前面的旧实现
// ======================================================================
// 医院封面图压缩档：图片以 dataUrl 存入 localStorage，需比证件照更省空间（约 200KB / 最长边 1280px）
const HOSPITAL_IMAGE_PROFILE = { maxBytes: 8 * 1024 * 1024, targetBytes: 200 * 1024, maxEdge: 1280 };

Admin._editingHospitalId = null;
Admin._hospitalImage = null;
Admin._hospitalImageUploaded = false;

Admin.renderHospitals = function(el) {
  const apps = CareStore.state.hospitalApplications;
  const pending = apps.filter(a => a.status === '待审批');
  const handled = apps.filter(a => a.status !== '待审批');
  const hospitals = CareStore.state.hospitals;
  const activeCount = hospitals.filter(h => h.active !== false).length;
  const inactiveCount = hospitals.length - activeCount;
  el.innerHTML = `
    <div class="page-head"><h2>医院管理</h2><div>新增/编辑医院资料与图片，审批患者提出的新医院；停用后患者端立即隐藏</div></div>
    <section class="db-card">
      <div class="db-card-head">
        <h3>${ICON.building} <span style="margin-left:6px;">医院资料（在架 ${activeCount}${inactiveCount?` · 已停用 ${inactiveCount}`:''}）</span></h3>
        <button class="btn btn-sm" onclick="Admin.openHospitalForm(null)">+ 新增医院</button>
      </div>
      <div class="db-card-body"><div class="hospital-grid">
        ${hospitals.length ? hospitals.map(h => `
          <article class="hospital-card${h.active === false ? ' inactive' : ''}">
            <div class="hc-thumb">
              ${h.image ? `<img src="${WUtil.escape(h.image)}" alt="${WUtil.escape(h.name)}" loading="lazy" onerror="this.style.display='none'" />` : `<span class="hc-thumb-empty">${ICON.building}</span>`}
              <span class="hc-thumb-tag">${h.imageUploaded ? '已上传' : (h.image ? '系统图' : '无图')}</span>
            </div>
            <div class="hc-head">
              <div>
                <div class="hc-name">${WUtil.escape(h.name)}</div>
                <div class="hc-sub">${WUtil.escape(h.level)} · ${WUtil.escape(h.category || '')} · ${WUtil.escape(h.address || '地址待完善')}</div>
              </div>
              <span class="status-badge ${h.active === false ? 'cancelled' : 'done'}">${h.active === false ? '已停用' : '在架'}</span>
            </div>
            <div class="hc-body">
              <p>${WUtil.escape(h.intro || '暂无简介')}</p>
              <div class="pb-row"><span class="pb-label">优势科室</span><span class="pb-value">${WUtil.escape(h.specialties || '综合')}</span></div>
            </div>
            <div class="hc-actions">
              <button class="btn btn-outline btn-sm" onclick="Admin.openHospitalForm('${h.id}')">编辑</button>
              ${h.active === false
                ? `<button class="btn btn-sm" onclick="Admin.toggleHospitalActive('${h.id}')">恢复启用</button><button class="btn btn-outline btn-sm danger" onclick="Admin.deleteHospital('${h.id}')">彻底删除</button>`
                : `<button class="btn btn-outline btn-sm" onclick="Admin.toggleHospitalActive('${h.id}')">停用</button>`}
            </div>
          </article>`).join('') : '<div class="empty-inline">暂无医院，点击右上角新增</div>'}
      </div></div>
    </section>
    <section class="db-card">
      <div class="db-card-head"><h3>${ICON.clipboard} <span style="margin-left:6px;">待审批申请（${pending.length}）</span></h3></div>
      <div class="db-card-body">${pending.length ? pending.map(a => `
        <div class="approval-card">
          <div><strong>${WUtil.escape(a.hospital)}</strong><p>${WUtil.escape(a.patientName)} · ${WUtil.escape(a.dept)} · ${WUtil.escape(a.reason)}</p><small>${WUtil.escape(a.time)}</small></div>
          <div><button class="btn btn-sm" onclick="Admin.approveHospitalV2('${a.id}')">通过</button><button class="btn btn-outline btn-sm" onclick="Admin.rejectHospitalV2('${a.id}')">驳回</button></div>
        </div>`).join('') : '<div class="empty-inline">暂无待审批申请</div>'}</div>
    </section>
    <section class="db-card">
      <div class="db-card-head"><h3>审批记录</h3></div>
      <div class="db-card-body">${handled.length ? handled.map(a => `
        <div class="application-row">
          <div><strong>${WUtil.escape(a.hospital)}</strong><small>${WUtil.escape(a.patientName)} · ${WUtil.escape(a.handledAt || a.time)}</small>${a.rejectReason ? `<p>原因：${WUtil.escape(a.rejectReason)}</p>` : ''}</div>
          <span class="status-badge ${a.status === '已通过' ? 'done' : 'cancelled'}">${WUtil.escape(a.status)}</span>
        </div>`).join('') : '<div class="empty-inline">暂无审批记录</div>'}</div>
    </section>
  `;
};

Admin._branchRowHTML = function(b, i) {
  return `<div class="branch-row">
    <input class="fg-input hf-branch-name" value="${WUtil.escape(b.name || '')}" placeholder="${i === 0 ? '总院' : '分院/院区名称'}" />
    <input class="fg-input hf-branch-addr" value="${WUtil.escape(b.address || '')}" placeholder="所在区 + 路名门牌" />
    <button class="text-danger" onclick="this.closest('.branch-row').remove()">移除</button>
  </div>`;
};
Admin.addBranchRow = function() {
  const host = document.getElementById('hf_branches');
  if (!host) return;
  host.insertAdjacentHTML('beforeend', this._branchRowHTML({ name: '', address: '' }, host.querySelectorAll('.branch-row').length));
};
Admin.collectBranchRows = function() {
  const host = document.getElementById('hf_branches');
  if (!host) return [];
  const names = host.querySelectorAll('.hf-branch-name');
  const addrs = host.querySelectorAll('.hf-branch-addr');
  const out = [];
  for (let i = 0; i < names.length; i++) {
    out.push({ name: String(names[i].value || '').trim(), address: String(addrs[i]?.value || '').trim() });
  }
  return out;
};
Admin._hospitalImagePreviewHTML = function() {
  return this._hospitalImage
    ? `<img src="${WUtil.escape(this._hospitalImage)}" alt="医院图片预览" />`
    : `<div class="hosp-image-empty">${ICON.building}<span>暂无图片</span></div>`;
};

Admin.openHospitalForm = function(id) {
  const h = id ? CareStore.hospital(id) : null;
  if (id && !h) return this.toast('医院不存在');
  this._editingHospitalId = id || null;
  this._hospitalImage = h ? (h.image || null) : null;
  this._hospitalImageUploaded = h ? !!h.imageUploaded : false;
  const branches = (h && h.branches && h.branches.length) ? h.branches : [{ name: '总院', address: '' }];
  this.modal(`
    <div class="modal-head-row"><h2>${h ? '编辑医院' : '新增医院'}</h2>${h ? `<span class="status-badge ${h.active === false ? 'cancelled' : 'done'}">${h.active === false ? '已停用' : '在架'}</span>` : ''}</div>
    <p class="helper-text">带 <em>*</em> 为必填。图片会压缩后保存在本机浏览器（演示环境），请勿上传含患者信息的图片。</p>
    <div class="form-grid-2">
      <div class="form-grid-full"><label class="field-label" for="hf_name">医院全称 <em>*</em></label><input class="fg-input" id="hf_name" value="${WUtil.escape(h?.name || '')}" placeholder="例如：复旦大学附属中山医院" /></div>
      <div><label class="field-label" for="hf_short">简称</label><input class="fg-input" id="hf_short" value="${WUtil.escape(h?.shortName || '')}" placeholder="例如：中山医院" /></div>
      <div><label class="field-label" for="hf_phone">医院电话</label><input class="fg-input" id="hf_phone" value="${WUtil.escape(h?.phone || '')}" placeholder="021-0000-0000" /></div>
      <div><label class="field-label" for="hf_level">等级</label><select class="fg-select" id="hf_level">${['三甲', '三乙', '二甲', '待完善'].map(x => `<option ${h?.level === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div><label class="field-label" for="hf_category">类别</label><select class="fg-select" id="hf_category">${['综合医院', '专科医院', '中医医院'].map(x => `<option ${h?.category === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div><label class="field-label" for="hf_city">城市</label><input class="fg-input" id="hf_city" value="${WUtil.escape(h?.city || '上海市')}" /></div>
      <div><label class="field-label" for="hf_orders">服务单量（展示用）</label><input class="fg-input" id="hf_orders" type="number" min="0" value="${Number(h?.orders || 0)}" /></div>
      <div class="form-grid-full"><label class="field-label" for="hf_depts">优势科室（顿号/逗号分隔）</label><input class="fg-input" id="hf_depts" value="${WUtil.escape((h?.keyDepts || []).join('、'))}" placeholder="心内科、心外科、普外科" /></div>
      <div class="form-grid-full"><label class="field-label" for="hf_intro">医院简介</label><textarea class="fg-input" id="hf_intro" rows="3" placeholder="患者端可见，建议 100 字以内">${WUtil.escape(h?.intro || '')}</textarea></div>
      <div class="form-grid-full"><label class="field-label" for="hf_advantage">核心优势</label><textarea class="fg-input" id="hf_advantage" rows="2" placeholder="专科实力、就诊动线等">${WUtil.escape(h?.advantage || '')}</textarea></div>
    </div>
    <div class="field-label">院区地址</div>
    <div id="hf_branches" class="branch-rows">${branches.map((b, i) => this._branchRowHTML(b, i)).join('')}</div>
    <button class="btn btn-outline btn-sm" onclick="Admin.addBranchRow()">+ 添加院区</button>
    <div class="field-label">医院图片</div>
    <div class="hosp-image-row">
      <div class="hosp-image-preview" id="hf_img_preview">${this._hospitalImagePreviewHTML()}</div>
      <div class="hosp-image-ops">
        <input hidden type="file" id="hf_image_input" accept="image/jpeg,image/png,image/webp" onchange="Admin.uploadHospitalImage(this)" />
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('hf_image_input').click()">${this._hospitalImage ? '更换图片' : '上传图片'}</button>
        ${this._hospitalImage ? '<button class="text-danger" onclick="Admin.clearHospitalImage()">移除图片</button>' : ''}
        <p class="helper-text">支持 JPEG/PNG/WebP，自动压缩至约 200KB、最长边 1280px。</p>
      </div>
    </div>
    <label class="consent-row" style="margin-top:12px;"><input type="checkbox" id="hf_hot" ${h?.hot ? 'checked' : ''} /> 设为首页/特色页热门推荐</label>
    <div class="modal-foot">
      <button class="btn btn-outline" onclick="Admin.closeModal()">取消</button>
      <button class="btn" onclick="Admin.saveHospitalForm()">${h ? '保存修改' : '创建医院'}</button>
    </div>
  `);
};

Admin.saveHospitalForm = function() {
  const name = WUtil.value('hf_name');
  if (!name) { this.toast('请填写医院全称'); document.getElementById('hf_name')?.focus(); return; }
  let branches = this.collectBranchRows().filter(b => b.name || b.address);
  if (!branches.length) branches = [{ name: '总院', address: '' }];
  const keyDepts = WUtil.value('hf_depts').split(/[、,，]/).map(s => s.trim()).filter(Boolean);
  const orders = Number(WUtil.value('hf_orders'));
  const payload = {
    name, shortName: WUtil.value('hf_short'),
    level: WUtil.value('hf_level') || '三甲', category: WUtil.value('hf_category') || '综合医院',
    city: WUtil.value('hf_city') || '上海市', phone: WUtil.value('hf_phone'),
    intro: WUtil.value('hf_intro'), advantage: WUtil.value('hf_advantage'),
    keyDepts, specialties: keyDepts.join('、'),
    orders: Number.isFinite(orders) && orders >= 0 ? orders : 0,
    branches, hot: !!document.getElementById('hf_hot')?.checked,
    image: this._hospitalImage || '', imageUploaded: !!this._hospitalImageUploaded,
  };
  try {
    if (this._editingHospitalId) {
      CareStore.updateHospital(this._editingHospitalId, payload);
      this.toast('医院资料已更新，患者端已同步');
    } else {
      CareStore.addHospital(payload);
      this.toast('医院已新增，患者端立即可见');
    }
    this._editingHospitalId = null; this._hospitalImage = null; this._hospitalImageUploaded = false;
    this.closeModal();
    this.renderContent();
  } catch (e) {
    this.toast(e.message);
  }
};

Admin.uploadHospitalImage = async function(input) {
  const file = input?.files?.[0];
  if (!file) return;
  try {
    this.toast('正在压缩图片…');
    const item = await MediaService.process(file, HOSPITAL_IMAGE_PROFILE);
    this._hospitalImage = item.dataUrl;
    this._hospitalImageUploaded = true;
    const preview = document.getElementById('hf_img_preview');
    if (preview) preview.innerHTML = this._hospitalImagePreviewHTML();
    this.toast('图片已就绪，保存后生效');
  } catch (e) {
    this.toast(e.message);
  }
  input.value = '';
};

Admin.clearHospitalImage = function() {
  this._hospitalImage = null;
  this._hospitalImageUploaded = false;
  const preview = document.getElementById('hf_img_preview');
  if (preview) preview.innerHTML = this._hospitalImagePreviewHTML();
};

Admin.toggleHospitalActive = function(id) {
  const h = CareStore.hospital(id);
  if (!h) return this.toast('医院不存在');
  const wasActive = h.active !== false;
  const doToggle = () => {
    try {
      if (wasActive) { CareStore.removeHospital(id); this.toast(`${h.name} 已停用，患者端不再展示`); }
      else { CareStore.restoreHospital(id); this.toast(`${h.name} 已恢复启用`); }
      this.renderContent();
    } catch (e) { this.toast(e.message); }
  };
  if (!wasActive) return doToggle();
  const busy = CareStore.busyNeeds(n => n.hospital === h.name).length;
  WUtil.confirm({
    title: '确认停用医院',
    desc: `停用后患者端"特色医院""医院介绍"与需求表单下拉均不再展示「${h.name}」，历史需求保留${busy ? `；当前仍有 ${busy} 条未完成需求` : ''}。`,
    rows: [['医院', h.name], ['当前状态', '在架'], ['未完成需求', `${busy} 条`]],
    okText: '确认停用',
    danger: true,
    onOk: doToggle,
  });
};

Admin.deleteHospital = function(id) {
  const h = CareStore.hospital(id);
  if (!h) return this.toast('医院不存在');
  const refs = CareStore.state.needs.filter(n => n.hospital === h.name).length
    + CareStore.state.hospitalApplications.filter(a => a.hospital === h.name).length;
  WUtil.confirm({
    title: '确认彻底删除医院',
    desc: refs
      ? `「${h.name}」已被 ${refs} 条需求/申请引用，系统会阻止彻底删除，请改用「停用」。`
      : `删除后不可恢复，患者端将不再展示「${h.name}」。`,
    rows: [['医院', h.name], ['引用记录', `${refs} 条`], ['当前状态', h.active === false ? '已停用' : '在架']],
    okText: '确认彻底删除',
    danger: true,
    onOk: () => {
      try {
        CareStore.deleteHospital(id);
        this.toast('医院已彻底删除');
        this.renderContent();
      } catch (e) { this.toast(e.message); }
    },
  });
};

// 旧入口兼容：原 prompt 式编辑改为打开表单
Admin.editHospitalV2 = function(id) { Admin.openHospitalForm(id); };

// ---- 患者端"医院介绍"页：补全医院图片 + 电话咨询入口 ----
Patient.renderHospitals = function(el) {
  const screen = el || document.getElementById('screen');
  screen.classList.remove('fade-in'); void screen.offsetWidth; screen.classList.add('fade-in');
  const apps = CareStore.state.hospitalApplications.filter(a => a.patientName === MockData.patient.user.name);
  const hospitals = CareStore.activeHospitals();
  const consult = this.consultSettings();
  screen.innerHTML = `
    <div class="svd-header"><div class="svd-back" onclick="Patient.goBack()" aria-label="返回">${P_ICON.chevronLeft}</div><h2>医院介绍</h2></div>
    <div class="page-head"><div>简介与图片由管理员维护，具体就诊安排以医院通知为准</div></div>
    ${consult.phone ? `
    <div style="margin-bottom:12px;">
      <div class="consult-strip" onclick="location.href='tel:${WUtil.escape(consult.tel)}'">
        <span class="cs-icon">${P_ICON.phone}</span>
        <span class="cs-text"><strong>${WUtil.escape(consult.phone)}</strong>${consult.hours ? ` · ${WUtil.escape(consult.hours)}` : ''}</span>
        <span class="cs-cta">电话咨询</span>
      </div>
    </div>` : ''}
    <section class="card apply-hospital">
      <div class="card-title">${P_ICON.inbox} 没有想去的医院？</div>
      <button class="btn btn-outline" onclick="Patient.toggleHospitalApply()">${this._showApplyForm ? '收起申请' : '申请新增医院'}</button>
    </section>
    ${this._showApplyForm ? this._renderHospitalApplyForm() : ''}
    ${apps.length ? `<section class="card"><div class="card-title">我的医院申请</div>${apps.map(a => `
      <div class="application-row">
        <div><strong>${WUtil.escape(a.hospital)}</strong><small>${WUtil.escape(a.dept)} · ${WUtil.escape(a.time)}</small>${a.rejectReason ? `<p>原因：${WUtil.escape(a.rejectReason)}</p>` : ''}</div>
        <span class="status-badge ${a.status === '待审批' ? 'pending' : a.status === '已通过' ? 'done' : 'cancelled'}">${WUtil.escape(a.status)}</span>
      </div>`).join('')}</section>` : ''}
    ${hospitals.length ? hospitals.map(h => HospitalUI.renderIntroCard(h)).join('') : '<div class="empty-inline">暂无医院资料</div>'}
  `;
};

// ======================================================================
// B4：服务收费管理（新增服务项 / 停用恢复 / 删除守卫）
// 覆盖层：重新赋值 Admin.renderPricing，优先级高于前面的旧实现
// ======================================================================
Admin.renderPricing = function(el) {
  const items = CareStore.state.prices;
  const changes = CareStore.state.priceChanges;
  const activeItems = items.filter(p => p.active !== false);
  const escortCount = activeItems.filter(p => p.group !== 'expert').length;
  const expertCount = activeItems.filter(p => p.group === 'expert').length;
  el.innerHTML = `
    <div class="page-head"><h2>服务收费</h2><div>新增/维护患者端公开价格；历史需求保留提交时价格快照</div></div>
    <div class="kpi-grid">
      <div class="kpi-card kpi-blue"><div class="kpi-icon">${ICON.finance}</div><div class="kpi-body"><div class="kpi-num">${activeItems.length}</div><div class="kpi-label">在售服务</div></div></div>
      <div class="kpi-card kpi-green"><div class="kpi-icon">${ICON.clipboard}</div><div class="kpi-body"><div class="kpi-num">${escortCount} / ${expertCount}</div><div class="kpi-label">陪诊 / 专家预约</div></div></div>
      <div class="kpi-card kpi-warn"><div class="kpi-icon">${ICON.scroll}</div><div class="kpi-body"><div class="kpi-num">${changes.length}</div><div class="kpi-label">价格变更记录</div></div></div>
    </div>
    <section class="db-card">
      <div class="db-card-head">
        <h3>${ICON.finance} <span style="margin-left:6px;">公开价格表（${items.length}）</span></h3>
        <button class="btn btn-sm" onclick="Admin.openPriceForm()">+ 新增服务项</button>
      </div>
      <div class="table-card"><table class="data-table">
        <thead><tr><th>服务</th><th>分组</th><th>说明</th><th>计价单位</th><th>公开价格</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          ${items.map(p => `
            <tr${p.active === false ? ' style="opacity:.62"' : ''}>
              <td><strong>${WUtil.escape(p.name)}</strong><div class="cp-sub">${WUtil.escape(p.id)}</div></td>
              <td><span class="status-badge ${p.group === 'expert' ? 'pending' : 'accepted'}">${p.group === 'expert' ? '专家预约' : '陪诊服务'}</span></td>
              <td><div class="cp-sub">${WUtil.escape(p.desc || '-')}</div></td>
              <td>${WUtil.escape(p.unit)}</td>
              <td><input class="fg-input price-input" type="number" min="1" id="price_${p.id}" value="${p.price}" /></td>
              <td><span class="status-badge ${p.active === false ? 'cancelled' : 'done'}">${p.active === false ? '已停用' : '在售'}</span></td>
              <td>
                <div class="hc-actions" style="margin:0; padding:0; border:0;">
                  <button class="btn btn-sm" onclick="Admin.savePriceV2('${p.id}')">保存价格</button>
                  <button class="btn btn-outline btn-sm" onclick="Admin.openPriceForm('${p.id}')">编辑</button>
                  <button class="btn btn-outline btn-sm" onclick="Admin.togglePriceActive('${p.id}')">${p.active === false ? '恢复' : '停用'}</button>
                  <button class="btn btn-outline btn-sm danger" onclick="Admin.deletePrice('${p.id}')">删除</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table></div>
    </section>
    <section class="db-card">
      <div class="db-card-head"><h3>最近变更</h3></div>
      <div class="db-card-body">${changes.slice(0, 10).map(c => `
        <div class="db-row-item"><div><strong>${WUtil.escape(c.itemName)}</strong><p class="dbr-info">¥${c.oldPrice} → ¥${c.newPrice} · ${WUtil.escape(c.time)}</p></div><span class="status-badge done">已生效</span></div>`).join('') || '<div class="empty-inline">暂无变更</div>'}</div>
    </section>
  `;
};

// 保存价格（二次确认：展示新旧价格对比，确认后才写入）
Admin.savePriceV2 = function(id) {
  const value = Number(document.getElementById('price_' + id)?.value);
  const item = CareStore.state.prices.find(p => p.id === id);
  if (!item || !Number.isFinite(value) || value <= 0) return this.toast('请输入大于 0 的有效价格');
  if (item.price === value) return this.toast('价格没有变化');
  const oldPrice = item.price;
  WUtil.confirm({
    title: '确认调整公开价格',
    desc: '调整后患者端"我的需求"表单立即生效；已提交需求仍按提交时的价格快照结算。',
    rows: [['服务项', item.name], ['当前价格', `¥${oldPrice}`], ['调整后价格', `¥${value}`]],
    okText: '确认调价',
    onOk: () => {
      CareStore.updatePrice(id, value);
      this.toast(`${item.name} 价格已更新：¥${oldPrice} → ¥${value}`);
      this.renderPricing(document.getElementById('adminContent'));
    },
  });
};

Admin.openPriceForm = function(id) {
  const p = id ? CareStore.state.prices.find(x => x.id === id) : null;
  if (id && !p) return this.toast('服务项不存在');
  this.modal(`
    <div class="modal-head-row"><h2>${p ? '编辑服务项' : '新增服务项'}</h2>${p ? `<span class="status-badge ${p.active === false ? 'cancelled' : 'done'}">${p.active === false ? '已停用' : '在售'}</span>` : ''}</div>
    <p class="helper-text">${p ? '改名会同步更新"未完成需求"的服务类型；已完成需求使用价格快照，不受影响。' : '新增后立即出现在患者端"我的需求"表单对应分组中；价格提交时生成快照，后续调价不影响历史需求。'}</p>
    <div class="form-grid-2">
      <div class="form-grid-full"><label class="field-label" for="pf_name">服务名称 <em>*</em></label><input class="fg-input" id="pf_name" value="${WUtil.escape(p?.name || '')}" placeholder="例如：术后陪护 / 特需专家加急" /></div>
      <div><label class="field-label" for="pf_group">分组 <em>*</em></label><select class="fg-select" id="pf_group"><option value="escort" ${p?.group !== 'expert' ? 'selected' : ''}>陪诊服务（服务类型区）</option><option value="expert" ${p?.group === 'expert' ? 'selected' : ''}>专家预约（专家预约区）</option></select></div>
      <div><label class="field-label" for="pf_unit">计价单位</label><input class="fg-input" id="pf_unit" value="${WUtil.escape(p?.unit || '次')}" /></div>
      <div><label class="field-label" for="pf_price">公开价格（元） <em>*</em></label><input class="fg-input" id="pf_price" type="number" min="1" step="1" value="${p ? p.price : ''}" placeholder="例如：398" /></div>
      <div class="form-grid-full"><label class="field-label" for="pf_desc">服务说明</label><input class="fg-input" id="pf_desc" value="${WUtil.escape(p?.desc || '')}" placeholder="例如：术后 8 小时陪护，含取药与医嘱记录" /></div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-outline" onclick="Admin.closeModal()">取消</button>
      <button class="btn" onclick="Admin.savePriceForm('${p ? p.id : ''}')">${p ? '保存修改' : '创建服务项'}</button>
    </div>
  `);
};

Admin.savePriceForm = function(id) {
  const name = WUtil.value('pf_name');
  const price = Number(WUtil.value('pf_price'));
  const desc = WUtil.value('pf_desc');
  const unit = WUtil.value('pf_unit') || '次';
  const group = WUtil.value('pf_group') || 'escort';
  if (!name) { this.toast('请填写服务名称'); document.getElementById('pf_name')?.focus(); return; }
  if (!Number.isFinite(price) || price <= 0) { this.toast('请填写大于 0 的价格'); document.getElementById('pf_price')?.focus(); return; }
  if (!id) {
    try {
      CareStore.addPrice({ name, price, desc, unit, group });
      this.toast('服务项已新增，患者端立即可见');
      this.closeModal();
      this.renderContent();
    } catch (e) {
      this.toast(e.message);
    }
    return;
  }
  const item = CareStore.state.prices.find(x => x.id === id);
  if (!item) return this.toast('服务项不存在');
  const groupLabel = g => (g === 'expert' ? '专家预约' : '陪诊服务');
  const changes = [];
  if (name !== item.name) changes.push(['名称', `${item.name} → ${name}`]);
  if (price !== item.price) changes.push(['价格', `¥${item.price} → ¥${price}`]);
  if (unit !== item.unit) changes.push(['计价单位', `${item.unit} → ${unit}`]);
  if (group !== (item.group || 'escort')) changes.push(['分组', `${groupLabel(item.group)} → ${groupLabel(group)}`]);
  if (desc !== (item.desc || '')) changes.push(['服务说明', '已修改']);
  if (!changes.length) { this.toast('没有需要保存的修改'); return; }
  const affected = name !== item.name ? CareStore.busyNeeds(n => n.serviceType === item.name).length : 0;
  WUtil.confirm({
    title: '确认保存服务项修改',
    desc: affected
      ? `改名将同步更新 ${affected} 条未完成需求的服务类型；已完成需求保持原名与原价格快照。`
      : '修改后患者端"我的需求"表单立即生效，历史需求不受影响。',
    rows: changes,
    okText: '确认保存',
    onOk: () => {
      try {
        const r = CareStore.updatePriceItem(id, { name, price, desc, unit, group });
        this.toast(`服务项已更新${r.renamedNeeds ? `（同步 ${r.renamedNeeds} 条未完成需求）` : ''}`);
        this.closeModal();
        this.renderContent();
      } catch (e) { this.toast(e.message); }
    },
  });
};

Admin.togglePriceActive = function(id) {
  const item = CareStore.state.prices.find(p => p.id === id);
  if (!item) return this.toast('服务项不存在');
  const restoring = item.active === false;
  const doToggle = () => {
    try {
      CareStore.setPriceActive(id, restoring);
      this.toast(restoring ? `${item.name} 已恢复在售` : `${item.name} 已停用，患者端不再展示`);
      this.renderContent();
    } catch (e) { this.toast(e.message); }
  };
  if (restoring) return doToggle();
  const busy = CareStore.busyNeeds(n => n.serviceType === item.name).length;
  WUtil.confirm({
    title: '确认停用服务项',
    desc: `停用后患者端表单不再展示「${item.name}」，历史需求不受影响${busy ? `；当前仍有 ${busy} 条未完成需求使用该服务` : ''}。`,
    rows: [['服务项', item.name], ['当前状态', '在售'], ['未完成需求', `${busy} 条`]],
    okText: '确认停用',
    danger: true,
    onOk: doToggle,
  });
};

Admin.deletePrice = function(id) {
  const item = CareStore.state.prices.find(p => p.id === id);
  if (!item) return this.toast('服务项不存在');
  const busy = CareStore.busyNeeds(n => n.serviceType === item.name).length;
  WUtil.confirm({
    title: '确认删除服务项',
    desc: busy
      ? `「${item.name}」当前有 ${busy} 条未完成需求引用，系统会阻止删除，请改用「停用」。`
      : `删除后患者端不再展示「${item.name}」；如为误删，可重新新增同名服务项。`,
    rows: [['服务项', item.name], ['公开价格', `¥${item.price}/${item.unit}`], ['未完成需求', `${busy} 条`]],
    okText: '确认删除',
    danger: true,
    onOk: () => {
      try {
        CareStore.removePrice(id);
        this.toast('服务项已删除');
        this.renderContent();
      } catch (e) { this.toast(e.message); }
    },
  });
};

// ======================================================================
// B5：档案管理（就诊档案 + 复查提醒 + 患者数据 CRUD）
// 覆盖层：路由链扩展 + 新菜单页；患者数据改为读写 CareStore.state.patients
// ======================================================================
const _b4RenderContent = Admin.renderContent.bind(Admin);
Admin.renderContent = function() {
  const id = this.currentMenu;
  if (id === 'records') {
    document.getElementById('atCrumb').textContent = '档案管理';
    const el = document.getElementById('adminContent');
    el.classList.remove('fade-in'); void el.offsetWidth; el.classList.add('fade-in');
    this.renderRecords(el);
    return;
  }
  _b4RenderContent();
};

// 复查状态徽章
Admin.recheckBadge = function(a) {
  if (!a.needRecheck) return '<span class="status-badge cancelled">无需复查</span>';
  if (a.recheckStatus === '已复查') return '<span class="status-badge done">已复查</span>';
  const days = CareStore.daysUntil(a.recheckDate);
  if (days === null) return '<span class="status-badge pending">待复查</span>';
  if (days < 0) return `<span class="status-badge cancelled">已逾期 ${Math.abs(days)} 天</span>`;
  const cls = days <= RECHECK_REMIND_DAYS ? 'pending' : 'accepted';
  return `<span class="status-badge ${cls}">${days === 0 ? '今日复查' : `还有 ${days} 天`}</span>`;
};

Admin.renderRecords = function(el) {
  const reminders = CareStore.checkRecheckReminders();
  const archives = CareStore.activeArchives();
  const patients = CareStore.activePatients();
  const filter = this._recordFilter || 'all';
  const list = archives.filter(a => {
    if (filter === 'due') return a.needRecheck && a.recheckStatus === '待复查' && a.recheckStatus !== '已复查';
    if (filter === 'overdue') return a.recheckStatus === '已逾期';
    if (filter === 'rechecked') return a.recheckStatus === '已复查';
    return true;
  });
  el.innerHTML = `
    <div class="page-head"><h2>档案管理</h2><div>记录就诊情况与复查计划：管理员建档、患者可补充，复查到期自动提醒</div></div>

    <section class="db-card">
      <div class="db-card-head"><h3>${ICON.alert} <span style="margin-left:6px;">复查提醒待办（${reminders.due.length + reminders.overdue.length}）</span></h3>
        <span class="cp-sub">到期前 ${reminders.remindDays} 天自动提醒患者</span></div>
      <div class="db-card-body">
        ${(reminders.overdue.length + reminders.due.length) === 0 ? '<div class="empty-inline">暂无待复查档案</div>' : `
          <div class="reminder-list">
            ${reminders.overdue.map(x => `<div class="reminder-item overdue"><div><strong>${WUtil.escape(x.archive.patientName)}</strong> 的复查已逾期 ${Math.abs(x.days)} 天<div class="cp-sub">${WUtil.escape(x.archive.hospital)} · 计划复查 ${WUtil.escape(x.archive.recheckDate)}</div></div><button class="btn btn-sm" onclick="Admin.openArchiveForm('${x.archive.id}')">去处理</button></div>`).join('')}
            ${reminders.due.map(x => `<div class="reminder-item"><div><strong>${WUtil.escape(x.archive.patientName)}</strong> 需在 ${WUtil.escape(x.archive.recheckDate)} 前复查<div class="cp-sub">${WUtil.escape(x.archive.hospital)} · ${x.days === 0 ? '今天到期' : `还有 ${x.days} 天`}</div></div><button class="btn btn-sm" onclick="Admin.openArchiveForm('${x.archive.id}')">去处理</button></div>`).join('')}
          </div>`}
      </div>
    </section>

    <section class="db-card">
      <div class="db-card-head"><h3>${ICON.fileText} <span style="margin-left:6px;">就诊档案（${archives.length}）</span></h3>
        <button class="btn btn-sm" onclick="Admin.openArchiveForm(null)">+ 新建档案</button></div>
      <div class="db-card-body">
        <div class="filter-bar">
          ${[['all', `全部（${archives.length}）`], ['due', '待复查'], ['overdue', '已逾期'], ['rechecked', '已复查']].map(([k, name]) => `<button class="filter-btn ${filter === k ? 'active' : ''}" onclick="Admin.setRecordFilter('${k}')">${name}</button>`).join('')}
        </div>
        ${list.length ? list.map(a => `
          <article class="archive-card">
            <div class="ac-head">
              <div>
                <div class="ac-name">${WUtil.escape(a.patientName)} <span class="ac-hosp">${WUtil.escape(a.hospital)}${a.dept ? ` · ${WUtil.escape(a.dept)}` : ''}</span></div>
                <div class="cp-sub">就诊日期 ${WUtil.escape(a.visitDate || '-')} · 主诊医生 ${WUtil.escape(a.doctor || '未填写')} · 更新于 ${WUtil.escape(a.updatedAt || '-')}</div>
              </div>
              ${this.recheckBadge(a)}
            </div>
            <div class="ac-body">
              <div class="ac-row"><span class="ac-label">就诊情况</span><span class="ac-value">${WUtil.escape(a.visitSummary || '待补充')}</span></div>
              <div class="ac-row"><span class="ac-label">基本诊疗内容</span><span class="ac-value">${WUtil.escape(a.careContent || '待补充')}</span></div>
              ${a.needRecheck ? `<div class="ac-row"><span class="ac-label">复查到期</span><span class="ac-value">${WUtil.escape(a.recheckDate || '-')}${a.recheckNote ? ` · ${WUtil.escape(a.recheckNote)}` : ''}</span></div>` : ''}
              <div class="ac-src">填写来源：${Object.entries(a.fieldsSource || {}).map(([k, v]) => `${WUtil.escape(this.archiveFieldLabel(k))}←${v === 'patient' ? '患者' : '管理员'}`).join('、') || '未记录'}</div>
            </div>
            <div class="hc-actions">
              <button class="btn btn-sm" onclick="Admin.openArchiveForm('${a.id}')">编辑</button>
              ${a.needRecheck && a.recheckStatus !== '已复查' ? `<button class="btn btn-outline btn-sm" onclick="Admin.markArchiveRechecked('${a.id}')">标记已复查</button>` : ''}
              <button class="btn btn-outline btn-sm danger" onclick="Admin.deleteArchive('${a.id}')">删除</button>
            </div>
          </article>`).join('') : '<div class="empty-inline">暂无档案，点击右上角新建</div>'}
      </div>
    </section>

    <section class="db-card">
      <div class="db-card-head"><h3>${ICON.patients} <span style="margin-left:6px;">患者数据（${patients.length}）</span></h3>
        <button class="btn btn-sm" onclick="Admin.openPatientForm(null)">+ 新增患者</button></div>
      <div class="db-card-body"><div class="table-card"><table class="data-table">
        <thead><tr><th>患者</th><th>性别/年龄</th><th>电话</th><th>病史</th><th>档案数</th><th>来源</th><th>操作</th></tr></thead>
        <tbody>${patients.map(p => `
          <tr>
            <td><div class="cell-patient"><div class="cp-avatar">${WUtil.escape((p.name || '?').charAt(0))}</div><div><div class="cp-name">${WUtil.escape(p.name)}</div><div class="cp-sub">${WUtil.escape(p.id)}</div></div></div></td>
            <td>${WUtil.escape(p.gender || '-')} / ${WUtil.escape(String(p.age ?? '-'))}</td>
            <td>${WUtil.escape(p.phone || '-')}</td>
            <td>${WUtil.escape(String(p.history || '-').slice(0, 12))}</td>
            <td>${CareStore.archivesFor(p.name).length}</td>
            <td>${p.source === 'patient' ? '患者端' : '管理员'}</td>
            <td><div class="hc-actions" style="margin:0;padding:0;border:0;">
              <button class="btn btn-outline btn-sm" onclick="Admin.openPatientForm('${p.id}')">编辑</button>
              <button class="btn btn-outline btn-sm danger" onclick="Admin.deletePatient('${p.id}')">删除</button>
            </div></td>
          </tr>`).join('')}</tbody>
      </table></div></div>
    </section>
  `;
};

Admin.setRecordFilter = function(filter) {
  this._recordFilter = filter;
  this.renderRecords(document.getElementById('adminContent'));
};

Admin.archiveFieldLabel = function(key) {
  return ({ hospital:'医院', dept:'科室', visitDate:'就诊日期', doctor:'主诊医生', visitSummary:'就诊情况', careContent:'诊疗内容' })[key] || key;
};

Admin.openArchiveForm = function(id) {
  const a = id ? CareStore.archive(id) : null;
  if (id && !a) return this.toast('档案不存在');
  const patients = CareStore.activePatients();
  const hospitals = CareStore.activeHospitals();
  const dateVal = (iso) => String(iso || '').slice(0, 10);
  this.modal(`
    <div class="modal-head-row"><h2>${a ? '编辑就诊档案' : '新建就诊档案'}</h2>${a ? this.recheckBadge(a) : ''}</div>
    <p class="helper-text">管理员与患者可双向填写：患者端补充的内容不会覆盖管理员已填字段，来源会分别记录。</p>
    <div class="form-grid-2">
      <div><label class="field-label" for="af_patient">就诊人 <em>*</em></label><input class="fg-input" id="af_patient" list="af_patient_list" value="${WUtil.escape(a?.patientName || '')}" placeholder="选择或输入姓名" />
        <datalist id="af_patient_list">${patients.map(p => `<option value="${WUtil.escape(p.name)}"></option>`).join('')}</datalist></div>
      <div><label class="field-label" for="af_visitDate">就诊日期</label><input class="fg-input" id="af_visitDate" type="date" value="${WUtil.escape(dateVal(a?.visitDate || CareStore.todayISO()))}" /></div>
      <div><label class="field-label" for="af_hospital">就诊医院 <em>*</em></label><input class="fg-input" id="af_hospital" list="af_hospital_list" value="${WUtil.escape(a?.hospital || '')}" placeholder="选择或输入医院" />
        <datalist id="af_hospital_list">${hospitals.map(h => `<option value="${WUtil.escape(h.name)}"></option>`).join('')}</datalist></div>
      <div><label class="field-label" for="af_dept">科室</label><input class="fg-input" id="af_dept" value="${WUtil.escape(a?.dept || '')}" placeholder="例如：心内科" /></div>
      <div class="form-grid-full"><label class="field-label" for="af_doctor">主诊医生</label><input class="fg-input" id="af_doctor" value="${WUtil.escape(a?.doctor || '')}" placeholder="例如：张明华" /></div>
      <div class="form-grid-full"><label class="field-label" for="af_visitSummary">就诊情况</label><textarea class="fg-input" id="af_visitSummary" rows="3" placeholder="本次就诊的主要情况与结论">${WUtil.escape(a?.visitSummary || '')}</textarea></div>
      <div class="form-grid-full"><label class="field-label" for="af_careContent">基本诊疗内容</label><textarea class="fg-input" id="af_careContent" rows="3" placeholder="检查项目、用药调整、医嘱要点等">${WUtil.escape(a?.careContent || '')}</textarea></div>
      <div class="form-grid-full">
        <label class="consent-row"><input type="checkbox" id="af_needRecheck" ${a?.needRecheck ? 'checked' : ''} onchange="document.getElementById('af_recheckBox').hidden=!this.checked" /> 需要复查</label>
      </div>
      <div class="form-grid-full" id="af_recheckBox" ${a?.needRecheck ? '' : 'hidden'}>
        <div class="form-grid-2">
          <div><label class="field-label" for="af_recheckDate">复查到期时间 <em>*</em></label><input class="fg-input" id="af_recheckDate" type="date" value="${WUtil.escape(dateVal(a?.recheckDate || ''))}" /></div>
          <div><label class="field-label" for="af_recheckNote">复查提示</label><input class="fg-input" id="af_recheckNote" value="${WUtil.escape(a?.recheckNote || '')}" placeholder="例如：携带血压记录本" /></div>
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-outline" onclick="Admin.closeModal()">取消</button>
      ${a ? `<button class="btn btn-outline" onclick="Admin.markArchiveRechecked('${a.id}')">标记已复查</button>` : ''}
      <button class="btn" onclick="Admin.saveArchiveForm('${a ? a.id : ''}')">${a ? '保存修改' : '创建档案'}</button>
    </div>
  `);
};

Admin.saveArchiveForm = function(id) {
  const patientName = WUtil.value('af_patient');
  const hospital = WUtil.value('af_hospital');
  const needRecheck = !!document.getElementById('af_needRecheck')?.checked;
  const recheckDate = WUtil.value('af_recheckDate');
  if (!patientName) { this.toast('请填写就诊人'); document.getElementById('af_patient')?.focus(); return; }
  if (!hospital) { this.toast('请填写就诊医院'); document.getElementById('af_hospital')?.focus(); return; }
  if (needRecheck && !recheckDate) { this.toast('需要复查时必须填写复查到期时间'); document.getElementById('af_recheckDate')?.focus(); return; }
  const patient = CareStore.patientByName(patientName);
  const payload = {
    patientId: patient ? patient.id : '',
    patientName, hospital,
    dept: WUtil.value('af_dept'), doctor: WUtil.value('af_doctor'),
    visitDate: WUtil.value('af_visitDate') || CareStore.todayISO(),
    visitSummary: WUtil.value('af_visitSummary'), careContent: WUtil.value('af_careContent'),
    needRecheck, recheckDate: needRecheck ? recheckDate : '',
    recheckNote: WUtil.value('af_recheckNote'),
  };
  try {
    if (id) { CareStore.updateArchive(id, payload, 'admin'); this.toast('档案已更新，患者端已同步'); }
    else { CareStore.addArchive(payload, 'admin'); this.toast('档案已创建，患者端可见'); }
    this.closeModal();
    this.renderContent();
  } catch (e) { this.toast(e.message); }
};

Admin.markArchiveRechecked = function(id) {
  try {
    CareStore.markArchiveRechecked(id);
    this.toast('已标记为复查完成，患者端提醒已解除');
    this.closeModal();
    this.renderContent();
  } catch (e) { this.toast(e.message); }
};

Admin.deleteArchive = function(id) {
  const a = CareStore.archive(id);
  if (!a) return this.toast('档案不存在');
  WUtil.confirm({
    title: '确认删除就诊档案',
    desc: `删除后患者端"我的档案"不再展示该记录，复查提醒同时解除。`,
    rows: [['就诊人', a.patientName], ['医院', a.hospital], ['就诊日期', a.visitDate || '-']],
    okText: '确认删除',
    danger: true,
    onOk: () => {
      try {
        CareStore.removeArchive(id);
        this.toast('档案已删除');
        this.renderContent();
      } catch (e) { this.toast(e.message); }
    },
  });
};

// ---- 患者数据 CRUD（管理员）----
Admin.openPatientForm = function(id) {
  const p = id ? CareStore.patient(id) : null;
  if (id && !p) return this.toast('患者不存在');
  this.modal(`
    <div class="modal-head-row"><h2>${p ? '编辑患者' : '新增患者'}</h2></div>
    <div class="form-grid-2">
      <div><label class="field-label" for="pt_name">姓名 <em>*</em></label><input class="fg-input" id="pt_name" value="${WUtil.escape(p?.name || '')}" /></div>
      <div><label class="field-label" for="pt_phone">联系电话</label><input class="fg-input" id="pt_phone" value="${WUtil.escape(p?.phone || '')}" /></div>
      <div><label class="field-label" for="pt_gender">性别</label><select class="fg-select" id="pt_gender">${['男', '女'].map(g => `<option ${p?.gender === g ? 'selected' : ''}>${g}</option>`).join('')}</select></div>
      <div><label class="field-label" for="pt_age">年龄</label><input class="fg-input" id="pt_age" type="number" min="0" max="120" value="${WUtil.escape(String(p?.age ?? ''))}" /></div>
      <div class="form-grid-full"><label class="field-label" for="pt_history">既往病史</label><input class="fg-input" id="pt_history" value="${WUtil.escape(p?.history || '')}" /></div>
      <div><label class="field-label" for="pt_allergy">过敏史</label><input class="fg-input" id="pt_allergy" value="${WUtil.escape(p?.allergy || '')}" /></div>
      <div><label class="field-label" for="pt_medicine">用药情况</label><input class="fg-input" id="pt_medicine" value="${WUtil.escape(p?.medicine || '')}" /></div>
      <div><label class="field-label" for="pt_mobility">行动能力</label><input class="fg-input" id="pt_mobility" value="${WUtil.escape(p?.mobility || '')}" /></div>
      <div><label class="field-label" for="pt_insurance">医保</label><input class="fg-input" id="pt_insurance" value="${WUtil.escape(p?.insurance || '')}" /></div>
      <div class="form-grid-full"><label class="field-label" for="pt_note">备注</label><input class="fg-input" id="pt_note" value="${WUtil.escape(p?.note || '')}" /></div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-outline" onclick="Admin.closeModal()">取消</button>
      <button class="btn" onclick="Admin.savePatientForm('${p ? p.id : ''}')">${p ? '保存修改' : '创建患者'}</button>
    </div>
  `);
};

Admin.savePatientForm = function(id) {
  const name = WUtil.value('pt_name');
  if (!name) { this.toast('请填写患者姓名'); document.getElementById('pt_name')?.focus(); return; }
  const payload = {
    name, phone: WUtil.value('pt_phone'), gender: WUtil.value('pt_gender') || '男',
    age: WUtil.value('pt_age'), history: WUtil.value('pt_history'), allergy: WUtil.value('pt_allergy'),
    medicine: WUtil.value('pt_medicine'), mobility: WUtil.value('pt_mobility'),
    insurance: WUtil.value('pt_insurance'), note: WUtil.value('pt_note'),
  };
  try {
    if (id) { CareStore.updatePatient(id, payload); this.toast('患者资料已更新'); }
    else { CareStore.addPatient(payload); this.toast('患者已新增'); }
    this.closeModal();
    this.renderContent();
  } catch (e) { this.toast(e.message); }
};

Admin.deletePatient = function(id) {
  const p = CareStore.patient(id);
  if (!p) return this.toast('患者不存在');
  const busy = CareStore.busyNeeds(n => n.patientName === p.name).length;
  const archives = CareStore.archivesFor(p.name).length;
  WUtil.confirm({
    title: '确认删除患者',
    desc: busy
      ? `「${p.name}」当前有 ${busy} 条未完成需求，系统会阻止删除，请先处理需求。`
      : `删除后患者端"就诊人"不再展示该患者${archives ? `；其 ${archives} 条就诊档案仍保留（可在档案管理中单独删除）` : ''}。`,
    rows: [['患者', `${p.name}（${p.gender || '-'}/${p.age ?? '-'}）`], ['联系电话', p.phone || '-'], ['未完成需求', `${busy} 条`], ['就诊档案', `${archives} 条`]],
    okText: '确认删除',
    danger: true,
    onOk: () => {
      try {
        CareStore.removePatient(id);
        this.toast('患者已删除');
        this.renderContent();
      } catch (e) { this.toast(e.message); }
    },
  });
};

// ---- 患者端"我的"页：注入"我的档案"入口（登录后可见，与管理员同源数据）----
const _b5RenderProfile = Patient.renderProfile.bind(Patient);
Patient.renderProfile = function(el) {
  _b5RenderProfile(el);
  const anchor = `<div class="me-menu-item" onclick="Patient.navigateTo(el => Patient.renderProgress(el), '陪诊进度')">`;
  if (!el.innerHTML.includes(anchor)) return;
  const entry = `<div class="me-menu-item" onclick="Patient.navigateTo(el => Patient.renderMyArchives(el), '我的档案')">
          <div class="me-menu-icon" style="background:rgba(196,146,46,0.1); color:var(--accent-amber);">${P_ICON.clipboard}</div>
          <div class="me-menu-text">我的档案</div>
          <div class="me-menu-arrow">${P_ICON.chevronRight}</div>
        </div>
        `;
  el.innerHTML = el.innerHTML.replace(anchor, entry + anchor);
};

// ======================================================================
// B6：陪诊师管理（完整 CRUD + 停用）与患者端"意向陪诊师"
// 规则：患者仅登记意向（preferredEscort*），订单仍为"待处理"且不携带已分配陪诊师
// ======================================================================
Admin.renderEscorts = function(el) {
  const all = CareStore.state.escorts;
  const active = CareStore.activeEscorts();
  const inactive = all.filter(e => e.active === false);
  const filter = this._escortFilter || 'active';
  const list = filter === 'inactive' ? inactive : active;
  el.innerHTML = `
    <div class="page-head"><h2>陪诊师管理</h2><div>在岗 ${active.length} 名${inactive.length ? ` · 已停用 ${inactive.length} 名` : ''}；停用后不再出现在派单与患者端意向列表</div></div>
    <div class="toolbar">
      <div class="filter-bar" style="margin:0;">
        <button class="filter-btn ${filter === 'active' ? 'active' : ''}" onclick="Admin.setEscortFilter('active')">在岗（${active.length}）</button>
        <button class="filter-btn ${filter === 'inactive' ? 'active' : ''}" onclick="Admin.setEscortFilter('inactive')">已停用（${inactive.length}）</button>
      </div>
      <button class="btn btn-sm" onclick="Admin.openEscortForm(null)">+ 新增陪诊师</button>
    </div>
    <div class="escort-grid">
      ${list.length ? list.map(e => `
        <div class="escort-card${e.active === false ? ' inactive' : ''}">
          <div class="ec-head">
            <div class="ec-avatar" onclick="Admin.openEscort('${e.id}')">${WUtil.escape(e.avatar || (e.name || '?').charAt(0))}</div>
            <div class="ec-info" onclick="Admin.openEscort('${e.id}')">
              <div class="ec-name">${WUtil.escape(e.name)} <span class="ec-sub">${WUtil.escape(e.gender || '-')}/${WUtil.escape(String(e.age ?? '-'))}</span></div>
              <div class="ec-meta"><span class="ec-star">★</span> ${WUtil.escape(String(e.star ?? 5))} · ${Number(e.orders || 0)}单 · ${WUtil.escape(e.region || '未填写区域')}</div>
            </div>
            <span class="status-badge ${e.active === false ? 'cancelled' : (e.status === '空闲' ? 'accepted' : 'serving')}">${WUtil.escape(e.status || '空闲')}</span>
          </div>
          <div class="ec-tags">${(e.tags || []).slice(0, 4).map(t => `<span class="tag tag-gray">${WUtil.escape(t)}</span>`).join('') || '<span class="cp-sub">未填写专长</span>'}</div>
          <div class="ec-stats">
            <div><div class="ec-num">¥${Number(e.income || 0)}</div><div class="ec-label">本月收入</div></div>
            <div><div class="ec-num">${Number(e.completionRate || 100)}%</div><div class="ec-label">完成率</div></div>
            <div><div class="ec-num">${Number(e.score || 90)}</div><div class="ec-label">综合评分</div></div>
          </div>
          <div class="hc-actions">
            <button class="btn btn-outline btn-sm" onclick="Admin.openEscortForm('${e.id}')">编辑</button>
            <button class="btn btn-outline btn-sm" onclick="Admin.toggleEscortActive('${e.id}')">${e.active === false ? '恢复在岗' : '停用'}</button>
            <button class="btn btn-outline btn-sm danger" onclick="Admin.deleteEscort('${e.id}')">删除</button>
          </div>
        </div>`).join('') : '<div class="empty-inline">暂无陪诊师</div>'}
    </div>
  `;
};

Admin.setEscortFilter = function(filter) {
  this._escortFilter = filter;
  this.renderEscorts(document.getElementById('adminContent'));
};

Admin.openEscortForm = function(id) {
  const e = id ? CareStore.escort(id) : null;
  if (id && !e) return this.toast('陪诊师不存在');
  this.modal(`
    <div class="modal-head-row"><h2>${e ? '编辑陪诊师' : '新增陪诊师'}</h2>${e ? `<span class="status-badge ${e.active === false ? 'cancelled' : 'done'}">${e.active === false ? '已停用' : '在岗'}</span>` : ''}</div>
    <p class="helper-text">专长标签用于派单参考（如"心内科""轮椅协助""老人陪诊"），也是患者端意向列表的展示依据。</p>
    <div class="form-grid-2">
      <div><label class="field-label" for="ef_name">姓名 <em>*</em></label><input class="fg-input" id="ef_name" value="${WUtil.escape(e?.name || '')}" /></div>
      <div><label class="field-label" for="ef_phone">联系电话</label><input class="fg-input" id="ef_phone" value="${WUtil.escape(e?.phone || '')}" placeholder="138-0000-0000" /></div>
      <div><label class="field-label" for="ef_gender">性别</label><select class="fg-select" id="ef_gender">${['女', '男'].map(g => `<option ${e?.gender === g ? 'selected' : ''}>${g}</option>`).join('')}</select></div>
      <div><label class="field-label" for="ef_age">年龄</label><input class="fg-input" id="ef_age" type="number" min="18" max="70" value="${WUtil.escape(String(e?.age ?? ''))}" /></div>
      <div><label class="field-label" for="ef_region">服务区域</label><input class="fg-input" id="ef_region" value="${WUtil.escape(e?.region || '')}" placeholder="例如：东城区" /></div>
      <div><label class="field-label" for="ef_joinDate">入职日期</label><input class="fg-input" id="ef_joinDate" type="date" value="${WUtil.escape(String(e?.joinDate || CareStore.todayISO()).slice(0, 10))}" /></div>
      <div class="form-grid-full"><label class="field-label" for="ef_tags">专长标签（顿号/逗号分隔）</label><input class="fg-input" id="ef_tags" value="${WUtil.escape((e?.tags || []).join('、'))}" placeholder="心内科、老人陪诊、轮椅协助" /></div>
      <div><label class="field-label" for="ef_status">当前状态</label><select class="fg-select" id="ef_status">${['空闲', '服务中', '已派单', '已停用'].map(s => `<option ${e?.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
      <div><label class="field-label" for="ef_score">综合评分</label><input class="fg-input" id="ef_score" type="number" min="0" max="100" value="${Number(e?.score ?? 90)}" /></div>
      <div class="form-grid-full"><label class="field-label" for="ef_note">备注</label><input class="fg-input" id="ef_note" value="${WUtil.escape(e?.note || '')}" placeholder="例如：擅长与耳背老人沟通" /></div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-outline" onclick="Admin.closeModal()">取消</button>
      <button class="btn" onclick="Admin.saveEscortForm('${e ? e.id : ''}')">${e ? '保存修改' : '创建陪诊师'}</button>
    </div>
  `);
};

Admin.saveEscortForm = function(id) {
  const name = WUtil.value('ef_name');
  if (!name) { this.toast('请填写陪诊师姓名'); document.getElementById('ef_name')?.focus(); return; }
  const payload = {
    name, phone: WUtil.value('ef_phone'), gender: WUtil.value('ef_gender') || '女',
    age: WUtil.value('ef_age'), region: WUtil.value('ef_region'),
    joinDate: WUtil.value('ef_joinDate') || CareStore.todayISO(),
    tags: WUtil.value('ef_tags'), status: WUtil.value('ef_status') || '空闲',
    score: Number(WUtil.value('ef_score')) || 90, note: WUtil.value('ef_note'),
  };
  try {
    if (id) { CareStore.updateEscort(id, payload); this.toast('陪诊师资料已更新'); }
    else { CareStore.addEscort(payload); this.toast('陪诊师已新增，可参与派单'); }
    this.closeModal();
    this.renderContent();
  } catch (e) { this.toast(e.message); }
};

Admin.toggleEscortActive = function(id) {
  const e = CareStore.escort(id);
  if (!e) return this.toast('陪诊师不存在');
  const restoring = e.active === false;
  const doToggle = () => {
    try {
      CareStore.setEscortActive(id, restoring);
      this.toast(restoring ? `${e.name} 已恢复在岗` : `${e.name} 已停用，不再参与派单`);
      this.renderContent();
    } catch (err) { this.toast(err.message); }
  };
  if (restoring) return doToggle();
  const busy = CareStore.busyNeeds(n => n.escortId === e.id && ['已分配', '服务中'].includes(n.status)).length;
  WUtil.confirm({
    title: '确认停用陪诊师',
    desc: `停用后「${e.name}」不再出现在派单弹窗与患者端意向陪诊师列表中；历史订单记录保留${busy ? `；当前有 ${busy} 条进行中订单` : ''}。`,
    rows: [['陪诊师', e.name], ['当前状态', e.status || '空闲'], ['进行中订单', `${busy} 条`]],
    okText: '确认停用',
    danger: true,
    onOk: doToggle,
  });
};

Admin.deleteEscort = function(id) {
  const e = CareStore.escort(id);
  if (!e) return this.toast('陪诊师不存在');
  const busy = CareStore.busyNeeds(n => n.escortId === e.id && ['已分配', '服务中'].includes(n.status)).length;
  WUtil.confirm({
    title: '确认删除陪诊师',
    desc: busy
      ? `「${e.name}」当前有 ${busy} 条进行中订单，系统会阻止删除，请改用「停用」。`
      : `删除后「${e.name}」不再参与派单，历史订单中的姓名与电话记录保留。`,
    rows: [['陪诊师', e.name], ['联系电话', e.phone || '-'], ['进行中订单', `${busy} 条`]],
    okText: '确认删除',
    danger: true,
    onOk: () => {
      try {
        CareStore.removeEscort(id);
        this.toast('陪诊师已删除（历史订单记录保留）');
        this.renderContent();
      } catch (err) { this.toast(err.message); }
    },
  });
};

// 陪诊师详情（改为读取 CareStore 并带操作入口）
Admin.openEscort = function(id) {
  const e = CareStore.escort(id);
  if (!e) return this.toast('陪诊师不存在');
  const related = CareStore.state.needs.filter(n => n.escortId === e.id);
  const serving = related.filter(n => ['已分配', '服务中'].includes(n.status));
  this.modal(`
    <div class="modal-head-row">
      <h2>${WUtil.escape(e.name)} 的档案</h2>
      <span class="status-badge ${e.active === false ? 'cancelled' : (e.status === '空闲' ? 'accepted' : 'serving')}">${e.active === false ? '已停用' : WUtil.escape(e.status || '空闲')}</span>
    </div>
    <div class="modal-grid-2">
      <section class="modal-card">
        <div class="card-title">${ICON.user} 基本信息</div>
        <div class="pb-row"><span class="pb-label">姓名</span><span class="pb-value">${WUtil.escape(e.name)}</span></div>
        <div class="pb-row"><span class="pb-label">性别/年龄</span><span class="pb-value">${WUtil.escape(e.gender || '-')} / ${WUtil.escape(String(e.age ?? '-'))}岁</span></div>
        <div class="pb-row"><span class="pb-label">电话</span><span class="pb-value">${WUtil.escape(e.phone || '-')}</span></div>
        <div class="pb-row"><span class="pb-label">入职日期</span><span class="pb-value">${WUtil.escape(e.joinDate || '-')}</span></div>
        <div class="pb-row"><span class="pb-label">服务区域</span><span class="pb-value">${WUtil.escape(e.region || '-')}</span></div>
      </section>
      <section class="modal-card">
        <div class="card-title">${ICON.activity} 业务数据</div>
        <div class="pb-row"><span class="pb-label">总订单数</span><span class="pb-value">${Number(e.orders || 0)}</span></div>
        <div class="pb-row"><span class="pb-label">进行中订单</span><span class="pb-value">${serving.length}</span></div>
        <div class="pb-row"><span class="pb-label">评分</span><span class="pb-value"><span class="star">★</span> ${WUtil.escape(String(e.star ?? 5))}</span></div>
        <div class="pb-row"><span class="pb-label">完成率</span><span class="pb-value">${Number(e.completionRate || 100)}%</span></div>
        <div class="pb-row"><span class="pb-label">综合评分</span><span class="pb-value">${Number(e.score || 90)}</span></div>
      </section>
    </div>
    <div class="modal-card">
      <div class="card-title">${ICON.shield} 专长标签</div>
      <div class="cell-tags">${(e.tags || []).map(t => `<span class="tag tag-gray">${WUtil.escape(t)}</span>`).join('') || '<span class="cp-sub">未填写</span>'}</div>
      ${e.note ? `<p class="helper-text" style="margin-top:8px;">备注：${WUtil.escape(e.note)}</p>` : ''}
    </div>
    <div class="modal-foot">
      <button class="btn btn-outline" onclick="Admin.closeModal()">关闭</button>
      <button class="btn btn-outline" onclick="Admin.openEscortForm('${e.id}')">编辑资料</button>
      <button class="btn" onclick="Admin.toggleEscortActive('${e.id}');Admin.closeModal();">${e.active === false ? '恢复在岗' : '停用该陪诊师'}</button>
    </div>
  `);
};

// 派单弹窗后处理：过滤已停用陪诊师按钮 + 标注患者意向（不改写原 openNeed 逻辑）
Admin.filterEscortButtons = function(bodyEl, need) {
  const buttons = bodyEl && bodyEl.querySelectorAll ? bodyEl.querySelectorAll('button') : [];
  let removed = 0, marked = 0;
  buttons.forEach(btn => {
    if (!btn.getAttribute) return;
    const onclick = btn.getAttribute('onclick') || '';
    const m = onclick.match(/assignEscortV2\('([^']+)','([^']+)'\)/);
    if (!m) return;
    const escort = CareStore.escort(m[2]);
    if (!escort || escort.active === false) {
      if (btn.remove) btn.remove();
      removed += 1;
      return;
    }
    if (need && need.preferredEscortId === escort.id) {
      if (btn.classList && btn.classList.add) btn.classList.add('preferred-escort');
      if (String(btn.innerHTML).indexOf('意向') === -1) btn.innerHTML = `★ 意向陪诊师：${btn.innerHTML}`;
      marked += 1;
    }
  });
  return { removed, marked };
};

const _b6OpenNeed = Admin.openNeed.bind(Admin);
Admin.openNeed = function(id) {
  _b6OpenNeed(id);
  const need = CareStore.need(id);
  const body = document.getElementById('_modalBody');
  if (!body) return;
  const stat = this.filterEscortButtons(body, need);
  if (need && need.preferredEscortId && stat.marked) {
    const e = CareStore.escort(need.preferredEscortId);
    if (body.innerHTML && !body.innerHTML.includes('患者意向')) {
      body.innerHTML = body.innerHTML.replace(
        /(<div class="modal-head-row">[\s\S]*?<\/div>)/,
        `$1<div class="preferred-banner">患者意向陪诊师：<strong>${WUtil.escape(e ? e.name : need.preferredEscortName || '')}</strong>（仅供参考，由平台最终匹配）</div>`
      );
    }
  }
};

// ---- 患者端"我的需求"表单：意向陪诊师（可选，仅登记意向）----
Patient.preferredEscortFieldHTML = function() {
  const d = CareStore.draft();
  const escorts = CareStore.activeEscorts();
  const options = escorts.map(e => {
    const tags = (e.tags || []).slice(0, 2).join('/');
    const busy = e.status && e.status !== '空闲' ? `（${e.status}）` : '';
    return `<option value="${WUtil.escape(e.id)}" ${d.preferredEscortId === e.id ? 'selected' : ''}>${WUtil.escape(e.name)}${tags ? ` · ${WUtil.escape(tags)}` : ''}${busy}</option>`;
  }).join('');
  return `
    <label class="field-label" for="req_escort">意向陪诊师（可选）</label>
    <select class="fg-select" id="req_escort">
      <option value="">由平台推荐（默认）</option>
      ${options}
    </select>
    <div class="helper-text">仅登记意向：平台会优先按意向安排，最终由平台按病情与医院匹配确定；需求未分配前不会展示陪诊师联系方式。</div>
  `;
};

const _b6RenderNeed = Patient.renderNeed.bind(Patient);
Patient.renderNeed = function(el) {
  _b6RenderNeed(el);
  const anchor = '<label class="field-label" for="req_note">特殊照护需求</label>';
  if (!el.innerHTML.includes(anchor)) return;
  el.innerHTML = el.innerHTML.replace(anchor, this.preferredEscortFieldHTML() + anchor);
  const sel = document.getElementById('req_escort');
  if (sel && sel.addEventListener) {
    sel.addEventListener('change', () => {
      const id = sel.value;
      const e = id ? CareStore.escort(id) : null;
      CareStore.patchDraft({ preferredEscortId: e ? e.id : null, preferredEscortName: e ? e.name : '' });
    });
  }
};
