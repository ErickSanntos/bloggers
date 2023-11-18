const editButtons = document.getElementsByClassName("edit-blog")
const saveButtons = document.getElementsByClassName("save-blog")
const deleteButtons = document.getElementsByClassName("delete-blog")

// Show the edit form for each blog post
Array.from(editButtons).forEach(function (button) {
	button.addEventListener("click", function () {
		const blogItem = this.closest(".blog-post")
		blogItem.classList.toggle("editing")
		blogItem.querySelector(".edit-form").style.display = "block"
		this.style.display = "none" // Hide the edit button
	})
})

// Handle saving the edited blog post
Array.from(saveButtons).forEach(function (button) {
	button.addEventListener("click", function () {
		const blogItem = this.closest(".blog-post")
		const id = blogItem.getAttribute("data-id")
		const title = blogItem.querySelector(".edit-title").value
		const content = blogItem.querySelector(".edit-content").value

		fetch("blogs", {
			method: "put",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id,
				title,
				content,
			}),
		})
			.then((response) => {
				if (response.ok) return response.json()
			})
			.then((data) => {
				console.log(data)
				window.location.reload(true) // Reload page to show updated post
			})
	})
})

// Handle deleting a blog post
Array.from(deleteButtons).forEach(function (button) {
	button.addEventListener("click", function () {
		const blogItem = this.closest(".blog-post")
		const id = blogItem.getAttribute("data-id")

		fetch("blogs", {
			method: "delete",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id }),
		})
			.then((response) => {
				if (response.ok) {
					// Response is OK, proceed to reload the page
					window.location.reload() // Reload page after deletion
				} else {
					// Handle non-OK response
					console.error("Deletion failed")
				}
			})
			.catch((error) => {
				// Handle any errors that occurred during fetch
				console.error("Error:", error)
			})
	})
})
// ok