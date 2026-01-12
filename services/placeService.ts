import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';

const placesCollection = collection(db, 'places');

export interface Place {
  id?: string;
  name: string;
  province: string; // e.g., "Lâm Đồng", "Đà Nẵng"
  description: string;
  category: string; // e.g., "Di tích", "Biển", "Núi", "Ẩm thực"
  imageUrl?: string;
  address?: string;
  rating?: number;
}

// Get all places, sorted by province for easier grouping if needed
export const getAllPlaces = async () => {
  try {
    const q = query(placesCollection, orderBy('province'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching all places:', error);
    return [];
  }
};

// Get places filtered by a specific province
export const getPlacesByProvince = async (province: string) => {
  try {
    const q = query(placesCollection, where('province', '==', province));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching places for province ${province}:`, error);
    return [];
  }
};

// Add a new place (Useful for admin seeding)
export const addPlace = async (placeData: Place) => {
  try {
    const docRef = await addDoc(placesCollection, placeData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding place:', error);
    throw error;
  }
};

// Get list of available provinces
// In a production app, this might come from a separate 'provinces' collection or be aggregated.
export const getProvincesList = async () => {
  return [
    'Lâm Đồng',
    'Đà Nẵng',
    'Hà Nội',
    'Hồ Chí Minh',
    'Quảng Ninh',
    'Lào Cai',
    'Thừa Thiên Huế',
    'Quảng Nam',
    'Ninh Bình',
    'Khánh Hòa'
  ];
};

// Dữ liệu mẫu được thu thập từ Google Maps & Wikipedia
export const SAMPLE_PLACES_DATA: Place[] = [
  {
    name: "Hồ Hoàn Kiếm",
    province: "Hà Nội",
    description: "Trái tim của thủ đô, gắn liền với truyền thuyết rùa thần và lịch sử ngàn năm văn hiến. Nổi bật với Tháp Rùa và Đền Ngọc Sơn.",
    category: "Nature",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Sword_Lake_2013.jpg/800px-Sword_Lake_2013.jpg",
    rating: 4.8,
    address: "Hoàn Kiếm, Hà Nội"
  },
  {
    name: "Vịnh Hạ Long",
    province: "Quảng Ninh",
    description: "Di sản thiên nhiên thế giới UNESCO với hàng nghìn hòn đảo đá vôi lớn nhỏ tạo nên khung cảnh kỳ vĩ và thơ mộng.",
    category: "Nature",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Halong_Bay_02.jpg/800px-Halong_Bay_02.jpg",
    rating: 4.9,
    address: "Thành phố Hạ Long, Quảng Ninh"
  },
  {
    name: "Phố Cổ Hội An",
    province: "Quảng Nam",
    description: "Thương cảng sầm uất thế kỷ 15-19, nổi tiếng với kiến trúc cổ kính, đèn lồng rực rỡ và ẩm thực đường phố đặc sắc.",
    category: "History",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Hoi_An_Ancient_Town.jpg/800px-Hoi_An_Ancient_Town.jpg",
    rating: 4.9,
    address: "Minh An, Hội An, Quảng Nam"
  },
  {
    name: "Cầu Vàng - Bà Nà Hills",
    province: "Đà Nẵng",
    description: "Cây cầu bộ hành ấn tượng được nâng đỡ bởi hai bàn tay khổng lồ, nằm trên đỉnh Bà Nà mờ sương.",
    category: "Mountain",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Golden_Bridge_Da_Nang.jpg/800px-Golden_Bridge_Da_Nang.jpg",
    rating: 4.7,
    address: "Hòa Vang, Đà Nẵng"
  },
  {
    name: "Đại Nội Huế",
    province: "Thừa Thiên Huế",
    description: "Hoàng thành của triều Nguyễn, lưu giữ những giá trị lịch sử, văn hóa và kiến trúc cung đình độc đáo của Việt Nam.",
    category: "History",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Hue_Imperial_City_Gate.jpg/800px-Hue_Imperial_City_Gate.jpg",
    rating: 4.6,
    address: "Thành phố Huế, Thừa Thiên Huế"
  },
  {
    name: "Chợ Bến Thành",
    province: "Hồ Chí Minh",
    description: "Biểu tượng của Sài Gòn, nơi tập trung đầy đủ các mặt hàng truyền thống, quà lưu niệm và ẩm thực đặc sắc.",
    category: "Culture",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Ben_Thanh_Market_2014.jpg/800px-Ben_Thanh_Market_2014.jpg",
    rating: 4.5,
    address: "Quận 1, TP. Hồ Chí Minh"
  },
  {
    name: "Fansipan Legend",
    province: "Lào Cai",
    description: "Nóc nhà Đông Dương, nơi du khách có thể chinh phục đỉnh núi cao nhất Việt Nam bằng hệ thống cáp treo hiện đại.",
    category: "Mountain",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Fansipan_summit.jpg/800px-Fansipan_summit.jpg",
    rating: 4.8,
    address: "Sa Pa, Lào Cai"
  },
  {
    name: "Tràng An",
    province: "Ninh Bình",
    description: "Quần thể danh thắng Tràng An với hệ thống hang động, núi đá vôi và sông nước hữu tình, được ví như Hạ Long trên cạn.",
    category: "Nature",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Trang_An_Scenic_Landscape_Complex.jpg/800px-Trang_An_Scenic_Landscape_Complex.jpg",
    rating: 4.8,
    address: "Hoa Lư, Ninh Bình"
  },
  {
    name: "Quảng trường Lâm Viên",
    province: "Lâm Đồng",
    description: "Biểu tượng của Đà Lạt với nụ hoa Atiso và hoa Dã Quỳ khổng lồ bằng kính màu, hướng ra Hồ Xuân Hương.",
    category: "Culture",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Lam_Vien_Square.jpg/800px-Lam_Vien_Square.jpg",
    rating: 4.6,
    address: "Phường 10, Đà Lạt, Lâm Đồng"
  },
  {
    name: "Biển Mỹ Khê",
    province: "Đà Nẵng",
    description: "Một trong những bãi biển quyến rũ nhất hành tinh với cát trắng mịn, nước biển trong xanh và hàng dừa thơ mộng.",
    category: "Beach",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/My_Khe_Beach_%28Da_Nang%29.jpg/800px-My_Khe_Beach_%28Da_Nang%29.jpg",
    rating: 4.7,
    address: "Sơn Trà, Đà Nẵng"
  }
];

export const seedPlaces = async (keyword: string = 'Địa điểm du lịch', province: string = '') => {
  try {
    // Tìm kiếm địa điểm từ Google dựa trên keyword và province
    // Nếu province là 'All' hoặc rỗng, searchPlacesViaGoogle sẽ xử lý (hoặc ta truyền 'Việt Nam')
    const searchLocation = (province && province !== 'All') ? province : 'Việt Nam';
    const places = await searchPlacesViaGoogle(keyword, searchLocation);

    if (!places || places.length === 0) return false;

    const promises = places.map((place : Place) => addPlace(place));
    await Promise.all(promises);
    console.log(`Imported ${places.length} places from Google successfully!`);
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};

// --- Google Places API Integration ---
// Lưu ý: Bạn cần thay thế bằng API Key thực tế của mình và kích hoạt Places API trong Google Cloud Console.
const GOOGLE_API_KEY = 'AIzaSyBegk7sxF2-P6AftB5MZacOQbFxU6PZHkc'; 

export const searchPlacesViaGoogle = async (keyword: string, province: string) => {
  if (!GOOGLE_API_KEY) {
    console.warn('Vui lòng cấu hình Google API Key trong services/placeService.ts');
    return [];
  }

  // Tạo câu truy vấn: ví dụ "địa điểm du lịch ở Đà Nẵng" hoặc "cafe ở Hà Nội"
  const query = `${keyword || 'địa điểm du lịch'} ở ${province}`;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&language=vi`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      return data.results.map((item: any) => ({
        name: item.name,
        province: province,
        description: item.formatted_address || 'Không có mô tả chi tiết từ Google.',
        category: mapGoogleTypeToCategory(item.types),
        imageUrl: item.photos && item.photos.length > 0 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${GOOGLE_API_KEY}` 
          : null,
        rating: item.rating,
        address: item.formatted_address
      }));
    } else {
      console.error('Google Places API Error:', data.status, data.error_message);
      return [];
    }
  } catch (error) {
    console.error('Network error fetching Google Places:', error);
    return [];
  }
};

const mapGoogleTypeToCategory = (types: string[] = []) => {
  if (types.includes('museum') || types.includes('church') || types.includes('hindu_temple') || types.includes('place_of_worship') || types.includes('synagogue') || types.includes('mosque')) return 'History';
  
  if (types.includes('park') || types.includes('natural_feature') || types.includes('campground') || types.includes('rv_park')) return 'Nature';
  
  if (types.includes('restaurant') || types.includes('cafe') || types.includes('food') || types.includes('bakery') || types.includes('bar') || types.includes('night_club')) return 'Food';
  
  if (types.includes('lodging')) return 'Hotel';
  
  if (types.includes('amusement_park') || types.includes('tourist_attraction') || types.includes('aquarium') || types.includes('zoo') || types.includes('art_gallery') || types.includes('library') || types.includes('university') || types.includes('town_square') || types.includes('stadium') || types.includes('shopping_mall') || types.includes('point_of_interest')) return 'Culture';
  
  return 'Google Place';
};