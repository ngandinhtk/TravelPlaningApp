# 🏗️ Phase 1 (MVP) Architecture & Folder Structure

Tài liệu này mô tả cấu trúc thư mục và file cần thiết để triển khai các tính năng Phase 1 (MVP) kết hợp với hệ thống Compounding Intelligence.

## 📂 Project Structure Overview

```text
my-first-app/
├── app/
│   ├── (auth)/                 # Authentication (Login, Register)
│   ├── (tabs)/
│   │   ├── home/               # Dashboard, IntelligenceCard
│   │   ├── map/                # 🗺️ Map Integration (Feature #5)
│   │   ├── trips/              # ✈️ Trip Management (Feature #1)
│   │   └── profile/
│   ├── trip/
│   │   └── [id]/
│   │       ├── index.jsx       # Trip Details Overview
│   │       ├── itinerary.jsx   # 📅 Itinerary Builder (Feature #2)
│   │       ├── budget.jsx      # 💰 Budget Tracker (Feature #6)
│   │       ├── checklist.jsx   # ✅ Checklist (Existing)
│   │       └── settings.jsx    # Edit/Delete Trip
│   ├── places/                 # 🏙️ Places Database (Feature #3)
│   │   ├── index.jsx           # Search & Filter Places
│   │   └── [id].jsx            # Place Detail + FeedbackModal
│   └── templates/              # 📋 Template System (Feature #2)
│       ├── index.jsx           # Browse Templates
│       └── [id].jsx            # Template Detail -> Clone Trip
│   ├── admin/
│   │   ├── intelligence.jsx    # 🧠 AI Dashboard (Internal/Admin)
│   │   └── compoundingIntelligenceNextSteps.js # 🧪 Beta AI Features Logic
├── components/
│   ├── common/
│   │   ├── FeedbackModal.tsx   # 🧠 AI Feedback Collection
│   │   └── IntelligenceCard.tsx # 🧠 AI Dashboard Widget
│   ├── trip/
│   │   ├── TripCard.jsx
│   │   └── ItineraryItem.jsx
│   ├── map/
│   │   └── MapMarker.jsx
│   └── budget/
│       └── ExpenseChart.jsx
├── context/
│   ├── AppProviders.jsx        # Wrapper for all contexts
│   ├── UserContext.jsx         # 👤 User Auth State
│   ├── IntelligenceContext.jsx # 🧠 AI Logic
│   └── TripContext.jsx
│   └── OfflineContext.jsx      # 🔌 Offline Mode & Sync (Phase 3)
└── services/
    ├── firebase.js             # 🔥 Firebase Config
    ├── compoundingIntelligenceService.ts # 🧠 AI Service
    ├── tripService.ts          # CRUD Trips
    ├── placeService.ts         # Places Data
    ├── templateService.ts      # Templates
    └── budgetService.ts        # Budget Logic
    └── offlineService.ts       # 💾 Local Storage & Sync Queue (Phase 3)
```

## 🚀 Implementation Roadmap

### 1. Trip Management (Core)

- **Files**: `app/(tabs)/trips/index.jsx`, `services/tripService.ts`
- **Task**: Hiển thị danh sách chuyến đi, tạo chuyến đi mới.
- **AI Integration**: Track `trip_created`, `trip_viewed`.

### 2. Places Database & Map

- **Files**: `app/places/*`, `app/(tabs)/map/index.jsx`, `services/placeService.ts`
- **Task**: Database địa điểm (Mock data hoặc API), hiển thị trên bản đồ.
- **AI Integration**: Track `place_viewed`, `place_searched`. Thêm `FeedbackModal` vào `places/[id].jsx`.

### 3. Template System

- **Files**: `app/templates/*`, `services/templateService.ts`
- **Task**: Cho phép user chọn template để clone thành trip của mình.
- **AI Integration**: Track `template_viewed`, `template_used`.

### 4. Itinerary Builder

- **Files**: `app/trip/[id]/itinerary.jsx`
- **Task**: Kéo thả hoặc thêm/xóa địa điểm vào các ngày.

### 5. Budget Tracker

- **Files**: `app/trip/[id]/budget.jsx`, `services/budgetService.ts`
- **Task**: Nhập chi phí, biểu đồ tròn đơn giản.
- **AI Integration**: Track `budget_updated`.

---

_Generated based on travel-app-features-no-ai.md & COMPOUNDING_INTELLIGENCE.md_
