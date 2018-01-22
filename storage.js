const LocalStorage = require('node-localstorage').LocalStorage;
let localStorage = new LocalStorage('./storage');

function save(key, obj) {
  obj = JSON.stringify(obj)
  localStorage.setItem(key, obj)
}

function get(key) {
  let item = localStorage.getItem(key)
  if (item) {
    return JSON.parse(item)
  }

  return null
}

module.exports = {
  save,
  get
}
