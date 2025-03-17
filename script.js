// 克苏鲁神话TRPG角色卡JavaScript文件
// 包含所有功能和事件处理

// 初始化函数，页面加载完成后执行
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM加载完成，初始化角色卡...");
    try {
        // 初始化角色卡
        initCharacterSheet();
        
        // 如果localStorage中有保存的数据，询问是否加载
        if (localStorage.getItem("characterData")) {
            if (confirm("检测到有保存的角色数据，是否加载？")) {
                loadCharacterSheet();
            }
        }
        
        console.log("角色卡初始化完成！");
    } catch (error) {
        console.error("初始化出错：", error);
    }
});

// 技能数据
const skillsData = [
    { name: "信用评级", base: 0 },
    { name: "克苏鲁神话", base: 0 },
    { name: "侦查", base: 25 },
    { name: "聆听", base: 20 },
    { name: "图书馆使用", base: 20 },
    { name: "计算机使用", base: 5 },
    { name: "潜行", base: 20 },
    { name: "追踪", base: 10 },
    { name: "导航", base: 10 },
    { name: "话术", base: 5 },
    { name: "说服", base: 10 },
    { name: "取悦", base: 15 },
    { name: "恐吓", base: 15 },
    { name: "心理学", base: 10 },
    { name: "母语", base: "edu", subtypes: ["汉语", "英语", "日语", "法语", "俄语", "德语", "韩语", "粤语", "拉丁语", "荷兰语", "挪威语", "丹麦", "印度语", "西班牙语", "葡萄牙语", "阿拉伯语"], rows: 1 },
    { name: "外语", base: 1, subtypes: ["汉语", "英语", "日语", "法语", "俄语", "德语", "韩语", "粤语", "拉丁语", "荷兰语", "挪威语", "丹麦", "印度语", "西班牙语", "葡萄牙语", "阿拉伯语"], rows: 2 },
    { name: "闪避", base: "halfDex" },
    { name: "格斗", base: -1, subtypes: [
        { name: "斗殴", base: 25 },
        { name: "链锯", base: 10 },
        { name: "刀剑", base: 20 },
        { name: "矛", base: 20 },
        { name: "斧", base: 15 },
        { name: "绞索", base: 15 },
        { name: "链枷", base: 10 },
        { name: "鞭", base: 5 }
    ], rows: 3 },
    { name: "射击", base: -1, subtypes: [
        { name: "手枪", base: 20 },
        { name: "步枪/霰弹枪", base: 25 },
        { name: "冲锋枪", base: 15 },
        { name: "弓弩", base: 15 },
        { name: "机枪", base: 10 },
        { name: "重武器", base: 10 }
    ], rows: 3 },
    { name: "投掷", base: 20 },
    { name: "急救", base: 30 },
    { name: "医学", base: 1 },
    { name: "精神分析", base: 1 },
    { name: "攀爬", base: 20 },
    { name: "跳跃", base: 20 },
    { name: "游泳", base: 20 },
    { name: "博物学", base: 10 },
    { name: "神秘学", base: 5 },
    { name: "考古学", base: 1 },
    { name: "人类学", base: 1 },
    { name: "估价", base: 5 },
    { name: "会计", base: 5 },
    { name: "法律", base: 5 },
    { name: "历史", base: 5 },
    { name: "电子学", base: 1 },
    { name: "科学", base: -1, subtypes: [
        { name: "数学", base: 10 },
        { name: "地质学", base: 1 },
        { name: "化学", base: 1 },
        { name: "生物学", base: 1 },
        { name: "天文学", base: 1 },
        { name: "物理", base: 1 },
        { name: "药学", base: 1 },
        { name: "植物学", base: 1 },
        { name: "动物学", base: 1 },
        { name: "密码学", base: 1 },
        { name: "工程学", base: 1 },
        { name: "气象学", base: 1 },
        { name: "鉴证", base: 1 }
    ], rows: 3 },
    { name: "乔装", base: 5 },
    { name: "妙手", base: 10 },
    { name: "锁匠", base: 1 },
    { name: "机械维修", base: 10 },
    { name: "电气维修", base: 10 },
    { name: "驯兽", base: 5 },
    { name: "技艺", base: -1, subtypes: [
        { name: "表演", base: 5 },
        { name: "音乐", base: 5 },
        { name: "绘画", base: 5 },
        { name: "艺术", base: 5 },
        { name: "摄影", base: 5 },
        { name: "写作", base: 5 },
        { name: "书法", base: 5 },
        { name: "打字", base: 5 },
        { name: "速记", base: 5 },
        { name: "伪造", base: 5 },
        { name: "烹饪", base: 5 },
        { name: "裁缝", base: 5 },
        { name: "理发", base: 5 },
        { name: "技术制图", base: 5 },
        { name: "耕作", base: 5 },
        { name: "木工", base: 5 },
        { name: "铁匠", base: 5 },
        { name: "焊接", base: 5 },
        { name: "管道工", base: 5 }
    ], rows: 3 },
    { name: "生存", base: -1, subtypes: [
        { name: "沙漠", base: 5 },
        { name: "森林", base: 5 },
        { name: "荒岛", base: 5 },
        { name: "高山", base: 5 },
        { name: "海上", base: 5 }
    ], rows: 3 },
    { name: "汽车驾驶", base: 20 },
    { name: "骑术", base: 5 },
    { name: "重型机械", base: 1 },
    { name: "驾驶", base: -1, subtypes: [
        { name: "船", base: 1 },
        { name: "马车", base: 1 },
        { name: "飞行器", base: 25 }
    ], rows: 3 }
];

