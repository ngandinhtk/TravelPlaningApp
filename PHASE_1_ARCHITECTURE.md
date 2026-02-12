# 🏗️ Phase 1 (Lite MVP) Architecture & Folder Structure

Tài liệu này mô tả cấu trúc thư mục và file cần thiết để triển khai các tính năng Phase 1 (Lite MVP) - Tối ưu chi phí và hiệu năng.

## 💡 Strategic Decision: Local-First & Low Cost

After reviewing `travel-app-features-no-ai.md`, the decision is to prioritize a **Lite, Local-First MVP**. We will focus on building core features that run offline and require zero API costs.

Complex AI and expensive cloud synchronizations are removed for this phase to ensure the app is lightweight and free to operate.

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
│   │   ├── index.jsx           # Manual Entry / Local Search
│   │   └── [id].jsx            # Place Detail
│   └── templates/              # 📋 Template System (Feature #2)
│       ├── index.jsx           # Browse Templates
│       └── [id].jsx            # Template Detail -> Clone Trip
├── components/
│   ├── trip/
│   │   ├── TripCard.jsx
│   │   └── ItineraryItem.jsx
│   ├── map/
│   │   └── MapMarker.jsx
│   └── budget/
│       └── ExpenseChart.jsx
├── context/
│   ├── AppProviders.jsx        # Wrapper for all contexts
│   ├── UserContext.jsx         # 👤 User Auth State (Optional/Local)
│   └── TripContext.jsx
└── services/
    ├── storageService.ts       # 💾 Local Storage (AsyncStorage/SQLite)
    ├── tripService.ts          # CRUD Trips (Local)
    ├── placeService.ts         # Places Data (Static/Manual)
    ├── templateService.ts      # Templates
    └── budgetService.ts        # Budget Logic
```

## 🚀 Implementation Roadmap

### 1. Trip Management (Core)

- **Files**: `app/(tabs)/trips/index.jsx`, `services/tripService.ts`
- **Task**: Hiển thị danh sách chuyến đi, tạo chuyến đi mới.
- **Data Collection**: Track `trip_created`, `trip_viewed` for future AI analysis.

### 2. Places Database & Map

- **Files**: `app/places/*`, `app/(tabs)/map/index.jsx`, `services/placeService.ts`
- **Task**: Database địa điểm (Mock data hoặc API), hiển thị trên bản đồ.
- **Data Collection**: Track `place_viewed`, `place_searched`. The `FeedbackModal` in `places/[id].jsx` is crucial for collecting user ratings, a key dataset.

### 3. Template System

- **Files**: `app/templates/*`, `services/templateService.ts`
- **Task**: Cho phép user chọn template để clone thành trip của mình.
- **Data Collection**: Track `template_viewed`, `template_used` to understand template popularity.

### 4. Itinerary Builder

- **Files**: `app/trip/[id]/itinerary.jsx`
- **Task**: Kéo thả hoặc thêm/xóa địa điểm vào các ngày.
- **Data Collection**: Track `activity_added`, `activity_removed`.

### 5. Budget Tracker

- **Files**: `app/trip/[id]/budget.jsx`, `services/budgetService.ts`
- **Task**: Nhập chi phí, biểu đồ tròn đơn giản.
- **Data Collection**: Track `budget_updated`.

---

_Generated based on travel-app-features-no-ai.md & COMPOUNDING_INTELLIGENCE.md_
