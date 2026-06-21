export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/category/index',
    'pages/post/index',
    'pages/message/index',
    'pages/mine/index',
    'pages/detail/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#dc2626',
    navigationBarTitleText: '秀酷纹身之家',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#999',
    selectedColor: '#dc2626',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/tab/home.png',
        selectedIconPath: 'assets/tab/home-active.png',
      },
      {
        pagePath: 'pages/category/index',
        text: '分类',
        iconPath: 'assets/tab/category.png',
        selectedIconPath: 'assets/tab/category-active.png',
      },
      {
        pagePath: 'pages/post/index',
        text: '发布',
        iconPath: 'assets/tab/post.png',
        selectedIconPath: 'assets/tab/post-active.png',
      },
      {
        pagePath: 'pages/message/index',
        text: '消息',
        iconPath: 'assets/tab/message.png',
        selectedIconPath: 'assets/tab/message-active.png',
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/tab/mine.png',
        selectedIconPath: 'assets/tab/mine-active.png',
      },
    ],
  },
});
