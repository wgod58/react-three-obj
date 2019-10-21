import * as THREE from 'three'
import React, { useState, useEffect, useReducer, useMemo, useRef } from 'react'
import {
  extend,
  Canvas,
  useThree,
  useRender,
  useFrame,
} from 'react-three-fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import measurementRawData from '../data/measurements'
import StyleMap, {
  typeMap as skinTypeMap,
  // textureCube,
  // reset as skinReset,
} from './modelViewStyle'
import { SketchPicker } from 'react-color'
import { textureCubeRefraction, textureCube } from './modelScene'

// new THREE.MeshBasicMaterial()
extend({ OrbitControls })

// Creates the .obj file loader
const objLoader = new OBJLoader()
objLoader.setPath('/assets/')

// Wraps its load function into a promise
const loadObjAsync = (filename, onProgress) =>
  new Promise((resolve, reject) =>
    objLoader.load(filename, resolve, onProgress, reject),
  )

// Creates the texture loader
const textureLoader = new THREE.TextureLoader()
textureLoader.setPath('/assets/')

// Wraps its load function into a promise
function loadTextureAsync(filename, onProgress) {
  return new Promise((resolve, reject) =>
    textureLoader.load(filename, resolve, onProgress, reject),
  )
}

// Note: Normally, the 3D model should have its normals already set.
function computeNormals(group) {
  // group.add(scene)
  group.traverse(child => {
    // scene.add(child)
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
  const { min, max } = geometry.boundingBox
  const center = new THREE.Vector2((max.x + min.x) / 2.0, (max.y + min.y) / 2.0)
  const scale = Math.max(max.x - min.x, max.y - min.y)
  const vertices = geometry.vertices

  geometry.faceVertexUvs[0] = geometry.faces.map(face => {
    const v1 = vertices[face.a]
    const v2 = vertices[face.b]
    const v3 = vertices[face.c]

    return [
      new THREE.Vector2(
        (v1.x - center.x) / scale + 0.5,
        (v1.y - center.y) / scale + 0.5,
      ),
      new THREE.Vector2(
        (v2.x - center.x) / scale + 0.5,
        (v2.y - center.y) / scale + 0.5,
      ),
      new THREE.Vector2(
        (v3.x - center.x) / scale + 0.5,
        (v3.y - center.y) / scale + 0.5,
      ),
    ]
  })

  geometry.uvsNeedUpdate = true
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
const setMaterils = (type, params) => group => {
  group.traverse(child => {
    if (child.isMesh) {
      StyleMap[type](child, params)
    }
  })
}

const skinSwitch = (group, isSkin) => {
  group.traverse(child => {
    if (child.isMesh) {
      child.material.wireframe = !isSkin
    }
  })
}

const removeWireframe = group => {
  group.traverse(child => {
    if (child.isMesh) {
      child.children = child.children.filter(c => !c.isLine)
    }
  })
}

const putWireframe = (group, { color }) => {
  group.traverse(child => {
    if (child.isMesh) {
      var geo = new THREE.EdgesGeometry(child.geometry) // or WireframeGeometry
      var mat = new THREE.LineBasicMaterial({
        color: color,
      })
      var wireframe = new THREE.LineSegments(geo, mat)
      child.add(wireframe)
    }
  })
}

const defaultSetting = (group, { isEnvMap, skinType }) => {
  group.traverse(child => {
    if (child.isMesh) {
      child.addEventListener('mousedown', ev => {})
      child.material.needsUpdate = true
      switch (skinType) {
        case skinTypeMap.BLUE_WITH_LIGHT_EFFECT_IN_MESH:
        case skinTypeMap.BLUE_WITH_LIGHT_EFFECT: {
          child.material.envMap = isEnvMap ? textureCubeRefraction : null
          break
        }
        case skinTypeMap.BLUE_WITH_PURPLE_EFFECT: {
          break
        }
        default: {
          child.material.envMap = isEnvMap ? textureCube : null
          break
        }
      }
    }
  })
}

function LoadedObjModel({
  ObjFilename,
  textureFilename,
  isWireframe,
  wireframeColor,
  isSkin,
  isEnvMap,
  skinType,
}) {
  const [loadedGroup, setLoadedGroup] = useState(null)
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    loadObjAsync(ObjFilename)
      .then(computeNormals)
      .then(computeUV)
      .then(setLoadedGroup)
    // .then(group => scene.add(group))
  }, [ObjFilename])

  useEffect(() => {
    loadTextureAsync(textureFilename).then(setTexture)
  }, [textureFilename])

  useEffect(() => {
    // Assign the texture to the model if both are already loaded.
    // if (loadedGroup && texture) {
    //   loadedGroup.traverse(child => {
    //     if (child.isMesh) {
    //     }
    //   })
    // }
  }, [loadedGroup, texture])

  if (loadedGroup) {
    setMaterils(skinType, {
      map: texture,
    })(loadedGroup)
    if (isWireframe && isSkin) {
      putWireframe(loadedGroup, { color: wireframeColor })
    } else {
      removeWireframe(loadedGroup)
    }
    skinSwitch(loadedGroup, isSkin)
    defaultSetting(loadedGroup, { isEnvMap, skinType })
  }

  return (
    loadedGroup && (
      <primitive
        // receiveShadow
        // onClick={ev => console.log(ev)}
        object={loadedGroup}
      />
    )
  )
}

// Let the `orbitControls` component control the camera.
function Controls(props) {
  const { camera } = useThree()
  const controls = useRef()
  useEffect(() => {
    const { current: cameraDom } = controls
    cameraDom.target.y = 15
  })

  useFrame(() => controls.current.update())
  return (
    <orbitControls
      ref={controls}
      args={[camera, document.getElementById('camera-body')]}
      {...props}
    />
  )
}

function Plane({ color, position: [, , z], size: [width, height] }) {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        envMap: textureCubeRefraction,
      }),
    [color],
  )
  const ground = useMemo(() => {
    const geometry = new THREE.CircleGeometry(width, 6)
    const ground = new THREE.Mesh(geometry, material)
    ground.rotation.x = -Math.PI / 2
    ground.scale.multiplyScalar(3)
    // ground.castShadow = true
    // ground.receiveShadow = true
    ground.translateZ(z)
    return ground
  }, [width, z, material])

  return <primitive object={ground} />
}

