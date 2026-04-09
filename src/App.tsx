import { FormEvent, useEffect, useState } from 'react'

type Participant = {
  champion: string
  nickname: string
  kills: number
  deaths: number
  assists: number
  cs: number
  items: string[]
}

type ObjectiveStats = {
  totalKills: number
  gold: number
  towers: number
  inhibitors: number
  dragons: number
  barons: number
  heralds: number
  voidgrubs: number
}

type Match = {
  id: string
  champion: string
  result: '승리' | '패배'
  position: string
  kills: number
  deaths: number
  assists: number
  queue: string
  playedAt: string
  duration: string
  level: number
  cs: number
  csPerMinute: number
  killParticipation: string
  items: string[]
  objectives: {
    blue: ObjectiveStats
    red: ObjectiveStats
  }
  teams: {
    blue: Participant[]
    red: Participant[]
  }
}

type ChampionStat = {
  champion: string
  games: number
  wins: number
  losses: number
  kills: number
  deaths: number
  assists: number
  cs: number
  csPerMinute: number
}

type RecentPositionStat = {
  position: string
  games: number
  wins: number
}

const recentMatchSeeds: Match[] = [
  {
    id: 'match-001',
    champion: '아리',
    result: '승리',
    position: 'MID',
    kills: 11,
    deaths: 2,
    assists: 9,
    queue: '솔로 랭크',
    playedAt: '12분 전',
    duration: '29분 14초',
    level: 16,
    cs: 232,
    csPerMinute: 7.9,
    killParticipation: '63%',
    items: ['루덴', '그불', '존야', '라바돈', '마관신', '와드'],
    objectives: {
      blue: { totalKills: 30, gold: 65200, towers: 10, inhibitors: 2, dragons: 3, barons: 1, heralds: 1, voidgrubs: 4 },
      red: { totalKills: 16, gold: 54100, towers: 4, inhibitors: 0, dragons: 1, barons: 0, heralds: 0, voidgrubs: 2 },
    },
    teams: {
      blue: [
        { champion: '아리', nickname: 'Hide on bush', kills: 11, deaths: 2, assists: 9, cs: 232, items: ['루덴', '그불', '존야'] },
        { champion: '잭스', nickname: 'Zeus Carry', kills: 5, deaths: 3, assists: 8, cs: 208, items: ['트포', '쇼진', '스테락'] },
        { champion: '리 신', nickname: 'Oner Path', kills: 4, deaths: 4, assists: 14, cs: 168, items: ['월식', '블클', '수호천사'] },
        { champion: '카이사', nickname: 'Gumayusi', kills: 9, deaths: 1, assists: 7, cs: 245, items: ['구인수', '내셔', '존야'] },
        { champion: '렐', nickname: 'Keria God', kills: 1, deaths: 5, assists: 19, cs: 38, items: ['솔라리', '기사맹세', '와드'] },
      ],
      red: [
        { champion: '오리아나', nickname: 'Guardian', kills: 4, deaths: 5, assists: 8, cs: 224, items: ['대천사', '리안드리', '존야'] },
        { champion: '그웬', nickname: 'Gwen King', kills: 3, deaths: 6, assists: 5, cs: 198, items: ['균열', '내셔', '라바돈'] },
        { champion: '바이', nickname: 'Vai Main', kills: 2, deaths: 7, assists: 11, cs: 151, items: ['월식', '블클', '스테락'] },
        { champion: '진', nickname: 'Jhin Four', kills: 7, deaths: 4, assists: 6, cs: 229, items: ['무대', '고연포', '징수'] },
        { champion: '노틸러스', nickname: 'Naut Hook', kills: 0, deaths: 8, assists: 13, cs: 41, items: ['솔라리', '가시갑옷', '와드'] },
      ],
    },
  },
  {
    id: 'match-002',
    champion: '오리아나',
    result: '패배',
    position: 'MID',
    kills: 4,
    deaths: 5,
    assists: 7,
    queue: '솔로 랭크',
    playedAt: '38분 전',
    duration: '31분 02초',
    level: 15,
    cs: 251,
    csPerMinute: 8.1,
    killParticipation: '52%',
    items: ['대천사', '리안드리', '존야', '마관신', '방출봉', '와드'],
    objectives: {
      blue: { totalKills: 17, gold: 58400, towers: 3, inhibitors: 0, dragons: 1, barons: 0, heralds: 0, voidgrubs: 1 },
      red: { totalKills: 29, gold: 68100, towers: 9, inhibitors: 1, dragons: 3, barons: 1, heralds: 1, voidgrubs: 5 },
    },
    teams: {
      blue: [
        { champion: '오리아나', nickname: 'Guardian', kills: 4, deaths: 5, assists: 7, cs: 251, items: ['대천사', '리안드리', '존야'] },
        { champion: '크산테', nickname: 'Top Shelter', kills: 2, deaths: 6, assists: 8, cs: 181, items: ['얼건', '해신작쇼', '가고일'] },
        { champion: '녹턴', nickname: 'Night Hunt', kills: 5, deaths: 5, assists: 6, cs: 166, items: ['발분', '블클', '스테락'] },
        { champion: '이즈리얼', nickname: 'Ezreal Pro', kills: 6, deaths: 4, assists: 4, cs: 236, items: ['무라마나', '트포', '세릴다'] },
        { champion: '브라움', nickname: 'Braum Shield', kills: 0, deaths: 7, assists: 12, cs: 37, items: ['솔라리', '기사맹세', '와드'] },
      ],
      red: [
        { champion: '아칼리', nickname: 'Akali Star', kills: 10, deaths: 3, assists: 8, cs: 229, items: ['균열', '존야', '라바돈'] },
        { champion: '레넥톤', nickname: 'Renek Boss', kills: 6, deaths: 2, assists: 11, cs: 214, items: ['블클', '스테락', '쇼진'] },
        { champion: '릴리아', nickname: 'Lillia Dream', kills: 4, deaths: 4, assists: 15, cs: 187, items: ['리안드리', '악포', '존야'] },
        { champion: '자야', nickname: 'Feather Xayah', kills: 8, deaths: 3, assists: 9, cs: 261, items: ['정수', '나보리', '도미닉'] },
        { champion: '라칸', nickname: 'Rakan Dash', kills: 1, deaths: 4, assists: 20, cs: 42, items: ['슈렐', '구원', '와드'] },
      ],
    },
  },
  {
    id: 'match-003',
    champion: '아지르',
    result: '승리',
    position: 'MID',
    kills: 8,
    deaths: 1,
    assists: 6,
    queue: '자유 랭크',
    playedAt: '1시간 전',
    duration: '24분 48초',
    level: 15,
    cs: 214,
    csPerMinute: 8.6,
    killParticipation: '58%',
    items: ['내셔', '리안드리', '그불', '마관신', '초시계', '와드'],
    objectives: {
      blue: { totalKills: 25, gold: 60300, towers: 8, inhibitors: 1, dragons: 2, barons: 1, heralds: 1, voidgrubs: 3 },
      red: { totalKills: 14, gold: 49200, towers: 2, inhibitors: 0, dragons: 1, barons: 0, heralds: 0, voidgrubs: 3 },
    },
    teams: {
      blue: [
        { champion: '아지르', nickname: 'Emperor Mid', kills: 8, deaths: 1, assists: 6, cs: 214, items: ['내셔', '리안드리', '그불'] },
        { champion: '나르', nickname: 'Mega Gnar', kills: 4, deaths: 2, assists: 9, cs: 201, items: ['발분', '블클', '스테락'] },
        { champion: '세주아니', nickname: 'Seju Call', kills: 2, deaths: 3, assists: 13, cs: 149, items: ['해신작쇼', '가시갑옷', '워모그'] },
        { champion: '징크스', nickname: 'Rocket Girl', kills: 10, deaths: 2, assists: 5, cs: 238, items: ['크라켄', '루난', '무대'] },
        { champion: '쓰레쉬', nickname: 'Thresh Lantern', kills: 1, deaths: 4, assists: 18, cs: 34, items: ['강철솔라리', '지크', '와드'] },
      ],
      red: [
        { champion: '빅토르', nickname: 'Machine Herald', kills: 3, deaths: 5, assists: 4, cs: 205, items: ['루덴', '그불', '존야'] },
        { champion: '럼블', nickname: 'Rumble Heat', kills: 5, deaths: 6, assists: 3, cs: 187, items: ['리안드리', '마관신', '그불'] },
        { champion: '오공', nickname: 'Monkey Spin', kills: 2, deaths: 7, assists: 7, cs: 141, items: ['신파자', '블클', '수호천사'] },
        { champion: '애쉬', nickname: 'Frost Arrow', kills: 4, deaths: 5, assists: 8, cs: 216, items: ['크라켄', '구인수', '루난'] },
        { champion: '밀리오', nickname: 'Milio Warm', kills: 0, deaths: 4, assists: 12, cs: 29, items: ['월석', '향로', '와드'] },
      ],
    },
  },
  {
    id: 'match-004',
    champion: '탈리야',
    result: '승리',
    position: 'JUNGLE',
    kills: 6,
    deaths: 3,
    assists: 12,
    queue: '일반',
    playedAt: '2시간 전',
    duration: '27분 36초',
    level: 14,
    cs: 184,
    csPerMinute: 6.7,
    killParticipation: '69%',
    items: ['리안드리', '라일라이', '존야', '마관신', '망각구', '와드'],
    objectives: {
      blue: { totalKills: 23, gold: 61900, towers: 7, inhibitors: 1, dragons: 3, barons: 0, heralds: 0, voidgrubs: 4 },
      red: { totalKills: 17, gold: 54800, towers: 3, inhibitors: 0, dragons: 1, barons: 0, heralds: 1, voidgrubs: 2 },
    },
    teams: {
      blue: [
        { champion: '탈리야', nickname: 'Stone Weaver', kills: 6, deaths: 3, assists: 12, cs: 184, items: ['리안드리', '라일라이', '존야'] },
        { champion: '요네', nickname: 'Wind Blade', kills: 7, deaths: 4, assists: 5, cs: 222, items: ['몰왕', '철갑궁', '무대'] },
        { champion: '말파이트', nickname: 'Mountain Tank', kills: 2, deaths: 5, assists: 14, cs: 176, items: ['얼건', '가시갑옷', '대자연'] },
        { champion: '루시안', nickname: 'Light Shot', kills: 8, deaths: 2, assists: 8, cs: 231, items: ['정수', '나보리', '고연포'] },
        { champion: '나미', nickname: 'Wave Caller', kills: 0, deaths: 4, assists: 21, cs: 32, items: ['제국', '흐물지', '와드'] },
      ],
      red: [
        { champion: '엘리스', nickname: 'Spider Queen', kills: 5, deaths: 6, assists: 7, cs: 137, items: ['밤수', '그불', '존야'] },
        { champion: '제드', nickname: 'Shadow Zed', kills: 6, deaths: 7, assists: 3, cs: 204, items: ['드락사르', '세릴다', '밤끝'] },
        { champion: '문도', nickname: 'Mundo Goes', kills: 2, deaths: 4, assists: 9, cs: 194, items: ['강심', '태불방', '워모그'] },
        { champion: '시비르', nickname: 'Spell Shield', kills: 4, deaths: 5, assists: 8, cs: 224, items: ['크라켄', '나보리', '도미닉'] },
        { champion: '유미', nickname: 'Book Cat', kills: 0, deaths: 6, assists: 13, cs: 12, items: ['월석', '향로', '와드'] },
      ],
    },
  },
  {
    id: 'match-005',
    champion: '사일러스',
    result: '패배',
    position: 'MID',
    kills: 3,
    deaths: 7,
    assists: 4,
    queue: '솔로 랭크',
    playedAt: '3시간 전',
    duration: '22분 19초',
    level: 12,
    cs: 146,
    csPerMinute: 6.5,
    killParticipation: '41%',
    items: ['만년서리', '존야', '마관신', '방출봉', '암흑의 인장', '와드'],
    objectives: {
      blue: { totalKills: 19, gold: 47200, towers: 2, inhibitors: 0, dragons: 0, barons: 0, heralds: 0, voidgrubs: 1 },
      red: { totalKills: 35, gold: 63700, towers: 9, inhibitors: 2, dragons: 4, barons: 1, heralds: 1, voidgrubs: 5 },
    },
    teams: {
      blue: [
        { champion: '사일러스', nickname: 'Chain Stealer', kills: 3, deaths: 7, assists: 4, cs: 146, items: ['만년서리', '존야', '마관신'] },
        { champion: '피오라', nickname: 'Grand Duelist', kills: 4, deaths: 6, assists: 2, cs: 198, items: ['굶드라', '신파자', '죽무'] },
        { champion: '킨드레드', nickname: 'Wolf Lamb', kills: 5, deaths: 5, assists: 5, cs: 154, items: ['크라켄', '징수', '도미닉'] },
        { champion: '아펠리오스', nickname: 'Moon Gun', kills: 6, deaths: 4, assists: 3, cs: 218, items: ['폭갈', '무대', '피바'] },
        { champion: '룰루', nickname: 'Purple Pix', kills: 1, deaths: 8, assists: 10, cs: 29, items: ['슈렐', '향로', '와드'] },
      ],
      red: [
        { champion: '신드라', nickname: 'Dark Sphere', kills: 8, deaths: 3, assists: 9, cs: 214, items: ['루덴', '그불', '라바돈'] },
        { champion: '잭스', nickname: 'Lamp Master', kills: 7, deaths: 4, assists: 8, cs: 211, items: ['트포', '쇼진', '스테락'] },
        { champion: '카직스', nickname: 'Void Jump', kills: 9, deaths: 2, assists: 6, cs: 169, items: ['요우무', '세릴다', '밤끝'] },
        { champion: '드레이븐', nickname: 'Axe Catcher', kills: 10, deaths: 4, assists: 4, cs: 237, items: ['피바', '징수', '무대'] },
        { champion: '레오나', nickname: 'Solar Flare', kills: 1, deaths: 5, assists: 18, cs: 36, items: ['솔라리', '가시갑옷', '와드'] },
      ],
    },
  },
]

