import * as THREE from 'three'
import React, { useState, useEffect, useRef } from 'react'
import { extend, Canvas, useThree, useRender } from 'react-three-fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

extend({ OrbitControls })

// Creates the .obj file loader
const objLoader = new OBJLoader()
objLoader.setPath('/assets/')

// Wraps its load function into a promise
function loadObjAsync(filename, onProgress) {
  return new Promise((onResolve, onReject) => objLoader.load(filename, onResolve, onProgress, onReject))
}

// Creates the texture loader
const textureLoader = new THREE.TextureLoader()
textureLoader.setPath('/assets/')

// Wraps its load function into a promise
function loadTextureAsync(filename, onProgress) {
  return new Promise((onResolve, onReject) => textureLoader.load(filename, onResolve, onProgress, onReject))
}

// Note: Normally, the 3D model should have its normals already set.
function computeNormals(group) {
  group.traverse(child => {
    if (child.isMesh) {
      const geo = new THREE.Geometry().fromBufferGeometry(child.geometry)
      geo.mergeVertices()
      geo.computeVertexNormals()
      child.geometry = new THREE.BufferGeometry().fromGeometry(geo)
    }
  })

  return group
}

function LoadedObjModel({ObjFilename, textureFilename}) {
  const [loadedGroup, setLoadedGroup] = useState(null)
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    loadObjAsync(ObjFilename)
      .then(computeNormals)
      .then(setLoadedGroup)
  }, [ObjFilename])

  useEffect(() => {
    loadTextureAsync(textureFilename)
      .then(setTexture)
  }, [textureFilename])

  useEffect(() => {
    // Assign the texture to the model if both are already loaded.
    if (loadedGroup && texture) {
      loadedGroup.traverse(child => {
        if (child.isMesh) {
          // console.log('Texture is set on the mesh.')
          child.material.map = texture
        }
      })
    }
  }, [loadedGroup, texture])

  return loadedGroup && <primitive object={loadedGroup} />
}

// Let the `orbitControls` component control the camera.
function Controls(props) {
  const { camera } = useThree()
  const controls = useRef()
  useRender(() => controls.current && controls.current.update())
  return <orbitControls ref={controls} args={[camera]} {...props} />
}

export default function ModelViewer() {
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
        <LoadedObjModel ObjFilename={'guy.obj'} textureFilename={'fabric-red-white.jpg'}/>
      </group>
    </Canvas>
  )
}
