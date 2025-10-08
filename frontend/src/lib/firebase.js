// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQZ3VAvbnnbJBe4azbtZJj79ZpOfIrJNg",
  authDomain: "yourtube-ff0d1.firebaseapp.com",
  projectId: "yourtube-ff0d1",
  storageBucket: "yourtube-ff0d1.firebasestorage.app",
  messagingSenderId: "8873939439",
  appId: "1:8873939439:web:d1af394d1fd5322e48a61a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };