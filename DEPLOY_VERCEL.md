# Hướng dẫn Deploy lên Vercel

Tôi đã cài đặt Git và chuẩn bị xong mã nguồn cho bạn. Do cần đăng nhập bảo mật, bạn hãy làm theo các bước đơn giản sau:

## Bước 1: Đẩy code lên GitHub
1. Vào **[github.com/new](https://github.com/new)** và tạo một Repository mới (đặt tên là `english-srs` hoặc tùy ý).
2. Sau khi tạo, **copy đường dẫn (URL)** của repo (ví dụ: `https://github.com/username/english-srs.git`).
3. Quay lại thư mục này, chạy file **`push_to_github.bat`** (tôi vừa tạo).
4. Dán URL vào và làm theo hướng dẫn trên màn hình.

## Bước 2: Deploy lên Vercel
1. Vào **[vercel.com/new](https://vercel.com/new)**.
2. Chọn **"Import"** repository bạn vừa đẩy lên.
3. Trong phần **Environment Variables**, thêm 2 dòng sau (lấy từ Supabase):
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://xxxxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJ...`
4. Ấn **Deploy**.

## Bước 3: Hoàn tất
Sau khi deploy xong, bạn sẽ có link `https://english-srs.vercel.app` để dùng trên mọi thiết bị!
