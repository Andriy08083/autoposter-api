module.exports = {
  USER: {
    USER_ROUTER: '/user',
    REGISTRATION: '/register',
    LOGIN: '/login',
    LOGOUT_USER: '/logout/:token',
    REFRESH_USER_TOKEN: '/refresh',
    GET_USER: '/',
    UPDATE_USER: '/update',
  },
  TOKEN: {
    TOKEN_ROUTER: '/token',
    ACCESS_TOKEN: '/accessToken',
    REFRESH_TOKEN: '/refreshToken',
  },
  MAIL: {
    MAIL_ROUTER: '/mail',
    RESET_PASSWORD: '/reset-password',
  },
};