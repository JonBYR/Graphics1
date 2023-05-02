precision highp float;
precision highp int;
uniform sampler2D text;
uniform float time;
varying vec3 p; //varying variables most be the same type and same name as ones in vertex shaders
varying vec2 uvPass;
float random(vec2 UV) //generation of random noise
{
    vec2 k = vec2(23.1406926327792690,2.6651441426902251); //psuedo random due to the generation of vector k, so there is some determinism
    return fract(sin(dot(k, vec2(12.9898, 78.233))) * 43758.5453); //should return value between 0 and 1 as it takes the fraction value
} //return statement taken from https://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl

vec2 hash( vec2 u)
{
   int value = int(random(u)*4.0);
   
   if(value == 0)
   { 
       return vec2(0.0, 0.0); //essentially chooses a random posititon vector to return that would be a corner of the square
   }
   if(value == 1)
   { 
       return vec2(1.0, 0.0);
   }
   if(value == 2)
   { 
       return vec2(0.0, 1.0);
   }
   if(value == 3)
   { 
       return vec2(1.0, 1.0);
   }
   

}

float fade(float t)
{
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); //works like smoothstep
}
   

float gradientNoise(vec2 u)
{
    vec2 f = smoothstep(0.0, (random(u) * 2.0), fract(u)); //an interpolation between random values using smoothstep
    vec2 i = floor(f); //make the lowest value for the vector

 

    vec2 f00 = hash(i);
    vec2 f10 = hash(i + vec2(1.0, 0.0));
    vec2 f01 = hash(i + vec2(0.0, 1.0));
    vec2 f11 = hash(i + vec2(1.0, 1.0)); //finds each corner
    
    float h = u.x - i.x;
    float fadeH = fade(h);
    float v = u.y - i.y;
    float fadeV = fade(v);
    
    float top = (1.0-fadeH)*dot(f00, (u - i)) + fadeH*dot(f10, (u-(i+vec2(1.0, 0.0)))); //works out difference between the top corners
    float bottom = (1.0-fadeH)*dot(f01, (u - (i+vec2(0.0, 1.0)))) + fadeH*dot(f11, (u-(i+vec2(1.0, 1.0)))); //works out difference between the bottom corners
    
   
    return (1.0 - fadeV)*top + fadeV*bottom; //works out the vertical distance via interpolation
   
} //returns a different position for each fragment

//Noise generation functions taken from Mark Doughty-Week 5 "Shader Code Snippets"
void main() { //produces a procedural texture
    vec2 uv = uvPass; //make a local vec2 variable that stores the 2D position vector passed from vertex shader 
    vec3 posi = p; //make a local vec3 varible that stores the 3D position vector passed from vertex shader
    //float movement = 0.05 * sin(uv.y * 1.0 + time * 0.2) + 0.13 * sin(uv.y * 1.0 + time * 0.3);
    float n = gradientNoise(uv * 2.0); //generate more noise each time
    n += gradientNoise((uv * 4.0) * 0.5); 
    n += gradientNoise((uv * 8.0) * 0.25); 
    n += gradientNoise((uv * 16.0) * 0.125); 
    n /= 0.1; //scaling each time by an octave to increase the frequency and halving amplitude of the noise to get a more defined noise
    float movement = (0.001 * sin(uv.y * (time * n) * 0.1)+posi.x * cos(uv.y * (time * n) * 0.1)-posi.y);
    //uv.y helps to shift uv.x in the vertical axis. This happens over time as the value of sin changes as time changes as well as cos.
    uv.x += movement; //uv in the x axis is shifted by movement caused by sin wave
    uv.x *= 10.0; //changes space from 0, 1 to 0, 10
    uv.x = fract(uv.x); //creates a fraction that splits the uv.x axis into ten parts
    float radius = 0.3;
    float circle = step(radius, length(posi)); //linear interpolation that establishes a circle with radius 0.3 along the length of position vector. Once length passes 0.3 the cicrle stops.
    float t = smoothstep(radius, length(posi), uv.x); //performes interpolation based on the value of uv.x
    vec4 col1 = vec4(1.0, 0.0, 0.0, 1.0) * cos(time); //generates one colour with a cos wave overtime. Since cos will eventually go to 0 it means one colour will not be generated
    vec4 col2 = vec4(0.0, 0.0, 1.0, 1.0); //create a second colour
    vec4 colour = mix(col1, col2, t); //blends colour depending on value of t from the smoothstep
    gl_FragColor = colour / length(posi); //dividing by length of position vector causes a vignette effect
//youtube tutorial used for movement and colour gradient https://www.youtube.com/watch?v=tSRPdVBhLdY
}