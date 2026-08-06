/**
 * UI模块 - 界面初始化和交互
 * 依赖：core.js, calc.js
 */

// 初始化属性（使用发布-订阅模式）
function initAttributes() {
    // 使用事件委托，在父容器上监听所有属性输入
    const container = DOMCache.query('.characteristics-grid') || document;
    
    container.addEventListener('input', function(e) {
        if (e.target.classList.contains('char-value')) {
            const input = e.target;
            const value = parseInt(input.value) || 0;
            
            // 更新 Store 中的属性值（会自动发布事件触发衍生计算）
            CharacterStore.setAttribute(input.id, value);
            
            // 更新总点数
            updateTotalPoints();
        }
    });
    
    // 初始化时更新一次衍生属性
    updateDerivedStats();
}

// 初始化武器区域 - 适配静态武器行
function initWeapons() {
    // 由于已经在HTML中有静态的四行武器输入，不需要动态生成
    // 只需确保背景色正确应用
    applyWeaponRowColors();
}

// 清除武器行可能残留的内联背景色，交替色由 CSS :nth-child 提供
function applyWeaponRowColors() {
    const weaponsTable = document.querySelector('.weapons-table');
    weaponsTable?.querySelectorAll('.weapon-row').forEach(row => {
        row.style.backgroundColor = '';
    });
}

// 初始化头像上传
function initAvatarUpload() {
    try {
        const avatarContainer = document.getElementById('avatar-container');
        const avatarUpload = document.getElementById('avatar-upload');
        const avatarImg = document.getElementById('avatar-img');
        
        avatarContainer.addEventListener('click', function() {
            avatarUpload.click();
        });
        
        // 添加AI绘制头像链接的点击事件，阻止冒泡
        const aiDrawLink = document.querySelector('.ai-draw-link');
        if (aiDrawLink) {
            aiDrawLink.addEventListener('click', function(event) {
                // 阻止事件冒泡，避免触发avatarContainer的点击事件
                event.stopPropagation();
            });
        }
        
        avatarUpload.addEventListener('change', function(event) {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = function(e) {
                    // 创建临时图像对象
                    const img = new Image();
                    img.onload = function() {
                        // 保存尺寸（与显示尺寸解耦，保留打印清晰度）
                        // 1024×1024 JPEG 0.92 实测 80-655KB，低于 1MB 上限
                        const saveWidth = 1024;
                        const saveHeight = 1024;

                        // 创建Canvas进行尺寸调整
                        const canvas = document.createElement('canvas');
                        canvas.width = saveWidth;
                        canvas.height = saveHeight;
                        const ctx = canvas.getContext('2d');

                        // 计算缩放和居中（contain 模式，白底填充）
                        let scale = Math.min(saveWidth / img.width, saveHeight / img.height);
                        let x = (saveWidth - img.width * scale) / 2;
                        let y = (saveHeight - img.height * scale) / 2;

                        // 绘制图像
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                        // 转换为图像数据
                        const resizedImageData = canvas.toDataURL('image/jpeg', 0.92);

                        // 设置头像
                        avatarImg.src = resizedImageData;
                        avatarImg.classList.add('is-visible');
                        document.querySelector('.avatar-placeholder').classList.add('is-hidden');
                    };

                    // 加载原始图像
                    img.src = e.target.result;
                };

                reader.readAsDataURL(file);
            }
        });
    } catch (error) {
        console.error('Error initializing avatar upload:', error);
    }
}

// 初始化编辑模态框（一次性绑定，避免在每次点击备注时重复绑定）
let editModalInitialized = false;
function initEditModalOnce() {
    if (editModalInitialized) return;
    const editModal = document.getElementById('edit-modal');
    if (!editModal) return;
    // 点击模态框外部关闭（只绑定一次）
    editModal.addEventListener('click', function(event) {
        if (event.target === editModal) {
            editModal.classList.remove('active');
        }
    });
    editModalInitialized = true;
}

