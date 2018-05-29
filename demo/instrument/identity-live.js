const AranLive = require("aran/live");
const Linvail = require("linvail");
const membrane = {enter:(value)=>value, leave:(value)=>value};
membrane.instrument = AranLive(Linvail(membrane).advice, {sandbox:true}).instrument;
module.exports = membrane.instrument;