import { AppNotification, FeedbackItem, Meal, SampleRetention, TraceabilityRecord } from '@/types';

export const MEALS: Meal[] = [
  // Monday (dayIndex: 0)
  {
    id: 'm1',
    name: 'Bún bò Huế',
    calories: 350,
    image: require('../assets/images/meal-noodle.png'),
    isMonitored: true,
    mealType: 'main',
    session: 'sang',
    dayIndex: 0,
    category: 'Món chính',
    ingredients: [
      { name: 'Bún tươi', amount: '150g', origin: 'TP. Hồ Chí Minh' },
      { name: 'Thịt bò', amount: '80g', origin: 'Bình Dương' },
      { name: 'Sả', amount: '20g', origin: 'Long An' },
      { name: 'Mắm ruốc', amount: '5g', origin: 'Huế' },
    ],
    nutrition: { protein: 18, carbs: 42, fat: 8, fiber: 2, sodium: 580 },
    preparation: 'Ninh xương bò 4 tiếng, nêm sả, mắm ruốc, ớt. Trụng bún, thêm thịt và nước dùng nóng.',
    foodSafetyStatus: 'safe',
  },
  {
    id: 'm2',
    name: 'Cơm trắng & Canh bí đỏ',
    calories: 300,
    image: require('../assets/images/meal-fried-rice.png'),
    isMonitored: true,
    mealType: 'main',
    session: 'trua',
    dayIndex: 0,
    category: 'Món chính',
    ingredients: [
      { name: 'Gạo tẻ', amount: '100g', origin: 'An Giang' },
      { name: 'Bí đỏ', amount: '120g', origin: 'Lâm Đồng' },
      { name: 'Thịt heo', amount: '50g', origin: 'Bình Phước' },
    ],
    nutrition: { protein: 12, carbs: 58, fat: 5, fiber: 3, sodium: 320 },
    preparation: 'Nấu cơm trắng. Canh bí: phi thơm hành, xào thịt, thêm bí đỏ và nước nấu mềm.',
    foodSafetyStatus: 'safe',
  },
  {
    id: 'm3',
    name: 'Chuối & Cam',
    calories: 60,
    image: require('../assets/images/meal-fruit.png'),
    isMonitored: false,
    mealType: 'dessert',
    session: 'chieu',
    dayIndex: 0,
    category: 'Tráng miệng',
    ingredients: [
      { name: 'Chuối cau', amount: '1 trái', origin: 'Tiền Giang' },
      { name: 'Cam', amount: '1 trái', origin: 'Vĩnh Long' },
    ],
    nutrition: { protein: 1, carbs: 14, fat: 0, fiber: 2, sodium: 5 },
    preparation: 'Rửa sạch, bày đĩa.',
    foodSafetyStatus: 'safe',
  },
  // Tuesday (dayIndex: 1)
  {
    id: 'm4',
    name: 'Mì trộn hải sản',
    calories: 320,
    image: require('../assets/images/meal-noodle.png'),
    isMonitored: true,
    mealType: 'main',
    session: 'sang',
    dayIndex: 1,
    category: 'Món chính',
    ingredients: [
      { name: 'Mì sợi', amount: '120g', origin: 'TP. Hồ Chí Minh' },
      { name: 'Tôm sú', amount: '60g', origin: 'Cà Mau' },
      { name: 'Mực ống', amount: '40g', origin: 'Vũng Tàu' },
      { name: 'Giá đỗ', amount: '30g', origin: 'TP. Hồ Chí Minh' },
      { name: 'Rau thơm', amount: '10g', origin: 'Đà Lạt' },
    ],
    nutrition: { protein: 22, carbs: 40, fat: 9, fiber: 2, sodium: 460 },
    preparation: 'Trụng mì, hải sản xào sơ với tỏi. Trộn đều với nước sốt hải sản và rau sống.',
    foodSafetyStatus: 'safe',
  },
  {
    id: 'm5',
    name: 'Cơm gà Hội An & Canh rau củ',
    calories: 450,
    image: require('../assets/images/meal-chicken-rice.png'),
    isMonitored: true,
    mealType: 'main',
    session: 'trua',
    dayIndex: 1,
    category: 'Món chính',
    ingredients: [
      { name: 'Gạo đặc sản Hội An', amount: '100g', origin: 'Quảng Nam' },
      { name: 'Gà ta', amount: '100g', origin: 'Đồng Nai' },
      { name: 'Cà rốt', amount: '50g', origin: 'Đà Lạt' },
      { name: 'Đậu cove', amount: '40g', origin: 'Lâm Đồng' },
    ],
    nutrition: { protein: 28, carbs: 52, fat: 10, fiber: 4, sodium: 420 },
    preparation: 'Gà hấp chín, xé miếng. Cơm nấu từ nước luộc gà. Canh rau củ nấu thanh đạm.',
    foodSafetyStatus: 'safe',
  },
  {
    id: 'm6',
    name: 'Dưa hấu & Xoài chín',
    calories: 80,
    image: require('../assets/images/meal-fruit.png'),
    isMonitored: false,
    mealType: 'dessert',
    session: 'phu',
    dayIndex: 1,
    category: 'Tráng miệng',
    ingredients: [
      { name: 'Dưa hấu', amount: '150g', origin: 'Long An' },
      { name: 'Xoài cát Hòa Lộc', amount: '100g', origin: 'Tiền Giang' },
    ],
    nutrition: { protein: 1, carbs: 19, fat: 0, fiber: 1, sodium: 2 },
    preparation: 'Rửa sạch, gọt vỏ, cắt miếng vừa ăn.',
    foodSafetyStatus: 'safe',
  },
  {
    id: 'm7',
    name: 'Sữa chua nếp cẩm',
    calories: 150,
    image: require('../assets/images/meal-yogurt.png'),
    isMonitored: true,
    mealType: 'drink',
    session: 'chieu',
    dayIndex: 1,
    category: 'Đồ uống',
    ingredients: [
      { name: 'Nếp cẩm', amount: '40g', origin: 'An Giang' },
      { name: 'Sữa chua Vinamilk', amount: '100g', origin: 'TP. Hồ Chí Minh' },
      { name: 'Đường', amount: '5g', origin: 'Tây Ninh' },
    ],
    nutrition: { protein: 5, carbs: 28, fat: 3, fiber: 1, sodium: 65 },
    preparation: 'Nấu nếp cẩm chín, để nguội. Dùng kèm sữa chua lạnh.',
    foodSafetyStatus: 'safe',
  },
  {
    id: 'm8',
    name: 'Cơm chiên',
    calories: 380,
    image: require('../assets/images/meal-fried-rice.png'),
    isMonitored: true,
    mealType: 'main',
    session: 'phu',
    dayIndex: 1,
    category: 'Món chính',
    ingredients: [
      { name: 'Gạo tẻ', amount: '120g', origin: 'An Giang' },
      { name: 'Trứng gà', amount: '2 trứng', origin: 'Bình Dương' },
      { name: 'Xúc xích', amount: '40g', origin: 'TP. Hồ Chí Minh' },
      { name: 'Hành lá', amount: '10g', origin: 'TP. Hồ Chí Minh' },
    ],
    nutrition: { protein: 15, carbs: 55, fat: 12, fiber: 1, sodium: 520 },
    preparation: 'Cơm nấu, để nguội. Đảo tỏi, thêm cơm, trứng, xúc xích. Nêm vừa ăn.',
    foodSafetyStatus: 'safe',
  },
  // Wednesday (dayIndex: 2)
  {
    id: 'm9',
    name: 'Phở bò',
    calories: 380,
    image: require('../assets/images/meal-noodle.png'),
    isMonitored: true,
    mealType: 'main',
    session: 'sang',
    dayIndex: 2,
    category: 'Món chính',
    ingredients: [
      { name: 'Bánh phở', amount: '150g', origin: 'TP. Hồ Chí Minh' },
      { name: 'Thịt bò tái', amount: '80g', origin: 'Bình Dương' },
      { name: 'Hành tây', amount: '30g', origin: 'Lâm Đồng' },
      { name: 'Gừng', amount: '10g', origin: 'Trà Vinh' },
    ],
    nutrition: { protein: 24, carbs: 44, fat: 7, fiber: 1, sodium: 640 },
    preparation: 'Ninh xương, quế, hồi 6 tiếng. Trụng bánh phở. Thêm thịt bò và nước dùng.',
    foodSafetyStatus: 'safe',
  },
  {
    id: 'm10',
    name: 'Chè đậu xanh',
    calories: 120,
    image: require('../assets/images/meal-yogurt.png'),
    isMonitored: false,
    mealType: 'dessert',
    session: 'chieu',
    dayIndex: 2,
    category: 'Tráng miệng',
    ingredients: [
      { name: 'Đậu xanh', amount: '60g', origin: 'Bình Thuận' },
      { name: 'Đường phèn', amount: '20g', origin: 'Tây Ninh' },
      { name: 'Nước cốt dừa', amount: '30ml', origin: 'Bến Tre' },
    ],
    nutrition: { protein: 4, carbs: 25, fat: 2, fiber: 3, sodium: 15 },
    preparation: 'Ngâm đậu xanh, nấu mềm với đường. Rưới nước cốt dừa khi dùng.',
    foodSafetyStatus: 'safe',
  },
  // Thursday (dayIndex: 3)
  {
    id: 'm11',
    name: 'Cơm tấm sườn bì',
    calories: 520,
    image: require('../assets/images/meal-chicken-rice.png'),
    isMonitored: true,
    mealType: 'main',
    session: 'trua',
    dayIndex: 3,
    category: 'Món chính',
    ingredients: [
      { name: 'Gạo tấm', amount: '120g', origin: 'An Giang' },
      { name: 'Sườn non', amount: '100g', origin: 'Bình Dương' },
      { name: 'Bì heo', amount: '30g', origin: 'TP. Hồ Chí Minh' },
      { name: 'Đồ chua', amount: '20g', origin: 'TP. Hồ Chí Minh' },
    ],
    nutrition: { protein: 30, carbs: 58, fat: 16, fiber: 1, sodium: 580 },
    preparation: 'Ướp sườn gia vị, nướng vàng. Cơm tấm nấu hạt nở đều. Bày đĩa cùng bì và đồ chua.',
    foodSafetyStatus: 'safe',
  },
  {
    id: 'm12',
    name: 'Xoài & Ổi',
    calories: 70,
    image: require('../assets/images/meal-fruit.png'),
    isMonitored: false,
    mealType: 'dessert',
    session: 'chieu',
    dayIndex: 3,
    category: 'Tráng miệng',
    ingredients: [
      { name: 'Xoài xanh', amount: '100g', origin: 'Tiền Giang' },
      { name: 'Ổi', amount: '80g', origin: 'Đồng Tháp' },
    ],
    nutrition: { protein: 1, carbs: 16, fat: 0, fiber: 3, sodium: 3 },
    preparation: 'Rửa sạch, thái lát.',
    foodSafetyStatus: 'safe',
  },
  // Friday (dayIndex: 4)
  {
    id: 'm13',
    name: 'Bún riêu cua',
    calories: 340,
    image: require('../assets/images/meal-noodle.png'),
    isMonitored: true,
    mealType: 'main',
    session: 'sang',
    dayIndex: 4,
    category: 'Món chính',
    ingredients: [
      { name: 'Bún', amount: '150g', origin: 'TP. Hồ Chí Minh' },
      { name: 'Cua đồng', amount: '80g', origin: 'Đồng Tháp' },
      { name: 'Cà chua', amount: '50g', origin: 'Lâm Đồng' },
      { name: 'Đậu phụ', amount: '40g', origin: 'TP. Hồ Chí Minh' },
    ],
    nutrition: { protein: 20, carbs: 42, fat: 6, fiber: 2, sodium: 490 },
    preparation: 'Giã cua lọc nước. Nấu cùng cà chua, gia vị. Trụng bún, chan nước dùng.',
    foodSafetyStatus: 'safe',
  },
  {
    id: 'm14',
    name: 'Dưa hấu',
    calories: 60,
    image: require('../assets/images/meal-fruit.png'),
    isMonitored: false,
    mealType: 'dessert',
    session: 'chieu',
    dayIndex: 4,
    category: 'Tráng miệng',
    ingredients: [
      { name: 'Dưa hấu không hạt', amount: '200g', origin: 'Long An' },
    ],
    nutrition: { protein: 1, carbs: 13, fat: 0, fiber: 1, sodium: 2 },
    preparation: 'Rửa sạch, cắt miếng tam giác.',
    foodSafetyStatus: 'safe',
  },
];

