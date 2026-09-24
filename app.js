// ================= RUNOVA APP =================


// ================= BMI =================

function calculateBMI(weight, height) {

    if (!weight || !height) {
        return "--";
    }

    const heightInMeters = height / 100;

    const bmi =
        weight / (heightInMeters * heightInMeters);

    return bmi.toFixed(1);
}


// ================= REGISTER =================

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const user = {

            name:
                document.getElementById("name").value.trim(),

            email:
                document.getElementById("email").value.trim(),

            password:
                document.getElementById("password").value,

            weight:
                Number(
                    document.getElementById("weight").value
                ),

            height:
                Number(
                    document.getElementById("height").value
                ),

            age:
                Number(
                    document.getElementById("age").value
                )

        };


        localStorage.setItem(
            "runovaUser",
            JSON.stringify(user)
        );


        window.location.href =
            "dashboard.html";

    });

}


// ================= LOGIN =================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const savedUser =
            localStorage.getItem("runovaUser");


        if (!savedUser) {

            alert(
                "No account found. Please create an account first."
            );

            return;

        }


        const user =
            JSON.parse(savedUser);


        const email =
            document.getElementById("loginEmail")
                .value
                .trim();


        const password =
            document.getElementById("loginPassword")
                .value;


        if (
            email === user.email &&
            password === user.password
        ) {

            window.location.href =
                "dashboard.html";

        } else {

            alert(
                "Incorrect email or password."
            );

        }

    });

}


// ================= DASHBOARD =================

const dashboardName =
    document.getElementById("dashboardName");


if (dashboardName) {

    const savedUser =
        localStorage.getItem("runovaUser");


    if (!savedUser) {

        window.location.href =
            "register.html";

    } else {

        const user =
            JSON.parse(savedUser);


        const userName =
            document.getElementById("userName");


        if (userName) {

            userName.textContent =
                user.name;

        }


        dashboardName.textContent =
            user.name;


        const userWeight =
            document.getElementById("userWeight");


        if (userWeight) {

            userWeight.textContent =
                user.weight + " kg";

        }


        const userHeight =
            document.getElementById("userHeight");


        if (userHeight) {

            userHeight.textContent =
                user.height + " cm";

        }


        const userAge =
            document.getElementById("userAge");


        if (userAge) {

            userAge.textContent =
                user.age;

        }


        const userBMI =
            document.getElementById("userBMI");


        if (userBMI) {

            userBMI.textContent =
                calculateBMI(
                    user.weight,
                    user.height
                );

        }

    }

}


// ================= PROFILE =================

const profileName =
    document.getElementById("profileName");


if (profileName) {

    const savedUser =
        localStorage.getItem("runovaUser");


    if (!savedUser) {

        window.location.href =
            "register.html";

    } else {

        const user =
            JSON.parse(savedUser);


        profileName.textContent =
            user.name;


        const profileEmail =
            document.getElementById("profileEmail");


        if (profileEmail) {

            profileEmail.textContent =
                user.email;

        }


        const profileWeight =
            document.getElementById("profileWeight");


        if (profileWeight) {

            profileWeight.textContent =
                user.weight + " kg";

        }


        const profileHeight =
            document.getElementById("profileHeight");


        if (profileHeight) {

            profileHeight.textContent =
                user.height + " cm";

        }


        const profileAge =
            document.getElementById("profileAge");


        if (profileAge) {

            profileAge.textContent =
                user.age;

        }


        const bmi =
            calculateBMI(
                user.weight,
                user.height
            );


        const profileBMI =
            document.getElementById("profileBMI");


        if (profileBMI) {

            profileBMI.textContent =
                bmi;

        }


        const profileBMIBig =
            document.getElementById("profileBMIBig");


        if (profileBMIBig) {

            profileBMIBig.textContent =
                bmi;

        }

    }

}


// ================= LOGOUT =================

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "runovaUser"
            );


            window.location.href =
                "index.html";

        }
    );

}


// =====================================================
// ================= RUN TRACKER =======================
// =====================================================

const startRunButton =
    document.getElementById("startRun");

const pauseRunButton =
    document.getElementById("pauseRun");

const stopRunButton =
    document.getElementById("stopRun");

