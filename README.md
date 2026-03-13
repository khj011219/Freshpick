# Freshpick

**냉장고 재료를 관리하고, 임박 재료를 활용한 레시피를 추천받는 모바일 웹 앱**

> Reduce waste, eat better.

---

## 주요 기능

### 냉장고 관리 (Fridge)
- 재료 추가: 이름, 수량, 단위, 유통기한, 카테고리 입력
- 유통기한 오름차순 정렬로 임박 재료 우선 확인
- 재료 삭제

### 레시피 추천 (Recipes)
- 보유 재료 기반 추천 점수 자동 계산
- 유통기한 임박 재료(3일 이내)가 포함된 레시피 우선 추천
- 재료 충족률(%) 표시

### 레시피 상세
- 보유 / 임박 / 부족 재료 현황 한눈에 확인
- 핵심 재료 미보유 시 경고 표시
- 부족 재료 목록 및 조리 순서 제공
- AI 추천 설명 텍스트 자동 생성

### 관리자 전용
- 레시피 추가 (`/recipes/new`): Supabase `app_metadata.role === 'admin'` 권한 확인
- 레시피 편집 (`/recipes/[id]/edit`)

### 인증
- 이메일/비밀번호 로그인 및 회원가입 (Supabase Auth)
- 로그인 상태에 따라 본인 재료만 접근 (RLS 적용)

---

## 추천 점수 계산

```
점수 = matchScore + expiryScore - penalty

matchScore  = (보유 재료 수 / 전체 재료 수) × 40  (최대 40점)
expiryScore = 임박 재료 포함 시 40점, 없으면 0점
penalty     = 핵심 재료 미보유 개수 × 20점
```

점수 범위: 0 ~ 80점 (최솟값 0으로 클램프)

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| 애니메이션 | Motion (Framer Motion) |
| 아이콘 | Lucide React |
| 백엔드/DB | Supabase (PostgreSQL + Auth + RLS) |
| 언어 | TypeScript |

---

## 프로젝트 구조

```
Freshpick/
├── app/
│   ├── page.tsx                  # 메인 앱 (탭 라우팅, 세션 관리)
│   ├── layout.tsx
│   ├── recipes/
│   │   ├── [id]/
│   │   │   ├── page.tsx          # 레시피 상세
│   │   │   ├── edit/page.tsx     # 레시피 편집 (관리자)
│   │   │   └── loading.tsx
│   │   └── new/page.tsx          # 레시피 추가 (관리자)
│   └── test/page.tsx             # Supabase CRUD 테스트용
├── components/
│   ├── HomeTab.tsx               # 홈 탭
│   ├── IngredientsTab.tsx        # 냉장고 탭
│   ├── RecipesTab.tsx            # 레시피 탭
│   ├── RecipeCard.tsx            # 레시피 카드
│   ├── AddIngredientModal.tsx    # 재료 추가 모달 (bottom sheet)
│   ├── LoginScreen.tsx           # 로그인/회원가입 화면
│   ├── NavBar.tsx                # 하단 탭 네비게이션
│   ├── TabButton.tsx
│   └── StatusBadge.tsx           # 재료 상태 뱃지 (보유/임박/없음)
├── lib/
│   ├── supabase.ts               # Supabase 클라이언트 (브라우저)
│   └── supabase/server.ts        # Supabase 클라이언트 (서버)
└── types.ts                      # 공통 타입 정의
```

---

## 데이터베이스 스키마

### `ingredients`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | 사용자 ID (RLS 기준) |
| name | text | 재료명 |
| quantity | numeric | 수량 |
| unit | text | 단위 (pcs, g, kg, ml, L) |
| expire_date | date | 유통기한 |
| category | text | 카테고리 (Produce, Dairy, Meat, Pantry, Other) |

### `recipes`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| title | text | 레시피 이름 |
| description | text | 설명 |
| image_url | text | 이미지 URL |
| steps | text[] | 조리 단계 배열 |

### `recipe_ingredients`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| recipe_id | uuid | FK → recipes.id |
| ingredient_name | text | 재료명 |
| quantity | numeric | 수량 |
| unit | text | 단위 |
| is_essential | boolean | 핵심 재료 여부 |

---

## 시작하기

### 사전 요구사항
- Node.js 18+
- Supabase 프로젝트 (테이블 및 RLS 설정 필요)

### 환경 변수 설정

`.env.local` 파일을 생성하고 아래 값을 입력합니다:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 빌드

```bash
npm run build
npm run start
```

---

## 관리자 권한 설정

Supabase Dashboard → Authentication → Users → 해당 유저 → `app_metadata` 에 아래 값 추가:

```json
{ "role": "admin" }
```

관리자는 레시피 추가(`/recipes/new`) 및 편집(`/recipes/[id]/edit`) 페이지에 접근할 수 있습니다.

---

## 보안

- Supabase RLS(Row Level Security)를 적용하여 사용자는 본인의 `ingredients` 데이터만 접근 가능
- `recipes` / `recipe_ingredients`는 모든 로그인 사용자가 읽기 가능, 쓰기는 관리자 역할로만 허용
- 관리자 전용 페이지는 클라이언트에서도 `app_metadata.role` 검증 후 비관리자는 `/`로 리다이렉트
