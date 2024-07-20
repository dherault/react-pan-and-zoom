// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyC40XAfrVWA6tACd6PB50hJRQniV4hr05Q',
  authDomain: 'react-pan-and-zoom.firebaseapp.com',
  projectId: 'react-pan-and-zoom',
  storageBucket: 'react-pan-and-zoom.appspot.com',
  messagingSenderId: '404520020794',
  appId: '1:404520020794:web:3adf14f716f21f03873e03',
  measurementId: 'G-HF52R5K9HH',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

getAnalytics(app)