const runTimeElement =
    document.getElementById("runTime");

const runDistanceElement =
    document.getElementById("runDistance");

const runSpeedElement =
    document.getElementById("runSpeed");

const runPaceElement =
    document.getElementById("runPace");

const runCaloriesElement =
    document.getElementById("runCalories");

const gpsStatusElement =
    document.getElementById("gpsStatus");

const gpsMessageElement =
    document.getElementById("gpsMessage");

const runMapElement =
    document.getElementById("runMap");


// ================= RUN VARIABLES =================

let map = null;

let userMarker = null;

let routeLine = null;

let watchId = null;

let timerInterval = null;

let startTime = null;

let pausedDuration = 0;

let pauseStartedAt = null;

let totalDistance = 0;

let currentSpeed = 0;

let lastPosition = null;

let routeCoordinates = [];

let runActive = false;

let runPaused = false;


// ================= FORMAT TIME =================

function formatTime(totalSeconds) {

    const hours =
        Math.floor(totalSeconds / 3600);

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const seconds =
        Math.floor(totalSeconds % 60);

    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );

}


// ================= FORMAT PACE =================

function formatPace(secondsPerKm) {

    if (
        !isFinite(secondsPerKm) ||
        secondsPerKm <= 0
    ) {

        return "--:-- /km";

    }


    const minutes =
        Math.floor(secondsPerKm / 60);

    const seconds =
        Math.floor(secondsPerKm % 60);

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0") +
        " /km"
    );

}


// ================= DISTANCE =================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const earthRadius = 6371000;

    const latitudeDifference =
        (lat2 - lat1) *
        Math.PI /
        180;

    const longitudeDifference =
        (lon2 - lon1) *
        Math.PI /
        180;

    const a =
        Math.sin(latitudeDifference / 2) *
        Math.sin(latitudeDifference / 2) +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(longitudeDifference / 2) *
        Math.sin(longitudeDifference / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;

}


// ================= INITIALIZE MAP =================

function initializeRunMap() {

    if (
        !runMapElement ||
        typeof L === "undefined"
    ) {

        if (gpsMessageElement) {

            gpsMessageElement.textContent =
                "Map library could not be loaded.";

        }

        return;

    }


    map =
        L.map("runMap");


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }
    ).addTo(map);


    // Default view

    map.setView(
        [36.7365, 3.0588],
        6
    );


    routeLine =
        L.polyline(
            [],
            {
                weight: 5
            }
        ).addTo(map);


    // Fix Leaflet display

    setTimeout(
        function () {

            map.invalidateSize();

        },
        300
    );

}


// ================= GPS SUCCESS =================

function handlePosition(position) {

    if (
        !runActive ||
        runPaused
    ) {

        return;

    }


    const latitude =
        position.coords.latitude;

    const longitude =
        position.coords.longitude;

    const accuracy =
        position.coords.accuracy;


    const currentPosition = {

        latitude:
            latitude,

        longitude:
            longitude

    };


    // Show GPS information

    if (gpsStatusElement) {

        gpsStatusElement.textContent =
            "GPS Connected";

    }


    if (gpsMessageElement) {

        gpsMessageElement.textContent =
            "Accuracy: " +
            Math.round(accuracy) +
            " meters";

    }


    /*
        We no longer reject the GPS
        when accuracy is above 100m.

        This allows the map to work
        even when GPS is temporarily weak.
    */


    if (lastPosition) {

        const distance =
            calculateDistance(
                lastPosition.latitude,
                lastPosition.longitude,
                latitude,
                longitude
            );


        /*
            Ignore unrealistic GPS jumps.
        */

        if (
            distance > 0 &&
            distance <= 100
        ) {

            totalDistance +=
                distance;

        }

    }


    lastPosition =
        currentPosition;


    routeCoordinates.push([
        latitude,
        longitude
    ]);


    // ================= MAP =================

    if (map) {

        const latLng =
            [
                latitude,
                longitude
            ];


        if (!userMarker) {

            userMarker =
                L.marker(latLng)
                    .addTo(map)
                    .bindPopup(
                        "RUNOVA — You are here"
                    );

        } else {

            userMarker.setLatLng(
                latLng
            );

        }


        routeLine.setLatLngs(
            routeCoordinates
        );


        map.setView(
            latLng,
            17
        );

    }


    // ================= SPEED =================

    if (
        position.coords.speed !== null &&
        position.coords.speed >= 0
    ) {

        currentSpeed =
            position.coords.speed * 3.6;

    }


    updateRunStats();

}


