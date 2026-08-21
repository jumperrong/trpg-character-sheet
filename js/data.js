/**
 * 数据模块 - 保存、加载、导入、导出
 * 依赖：core.js, calc.js, skills.js, ui.js
 * 
 * 数据流：
 *   UI → saveCharacter() → localStorage
 *   localStorage → loadCharacter() → UI
 */

// ============ 常量配置 ============
const SAVE_VERSION = '1.3.0';
const ATTR_IDS = ['str', 'con', 'siz', 'dex', 'app', 'int', 'pow', 'edu', 'luc'];
const LAST_EXPORT_KEY = 'lastExportFileHandle';

// 会话级缓存上次导出的文件句柄
let lastExportHandle = null;

// 状态属性的字段映射配置
const STATUS_MAPPINGS = {
    sanity: { selectors: { current: '.sanity-current', start: '.sanity-start', max: '.sanity-max' }, defaults: { max: '99' } },
    health: { selectors: { current: '.health-current', max: '.health-max', temp: '.health-temp' }, defaults: {} },
    magic: { selectors: { current: '.magic-current', max: '.magic-max', temp: '.magic-temp' }, defaults: {} }
};

// 武器表格单元格配置
const WEAPON_CELL_CONFIG = [
    { placeholder: '武器名称', cls: 'weapon-name', dataKey: 'name' },
    { placeholder: '伤害', cls: 'weapon-damage', dataKey: 'damage' },
    { placeholder: '特性', cls: 'weapon-feature', dataKey: 'feature' }
];

// ============ 初始化 ============
function initSaveLoad() {
    const bindings = [
        ['save-button', saveCharacter, [true]],
        ['export-button', exportCharacter, []],
        ['import-button', importCharacter, []]
    ];
    
    bindings.forEach(([id, fn, args]) => {
        const el = DOMCache.get(id);
        if (el) {
            el.addEventListener('click', () => {
                // 点击菜单项后先关闭下拉（移动端不会自动因为hover关闭）
                const dropdown = document.getElementById('io-dropdown');
                if (dropdown && dropdown.parentElement) {
                    dropdown.parentElement.classList.remove('is-open');
                }
                fn(...args);
            });
        }
    });

    // P1#8：导入/导出下拉菜单 click 切换（兼容触屏无 hover）
    const ioButton = document.getElementById('io-button');
    const ioContainer = ioButton ? ioButton.closest('.float-button-container') : null;
    if (ioButton && ioContainer) {
        ioButton.addEventListener('click', (e) => {
            e.stopPropagation();
            ioContainer.classList.toggle('is-open');
        });

        // 点击文档任何地方关闭下拉
        document.addEventListener('click', (e) => {
            if (!ioContainer.contains(e.target)) {
                ioContainer.classList.remove('is-open');
            }
        }, true);

        // 选择某项后自动关闭（上面 bindings 中已经处理，这里兜底）
        const dropdown = document.getElementById('io-dropdown');
        if (dropdown) {
            dropdown.addEventListener('click', () => {
                ioContainer.classList.remove('is-open');
            });
        }
    }
    
    // 导入确认弹窗
    const cancelImportBtn = document.getElementById('cancel-import');
    const confirmImportBtn = document.getElementById('confirm-import');
    const importModal = document.getElementById('import-confirm-modal');
    
    if (cancelImportBtn) {
        cancelImportBtn.addEventListener('click', closeImportConfirm);
    }
    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', confirmImport);
    }
    if (importModal) {
        importModal.addEventListener('click', function(event) {
            if (event.target === importModal) {
                closeImportConfirm();
            }
        });
    }
}

// ============ 导出 ============
async function exportCharacter() {
    try {
        saveCharacter(false);
        const currentId = CharacterManager.getCurrentId();
        let characterData;
        if (currentId) {
            characterData = CharacterManager.getCharacterData(currentId);
        } else {
            // 兜底：读取旧键（兼容未迁移的现场）
            const raw = localStorage.getItem('characterData');
            characterData = raw ? JSON.parse(raw) : null;
        }
        if (!characterData) {
            await showMessage('没有可导出的角色数据');
            return;
        }

        const characterName = characterData.basic?.characterName || 'character';
        const fileName = `${characterName}_${new Date().toISOString().split('T')[0]}.json`;
        const jsonContent = JSON.stringify(characterData, null, 2);
        
        // 优先使用 File System Access API 让用户选择保存路径
        if ('showSaveFilePicker' in window) {
            try {
                const options = {
                    suggestedName: fileName,
                    types: [{
                        description: 'JSON 文件',
                        accept: { 'application/json': ['.json'] }
                    }]
                };
                
                // 使用上次导出的目录作为起始位置
                if (lastExportHandle) {
                    options.startIn = lastExportHandle;
                }
                
                const handle = await showSaveFilePicker(options);
                
                // 保存句柄供下次使用
                lastExportHandle = handle;
                
                const writable = await handle.createWritable();
                await writable.write(jsonContent);
                await writable.close();
                await showMessage('角色数据已导出');
                return;
            } catch (pickerError) {
                // 用户取消 → 直接终止，不降级
                if (pickerError.name === 'AbortError') {
                    return;
                }
                console.warn('showSaveFilePicker 失败，降级到传统下载:', pickerError);
            }
        }

        // 传统方式降级（仅在不支持 File System Access API 时使用）
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        await showMessage('角色数据已导出');
    } catch (error) {
        console.error('导出角色数据错误:', error);
        await showMessage('导出失败，请稍后再试');
    }
}

