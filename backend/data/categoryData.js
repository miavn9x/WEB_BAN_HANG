// categoryData.js (tùy chọn)
const categoryOptions = {
  "Sữa bột cao cấp": [
    "Sữa bột cho bé 0-6 tháng",
    "Sữa bột cho bé 6-12 tháng",
    "Sữa bột cho bé 1-3 tuổi",
    "Sữa bột cho bé 3-5 tuổi",
    "Sữa bột organic",
    "Sữa non tăng đề kháng",
  ],
  "Sữa dinh dưỡng": [
    "Sữa cho mẹ bầu",
    "Sữa tăng canxi cho bà bầu",
    "Sữa cho mẹ sau sinh",
    "Sữa cho bé từ 1 tuổi",
    "Sữa tăng chiều cao cho bé 3-5 tuổi",
  ],
  "Bỉm & Tã em bé": [
    "Bỉm sơ sinh (< 5kg)",
    "Bỉm size S (4-8kg)",
    "Bỉm size M (6-11kg)",
    "Bỉm size L (9-14kg)",
    "Bỉm size XL (12-17kg)",
    "Bỉm quần cho bé tập đi",
  ],
  "Đồ chơi em bé": [
    "Đồ chơi bé gái",
    "Đồ chơi bé trai",
    "Sách, học tập",
    "Đồ chơi sơ sinh",
    "Scooter, vận động",
  ],
  "Chăm sóc gia đình": [
    "Chăm sóc da bầu (chống rạn)",
    "Dầu massage bầu",
    "Kem dưỡng da cho bé",
    "Dầu tắm gội cho bé",
    "Phấn rôm chống hăm",
    "Nhiệt kế & Máy hút mũi",
  ],
  "Thời trang mẹ và bé": [
    "Đồ bầu theo tháng (1-8 tháng)",
    "Váy bầu công sở",
    "Đồ sau sinh",
    "Quần áo sơ sinh (0-12 tháng)",
    "Quần áo bé 1-3 tuổi",
    "Quần áo bé 3-5 tuổi",
  ],
  "Dinh dưỡng bà bầu": [
    "Vitamin tổng hợp cho bà bầu",
    "Sắt và axit folic",
    "Canxi và Vitamin D3",
    "Omega 3 và DHA",
    "Sữa bầu công thức đặc biệt",
  ],
  "Ăn dặm cho bé": [
    "Bột ăn dặm 6-8 tháng",
    "Bột ăn dặm 8-12 tháng",
    "Cháo ăn dặm 12-24 tháng",
    "Bánh ăn dặm",
    "Vitamin & Khoáng chất ăn dặm",
    "Dụng cụ ăn dặm",
  ],
  "Dinh dưỡng cho bé": [
    "Vitamin tổng hợp cho bé 0-12 tháng",
    "Vitamin cho bé 1-3 tuổi",
    "Vitamin cho bé 3-5 tuổi",
    "Men vi sinh cho bé",
    "Kẽm & Sắt cho bé",
    "DHA cho bé",
  ],
  "Đồ dùng thiết yếu": [
    "Máy hút sữa & Phụ kiện",
    "Bình sữa & Núm ti",
    "Máy tiệt trùng & Hâm sữa",
    "Nôi & Cũi cho bé",
    "Xe đẩy & Địu",
    "Ghế ăn & Ghế rung",
  ],
};

const predefinedBrandsByCategory = {
  'Sữa': [
    "Vinamilk",
    "Dielac",
    "TH True Milk",
    "Mami",
    "Friso",
    "Meiji",
    "Aptamil",
    "Similac",
    "Enfamil",
    "Nestlé",
  ],
  "Bỉm & Tã": ["Pampers", "Huggies", "MamyPoko", "Bambo Nature"],
  "Chăm sóc & Dinh dưỡng": [
    "Pigeon",
    "Mee Mee",
    "Johnson's Baby",
    "Abbott",
    "Mead Johnson",
    "Hersheys",
  ],
  "Thời trang & Đồ dùng": [
    "Mothercare",
    "Carter's",
    "OshKosh B'gosh",
    "Zara Kids",
    "Mother & Baby",
  ],
  "Nổi Bật": [
    "Fisher-Price",
    "Chicco",
    "Blackmores",
    "aribaly",
    "hikid",
    "meadjohnson",
    "blackmores",
    "arifood",
    "aptamil",
    "cosmic light",
  ],
};

module.exports = { categoryOptions, predefinedBrandsByCategory };
