let budgetChart; 

// Sample values for on load chart
const sampleValues = {
    Needs: { budget: 500, allocated: 250 },
    Wants: { budget: 300, allocated: 100 },
    Savings: { budget: 200, allocated: 150 }
};

let submissionHistory = []; 

// Alerts user when clear button is clicked
function confirmClear() {
    const userConfirmed = confirm("Warning! All entered data will be cleared.");
    if (userConfirmed) {
        document.getElementById('budgetForm').reset(); 
        updateUndoButtonState(); 
    }
}

// Creates chart
function initializeSampleChart() {
    const ctx = document.getElementById('budgetChart').getContext('2d');

    const sampleData = {
        datasets: [{
            data: [50, 30, 20], 
            backgroundColor: [
                '#FF13F0', 
                '#FF6700', 
                '#B026FF'  
            ],
            hoverOffset: 4
        }],
        labels: ['Needs', 'Wants', 'Savings']
    };

    budgetChart = new Chart(ctx, {
        type: 'doughnut',
        data: sampleData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    padding: 10,
                    callbacks: {
                        title: function(tooltipItem) {
                            return tooltipItem[0].label; 
                        },
                        label: function(tooltipItem) {
                            const label = tooltipItem.label || '';
                            const value = tooltipItem.raw || 0;

                            const budget = (label in sampleValues) ? sampleValues[label].budget : 0;
                            const allocated = (label in sampleValues) ? sampleValues[label].allocated : 0;

                            return [
                                `${label}`,
                                `Budget: $${budget.toFixed(0)}`,
                                `Allocated: $${allocated.toFixed(0)}`,
                            ];
                        }
                    },
                    backgroundColor: '#fff', 
                    titleColor: '#000',
                    bodyColor: '#000',
                    borderColor: '#000',
                    borderWidth: 1,
                    font: {
                        family: 'Montserrat, sans-serif'
                    },
                },
                datalabels: {
                    anchor: 'center',
                    align: 'center',
                    formatter: (value) => {
                        return value + '%'; 
                    },
                    color: '#fff', 
                    font: {
                        weight: 'bold',
                        size: 32, 
                        family: 'Montserrat, sans-serif'
                    },
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Adds up expenses for a category
function sumExpenses(expenses) {
    let total = 0;
    expenses.forEach(expense => {
        const value = parseFloat(expense.value) || 0; 
        total += value;
    });
    return total;
}

// Disables/ables Undo button only when applicable
function updateUndoButtonState() {
    const undoButton = document.getElementById('undoButton');
    if (submissionHistory.length > 0) {
        undoButton.disabled = false; 
    } else {
        undoButton.disabled = true; 
    }
}

// Updates chart
function updateChart() {
    const income = parseFloat(document.getElementById('income').value);
    const needsPercentage = parseFloat(document.getElementById('needs-percent').value) / 100;
    const wantsPercentage = parseFloat(document.getElementById('wants-percent').value) / 100;
    const savingsPercentage = parseFloat(document.getElementById('savings-percent').value) / 100;

    budgetChart.data.datasets[0].data = [needsPercentage * 100, wantsPercentage * 100, savingsPercentage * 100];

    sampleValues.Needs.budget = income * needsPercentage;
    sampleValues.Wants.budget = income * wantsPercentage;
    sampleValues.Savings.budget = income * savingsPercentage;

    const needsExpenses = document.querySelectorAll('.needs');
    const wantsExpenses = document.querySelectorAll('.wants');
    const savingsExpenses = document.querySelectorAll('.savings');

    sampleValues.Needs.allocated = sumExpenses(needsExpenses);
    sampleValues.Wants.allocated = sumExpenses(wantsExpenses);
    sampleValues.Savings.allocated = sumExpenses(savingsExpenses);

    budgetChart.update();
}

// Updates Budget Table values
function updateBudgetOutput(income, totalSpent, totalDiff, totalNeedsSpent, totalWantsSpent, totalSavingsSpent) {
    document.getElementById('budgetOutput').innerHTML = `
        <table class="table table-hover">
            <thead>
                <tr>
                <th scope="col"></th>
                <th scope="col">Income</th>
                <th scope="col">Expenses</th>
                <th scope="col">Balance</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">Total</th>
                    <td>$${income.toFixed(0)}</td>
                    <td>$${totalSpent.toFixed(0)}</td>
                    <td>$${totalDiff.toFixed(0)}</td>
                </tr>
                <tr>
                    <th scope="row">Needs</th>
                    <td>$${(income * (parseFloat(document.getElementById('needs-percent').value) / 100)).toFixed(0)}</td>
                    <td>$${totalNeedsSpent.toFixed(0)}</td>
                    <td>$${(income * (parseFloat(document.getElementById('needs-percent').value) / 100) - totalNeedsSpent).toFixed(0)}</td>
                </tr>
                <tr>
                    <th scope="row">Wants</th>
                    <td>$${(income * (parseFloat(document.getElementById('wants-percent').value) / 100)).toFixed(0)}</td>
                    <td>$${totalWantsSpent.toFixed(0)}</td>
                    <td>$${(income * (parseFloat(document.getElementById('wants-percent').value) / 100) - totalWantsSpent).toFixed(0)}</td>
                </tr>
                <tr>
                    <th scope="row">Savings</th>
                    <td>$${(income * (parseFloat(document.getElementById('savings-percent').value) / 100)).toFixed(0)}</td>
                    <td>$${totalSavingsSpent.toFixed(0)}</td>
                    <td>$${(income * (parseFloat(document.getElementById('savings-percent').value) / 100) - totalSavingsSpent).toFixed(0)}</td>
                </tr>
            </tbody>
        </table>
    `;
}

// Validate Inputs and Calculates Budget
function calculateBudget() {
    const income = parseFloat(document.getElementById('income').value);
    const needsExpenses = document.querySelectorAll('.needs');
    const wantsExpenses = document.querySelectorAll('.wants');
    const savingsExpenses = document.querySelectorAll('.savings');
    const needsPercent = parseFloat(document.getElementById("needs-percent").value);
    const wantsPercent = parseFloat(document.getElementById("wants-percent").value);
    const savingsPercent = parseFloat(document.getElementById("savings-percent").value);

    // Validation 
    if (isNaN(income) || isNaN(needsPercent) || isNaN(wantsPercent) || isNaN(savingsPercent)) {
        alert("Please fill out the income and budget percentages.");
        return;
    }

    if (income < 0) {
        alert("Income must be a positive number.");
        return;
    }

    if (needsPercent < 0 || wantsPercent < 0 || savingsPercent < 0) {
        alert("All budget percentages must be positive.");
        return;
    }

    const totalPercent = needsPercent + wantsPercent + savingsPercent;

    if (totalPercent !== 100) {
        alert("Budget percentages must add up to 100%.");
        return;
    }

    // Save current input values before calculating
    const currentSubmission = {
        income: document.getElementById('income').value,
        needsPercent: document.getElementById('needs-percent').value,
        wantsPercent: document.getElementById('wants-percent').value,
        savingsPercent: document.getElementById('savings-percent').value,
        needs: Array.from(needsExpenses).map(exp => exp.value),
        wants: Array.from(wantsExpenses).map(exp => exp.value),
        savings: Array.from(savingsExpenses).map(exp => exp.value),
    };

    // Store the current submission in the history
    submissionHistory.push(currentSubmission);
    updateUndoButtonState(); 

    // Add up expenses
    const totalNeedsSpent = sumExpenses(needsExpenses);
    const totalWantsSpent = sumExpenses(wantsExpenses);
    const totalSavingsSpent = sumExpenses(savingsExpenses);

    const totalSpent = totalNeedsSpent + totalWantsSpent + totalSavingsSpent;
    const totalDiff = income - totalSpent;

    // Update the budget table
    updateBudgetOutput(income, totalSpent, totalDiff, totalNeedsSpent, totalWantsSpent, totalSavingsSpent);

    updateChart(); // Update the budget chart
}

function undoLast() {
    // Restore the last submitted input values from history
    if (submissionHistory.length > 0) {
        const lastSubmission = submissionHistory[0]; 

        document.getElementById('income').value = lastSubmission.income;
        document.getElementById('needs-percent').value = lastSubmission.needsPercent;
        document.getElementById('wants-percent').value = lastSubmission.wantsPercent;
        document.getElementById('savings-percent').value = lastSubmission.savingsPercent;

        const needsExpenses = document.querySelectorAll('.needs');
        const wantsExpenses = document.querySelectorAll('.wants');
        const savingsExpenses = document.querySelectorAll('.savings');

        // Restore needs
        lastSubmission.needs.forEach((value, index) => {
            if (needsExpenses[index]) {
                needsExpenses[index].value = value;
            }
        });
        
        // Restore wants
        lastSubmission.wants.forEach((value, index) => {
            if (wantsExpenses[index]) {
                wantsExpenses[index].value = value;
            }
        });
        
        // Restore savings
        lastSubmission.savings.forEach((value, index) => {
            if (savingsExpenses[index]) {
                savingsExpenses[index].value = value;
            }
        });

        const totalNeedsSpent = sumExpenses(needsExpenses);
        const totalWantsSpent = sumExpenses(wantsExpenses);
        const totalSavingsSpent = sumExpenses(savingsExpenses);
        const income = parseFloat(document.getElementById('income').value);
        const totalSpent = totalNeedsSpent + totalWantsSpent + totalSavingsSpent;
        const totalDiff = income - totalSpent;

        // Update the budget output table with restored values
        updateBudgetOutput(income, totalSpent, totalDiff, totalNeedsSpent, totalWantsSpent, totalSavingsSpent);

        // Update the chart with restored values
        updateChart();

        submissionHistory.shift(); // Remove the last submission from history
        updateUndoButtonState(); // Update button state after undo
    }
}

// Create sample chart on load of the site
window.onload = function() {
    initializeSampleChart();
    updateUndoButtonState(); 
};
