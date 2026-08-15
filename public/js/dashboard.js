async function loadDashboard() {

    console.log("loadDashboard started");

    // Dashboard Statistics
    const response = await fetch("/api/dashboard/stats", {
        credentials: "include"
    });

    const result = await response.json();

    if (!result.success) {

        window.location.href = "/login";
        return;

    }

    // Show logged-in admin name
    if (result.user && result.user.username) {
        document.getElementById("adminName").innerText =
            "Welcome, " + result.user.username;
    }

    document.getElementById("totalEmployees").innerText =
        result.data.totalEmployees;

    document.getElementById("presentToday").innerText =
        result.data.presentToday;

    document.getElementById("absentToday").innerText =
        result.data.absentToday;

    document.getElementById("lateToday").innerText =
        result.data.lateToday;

    console.log("Loading recent attendance...");

    // Recent Attendance
    const recentResponse = await fetch("/api/dashboard/recent-attendance", {
        credentials: "include"
    });

    const recentResult = await recentResponse.json();

    if (recentResult.success) {

        const table = document.getElementById("recentAttendance");

        table.innerHTML = "";

        recentResult.data.forEach(item => {

            table.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.department}</td>
                    <td>${item.check_in ?? "-"}</td>
                    <td>${item.check_out ?? "-"}</td>
                    <td>${item.status}</td>
                </tr>
            `;

        });

    }

}

async function logout() {

    await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
    });

    window.location.href = "/login";

}

document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("logoutMenu").addEventListener("click", logout);

loadDashboard();