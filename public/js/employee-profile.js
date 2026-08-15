const params = new URLSearchParams(window.location.search);

const employeeId = params.get("id");


async function loadProfile() {

    if (!employeeId) {

        alert("Employee ID not found.");

        window.location.href = "/employees";

        return;

    }

    try {

        const response = await fetch(
            `/api/employees/${employeeId}/profile`,
            {
                credentials: "include"
            }
        );

        const result = await response.json();

        console.log("PROFILE API RESPONSE:", result);

        if (response.status === 401) {

            window.location.href = "/login";

            return;

        }

        if (!result.success) {

            alert(result.message);

            return;

        }


        // =================================
        // Employee Details
        // =================================

        const emp = result.employee;

        document.getElementById("empPhoto").src =
            emp.photo || "/uploads/default-avatar.png";

        document.getElementById("empName").textContent =
            emp.name || "N/A";

        document.getElementById("empCode").textContent =
            emp.employee_code || "N/A";

        document.getElementById("empDepartment").textContent =
            emp.department || "N/A";

        document.getElementById("empDesignation").textContent =
            emp.designation || "N/A";

        document.getElementById("empEmail").textContent =
            emp.email || "N/A";

        document.getElementById("empPhone").textContent =
            emp.phone || "N/A";

        document.getElementById("empStatus").textContent =
            emp.status || "N/A";


        // =================================
        // Attendance Summary
        // =================================

        const attendance = result.attendance;

        console.log("ATTENDANCE DATA:", attendance);

        document.getElementById("presentCount").textContent =
            attendance.present || 0;

        document.getElementById("lateCount").textContent =
            attendance.late || 0;

        document.getElementById("absentCount").textContent =
            attendance.absent || 0;

        document.getElementById("totalCount").textContent =
            attendance.total || 0;


        // =================================
        // Attendance History
        // =================================

        const table =
            document.getElementById("attendanceTable");

        table.innerHTML = "";


        if (
            attendance.history &&
            attendance.history.length > 0
        ) {

            attendance.history.forEach(record => {

                table.innerHTML += `

                    <tr>

                        <td>
                            ${new Date(record.attendance_date).toLocaleDateString("en-CA")}
                        </td>

                        <td>
                            ${record.check_in || "-"}
                        </td>

                        <td>
                            ${record.check_out || "-"}
                        </td>

                        <td>
                            ${record.status || "-"}
                        </td>

                    </tr>

                `;

            });

        }

        else {

            table.innerHTML = `

                <tr>

                    <td colspan="4">

                        No attendance records found

                    </td>

                </tr>

            `;

        }

    }

    catch (err) {

        console.error(
            "Profile error:",
            err
        );

    }

}


loadProfile();