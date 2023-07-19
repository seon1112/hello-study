/* 
    (needs patch) 
    IMPLEMENTATION OF AUTHENTICATION ROUTE AFTER REDIRECT FROM GITHUB.
*/

const localAuth = {
  /**
   * 초기화(기본설정)
   */
  init() {
    this.KEY = 'BaekjoonHub_token';
    this.ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
    this.AUTHORIZATION_URL = 'https://github.com/login/oauth/authorize';
    this.CLIENT_ID = '975f8d5cf6686dd1faed';
    this.CLIENT_SECRET = '934b2bfc3bb3ad239bc67bdfa81a378b1616dd1e';
    this.REDIRECT_URL = 'https://github.com/'; // for example, https://github.com
    this.SCOPES = ['repo'];
  },

  /**
   * 코드 파싱
   *
   * @param url The url containing the access code. url에 포함된 코드
   */
  parseAccessCode(url) {
    if (url.match(/\?error=(.+)/)) {
      chrome.tabs.getCurrent(function (tab) {
        chrome.tabs.remove(tab.id, function () {});
      });
    } else {
      const accessCode = url.match(/\?code=([\w\/\-]+)/);
      if (accessCode) {
        this.requestToken(accessCode[1]);
      }
    }
  },

  /**
   * 토큰 요청
   *
   * @param code The access code returned by provider. code 제공자가 반환한 액세스 코드.
   */
  requestToken(code) {
    const that = this;
    const data = new FormData();
    data.append('client_id', this.CLIENT_ID);
    data.append('client_secret', this.CLIENT_SECRET);
    data.append('code', code);

    const xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          that.finish(xhr.responseText.match(/access_token=([^&]*)/)[1]);
        } else {
          chrome.runtime.sendMessage({
            closeWebPage: true,
            isSuccess: false,
          });
        }
      }
    });
    xhr.open('POST', this.ACCESS_TOKEN_URL, true);
    xhr.send(data);
  },

  /**
   * Finish
   *
   * @param token The OAuth2 token given to the application from the provider.
   */
  finish(token) {
    /* Get username 사용자 이름가져오기*/
    // To validate user, load user object from GitHub. 사용자의 유효성을 확인하기 위해 해당 부분을 구글로 교체해야 될 듯?
    const AUTHENTICATION_URL = 'https://api.githb.com/user';

    const xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const username = JSON.parse(xhr.responseText).login;
          chrome.runtime.sendMessage({
            closeWebPage: true,
            isSuccess: true,
            token,
            username,
            KEY: this.KEY,
          });
        }
      }
    });
    xhr.open('GET', AUTHENTICATION_URL, true);
    xhr.setRequestHeader('Authorization', `token ${token}`);
    xhr.send();
  },
};

localAuth.init(); // load params.
const link = window.location.href;

// /* Check for open pipe */
// if (window.location.host === 'github.com') {
//   chrome.storage.local.get('pipe_baekjoonhub', (data) => {
//     if (data && data.pipe_baekjoonhub) {
//       localAuth.parseAccessCode(link);
//     }
//   });
// }