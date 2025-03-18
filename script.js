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

// 初始化武器区域 - 适配静态武器行
function initWeapons() {
    // 由于已经在HTML中有静态的四行武器输入，不需要动态生成
    // 只需确保背景色正确应用
    applyWeaponRowColors();
}

// 应用武器行背景色
function applyWeaponRowColors() {
    const weaponsTable = document.querySelector('.weapons-table');
    const weaponRows = weaponsTable.querySelectorAll('.weapon-row');
    
    weaponRows.forEach((row, index) => {
        // 清除可能存在的内联样式
        row.style.backgroundColor = '';
        
        // 手动应用交替背景色
        if (index % 2 === 0) {
            row.style.backgroundColor = 'white';
        } else {
            row.style.backgroundColor = 'var(--table-row-alt)';
        }
    });
    
    console.log('已应用武器行背景色，共 ' + weaponRows.length + ' 行');
}

// 添加武器行 - 已不需要，因为使用静态HTML
function addWeaponRow() {
    // 该函数已不再使用，但保留函数以避免引用错误
    console.log('静态武器行模式：addWeaponRow不再需要');
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
                    features: weaponRow.querySelector('.weapon-feature').value
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
        if (characterData.basicInfo) {
            document.getElementById('character-name').value = characterData.basicInfo.name || '';
            document.getElementById('player-name').value = characterData.basicInfo.player || '';
            document.getElementById('era').value = characterData.basicInfo.era || '';
            document.getElementById('occupation').value = characterData.basicInfo.occupation || '';
            document.getElementById('age').value = characterData.basicInfo.age || '';
            document.getElementById('gender').value = characterData.basicInfo.gender || '';
            document.getElementById('residence').value = characterData.basicInfo.residence || '';
            document.getElementById('birthplace').value = characterData.basicInfo.birthplace || '';
            document.getElementById('is-partner').checked = characterData.basicInfo.isPartner || false;
            
            // 同步更新自定义技能页的姓名显示
            const customCharacterName = document.getElementById('custom-character-name');
            if (customCharacterName) {
                customCharacterName.textContent = characterData.basicInfo.name || '';
            }
        }
        
        // 头像
        if (characterData.avatar) {
            const avatarImg = document.getElementById('avatar-img');
            const avatarPlaceholder = document.querySelector('.avatar-placeholder');
            avatarImg.src = characterData.avatar;
            avatarImg.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
        }
        
        // 属性
        if (characterData.attributes) {
            document.getElementById('str').value = characterData.attributes.str || '';
            document.getElementById('con').value = characterData.attributes.con || '';
            document.getElementById('siz').value = characterData.attributes.siz || '';
            document.getElementById('dex').value = characterData.attributes.dex || '';
            document.getElementById('app').value = characterData.attributes.app || '';
            document.getElementById('int').value = characterData.attributes.int || '';
            document.getElementById('pow').value = characterData.attributes.pow || '';
            document.getElementById('edu').value = characterData.attributes.edu || '';
            document.getElementById('luc').value = characterData.attributes.luc || '';
            
            // 更新导出属性
            updateDerivedStats();
        }
        
        // 状态
        if (characterData.status) {
            document.querySelector('.sanity-current').value = characterData.status.sanCurrent || '';
            document.querySelector('.sanity-start').value = characterData.status.sanStart || '';
            document.querySelector('.sanity-max').value = characterData.status.sanMax || '99';
            document.querySelector('.health-current').value = characterData.status.hpCurrent || '';
            document.querySelector('.health-max').value = characterData.status.hpMax || '';
            document.querySelector('.health-temp').value = characterData.status.hpTemp || '';
            document.querySelector('.magic-current').value = characterData.status.mpCurrent || '';
            document.querySelector('.magic-max').value = characterData.status.mpMax || '';
            document.querySelector('.magic-temp').value = characterData.status.mpTemp || '';
        }
        
        // 技能点数
        if (characterData.points) {
            document.getElementById('occupation-points').value = characterData.points.occupation || '0';
            document.getElementById('interest-points').value = characterData.points.interest || '0';
            updatePointsRemaining();
        }
        
        // 技能
        if (characterData.skills) {
            const leftColumn = document.querySelector('.skills-column.left-column');
            const rightColumn = document.querySelector('.skills-column.right-column');
            
            // 清空现有技能
            leftColumn.innerHTML = '';
            rightColumn.innerHTML = '';
            
            // 重新创建技能列表
            createSkillsList();
            
            // 加载技能值
            characterData.skills.forEach(skillData => {
                // 查找对应的技能行
                const skillName = skillData.name;
                const skillElement = document.querySelector(`.skill-name span[data-skill="${skillName}"]`);
                
                if (skillElement) {
                    const skillRow = skillElement.closest('.skill-row');
                    
                    // 设置勾选状态
                    const checkbox = skillRow.querySelector('.skill-check');
                    if (checkbox) checkbox.checked = skillData.checked || false;
                    
                    // 设置职业点数
                    const occupationInput = skillRow.querySelector('.skill-occupation');
                    if (occupationInput) occupationInput.value = skillData.occupation || '0';
                    
                    // 设置兴趣点数
                    const interestInput = skillRow.querySelector('.skill-interest');
                    if (interestInput) interestInput.value = skillData.interest || '0';
                    
                    // 设置成长点数
                    const growthInput = skillRow.querySelector('.skill-growth');
                    if (growthInput) growthInput.value = skillData.growth || '0';
                    
                    // 如果是有子类型的技能
                    if (skillData.subtype) {
                        const subtypeElement = skillRow.querySelector('.selected-subtype');
                        if (subtypeElement) subtypeElement.textContent = skillData.subtype;
                    }
                    
                    // 计算成功率
                        calculateSkillSuccess(skillRow);
                    }
                });
        }
        
        // 武器
        if (characterData.weapons && characterData.weapons.length > 0) {
            const weaponsTable = document.querySelector('.weapons-table');
            
            // 保留表头
            const weaponHeader = weaponsTable.querySelector('.weapon-header');
            const headerHTML = weaponHeader ? weaponHeader.outerHTML : '';
            
            // 清空表格并重新添加表头
            weaponsTable.innerHTML = headerHTML;
            
            // 添加保存的武器
            characterData.weapons.forEach((weaponData) => {
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
                const featureCell = document.createElement('div');
                featureCell.className = 'weapon-cell';
                const featureInput = document.createElement('input');
                featureInput.type = 'text';
                featureInput.className = 'weapon-feature';
                featureInput.value = weaponData.features || '';
                featureCell.appendChild(featureInput);
                
                // 添加到行
                weaponRow.appendChild(nameCell);
                weaponRow.appendChild(damageCell);
                weaponRow.appendChild(featureCell);
                
                // 添加到表格
                weaponsTable.appendChild(weaponRow);
            });
            
            // 应用武器行背景色
            applyWeaponRowColors();
        }
    } catch (error) {
        console.error('Error loading character:', error);
    }
}

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

