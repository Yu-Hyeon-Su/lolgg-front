import { FormEvent, useEffect, useMemo, useState } from 'react'

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

type MatchParticipant = {
  participantId: number
  riotId: string | null
  championId: number
  championName: string
  teamSide: 'BLUE' | 'RED'
  teamPosition: string | null
  win: boolean
  kills: number
  deaths: number
  assists: number
  kdaRatio: number
  killParticipation: number
  cs: number
  items: Array<number | null>
  trinketItemId: number | null
  wardsPlaced: number | null
  wardsKilled: number | null
  controlWardsBought: number | null
}

type SummonerPageResponse = {
  summoner: {
    riotId: string
    gameName: string
    tagLine: string
    puuid: string
    platform: string
    regionalGroup: string
    profileIconId: number
    summonerLevel: number
    lastUpdatedAt: string | null
  }
  summary: {
    rank: {
      queueType: string
      tier: string | null
      division: string | null
      leaguePoints: number | null
      wins: number | null
      losses: number | null
    } | null
    seasonRecord: {
      wins: number
      losses: number
      winRate: number
    }
    averageKda: {
      kills: number
      deaths: number
      assists: number
      ratio: number
    }
    primaryPosition: string | null
    mostPlayedChampion: {
      championId: number
      championName: string
      games: number
    } | null
  }
}

type ChampionStatsResponse = {
  season: number
  queueScope: string
  items: Array<{
    championId: number
    championName: string
    games: number
    wins: number
    losses: number
    winRate: number
    kills: number
    deaths: number
    assists: number
    kdaRatio: number
    averageCs: number
    averageCsPerMinute: number
  }>
}

type MatchListResponse = {
  items: Array<{
    matchId: string
    championId: number
    championName: string
    result: '승리' | '패배'
    position: string | null
    kills: number
    deaths: number
    assists: number
    queueId: number
    queueLabel: string
    playedAt: string
    playedAtLabel: string
    gameDurationSeconds: number
    durationLabel: string
    level: number
    cs: number
    csPerMinute: number
    killParticipation: number
    items: Array<number | null>
    trinketItemId: number | null
  }>
  page: {
    cursor: number
    count: number
    hasNext: boolean
    nextCursor: number | null
  }
}

type MatchDetailResponse = {
  matchId: string
  userParticipantId: number
  userTeam: 'BLUE' | 'RED'
  objectives: {
    blue: ObjectiveStats
    red: ObjectiveStats
  }
  participants: MatchParticipant[]
}

type RefreshResponse = {
  jobId: string
  status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
  requestedAt: string
}

type RefreshJobResponse = {
  jobId: string
  status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
  requestedAt: string
  startedAt: string | null
  finishedAt: string | null
  errorMessage: string | null
}

type ApiError = {
  status: number
  code: string
  message: string
}

const apiBase = '/api/v1'
const championStatsPreviewCount = 5
const pageSize = 20
const cdragonBase = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1'
const ddragonVersion = '15.8.1'

const sideObjectiveRows: { key: keyof ObjectiveStats; label: string; icon: string }[] = [
  { key: 'towers', label: '타워 파괴', icon: 'T' },
  { key: 'inhibitors', label: '억제기 파괴', icon: 'I' },
  { key: 'dragons', label: '드래곤 처치', icon: 'D' },
  { key: 'barons', label: '바론 처치', icon: 'B' },
  { key: 'heralds', label: '협곡의 전령', icon: 'H' },
  { key: 'voidgrubs', label: '공허 유충', icon: 'V' },
]

const graphObjectiveRows: { key: keyof ObjectiveStats; label: string; format?: (value: number) => string }[] = [
  { key: 'totalKills', label: 'Total Kill' },
  { key: 'gold', label: 'Gold', format: (value) => `${(value / 1000).toFixed(1)}k` },
]

const encodeRiotId = (value: string) => encodeURIComponent(value.trim())
const decodeRiotId = (value: string) => decodeURIComponent(value)
const getPath = () => window.location.pathname
const getProfileIconUrl = (profileIconId: number) => `${cdragonBase}/profile-icons/${profileIconId}.jpg`
const getChampionIconUrl = (championId: number) => `${cdragonBase}/champion-icons/${championId}.png`
const getItemIconUrl = (itemId: number) => `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/item/${itemId}.png`

