import * as THREE from 'three'

const typeMap = {
  IRON_SKIN: 'Iron skin',
  HUMAN_BODY_SKIN_IN_MESH: 'Human body skin in mesh',
  BLUE_WITH_LIGHT_EFFECT_IN_MESH: 'Blue with light effect in mesh',
  BLUE_WITH_LIGHT_EFFECT: 'Blue with light effect',
  BLUE_WITH_PURPLE_EFFECT: 'Blue with purple light effect',
  BLACK_SKINY: 'Black shiny',
  ORIGIN: 'Original',
}

const r = './assets/thehive.'
const urls = [
  r + 'pos.x.jpg',
  r + 'neg.x.jpg',
  r + 'pos.z.jpg',
  r + 'neg.z.jpg',
  r + 'pos.y.jpg',
  r + 'neg.y.jpg',
]

const textureCube = new THREE.CubeTextureLoader().load(urls)
textureCube.format = THREE.RGBFormat

var rR = 'textures/cube/Park3Med/'
var urlsR = [
  rR + 'px.jpg',
  rR + 'nx.jpg',
  rR + 'py.jpg',
  rR + 'ny.jpg',
  rR + 'pz.jpg',
  rR + 'nz.jpg',
]
var textureCubeRefraction = new THREE.CubeTextureLoader().load(urlsR)
textureCubeRefraction.mapping = THREE.CubeRefractionMapping

// const mirrorCubeCamera = new THREE.CubeCamera(0.1, 5000, 512)
const spotLight = new THREE.SpotLight(0xffffff)
spotLight.position.set(0, 3000, 0)
spotLight.distance = 1000
spotLight.castShadow = true
spotLight.penumbra = 0.5
spotLight.decay = 1
spotLight.intensity = 1

const styleMap = {
  [typeMap.IRON_SKIN]: (meshChild, { map }) => {
    meshChild.material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0x0,
      metalness: 1,
      roughness: 0,
      reflectivity: 1,
      envMapIntensity: 1,
    })
  },
  [typeMap.HUMAN_BODY_SKIN_IN_MESH]: (meshChild, { map }) => {
    meshChild.material = new THREE.MeshPhysicalMaterial({
      color: 0xffe0bd,
      emissive: 0x0,
      metalness: 0,
      roughness: 1,
    })
  },
  [typeMap.BLUE_WITH_LIGHT_EFFECT_IN_MESH]: (meshChild, { map }) => {
    meshChild.material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x0,
      specular: 0xffffff,
      shininess: 100,
      // flatShading: THREE.FlatShading,
    })
  },
  [typeMap.BLUE_WITH_LIGHT_EFFECT]: (meshChild, { map }) => {
    meshChild.material = new THREE.MeshPhongMaterial({
      color: 0x56ff,
      emissive: 0x0,
      specular: 0xffffff,
      shininess: 0,
      transparent: true,
      opacity: 0.5,
    })
    // meshChild.add(spotLight)
  },
  [typeMap.BLUE_WITH_PURPLE_EFFECT]: (meshChild, { map }) => {
    meshChild.material = new THREE.MeshNormalMaterial({})
  },
  [typeMap.BLACK_SKINY]: (meshChild, { map }) => {
    meshChild.material = new THREE.MeshPhongMaterial({
      color: 0x161616,
      emissive: 0x0,
      specular: 0xffffff,
      shininess: 100,
    })
    meshChild.add(spotLight)
  },
  [typeMap.ORIGIN]: (meshChild, { map }) => {
    meshChild.material = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      emissive: 0x0,
      roughness: 0.5,
    })
  },
}

const reset = group => {
  group.traverse(child => {
    if (child.isMesh) {
      child.material = null
      child.children = []
    }
  })
}

export {
  styleMap as default,
  typeMap,
  reset,
  textureCube,
  textureCubeRefraction,
}
