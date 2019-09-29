import Cesium from 'cesium/Cesium'; 

const tianditu = new Cesium.WebMapTileServiceImageryProvider({
    url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=e378319b5250eff0fdd562f3aa190e62",
    layer: "img",
    style: "default",
    format: "tiles",
    tileMatrixSetID: "w",
    credit: new Cesium.Credit('天地图全球影像服务'),
    subdomains: ['t0', "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
    maximumLevel: 18,
    show: true
})

const gaode = new Cesium.UrlTemplateImageryProvider({
    url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
})

const arc = new Cesium.ArcGisMapServerImageryProvider({
    url : '//services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
})

export {tianditu,gaode,arc}