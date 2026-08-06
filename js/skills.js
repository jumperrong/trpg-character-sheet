/**
 * 技能模块 - 技能表创建和管理
 * 依赖：core.js, calc.js
 */

// 初始化技能（性能优化版：使用事件委托）
function initSkills() {
    try {
        // 使用缓存绑定技能点数监听
        if ($.occupationPoints) {
            $.occupationPoints.addEventListener('input', function() {
                validateNonNegativeInt(this);
                updatePointsRemaining();
            });
        }
        
        if ($.interestPoints) {
            $.interestPoints.addEventListener('input', function() {
                validateNonNegativeInt(this);
                updatePointsRemaining();
            });
        }
        
        // 创建技能表头
        createSkillsHeader();
        
        // 创建技能列表
        createSkillsList();
        
        // 初始更新点数剩余
        updatePointsRemaining();

        // 飞行器基础值已由 skillsData 中 base:1 提供，无需运行时补丁
    } catch (error) {
        console.error('Error initializing skills:', error);
    }
}

// 创建技能表头
function createSkillsHeader() {
    try {
        const skillsContainer = document.querySelector('.skills-container');
        
        // 创建表头容器
        const headerContainer = document.createElement('div');
        headerContainer.className = 'skills-header';
        
        // 创建左列表头
        const leftHeader = document.createElement('div');
        leftHeader.className = 'skills-header-column half';

        // 创建右列表头
        const rightHeader = document.createElement('div');
        rightHeader.className = 'skills-header-column half';
        
        // 创建表头项
        const headerItems = [
            '技能名称', '基础', '职业', '兴趣', '成长', '常规', '困难', '极难'
        ];
        
        // 添加左列表头项
        headerItems.forEach(itemText => {
            const headerItem = document.createElement('div');
            headerItem.className = 'skills-header-item';
            headerItem.textContent = itemText;
            leftHeader.appendChild(headerItem);
        });
        
        // 添加右列表头项
        headerItems.forEach(itemText => {
            const headerItem = document.createElement('div');
            headerItem.className = 'skills-header-item';
            headerItem.textContent = itemText;
            rightHeader.appendChild(headerItem);
        });
        
        // 将左右列表头添加到表头容器
        headerContainer.appendChild(leftHeader);
        headerContainer.appendChild(rightHeader);
        
        // 将表头添加到技能容器
        skillsContainer.appendChild(headerContainer);
    } catch (error) {
        console.error('Error creating skills header:', error);
    }
}

