/**
 * 打印模块 - 打印功能
 * 依赖：core.js
 */

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