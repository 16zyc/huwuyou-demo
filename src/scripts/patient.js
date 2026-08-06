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

    /* 响应式 */
    @media (max-width:374px) {
      .ph-svc-sub-list { grid-template-columns:1fr; }
      .ph-svc-big-card .ph-sbc-head { padding:12px; }
      .ph-sbc-icon-wrap { width:44px; height:44px; }
      .ph-sbc-icon-wrap svg { width:22px; height:22px; }
      .ph-sbc-title { font-size:15px; }
    }
  `;
  document.head.appendChild(style);
})();

// ========== 患者端主对象 ==========
const Patient = {
  tabs: [
    { name: '首页', icon: P_ICON.home },
    { name: '陪诊师', icon: P_ICON.escort },
    { name: '订单', icon: P_ICON.orders },
    { name: '我的', icon: P_ICON.user },
  ],

  _currentOrderTab: '全部',
  _currentHospitals: [],
  _searchKeyword: '',
  _searchFilter: { category: '', city: '', sort: '' },
  _currentHospitalDetail: null,

  render(tab, el) {
    if (tab === 0) this.renderHome(el);
    else if (tab === 1) this.renderEscorts(el);
    else if (tab === 2) this.renderOrders(el);
    else this.renderProfile(el);
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

      <!-- 四大业务入口（大卡片形式）-->
      <div class="ph-svc-list">
        ${this._renderServiceBigCard('consult', '诊前咨询', '没头绪？不知道看什么科？专业陪诊师为您解答', 'c1', P_ICON.service_consult, ['专业解答', '流程指导', '科室推荐'])}
        ${this._renderServiceBigCard('agent', '代办服务', '代取药、代挂号、代办跑腿，足不出户搞定', 'c2', P_ICON.service_agent_cat, ['代办跑腿', '代办问诊', '辅助就医'])}
        ${this._renderServiceBigCard('special', '特需服务', '孕妇、儿童、老人、护士等专业陪诊', 'c3', P_ICON.service_special, ['孕妇陪诊', '儿童陪诊', '专病陪诊'])}
        ${this._renderServiceBigCard('featured', '特色介绍', '国风助行、专家会诊等特色服务', 'c4', P_ICON.service_featured, ['国风助行', '专家会诊', '康复陪诊'])}
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
      <!-- 登录提示 -->
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
    return `
      <div class="ph-hosp-card" onclick="Patient.goHospitalDetail('${h.id}')">
        <div class="ph-hosp-img">
          <img src="${h.image}" alt="${h.name}" loading="lazy" onerror="this.style.display='none'">
          <span class="ph-hosp-badge">${h.level}</span>
        </div>
        <div class="ph-hosp-info">
          <div class="ph-hosp-name">${h.name}</div>
          <div class="ph-hosp-tags">
            <span class="ph-hosp-tag">${h.level}</span>
            <span class="ph-hosp-tag cat">${h.category}</span>
          </div>
          <div class="ph-hosp-intro">${h.intro}</div>
          <div class="ph-hosp-meta">
            ${P_ICON.location} ${h.address}
            <span class="ph-hosp-order">已服务 ${h.orders} 单</span>
          </div>
        </div>
      </div>
    `;
  },

  // ===== 服务点击 → 跳转到对应服务详情页 =====
  onServiceClick(type) {
    this._renderServiceDetailPage(type);
  },

  // ===== 服务详情页 =====
  _renderServiceDetailPage(type) {
    const screen = document.getElementById('screen');
    screen.classList.remove('fade-in'); void screen.offsetWidth; screen.classList.add('fade-in');

    const pages = {
      consult: this._renderConsultPage(),
      agent: this._renderAgentPage(),
      special: this._renderSpecialPage(),
      featured: this._renderFeaturedPage(),
    };
    screen.innerHTML = pages[type] || pages.consult;
  },

  _renderConsultPage() {
    return `
      <div class="svc-detail">
        <div class="svd-header">
          <div class="svd-back" onclick="App.switchTab(0)">${P_ICON.chevronLeft}</div>
          <h2>诊前咨询</h2>
        </div>
        <div class="svd-hero">
          <div class="svd-hero-banner" style="background:linear-gradient(135deg,#3b6cb5,#2a4d8f);">诊前咨询</div>
          <div class="svd-hero-info">
            <div class="svd-hero-title">就诊前方案定制</div>
            <div class="svd-hero-desc">专业陪诊师为您解答就诊疑问</div>
          </div>
        </div>
        <div class="svd-section">
          <div class="svd-section-title">为什么要诊前咨询</div>
          <div class="svd-reason-list">
            <div class="svd-reason-item">
              <div class="svd-reason-icon" style="background:rgba(234,88,12,0.1);color:#ea580c;">${P_ICON.alert}</div>
              <div class="svd-reason-content">
                <div class="svd-reason-title">没头绪</div>
                <div class="svd-reason-text">对就诊城市/医院/科室/专家不了解</div>
              </div>
            </div>
            <div class="svd-reason-item">
              <div class="svd-reason-icon" style="background:rgba(59,108,181,0.1);color:var(--accent);">${P_ICON.search}</div>
              <div class="svd-reason-content">
                <div class="svd-reason-title">对就诊流程/环境陌生</div>
                <div class="svd-reason-text">不知道如何挂号/不知道怎么走</div>
              </div>
            </div>
            <div class="svd-reason-item">
              <div class="svd-reason-icon" style="background:rgba(202,138,4,0.1);color:#ca8a04;">${P_ICON.clipboard}</div>
              <div class="svd-reason-content">
                <div class="svd-reason-title">没重点</div>
                <div class="svd-reason-text">不知道如何挂号/不懂怎么问</div>
              </div>
            </div>
          </div>
        </div>
        <div class="svd-section">
          <div class="svd-section-title">服务流程</div>
          <div class="svd-process-list">
            <div class="svd-process-item">
              <div class="svd-process-num">1</div>
              <div class="svd-process-content">
                <div class="svd-process-title">就诊咨询</div>
                <div class="svd-process-text">就诊医院/科室/专家信息咨询，包括医生擅长、是否有号等信息核实查询</div>
              </div>
            </div>
            <div class="svd-process-item">
              <div class="svd-process-num">2</div>
              <div class="svd-process-content">
                <div class="svd-process-title">挂号指导</div>
                <div class="svd-process-text">手把手教您如何挂号</div>
              </div>
            </div>
            <div class="svd-process-item">
              <div class="svd-process-num">3</div>
              <div class="svd-process-content">
                <div class="svd-process-title">路线规划</div>
                <div class="svd-process-text">从家到就诊医院线路规划，就诊住宿交通规划等</div>
              </div>
            </div>
          </div>
        </div>
        <div class="svd-bottom-bar">
          <button class="btn btn-outline" onclick="App.requireLogin('诊前咨询') ? Patient._contactService('诊前咨询') : null">一键咨询</button>
          <button class="btn" onclick="Patient._bookService('consult')">立即预约</button>
        </div>
      </div>
    `;
  },

  _renderAgentPage() {
    return `
      <div class="svc-detail">
        <div class="svd-header">
          <div class="svd-back" onclick="App.switchTab(0)">${P_ICON.chevronLeft}</div>
          <h2>代办服务</h2>
        </div>
        <div class="svd-hero">
          <div class="svd-hero-banner" style="background:linear-gradient(135deg,#16a34a,#0d7a38);">特色陪诊</div>
          <div class="svd-hero-info">
            <div class="svd-hero-title">代办跑腿 · 代办问诊</div>
            <div class="svd-hero-desc">足不出户，专业代办帮您搞定</div>
          </div>
        </div>
        <div class="svd-section">
          <div class="svd-section-title">服务项目</div>
          <div class="svd-sub-list">
            <div class="svd-sub-card" onclick="Patient._bookService('agent_run')">
              <div class="svd-sub-img" style="background:linear-gradient(135deg,#dcfce7,#bbf7d0);color:#16a34a;">${P_ICON.clipboard}</div>
              <div class="svd-sub-info">
                <div class="svd-sub-title">代办跑腿</div>
                <div class="svd-sub-price">¥188 <small>¥198</small></div>
                <div class="svd-sub-tags">
                  <span class="svd-sub-tag">代取药</span>
                  <span class="svd-sub-tag">代取报告</span>
                </div>
              </div>
            </div>
            <div class="svd-sub-card" onclick="Patient._bookService('agent_consult')">
              <div class="svd-sub-img" style="background:linear-gradient(135deg,#dcfce7,#bbf7d0);color:#16a34a;">${P_ICON.messageCircle}</div>
              <div class="svd-sub-info">
                <div class="svd-sub-title">代办问诊</div>
                <div class="svd-sub-price">¥258 <small>¥298</small></div>
                <div class="svd-sub-tags">
                  <span class="svd-sub-tag">代挂号</span>
                  <span class="svd-sub-tag">代问诊</span>
                </div>
              </div>
            </div>
            <div class="svd-sub-card" onclick="Patient._bookService('agent_report')">
              <div class="svd-sub-img" style="background:linear-gradient(135deg,#dcfce7,#bbf7d0);color:#16a34a;">${P_ICON.search}</div>
              <div class="svd-sub-info">
                <div class="svd-sub-title">代约检查/取报告</div>
                <div class="svd-sub-price">¥98 <small>¥128</small></div>
                <div class="svd-sub-tags">
                  <span class="svd-sub-tag">代预约</span>
                  <span class="svd-sub-tag">代取报告</span>
                </div>
              </div>
            </div>
            <div class="svd-sub-card" onclick="Patient._bookService('agent_assist')">
              <div class="svd-sub-img" style="background:linear-gradient(135deg,#dcfce7,#bbf7d0);color:#16a34a;">${P_ICON.userCheck}</div>
              <div class="svd-sub-info">
                <div class="svd-sub-title">辅助就医</div>
                <div class="svd-sub-price">¥158 <small>¥198</small></div>
                <div class="svd-sub-tags">
                  <span class="svd-sub-tag">辅助就医</span>
                  <span class="svd-sub-tag">路线引导</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="svd-bottom-bar">
          <button class="btn" onclick="Patient._bookService('agent')">立即预约</button>
        </div>
      </div>
    `;
  },

  _renderSpecialPage() {
    return `
      <div class="svc-detail">
        <div class="svd-header">
          <div class="svd-back" onclick="App.switchTab(0)">${P_ICON.chevronLeft}</div>
          <h2>特需服务</h2>
        </div>
        <div class="svd-hero">
          <div class="svd-hero-banner" style="background:linear-gradient(135deg,#ea580c,#c24a0a);">国风助行</div>
          <div class="svd-hero-info">
            <div class="svd-hero-title">国风助行陪诊</div>
            <div class="svd-hero-desc">让每一次陪诊都充满温度</div>
          </div>
        </div>
        <div class="svd-section">
          <div class="svd-section-title">服务流程</div>
          <div class="svd-process-list">
            <div class="svd-process-item">
              <div class="svd-process-num">1</div>
              <div class="svd-process-content">
                <div class="svd-process-title">接单预约</div>
                <div class="svd-process-text">7x12小时响应，专业陪诊人员24小时在岗</div>
              </div>
            </div>
            <div class="svd-process-item">
              <div class="svd-process-num">2</div>
              <div class="svd-process-content">
                <div class="svd-process-title">智能陪诊</div>
                <div class="svd-process-text">智能规划就诊路线，精准陪同每一步</div>
              </div>
            </div>
            <div class="svd-process-item">
              <div class="svd-process-num">3</div>
              <div class="svd-process-content">
                <div class="svd-process-title">温馨到达</div>
                <div class="svd-process-text">精准准时到达指定位置，提供安全陪同服务</div>
              </div>
            </div>
            <div class="svd-process-item">
              <div class="svd-process-num">4</div>
              <div class="svd-process-content">
                <div class="svd-process-title">贴心陪诊</div>
                <div class="svd-process-text">耐心解答医生问题，贴心照顾陪同老人</div>
              </div>
            </div>
            <div class="svd-process-item">
              <div class="svd-process-num">5</div>
              <div class="svd-process-content">
                <div class="svd-process-title">安全送达</div>
                <div class="svd-process-text">完成所有陪诊任务，安全送到指定地点</div>
              </div>
            </div>
          </div>
        </div>
        <div class="svd-bottom-bar">
          <button class="btn" onclick="Patient._bookService('special')">立即预约</button>
        </div>
      </div>
    `;
  },

  _renderFeaturedPage() {
    return `
      <div class="svc-detail">
        <div class="svd-header">
          <div class="svd-back" onclick="App.switchTab(0)">${P_ICON.chevronLeft}</div>
          <h2>特色陪诊</h2>
        </div>
        <div class="svd-hero">
          <div class="svd-hero-banner" style="background:linear-gradient(135deg,#ca8a04,#a67203);">特色陪诊</div>
          <div class="svd-hero-info">
            <div class="svd-hero-title">专业陪诊 · 家人般陪伴</div>
            <div class="svd-hero-desc">针对不同人群提供专业陪诊服务</div>
          </div>
        </div>
        <div class="svd-section">
          <div class="svd-section-title">特色服务</div>
          <div class="svd-sub-list">
            <div class="svd-sub-card" onclick="Patient._bookService('pregnant')">
              <div class="svd-sub-img" style="background:linear-gradient(135deg,#fef3c7,#fde68a);color:#d97706;">👶</div>
              <div class="svd-sub-info">
                <div class="svd-sub-title">孕妇陪诊</div>
                <div class="svd-sub-price">¥168 <small>¥198</small></div>
                <div class="svd-sub-tags">
                  <span class="svd-sub-tag">问诊陪伴</span>
                  <span class="svd-sub-tag">检查陪同</span>
                </div>
              </div>
            </div>
            <div class="svd-sub-card" onclick="Patient._bookService('children')">
              <div class="svd-sub-img" style="background:linear-gradient(135deg,#fef3c7,#fde68a);color:#d97706;">🧒</div>
              <div class="svd-sub-info">
                <div class="svd-sub-title">儿童陪诊</div>
                <div class="svd-sub-price">¥168 <small>¥198</small></div>
                <div class="svd-sub-tags">
                  <span class="svd-sub-tag">问诊陪伴</span>
                  <span class="svd-sub-tag">心理建设</span>
                </div>
              </div>
            </div>
            <div class="svd-sub-card" onclick="Patient._bookService('whitecollar')">
              <div class="svd-sub-img" style="background:linear-gradient(135deg,#fef3c7,#fde68a);color:#d97706;">💼</div>
              <div class="svd-sub-info">
                <div class="svd-sub-title">白领陪诊</div>
                <div class="svd-sub-price">¥168 <small>¥198</small></div>
                <div class="svd-sub-tags">
                  <span class="svd-sub-tag">快速就诊</span>
                  <span class="svd-sub-tag">效率陪诊</span>
                </div>
              </div>
            </div>
            <div class="svd-sub-card" onclick="Patient._bookService('nurse')">
              <div class="svd-sub-img" style="background:linear-gradient(135deg,#fef3c7,#fde68a);color:#d97706;">👩‍⚕️</div>
              <div class="svd-sub-info">
                <div class="svd-sub-title">护士陪诊</div>
                <div class="svd-sub-price">¥368 <small>¥398</small></div>
                <div class="svd-sub-tags">
                  <span class="svd-sub-tag">专业护理</span>
                  <span class="svd-sub-tag">健康指导</span>
                </div>
              </div>
            </div>
            <div class="svd-sub-card" onclick="Patient._bookService('specialty')">
              <div class="svd-sub-img" style="background:linear-gradient(135deg,#fef3c7,#fde68a);color:#d97706;">🏥</div>
              <div class="svd-sub-info">
                <div class="svd-sub-title">专病陪诊</div>
                <div class="svd-sub-price">¥578 <small>¥598</small></div>
                <div class="svd-sub-tags">
                  <span class="svd-sub-tag">专病专治</span>
                  <span class="svd-sub-tag">专家陪同</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _contactService(name) {
    if (!App.requireLogin(name)) return;
    App.toast('正在为您对接' + name + '顾问');
  },

  _bookService(type) {
    if (!App.requireLogin('预约服务')) return;
    const names = {
      consult: '诊前咨询', agent: '代办服务', special: '特需服务', featured: '特色陪诊',
      agent_run: '代办跑腿', agent_consult: '代办问诊', agent_report: '代约检查', agent_assist: '辅助就医',
      pregnant: '孕妇陪诊', children: '儿童陪诊', whitecollar: '白领陪诊', nurse: '护士陪诊', specialty: '专病陪诊',
    };
    App.toast('已选择' + (names[type] || '服务') + '，正在跳转预约…');
    setTimeout(() => App.switchTab(1), 500);
  },

  // ===== 医院列表页 =====
  goHospitalList() {
    this._searchKeyword = '';
    this._searchFilter = { category: '', city: '', sort: '' };
    this._renderHospitalListPage();
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
          <div class="hd-hero-back" onclick="history.length > 1 ? history.back() : Patient._backFromDetail()">${P_ICON.chevronLeft}</div>
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
        <div class="esc-card" onclick="Patient._contactEscort('${e.id}')">
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

  _contactEscort(id) {
    if (!App.requireLogin('联系陪诊师')) return;
    const e = (MockData.escorts || []).find(x => x.id === id);
    if (e) App.toast('正在为您对接陪诊师 ' + e.name);
  },

  // ===== 订单页 =====
  renderOrders(el) {
    const tabs = ['全部', '待付款', '待接单', '待服务', '进行中', '已完成'];
    const statusMap = { '全部': null, '待付款': '待处理', '待接单': '已分配', '待服务': '已对接', '进行中': '服务中', '已完成': '已完成' };
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
    const statusClass = n.status === '待处理' ? 'pending' : n.status === '已分配' || n.status === '已对接' ? 'accepted' : n.status === '服务中' ? 'serving' : 'done';
    return `
      <div class="order-card" onclick="Patient._openOrderDetail('${n.id}')">
        <div class="order-head">
          <span class="order-status ${statusClass}">${n.status}</span>
          <span style="font-size:11px; color:var(--text-muted);">${n.id}</span>
        </div>
        <div class="order-title">${n.hospital} · ${n.dept}</div>
        <div class="order-sub">${n.date} · ${n.serviceType} · ¥${n.amount}</div>
        ${n.escortName ? `
          <div style="margin-top:8px; padding:8px 10px; background:var(--accent-bg); border-radius:6px; font-size:12px;">
            陪诊师：<strong style="color:var(--accent);">${n.escortName}</strong>
          </div>
        ` : ''}
      </div>
    `;
  },

  _openOrderDetail(id) {
    const n = NeedPool.getById(id);
    if (!n) return;
    if (!App.requireLogin('查看订单详情')) return;
    if (typeof Patient.openNeedDetail === 'function') {
      Patient.openNeedDetail(id);
    } else {
      App.toast('订单详情功能正在开发中');
    }
  },

  // ===== 我的页 =====
  renderProfile(el) {
    const isGuest = App.isGuest;
    const u = MockData.patient.user;
    const myNeeds = NeedPool.list.filter(n => n.patientName === u.name);
    const doneCount = myNeeds.filter(n => n.status === '已完成').length;
    const activeCount = myNeeds.filter(n => ['待处理','已分配','已对接','服务中'].includes(n.status)).length;

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
    App.toast('功能演示中');
  },

  // ===== 通用方法 =====
  toast(msg) { App.toast(msg); },
};

window.Patient = Patient;
