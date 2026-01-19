export interface TransportOption {
  id: string;
  type: string;
  icon: string;
  duration: string;
  priceRange: string;
  description: string;
  bookingUrl: string;
}

export const getTransportOptions = async (
  destination: string,
): Promise<TransportOption[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock data - Trong thực tế, phần này sẽ gọi API để lấy dữ liệu dựa trên điểm đi và điểm đến
  // Hiện tại trả về dữ liệu gợi ý chung cho du lịch trong nước
  return [
    {
      id: "plane",
      type: "Máy bay",
      icon: "plane",
      duration: "1h - 2h (Bay)",
      priceRange: "1.200.000 - 3.500.000 VNĐ",
      description:
        "Phương tiện nhanh nhất. Phù hợp cho khoảng cách xa (>500km).",
      bookingUrl: "https://www.traveloka.com/vi-vn/flight",
    },
    {
      id: "train",
      type: "Tàu hỏa",
      icon: "train",
      duration: "16h - 20h",
      priceRange: "600.000 - 1.500.000 VNĐ",
      description:
        "An toàn, ngắm cảnh đẹp dọc đường. Phù hợp người có thời gian.",
      bookingUrl: "https://dsvn.vn/",
    },
    {
      id: "bus",
      type: "Xe khách",
      icon: "bus",
      duration: "12h - 18h",
      priceRange: "300.000 - 800.000 VNĐ",
      description: "Tiết kiệm chi phí nhất. Nhiều chuyến xe chạy đêm.",
      bookingUrl: "https://vexere.com/",
    },
    {
      id: "car",
      type: "Xe tự lái / Taxi",
      icon: "car",
      duration: "Linh hoạt",
      priceRange: "1.000.000 - 2.000.000 VNĐ/ngày",
      description: "Tự do về lịch trình. Phù hợp nhóm nhỏ hoặc gia đình.",
      bookingUrl: "https://www.mioto.vn/",
    },
  ];
};
