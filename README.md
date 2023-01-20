# RubiksCubeP5EasyCam

## Internal representation
```
        U T S
        V   Z                       Orange
        W X Y 
  J Q P a h g j q p A H G 
  K   O b   f k   o B   F     Green White Blue Yellow
  L M N c d e l m n C D E    
        y x w
        z   v                       Red
        s t u 
```


Nu kan jag ange rotationerna och har full koll på vilken av de 24 som ligger närmast nuvarande rotation  
https://npm.runkit.com/quaternion  
https://en.wikipedia.org/wiki/Quaternion  
https://www.npmjs.com/package/quaternion  

```
var Quaternion = require("quaternion")

var rad = Math.PI / 180

const f = (a,b,c,d) => new Quaternion([a/360,b/360,c/360,d/360])
const g = (d3) => new Quaternion(d3)
const angle = (a,b) => 2*Math.asin(g(a.div(b).imag()).norm())/rad
const fe = (a,b,c) => Quaternion.fromEuler(a*rad, b*rad, c*rad, 'ZXY')

const x = fe(0,0,0) // 1 0 0 0 
angle(x,fe(0,0,0)) // 0
angle(x,fe(90,0,0)) // 89.999
angle(x,fe(180,0,0)) // 180.000
angle(x,fe(270,0,0)) // 90.000
angle(x,fe(0,90,0)) // 90
angle(x,fe(0,0,90)) // 89.999
angle(x,fe(90,90,0)) // 120
angle(x,fe(90,0,90)) // 120
angle(x,fe(0,90,90)) // 120
angle(x,fe(90,90,90)) // 180
```