// 初始化重置和帮助按钮
function initResetAndHelp() {
    // 重置按钮点击事件（使用自定义确认弹窗）
    document.getElementById('reset-button').addEventListener('click', async function() {
        const confirmed = await showConfirm('确定要重置所有数据吗？此操作不可撤销。', '重置确认');
        if (confirmed) {
            localStorage.removeItem('characterData');
            window.location.reload();
        }
    });

    // 帮助内容（静态文本，无用户数据，可安全使用 innerHTML）
    const HELP_HTML = `
        <h3>【基本操作】</h3>
        <ul>
            <li>填写角色基本信息（姓名、职业、年代等）</li>
            <li>输入角色各项属性值（力量、体质、体型、敏捷等）</li>
            <li>分配职业点数和兴趣点数到相应技能</li>
            <li>输入成长点数用于已成长的技能</li>
        </ul>

        <h3>【多页面说明】</h3>
        <ul>
            <li><b>主页面</b>：角色基本信息、属性、技能、战斗属性、状态值、武器</li>
            <li><b>自定义技能</b>：添加6个自定义技能（左列3个+右列3个）</li>
            <li><b>道具</b>：记录角色携带的20种道具</li>
            <li><b>笔记</b>：固定前三项为贡献、幕间、修炼，其余为自定义笔记</li>
            <li><b>幕间成长</b>：消耗成长点数进行技能成长检定</li>
        </ul>

        <h3>【数据管理】</h3>
        <ul>
            <li><b>保存</b>：将角色数据保存到本地浏览器缓存</li>
            <li><b>导出</b>：将角色数据导出为JSON文件（选择保存路径）</li>
            <li><b>导入</b>：从JSON文件加载角色数据（导入前会显示确认提示）</li>
            <li><b>重置</b>：清空所有数据并重新开始</li>
        </ul>

        <h3>【幕间成长规则】</h3>
        <ul>
            <li>投入成长点数后，选择技能进行D100检定</li>
            <li>检定规则：投出值 > 当前技能值 即为成功</li>
            <li>成长值根据当前技能值决定：1-29→1d10，30-49→1d8，50-69→1d6，70-89→1d4，90+→1d3</li>
            <li>投出100时获得双倍成长值</li>
            <li>技能值>95时，投出96-100总能成长</li>
            <li>每次检定消耗1点成长点数，一次性完成所有点数的掷骰结算</li>
            <li>信用评级和克苏鲁神话不参与成长</li>
        </ul>

        <h3>【打印功能】</h3>
        <ul>
            <li>点击"打印角色卡"按钮可打开打印对话框</li>
            <li>支持打印主页面和自定义技能页</li>
            <li>打印时会自动优化格式以适应A4纸张</li>
            <li>建议使用Chrome/Edge浏览器获得最佳打印效果</li>
        </ul>

        <h3>【注意事项】</h3>
        <ul>
            <li>笔记前三项（贡献、幕间、修炼）名称和类型固定，仅可编辑备注</li>
            <li>自定义技能的子技能类型可在技能页选择</li>
            <li>导入数据会覆盖当前所有内容，请谨慎操作</li>
        </ul>

        <p class="credits">Design by 龙王 jumper.rong@outlook.com<br>大胡子跑团版权所有</p>
    `;

    // 帮助模态框关闭逻辑（一次性绑定，避免在 help-button 点击时重复绑定）
    const helpModal = document.getElementById('help-modal');
    const closeHelpBtn = document.getElementById('close-help');
    if (closeHelpBtn) {
        closeHelpBtn.addEventListener('click', function() {
            helpModal.classList.remove('active');
        });
    }
    if (helpModal) {
        helpModal.addEventListener('click', function(event) {
            if (event.target === helpModal) {
                helpModal.classList.remove('active');
            }
        });
    }

    // 帮助按钮点击事件（只负责填充内容和显示）
    document.getElementById('help-button').addEventListener('click', function() {
        const helpModalBody = document.getElementById('help-modal-body');
        helpModalBody.innerHTML = HELP_HTML;
        helpModal.classList.add('active');
    });
}