function BackgroundSphere({ colorGround, colorSky, horizonFactor }) {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        // color: colorSky,
        side: THREE.BackSide,
        envMap: textureCubeRefraction,
        // map: textureGeneral,
      }),
    [colorSky],
  )
  const [geometry] = useState(new THREE.SphereBufferGeometry(200, 32, 32))

  return <mesh geometry={geometry} material={material} />
}

function AnimatedLines({
  path,
  nbPoints,
  radius,
  closed,
  color1,
  color2,
  backColorsOpacity,
  animSpeed,
}) {
  const geometry = useMemo(() => {
    return new THREE.TubeBufferGeometry(path, nbPoints, radius, 8, closed)
  }, [path, nbPoints, radius, closed])

  const materialBack = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color1: {
          value: color1,
        },
        color2: {
          value: color2,
        },
        opacity: {
          value: backColorsOpacity,
        },
        time: {
          value: 0.0,
        },
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
        uniform float opacity;
        uniform float time;

        varying vec2 vUv;

        void main() {
          float t = mod(vUv.x - time, 1.0);

          // Ping pong function between 0.0 and 1.0
          t = t * 2.0;
          if (t >= 1.0) {
            t = 2.0 - t;
          }

          float alpha = step(vUv.x, time);

          gl_FragColor = vec4(mix(color1, color2, t), alpha * opacity);
        }
      `,
      depthWrite: false,
      depthFunc: THREE.GreaterDepth,
      transparent: true,
    })
  }, [color1, color2, backColorsOpacity])

  const materialFront = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color1: {
          value: color1,
        },
        color2: {
          value: color2,
        },
        opacity: {
          value: 1.0,
        },
        time: {
          value: 0.0,
        },
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
        uniform float opacity;
        uniform float time;

        varying vec2 vUv;

        void main() {
          float t = mod(vUv.x - time, 1.0);

          // Ping pong function between 0.0 and 1.0
          t = t * 2.0;
          if (t >= 1.0) {
            t = 2.0 - t;
          }

          float alpha = step(vUv.x, time);

          gl_FragColor = vec4(mix(color1, color2, t), alpha * opacity);
        }
      `,
      transparent: true,
    })
  }, [color1, color2])

  const [time, setTime] = useState(0.0)

  // Reset the time state each time the path is changed.
  useEffect(() => {
    setTime(0)
  }, [path])

  // Update the time state at each gl render iteration.
  useRender(threeState => {
    setTime(time => time + 0.01 * animSpeed)
  })

  // Updates the material's time parameter each time the time state changes.
  useEffect(() => {
    materialBack.uniforms.time.value = time
    materialFront.uniforms.time.value = time
  })

  return (
    <>
      <mesh geometry={geometry} material={materialBack} />
      <mesh geometry={geometry} material={materialFront} />
    </>
  )
}

