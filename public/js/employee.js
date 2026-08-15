// =====================================================
// LOAD EMPLOYEES
// =====================================================

async function loadEmployees() {

    try {

        const res = await fetch(
            "/api/employees",
            {
                credentials: "include"
            }
        );


        const data =
            await res.json();


        if (res.status === 401) {

            window.location.href =
                "/login";

            return;

        }


        if (!data.success) {

            alert(data.message);

            return;

        }


        const table =
            document.getElementById(
                "employeeTable"
            );


        table.innerHTML = "";


        data.data.forEach(emp => {

            table.innerHTML += `

                <tr>

                    <td>${emp.id}</td>

                    <td>${emp.employee_code}</td>

                    <td>${emp.name}</td>

                    <td>${emp.department}</td>

                    <td>${emp.designation}</td>

                    <td>${emp.status}</td>

                    <td>

                        <button
                            class="viewBtn"
                            onclick="viewEmployee(${emp.id})">

                            View

                        </button>


                        <button
                            class="editBtn"
                            onclick="editEmployee(${emp.id})">

                            Edit

                        </button>


                        <button
                            class="deleteBtn"
                            onclick="deleteEmployee(${emp.id})">

                            Delete

                        </button>

                    </td>

                </tr>

            `;

        });

    }

    catch (error) {

        console.error(
            "Load employees error:",
            error
        );

    }

}


// =====================================================
// SAVE EMPLOYEE
// ADD OR UPDATE
// =====================================================

async function saveEmployee() {


    const employeeId =
        document.getElementById(
            "employee_id"
        ).value;


    const body = {


        employee_code:
            document.getElementById(
                "employee_code"
            ).value,


        name:
            document.getElementById(
                "name"
            ).value,


        department:
            document.getElementById(
                "department"
            ).value,


        designation:
            document.getElementById(
                "designation"
            ).value,


        email:
            document.getElementById(
                "email"
            ).value,


        phone:
            document.getElementById(
                "phone"
            ).value

    };


    try {


        let url =
            "/api/employees";


        let method =
            "POST";


        // =====================================
        // IF ID EXISTS → UPDATE
        // =====================================

        if (employeeId) {


            url =
                `/api/employees/${employeeId}`;


            method =
                "PUT";

        }


        const res =
            await fetch(

                url,

                {

                    method:
                        method,


                    credentials:
                        "include",


                    headers: {

                        "Content-Type":
                            "application/json"

                    },


                    body:
                        JSON.stringify(body)

                }

            );


        const data =
            await res.json();


        console.log(
            "SERVER RESPONSE:",
            data
        );


        if (res.status === 401) {


            alert(
                "Session expired. Please login again."
            );


            window.location.href =
                "/login";


            return;

        }


        if (!res.ok) {


            alert(

                data.message ||
                "Server error"

            );


            return;

        }


        alert(
            data.message
        );


        // =====================================
        // RESET FORM
        // =====================================

        document.getElementById("employee_id").value = "";

document.getElementById("employee_code").value = "";
document.getElementById("name").value = "";
document.getElementById("department").value = "";
document.getElementById("designation").value = "";
document.getElementById("email").value = "";
document.getElementById("phone").value = "";


        document
            .getElementById(
                "employee_id"
            )
            .value =
            "";


        document
            .getElementById(
                "saveEmployee"
            )
            .innerText =
            "Save Employee";


        document
            .getElementById(
                "employeeForm"
            )
            .style.display =
            "none";


        loadEmployees();

    }


    catch (error) {


        console.error(

            "Save employee error:",

            error

        );


        alert(
            "Something went wrong."
        );

    }

}


// =====================================================
// EDIT EMPLOYEE
// =====================================================

async function editEmployee(id) {


    const res =
        await fetch(

            "/api/employees",

            {

                credentials:
                    "include"

            }

        );


    const data =
        await res.json();


    if (res.status === 401) {


        window.location.href =
            "/login";


        return;

    }


    const emp =
        data.data.find(

            e =>
                e.id == id

        );


    if (!emp) {


        alert(
            "Employee not found"
        );


        return;

    }


    document
        .getElementById(
            "employee_id"
        )
        .value =
        emp.id;


    document
        .getElementById(
            "employee_code"
        )
        .value =
        emp.employee_code;


    document
        .getElementById(
            "name"
        )
        .value =
        emp.name;


    document
        .getElementById(
            "department"
        )
        .value =
        emp.department;


    document
        .getElementById(
            "designation"
        )
        .value =
        emp.designation;


    document
        .getElementById(
            "email"
        )
        .value =
        emp.email;


    document
        .getElementById(
            "phone"
        )
        .value =
        emp.phone;


    document
        .getElementById(
            "employeeForm"
        )
        .style.display =
        "block";


    document
        .getElementById(
            "saveEmployee"
        )
        .innerText =
        "Update Employee";

}


// =====================================================
// DELETE EMPLOYEE
// =====================================================

async function deleteEmployee(id) {


    if (
        !confirm(
            "Delete this employee?"
        )
    )

        return;


    const res =
        await fetch(

            `/api/employees/${id}`,

            {

                method:
                    "DELETE",


                credentials:
                    "include"

            }

        );


    const data =
        await res.json();


    if (res.status === 401) {


        window.location.href =
            "/login";


        return;

    }


    if (!data.success) {


        alert(
            data.message
        );


        return;

    }


    alert(
        data.message
    );


    loadEmployees();

}


// =====================================================
// PAGE INITIALIZATION
// =====================================================

document.addEventListener(

    "DOMContentLoaded",

    () => {


        loadEmployees();


        document
            .getElementById(
                "addEmployeeBtn"
            )
            .addEventListener(

                "click",

                () => {


                    // Clear old edit ID

                    document
                        .getElementById(
                            "employee_id"
                        )
                        .value =
                        "";


                    // Clear form

                    document.getElementById("employee_code").value = "";
document.getElementById("name").value = "";
document.getElementById("department").value = "";
document.getElementById("designation").value = "";
document.getElementById("email").value = "";
document.getElementById("phone").value = "";


                    // Set button text

                    document
                        .getElementById(
                            "saveEmployee"
                        )
                        .innerText =
                        "Save Employee";


                    // Show form

                    document
                        .getElementById(
                            "employeeForm"
                        )
                        .style.display =
                        "block";

                }

            );


        document
            .getElementById(
                "saveEmployee"
            )
            .addEventListener(

                "click",

                saveEmployee

            );

    }

);


// =====================================================
// VIEW EMPLOYEE
// =====================================================

function viewEmployee(id) {


    window.location.href =
        `/employee-profile?id=${id}`;

}