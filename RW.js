var RW = {'version':'1.0.0'};

/*	Class RW.Object		*/
RW.Object = function(props) {
	if(this != undefined && props) {
		console.log("Creating new RW.Object");
		// initialize;
		return this;
	}
};

RW.Object.prototype = {};
RW.Object.prototype.version = '1.0.0';

RW.Object.prototype.set = function(key,val) {
	if(val) {
		console.log('Setting '+key);
		this[key] = val;
	}
};

/*	Class RW.Sub		*/
RW.Sub = function(props) {
	// Call parent "constructor", which will provide parent's instantiation of Object properties.  Class properties come with protoype.
	// Must give is a ClassName, or it will not provide instantiation.
	if(RW.Object.call(this,props)) {
		this.set('name',props.name,'Reese');
		this.set('title', props.title,'Engineer');
		return this;
	}
};

RW.Sub.prototype = new RW.Object;

/*	Class RW.GrandSub		*/
RW.GrandSub = function(props) {
	if(RW.Sub.call(this,props)) {
		this.set('age',props.age,21);
		return this;
	}
};

RW.GrandSub.prototype = new RW.Sub;

