let extractedTimetable = ""; // Global variable to store extracted timetable
const totalClassrooms = new Set(['101','102','103','104','105','201','202','203','204','205','206','207','401','402','403','404','405','406','407','501','502','503','504','505','506','507']);

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = function(e) {
            const loadingTask = pdfjsLib.getDocument({ data: e.target.result });
            loadingTask.promise.then(function(pdf) {
                let textContent = "";
                const pages = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    pages.push(
                        pdf.getPage(i).then(page => page.getTextContent()).then(content => {
                            textContent += content.items.map(item => item.str).join(' ');
                        })
                    );
                }
                Promise.all(pages).then(() => {
                    extractedTimetable = textContent;
                    alert("Timetable extracted successfully!");
                });
            });
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert("Please upload a valid PDF file.");
    }
});

function findFreeClassroom() {
    const selectedDay = document.getElementById('dayOfWeek').value;
    const selectedSlot = document.getElementById('timeSlot').value;
    const [startTime, endTime] = selectedSlot.split('-');
    const resultDiv = document.getElementById('result');

    if (!extractedTimetable) {
        resultDiv.innerHTML = "Please upload and extract a timetable PDF.";
        resultDiv.style.color = '#d9534f';
        return;
    }

    const rows = extractedTimetable.split('\n');
    const occupiedRooms = new Set();

    rows.forEach(row => {
        const [day, room, start, end] = row.split(',').map(x => x.trim());
        if (day === selectedDay && room && start && end && totalClassrooms.has(room)) {
            if (startTime < end && endTime > start) {
                occupiedRooms.add(room);
            }
        }
    });

    const freeRooms = [...totalClassrooms].filter(room => !occupiedRooms.has(room));

    if (freeRooms.length > 0) {
        resultDiv.innerHTML = `Free Classrooms on ${selectedDay}: ${freeRooms.join(', ')}`;
        resultDiv.style.color = '#28a745';
    } else {
        resultDiv.innerHTML = `No classroom free on ${selectedDay} at this moment.`;
        resultDiv.style.color = '#d9534f';
    }
}