// 道具类别数据
const itemCategories = [
    "武器", "防具", "魔法物品", "书籍", "药品", "工具", "日常用品", "珍稀物品", "其他"
];

// 初始化角色卡
function initCharacterSheet() {
    // 初始化属性监听
    initAttributes();
    
    // 初始化技能
    initSkills();
    
    // 初始化武器
    initWeapons();
    
    // 初始化头像上传
    initAvatarUpload();
    
    // 初始化保存/加载功能
    initSaveLoad();
    
    // 初始化打印功能
    initPrint();
    
    // 初始化重置和帮助按钮
    initResetAndHelp();
    
    // 确保在页面加载完成后更新一次衍生属性（包括理智值）
    setTimeout(() => {
        console.log('页面加载完成后更新衍生属性');
        updateDerivedStats();
    }, 500);
}

// 初始化属性
function initAttributes() {
    const attributeInputs = document.querySelectorAll('.char-value');
    
    attributeInputs.forEach(input => {
        input.addEventListener('input', function() {
            // 更新衍生属性
            updateDerivedStats();
            
            // 更新闪避基础值
            if (input.id === 'dex') {
                updateDodgeBaseValue();
            }
            
            // 更新母语基础值
            if (input.id === 'edu') {
                updateMotherTongueBaseValue();
            }
            
            // 更新总点数
            updateTotalPoints();
        });
    });
    
    // 初始化时更新一次衍生属性
    updateDerivedStats();
}

// 检查输入值是非负整数
function validateNonNegativeInt(inputElement) {
    let value = inputElement.value.trim();
    
    // 如果为空，保持为空
    if (value === '') {
        return;
    }
    
    // 移除非数字字符
    value = value.replace(/[^0-9]/g, '');
    
    // 确保是非负整数
    value = Math.max(0, parseInt(value) || 0);
    
    // 设置最大值为999
    value = Math.min(999, value);
    
    // 如果结果为0，显示为空字符串
    inputElement.value = value === 0 ? '' : value;
}