const formatNumber = (value: number | null | undefined) => (value == null ? '-' : value.toLocaleString())
const formatRank = (rank: SummonerPageResponse['summary']['rank']) =>
  rank?.tier ? `${rank.tier} ${rank.division ?? ''} ${rank.leaguePoints ?? 0} LP`.trim() : 'Unranked'
const formatLastUpdated = (value: string | null) =>
  value ? new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '기록 없음'
const formatKdaLine = (kills: number, deaths: number, assists: number) => `${kills} / ${deaths} / ${assists}`
const formatKdaRatio = (ratio: number) => `${ratio.toFixed(2)}:1`
const getItemLabel = (itemId: number | null) => (itemId && itemId > 0 ? String(itemId) : '')
const getItemSlots = (items: Array<number | null>) => [...items, ...Array(Math.max(0, 6 - items.length)).fill(null)].slice(0, 6)
const getBlueObjectivePercent = (blue: number, red: number) => {
  const total = blue + red
  if (total === 0) return 50
  return Math.round((blue / total) * 100)
}
const getRecentWinRate = (wins: number, games: number) => Math.round((wins / Math.max(games, 1)) * 100)
const getRecentCircleStyle = (wins: number, losses: number) => {
  const winRate = getRecentWinRate(wins, wins + losses)
  return {
    background: `conic-gradient(#3b82f6 0 ${winRate}%, rgba(239, 68, 68, 0.82) ${winRate}% 100%)`,
  }
}

function AssetIcon({
  src,
  alt,
  fallback,
  className,
}: {
  src: string | null
  alt: string
  fallback: string
  className: string
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return <span className={`${className} icon-fallback`}>{fallback}</span>
  }

  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    let error: ApiError | null = null
    try {
      error = (await response.json()) as ApiError
    } catch {
      error = null
    }
    throw new Error(error?.message || `Request failed: ${response.status}`)
  }

  return (await response.json()) as T
}

const toErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback)

