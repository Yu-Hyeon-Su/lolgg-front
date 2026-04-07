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

const recentMatches: Match[] = [
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

const getPath = () => window.location.pathname

function App() {
  const [path, setPath] = useState(getPath)
  const [riotId, setRiotId] = useState('Faker#KR1')
  const [server, setServer] = useState<(typeof servers)[number]>('KR')
  const [selectedMatchId, setSelectedMatchId] = useState(recentMatches[0].id)

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
                <span>최근 업데이트 31분 전</span>
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

          <section className="panel matches-panel">
            <div className="panel-head">
              <div>
                <p className="section-title">최근 전적</p>
                <h2>Recent Matches</h2>
              </div>
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
