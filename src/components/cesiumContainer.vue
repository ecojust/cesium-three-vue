<template>
  <div class="index">
    <div id="cesiumContainer">
    </div>
    <!-- <el-dialog
      title="three.js"
      :visible.sync="centerDialogVisible"
      width="80%"
      center>
      <div id="content" style="height:500px">
          <component :is="curcomponent"></component>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="centerDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog> -->
    <Modal v-model="centerDialogVisible" fullscreen footer-hide title="Three.js">
        <div id="content" style="height:100%;">
          <component :is="curcomponent"></component>
        </div>
    </Modal>
  </div>
   
</template>

<script>
import Cesium from 'cesium/Cesium'; 
import widgets from'cesium/Widgets/widgets.css';
import {tianditu,gaode,arc} from '../lib/cesiumMap';

import threepage from './threepage';

export default {
  name: 'cesiumContainer',
  components:{
    threepage
  },
  data(){
    return {
      centerDialogVisible: false,
      curcomponent:''
    }
  },
  mounted(){
    this.init();
  },
  methods:{
    init(){
      var vm = this;
      const TOKEN1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNjZiZDQxNS0xNDNlLTRkZDYtOGQ2MC1jZjYzOGI3MDcxYzAiLCJpZCI6MTU5NjYsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjkyOTQwMjZ9.g_e448zt1KzP-BzI82lgrI6CraWgOTHgLe-UaEANwNs'
      const TOKEN2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwN2YxMWJmMi1lOWI3LTQ3MGUtYTFlYi1mZGQzMzhhMWIxNmYiLCJpZCI6MTU5NjYsInNjb3BlcyI6WyJhc2wiLCJhc3IiLCJhc3ciLCJnYyJdLCJpYXQiOjE1NjkyOTkyMjF9.KLSIwDfkS-pAcHWITpJBb_82OXzt_qadEVXpCZEE06Y';
      Cesium.Ion.defaultAccessToken = TOKEN2;

    //  var viewer = new Cesium.Viewer('cesiumContainer');

      var viewer = new Cesium.Viewer('cesiumContainer',{ 
            //需要进行可视化的数据源的集合
            animation: false, //是否显示动画控件
            shouldAnimate : true,
            homeButton: true, //是否显示Home按钮
            fullscreenButton: false, //是否显示全屏按钮
            baseLayerPicker: false, //是否显示图层选择控件
            geocoder: false, //是否显示地名查找控件
            timeline: false, //是否显示时间线控件
            sceneModePicker: true, //是否显示投影方式控件
            navigationHelpButton: false, //是否显示帮助信息控件
            infoBox: true, //是否显示点击要素之后显示的信息
            requestRenderMode: true, //启用请求渲染模式
            scene3DOnly: false, //每个几何实例将只能以3D渲染以节省GPU内存
            sceneMode: 3, //初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  Cesium.SceneMode
            fullscreenElement: document.body, //全屏时渲染的HTML元素 暂时没发现用处
            imageryProvider:tianditu
        });



     var promise=Cesium.GeoJsonDataSource.load('/static/source/city.json');
        promise.then(function(dataSource) {
            viewer.dataSources.add(dataSource);
            var entities = dataSource.entities.values;
            var colorHash = {};
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                var color =Cesium.Color.fromRandom({
                    alpha: 1.0
                });
                entity.polygon.material = color;
                entity.polygon.outline = false;
                entity.polygon.extrudedHeight = Math.floor(Math.random()*40+8) //80000~120000的随机数，单位是米
            }
            setTimeout(()=>{
              // viewer.zoomTo(promise)
              viewer.flyTo(promise)
            },5000)
        });

        // viewer.camera.position = Cesium.Cartesian3.fromDegrees(121.32248014211655,31.165403355271735);
        // let cameraPos = viewer.camera.position;
        // // 获取当前坐标系标准
        // let ellipsoid = viewer.scene.globe.ellipsoid;
        // // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
        // let cartographic = ellipsoid.cartesianToCartographic(cameraPos);
        // // 获取镜头的高度
        // let height = cartographic.height;
        // viewer.camera.zoomOut(height * 120);

        // // 镜头拉近
        // setTimeout(()=>{
        //   //viewer.camera.zoomIn(height / 3);
        // },3000)



        var entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(121.32248014211655,31.165403355271735),
            ellipse : {
                semiMinorAxis : 20.0,
                semiMajorAxis : 40.0,
                material : Cesium.Color.BLUE.withAlpha(0.0)//可设置不同的MaterialProperty
            }
        });
        // viewer.trackedEntity = entity; // 镜头追踪，将镜头固定在对象上

        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction(
            function (click) {
                var pick = viewer.scene.pick(click.position);
                if(pick){
                  console.log(pick)
                  var center = Cesium.Cartesian3.fromDegrees(121.32159501314163,31.165189910331343);
                  var heading = Cesium.Math.toRadians(250.0);
                  var pitch = Cesium.Math.toRadians(-20.0);
                  var range = 500.0;
                  //viewer.camera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range));
                  vm.centerDialogVisible = true;
                  vm.curcomponent = 'threepage'
                }
            },
            Cesium.ScreenSpaceEventType.LEFT_DOWN
        );
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
.index{
  width:100%;
  height:100%;
}
</style>