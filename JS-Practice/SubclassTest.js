/* Some test code for the book
 * Oreilly.JavaScript.The.Definitive.Guide.6th.Edition.Apr.2011.
 * Chapter 9.7 Subclass.
 */
/*
 * Copy the enumerable properties of p to o, and return o.
 * If o and p have a property by the same name, o's property is overwritten.
 * This function does not handle getters and setters or copy attributes.
 */
function extend(o, p) {
	for (prop in p) { // For all props in p.
		o[prop] = p[prop]; // Add the property to o.
	}
	return o;
}

// inherit() returns a newly created object that inherits properties from the
// prototype object p. It uses the ECMAScript 5 function Object.create() if
// it is defined, and otherwise falls back to an older technique.
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

// A simple function for creating simple subclasses
function defineSubclass(superclass, // Constructor of the superclass.
constructor, // The construtor for the new subclass.
methods, // Instance methods: Copyed to prototype.
statics // Class properties: Copyed to constructor.
) {
	// Set up the prototype object of the subclass
	constructor.prototype = inherit(superclass.prototype);
	constructor.prototype.constructor = constructor;
	// Copy the methods and statics as we would for a regular class.
	if (methods)
		extend(constructor.prototype, methods);
	if (statics)
		extend(constructor, statics);
	return constructor;
}
// We can also do this as a method of the superclass constructor
Function.prototype.extend = function(constructor, methods, statics) {
	return defineSubclass(this, constructor, methods, statics);
};

function Set() { // This is the constructor
	this.values = {}; // The properties of this object hold the set
	this.n = 0; // How many values are in the set
	this.add.apply(this, arguments); // All arguments are values to add
}
// Add each of the arguments to the set.
Set.prototype.add = function() {
	for ( var i = 0; i < arguments.length; i++) { // For each argument
		var val = arguments[i]; // The value to add to the set
		var str = Set._v2s(val); // Transform it to a string
		if (!this.values.hasOwnProperty(str)) { // If not already in the set
			this.values[str] = val; // Map string to value
			this.n++; // Increase set size
		}
	}
	return this; // Support chained method calls
};
// Remove each of the arguments from the set.
Set.prototype.remove = function() {
	for ( var i = 0; i < arguments.length; i++) { // For each argument
		var str = Set._v2s(arguments[i]); // Map to a string
		if (this.values.hasOwnProperty(str)) { // If it is in the set
			delete this.values[str]; // Delete it
			this.n--; // Decrease set size
		}
	}
	return this; // For method chaining
};
// Return true if the set contains value; false otherwise.
Set.prototype.contains = function(value) {
	return this.values.hasOwnProperty(Set._v2s(value));
};
// Return the size of the set.
Set.prototype.size = function() {
	return this.n;
};
// Call function f on the specified context for each element of the set.
Set.prototype.foreach = function(f, context) {
	for ( var s in this.values)
		// For each string in the set
		if (this.values.hasOwnProperty(s)) // Ignore inherited properties
			f.call(context, this.values[s]); // Call f on the value
};
// This internal function maps any JavaScript value to a unique string.
Set._v2s = function(val) {
	switch (val) {
	case undefined:
		return 'u'; // Special primitive
	case null:
		return 'n'; // values get single-letter
	case true:
		return 't'; // codes.
	case false:
		return 'f';
	default:
		switch (typeof val) {
		case 'number':
			return '#' + val; // Numbers get # prefix.
		case 'string':
			return '"' + val; // Strings get " prefix.
		default:
			return '@' + objectId(val); // Objs and funcs get @
		}
	}
	// For any object, return a string. This function will return a different
	// string for different objects, and will always return the same string
	// if called multiple times for the same object. To do this it creates a
	// property on o. In ES5 the property would be nonenumerable and read-only.
	function objectId(o) {
		var prop = "|**objectid**|"; // Private property name for storing ids
		if (!o.hasOwnProperty(prop)) // If the object has no id
			o[prop] = Set._v2s.next++; // Assign it the next available
		return o[prop]; // Return the id
	}
};

// The constructor function
function SingletonSet(member) {
	this.member = member;
}

// Create a prototype object that inherits from the prototype of Set.
SingletonSet.prototype = inherit(Set.prototype);

