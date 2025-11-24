// 修复crxjs热重载不能会忽略css的bug
import './index.css'
// 图标动态高亮显示
// contentScript.js
console.log('加载contentScript.js');
chrome.runtime.sendMessage({ action: "pageLoaded" });
// 页面元素
let pageUserName = document.getElementById('svpn_name') as HTMLInputElement;
let pageUserPwd = document.getElementById('input_pwd') as HTMLInputElement;
// 勾选同意按钮
let checkbox = document.getElementById('checkbox') as HTMLInputElement;
if (checkbox) {
  checkbox.checked = true;
}
// 点击登录按钮
const loginButton = document.getElementById('logButton') as HTMLButtonElement;
// 监听popup.html发送过来的消息
chrome.runtime.onMessage.addListener(function (request): boolean {
  if (request.action === "callContentScriptFunctionInitLogin") {
    // 在这里执行content script中的方法，并将结果发送回popup.html
    // 例如：
    // console.log('callContentScriptFunctionInitLogin',request.data);
    // 给页面的 input 赋值
    if (pageUserName) {
      pageUserName.value = request.data.username;
    }
    if (pageUserPwd) {
      pageUserPwd.value = request.data.password;
    }
    // 点击登录
    if (loginButton) {
      loginButton.click();
    }
  }
  return true; // 返回 true 表示异步响应
});
// 添加页面元素
// 在 checkbox 元素后插入自定义按钮
const checkboxWrapper = document.querySelector('.checkbox');
if (checkboxWrapper && checkboxWrapper.parentNode) {
  const remberLoginBtn = document.createElement('button');
  remberLoginBtn.id = 'remberLoginBtn';
  remberLoginBtn.textContent = '插件记住密码';
  remberLoginBtn.style.marginLeft = '40px';
  remberLoginBtn.style.marginTop = '10px';
  remberLoginBtn.style.width = '340px';
  remberLoginBtn.style.padding = '5px';
  remberLoginBtn.style.fontSize = '13px';
  remberLoginBtn.style.cursor = 'pointer';
  // 插入到 checkboxWrapper 的后面，而不是作为其子元素
  checkboxWrapper.parentNode.insertBefore(remberLoginBtn, checkboxWrapper.nextSibling);
  // 从缓存中获取用户名和密码
  chrome.storage.sync.get(['username', 'password'], (result) => {
    if (result.username && result.password) {
      // 如果缓存中存在用户名和密码，填充到页面中
      if (pageUserName) {
        pageUserName.value = result.username;
      }
      if (pageUserPwd) {
        pageUserPwd.value = result.password;
      }
      if (result.username && result.password) {
        // 登录按钮聚焦 //目前这个没生效应该是和默认输入框聚焦冲突了
        if (loginButton) {
          loginButton.focus();
        }
        // 隐藏插件按钮
        remberLoginBtn.style.display = 'none';
      }
      console.log('缓存中获取用户名和密码', result.username, result.password);
    }
  });
  // 当密码输入框聚焦时，才显示插件按钮
  pageUserPwd.addEventListener('focus', () => {
    remberLoginBtn.style.display = 'block';
  });
  // 给按钮添加点击事件
  remberLoginBtn.addEventListener('click', (event) => {
    // 阻止默认事件
    event.preventDefault();
    // 获取用户名和密码
    const username = pageUserName.value;
    const password = pageUserPwd.value;
    // 缓存用户名和密码
    chrome.storage.sync.set({ username, password });
    console.log('用户名和密码', username, password);
  });
}

console.log('加载contentScript.jsend');