// ============ 导入 ============
async function importCharacter() {
    // 优先使用 File System Access API
    if ('showOpenFilePicker' in window) {
        try {
            const options = {
                multiple: false,
                types: [{
                    description: 'JSON 文件',
                    accept: { 'application/json': ['.json'] }
                }]
            };
            
            // 使用上次导出的目录作为起始位置
            if (lastExportHandle) {
                options.startIn = lastExportHandle;
            }
            
            const [fileHandle] = await showOpenFilePicker(options);
            const file = await fileHandle.getFile();
            const content = await file.text();
            
            try {
                const importedData = JSON.parse(content);
                normalizeImportedData(importedData);
                showImportConfirm(importedData, file.name);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                await showMessage('导入的文件不是有效的角色数据文件');
            }
        } catch (pickerError) {
            // 用户取消，不提示
            if (pickerError.name !== 'AbortError') {
                console.warn('showOpenFilePicker 失败:', pickerError);
                fallbackImport();
            }
        }
    } else {
        fallbackImport();
    }
}

/**
 * 传统方式导入（降级方案）
 */
function fallbackImport() {
    try {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.className = 'hidden-file-input';
        
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    normalizeImportedData(importedData);
                    showImportConfirm(importedData, file.name);
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    await showMessage('导入的文件不是有效的角色数据文件');
                }
            };
            reader.readAsText(file);
        });

        document.body.appendChild(fileInput);
        fileInput.click();

        setTimeout(() => document.body.removeChild(fileInput), 100);
    } catch (error) {
        console.error('Error importing character:', error);
        showMessage('导入失败，请稍后再试。');
    }
}

/**
 * 显示导入确认弹窗
 */
let pendingImportData = null;

