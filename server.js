const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.text({ type: 'application/xml' }));
app.use(express.json());

// ===== 配置区域（已经配置好了）=====
const CONFIG = {
  corpId: 'ww6f3e646ab817daf5',
  agentId: '1000013',
  secret: 'T_dvp8Nowjy7GjVQu3u3Ns-rt_G_-nNMqoIl_CmTpv8',
  token: 'v8xMJemIzJqGBNnw',  // ✅ 已改为你的 Token
};
// ===================================

// 签名验证
function verifySignature(signature, timestamp, nonce, token) {
  const arr = [token, timestamp, nonce].sort();
  const sha1 = crypto.createHash('sha1').update(arr.join('')).digest('hex');
  return sha1 === signature;
}

// GET - 企业微信服务器验证
app.get('/wechat/callback', (req, res) => {
  const { msg_signature, timestamp, nonce, echostr } = req.query;

  console.log('🔍 验证请求:', { msg_signature, timestamp, nonce, echostr });
  
  // 打印预期签名用于调试
  const expectedSig = verifySignature(msg_signature, timestamp, nonce, CONFIG.token);
  console.log('预期验证结果:', expectedSig ? '成功' : '失败');

  if (verifySignature(msg_signature, timestamp, nonce, CONFIG.token)) {
    console.log('✅ 企业微信验证成功，返回:', echostr);
    res.send(echostr);
  } else {
    console.log('❌ 企业微信验证失败');
    console.log('收到签名:', msg_signature);
    console.log('配置的 Token:', CONFIG.token);
    res.status(403).send('验证失败');
  }
});

// POST - 接收企业微信消息
app.post('/wechat/callback', (req, res) => {
  const { msg_signature, timestamp, nonce } = req.query;

  if (!verifySignature(msg_signature, timestamp, nonce, CONFIG.token)) {
    console.log('❌ 签名验证失败');
    return res.status(403).send('签名验证失败');
  }

  const xmlData = req.body;

  // 简单解析 XML
  const msgType = extractField(xmlData, 'MsgType');
  const fromUser = extractField(xmlData, 'FromUserName');
  const content = extractField(xmlData, 'Content');

  console.log('📩 收到企业微信消息:', {
    type: msgType,
    from: fromUser,
    content: content,
    time: new Date().toLocaleString('zh-CN')
  });

  // TODO: 转发到 OpenClaw
  console.log('⚠️ 消息已记录，等待对接 OpenClaw API');

  res.send('success');
});

// 提取 XML 字段
function extractField(xml, field) {
  const start = xml.indexOf(`<${field}>`);
  if (start === -1) return '';
  const end = xml.indexOf(`</${field}>`, start);
  if (end === -1) return '';
  return xml.substring(start + field.length + 2, end);
}

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    token: CONFIG.token
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({ 
    name: 'ClawsBot 企业微信适配器',
    token: CONFIG.token,
    status: '运行中'
  });
});

// 启动
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`
╔═════════════════════════════════════════╗
║   ClawsBot 企业微信适配器已启动         ║
╠═════════════════════════════════════════╣
║   Token: ${CONFIG.token}
║   端口: ${process.env.PORT || 3000}
╚═════════════════════════════════════════╝
  `);
});

滚动到页面底部
在 "Commit changes" 下面，填写：
第一行（可选）：`更新 Token 配置`
点击 "Commit changes"
---

## 🚀 第 3 步：强制 Vercel 重新部署
访问你的 Vercel 项目
点击 "Deployments"
找到最新的部署
点击 "..." → "Redeploy"
等待 1-2 分钟，直到变成绿色 ✅
---

## ✅ 第 4 步：验证企业微信
去企业微信后台
点击 "验证服务器"
应该显示 ✅ 验证成功
