console.log("✅ Chat Checkpoints Extension Loaded");

/* =========================
   GLOBAL STATE
========================= */

let checkpoints = [];

/* =========================
   GET CONVERSATION ID
========================= */

function getConversationId() {

    const pathParts =
        window.location.pathname.split("/");

    return pathParts[pathParts.length - 1] || "default";
}

/* =========================
   CREATE SIDEBAR
========================= */

function createSidebar() {

    // Prevent duplicate sidebar
    if (
        document.getElementById(
            "chat-checkpoints-sidebar"
        )
    ) return;

    // Sidebar
    const sidebar =
        document.createElement("div");

    sidebar.id =
        "chat-checkpoints-sidebar";

    sidebar.innerHTML = `
        <div class="cc-header">

            <h2>📌 Checkpoints</h2>

            <button id="close-sidebar-btn">
                ✖
            </button>

        </div>

        <button id="add-checkpoint-btn">
            + Save Checkpoint
        </button>

        <div id="checkpoint-list">

            <p>No checkpoints yet.</p>

        </div>
    `;

    document.body.appendChild(sidebar);

    initializeEvents();

    loadCheckpoints();

    createOpenButton();

    console.log("✅ Sidebar Injected");
}

/* =========================
   CREATE OPEN BUTTON
========================= */

function createOpenButton() {

    if (
        document.getElementById(
            "open-checkpoints-btn"
        )
    ) return;

    const openBtn =
        document.createElement("button");

    openBtn.id =
        "open-checkpoints-btn";

    openBtn.innerText = "📌";

    document.body.appendChild(openBtn);

    openBtn.addEventListener(
        "click",
        () => {

            const sidebar =
                document.getElementById(
                    "chat-checkpoints-sidebar"
                );

            if (sidebar) {

                sidebar.style.display =
                    "block";
            }
        }
    );
}

/* =========================
   INITIALIZE EVENTS
========================= */

function initializeEvents() {

    // Close sidebar
    const closeBtn =
        document.getElementById(
            "close-sidebar-btn"
        );

    closeBtn.addEventListener(
        "click",
        () => {

            const sidebar =
                document.getElementById(
                    "chat-checkpoints-sidebar"
                );

            if (sidebar) {

                sidebar.style.display =
                    "none";
            }
        }
    );

    // Save checkpoint
    const addBtn =
        document.getElementById(
            "add-checkpoint-btn"
        );

    addBtn.addEventListener(
        "click",
        saveCheckpoint
    );
}

/* =========================
   SAVE CHECKPOINT
========================= */

function saveCheckpoint() {

    // Get all user prompts
    const userMessages = document.querySelectorAll(
        '[data-message-author-role="user"]'
    );

    if (!userMessages.length) {

        alert("No user prompts found");

        return;
    }

    // Get latest user prompt
    const latestPrompt =
        userMessages[userMessages.length - 1];

    // Get prompt text
    const promptText =
        latestPrompt.innerText
            .trim()
            .slice(0, 60);

    // Prevent duplicate checkpoints
    const alreadyExists =
        checkpoints.some(

            c => c.title === promptText
        );

    if (alreadyExists) {

        alert(
            "Checkpoint already saved"
        );

        return;
    }

    // Create checkpoint object
    const checkpoint = {

        id: Date.now(),

        title:
            promptText || "Untitled",

        createdAt:
            new Date().toLocaleTimeString()
    };

    checkpoints.push(checkpoint);

    saveCheckpointsToStorage();

    renderCheckpoints();

    console.log(
        "✅ Checkpoint Saved:",
        checkpoint
    );
}

/* =========================
   RENDER CHECKPOINTS
========================= */

function renderCheckpoints() {

    const list =
        document.getElementById(
            "checkpoint-list"
        );

    if (!list) return;

    if (checkpoints.length === 0) {

        list.innerHTML = `
            <p>No checkpoints yet.</p>
        `;

        return;
    }

    list.innerHTML = "";

    checkpoints.forEach(
        (checkpoint) => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "checkpoint-item";

            item.innerHTML = `
                <div class="checkpoint-top">

                    <div>

                        <strong>
                            ${checkpoint.title}
                        </strong>

                        <p>
                            ${checkpoint.createdAt}
                        </p>

                    </div>

                    <button
                        class="delete-btn"
                        data-id="${checkpoint.id}"
                    >
                        🗑
                    </button>

                </div>
            `;

            /* =========================
               NAVIGATE TO CHECKPOINT
            ========================= */

            item.addEventListener(
                "click",
                (e) => {

                    // Ignore delete click
                    if (
                        e.target.classList.contains(
                            "delete-btn"
                        )
                    ) return;

                    // Find all user prompts
                    const userMessages =
                        document.querySelectorAll(
                            '[data-message-author-role="user"]'
                        );

                    let foundElement = null;

                    userMessages.forEach((msg) => {

                        const text =
                            msg.innerText
                                .trim()
                                .slice(0, 60);

                        // Match saved title
                        if (
                            text === checkpoint.title
                        ) {

                            foundElement = msg;
                        }

                    });

                    if (foundElement) {

                        foundElement.scrollIntoView({

                            behavior:
                                "smooth",

                            block:
                                "center"

                        });

                        // Highlight effect
                        foundElement.style.transition =
                            "0.3s";

                        foundElement.style.outline =
                            "2px solid #10a37f";

                        setTimeout(() => {

                            foundElement.style.outline =
                                "none";

                        }, 1500);

                    } else {

                        alert(
                            "Checkpoint section not found in this chat."
                        );
                    }
                }
            );

            /* =========================
               DELETE CHECKPOINT
            ========================= */

            const deleteBtn =
                item.querySelector(
                    ".delete-btn"
                );

            deleteBtn.addEventListener(
                "click",
                (e) => {

                    e.stopPropagation();

                    deleteCheckpoint(
                        checkpoint.id
                    );
                }
            );

            list.appendChild(item);
        }
    );
}

/* =========================
   DELETE CHECKPOINT
========================= */

function deleteCheckpoint(id) {

    checkpoints =
        checkpoints.filter(

            c => c.id !== id
        );

    saveCheckpointsToStorage();

    renderCheckpoints();

    console.log(
        "✅ Checkpoint Deleted:",
        id
    );
}

/* =========================
   STORAGE
========================= */

function saveCheckpointsToStorage() {

    const conversationId =
        getConversationId();

    const storageKey =
        `chatCheckpoints_${conversationId}`;

    chrome.storage.local.set({

        [storageKey]: checkpoints

    }, () => {

        console.log(
            "✅ Checkpoints Saved"
        );
    });
}

function loadCheckpoints() {

    const conversationId =
        getConversationId();

    const storageKey =
        `chatCheckpoints_${conversationId}`;

    chrome.storage.local.get(

        storageKey,

        (data) => {

            if (
                data[storageKey]
            ) {

                checkpoints =
                    data[storageKey];

            } else {

                checkpoints = [];
            }

            renderCheckpoints();

            console.log(
                "✅ Checkpoints Loaded"
            );
        }
    );
}

/* =========================
   DETECT CHAT CHANGE
========================= */

let lastUrl = location.href;

setInterval(() => {

    if (
        location.href !== lastUrl
    ) {

        lastUrl = location.href;

        checkpoints = [];

        loadCheckpoints();

        console.log(
            "✅ Chat Changed"
        );
    }

}, 1000);

/* =========================
   START EXTENSION
========================= */

window.addEventListener(
    "load",
    () => {

        setTimeout(() => {

            createSidebar();

        }, 2000);
    }
);