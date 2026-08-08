// ========== 患者端（全新改版：首页/陪诊师/订单/我的）==========
const P_ICON = {
  home: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H8v7H4a2 2 0 0 1-1-2z"/></svg>',
  escort: '<svg class="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  orders: '<svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  user: '<svg class="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  phone: '<svg class="icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  alert: '<svg class="icon" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  clipboard: '<svg class="icon" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>',
  star: '<svg class="icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  chevronRight: '<svg class="icon" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>',
  chevronLeft: '<svg class="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>',
  building: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M15 21V9a2 2 0 0 1 2-2 2 2 0 0 1 2 2v12"/><path d="M9 7h.01M9 11h.01M9 15h.01M17 13h.01M17 17h.01"/></svg>',
  mapPin: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  search: '<svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  service_consult: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="13" y2="13"/></svg>',
  service_agent_cat: '<svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
  service_special: '<svg class="icon" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  service_featured: '<svg class="icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  service_hotline: '<svg class="icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  clock: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  shield: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  location: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  userPlus: '<svg class="icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
  settings: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  edit: '<svg class="icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  messageCircle: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
  userCheck: '<svg class="icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>',
  inbox: '<svg class="icon" viewBox="0 0 24 24"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  card: '<svg class="icon" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
  image: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  moreH: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
};

