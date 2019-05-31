import * as THREE from 'three'
import React, { useState, useEffect, useRef } from 'react'
import { extend, Canvas, useThree, useRender } from 'react-three-fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import measurementRawData from '../data/measurements'

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

function computePlanarUV(geometry) {
  geometry.computeBoundingBox()
  const {min, max} = geometry.boundingBox
  const center = new THREE.Vector2((max.x + min.x) / 2.0, (max.y + min.y) / 2.0)
  const scale = Math.max(max.x - min.x, max.y - min.y)
  const vertices = geometry.vertices

  geometry.faceVertexUvs[0] = geometry.faces.map(face => {
    const v1 = vertices[face.a]
    const v2 = vertices[face.b]
    const v3 = vertices[face.c]

    return [
        new THREE.Vector2((v1.x - center.x) / scale + 0.5, (v1.y - center.y) / scale + 0.5),
        new THREE.Vector2((v2.x - center.x) / scale + 0.5, (v2.y - center.y) / scale + 0.5),
        new THREE.Vector2((v3.x - center.x) / scale + 0.5, (v3.y - center.y) / scale + 0.5)
    ]
  })
  
  geometry.uvsNeedUpdate = true;
}


// Note: Normally, the 3D model should have its UV already set.
function computeUV(group) {
  group.traverse(child => {
    if (child.isMesh) {
      const geometry = new THREE.Geometry().fromBufferGeometry(child.geometry)
      computePlanarUV(geometry)
      child.geometry = new THREE.BufferGeometry().fromGeometry(geometry)
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
      .then(computeUV)
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
          child.material.map = texture
          child.material.needsUpdate = true
        }
      })
    }
  }, [loadedGroup, texture])

  return loadedGroup && <primitive object={loadedGroup} />
}

// Let the `orbitControls` component control the camera.
function Controls(props) {
  const {camera} = useThree()
  const controls = useRef()
  useRender(() => controls.current && controls.current.update())
  return <orbitControls ref={controls} args={[camera]} {...props} />
}

function AnimatedLines({path, nbPoints, radius, closed, growthVelocity}) {
  const geometry = new THREE.TubeBufferGeometry(path, nbPoints, radius, 8, closed)

  const material = new THREE.ShaderMaterial({
    uniforms: {
      color1: {
        value: new THREE.Color("yellow")
      },
      color2: {
        value: new THREE.Color("green")
      }
    },
    vertexShader: `
      varying vec2 vUv;
  
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
    
      varying vec2 vUv;
      
      void main() {
        gl_FragColor = vec4(mix(color1, color2, vUv.x), 1.0);
      }
    `,
    polygonOffset: true,
    polygonOffsetFactor: -1000,
  })

  return (
    <mesh geometry={geometry}
          material={material} />
  )
}

const measurementNames = [
  'Chest Circumference',
  'Right Upper Arm Circumference',
  'Narrow Waist Circumference',
  'High Hip Circumference',
  'Left Thigh Circumference',
  'Left Ankle Circumference'
]

const measurements = measurementNames.map(name => {
  const points = measurementRawData['measurement'][name]['line_points']
    .map(([x, y, z]) => new THREE.Vector3(x, y, z))

  const closed = measurementRawData['measurement'][name]['closed']
  
  const path = new THREE.CatmullRomCurve3(points, closed)

  const nbPoints = points.length

  return {path, nbPoints, closed}
})

export default function ModelViewer() {
  // The Angle between the horizon and the vertical limit of the camera toward up and down.
  const upDownRad = 30.0 / 180.0 * Math.PI

  const measurement = measurements[0]

  // TODO: add the UI around the canvas
  return (
    <Canvas style={{background: '#A2CCB6', height: '80vh'}}
            camera={{position: [0, 0, 100]}}>
      <Controls enableDamping
                enablePan={false}
                enableZoom={false}
                dampingFactor={0.1}
                rotateSpeed={0.1}
                minPolarAngle={(Math.PI / 2.0) - upDownRad}
                maxPolarAngle={(Math.PI / 2.0) + upDownRad} />
      <ambientLight intensity={0.5} />
      <spotLight intensity={0.5} position={[300, 300, 400]} />
      <group position={new THREE.Vector3(0, -58, 8)}
             scale={new THREE.Vector3(0.07, 0.07, 0.07)}>
        <LoadedObjModel ObjFilename={'guy.obj'} textureFilename={'white-fabric.jpg'} />
        <AnimatedLines path={measurement.path}
                       nbPoints={measurement.nbPoints}
                       radius={5.0}
                       closed={measurement.closed}
                       growthVelocity={10.0} />
      </group>
    </Canvas>
  )
}
