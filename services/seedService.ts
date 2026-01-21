import {
    collection,
    doc,
    getDocs,
    query,
    where,
    writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

const SAMPLE_TEMPLATES = [
  {
    name: "Hà Nội - Food Tour Phố Cổ 🍜",
    destination: "Hà Nội",
    duration: 2,
    budgetMin: 1500000,
    budgetMax: 3000000,
    tripType: "Food",
    highlights: ["Phở Bát Đàn", "Cà phê trứng", "Bún chả Hương Liên"],
    itinerary: [
      {
        day: 1,
        title: "Tinh hoa ẩm thực Bắc",
        activities: [
          {
            time: "07:00",
            title: "Ăn sáng Phở Bát Đàn",
            location: "49 Bát Đàn",
          },
          {
            time: "09:00",
            title: "Cafe Trứng Giảng",
            location: "39 Nguyễn Hữu Huân",
          },
          { time: "12:00", title: "Bún chả Obama", location: "Lê Văn Hưu" },
          {
            time: "18:00",
            title: "Food tour Tạ Hiện",
            location: "Phố Tạ Hiện",
          },
        ],
      },
      {
        day: 2,
        title: "Cafe & Ăn vặt",
        activities: [
          { time: "08:00", title: "Bánh cuốn Thanh Vân", location: "Hàng Gà" },
          { time: "14:00", title: "Kem Tràng Tiền", location: "Tràng Tiền" },
          { time: "16:00", title: "Nem chua nướng", location: "Ngõ Ấu Triệu" },
        ],
      },
    ],
    packingList: [
      { text: "Thuốc tiêu hóa", category: "Health", isChecked: false },
      { text: "Tiền mặt lẻ", category: "Essentials", isChecked: false },
    ],
  },
  {
    name: "Hà Nội - Dấu ấn lịch sử 🏯",
    destination: "Hà Nội",
    duration: 3,
    budgetMin: 2000000,
    budgetMax: 4000000,
    tripType: "Culture",
    highlights: ["Lăng Bác", "Văn Miếu", "Hoàng Thành Thăng Long"],
    itinerary: [
      {
        day: 1,
        title: "Về nguồn",
        activities: [
          { time: "08:00", title: "Viếng Lăng Bác", location: "Ba Đình" },
          {
            time: "14:00",
            title: "Văn Miếu Quốc Tử Giám",
            location: "Đống Đa",
          },
        ],
      },
      {
        day: 2,
        title: "Di sản thế giới",
        activities: [
          {
            time: "09:00",
            title: "Hoàng Thành Thăng Long",
            location: "Hoàng Diệu",
          },
          { time: "15:00", title: "Nhà tù Hỏa Lò", location: "Hoàn Kiếm" },
        ],
      },
      {
        day: 3,
        title: "Nghệ thuật truyền thống",
        activities: [
          {
            time: "09:00",
            title: "Bảo tàng Dân tộc học",
            location: "Cầu Giấy",
          },
          {
            time: "16:00",
            title: "Xem Múa Rối Nước",
            location: "Nhà hát Thăng Long",
          },
        ],
      },
    ],
    packingList: [
      { text: "Trang phục lịch sự", category: "Clothing", isChecked: false },
      { text: "Giày đi bộ", category: "Clothing", isChecked: false },
    ],
  },
  {
    name: "Hà Nội & Ninh Bình Escape 🚣",
    destination: "Hà Nội",
    duration: 2,
    budgetMin: 3000000,
    budgetMax: 5000000,
    tripType: "Nature",
    highlights: ["Tràng An", "Hang Múa", "Hồ Gươm"],
    itinerary: [
      {
        day: 1,
        title: "Khám phá Ninh Bình",
        activities: [
          {
            time: "07:00",
            title: "Di chuyển đi Ninh Bình",
            location: "Xe Limousine",
          },
          { time: "10:00", title: "Đi thuyền Tràng An", location: "Tràng An" },
          { time: "15:00", title: "Leo Hang Múa", location: "Hang Múa" },
        ],
      },
      {
        day: 2,
        title: "Thư giãn Hà Nội",
        activities: [
          { time: "09:00", title: "Dạo Hồ Gươm", location: "Hoàn Kiếm" },
          { time: "14:00", title: "Cafe đường tàu", location: "Phùng Hưng" },
        ],
      },
    ],
    packingList: [
      { text: "Giày thể thao", category: "Clothing", isChecked: false },
      { text: "Mũ nón", category: "Accessories", isChecked: false },
    ],
  },
  {
    name: "Đà Nẵng - Biển xanh vẫy gọi 🌊",
    destination: "Đà Nẵng",
    duration: 3,
    budgetMin: 4000000,
    budgetMax: 7000000,
    tripType: "Beach",
    highlights: ["Biển Mỹ Khê", "Bán đảo Sơn Trà", "Cầu Rồng"],
    itinerary: [
      {
        day: 1,
        title: "Chào Đà Nẵng",
        activities: [
          {
            time: "14:00",
            title: "Check-in khách sạn",
            location: "Gần biển Mỹ Khê",
          },
          { time: "16:00", title: "Tắm biển Mỹ Khê", location: "Biển Mỹ Khê" },
          { time: "19:00", title: "Ăn hải sản", location: "Quán Bé Mặn" },
        ],
      },
      {
        day: 2,
        title: "Khám phá Sơn Trà",
        activities: [
          {
            time: "08:00",
            title: "Chùa Linh Ứng",
            location: "Bán đảo Sơn Trà",
          },
          { time: "16:00", title: "Ngắm hoàng hôn", location: "Cầu Tình Yêu" },
          {
            time: "21:00",
            title: "Xem Cầu Rồng phun lửa",
            location: "Cầu Rồng",
          },
        ],
      },
      {
        day: 3,
        title: "Mua sắm & Tạm biệt",
        activities: [
          { time: "09:00", title: "Chợ Cồn", location: "Hải Châu" },
          { time: "12:00", title: "Ra sân bay", location: "Sân bay Đà Nẵng" },
        ],
      },
    ],
    packingList: [
      { text: "Đồ bơi", category: "Clothing", isChecked: false },
      { text: "Kem chống nắng", category: "Toiletries", isChecked: false },
    ],
  },
  {
    name: "Đà Nẵng - Bà Nà Hills Fantasy 🏰",
    destination: "Đà Nẵng",
    duration: 2,
    budgetMin: 3000000,
    budgetMax: 6000000,
    tripType: "Adventure",
    highlights: ["Cầu Vàng", "Làng Pháp", "Fantasy Park"],
    itinerary: [
      {
        day: 1,
        title: "Lên đỉnh Bà Nà",
        activities: [
          { time: "08:00", title: "Đi cáp treo", location: "Bà Nà Hills" },
          { time: "10:00", title: "Check-in Cầu Vàng", location: "Cầu Vàng" },
          {
            time: "14:00",
            title: "Vui chơi Fantasy Park",
            location: "Khu vui chơi",
          },
        ],
      },
      {
        day: 2,
        title: "City Tour",
        activities: [
          { time: "09:00", title: "Bảo tàng Chăm", location: "Trung tâm" },
          {
            time: "14:00",
            title: "Cafe view sông Hàn",
            location: "Đường Bạch Đằng",
          },
        ],
      },
    ],
    packingList: [
      { text: "Áo khoác mỏng", category: "Clothing", isChecked: false },
      { text: "Giày êm chân", category: "Clothing", isChecked: false },
    ],
  },
  {
    name: "Đà Nẵng & Hội An Hoài Cổ 🏮",
    destination: "Đà Nẵng",
    duration: 4,
    budgetMin: 5000000,
    budgetMax: 8000000,
    tripType: "Culture",
    highlights: ["Phố cổ Hội An", "Ngũ Hành Sơn", "Rừng dừa Bảy Mẫu"],
    itinerary: [
      {
        day: 1,
        title: "Đà Nẵng - Ngũ Hành Sơn",
        activities: [
          {
            time: "14:00",
            title: "Thăm Ngũ Hành Sơn",
            location: "Ngũ Hành Sơn",
          },
          { time: "17:00", title: "Di chuyển về Hội An", location: "Hội An" },
        ],
      },
      {
        day: 2,
        title: "Sống chậm ở Hội An",
        activities: [
          { time: "09:00", title: "Rừng dừa Bảy Mẫu", location: "Cẩm Thanh" },
          { time: "15:00", title: "Dạo phố cổ", location: "Phố cổ Hội An" },
          { time: "19:00", title: "Thả đèn hoa đăng", location: "Sông Hoài" },
        ],
      },
      {
        day: 3,
        title: "Ký ức Hội An",
        activities: [
          { time: "08:00", title: "Cafe Mót", location: "Trần Phú" },
          {
            time: "20:00",
            title: "Show Ký ức Hội An",
            location: "Công viên Ấn tượng",
          },
        ],
      },
      {
        day: 4,
        title: "Tạm biệt",
        activities: [
          { time: "09:00", title: "Mua đèn lồng", location: "Chợ Hội An" },
          { time: "12:00", title: "Ra sân bay Đà Nẵng", location: "Sân bay" },
        ],
      },
    ],
    packingList: [
      { text: "Váy/Áo dài chụp ảnh", category: "Clothing", isChecked: false },
      { text: "Nón lá", category: "Accessories", isChecked: false },
    ],
  },
  {
    name: "Sài Gòn - Hòn ngọc Viễn Đông 🏙️",
    destination: "Hồ Chí Minh",
    duration: 2,
    budgetMin: 2000000,
    budgetMax: 5000000,
    tripType: "History",
    highlights: ["Dinh Độc Lập", "Nhà thờ Đức Bà", "Bưu điện Thành phố"],
    itinerary: [
      {
        day: 1,
        title: "Biểu tượng Sài Gòn",
        activities: [
          { time: "08:00", title: "Nhà thờ Đức Bà", location: "Quận 1" },
          { time: "09:00", title: "Bưu điện Thành phố", location: "Quận 1" },
          {
            time: "14:00",
            title: "Dinh Độc Lập",
            location: "Nam Kỳ Khởi Nghĩa",
          },
        ],
      },
      {
        day: 2,
        title: "Bảo tàng & Mua sắm",
        activities: [
          {
            time: "09:00",
            title: "Bảo tàng Chứng tích Chiến tranh",
            location: "Võ Văn Tần",
          },
          { time: "15:00", title: "Chợ Bến Thành", location: "Quận 1" },
        ],
      },
    ],
    packingList: [
      {
        text: "Ô/Dù (Mưa nắng thất thường)",
        category: "Accessories",
        isChecked: false,
      },
      { text: "Bình nước", category: "Essentials", isChecked: false },
    ],
  },
  {
    name: "Sài Gòn - Nightlife & Street Food 🍻",
    destination: "Hồ Chí Minh",
    duration: 2,
    budgetMin: 3000000,
    budgetMax: 6000000,
    tripType: "Relax",
    highlights: ["Phố đi bộ Nguyễn Huệ", "Bùi Viện", "Landmark 81"],
    itinerary: [
      {
        day: 1,
        title: "Sài Gòn không ngủ",
        activities: [
          {
            time: "18:00",
            title: "Hóng gió Phố đi bộ",
            location: "Nguyễn Huệ",
          },
          { time: "20:00", title: "Ăn ốc", location: "Quận 4" },
          {
            time: "22:00",
            title: "Quẩy Bùi Viện",
            location: "Phố Tây Bùi Viện",
          },
        ],
      },
      {
        day: 2,
        title: "View từ trên cao",
        activities: [
          { time: "10:00", title: "Cafe bệt", location: "Công viên 30/4" },
          {
            time: "17:00",
            title: "Ngắm hoàng hôn Landmark 81",
            location: "Bình Thạnh",
          },
          { time: "20:00", title: "Dinner Cruise", location: "Sông Sài Gòn" },
        ],
      },
    ],
    packingList: [
      { text: "Trang phục dự tiệc", category: "Clothing", isChecked: false },
      { text: "Sạc dự phòng", category: "Electronics", isChecked: false },
    ],
  },
  {
    name: "Sài Gòn & Miền Tây Sông Nước 🛶",
    destination: "Hồ Chí Minh",
    duration: 3,
    budgetMin: 3000000,
    budgetMax: 5000000,
    tripType: "Nature",
    highlights: ["Chợ nổi Cái Bè", "Cù lao Thới Sơn", "Chùa Vĩnh Tràng"],
    itinerary: [
      {
        day: 1,
        title: "Về miền Tây",
        activities: [
          {
            time: "07:00",
            title: "Khởi hành đi Mỹ Tho",
            location: "Xe du lịch",
          },
          { time: "10:00", title: "Chùa Vĩnh Tràng", location: "Mỹ Tho" },
          {
            time: "13:00",
            title: "Đi thuyền Cù lao Thới Sơn",
            location: "Sông Tiền",
          },
        ],
      },
      {
        day: 2,
        title: "Chợ nổi & Miệt vườn",
        activities: [
          { time: "05:00", title: "Chợ nổi Cái Bè", location: "Tiền Giang" },
          { time: "10:00", title: "Thăm lò kẹo dừa", location: "Bến Tre" },
          { time: "16:00", title: "Về lại Sài Gòn", location: "Hồ Chí Minh" },
        ],
      },
      {
        day: 3,
        title: "Nghỉ ngơi & Mua sắm",
        activities: [
          { time: "10:00", title: "Saigon Centre", location: "Lê Lợi" },
          { time: "14:00", title: "Cafe chung cư", location: "42 Nguyễn Huệ" },
        ],
      },
    ],
    packingList: [
      { text: "Thuốc chống muỗi", category: "Health", isChecked: false },
      { text: "Mũ rộng vành", category: "Accessories", isChecked: false },
    ],
  },
  {
    name: "Sài Gòn - Shopping & Cafe ☕",
    destination: "Hồ Chí Minh",
    duration: 2,
    budgetMin: 4000000,
    budgetMax: 8000000,
    tripType: "Relax",
    highlights: ["Takashimaya", "Chung cư 42 Nguyễn Huệ", "Thảo Điền"],
    itinerary: [
      {
        day: 1,
        title: "Thiên đường mua sắm",
        activities: [
          {
            time: "10:00",
            title: "Shopping Takashimaya",
            location: "Saigon Centre",
          },
          { time: "15:00", title: "Vincom Đồng Khởi", location: "Lý Tự Trọng" },
          { time: "19:00", title: "Ăn tối Pizza 4P's", location: "Bến Thành" },
        ],
      },
      {
        day: 2,
        title: "Art & Cafe",
        activities: [
          { time: "09:00", title: "Khám phá Thảo Điền", location: "Quận 2" },
          {
            time: "14:00",
            title: "The Factory Contemporary Arts",
            location: "Thảo Điền",
          },
          { time: "17:00", title: "Cafe view sông", location: "The Deck" },
        ],
      },
    ],
    packingList: [
      { text: "Thẻ tín dụng", category: "Essentials", isChecked: false },
      { text: "Giày thoải mái", category: "Clothing", isChecked: false },
    ],
  },
  {
    name: "Nha Trang - Thiên đường biển đảo 🏖️",
    destination: "Nha Trang",
    duration: 3,
    budgetMin: 3000000,
    budgetMax: 6000000,
    tripType: "Beach",
    highlights: ["VinWonders", "Đảo Hòn Mun", "Tháp Bà Ponagar"],
    itinerary: [
      {
        day: 1,
        title: "Khám phá thành phố",
        activities: [
          { time: "09:00", title: "Tháp Bà Ponagar", location: "Đường 2/4" },
          { time: "14:00", title: "Tắm bùn I-Resort", location: "Vĩnh Ngọc" },
          { time: "19:00", title: "Ăn nem nướng", location: "Đặng Văn Quyên" },
        ],
      },
      {
        day: 2,
        title: "Vui chơi VinWonders",
        activities: [
          {
            time: "08:00",
            title: "Cáp treo vượt biển",
            location: "Cảng Cầu Đá",
          },
          {
            time: "09:00",
            title: "VinWonders Nha Trang",
            location: "Đảo Hòn Tre",
          },
        ],
      },
      {
        day: 3,
        title: "Tour đảo",
        activities: [
          { time: "08:00", title: "Tour 3 đảo", location: "Vịnh Nha Trang" },
          { time: "15:00", title: "Mua sắm Chợ Đầm", location: "Chợ Đầm" },
        ],
      },
    ],
    packingList: [
      { text: "Đồ bơi", category: "Clothing", isChecked: false },
      { text: "Kính râm", category: "Accessories", isChecked: false },
    ],
  },
];

export const seedTemplates = async () => {
  try {
    const templatesRef = collection(db, "templates");
    const batch = writeBatch(db);
    let addedCount = 0;

    for (const template of SAMPLE_TEMPLATES) {
      // Kiểm tra xem template với tên này đã tồn tại chưa
      const q = query(templatesRef, where("name", "==", template.name));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        const docRef = doc(templatesRef); // Tự động sinh ID
        batch.set(docRef, {
          ...template,
          createdAt: new Date().toISOString(),
          isSample: true,
        });
        addedCount++;
      }
    }

    if (addedCount > 0) {
      await batch.commit();
      return {
        success: true,
        message: `Đã thêm ${addedCount} lịch trình mẫu mới!`,
      };
    } else {
      return { success: true, message: "Tất cả lịch trình mẫu đã tồn tại." };
    }
  } catch (error: any) {
    console.error("Error seeding templates:", error);
    return { success: false, message: error.message };
  }
};
