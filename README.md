# Do_An_Du_Thi_Web_Desige


project/
├── node_modules/         # Thư viện npm
├── public/               # Tệp tĩnh (index.html, favicon, logo, v.v.)
│   └── index.html        # Điểm vào chính cho React
├── src/                  # Mã nguồn của ứng dụng
│   ├── components/       # Các thành phần React được chia nhỏ (các phần dùng chung)
│   │   ├── BabyMartNavbar.jsx  # Navbar component
│   │   ├── Footer.jsx          # Footer component
│   │   └── LoadingSpinner.jsx  # Component loading chung
│   ├── features/         # Các tính năng hoặc module cụ thể
│   │   ├── auth/         # Tính năng đăng nhập, đăng ký
│   │   │   ├── Login.jsx       # Component login
│   │   │   ├── Register.jsx    # Component register
│   │   │   ├── AuthAPI.js      # File chứa các API liên quan đến auth
│   │   │   └── authSlice.js    # Redux slice cho auth
│   │   ├── cart/         # Tính năng giỏ hàng
│   │   │   ├── Cart.jsx        # Component giỏ hàng
│   │   │   ├── CartAPI.js      # File chứa các API liên quan đến giỏ hàng
│   │   │   └── cartSlice.js    # Redux slice cho giỏ hàng
│   │   └── products/     # Tính năng quản lý sản phẩm
│   │       ├── ProductList.jsx # Component danh sách sản phẩm
│   │       ├── ProductDetails.jsx # Component chi tiết sản phẩm
│   │       ├── ProductAPI.js   # File chứa các API liên quan đến sản phẩm
│   │       └── productSlice.js # Redux slice cho sản phẩm
│   ├── layouts/          # Bố cục cho các trang
│   │   ├── MainLayout.jsx      # Bố cục chính cho trang
│   │   └── AuthLayout.jsx      # Bố cục cho trang login/register
│   ├── pages/            # Các trang chính của ứng dụng
│   │   ├── HomePage.jsx        # Trang chủ
│   │   ├── LoginPage.jsx       # Trang đăng nhập
│   │   ├── RegisterPage.jsx    # Trang đăng ký
│   │   ├── CartPage.jsx        # Trang giỏ hàng
│   │   ├── ProductPage.jsx     # Trang danh sách sản phẩm
│   │   └── ProductDetailsPage.jsx # Trang chi tiết sản phẩm
│   ├── routes/           # Quản lý route
│   │   └── AppRoutes.jsx       # Tệp định nghĩa các route
│   ├── hooks/            # Các custom hooks dùng chung
│   │   └── useAuth.js          # Hook kiểm tra trạng thái đăng nhập
│   ├── redux/            # Redux setup
│   │   ├── store.js            # Redux store
│   │   ├── rootReducer.js      # Tổng hợp các reducer
│   │   └── slices/             # Chứa các slice riêng lẻ
│   │       ├── authSlice.js    # Slice cho auth
│   │       ├── cartSlice.js    # Slice cho giỏ hàng
│   │       └── productSlice.js # Slice cho sản phẩm
│   ├── styles/           # Thư mục chứa các tệp CSS
│   │   ├── App.css             # File CSS chính
│   │   └── variables.css       # Biến CSS dùng chung
│   ├── utils/            # Các hàm tiện ích
│   │   ├── apiClient.js        # Axios client dùng chung
│   │   ├── formatCurrency.js   # Hàm format tiền tệ
│   │   └── validators.js       # Các hàm kiểm tra đầu vào
│   ├── App.js            # Thành phần App chính
│   ├── index.js          # Điểm khởi đầu của ứng dụng React
│   └── assets/           # Thư mục cho ảnh hoặc nội dung tĩnh
│       └── logo.png      # Logo của ứng dụng
├── package.json          # Danh sách thư viện và cấu hình npm
├── package-lock.json     # File khóa npm (tự động tạo)
└── README.md             # Tài liệu mô tả dự án

