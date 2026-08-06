/**
 * 核心模块 - DOM缓存、快捷访问器、配置数据
 * 依赖：无（基础模块）
 */

// ============ P0 性能优化：DOM 缓存机制 ============
const DOMCache = {
    _cache: new Map(),
    _listeners: new Map(),
    _delegatedParents: new Map(),

    get(id) {
        if (!this._cache.has(id)) {
            const el = document.getElementById(id);
            if (el) this._cache.set(id, el);
        }
        return this._cache.get(id);
    },

    query(selector, root = document) {
        const key = `q:${selector}`;
        if (!this._cache.has(key)) {
            const el = root.querySelector(selector);
            if (el) this._cache.set(key, el);
        }
        return this._cache.get(key);
    },

    queryAll(selector, root = document) {
        const key = `qa:${selector}`;
        if (!this._cache.has(key)) {
            const els = Array.from(root.querySelectorAll(selector));
            this._cache.set(key, els);
        }
        return this._cache.get(key);
    },

    invalidate(key) {
        this._cache.delete(key);
    },

    invalidateByPrefix(prefix) {
        for (const key of this._cache.keys()) {
            if (key.startsWith(prefix)) this._cache.delete(key);
        }
    },

    clear() {
        this._cache.clear();
    },

    // 事件委托：在父元素上绑定一次监听器
    delegate(parentSelector, eventType, targetSelector, handler) {
        const key = `${parentSelector}:${eventType}:${targetSelector}`;
        if (this._delegatedParents.has(key)) return;

        const parent = typeof parentSelector === 'string'
            ? (parentSelector === document ? document : this.query(parentSelector) || document.querySelector(parentSelector))
            : parentSelector;

        if (!parent) return;

        const wrappedHandler = (e) => {
            const target = e.target.closest(targetSelector);
            if (target && parent.contains(target)) {
                handler.call(target, e, target);
            }
        };

        parent.addEventListener(eventType, wrappedHandler);
        this._delegatedParents.set(key, { parent, handler: wrappedHandler });
    },

    // 批量绑定事件到缓存元素
    bind(idOrElement, eventType, handler) {
        const el = typeof idOrElement === 'string' ? this.get(idOrElement) : idOrElement;
        if (el) {
            const key = `${idOrElement}_${eventType}_${handler.toString().slice(0, 20)}`;
            if (!this._listeners.has(key)) {
                el.addEventListener(eventType, handler);
                this._listeners.set(key, { el, eventType, handler });
            }
        }
    }
};

// 常用 DOM 元素快捷访问器（延迟初始化）
const $ = {
    get charName() { return DOMCache.get('character-name'); },
    get playerName() { return DOMCache.get('player-name'); },
    get occupationPoints() { return DOMCache.get('occupation-points'); },
    get interestPoints() { return DOMCache.get('interest-points'); },
    get occupationRemaining() { return DOMCache.get('occupation-remaining'); },
    get interestRemaining() { return DOMCache.get('interest-remaining'); },

    get str() { return DOMCache.get('str'); },
    get con() { return DOMCache.get('con'); },
    get siz() { return DOMCache.get('siz'); },
    get dex() { return DOMCache.get('dex'); },
    get app() { return DOMCache.get('app'); },
    get int() { return DOMCache.get('int'); },
    get pow() { return DOMCache.get('pow'); },
    get edu() { return DOMCache.get('edu'); },
    get luc() { return DOMCache.get('luc'); },

    get healthMax() { return DOMCache.query('.health-max'); },
    get healthCurrent() { return DOMCache.query('.health-current'); },
    get healthTemp() { return DOMCache.query('.health-temp'); },
    get magicMax() { return DOMCache.query('.magic-max'); },
    get magicCurrent() { return DOMCache.query('.magic-current'); },
    get magicTemp() { return DOMCache.query('.magic-temp'); },
    get sanityStart() { return DOMCache.query('.sanity-start'); },
    get sanityMax() { return DOMCache.query('.sanity-max'); },
    get sanityCurrent() { return DOMCache.query('.sanity-current'); },

    get damageBonus() { return DOMCache.get('damage-bonus'); },
    get spiritBonus() { return DOMCache.get('spirit-bonus'); },
    get build() { return DOMCache.get('build'); },
    get armor() { return DOMCache.get('armor'); },

    get skillsContainer() { return DOMCache.query('.skills-container'); },
    get skillsLeftColumn() { return DOMCache.query('.skills-column.left-column'); },
    get skillsRightColumn() { return DOMCache.query('.skills-column.right-column'); },
    get totalAttr() { return DOMCache.query('.total-attr'); },

    get customSkillsBody() { return DOMCache.get('custom-skills-body'); },
    get itemsBody() { return DOMCache.get('items-body'); },
    get notesBody() { return DOMCache.get('notes-body'); },

    get customCharacterName() { return DOMCache.get('custom-character-name'); },
    get itemsCharacterName() { return DOMCache.get('items-character-name'); },
    get notesCharacterName() { return DOMCache.get('notes-character-name'); }
};

