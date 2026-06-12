/* global process */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

function setCorsHeaders(req, res) {
  const configuredOrigins = (process.env.ALLOWED_ORIGINS || [
    'https://gongkeshi.github.io',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:5176',
    'http://127.0.0.1:5177',
    'http://127.0.0.1:5178',
    'http://127.0.0.1:5179',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5178',
    'http://localhost:5179',
  ].join(','))
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
  const requestOrigin = req.headers.origin
  const allowedOrigin = configuredOrigins.includes(requestOrigin) ? requestOrigin : configuredOrigins[0]

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Vary', 'Origin')
}

function buildPrompt(payload) {
  const skills = Array.isArray(payload.skills)
    ? payload.skills.map(skill => `${skill.key} ${skill.name}: ${skill.tier}阶, 冷却 ${skill.cooldown}s, ${skill.description}`).join('\n')
    : '无技能数据'

  return [
    '你是一个中文游戏内器灵助手，帮助玩家理解修仙小游戏的技能和当前局势。',
    '回答必须简短、直接、适合游戏内显示。不要编造不存在的键位或技能。',
    '如果玩家问操作建议，要结合当前血量、灵脉血量、冷却、技能阶数回答。',
    '',
    `角色：${payload.role?.name || '未知'} / ${payload.role?.title || ''}`,
    `角色特点：${payload.role?.trait || ''}`,
    `状态：分数 ${payload.gameState?.score}, 击破 ${payload.gameState?.kills}, 时间 ${payload.gameState?.time}s, 灵脉 HP ${payload.gameState?.coreHp}, 角色 HP ${payload.gameState?.playerHp}, 升阶点 ${payload.gameState?.upgradePoints}`,
    `技能：\n${skills}`,
    '',
    `玩家问题：${payload.question}`,
  ].join('\n')
}

export default async function handler(req, res) {
  setCorsHeaders(req, res)

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'DEEPSEEK_API_KEY is not configured on the server' })
    return
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
  if (!payload.question || !payload.role || !payload.gameState) {
    res.status(400).json({ error: 'Missing question, role, or gameState' })
    return
  }

  const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      temperature: 0.6,
      max_tokens: 220,
      messages: [
        {
          role: 'system',
          content: '你是一个修仙小游戏的游戏内助手，只回答与当前游戏技能、局势、操作建议相关的问题。使用中文，最多 4 句话。',
        },
        {
          role: 'user',
          content: buildPrompt(payload),
        },
      ],
    }),
  })

  if (!deepseekResponse.ok) {
    const errorText = await deepseekResponse.text()
    res.status(deepseekResponse.status).json({ error: errorText.slice(0, 400) })
    return
  }

  const data = await deepseekResponse.json()
  const answer = data?.choices?.[0]?.message?.content?.trim()

  if (!answer) {
    res.status(502).json({ error: 'DeepSeek returned an empty answer' })
    return
  }

  res.status(200).json({ answer })
}