// 计算单个技能行的总值和成功率（自定义技能，与默认技能共用 computeSkillTotals）
function calculateSkillRow(row) {
    const inputs = {
        base: row.querySelector('.skill-base'),
        occupation: row.querySelector('.skill-occupation'),
        interest: row.querySelector('.skill-interest'),
        growth: row.querySelector('.skill-growth'),
        total: row.querySelector('.skill-total'),
        half: row.querySelector('.skill-half'),
        fifth: row.querySelector('.skill-fifth')
    };

    if (!inputs.base || !inputs.total) return;

    const base = parseInt(inputs.base.value) || 0;
    const occupation = parseInt(inputs.occupation?.value) || 0;
    const interest = parseInt(inputs.interest?.value) || 0;
    const growth = parseInt(inputs.growth?.value) || 0;

    const { total, half, fifth } = computeSkillTotals(base, occupation, interest, growth);
    inputs.total.value = total;

    if (inputs.half) inputs.half.value = half;
    if (inputs.fifth) inputs.fifth.value = fifth;
}

// 设置自定义技能功能
function setupCustomSkills() {
    const customSkillsContainer = document.querySelector('#custom-skills .custom-skills-container');
    if (!customSkillsContainer) {
        console.error('未找到自定义技能容器');
        return;
    }
    
    // 监听输入变化以计算总值
    customSkillsContainer.addEventListener('input', function(e) {
        const target = e.target;
        if (target.classList.contains('skill-occupation') || 
            target.classList.contains('skill-interest') || 
            target.classList.contains('skill-growth')) {
            const row = target.closest('tr');
            if (row) calculateSkillRow(row);
        }
    });

    // 初始化所有技能的总值
    const allRows = customSkillsContainer.querySelectorAll('tr');
    allRows.forEach(row => {
        if (row.querySelector('.skill-name')) {
            calculateSkillRow(row);
        }
    });
}

// 添加自定义技能行
function addCustomSkillRow() {
    const skillsGrid = document.querySelector('.custom-skills-container .skills-grid');
    const addButtonRow = document.querySelector('.add-skill-row');
    
    if (skillsGrid && addButtonRow) {
        // 创建新的技能行
        const newRow = document.createElement('div');
        newRow.className = 'skill-row';
        newRow.innerHTML = `
            <div class="skill-item">
                <input type="text" class="skill-name" placeholder="技能名称">
                <div class="skill-values">
                    <input type="text" class="skill-base" value="0" readonly>
                    <input type="text" class="skill-occupation" value="0">
                    <input type="text" class="skill-interest" value="0">
                    <input type="text" class="skill-growth" value="0">
                    <input type="text" class="skill-total" value="0" readonly>
                </div>
            </div>
            <div class="skill-item">
                <input type="text" class="skill-name" placeholder="技能名称">
                <div class="skill-values">
                    <input type="text" class="skill-base" value="0" readonly>
                    <input type="text" class="skill-occupation" value="0">
                    <input type="text" class="skill-interest" value="0">
                    <input type="text" class="skill-growth" value="0">
                    <input type="text" class="skill-total" value="0" readonly>
                </div>
            </div>
        `;
        
        // 在添加按钮行之前插入新行
        skillsGrid.insertBefore(newRow, addButtonRow);
    }
}

// 初始化自定义技能表
function initCustomSkillsTable() {
    const customSkillsBody = document.getElementById('custom-skills-body');
    if (!customSkillsBody) return;
    
    // 清空现有内容
    customSkillsBody.innerHTML = '';
    
    // 总共生成43行，每行两个技能项
    const totalRows = 43;
    
    for (let i = 0; i < totalRows; i++) {
        const row = document.createElement('tr');
        row.className = i % 2 === 0 ? 'even-row' : 'odd-row';
        
        // 创建左侧技能项
        const leftTds = createCustomSkillItem();
        leftTds.forEach(td => row.appendChild(td));
        
        // 创建右侧技能项
        const rightTds = createCustomSkillItem();
        rightTds.forEach(td => row.appendChild(td));
        
        customSkillsBody.appendChild(row);
    }
}