const servers = ['KR', 'NA', 'EUW', 'EUNE', 'JP', 'OCE'] as const
const extraChampionStats: ChampionStat[] = [
  { champion: '크산테', games: 18, wins: 11, losses: 7, kills: 72, deaths: 61, assists: 124, cs: 3492, csPerMinute: 132.4 },
  { champion: '암베사', games: 14, wins: 8, losses: 6, kills: 83, deaths: 57, assists: 91, cs: 2716, csPerMinute: 112 },
  { champion: '그웬', games: 12, wins: 7, losses: 5, kills: 69, deaths: 44, assists: 58, cs: 2498, csPerMinute: 103.7 },
  { champion: '요릭', games: 10, wins: 4, losses: 6, kills: 42, deaths: 46, assists: 37, cs: 2410, csPerMinute: 88.8 },
  { champion: '럼블', games: 9, wins: 5, losses: 4, kills: 51, deaths: 43, assists: 73, cs: 1786, csPerMinute: 71.1 },
  { champion: '제이스', games: 8, wins: 3, losses: 5, kills: 46, deaths: 39, assists: 42, cs: 1688, csPerMinute: 67.2 },
  { champion: '나르', games: 7, wins: 4, losses: 3, kills: 31, deaths: 28, assists: 55, cs: 1428, csPerMinute: 55.8 },
  { champion: '레넥톤', games: 6, wins: 2, losses: 4, kills: 27, deaths: 32, assists: 29, cs: 1194, csPerMinute: 45.9 },
  { champion: '잭스', games: 5, wins: 3, losses: 2, kills: 34, deaths: 25, assists: 31, cs: 1017, csPerMinute: 39.9 },
  { champion: '카밀', games: 4, wins: 1, losses: 3, kills: 19, deaths: 24, assists: 21, cs: 782, csPerMinute: 30.5 },
]
const recentMatchPlayedAtLabels = [
  '12분 전',
  '38분 전',
  '1시간 전',
  '2시간 전',
  '3시간 전',
  '4시간 전',
  '5시간 전',
  '6시간 전',
  '7시간 전',
  '8시간 전',
  '9시간 전',
  '10시간 전',
  '11시간 전',
  '12시간 전',
  '13시간 전',
  '14시간 전',
  '15시간 전',
  '16시간 전',
  '17시간 전',
  '18시간 전',
] as const
const graphObjectiveRows: { key: keyof ObjectiveStats; label: string; format?: (value: number) => string }[] = [
  { key: 'totalKills', label: 'Total Kill' },
  { key: 'gold', label: 'Gold', format: (value) => `${(value / 1000).toFixed(1)}k` },
]
const sideObjectiveRows: { key: keyof ObjectiveStats; label: string; icon: string }[] = [
  { key: 'towers', label: '타워 파괴', icon: 'T' },
  { key: 'inhibitors', label: '억제기 파괴', icon: 'I' },
  { key: 'dragons', label: '드래곤 처치', icon: 'D' },
  { key: 'barons', label: '바론 처치', icon: 'B' },
  { key: 'heralds', label: '협곡의 전령', icon: 'H' },
  { key: 'voidgrubs', label: '공허 유충', icon: 'V' },
]

