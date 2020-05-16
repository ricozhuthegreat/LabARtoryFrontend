
var environments = {
    staging: {
        FIREBASE_API_KEY: 'AIzaSyBvnoDpe9mHxfbRUMga-31NxMJQTrYyyAo',
        FIREBASE_AUTH_DOMAIN: 'labartory.firebaseapp.com',
        FIREBASE_DATABASE_URL: 'https://labartory.firebaseio.com/',
        FIREBASE_STORAGE_BUCKET: 'labartory.appspot.com',
        FIREBASE_PROJECT_ID: 'labartory',
        FIREBASE_MESSAGING_SENDER_ID: '650995555666',
        FIREBASE_APPID: "1:650995555666:web:f54f7c9b556a256b2c2e8b",
        FIREBASE_MEASUREMENTID: "G-TR4LJ3SE29",
        GOOGLE_OPTICAL_CHARACTER_RECOGNITION_API_KEY: "AIzaSyBvnoDpe9mHxfbRUMga-31NxMJQTrYyyAo"
    },
    production: {
        // Warning: This file still gets included in your native binary and is not a secure way to store secrets if you build for the app stores. Details: https://github.com/expo/expo/issues/83
      }  
};

function getReleaseChannel() {
    let releaseChannel = Expo.Constants.manifest.releaseChannel;
    if (releaseChannel === undefined) {
      return "staging";
    } else if (releaseChannel === "staging") {
      return "staging";
    } else {
      return "staging";
    }
}

function getEnvironment(env) {
    console.log("Release Channel: ", getReleaseChannel());
    return environments[env];
}
 
var Environment = getEnvironment(getReleaseChannel());
export default Environment;