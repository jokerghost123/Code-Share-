
(function () {
    function ensureContainer() {
        let c = document.getElementById("toast-container");
        if (!c) {
            c = document.createElement("div");
            c.id = "toast-container";
            document.body.appendChild(c);
        }
        return c;
    }

    const ICONS = {
        info: "fa-solid fa-circle-info",
        success: "fa-solid fa-circle-check",
        error: "fa-solid fa-triangle-exclamation"
    };

    window.showToast = function (message, type = "info", duration = 3500) {
        const container = ensureContainer();
        const toast = document.createElement("div");
        toast.className = `app-toast ${type === "info" ? "" : type}`;
        toast.innerHTML = `
            <i class="app-toast-icon ${ICONS[type] || ICONS.info}"></i>
            <span class="app-toast-text"></span>
            <button class="app-toast-close" aria-label="Fermer"><i class="fa-solid fa-xmark"></i></button>
        `;
        toast.querySelector(".app-toast-text").textContent = message;
        container.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add("show"));

        const remove = () => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 250);
        };
        toast.querySelector(".app-toast-close").onclick = remove;
        const timer = setTimeout(remove, duration);
        toast.addEventListener("mouseenter", () => clearTimeout(timer));
    };


    window.showActionSheet = function (title, actions) {
        return new Promise((resolve) => {
            const overlay = document.createElement("div");
            overlay.className = "app-modal-overlay";
            const btnsHtml = actions.map((a, i) => `
                <button class="app-sheet-btn ${a.danger ? "danger" : ""}" data-i="${i}">
                    <i class="${a.icon || "fa-solid fa-circle"}"></i>
                    <span>${a.label}</span>
                </button>
            `).join("");
            overlay.innerHTML = `
                <div class="app-sheet-card">
                    ${title ? `<div class="app-sheet-title">${title}</div>` : ""}
                    <div class="app-sheet-actions">${btnsHtml}</div>
                    <button class="app-sheet-btn cancel-sheet"><span>Annuler</span></button>
                </div>
            `;
            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add("show"));

            const close = (result) => {
                overlay.classList.remove("show");
                setTimeout(() => overlay.remove(), 200);
                resolve(result);
            };
            overlay.querySelectorAll(".app-sheet-btn[data-i]").forEach((btn) => {
                btn.onclick = () => close(actions[parseInt(btn.dataset.i, 10)].key);
            });
            overlay.querySelector(".cancel-sheet").onclick = () => close(null);
            overlay.addEventListener("click", (e) => { if (e.target === overlay) close(null); });
        });
    };

    window.showConfirm = function (message, opts = {}) {
        const {
            title = "Confirmation",
            danger = false,
            confirmLabel = "Confirmer",
            cancelLabel = "Annuler"
        } = opts;

        return new Promise((resolve) => {
            const overlay = document.createElement("div");
            overlay.className = "app-modal-overlay";
            overlay.innerHTML = `
                <div class="app-modal-card ${danger ? "danger" : ""}">
                    <div class="app-modal-icon">
                        <i class="fa-solid ${danger ? "fa-trash-can" : "fa-circle-question"}"></i>
                    </div>
                    <h3 class="app-modal-title"></h3>
                    <p class="app-modal-message"></p>
                    <div class="app-modal-actions">
                        <button class="app-modal-btn cancel"></button>
                        <button class="app-modal-btn confirm"></button>
                    </div>
                </div>
            `;
            overlay.querySelector(".app-modal-title").textContent = title;
            overlay.querySelector(".app-modal-message").textContent = message;
            overlay.querySelector(".cancel").textContent = cancelLabel;
            overlay.querySelector(".confirm").textContent = confirmLabel;
            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add("show"));

            const close = (result) => {
                overlay.classList.remove("show");
                setTimeout(() => overlay.remove(), 200);
                resolve(result);
            };
            overlay.querySelector(".cancel").onclick = () => close(false);
            overlay.querySelector(".confirm").onclick = () => close(true);
            overlay.addEventListener("click", (e) => { if (e.target === overlay) close(false); });
        });
    };
})();