const encodeRiotId = (value: string) => encodeURIComponent(value.trim())
const decodeRiotId = (value: string) => decodeURIComponent(value)
const formatKda = (match: Match) => `${match.kills} / ${match.deaths} / ${match.assists}`
const getKdaRatio = (match: Match) => {
  const ratio = (match.kills + match.assists) / Math.max(match.deaths, 1)
  return `${ratio.toFixed(2)}:1`
}
const formatParticipantKda = (participant: Participant) =>
  `${participant.kills} / ${participant.deaths} / ${participant.assists}`
const getParticipantKdaRatio = (participant: Participant) =>
  `${((participant.kills + participant.assists) / Math.max(participant.deaths, 1)).toFixed(2)}:1`
const getParticipantKillParticipation = (participant: Participant, teamKills: number) =>
  `${Math.round(((participant.kills + participant.assists) / Math.max(teamKills, 1)) * 100)}%`
const getChampionStats = (matches: Match[]) =>
  Object.values(
    matches.reduce<Record<string, ChampionStat>>((stats, match) => {
      stats[match.champion] ??= {
        champion: match.champion,
        games: 0,
        wins: 0,
        losses: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
        cs: 0,
        csPerMinute: 0,
      }

      const stat = stats[match.champion]
      stat.games += 1
      stat.wins += match.result === '승리' ? 1 : 0
      stat.losses += match.result === '패배' ? 1 : 0
      stat.kills += match.kills
      stat.deaths += match.deaths
      stat.assists += match.assists
      stat.cs += match.cs
      stat.csPerMinute += match.csPerMinute

      return stats
    }, {}),
  ).sort((left, right) => right.games - left.games || right.wins - left.wins)
