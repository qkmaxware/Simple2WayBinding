function BindableScope(callback){
	
	//References
	var model = {};						//The object where all raw data is stored
	var binded_properties = {};			//An object with lists to all bound DOM elements
	var binded_expressions = [];		//A list of all bound DOM expressions
	var me = this;						//Self reference
	
	//Wrapper function for single object binding (internal functions below)
	this.bind = function(bindables){
		if(bindables instanceof Array){
			for(var i = 0; i < bindables.length; i++){
				bind(bindables[i]);
			}
		}else if (bindables instanceof Object){
			bind(bindables);
		}
	}
	
	//Parenting (to a proxy)
	Object.setPrototypeOf(this, new Proxy(model, {
		get: function(target, name){
			return target[name];
		},
		set: function(target, name, value){
			//Default behavior
			target[name] = value;
			
			//Refresh bound properties
			if(binded_properties[name]){
				var props = binded_properties[name];
				for(var i = 0; i < props.length; i++){
					setDomValue(props[i].el, value);
				}
			}
			
			//Refresh bound expressions
			for(var i = 0; i < binded_expressions.length; i++){
				setDomValue(binded_expressions[i].el, binded_expressions[i].expression(me));
			}
		}
	}));
	
	//JS to DOM 
	function setDomValue(dom, value){
		switch(dom.type){
			case 'checkbox':
				dom.checked = !!value;
				break;
			case 'radio':
				dom.checked = (value == dom.value);
				break;
			default:
				dom.value = value;
				dom.innerHTML = value;
		}
	}
	
	//DOM to JS binding
	function setModelValue(binding, value){
		me[binding.property] = value;
	}
	
	//Bind object to DOM
	function bind(bindable){
		if(!bindable.el || (!bindable.property &&!bindable.expression))
			return;
	
		var binding = Object.assign(bindable, {type: bindable.el.type});
		if(bindable['expression']){
			binded_expressions.push(binding);
			setDomValue(binding.el, binding.expression(me));
		}else{
			if(!binded_properties[bindable.property])
				binded_properties[bindable.property] = [];
		
			binded_properties[bindable.property].push(binding);
			setDomValue(binding.el, me[binding.property]);
			
			var onchange = function(evt){setModelValue(binding, evt.target.value)};
			binding.el.addEventListener("change", onchange);
			binding.el.addEventListener("input", onchange);
		}
	}
	
	if(callback)
		callback(this);
	
	return this;
}