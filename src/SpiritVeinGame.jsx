import { useEffect, useRef, useState } from 'react'

const GAME_WIDTH = 960
const GAME_HEIGHT = 560
const INITIAL_SKILL_COOLDOWNS = {
  q: 0,
  e: 0,
  g: 0,
  r: 0,
  f: 0,
  qe: 0,
  space: 0,
}
const SKILL_KEYS = ['q', 'e', 'g', 'r', 'f', 'qe', 'space']
const INITIAL_SKILL_LEVELS = {
  q: 1,
  e: 1,
  g: 1,
  r: 1,
  f: 1,
  qe: 1,
  space: 1,
}
const ASSISTANT_IDLE_TEXT = '我是器灵助手 / Spirit Assistant：可以自由问技能、连招、升阶、保命、守灵脉和当前冷却。'
const ASSISTANT_API_IDLE_TEXT = 'DeepSeek API：请先填入代理地址 / Add a proxy endpoint, or deploy api/deepseek-skill-agent.js.'
const ICE_ASSISTANT_QUESTIONS = [
  '人剑合一怎么用？ / How do I use Sword Unity?',
  '冰修怎么连招？ / What is the ice combo?',
  'Q+E领域怎么放？ / How do I cast the domain?',
  '怎么升阶？ / How do upgrades work?',
]
const FIRE_ASSISTANT_QUESTIONS = [
  '火修怎么连招？ / What is the fire combo?',
  '大招怎么用？ / How should I use the ultimate?',
  'R技能有什么用？ / What does R do?',
  '怎么升阶？ / How do upgrades work?',
]
const SKILL_DETAILS = {
  bing: {
    q: {
      keyLabel: 'Q',
      name: '半月霜波',
      enName: 'Crescent Frost Wave',
      tiers: ['单道半月波，命中减速', '双月交错，范围更宽', '五重冰月，巨幅减速并短冻'],
      tiersEn: ['Single crescent wave that slows enemies', 'Twin crossed waves with a wider reach', 'Five frost moons with heavy slow and brief freeze'],
    },
    e: {
      keyLabel: 'E',
      name: '万剑归宗',
      enName: 'Ten Thousand Swords',
      tiers: ['一圈剑阵清场', '双层剑阵，高穿透', '三重剑暴，雷光满屏'],
      tiersEn: ['A sword ring for clearing nearby enemies', 'Double sword rings with high pierce', 'Triple sword storm with lightning trails'],
    },
    g: {
      keyLabel: 'G',
      name: '人剑合一',
      enName: 'Sword Unity',
      tiers: ['化身飞剑 5 秒', '剑形更快，剑气更强', '天剑合一，飞剑留下寒霜剑痕'],
      tiersEn: ['Become a flying sword for 5 seconds', 'Faster sword form with stronger sword aura', 'Heaven sword form leaves frost slash trails'],
    },
    r: {
      keyLabel: 'R',
      name: '冰影分身',
      enName: 'Frost Shadow Clones',
      tiers: ['两个分身齐射', '三个分身更久更快', '六影同屏，弹幕压制'],
      tiersEn: ['Two clones fire together', 'Three faster clones last longer', 'Six shadows fill the screen with pressure fire'],
    },
    f: {
      keyLabel: 'F',
      name: '玄冰封界',
      enName: 'Profound Ice Seal',
      tiers: ['全场直接冰封 2 秒', '冰封更久', '极寒冰封，再按 F 引爆冻结目标'],
      tiersEn: ['Instantly freezes the field for 2 seconds', 'Longer full-field freeze', 'Press F again to detonate frozen targets'],
    },
    qe: {
      keyLabel: 'Q+E',
      name: '冰魄领域',
      enName: 'Frost Soul Domain',
      tiers: ['脚下展开冰纹法阵', '更大领域，冰符旋转', '极寒大阵，强控高伤害'],
      tiersEn: ['Open an ice sigil field under your feet', 'Larger domain with rotating frost runes', 'Extreme frost array with heavy control and damage'],
    },
    space: {
      keyLabel: '空格',
      keyLabelEn: 'Space',
      name: '九霄天雷',
      enName: 'Nine Heavens Thunder',
      tiers: ['全场落雷，直接打击所有敌人', '连锁雷暴，伤害更高', '天劫雷海，多段重击清场'],
      tiersEn: ['Lightning strikes every enemy on the field', 'Chain thunderstorm with higher damage', 'Heavenly thunder sea hits in multiple waves'],
    },
  },
  huo: {
    q: {
      keyLabel: 'Q',
      name: '陨炎大火球',
      enName: 'Meteor Fireball',
      tiers: ['一颗大火球，爆炸溅射', '双火球连爆', '三颗陨火巨爆，清屏压制'],
      tiersEn: ['One large fireball with splash explosion', 'Two fireballs with chained blasts', 'Three meteor fireballs for huge screen pressure'],
    },
    e: {
      keyLabel: 'E',
      name: '赤焰光束',
      enName: 'Scarlet Flame Beam',
      tiers: ['直线火焰光束', '更宽更久的灼烧光束', '双重贯穿光束，持续融化'],
      tiersEn: ['Straight flame beam', 'Wider and longer burning beam', 'Twin piercing beams that melt enemies'],
    },
    r: {
      keyLabel: 'R',
      name: '护体炎星',
      enName: 'Orbiting Flame Stars',
      tiers: ['三颗火球环绕护体', '五颗火球持续灼烧', '九颗巨焰环绕，贴身粉碎'],
      tiersEn: ['Three orbiting fireballs protect you', 'Five fireballs keep burning nearby enemies', 'Nine giant flames crush close targets'],
    },
    space: {
      keyLabel: '空格',
      keyLabelEn: 'Space',
      name: '焚天蓄炎',
      enName: 'Heaven-Burning Charge',
      tiers: ['蓄力后释放超大火球', '更大的爆裂炎核', '太阳般巨型火球，超大爆炸'],
      tiersEn: ['Charge, then release a huge fireball', 'Larger explosive flame core', 'Sun-sized fireball with massive explosion'],
    },
  },
}

const INITIAL_STATS = {
  score: 0,
  kills: 0,
  time: 0,
  coreHp: 260,
  playerHp: 100,
  skillCd: 0,
  skillCds: INITIAL_SKILL_COOLDOWNS,
  skillLevels: INITIAL_SKILL_LEVELS,
  upgradePoints: 0,
  nextUpgradeScore: 200,
  iceDetonationWindow: 0,
  paused: false,
}

const ROLES = {
  bing: {
    id: 'bing',
    name: '冰修',
    nameEn: 'Ice Cultivator',
    title: '寒霜分影',
    titleEn: 'Frost Shadow Adept',
    trait: '控场型修士，G 键人剑合一化身飞剑 5 秒，Q+E 原地展开冰魄领域。',
    traitEn: 'A control-focused cultivator. Press G to become a flying sword for 5 seconds, and Q+E to open a frost domain in place.',
    attack: '冰棱术',
    attackEn: 'Ice Shard Art',
    skill: '寒霜七式',
    skillEn: 'Seven Frost Arts',
    hp: 145,
    speed: 225,
    damageTaken: 0.82,
    attackCooldown: 0.28,
    color: '#0284c7',
    accent: '#bae6fd',
    skills: {
      q: { name: '半月霜波', nameEn: 'Crescent Frost Wave', cooldown: 2.2 },
      e: { name: '万剑归宗', nameEn: 'Ten Thousand Swords', cooldown: 5.5 },
      g: { name: '人剑合一', nameEn: 'Sword Unity', cooldown: 6.8 },
      r: { name: '冰影分身', nameEn: 'Frost Shadow Clones', cooldown: 7.8 },
      f: { name: '玄冰封界', nameEn: 'Profound Ice Seal', cooldown: 8.2 },
      qe: { name: '冰魄领域', nameEn: 'Frost Soul Domain', cooldown: 12.5 },
      space: { name: '九霄天雷', nameEn: 'Nine Heavens Thunder', cooldown: 9.8 },
    },
  },
  huo: {
    id: 'huo',
    name: '火修',
    nameEn: 'Fire Cultivator',
    title: '地火焚天',
    titleEn: 'Earthfire Adept',
    trait: '爆发型修士，大火球、光束、环绕火球与蓄力巨焰轮番清场。',
    traitEn: 'A burst-damage cultivator who clears waves with fireballs, beams, orbiting flames, and a charged mega fireball.',
    attack: '火球术',
    attackEn: 'Fireball Art',
    skill: '炎火四式',
    skillEn: 'Four Flame Arts',
    hp: 105,
    speed: 245,
    damageTaken: 1,
    attackCooldown: 0.45,
    color: '#dc2626',
    accent: '#fdba74',
    skills: {
      q: { name: '陨炎大火球', nameEn: 'Meteor Fireball', cooldown: 2.4 },
      e: { name: '赤焰光束', nameEn: 'Scarlet Flame Beam', cooldown: 4.8 },
      r: { name: '护体炎星', nameEn: 'Orbiting Flame Stars', cooldown: 7.2 },
      space: { name: '焚天蓄炎', nameEn: 'Heaven-Burning Charge', cooldown: 11.5 },
    },
  },
}

const ENEMY_TYPES = [
  {
    name: '妖兽',
    nameEn: 'Demon Beast',
    color: '#7c3aed',
    hp: 34,
    speed: 58,
    damage: 8,
    radius: 15,
    score: 12,
    minTime: 0,
  },
  {
    name: '心魔',
    nameEn: 'Inner Demon',
    color: '#db2777',
    hp: 24,
    speed: 94,
    damage: 7,
    radius: 12,
    score: 16,
    minTime: 18,
  },
  {
    name: '魔修',
    nameEn: 'Dark Cultivator',
    color: '#0891b2',
    hp: 46,
    speed: 50,
    damage: 12,
    radius: 16,
    score: 22,
    minTime: 32,
  },
  {
    name: '天劫残影',
    nameEn: 'Tribulation Shade',
    color: '#ca8a04',
    hp: 120,
    speed: 40,
    damage: 20,
    radius: 22,
    score: 60,
    minTime: 58,
  },
]

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function normalize(x, y) {
  const length = Math.hypot(x, y) || 1
  return { x: x / length, y: y / length }
}

function distanceToSegment(point, start, end) {
  const vx = end.x - start.x
  const vy = end.y - start.y
  const wx = point.x - start.x
  const wy = point.y - start.y
  const lengthSq = vx * vx + vy * vy || 1
  const t = clamp((wx * vx + wy * vy) / lengthSq, 0, 1)
  const closest = {
    x: start.x + vx * t,
    y: start.y + vy * t,
  }
  return distance(point, closest)
}

function getRoleSkillKeys(role) {
  if (!role?.skills) return []
  return role.skills.g ? ['q', 'e', 'g', 'r', 'f', 'qe', 'space'] : ['q', 'e', 'r', 'space']
}

function bilingualText(cn, en) {
  return `${cn} / ${en}`
}

function getKeyLabel(detail, compact = false) {
  if (compact && detail.keyLabelEn === 'Space') return 'Sp'
  return detail.keyLabelEn ? bilingualText(detail.keyLabel, detail.keyLabelEn) : detail.keyLabel
}

function getSkillDisplayName(role, key) {
  const skill = role.skills[key]
  const detail = SKILL_DETAILS[role.id][key]
  return bilingualText(skill.name, skill.nameEn || detail.enName)
}

function getTierDisplayText(detail, level, withDetonationHint = false) {
  const cn = detail.tiers[level - 1]
  const en = detail.tiersEn[level - 1]
  const hint = withDetonationHint ? '；3阶解锁二段 / Tier 3 unlocks detonation' : ''
  return `${cn} / ${en}${hint}`
}

function getReadyText(cooldown) {
  return cooldown <= 0 ? bilingualText('就绪', 'Ready') : `${cooldown.toFixed(1)}s`
}

function getRoleSkillText(role) {
  const keys = getRoleSkillKeys(role)
  const labels = keys.map(key => getKeyLabel(SKILL_DETAILS[role.id][key], true)).join('/')
  const countText = keys.length === 7 ? '七式' : keys.length === 6 ? '六式' : keys.length === 5 ? '五式' : '四式'
  return `技能 / Skills：${labels} ${countText} / ${keys.length} Arts；每 200 分 1 点 / 1 point per 200 score；最高 3 阶 / Max Tier 3`
}

