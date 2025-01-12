// Inisialisasi variabel global untuk menyimpan data
let activeLoans = JSON.parse(localStorage.getItem('activeLoans')) || [];
let queue = JSON.parse(localStorage.getItem('queue')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];
const penaltyPerHour = 500;

// Data sepeda
let bikes = JSON.parse(localStorage.getItem('bikes')) || [
    { id: 'RR-001', status: 'Available', image: 'assets/red-bike.png' },
    { id: 'RR-002', status: 'Available', image: 'assets/red-bike.png' },
    { id: 'RR-003', status: 'Available', image: 'assets/red-bike.png' },
    { id: 'RR-004', status: 'Available', image: 'assets/red-bike.png' },
    { id: 'RR-005', status: 'Available', image: 'assets/red-bike.png' },
    { id: 'RR-006', status: 'Available', image: 'assets/red-bike.png' },
    { id: 'RR-007', status: 'Available', image: 'assets/red-bike.png' },
    { id: 'RR-008', status: 'Available', image: 'assets/red-bike.png' },
    { id: 'RR-009', status: 'Available', image: 'assets/red-bike.png' }
];

// Fungsi untuk menyimpan data ke localStorage
function saveToLocalStorage() {
    localStorage.setItem('bikes', JSON.stringify(bikes));
    localStorage.setItem('activeLoans', JSON.stringify(activeLoans));
    localStorage.setItem('queue', JSON.stringify(queue));
    localStorage.setItem('history', JSON.stringify(history));
}

// Fungsi untuk merender sepeda ke tampilan
function renderBikes() {
    const bikeContainer = document.getElementById('bikes');
    bikeContainer.innerHTML = '';
    bikes.forEach(bike => {
        bikeContainer.innerHTML += `
        <div class="col-md-4 mb-3">
            <div class="card text-center p-3" style="max-width: 300px;">
                <img src="${bike.image}" class="card-img-top" alt="${bike.id}">
                <div class="card-body">
                    <h4 class="card-title">${bike.id}</h4>
                    <p class="card-text">Status: <span id="status-${bike.id}">${bike.status}</span></p>
                    <button class="btn btn-red" id="borrow-btn-${bike.id}" onclick="borrow('${bike.id}')">Borrow</button>
                    <button class="btn btn-red" id="queue-btn-${bike.id}" onclick="queueBike('${bike.id}')">Queue</button>
                </div>
            </div>
        </div>
    `;
        updateButtons(bike.id);
    });
    updateActiveLoans();
    updateQueue();
    updateHistory();
}

// Fungsi untuk memperbarui tombol-tombol pada sepeda
function updateButtons(bikeId) {
    const bike = bikes.find(b => b.id === bikeId);
    const borrowBtn = document.getElementById(`borrow-btn-${bikeId}`);
    const queueBtn = document.getElementById(`queue-btn-${bikeId}`);
    const statusSpan = document.getElementById(`status-${bikeId}`);

    if (bike.status === 'Borrowed') {
        borrowBtn.disabled = true;
        queueBtn.disabled = false;
        statusSpan.textContent = 'Borrowed';
    } else if (bike.status === 'In Maintenance') {
        borrowBtn.disabled = true;
        queueBtn.disabled = true;
        statusSpan.textContent = 'In Maintenance';
    } else {
        borrowBtn.disabled = false;
        queueBtn.disabled = true;
        statusSpan.textContent = 'Available';
    }
}

