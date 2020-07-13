export class inputPrmSub {
  constructor() {
    this.RSeq = 0; //--- Cần 2 biến client sequence cho 2 dạng request/reponse và dạng subcrible/reponse
    this.SSeq = 0;
    this.RTAct = '';	//SUB, UNSUB, QRY, CFM, RR
    this.RTName = '';
    this.ColId = [];
    this.RowId = [];
    this.RowVal = [];
    this.FromSeq = 0;
    this.NumRecord = 0;
  }
}