// 更新派生属性
function updateDerivedStats() {
    try {
        // 获取属性值
        const strValue = parseInt(document.getElementById('str').value) || 0;
        const conValue = parseInt(document.getElementById('con').value) || 0;
        const sizValue = parseInt(document.getElementById('siz').value) || 0;
        const dexValue = parseInt(document.getElementById('dex').value) || 0;
        const powValue = parseInt(document.getElementById('pow').value) || 0;
        const intValue = parseInt(document.getElementById('int').value) || 0;
        
        // 计算生命值
        const healthMaxElement = document.querySelector('.health-max');
        if (conValue === 0 && sizValue === 0) {
            healthMaxElement.value = ''; // 如果体质和体型都为0或未填，显示为空
        } else {
            const healthMax = Math.floor((conValue + sizValue) / 10);
            healthMaxElement.value = healthMax;
        }
        
        // 计算魔法值
        const magicMaxElement = document.querySelector('.magic-max');
        if (powValue === 0) {
            magicMaxElement.value = ''; // 如果意志为0或未填，显示为空
        } else {
            const magicMax = Math.floor(powValue / 5);
            magicMaxElement.value = magicMax;
        }
        
        // 更新理智值
        const sanityStartElement = document.querySelector('.sanity-start');
        const sanityMaxElement = document.querySelector('.sanity-max');
        
        // 设置最大理智值为99
        if (sanityMaxElement) {
            sanityMaxElement.value = '99';
        }
        
        // 获取克苏鲁神话技能的常规值
        let cthulhuMythosValue = 0;
        
        try {
            // 查找所有技能行
            const skillRows = document.querySelectorAll('.skill-row');
            console.log(`找到 ${skillRows.length} 个技能行`);
            
            // 遍历所有技能行，查找克苏鲁神话技能
            for (let i = 0; i < skillRows.length; i++) {
                const row = skillRows[i];
                const nameSpan = row.querySelector('.skill-name span');
                
                if (nameSpan) {
                    const skillName = nameSpan.textContent.trim();
                    console.log(`技能 ${i+1}: "${skillName}"`);
                    
                    // 使用包含匹配而不是精确匹配
                    if (skillName.includes('克苏鲁神话')) {
                        // 获取常规成功值
                        const regularSuccess = row.querySelector('.regular-success');
                        if (regularSuccess) {
                            cthulhuMythosValue = parseInt(regularSuccess.textContent) || 0;
                            console.log(`找到克苏鲁神话技能，值为: ${cthulhuMythosValue}，原始文本: "${regularSuccess.textContent}"`);
                            break;
                        } else {
                            console.log('找到克苏鲁神话技能，但无法获取常规成功值');
                        }
                    }
                }
            }
            
            // 如果没有找到，尝试直接获取第二个技能（通常是克苏鲁神话）
            if (cthulhuMythosValue === 0 && skillRows.length > 1) {
                const secondSkill = skillRows[1];
                const nameSpan = secondSkill.querySelector('.skill-name span');
                
                if (nameSpan) {
                    console.log(`第二个技能是: "${nameSpan.textContent.trim()}"`);
                }
                
                const regularSuccess = secondSkill.querySelector('.regular-success');
                if (regularSuccess) {
                    cthulhuMythosValue = parseInt(regularSuccess.textContent) || 0;
                    console.log(`使用第二个技能的值: ${cthulhuMythosValue}，原始文本: "${regularSuccess.textContent}"`);
                } else {
                    console.log('无法获取第二个技能的常规成功值');
                }
            }
        } catch (error) {
            console.error('获取克苏鲁神话值时出错:', error);
        }
        
        console.log(`最终使用的克苏鲁神话值: ${cthulhuMythosValue}`);
        console.log(`当前意志值: ${powValue}`);
        
        // 更新起始理智值为意志值减去克苏鲁神话值
        if (sanityStartElement) {
            if (powValue === 0) {
                sanityStartElement.value = ''; // 如果意志为0或未填，显示为空
            } else {
                // 计算初始理智值：意志值减去克苏鲁神话值
                const startingSanity = Math.max(0, powValue - cthulhuMythosValue);
                console.log(`计算初始理智值: ${powValue} - ${cthulhuMythosValue} = ${startingSanity}`);
                sanityStartElement.value = startingSanity;
            }
        }
        
        // 计算伤害加值和体格
        let damageBonus = '';
        let build = '';  // 改为空字符串作为初始值
        
        const strengthSizeSum = strValue + sizValue;
        
        if (strengthSizeSum >= 2 && strengthSizeSum <= 64) {
            damageBonus = '-2';
            build = '-2';  // 改为字符串
        } else if (strengthSizeSum >= 65 && strengthSizeSum <= 84) {
            damageBonus = '-1';
            build = '-1';  // 改为字符串
        } else if (strengthSizeSum >= 85 && strengthSizeSum <= 124) {
            damageBonus = '0';
            build = '0';   // 改为字符串
        } else if (strengthSizeSum >= 125 && strengthSizeSum <= 164) {
            damageBonus = '+1d4';
            build = '1';   // 改为字符串
        } else if (strengthSizeSum >= 165 && strengthSizeSum <= 204) {
            damageBonus = '+1d6';
            build = '2';   // 改为字符串
        } else if (strengthSizeSum >= 205 && strengthSizeSum <= 284) {
            damageBonus = '+2d6';
            build = '3';   // 改为字符串
        } else if (strengthSizeSum >= 285 && strengthSizeSum <= 364) {
            damageBonus = '+3d6';
            build = '4';   // 改为字符串
        } else if (strengthSizeSum >= 365 && strengthSizeSum <= 444) {
            damageBonus = '+4d6';
            build = '5';   // 改为字符串
        } else if (strengthSizeSum >= 445 && strengthSizeSum <= 524) {
            damageBonus = '+5d6';
            build = '6';   // 改为字符串
        }
        
        // 计算精神加值
        let spiritBonus = '';
        const intPowSum = intValue + powValue;
        
        if (intPowSum >= 2 && intPowSum <= 64) {
            spiritBonus = '-2';
        } else if (intPowSum >= 65 && intPowSum <= 84) {
            spiritBonus = '-1';
        } else if (intPowSum >= 85 && intPowSum <= 124) {
            spiritBonus = '0';
        } else if (intPowSum >= 125 && intPowSum <= 164) {
            spiritBonus = '+1d4';
        } else if (intPowSum >= 165 && intPowSum <= 204) {
            spiritBonus = '+1d6';
        } else if (intPowSum >= 205 && intPowSum <= 284) {
            spiritBonus = '+2d6';
        } else if (intPowSum >= 285 && intPowSum <= 364) {
            spiritBonus = '+3d6';
        } else if (intPowSum >= 365 && intPowSum <= 444) {
            spiritBonus = '+4d6';
        } else if (intPowSum >= 445 && intPowSum <= 524) {
            spiritBonus = '+5d6';
        }
        
        document.getElementById('damage-bonus').value = damageBonus;
        document.getElementById('spirit-bonus').value = spiritBonus;
        document.getElementById('build').value = build;
    } catch (error) {
        console.error('Error updating derived stats:', error);
    }
}

// 更新总点数
function updateTotalPoints() {
    try {
        // 属性列表
        const attributes = ['str', 'con', 'siz', 'dex', 'app', 'int', 'pow', 'edu', 'luc'];
        
        // 计算总点数
        let total = 0;
        attributes.forEach(attr => {
            const value = parseInt(document.getElementById(attr).value) || 0;
            total += value;
        });
        
        // 更新总点数显示
        document.querySelector('.total-attr').textContent = `总点数：${total}`;
    } catch (error) {
        console.error('Error updating total points:', error);
    }
}

// 初始化技能
function initSkills() {
    try {
        // 技能点数监听
        const occupationPoints = document.getElementById('occupation-points');
        const interestPoints = document.getElementById('interest-points');
        
        occupationPoints.addEventListener('input', function() {
            validateNonNegativeInt(this);
            updatePointsRemaining();
        });
        
        interestPoints.addEventListener('input', function() {
            validateNonNegativeInt(this);
            updatePointsRemaining();
        });
        
        // 创建技能表头
        createSkillsHeader();
        
        // 创建技能列表
        createSkillsList();
        
        // 初始更新点数剩余
        updatePointsRemaining();
    } catch (error) {
        console.error('Error initializing skills:', error);
    }
}