// Tab 切换功能
document.addEventListener('DOMContentLoaded', function() {
    console.log("初始化 Tab 切换功能...");
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    let currentTabIndex = 0; // 当前激活的tab索引

    // 打印初始状态
    console.log(`找到 ${tabs.length} 个 tab 标签和 ${tabContents.length} 个内容区域`);
    tabs.forEach((tab, i) => {
        console.log(`Tab ${i}: ${tab.textContent}, active=${tab.classList.contains('active')}`);
    });
    tabContents.forEach((content, i) => {
        console.log(`Content ${i}: ${content.id}, active=${content.classList.contains('active')}`);
    });

    // 确保初始状态正确
    // 移除所有active类
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // 添加active类到第一个tab
    if (tabs.length > 0) {
        tabs[0].classList.add('active');
        currentTabIndex = 0;
        const tabId = tabs[0].getAttribute('data-tab');
        const firstContent = document.getElementById(tabId);
        if (firstContent) {
            firstContent.classList.add('active');
            console.log(`初始化: 激活了 ${tabId}`);
        } else {
            console.error(`初始化: 找不到内容 ${tabId}`);
        }
    }

    // 点击tab切换
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', (event) => {
            event.preventDefault(); // 防止默认行为
            console.log(`点击了 tab ${index}: ${tab.textContent}`);
            switchTab(index);
            return false;
        });
    });

    // 添加键盘事件监听
    document.addEventListener('keydown', function(e) {
        // 如果按下的是Tab键，并且没有按下其他修饰键(Alt, Ctrl, Shift)
        if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault(); // 阻止默认的Tab行为
            // 切换到下一个tab
            currentTabIndex = (currentTabIndex + 1) % tabs.length;
            console.log(`按下Tab键: 切换到 ${currentTabIndex}`);
            switchTab(currentTabIndex);
            return false;
        }
    });

    // 切换tab的函数
    function switchTab(index) {
        console.log(`切换到tab ${index}`);
        // 移除所有active类
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // 添加active类到当前选中的tab
        tabs[index].classList.add('active');
        currentTabIndex = index;
        const tabId = tabs[index].getAttribute('data-tab');
        console.log(`Tab ID: ${tabId}`);
        const tabContent = document.getElementById(tabId);
        if (tabContent) {
            tabContent.classList.add('active');
            console.log(`激活了内容: ${tabId}`);
            
            // 检查内容区域是否真的显示了
            setTimeout(() => {
                const computedStyle = window.getComputedStyle(tabContent);
                console.log(`${tabId} 的计算样式: display=${computedStyle.display}, visibility=${computedStyle.visibility}`);
            }, 100);
        } else {
            console.error(`找不到内容: ${tabId}`);
        }
    }

    // 监听主页面调查员姓名变化
    const characterNameInput = document.getElementById('character-name');
    const customCharacterName = document.getElementById('custom-character-name');

    if (characterNameInput && customCharacterName) {
        // 初始化时设置名称
        customCharacterName.textContent = characterNameInput.value;
        
        // 添加输入事件监听
        characterNameInput.addEventListener('input', function() {
            customCharacterName.textContent = this.value;
        });
    }

    // 自定义技能功能
    setupCustomSkills();
});