// 创建自定义技能项
function createCustomSkillItem() {
    const tds = [];
    
    // 技能名称
    const nameTd = document.createElement('td');
    nameTd.className = 'col-name';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'skill-name';
    nameInput.placeholder = '技能名称';
    nameTd.appendChild(nameInput);
    tds.push(nameTd);
    
    // 基础值
    const baseTd = document.createElement('td');
    const baseInput = document.createElement('input');
    baseInput.type = 'text';
    baseInput.className = 'skill-base';
    baseInput.value = '0';
    baseTd.appendChild(baseInput);
    tds.push(baseTd);
    
    // 职业点数
    const occTd = document.createElement('td');
    const occInput = document.createElement('input');
    occInput.type = 'text';
    occInput.className = 'skill-occupation';
    occTd.appendChild(occInput);
    tds.push(occTd);
    
    // 兴趣点数
    const intTd = document.createElement('td');
    const intInput = document.createElement('input');
    intInput.type = 'text';
    intInput.className = 'skill-interest';
    intTd.appendChild(intInput);
    tds.push(intTd);
    
    // 成长点数
    const growthTd = document.createElement('td');
    const growthInput = document.createElement('input');
    growthInput.type = 'text';
    growthInput.className = 'skill-growth';
    growthTd.appendChild(growthInput);
    tds.push(growthTd);
    
    // 总值（只读）
    const totalTd = document.createElement('td');
    const totalInput = document.createElement('input');
    totalInput.type = 'text';
    totalInput.className = 'skill-total';
    totalInput.value = '0';
    totalInput.readOnly = true;
    totalTd.appendChild(totalInput);
    tds.push(totalTd);
    
    // 困难成功值（只读）
    const halfTd = document.createElement('td');
    const halfInput = document.createElement('input');
    halfInput.type = 'text';
    halfInput.className = 'skill-half';
    halfInput.value = '0';
    halfInput.readOnly = true;
    halfTd.appendChild(halfInput);
    tds.push(halfTd);
    
    // 极难成功值（只读）
    const fifthTd = document.createElement('td');
    const fifthInput = document.createElement('input');
    fifthInput.type = 'text';
    fifthInput.className = 'skill-fifth';
    fifthInput.value = '0';
    fifthInput.readOnly = true;
    fifthTd.appendChild(fifthInput);
    tds.push(fifthTd);
    
    // 添加事件监听器 - 使用事件委托模式
    [baseInput, occInput, intInput, growthInput].forEach(input => {
        if (input.hasAttributedEvent) return;
        
        input.addEventListener('input', function() {
            const base = parseInt(baseInput.value) || 0;
            const occ = parseInt(occInput.value) || 0;
            const int = parseInt(intInput.value) || 0;
            const growth = parseInt(growthInput.value) || 0;
            
            const total = base + occ + int + growth;
            totalInput.value = total;
            halfInput.value = Math.floor(total / 2);
            fifthInput.value = Math.floor(total / 5);
        });
        
        input.hasAttributedEvent = true;
    });
    
    return tds;
}

// 初始化道具表（性能优化版：使用事件委托）
function initItemsTable() {
    const itemsBody = $.itemsBody || DOMCache.get('items-body');
    if (!itemsBody) return;
    
    // 清空现有内容
    itemsBody.innerHTML = '';
    
    // 总共生成40行，每行显示两个道具（总计80个道具项）
    const totalRows = 40;
    
    for (let i = 0; i < totalRows; i++) {
        const row = document.createElement('tr');
        row.className = i % 2 === 0 ? 'even-row' : 'odd-row';
        
        // 创建左侧道具项
        createItemCells(row, i * 2); // 左侧道具索引为 i*2
        
        // 创建右侧道具项
        createItemCells(row, i * 2 + 1); // 右侧道具索引为 i*2+1
        
        itemsBody.appendChild(row);
    }
    
    // 使用事件委托，在itemsBody上统一处理所有输入事件（防止重复绑定）
    if (!itemsBody._delegatedEvents) {
        itemsBody.addEventListener('input', function(e) {
            if (e.target.tagName === 'INPUT') {
                e.target.setAttribute('value', e.target.value);
            }
        });
        itemsBody._delegatedEvents = true;
    }
    
    // 使道具表缓存失效
    DOMCache.invalidateByPrefix('qa:.item');
}

