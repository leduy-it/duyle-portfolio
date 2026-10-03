'use client'
import {createContext,useContext} from 'react'
export const MotionSeedContext=createContext(0)
export const useMotionSeed=()=>useContext(MotionSeedContext)
export const motionPattern=(seed:number)=>['assemble','symmetric','depth'][Math.abs(seed)%3]
export const settledPose={opacity:1,x:0,y:0,rotate:0,scale:1}
/** Pick at interaction/effect boundaries; never call random during server/client render. */
export function nextMotionSeed(previous:number,entropy?:number) {
  const random=entropy ?? (typeof crypto!=='undefined' && 'getRandomValues' in crypto ? crypto.getRandomValues(new Uint32Array(1))[0]/4294967296 : Math.random())
  const mode=(Math.abs(previous)%3+1+Math.floor(random*2))%3
  return Math.floor(Math.max(0,Math.min(.999999,random))*0xffffff)*3+mode
}
export function entrancePose(seed:number,index=0) {
  const mode=Math.abs(seed)%3
  const phase=((Math.imul(seed+19,1103515245)+Math.imul(index+1,12345))>>>0)/4294967296
  if(mode===1) return {opacity:0,x:index%2 ? 32 : -32,y:0,rotate:0,scale:1}
  if(mode===2) return {opacity:0,x:0,y:12,rotate:0,scale:.965}
  const angle=(phase+index*.61803398875)*Math.PI*2
  return {opacity:0,x:Math.cos(angle)*36,y:Math.sin(angle)*25,rotate:(phase-.5)*2,scale:.985}
}