// ========== 注入样式 ==========
(() => {
  if (document.getElementById('patient-v2-style')) return;
  const style = document.createElement('style');
  style.id = 'patient-v2-style';
  style.textContent = `
    .ph-banner { position:relative; border-radius:var(--radius-lg); overflow:hidden; margin-bottom:14px; }
    .ph-banner img { width:100%; height:180px; object-fit:cover; display:block; }
    .ph-banner-overlay { position:absolute; inset:0; background:linear-gradient(180deg, rgba(59,108,181,0.1) 0%, rgba(59,108,181,0.7) 100%); display:flex; flex-direction:column; justify-content:flex-end; padding:16px; color:#fff; }
    .ph-banner-title { font-size:18px; font-weight:700; font-family:'Noto Serif SC', serif; }
    .ph-banner-sub { font-size:12px; opacity:0.9; margin-top:4px; }
    .ph-section-title { display:flex; justify-content:space-between; align-items:center; margin:16px 0 10px; padding:0 4px; }
    .ph-section-title h3 { font-size:15px; font-weight:700; display:flex; align-items:center; gap:6px; }
    .ph-section-title h3 svg { width:18px; height:18px; stroke:var(--accent); }
    .ph-section-more { font-size:12px; color:var(--accent); cursor:pointer; display:flex; align-items:center; gap:2px; }
    .ph-grid-4 { display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-bottom:6px; }
    .ph-grid-2 { display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; }
    .ph-svc-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius); padding:14px 8px; text-align:center; cursor:pointer; transition:all .15s; }
    .ph-svc-card:active { background:var(--bg-hover); }
    .ph-svc-icon { width:44px; height:44px; border-radius:12px; margin:0 auto 8px; display:flex; align-items:center; justify-content:center; }
    .ph-svc-icon svg { width:24px; height:24px; stroke-width:2; }
    .ph-svc-name { font-size:12px; font-weight:500; color:var(--text-primary); }
    .ph-svc-icon-c1 { background:rgba(59,108,181,0.1); color:var(--accent); }
    .ph-svc-icon-c2 { background:rgba(22,163,74,0.1); color:var(--status-covered); }
    .ph-svc-icon-c3 { background:rgba(234,88,12,0.1); color:#ea580c; }
    .ph-svc-icon-c4 { background:rgba(202,138,4,0.1); color:#ca8a04; }
    .ph-hosp-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius); overflow:hidden; margin-bottom:12px; cursor:pointer; transition:all .15s; }
    .ph-hosp-card:active { background:var(--bg-hover); }
    .ph-hosp-img { width:100%; height:120px; position:relative; background:linear-gradient(135deg, var(--accent-bg), #e8edf4); }
    .ph-hosp-img img { width:100%; height:100%; object-fit:cover; }
    .ph-hosp-badge { position:absolute; top:8px; right:8px; padding:3px 10px; background:rgba(59,108,181,0.9); color:#fff; font-size:11px; border-radius:10px; font-weight:500; }
    .ph-hosp-info { padding:12px; }
    .ph-hosp-name { font-size:15px; font-weight:600; color:var(--text-primary); }
    .ph-hosp-tags { display:flex; gap:6px; margin-top:6px; }
    .ph-hosp-tag { font-size:11px; padding:2px 8px; border-radius:4px; background:var(--accent-bg); color:var(--accent); }
    .ph-hosp-tag.cat { background:var(--bg-tertiary); color:var(--text-secondary); }
    .ph-hosp-intro { font-size:12px; color:var(--text-secondary); margin-top:8px; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .ph-hosp-meta { font-size:11px; color:var(--text-muted); margin-top:8px; display:flex; align-items:center; gap:4px; }
    .ph-hosp-meta svg { width:12px; height:12px; stroke-width:2; }
    .ph-hosp-order { color:var(--accent); font-weight:500; margin-left:auto; }

    /* 医院详情页 */
    .hd-hero { width:100%; height:180px; position:relative; background:linear-gradient(135deg, var(--accent-bg), #e8edf4); margin:0 -14px 0; }
    .hd-hero img { width:100%; height:100%; object-fit:cover; }
    .hd-hero-back { position:absolute; top:12px; left:12px; width:36px; height:36px; border-radius:50%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; color:#fff; cursor:pointer; }
    .hd-hero-back svg { width:20px; height:20px; stroke:#fff; }
    .hd-info { margin-top:-30px; position:relative; background:#fff; border-radius:var(--radius-lg) var(--radius-lg) 0 0; padding:20px 16px 16px; }
    .hd-name { font-size:18px; font-weight:700; font-family:'Noto Serif SC', serif; }
    .hd-tags { display:flex; gap:6px; margin-top:8px; }
    .hd-tag { font-size:11px; padding:2px 10px; border-radius:10px; }
    .hd-tag.level { background:var(--accent); color:#fff; }
    .hd-tag.cat { background:var(--bg-tertiary); color:var(--text-secondary); }
    .hd-addr { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--text-muted); margin-top:10px; }
    .hd-addr svg { width:14px; height:14px; stroke:var(--accent); }
    .hd-section { margin-top:16px; }
    .hd-section-title { font-size:15px; font-weight:700; margin-bottom:10px; padding-left:10px; border-left:3px solid var(--accent); }
    .hd-depts { display:flex; flex-wrap:wrap; gap:6px; }
    .hd-dept { font-size:12px; padding:5px 12px; background:var(--bg-tertiary); border-radius:14px; color:var(--text-secondary); }
    .hd-intro { font-size:13px; color:var(--text-secondary); line-height:1.7; }
    .hd-bottom { padding:12px 0; }

    /* 医院搜索列表 */
    .hs-search-bar { display:flex; gap:8px; margin-bottom:12px; }
    .hs-search-input { flex:1; display:flex; align-items:center; gap:8px; padding:10px 14px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:24px; }
    .hs-search-input svg { width:16px; height:16px; stroke:var(--text-muted); }
    .hs-search-input input { flex:1; border:none; background:none; font-size:14px; outline:none; }
    .hs-search-btn { padding:10px 20px; background:var(--accent); color:#fff; border:none; border-radius:24px; font-size:14px; font-weight:500; cursor:pointer; }
    .hs-filters { display:flex; gap:8px; margin-bottom:12px; overflow-x:auto; padding-bottom:4px; }
    .hs-filter { white-space:nowrap; padding:6px 14px; border:1px solid var(--border-color); background:var(--bg-card); border-radius:16px; font-size:12px; color:var(--text-secondary); cursor:pointer; }
    .hs-filter.active { background:var(--accent); color:#fff; border-color:var(--accent); }

    /* 陪诊师页 */
    .esc-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius); padding:14px; margin-bottom:12px; display:flex; gap:12px; align-items:center; }
    .esc-avatar { width:48px; height:48px; border-radius:50%; background:var(--accent); color:#fff; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:600; flex-shrink:0; }
    .esc-info { flex:1; min-width:0; }
    .esc-name { font-size:15px; font-weight:600; display:flex; align-items:center; gap:6px; }
    .esc-star { color:#eab308; font-size:12px; }
    .esc-tags { display:flex; flex-wrap:wrap; gap:4px; margin-top:6px; }
    .esc-tag { font-size:11px; padding:2px 8px; background:var(--accent-bg); color:var(--accent); border-radius:4px; }
    .esc-meta { font-size:11px; color:var(--text-muted); margin-top:6px; }
    .esc-status { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .esc-status.free { background:var(--status-covered); }
    .esc-status.busy { background:var(--status-partial); }

    /* 订单页 */
    .order-tabs { display:flex; overflow-x:auto; gap:4px; margin-bottom:12px; padding-bottom:4px; }
    .order-tab { white-space:nowrap; padding:8px 14px; font-size:13px; color:var(--text-secondary); background:none; border:none; cursor:pointer; border-bottom:2px solid transparent; }
    .order-tab.active { color:var(--accent); border-bottom-color:var(--accent); font-weight:600; }
    .order-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius); padding:14px; margin-bottom:12px; }
    .order-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
    .order-status { font-size:12px; font-weight:500; padding:3px 10px; border-radius:10px; }
    .order-status.pending { background:rgba(196,146,46,0.1); color:var(--status-partial); }
    .order-status.accepted { background:var(--accent-bg); color:var(--accent); }
    .order-status.serving { background:rgba(22,163,74,0.1); color:var(--status-covered); }
    .order-status.done { background:rgba(148,163,184,0.1); color:var(--text-muted); }
    .order-title { font-size:14px; font-weight:600; margin-bottom:4px; }
    .order-sub { font-size:12px; color:var(--text-muted); }
    .order-progress { margin-top:12px; padding-top:12px; border-top:1px solid var(--border-color); }
    .order-empty { text-align:center; padding:60px 20px; color:var(--text-muted); }
    .order-empty-icon { font-size:48px; margin-bottom:12px; opacity:0.4; }
    .order-empty-icon svg { width:64px; height:64px; stroke:var(--text-muted); stroke-width:1; }

    /* 我的页面 */
    .me-header { text-align:center; padding:24px 16px 20px; background:linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%); border-radius:var(--radius-lg); color:#fff; margin-bottom:14px; }
    .me-avatar { width:64px; height:64px; border-radius:50%; margin:0 auto 10px; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:700; }
    .me-name { font-size:18px; font-weight:700; }
    .me-sub { font-size:12px; opacity:0.9; margin-top:4px; }
    .me-login-btn { margin-top:12px; padding:8px 24px; background:rgba(255,255,255,0.2); border-radius:20px; color:#fff; font-size:13px; cursor:pointer; border:none; }
    .me-stats { display:flex; text-align:center; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius); padding:14px 0; margin-bottom:14px; }
    .me-stat { flex:1; border-right:1px solid var(--border-color); }
    .me-stat:last-child { border-right:none; }
    .me-stat-num { font-size:20px; font-weight:700; color:var(--accent); }
    .me-stat-label { font-size:11px; color:var(--text-muted); margin-top:2px; }
    .me-section-title { font-size:13px; font-weight:600; color:var(--text-secondary); margin-bottom:8px; padding:0 4px; }
    .me-service-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-bottom:14px; }
    .me-service-item { text-align:center; cursor:pointer; padding:8px 4px; }
    .me-service-icon { width:40px; height:40px; border-radius:12px; margin:0 auto 6px; display:flex; align-items:center; justify-content:center; }
    .me-service-icon svg { width:20px; height:20px; stroke-width:2; }
    .me-service-name { font-size:11px; color:var(--text-secondary); }
    .me-menu { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius); overflow:hidden; }
    .me-menu-item { display:flex; align-items:center; gap:12px; padding:14px; border-bottom:1px solid var(--border-color); cursor:pointer; }
    .me-menu-item:last-child { border-bottom:none; }
    .me-menu-item:active { background:var(--bg-hover); }
    .me-menu-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:var(--accent-bg); color:var(--accent); }
    .me-menu-icon svg { width:18px; height:18px; stroke-width:2; }
    .me-menu-text { flex:1; font-size:14px; color:var(--text-primary); }
    .me-menu-arrow { color:var(--text-muted); }

    /* 登录弹窗 */
    .login-modal-mask { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; opacity:0; transition:opacity .2s; }
    .login-modal { background:#fff; border-radius:var(--radius-lg); padding:28px 24px; width:100%; max-width:300px; text-align:center; }
    .login-modal-icon { font-size:36px; margin-bottom:12px; }
    .login-modal-title { font-size:17px; font-weight:600; margin-bottom:6px; }
    .login-modal-desc { font-size:13px; color:var(--text-muted); margin-bottom:20px; }
    .login-modal-btns { display:flex; gap:10px; }
    .login-modal-btns button { flex:1; padding:10px 0; border-radius:var(--radius); font-size:14px; }

    /* 首页banner */
    .ph-banner-placeholder { width:100%; height:140px; background:linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%); border-radius:var(--radius-lg); display:flex; flex-direction:column; justify-content:center; align-items:center; color:#fff; padding:20px; margin-bottom:14px; }
    .ph-banner-placeholder .bp-title { font-size:20px; font-weight:700; font-family:'Noto Serif SC', serif; }
    .ph-banner-placeholder .bp-sub { font-size:13px; opacity:0.9; margin-top:6px; }

    /* 首页服务卡片改造 */
    .ph-svc-list { display:flex; flex-direction:column; gap:12px; margin-bottom:6px; }
    .ph-svc-big-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); overflow:hidden; cursor:pointer; transition:all .2s; }
    .ph-svc-big-card:active { transform:scale(0.98); }
    .ph-svc-big-card .ph-sbc-head { display:flex; align-items:center; gap:12px; padding:14px 16px; }
    .ph-sbc-icon-wrap { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .ph-sbc-icon-wrap svg { width:28px; height:28px; stroke-width:2; }
    .ph-sbc-text { flex:1; min-width:0; }
    .ph-sbc-title { font-size:16px; font-weight:700; color:var(--text-primary); }
    .ph-sbc-desc { font-size:12px; color:var(--text-muted); margin-top:4px; line-height:1.4; }
    .ph-sbc-arrow { color:var(--text-muted); }
    .ph-sbc-arrow svg { width:20px; height:20px; }
    .ph-sbc-body { padding:0 16px 14px; display:flex; gap:6px; flex-wrap:wrap; }
    .ph-sbc-tag { font-size:11px; padding:3px 10px; background:var(--bg-tertiary); border-radius:10px; color:var(--text-secondary); }
    .ph-sbc-banner { height:80px; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; color:#fff; }
    .ph-sbc-banner.b1 { background:linear-gradient(135deg, #3b6cb5 0%, #2a4d8f 100%); }
    .ph-sbc-banner.b2 { background:linear-gradient(135deg, #16a34a 0%, #0d7a38 100%); }
    .ph-sbc-banner.b3 { background:linear-gradient(135deg, #ea580c 0%, #c24a0a 100%); }
    .ph-sbc-banner.b4 { background:linear-gradient(135deg, #ca8a04 0%, #a67203 100%); }

    /* 服务详情页 */
    .svc-detail { }
    .svd-header { display:flex; align-items:center; padding:12px 0; margin-bottom:16px; }
    .svd-header .svd-back { width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:var(--bg-card); cursor:pointer; }
    .svd-header .svd-back svg { width:18px; height:18px; }
    .svd-header h2 { flex:1; text-align:center; font-size:16px; font-weight:700; margin-right:32px; }
    .svd-hero { border-radius:var(--radius-lg); overflow:hidden; margin-bottom:18px; }
    .svd-hero-banner { height:100px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:17px; font-weight:700; }
    .svd-hero-info { background:var(--bg-card); padding:14px 16px; }
    .svd-hero-title { font-size:17px; font-weight:700; }
    .svd-hero-desc { font-size:12px; color:var(--text-muted); margin-top:4px; }
    .svd-section { margin-bottom:18px; }
    .svd-section-title { font-size:15px; font-weight:700; margin-bottom:12px; padding-left:10px; border-left:3px solid var(--accent); }
    .svd-reason-list { display:flex; flex-direction:column; gap:10px; }
    .svd-reason-item { display:flex; gap:10px; padding:12px; background:var(--bg-card); border-radius:var(--radius); }
    .svd-reason-icon { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .svd-reason-icon svg { width:18px; height:18px; }
    .svd-reason-content { flex:1; }
    .svd-reason-title { font-size:14px; font-weight:600; margin-bottom:3px; }
    .svd-reason-text { font-size:12px; color:var(--text-muted); line-height:1.5; }
    .svd-process-list { display:flex; flex-direction:column; gap:0; }
    .svd-process-item { display:flex; gap:12px; position:relative; padding-bottom:16px; }
    .svd-process-item:last-child { padding-bottom:0; }
    .svd-process-num { width:28px; height:28px; border-radius:50%; background:var(--accent); color:#fff; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; flex-shrink:0; z-index:1; }
    .svd-process-item:not(:last-child)::after { content:''; position:absolute; left:14px; top:28px; bottom:0; width:2px; background:var(--border-color); }
    .svd-process-content { flex:1; padding-top:2px; }
    .svd-process-title { font-size:14px; font-weight:600; margin-bottom:3px; }
    .svd-process-text { font-size:12px; color:var(--text-muted); line-height:1.5; }
    .svd-sub-list { display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; }
    .svd-sub-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius); overflow:hidden; }
    .svd-sub-img { height:80px; display:flex; align-items:center; justify-content:center; font-size:32px; }
    .svd-sub-info { padding:10px 12px; }
    .svd-sub-title { font-size:13px; font-weight:600; }
    .svd-sub-price { font-size:13px; color:var(--accent); font-weight:700; margin-top:4px; }
    .svd-sub-price small { font-size:11px; color:var(--text-muted); text-decoration:line-through; font-weight:normal; margin-left:4px; }
    .svd-sub-tags { display:flex; gap:4px; margin-top:6px; flex-wrap:wrap; }
    .svd-sub-tag { font-size:10px; padding:2px 6px; background:var(--bg-tertiary); border-radius:4px; color:var(--text-muted); }
    .svd-bottom-bar { position:sticky; bottom:0; display:flex; gap:10px; padding:12px 0 4px; background:linear-gradient(180deg, transparent, var(--bg) 20%); }
    .svd-bottom-bar .btn { flex:1; }

    /* 陪诊师详情页 */
    .ed-profile { display:flex; gap:14px; padding:16px; background:var(--bg-card); border-radius:var(--radius-lg); margin-bottom:16px; }
    .ed-avatar { width:64px; height:64px; border-radius:50%; background:linear-gradient(135deg,var(--accent),var(--accent-deep)); color:#fff; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:700; flex-shrink:0; }
    .ed-info { flex:1; }
    .ed-name { font-size:18px; font-weight:700; display:flex; align-items:center; gap:6px; }
    .ed-star { color:#eab308; font-size:13px; font-weight:500; }
    .ed-meta { font-size:12px; color:var(--text-muted); margin-top:4px; }
    .ed-stats { display:flex; gap:12px; margin-top:10px; }
    .ed-stat { flex:1; text-align:center; background:var(--bg-tertiary); padding:8px 4px; border-radius:8px; }
    .ed-stat strong { display:block; font-size:15px; color:var(--accent); }
    .ed-stat span { font-size:10px; color:var(--text-muted); }
    .ed-tags { display:flex; flex-wrap:wrap; gap:6px; }
    .ed-tag { font-size:12px; padding:5px 12px; background:var(--accent-bg); color:var(--accent); border-radius:12px; }
    .ed-info-list { background:var(--bg-card); border-radius:var(--radius); overflow:hidden; }
    .ed-info-row { display:flex; justify-content:space-between; align-items:center; padding:12px 14px; border-bottom:1px solid var(--border-color); font-size:13px; }
    .ed-info-row:last-child { border-bottom:none; }
    .ed-info-label { color:var(--text-muted); }
    .ed-info-value { font-weight:500; }
    .ed-info-value.busy { color:var(--status-partial); }
    .ed-info-value.free { color:var(--status-covered); }
    .ed-form { background:var(--bg-card); border-radius:var(--radius); padding:14px; display:flex; flex-direction:column; gap:14px; }
    .ed-form-item { display:flex; flex-direction:column; gap:6px; }
    .ed-form-item label { font-size:13px; font-weight:500; color:var(--text-primary); }
    .ed-form-item select, .ed-form-item input, .ed-form-item textarea { width:100%; padding:10px 12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:var(--radius); font-size:14px; outline:none; color:var(--text-primary); }
    .ed-form-item select:focus, .ed-form-item input:focus, .ed-form-item textarea:focus { border-color:var(--accent); }
    .ed-form-item textarea { resize:vertical; }
    .ed-date-picker { display:flex; gap:8px; flex-wrap:wrap; }
    .ed-date-opt { flex:1; min-width:80px; position:relative; }
    .ed-date-opt input { position:absolute; opacity:0; }
    .ed-date-opt span { display:block; text-align:center; padding:8px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:var(--radius); font-size:13px; font-weight:500; }
    .ed-date-opt em { display:block; text-align:center; font-size:10px; color:var(--text-muted); font-style:normal; margin-top:2px; }
    .ed-date-opt input:checked + span { background:var(--accent); color:#fff; border-color:var(--accent); }
    .ed-price-box { background:var(--bg-card); border-radius:var(--radius); padding:14px; }
    .ed-price-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; font-size:13px; color:var(--text-secondary); }
    .ed-price-row strong { color:var(--text-primary); font-weight:600; }
    .ed-price-total { display:flex; justify-content:space-between; align-items:center; padding-top:10px; margin-top:6px; border-top:1px dashed var(--border-color); }
    .ed-price-total strong { font-size:18px; color:var(--accent); font-weight:700; }

    /* 陪诊师聊天界面 */
    .chat-page { display:flex; flex-direction:column; height:calc(100vh - 180px); }
    .chat-header { display:flex; align-items:center; padding:10px 0; margin-bottom:0; }
    .chat-header .svd-back { width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:var(--bg-card); cursor:pointer; }
    .chat-header .svd-back svg { width:18px; height:18px; }
    .chat-header h2 { flex:1; text-align:center; font-size:16px; font-weight:700; margin-right:32px; }
    .chat-body { flex:1; overflow-y:auto; padding:12px 4px; display:flex; flex-direction:column; gap:12px; }
    .chat-msg { display:flex; gap:8px; max-width:85%; }
    .chat-msg.sent { align-self:flex-end; flex-direction:row-reverse; }
    .chat-msg-avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:600; flex-shrink:0; }
    .chat-msg.sent .chat-msg-avatar { background:var(--accent); color:#fff; }
    .chat-msg.received .chat-msg-avatar { background:var(--bg-tertiary); color:var(--accent); }
    .chat-msg-content { display:flex; flex-direction:column; gap:4px; }
    .chat-msg.sent .chat-msg-content { align-items:flex-end; }
    .chat-msg-bubble { padding:10px 14px; border-radius:12px; font-size:14px; line-height:1.5; word-break:break-word; }
    .chat-msg.sent .chat-msg-bubble { background:var(--accent); color:#fff; border-bottom-right-radius:4px; }
    .chat-msg.received .chat-msg-bubble { background:var(--bg-card); color:var(--text-primary); border-bottom-left-radius:4px; border:1px solid var(--border-color); }
    .chat-msg-time { font-size:10px; color:var(--text-muted); padding:0 4px; }
    .chat-input-bar { display:flex; gap:8px; padding:10px 0; border-top:1px solid var(--border-color); }
    .chat-input-bar input { flex:1; padding:10px 14px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:20px; font-size:14px; outline:none; }
    .chat-input-bar button { padding:10px 18px; background:var(--accent); color:#fff; border:none; border-radius:20px; font-size:14px; font-weight:500; cursor:pointer; }

    /* 就诊人管理 */
    .p-list { display:flex; flex-direction:column; gap:12px; }
    .p-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius); padding:14px; }
    .p-card-head { display:flex; gap:12px; align-items:center; }
    .p-avatar { width:48px; height:48px; border-radius:50%; background:var(--accent-bg); color:var(--accent); display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:600; flex-shrink:0; }
    .p-info { flex:1; }
    .p-name { font-size:15px; font-weight:600; }
    .p-meta { font-size:12px; color:var(--text-muted); margin-top:4px; }
    .p-actions { display:flex; gap:6px; margin-top:10px; }
    .p-actions button { flex:1; padding:8px 10px; font-size:12px; }
    .p-record-list { margin-top:10px; display:flex; flex-direction:column; gap:6px; }
    .p-record-item { display:flex; align-items:center; gap:8px; padding:6px 10px; background:var(--bg-tertiary); border-radius:6px; font-size:12px; }
    .p-record-item svg { width:14px; height:14px; stroke:var(--accent); }
    .p-image-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:10px; }
    .p-image-thumb { aspect-ratio:1; background:var(--bg-tertiary); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:20px; color:var(--text-muted); overflow:hidden; position:relative; }
    .p-image-thumb img { width:100%; height:100%; object-fit:cover; }
    .p-image-del { position:absolute; top:2px; right:2px; width:18px; height:18px; background:rgba(0,0,0,0.6); border-radius:50%; color:#fff; display:flex; align-items:center; justify-content:center; font-size:10px; cursor:pointer; }
    .p-image-add { aspect-ratio:1; background:var(--bg-tertiary); border:1px dashed var(--border-color); border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text-muted); font-size:11px; cursor:pointer; }
    .p-image-add svg { width:24px; height:24px; margin-bottom:2px; }
    .p-empty { text-align:center; padding:40px 20px; color:var(--text-muted); font-size:14px; }

    /* 首页服务2x2网格 */
    .ph-grid-2x2 { display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin-bottom:14px; }
    .ph-svc-tile { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius); padding:14px 12px; cursor:pointer; transition:all .15s; position:relative; overflow:hidden; }
    .ph-svc-tile:active { transform:scale(0.97); }
    .ph-svc-tile .ph-st-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; margin-bottom:8px; }
    .ph-svc-tile .ph-st-icon svg { width:22px; height:22px; stroke-width:2; }
    .ph-svc-tile .ph-st-title { font-size:14px; font-weight:600; color:var(--text-primary); }
    .ph-svc-tile .ph-st-desc { font-size:11px; color:var(--text-muted); margin-top:3px; line-height:1.3; }
    .ph-svc-tile.c1 .ph-st-icon { background:rgba(59,108,181,0.1); color:var(--accent); }
    .ph-svc-tile.c2 .ph-st-icon { background:rgba(22,163,74,0.1); color:var(--status-covered); }
    .ph-svc-tile.c3 .ph-st-icon { background:rgba(234,88,12,0.1); color:#ea580c; }
    .ph-svc-tile.c4 .ph-st-icon { background:rgba(202,138,4,0.1); color:#ca8a04; }

    /* AI下单入口 */
    .ai-order-banner { background:linear-gradient(135deg, #3b6cb5, #6b8fc7); border-radius:var(--radius-lg); padding:16px; margin-bottom:14px; display:flex; align-items:center; gap:12px; cursor:pointer; transition:all .15s; }
    .ai-order-banner:active { transform:scale(0.98); }
    .ai-order-icon { width:48px; height:48px; background:rgba(255,255,255,0.2); border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .ai-order-icon svg { width:28px; height:28px; stroke:#fff; }
    .ai-order-text { flex:1; color:#fff; }
    .ai-order-title { font-size:16px; font-weight:700; }
    .ai-order-desc { font-size:12px; opacity:0.9; margin-top:4px; }
    .ai-order-badge { background:#fff; color:var(--accent); font-size:10px; font-weight:700; padding:3px 8px; border-radius:10px; margin-left:8px; }

    /* 二级目录页 */
    .sub-page { }
    .sub-list { display:flex; flex-direction:column; gap:10px; }
    .sub-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius); padding:14px; cursor:pointer; transition:all .15s; }
    .sub-card:active { background:var(--bg-hover); }
    .sub-card-head { display:flex; align-items:center; gap:10px; }
    .sub-card-icon { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .sub-card-icon svg { width:20px; height:20px; stroke-width:2; }
    .sub-card-title { flex:1; font-size:15px; font-weight:600; }
    .sub-card-arrow { color:var(--text-muted); }
    .sub-card-arrow svg { width:16px; height:16px; }
    .sub-card-desc { font-size:12px; color:var(--text-muted); margin-top:6px; line-height:1.4; padding-left:46px; }
    .sub-card-price { font-size:13px; color:var(--accent); font-weight:700; margin-top:6px; padding-left:46px; }
    .sub-card-price small { font-size:10px; color:var(--text-muted); text-decoration:line-through; font-weight:normal; margin-left:4px; }

    /* 流程步骤页 */
    .steps-list { display:flex; flex-direction:column; gap:16px; }
    .step-item { display:flex; gap:12px; }
    .step-num { width:28px; height:28px; border-radius:50%; background:var(--accent); color:#fff; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; }
    .step-content { flex:1; }
    .step-title { font-size:14px; font-weight:600; margin-bottom:4px; }
    .step-desc { font-size:12px; color:var(--text-muted); line-height:1.5; }
    .step-input { margin-top:8px; }
    .step-input textarea { width:100%; padding:10px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:var(--radius); font-size:13px; outline:none; resize:vertical; min-height:60px; }
    .step-input textarea:focus { border-color:var(--accent); }

    /* 预约表单页 */
    .booking-form { display:flex; flex-direction:column; gap:14px; }
    .bf-section-title { font-size:15px; font-weight:700; margin-bottom:8px; padding-left:10px; border-left:3px solid var(--accent); }
    .bf-card { background:var(--bg-card); border-radius:var(--radius); padding:14px; display:flex; flex-direction:column; gap:12px; }
    .bf-item { display:flex; flex-direction:column; gap:6px; }
    .bf-item label { font-size:13px; font-weight:500; }
    .bf-item input, .bf-item select, .bf-item textarea { width:100%; padding:10px 12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:var(--radius); font-size:14px; outline:none; color:var(--text-primary); }
    .bf-item input:focus, .bf-item select:focus { border-color:var(--accent); }
    .bf-time-group { display:flex; gap:8px; }
    .bf-time-opt { flex:1; padding:10px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:var(--radius); text-align:center; cursor:pointer; font-size:13px; transition:all .15s; }
    .bf-time-opt.active { background:var(--accent); color:#fff; border-color:var(--accent); }
    .bf-submit-btn { width:100%; padding:14px; background:var(--accent); color:#fff; border:none; border-radius:var(--radius); font-size:16px; font-weight:700; cursor:pointer; margin-top:8px; }
    .bf-submit-btn:active { transform:scale(0.98); }

    /* 登录页区分样式 */
    .login-tabs { display:flex; background:var(--bg-card); border-radius:var(--radius); padding:4px; margin-bottom:16px; }
    .login-tab { flex:1; padding:10px; text-align:center; font-size:14px; font-weight:600; border-radius:calc(var(--radius) - 2px); cursor:pointer; transition:all .15s; }
    .login-tab.active { background:var(--accent); color:#fff; }
    .login-tab:not(.active) { color:var(--text-secondary); }
    .login-form { display:flex; flex-direction:column; gap:14px; }
    .login-form input { width:100%; padding:12px 14px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius); font-size:15px; outline:none; }
    .login-form input:focus { border-color:var(--accent); }
    .login-hint { font-size:11px; color:var(--text-muted); }
    .login-admin-field { display:none; }
    .login-admin-field.show { display:block; }

    /* 订单状态badge更新 */
    .order-status.allocating { background:var(--warning-bg); color:#d97706; }
    .order-status.allocated { background:var(--accent-bg); color:var(--accent); }

    /* 响应式 */
    @media (max-width:374px) {
      .ph-grid-2x2 { gap:8px; }
      .ph-svc-tile { padding:12px 10px; }
      .ph-svc-tile .ph-st-icon { width:36px; height:36px; }
      .ph-svc-tile .ph-st-icon svg { width:20px; height:20px; }
      .ph-svc-tile .ph-st-title { font-size:13px; }
      .ai-order-banner { padding:14px; }
      .ai-order-icon { width:40px; height:40px; }
      .ai-order-icon svg { width:24px; height:24px; }
    }
  `;
  document.head.appendChild(style);
})();

