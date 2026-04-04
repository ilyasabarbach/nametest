const config = {
  appId: "com.nametests.cosmicmatch",
  appName: "Cosmic Match",
  webDir: "../game-web/dist",
  server: {
    androidScheme: "https"
  },
  plugins: {
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: false,
        twitter: false
      },
      logLevel: 1
    }
  }
};

export default config;
