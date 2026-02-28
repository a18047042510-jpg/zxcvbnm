const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.text({ type: 'application/xml' }));
app.use(express.json());

// ===== 配置区域 =====
const CONFIG = {
  corpId: 'ww6f3e646ab817daf5',
  agentId: '1000013',
  secret: 'T_dvp8Nowjy7GjVQu3u3Ns-rt_G_-nNMqoIl_CmTpv8',
  token: 'v8xMJemIzJqGBNnw',
};
// =====================

// 签名验证
function verifySignature(signature, timestamp, nonce, token) {
  const arr = [token, timestamp, nonce].sort();
  const sha1 = crypto.createHash('sha1').update(arr.join('')).digest('hex');
  return sha1 === signature;
}

// GET - 企业微信服务器验证
app.get('/wechat/callback', (req, res) => {
  const { msg_signature, timestamp, nonce, echostr } = req.query;

  console.log('🔍 验证请求:', { msg_signature, timestamp, nonce });

  if (verifySignature(msg_signature, timestamp, nonce, CONFIG.token)) {
    console.log('✅ 企业微信验证成功');
    res.send(echostr);
  } else {
    console.log('❌ 企业微信验证失败');
    res.status(403).send('验证失败');
  }
});

// POST - 接收企业微信消息
app.post('/wechat/callback', (req, res) => {
  const { msg_signature, timestamp, nonce } = req.query;

  if (!verifySignature(msg_signature, timestamp, nonce, CONFIG.token)) {
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
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 根路径
app.get('/', (req, res) => {
  res.json({ name: 'ClawsBot 企业微信适配器' });
});

// 启动
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`
╔═════════════════════════════════════════╗
║   ClawsBot 企业微信适配器已启动         ║
╚═════════════════════════════════════════╝
  `);
});
