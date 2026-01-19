# THIẾT KẾ HỆ THỐNG HỌC TỪ VỰNG - CHI TIẾT LOGIC & THUẬT TOÁN

---

## 1. CẤU TRÚC DỮ LIỆU

### 1.1. Card (Nội dung học)
| Trường | Mô tả |
|--------|-------|
| id | Định danh |
| type | `word` hoặc `sentence` |
| english | Từ/câu tiếng Anh |
| meaning | Nghĩa tiếng Việt |
| video_url | Link video chứa từ |
| folder_id | Thuộc folder nào |
| keyword | Chỉ dùng cho sentence - từ cần che |

### 1.2. UserProgress (Tiến trình từng user với từng card)
| Trường | Mô tả | Giá trị khởi tạo |
|--------|-------|------------------|
| due_at | Thời điểm cần ôn tiếp | now |
| interval | Khoảng cách ôn (ngày) | 0 |
| ease | Hệ số dễ/khó | 2.3 |
| reps | Số lần nhớ liên tiếp | 0 |
| lapses | Số lần quên | 0 |
| state | Trạng thái | `new` |

**Các state:**
- `new`: Chưa học
- `learning`: Đang học (mới hoặc vừa quên)
- `review`: Đã thuộc, đang ôn định kỳ

---

## 2. THUẬT TOÁN LÕI (SRS - Spaced Repetition)

### 2.1. Khi người dùng bấm QUÊN

```
lapses = lapses + 1
reps = 0
state = "learning"
ease = max(1.3, ease - 0.2)
interval = 0
due_at = now + 10 phút
```

**Giải thích:**
- Giảm ease → lần sau nhớ cũng tăng interval chậm hơn
- Reset reps về 0 → phải nhớ lại từ đầu
- due_at rất gần → gặp lại ngay trong phiên

### 2.2. Khi người dùng bấm NHỚ

```
reps = reps + 1
ease = min(2.8, ease + 0.05)

NẾU state = "new" hoặc "learning":
    NẾU reps = 1: interval = 1 ngày
    NẾU reps = 2: interval = 3 ngày
    NẾU reps >= 3: interval = interval × ease
    state = "review"

NẾU state = "review":
    interval = interval × ease

due_at = now + interval
```

**Ví dụ tiến trình 1 từ nhớ tốt:**
| Lần | reps | interval | due_at |
|-----|------|----------|--------|
| 1 | 1 | 1 ngày | +1 ngày |
| 2 | 2 | 3 ngày | +3 ngày |
| 3 | 3 | 7 ngày | +7 ngày |
| 4 | 4 | 16 ngày | +16 ngày |
| 5 | 5 | 37 ngày | +37 ngày |

**Ví dụ từ hay quên (ease giảm còn 1.5):**
| Lần | interval |
|-----|----------|
| 3 | 4.5 ngày |
| 4 | 6.7 ngày |
| 5 | 10 ngày |

→ Từ khó tăng chậm hơn, gặp nhiều hơn.

---

## 3. LOGIC CHỌN CARD TIẾP THEO

### 3.1. Tạo hàng đợi ôn (mỗi khi user bắt đầu phiên)

**Bước 1:** Lấy tất cả card từ các folder user chọn

**Bước 2:** Phân loại và sắp xếp theo thứ tự ưu tiên

```
Ưu tiên 1: state = "learning" VÀ due_at <= now
           → Sắp theo due_at tăng dần

Ưu tiên 2: state = "review" VÀ due_at <= now
           → Sắp theo due_at tăng dần (quá hạn lâu lên trước)

Ưu tiên 3: state = "new"
           → Sắp theo thứ tự nhập hoặc random
```

### 3.2. Lấy card tiếp theo

```
1. Nếu còn card ưu tiên 1 → lấy card đầu tiên
2. Nếu hết → lấy từ ưu tiên 2
3. Nếu hết → lấy từ ưu tiên 3 (giới hạn 20 từ mới/ngày)
4. Nếu hết tất cả → thông báo "Hoàn thành"
```

### 3.3. Tránh lặp liền (khi bấm Quên)

Khi user bấm Quên, card đó cần gặp lại sớm nhưng không được ngay lập tức:

```
Đặt: skip_count = 5
Nghĩa là: phải qua 5 card khác trước khi card này được phép xuất hiện lại
```

Cách thực hiện: đánh dấu vị trí tối thiểu card đó được phép xuất hiện.

---

## 4. LOGIC HIỂN THỊ VÀ CHE

### 4.1. Với từ đơn (type = word)

