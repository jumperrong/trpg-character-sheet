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
}

// DOM加载完成后执行
document.addEventListener("DOMContentLoaded", function() {
    try {
        // 注册 EventBus 订阅者
        setupEventBusSubscribers();

        // 初始化角色卡
        initCharacterSheet();

        // 初始化全局功能
        initAll();

        // 迁移旧单角色数据 → 多角色结构（幂等，已迁移则跳过）
        if (typeof CharacterManager !== 'undefined') {
            CharacterManager.migrateLegacySingleCharacter();
        }

        // 加载当前角色数据（静默，skipAlert=true）
        if (typeof CharacterManager !== 'undefined') {
            const currentId = CharacterManager.getCurrentId();
            if (currentId && CharacterManager.getCharacterData(currentId)) {
                loadCharacter(true);
            }
        }

        // 初始化角色管理 UI（多角色切换/新建/删除）
        if (typeof initCharacterManager === 'function') {
            initCharacterManager();
            updateCharacterManagerUi();
        }
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