const getChampionWinRate = (stat: ChampionStat) => `${Math.round((stat.wins / Math.max(stat.games, 1)) * 100)}%`
const getChampionKda = (stat: ChampionStat) => `${stat.kills} / ${stat.deaths} / ${stat.assists}`
const getChampionKdaRatio = (stat: ChampionStat) =>
  `${((stat.kills + stat.assists) / Math.max(stat.deaths, 1)).toFixed(2)}:1`
const getChampionAverageCs = (stat: ChampionStat) => Math.round(stat.cs / Math.max(stat.games, 1))
const getChampionAverageCsPerMinute = (stat: ChampionStat) =>
  (stat.csPerMinute / Math.max(stat.games, 1)).toFixed(1)
const mergeChampionStats = (stats: ChampionStat[], extraStats: ChampionStat[]) =>
  [...stats, ...extraStats].sort((left, right) => right.games - left.games || right.wins - left.wins)
const buildRecentMatches = (seeds: Match[], count: number) =>
  Array.from({ length: count }, (_, index) => {
    const seed = seeds[index % seeds.length]

    return {
      ...seed,
      id: `match-${String(index + 1).padStart(3, '0')}`,
      playedAt: recentMatchPlayedAtLabels[index] ?? `${index + 1}시간 전`,
    }
  })
