// TODO #########
// vinkelkontroll
// återställ
// undo
// scramble
// visa hjälp, även för macros
// transparens

const range = _.range
const log = console.log
const assert = (a,b) => {
	if (!_.isEqual(a,b)) {
		log('assert failed')
		log(' ',a)
		log(' ',b)
		// debug.assert(a==b)
	}
}

function adapt (q) {
	return [q.x,q.y,q.z,q.w]
}

const rad = Math.PI / 180
const g = (d3) => new Quaternion(d3)
const angle = (a,b) => {
	const aa = Quaternion({x:a[0], y:a[1], z:a[2], w:a[3]})
	const bb = Quaternion({x:b[0], y:b[1], z:b[2], w:b[3]})
	return 2*Math.asin(g(aa.div(bb).imag()).norm())/rad
}
const fe = (a,b,c) => Quaternion.fromEuler(45*a*rad, 45*b*rad, 45*c*rad, 'ZXY')

const x = adapt(fe(0,0,0)) // 1 0 0 0 
log(x)

const COLORS = "#FFF #00F #FF0 #0F0 #FA5 #F00".split(' ') // W B Y G O R
const ALPHABET = 'abcdefgh jklmnopq ABCDEFGH JKLMNOPQ STUVWXYZ stuvwxyz'
const SWAPS = { // See README.md
	W: 'aceg bdfh wjWN xkXO ylYP',
	B: 'lnpj moqk euAY fvBZ gwCS',
	Y: 'ACEG BDFH nsJS otKT puLU',
	G: 'JLNP KMOQ EyaU FzbV GscW',
	O: 'SUWY TVXZ ajAJ hqHQ gpGP',
	R: 'suwy tvxz LClc MDmd NEne'
}

let cube 
reset()
const SIZE = 60
let namn // t ex RBW

//const R =[adapt(fe(3,5,6)),     adapt(fe(1,5,6)),     adapt(fe(1,-1,2)),     adapt(fe(5,7,2)),    "BWGY"]
//const O =[adapt(fe(7,3,2)),     adapt(fe(1,3,2)),     adapt(fe(3,3,2)),     adapt(fe(5,3,2)),    "WBYG"]

const W =[[-123, -70,-167, 286],[ 287, 164,  72,-122],[ 288, 167, -67, 120],[ 117,  68,-164, 290],"BOGR"]
const R =[[-199, 149, -37, 258],[ 258,  36,-154,-196],[-161,-196, 253,  31],[  37,-254, 197,-159],"BWGY"]
const G =[[ -27,-127,  86, 325],[ -81,-325,  33, 127],[ -83,-318, -40,-141],[ -34,-135, -89,-320],"WOYR"]
const Y =[[ -66, 124,-286,-167],[-167, 287,-124, -63],[-165, 286, 126,  68],[ -71, 117, 288, 166],"GOBR"]
const O =[[-199, 154,  33,-255],[ -37, 254, 199,-154],[ 153, 194, 259,  39],[ 249,  29, 156, 206],"WBYG"]
const B =[[ 131, -34,-321,  92],[ 131, -30, 322, -89],[-322,  87,-130,  39],[-319,  96, 131, -42],"RYOW"]
const vectors  = [W,R,G,Y,O,B]
const rotation = [0,0,0,0,0,0] // 0..3

let easycam
let macros = {}
let input
let frozen = [0,0,0,1]

function reset() {
	cube = _.map(range(54), (i)=> Math.floor(i/9))
}
log(cube.slice(0,9))
log(cube.slice(9,18))
log(cube.slice(18,27))
log(cube.slice(27,36))
log(cube.slice(36,45))
log(cube.slice(45,54))

function preload() {f = loadFont('https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf')}

function txt(state,i,color) {
	fill(color)
	text(nfs((state.rotation[i]), 1, 3),25,45+40*i)
}// *360

