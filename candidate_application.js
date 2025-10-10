
// ----- CONFIG -----
const API_BASE = "https://backend.aapbihar.org";
const SIGN_ENDPOINT = `${API_BASE}/api/cloudinary/signature`;             // POST
const CREATE_ENDPOINT = `${API_BASE}/candidate-applications`;             // POST (JSON after cloud upload)
const STATES_ENDPOINT = `${API_BASE}/states`;                       // GET
const DISTRICTS_ENDPOINT = `${API_BASE}/districts`;                       // GET
const ASSEMBLIES_ENDPOINT = `${API_BASE}/legislative-assemblies`;         // GET ?parentId=<id>
const CLOUDINARY_UPLOAD_URL = (cloudName) =>
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

// ----- HELPERS -----
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => c.querySelectorAll(s);
const statusMsg = $("#statusMsg");
const setStatus = (m, e = false) => {
    statusMsg.textContent = m || "";
    statusMsg.className = e ? "text-sm text-red-300" : "text-sm text-green-300";
};

const setError = (field, message) => {
    const errorEl = $(`#${field}-error`);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = message ? "block" : "none";
    }
};

// ---------- POPUP (Shadow DOM, fully encapsulated) ----------
(function () {
    // Creates and shows a popup; returns a handle with .close()
    window.showPopup = function showPopup({
        title = "Notice",
        message = "",
        variant = "info", // "success" | "error" | "info"
        autoCloseMs,      // e.g., 3000; if undefined, defaults based on variant
    } = {}) {
        const container = document.createElement("div");
        container.setAttribute("role", "dialog");
        container.setAttribute("aria-modal", "true");
        container.style.position = "fixed";
        container.style.inset = "0";
        container.style.zIndex = "99999";
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";
        container.style.background = "rgba(0,0,0,0.45)";
        container.style.backdropFilter = "blur(2px)";

        const root = container.attachShadow({ mode: "open" });

        const wrap = document.createElement("div");
        wrap.className = "card";
        wrap.tabIndex = -1;

        const style = document.createElement("style");
        style.textContent = `
      :host { all: initial; }
      * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"; }
      .card {
        width: min(520px, calc(100vw - 32px));
        background: #ffffff;
        color: #0f172a;
        border-radius: 14px;
        box-shadow: 0 25px 40px rgba(0,0,0,.15);
        overflow: hidden;
        transform: translateY(10px);
        opacity: 0;
        animation: pop .18s ease-out forwards;
      }
      @keyframes pop { to { transform: translateY(0); opacity: 1; } }
      .header {
        display: flex; align-items: center; gap: 12px;
        padding: 16px 18px; border-bottom: 1px solid #e5e7eb;
      }
      .title { font-weight: 700; font-size: 16px; letter-spacing: .2px; }
      .body { padding: 16px 18px; font-size: 14px; line-height: 1.5; color: #334155; white-space: pre-wrap; }
      .actions { display: flex; gap: 10px; padding: 0 18px 16px 18px; justify-content: flex-end; }
      .btn {
        border: none; border-radius: 10px; padding: 10px 14px; font-weight: 600; cursor: pointer;
      }
      .btn-primary { background: #0ea5e9; color: #fff; }
      .btn-primary:hover { filter: brightness(0.95); }
      .btn-ghost { background: transparent; color: #0f172a; }
      .icon {
        width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center;
        border-radius: 999px; padding: 8px; color: #fff;
      }
      .success { background: #16a34a; }
      .error { background: #dc2626; }
      .info { background: #2563eb; }
      .close {
        margin-left: auto; background: transparent; border: none; cursor: pointer; color: #64748b;
        padding: 6px; border-radius: 8px;
      }
      .close:hover { background: #f1f5f9; color: #0f172a; }
      .sr-only {
        position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden;
        clip: rect(0, 0, 1px, 1px); white-space: nowrap; border: 0;
      }
    `;

        const iconWrap = document.createElement("div");
        iconWrap.className = `icon ${variant}`;
        iconWrap.innerHTML = ({
            success: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
            error: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>',
            info: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" d="M12 8h.01M11 12h2v4h-2z"/></svg>'
        })[variant] || "";

        const header = document.createElement("div");
        header.className = "header";
        const t = document.createElement("div");
        t.className = "title";
        t.textContent = title;

        const closeBtn = document.createElement("button");
        closeBtn.className = "close";
        closeBtn.setAttribute("aria-label", "Close");
        closeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>';

        header.appendChild(iconWrap);
        header.appendChild(t);
        header.appendChild(closeBtn);

        const body = document.createElement("div");
        body.className = "body";
        body.textContent = message || "";

        const actions = document.createElement("div");
        actions.className = "actions";
        const ok = document.createElement("button");
        ok.className = "btn btn-primary";
        ok.textContent = "OK";
        actions.appendChild(ok);

        wrap.appendChild(header);
        wrap.appendChild(body);
        wrap.appendChild(actions);
        root.appendChild(style);
        root.appendChild(wrap);

        // Add to DOM
        document.body.appendChild(container);

        // Scroll lock
        const prevOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";

        // Close logic
        let closed = false;
        const doClose = () => {
            if (closed) return;
            closed = true;
            document.documentElement.style.overflow = prevOverflow || "";
            container.remove();
        };

        // Backdrop click to close
        container.addEventListener("mousedown", (e) => {
            if (e.target === container) doClose();
        });
        // Esc key
        const onKey = (e) => { if (e.key === "Escape") doClose(); };
        document.addEventListener("keydown", onKey, { once: true });

        // Buttons
        ok.addEventListener("click", doClose);
        closeBtn.addEventListener("click", doClose);

        // Focus
        setTimeout(() => closeBtn.focus(), 10);

        // Auto close defaulting
        const auto =
            autoCloseMs !== undefined
                ? autoCloseMs
                : (variant === "success" ? 3000 : undefined);

        let timer;
        if (auto) timer = setTimeout(doClose, auto);

        return { close: doClose, el: container, timer };
    };
})();

