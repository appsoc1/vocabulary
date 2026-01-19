@echo off
echo ===================================================
echo DONEG BO CO DE LEN GITHUB
echo ===================================================

echo 1. Dang them file thay doi (git add)...
"C:\Program Files\Git\cmd\git.exe" add .

echo 2. Dang luu file (git commit)...
"C:\Program Files\Git\cmd\git.exe" commit -m "Update: Optimize Database + Fix Mobile Responsive"

echo 3. Dang day len mang (git push)...
echo (Vui long dang nhap neu duoc hoi)
"C:\Program Files\Git\cmd\git.exe" push origin main

echo.
echo ===================================================
echo XONG! Hay kiem tra Vercel.
echo ===================================================
pause
