import * as THREE from 'three'
import { SceneResources, type CoverScene } from './scene-resources'

function flangeShape() {
  const shape = new THREE.Shape()
  shape.absarc(0,0,1.18,0,Math.PI*2,false)
  const axle = new THREE.Path();axle.absarc(0,0,.13,0,Math.PI*2,true);shape.holes.push(axle)
  for(let i=0;i<6;i++) {
    const angle=i/6*Math.PI*2
    const hole=new THREE.Path();hole.absarc(Math.cos(angle)*.72,Math.sin(angle)*.72,.31,0,Math.PI*2,true);shape.holes.push(hole)
  }
  return shape
}

function reel(resources: SceneResources, light: boolean) {
  const group = new THREE.Group()
  const metal = new THREE.MeshPhysicalMaterial({color:light ? '#9dacb0' : '#a2b3b7',metalness:.95,roughness:.26,clearcoat:.4,clearcoatRoughness:.22,envMapIntensity:1.2})
  const rim = new THREE.MeshStandardMaterial({color:'#698b88',metalness:.85,roughness:.3})
  const geometry=new THREE.ExtrudeGeometry(flangeShape(),{depth:.055,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.018,bevelThickness:.018,curveSegments:48})
  for(const z of [-.14,.11]){const face=resources.mesh(geometry,metal,group);face.position.z=z}
  for(const z of [-.16,.18]){const ring=resources.mesh(new THREE.TorusGeometry(1.17,.022,12,128),rim,group);ring.position.z=z}
  const hub=resources.mesh(new THREE.CylinderGeometry(.26,.26,.39,64),new THREE.MeshPhysicalMaterial({color:'#c39d6c',metalness:.9,roughness:.24,clearcoat:.4}),group);hub.rotation.x=Math.PI/2
  const axle=resources.mesh(new THREE.CylinderGeometry(.09,.09,.43,32),new THREE.MeshStandardMaterial({color:'#35474a',metalness:.9,roughness:.23}),group);axle.rotation.x=Math.PI/2
  // Film is wound between two flanges rather than spokes rotating in empty space.
  const winding=resources.mesh(new THREE.CylinderGeometry(.98,.98,.18,96,1,true),new THREE.MeshStandardMaterial({color:'#28272a',metalness:.25,roughness:.5,side:THREE.DoubleSide}),group);winding.rotation.x=Math.PI/2
  return group
}

function filmRibbon(resources: SceneResources, parent: THREE.Object3D, points: THREE.Vector3[]) {
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128
  const ctx=canvas.getContext('2d')!
  ctx.fillStyle='#342b26';ctx.fillRect(0,0,1024,128)
  for(let x=0;x<1024;x+=64){ctx.fillStyle=x%128 ? '#917053' : '#486b6b';ctx.fillRect(x+5,20,54,88);ctx.clearRect(x+12,4,14,10);ctx.clearRect(x+12,114,14,10)}
  const texture=resources.texture(new THREE.CanvasTexture(canvas));texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8
  const curve=new THREE.CatmullRomCurve3(points)
  const vertices=[],uvs=[],indices=[]
  for(let i=0;i<=96;i++){
    const point=curve.getPoint(i/96)
    for(const side of [-1,1]){vertices.push(point.x,point.y+side*.105,point.z);uvs.push(i/96,(side+1)/2)}
    if(i<96){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2)}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals()
  return resources.mesh(geometry,new THREE.MeshPhysicalMaterial({map:texture,side:THREE.DoubleSide,transparent:true,alphaTest:.3,roughness:.4,metalness:.15,clearcoat:.4}),parent)
}

export function cinemaScene(resources: SceneResources, variant: number, light: boolean): CoverScene {
  const root=new THREE.Group()
  const mode=variant%3
  const a=reel(resources,light);root.add(a)
  const reels=[a]
  let radius=1.85
  if(mode===1){
    a.scale.setScalar(.68);a.position.set(-.8,.35,0)
    const b=reel(resources,light);b.scale.setScalar(.68);b.position.set(.8,-.1,0);root.add(b);reels.push(b)
    filmRibbon(resources,root,[new THREE.Vector3(-.8,1.12,-.02),new THREE.Vector3(.15,.95,-.07),new THREE.Vector3(.82,.7,-.02),new THREE.Vector3(1.52,.15,.06),new THREE.Vector3(.72,-.8,.25),new THREE.Vector3(-.8,-.44,.12)])
    radius=1.95
  }else if(mode===2){
    a.scale.setScalar(.62);a.position.set(-.6,.85,0)
    const body=resources.mesh(new THREE.BoxGeometry(1.45,.85,.55,1,1,1),new THREE.MeshPhysicalMaterial({color:light ? '#394d50' : '#4b6265',metalness:.8,roughness:.3,clearcoat:.3}),root);body.position.set(-.18,-.36,-.1)
    for(let i=0;i<9;i++){const vent=resources.mesh(new THREE.BoxGeometry(.025,.38,.015),new THREE.MeshStandardMaterial({color:'#19272a',roughness:.5}),root);vent.position.set(-.76+i*.065,-.34,.19)}
    for(let i=0;i<3;i++){const lens=resources.mesh(new THREE.CylinderGeometry(.22-i*.018,.24-i*.018,.16,48),new THREE.MeshPhysicalMaterial({color:i===2 ? '#59a7b6' : '#98a4a2',metalness:.85,roughness:.18,clearcoat:.6}),root);lens.rotation.z=Math.PI/2;lens.position.set(.67+i*.13,-.31,0)}
    filmRibbon(resources,root,[new THREE.Vector3(-1.12,.7,.03),new THREE.Vector3(-1.26,.03,.03),new THREE.Vector3(-.72,-.2,.19)])
    const beam=resources.mesh(new THREE.ConeGeometry(.58,1.5,48,1,true),new THREE.MeshBasicMaterial({color:'#d8c699',transparent:true,opacity:light ? .045 : .075,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}),root);beam.rotation.z=Math.PI/2;beam.position.set(1.38,-.31,0)
    radius=2.1
  }else{
    a.position.set(-.18,.14,0)
    filmRibbon(resources,root,[new THREE.Vector3(.65,.95,-.01),new THREE.Vector3(1.32,.3,-.01),new THREE.Vector3(1.1,-.66,.2),new THREE.Vector3(.1,-1.28,.2),new THREE.Vector3(-1.27,-1.08,.04)])
  }
  root.rotation.set(.13,-.42,-.13)
  return {root,radius,update:seconds=>{
    reels.forEach((item,index)=>{item.rotation.z=seconds*.19+index*.4})
    // Only reels turn around their axles. Projector and ribbon stay in place.
    root.rotation.y=-.42+Math.sin(seconds*.13)*.06
  }}
}
