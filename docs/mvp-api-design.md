# LOL.GG Front MVP API 설계

작성일: 2026-04-09

이 문서는 `/Users/yu/dev/projects/lolgg/docs/riot-api-notes.md`의 Riot API 조사 내용과 현재 프론트 구현 기준(`/Users/yu/dev/projects/lolgg-front/src/App.tsx`)으로 MVP 백엔드 API를 설계한 문서다.

## 1. 설계 목표

현재 프론트가 필요로 하는 화면은 크게 2개다.

1. 검색 페이지
2. 소환사 전적 페이지

소환사 전적 페이지에서 필요한 데이터는 다음이다.

- 소환사 기본 프로필
- 상단 요약 카드
- 챔피언 통계 테이블
- 최근 2개월 전적 목록
- 최근 매치 목록
- 특정 매치 상세
- 전적 갱신

MVP에서는 Riot API를 최대한 직접 활용하되, 프론트가 바로 렌더링할 수 있는 형태로 서버에서 가공해서 내려주는 방향으로 설계한다.

## 2. 핵심 판단

### 2.1 서버 선택 없이 Riot ID만으로 검색

소환사 검색 시 프론트에서 서버 지역을 선택받지 않는다.

전제는 `Riot ID(gameName#tagLine)`가 계정 식별자로 충분하다는 점이다. Riot 공식 FAQ에서도 League/TFT는 최종적으로 Riot ID만 입력받는 흐름을 지향하고 있고, 플레이어 데이터는 여전히 게임 리전에 샤딩되므로 실제 활성 플랫폼은 서버가 `account-v1 region`으로 조회해 해석한다.

즉, 검색 API는 `Riot ID`만 입력으로 받고, 실제 조회는 아래 순서로 처리한다.

1. `account-v1`로 Riot ID 조회
2. `account-v1 region`으로 실제 활성 플랫폼 조회
3. 해당 플랫폼 기준으로 `summoner-v4` 조회
4. 해당 플랫폼에 대응되는 regional host 기준으로 `match-v5` 조회

이 구조에서는 사용자가 서버를 직접 맞출 필요가 없고, 검색 실패는 실제로 계정이 없을 때만 `SUMMONER_NOT_FOUND`로 처리하면 된다.

### 2.2 프론트 전용 BFF 형태로 응답 가공

현재 프론트는 Riot 원본 응답 구조가 아니라 화면 중심 구조를 기대한다.

예:

- `playedAt`: 상대 시간 문자열
- `duration`: `29분 14초`
- `result`: `승리 | 패배`
- `queue`: `솔로 랭크`
- `killParticipation`: `%` 문자열

이 값들은 서버에서 가공해서 내려주는 편이 프론트 구현이 가장 단순하다.

### 2.3 챔피언 통계와 최근 전적은 다른 기능으로 분리

Riot API만으로 OP.GG식 전역 챔피언 통계는 불가능하다.  
하지만 개인 기준 시즌 통계는 match 데이터를 수집/저장한 뒤 자체 집계해서 제공할 수 있다.

이 문서에서 두 기능은 아래처럼 분리한다.

- 최근 전적 목록: 초기 20개 조회 후 `더보기`로 20개씩 추가 조회, 범위는 최근 2개월
- 챔피언 통계: 이번 시즌 전체 개인 전적 기준 집계

즉, 현재 프론트의 Champion Stats는 "최근 N게임"이 아니라 "이번 시즌 전체 통계"로 보는 것이 맞다.

### 2.4 유저 식별 기준은 `puuid`로 통일

MVP에서는 유저 식별 기준을 `puuid`로 통일한다.

- 검색 입력은 `Riot ID(gameName#tagLine)`
- 내부 저장과 조인 기준은 `puuid`
- `accountId`는 저장하지 않는다
- `summonerId`는 `league-v4` 기반 랭크 조회를 위해 사용하며, 현재 MVP에서는 `summoner_riot_id`로 저장한다

즉, 현재 MVP 기준 유저의 기본 식별 흐름은 `Riot ID -> puuid`이며, 랭크 조회를 위해 `summonerId`를 보조 식별자로 함께 저장한다. 레거시 식별자인 `accountId`는 범위에서 제외한다.