// 创建单个道具项的单元格（名称、类型、备注）
function createItemCells(row, itemIndex) {
    // 道具名称
    const nameCell = document.createElement('td');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'item-name';
    nameInput.placeholder = '道具名称'; // 移除序号显示，使用原始提示文本
    nameInput.dataset.itemIndex = itemIndex; // 添加索引属性，用于保存/加载（仅后台使用）
    nameInput.setAttribute('value', ''); // 设置默认value属性为空字符串
    nameCell.appendChild(nameInput);
    row.appendChild(nameCell);
    
    // 道具类型
    const typeCell = document.createElement('td');
    typeCell.className = 'item-type';
    const typeInput = document.createElement('input');
    typeInput.type = 'text';
    typeInput.className = 'item-type-input';
    typeInput.placeholder = '点击选择';
    typeInput.readOnly = true;
    typeInput.dataset.itemIndex = itemIndex; // 添加索引属性
    typeInput.setAttribute('value', ''); // 设置默认value属性为空字符串
    typeCell.appendChild(typeInput);
    row.appendChild(typeCell);
    
    // 备注/说明（样式由 .item-note 提供）
    const noteCell = document.createElement('td');
    const noteInput = document.createElement('textarea');
    noteInput.className = 'item-note';
    noteInput.placeholder = '备注/说明';
    noteInput.dataset.itemIndex = itemIndex; // 添加索引属性
    noteCell.appendChild(noteInput);
    row.appendChild(noteCell);
    
    // 添加点击事件，打开类型选择模态框
    typeCell.addEventListener('click', function() {
        openItemTypeModal(typeInput);
    });
    
    // 添加备注框的悬停和点击事件
    addNoteEvents(noteInput);
    // 标记已添加事件监听器
    noteInput.hasEventListener = true;
}

// 为备注框添加事件
// 所有备注框共享同一个全局 tooltip 元素，避免 DOM 膨胀（原本 160+ 个 tooltip 节点）。
let _sharedNoteTooltip = null;
function getSharedNoteTooltip() {
    if (!_sharedNoteTooltip) {
        _sharedNoteTooltip = document.createElement('div');
        _sharedNoteTooltip.className = 'tooltip';
        _sharedNoteTooltip.style.display = 'none';
        document.body.appendChild(_sharedNoteTooltip);
    }
    return _sharedNoteTooltip;
}

function addNoteEvents(noteInput) {
    // 如果已经添加过事件，就不再添加
    if (noteInput.hasEventListener) {
        return;
    }

    const tooltip = getSharedNoteTooltip();

    // 悬停时显示tooltip
    noteInput.addEventListener('mouseenter', function(e) {
        tooltip.textContent = this.value;
        const rect = this.getBoundingClientRect();

        // 检查是否为右侧备注框
        const isRightColumn = this.closest('td').cellIndex > 3;

        // 调整tooltip位置
        if (isRightColumn) {
            // 右侧备注框的tooltip显示在左侧，按 tooltip 实际宽度定位
            tooltip.style.display = 'block';
            const tipWidth = tooltip.offsetWidth;
            tooltip.style.left = `${Math.max(10, rect.left + window.scrollX - tipWidth - 10)}px`;
        } else {
            // 左侧备注框的tooltip显示在右侧
            tooltip.style.left = `${rect.right + window.scrollX + 10}px`;
        }

        tooltip.style.top = `${rect.top + window.scrollY}px`;
        tooltip.style.display = 'block';
    });

    // 移出时隐藏tooltip
    noteInput.addEventListener('mouseleave', function() {
        tooltip.style.display = 'none';
    });

    // 点击时弹出编辑窗口
    noteInput.addEventListener('click', function() {
        // 确保先隐藏tooltip，防止打印时出现黑色块
        tooltip.style.display = 'none';

        const editModal = document.getElementById('edit-modal');
        const editTextarea = document.getElementById('edit-textarea');
        const saveButton = document.getElementById('save-edit');
        const cancelButton = document.getElementById('cancel-edit');

        // 一次性绑定点击外部关闭事件（避免重复绑定）
        initEditModalOnce();

        // 设置当前备注内容到编辑框
        editTextarea.value = noteInput.value;

        // 显示编辑模态框
        editModal.classList.add('active');

        // 保存按钮事件（用 onclick 覆盖式赋值，绑定最新的目标备注框）
        saveButton.onclick = function() {
            noteInput.value = editTextarea.value;
            editModal.classList.remove('active');
            saveCharacter(false);
        };

        // 取消按钮事件
        cancelButton.onclick = function() {
            editModal.classList.remove('active');
        };
    });

    // 标记已添加事件监听器
    noteInput.hasEventListener = true;
}