**Bước 1: Chọn vị trí che**
```
Lấy danh sách vị trí các ký tự chữ cái (bỏ qua khoảng trắng, dấu)
NẾU độ dài từ <= 4: chọn random 1 vị trí
NẾU độ dài từ > 4: chọn random 2 vị trí không liền nhau
```

**Bước 2: Hiển thị**
```
Thay ký tự tại vị trí đã chọn bằng "_"
Ví dụ: "remember" → "re_emb_r"
```

### 4.2. Với câu (type = sentence)

**Hiển thị:** Thay keyword bằng dấu gạch ngang

```
Ví dụ:
- Câu: "I will take off my jacket"
- Keyword: "take off"
- Hiển thị: "I will ____ ____ my jacket"
```

Quy tắc tạo gạch: mỗi từ trong keyword → một cụm "____"

### 4.3. Flow màn hình ôn tập

```
Bước 1: Hiển thị câu/từ đã che + KHÔNG hiện nghĩa
Bước 2: User bấm "Hiện đáp án"
Bước 3: Hiển thị đầy đủ: từ gốc + nghĩa + nút xem video
Bước 4: User bấm "Nhớ" hoặc "Quên"
Bước 5: Cập nhật progress → chuyển card tiếp theo
```

---

## 5. XÁC ĐỊNH TỪ "ĐÃ THUỘC" (GIẢM XUẤT HIỆN MẠNH)

Điều kiện từ được coi là "thuộc chắc":
```
interval >= 30 ngày VÀ lapses <= 2
```

Với các từ này:
- Vẫn giữ trong hệ thống
- Chỉ xuất hiện khi đến due_at (rất thưa)
- Có thể tạo filter riêng để user xem lại

---

## 6. XỬ LÝ ÔN GỘP NHIỀU FOLDER

Khi user chọn nhiều folder (ví dụ: Folder A + Folder B + Folder C):

```
1. Gộp tất cả card từ các folder đã chọn
2. Áp dụng cùng logic sắp xếp ưu tiên (mục 3.1)
3. Card nào due_at sớm hơn → lên trước (không phân biệt folder)
```

Kết quả: Từ khó của tất cả folder sẽ tự động nổi lên, không bị "chìm" trong folder riêng.

---

## 7. CÔNG THỨC TÓM TẮT

### Từ xuất hiện NHIỀU khi:
- `lapses` cao (hay quên)
- `ease` thấp (khó)
- `interval` ngắn
- `state = learning`

### Từ xuất hiện ÍT khi:
- `reps` cao (nhớ nhiều lần liên tiếp)
- `ease` cao (dễ)
- `interval` dài (30+ ngày)
- `state = review` với due_at xa

---

## 8. GIỚI HẠN VÀ THÔNG SỐ

| Thông số | Giá trị | Lý do |
|----------|---------|-------|
| ease khởi tạo | 2.3 | Chuẩn SM-2 |
| ease tối thiểu | 1.3 | Tránh interval tăng quá chậm |
| ease tối đa | 2.8 | Tránh interval nhảy quá nhanh |
| Giảm ease khi quên | -0.2 | Đủ phạt nhưng không quá nặng |
| Tăng ease khi nhớ | +0.05 | Tăng từ từ, ổn định |
| Từ mới/ngày | 20 | Tránh quá tải |
| Skip sau khi quên | 5 card | Tránh lặp liền gây khó chịu |
| Gặp lại sau quên | 10 phút | Đủ ngắn để nhớ lại |

---

## 9. TRẠNG THÁI CHUYỂN ĐỔI

```
[new] ---(bấm Nhớ)---> [review]
[new] ---(bấm Quên)---> [learning]

[learning] ---(bấm Nhớ)---> [review]
[learning] ---(bấm Quên)---> [learning] (reset)

[review] ---(bấm Nhớ)---> [review] (interval tăng)
[review] ---(bấm Quên)---> [learning] (reset về gần)
```

---

## 10. VÍ DỤ MINH HỌA THUẬT TOÁN

**Tình huống:** User có 3 từ A, B, C

| Từ | State | due_at | interval |
|----|-------|--------|----------|
| A | learning | now - 5 phút | 0 |
| B | review | now - 2 ngày | 7 |
| C | new | - | 0 |

**Thứ tự hiển thị:** A → B → C

**User bấm Quên từ A:**
- A được đặt due_at = now + 10 phút
- A phải đợi qua 5 card khác

**Tiếp theo hiển thị:** B → C → (card khác nếu có) → A quay lại

---

Đây là toàn bộ logic và thuật toán. Không cần thêm gì khác để bắt đầu phát triển.
