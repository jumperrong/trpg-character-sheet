# TRPG 角色卡

一个简洁、易用的克苏鲁的呼唤(Call of Cthulhu) 7版角色卡网页应用，支持角色创建、数据管理和打印功能。

## 功能特点

- **多页面管理**：主页面（基本信息、属性、技能）、自定义技能页和道具页
- **数据管理**：支持将角色数据保存到本地、导入/导出JSON文件
- **打印优化**：针对不同页面进行了专门的打印布局优化
- **直观的界面**：简洁明了的UI设计，便于快速创建和管理角色

## 页面说明

### 主页面
- 角色基本信息（姓名、职业等）
- 属性值（力量、体质、智力等）
- 核心技能列表及点数分配
- 武器与战斗数据

### 自定义技能页
- 可添加和管理自定义技能
- 职业点数与兴趣点数分配
- 技能成功率计算

### 道具页
- 记录角色携带的80种道具
- 分类管理道具（武器、防具、日常用品等）
- 添加道具备注与说明

## 使用说明

### 基本操作
1. 填写角色基本信息（姓名、职业等）
2. 输入角色各项属性值（力量、体质等）
3. 分配职业点数和兴趣点数到相应技能
4. 记录角色的武器和道具

### 数据管理
- 使用保存按钮将角色数据保存到本地缓存
- 通过导入/导出功能备份或分享角色数据
- 使用重置按钮清空所有数据并重新开始

### 打印功能
- 点击打印按钮可选择打印主页面、自定义技能页或道具页
- 打印时会自动优化格式，隐藏不必要的元素
- 道具页打印经过特别优化，可在一页纸上完整显示所有80个道具项目

## 本地部署

1. 克隆仓库到本地
```
git clone https://github.com/jumperrong/trpg-character-sheet.git
```

2. 直接在浏览器中打开`index.html`文件
3. 也可以使用任何静态网页服务器进行托管

## 技术栈

- HTML5
- CSS3
- JavaScript (vanilla)
- 无需任何外部依赖库

## 浏览器兼容性

- Chrome/Edge (推荐)
- Firefox
- Safari

## 贡献

欢迎通过Issue或Pull Request提交建议和改进。

## 许可证

本项目遵循MIT许可证。

## 致谢

- 设计：龙王 jumper.rong@outlook.com
- 大胡子跑团版权所有 