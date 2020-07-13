// @flow weak

const GetJson = (key) => {
    let vi = {} , en = {}, cn = {};
    fetch('/language/vi.json')
        .then((r) => r.json())
        .then((resp) => {
            vi = resp;
            console.log(vi);
            if (typeof (Storage) !== 'undefined' && vi !== {} && key === 1) {
                return vi;
            }
        })
    fetch('/language/en.json')
        .then((r) => r.json())
        .then((resp) => {
            en = resp;
            if (typeof (Storage) !== 'undefined' && en !== {} && key === 2) {
                return en;
            }
        })
    // fetch('/language/cn.json')
    //     .then((r) => r.json())
    //     .then((resp) => {
    //         console.log(resp);
    //         cn = resp;
    //     })
}

export default GetJson;
