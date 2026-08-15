document.getElementById("loginForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            // Important: save the login session cookie
            credentials: "include",

            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await res.json();

        console.log("Login response:", data);

        if (data.success) {

            window.location.href = "/dashboard";

        } else {

            message.innerText = data.message;

        }

    } catch (err) {

        console.error(err);

        message.innerText = "Unable to connect to server.";

    }

});