<template>
  <div class="custom-component"
    :style="{
      'background-color': backgroundColor,
      'border-color': borderColor,
      'border-style': 'solid',
      'border-width': '2px',
      'border-radius': '4px',
      'padding': '15px',
      'width': '200px',
      'margin': '0 auto'
    }"
  >

    <div class="page-view-counter">
      <span>{{countViews}} views</span>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'

export default {
  name: 'CustomComponent',
  data() {
    return {
      pageID: '',
      countViews: 0,
      backgroundColor: '#EEE',
      borderColor: '#DDD',
      socket: io('localhost:3002')
    }
  },
  mounted(){
    let q = this.$router.currentRoute.query
    this.pageID = q.pageID

    this.showValue()
    this.incrementViewCounts()

    this.socket.on('UPDATED_HIT_COUNT', (data) => {
      this.countViews = data.countViews
    })
  },
  methods:{
    showValue () {
      console.log(this.pageID)
      console.log('views: ' , this.countViews)
    },

    incrementViewCounts() {
      this.socket.emit('INC_HIT_COUNT', {
        pageID: this.pageID
      })
    }
  }  
}
</script>
