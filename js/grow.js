/**
 * 幕间成长模块 - 技能成长检定
 * 规则：
 * - D100 掷骰结果需大于当前技能值
 * - 成长值根据当前技能值决定：
 *   1-29: 1d10, 30-49: 1d8, 50-69: 1d6, 70-89: 1d4, 90+: 1d3
 * - 投出100时获得双倍成长值
 * - 技能值>95时，投出96-100总能成长
 * - 每次成长消耗1点成长点数
 */

// 成长模块命名空间
const Growth = {
    // 配置
    config: {
        storageKey: 'growthHistory',
        growthPointsKey: 'growthPointsRemaining'
    },

    // 状态
    state: {
        growthPoints: 0,
        pointsConfirmed: false,
        history: []
    },

    /**
     * 初始化成长模块
     */
    init() {
        this.loadState();
        this.initGrowthPointsInput();
        this.renderSkillList();
        this.renderHistory();
        this.bindEvents();
        this.bindDelegatedRollHandler();
    },

    /**
     * 事件委托：在 #growth-skill-list 上一次性绑定掷骰处理器，
     * 避免每次 renderSkillList 重建按钮时累积 listener。
     */
    bindDelegatedRollHandler() {
        const container = document.getElementById('growth-skill-list');
        if (!container || container.dataset.rollDelegated) return;
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.roll-button');
            if (!btn) return;
            const skillId = btn.dataset.skillId;
            if (skillId) this.performGrowthRoll(skillId);
        });
        container.dataset.rollDelegated = '1';
    },

    /**
     * 加载状态
     * 注意：成长数据已并入 characterData（由 data.js 的 loadGrowth 负责填充 Growth.state）。
     * 此处仅做旧版 key 一次性迁移，迁移后清除。
     */
    loadState() {
        // 旧版独立 key 迁移（若存在）
        const legacyPoints = localStorage.getItem(this.config.growthPointsKey);
        const legacyHistory = localStorage.getItem(this.config.storageKey);
        if (legacyPoints !== null || legacyHistory !== null) {
            this.state.growthPoints = legacyPoints ? parseInt(legacyPoints) : 0;
            this.state.history = legacyHistory ? JSON.parse(legacyHistory) : [];
            localStorage.removeItem(this.config.growthPointsKey);
            localStorage.removeItem(this.config.storageKey);
        }
        // 否则 state 已由 data.js 的 loadGrowth() 填充

        // 失效技能列表签名，确保下次 renderSkillList 重建 DOM
        this._lastSkillSignature = null;
    },

    /**
     * 保存状态
     * 注意：data.js 的 loadGrowth 会用「保存到 characterData」的实现覆盖本方法。
     * 此处保留默认实现，仅用于 loadGrowth 未被调用时的兜底（直接写 characterData）。
     */
    saveState() {
        if (typeof saveCharacter === 'function') {
            saveCharacter(false);
        }
    },

    /**
     * 初始化成长点数输入
     * 注意：本方法会在每次切到成长页时调用，事件绑定需做去重，
     * 否则 input/confirm 会累积多个相同 listener。
     */
    initGrowthPointsInput() {
        const input = document.getElementById('growth-points-remaining');
        const confirmBtn = document.getElementById('confirm-growth-points');
        const statusEl = document.getElementById('growth-points-status');

        if (input) {
            input.value = this.state.growthPoints;

            // 仅在首次绑定时挂载 input 监听
            if (!input.dataset.growthBound) {
                input.addEventListener('input', () => {
                    this.state.pointsConfirmed = false;
                    if (statusEl) {
                        statusEl.textContent = '未确认';
                        statusEl.className = 'growth-points-status';
                    }
                    this.updateButtonStates();
                });
                input.dataset.growthBound = '1';
            }
        }

        // 确认按钮
        if (confirmBtn && !confirmBtn.dataset.growthBound) {
            confirmBtn.addEventListener('click', () => {
                const val = parseInt(input?.value) || 0;
                this.state.growthPoints = Math.max(0, val);
                this.state.pointsConfirmed = true;
                this.saveState();

                if (statusEl) {
                    statusEl.textContent = `已确认：${this.state.growthPoints} 点`;
                    statusEl.className = 'growth-points-status confirmed';
                }

                this.updateButtonStates();
            });
            confirmBtn.dataset.growthBound = '1';
        }

        // 同步角色名
        const nameInput = document.getElementById('character-name');
        const growthName = document.getElementById('growth-character-name');
        if (nameInput && growthName) {
            growthName.textContent = nameInput.value || '未命名';
        }

        // 初始化状态显示
        if (statusEl) {
            statusEl.textContent = this.state.pointsConfirmed ? `已确认：${this.state.growthPoints} 点` : '未确认';
            statusEl.className = this.state.pointsConfirmed ? 'growth-points-status confirmed' : 'growth-points-status';
        }
    },

    /**
     * 更新按钮状态和显示的次数
     */
    updateButtonStates() {
        const canRoll = this.state.pointsConfirmed && this.state.growthPoints > 0;
        const buttons = document.querySelectorAll('.roll-button');
        buttons.forEach(btn => {
            btn.disabled = !canRoll;
            // 更新按钮显示的次数
            const originalText = btn.textContent.trim().replace(/\s*\(\d+次\)/, '');
            btn.innerHTML = `<i class="fas fa-dice"></i> ${originalText} (${this.state.growthPoints}次)`;
        });
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 清空历史（使用自定义确认弹窗）
        document.getElementById('clear-growth-history')?.addEventListener('click', async () => {
            const confirmed = await showConfirm('确定要清空所有成长历史吗？', '清空确认');
            if (confirmed) {
                this.state.history = [];
                this.saveState();
                this.renderHistory();
            }
        });

        // 过滤器
        document.getElementById('filter-default-skills')?.addEventListener('change', () => {
            this.renderSkillList();
        });
        document.getElementById('filter-custom-skills')?.addEventListener('change', () => {
            this.renderSkillList();
        });
    },

    /**
     * 渲染技能列表
     * 通过签名比对避免技能数据未变化时的重复 DOM 重建
     */
    renderSkillList() {
        const container = document.getElementById('growth-skill-list');
        if (!container) return;

        const showDefault = document.getElementById('filter-default-skills')?.checked ?? true;
        const showCustom = document.getElementById('filter-custom-skills')?.checked ?? true;

        const skills = this.collectAllSkills();
        const filtered = skills.filter(s => {
            if (s.type === 'default' && !showDefault) return false;
            if (s.type === 'custom' && !showCustom) return false;
            return true;
        });

        // 计算签名：技能名+总值+筛选状态，未变化则跳过 DOM 重建
        const signature = filtered.map(s => `${s.name}:${s.total}`).join('|') + `#${showDefault},${showCustom}`;
        if (this._lastSkillSignature === signature) {
            // 数据未变，仅刷新按钮状态（成长点数可能已变）
            this.updateButtonStates();
            return;
        }
        this._lastSkillSignature = signature;

        container.innerHTML = '';

        if (filtered.length === 0) {
            container.innerHTML = '<div class="no-skills">暂无可用技能</div>';
            return;
        }

        // 按技能在页面上的顺序排列（不排序）
        // filtered.sort((a, b) => a.total - b.total);

        filtered.forEach(skill => {
            const row = this.createSkillRow(skill);
            container.appendChild(row);
        });

        // 更新按钮状态
        this.updateButtonStates();
    },

    /**
     * 收集所有技能（默认+自定义）
     */
    collectAllSkills() {
        const skills = [];
        
        // 不参加成长的技能名称
        const excludedSkills = ['信用评级', '克苏鲁神话'];

        // 收集默认技能
        document.querySelectorAll('.skill-row').forEach(row => {
            const nameEl = row.querySelector('.skill-name span');
            if (!nameEl) return;

            const total = parseInt(row.dataset.total) || 0;
            // 优先从dataset读取，如果没有则从span文本读取
            let selectedSubtype = row.dataset.selectedSubtype || '';
            if (!selectedSubtype) {
                const subtypeSpan = row.querySelector('.selected-subtype');
                if (subtypeSpan) {
                    selectedSubtype = subtypeSpan.textContent.trim();
                }
            }
            const skillName = nameEl.textContent.trim();
            const parentSkill = row.dataset.parentSkill || '';
            
            // 跳过不参加成长的技能
            if (excludedSkills.includes(skillName)) return;

            // 构建显示名称：有子技能时显示 "父技能（子技能）"
            let displayName = skillName;
            if (selectedSubtype) {
                // 如果是子技能行（有parentSkill），skillName已经是父技能名
                // 如果是有子类型的技能行，skillName本身就是父技能名
                displayName = `${skillName}（${selectedSubtype}）`;
            } else if (parentSkill && !selectedSubtype) {
                // 子技能行但未选择子技能，显示父技能名
                displayName = skillName;
            }

            skills.push({
                id: `default-${skills.length}`,
                name: displayName,
                fullName: skillName,
                total: total,
                type: 'default',
                row: row
            });
        });

        // 收集自定义技能（每行两个技能项）
        const customSkillsBody = document.getElementById('custom-skills-body');
        if (customSkillsBody) {
            const rows = customSkillsBody.querySelectorAll('tr');
            rows.forEach((row, rowIdx) => {
                const tds = row.querySelectorAll('td');
                // 每行有16个td（两个技能项，每个8个td）
                // 左半部分：td 0-7
                // 右半部分：td 8-15
                
                // 处理左半部分
                if (tds.length >= 8) {
                    const leftSkill = this.extractCustomSkill(tds, 0, skills.length);
                    if (leftSkill && !excludedSkills.includes(leftSkill.name)) skills.push(leftSkill);
                }
                
                // 处理右半部分
                if (tds.length >= 16) {
                    const rightSkill = this.extractCustomSkill(tds, 8, skills.length);
                    if (rightSkill && !excludedSkills.includes(rightSkill.name)) skills.push(rightSkill);
                }
            });
        }

        return skills;
    },

    /**
     * 从自定义技能表格行中提取单个技能
     */
    extractCustomSkill(tds, startIndex, idBase) {
        const nameInput = tds[startIndex]?.querySelector('input.skill-name');
        if (!nameInput || !nameInput.value.trim()) return null;

        const totalInput = tds[startIndex + 5]?.querySelector('input.skill-total');
        const total = totalInput ? parseInt(totalInput.value) || 0 : 0;

        return {
            id: `custom-${idBase}`,
            name: nameInput.value.trim(),
            fullName: nameInput.value.trim(),
            total: total,
            type: 'custom',
            tds: tds,
            startIndex: startIndex
        };
    },

    /**
     * 创建技能行
     */
    createSkillRow(skill) {
        const row = document.createElement('div');
        row.className = 'growth-skill-row';
        row.dataset.skillId = skill.id;

        // 确定成长骰子
        const dieInfo = this.getGrowthDie(skill.total);

        row.innerHTML = `
            <div class="skill-info">
                <span class="skill-name">${this.escapeHtml(skill.name)}</span>
                <span class="skill-value">当前值: ${skill.total}</span>
                <span class="growth-die">成长: ${dieInfo.label}</span>
            </div>
            <div class="skill-actions">
                <button class="roll-button" data-skill-id="${skill.id}" ${(!this.state.pointsConfirmed || this.state.growthPoints <= 0) ? 'disabled' : ''}>
                    <i class="fas fa-dice"></i> 掷骰 (${this.state.growthPoints}次)
                </button>
            </div>
        `;

        // 掷骰事件由 bindDelegatedRollHandler 在容器上统一委托处理

        return row;
    },

    /**
     * 获取成长骰子类型
     */
    getGrowthDie(skillValue) {
        if (skillValue <= 29) return { die: 10, label: '1d10' };
        if (skillValue <= 49) return { die: 8, label: '1d8' };
        if (skillValue <= 69) return { die: 6, label: '1d6' };
        if (skillValue <= 89) return { die: 4, label: '1d4' };
        return { die: 3, label: '1d3' };
    },

    /**
     * 执行成长检定（一次性完成所有确认点数的掷骰和结算）
     */
    async performGrowthRoll(skillId) {
        const skills = this.collectAllSkills();
        const skill = skills.find(s => s.id === skillId);
        if (!skill) return;

        if (!this.state.pointsConfirmed || this.state.growthPoints <= 0) {
            await showMessage('请先确认成长点数！', '提示');
            return;
        }

        const totalPoints = this.state.growthPoints;
        const rolls = [];
        let finalSkillTotal = skill.total;

        // 进行N次成长检定
        for (let i = 0; i < totalPoints; i++) {
            // 记录当前技能值（掷骰前）
            const currentTotal = finalSkillTotal;

            // 掷 D100
            const d100Roll = this.rollDie(100);

            // 判断是否成功
            const isSuccess = this.checkSuccess(currentTotal, d100Roll);

            // 计算成长值
            let growthAmount = 0;
            let isDouble = false;

            if (isSuccess) {
                const dieInfo = this.getGrowthDie(currentTotal);
                growthAmount = this.rollDie(dieInfo.die);

                // 投出100时双倍
                if (d100Roll === 100) {
                    growthAmount *= 2;
                    isDouble = true;
                }

                // 最大值限制（技能不能超过99）
                if (currentTotal + growthAmount > 99) {
                    growthAmount = 99 - currentTotal;
                }

                finalSkillTotal += growthAmount;
            }

            rolls.push({
                rollNumber: i + 1,
                skillId: skillId,
                skillName: skill.name,
                skillTotal: currentTotal,  // 掷骰前的技能值
                d100Roll: d100Roll,
                isSuccess: isSuccess,
                isDouble: isDouble,
                growthAmount: growthAmount,
                newTotal: currentTotal + growthAmount,  // 本次增长后的值
                skillType: skill.type
            });
        }

        // 消耗所有成长点数
        this.state.growthPoints = 0;
        this.state.pointsConfirmed = false;
        const input = document.getElementById('growth-points-remaining');
        if (input) {
            input.value = 0;
        }

        // 如果有成功，更新技能值（只更新一次最终值）
        const successRolls = rolls.filter(r => r.isSuccess);
        if (successRolls.length > 0) {
            const totalGrowth = finalSkillTotal - skill.total;
            if (skill.type === 'default') {
                this.updateDefaultSkillGrowth(skill, totalGrowth);
            } else {
                this.updateCustomSkillGrowth(skill, totalGrowth);
            }
        }

        // 添加到历史（只记录一次汇总）
        if (rolls.length > 1) {
            // 多次检定，记录汇总
            const successCount = successRolls.length;
            const failCount = rolls.length - successCount;
            const totalGrowth = finalSkillTotal - skill.total;
            this.addToHistory({
                skillId: skillId,
                skillName: skill.name,
                skillTotal: skill.total,
                d100Roll: `多次(${rolls.length}次)`,
                isSuccess: successCount > 0,
                isDouble: false,
                growthAmount: totalGrowth,
                newTotal: finalSkillTotal,
                skillType: skill.type,
                summary: true,
                rolls: rolls,
                successCount: successCount,
                failCount: failCount
            });
        } else {
            // 单次检定
            this.addToHistory(rolls[0]);
        }

        // 显示结果
        this.showRollResult(rolls);

        // 重置确认状态显示
        const statusEl = document.getElementById('growth-points-status');
        if (statusEl) {
            statusEl.textContent = '未确认';
            statusEl.className = 'growth-points-status';
        }

        // 保存状态
        this.saveState();

        // 刷新显示
        this.renderSkillList();
        this.renderHistory();

        // 保存角色数据
        if (typeof saveCharacter === 'function') {
            saveCharacter(false);
        }
    },

    /**
     * 检查成长是否成功
     */
    checkSuccess(skillValue, roll) {
        // 技能值>95时，投出96-100总能成长
        if (skillValue > 95 && roll >= 96 && roll <= 100) {
            return true;
        }

        // 正常规则：D100结果需大于当前技能值
        return roll > skillValue;
    },

    /**
     * 掷骰子
     */
    rollDie(sides) {
        return Math.floor(Math.random() * sides) + 1;
    },

    /**
     * 显示掷骰结果
     */
    showRollResult(rolls) {
        const resultSection = document.getElementById('growth-result-section');
        const resultContainer = document.getElementById('dice-result');
        if (!resultSection || !resultContainer || !rolls || rolls.length === 0) return;

        const rollArray = Array.isArray(rolls) ? rolls : [rolls];
        const firstRoll = rollArray[0];
        const lastRoll = rollArray[rollArray.length - 1];
        const initialTotal = firstRoll.skillTotal;
        const finalTotal = lastRoll.newTotal;
        const totalGrowth = finalTotal - initialTotal;
        const successCount = rollArray.filter(r => r.isSuccess).length;

        let rollsHtml = '';
        rollArray.forEach((roll, idx) => {
            const dieInfo = this.getGrowthDie(roll.skillTotal);
            rollsHtml += `
                <div class="roll-item">
                    <div class="roll-item-header">
                        <span>第 ${idx + 1} 次</span>
                        <span class="dice-result-value">D100: ${roll.d100Roll}</span>
                    </div>
                    ${roll.isSuccess ? `
                        <div class="roll-item-success">
                            <span>获得 <strong>${roll.growthAmount}</strong> 点成长 (${dieInfo.label})</span>
                            ${roll.isDouble ? ' <span class="double-bonus">(双倍!)</span>' : ''}
                        </div>
                    ` : `
                        <div class="roll-item-failure">
                            <span>失败 (掷出${roll.d100Roll}，需超过${roll.skillTotal})</span>
                        </div>
                    `}
                </div>
            `;
        });

        resultContainer.innerHTML = `
            <div class="roll-summary">
                <div class="skill-being-rolled">
                    <span>技能：</span>
                    <strong>${this.escapeHtml(firstRoll.skillName)}</strong>
                    <span class="current-value">初始值：${initialTotal}</span>
                </div>
                <div class="roll-stats">
                    <span>共 ${rollArray.length} 次</span>
                    <span>成功 ${successCount} 次</span>
                    <span>失败 ${rollArray.length - successCount} 次</span>
                </div>
            </div>
            <div class="roll-result ${successCount > 0 ? 'success' : 'failure'}">
                ${rollsHtml}
                <div class="roll-final">
                    ${totalGrowth > 0 ? `
                        <p class="new-total">
                            最终技能值：${initialTotal} → <strong class="highlight">${finalTotal}</strong>
                            (共成长 <strong>${totalGrowth}</strong> 点)
                        </p>
                    ` : `
                        <p class="failure-msg">
                            <strong>无成长</strong>
                        </p>
                    `}
                </div>
            </div>
        `;

        resultSection.classList.remove('is-hidden');
        resultSection.classList.add('is-visible');
    },

    /**
     * 更新默认技能的成长值
     */
    updateDefaultSkillGrowth(skill, growthAmount) {
        const growthInput = skill.row.querySelector('.growth-points');
        if (growthInput) {
            const currentGrowth = parseInt(growthInput.value) || 0;
            growthInput.value = currentGrowth + growthAmount;

            // 触发计算
            if (typeof calculateSkillSuccess === 'function') {
                calculateSkillSuccess(skill.row);
            }
            if (typeof updatePointsRemaining === 'function') {
                updatePointsRemaining();
            }
        }
    },

    /**
     * 更新自定义技能的成长值
     */
    updateCustomSkillGrowth(skill, growthAmount) {
        const growthInput = skill.tds[skill.startIndex + 4]?.querySelector('input.skill-growth');
        if (growthInput) {
            const currentGrowth = parseInt(growthInput.value) || 0;
            growthInput.value = currentGrowth + growthAmount;

            // 更新总值
            const totalInput = skill.tds[skill.startIndex + 5]?.querySelector('input.skill-total');
            if (totalInput) {
                const baseInput = skill.tds[skill.startIndex + 1]?.querySelector('input.skill-base');
                const occInput = skill.tds[skill.startIndex + 2]?.querySelector('input.skill-occupation');
                const intInput = skill.tds[skill.startIndex + 3]?.querySelector('input.skill-interest');
                
                const base = parseInt(baseInput?.value) || 0;
                const occ = parseInt(occInput?.value) || 0;
                const int = parseInt(intInput?.value) || 0;
                const growth = currentGrowth + growthAmount;
                
                totalInput.value = base + occ + int + growth;
            }
        }
    },

    /**
     * 添加到历史
     */
    addToHistory(roll) {
        let historyEntry;
        
        if (roll.summary) {
            // 多次检定汇总
            historyEntry = {
                timestamp: new Date().toISOString(),
                skillName: roll.skillName,
                skillType: roll.skillType,
                d100Roll: `多次(${roll.rolls.length}次)`,
                isSuccess: roll.successCount > 0,
                growthAmount: roll.growthAmount,
                oldTotal: roll.skillTotal,
                newTotal: roll.newTotal,
                isSummary: true,
                rollsCount: roll.rolls.length,
                successCount: roll.successCount,
                failCount: roll.failCount
            };
        } else {
            // 单次检定
            historyEntry = {
                timestamp: new Date().toISOString(),
                skillName: roll.skillName,
                skillType: roll.skillType,
                d100Roll: roll.d100Roll,
                isSuccess: roll.isSuccess,
                growthAmount: roll.isSuccess ? roll.growthAmount : 0,
                oldTotal: roll.skillTotal,
                newTotal: roll.isSuccess ? roll.newTotal : roll.skillTotal,
                isSummary: false
            };
        }

        this.state.history.unshift(historyEntry);

        // 最多保留50条记录
        if (this.state.history.length > 50) {
            this.state.history = this.state.history.slice(0, 50);
        }
    },

    /**
     * 渲染历史记录
     */
    renderHistory() {
        const container = document.getElementById('growth-history');
        if (!container) return;

        if (this.state.history.length === 0) {
            container.innerHTML = '<div class="no-history">暂无成长记录</div>';
            return;
        }

        container.innerHTML = '';

        this.state.history.forEach(entry => {
            const date = new Date(entry.timestamp);
            const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

            const item = document.createElement('div');
            item.className = `history-item ${entry.isSuccess ? 'success' : 'failure'}`;

            if (entry.isSummary) {
                // 汇总记录
                item.innerHTML = `
                    <span class="history-time">${timeStr}</span>
                    <span class="history-skill">${this.escapeHtml(entry.skillName)}</span>
                    <span class="history-roll">共${entry.rollsCount}次</span>
                    <span class="history-success-count">成功${entry.successCount}/失败${entry.failCount}</span>
                    ${entry.isSuccess ?
                        `<span class="history-growth">+${entry.growthAmount}</span>` :
                        `<span class="history-fail">无成长</span>`
                    }
                    <span class="history-total">${entry.oldTotal}→${entry.newTotal}</span>
                `;
            } else {
                // 单次记录
                item.innerHTML = `
                    <span class="history-time">${timeStr}</span>
                    <span class="history-skill">${this.escapeHtml(entry.skillName)}</span>
                    <span class="history-roll">D100: ${entry.d100Roll}</span>
                    ${entry.isSuccess ?
                        `<span class="history-growth">+${entry.growthAmount}</span>` :
                        `<span class="history-fail">失败</span>`
                    }
                    <span class="history-total">${entry.oldTotal}→${entry.newTotal}</span>
                `;
            }

            container.appendChild(item);
        });
    },

    /**
     * HTML转义
     */
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * 切换到成长页面时的刷新
     */
    onTabActivate() {
        this.loadState();
        this.initGrowthPointsInput();
        this.renderSkillList();
        this.renderHistory();
    }
};

// 暴露到全局
window.Growth = Growth;
