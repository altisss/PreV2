export class msgStkInfo {
  constructor() {
    this.tId = ''; // Service ID fixed: A_StockInfo
    this.tKey = ''; // Service Key: KR7003471000:G1
    this.t55 = '';	// Stock code. Message X
    this.t30001 = ''; // Bộ ID của các thị trường <HOSE> - STO: Stock - BDO: Bond - RPO: Repo
    this.t20004 = ''; // Board. Message X
    this.t30629 = ''; //	SymbolName
    this.t30630 = '';	//	SymbolEnglishName
    this.t30604 = '';	// SecurityGroupID: ST: Cổ phiếu, DR: Chứng chỉ lưu ký, FS: Cổ phiếu doanh nghiệp nước ngoài, MF: Quỹ tương hỗ, EF: ETF BC: Chứng chỉ hưởng lợi, SW: Chứng quyền công ty, SR: Chứng quyền quyền mua, EW: Chứng quyền đảm bảo, BT: Tín phiếu kho bạc, BS: Trái phiếu doanh nghiệp, FU: Futures OP: Option
    this.t336 = '';	//	TradingSessionID: -	ATO = At Open -	ATO_EX = At open extern -	CON = Continues session ...
    this.t1149 = 0.0; //	Celing Price.
    this.t1148 = 0.0; //	Floor  Price.
    this.t20013 = 0.0; //	Reference Price.
    this.tA1 = 0.0; //	Change Amount: 300 VNĐ.
    this.tA2 = 0.0;	// Fixed	Change ratio: 0.1, Unit % 0.1 %
    this.tA3 = []; // Array Double Bid price array [10, 11, 12, 13, 14]
    this.tA4 = []; //	Array Double Bid qty array [10, 11, 12, 13, 14]
    this.tA5 = []; // Array Double Offer price array [15, 16,17]
    this.tA6 = []; // Array Double Offer qty array [15, 16,17]
    this.t387	= 0.0; // Total trading volumn
    this.t381	= 0.0;	// Total trading amount
    this.t30645	= 0.0;	// Total Foreigner buy volumn.
    this.t30646	= 0.0; //	Total Foreigner buy amount
    this.t30643	= 0.0; // Total Foreigner sell. Message MT. 331 và MT.20054 = 10
    this.t30644	= 0.0; //	Total Foreigner sell amount. Message MT. 30168 và MT.20054 = 10
    this.t30558	= 0.0; //	Available room: Message MF
    this.t30561	= 0.0; //	Open price
    this.tA7 = 0.0; //	Avg price
    this.t20026	= 0.0; //	Close price
    this.t30562	= 0.0; //	Highest price:
    this.t30563	= 0.0; //	Lowest price
    this.t270	= 0.0; // Current matched price
    this.t271	= 0.0; //	Current matched qty
    this.tA8 = ''; //	Trading status name: ATO/ATC/MP/Limit/Put-thought, ….
    this.tA9 = 0.0; //	Tổng KL xu hướng MUA. Khi lệnh khớp khớp giá dư MUA hoặc không tìm thấy giá dư MUA -> Xu hướng mua
    this.tA10	= 0.0; // Tổng KL xu hướng BÁN. Khi lệnh khớp khớp giá dư BÁN -> Xu hướng bán
    this.tA11	= 0.0; // Tỷ lệ xu hướng MUA của mã CK = KL Xu hướng Mua/( KL Xu hướng Mua + KL Xu hướng Bán)
    this.tA12	= 0.0; // Tỷ lệ xu hướng BÁN của mã CK = KL Xu hướng Bán/( KL Xu hướng Mua + KL Xu hướng Bán)
    this.tA13	= ''; // Mô tả xu hướng hiện tại: -	BUY (Nếu tỷ lệ xu hướng mua(c24) > Tỷ lệ xu hướng bán (C25) hoặc C24 = C25 nhưng lệnh gần nhất khớp có xu hướng MUA) -	SELL (Nếu tỷ lệ xu hướng bán < tỷ lệ xu hướng mua hoặc C24 = C25 nhưng lệnh gần nhất khớp có xu hướng BÁN) - Empty nếu không có GD nào khớp
  }
}

