(function () {
    "use strict";

    // =========================================================
    // KASHRU AI CHAT WIDGET
    // =========================================================

    const currentScript = document.currentScript;

  const API_URL = "https://kashru-chatbot.onrender.com/api/v1/chat";

    const BRAND =
        currentScript?.dataset.brand ||
        "Kashru AI Assistant";

    const WHATSAPP_URL =
        "https://wa.me/919806604871?text=Hi%20Kashru%20Technologies%2C%20I%20want%20to%20discuss%20a%20project";


    // =========================================================
    // PREVENT DUPLICATE WIDGET
    // =========================================================

    if (document.getElementById("kashru-chat-widget")) {
        console.warn("Kashru Chat Widget already loaded.");
        return;
    }


    // =========================================================
    // STYLES
    // =========================================================

    const styles = document.createElement("style");

    styles.textContent = `

        #kashru-chat-widget {

            --kc-bg: #07111f;
            --kc-panel: #0b1728;
            --kc-border: rgba(126, 192, 255, 0.22);

            --kc-text: #eef6ff;
            --kc-muted: #9bb3ca;

            --kc-blue: #1557b0;
            --kc-blue-2: #55c8ff;

            --kc-user: #123b68;

            position: fixed;

            right: 22px;
            bottom: 22px;

            z-index: 999999;

            font-family:
                Inter,
                ui-sans-serif,
                system-ui,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;

            color: var(--kc-text);
        }


        #kashru-chat-widget * {
            box-sizing: border-box;
        }


        /* =====================================================
           LAUNCHER
        ===================================================== */

        .kc-launcher {

            width: 64px;
            height: 64px;

            border: 0;

            border-radius: 50%;

            background:
                linear-gradient(
                    135deg,
                    #1557b0,
                    #0d75d8
                );

            color: white;

            cursor: pointer;

            display: grid;
            place-items: center;

            box-shadow:
                0 15px 40px rgba(0, 55, 130, 0.45);

            transition:
                transform .2s ease,
                box-shadow .2s ease;
        }


        .kc-launcher:hover {

            transform:
                translateY(-3px)
                scale(1.03);

            box-shadow:
                0 20px 50px rgba(0, 55, 130, 0.55);
        }


        .kc-launcher svg {

            width: 30px;
            height: 30px;
        }


        /* =====================================================
           CHAT PANEL
        ===================================================== */

        .kc-panel {

            width:
                min(
                    380px,
                    calc(100vw - 32px)
                );

            height:
                min(
                    590px,
                    calc(100vh - 105px)
                );

            margin-bottom: 14px;

            border:
                1px solid var(--kc-border);

            border-radius: 20px;

            overflow: hidden;

            display: none;

            flex-direction: column;

            background:

                radial-gradient(
                    circle at top right,
                    rgba(47, 140, 255, .22),
                    transparent 35%
                ),

                var(--kc-panel);

            box-shadow:
                0 25px 80px rgba(0,0,0,.42);
        }


        .kc-panel.kc-open {

            display: flex;
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .kc-header {

            padding:
                16px
                16px
                15px;

            border-bottom:
                1px solid var(--kc-border);

            display: flex;

            align-items: center;

            gap: 12px;
        }


        .kc-mark {

            width: 42px;
            height: 42px;

            border-radius: 13px;

            display: grid;
            place-items: center;

            background:
                linear-gradient(
                    135deg,
                    #1557b0,
                    #0d75d8
                );

            color: white;

            font-size: 18px;

            font-weight: 800;

            box-shadow:
                0 6px 18px rgba(21,87,176,.3);
        }


        .kc-title {

            font-size: 15px;

            font-weight: 800;

            line-height: 1.2;
        }


        .kc-status {

            font-size: 12px;

            color: var(--kc-muted);

            margin-top: 3px;
        }


        .kc-close {

            margin-left: auto;

            width: 34px;
            height: 34px;

            border: 0;

            border-radius: 50%;

            background:
                rgba(255,255,255,.07);

            color: var(--kc-text);

            cursor: pointer;

            font-size: 21px;
        }


        .kc-close:hover {

            background:
                rgba(255,255,255,.13);
        }


        /* =====================================================
           MESSAGES
        ===================================================== */

        .kc-messages {

            flex: 1;

            padding: 16px;

            overflow-y: auto;

            display: flex;

            flex-direction: column;

            gap: 10px;
        }


        .kc-msg {

            max-width: 86%;

            padding:
                11px
                13px;

            border-radius: 15px;

            font-size: 14px;

            line-height: 1.5;

            white-space: pre-wrap;

            word-break: break-word;
        }


        .kc-bot {

            align-self: flex-start;

            background:
                rgba(255,255,255,.07);

            border:
                1px solid rgba(255,255,255,.08);

            border-bottom-left-radius: 6px;
        }


        .kc-user {

            align-self: flex-end;

            background:
                var(--kc-user);

            border:
                1px solid rgba(107,214,255,.16);

            border-bottom-right-radius: 6px;
        }


        /* =====================================================
           TYPING
        ===================================================== */

        .kc-typing {

            align-self: flex-start;

            display: none;

            gap: 4px;

            padding: 12px;

            border-radius: 14px;

            background:
                rgba(255,255,255,.07);
        }


        .kc-typing span {

            width: 6px;
            height: 6px;

            border-radius: 50%;

            background:
                var(--kc-blue-2);

            animation:
                kc-pulse
                1s
                infinite
                ease-in-out;
        }


        .kc-typing span:nth-child(2) {

            animation-delay:
                .15s;
        }


        .kc-typing span:nth-child(3) {

            animation-delay:
                .3s;
        }


        @keyframes kc-pulse {

            0%,
            80%,
            100% {

                opacity: .3;

                transform:
                    translateY(0);
            }

            40% {

                opacity: 1;

                transform:
                    translateY(-3px);
            }
        }


        /* =====================================================
           WHATSAPP HANDOFF
        ===================================================== */

        .kc-actions {

            display: flex;

            margin-top: 9px;
        }


        .kc-whatsapp {

            display: inline-flex;

            align-items: center;

            justify-content: center;

            min-height: 37px;

            padding:
                8px
                13px;

            border-radius: 999px;

            background:
                #1fb55f;

            color: white;

            text-decoration: none;

            font-size: 13px;

            font-weight: 700;

            transition:
                transform .15s ease;
        }


        .kc-whatsapp:hover {

            transform:
                translateY(-1px);
        }


        /* =====================================================
           INPUT
        ===================================================== */

        .kc-form {

            padding: 12px;

            border-top:
                1px solid var(--kc-border);

            display: flex;

            gap: 8px;

            background:
                rgba(3, 8, 16, .42);
        }


        .kc-input {

            flex: 1;

            min-width: 0;

            min-height: 43px;

            border:
                1px solid rgba(255,255,255,.12);

            border-radius: 999px;

            background:
                rgba(255,255,255,.07);

            color:
                var(--kc-text);

            padding:
                0 14px;

            outline: none;

            font: inherit;

            font-size: 14px;
        }


        .kc-input:focus {

            border-color:
                rgba(85,200,255,.55);
        }


        .kc-input::placeholder {

            color:
                #7891a8;
        }


        .kc-send {

            width: 43px;
            height: 43px;

            flex: 0 0 43px;

            border: 0;

            border-radius: 50%;

            background:
                var(--kc-blue);

            color: white;

            cursor: pointer;

            display: grid;

            place-items: center;
        }


        .kc-send:hover {

            background:
                #0d75d8;
        }


        .kc-send:disabled {

            opacity: .55;

            cursor:
                not-allowed;
        }


        .kc-send svg {

            width: 19px;
            height: 19px;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 520px) {

            #kashru-chat-widget {

                right: 15px;

                bottom: 15px;
            }


            .kc-launcher {

                width: 58px;
                height: 58px;
            }


            .kc-panel {

                width:
                    calc(100vw - 30px);

                height:
                    calc(100vh - 95px);

                border-radius:
                    18px;
            }
        }

    `;


    document.head.appendChild(styles);


    // =========================================================
    // CREATE WIDGET
    // =========================================================

    function createWidget() {

        if (document.getElementById("kashru-chat-widget")) {
            return;
        }


        const root =
            document.createElement("div");

        root.id =
            "kashru-chat-widget";


        root.innerHTML = `

            <div
                class="kc-panel"
                role="dialog"
                aria-label="${escapeHtml(BRAND)}"
            >

                <div class="kc-header">

                    <div class="kc-mark">
                        K
                    </div>

                    <div>

                        <div class="kc-title">
                            ${escapeHtml(BRAND)}
                        </div>

                        <div class="kc-status">
                            Usually replies instantly
                        </div>

                    </div>

                    <button
                        class="kc-close"
                        type="button"
                        aria-label="Close chat"
                    >
                        ×
                    </button>

                </div>


                <div
                    class="kc-messages"
                    aria-live="polite"
                ></div>


                <div
                    class="kc-typing"
                    aria-label="Assistant is typing"
                >

                    <span></span>
                    <span></span>
                    <span></span>

                </div>


                <form class="kc-form">

                    <input
                        class="kc-input"
                        type="text"
                        maxlength="1000"
                        placeholder="Ask about our services..."
                        autocomplete="off"
                    />

                    <button
                        class="kc-send"
                        type="submit"
                        aria-label="Send message"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >

                            <path
                                d="M5 12h13M13 6l6 6-6 6"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />

                        </svg>

                    </button>

                </form>

            </div>


            <button
                class="kc-launcher"
                type="button"
                aria-label="Open Kashru AI Assistant"
            >

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >

                    <path
                        d="M7.5 18.5 4 21v-4.8A8.3 8.3 0 0 1 3 12C3 7.6 7 4 12 4s9 3.6 9 8-4 8-9 8c-1.6 0-3.1-.3-4.5-1.5Z"
                        stroke="currentColor"
                        stroke-width="1.9"
                        stroke-linejoin="round"
                    />

                    <path
                        d="M8 11.5h8M8 14.5h5"
                        stroke="currentColor"
                        stroke-width="1.9"
                        stroke-linecap="round"
                    />

                </svg>

            </button>
        `;


        document.body.appendChild(root);


        // =====================================================
        // ELEMENTS
        // =====================================================

        const panel =
            root.querySelector(".kc-panel");

        const launcher =
            root.querySelector(".kc-launcher");

        const close =
            root.querySelector(".kc-close");

        const messages =
            root.querySelector(".kc-messages");

        const form =
            root.querySelector(".kc-form");

        const input =
            root.querySelector(".kc-input");

        const send =
            root.querySelector(".kc-send");

        const typing =
            root.querySelector(".kc-typing");


        let greeted = false;


        // =====================================================
        // OPEN CHAT
        // =====================================================

        launcher.addEventListener(
            "click",
            function () {

                panel.classList.toggle(
                    "kc-open"
                );


                if (
                    panel.classList.contains(
                        "kc-open"
                    )
                ) {

                    input.focus();


                    if (!greeted) {

                        addMessage(
                            "bot",
                            "Hi! 👋 I'm Kashru's AI Assistant. Ask me about our services, technologies, products, or projects."
                        );

                        greeted = true;
                    }
                }

            }
        );


        // =====================================================
        // CLOSE CHAT
        // =====================================================

        close.addEventListener(
            "click",
            function () {

                panel.classList.remove(
                    "kc-open"
                );

            }
        );


        // =====================================================
        // SEND MESSAGE
        // =====================================================

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const message =
                    input.value.trim();


                if (!message) {
                    return;
                }


                addMessage(
                    "user",
                    message
                );


                input.value = "";


                setBusy(true);


                try {

                    console.log(
                        "Kashru AI request:",
                        API_URL
                    );


                    const response =
                        await fetch(
                            API_URL,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        message:
                                            message
                                    })
                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            "Chat API returned " +
                            response.status
                        );
                    }


                    const data =
                        await response.json();


                    console.log(
                        "Kashru AI response:",
                        data
                    );


                    addMessage(

                        "bot",

                        data.answer ||
                        "I don't have that detail yet. I can connect you with our team.",

                        data.handoff,

                        data.whatsapp_url
                    );


                } catch (error) {

                    console.error(
                        "Kashru AI error:",
                        error
                    );


                    addMessage(

                        "bot",

                        "I'm having trouble reaching the AI assistant right now. You can contact our team directly on WhatsApp.",

                        true,

                        WHATSAPP_URL
                    );


                } finally {

                    setBusy(false);

                    input.focus();
                }

            }
        );


        // =====================================================
        // ADD MESSAGE
        // =====================================================

        function addMessage(
            type,
            text,
            handoff = false,
            whatsappUrl = null
        ) {

            const item =
                document.createElement("div");


            item.className =
                `kc-msg kc-${type}`;


            item.textContent =
                text;


            if (handoff) {

                const actions =
                    document.createElement("div");

                actions.className =
                    "kc-actions";


                const link =
                    document.createElement("a");

                link.className =
                    "kc-whatsapp";


                link.href =
                    whatsappUrl ||
                    WHATSAPP_URL;


                link.target =
                    "_blank";


                link.rel =
                    "noopener noreferrer";


                link.textContent =
                    "💬 Chat on WhatsApp";


                actions.appendChild(
                    link
                );


                item.appendChild(
                    actions
                );
            }


            messages.appendChild(
                item
            );


            messages.scrollTop =
                messages.scrollHeight;
        }


        // =====================================================
        // LOADING STATE
        // =====================================================

        function setBusy(
            isBusy
        ) {

            typing.style.display =
                isBusy
                    ? "flex"
                    : "none";


            send.disabled =
                isBusy;


            input.disabled =
                isBusy;


            messages.scrollTop =
                messages.scrollHeight;
        }

    }


    // =========================================================
    // ESCAPE HTML
    // =========================================================

    function escapeHtml(value) {

        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            );
    }


    // =========================================================
    // START WIDGET
    // =========================================================

    function startWidget() {

        try {

            createWidget();

            console.log(
                "✅ Kashru AI Chat Widget loaded successfully."
            );

            console.log(
                "🤖 API:",
                API_URL
            );

        } catch (error) {

            console.error(
                "❌ Kashru Chat Widget failed to load:",
                error
            );
        }
    }


    // =========================================================
    // DOM READY
    // =========================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startWidget
        );

    } else {

        startWidget();
    }

})();