const VISITOR_API =
    "https://kashru-backend.onrender.com/api/visitors";

function getSessionId() {

    let sessionId = sessionStorage.getItem("kashru_session_id");

    if (!sessionId) {

        sessionId =
            "session_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 12);

        sessionStorage.setItem(
            "kashru_session_id",
            sessionId
        );
    }

    return sessionId;
}


function detectDevice() {

    const width = window.innerWidth;

    if (width <= 768) {
        return "Mobile";
    }

    if (width <= 1024) {
        return "Tablet";
    }

    return "Desktop";
}


function detectBrowser() {

    const ua = navigator.userAgent;

    if (ua.includes("Edg")) {
        return "Edge";
    }

    if (ua.includes("Chrome")) {
        return "Chrome";
    }

    if (ua.includes("Firefox")) {
        return "Firefox";
    }

    if (ua.includes("Safari")) {
        return "Safari";
    }

    return "Other";
}


async function trackVisitor() {

    try {

        const params = new URLSearchParams();

        params.append(
            "sessionId",
            getSessionId()
        );

        params.append(
            "pageUrl",
            window.location.pathname
        );

        params.append(
            "pageTitle",
            document.title
        );

        params.append(
            "device",
            detectDevice()
        );

        params.append(
            "browser",
            detectBrowser()
        );


        const response = await fetch(
            `${VISITOR_API}/track?${params.toString()}`,
            {
                method: "POST"
            }
        );


        if (!response.ok) {

            console.error(
                "Visitor tracking failed:",
                response.status
            );

        } else {

            console.log(
                "Visitor tracked:",
                window.location.pathname
            );

        }

    } catch (error) {

        console.error(
            "Visitor tracking error:",
            error
        );

    }
}


// Track immediately
trackVisitor();


// Heartbeat every 1 minute
setInterval(
    trackVisitor,
    60 * 1000
);