function App() {
  const [path, setPath] = useState(getPath)
  const [riotIdInput, setRiotIdInput] = useState('T1 Guardian#KR3')
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [showAllChampionStats, setShowAllChampionStats] = useState(false)
  const [summonerData, setSummonerData] = useState<SummonerPageResponse | null>(null)
  const [championStatsData, setChampionStatsData] = useState<ChampionStatsResponse | null>(null)
  const [matchesData, setMatchesData] = useState<MatchListResponse | null>(null)
  const [matchDetails, setMatchDetails] = useState<Record<string, MatchDetailResponse>>({})
  const [pageLoading, setPageLoading] = useState(false)
  const [pageError, setPageError] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshStatus, setRefreshStatus] = useState('')

  useEffect(() => {
    const onPopState = () => setPath(getPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const isSummonerPage = path.startsWith('/summoner/')
  const currentRiotId = isSummonerPage ? decodeRiotId(path.replace('/summoner/', '')) || '' : ''

  useEffect(() => {
    if (!isSummonerPage || !currentRiotId) return

    let cancelled = false

    const load = async () => {
      setPageLoading(true)
      setPageError('')
      setSelectedMatchId('')
      setMatchDetails({})

      try {
        const encoded = encodeRiotId(currentRiotId)
        const [summonerResult, championStatsResult, matchesResult] = await Promise.allSettled([
          apiFetch<SummonerPageResponse>(`/summoners/${encoded}`),
          apiFetch<ChampionStatsResponse>(`/summoners/${encoded}/champion-stats`),
          apiFetch<MatchListResponse>(`/summoners/${encoded}/matches?cursor=0&count=${pageSize}`),
        ])

        if (cancelled) return

        const errors: string[] = []

        if (summonerResult.status === 'fulfilled') {
          setSummonerData(summonerResult.value)
        } else {
          setSummonerData(null)
          errors.push(`소환사 정보: ${toErrorMessage(summonerResult.reason, '불러오지 못했습니다.')}`)
        }

        if (championStatsResult.status === 'fulfilled') {
          setChampionStatsData(championStatsResult.value)
        } else {
          setChampionStatsData({ season: new Date().getFullYear(), queueScope: 'ALL', items: [] })
          errors.push(`챔피언 통계: ${toErrorMessage(championStatsResult.reason, '불러오지 못했습니다.')}`)
        }

        if (matchesResult.status === 'fulfilled') {
          setMatchesData(matchesResult.value)
        } else {
          setMatchesData({
            items: [],
            page: {
              cursor: 0,
              count: pageSize,
              hasNext: false,
              nextCursor: null,
            },
          })
          errors.push(`최근 전적: ${toErrorMessage(matchesResult.reason, '불러오지 못했습니다.')}`)
        }

        if (errors.length > 0) {
          setPageError(errors.join(' / '))
        }
      } catch (error) {
        if (cancelled) return
        setSummonerData(null)
        setChampionStatsData(null)
        setMatchesData(null)
        setPageError(toErrorMessage(error, '데이터를 불러오지 못했습니다.'))
      } finally {
        if (!cancelled) setPageLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [currentRiotId, isSummonerPage])

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
    navigateToSummoner(riotIdInput)
  }

  const loadMoreMatches = async () => {
    if (!matchesData?.page.hasNext || matchesData.page.nextCursor == null || loadingMore || !currentRiotId) return
    setLoadingMore(true)
    try {
      const nextPage = await apiFetch<MatchListResponse>(
        `/summoners/${encodeRiotId(currentRiotId)}/matches?cursor=${matchesData.page.nextCursor}&count=${pageSize}`,
      )
      setMatchesData({
        items: [...matchesData.items, ...nextPage.items],
        page: nextPage.page,
      })
    } catch (error) {
      setPageError(error instanceof Error ? error.message : '전적을 더 불러오지 못했습니다.')
    } finally {
      setLoadingMore(false)
    }
  }

  const toggleMatchDetail = async (matchId: string) => {
    if (selectedMatchId === matchId) {
      setSelectedMatchId('')
      return
    }

    setSelectedMatchId(matchId)
    if (matchDetails[matchId] || !currentRiotId) return

    try {
      const detail = await apiFetch<MatchDetailResponse>(`/summoners/${encodeRiotId(currentRiotId)}/matches/${matchId}`)
      setMatchDetails((current) => ({ ...current, [matchId]: detail }))
    } catch (error) {
      setPageError(error instanceof Error ? error.message : '매치 상세를 불러오지 못했습니다.')
    }
  }

  const handleRefresh = async () => {
    if (!currentRiotId || refreshing) return
    setRefreshing(true)
    setRefreshStatus('전적 갱신 요청 중')
    try {
      const refresh = await apiFetch<RefreshResponse>(`/summoners/${encodeRiotId(currentRiotId)}/refresh`, {
        method: 'POST',
      })

      let status = refresh.status
      while (status === 'QUEUED' || status === 'RUNNING') {
        await new Promise((resolve) => window.setTimeout(resolve, 1500))
        const job = await apiFetch<RefreshJobResponse>(
          `/summoners/${encodeRiotId(currentRiotId)}/refresh-jobs/${refresh.jobId}`,
        )
        status = job.status
        setRefreshStatus(`전적 갱신 ${job.status}`)
        if (job.status === 'FAILED') {
          throw new Error(job.errorMessage || '전적 갱신에 실패했습니다.')
        }
      }

      const [summonerResult, championStatsResult, matchesResult] = await Promise.allSettled([
        apiFetch<SummonerPageResponse>(`/summoners/${encodeRiotId(currentRiotId)}`),
        apiFetch<ChampionStatsResponse>(`/summoners/${encodeRiotId(currentRiotId)}/champion-stats`),
        apiFetch<MatchListResponse>(`/summoners/${encodeRiotId(currentRiotId)}/matches?cursor=0&count=${pageSize}`),
      ])

      const errors: string[] = []

      if (summonerResult.status === 'fulfilled') {
        setSummonerData(summonerResult.value)
      } else {
        errors.push(`소환사 정보: ${toErrorMessage(summonerResult.reason, '불러오지 못했습니다.')}`)
      }

      if (championStatsResult.status === 'fulfilled') {
        setChampionStatsData(championStatsResult.value)
      } else {
        errors.push(`챔피언 통계: ${toErrorMessage(championStatsResult.reason, '불러오지 못했습니다.')}`)
      }

      if (matchesResult.status === 'fulfilled') {
        setMatchesData(matchesResult.value)
      } else {
        errors.push(`최근 전적: ${toErrorMessage(matchesResult.reason, '불러오지 못했습니다.')}`)
      }

      setMatchDetails({})
      setSelectedMatchId('')

      if (errors.length > 0) {
        setPageError(errors.join(' / '))
        setRefreshStatus('전적 갱신 후 일부 데이터만 갱신됨')
      } else {
        setPageError('')
        setRefreshStatus('전적 갱신 완료')
      }
    } catch (error) {
      setRefreshStatus('')
      setPageError(toErrorMessage(error, '전적 갱신에 실패했습니다.'))
    } finally {
      setRefreshing(false)
    }
  }

  const visibleChampionStats = useMemo(() => {
    if (!championStatsData) return []
    return showAllChampionStats ? championStatsData.items : championStatsData.items.slice(0, championStatsPreviewCount)
  }, [championStatsData, showAllChampionStats])

  const hiddenChampionStatsCount = Math.max(0, (championStatsData?.items.length ?? 0) - championStatsPreviewCount)
  const recentMatches = matchesData?.items ?? []
  const recentWins = recentMatches.filter((match) => match.result === '승리').length
  const recentLosses = recentMatches.length - recentWins
  const recentWinRate = getRecentWinRate(recentWins, recentMatches.length)
  const recentChampionStats = recentMatches
    .reduce<Record<string, { championId: number; champion: string; games: number; wins: number; losses: number; kills: number; deaths: number; assists: number }>>(
      (stats, match) => {
        stats[match.championName] ??= {
          championId: match.championId,
          champion: match.championName,
          games: 0,
          wins: 0,
          losses: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
        }
        const current = stats[match.championName]
        current.games += 1
        current.wins += match.result === '승리' ? 1 : 0
        current.losses += match.result === '패배' ? 1 : 0
        current.kills += match.kills
        current.deaths += match.deaths
        current.assists += match.assists
        return stats
      },
      {},
    )
  const recentChampionPreview = Object.values(recentChampionStats)
    .sort((left, right) => right.games - left.games || right.wins - left.wins)
    .slice(0, 3)
  const recentPositionPreview = Object.entries(
    recentMatches.reduce<Record<string, { games: number; wins: number }>>((stats, match) => {
      const key = match.position || 'UNKNOWN'
      stats[key] ??= { games: 0, wins: 0 }
      stats[key].games += 1
      stats[key].wins += match.result === '승리' ? 1 : 0
      return stats
    }, {}),
  )
    .map(([position, value]) => ({ position, ...value }))
    .sort((left, right) => right.games - left.games || right.wins - left.wins)
    .slice(0, 3)

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
                <input
                  id="summoner-search"
                  className="text-input"
                  type="text"
                  value={riotIdInput}
                  onChange={(event) => setRiotIdInput(event.target.value)}
                  placeholder="GameName#TAG"
                  autoComplete="off"
                />
                <button className="primary-button inline-button" type="submit">
                  검색
                </button>
              </div>
            </form>
          </section>

          {pageError && (
            <section className="panel">
              <p className="section-title">오류</p>
              <p className="muted">{pageError}</p>
            </section>
          )}

          {pageLoading && (
            <section className="panel">
              <p className="section-title">로딩 중</p>
              <p className="muted">소환사 정보를 불러오는 중입니다.</p>
            </section>
          )}

          {!pageLoading && summonerData && (
            <>
              <section className="panel profile-panel">
                <div className="profile-head">
                  <div className="profile-identity">
                    <div className="profile-avatar-block">
                      <p className="section-title">소환사</p>
                      <AssetIcon
                        className="summoner-icon"
                        src={getProfileIconUrl(summonerData.summoner.profileIconId)}
                        alt={`${summonerData.summoner.riotId} profile icon`}
                        fallback={String(summonerData.summoner.profileIconId)}
                      />
                    </div>
                    <div className="profile-summary">
                      <div className="profile-platform-row">
                        <span className="platform-card" aria-label={`현재 서버 ${summonerData.summoner.platform}`}>
                          <strong>{summonerData.summoner.platform}</strong>
                        </span>
                      </div>
                      <div className="summoner-row">
                        <h1 className="summoner-name">{summonerData.summoner.riotId}</h1>
                        <span className="level-badge">Lv. {summonerData.summoner.summonerLevel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="profile-meta">
                    <div className="profile-actions">
                      <button className="refresh-button" type="button" onClick={handleRefresh} disabled={refreshing}>
                        {refreshing ? '갱신 중' : '전적 갱신'}
                      </button>
                    </div>
                    <span>최근 업데이트: {formatLastUpdated(summonerData.summoner.lastUpdatedAt)}</span>
                    {refreshStatus && <span>{refreshStatus}</span>}
                  </div>
                </div>

                <div className="summary-grid">
                  <article className="summary-card">
                    <span>랭크 티어</span>
                    <strong>{formatRank(summonerData.summary.rank)}</strong>
                  </article>
                  <article className="summary-card">
                    <span>승률</span>
                    <strong>
                      {summonerData.summary.seasonRecord.winRate}% ({summonerData.summary.seasonRecord.wins}승{' '}
                      {summonerData.summary.seasonRecord.losses}패)
                    </strong>
                  </article>
                  <article className="summary-card">
                    <span>평균 KDA / 포지션</span>
                    <strong>
                      {summonerData.summary.averageKda.ratio.toFixed(2)} : 1 • {summonerData.summary.primaryPosition ?? '-'}
                    </strong>
                  </article>
                </div>
              </section>

              <section className="panel champion-stats-panel">
                <div className="panel-head">
                  <div>
                    <p className="section-title">챔피언 통계</p>
                    <h2>Champion Stats</h2>
                  </div>
                  <span className="season-filter">{championStatsData?.season ?? '-'} Season</span>
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
                    <div className="champion-stats-row" role="row" key={stat.championId}>
                      <div className="champion-cell">
                        <AssetIcon
                          className="champion-avatar compact"
                          src={getChampionIconUrl(stat.championId)}
                          alt={stat.championName}
                          fallback={stat.championName.slice(0, 1)}
                        />
                        <strong>{stat.championName}</strong>
                      </div>
                      <strong className={stat.wins >= stat.losses ? 'positive-stat' : 'negative-stat'}>
                        {stat.winRate}%
                      </strong>
                      <span>{stat.games}</span>
                      <span>
                        {stat.wins}승 {stat.losses}패
                      </span>
                      <span title={`KDA ${formatKdaLine(stat.kills, stat.deaths, stat.assists)}`}>{formatKdaRatio(stat.kdaRatio)}</span>
                      <span>{stat.kills}</span>
                      <span>{stat.deaths}</span>
                      <span>{stat.assists}</span>
                      <span>
                        {Math.round(stat.averageCs)}
                        <small>{stat.averageCsPerMinute.toFixed(1)} CS/m</small>
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
                        <strong>
                          {recentWins}승 {recentLosses}패
                        </strong>
                        <span>현재 로드된 {recentMatches.length}게임 기준</span>
                      </div>
                    </div>
                  </article>

                  <article className="recent-overview-card">
                    <div className="recent-overview-title">
                      <strong>챔피언 전적</strong>
                      <span>현재 로드된 전적 기준</span>
                    </div>
                    <div className="recent-champion-summary">
                      {recentChampionPreview.map((stat) => (
                        <div key={stat.champion} className="recent-champion-row">
                          <div className="champion-cell">
                            <AssetIcon
                              className="champion-avatar compact"
                              src={getChampionIconUrl(stat.championId)}
                              alt={stat.champion}
                              fallback={stat.champion.slice(0, 1)}
                            />
                            <div>
                              <strong>{stat.champion}</strong>
                              <span>
                                {stat.games}게임 · {stat.wins}승 {stat.losses}패
                              </span>
                            </div>
                          </div>
                          <div className="recent-champion-kda">
                            <strong>{formatKdaRatio((stat.kills + stat.assists) / Math.max(stat.deaths, 1))}</strong>
                            <span>{formatKdaLine(stat.kills, stat.deaths, stat.assists)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="recent-overview-card">
                    <div className="recent-overview-title">
                      <strong>선호 포지션</strong>
                      <span>현재 로드된 전적 분포</span>
                    </div>
                    <div className="recent-position-list">
                      {recentPositionPreview.map((stat) => (
                        <div key={stat.position} className="recent-position-item">
                          <div className="recent-position-head">
                            <strong>{stat.position}</strong>
                            <span>{stat.games}게임</span>
                          </div>
                          <div className="recent-position-track" aria-hidden="true">
                            <span style={{ width: `${Math.round((stat.games / Math.max(recentMatches.length, 1)) * 100)}%` }} />
                          </div>
                          <div className="recent-position-foot">
                            <span>비중 {Math.round((stat.games / Math.max(recentMatches.length, 1)) * 100)}%</span>
                            <span>승률 {getRecentWinRate(stat.wins, stat.games)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>

                {recentMatches.length === 0 && (
                  <div className="panel">
                    <p className="muted">최근 전적이 없습니다. 전적 갱신을 하세요.</p>
                  </div>
                )}

                <div className="match-list">
                  {recentMatches.map((match) => {
                    const detail = matchDetails[match.matchId]

                    return (
                      <div key={match.matchId} className="match-entry">
                        <button
                          className={`match-card ${match.result === '승리' ? 'win' : 'lose'} ${
                            selectedMatchId === match.matchId ? 'selected' : ''
                          }`}
                          type="button"
                          aria-expanded={selectedMatchId === match.matchId}
                          onClick={() => void toggleMatchDetail(match.matchId)}
                        >
                          <div className="match-result">
                            <strong>{match.result}</strong>
                            <span>{match.queueLabel}</span>
                            <span>{match.playedAtLabel}</span>
                          </div>

                          <div className="match-champion">
                            <AssetIcon
                              className="champion-avatar"
                              src={getChampionIconUrl(match.championId)}
                              alt={match.championName}
                              fallback={match.championName.slice(0, 1)}
                            />
                            <div>
                              <strong>{match.championName}</strong>
                              <span>
                                {match.position ?? '-'} • Lv.{match.level}
                              </span>
                            </div>
                          </div>

                          <div className="match-kda">
                            <strong>{formatKdaLine(match.kills, match.deaths, match.assists)}</strong>
                            <span>{formatKdaRatio((match.kills + match.assists) / Math.max(match.deaths, 1))} 평점</span>
                          </div>

                          <div className="match-stats">
                            <span>킬관여 {match.killParticipation}%</span>
                            <span>
                              CS {match.cs} ({match.csPerMinute.toFixed(1)})
                            </span>
                          </div>

                          <div className="match-items" aria-label="아이템">
                            {getItemSlots(match.items).map((itemId, index) => {
                              const label = getItemLabel(itemId)
                              return (
                                <AssetIcon
                                  key={`${match.matchId}-item-${index}`}
                                  className="item-icon"
                                  src={itemId && itemId > 0 ? getItemIconUrl(itemId) : null}
                                  alt={label || 'empty item slot'}
                                  fallback="-"
                                />
                              )
                            })}
                          </div>

                          <div className="match-time">
                            <strong>상세</strong>
                            <span>{match.durationLabel}</span>
                          </div>
                        </button>

                        {selectedMatchId === match.matchId && detail && (
                          <section className="match-detail" aria-label={`${match.championName} 경기 상세`}>
                            <div className="detail-summary">
                              <div className="objective-head">
                                <strong>오브젝트</strong>
                                <span>게임 시간 {match.durationLabel}</span>
                              </div>

                              <div className="objective-body">
                                <div className="objective-side-list blue" aria-label="블루팀 보조 오브젝트">
                                  {sideObjectiveRows.map(({ key, label, icon }) => (
                                    <div key={`${match.matchId}-blue-${key}`} className="objective-side-item">
                                      <span className="objective-icon" title={label} aria-label={label}>
                                        {icon}
                                      </span>
                                      <strong className="objective-value blue">{detail.objectives.blue[key]}</strong>
                                    </div>
                                  ))}
                                </div>

                                <div className="objective-graphs" aria-label="킬 및 골드 비교">
                                  {graphObjectiveRows.map(({ key, label, format }) => {
                                    const blueValue = detail.objectives.blue[key]
                                    const redValue = detail.objectives.red[key]
                                    const bluePercent = getBlueObjectivePercent(blueValue, redValue)

                                    return (
                                      <div key={`${match.matchId}-${key}`} className="objective-graph-row">
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
                                    <div key={`${match.matchId}-red-${key}`} className="objective-side-item">
                                      <span className="objective-icon" title={label} aria-label={label}>
                                        {icon}
                                      </span>
                                      <strong className="objective-value red">{detail.objectives.red[key]}</strong>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="detail-teams">
                              {(['BLUE', 'RED'] as const).map((team) => (
                                <div key={`${match.matchId}-${team}`} className={`team-table ${team === 'BLUE' ? 'blue' : 'red'}`}>
                                  <div className="team-header">
                                    <strong>{team === 'BLUE' ? '블루팀' : '레드팀'}</strong>
                                    <span>닉네임 / KDA / CS / 와드 / 아이템 / 장신구</span>
                                  </div>

                                  {detail.participants
                                    .filter((participant) => participant.teamSide === team)
                                    .map((participant) => (
                                      <div key={`${match.matchId}-${team}-${participant.participantId}`} className="participant-row">
                                        <div className="participant-profile">
                                          <div className="participant-icon-wrap">
                                            <AssetIcon
                                              className="participant-icon"
                                              src={getChampionIconUrl(participant.championId)}
                                              alt={participant.championName}
                                              fallback={participant.championName.slice(0, 1)}
                                            />
                                          </div>
                                          <strong>{participant.riotId ?? participant.championName}</strong>
                                        </div>

                                        <div className="participant-kda">
                                          <strong>{formatKdaLine(participant.kills, participant.deaths, participant.assists)}</strong>
                                          <span>
                                            {formatKdaRatio(participant.kdaRatio)} · 킬관여 {participant.killParticipation}%
                                          </span>
                                        </div>
                                        <span className="participant-cs">CS {participant.cs}</span>
                                        <div className="participant-wards" aria-label="와드 정보">
                                          <span title="와드 설치">설치 {formatNumber(participant.wardsPlaced)}</span>
                                          <span title="와드 제거">제거 {formatNumber(participant.wardsKilled)}</span>
                                          <span title="제어와드 구매">제어 {formatNumber(participant.controlWardsBought)}</span>
                                        </div>
                                        <div className="participant-items" aria-label="아이템">
                                          {getItemSlots(participant.items).map((itemId, itemIndex) => {
                                            const label = getItemLabel(itemId)
                                            return (
                                              <AssetIcon
                                                key={`${match.matchId}-${team}-${participant.participantId}-item-${itemIndex}`}
                                                className={`item-icon ${label ? '' : 'empty'}`.trim()}
                                                src={itemId && itemId > 0 ? getItemIconUrl(itemId) : null}
                                                alt={label || 'empty item slot'}
                                                fallback="-"
                                              />
                                            )
                                          })}
                                        </div>
                                        <AssetIcon
                                          className="participant-trinket"
                                          src={
                                            participant.trinketItemId && participant.trinketItemId > 0
                                              ? getItemIconUrl(participant.trinketItemId)
                                              : null
                                          }
                                          alt={getItemLabel(participant.trinketItemId) || '장신구 없음'}
                                          fallback="-"
                                        />
                                      </div>
                                    ))}
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </div>
                    )
                  })}
                </div>

                {matchesData?.page.hasNext && (
                  <button className="match-list-more-button" type="button" onClick={() => void loadMoreMatches()} disabled={loadingMore}>
                    {loadingMore ? '불러오는 중' : '전적 더보기'}
                  </button>
                )}
              </section>
            </>
          )}
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
          <p className="muted">Riot ID를 입력하면 최근 전적 조회 페이지로 이동합니다.</p>
        </section>

        <section className="panel search-panel">
          <form onSubmit={handleSearch}>
            <label className="input-label" htmlFor="riot-id">
              Riot ID
            </label>
            <div className="search-controls">
              <input
                id="riot-id"
                className="text-input"
                type="text"
                value={riotIdInput}
                onChange={(event) => setRiotIdInput(event.target.value)}
                placeholder="GameName#TAG"
                autoComplete="off"
              />
            </div>
            <p className="input-help">예시: `T1 Guardian#KR3`</p>
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