// ========== 患者端主对象 ==========
const Patient = {
  tabs: [
    { name: '首页', icon: P_ICON.home },
    { name: '特色', icon: P_ICON.building },
    { name: '订单', icon: P_ICON.orders },
    { name: '我的', icon: P_ICON.user },
  ],

  _currentOrderTab: '全部',
  _currentHospitals: [],
  _searchKeyword: '',
  _searchFilter: { category: '', city: '', sort: '' },
  _currentHospitalDetail: null,
  _pageStack: [],

  // 页面栈导航
  navigateTo(renderFn, title) {
    this._pageStack.push({ renderFn, title });
    const screen = document.getElementById('screen');
    screen.classList.remove('fade-in'); void screen.offsetWidth;
    screen.classList.add('screen-push-enter');
    renderFn(screen);
  },
  goBack() {
    if (this._pageStack.length > 1) {
      this._pageStack.pop();
      const prev = this._pageStack[this._pageStack.length - 1];
      const screen = document.getElementById('screen');
      screen.classList.remove('fade-in'); void screen.offsetWidth;
      screen.classList.add('screen-pop-enter');
      prev.renderFn(screen);
    } else {
      this._pageStack = [];
      App.switchTab(0);
    }
  },

  render(tab, el) {
    if (tab === 0) this.renderHome(el);
    else if (tab === 1) this.renderFeaturedHospitals(el);
    else if (tab === 2) this.renderOrders(el);
    else this.renderProfile(el);
  },

  // ===== 特色医院页 =====
  renderFeaturedHospitals(el) {
    const hospitals = (MockData.hospitals || []).filter(h => h.hot);
    el.innerHTML = `
      <div class="page-head" style="margin-bottom:12px;">
        <h2 style="font-size:18px; font-weight:700;">特色医院</h2>
        <div>查看热门推荐医院及专科介绍</div>
      </div>
      <div class="ph-hosp-list">
        ${hospitals.map(h => `
          <div class="ph-hosp-card" onclick="Patient._openHospitalDetail('${h.name}')">
            <div class="ph-hosp-img">${h.shortName?.charAt(0) || h.name.charAt(0)}</div>
            <div class="ph-hosp-info">
              <div class="ph-hosp-name">${h.name}</div>
              <div class="ph-hosp-sub">${h.category || '综合医院'} · ${h.city || ''}</div>
              <div class="ph-hosp-tags">
                ${(h.keyDepts || []).slice(0, 3).map(d => `<span class="ph-hosp-tag">${d}</span>`).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // ===== 首页 =====
  renderHome(el) {
    const isGuest = App.isGuest;
    const hotHospitals = (MockData.hospitals || []).filter(h => h.hot);
    el.innerHTML = `
      <!-- Banner -->
      <div class="ph-banner-placeholder">
        <div class="bp-title">专业陪诊 · 全程无忧</div>
        <div class="bp-sub">陪诊咨询 · 代办服务 · 特需服务</div>
      </div>

      <!-- 人工下单 + AI下单 双入口 -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
        <div class="ai-order-banner" style="background:linear-gradient(135deg, var(--status-covered), #0d7a38); box-shadow:0 4px 16px rgba(22,163,74,0.25);" onclick="Patient.onServiceClick('consult')">
          <div class="ai-order-icon">${P_ICON.clipboard}</div>
          <div class="ai-order-text">
            <div class="ai-order-title">人工下单</div>
            <div class="ai-order-desc">填写就诊需求，平台为您匹配陪诊师</div>
          </div>
        </div>
        <div class="ai-order-banner" onclick="Patient._openAIOrder()">
          <div class="ai-order-icon">${P_ICON.service_consult}</div>
          <div class="ai-order-text">
            <div class="ai-order-title">AI智能下单 <span class="ai-order-badge">推荐</span></div>
            <div class="ai-order-desc">描述您的症状，AI智能推荐服务方案</div>
          </div>
        </div>
      </div>

      <!-- 四大业务入口（2x2网格）-->
      <div class="ph-grid-2x2">
        <div class="ph-svc-tile c1" onclick="Patient.onServiceClick('consult')">
          <div class="ph-st-icon">${P_ICON.service_consult}</div>
          <div class="ph-st-title">诊前咨询</div>
          <div class="ph-st-desc">就诊咨询/代办咨询</div>
        </div>
        <div class="ph-svc-tile c2" onclick="Patient.onServiceClick('agent')">
          <div class="ph-st-icon">${P_ICON.service_agent_cat}</div>
          <div class="ph-st-title">代办服务</div>
          <div class="ph-st-desc">代取报告/代诊咨询</div>
        </div>
        <div class="ph-svc-tile c3" onclick="Patient.onServiceClick('special')">
          <div class="ph-st-icon">${P_ICON.service_special}</div>
          <div class="ph-st-title">特需服务</div>
          <div class="ph-st-desc">预约车辆/轮椅助行</div>
        </div>
        <div class="ph-svc-tile c4" onclick="Patient.onServiceClick('featured')">
          <div class="ph-st-icon">${P_ICON.service_featured}</div>
          <div class="ph-st-title">特色介绍</div>
          <div class="ph-st-desc">特色医院/特色专家</div>
        </div>
      </div>

      <!-- 热门医院 -->
      <div class="ph-section-title">
        <h3>${P_ICON.building} 热门医院</h3>
        <span class="ph-section-more" onclick="Patient.goHospitalList()">查看更多 ${P_ICON.chevronRight}</span>
      </div>
      <div class="ph-hosp-list">
        ${hotHospitals.map(h => this._renderHospitalCard(h)).join('')}
      </div>

      ${isGuest ? `
      <div style="margin-top:16px; padding:14px; background:var(--accent-bg); border:1px solid var(--accent); border-radius:var(--radius); text-align:center; cursor:pointer;" onclick="App.state='patientLogin';App.render()">
        <div style="font-size:14px; font-weight:600; color:var(--accent); margin-bottom:4px;">登录后享受更多服务</div>
        <div style="font-size:12px; color:var(--text-secondary);">提交需求、查看进度、紧急联系等功能需登录</div>
      </div>
      ` : ''}
    `;
  },

  _renderServiceBigCard(type, title, desc, colorCls, icon, tags) {
    const iconColors = {
      c1: { bg: 'rgba(59,108,181,0.1)', color: 'var(--accent)' },
      c2: { bg: 'rgba(22,163,74,0.1)', color: 'var(--status-covered)' },
      c3: { bg: 'rgba(234,88,12,0.1)', color: '#ea580c' },
      c4: { bg: 'rgba(202,138,4,0.1)', color: '#ca8a04' },
    };
    const c = iconColors[colorCls];
    return `
      <div class="ph-svc-big-card" onclick="Patient.onServiceClick('${type}')">
        <div class="ph-sbc-head">
          <div class="ph-sbc-icon-wrap" style="background:${c.bg};color:${c.color};">${icon}</div>
          <div class="ph-sbc-text">
            <div class="ph-sbc-title">${title}</div>
            <div class="ph-sbc-desc">${desc}</div>
          </div>
          <div class="ph-sbc-arrow">${P_ICON.chevronRight}</div>
        </div>
        <div class="ph-sbc-body">
          ${tags.map(t => `<span class="ph-sbc-tag">${t}</span>`).join('')}
        </div>
      </div>
    `;
  },

  _renderHospitalCard(h) {
    // 提取总院地址（取分号或"；"前的部分），保持首页卡片简洁
    const shortAddr = (h.address || '').split(/[;；]/)[0].replace(/^总院：/, '');
    return `
      <div class="ph-hosp-card" onclick="Patient.goHospitalDetail('${h.id}')">
        <div class="ph-hosp-img">
          <img src="${h.image}" alt="${h.name}" loading="lazy" onerror="this.style.display='none'">
          <span class="ph-hosp-badge">${h.level}</span>
        </div>
        <div class="ph-hosp-info">
          <div class="ph-hosp-name">${h.name}</div>
          <div class="ph-hosp-tags">
            <span class="ph-hosp-tag cat">${h.category}</span>
            <span class="ph-hosp-tag">${h.keyDepts ? h.keyDepts.slice(0,2).join(' · ') : ''}</span>
          </div>
          <div class="ph-hosp-intro">${h.intro}</div>
          <div class="ph-hosp-meta">
            <span class="ph-hosp-addr">${P_ICON.location} ${shortAddr}</span>
            <span class="ph-hosp-order">已服务 ${h.orders} 单</span>
          </div>
        </div>
      </div>
    `;
  },

  // ===== 服务点击 → 跳转到二级目录页 =====
  onServiceClick(type) {
    this._renderSubCategoryPage(type);
  },

  // ===== 二级目录页 =====
  _renderSubCategoryPage(type) {
    const screen = document.getElementById('screen');
    screen.classList.remove('fade-in'); void screen.offsetWidth; screen.classList.add('fade-in');

    const configs = {
      consult: {
        title: '诊前咨询', subTitle: '诊前咨询服务', desc: '为您提供专业的就诊前咨询服务',
        items: [
          { key: 'consult_diagnosis', title: '就诊咨询', desc: '详述病情 → 介绍陪诊服务内容 → 给出合理化建议 → 人工服务 → 填写服务需求', icon: P_ICON.star, price: 128, origPrice: 158 },
          { key: 'consult_agent', title: '代办咨询', desc: '详述病情 → 介绍代办范围 → 给出合理化建议 → 提供相关材料 → 填写需求', icon: P_ICON.card, price: 158, origPrice: 188 },
        ]
      },
      agent: {
        title: '代办服务', subTitle: '代办服务', desc: '代取报告、代诊咨询等代办服务',
        items: [
          { key: 'agent_report', title: '代取报告', desc: '详述病情 → 介绍代办服务内容 → 给出合理化建议 → 人工服务 → 填写代取服务需求', icon: P_ICON.clipboard, price: 98, origPrice: 128 },
          { key: 'agent_diagnosis', title: '代诊咨询', desc: '详述病情 → 介绍代诊范围 → 给出合理化建议 → 人工服务 → 填写代诊服务需求', icon: P_ICON.messageCircle, price: 198, origPrice: 238 },
        ]
      },
      special: {
        title: '特需服务', subTitle: '特需陪诊服务', desc: '预约车辆、轮椅助行等特需服务',
        items: [
          { key: 'special_car', title: '预约车辆', desc: '详述需求 → 介绍服务车辆 → 给出合理化建议 → 人工服务 → 填写预约服务需求', icon: P_ICON.clock, price: 158, origPrice: 188 },
          { key: 'special_wheelchair', title: '轮椅助行', desc: '详述需求 → 介绍服务内容 → 给出合理化建议 → 人工服务 → 填写需求', icon: P_ICON.userCheck, price: 198, origPrice: 228 },
        ]
      },
      featured: {
        title: '特色介绍', subTitle: '特色医疗', desc: '特色医院、特色专家推荐',
        items: [
          { key: 'featured_hospital', title: '特色医院', desc: '详述病情 → 介绍特色医院 → 给出合理化建议 → 人工服务 → 填写需求情况', icon: P_ICON.building, price: 98, origPrice: 128 },
          { key: 'featured_expert', title: '特色专家', desc: '详述病情 → 介绍特色专家 → 给出合理化建议 → 提供相关材料 → 填写需求情况', icon: P_ICON.star, price: 298, origPrice: 338 },
        ]
      },
    };

    const cfg = configs[type];
    if (!cfg) return;

    screen.innerHTML = `
      <div class="sub-page">
        <div class="svd-header">
          <div class="svd-back" onclick="Patient.goBack()">${P_ICON.chevronLeft}</div>
          <h2>${cfg.title}</h2>
        </div>
        <div class="svd-hero">
          <div class="svd-hero-banner" style="background:linear-gradient(135deg,#3b6cb5,#2a4d8f);">${cfg.subTitle}</div>
          <div class="svd-hero-info">
            <div class="svd-hero-title">${cfg.desc}</div>
            <div class="svd-hero-desc">选择以下服务项目</div>
          </div>
        </div>
        <div class="sub-list">
          ${cfg.items.map(item => `
            <div class="sub-card" onclick="Patient._openServiceSteps('${item.key}')">
              <div class="sub-card-head">
                <div class="sub-card-icon" style="background:var(--accent-bg);color:var(--accent);">${item.icon}</div>
                <div class="sub-card-title">${item.title}</div>
                <div class="sub-card-arrow">${P_ICON.chevronRight}</div>
              </div>
              <div class="sub-card-price">¥${item.price} <small>¥${item.origPrice}</small></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // ===== 服务流程步骤页 =====
  _openServiceSteps(key) {
    const stepsMap = {
      consult_diagnosis: { title: '就诊咨询', steps: [
        { title: '提交订单', desc: '填写患者信息、就诊医院、科室等并提交预约' },
        { title: '系统分配陪诊师', desc: '后台根据订单自动匹配合适的陪诊师' },
        { title: '陪诊师联系患者', desc: '陪诊师接单后主动联系患者了解病情' },
        { title: '预约就诊时间', desc: '与陪诊师协商确定具体就诊时间' },
        { title: '陪诊服务', desc: '陪诊师按时前往医院提供全程陪诊服务' },
        { title: '服务完成', desc: '就诊结束后确认服务完成' },
      ]},
      consult_agent: { title: '代办咨询', steps: [
        { title: '提交订单', desc: '填写代办内容、患者信息等并提交预约' },
        { title: '系统分配陪诊师', desc: '后台根据订单自动匹配合适的陪诊师' },
        { title: '陪诊师联系患者', desc: '陪诊师接单后确认代办需求和材料' },
        { title: '确认代办范围', desc: '明确代办事项、地点、时间等细节' },
        { title: '执行代办服务', desc: '陪诊师按约定完成代办事项并反馈结果' },
        { title: '服务完成', desc: '确认代办结果无误后完成服务' },
      ]},
      agent_report: { title: '代取报告', steps: [
        { title: '提交订单', desc: '填写患者信息、就诊医院等并提交预约' },
        { title: '系统分配陪诊师', desc: '后台根据订单自动匹配合适的陪诊师' },
        { title: '陪诊师接单', desc: '陪诊师接单后确认取报告的医院和时间' },
        { title: '前往医院取报告', desc: '陪诊师按时前往医院自助机或窗口取报告' },
        { title: '报告送达', desc: '通过快递或同城配送将报告送至患者手中' },
        { title: '服务完成', desc: '确认收到报告后完成服务' },
      ]},
      agent_diagnosis: { title: '代诊咨询', steps: [
        { title: '提交订单', desc: '填写患者病情、咨询需求等并提交预约' },
        { title: '系统分配陪诊师', desc: '后台根据订单自动匹配合适的陪诊师' },
        { title: '陪诊师联系患者', desc: '陪诊师接单后详细了解患者病情' },
        { title: '准备相关材料', desc: '整理病历、检查报告等代诊所需材料' },
        { title: '远程代诊', desc: '陪诊师代为线上就诊咨询并反馈结果' },
        { title: '服务完成', desc: '反馈诊疗建议后完成服务' },
      ]},
      special_car: { title: '预约车辆', steps: [
        { title: '提交订单', desc: '填写用车时间、地点、车型等并提交预约' },
        { title: '系统分配陪诊师', desc: '后台根据订单自动匹配合适的陪诊师' },
        { title: '陪诊师确认需求', desc: '陪诊师接单后确认用车时间和地点' },
        { title: '调度车辆', desc: '根据需求安排合适的车辆和司机' },
        { title: '按时接送', desc: '车辆按时到达指定地点接送患者' },
        { title: '服务完成', desc: '送达目的地后确认服务完成' },
      ]},
      special_wheelchair: { title: '轮椅助行', steps: [
        { title: '提交订单', desc: '填写需求时间、地点等并提交预约' },
        { title: '系统分配陪诊师', desc: '后台根据订单自动匹配合适的陪诊师' },
        { title: '陪诊师确认需求', desc: '陪诊师接单后确认助行需求和地点' },
        { title: '准备助行设备', desc: '根据需求准备轮椅等助行设备' },
        { title: '提供助行服务', desc: '陪诊师提供全程轮椅助行服务' },
        { title: '服务完成', desc: '送达目的地后确认服务完成' },
      ]},
      featured_hospital: { title: '特色医院', steps: [
        { title: '提交订单', desc: '填写患者病情、意向医院等并提交预约' },
        { title: '系统分配陪诊师', desc: '后台根据订单自动匹配合适的陪诊师' },
        { title: '陪诊师联系患者', desc: '陪诊师接单后详细了解患者病情' },
        { title: '推荐特色医院', desc: '根据病情推荐合适的特色专科三甲医院' },
        { title: '协助挂号就诊', desc: '协助预约挂号并提供陪诊服务' },
        { title: '服务完成', desc: '就诊结束后确认服务完成' },
      ]},
      featured_expert: { title: '特色专家', steps: [
        { title: '提交订单', desc: '填写患者病情、需求等并提交预约' },
        { title: '系统分配陪诊师', desc: '后台根据订单自动匹配合适的陪诊师' },
        { title: '陪诊师联系患者', desc: '陪诊师接单后详细了解患者病情' },
        { title: '推荐特色专家', desc: '根据病情推荐领域内知名专家' },
        { title: '协助预约就诊', desc: '协助预约专家号并提供陪诊服务' },
        { title: '服务完成', desc: '就诊结束后确认服务完成' },
      ]},
    };

    const cfg = stepsMap[key];
    if (!cfg) return;
    this._currentServiceKey = key;
    this._currentServiceTitle = cfg.title;

    const screen = document.getElementById('screen');
    screen.classList.remove('fade-in'); void screen.offsetWidth; screen.classList.add('fade-in');

    screen.innerHTML = `
      <div class="sub-page">
        <div class="svd-header">
          <div class="svd-back" onclick="Patient.goBack()">${P_ICON.chevronLeft}</div>
          <h2>${cfg.title} · 操作流程</h2>
        </div>
        <div class="svd-section">
          <div class="svd-section-title">操作流程</div>
          <div class="steps-list">
            ${cfg.steps.map((s, i) => `
              <div class="step-item">
                <div class="step-num">${i+1}</div>
                <div class="step-content">
                  <div class="step-title">${s.title}</div>
                  <div class="step-desc">${s.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="svd-section">
          <div class="svd-section-title">注意事项</div>
          <div style="background:var(--bg-card); border-radius:var(--radius); padding:14px; font-size:12px; color:var(--text-secondary); line-height:1.8;">
            <div>1. 至少提前24小时预约</div>
            <div>2. 急、重、传染病不在服务范围</div>
            <div>3. 超时30分钟将自动取消服务要求</div>
            <div>4. 遇到服务费外增收费用请联系服务平台，谨防假冒</div>
          </div>
        </div>
        <div class="svd-bottom-bar">
          <button class="btn" onclick="Patient._openBookingForm('${key}')">立即预约</button>
        </div>
      </div>
    `;
  },

  // ===== AI智能下单入口 =====
  _openAIOrder() {
    if (!App.requireLogin('AI智能下单')) return;
    const screen = document.getElementById('screen');
    screen.classList.remove('fade-in'); void screen.offsetWidth; screen.classList.add('fade-in');
    screen.innerHTML = `
      <div class="booking-form">
        <div class="svd-header">
          <div class="svd-back" onclick="Patient.goBack()">${P_ICON.chevronLeft}</div>
          <h2>AI智能下单</h2>
        </div>
        <div class="svd-section">
          <div class="svd-section-title">症状描述</div>
          <div class="bf-card">
            <div class="bf-item">
              <label>请描述您的症状或需求</label>
              <textarea id="aiSymptom" placeholder="如：头痛三天，伴有恶心呕吐..." rows="3"></textarea>
            </div>
            <div class="bf-item">
              <label>期望就诊医院</label>
              <select id="aiHospital">
                ${(MockData.hospitals || []).filter(h => h.hot).map(h => `<option value="${h.name}">${h.name}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
        <button class="bf-submit-btn" onclick="Patient._submitAIOrder()">AI智能推荐</button>
      </div>
    `;
  },

  _submitAIOrder() {
    const symptom = document.getElementById('aiSymptom')?.value?.trim() || '';
    const hospital = document.getElementById('aiHospital')?.value || '未指定';
    if (!symptom) { App.toast('请描述您的症状'); return; }
    if (!App.requireLogin('AI智能下单')) return;

    // AI模拟推荐科室
    const deptMap = {
      '头痛': '神经内科', '胸闷': '心内科', '咳嗽': '呼吸科', '胃痛': '消化内科',
      '发热': '感染科', '视力': '眼科', '皮肤': '皮肤科', '': '综合门诊'
    };
    let dept = '综合门诊';
    for (const k in deptMap) { if (symptom.includes(k)) { dept = deptMap[k]; break; } }

    this._openBookingForm('ai_auto', 'AI智能推荐', dept, symptom, hospital);
  },

  // ===== 统一预约表单 =====
  _openBookingForm(serviceKey, serviceTitle, preDept, preSymptom, preHospital) {
    if (!App.requireLogin('预约服务')) return;

    const screen = document.getElementById('screen');
    screen.classList.remove('fade-in'); void screen.offsetWidth; screen.classList.add('fade-in');

    const u = MockData.patient.user;
    const hospitals = (MockData.hospitals || []).filter(h => h.hot);

    screen.innerHTML = `
      <div class="booking-form">
        <div class="svd-header">
          <div class="svd-back" onclick="Patient.goBack()">${P_ICON.chevronLeft}</div>
          <h2>填写预约信息</h2>
        </div>

        ${serviceTitle ? `
        <div style="background:var(--accent-bg); border-radius:var(--radius); padding:12px 14px; font-size:13px; color:var(--accent); margin-bottom:4px;">
          服务类型：<strong>${serviceTitle}</strong>
        </div>` : ''}

        <!-- 患者信息 -->
        <div class="bf-section-title">患者信息</div>
        <div class="bf-card">
          <div class="bf-item">
            <label>姓名</label>
            <input type="text" id="bfName" value="${u.name}" placeholder="请输入患者姓名" />
          </div>
          <div class="bf-item">
            <label>性别</label>
            <div style="display:flex; gap:10px;">
              <label style="flex:1;"><input type="radio" name="bfGender" value="男" ${u.gender==='男'?'checked':''}/> 男</label>
              <label style="flex:1;"><input type="radio" name="bfGender" value="女" ${u.gender==='女'?'checked':''}/> 女</label>
            </div>
          </div>
          <div class="bf-item">
            <label>年龄</label>
            <input type="number" id="bfAge" value="${u.age}" placeholder="请输入年龄" min="0" max="150" />
          </div>
          <div class="bf-item">
            <label>联系电话</label>
            <input type="tel" id="bfPhone" value="${u.phone}" placeholder="请输入联系电话" />
          </div>
          <div class="bf-item">
            <label>病史信息</label>
            <textarea id="bfHistory" placeholder="如：高血压、糖尿病等" rows="2">${MockData.patient.medical?.history || ''}</textarea>
          </div>
          <div class="bf-item">
            <label>过敏史</label>
            <input type="text" id="bfAllergy" value="${MockData.patient.medical?.allergy || ''}" placeholder="如：青霉素过敏" />
          </div>
          <div class="bf-item">
            <label>用药情况</label>
            <input type="text" id="bfMedicine" value="${MockData.patient.medical?.medicine || ''}" placeholder="如：氨氯地平 5mg/日" />
          </div>
          <div class="bf-item">
            <label>行动能力</label>
            <select id="bfMobility">
              <option value="可独立行走" ${MockData.patient.medical?.mobility==='可独立行走'?'selected':''}>可独立行走</option>
              <option value="需拐杖" ${MockData.patient.medical?.mobility==='需拐杖'?'selected':''}>需拐杖</option>
              <option value="需轮椅" ${MockData.patient.medical?.mobility==='需轮椅'?'selected':''}>需轮椅</option>
              <option value="需搀扶" ${MockData.patient.medical?.mobility==='需搀扶'?'selected':''}>需搀扶</option>
            </select>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div class="bf-item">
              <label>紧急联系人</label>
              <input type="text" id="bfEmergencyName" value="${u.emergencyName || ''}" placeholder="姓名" />
            </div>
            <div class="bf-item">
              <label>联系人电话</label>
              <input type="tel" id="bfEmergencyPhone" value="${u.emergencyPhone || ''}" placeholder="手机号" />
            </div>
          </div>
        </div>

        <!-- 就医信息 -->
        <div class="bf-section-title">就医信息</div>
        <div class="bf-card">
          <div class="bf-item">
            <label>就诊医院</label>
            <select id="bfHospital">
              ${hospitals.map(h => `<option value="${h.name}" ${preHospital===h.name?'selected':''}>${h.name}</option>`).join('')}
            </select>
          </div>
          <div class="bf-item">
            <label>就诊科室</label>
            <input type="text" id="bfDept" value="${preDept || ''}" placeholder="如：心内科、神经内科" />
          </div>
          ${preSymptom ? `
          <div class="bf-item">
            <label>症状描述</label>
            <div style="padding:10px 12px; background:var(--bg-tertiary); border-radius:var(--radius); font-size:13px; color:var(--text-secondary);">${preSymptom}</div>
          </div>` : ''}
        </div>

        <!-- 就诊时间（范围选择）-->
        <div class="bf-section-title">就诊时间</div>
        <div class="bf-card">
          <div class="bf-item">
            <label>期望预约时间范围</label>
            <div class="bf-time-group">
              <div class="bf-time-opt active" data-range="1-3天" onclick="Patient._selectTimeRange(this)">1-3天内</div>
              <div class="bf-time-opt" data-range="一周" onclick="Patient._selectTimeRange(this)">一周内</div>
              <div class="bf-time-opt" data-range="尽快" onclick="Patient._selectTimeRange(this)">尽快</div>
            </div>
          </div>
          <div class="bf-item">
            <label>备注说明</label>
            <textarea id="bfNote" placeholder="如有特殊需求请填写" rows="2"></textarea>
          </div>
        </div>

        <div style="font-size:12px; color:var(--text-muted); text-align:center; padding:4px 0;">
          * 提交后由管理员审核并为您匹配陪诊师
        </div>

        <button class="bf-submit-btn" onclick="Patient._submitBooking('${serviceKey}')">提交预约</button>
      </div>
    `;
  },

  _selectTimeRange(el) {
    el.parentNode.querySelectorAll('.bf-time-opt').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
  },

  _submitBooking(serviceKey) {
    const name = document.getElementById('bfName')?.value?.trim();
    const gender = document.querySelector('input[name="bfGender"]:checked')?.value || '男';
    const age = document.getElementById('bfAge')?.value;
    const phone = document.getElementById('bfPhone')?.value?.trim();
    const history = document.getElementById('bfHistory')?.value || '';
    const allergy = document.getElementById('bfAllergy')?.value || '';
    const medicine = document.getElementById('bfMedicine')?.value || '';
    const mobility = document.getElementById('bfMobility')?.value || '可独立行走';
    const emergencyName = document.getElementById('bfEmergencyName')?.value || '';
    const emergencyPhone = document.getElementById('bfEmergencyPhone')?.value || '';
    const hospital = document.getElementById('bfHospital')?.value || '未指定';
    const dept = document.getElementById('bfDept')?.value?.trim() || '';
    const note = document.getElementById('bfNote')?.value || '';
    const timeRange = document.querySelector('.bf-time-opt.active')?.dataset.range || '1-3天';

    if (!name) { App.toast('请填写患者姓名'); return; }
    if (!age || age < 0) { App.toast('请填写有效年龄'); return; }
    if (!dept) { App.toast('请填写就诊科室'); return; }

    if (!App.requireLogin('提交预约')) return;

    // 从 PriceTable 获取价格（匹配服务名）
    const serviceNameMap = {
      consult_diagnosis: '半程陪诊', consult_agent: '全程陪诊',
      agent_report: '代办跑腿', agent_diagnosis: '全程陪诊',
      special_car: '全程陪诊', special_wheelchair: '全程陪诊',
      featured_hospital: '陪同复诊', featured_expert: '全程陪诊',
      ai_auto: '半程陪诊',
    };
    const priceName = serviceNameMap[serviceKey] || '半程陪诊';
    const amount = PriceTable.getPrice(priceName);

    const req = NeedPool.add({
      patientName: name, gender, age: parseInt(age), phone,
      emergencyName, emergencyPhone,
      history, allergy, medicine, mobility, insurance: '',
      hospital, dept, date: timeRange,
      serviceType: priceName, amount,
      note: note || `通过人工下单（${priceName}）`,
      status: '待处理',
      idCardFront: null, idCardBack: null, reportFiles: [],
    });

    App.toast('预约已提交，等待管理员审核并匹配陪诊师');
    setTimeout(() => App.switchTab(2), 1000);
  },

  _contactService(name) {
    if (!App.requireLogin(name)) return;
    App.toast('正在为您对接' + name + '顾问');
  },

  _bookService(type) {
    if (!App.requireLogin('预约服务')) return;
    this._openBookingForm(type);
  },

  // ===== 医院列表页 =====
  goHospitalList() {
    this._searchKeyword = '';
    this._searchFilter = { category: '', city: '', sort: '' };
    this._renderHospitalListPage();
  },

  _openHospitalDetail(name) {
    const h = (MockData.hospitals || []).find(x => x.name === name);
    if (h) this.goHospitalDetail(h.id);
  },

  _renderHospitalListPage() {
    const hospitals = MockData.hospitals || [];
    const kw = this._searchKeyword.toLowerCase();
    let list = hospitals.filter(h => {
      if (kw && !h.name.toLowerCase().includes(kw) && !h.shortName.toLowerCase().includes(kw) && !h.intro.toLowerCase().includes(kw)) return false;
      if (this._searchFilter.category && h.category !== this._searchFilter.category) return false;
      if (this._searchFilter.city && h.city !== this._searchFilter.city) return false;
      return true;
    });
    if (this._searchFilter.sort === 'orders') {
      list.sort((a, b) => b.orders - a.orders);
    }
    const cats = ['综合医院', '专科医院', '中医医院'];
    const cities = ['上海市', '北京市'];
    const sorts = ['', 'orders'];

    const screen = document.getElementById('screen');
    screen.classList.remove('fade-in'); void screen.offsetWidth; screen.classList.add('fade-in');
    screen.innerHTML = `
      <div class="order-page">
        <div class="order-header">
          <div class="oh-back" onclick="App.switchTab(0)">${P_ICON.chevronLeft}</div>
          <h2>医院列表</h2>
        </div>
        <!-- 搜索框 -->
        <div class="hs-search-bar">
          <div class="hs-search-input">
            ${P_ICON.search}
            <input type="text" id="hsKeyword" placeholder="请输入医院名称" value="${this._searchKeyword}" />
          </div>
          <button class="hs-search-btn" onclick="Patient._doSearch()">搜索</button>
        </div>
        <!-- 筛选 -->
        <div class="hs-filters">
          <span style="font-size:12px; color:var(--text-muted); flex-shrink:0;">医院类别：</span>
          ${cats.map(c => `<span class="hs-filter ${this._searchFilter.category === c ? 'active' : ''}" onclick="Patient._setFilter('category','${c}')">${c}</span>`).join('')}
        </div>
        <div class="hs-filters">
          <span style="font-size:12px; color:var(--text-muted); flex-shrink:0;">城市：</span>
          ${cities.map(c => `<span class="hs-filter ${this._searchFilter.city === c ? 'active' : ''}" onclick="Patient._setFilter('city','${c}')">${c}</span>`).join('')}
        </div>
        <div class="hs-filters">
          <span style="font-size:12px; color:var(--text-muted); flex-shrink:0;">排序：</span>
          <span class="hs-filter ${!this._searchFilter.sort ? 'active' : ''}" onclick="Patient._setFilter('sort','')">综合排序</span>
          <span class="hs-filter ${this._searchFilter.sort === 'orders' ? 'active' : ''}" onclick="Patient._setFilter('sort','orders')">服务量</span>
        </div>
        <!-- 列表 -->
        <div style="margin-top:12px;">
          ${list.length === 0 ? `
            <div class="order-empty">
              <div class="order-empty-icon">${P_ICON.search}</div>
              <div>没有找到相关医院</div>
            </div>
          ` : list.map(h => this._renderHospitalCard(h)).join('')}
        </div>
        <!-- 申请新医院 -->
        <div style="margin-top:16px; text-align:center;">
          <button class="btn btn-outline" style="width:auto; padding:12px 24px;" onclick="Patient.navigateTo(el => Patient.renderHospitals(el), '医院介绍')">
            列表里没有？申请新医院
          </button>
        </div>
      </div>
    `;
    const kwInput = document.getElementById('hsKeyword');
    if (kwInput) kwInput.addEventListener('keydown', e => { if (e.key === 'Enter') this._doSearch(); });
  },

  _doSearch() {
    const kw = document.getElementById('hsKeyword').value.trim();
    this._searchKeyword = kw;
    this._renderHospitalListPage();
  },

  _setFilter(key, val) {
    if (key === 'sort') {
      this._searchFilter.sort = this._searchFilter.sort === val ? '' : val;
    } else {
      this._searchFilter[key] = this._searchFilter[key] === val ? '' : val;
    }
    this._renderHospitalListPage();
  },

  // ===== 医院详情页 =====
  goHospitalDetail(id) {
    const h = (MockData.hospitals || []).find(x => x.id === id);
    if (!h) return;
    this._currentHospitalDetail = h;
    const screen = document.getElementById('screen');
    screen.classList.remove('fade-in'); void screen.offsetWidth; screen.classList.add('fade-in');
    screen.innerHTML = `
      <div class="order-page">
        <div class="hd-hero">
          <img src="${h.image}" alt="${h.name}" onerror="this.style.display='none'">
          <div class="hd-hero-back" onclick="Patient.goBack()">${P_ICON.chevronLeft}</div>
        </div>
        <div class="hd-info">
          <div class="hd-name">${h.name}</div>
          <div class="hd-tags">
            <span class="hd-tag level">${h.level}</span>
            <span class="hd-tag cat">${h.category}</span>
          </div>
          <div class="hd-addr">${P_ICON.location} ${h.address}</div>
        </div>
        <div class="hd-section">
          <div class="hd-section-title">重点科室</div>
          <div class="hd-depts">
            ${(h.keyDepts || []).map(d => `<span class="hd-dept">${d}</span>`).join('')}
          </div>
        </div>
        <div class="hd-section">
          <div class="hd-section-title">医院简介</div>
          <div class="hd-intro">${h.intro}</div>
        </div>
        <div class="hd-bottom">
          <div class="hd-section">
            <div class="card-title" style="font-size:13px;">${P_ICON.phone} 联系电话</div>
            <div style="font-size:14px; font-weight:600; color:var(--accent); margin-top:6px;">${h.phone}</div>
          </div>
        </div>
        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="btn btn-outline" style="flex:1;" onclick="App.requireLogin('预约陪诊') ? Patient._bookHospital('${h.id}') : null">预约陪诊</button>
          <button class="btn" style="flex:1;" onclick="Patient._bookHospital('${h.id}')">立即预订</button>
        </div>
      </div>
    `;
    // 绑定返回
    const backBtn = document.querySelector('.hd-hero-back');
    if (backBtn) backBtn.onclick = () => this._backFromDetail();
  },

  _backFromDetail() {
    // 如果是从首页来的，返回首页；否则返回列表
    App.switchTab(0);
  },

  _bookHospital(id) {
    if (!App.requireLogin('预订服务')) return;
    App.switchTab(1);
  },

  // ===== 陪诊师页 =====
  renderEscorts(el) {
    const escorts = MockData.escorts || [];
    el.innerHTML = `
      <div class="page-head" style="margin-bottom:12px; padding-bottom:0; border:none;">
        <h2 style="font-size:18px; font-weight:700;">陪诊师</h2>
        <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">专业陪诊师随时为您服务</div>
      </div>
      ${escorts.map(e => `
        <div class="esc-card" onclick="Patient.goEscortDetail('${e.id}')">
          <div class="esc-avatar">${e.avatar}</div>
          <div class="esc-info">
            <div class="esc-name">${e.name} <span class="esc-star">★ ${e.star}</span></div>
            <div class="esc-meta">${e.orders} 单 · ${e.region}</div>
            <div class="esc-tags">
              ${e.tags.slice(0, 3).map(t => `<span class="esc-tag">${t}</span>`).join('')}
            </div>
          </div>
          <div class="esc-status ${e.status === '服务中' ? 'busy' : 'free'}" title="${e.status}"></div>
        </div>
      `).join('')}
    `;
  },

  // ===== 陪诊师聊天界面 =====
  openChatWithEscort(escortId) {
    if (!App.requireLogin('联系陪诊师')) return;
    const e = (MockData.escorts || []).find(x => x.id === escortId);
    if (!e) return;
    this._currentEscort = e;
    this._chatMessages = [
      { from: 'escort', text: `您好，我是陪诊师${e.name}，很高兴为您服务！请问您有什么需要帮助的吗？`, time: this._chatTime() },
      { from: 'me', text: '您好，我想咨询一下陪诊的具体流程', time: this._chatTime() },
      { from: 'escort', text: '好的，我们的流程是：1.您填写就诊信息 2.我确认信息 3.约定时间地点 4.提供陪诊服务。请问您要就诊的医院和科室是？', time: this._chatTime() },
    ];
    this._renderChatPage();
  },

  _renderChatPage() {
    const e = this._currentEscort;
    if (!e) return;
    const screen = document.getElementById('screen');
    screen.classList.remove('fade-in'); void screen.offsetWidth; screen.classList.add('fade-in');

    screen.innerHTML = `
      <div class="chat-page">
        <div class="chat-header">
          <div class="svd-back" onclick="App.switchTab(1)">${P_ICON.chevronLeft}</div>
          <h2>${e.name}</h2>
        </div>
        <div class="chat-body" id="chatBody">
          ${this._chatMessages.map(m => this._renderChatMsg(m)).join('')}
        </div>
        <div class="chat-input-bar">
          <input type="text" id="chatInput" placeholder="输入消息..." />
          <button onclick="Patient._sendChatMsg()">发送</button>
        </div>
      </div>
    `;

    const input = document.getElementById('chatInput');
    if (input) input.addEventListener('keypress', ev => { if (ev.key === 'Enter') this._sendChatMsg(); });
    this._scrollChat();
  },

  _renderChatMsg(m) {
    const avatar = m.from === 'me' ? '我' : (this._currentEscort?.name?.[0] || '陪');
    return `
      <div class="chat-msg ${m.from}">
        <div class="chat-msg-avatar">${avatar}</div>
        <div class="chat-msg-content">
          <div class="chat-msg-bubble">${m.text}</div>
          <div class="chat-msg-time">${m.time}</div>
        </div>
      </div>
    `;
  },

  _sendChatMsg() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    input.value = '';
    this._chatMessages.push({ from: 'me', text, time: this._chatTime() });
    this._renderChatPage();
    this._scrollChat();

    // 模拟陪诊师回复
    setTimeout(() => {
      const replies = [
        '好的，我了解了。请问您的就诊时间是？',
        '可以的，我会提前30分钟到达。',
        '请问您需要轮椅服务吗？',
        '您可以把就诊医院和科室告诉我吗？',
        '我这边已经记录好了，随时可以为您服务。',
      ];
      this._chatMessages.push({ from: 'escort', text: replies[Math.floor(Math.random() * replies.length)], time: this._chatTime() });
      this._renderChatPage();
      this._scrollChat();
    }, 800 + Math.random() * 600);
  },

  _scrollChat() {
    const body = document.getElementById('chatBody');
    if (body) body.scrollTop = body.scrollHeight;
  },

  _chatTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  },

  // ===== 陪诊师详情页 =====
  goEscortDetail(id) {
    const e = (MockData.escorts || []).find(x => x.id === id);
    if (!e) return;
    this._currentEscort = e;
    this._renderEscortDetailPage();
  },

  _renderEscortDetailPage() {
    const e = this._currentEscort;
    if (!e) return;
    const screen = document.getElementById('screen');
    screen.classList.remove('fade-in'); void screen.offsetWidth; screen.classList.add('fade-in');

    const hospitals = (MockData.hospitals || []).filter(h => h.hot);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    const dayAfter = new Date(today.getTime() + 2*86400000);
    const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const dateOptions = [
      { label: '今天', value: fmt(today) },
      { label: '明天', value: fmt(tomorrow) },
      { label: '后天', value: fmt(dayAfter) },
    ];
    const serviceTypes = ['半程陪诊', '全程陪诊', '代办跑腿', '代办问诊', '特需陪诊'];

    screen.innerHTML = `
      <div class="svc-detail">
        <div class="svd-header">
          <div class="svd-back" onclick="App.switchTab(1)">${P_ICON.chevronLeft}</div>
          <h2>陪诊师详情</h2>
        </div>

        <!-- 陪诊师信息 -->
        <div class="ed-profile">
          <div class="ed-avatar">${e.avatar}</div>
          <div class="ed-info">
            <div class="ed-name">${e.name} <span class="ed-star">★ ${e.star}</span></div>
            <div class="ed-meta">${e.gender} · ${e.age}岁 · ${e.region}</div>
            <div class="ed-stats">
              <div class="ed-stat"><strong>${e.orders}</strong><span>服务单数</span></div>
              <div class="ed-stat"><strong>${e.completionRate}%</strong><span>完成率</span></div>
              <div class="ed-stat"><strong>${e.score}</strong><span>综合评分</span></div>
            </div>
          </div>
        </div>

        <!-- 擅长领域 -->
        <div class="svd-section">
          <div class="svd-section-title">擅长领域</div>
          <div class="ed-tags">
            ${e.tags.map(t => `<span class="ed-tag">${t}</span>`).join('')}
          </div>
        </div>

        <!-- 服务信息 -->
        <div class="svd-section">
          <div class="svd-section-title">服务信息</div>
          <div class="ed-info-list">
            <div class="ed-info-row">
              <span class="ed-info-label">状态</span>
              <span class="ed-info-value ${e.status === '服务中' ? 'busy' : 'free'}">${e.status}</span>
            </div>
            <div class="ed-info-row">
              <span class="ed-info-label">入职时间</span>
              <span class="ed-info-value">${e.joinDate}</span>
            </div>
            <div class="ed-info-row">
              <span class="ed-info-label">联系电话</span>
              <span class="ed-info-value">${e.phone}</span>
            </div>
            <div class="ed-info-row">
              <span class="ed-info-label">累计收入</span>
              <span class="ed-info-value">¥${e.income.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- 订单确认 -->
        <div class="svd-section">
          <div class="svd-section-title">确认订单信息</div>
          <div class="ed-form">
            <div class="ed-form-item">
              <label>就诊医院</label>
              <select id="edHospital">
                ${hospitals.map(h => `<option value="${h.name}">${h.name}</option>`).join('')}
              </select>
            </div>
            <div class="ed-form-item">
              <label>就诊日期</label>
              <div class="ed-date-picker">
                ${dateOptions.map((d, i) => `<label class="ed-date-opt"><input type="radio" name="edDate" value="${d.value}" ${i===0?'checked':''}><span>${d.label}</span><em>${d.value}</em></label>`).join('')}
              </div>
            </div>
            <div class="ed-form-item">
              <label>服务类型</label>
              <select id="edServiceType">
                ${serviceTypes.map(s => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="ed-form-item">
              <label>就诊科室</label>
              <input type="text" id="edDept" placeholder="如：心内科" />
            </div>
            <div class="ed-form-item">
              <label>备注说明</label>
              <textarea id="edNote" placeholder="如有特殊需求请填写，如：需要轮椅、听不懂普通话等" rows="2"></textarea>
            </div>
          </div>
        </div>

        <!-- 费用说明 -->
        <div class="svd-section">
          <div class="svd-section-title">费用说明</div>
          <div class="ed-price-box">
            <div class="ed-price-row"><span>陪诊服务费</span><strong id="edPrice">¥298</strong></div>
            <div class="ed-price-row"><span>押金</span><strong>¥0</strong></div>
            <div class="ed-price-total"><span>合计</span><strong id="edTotal">¥298</strong></div>
          </div>
        </div>

        <!-- 下单按钮 -->
        <div class="svd-bottom-bar">
          <button class="btn btn-outline" onclick="Patient.openChatWithEscort('${e.id}')">联系陪诊师</button>
          <button class="btn" onclick="Patient._submitEscortOrder()">确认下单</button>
        </div>
      </div>
    `;

    // 绑定服务类型变化更新价格
    const st = document.getElementById('edServiceType');
    if (st) st.addEventListener('change', () => {
      const prices = { '半程陪诊': 298, '全程陪诊': 498, '代办跑腿': 188, '代办问诊': 258, '特需陪诊': 688 };
      const p = prices[st.value] || 298;
      document.getElementById('edPrice').textContent = '¥' + p;
      document.getElementById('edTotal').textContent = '¥' + p;
    });
  },

  _submitEscortOrder() {
    if (!App.requireLogin('下单')) return;
    const e = this._currentEscort;
    if (!e) return;
    const hospital = document.getElementById('edHospital')?.value || '未选择';
    const dateEl = document.querySelector('input[name="edDate"]:checked');
    const date = dateEl ? dateEl.value : '';
    const serviceType = document.getElementById('edServiceType')?.value || '半程陪诊';
    const dept = document.getElementById('edDept')?.value || '';
    const note = document.getElementById('edNote')?.value || '';
    const amount = PriceTable.getPrice(serviceType);

    if (!date) { App.toast('请选择就诊日期'); return; }
    if (!dept) { App.toast('请填写就诊科室'); return; }

    const u = MockData.patient.user;
    const med = MockData.patient.medical;
    const req = NeedPool.add({
      patientName: u.name, gender: u.gender, age: u.age, phone: u.phone,
      emergencyName: u.emergencyName, emergencyPhone: u.emergencyPhone,
      history: med.history || '', allergy: med.allergy || '',
      medicine: med.medicine || '', mobility: med.mobility || '', insurance: '',
      hospital, dept, date, serviceType, amount,
      note: note || '通过陪诊师详情页下单',
      status: '待处理',
      idCardFront: null, idCardBack: null, reportFiles: [],
    });

    App.toast('预约已提交，等待管理员审核并匹配陪诊师');
    setTimeout(() => App.switchTab(2), 800);
  },

  // ===== 订单页 =====
  renderOrders(el) {
    const tabs = ['全部', '待付款', '待接单', '待服务', '进行中', '已完成'];
    const statusMap = { '全部': null, '待付款': '待处理', '待接单': '已分配', '进行中': '服务中', '已完成': '已完成' };
    const user = MockData.patient.user;
    let needs = NeedPool.list.filter(n => n.patientName === user.name);

    const filterTab = this._currentOrderTab;
    const filterStatus = statusMap[filterTab];
    if (filterStatus) {
      needs = needs.filter(n => n.status === filterStatus);
    }

    el.innerHTML = `
      <div class="page-head" style="margin-bottom:0; padding-bottom:0; border:none;">
        <h2 style="font-size:18px; font-weight:700;">我的订单</h2>
      </div>
      <div class="order-tabs">
        ${tabs.map(t => `<button class="order-tab ${filterTab === t ? 'active' : ''}" onclick="Patient._switchOrderTab('${t}')">${t}</button>`).join('')}
      </div>
      ${needs.length === 0 ? `
        <div class="order-empty">
          <div class="order-empty-icon">${P_ICON.clipboard}</div>
          <div>暂无订单</div>
          <div style="font-size:12px; margin-top:6px;">登录后查看您的订单记录</div>
        </div>
      ` : needs.map(n => this._renderOrderCard(n)).join('')}
    `;
  },

  _switchOrderTab(tab) {
    this._currentOrderTab = tab;
    this.renderOrders(document.getElementById('screen'));
  },

  _renderOrderCard(n) {
    const statusClass = n.status === '待处理' ? 'pending' : n.status === '已分配' ? 'accepted' : n.status === '服务中' ? 'serving' : 'done';
    const statusLabel = n.status === '待处理' ? '待审核' : n.status === '已分配' ? '待服务' : n.status === '服务中' ? '进行中' : n.status;
    return `
      <div class="order-card" onclick="Patient._openOrderDetail('${n.id}')">
        <div class="order-head">
          <span class="order-status ${statusClass}">${statusLabel}</span>
          <span style="font-size:11px; color:var(--text-muted);">${n.id}</span>
        </div>
        <div class="order-title">${n.hospital} · ${n.dept}</div>
        <div class="order-sub">${n.date} · ${n.serviceType} · ¥${n.amount}</div>
        ${n.escortName ? `
          <div style="margin-top:8px; padding:8px 10px; background:var(--accent-bg); border-radius:6px; font-size:12px; display:flex; justify-content:space-between; align-items:center;">
            <span>陪诊师：<strong style="color:var(--accent);">${n.escortName}</strong></span>
            <span style="color:var(--text-muted); font-size:11px;">待服务</span>
          </div>
        ` : ''}
        ${n.note ? `
          <div style="margin-top:6px; font-size:11px; color:var(--text-muted); line-height:1.4; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;">备注：${n.note}</div>
        ` : ''}
      </div>
    `;
  },

  _openOrderDetail(id) {
    const n = NeedPool.getById(id);
    if (!n) return;
    if (!App.requireLogin('查看订单详情')) return;
    this._renderOrderDetailPage(id);
  },

  _renderOrderDetailPage(id) {
    const n = NeedPool.getById(id);
    if (!n) return;
    const screen = document.getElementById('screen');
    screen.classList.remove('fade-in'); void screen.offsetWidth; screen.classList.add('fade-in');

    const statusClass = n.status === '待处理' ? 'pending' : n.status === '已分配' ? 'accepted' : n.status === '服务中' ? 'serving' : 'done';
    const timelineItems = [
      { label: '订单创建', time: n.createTime, done: true },
      { label: '陪诊师对接', time: n.escortName ? n.updatedAt : null, done: !!n.escortName },
      { label: '服务开始', time: n.status === '服务中' || n.status === '已完成' ? n.date : null, done: n.status === '服务中' || n.status === '已完成' },
      { label: '服务完成', time: n.status === '已完成' ? n.updatedAt : null, done: n.status === '已完成' },
    ];

    screen.innerHTML = `
      <div class="svc-detail">
        <div class="svd-header">
          <div class="svd-back" onclick="Patient.goBack()">${P_ICON.chevronLeft}</div>
          <h2>订单详情</h2>
        </div>

        <!-- 订单状态 -->
        <div class="ed-profile" style="flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div class="ed-name">${n.serviceType}</div>
              <div class="ed-meta">订单号：${n.id}</div>
            </div>
            <span class="order-status ${statusClass}">${n.status}</span>
          </div>
          <div class="ed-price-total" style="border:none; padding:0; margin:0;">
            <span>订单金额</span>
            <strong>¥${n.amount}</strong>
          </div>
        </div>

        <!-- 就医信息 -->
        <div class="svd-section">
          <div class="svd-section-title">就医信息</div>
          <div class="ed-info-list">
            <div class="ed-info-row"><span class="ed-info-label">就诊医院</span><span class="ed-info-value">${n.hospital}</span></div>
            <div class="ed-info-row"><span class="ed-info-label">就诊科室</span><span class="ed-info-value">${n.dept}</span></div>
            <div class="ed-info-row"><span class="ed-info-label">就诊日期</span><span class="ed-info-value">${n.date}</span></div>
            <div class="ed-info-row"><span class="ed-info-label">服务类型</span><span class="ed-info-value">${n.serviceType}</span></div>
            ${n.note ? `<div class="ed-info-row"><span class="ed-info-label">备注</span><span class="ed-info-value" style="max-width:60%; text-align:right;">${n.note}</span></div>` : ''}
          </div>
        </div>

        <!-- 患者信息 -->
        <div class="svd-section">
          <div class="svd-section-title">患者信息</div>
          <div class="ed-info-list">
            <div class="ed-info-row"><span class="ed-info-label">姓名</span><span class="ed-info-value">${n.patientName}</span></div>
            <div class="ed-info-row"><span class="ed-info-label">性别/年龄</span><span class="ed-info-value">${n.gender} · ${n.age}岁</span></div>
            <div class="ed-info-row"><span class="ed-info-label">联系电话</span><span class="ed-info-value">${n.phone}</span></div>
            <div class="ed-info-row"><span class="ed-info-label">紧急联系人</span><span class="ed-info-value">${n.emergencyName || '未填写'} ${n.emergencyPhone ? '· ' + n.emergencyPhone : ''}</span></div>
          </div>
        </div>

        ${n.escortName ? `
        <!-- 陪诊师信息 -->
        <div class="svd-section">
          <div class="svd-section-title">陪诊师信息</div>
          <div class="ed-info-list">
            <div class="ed-info-row"><span class="ed-info-label">陪诊师</span><span class="ed-info-value" style="color:var(--accent);">${n.escortName}</span></div>
            ${n.escortPhone ? `<div class="ed-info-row"><span class="ed-info-label">联系电话</span><span class="ed-info-value">${n.escortPhone}</span></div>` : ''}
          </div>
        </div>
        ` : `
        <!-- 未匹配提示 -->
        <div class="svd-section">
          <div class="svd-section-title">陪诊师信息</div>
          <div style="padding:16px; background:var(--accent-bg); border-radius:var(--radius); text-align:center; font-size:13px; color:var(--text-secondary);">
            陪诊师匹配中，平台将根据您的需求尽快安排合适的陪诊师
          </div>
        </div>
        `}

        <!-- 订单进度 -->
        <div class="svd-section">
          <div class="svd-section-title">订单进度</div>
          <div class="svd-process-list">
            ${timelineItems.map((item, i) => `
              <div class="svd-process-item ${item.done ? '' : 'inactive'}">
                <div class="svd-process-num" style="${item.done ? '' : 'background:var(--bg-tertiary); color:var(--text-muted);'}">${i+1}</div>
                <div class="svd-process-content">
                  <div class="svd-process-title">${item.label}</div>
                  <div class="svd-process-text">${item.time || '待处理'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="svd-bottom-bar">
          ${n.status === '待处理' ? `<button class="btn btn-outline" onclick="Patient._cancelOrder('${n.id}')">取消订单</button>` : ''}
          ${n.status === '已完成' ? `<button class="btn" onclick="Patient._reviewOrder('${n.id}')">评价订单</button>` : ''}
          ${n.status !== '已完成' && n.status !== '待处理' ? `<button class="btn" onclick="Patient._contactEscortFromOrder('${n.id}')">联系陪诊师</button>` : ''}
        </div>
      </div>
    `;
  },

  _cancelOrder(id) {
    if (!confirm('确定要取消这个订单吗？')) return;
    NeedPool.update(id, { status: '已取消', updatedAt: new Date().toLocaleString('zh-CN') });
    App.toast('订单已取消');
    setTimeout(() => App.switchTab(2), 500);
  },

  _reviewOrder(id) {
    App.toast('评价功能开发中');
  },

  _contactEscortFromOrder(id) {
    const n = NeedPool.getById(id);
    if (n && n.escortId) {
      this.openChatWithEscort(n.escortId);
    } else if (n && n.escortName) {
      App.toast('正在为您对接' + n.escortName);
    } else {
      App.toast('暂无陪诊师信息');
    }
  },

  // ===== 我的页 =====
  renderProfile(el) {
    const isGuest = App.isGuest;
    const u = MockData.patient.user;
    const myNeeds = NeedPool.list.filter(n => n.patientName === u.name);
    const doneCount = myNeeds.filter(n => n.status === '已完成').length;
    const activeCount = myNeeds.filter(n => ['待处理','已分配','服务中'].includes(n.status)).length;

    el.innerHTML = `
      <!-- 用户信息头 -->
      <div class="me-header">
        <div class="me-avatar">${isGuest ? '游' : u.avatar}</div>
        <div class="me-name">${isGuest ? '未登录' : u.name}</div>
        <div class="me-sub">${isGuest ? '登录后享受完整服务' : u.gender + ' · ' + u.age + '岁'}</div>
        ${isGuest ? `<button class="me-login-btn" onclick="App.state='patientLogin';App.render()">立即登录</button>` : ''}
      </div>

      <!-- 统计 -->
      <div class="me-stats">
        <div class="me-stat">
          <div class="me-stat-num">${doneCount}</div>
          <div class="me-stat-label">已完成</div>
        </div>
        <div class="me-stat">
          <div class="me-stat-num" style="color:var(--status-partial);">${activeCount}</div>
          <div class="me-stat-label">进行中</div>
        </div>
        <div class="me-stat">
          <div class="me-stat-num" style="color:var(--status-covered);">${myNeeds.length}</div>
          <div class="me-stat-label">总订单</div>
        </div>
      </div>

      <!-- 我的服务 -->
      <div class="me-section-title">我的服务</div>
      <div class="me-service-grid">
        <div class="me-service-item" onclick="Patient._svcAction('orders')">
          <div class="me-service-icon" style="background:rgba(59,108,181,0.1); color:var(--accent);">${P_ICON.clipboard}</div>
          <div class="me-service-name">就诊人管理</div>
        </div>
        <div class="me-service-item" onclick="Patient._svcAction('escort')">
          <div class="me-service-icon" style="background:rgba(22,163,74,0.1); color:var(--status-covered);">${P_ICON.userCheck}</div>
          <div class="me-service-name">陪诊师入驻</div>
        </div>
        <div class="me-service-item" onclick="Patient._svcAction('address')">
          <div class="me-service-icon" style="background:rgba(234,88,12,0.1); color:#ea580c;">${P_ICON.location}</div>
          <div class="me-service-name">地址管理</div>
        </div>
        <div class="me-service-item" onclick="Patient._svcAction('review')">
          <div class="me-service-icon" style="background:rgba(202,138,4,0.1); color:#ca8a04;">${P_ICON.star}</div>
          <div class="me-service-name">我的评价</div>
        </div>
      </div>

      <!-- 订单中心 -->
      ${!isGuest ? `
      <div class="me-section-title">订单中心</div>
      <div class="me-menu">
        <div class="me-menu-item" onclick="Patient.navigateTo(el => Patient.renderNeed(el), '我的需求')">
          <div class="me-menu-icon" style="background:rgba(59,108,181,0.1); color:var(--accent);">${P_ICON.edit}</div>
          <div class="me-menu-text">我的需求（草稿表单）</div>
          <div class="me-menu-arrow">${P_ICON.chevronRight}</div>
        </div>
        <div class="me-menu-item" onclick="Patient.navigateTo(el => Patient.renderProgress(el), '陪诊进度')">
          <div class="me-menu-icon" style="background:rgba(22,163,74,0.1); color:var(--status-covered);">${P_ICON.inbox}</div>
          <div class="me-menu-text">陪诊进度</div>
          <div class="me-menu-arrow">${P_ICON.chevronRight}</div>
        </div>
      </div>
      ` : ''}

      <!-- 功能菜单 -->
      <div class="me-section-title">其他功能</div>
      <div class="me-menu">
        <div class="me-menu-item" onclick="Patient._svcAction('service')">
          <div class="me-menu-icon">${P_ICON.messageCircle}</div>
          <div class="me-menu-text">客服中心</div>
          <div class="me-menu-arrow">${P_ICON.chevronRight}</div>
        </div>
        <div class="me-menu-item" onclick="Patient._svcAction('settings')">
          <div class="me-menu-icon">${P_ICON.settings}</div>
          <div class="me-menu-text">设置中心</div>
          <div class="me-menu-arrow">${P_ICON.chevronRight}</div>
        </div>
        ${!isGuest ? `
        <div class="me-menu-item" onclick="App.logout()">
          <div class="me-menu-icon" style="background:rgba(220,38,38,0.1); color:var(--status-notfound);">${P_ICON.alert}</div>
          <div class="me-menu-text" style="color:var(--status-notfound);">退出登录</div>
          <div class="me-menu-arrow">${P_ICON.chevronRight}</div>
        </div>
        ` : ''}
      </div>
    `;
  },

  _svcAction(type) {
    const nameMap = { orders: '就诊人管理', escort: '陪诊师入驻', address: '地址管理', review: '我的评价', service: '客服中心', settings: '设置中心' };
    if (!App.requireLogin(nameMap[type] || '使用此功能')) return;
    if (type === 'orders') {
      this.openPatientManager();
    } else if (type === 'address') {
      this._openAddressManager();
    } else {
      App.toast('功能演示中');
    }
  },

  _openAddressManager() {
    App.toast('地址管理功能开发中');
  },

  // ===== 就诊人管理 =====
  openPatientManager() {
    const screen = document.getElementById('screen');
    screen.classList.remove('fade-in'); void screen.offsetWidth; screen.classList.add('fade-in');
    const patients = this._getPatients();
    screen.innerHTML = `
      <div class="svc-detail">
        <div class="svd-header">
          <div class="svd-back" onclick="App.switchTab(3)">${P_ICON.chevronLeft}</div>
          <h2>就诊人管理</h2>
          <div style="width:32px; text-align:right; cursor:pointer;" onclick="Patient._addPatient()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
        </div>
        ${patients.length === 0 ? `
          <div class="p-empty">
            <div style="font-size:36px; margin-bottom:10px;">👤</div>
            <div>暂无就诊人信息</div>
            <div style="margin-top:6px;">点击右上角 + 添加就诊人</div>
          </div>
        ` : `
          <div class="p-list">
            ${patients.map((p, i) => `
              <div class="p-card">
                <div class="p-card-head">
                  <div class="p-avatar">${(p.name || '?')[0]}</div>
                  <div class="p-info">
                    <div class="p-name">${p.name}</div>
                    <div class="p-meta">${p.gender} · ${p.age}岁${p.relation ? ' · ' + p.relation : ''}</div>
                  </div>
                </div>
                ${p.medicalHistory ? `
                  <div class="p-record-list">
                    ${p.medicalHistory.split('、').filter(Boolean).map(h => `
                      <div class="p-record-item">${P_ICON.clipboard} ${h}</div>
                    `).join('')}
                  </div>
                ` : ''}
                ${p.images && p.images.length > 0 ? `
                  <div class="p-image-grid">
                    ${p.images.map((img, j) => `
                      <div class="p-image-thumb">
                        ${img.startsWith('data:') ? `<img src="${img}" alt="检查报告"/>` : `<span>📋</span>`}
                        <div class="p-image-del" onclick="Patient._removeImage(${i}, ${j})">×</div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
                <div class="p-actions">
                  <button class="btn btn-outline" onclick="Patient._editPatient(${i})">编辑</button>
                  <button class="btn btn-outline" onclick="Patient._addImage(${i})">添加图片</button>
                  <button class="btn btn-outline" style="color:var(--status-notfound);" onclick="Patient._deletePatient(${i})">删除</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
        ${patients.length > 0 ? `
          <div style="margin-top:16px; text-align:center;">
            <button class="btn btn-outline" style="padding:10px 30px;" onclick="Patient._addPatient()">+ 添加就诊人</button>
          </div>
        ` : ''}
      </div>
    `;
  },

  _getPatients() {
    if (!this._patients) {
      try {
        this._patients = JSON.parse(localStorage.getItem('huwuyou_patients') || 'null') || [];
      } catch (e) { this._patients = []; }
    }
    return this._patients;
  },

  _savePatients() {
    localStorage.setItem('huwuyou_patients', JSON.stringify(this._patients));
  },

  _addPatient() {
    this._showPatientForm(null, -1);
  },

  _editPatient(idx) {
    this._showPatientForm(this._patients[idx], idx);
  },

  _deletePatient(idx) {
    if (!confirm('确定要删除这个就诊人吗？')) return;
    this._patients.splice(idx, 1);
    this._savePatients();
    this.openPatientManager();
  },

  _addImage(idx) {
    const p = this._patients[idx];
    if (!p.images) p.images = [];
    // 模拟添加图片
    const fakeImages = [
      '🩺 CT影像报告',
      '💊 处方单',
      '📋 化验单',
      '🏥 病历本',
      '🩻 X光片',
    ];
    p.images.push(fakeImages[Math.floor(Math.random() * fakeImages.length)]);
    this._savePatients();
    this.openPatientManager();
  },

  _removeImage(pIdx, imgIdx) {
    this._patients[pIdx].images.splice(imgIdx, 1);
    this._savePatients();
    this.openPatientManager();
  },

  _showPatientForm(patient, idx) {
    const isEdit = patient !== null;
    const p = patient || { name: '', gender: '男', age: '', relation: '', phone: '', medicalHistory: '', images: [] };
    const screen = document.getElementById('screen');
    screen.classList.remove('fade-in'); void screen.offsetWidth; screen.classList.add('fade-in');

    screen.innerHTML = `
      <div class="svc-detail">
        <div class="svd-header">
          <div class="svd-back" onclick="Patient.openPatientManager()">${P_ICON.chevronLeft}</div>
          <h2>${isEdit ? '编辑就诊人' : '添加就诊人'}</h2>
        </div>
        <div class="ed-form">
          <div class="ed-form-item">
            <label>姓名 <span style="color:var(--status-notfound);">*</span></label>
            <input type="text" id="pf_name" value="${p.name}" placeholder="请输入姓名" />
          </div>
          <div class="ed-form-item">
            <label>性别 <span style="color:var(--status-notfound);">*</span></label>
            <div style="display:flex; gap:10px;">
              <label style="flex:1;"><input type="radio" name="pf_gender" value="男" ${p.gender==='男'?'checked':''}/> 男</label>
              <label style="flex:1;"><input type="radio" name="pf_gender" value="女" ${p.gender==='女'?'checked':''}/> 女</label>
            </div>
          </div>
          <div class="ed-form-item">
            <label>年龄 <span style="color:var(--status-notfound);">*</span></label>
            <input type="number" id="pf_age" value="${p.age}" placeholder="请输入年龄" min="0" max="150" />
          </div>
          <div class="ed-form-item">
            <label>关系</label>
            <select id="pf_relation">
              <option value="">请选择</option>
              <option value="本人" ${p.relation==='本人'?'selected':''}>本人</option>
              <option value="父亲" ${p.relation==='父亲'?'selected':''}>父亲</option>
              <option value="母亲" ${p.relation==='母亲'?'selected':''}>母亲</option>
              <option value="配偶" ${p.relation==='配偶'?'selected':''}>配偶</option>
              <option value="子女" ${p.relation==='子女'?'selected':''}>子女</option>
              <option value="其他亲属" ${p.relation==='其他亲属'?'selected':''}>其他亲属</option>
            </select>
          </div>
          <div class="ed-form-item">
            <label>联系电话</label>
            <input type="tel" id="pf_phone" value="${p.phone || ''}" placeholder="请输入联系电话" />
          </div>
          <div class="ed-form-item">
            <label>病史信息</label>
            <textarea id="pf_history" placeholder="如：高血压、糖尿病等，多个用、分隔" rows="3">${p.medicalHistory || ''}</textarea>
          </div>
          <div class="ed-form-item">
            <label>上传检查报告/影像</label>
            <div class="p-image-grid">
              ${(p.images || []).map((img, j) => `
                <div class="p-image-thumb">
                  ${img.startsWith('data:') ? `<img src="${img}"/>` : `<span>${img}</span>`}
                  <div class="p-image-del" onclick="Patient._removeImageInForm(${j})">×</div>
                </div>
              `).join('')}
              <div class="p-image-add" onclick="Patient._pickFile()">
                ${P_ICON.image}
                <span>添加图片</span>
              </div>
            </div>
            <input type="file" id="pf_file" accept="image/*" multiple style="display:none;" onchange="Patient._handleFileUpload(this)" />
          </div>
        </div>
        <div class="svd-bottom-bar">
          <button class="btn" onclick="Patient._savePatient(${idx})">${isEdit ? '保存修改' : '添加就诊人'}</button>
        </div>
      </div>
    `;
    this._tempImages = p.images ? [...p.images] : [];
  },

  _pickFile() {
    const el = document.getElementById('pf_file');
    if (el) el.click();
  },

  _handleFileUpload(input) {
    const files = input.files;
    if (!files || files.length === 0) return;
    const handleOne = (file) => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
    Promise.all(Array.from(files).map(handleOne)).then(results => {
      results.forEach(r => this._tempImages.push(r));
      // 重新渲染表单
      const idx = parseInt(input.dataset.idx || '-1');
      const name = document.getElementById('pf_name')?.value || '';
      const gender = document.querySelector('input[name="pf_gender"]:checked')?.value || '男';
      const age = document.getElementById('pf_age')?.value || '';
      const relation = document.getElementById('pf_relation')?.value || '';
      const phone = document.getElementById('pf_phone')?.value || '';
      const history = document.getElementById('pf_history')?.value || '';
      this._showPatientForm(
        { name, gender, age, relation, phone, medicalHistory: history, images: this._tempImages },
        idx
      );
    });
  },

  _removeImageInForm(j) {
    this._tempImages.splice(j, 1);
    const name = document.getElementById('pf_name')?.value || '';
    const gender = document.querySelector('input[name="pf_gender"]:checked')?.value || '男';
    const age = document.getElementById('pf_age')?.value || '';
    const relation = document.getElementById('pf_relation')?.value || '';
    const phone = document.getElementById('pf_phone')?.value || '';
    const history = document.getElementById('pf_history')?.value || '';
    const idx = parseInt(document.getElementById('pf_file')?.dataset.idx || '-1');
    this._showPatientForm(
      { name, gender, age, relation, phone, medicalHistory: history, images: this._tempImages },
      idx
    );
  },

  _savePatient(idx) {
    const name = document.getElementById('pf_name')?.value?.trim();
    const gender = document.querySelector('input[name="pf_gender"]:checked')?.value || '男';
    const age = document.getElementById('pf_age')?.value;
    const relation = document.getElementById('pf_relation')?.value || '';
    const phone = document.getElementById('pf_phone')?.value || '';
    const history = document.getElementById('pf_history')?.value || '';

    if (!name) { App.toast('请填写姓名'); return; }
    if (!age || age < 0) { App.toast('请填写有效年龄'); return; }

    const data = { name, gender, age: parseInt(age), relation, phone, medicalHistory: history, images: this._tempImages || [] };

    if (idx >= 0) {
      this._patients[idx] = data;
    } else {
      this._patients.push(data);
    }
    this._savePatients();
    App.toast('保存成功');
    this.openPatientManager();
  },

  // ===== 通用方法 =====
  toast(msg) { App.toast(msg); },
};

window.Patient = Patient;