// 创建技能表头
function createSkillsHeader() {
    try {
        console.log("创建技能表头...");
        const skillsContainer = document.querySelector('.skills-container');
        
        // 创建表头容器
        const headerContainer = document.createElement('div');
        headerContainer.className = 'skills-header';
        
        // 创建左列表头
        const leftHeader = document.createElement('div');
        leftHeader.className = 'skills-header-column';
        leftHeader.style.width = '50%';
        leftHeader.style.display = 'flex';
        
        // 创建右列表头
        const rightHeader = document.createElement('div');
        rightHeader.className = 'skills-header-column';
        rightHeader.style.width = '50%';
        rightHeader.style.display = 'flex';
        
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
        
        // 创建左右两列容器
        const leftColumn = document.createElement('div');
        leftColumn.className = 'skills-column left-column';
        leftColumn.style.width = '50%';
        leftColumn.style.display = 'flex';
        leftColumn.style.flexDirection = 'column';
        
        const rightColumn = document.createElement('div');
        rightColumn.className = 'skills-column right-column';
        rightColumn.style.width = '50%';
        rightColumn.style.display = 'flex';
        rightColumn.style.flexDirection = 'column';
        
        // 创建所有技能行的数组
        const allSkills = [];
        
        // 处理技能数据 - 考虑rows属性
        skillsData.forEach(skill => {
            // 检查是否有rows属性
            if (skill.subtypes && skill.rows && skill.rows > 1) {
                // 为第一行添加主技能
                allSkills.push(skill);
                
                // 为剩余的行添加占位符技能
                for (let i = 1; i < skill.rows; i++) {
                    allSkills.push({
                        name: `${skill.name}子技能${i}`,
                        base: skill.base,
                        isSubSkillRow: true,
                        parentSkill: skill.name
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
        
    } catch (error) {
        console.error('Error creating skills list:', error);
    }
}

// 创建单个技能
function createSingleSkill(container, skillData) {
    try {
        console.log(`创建技能: ${skillData.name}`);
        // 创建技能行
        const skillRow = document.createElement('div');
        skillRow.className = 'skill-row';
        
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
            skillRow.classList.add('sub-skill-row');
        } else {
            nameSpan.textContent = skillData.name;
        }
        
        nameCell.appendChild(nameSpan);
        
        // 子技能显示区域
        const selectedSubtype = document.createElement('span');
        selectedSubtype.className = 'selected-subtype';
        selectedSubtype.style.fontStyle = 'italic';
        selectedSubtype.style.marginLeft = '5px';
        selectedSubtype.style.color = '#666';
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
                    alert("此技能没有可选的子类型");
                }
            });
        }
        
        // 确定初始基础值
        let baseValue = skillData.base;
        if (baseValue === "halfDex") {
            const dexValue = parseInt(document.getElementById('dex').value) || 0;
            baseValue = Math.floor(dexValue / 2);
        } else if (baseValue === "edu") {
            const eduValue = parseInt(document.getElementById('edu').value) || 0;
            baseValue = eduValue;
        } else if (baseValue < 0) {
            // 如果是负值（表示需要选择子技能），默认设为0
            baseValue = 0;
        }
        
        // 基础值单元格
        const baseCell = document.createElement('div');
        baseCell.className = 'skill-cell';
        const baseInput = document.createElement('input');
        baseInput.type = 'text';
        baseInput.className = 'skill-input base-value';
        baseInput.value = baseValue === 0 ? '' : baseValue;
        baseInput.maxLength = 3;
        baseInput.addEventListener('input', function() {
            validateNonNegativeInt(this);
            calculateSkillSuccess(skillRow);
        });
        baseCell.appendChild(baseInput);
        
        // 职业点数单元格
        const occupationCell = document.createElement('div');
        occupationCell.className = 'skill-cell';
        const occupationInput = document.createElement('input');
        occupationInput.type = 'text';
        occupationInput.className = 'skill-input occupation-points';
        occupationInput.value = '';  // 默认为空白
        occupationInput.maxLength = 3;
        occupationInput.addEventListener('input', function() {
            validateNonNegativeInt(this);
            updatePointsRemaining();
            calculateSkillSuccess(skillRow);
        });
        occupationCell.appendChild(occupationInput);
        
        // 兴趣点数单元格
        const interestCell = document.createElement('div');
        interestCell.className = 'skill-cell';
        const interestInput = document.createElement('input');
        interestInput.type = 'text';
        interestInput.className = 'skill-input interest-points';
        interestInput.value = '';  // 默认为空白
        interestInput.maxLength = 3;
        interestInput.addEventListener('input', function() {
            validateNonNegativeInt(this);
            updatePointsRemaining();
            calculateSkillSuccess(skillRow);
        });
        interestCell.appendChild(interestInput);
        
        // 成长点数单元格
        const growthCell = document.createElement('div');
        growthCell.className = 'skill-cell';
        const growthInput = document.createElement('input');
        growthInput.type = 'text';
        growthInput.className = 'skill-input growth-points';
        growthInput.value = '';  // 默认为空白
        growthInput.maxLength = 3;
        growthInput.addEventListener('input', function() {
            validateNonNegativeInt(this);
            calculateSkillSuccess(skillRow);
        });
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
        console.log("创建子技能弹窗：", skillData.name);
        
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
                const eduValue = parseInt(document.getElementById('edu').value) || 0;
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
            const customName = prompt('请输入自定义子技能名称：');
            if (customName && customName.trim() !== '') {
                selectedSubtypeElement.textContent = customName.trim();
                // 不修改基础值，保持原来的值
                modal.classList.remove('active');
            }
        });
        
        // 添加子技能选项
        subtypes.forEach(subtype => {
            const item = document.createElement('li');
            item.className = 'subtype-item';
            item.textContent = `${subtype.name} (基础值: ${subtype.base})`;
            item.dataset.name = subtype.name;
            item.dataset.base = subtype.base;
            
            // 添加点击事件
            item.addEventListener('click', function() {
                const name = this.dataset.name;
                const base = this.dataset.base;
                
                // 更新选中的子技能名称
                selectedSubtypeElement.textContent = name;
                
                // 更新基础值
                const baseInput = skillRow.querySelector('.base-value');
                baseInput.value = base;
                
                // 更新成功率
                calculateSkillSuccess(skillRow);
                
                // 关闭弹窗
                modal.classList.remove('active');
            });
            
            subtypeList.appendChild(item);
        });
        
        modalBody.appendChild(subtypeList);
        
        // 创建弹窗底部和按钮
        const modalFooter = document.createElement('div');
        modalFooter.className = 'subtype-modal-footer';
        
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'subtype-modal-button';
        cancelButton.textContent = '取消';
        cancelButton.addEventListener('click', function() {
            modal.classList.remove('active');
        });
        
        modalFooter.appendChild(cancelButton);
        
        // 组装弹窗
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        modal.appendChild(modalContent);
        
        // 添加到文档
        document.body.appendChild(modal);
        
        // 显示弹窗
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // 点击弹窗外部关闭
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.classList.remove('active');
            }
        });
        
        console.log("弹窗创建完成");
    } catch (error) {
        console.error('Error creating subtype modal:', error);
    }
}

