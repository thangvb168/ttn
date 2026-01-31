import { Unit, UnitType } from "@/models/Unit";
import { AbstractMock } from "@/utils/abstract-mock";

// Helper to slugify names for IDs
const toSlug = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/^-+|-+$/g, "");
};

const hanoiData = [
  {
    name: "Ba Đình",
    wards: [
      "Phúc Xá",
      "Trúc Bạch",
      "Vĩnh Phúc",
      "Cống Vị",
      "Liễu Giai",
      "Nguyễn Trung Trực",
      "Quán Thánh",
      "Ngọc Hà",
      "Điện Biên",
      "Đội Cấn",
    ],
  },
  {
    name: "Hoàn Kiếm",
    wards: [
      "Phúc Tân",
      "Đồng Xuân",
      "Hàng Mã",
      "Hàng Buồm",
      "Hàng Đào",
      "Hàng Bồ",
      "Cửa Đông",
      "Cửa Nam",
      "Hàng Gai",
      "Hàng Bông",
    ],
  },
  {
    name: "Đống Đa",
    wards: [
      "Cát Linh",
      "Văn Miếu",
      "Quốc Tử Giám",
      "Láng Thượng",
      "Ô Chợ Dừa",
      "Văn Chương",
      "Hàng Bột",
      "Láng Hạ",
      "Khâm Thiên",
      "Thổ Quan",
    ],
  },
  {
    name: "Hai Bà Trưng",
    wards: [
      "Nguyễn Du",
      "Bạch Đằng",
      "Phạm Đình Hổ",
      "Bùi Thị Xuân",
      "Ngô Thì Nhậm",
      "Lê Đại Hành",
      "Đồng Nhân",
      "Phố Huế",
      "Đống Mác",
      "Thanh Lương",
    ],
  },
  {
    name: "Thanh Xuân",
    wards: [
      "Hạ Đình",
      "Kim Giang",
      "Khương Đình",
      "Khương Mai",
      "Khương Trung",
      "Nhân Chính",
      "Phương Liệt",
      "Thanh Xuân Bắc",
      "Thanh Xuân Nam",
      "Thanh Xuân Trung",
    ],
  },
  {
    name: "Hoàng Mai",
    wards: [
      "Hoàng Liệt",
      "Yên Sở",
      "Vĩnh Hưng",
      "Định Công",
      "Đại Kim",
      "Thịnh Liệt",
      "Thanh Trì",
      "Lĩnh Nam",
      "Trần Phú",
      "Mai Động",
    ],
  },
  {
    name: "Long Biên",
    wards: [
      "Thượng Thanh",
      "Giang Biên",
      "Ngọc Thụy",
      "Việt Hưng",
      "Phúc Lợi",
      "Thạch Bàn",
      "Cự Khối",
      "Gia Thụy",
      "Bồ Đề",
      "Long Biên",
    ],
  },
  {
    name: "Hà Đông",
    wards: [
      "Nguyễn Trãi",
      "Mộ Lao",
      "Văn Quán",
      "Vạn Phúc",
      "Yết Kiêu",
      "Quang Trung",
      "La Khê",
      "Phú La",
      "Phúc La",
      "Hà Cầu",
    ],
  },
  {
    name: "Nam Từ Liêm",
    wards: [
      "Cầu Diễn",
      "Mỹ Đình 1",
      "Mỹ Đình 2",
      "Phú Đô",
      "Mễ Trì",
      "Trung Văn",
      "Đại Mỗ",
      "Tây Mỗ",
      "Phương Canh",
      "Xuân Phương",
    ],
  },
  {
    name: "Bắc Từ Liêm",
    wards: [
      "Thượng Cát",
      "Liên Mạc",
      "Thụy Phương",
      "Minh Khai",
      "Tây Tựu",
      "Đông Ngạc",
      "Đức Thắng",
      "Xuân Đỉnh",
      "Xuân Tảo",
      "Cổ Nhuế 1",
    ],
  },
];

const defaultData: Unit[] = [
  // Hà Nội
  ...(() => {
    const provinceId = "province-hanoi";
    const result: Unit[] = [
      {
        id: provinceId,
        name: "Hà Nội",
        type: UnitType.DEPARTMENT,
        parentId: null,
        path: "/hanoi",
      },
      {
        id: `admin-${provinceId}`,
        name: "Admin Hà Nội",
        type: UnitType.EMPLOYEE,
        parentId: provinceId,
        path: `/hanoi/admin`,
      },
    ];

    hanoiData.forEach((district, i) => {
      const districtSlug = toSlug(district.name);
      const districtId = `district-${districtSlug}`;

      result.push({
        id: districtId,
        name: district.name,
        type: UnitType.DEPARTMENT,
        parentId: provinceId,
        path: `/hanoi/${districtId}`,
      });
      result.push({
        id: `admin-${districtId}`,
        name: `Admin ${district.name}`,
        type: UnitType.EMPLOYEE,
        parentId: districtId,
        path: `/hanoi/${districtId}/admin`,
      });

      district.wards.forEach((wardName, j) => {
        const wardSlug = toSlug(wardName);
        // Use 'ward-' prefix to maintain compatibility with device generation logic if it relies on string parsing
        const wardId = `ward-${districtSlug}-${wardSlug}`;

        result.push({
          id: wardId,
          name: wardName,
          type: UnitType.DEPARTMENT,
          parentId: districtId,
          path: `/hanoi/${districtId}/${wardId}`,
        });
        result.push({
          id: `admin-${wardId}`,
          name: `Admin ${wardName}`,
          type: UnitType.EMPLOYEE,
          parentId: wardId,
          path: `/hanoi/${districtId}/${wardId}/admin`,
        });
      });
    });
    return result;
  })(),
];

export const mockUnits = new AbstractMock<Unit>({
  defaultData,
});