// 设置自定义技能功能
function setupCustomSkills() {
    // 为所有现有的自定义技能添加计算逻辑
    const customSkillsContainer = document.querySelector('.custom-skills-container');
    if (customSkillsContainer) {
        // 监听输入变化以计算总值
        customSkillsContainer.addEventListener('input', function(e) {
            const target = e.target;
            // 只处理职业点数、兴趣点数和成长点数输入框
            if (target.classList.contains('skill-occupation') || 
                target.classList.contains('skill-interest') || 
                target.classList.contains('skill-growth')) {
                
                const skillItem = target.closest('.skill-item');
                if (skillItem) {
                    calculateSkillTotal(skillItem);
                }
            }
        });

        // 初始化所有技能的总值
        const skillItems = customSkillsContainer.querySelectorAll('.skill-item');
        skillItems.forEach(item => {
            calculateSkillTotal(item);
        });
    }
}

// 计算技能总值
function calculateSkillTotal(skillItem) {
    const baseInput = skillItem.querySelector('.skill-base');
    const occupationInput = skillItem.querySelector('.skill-occupation');
    const interestInput = skillItem.querySelector('.skill-interest');
    const growthInput = skillItem.querySelector('.skill-growth');
    const totalInput = skillItem.querySelector('.skill-total');
    const halfInput = skillItem.querySelector('.skill-half');
    const fifthInput = skillItem.querySelector('.skill-fifth');
    
    if (baseInput && occupationInput && interestInput && growthInput && totalInput) {
        const base = parseInt(baseInput.value) || 0;
        const occupation = parseInt(occupationInput.value) || 0;
        const interest = parseInt(interestInput.value) || 0;
        const growth = parseInt(growthInput.value) || 0;
        
        const total = base + occupation + interest + growth;
        totalInput.value = total;
        
        // 计算困难和极难成功率
        if (halfInput) {
            halfInput.value = Math.floor(total / 2);
        }
        
        if (fifthInput) {
            fifthInput.value = Math.floor(total / 5);
        }
    }
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

// 添加标志变量来跟踪initPrint是否已被调用
let printInitialized = false;

// 初始化打印功能
function initPrint() {
    // 如果已经初始化过打印功能，则直接返回
    if (printInitialized) {
        console.log('打印功能已经初始化过，跳过重复初始化');
        return;
    }
    
    const printButton = document.getElementById('print-button');
    const printModal = document.getElementById('print-modal');
    const confirmPrintButton = document.getElementById('confirm-print');
    const cancelPrintButton = document.getElementById('cancel-print');
    const printCharacterCheckbox = document.getElementById('print-character');
    const printCustomSkillsCheckbox = document.getElementById('print-custom-skills');
    const printItemsCheckbox = document.getElementById('print-items');
    
    console.log('初始化打印功能...');

    // 打印按钮点击事件
    if (printButton) {
    printButton.addEventListener('click', function() {
            console.log('打印按钮被点击');
        printModal.style.display = 'flex';
    });
    } else {
        console.error('找不到打印按钮');
    }

    // 取消按钮点击事件
    if (cancelPrintButton) {
    cancelPrintButton.addEventListener('click', function() {
        printModal.style.display = 'none';
    });
    }

    // 点击模态框外部关闭
    if (printModal) {
    printModal.addEventListener('click', function(event) {
        if (event.target === printModal) {
            printModal.style.display = 'none';
        }
    });
    } else {
        console.error('找不到打印模态框');
    }

    // 确认打印按钮点击事件
    if (confirmPrintButton) {
    confirmPrintButton.addEventListener('click', function() {
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
        if (printCharacterCheckbox) {
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
        }

        // 自定义技能部分
        const customSkillsSection = document.querySelector('#custom-skills');
        if (customSkillsSection && printCustomSkillsCheckbox) {
            if (!printCustomSkillsCheckbox.checked) {
                customSkillsSection.classList.add('print-hidden');
            } else {
                customSkillsSection.classList.remove('print-hidden');
                
                // 确保自定义技能页的调查员区域不会被隐藏
                const customInfoSection = customSkillsSection.querySelector('.basic-info-section');
                if (customInfoSection) {
                    customInfoSection.classList.remove('print-hidden');
                }
                
                // 在打印前标记空技能名行，使其数值在打印时不显示
                const customSkillsTable = document.getElementById('custom-skills-body');
                if (customSkillsTable) {
                    const rows = customSkillsTable.querySelectorAll('tr');
                    rows.forEach(row => {
                        // 获取左右两侧的技能名输入框
                        const leftNameInput = row.querySelector('td:nth-child(1) input');
                        const rightNameInput = row.querySelector('td:nth-child(9) input');
                        
                        // 如果左侧技能名为空，隐藏左侧的所有数值
                        if (leftNameInput && !leftNameInput.value.trim()) {
                            for (let i = 2; i <= 8; i++) { // 从第2个到第8个单元格
                                const cell = row.querySelector(`td:nth-child(${i})`);
                                if (cell) {
                                    const inputs = cell.querySelectorAll('input');
                                    inputs.forEach(input => {
                                        input.classList.add('print-empty-skill');
                                    });
                                }
                            }
                        }
                        
                        // 如果右侧技能名为空，隐藏右侧的所有数值
                        if (rightNameInput && !rightNameInput.value.trim()) {
                            for (let i = 10; i <= 16; i++) { // 从第10个到第16个单元格
                                const cell = row.querySelector(`td:nth-child(${i})`);
                                if (cell) {
                                    const inputs = cell.querySelectorAll('input');
                                    inputs.forEach(input => {
                                        input.classList.add('print-empty-skill');
                                    });
                                }
                            }
                        }
                    });
                }
            }
        }

        // 获取当前活动的标签页，以便打印后恢复
        const currentActiveTab = document.querySelector('.tab.active');

        // 关闭模态框
        printModal.style.display = 'none';

        // 创建一个临时样式标签，使所有要打印的内容在打印时可见
        const tempStyle = document.createElement('style');
        tempStyle.id = 'temp-print-style';
        
        // 创建针对打印的样式内容
        let styleContent = `
            @media print {
                /* 默认隐藏所有标签内容 */
                .tab-content {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    height: 0 !important;
                    overflow: hidden !important;
                    position: absolute !important;
                    left: -9999px !important;
                }
                
                /* 调整打印布局，确保内容不会重叠 */
                body {
                    overflow: visible !important;
                    height: auto !important;
                }
                
                /* 重置定位，防止内容重叠 */
                .tab-content.print-visible {
                    visibility: visible !important;
                    opacity: 1 !important;
                    overflow: visible !important;
                    height: auto !important;
                    page-break-after: always !important;
                    margin-bottom: 20px !important;
                    left: 0 !important;
                }
        `;
        
        // 如果选择了打印主页面
        if (printCharacterCheckbox && printCharacterCheckbox.checked) {
            styleContent += `
                /* 显示主页面 */
                #main-sheet {
                    display: grid !important; /* 使用grid布局，与原始布局一致 */
                    grid-template-columns: 3fr 2fr !important;
                    grid-template-rows: auto auto auto auto !important; 
                    gap: 2px !important;
                    position: static !important;
                    opacity: 1 !important;
                    z-index: 1 !important;
                    visibility: visible !important;
                    overflow: visible !important;
                    height: auto !important;
                    width: 100% !important;
                    page-break-after: always !important;
                }
            `;
            
            // 给主页面添加标记类，方便打印后清理
            document.getElementById('main-sheet').classList.add('print-visible');
        }
        
        // 如果选择了打印自定义技能页
        if (printCustomSkillsCheckbox && printCustomSkillsCheckbox.checked) {
            styleContent += `
                /* 显示自定义技能页 */
                #custom-skills {
                    display: flex !important; /* 使用flex布局，与原始布局一致 */
                    flex-direction: column !important;
                    position: static !important;
                    opacity: 1 !important;
                    z-index: 1 !important;
                    visibility: visible !important;
                    overflow: visible !important;
                    height: auto !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background-color: white !important;
                    width: 100% !important;
                }
                
                /* 确保自定义技能页内部布局正确 */
                #custom-skills .sheet-section {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                }
                
                /* 保持表格布局不变 */
                #custom-skills .custom-skills-container table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    table-layout: fixed !important;
                }
            `;
            
            // 给自定义技能页添加标记类，方便打印后清理
            document.getElementById('custom-skills').classList.add('print-visible');
        }
        
        // 关闭媒体查询
        styleContent += `
            }
        `;
        
        tempStyle.textContent = styleContent;
        document.head.appendChild(tempStyle);

        // 执行打印
        setTimeout(() => {
                    window.print();
            
            // 打印完成后清理
            // 移除临时样式
            const tempStyleElement = document.getElementById('temp-print-style');
            if (tempStyleElement) {
                tempStyleElement.remove();
            }
            
            // 移除临时添加的标记类
            document.querySelectorAll('.tab-content.print-visible').forEach(element => {
                element.classList.remove('print-visible');
            });
            
            // 移除空技能名行的标记
            document.querySelectorAll('.print-empty-skill').forEach(element => {
                element.classList.remove('print-empty-skill');
            });
            
                // 打印完成后恢复显示所有部分
                document.querySelectorAll('.print-hidden').forEach(element => {
                    element.classList.remove('print-hidden');
                });
        }, 100);
    });
    }
    
    // 设置标志，表示打印功能已初始化
    printInitialized = true;
}

// 主初始化函数，确保所有功能都被初始化
function initAll() {
    console.log('正在初始化所有功能...');
    
    try {
        // 不再重复初始化打印功能，因为已经在 initCharacterSheet 中初始化过了
        // initPrint(); - 已移除，避免重复初始化
        console.log('避免重复初始化打印功能');
    } catch (error) {
        console.error('初始化过程出错:', error);
    }
    
    // 应用武器行背景色
    try {
        applyWeaponRowColors();
        console.log('武器行背景色应用完成');
    } catch (error) {
        console.error('应用武器行背景色出错:', error);
    }
}

// 确保在 DOM 完全加载后初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 加载完成，开始初始化所有功能');
    
    // 在页面加载完成后的短暂延迟后初始化
    setTimeout(function() {
        initAll();
    }, 300);
});

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
        row.style.backgroundColor = i % 2 === 0 ? '#f2f2f2' : 'white';
        row.style.height = '22px';
        row.style.borderBottom = '1px solid #ddd';
        
        // 创建左侧技能项
        const leftTds = createCustomSkillItem();
        leftTds.forEach(td => row.appendChild(td));
        
        // 创建右侧技能项（移除了中间的分隔列）
        const rightTds = createCustomSkillItem();
        rightTds.forEach(td => row.appendChild(td));
        
        customSkillsBody.appendChild(row);
    }
}