// 计算技能成功率
function calculateSkillSuccess(skillRow) {
    try {
        // 获取各个值
        const baseValue = parseInt(skillRow.querySelector('.base-value').value) || 0;
        const occupationPoints = parseInt(skillRow.querySelector('.occupation-points').value) || 0;
        const interestPoints = parseInt(skillRow.querySelector('.interest-points').value) || 0;
        const growthPoints = parseInt(skillRow.querySelector('.growth-points').value) || 0;
        
        // 计算总值
        const total = baseValue + occupationPoints + interestPoints + growthPoints;
        
        // 更新成功率 - 总值为0时也显示
        skillRow.querySelector('.regular-success').textContent = total.toString();
        skillRow.querySelector('.hard-success').textContent = Math.floor(total / 2).toString();
        skillRow.querySelector('.extreme-success').textContent = Math.floor(total / 5).toString();
        
        // 设置打印数据
        skillRow.dataset.total = total;
        
        // 检查是否是克苏鲁神话技能，如果是则更新理智值
        const nameSpan = skillRow.querySelector('.skill-name span');
        if (nameSpan && nameSpan.textContent.trim().includes('克苏鲁神话')) {
            console.log(`克苏鲁神话技能值已更新为: ${total}，触发理智值更新`);
            // 更新衍生属性（包括理智值）
            updateDerivedStats();
        }
    } catch (error) {
        console.error('Error calculating skill success:', error);
    }
}

// 更新点数剩余
function updatePointsRemaining() {
    try {
        // 职业点数
        const occupationTotal = parseInt(document.getElementById('occupation-points').value) || 0;
        let occupationUsed = 0;
        document.querySelectorAll('.occupation-points').forEach(input => {
            occupationUsed += parseInt(input.value) || 0;
        });
        const occupationRemaining = occupationTotal - occupationUsed;
        document.getElementById('occupation-remaining').textContent = occupationRemaining;
        
        // 兴趣点数
        const interestTotal = parseInt(document.getElementById('interest-points').value) || 0;
        let interestUsed = 0;
        document.querySelectorAll('.interest-points').forEach(input => {
            interestUsed += parseInt(input.value) || 0;
        });
        const interestRemaining = interestTotal - interestUsed;
        document.getElementById('interest-remaining').textContent = interestRemaining;
    } catch (error) {
        console.error('Error updating points remaining:', error);
    }
}

// 添加武器行
function addWeaponRow() {
    const weaponsContainer = document.querySelector('.weapons-table');
    
    // 创建武器行
    const weaponRow = document.createElement('div');
    weaponRow.className = 'weapon-row';
    
    // 创建武器名称单元格
    const nameCell = document.createElement('div');
    nameCell.className = 'weapon-cell';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'weapon-name';
    nameInput.placeholder = '武器名称';
    nameCell.appendChild(nameInput);
    
    // 创建伤害单元格
    const damageCell = document.createElement('div');
    damageCell.className = 'weapon-cell';
    const damageInput = document.createElement('input');
    damageInput.type = 'text';
    damageInput.className = 'weapon-damage';
    damageInput.placeholder = '伤害';
    damageCell.appendChild(damageInput);
    
    // 创建特性单元格
    const featuresCell = document.createElement('div');
    featuresCell.className = 'weapon-cell';
    const featuresInput = document.createElement('input');
    featuresInput.type = 'text';
    featuresInput.className = 'weapon-features';
    featuresInput.placeholder = '特性';
    featuresCell.appendChild(featuresInput);
    
    // 添加单元格到行
    weaponRow.appendChild(nameCell);
    weaponRow.appendChild(damageCell);
    weaponRow.appendChild(featuresCell);
    
    // 添加行到容器
    weaponsContainer.appendChild(weaponRow);
}

// 初始化武器区域
function initWeapons() {
    const weaponsContainer = document.querySelector('.weapons-table');
    
    // 清空现有内容
    weaponsContainer.innerHTML = '';
    
    // 添加表头
    const headerRow = document.createElement('div');
    headerRow.className = 'weapon-row weapon-header';
    headerRow.innerHTML = `
        <div class="weapon-cell weapon-name-cell">武器名称</div>
        <div class="weapon-cell weapon-damage-cell">伤害</div>
        <div class="weapon-cell weapon-feature-cell">特性</div>
    `;
    weaponsContainer.appendChild(headerRow);
    
    // 默认添加3行武器栏
    for (let i = 0; i < 3; i++) {
        addWeaponRow();
    }
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
        
        avatarUpload.addEventListener('change', function(event) {
            const file = event.target.files[0];
            
            if (file) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    avatarImg.src = e.target.result;
                    avatarImg.style.display = 'block';
                    document.querySelector('.avatar-placeholder').style.display = 'none';
                }
                
                reader.readAsDataURL(file);
            }
        });
    } catch (error) {
        console.error('Error initializing avatar upload:', error);
    }
}

