// 保留消息发送相关功能
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendMessage');

// 配置HuggingFace API
const HF_API = 'https://api-inference.huggingface.co/models/google/flan-t5-large';  // 使用 T5 模型
const HF_TOKEN = 'hf_xxxxx';  // 替换成您的HuggingFace API Token

// 文件上传相关功能
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
let uploadedFiles = [];

// 处理文件选择
fileInput.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        if (uploadedFiles.length >= 5) {
            alert('最多只能上传5个文件');
            return;
        }
        
        // 检查文件大小
        if (file.size > 5 * 1024 * 1024) {
            alert('文件大小不能超过5MB');
            return;
        }
        
        uploadedFiles.push(file);
        displayFile(file);
    });
    
    // 清空input，允许重复选择相同文件
    fileInput.value = '';
});

// 显示文件预览
function displayFile(file) {
    const fileItem = document.createElement('div');
    fileItem.className = `file-item ${getFileType(file)}`;
    
    fileItem.innerHTML = `
        <i class="fas ${getFileIcon(file)} file-icon"></i>
        <span class="file-name">${file.name}</span>
        <i class="fas fa-times remove-file"></i>
    `;
    
    // 添加删除功能
    const removeBtn = fileItem.querySelector('.remove-file');
    removeBtn.onclick = () => {
        uploadedFiles = uploadedFiles.filter(f => f !== file);
        fileItem.remove();
    };
    
    filePreview.appendChild(fileItem);
}

// 获取文件类型
function getFileType(file) {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.includes('pdf')) return 'pdf';
    return 'document';
}

// 获取文件图标
function getFileIcon(file) {
    if (file.type.startsWith('image/')) return 'fa-image';
    if (file.type.includes('pdf')) return 'fa-file-pdf';
    return 'fa-file-alt';
}

// 修改发送消息函数，添加文件处理
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message && uploadedFiles.length === 0) return;

    // 创建FormData对象
    const formData = new FormData();
    formData.append('message', message);
    uploadedFiles.forEach(file => {
        formData.append('files[]', file);
    });

    // 添加用户消息到界面
    if (message) {
        addMessage(message, 'user');
    }
    
    // 添加文件预览消息
    if (uploadedFiles.length > 0) {
        const fileNames = uploadedFiles.map(f => f.name).join(', ');
        addMessage(`已上传文件：${fileNames}`, 'user');
    }

    userInput.value = '';
    uploadedFiles = [];
    filePreview.innerHTML = '';

    // 显示加载状态
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message loading';
    loadingDiv.textContent = '正在处理...';
    chatMessages.appendChild(loadingDiv);

    try {
        // 这里添加文件上传的API调用
        // ... 其他代码保持不变 ...
    } catch (error) {
        console.error('Error:', error);
        chatMessages.removeChild(loadingDiv);
        addMessage('抱歉，文件处理过程中发生错误，请稍后重试。', 'ai');
    }
}

// 添加错误重试机制
async function fetchWithRetry(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
    throw new Error('最大重试次数已达到');
}

// 添加上下文管理
let conversationContext = [];

function updateContext(message, isUser = true) {
    conversationContext.push({
        role: isUser ? 'user' : 'assistant',
        content: message
    });
    
    // 保持上下文长度在合理范围
    if (conversationContext.length > 10) {
        conversationContext = conversationContext.slice(-10);
    }
}

// 生成会话ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 添加消息到聊天界面
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    if (sender === 'ai') {
        // AI消息使用打字机效果
        let i = 0;
        messageDiv.textContent = '';
        const typeWriter = () => {
            if (i < text.length) {
                messageDiv.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 20);
            }
        };
        typeWriter();
    } else {
        messageDiv.textContent = text;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 绑定发送按钮事件
sendButton.onclick = sendMessage;

// 绑定回车发送
userInput.onkeypress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 初始化照片轮播
const swiper = new Swiper('.swiper', {
    // 基本配置
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },
    
    // 添加导航箭头
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    
    // 添加分页器
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    
    // 添加触摸效果
    effect: 'fade',
    fadeEffect: {
        crossFade: true
    },
    
    // 响应式设计
    breakpoints: {
        768: {
            slidesPerView: 1,
        }
    }
});

// 添加微信二维码弹窗功能
const weixinLink = document.getElementById('weixinLink');
const weixinModal = document.createElement('div');
weixinModal.className = 'weixin-modal';
weixinModal.innerHTML = `
    <div class="weixin-modal-content">
        <span class="close-weixin">&times;</span>
        <img src="images/weixin-qr.jpg" alt="微信二维码">
        <p>扫描二维码添加微信</p>
    </div>
`;
document.body.appendChild(weixinModal);

// 点击微信图标显示二维码
weixinLink.onclick = () => {
    weixinModal.style.display = 'flex';
}

// 点击关闭按钮或者模态框外部关闭
weixinModal.onclick = (e) => {
    if (e.target === weixinModal || e.target.className === 'close-weixin') {
        weixinModal.style.display = 'none';
    }
}

// 添加字符计数功能
const charCounter = document.querySelector('.char-counter');
const textarea = document.getElementById('userInput');
textarea.addEventListener('input', function() {
    // 更新字符计数
    const count = this.value.length;
    const maxLength = this.getAttribute('maxlength');
    charCounter.textContent = `${count}/${maxLength}`;
    
    // 自适应高度
    this.style.height = 'auto';
    const newHeight = Math.min(this.scrollHeight, 180);
    this.style.height = newHeight + 'px';
    
    // 当接近字符限制时改变颜色
    if (count > maxLength * 0.8) {
        charCounter.style.color = '#e74c3c';
    } else {
        charCounter.style.color = '#999';
    }
});

// 添加输入框焦点效果
textarea.addEventListener('focus', function() {
    this.parentElement.style.borderColor = '#1a73e8';
});

textarea.addEventListener('blur', function() {
    this.parentElement.style.borderColor = '#e0e0e0';
}); 