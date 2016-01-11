let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let nodeify = require('bluebird-nodeify');
let uniqueValidator = require('mongoose-unique-validator');

require('songbird');

let userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    blogTitle: {
        type: String,
        unique: true
    },
    blogDescription: String
});

userSchema.plugin(uniqueValidator);

userSchema.methods.generateHash = async function (password) {
	return password;
	/*let salt = bcrypt.genSaltSync(10);
	let hash = bcrypt.hashSync(password, salt);
	
	console.log("Hash generated: " + hash);
	return hash;
	//return await bcrypt.promise.hash(password, 8)*/
	/*bcrypt.genSalt(10, function(err, salt) {
    	bcrypt.hash(password, salt, function(err, hash) {
    		if(err) {
    			console.log("ERROR: problem generating hash for password\n");
    			return;
    		} else {
	        	return hash;
	        }
    	});
	});
	return null;*/
}

userSchema.methods.validatePassword = async function (password) {
	return password == this.password;
	/**console.log("Comparing password guess: " + password + "... to password hash: " + this.password);
	bcrypt.compare(password, this.password, function(err, matches) {
	  if (err)
		console.log('Error while checking password');
	  else if (matches)
		console.log('The password matches!');
	  else
		console.log('The password does NOT match!');
	});
	return bcrypt.compareSync(password, this.password);*/
	//return await bcrypt.promise.compare(password, this.password)
}

userSchema.path('password').validate((pw) => {
    return pw.length >= 4 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw)
});

userSchema.pre('save', function(callback) {
	console.log("model/user.js pre-save");
    nodeify(async() => {
    	console.log("model/user.js nodeify(async() = { ... }), password = " + this.password);
        if (!this.isModified('password')) return callback()
        this.password = await this.generateHash(this.password)
    }(), callback)
});

module.exports = mongoose.model('User', userSchema);
console.log("User.js successfully exported userSchema: " + userSchema.toString());