// 初始化保存/加载功能
function initSaveLoad() {
    try {
        // 保存按钮
        document.getElementById('save-button').addEventListener('click', function() {
            saveCharacter();
        });
        
        // 加载按钮
        document.getElementById('load-button').addEventListener('click', function() {
            document.createElement('input').click();
            
            // 创建加载输入并模拟点击
            const loadInput = document.createElement('input');
            loadInput.type = 'file';
            loadInput.accept = '.json';
            loadInput.style.display = 'none';
            
            loadInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                
                if (file) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        loadCharacter(e.target.result);
                    }
                    
                    reader.readAsText(file);
                }
            });
            
            document.body.appendChild(loadInput);
            loadInput.click();
            
            // 清理DOM
            setTimeout(() => {
                document.body.removeChild(loadInput);
            }, 100);
        });
    } catch (error) {
        console.error('Error initializing save/load:', error);
    }
}

// 保存角色数据
function saveCharacter() {
    try {
        // 创建角色数据对象
        const characterData = {
            basic: {
                isPartner: document.getElementById('is-partner').checked,
                characterName: document.getElementById('character-name').value,
                playerName: document.getElementById('player-name').value,
                era: document.getElementById('era').value,
                occupation: document.getElementById('occupation').value,
                age: document.getElementById('age').value,
                gender: document.getElementById('gender').value,
                residence: document.getElementById('residence').value,
                birthplace: document.getElementById('birthplace').value
            },
            attributes: {
                str: document.getElementById('str').value,
                con: document.getElementById('con').value,
                siz: document.getElementById('siz').value,
                dex: document.getElementById('dex').value,
                app: document.getElementById('app').value,
                int: document.getElementById('int').value,
                pow: document.getElementById('pow').value,
                edu: document.getElementById('edu').value,
                luc: document.getElementById('luc').value
            },
            avatar: document.getElementById('avatar-img').src,
            status: {
                sanity: {
                    current: document.getElementById('current-san').value,
                    start: document.getElementById('start-san').value,
                    max: document.getElementById('max-san').value
                },
                health: {
                    current: document.querySelector('.health-current').value,
                    max: document.querySelector('.health-max').value,
                    temp: document.querySelector('.health-temp').value
                },
                magic: {
                    current: document.querySelector('.magic-current').value,
                    max: document.querySelector('.magic-max').value,
                    temp: document.querySelector('.magic-temp').value
                }
            },
            skills: {
                occupationPoints: document.getElementById('occupation-points').value,
                interestPoints: document.getElementById('interest-points').value,
                skillsList: []
            },
            weapons: [],
            combat: {
                damageBonus: document.getElementById('damage-bonus').value,
                spiritBonus: document.getElementById('spirit-bonus').value,
                build: document.getElementById('build').value,
                armor: document.getElementById('armor').value
            }
        };
        
        // 收集技能数据
        document.querySelectorAll('.skill-row').forEach(skillRow => {
            const nameElement = skillRow.querySelector('.skill-name span');
            if (nameElement) {
                const skillData = {
                    name: nameElement.textContent,
                    checked: skillRow.querySelector('.skill-check').checked,
                    base: skillRow.querySelector('.base-value').value,
                    occupation: skillRow.querySelector('.occupation-points').value,
                    interest: skillRow.querySelector('.interest-points').value,
                    growth: skillRow.querySelector('.growth-points').value
                };
                characterData.skills.skillsList.push(skillData);
            }
        });
        
        // 收集武器数据
        document.querySelectorAll('.weapon-row').forEach(weaponRow => {
            // 跳过表头
            if (!weaponRow.classList.contains('weapon-header')) {
                const weaponData = {
                    name: weaponRow.querySelector('.weapon-name').value,
                    damage: weaponRow.querySelector('.weapon-damage').value,
                    features: weaponRow.querySelector('.weapon-features').value
                };
                characterData.weapons.push(weaponData);
            }
        });
        
        // 转换为JSON并下载
        const dataStr = JSON.stringify(characterData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportName = characterData.basic.characterName || 'character';
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataUri);
        downloadAnchor.setAttribute('download', exportName + '.json');
        downloadAnchor.style.display = 'none';
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
    } catch (error) {
        console.error('Error saving character:', error);
        alert('保存失败，请稍后再试。');
    }
}

