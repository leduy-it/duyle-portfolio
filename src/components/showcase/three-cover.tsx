'use client'

import {useEffect,useRef,useState} from 'react'
import {useHomeMotionPreferences} from '@/components/home/home-motion'
import {useTheme} from 'next-themes'
import * as THREE from 'three'
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js'
import {SceneResources,coverPixelRatio,fitCameraDistance} from './scene-resources'
import {researchScene} from './research-scene'
import {cinemaScene} from './cinema-scene'
import {jupiterScene} from './jupiter-scene'
import {createStarfield} from './starfield'

export default function ThreeCover({cinema=false,variant=0,jupiter=false,paused=false}:{cinema?:boolean;variant?:number;jupiter?:boolean;paused?:boolean}) {
  const ref=useRef<HTMLCanvasElement>(null)
  const pausedRef=useRef(paused)
  useEffect(()=>{pausedRef.current=paused},[paused])
  const {prefersReducedMotion:reduced}=useHomeMotionPreferences()
  const {resolvedTheme}=useTheme()
  const [ready,setReady]=useState(false)
  useEffect(()=>{
    const canvas=ref.current
    if(!canvas) return
    let renderer:THREE.WebGLRenderer
    try {renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'})} catch {return}
    const resources=new SceneResources()
    const scene=new THREE.Scene()
    const light=resolvedTheme==='light' && !jupiter
    renderer.outputColorSpace=THREE.SRGBColorSpace
    renderer.toneMapping=THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure=jupiter ? 1.02 : .95
    renderer.setClearColor(0x000000,0)
    scene.add(new THREE.HemisphereLight('#dce9ff','#151c24',jupiter ? .08 : 1.2))
    const key=new THREE.DirectionalLight(jupiter ? '#fff4e0' : '#ffffff',jupiter ? 3.4 : 3)
    key.position.set(4,2.4,4.5);scene.add(key)
    const rim=new THREE.DirectionalLight('#a3c6ff',jupiter ? .08 : .85)
    rim.position.set(-3,1,-2);scene.add(rim)
    let environmentTarget:THREE.WebGLRenderTarget | undefined
    if(cinema) {
      const generator=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment()
      environmentTarget=generator.fromScene(room,.04)
      scene.environment=environmentTarget.texture
      room.dispose();generator.dispose()
    }
    const model=jupiter ? jupiterScene(resources) : cinema ? cinemaScene(resources,variant,light) : researchScene(resources,variant,light)
    scene.add(model.root);model.update(0)
    const stars=createStarfield(resources,jupiter ? 360 : 65)
    if(!light) scene.add(stars.points)
    const camera=new THREE.PerspectiveCamera(42,1,.1,60)
    let frame=0,disposed=false,intersecting=true,previous=0,seconds=0
    const draw=()=>{if(!disposed)renderer.render(scene,camera)}
    const resize=()=>{
      // Layout dimensions stay stable while the parent scales during an entrance.
      const width=canvas.clientWidth,height=canvas.clientHeight
      if(!width || !height || disposed) return
      const ratio=coverPixelRatio(window.devicePixelRatio || 1,width,height)
      renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);stars.setDpr(ratio)
      camera.aspect=width/height;camera.position.z=fitCameraDistance(model.radius,camera.aspect);camera.updateProjectionMatrix()
      canvas.dataset.renderDpr=ratio.toFixed(2);canvas.dataset.renderSize=`${canvas.width}x${canvas.height}`
      draw()
    }
    const animate=(now:number)=>{
      if(disposed) return
      if(intersecting && !document.hidden && !pausedRef.current) {
        seconds+=previous ? Math.min(.05,(now-previous)/1000) : 0
        model.update(seconds)
        stars.points.rotation.y=Math.sin(seconds*.04)*.025
        draw()
      }
      previous=now
      frame=requestAnimationFrame(animate)
    }
    const observer=new ResizeObserver(resize);observer.observe(canvas)
    const visibility=new IntersectionObserver(([entry])=>{
      intersecting=entry.isIntersecting;previous=0
      if(intersecting)draw()
    },{rootMargin:'80px'});visibility.observe(canvas)
    resize()
    const readyFrame=requestAnimationFrame(()=>{
      setReady(false)
      if(!model.loaded){draw();setReady(true)}
      if(!reduced)frame=requestAnimationFrame(animate)
    })
    if(model.loaded) model.loaded.then(()=>{
      if(!disposed){draw();setReady(true)}
    }).catch(()=>{if(!disposed)setReady(false)})
    const contextLost=(event:Event)=>{event.preventDefault();setReady(false)}
    canvas.addEventListener('webglcontextlost',contextLost)
    return ()=>{
      disposed=true;cancelAnimationFrame(readyFrame);cancelAnimationFrame(frame)
      observer.disconnect();visibility.disconnect();canvas.removeEventListener('webglcontextlost',contextLost)
      environmentTarget?.dispose();resources.dispose();renderer.dispose()
      if(!canvas.isConnected)renderer.forceContextLoss()
    }
  },[cinema,variant,jupiter,reduced,resolvedTheme])
  const name=jupiter ? 'jupiter' : cinema ? ['reel','paired-reels','projector'][variant%3] : ['wormhole','planet','woven-knot'][variant%3]
  return <div className="relative h-full w-full" data-cover-render>
    {!ready && <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
      {jupiter && <div className="h-[76%] aspect-square rounded-full" style={{backgroundImage:'radial-gradient(circle at 30% 25%,transparent 25%,#02050dbb 78%),url(/textures/jupiter-cassini.jpg)',backgroundSize:'cover'}} />}
    </div>}
    <canvas ref={ref} className="block h-full w-full transition-opacity duration-500" style={{opacity:ready ? 1 : 0}} data-cover-model={jupiter ? 'jupiter' : cinema ? 'cinema-reel' : 'research-knot'} data-cover-variant={name} data-model-ready={ready} data-model-motion={reduced ? 'static' : 'animated'} aria-hidden="true" />
  </div>
}