// 创建技能列表
function createSkillsList() {
    try {
        const skillsContainer = document.querySelector('.skills-container');
        
        // 创建表格容器
        const skillsTable = document.createElement('div');
        skillsTable.className = 'skills-table';
        skillsContainer.appendChild(skillsTable);
        
        // 创建左右两列容器（样式由 .skills-column 提供）
        const leftColumn = document.createElement('div');
        leftColumn.className = 'skills-column left-column';

        const rightColumn = document.createElement('div');
        rightColumn.className = 'skills-column right-column';
        
        // 创建所有技能行的数组
        const allSkills = [];
        
        // 处理技能数据 - 考虑rows属性
        skillsData.forEach(skill => {
            // 检查是否有rows属性
            if (skill.subtypes && skill.rows && skill.rows > 1) {
                // 为第一行添加主技能，标记为有子技能的父技能
                const parentSkill = {...skill, isParentWithSubSkills: true};
                allSkills.push(parentSkill);
                
                // 为剩余的行添加占位符技能
                for (let i = 1; i < skill.rows; i++) {
                    allSkills.push({
                        name: `${skill.name}子技能${i}`, // 更清晰的命名
                        base: skill.base,
                        isSubSkillRow: true,
                        parentSkill: skill.name,
                        subSkillIndex: i, // 添加子技能索引，标识这是第几个子技能行
                        subtypes: skill.subtypes // 继承父技能的子类型列表
                    });
                }
            } else {
                // 常规技能或只有一行的技能
                allSkills.push(skill);
            }
        });
        
        // 计算每列应包含的技能数
        const totalSkills = allSkills.length;
        const skillsPerColumn = Math.ceil(totalSkills / 2);
        
        // 将技能分配到左右两列
        allSkills.forEach((skill, index) => {
            if (index < skillsPerColumn) {
                // 左列技能
                createSingleSkill(leftColumn, skill);
            } else {
                // 右列技能
                createSingleSkill(rightColumn, skill);
            }
        });
        
        // 将左右列添加到技能表中
        skillsTable.appendChild(leftColumn);
        skillsTable.appendChild(rightColumn);
        
        // ===== 事件委托：在技能容器上统一处理所有技能输入事件 =====
        if (skillsContainer && !skillsContainer._delegatedInputEvents) {
            skillsContainer.addEventListener('input', function(e) {
                const target = e.target;
                const skillRow = target.closest('.skill-row');
                if (!skillRow) return;
                
                // 基础值输入
                if (target.classList.contains('base-value')) {
                    validateNonNegativeInt(target);
                    calculateSkillSuccess(skillRow);
                }
                // 职业/兴趣点数输入
                else if (target.classList.contains('occupation-points') || target.classList.contains('interest-points')) {
                    validateNonNegativeInt(target);
                    updatePointsRemaining();
                    calculateSkillSuccess(skillRow);
                }
                // 成长点数输入
                else if (target.classList.contains('growth-points')) {
                    validateNonNegativeInt(target);
                    calculateSkillSuccess(skillRow);
                }
            });
            skillsContainer._delegatedInputEvents = true;
        }
        
        // 使缓存失效（技能表重建）
        DOMCache.invalidateByPrefix('qa:');
        
    } catch (error) {
        console.error('Error creating skills list:', error);
    }
}