export const TRACEABILITY_RECORDS: TraceabilityRecord[] = [
  {
    id: 't1',
    mealId: 'm4',
    mealName: 'Mì trộn hải sản',
    image: require('../assets/images/meal-noodle.png'),
    traceCode: '1753402417699',
    isMonitored: true,
    mealTypeCategory: 'Đặc (nấu chín)',
    mealTypeDesc: 'Món ăn được theo dõi trong 24h từ lúc bắt đầu chế biến.',
    chefName: 'Đầu bếp Checkee',
    processCode: 'MTHS-001',
    cookTime: '12:35 10/06/2026',
    traceIngredients: [
      { name: 'Tôm sú',     supplier: 'Cty TNHH Thương mại quốc tế hải sản Hoàng Gia', batchNo: '2026071008', unit: 'Gram' },
      { name: 'Cải thìa xanh', supplier: 'Khu A5-013 Chợ Bình Điền',                   batchNo: '2026070512', unit: 'Kg'   },
      { name: 'Mì gói',     supplier: 'Nhà cung cấp sỉ & lẻ Minh Hằng',               batchNo: '20260708',   unit: 'Gói'  },
      { name: 'Trứng gà',   supplier: 'Chi nhánh phân phối Trứng Gà Ba Huân',          batchNo: '20260701',   unit: 'Quả'  },
    ],
    totalScans: 232,
    todayScans: 32,
    ingredient: 'Tôm sú',
    supplier: 'Công ty TNHH Thủy sản Minh Phú',
    supplierAddress: '128 Nguyễn Đình Chiểu, TP. Cà Mau',
    origin: 'Cà Mau, Việt Nam',
    productionBatch: 'MP-2026-06-001',
    manufacturingDate: '08/06/2026',
    expiryDate: '12/06/2026',
    certifications: ['VietGAP', 'HACCP', 'GlobalGAP', 'ASC'],
    processingHistory: [
      { id: 'p1', date: '05/06/2026', location: 'Đầm nuôi - Cà Mau', action: 'Thu hoạch tôm từ đầm nuôi đạt chuẩn', responsible: 'Nguyễn Văn A' },
      { id: 'p2', date: '06/06/2026', location: 'Xưởng chế biến - Minh Phú', action: 'Sơ chế, làm sạch, cấp đông nhanh', responsible: 'Trần Thị B' },
      { id: 'p3', date: '07/06/2026', location: 'Kho lạnh - Minh Phú', action: 'Kiểm tra chất lượng, đóng gói, lưu kho', responsible: 'Lê Văn C' },
      { id: 'p4', date: '08/06/2026', location: 'Trung tâm phân phối - TP.HCM', action: 'Vận chuyển lạnh, nhập kho phân phối', responsible: 'Phạm Thị D' },
      { id: 'p5', date: '10/06/2026', location: 'Bếp ăn trường học', action: 'Nhận hàng, kiểm tra, bảo quản', responsible: 'Bếp trưởng Trường' },
    ],
  },
  {
    id: 't2',
    mealId: 'm5',
    mealName: 'Cơm gà Hội An',
    image: require('../assets/images/meal-chicken-rice.png'),
    traceCode: '1753402517800',
    isMonitored: true,
    mealTypeCategory: 'Thường (nấu chín)',
    mealTypeDesc: 'Món ăn được chế biến theo quy trình chuẩn HACCP và kiểm tra trước khi phục vụ.',
    chefName: 'Đầu bếp Checkee',
    processCode: 'CGHA-002',
    cookTime: '11:00 10/06/2026',
    traceIngredients: [
      { name: 'Gà ta',     supplier: 'Trang trại Gà sạch Hòa Phát - Đồng Nai',  batchNo: '2026060945', unit: 'Gram' },
      { name: 'Gạo Hội An', supplier: 'Cơ sở Gạo đặc sản Miền Trung',           batchNo: '2026060312', unit: 'Kg'   },
      { name: 'Cà rốt',   supplier: 'HTX Rau củ Đà Lạt',                         batchNo: '20260608',   unit: 'Gram' },
      { name: 'Đậu cove',  supplier: 'Vựa rau Lâm Đồng - Bảo Lộc',              batchNo: '20260609',   unit: 'Gram' },
    ],
    totalScans: 187,
    todayScans: 24,
    ingredient: 'Gà ta',
    supplier: 'Trang trại Gà sạch Hòa Phát',
    supplierAddress: '45 Đường Đông Nai, Huyện Long Thành, Đồng Nai',
    origin: 'Đồng Nai, Việt Nam',
    productionBatch: 'HP-2026-06-045',
    manufacturingDate: '09/06/2026',
    expiryDate: '11/06/2026',
    certifications: ['VietGAP', 'HACCP', 'Chứng nhận ATTP Bộ NN'],
    processingHistory: [
      { id: 'p6', date: '07/06/2026', location: 'Trang trại - Đồng Nai', action: 'Chọn gà đủ tuổi, kiểm tra sức khỏe', responsible: 'Nguyễn Hữu E' },
      { id: 'p7', date: '09/06/2026', location: 'Lò mổ - Đồng Nai', action: 'Giết mổ đúng quy chuẩn vệ sinh', responsible: 'Trần Văn F' },
      { id: 'p8', date: '09/06/2026', location: 'Xưởng đóng gói', action: 'Làm sạch, đóng gói khí quyển', responsible: 'Lê Thị G' },
      { id: 'p9', date: '10/06/2026', location: 'Bếp ăn trường học', action: 'Nhận hàng, kiểm tra nhiệt độ, bảo quản lạnh', responsible: 'Bếp trưởng Trường' },
    ],
  },
  {
    id: 't3',
    mealId: 'm8',
    mealName: 'Cơm chiên',
    image: require('../assets/images/meal-fried-rice.png'),
    traceCode: '1753402618100',
    isMonitored: true,
    mealTypeCategory: 'Thường (nấu chín)',
    mealTypeDesc: 'Món ăn được chế biến tươi, phục vụ trong vòng 2h sau khi hoàn thành.',
    chefName: 'Đầu bếp Checkee',
    processCode: 'CCHI-003',
    cookTime: '10:30 10/06/2026',
    traceIngredients: [
      { name: 'Trứng gà',  supplier: 'Chi nhánh phân phối Trứng Gà Ba Huân',  batchNo: '2026060012', unit: 'Quả'  },
      { name: 'Gạo tẻ',   supplier: 'HTX Nông nghiệp An Giang',               batchNo: '2026052801', unit: 'Kg'   },
      { name: 'Xúc xích',  supplier: 'Cty CP Thực phẩm Đức Việt',             batchNo: '20260601',   unit: 'Gram' },
      { name: 'Hành lá',   supplier: 'Vựa rau Củ Chi',                         batchNo: '20260609',   unit: 'Gram' },
    ],
    totalScans: 156,
    todayScans: 18,
    ingredient: 'Trứng gà',
    supplier: 'Hộ kinh doanh Trứng Ba Huân',
    supplierAddress: '200 Lý Thường Kiệt, Bình Dương',
    origin: 'Bình Dương, Việt Nam',
    productionBatch: 'BH-2026-06-120',
    manufacturingDate: '08/06/2026',
    expiryDate: '22/06/2026',
    certifications: ['HACCP', 'ISO 22000:2018'],
    processingHistory: [
      { id: 'p10', date: '08/06/2026', location: 'Trang trại - Bình Dương', action: 'Thu hoạch trứng từ gà đẻ sạch', responsible: 'Nguyễn Văn H' },
      { id: 'p11', date: '08/06/2026', location: 'Dây chuyền xử lý - Ba Huân', action: 'Rửa sạch UV, phân loại kích cỡ', responsible: 'Trần Thị I' },
      { id: 'p12', date: '09/06/2026', location: 'Kho mát - Ba Huân', action: 'Đóng vỉ, kiểm tra, lưu kho', responsible: 'Lê Văn J' },
      { id: 'p13', date: '10/06/2026', location: 'Bếp ăn trường học', action: 'Nhận hàng, kiểm tra hạn dùng', responsible: 'Bếp trưởng Trường' },
    ],
  },
  {
    id: 't4',
    mealId: 'm11',
    mealName: 'Cơm tấm sườn bì',
    image: require('../assets/images/meal-chicken-rice.png'),
    traceCode: '1753402718400',
    isMonitored: true,
    mealTypeCategory: 'Đặc (nấu chín)',
    mealTypeDesc: 'Món ăn được theo dõi toàn bộ chuỗi từ nguyên liệu đến phục vụ theo chuẩn HACCP.',
    chefName: 'Đầu bếp Checkee',
    processCode: 'CTSB-004',
    cookTime: '10:30 02/07/2026',
    traceIngredients: [
      { name: 'Sườn non',  supplier: 'Công ty TNHH Thực phẩm Vissan',          batchNo: '2026070201', unit: 'Gram' },
      { name: 'Gạo tấm',  supplier: 'HTX Nông nghiệp An Giang',                batchNo: '2026060801', unit: 'Kg'   },
      { name: 'Bì heo',   supplier: 'Lò mổ Bình Dương - Cơ sở Tân Phát',      batchNo: '20260702',   unit: 'Gram' },
      { name: 'Đồ chua',  supplier: 'Cơ sở chế biến thực phẩm Thanh Hương',   batchNo: '20260701',   unit: 'Gram' },
    ],
    totalScans: 95,
    todayScans: 41,
    ingredient: 'Sườn non',
    supplier: 'Công ty TNHH Thực phẩm Vissan',
    supplierAddress: '420 Nơ Trang Long, Bình Thạnh, TP. Hồ Chí Minh',
    origin: 'TP. Hồ Chí Minh, Việt Nam',
    productionBatch: 'VS-2026-07-002',
    manufacturingDate: '01/07/2026',
    expiryDate: '04/07/2026',
    certifications: ['VietGAP', 'HACCP', 'ISO 22000:2018', 'ATTP Bộ NN'],
    processingHistory: [
      { id: 'p14', date: '30/06/2026', location: 'Trang trại - Bình Dương',    action: 'Chọn heo đủ tuổi, kiểm tra sức khỏe', responsible: 'Nguyễn Văn K' },
      { id: 'p15', date: '01/07/2026', location: 'Lò mổ - TP. Hồ Chí Minh',  action: 'Giết mổ đúng quy chuẩn vệ sinh ATTP', responsible: 'Trần Thị L'   },
      { id: 'p16', date: '01/07/2026', location: 'Dây chuyền pha lóc Vissan', action: 'Pha lóc sườn non, đóng gói chân không', responsible: 'Lê Văn M'    },
      { id: 'p17', date: '02/07/2026', location: 'Bếp ăn trường học',         action: 'Nhận hàng, kiểm tra nhiệt độ, ướp gia vị, nướng vàng', responsible: 'Bếp trưởng Trường' },
    ],
  },
];

