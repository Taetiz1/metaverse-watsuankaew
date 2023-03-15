import React, { useRef} from 'react'
import { RigidBody } from '@micmania1/react-three-rapier'

export const Ground = ({x, z}) => {

  return (
    <RigidBody colliders="cuboid" type="fixed">
      <mesh rotation-x={Math.PI * -0.5} receiveShadow position={[0, 0, 0]} >
        <planeGeometry args={[x, z]}/>
        <meshStandardMaterial color={"#458745"}/>
      </mesh>
    </RigidBody>
  )
}