const recentMatchesPageSize = 20
const allRecentMatches = buildRecentMatches(recentMatchSeeds, 60)
const championStatsPreviewCount = 5
const getItemSlots = (items: string[]) => [...items, ...Array(Math.max(0, 6 - items.length)).fill('')].slice(0, 6)
const getBlueObjectivePercent = (blue: number, red: number) => {
  const total = blue + red
  if (total === 0) return 50

  return Math.round((blue / total) * 100)
}
const getParticipantLoadout = (participant: Participant, index: number) => {
  const isSupport = participant.cs < 60
  const runePool = ['감전', '정복자', '기민한 발놀림', '콩콩이', '선제공격']
  const secondaryRunePool = ['마법', '결의', '영감', '지배', '정밀']

  return {
    runes: [runePool[index % runePool.length], secondaryRunePool[(index + 2) % secondaryRunePool.length]],
    spells: isSupport ? ['점멸', '탈진'] : index % 3 === 0 ? ['점멸', '점화'] : ['점멸', '순간이동'],
    trinket: isSupport ? '시야 와드' : index % 3 === 1 ? '렌즈' : '원거리 와드',
    wards: {
      placed: isSupport ? 18 : Math.max(3, Math.round(participant.cs / 70)),
      killed: isSupport ? 7 : Math.max(1, Math.round(participant.cs / 120)),
      control: isSupport ? 5 : Math.max(1, Math.round(participant.cs / 160)),
    },
  }
}
const getRecentPositionStats = (matches: Match[]) =>
  Object.values(
    matches.reduce<Record<string, RecentPositionStat>>((stats, match) => {
      stats[match.position] ??= {
        position: match.position,
        games: 0,
        wins: 0,
      }

      const stat = stats[match.position]
      stat.games += 1
      stat.wins += match.result === '승리' ? 1 : 0

      return stats
    }, {}),
  ).sort((left, right) => right.games - left.games || right.wins - left.wins)
const getRecentWinRate = (wins: number, games: number) => Math.round((wins / Math.max(games, 1)) * 100)
const getRecentCircleStyle = (wins: number, losses: number) => {
  const winRate = getRecentWinRate(wins, wins + losses)

  return {
    background: `conic-gradient(#3b82f6 0 ${winRate}%, rgba(239, 68, 68, 0.82) ${winRate}% 100%)`,
  }
}

const getPath = () => window.location.pathname