export const SAMPLE_RETENTIONS: SampleRetention[] = [
  {
    id: 'sr1',
    mealId: 'm4',
    mealName: 'Mì trộn hải sản',
    image: require('../assets/images/meal-noodle.png'),
    storedDate: '10/06/2026',
    expiryDate: '14/06/2026',
    status: 'active',
    storageLocation: 'Tủ lạnh A - Ngăn 2',
    sampleCount: 3,
  },
  {
    id: 'sr2',
    mealId: 'm5',
    mealName: 'Cơm gà Hội An',
    image: require('../assets/images/meal-chicken-rice.png'),
    storedDate: '10/06/2026',
    expiryDate: '14/06/2026',
    status: 'active',
    storageLocation: 'Tủ lạnh A - Ngăn 3',
    sampleCount: 3,
  },
  {
    id: 'sr3',
    mealId: 'm7',
    mealName: 'Sữa chua nếp cẩm',
    image: require('../assets/images/meal-yogurt.png'),
    storedDate: '10/06/2026',
    expiryDate: '14/06/2026',
    status: 'active',
    storageLocation: 'Tủ lạnh B - Ngăn 1',
    sampleCount: 3,
  },
  {
    id: 'sr4',
    mealId: 'm8',
    mealName: 'Cơm chiên',
    image: require('../assets/images/meal-fried-rice.png'),
    storedDate: '10/06/2026',
    expiryDate: '14/06/2026',
    status: 'active',
    storageLocation: 'Tủ lạnh B - Ngăn 2',
    sampleCount: 3,
  },
  {
    id: 'sr5',
    mealId: 'm9',
    mealName: 'Phở bò',
    image: require('../assets/images/meal-noodle.png'),
    storedDate: '08/06/2026',
    expiryDate: '12/06/2026',
    status: 'active',
    storageLocation: 'Tủ lạnh A - Ngăn 1',
    sampleCount: 3,
  },
  {
    id: 'sr6',
    mealId: 'm1',
    mealName: 'Bún bò Huế',
    image: require('../assets/images/meal-noodle.png'),
    storedDate: '07/06/2026',
    expiryDate: '11/06/2026',
    status: 'expired',
    storageLocation: 'Tủ lạnh C - Ngăn 1',
    sampleCount: 3,
  },
];