async function loadStates() {
    const sel = $("#state");
    sel.innerHTML = `<option value="">Loading...</option>`;
    try {
        const res = await fetch(STATES_ENDPOINT, { credentials: "include" });
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : json;
        sel.innerHTML = `<option value="">Choose...</option>`;
        list.forEach(s => {
            const o = document.createElement("option");
            o.className = "text-gray-800 py-1";
            o.value = s._id || s.id; o.textContent = s.name;
            sel.appendChild(o);
        });
    } catch {
        sel.innerHTML = `<option value="">Failed to load</option>`;
    }
}

async function loadDistricts(state) {
    const sel = $("#district");
    if (!state) {
        sel.innerHTML = `<option value="">Choose state first</option>`;
        sel.disabled = true;
        return;
    }
    sel.disabled = false;
    sel.innerHTML = `<option value="">Loading...</option>`;
    try {
        const res = await fetch(`${DISTRICTS_ENDPOINT}?parentId=${encodeURIComponent(state)}`,
            { credentials: "include" });
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : json;
        sel.innerHTML = `<option value="">Choose...</option>`;
        list.forEach(d => {
            const o = document.createElement("option");
            o.className = "text-gray-800 py-1";
            o.value = d._id || d.id; o.textContent = d.name;
            sel.appendChild(o);
        });
    } catch {
        sel.innerHTML = `<option value="">Failed to load</option>`;
    }
}

async function loadAssemblies(district) {
    const sel = $("#legislativeAssembly");
    if (!district) {
        sel.innerHTML = `<option value="">Choose district first</option>`;
        sel.disabled = true;
        return;
    }
    sel.disabled = false;
    sel.innerHTML = `<option value="">Loading...</option>`;
    try {
        const res = await fetch(`${ASSEMBLIES_ENDPOINT}?parentId=${encodeURIComponent(district)}`,
            { credentials: "include" });
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : json;
        sel.innerHTML = `<option value="">Choose...</option>`;
        list.forEach(a => {
            const o = document.createElement("option");
            o.className = "text-gray-800 p-1";
            o.value = a._id || a.id; o.textContent = a.name;
            sel.appendChild(o);
        });
    } catch {
        sel.innerHTML = `<option value="">Failed to load</option>`;
    }
}

// ----- CLOUDINARY SIGNED UPLOAD -----
async function getSignature(folder) {
    const res = await fetch(SIGN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ folder })
    });
    if (!res.ok) throw new Error("Signature request failed");
    return res.json(); // {statusCode, data: {timestamp, signature, api_key, cloudname, folder}}
}

async function uploadPdfToCloudinary(file, sig) {
    if (file.type !== "application/pdf") throw new Error("Biodata must be a PDF");
    if (file.size > 10 * 1024 * 1024) throw new Error("PDF must be ≤ 10 MB");

    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.api_key);
    form.append("timestamp", sig.timestamp);
    form.append("signature", sig.signature);
    form.append("folder", "aap_bihar/candidate_biodata");

    const uploadRes = await fetch(CLOUDINARY_UPLOAD_URL(sig.cloudname), {
        method: "POST",
        body: form
    });
    const data = await uploadRes.json();
    if (!uploadRes.ok) {
        throw new Error(data?.error?.message || "Cloud upload failed");
    }
    return data; // { secure_url, public_id, ... }
}

