document.addEventListener('DOMContentLoaded', () => {
    // 获取搜索输入框、按钮和错误消息元素的 DOM 引用
    const searchInput = document.getElementById('search-input');
    const googleSearchBtn = document.getElementById('google-search-btn');
    const baiduSearchBtn = document.getElementById('baidu-search-btn');
    const searchErrorMessage = document.getElementById('search-error-message');

    /**
     * 显示搜索错误消息。
     */
    function showSearchError() {
        searchErrorMessage.classList.add('show');
        // 2秒后自动隐藏错误消息
        setTimeout(() => {
            searchErrorMessage.classList.remove('show');
        }, 2000);
    }

    /**
     * 执行搜索操作。
     * @param {string} searchEngine - 搜索引擎名称 ('google' 或 'baidu')。
     */
    function performSearch(searchEngine) {
        const query = searchInput.value.trim(); // 获取输入框内容并去除首尾空格
        if (query) { // 如果输入内容不为空
            let url;
            if (searchEngine === 'google') {
                // 构建谷歌搜索 URL，使用 encodeURIComponent 对查询字符串进行编码以处理特殊字符
                url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            } else if (searchEngine === 'baidu') {
                // 构建百度搜索 URL，使用 encodeURIComponent 对查询字符串进行编码
                url = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
            }
            window.open(url, '_blank'); // 在新标签页打开搜索结果
        } else {
            showSearchError(); // 如果输入为空，显示错误消息
        }
    }

    // 谷歌搜索功能实现
    googleSearchBtn.addEventListener('click', () => performSearch('google'));

    // 百度搜索功能实现
    baiduSearchBtn.addEventListener('click', () => performSearch('baidu'));

    // 允许在搜索输入框中按回车键进行谷歌搜索
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') { // 如果按下的键是“Enter”
            performSearch('google'); // 模拟点击谷歌搜索按钮
        }
    });

    // 禁用右键默认菜单并跳转到指定网页
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault(); // 阻止默认的右键菜单
        window.location.href = 'https://www.gov.cn/'; // 跳转到指定网址
    });

    // 鼠标点击效果 JavaScript
    // 将事件监听器绑定到整个文档，确保覆盖全范围
    document.body.addEventListener('click', (event) => {
        const heart = document.createElement('span');
        heart.textContent = '❤️';
        heart.classList.add('click-effect');
        // 修复：使用 event.pageX 和 event.pageY 获取相对于文档的精确点击位置
        heart.style.left = `${event.pageX}px`;
        heart.style.top = `${event.pageY}px`;
        document.body.appendChild(heart);

        // 触发动画
        setTimeout(() => {
            heart.classList.add('fade-out');
        }, 10); // 短暂延迟以确保 CSS 过渡生效

        // 动画结束后移除元素
        heart.addEventListener('transitionend', () => {
            heart.remove();
        });
    });

    // 新增的 CDN 加速功能 JavaScript
    const githubInput = document.getElementById('github-url-input');
    const resultDiv = document.getElementById('result-link');
    const cdnLinkText = document.getElementById('cdn-link-text');

    // 优化后的 convertLink 函数，可处理两种类型的 GitHub 链接
    function convertLink() {
        const inputUrl = githubInput.value.trim();
        if (!inputUrl) {
            resultDiv.classList.add('hidden');
            return;
        }

        try {
            const url = new URL(inputUrl);
            let cdnUrl;

            // 处理 raw.githubusercontent.com 链接
            if (url.hostname === 'raw.githubusercontent.com') {
                const pathParts = url.pathname.split('/');
                const user = pathParts[1];
                const repo = pathParts[2];
                
                // 检查路径是否包含 refs/heads/ 或 refs/tags/
                if (pathParts[3] === 'refs' && (pathParts[4] === 'heads' || pathParts[4] === 'tags')) {
                    const ref = `${pathParts[3]}/${pathParts[4]}/${pathParts[5]}`;
                    const filePath = pathParts.slice(6).join('/');
                    cdnUrl = `https://cdn.jsdelivr.net/gh/${user}/${repo}@${ref}/${filePath}`;
                } else {
                    // 如果没有 refs/heads/ 或 refs/tags/，则使用 main
                    const filePath = pathParts.slice(3).join('/');
                    cdnUrl = `https://cdn.jsdelivr.net/gh/${user}/${repo}@main/${filePath}`;
                }

            // 处理 github.com 链接
            } else if (url.hostname === 'github.com') {
                const pathParts = url.pathname.split('/');
                if (pathParts.length < 5 || pathParts[3] !== 'blob') {
                    cdnLinkText.textContent = '链接格式不正确，请确保它是一个有效的 GitHub 文件链接。';
                    resultDiv.classList.remove('hidden');
                    return;
                }

                const user = pathParts[1];
                const repo = pathParts[2];
                const version = pathParts[4];
                const filePath = pathParts.slice(5).join('/');

                cdnUrl = `https://cdn.jsdelivr.net/gh/${user}/${repo}@${version}/${filePath}`;
            } else {
                cdnLinkText.textContent = '无效的 URL。请输入一个有效的 GitHub 或 raw.githubusercontent.com 链接。';
                resultDiv.classList.remove('hidden');
                return;
            }

            cdnLinkText.textContent = cdnUrl;
            resultDiv.classList.remove('hidden');

        } catch (error) {
            cdnLinkText.textContent = '无效的 URL。请检查您的输入。';
            resultDiv.classList.remove('hidden');
        }
    }
    
    // 绑定事件，实现在输入时自动生成链接
    githubInput.addEventListener('input', convertLink);
    
    // 新增：点击生成的链接即可复制
    cdnLinkText.addEventListener('click', function(e) {
        const textToCopy = e.target.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('链接已成功复制到剪贴板！');
        }).catch(err => {
            console.error('复制失败: ', err);
        });
    });
});
