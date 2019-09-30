<template>
  <div class="three">
        <div id="threewebgl"></div>
        <div class="mask" v-show="loading">
          <div>加载中 {{percent}} %</div>

        </div>
  </div>
   
</template>

<script>
import * as THREE from "three"
import {cloneGltf} from '../lib/modelUtils'

export default {
  name: 'threepage',
  data(){
    return {
        camera:null,
        scene:null,
        renderer:null,
        mesh:null,
        percent:0,
        loading:true
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
        this.camera.position.x = 0;
        this.camera.position.y = 3;
        this.camera.position.z = 3;


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
        // this.scene.background = cubeTexture;
        //平行光
        var dirLight = new THREE.DirectionalLight(0xAAFFCC);
        dirLight.position.set(0, 50,0);

        // this.scene.add(dirLight);
        
        //  环境光
        var amlight = new THREE.AmbientLight(0xAAFFCC,0.1);
        amlight.castShadow = true;
        this.scene.add(amlight);

        var pointlight = new THREE.PointLight( 0xff0000, 0.5, 100 );
        pointlight.position.set( 0, 5, 5 );
        this.scene.add( pointlight );


        //聚光灯
        var spotLight = new THREE.SpotLight( 0xffffff );
        spotLight.position.set( 0,6,0 );

        spotLight.castShadow = true;

        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;

        spotLight.shadow.camera.near = 500;
        spotLight.shadow.camera.far = 4000;
        spotLight.shadow.camera.fov = 30;

        this.scene.add( spotLight );

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
        this.controls.maxDistance = 1000;
        //是否开启右键拖拽
        this.controls.enablePan = true;

        draw.appendChild(this.renderer.domElement);
    },
    add(){
      var helper = new THREE.AxesHelper(50);
        this.scene.add(helper);
        var vm = this;


        // var loader = new THREE.ObjectLoader();
        // loader.load("/static/source/chair.json",function (obj) {
        //   obj.scale.set(0.2,0.2,0.2);
        //     vm.scene.add(obj);
        // });

        var gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load('/static/source/scene.gltf', function (gltf) {
            let obj = cloneGltf(gltf);
            obj.scene.scale.x = obj.scene.scale.y = obj.scene.scale.z = 0.015;
            //将模型缩放并添加到场景当中
            obj.scene.traverse( function ( it ) {
              // console.log(it)
               if (it.isMesh) {
                    it.castShadow = true;
                    // it.receiveShadow = true;
                }
                if (it.material) {
                            // if (it.material.opacity < 1) {
                            //     it.material.side = THREE.BackSide;
                            //     it.material.depthTest = it.material.depthWrite = false;
                            // }
                            // else
                            it.material.side = THREE.DoubleSide;
                }
            });
            vm.scene.add( obj.scene );
            vm.loading = false;

            },function ( xhr ) {
              setTimeout(()=>{
                var percent = parseFloat(xhr.loaded / 4041401 * 100).toFixed(0);
                if(percent>99){
                  percent = 99
                }
                vm.percent = percent;
              },3000)
              
                // console.log( (xhr.loaded / 4041401 * 100) + '% loaded' );
            },function ( error ) {
              console.log('load error!'+error.getWebGLErrorMessage());
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
  position:relative;
  #threewebgl{
        width:100%;
        height:100%;
  }
  .mask{
    width:100%;
    height:100%;
    position:absolute;
    z-index:2;
    top:0;
    background-color:rgba(54, 49, 49, 0.8);
    text-align: center;
    padding-top:300px;
    font-weight:700;
    font-size:32px;
    color:white;
  }
}
</style>