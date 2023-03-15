import React, { useEffect, useState } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export const Trees = (props) => {
    const model = useLoader(GLTFLoader, "/public/models/Tree.glb");
    const [trees, SetTrees] = useState([])
  
    model.scene.traverse((object) => {
      if(object.isMesh) {
        object.castShadow = true;
      }
    })

    const boxIntersect = (
      minAx, 
      minAz, 
      maxAx, 
      maxAz, 
      minBx, 
      minBz, 
      maxBx, 
      maxBz
      ) => {

      let aLeft0fB = maxAx < minBx;
      let aRight0fB = minAx > maxBx;
      let aAboveB = minAz > maxBz;
      let aBelowB = maxAz < minBz;

      return !(aLeft0fB || aRight0fB || aAboveB || aBelowB)
    }

    const isOverlapping = (index, tree, trees) => {
      // console.log(tree.position)
      const minTargetX = tree.position.x - tree.box / 2;
      const maxTargetX = tree.position.x + tree.box / 2;
      const minTargetz = tree.position.z - tree.box / 2;
      const maxTargetz = tree.position.z + tree.box / 2;

      for(let i = 0; i < index; i++){
        let minChildX = trees[i].position.x - trees[i].box / 2;
        let maxChildX = trees[i].position.x + trees[i].box / 2;
        let minChildZ = trees[i].position.z - trees[i].box / 2;
        let maxChildZ = trees[i].position.z + trees[i].box / 2;

        if(
          boxIntersect(
            minTargetX,
            minTargetz,
            maxTargetX,
            maxTargetz,
            minChildX,
            minChildZ,
            maxChildX,
            maxChildZ
          )
        ) {
          // console.log("Box overlapping!", tree.position);
          return true;
        }
      }
      return false;
    }

    const newPosition = (box, boundary) => {
      return (
        boundary / 2 - box / 2 -
        (boundary - box) * (Math.round( Math.random() * 100) / 100)
      )
    }

    const updatePosition = (treeArray, boundary) => {
      treeArray.forEach((tree, index) => {
        do {
        tree.position.x = newPosition(tree.box, boundary)
        tree.position.z = newPosition(tree.box, boundary)
        } while (isOverlapping(index, tree, treeArray));
      })
      SetTrees(treeArray);
    }

    useEffect(() => {
      const tempTrees = []
      for(let i = 0; i < props.count; i++){
        tempTrees.push({position: {x:0, z:0}, box: 5})
      }
      // console.log(tempTrees)
      updatePosition(tempTrees, props.boundary)

    }, [props.boundary, props.count])

    return (
      <group rotation={[0, 5, 0]}>
        {trees.map((tree, index) => {
          return (
            <object3D key={index} position={[tree.position.x, 0, tree.position.z]} >
              <mesh scale={[tree.box, tree.box, tree.box]} >
                <boxGeometry/>
                <meshBasicMaterial color={"blue"} visible={false}/>
              </mesh>
              <primitive object={model.scene.clone()} />
            </object3D>
          )
        })}
      </group>
    )
      
}