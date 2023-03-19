import React , { useState, useEffect, useRef, useMemo }from 'react'
import { Canvas } from '@react-three/fiber'
import { Ground } from '../components/Playground/Ground'
import { Trees } from '../components/Playground/Trees'
import { Stats, Sky, useHelper, useGLTF } from '@react-three/drei'
import { Character } from '../components/Playground/Character'
import InputControl from '../components/Login/InputControl'
import { io } from 'socket.io-client'
import { Text, useAnimations } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import Marble from '../components/Playground/Marble'
import { DirectionalLightHelper, Vector3 } from 'three'
import { Physics, Debug, RigidBody} from '@micmania1/react-three-rapier'
import { useFrame } from '@react-three/fiber'
import { Affix } from '@mantine/core'
import TextareaAutosize  from 'react-textarea-autosize'

import styles from './Playground.module.css'
import loginstyles from './Login.module.css'
import interfacestyles from './Interface.module.css'


const OtherPlayers = ({action}) => {
  const cloneRef = useRef()

  const { scene, animations } = useLoader(GLTFLoader, '/public/models/character_2.glb')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const {actions} = useAnimations(animations, cloneRef)
  
  const currentAction = useRef("");

  clone.traverse((object) => {
    if(object.isMesh) {
      object.castShadow = true;
    }
  })

  useEffect(() => {
    
    if(currentAction.current != action) {
      const nextActionToplay = actions[action];
      const current = actions[currentAction.current];
      current?.fadeOut(0.2);
      nextActionToplay?.reset().fadeIn(0.2).play();
      currentAction.current = action;
    }
  },[action])

  return (
    <group ref={cloneRef}>
      <primitive object={clone} scale={[2, 2, 2]} />
    </group>
  )
}

function RotatingText(props) {
  const textRef = useRef()
  useFrame(({ camera }) => {
    if (textRef.current) {
      textRef.current.lookAt(camera.position);
    }
  })

  return (
    <Text 
      ref={textRef} 
      {...props} 
    />
  )
}

const UserWrapper = ({ position, rotation, name, action, id }) => {

  return (
      <group
          position={position}
          rotation={rotation}
      >
         
        <OtherPlayers action={action} />
          <RotatingText 
            position={[0, 4, 0]}
            color="black"
            anchorX="center"
            anchorY="middle"
            fontSize={0.5}
            font="/public/fonts/kanit/kanit-light.otf"
            maxWidth={300}
          > 
            {name} 
          </RotatingText>
              
      </group>
  )
}

const Lights = ({x, y, z}) => {
  
  const light = useRef()
  // useHelper(light, DirectionalLightHelper, 'cyan')

  return (
      <group position={[x, y, z]}>
          <pointLight  color="#bdefff" intensity={0.3}  />
          {/* <mesh>
            <boxBufferGeometry />
            <meshStandardMaterial wireframe/>
          </mesh> */}
      </group>
  )
}

const ModelHouse = () => {
  const { scene } = useGLTF('/public/models/shapespark-example-room.glb');
  scene.scale.set(3, 3, 3);

  scene.traverse((child) => {
    if (child.isMesh) {
      child.receiveShadow = true;
    }
  });

  return(
    <RigidBody type="fixed" colliders="trimesh" >
      <group dispose={null} position={[2, 0, 2]}> 
        <primitive object={scene} />
      </group>
    </RigidBody>
  )
}

const Modelstair = ({x, z}) => {
  const { scene } = useGLTF('/public/models/stair.gltf');
  scene.scale.set(2, 2, 2);

  return (
    <RigidBody type="fixed" colliders="trimesh" >
        <primitive object={scene} position={[20, -0.2, 20]}/>
    </RigidBody>

  )
}

