import React, { useRef, useState, useEffect} from 'react';
import './App.css';
import Logo from './img/chat.png';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection,  query, orderBy, limit, serverTimestamp, addDoc } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';


import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyCfi2HC2Z-eDtag-rRIPSuzgCwkFoRbIKU",
  authDomain: "chat-room-b55ad.firebaseapp.com",
  projectId: "chat-room-b55ad",
  storageBucket: "chat-room-b55ad.appspot.com",
  messagingSenderId: "737348250624",
  appId: "1:737348250624:web:7d51ba52637b43505dbce5",
  measurementId: "G-TP40RQ9MKR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

initializeApp(firebaseConfig);
// init firestore services
const db = getFirestore();
const auth = getAuth();
//const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1><img src={Logo} /> ChatRoom</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
  }

//   const signInAnonymous = () => {
//     auth.signInAnonymously().catch(alert);
//   }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
//       <button className="sign-in" onClick={signInAnonymous}>Sign in Anonymously</button>
      <p>Do not violate the community guidelines </p>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messageInput = useRef();
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(25));

  const [messages] = useCollectionData(q);

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesRef, {
      uid,
      photoURL,
      text: formValue,
      createdAt: serverTimestamp()
    })

    messageInput.current.focus();
    setFormValue('');
    //dummy is updated when the component is re-rendered, instead of after a message is sent
  }

  //Everytime messages is modified, will use the dummy reference to scroll to the bottom.
  useEffect(() => {
    dummy.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (<>
    <main>

      {messages && messages.slice(0).reverse().map((msg, idx) => <ChatMessage key={idx} message={msg} />)}
    
      <div ref={dummy}/>

    </main>

    <form onSubmit={sendMessage}>

      <input ref={messageInput} value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>⬆️</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} referrerPolicy="no-referrer" />
      <p>{text}</p>
    </div>
  </>)
}


export default App;
