let attendanceData = [];
function getStatusBadge(record){

    // Attendance completed (Check-Out done)
    if(record.check_out){
        return `<span class="badge badge-completed">Completed</span>`;
    }

    switch(record.status){

        case "Present":
            return `<span class="badge badge-present">Present</span>`;

        case "Late":
            return `<span class="badge badge-late">Late</span>`;

        case "Absent":
            return `<span class="badge badge-absent">Absent</span>`;

        default:
            return `<span class="badge badge-pending">Pending</span>`;
    }

}

async function loadAttendance() {

    // Set today's date by default
    const today = new Date().toISOString().split("T")[0];

    document.getElementById("fromDate").value = today;
    document.getElementById("toDate").value = today;

    try {

       const response = await fetch("/api/attendance-report", {
    credentials: "same-origin"
});
        const data = await response.json();
        if (!data.success) {
    window.location.href = "/login";
    return;
}
        console.log("API Response:", data);

attendanceData = data.records;

console.log("Attendance Data:", attendanceData);
        console.log(attendanceData);
        // Show only today's records initially
        applyFilters();
        console.log("First Record Date:", attendanceData[0].attendance_date);
    } catch (err) {

        console.error(err);

    }

}

function displayAttendance(records){

    const table = document.getElementById("attendanceTable");

    table.innerHTML = "";

    let present = 0;
    let checkedOut = 0;
    let pending = 0;

    records.forEach(record=>{

        if(
    record.status === "Present" ||
    record.status === "Late"
){
    present++;
}

        if(record.check_out)
            checkedOut++;
        else
            pending++;

        table.innerHTML += `
        <tr>

            <td>${record.employee_code}</td>
            <td>${record.name}</td>
            <td>${record.department}</td>
            <td>${new Date(record.attendance_date).toLocaleDateString("en-IN")}</td>
            <td>${record.check_in || "-"}</td>
            <td>${record.check_out || "-"}</td>
            <td>${getStatusBadge(record)}</td>

        </tr>
        `;
    });

    document.getElementById("totalRecords").textContent = records.length;
    document.getElementById("presentCount").textContent = present;
    document.getElementById("checkedOutCount").textContent = checkedOut;
    document.getElementById("pendingCount").textContent = pending;

}

document.getElementById("searchInput").addEventListener("keyup", applyFilters);
document.getElementById("filterBtn").addEventListener("click", applyFilters);

document.getElementById("resetBtn").addEventListener("click", () => {

    const today = new Date().toISOString().split("T")[0];

    document.getElementById("searchInput").value = "";
    document.getElementById("fromDate").value = today;
    document.getElementById("toDate").value = today;

    applyFilters();

});
function applyFilters(){

    const search = document.getElementById("searchInput").value.toLowerCase();

    const fromDate = document.getElementById("fromDate").value;

    const toDate = document.getElementById("toDate").value;

    const filtered = attendanceData.filter(record => {

        const date = new Date(record.attendance_date);

const recordDate =
    date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0");

        const matchesSearch =
            record.employee_code.toLowerCase().includes(search) ||
            record.name.toLowerCase().includes(search);

        const matchesFrom =
            !fromDate || recordDate >= fromDate;

        const matchesTo =
            !toDate || recordDate <= toDate;

        return matchesSearch && matchesFrom && matchesTo;

    });

    displayAttendance(filtered);

}

loadAttendance();