<template>
  <div class="three4s">
        <div id="threewebgl"></div>
        <!-- <span class="btn" id="animation">animation</span> -->

        <!-- <div class="mask" v-show="loading">
          <div>加载中 {{percent}} %</div>
        </div> -->
  </div>
   
</template>

<script>
import * as THREE from "three"
import {cloneGltf} from '../lib/modelUtils'
var TWEEN = require('tween.js');

export default {
  name: 'three4s',
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
        this.camera.position.y = 4;
        this.camera.position.z = 5;


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
        this.heatmap();
        return;

        var gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load('/static/source/scene.gltf', function (gltf) {
            let obj = cloneGltf(gltf);
            obj.scene.scale.x = obj.scene.scale.y = obj.scene.scale.z = 0.015;
            //将模型缩放并添加到场景当中
            obj.scene.traverse( function ( it ) {``
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
            vm.mesh = obj.scene;
            vm.mesh.position.setY(-2.2);
            vm.scene.add( obj.scene );
            vm.loading = false;

            


            },function ( xhr ) {
              // setTimeout(()=>{
                var percent = parseFloat(xhr.loaded / 4041401 * 100).toFixed(0);
                if(percent>99){
                  percent = 99
                }
                vm.percent = percent;
              // },3000)
            },function ( error ) {
              console.log('load error!'+error.getWebGLErrorMessage());
            }
        )
    },
    heatmap(){
      //随机温度值
      let getTemperature=()=>{
          var  temperatureArray=new Array();
          for(let i=0;i<9;i++){
              temperatureArray[i]=new Array();
              for(let j=0;j<9;j++){
                  temperatureArray[i][j]=parseInt(Math.random()*35);
              }
          }
          return temperatureArray;
      };
      //获取温度点的XY坐标
      let getPositionXY=(i,j)=>{
          let positionX=[-25,-20,-15,-10,-5,0,10,15,20];
          let positionY=[-25,-20,-15,-10,-5,0,10,15,20];
          return {
              x:positionX[i]*5,
              y:positionY[j]*5
          }
      };
      //绘制辐射圆
      let drawCircular=(context,opts)=>{
          let {x,y,radius,weight}=opts;
          radius=parseInt(radius*weight);//计算出实际的辐射圆
          // 创建圆设置填充色
          let rGradient = context.createRadialGradient(x, y, 0, x, y, radius);
          rGradient.addColorStop(0, "rgba(0, 1, 0, 1)");
          rGradient.addColorStop(1, "rgba(1, 0, 0, 0)");
          context.fillStyle = rGradient;
          // 设置globalAlpha
          context.globalAlpha = weight;
          context.beginPath();
          context.arc(x, y, radius, 0, 2 * Math.PI);
          context.closePath();
          context.fill();// 填充
      };
      //调色板
      let createPalette=()=>{
            //颜色条的颜色分布
            let colorStops = {
                0: "#0ff",
                0.4: "#0f0",
                0.8: "#ff0",
                1: "#f00"
            };
            //颜色条的大小
            let width = 256, height = 1;
            // 创建canvas
            let paletteCanvas = document.createElement("canvas");
            paletteCanvas.width = width;
            paletteCanvas.height = height;
            let ctx = paletteCanvas.getContext("2d");

            // 创建线性渐变色
            let linearGradient = ctx.createLinearGradient(0, 0, width, 0);
            for (const key in colorStops) {
                linearGradient.addColorStop(key, colorStops[key]);
            }

            // 绘制渐变色条
            ctx.fillStyle = linearGradient;
            ctx.fillRect(0, 0, width, height);

            let imageData = ctx.getImageData(0, 0, width, height).data;// 读取像素值

            return {
                canvas: paletteCanvas,
                pickColor: function (position) {
                    return imageData.slice(position * 4, position * 4+3 )
                }
            }
        };
      //绘制热力图
      let heatMap=(width,height)=>{
            let canvas = document.createElement("canvas");
            canvas.width=width;
            canvas.height=height;
            let context = canvas.getContext("2d");
            let tenperature=getTemperature();

            for(let i=0;i<9;i++) {
                for (let j = 0; j < 9; j++) {
                    let weight=tenperature[i][j]/33;  //计算出当前温度占标准温度的权值
                    drawCircular(context,{
                        x:getPositionXY(i,j).x,
                        y:getPositionXY(i,j).y,
                        radius:20,
                        weight:weight
                    })
                }
            }
            let palette=createPalette();
            // document.body.appendChild(palette.canvas);
            let imageData = context.getImageData(0, 0, width, height);
            let data=imageData.data;

            for (let i = 3; i < data.length; i += 4) {//根据画面数据绘制颜色
                let alpha = data[i];
                let color = palette.pickColor(alpha);
                console.log(color)
                data[i - 3] = color[0];
                data[i - 2] = color[1];
                data[i - 1] = color[2];
            }

            for(var i = 0; i < imageData.data.length; i += 4) {// 背景设置成青色
                if(imageData.data[i + 3] == 0) {
                    imageData.data[i] = 0;
                    imageData.data[i + 1] = 255;
                    imageData.data[i + 2] = 255;
                    imageData.data[i + 3] = 255;
                }
            }
            context.putImageData(imageData, 0, 0);//设置画面数据
            return canvas;
        };
        let heatMapGeo = new THREE.PlaneGeometry(25,25);
        let heatMapTexture = new THREE.Texture(heatMap(100,100));

        let heatMapMaterial = new THREE.MeshBasicMaterial({
            map: heatMapTexture
        });
        heatMapMaterial.map.needsUpdate = true;
        var heatMapPlane = new THREE.Mesh(heatMapGeo,heatMapMaterial);
        heatMapPlane.position.set(0,0,0);
        // heatMapPlane.rotation.copy(new THREE.Euler(-Math.PI/2,0, Math.PI));
        this.scene.add(heatMapPlane);

    },
    animate(){
        this.renderer.render(this.scene,this.camera);
        TWEEN.update();
        requestAnimationFrame(this.animate);
    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
.three4s{
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
  .btn{
    position:absolute;
    top:20px;
    z-index:999;
    background-color:gray;
    color:white;
    // border: 1px solid red;
    border-radius:4px;
    cursor:pointer;
    padding:5px;
  }
  #animation{
    left:800px;
  }
}
</style>