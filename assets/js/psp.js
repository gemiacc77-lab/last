document.addEventListener("DOMContentLoaded", () => {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbwWNsRWtnGwvE66VpDOeishxk6jGRT6oJ6Qup73vgHI7mjbMvPPQoTAFcdeHC9CD-_RJQ/exec";
  const ENROLL_WEBHOOK =
    "https://script.google.com/macros/s/AKfycbyck7pBRCWeseen7SkV4ntkgjRmZ4IepOOwWXq75pk3WbJQnFrVVTV-6FmBoyullnT4/exec";
  const els = {
    loginStage: document.getElementById("loginStage"),
    dashStage: document.getElementById("dashStage"),
    pid: document.getElementById("pid"),
    ppass: document.getElementById("ppass"),
    authBtn: document.getElementById("authBtn"),
    authError: document.getElementById("authError"),
    pName: document.getElementById("pName"),
    refLink: document.getElementById("refLink"),
    valComm: document.getElementById("valComm"),
    valSales: document.getElementById("valSales"),
    tableBody: document.getElementById("tableBody"),
    emptyState: document.getElementById("emptyState"),
    withdrawRequestBtn: document.getElementById("withdrawRequestBtn"),
    copyBtn: document.getElementById("copyBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    enrollForm: document.getElementById("enrollForm"),
    enrollSubmit: document.getElementById("enrollSubmit"),
    tipText: document.getElementById("tipText"),
    milestoneCards: document.querySelectorAll(".milestone-card"),
    prevTip: document.getElementById("prevTip"),
    nextTip: document.getElementById("nextTip"),
    exportCSV: document.getElementById("exportCSV"),
    exportExcel: document.getElementById("exportExcel"),
    exportPDF: document.getElementById("exportPDF"),
    txFilter: document.getElementById("txFilter"),
    transactionTable: document.getElementById("transactionTable"),
    generateLinkBtn: document.getElementById("generateLinkBtn"),
    copySmartLinkBtn: document.getElementById("copySmartLinkBtn"),
    smartLinkOutput: document.getElementById("smartLinkOutput"),
    resultContainer: document.getElementById("resultContainer"),
    feedTrack: document.getElementById("feedTrack"),
  };
  const tips = [
    "Consistency is key: Share your link daily to build momentum.",
    "Your potential is limitless keep pushing boundaries.",
    "Every click is a step closer to your next milestone.",
    "Success is not an accident, it's a choice you make every day.",
    "Focus on value: Explain how OPTILINE solves real problems.",
    "Be the leader in your network. Show them the future.",
    "Small daily improvements lead to stunning results.",
    "Track your metrics, optimize your strategy, scale your income.",
    "You are part of the elite. Act like it.",
    "Momentum builds success. Keep the wheel turning.",
    "Your network is your net worth. Expand it.",
    "Legendary status is just a few conversions away.",
  ];
  let charts = { package: null, trend: null };
  let currentTipIndex = 0;
  let currentTransactions = [];
  if (typeof gsap !== "undefined") {
    gsap.to(".login-card", {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.2,
    });
  }
  function initializeTipSystem() {
    if (els.tipText && els.prevTip && els.nextTip) {
      updateTipProgress();
      els.prevTip.addEventListener("click", () => {
        currentTipIndex = (currentTipIndex - 1 + tips.length) % tips.length;
        updateTipDisplay();
        updateTipProgress();
      });
      els.nextTip.addEventListener("click", () => {
        currentTipIndex = (currentTipIndex + 1) % tips.length;
        updateTipDisplay();
        updateTipProgress();
      });
      updateTipDisplay();
      setInterval(() => {
        currentTipIndex = (currentTipIndex + 1) % tips.length;
        updateTipDisplay();
        updateTipProgress();
      }, 8000);
    }
  }
  function updateTipDisplay() {
    if (!els.tipText) return;
    gsap.to(els.tipText, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      onComplete: () => {
        els.tipText.textContent = tips[currentTipIndex];
        gsap.to(els.tipText, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      },
    });
  }
  function updateTipProgress() {
    const progressBar = document.querySelector(".tip-progress-bar");
    if (progressBar) {
      const progress = ((currentTipIndex + 1) / tips.length) * 100;
      gsap.to(progressBar, {
        width: `${progress}%`,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }
  if (els.authBtn) els.authBtn.addEventListener("click", attemptLogin);
  if (els.logoutBtn)
    els.logoutBtn.addEventListener("click", () => window.location.reload());
  [els.pid, els.ppass].forEach((input) => {
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") attemptLogin();
      });
    }
  });
  if (els.withdrawRequestBtn) {
    els.withdrawRequestBtn.addEventListener("click", () => {
      const partnerName = els.pName ? els.pName.textContent : "Partner";
      const subject = encodeURIComponent(`Withdrawal Request - ${partnerName}`);
      window.location.href = `/contact/?subject=${subject}`;
    });
  }
  if (els.copyBtn) {
    els.copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(els.refLink.textContent).then(() => {
        const originalText = els.copyBtn.textContent;
        const originalBackground = els.copyBtn.style.background;
        els.copyBtn.textContent = "Copied!";
        els.copyBtn.style.background = "#10B981";
        els.copyBtn.style.color = "white";
        setTimeout(() => {
          els.copyBtn.textContent = originalText;
          els.copyBtn.style.background = originalBackground;
          els.copyBtn.style.color = "";
        }, 2000);
      });
    });
  }
  if (els.enrollForm) {
    els.enrollForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const feedbackEl = document.getElementById("formFeedback");
      const submitBtn = els.enrollSubmit;
      const phoneInput = els.enrollForm.querySelector('input[name="phone"]');
      const emailInput = els.enrollForm.querySelector('input[name="email"]');
      const originalBtnText = submitBtn.innerHTML;
      function showLocalError(msg) {
        if (feedbackEl) {
          feedbackEl.textContent = msg;
          feedbackEl.style.display = "block";
          feedbackEl.className = "form-feedback error-msg"; 
          if (typeof gsap !== "undefined") {
            gsap.fromTo(feedbackEl, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
          }
        } else {
          alert(msg);
        }
      }
      if (!phoneInput.value.startsWith("+")) {
        showLocalError("Phone number must start with country code (e.g. +966...).");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        showLocalError("Please enter a valid email address.");
        return;
      }
      const formData = new FormData(els.enrollForm);
      const turnstileToken = formData.get('cf-turnstile-response');
      if (!turnstileToken) {
        showLocalError("Please complete the security check (Captcha) above the button.");
        return;
      }
      if (feedbackEl) feedbackEl.style.display = "none";
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
      const data = new URLSearchParams();
      for (const pair of formData) {
        data.append(pair[0], pair[1]);
      }
      if (!data.has('cf-turnstile-response')) {
         data.append('cf-turnstile-response', turnstileToken);
      }
      try {
        const response = await fetch(ENROLL_WEBHOOK, {
          method: "POST",
          body: data,
        });
        const result = await response.json();
        if (result.status === "success" || result.result === "success") {
          if (typeof turnstile !== 'undefined') turnstile.reset();
          localStorage.clear();
          handleSuccess(result.name || "Partner"); 
        } else {
          throw new Error(result.message || "Submission failed");
        }
      } catch (err) {
        console.error("Submission Error:", err);
        showLocalError(
          err.message === "Failed to fetch"
            ? "Connection error. Please check your internet."
            : err.message
        );
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        if (typeof turnstile !== 'undefined') turnstile.reset();
      }
    });
    function showError(msg) {
      if (els.authError) {
        els.authError.textContent = msg;
        els.authError.style.display = "block";
        if (typeof gsap !== "undefined") {
          gsap.fromTo(
            els.authError,
            { y: -10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3 },
          );
        }
      }
    }
    function handleSuccess(name) {
      const formEl = document.getElementById("enrollForm");
      const successEl = document.getElementById("enrollSuccess");
      const successNameEl = document.getElementById("successName");
      if (typeof gsap !== "undefined") {
        gsap.to(formEl, {
          opacity: 0,
          height: 0,
          margin: 0,
          padding: 0,
          duration: 0.5,
          onComplete: () => {
            formEl.style.display = "none";
            successEl.style.display = "block";
            if (successNameEl) successNameEl.textContent = name;
            gsap.fromTo(
              successEl,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.5 },
            );
          },
        });
      } else {
        formEl.style.display = "none";
        successEl.style.display = "block";
        if (successNameEl) successNameEl.textContent = name;
      }
    }
  }
  function setupExportButtons() {
    if (els.exportCSV) els.exportCSV.addEventListener("click", exportToCSV);
    if (els.exportExcel) els.exportExcel.addEventListener("click", exportToExcel);
    if (els.exportPDF) els.exportPDF.addEventListener("click", exportToPDF);
    if (els.txFilter) {
      els.txFilter.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val === "all") {
          renderTable(currentTransactions);
        } else {
          const limit = parseInt(val);
          const now = new Date();
          const filtered = currentTransactions.filter((tx) => {
            if (!tx.date) return false;
            const txDate = new Date(tx.date);
            const diffTime = Math.abs(now - txDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= limit;
          });
          renderTable(filtered);
        }
      });
    }
  }
  function exportToCSV() {
    if (currentTransactions.length === 0) {
      alert("No transaction data to export.");
      return;
    }
    let csvContent = "Date,Package,Ref ID,Commission,Status\n";
    currentTransactions.forEach((tx) => {
      const row = [
        tx.date || "N/A",
        tx.package || "N/A",
        tx.ref || "-",
        `$${tx.commission || "0"}`,
        tx.status || "Completed",
      ];
      csvContent += row.map((field) => `"${field}"`).join(",") + "\n";
    });
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optiline-transactions-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  function exportToExcel() {
    if (currentTransactions.length === 0) {
      alert("No transaction data to export.");
      return;
    }
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["Date", "Package", "Ref ID", "Commission", "Status"],
      ...currentTransactions.map((tx) => [
        tx.date || "N/A",
        tx.package || "N/A",
        tx.ref || "-",
        parseFloat(tx.commission) || 0,
        tx.status || "Completed",
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(
      wb,
      `optiline-transactions-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  }
  function exportToPDF() {
    if (currentTransactions.length === 0) {
      alert("No transaction data to export.");
      return;
    }

    const getLogoData = () => {
      const img = document.querySelector(".logo img");
      if (!img) return null;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL("image/png");
    };

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const partnerName = els.pName ? els.pName.textContent : "Partner";
    const logoData = getLogoData();
    const dateStr = new Date().toLocaleDateString();

    doc.setFillColor(18, 8, 47); 
    doc.rect(0, 0, 210, 40, 'F');
    
    if (logoData) {
      doc.addImage(logoData, 'PNG', 14, 8, 45, 8 * (45/45)); 
    } else {
       doc.setFontSize(22);
       doc.setTextColor(255, 255, 255);
       doc.text("OPTILINE", 14, 25);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(164, 94, 255); 
    doc.text("OFFICIAL COMMISSION STATEMENT", 140, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text(`Generated: ${dateStr}`, 140, 24);
    doc.text(`Partner: ${partnerName}`, 140, 29);

    let y = 55;

    doc.setFontSize(14);
    doc.setTextColor(53, 18, 80); 
    doc.text("Transaction History", 14, 48);
    
    doc.setDrawColor(164, 94, 255);
    doc.setLineWidth(0.5);
    doc.line(14, 50, 196, 50);

    doc.setFillColor(245, 245, 250);
    doc.rect(14, y - 6, 182, 10, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 90);
    doc.text("DATE", 18, y);
    doc.text("PACKAGE", 50, y);
    doc.text("REF ID", 90, y);
    doc.text("AMOUNT", 140, y);
    doc.text("STATUS", 170, y);
    
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    currentTransactions.forEach((tx, index) => {
      if (index % 2 === 0) {
         doc.setFillColor(252, 252, 255);
         doc.rect(14, y - 6, 182, 8, 'F');
      }

      doc.setFontSize(9);
      doc.text(tx.date || "-", 18, y);
      
      doc.setFont("helvetica", "bold");
      doc.text(tx.package || "-", 50, y);
      doc.setFont("helvetica", "normal");
      
      doc.text(tx.ref || "-", 90, y);
      
      doc.setTextColor(16, 185, 129); 
      doc.text(`$${tx.commission}`, 140, y);
      
      doc.setTextColor(0, 0, 0);
      let status = tx.status || "Completed";
      if(status === "Paid") doc.setTextColor(16, 185, 129);
      if(status === "Pending") doc.setTextColor(245, 158, 11);
      doc.text(status, 170, y);
      
      y += 8;
      
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text("OPTILINE - Partner Success Program", 105, 285, { align: 'center' });
    }

    doc.save(`OPTILINE_Report_${partnerName.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.pdf`);
  }
  function attemptLogin() {
    const id = els.pid.value.trim();
    const pass = els.ppass.value.trim();
    if (!id || !pass) {
      showError("Please enter valid Partner ID and Access Key.");
      return;
    }
    els.authBtn.disabled = true;
    els.authBtn.querySelector(".btn-txt").textContent = "Authenticating...";
    els.authError.style.display = "none";
    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "partner_login",
        partnerId: id,
        password: pass,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          loadDashboard(data.data);
        } else {
          showError(
            data.message ||
              "Invalid credentials. Please check your Partner ID and Access Key.",
          );
          resetBtn();
        }
      })
      .catch((err) => {
        console.error("Login API Error:", err);
        showError(
          "Connection failed. Please check your internet or try again later.",
        );
        resetBtn();
      });
  }
  function showError(msg) {
    els.authError.textContent = msg;
    els.authError.style.display = "block";
    if (typeof gsap !== "undefined") {
      gsap.from(els.authError, { y: -10, opacity: 0, duration: 0.3 });
    }
  }
  function resetBtn() {
    els.authBtn.disabled = false;
    els.authBtn.querySelector(".btn-txt").textContent = "Access Dashboard";
  }
  function animateVal(element, finalValue, prefix = "", duration = 1.5) {
    if (typeof gsap === "undefined") {
      element.textContent = prefix + finalValue.toLocaleString();
      return;
    }
    const startValue =
      parseFloat(element.textContent.replace(prefix, "").replace(/,/g, "")) ||
      0;
    gsap.to(
      { value: startValue },
      {
        value: finalValue,
        duration: duration,
        ease: "power2.out",
        onUpdate: function () {
          element.textContent =
            prefix + Math.floor(this.vars.value).toLocaleString();
        },
        onComplete: function () {
          element.textContent = prefix + finalValue.toLocaleString();
        },
      },
    );
  }
  function loadDashboard(data) {
    els.pName.textContent = data.partnerId || "Partner";
    els.refLink.textContent = `${window.location.origin}/?ref=${data.partnerId}`;
    currentTransactions = data.transactions || [];
    const paidTransactions = currentTransactions.filter(
      (tx) => tx.status === "Paid",
    );
    const totalComm = paidTransactions.reduce(
      (sum, tx) => sum + (parseFloat(tx.commission) || 0),
      0,
    );
    const totalSales = currentTransactions.length;
    animateVal(els.valComm, totalComm, "$");
    animateVal(els.valSales, totalSales, "");
    renderTable(currentTransactions);
    updateCharts(currentTransactions);
    updateMilestones(totalComm);
    initializeTipSystem();
    setupExportButtons();
    initializePartnersForm();
    initSmartLinkBuilder();
    initOrganicFeed();
    updateAIInsights(currentTransactions);
    if (typeof gsap !== "undefined") {
      const tl = gsap.timeline();
      tl.to(els.loginStage, {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          els.loginStage.classList.remove("active");
          els.dashStage.classList.remove("hidden");
          els.dashStage.classList.add("active");
        },
      }).fromTo(
        ".anim-dash",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.2)",
        },
      );
    } else {
      els.loginStage.classList.remove("active");
      els.dashStage.classList.remove("hidden");
      els.dashStage.classList.add("active");
    }
  }
  function renderTable(txs) {
    const tableBody = els.tableBody;
    if (!tableBody) return;
    tableBody.innerHTML = "";
    if (txs.length === 0) {
      for (let i = 0; i < 3; i++) {
        const tr = document.createElement("tr");
        tr.style.opacity = "0.35";
        tr.style.pointerEvents = "none";
        tr.innerHTML = `
        <td style="color: #666; font-family: monospace;">--/--/----</td>
        <td><span class="package-badge" style="background: #2a2a2a; color: #555; border: 1px solid #333;">Waiting</span></td>
        <td style="color: #666; font-family: monospace;">--------</td>
        <td style="color: #666; font-weight:700">$0.00</td>
        <td><span style="color: #666; background: rgba(255,255,255,0.05);" class="status-badge">Inactive</span></td>
      `;
        tableBody.appendChild(tr);
      }
      return;
    }
    txs.forEach((tx) => {
      const tr = document.createElement("tr");
      let statusStyle = "color:#F59E0B; background:rgba(245,158,11,0.1);";
      let statusText = tx.status;
      if (tx.status === "Completed" || tx.status === "Paid") {
        statusStyle =
          "color:#10B981; background:rgba(16,185,129,0.1); font-weight:600;";
        statusText = "Paid";
      } else if (tx.status === "Pending") {
        statusText = "Pending";
      }
      tr.innerHTML = `
        <td>${tx.date || "N/A"}</td>
        <td><span class="package-badge">${tx.package || "N/A"}</span></td>
        <td>${tx.ref || "-"}</td>
        <td style="color:var(--accent-light);font-weight:700">$${parseFloat(tx.commission || "0").toLocaleString()}</td>
        <td><span style="${statusStyle}" class="status-badge">${statusText}</span></td>
      `;
      tableBody.appendChild(tr);
    });
  }
  function updateCharts(txs) {
    const packageCounts = {};
    const earningsByDate = {};
    txs.forEach((tx) => {
      const pkg = tx.package || "Unknown";
      packageCounts[pkg] = (packageCounts[pkg] || 0) + 1;
      const date = tx.date ? tx.date.split("T")[0] : "N/A";
      if (date !== "N/A") {
        earningsByDate[date] =
          (earningsByDate[date] || 0) + (parseFloat(tx.commission) || 0);
      }
    });

    const isDummy = txs.length === 0;

    const packageCtx = document.getElementById("packageChart");
    if (packageCtx && typeof Chart !== "undefined") {
      if (charts.package) charts.package.destroy();

      let pLabels, pData, pColors;

      if (isDummy) {
        pLabels = ["Core", "Nexus", "Matrix"];
        pData = [1, 1, 1];
        pColors = ["#262626", "#333333", "#404040"];
      } else {
        pLabels = Object.keys(packageCounts);
        pData = Object.values(packageCounts);
        const colorMap = {
          core: "#aa72e7",
          nexus: "#7934b9",
          matrix: "#351250",
        };
        const fallbackColor = "#bcb4c5";
        pColors = pLabels.map((pkgName) => {
          const nameLower = pkgName.toLowerCase();
          if (nameLower.includes("core")) return colorMap.core;
          if (nameLower.includes("nexus")) return colorMap.nexus;
          if (nameLower.includes("matrix")) return colorMap.matrix;
          return fallbackColor;
        });
      }

      charts.package = new Chart(packageCtx, {
        type: "doughnut",
        data: {
          labels: pLabels,
          datasets: [
            {
              data: pData,
              backgroundColor: pColors,
              borderWidth: 0,
              hoverOffset: isDummy ? 0 : 15,
              borderColor: "rgba(18, 8, 47, 0.5)",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: isDummy ? "#555" : "#F0F0F8",
                font: { family: "Inter", size: 12 },
                padding: 20,
                usePointStyle: true,
              },
            },
            tooltip: {
              enabled: !isDummy,
              backgroundColor: "rgba(10, 10, 26, 0.9)",
              titleColor: "#A45EFF",
              bodyColor: "#fff",
              borderColor: "rgba(138, 43, 226, 0.3)",
              borderWidth: 1,
              callbacks: {
                label: (context) =>
                  ` ${context.label}: ${context.parsed} sales`,
              },
            },
          },
          cutout: "75%",
        },
      });
    }

    const trendCtx = document.getElementById("earningsTrendChart");
    if (trendCtx && typeof Chart !== "undefined") {
      if (charts.trend) charts.trend.destroy();

      let tLabels, tData, tBg, tBorder;

      if (isDummy) {
        tLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        tData = [200, 450, 300, 550, 400, 600, 350];
        tBg = "rgba(255, 255, 255, 0.03)";
        tBorder = "rgba(255, 255, 255, 0.05)";
      } else {
        const sortedDates = Object.keys(earningsByDate)
          .filter((d) => d !== "N/A")
          .sort();
        tLabels = sortedDates;
        tData = sortedDates.map((d) => earningsByDate[d]);
        tBg = "rgba(164, 94, 255, 0.7)";
        tBorder = "rgba(138, 43, 226, 1)";
      }

      charts.trend = new Chart(trendCtx, {
        type: "bar",
        data: {
          labels: tLabels,
          datasets: [
            {
              label: isDummy ? "No Data" : "Earnings ($)",
              data: tData,
              backgroundColor: tBg,
              borderColor: tBorder,
              borderWidth: 1,
              borderRadius: 6,
              hoverBackgroundColor: isDummy ? tBg : "rgba(138, 43, 226, 0.9)",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              display: !isDummy,
              grid: { color: "rgba(255, 255, 255, 0.05)", drawBorder: false },
              ticks: {
                color: "#C0C0D0",
                callback: function (value) {
                  return "$" + value;
                },
              },
            },
            x: {
              display: !isDummy,
              grid: { display: false },
              ticks: {
                color: "#C0C0D0",
                maxRotation: 45,
                minRotation: 45,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: !isDummy,
              backgroundColor: "rgba(10, 10, 26, 0.9)",
              titleColor: "#A45EFF",
              bodyColor: "#fff",
              borderColor: "rgba(138, 43, 226, 0.3)",
              borderWidth: 1,
              callbacks: {
                label: function (context) {
                  return `Earnings: $${context.parsed.y}`;
                },
              },
            },
          },
        },
      });
    }
  }
  function updateMilestones(totalComm) {
    if (typeof gsap === "undefined") return;
    els.milestoneCards.forEach((card) => {
      const target = parseInt(card.getAttribute("data-target"));
      const progress = Math.min(100, (totalComm / target) * 100);
      const fillElement = card.querySelector(".m-fill");
      const currentValElement = card.querySelector(".m-current-val");
      gsap.to(fillElement, {
        width: `${progress}%`,
        duration: 1.5,
        ease: "power2.out",
      });
      const startVal =
        parseFloat(
          currentValElement.textContent.replace("$", "").replace(/,/g, ""),
        ) || 0;
      const finalVal = Math.min(totalComm, target);
      gsap.to(
        { value: startVal },
        {
          value: finalVal,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: function () {
            currentValElement.textContent = `$${Math.floor(this.vars.value).toLocaleString()}`;
          },
          onComplete: function () {
            currentValElement.textContent = `$${finalVal.toLocaleString()}`;
          },
        },
      );
      if (totalComm >= target) {
        card.classList.remove("locked");
        card.classList.add("unlocked");
        gsap.to(card, {
          scale: 1.02,
          duration: 0.5,
          ease: "back.out(1.7)",
          boxShadow: "0 0 30px rgba(138, 43, 226, 0.4)",
        });
      } else {
        card.classList.remove("unlocked");
        card.classList.add("locked");
        gsap.to(card, { scale: 1, duration: 0.5, ease: "power2.out" });
      }
    });
  }
  function initializePartnersForm() {
    const form = document.getElementById("partnerForm");
    const formSection = document.getElementById("partnerFormSection");
    const successMessage = document.getElementById("formSuccessMessage");
    const errorMessage = document.getElementById("formErrorMessage");
    const WEBHOOK_URL = ENROLL_WEBHOOK;
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Processing...';
      errorMessage.style.display = "none";
      const formData = {
        name: document.getElementById("partnerName").value.trim(),
        email: document.getElementById("partnerEmail").value.trim(),
        phone: document.getElementById("partnerPhone").value.trim(),
        message: document.getElementById("partnerMessage").value.trim(),
      };
      if (!formData.name || !formData.email || !formData.message) {
        showFormError("Please fill in all required fields.");
        resetSubmitButton(submitBtn, originalText);
        return;
      }
      if (!validateEmail(formData.email)) {
        showFormError("Please enter a valid email address.");
        resetSubmitButton(submitBtn, originalText);
        return;
      }
      try {
        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          body: new URLSearchParams(formData),
        });
        const result = await response.json();
        if (result.result === "success") {
          showSuccess(formData.name);
          form.reset();
        } else {
          showFormError(
            result.message || "Submission failed. Please try again.",
          );
        }
      } catch (error) {
        console.error("Form submission error:", error);
        showFormError(
          "Network error. Please check your connection and try again.",
        );
      } finally {
        resetSubmitButton(submitBtn, originalText);
      }
    });
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }
    function showFormError(message) {
      errorMessage.textContent = message;
      errorMessage.style.display = "block";
      if (typeof gsap !== "undefined") {
        gsap.from(errorMessage, { y: -10, opacity: 0, duration: 0.3 });
      }
    }
    function showSuccess(userName) {
      if (formSection && successMessage) {
        formSection.style.display = "none";
        successMessage.style.display = "block";
        successMessage.querySelector(".user-name").textContent = userName;
        if (typeof gsap !== "undefined") {
          gsap.from(successMessage, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: "power2.out",
          });
        }
      }
    }
    function resetSubmitButton(btn, originalText) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
  function initSmartLinkBuilder() {
    if (els.generateLinkBtn) {
      els.generateLinkBtn.addEventListener("click", () => {
        const baseUrl = document.getElementById("targetPage").value;
        const tag = document.getElementById("campaignTag").value.trim();
        let partnerId = "PARTNER";
        if (els.pName && els.pName.textContent !== "Partner") {
          partnerId = els.pName.textContent;
        } else {
          try {
            const refText = els.refLink.textContent;
            if (refText.includes("=")) {
              partnerId = refText.split("=")[1];
            }
          } catch (e) {}
        }
        let finalUrl = `${baseUrl}?ref=${partnerId}`;
        if (tag) finalUrl += `&camp=${tag}`;
        if (els.smartLinkOutput && els.resultContainer) {
          els.smartLinkOutput.textContent = finalUrl;
          els.resultContainer.style.display = "block";
          if (typeof gsap !== "undefined") {
            gsap.from(els.resultContainer, {
              y: -10,
              opacity: 0,
              duration: 0.4,
            });
          }
        }
      });
    }
    if (els.copySmartLinkBtn) {
      els.copySmartLinkBtn.addEventListener("click", () => {
        const text = els.smartLinkOutput.textContent;
        navigator.clipboard.writeText(text).then(() => {
          const originalText = els.copySmartLinkBtn.textContent;
          els.copySmartLinkBtn.textContent = "Copied!";
          els.copySmartLinkBtn.style.background = "#10B981";
          els.copySmartLinkBtn.style.color = "white";
          setTimeout(() => {
            els.copySmartLinkBtn.textContent = originalText;
            els.copySmartLinkBtn.style.background = "";
            els.copySmartLinkBtn.style.color = "";
          }, 2000);
        });
      });
    }
  }
  function initOrganicFeed() {
    if (!els.feedTrack) return;
    const firstNames = [
      "James",
      "Mary",
      "Robert",
      "Patricia",
      "John",
      "Jennifer",
      "Michael",
      "Linda",
      "David",
      "Elizabeth",
      "William",
      "Barbara",
      "Richard",
      "Susan",
      "Joseph",
      "Jessica",
      "Thomas",
      "Sarah",
      "Charles",
      "Karen",
      "Christopher",
      "Lisa",
      "Daniel",
      "Nancy",
    ];
    const lastInitials = [
      "H.",
      "S.",
      "B.",
      "M.",
      "W.",
      "K.",
      "C.",
      "P.",
      "R.",
      "D.",
    ];
    const locations = [
      "North America",
      "Europe",
      "Asia Pacific",
      "Western Europe",
      "South America",
      "Australia",
      "Eastern Europe",
      "Northern America",
    ];
    const actions = [
      {
        type: "sale",
        text: "generated a new commission",
        amount: "$100",
        icon: "fa-dollar-sign",
      },
      {
        type: "sale",
        text: "generated a new commission",
        amount: "$150",
        icon: "fa-dollar-sign",
      },
      {
        type: "sale",
        text: "generated a new commission",
        amount: "$200",
        icon: "fa-dollar-sign",
      },
      {
        type: "join",
        text: "joined the partner network",
        amount: "",
        icon: "fa-user-plus",
      },
      {
        type: "milestone",
        text: "reached Silver Status",
        amount: "",
        icon: "fa-trophy",
      },
    ];
    function createFeedItem() {
      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lInit =
        lastInitials[Math.floor(Math.random() * lastInitials.length)];
      const fullName = `${fName} ${lInit}`;
      const action = actions[Math.floor(Math.random() * actions.length)];
      const loc = locations[Math.floor(Math.random() * locations.length)];
      let detailHtml = "";
      let iconClass = "";
      if (action.type === "sale") {
        detailHtml = `<span style="color:#A45EFF; font-weight:700; text-shadow:0 0 10px rgba(164, 94, 255, 0.3);">${action.amount}</span>`;
        iconClass = "sale";
      } else if (action.type === "join") {
        iconClass = "join";
        detailHtml = "";
      } else {
        iconClass = "sale";
        detailHtml = "";
      }
      const item = document.createElement("div");
      item.className = "feed-item";
      item.innerHTML = `
        <div class="feed-icon ${iconClass}"><i class="fas ${action.icon}"></i></div>
        <div class="feed-info">
          <span class="feed-text"><strong>${fullName}</strong> ${action.text} ${detailHtml}</span>
          <span class="feed-meta">Active in ${loc}</span>
        </div>
      `;
      els.feedTrack.prepend(item);
      setTimeout(() => item.classList.add("show"), 100);
      if (els.feedTrack.children.length > 4) {
        const lastItem = els.feedTrack.lastElementChild;
        lastItem.style.opacity = "0";
        setTimeout(() => lastItem.remove(), 600);
      }
    }
    function organicLoop() {
      const randTime = Math.floor(Math.random() * 47000) + 8000;
      setTimeout(() => {
        if (Math.random() > 0.2) createFeedItem();
        organicLoop();
      }, randTime);
    }
    setTimeout(createFeedItem, 2000);
    organicLoop();
  }
  function updateAIInsights(txs) {
    const aiForecast = document.getElementById("aiForecast");
    const aiVelocity = document.getElementById("aiVelocity");
    const aiVelocityText = document.getElementById("aiVelocityText");
    const aiAdvice = document.getElementById("aiAdvice");
    if (!aiForecast) return;

    if (txs.length === 0) {
      aiForecast.innerHTML = '<span style="color: #444;">$0.00</span>';
      aiVelocity.innerHTML = '<span style="color: #444;">0%</span>';
      if (aiVelocityText) {
        aiVelocityText.textContent = "System Standby";
        aiVelocityText.style.color = "#555";
      }
      if (aiAdvice) {
        aiAdvice.textContent =
          "System active. Waiting for initial transaction data to generate predictive strategy.";
        aiAdvice.style.color = "#777";
        aiAdvice.style.fontStyle = "italic";
      }
      return;
    }

    const totalComm = txs.reduce(
      (sum, tx) => sum + (parseFloat(tx.commission) || 0),
      0,
    );
    const date = new Date();
    const dayOfMonth = date.getDate();
    const daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate();
    let projected = 0;
    if (totalComm > 0 && dayOfMonth > 0) {
      projected = (totalComm / dayOfMonth) * daysInMonth;
    }
    animateVal(aiForecast, Math.floor(projected), "$");
    let velocityScore = 0;
    let velocityMsg = "Gathering more data...";
    if (txs.length >= 2) {
      const recentAvg =
        (parseFloat(txs[0].commission) + parseFloat(txs[1].commission)) / 2;
      const overallAvg = totalComm / txs.length;
      const change = ((recentAvg - overallAvg) / overallAvg) * 100;
      velocityScore = Math.floor(change);
      if (velocityScore > 0) {
        velocityMsg = "Trending Upwards 🚀";
        aiVelocity.style.color = "#A45EFF";
      } else {
        velocityMsg = "Cooling Down ❄️";
        aiVelocity.style.color = "#a569f5";
      }
    } else {
      velocityScore = 0;
      velocityMsg = "Gathering data...";
    }
    aiVelocity.textContent =
      (velocityScore > 0 ? "+" : "") + velocityScore + "%";
    if (aiVelocityText) aiVelocityText.textContent = velocityMsg;
    let advice = "";
    const matrixCount = txs.filter((t) => t.package === "Matrix").length;
    if (matrixCount === 0 && txs.length > 3) {
      advice =
        "Detected high volume of basic tiers. OPPORTUNITY: Upsell 'Matrix' package to increase margins by 40%. Target senior clients.";
    } else if (velocityScore < -10) {
      advice =
        "Velocity drop detected. Engagement metrics are cooling. Suggested action: Refresh your creative assets or re-post high-performing content.";
    } else if (projected > 5000) {
      advice =
        "Excellent momentum! You are on track to hit 'Gold Tier' this month. Maintain current consistency to unlock the bonus multiplier.";
    } else {
      advice =
        "Traffic quality is stable. Analyzing conversion rates... Suggest focusing on 'Nexus' package for optimal conversion-to-revenue ratio.";
    }
    if (aiAdvice) {
      aiAdvice.textContent = "";
      let i = 0;
      const typeWriter = () => {
        if (i < advice.length) {
          aiAdvice.textContent += advice.charAt(i);
          i++;
          setTimeout(typeWriter, 30);
        }
      };
      typeWriter();
    }
  }
});
const messageInput = document.getElementById("partnerMessage");
const strengthBar = document.getElementById("msgStrengthBar");
const strengthText = document.getElementById("msgStrengthText");
if (messageInput && strengthBar) {
    messageInput.addEventListener("input", () => {
        const val = messageInput.value.length;
        let width = "0%", color = "#ff4d4d", txt = "Too short";
        if (val > 20) { width = "40%"; color = "#F59E0B"; txt = "Weak"; }
        if (val > 50) { width = "70%"; color = "#6366F1"; txt = "Good"; }
        if (val > 100) { width = "100%"; color = "#10B981"; txt = "Strong!"; }
        strengthBar.style.width = width;
        strengthBar.style.background = color;
        strengthText.textContent = "Message strength: " + txt;
    });
}
const inputsToSave = ["partnerName", "partnerPhone", "partnerEmail", "partnerMessage"];
inputsToSave.forEach(id => {
    const savedVal = localStorage.getItem(id);
    if (savedVal && document.getElementById(id)) {
        document.getElementById(id).value = savedVal;
    }
});
inputsToSave.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("input", () => {
            localStorage.setItem(id, el.value);
        });
    }
});
document.addEventListener("DOMContentLoaded", function() {
  const toggleBtn = document.getElementById("policyToggle");
  const closeBtn = document.getElementById("closePolicyBtn");
  const section = document.getElementById("policySection");
  
  if (toggleBtn && section) {
    toggleBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (section.classList.contains("active")) {
        section.classList.remove("active");
      } else {
        section.classList.add("active");
      }
    };
  }
  
  if (closeBtn && section) {
    closeBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      section.classList.remove("active");
      setTimeout(function() {
        const headerOffset = 100;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }, 600);
    };
  }
});