function isTextEntryTarget(target) {
  const tagName = target?.tagName?.toLowerCase()
  return target?.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

function getStoredAssistantEndpoint() {
  try {
    return window.localStorage.getItem('deepseekAgentEndpoint') || import.meta.env.VITE_DEEPSEEK_AGENT_ENDPOINT || ''
  } catch {
    return import.meta.env.VITE_DEEPSEEK_AGENT_ENDPOINT || ''
  }
}

function saveAssistantEndpoint(endpoint) {
  try {
    if (endpoint.trim()) {
      window.localStorage.setItem('deepseekAgentEndpoint', endpoint.trim())
    } else {
      window.localStorage.removeItem('deepseekAgentEndpoint')
    }
  } catch {
    // Local storage can be unavailable in restricted browser modes.
  }
}

function spentUpgradePoints(skillLevels) {
  return SKILL_KEYS.reduce((total, key) => total + ((skillLevels[key] || 1) - 1), 0)
}

function refreshUpgradePoints(game) {
  const earnedPoints = Math.floor(game.score / 200)
  game.upgradePoints = Math.max(0, earnedPoints - spentUpgradePoints(game.skillLevels))
  game.nextUpgradeScore = (earnedPoints + 1) * 200
}

function getSkillLevel(game, key) {
  return game.skillLevels?.[key] || 1
}

function getSkillCooldown(game, key) {
  const baseCooldown = game.role.skills?.[key]?.cooldown || game.role.skillCooldown || 0
  const level = getSkillLevel(game, key)
  if (level >= 3) return baseCooldown * 0.58
  if (level === 2) return baseCooldown * 0.78
  return baseCooldown
}

function getSkillStatusText(role, stats) {
  if (!role?.skills) return ''

  return getRoleSkillKeys(role)
    .map(key => {
      const detail = SKILL_DETAILS[role.id][key]
      const level = stats.skillLevels?.[key] || 1
      const cooldown = stats.skillCds?.[key] || 0
      const status = role.id === 'bing' && key === 'f' && stats.iceDetonationWindow > 0
        ? bilingualText('二段可引爆', 'Detonate Ready')
        : getReadyText(cooldown)
      return `${getKeyLabel(detail, true)} ${role.skills[key].name} T${level}/${status}`
    })
    .join('；')
}

function buildAssistantPayload(question, role, stats) {
  return {
    question,
    role: {
      id: role.id,
      name: role.name,
      title: role.title,
      trait: role.trait,
    },
    gameState: {
      score: stats.score,
      kills: stats.kills,
      time: stats.time,
      coreHp: stats.coreHp,
      playerHp: stats.playerHp,
      upgradePoints: stats.upgradePoints,
      paused: stats.paused,
    },
    skills: getRoleSkillKeys(role).map(key => ({
      key: SKILL_DETAILS[role.id][key].keyLabel,
      id: key,
      name: role.skills[key].name,
      tier: stats.skillLevels?.[key] || 1,
      cooldown: Number((stats.skillCds?.[key] || 0).toFixed(2)),
      description: SKILL_DETAILS[role.id][key].tiers[(stats.skillLevels?.[key] || 1) - 1],
    })),
  }
}

async function requestDeepSeekAssistant(endpoint, question, role, stats) {
  const trimmedEndpoint = endpoint.trim()
  if (!trimmedEndpoint) {
    throw new Error('DeepSeek代理地址未配置')
  }

  const response = await fetch(trimmedEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildAssistantPayload(question, role, stats)),
  })

  if (!response.ok) {
    throw new Error(`DeepSeek代理请求失败：${response.status}`)
  }

  const data = await response.json()
  if (!data?.answer) {
    throw new Error('DeepSeek代理没有返回 answer')
  }

  return data.answer
}

function answerSkillQuestion(question, role, stats) {
  if (!role?.skills) return ASSISTANT_IDLE_TEXT

  const text = question.toLowerCase()
  const statusText = getSkillStatusText(role, stats)
  const coreDanger = stats.coreHp <= 90
  const playerDanger = stats.playerHp <= 45

  if (text.includes('灵脉') || text.includes('守不住') || text.includes('快没血') || text.includes('危险') || text.includes('被围') || text.includes('围住')) {
    if (role.id === 'bing') {
      return `${coreDanger ? '灵脉血量已经危险，' : ''}冰修守底线优先用 Q+E 在灵脉前放冰魄领域，再用 F 全场冰封拖时间；敌人聚到一起时用 E 剑阵或空格天雷清掉。当前状态：${statusText}。`
    }
    return `${coreDanger ? '灵脉血量已经危险，' : ''}火修被压到底线时先开 R 护体炎星，接 E 光束扫直线，再用 Q 或空格蓄力火球炸敌人密集方向。当前状态：${statusText}。`
  }

  if (text.includes('没血') || text.includes('残血') || text.includes('保命') || text.includes('活不下去')) {
    if (role.id === 'bing') {
      return `${playerDanger ? '你现在血量偏低，' : ''}冰修保命靠控场：先 F 冰封争取走位，再 Q 减速追你的敌人，Q+E 留给灵脉前的压力波。`
    }
    return `${playerDanger ? '你现在血量偏低，' : ''}火修保命先开 R 环绕火球防贴脸，边退边用 E 光束扫开路线，别在蓄力大招时站太近。`
  }

  if (text.includes('升阶') || text.includes('升级') || text.includes('200') || text.includes('3阶') || text.includes('三阶')) {
    return `每 200 分获得 1 个升阶点，技能最高 3 阶。3 阶效果会明显夸张：冰修有五重冰月、人剑合一三重剑痕、强领域、F二段引爆；火修有巨型火球和更强清场。当前可用升阶点：${stats.upgradePoints}。`
  }

  if (text.includes('先升') || text.includes('优先') || text.includes('加点') || text.includes('哪个强') || text.includes('推荐')) {
    if (role.id === 'bing') {
      return '冰修推荐升阶顺序：先 Q 提高清怪和减速，再升 G 人剑合一增强突围爆发；如果主要守灵脉，就优先升 Q+E 领域，最后补 F、R 分身和空格天雷。'
    }
    return '火修推荐升阶顺序：先 Q 大火球提高爆发，再升 R 增强贴身防守；如果敌人排成直线很多，就先升 E 光束，后期再把空格大火球拉到3阶。'
  }

  if (text.includes('敌人') || text.includes('妖兽') || text.includes('心魔') || text.includes('魔修') || text.includes('天劫')) {
    return '敌人会从上方和两侧进攻灵脉：妖兽是基础怪，心魔更快，魔修更肉，天劫残影血量很高。遇到快怪先减速或开护体，遇到肉怪用爆发技能集中清。'
  }

  if (role.id === 'bing') {
    if (text.includes('q') || text.includes('半月') || text.includes('冰波') || text.includes('减速')) {
      return 'Q 半月霜波是冰修最常用的控场技能，放射半月形攻击波，命中会减速；升到3阶会变成多重冰月，适合先手拖住敌人。'
    }
    if (text.includes('人剑') || text.includes('合一') || text.includes('g') || text.includes('冲刺') || text.includes('突围')) {
      return 'G 人剑合一会让冰修本体消失，化身飞剑 5 秒。期间移动更快，碰到敌人会造成剑气伤害并短暂冻结，适合突围和追杀。'
    }
    if (text.includes('e') || text.includes('万剑') || text.includes('剑阵') || text.includes('剑')) {
      return 'E 万剑归宗会展开剑阵并向四周射出冰剑，适合敌人包围你或靠近灵脉时释放；现在剑数量更少但单剑更强，画面也更清楚。'
    }
    if (text.includes('二段') || text.includes('爆') || text.includes('f')) {
      return 'F 是玄冰封界：直接冰封全场。升到 3 阶后，冰封期间再按一次 F，会只引爆被冻结的目标，不是全图爆炸。'
    }
    if (text.includes('领域') || text.includes('冰场') || text.includes('q+e') || text.includes('qe')) {
      return 'Q+E 会在自己脚下展开冰魄领域，适合站在灵脉前方控场。领域冷却更长，建议敌人压到底部时再放。'
    }
    if (text.includes('分身') || text.includes('r')) {
      return 'R 是冰影分身：分身会朝鼠标方向持续射击。升阶后分身更多、更久，3阶会形成弹幕压制。'
    }
    if (text.includes('大招') || text.includes('空格') || text.includes('space') || text.includes('天雷')) {
      return '空格是九霄天雷，会全场落雷打击敌人，适合敌人很多但分散时使用；它不是持续冰场，冰场是 Q+E。'
    }
    if (text.includes('连招') || text.includes('怎么打') || text.includes('顺序')) {
      return '冰修推荐连招：Q减速开路，敌人聚集后Q+E放领域，R补弹幕，危险时F全场冰封；F到3阶后冰封期间再按F点爆冻结目标。'
    }
    if (text.includes('冷却') || text.includes('cd') || text.includes('状态')) {
      return `当前冰修技能状态：${statusText}。`
    }
    return `冰修技能：Q半月霜波减速，E万剑归宗清场，G人剑合一化身飞剑，R冰影分身压制，F玄冰封界控场，Q+E冰魄领域守底线，空格九霄天雷全场打击。当前状态：${statusText}。`
  }

  if (text.includes('q') || text.includes('火球') || text.includes('大火球')) {
    return 'Q 是陨炎大火球，命中后爆炸溅射，适合炸敌人密集点；升阶后火球数量和爆炸范围都会提升。'
  }
  if (text.includes('e') || text.includes('光束') || text.includes('激光')) {
    return 'E 是赤焰光束，适合清一条直线上的敌人。鼠标瞄准敌人来的方向再放，收益会比随手释放高。'
  }
  if (text.includes('大招') || text.includes('空格') || text.includes('space')) {
    return '火修大招是焚天蓄炎：按空格蓄力 1 秒后，朝鼠标方向释放超大火球。最好先把鼠标瞄向敌人密集方向。'
  }
  if (text.includes('r') || text.includes('环绕')) {
    return 'R 是护体炎星：召唤环绕火球，适合敌人贴近时开。升到3阶后火球数量和体积都很夸张。'
  }
  if (text.includes('连招') || text.includes('怎么打') || text.includes('顺序')) {
    return '火修推荐连招：R先开护体，E光束扫直线，Q大火球炸密集敌人，空格蓄力巨火球清远处大波。'
  }
  if (text.includes('冷却') || text.includes('cd') || text.includes('状态')) {
    return `当前火修技能状态：${statusText}。`
  }
  return `火修技能：Q陨炎大火球爆炸溅射，E赤焰光束直线清怪，R护体炎星近身防守，空格焚天蓄炎蓄力巨火球。当前状态：${statusText}。`
}

function buildStats(game) {
  refreshUpgradePoints(game)
  return {
    score: Math.floor(game.score),
    kills: game.kills,
    time: Math.floor(game.time),
    coreHp: Math.ceil(game.core.hp),
    playerHp: Math.ceil(game.player.hp),
    skillCd: game.skillCd,
    skillCds: { ...game.skillCds },
    skillLevels: { ...game.skillLevels },
    upgradePoints: game.upgradePoints,
    nextUpgradeScore: game.nextUpgradeScore,
    iceDetonationWindow: game.iceDetonationWindow,
    paused: game.paused,
  }
}

function createGame(role) {
  return {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    role,
    player: {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - 150,
      radius: 16,
      hp: role.hp,
      maxHp: role.hp,
      invulnerable: 0,
    },
    core: {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - 58,
      radius: 38,
      hp: 260,
      maxHp: 260,
    },
    mouse: {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      down: false,
    },
    keys: new Set(),
    projectiles: [],
    enemySpells: [],
    enemies: [],
    zones: [],
    clones: [],
    beams: [],
    orbitals: [],
    magmaJets: [],
    charges: [],
    lightnings: [],
    swordAuras: [],
    swordUnitySlashes: [],
    iceExplosions: [],
    particles: [],
    attackCd: 0,
    skillCd: 0,
    skillCds: { ...INITIAL_SKILL_COOLDOWNS },
    skillLevels: { ...INITIAL_SKILL_LEVELS },
    upgradePoints: 0,
    nextUpgradeScore: 200,
    freezeTimer: 0,
    iceDetonationWindow: 0,
    swordForm: null,
    screenFlash: 0,
    screenFlashKind: 'frost',
    spawnTimer: 1.2,
    score: 0,
    kills: 0,
    time: 0,
    uiTimer: 0,
    paused: false,
    phase: 'playing',
  }
}

function createEnemy(game) {
  const available = ENEMY_TYPES.filter(enemy => game.time >= enemy.minTime)
  const type = available[Math.floor(Math.random() * available.length)]
  const side = Math.floor(Math.random() * 3)
  let x
  let y

  if (side === 0) {
    x = Math.random() * game.width
    y = -30
  } else if (side === 1) {
    x = game.width + 30
    y = Math.random() * (game.height - 130)
  } else {
    x = -30
    y = Math.random() * (game.height - 130)
  }

  const difficulty = 1 + game.time / 110
  return {
    ...type,
    x,
    y,
    hp: Math.round(type.hp * difficulty),
    maxHp: Math.round(type.hp * difficulty),
    speed: type.speed * (1 + Math.min(game.time / 220, 0.35)),
    contactCd: 0,
    spellCd: 2.2 + Math.random() * 2.2,
    slowTimer: 0,
    slowFactor: 1,
    frozenTimer: 0,
  }
}

function addParticle(game, x, y, color, count = 7) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2
    const speed = 40 + Math.random() * 90
    game.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.35 + Math.random() * 0.35,
      maxLife: 0.7,
      color,
    })
  }
}

