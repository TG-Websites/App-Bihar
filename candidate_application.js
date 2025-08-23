// ----- CONFIG -----
const API_BASE = "http://localhost:8000";
const SIGN_ENDPOINT = `${API_BASE}/api/cloudinary/signature`;             // POST
const CREATE_ENDPOINT = `${API_BASE}/candidate-applications`;         // POST (JSON after cloud upload)
const DISTRICTS_ENDPOINT = `${API_BASE}/districts`;                   // GET
const ASSEMBLIES_ENDPOINT = `${API_BASE}/legislative-assemblies`;     // GET ?district=<id>

const CLOUDINARY_UPLOAD_URL = (cloudName) =>
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

// ----- HELPERS -----
const $ = (s, c = document) => c.querySelector(s);
const statusMsg = $("#statusMsg");
const setStatus = (m, e = false) => {
    statusMsg.textContent = m || "";
    statusMsg.className = e ? "text-sm text-red-300" : "text-sm text-green-300";
};

// (same master-loaders as before)
async function loadDistricts() {
    const sel = $("#districtId");
    sel.innerHTML = `<option value="">Loading...</option>`;
    try {
        const res = await fetch(DISTRICTS_ENDPOINT, { credentials: "include" });
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
async function loadAssemblies(districtId) {
    const sel = $("#legislativeAssemblyId");
    if (!districtId) { sel.innerHTML = `<option value="">Choose district first</option>`; return; }
    sel.innerHTML = `<option value="">Loading...</option>`;
    try {
        const res = await fetch(`${ASSEMBLIES_ENDPOINT}?parentId=${encodeURIComponent(districtId)}`,
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
    return res.json(); // {timestamp, signature, apiKey, cloudName, folder}
}

async function uploadPdfToCloudinary(file, sig) {
    // file validations
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
    return data; // contains url, secure_url, public_id, bytes, etc.
}

// ----- FORM SUBMIT -----
async function onSubmit(e) {
    e.preventDefault();
    setStatus("");

    const applicantName = $("#applicantName").value.trim();
    const mobile = $("#mobile").value.trim();
    const district = $("#districtId").value;
    const legislativeAssembly = $("#legislativeAssemblyId").value;
    const address = $("#address").value.trim();

    const gharJhandaCount = +($("#gharJhandaCount").value || 0);
    const janAakroshMeetingsCount = +($("#janAakroshMeetingsCount").value || 0);
    const communityMeetingsCount = +($("#communityMeetingsCount").value || 0);

    const facebookFollowers = +($("#facebookFollowers").value || 0);
    const facebookPageLink = $("#facebookPageLink").value.trim();
    const instagramFollowers = +($("#instagramFollowers").value || 0);
    const instagramLink = $("#instagramLink").value.trim();

    const pdfFile = $("#biodataPdf").files[0];

    // basic checks
    if (!applicantName || !/^\d{10}$/.test(mobile) || !district || !legislativeAssembly || !address || !pdfFile) {
        return setStatus("Please complete required fields correctly.", true);
    }

    try {
        setStatus("Requesting upload signature...");
        const sig = await getSignature("aap_bihar/candidate_biodata");
        console.log("Signature:", sig);
        setStatus("Uploading PDF to Cloudinary...");
        const uploaded = await uploadPdfToCloudinary(pdfFile, sig.data);
        // uploaded.secure_url, uploaded.public_id available

        setStatus("Saving application...");
        const payload = {
            applicantName,
            mobile,
            district,
            legislativeAssembly,
            address,
            harGharJhandaCount: gharJhandaCount,
            janAakroshMeetingsCount,
            communityMeetingsCount,
            facebookFollowers,
            facebookPageLink,
            instagramFollowers,
            instagramLink,
            biodataPdfUrl: uploaded.secure_url,
            biodataPdfPublicId: uploaded.public_id,
        };

        const res = await fetch(CREATE_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
            return setStatus(json?.error || "Submission failed", true);
        }

        setStatus("Submitted successfully!");
        $("#candidateForm").reset();
        $("#legislativeAssemblyId").innerHTML = `<option value="">Choose...</option>`;
    } catch (err) {
        setStatus(err.message || "Something went wrong", true);
    }
}

// ----- BOOT -----
document.addEventListener("DOMContentLoaded", async () => {
    await loadDistricts();
    $("#districtId").addEventListener("change", (e) => loadAssemblies(e.target.value));
    $("#candidateForm").addEventListener("submit", onSubmit);
});
