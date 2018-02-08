const LocalStorage = require('node-localstorage').LocalStorage;
const storageSize = 1024*1024*1024 // 1GB
const localStorage = new LocalStorage('./storage', storageSize);

function set(key, obj) {
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
  set,
  get
}