// Fungsi untuk meminjam sepeda
function borrow(bikeId) {
    const bike = bikes.find(b => b.id === bikeId);
    if (bike.status === 'Borrowed') {
        return; // Tidak bisa meminjam sepeda yang sudah dipinjam
    }

    const now = new Date();
    const borrowDate = now.toLocaleDateString();
    const startTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(now.getTime() + 60 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const nextInQueue = queue.find(q => q.bikeId === bikeId);
    if (nextInQueue) {
        document.getElementById('name').value = nextInQueue.name;
        document.getElementById('identityType').value = nextInQueue.identityType;
        document.getElementById('phone').value = nextInQueue.phone;
        queue.shift(); // Hapus dari antrian
        saveToLocalStorage(); // Simpan antrian ke localStorage
    } else {
        // Jika tidak ada, reset form
        document.getElementById('name').value = '';
        document.getElementById('identityType').value = '';
        document.getElementById('phone').value = '';
    }

    document.getElementById('borrowDate').value = borrowDate;
    document.getElementById('startTime').value = startTime;
    document.getElementById('endTime').value = endTime;
    document.getElementById('borrowModal').dataset.bikeId = bikeId;
    $('#borrowModal').modal('show');
}

// Fungsi untuk mengirim formulir peminjaman
function submitForm(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const identityType = document.getElementById('identityType').value;
    const phone = document.getElementById('phone').value;
    const bikeId = document.getElementById('borrowModal').dataset.bikeId;
    const borrowDate = document.getElementById('borrowDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    const bike = bikes.find(b => b.id === bikeId);
    bike.status = 'Borrowed';
    activeLoans.push({ borrowDate, name, identityType, phone, startTime, endTime, bikeId });

    saveToLocalStorage(); // Simpan aktif loans ke localStorage
    updateButtons(bikeId);
    updateActiveLoans();
    $('#borrowModal').modal('hide');
}

// Fungsi untuk mengantri sepeda
function queueBike(bikeId) {
    const bike = bikes.find(b => b.id === bikeId);
    const now = new Date(); 
    const queueTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    document.getElementById('queueTime').value = queueTime;
    document.getElementById('queueModal').dataset.bikeId = bikeId;
    $('#queueModal').modal('show');
}

// Fungsi untuk mengirim formulir antrian
function submitQueueForm(event) {
    event.preventDefault();
    const name = document.getElementById('queueName').value;
    const identityType = document.getElementById('queueIdentityType').value;
    const phone = document.getElementById('queuePhone').value;
    const bikeId = document.getElementById('queueModal').dataset.bikeId;
    const queueTime = document.getElementById('queueTime').value;

    queue.push({ name, identityType, phone, bikeId, queueTime });
    saveToLocalStorage(); // Simpan queue ke localStorage
    updateQueue();
    $('#queueModal').modal('hide');

    document.getElementById('queueName').value = '';
    document.getElementById('queueIdentityType').value = '';
    document.getElementById('queuePhone').value = '';
}

// Fungsi untuk memperbarui tampilan pinjaman aktif
function updateActiveLoans() {
    const loansContainer = document.getElementById('activeLoansBody');
    loansContainer.innerHTML = '';
    if (activeLoans.length === 0) {
        loansContainer.innerHTML = '<tr><td colspan="9" style="text-align: center;">Currently, there is no active rental.</td></tr>';
    } else {
        activeLoans.forEach((loan, index) => {
            loansContainer.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${loan.borrowDate}</td>
                    <td>${loan.name}</td>
                    <td>${loan.identityType}</td>
                    <td>${loan.phone}</td>
                    <td>${loan.startTime}</td>
                    <td>${loan.endTime}</td>
                    <td>${loan.bikeId}</td>
                    <td><button class="btn btn-danger" onclick="returnBike('${loan.bikeId}', ${index})">Return</button></td>
                </tr>
            `;
        });
    }
}

// Fungsi untuk mengembalikan sepeda
function returnBike(bikeId, index) {
    const loan = activeLoans[index];
    const bike = bikes.find(b => b.id === bikeId);
    bike.status = 'Available';
    const returnTime = new Date();
    const returnTimeString = returnTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const endTime = new Date(`${loan.borrowDate} ${loan.endTime}`);
    const lateMinutes = Math.max(Math.round((returnTime - endTime) / (1000 * 60)), 0);
    const penalty = lateMinutes > 0 ? lateMinutes * penaltyPerHour : 0;

    loan.returnTime = returnTimeString; // Menyimpan waktu pengembalian
    loan.penalty = penalty; // Menyimpan denda jika ada

    activeLoans.splice(index, 1);
    saveToLocalStorage(); // Simpan perubahan aktif loans ke localStorage
    updateButtons(bikeId);
    updateActiveLoans();

    // Menampilkan pesan menggunakan modal
    const returnMessageElement = document.getElementById('returnMessage');
    if (penalty > 0) {
        returnMessageElement.innerHTML = `Thank you ${loan.name} for returning the bike. <br> Unfortunately, it was returned ${lateMinutes} minutes late, <br> leading to a fine of Rp${penalty}.`;
    } else {
        returnMessageElement.innerHTML = `Thank you ${loan.name} for returning the bike! <br> It was returned on time.`;
    }

    $('#returnModal').modal('show');
    document.getElementById('returnOkButton').onclick = function () {
        $('#returnModal').modal('hide');
        updateQueue();

        // Jika ada antrian untuk sepeda ini, isi form peminjaman
        const nextInQueueIndex = queue.findIndex(q => q.bikeId === bikeId);
        if (nextInQueueIndex > -1) {
            const nextInQueue = queue[nextInQueueIndex];
            document.getElementById('name').value = nextInQueue.name;
            document.getElementById('identityType').value = nextInQueue.identityType;
            document.getElementById('phone').value = nextInQueue.phone;
            document.getElementById('borrowDate').value = new Date().toLocaleDateString();
            document.getElementById('startTime').value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            document.getElementById('endTime').value = new Date(new Date().getTime() + 1 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            queue.splice(nextInQueueIndex, 1); // Hapus dari antrian
            saveToLocalStorage(); // Simpan perubahan queue ke localStorage

            $('#borrowModal').modal('show'); // Tampilkan form peminjaman
            updateQueue();
        }
    };

    // Menambahkan ke riwayat
    addToHistory(loan);
}

// Fungsi untuk memperbarui tampilan antrian
function updateQueue() {
    const queueContainer = document.getElementById('queueList');
    queueContainer.innerHTML = '';
    if (queue.length === 0) {
        queueContainer.innerHTML = '<tr><td colspan="6" style="text-align: center;">Currently, there is no borrowing queue.</td></tr>';
    } else {
        queue.forEach((q, index) => {
            queueContainer.innerHTML += `<tr>
            <td>${index + 1}</td>
            <td>${q.name}</td>
            <td>${q.phone}</td>
            <td>${q.bikeId}</td>
            <td>${q.queueTime}</td>
            <td><button class="btn btn-danger" onclick="removeFromQueue(${index})">Cancel</button></td>
            </tr>`;
        });
    }
}

// Fungsi untuk menambahkan pinjaman ke riwayat
function addToHistory(loan) {
    const now = new Date();
    const returnTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    loan.returnTime = returnTime; // Menyimpan waktu pengembalian
    history.push(loan);
    saveToLocalStorage(); // Simpan riwayat ke localStorage
    updateHistory();
}

// Fungsi untuk memperbarui tampilan riwayat
function updateHistory() {
    const historyBody = document.getElementById('historyBody');
    historyBody.innerHTML = '';
    if (history.length > 0) {
        document.getElementById('historyTable').classList.remove('hidden');
        history.forEach((h, index) => {
            historyBody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${h.borrowDate}</td>
                <td>${h.name}</td>
                <td>${h.identityType}</td>
                <td>${h.phone}</td>
                <td>${h.startTime}</td>
                <td>${h.returnTime}</td>
                <td>${h.bikeId}</td>
                <td>${h.penalty}</td>
            </tr>
        `;
        });
    } else {
        historyBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Currently, there is no borrowing history.</td></tr>';
    }
}

// Fungsi untuk menghapus dari antrian
function removeFromQueue(index) {
    queue.splice(index, 1); // Menghapus item dari antrian
    saveToLocalStorage(); // Simpan perubahan queue ke localStorage
    updateQueue(); // Memperbarui tampilan antrian
}

// Event listener saat DOM telah dimuat
document.addEventListener('DOMContentLoaded', () => {
    activeLoans = JSON.parse(localStorage.getItem('activeLoans')) || [];
    queue = JSON.parse(localStorage.getItem('queue')) || [];
    history = JSON.parse(localStorage.getItem('history')) || [];

    // Update status sepeda berdasarkan activeLoans
    bikes.forEach(bike => {
        const loan = activeLoans.find(l => l.bikeId === bike.id);
        if (loan) {
            bike.status = 'Borrowed'; // Jika ada pinjaman, ubah status menjadi 'Borrowed'
        } else if (bike.status !== 'In Maintenance'){
            bike.status = 'Available'; // Jika tidak ada pinjaman, pastikan statusnya 'Available'
        }
    });

    renderBikes(); // Render sepeda setelah memuat data
});

// Merender sepeda saat script dijalankan
renderBikes();

// Fungsi untuk validasi login admin
function validateAdminLogin(event) {
    event.preventDefault();

    const username = document.getElementById('adminName').value;
    const password = document.getElementById('adminPassword').value;

    if (username === "admin" && password === "Kelompok3WebRedRide") {
        window.location.href = "adminPage.html";
    } else {
        alert("Username and Password doesn't match. Try Again!");
    }
}

// Fungsi untuk merender sepeda di halaman admin
function renderAdminBikes() {
    const bikeList = document.getElementById('bikeList');
    if (bikeList) {
        bikeList.innerHTML = ''; // Kosongkan daftar sepeda
        
        // Render setiap sepeda yang ada
        bikes.forEach(bike => {
            bikeList.innerHTML += `
                <tr>
                    <td>${bike.id}</td>
                    <td id="status-${bike.id}">${bike.status}</td>
                    <td>
                        <button class="btn c-pink btn-sm" onclick="toggleBikeStatus('${bike.id}')">Edit Status</button>
                        <button class="btn btn-red btn-sm" onclick="deleteBike('${bike.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    }
}

// Fungsi untuk mengubah status sepeda
function toggleBikeStatus(bikeId) {
    const bike = bikes.find(b => b.id === bikeId);
    if (bike) {
        bike.status = bike.status === 'Available' ? 'In Maintenance' : 'Available';
        saveToLocalStorage();
        renderAdminBikes();
    }
}

// Fungsi untuk menambahkan sepeda baru
function addBike(name, status, image = 'assets/red-bike.png') {
    const newId = generateNewBikeId(name.split('-')[1]);
    const newBike = { id: newId, status: status, image: image };
    bikes.push(newBike);
    saveToLocalStorage();
    renderAdminBikes();
}

// Fungsi untuk menghapus sepeda
function deleteBike(bikeId) {
    bikes = bikes.filter(b => b.id !== bikeId);
    saveToLocalStorage();
    renderAdminBikes();
}

// Fungsi untuk menghasilkan ID sepeda baru
function generateNewBikeId(customIdNumber = null) {
    if (customIdNumber) {
        return `RR-${customIdNumber}`;
    } else {
        const lastBike = bikes[bikes.length - 1];
        const lastIdNumber = parseInt(lastBike.id.split('-')[1]);
        const newIdNumber = (lastIdNumber + 1).toString().padStart(3, '0');
        return `RR-${newIdNumber}`;
    }
}