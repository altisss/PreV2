export class requestInfo {
    constructor() {
        this.reqTime = new Date();
        this.resTime = new Date();
        this.reqFunct = '';
        this.receiveFunct = {};
        this.procStat = 0;
        this.resSucc = true;
        this.inputParam = [];
        this.component = ''
    }
}
