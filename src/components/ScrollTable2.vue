 <template>
  <div class="scrolltable" id="scrolltable" style="height:calc(100% + 20px)">
  	<GeminiScrollbar style="height:100%;width:100%;">
  		<div :style="wrapStyle" class="wrap">
  			<Table class="headertable" stripe :columns="columns" ></Table>
		  	<GeminiScrollbar ref="verticalScroll" :style="innerStyle">
		  		<Table class="bodytable" :show-header="false" stripe :columns="columns" :data="data"></Table>
		  	</GeminiScrollbar>
  		</div>
  	</GeminiScrollbar>
  </div>
</template>

<script>
export default {
  name: 'scrolltable',
  props: [
  	"columns","data"
  ],
  data () {
    return {
    	wrapStyle:{},
    	innerStyle:{},
      tablestyle:{
        height:'calc(100% - 10px) !important'
      }
    }
  },
  created(){

  	var vm = this;
  	this.resetSize();
  },
  update(){
  	this.resetSize();
  },
  mounted(){
    var vm = this;
    // setInterval(()=>{
    //   console.log(vm.$refs.verticalScroll.$refs.geminiScrollbar);
    //   vm.$refs.verticalScroll.$refs.geminiScrollbar.scrollTo(0, 0);
	// },1000)
  	this.resetSize();
	
  },
  methods:{
  	resetSize(){
  		var columns = this.columns;
	  	var allWidth = 0;
	  	for (var i = 0; i < columns.length; i++) {
	  		var width = columns[i].width||20;
	  		allWidth += width;
	  	}
	  	this.wrapStyle = {
	  		width:allWidth+2 +'px',
	  		height:'calc(100% - 0px)',
        	minWidth:'100%'
	  	};

	  	this.innerStyle = {
	  		height:'calc(100% - 40px)',
	  		width:'100%'
		  }
		  console.log(allWidth)
      
  	}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
.scrolltable{
	max-width:100%;
  	height:450px;
	.wrap{
		.gm-scroll-view{
			// width:calc(100% + 20px) !important;
			// height:calc(100% + 20px) !important;
		}
		.headertable{
			min-width:100%;
			width:auto;
			height:40px;
			overflow-y:hidden;
			border-top-left-radius:6px;
			border-top-right-radius:6px;
		}
		.bodytable {
			min-width:100%;
			width:auto;
			.ivu-table-row{
				.ivu-table-cell {
					max-height: 15px;
					overflow: hidden;
				}
				td {
					height:38px;
				}
			}  
			.ivu-table-row :hover  td{
				height:auto;
			}
			.ivu-table-row :hover  .ivu-table-cell{
				max-height: none; 
			}
		}
	}
	
}
</style>