export const FEEDBACKS: FeedbackItem[] = [
  {
    id: 'f1',
    mealId: 'm4',
    mealName: 'Mì trộn hải sản',
    complaintType: 'quality',
    description: 'Mì bị nhão, tôm còn tanh, mùi không tươi. Con tôi ăn được nửa suất rồi bỏ.',
    symptoms: 'Không có triệu chứng',
    photos: [],
    status: 'resolved',
    submittedAt: '08/06/2026 14:30',
    resolvedAt: '09/06/2026 10:00',
    response: 'Cảm ơn phụ huynh đã phản ánh. Chúng tôi đã điều chỉnh quy trình nấu mì và kiểm tra lại nguồn cung hải sản. Sự cố sẽ không tái diễn.',
  },
  {
    id: 'f2',
    mealId: 'm5',
    mealName: 'Cơm gà Hội An',
    complaintType: 'quantity',
    description: 'Suất ăn bữa trưa ít hơn bình thường, cơm chỉ được khoảng 2/3 chén, con về nhà kêu đói.',
    symptoms: 'Không có',
    photos: [],
    status: 'processing',
    submittedAt: '09/06/2026 12:15',
  },
  {
    id: 'f3',
    mealId: 'm2',
    mealName: 'Canh bí đỏ',
    complaintType: 'safety',
    description: 'Con bị đau bụng sau bữa ăn buổi sáng, có thể do canh bí đỏ để lâu hoặc nấu chưa chín kỹ.',
    symptoms: 'Đau bụng, buồn nôn nhẹ khoảng 1 tiếng sau khi ăn. Đã uống thuốc và hết.',
    photos: [],
    status: 'pending',
    submittedAt: '10/06/2026 09:00',
  },
  {
    id: 'f4',
    mealId: 'm1',
    mealName: 'Bún bò Huế',
    complaintType: 'hygiene',
    description: 'Phát hiện sợi tóc trong tô bún của con. Rất mong nhà trường nhắc nhở nhân viên bếp đội mũ đúng quy định.',
    symptoms: 'Không có',
    photos: [],
    status: 'rejected',
    submittedAt: '05/06/2026 11:45',
    resolvedAt: '06/06/2026 08:30',
    response: 'Chúng tôi đã xem xét phản ánh. Qua kiểm tra camera bếp ngày 05/06, không ghi nhận vi phạm quy trình vệ sinh. Rất tiếc không thể xác nhận sự cố này.',
  },
];

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'menu',
    title: 'Thực đơn tuần mới',
    message: 'Thực đơn tuần từ 08/06 - 12/06/2026 đã được cập nhật. Nhấn để xem chi tiết.',
    body: `Thực đơn tuần học từ 08/06 đến 12/06/2026 đã được bộ phận dinh dưỡng nhà trường cập nhật và phê duyệt.

Điểm nổi bật tuần này:
• Bổ sung thêm món Phở bò vào buổi sáng thứ Tư
• Tráng miệng có sữa chua nếp cẩm và trái cây tươi mỗi ngày
• Thực đơn đảm bảo đủ 4 nhóm dinh dưỡng: tinh bột, đạm, béo, vitamin

Phụ huynh có thể xem chi tiết thực đơn từng ngày trong mục Thực đơn. Nếu có thắc mắc về thành phần hoặc dị ứng thực phẩm, vui lòng liên hệ văn phòng nhà trường trước 07:00 sáng thứ Hai.`,
    isRead: false,
    createdAt: '07/06/2026 08:00',
  },
  {
    id: 'n2',
    type: 'safety',
    title: 'Kết quả kiểm nghiệm ATTP',
    message: 'Kết quả kiểm nghiệm an toàn thực phẩm tuần 06/2026 đã có. Tất cả mẫu đạt tiêu chuẩn.',
    body: `Kết quả kiểm nghiệm an toàn thực phẩm (ATTP) định kỳ tuần 06/2026 đã được Trung tâm Y tế Dự phòng Quận xác nhận.

Kết quả tổng hợp:
✓ Mẫu vi sinh vật: ĐẠT — Không phát hiện E. Coli, Salmonella
✓ Mẫu hóa chất bảo vệ thực vật: ĐẠT — Dưới ngưỡng cho phép
✓ Mẫu kim loại nặng: ĐẠT — Không phát hiện chì, thủy ngân
✓ Nhiệt độ bảo quản: ĐẠT — Duy trì dưới 5°C

Tổng số mẫu kiểm tra: 12 mẫu
Số mẫu đạt tiêu chuẩn: 12/12 (100%)
Đơn vị kiểm nghiệm: Trung tâm Y tế Dự phòng Quận 1
Ngày lấy mẫu: 06/06/2026

Nhà trường cam kết duy trì tiêu chuẩn ATTP nghiêm ngặt để bảo vệ sức khỏe học sinh.`,
    isRead: false,
    createdAt: '08/06/2026 09:30',
  },
  {
    id: 'n3',
    type: 'complaint',
    title: 'Phản ánh đã được xử lý',
    message: 'Phản ánh của bạn về "Mì trộn hải sản" ngày 08/06 đã được giải quyết. Xem phản hồi từ nhà trường.',
    body: `Phản ánh của bạn về chất lượng món Mì trộn hải sản ngày 08/06/2026 đã được bộ phận bếp ăn xem xét và xử lý.

Nội dung phản ánh:
"Mì bị nhão, tôm còn tanh, mùi không tươi. Con tôi ăn được nửa suất rồi bỏ."

Phản hồi từ nhà trường:
Cảm ơn phụ huynh đã phản ánh kịp thời. Sau khi kiểm tra, chúng tôi xác nhận lô tôm nhập ngày 08/06 có dấu hiệu không đảm bảo độ tươi do sự cố trong khâu vận chuyển. Nhà trường đã:

• Đình chỉ sử dụng lô tôm đó ngay lập tức
• Yêu cầu nhà cung cấp đổi hàng và bồi thường
• Thay đổi nhà cung cấp hải sản từ tuần 09/06
• Bổ sung bước kiểm tra cảm quan trước khi chế biến

Chúng tôi xin lỗi vì sự cố này và cam kết không để tái diễn.`,
    isRead: true,
    createdAt: '09/06/2026 10:00',
  },
  {
    id: 'n4',
    type: 'school',
    title: 'Thông báo từ Ban Giám Hiệu',
    message: 'Nhà trường sẽ tổ chức kiểm tra bếp ăn định kỳ vào ngày 15/06/2026. Kết quả sẽ được thông báo trên app.',
    body: `Kính gửi quý phụ huynh,

Ban Giám Hiệu trường thông báo về việc tổ chức kiểm tra bếp ăn định kỳ theo kế hoạch năm học 2025–2026.

Thời gian: 15/06/2026 (Thứ Hai), 08:00 – 11:00
Đơn vị kiểm tra: Phòng Giáo dục & Đào tạo Quận phối hợp Sở Y tế
Nội dung kiểm tra:
  • Vệ sinh cơ sở vật chất khu vực bếp
  • Quy trình chế biến và bảo quản thực phẩm
  • Hồ sơ lưu mẫu và kiểm nghiệm ATTP
  • Chứng nhận sức khỏe nhân viên bếp

Trong ngày kiểm tra, bữa ăn của học sinh vẫn diễn ra bình thường theo thực đơn đã lên kế hoạch.

Kết quả kiểm tra sẽ được công bố trên ứng dụng trong vòng 3 ngày làm việc sau đó.

Trân trọng,
Ban Giám Hiệu`,
    isRead: true,
    createdAt: '07/06/2026 15:00',
  },
  {
    id: 'n5',
    type: 'safety',
    title: 'Nhắc nhở về dị ứng thực phẩm',
    message: 'Thực đơn thứ Ba có món hải sản. Phụ huynh có con dị ứng hải sản vui lòng liên hệ nhà trường để điều chỉnh.',
    body: `Nhà trường xin thông báo đến quý phụ huynh về thực đơn có chứa hải sản trong tuần tới.

Thứ Ba, 09/06/2026:
• Buổi sáng: Mì trộn hải sản (tôm, mực)
• Buổi trưa: Canh chua cá (cá basa)

Đối với học sinh dị ứng hải sản:
Nhà trường có thể chuẩn bị suất ăn thay thế không chứa hải sản. Để đảm bảo bếp chuẩn bị kịp thời, quý phụ huynh vui lòng:

1. Liên hệ giáo viên chủ nhiệm trước 16:00 thứ Hai 08/06
2. Hoặc gọi trực tiếp văn phòng nhà trường: 028 xxxx xxxx
3. Hoặc nhắn tin qua nhóm lớp Zalo

Lưu ý: Nhà trường sử dụng dụng cụ chế biến riêng cho suất ăn thay thế để tránh nhiễm chéo.

Sức khỏe của học sinh là ưu tiên hàng đầu của chúng tôi.`,
    isRead: true,
    createdAt: '09/06/2026 07:00',
  },
];
