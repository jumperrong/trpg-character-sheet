/**
 * 主入口模块 - 初始化和页面加载
 * 依赖：core.js, calc.js, skills.js, ui.js, data.js, grow.js, print.js
 */

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
    
    // 初始化保存/加载/导入/导出
    initSaveLoad();
    
    // 初始化打印功能
    initPrint();
    
    // 初始化自定义技能表（空行）
    initCustomSkillsTable();
    
    // 初始化自定义技能事件监听
    setupCustomSkills();
    
    // 初始化道具表
    initItemsTable();
    
    // 初始化笔记表
    initNotesTable();
    
    // 初始化重置和帮助按钮
    initResetAndHelp();
    
    // 初始化幕间成长功能
    if (typeof Growth !== 'undefined') {
        Growth.init();
    }
    
    console.log("角色卡组件初始化完成");
}

// 初始化所有（Tab切换等全局功能）
function initAll() {
    // Tab切换功能
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    console.log("全局功能初始化完成");
}

// DOM加载完成后执行
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM加载完成，初始化角色卡...");
    try {
        // 注册 EventBus 订阅者
        setupEventBusSubscribers();
        
        // 初始化角色卡
        initCharacterSheet();
        
        // 初始化全局功能
        initAll();
        
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

    // 监听主页面调查员姓名变化（使用发布-订阅）
    const characterNameInput = document.getElementById('character-name');
    if (characterNameInput) {
        characterNameInput.addEventListener('input', function() {
            // 通过 CharacterStore 统一更新，自动同步到所有Tab
            CharacterStore.setCharacterName(this.value);
        });
    }
});