function addLightning(game, x1, y1, x2, y2, color = '#e0f2fe') {
  game.lightnings.push({
    x1,
    y1,
    x2,
    y2,
    color,
    life: 0.25,
    maxLife: 0.25,
  })
}

function castEnemySpell(game, enemy) {
  const target = game.player.hp > 0 && distance(enemy, game.player) < 480 ? game.player : game.core
  const aim = normalize(target.x - enemy.x, target.y - enemy.y)
  const typeBoost = enemy.minTime >= 58 ? 1.16 : enemy.minTime >= 32 ? 1.08 : 1

  game.enemySpells.push({
    x: enemy.x,
    y: enemy.y,
    vx: aim.x * 145 * typeBoost,
    vy: aim.y * 145 * typeBoost,
    radius: enemy.minTime >= 58 ? 9 : 7,
    damage: enemy.minTime >= 58 ? 14 : enemy.minTime >= 32 ? 10 : 6,
    life: 3.2,
    maxLife: 3.2,
    color: enemy.minTime >= 58 ? '#facc15' : enemy.minTime >= 32 ? '#67e8f9' : '#c084fc',
    target: target === game.player ? 'player' : 'core',
  })
}

function fireProjectile(game, angle, options) {
  const source = options.source || game.player
  game.projectiles.push({
    kind: options.kind || 'orb',
    x: source.x + Math.cos(angle) * (options.offset || 20),
    y: source.y + Math.sin(angle) * (options.offset || 20),
    vx: Math.cos(angle) * options.speed,
    vy: Math.sin(angle) * options.speed,
    angle,
    radius: options.radius,
    damage: options.damage,
    life: options.life,
    maxLife: options.life,
    color: options.color,
    splash: options.splash || 0,
    pierce: options.pierce || 0,
    slowDuration: options.slowDuration || 0,
    slowFactor: options.slowFactor || 1,
    freezeDuration: options.freezeDuration || 0,
    bladeLength: options.bladeLength || 0,
    bladeWidth: options.bladeWidth || 0,
    trailLength: options.trailLength || 0,
    hitEnemies: new Set(),
  })
}

function normalAttack(game) {
  if (game.attackCd > 0) return

  const aim = normalize(game.mouse.x - game.player.x, game.mouse.y - game.player.y)
  const angle = Math.atan2(aim.y, aim.x)

  if (game.role.id === 'bing') {
    fireProjectile(game, angle, {
      speed: 680,
      radius: 6,
      damage: 34,
      life: 0.55,
      color: '#60a5fa',
      pierce: 1,
    })
  } else {
    fireProjectile(game, angle, {
      speed: 500,
      radius: 9,
      damage: 30,
      life: 1.25,
      color: '#fb923c',
      splash: 42,
    })
  }

  game.attackCd = game.role.attackCooldown
}

function isSkillReady(game, key) {
  return (game.skillCds[key] || 0) <= 0
}

function putSkillOnCooldown(game, key) {
  game.skillCds[key] = getSkillCooldown(game, key)
}

function castIceQ(game) {
  if (!isSkillReady(game, 'q')) return

  const aim = normalize(game.mouse.x - game.player.x, game.mouse.y - game.player.y)
  const angle = Math.atan2(aim.y, aim.x)
  const level = getSkillLevel(game, 'q')
  const waveAngles = level >= 3 ? [-0.48, -0.24, 0, 0.24, 0.48] : level === 2 ? [-0.18, 0.18] : [0]
  const radius = level >= 3 ? 92 : level === 2 ? 68 : 54
  const damage = level >= 3 ? 86 : level === 2 ? 52 : 34
  const slowDuration = level >= 3 ? 4.2 : level === 2 ? 3.1 : 2.4
  const slowFactor = level >= 3 ? 0.22 : level === 2 ? 0.35 : 0.45

  for (const offsetAngle of waveAngles) {
    fireProjectile(game, angle + offsetAngle, {
      kind: 'crescent',
      speed: level >= 3 ? 520 : 440,
      radius,
      damage,
      life: level >= 3 ? 1.15 : 0.85,
      color: level >= 3 ? '#e0f2fe' : '#bae6fd',
      slowDuration,
      slowFactor,
      offset: 34,
      freezeDuration: level >= 3 ? 0.55 : 0,
    })
  }

  addParticle(game, game.player.x + aim.x * 28, game.player.y + aim.y * 28, '#e0f2fe', level >= 3 ? 36 : 18)
  putSkillOnCooldown(game, 'q')
}

function castIceE(game) {
  if (!isSkillReady(game, 'e')) return

  const level = getSkillLevel(game, 'e')
  const rings = level >= 3 ? 2 : level === 2 ? 2 : 1
  const blades = level >= 3 ? 14 : level === 2 ? 10 : 8

  if (!game.swordAuras) game.swordAuras = []
  game.swordAuras.push({
    x: game.player.x,
    y: game.player.y,
    radius: level >= 3 ? 138 : level === 2 ? 106 : 76,
    life: 0.72,
    maxLife: 0.72,
    level,
    bladeCount: rings * blades,
    color: '#dbeafe',
    phase: Math.random() * Math.PI * 2,
  })

  for (let ring = 0; ring < rings; ring += 1) {
    const delayAngle = (ring * Math.PI) / blades
    for (let i = 0; i < blades; i += 1) {
      fireProjectile(game, (Math.PI * 2 * i) / blades + delayAngle, {
        kind: 'sword',
        speed: 620 + ring * 90,
        radius: level >= 3 ? 13 : level === 2 ? 11 : 10,
        damage: level >= 3 ? 78 : level === 2 ? 54 : 42,
        life: level >= 3 ? 1.42 : level === 2 ? 1.26 : 1.05,
        color: ring % 2 === 0 ? '#bfdbfe' : '#e0f2fe',
        pierce: level >= 3 ? 5 : level === 2 ? 3 : 2,
        bladeLength: level >= 3 ? 54 : level === 2 ? 46 : 38,
        bladeWidth: level >= 3 ? 11 : 9,
        trailLength: level >= 3 ? 42 : 34,
      })
    }
  }

  if (level >= 3) {
    for (let i = 0; i < 6; i += 1) {
      addLightning(game, game.player.x, game.player.y, Math.random() * game.width, Math.random() * (game.height - 90), '#dbeafe')
    }
  }

  addParticle(game, game.player.x, game.player.y, '#93c5fd', level >= 3 ? 60 : 24)
  putSkillOnCooldown(game, 'e')
}

function castIceG(game) {
  if (!isSkillReady(game, 'g')) return

  const level = getSkillLevel(game, 'g')
  game.swordForm = {
    level,
    life: 5,
    maxLife: 5,
    damageTick: 0,
    trailTimer: 0,
    angle: Math.atan2(game.mouse.y - game.player.y, game.mouse.x - game.player.x),
  }
  game.mouse.down = false
  game.player.invulnerable = 5
  game.screenFlash = 0.18
  game.screenFlashKind = 'frost'
  addParticle(game, game.player.x, game.player.y, '#e0f2fe', level >= 3 ? 70 : 36)
  putSkillOnCooldown(game, 'g')
}

function castIceR(game) {
  if (!isSkillReady(game, 'r')) return

  const aim = normalize(game.mouse.x - game.player.x, game.mouse.y - game.player.y)
  const angle = Math.atan2(aim.y, aim.x)
  const side = normalize(-aim.y, aim.x)
  const level = getSkillLevel(game, 'r')
  const cloneCount = level >= 3 ? 6 : level === 2 ? 4 : 2
  const life = level >= 3 ? 7 : level === 2 ? 5.2 : 4
  const radius = level >= 3 ? 92 : level === 2 ? 66 : 50

  for (let i = 0; i < cloneCount; i += 1) {
    const spreadIndex = i - (cloneCount - 1) / 2
    const offset = spreadIndex * radius
    game.clones.push({
      x: clamp(game.player.x + side.x * offset, 30, game.width - 30),
      y: clamp(game.player.y + side.y * offset, 30, game.height - 100),
      angle: angle + (level >= 3 ? spreadIndex * 0.08 : 0),
      life,
      maxLife: life,
      attackTimer: i * 0.08,
      color: i % 2 === 0 ? '#7dd3fc' : '#e0f2fe',
      level,
      baseAngleOffset: level >= 3 ? spreadIndex * 0.04 : 0,
      damage: level >= 3 ? 58 : level === 2 ? 36 : 28,
      interval: level >= 3 ? 0.13 : level === 2 ? 0.2 : 0.26,
      pierce: level >= 3 ? 4 : level === 2 ? 2 : 1,
      shotCount: level >= 3 ? 2 : 1,
      shotSpread: level >= 3 ? 0.1 : 0,
    })
  }

  addParticle(game, game.player.x, game.player.y, '#bae6fd', level >= 3 ? 56 : 28)
  putSkillOnCooldown(game, 'r')
}

function castIceF(game) {
  if (triggerIceDetonation(game)) return
  if (!isSkillReady(game, 'f')) return

  const level = getSkillLevel(game, 'f')
  const freezeDuration = level >= 3 ? 4.6 : level === 2 ? 3.2 : 2

  game.freezeTimer = Math.max(game.freezeTimer, freezeDuration)

  for (const enemy of game.enemies) {
    enemy.frozenTimer = Math.max(enemy.frozenTimer || 0, freezeDuration)
  }

  if (level >= 3) {
    game.iceDetonationWindow = freezeDuration
  }

  putSkillOnCooldown(game, 'f')
}

function triggerIceDetonation(game) {
  const level = getSkillLevel(game, 'f')
  if (level < 3 || game.iceDetonationWindow <= 0) return false

  game.iceDetonationWindow = 0
  game.screenFlash = 0.16
  game.screenFlashKind = 'frost'

  for (const enemy of game.enemies) {
    if (enemy.frozenTimer <= 0) continue

    game.iceExplosions.push({
      x: enemy.x,
      y: enemy.y,
      radius: enemy.radius + 52,
      life: 0.45,
      maxLife: 0.45,
      color: '#e0f2fe',
    })
    damageEnemy(game, enemy, 230, '#e0f2fe')
    enemy.frozenTimer = Math.max(enemy.frozenTimer || 0, 0.45)
    addParticle(game, enemy.x, enemy.y, '#e0f2fe', 8)
  }

  return true
}

function castIceDomain(game) {
  if (!isSkillReady(game, 'qe')) return

  const level = getSkillLevel(game, 'qe')
  const fieldLife = level >= 3 ? 7 : level === 2 ? 5.2 : 3.8
  const fieldRadius = level >= 3 ? 168 : level === 2 ? 128 : 98
  const fieldDps = level >= 3 ? 58 : level === 2 ? 32 : 16

  game.zones.push({
    kind: 'frost',
    style: 'domain',
    x: game.player.x,
    y: game.player.y,
    radius: fieldRadius,
    life: fieldLife,
    maxLife: fieldLife,
    dps: fieldDps,
    freezeDuration: level >= 3 ? 0.22 : 0.12,
    slowDuration: level >= 3 ? 1.2 : 0.85,
    slowFactor: level >= 3 ? 0.18 : level === 2 ? 0.26 : 0.34,
    color: '#38bdf8',
    ringCount: level >= 3 ? 4 : 3,
    runeCount: level >= 3 ? 12 : level === 2 ? 10 : 8,
    rotationSpeed: level >= 3 ? 0.72 : level === 2 ? 0.54 : 0.38,
    phase: Math.random() * Math.PI * 2,
    runes: Array.from({ length: level >= 3 ? 12 : level === 2 ? 10 : 8 }, (_, index) => ({
      angle: (Math.PI * 2 * index) / (level >= 3 ? 12 : level === 2 ? 10 : 8),
      distance: 0.68 + (index % 2) * 0.16,
      size: level >= 3 ? 10 : level === 2 ? 8 : 7,
      spin: index % 2 === 0 ? 1 : -1,
    })),
  })

  addParticle(game, game.player.x, game.player.y, '#e0f2fe', level >= 3 ? 28 : 14)
  putSkillOnCooldown(game, 'qe')
}

function castIceUltimate(game) {
  if (!isSkillReady(game, 'space')) return

  const level = getSkillLevel(game, 'space')
  const strikeDamage = level >= 3 ? 280 : level === 2 ? 165 : 92
  const extraBolts = level >= 3 ? 48 : level === 2 ? 30 : 18

  game.screenFlash = 0.42
  game.screenFlashKind = 'lightning'

  for (const enemy of game.enemies) {
    damageEnemy(game, enemy, strikeDamage, '#e0f2fe')
    addLightning(game, enemy.x + Math.random() * 48 - 24, 8, enemy.x, enemy.y, '#e0f2fe')
    addLightning(game, enemy.x, enemy.y, game.core.x + Math.random() * 80 - 40, game.core.y - 30, '#bfdbfe')
    addParticle(game, enemy.x, enemy.y, '#e0f2fe', level >= 3 ? 24 : 12)
  }

  for (let i = 0; i < extraBolts; i += 1) {
    const x = 60 + Math.random() * (game.width - 120)
    const y = 24 + Math.random() * (game.height - 130)
    addLightning(game, x + Math.random() * 80 - 40, 6, x, y, i % 3 === 0 ? '#ffffff' : '#dbeafe')
  }

  if (level >= 3) {
    for (let i = 0; i < 10; i += 1) {
      const x = 80 + Math.random() * (game.width - 160)
      addLightning(game, game.width / 2, 4, x, 70 + Math.random() * (game.height - 180), '#bae6fd')
    }
  }

  addParticle(game, game.player.x, game.player.y, '#e0f2fe', level >= 3 ? 86 : 38)
  putSkillOnCooldown(game, 'space')
}

