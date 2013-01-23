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
kid.name = "Patrick";
print(kid.say());

function Article() {
	this.tags = ["js", 'css'];
}
var article = new Article();

function BlogPost() {}
BlogPost.prototype = article;
var blog = new BlogPost();

function StaticPage() {
	Article.call(this);
}
var page = new StaticPage();
print(article.hasOwnProperty('tags'));
print(blog.hasOwnProperty('tags'));
print(page.hasOwnProperty('tags'));

blog.tags.push('html');
page.tags.push('php');
print(article.tags.join(', '));
function Child1(name) {
	Parent.apply(this, arguments);
}

var kid3 = new Child1("Alex");
print(kid3.name);
print(typeof kid3.say);

function Bird() {
	this.wings = 2;
	this.fly = true;
}

function Cat(name) {
	this.name = name || "Wild Cat";
	this.legs = 4;
	this.say = function() {
		return "meaowww";
	};
}
Cat.prototype.scratch = function () {
	return "hurt!!";
}

function CatWings() {
	Cat.apply(this);
	Bird.apply(this);
}
var jane = new CatWings();

function BobCat(name) {
	Cat.apply(this, arguments);
}
BobCat.prototype = new Cat();

var bobCat = new BobCat("BobCat");
