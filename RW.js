/**
 *	js library RW
 *	Contains utilities and classes for web programming
 *	Dependencies:
 *		jQuery version 10
 *
 *
 *	Function Variable Naming Convention
 *		s* - string
 *		o* - object
 *		j*  - jQuery object
 *		a* - array
 *		b* - boolean
 *		f*  - function/callback
 *		v* - varies
 *	
 */

/*------------		Compatibility		------------------------*/

/*------------		Function.bind		------------------------
 * Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind 
 */
if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5
			// internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 1), 
			fToBind = this, 
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(this instanceof fNOP && oThis
					? this
					: oThis,
					aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
}

/*------------		Array.forEach		------------------------*/
if (!Array.prototype.forEach) {
	Array.prototype.forEach = function(fCallback) {
		if (typeof fCallback != 'function') throw new TypeError('Function is not callable');
		for(var i = 0 ; i < this.length ; i++) {
			fCallback(this[i],i);
		}
	}
}

/*------------		RW declaration		------------------------*/
var RW = {
	version:'1.0.0'
};

/*------------		Functions			------------------------*/
RW.include = function(sInc) {
	if($("script [src='"+sInc+"']").length == 0) {
		console.log("Including '"+sInc+"'");
		$(document.head).append($(document.createElement('script')).attr('src',sInc));
	} else {
		console.log("'"+sInc+"' is already included");
	}
};

