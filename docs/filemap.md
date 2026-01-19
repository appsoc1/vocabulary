# CẬP NHẬT - DÙNG DATABASE

---

## CHỌN DATABASE

| Lựa chọn | Ưu điểm | Phù hợp |
|----------|---------|---------|
| **Supabase** | Free, PostgreSQL hosted, có Auth sẵn | ✅ Khuyến nghị |
| PlanetScale | MySQL serverless | Tốt |
| MongoDB Atlas | NoSQL, free tier | Được |

→ **Dùng Supabase** (PostgreSQL) - sau này cần login thì có sẵn Auth.

---

## FILE MAP (CẬP NHẬT)

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── input/
│   │   ├── word/
│   │   │   └── page.tsx
│   │   └── sentence/
│   │       └── page.tsx
│   │
│   ├── review/
│   │   └── page.tsx
│   │
│   ├── folders/
│   │   └── page.tsx
│   │
│   └── api/                        # API routes
│       ├── cards/
│       │   └── route.ts            # GET, POST cards
│       ├── progress/
│       │   └── route.ts            # GET, PUT progress
│       └── folders/
│           └── route.ts            # GET, POST, DELETE folders
│
├── components/
│   ├── CardDisplay.tsx
│   ├── ReviewControls.tsx
│   ├── FolderSelector.tsx
│   ├── InputForm.tsx
│   └── ProgressBar.tsx
│
├── lib/
│   ├── srs/
│   │   ├── algorithm.ts
│   │   ├── queue.ts
│   │   └── masking.ts
│   │
│   ├── db/
│   │   ├── index.ts                # Supabase client
│   │   ├── cards.ts                # CRUD cards
│   │   ├── progress.ts             # CRUD progress
│   │   └── folders.ts              # CRUD folders
│   │
│   └── utils.ts
│
├── hooks/
│   ├── useReview.ts
│   ├── useCards.ts
│   └── useFolders.ts
│
└── types/
    └── index.ts
```

---

## DATABASE SCHEMA (Supabase/PostgreSQL)

### Bảng `folders`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | uuid | Primary key |
| name | text | Tên folder |
| created_at | timestamp | Ngày tạo |

### Bảng `cards`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | uuid | Primary key |
| type | text | `word` hoặc `sentence` |
| english | text | Từ/câu tiếng Anh |
| meaning | text | Nghĩa |
| video_url | text | Link video |
| folder_id | uuid | Foreign key → folders |
| keyword | text | Nullable, chỉ cho sentence |
| created_at | timestamp | Ngày tạo |

### Bảng `progress`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | uuid | Primary key |
| card_id | uuid | Foreign key → cards |
| due_at | timestamp | Thời điểm cần ôn |
| interval | float | Khoảng cách (ngày) |
| ease | float | Hệ số dễ/khó |
| reps | int | Số lần nhớ liên tiếp |
| lapses | int | Số lần quên |
| state | text | `new`, `learning`, `review` |

---

## LUỒNG DỮ LIỆU (CẬP NHẬT)

```
Client (React)
     ↓ fetch
API Routes (/api/*)
     ↓ query
lib/db/* (Supabase client)
     ↓
Supabase PostgreSQL
```

---

## SO SÁNH THAY ĐỔI

| Trước (localStorage) | Sau (Supabase) |
|----------------------|----------------|
| `lib/storage/localStorage.ts` | `lib/db/index.ts` + `cards.ts` + `progress.ts` |
| Không có `/api` | Có `/api/cards`, `/api/progress`, `/api/folders` |
| Data mất khi đổi máy | Data lưu cloud, truy cập mọi nơi |

---

## TÓM TẮT

- **Database:** Supabase (PostgreSQL)
- **3 bảng:** folders, cards, progress
- **3 API routes:** xử lý CRUD
- **`lib/db/`:** Supabase client + query functions

Tổng: **~22 files** - sẵn sàng cho web online.