function showImportConfirm(data, fileName) {
    pendingImportData = data;

    const modal = document.getElementById('import-confirm-modal');
    const body = document.getElementById('import-confirm-body');

    const basic = data.basic || {};
    const attrCount = data.attributes ? Object.keys(data.attributes).length : 0;
    const skillCount = data.skills?.skillsList?.length || 0;
    const weaponCount = data.weapons?.length || 0;
    const customSkillCount = data.customSkills?.length || 0;
    const itemCount = data.items?.length || 0;
    const noteCount = data.notes?.length || 0;

    // 对所有用户可控字符串进行 HTML 转义，防止 XSS
    const esc = escapeHtml;
    const safeFileName = esc(fileName || '未知');
    const safeVersion = esc(String(data.version || '未知'));
    const safeName = esc(basic.characterName || '（空）');
    const safePlayer = esc(basic.playerName || '（空）');
    const safeOccupation = esc(basic.occupation || '（空）');
    const safeEra = esc(basic.era || '（空）');
    const safeAge = esc(basic.age || '（空）');
    const safeGender = esc(basic.gender || '（空）');
    const safeResidence = esc(basic.residence || '（空）');
    const safeBirthplace = esc(basic.birthplace || '（空）');

    const hasCurrent = !!CharacterManager.getCurrentId();
    body.innerHTML = `
        <div class="import-confirm-section">
            <div class="import-confirm-section-title">导入模式</div>
            <label class="import-radio-item">
                <input type="radio" name="import-mode" value="new" checked>
                <span>创建为新角色</span>
            </label>
            <label class="import-radio-item">
                <input type="radio" name="import-mode" value="overwrite" ${hasCurrent ? '' : 'disabled'}>
                <span>覆盖当前角色 ${hasCurrent ? '' : '（当前无角色，不可用）'}</span>
            </label>
            ${hasCurrent ? `<div class="import-confirm-warning mt">⚠ "覆盖"将替换当前角色的所有内容，不可撤销</div>` : ''}
        </div>
        <div class="import-confirm-section">
            <div class="import-confirm-section-title">文件信息</div>
            <div class="import-confirm-meta">文件名：${safeFileName}</div>
            <div class="import-confirm-meta">数据版本：${safeVersion}</div>
        </div>
        <div class="import-confirm-section">
            <div class="import-confirm-section-title">角色基本信息</div>
            <div class="import-confirm-grid-2">
                <div>姓名：<strong>${safeName}</strong></div>
                <div>玩家：${safePlayer}</div>
                <div>职业：${safeOccupation}</div>
                <div>时代：${safeEra}</div>
                <div>年龄：${safeAge}</div>
                <div>性别：${safeGender}</div>
                <div>住址：${safeResidence}</div>
                <div>出生地：${safeBirthplace}</div>
            </div>
        </div>
        <div class="import-confirm-section">
            <div class="import-confirm-section-title">数据概览</div>
            <div class="import-confirm-grid-3">
                <div>属性：${attrCount} 项</div>
                <div>技能：${skillCount} 项</div>
                <div>武器：${weaponCount} 项</div>
                <div>自定义技能：${customSkillCount} 项</div>
                <div>物品：${itemCount} 项</div>
                <div>笔记：${noteCount} 项</div>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

/**
 * HTML 转义，防止 XSS
 */
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * 执行导入（确认后调用）
 */
async function confirmImport() {
    if (!pendingImportData) return;

    try {
        const modeEl = document.querySelector('input[name="import-mode"]:checked');
        const mode = modeEl?.value || 'new';

        if (mode === 'overwrite') {
            // 覆盖当前角色
            const currentId = CharacterManager.getCurrentId();
            if (!currentId) {
                await showMessage('当前无角色可覆盖，请使用"创建为新角色"模式');
                return;
            }
            CharacterManager.setCharacterData(currentId, pendingImportData);
            CharacterManager.refreshMeta(currentId);
            await loadCharacter(true);
            await showMessage('已覆盖当前角色并加载');
        } else {
            // 新建角色
            const newId = CharacterManager.importAsNewCharacter(pendingImportData);
            await loadCharacter(true);
            await showMessage('已创建为新角色并切换到该角色');
        }

        if (typeof updateCharacterManagerUi === 'function') {
            updateCharacterManagerUi();
        }
    } catch (error) {
        console.error('Error confirming import:', error);
        await showMessage('导入失败，请稍后再试。');
    } finally {
        pendingImportData = null;
        closeImportConfirm();
    }
}

/**
 * 关闭导入确认弹窗
 */
function closeImportConfirm() {
    const modal = document.getElementById('import-confirm-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    pendingImportData = null;
}

/**
 * 标准化导入数据格式，兼容旧版本
 */
function normalizeImportedData(data) {
    // 兼容旧版 weapons.features → weapon.feature
    if (data.weapons && Array.isArray(data.weapons)) {
        data.weapons.forEach(weapon => {
            if (weapon.features !== undefined && weapon.feature === undefined) {
                weapon.feature = weapon.features;
            }
        });
    }
    // 兼容旧版 stats → status
    if (data.stats && !data.status) {
        data.status = data.stats;
    }
}

// ============ 保存 ============
async function saveCharacter(showAlert = true) {
    try {
        const characterData = {
            basic: collectBasicInfo(),
            attributes: collectAttributes(),
            skills: collectSkills(),
            combat: collectCombat(),
            status: collectStatus(),
            weapons: collectWeapons(),
            customSkills: collectCustomSkills(),
            items: collectItems(),
            notes: collectNotes(),
            growth: collectGrowth(),
            version: SAVE_VERSION
        };

        // 按当前角色 ID 存储；若无角色则先新建
        let currentId = CharacterManager.getCurrentId();
        if (!currentId) {
            currentId = CharacterManager.createCharacter(
                characterData.basic?.characterName || '未命名角色'
            );
        }
        CharacterManager.setCharacterData(currentId, characterData);
        CharacterManager.refreshMeta(currentId);

        if (showAlert) {
            await showMessage('角色数据已保存到本地缓存');
        }
    } catch (error) {
        console.error('Error saving character:', error);
        if (showAlert) {
            await showMessage('保存失败，请稍后再试。');
        }
    }
}

// ---------- 保存辅助函数 ----------

/**
 * 收集基础信息（姓名、玩家、时代等）
 * 头像以 dataURL 形式保存在 basic.avatar 中
 */
function collectBasicInfo() {
    const avatarImg = document.getElementById('avatar-img');
    return {
        characterName: DOMCache.get('character-name')?.value || '',
        playerName: DOMCache.get('player-name')?.value || '',
        era: DOMCache.get('era')?.value || '',
        occupation: DOMCache.get('occupation')?.value || '',
        age: DOMCache.get('age')?.value || '',
        gender: DOMCache.get('gender')?.value || '',
        residence: DOMCache.get('residence')?.value || '',
        birthplace: DOMCache.get('birthplace')?.value || '',
        isPartner: DOMCache.get('is-partner')?.checked || false,
        avatar: (avatarImg && avatarImg.classList.contains('is-visible')) ? (avatarImg.src || '') : ''
    };
}

/**
 * 收集属性值（STR/CON/SIZ等9项）
 */
function collectAttributes() {
    const attrs = {};
    ATTR_IDS.forEach(id => {
        attrs[id] = DOMCache.get(id)?.value || '';
    });
    return attrs;
}

/**
 * 收集技能数据，包括常规技能和子技能
 */
function collectSkills() {
    const skillsList = [];
    document.querySelectorAll('.skill-row').forEach((skillRow) => {
        const nameElement = skillRow.querySelector('.skill-name span');
        if (!nameElement) return;
        
        const skillData = {
            name: nameElement.textContent.trim(),
            isSubSkill: skillRow.classList.contains('sub-skill-row'),
            parentSkill: nameElement.dataset.skill,
            checked: skillRow.querySelector('.skill-check')?.checked || false,
            base: skillRow.querySelector('.base-value')?.value || '0',
            occupation: skillRow.querySelector('.occupation-points')?.value || '0',
            interest: skillRow.querySelector('.interest-points')?.value || '0',
            growth: skillRow.querySelector('.growth-points')?.value || '0'
        };
        
        // 处理子类型
        const subtypeElement = skillRow.querySelector('.selected-subtype');
        if (subtypeElement && subtypeElement.textContent.trim()) {
            skillData.subtype = subtypeElement.textContent.trim();
            skillData.actualBase = skillRow.querySelector('.base-value')?.value || '0';
        }
        
        // 确定子技能索引
        skillData.subSkillIndex = getSubSkillIndex(skillRow, nameElement);
        skillsList.push(skillData);
    });
    
    return {
        occupationPoints: DOMCache.get('occupation-points')?.value || '0',
        interestPoints: DOMCache.get('interest-points')?.value || '0',
        skillsList
    };
}

/**
 * 获取子技能的索引值
 */
function getSubSkillIndex(skillRow, nameElement) {
    if (skillRow.dataset.subSkillIndex) {
        return skillRow.dataset.subSkillIndex;
    }
    if (skillRow.classList.contains('sub-skill-row')) {
        const parent = nameElement.closest('.skills-column');
        if (parent) {
            const allSubSkillRows = Array.from(parent.querySelectorAll('.sub-skill-row'));
            const index = allSubSkillRows.indexOf(skillRow);
            if (index !== -1) {
                return index + 1;
            }
        }
    }
    return undefined;
}

/**
 * 收集战斗属性（伤害加成、精神加成等）
 */
function collectCombat() {
    return {
        damageBonus: DOMCache.get('damage-bonus')?.value || '',
        spiritBonus: DOMCache.get('spirit-bonus')?.value || '',
        build: DOMCache.get('build')?.value || '',
        armor: DOMCache.get('armor')?.value || ''
    };
}

/**
 * 收集状态值（理智、生命、魔法）
 */
function collectStatus() {
    const result = {};
    Object.entries(STATUS_MAPPINGS).forEach(([key, config]) => {
        result[key] = {};
        Object.entries(config.selectors).forEach(([field, selector]) => {
            result[key][field] = DOMCache.query(selector)?.value || config.defaults[field] || '';
        });
    });
    return result;
}

/**
 * 收集武器数据
 */
function collectWeapons() {
    const weapons = [];
    document.querySelectorAll('.weapon-row').forEach(row => {
        const nameInput = row.querySelector('.weapon-name');
        if (nameInput && nameInput.value) {
            const weapon = {};
            WEAPON_CELL_CONFIG.forEach(cell => {
                weapon[cell.dataKey] = row.querySelector(`.${cell.cls}`)?.value || '';
            });
            weapons.push(weapon);
        }
    });
    return weapons;
}

/**
 * 收集自定义技能数据（左右双栏）
 */
function collectCustomSkills() {
    const body = DOMCache.get('custom-skills-body');
    if (!body) return [];
    
    const results = [];
    const rows = body.querySelectorAll('tr');
    
    rows.forEach(row => {
        // 左栏
        const leftName = row.querySelector('td:nth-child(1) input');
        if (leftName && leftName.value) {
            results.push({
                name: leftName.value,
                base: row.querySelector('td:nth-child(2) input')?.value || '0',
                occupation: row.querySelector('td:nth-child(3) input')?.value || '0',
                interest: row.querySelector('td:nth-child(4) input')?.value || '0',
                growth: row.querySelector('td:nth-child(5) input')?.value || '0',
                position: 'left'
            });
        }
        
        // 右栏
        const rightName = row.querySelector('td:nth-child(9) input');
        if (rightName && rightName.value) {
            results.push({
                name: rightName.value,
                base: row.querySelector('td:nth-child(10) input')?.value || '0',
                occupation: row.querySelector('td:nth-child(11) input')?.value || '0',
                interest: row.querySelector('td:nth-child(12) input')?.value || '0',
                growth: row.querySelector('td:nth-child(13) input')?.value || '0',
                position: 'right'
            });
        }
    });
    
    return results;
}

/**
 * 收集物品数据
 */
function collectItems() {
    const items = [];
    const body = DOMCache.get('items-body');
    if (!body) return items;
    
    body.querySelectorAll('tr').forEach(row => {
        // 左栏物品
        const leftName = row.querySelector('td:nth-child(1) input');
        if (leftName && leftName.value.trim()) {
            const itemIndex = leftName.dataset.itemIndex;
            items.push({
                name: leftName.value,
                type: row.querySelector(`td:nth-child(2) input.item-type-input[data-item-index="${itemIndex}"]`)?.value || '',
                note: row.querySelector(`td:nth-child(3) textarea.item-note[data-item-index="${itemIndex}"]`)?.value || '',
                itemIndex: parseInt(itemIndex)
            });
        }
        
        // 右栏物品
        const rightName = row.querySelector('td:nth-child(4) input');
        if (rightName && rightName.value.trim()) {
            const itemIndex = rightName.dataset.itemIndex;
            items.push({
                name: rightName.value,
                type: row.querySelector(`td:nth-child(5) input.item-type-input[data-item-index="${itemIndex}"]`)?.value || '',
                note: row.querySelector(`td:nth-child(6) textarea.item-note[data-item-index="${itemIndex}"]`)?.value || '',
                itemIndex: parseInt(itemIndex)
            });
        }
    });
    return items;
}

/**
 * 收集笔记数据（仅左列）
 * 所有笔记均使用左列偶数位置：默认笔记在位置 0, 2, 4，自定义笔记从位置 6 开始
 */
function collectNotes() {
    const body = DOMCache.get('notes-body');
    if (!body) return [];

    const notes = [];
    const rows = body.querySelectorAll('tr');

    // 只收集左列偶数位置的笔记数据
    const leftNotes = [];
    rows.forEach((row, rowIndex) => {
        const globalPos = rowIndex * 2; // 偶数位置（左列）
        const leftName = row.querySelector('td:nth-child(1) .item-name');
        if (leftName) {
            leftNotes.push({
                globalPos: globalPos,
                name: leftName.value,
                type: row.querySelector('td:nth-child(2) .item-type-input')?.value || '',
                note: row.querySelector('td:nth-child(3) .item-note')?.value || ''
            });
        } else {
            leftNotes.push({ globalPos: globalPos, name: '', type: '', note: '' });
        }
    });

    // 收集默认笔记（位置由 DEFAULT_NOTE_POSITIONS 定义）
    for (let i = 0; i < DEFAULT_NOTES.length; i++) {
        const position = DEFAULT_NOTES[i].globalPos;
        const note = leftNotes[position / 2] || {};
        notes.push({
            name: DEFAULT_NOTES[i].name,
            type: DEFAULT_NOTES[i].type,
            note: note.note || ''
        });
    }

    // 收集自定义笔记（跳过默认位置，只收集有名称的）
    for (let i = 0; i < leftNotes.length; i++) {
        const globalPos = leftNotes[i].globalPos;
        if (DEFAULT_NOTE_POSITIONS.includes(globalPos)) continue;
        const note = leftNotes[i];
        if (note.name && note.name.trim()) {
            notes.push({
                name: note.name,
                type: note.type || '',
                note: note.note || ''
            });
        }
    }

    return notes;
}

/**
 * 收集成长模块状态（与 characterData 一同保存/导出/导入）
 */
function collectGrowth() {
    if (typeof Growth === 'undefined') return null;
    return {
        growthPoints: Growth.state.growthPoints,
        pointsConfirmed: Growth.state.pointsConfirmed,
        history: Growth.state.history
    };
}

/**
 * 从 characterData 加载成长模块状态
 * 兼容：旧版独立 localStorage key（growthPointsRemaining / growthHistory）迁移后清除
 */
function loadGrowth(data) {
    if (typeof Growth === 'undefined') return;

    // 旧版兼容：独立 key 存在则迁移
    const legacyPoints = localStorage.getItem('growthPointsRemaining');
    const legacyHistory = localStorage.getItem('growthHistory');
    if (legacyPoints !== null || legacyHistory !== null) {
        Growth.state.growthPoints = legacyPoints ? parseInt(legacyPoints) : 0;
        Growth.state.history = legacyHistory ? JSON.parse(legacyHistory) : [];
        localStorage.removeItem('growthPointsRemaining');
        localStorage.removeItem('growthHistory');
    } else if (data && data.growth) {
        Growth.state.growthPoints = data.growth.growthPoints || 0;
        Growth.state.pointsConfirmed = !!data.growth.pointsConfirmed;
        Growth.state.history = Array.isArray(data.growth.history) ? data.growth.history : [];
    }

    Growth.saveState = function() {
        // 重写：保存到 characterData 而非独立 key
        if (typeof saveCharacter === 'function') {
            saveCharacter(false);
        }
    };
}

// ============ 加载 ============
async function loadCharacter(skipAlert = false) {
    try {
        // 优先从 CharacterManager 读取当前角色
        const currentId = CharacterManager.getCurrentId();
        let characterData = currentId ? CharacterManager.getCharacterData(currentId) : null;

        // 兜底：读取旧键（兼容极端情况下未迁移的现场）
        if (!characterData) {
            const dataStr = localStorage.getItem('characterData');
            if (dataStr) {
                try {
                    characterData = JSON.parse(dataStr);
                } catch (e) {
                    characterData = null;
                }
            }
        }

        if (!characterData) {
            if (!skipAlert) await showMessage('没有找到保存的角色数据');
            return;
        }

        if (!characterData.basic) {
            await showMessage('保存的角色数据无效或为空');
            return;
        }

        // 重建技能表
        DOMCache.clear();
        rebuildSkillsContainer();

        // 加载各部分数据
        loadBasicInfo(characterData);
        loadAttributes(characterData);
        loadStatus(characterData);
        loadSkills(characterData);
        loadCombat(characterData);
        loadWeapons(characterData);
        loadItems(characterData);
        loadCustomSkills(characterData);
        loadNotes(characterData);
        loadGrowth(characterData);

        // 加载后刷新成长模块的显示（历史、点数输入框等）
        if (typeof Growth !== 'undefined') {
            Growth.loadState(); // 失效技能列表签名，确保重建
            Growth.initGrowthPointsInput();
            Growth.renderSkillList();
            Growth.renderHistory();
        }

        if (!skipAlert) {
            await showMessage('角色数据已从本地缓存加载');
        }
    } catch (error) {
        console.error('解析保存的数据时出错:', error);
        await showMessage('加载失败，请稍后再试。');
    }

    // 各 load 函数均为同步 DOM 操作，此处可直接同步重算，无需 setTimeout
    updatePointsRemaining();
    updateDerivedStats();
    updateTotalPoints();
}

// ---------- 加载辅助函数 ----------

/**
 * 重建技能容器（清空后重新初始化）
 */
function rebuildSkillsContainer() {
    const skillsContainer = document.querySelector('.skills-container');
    if (!skillsContainer) return;
    
    const parent = skillsContainer.parentNode;
    skillsContainer.remove();
    
    const newContainer = document.createElement('div');
    newContainer.className = 'skills-container';
    parent.appendChild(newContainer);
    
    initSkills();
}

/**
 * 加载基础信息
 */
function loadBasicInfo(data) {
    if (!data.basic) return;
    
    const setValue = (id, val) => {
        const el = DOMCache.get(id);
        if (el) el.value = val || '';
    };
    
    setValue('character-name', data.basic.characterName);
    setValue('player-name', data.basic.playerName);
    setValue('era', data.basic.era);
    setValue('occupation', data.basic.occupation);
    setValue('age', data.basic.age);
    setValue('gender', data.basic.gender);
    setValue('residence', data.basic.residence);
    setValue('birthplace', data.basic.birthplace);
    
    CharacterStore.setCharacterName(data.basic.characterName || '');

    const partner = DOMCache.get('is-partner');
    if (partner) partner.checked = data.basic.isPartner || false;

    // 恢复头像
    if (data.basic.avatar) {
        const avatarImg = document.getElementById('avatar-img');
        const avatarPlaceholder = document.querySelector('.avatar-placeholder');
        if (avatarImg) {
            avatarImg.src = data.basic.avatar;
            avatarImg.classList.add('is-visible');
        }
        if (avatarPlaceholder) avatarPlaceholder.classList.add('is-hidden');
    }
}

/**
 * 加载属性值
 */
function loadAttributes(data) {
    if (!data.attributes) return;
    
    Object.entries(data.attributes).forEach(([key, value]) => {
        const el = DOMCache.get(key);
        if (el) el.value = value;
    });
    
    CharacterStore.setAttributes(data.attributes);
}

/**
 * 加载状态值（理智/生命/魔法），兼容旧版 status/stats 格式
 */
function loadStatus(data) {
    const statusData = data.status || data.stats;
    if (!statusData) return;
    
    Object.entries(STATUS_MAPPINGS).forEach(([key, config]) => {
        if (!statusData[key]) return;
        const section = statusData[key];
        
        Object.entries(config.selectors).forEach(([field, selector]) => {
            const el = DOMCache.query(selector);
            if (el) {
                const defaultValue = config.defaults[field] || '';
                el.value = section[field] ?? defaultValue;
            }
        });
    });
}

/**
 * 加载技能数据
 */
function loadSkills(data) {
    if (!data.skills) return;
    
    // 设置技能点
    DOMCache.get('occupation-points').value = data.skills.occupationPoints || '0';
    DOMCache.get('interest-points').value = data.skills.interestPoints || '0';
    updatePointsRemaining();
    
    if (!data.skills.skillsList?.length) return;

    // rebuildSkillsContainer() 已重建技能列表，这里只需加载数据
    const normalSkills = data.skills.skillsList.filter(s => !s.isSubSkill);
    const subSkills = data.skills.skillsList.filter(s => s.isSubSkill);

    normalSkills.forEach(loadSingleSkill);
    subSkills.forEach(loadSubSkill);
}

/**
 * 加载单个常规技能
 */
function loadSingleSkill(skillData) {
    const skillElement = document.querySelector(`.skill-name span[data-skill="${skillData.name}"]`);
    if (!skillElement) {
        console.warn(`未找到技能: ${skillData.name}`);
        return;
    }
    
    const skillRow = skillElement.closest('.skill-row');
    setSkillRowData(skillRow, skillData);
}

/**
 * 加载子技能
 */
function loadSubSkill(skillData) {
    const parentSkills = document.querySelectorAll(`.skill-name span[data-skill="${skillData.parentSkill}"]`);
    
    parentSkills.forEach(parentSkill => {
        const parentRow = parentSkill.closest('.skill-row');
        const parentColumn = parentRow.closest('.skills-column');
        if (!parentColumn) return;
        
        const subRows = parentColumn.querySelectorAll('.sub-skill-row');
        const targetRow = findTargetSubRow(subRows, skillData);
        
        if (targetRow) {
            setSkillRowData(targetRow, skillData, true);
        }
    });
}

/**
 * 查找目标子技能行（通过子类型、索引或空子类型匹配）
 */
function findTargetSubRow(subRows, skillData) {
    // 1. 通过子类型匹配
    if (skillData.subtype) {
        for (const row of subRows) {
            const subtypeSpan = row.querySelector('.selected-subtype');
            if (subtypeSpan && subtypeSpan.textContent === skillData.subtype) {
                return row;
            }
        }
    }
    
    // 2. 通过索引匹配
    if (skillData.subSkillIndex) {
        const indexedRows = Array.from(subRows).filter(
            row => row.dataset.parentSkill === skillData.parentSkill
        );
        if (indexedRows.length >= skillData.subSkillIndex) {
            return indexedRows[skillData.subSkillIndex - 1];
        }
    }
    
    // 3. 查找空子类型行
    for (const row of subRows) {
        const subtypeSpan = row.querySelector('.selected-subtype');
        if (!subtypeSpan || !subtypeSpan.textContent.trim()) {
            return row;
        }
    }
    
    // 4. 返回第一个
    return subRows[0] || null;
}

/**
 * 设置技能行的数据
 */
function setSkillRowData(row, data, isSub = false) {
    const checkbox = row.querySelector('.skill-check');
    if (checkbox) checkbox.checked = data.checked || false;
    
    const baseInput = row.querySelector('.base-value');
    if (baseInput) {
        baseInput.value = data.actualBase || data.base || '0';
    }
    
    const occInput = row.querySelector('.occupation-points');
    if (occInput) occInput.value = data.occupation === '0' ? '' : (data.occupation || '');
    
    const intInput = row.querySelector('.interest-points');
    if (intInput) intInput.value = data.interest === '0' ? '' : (data.interest || '');
    
    const growthInput = row.querySelector('.growth-points');
    if (growthInput) growthInput.value = data.growth === '0' ? '' : (data.growth || '');
    
    if (data.subtype) {
        const subtypeElement = row.querySelector('.selected-subtype');
        if (subtypeElement) {
            subtypeElement.textContent = data.subtype;
            row.dataset.selectedSubtype = data.subtype;
        }
    }
    
    calculateSkillSuccess(row);
}

/**
 * 加载战斗属性
 */
function loadCombat(data) {
    if (!data.combat) return;
    
    DOMCache.get('damage-bonus').value = data.combat.damageBonus || '';
    DOMCache.get('spirit-bonus').value = data.combat.spiritBonus || '';
    DOMCache.get('build').value = data.combat.build || '';
    DOMCache.get('armor').value = data.combat.armor || '';
}

/**
 * 加载武器数据
 * 策略：复用 HTML 中已有的静态武器行，按顺序填充；不足时再追加新行。
 * 不再使用 innerHTML 清空重建，避免破坏静态 DOM 结构。
 */
function loadWeapons(data) {
    const weaponsTable = document.querySelector('.weapons-table');
    if (!weaponsTable) return;

    const weapons = data.weapons || [];
    const existingRows = weaponsTable.querySelectorAll('.weapon-row');

    // 填充已有行
    weapons.forEach((weaponData, index) => {
        const row = existingRows[index] || weaponsTable.appendChild(createWeaponRow());
        WEAPON_CELL_CONFIG.forEach(config => {
            const input = row.querySelector(`.${config.cls}`);
            if (input) input.value = weaponData[config.dataKey] || '';
        });
    });

    // 清空多余的静态行（保存数据少于现有行数时）
    for (let i = weapons.length; i < existingRows.length; i++) {
        WEAPON_CELL_CONFIG.forEach(config => {
            const input = existingRows[i].querySelector(`.${config.cls}`);
            if (input) input.value = '';
        });
    }

    // 确保至少 4 行
    const currentCount = weaponsTable.querySelectorAll('.weapon-row').length;
    for (let i = currentCount; i < 4; i++) {
        weaponsTable.appendChild(createWeaponRow());
    }

    applyWeaponRowColors();
}

/**
 * 创建武器行
 */
function createWeaponRow(data = {}) {
    const row = document.createElement('div');
    row.className = 'weapon-row';

    WEAPON_CELL_CONFIG.forEach(config => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'weapon-cell';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = config.cls;
        input.value = data[config.dataKey] || '';
        input.placeholder = config.placeholder;

        cellDiv.appendChild(input);
        row.appendChild(cellDiv);
    });

    return row;
}

/**
 * 加载物品数据
 */
function loadItems(data) {
    if (!data.items?.length) return;
    
    const itemsBody = DOMCache.get('items-body');
    if (!itemsBody) return;
    
    if (itemsBody.children.length === 0) {
        initItemsTable();
    }
    
    // 清除现有值
    itemsBody.querySelectorAll('input').forEach(input => {
        input.value = '';
        input.setAttribute('value', '');
    });
    
    data.items.forEach(item => {
        const itemIndex = getItemIndex(item);
        
        const nameInput = document.querySelector(`#items-body input.item-name[data-item-index="${itemIndex}"]`);
        const typeInput = document.querySelector(`#items-body input.item-type-input[data-item-index="${itemIndex}"]`);
        const noteInput = document.querySelector(`#items-body textarea.item-note[data-item-index="${itemIndex}"]`);
        
        if (nameInput) {
            nameInput.value = item.name || '';
            nameInput.setAttribute('value', item.name || '');
        }
        if (typeInput) {
            typeInput.value = item.type || '';
            typeInput.setAttribute('value', item.type || '');
        }
        if (noteInput) {
            noteInput.value = item.note || '';
            if (!noteInput.hasEventListener) {
                addNoteEvents(noteInput);
                noteInput.hasEventListener = true;
            }
        }
    });
}

