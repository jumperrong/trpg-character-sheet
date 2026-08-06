/**
 * 计算模块 - 属性计算、技能成功率计算
 * 依赖：core.js
 */

// 验证非负整数输入
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

    // 0 是合法值，正常显示（不再清空为空字符串）
    inputElement.value = value;
}

// 更新派生属性（性能优化版：使用DOM缓存）
function updateDerivedStats() {
    try {
        // 使用缓存获取属性值
        const strValue = parseInt($.str?.value) || 0;
        const conValue = parseInt($.con?.value) || 0;
        const sizValue = parseInt($.siz?.value) || 0;
        const dexValue = parseInt($.dex?.value) || 0;
        const powValue = parseInt($.pow?.value) || 0;
        const intValue = parseInt($.int?.value) || 0;
        
        // 计算生命值
        if ($.healthMax) {
            if (conValue === 0 && sizValue === 0) {
                $.healthMax.value = '';
            } else {
                $.healthMax.value = Math.floor((conValue + sizValue) / 10);
            }
        }
        
        // 计算魔法值
        if ($.magicMax) {
            if (powValue === 0) {
                $.magicMax.value = '';
            } else {
                $.magicMax.value = Math.floor(powValue / 5);
            }
        }
        
        // 更新理智值
        let cthulhuMythosValue = 0;

        // 通过 data-skill 属性直接定位克苏鲁神话技能行，避免遍历全部技能行
        const cthulhuNameSpan = document.querySelector('.skill-row .skill-name span[data-skill="克苏鲁神话"]');
        if (cthulhuNameSpan) {
            const cthulhuRow = cthulhuNameSpan.closest('.skill-row');
            const regularSuccess = cthulhuRow?.querySelector('.regular-success');
            if (regularSuccess) {
                cthulhuMythosValue = parseInt(regularSuccess.textContent) || 0;
            }
        }
        
        // 更新理智起始值
        if ($.sanityStart) {
            $.sanityStart.value = powValue === 0 ? '' : powValue;
        }
        
        // 更新理智最大值
        if ($.sanityMax) {
            $.sanityMax.value = Math.max(0, 99 - cthulhuMythosValue);
        }
        
        // 确保起始值不超过最大值
        if ($.sanityStart && $.sanityMax) {
            const startVal = parseInt($.sanityStart.value) || 0;
            const maxVal = parseInt($.sanityMax.value) || 0;
            if (startVal > maxVal) {
                $.sanityStart.value = maxVal;
            }
        }
        
        // 计算伤害加值和体格
        let damageBonus = '';
        let build = '';
        
        const strengthSizeSum = strValue + sizValue;
        
        if (strengthSizeSum >= 2 && strengthSizeSum <= 64) {
            damageBonus = '-2';
            build = '-2';
        } else if (strengthSizeSum >= 65 && strengthSizeSum <= 84) {
            damageBonus = '-1';
            build = '-1';
        } else if (strengthSizeSum >= 85 && strengthSizeSum <= 124) {
            damageBonus = '0';
            build = '0';
        } else if (strengthSizeSum >= 125 && strengthSizeSum <= 164) {
            damageBonus = '+1d4';
            build = '1';
        } else if (strengthSizeSum >= 165 && strengthSizeSum <= 204) {
            damageBonus = '+1d6';
            build = '2';
        } else if (strengthSizeSum >= 205 && strengthSizeSum <= 284) {
            damageBonus = '+2d6';
            build = '3';
        } else if (strengthSizeSum >= 285 && strengthSizeSum <= 364) {
            damageBonus = '+3d6';
            build = '4';
        } else if (strengthSizeSum >= 365 && strengthSizeSum <= 444) {
            damageBonus = '+4d6';
            build = '5';
        } else if (strengthSizeSum >= 445 && strengthSizeSum <= 524) {
            damageBonus = '+5d6';
            build = '6';
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
        
        // 使用缓存写入战斗属性
        if ($.damageBonus) $.damageBonus.value = damageBonus;
        if ($.spiritBonus) $.spiritBonus.value = spiritBonus;
        if ($.build) $.build.value = build;
    } catch (error) {
        console.error('Error updating derived stats:', error);
    }
}

// 更新总点数（性能优化版：使用DOM缓存）
function updateTotalPoints() {
    try {
        // 使用缓存的属性访问器
        const attrs = [$.str, $.con, $.siz, $.dex, $.app, $.int, $.pow, $.edu];
        
        // 计算总点数
        let total = 0;
        attrs.forEach(el => {
            if (el) total += parseInt(el.value) || 0;
        });
        
        // 使用缓存更新总点数显示
        if ($.totalAttr) {
            $.totalAttr.textContent = `总点数：${total}`;
        }
    } catch (error) {
        console.error('Error updating total points:', error);
    }
}

// 更新点数剩余（性能优化版：使用DOM缓存）
function updatePointsRemaining() {
    try {
        // 使用缓存获取输入框
        const occupationPointsInput = $.occupationPoints;
        const interestPointsInput = $.interestPoints;
        
        // 职业点数
        const occupationTotal = parseInt(occupationPointsInput?.value) || 0;
        let occupationUsed = 0;
        DOMCache.queryAll('.occupation-points').forEach(input => {
            occupationUsed += parseInt(input.value) || 0;
        });
        const occupationRemaining = occupationTotal - occupationUsed;
        
        // 兴趣点数
        const interestTotal = parseInt(interestPointsInput?.value) || 0;
        let interestUsed = 0;
        DOMCache.queryAll('.interest-points').forEach(input => {
            interestUsed += parseInt(input.value) || 0;
        });
        const interestRemaining = interestTotal - interestUsed;
        
        // 更新职业点数显示
        if ($.occupationRemaining) {
            $.occupationRemaining.textContent = occupationRemaining;
            $.occupationRemaining.className = occupationRemaining < 0 ? 'negative' : '';
        }

        // 更新兴趣点数显示
        if ($.interestRemaining) {
            $.interestRemaining.textContent = interestRemaining;
            $.interestRemaining.className = interestRemaining < 0 ? 'negative' : '';
        }
    } catch (error) {
        console.error('Error updating points remaining:', error);
    }
}

/**
 * 统一计算技能总值与成功率
 * 默认技能与自定义技能共用此逻辑，避免两套算法不同步。
 * @param {number} base 基础值
 * @param {number} occupation 职业点数
 * @param {number} interest 兴趣点数
 * @param {number} growth 成长点数
 * @returns {{total:number, half:number, fifth:number}}
 */
function computeSkillTotals(base, occupation, interest, growth) {
    const total = base + occupation + interest + growth;
    return {
        total,
        half: Math.floor(total / 2),
        fifth: Math.floor(total / 5)
    };
}

// 计算技能成功率（性能优化版：减少重复查询）
function calculateSkillSuccess(skillRow) {
    try {
        // 一次性获取所有子元素
        const baseInput = skillRow.querySelector('.base-value');
        const occupationInput = skillRow.querySelector('.occupation-points');
        const interestInput = skillRow.querySelector('.interest-points');
        const growthInput = skillRow.querySelector('.growth-points');
        const regularSuccess = skillRow.querySelector('.regular-success');
        const hardSuccess = skillRow.querySelector('.hard-success');
        const extremeSuccess = skillRow.querySelector('.extreme-success');
        const nameSpan = skillRow.querySelector('.skill-name span');

        // 获取各个值
        const baseValue = parseInt(baseInput?.value) || 0;
        const occupationPoints = parseInt(occupationInput?.value) || 0;
        const interestPoints = parseInt(interestInput?.value) || 0;
        const growthPoints = parseInt(growthInput?.value) || 0;

        // 统一计算总值与成功率（与自定义技能共用）
        const { total, half, fifth } = computeSkillTotals(baseValue, occupationPoints, interestPoints, growthPoints);

        // 更新成功率
        if (regularSuccess) regularSuccess.textContent = total.toString();
        if (hardSuccess) hardSuccess.textContent = half.toString();
        if (extremeSuccess) extremeSuccess.textContent = fifth.toString();

        // 设置打印数据
        skillRow.dataset.total = total;

        // 发布技能变更事件（订阅者会处理克苏鲁神话等特殊逻辑）
        const skillName = nameSpan?.textContent.trim() || '';
        EventBus.emit('skill', { name: skillName, total });
    } catch (error) {
        console.error('Error calculating skill success:', error);
    }
}

// 更新闪避技能基础值
function updateDodgeBaseValue() {
    const dexValue = parseInt(document.getElementById('dex').value) || 0;
    const halfDex = Math.floor(dexValue / 2);

    // 通过 data-skill 属性直接定位闪避技能行
    const dodgeNameSpan = document.querySelector('.skill-row .skill-name span[data-skill="闪避"]');
    if (dodgeNameSpan) {
        const skillRow = dodgeNameSpan.closest('.skill-row');
        const baseInput = skillRow?.querySelector('.base-value');
        if (baseInput) {
            baseInput.value = halfDex;
            calculateSkillSuccess(skillRow);
        }
    }
}

// 更新母语技能基础值
function updateMotherTongueBaseValue() {
    const eduValue = parseInt(document.getElementById('edu').value) || 0;

    // 通过 data-skill 属性直接定位母语技能行
    const motherTongueSpan = document.querySelector('.skill-row .skill-name span[data-skill="母语"]');
    if (motherTongueSpan) {
        const skillRow = motherTongueSpan.closest('.skill-row');
        // 检查是否选择了子技能
        const selectedSubtype = skillRow?.querySelector('.selected-subtype');
        if (selectedSubtype && selectedSubtype.textContent.trim() !== '') {
            const baseInput = skillRow.querySelector('.base-value');
            baseInput.value = eduValue;
            calculateSkillSuccess(skillRow);
        }
    }
}