function Playground() {
  const[logedIn, SetLogedIn] = useState(false)

  const [socketClient, setSocketClient] = useState(null)
  const [clients, setClients] = useState({})

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const testing = false

  const [username, setUsername] = useState()

  const [errorMsg, setErrorMsg] = useState("")

  const messageListRef = useRef(null);

  const Web_URL = 'http://metaverse-watsuankaew-s6204062616243-kmutnbacth.vercel.app/';

  const handleSubmission = () => {

    if(!username){
      setErrorMsg("Please enter Nickname.")
      return
    }
    setErrorMsg("")
    SetLogedIn(true)
    
  }

  const setText = (e) => {
    setMessage(e.target.value);
  }

  function handleMassage(e) {

    if (e.keyCode === 13 ) { // 13 is the code for the "Enter" key
      e.preventDefault(); // Prevent the default action of the "Enter" key
      // console.log('send text "'+message+'"')
      e.target.value = ''
      sendMessage()
    }
   
  }
  
  useEffect(() => {
    // On mount initialize the socket connection
   if(logedIn === true){ 
      setSocketClient(io(Web_URL))
    }
    
    // Dispose gracefuly
    return () => {
        if (socketClient) socketClient.disconnect()
    }
  }, [logedIn])

  useEffect(() => {
    if (socketClient) {
        socketClient.on('move', (clients) => {
            setClients(clients)
        })

      socketClient.on("message", (message) => {
        setMessages(message);
      });

    }
    
  }, [socketClient])

  const sendMessage = () => {
    const { id } = socketClient;
    if(message !== ""){
      const msg = {
        id, 
        username: username, 
        message: message,
        timestamp: Date.now(),
      }
      socketClient.emit("message", msg);
      setMessage("");
    }
  };

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  if(logedIn === true){
    
    return (socketClient &&
    <div className={styles.container}>
      <Affix position={{bottom: 20, right: 20}}>
        <div className={interfacestyles.chatInputContainer} >
          <div className={interfacestyles.textareaContainer}>
            <TextareaAutosize 
              value={message} 
              onChange={e => setText(e)} 
              onKeyDown={handleMassage} 
              aria-label='Chat' 
              placeholder='Chat' 
              maxRows={2}
            />
          </div>
        </div>
      </Affix>

      <Affix position={{bottom: 80, right: 20}}>
      <ul className={interfacestyles.ul_chatBox} ref={messageListRef}>
          {messages.map((message, index) => (
            <li className={interfacestyles.li_chatBox}>
              <div key={index} className={interfacestyles.chatBox}>
                <span className={interfacestyles.name}>{message.username} </span>
                <span className={interfacestyles.message}>{message.message}</span>
              </div>
            </li>  
            ))
          }
        
      </ul>
      </Affix>

      <Canvas 
        shadows  
        camera={{
          position: [0, 5, 8],
          fov: 70,
        }}
      >
        {testing ? <Stats/> : null}
        {testing ? <axesHelper args={[2]}/> : null}
        {testing ? <gridHelper args={[10, 10]}/> : null}
        <Lights x={-15} y={10} z={-17}/>
        <Lights x={8} y={10} z={7}/>
        <Lights x={-15} y={10} z={7}/>
        <Lights x={8} y={10} z={-17}/>
        <Lights x={8} y={10} z={11}/>
        <Lights x={8} y={10} z={22}/>
        <Lights x={-9} y={10} z={22}/>
        <Lights x={-9} y={10} z={11}/>
        
        <ambientLight intensity={0.4} position={[0, 10, 0]} />
        {/* <Sky sunPosition={new Vector3(100, 10, 100)} /> */}
        <Physics timeStep="vary">
          {/* <Debug /> */}
          {/* <Ground x={100} z={100}/> */}
          {/* <Modelstair x={20} z={20} /> */}
          <ModelHouse/>
          {/* <Marble/> */}
          {/* <Trees boundary={500} count={200}/> */}
          <Character socket={socketClient} name={username}/>
          
          </Physics>
          {Object.keys(clients)
            .filter((clientKey) => clientKey !== socketClient.id)
            .map((client) => {
              const { position, rotation, name, action } = clients[client]
                return (
                  <UserWrapper
                    key={client}
                    id={client}
                    name={name}
                    position={position}
                    rotation={rotation}
                    action={action}
                  />
                )
            })
          }
      </Canvas>
    </div>
  )}

  return(
    <div className={loginstyles.container}>
    <div className={loginstyles.innerBox}>
        <h1 className={loginstyles.header}>Login</h1>
        <InputControl 
          label="Nickname" 
          placeholder="Enter Nickname" 
          onChange={(event)=>
            setUsername(event.target.value)
          }
        />
        

        <div className={loginstyles.footer}>
          <b className={loginstyles.error}>{errorMsg}</b>
          <button onClick={handleSubmission}>Login</button>
        </div>
    </div>
</div>
  )
}

export default Playground