// 创建自定义技能项
function createCustomSkillItem() {
    // 使用数组存储所有td元素
    const tds = [];
    
    // 技能名称输入
    const nameTd = document.createElement('td');
    nameTd.style.width = '95px';
    nameTd.style.padding = '1px';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'skill-name';
    nameInput.placeholder = '技能名称';
    nameInput.style.width = '90px';
    nameInput.style.border = 'none';
    nameInput.style.background = 'transparent';
    nameInput.style.fontSize = '11px';
    nameTd.appendChild(nameInput);
    tds.push(nameTd);
    
    // 基础值 - 固定为0且只读
    const baseTd = document.createElement('td');
    baseTd.style.width = '30px';
    baseTd.style.padding = '1px';
    baseTd.style.textAlign = 'center';
    const baseInput = document.createElement('input');
    baseInput.type = 'text';
    baseInput.className = 'skill-base';
    baseInput.value = '0';
    baseInput.readOnly = true;
    baseInput.style.width = '25px';
    baseInput.style.textAlign = 'center';
    baseInput.style.border = 'none';
    baseInput.style.background = 'transparent';
    baseInput.style.fontSize = '11px';
    baseTd.appendChild(baseInput);
    tds.push(baseTd);
    
    // 职业点数
    const occTd = document.createElement('td');
    occTd.style.width = '30px';
    occTd.style.padding = '1px';
    occTd.style.textAlign = 'center';
    const occInput = document.createElement('input');
    occInput.type = 'text';
    occInput.className = 'skill-occupation';
    occInput.value = '0';
    occInput.style.width = '25px';
    occInput.style.textAlign = 'center';
    occInput.style.border = 'none';
    occInput.style.background = 'transparent';
    occInput.style.fontSize = '11px';
    occTd.appendChild(occInput);
    tds.push(occTd);
    
    // 兴趣点数
    const intTd = document.createElement('td');
    intTd.style.width = '30px';
    intTd.style.padding = '1px';
    intTd.style.textAlign = 'center';
    const intInput = document.createElement('input');
    intInput.type = 'text';
    intInput.className = 'skill-interest';
    intInput.value = '0';
    intInput.style.width = '25px';
    intInput.style.textAlign = 'center';
    intInput.style.border = 'none';
    intInput.style.background = 'transparent';
    intInput.style.fontSize = '11px';
    intTd.appendChild(intInput);
    tds.push(intTd);
    
    // 成长点数
    const growthTd = document.createElement('td');
    growthTd.style.width = '30px';
    growthTd.style.padding = '1px';
    growthTd.style.textAlign = 'center';
    const growthInput = document.createElement('input');
    growthInput.type = 'text';
    growthInput.className = 'skill-growth';
    growthInput.value = '0';
    growthInput.style.width = '25px';
    growthInput.style.textAlign = 'center';
    growthInput.style.border = 'none';
    growthInput.style.background = 'transparent';
    growthInput.style.fontSize = '11px';
    growthTd.appendChild(growthInput);
    tds.push(growthTd);
    
    // 总值 - 只读
    const totalTd = document.createElement('td');
    totalTd.style.width = '30px';
    totalTd.style.padding = '1px';
    totalTd.style.textAlign = 'center';
    const totalInput = document.createElement('input');
    totalInput.type = 'text';
    totalInput.className = 'skill-total';
    totalInput.value = '0';
    totalInput.readOnly = true;
    totalInput.style.width = '25px';
    totalInput.style.textAlign = 'center';
    totalInput.style.border = 'none';
    totalInput.style.background = 'transparent';
    totalInput.style.fontSize = '11px';
    totalTd.appendChild(totalInput);
    tds.push(totalTd);
    
    // 困难成功值 - 只读
    const halfTd = document.createElement('td');
    halfTd.style.width = '30px';
    halfTd.style.padding = '1px';
    halfTd.style.textAlign = 'center';
    const halfInput = document.createElement('input');
    halfInput.type = 'text';
    halfInput.className = 'skill-half';
    halfInput.value = '0';
    halfInput.readOnly = true;
    halfInput.style.width = '25px';
    halfInput.style.textAlign = 'center';
    halfInput.style.border = 'none';
    halfInput.style.background = 'transparent';
    halfInput.style.fontSize = '11px';
    halfTd.appendChild(halfInput);
    tds.push(halfTd);
    
    // 极难成功值 - 只读
    const fifthTd = document.createElement('td');
    fifthTd.style.width = '30px';
    fifthTd.style.padding = '1px';
    fifthTd.style.textAlign = 'center';
    const fifthInput = document.createElement('input');
    fifthInput.type = 'text';
    fifthInput.className = 'skill-fifth';
    fifthInput.value = '0';
    fifthInput.readOnly = true;
    fifthInput.style.width = '25px';
    fifthInput.style.textAlign = 'center';
    fifthInput.style.border = 'none';
    fifthInput.style.background = 'transparent';
    fifthInput.style.fontSize = '11px';
    fifthTd.appendChild(fifthInput);
    tds.push(fifthTd);
    
    // 添加事件监听器
    [occInput, intInput, growthInput].forEach(input => {
        input.addEventListener('input', function() {
            // 重新计算总值和成功率
            const base = 0; // 基础值固定为0
            const occ = parseInt(occInput.value) || 0;
            const int = parseInt(intInput.value) || 0;
            const growth = parseInt(growthInput.value) || 0;
            
            const total = base + occ + int + growth;
            totalInput.value = total;
            halfInput.value = Math.floor(total / 2);
            fifthInput.value = Math.floor(total / 5);
        });
    });
    
    return tds;
}

// 添加初始化自定义技能表的调用
document.addEventListener('DOMContentLoaded', function() {
    // 已有的初始化代码...
    
    // 初始化自定义技能表
    initCustomSkillsTable();
});