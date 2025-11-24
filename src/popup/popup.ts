// popup.js

// 获取登录块
const loginSection = document.getElementById('loginSection')
// 获取登录表单
const loginForm = document.getElementById('loginForm')

// 获取登录表单按钮
const loginFormButton = document.getElementById('initLoginHandler')
// 获取重置按钮
const resetDataButton = document.getElementById('resetData')



// // 保存数据到扩展存储
// function saveToStorage(key: any, value: any) {
//   if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
//     chrome.storage.sync.set({ [key]: value }, function () {
//       console.log('数据已保存:', key, value);
//     });
//   } else {
//     console.log('chrome.storage.sync 不可用');
//   }
// }

// 从扩展存储读取数据
function getFromStorage(key: any, callback: (arg0: any) => void) {
  if (typeof (window as any).chrome !== 'undefined' && (window as any).chrome.storage && (window as any).chrome.storage.sync) {
    (window as any).chrome.storage.sync.get([key], function (result: { [key: string]: any }) {
      callback(result[key]);
    });
  } else {
    callback(undefined);
  }
}

// // 删除数据
// function removeFromStorage(key: string) {
//     chrome.storage.sync.remove([key], function() {
//         console.log('数据已删除:', key);
//     });
// }

// // 清空所有数据
// function clearStorage() {
//     chrome.storage.sync.clear(function() {
//         console.log('所有数据已清空');
//     });
// }

// loginSection && (loginSection.style.display = 'none');

// loginForm && (loginForm.style.display = 'block');

// 读取本地数据，没有的话展示登录表单
function checkLoginData() {
  console.log('checkLoginData')
  getFromStorage('username', (username) => {
    getFromStorage('password', (password) => {
      if (username && password) {
        console.log('haveLoginData')
        loginForm && (loginForm.style.display = 'none');
      }
      else {
        console.log('nohaveLoginData')
        // loginForm && (loginForm.style.display = 'block');
        loginSection && (loginSection.style.display = 'none');
      }
    });
  });
}
checkLoginData()
// 快捷登录按钮点击事件
const loginHandler = document.getElementById('loginHandler')
if (loginHandler) {
  loginHandler.addEventListener('click', function (event) {
    // 阻止按钮默认点击行为
    (event as Event).preventDefault()
    // 从扩展存储读取用户名和密码
    getFromStorage('username', (username) => {
      getFromStorage('password', (password) => {
        if (username && password) {
          // 发送消息到content script
          (window as any).chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
            console.log('tabs', tabs);
            (window as any).chrome.tabs.sendMessage(
              tabs[0].id!,
              { action: 'callContentScriptFunctionInitLogin', data: { username, password } },
            )
          })
        }
        else {
          alert('请先保存登录信息')
        }
      })
    })
  })
}
// 添加点击事件监听器
if (loginFormButton) {
  loginFormButton.addEventListener('click', function (event) {
    // 阻止表单默认提交行为
    (event as Event).preventDefault()
    // 获取用户名和密码
    const usernameEl = document.getElementById('username') as HTMLInputElement | null
    const username = usernameEl ? usernameEl.value : ''
    const passwordEl = document.getElementById('password') as HTMLInputElement | null
    const password = passwordEl ? passwordEl.value : ''
    // // 验证用户名和密码是否为空
    if (!username || !password) {
      alert('请输入用户名和密码')
      return
    }
    // 保存用户名和密码到扩展存储
    if (typeof (window as any).chrome !== 'undefined' && (window as any).chrome.storage && (window as any).chrome.storage.sync) {
      (window as any).chrome.storage.sync.set({ username: username, password: password }, function () {
        console.log('数据已保存:', ['username', 'password'], [username, password]);
      });
    } else {
      console.log('chrome.storage.sync 不可用，无法保存登录信息');
    }

    // 关闭弹窗
    // window.close();
    // 发送消息到content script
    (window as any).chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      console.log('tabs', tabs);
      (window as any).chrome.tabs.sendMessage(
        tabs[0].id!,
        { action: 'callContentScriptFunctionInitLogin', data: { username, password } },
      )
    })
  })
}

// 重置登录信息
if (resetDataButton) {
  resetDataButton.addEventListener('click', function (event) {
    // 阻止按钮默认点击行为
    (event as Event).preventDefault()
    // 确认重置
    if (!confirm('确定要重置登录信息吗？')) {
      return
    }
    // 清除存储数据
    if (typeof (window as any).chrome !== 'undefined' && (window as any).chrome.storage && (window as any).chrome.storage.sync) {
      (window as any).chrome.storage.sync.remove(['username', 'password'], function () {
        console.log('登录信息已重置');
        // 刷新当前页面
        (window as any).chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
          (window as any).chrome.tabs.reload(tabs[0].id!);
        });
      });
    };
  })
}
