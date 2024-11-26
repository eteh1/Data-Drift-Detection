let chart;
let fileData1 = [];
let fileData2 = [];
let driftStatusElement = document.getElementById('status');
let driftInfoElement = document.getElementById('drift-info');
let tableContainer = document.getElementById('data-table-container');

document.getElementById('file-upload-1').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        fileData1 = XLSX.utils.sheet_to_json(sheet);
        displayDataInTable(fileData1);
    };
    reader.readAsBinaryString(file);
});

document.getElementById('file-upload-2').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        fileData2 = XLSX.utils.sheet_to_json(sheet);
        displayDataInTable(fileData2);
    };
    reader.readAsBinaryString(file);
});

function displayDataInTable(data) {
    let tableHtml = "<table><thead><tr>";
    const headers = Object.keys(data[0]);
    headers.forEach(header => {
        tableHtml += `<th>${header}</th>`;
    });
    tableHtml += "</tr></thead><tbody>";

    data.forEach(row => {
        tableHtml += "<tr>";
        headers.forEach(header => {
            tableHtml += `<td>${row[header]}</td>`;
        });
        tableHtml += "</tr>";
    });

    tableHtml += "</tbody></table>";
    tableContainer.innerHTML = tableHtml;
}

function detectDataDrift() {
    if (fileData1.length === 0 || fileData2.length === 0) {
        alert("Please upload both files first.");
        return;
    }

    const driftResults = [];
    const headers = Object.keys(fileData1[0]);

    headers.forEach(header => {
        const columnDrift = compareColumns(header);
        driftResults.push({ column: header, drift: columnDrift });
    });

    const totalDrift = driftResults.reduce((sum, result) => sum + result.drift, 0);
    const averageDrift = totalDrift / driftResults.length;

    driftStatusElement.innerHTML = averageDrift > 10 ? 'Data Drift Detected' : 'No Significant Drift Detected';
    driftInfoElement.innerHTML = `Average Drift: ${averageDrift.toFixed(2)}`;
    createDriftChart(driftResults);
}

function compareColumns(column) {
    let sumOfSquares = 0;
    const data1Column = fileData1.map(row => row[column]);
    const data2Column = fileData2.map(row => row[column]);

    data1Column.forEach((value, index) => {
        if (value !== undefined && data2Column[index] !== undefined) {
            sumOfSquares += Math.pow(Number(value) - Number(data2Column[index]), 2);
        }
    });

    return Math.sqrt(sumOfSquares);
}

function createDriftChart(driftResults) {
    const ctx = document.getElementById('driftChart').getContext('2d');
    const driftValues = driftResults.map(result => result.drift);
    const labels = driftResults.map(result => result.column);

    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = driftValues;
        chart.update();
    } else {
        chart = new Chart(ctx, {
      
