import * as THREE from 'three'
import { MATHS } from '../helpers/maths.js'

export class OrbitControl
{
    constructor(object3D, axis, lookAtPosition)
    {
        this.core = new OrbitControlCore(object3D, axis, lookAtPosition)
    }

    pan(speed)
    {
        if (!this.core.isOrbit)
            this.core.orbit(speed)
    }

    start(speed)
    {
        if (!this.core.isOrbit)
        {
            this.core.isOrbit = true
            this.core.auto(speed)
        }
    }

    stop()
    {
        this.core.isOrbit = false
    }
}

class OrbitControlCore
{
    constructor(object3D, axis, lookAtPosition)
    {
        this.object3D = object3D
        this.axis = axis
        this.lookAtPosition = lookAtPosition
        this.isOrbit = false
    }

    auto(speed)
    {
        if (this.isOrbit)
        {
            this.orbit(1)
            setTimeout(()=>this.auto(speed), 1000/speed)
        }
    }

    orbit(speed)
    {
        let vLookAt2Src = MATHS.subtractVectors(this.object3D.position, this.lookAtPosition)
        let vLookAt2Dest = new THREE.Vector3(vLookAt2Src.x, vLookAt2Src.y, vLookAt2Src.z)
        vLookAt2Dest.applyAxisAngle(this.axis, MATHS.toRadians(speed))
        let offset = MATHS.subtractVectors(vLookAt2Dest, vLookAt2Src)
        let destination = MATHS.addVectors(this.object3D.position, offset)
        this.object3D.position.set(destination.x, destination.y, destination.z)
        this.object3D.lookAt(this.lookAtPosition)
    }
}