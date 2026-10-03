import * as THREE from 'three'

/** Keep GPU ownership explicit so cover changes release every buffer and texture. */
export class SceneResources {
  geometries = new Set<THREE.BufferGeometry>()
  materials = new Set<THREE.Material>()
  textures = new Set<THREE.Texture>()
  mesh(geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D) {
    this.geometries.add(geometry); this.materials.add(material)
    const mesh = new THREE.Mesh(geometry, material)
    parent.add(mesh)
    return mesh
  }
  texture(texture: THREE.Texture) { this.textures.add(texture); return texture }
  dispose() {
    this.geometries.forEach(item => item.dispose())
    this.materials.forEach(item => item.dispose())
    this.textures.forEach(item => item.dispose())
  }
}

export interface CoverScene {
  root: THREE.Group
  radius: number
  update: (seconds: number) => void
  loaded?: Promise<unknown>
}

/** A sphere fits both horizontal and vertical frustums, including model rotation. */
export function fitCameraDistance(radius: number, aspect: number, fov = 42) {
  const vertical = THREE.MathUtils.degToRad(fov / 2)
  const horizontal = Math.atan(Math.tan(vertical) * aspect)
  return radius / Math.sin(Math.min(vertical, horizontal)) * 1.08
}

export function coverPixelRatio(deviceRatio: number, width: number, height: number) {
  return Math.min(deviceRatio, 3, Math.sqrt(2_500_000 / Math.max(1, width * height)))
}