function App() {
  const [path, setPath] = useState(getPath)
  const [riotId, setRiotId] = useState('Faker#KR1')
  const [server, setServer] = useState<(typeof servers)[number]>('KR')
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState('31분 전')
  const [showAllChampionStats, setShowAllChampionStats] = useState(false)
  const [visibleRecentMatchesCount, setVisibleRecentMatchesCount] = useState(recentMatchesPageSize)
  const recentMatches = allRecentMatches.slice(0, visibleRecentMatchesCount)
  const hasMoreRecentMatches = visibleRecentMatchesCount < allRecentMatches.length
  const championStats = mergeChampionStats(getChampionStats(recentMatches), extraChampionStats)
  const visibleChampionStats = showAllChampionStats ? championStats : championStats.slice(0, championStatsPreviewCount)
  const hiddenChampionStatsCount = Math.max(0, championStats.length - championStatsPreviewCount)
  const recentWins = recentMatches.filter((match) => match.result === '승리').length
  const recentLosses = recentMatches.length - recentWins
  const recentWinRate = getRecentWinRate(recentWins, recentMatches.length)
  const recentChampionStats = getChampionStats(recentMatches).slice(0, 3)
  const recentPositionStats = getRecentPositionStats(recentMatches).slice(0, 3)

  useEffect(() => {
    const onPopState = () => {
      setPath(getPath())
    }

    window.addEventListener('popstate', onPopState)

    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigateToSearch = () => {
    window.history.pushState({}, '', '/')
    setPath('/')
  }

  const navigateToSummoner = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return

    const nextPath = `/summoner/${encodeRiotId(trimmed)}`
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setVisibleRecentMatchesCount(recentMatchesPageSize)
    setSelectedMatchId('')
    navigateToSummoner(riotId)
  }

  const isSummonerPage = path.startsWith('/summoner/')
  const currentRiotId = isSummonerPage
    ? decodeRiotId(path.replace('/summoner/', '')) || 'Unknown#TAG'
    : ''

  if (isSummonerPage) {
    return (
      <div className="page">
        <header className="header">
          <button className="link-button" type="button" onClick={navigateToSearch}>
            검색으로 돌아가기
          </button>
          <span className="header-label">최근 전적 조회</span>
        </header>

        <main className="container">
          <section className="panel inline-search-panel">
            <form className="inline-search-form" onSubmit={handleSearch}>
              <div className="inline-search-controls">
                <select
                  className="server-select"
                  value={server}
                  onChange={(event) => setServer(event.target.value as (typeof servers)[number])}
                  aria-label="Server"
                >
                  {servers.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <input
                  id="summoner-search"
                  className="text-input"
                  type="text"
                  value={riotId}
                  onChange={(event) => setRiotId(event.target.value)}
                  placeholder="GameName#TAG"
                  autoComplete="off"
                />
                <button className="primary-button inline-button" type="submit">
                  검색
                </button>
              </div>
            </form>
          </section>

          <section className="panel profile-panel">
            <div className="profile-head">
              <div className="profile-identity">
                <div className="summoner-icon" aria-hidden="true">
                  531
                </div>
                <div>
                  <p className="section-title">소환사</p>
                  <div className="summoner-row">
                    <h1 className="summoner-name">{currentRiotId}</h1>
                    <span className="level-badge">Lv. 531</span>
                  </div>
                  <p className="muted">서버 {server}</p>
                </div>
              </div>
              <div className="profile-meta">
                <div className="profile-actions">
                  <button className="refresh-button" type="button" onClick={() => setLastUpdatedLabel('방금 전')}>
                    전적 갱신
                  </button>
                </div>
                <span>최근 업데이트: {lastUpdatedLabel}</span>
              </div>
            </div>

            <div className="summary-grid">
              <article className="summary-card">
                <span>랭크 티어</span>
                <strong>Challenger 1,243 LP</strong>
              </article>
              <article className="summary-card">
                <span>승률</span>
                <strong>60% (100승 100패)</strong>
              </article>
              <article className="summary-card">
                <span>평균 KDA / 포지션</span>
                <strong>3.92 : 1 • MID</strong>
              </article>
            </div>
          </section>

          <section className="panel champion-stats-panel">
            <div className="panel-head">
              <div>
                <p className="section-title">챔피언 통계</p>
                <h2>Champion Stats</h2>
              </div>
              <span className="season-filter">2026 Season</span>
            </div>

            <div className="champion-stats-table" role="table" aria-label="챔피언 통계">
              <div className="champion-stats-row stats-header" role="row">
                <span>챔피언</span>
                <span>승률</span>
                <span>게임</span>
                <span>승 / 패</span>
                <span>평점</span>
                <span>킬</span>
                <span>데스</span>
                <span>어시스트</span>
                <span>CS</span>
              </div>
              {visibleChampionStats.map((stat) => (
                <div className="champion-stats-row" role="row" key={stat.champion}>
                  <div className="champion-cell">
                    <div className="champion-avatar compact" aria-hidden="true">
                      {stat.champion.slice(0, 1)}
                    </div>
                    <strong>{stat.champion}</strong>
                  </div>
                  <strong className={stat.wins >= stat.losses ? 'positive-stat' : 'negative-stat'}>
                    {getChampionWinRate(stat)}
                  </strong>
                  <span>{stat.games}</span>
                  <span>
                    {stat.wins}승 {stat.losses}패
                  </span>
                  <span title={`KDA ${getChampionKda(stat)}`}>{getChampionKdaRatio(stat)}</span>
                  <span>{stat.kills}</span>
                  <span>{stat.deaths}</span>
                  <span>{stat.assists}</span>
                  <span>
                    {getChampionAverageCs(stat)}
                    <small>{getChampionAverageCsPerMinute(stat)} CS/m</small>
                  </span>
                </div>
              ))}
            </div>
            {hiddenChampionStatsCount > 0 && (
              <button
                className="champion-stats-toggle"
                type="button"
                onClick={() => setShowAllChampionStats((current) => !current)}
              >
                {showAllChampionStats ? '상위 5개만 보기' : `나머지 ${hiddenChampionStatsCount}개 챔피언 보기`}
              </button>
            )}
          </section>

          <section className="panel matches-panel">
            <div className="panel-head">
              <div>
                <p className="section-title">최근 전적</p>
                <h2>Recent Matches</h2>
              </div>
            </div>

            <div className="recent-overview">
              <article className="recent-overview-card recent-overview-result">
                <div className="recent-overview-title">
                  <strong>최근 {recentMatches.length}판</strong>
                  <span>승패 비율</span>
                </div>
                <div className="recent-result-body">
                  <div className="recent-result-ring" style={getRecentCircleStyle(recentWins, recentLosses)} aria-hidden="true">
                    <div className="recent-result-ring-inner">
                      <strong>{recentWinRate}%</strong>
                      <span>승률</span>
                    </div>
                  </div>
                  <div className="recent-result-meta">
                    <strong>{recentWins}승 {recentLosses}패</strong>
                    <span>최근 {recentMatches.length}게임 기준</span>
                  </div>
                </div>
              </article>

              <article className="recent-overview-card">
                <div className="recent-overview-title">
                  <strong>챔피언 전적</strong>
                  <span>최근 20판 기준 KDA</span>
                </div>
                <div className="recent-champion-summary">
                  {recentChampionStats.map((stat) => (
                    <div key={stat.champion} className="recent-champion-row">
                      <div className="champion-cell">
                        <div className="champion-avatar compact" aria-hidden="true">
                          {stat.champion.slice(0, 1)}
                        </div>
                        <div>
                          <strong>{stat.champion}</strong>
                          <span>
                            {stat.games}게임 · {stat.wins}승 {stat.losses}패
                          </span>
                        </div>
                      </div>
                      <div className="recent-champion-kda">
                        <strong>{getChampionKdaRatio(stat)}</strong>
                        <span>{getChampionKda(stat)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="recent-overview-card">
                <div className="recent-overview-title">
                  <strong>선호 포지션</strong>
                  <span>최근 전적 분포</span>
                </div>
                <div className="recent-position-list">
                  {recentPositionStats.map((stat) => (
                    <div key={stat.position} className="recent-position-item">
                      <div className="recent-position-head">
                        <strong>{stat.position}</strong>
                        <span>{stat.games}게임</span>
                      </div>
                      <div className="recent-position-track" aria-hidden="true">
                        <span style={{ width: `${Math.round((stat.games / recentMatches.length) * 100)}%` }} />
                      </div>
                      <div className="recent-position-foot">
                        <span>비중 {Math.round((stat.games / recentMatches.length) * 100)}%</span>
                        <span>승률 {getRecentWinRate(stat.wins, stat.games)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="match-list">
              {recentMatches.map((match) => (
                <div key={match.id} className="match-entry">
                  <button
                    className={`match-card ${match.result === '승리' ? 'win' : 'lose'} ${
                      selectedMatchId === match.id ? 'selected' : ''
                    }`}
                    type="button"
                    aria-expanded={selectedMatchId === match.id}
                    onClick={() => setSelectedMatchId((current) => (current === match.id ? '' : match.id))}
                  >
                    <div className="match-result">
                      <strong>{match.result}</strong>
                      <span>{match.queue}</span>
                      <span>{match.playedAt}</span>
                    </div>

                    <div className="match-champion">
                      <div className="champion-avatar" aria-hidden="true">
                        {match.champion.slice(0, 1)}
                      </div>
                      <div>
                        <strong>{match.champion}</strong>
                        <span>
                          {match.position} • Lv.{match.level}
                        </span>
                      </div>
                    </div>

                    <div className="match-kda">
                      <strong>{formatKda(match)}</strong>
                      <span>{getKdaRatio(match)} 평점</span>
                    </div>

                    <div className="match-stats">
                      <span>킬관여 {match.killParticipation}</span>
                      <span>
                        CS {match.cs} ({match.csPerMinute})
                      </span>
                    </div>

                    <div className="match-items" aria-label="아이템">
                      {match.items.map((item) => (
                        <span key={`${match.id}-${item}`} title={item}>
                          {item.slice(0, 1)}
                        </span>
                      ))}
                    </div>

                    <div className="match-time">
                      <strong>상세</strong>
                      <span>{match.duration}</span>
                    </div>
                  </button>

                  {selectedMatchId === match.id && (
                    <section className="match-detail" aria-label={`${match.champion} 경기 상세`}>
                      <div className="detail-summary">
                        <div className="objective-head">
                          <strong>오브젝트</strong>
                          <span>게임 시간 {match.duration}</span>
                        </div>

                        <div className="objective-body">
                          <div className="objective-side-list blue" aria-label="블루팀 보조 오브젝트">
                            {sideObjectiveRows.map(({ key, label, icon }) => (
                              <div key={`${match.id}-blue-${key}`} className="objective-side-item">
                                <span className="objective-icon" title={label} aria-label={label}>
                                  {icon}
                                </span>
                                <strong className="objective-value blue">{match.objectives.blue[key]}</strong>
                              </div>
                            ))}
                          </div>

                          <div className="objective-graphs" aria-label="킬 및 골드 비교">
                            {graphObjectiveRows.map(({ key, label, format }) => {
                              const blueValue = match.objectives.blue[key]
                              const redValue = match.objectives.red[key]
                              const bluePercent = getBlueObjectivePercent(blueValue, redValue)

                              return (
                                <div key={`${match.id}-${key}`} className="objective-graph-row">
                                  <div className="objective-graph-head">
                                    <strong className="blue">{format ? format(blueValue) : blueValue}</strong>
                                    <span>{label}</span>
                                    <strong className="red">{format ? format(redValue) : redValue}</strong>
                                  </div>
                                  <div className="objective-graph-track">
                                    <span className="blue" style={{ width: `${bluePercent}%` }} />
                                    <span className="red" style={{ width: `${100 - bluePercent}%` }} />
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          <div className="objective-side-list red" aria-label="레드팀 보조 오브젝트">
                            {sideObjectiveRows.map(({ key, label, icon }) => (
                              <div key={`${match.id}-red-${key}`} className="objective-side-item">
                                <span className="objective-icon" title={label} aria-label={label}>
                                  {icon}
                                </span>
                                <strong className="objective-value red">{match.objectives.red[key]}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="detail-teams">
                        {(['blue', 'red'] as const).map((team) => (
                          <div key={`${match.id}-${team}`} className={`team-table ${team}`}>
                            <div className="team-header">
                              <strong>
                                {team === 'blue' ? '블루팀' : '레드팀'} ·{' '}
                                {(team === 'blue') === (match.result === '승리') ? '승리' : '패배'}
                              </strong>
                              <span>닉네임 / KDA / CS / 와드 / 아이템 / 장신구</span>
                            </div>

                            {match.teams[team].map((participant, index) => {
                              const loadout = getParticipantLoadout(participant, index)

                              return (
                                <div key={`${match.id}-${team}-${participant.nickname}`} className="participant-row">
                                  <div className="participant-profile">
                                    <div className="participant-icon-wrap">
                                      <span className="participant-icon" title={participant.champion}>
                                        {participant.champion.slice(0, 1)}
                                      </span>
                                      <div className="participant-loadout">
                                        {[...loadout.runes, ...loadout.spells].map((entry) => (
                                          <span
                                            key={`${match.id}-${team}-${participant.nickname}-${entry}`}
                                            title={entry}
                                          >
                                            {entry.slice(0, 1)}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <strong>{participant.nickname}</strong>
                                  </div>

                                  <div className="participant-kda">
                                    <strong>{formatParticipantKda(participant)}</strong>
                                    <span>
                                      {getParticipantKdaRatio(participant)} · 킬관여{' '}
                                      {getParticipantKillParticipation(participant, match.objectives[team].totalKills)}
                                    </span>
                                  </div>
                                  <span className="participant-cs">CS {participant.cs}</span>
                                  <div className="participant-wards" aria-label="와드 정보">
                                    <span title="와드 설치">설치 {loadout.wards.placed}</span>
                                    <span title="와드 제거">제거 {loadout.wards.killed}</span>
                                    <span title="제어와드 설치">제어 {loadout.wards.control}</span>
                                  </div>
                                  <div className="participant-items" aria-label="아이템">
                                    {getItemSlots(participant.items).map((item, itemIndex) => (
                                      <span
                                        key={`${match.id}-${team}-${participant.nickname}-item-${itemIndex}`}
                                        className={item ? '' : 'empty'}
                                        title={item || '빈 아이템 칸'}
                                      >
                                        {item ? item.slice(0, 1) : '-'}
                                      </span>
                                    ))}
                                  </div>
                                  <span className="participant-trinket" title={loadout.trinket} aria-label={loadout.trinket}>
                                    {loadout.trinket.slice(0, 1)}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              ))}
            </div>

            {hasMoreRecentMatches && (
              <button
                className="match-list-more-button"
                type="button"
                onClick={() =>
                  setVisibleRecentMatchesCount((current) =>
                    Math.min(current + recentMatchesPageSize, allRecentMatches.length),
                  )
                }
              >
                전적 더보기
              </button>
            )}
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <main className="search-layout">
        <section className="search-hero">
          <p className="section-title">MVP</p>
          <h1>소환사 검색</h1>
          <p className="muted">
            Riot ID를 입력하면 최근 전적 조회 페이지로 이동합니다.
          </p>
        </section>

        <section className="panel search-panel">
          <form onSubmit={handleSearch}>
            <label className="input-label" htmlFor="riot-id">
              Riot ID
            </label>
            <div className="search-controls">
              <select
                className="server-select"
                value={server}
                onChange={(event) => setServer(event.target.value as (typeof servers)[number])}
                aria-label="Server"
              >
                {servers.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <input
                id="riot-id"
                className="text-input"
                type="text"
                value={riotId}
                onChange={(event) => setRiotId(event.target.value)}
                placeholder="GameName#TAG"
                autoComplete="off"
              />
            </div>
            <p className="input-help">예시: `Hide on bush#KR1`</p>
            <button className="primary-button" type="submit">
              전적 검색
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
