var arrays = [];
var intercept = {
  primitive: function (val, ast) { return val },
  object: function (val, ast) {
    if (Array.isArray(val))
      arrays.push({key:val, value:[]})
    return val;
  }
}

var calls = {
  push: function (call) {
    if (Array.isArray(call.this))
      for (var i=0; i<arrays.length; i++)
        if (arrays[i].key === call.this)
          arrays[i].value.push(call);
  },
  pop: function () {}
};

var Linvail = require("..");
module.exports = Linvail(intercept, calls);

var button = document.createElement("button");
button.textContent = "Shadow";
button.onclick = function () { console.dir(arrays) }
document.body.appendChild(button);
