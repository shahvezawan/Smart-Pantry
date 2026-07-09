import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);

async function main() {
  try {
    const cred = await signInWithEmailAndPassword(auth, 'shahvezawan@gmail.com', 'admin007');
    console.log('Login success:', cred.user.uid);
  } catch (err) {
    console.error('Login error:', err.message);
  }
}
main();
