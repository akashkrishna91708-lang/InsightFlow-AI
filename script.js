let myChart = null; // Chart instance ko track karne ke liye

const generateBtn = document.getElementById('generateBtn');

generateBtn.addEventListener('click', async () => {
    const queryInput = document.getElementById('userQuery');
    const query = queryInput.value;
    
    if (!query) return alert("Bhai, kuch business query toh daalo!");

    // UI Loading State
    generateBtn.innerHTML = `Thinking... <span class="spinner">⏳</span>`;
    generateBtn.disabled = true;

    try {
        const response = await fetch('/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });

        const data = await response.json();
        
        // 1. Render the Chart
        renderChart(data);

        // 2. Update Title & Summary (BI Insight)
        const chartTitle = document.getElementById('chartTitle');
        const insightBox = document.getElementById('insightBox');
        const aiSummary = document.getElementById('aiSummary');

        if (chartTitle) chartTitle.innerText = data.title;
        
        if (data.summary && insightBox && aiSummary) {
            insightBox.style.display = 'block';
            aiSummary.innerText = data.summary;
        }

    } catch (error) {
        console.error("BI Engine Error:", error);
        alert("Server error! Make sure Flask (app.py) is running.");
    } finally {
        generateBtn.innerHTML = "Analyze ✨";
        generateBtn.disabled = false;
        if (window.lucide) lucide.createIcons(); // Icons refresh karne ke liye
    }
});

function renderChart(data) {
    const ctx = document.getElementById('currentChart');
    if (!ctx) return;

    // --- CRITICAL BUG FIX: Purane chart ko destroy karna zaroori hai ---
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: data.type,
        data: {
            labels: data.labels,
            datasets: [{
                label: data.title,
                data: data.values,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.6)', 
                    'rgba(34, 211, 238, 0.6)', 
                    'rgba(168, 85, 247, 0.6)', 
                    'rgba(244, 63, 94, 0.6)'
                ],
                borderColor: '#6366f1',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    display: data.type === 'pie' || data.type === 'doughnut',
                    labels: { color: '#94a3b8', font: { family: 'Inter' } } 
                }
            },
            scales: data.type !== 'pie' ? {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: { 
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            } : {}
        }
    });
}