// ================= GPS ERROR =================

function handleGPSError(error) {

    if (!gpsStatusElement) {

        return;

    }


    gpsStatusElement.textContent =
        "GPS Error";


    if (error.code === 1) {

        gpsMessageElement.textContent =
            "Location permission was denied.";

    }

    else if (error.code === 2) {

        gpsMessageElement.textContent =
            "Location unavailable.";

    }

    else if (error.code === 3) {

        gpsMessageElement.textContent =
            "GPS timed out. Trying again...";

    }

    else {

        gpsMessageElement.textContent =
            "Unable to access GPS.";

    }

}


// ================= TIMER =================

function updateRunTimer() {

    if (
        !runActive ||
        runPaused ||
        !startTime
    ) {

        return;

    }


    const elapsed =
        Math.floor(
            (
                Date.now() -
                startTime -
                pausedDuration
            ) / 1000
        );


    if (runTimeElement) {

        runTimeElement.textContent =
            formatTime(elapsed);

    }


    updateRunStats();

}


// ================= STATS =================

function updateRunStats() {

    const distanceKm =
        totalDistance / 1000;


    if (runDistanceElement) {

        runDistanceElement.textContent =
            distanceKm.toFixed(2) +
            " km";

    }


    if (runSpeedElement) {

        runSpeedElement.textContent =
            currentSpeed.toFixed(1) +
            " km/h";

    }


    if (
        startTime &&
        !runPaused &&
        distanceKm > 0
    ) {

        const elapsedSeconds =
            (
                Date.now() -
                startTime -
                pausedDuration
            ) / 1000;


        const paceSeconds =
            elapsedSeconds /
            distanceKm;


        if (runPaceElement) {

            runPaceElement.textContent =
                formatPace(
                    paceSeconds
                );

        }


        calculateCalories(
            elapsedSeconds
        );

    }

}


// ================= CALORIES =================

function calculateCalories(
    elapsedSeconds
) {

    const savedUser =
        localStorage.getItem(
            "runovaUser"
        );


    if (!savedUser) {

        return;

    }


    const user =
        JSON.parse(savedUser);


    const weight =
        Number(user.weight);


    if (
        !weight ||
        weight <= 0
    ) {

        return;

    }


    const distanceKm =
        totalDistance / 1000;


    const calories =
        weight *
        distanceKm;


    if (runCaloriesElement) {

        runCaloriesElement.textContent =
            Math.round(calories);

    }

}


// ================= START RUN =================

function startRun() {

    if (
        !navigator.geolocation
    ) {

        alert(
            "Geolocation is not supported by this browser."
        );

        return;

    }


    if (
        runActive &&
        !runPaused
    ) {

        return;

    }


    // RESUME

    if (runPaused) {

        pausedDuration +=
            Date.now() -
            pauseStartedAt;


        pauseStartedAt =
            null;


        runPaused =
            false;


        startGPS();

        startTimer();

        updateButtons();


        gpsStatusElement.textContent =
            "GPS Connected";


        gpsMessageElement.textContent =
            "Run resumed.";

        return;

    }


    // NEW RUN

    runActive =
        true;


    runPaused =
        false;


    startTime =
        Date.now();


    pausedDuration =
        0;


    totalDistance =
        0;


    currentSpeed =
        0;


    lastPosition =
        null;


    routeCoordinates =
        [];


    if (userMarker && map) {

        map.removeLayer(
            userMarker
        );

        userMarker =
            null;

    }


    if (routeLine) {

        routeLine.setLatLngs([]);

    }


    if (runTimeElement) {

        runTimeElement.textContent =
            "00:00:00";

    }


    if (runDistanceElement) {

        runDistanceElement.textContent =
            "0.00 km";

    }


    if (runSpeedElement) {

        runSpeedElement.textContent =
            "0.0 km/h";

    }


    if (runPaceElement) {

        runPaceElement.textContent =
            "--:-- /km";

    }


    if (runCaloriesElement) {

        runCaloriesElement.textContent =
            "0";

    }


    gpsStatusElement.textContent =
        "Searching GPS...";


    gpsMessageElement.textContent =
        "Move outdoors for better accuracy.";


    startGPS();

    startTimer();

    updateButtons();

}


