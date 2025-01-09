const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');
const firebaseConfig = {
  apiKey: "AIzaSyD_l2v4Jr846tYtgi8b-Q5mEF7QUr7Oykk",
  authDomain: "animalitos-a10a1.firebaseapp.com",
  databaseURL: "https://animalitos-a10a1-default-rtdb.firebaseio.com",
  projectId: "animalitos-a10a1",
  storageBucket: "animalitos-a10a1.appspot.com",
  messagingSenderId: "298092572641",
  appId: "1:298092572641:web:064fde7cf49de342aeaca0"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

module.exports = db;
