import firebase from 'firebase'
import 'firebase/auth';
import 'firebase/database';


var firebaseConfig = {
  apiKey: "AIzaSyA9fAIu5bJ8yI81nky83uFlNtjbKapYX4U",
  authDomain: "cartpeddle.firebaseapp.com",
  databaseURL: "https://cartpeddle.firebaseio.com",
  projectId: "cartpeddle",
  storageBucket: "cartpeddle.appspot.com",
  messagingSenderId: "627317634699",
  appId: "1:627317634699:web:b77ee73371bc39e921868e",
  measurementId: "G-6GQZSJJRB5"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

 export default firebase;
