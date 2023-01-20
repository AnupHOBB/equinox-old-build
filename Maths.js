import * as THREE from 'three'

export const MATHS =
{
    addVectors : function(v1, v2)
    {
        return new THREE.Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z)
    },

    subtractVectors : function(v1, v2)
    {
        return new THREE.Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z)
    },

    toRadians : function(degrees)
    {
        return (degrees * 22) / (7 * 180)
    }
}