// Now add properties to the prototype.
// These properties override the properties of the same name from Set.prototype.
extend(SingletonSet.prototype, {
	// Set the constructor property appropriately
	construcotr : SingletonSet,
	// This set is read-only: add() and remove() throw errors
	add : function() {
		throw "read-only set";
	},
	remove : function() {
		throw "read-only set";
	},
	// A SingletonSet always has size 1
	size : function() {
		return 1;
	},
	// Just invoke the function once, passing the single member.
	foreach : function(f, context) {
		f.call(context, this.member);
	},
	// The contains() method is simple: true only for one value
	contains : function() {
		return x === this.member;
	}
});
SingletonSet.equals = function(that) {
	return that instanceof Set && that.size() == 1
			&& that.contains(this.member);
};
/*
 * NonNullSet is a subclass of Set that does not allow null and undefined as
 * members of the set.
 */
function NonNullSet() {
	// Just chain to our superclass.
	// Invoke the superclass constructor as an ordinary function to initialize
	// the object that has been created by this constructor invocation.
	Set.apply(this, arguments);
}

// Make NonNullSet a subclass of Set:
NonNullSet.prototype = inherit(Set.prototype);
NonNullSet.prototype.constructor = NonNullSet;

// To exclude null and undefined, we only have to override the add() method
NonNullSet.prototype.add = function() {
	// Check for null or undefined arguments
	for ( var i = 0; i < arguments.length; i++) {
		if (arguments[i] == null) {
			throw new Error("Can't add null or undefined to a NonNullSet");
		}
	}
	return Set.prototype.add.apply(this, arguments);
};

/*
 * This function returns a subclass of specified Set class and overrides the
 * add() method of that class to apply the specified filter.
 */
function filterSetSubclass(superclass, filter) {
	var constructor = function() {
		superclass.apply(this, arguments);
	};
	var proto = constructor.prototype = inherit(superclass.prototype);
	proto.constructor = constructor;
	proto.add = function() {
		// Apply the filter to all arguments before adding any
		for ( var i = 0; i < arguments.length; i++) {
			var v = arguments[i];
			if (!filter(v))
				throw ("value " + v + " rejected by filter");
		}
		// Chain to our superclass add implementation
		superclass.prototype.add.apply(this, arguments);
	};
	return constructor;
}

var NoNullSet = (function() { // Define and invoke function
	var superclass = Set; // Only specify the superclass once.
	return superclass.extend(function() {
		superclass.apply(this, arguments);
	}, // The constructor.
	{ // The methods.
		add : function() {
			// Check for null or undefined arguments
			for ( var i = 0; i < arguments.length; i++)
				if (arguments[i] == null)
					throw new Error("Can't add null or undefined");
			// Chain to the superclass to perform the actual insertion
			return superclass.prototype.add.apply(this, arguments);
		}
	});
}());

/*
 * A FilteredSet wraps a specified set object and applies a specified filter to
 * values passed to its add() method. All of the other core set methods simply
 * forward to the wrapped set instance.
 */
var FilteredSet = Set.extend(function FilteredSet(set, filter) { // The
	// constructor
	this.set = set;
	this.filter = filter;
}, { // The instance method
	add : function() {
		// If we have a filter, apply it
		if (this.filter) {
			for ( var i = 0; i < arguments.length; i++) {
				var v = arguments[i];
				if (!filter(v))
					throw ("value " + v + " rejected by filter");
			}
		}
		// Now forward the add() method to this.set.add()
		this.set.add.apply(this.set, arguments);
		return this;
	},
	// The rest of the methods just forward to this.set and do nothing else.
	remove : function() {
		this.set.remove.apply(this.set, arguments);
		return this;
	},
	contains : function(v) {
		return this.set.contains(v);
	},
	size : function() {
		return this.set.size();
	},
	foreach : function(f, c) {
		this.set.foreach(f, c);
	}
});

var s = new FilteredSet(new Set(), function(x) {
	return x !== null;
});
var t = new FilteredSet(s, function(x) {
	return !(x instanceof Set);
});

// A convenient function that can be used for any abstract method
function abstractmethod() {
	throw new Error("abstract method");
}

/*
 * The AbstractSet class defines a single abstract method, contains().
 */
function AbstractSet() {
	throw new Error("Can't instantiate abstatrct class");
}
AbstractSet.prototype.contains = abstractmethod;

/*
 * NotSet is a concrete subclass of AbstractSet. The members of this set are all
 * values that are not members of some other set. Because it is defined in terms
 * of another set it is not writable, and because it has infinite members, it is
 * not enumerable. All we can do with it is test for membership. Note that we're
 * using the Function.prototype.extend() method we defined earlier to define
 * this subclass.
 */