RW.addslashes = function (string) {
	return string.replace(/\\/g, '\\\\').
		replace(/\u0008/g, '\\b').
		replace(/\t/g, '\\t').
		replace(/\n/g, '\\n').
		replace(/\f/g, '\\f').
		replace(/\r/g, '\\r').
		replace(/'/g, '\\\'').
		replace(/"/g, '\\"');
};

/*	Create an object from an HTMLFormElement with form fields and values as properties	*/
RW.objectify = function(jForm) {
	if(!(jQuery.prototype.isPrototypeOf(jForm))) {
		try {
			jForm = $(jForm);
		} catch(e) {
			console.log(e);
			return console.log('no form to objectify');
		}
	}
	var props = {};
	jForm.children('input').each(
		function(i,el) {
			var $el = $(el);
			props[$el.attr('name')] = $el.val();
		});
	return props;
};

RW.confirm = function (vOptions, fYesCallback, fNoCallback) {
	// allow RW.confirm to be called from an event with data attached
	if(jQuery.Event.prototype.isPrototypeOf(vOptions)) vOptions = vOptions.data;

	// keep button from being clicked again
	if (window.event) {
		$(window.event.target).blur();
	}
	var confBox = new RW.ConfirmationBox(vOptions);

	// return the jQuery object that comes from RW.ActionBox.show() so event handlers can be attached
	return confBox.show();
};

/*------------		Classes			------------------------*/
/*------------	RW.Object			------------------------*/
RW.Object = function () {
	this._id;
	this.bound = {}; // a holder for the functions that will be bound to the object
	return this;
};

RW.Object.prototype = {
	version: '1.0.0',
	init: function() {
		this._id = this.getId();
		this.bind();
		return this;
	},
	getId: function() {
		if (this._id) return this._id;
		else {
			this._id = (new Date()).getTime()+'';
			return this._id;
		}
	},
	bind: function bind () {
		for (prop in this) {
			if (typeof this[prop] == 'function' 
				&& !Object.prototype.hasOwnProperty(prop)
				&& prop != 'bind'
				&& prop != 'init') {
				this.bound[prop] = this[prop].bind(this);
			}
		}
	},
	toString: function() {
		return "["+this._id+" RW.Object]";
	}
};

/*------------	RW.Sub				------------------------
 * Example subclass to RW.Object
 * Call the parent constructor function using "RW.Object.call(this)" 
 * Override the "init()" method but call the parent method from within 
 * "RW.Object.prototype.init.call(this)"
 */
RW.Sub = function (oProps) {
	RW.Object.call(this); // instantiate instance variables
	return this;
	// further instantiation goes in ...prototype.init()
};

RW.Sub.prototype = new RW.Object;

RW.Sub.prototype.init = function(oProps) {
	RW.Object.prototype.init.call(this);
	jQuery.extend(this,oProps);
	return this;
};

/*------------	RW.DoodlePad			------------------------*
 * An HTML <canvas> element that let's you draw with the mouse
 * and use the image.	
 */

RW.DoodlePad = function DoodlePad(cvs) {
	RW.Object.call(this);
	//get this code from home
};

RW.DoodlePad.prototype = new RW.Object;

RW.DoodlePad.prototype.init = function(oOptions) {
	RW.Object.prototype.init.call(this);
	//
};

/*------------	RW.ActionBox			------------------------*/
/* A box that appears in the center of the screen that asks the user to provide 
 * information or select an options before continuing
 */
RW.ActionBox = function (oOptions) {
	/* oOptions must be an object with structure:
	 *	- message: "the text to display"
	 *	- buttons: [{id, value, (callback)},...]
	 *	- inputs: ["name",...]
	 */
	RW.Object.call(this);
	RW.Object.prototype.init.call(this);
	var options = {};
	if (oOptions) {
		switch(typeof oOptions) {
			case 'object':
				jQuery.extend(options,this.defaults,oOptions);
				break;
			case 'string':
				jQuery.extend(options,this.defaults);
				options.message = oOptions;
				break;
			default:
				console.log('oObject disregarded');
		}
	} else {
		jQuery.extend(options,this.defaults);
	}
	this.$wrapper = $(document.createElement('div')).addClass(options.cssClass).css('z-index',2);
	this.$message = $(document.createElement('p')).text(options.message);
	this.$buttons = new $();
	if (options.buttons.length != 0) {
		options.buttons.forEach(this.bound.addButton);
	}
	this.$wrapper.append(this.$message).append(this.$buttons);
	if (options.required) {
		this.$background = $(document.createElement('div'))
			.addClass('BackgroundShade').css('z-index',1);
	}
	this.options = options;
	return this;
};

RW.ActionBox.prototype = new RW.Object;

RW.ActionBox.prototype.defaults = {
	message:"Action Required",
	buttons:[{id:'dismiss',value:'dismiss'}],
	cssClass:'ActionBox',
	required:true
};

RW.ActionBox.prototype.addButton = function (button,i) {
	var id = (button.id) ? button.id : this.$buttons.length;
	var value = (button.value) ? button.value : this.$buttons.length;
	var $newButton = $(document.createElement('button')).attr('id',id).text(value);
	if (button.callback) {
		$newButton.click(button.callback);
	}
	this.$buttons = this.$buttons.add($newButton);
	return $newButton;
};

RW.ActionBox.prototype.message = function(sMessage) {
	if(sMessage && typeof sMessage == 'string') {
		this.$message.text(sMessage);
		return this;
	} else return this.$message.text();
}

RW.ActionBox.prototype.show = function () {
	$(window).on('resize',this.bound.recenter);
	$(document.body).append(this.$wrapper);
	this.$buttons.click(this.bound.dismiss);
	if(this.$background) $(document.body).append(this.$background);
/*	ActionBox.recenter requires the element to be in the document before 'width' can be calculated	*/
	this.recenter();
	return this.$wrapper;
}

RW.ActionBox.prototype.dismiss = function(ev) {
	if (ev && jQuery.Event.prototype.isPrototypeOf(ev)) {
		this.$wrapper.trigger(ev.target.id);
	}
	$(window).off('resize',this.bound.recenter)
	this.$buttons.off('click',this.bound.dismiss);
	this.$wrapper.remove();
	if(this.$background) this.$background.remove();
	return this;
}

RW.ActionBox.prototype.recenter = function () {
	var $window = $(window);
	if(this.$background) this.$background.width($window.width()).height($window.height());
	var left = Math.floor($(document.body).width() / 2) - Math.floor(this.$wrapper.width() / 2);
	this.$wrapper.css({
		'left':left,
		'top':$window.height()/4
	});
	return this.$wrapper;
}

/*------------	RW.ConfirmationBox			------------------------*/

RW.ConfirmationBox = function(oOptions) {
	RW.ActionBox.call(this,oOptions);//jQuery.extend(true,{},RW.ConfirmationBox.prototype.defaults,oOptions));
	return this;
}
//*
RW.ConfirmationBox.prototype = new RW.ActionBox;

RW.ConfirmationBox.prototype.defaults = {};
jQuery.extend(RW.ConfirmationBox.prototype.defaults,RW.ActionBox.prototype.defaults,{
	message:"Are you sure?",
	buttons:[
		{id:'yes',value:"OK"},
		{id:'no',value:"Cancel"}
	]
});

/*------------	RW.games library			------------------------*/
RW.games = {
	version:'1.0.0'
};

/*------------	RW.games.Card		------------------------*/
RW.games.Card = function(oProps) {
	RW.Object.call(this)
	return this;
}

RW.games.Card.prototype = new RW.Object;

RW.games.Card.prototype.init = function(oProps) {
	RW.Object.prototype.init.call(this);
	var src = (typeof oProps == 'string') ? oProps : oProps.img;
	this.$img = $(document.createElement('img')).attr('src','./img/cards/'+src);
	$(document.body).append(this.$img);
	return this;
}

/*
-----------------------	DELETED CODE	----------------------------------------
RW.confirm = function(vOptions) {
	var options = {
		message:"Are you sure?",
		yes:{value:"OK"},
		no:{value:"Cancel"},
		width:300,
		height:200
	};
	if (typeof vOptions == 'object') {
		jQuery.extend(options,vOptions);
	}
	if (typeof vOptions == 'string') {
		options.message = vOptions;
	}
	// shade the background with a transparent <div> that prevents interaction with the rest
	// of the document until the 
	var $window = $(window);
	var $background = $(document.createElement('div')).addClass('BackgroundShade')
		.css({
		width : $window.width()+'px', 
		height : $window.height()+'px',
		//opacity: 0.4, filter: 'alpha(opacity=40)',    // should be declared in stylesheet
		left : 0,
		top : 0,
		'z-index' : 1000
	});
	// 
	var $div = $(document.createElement('div')).addClass('ActionBox')
		.css({
		'width' : options.width+'px', 
		'height' : options.height+'px',
		'z-index': 1001,
		//  set the confirmation box to be in the center of the document
		'left' : Math.floor($(document.body).width() / 2) - Math.floor(options.width / 2)+'px',
		'top' : $window.height()/4,
	});

	// keep the message box in the center and the background in place when the window is resized
	function window_adjust() {
		$background.width($window.width()).height($window.height());
		var left = Math.floor($(document.body).width() / 2) - Math.floor($div.width() / 2);
		$div.css({
			'left':left,
			'top':$window.height()/4
		});
	}
	$window.on('resize',window_adjust);

	// cleanup function once the option is chosen
	function dismiss(ev) {
		$window.off('resize',window_adjust);
		$background.remove();
		if(options[ev.target.id].callback) options[ev.target.id].callback();
		$div.trigger(ev.target.id);
		$div.remove();
	}

	// create the elements that makeup the message box and add them to the document
	var $message = $(document.createElement('p')).text(options.message);
	var $yes = $(document.createElement('button')).text(options.yes.value).attr('id','yes');
	var $no = $(document.createElement('button')).text(options.no.value).attr('id','no');
	$div.append($message).append($yes).append($no).find('button').click(dismiss);
	$(document.body).append($background).append($div);
	return $div;
*/