// 加载角色数据
function loadCharacter(jsonString) {
    try {
        const characterData = JSON.parse(jsonString);
        
        // 基本信息
        if (characterData.basic) {
            document.getElementById('is-partner').checked = characterData.basic.isPartner;
            document.getElementById('character-name').value = characterData.basic.characterName || '';
            document.getElementById('player-name').value = characterData.basic.playerName || '';
            document.getElementById('era').value = characterData.basic.era || '';
            document.getElementById('occupation').value = characterData.basic.occupation || '';
            document.getElementById('age').value = characterData.basic.age || '';
            document.getElementById('gender').value = characterData.basic.gender || '';
            document.getElementById('residence').value = characterData.basic.residence || '';
            document.getElementById('birthplace').value = characterData.basic.birthplace || '';
        }
        
        // 属性
        if (characterData.attributes) {
            document.getElementById('str').value = characterData.attributes.str || '0';
            document.getElementById('con').value = characterData.attributes.con || '0';
            document.getElementById('siz').value = characterData.attributes.siz || '0';
            document.getElementById('dex').value = characterData.attributes.dex || '0';
            document.getElementById('app').value = characterData.attributes.app || '0';
            document.getElementById('int').value = characterData.attributes.int || '0';
            document.getElementById('pow').value = characterData.attributes.pow || '0';
            document.getElementById('edu').value = characterData.attributes.edu || '0';
            document.getElementById('luc').value = characterData.attributes.luc || '0';
            
            // 更新派生属性
            updateDerivedStats();
            updateTotalPoints();
        }
        
        // 头像
        if (characterData.avatar && characterData.avatar !== '') {
            document.getElementById('avatar-img').src = characterData.avatar;
            document.getElementById('avatar-img').style.display = 'block';
            document.querySelector('.avatar-placeholder').style.display = 'none';
        }
        
        // 状态
        if (characterData.status) {
            if (characterData.status.sanity) {
                document.getElementById('current-san').value = characterData.status.sanity.current || '0';
                document.getElementById('start-san').value = characterData.status.sanity.start || '0';
                document.getElementById('max-san').value = characterData.status.sanity.max || '0';
            }
            
            if (characterData.status.health) {
                document.querySelector('.health-current').value = characterData.status.health.current || '0';
                document.querySelector('.health-max').value = characterData.status.health.max || '0';
                document.querySelector('.health-temp').value = characterData.status.health.temp || '0';
            }
            
            if (characterData.status.magic) {
                document.querySelector('.magic-current').value = characterData.status.magic.current || '0';
                document.querySelector('.magic-max').value = characterData.status.magic.max || '0';
                document.querySelector('.magic-temp').value = characterData.status.magic.temp || '0';
            }
        }
        
        // 技能
        if (characterData.skills) {
            document.getElementById('occupation-points').value = characterData.skills.occupationPoints || '0';
            document.getElementById('interest-points').value = characterData.skills.interestPoints || '0';
            
            if (characterData.skills.skillsList && characterData.skills.skillsList.length > 0) {
                const skillRows = document.querySelectorAll('.skill-row');
                
                characterData.skills.skillsList.forEach((skillData, index) => {
                    if (index < skillRows.length) {
                        const skillRow = skillRows[index];
                        
                        skillRow.querySelector('.skill-check').checked = skillData.checked;
                        
                        // 设置基础值，如果为0则显示为空
                        const baseValue = parseInt(skillData.base) || 0;
                        skillRow.querySelector('.base-value').value = baseValue === 0 ? '' : baseValue;
                        
                        // 设置职业点数，如果为0则显示为空
                        const occValue = parseInt(skillData.occupation) || 0;
                        skillRow.querySelector('.occupation-points').value = occValue === 0 ? '' : occValue;
                        
                        // 设置兴趣点数，如果为0则显示为空
                        const intValue = parseInt(skillData.interest) || 0;
                        skillRow.querySelector('.interest-points').value = intValue === 0 ? '' : intValue;
                        
                        // 设置成长点数，如果为0则显示为空
                        const growthValue = parseInt(skillData.growth) || 0;
                        skillRow.querySelector('.growth-points').value = growthValue === 0 ? '' : growthValue;
                        
                        // 更新成功率
                        calculateSkillSuccess(skillRow);
                    }
                });
            }
            
            // 更新点数剩余
            updatePointsRemaining();
        }
        
        // 武器
        if (characterData.weapons && characterData.weapons.length > 0) {
            // 清除原有武器（保留表头）
            const weaponsTable = document.querySelector('.weapons-table');
            const weaponHeader = weaponsTable.querySelector('.weapon-header');
            weaponsTable.innerHTML = '';
            weaponsTable.appendChild(weaponHeader);
            
            // 添加保存的武器
            characterData.weapons.forEach(weaponData => {
                const weaponRow = document.createElement('div');
                weaponRow.className = 'weapon-row';
                
                // 武器名称
                const nameCell = document.createElement('div');
                nameCell.className = 'weapon-cell';
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.className = 'weapon-name';
                nameInput.value = weaponData.name || '';
                nameCell.appendChild(nameInput);
                
                // 伤害
                const damageCell = document.createElement('div');
                damageCell.className = 'weapon-cell';
                const damageInput = document.createElement('input');
                damageInput.type = 'text';
                damageInput.className = 'weapon-damage';
                damageInput.value = weaponData.damage || '';
                damageCell.appendChild(damageInput);
                
                // 特性
                const featuresCell = document.createElement('div');
                featuresCell.className = 'weapon-cell';
                const featuresInput = document.createElement('input');
                featuresInput.type = 'text';
                featuresInput.className = 'weapon-features';
                featuresInput.value = weaponData.features || '';
                featuresCell.appendChild(featuresInput);
                
                // 添加到行
                weaponRow.appendChild(nameCell);
                weaponRow.appendChild(damageCell);
                weaponRow.appendChild(featuresCell);
                
                // 添加到表格
                weaponsTable.appendChild(weaponRow);
            });
        }
        
        // 战斗信息
        if (characterData.combat) {
            document.getElementById('damage-bonus').value = characterData.combat.damageBonus || '';
            document.getElementById('spirit-bonus').value = characterData.combat.spiritBonus || '';
            document.getElementById('build').value = characterData.combat.build || '';
            document.getElementById('armor').value = characterData.combat.armor || '';
        }
        
        alert('角色数据加载成功！');
    } catch (error) {
        console.error('Error loading character:', error);
        alert('加载失败，请检查文件格式。');
    }
}

