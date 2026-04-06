# Analisa Mendalam & Rencana Implementasi LMS-Course

## Ringkasan Proyek

Proyek LMS-Course berada di `//wsl.localhost/Ubuntu/home/nabil/projects/dewafila/LMS-Course/`. Tech stack: **Laravel + Inertia.js + React (JSX) + Tailwind CSS**. Menggunakan role-based access control (admin, mentor, student).

---

## Status Implementasi Saat Ini

### ✅ SUDAH SELESAI (Functional)

| Komponen | Detail | File |
|---|---|---|
| **Database Schema** | 19 tabel lengkap (courses, sections, lessons, quizzes, enrollments, certificates, transactions, mentor_earnings, dll) | [create_lms_tables.php](file://wsl.localhost/Ubuntu/home/nabil/projects/dewafila/LMS-Course/database/migrations/2026_03_05_090720_create_lms_tables.php) |
| **20 Eloquent Models** | Semua model dengan relasi lengkap | `app/Models/` |
| **Role Middleware** | admin, mentor, student | [RoleMiddleware.php](file://wsl.localhost/Ubuntu/home/nabil/projects/dewafila/LMS-Course/app/Http/Middleware/RoleMiddleware.php) |
| **Student: Enroll** | Bypass payment, langsung enroll | [CourseController.php](file://wsl.localhost/Ubuntu/home/nabil/projects/dewafila/LMS-Course/app/Http/Controllers/Student/CourseController.php) |
| **Student: Learn** | Player halaman belajar dengan sidebar materi | [Learn.jsx](file://wsl.localhost/Ubuntu/home/nabil/projects/dewafila/LMS-Course/resources/js/Pages/Learn.jsx) |
| **Student: Complete Lesson** | Tandai lesson selesai | `CourseController@completeLesson` |
| **Student: Play Quiz** | Kerjakan kuis multiple choice | [QuizPlayer.jsx](file://wsl.localhost/Ubuntu/home/nabil/projects/dewafila/LMS-Course/resources/js/Pages/QuizPlayer.jsx) |
| **Student: Submit Quiz** | Hitung skor & simpan jawaban | `CourseController@submitQuiz` |
| **Mentor: Course CRUD** | Buat, edit, hapus course | [CourseBuilderController.php](file://wsl.localhost/Ubuntu/home/nabil/projects/dewafila/LMS-Course/app/Http/Controllers/Mentor/CourseBuilderController.php) |
| **Mentor: Section CRUD** | Tambah section/modul ke course | `CourseBuilderController@storeSection` |
| **Mentor: Lesson CRUD** | Tambah lesson ke section | `CourseBuilderController@storeLesson` |
| **Mentor: Quiz CRUD** | Tambah quiz ke section | `CourseBuilderController@storeQuiz` |
| **Mentor: Lesson Editor** | Edit konten video/artikel | [LessonEditor.jsx](file://wsl.localhost/Ubuntu/home/nabil/projects/dewafila/LMS-Course/resources/js/Pages/Mentor/CourseBuilder/LessonEditor.jsx) |
| **Mentor: Quiz Editor** | Edit soal & pilihan jawaban | [QuizEditor.jsx](file://wsl.localhost/Ubuntu/home/nabil/projects/dewafila/LMS-Course/resources/js/Pages/Mentor/CourseBuilder/QuizEditor.jsx) |
| **Frontend: Home** | Landing page | [Home.jsx](file://wsl.localhost/Ubuntu/home/nabil/projects/dewafila/LMS-Course/resources/js/Pages/Home.jsx) |
| **Frontend: Catalog** | Browse semua course | [Catalog.jsx](file://wsl.localhost/Ubuntu/home/nabil/projects/dewafila/LMS-Course/resources/js/Pages/Catalog.jsx) |
| **Frontend: Course Detail** | Detail course sebelum enroll | [CourseDetail.jsx](file://wsl.localhost/Ubuntu/home/nabil/projects/dewafila/LMS-Course/resources/js/Pages/CourseDetail.jsx) |
| **Layouts** | AuthenticatedLayout, DashboardLayout, GuestLayout | `resources/js/Layouts/` |

---

### ❌ BELUM DIIMPLEMENTASI (Placeholder / Kosong)

Berikut halaman dan fitur yang **sudah ada route-nya tapi isinya masih placeholder** atau **belum ada controller logic-nya sama sekali**:

#### 1. Admin Panel (5 halaman placeholder)

| Halaman | Status | Yang Perlu Dibuat |
|---|---|---|
| Admin/Analytics | Placeholder | Controller + Chart data (total user, revenue, enrollment trend) |
| Admin/Categories | Placeholder | CRUD Categories (Create, Edit, Delete) |
| Admin/Courses | Placeholder | Tabel semua course, approve/reject, featured |
| Admin/Users | Placeholder | Tabel user, ganti role, ban/unban |
| Admin/Transactions | Placeholder | Tabel transaksi, filter status, export |

#### 2. Mentor Dashboard (3 halaman placeholder)

| Halaman | Status | Yang Perlu Dibuat |
|---|---|---|
| Mentor/Students | Placeholder | Daftar student yang enrolled di course mentor |
| Mentor/Earnings | Placeholder | Riwayat pendapatan per transaksi |
| Mentor/Withdrawals | Placeholder | Request & riwayat penarikan dana |

#### 3. Student Dashboard (2 halaman placeholder)

| Halaman | Status | Yang Perlu Dibuat |
|---|---|---|
| Dashboard/Certificates | Placeholder | Daftar sertifikat yang sudah didapat |
| Dashboard/Achievements | Placeholder | Badge / pencapaian student |

#### 4. Fitur Backend yang Belum Ada Logic

| Fitur | Model Ada? | Controller Ada? | Yang Perlu Dibuat |
|---|---|---|---|
| **Payment Gateway** | ✅ Transaction | ❌ | Controller integrasi Midtrans/Xendit, webhook handler |
| **Certificate Generation** | ✅ Certificate + Template | ❌ | Controller generate PDF, auto-issue setelah course selesai |
| **Mentor Earnings** | ✅ MentorEarning | ❌ | Logic split revenue setelah payment success |
| **Mentor Withdrawals** | ✅ MentorWithdrawal | ❌ | Request withdrawal + admin approval flow |
| **Submission Review** | ✅ Submission | ❌ | Mentor review submission, beri feedback & skor |
| **Course Completion** | ✅ Enrollment (completed_at) | ❌ | Auto-detect semua lesson + quiz selesai → update status |
| **Catalog Filter/Search** | - | ❌ | Backend API untuk filter category, price, level, search |

---

## Proposed Changes (Rencana Implementasi)

Implementasi dibagi menjadi **4 fase** berdasarkan prioritas dan dependensi:

---

### Fase 1: Admin CRUD & Mentor Dashboard (Fondasi)

> [!IMPORTANT]
> Fase ini harus selesai duluan karena menjadi dasar operasional platform.

#### [NEW] `app/Http/Controllers/Admin/CategoryController.php`
- CRUD categories (index, store, update, destroy)
- Validasi name + slug unique

#### [MODIFY] `resources/js/Pages/Admin/Categories.jsx`
- Tabel dengan search, create modal, edit inline, delete confirmation

#### [NEW] `app/Http/Controllers/Admin/CourseManagementController.php`
- List semua course, filter by status/category/mentor
- Approve/reject course, toggle featured

#### [MODIFY] `resources/js/Pages/Admin/Courses.jsx`
- Tabel course dengan filter, action buttons

#### [NEW] `app/Http/Controllers/Admin/UserManagementController.php`
- List users, change role, ban/unban

#### [MODIFY] `resources/js/Pages/Admin/Users.jsx`
- Tabel user dengan role badge, action dropdown

#### [NEW] `app/Http/Controllers/Admin/TransactionController.php`
- List transaksi, filter by status dan date range

#### [MODIFY] `resources/js/Pages/Admin/Transactions.jsx`
- Tabel transaksi dengan filter

#### [NEW] `app/Http/Controllers/Mentor/StudentController.php`
- List students enrolled di course milik mentor
- Lihat progress per student

#### [MODIFY] `resources/js/Pages/Mentor/Students.jsx`
- Tabel student + progress bar

---

### Fase 2: Payment & Enrollment Flow

#### [NEW] `app/Http/Controllers/Payment/TransactionController.php`
- Buat transaksi pending
- Redirect ke payment gateway (Midtrans Snap / Xendit Invoice)
- Webhook handler: update status → auto enroll

#### [MODIFY] `app/Http/Controllers/Student/CourseController.php`
- Ubah `enroll()` dari bypass menjadi redirect ke payment flow (jika course berbayar)

#### [NEW] `app/Http/Controllers/Mentor/EarningController.php`
- Hitung platform_fee dan net_earning setelah payment success
- List riwayat earnings

#### [MODIFY] `resources/js/Pages/Mentor/Earnings.jsx`
- Tabel earnings dengan total balance

#### [NEW] `app/Http/Controllers/Mentor/WithdrawalController.php`
- Request withdrawal, admin approval flow

#### [MODIFY] `resources/js/Pages/Mentor/Withdrawals.jsx`
- Form request + riwayat withdrawal

---

### Fase 3: Certificate & Course Completion

#### [NEW] `app/Services/CourseCompletionService.php`
- Logic cek apakah semua lesson + required quiz sudah selesai
- Auto-update enrollment status ke "completed"
- Trigger certificate generation jika `is_certified = true`

#### [NEW] `app/Services/CertificateService.php`
- Generate PDF sertifikat menggunakan template
- Simpan ke storage, update Certificate model

#### [MODIFY] `resources/js/Pages/Dashboard/Certificates.jsx`
- List sertifikat + tombol download PDF

#### [NEW] `app/Http/Controllers/Admin/CertificateTemplateController.php`
- CRUD template sertifikat (upload background, atur layout)

---

### Fase 4: Analytics & Submission Review

#### [NEW] `app/Http/Controllers/Admin/AnalyticsController.php`
- Total users, courses, revenue, enrollment trends
- Chart data untuk frontend

#### [MODIFY] `resources/js/Pages/Admin/Analytics.jsx`
- Dashboard charts (line chart enrollment trend, bar chart revenue, pie chart categories)

#### [NEW] `app/Http/Controllers/Mentor/SubmissionController.php`
- List submissions pending review
- Beri score + feedback

#### [NEW] `resources/js/Pages/Mentor/Submissions.jsx`
- Review interface untuk submission type quiz

#### [MODIFY] `resources/js/Pages/Dashboard/Achievements.jsx`
- Badge system (first course completed, 5 courses, perfect quiz score, dll)

---

## Verification Plan

### Automated Tests
- `php artisan test` untuk memastikan tidak ada regression
- Manual test setiap fase di browser

### Manual Verification
- Test payment flow end-to-end (sandbox mode)
- Test certificate generation
- Verify role-based access untuk semua halaman
