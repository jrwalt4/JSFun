/**
 *	js library RW
 *	Contains utilities and classes for web programming
 *	Dependencies:
 *		jQuery version 10
 *
 *	Function Variable Naming Convention
 *		s* - string
 *		o* - object
 *		j*  - jQuery object
 *		a* - array
 *		f* - function/callback
 *		v* - varies
 *	
 */

var RW = {
	version:'1.0.0'
};

//jQuery.extend(RW,jQuery);

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

RW.objectify = function(jForm) {
	var props = {};
	jForm.children('input').each(
		function(i,el) {
			var $el = $(el);
			props[$el.attr('name')] = $el.val();
		});
	return props;
};

RW.confirm = function (vOptions, fYesCallback, fNoCallback) {
	if(jQuery.Event.prototype.isPrototypeOf(vOptions)) vOptions = vOptions.data;
	//console.info(vOptions);
	var options = {
		message:"Are you sure?",
		yes:{value:"OK"},
		no:{value:"Cancel"},
		width:300,
		height:200,
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
	var $background = $(document.createElement('div')).css({
		'position' : 'fixed',
		'width' : $window.width()+'px', 
		'height' : $window.height()+'px',
		'z-index' : 1000,
		'left' : '0',
		'top' : '0',
		'background' : '#000000',
		'opacity':0.4
	});
	// 
	var $div = $(document.createElement('div')).addClass('ActionBox').css({
		'position' : 'fixed',
		'width' : options.width+'px', 
		'height' : options.height+'px',
		'z-index' : 1001,
		'border' : '1px solid black',
		'box-shadow':'5px 5px 5px #888888',
		'text-align' : 'center',
		//  set the confirmation box to be in the center of the document
		'left' : Math.floor($(document.body).width() / 2) - Math.floor(options.width / 2)+'px',
		'top' : $window.height()/4,
		'background' : 'whitesmoke'
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
		$div.remove();
		$window.trigger(ev.data);
	}

	// create the elements that makeup the message box and add them to the document
	var $message = $(document.createElement('p')).text(options.message);
	var $yes = $(document.createElement('button')).text(options.yes.value).css('bottom','10px')
		.click(fYesCallback).click('yes',dismiss);
	var $no = $(document.createElement('button')).text(options.no.value).css('bottom','10px')
		.click(fNoCallback).click('no',dismiss);
	$div.append($message).append($yes).append($no);
	$(document.body).append($background).append($div);
	return $window;
};

/*	Class RW.Object	*/
RW.Object = function (oProps) {
	if(oProps) {
		// if RW.Object is used as a blank prototype this section is skipped
		jQuery.extend(this,oProps);
		this.getId();
		return this;
	}
};

/*
RW.Object.prototype = Object.create({
	version:{get:function version() {return '1.0.0'}},
});
//*/

RW.Object.prototype.version = '1.0.0';

RW.Object.prototype.set = function (vKey,vVal) {
	if(vVal && typeof vKey == 'string') {
		this[vKey] = vVal;
	}
	if(typeof vKey == 'object') {
		$.extend(this,vKey);
	}
	return this;
};

RW.Object.prototype.getId = function() {
	this._id = (new Date()).getTime();
}

/*	Class RW.Sub - example subclass to RW.Object	*/
RW.Sub = function (oProps) {
	if(RW.Object.call(this,oProps)) {
		// further instantiation
		return this;
	}
};

RW.Sub.prototype = new RW.Object;

/*	RW.DoodlePad - an HTML <canvas> element that let's you draw with the mouse and upload image.	*/
RW.DoodlePad = function DoodlePad(cvs) {
	//get this code from home
};

RW.DoodlePad.prototype = new RW.Object;

/*	RW.ActionBox	*/
RW.ActionBox = function (oProps) {
	/* oProps must be an object with structure:
		- message: "the text to display"
		- buttons: [{name,value,
			
	*/
	this.$div = $(document.createElement('div')).addClass('ActionBox');
};

RW.ActionBox.prototype = new RW.Object;

/*	RW.games library	*/
RW.games = {};

/*	Class RW.games.Card	*/
RW.games.Card = function(oProps) {
	if(RW.Object.call(this,oProps)) {
		var src = (typeof oProps == 'string') ? oProps : oProps.img;
		this.$img = $(document.createElement('img')).attr('src','./img/cards/'+src);
		$(document.body).append(this.$img);
		return this;
	}
}

RW.games.Card.prototype = new RW.Object;