// 初始化打印功能
function initPrint() {
    const printButton = document.getElementById('print-button');
    const printModal = document.getElementById('print-modal');
    const confirmPrintButton = document.getElementById('confirm-print');
    const cancelPrintButton = document.getElementById('cancel-print');
    const printCharacterCheckbox = document.getElementById('print-character');
    const printCustomSkillsCheckbox = document.getElementById('print-custom-skills');
    const printItemsCheckbox = document.getElementById('print-items');
    let isPrinting = false; // 添加打印状态标志

    // 打印按钮点击事件
    printButton.addEventListener('click', function() {
        isPrinting = true;
        printModal.style.display = 'flex';
    });

    // 取消按钮点击事件
    cancelPrintButton.addEventListener('click', function() {
        isPrinting = false;
        printModal.style.display = 'none';
    });

    // 点击模态框外部关闭
    printModal.addEventListener('click', function(event) {
        if (event.target === printModal) {
            isPrinting = false;
            printModal.style.display = 'none';
        }
    });

    // 确认打印按钮点击事件
    confirmPrintButton.addEventListener('click', function() {
        if (!isPrinting) return; // 如果不是打印状态，直接返回

        // 根据选择控制打印内容
        const sections = [
            '.basic-info-section',
            '.characteristics-section',
            '.avatar-section',
            '.stats-section',
            '.skills-section',
            '.weapons-section',
            '.combat-section'
        ];
        
        // 根据复选框状态添加或移除打印隐藏类
        sections.forEach(section => {
            const elements = document.querySelectorAll(section);
            elements.forEach(element => {
                if (!printCharacterCheckbox.checked) {
                    element.classList.add('print-hidden');
                } else {
                    element.classList.remove('print-hidden');
                }
            });
        });

        // 自定义技能部分
        const customSkillsSection = document.querySelector('.custom-skills-section');
        if (customSkillsSection) {
            if (!printCustomSkillsCheckbox.checked) {
                customSkillsSection.classList.add('print-hidden');
            } else {
                customSkillsSection.classList.remove('print-hidden');
            }
        }

        // 物品部分
        const itemsSection = document.querySelector('.items-section');
        if (itemsSection) {
            if (!printItemsCheckbox.checked) {
                itemsSection.classList.add('print-hidden');
            } else {
                itemsSection.classList.remove('print-hidden');
            }
        }

        // 关闭模态框
        printModal.style.display = 'none';

        // 使用 Promise 来控制打印流程
        Promise.resolve()
            .then(() => {
                if (isPrinting) { // 只有在打印状态时才执行打印
                    window.print();
                }
            })
            .finally(() => {
                // 打印完成后恢复显示所有部分
                document.querySelectorAll('.print-hidden').forEach(element => {
                    element.classList.remove('print-hidden');
                });
                isPrinting = false; // 重置打印状态
            });
    });

    // 监听打印对话框关闭事件
    window.addEventListener('afterprint', function() {
        isPrinting = false;
    });
}

// 在页面加载完成后初始化打印功能
document.addEventListener('DOMContentLoaded', function() {
    initPrint();
});

// 更新闪避技能基础值
function updateDodgeBaseValue() {
    const dexValue = parseInt(document.getElementById('dex').value) || 0;
    const halfDex = Math.floor(dexValue / 2);
    
    // 查找闪避技能行
    document.querySelectorAll('.skill-row').forEach(skillRow => {
        const skillName = skillRow.querySelector('.skill-name span');
        if (skillName && skillName.textContent === '闪避') {
            const baseInput = skillRow.querySelector('.base-value');
            baseInput.value = halfDex;
            calculateSkillSuccess(skillRow);
        }
    });
}

// 更新母语技能基础值
function updateMotherTongueBaseValue() {
    const eduValue = parseInt(document.getElementById('edu').value) || 0;
    
    // 查找母语技能行
    document.querySelectorAll('.skill-row').forEach(skillRow => {
        const skillName = skillRow.querySelector('.skill-name span');
        if (skillName && skillName.textContent === '母语') {
            // 检查是否选择了子技能
            const selectedSubtype = skillRow.querySelector('.selected-subtype');
            if (selectedSubtype && selectedSubtype.textContent.trim() !== '') {
                const baseInput = skillRow.querySelector('.base-value');
                baseInput.value = eduValue;
                calculateSkillSuccess(skillRow);
            }
        }
    });
}

// 初始化重置和帮助按钮
function initResetAndHelp() {
    // 重置按钮点击事件
    document.getElementById('reset-button').addEventListener('click', function() {
        if (confirm('确定要重置所有数据吗？此操作不可撤销。')) {
            localStorage.removeItem('characterData');
            window.location.reload();
        }
    });
    
    // 帮助按钮点击事件
    document.getElementById('help-button').addEventListener('click', function() {
        alert('COC 7版角色卡使用说明：\n\n' +
              '1. 填写角色基本信息\n' +
              '2. 分配属性点数\n' +
              '3. 选择职业并分配职业点数和兴趣点数\n' +
              '4. 添加武器和装备\n' +
              '5. 使用保存按钮保存角色数据\n' +
              '6. 使用打印按钮打印角色卡');
    });
}