// 道具类型选择模态框
function openItemTypeModal(typeInput) {
    // 检查是否已存在模态框，如果存在则移除
    let modal = document.getElementById('item-type-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
    
    // 创建模态框
    modal = document.createElement('div');
    modal.id = 'item-type-modal';
    modal.className = 'subtype-modal active';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'subtype-modal-content';
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'subtype-modal-header';
    const headerTitle = document.createElement('h2');
    headerTitle.textContent = '选择道具类型';
    modalHeader.appendChild(headerTitle);
    
    const modalBody = document.createElement('div');
    modalBody.className = 'subtype-modal-body';
    
    // 类型列表
    const typeList = document.createElement('ul');
    typeList.className = 'subtype-list';
    
    // 类型数据
    const typeData = [
        { category: '装备', subtypes: ['头部', '肩部', '背部', '胸部', '手部', '腿部', '脚部', '饰品'] },
        { category: '常驻道具', subtypes: ['常驻道具'] },
        { category: '消耗道具', subtypes: ['消耗道具'] }
    ];
    
    // 添加类型选项
    typeData.forEach(category => {
        const categoryHeader = document.createElement('li');
        categoryHeader.className = 'subtype-category';
        categoryHeader.textContent = category.category;
        typeList.appendChild(categoryHeader);
        
        category.subtypes.forEach(subtype => {
            const typeItem = document.createElement('li');
            typeItem.className = 'subtype-item';
            typeItem.textContent = subtype;
            typeItem.addEventListener('click', function() {
                typeInput.value = subtype;
                document.body.removeChild(modal);
            });
            typeList.appendChild(typeItem);
        });
    });
    
    modalBody.appendChild(typeList);
    
    const modalFooter = document.createElement('div');
    modalFooter.className = 'subtype-modal-footer';
    const cancelButton = document.createElement('button');
    cancelButton.className = 'subtype-modal-button';
    cancelButton.textContent = '取消';
    cancelButton.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    modalFooter.appendChild(cancelButton);
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modal.appendChild(modalContent);
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    document.body.appendChild(modal);
}

// 统一创建单元格函数
function createNoteCells(row, noteIndex, defaults = {}) {
    const isDefault = defaults.isDefault === true;
    
    // 第一列：笔记名称
    const nameCell = document.createElement('td');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'item-name';
    nameInput.placeholder = '未命名';
    if (defaults.name) {
        nameInput.value = defaults.name;
        nameInput.setAttribute('value', defaults.name);
    }
    if (isDefault) {
        nameInput.readOnly = true;
        nameInput.classList.add('default-note');
    }
    nameCell.appendChild(nameInput);
    row.appendChild(nameCell);

    // 第二列：笔记类别
    const typeCell = document.createElement('td');
    typeCell.className = 'item-type';
    const typeInput = document.createElement('input');
    typeInput.type = 'text';
    typeInput.className = 'item-type-input';
    typeInput.placeholder = '点击选择';
    typeInput.readOnly = true;
    if (defaults.type) {
        typeInput.value = defaults.type;
        typeInput.setAttribute('value', defaults.type);
    }
    if (isDefault) {
        typeInput.classList.add('default-note');
    }
    typeCell.appendChild(typeInput);
    
    if (!isDefault) {
        // 只有非默认笔记才可点击修改类型
        typeCell.addEventListener('click', function() {
            openNoteTypeModal(typeInput);
        });
    }
    row.appendChild(typeCell);

    // 第三列：备注
    const noteCell = document.createElement('td');
    const noteTextarea = document.createElement('textarea');
    noteTextarea.className = 'item-note';
    noteTextarea.placeholder = '备注';
    noteTextarea.rows = 1;
    noteCell.appendChild(noteTextarea);
    row.appendChild(noteCell);

    // 立即添加备注事件监听
    addNoteEvents(noteTextarea);

    return row;
}

// 统一初始化笔记表格函数（性能优化版：使用事件委托）
function initNotesTable() {
    const itemsBody = $.notesBody || DOMCache.get('notes-body');
    if (!itemsBody) return;
    
    itemsBody.innerHTML = '';
    
    const totalRows = 40;
    
    // 默认笔记配置使用全局常量 DEFAULT_NOTES / DEFAULT_NOTE_POSITIONS
    // 默认笔记位置映射：全局位置 -> 默认笔记索引
    const defaultPositionMap = {};
    DEFAULT_NOTES.forEach((n, i) => { defaultPositionMap[n.globalPos] = i; });
    
    for (let i = 0; i < totalRows; i++) {
        const row = document.createElement('tr');
        row.className = i % 2 === 0 ? 'even-row' : 'odd-row';
        
        // 左栏 - 全局位置 i * 2
        const leftGlobalIndex = i * 2;
        const leftDefaults = defaultPositionMap[leftGlobalIndex] !== undefined
            ? { ...DEFAULT_NOTES[defaultPositionMap[leftGlobalIndex]], isDefault: true }
            : {};
        createNoteCells(row, leftGlobalIndex, leftDefaults);
        
        // 右栏 - 全局位置 i * 2 + 1
        const rightGlobalIndex = i * 2 + 1;
        createNoteCells(row, rightGlobalIndex, {});
        
        itemsBody.appendChild(row);
    }

    // 使用事件委托，在notes-body上统一处理所有输入事件
    if (!itemsBody._delegatedEvents) {
        itemsBody.addEventListener('input', function(e) {
            if (e.target.classList.contains('item-note')) {
                e.target.setAttribute('value', e.target.value);
            }
        });
        
        itemsBody._delegatedEvents = true;
    }
    
    // 使笔记表缓存失效
    DOMCache.invalidateByPrefix('qa:.note');
}

// 新增笔记类型选择弹窗
function openNoteTypeModal(typeInput) {
    // 移除旧的模态框
    const oldModal = document.getElementById('note-type-modal');
    if (oldModal) {
        document.body.removeChild(oldModal);
    }

    const modal = document.createElement('div');
    modal.id = 'note-type-modal';
    modal.className = 'subtype-modal active'; // 直接添加active类

    // 创建模态框内容
    modal.innerHTML = `
        <div class="subtype-modal-content">
            <div class="subtype-modal-header">
                <h2>选择笔记类型</h2>
            </div>
            <div class="subtype-modal-body">
                <div class="subtype-list">
                    <div class="subtype-item" data-type="冒险">冒险</div>
                    <div class="subtype-item" data-type="人物">人物</div>
                    <div class="subtype-item" data-type="功法">功法</div>
                    <div class="subtype-item" data-type="强化">强化</div>
                    <div class="subtype-item" data-type="待办">待办</div>
                    <div class="subtype-item" data-type="其他">其他</div>
                </div>
            </div>
            <div class="subtype-modal-footer">
                <button class="subtype-modal-button" id="close-note-type-modal">取消</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 添加类型选择事件
    const subtypeItems = modal.querySelectorAll('.subtype-item');
    subtypeItems.forEach(item => {
        item.addEventListener('click', function() {
            const selectedType = this.getAttribute('data-type');
            typeInput.value = selectedType;
            typeInput.setAttribute('value', selectedType); // 确保属性更新
            document.body.removeChild(modal);
            // 保存更改
            saveCharacter(false);
        });
    });

    // 添加关闭按钮事件
    const closeButton = modal.querySelector('#close-note-type-modal');
    closeButton.addEventListener('click', function() {
        document.body.removeChild(modal);
    });

    // 点击模态框外部关闭
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Tab切换功能
function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // 隐藏所有tab-content，移除所有tab的active类
    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // 激活目标tab和对应的content
    const targetTab = document.querySelector(`.tab[data-tab="${tabId}"]`);
    const targetContent = document.getElementById(tabId);
    
    if (targetTab) targetTab.classList.add('active');
    if (targetContent) targetContent.classList.add('active');
    
    // 检查是否切换到笔记页
    if (tabId === 'notes') {
        const notesBody = document.getElementById('notes-body');
        if (notesBody && notesBody.children.length < 2) {
            initNotesTable();
        }
    }
    
    // 检查是否切换到成长页
    if (tabId === 'growth' && typeof Growth !== 'undefined') {
        Growth.onTabActivate();
    }
}