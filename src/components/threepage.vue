<template>
  <div class="three">
        <div id="threewebgl"></div>
  </div>
   
</template>

<script>
import * as THREE from "three"

export default {
  name: 'threepage',
  data(){
    return {
        camera:null,
        scene:null,
        renderer:null,
        mesh:null
    }
  },
  mounted(){
    this.init();
    this.add();
    this.animate();
  },
  methods:{
    init(){
        var dom = document.getElementById('threewebgl');
        const width = dom.clientWidth;
        const height = dom.clientHeight;
        const draw = dom;
        this.camera = new THREE.PerspectiveCamera(130,width/height,0.01,10);
        this.camera.position.z = 1;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setSize(width,height);



        //给场景添加天空盒子纹理
        var cubeTextureLoader = new THREE.CubeTextureLoader();
        cubeTextureLoader.setPath( '/static/texture/' );
        //六张图片分别是朝前的（posz）、朝后的（negz）、朝上的（posy）、朝下的（negy）、朝右的（posx）和朝左的（negx）。
        var cubeTexture = cubeTextureLoader.load( [
            'px.jpg', 'nx.jpg',
            'py.jpg', 'ny.jpg',
            'pz.jpg', 'nz.jpg'
        ] );
        this.scene.background = cubeTexture;


        var amlight = new THREE.AmbientLight(0xAAFFCC);
        amlight.castShadow = true;
        this.scene.add(amlight);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        // 如果使用animate方法时，将此函数删除
        //controls.addEventListener( 'change', render );
        // 使动画循环使用时阻尼或自转 意思是否有惯性
        this.controls.enableDamping = true;
        //动态阻尼系数 就是鼠标拖拽旋转灵敏度
        //controls.dampingFactor = 0.25;
        //是否可以缩放
        this.controls.enableZoom = true;
        //是否自动旋转
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 3;
        //设置相机距离原点的最远距离
        this.controls.minDistance = 1;
        //设置相机距离原点的最远距离
        this.controls.maxDistance = 500;
        //是否开启右键拖拽
        this.controls.enablePan = true;

        draw.appendChild(this.renderer.domElement);
    },
    add(){
        // let geometry = new THREE.BoxGeometry(0.5,0.5,0.5);
        // let material = new THREE.MeshNormalMaterial();
        // this.mesh = new THREE.Mesh(geometry,material);
        // this.scene.add(this.mesh);

        var vm = this;
        // var objLoader = new THREE.OBJLoader();
        // objLoader.load('/static/source/shinei.obj', function (object) {
        //     //将模型缩放并添加到场景当中
        //     console.log(object)
        //     object.scale.set(0.2,0.2,0.2);
        //     vm.scene.add(object);
        // })

        var gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load('/static/source/scene1.gltf', function (gltf) {
            //将模型缩放并添加到场景当中
            gltf.scene.traverse( function ( child ) {
                // if ( child.isMesh ) {
                //     child.material.envMap = envMap;
                // }
            } );
            vm.scene.add( gltf.scene );
            }
        )

    },
    animate(){
        // this.mesh.rotation.x += 0.03;
        // this.mesh.rotation.y += 0.03;
        this.renderer.render(this.scene,this.camera);
        requestAnimationFrame(this.animate);
    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
.three{
  width:100%;
  height:100%;
  #threewebgl{
        width:100%;
        height:100%;
  }
}
</style>