function addTeamMember() {
    const container = $("#teamMembersContainer");
    const index = $$(".team-member").length;
    const div = document.createElement("div");
    div.className = "grid grid-cols-1 md:grid-cols-2 gap-5 team-member";
    div.innerHTML = `
        <div>
            <label for="teamMemberName${index}" class="block text-sm mb-1">Team Member ${index + 1} Name</label>
            <input id="teamMemberName${index}" name="teamMembers[${index}][name]" type="text" placeholder="Enter name"
                class="w-full rounded-xl bg-white/5 text-white placeholder-white/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-amber-300/30 focus:border-amber-300/60" />
        </div>
        <div>
            <label for="teamMemberMobile${index}" class="block text-sm mb-1">Team Member ${index + 1} Mobile</label>
            <input id="teamMemberMobile${index}" name="teamMembers[${index}][mobile]" type="tel" maxlength="10" placeholder="9876543210"
                class="w-full rounded-xl bg-white/5 text-white placeholder-white/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-amber-300/30 focus:border-amber-300/60" />
        </div>
    `;
    container.appendChild(div);
}

function validateForm() {
    let isValid = true;
    const form = $("#candidateForm");
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    // Clear all previous errors
    $$(".error-message").forEach(el => el.textContent = "");

    if (!payload.applicantName) { setError("applicantName", "Applicant name is required"); isValid = false; }
    if (!payload.fatherName) { setError("fatherName", "Father name is required"); isValid = false; }
    if (!payload.dob) { setError("dob", "Date of birth is required"); isValid = false; }
    if (!payload.gender) { setError("gender", "Gender is required"); isValid = false; }
    if (!payload.state) { setError("state", "State is required"); isValid = false; }
    if (!payload.district) { setError("district", "District is required"); isValid = false; }
    if (!payload.legislativeAssembly) { setError("legislativeAssembly", "Legislative Assembly is required"); isValid = false; }
    if (!payload.address) { setError("address", "Address is required"); isValid = false; }
    if (!/^[0-9]{10}$/.test(payload.mobile)) { setError("mobile", "Mobile number must be 10 digits."); isValid = false; }
    if (payload.whatsapp && !/^[0-9]{10}$/.test(payload.whatsapp)) { setError("whatsapp", "WhatsApp number must be 10 digits."); isValid = false; }
    if (payload.pincode && !/^[0-9]{6}$/.test(payload.pincode)) { setError("pincode", "Pincode must be 6 digits."); isValid = false; }
    if (!$("#biodataPdf").files[0]) { setError("biodataPdf", "Biodata PDF is required"); isValid = false; }

    const submitBtn = $("button[type='submit']");
    if (isValid) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add("opacity-50", "cursor-not-allowed");
    }

    return isValid;
}

// ----- FORM SUBMIT -----
async function onSubmit(e) {
    e.preventDefault();
    setStatus("");

    if (!validateForm()) {
        showPopup({
            title: "Incomplete form",
            message: "Please complete required fields correctly.",
            variant: "error"
        });
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const teamMembers = [];
    const teamMemberInputs = $$(".team-member");
    teamMemberInputs.forEach((memberDiv, index) => {
        const name = $(`[name="teamMembers[${index}][name]"]`, memberDiv).value.trim();
        const mobile = $(`[name="teamMembers[${index}][mobile]"]`, memberDiv).value.trim();
        if (name && mobile) {
            teamMembers.push({ name, mobile });
        }
    });
    payload.teamMembers = teamMembers;

    const pdfFile = $("#biodataPdf").files[0];

    try {
        setStatus("Requesting upload signature...");
        const sig = await getSignature("aap_bihar/candidate_biodata");

        setStatus("Uploading PDF to Cloudinary...");
        const uploaded = await uploadPdfToCloudinary(pdfFile, sig.data);

        setStatus("Saving application...");
        payload.biodataPdf = uploaded.secure_url;
        payload.biodataPdfPublicId = uploaded.public_id;

        const res = await fetch(CREATE_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
            const msg = json?.error || "Submission failed";
            setStatus(msg, true);
            showPopup({ title: "Submission failed", message: msg, variant: "error" });
            return;
        }

        setStatus("Submitted successfully!");
        showPopup({
            title: "Application submitted",
            message: "Thank you! Your application was submitted successfully.",
            variant: "success",
            autoCloseMs: 3000
        });

        form.reset();
        $("#legislativeAssembly").innerHTML = `<option value="">Choose...</option>`;
    } catch (err) {
        const msg = err?.message || "Something went wrong";
        setStatus(msg, true);
        showPopup({ title: "Error", message: msg, variant: "error" });
    }
}

// ----- BOOT -----
document.addEventListener("DOMContentLoaded", async () => {
    await loadStates();
    $("#state").addEventListener("change", (e) => loadDistricts(e.target.value));
    $("#district").addEventListener("change", (e) => loadAssemblies(e.target.value));
    $("#candidateForm").addEventListener("submit", onSubmit);
    $("#addTeamMemberBtn").addEventListener("click", addTeamMember);
    addTeamMember(); // Add one team member by default

    const form = $("#candidateForm");
    form.addEventListener("input", validateForm);
    validateForm(); // Initial validation
});
