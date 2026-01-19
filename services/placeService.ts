import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const placesCollection = collection(db, "places");

export interface Place {
  id?: string;
  name: string;
  province: string; // e.g., "Lâm Đồng", "Đà Nẵng"
  description: string;
  category: string; // e.g., "Di tích", "Biển", "Núi", "Ẩm thực"
  imageUrl?: string;
  location?: { lat: number; lng: number };
  address?: string;
  rating?: number;
  recommendedMonths?: number[];
}

// Get all places, sorted by province for easier grouping if needed
export const getAllPlaces = async () => {
  try {
    const q = query(placesCollection, orderBy("province"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching all places:", error);
    return [];
  }
};

// Get places filtered by a specific province
export const getPlacesByProvince = async (province: string) => {
  try {
    const q = query(placesCollection, where("province", "==", province));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching places for province ${province}:`, error);
    return [];
  }
};

// Get places recommended for a specific month
export const getSeasonalPlaces = async (month: number) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return SAMPLE_PLACES_DATA.filter((place) => {
    if (place.recommendedMonths) {
      return place.recommendedMonths.includes(month);
    }

    // Logic gợi ý mặc định nếu chưa có dữ liệu tháng cụ thể
    // Mùa Xuân (Tháng 1-3): Du xuân, lễ hội, miền Bắc & Đà Lạt
    if (month >= 1 && month <= 3) {
      return (
        ["Hà Nội", "Ninh Bình", "Lâm Đồng", "Lào Cai"].includes(
          place.province,
        ) ||
        place.category === "Culture" ||
        place.category === "History"
      );
    }
    // Mùa Hè (Tháng 4-7): Biển đảo
    if (month >= 4 && month <= 7) {
      return (
        ["Đà Nẵng", "Quảng Ninh", "Khánh Hòa", "Quảng Nam"].includes(
          place.province,
        ) ||
        place.category === "Beach" ||
        place.category === "Nature"
      );
    }
    // Mùa Thu (Tháng 8-10): Hà Nội, Tây Bắc
    if (month >= 8 && month <= 10) {
      return (
        ["Hà Nội", "Lào Cai", "Hà Giang"].includes(place.province) ||
        place.category === "Mountain"
      );
    }
    // Mùa Đông (Tháng 11-12): Săn mây, tránh rét phương Nam
    if (month >= 11 || month <= 12) {
      return (
        ["Hồ Chí Minh", "Lâm Đồng", "Lào Cai"].includes(place.province) ||
        place.category === "Mountain" ||
        place.category === "Culture"
      );
    }
    return false;
  });
};

// Add a new place (Useful for admin seeding)
export const addPlace = async (placeData: Place) => {
  try {
    const docRef = await addDoc(placesCollection, placeData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding place:", error);
    throw error;
  }
};

const PROVINCES = [
  "Lâm Đồng",
  "Đà Nẵng",
  "Hà Nội",
  "Hồ Chí Minh",
  "Quảng Ninh",
  "Lào Cai",
  "Thừa Thiên Huế",
  "Quảng Nam",
  "Ninh Bình",
  "Khánh Hòa",
];

// Get list of available provinces
// In a production app, this might come from a separate 'provinces' collection or be aggregated.
export const getProvincesList = async () => {
  return PROVINCES;
};

// Dữ liệu mẫu được thu thập từ Google Maps & Wikipedia
export const SAMPLE_PLACES_DATA: Place[] = [
  {
    name: "Hồ Hoàn Kiếm",
    province: "Hà Nội",
    description:
      "Trái tim của thủ đô, gắn liền với truyền thuyết rùa thần và lịch sử ngàn năm văn hiến. Nổi bật với Tháp Rùa và Đền Ngọc Sơn.",
    category: "Nature",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Sword_Lake_2013.jpg/800px-Sword_Lake_2013.jpg",
    rating: 4.8,
    address: "Hoàn Kiếm, Hà Nội",
    location: { lat: 21.028667, lng: 105.852148 },
    recommendedMonths: [1, 2, 3, 8, 9, 10, 11, 12],
  },
  {
    name: "Vịnh Hạ Long",
    province: "Quảng Ninh",
    description:
      "Di sản thiên nhiên thế giới UNESCO với hàng nghìn hòn đảo đá vôi lớn nhỏ tạo nên khung cảnh kỳ vĩ và thơ mộng.",
    category: "Nature",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Halong_Bay_02.jpg/800px-Halong_Bay_02.jpg",
    rating: 4.9,
    address: "Thành phố Hạ Long, Quảng Ninh",
    location: { lat: 20.910057, lng: 107.183903 },
  },
  {
    name: "Phố Cổ Hội An",
    province: "Quảng Nam",
    description:
      "Thương cảng sầm uất thế kỷ 15-19, nổi tiếng với kiến trúc cổ kính, đèn lồng rực rỡ và ẩm thực đường phố đặc sắc.",
    category: "History",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Hoi_An_Ancient_Town.jpg/800px-Hoi_An_Ancient_Town.jpg",
    rating: 4.9,
    address: "Minh An, Hội An, Quảng Nam",
    location: { lat: 15.880058, lng: 108.338047 },
  },
  {
    name: "Cầu Vàng - Bà Nà Hills",
    province: "Đà Nẵng",
    description:
      "Cây cầu bộ hành ấn tượng được nâng đỡ bởi hai bàn tay khổng lồ, nằm trên đỉnh Bà Nà mờ sương.",
    category: "Mountain",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Golden_Bridge_Da_Nang.jpg/800px-Golden_Bridge_Da_Nang.jpg",
    rating: 4.7,
    address: "Hòa Vang, Đà Nẵng",
    location: { lat: 15.995396, lng: 107.996341 },
  },
  {
    name: "Đại Nội Huế",
    province: "Thừa Thiên Huế",
    description:
      "Hoàng thành của triều Nguyễn, lưu giữ những giá trị lịch sử, văn hóa và kiến trúc cung đình độc đáo của Việt Nam.",
    category: "History",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Hue_Imperial_City_Gate.jpg/800px-Hue_Imperial_City_Gate.jpg",
    rating: 4.6,
    address: "Thành phố Huế, Thừa Thiên Huế",
    location: { lat: 16.469888, lng: 107.578745 },
  },
  {
    name: "Chợ Bến Thành",
    province: "Hồ Chí Minh",
    description:
      "Biểu tượng của Sài Gòn, nơi tập trung đầy đủ các mặt hàng truyền thống, quà lưu niệm và ẩm thực đặc sắc.",
    category: "Culture",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Ben_Thanh_Market_2014.jpg/800px-Ben_Thanh_Market_2014.jpg",
    rating: 4.5,
    address: "Quận 1, TP. Hồ Chí Minh",
    location: { lat: 10.772109, lng: 106.698269 },
  },
  {
    name: "Fansipan Legend",
    province: "Lào Cai",
    description:
      "Nóc nhà Đông Dương, nơi du khách có thể chinh phục đỉnh núi cao nhất Việt Nam bằng hệ thống cáp treo hiện đại.",
    category: "Mountain",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Fansipan_summit.jpg/800px-Fansipan_summit.jpg",
    rating: 4.8,
    address: "Sa Pa, Lào Cai",
    location: { lat: 22.303389, lng: 103.775194 },
  },
  {
    name: "Tràng An",
    province: "Ninh Bình",
    description:
      "Quần thể danh thắng Tràng An với hệ thống hang động, núi đá vôi và sông nước hữu tình, được ví như Hạ Long trên cạn.",
    category: "Nature",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Trang_An_Scenic_Landscape_Complex.jpg/800px-Trang_An_Scenic_Landscape_Complex.jpg",
    rating: 4.8,
    address: "Hoa Lư, Ninh Bình",
    location: { lat: 20.254333, lng: 105.916111 },
  },
  {
    name: "Quảng trường Lâm Viên",
    province: "Lâm Đồng",
    description:
      "Biểu tượng của Đà Lạt với nụ hoa Atiso và hoa Dã Quỳ khổng lồ bằng kính màu, hướng ra Hồ Xuân Hương.",
    category: "Culture",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Lam_Vien_Square.jpg/800px-Lam_Vien_Square.jpg",
    rating: 4.6,
    address: "Phường 10, Đà Lạt, Lâm Đồng",
    location: { lat: 11.939833, lng: 108.443917 },
  },
  {
    name: "Biển Mỹ Khê",
    province: "Đà Nẵng",
    description:
      "Một trong những bãi biển quyến rũ nhất hành tinh với cát trắng mịn, nước biển trong xanh và hàng dừa thơ mộng.",
    category: "Beach",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/My_Khe_Beach_%28Da_Nang%29.jpg/800px-My_Khe_Beach_%28Da_Nang%29.jpg",
    rating: 4.7,
    address: "Sơn Trà, Đà Nẵng",
    location: { lat: 16.060222, lng: 108.245194 },
  },
  {
    name: "Lăng Chủ tịch Hồ Chí Minh",
    province: "Hà Nội",
    description:
      "Nơi an nghỉ vĩnh hằng của Chủ tịch Hồ Chí Minh, vị lãnh tụ kính yêu của dân tộc Việt Nam, nằm tại quảng trường Ba Đình lịch sử.",
    category: "History",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ho_Chi_Minh_Mausoleum_-_Hanoi.jpg/800px-Ho_Chi_Minh_Mausoleum_-_Hanoi.jpg",
    rating: 4.8,
    address: "Ba Đình, Hà Nội",
    location: { lat: 21.036778, lng: 105.834722 },
  },
  {
    name: "Văn Miếu - Quốc Tử Giám",
    province: "Hà Nội",
    description:
      "Trường đại học đầu tiên của Việt Nam, nơi thờ Khổng Tử và các bậc hiền triết, biểu tượng của tinh thần hiếu học ngàn đời.",
    category: "History",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Khue_Van_Cac_2013.jpg/800px-Khue_Van_Cac_2013.jpg",
    rating: 4.7,
    address: "Đống Đa, Hà Nội",
    location: { lat: 21.029333, lng: 105.836028 },
  },
  {
    name: "Dinh Độc Lập",
    province: "Hồ Chí Minh",
    description:
      "Di tích lịch sử quốc gia đặc biệt, nơi chứng kiến sự kiện Giải phóng miền Nam, thống nhất đất nước ngày 30/4/1975.",
    category: "History",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Reunification_Palace%2C_Ho_Chi_Minh_City.jpg/800px-Reunification_Palace%2C_Ho_Chi_Minh_City.jpg",
    rating: 4.6,
    address: "Quận 1, TP. Hồ Chí Minh",
    location: { lat: 10.776972, lng: 106.695333 },
  },
  {
    name: "Nhà thờ Đức Bà Sài Gòn",
    province: "Hồ Chí Minh",
    description:
      "Kiệt tác kiến trúc Roman pha trộn Gothic, biểu tượng của thành phố với hai tháp chuông cao vút và gạch đỏ đặc trưng.",
    category: "Culture",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Notre_Dame_Cathedral_Saigon.jpg/800px-Notre_Dame_Cathedral_Saigon.jpg",
    rating: 4.7,
    address: "Quận 1, TP. Hồ Chí Minh",
    location: { lat: 10.779778, lng: 106.699028 },
  },
  {
    name: "Phố đi bộ Nguyễn Huệ",
    province: "Hồ Chí Minh",
    description:
      "Con phố sầm uất và hiện đại nhất Sài Gòn, nơi diễn ra các hoạt động văn hóa, lễ hội và vui chơi giải trí về đêm.",
    category: "Culture",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Nguyen_Hue_Walking_Street_at_night.jpg/800px-Nguyen_Hue_Walking_Street_at_night.jpg",
    rating: 4.5,
    address: "Quận 1, TP. Hồ Chí Minh",
    location: { lat: 10.774361, lng: 106.703528 },
  },
  {
    name: "Ngũ Hành Sơn",
    province: "Đà Nẵng",
    description:
      "Quần thể 5 ngọn núi đá vôi ven biển với nhiều hang động huyền bí và các ngôi chùa cổ kính linh thiêng.",
    category: "Nature",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Marble_Mountains_Da_Nang.jpg/800px-Marble_Mountains_Da_Nang.jpg",
    rating: 4.6,
    address: "Ngũ Hành Sơn, Đà Nẵng",
    location: { lat: 16.004222, lng: 108.263111 },
  },
  {
    name: "Cầu Rồng",
    province: "Đà Nẵng",
    description:
      "Cây cầu độc đáo với thiết kế hình con rồng thời Lý, có khả năng phun lửa và phun nước vào các tối cuối tuần.",
    category: "Culture",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Dragon_Bridge_Da_Nang_Night.jpg/800px-Dragon_Bridge_Da_Nang_Night.jpg",
    rating: 4.8,
    address: "Hải Châu, Đà Nẵng",
    location: { lat: 16.061111, lng: 108.222722 },
  },
];

export const seedPlaces = async (
  keyword: string = "Địa điểm du lịch",
  province: string = "",
) => {
  try {
    // Tìm kiếm địa điểm từ Google dựa trên keyword và province
    // Nếu province là 'All' hoặc rỗng, searchPlacesViaGoogle sẽ xử lý (hoặc ta truyền 'Việt Nam')
    const searchLocation =
      province && province !== "All" ? province : "Việt Nam";
    const places = await searchPlacesViaGoogle(keyword, searchLocation);

    if (!places || places.length === 0) return false;

    const promises = places.map((place: Place) => addPlace(place));
    await Promise.all(promises);
    console.log(`Imported ${places.length} places from Google successfully!`);
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    return false;
  }
};

// --- Google Places API Integration ---
// Lưu ý: Bạn cần thay thế bằng API Key thực tế của mình và kích hoạt Places API trong Google Cloud Console.
const GOOGLE_API_KEY = "AIzaSyBegk7sxF2-P6AftB5MZacOQbFxU6PZHkc";

// services/placeService.js

export const searchPlacesViaGoogle = async (
  query: string,
  province: string,
) => {
  const API_KEY = GOOGLE_API_KEY;

  // Kết hợp từ khóa và tỉnh thành để kết quả chính xác hơn
  // Ví dụ: "Cà phê" + "Lâm Đồng" -> "Cà phê in Lâm Đồng"
  const searchText = province === "All" ? query : `${query} in ${province}`;

  // Sử dụng Text Search API
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchText)}&key=${API_KEY}&language=vi`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (json.status === "OK") {
      return json.results.map((place: any) => {
        // Tự động phát hiện tỉnh thành từ địa chỉ nếu đang tìm kiếm 'All'
        let detectedProvince = province;
        if (province === "All" && place.formatted_address) {
          const address = place.formatted_address;
          const found = PROVINCES.find((p) => address.includes(p));
          if (found) detectedProvince = found;
          else if (
            address.includes("Hồ Chí Minh") ||
            address.includes("Ho Chi Minh")
          )
            detectedProvince = "Hồ Chí Minh";
          else detectedProvince = "Unknown";
        }

        return {
          // QUAN TRỌNG: Không gán thuộc tính 'id' ở đây.
          // Logic trong discover.jsx dựa vào việc không có 'id' để biết đây là địa điểm mới từ Google cần lưu vào DB.
          googleId: place.place_id,
          name: place.name,
          description: place.formatted_address, // Dùng địa chỉ làm mô tả
          address: place.formatted_address,
          rating: place.rating,
          category: mapGooglePlaceToCategory(place),
          // Xây dựng URL ảnh từ photo_reference (nếu có)
          imageUrl:
            place.photos && place.photos.length > 0
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${API_KEY}`
              : null,
          province: detectedProvince,
          location: place.geometry.location, // { lat, lng }
        };
      });
    } else {
      console.warn("Google Places API Error:", json.status, json.error_message);
      return [];
    }
  } catch (error) {
    console.error("Network error searching Google Places:", error);
    return [];
  }
};

const mapGooglePlaceToCategory = (place: any) => {
  const types = place.types || [];
  const name = place.name ? place.name.toLowerCase() : "";

  // 1. Phân loại dựa trên từ khóa trong tên (ưu tiên cao cho các địa danh cụ thể ở VN)
  if (
    name.includes("biển") ||
    name.includes("bãi") ||
    name.includes("vịnh") ||
    name.includes("đảo") ||
    name.includes("hòn") ||
    name.includes("beach") ||
    name.includes("island") ||
    name.includes("bay")
  )
    return "Beach";

  if (
    name.includes("núi") ||
    name.includes("đỉnh") ||
    name.includes("đèo") ||
    name.includes("cao nguyên") ||
    name.includes("mountain") ||
    name.includes("hill")
  )
    return "Mountain";

  if (
    name.includes("chùa") ||
    name.includes("đền") ||
    name.includes("miếu") ||
    name.includes("lăng") ||
    name.includes("tháp") ||
    name.includes("thành") ||
    name.includes("cố đô") ||
    name.includes("temple") ||
    name.includes("pagoda")
  )
    return "History";

  // 2. Phân loại dựa trên Google Types
  if (
    types.includes("museum") ||
    types.includes("church") ||
    types.includes("hindu_temple") ||
    types.includes("place_of_worship") ||
    types.includes("synagogue") ||
    types.includes("mosque")
  )
    return "History";

  if (
    types.includes("park") ||
    types.includes("natural_feature") ||
    types.includes("campground") ||
    types.includes("rv_park")
  )
    return "Nature";

  if (
    types.includes("restaurant") ||
    types.includes("cafe") ||
    types.includes("food") ||
    types.includes("bakery") ||
    types.includes("bar") ||
    types.includes("night_club")
  )
    return "Food";

  if (types.includes("lodging")) return "Hotel";

  if (
    types.includes("amusement_park") ||
    types.includes("tourist_attraction") ||
    types.includes("aquarium") ||
    types.includes("zoo") ||
    types.includes("art_gallery") ||
    types.includes("library") ||
    types.includes("university") ||
    types.includes("town_square") ||
    types.includes("stadium") ||
    types.includes("shopping_mall") ||
    types.includes("point_of_interest")
  )
    return "Culture";

  return "Google Place";
};
