# Hướng dẫn Deploy lên Vercel

Dự án này đã sẵn sàng để deploy lên Vercel (kết nối với Supabase Database).

## Bước 1: Chuẩn bị Code
1.  Nếu chưa có git, hãy chạy lệnh sau trong terminal:
    ```bash
    git init
    git add .
    git commit -m "Ready for deploy"
    ```
2.  Tạo một repository mới trên [GitHub](https://github.com/new).
3.  Push code lên GitHub:
    ```bash
    git remote add origin https://github.com/USERNAME/REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

## Bước 2: Deploy trên Vercel
1.  Truy cập [Vercel Dashboard](https://vercel.com/dashboard).
2.  Bấm **Add New...** -> **Project**.
3.  Chọn repository Git bạn vừa push lên (Bấm **Import**).

## Bước 3: Cấu hình Environment Variables (Quan trọng)
Trong màn hình "Configure Project", mục **Environment Variables**, bạn cần thêm 2 dòng này (lấy từ `.env.local` của bạn):

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ideodzdzhqveqnupozjz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` (lấy key dài của bạn) |

> **Lưu ý:** Nếu không nhập 2 biến này, App sẽ không thể kết nối Database và sẽ báo lỗi khi chạy.

## Bước 4: Hoàn tất
1.  Bấm **Deploy**.
2.  Chờ khoảng 1-2 phút để Vercel build xong.
3.  Khi thấy màn hình pháo hoa chúc mừng là xong! 🚀