var NotSet = AbstractSet.extend(function NotSet(set) {
	this.set = set;
}, {
	contains : function(x) {
		return !this.set.contains(x);
	},
	toString : function(x) {
		return "~" + this.set.toString(x);
	},
	equals : function(that) {
		return that instanceof NotSet && this.set.equals(that.set);
	}
});

/*
 * AbstractEnumerableSet is an abstract subclass of AbstractSet. It defines the
 * abstract methods size() and foreach(), and then implements concrete
 * isEmpty(), toArray(), to[Locale]String(), and equals() methods on top of
 * those. Subclasses that implement contains(), size(), and foreach() get these
 * five concrete methods for free.
 */
var AbstarctEnumerableSet = AbstarctSet.extend(function() {
	throw new Error("Can't instantiate abstatrct class");
}, {
	size : abstractmethod,
	foreach : abstractmethod,
	isEmpty : function() {
		return this.size() == 0;
	},
	toString : function() {
		var s = "{", i = 0;
		this.foreach(function(v) {
			if (i++ > 0)
				s += ", ";
			s += v;
		});
		return s + "}";
	},
	toLocaleString : function() {
		var s = "{", i = 0;
		this.foreach(function(v) {
			if (i++ > 0)
				s += ", ";
			if (v == null)
				s += v; // null & undefined
			else
				s += v.toLocaleString(); // all others
		});
		return s + "}";
	},
	toArray : function() {
		var a = [];
		this.foreach(function(v) {
			a.push(v);
		});
		return a;
	},
	equals : function(that) {
		if (!(that instanceof AbstarctEnumerableSet))
			return false;
		// If they don't have the same size, they're not equal
		if (this.size() != that.size())
			return false;
		// Now check whether every element in this is also in that.
		try {
			this.foreach(function(v) {
				if (!that.contains(v))
					throw false;
			});
			return true;
		} catch (x) {
			if (x === false)
				return false; // Sets are not equal
			throw x; // Some other exception occurred: rethrow it.
		}
	}
});

/*
 * SingletonSet is a concrete subclass of AbstractEnumerableSet. A singleton set
 * is a read-only set with a single member.
 */
var SingletonSet1 = AbstarctEnumerableSet.extend(
		function SingletonSet1(member) {
			this.member = member;
		}, {
			contains : function(x) {
				return x === this.member;
			},
			size : function() {
				return 1;
			},
			foreach : function(f, ctx) {
				f.call(ctx, this.member);
			}
		});

/*
 * AbstractWritableSet is an abstract subclass of AbstractEnumerableSet. It
 * defines the abstract methods add() and remove(), and then implements concrete
 * union(), intersection(), and difference() methods on top of them.
 */
var AbstractWritableSet = AbstractEnumerableSet.extend(function() {
	throw new Error("Can't instantiate abstract classes");
}, {
	add : abstractmethod,
	remove : abstractmethod,
	union : function(that) {
		var self = this;
		that.foreach(function(v) {
			self.add(v);
		});
		return this;
	},
	intersection : function(that) {
		var self = this;
		this.foreach(function(v) {
			if (!that.contains(v))
				self.remove(v);
		});
		return this;
	},
	difference : function(that) {
		var self = this;
		that.foreach(function(v) {
			self.remove(v);
		});
		return this;
	}
});
/*
 * An ArraySet is a concrete subclass of AbstractWritableSet. It represents the
 * set elements as an array of values, and uses a linear search of the array for
 * its contains() method. Because the contains() method is O(n) rather than
 * O(1), it should only be used for relatively small sets. Note that this
 * implementation relies on the ES5 Array methods indexOf() and forEach().
 */
var ArraySet = AbstractWritableSet.extend(function ArraySet() {
	this.values = [];
	this.add.apply(this, arguments);
}, {
	contains : function(v) {
		return this.values.indexOf(v) != -1;
	},
	size : function() {
		return this.values.length;
	},
	foreach : function(f, c) {
		this.values.forEach(f, c);
	},
	add : function() {
		for ( var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!this.contains(arg))
				this.values.push(arg);
		}
		return this;
	},
	remove : function() {
		for ( var i = 0; i < arguments.length; i++) {
			var p = this.values.indexOf(arguments[i]);
			if (p == -1)
				continue;
			this.values.splice(p, 1);
		}
		return this;
	}
});