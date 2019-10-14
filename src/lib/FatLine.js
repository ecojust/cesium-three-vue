import * as THREE from 'three'
// import * as THREE from '../../three/build/three.module.js';

/**
 * Author:桔子桑
 * Time:2019.10.12
 */

const vs =`
    varying vec3 iPosition;

    void main(){
        iPosition = vec3(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x,0.2,position.z,1.0);
    }
`;
const fs = `
    uniform float time;
    varying vec3 iPosition;
    uniform float alpha;

    void main( void ) {
        if(iPosition.y > time){
            discard;
        }else{
            gl_FragColor = vec4(0.813,0.124,0.334,alpha); 
        }

    }
`;

function FatLine(vertices,width,scene){
    this.width = width;
    this.vertices = vertices;
    this.start = 0;
    this.scene = scene;
    this.linearr = [];
    this.lines = [];
}
function createMaterial(vs, fs, start) {
    var attributes = {};
    var uniforms = {
        time: {type: 'f', value: start},
        size:{type:'f',value:25.0},
    };
    var meshMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        defaultAttributeValues : attributes,
        vertexShader: vs,
        fragmentShader: fs,
        transparent: true
    });
    return meshMaterial;
}

FatLine.prototype.draw = function() {
    var size = this.vertices.length;
    var length = Math.floor(this.width/2);
    var vm = this;
    for(var j =0;j<length;j++){
        var lineadd = [];
        var linereduce = [];
        for ( var i = 0; i <size; i ++ ) {
            var Vector3 = this.vertices[i],
            x = Vector3.x,
            y = Vector3.y,
            z = Vector3.z;
            var zadd = z+j*0.002;
            var zreduce = z-j*0.002;
            lineadd.push( new THREE.Vector3(x,y,zadd ));
            linereduce.push( new THREE.Vector3(x,y,zreduce ));
        }
        this.linearr.push(lineadd);
        this.linearr.push(linereduce);
    };
    this.linearr.push(vm.vertices);
    var pointsize = this.vertices.length * 15;
    for(var k = 0,size=this.linearr.length;k<size;k++){
        var vertices = this.linearr[k];
        var alpha = (Math.floor(size/2) - Math.floor(k/2))/Math.floor(size/2);
        var curve = new THREE.CatmullRomCurve3(vertices);
        var geometry = new THREE.Geometry();
        geometry.vertices = curve.getPoints(pointsize);
        var material = createMaterial(vs,fs,vm.start);
        material.uniforms.alpha = {type:'f',value:alpha};
        var line = new THREE.Line(geometry, material);
        this.lines.push(line);
        this.scene.add( line );
    }
}

FatLine.prototype.animate = function(speed,callback){
    var time = this.lines[0].material.uniforms.time.value;
    for(var i = 0,length=this.lines.length;i<length;i++){
        var line = this.lines[i];
        line.material.uniforms.time.value +=speed||0.3;
    };
    if(callback){
        callback(time);
    }
}

export default FatLine;