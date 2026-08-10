document.addEventListener('DOMContentLoaded', () => {

    // 0. 右键跳转至 https://www.gov.cn/
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        window.location.href = 'https://www.gov.cn/';
    });

    // 1. 🌅 基于地理位置算法 / 日出日落时间的自动化黑夜模式
    let userLat = null, userLng = null;

    // 获取精细太阳角估算日出日落
    function getSunriseSunset(lat, lng, date = new Date()) {
        // 兜底默认日出日落：06:00 与 18:00
        let sunriseHour = 6, sunsetHour = 18;

        if (lat !== null && lng !== null) {
            const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
            const declination = 23.45 * Math.sin((360 / 365 * (dayOfYear - 81)) * Math.PI / 180);
            const hourAngle = Math.acos(-Math.tan(lat * Math.PI / 180) * Math.tan(declination * Math.PI / 180)) * 180 / Math.PI;
            
            sunriseHour = (12 - hourAngle / 15) + (date.getTimezoneOffset() / -60);
            sunsetHour = (12 + hourAngle / 15) + (date.getTimezoneOffset() / -60);
        }

        return { sunriseHour, sunsetHour };
    }

    function updateClockAndSunMode() {
        const timeEl = document.getElementById('clock-time');
        const dateEl = document.getElementById('clock-date');
        const sunIcon = document.getElementById('sun-mode-icon');
        const sunText = document.getElementById('sun-mode-text');

        const now = new Date();
        const currentDecimalHour = now.getHours() + now.getMinutes() / 60;

        if (timeEl) timeEl.textContent = now.toTimeString().split(' ')[0];

        if (dateEl) {
            const options = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long' };
            dateEl.textContent = now.toLocaleDateString('zh-CN', options);
        }

        const { sunriseHour, sunsetHour } = getSunriseSunset(userLat, userLng, now);
        const isDaytime = currentDecimalHour >= sunriseHour && currentDecimalHour < sunsetHour;

        if (isDaytime) {
            document.documentElement.classList.remove('dark');
            if (sunIcon) sunIcon.textContent = '☀️';
            if (sunText) sunText.textContent = '日间模式';
        } else {
            document.documentElement.classList.add('dark');
            if (sunIcon) sunIcon.textContent = '🌙';
            if (sunText) sunText.textContent = '夜间模式';
        }
    }

    // 尝试获取用户 GPS 以获得毫秒级精准日出日落
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLat = pos.coords.latitude;
                userLng = pos.coords.longitude;
                updateClockAndSunMode();
            },
            () => {
                // 默认使用时间段算法兜底
                updateClockAndSunMode();
            },
            { timeout: 3000 }
        );
    }

    setInterval(updateClockAndSunMode, 1000);
    updateClockAndSunMode();

    // Toast 浮动通知
    function showToast(msg) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-xl transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto';
        toast.textContent = msg;

        toastContainer.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        });

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 2500);
    }

    // 2. 🔑 隐藏私域板块控制逻辑 (#section-hub)
    const sectionHub = document.getElementById('section-hub');
    const sidebarHubLinks = document.querySelectorAll('.sidebar-hub-link');

    function toggleHubSection(show) {
        if (!sectionHub) return;
        
        const isHidden = sectionHub.classList.contains('hidden');
        const shouldShow = show !== undefined ? show : isHidden;

        if (shouldShow) {
            sectionHub.classList.remove('hidden');
            sidebarHubLinks.forEach(link => link.classList.remove('hidden'));
            localStorage.setItem('hub_unlocked', 'true');
            showToast('🔓 极客私域 (Section Hub) 已解锁！');
            sectionHub.scrollIntoView({ behavior: 'smooth' });
        } else {
            sectionHub.classList.add('hidden');
            sidebarHubLinks.forEach(link => link.classList.add('hidden'));
            localStorage.setItem('hub_unlocked', 'false');
            showToast('🔒 极客私域已收起');
        }
    }

    if (localStorage.getItem('hub_unlocked') === 'true') {
        toggleHubSection(true);
    }

    // 3. 🔍 搜索引擎 Switcher & KANG 暗号触发逻辑
    const searchInput = document.getElementById('search-input');
    const searchSubmitBtn = document.getElementById('search-submit-btn');
    const searchErrorMsg = document.getElementById('search-error-message');
    const engineTabs = document.querySelectorAll('.engine-tab');

    let currentEngine = localStorage.getItem('pref_search_engine') || 'google';

    const searchEngines = {
        google: q => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
        baidu: q => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}`,
        bilibili: q => `https://search.bilibili.com/all?keyword=${encodeURIComponent(q)}`,
        github: q => `https://github.com/search?q=${encodeURIComponent(q)}`,
        zhihu: q => `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(q)}`,
        deepl: q => `https://www.deepl.com/translator#zh/en/${encodeURIComponent(q)}`
    };

    function setEngine(engineKey) {
        currentEngine = engineKey;
        localStorage.setItem('pref_search_engine', engineKey);
        engineTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.engine === engineKey);
        });
    }

    setEngine(currentEngine);

    engineTabs.forEach(tab => {
        tab.addEventListener('click', () => setEngine(tab.dataset.engine));
    });

    function executeSearch() {
        const query = searchInput ? searchInput.value.trim() : '';

        // 🎯 搜索框输入暗号 KANG (不区分大小写) 打开/关闭私域，不发起搜索
        if (query.toUpperCase() === 'KANG') {
            toggleHubSection();
            searchInput.value = '';
            return;
        }

        if (!query) {
            if (searchErrorMsg) {
                searchErrorMsg.classList.remove('hidden');
                setTimeout(() => searchErrorMsg.classList.add('hidden'), 2000);
            }
            return;
        }

        const targetUrl = searchEngines[currentEngine] ? searchEngines[currentEngine](query) : searchEngines.google(query);
        window.open(targetUrl, '_blank');
    }

    if (searchSubmitBtn) searchSubmitBtn.addEventListener('click', executeSearch);
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                executeSearch();
                searchInput.blur();
            }
            if (e.key === 'Escape') searchInput.value = '';
        });
    }

    // 4. 📝 Todo 待办事项管理
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const todoList = document.getElementById('todo-list');
    const todoCount = document.getElementById('todo-count');

    let todos = JSON.parse(localStorage.getItem('my_todos') || '[]');

    function saveAndRenderTodos() {
        localStorage.setItem('my_todos', JSON.stringify(todos));
        if (!todoList) return;

        todoList.innerHTML = '';
        let completed = 0;

        todos.forEach((todo, idx) => {
            if (todo.done) completed++;

            const li = document.createElement('li');
            li.className = 'flex items-center justify-between p-2 rounded-xl bg-white/40 dark:bg-black/30 text-xs border border-black/5 dark:border-white/10';
            li.innerHTML = `
                <div class="flex items-center gap-2 truncate ${todo.done ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}">
                    <input type="checkbox" ${todo.done ? 'checked' : ''} class="rounded text-amber-500 focus:ring-0 cursor-pointer" data-idx="${idx}">
                    <span class="truncate">${todo.text}</span>
                </div>
                <button class="text-red-500 hover:text-red-400 ml-2 p-1" data-del="${idx}">✕</button>
            `;
            todoList.appendChild(li);
        });

        if (todoCount) todoCount.textContent = `${completed}/${todos.length} 完成`;
    }

    if (addTodoBtn && todoInput) {
        addTodoBtn.addEventListener('click', () => {
            const text = todoInput.value.trim();
            if (text) {
                todos.push({ text, done: false });
                todoInput.value = '';
                saveAndRenderTodos();
            }
        });

        todoInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                addTodoBtn.click();
                todoInput.blur();
            }
        });
    }

    if (todoList) {
        todoList.addEventListener('click', (e) => {
            if (e.target.dataset.idx !== undefined) {
                const idx = e.target.dataset.idx;
                todos[idx].done = !todos[idx].done;
                saveAndRenderTodos();
            }
            if (e.target.dataset.del !== undefined) {
                const idx = e.target.dataset.del;
                todos.splice(idx, 1);
                saveAndRenderTodos();
            }
        });
    }
    saveAndRenderTodos();

    // 5. 🚀 GitHub CDN 加速转换 + 字数统计
    const githubInput = document.getElementById('github-url-input');
    const resultDiv = document.getElementById('result-link');
    const cdnLinkText = document.getElementById('cdn-link-text');

    function convertGithubCdn() {
        if (!githubInput || !resultDiv || !cdnLinkText) return;
        const inputUrl = githubInput.value.trim();

        if (!inputUrl) {
            resultDiv.classList.add('hidden');
            return;
        }

        try {
            const url = new URL(inputUrl);
            let cdnUrl = '';

            if (url.hostname === 'raw.githubusercontent.com') {
                const pathParts = url.pathname.split('/');
                const user = pathParts[1];
                const repo = pathParts[2];
                const filePath = pathParts.slice(4).join('/');
                cdnUrl = `https://cdn.jsdelivr.net/gh/${user}/${repo}@main/${filePath}`;
            } else if (url.hostname === 'github.com') {
                const pathParts = url.pathname.split('/');
                if (pathParts.length < 5 || pathParts[3] !== 'blob') {
                    cdnLinkText.textContent = '⚠️ 格式不正确，需为有效 GitHub 文件链接';
                    resultDiv.classList.remove('hidden');
                    return;
                }
                const user = pathParts[1];
                const repo = pathParts[2];
                const version = pathParts[4];
                const filePath = pathParts.slice(5).join('/');
                cdnUrl = `https://cdn.jsdelivr.net/gh/${user}/${repo}@${version}/${filePath}`;
            } else {
                cdnLinkText.textContent = '⚠️ 请输入有效的 GitHub 链接';
                resultDiv.classList.remove('hidden');
                return;
            }

            cdnLinkText.textContent = cdnUrl;
            resultDiv.classList.remove('hidden');

        } catch (e) {
            cdnLinkText.textContent = '⚠️ 解析失败，请检查网址格式';
            resultDiv.classList.remove('hidden');
        }
    }

    if (githubInput) githubInput.addEventListener('input', convertGithubCdn);

    if (cdnLinkText) {
        cdnLinkText.addEventListener('click', (e) => {
            const textToCopy = e.target.textContent;
            if (textToCopy && !textToCopy.startsWith('⚠️')) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showToast('🎉 CDN 链接已复制到剪贴板！');
                });
            }
        });
    }

    const counterInput = document.getElementById('counter-input');
    const counterResult = document.getElementById('counter-result');
    const counterClearBtn = document.getElementById('counter-clear-btn');

    if (counterInput && counterResult) {
        counterInput.addEventListener('input', () => {
            const text = counterInput.value;
            const chars = text.length;
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            counterResult.textContent = `字符数: ${chars} | 单词数: ${words}`;
        });
    }

    if (counterClearBtn && counterInput) {
        counterClearBtn.addEventListener('click', () => {
            counterInput.value = '';
            if (counterResult) counterResult.textContent = '字符数: 0 | 单词数: 0';
        });
    }

    // 6. 📱 移动端回顶按钮
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 7. 💕 点击爱心微特效
    document.body.addEventListener('click', (e) => {
        if (['INPUT', 'BUTTON', 'A', 'TEXTAREA'].includes(e.target.tagName)) return;

        const heart = document.createElement('span');
        heart.textContent = '❤️';
        heart.className = 'click-effect';
        heart.style.left = `${e.pageX}px`;
        heart.style.top = `${e.pageY}px`;

        document.body.appendChild(heart);

        requestAnimationFrame(() => heart.classList.add('fade-out'));
        heart.addEventListener('transitionend', () => heart.remove());
    });
});
