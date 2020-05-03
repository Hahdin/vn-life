var app = new Vue({
  el: '#app',
  data() {
    return {
      proxyTimer: null,
      interval: null,
      canvas: null,
      timeObject: {
        time: null,
        pos: {
          x: 0,
          y: 0,
          reverse: false,
        }
      },
      bounds: {
        l: 0,
        r: 0,
        t: 0,
        b: 0
      },
      mouse: {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 0,
        maxRadius: 250,
        animating: false,
        draw: (ctx) => {
          this.mouseDraw(ctx);
        },
        animate: (ctx) => {
          this.mouse.animating = true;
        }
      }
    };
  },
  mounted() {
    this.proxyTimer = this.timer({ time: Date.now() });
    this.canvas = document.getElementById('canvas');
    this.canvas.addEventListener('mousemove', (e) => {
      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;
    });
    this.canvas.addEventListener('click', (e) => {
      const dc = this.canvas.getContext('2d');
      this.mouse.animate(dc);
    });
    this.updateSize();
    window.addEventListener('resize', this.updateSize);
    this.fill('rgba(0,0,0,0.2)');
    this.printTime();
  },

  methods: {

    updateSize() {
      this.canvas.width = this.bounds.r =window.innerWidth / 4;
      this.canvas.height = this.bounds.b =window.innerHeight / 8;
      this.timeObject.pos.x = this.canvas.width / 2;
      this.timeObject.pos.y = this.canvas.height / 2;
    },

    fill(clr = 'black') {
      this.canvas.getContext('2d').fillStyle = clr;
      this.canvas.getContext('2d').fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    timer(target) {
      const handler = {
        get: (target, prop) => {
          target[prop] = Date.now(); // set it
          return target[prop]; // return it
        }
      };
      return new Proxy(target, handler)
    },

    printTime(interval = 60) {
      this.interval = setInterval(() => {
        this.timeObject.time = this.proxyTimer ? this.proxyTimer.time : 0;
        this.drawTime();
      }, interval);
    },

    drawTime() {
      let fontsize = Math.round(this.canvas.width / 20);
      const dc = this.canvas.getContext('2d');
      fontsize = fontsize >= 10 ? fontsize : 10;
      this.fill(this.colorCycle());// clean slate
      this.drawDateTime(fontsize, dc);
      this.drawEpoch(fontsize, dc);
      this.mouse.draw(dc);
    },

    drawDateTime(fontsize, dc) {
      const d = new Date(this.timeObject.time);
      const dateString = `${d.toLocaleDateString()}`;
      const timeString = `${d.toLocaleTimeString()}`;
      let txtHeight = this.canvas.getContext('2d').measureText(d).actualBoundingBoxAscent;
      dc.font = `${fontsize}px Comic Sans MS`;
      dc.fillStyle = 'black';
      dc.fillText(dateString, this.canvas.width / 2, txtHeight + txtHeight / 2);
      dc.fillText(timeString, this.canvas.width / 2, this.canvas.height - txtHeight / 2);
    },

    drawEpoch(fontsize, dc) {
      let epoch = fontsize / 5;
      dc.fillStyle = 'rgba(255,255,255,1)';
      dc.font = `${fontsize - epoch}px Comic Sans MS`;
      this.setXY(this.timeObject.time);// update the text position
      dc.textAlign = 'center';
      dc.fillText(`${this.timeObject.time}`, this.timeObject.pos.x, this.timeObject.pos.y);
      dc.fillStyle = 'black';
      dc.fillText(`${this.timeObject.time}`, this.timeObject.pos.x + 0.5, this.timeObject.pos.y + 0.5);
    },

    mouseDraw(ctx) {
      ctx.beginPath();
      if (this.mouse.animating) {
        const pct = (this.mouse.maxRadius - (this.mouse.radius - 5)) / this.mouse.maxRadius
        ctx.fillStyle = this.randomColor(pct);
        this.mouse.radius += 10;
        ctx.arc(this.mouse.x, this.mouse.y, this.mouse.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
      }
      if (this.mouse.radius > this.mouse.maxRadius) {
        this.mouse.radius = 0;
        this.mouse.animating = false;
      }
    },

    setXY(date) {
      let size = this.canvas.getContext('2d').measureText(date).width;
      let nX = this.timeObject.pos.x + 1;
      let nY = this.timeObject.pos.y + 1;

      if (this.timeObject.pos.reverse) {
        nX = this.timeObject.pos.x - 1;
        if (nX <= this.bounds.l + size / 2) {
          this.timeObject.pos.reverse = false;
        } else {
          this.timeObject.pos.x = nX;
        }
      } else {
        if (nX >= this.bounds.r - size / 2) {
          this.timeObject.pos.reverse = true;
        } else {
          this.timeObject.pos.x = nX;
        }
      }
      this.timeObject.pos.y = nY < this.bounds.b ? nY : this.bounds.t;
    },

    colorCycle() {
      const date = new Date(this.timeObject.time);
      const scale = 255 / 10;// every 10 seconds
      const sec = date.getSeconds() + date.getMilliseconds() / 1000;
      let r = 0, g = 0, b = 0;
      let part = sec * scale;
      if (sec >= 0 && sec <= 10) {
        r = 255;
        g = Math.round(part);//add green
      } else if (sec <= 20) {
        part = (sec - 10) * scale;
        r = Math.round(255 - part);//sub red
        g = 255;
      } else if (sec <= 30) {
        part = (sec - 20) * scale;
        b = Math.round(part);// add blue
        g = 255;
      } else if (sec <= 40) {
        part = (sec - 30) * scale;
        g = Math.round(255 - part); // sub green
        b = 255;
      } else if (sec <= 50) {
        part = (sec - 40) * scale;
        r = Math.round(part); // add red
        b = 255;
      } else {
        part = (sec - 50) * scale;
        b = Math.round(255 - part); // sub blue
        r = 255;
      }
      return `rgb(${r},${g},${b})`;
    },

    randomColor(pct = 0.5) {
      const clr = `rgba(
        ${Math.round(Math.random() * 255)},
        ${Math.round(Math.random() * 255)},
        ${Math.round(Math.random() * 255)}, ${pct})`;
      console.log(clr);
      return clr;
    },
  },

  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
});