function castFireQ(game) {
  if (!isSkillReady(game, 'q')) return

  const aim = normalize(game.mouse.x - game.player.x, game.mouse.y - game.player.y)
  const angle = Math.atan2(aim.y, aim.x)
  const level = getSkillLevel(game, 'q')
  const fireballs = level >= 3 ? [-0.22, 0, 0.22] : level === 2 ? [-0.12, 0.12] : [0]

  for (const offsetAngle of fireballs) {
    fireProjectile(game, angle + offsetAngle, {
      kind: 'fireball',
      speed: level >= 3 ? 470 : 420,
      radius: level >= 3 ? 34 : level === 2 ? 25 : 19,
      damage: level >= 3 ? 110 : level === 2 ? 72 : 48,
      life: 1.35,
      color: level >= 3 ? '#facc15' : '#fb923c',
      splash: level >= 3 ? 138 : level === 2 ? 98 : 70,
      offset: 30,
    })
  }

  addParticle(game, game.player.x + aim.x * 30, game.player.y + aim.y * 30, '#fed7aa', level >= 3 ? 42 : 20)
  putSkillOnCooldown(game, 'q')
}

function castFireE(game) {
  if (!isSkillReady(game, 'e')) return

  const aim = normalize(game.mouse.x - game.player.x, game.mouse.y - game.player.y)
  const angle = Math.atan2(aim.y, aim.x)
  const level = getSkillLevel(game, 'e')
  const beamAngles = level >= 3 ? [-0.18, 0, 0.18] : level === 2 ? [0] : [0]

  for (const offsetAngle of beamAngles) {
    game.beams.push({
      x: game.player.x,
      y: game.player.y,
      angle: angle + offsetAngle,
      length: level >= 3 ? 900 : level === 2 ? 820 : 720,
      width: level >= 3 ? 34 : level === 2 ? 28 : 20,
      life: level >= 3 ? 1.7 : level === 2 ? 1.35 : 1,
      maxLife: level >= 3 ? 1.7 : level === 2 ? 1.35 : 1,
      dps: level >= 3 ? 105 : level === 2 ? 72 : 50,
      color: level >= 3 ? '#fde68a' : '#fb923c',
    })
  }

  addParticle(game, game.player.x, game.player.y, '#fdba74', level >= 3 ? 40 : 18)
  putSkillOnCooldown(game, 'e')
}

function castFireR(game) {
  if (!isSkillReady(game, 'r')) return

  const level = getSkillLevel(game, 'r')
  const count = level >= 3 ? 9 : level === 2 ? 5 : 3
  const orbitRadius = level >= 3 ? 96 : level === 2 ? 76 : 58
  const life = level >= 3 ? 12 : level === 2 ? 9 : 6

  for (let i = 0; i < count; i += 1) {
    game.orbitals.push({
      angle: (Math.PI * 2 * i) / count,
      orbitRadius,
      ballRadius: level >= 3 ? 18 : level === 2 ? 14 : 11,
      angularSpeed: (level >= 3 ? 3.2 : 2.4) * (i % 2 === 0 ? 1 : -1),
      life,
      maxLife: life,
      dps: level >= 3 ? 84 : level === 2 ? 56 : 34,
      color: level >= 3 ? '#facc15' : '#fb923c',
    })
  }

  addParticle(game, game.player.x, game.player.y, '#fed7aa', level >= 3 ? 64 : 24)
  putSkillOnCooldown(game, 'r')
}

function castFireUltimate(game) {
  if (!isSkillReady(game, 'space')) return

  const level = getSkillLevel(game, 'space')
  const aim = normalize(game.mouse.x - game.player.x, game.mouse.y - game.player.y)
  const angle = Math.atan2(aim.y, aim.x)

  game.charges.push({
    x: game.player.x,
    y: game.player.y,
    angle,
    level,
    timer: 1,
    maxTimer: 1,
    radius: level >= 3 ? 82 : level === 2 ? 64 : 52,
    damage: level >= 3 ? 360 : level === 2 ? 240 : 160,
    splash: level >= 3 ? 260 : level === 2 ? 190 : 145,
    speed: level >= 3 ? 360 : 420,
    color: level >= 3 ? '#facc15' : '#fb923c',
  })

  addParticle(game, game.player.x, game.player.y, '#fed7aa', level >= 3 ? 70 : 32)
  putSkillOnCooldown(game, 'space')
}

function castSkill(game, key = 'e') {
  if (game.role.id === 'bing') {
    if (key === 'q') castIceQ(game)
    if (key === 'e') castIceE(game)
    if (key === 'g') castIceG(game)
    if (key === 'r') castIceR(game)
    if (key === 'f') castIceF(game)
    if (key === 'qe') castIceDomain(game)
    if (key === 'space') castIceUltimate(game)
  }

  if (game.role.id === 'huo') {
    if (key === 'q') castFireQ(game)
    if (key === 'e') castFireE(game)
    if (key === 'r') castFireR(game)
    if (key === 'space') castFireUltimate(game)
  }
}

function damageEnemy(game, enemy, damage, color) {
  if (enemy.hp <= 0) return false

  enemy.hp -= damage
  addParticle(game, enemy.x, enemy.y, color, 3)

  if (enemy.hp <= 0) {
    game.kills += 1
    game.score += enemy.score
    addParticle(game, enemy.x, enemy.y, enemy.color, 12)
    return true
  }

  return false
}

