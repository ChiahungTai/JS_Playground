function inherit(C, P) {
	C.prototype = new P();
}

//The parent constructor
function Parent(name) {
	this.name = name || "Adam";
}
Parent.prototype.say = function() {
	return this.name;
};

function Child(name) {}
inherit(Child, Parent); 

var kid = new Child();
print(kid.say());

