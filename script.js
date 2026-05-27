// LOGIN
const form = document.getElementById("loginForm");

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "KevinLane786" && password === "KevinLa340") {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", username);

      window.location.href = "dashboard.html";
    } else {
      alert("incorrect information");
    }
  });
}

// PROTECT DASHBOARD
if (window.location.pathname.includes("dashboard.html")) {
  if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "index.html";
  }
}

// LOGOUT
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

// btc price and chart
const btcPriceElement = document.getElementById("btc-price");
const priceChartCanvas = document.getElementById("priceChart");
let btcChart;

async function getBTCPrice() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );
    const data = await res.json();
    const price = data?.bitcoin?.usd;

    if (price !== undefined && btcPriceElement) {
      btcPriceElement.innerText = `$${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  } catch (err) {
    console.error("Failed to load BTC price:", err);
    if (btcPriceElement) {
      btcPriceElement.innerText = "Price unavailable";
    }
  }
}

async function getBTCChartData() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=hourly"
    );
    const data = await res.json();
    const prices = data?.prices || [];

    if (!prices.length || !priceChartCanvas) {
      return;
    }

    const labels = prices.map((item) => {
      const date = new Date(item[0]);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    });

    const values = prices.map((item) => item[1]);

    if (btcChart) {
      btcChart.data.labels = labels;
      btcChart.data.datasets[0].data = values;
      btcChart.update();
      return;
    }

    const ctx = priceChartCanvas.getContext("2d");
    if (!ctx) {
      return;
    }

    btcChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "BTC/USD",
            data: values,
            borderColor: "#733404",
            backgroundColor: "rgba(146, 138, 159, 0.2)",
            fill: true,
            tension: 0.25,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            ticks: {
              callback: (value) => `$${Number(value).toLocaleString()}`,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) =>
                `BTC/USD: $${Number(context.parsed.y).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("Failed to load BTC chart data:", err);
  }
}

async function refreshData() {
  await getBTCPrice();
  await getBTCChartData();
}

setInterval(getBTCPrice, 5000);
setInterval(getBTCChartData, 5 * 60 * 1000);
refreshData();