// 创建单个技能
function createSingleSkill(container, skillData) {
    try {
        // 创建技能行
        const skillRow = document.createElement('div');
        skillRow.className = 'skill-row';
        
        // 检查是否是子技能行
        if (skillData.isSubSkillRow) {
            skillRow.classList.add('sub-skill-row');
            
            // 添加子技能索引属性，明确标识这是第几个子技能行
            if (skillData.subSkillIndex) {
                skillRow.dataset.subSkillIndex = skillData.subSkillIndex;
            }
            
            // 添加父技能名称属性，便于保存和加载时明确关联
            if (skillData.parentSkill) {
                skillRow.dataset.parentSkill = skillData.parentSkill;
            }
        }
        
        // 技能名称单元格
        const nameCell = document.createElement('div');
        nameCell.className = 'skill-cell skill-name';
        
        // 创建复选框
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'skill-check';
        nameCell.appendChild(checkbox);
        
        // 创建技能名称
        const nameSpan = document.createElement('span');
        
        // 检查是否是子技能行
        if (skillData.isSubSkillRow) {
            // 获取父技能名称
            const parentSkillName = skillData.parentSkill || "技能";
            nameSpan.textContent = parentSkillName;
            nameSpan.setAttribute('data-skill', parentSkillName);
        } else {
            nameSpan.textContent = skillData.name;
            nameSpan.setAttribute('data-skill', skillData.name);
        }
        
        nameCell.appendChild(nameSpan);
        
        // 子技能显示区域（样式由 .selected-subtype 提供）
        const selectedSubtype = document.createElement('span');
        selectedSubtype.className = 'selected-subtype';
        // 默认为空，不显示任何文本
        nameCell.appendChild(selectedSubtype);
        
        // 确定是否需要添加选择按钮
        // 1. 检查该技能本身是否有子技能
        // 2. 如果是子技能行，检查其父技能是否有子技能
        const hasSubtypes = skillData.subtypes || 
            (skillData.isSubSkillRow && skillsData.find(s => s.name === skillData.parentSkill)?.subtypes);
        
        if (hasSubtypes) {
            // 创建选择按钮
            const selectButton = document.createElement('button');
            selectButton.type = 'button';
            selectButton.className = 'subtype-select-button';
            selectButton.textContent = '点击选择';
            nameCell.appendChild(selectButton);
            
            // 添加按钮点击事件
            selectButton.addEventListener('click', function() {
                // 确定要使用的技能数据
                const modalSkillData = skillData.isSubSkillRow
                    ? skillsData.find(s => s.name === skillData.parentSkill)
                    : skillData;

                if (modalSkillData && modalSkillData.subtypes) {
                    // 创建弹出窗口
                    createSubtypeModal(modalSkillData, selectedSubtype, skillRow);
                } else {
                    showMessage('此技能没有可选的子类型', '提示');
                }
            });
        }
        
        // 确定初始基础值
        let baseValue = skillData.base;
        if (baseValue === "halfDex") {
            const dexValue = parseInt(DOMCache.get('dex')?.value) || 0;
            baseValue = Math.floor(dexValue / 2);
        } else if (baseValue === "edu") {
            const eduValue = parseInt(DOMCache.get('edu')?.value) || 0;
            baseValue = eduValue;
        } else if (baseValue < 0) {
            // 如果是负值（表示需要选择子技能），默认设为0
            baseValue = 0;
        }
        
        // 基础值单元格（不再单独绑定input事件，使用事件委托）
        const baseCell = document.createElement('div');
        baseCell.className = 'skill-cell';
        const baseInput = document.createElement('input');
        baseInput.type = 'text';
        baseInput.className = 'skill-input base-value';
        baseInput.value = baseValue === 0 ? '' : baseValue;
        baseInput.maxLength = 3;
        baseCell.appendChild(baseInput);
        
        // 职业点数单元格（不再单独绑定input事件）
        const occupationCell = document.createElement('div');
        occupationCell.className = 'skill-cell';
        const occupationInput = document.createElement('input');
        occupationInput.type = 'text';
        occupationInput.className = 'skill-input occupation-points';
        occupationInput.value = '';
        occupationInput.maxLength = 3;
        occupationCell.appendChild(occupationInput);
        
        // 兴趣点数单元格（不再单独绑定input事件）
        const interestCell = document.createElement('div');
        interestCell.className = 'skill-cell';
        const interestInput = document.createElement('input');
        interestInput.type = 'text';
        interestInput.className = 'skill-input interest-points';
        interestInput.value = '';
        interestInput.maxLength = 3;
        interestCell.appendChild(interestInput);
        
        // 成长点数单元格（不再单独绑定input事件）
        const growthCell = document.createElement('div');
        growthCell.className = 'skill-cell';
        const growthInput = document.createElement('input');
        growthInput.type = 'text';
        growthInput.className = 'skill-input growth-points';
        growthInput.value = '';
        growthInput.maxLength = 3;
        growthCell.appendChild(growthInput);
        
        // 常规成功单元格
        const regularCell = document.createElement('div');
        regularCell.className = 'skill-cell';
        const regularSuccess = document.createElement('div');
        regularSuccess.className = 'skill-success regular-success';
        regularSuccess.textContent = baseValue.toString();
        regularCell.appendChild(regularSuccess);
        
        // 困难成功单元格
        const hardCell = document.createElement('div');
        hardCell.className = 'skill-cell';
        const hardSuccess = document.createElement('div');
        hardSuccess.className = 'skill-success hard-success';
        hardSuccess.textContent = Math.floor(baseValue / 2).toString();
        hardCell.appendChild(hardSuccess);
        
        // 极难成功单元格
        const extremeCell = document.createElement('div');
        extremeCell.className = 'skill-cell';
        const extremeSuccess = document.createElement('div');
        extremeSuccess.className = 'skill-success extreme-success';
        extremeSuccess.textContent = Math.floor(baseValue / 5).toString();
        extremeCell.appendChild(extremeSuccess);
        
        // 添加所有单元格到行
        skillRow.appendChild(nameCell);
        skillRow.appendChild(baseCell);
        skillRow.appendChild(occupationCell);
        skillRow.appendChild(interestCell);
        skillRow.appendChild(growthCell);
        skillRow.appendChild(regularCell);
        skillRow.appendChild(hardCell);
        skillRow.appendChild(extremeCell);
        
        // 添加行到容器
        container.appendChild(skillRow);
        
        // 初始计算成功率
        calculateSkillSuccess(skillRow);
        
        return skillRow;
    } catch (error) {
        console.error('Error creating single skill:', error);
        return null;
    }
}

