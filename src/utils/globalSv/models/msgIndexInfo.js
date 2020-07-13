export class msgIndexInfo {
  constructor() {
    this.t30167	= ''; // Index code
    this.t30001	= ''; // Bộ ID của các thị trường <HOSE>- STO: Stock - BDO: Bond
    this.t336	= ''; // TradingSessionID: -	ATO = At Open -	ATO_EX = At open extern -	CON = Continues session
    this.t30569	= ''; // MarketIndexClass
    this.t60 = ''; // Trading Time format: HHmmSSsss
    this.t30217	= 0.0; //	Fixed	Current Value
    this.tA20	= 0.0; // Reference Index Value (Yesterday value)
    this.tA21	= 0.0; //	Close Index Value
    this.tA22	= 0.0; //	Change Value compare with yesterday value
    this.tA23	= 0.0; // Change Ratio compare with yesterday value
    this.tA24	= 0.0; //	Hightest Value
    this.tA25	= 0.0; //	Lowest Value.
    this.t387	= 0; //	Total Trad Volumn
    this.t281	= 0.0; //	Total Trad values
    this.t30638	= 0; //	Total normal trading volumn
    this.t30639	= 0.0; // Total normal trading values
    this.t30640	= 0; //	Total put-thought trading volumn
    this.t30641	= 0.0 // Total put-thought trading values
    this.tA6 = ''; //	Trading status name: ATO/ATC/MP/Limit/Put-thought, ….
    this.t30589	= 0; //	Number of CE stock
    this.t30593	= 0; //	Number of FL stock
    this.t30590	= 0; //	Number Increate Stock
    this.t30592	= 0; //	Number Decreate Stock
    this.t30591	= 0; //	Number Ref Stock
    this.tA7 = 0.0; // KL xu hướng MUA = Tổng KL xu hướng mua của các Mã CK trong chỉ số
    this.tA8 = 0.0; // KL xu hướng BÁN = Tổng KL xu hướng bán của các Mã CK trong chỉ số
    this.tA9 = 0.0; // Tỷ lệ xu hướng MUA = KL Xu hướng Mua/( KL Xu hướng Mua + KL Xu hướng Bán)
    this.tA10	= 0.0; // Tỷ lệ xu hướng BÁN = KL Xu hướng Bán/( KL Xu hướng Mua + KL Xu hướng Bán)
    this.tA11	= ''; //	Mô tả xu hướng hiện tại: -	BUY (Nếu tỷ lệ xu hướng mua(c19) > Tỷ lệ xu hướng bán (C20) hoặc C19 = C20 nhưng lệnh gần nhất khớp có xu hướng MUA) -	SELL (Nếu tỷ lệ xu hướng bán < tỷ lệ xu hướng mua hoặc C19 = C20 nhưng lệnh gần nhất khớp có xu hướng BÁN). -	Empty nếu không có GD nào khớp
  }
}

