import { useEffect, useState } from 'react'
import './App.css'
import * as odd from '@oddjs/odd';


async function initializeODD() {
  try {
    console.log('Initializing ODD...');
    const program = await odd.program({
      namespace: { creator: "0xt3j4s", name: "Odd-Linked" }
    });

    console.log('ODD initialized:', program);

    return program;

  } catch (error) {
    if (error) {
      switch (error) {
        case odd.ProgramError.InsecureContext:
          console.log('Insecure context');
          break;
        case odd.ProgramError.UnsupportedBrowser:
          console.log('Unsupported browser');
          break;
        default:
          console.error('Unexpected error:', error);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

async function AuthenticatedApp(program) {
  let session

  // Do we have an existing session?
  if (program.session) {
    console.log(`Already authenticated as ${program.session.username}`)
    session = program.session

  // If not, let's authenticate.
  // (a) new user, register a new Fission account
  } else if (userChoseToRegister) {
    console.log("Registering new user")
    const { success } = await program.auth.register({ username: "llama" })
    session = success ? program.auth.session() : null

  // (b) existing user, link a new device
  } else {
    // On device with existing session:
    const producer = await program.auth.collect(program.session.username)

    producer.on("challenge", challenge => {
      // Either show `challenge.pin` or have the user input a PIN and see if they're equal.
      if (userInput === challenge.pin) challenge.confirmPin()
      else challenge.rejectPin()
    })

    producer.on("link", ({ approved }) => {
      if (approved) console.log("Link device successfully")
    })

    // On device without session:
    //     Somehow you'll need to get ahold of the username.
    //     Few ideas: URL query param, QR code, manual input.
    const consumer = await program.auth.accountConsumer(username)

    consumer.on("challenge", ({ pin }) => {
      showPinOnUI(pin)
    })

    consumer.on("link", async ({ approved, username }) => {
      if (approved) {
        console.log(`Successfully authenticated as ${username}`)
        session = await program.auth.session()
      }
    })
  }
}


function App() {

    useEffect(() => {  
      console.log('inside useEffect..')
      const initializeAndAuth = async () => {
        const program = await initializeODD();
        if (!program) {
          await AuthenticatedApp(program);
        }
      }
      initializeAndAuth();
    }, []); // Empty dependency array ensures useEffect runs only once
  
    return (
      <div>
        <h1>Odd-Linked</h1>
        {/* Your app content here */}
      </div>
    );
  }


export default App
