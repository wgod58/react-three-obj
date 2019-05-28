import * as THREE from 'three'
import React, { Component } from 'react'
// import ReactDOM from 'react-dom'
import { Canvas } from 'react-three-fiber'

export default class Mensuration extends Component {
  render() {
    return (
      <Canvas>
        <mesh onClick={e => console.log('click')} 
              onPointerOver={e => console.log('hover')} 
              onPointerOut={e => console.log('unhover')}>
          <octahedronGeometry attach="geometry" />
          <meshBasicMaterial attach="material" color="peachpuff" opacity={0.5} transparent />
        </mesh>
      </Canvas>
    )
  }
}
