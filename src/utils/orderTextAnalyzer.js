/**
 * 订单文本分析工具
 * 用于解析文本内容，提取订单信息
 */

/**
 * 解析文本中的订单信息
 * @param {string} text - 需要解析的文本
 * @param {Array} contactList - 联系人列表（可选）
 * @returns {Object} - 解析后的订单数据
 */
export function analyzeOrderText(text, contactList = []) {
    // 确保文本不为空
    if (!text || typeof text !== 'string' || !text.trim()) {
        return null;
    }

    // 预处理文本
    const processedText = preprocessText(text);

    // 初始化订单数据，包含默认值
    const orderData = {
        id: '',
        fee: null,
        startDate: new Date().toISOString().split('T')[0], // 默认为今天
        endDate: '',
        contact: '',
        status: '进行中', // 默认状态
        remarks: ''
    };

    // 1. 提取订单编号 (最高优先级)
    orderData.id = extractOrderId(processedText);

    // 2. 提取截止日期
    orderData.endDate = extractEndDate(processedText);

    // 3. 提取开发费
    orderData.fee = extractFee(processedText);

    // 4. 提取联系人
    orderData.contact = extractContact(processedText, contactList);

    // 5. 提取备注（剩余信息作为备注）
    orderData.remarks = extractRemarks(processedText, orderData);

    return orderData;
}

/**
 * 预处理文本，标准化格式
 */
function preprocessText(text) {
    // 移除多余空格，替换特殊字符等
    let processed = text.trim()
        .replace(/\s+/g, ' ')
        .replace(/：/g, ':')
        .replace(/，/g, ' ')
        .replace(/。/g, ' ');

    return processed;
}

/**
 * 提取订单编号
 */
function extractOrderId(text) {
    // 匹配模式1: 项目编号后面跟着的字母+数字组合
    const idPatterns = [
        /(?:项目编号|编号)[^\w]*([a-zA-Z]\d+)/i,
        /(?:项目|编号)[^\w]*([a-zA-Z]\d+)/i,
        /([a-zA-Z]\d+)/i  // 最后尝试匹配任何字母+数字组合
    ];

    // 尝试每种模式
    for (const pattern of idPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            // 标准化订单ID格式 (大写)
            return match[1].toUpperCase();
        }
    }

    // 如果上述模式都失败，尝试更宽松的模式
    const fallbackMatch = text.match(/([a-zA-Z][a-zA-Z0-9]+)/i);
    if (fallbackMatch && fallbackMatch[1]) {
        return fallbackMatch[1].toUpperCase();
    }

    return '';
}

/**
 * 提取截止日期
 */
function extractEndDate(text) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // 匹配常见日期格式
    const datePatterns = [
        // 匹配 4/8, 4-8, 4.8 等格式
        {
            regex: /(?:时间|日期)[^0-9]*(\d{1,2})[\/\-\.\\](\d{1,2})/i,
            format: (m, d) => formatDate(currentYear, m, d)
        },
        // 匹配 4月8日, 四月八日等格式
        {
            regex: /(\d{1,2})月(\d{1,2})日?/,
            format: (m, d) => formatDate(currentYear, m, d)
        },
        // 匹配 4-15 这样的格式
        {
            regex: /(\d{1,2})[-\/](\d{1,2})/,
            format: (m, d) => formatDate(currentYear, m, d)
        },
        // 匹配 四月下旬 这样的描述性日期
        {
            regex: /(一|二|三|四|五|六|七|八|九|十[一二]?)月(上|中|下)旬/,
            format: (m, period) => {
                const month = convertChineseNumberToDigit(m);
                let day = 15; // 默认中旬
                if (period === '上') day = 10;
                if (period === '下') day = 25;
                return formatDate(currentYear, month, day);
            }
        },
        // 匹配单独的数字月份，如 "4月"
        {
            regex: /(\d{1,2})月(?!\d)/,
            format: (m) => formatDate(currentYear, m, 15) // 默认为月中
        }
    ];

    // 尝试每种日期模式
    for (const pattern of datePatterns) {
        const match = text.match(pattern.regex);
        if (match) {
            return pattern.format(match[1], match[2]);
        }
    }

    // 如果没有找到具体日期，尝试简单的月份推断
    const chineseMonths = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const numericMonths = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    // 检查中文月份
    for (let i = 0; i < chineseMonths.length; i++) {
        if (text.includes(chineseMonths[i])) {
            return formatDate(currentYear, i + 1, 15);
        }
    }

    // 检查数字月份
    for (let i = 0; i < numericMonths.length; i++) {
        if (text.includes(numericMonths[i])) {
            return formatDate(currentYear, i + 1, 15);
        }
    }

    // 默认设置为当前日期后15天
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 15);
    return defaultDate.toISOString().split('T')[0];
}

