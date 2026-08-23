const VISITOR_API =
    "https://kashru-backend.onrender.com/api/visitors";


// ===============================
// SESSION ID
// ===============================

function getSessionId() {

    let sessionId =
        localStorage.getItem("kashru_visitor_session");

    if (!sessionId) {

        sessionId =
            "session_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 12);

        localStorage.setItem(
            "kashru_visitor_session",
            sessionId
        );
    }

    return sessionId;
}


// ===============================
// DEVICE
// ===============================

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


// ===============================
// BROWSER
// ===============================

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


// ===============================
// GET LOCATION
// ===============================

async function getLocation() {

    try {

        const response =
            await fetch("https://ipapi.co/json/");

        if (!response.ok) {
            throw new Error(
                "Location API failed: " +
                response.status
            );
        }

        const data =
            await response.json();

        return {

            country:
                data.country_name || "",

            city:
                data.city || ""

        };

    } catch (error) {

        console.error(
            "Location detection failed:",
            error
        );

        return {
            country: "",
            city: ""
        };
    }
}


// ===============================
// TRACK VISITOR
// ===============================

async function trackVisitor() {

    try {

        // Get country and city
        const location =
            await getLocation();


        const params =
            new URLSearchParams();


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


        // Location
        params.append(
            "country",
            location.country
        );


        params.append(
            "city",
            location.city
        );


        const response =
            await fetch(
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
                {
                    page: window.location.pathname,
                    country: location.country,
                    city: location.city
                }
            );

        }

    } catch (error) {

        console.error(
            "Visitor tracking error:",
            error
        );

    }
}


// ===============================
// INITIAL TRACKING
// ===============================

trackVisitor();


// ===============================
// HEARTBEAT - EVERY 1 MINUTE
// ===============================

setInterval(
    trackVisitor,
    60 * 1000
);