export const MATHS =
{
    addVectors : function(v1, v2)
    {
        return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z }
    },

    subtractVectors : function(v1, v2)
    {
        return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z }
    },

    toRadians : function(degrees)
    {
        return (degrees * 22) / (7 * 180)
    },

    length: function(v)
    {
        return Math.sqrt((v.x * v.x)+(v.y * v.y)+(v.z * v.z))
    },

    cross : function(v1, v2)
    {
        return MATHS.normalize({ x: v1.y * v2.z - v1.z * v2.y, y: v1.z * v2.x - v1.x * v2.z, z: v1.x * v2.y - v1.y * v2.x})
    },

    normalize : function(v)
    {
        let len = MATHS.length(v)
        return { x: v.x/len, y: v.y/len, z: v.z/len}
    },

    toDegrees : function(radians)
    {
        return (radians * 7 * 180)/22
    }
}