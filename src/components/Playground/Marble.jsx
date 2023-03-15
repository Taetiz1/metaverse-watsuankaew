import React from 'react'
import * as THREE from "three"
import { RigidBody } from '@micmania1/react-three-rapier'

export const Marble = () => { 
    

  return (
    <RigidBody type="fixed" friction={0} restitution={0}>
       <mesh position={[10, 1, 0]}>
          <boxGeometry args={[0.1, 3, 20]} />
          <meshStandardMaterial color="#8899aa" />
        </mesh>
        <mesh position={[-10, 1, 0]}>
          <boxGeometry args={[0.1, 3, 20]} />
          <meshStandardMaterial color="#8899aa" />
        </mesh>
        <mesh position={[0, 1, 10]}>
          <boxGeometry args={[20, 3, 0.1]} />
          <meshStandardMaterial color="#8899aa" />
        </mesh>
        <mesh position={[0, 1, -10]}>
          <boxGeometry args={[20, 3, 0.1]} />
          <meshStandardMaterial color="#8899aa" />
        </mesh>
    </RigidBody>
  )
}

export default Marble