// function dist4D(a,b) {
// 	let summa = 0
// 	// log(a,b)
// 	for (const i of range(4)) {
// 		const d = a[i] - 360*b[i]
// 		summa += d * d
// 	}
// 	return Math.round(Math.sqrt(summa))
// }
// assert(dist4D([-120,-67,-141,284],[-130/360,-57/360,-151/360,294/360]),20)
// assert(dist4D([-130,-57,-151,294],[-130/360,-57/360,-151/360,294/360]),0)


function closest(rotation) {
	if (!vectors) return [0,0],0
	let best = [0,0]
	let value = 999999
	// const rotation2 = [rotation[0]/360, rotation[1]/360, rotation[2]/360, rotation[3]/360]
	for (const i of range(6)) {
		for (const j of range(4)) {
			const arr = vectors[i][j]
			const dst = angle([arr[0]/360,arr[1]/360,arr[2]/360,arr[3]/360],rotation)
			if (dst < value) {
				value = dst
				best = [i,j]
			}
		}
	}
	return [best,value]
}
assert(closest([-130/360,-57/360,-151/360,294/360]),[[0,0],23])

function makeNamn2(index,j) {
	const four = vectors[index][4]
	// const ri = rotation[index]
	let res = "WRGYOB"[index] + (four+four).slice(j,j+2)
	for (const i in range(3)) {
		res += opposite(res[i])
	}
	return res
}

function hud() {
	easycam.beginHUD()
	// noLights()
	let state = easycam.getState()
	txt(state,0,"blue")
	txt(state,1,"green")
	txt(state,2,"red")
	txt(state,3,"white")
	if (namn) text(namn.slice(0,3),500,30)
	//text(angle(frozen,state.rotation),25,45+40*4)
	
	const [[i,j],dst] = closest(state.rotation)
	if (dst < 40) {
	 	namn = makeNamn2(i,j)
		// frozen = vectors[i][j]
		// rotation[i] = j
	} else {
		namn = ''
	}
	
	text(Math.round(dst,3),25,45+40*5)

	easycam.endHUD()
}

function opposite(letter) {
	const t= {W:'Y', R:'O', B:'G', Y:'W', O:'R', G:'B'}
	return t[letter]
}

function makeNamn(index) {
	const four = vectors[index][4]
	const ri = rotation[index]
	let res = "WRGYOB"[index] + (four+four).slice(ri,ri+2)
	for (const i in range(3)) {
		res += opposite(res[i])
	}
	return res
}

function update(index) {
	namn = makeNamn(index)
	state.rotation = vectors[index][rotation[index]]
	rotation[index] = (rotation[index]+1) % 4
	frozen = _.cloneDeep(state.rotation)
	easycam.setState(state, 250)
	easycam.state_reset = state
}

function btn(lbl,x,y,index) { createButton(lbl).position(x,y).size(60).mousePressed(() => update(index)) }

setup = () => {
	createCanvas(windowWidth, windowHeight, WEBGL)
	easycam = createEasyCam()
	log(easycam)


	state = { distance: 1000, center: [0, 0, 0], rotation: adapt(fe(3,5,2)) }
	easycam.setState(state, 1000)
	easycam.state_reset = state

	btn ('white', 420,40, 0)
	btn ('red',   420,70, 1)
	btn ('green', 500,100, 2)
	btn ('yellow',500,40, 3)
	btn ('orange',500,70, 4)
	btn ('blue',  420,100, 5)

svekub = `SveKub
U' L' U L - U F U' F'
U R U' R' - U' F' U F
F - R U R' U' - F'
R U R' U R U2 R'
R' F R' B2 - R F' R' B2 - R2
R U' - R U - R U - R U' - R' U' R2`

standard = `Standard
r u R U
u r U R U F u f
U L u l u f U F
f r u R U F
u r U L u R U l
u R U r`

	createButton('save').position(420,10).size(60).mousePressed(saveMacros) 
	input = createElement('textarea').position(120,10).id('macros')
	input.attribute('rows',7)
	input.attribute('cols',35)
	input.value(svekub)

	saveMacros()
	log(macros)

	textFont(f)
	textSize(32)
	stroke(50,50,52)
	strokeWeight(0.5)
}