/**
 * 提取开发费
 */
function extractFee(text) {
    // 匹配开发费后面的数字
    const feePatterns = [
        /(?:开发费|价格)[^0-9]*(\d+)/i,
        /(\d+)(?:元|块)/
    ];

    for (const pattern of feePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const fee = parseInt(match[1], 10);
            if (fee >= 50 && fee <= 10000) {
                return fee;
            }
        }
    }

    // 尝试匹配独立的数字（在合理范围内）
    const numberMatch = text.match(/\s(\d+)\s/);
    if (numberMatch && numberMatch[1]) {
        const fee = parseInt(numberMatch[1], 10);
        if (fee >= 50 && fee <= 10000) {
            return fee;
        }
    }

    return null;
}

/**
 * 提取联系人
 */
function extractContact(text, contactList = []) {
    // 首先检查是否匹配已知联系人列表
    if (contactList.length > 0) {
        for (const contact of contactList) {
            if (text.includes(contact)) {
                return contact;
            }
        }
    }

    // 匹配常见联系人格式（老师，工程师等）
    const contactPatterns = [
        /([^\s]{1,5}(?:老师|工|教授|博士))/,
        /([^\s]{2,5})\s*$/  // 文本末尾的名字
    ];

    for (const pattern of contactPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    // 尝试找出长度在2-5个字符的汉字序列
    const possibleContacts = text.match(/[\u4e00-\u9fa5]{2,5}/g);
    if (possibleContacts && possibleContacts.length > 0) {
        return possibleContacts[possibleContacts.length - 1]; // 返回最后一个匹配
    }

    return '';
}

/**
 * 提取备注（剩余信息）
 */
function extractRemarks(text, orderData) {
    // 从原文中移除已提取的信息，剩余部分作为备注
    let remarks = text;

    // 移除订单ID相关内容
    if (orderData.id) {
        remarks = remarks.replace(new RegExp(`(项目编号|编号)[^\\w]*${orderData.id}`, 'i'), '');
        remarks = remarks.replace(new RegExp(orderData.id, 'i'), '');
    }

    // 移除开发费相关内容
    if (orderData.fee) {
        remarks = remarks.replace(new RegExp(`(开发费|讲解|价格)[^0-9]*${orderData.fee}`, 'i'), '');
        remarks = remarks.replace(new RegExp(`${orderData.fee}(元|块)?`, 'i'), '');
    }

    // 移除日期相关内容
    remarks = remarks.replace(/(?:时间|日期)[^0-9]*\d{1,2}[\/\-\.\\]\d{1,2}/i, '');
    remarks = remarks.replace(/\d{1,2}月\d{1,2}日?/, '');
    remarks = remarks.replace(/\d{1,2}[-\/]\d{1,2}/, '');

    // 移除联系人
    if (orderData.contact) {
        remarks = remarks.replace(orderData.contact, '');
    }

    // 清理剩余文本
    remarks = remarks.replace(/\s+/g, ' ').trim();
    remarks = remarks.replace(/^[,\s\.。，、]+|[,\s\.。，、]+$/g, '');

    // 如果备注中还包含"开发"、"项目"等关键词，可能是项目描述，保留它
    if (remarks.includes('开发项目') || remarks.includes('设计') || remarks.includes('实现')) {
        return remarks;
    }

    // 移除常见的无用词
    const filteredRemarks = remarks.replace(/项目|开发|时间|尽量早点/g, '').trim();
    return filteredRemarks;
}

/**
 * 辅助函数：格式化日期为YYYY-MM-DD
 */
function formatDate(year, month, day) {
    month = parseInt(month, 10);
    day = parseInt(day, 10);

    // 确保数据有效
    if (isNaN(month) || month < 1 || month > 12) month = new Date().getMonth() + 1;
    if (isNaN(day) || day < 1 || day > 31) day = 15;

    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

/**
 * 辅助函数：中文数字转阿拉伯数字
 */
function convertChineseNumberToDigit(chineseNumber) {
    const map = {
        '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
        '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
        '十一': 11, '十二': 12
    };

    return map[chineseNumber] || new Date().getMonth() + 1;
}