/**
 * 获取物品索引
 */
function getItemIndex(item) {
    if (item.hasOwnProperty('itemIndex')) return item.itemIndex;
    if (item.hasOwnProperty('rowIndex')) return item.rowIndex * 2;
    return 0;
}

/**
 * 加载自定义技能数据（左右双栏）
 */
function loadCustomSkills(data) {
    if (!data.customSkills?.length) return;
    
    const body = DOMCache.get('custom-skills-body');
    if (body.children.length === 0) {
        initCustomSkillsTable();
    }
    
    const rows = document.querySelectorAll('#custom-skills-body tr');
    let leftIdx = 0, rightIdx = 0;
    
    data.customSkills.forEach(skill => {
        const rowIdx = skill.position === 'left' ? leftIdx++ : rightIdx++;
        if (rowIdx >= rows.length) return;
        
        const startCell = skill.position === 'left' ? 1 : 9;
        const row = rows[rowIdx];
        
        setCustomSkillCell(row, startCell, skill.name);
        setCustomSkillCell(row, startCell + 1, skill.base, '0');
        setCustomSkillCell(row, startCell + 2, skill.occupation, '0', true);
        setCustomSkillCell(row, startCell + 3, skill.interest, '0', true);
        setCustomSkillCell(row, startCell + 4, skill.growth, '0', true);
    });
    
    setupCustomSkills();
}

