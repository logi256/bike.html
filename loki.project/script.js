let requests = [];
let studentLoggedIn = false;
let studentMobile = "";

function login(){
    let role = document.getElementById("role").value;
    let u = document.getElementById("user").value;
    let p = document.getElementById("pass").value;
    let mobileLogin = document.getElementById("mobileLogin").value;
    if(role=="student" && u=="student" && p=="1234"){
        studentLoggedIn = true;
        studentMobile = mobileLogin;
        showDashboard("studentPage");
        renderStudentHistory();
    } else if(role=="admin" && u=="admin" && p=="admin123"){
        showDashboard("adminPage");
        displayRequest();
    } else {
        document.getElementById("loginMsg").innerText="Invalid Login";
    }
}

function showDashboard(page){
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("studentPage").classList.add("hidden");
    document.getElementById("adminPage").classList.add("hidden");
    document.getElementById(page).classList.remove("hidden");
    document.getElementById("logoutBox").classList.remove("hidden");
}

function logout(){
    document.getElementById("loginPage").classList.remove("hidden");
    document.getElementById("studentPage").classList.add("hidden");
    document.getElementById("adminPage").classList.add("hidden");
    document.getElementById("logoutBox").classList.add("hidden");
    document.getElementById("status").innerText = "";
    document.getElementById("studentHistory").innerHTML = "";
    document.getElementById("studentQRCode").innerHTML = "";
    document.getElementById("downloadQR").classList.add("hidden");
    document.getElementById("requestInfo").innerText = "";
    studentLoggedIn = false;
    studentMobile = "";
}

function isValidMobile(mobile){
    return /^\d{10}$/.test(mobile);
}

function requestPass(){
    let studentName = document.getElementById("name").value;
    let mobile = document.getElementById("mobile").value;
    let bikeNum = document.getElementById("bike").value;
    let licenseNum = document.getElementById("license").value;
    let insuranceOwner = document.getElementById("insurance").value;
    let insuranceDate = document.getElementById("insuranceDate").value;
    if(!studentName || !mobile || !bikeNum || !licenseNum || !insuranceOwner || !insuranceDate){
        alert("Please fill all fields!");
        return;
    }
    if(!isValidMobile(mobile)){
        alert("Enter valid 10-digit mobile number!");
        return;
    }
    let request = {name: studentName,mobile: mobile,bike: bikeNum,license: licenseNum,insurance: insuranceOwner,date: insuranceDate,approved: false,rejected: false};
    requests.push(request);
    alert("Pass request sent to Admin!");
    renderStudentHistory();
}

function renderStudentHistory(){
    let historyDiv = document.getElementById("studentHistory");
    historyDiv.innerHTML = "";
    let myRequests = requests.filter(r => r.mobile === studentMobile);
    if(myRequests.length===0){
        historyDiv.innerText = "No requests yet.";
        return;
    }
    myRequests.forEach((r,index)=>{
        let today = new Date().toISOString().split('T')[0];
        let expiredClass = r.date < today ? "expired" : "";
        let approvedClass = r.approved ? "approved" : "";
        let rejectedClass = r.rejected ? "rejected" : "";
        historyDiv.innerHTML += `<div class="${approvedClass} ${rejectedClass} ${expiredClass}">Name: ${r.name}<br>Bike: ${r.bike}<br>License: ${r.license}<br>Insurance: ${r.insurance}<br>Valid Until: ${r.date}<br>Status: ${r.approved ? "APPROVED" : r.rejected ? "REJECTED" : "PENDING"}<br>${r.approved ? `<button onclick="showStudentQRCode(${index})">View QR</button>` : ""}</div>`;
    });
}

function showStudentQRCode(index){
    let r = requests.filter(r=>r.mobile===studentMobile)[index];
    let qrDiv = document.getElementById("studentQRCode");
    qrDiv.innerHTML = "";
    new QRCode(qrDiv, {text: `Name: ${r.name}\nMobile: ${r.mobile}\nBike: ${r.bike}\nLicense: ${r.license}\nInsurance: ${r.insurance}\nValid: ${r.date}\nSTATUS: APPROVED`,width:180,height:180});
    document.getElementById("downloadQR").classList.remove("hidden");
}

function downloadQR(){
    let qr = document.querySelector("#studentQRCode canvas");
    if(!qr) return;
    let link = document.createElement("a");
    link.href = qr.toDataURL();
    link.download = "bike_pass_qr.png";
    link.click();
}

function displayRequest(){
    let filter = document.getElementById("filter").value;
    let infoDiv = document.getElementById("requestInfo");
    infoDiv.innerHTML = "";
    let filtered = requests.filter(r => {
        if(filter=="all") return true;
        if(filter=="pending") return !r.approved && !r.rejected;
        if(filter=="approved") return r.approved;
        if(filter=="rejected") return r.rejected;
    });
    if(filtered.length===0){
        infoDiv.innerText = "No requests found.";
        return;
    }
    filtered.forEach((r,index)=>{
        let today = new Date().toISOString().split('T')[0];
        let expiredClass = r.date < today ? "expired" : "";
        let approvedClass = r.approved ? "approved" : "";
        let rejectedClass = r.rejected ? "rejected" : "";
        let viewButton = r.approved ? `<button onclick="viewApprovedPass(${index})">View Pass</button>` : "";
        infoDiv.innerHTML += `<div class="request-box ${approvedClass} ${rejectedClass} ${expiredClass}">Name: ${r.name}<br>Mobile: ${r.mobile}<br>Bike: ${r.bike}<br>License: ${r.license}<br>Insurance: ${r.insurance}<br>Valid Until: ${r.date}<br>Status: ${r.approved ? "APPROVED" : r.rejected ? "REJECTED" : "PENDING"}<br>${!r.approved && !r.rejected ? `<button onclick="approve(${index})">Approve</button> <button onclick="reject(${index})">Reject</button>` : viewButton}</div>`;
    });
}

function approve(index){requests[index].approved=true;requests[index].rejected=false;displayRequest(); if(studentLoggedIn) renderStudentHistory();}
function reject(index){requests[index].rejected=true;requests[index].approved=false;displayRequest(); if(studentLoggedIn) renderStudentHistory();}
function viewApprovedPass(index){
    let r=requests[index];
    let qrDiv=document.getElementById("adminQRCode");
    if(!qrDiv){qrDiv=document.createElement("div"); qrDiv.id="adminQRCode"; qrDiv.style.margin="10px auto"; qrDiv.style.width="200px"; qrDiv.style.height="200px"; document.getElementById("adminPage").appendChild(qrDiv);}
    qrDiv.innerHTML="";
    new QRCode(qrDiv, {text:`Name: ${r.name}\nMobile: ${r.mobile}\nBike: ${r.bike}\nLicense: ${r.license}\nInsurance: ${r.insurance}\nValid: ${r.date}\nSTATUS: APPROVED`, width:180, height:180});
    alert(`QR Code for ${r.name} displayed below. Give this to the student.`);
}
