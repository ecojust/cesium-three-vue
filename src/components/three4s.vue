<template>
  <div class="three4s">
        <div id="threewebgl"></div>

        <div class="mask" v-show="loading">
          <div>加载中 {{percent}} %</div>
        </div>
        <div id="map">
          <div ref="chinamap"></div>
          <div></div>
          <div></div>
        </div>
  </div>
   
</template>

<script>
import * as THREE from "three"
import Heatmap from 'heatmap.js'
import {cloneGltf} from '../lib/modelUtils'
import chinajson from '../lib/china'
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
        loading:true,
        cars:[]
    }
  },
  mounted(){
    this.init();
    this.add();
    this.animate();
    this.echart();
  },
  methods:{
    echart(){
      this.$echarts.registerMap("china", chinajson);//注册地图
      var dom = this.$refs.chinamap;
      var myChart = this.$echarts.init(dom);
      var vm = this;
      var option = {
          series: [{
              type: 'map',
              mapType: 'china',
              label: {
                  normal: {
                      show: true, //显示省份标签
                      textStyle: {
                          color: "blue"
                      } //省份标签字体颜色
                  },
                  emphasis: { //对应的鼠标悬浮效果
                      show: false,
                      textStyle: {
                          color: "#800080"
                      }
                  }
              },
              aspectScale: 0.75,//这个参数用于 scale 地图的长宽比。最终的 aspect 的计算方式是：geoBoundingRect.width / geoBoundingRect.height * aspectScale
              zoom: 1.2,//当前视角的缩放比例。
              itemStyle: {
                  normal: {
                      borderWidth: .5, //区域边框宽度
                      borderColor: '#009fe8', //区域边框颜色
                      areaColor: "#ffefd5", //区域颜色
                  },
                  emphasis: {//鼠标滑过地图高亮的相关设置
                      borderWidth: .5,
                      borderColor: '#4b0082',
                      areaColor: "#ffdead",
                  }
              }
          }]
      };
      var option2 = { // 进行相关配置
          backgroundColor: "rgba(0,0,0,0)",
          title: {
              text: '全国【门店活跃度】',
              textStyle: {
                  color: 'black'
              }
          },
          tooltip: {}, // 鼠标移到图里面的浮动提示框
          dataRange: {
            show: false,
            min: 0,
            max: 1000,
            text: ['High', 'Low'],
            realtime: true,
            calculable: true,
            color: ['orangered', 'yellow', 'lightskyblue']
          },
          geo: { // 这个是重点配置区
            map: 'china', // 表示中国地图
            roam: true,
            zoom: 1.25,
            label: {
              normal: {
                show: false, // 是否显示对应地名
                textStyle: {
                  color: 'rgba(0,0,0,0.4)'
                }
              },
              emphasis: { //动态展示的样式
                  // color:'#43d0d6',
                  color:'rgba(0,0,0,0)'
              },
            },
            itemStyle: {
              normal: {
                areaColor: "#93bce6",
                borderWidth: 1.1,
                textStyle: {
                    color: "#fff"
                },
                borderColor: "#fff" //地图边框颜色
              },
              emphasis: {
                areaColor: null,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 20,
                borderWidth: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          },
          series: [
            {
              type: 'scatter',
              coordinateSystem: 'geo' // 对应上方配置
            },
            {
              name: '活跃度', // 浮动框的标题
              type: 'map',
              // name: 'bar3D',
              // type: "bar3D",
              // coordinateSystem: 'geo3D',
              geoIndex: 0,
              data: [
                {
                  "name": "浙江",
                  "value": 599
                }, 
                {
                  "name": "福建",
                  "value": 142
                }
              ]
            }
          ]
        }
      myChart.setOption(option2);
    },
    drawheat(){
      var app = document.getElementsByClassName('three4s')[0];
      var width = 400,height = 400;
      let paletteCanvas = document.createElement("div");
      paletteCanvas.style.cssText = "height:400px;width:400px;display:none;";

      app.appendChild(paletteCanvas)

      var heatmapInstance = Heatmap.create({
        container: paletteCanvas
      })
      var points = []
      var max = 0
      for(var i = 0;i<300;i++){
        var val = Math.floor(Math.random() * 100);
        max = Math.max(max, val);
        var point = {
          // x: 0+i*4,
          // y: 300,
          x:Math.floor(Math.random() * 400),
          y:Math.floor(Math.random() * 400),
          radius: 20,
          value: 40
        };
        points.push(point)
      }
      var data = {
        max: 100,
        data: points
      }
      heatmapInstance.setData(data);
      var canvas = paletteCanvas.getElementsByTagName('canvas')[0];
      console.log(canvas)
      heatmapInstance = null;
      return canvas;
      // document.body.appendChild(heatmapInstance)
    },
    clickListener(width,height){
      var vm = this;
      var raycaster = new THREE.Raycaster();
      var mouse = new THREE.Vector2();

      function onMouseClick( event ) {
          //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
          mouse.x = ( event.clientX / width ) * 2 - 1;
          mouse.y = - ( event.clientY / height ) * 2 + 1;
          // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
          raycaster.setFromCamera( mouse, vm.camera );
          // 获取raycaster直线和所有模型相交的数组集合
          if(vm.mesh){
            var intersects = raycaster.intersectObjects( vm.mesh.children,true );
            // console.log(vm.mesh.children,intersects)
            for(var i = 0;i<intersects.length;i++){
              var name = intersects[i].object.name;
              if(~name.indexOf('car')){
                console.log(intersects[i].object)
              }
              console.log(intersects[i].object.name);
            }
          }
          // var intersects = raycaster.intersectObjects( vm.scene.children );
          
          // console.log(intersects,vm.scene.children);
          // //将所有的相交的模型的颜色设置为红色，如果只需要将第一个触发事件，那就数组的第一个模型改变颜色即可
          // for ( var i = 0; i < intersects.length; i++ ) {
          //     intersects[ i ].object.material.color.set( 0xff0000 );
          // }
      }
      // window.addEventListener( 'click', onMouseClick, false );
    },
    init(){
        var dom = document.getElementById('threewebgl');
        const width = dom.clientWidth;
        const height = dom.clientHeight;
        const draw = dom;
        this.camera = new THREE.PerspectiveCamera(10,width/height,10,4000);
        this.camera.position.x = 0;
        this.camera.position.y = 400;
        this.camera.position.z = 500;


        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setSize(width,height);
        this.clickListener(width,height);




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

        //左侧平行光
        var dirLight = new THREE.DirectionalLight(0xAAFFCC,0.5);
        dirLight.position.set(-50, 50,0);
        this.scene.add(dirLight);
        
        //  环境光
        var amlight = new THREE.AmbientLight(0xAAFFCC,0.5);
        amlight.castShadow = true;
        this.scene.add(amlight);

        //4个象限点光
        var pointlight1 = new THREE.PointLight( 0xff0000, 0.5, 100 );
        var pointlight2 = new THREE.PointLight( 0xff0000, 0.5, 100 );
        var pointlight3 = new THREE.PointLight( 0xff0000, 0.5, 100 );
        var pointlight4 = new THREE.PointLight( 0xff0000, 0.5, 100 );
        pointlight1.position.set( 25, 50, -25 );
        pointlight2.position.set( -25, 50, -25 );
        pointlight3.position.set( -25, 50, 25 );
        pointlight4.position.set( 25, 50, 25 );
        this.scene.add( pointlight1 );
        this.scene.add( pointlight2 );
        this.scene.add( pointlight3 );
        this.scene.add( pointlight4 );

        //聚光灯
        var spotLight = new THREE.SpotLight( 0xffffff,1.5 );
        spotLight.position.set( 0,50,60 );
        spotLight.castShadow = true;
        spotLight.angle = Math.PI/3;
        var spotHelper = new THREE.SpotLightHelper(spotLight);
        this.scene.add( spotLight );
        // this.scene.add( spotHelper );


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
      var helper = new THREE.AxesHelper(100);
        // this.scene.add(helper);
        var vm = this;
        this.heatmap();

        var gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load('/static/4scar/4scar.gltf', function (gltf) {
            let obj = cloneGltf(gltf);
            obj.scene.scale.x = obj.scene.scale.y = obj.scene.scale.z = 0.005;
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
            vm.mesh = obj.scene;
            var meshs = obj.scene.children;
            for(var i =0;i<meshs.length;i++){
              var item = meshs[i];
              if(~item.name.indexOf('car')){
                vm.cars.push(item)
              }
            }
            // vm.mesh.position.setY(-2.2);
            vm.scene.add( obj.scene );
            vm.loading = false;

            


            },function ( xhr ) {
              // setTimeout(()=>{
                var percent = parseFloat(xhr.loaded / 292000 * 100).toFixed(0);
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
      var vm = this;
      //随机温度值
      let getTemperature=()=>{
          var  temperatureArray=new Array();
          for(let i = 0;i<20;i++){
            // temperatureArray.push(parseInt(Math.random()*35+20))
            temperatureArray.push(50)

          }
          return temperatureArray;
      };
      //获取温度点的XY坐标
      let getPositionXY=(i)=>{
          let positionX=[
            

          ];
          let positionY=[0,25,50,75,10,20];
          return {
              x:i*2+10,
              // y:positionY[i]
              y:20
          }
      };
      //绘制辐射圆
      let drawCircular=(context,opts)=>{
          let {x,y,radius,weight}=opts;
          // radius=parseInt(radius*weight);//计算出实际的辐射圆
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
            var size = tenperature.length;

            for(let i=0;i<size;i++) {
                // for (let j = 0; j < size; j++) {
                    let weight=tenperature[i]/100;  //计算出当前温度占标准温度的权值
                    drawCircular(context,{
                        x:getPositionXY(i).x,
                        y:getPositionXY(i).y,
                        radius:4,
                        weight:weight
                    })
                // }
            }
            let palette=createPalette();
            // document.body.appendChild(palette.canvas);
            let imageData = context.getImageData(0, 0, width, height);
            let data=imageData.data;
            // console.log(data)

            for (let i = 3; i < data.length; i += 4) {//根据画面数据绘制颜色
                let alpha = data[i];
                let color = palette.pickColor(alpha);
                data[i - 3] = color[0];
                data[i - 2] = color[1];
                data[i - 1] = color[2];
                if(alpha==0){
                  data[i - 3] = 0;
                  data[i - 2] = 255;
                  data[i - 1] = 255;
                  data[i] = 255;
                }
            }
            context.putImageData(imageData, 0, 0);//设置画面数据
            return canvas;
        };

        let heatMapGeo = new THREE.PlaneGeometry(90,90);
        let heatMapTexture = new THREE.Texture(heatMap(100,100));

        var vm = this;
        let heatMapTexture2 = new THREE.Texture(vm.drawheat());


        let heatMapMaterial = new THREE.MeshBasicMaterial({
            map: heatMapTexture2,
            transparent:true
        });
        heatMapMaterial.map.needsUpdate = true;
        var heatMapPlane = new THREE.Mesh(heatMapGeo,heatMapMaterial);
        heatMapPlane.position.set(0,0.1,0);
        heatMapPlane.rotation.x = -Math.PI/2;

        // heatMapPlane.rotation.copy(new THREE.Euler(-Math.PI/2,0, Math.PI));
        this.scene.add(heatMapPlane);




    },
    animate(){
        this.renderer.render(this.scene,this.camera);
        for(var i = 0;i<this.cars.length;i++){
          // this.cars[i].rotation.y += 0.01;
          // this.cars[i].rotateY(0.01);

        }
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
  #map{
    height:400px;
    position:absolute;
    top:10px;
    border:1px solid red;
    >div{
      display:inline-block;
      width:400px;
      height:100%;
      border:1px solid blue;
    }
  }
}
</style>