function inherit(p) {
	if (p == null)
		throw TypeError(); // p must be a non-null object
	if (Object.create) // If Object.create() is defined...
		return Object.create(p); // then just use it.
	var t = typeof p; // Otherwise do some more type checking
	if (t !== "object" && t !== "function")
		throw TypeError();
	function f() {
	}
	; // Define a dummy constructor function.
	f.prototype = p; // Set its prototype property to p.
	return new f(); // Use f() to create an "heir" of p.
}
function enumeration(namesToValues) {
	// This is the dummy constructor function that will be the return value.
	var enumeration = function() {
		throw "Can't Instantiate Enumerations";
	};
	// Enumerated values inherit from this object.
	var proto = enumeration.prototype = {
		constructor : enumeration, // Identify type
		toString : function() {
			return this.name;
		}, // Return name
		valueOf : function() {
			return this.value;
		}, // Return value
		toJSON : function() {
			return this.name;
		} // For serialization
	};
	enumeration.values = []; // An array of the enumerated value objects
	// Now create the instances of this new type.
	for (name in namesToValues) { // For each value
		var e = inherit(proto); // Create an object to represent it
		e.name = name; // Give it a name
		e.value = namesToValues[name]; // And a value
		enumeration[name] = e; // Make it a property of constructor
		enumeration.values.push(e); // And store in the values array
	}
	// A class method for iterating the instances of the class
	enumeration.foreach = function(f, c) {
		for ( var i = 0; i < this.values.length; i++)
			f.call(c, this.values[i]);
	};
	// Return the constructor that identifies the new type
	return enumeration;
}
var Coin = enumeration({
	Penny : 1,
	Nickel : 5,
	Dime : 10,
	Quarter : 25
});
var c = Coin.Dime; // This is an instance of the new class
print(c instanceof Coin); // => true: instanceof works
print(c.constructor == Coin); // => true: constructor property works
print(Coin.Quarter + 3 * Coin.Nickel); // => 40: values convert to numbers
print(Coin.Dime == 10); // => true: more conversion to numbers
print(Coin.Dime > Coin.Nickel); // => true: relational operators work
print(String(Coin.Dime) + ":" + Coin.Dime); // => "Dime:10": coerce to string