const measurementNames = [
  'Chest Circumference',
  'Right Upper Arm Circumference',
  'Narrow Waist Circumference',
  'High Hip Circumference',
  'Left Thigh Circumference',
  'Left Ankle Circumference',
]

const measurements = measurementNames.map(name => {
  const points = measurementRawData.measurement[name].line_points.map(
    ([x, y, z]) => new THREE.Vector3(x, y, z),
  )

  const closed = measurementRawData.measurement[name].closed

  const path = new THREE.CatmullRomCurve3(points, closed)

  const nbPoints = points.length

  return { path, nbPoints, closed }
})

export default function ModelViewer() {
  const [skinType, setSkinType] = useState(skinTypeMap.IRON_SKIN)
  const [isWireframe, setIsWireframe] = useState(false)
  const [wireframeColor, setWireframeColor] = useState('#ffffff')
  const [isSkin, setIsSkin] = useState(true)
  const [isEnvMap, setIsEnvMap] = useState(true)
  const [[groundColor, skyColor], setBackground] = useState([
    0xcccccc,
    0xffffff,
  ])
  const [, setDefaultStyle] = useReducer((_, skinType) => {
    setSkinType(skinType)
    switch (skinType) {
      case skinTypeMap.IRON_SKIN: {
        setIsWireframe(false)
        setIsEnvMap(true)
        setIsSkin(true)
        setBackground([0xcccccc, 0xffffff])
        break
      }
      case skinTypeMap.HUMAN_BODY_SKIN_IN_MESH: {
        setIsWireframe(true)
        setWireframeColor('#000000')
        setIsSkin(true)
        setBackground([0xa1f4ff, 0x89999c])
        break
      }
      case skinTypeMap.BLUE_WITH_PURPLE_EFFECT: {
        setIsWireframe(false)
        setIsSkin(true)
        setBackground([0x4a008b, 0x0])
        break
      }
      case skinTypeMap.BLUE_WITH_LIGHT_EFFECT_IN_MESH: {
        setIsWireframe(true)
        setWireframeColor('#05CFE8')
        setIsSkin(true)
        setIsEnvMap(true)
        setBackground([0x004c64, 0x0])
        break
      }
      case skinTypeMap.BLUE_WITH_LIGHT_EFFECT: {
        setIsWireframe(false)
        setWireframeColor('#ffffff')
        setIsSkin(true)
        setIsEnvMap(false)
        setBackground([0x0, 0x101010])
        break
      }
      case skinTypeMap.BLACK_SKINY: {
        setIsWireframe(false)
        setIsSkin(true)
        setIsEnvMap(true)
        setBackground([0xffffff, 0x171717])
        break
      }
      case skinTypeMap.ORIGIN: {
        setIsWireframe(true)
        setWireframeColor('#000000')
        setIsSkin(true)
        setIsEnvMap(false)
        setBackground([0xffffff, 0xdddddd])
        break
      }
      default: {
        break
      }
    }
  }, skinType)
  // The Angle between the horizon and the vertical limit of the camera toward up and down.
  const upDownRad = (90.0 / 180.0) * Math.PI

  // const [textureFilename, setTextureFilename] = useState('white-fabric.jpg')
  const [textureFilename, setTextureFilename] = useState('the-hive.jpg')
  const [measurementIndex, setMeasurementIndex] = useState(-1)

  const onMeasurementButtonPressed = index => {
    setMeasurementIndex(index === measurementIndex ? -1 : index)
  }
  const measurement =
    measurementIndex >= 0 ? measurements[measurementIndex] : null
  return (
    <>
      <Canvas
        id='camera-body'
        style={{
          background: '#A2CCB6',
          width: window.outerWidth * 0.95,
          height: '95vh',
          margin: 'auto',
        }}
        camera={{ fov: 80, position: [80, 0, 130] }}
      >
        <Controls
          enableDamping
          enablePan={false}
          enableZoom
          minDistance={20}
          maxDistance={150}
          dampingFactor={0.1}
          rotateSpeed={1}
          minPolarAngle={Math.PI / 2.0 - upDownRad}
          maxPolarAngle={Math.PI / 2.0 + upDownRad}
        />
        <BackgroundSphere
          colorGround={new THREE.Color(groundColor).getHex()}
          colorSky={new THREE.Color(skyColor).getHex()}
          horizonFactor={4.0}
        />

        <group
          position={new THREE.Vector3(0, -58, 0)}
          scale={new THREE.Vector3(0.05, 0.05, 0.05)}
        >
          <ambientLight intensity={0.5} />
          <spotLight intensity={0.5} position={[300, 300, 400]} />
          <spotLight intensity={0.5} position={[-300, 300, -400]} />
          <Plane
            color={new THREE.Color(groundColor).getHex()}
            position={[0, 0, 0]}
            size={[300, 500]}
          />
          <LoadedObjModel
            isEnvMap={isEnvMap}
            isSkin={isSkin}
            isWireframe={isWireframe}
            wireframeColor={parseInt(wireframeColor.replace(/#/, '0x', ''))}
            skinType={skinType}
            ObjFilename='guy.obj'
            textureFilename={textureFilename}
          />
          {measurement && (
            <AnimatedLines
              path={measurement.path}
              nbPoints={measurement.nbPoints}
              radius={4.0}
              closed={measurement.closed}
              color1={new THREE.Color(0x5def3a)}
              color2={new THREE.Color(0x00e9ff)}
              backColorsOpacity={0.3}
              animSpeed={1.4}
            />
          )}
        </group>
      </Canvas>
      <button onClick={() => onMeasurementButtonPressed(0)}>Poitrine</button>
      <button onClick={() => onMeasurementButtonPressed(1)}>Biceps</button>
      <button onClick={() => onMeasurementButtonPressed(2)}>
        Tour de taille
      </button>
      <button onClick={() => onMeasurementButtonPressed(3)}>Hanche</button>
      <button onClick={() => onMeasurementButtonPressed(4)}>Cuisse</button>
      <button onClick={() => onMeasurementButtonPressed(5)}>Cheville</button>

      <button onClick={() => setTextureFilename('white-fabric.jpg')}>
        Texture 1
      </button>
      <button onClick={() => setTextureFilename('fabric-red-white.jpg')}>
        Texture 2
      </button>
      <button onClick={() => setIsWireframe(!isWireframe)}>wireframe</button>
      <button onClick={() => setIsSkin(!isSkin)}>isSkin</button>
      <button onClick={() => setIsEnvMap(!isEnvMap)}>isEnvMap</button>
      <select
        defaultValue={skinType}
        onChange={({ target: { value: typeName } }) => {
          setDefaultStyle(typeName)
        }}
      >
        {Object.values(skinTypeMap).map(typeName => {
          return (
            <option key={typeName} value={typeName}>
              {typeName}
            </option>
          )
        })}
      </select>
      <SketchPicker
        color={wireframeColor}
        onChangeComplete={e => {
          setWireframeColor(e.hex)
        }}
      />
    </>
  )
}
