import React, { useRef, useEffect } from "react";
import { useInput } from "../../hooks/useInput";
import { useAnimations, useGLTF, OrbitControls } from "@react-three/drei";
import { useThree, useFrame  } from "@react-three/fiber";
import { Quaternion, Vector3 } from "three";
import { RigidBody, CapsuleCollider } from "@micmania1/react-three-rapier";

let walkDirection = new Vector3();
let rotateAngle = new Vector3(0, 1, 0);
let rotateQuarternion = new Quaternion();
let cameraTarget = new Vector3()

const directionOffset = ({ forward, backward, left, right}) => {
    var directionOffset = 0;

    if(forward) {
        if(left) {
            directionOffset = Math.PI / 4;
        }
        else if(right) {
            directionOffset = -Math.PI / 4;
        }
    } else if (backward) {
        if(left) {
            directionOffset = Math.PI / 4 + Math.PI / 2;
        }
        else if(right){
            directionOffset = -Math.PI / 4 - Math.PI / 2;
        }
        else {
            directionOffset = Math.PI
        }
    } 
    else if(left) {
        directionOffset = Math.PI / 2;
    }
    else if(right) {
        directionOffset = -Math.PI / 2;
    }

    return directionOffset;
}

export const Character = ({socket, name}) => {
    const {forward, backward, left, right, jump, shift, wave} = useInput();
    const {animations, scene} = useGLTF('/public/models/character_2.glb');
    const modelRef = useRef();
    const bodyRef = useRef(null);
    const { id } = socket
  
    const {actions} = useAnimations(animations, scene)
  
    scene.scale.set(2, 2, 2);
  
    scene.traverse((object) => {
      if(object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true
      }
    })
  
    const currentAction = useRef("");
    const controlsRef = useRef()
    const camera = useThree(state => state.camera);
    const gl = useThree(state => state.gl);

    const minDistance = 5;
    const maxDistance = 7;

    const updateCameraTarget = () => {
        const body = bodyRef.current;
        const distance = camera.position.distanceTo(body.translation())

        if(distance == minDistance){
            camera.position.x += 1
            camera.position.y += 0
            camera.position.z += 1
        }

        cameraTarget.x = body.translation().x;
        cameraTarget.y = body.translation().y + 2;
        cameraTarget.z = body.translation().z;
        if(controlsRef.current){ controlsRef.current.target = cameraTarget; }
    }

    
    useEffect(() => {
      let action = ""
      // actions?.idle?.play();
      if(forward || backward || left || right) {
        action = "walking"
        if(shift) {
          action = "running"
        }
      } else if(jump){
        action = "jumping"
      } else if(wave) {
        action = "waving"
      }
      else {
        action = "idle"
      }
  
      if(currentAction.current != action) {
        const nextActionToplay = actions[action];
        const current = actions[currentAction.current];
        current?.fadeOut(0.2);
        nextActionToplay?.reset().fadeIn(0.2).play();
        currentAction.current = action;
      }
  
    }, [forward, backward, left, right, jump, shift, wave])

    useFrame((state, delta) => {
        const body = bodyRef.current;
        const movement = new Vector3;
        const translation = body.translation();

            if(currentAction.current === 'running' || 
            currentAction.current === 'walking'){
                let angleYCameraDirection = Math.atan2(
                    camera.position.x - body.translation().x,
                    camera.position.z - body.translation().z
                );

                let newDirectionOffset = directionOffset({
                    forward,
                    backward,
                    left,
                    right
                });

                rotateQuarternion.setFromAxisAngle(
                    rotateAngle,
                    angleYCameraDirection + newDirectionOffset
                );
                scene.quaternion.rotateTowards(rotateQuarternion, 0.2)

                camera.getWorldDirection(walkDirection);
                walkDirection.normalize();
                walkDirection.applyAxisAngle(rotateAngle, newDirectionOffset);

                const velocity = currentAction.current == "running" ? 6 : 3;

                const moveX = walkDirection.x * velocity * delta;
                const moveY = walkDirection.y * velocity * delta;
                const moveZ = walkDirection.z * velocity * delta;

                movement.x =  moveX
                movement.y =  moveY
                movement.z =  moveZ
                
                body.setTranslation(translation.add(movement), true)
                
                
            } 
            updateCameraTarget();
        
        const { rotation } = modelRef.current
        
        const posArray = []
        const rotArray = []

        body.translation().toArray(posArray)
        posArray[1] -= 1.6
        
        rotation.toArray(rotArray)

        socket.emit('move', {
            id,
            name: name,
            rotation: rotArray,
            position: posArray,
            action: currentAction.current
        })

    })
  
    return (
        <RigidBody
            ref={bodyRef}
            type="Dynamic" 
            colliders={false}
            enabledRotations={[false, false, false]} 
            position={[0, 2, 0]}
        >
            <CapsuleCollider args={[1, 0.6]} />
            <group dispose={null} position={[0, -1.6, 0]}>    
                <primitive object={scene} ref={modelRef} />
            </group>
            
            <OrbitControls 
                enablePan={false} 
                enableRotate={true} 
                enableDamping={false} 
                ref={controlsRef}
                args={[camera, gl.domElement]}
                minDistance={minDistance}
                maxDistance={maxDistance}
                minPolarAngle={Math.PI / 2}
                maxPolarAngle={Math.PI - Math.PI / 2}
            />
        </RigidBody>
    )
}