var ctx = c.getContext( '2d' )
    ,	w = c.width = window.innerWidth-20
    ,	h = c.height = window.innerHeight-20

    ,	goal = h
    ,	her = w/2

    ,	opts = {
        
        thoughtsParWidth: 1/6,
        problemsParSize: 1/1000,
        problemBaseDifficulty: 10,
        problemAddedDifficulty: 20,
        problemSize: 1,
        problemSpeed: 1.3,
        
        thoughtColor: 'hsl(hue,80%,50%)',
        problemColor: '#333',
        antiProblemColor: '#080808',
        repaintColor: 'rgba(0,0,0,.08)',
        
        willpower: .2,
        motivation: .99
    }
    ,	thoughts = []
    ,	problems = []
    ,	tick = 0;

function init(){
	ctx.fillStyle = opts.antiProblemColor;
	ctx.fillRect( 0, 0, w, h );
	ctx.lineWidth = 1.2;
}

function Thought(){
	this.reset();
}
Thought.prototype.reset = function(){
	this.field = ( 1 - Math.pow( Math.random(), .5 ) ) * her * ( Math.random() < .5 ? 1 : -1 ) + her;
	this.progress = 0;
	
	this.progressSpeed = .1;
}
Thought.prototype.step = function(){
	
	this.progressSpeed += opts.willpower;
	this.progressSpeed *= opts.motivation;
	
	var newProgress = this.progress + this.progressSpeed
		,	newField = this.field
		,	hitting = 0;
	
	for( var i = 0; i < problems.length; ++i ){
		var problem = problems[ i ];
		
		if( problem.existing && !( this.field < problem.field || this.field > problem.Field  ) ){
			
			if( this.progress < problem.area && newProgress > problem.area ){
				hitting = -1;
				newProgress = problem.area;
				newField = newField > her ? problem.field : problem.Field;
				problem.hit( -1 );
				i = problems.length;
			} else if( this.progress > problem.Area && newProgress < problem.Area ){
				hitting = 1;
				newProgress = problem.Area;
				newField = newField > her ? problem.Field : problem.field;
				problem.hit( 1 );
				i = problems.length;
			}
		}
		
	}
		
	if( hitting !== 0 ){
		this.progressSpeed *= -1;
	}
	
	ctx.strokeStyle = opts.thoughtColor.replace( 'hue', this.progress / goal * 360 + tick );
	ctx.beginPath();
	ctx.moveTo( this.field, this.progress );
	this.field = newField;
	this.progress = newProgress;
	ctx.lineTo( this.field, this.progress );
	ctx.stroke();
	
	if( this.progress > goal )
		this.reset();

}
function Problem(){
	this.reset();
}
Problem.prototype.reset = function(){
	
	this.dir = Math.random() < .5 ? 1 : -1;
	this.difficulty = opts.problemBaseDifficulty + opts.problemAddedDifficulty * Math.random() |0;
	this.size = opts.problemSize;
	
	this.field = ( this.dir === -1 ) ? w : -this.difficulty;
	this.area = Math.pow( Math.random(), .25 ) * ( h - opts.problemSize ) |0;
	
	this.fieldSpeed = this.dir * opts.problemSpeed;
	
	this.genCaps();
	
	this.existing = true;
}
Problem.prototype.genCaps = function(){
	this.Field = this.field + this.difficulty;
	this.Area = this.area + this.size;
}
Problem.prototype.drawRect = function(){
	ctx.fillRect( this.field, this.area, this.difficulty, this.size );
}
Problem.prototype.hit = function( dir ){
	
	this.area -= dir;
	
	if( Math.random() < .1 )
		this.reset();
}
Problem.prototype.step = function(){
	
	if( this.existing ){
	
	this.field += this.fieldSpeed;
	
	this.genCaps();
	
	this.drawRect();
	
	if( ( this.dir === -1 && this.Field <= 0 ) ||
			( this.dir ===  1 && this.field >= w ) )
		this.existing = false;
		
	} else if( Math.random() < .1 )
		this.reset();
}

function anim(){
	
	window.requestAnimationFrame( anim );
	
	tick += 1;
	
	if( Math.random() < .5 && thoughts.length < opts.thoughtsParWidth * w )
		thoughts.push( new Thought );
	
	if( Math.random() < .5 && problems.length < opts.problemsParSize * w * h )
		problems.push( new Problem );
	
	ctx.fillStyle = opts.repaintColor;
	ctx.fillRect( 0, 0, w, h );
	
	thoughts.map( function( thought ){ thought.step(); } );
	
	ctx.fillStyle = opts.antiProblemColor;
	problems.map( function( problem ){ problem.drawRect(); } );
	
	ctx.fillStyle = opts.problemColor;
	problems.map( function( problem ){ problem.step(); } );
}

init();
anim();

window.addEventListener( 'resize', function(){
	w = c.width = window.innerWidth;
	goal = h = c.height = window.innerHeight;
	
	her = w/2;

	init();
} );