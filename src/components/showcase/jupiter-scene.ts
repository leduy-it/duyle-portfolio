import * as THREE from 'three'
import {SceneResources,type CoverScene} from './scene-resources'

/** Cassini cylindrical surface map; illumination and motion are artistic presentation. */
export function jupiterScene(resources:SceneResources):CoverScene {
  const root=new THREE.Group()
  root.rotation.z=.07
  let resolve:()=>void=()=>{},reject:(reason:unknown)=>void=()=>{}
  const loaded=new Promise<void>((done,failed)=>{resolve=done;reject=failed})
  const map=resources.texture(new THREE.TextureLoader().load('/textures/jupiter-cassini.jpg',()=>resolve(),undefined,error=>reject(error)))
  map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8
  const planet=resources.mesh(new THREE.SphereGeometry(1.3,96,64),new THREE.MeshStandardMaterial({map,roughness:1,metalness:0}),root)
  planet.scale.y=.935
  const atmosphere=resources.mesh(new THREE.SphereGeometry(1.315,80,56),new THREE.ShaderMaterial({
    uniforms:{tint:{value:new THREE.Color('#d6ba91')}},
    vertexShader:'varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
    fragmentShader:'varying vec3 n; varying vec3 v; uniform vec3 tint; void main(){float rim=pow(1.-max(dot(normalize(n),normalize(v)),0.),4.5);gl_FragColor=vec4(tint,rim*.23);}',
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  }),root)
  atmosphere.scale.y=.935;atmosphere.renderOrder=2
  const moon=resources.mesh(new THREE.SphereGeometry(.055,24,16),new THREE.MeshStandardMaterial({color:'#bbb6a5',roughness:1}),root)
  moon.position.set(-1.24,.64,.35)
  return {root,radius:1.46,loaded,update:seconds=>{planet.rotation.y=-.75+seconds*.025;root.rotation.y=Math.sin(seconds*.025)*.018}}
}
