import * as THREE from 'three'
import theHive from '../data/space1.jpg'
const typeMap = {
  IRON_SKIN: 'Iron skin',
  HUMAN_BODY_SKIN_IN: 'Human body skin',
  // BLUE_WITH_LIGHT_EFFECT_IN_MESH: 'Blue with light effect in mesh',
  BLUE_WITH_LIGHT_EFFECT: 'Blue with light effect',
  BLUE_WITH_PURPLE_EFFECT: 'Blue with purple light effect',
  BLACK_SKINY: 'Black shiny',
}

console.log(theHive)

var google =
  'https://images.freeimages.com/images/large-previews/af4/french-desert-6-1400167.jpg'
var beach =
  'https://easybookinggroup.files.wordpress.com/2014/10/flamenco-beach-culebra-1.jpg'
var r = './assets/thehive.'
var urls = [
  r + 'pos.x.jpg',
  r + 'neg.x.jpg',
  r + 'pos.z.jpg',
  r + 'neg.z.jpg',
  r + 'pos.y.jpg',
  r + 'neg.y.jpg',
]

var textureCube = new THREE.CubeTextureLoader().load(
  // Array(6).fill(`${r}/posx.jpg`),
  // Array(6).fill(theHive),
  urls,
)
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

const styleMap = {
  [typeMap.IRON_SKIN]: (meshChild, { map }) => {
    meshChild.material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0x0,
      metalness: 1,
      roughness: 0,
      reflectivity: 1,
      envMapIntensity: 1,
      envMap: textureCube,
    })
  },
  [typeMap.HUMAN_BODY_SKIN_IN]: (meshChild, { map }) => {
    meshChild.material = new THREE.MeshPhysicalMaterial({
      color: 0xffe0bd,
      emissive: 0x0,
      metalness: 0,
      roughness: 1,
    })
  },
  [typeMap.BLUE_WITH_LIGHT_EFFECT_IN_MESH]: (meshChild, { map }) => {
    meshChild.material = new THREE.MeshNormalMaterial({})
  },
  [typeMap.BLUE_WITH_LIGHT_EFFECT]: (meshChild, { map }) => {
    meshChild.material = new THREE.MeshPhongMaterial({
      color: 0x1117ff,
      emissive: 0x0,
      specular: 0xffffff,
      shininess: 50,
      transparent: true,
      opacity: 1,
      envMap: textureCubeRefraction,
    })
  },
  [typeMap.BLUE_WITH_PURPLE_EFFECT]: (meshChild, { map }) => {
    meshChild.material = new THREE.MeshNormalMaterial({})
  },
  [typeMap.BLACK_SKINY]: (meshChild, { map }) => {
    meshChild.material = new THREE.MeshPhongMaterial({
      color: 0x0,
      emissive: 0x0,
      specular: 0xffffff,
      shininess: 100,
      envMap: textureCube,
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

export { styleMap as default, typeMap, reset }
