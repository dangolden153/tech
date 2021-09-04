
import Firebase from 'firebase';
let config = {
    apiKey: "AIzaSyCThBXDU4wp-V-Bs9KN7Iskvmc_R09AaVw",
    authDomain: "tech2mart.firebaseapp.com",
    databaseURL: "https://tech2mart.firebaseio.com",
    projectId: "tech2mart",
    storageBucket: "tech2mart.appspot.com",
    messagingSenderId: "769029610808",
    appId: "1:769029610808:web:a500f930a2dd04dc"
};
let app = Firebase.initializeApp(config);
export const db = app.database();
export const auth = app.auth();
export const storage = app.storage();
export const firebase = app;
