// 克苏鲁神话TRPG角色卡JavaScript文件
// 包含所有功能和事件处理

// 初始化函数，页面加载完成后执行
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM加载完成，初始化角色卡...");
    try {
        // 初始化角色卡
        initCharacterSheet();
        
        // 检查localStorage中的数据是否有效
        const savedData = localStorage.getItem("characterData");
        if (savedData) {
            try {
                // 尝试解析JSON数据
                const characterData = JSON.parse(savedData);
                
                // 验证数据结构是否完整
                if (characterData && 
                    characterData.basic && 
                    (characterData.basic.characterName || 
                     characterData.attributes && Object.values(characterData.attributes).some(val => val))) {
                    
                    // 数据有效，询问是否加载
                    if (confirm("检测到有保存的角色数据，是否加载？")) {
                        loadCharacter();
                    }
                } else {
                    console.log("发现无效或空的角色数据，不提示加载");
                    // 数据无效或为空，清除localStorage
                    localStorage.removeItem("characterData");
                }
            } catch (parseError) {
                console.error("解析保存的数据时出错:", parseError);
                // JSON解析错误，清除localStorage
                localStorage.removeItem("characterData");
            }
        }
        
        // 设置初始化标志
        initializationComplete = true;
        
        console.log("角色卡初始化完成！");
    } catch (error) {
        console.error("初始化出错：", error);
    }

    // 监听主页面调查员姓名变化
    const characterNameInput = document.getElementById('character-name');
    const customCharacterName = document.getElementById('custom-character-name');
    const itemsCharacterName = document.getElementById('items-character-name');
    const notesCharacterName = document.getElementById('notes-character-name'); // 新增

    if (characterNameInput && notesCharacterName) {
        // 初始化时设置笔记页姓名
        notesCharacterName.textContent = characterNameInput.value;
        
        // 添加输入事件监听
        characterNameInput.addEventListener('input', function() {
            notesCharacterName.textContent = this.value;
        });
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
    { 
        name: "驾驶", 
        base: -1, 
        subtypes: [
            { name: "船", base: 1 },
            { name: "马车", base: 1 },
            { name: "飞行器", base: 1 } // 将25改为1
        ], 
        rows: 3 
    }
];

// 道具类别数据
const itemCategories = [
    "武器", "防具", "魔法物品", "书籍", "药品", "工具", "日常用品", "珍稀物品", "其他"
];

// 新增笔记类别数据
const noteCategories = [
    "冒险", "功法", "羁绊", "待办", "其他"
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
    
    // 初始化自定义技能表和道具表，确保打印时能显示
    setTimeout(() => {
        // 初始化自定义技能表
        const customSkillsBody = document.getElementById('custom-skills-body');
        if (customSkillsBody && customSkillsBody.children.length === 0) {
            console.log('页面加载时预初始化自定义技能表');
            initCustomSkillsTable();
            setupCustomSkills();
        }
        
        // 初始化道具表
        const itemsBody = document.getElementById('items-body');
        if (itemsBody && itemsBody.children.length === 0) {
            console.log('页面加载时预初始化道具表');
            initItemsTable();
        }
        
        // 更新衍生属性（包括理智值）
        console.log('页面加载完成后更新衍生属性');
        updateDerivedStats();
    }, 500);
    
    // 在初始化完成后添加
    setTimeout(() => {
        updatePointsRemaining();
        updateDerivedStats();
    }, 500);
    
    // 初始化笔记表（复制initItemsTable修改）
    initNotesTable(); // 新增初始化笔记表
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
        
        // 更新起始理智值为意志值
        if (sanityStartElement) {
            if (powValue === 0) {
                sanityStartElement.value = ''; // 如果意志为0或未填，显示为空
            } else {
                // 设置起始理智值为意志值
                sanityStartElement.value = powValue;
            }
        }
        
        // 设置最大理智值为99-克苏鲁神话值
        if (sanityMaxElement) {
            const maxSanity = Math.max(0, 99 - cthulhuMythosValue);
            sanityMaxElement.value = maxSanity;
        }
        
        // 如果理智起始值大于最大值，则将起始值设置为最大值
        if (sanityStartElement && sanityMaxElement) {
            const startVal = parseInt(sanityStartElement.value) || 0;
            const maxVal = parseInt(sanityMaxElement.value) || 0;
            
            if (startVal > maxVal) {
                sanityStartElement.value = maxVal;
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

        // 更新现有驾驶子技能的基础值
        document.querySelectorAll('.skill-row').forEach(row => {
            const nameSpan = row.querySelector('.skill-name span');
            if (nameSpan && nameSpan.textContent.trim() === '飞行器') {
                const baseInput = row.querySelector('.base-value');
                if (baseInput && baseInput.value === '25') {
                    baseInput.value = '1';
                    calculateSkillSuccess(row); // 重新计算成功率
                }
            }
        });
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
            nameSpan.setAttribute('data-skill', parentSkillName);
            skillRow.classList.add('sub-skill-row');
        } else {
            nameSpan.textContent = skillData.name;
            nameSpan.setAttribute('data-skill', skillData.name);
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
                
                // 重新计算成功率
                calculateSkillSuccess(skillRow);
                
                // 关闭弹窗
                document.body.removeChild(modal);
                
                // 触发保存
                saveCharacter(false);
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
        
        // 设置职业、兴趣和成长点数为0时显示为空
        const occupationInput = skillRow.querySelector('.occupation-points');
        if (occupationInput && occupationPoints === 0) {
            occupationInput.value = '';
        }
        
        const interestInput = skillRow.querySelector('.interest-points');
        if (interestInput && interestPoints === 0) {
            interestInput.value = '';
        }
        
        const growthInput = skillRow.querySelector('.growth-points');
        if (growthInput && growthPoints === 0) {
            growthInput.value = '';
        }
        
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
        document.getElementById('occupation-remaining').textContent = occupationRemaining; // 移除Math.max限制

        // 兴趣点数
        const interestTotal = parseInt(document.getElementById('interest-points').value) || 0;
        let interestUsed = 0;
        document.querySelectorAll('.interest-points').forEach(input => {
            interestUsed += parseInt(input.value) || 0;
        });
        const interestRemaining = interestTotal - interestUsed;
        document.getElementById('interest-remaining').textContent = interestRemaining; // 移除Math.max限制
        
        // 更新职业点数显示
        const occupationRemainingElement = document.getElementById('occupation-remaining');
        occupationRemainingElement.textContent = occupationRemaining;
        occupationRemainingElement.className = occupationRemaining < 0 ? 'negative' : '';

        // 更新兴趣点数显示
        const interestRemainingElement = document.getElementById('interest-remaining');
        interestRemainingElement.textContent = interestRemaining;
        interestRemainingElement.className = interestRemaining < 0 ? 'negative' : '';
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
                        // 获取头像容器尺寸
                        const containerWidth = avatarContainer.clientWidth;
                        const containerHeight = avatarContainer.clientHeight;
                        
                        // 创建Canvas进行尺寸调整
                        const canvas = document.createElement('canvas');
                        canvas.width = containerWidth;
                        canvas.height = containerHeight;
                        const ctx = canvas.getContext('2d');
                        
                        // 计算缩放和居中
                        let scale = Math.min(containerWidth / img.width, containerHeight / img.height);
                        let x = (containerWidth - img.width * scale) / 2;
                        let y = (containerHeight - img.height * scale) / 2;
                        
                        // 绘制图像
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                        
                        // 转换为图像数据
                        const resizedImageData = canvas.toDataURL('image/jpeg', 0.85);
                        
                        // 设置头像
                        avatarImg.src = resizedImageData;
                        avatarImg.style.display = 'block';
                        document.querySelector('.avatar-placeholder').style.display = 'none';
                        
                        console.log('头像已调整为容器尺寸：' + containerWidth + 'x' + containerHeight);
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

// 初始化保存/加载功能
function initSaveLoad() {
    try {
        // 保存按钮 - 保存到本地缓存
        document.getElementById('save-button').addEventListener('click', function() {
            saveCharacter(true); // 显示提示
        });
        
        // 导出按钮 - 将数据导出为JSON文件
        document.getElementById('export-button').addEventListener('click', function() {
            exportCharacter();
        });
        
        // 导入按钮 - 从JSON文件导入数据
        document.getElementById('import-button').addEventListener('click', function() {
            importCharacter();
        });
    } catch (error) {
        console.error('Error initializing save/load:', error);
    }
}

// 导出角色数据
function exportCharacter() {
    try {
        // 获取当前角色数据
        saveCharacter(false); // 先保存当前状态，但不显示提示
        const dataStr = localStorage.getItem('characterData');
        if (!dataStr) {
            alert('没有可导出的角色数据');
            return;
        }
        
        // 解析数据
        const characterData = JSON.parse(dataStr);
        
        // 移除头像数据以减小文件大小
        if (characterData.avatar) {
            delete characterData.avatar; // 删除头像数据
        }
        
        // 将修改后的数据转换回JSON字符串
        const exportDataStr = JSON.stringify(characterData, null, 2);
        
        // 创建下载链接
        const characterName = characterData.basic?.characterName || 'character';
        const fileName = `${characterName}_${new Date().toISOString().split('T')[0]}.json`;
        
        const blob = new Blob([exportDataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        alert('角色数据已导出');
    } catch (error) {
        console.error('导出角色数据错误:', error);
        alert('导出失败，请稍后再试');
    }
}

// 从JSON文件导入角色数据
function importCharacter() {
    try {
        // 创建文件输入框并模拟点击
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                
                if (file) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        
                        // 将导入的数据保存到localStorage
                        localStorage.setItem('characterData', JSON.stringify(importedData));
                        
                        // 加载数据到表单，跳过显示本地缓存加载提示
                        loadCharacter(true);
                        
                        alert('角色数据已成功导入');
                    } catch (parseError) {
                        console.error('Error parsing JSON:', parseError);
                        alert('导入的文件不是有效的角色数据文件');
                    }
                };
                    
                    reader.readAsText(file);
                }
            });
            
        document.body.appendChild(fileInput);
        fileInput.click();
            
            // 清理DOM
            setTimeout(() => {
            document.body.removeChild(fileInput);
            }, 100);
    } catch (error) {
        console.error('Error importing character:', error);
        alert('导入失败，请稍后再试。');
    }
}

