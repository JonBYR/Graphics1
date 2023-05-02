precision highp float;
precision highp int;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;
attribute vec2 uv;
varying vec3 p;
attribute vec3 position;
varying vec2 uvPass;

void main() 
{
    p = position; //varying and attribute variables most be same type
    uvPass = uv; //pass the positions of the 2D and 3D vectors to the fragment shader
    float twistFactor = 0.3;
    p.x = cos(twistFactor * length(position))*position.x - sin(twistFactor * length(position) * time)*position.y;
    p.y = sin(twistFactor * length(position))*position.x - cos(twistFactor * length(position) * time)*position.y; //moves the vertex positions in the x and y direction to produce ripple effect
    //code taken from the week 2 workshop
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); //generates all verticies 
}