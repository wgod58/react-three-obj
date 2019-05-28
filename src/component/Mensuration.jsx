import * as THREE from 'three'
import React, { useState, useEffect, useRef } from 'react'
import { extend, Canvas, useThree, useRender } from 'react-three-fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

extend({ OrbitControls })

// Creates the objLoader
const objLoader = new OBJLoader()
objLoader.setPath('/assets/')

// Wraps its load function into a promise
function loadObjAsync(filename, onProgress) {
  return new Promise((onResolve, onReject) => objLoader.load(filename, onResolve, onProgress, onReject))
}

function LoadedObjModel({filename}) {
  const [loadedGroup, setLoadedGroup] = useState(null)

  useEffect(() => {
    loadObjAsync(filename).then(setLoadedGroup)
  }, [filename])

  return loadedGroup && <primitive object={loadedGroup} />
}

function Controls(props) {
  const { camera } = useThree()
  const controls = useRef()
  useRender(() => controls.current && controls.current.update())
  return <orbitControls ref={controls} args={[camera]} {...props} />
}

export default function Mensuration() {
  // The Angle between the horizon and the vertical limit of the camera toward up and down.
  const upDownRad = 18 / 180.0 * Math.PI

  // TODO: add the UI around the canvas
  return (
    <Canvas style={{ background: '#A2CCB6', height: '80vh' }}
            camera={{ position: [0, 0, 100] }}>
      <Controls enableDamping
                enablePan={false}
                enableZoom={false}
                dampingFactor={0.1}
                rotateSpeed={0.1}
                minPolarAngle={(Math.PI / 2) - upDownRad}
                maxPolarAngle={(Math.PI / 2) + upDownRad} />
      <ambientLight intensity={0.5} />
      <spotLight intensity={0.8} position={[300, 300, 400]} />
      <group position={new THREE.Vector3(0, -58, 8)}
             scale={new THREE.Vector3(0.07, 0.07, 0.07)}>
        <LoadedObjModel filename={'guy.obj'}/>
      </group>
    </Canvas>
  )
}