## 3. 프론트 기준 필요 데이터

현재 타입 기준 핵심 요구사항은 아래와 같다.

### 3.1 프로필 헤더

- Riot ID
- 실제 플랫폼
- 프로필 아이콘 ID
- 소환사 레벨
- 최근 갱신 시각

### 3.2 상단 요약 카드

- 랭크 티어/LP
- 최근 기준 승률
- 평균 KDA
- 주 포지션

주의:
- 랭크 정보는 별도 Riot API(`league-v4`)가 필요하다.
- MVP에서는 프로필 카드에 대표 랭크 1개만 표시한다.
- DB에는 랭크 스냅샷 이력을 두지 않고, 큐별 현재 랭크를 별도 테이블로 관리하는 방향을 권장한다.

### 3.3 챔피언 통계

- 챔피언명
- 게임 수
- 승/패
- 승률
- 킬/데스/어시스트 합계
- 평균 CS
- 평균 CS/m
- KDA ratio
- 기준 기간: 이번 시즌 전체

### 3.4 최근 전적 요약

- 초기 20개 매치
- 더보기 시 20개씩 추가
- 최대 조회 범위는 최근 2개월
- 최근 매치 카드 및 매치 상세 연결

### 3.5 매치 카드

- matchId
- 챔피언
- 승패
- 포지션
- KDA
- 큐 타입
- 플레이 시간
- 게임 길이
- 레벨
- CS
- CS/m
- 킬관여
- 아이템 6개

### 3.6 매치 상세

- 양 팀 오브젝트 비교
- 양 팀 참가자 10명 정보
- 참가자별 KDA / CS / 킬관여 / 아이템

주의:
- 현재 프론트의 rune/spell/trinket/ward 정보는 mock 생성값이다.
- MVP 기준 대부분의 데이터는 `match-v5 detail`로 처리 가능하고, timeline은 확장 기능일 때만 추가로 고려한다.
- MVP 1차에서는 이 필드들을 제외하거나 optional 처리하는 것이 낫다.

## 4. MVP 엔드포인트

MVP 기준 권장 엔드포인트는 5개다.

1. `GET /api/v1/summoners/{riotId}`
2. `GET /api/v1/summoners/{riotId}/matches`
3. `GET /api/v1/summoners/{riotId}/champion-stats`
4. `GET /api/v1/matches/{matchId}`
5. `POST /api/v1/summoners/{riotId}/refresh`

여기서 `riotId`는 URL-encoded된 `gameName#tagLine` 문자열이다.

예:

`/api/v1/summoners/Hide%20on%20bush%23KR1`

## 5. 엔드포인트 상세

### 5.1 소환사 페이지 초기 진입

`GET /api/v1/summoners/{riotId}`

용도:

- 소환사 페이지 첫 진입 시 필요한 상단 데이터를 한 번에 조회
- 프로필, 시즌 기준 상단 요약만 포함
- 최근 전적과 챔피언 통계는 별도 API로 조회

서버 처리 흐름:

1. `riotId` 파싱
2. `account-v1` 조회
3. `account-v1 region` 조회
4. `summoner-v4` 조회
5. `league-v4`로 현재 랭크 조회
6. 시즌 요약 데이터 조회
7. 프론트 응답 형태로 가공

구현 메모:

- 내부 유저 식별 기준은 `puuid`
- `summoner-v4`는 프로필 아이콘/레벨 조회와 `league-v4` 호출용 `summonerId` 확보 용도로 사용
- `accountId`는 사용하거나 저장하지 않는다
- 현재 랭크는 `league-v4` 결과 중 노출 정책에 맞는 대표 랭크 1개만 응답한다
- `summoner.lastUpdatedAt`은 `last_profile_synced_at`, `last_match_synced_at`, `last_rank_synced_at` 중 가장 최신 시각을 기준으로 계산한다

응답 예시:

```json
{
  "summoner": {
    "riotId": "Hide on bush#KR1",
    "gameName": "Hide on bush",
    "tagLine": "KR1",
    "puuid": "xxxx",
    "platform": "kr",
    "regionalGroup": "asia",
    "profileIconId": 531,
    "summonerLevel": 531,
    "lastUpdatedAt": "2026-04-09T09:12:10.000Z"
  },
  "summary": {
    "rank": {
      "queueType": "RANKED_SOLO_5x5",
      "tier": "CHALLENGER",
      "division": "I",
      "leaguePoints": 1243,
      "wins": 100,
      "losses": 100
    },
    "seasonRecord": {
      "wins": 128,
      "losses": 97,
      "winRate": 57
    },
    "averageKda": {
      "kills": 8.4,
      "deaths": 3.9,
      "assists": 7.1,
      "ratio": 3.92
    },
    "primaryPosition": "MID",
    "mostPlayedChampion": {
      "championId": 103,
      "championName": "Ahri",
      "games": 34
    }
  }
}
```

### 5.2 최근 전적 목록 조회

`GET /api/v1/summoners/{riotId}/matches?cursor=0&count=20`

용도:

- 최근 전적 목록 조회
- 최초 진입 시 20개 조회
- `더보기` 클릭 시 20개씩 추가 조회
- 최대 조회 범위는 최근 2개월

응답 예시:

```json
{
  "items": [
    {
      "matchId": "KR_1234567890",
      "championId": 103,
      "championName": "Ahri",
      "queueId": 420,
      "queueLabel": "솔로 랭크",
      "result": "승리",
      "team": "blue",
      "position": "MID",
      "playedAt": "2026-04-09T08:58:00.000Z",
      "playedAtLabel": "12분 전",
      "gameDurationSeconds": 1754,
      "durationLabel": "29분 14초",
      "kills": 11,
      "deaths": 2,
      "assists": 9,
      "kdaRatio": 10,
      "killParticipation": 63,
      "level": 16,
      "cs": 232,
      "csPerMinute": 7.9,
      "items": [6655, 4645, 3157, 3089, 3020, 3363]
    }
  ],
  "page": {
    "cursor": 0,
    "count": 20,
    "nextCursor": 20,
    "hasNext": true
  },
  "filters": {
    "from": "2026-02-09T00:00:00.000Z",
    "to": "2026-04-09T23:59:59.999Z"
  }
}
```

구현 메모:

- Riot `match-v5 ids`의 `start`, `count`를 그대로 매핑하면 된다.
- `cursor`는 내부적으로 `start`와 동일하게 쓸 수 있다.
- 2개월 이전 매치는 `playedAt` 기준으로 제외한다.
- `hasNext`는 다음 20개가 존재하는지뿐 아니라, 그 다음 결과가 2개월 범위 안에 있는지도 같이 반영해야 한다.
- 이 API도 최초 조회에서 확보한 `puuid`와 실제 활성 플랫폼 기준으로 match host를 결정해야 한다.

### 5.3 시즌 챔피언 통계 조회

`GET /api/v1/summoners/{riotId}/champion-stats?season=2026`

용도:

- 이번 시즌 전체 개인 챔피언 통계 조회
- 최근 전적 기능과 분리된 독립 API

응답 예시:

```json
{
  "season": 2026,
  "queue": "ALL",
  "items": [
    {
      "championId": 103,
      "championName": "Ahri",
      "games": 34,
      "wins": 21,
      "losses": 13,
      "winRate": 62,
      "kills": 226,
      "deaths": 97,
      "assists": 244,
      "kdaRatio": 4.85,
      "avgCs": 211,
      "avgCsPerMinute": 7.6
    }
  ],
  "meta": {
    "basis": "season",
    "seasonStartAt": "2026-01-09T00:00:00.000Z"
  }
}
```

구현 메모:

- Riot API는 시즌 전체 챔피언 통계를 직접 주지 않으므로 자체 저장/집계가 필요하다.
- 집계 기준은 이번 시즌 시작일 이후 저장된 match 데이터다.
- `champion-mastery-v4`는 이 기능의 데이터 소스가 아니다.

### 5.4 매치 상세 조회

`GET /api/v1/matches/{matchId}`

용도:

- 매치 카드 펼침 시 상세 1건 조회
- 초기 목록 응답을 가볍게 유지

서버 처리 흐름:

1. `match-v5 detail` 조회
2. 필요 시에만 `timeline` 추가 조회
3. 유저 시점 참가자 찾기
4. 팀별 오브젝트/참가자 정보 가공

응답 예시:

