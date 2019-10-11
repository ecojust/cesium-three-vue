 <template>
  <div class="scrolltable">
  	<!-- <GeminiScrollbar style="height:100%;width:100%;"> -->
  		<div  class="innerScroll"  :style="wrapStyle">
  			<Table class="headertable" stripe :columns="columns" @on-sort-change="handleSort" ></Table>
		  	<!-- <GeminiScrollbar :style="innerStyle"> -->
        <div style="overflow-y: scroll;height:calc(100% - 40px);">
          <Table style="width:100%;" :show-header="false" stripe :columns="columns" :data="data"></Table>

        </div>


		  	<!-- </GeminiScrollbar> -->
  		</div>
  	<!-- </GeminiScrollbar> -->
  </div>
</template>

<script>
export default {
  name: 'scrolltable',
  props: [
  	"columns","data","sortChange"
  ],
  data () {
    return {
    	wrapStyle:{},
    	innerStyle:{
      }
    }
  },
  created(){
  	var vm = this;
  	// Bus.$on('resetSize',(data)=>{
  	// 	setTimeout(()=>{
  	// 		vm.resetSize();
  	// 	})
    // });
  	this.resetSize();
  },
  update(){
  	this.resetSize();
  },
  mounted(){
  	// Bus.$emit('resetSize');
  },
  methods:{
  	resetSize(){
  		var columns = this.columns;
	  	var allWidth = 0;
	  	for (var i = 0; i < columns.length; i++) {
	  		var width = columns[i].width||200;
	  		allWidth += width;
	  	}
	  	this.wrapStyle = {
	  		width:allWidth+2 +'px',
	  		height:'calc(100% - 10px)',
        minWidth:'100%'
	  	};
	  	this.innerStyle = {
	  		height:'calc(100% - 40px)',
	  		width:'100%',
	  	}
  	},
    handleSort(info){
  	  this.sortChange(info);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
.scrolltable{
	width:100%;
	height:100%;
  overflow-x: scroll;
	.headertable{
		width:100%;
		height:40px;
		overflow-y:hidden;
		border-top-left-radius:6px;
		border-top-right-radius:6px;
	}

	.innerScroll{
    overflow: hidden;
		.gm-scroll-view{
			width:calc(100% + 17px) !important;
			height:calc(100% + 20px) !important;
		}
	}

}
</style>
