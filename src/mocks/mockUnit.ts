import { Unit, UnitType } from "@/models/Unit";
import { AbstractMock } from "@/utils/abstract-mock";

const defaultData: Unit[] = [
  // Miền Bắc
  ...(() => {
    const cities = [
      "Hà Nội",
      "Hải Phòng",
      "Quảng Ninh",
      "Bắc Ninh",
      "Nam Định",
    ];
    const wards = [
      ["Ba Đình", "Hoàn Kiếm", "Đống Đa", "Hai Bà Trưng", "Cầu Giấy"],
      ["Hồng Bàng", "Lê Chân", "Ngô Quyền", "Kiến An", "Dương Kinh"],
      ["Hạ Long", "Cẩm Phả", "Uông Bí", "Móng Cái", "Quảng Yên"],
      ["Bắc Ninh", "Từ Sơn", "Quế Võ", "Yên Phong", "Thuận Thành"],
      ["Nam Định", "Mỹ Lộc", "Vụ Bản", "Ý Yên", "Trực Ninh"],
    ];
    const result: Unit[] = [
      {
        id: "mien-bac",
        name: "Miền Bắc",
        type: UnitType.DEPARTMENT,
        parentId: null,
        path: "/mien-bac",
      },
      {
        id: "admin-mien-bac",
        name: "Admin Miền Bắc",
        type: UnitType.EMPLOYEE,
        parentId: "mien-bac",
        path: "/mien-bac/admin",
      },
    ];
    cities.forEach((city, i) => {
      const cityId = `mb-city-${i}`;
      result.push({
        id: cityId,
        name: city,
        type: UnitType.DEPARTMENT,
        parentId: "mien-bac",
        path: `/mien-bac/${cityId}`,
      });
      result.push({
        id: `admin-${cityId}`,
        name: `Admin ${city}`,
        type: UnitType.EMPLOYEE,
        parentId: cityId,
        path: `/mien-bac/${cityId}/admin`,
      });
      wards[i].forEach((ward, j) => {
        const wardId = `${cityId}-ward-${j}`;
        result.push({
          id: wardId,
          name: ward,
          type: UnitType.DEPARTMENT,
          parentId: cityId,
          path: `/mien-bac/${cityId}/${wardId}`,
        });
        result.push({
          id: `admin-${wardId}`,
          name: `Admin ${ward}`,
          type: UnitType.EMPLOYEE,
          parentId: wardId,
          path: `/mien-bac/${cityId}/${wardId}/admin`,
        });
      });
    });
    return result;
  })(),
  // Miền Trung
  ...(() => {
    const cities = ["Đà Nẵng", "Huế", "Quảng Nam", "Quảng Ngãi", "Bình Định"];
    const wards = [
      ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu"],
      ["Phú Hội", "Phú Nhuận", "Thuận Thành", "Tây Lộc", "Vĩnh Ninh"],
      ["Tam Kỳ", "Hội An", "Điện Bàn", "Núi Thành", "Duy Xuyên"],
      ["Quảng Ngãi", "Đức Phổ", "Sơn Tịnh", "Tư Nghĩa", "Bình Sơn"],
      ["Quy Nhơn", "An Nhơn", "Tuy Phước", "Phù Cát", "Hoài Nhơn"],
    ];
    const result: Unit[] = [
      {
        id: "mien-trung",
        name: "Miền Trung",
        type: UnitType.DEPARTMENT,
        parentId: null,
        path: "/mien-trung",
      },
      {
        id: "admin-mien-trung",
        name: "Admin Miền Trung",
        type: UnitType.EMPLOYEE,
        parentId: "mien-trung",
        path: "/mien-trung/admin",
      },
    ];
    cities.forEach((city, i) => {
      const cityId = `mt-city-${i}`;
      result.push({
        id: cityId,
        name: city,
        type: UnitType.DEPARTMENT,
        parentId: "mien-trung",
        path: `/mien-trung/${cityId}`,
      });
      result.push({
        id: `admin-${cityId}`,
        name: `Admin ${city}`,
        type: UnitType.EMPLOYEE,
        parentId: cityId,
        path: `/mien-trung/${cityId}/admin`,
      });
      wards[i].forEach((ward, j) => {
        const wardId = `${cityId}-ward-${j}`;
        result.push({
          id: wardId,
          name: ward,
          type: UnitType.DEPARTMENT,
          parentId: cityId,
          path: `/mien-trung/${cityId}/${wardId}`,
        });
        result.push({
          id: `admin-${wardId}`,
          name: `Admin ${ward}`,
          type: UnitType.EMPLOYEE,
          parentId: wardId,
          path: `/mien-trung/${cityId}/${wardId}/admin`,
        });
      });
    });
    return result;
  })(),
  // Miền Nam
  ...(() => {
    const cities = ["TP. HCM", "Cần Thơ", "Vũng Tàu", "Đồng Nai", "Bình Dương"];
    const wards = [
      ["Thủ Đức", "Quận 1", "Quận 3", "Quận 7", "Bình Thạnh"],
      ["Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn", "Thốt Nốt"],
      ["Vũng Tàu", "Bà Rịa", "Long Điền", "Đất Đỏ", "Xuyên Mộc"],
      ["Biên Hòa", "Long Khánh", "Trảng Bom", "Vĩnh Cửu", "Nhơn Trạch"],
      ["Thủ Dầu Một", "Dĩ An", "Thuận An", "Bến Cát", "Tân Uyên"],
    ];
    const result: Unit[] = [
      {
        id: "mien-nam",
        name: "Miền Nam",
        type: UnitType.DEPARTMENT,
        parentId: null,
        path: "/mien-nam",
      },
      {
        id: "admin-mien-nam",
        name: "Admin Miền Nam",
        type: UnitType.EMPLOYEE,
        parentId: "mien-nam",
        path: "/mien-nam/admin",
      },
    ];
    cities.forEach((city, i) => {
      const cityId = `mn-city-${i}`;
      result.push({
        id: cityId,
        name: city,
        type: UnitType.DEPARTMENT,
        parentId: "mien-nam",
        path: `/mien-nam/${cityId}`,
      });
      result.push({
        id: `admin-${cityId}`,
        name: `Admin ${city}`,
        type: UnitType.EMPLOYEE,
        parentId: cityId,
        path: `/mien-nam/${cityId}/admin`,
      });
      wards[i].forEach((ward, j) => {
        const wardId = `${cityId}-ward-${j}`;
        result.push({
          id: wardId,
          name: ward,
          type: UnitType.DEPARTMENT,
          parentId: cityId,
          path: `/mien-nam/${cityId}/${wardId}`,
        });
        result.push({
          id: `admin-${wardId}`,
          name: `Admin ${ward}`,
          type: UnitType.EMPLOYEE,
          parentId: wardId,
          path: `/mien-nam/${cityId}/${wardId}/admin`,
        });
      });
    });
    return result;
  })(),
];

export const mockUnits = new AbstractMock<Unit>({
  defaultData,
});
