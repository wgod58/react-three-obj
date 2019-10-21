import * as THREE from 'three'

// const r = './assets/thehive.'
const r = './assets/'
const urls = [
  // 'pos.x.jpg',
  // 'neg.x.jpg',
  // 'pos.z.jpg',
  // 'neg.z.jpg',
  // 'pos.y.jpg',
  // 'neg.y.jpg',
  'sky.x+.jpg',
  'sky.x-.jpg',
  'sky.y+.jpg',
  'sky.y-.jpg',
  'sky.z+.jpg',
  'sky.z-.jpg',
]
const textureGeneral = new THREE.TextureLoader().setPath(r).load(urls[0])
const textureCube = new THREE.CubeTextureLoader().setPath(r).load(urls)
const textureCubeRefraction = new THREE.CubeTextureLoader()
  .setPath(r)
  .load(urls)
textureCubeRefraction.mapping = THREE.CubeRefractionMapping

const scene = new THREE.Scene()
scene.background = textureCube

export { scene as default, textureGeneral, textureCube, textureCubeRefraction }
