<template>
  <div class="three4s">
        <div id="threewebgl"></div>

        <div class="mask" v-show="loading">
          <div>加载中 {{percent}} %</div>
        </div>
        <div id="map" v-show="mapshow">
          <div ref="chinamap"></div>
          <div>
            <!-- <Table stripe size="small" height="100" :columns="columns1" :data="data2"></Table>
            <Table stripe size="small" height="100" :columns="columns1" :data="data2"></Table> -->
            <div style="height:100px;width:400px;">
              <ScrollTable :columns="columns1" :data="data2"></ScrollTable>
            </div>

          </div>
          <div></div>
        </div>
  </div>
   
</template>

<script>
import * as THREE from "three"
import Heatmap from 'heatmap.js'
import {cloneGltf} from '../lib/modelUtils'
import FatLine from '../lib/FatLine'
import chinajson from '../lib/china'
var TWEEN = require('tween.js');

// import { BloomEffect, EffectComposer, EffectPass, RenderPass,ShaderPass } from "postprocessing";
import * as PostProcessing from "postprocessing";

import {SweepingLightShader,FXAAShader} from '../lib/Shader'



import ScrollTable from '@/components/ScrollTable2'

export default {
  name: 'three4s',
  components:{
    ScrollTable
  },
  data(){
    return {
        camera:null,
        scene:null,
        renderer:null,
        mesh:null,
        line:null,
        percent:0,
        loading:true,
        cars:[],
        mapshow:false,
        vertices:[],
        FatLine:null,
        composer:null,
        myShaderMaterial:null,
        lighttype:'gradient',
        rendertype:'composer',
        time:-2.0,
        type:'add',
        columns1: [
            {
                title: 'Name',
                key: 'name',
                render: (h, params) => {
                    return h('div', [
                        h('Icon', {
                            props: {
                                type: 'person'
                            }
                        }),
                        h('strong', params.row.name)
                    ]);
                }
            },
            {
                title: 'Age',
                key: 'age'
            },
            {
                title: 'Address',
                key: 'address'
            }
        ],
        data2:[
          {
              name: 'John Brown',
              age: 18,
              address: 'New York No. 1 Lake Park',
              date: '2016-10-03'
          },
          {
              name: 'Jim Green',
              age: 24,
              address: 'London No. 1 Lake Park',
              date: '2016-10-01'
          },
          {
              name: 'Joe Black',
              age: 30,
              address: 'Sydney No. 1 Lake Park',
              date: '2016-10-02'
          },
        ]
    }
  },
  mounted(){
    this.init();
    this.add();
    this.animate();
    this.echart();
  },
  methods:{
    addcomposer(){
        //扫光shader
        this.composer.addPass(new PostProcessing.RenderPass(this.scene, this.camera));
        this.myShaderMaterial = new THREE.ShaderMaterial({
          defines: { LABEL: "value" },
          uniforms: { 
            tDiffuse: new THREE.Uniform(null),
            time:new THREE.Uniform(this.time)
          },
          vertexShader: SweepingLightShader.vertexShader,
          fragmentShader: SweepingLightShader.fragmentShader
        });
        const myShaderPass = new PostProcessing.ShaderPass(this.myShaderMaterial, "tDiffuse");
        this.composer.addPass(myShaderPass);
        //抗锯齿shader
        var FXAAShaderMaterial = new THREE.ShaderMaterial({
          defines: { LABEL: "value" },
          uniforms: { 
            tDiffuse: new THREE.Uniform(null),
            resolution:new THREE.Uniform(new THREE.Vector2(1/window.innerWidth,1/window.innerHeight))
          },
          vertexShader: FXAAShader.vertexShader,
          fragmentShader: FXAAShader.fragmentShader
        });
        const FXAAShaderPass = new PostProcessing.ShaderPass(FXAAShaderMaterial, "tDiffuse");
        this.composer.addPass(FXAAShaderPass);
        //辉光Effect提供场景光照
        var effect = new PostProcessing.BloomEffect();
        const effectPass = new PostProcessing.EffectPass(this.camera, effect);
        effectPass.renderToScreen = true;
        this.composer.addPass(effectPass);
    },
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
      for(var i = 0;i<100;i++){
        var val = Math.floor(Math.random() * 100);
        max = Math.max(max, val);
        var point = {
          // x: 0+i*4,
          // y: 300,
          x:Math.floor(Math.random() * 400),
          y:Math.floor(Math.random() * 200 + 200),
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
    addpoint(x,z){
      let pointgeo = new THREE.PlaneGeometry(2,2);
      pointgeo = new THREE.CircleGeometry( 1, 32 );
      var texture = new THREE.TextureLoader().load( '/static/texture/point.png' );
      let pointmat = new THREE.MeshBasicMaterial({
          map: texture,
          transparent:true
      });
      // pointmat.map.needsUpdate = true;
      var point = new THREE.Mesh(pointgeo,pointmat);
      point.position.set(x||0,1.4,z||0);
      point.rotation.x = -Math.PI/2;
      this.scene.add(point);
    },
    addline(){
      // var vertices = [];
      // for ( var i = 0; i <40; i ++ ) {
      //   var x = i * 4 -60;
      //   var z = Math.random()* 20 + 20
      //   vertices.push( x, 0.1, z );
      // }
      // var geometry = new THREE.BufferGeometry();
      // geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
      // //
      // var material = new THREE.LineBasicMaterial( {
      //   color: Math.random() * 0xffffff,
      //   linewidth: 1000
      // } );
      // var line = new THREE.Line( geometry, material );
      //this.scene.add( line );

      var vertices = [];
      for ( var i = 0; i <60; i ++ ) {
        var x = i * 4 -60;
        if(i>30){
          x = 60 - (i-30)*4
        }
        var y = i * 0.3;
        var z = Math.random()* 40;
        vertices.push( new THREE.Vector3(x,y,z ));
      }
      this.vertices = vertices;
      this.FatLine = new FatLine(vertices,300,this.scene);
      this.FatLine.draw();
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
        this.camera = new THREE.PerspectiveCamera(60,width/height,10,4000);
        var far = 0.6;
        this.camera.position.x = -8;
        this.camera.position.y = 150 * far;
        this.camera.position.z = 150 * far;
        this.camera.lookAt(0,0,0);


        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setSize(width,height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.needsUpdate = true;

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

        
        var vm = this;
        vm.scene.background = cubeTexture;

        var TextureLoader = new THREE.TextureLoader();
        TextureLoader.setPath( '/static/texture/' );
        TextureLoader.load('6.jpg',(texture)=>{
        vm.scene.background = texture;

        });


        //左侧平行光
        var dirLight = new THREE.DirectionalLight(0x8B0000,0.5);
        dirLight.position.set(-50, 50,0);
        dirLight.castShadow = true;
        this.scene.add(dirLight);
        
        //  环境光
        //0x6495ED
        var amlight = new THREE.AmbientLight(0x6495ED,0.5);
        this.scene.add(amlight);

        //4个象限点光
        var pointlight3 = new THREE.PointLight( 0xffffff, 0.1, 1 );
        var pointlight32 = new THREE.PointLight( 0xffffff, 1.0, 100 );
        var pointlight4 = new THREE.PointLight( 0xffffff, 1.0, 100 );
        pointlight3.position.set( -80,40,20 );
        pointlight32.position.set( -30, 10, 25 );
        pointlight4.position.set( 30, 10, 25 );
        pointlight3.castShadow = true;
        this.scene.add( pointlight3 );
        this.scene.add( pointlight32 );
        this.scene.add( pointlight4 );

        //聚光灯
        var spotLight = new THREE.SpotLight( 0xffffff,1.0 );
        spotLight.position.set( -80,40,20 );
        spotLight.castShadow = true;
        spotLight.angle = Math.PI/3;
        var spotHelper = new THREE.SpotLightHelper(spotLight);
        // this.scene.add( spotLight );
        // this.scene.add( spotHelper );


        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        // 如果使用animate方法时，将此函数删除
        //controls.addEventListener( 'change', render );
        // 使动画循环使用时阻尼或自转 意思是否有惯性
        this.controls.enableDamping = false;
        //动态阻尼系数 就是鼠标拖拽旋转灵敏度
        //controls.dampingFactor = 0.25;
        //是否可以缩放
        this.controls.enableZoom = true;
        //是否自动旋转
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 3;
        //设置相机距离原点的最近距离
        this.controls.minDistance = 100;
        //设置相机距离原点的最远距离
        this.controls.maxDistance = 200;
        //是否开启右键拖拽
        this.controls.enablePan = false;

        draw.appendChild(this.renderer.domElement);
        this.composer = new PostProcessing.EffectComposer(this.renderer);
    },
    add(){
      var geometry = new THREE.PlaneGeometry( 1000, 200);
      var material = new THREE.MeshLambertMaterial( {color: 0x778899, side: THREE.DoubleSide} );
      var plane = new THREE.Mesh( geometry, material );
      plane.position.setY(1.0);
      plane.rotation.x = Math.PI/2;
      plane.receiveShadow = true;
      this.scene.add( plane );

      var helper = new THREE.AxesHelper(100);
        // this.scene.add(helper);
        var vm = this;
        var gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load('/static/4scarbig/4scar.gltf', function (gltf) {
            let obj = cloneGltf(gltf);
            obj.scene.scale.x = obj.scene.scale.y = obj.scene.scale.z = 0.003;
            //将模型缩放并添加到场景当中
            obj.scene.traverse( function ( it ) {
                    // it.receiveShadow = true;

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
            // vm.mesh.position.setY(-2.2);
            vm.scene.add( obj.scene );
            vm.heatmap();
            vm.loading = false;
            vm.addcomposer();
            },function ( xhr ) {
              // setTimeout(()=>{
                var percent = parseFloat(xhr.loaded / 292000 * 100).toFixed(0);
                if(percent>99){
                  percent = 99
                }
                vm.percent = percent;
              // },3000)
            },function ( error ) {
              console.log('load error!'+error);
            }
        )
    },
    heatmap(){
        var vm = this;
        let heatMapGeo = new THREE.PlaneGeometry(120,90);
        let heatMapTexture2 = new THREE.Texture(vm.drawheat());
        let heatMapMaterial = new THREE.MeshBasicMaterial({
            map: heatMapTexture2,
            transparent:true
        });
        heatMapMaterial.map.needsUpdate = true;
        var heatMapPlane = new THREE.Mesh(heatMapGeo,heatMapMaterial);
        heatMapPlane.position.set(0,1.1,0);
        heatMapPlane.rotation.x = -Math.PI/2;
        this.scene.add(heatMapPlane);
    },
    animate(){
        const clock = new THREE.Clock();
        if(this.rendertype == 'composer'){
          this.composer.render(clock.getDelta());
        }else{
          this.renderer.render(this.scene,this.camera);
        }
        var vm = this;

        //循环扫光
        if(this.myShaderMaterial&&this.lighttype=='cycle'){
          if(this.time > 2.0){
            this.type = 'reduce';
          }else if(this.time < -2.0){
            this.type = 'add'
          }
          if(this.type=='add'){
            this.time += 0.08;
          }else{
            this.time -= 0.08;
          }
          this.myShaderMaterial.uniforms.time= new THREE.Uniform(this.time);
        }
        //扫光结束场景变亮
        if(this.myShaderMaterial&&this.lighttype=='gradient'){
          //3.75
          if(this.time > 3.75){
            this.rendertype = 'renderer';
            this.lighttype = '';
            this.addline();
            this.heatmap();
          }else if(this.time > 2.0){
            this.time += 0.1;

          }else{
            this.time += 0.08;
          }
          this.myShaderMaterial.uniforms.time= new THREE.Uniform(this.time);
        }
        if(this.FatLine){
          function addpoint(time){
            for(var i = 0,length=vm.vertices.length;i<length;i++){
              var point = vm.vertices[i];
              if(Math.abs(point.y-time)< 0.1){
                vm.addpoint(point.x,point.z);
              }
            }
          }
          this.FatLine.animate(0.3,addpoint);
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
      vertical-align:top;
    }
  }
}
</style>