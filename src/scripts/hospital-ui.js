// ========== HospitalUI：医院渲染纯函数模块（零框架"组件"）==========
// 职责：医院卡片 / 特色卡 / 列表页骨架 / 详情页（严格两块：医院简介 + 重点科室）的 HTML 渲染。
// 约定：纯函数——输入数据对象，输出 HTML 字符串；状态与导航逻辑留在 patient.js。
// 依赖：P_ICON（patient.js 定义，运行时经 window 访问）；不依赖 WUtil/CareStore/App/Patient。
// 转义：所有文本插值一律过本模块自含 esc()（与 WUtil.escape 同实现）。
const HospitalUI = {
  esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  },
  icon(name) { return (window.P_ICON || {})[name] || ''; },

  // 总院纯地址（优先结构化 branches，缺省降级 address 字符串解析）
  shortAddress(h) {
    if (h.branches && h.branches.length) return h.branches[0].address || '';
    return String(h.address || '').split(/[;；]/)[0].replace(/^总院：/, '');
  },

  // 分支地址汇总串（与 store.js deriveAddress 同源，保持同步）
  branchSummary(branches) {
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
  },

  // 图片降级链：本地路径 → imageFallback URL → 隐藏显示渐变占位
  imgTag(h, className) {
    const src = h.image || '';
    const alt = this.esc(h.name || '');
    const fallback = h.imageFallback || '';
    const onerror = fallback
      ? `this.onerror=function(){this.style.display='none'};this.src='${this.esc(fallback)}'`
      : `this.style.display='none'`;
    return `<img src="${this.esc(src)}" alt="${alt}"${className ? ` class="${className}"` : ''} loading="lazy" onerror="${onerror}">`;
  },

  // 缩略图（首页"热门医院"列表用）：与特色页同源同降级链；无图时渲染品牌占位块，绝不出现破图
  renderThumb(h) {
    if (!h.image) {
      return `<div class="ph-hr-thumb placeholder">${this.icon('building')}</div>`;
    }
    return `<div class="ph-hr-thumb">${this.imgTag(h, 'ph-hr-img')}</div>`;
  },

  // 医院通用卡（特色 Tab 目录 / 独立列表页共用）
  renderCard(h) {
    const shortAddr = this.shortAddress(h);
    return `
      <div class="ph-hosp-card" onclick="Patient.navigateTo(el => Patient.goHospitalDetail('${h.id}', el), '医院详情')">
        <div class="ph-hosp-img">
          ${this.imgTag(h)}
          <span class="ph-hosp-badge">${this.esc(h.level)}</span>
        </div>
        <div class="ph-hosp-info">
          <div class="ph-hosp-name">${this.esc(h.name)}</div>
          <div class="ph-hosp-tags">
            <span class="ph-hosp-tag cat">${this.esc(h.category)}</span>
            <span class="ph-hosp-tag">${this.esc((h.keyDepts || []).slice(0, 2).join(' · '))}</span>
          </div>
          <div class="ph-hosp-intro">${this.esc(h.intro || '')}</div>
          <div class="ph-hosp-meta">
            <span class="ph-hosp-addr">${this.icon('location')} ${this.esc(shortAddr)}</span>
            <span class="ph-hosp-order">已服务 ${h.orders} 单</span>
          </div>
        </div>
      </div>
    `;
  },

  // 医院目录骨架（embedded=true 用于 Tab 内嵌：page-head 无返回钮；false 为独立页：order-header 带返回钮）
  // 筛选状态与逻辑留在 patient.js（_doSearch/_setFilter）
  renderListPage(opts) {
    const { list = [], kw = '', filter = {}, cats = [], cities = [], sorts = [], embedded = false, title = '医院列表', sub = '' } = opts;
    const head = embedded
      ? `<div class="page-head" style="margin-bottom:12px;">
          <h2 style="font-size:18px; font-weight:700;">${this.esc(title)}</h2>
          ${sub ? `<div>${this.esc(sub)}</div>` : ''}
        </div>`
      : `<div class="order-header">
          <div class="oh-back" onclick="Patient.goBack()">${this.icon('chevronLeft')}</div>
          <h2>${this.esc(title)}</h2>
        </div>`;
    return `
      <div class="order-page">
        ${head}
        <!-- 搜索框 -->
        <div class="hs-search-bar">
          <div class="hs-search-input">
            ${this.icon('search')}
            <input type="text" id="hsKeyword" placeholder="请输入医院名称" value="${this.esc(kw)}" />
          </div>
          <button class="hs-search-btn" onclick="Patient._doSearch()">搜索</button>
        </div>
        <!-- 筛选 -->
        <div class="hs-filters">
          <span style="font-size:12px; color:var(--text-muted); flex-shrink:0;">医院类别：</span>
          ${cats.map(c => `<span class="hs-filter ${filter.category === c ? 'active' : ''}" onclick="Patient._setFilter('category','${this.esc(c)}')">${this.esc(c)}</span>`).join('')}
        </div>
        <div class="hs-filters">
          <span style="font-size:12px; color:var(--text-muted); flex-shrink:0;">城市：</span>
          ${cities.map(c => `<span class="hs-filter ${filter.city === c ? 'active' : ''}" onclick="Patient._setFilter('city','${this.esc(c)}')">${this.esc(c)}</span>`).join('')}
        </div>
        <div class="hs-filters">
          <span style="font-size:12px; color:var(--text-muted); flex-shrink:0;">排序：</span>
          <span class="hs-filter ${!filter.sort ? 'active' : ''}" onclick="Patient._setFilter('sort','')">综合排序</span>
          <span class="hs-filter ${filter.sort === 'orders' ? 'active' : ''}" onclick="Patient._setFilter('sort','orders')">服务量</span>
        </div>
        <!-- 列表 -->
        <div style="margin-top:12px;">
          ${list.length === 0 ? `
            <div class="order-empty">
              <div class="order-empty-icon">${this.icon('search')}</div>
              <div>没有找到相关医院</div>
            </div>
          ` : list.map(h => this.renderCard(h)).join('')}
        </div>
        <!-- 申请新医院 -->
        <div style="margin-top:16px; text-align:center;">
          <button class="btn btn-outline" style="width:auto; padding:12px 24px;" onclick="Patient.navigateTo(el => Patient.renderHospitals(el), '医院介绍')">
            列表里没有？申请新医院
          </button>
        </div>
      </div>
    `;
  },

  // 分支地址渲染：compact=true 输出单行 <p>（医院介绍页用）；否则输出多行结构（详情页用）
  renderBranches(h, compact) {
    const b = Array.isArray(h.branches) && h.branches.length ? h.branches : null;
    if (!b) {
      const fallback = this.esc(h.address || '地址待完善');
      return compact
        ? `<p class="address">${this.icon('mapPin')} ${fallback}</p>`
        : `<div class="hd-addr">${this.icon('location')} ${fallback}</div>`;
    }
    if (compact) {
      return `<p class="address">${this.icon('mapPin')} ${this.esc(this.branchSummary(b))}</p>`;
    }
    return `<div class="hd-branches">${b.map((x, i) => `
      <div class="hd-branch">
        <span class="hd-branch-tag${i === 0 ? ' main' : ''}">${this.esc(x.name === '总院' ? '总院' : (x.name.startsWith('总院（') ? x.name : x.name))}</span>
        <span class="hd-branch-addr">${this.esc(x.address)}</span>
      </div>`).join('')}</div>`;
  },

  // 数据来源脚注（source 缺失返回空串）
  renderSourceFoot(source) {
    if (!source || !String(source.info || '').trim()) return '';
    const parts = [String(source.info).trim(), String(source.ranking || '').trim()].filter(Boolean);
    const updated = String(source.updated || '').trim();
    return `<div class="hd-source-foot">数据来源：${this.esc(parts.join('、'))}${updated ? `，更新于 ${this.esc(updated)}` : ''}；具体地址与门诊安排以医院实际信息为准。</div>`;
  },

  // 医院介绍卡（图文排版：实景图/品牌占位 + 简介 + 地址 + 优势科室 + 电话）
  // 无图时直接渲染占位块；有图但加载失败时由 imgTag 的 onerror 隐藏 img，露出容器占位底色，不出现破图
  renderIntroCard(h) {
    const media = h.image
      ? `<div class="hi-media">${this.imgTag(h, 'hi-img')}</div>`
      : `<div class="hi-media placeholder">${this.icon('building')}<span>${this.esc(h.shortName || h.name)}</span></div>`;
    return `
      <article class="card hospital-intro">
        ${media}
        <div class="hi-body">
          <div class="hi-head">
            <h3>${this.esc(h.name)}</h3>
            <span class="hi-level">${this.esc(h.level)}</span>
          </div>
          ${this.renderBranches(h, true)}
          <p class="hi-intro">${this.esc(h.intro || '')}</p>
          <dl class="hi-meta">
            <div><dt>优势科室</dt><dd>${this.esc(h.specialties || '综合')}</dd></div>
            <div><dt>咨询电话</dt><dd>${this.esc(h.phone || '以医院官网为准')}</dd></div>
          </dl>
        </div>
      </article>
    `;
  },

  // 医院详情页（严格两块：医院简介[含核心优势+来源脚注] + 重点科室）
  renderDetail(h) {
    return `
      <div class="order-page">
        <div class="hd-hero">
          ${this.imgTag(h)}
          <div class="hd-hero-back" onclick="Patient.goBack()">${this.icon('chevronLeft')}</div>
        </div>
        <div class="hd-info">
          <div class="hd-name">${this.esc(h.name)}</div>
          <div class="hd-tags">
            <span class="hd-tag level">${this.esc(h.level)}</span>
            <span class="hd-tag cat">${this.esc(h.category)}</span>
          </div>
          ${this.renderBranches(h, false)}
        </div>
        <div class="hd-section">
          <div class="hd-section-title">医院简介</div>
          <div class="hd-intro">${this.esc(h.intro || '')}</div>
          ${h.advantage ? `<div class="hd-adv-title">核心优势</div><div class="hd-intro">${this.esc(h.advantage)}</div>` : ''}
          ${this.renderSourceFoot(h.source)}
        </div>
        <div class="hd-section">
          <div class="hd-section-title">重点科室</div>
          <div class="hd-depts">
            ${(h.keyDepts || []).map(d => `<span class="hd-dept">${this.esc(d)}</span>`).join('')}
          </div>
        </div>
        <div class="hd-bottom">
          <div class="hd-section">
            <div class="card-title" style="font-size:13px;">${this.icon('phone')} 联系电话</div>
            <div style="font-size:14px; font-weight:600; color:var(--accent); margin-top:6px;">${this.esc(h.phone)}</div>
          </div>
        </div>
        <div style="margin-top:16px;">
          <button class="btn" style="width:100%;" onclick="Patient._bookHospital('${h.id}')">立即预约陪诊</button>
        </div>
      </div>
    `;
  },
};
