
function send_req(args, socket_sv, glb_sv) {
  console.log("functionsend_req -> send_req", args)
  if (args.req_component.reqFunct && args.req_component.msgObj) {
    const clientSeq = socket_sv.getRqSeq();
    args.req_component.msgObj['ClientSeq'] = clientSeq
    glb_sv.setReqInfoMapValue(clientSeq, args.req_component);
    console.log("functionsend_req -> svInputPrm", JSON.stringify(args.req_component.msgObj))
    socket_sv.send2Sv(args.req_component.channel, JSON.stringify(args.req_component.msgObj));
  } else {
    const clientSeq = socket_sv.getRqSeq();
    args.svInputPrm.ClientSeq = clientSeq;
    glb_sv.setReqInfoMapValue(clientSeq, args.req_component);
    const svInputPrm = glb_sv.constructorInputPrm(args.svInputPrm)
    console.log("functionsend_req -> svInputPrm", svInputPrm)
    socket_sv.send2Sv(args.req_component.channel, JSON.stringify(svInputPrm));
  }
}

function reply_send_req(args, req_component) {
  const reqIfMap = req_component.get(args.req_component.request_seq_comp)
  const message = args.message
  // console.log(reqIfMap, req_component)
  if (!reqIfMap) return;
  if (reqIfMap.receiveFunct) {
    // callback(reqIfMap, args.message);
    console.log('reply_send_req',reqIfMap)
    reqIfMap.receiveFunct(reqIfMap, message);
  }
}


export { send_req, reply_send_req };