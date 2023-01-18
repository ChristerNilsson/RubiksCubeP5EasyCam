// TODO #########
// vinkelkontroll 
// återställ
// undo 
// scramble 
// visa hjälp, även för macros
// transparens

const range = _.range
const log = console.log

const COLORS = "#FFF #00F #FF0 #0F0 #FA5 #F00".split(' ') // W B Y G O R
const ALPHABET = 'abcdefgh jklmnopq ABCDEFGH JKLMNOPQ STUVWXYZ stuvwxyz'
const SWAPS = { // See README.md
	W: 'aceg bdfh wjWN xkXO ylYP',
	B: 'lnpj moqk euAY fvBZ gwCS',
	Y: 'GECA HFDB nsJS otKT puLU',
	G: 'PNLJ QOMK EyaU FzbV GscW',
	O: 'YWUS ZXVT ajGJ hqHQ gpAP',
	R: 'suwy tvxz LClc MDmd NEne'
}

const cube = _.map(range(54), (i)=> Math.floor(i/9))
const SIZE = 60
let namn // t ex RBW

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

function preload() {f = loadFont('https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf')}

function txt(state,i,color) {
	fill(color)
	text(nfs(Math.round(360*state.rotation[i]), 1, 0),25,45+40*i)
}

function hud() {
	easycam.beginHUD()
	// noLights()
	let state = easycam.getState()
	txt(state,0,"blue")
	txt(state,1,"green")
	txt(state,2,"red")
	txt(state,3,"white")
	if (namn) text(namn.slice(0,3),25,45+40*4)
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
	easycam.setState(state, 250)
	easycam.state_reset = state
}

function btn(lbl,x,y,index) { createButton(lbl).position(x,y).mousePressed(() => update(index)) }

setup = () => {
	createCanvas(500, 500, WEBGL)
	easycam = createEasyCam()
	state = { distance: 1000, center  : [0, 0, 0], rotation: [0,0,0,1] }
	easycam.setState(state, 1000)
	easycam.state_reset = state

	btn ('white', 340,510, 0)
	btn ('red',   180,510, 1)
	btn ('green',  20,510, 2)
	btn ('yellow',420,510, 3)
	btn ('orange',260,510, 4)
	btn ('blue',  100,510, 5)

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

	createButton('save').position(430,550).mousePressed(saveMacros) 
	input = createElement('textarea').position(20,540).id('macros')
	input.attribute('rows',10)
	input.attribute('cols',50)
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
	macros = {}
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
	COL = namn[index]
	col = COL.toLowerCase() // colors
	log(col,COL,namn)

	if (!(COL in SWAPS)) return
	for (const word of SWAPS[COL].split(' ')) {
		const [i,j,k,l] = _.map(word, (w) => ALPHABET.indexOf(w))
		const [a,b,c,d] = LETTER != key ? [l,i,j,k] : [j,k,l,i]
		let temp = [cube[i],cube[j],cube[k],cube[l]]
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

function keyTyped (event) {
	if (event.target.id=='macros') return
	if ("UFRDBLufrdbl".includes(key)) turn(key)
	if (key in macros) executeMacro(key)
}

// invHash = {
// 	0 : ["BYO","WRBYOG"],
// 101 : ["BYO","WRBYOG"],
// 103 : ["BOW","WRBYOG"],
// 105 : ["BWR","WRBYOG"],
// 107 : ["BRY","WRBYOG"],

// 141 : ["GOY","WRBYOG"],
// 145 : ["GRW","WRBYOG"],
// 143 : ["GWO","WRBYOG"],
// 147 : ["GYR","WRBYOG"],

// 716 : ["OWB","WRBYOG"],
// 736 : ["OGW","WRBYOG"],
// 756 : ["OYG","WRBYOG"],
// 776 : ["OBY","WRBYOG"],

// 316 : ["RGY","GOYBRW"], // ok
// 336 : ["RYB","RBWOGY"], // ok
// 356 : ["RBW","GRWBOY"], // ok
// 376 : ["RWG","GWOBYR"], // ok

// 314 : ["WGR","WOGYRB"], // ok
// 334 : ["WRB","WGRYBO"], // ok
// 354 : ["WBO","WRBYOG"], // ok
// 374 : ["WOG","WBOYGR"], // ok

// 714 : ["YOB","YBRWGO"], // ok
// 734 : ["YGO","WRBYOG"],
// 754 : ["YRG","WRBYOG"],
// 774 : ["YBR","WRBYOG"],
// }

