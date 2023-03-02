import * as THREE from 'three'
import { MATHS } from '../helpers/maths.js'

export class OrbitControl
{
    constructor(object3D, lookAtPosition, shouldMoveFunction) { this.core = new OrbitControlCore(object3D, lookAtPosition, shouldMoveFunction) }

    pan(axis, speed)
    {
        if (!this.core.isOrbit)
            this.core.orbit(axis, speed)
    }

    start(axis, speed)
    {
        if (!this.core.isOrbit)
        {
            this.core.isOrbit = true
            this.core.auto(axis, speed)
        }
    }

    stop() { this.core.isOrbit = false }
}

class OrbitControlCore
{
    constructor(object3D, lookAtPosition, shouldMoveFunction)
    {
        this.object3D = object3D
        this.lookAtPosition = lookAtPosition
        this.shouldMoveFunction = (shouldMoveFunction == undefined) ? (v)=>{return true} : shouldMoveFunction
        this.isOrbit = false
    }

    auto(axis, speed)
    {
        if (this.isOrbit)
        {
            this.orbit(axis, 1)
            setTimeout(()=>this.auto(axis, speed), 1000/speed)
        }
    }

    orbit(axis, speed)
    {
        let vLookAt2Src = MATHS.subtractVectors(this.object3D.position, this.lookAtPosition)
        let vLookAt2Dest = new THREE.Vector3(vLookAt2Src.x, vLookAt2Src.y, vLookAt2Src.z)
        vLookAt2Dest.applyAxisAngle(axis, MATHS.toRadians(speed))
        let offset = MATHS.subtractVectors(vLookAt2Dest, vLookAt2Src)
        let destination = MATHS.addVectors(this.object3D.position, offset)
        let [shouldMove, newDestination] = this.shouldMoveFunction(destination, this.object3D.position)
        if (shouldMove)
        {
            this.object3D.position.set(newDestination.x, newDestination.y, newDestination.z)
            this.object3D.lookAt(this.lookAtPosition)
        }
    }
}