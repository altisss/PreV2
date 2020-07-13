function filter_str_bf_parse(str){
    let result = '', i = 0;
    for (i = 0; i < str.length; i++) {
      let tt = str.substr(i, 1);
      const ascII = tt.charCodeAt(0);
      if (ascII <= 31) {
        tt = '';
      }
      if (ascII === 4) { tt = "'|'"; } // -- EOT
      result = result + tt;
    }
    return result;
}

// update_value_for_glb_sv( {component: this.component, key: 'index_priceboard', value: msg.value})
export {filter_str_bf_parse}