// 创建子技能选择弹出窗口
function createSubtypeModal(skillData, selectedSubtypeElement, skillRow) {
    try {

        // 移除可能存在的旧弹窗
        const oldModal = document.getElementById('subtype-modal');
        if (oldModal) {
            document.body.removeChild(oldModal);
        }
        
        // 创建弹出窗口容器
        const modal = document.createElement('div');
        modal.id = 'subtype-modal';
        modal.className = 'subtype-modal';
        
        // 创建弹窗内容
        const modalContent = document.createElement('div');
        modalContent.className = 'subtype-modal-content';
        
        // 创建弹窗头部
        const modalHeader = document.createElement('div');
        modalHeader.className = 'subtype-modal-header';
        const modalTitle = document.createElement('h2');
        modalTitle.textContent = `选择 ${skillData.name} 子技能`;
        modalHeader.appendChild(modalTitle);
        
        // 创建弹窗主体
        const modalBody = document.createElement('div');
        modalBody.className = 'subtype-modal-body';
        
        // 创建子技能列表
        const subtypeList = document.createElement('ul');
        subtypeList.className = 'subtype-list';
        
        // 获取子技能数据
        let subtypes = [];
        if (Array.isArray(skillData.subtypes) && typeof skillData.subtypes[0] === 'object') {
            // 子技能是对象数组（如格斗、射击等）
            subtypes = skillData.subtypes.map(st => ({ name: st.name, base: st.base }));
        } else if (Array.isArray(skillData.subtypes)) {
            // 子技能是字符串数组（如母语、外语等）
            let baseValue = skillData.base;
            if (skillData.name === "母语") {
                const eduValue = parseInt(DOMCache.get('edu')?.value) || 0;
                baseValue = eduValue;
            } else if (skillData.name === "外语") {
                baseValue = 1;
            }
            subtypes = skillData.subtypes.map(st => ({ name: st, base: baseValue }));
        }
        
        // 添加用户自定义选项
        const customItem = document.createElement('li');
        customItem.className = 'subtype-item';
        customItem.textContent = '自定义...';
        subtypeList.appendChild(customItem);
        
        // 自定义选项点击事件
        customItem.addEventListener('click', function() {
            // 关闭子技能选择弹窗，打开自定义名称输入弹窗
            document.body.removeChild(modal);
            showCustomSubtypeInputModal(skillData, selectedSubtypeElement, skillRow);
        });
        
        // 添加子技能选项
        subtypes.forEach(subtype => {
            const item = document.createElement('li');
            item.className = 'subtype-item';
            item.textContent = `${subtype.name} (基础值: ${subtype.base})`;
            item.dataset.name = subtype.name;
            item.dataset.base = subtype.base;
            
            // 点击子技能时的处理
            item.addEventListener('click', function() {
                // 获取子技能名称和基础值
                const subtypeName = subtype.name;
                const subtypeBase = subtype.base || baseValue;
                
                // 更新选中的子技能显示
                selectedSubtypeElement.textContent = subtypeName;
                
                // 更新基础值
                if (subtypeBase !== undefined) {
                    const baseInput = skillRow.querySelector('.base-value');
                    if (baseInput) {
                        baseInput.value = subtypeBase;
                    }
                }
                
                // 设置子技能行的数据属性，便于保存和加载
                skillRow.dataset.selectedSubtype = subtypeName;

                // 重新计算成功率
                calculateSkillSuccess(skillRow);
                
                // 关闭弹窗
                document.body.removeChild(modal);
                
                // 触发保存
                saveCharacter(false);
            });
            
            subtypeList.appendChild(item);
        });
        
        // 添加清除选项
        const clearItem = document.createElement('li');
        clearItem.className = 'subtype-item clear-option';
        clearItem.innerHTML = '<i class="fas fa-eraser"></i> 清除选择';
        clearItem.addEventListener('click', function() {
            selectedSubtypeElement.textContent = '';
            const baseInput = skillRow.querySelector('.base-value');
            if (baseInput) baseInput.value = '';
            skillRow.removeAttribute('data-selected-subtype');
            calculateSkillSuccess(skillRow);
            document.body.removeChild(modal);
            saveCharacter(false);
        });
        subtypeList.appendChild(clearItem);
        
        modalBody.appendChild(subtypeList);
        
        // 创建弹窗底部和按钮
        const modalFooter = document.createElement('div');
        modalFooter.className = 'subtype-modal-footer';
        
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'subtype-modal-button';
        cancelButton.textContent = '取消';
        cancelButton.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        modalFooter.appendChild(cancelButton);
        
        // 组装弹窗
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        modal.appendChild(modalContent);
        
        // 添加到页面并显示
        document.body.appendChild(modal);
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    } catch (error) {
        console.error('Error creating subtype modal:', error);
    }
}

