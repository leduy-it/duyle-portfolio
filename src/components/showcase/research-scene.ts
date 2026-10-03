import * as THREE from 'three'
import { SceneResources, type CoverScene } from './scene-resources'

export function researchScene(resources: SceneResources, variant: number, light: boolean): CoverScene {
  const root = new THREE.Group()
  const accent = new THREE.Color(light ? '#087c78' : '#8aeee0')
  if (variant % 3 !== 1) {
    const geometry = new THREE.TorusKnotGeometry(1, .3, 160, 20, variant % 3 === 2 ? 3 : 2, variant % 3 === 2 ? 4 : 3)
    // Retain the original wireframe knot; a faint shaded body makes its depth legible.
    resources.mesh(geometry, new THREE.MeshPhysicalMaterial({color:accent,metalness:.25,roughness:.3,transparent:true,opacity:light ? .12 : .16,depthWrite:false,clearcoat:.4}),root)
    resources.mesh(geometry, new THREE.MeshBasicMaterial({color:accent,wireframe:true,transparent:true,opacity:light ? .8 : .78}),root)
    const position=geometry.getAttribute('position')
    let radius=0
    for(let i=0;i<position.count;i++) radius=Math.max(radius,Math.hypot(position.getX(i),position.getY(i),position.getZ(i)))
    root.rotation.set(.3, -.2, 0)
    return {root,radius:radius*1.03,update:seconds=>{root.rotation.x=.3+seconds*.045;root.rotation.y=-.2+seconds*.075}}
  }

  const world = new THREE.Group()
  world.rotation.z = .18
  root.add(world)
  const manager=new THREE.LoadingManager()
  let resolve:()=>void=()=>{},reject:(reason:unknown)=>void=()=>{}
  const loaded=new Promise<void>((done,failed)=>{resolve=done;reject=failed})
  manager.onLoad=()=>resolve();manager.onError=url=>reject(Error(url))
  const loader = new THREE.TextureLoader(manager)
  const day = resources.texture(loader.load('/textures/earth-day.jpg'))
  day.colorSpace = THREE.SRGBColorSpace
  day.anisotropy = 8
  const normal = resources.texture(loader.load('/textures/earth-normal.jpg'))
  const planet = resources.mesh(new THREE.SphereGeometry(1.05,64,48),new THREE.MeshPhysicalMaterial({map:day,normalMap:normal,normalScale:new THREE.Vector2(.5,.5),roughness:.65,metalness:.05,clearcoat:.15}),world)
  planet.rotation.y=2.4
  const atmosphere = resources.mesh(new THREE.SphereGeometry(1.09,64,48),new THREE.ShaderMaterial({
    uniforms:{tint:{value:new THREE.Color('#78c6ef')}},
    vertexShader:`varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,
    fragmentShader:`varying vec3 n; varying vec3 v; uniform vec3 tint; void main(){float rim=pow(1.-max(dot(normalize(n),normalize(v)),0.),3.);gl_FragColor=vec4(tint,rim*.55);}`,
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  }),world)
  atmosphere.renderOrder=2
  const orbit = new THREE.Group();orbit.rotation.set(.65,0,.1);root.add(orbit)
  const moon = resources.mesh(new THREE.SphereGeometry(.16,32,24),new THREE.MeshStandardMaterial({color:'#d1c8b6',roughness:.92}),orbit)
  const orbitLine = resources.mesh(new THREE.TorusGeometry(1.48,.003,6,160),new THREE.MeshBasicMaterial({color:accent,opacity:light ? .16 : .22,transparent:true}),orbit)
  orbitLine.rotation.x=Math.PI/2
  moon.position.set(1.48,0,0)
  return {root,radius:1.68,loaded,update:seconds=>{
    planet.rotation.y=2.4+seconds*.035
    const angle=seconds*.11+.9
    moon.position.set(Math.cos(angle)*1.48,0,Math.sin(angle)*1.48)
  }}
}