```json
{
  "matchId": "KR_1234567890",
  "queueId": 420,
  "queueLabel": "솔로 랭크",
  "gameDurationSeconds": 1754,
  "durationLabel": "29분 14초",
  "userParticipantId": 4,
  "userTeam": "blue",
  "objectives": {
    "blue": {
      "totalKills": 30,
      "gold": 65200,
      "towers": 10,
      "inhibitors": 2,
      "dragons": 3,
      "barons": 1,
      "heralds": 1,
      "voidgrubs": 4
    },
    "red": {
      "totalKills": 16,
      "gold": 54100,
      "towers": 4,
      "inhibitors": 0,
      "dragons": 1,
      "barons": 0,
      "heralds": 0,
      "voidgrubs": 2
    }
  },
  "teams": {
    "blue": [
      {
        "participantId": 1,
        "puuid": "xxxx",
        "riotId": "Hide on bush#KR1",
        "championId": 103,
        "championName": "Ahri",
        "position": "MID",
        "kills": 11,
        "deaths": 2,
        "assists": 9,
        "kdaRatio": 10,
        "killParticipation": 63,
        "level": 16,
        "cs": 232,
        "gold": 14321,
        "items": [6655, 4645, 3157, 3089, 3020, 3363, 3340],
        "spells": [4, 14],
        "perks": {
          "primaryStyle": 8100,
          "subStyle": 8200,
          "selectedPerkIds": [8112, 8139, 8138, 8135, 8233, 8236]
        },
        "wards": {
          "placed": 9,
          "killed": 2,
          "controlPurchased": 1
        }
      }
    ],
    "red": []
  }
}
```

구현 메모:

- `wards`, `spells`, `perks`는 `match-v5 detail`만으로도 대부분 채울 수 있다.
- timeline은 MVP에서 필수는 아니다.
- gold 합산이나 오브젝트 일부는 `match-v5 detail.info.teams`, `participants`에서 계산 가능하다.

### 5.5 전적 갱신

`POST /api/v1/summoners/{riotId}/refresh`

용도:

- 사용자가 "전적 갱신" 버튼 클릭 시 최신 경기 동기화

응답 예시:

```json
{
  "refreshed": true,
  "updatedAt": "2026-04-09T09:14:22.000Z"
}
```

구현 메모:

- 이 API는 최근 매치뿐 아니라 현재 랭크도 함께 갱신한다.
- 챔피언 통계는 시즌 전체 기준으로 항상 정확해야 하므로, 시즌 범위 내 누락된 match 데이터는 모두 동기화해야 한다.
- DB가 있으면 시즌 범위의 누락 match 저장, 시즌 집계 갱신, 현재 랭크 upsert 후 응답한다.
- 별도 refresh 로그 테이블은 두지 않고, `last_profile_synced_at`, `last_match_synced_at`, `last_rank_synced_at`을 각각 갱신한다.
- 최근 전적 목록은 최근 2개월 범위만 노출하지만, 챔피언 통계 집계 기준은 시즌 전체 저장 데이터다.
- 따라서 이 API는 "최근 20개만 갱신"이 아니라 "시즌 범위 정합성을 유지하는 동기화"로 보는 것이 맞다.
- 프론트는 refresh 성공 후 `GET /api/v1/summoners/{riotId}`, `GET /api/v1/summoners/{riotId}/matches`, `GET /api/v1/summoners/{riotId}/champion-stats`를 다시 호출해 화면을 갱신한다.
- 이 API도 최초 조회에서 확보한 `puuid`와 실제 활성 플랫폼 기준으로 동기화 대상을 결정한다.

## 6. 권장 응답 모델

프론트에서 재사용하기 쉬운 공통 모델은 아래처럼 잡는 것이 좋다.

### 6.1 Summoner

```ts
type SummonerDto = {
  riotId: string
  gameName: string
  tagLine: string
  puuid: string
  platform: string
  regionalGroup: string
  profileIconId: number
  summonerLevel: number
  lastUpdatedAt: string
}
```

### 6.2 MatchSummary

