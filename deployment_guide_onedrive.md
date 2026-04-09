# Panduan Deployment: Job Queue & Cronjob

Untuk menjalankan upload video di latar belakang (Background Job), server Bapak perlu menjalankan proses "Queue Worker". Berikut adalah cara pengaturannya di berbagai jenis hosting:

## 1. Pengaturan Cronjob (Hosting Biasa/Shared Hosting)
Jika Bapak menggunakan **cPanel** atau hosting yang memiliki fitur Cronjob, tambahkan perintah berikut agar Laravel bisa mengecek jadwal tugas (Scheduler):

Perintah Cron (Jalankan setiap menit):
```bash
* * * * * cd /path-ke-proyek-bapak && php artisan schedule:run >> /dev/null 2>&1
```

Khusus untuk **Queue (Antrian)**, jika Bapak tidak punya akses ke Terminal/SSH terus-menerus, Bapak bisa menambahkan satu lagi Cronjob untuk menjalankan worker:
```bash
* * * * * cd /path-ke-proyek-bapak && php artisan queue:work --stop-when-empty >> /dev/null 2>&1
```

---

## 2. Pengaturan Supervisor (VPS/Dedicated Server)
Ini adalah cara yang **paling direkomendasikan** agar antrian selalu berjalan otomatis dan segera diproses begitu ada upload.

1. Install Supervisor di server (Ubuntu/Debian):
   ```bash
   sudo apt-get install supervisor
   ```

2. Buat file konfigurasi baru `/etc/supervisor/conf.d/laravel-worker.conf`:
   ```ini
   [program:laravel-worker]
   process_name=%(program_name)s_%(process_num)02d
   command=php /path-ke-proyek-bapak/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
   autostart=true
   autorestart=true
   stopasgroup=true
   killasgroup=true
   user=www-data
   numprocs=2
   redirect_stderr=true
   stdout_logfile=/path-ke-proyek-bapak/storage/logs/worker.log
   stopwaitsecs=3600
   ```

3. Jalankan Supervisor:
   ```bash
   sudo supervisorctl reread
   sudo supervisorctl update
   sudo supervisorctl start laravel-worker:*
   ```

---

## 3. Monitoring Antrian
Bapak bisa mengecek apakah antrian berjalan atau tidak dengan melihat tabel `jobs` di database Bapak:
- Jika tabel `jobs` ada isinya, berarti ada upload yang sedang mengantri.
- Jika tabel `jobs` kosong dan video sudah muncul di OneDrive, berarti proses berhasil.
- Jika ada error, silakan cek file `storage/logs/laravel.log`.

---

## 4. Persiapan Folder Storage
Pastikan folder berikut memiliki izin tulis (writable):
- `storage/app/temp_videos` (Akan otomatis dibuat saat upload pertama).

> [!TIP]
> Di Linux, bapak bisa jalankan command ini jika terjadi error permission:
> `chmod -R 775 storage bootstrap/cache`