function saveMacros () {
	const lines = input.value().replaceAll(' ','').replaceAll('-','')
		.replaceAll("U'",'u').replaceAll("D'",'d')
		.replaceAll("R'",'r').replaceAll("L'",'l')
		.replaceAll("F'",'f').replaceAll("B'",'b')
		.replaceAll("U2",'uu').replaceAll("D2",'dd')
		.replaceAll("R2",'rr').replaceAll("L2",'ll')
		.replaceAll("F2",'ff').replaceAll("B2",'bb')
		.split('\n').slice(1)
	for (i of range(lines.length)) {
		macros[i] = lines[i]
	}
	log(macros)
}

draw = function() {
	background(32)
	for (const side in range(6)) { // cube
		rotateX(HALF_PI * [1,1,1,1,0,0][side])
		rotateZ(HALF_PI * [0,0,0,0,1,2][side])
		strokeWeight(3)
		stroke("black")
		for (const k of range(9)) {
			const [i,j] = [[0,0],[2,0],[4,0],[4,2],[4,4],[2,4],[0,4],[0,2],[2,2]][k]  // side
			beginShape()
			fill(COLORS[cube[9*side+k]])
			_.map([[0,0],[2,0],[2,2],[0,2]], ([x,z]) => vertex(SIZE*(i+x-3), 3*SIZE, SIZE*(j+z-3)))
			endShape()
		}
		if (side ==5) stroke("black") // eg red
		if (side ==3) stroke("green")
		if (side ==2) stroke("blue")
		cylinder(2,500,2)
	}
	hud()
}

function turn(key) { // sides
	LETTER = key.toUpperCase()
	const index = 'UFRDBL'.indexOf(LETTER)
	const COL = namn[index]
	const col = COL.toLowerCase() // colors
	log(col,COL,namn)

	if (!(COL in SWAPS)) return
	for (const word of SWAPS[COL].split(' ')) {
		const [i,j,k,l] = _.map(word, (w) => ALPHABET.indexOf(w))
		const [a,b,c,d] = LETTER != key ? [l,i,j,k] : [j,k,l,i]
		const temp = [cube[i],cube[j],cube[k],cube[l]]
		log('xx',a,b,c,d,i,j,k,l)
		// [cube[a],cube[b],cube[c],cube[d]] = [cube[i],cube[j],cube[k],cube[l]]
		cube[a] = temp[0]
		cube[b] = temp[1]
		cube[c] = temp[2]
		cube[d] = temp[3]
	}
}

function executeMacro(key) {
	log('execute',macros[key])
	for (letter of macros[key]) {
		turn(letter)
	}
}

function scramble(n=50) {
	reset()
	let s = ""
	for (const i in range(n)) {
		const ch = _.sample('UFRDBLufrdbl')
		s+=ch
		log({ch})
		turn(ch)
	}
	log('scramble',s)
}

function keyTyped (event) {
	if (event.target.id=='macros') return
	if (key=='x') scramble(5)
	if (key=='Z') reset()
	if ("UFRDBLufrdbl".includes(key)) turn(key)
	if (key in macros) executeMacro(key)
}

// let x0=0
// let y0=0
// let z0=0
// function keyPressed() {
// 	log(key)
// 	if (key == 'ArrowDown') y0+=-1
// 	if (key == 'ArrowUp') y0+=1
// 	if (key == 'ArrowLeft') x0+=-1
// 	if (key == 'ArrowRight') x0+=1
// 	if (key == 'PageUp') z0+=-1
// 	if (key == 'PageDown') z0+=1
// 	log(x0,y0,z0,adapt(fe(x0,y0,z0)))

// 	state.rotate = adapt(fe(x0,y0,z0))

// 	easycam.setState(state, 250)
// 	easycam.state_reset = state
// }