function updateGame(game, dt) {
  if (game.paused) return

  game.time += dt
  game.attackCd = Math.max(0, game.attackCd - dt)
  game.skillCd = Math.max(0, game.skillCd - dt)
  game.freezeTimer = Math.max(0, game.freezeTimer - dt)
  game.iceDetonationWindow = Math.max(0, game.iceDetonationWindow - dt)
  game.screenFlash = Math.max(0, game.screenFlash - dt)
  for (const key of Object.keys(game.skillCds)) {
    game.skillCds[key] = Math.max(0, game.skillCds[key] - dt)
  }

  if (game.swordForm) {
    game.swordForm.life -= dt
    game.swordForm.damageTick -= dt
    game.swordForm.trailTimer -= dt
    game.swordForm.angle = Math.atan2(game.mouse.y - game.player.y, game.mouse.x - game.player.x)
    game.player.invulnerable = Math.max(game.player.invulnerable, 0.12)
  }

  const movement = { x: 0, y: 0 }
  if (game.keys.has('w') || game.keys.has('arrowup')) movement.y -= 1
  if (game.keys.has('s') || game.keys.has('arrowdown')) movement.y += 1
  if (game.keys.has('a') || game.keys.has('arrowleft')) movement.x -= 1
  if (game.keys.has('d') || game.keys.has('arrowright')) movement.x += 1

  const direction = normalize(movement.x, movement.y)
  if (movement.x !== 0 || movement.y !== 0) {
    const speedBoost = game.swordForm ? (game.swordForm.level >= 3 ? 1.95 : game.swordForm.level === 2 ? 1.7 : 1.48) : 1
    game.player.x += direction.x * game.role.speed * speedBoost * dt
    game.player.y += direction.y * game.role.speed * speedBoost * dt
  }

  game.player.x = clamp(game.player.x, 28, game.width - 28)
  game.player.y = clamp(game.player.y, 28, game.height - 28)
  game.player.invulnerable = Math.max(0, game.player.invulnerable - dt)

  if (game.mouse.down && !game.swordForm) {
    normalAttack(game)
  }

  if (game.swordForm) {
    const level = game.swordForm.level
    const swordRadius = level >= 3 ? 36 : level === 2 ? 31 : 27
    const swordDamage = (level >= 3 ? 205 : level === 2 ? 145 : 95) * dt

    for (const enemy of game.enemies) {
      if (distance(game.player, enemy) < swordRadius + enemy.radius) {
        damageEnemy(game, enemy, swordDamage, '#e0f2fe')
        enemy.frozenTimer = Math.max(enemy.frozenTimer || 0, level >= 3 ? 0.16 : 0.09)
        enemy.slowTimer = Math.max(enemy.slowTimer || 0, 0.9)
        enemy.slowFactor = 0.25
      }
    }

    if (game.swordForm.trailTimer <= 0) {
      const trailLength = level >= 3 ? 140 : 92
      const angle = game.swordForm.angle
      game.swordUnitySlashes.push({
        x1: game.player.x - Math.cos(angle) * trailLength * 0.58,
        y1: game.player.y - Math.sin(angle) * trailLength * 0.58,
        x2: game.player.x + Math.cos(angle) * trailLength * 0.42,
        y2: game.player.y + Math.sin(angle) * trailLength * 0.42,
        angle,
        width: level >= 3 ? 34 : 24,
        life: level >= 3 ? 0.32 : 0.24,
        maxLife: level >= 3 ? 0.32 : 0.24,
        level,
        color: level >= 3 ? '#f8fafc' : '#bfdbfe',
      })
      game.swordForm.trailTimer = level >= 3 ? 0.06 : 0.09
    }

    if (Math.random() < 0.36) {
      addParticle(game, game.player.x, game.player.y, '#e0f2fe', level >= 3 ? 2 : 1)
    }

    if (game.swordForm.life <= 0) {
      addParticle(game, game.player.x, game.player.y, '#bfdbfe', level >= 3 ? 48 : 26)
      game.swordForm = null
      game.player.invulnerable = Math.max(game.player.invulnerable, 0.28)
    }
  }

  game.spawnTimer -= dt
  if (game.spawnTimer <= 0) {
    game.enemies.push(createEnemy(game))
    const interval = Math.max(0.68, 1.9 - game.time * 0.01)
    game.spawnTimer = interval * (0.75 + Math.random() * 0.5)
  }

  for (const projectile of game.projectiles) {
    projectile.x += projectile.vx * dt
    projectile.y += projectile.vy * dt
    projectile.life -= dt
  }

  for (const spell of game.enemySpells) {
    spell.x += spell.vx * dt
    spell.y += spell.vy * dt
    spell.life -= dt
  }

  for (const clone of game.clones) {
    clone.life -= dt
    clone.attackTimer -= dt
    if (clone.attackTimer <= 0) {
      const aim = normalize(game.mouse.x - clone.x, game.mouse.y - clone.y)
      const baseAngle = Math.atan2(aim.y, aim.x) + (clone.baseAngleOffset || 0)
      const shotCount = clone.shotCount || 1

      for (let shot = 0; shot < shotCount; shot += 1) {
        const shotOffset = shotCount === 1 ? 0 : (shot - (shotCount - 1) / 2) * clone.shotSpread
        fireProjectile(game, baseAngle + shotOffset, {
          source: clone,
          speed: clone.level >= 3 ? 760 : 690,
          radius: clone.level >= 3 ? 8 : 6,
          damage: clone.damage,
          life: clone.level >= 3 ? 1.05 : 0.9,
          color: clone.color,
          pierce: clone.pierce,
          slowDuration: clone.level >= 3 ? 1.5 : clone.level === 2 ? 1.1 : 0.7,
          slowFactor: clone.level >= 3 ? 0.34 : 0.46,
        })
      }

      addParticle(game, clone.x, clone.y, clone.color, clone.level >= 3 ? 3 : 2)
      clone.attackTimer = clone.interval
    }
  }

  for (const beam of game.beams) {
    beam.life -= dt
    const start = { x: beam.x, y: beam.y }
    const end = {
      x: beam.x + Math.cos(beam.angle) * beam.length,
      y: beam.y + Math.sin(beam.angle) * beam.length,
    }

    for (const enemy of game.enemies) {
      if (distanceToSegment(enemy, start, end) < beam.width + enemy.radius) {
        damageEnemy(game, enemy, beam.dps * dt, beam.color)
        if (Math.random() < 0.18) {
          addParticle(game, enemy.x, enemy.y, '#fed7aa', 2)
        }
      }
    }
  }

  for (const orbital of game.orbitals) {
    orbital.life -= dt
    orbital.angle += orbital.angularSpeed * dt
    orbital.x = game.player.x + Math.cos(orbital.angle) * orbital.orbitRadius
    orbital.y = game.player.y + Math.sin(orbital.angle) * orbital.orbitRadius

    for (const enemy of game.enemies) {
      if (distance(orbital, enemy) < orbital.ballRadius + enemy.radius) {
        damageEnemy(game, enemy, orbital.dps * dt, orbital.color)
      }
    }
  }

  for (const charge of game.charges) {
    charge.x = game.player.x
    charge.y = game.player.y
    charge.timer -= dt

    if (charge.timer <= 0 && !charge.released) {
      charge.released = true
      fireProjectile(game, charge.angle, {
        kind: 'ultimateFireball',
        source: charge,
        speed: charge.speed,
        radius: charge.radius,
        damage: charge.damage,
        life: 2.6,
        color: charge.color,
        splash: charge.splash,
        offset: 48,
      })
      addParticle(game, charge.x + Math.cos(charge.angle) * 60, charge.y + Math.sin(charge.angle) * 60, '#fed7aa', charge.level >= 3 ? 110 : 55)
    }
  }

  for (const zone of game.zones) {
    zone.life -= dt
    for (const enemy of game.enemies) {
      if (distance(zone, enemy) < zone.radius + enemy.radius) {
        damageEnemy(game, enemy, zone.dps * dt, zone.color)
        if (zone.freezeDuration) {
          enemy.frozenTimer = Math.max(enemy.frozenTimer || 0, zone.freezeDuration)
        }
        if (zone.slowDuration) {
          enemy.slowTimer = Math.max(enemy.slowTimer || 0, zone.slowDuration)
          enemy.slowFactor = zone.slowFactor || enemy.slowFactor
        }
      }
    }
  }

  for (const jet of game.magmaJets) {
    jet.life -= dt
    jet.pulse += dt * 8
    for (const enemy of game.enemies) {
      if (distance(jet, enemy) < jet.radius + enemy.radius) {
        damageEnemy(game, enemy, jet.dps * dt, jet.color)
        if (Math.random() < 0.2) {
          addParticle(game, enemy.x, enemy.y, '#fdba74', 2)
        }
      }
    }
  }

  for (const enemy of game.enemies) {
    enemy.contactCd = Math.max(0, enemy.contactCd - dt)
    enemy.spellCd = Math.max(0, enemy.spellCd - dt)
    enemy.slowTimer = Math.max(0, enemy.slowTimer - dt)
    enemy.frozenTimer = Math.max(0, enemy.frozenTimer - dt)

    const toCore = normalize(game.core.x - enemy.x, game.core.y - enemy.y)
    const stateFactor = enemy.frozenTimer > 0 ? 0 : enemy.slowTimer > 0 ? enemy.slowFactor : 1
    enemy.x += toCore.x * enemy.speed * stateFactor * dt
    enemy.y += toCore.y * enemy.speed * stateFactor * dt

    if (stateFactor > 0 && enemy.spellCd <= 0 && distance(enemy, game.player) < 500) {
      castEnemySpell(game, enemy)
      enemy.spellCd = Math.max(2.75, 5.2 - game.time * 0.007) + Math.random() * 1.8
    }

    if (stateFactor > 0 && distance(enemy, game.core) < enemy.radius + game.core.radius) {
      game.core.hp -= enemy.damage * dt
      enemy.x -= toCore.x * enemy.speed * dt * 1.8
      enemy.y -= toCore.y * enemy.speed * dt * 1.8
    }

    if (stateFactor > 0 && distance(enemy, game.player) < enemy.radius + game.player.radius && enemy.contactCd <= 0) {
      game.player.hp -= enemy.damage * game.role.damageTaken
      game.player.invulnerable = 0.18
      enemy.contactCd = 0.7
      addParticle(game, game.player.x, game.player.y, '#fca5a5', 8)
    }
  }

  for (const projectile of game.projectiles) {
    for (const enemy of game.enemies) {
      if (projectile.life <= 0 || enemy.hp <= 0) continue

      if (distance(projectile, enemy) < projectile.radius + enemy.radius) {
        if (projectile.kind === 'crescent') {
          if (projectile.hitEnemies.has(enemy)) continue

          projectile.hitEnemies.add(enemy)
          enemy.slowTimer = Math.max(enemy.slowTimer || 0, projectile.slowDuration)
          enemy.slowFactor = projectile.slowFactor
          enemy.frozenTimer = Math.max(enemy.frozenTimer || 0, projectile.freezeDuration)
          damageEnemy(game, enemy, projectile.damage, projectile.color)
          addParticle(game, enemy.x, enemy.y, '#bae6fd', 8)
        } else if (projectile.splash > 0) {
          for (const splashEnemy of game.enemies) {
            if (distance(enemy, splashEnemy) < projectile.splash + splashEnemy.radius) {
              damageEnemy(game, splashEnemy, projectile.damage, projectile.color)
            }
          }
          addParticle(game, enemy.x, enemy.y, '#fed7aa', 16)
          projectile.life = 0
        } else {
          if (projectile.slowDuration > 0) {
            enemy.slowTimer = Math.max(enemy.slowTimer || 0, projectile.slowDuration)
            enemy.slowFactor = projectile.slowFactor
          }
          if (projectile.freezeDuration > 0) {
            enemy.frozenTimer = Math.max(enemy.frozenTimer || 0, projectile.freezeDuration)
          }
          const defeated = damageEnemy(game, enemy, projectile.damage, projectile.color)
          projectile.pierce -= 1
          if (defeated || projectile.pierce < 0) {
            projectile.life = 0
          }
        }
      }
    }
  }

  for (const spell of game.enemySpells) {
    if (spell.life <= 0) continue

    if (!game.swordForm && distance(spell, game.player) < spell.radius + game.player.radius) {
      game.player.hp -= spell.damage * game.role.damageTaken
      game.player.invulnerable = 0.32
      spell.life = 0
      addParticle(game, game.player.x, game.player.y, spell.color, 10)
      continue
    }

    if (distance(spell, game.core) < spell.radius + game.core.radius) {
      game.core.hp -= spell.damage * 0.48
      spell.life = 0
      addParticle(game, game.core.x, game.core.y, spell.color, 10)
    }
  }

  game.enemies = game.enemies.filter(enemy => enemy.hp > 0)
  game.projectiles = game.projectiles.filter(projectile => projectile.life > 0)
  game.enemySpells = game.enemySpells.filter(spell => spell.life > 0)
  game.zones = game.zones.filter(zone => zone.life > 0)
  game.clones = game.clones.filter(clone => clone.life > 0)
  game.beams = game.beams.filter(beam => beam.life > 0)
  game.orbitals = game.orbitals.filter(orbital => orbital.life > 0)
  game.magmaJets = game.magmaJets.filter(jet => jet.life > 0)
  game.charges = game.charges.filter(charge => !charge.released)
  game.swordAuras = (game.swordAuras || []).filter(aura => {
    aura.life -= dt
    return aura.life > 0
  })
  game.swordUnitySlashes = (game.swordUnitySlashes || []).filter(slash => {
    slash.life -= dt
    return slash.life > 0
  })
  game.lightnings = game.lightnings.filter(lightning => {
    lightning.life -= dt
    return lightning.life > 0
  })
  game.iceExplosions = game.iceExplosions.filter(explosion => {
    explosion.life -= dt
    return explosion.life > 0
  })

  for (const particle of game.particles) {
    particle.x += particle.vx * dt
    particle.y += particle.vy * dt
    particle.life -= dt
  }
  game.particles = game.particles.filter(particle => particle.life > 0)

  game.score += dt * 2
  refreshUpgradePoints(game)

  if (game.core.hp <= 0 || game.player.hp <= 0) {
    game.core.hp = Math.max(0, game.core.hp)
    game.player.hp = Math.max(0, game.player.hp)
    game.phase = 'gameover'
  }
}

function drawBar(ctx, x, y, width, height, ratio, color, label) {
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)'
  ctx.fillRect(x, y, width, height)
  ctx.fillStyle = color
  ctx.fillRect(x, y, width * clamp(ratio, 0, 1), height)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)'
  ctx.strokeRect(x, y, width, height)
  ctx.fillStyle = '#f8fafc'
  ctx.font = '12px sans-serif'
  ctx.fillText(label, x + 8, y + height - 6)
}

function drawLightning(ctx, lightning) {
  const alpha = clamp(lightning.life / lightning.maxLife, 0, 1)
  const segments = 6
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = lightning.color
  ctx.lineWidth = 3
  ctx.shadowBlur = 18
  ctx.shadowColor = lightning.color
  ctx.beginPath()
  ctx.moveTo(lightning.x1, lightning.y1)
  for (let i = 1; i < segments; i += 1) {
    const t = i / segments
    const x = lightning.x1 + (lightning.x2 - lightning.x1) * t + (Math.random() - 0.5) * 28
    const y = lightning.y1 + (lightning.y2 - lightning.y1) * t
    ctx.lineTo(x, y)
  }
  ctx.lineTo(lightning.x2, lightning.y2)
  ctx.stroke()
  ctx.restore()
}

