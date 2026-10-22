/* Noctis Architect — developer console */
(function () {
  'use strict';

  var D = document, H = D.documentElement, B = D.body;
  var btn = D.getElementById('csbtn');
  if (!btn) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(pointer: fine)');
  var VV = window.visualViewport;
  var loadedAt = Date.now();

  var PROJECTS = [
    { id: 1, slug: 'wp-hub', name: 'WP-Hub', kind: 'client', tags: ['WordPress', 'Security', 'Lighthouse'], links: [{ type: 'visit', url: 'https://wphub.org' }] },
    { id: 2, slug: 'ashrafi-mobl', name: 'Ashrafi Mobl', kind: 'client', tags: ['WooCommerce', 'PHP', 'Memcached', 'Flutter'], links: [{ type: 'visit', url: 'https://moblashrafi.com' }] },
    { id: 3, slug: 'blush-blossom', name: 'Blush Blossom', kind: 'client', tags: ['Elementor', 'WordPress'], links: [{ type: 'visit', url: 'https://blushblossom.co.uk' }] },
    { id: 4, slug: 'price-updater', name: 'Dollar Price Updater PRO', kind: 'oss', tags: ['PHP', 'WooCommerce', 'Telegram'], links: [{ type: 'source', url: 'https://github.com/Noctis-Architect/wp-price-updater' }] },
    { id: 5, slug: 'group-doctor', name: 'Group Doctor', kind: 'oss', tags: ['Python', 'LLM', 'Telegram'], links: [{ type: 'source', url: 'https://github.com/Noctis-Architect/gdoc' }, { type: 'visit', url: 'https://t.me/g_docbot' }] },
    { id: 6, slug: 'mindgrid', name: 'MindGrid', kind: 'oss', tags: ['Flutter', 'Dart'], links: [{ type: 'source', url: 'https://github.com/Noctis-Architect/mindgrid' }] },
    { id: 7, slug: 'webapp-maker', name: 'webapp-maker', kind: 'oss', tags: ['HTML', 'Android'], links: [{ type: 'source', url: 'https://github.com/Noctis-Architect/webapp-maker' }] },
    { id: 8, slug: 'wp-guard', name: 'WP Guard', kind: 'oss', tags: ['WordPress', 'Pentest'], links: [{ type: 'source', url: 'https://github.com/Noctis-Architect/wp-guard' }] },
    { id: 9, slug: 'woodesk', name: 'WooDesk', kind: 'oss', tags: ['Python', 'PySide6', 'WooCommerce', 'AI'], links: [{ type: 'source', url: 'https://github.com/Noctis-Architect/woodesk' }] },
    { id: 10, slug: 'price-api', name: 'Price API', kind: 'oss', tags: ['Python', 'FastAPI', 'Caching'], links: [{ type: 'source', url: 'https://github.com/Noctis-Architect/price-api' }] },
    { id: 11, slug: 'press-agent', name: 'PressAgent', kind: 'oss', tags: ['PHP', 'TypeScript', 'MCP'], links: [{ type: 'source', url: 'https://github.com/Noctis-Architect/press-agent' }] },
    { id: 12, slug: 'puppy', name: 'Message Guard', kind: 'oss', tags: ['Python', 'Telethon'], links: [{ type: 'source', url: 'https://github.com/Noctis-Architect/puppy' }] }
  ];

  var COMMANDS = ['help', 'whoami', 'about', 'skills', 'projects', 'project', 'open', 'contact', 'cd', 'pwd', 'ls', 'cat', 'tree', 'env', 'which', 'theme', 'lang', 'date', 'uptime', 'ping', 'echo', 'history', 'clear', 'exit', 'neofetch', 'banner', 'matrix', 'sudo', 'coffee', 'rm'];
  var ALIASES = {
    '?': 'help', h: 'help', cmds: 'help', commands: 'help',
    me: 'whoami', bio: 'about', stack: 'skills', work: 'projects', dir: 'ls',
    cls: 'clear', quit: 'exit', q: 'exit', close: 'exit',
    tg: 'contact', social: 'contact', links: 'contact',
    info: 'neofetch', sysinfo: 'neofetch', fetch: 'neofetch'
  };
  var SPECIAL = ['ll', 'la', '..', '...'];

  var ART = [
    ' _   _  ___   ___ _____ ___ ___ ',
    '| \\ | |/ _ \\ / __|_   _|_ _/ __|',
    '|  \\| | (_) | (__  | |  | |\\__ \\',
    '|_|\\__|\\___/ \\___| |_| |___|___/'
  ].join('\n');

  var TXT = {
    en: {
      close: 'Close console', guest: 'guest', inputLabel: 'Console command',
      tagline: 'guest session · read-only',
      resume: 'Session resumed.',
      helpTitle: 'Available commands',
      shellGroup: 'Shell', portfolioGroup: 'Portfolio', systemGroup: 'System',
      dCd: 'change directory: `cd [dir]`', dPwd: 'print working directory',
      dLs: 'list files: `ls -la [path]`', dCat: 'read a file', dTree: 'show the directory tree',
      dEcho: 'print text', dEnv: 'environment variables', dWhich: 'locate a command',
      dWho: 'who is behind this portfolio', dAbout: 'the short story', dSkills: 'languages, platforms, tools',
      dProjects: 'the full project list', dProject: 'details for one project', dOpen: 'open a project page',
      dContact: 'ways to reach me',
      dTheme: 'dark or light: `theme dark|light`', dLang: 'switch language: `lang en|fa`',
      dDate: 'local time', dUptime: 'session and page info', dHistory: 'what you typed before',
      dClear: 'wipe the screen', dExit: 'close this console',
      whoRole: 'read-only guest session',
      name: 'name', role: 'role', base: 'base', focus: 'focus', status: 'status',
      baseValue: 'Debian · self-taught',
      focusValue: 'WordPress / WooCommerce · Telegram bots · Flutter · security',
      statusValue: 'open to select projects',
      aboutTitle: 'About', skillsTitle: 'Skills', contactTitle: 'Contact', projectsTitle: 'Projects',
      clientWork: 'Client work', oss: 'Open source',
      stackLabel: 'stack', pageLabel: 'page', visit: 'visit', source: 'source',
      notFound: 'command not found: `%s`.', didYouMean: 'Did you mean `%s`?',
      projectNotFound: 'No project matches `%s`. Run `projects` to see the list.',
      openUsage: 'usage: `open <id>`', projectUsage: 'usage: `project <id>`',
      openAlready: 'You are already on this project.', opening: 'Opening `%s`…',
      themeNow: 'theme → %s', themeAlready: 'theme is already %s.', themeUsage: 'usage: `theme dark | light | toggle`',
      langNow: 'language → %s', langAlready: 'language is already %s.', langUsage: 'usage: `lang en | fa`',
      dateLabel: 'Local time:', sessionLabel: 'session',
      cdNoPrev: 'cd: no previous directory',
      cdNoDir: 'cd: no such file or directory: %s',
      cdNotDir: 'cd: not a directory: %s',
      lsBadOpt: "ls: invalid option -- '%s'",
      lsNoFile: "ls: cannot access '%s': No such file or directory",
      treeNoFile: 'tree: %s: No such file or directory',
      catUsage: 'usage: `cat <path>`',
      catNoFile: 'cat: %s: No such file or directory.',
      catIsDir: 'cat: %s: Is a directory.',
      catDenied: 'cat: %s: Permission denied.',
      secret: 'cat: secret.txt: Permission denied. Nice try.',
      whichUsage: 'usage: `which <cmd>`', historyEmpty: 'No history yet.',
      sudoPass: '[sudo] password for guest:', sudo: 'guest is not in the sudoers file. This incident has been reported.',
      coffee: "HTTP 418 — I'm a teapot. Coffee is a human right, not a shell builtin.",
      rm: 'rm: read-only filesystem. Nice try.',
      matrix: 'matrix mode · it fades on its own.', matrixReduced: 'Matrix rain is off because your system asks for reduced motion.',
      exitLine: 'Session closed. See you around.'
    },
    fa: {
      close: 'بستن کنسول', guest: 'مهمان', inputLabel: 'دستور کنسول',
      tagline: 'نشست مهمان · فقط‌خواندنی',
      resume: 'نشست ادامه پیدا کرد.',
      helpTitle: 'دستورهای موجود',
      shellGroup: 'پوسته', portfolioGroup: 'نمونه‌کار', systemGroup: 'سیستم',
      dCd: 'تغییر پوشه: `cd [dir]`', dPwd: 'نمایش پوشه‌ی جاری',
      dLs: 'فهرست فایل‌ها: `ls -la [path]`', dCat: 'خواندن یک فایل', dTree: 'نمایش درخت پوشه‌ها',
      dEcho: 'چاپ متن', dEnv: 'متغیرهای محیطی', dWhich: 'پیدا کردن یک دستور',
      dWho: 'پشت این نمونه‌کار کیست', dAbout: 'خلاصه‌ی مسیر کاری', dSkills: 'زبان‌ها، پلتفرم‌ها و ابزارها',
      dProjects: 'فهرست کامل پروژه‌ها', dProject: 'جزئیات یک پروژه', dOpen: 'باز کردن صفحه‌ی یک پروژه',
      dContact: 'راه‌های تماس',
      dTheme: 'تیره یا روشن: `theme dark|light`', dLang: 'تغییر زبان: `lang en|fa`',
      dDate: 'زمان محلی', dUptime: 'اطلاعات نشست و صفحه', dHistory: 'چیزهایی که قبلاً نوشتی',
      dClear: 'پاک کردن صفحه', dExit: 'بستن این کنسول',
      whoRole: 'نشست مهمان با دسترسی فقط‌خواندنی',
      name: 'نام', role: 'نقش', base: 'پایه', focus: 'تمرکز', status: 'وضعیت',
      baseValue: 'دبیان · خودآموخته',
      focusValue: 'وردپرس / ووکامرس · ربات تلگرام · فلاتر · امنیت',
      statusValue: 'آماده‌ی پروژه‌های منتخب',
      aboutTitle: 'درباره', skillsTitle: 'مهارت‌ها', contactTitle: 'تماس', projectsTitle: 'پروژه‌ها',
      clientWork: 'کار سفارشی', oss: 'متن‌باز',
      stackLabel: 'پشته', pageLabel: 'صفحه', visit: 'دیدن', source: 'سورس',
      notFound: 'دستور پیدا نشد: `%s`.', didYouMean: 'منظورت `%s` بود؟',
      projectNotFound: 'پروژه‌ای با `%s` پیدا نشد. `projects` را بزن.',
      openUsage: 'استفاده: `open <شماره>`', projectUsage: 'استفاده: `project <شماره>`',
      openAlready: 'همین حالا روی صفحه‌ی این پروژه هستی.', opening: 'باز کردن `%s`…',
      themeNow: 'پوسته → %s', themeAlready: 'پوسته از قبل %s است.', themeUsage: 'استفاده: `theme dark | light | toggle`',
      langNow: 'زبان → %s', langAlready: 'زبان از قبل %s است.', langUsage: 'استفاده: `lang en | fa`',
      dateLabel: 'زمان محلی:', sessionLabel: 'نشست',
      cdNoPrev: 'cd: پوشه‌ی قبلی وجود ندارد',
      cdNoDir: 'cd: چنین مسیری وجود ندارد: %s',
      cdNotDir: 'cd: پوشه نیست: %s',
      lsBadOpt: "ls: گزینه‌ی نامعتبر: '%s'",
      lsNoFile: "ls: دسترسی به '%s' ممکن نیست: چنین فایلی وجود ندارد",
      treeNoFile: 'tree: %s: چنین مسیری وجود ندارد',
      catUsage: 'استفاده: `cat <path>`',
      catNoFile: 'cat: %s: چنین فایلی وجود ندارد.',
      catIsDir: 'cat: %s: یک پوشه است.',
      catDenied: 'cat: %s: دسترسی رد شد.',
      secret: 'cat: secret.txt: دسترسی رد شد. تلاش خوبی بود.',
      whichUsage: 'استفاده: `which <cmd>`', historyEmpty: 'تاریخچه هنوز خالی است.',
      sudoPass: '[sudo] رمز عبور برای guest:', sudo: 'guest در فایل sudoers نیست. این مورد گزارش شد.',
      coffee: 'HTTP 418 — من قوری‌ام. قهوه حق انسانی است، نه یک دستور شل.',
      rm: 'rm: فایل‌سیستم فقط‌خواندنی است. تلاش خوبی بود.',
      matrix: 'حالت ماتریکس · خودش محو می‌شود.', matrixReduced: 'افکت ماتریکس به احترام تنظیم حرکت سیستم خاموش است.',
      exitLine: 'نشست بسته شد. تا بعد.'
    }
  };

  function lang() { return H.lang === 'fa' ? 'fa' : 'en'; }
  function T() { return TXT[lang()]; }
  function site(key) {
    var dict = (window.NX_I18N || {})[lang()] || {};
    var v = dict[key];
    return v === undefined ? '' : v;
  }

  var built = false, openNow = false, booted = false, openedAt = 0;
  var overlay, win, screen, out, form, input, ghost, closeBtn, stateLbl, promptPathEl, titlePathEl;
  var history = [], histPos = 0, bootIndex = 0;
  var rainEl = null, rainRaf = 0;
  var comp = null, ghostValue = '';

  var HOME = '/home/guest';
  var cwd = HOME, prevCwd = null;
  var FS = {};
  var ENV = { USER: 'guest', HOME: HOME, SHELL: '/bin/zsh', PWD: HOME, TERM: 'xterm-256color', PATH: '/usr/local/bin:/usr/bin:/bin', EDITOR: 'vim' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function md(s) {
    return esc(s).replace(/`([^`]+)`/g, '<span class="cs-acc">$1</span>');
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function uniq(a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }); }

  function addDir(p) { FS[p] = { type: 'dir', mode: 'drwxr-xr-x', owner: 'guest', date: 'Oct 20 18:05' }; }
  function addFile(p, content, opts) {
    FS[p] = Object.assign({ type: 'file', mode: '-rw-r--r--', owner: 'guest', date: 'Oct 20 18:05', readable: true, content: content }, opts || {});
  }
  function fileContent(node) { return typeof node.content === 'function' ? node.content() : String(node.content || ''); }
  function parentDir(p) { if (p === '/') return '/'; var i = p.lastIndexOf('/'); return i <= 0 ? '/' : p.slice(0, i); }
  function baseName(p) { return p === '/' ? '/' : p.slice(p.lastIndexOf('/') + 1); }
  function normalizeAbs(p) {
    var parts = [];
    String(p).split('/').forEach(function (seg) {
      if (!seg || seg === '.') return;
      if (seg === '..') { parts.pop(); return; }
      parts.push(seg);
    });
    return '/' + parts.join('/');
  }
  function expandVars(s) {
    return String(s).replace(/\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g, function (m, k) {
      return ENV[k] === undefined ? '' : ENV[k];
    });
  }
  function resolvePath(raw) {
    raw = expandVars(String(raw == null ? '' : raw));
    if (!raw) raw = '~';
    if (raw === '~') raw = HOME;
    else if (raw.slice(0, 2) === '~/') raw = HOME + raw.slice(1);
    else if (raw.charAt(0) !== '/') raw = cwd + '/' + raw;
    return normalizeAbs(raw);
  }
  function displayPath(abs) {
    if (abs === HOME) return '~';
    if (abs.indexOf(HOME + '/') === 0) return '~' + abs.slice(HOME.length);
    return abs;
  }
  function dirEntries(abs) {
    var list = [];
    Object.keys(FS).forEach(function (p) {
      if (p !== '/' && parentDir(p) === abs) list.push({ name: baseName(p), path: p, node: FS[p] });
    });
    list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return list;
  }
  function sizeOf(node) {
    if (node.type === 'dir') return 4096;
    if (node.readable === false) return 0;
    return fileContent(node).length;
  }
  function humanSize(n) { return n < 1024 ? n + 'B' : (n / 1024).toFixed(1) + 'K'; }
  function splitArgs(s) {
    var out = [], cur = '', quote = null;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (quote) { if (ch === quote) quote = null; else cur += ch; }
      else if (ch === '"' || ch === "'") quote = ch;
      else if (/\s/.test(ch)) { if (cur) { out.push(cur); cur = ''; } }
      else cur += ch;
    }
    if (cur) out.push(cur);
    return out;
  }
  function stripQuotes(s) {
    if (s.length > 1 && ((s.charAt(0) === '"' && s.slice(-1) === '"') || (s.charAt(0) === "'" && s.slice(-1) === "'"))) return s.slice(1, -1);
    return s;
  }
  function allCommandNames() { return uniq(COMMANDS.concat(Object.keys(ALIASES), SPECIAL)).sort(); }
  function baseCommand(name) {
    if (name === 'll' || name === 'la') return 'ls';
    if (name === '..' || name === '...') return 'cd';
    return ALIASES[name] || name;
  }
  function historyExpand(v) {
    if (v === '!!') return history.length ? history[history.length - 1] : v;
    var m = v.match(/^!(\d+)$/);
    if (m) {
      var i = Number(m[1]) - 1;
      if (history[i] !== undefined) return history[i];
    }
    return v;
  }

  function aboutFileContent() {
    var l = T();
    return [
      'Noctis Architect', '================', site('k'), '', l.baseValue, l.focusValue, '',
      site('a1'), '', site('a2'), '',
      'Telegram: https://t.me/Noctis_Architect',
      'GitHub: https://github.com/Noctis-Architect',
      'Website: https://nocarch.com'
    ].join('\n');
  }
  function skillsFileContent() {
    return JSON.stringify({
      languages: ['Python', 'PHP', 'Dart'],
      platforms: ['FastAPI', 'WordPress', 'WooCommerce', 'Flutter', 'Telegram Bot API'],
      tools: ['Kali Linux', 'Burp Suite', 'Docker', 'MySQL', 'Git'],
      currently: 'LLM agents · WordPress security tooling'
    }, null, 2);
  }
  function contactFileContent() {
    return [
      'Telegram: https://t.me/Noctis_Architect',
      'GitHub: https://github.com/Noctis-Architect',
      'Instagram: https://instagram.com/techarch_offical',
      'Website: https://nocarch.com', '', site('cs')
    ].join('\n');
  }
  function projectFileContent(p) {
    var rows = ['# ' + p.name, '', 'kind: ' + kindLabel(p), 'stack: ' + p.tags.join(' · ')];
    p.links.forEach(function (link) { rows.push(link.type + ': ' + link.url); });
    rows.push('page: ' + pageHref(p), '', site('pd' + (p.id - 1)));
    return rows.join('\n');
  }
  function projectsReadmeContent() {
    var rows = ['# Projects', '', 'id  name  stack'];
    PROJECTS.forEach(function (p) { rows.push(pad(p.id) + '  ' + p.name + '  ' + p.tags.join(' · ')); });
    return rows.join('\n');
  }
  function zshrcContent() {
    return [
      '# ~/.zshrc',
      'autoload -Uz compinit && compinit',
      'setopt AUTO_CD AUTO_PUSHD HIST_VERIFY',
      'bindkey "^[[A" history-search-backward',
      'bindkey "^[[B" history-search-forward',
      'alias ll="ls -la"',
      'alias la="ls -a"',
      'alias ..="cd .."',
      'export EDITOR=vim'
    ].join('\n');
  }
  function buildFS() {
    ['/', '/home', HOME, HOME + '/projects', '/etc'].forEach(addDir);
    addFile(HOME + '/about.txt', aboutFileContent);
    addFile(HOME + '/skills.json', skillsFileContent);
    addFile(HOME + '/contact.txt', contactFileContent);
    addFile(HOME + '/.zshrc', zshrcContent);
    addFile(HOME + '/secret.txt', '', { mode: '-rw-------', owner: 'root', readable: false, secret: true });
    addFile(HOME + '/projects/README.md', projectsReadmeContent);
    PROJECTS.forEach(function (p) {
      addDir(HOME + '/projects/' + p.slug);
      addFile(HOME + '/projects/' + p.slug + '/README.md', function () { return projectFileContent(p); });
    });
    addFile('/etc/hostname', function () { return 'nocarch'; });
    addFile('/etc/os-release', function () {
      return 'NAME="NOCARCH OS"\nVERSION="2.6"\nID=nocarch\nPRETTY_NAME="NOCARCH OS 2.6"\nHOME_URL="https://nocarch.com"';
    });
  }

  function line(html, cls, dir) {
    var el = D.createElement('div');
    el.className = 'cs-line' + (cls ? ' ' + cls : '');
    if (dir) el.setAttribute('dir', dir);
    el.innerHTML = html;
    out.appendChild(el);
    return el;
  }
  function pre(text, cls) {
    var el = D.createElement('div');
    el.className = 'cs-line cs-pre' + (cls ? ' ' + cls : '');
    el.setAttribute('dir', 'ltr');
    el.textContent = text;
    out.appendChild(el);
    return el;
  }
  function block(cls, html) {
    var el = D.createElement('div');
    if (cls) el.className = cls;
    el.innerHTML = html;
    out.appendChild(el);
    return el;
  }
  function kv(rows) {
    return '<div class="cs-kv">' + rows.map(function (r) {
      return '<b>' + esc(r[0]) + '</b><span>' + r[1] + '</span>';
    }).join('') + '</div>';
  }
  function scrollDown() { screen.scrollTop = screen.scrollHeight; }
  function clearOut() { stopRain(); resetComp(); out.innerHTML = ''; }

  function bootLine(html, cls, dir) {
    var el = line(html, cls, dir);
    el.classList.add('cs-boot');
    el.style.setProperty('--i', bootIndex++);
    return el;
  }
  function bootPre(text, cls) {
    var el = pre(text, cls);
    el.classList.add('cs-boot');
    el.style.setProperty('--i', bootIndex++);
    return el;
  }

  function boot() {
    var l = T();
    if (booted) {
      line(md(l.resume), 'cs-dim', 'auto');
      scrollDown();
      return;
    }
    booted = true;
    bootPre(ART, 'cs-acc');
    bootLine('<span class="cs-dim">NOCARCH CONSOLE</span> <span class="cs-acc">v2.6</span>', '', 'ltr');
    bootLine('<span class="cs-dim">' + esc(l.tagline) + '</span>', '', 'auto');
    bootLine('<span class="cs-dim">────────────────────────────────</span>', '', 'ltr');
    bootLine('&nbsp;');
    scrollDown();
  }

  function pageHref(p) {
    var inProjects = /\/projects\/[^/]*$/.test(location.pathname);
    return (inProjects ? '' : 'projects/') + p.slug + '.html';
  }
  function kindLabel(p) { return p.kind === 'client' ? T().clientWork : T().oss; }

  function findProject(q) {
    if (!q) return null;
    q = q.toLowerCase().replace(/^#/, '').replace(/^["']|["']$/g, '');
    if (/^\d+$/.test(q)) return PROJECTS[Number(q) - 1] || null;
    for (var i = 0; i < PROJECTS.length; i++) {
      var p = PROJECTS[i];
      if (p.slug === q || p.name.toLowerCase() === q) return p;
    }
    for (var j = 0; j < PROJECTS.length; j++) {
      if (PROJECTS[j].slug.indexOf(q) !== -1 || PROJECTS[j].name.toLowerCase().indexOf(q) !== -1) return PROJECTS[j];
    }
    return null;
  }

  function projectRow(p) {
    return '<div class="cs-proj"><span class="n">' + pad(p.id) + '</span><span class="nm">' + esc(p.name) + '</span><span class="mt">' + esc(p.tags.join(' · ')) + '</span></div>';
  }
  function extLink(url, label) {
    return '<a class="cs-a" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label || url) + '</a>';
  }

  function promptHTML() {
    return '<span class="p"><span class="cs-user">guest@nocarch</span><span class="cs-path">:' + esc(displayPath(cwd)) + '</span><span class="cs-dollar">$</span></span>';
  }
  function updatePrompt() {
    ENV.PWD = cwd;
    if (!built) return;
    var p = ':' + displayPath(cwd);
    if (promptPathEl) promptPathEl.textContent = p;
    if (titlePathEl) titlePathEl.textContent = p;
  }

  function printText(text, mode) {
    if (mode === 'json') { pre(text); return; }
    text.split('\n').forEach(function (l) {
      if (!l) { line('&nbsp;'); return; }
      if (mode === 'md' && /^#\s+/.test(l)) { line('<span class="cs-b">' + esc(l.replace(/^#\s+/, '')) + '</span>', '', 'ltr'); return; }
      var m = mode === 'md' && l.match(/^([a-z][a-z0-9_-]*):\s(.*)$/i);
      if (m) { line('<span class="cs-dim">' + esc(m[1]) + ':</span> ' + esc(m[2]), '', 'auto'); return; }
      line(esc(l), '', 'auto');
    });
  }

  function nameClass(e) {
    if (e.node.type === 'dir') return 'cs-dir';
    if (e.node.readable === false) return 'cs-err';
    if (e.name.charAt(0) === '.') return 'cs-dim';
    return '';
  }
  function printLs(items, long) {
    if (!items.length) return;
    if (long) {
      items.forEach(function (e) {
        var meta = e.node.mode + '  ' + (e.node.owner || 'guest').padEnd(7) + '  ' + humanSize(sizeOf(e.node)).padStart(6) + '  ' + e.node.date + '  ';
        line('<span class="cs-dim">' + esc(meta) + '</span><span class="' + nameClass(e) + '">' + esc(e.name) + '</span>', 'cs-pre', 'ltr');
      });
    } else {
      block('cs-list', items.map(function (e) {
        return '<span class="' + nameClass(e) + '">' + esc(e.name) + '</span>';
      }).join(''));
      scrollDown();
    }
  }

  function helpRows(rows) {
    block('cs-help', rows.map(function (r) {
      return '<div class="cs-hrow"><b>' + r[0] + '</b><span dir="auto">' + md(r[1]) + '</span></div>';
    }).join(''));
  }
  function cmdHelp() {
    var l = T();
    line('<span class="cs-grp">' + esc(l.helpTitle) + '</span>', '', 'auto');
    line('<span class="cs-grp">' + esc(l.shellGroup) + '</span>', '', 'auto');
    helpRows([
      ['cd [dir]', l.dCd], ['pwd', l.dPwd], ['ls [-la] [path]', l.dLs],
      ['cat &lt;file&gt;', l.dCat], ['tree [dir]', l.dTree], ['echo &lt;text&gt;', l.dEcho],
      ['history', l.dHistory], ['clear', l.dClear], ['exit', l.dExit]
    ]);
    line('<span class="cs-grp">' + esc(l.portfolioGroup) + '</span>', '', 'auto');
    helpRows([
      ['whoami', l.dWho], ['about', l.dAbout], ['skills', l.dSkills],
      ['projects', l.dProjects], ['project &lt;id&gt;', l.dProject], ['open &lt;id&gt;', l.dOpen],
      ['contact', l.dContact]
    ]);
    line('<span class="cs-grp">' + esc(l.systemGroup) + '</span>', '', 'auto');
    helpRows([
      ['date', l.dDate], ['uptime', l.dUptime], ['env', l.dEnv], ['which &lt;cmd&gt;', l.dWhich],
      ['theme [dark|light]', l.dTheme], ['lang [en|fa]', l.dLang]
    ]);
  }

  function cmdWhoami() {
    var l = T();
    line('<span class="cs-acc">guest</span><span class="cs-dim">@nocarch</span> <span class="cs-dim">— ' + esc(l.whoRole) + '</span>', '', 'auto');
    line('<span class="cs-dim">──────────────────────────────</span>', '', 'ltr');
    block('', kv([
      [l.name, '<span class="cs-b">Noctis Architect</span>'],
      [l.role, esc(site('k')) || 'Full-stack developer'],
      [l.base, esc(l.baseValue)],
      [l.focus, esc(l.focusValue)],
      [l.status, '<span class="cs-acc">' + esc(l.statusValue) + '</span>']
    ]));
  }

  function cmdAbout() {
    line('<span class="cs-b">' + esc(T().aboutTitle) + '</span>', '', 'auto');
    line(esc(site('a1')), '', 'auto');
    line(esc(site('a2')), 'cs-dim', 'auto');
  }

  function cmdSkills() {
    line('<span class="cs-b">' + esc(T().skillsTitle) + '</span>', '', 'auto');
    block('', kv([
      [site('g1'), esc(site('g1t'))],
      [site('g2'), esc(site('g2t'))],
      [site('g3'), esc(site('g3t'))],
      [site('g4'), esc(site('g4t'))]
    ]));
  }

  function cmdProjects() {
    var l = T();
    line('<span class="cs-grp">' + esc(l.projectsTitle) + ' · ' + PROJECTS.length + '</span>', '', 'auto');
    line('<span class="cs-grp">' + esc(l.clientWork) + '</span>', '', 'auto');
    PROJECTS.filter(function (p) { return p.kind === 'client'; }).forEach(function (p) { block('', projectRow(p)); });
    line('<span class="cs-grp">' + esc(l.oss) + '</span>', '', 'auto');
    PROJECTS.filter(function (p) { return p.kind === 'oss'; }).forEach(function (p) { block('', projectRow(p)); });
  }

  function cmdProject(arg) {
    var l = T();
    if (!arg) { line(md(l.projectUsage), 'cs-dim', 'auto'); return; }
    var p = findProject(arg);
    if (!p) { line(md(l.projectNotFound.replace('%s', arg)), 'cs-err', 'auto'); return; }
    line('<span class="cs-b">' + esc(p.name) + '</span> <span class="cs-dim">#' + pad(p.id) + ' · ' + esc(kindLabel(p)) + '</span>', '', 'ltr');
    line(esc(site('pd' + (p.id - 1))), '', 'auto');
    var rows = [[l.stackLabel, esc(p.tags.join(' · '))]];
    p.links.forEach(function (link) { rows.push([l[link.type] || link.type, extLink(link.url)]); });
    var href = pageHref(p);
    rows.push([l.pageLabel, '<a class="cs-a" href="' + esc(href) + '" data-cs-local>' + esc(href) + '</a>']);
    block('', kv(rows));
  }

  function cmdOpen(arg) {
    var l = T();
    if (!arg) { line(md(l.openUsage), 'cs-dim', 'auto'); return; }
    var p = findProject(arg);
    if (!p) { line(md(l.projectNotFound.replace('%s', arg)), 'cs-err', 'auto'); return; }
    if (B.getAttribute('data-page') === 'project' && B.getAttribute('data-slug') === p.slug) {
      line(md(l.openAlready), 'cs-warn', 'auto');
      return;
    }
    line(md(l.opening.replace('%s', p.name)), '', 'auto');
    navigate(pageHref(p));
  }

  function cmdContact() {
    var l = T();
    line('<span class="cs-b">' + esc(l.contactTitle) + '</span>', '', 'auto');
    block('', kv([
      [site('tg'), extLink('https://t.me/Noctis_Architect', '@Noctis_Architect')],
      [site('gh'), extLink('https://github.com/Noctis-Architect', 'Noctis-Architect')],
      [site('ig'), extLink('https://instagram.com/techarch_offical', '@techarch_offical')],
      ['Web', extLink('https://nocarch.com', 'nocarch.com')]
    ]));
    line(esc(site('cs')), 'cs-dim', 'auto');
  }

  function cmdCd(arg) {
    var l = T(), args = splitArgs(arg), target;
    if (!args.length) target = HOME;
    else if (args[0] === '-') {
      if (!prevCwd) { line(esc(l.cdNoPrev), 'cs-err', 'auto'); return; }
      target = prevCwd;
    } else target = resolvePath(args[0]);
    var node = FS[target];
    if (!node) { line(esc(l.cdNoDir.replace('%s', args[0] || '')), 'cs-err', 'auto'); return; }
    if (node.type !== 'dir') { line(esc(l.cdNotDir.replace('%s', args[0] || '')), 'cs-err', 'auto'); return; }
    if (target !== cwd) { prevCwd = cwd; cwd = target; updatePrompt(); }
    if (args[0] === '-') line(esc(displayPath(cwd)), 'cs-dim', 'ltr');
  }

  function cmdPwd() { line(esc(cwd), 'cs-b', 'ltr'); }

  function cmdLs(arg) {
    var opts = { a: false, l: false }, paths = [], bad = '';
    splitArgs(arg).forEach(function (tok) {
      if (tok.charAt(0) === '-' && tok.length > 1) {
        tok.slice(1).split('').forEach(function (ch) {
          if (ch === 'a') opts.a = true;
          else if (ch === 'l') opts.l = true;
          else if (ch !== 'h') bad = ch;
        });
      } else paths.push(tok);
    });
    if (bad) { line(esc(T().lsBadOpt.replace('%s', bad)), 'cs-err', 'ltr'); return; }
    if (!paths.length) paths = [cwd];
    var multi = paths.length > 1;
    paths.forEach(function (raw, idx) {
      var abs = resolvePath(raw), node = FS[abs];
      if (!node) { line(esc(T().lsNoFile.replace('%s', raw)), 'cs-err', 'ltr'); return; }
      if (multi) {
        if (idx) line('&nbsp;');
        line('<span class="cs-dim">' + esc(raw) + ':</span>', '', 'ltr');
      }
      if (node.type === 'file') {
        printLs([{ name: raw, path: abs, node: node }], opts.l);
        return;
      }
      var items = dirEntries(abs);
      if (opts.a) {
        items.unshift({ name: '.', path: abs, node: FS[abs] });
        items.push({ name: '..', path: parentDir(abs), node: FS[parentDir(abs)] || FS['/'] });
      } else {
        items = items.filter(function (e) { return e.name.charAt(0) !== '.'; });
      }
      items.sort(function (a, b) { return a.name.localeCompare(b.name); });
      printLs(items, opts.l);
    });
  }

  function cmdCat(arg) {
    var l = T(), args = splitArgs(arg);
    if (!args.length) { line(md(l.catUsage), 'cs-dim', 'auto'); return; }
    args.forEach(function (raw) {
      var abs = resolvePath(raw), node = FS[abs];
      if (!node) { line(esc(l.catNoFile.replace('%s', raw)), 'cs-err', 'auto'); return; }
      if (node.type === 'dir') { line(esc(l.catIsDir.replace('%s', raw)), 'cs-err', 'auto'); return; }
      if (node.secret) { line(esc(l.secret), 'cs-warn', 'auto'); return; }
      if (node.readable === false) { line(esc(l.catDenied.replace('%s', raw)), 'cs-err', 'auto'); return; }
      printText(fileContent(node), /\.json$/i.test(abs) ? 'json' : (/\.md$/i.test(abs) ? 'md' : 'plain'));
    });
  }

  function cmdTree(arg) {
    var showHidden = false, raw = '';
    splitArgs(arg).forEach(function (tok) {
      if (tok === '-a') showHidden = true;
      else raw = tok;
    });
    var abs = raw ? resolvePath(raw) : cwd, node = FS[abs];
    if (!node) { line(esc(T().treeNoFile.replace('%s', raw)), 'cs-err', 'ltr'); return; }
    if (node.type === 'file') { line(esc(displayPath(abs)), 'cs-b', 'ltr'); return; }
    var counts = { d: 0, f: 0 };
    function walk(dir, prefix) {
      var items = dirEntries(dir).filter(function (e) { return showHidden || e.name.charAt(0) !== '.'; });
      items.forEach(function (e, i) {
        var last = i === items.length - 1;
        var branch = prefix + (last ? '└── ' : '├── ');
        line('<span class="cs-dim">' + esc(branch) + '</span><span class="' + nameClass(e) + '">' + esc(e.name + (e.node.type === 'dir' ? '/' : '')) + '</span>', 'cs-pre', 'ltr');
        if (e.node.type === 'dir') { counts.d++; walk(e.path, prefix + (last ? '    ' : '│   ')); }
        else counts.f++;
      });
    }
    line('<span class="cs-dir">' + esc(displayPath(abs)) + '</span>', '', 'ltr');
    walk(abs, '');
    line('<span class="cs-dim">' + counts.d + ' directories, ' + counts.f + ' files</span>', '', 'ltr');
  }

  function cmdEnv() {
    Object.keys(ENV).forEach(function (k) {
      line('<span class="cs-dim">' + esc(k) + '=</span>' + esc(ENV[k]), 'cs-pre', 'ltr');
    });
  }

  function cmdWhich(arg) {
    var names = splitArgs(arg);
    if (!names.length) { line(md(T().whichUsage), 'cs-dim', 'auto'); return; }
    names.forEach(function (name) {
      var n = name.toLowerCase();
      if (n === 'll') { line('ll: aliased to ls -la', 'cs-dim', 'ltr'); return; }
      if (n === 'la') { line('la: aliased to ls -a', 'cs-dim', 'ltr'); return; }
      if (n === '..') { line('..: aliased to cd ..', 'cs-dim', 'ltr'); return; }
      if (n === '...') { line('...: aliased to cd ../..', 'cs-dim', 'ltr'); return; }
      if (ALIASES[n]) { line(esc(n) + ': aliased to ' + esc(ALIASES[n]), 'cs-dim', 'ltr'); return; }
      if (RUN[n]) { line(esc(n) + ': shell builtin', 'cs-dim', 'ltr'); return; }
      line(esc(n) + ' not found', 'cs-err', 'ltr');
    });
  }

  function cmdTheme(arg) {
    var l = T(), cur = H.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var target = (arg || 'toggle').toLowerCase();
    if (target === 'toggle') target = cur === 'light' ? 'dark' : 'light';
    if (target !== 'dark' && target !== 'light') { line(md(l.themeUsage), 'cs-dim', 'auto'); return; }
    if (target === cur) { line(md(l.themeAlready.replace('%s', target)), 'cs-dim', 'auto'); return; }
    D.getElementById('th').click();
    line(md(l.themeNow.replace('%s', target)), 'cs-acc', 'auto');
  }

  function cmdLang(arg) {
    var l = T(), cur = lang();
    var target = (arg || '').toLowerCase();
    if (!target) target = cur === 'fa' ? 'en' : 'fa';
    if (target !== 'en' && target !== 'fa') { line(md(l.langUsage), 'cs-dim', 'auto'); return; }
    if (target === cur) { line(md(l.langAlready.replace('%s', target)), 'cs-dim', 'auto'); return; }
    D.getElementById('lg').click();
    line(md(l.langNow.replace('%s', target)), 'cs-acc', 'auto');
  }

  function cmdDate() {
    var d = new Date(), s;
    try {
      s = d.toLocaleString(lang() === 'fa' ? 'fa-IR' : 'en-GB', { dateStyle: 'full', timeStyle: 'medium' });
    } catch (e) { s = d.toString(); }
    line('<span class="cs-dim">' + esc(T().dateLabel) + '</span> ' + esc(s), '', 'auto');
  }

  function cmdUptime() {
    var sec = Math.max(0, Math.floor((Date.now() - (openedAt || loadedAt)) / 1000));
    var mmss = pad(Math.floor(sec / 60)) + ':' + pad(sec % 60);
    block('', kv([
      [T().sessionLabel, esc(mmss)],
      [T().pageLabel, '<span dir="ltr">' + esc(location.pathname) + '</span>']
    ]));
  }

  function cmdHistory(arg) {
    if (!history.length) { line(esc(T().historyEmpty), 'cs-dim', 'auto'); return; }
    var n = parseInt(arg, 10);
    var items = n > 0 ? history.slice(-n) : history;
    var offset = history.length - items.length + 1;
    items.forEach(function (cmd, i) {
      line('<span class="cs-dim">' + pad(offset + i) + '</span>  ' + esc(cmd), '', 'ltr');
    });
  }

  function cmdNeofetch() {
    pre(ART, 'cs-acc');
    line('<span class="cs-dim">' + esc(T().tagline) + '</span>', '', 'auto');
    block('', kv([
      ['OS', 'NOCARCH OS'],
      ['host', 'nocarch.com'],
      ['shell', 'dev-console 2.6'],
      ['theme', esc(H.getAttribute('data-theme') || 'dark')],
      ['locale', lang()],
      ['projects', String(PROJECTS.length)],
      ['screen', window.innerWidth + '×' + window.innerHeight]
    ]));
  }

  function cmdBanner() {
    pre(ART, 'cs-acc');
    line('<span class="cs-dim">' + esc(T().tagline) + '</span>', '', 'auto');
  }

  function cmdPing() { line('pong · ' + (1 + Math.random() * 8).toFixed(1) + ' ms', 'cs-acc', 'ltr'); }
  function cmdEcho(arg) {
    if (!arg) { line('&nbsp;'); return; }
    line(esc(expandVars(stripQuotes(arg))), '', 'auto');
  }
  function cmdSudo() {
    line(esc(T().sudoPass), 'cs-dim', 'ltr');
    line(esc(T().sudo), 'cs-err', 'auto');
  }
  function cmdCoffee() { line(esc(T().coffee), 'cs-warn', 'auto'); }
  function cmdRm() { line(esc(T().rm), 'cs-warn', 'auto'); }
  function cmdClear() { clearOut(); }
  function cmdExit() {
    line(md(T().exitLine), 'cs-dim', 'auto');
    setTimeout(closeConsole, 420);
  }

  function runRain() {
    if (reduce.matches) { line(esc(T().matrixReduced), 'cs-dim', 'auto'); return; }
    line(md(T().matrix), 'cs-dim', 'auto');
    stopRain();
    var cv = D.createElement('canvas');
    cv.className = 'cs-rain';
    win.appendChild(cv);
    var ctx = cv.getContext('2d');
    if (!ctx) { cv.remove(); return; }
    rainEl = cv;
    var accent = getComputedStyle(win).getPropertyValue('--cs-acc').trim() || '#c8f23a';
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var glyphs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFNOCTIS<>_/\\';
    var cols = 0, drops = [], last = 0, start = performance.now();
    function size() {
      var w = cv.clientWidth || 1, h = cv.clientHeight || 1;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / 14);
      drops = [];
      for (var i = 0; i < cols; i++) drops[i] = Math.random() * h / 14;
    }
    size();
    function frame(now) {
      if (!rainEl) return;
      if (now - last < 50) { rainRaf = requestAnimationFrame(frame); return; }
      last = now;
      var w = cv.clientWidth, h = cv.clientHeight;
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(9,10,12,.16)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = '13px ' + (getComputedStyle(win).fontFamily || 'monospace');
      ctx.fillStyle = accent;
      for (var i = 0; i < cols; i++) {
        var y = drops[i] * 14;
        ctx.globalAlpha = Math.random() > .965 ? .8 : .32;
        ctx.fillText(glyphs.charAt(Math.floor(Math.random() * glyphs.length)), i * 14, y);
        drops[i]++;
        if (y > h && Math.random() > .972) drops[i] = 0;
      }
      ctx.globalAlpha = 1;
      if (now - start < 6500) rainRaf = requestAnimationFrame(frame);
      else stopRain();
    }
    rainRaf = requestAnimationFrame(frame);
  }
  function stopRain() {
    if (rainRaf) { cancelAnimationFrame(rainRaf); rainRaf = 0; }
    if (rainEl && rainEl.parentNode) rainEl.parentNode.removeChild(rainEl);
    rainEl = null;
  }

  var RUN = {
    help: cmdHelp, whoami: cmdWhoami, about: cmdAbout, skills: cmdSkills,
    projects: cmdProjects, project: cmdProject, open: cmdOpen, contact: cmdContact,
    cd: cmdCd, pwd: cmdPwd, ls: cmdLs, cat: cmdCat, tree: cmdTree, env: cmdEnv, which: cmdWhich,
    theme: cmdTheme, lang: cmdLang, date: cmdDate, uptime: cmdUptime, ping: cmdPing,
    echo: cmdEcho, history: cmdHistory, clear: cmdClear, exit: cmdExit,
    neofetch: cmdNeofetch, banner: cmdBanner, matrix: runRain, sudo: cmdSudo, coffee: cmdCoffee, rm: cmdRm
  };

  function lev(a, b) {
    var m = a.length, n = b.length, prev = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      var cur = [i];
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }
  function suggest(word) {
    var best = null, bestD = 99, all = allCommandNames();
    all.forEach(function (c) {
      if (c === word) return;
      var d = lev(word, c);
      if (d < bestD) { bestD = d; best = c; }
    });
    return bestD <= Math.max(1, Math.floor(word.length / 3)) ? best : null;
  }

  function submit(raw) {
    var typed = String(raw || '').trim();
    var val = historyExpand(typed);
    stopRain();
    resetComp();
    line(promptHTML() + ' ' + esc(val), 'cs-cl', 'ltr');
    input.value = '';
    updateGhost();
    if (!val) { scrollDown(); return; }
    history.push(val);
    histPos = history.length;
    var sp = val.indexOf(' ');
    var name = (sp < 0 ? val : val.slice(0, sp)).toLowerCase();
    var arg = sp < 0 ? '' : val.slice(sp + 1).trim();
    if (name === 'll' || name === 'la') { arg = (name === 'll' ? '-la' : '-a') + (arg ? ' ' + arg : ''); name = 'ls'; }
    else if (name === '..' || name === '...') { arg = name === '..' ? '..' : '../..'; name = 'cd'; }
    var canon = ALIASES[name] || name;
    var fn = RUN[canon];
    if (fn) fn(arg, val);
    else {
      var maybe = FS[resolvePath(name)];
      if (maybe && maybe.type === 'dir') cmdCd(name);
      else {
        line(md(T().notFound.replace('%s', name)), 'cs-err', 'auto');
        var s = suggest(name);
        if (s) line(md(T().didYouMean.replace('%s', s)), 'cs-dim', 'auto');
      }
    }
    scrollDown();
  }

  function resetComp() {
    if (comp && comp.items) comp.items.forEach(function (el) { el.classList.remove('active'); });
    comp = null;
  }
  function lcp(cands) {
    if (!cands.length) return '';
    var p = cands[0].name;
    for (var i = 1; i < cands.length; i++) {
      var s = cands[i].name, j = 0;
      while (j < p.length && j < s.length && p.charAt(j) === s.charAt(j)) j++;
      p = p.slice(0, j);
      if (!p) break;
    }
    return p;
  }
  function flashMiss() {
    if (!built) return;
    form.classList.add('cs-miss');
    setTimeout(function () { form.classList.remove('cs-miss'); }, 220);
  }
  function printCands(cands) {
    var el = block('cs-list cs-cands', cands.map(function (c) {
      return '<span class="cs-cand' + (c.dir ? ' cs-dir' : '') + '">' + esc(c.label || c.name) + '</span>';
    }).join(''));
    scrollDown();
    return el;
  }
  function offer(cands, token, start, before, after) {
    if (!cands.length) { flashMiss(); return; }
    var prefix = lcp(cands);
    if (cands.length === 1) {
      var c = cands[0];
      var ins = c.insert + (c.dir ? '' : ' ');
      var caret = start + ins.length;
      input.value = before.slice(0, start) + ins + after;
      input.setSelectionRange(caret, caret);
      resetComp();
      updateGhost();
      return;
    }
    if (prefix.length > token.length) {
      var caret2 = start + prefix.length;
      input.value = before.slice(0, start) + prefix + after;
      input.setSelectionRange(caret2, caret2);
      resetComp();
      updateGhost();
      return;
    }
    var listEl = printCands(cands);
    comp = {
      start: start, end: start + token.length,
      before: before.slice(0, start), after: after,
      matches: cands, index: -1,
      items: Array.prototype.slice.call(listEl.children)
    };
    updateGhost();
  }
  function cycleComp() {
    if (!comp || !comp.matches.length) return;
    comp.index = (comp.index + 1) % comp.matches.length;
    var c = comp.matches[comp.index];
    input.value = comp.before + c.insert + comp.after;
    comp.end = comp.before.length + c.insert.length;
    input.setSelectionRange(comp.end, comp.end);
    comp.items.forEach(function (el, i) { el.classList.toggle('active', i === comp.index); });
    scrollDown();
    updateGhost();
  }
  function commandCandidates(token) {
    var out = allCommandNames().map(function (n) { return { name: n, insert: n, dir: false }; });
    dirEntries(cwd).forEach(function (e) {
      if (e.node.type !== 'dir') return;
      if (token.charAt(0) !== '.' && e.name.charAt(0) === '.') return;
      out.push({ name: e.name + '/', insert: e.name + '/', dir: true });
    });
    out.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return out.filter(function (c) { return c.name.indexOf(token) === 0; });
  }
  function pathCandidates(token, dirsOnly) {
    if (token === '~') return [{ name: '~/', insert: '~/', dir: true }];
    if (token === '.' || token === '..') return [{ name: token + '/', insert: token + '/', dir: true }];
    var slash = token.lastIndexOf('/');
    var dirPart = slash >= 0 ? token.slice(0, slash + 1) : '';
    var seg = slash >= 0 ? token.slice(slash + 1) : token;
    var baseAbs = dirPart ? resolvePath(dirPart) : cwd;
    var baseNode = FS[baseAbs];
    if (!baseNode || baseNode.type !== 'dir') return [];
    var items = dirEntries(baseAbs);
    if (dirsOnly) items = items.filter(function (e) { return e.node.type === 'dir'; });
    if (seg.charAt(0) !== '.') items = items.filter(function (e) { return e.name.charAt(0) !== '.'; });
    return items.filter(function (e) { return e.name.indexOf(seg) === 0; }).map(function (e) {
      var suffix = e.node.type === 'dir' ? '/' : '';
      return { name: dirPart + e.name + suffix, label: e.name + suffix, insert: dirPart + e.name + suffix, dir: e.node.type === 'dir' };
    });
  }
  function projectCandidates(token) {
    var numeric = /^\d/.test(token);
    return PROJECTS.map(function (p) {
      return { name: numeric ? String(p.id) : p.slug, insert: numeric ? String(p.id) : p.slug, dir: false };
    }).filter(function (c) { return c.name.indexOf(token) === 0; });
  }
  function optionCandidates(list, token) {
    return list.filter(function (v) { return v.indexOf(token) === 0; }).map(function (v) { return { name: v, insert: v, dir: false }; });
  }
  function complete() {
    var value = input.value;
    var caret = input.selectionStart == null ? value.length : input.selectionStart;
    if (comp && caret === comp.end && value.slice(0, comp.start) === comp.before && value.slice(caret) === comp.after) {
      cycleComp();
      return;
    }
    resetComp();
    var before = value.slice(0, caret), after = value.slice(caret);
    var tm = before.match(/(\S*)$/);
    var token = tm ? tm[1] : '';
    var start = before.length - token.length;
    var head = before.slice(0, start);
    if (!head.trim()) {
      var cmds = token.indexOf('/') !== -1 || token.charAt(0) === '~' ? pathCandidates(token, true) : commandCandidates(token);
      offer(cmds, token, start, before, after);
      return;
    }
    var cmd = baseCommand(head.trim().split(/\s+/)[0].toLowerCase());
    if (cmd === 'cd' || cmd === 'tree') offer(pathCandidates(token, true), token, start, before, after);
    else if (cmd === 'ls' || cmd === 'cat') offer(pathCandidates(token, false), token, start, before, after);
    else if (cmd === 'open' || cmd === 'project') offer(projectCandidates(token), token, start, before, after);
    else if (cmd === 'theme') offer(optionCandidates(['dark', 'light', 'toggle'], token), token, start, before, after);
    else if (cmd === 'lang') offer(optionCandidates(['en', 'fa'], token), token, start, before, after);
    else if (cmd === 'which') offer(optionCandidates(allCommandNames(), token), token, start, before, after);
  }

  function updateGhost() {
    if (!built || !ghost) return;
    ghost.innerHTML = '';
    ghost.style.transform = '';
    ghostValue = '';
    if (comp) return;
    var v = input.value;
    if (!v || !history.length || input.selectionStart !== v.length) return;
    for (var i = history.length - 1; i >= 0; i--) {
      var h = history[i];
      if (h.length > v.length && h.slice(0, v.length) === v) {
        ghostValue = h;
        ghost.innerHTML = '<span class="cs-ghost-hidden">' + esc(v) + '</span>' + esc(h.slice(v.length));
        break;
      }
    }
  }
  function acceptGhost() {
    if (!ghostValue) return;
    input.value = ghostValue;
    input.setSelectionRange(ghostValue.length, ghostValue.length);
    ghost.innerHTML = '';
    ghostValue = '';
    resetComp();
    updateGhost();
  }

  function onInputKey(e) {
    if (e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); stopRain(); complete(); return; }
    if (e.key === 'ArrowRight' && !e.shiftKey && ghostValue && input.selectionStart === input.value.length && input.selectionStart === input.selectionEnd) {
      e.preventDefault();
      acceptGhost();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e' && ghostValue && input.selectionStart === input.value.length) {
      e.preventDefault();
      acceptGhost();
      return;
    }
    if (e.key === 'ArrowUp') {
      if (!history.length) return;
      e.preventDefault();
      if (histPos > 0) histPos--;
      input.value = history[histPos] || '';
      input.setSelectionRange(input.value.length, input.value.length);
      stopRain();
      resetComp();
      updateGhost();
      return;
    }
    if (e.key === 'ArrowDown') {
      if (!history.length) return;
      e.preventDefault();
      if (histPos < history.length - 1) histPos++;
      else histPos = history.length;
      input.value = history[histPos] || '';
      input.setSelectionRange(input.value.length, input.value.length);
      stopRain();
      resetComp();
      updateGhost();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') { e.preventDefault(); clearOut(); updateGhost(); return; }
    if (e.ctrlKey && e.key.toLowerCase() === 'c' && input.selectionStart === input.selectionEnd) {
      e.preventDefault();
      line('^C', 'cs-dim', 'ltr');
      input.value = '';
      resetComp();
      stopRain();
      updateGhost();
      scrollDown();
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
      resetComp();
      setTimeout(updateGhost, 0);
    }
  }

  function onWinKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeConsole();
      return;
    }
    if (e.key !== 'Tab' || D.activeElement === input) return;
    var f = Array.prototype.filter.call(
      win.querySelectorAll('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.getClientRects().length && !el.disabled; }
    );
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && D.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && D.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function onClick(e) {
    var close = e.target.closest('[data-cs-close]');
    if (close || e.target === overlay || e.target.classList.contains('cs-veil')) { closeConsole(); return; }
    var local = e.target.closest('a[data-cs-local]');
    if (local) {
      e.preventDefault();
      navigate(local.getAttribute('href'));
    }
  }

  function navigate(href) {
    closeConsole();
    setTimeout(function () { location.href = href; }, 180);
  }

  function syncViewport() {
    if (!VV || !overlay) return;
    overlay.style.setProperty('--cs-vh', VV.height + 'px');
    overlay.style.setProperty('--cs-vt', VV.offsetTop + 'px');
    if (openNow) setTimeout(scrollDown, 60);
  }

  function syncUI() {
    if (!built) return;
    closeBtn.setAttribute('aria-label', T().close);
    input.setAttribute('aria-label', T().inputLabel);
    stateLbl.textContent = T().guest;
  }

  function build() {
    built = true;
    overlay = D.createElement('div');
    overlay.className = 'cs';
    overlay.id = 'cs';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<div class="cs-veil"></div>' +
      '<div class="cs-win" role="dialog" aria-modal="true" aria-labelledby="cs-title">' +
        '<div class="cs-bar">' +
          '<span class="cs-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
          '<span class="cs-title" id="cs-title"><b>guest@nocarch</b><i class="cs-path">:~</i><span class="cs-dollar">$</span></span>' +
          '<span class="cs-state"><span class="cs-state-lbl">guest</span></span>' +
          '<button class="cs-x" type="button" data-cs-close aria-label="Close console">&times;</button>' +
        '</div>' +
        '<div class="cs-screen">' +
          '<div class="cs-out" role="log" aria-live="polite" aria-relevant="additions"></div>' +
          '<form class="cs-form" autocomplete="off">' +
            '<label class="p" for="cs-input"><span class="cs-user">guest@nocarch</span><span class="cs-path">:~</span><span class="cs-dollar">$</span></label>' +
            '<div class="cs-field"><input class="cs-input" id="cs-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send"><span class="cs-ghost" aria-hidden="true"></span></div>' +
          '</form>' +
        '</div>' +
        '<div class="cs-foot">' +
          '<span class="st">NOCARCH CONSOLE</span><span class="cs-ver">v2.6</span>' +
        '</div>' +
      '</div>';
    D.body.appendChild(overlay);

    win = overlay.querySelector('.cs-win');
    screen = overlay.querySelector('.cs-screen');
    out = overlay.querySelector('.cs-out');
    form = overlay.querySelector('.cs-form');
    input = overlay.querySelector('.cs-input');
    ghost = overlay.querySelector('.cs-ghost');
    closeBtn = overlay.querySelector('.cs-x');
    stateLbl = overlay.querySelector('.cs-state-lbl');
    promptPathEl = overlay.querySelector('.cs-form .cs-path');
    titlePathEl = overlay.querySelector('.cs-title .cs-path');

    overlay.addEventListener('click', onClick);
    win.addEventListener('keydown', onWinKey);
    input.addEventListener('keydown', onInputKey);
    input.addEventListener('input', function () { stopRain(); resetComp(); updateGhost(); });
    input.addEventListener('scroll', function () { if (ghost) ghost.style.transform = 'translateX(' + (-input.scrollLeft) + 'px)'; });
    input.addEventListener('focus', updateGhost);
    input.addEventListener('click', updateGhost);
    input.addEventListener('select', updateGhost);
    form.addEventListener('submit', function (e) { e.preventDefault(); submit(input.value); });
    updatePrompt();
    syncUI();
    if (window.MutationObserver) {
      new MutationObserver(syncUI).observe(H, { attributes: true, attributeFilter: ['lang', 'dir'] });
    }
    if (VV) {
      VV.addEventListener('resize', syncViewport);
      VV.addEventListener('scroll', syncViewport);
    }
  }

  function openConsole() {
    if (!built && H.classList.contains('intro-run')) return;
    if (!built) build();
    if (openNow) { if (fine.matches) input.focus({ preventScroll: true }); return; }
    openNow = true;
    openedAt = openedAt || Date.now();
    btn.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('on');
    H.classList.add('cs-open');
    syncViewport();
    syncUI();
    updatePrompt();
    updateGhost();
    boot();
    if (fine.matches) setTimeout(function () { if (openNow) input.focus({ preventScroll: true }); updateGhost(); scrollDown(); }, reduce.matches ? 0 : 120);
  }

  function closeConsole() {
    if (!openNow) return;
    openNow = false;
    stopRain();
    resetComp();
    btn.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('on');
    overlay.setAttribute('aria-hidden', 'true');
    H.classList.remove('cs-open');
    setTimeout(function () { if (!openNow) input.blur(); }, 30);
    btn.focus({ preventScroll: true });
  }

  btn.addEventListener('click', openConsole);
  window.addEventListener('popstate', function () { if (openNow) closeConsole(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted && openNow) closeConsole(); });
  D.addEventListener('keydown', function (e) {
    if (openNow) return;
    if (!e.ctrlKey || (e.key !== '`' && e.code !== 'Backquote')) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    e.preventDefault();
    openConsole();
  });

  buildFS();
  syncViewport();
})();