// 常用查询的缓存键前缀（用于 invalidateByPrefix 缓存失效）
// 注意：这不是 CSS 选择器，是 DOMCache 内部使用的缓存键格式
const CACHE_KEYS = {
    SKILL_ROWS: 'qa:.skill-row',
    BASE_INPUTS: 'qa:.base-value',
    OCC_INPUTS: 'qa:.occupation-points',
    INT_INPUTS: 'qa:.interest-points',
    GROWTH_INPUTS: 'qa:.growth-points',
    ATTR_INPUTS: 'qa:.char-value',
    WEAPON_ROWS: 'qa:.weapon-row',
    ITEM_INPUTS: 'qa:.item-name'
};

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
            { name: "飞行器", base: 1 }
        ], 
        rows: 3 
    }
];

// 道具类别数据
const itemCategories = [
    "武器", "防具", "魔法物品", "书籍", "药品", "工具", "日常用品", "珍稀物品", "其他"
];

// 笔记类别数据
const noteCategories = [
    '冒险', '人物', '功法', '强化', '待办', '其他'
];

// 默认笔记配置（名称固定，仅可编辑备注）
// globalPos 为左列偶数位置，collectNotes / loadNotes / initNotesTable 共用此定义
const DEFAULT_NOTES = [
    { name: '贡献', type: '其他', globalPos: 0 },
    { name: '幕间', type: '其他', globalPos: 2 },
    { name: '修炼', type: '其他', globalPos: 4 }
];
const DEFAULT_NOTE_POSITIONS = DEFAULT_NOTES.map(n => n.globalPos);

// 初始化完成标志
let initializationComplete = false;

// ============ 发布-订阅系统（EventBus） ============
const EventBus = {
    _events: new Map(),

    on(event, callback) {
        if (!this._events.has(event)) {
            this._events.set(event, new Set());
        }
        this._events.get(event).add(callback);
        return () => this.off(event, callback);
    },

    off(event, callback) {
        if (this._events.has(event)) {
            this._events.get(event).delete(callback);
        }
    },

    emit(event, data) {
        if (this._events.has(event)) {
            this._events.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error(`Error in EventBus handler for "${event}":`, e);
                }
            });
        }
    },

    clear() {
        this._events.clear();
    }
};

// ============ 角色数据 Store（状态管理） ============
// 说明：当前 Store 仅承担"属性/角色名变更 → 事件分发"的职责，
// HP/MP/Sanity 等状态值仍由各模块直接读写 DOM，未纳入 Store。
const CharacterStore = {
    _state: {
        characterName: '',
        attributes: {}
    },

    // 更新角色名（自动同步到所有Tab）
    setCharacterName(name) {
        this._state.characterName = name;
        // 发布事件，通知所有订阅者
        EventBus.emit('characterName', name);
    },

    // 更新单个属性
    setAttribute(key, value) {
        this._state.attributes[key] = value;
        EventBus.emit('attribute', { key, value });
    },

    // 批量更新属性
    setAttributes(attrs) {
        Object.assign(this._state.attributes, attrs);
        EventBus.emit('attributes', attrs);
    }
};

// ============ 订阅者注册（在DOMReady后调用） ============
function setupEventBusSubscribers() {
    // 订阅角色名变更 - 同步到所有Tab的姓名显示
    EventBus.on('characterName', (name) => {
        const customName = document.getElementById('custom-character-name');
        const itemsName = document.getElementById('items-character-name');
        const notesName = document.getElementById('notes-character-name');
        
        if (customName) customName.textContent = name;
        if (itemsName) itemsName.textContent = name;
        if (notesName) notesName.textContent = name;
    });

    // 订阅属性变更 - 触发衍生计算
    EventBus.on('attribute', ({ key }) => {
        // 触发衍生属性更新
        if (typeof updateDerivedStats === 'function') {
            updateDerivedStats();
        }
        // 特定属性触发额外更新
        if (key === 'dex' && typeof updateDodgeBaseValue === 'function') {
            updateDodgeBaseValue();
        }
        if (key === 'edu' && typeof updateMotherTongueBaseValue === 'function') {
            updateMotherTongueBaseValue();
        }
    });

    // 订阅属性批量变更
    EventBus.on('attributes', () => {
        if (typeof updateDerivedStats === 'function') {
            updateDerivedStats();
        }
        if (typeof updateTotalPoints === 'function') {
            updateTotalPoints();
        }
    });

    // 订阅技能变更
    EventBus.on('skill', (skillData) => {
        if (skillData?.name?.includes('克苏鲁神话') && typeof updateDerivedStats === 'function') {
            updateDerivedStats();
        }
    });
}