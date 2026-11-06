// ==UserScript==
// @name         DeepSeek Prompt 收藏夹
// @namespace    https://github.com/Ginger-is-Ginger/deepseek-webchat-prompt-favorites
// @supportURL   https://github.com/Ginger-is-Ginger/deepseek-prompt-favorites/issues
// @downloadURL  https://raw.githubusercontent.com/Ginger-is-Ginger/deepseek-prompt-favorites/main/main.user.js
// @updateURL    https://raw.githubusercontent.com/Ginger-is-Ginger/deepseek-prompt-favorites/main/main.user.js
// @version      1.0
// @description  新增中英文UI切换、导入导出功能
// @author       Ginger-is-Ginger
// @match        https://chat.deepseek.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1. 样式注入
    const style = document.createElement('style');
    style.innerHTML = `
        /* 主按钮样式 */
        .dsp-btn {
            display: flex; align-items: center; gap: 4px;
            padding: 0 12px; border-radius: 20px;
            border: 1px solid #e0e0e0; background: #fff;
            color: #1d4ed8; font-size: 13px; cursor: pointer;
            transition: all 0.2s; white-space: nowrap;
            margin-right: 8px;
            font-family: sans-serif;
            height: 34px;
            box-sizing: border-box;
        }
        .dsp-btn:hover { background: #f0f4f9; border-color: #1d4ed8; }

        /* 列表弹窗 */
        .dsp-popup {
            position: fixed; z-index: 9999;
            width: 320px; background: #eef2f8;
            border: 2px solid #3b82f6; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: none; flex-direction: column;
            padding: 12px; font-family: sans-serif;
            box-sizing: border-box;
        }
        .dsp-popup.show { display: flex; }

        /* 搜索与添加 */
        .dsp-header { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; }
        .dsp-add-btn {
            width: 32px; height: 32px; flex-shrink: 0; border-radius: 8px;
            border: 1px solid #3b82f6; background: #e0e7ff;
            color: #1d4ed8; font-size: 20px; cursor: pointer;
            display: flex; justify-content: center; align-items: center;
        }
        .dsp-search {
            flex: 1; padding: 6px 10px; border-radius: 8px;
            border: 1px solid #a0aec0; outline: none; font-size: 14px;
            box-sizing: border-box; min-width: 0;
        }
        /* 语言切换按钮 */
        .dsp-lang-btn {
            flex-shrink: 0; height: 32px; padding: 0 8px;
            border-radius: 8px; border: 1px solid #a0aec0;
            background: #fff; color: #666; font-size: 12px;
            cursor: pointer; transition: all 0.2s;
        }
        .dsp-lang-btn:hover { background: #f0f4f9; border-color: #3b82f6; color: #3b82f6; }

        /* 列表项 */
        .dsp-list {
            max-height: 260px; overflow-y: auto;
            display: flex; flex-direction: column; gap: 8px;
            padding-right: 4px;
        }
        .dsp-item {
            background: #fff; border: 1px solid #bfdbfe; border-radius: 8px;
            padding: 10px; display: flex; flex-direction: column; gap: 8px;
            cursor: pointer; transition: box-shadow 0.2s;
        }
        .dsp-item:hover { box-shadow: 0 2px 6px rgba(59,130,246,0.2); }
        .dsp-item-content { font-size: 14px; color: #333; word-break: break-all; line-height: 1.4; }
        .dsp-item-footer { display: flex; justify-content: space-between; align-items: center; }
        .dsp-tag {
            background: #3b82f6; color: #fff; font-size: 12px;
            padding: 2px 8px; border-radius: 10px;
        }
        .dsp-delete-btn {
            background: transparent; border: 1px solid #ef4444; color: #ef4444;
            border-radius: 4px; padding: 2px 6px; cursor: pointer; font-size: 12px;
        }
        .dsp-delete-btn:hover { background: #fee2e2; }

        /* 导入导出区域 */
        .dsp-footer {
            display: flex; gap: 10px; margin-top: 12px; padding-top: 10px;
            border-top: 1px solid #bfdbfe; justify-content: center;
        }
        .dsp-io-btn {
            flex: 1; padding: 6px 0; border-radius: 6px;
            border: 1px solid #3b82f6; background: #fff;
            color: #3b82f6; cursor: pointer; font-size: 13px;
            transition: all 0.2s; font-family: sans-serif;
        }
        .dsp-io-btn:hover { background: #3b82f6; color: #fff; }

        /* 新增模态框 */
        .dsp-modal {
            position: fixed; z-index: 10000;
            width: 300px; background: #eef2f8;
            border: 2px solid #3b82f6; border-radius: 12px;
            padding: 16px; display: none; flex-direction: column; gap: 12px;
            box-sizing: border-box;
            font-family: sans-serif;
        }
        .dsp-modal.show { display: flex; }
        .dsp-modal-title { text-align: center; font-weight: bold; color: #1e3a8a; font-size: 15px; }

        .dsp-modal textarea {
            width: 100%; height: 100px; padding: 8px; border-radius: 8px;
            border: 1px solid #a0aec0; resize: none; outline: none;
            font-family: sans-serif; font-size: 14px;
            box-sizing: border-box;
        }

        .dsp-tags { display: flex; gap: 8px; justify-content: center; }
        .dsp-tag-opt {
            padding: 4px 12px; border-radius: 12px; border: 1px solid #a0aec0;
            background: #fff; color: #666; cursor: pointer; font-size: 12px;
            transition: all 0.2s;
        }
        .dsp-tag-opt.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
        .dsp-modal-actions { display: flex; gap: 12px; justify-content: center; margin-top: 4px; }
        .dsp-btn-confirm { background: #3b82f6; color: #fff; border: none; padding: 6px 20px; border-radius: 6px; cursor: pointer; font-size: 14px;}
        .dsp-btn-cancel { background: #9ca3af; color: #fff; border: none; padding: 6px 20px; border-radius: 6px; cursor: pointer; font-size: 14px;}
    `;
    document.head.appendChild(style);

    // 2. i18n 多语言字典配置
    const i18n = {
        zh: {
            mainBtn: '📚 提示词收藏夹',
            searchPlaceholder: '搜索...',
            emptyList: '暂无收藏',
            export: '导出',
            import: '导入',
            modalTitle: '新Prompt收藏',
            modalPlaceholder: '输入你的提示词...',
            tagPrefix: '前缀',
            tagContent: '内容',
            tagSuffix: '后缀',
            confirm: '确定',
            cancel: '取消',
            deleteConfirm: '确定删除此提示词吗？',
            exportEmpty: '当前没有提示词可以导出！',
            importErrorFormat: '格式错误：导入的文件不是一个数组。',
            importErrorValid: '未找到有效的提示词数据。',
            importSuccessCount: '成功解析到 {count} 条提示词。\n\n点击【确定】将追加到现有列表中。\n点击【取消】将覆盖现有列表。',
            importSuccess: '导入成功！',
            importFail: '导入失败：'
        },
        en: {
            mainBtn: '📚 Prompt Favs',
            searchPlaceholder: 'Search...',
            emptyList: 'No favorites yet',
            export: 'Export',
            import: 'Import',
            modalTitle: 'New Prompt',
            modalPlaceholder: 'Enter your prompt...',
            tagPrefix: 'Prefix',
            tagContent: 'Content',
            tagSuffix: 'Suffix',
            confirm: 'Confirm',
            cancel: 'Cancel',
            deleteConfirm: 'Are you sure you want to delete this prompt?',
            exportEmpty: 'No prompts to export!',
            importErrorFormat: 'Format error: The imported file is not an array.',
            importErrorValid: 'No valid prompt data found.',
            importSuccessCount: 'Successfully parsed {count} prompts.\n\nClick [OK] to APPEND to existing list.\nClick [Cancel] to OVERWRITE existing list.',
            importSuccess: 'Import successful!',
            importFail: 'Import failed: '
        }
    };

    // 当前语言状态
    let currentLang = localStorage.getItem('ds_ui_lang') || 'zh';
    const t = (key) => i18n[currentLang][key] || key;

    // 3. 数据管理 (数据独立存储，不受语言影响)
    let prompts = JSON.parse(localStorage.getItem('ds_prompts_v1') || '[]');
    let currentTag = '内容'; // 数据层面永远存中文标签

    function savePrompts() {
        localStorage.setItem('ds_prompts_v1', JSON.stringify(prompts));
        renderList();
    }

    // 4. UI 元素初始化
    let popup, listContainer, searchInput, modal, textarea, tagBtns;

    function initUI() {
        popup = document.createElement('div');
        popup.className = 'dsp-popup';
        popup.innerHTML = `
            <div class="dsp-header">
                <button class="dsp-add-btn" id="dsp-add">+</button>
                <input type="text" class="dsp-search" id="dsp-search" placeholder="${t('searchPlaceholder')}">
                <button class="dsp-lang-btn" id="dsp-lang">中/EN</button>
            </div>
            <div class="dsp-list" id="dsp-list"></div>
            <div class="dsp-footer">
                <button class="dsp-io-btn" id="dsp-export">${t('export')}</button>
                <button class="dsp-io-btn" id="dsp-import">${t('import')}</button>
                <input type="file" id="dsp-file-input" accept=".json" style="display: none;">
            </div>
        `;
        document.body.appendChild(popup);

        modal = document.createElement('div');
        modal.className = 'dsp-modal';
        modal.innerHTML = `
            <div class="dsp-modal-title" id="dsp-modal-title">${t('modalTitle')}</div>
            <textarea id="dsp-textarea" placeholder="${t('modalPlaceholder')}"></textarea>
            <div class="dsp-tags" id="dsp-tags">
                <div class="dsp-tag-opt" data-tag="前缀" id="tag-prefix">${t('tagPrefix')}</div>
                <div class="dsp-tag-opt active" data-tag="内容" id="tag-content">${t('tagContent')}</div>
                <div class="dsp-tag-opt" data-tag="后缀" id="tag-suffix">${t('tagSuffix')}</div>
            </div>
            <div class="dsp-modal-actions">
                <button class="dsp-btn-confirm" id="dsp-confirm">${t('confirm')}</button>
                <button class="dsp-btn-cancel" id="dsp-cancel">${t('cancel')}</button>
            </div>
        `;
        document.body.appendChild(modal);

        listContainer = document.getElementById('dsp-list');
        searchInput = document.getElementById('dsp-search');
        textarea = document.getElementById('dsp-textarea');
        tagBtns = document.querySelectorAll('.dsp-tag-opt');

        // 绑定事件
        searchInput.addEventListener('input', renderList);

        document.getElementById('dsp-lang').addEventListener('click', toggleLanguage);

        document.getElementById('dsp-add').addEventListener('click', () => {
            textarea.value = '';
            setTag('内容');
            modal.classList.add('show');
        });

        tagBtns.forEach(btn => {
            btn.addEventListener('click', () => setTag(btn.dataset.tag));
        });

        document.getElementById('dsp-confirm').addEventListener('click', () => {
            const val = textarea.value.trim();
            if (val) {
                prompts.push({ id: Date.now().toString(), content: val, tag: currentTag });
                savePrompts();
                modal.classList.remove('show');
            }
        });

        document.getElementById('dsp-cancel').addEventListener('click', () => {
            modal.classList.remove('show');
        });

        document.getElementById('dsp-export').addEventListener('click', exportPrompts);

        const fileInput = document.getElementById('dsp-file-input');
        document.getElementById('dsp-import').addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', importPrompts);

        renderList();
    }

    // 5. 语言切换逻辑
    function toggleLanguage() {
        currentLang = currentLang === 'zh' ? 'en' : 'zh';
        localStorage.setItem('ds_ui_lang', currentLang);
        updateUILanguage();
    }

    function updateUILanguage() {
        // 更新主页按钮
        const mainBtn = document.getElementById('dsp-main-btn');
        if (mainBtn) mainBtn.innerHTML = t('mainBtn');

        // 更新弹窗内的静态文本
        searchInput.placeholder = t('searchPlaceholder');
        document.getElementById('dsp-export').textContent = t('export');
        document.getElementById('dsp-import').textContent = t('import');
        document.getElementById('dsp-modal-title').textContent = t('modalTitle');
        textarea.placeholder = t('modalPlaceholder');
        document.getElementById('dsp-confirm').textContent = t('confirm');
        document.getElementById('dsp-cancel').textContent = t('cancel');

        // 更新标签文本 (利用 data-tag 保持数据不变，只改显示)
        document.getElementById('tag-prefix').textContent = t('tagPrefix');
        document.getElementById('tag-content').textContent = t('tagContent');
        document.getElementById('tag-suffix').textContent = t('tagSuffix');

        // 重新渲染列表以更新标签文字
        renderList();
    }

    function setTag(tagValue) {
        currentTag = tagValue; // 记录真实数据值(中文)
        tagBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tag === tagValue);
        });
    }

    // 6. 渲染列表 (核心：数据与显示分离)
    function renderList() {
        const keyword = searchInput.value.toLowerCase();
        listContainer.innerHTML = '';

        const filtered = prompts.filter(p => p.content.toLowerCase().includes(keyword));

        if (filtered.length === 0) {
            listContainer.innerHTML = `<div style="text-align:center;color:#999;font-size:12px;padding:10px;">${t('emptyList')}</div>`;
            return;
        }

        filtered.forEach(p => {
            const item = document.createElement('div');
            item.className = 'dsp-item';

            item.addEventListener('click', (e) => {
                if (e.target.closest('.dsp-delete-btn')) return;
                insertToInput(p.content);
                popup.classList.remove('show');
            });

            // 根据当前语言，将存储的"前缀/内容/后缀"映射为对应的显示文字
            let displayTag = p.tag;
            if (currentLang === 'en') {
                if (p.tag === '前缀') displayTag = 'Prefix';
                if (p.tag === '内容') displayTag = 'Content';
                if (p.tag === '后缀') displayTag = 'Suffix';
            } else {
                // 如果以前导入过英文版数据，反向映射回中文显示
                if (p.tag === 'Prefix') displayTag = '前缀';
                if (p.tag === 'Content') displayTag = '内容';
                if (p.tag === 'Suffix') displayTag = '后缀';
            }

            item.innerHTML = `
                <div class="dsp-item-content">${p.content}</div>
                <div class="dsp-item-footer">
                    <span class="dsp-tag">${displayTag}</span>
                    <button class="dsp-delete-btn" data-id="${p.id}">🗑️</button>
                </div>
            `;

            item.querySelector('.dsp-delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if(confirm(t('deleteConfirm'))) {
                    prompts = prompts.filter(x => x.id !== p.id);
                    savePrompts();
                }
            });

            listContainer.appendChild(item);
        });
    }

    function insertToInput(text) {
        const txtArea = document.querySelector('textarea');
        if (txtArea) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
            nativeInputValueSetter.call(txtArea, txtArea.value ? txtArea.value + '\n' + text : text);
            txtArea.dispatchEvent(new Event('input', { bubbles: true }));
            txtArea.focus();
        }
    }

    // 7. 导入导出逻辑
    function exportPrompts() {
        if (prompts.length === 0) {
            alert(t('exportEmpty'));
            return;
        }
        const dataStr = JSON.stringify(prompts, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().split('T')[0];
        a.download = `deepseek_prompts_${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function importPrompts(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                if (!Array.isArray(importedData)) throw new Error(t('importErrorFormat'));

                const validData = importedData.filter(item => item && item.content && item.tag);
                if (validData.length === 0) throw new Error(t('importErrorValid'));

                const confirmMsg = t('importSuccessCount').replace('{count}', validData.length);
                const isAppend = confirm(confirmMsg);

                if (isAppend) {
                    const newItems = validData.map(item => ({
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                        content: item.content,
                        tag: item.tag || '内容'
                    }));
                    prompts = prompts.concat(newItems);
                } else {
                    prompts = validData;
                }

                savePrompts();
                alert(t('importSuccess'));
            } catch (err) {
                alert(t('importFail') + err.message);
            } finally {
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    }

    // 8. 核心：寻找上传按钮并注入
    function injectButton() {
        const existingBtn = document.getElementById('dsp-main-btn');
        if (existingBtn && document.body.contains(existingBtn)) {
            // 确保文字语言正确 (防止React重新渲染后回退)
            if (existingBtn.innerHTML !== t('mainBtn')) {
                existingBtn.innerHTML = t('mainBtn');
            }
            return;
        }

        let uploadBtn = null;
        const svgPath = document.querySelector('path[d^="M5.5498 9.75V5"]');
        if (svgPath) uploadBtn = svgPath.closest('div[role="button"]');

        if (!uploadBtn) {
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) uploadBtn = fileInput.closest('div[role="button"], button');
        }

        if (!uploadBtn) {
            const txtArea = document.querySelector('textarea');
            if (txtArea) {
                let parent = txtArea.parentElement;
                for (let i = 0; i < 5 && parent; i++) {
                    const btns = Array.from(parent.querySelectorAll('div[role="button"], button'));
                    const iconBtns = btns.filter(b => b.querySelector('svg') && !b.textContent.trim());
                    if (iconBtns.length >= 2) {
                        uploadBtn = iconBtns[iconBtns.length - 2];
                        break;
                    }
                    parent = parent.parentElement;
                }
            }
        }

        if (!uploadBtn) return;

        const btn = document.createElement('button');
        btn.id = 'dsp-main-btn';
        btn.className = 'dsp-btn';
        btn.innerHTML = t('mainBtn'); // 初始渲染时应用当前语言

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = btn.getBoundingClientRect();

            let popupLeft = rect.left;
            if (popupLeft + 320 > window.innerWidth) popupLeft = window.innerWidth - 330;
            if (popupLeft < 10) popupLeft = 10;

            popup.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
            popup.style.left = popupLeft + 'px';

            let modalLeft = popupLeft + 330;
            if (modalLeft + 300 > window.innerWidth) modalLeft = popupLeft - 310;
            modal.style.bottom = popup.style.bottom;
            modal.style.left = modalLeft + 'px';

            popup.classList.toggle('show');
            if(!popup.classList.contains('show')) modal.classList.remove('show');
        });

        document.addEventListener('click', (e) => {
            if (!popup.contains(e.target) && e.target !== btn && !modal.contains(e.target)) {
                popup.classList.remove('show');
                modal.classList.remove('show');
            }
        });

        if (uploadBtn.parentNode) {
            uploadBtn.parentNode.insertBefore(btn, uploadBtn);
        }
    }

    // 9. 启动
    initUI();
    // 初始化时如果为英文，立即刷新一次UI
    if(currentLang === 'en') {
        updateUILanguage();
    }

    setInterval(injectButton, 500);

})();