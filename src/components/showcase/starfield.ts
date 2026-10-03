import * as THREE from 'three'
import {SceneResources} from './scene-resources'
export function createStarfield(resources:SceneResources,count=280) {
  const positions=new Float32Array(count*3),colors=new Float32Array(count*3),sizes=new Float32Array(count)
  let seed=7319
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
  for(let i=0;i<count;i++) {
    positions.set([(random()-.5)*13,(random()-.5)*10,-2-random()*9],i*3)
    const warmth=random();const brightness=.28+Math.pow(random(),3)*.72
    colors.set([brightness*(warmth>.7 ? 1 : .84),brightness*.92,brightness*(warmth>.7 ? .8 : 1)],i*3)
    sizes[i]=random()>.94 ? 3.4 : 1+random()*1.4
  }
  const geometry=new THREE.BufferGeometry()
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));geometry.setAttribute('size',new THREE.BufferAttribute(sizes,1))
  const material=new THREE.ShaderMaterial({
    uniforms:{dpr:{value:1}},
    vertexShader:'attribute float size; varying vec3 starColor; uniform float dpr; void main(){starColor=color;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=size*dpr;}',
    fragmentShader:'varying vec3 starColor; void main(){float d=length(gl_PointCoord-.5);float core=1.-smoothstep(.08,.5,d);if(core<.01)discard;gl_FragColor=vec4(starColor,core);}',
    transparent:true,vertexColors:true,depthWrite:false,blending:THREE.AdditiveBlending,
  })
  resources.geometries.add(geometry);resources.materials.add(material)
  return {points:new THREE.Points(geometry,material),setDpr:(ratio:number)=>{material.uniforms.dpr.value=ratio}}
}
