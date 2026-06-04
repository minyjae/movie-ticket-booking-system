# คู่มือ Frontend — CINEBOOK

เอกสารนี้อธิบายโครงสร้างโปรเจค, library, framework ทุกตัวที่ใช้, และอธิบายโค้ดทุกส่วนอย่างละเอียด เหมาะสำหรับผู้ที่เริ่มต้นหรือต้องการทำความเข้าใจระบบนี้ในเชิงลึก

---

## สารบัญ

1. [ภาพรวมโปรเจค](#1-ภาพรวมโปรเจค)
2. [โครงสร้างโฟลเดอร์](#2-โครงสร้างโฟลเดอร์)
3. [Angular Framework](#3-angular-framework)
4. [TypeScript](#4-typescript)
5. [Tailwind CSS](#5-tailwind-css)
6. [RxJS](#6-rxjs)
7. [Angular Router (ระบบเปลี่ยนหน้า)](#7-angular-router)
8. [HttpClient (เรียก API)](#8-httpclient)
9. [Angular Forms (แบบฟอร์ม)](#9-angular-forms)
10. [ng-select (Dropdown)](#10-ng-select)
11. [Pattern: Horizontal Strip Slide (แถบหนังเลื่อนได้)](#11-pattern-horizontal-strip-slide)
12. [Pattern: Banner Carousel (สไลด์ปกเว็บ)](#12-pattern-banner-carousel)
13. [สถาปัตยกรรม DDD](#13-สถาปัตยกรรม-ddd)
14. [อธิบายโค้ดแต่ละ Feature](#14-อธิบายโค้ดแต่ละ-feature)

---

## 1. ภาพรวมโปรเจค

CINEBOOK คือระบบจองตั๋วหนังออนไลน์ ทำงานบน Angular 21 เชื่อมต่อกับ Backend ที่เป็น ASP.NET Core

**เทคโนโลยีที่ใช้:**
| เทคโนโลยี | หน้าที่ |
|---|---|
| Angular 21 | Framework หลักของ Frontend |
| TypeScript | ภาษาโปรแกรมที่ใช้เขียนโค้ด |
| Tailwind CSS 4 | จัดการหน้าตาและ Layout |
| RxJS | จัดการ data ที่ไหลมาจาก API |
| Google Fonts (Outfit + Prompt) | ฟอนต์สำหรับอักษรละตินและภาษาไทย |
| ng-select | Dropdown component สำเร็จรูป |

---

## 2. โครงสร้างโฟลเดอร์

```
frontend-movie-ticket-booking-system/
├── src/
│   ├── app/                          ← โค้ดหลักของ Angular
│   │   ├── app.ts                    ← Root Component (component แม่สุด)
│   │   ├── app.html                  ← Template ของ Root Component
│   │   ├── app.routes.ts             ← กำหนดเส้นทาง URL ทั้งหมด
│   │   ├── app.config.ts             ← ตั้งค่า providers ระดับ app
│   │   │
│   │   ├── core/                     ← Infrastructure (ระบบพื้นฐาน)
│   │   │   └── admin.guard.ts        ← ป้องกันหน้า admin จากคนทั่วไป
│   │   │
│   │   ├── shared/                   ← UI ที่ใช้ร่วมกันทุกหน้า
│   │   │   ├── navbar/               ← แถบนำทางด้านบน
│   │   │   └── footer/               ← ส่วนท้ายของหน้า
│   │   │
│   │   └── features/                 ← แบ่งตาม domain (ขอบเขตธุรกิจ)
│   │       ├── auth/                 ← ระบบ Login/Register
│   │       │   ├── services/
│   │       │   │   └── auth.service.ts
│   │       │   └── pages/
│   │       │       ├── login/
│   │       │       └── register/
│   │       │
│   │       ├── movie/                ← ระบบหนัง
│   │       │   ├── models/
│   │       │   │   ├── movie.model.ts
│   │       │   │   └── showtime.model.ts
│   │       │   ├── services/
│   │       │   │   ├── movie.service.ts
│   │       │   │   └── showtime.service.ts
│   │       │   └── pages/
│   │       │       └── movie-detail/
│   │       │
│   │       ├── booking/              ← ระบบจองตั๋ว
│   │       │   ├── models/
│   │       │   │   ├── seat.model.ts
│   │       │   │   └── ticket.model.ts
│   │       │   └── services/
│   │       │       ├── seat.service.ts
│   │       │       └── booking.service.ts
│   │       │
│   │       ├── wallet/               ← ระบบกระเป๋าเงิน
│   │       │   └── services/
│   │       │       └── wallet.service.ts
│   │       │
│   │       ├── banner/               ← ระบบ Banner ปกเว็บ
│   │       │   ├── models/
│   │       │   │   └── banner.model.ts
│   │       │   ├── services/
│   │       │   │   └── banner.service.ts
│   │       │   └── components/
│   │       │       └── banner-carousel/
│   │       │
│   │       └── admin/                ← หน้าผู้ดูแลระบบ
│   │           └── dashboard/
│   │
│   ├── pages/                        ← หน้าเว็บหลัก (อยู่นอก app/)
│   │   ├── home/                     ← หน้าแรก
│   │   └── movie/                    ← หน้ารายการหนัง
│   │       └── category/             ← หน้าหนังตาม category
│   │
│   ├── index.html                    ← HTML ไฟล์เริ่มต้น (โหลด font ที่นี่)
│   └── styles.css                    ← CSS ระดับ global
```

> **ทำไมถึงแบ่งแบบนี้?** — แนวคิด DDD (Domain-Driven Design) แปลว่าจัดโฟลเดอร์ตาม "ขอบเขตธุรกิจ" ไม่ใช่ตามประเภทไฟล์ ทำให้หาโค้ดง่าย เช่น อยากแก้เรื่องจองตั๋วก็ไปที่ `features/booking/` ได้เลย

---

## 3. Angular Framework

Angular คือ **Framework** สำหรับสร้างเว็บแอปพลิเคชัน (Framework = โครงกระดูกที่กำหนดวิธีเขียนโค้ด) พัฒนาโดย Google

### 3.1 Component คืออะไร

**Component** = ชิ้นส่วนของ UI หนึ่งชิ้น เช่น Navbar, Card หนัง, ปุ่ม ทุก component มี 3 ส่วน:
- **TypeScript (.ts)** — logic และข้อมูล
- **HTML (.html)** — โครงสร้างหน้าตา
- **CSS (.css)** — ตกแต่งรูปร่าง

**โครงสร้างพื้นฐานของ Component:**
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-example',      // ชื่อ tag HTML ที่ใช้เรียก component นี้ เช่น <app-example />
  imports: [],                  // import สิ่งที่จะใช้ใน HTML เช่น RouterLink, NgClass
  templateUrl: './example.html', // path ไปยัง HTML file
  styleUrl: './example.css',     // path ไปยัง CSS file
})
export class Example {
  // โค้ด logic อยู่ที่นี่
}
```

> **`@Component` decorator** คือ "ป้าย" ที่บอก Angular ว่า class นี้คือ component ไม่ใช่ class ธรรมดา (decorator = ป้ายหรือ annotation ที่เพิ่มความสามารถให้ class)

### 3.2 Standalone Component

ในโปรเจคนี้ใช้ **Standalone Component** หมายความว่าทุก component ดูแลตัวเองได้ ไม่ต้องลงทะเบียนใน NgModule (NgModule = ระบบเก่าของ Angular ที่รวม component เป็นกลุ่ม)

```typescript
// ตัวอย่างจากโปรเจค: navbar.ts
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, DecimalPipe],  // ← ใช้อะไรก็ import ตรงๆ ที่นี่เลย
  templateUrl: './navbar.html',
})
export class Navbar { }
```

`RouterLink` และ `DecimalPipe` ถูก import ตรงๆ ใน component โดยไม่ต้องผ่าน NgModule

### 3.3 Angular Signals — ระบบจัดการข้อมูลที่เปลี่ยนแปลงได้

**Signal** คือ "กล่องเก็บข้อมูล" ที่ฉลาด — เมื่อข้อมูลข้างในเปลี่ยน Angular จะ update หน้าจออัตโนมัติทันที ไม่ต้องเขียนโค้ดบอกว่า "อัปเดตด้วยนะ"

#### `signal()` — สร้างกล่องเก็บข้อมูล

```typescript
import { signal } from '@angular/core';

// สร้าง signal ที่เก็บค่า boolean เริ่มต้นเป็น false
showSidebar = signal(false);

// อ่านค่า: เรียกเหมือน function
console.log(this.showSidebar()); // → false

// แก้ไขค่า: ใช้ .set()
this.showSidebar.set(true);

// แก้ไขค่าโดยอิงค่าเดิม: ใช้ .update()
// ตัวอย่าง: เปลี่ยน index ของ banner ให้ไปหน้าถัดไป
this.currentIndex.update(i => (i + 1) % this.banners().length);
// อธิบาย: รับ i (ค่าเดิม) แล้วคืน i+1 mod จำนวน banner (วนกลับต้นถ้าเกิน)
```

#### `computed()` — คำนวณค่าจาก signal อื่น อัตโนมัติ

```typescript
import { computed } from '@angular/core';

// ตัวอย่างจาก banner carousel:
// stripWidth = ความกว้างรวมของแถบ banner ทั้งหมด
stripWidth = computed(() => this.banners().length * 100);
// อธิบาย: ถ้ามี 5 banner → stripWidth = 500 (หน่วยเป็น %)
// เมื่อ banners() เปลี่ยน computed นี้จะคำนวณใหม่อัตโนมัติ

slideWidth = computed(() =>
  this.banners().length > 0 ? 100 / this.banners().length : 100
);
// อธิบาย: ถ้ามี 5 banner → slideWidth = 20 (หน่วยเป็น %)
// แต่ละ slide ใช้พื้นที่ 20% ของแถบ
```

#### `effect()` — ทำงานอัตโนมัติเมื่อ signal เปลี่ยน

```typescript
import { effect } from '@angular/core';

// ตัวอย่างจาก navbar: โหลดยอดกระเป๋าเมื่อ login สถานะเปลี่ยน
constructor() {
  effect(() => {
    if (this.auth.isLoggedIn()) {
      this.wallet.loadBalance();  // ← เรียกทันทีที่ isLoggedIn() กลายเป็น true
    } else {
      this.wallet.clearBalance(); // ← ล้างเมื่อ logout
    }
  });
}
// อธิบาย: effect() จะรันทุกครั้งที่ signal ที่อ่านอยู่ข้างใน (isLoggedIn) เปลี่ยนค่า
```

#### `.asReadonly()` — ป้องกันไม่ให้แก้ค่าจากข้างนอก

```typescript
// ตัวอย่างจาก auth.service.ts
private _isLoggedIn = signal(false);  // ← signal จริงๆ (private = แก้ได้แค่ใน service นี้)
isLoggedIn = this._isLoggedIn.asReadonly(); // ← ให้ข้างนอกอ่านได้อย่างเดียว

// ใน component อื่นทำได้แค่:
this.auth.isLoggedIn() // ← อ่านได้
// this.auth.isLoggedIn.set(true) ← ERROR: แก้ไม่ได้
```

### 3.4 Lifecycle Hooks — วงจรชีวิตของ Component

Component มีวงจรชีวิต เกิด (create) → แสดงผล → ตาย (destroy)

```typescript
import { OnInit, OnDestroy } from '@angular/core';

// ตัวอย่างจาก banner.ts
export class Banner implements OnInit, OnDestroy {

  ngOnInit() {
    // เรียกทันทีที่ component ถูกสร้างและแสดงผลแล้ว
    // ใช้โหลดข้อมูลจาก API ที่นี่
    this.bannerService.getAll().subscribe({
      next: (data) => {
        this.banners.set(data);
        this.startTimer(); // เริ่ม auto-slide
      }
    });
  }

  ngOnDestroy() {
    // เรียกก่อน component จะถูกลบออกจากหน้าจอ
    // ใช้หยุด timer หรือยกเลิก subscription เพื่อป้องกัน memory leak
    this.stopTimer();
  }
}
```

> **Memory Leak** = ปัญหาที่ timer หรือ subscription ยังทำงานอยู่แม้หน้าถูกปิดไปแล้ว ทำให้ RAM รั่ว — ป้องกันได้ใน `ngOnDestroy`

### 3.5 `inject()` — Dependency Injection

**Dependency Injection** (DI) แปลตรงๆ = "การฉีดสิ่งที่ต้องพึ่งพา" หมายความว่า แทนที่จะสร้าง service เองด้วย `new Service()`, ให้ Angular จัดการสร้างและส่งมาให้

```typescript
import { inject } from '@angular/core';
import { MovieService } from '../services/movie.service';

export class MovieListPage {
  // Angular จะหา MovieService ที่มีอยู่ (instance เดียวกันทั้ง app) มาให้
  private movieService = inject(MovieService);

  // เทียบกับแบบเก่าที่ไม่ใช้ DI:
  // private movieService = new MovieService(); ← ผิด เพราะสร้างใหม่ทุกครั้ง
}
```

> **ทำไมต้อง DI?** — เพราะ Service มักต้องการ dependencies อื่น (เช่น MovieService ต้องการ HttpClient) ถ้าสร้างเองต้องส่ง dependencies เองด้วย Angular ช่วยจัดการให้อัตโนมัติ

### 3.6 `@Injectable` — ทำให้ Service ใช้ DI ได้

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
// providedIn: 'root' = มี instance เดียวตลอด app ทุก component ใช้ร่วมกัน
export class MovieService {
  // ...
}
```

### 3.7 Template Syntax — วิธีเขียน HTML ใน Angular

#### Interpolation — แสดงค่า variable

```html
<!-- ใช้ {{ }} แสดงข้อมูล -->
<p>{{ movie.title }}</p>
<p>{{ auth.username() }}</p>  <!-- เรียก signal ด้วย () -->
```

#### Property Binding — ผูก attribute กับ variable

```html
<!-- ใช้ [] ผูก property -->
<img [src]="movie.posterUrl" [alt]="movie.title" />
<button [disabled]="isLoading()">บันทึก</button>
```

#### Event Binding — รับ event จากผู้ใช้

```html
<!-- ใช้ () รับ event -->
<button (click)="submitMovie()">เพิ่มหนัง</button>
<div (mousedown)="startDrag($event)" (mouseup)="endDrag()"></div>
<!-- $event = object ข้อมูลของ event นั้น (เช่น MouseEvent มีตำแหน่งเมาส์) -->
```

#### `@if` — แสดง/ซ่อน element ตามเงื่อนไข

```html
@if (auth.isLoggedIn()) {
  <button (click)="logout()">ออกจากระบบ</button>
} @else {
  <a routerLink="/login">เข้าสู่ระบบ</a>
}
```

#### `@for` — วนซ้ำแสดงรายการ

```html
@for (movie of movies(); track movie.id) {
  <!-- track movie.id = บอก Angular ใช้ id เป็นตัวระบุ เพื่อ update เฉพาะ item ที่เปลี่ยน -->
  <div>{{ movie.title }}</div>
}
```

#### Template Reference Variable — อ้างอิง DOM element

```html
<!-- ใช้ # ตั้งชื่อให้ element แล้วส่งไปใน function -->
<div #strip class="overflow-x-auto" (mousedown)="startDrag($event, strip)">
  <!-- strip ที่ส่งไปคือ HTMLElement จริงๆ -->
</div>
```

---

## 4. TypeScript

TypeScript คือ JavaScript ที่เพิ่ม "ชนิดข้อมูล" (Type) เข้ามา ทำให้โค้ดปลอดภัยกว่าและ IDE ช่วย autocomplete ได้

### 4.1 Interface — กำหนดรูปร่างของข้อมูล

```typescript
// ตัวอย่างจาก movie.model.ts
export interface Movie {
  id: string;           // string = ข้อความ
  title: string;
  plot: string;
  price: number;        // number = ตัวเลข
  duration: string;
  category: MovieCategory;
  posterUrl?: string;   // ? = optional (อาจมีหรือไม่มีก็ได้)
  createdAt: string;
  updatedAt: string;
}
```

> **Interface** = สัญญาที่บอกว่า object ต้องมี property อะไรบ้าง ถ้าข้อมูลจาก API ขาด field TypeScript จะ error ทันที

### 4.2 Enum — ชุดค่าที่กำหนดไว้แน่นอน

```typescript
// ตัวอย่างจาก movie.model.ts
export enum MovieCategory {
  Action = 'Action',
  Comedy = 'Comedy',
  Drama = 'Drama',
  Horror = 'Horror',
  Romance = 'Romance',
  Science_Fiction = 'Science_Fiction',
  Thriller = 'Thriller',
  Fantasy = 'Fantasy',
}

// ตัวอย่างจาก seat.model.ts
export enum SeatStatus {
  Available = 'Available',  // ว่าง
  Locked = 'Locked',        // ถูก lock ชั่วคราว
  Booked = 'Booked',        // จองแล้ว
}
```

> **Enum** = กลุ่มค่าที่เป็นไปได้ทั้งหมด เช่น สถานะที่นั่งมีได้แค่ 3 แบบ ใช้ enum แทน string เพื่อป้องกันพิมพ์ผิด

### 4.3 Generic Type — ชนิดข้อมูลที่ยืดหยุ่น

```typescript
// signal<T>() ใช้ Generic T แทนชนิดใดๆ
banners = signal<Banner[]>([]);
// T = Banner[] แปลว่า signal นี้เก็บ array ของ Banner

selectedShowtime = signal<Showtime | null>(null);
// Showtime | null = อาจเป็น Showtime หรือ null ก็ได้ (Union Type)
```

---

## 5. Tailwind CSS

Tailwind CSS คือ CSS framework ที่ให้ class สำเร็จรูปนับพันๆ class แทนที่จะเขียน CSS เอง

### 5.1 วิธีใช้งานพื้นฐาน

```html
<!-- เปรียบเทียบ CSS ธรรมดา vs Tailwind -->

<!-- CSS ธรรมดา: -->
<style>
  .card { background: #111827; border-radius: 0.75rem; padding: 1.5rem; }
</style>
<div class="card">...</div>

<!-- Tailwind: -->
<div class="bg-gray-900 rounded-xl p-6">...</div>
<!-- bg-gray-900 = background สีเทาเข้ม -->
<!-- rounded-xl = มุมโค้งขนาด xl -->
<!-- p-6 = padding ทุกด้าน 1.5rem -->
```

### 5.2 Responsive Design — ปรับตามขนาดหน้าจอ

```html
<!-- Tailwind ใช้ prefix บอก breakpoint -->
<!-- sm = ≥640px, md = ≥768px, lg = ≥1024px, xl = ≥1280px -->

<div class="px-4 md:px-8">
  <!-- px-4 = padding left/right 1rem (มือถือ) -->
  <!-- md:px-8 = padding left/right 2rem (tablet ขึ้นไป) -->
</div>

<div class="hidden lg:flex">
  <!-- hidden = ซ่อนไว้ก่อน (มือถือ) -->
  <!-- lg:flex = แสดงด้วย flex เมื่อหน้าจอ ≥1024px -->
</div>
```

### 5.3 Class ที่ใช้บ่อยในโปรเจค

```html
<!-- Layout -->
<div class="flex items-center gap-4">
  <!-- flex = display flex (จัดของแนวนอน/ตั้ง) -->
  <!-- items-center = จัด items ตรงกลางแนวตั้ง -->
  <!-- gap-4 = ระยะห่างระหว่าง items = 1rem -->
</div>

<div class="grid grid-cols-5 gap-4">
  <!-- grid = display grid -->
  <!-- grid-cols-5 = แบ่ง 5 คอลัมน์ -->
</div>

<!-- สี -->
<p class="text-white">ข้อความสีขาว</p>
<p class="text-gray-400">ข้อความสีเทา</p>
<div class="bg-red-600">พื้นหลังสีแดง</div>

<!-- ขนาด -->
<p class="text-sm">ตัวอักษรเล็ก (14px)</p>
<p class="text-lg">ตัวอักษรใหญ่ (18px)</p>
<p class="font-bold">ตัวหนา</p>

<!-- transition และ animation -->
<div class="transition-colors duration-300 hover:bg-white/10">
  <!-- transition-colors = เปลี่ยนสีแบบ smooth -->
  <!-- duration-300 = ใช้เวลา 300ms -->
  <!-- hover:bg-white/10 = พื้นหลังสีขาว 10% opacity เมื่อ hover -->
</div>

<!-- opacity และ backdrop -->
<nav class="bg-black/95 backdrop-blur-md">
  <!-- bg-black/95 = สีดำ opacity 95% -->
  <!-- backdrop-blur-md = เบลอพื้นหลังด้านหลัง (glass effect) -->
</nav>

<!-- Transform -->
<div class="translate-x-full">ซ่อนนอกจอไปทางขวา 100%</div>
<div class="translate-x-0">อยู่ในตำแหน่งปกติ</div>
```

### 5.4 Dynamic Class ใน Angular

```html
<!-- ใช้ [class] binding เลือก class ตามเงื่อนไข -->
<button
  [class]="isActive
    ? 'bg-red-600 text-white'
    : 'bg-gray-800 text-gray-400'"
>
  คลิก
</button>

<!-- ใช้ [class.xxx] สำหรับ boolean -->
<div
  [class.translate-x-0]="showSidebar()"
  [class.translate-x-full]="!showSidebar()"
>
  Sidebar
</div>
<!-- ถ้า showSidebar() = true → class "translate-x-0" ถูกเพิ่ม -->
<!-- ถ้า showSidebar() = false → class "translate-x-full" ถูกเพิ่ม -->
```

---

## 6. RxJS

RxJS (Reactive Extensions for JavaScript) คือ library จัดการ "ข้อมูลที่เปลี่ยนตามเวลา" เช่น ผลลัพธ์จาก API

### 6.1 Observable คืออะไร

**Observable** เปรียบเหมือน "ท่อน้ำ" — ข้อมูลไหลผ่านท่อมาหา subscriber (ผู้ที่รอรับ)

```typescript
// HTTP request คืน Observable
this.http.get<Movie[]>('/api/movies')
// ยังไม่มีอะไรเกิดขึ้น! Observable ต้อง subscribe ก่อนถึงจะทำงาน

// subscribe = "เปิดก๊อกน้ำ" รอรับข้อมูล
.subscribe({
  next: (movies) => { /* ได้รับข้อมูลสำเร็จ */ },
  error: (err) => { /* เกิด error */ },
  complete: () => { /* เสร็จสิ้น */ }
});
```

### 6.2 `toSignal()` — แปลง Observable เป็น Signal

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

// แทนที่จะ subscribe เอง Angular จัดการให้
movies = toSignal(
  this.movieService.getAll(),  // Observable
  { initialValue: [] }          // ค่าเริ่มต้นก่อนข้อมูลมา (ป้องกัน undefined)
);

// ใช้งานใน template แบบ signal ปกติ
// movies() → Array<Movie>
```

> **ทำไมใช้ toSignal?** — เพราะ Angular Signal และ template ทำงานด้วยกันดีกว่า Observable โดยตรง และ Angular จะ unsubscribe อัตโนมัติเมื่อ component ถูกลบ

### 6.3 Pipe Operators — แปลงข้อมูลที่ไหลในท่อ

```typescript
import { map, switchMap, forkJoin, tap } from 'rxjs';

// map — แปลงค่าใน Observable
this.route.paramMap.pipe(
  map(params => params.get('id') ?? '')
  // แปลง ParamMap object → string ของ id
)

// switchMap — เมื่อ Observable ต้นทางมีค่าใหม่ ยกเลิกอันเก่าแล้วสร้างอันใหม่
this.movieId$.pipe(
  switchMap(id => this.movieService.getById(id))
  // ทุกครั้งที่ id เปลี่ยน → ยกเลิก request เก่า → เรียก API ใหม่ด้วย id ใหม่
)

// tap — ดูข้อมูลโดยไม่เปลี่ยนค่า (side effect)
this.http.post('/api/wallet/deposit', { amount })
  .pipe(tap(res => this._balance.set(res.balance)))
  // อัปเดต balance signal ระหว่างทาง โดยยังส่งค่าต่อ
```

### 6.4 `forkJoin` — รอ Observable หลายตัวพร้อมกัน

```typescript
import { forkJoin } from 'rxjs';

// ตัวอย่างจาก movie-detail: จองที่นั่งหลายที่พร้อมกัน
forkJoin(
  seats.map(s => this.bookingService.book(s.id, showtime.id))
  // สร้าง array ของ Observable จากที่นั่งที่เลือก
)
.subscribe({
  next: (tickets) => {
    // tickets คือ array ผลลัพธ์ เรียงตาม Observable ใน array
    // รอให้ทุกที่นั่ง book สำเร็จก่อนค่อยดำเนินการ
  }
});
```

---

## 7. Angular Router

Router คือระบบที่บอก Angular ว่า URL ไหนควรแสดง Component อะไร

### 7.1 กำหนด Routes (app.routes.ts)

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Home } from '../pages/home/home';
import { MovieDetail } from './features/movie/pages/movie-detail/movie-detail';

export const routes: Routes = [
  { path: '', component: Home },
  // path: '' = URL ว่าง → แสดง Home
  // ต้องอยู่ก่อน routes อื่นที่มี path ยาวกว่า

  { path: 'movies/:id', component: MovieDetail },
  // :id = parameter ที่เปลี่ยนได้ เช่น /movies/abc-123
  // ใช้ ActivatedRoute ดึงค่า id ออกมา

  { path: 'movies/category/:id', component: MovieCategory },
  // ต้องอยู่ก่อน movies/:id เพราะ Angular match จากบนลงล่าง

  { path: 'admin', component: AdminDashboard, canActivate: [adminGuard] },
  // canActivate = guard ที่ตรวจสอบสิทธิ์ก่อนเข้าหน้า
];
```

### 7.2 RouterLink — ลิงก์ระหว่างหน้า

```html
<!-- Import RouterLink ใน component -->

<!-- ลิงก์ไปหน้า login -->
<a routerLink="/login">เข้าสู่ระบบ</a>

<!-- ลิงก์พร้อม parameter -->
<a [routerLink]="['/movies/category', group.category]">
  {{ group.category }}
</a>
<!-- สร้าง URL เช่น /movies/category/Action -->
```

### 7.3 ActivatedRoute — อ่าน URL parameter

```typescript
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

export class MovieDetail {
  private route = inject(ActivatedRoute);

  // ดึง id จาก URL เช่น /movies/abc-123 → id = 'abc-123'
  private movieId$ = this.route.paramMap.pipe(
    map(p => p.get('id') ?? '')
    // paramMap = Observable ของ parameters ใน URL
    // .get('id') = ดึงค่า parameter ชื่อ 'id'
    // ?? '' = ถ้าไม่มีให้ใช้ string ว่าง
  );
}
```

### 7.4 Router Guard — ปกป้องหน้าที่ต้องการสิทธิ์

```typescript
// src/app/core/admin.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../features/auth/services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) return true;
  // isAdmin() = true → อนุญาตให้เข้า

  return router.createUrlTree(['/']);
  // isAdmin() = false → redirect ไปหน้าแรกแทน
};
```

> **CanActivateFn** คือ function ที่ Angular เรียกก่อนเปลี่ยนหน้า ถ้าคืน `true` = เข้าได้ ถ้าคืน URL = redirect ไปที่นั่นแทน

### 7.5 Router.navigate() — เปลี่ยนหน้าด้วยโค้ด

```typescript
import { Router } from '@angular/router';

export class Login {
  private router = inject(Router);

  onSubmit() {
    this.authService.login(...).subscribe({
      next: () => this.router.navigate(['/'])
      // ไปหน้าแรกหลัง login สำเร็จ
    });
  }
}
```

---

## 8. HttpClient

HttpClient คือ service ของ Angular สำหรับเรียก API (HTTP Request)

### 8.1 การตั้งค่า (app.config.ts)

```typescript
// src/app/app.config.ts
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(), // ← เปิดใช้งาน HttpClient ทั้ง app
  ]
};
```

### 8.2 วิธีใช้ HttpClient ใน Service

```typescript
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5074/api/movies';

  // GET — ดึงข้อมูล
  getAll() {
    return this.http.get<Movie[]>(this.baseUrl);
    // <Movie[]> = Generic type บอกว่า response จะเป็น array ของ Movie
  }

  getById(id: string) {
    return this.http.get<Movie>(`${this.baseUrl}/${id}`);
    // Template literal: backtick ` ใช้ใส่ variable ใน string ด้วย ${}
  }
}
```

### 8.3 Request ที่ต้องใช้ Authorization Header

```typescript
// ตัวอย่างจาก booking.service.ts
private get options() {
  return {
    headers: {
      Authorization: `Bearer ${this.auth.getToken()}`
      // Bearer token = ส่ง JWT token ใน header เพื่อพิสูจน์ตัวตน
    }
  };
}

book(seatId: string, showtimeId: string) {
  return this.http.post<Ticket>(
    this.baseUrl,
    { seatId, showtimeId }, // body ของ request
    this.options            // headers
  );
}
```

### 8.4 FormData — ส่งไฟล์รูปภาพ

```typescript
// ตัวอย่างจาก dashboard.ts: เพิ่มหนังพร้อมโปสเตอร์
submitMovie() {
  const form = new FormData();
  // FormData = รูปแบบข้อมูล multipart สำหรับส่งไฟล์
  form.append('title', this.movieForm.title);
  form.append('poster', this.posterFile);
  // poster คือ File object จาก <input type="file">

  this.http.post<Movie>(this.moviesUrl, form, { headers: this.headers })
    .subscribe({ next: () => this.resetMovieForm() });
}
```

---

## 9. Angular Forms

FormsModule ใช้สำหรับจัดการ form input โดยเชื่อม HTML กับ TypeScript variable โดยตรง

### 9.1 `[(ngModel)]` — Two-Way Binding

```html
<!-- import FormsModule ใน component ก่อน -->

<input [(ngModel)]="movieForm.title" placeholder="ชื่อหนัง" />
<!-- [(ngModel)] = "banana in a box" syntax -->
<!-- [] = รับค่าจาก movieForm.title มาแสดง -->
<!-- () = เมื่อผู้ใช้พิมพ์ → อัปเดต movieForm.title อัตโนมัติ -->
```

```typescript
// ใน component.ts
movieForm = {
  title: '',        // ← ค่าเริ่มต้น
  plot: '',
  price: null as number | null,
};

// เมื่อผู้ใช้พิมพ์ใน input → movieForm.title เปลี่ยนทันที
// ไม่ต้องเขียน event handler เพิ่ม
```

---

## 10. ng-select

ng-select คือ Dropdown component สำเร็จรูปที่สวยงาม รองรับ search, multi-select

### 10.1 การติดตั้งและใช้งาน

```typescript
// import ใน component
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  imports: [FormsModule, NgSelectModule], // ← ต้องมีทั้ง FormsModule และ NgSelectModule
})
```

```html
<!-- ใช้งานใน HTML -->
<ng-select
  [(ngModel)]="movieForm.category"
  [items]="categories"
  [searchable]="false"
  [clearable]="false"
  placeholder="เลือกหมวดหมู่"
/>
```

```typescript
// categories คือ array ของ string
categories = Object.values(MovieCategory);
// Object.values() ดึง value ทั้งหมดจาก enum
// → ['Action', 'Comedy', 'Drama', ...]
```

```html
<!-- Dropdown เลือกหนัง (bind label และ value แยกกัน) -->
<ng-select
  [(ngModel)]="showtimeForm.movieId"
  [items]="movies()"
  bindLabel="title"   ← แสดง property 'title' ใน dropdown
  bindValue="id"      ← เมื่อเลือก → เก็บ property 'id' ใน variable
  placeholder="เลือกหนัง"
/>
```

---

## 11. Pattern: Horizontal Strip Slide

แถบเลื่อนหนังที่สามารถ drag ด้วยเมาส์ได้ ใช้ใน `/movies` และ Home page

### 11.1 หลักการทำงาน

```
ผู้ใช้กดเมาส์ค้าง → บันทึกตำแหน่ง X เริ่มต้น
ผู้ใช้ลากเมาส์   → คำนวณระยะที่เลื่อน → ปรับ scrollLeft ของ element
ผู้ใช้ปล่อยเมาส์  → หยุดการ drag
```

### 11.2 โค้ด TypeScript (movie.ts)

```typescript
export class Movie {
  // ── State สำหรับ drag ──
  private dragEl: HTMLElement | null = null;
  // dragEl = element ที่กำลัง drag อยู่ (ใช้ reference ตรงๆ เพราะมีหลาย strip)

  private dragStartX = 0;
  // dragStartX = ตำแหน่ง X ของเมาส์ตอนกดลง (pixel จากขอบซ้ายหน้าจอ)

  private scrollStartLeft = 0;
  // scrollStartLeft = ตำแหน่ง scroll ของ element ตอนเริ่ม drag

  private isDragging = false;
  // isDragging = กำลัง drag อยู่ไหม

  private hasDragged = false;
  // hasDragged = ลากไปแล้วหรือยัง (ใช้แยกว่าเป็น click หรือ drag)

  startDrag(e: MouseEvent, el: HTMLElement) {
    // เรียกเมื่อ mousedown บน strip element
    this.dragEl = el;              // จำ element ที่กด
    this.isDragging = true;
    this.hasDragged = false;
    this.dragStartX = e.clientX;   // e.clientX = X position ของเมาส์ในหน้าจอ
    this.scrollStartLeft = el.scrollLeft; // เก็บ scroll position ปัจจุบัน
  }

  onDrag(e: MouseEvent) {
    // เรียกเมื่อ mousemove บน container ทั้งหมด
    if (!this.isDragging || !this.dragEl) return; // ถ้าไม่ได้ drag ให้ออกเลย

    const diff = e.clientX - this.dragStartX;
    // diff = ระยะที่เมาส์เลื่อนไปจากจุดเริ่มต้น (บวก = เลื่อนขวา, ลบ = เลื่อนซ้าย)

    if (Math.abs(diff) > 5) this.hasDragged = true;
    // ถ้าเลื่อนมากกว่า 5px ถือว่า drag ไม่ใช่แค่ click

    e.preventDefault();
    // ป้องกัน browser default behavior เช่น select text

    this.dragEl.scrollLeft = this.scrollStartLeft - diff;
    // scrollLeft = ตำแหน่ง scroll ใหม่
    // ลบ diff เพราะ: ลากขวา (diff บวก) = เลื่อนกลับซ้าย = scrollLeft ลด
  }

  endDrag() {
    this.isDragging = false;
    this.dragEl = null;
  }

  onMovieClick(id: string) {
    if (this.hasDragged) return; // ถ้า drag อยู่ → ไม่ navigate
    this.router.navigate(['/movies', id]);
  }
}
```

### 11.3 โค้ด HTML

```html
<!-- container หลัก: รับ mousemove และ mouseup จากทุกที่บนหน้า -->
<div class="min-h-screen"
  (mousemove)="onDrag($event)"
  (mouseup)="endDrag()"
  (mouseleave)="endDrag()"
>
  @for (group of moviesByCategory(); track group.category) {

    <!-- strip แต่ละ category: -->
    <div
      #strip
      class="overflow-x-auto scrollbar-hide cursor-grab select-none"
      (mousedown)="startDrag($event, strip)"
      <!-- ส่ง #strip (HTMLElement) ไปให้ startDrag เพื่อรู้ว่า drag element ไหน -->
    >
      <div class="flex gap-4">
        <!-- overflow-x-auto = scroll แนวนอนได้ -->
        <!-- scrollbar-hide = ซ่อน scrollbar (ใน styles.css) -->
        <!-- cursor-grab = icon เมาส์เป็นมือกำ -->
        <!-- select-none = ป้องกัน select text ขณะ drag -->
      </div>
    </div>

  }
</div>
```

---

## 12. Pattern: Banner Carousel

Carousel ปกเว็บที่เลื่อนอัตโนมัติ, กด dot เปลี่ยนได้, drag ได้

### 12.1 หลักการ CSS Translate

```
แถบทั้งหมด (strip) กว้าง = จำนวน banner × 100%
แต่ละ slide กว้าง = 100% / จำนวน banner

ตัวอย่าง: มี 5 banners
strip กว้าง 500%, แต่ละ slide กว้าง 20%
แสดง slide 0: translateX(0%)
แสดง slide 1: translateX(-20%)
แสดง slide 2: translateX(-40%)
```

### 12.2 โค้ด TypeScript (banner.ts)

```typescript
export class Banner implements OnInit, OnDestroy {
  banners = signal<BannerItem[]>([]);
  currentIndex = signal(0); // index ของ banner ที่แสดงอยู่

  // computed จะคำนวณใหม่อัตโนมัติเมื่อ banners() เปลี่ยน
  stripWidth = computed(() => this.banners().length * 100);
  // 5 banners → stripWidth = 500

  slideWidth = computed(() =>
    this.banners().length > 0 ? 100 / this.banners().length : 100
  );
  // 5 banners → slideWidth = 20

  private timer: ReturnType<typeof setInterval> | null = null;
  // ReturnType<typeof setInterval> = ชนิดที่ setInterval คืนมา (number ใน browser)

  ngOnInit() {
    this.bannerService.getAll().subscribe({
      next: (data) => {
        this.banners.set(data);
        this.startTimer(); // เริ่ม auto-slide หลังโหลดข้อมูล
      }
    });
  }

  private startTimer() {
    if (this.banners().length === 0) return;
    this.timer = setInterval(() => {
      this.currentIndex.update(i => (i + 1) % this.banners().length);
      // (i + 1) % 5 → 0,1,2,3,4,0,1,2,... วนไม่รู้จบ
    }, 5000); // ทุก 5 วินาที
  }

  private stopTimer() {
    if (this.timer) clearInterval(this.timer); // หยุด timer
  }

  goTo(index: number) {
    this.currentIndex.set(index);
    this.stopTimer();
    this.startTimer(); // reset timer เมื่อกด dot
  }

  // Drag: เลื่อนซ้าย-ขวาด้วยเมาส์
  onMouseUp(e: MouseEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;
    const diff = this.dragStartX - e.clientX;
    // diff บวก = ลากซ้าย = ไปหน้าถัดไป
    // diff ลบ = ลากขวา = ไปหน้าก่อน

    if (Math.abs(diff) < 50) return; // ถ้าเลื่อนน้อยกว่า 50px ไม่เปลี่ยน
    const len = this.banners().length;
    if (diff > 0) {
      this.goTo((this.currentIndex() + 1) % len); // ถัดไป
    } else {
      this.goTo((this.currentIndex() - 1 + len) % len); // ก่อนหน้า (+ len ป้องกันค่าติดลบ)
    }
  }
}
```

### 12.3 โค้ด HTML (banner.html)

```html
@if (banners().length > 0) {
  <div
    class="relative w-full overflow-hidden h-55 md:h-110"
    (mousedown)="onMouseDown($event)"
    (mouseup)="onMouseUp($event)"
    (mouseleave)="onMouseLeave()"
  >
    <!-- strip: แถบยาวที่มี banner ทุกตัวเรียงต่อกัน -->
    <div
      class="flex h-full transition-transform duration-500 ease-in-out"
      [style.width]="stripWidth() + '%'"
      [style.transform]="'translateX(' + (-currentIndex() * slideWidth()) + '%)'"
    >
    <!-- [style.width]="500%" = แถบกว้าง 500% ของ container -->
    <!-- [style.transform] = เลื่อนแถบไปซ้าย เช่น index=2 → -40% -->
    <!-- transition-transform duration-500 = animation เลื่อน 500ms -->

      @for (banner of banners(); track banner.id) {
        <div class="relative h-full flex-none" [style.width]="slideWidth() + '%'">
          <!-- flex-none = ห้าม shrink -->
          <!-- [style.width]="20%" = แต่ละ slide กว้าง 20% ของ strip -->
          <img [src]="'http://localhost:5074' + banner.imageUrl" />
        </div>
      }
    </div>

    <!-- Dot navigation -->
    <div class="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
      @for (banner of banners(); track banner.id; let i = $index) {
        <button
          (click)="goTo(i)"
          [ngClass]="i === currentIndex() ? 'bg-white w-6' : 'bg-white/40 w-2.5'"
          class="h-1.5 rounded-full transition-all duration-300"
        ></button>
        <!-- dot ที่ active จะกว้างกว่า (w-6 vs w-2.5) -->
      }
    </div>
  </div>
}
```

---

## 13. สถาปัตยกรรม DDD

**Domain-Driven Design (DDD)** = แนวคิดจัดโฟลเดอร์ตาม "ขอบเขตธุรกิจ" (domain)

### 13.1 ทำไมถึงใช้ DDD

| แบบเดิม (จัดตาม type) | แบบ DDD (จัดตาม domain) |
|---|---|
| `services/movie.service.ts` | `features/movie/services/movie.service.ts` |
| `services/auth.service.ts` | `features/auth/services/auth.service.ts` |
| `models/movie.model.ts` | `features/movie/models/movie.model.ts` |
| ต้องกระโดดไปมาหลาย folder | ทุกอย่างของ movie อยู่ใน `features/movie/` |

### 13.2 โครงสร้างของแต่ละ Feature

```
features/movie/
├── models/          ← กำหนดรูปร่างข้อมูล (interface, enum)
│   ├── movie.model.ts
│   └── showtime.model.ts
├── services/        ← เรียก API และ logic
│   ├── movie.service.ts
│   └── showtime.service.ts
└── pages/           ← UI ที่แสดงผล
    └── movie-detail/
```

### 13.3 กฎการ import

```
features/movie/pages/movie-detail.ts   ← ใช้ services ของตัวเอง
→ import { MovieService } from '../../services/movie.service'

features/movie/pages/movie-detail.ts   ← ใช้ services ของ domain อื่น
→ import { BookingService } from '../../../booking/services/booking.service'

shared/navbar/navbar.ts                ← ใช้ features จาก domain
→ import { AuthService } from '../../features/auth/services/auth.service'
```

---

## 14. อธิบายโค้ดแต่ละ Feature

### 14.1 Auth Feature — ระบบ Login/Register

#### auth.service.ts — Service หลักของ Auth

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // ── Signals (state ของ auth) ──
  private _isLoggedIn = signal(!!localStorage.getItem('token'));
  // !! = แปลง string/null เป็น boolean
  // localStorage.getItem('token') = null ถ้าไม่มี → !!null = false
  // ถ้ามี token → !!'eyJ...' = true

  private _username = signal(localStorage.getItem('username') ?? '');
  // ?? '' = null coalescing: ถ้า null หรือ undefined ให้ใช้ '' แทน

  private _role = signal(localStorage.getItem('role') ?? '');

  // public signals (readonly — อ่านได้ แต่แก้จากข้างนอกไม่ได้)
  isLoggedIn = this._isLoggedIn.asReadonly();
  username = this._username.asReadonly();
  isAdmin = computed(() => this._role() === 'Admin');
  // isAdmin คำนวณจาก _role ถ้า role = 'Admin' คืน true

  saveToken(token: string, username: string) {
    const role = this.parseRole(token);
    // เก็บใน localStorage (ยังคงอยู่แม้ reload)
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    // อัปเดต signals ให้ UI re-render ทันที
    this._isLoggedIn.set(true);
    this._username.set(username);
    this._role.set(role);
  }

  private parseRole(token: string): string {
    try {
      // JWT token มี 3 ส่วนคั่นด้วย '.'  →  header.payload.signature
      // ส่วนที่ 2 (index 1) คือ payload ที่เข้ารหัส base64
      const payload = JSON.parse(atob(token.split('.')[1]));
      // atob() = decode base64 → JSON string
      // JSON.parse() = แปลง string เป็น object
      return payload['role'] ?? '';
    } catch {
      return ''; // ถ้า token ผิดรูปแบบ
    }
  }
}
```

#### login.ts — หน้า Login

```typescript
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal('');  // ผูกกับ input ผ่าน ngModel
  password = signal('');
  isLoading = signal(false);
  error = signal('');

  onSubmit() {
    if (!this.username() || !this.password()) {
      this.error.set('กรุณากรอกข้อมูลให้ครบ');
      return; // หยุดก่อน ไม่เรียก API
    }
    this.isLoading.set(true);
    this.error.set('');

    this.authService.login(this.username(), this.password()).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token, this.username());
        this.router.navigate(['/']); // ไปหน้าแรกหลัง login
      },
      error: () => {
        this.error.set('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        this.isLoading.set(false);
      },
    });
  }
}
```

---

### 14.2 Movie Feature — ระบบหนัง

#### movie.model.ts

```typescript
export enum MovieCategory {
  Action = 'Action',         // แอ็คชั่น
  Comedy = 'Comedy',         // ตลก
  Science_Fiction = 'Science_Fiction', // ใช้ _ เพราะ space ใช้ใน enum key ไม่ได้
  // ...
}

export interface Movie {
  id: string;
  title: string;
  plot: string;         // เนื้อเรื่อง
  price: number;
  duration: string;     // เช่น "02:10:00" (2 ชั่วโมง 10 นาที)
  category: MovieCategory;
  posterUrl?: string;   // ? = optional, อาจไม่มีโปสเตอร์
  createdAt: string;
  updatedAt: string;
}
```

#### movie-detail.ts — หน้าละเอียดของหนัง

หน้านี้ซับซ้อนที่สุดในโปรเจค จัดการทั้งรอบฉาย, ที่นั่ง, และการจอง

```typescript
export class MovieDetail {
  // ── ดึง id จาก URL ──
  private movieId$ = this.route.paramMap.pipe(
    map(p => p.get('id') ?? '')
  );
  // movieId$ เป็น Observable ($suffix เป็น convention บอกว่าเป็น Observable)

  // ── โหลดข้อมูลหนัง ──
  movie = toSignal(
    this.movieId$.pipe(
      switchMap(id => this.movieService.getById(id))
      // เมื่อ id เปลี่ยน (เช่น navigate ไปหนังอื่น)
      // switchMap ยกเลิก request เดิม และสร้างใหม่ด้วย id ใหม่
    )
  );

  // ── จัดกลุ่มที่นั่งตาม row ──
  seatsByRow = computed<SeatRow[]>(() => {
    const grouped = new Map<string, Seat[]>();
    // Map คือ data structure เก็บ key-value คล้าย object แต่ flexible กว่า

    for (const seat of this.seats()) {
      const row = seat.seatCode.charAt(0);
      // seatCode เช่น 'A1' → row = 'A'
      // charAt(0) = ตัวอักษรแรก
      if (!grouped.has(row)) grouped.set(row, []);
      grouped.get(row)!.push(seat);
      // ! = Non-null assertion บอก TypeScript ว่าค่านี้ไม่ใช่ null แน่นอน
    }

    return [...grouped.entries()] // แปลง Map → Array
      .sort((a, b) => b[0].localeCompare(a[0]))
      // เรียง row จาก Z → A (แถวหลังสุดก่อน เหมือนโรงหนังจริง)
      .map(([rowKey, rowSeats]) => {
        rowSeats.sort((a, b) =>
          parseInt(a.seatCode.slice(1)) - parseInt(b.seatCode.slice(1))
        );
        // เรียงที่นั่งในแต่ละ row ตามเลข: A1, A2, A3...
        // slice(1) = ตัดตัวแรก (row letter) ออก → เหลือแค่เลข

        const isVip = rowSeats.every(s => s.type === SeatType.VIP);
        // .every() = true ถ้าทุกที่นั่งใน row เป็น VIP

        const couples: [Seat, Seat][] = [];
        if (isVip) {
          for (let i = 0; i + 1 < rowSeats.length; i += 2) {
            couples.push([rowSeats[i], rowSeats[i + 1]]);
            // จับคู่ที่นั่ง VIP: (A1,A2), (A3,A4), ...
          }
        }
        return { rowKey, seats: rowSeats, isVip, couples };
      });
  });

  bookSeats() {
    forkJoin(
      seats.map(s => this.bookingService.book(s.id, showtime.id))
      // สร้าง Observable สำหรับแต่ละที่นั่ง
      // forkJoin รอให้ทุกตัวเสร็จก่อน
    ).subscribe({
      next: (tickets) => {
        // อัปเดต seats ที่จองแล้วใน UI ทันที (ไม่ต้อง reload)
        const bookedIds = new Set(seats.map(s => s.id));
        this.seats.update(all =>
          all.map(s => bookedIds.has(s.id)
            ? { ...s, status: SeatStatus.Booked }
            // ...s = spread operator: copy ทุก property แล้วแทนที่ status
            : s
          )
        );
      }
    });
  }
}
```

---

### 14.3 Booking Feature — ระบบจองตั๋ว

#### seat.model.ts

```typescript
export enum SeatStatus {
  Available = 'Available', // ว่าง จองได้
  Locked = 'Locked',       // ถูก lock ชั่วคราว (มีคนกำลังจอง)
  Booked = 'Booked',       // จองแล้ว
}

export enum SeatType {
  Normal = 'Normal',  // ที่นั่งธรรมดา
  VIP = 'VIP',        // ที่นั่ง VIP (นั่งคู่)
}

export interface Seat {
  id: string;
  showtimeId: string;
  seatCode: string;   // เช่น 'A1', 'B3', 'VIP-1'
  type: SeatType;
  price: number;
  status: SeatStatus;
}
```

---

### 14.4 Wallet Feature — กระเป๋าเงิน

#### wallet.service.ts

```typescript
@Injectable({ providedIn: 'root' })
export class WalletService {
  private _balance = signal<number | null>(null);
  // null = ยังไม่โหลด, number = ยอดเงิน

  balance = this._balance.asReadonly();

  loadBalance() {
    this.http.get<WalletResponse>(`${this.baseUrl}/balance`, this.options)
      .subscribe({ next: res => this._balance.set(res.balance) });
  }

  deposit(amount: number) {
    return this.http.post<WalletResponse>(
      `${this.baseUrl}/deposit`, { amount }, this.options
    ).pipe(
      tap(res => this._balance.set(res.balance))
      // tap: อัปเดต balance signal ระหว่างทาง
      // Observable ยังคงไหลต่อไปยัง subscriber
    );
  }
}
```

---

### 14.5 Admin Feature — แผงควบคุมผู้ดูแล

#### dashboard.ts — หน้า Admin Dashboard

```typescript
export class AdminDashboard {
  // Tab ที่เลือกอยู่ (banner | movie | showtime)
  activeTab = signal<'banner' | 'movie' | 'showtime'>('movie');
  // ใช้ Union Type: ค่าที่เป็นไปได้ 3 อย่าง

  // ── Form fields ──
  movieForm = {
    title: '',
    category: null as MovieCategory | null,
    // null as MovieCategory | null = ค่าเริ่มต้น null แต่ type เป็น MovieCategory หรือ null
  };

  submitMovie() {
    const form = new FormData();
    form.append('duration',
      [this.movieForm.durationHours, this.movieForm.durationMinutes, this.movieForm.durationSeconds]
        .map(v => String(v).padStart(2, '0'))
        // padStart(2, '0') = เติม 0 ข้างหน้าถ้าน้อยกว่า 2 ตัว
        // เช่น 5 → '05', 12 → '12'
        .join(':')
        // join(':') = เชื่อมด้วย ':' → '02:10:00'
    );
  }
}
```

---

### 14.6 Shared Components

#### navbar.ts — Navbar + Mobile Sidebar

```typescript
export class Navbar {
  showSidebar = signal(false); // ควบคุมการเปิด/ปิด sidebar

  navigate(path: string) {
    this.closeSidebar();        // ปิด sidebar ก่อน
    this.router.navigate([path]); // แล้วค่อย navigate
  }
}
```

Navbar ทำงาน 2 โหมด:
- **Desktop (≥ lg, ≥1024px):** แสดงลิงก์ nav และ auth controls ตรงๆ บน navbar
- **Mobile/Tablet (< lg):** แสดงแค่ Logo + ปุ่ม hamburger → กดเพื่อเปิด sidebar

```html
<!-- Sidebar panel: อยู่ใน DOM ตลอด แต่ซ่อนนอกจอด้วย translate -->
<div
  class="fixed top-0 right-0 h-full w-72 lg:hidden transition-transform duration-300"
  [class.translate-x-0]="showSidebar()"
  [class.translate-x-full]="!showSidebar()"
>
  <!-- translate-x-full = เลื่อนออกนอกจอไปทางขวา 100% (ซ่อน) -->
  <!-- translate-x-0 = อยู่ในตำแหน่งปกติ (แสดง) -->
  <!-- transition-transform duration-300 = animation 300ms -->
</div>
```

---

### 14.7 Pages (นอก features)

#### src/pages/movie/movie.ts — หน้ารายการหนังทั้งหมด

```typescript
export class Movie {
  allMovies = toSignal(this.movieService.getAll(), { initialValue: [] });

  moviesByCategory = computed<CategoryGroup[]>(() => {
    const grouped = new Map<string, MovieModel[]>();
    for (const movie of this.allMovies()) {
      if (!grouped.has(movie.category)) grouped.set(movie.category, []);
      grouped.get(movie.category)!.push(movie);
    }
    return [...grouped.entries()].map(([category, movies]) => ({ category, movies }));
    // แปลง Map entries → array ของ { category, movies }
  });
  // ผลลัพธ์: [{ category: 'Action', movies: [...] }, { category: 'Comedy', movies: [...] }]

  categoryLabel(cat: string): string {
    return cat.replace(/_/g, ' ');
    // /g = global flag: แทนที่ทุก _ ไม่ใช่แค่ตัวแรก
    // 'Science_Fiction' → 'Science Fiction'
  }
}
```

---

## สรุปภาพรวมการทำงาน

```
ผู้ใช้เปิดเว็บ
    ↓
Angular bootstrap (main.ts)
    ↓
App Component (app.ts) render
    ↓
Router ดู URL → เลือก Component ที่ match
    ↓
Component โหลด → ngOnInit → เรียก Service
    ↓
Service เรียก HttpClient → API (http://localhost:5074)
    ↓
ข้อมูลกลับมา → update Signal
    ↓
Angular detect Signal เปลี่ยน → re-render HTML อัตโนมัติ
```

---

*เอกสารนี้ครอบคลุมโค้ดทุกส่วนของ Frontend ณ วันที่เขียน*