/**
 * 加载笔记数据（左右双栏）
 * 笔记优先填充左列，填满后再填充右列
 */
function loadNotes(data) {
    if (!data.notes?.length) return;
    
    const body = DOMCache.get('notes-body');
    if (body.children.length === 0) {
        initNotesTable();
    }
    
    const rows = document.querySelectorAll('#notes-body tr');
    const totalRows = rows.length;
    const DEFAULT_NOTE_NAMES = DEFAULT_NOTES.map(n => n.name);

    // 分离默认笔记和自定义笔记
    let defaultNotes = new Array(DEFAULT_NOTES.length).fill(null);
    let customNotes = [];

    data.notes.forEach(note => {
        const defaultIndex = DEFAULT_NOTE_NAMES.indexOf(note.name);
        if (defaultIndex !== -1 && note.type === '其他') {
            defaultNotes[defaultIndex] = note;
        } else {
            customNotes.push(note);
        }
    });

    // 填充默认笔记（只恢复备注），位置由 DEFAULT_NOTE_POSITIONS 定义（均为左列）
    for (let i = 0; i < DEFAULT_NOTES.length; i++) {
        const globalPosition = DEFAULT_NOTE_POSITIONS[i];
        const rowIndex = Math.floor(globalPosition / 2);
        
        if (rowIndex >= totalRows) break;
        
        const startCell = 1; // 左列
        const row = rows[rowIndex];
        
        if (!row) continue;
        
        const noteInput = row.querySelector(`td:nth-child(${startCell + 2}) .item-note`);
        if (noteInput && defaultNotes[i]) {
            noteInput.value = defaultNotes[i].note || '';
        }
    }
    
    // 填充自定义笔记（只使用左列偶数位置，跳过默认位置，从位置 6 开始）
    let customIdx = 0;
    for (let globalPos = 0; customIdx < customNotes.length; globalPos += 2) {
        if (DEFAULT_NOTE_POSITIONS.includes(globalPos)) continue;
        if (globalPos >= totalRows * 2) break;
        
        const note = customNotes[customIdx];
        const rowIndex = Math.floor(globalPos / 2);
        
        if (rowIndex >= rows.length) break;
        
        const startCell = 1; // 左列
        const row = rows[rowIndex];
        
        const nameInput = row.querySelector(`td:nth-child(${startCell}) .item-name`);
        const typeInput = row.querySelector(`td:nth-child(${startCell + 1}) .item-type-input`);
        const noteInput = row.querySelector(`td:nth-child(${startCell + 2}) .item-note`);
        
        if (nameInput) {
            nameInput.value = note.name || '';
            nameInput.setAttribute('value', note.name || '');
            nameInput.readOnly = false;
            nameInput.classList.remove('default-note');
        }
        if (typeInput) {
            typeInput.value = note.type || '';
            typeInput.setAttribute('value', note.type || '');
            typeInput.classList.remove('default-note');
        }
        if (noteInput) {
            noteInput.value = note.note || '';
        }
        
        customIdx++;
    }
}

/**
 * 设置自定义技能单元格
 */
function setCustomSkillCell(row, cellIndex, value, emptyVal = '', isToggle = false) {
    const input = row.querySelector(`td:nth-child(${cellIndex}) input`);
    if (!input) return;
    
    if (isToggle && value === '0') {
        input.value = '';
    } else {
        input.value = value || emptyVal;
    }
}