// 保存角色数据
function saveCharacter(showAlert = true) {
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
                    current: document.querySelector('.sanity-current') ? document.querySelector('.sanity-current').value : '',
                    start: document.querySelector('.sanity-start') ? document.querySelector('.sanity-start').value : '',
                    max: document.querySelector('.sanity-max') ? document.querySelector('.sanity-max').value : ''
                },
                health: {
                    current: document.querySelector('.health-current') ? document.querySelector('.health-current').value : '',
                    max: document.querySelector('.health-max') ? document.querySelector('.health-max').value : '',
                    temp: document.querySelector('.health-temp') ? document.querySelector('.health-temp').value : ''
                },
                magic: {
                    current: document.querySelector('.magic-current') ? document.querySelector('.magic-current').value : '',
                    max: document.querySelector('.magic-max') ? document.querySelector('.magic-max').value : '',
                    temp: document.querySelector('.magic-temp') ? document.querySelector('.magic-temp').value : ''
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
            },
            items: []
        };
        
        // 收集技能数据
        document.querySelectorAll('.skill-row').forEach(skillRow => {
            const nameElement = skillRow.querySelector('.skill-name span');
            if (nameElement) {
                const skillName = nameElement.textContent.trim();
                const skillData = {
                    name: skillName,
                    isSubSkill: skillRow.classList.contains('sub-skill-row'), // 新增标识
                    parentSkill: skillRow.querySelector('.skill-name span').dataset.skill, // 获取父技能
                    checked: skillRow.querySelector('.skill-check').checked,
                    base: skillRow.querySelector('.base-value').value,
                    occupation: skillRow.querySelector('.occupation-points').value,
                    interest: skillRow.querySelector('.interest-points').value,
                    growth: skillRow.querySelector('.growth-points').value
                };
                
                // 获取实际选择的子类型（新增）
                const subtypeElement = skillRow.querySelector('.selected-subtype');
                if (subtypeElement && subtypeElement.textContent.trim()) {
                    skillData.subtype = subtypeElement.textContent.trim();
                    skillData.actualBase = skillRow.querySelector('.base-value').value; // 保存实际基础值
                }
                
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
        
        // 收集道具数据
        const itemRows = document.querySelectorAll('#items-body tr');
        const itemsData = [];
        
        itemRows.forEach(row => {
            const nameInputs = row.querySelectorAll('.item-name');
            const typeInputs = row.querySelectorAll('.item-type input');
            const noteInputs = row.querySelectorAll('.item-note');
            
            for (let i = 0; i < nameInputs.length; i++) {
                if (nameInputs[i].value || typeInputs[i].value || noteInputs[i].value) {
                    itemsData.push({
                        name: nameInputs[i].value,
                        type: typeInputs[i].value,
                        note: noteInputs[i].value
                    });
                }
            }
        });
        
        // 将道具数据添加到保存对象中 - 添加此行
        characterData.items = itemsData;
        
        // 保存笔记数据 - 按纵向顺序收集
        const noteRows = document.querySelectorAll('#notes-body tr');
        const notesData = [];
        const totalRows = noteRows.length;

        // 先收集左列数据
        noteRows.forEach((row, rowIndex) => {
            const leftNameInput = row.querySelector('td:nth-child(1) .item-name');
            const leftTypeInput = row.querySelector('td:nth-child(2) .item-type-input'); // 修改选择器
            const leftNoteInput = row.querySelector('td:nth-child(3) .item-note');

            if (leftNameInput && (leftNameInput.value || leftTypeInput.value || leftNoteInput.value)) {
                notesData.push({
                    name: leftNameInput.value || '',
                    type: leftTypeInput.value || '',
                    note: leftNoteInput.value || ''
                });
            }
        });

        // 再收集右列数据
        noteRows.forEach((row, rowIndex) => {
            const rightNameInput = row.querySelector('td:nth-child(4) .item-name');
            const rightTypeInput = row.querySelector('td:nth-child(5) .item-type-input'); // 修改选择器
            const rightNoteInput = row.querySelector('td:nth-child(6) .item-note');

            if (rightNameInput && (rightNameInput.value || rightTypeInput.value || rightNoteInput.value)) {
                notesData.push({
                    name: rightNameInput.value || '',
                    type: rightTypeInput.value || '',
                    note: rightNoteInput.value || ''
                });
            }
        });

        // 将笔记数据添加到保存对象中
        characterData.notes = notesData;
        
        // 收集自定义技能数据
        const customSkillsData = [];
        const customSkillRows = document.querySelectorAll('#custom-skills-body tr');
        
        customSkillRows.forEach(row => {
            // 左侧技能
            const leftNameInput = row.querySelector('td:nth-child(1) input');
            const leftBaseInput = row.querySelector('td:nth-child(2) input');
            const leftOccInput = row.querySelector('td:nth-child(3) input');
            const leftIntInput = row.querySelector('td:nth-child(4) input');
            const leftGrowthInput = row.querySelector('td:nth-child(5) input');
            
            if (leftNameInput && leftNameInput.value) {
                customSkillsData.push({
                    name: leftNameInput.value,
                    base: leftBaseInput ? leftBaseInput.value : '0',
                    occupation: leftOccInput ? leftOccInput.value : '0',
                    interest: leftIntInput ? leftIntInput.value : '0',
                    growth: leftGrowthInput ? leftGrowthInput.value : '0',
                    position: 'left'
                });
            }
            
            // 右侧技能
            const rightNameInput = row.querySelector('td:nth-child(9) input');
            const rightBaseInput = row.querySelector('td:nth-child(10) input');
            const rightOccInput = row.querySelector('td:nth-child(11) input');
            const rightIntInput = row.querySelector('td:nth-child(12) input');
            const rightGrowthInput = row.querySelector('td:nth-child(13) input');
            
            if (rightNameInput && rightNameInput.value) {
                customSkillsData.push({
                    name: rightNameInput.value,
                    base: rightBaseInput ? rightBaseInput.value : '0',
                    occupation: rightOccInput ? rightOccInput.value : '0',
                    interest: rightIntInput ? rightIntInput.value : '0',
                    growth: rightGrowthInput ? rightGrowthInput.value : '0',
                    position: 'right'
                });
            }
        });
        
        // 将自定义技能数据添加到保存对象中
        characterData.customSkills = customSkillsData;
        
        // 将数据保存到本地存储
        const characterName = characterData.basic.characterName || 'character';
        const dataStr = JSON.stringify(characterData);
        localStorage.setItem('characterData', dataStr);
        
        // 只在showAlert为true时显示提示
        if (showAlert) {
            alert('角色数据已保存到本地缓存');
        }
    } catch (error) {
        console.error('Error saving character:', error);
        if (showAlert) {
        alert('保存失败，请稍后再试。');
        }
    }
}

// 加载角色数据
function loadCharacter(skipAlert = false) {
    try {
        // 获取本地保存的数据
        const dataStr = localStorage.getItem('characterData');
        if (!dataStr) {
            // 没有保存的数据
            if (!skipAlert) {
            alert('没有找到保存的角色数据');
            }
            return;
        }
        
        // 解析JSON数据
        const characterData = JSON.parse(dataStr);
        
        // 检查数据是否为空或无效
        if (!characterData || !characterData.basic) {
            alert('保存的角色数据无效或为空');
            localStorage.removeItem('characterData');
            return;
        }
        
        // ===== 重建技能表容器开始 =====
        console.log('完全重建技能表...');
        
        // 完全移除并重建技能表容器
        const skillsContainer = document.querySelector('.skills-container');
        if (skillsContainer) {
            const parent = skillsContainer.parentNode;
            
            // 保存父元素的引用
            const skillsSection = parent;
            
            // 移除旧容器
            skillsContainer.remove();
            
            // 创建新容器
            const newContainer = document.createElement('div');
            newContainer.className = 'skills-container';
            skillsSection.appendChild(newContainer);
            
            console.log('技能表容器已重建');
        }
        
        // 强制重新初始化技能表
        initSkills();
        // ===== 重建技能表容器结束 =====
        
        // 基本信息加载...
        if (characterData.basic) {
            document.getElementById('character-name').value = characterData.basic.characterName || '';
            document.getElementById('player-name').value = characterData.basic.playerName || '';
            document.getElementById('era').value = characterData.basic.era || '';
            document.getElementById('occupation').value = characterData.basic.occupation || '';
            document.getElementById('age').value = characterData.basic.age || '';
            document.getElementById('gender').value = characterData.basic.gender || '';
            document.getElementById('residence').value = characterData.basic.residence || '';
            document.getElementById('birthplace').value = characterData.basic.birthplace || '';
            
            // 更新所有tab页面的角色名称
            document.getElementById('custom-character-name').textContent = characterData.basic.characterName || '';
            document.getElementById('items-character-name').textContent = characterData.basic.characterName || '';
            document.getElementById('notes-character-name').textContent = characterData.basic.characterName || '';
            
            // 伙伴复选框
            if (document.getElementById('is-partner')) {
                document.getElementById('is-partner').checked = characterData.basic.isPartner || false;
            }
        }
        
        // 属性加载...
        if (characterData.attributes) {
            Object.entries(characterData.attributes).forEach(([key, value]) => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = value;
                }
            });
        }
        
        // 状态加载...
        if (characterData.status) {
            // 理智值
            if (characterData.status.sanity) {
                const currentSan = document.querySelector('.sanity-current');
                if (currentSan) currentSan.value = characterData.status.sanity.current || '';
                
                const startSan = document.querySelector('.sanity-start');
                if (startSan) startSan.value = characterData.status.sanity.start || '';
                
                const maxSan = document.querySelector('.sanity-max');
                if (maxSan) maxSan.value = characterData.status.sanity.max || '99';
            }
            
            // 生命值
            if (characterData.status.health) {
                const currentHp = document.querySelector('.health-current');
                if (currentHp) currentHp.value = characterData.status.health.current || '';
                
                const maxHp = document.querySelector('.health-max');
                if (maxHp) maxHp.value = characterData.status.health.max || '';
                
                const tempHp = document.querySelector('.health-temp');
                if (tempHp) tempHp.value = characterData.status.health.temp || '';
            }
            
            // 魔法值
            if (characterData.status.magic) {
                const currentMp = document.querySelector('.magic-current');
                if (currentMp) currentMp.value = characterData.status.magic.current || '';
                
                const maxMp = document.querySelector('.magic-max');
                if (maxMp) maxMp.value = characterData.status.magic.max || '';
                
                const tempMp = document.querySelector('.magic-temp');
                if (tempMp) tempMp.value = characterData.status.magic.temp || '';
            }
        }
        
        // 技能点数
        if (characterData.skills) {
            document.getElementById('occupation-points').value = characterData.skills.occupationPoints || '0';
            document.getElementById('interest-points').value = characterData.skills.interestPoints || '0';
            updatePointsRemaining();
            
            // 创建技能列表并填充数据
            if (characterData.skills.skillsList && characterData.skills.skillsList.length > 0) {
                const leftColumn = document.querySelector('.skills-column.left-column');
                const rightColumn = document.querySelector('.skills-column.right-column');
                
                // 清空现有技能
                leftColumn.innerHTML = '';
                rightColumn.innerHTML = '';
                
                // 重新创建技能列表
                createSkillsList();
                
                // 加载技能值
                characterData.skills.skillsList.forEach(skillData => {
                    // 处理子技能
                    if (skillData.isSubSkill) {
                        // 通过父技能和子类型查找对应的子技能行
                        const parentSkills = document.querySelectorAll(`.skill-name span[data-skill="${skillData.parentSkill}"]`);
                        parentSkills.forEach(parentSkill => {
                            const parentRow = parentSkill.closest('.skill-row');
                            const subRows = parentRow.parentElement.querySelectorAll('.sub-skill-row');
                            
                            subRows.forEach(subRow => {
                                const subtypeSpan = subRow.querySelector('.selected-subtype');
                                if (subtypeSpan && subtypeSpan.textContent === skillData.subtype) {
                                    // 找到匹配的子技能行
                                    const baseInput = subRow.querySelector('.base-value');
                                    if (baseInput) baseInput.value = skillData.actualBase || '0';
                                    
                                    const occupationInput = subRow.querySelector('.occupation-points');
                                    if (occupationInput) occupationInput.value = skillData.occupation || '';
                                    
                                    const interestInput = subRow.querySelector('.interest-points');
                                    if (interestInput) interestInput.value = skillData.interest || '';
                                    
                                    const growthInput = subRow.querySelector('.growth-points');
                                    if (growthInput) growthInput.value = skillData.growth || '';
                                    
                                    calculateSkillSuccess(subRow);
                                }
                            });
                        });
                    } 
                    else {
                        // 原有常规技能加载逻辑
                        const skillElement = document.querySelector(`.skill-name span[data-skill="${skillData.name}"]`);
                        
                        if (skillElement) {
                            const skillRow = skillElement.closest('.skill-row');
                            
                            // 设置勾选状态
                            const checkbox = skillRow.querySelector('.skill-check');
                            if (checkbox) checkbox.checked = skillData.checked || false;
                            
                            // 设置基础值
                            const baseInput = skillRow.querySelector('.base-value');
                            if (baseInput) baseInput.value = skillData.base || '0';
                            
                            // 设置职业点数
                            const occupationInput = skillRow.querySelector('.occupation-points');
                            if (occupationInput) {
                                const occValue = skillData.occupation || '0';
                                occupationInput.value = (occValue === '0') ? '' : occValue;
                            }
                            
                            // 设置兴趣点数
                            const interestInput = skillRow.querySelector('.interest-points');
                            if (interestInput) {
                                const intValue = skillData.interest || '0';
                                interestInput.value = (intValue === '0') ? '' : intValue;
                            }
                            
                            // 设置成长点数
                            const growthInput = skillRow.querySelector('.growth-points');
                            if (growthInput) {
                                const growthValue = skillData.growth || '0';
                                growthInput.value = (growthValue === '0') ? '' : growthValue;
                            }
                            
                            // 恢复子类型技能名称
                            if (skillData.subtype) {
                                const subtypeElement = skillRow.querySelector('.selected-subtype');
                                if (subtypeElement) {
                                    subtypeElement.textContent = skillData.subtype;
                                }
                            }
                            
                            // 计算成功率
                            calculateSkillSuccess(skillRow);
                        } else {
                            // 没有找到精确匹配的技能，可能是子类型技能
                            // 查找所有技能行并检查是否有匹配的
                            document.querySelectorAll('.skill-row').forEach(row => {
                                const nameSpan = row.querySelector('.skill-name span');
                                const subtypeSpan = row.querySelector('.selected-subtype');
                                
                                // 检查技能名和子类型是否匹配
                                if (nameSpan && skillData.name.includes(nameSpan.textContent.trim())) {
                                    // 如果有子类型且匹配
                                    if (skillData.subtype && subtypeSpan) {
                                        subtypeSpan.textContent = skillData.subtype;
                                        
                                        // 设置技能值
                                        const baseInput = row.querySelector('.base-value');
                                        if (baseInput) baseInput.value = skillData.base || '0';
                                        
                                        const occupationInput = row.querySelector('.occupation-points');
                                        if (occupationInput) {
                                            const occValue = skillData.occupation || '0';
                                            occupationInput.value = (occValue === '0') ? '' : occValue;
                                        }
                                        
                                        const interestInput = row.querySelector('.interest-points');
                                        if (interestInput) {
                                            const intValue = skillData.interest || '0';
                                            interestInput.value = (intValue === '0') ? '' : intValue;
                                        }
                                        
                                        const growthInput = row.querySelector('.growth-points');
                                        if (growthInput) {
                                            const growthValue = skillData.growth || '0';
                                            growthInput.value = (growthValue === '0') ? '' : growthValue;
                                        }
                                        
                                        const checkbox = row.querySelector('.skill-check');
                                        if (checkbox) checkbox.checked = skillData.checked || false;
                                        
                                        // 计算成功率
                                        calculateSkillSuccess(row);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
        
        // 战斗属性
        if (characterData.combat) {
            document.getElementById('damage-bonus').value = characterData.combat.damageBonus || '';
            document.getElementById('spirit-bonus').value = characterData.combat.spiritBonus || '';
            document.getElementById('build').value = characterData.combat.build || '';
            document.getElementById('armor').value = characterData.combat.armor || '';
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
        
        // 道具
        if (characterData.items && Array.isArray(characterData.items)) {
            console.log('加载道具数据...');
            
            const itemsBody = document.getElementById('items-body');
            if (itemsBody) {
                // 确保已初始化道具表
                if (itemsBody.children.length === 0) {
                    initItemsTable();
                }
                
                // 先清除所有输入框的值
                const allInputs = itemsBody.querySelectorAll('input');
                allInputs.forEach(input => {
                    input.value = '';
                    input.setAttribute('value', ''); // 同时清除value属性
                });
                
                // 按索引加载道具数据
                characterData.items.forEach(item => {
                    // 处理新旧数据格式的兼容性
                    let itemIndex;
                    
                    // 新版数据使用itemIndex
                    if (item.hasOwnProperty('itemIndex')) {
                        itemIndex = item.itemIndex;
                    } 
                    // 旧版数据使用rowIndex，需要转换
                    else if (item.hasOwnProperty('rowIndex')) {
                        // 旧的单列布局：一行一个道具，rowIndex对应行号
                        // 新的双列布局：一行两个道具，需要将旧的rowIndex转换为新的itemIndex
                        // 旧版左侧道具转为新版双列布局的对应位置
                        itemIndex = item.rowIndex * 2;
                    } 
                    // 最旧版本没有索引，直接按顺序放入
                    else {
                        // 对于没有索引的非常旧的数据，简单地放在前面的位置
                        itemIndex = characterData.items.indexOf(item) * 2;
                    }
                    
                    // 查找对应索引的输入框
                    const nameInput = document.querySelector(`#items-body input.item-name[data-item-index="${itemIndex}"]`);
                    const typeInput = document.querySelector(`#items-body input.item-type-input[data-item-index="${itemIndex}"]`);
                    const noteInput = document.querySelector(`#items-body textarea.item-note[data-item-index="${itemIndex}"]`);
                    
                    if (nameInput) {
                        nameInput.value = item.name || '';
                        nameInput.setAttribute('value', item.name || ''); // 设置属性值，这对打印很重要
                    }
                    
                    if (typeInput) {
                        typeInput.value = item.type || '';
                        typeInput.setAttribute('value', item.type || ''); // 设置属性值
                    }
                    
                    if (noteInput) {
                        noteInput.value = item.note || '';
                        // textarea不需要设置value属性
                        
                        // 添加调试日志
                        if (item.note) {
                            console.log(`加载道具数据: 索引${itemIndex} - 名称:${item.name}, 备注:${item.note}`);
                        }
                        
                        // 确保备注事件被正确添加
                        if (!noteInput.hasEventListener) {
                            addNoteEvents(noteInput);
                            noteInput.hasEventListener = true;
                        }
                    }
                });
            }
        }
        
        // 自定义技能
        if (characterData.customSkills && characterData.customSkills.length > 0) {
            // 确保自定义技能表格已初始化
            if (document.getElementById('custom-skills-body').children.length === 0) {
                    initCustomSkillsTable();
                }
                
            const rows = document.querySelectorAll('#custom-skills-body tr');
            let leftIndex = 0;
            let rightIndex = 0;
            
            // 分别处理左右两侧的技能
            characterData.customSkills.forEach(skill => {
                let rowIndex, startCell;
                
                if (skill.position === 'left') {
                    rowIndex = leftIndex;
                    startCell = 1; // 左侧起始单元格
                    leftIndex++;
                } else {
                    rowIndex = rightIndex;
                    startCell = 9; // 右侧起始单元格
                    rightIndex++;
                }
                
                if (rowIndex < rows.length) {
                        const row = rows[rowIndex];
                    
                    // 技能名称
                    const nameInput = row.querySelector(`td:nth-child(${startCell}) input`);
                        if (nameInput) nameInput.value = skill.name || '';
                    
                    // 基础值
                    const baseInput = row.querySelector(`td:nth-child(${startCell + 1}) input`);
                    if (baseInput) baseInput.value = skill.base || '0';
                    
                    // 职业点数
                    const occInput = row.querySelector(`td:nth-child(${startCell + 2}) input`);
                    if (occInput) occInput.value = skill.occupation === '0' ? '' : skill.occupation || '';
                    
                    // 兴趣点数
                    const intInput = row.querySelector(`td:nth-child(${startCell + 3}) input`);
                    if (intInput) intInput.value = skill.interest === '0' ? '' : skill.interest || '';
                    
                    // 成长点数
                    const growthInput = row.querySelector(`td:nth-child(${startCell + 4}) input`);
                    if (growthInput) growthInput.value = skill.growth === '0' ? '' : skill.growth || '';
                }
            });
            
            // 重新计算自定义技能的成功率
            setupCustomSkills();
        }
        
        // 在这里加载笔记数据 - 移动到try块内部
        if (characterData.notes && characterData.notes.length > 0) {
            // 确保笔记表格已初始化
            if (document.getElementById('notes-body').children.length === 0) {
                initNotesTable();
            }

            // 获取所有输入字段
            const rows = document.querySelectorAll('#notes-body tr');
            const totalRows = rows.length;

            // 按纵向顺序填充数据
            characterData.notes.forEach((note, index) => {
                // 计算正确的行和列位置
                const column = Math.floor(index / totalRows); // 0为左列，1为右列
                const row = index % totalRows;

                if (row < totalRows) {
                    const currentRow = rows[row];
                    const startCell = column * 3; // 每组3个单元格（名称、类型、备注）
                    
                    // 获取当前位置的输入框，修正选择器
                    const nameInput = currentRow.querySelector(`td:nth-child(${1 + startCell * 3}) .item-name`);
                    const typeInput = currentRow.querySelector(`td:nth-child(${2 + startCell * 3}) .item-type-input`); // 修改选择器
                    const noteInput = currentRow.querySelector(`td:nth-child(${3 + startCell * 3}) .item-note`);

                    // 填充数据
                    if (nameInput) {
                        nameInput.value = note.name || '';
                        nameInput.setAttribute('value', note.name || '');
                    }
                    if (typeInput) {
                        typeInput.value = note.type || '';
                        typeInput.setAttribute('value', note.type || '');
                    }
                    if (noteInput) {
                        noteInput.value = note.note || '';
                    }
                }
            });
        }
        
        // 显示加载成功提示（如果不跳过）
        if (!skipAlert) {
            alert('角色数据已从本地缓存加载');
        }
    } catch (error) {
        console.error('解析保存的数据时出错:', error);
        alert('加载失败，请稍后再试。');
    }
    
    // 在加载完成后更新衍生值
    setTimeout(() => {
        updatePointsRemaining();
        updateDerivedStats();
    }, 100);
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
        // 获取帮助模态框元素
        const helpModal = document.getElementById('help-modal');
        const helpModalBody = document.getElementById('help-modal-body');
        
        // 格式化帮助内容为HTML
        helpModalBody.innerHTML = `
            <h3>【基本操作】</h3>
            <ul>
                <li>填写角色基本信息（姓名、职业等）</li>
                <li>输入角色各项属性值（力量、体质等）</li>
                <li>分配职业点数和兴趣点数到相应技能</li>
                <li>记录角色的武器和道具</li>
            </ul>
            
            <h3>【数据管理】</h3>
            <ul>
                <li>保存按钮：将角色数据保存到本地缓存</li>
                <li>导入/导出：可将角色数据导出为JSON文件或从JSON文件导入</li>
                <li>重置按钮：清空所有数据并重新开始</li>
            </ul>
            
            <h3>【多页面管理】</h3>
            <ul>
                <li>主页面：角色基本信息、属性和技能</li>
                <li>自定义技能：可添加自定义技能</li>
                <li>道具页：记录角色携带的80种道具</li>
            </ul>
            
            <h3>【打印功能】</h3>
            <ul>
                <li>点击打印按钮可选择打印主页面、自定义技能页或道具页</li>
                <li>打印时会自动优化格式，隐藏不必要的元素</li>
                <li>道具页打印经过特别优化，可在一页纸上完整显示所有80个道具项目</li>
                <li>打印前请确保已保存角色数据，以免丢失</li>
            </ul>
            
            <p class="credits">Design by 龙王 jumper.rong@outlook.com<br>大胡子跑团版权所有</p>
        `;
        
        // 显示帮助模态框
        helpModal.style.display = 'flex';
        
        // 关闭帮助按钮点击事件
        document.getElementById('close-help').addEventListener('click', function() {
            helpModal.style.display = 'none';
        });
        
        // 点击模态框外部关闭
        helpModal.addEventListener('click', function(event) {
            if (event.target === helpModal) {
                helpModal.style.display = 'none';
            }
        });
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
        
        // 在切换页面前保存当前数据到本地缓存，不显示提示
        saveCharacter(false);
        
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
            
            // 如果切换到自定义技能页面，确保设置了计算功能
            if (tabId === 'custom-skills') {
                console.log('正在检查自定义技能页面初始化状态');
                // 检查是否已初始化自定义技能表
                const customSkillsBody = document.getElementById('custom-skills-body');
                if (customSkillsBody && customSkillsBody.children.length === 0) {
                    console.log('自定义技能表为空，进行初始化');
                    initCustomSkillsTable();
                }
                
                // 设置自定义技能计算功能
                setupCustomSkills();
                console.log('已重新设置自定义技能计算功能');
            }
            
            // 如果切换到道具页面，确保所有备注框都有事件监听器
            if (tabId === 'items') {
                console.log('切换到道具页面，检查备注框事件监听状态');
                const itemsBody = document.getElementById('items-body');
                if (itemsBody) {
                    if (itemsBody.children.length === 0) {
                        console.log('道具表为空，进行初始化');
                        initItemsTable();
                    } else {
                        console.log('道具表已存在，检查备注框事件监听器');
                        const noteInputs = itemsBody.querySelectorAll('.item-note');
                        noteInputs.forEach(noteInput => {
                            if (!noteInput.hasEventListener) {
                                addNoteEvents(noteInput);
                                noteInput.hasEventListener = true;
                                console.log('为道具备注框添加事件监听器');
                            }
                        });
                    }
                }
            }
            
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
    const itemsCharacterName = document.getElementById('items-character-name');
    const notesCharacterName = document.getElementById('notes-character-name'); // 新增

    if (characterNameInput && notesCharacterName) {
        // 初始化时设置笔记页姓名
        notesCharacterName.textContent = characterNameInput.value;
        
        // 添加输入事件监听
        characterNameInput.addEventListener('input', function() {
            notesCharacterName.textContent = this.value;
        });
    }

    // 同步道具页的调查员姓名
    if (characterNameInput && itemsCharacterName) {
        // 初始化时设置名称
        itemsCharacterName.textContent = characterNameInput.value;
        
        // 添加输入事件监听
        characterNameInput.addEventListener('input', function() {
            itemsCharacterName.textContent = this.value;
        });
    }

    // 自定义技能功能
    setupCustomSkills();
});

// 设置自定义技能功能
function setupCustomSkills() {
    // 为所有现有的自定义技能添加计算逻辑
    console.log('设置自定义技能计算功能');
    const customSkillsContainer = document.querySelector('#custom-skills .custom-skills-container');
    if (customSkillsContainer) {
        console.log('找到自定义技能容器');
        // 监听输入变化以计算总值
        customSkillsContainer.addEventListener('input', function(e) {
            const target = e.target;
            // 只处理职业点数、兴趣点数和成长点数输入框
            if (target.classList.contains('skill-occupation') || 
                target.classList.contains('skill-interest') || 
                target.classList.contains('skill-growth')) {
                
                console.log('检测到输入变化:', target.className);
                // 查找含有该输入框的td单元格
                const td = target.closest('td');
                if (td && td.parentElement) {
                    const row = td.parentElement; // tr元素
                    // 查找该行中的所有相关输入框
                    const inputs = {
                        base: row.querySelector('.skill-base'),
                        occupation: row.querySelector('.skill-occupation'),
                        interest: row.querySelector('.skill-interest'),
                        growth: row.querySelector('.skill-growth'),
                        total: row.querySelector('.skill-total'),
                        half: row.querySelector('.skill-half'),
                        fifth: row.querySelector('.skill-fifth')
                    };
                    
                    // 计算总值
                    if (inputs.base && inputs.occupation && inputs.interest && inputs.growth && inputs.total) {
                        const base = parseInt(inputs.base.value) || 0;
                        const occupation = parseInt(inputs.occupation.value) || 0;
                        const interest = parseInt(inputs.interest.value) || 0;
                        const growth = parseInt(inputs.growth.value) || 0;
                        
                        // 设置职业、兴趣和成长点数为0时显示为空
                        if (occupation === 0) inputs.occupation.value = '';
                        if (interest === 0) inputs.interest.value = '';
                        if (growth === 0) inputs.growth.value = '';
                        
                        const total = base + occupation + interest + growth;
                        inputs.total.value = total;
                        
                        // 计算困难和极难成功率
                        if (inputs.half) {
                            inputs.half.value = Math.floor(total / 2);
                        }
                        
                        if (inputs.fifth) {
                            inputs.fifth.value = Math.floor(total / 5);
                        }
                        
                        console.log('技能计算完成:', total);
                    }
                }
            }
        });

        // 初始化所有技能的总值 - 使用新的选择器查找所有输入框
        console.log('初始化所有自定义技能值');
        const allRows = customSkillsContainer.querySelectorAll('tr');
        allRows.forEach(row => {
            if (row.querySelector('.skill-name')) {
                const inputs = {
                    base: row.querySelector('.skill-base'),
                    occupation: row.querySelector('.skill-occupation'),
                    interest: row.querySelector('.skill-interest'),
                    growth: row.querySelector('.skill-growth'),
                    total: row.querySelector('.skill-total'),
                    half: row.querySelector('.skill-half'),
                    fifth: row.querySelector('.skill-fifth')
                };
                
                if (inputs.base && inputs.occupation && inputs.interest && inputs.growth && inputs.total) {
                    const base = parseInt(inputs.base.value) || 0;
                    const occupation = parseInt(inputs.occupation.value) || 0;
                    const interest = parseInt(inputs.interest.value) || 0;
                    const growth = parseInt(inputs.growth.value) || 0;
                    
                    // 设置职业、兴趣和成长点数为0时显示为空
                    if (occupation === 0) inputs.occupation.value = '';
                    if (interest === 0) inputs.interest.value = '';
                    if (growth === 0) inputs.growth.value = '';
                    
                    const total = base + occupation + interest + growth;
                    inputs.total.value = total;
                    
                    if (inputs.half) inputs.half.value = Math.floor(total / 2);
                    if (inputs.fifth) inputs.fifth.value = Math.floor(total / 5);
                }
            }
        });
    } else {
        console.error('未找到自定义技能容器');
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

    // 确认打印按钮点击事件（移动到initPrint函数内部）
    if (confirmPrintButton) {
    confirmPrintButton.addEventListener('click', function() {
        // 获取各打印选项状态
        const printMain = document.getElementById('print-character').checked;
        const printSkills = document.getElementById('print-custom-skills').checked;
        const printItems = document.getElementById('print-items').checked;
        const printNotes = document.getElementById('print-notes').checked;

        // 控制页面显示
        const printOptions = {
            'main-sheet': printMain,
            'custom-skills': printSkills,
            'items': printItems,
            'notes': printNotes
        };

        Object.entries(printOptions).forEach(([id, shouldPrint]) => {
            const element = document.getElementById(id);
            element.classList.toggle('print-hidden', !shouldPrint);
            element.classList.toggle('print-visible', shouldPrint);
        });

        // 执行打印
        window.print();
    });
    }
    
    // 标记打印功能已初始化
    printInitialized = true;
}

// 主初始化函数，确保所有功能都被初始化
function initAll() {
    console.log('正在初始化所有功能...');
    
    try {
        // 不再重复初始化打印功能，因为已经在 initCharacterSheet 中初始化过了
        // initPrint(); - 已移除，避免重复初始化
        console.log('避免重复初始化打印功能');
        
        // 初始化自定义技能页面
        initCustomSkillsTable();
        
        // 设置自定义技能计算功能
        setupCustomSkills();
        console.log('已设置自定义技能计算功能');
        
        // 只在道具表为空时初始化道具页面
        const itemsBody = document.getElementById('items-body');
        if (itemsBody) {
            if (itemsBody.children.length === 0) {
                console.log('道具表为空，进行初始化');
                initItemsTable();
            } else {
                console.log('道具表已存在，跳过初始化');
                // 确保所有道具行的备注框都有事件监听
                const noteInputs = itemsBody.querySelectorAll('.item-note');
                noteInputs.forEach(noteInput => {
                    if (!noteInput.hasEventListener) {
                        addNoteEvents(noteInput);
                        noteInput.hasEventListener = true;
                        console.log('为已有道具备注框添加事件监听器');
                    }
                });
            }
        }
        
        // 初始化笔记页面 - 新增部分
        const notesBody = document.getElementById('notes-body');
        if (notesBody) {
            if (notesBody.children.length === 0) {
                console.log('笔记表为空，进行初始化');
                initNotesTable();
            } else {
                console.log('笔记表已存在，跳过初始化');
                // 确保所有笔记行的备注框都有事件监听
                const noteInputs = notesBody.querySelectorAll('.item-note');
                noteInputs.forEach(noteInput => {
                    if (!noteInput.hasEventListener) {
                        addNoteEvents(noteInput);
                        noteInput.hasEventListener = true;
                        console.log('为已有笔记备注框添加事件监听器');
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('初始化过程出错:', error);
    }
}

// 确保在 DOM 完全加载后初始化所有功能
// 使用一个变量跟踪是否已初始化，避免重复初始化
let initializationComplete = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 加载完成，开始初始化所有功能');
    
    // 检查是否已经完成初始化
    if (!initializationComplete) {
        // 在页面加载完成后的短暂延迟后初始化
        setTimeout(function() {
            initAll();
            initializationComplete = true;
        }, 300);
    } else {
        console.log('已经完成初始化，跳过重复初始化');
    }
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
    occInput.value = '';  // 默认为空而不是0
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
    intInput.value = '';  // 默认为空而不是0
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
    growthInput.value = '';  // 默认为空而不是0
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
        // 检查是否已经添加过事件，避免重复添加
        if (input.hasAttributedEvent) {
            return;
        }
        
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
            
            console.log(`自定义技能值更新: 职业=${occ}, 兴趣=${int}, 成长=${growth}, 总值=${total}`);
        });
        
        // 标记已添加事件
        input.hasAttributedEvent = true;
    });
    
    return tds;
}

// 初始化道具表
function initItemsTable() {
    const itemsBody = document.getElementById('items-body');
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
    
    // 为输入框添加事件，确保value属性更新
    const allInputs = itemsBody.querySelectorAll('input');
    allInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.setAttribute('value', this.value);
        });
    });
    
    console.log('道具表初始化完成，共创建' + totalRows + '行，' + (totalRows * 2) + '个道具位置');
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
    
    // 备注/说明
    const noteCell = document.createElement('td');
    const noteInput = document.createElement('textarea');
    noteInput.className = 'item-note';
    noteInput.placeholder = '备注/说明';
    noteInput.dataset.itemIndex = itemIndex; // 添加索引属性
    noteInput.style.width = '100%';
    noteInput.style.height = '18px'; // 保持初始高度固定
    noteInput.style.maxHeight = '18px'; // 限制最大高度
    noteInput.style.border = 'none';
    noteInput.style.resize = 'none';
    noteInput.style.background = 'transparent';
    noteInput.style.fontFamily = "'Microsoft YaHei', Arial, sans-serif";
    noteInput.style.fontSize = '11px';
    noteInput.style.overflow = 'hidden'; // 溢出内容隐藏
    noteInput.style.textOverflow = 'ellipsis'; // 溢出使用省略号
    noteInput.style.whiteSpace = 'nowrap'; // 不换行显示
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
function addNoteEvents(noteInput) {
    // 如果已经添加过事件，就不再添加
    if (noteInput.hasEventListener) {
        return;
    }
    
    // 创建tooltip元素
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);
    
    // 悬停时显示tooltip
    noteInput.addEventListener('mouseenter', function(e) {
        tooltip.textContent = this.value;
        const rect = this.getBoundingClientRect();
        
        // 检查是否为右侧备注框
        const isRightColumn = this.closest('td').cellIndex > 3;
        
        // 调整tooltip位置
        if (isRightColumn) {
            // 右侧备注框的tooltip显示在左侧
            tooltip.style.left = `${Math.max(10, rect.left + window.scrollX - 820)}px`;
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
        
        // 设置当前备注内容到编辑框
        editTextarea.value = noteInput.value;
        
        // 显示编辑模态框
        editModal.classList.add('active');
        
        // 保存按钮事件
        saveButton.onclick = function() {
            // 更新输入框的值
            noteInput.value = editTextarea.value;
            
            // 关闭编辑模态框
            editModal.classList.remove('active');
            
            // 保存到本地缓存，不显示提示
            saveCharacter(false);
        };
        
        // 取消按钮事件
        cancelButton.onclick = function() {
            editModal.classList.remove('active');
        };
        
        // 点击模态框外部关闭
        editModal.addEventListener('click', function(event) {
            if (event.target === editModal) {
                editModal.classList.remove('active');
            }
        });
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
        categoryHeader.style.fontWeight = 'bold';
        categoryHeader.style.backgroundColor = '#eee';
        categoryHeader.style.padding = '5px 10px';
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
function createNoteCells(row, noteIndex) {
    // 第一列：笔记名称
    const nameCell = document.createElement('td');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'item-name';
    nameInput.placeholder = '未命名';
    nameCell.appendChild(nameInput);
    row.appendChild(nameCell);

    // 第二列：笔记类别
    const typeCell = document.createElement('td');
    typeCell.className = 'item-type';
    const typeInput = document.createElement('input');
    typeInput.type = 'text';
    typeInput.className = 'item-type-input'; // 添加类名
    typeInput.placeholder = '点击选择';
    typeInput.readOnly = true;
    typeCell.appendChild(typeInput);
    
    // 添加点击事件
    typeCell.addEventListener('click', function() {
        openNoteTypeModal(typeInput);
    });
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

// 统一初始化笔记表格函数
function initNotesTable() {
    const itemsBody = document.getElementById('notes-body');
    if (!itemsBody) return;
    
    itemsBody.innerHTML = '';
    
    const totalRows = 40;
    for (let i = 0; i < totalRows; i++) {
        const row = document.createElement('tr');
        row.className = i % 2 === 0 ? 'even-row' : 'odd-row';
        createNoteCells(row, i * 2);
        createNoteCells(row, i * 2 + 1); 
        itemsBody.appendChild(row);
    }

    // 确保所有备注框都有事件监听器
    const allNoteInputs = itemsBody.querySelectorAll('.item-note');
    allNoteInputs.forEach(noteInput => {
        if (!noteInput.hasEventListener) {
            addNoteEvents(noteInput);
        }
    });
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

// 1. 修改 DOM 加载完成事件处理，确保笔记页始终初始化
document.addEventListener('DOMContentLoaded', function() {
    // 原有初始化代码...
    
    // 强制初始化笔记页，无论DOM是否已经包含内容
    setTimeout(function() {
        const notesBody = document.getElementById('notes-body');
        if (notesBody) {
            // 检查表格是否为空或只有表头
            if (notesBody.children.length < 2) {
                console.log('笔记表为空或不完整，强制初始化');
                initNotesTable();
            }
        }
    }, 500); // 延迟500ms确保其他资源加载完成
});

// 2. 确保切换到笔记页面时初始化表格
function switchTab(tabId) {
    // 原有tab切换代码...
    
    // 检查是否切换到笔记页
    if (tabId === 'notes') {
        const notesBody = document.getElementById('notes-body');
        if (notesBody && notesBody.children.length < 2) {
            console.log('切换到笔记页，强制初始化笔记表');
            initNotesTable();
        }
    }
}

// 3. 修改initNotesTable函数，添加强制重建机制
function initNotesTable() {
    const itemsBody = document.getElementById('notes-body');
    if (!itemsBody) return;
    
    // 清空现有内容
    itemsBody.innerHTML = '';
    console.log('初始化笔记表格...');
    
    // 创建表格内容 - 确保生成足够行数
    const totalRows = 40; // 保证有足够的行数
    for (let i = 0; i < totalRows; i++) {
        const row = document.createElement('tr');
        row.className = i % 2 === 0 ? 'even-row' : 'odd-row';
        createNoteCells(row, i * 2);
        createNoteCells(row, i * 2 + 1); 
        itemsBody.appendChild(row);
    }
    
    console.log(`笔记表格已创建，共${itemsBody.children.length}行`);
    
    // 其余事件处理代码...
}