```ts
type MatchSummaryDto = {
  matchId: string
  championId: number
  championName: string
  queueId: number
  queueLabel: string
  result: '승리' | '패배'
  team: 'blue' | 'red'
  position: string
  playedAt: string
  playedAtLabel: string
  gameDurationSeconds: number
  durationLabel: string
  kills: number
  deaths: number
  assists: number
  kdaRatio: number
  killParticipation: number
  level: number
  cs: number
  csPerMinute: number
  items: number[]
}
```

### 6.3 ChampionStat

```ts
type ChampionStatDto = {
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
  avgCs: number
  avgCsPerMinute: number
}
```

### 6.4 MatchDetailParticipant

```ts
type MatchDetailParticipantDto = {
  participantId: number
  puuid: string
  riotId: string | null
  championId: number
  championName: string
  position: string
  kills: number
  deaths: number
  assists: number
  kdaRatio: number
  killParticipation: number
  level: number
  cs: number
  gold: number
  items: number[]
  spells: number[]
  perks: {
    primaryStyle: number
    subStyle: number
    selectedPerkIds: number[]
  } | null
  wards: {
    placed: number
    killed: number
    controlPurchased: number
  }
}
```

## 7. Riot API 매핑

### 7.1 검색/프로필

- `account-v1/by-riot-id` -> `puuid`, `gameName`, `tagLine`
- `account-v1/region/by-game/lol/by-puuid` -> `platform`
- `summoner-v4/by-puuid` -> `profileIconId`, `summonerLevel`, `summonerId`

주의:

- `accountId`는 MVP에서 저장/사용하지 않는다
- 현재 MVP에서는 랭크 조회를 위해 `summonerId`를 `summoner_riot_id`로 저장한다

### 7.2 최근 전적

- `match-v5/matches/by-puuid/{puuid}/ids` -> match id 목록
- `match-v5/matches/{matchId}` -> 카드/상세 대부분

### 7.3 챔피언 통계

- MVP는 `이번 시즌 전체 match 데이터`를 서버에 저장한 뒤 집계
- `champion-mastery-v4`는 별도 탭이 있을 때 추가

즉, 현재 프론트의 Champion Stats는 숙련도 API가 아니라 시즌 기준 match 기반 개인 통계로 설계하는 게 맞다.

## 8. 프론트 타입과의 차이점

현재 `/Users/yu/dev/projects/lolgg-front/src/App.tsx`에는 화면 전용 mock 타입이 있다.

바로 바꾸면 좋은 부분:

1. `items: string[]` -> `items: number[]`
2. `champion: string` -> `championId + championName`
3. `playedAt: string` -> `playedAt + playedAtLabel`
4. `duration: string` -> `gameDurationSeconds + durationLabel`
5. `killParticipation: string` -> `number`

이렇게 해두면 프론트는 화면 문자열을 그대로 쓸 수도 있고, 필요하면 재포맷도 가능하다.

## 9. 에러 응답 규칙

권장 공통 에러 포맷:

```json
{
  "error": {
    "code": "SUMMONER_NOT_FOUND",
    "message": "해당 Riot ID의 소환사를 찾을 수 없습니다."
  }
}
```

MVP에서 최소한 아래 코드는 필요하다.

- `INVALID_RIOT_ID`
- `SUMMONER_NOT_FOUND`
- `RIOT_RATE_LIMITED`
- `RIOT_API_UNAVAILABLE`
- `MATCH_NOT_FOUND`

## 10. 최종 권장안

MVP는 아래 방식이 가장 안전하다.

1. 소환사 페이지 진입용 종합 API 1개
2. 최근 전적 목록 페이징 API 1개
3. 시즌 챔피언 통계 API 1개
4. 매치 상세 API 1개
5. 전적 갱신 API 1개

그리고 데이터 기준은 이렇게 잡는 것이 맞다.

- 검색 기준 식별자: `Riot ID`
- 서버 선택 UI: `없음`
- 플랫폼 결정 기준: `백엔드가 Riot ID -> puuid -> active platform 순으로 해석`
- 최근 전적 기준: `최근 2개월, 초기 20개 + 더보기 20개`
- 챔피언 통계 기준: `이번 시즌 전체 개인 집계`
- 매치 상세 기준 데이터: `match-v5 detail`
- timeline: 선택적 확장

이 구조면 현재 프론트 mock 화면을 거의 그대로 실제 API 연동 형태로 전환할 수 있다.
