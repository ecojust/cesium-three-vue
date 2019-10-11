//vs
const vs =`
    varying vec3 iPosition;

    void main(){
        iPosition = vec3(position);
        gl_PointSize = 3.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
`;
const fs = `
    uniform float time;
    varying vec3 iPosition;

    void main( void ) {
        vec4 color;
        if(iPosition.x > time){
            discard;
        }else {
            color = vec4(0.813,0.124,0.334,1.0);
        }
        gl_FragColor = color;
    }
`

export {vs,fs}