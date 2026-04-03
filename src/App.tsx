import { FormEvent, useEffect, useState } from 'react'

type Match = {
  champion: string
  result: '승리' | '패배'
  kda: string
  queue: string
  playedAt: string
}

const recentMatches: Match[] = [
  { champion: '아리', result: '승리', kda: '11 / 2 / 9', queue: '솔로 랭크', playedAt: '12분 전' },
  { champion: '오리아나', result: '패배', kda: '4 / 5 / 7', queue: '솔로 랭크', playedAt: '38분 전' },
  { champion: '아지르', result: '승리', kda: '8 / 1 / 6', queue: '자유 랭크', playedAt: '1시간 전' },
  { champion: '탈리야', result: '승리', kda: '6 / 3 / 12', queue: '일반', playedAt: '2시간 전' },
  { champion: '사일러스', result: '패배', kda: '3 / 7 / 4', queue: '솔로 랭크', playedAt: '3시간 전' },
]

const servers = ['KR', 'NA', 'EUW', 'EUNE', 'JP', 'OCE'] as const

const encodeRiotId = (value: string) => encodeURIComponent(value.trim())
const decodeRiotId = (value: string) => decodeURIComponent(value)

const getPath = () => window.location.pathname

function App() {
  const [path, setPath] = useState(getPath)
  const [riotId, setRiotId] = useState('Faker#KR1')
  const [server, setServer] = useState<(typeof servers)[number]>('KR')

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
              {recentMatches.map((match, index) => (
                <article
                  key={`${match.champion}-${match.playedAt}-${index}`}
                  className={`match-card ${match.result === '승리' ? 'win' : 'lose'}`}
                >
                  <div className="match-result">
                    <strong>{match.result}</strong>
                    <span>{match.queue}</span>
                  </div>
                  <div className="match-main">
                    <strong>{match.champion}</strong>
                    <span>{match.kda}</span>
                  </div>
                  <div className="match-time">{match.playedAt}</div>
                </article>
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