// ================= START GPS =================

function startGPS() {

    if (watchId !== null) {

        navigator.geolocation.clearWatch(
            watchId
        );

    }


    watchId =
        navigator.geolocation.watchPosition(
            handlePosition,
            handleGPSError,
            {
                enableHighAccuracy: true,

                maximumAge: 0,

                timeout: 20000
            }
        );

}


// ================= STOP GPS =================

function stopGPS() {

    if (watchId !== null) {

        navigator.geolocation.clearWatch(
            watchId
        );

        watchId =
            null;

    }

}


// ================= TIMER START =================

function startTimer() {

    if (timerInterval) {

        clearInterval(
            timerInterval
        );

    }


    timerInterval =
        setInterval(
            updateRunTimer,
            1000
        );

}


// ================= TIMER STOP =================

function stopTimer() {

    if (timerInterval) {

        clearInterval(
            timerInterval
        );

        timerInterval =
            null;

    }

}


// ================= PAUSE =================

function pauseRun() {

    if (
        !runActive ||
        runPaused
    ) {

        return;

    }


    runPaused =
        true;


    pauseStartedAt =
        Date.now();


    stopGPS();

    stopTimer();

    updateButtons();


    gpsStatusElement.textContent =
        "Paused";


    gpsMessageElement.textContent =
        "Your run is paused.";

}


// ================= FINISH =================

function finishRun() {

    if (!runActive) {

        return;

    }


    stopGPS();

    stopTimer();


    const finalDistance =
        totalDistance / 1000;


    const finalTime =
        startTime
            ? (
                Date.now() -
                startTime -
                pausedDuration
            ) / 1000
            : 0;


    const savedRun = {

        date:
            new Date().toISOString(),

        distance:
            Number(
                finalDistance.toFixed(2)
            ),

        time:
            Math.floor(finalTime),

        speed:
            Number(
                currentSpeed.toFixed(1)
            ),

        calories:
            Math.round(
                Number(
                    runCaloriesElement?.textContent || 0
                )
            )

    };


    const existingRuns =
        JSON.parse(
            localStorage.getItem(
                "runovaRuns"
            ) || "[]"
        );


    existingRuns.push(
        savedRun
    );


    localStorage.setItem(
        "runovaRuns",
        JSON.stringify(
            existingRuns
        )
    );


    runActive =
        false;


    runPaused =
        false;


    updateButtons();


    gpsStatusElement.textContent =
        "Run Finished";


    gpsMessageElement.textContent =
        "Your run has been saved.";


    alert(
        "Run finished and saved successfully!"
    );

}


// ================= BUTTONS =================

function updateButtons() {

    if (!startRunButton) {

        return;

    }


    if (!runActive) {

        startRunButton.disabled =
            false;

        startRunButton.textContent =
            "Start Run";

    }

    else if (runPaused) {

        startRunButton.disabled =
            false;

        startRunButton.textContent =
            "Resume";

    }

    else {

        startRunButton.disabled =
            true;

        startRunButton.textContent =
            "Running...";

    }


    if (pauseRunButton) {

        pauseRunButton.disabled =
            !runActive ||
            runPaused;

    }


    if (stopRunButton) {

        stopRunButton.disabled =
            !runActive;

    }

}


// ================= MAP =================

if (runMapElement) {

    initializeRunMap();

}


// ================= BUTTON EVENTS =================

if (startRunButton) {

    startRunButton.addEventListener(
        "click",
        startRun
    );

}


if (pauseRunButton) {

    pauseRunButton.addEventListener(
        "click",
        pauseRun
    );

}


if (stopRunButton) {

    stopRunButton.addEventListener(
        "click",
        finishRun
    );

}


// ================= INITIAL STATE =================

updateButtons();