function drawSwordAura(ctx, aura, time) {
  const alpha = clamp(aura.life / aura.maxLife, 0, 1)
  const progress = 1 - alpha
  const radius = aura.radius * (0.72 + progress * 0.3)
  const rotation = time * (aura.level >= 3 ? 1.35 : 0.9) + aura.phase
  const visibleBlades = aura.level >= 3 ? 14 : aura.level === 2 ? 10 : 8

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.shadowBlur = 22
  ctx.shadowColor = '#bfdbfe'
  ctx.strokeStyle = `rgba(219, 234, 254, ${0.72 * alpha})`
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(aura.x, aura.y, radius, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = `rgba(125, 211, 252, ${0.42 * alpha})`
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(aura.x, aura.y, radius * 0.58, 0, Math.PI * 2)
  ctx.stroke()

  for (let i = 0; i < visibleBlades; i += 1) {
    const angle = rotation + (Math.PI * 2 * i) / visibleBlades
    const x = aura.x + Math.cos(angle) * radius * 0.84
    const y = aura.y + Math.sin(angle) * radius * 0.84
    const bladeLength = aura.level >= 3 ? 28 : 22
    const bladeWidth = aura.level >= 3 ? 6 : 5

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle + Math.PI / 2)
    ctx.fillStyle = `rgba(224, 242, 254, ${0.88 * alpha})`
    ctx.strokeStyle = `rgba(14, 165, 233, ${0.72 * alpha})`
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(0, -bladeLength)
    ctx.lineTo(bladeWidth, bladeLength * 0.25)
    ctx.lineTo(0, bladeLength * 0.46)
    ctx.lineTo(-bladeWidth, bladeLength * 0.25)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  for (let i = 0; i < 4; i += 1) {
    const angle = -rotation * 0.65 + (Math.PI * 2 * i) / 4
    ctx.strokeStyle = `rgba(240, 249, 255, ${0.42 * alpha})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(aura.x + Math.cos(angle) * radius * 0.2, aura.y + Math.sin(angle) * radius * 0.2)
    ctx.lineTo(aura.x + Math.cos(angle) * radius * 0.96, aura.y + Math.sin(angle) * radius * 0.96)
    ctx.stroke()
  }

  ctx.restore()
}

function drawSwordProjectile(ctx, projectile) {
  const alpha = clamp(projectile.life / projectile.maxLife, 0, 1)
  const length = projectile.bladeLength || 42
  const width = projectile.bladeWidth || 9
  const trail = projectile.trailLength || 34

  ctx.save()
  ctx.translate(projectile.x, projectile.y)
  ctx.rotate(projectile.angle)
  ctx.globalAlpha = 0.58 + alpha * 0.36
  ctx.shadowBlur = 18
  ctx.shadowColor = projectile.color

  const trailGradient = ctx.createLinearGradient(-trail, 0, length * 0.25, 0)
  trailGradient.addColorStop(0, 'rgba(186, 230, 253, 0)')
  trailGradient.addColorStop(1, `rgba(186, 230, 253, ${0.38 * alpha})`)
  ctx.fillStyle = trailGradient
  ctx.beginPath()
  ctx.moveTo(-trail, -width * 0.46)
  ctx.lineTo(length * 0.18, -width * 0.3)
  ctx.lineTo(length * 0.18, width * 0.3)
  ctx.lineTo(-trail, width * 0.46)
  ctx.closePath()
  ctx.fill()

  const bladeGradient = ctx.createLinearGradient(-length * 0.32, 0, length * 0.58, 0)
  bladeGradient.addColorStop(0, '#60a5fa')
  bladeGradient.addColorStop(0.46, '#e0f2fe')
  bladeGradient.addColorStop(1, '#f8fafc')

  ctx.fillStyle = bladeGradient
  ctx.strokeStyle = '#bfdbfe'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(length * 0.58, 0)
  ctx.lineTo(-length * 0.18, width)
  ctx.lineTo(-length * 0.34, width * 0.28)
  ctx.lineTo(-length * 0.34, -width * 0.28)
  ctx.lineTo(-length * 0.18, -width)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.28)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(-length * 0.24, 0)
  ctx.lineTo(length * 0.44, 0)
  ctx.stroke()

  ctx.fillStyle = '#38bdf8'
  ctx.fillRect(-length * 0.34, -width * 1.18, 4, width * 2.36)
  ctx.restore()
}

function drawSwordUnitySlash(ctx, slash) {
  const alpha = clamp(slash.life / slash.maxLife, 0, 1)
  const progress = 1 - alpha
  const width = slash.width * (0.62 + progress * 0.72)
  const dx = slash.x2 - slash.x1
  const dy = slash.y2 - slash.y1
  const length = Math.hypot(dx, dy)

  ctx.save()
  ctx.translate(slash.x1, slash.y1)
  ctx.rotate(slash.angle)
  ctx.globalAlpha = alpha
  ctx.shadowBlur = slash.level >= 3 ? 34 : 24
  ctx.shadowColor = '#e0f2fe'

  const gradient = ctx.createLinearGradient(0, 0, length, 0)
  gradient.addColorStop(0, 'rgba(125, 211, 252, 0)')
  gradient.addColorStop(0.18, `rgba(224, 242, 254, ${0.58 * alpha})`)
  gradient.addColorStop(0.5, `rgba(248, 250, 252, ${0.95 * alpha})`)
  gradient.addColorStop(0.82, `rgba(125, 211, 252, ${0.5 * alpha})`)
  gradient.addColorStop(1, 'rgba(125, 211, 252, 0)')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.moveTo(0, -width * 0.32)
  ctx.lineTo(length * 0.92, -width * 0.58)
  ctx.lineTo(length, 0)
  ctx.lineTo(length * 0.92, width * 0.58)
  ctx.lineTo(0, width * 0.32)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = `rgba(240, 249, 255, ${0.9 * alpha})`
  ctx.lineWidth = Math.max(2, width * 0.12)
  ctx.beginPath()
  ctx.moveTo(length * 0.08, 0)
  ctx.lineTo(length * 0.98, 0)
  ctx.stroke()

  for (let i = 0; i < 5; i += 1) {
    const t = (i + 1) / 6
    ctx.strokeStyle = `rgba(186, 230, 253, ${0.34 * alpha})`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(length * t, -width * 0.72)
    ctx.lineTo(length * (t + 0.08), width * 0.66)
    ctx.stroke()
  }

  ctx.restore()
}

function drawFrostDomain(ctx, zone, time) {
  const alpha = clamp(zone.life / zone.maxLife, 0, 1)
  const age = zone.maxLife - zone.life
  const birth = clamp(age / 0.55, 0, 1)
  const pulse = 1 + Math.sin(time * 4.2 + zone.phase) * 0.045
  const rotation = time * zone.rotationSpeed + zone.phase
  const radius = zone.radius * pulse
  const gradient = ctx.createRadialGradient(zone.x, zone.y, radius * 0.12, zone.x, zone.y, radius)

  gradient.addColorStop(0, `rgba(240, 249, 255, ${0.2 * alpha})`)
  gradient.addColorStop(0.42, `rgba(125, 211, 252, ${0.2 * alpha})`)
  gradient.addColorStop(1, `rgba(14, 165, 233, ${0.04 * alpha})`)

  ctx.save()
  ctx.globalAlpha = 0.95
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(zone.x, zone.y, radius, 0, Math.PI * 2)
  ctx.fill()

  if (birth < 1) {
    ctx.strokeStyle = `rgba(240, 249, 255, ${(1 - birth) * 0.78})`
    ctx.lineWidth = 6 - birth * 3
    ctx.shadowBlur = 28
    ctx.shadowColor = '#e0f2fe'
    ctx.beginPath()
    ctx.arc(zone.x, zone.y, radius * (0.18 + birth * 0.95), 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.shadowBlur = 18
  ctx.shadowColor = '#bae6fd'
  ctx.strokeStyle = `rgba(224, 242, 254, ${0.58 * alpha})`
  ctx.lineWidth = 2.5
  for (let ring = 1; ring <= zone.ringCount; ring += 1) {
    const ringRadius = (radius * ring) / zone.ringCount
    ctx.beginPath()
    ctx.arc(zone.x, zone.y, ringRadius, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.strokeStyle = `rgba(240, 249, 255, ${0.74 * alpha})`
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  for (let i = 0; i < 5; i += 1) {
    const start = rotation * (i % 2 === 0 ? 1 : -1) + (Math.PI * 2 * i) / 5
    const end = start + Math.PI * (0.18 + (i % 2) * 0.08)
    ctx.beginPath()
    ctx.arc(zone.x, zone.y, radius * (0.58 + (i % 3) * 0.11), start, end)
    ctx.stroke()
  }
  ctx.lineCap = 'butt'

  const spokeCount = zone.runeCount
  ctx.strokeStyle = `rgba(186, 230, 253, ${0.45 * alpha})`
  ctx.lineWidth = 1.6
  for (let i = 0; i < spokeCount; i += 1) {
    const angle = rotation + (Math.PI * 2 * i) / spokeCount
    const inner = radius * 0.22
    const outer = radius * 0.88
    ctx.beginPath()
    ctx.moveTo(zone.x + Math.cos(angle) * inner, zone.y + Math.sin(angle) * inner)
    ctx.lineTo(zone.x + Math.cos(angle) * outer, zone.y + Math.sin(angle) * outer)
    ctx.stroke()
  }

  ctx.strokeStyle = `rgba(224, 242, 254, ${0.52 * alpha})`
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i < 6; i += 1) {
    const angle = -rotation * 0.7 + (Math.PI * 2 * i) / 6
    const x = zone.x + Math.cos(angle) * radius * 0.42
    const y = zone.y + Math.sin(angle) * radius * 0.42
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.stroke()
  ctx.beginPath()
  for (let i = 0; i < 6; i += 1) {
    const angle = rotation * 0.85 + Math.PI / 6 + (Math.PI * 2 * i) / 6
    const x = zone.x + Math.cos(angle) * radius * 0.28
    const y = zone.y + Math.sin(angle) * radius * 0.28
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.stroke()

  for (let i = 0; i < 10; i += 1) {
    const angle = rotation * 1.35 + (Math.PI * 2 * i) / 10
    const inner = radius * 0.9
    const outer = radius * (1.02 + Math.sin(time * 5 + i) * 0.03)
    ctx.strokeStyle = `rgba(224, 242, 254, ${0.34 * alpha})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(zone.x + Math.cos(angle) * inner, zone.y + Math.sin(angle) * inner)
    ctx.lineTo(zone.x + Math.cos(angle) * outer, zone.y + Math.sin(angle) * outer)
    ctx.stroke()
  }

  ctx.fillStyle = `rgba(240, 249, 255, ${0.85 * alpha})`
  ctx.strokeStyle = `rgba(14, 165, 233, ${0.75 * alpha})`
  for (const rune of zone.runes) {
    const angle = rotation * rune.spin + rune.angle
    const x = zone.x + Math.cos(angle) * radius * rune.distance
    const y = zone.y + Math.sin(angle) * radius * rune.distance
    const size = rune.size * alpha

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle + Math.PI / 4)
    ctx.beginPath()
    ctx.moveTo(0, -size)
    ctx.lineTo(size * 0.5, 0)
    ctx.lineTo(0, size)
    ctx.lineTo(-size * 0.5, 0)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  for (let i = 0; i < 7; i += 1) {
    const orbit = (time * 0.9 + i * 1.7 + zone.phase) % (Math.PI * 2)
    const sparkleRadius = radius * (0.32 + (i % 3) * 0.18)
    const sparkleAlpha = (0.32 + Math.sin(time * 4.6 + i) * 0.18) * alpha
    ctx.fillStyle = `rgba(240, 249, 255, ${sparkleAlpha})`
    ctx.beginPath()
    ctx.arc(
      zone.x + Math.cos(orbit) * sparkleRadius,
      zone.y + Math.sin(orbit) * sparkleRadius,
      2 + (i % 2),
      0,
      Math.PI * 2,
    )
    ctx.fill()
  }

  ctx.shadowBlur = 24
  ctx.fillStyle = `rgba(224, 242, 254, ${0.9 * alpha})`
  ctx.beginPath()
  ctx.arc(zone.x, zone.y, Math.max(7, radius * 0.08), 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawIceExplosion(ctx, explosion) {
  const alpha = clamp(explosion.life / explosion.maxLife, 0, 1)
  const progress = 1 - alpha
  const radius = explosion.radius * (0.55 + progress * 0.55)

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.shadowBlur = 20
  ctx.shadowColor = explosion.color
  ctx.strokeStyle = explosion.color
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = `rgba(186, 230, 253, ${0.75 * alpha})`
  ctx.lineWidth = 2
  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI * 2 * i) / 10 + progress * 0.4
    const inner = radius * 0.28
    const outer = radius * (0.88 + (i % 2) * 0.08)
    ctx.beginPath()
    ctx.moveTo(explosion.x + Math.cos(angle) * inner, explosion.y + Math.sin(angle) * inner)
    ctx.lineTo(explosion.x + Math.cos(angle) * outer, explosion.y + Math.sin(angle) * outer)
    ctx.stroke()
  }

  ctx.fillStyle = `rgba(224, 242, 254, ${0.16 * alpha})`
  ctx.beginPath()
  ctx.arc(explosion.x, explosion.y, radius * 0.58, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawGame(ctx, game) {
  ctx.clearRect(0, 0, game.width, game.height)

  const bg = ctx.createLinearGradient(0, 0, game.width, game.height)
  bg.addColorStop(0, '#0f172a')
  bg.addColorStop(0.55, '#134e4a')
  bg.addColorStop(1, '#312e81')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, game.width, game.height)

  ctx.strokeStyle = 'rgba(226, 232, 240, 0.08)'
  ctx.lineWidth = 1
  for (let x = 40; x < game.width; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, game.height)
    ctx.stroke()
  }
  for (let y = 40; y < game.height; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(game.width, y)
    ctx.stroke()
  }

  if (game.screenFlash > 0) {
    const alpha = clamp(game.screenFlash / 0.55, 0, 1)
    ctx.fillStyle = game.screenFlashKind === 'lightning'
      ? `rgba(224, 242, 254, ${0.18 * alpha})`
      : `rgba(125, 211, 252, ${0.16 * alpha})`
    ctx.fillRect(0, 0, game.width, game.height)
  }

  for (const aura of game.swordAuras || []) {
    drawSwordAura(ctx, aura, game.time)
  }

  for (const slash of game.swordUnitySlashes || []) {
    drawSwordUnitySlash(ctx, slash)
  }

  for (const zone of game.zones) {
    const alpha = clamp(zone.life / zone.maxLife, 0, 1)
    const isFrostZone = zone.kind === 'frost'

    if (zone.style === 'domain') {
      drawFrostDomain(ctx, zone, game.time)
      continue
    }

    ctx.fillStyle = isFrostZone
      ? `rgba(125, 211, 252, ${0.13 + alpha * 0.15})`
      : `rgba(249, 115, 22, ${0.18 + alpha * 0.16})`
    ctx.beginPath()
    ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = isFrostZone ? `rgba(224, 242, 254, ${0.55 + alpha * 0.25})` : `rgba(253, 186, 116, ${0.55 + alpha * 0.2})`
    ctx.lineWidth = 2
    ctx.stroke()
    if (isFrostZone) {
      ctx.strokeStyle = `rgba(186, 230, 253, ${0.38 + alpha * 0.22})`
      for (let i = 0; i < 6; i += 1) {
        const angle = (Math.PI * 2 * i) / 6 + game.time * 0.22
        ctx.beginPath()
        ctx.moveTo(zone.x, zone.y)
        ctx.lineTo(zone.x + Math.cos(angle) * zone.radius * 0.86, zone.y + Math.sin(angle) * zone.radius * 0.86)
        ctx.stroke()
      }
    }
  }

  for (const jet of game.magmaJets) {
    const alpha = clamp(jet.life / jet.maxLife, 0, 1)
    const pulse = 1 + Math.sin(jet.pulse) * 0.16
    ctx.save()
    ctx.globalAlpha = 0.28 + alpha * 0.32
    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.arc(jet.x, jet.y, jet.radius * pulse, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 0.72
    ctx.strokeStyle = jet.color
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(jet.x, jet.y, jet.radius * 0.58 * pulse, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = '#fed7aa'
    ctx.beginPath()
    ctx.arc(jet.x, jet.y, Math.max(8, jet.radius * 0.18 * pulse), 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  for (const charge of game.charges) {
    const progress = clamp(1 - charge.timer / charge.maxTimer, 0, 1)
    const aimX = charge.x + Math.cos(charge.angle) * (44 + progress * 18)
    const aimY = charge.y + Math.sin(charge.angle) * (44 + progress * 18)
    ctx.save()
    ctx.globalAlpha = 0.68 + progress * 0.25
    ctx.shadowBlur = 24 + progress * 22
    ctx.shadowColor = charge.color
    ctx.strokeStyle = charge.color
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(charge.x, charge.y, 26 + progress * 30, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = charge.color
    ctx.beginPath()
    ctx.arc(aimX, aimY, 12 + progress * (charge.radius * 0.45), 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fef3c7'
    ctx.beginPath()
    ctx.arc(aimX - 4, aimY - 4, 5 + progress * 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const corePulse = 1 + Math.sin(game.time * 4) * 0.08
  ctx.fillStyle = 'rgba(45, 212, 191, 0.18)'
  ctx.beginPath()
  ctx.arc(game.core.x, game.core.y, game.core.radius * 2.1 * corePulse, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ccfbf1'
  ctx.beginPath()
  ctx.arc(game.core.x, game.core.y, game.core.radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#14b8a6'
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.fillStyle = '#0f766e'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('灵脉', game.core.x, game.core.y + 1)
  ctx.font = 'bold 10px sans-serif'
  ctx.fillText('Vein', game.core.x, game.core.y + 14)

  for (const lightning of game.lightnings) {
    drawLightning(ctx, lightning)
  }

  for (const explosion of game.iceExplosions) {
    drawIceExplosion(ctx, explosion)
  }

  for (const beam of game.beams) {
    const alpha = clamp(beam.life / beam.maxLife, 0, 1)
    const endX = beam.x + Math.cos(beam.angle) * beam.length
    const endY = beam.y + Math.sin(beam.angle) * beam.length
    ctx.save()
    ctx.globalAlpha = 0.45 + alpha * 0.35
    ctx.strokeStyle = beam.color
    ctx.lineWidth = beam.width * 2
    ctx.shadowBlur = 22
    ctx.shadowColor = beam.color
    ctx.beginPath()
    ctx.moveTo(beam.x, beam.y)
    ctx.lineTo(endX, endY)
    ctx.stroke()
    ctx.strokeStyle = '#fef3c7'
    ctx.lineWidth = Math.max(beam.width * 0.55, 6)
    ctx.beginPath()
    ctx.moveTo(beam.x, beam.y)
    ctx.lineTo(endX, endY)
    ctx.stroke()
    ctx.restore()
  }

  for (const projectile of game.projectiles) {
    if (projectile.kind === 'crescent') {
      const alpha = clamp(projectile.life / projectile.maxLife, 0, 1)
      ctx.save()
      ctx.translate(projectile.x, projectile.y)
      ctx.rotate(projectile.angle)
      ctx.globalAlpha = 0.55 + alpha * 0.35
      ctx.strokeStyle = projectile.color
      ctx.lineWidth = 16
      ctx.shadowBlur = 18
      ctx.shadowColor = projectile.color
      ctx.beginPath()
      ctx.arc(0, 0, projectile.radius, -0.92, 0.92)
      ctx.stroke()
      ctx.lineWidth = 4
      ctx.strokeStyle = '#e0f2fe'
      ctx.beginPath()
      ctx.arc(0, 0, projectile.radius + 10, -0.78, 0.78)
      ctx.stroke()
      ctx.restore()
    } else if (projectile.kind === 'sword') {
      drawSwordProjectile(ctx, projectile)
    } else if (projectile.kind === 'fireball' || projectile.kind === 'ultimateFireball') {
      const alpha = clamp(projectile.life / projectile.maxLife, 0, 1)
      ctx.save()
      ctx.globalAlpha = 0.65 + alpha * 0.28
      ctx.shadowBlur = projectile.kind === 'ultimateFireball' ? 34 : 18
      ctx.shadowColor = projectile.color
      ctx.fillStyle = projectile.color
      ctx.beginPath()
      ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2)
      ctx.fill()
      if (projectile.kind === 'ultimateFireball') {
        ctx.strokeStyle = '#fef3c7'
        ctx.lineWidth = 7
        ctx.beginPath()
        ctx.arc(projectile.x, projectile.y, projectile.radius + 12, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.fillStyle = '#fef3c7'
      ctx.beginPath()
      ctx.arc(projectile.x - projectile.radius * 0.22, projectile.y - projectile.radius * 0.22, projectile.radius * 0.35, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    } else {
      ctx.fillStyle = projectile.color
      ctx.beginPath()
      ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  for (const spell of game.enemySpells) {
    const alpha = clamp(spell.life / spell.maxLife, 0, 1)
    ctx.save()
    ctx.globalAlpha = 0.62 + alpha * 0.28
    ctx.shadowBlur = spell.target === 'player' ? 18 : 24
    ctx.shadowColor = spell.color
    ctx.fillStyle = spell.color
    ctx.beginPath()
    ctx.arc(spell.x, spell.y, spell.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(spell.x, spell.y, spell.radius + 4, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  for (const enemy of game.enemies) {
    ctx.fillStyle = enemy.color
    ctx.beginPath()
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)'
    ctx.lineWidth = 2
    ctx.stroke()
    if (enemy.frozenTimer > 0) {
      ctx.save()
      ctx.globalAlpha = 0.82
      ctx.shadowBlur = 15
      ctx.shadowColor = '#bae6fd'
      ctx.fillStyle = 'rgba(224, 242, 254, 0.2)'
      ctx.strokeStyle = '#e0f2fe'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(enemy.x, enemy.y - enemy.radius - 13)
      ctx.lineTo(enemy.x + enemy.radius + 12, enemy.y - enemy.radius * 0.2)
      ctx.lineTo(enemy.x + enemy.radius + 8, enemy.y + enemy.radius + 10)
      ctx.lineTo(enemy.x, enemy.y + enemy.radius + 15)
      ctx.lineTo(enemy.x - enemy.radius - 8, enemy.y + enemy.radius + 10)
      ctx.lineTo(enemy.x - enemy.radius - 12, enemy.y - enemy.radius * 0.2)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.strokeStyle = 'rgba(240, 249, 255, 0.75)'
      ctx.lineWidth = 1.5
      for (let i = 0; i < 3; i += 1) {
        const angle = (Math.PI * 2 * i) / 3 + game.time * 0.35
        ctx.beginPath()
        ctx.moveTo(enemy.x, enemy.y)
        ctx.lineTo(enemy.x + Math.cos(angle) * (enemy.radius + 12), enemy.y + Math.sin(angle) * (enemy.radius + 12))
        ctx.stroke()
      }
      ctx.restore()
    } else if (enemy.slowTimer > 0) {
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.85)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(enemy.x, enemy.y, enemy.radius + 5, 0, Math.PI * 2)
      ctx.stroke()
    }
    drawBar(ctx, enemy.x - 18, enemy.y - enemy.radius - 13, 36, 5, enemy.hp / enemy.maxHp, '#f87171', '')
  }

  for (const clone of game.clones) {
    const alpha = clamp(clone.life / clone.maxLife, 0, 1)
    ctx.globalAlpha = 0.4 + alpha * 0.35
    ctx.fillStyle = clone.color
    ctx.beginPath()
    ctx.arc(clone.x, clone.y, game.player.radius * 0.92, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#e0f2fe'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  for (const orbital of game.orbitals) {
    const alpha = clamp(orbital.life / orbital.maxLife, 0, 1)
    ctx.save()
    ctx.globalAlpha = 0.62 + alpha * 0.28
    ctx.shadowBlur = 16
    ctx.shadowColor = orbital.color
    ctx.fillStyle = orbital.color
    ctx.beginPath()
    ctx.arc(orbital.x, orbital.y, orbital.ballRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fef3c7'
    ctx.beginPath()
    ctx.arc(orbital.x, orbital.y, orbital.ballRadius * 0.38, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  if (game.swordForm) {
    const angle = game.swordForm.angle
    const level = game.swordForm.level
    const swordLength = level >= 3 ? 86 : level === 2 ? 74 : 64
    const swordWidth = level >= 3 ? 18 : 15

    ctx.save()
    ctx.translate(game.player.x, game.player.y)
    ctx.rotate(angle)
    ctx.shadowBlur = level >= 3 ? 32 : 24
    ctx.shadowColor = '#e0f2fe'
    ctx.fillStyle = '#e0f2fe'
    ctx.strokeStyle = '#f8fafc'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(swordLength * 0.58, 0)
    ctx.lineTo(-swordLength * 0.24, swordWidth)
    ctx.lineTo(-swordLength * 0.42, swordWidth * 0.28)
    ctx.lineTo(-swordLength * 0.42, -swordWidth * 0.28)
    ctx.lineTo(-swordLength * 0.24, -swordWidth)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(-swordLength * 0.46, -swordWidth * 1.25, 7, swordWidth * 2.5)
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.5)'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(-swordLength * 0.78, 0)
    ctx.lineTo(-swordLength * 0.35, 0)
    ctx.stroke()
    ctx.restore()
  } else {
    const playerAlpha = game.player.invulnerable > 0 ? 0.55 : 1
    ctx.globalAlpha = playerAlpha
    ctx.fillStyle = game.role.color
    ctx.beginPath()
    ctx.arc(game.player.x, game.player.y, game.player.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = game.role.accent
    ctx.lineWidth = 4
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  const aim = normalize(game.mouse.x - game.player.x, game.mouse.y - game.player.y)
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.5)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(game.player.x, game.player.y)
  ctx.lineTo(game.player.x + aim.x * 32, game.player.y + aim.y * 32)
  ctx.stroke()

  for (const particle of game.particles) {
    const alpha = clamp(particle.life / particle.maxLife, 0, 1)
    ctx.globalAlpha = alpha
    ctx.fillStyle = particle.color
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  ctx.textAlign = 'left'
  drawBar(ctx, 22, 20, 225, 22, game.core.hp / game.core.maxHp, '#2dd4bf', `灵脉 Vein ${Math.ceil(game.core.hp)}/${game.core.maxHp}`)
  drawBar(ctx, 22, 50, 225, 22, game.player.hp / game.player.maxHp, '#60a5fa', `角色 Hero ${Math.ceil(game.player.hp)}/${game.player.maxHp}`)

  const panelSkillKeys = getRoleSkillKeys(game.role)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)'
  ctx.fillRect(game.width - 286, 18, 264, game.role.skills ? 108 + panelSkillKeys.length * 16 : 102)
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 15px sans-serif'
  ctx.fillText(`${game.role.name} / ${game.role.nameEn}`, game.width - 270, 40)
  ctx.font = '12px sans-serif'
  ctx.fillText(`${game.role.attack} / ${game.role.attackEn}`, game.width - 270, 58)
  ctx.font = '13px sans-serif'
  ctx.fillText(`分数 Score ${Math.floor(game.score)}`, game.width - 270, 80)
  ctx.fillText(`击破 Kills ${game.kills}`, game.width - 270, 100)

  if (game.role.skills) {
    const skillLines = panelSkillKeys.map(key => [
      getKeyLabel(SKILL_DETAILS[game.role.id][key], true),
      game.role.skills[key].name,
      game.skillCds[key],
      getSkillLevel(game, key),
    ])
    skillLines.forEach(([key, name, cooldown, level], index) => {
      ctx.fillStyle = cooldown <= 0 ? '#bbf7d0' : '#fed7aa'
      const readyText = game.role.id === 'bing' && name === '玄冰封界' && game.iceDetonationWindow > 0
        ? 'F Burst'
        : cooldown <= 0 ? 'Ready' : `${cooldown.toFixed(1)}s`
      ctx.fillText(`${key} ${name} T${level}: ${readyText}`, game.width - 270, 124 + index * 16)
    })
  } else {
    const skillReady = game.skillCd <= 0
    ctx.fillStyle = skillReady ? '#bbf7d0' : '#fed7aa'
    ctx.fillText(skillReady ? `${game.role.skill} / Ready` : `${game.role.skill}: ${game.skillCd.toFixed(1)}s`, game.width - 270, 124)
  }

  if (game.paused) {
    ctx.save()
    ctx.fillStyle = 'rgba(15, 23, 42, 0.58)'
    ctx.fillRect(0, 0, game.width, game.height)
    ctx.fillStyle = '#f8fafc'
    ctx.textAlign = 'center'
    ctx.font = 'bold 34px sans-serif'
    ctx.fillText('已暂停 / Paused', game.width / 2, game.height / 2 - 14)
    ctx.font = '18px sans-serif'
    ctx.fillText('按 P 继续守护灵脉 / Press P to Resume', game.width / 2, game.height / 2 + 24)
    ctx.restore()
  }
}

function getPointerPosition(event, canvas) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) / rect.width) * GAME_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * GAME_HEIGHT,
  }
}

export default function SpiritVeinGame() {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const [phase, setPhase] = useState('select')
  const [selectedRole, setSelectedRole] = useState(null)
  const [stats, setStats] = useState(INITIAL_STATS)
  const [assistantQuestion, setAssistantQuestion] = useState('')
  const [assistantAnswer, setAssistantAnswer] = useState(ASSISTANT_IDLE_TEXT)
  const [assistantStatus, setAssistantStatus] = useState(ASSISTANT_API_IDLE_TEXT)
  const [assistantBusy, setAssistantBusy] = useState(false)
  const [assistantEndpoint, setAssistantEndpoint] = useState(getStoredAssistantEndpoint)

  const currentRole = selectedRole ? ROLES[selectedRole] : null
  const assistantQuestions = currentRole?.id === 'huo' ? FIRE_ASSISTANT_QUESTIONS : ICE_ASSISTANT_QUESTIONS

  function startGame(roleId) {
    const role = ROLES[roleId]
    const game = createGame(role)
    gameRef.current = game
    setSelectedRole(roleId)
    setStats(buildStats(game))
    setAssistantQuestion('')
    setAssistantAnswer(ASSISTANT_IDLE_TEXT)
    setAssistantStatus(assistantEndpoint ? 'DeepSeek API：已配置代理地址 / Proxy configured' : ASSISTANT_API_IDLE_TEXT)
    setPhase('playing')
  }

  function returnToSelect() {
    gameRef.current = null
    setPhase('select')
    setSelectedRole(null)
    setStats(INITIAL_STATS)
    setAssistantQuestion('')
    setAssistantAnswer(ASSISTANT_IDLE_TEXT)
    setAssistantStatus(assistantEndpoint ? 'DeepSeek API：已配置代理地址 / Proxy configured' : ASSISTANT_API_IDLE_TEXT)
  }

  function restartGame() {
    if (selectedRole) {
      startGame(selectedRole)
    }
  }

  async function askAssistant(question) {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || !currentRole || assistantBusy) return

    setAssistantQuestion(trimmedQuestion)
    setAssistantBusy(true)
    setAssistantStatus('DeepSeek API：请求中 / Requesting...')

    try {
      const answer = await requestDeepSeekAssistant(assistantEndpoint, trimmedQuestion, currentRole, stats)
      setAssistantAnswer(answer)
      setAssistantStatus('DeepSeek API：真实接口已返回 / Real API response received')
    } catch (error) {
      setAssistantAnswer(answerSkillQuestion(trimmedQuestion, currentRole, stats))
      setAssistantStatus(`${error.message}，已使用本地兜底回答 / Using local fallback`)
    } finally {
      setAssistantBusy(false)
    }
  }

  function submitAssistantQuestion(event) {
    event.preventDefault()
    askAssistant(assistantQuestion)
  }

  function updateAssistantEndpoint(endpoint) {
    setAssistantEndpoint(endpoint)
    saveAssistantEndpoint(endpoint)
    setAssistantStatus(endpoint.trim() ? 'DeepSeek API：已配置代理地址 / Proxy configured' : ASSISTANT_API_IDLE_TEXT)
  }

  function syncStatsFromGame() {
    if (gameRef.current) {
      setStats(buildStats(gameRef.current))
    }
  }

  function upgradeSkill(key) {
    const game = gameRef.current
    if (!game || !game.role.skills) return

    refreshUpgradePoints(game)
    if (game.upgradePoints <= 0 || getSkillLevel(game, key) >= 3) return

    game.skillLevels[key] += 1
    refreshUpgradePoints(game)
    addParticle(game, game.player.x, game.player.y, game.role.id === 'huo' ? '#fed7aa' : '#e0f2fe', 24)
    syncStatsFromGame()
  }

  function updatePointer(event) {
    const game = gameRef.current
    const canvas = canvasRef.current
    if (!game || !canvas) return

    const point = getPointerPosition(event, canvas)
    game.mouse.x = point.x
    game.mouse.y = point.y
  }

  function handlePointerDown(event) {
    event.currentTarget.focus()
    updatePointer(event)
    const game = gameRef.current
    if (!game || phase !== 'playing') return
    if (game.paused) return
    if (game.swordForm) {
      game.mouse.down = false
      return
    }

    if (event.button === 2) {
      castSkill(game, 'e')
      return
    }

    game.mouse.down = true
    normalAttack(game)
  }

  function handlePointerUp() {
    const game = gameRef.current
    if (game) {
      game.mouse.down = false
    }
  }

  useEffect(() => {
    if (phase !== 'playing') return undefined

    const canvas = canvasRef.current
    const game = gameRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !game || !ctx) return undefined

    let animationFrame = 0
    let lastFrame = 0

    function handleKeyDown(event) {
      if (isTextEntryTarget(event.target)) return

      const key = event.key.toLowerCase()
      const controlledKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'q', 'e', 'g', 'r', 'f', 'p']
      if (controlledKeys.includes(key)) {
        event.preventDefault()
      }
      if (key === 'p') {
        game.paused = !game.paused
        game.mouse.down = false
        game.keys.clear()
        setStats(buildStats(game))
        return
      }
      game.keys.add(key)
      if (game.paused) return
      if (game.swordForm && ['q', 'e', 'g', 'r', 'f', ' '].includes(key)) return
      if (event.repeat && ['q', 'e', 'g', 'r', 'f', ' '].includes(key)) return
      if (game.role.id === 'bing' && (key === 'q' || key === 'e') && game.keys.has('q') && game.keys.has('e')) {
        castSkill(game, 'qe')
        return
      }
      if (key === 'q') {
        castSkill(game, 'q')
      }
      if (key === 'e') {
        castSkill(game, 'e')
      }
      if (key === 'g') {
        castSkill(game, 'g')
      }
      if (key === 'r') {
        castSkill(game, 'r')
      }
      if (key === 'f') {
        castSkill(game, 'f')
      }
      if (key === ' ') {
        castSkill(game, 'space')
      }
    }

    function handleKeyUp(event) {
      if (isTextEntryTarget(event.target)) return
      game.keys.delete(event.key.toLowerCase())
    }

    function loop(now) {
      const dt = lastFrame === 0 ? 0 : Math.min(0.033, (now - lastFrame) / 1000)
      lastFrame = now

      updateGame(game, dt)
      drawGame(ctx, game)

      if (!game.paused) {
        game.uiTimer -= dt
      }
      if (game.uiTimer <= 0 || game.phase === 'gameover') {
        setStats(buildStats(game))
        game.uiTimer = 0.12
      }

      if (game.phase === 'gameover') {
        setPhase('gameover')
        return
      }

      animationFrame = requestAnimationFrame(loop)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    animationFrame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [phase])

  return (
    <section className="game-shell">
      <div className="game-heading">
        <div>
          <p className="game-kicker">Assignment 4 · Option A</p>
          <h2>守护灵脉 / Spirit Vein Defense</h2>
          <p>
            <span>选择冰修或火修，守住地图底部的宗门灵脉，击退妖兽、心魔、魔修与天劫残影。</span>
            <span>Choose an ice or fire cultivator, defend the spirit vein at the bottom of the map, and defeat each incoming wave.</span>
          </p>
        </div>
        <div className="game-score-card">
          <span>分数 / Score</span>
          <strong>{stats.score}</strong>
        </div>
      </div>

      {phase === 'select' && (
        <div className="character-select">
          {Object.values(ROLES).map(role => (
            <button className="role-card" key={role.id} onClick={() => startGame(role.id)}>
              <span className="role-mark" style={{ background: role.color }} />
              <span className="role-name">{role.name} / {role.nameEn}</span>
              <span className="role-title">{role.title} / {role.titleEn}</span>
              <span className="role-desc">
                <span>{role.trait}</span>
                <span>{role.traitEn}</span>
              </span>
              <span className="role-skill">
                {role.skills ? getRoleSkillText(role) : `仙术 / Spell：${role.skill} / ${role.skillEn}`}
              </span>
            </button>
          ))}
        </div>
      )}

      {phase !== 'select' && currentRole && (
        <>
          <div className="game-toolbar">
            <div>
              <span>角色 / Role</span>
              <strong>{currentRole.name} / {currentRole.nameEn}</strong>
            </div>
            <div>
              <span>灵脉 / Vein</span>
              <strong>{stats.coreHp}</strong>
            </div>
            <div>
              <span>生命 / HP</span>
              <strong>{stats.playerHp}</strong>
            </div>
            <div>
              <span>击破 / Kills</span>
              <strong>{stats.kills}</strong>
            </div>
            <div>
              <span>时间 / Time</span>
              <strong>{stats.time}s</strong>
            </div>
            <div>
              <span>状态 / State</span>
              <strong>{stats.paused ? bilingualText('暂停中', 'Paused') : bilingualText('战斗中', 'Fighting')}</strong>
            </div>
            <div>
              <span>{currentRole.skills ? bilingualText('大招', 'Ultimate') : bilingualText('仙术', 'Spell')}</span>
              <strong>
                {currentRole.skills
                  ? getReadyText(stats.skillCds.space)
                  : getReadyText(stats.skillCd)}
              </strong>
            </div>
          </div>

          {currentRole.skills && (
            <>
              <div className="upgrade-summary">
                <strong>升阶点 / Upgrade Points {stats.upgradePoints}</strong>
                <span>每 200 分获得 1 点 / 1 point per 200 score；下一个 / Next：{stats.nextUpgradeScore}</span>
              </div>
              <div className="skill-strip">
                {getRoleSkillKeys(currentRole).map(key => {
                  const detail = SKILL_DETAILS[currentRole.id][key]
                  const level = stats.skillLevels[key] || 1
                  const cooldown = stats.skillCds[key] || 0
                  const detonationReady = currentRole.id === 'bing' && key === 'f' && stats.iceDetonationWindow > 0
                  const tierText = getTierDisplayText(detail, level, currentRole.id === 'bing' && key === 'f' && level < 3)
                  const canUpgrade = stats.upgradePoints > 0 && level < 3

                  return (
                    <div className={`skill-card ${currentRole.id}-skill tier-${level}`} key={key}>
                      <div>
                        <strong>{getKeyLabel(detail)} {getSkillDisplayName(currentRole, key)}</strong>
                        <span>{level} 阶 / Tier {level} · {tierText}</span>
                      </div>
                      <em>{detonationReady ? bilingualText('二段待发', 'Detonate Ready') : getReadyText(cooldown)}</em>
                      <button type="button" disabled={!canUpgrade} onClick={() => upgradeSkill(key)}>
                        {level >= 3 ? bilingualText('满阶', 'Max') : bilingualText('升阶', 'Upgrade')}
                      </button>
                    </div>
                  )
                })}
              </div>
              <div className="assistant-panel">
                <div className="assistant-copy">
                  <span>器灵助手 / Spirit Assistant</span>
                  <strong>问技能 / Ask Skills</strong>
                  <p>{assistantAnswer}</p>
                  <small>{assistantStatus}</small>
                </div>
                <form className="assistant-form" onSubmit={submitAssistantQuestion}>
                  <input
                    value={assistantQuestion}
                    onChange={event => setAssistantQuestion(event.target.value)}
                    placeholder="随便问 / Ask anything: 被围住怎么办？ Which skill first? How does E work?"
                    aria-label="向器灵助手询问技能 / Ask the spirit assistant"
                  />
                  <button type="submit" disabled={assistantBusy}>
                    {assistantBusy ? bilingualText('请求中', 'Asking') : bilingualText('询问', 'Ask')}
                  </button>
                </form>
                <details className="assistant-api-settings">
                  <summary>DeepSeek API</summary>
                  <input
                    value={assistantEndpoint}
                    onChange={event => updateAssistantEndpoint(event.target.value)}
                    placeholder="代理地址 / Proxy endpoint, e.g. https://your-site.vercel.app/api/deepseek-skill-agent"
                    aria-label="DeepSeek代理地址 / DeepSeek proxy endpoint"
                  />
                </details>
                <div className="assistant-quick">
                  {assistantQuestions.map(question => (
                    <button type="button" key={question} disabled={assistantBusy} onClick={() => askAssistant(question)}>
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="canvas-wrap">
            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              tabIndex={0}
              aria-label="守护灵脉游戏战场 / Spirit Vein Defense battlefield"
              onPointerMove={updatePointer}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onContextMenu={event => event.preventDefault()}
            />

            {phase === 'gameover' && (
              <div className="game-over-panel">
                <p>灵脉失守 / Spirit Vein Lost</p>
                <h3>最终分数 / Final Score {stats.score}</h3>
                <div className="game-over-actions">
                  <button onClick={restartGame}>再战一局 / Retry</button>
                  <button onClick={returnToSelect}>重选角色 / Reselect</button>
                </div>
              </div>
            )}
          </div>

          <div className="control-strip">
            <span>WASD / 方向键移动 / Arrow Keys Move</span>
            <span>鼠标左键施放普攻 / Left Click Basic Attack</span>
            <span>
              {currentRole.id === 'bing'
                ? '冰修 / Ice：Q 冰波 Frost Wave · E 剑阵 Sword Array · G 人剑合一 Sword Unity · Q+E 冰场 Domain · R 分身 Clones · F 冰封 Freeze · 空格 Thunder'
                : '火修 / Fire：Q 大火球 Fireball · E 光束 Beam · R 环绕火球 Orbitals · 空格 Charged Fireball'}
            </span>
            <span>P 暂停 / 继续 / Pause / Resume</span>
            <span>鼠标右键释放 E 技能 / Right Click Cast E</span>
          </div>

          <div className="enemy-strip" aria-label="敌人类型 / Enemy types">
            {ENEMY_TYPES.map(enemy => (
              <span key={enemy.name}>
                <i style={{ background: enemy.color }} />
                {enemy.name} / {enemy.nameEn}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
