//vs
const vs =`
    varying vec3 iPosition;
    varying float pointsize;


    void main(){
        iPosition = vec3(position);
        pointsize = 1.0;
        gl_PointSize = pointsize;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
`;
const fs = `
    uniform float time;
    varying vec3 iPosition;
    varying float pointsize;

    void main( void ) {
        vec4 color;
        float radius = pointsize/2.0;
        if(iPosition.x > time){
            discard;
        }else {
            float d = distance(gl_PointCoord, vec2(0.5,0.5));
            if(d > 0.5){
                discard;
            }else{
                float alpha = smoothstep(  0.5,0.0, d);
                alpha = 1.0;//粒子只能在xy平面,透明度的渐变其实不能作用于三维空间
                color = vec4(0.813,0.124,0.334,alpha);  
            }
            
        }
        gl_FragColor = color;
    }
`

export {vs,fs}