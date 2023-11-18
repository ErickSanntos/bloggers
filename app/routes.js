const { ObjectId } = require("mongodb")
module.exports = function (app, passport, db) {
	// normal routes ===============================================================

	// show the home page (will also have our login links)
	app.get("/", function (req, res) {
		res.render("index.ejs")
	})

	// PROFILE SECTION =========================
	app.get("/profile", (req, res) => {
		db.collection("blogs")
			.find()
			.toArray((err, result) => {
				if (err) return console.log(err)
				res.render("profile.ejs", {
					user: req.user,
					blogs: result,
				})
			})
	})

	// LOGOUT ==============================
	app.get("/logout", function (req, res) {
		req.logout(() => {
			console.log("User has logged out!")
		})
		res.redirect("/")
	})

	// message board routes ===============================================================

	app.post("/blogs", (req, res) => {
		const newBlog = {
			title: req.body.title,
			content: req.body.content,
			createdAt: new Date(),
			lastUpdated: new Date(),
		}
		db.collection("blogs").insertOne(newBlog, (err, result) => {
			if (err) return console.log(err)
			res.redirect("/profile")
		})
	})

	app.put("/blogs", (req, res) => {
		const id = req.body.id // Get the ID from the request body
		db.collection("blogs").findOneAndUpdate(
			{ _id: ObjectId(id) }, // Use ObjectId to convert the string ID to MongoDB's ObjectId
			{
				$set: {
					title: req.body.title,
					content: req.body.content,
					lastUpdated: new Date(),
				},
			},
			{
				sort: { _id: -1 },
				upsert: false,
			},
			(err, result) => {
				if (err) return res.send(err)
				res.send(result)
			}
		)
	})

	app.delete("/blogs", (req, res) => {
		const id = req.body.id // Get the ID from the request body
		db.collection("blogs").findOneAndDelete(
			{ _id: ObjectId(id) }, // Use ObjectId to convert the string ID to MongoDB's ObjectId
			(err, result) => {
				if (err) return res.send(500, err)
				res.send("Blog post deleted!")
			}
		)
	})

	// =============================================================================
	// AUTHENTICATE (FIRST LOGIN) ==================================================
	// =============================================================================

	// locally --------------------------------
	// LOGIN ===============================
	// show the login form
	app.get("/login", function (req, res) {
		res.render("login.ejs", { message: req.flash("loginMessage") })
	})

	// process the login form
	app.post(
		"/login",
		passport.authenticate("local-login", {
			successRedirect: "/profile", // redirect to the secure profile section
			failureRedirect: "/login", // redirect back to the signup page if there is an error
			failureFlash: true, // allow flash messages
		})
	)

	// SIGNUP =================================
	// show the signup form
	app.get("/signup", function (req, res) {
		res.render("signup.ejs", { message: req.flash("signupMessage") })
	})

	// process the signup form
	app.post(
		"/signup",
		passport.authenticate("local-signup", {
			successRedirect: "/profile", // redirect to the secure profile section
			failureRedirect: "/signup", // redirect back to the signup page if there is an error
			failureFlash: true, // allow flash messages
		})
	)

	// =============================================================================
	// UNLINK ACCOUNTS =============================================================
	// =============================================================================
	// used to unlink accounts. for social accounts, just remove the token
	// for local account, remove email and password
	// user account will stay active in case they want to reconnect in the future

	// local -----------------------------------
	app.get("/unlink/local", isLoggedIn, function (req, res) {
		var user = req.user
		user.local.email = undefined
		user.local.password = undefined
		user.save(function (err) {
			res.redirect("/profile")
		})
	})
}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next()

	res.redirect("/")
}