// 自定义子技能名称输入弹窗（替代原生 prompt）
function showCustomSubtypeInputModal(skillData, selectedSubtypeElement, skillRow) {
    // 移除可能存在的旧弹窗
    const oldInputModal = document.getElementById('subtype-input-modal');
    if (oldInputModal) {
        document.body.removeChild(oldInputModal);
    }

    const inputModal = document.createElement('div');
    inputModal.id = 'subtype-input-modal';
    inputModal.className = 'subtype-input-modal';

    const content = document.createElement('div');
    content.className = 'subtype-input-modal-content';

    // 头部
    const header = document.createElement('div');
    header.className = 'subtype-modal-header';
    const title = document.createElement('h2');
    title.textContent = `自定义 ${skillData.name} 子技能`;
    header.appendChild(title);

    // 主体（输入框）
    const body = document.createElement('div');
    body.className = 'subtype-input-modal-body';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '请输入自定义子技能名称';
    input.maxLength = 30;
    body.appendChild(input);

    // 底部按钮
    const footer = document.createElement('div');
    footer.className = 'subtype-modal-footer';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'subtype-modal-button';
    cancelButton.textContent = '取消';

    const confirmButton = document.createElement('button');
    confirmButton.type = 'button';
    confirmButton.className = 'subtype-modal-button';
    confirmButton.textContent = '确定';

    footer.appendChild(cancelButton);
    footer.appendChild(confirmButton);

    content.appendChild(header);
    content.appendChild(body);
    content.appendChild(footer);
    inputModal.appendChild(content);
    document.body.appendChild(inputModal);

    // 自动聚焦
    setTimeout(() => input.focus(), 10);

    // 确认处理
    const confirm = () => {
        const customName = input.value.trim();
        if (customName === '') return;
        selectedSubtypeElement.textContent = customName;
        skillRow.dataset.selectedSubtype = customName;
        document.body.removeChild(inputModal);
        saveCharacter(false);
    };

    confirmButton.addEventListener('click', confirm);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            confirm();
        } else if (e.key === 'Escape') {
            document.body.removeChild(inputModal);
        }
    });
    cancelButton.addEventListener('click', function() {
        document.body.removeChild(inputModal);
    });
    inputModal.addEventListener('click', function(event) {
        if (event.target === inputModal) {
            document.body.removeChild(inputModal);
        }
    });
}