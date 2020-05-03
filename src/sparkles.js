var app = new Vue({
  el: '#app',
  data() {
    return {
      canvas: null,
      timer: null,
      sparks: [],
      ctx: null,
    };
  },
  mounted() {
    this.canvas = document.getElementById('sparkles');
    this.ctx = this.canvas.getContext('2d');
    this.updateSize();
    window.addEventListener('resize', this.updateSize);
    this.fill('rgba(0,0,0,1)');
    this.createSparks();
    this.timer = setInterval(() => {
      this.drawSparkles();
    }, 60);
  },

  methods: {
    createSparks() {
      let size = 100;
      while(size--) {
        this.sparks.push(this.createSpark()); 
      }
    },

    createSpark() {
      return {
        pos: {
          x: this.canvas.width / 2,
          y: this.canvas.height - this.canvas.height / 3,
        },
        life: 800,
        lifeMax: 800,
        angle: 25 + Math.random() * 130,
        speed: 2 + Math.random() * 5,
      };
    },

    drawSparkles() {
      this.fill('rgba(0,0,0,0.1)');
      this.sparks.forEach((spark,i) => {
        let thisRand = Math.random();
        let colorRand = Math.random();
        let op = 1 / spark.lifeMax * spark.life;
        let sz = 2 * spark.life / spark.lifeMax;
        let spike = 20 * (spark.life / spark.lifeMax) * thisRand;
        let spikeAngle = thisRand * 360;
        let spikeSin = Math.sin(spikeAngle * Math.PI / 180) * spike;
        let spikeCos = Math.cos(spikeAngle * Math.PI / 180) * spike;
        let sin = Math.sin(spark.angle * Math.PI / 180) * spark.speed;
        let cos = Math.cos(spark.angle * Math.PI / 180) * spark.speed;

        this.ctx.fillStyle = this.ctx.strokeStyle =
          colorRand < 0.2 ? `rgba(255,0,0,${op})` :
          colorRand < 0.4 ?  `rgba(0,255,0,${op})`:
          colorRand < 0.6 ?  `rgba(0,0,255,${op})` :
          this.randomColor(op);
        this.ctx.beginPath();
        this.ctx.lineWidth = thisRand * 0.3;
        this.lineTo(this.ctx, spark.pos.x - spikeSin, spark.pos.y - spikeCos, spark.pos.x + spikeSin, spark.pos.y + spikeCos,);
        this.lineTo(this.ctx, spark.pos.x - spikeSin, spark.pos.y + spikeCos, spark.pos.x + spikeSin, spark.pos.y - spikeCos,);
        spike = 20 * (spark.life / spark.lifeMax) * Math.random();// reset
        this.lineTo(this.ctx, spark.pos.x - spikeCos, spark.pos.y - spikeSin, spark.pos.x + spikeCos, spark.pos.y + spikeSin,);
        this.lineTo(this.ctx, spark.pos.x - spikeCos, spark.pos.y + spikeSin, spark.pos.x + spikeCos, spark.pos.y - spikeSin,);
        this.drawSphere(this.ctx, {x:spark.pos.x, y:spark.pos.y}, sz * thisRand , true, false);
        spark.pos.x += cos;
        spark.pos.y -= sin - (spark.lifeMax / spark.life) * 2;
        spark.life -= 1 * spark.speed;

        if (spark.life <= 0 ) { // as they die, replace them
          this.sparks[i] = this.createSpark();
        }
      });
    },

    updateSize() {
      this.canvas.width = window.innerWidth / 2;
      this.canvas.height = window.innerHeight / 2;
    },

    fill(clr = 'black') {
      this.canvas.getContext('2d').fillStyle = clr;
      this.canvas.getContext('2d').fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    drawSphere: (ctx, point, radius, fill = true, stroke = true) =>{
      ctx.beginPath()
      ctx.arc(point.x, point.y, radius, Math.PI * 2, false)
      if (fill) ctx.fill()
      if (stroke) ctx.stroke()
    },

    lineTo : (ctx, x1,y1, x2, y2) =>{
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    },
    randomColor(op = 0.5) {
      const clr = `rgba(
        ${Math.round(Math.random() * 255)},
        ${Math.round(Math.random() * 255)},
        ${Math.round(Math.random() * 255)}, ${op})`;
      console.log(clr);
      return clr;
    },
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

});